import * as React from "react";
import { cn } from "@/lib/utils";

export function Card({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-ink/[0.07] bg-white shadow-[0_10px_36px_rgba(23,45,78,0.055)]",
        className,
      )}
      {...props}
    />
  );
}
