import React, { useEffect, useState } from "react";
import { Link, NavLink, Outlet } from "react-router";
import { Button } from "../components/ui/Button";
import { useAuth } from "../auth/AuthProvider";
import { CreditCard, LogOut, Upload, List } from "lucide-react";
import { ensureDefaultCategories } from "../lib/seedDefaults";

function NavItem({ to, icon, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm border transition",
          isActive
            ? "bg-white/10 border-white/15"
            : "bg-transparent border-white/10 hover:bg-white/6",
        ].join(" ")
      }
    >
      {icon}
      {children}
    </NavLink>
  );
}

export function AppShell() {
  const { user, signOut } = useAuth();
  const [seeded, setSeeded] = useState(false);

  useEffect(() => {
    let alive = true;

    async function run() {
      if (!user?.id || seeded) return;
      try {
        await ensureDefaultCategories(user.id);
        if (alive) setSeeded(true);
      } catch (e) {
        // Don’t block the UI if seeding fails; you can retry later
        console.error(e);
        if (alive) setSeeded(true);
      }
    }

    run();
    return () => {
      alive = false;
    };
  }, [user?.id, seeded]);

  return (
    <div className="min-h-full">
      <header className="sticky top-0 z-10 border-b border-white/8 bg-black/20 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link to="/app" className="flex items-center gap-2">
            <span className="grid size-9 place-items-center rounded-xl bg-white/8 border border-white/10">
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
              Sign out
            </Button>
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-4 pb-3">
          <div className="flex flex-wrap gap-2">
            <NavItem to="/app/transactions" icon={<List size={16} />}>
              Transactions
            </NavItem>
            <NavItem to="/app/import" icon={<Upload size={16} />}>
              Import CSV
            </NavItem>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
