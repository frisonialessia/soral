import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-[9px] text-body font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        default: "border border-line-2 text-ink-1 hover:bg-surface-2",
        primary: "bg-risk-sol border border-risk-sol text-white hover:bg-[#4a5de0]",
        ghost: "text-ink-1 hover:bg-surface-2",
      },
      size: {
        default: "px-[18px] py-[9px]",
        sm: "px-[14px] py-[7px] text-copy",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
  )
);
Button.displayName = "Button";
