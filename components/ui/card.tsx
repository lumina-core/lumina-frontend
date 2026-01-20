import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type CardProps = HTMLAttributes<HTMLDivElement>;

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "bg-bg-secondary border border-border-default rounded-2xl p-6 transition-all duration-200",
          "hover:border-border-hover",
          className
        )}
        {...props}
      />
    );
  }
);

Card.displayName = "Card";
