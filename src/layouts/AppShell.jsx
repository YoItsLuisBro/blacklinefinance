import React from "react";
import { Link, Outlet } from "react-router";
import { Button } from "../components/ui/Button";
import { useAuth } from "../auth/AuthProvider";
import { CreditCard, LogOut } from "lucide-react";

export function AppShell() {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-full">
      <header className="sticky top-0 z-10 border-b border-white/8 bg-black/20 backdrop-blur">
        <Link to="/app" className="flex items-center gap-2">
          <span className="grid size-9 place-items-center rounded-xl bg-white/8 border border-whit/10">
            <CreditCard size={18} />
          </span>
          <div className="leading-tight">
            <div className="text-sm font-semibold">Blackline Finance</div>
            <div className="text-[11px] text-white/50">
              Minimal. Dark. Clean.
            </div>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-xs text-white/55">
            {user?.email ?? ""}
          </div>
          <Button variant="ghost" onClick={signOut}>
            <LogOut size={16} />
            Sign Out
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
