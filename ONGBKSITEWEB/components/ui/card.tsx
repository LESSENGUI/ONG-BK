"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export function Card({
  className,
  onPointerLeave,
  onPointerMove,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    onPointerMove?.(event);
    if (event.pointerType !== "mouse") return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const horizontal = (event.clientX - bounds.left) / bounds.width;
    const vertical = (event.clientY - bounds.top) / bounds.height;
    event.currentTarget.style.setProperty("--card-spot-x", `${horizontal * 100}%`);
    event.currentTarget.style.setProperty("--card-spot-y", `${vertical * 100}%`);
    event.currentTarget.style.setProperty("--card-rotate-x", `${((0.5 - vertical) * 4).toFixed(2)}deg`);
    event.currentTarget.style.setProperty("--card-rotate-y", `${((horizontal - 0.5) * 4).toFixed(2)}deg`);
  };

  const handlePointerLeave = (event: React.PointerEvent<HTMLDivElement>) => {
    event.currentTarget.style.setProperty("--card-spot-x", "50%");
    event.currentTarget.style.setProperty("--card-spot-y", "50%");
    event.currentTarget.style.setProperty("--card-rotate-x", "0deg");
    event.currentTarget.style.setProperty("--card-rotate-y", "0deg");
    onPointerLeave?.(event);
  };

  return (
    <div
      className={cn(
        "brand-card rounded-[28px] border border-[rgba(59,74,90,0.09)] bg-white/95 shadow-[0_18px_42px_rgba(11,90,155,0.08)]",
        className,
      )}
      data-reveal
      onPointerLeave={handlePointerLeave}
      onPointerMove={handlePointerMove}
      {...props}
    />
  );
}
