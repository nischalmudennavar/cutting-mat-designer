"use client";

import React from "react";

export interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
}

export function Switch({
  checked,
  onChange,
  label,
  description,
  disabled = false,
}: SwitchProps) {
  return (
    <div
      onClick={() => !disabled && onChange(!checked)}
      className={`flex items-center justify-between py-1 transition-opacity cursor-pointer select-none ${
        disabled ? "opacity-40 pointer-events-none" : ""
      }`}
    >
      {(label || description) && (
        <div className="pr-3">
          {label && (
            <label className="text-zinc-200 font-medium block text-xs cursor-pointer">
              {label}
            </label>
          )}
          {description && (
            <span className="text-[10px] text-zinc-400 block leading-tight mt-0.5">
              {description}
            </span>
          )}
        </div>
      )}

      {/* Pill Track */}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${
          checked ? "bg-emerald-500 shadow-md shadow-emerald-950/40" : "bg-zinc-700/80"
        }`}
      >
        {/* Thumb Knob */}
        <span
          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
            checked ? "translate-x-4" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}
