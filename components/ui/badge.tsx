import * as React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  color?: string;
}

export function Badge({ className, color, style, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-block rounded-md px-2.5 py-1 text-meta font-semibold",
        className
      )}
      style={{
        ...(color ? { background: `${color}22`, color } : {}),
        ...style,
      }}
      {...props}
    />
  );
}
