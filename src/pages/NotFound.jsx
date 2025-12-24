import React from "react";
import { Link } from "react-router";

export function NotFound() {
  return (
    <div className="min-h-[60vh] grid place-items-center text-center">
      <div>
        <div className="text-2xl font-semibold">404</div>
        <div className="mt-2 text-sm text-white/60">
          That page doesn't exist.
        </div>
        <Link
          className="mt-4 inline-block text-white/80 hover:underline"
          to="/app"
        >
          Go to dashboard
        </Link>
      </div>
    </div>
  );
}
