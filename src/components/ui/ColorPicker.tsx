"use client";

import React, { useRef } from "react";

export interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

export function ColorPicker({ label, value, onChange }: ColorPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const triggerPicker = () => {
    inputRef.current?.click();
  };

  return (
    <div
      onClick={triggerPicker}
      className="flex items-center gap-2.5 bg-zinc-800/40 hover:bg-zinc-800/70 p-2 rounded-xl border border-zinc-700/60 hover:border-zinc-600 transition-colors cursor-pointer select-none"
    >
      <div className="relative">
        <span
          className="block w-7 h-7 rounded-lg border border-white/20 shadow-inner flex-shrink-0"
          style={{ backgroundColor: value }}
        />
        <input
          ref={inputRef}
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 opacity-0 pointer-events-none w-0 h-0"
        />
      </div>

      <div className="flex-1 min-w-0">
        <span className="block text-[10px] text-zinc-400 font-medium leading-tight">
          {label}
        </span>
        <span className="font-mono text-zinc-200 text-xs font-semibold uppercase">
          {value}
        </span>
      </div>
    </div>
  );
}
