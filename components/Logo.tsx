import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  href?: string;
}

export function Logo({ size = "md", className, href = "/" }: LogoProps) {
  const sizes = {
    sm: "text-xl",
    md: "text-2xl",
    lg: "text-3xl",
  };

  return (
    <Link href={href} className={cn("flex items-center gap-2 font-semibold hover:opacity-80 transition-opacity", sizes[size], className)}>
      <span className="text-brand-primary">◆</span>
      <span className="text-text-primary">Lumina</span>
    </Link>
  );
}
