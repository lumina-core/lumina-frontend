import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Logo({ size = "md", className }: LogoProps) {
  const sizes = {
    sm: "text-xl",
    md: "text-2xl",
    lg: "text-3xl",
  };

  return (
    <div className={cn("flex items-center gap-2 font-semibold", sizes[size], className)}>
      <span className="text-brand-primary">◆</span>
      <span className="text-text-primary">Lumina</span>
    </div>
  );
}
