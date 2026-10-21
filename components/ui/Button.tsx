import { Loader2 } from "lucide-react";
import type { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "dark";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  block?: boolean;
};

const V = {
  primary: "bg-accent text-on-accent hover:bg-accent-hover",
  secondary: "border border-accent text-accent bg-bg hover:bg-accent-soft",
  ghost: "text-accent hover:bg-accent-soft",
  danger: "border border-danger text-danger bg-bg hover:bg-danger/5",
  dark: "bg-text text-bg hover:opacity-90",
};
const S = { sm: "h-8 px-3 text-xs rounded-sm", md: "h-10 px-4 text-sm rounded-md", lg: "h-13 px-5 text-base rounded-md" };

export function Button({ variant = "primary", size = "md", loading, block, className = "", children, disabled, ...rest }: Props) {
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={`inline-flex items-center justify-center gap-2 font-bold transition-colors disabled:cursor-not-allowed disabled:bg-border disabled:text-faint disabled:border-transparent ${V[variant]} ${S[size]} ${block ? "w-full" : ""} ${className}`}
    >
      {loading && <Loader2 className="animate-spin" size={16} aria-hidden />}
      {children}
    </button>
  );
}
