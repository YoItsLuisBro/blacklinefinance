import React, { useState } from "react";
import { Link, useNavigate } from "react-router";
import { supabase } from "../lib/supabaseClient";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";

export function SignIn() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(false);

    const { error: err } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setBusy(false);
    if (err) return setError(err.message);

    nav("/app", { replace: true });
  }

  return (
    <div className="min-h-[70vh] grid place-items-center">
      <Card className="w-full max-w-md p-6">
        <div className="mb-5">
          <div className="text-lg font-semibold">Sign in</div>
          <div className="text-sm text-white/55">
            Welcome back to Blackline Finance.
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <label className="text-xs text-white/60">Email</label>
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              autoComplete="email"
              placeholder="[email protected]"
              required
            />
          </div>

          <div>
            <label className="text-xs text-white/60">Password</label>
            <Input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              required
            />
          </div>

          {error ? (
            <div className="rounded-xl border border-red-400/20 bg-red-500/10 px-3 py-2 text-sm">
              {error}
            </div>
          ) : null}

          <Button className="w-full" disabled={busy}>
            {busy ? "Signing in..." : "Sign in"}
          </Button>
        </form>

        <div className="mt-4 text-sm text-white/60">
          No account?{" "}
          <Link className="text-white hover:underline" to="/signup">
            Create me
          </Link>
        </div>
      </Card>
    </div>
  );
}
