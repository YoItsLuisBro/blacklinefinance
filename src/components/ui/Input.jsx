import React from "react";
import { twMerge } from "tailwind-merge";
import clsx from "clsx";

export function Input({ className, ...props }) {
  return (
    <input
      className={twMerge(
        "w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm" +
          "placeholder:text-white/35 outline-none focus:ring-2 focus:ring-cyan-400/35",
        className
      )}
      {...props}
    />
  );
}
