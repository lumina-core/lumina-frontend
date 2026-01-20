import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, type = "text", ...props }, ref) => {
    return (
      <div className="w-full">
        <input
          ref={ref}
          type={type}
          className={cn(
            "w-full h-12 px-4 bg-bg-tertiary text-text-primary placeholder:text-text-tertiary",
            "rounded-xl border border-transparent transition-all duration-200",
            "focus:outline-none focus:border-brand-primary focus:shadow-[var(--shadow-glow)]",
            error && "border-error",
            className
          )}
          {...props}
        />
        {error && <p className="mt-1.5 text-sm text-error">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
