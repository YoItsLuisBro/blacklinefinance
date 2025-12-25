import React, { useMemo, useState } from "react";
import Papa from "papaparse";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../auth/AuthProvider";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { parseMoneyToCents } from "../lib/money";
import { parseDateSmart, toISODateOnly } from "../lib/date";
import { makeFingerprint } from "../lib/fingerprint";
import { chunkArray } from "../lib/chunk";
import { useNavigate } from "react-router";

function Select({ value, onChange, options, placeholder }) {
  return (
    <select
      className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-cyan-400/35"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}

export function ImportCSV() {
  const { user } = useAuth();
  const nav = useNavigate();

  const [file, setFile] = useState(null);
  const [fields, setFields] = useState([]);
  const [rows, setRows] = useState([]);

  const [dateField, setDateField] = useState("");
  const [descField, setDescField] = useState("");
  const [amountField, setAmountField] = useState("");

  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  const preview = useMemo(() => rows.slice(0, 12), [rows]);

  function guessMapping(cols) {
    const lc = cols.map((c) => [c, c.toLowerCase()]);
    const pick = (preds) => {
      const hit = lc.find(([, l]) => preds.some((p) => l.includes(p)));
      return hit?.[0] ?? "";
    };

    setDateField((v) => v || pick(["date", "transaction date", "posted date"]));
    setDescField((v) => v || pick(["description", "name", "memo", "merchant"]));
    setAmountField((v) => v || pick(["amount", "amt", "value"]));
  }

  async function onPickFile(f) {
    setError("");
    setStatus("");
    setFile(f);
    setFields([]);
    setRows([]);
    setDateField("");
    setDescField("");
    setAmountField("");

    if (!f) return;

    Papa.parse(f, {
      header: true,
      skipEmptyLines: "greedy",
      transformHeader: (h) => String(h ?? "").trim(),
      complete: (results) => {
        const cols = results.meta?.fields ?? [];
        const data = Array.isArray(results.data) ? results.data : [];
        if (!cols.length) {
          setError(
            "Could not detect CSV headers. Please export a CSV with header columns."
          );
          return;
        }
        setFields(cols);
        setRows(data);
        guessMapping(cols);
      },
      error: (err) => setError(err.message || "Failed to parse CSV"),
    });
  }

  const canPreview = Boolean(
    fields.length && dateField && descField && amountField
  );

  const prepared = useMemo(() => {
    if (!canPreview || !user?.id) return [];

    const out = [];
    for (const r of rows) {
      const d = parseDateSmart(r[dateField]);
      const occurred_on = toISODateOnly(d);
      if (!occurred_on) continue;

      const description = String(r[descField] ?? "").trim();
      if (!description) continue;

      const amount_cents = parseMoneyToCents(r[amountField]);
      if (!Number.isFinite(amount_cents)) continue;

      const fingerprint = makeFingerprint({
        occurred_on,
        description,
        amount_cents,
      });

      out.push({
        user_id: user.id,
        occurred_on,
        description,
        amount_cents,
        currency_code: "USD",
        fingerprint,
      });
    }

    return out;
  }, [canPreview, user?.id, rows, dateField, descField, amountField]);

  async function doImport() {
    if (!user?.id) return;
    if (!prepared.length) return;

    setBusy(true);
    setError("");
    setStatus("Creating import record…");

    // 1) create imports row
    const { data: importRows, error: importErr } = await supabase
      .from("imports")
      .insert({
        user_id: user.id,
        source: file?.name ?? "CSV Import",
        status: "parsing",
        started_at: new Date().toISOString(),
        row_count: prepared.length,
      })
      .select("id")
      .single();

    if (importErr) {
      setBusy(false);
      setError(importErr.message);
      return;
    }

    const importId = importRows.id;

    // 2) attach import_id + upsert in chunks
    const payload = prepared.map((t) => ({ ...t, import_id: importId }));

    try {
      const batches = chunkArray(payload, 500);

      for (let i = 0; i < batches.length; i++) {
        setStatus(`Uploading transactions… (${i + 1}/${batches.length})`);

        const { error: upErr } = await supabase
          .from("transactions")
          .upsert(batches[i], { onConflict: "user_id,fingerprint" });

        if (upErr) throw upErr;
      }

      setStatus("Finalizing import…");

      await supabase
        .from("imports")
        .update({
          status: "done",
          finished_at: new Date().toISOString(),
        })
        .eq("id", importId)
        .eq("user_id", user.id);

      setBusy(false);
      nav("/app/transactions", { replace: true });
    } catch (e) {
      const msg = e?.message || "Import failed";

      await supabase
        .from("imports")
        .update({
          status: "failed",
          error: msg,
          finished_at: new Date().toISOString(),
        })
        .eq("id", importId)
        .eq("user_id", user.id);

      setBusy(false);
      setError(msg);
      setStatus("");
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <div className="text-lg font-semibold">Import CSV</div>
        <div className="text-sm text-white/55">
          Upload a bank statement CSV and map columns to import transactions.
        </div>
      </div>

      <Card className="p-5 space-y-4">
        <div className="space-y-2">
          <div className="text-xs text-white/60">CSV File</div>
          <Input
            type="file"
            accept=".csv,text/csv"
            onChange={(e) => onPickFile(e.target.files?.[0] ?? null)}
          />
          <div className="text-xs text-white/45">
            V1 supports CSV with headers (Date, Description, Amount).
          </div>
        </div>

        {fields.length ? (
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <div className="text-xs text-white/60 mb-1">Date column</div>
              <Select
                value={dateField}
                onChange={setDateField}
                options={fields}
                placeholder="Select date…"
              />
            </div>

            <div>
              <div className="text-xs text-white/60 mb-1">
                Description column
              </div>
              <Select
                value={descField}
                onChange={setDescField}
                options={fields}
                placeholder="Select description…"
              />
            </div>

            <div>
              <div className="text-xs text-white/60 mb-1">Amount column</div>
              <Select
                value={amountField}
                onChange={setAmountField}
                options={fields}
                placeholder="Select amount…"
              />
            </div>
          </div>
        ) : null}

        {error ? (
          <div className="rounded-xl border border-red-400/20 bg-red-500/10 px-3 py-2 text-sm">
            {error}
          </div>
        ) : null}

        {status ? (
          <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/70">
            {status}
          </div>
        ) : null}

        <div className="flex flex-wrap gap-2">
          <Button disabled={!canPreview || busy} onClick={doImport}>
            {busy
              ? "Importing…"
              : `Import ${prepared.length.toLocaleString()} transactions`}
          </Button>
          <Button
            variant="ghost"
            disabled={busy}
            onClick={() => nav("/app/transactions")}
          >
            Back to transactions
          </Button>
        </div>
      </Card>

      {canPreview ? (
        <Card className="p-2">
          <div className="px-3 py-3 text-sm font-medium">Preview</div>
          <div className="divide-y divide-white/6">
            {preview.map((r, idx) => (
              <div key={idx} className="px-3 py-3">
                <div className="text-xs text-white/55">
                  {String(r[dateField] ?? "")}
                </div>
                <div className="text-sm">{String(r[descField] ?? "")}</div>
                <div className="text-sm text-white/70">
                  {String(r[amountField] ?? "")}
                </div>
              </div>
            ))}
          </div>
        </Card>
      ) : null}
    </div>
  );
}
