import React from "react";
import { twMerge } from "tailwind-merge";
import clsx from "clsx";

export function Button({ className, variant = "primary", ...props }) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-medium " +
    "transition focus:outline-none focus:ring-2 focus:ring-cyan-400/40 disabled:opacity-60 disabled:pointer-events-none";

  const variants = {
    primary:
      "bg-white/10 hover:bg-white/14 border border-white/10 shadow-[0_12px_30px_rgba(0,0,0,0.35)]",
    ghost: "bg-transparent hover:bg-white/6 border border-white/10",
    danger: "bg-red-500/15 hover:bg-red-500/20 border border-red-400/20",
  };

  return (
    <button
      className={twMerge(clsx(base, variants[variant], className))}
      {...props}
    />
  );
}
