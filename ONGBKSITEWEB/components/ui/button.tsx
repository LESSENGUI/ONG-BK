import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-bold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-sun text-ink shadow-sm hover:-translate-y-0.5 hover:bg-[#f2c95e]",
        forest: "bg-forest text-white shadow-sm hover:-translate-y-0.5 hover:bg-[#104b3c]",
        outline:
          "border border-forest/30 bg-white/70 text-forest hover:border-forest hover:bg-white",
        ghost: "text-ink hover:bg-ink/5",
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
