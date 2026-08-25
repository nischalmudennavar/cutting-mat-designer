"use client";

import React, { ButtonHTMLAttributes, forwardRef } from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "outline" | "danger";
  size?: "sm" | "md" | "lg" | "icon";
  children?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "secondary", size = "md", className = "", children, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center font-semibold rounded-xl transition-all cursor-pointer select-none focus:outline-none focus:ring-2 focus:ring-emerald-500/50 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]";

    const sizeStyles = {
      sm: "text-xs px-2.5 py-1.5 gap-1.5",
      md: "text-xs px-3.5 py-2 gap-2",
      lg: "text-sm px-4 py-2.5 gap-2.5",
      icon: "p-2 aspect-square",
    }[size];

    const variantStyles = {
      primary:
        "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/30 border border-emerald-500/30",
      secondary:
        "bg-zinc-800/80 hover:bg-zinc-750 text-zinc-100 border border-zinc-700/80 shadow-sm",
      ghost: "hover:bg-zinc-800/60 text-zinc-400 hover:text-zinc-100",
      outline:
        "bg-transparent hover:bg-zinc-800/40 text-zinc-200 border border-zinc-700 hover:border-zinc-600",
      danger:
        "bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40",
    }[variant];

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${sizeStyles} ${variantStyles} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
