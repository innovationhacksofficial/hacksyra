"use client";

import Link from "next/link";
import { forwardRef, type ReactNode } from "react";
import { Loader2 } from "lucide-react";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger" | "aqua";
type Size = "sm" | "md" | "lg" | "icon";

const VARIANT: Record<Variant, string> = {
  primary: "bg-[#1565D8] text-white hover:bg-[#0F52B0] shadow-sm hover:shadow-brand focus-visible:ring-[#1565D8]",
  secondary: "bg-white border border-slate-200 text-slate-800 hover:bg-slate-50 hover:border-slate-300 shadow-xs focus-visible:ring-slate-400",
  outline: "border-2 border-[#1565D8] text-[#1565D8] bg-transparent hover:bg-[#EEF4FF] focus-visible:ring-[#1565D8]",
  ghost: "text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus-visible:ring-slate-400",
  danger: "bg-red-600 text-white hover:bg-red-700 shadow-sm focus-visible:ring-red-600",
  aqua: "bg-[#0284C7] text-white hover:bg-[#0369A1] shadow-sm focus-visible:ring-[#0284C7]",
};

const SIZE: Record<Size, string> = {
  sm: "px-3.5 py-1.5 text-xs rounded-lg min-h-[34px]",
  md: "px-5 py-2.5 text-sm rounded-xl min-h-[42px]",
  lg: "px-7 py-3.5 text-base rounded-2xl min-h-[48px]",
  icon: "w-10 h-10 p-0 rounded-xl",
};

const BASE =
  "inline-flex items-center justify-center gap-2 font-semibold transition-all duration-150 select-none cursor-pointer " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.98] " +
  "disabled:opacity-50 disabled:pointer-events-none";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  href?: string;
  target?: string;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", loading, leftIcon, rightIcon, href, target, className = "", children, disabled, type = "button", ...rest },
  ref
) {
  const cls = `${BASE} ${VARIANT[variant]} ${SIZE[size]} ${className}`;
  const inner = (
    <>
      {loading ? <Loader2 size={16} className="animate-spin shrink-0" /> : leftIcon}
      {children}
      {!loading && rightIcon}
    </>
  );

  if (href && !disabled && !loading) {
    return (
      <Link href={href} target={target} className={cls}>
        {inner}
      </Link>
    );
  }
  return (
    <button ref={ref} type={type} disabled={disabled || loading} className={cls} {...rest}>
      {inner}
    </button>
  );
});

