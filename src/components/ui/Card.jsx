import React from "react";
import { twMerge } from "tailwind-merge";
import clsx from "clsx";

export function Card({ className, ...props }) {
  return (
    <div className={twMerge(clsx("glass rounded-2xl", className))} {...props} />
  );
}
