import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../auth/AuthProvider";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { formatCents } from "../lib/money";
import { startOfMonth, endOfMonth, format } from "date-fns";
import { Link } from "react-router";

function MonthPicker({ value, onChange }) {
  return (
    <Input
      type="month"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="max-w-[180px]"
    />
  );
}

export function Transactions() {
  const { user } = useAuth();
  const [month, setMonth] = useState(() => format(new Date(), "yyyy-MM"));
  const [q, setQ] = useState("");
  const [rows, setRows] = useState([]);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState("");

  const range = useMemo(() => {
    const [y, m] = month.split("-").map(Number);
    const base = new Date(y, m - 1, 1);
    const from = format(startOfMonth(base), "yyyy-MM-dd");
    const to = format(endOfMonth(base), "yyyy-MM-dd");
    return { from, to };
  }, [month]);

  useEffect(() => {
    let alive = true;

    async function load() {
      if (!user?.id) return;
      setBusy(true);
      setError("");

      let query = supabase
        .from("transactions")
        .select(
          "id, occurred_on, description, merchant, amount_cents, currency_code"
        )
        .eq("user_id", user.id)
        .gte("occurred_on", range.from)
        .lte("occurred_on", range.to)
        .order("occurred_on", { ascending: false })
        .limit(500);

      // Simple search on description (Postgres ILIKE)
      if (q.trim()) query = query.ilike("description", `%${q.trim()}%`);

      const { data, error: err } = await query;

      if (!alive) return;
      setBusy(false);

      if (err) return setError(err.message);
      setRows(data ?? []);
    }

    load();
    return () => {
      alive = false;
    };
  }, [user?.id, range.from, range.to, q]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-lg font-semibold">Transactions</div>
          <div className="text-sm text-white/55">
            Filter by month, search descriptions, and import new statements.
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <MonthPicker value={month} onChange={setMonth} />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search…"
            className="min-w-[220px]"
          />
        </div>
      </div>

      {error ? (
        <Card className="p-4 border border-red-400/20 bg-red-500/10">
          <div className="text-sm">{error}</div>
        </Card>
      ) : null}

      {busy ? (
        <Card className="p-6">
          <div className="text-sm text-white/60">Loading…</div>
        </Card>
      ) : rows.length === 0 ? (
        <Card className="p-6">
          <div className="text-sm text-white/60">
            No transactions for this month yet.{" "}
            <Link className="text-white hover:underline" to="/app/import">
              Import a CSV
            </Link>
            .
          </div>
        </Card>
      ) : (
        <Card className="p-2">
          <div className="divide-y divide-white/6">
            {rows.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between gap-4 px-3 py-3"
              >
                <div className="min-w-0">
                  <div className="text-xs text-white/55">{r.occurred_on}</div>
                  <div className="truncate text-sm">
                    {r.merchant?.trim() ? r.merchant : r.description}
                  </div>
                </div>

                <div
                  className={[
                    "shrink-0 text-sm tabular-nums",
                    r.amount_cents < 0
                      ? "text-white/85"
                      : "text-emerald-300/90",
                  ].join(" ")}
                >
                  {formatCents(r.amount_cents, r.currency_code || "USD")}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
