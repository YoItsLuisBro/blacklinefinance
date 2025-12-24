import React from "react";
import { Navigate, Outlet } from "react-router";
import { useAuth } from "../auth/AuthProvider";

export function Protected() {
  const { user, booting } = useAuth();

  if (booting) {
    return (
      <div className="min-h-[50vh] grid place-items-center text-sm text-white/60">
        Loading...
      </div>
    );
  }

  if (!user) return <Navigate to="/signin" replace />;

  return <Outlet />;
}
