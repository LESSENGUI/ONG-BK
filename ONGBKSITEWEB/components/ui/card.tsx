import * as React from "react";
import { cn } from "@/lib/utils";

export function Card({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "brand-card rounded-[28px] border border-[rgba(59,74,90,0.09)] bg-white/95 shadow-[0_18px_42px_rgba(11,90,155,0.08)]",
        className,
      )}
      data-reveal
      {...props}
    />
  );
}
