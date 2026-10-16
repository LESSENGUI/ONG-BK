import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-bold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bk-ciel)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-[var(--bk-ciel)] text-white shadow-[0_12px_30px_rgba(25,167,230,0.28)] hover:-translate-y-0.5 hover:bg-[var(--bk-bleu-clair)]",
        forest: "bg-[var(--bk-marine)] text-white shadow-[0_12px_30px_rgba(11,90,155,0.26)] hover:-translate-y-0.5 hover:bg-[var(--bk-marine)]/90",
        outline:
          "border border-[var(--bk-marine)]/25 bg-white/80 text-[var(--bk-marine)] hover:border-[var(--bk-ciel)] hover:bg-[rgba(25,167,230,0.06)]",
        ghost: "text-[var(--bk-texte)] hover:bg-[rgba(59,74,90,0.05)]",
      },
      size: {
        default: "min-h-12 px-6 py-3",
        sm: "min-h-10 px-5 py-2.5 text-xs",
        lg: "min-h-14 px-8 py-4 text-base",
        icon: "size-11 p-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}
