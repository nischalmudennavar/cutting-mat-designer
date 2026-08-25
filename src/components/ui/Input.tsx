"use client";

import React, { InputHTMLAttributes, forwardRef } from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, helperText, className = "", ...props }, ref) => {
    return (
      <div className="space-y-1">
        {label && (
          <label className="block text-[11px] font-semibold text-zinc-400">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`w-full py-1.5 px-3 bg-zinc-800/80 border border-zinc-700/80 rounded-xl focus:border-emerald-500 focus:outline-none text-zinc-100 placeholder-zinc-500 text-xs transition-colors ${className}`}
          {...props}
        />
        {helperText && (
          <p className="text-[10px] text-zinc-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
