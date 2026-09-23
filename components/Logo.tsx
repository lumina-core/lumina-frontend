import Link from "next/link";
import { cn } from "@/lib/utils";

interface BrandMarkProps {
  size?: number;
  className?: string;
}

/**
 * Shared Loupe-style mark: a lens with an aperture at the upper right.
 * It stays neutral enough to sit above individual product names.
 */
export function BrandMark({ size = 22, className }: BrandMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden="true"
      className={cn("block shrink-0", className)}
    >
      <path
        d="M 32.70 11.11 A 15.5 15.5 0 1 1 28.89 7.30"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <circle cx="20" cy="20" r="9.61" fill="currentColor" />
    </svg>
  );
}

interface LogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  href?: string;
}

export function Logo({ size = "md", className, href = "/" }: LogoProps) {
  const sizes = {
    sm: { mark: 22, text: "text-[19px]" },
    md: { mark: 26, text: "text-[23px]" },
    lg: { mark: 32, text: "text-[29px]" },
  }[size];

  return (
    <Link
      href={href}
      aria-label="Lumina"
      className={cn(
        "inline-flex items-center gap-2.5 font-medium tracking-[-0.035em] text-text-primary transition-opacity hover:opacity-80",
        sizes.text,
        className,
      )}
    >
      <BrandMark size={sizes.mark} className="text-brand-primary" />
      <span>Lumina</span>
    </Link>
  );
}
