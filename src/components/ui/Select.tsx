"use client";

import React, { SelectHTMLAttributes, forwardRef } from "react";

export interface SelectOption {
  value: string | number;
  label: string;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options?: SelectOption[];
  children?: React.ReactNode;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, children, className = "", ...props }, ref) => {
    return (
      <div className="space-y-1">
        {label && (
          <label className="block text-[11px] font-semibold text-zinc-400">
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={`w-full py-1.5 px-2.5 bg-zinc-800/80 border border-zinc-700/80 rounded-xl focus:border-emerald-500 focus:outline-none text-zinc-100 text-xs transition-colors cursor-pointer ${className}`}
          {...props}
        >
          {options
            ? options.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-zinc-900 text-zinc-100">
                  {opt.label}
                </option>
              ))
            : children}
        </select>
      </div>
    );
  }
);

Select.displayName = "Select";
