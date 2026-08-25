"use client";

import React from "react";
import { Plus, Minus } from "lucide-react";

export interface NumberInputProps {
  label?: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: number) => void;
  unit?: string;
}

export function NumberInput({
  label,
  value,
  min = 1,
  max = 10000,
  step = 1,
  onChange,
  unit = "",
}: NumberInputProps) {
  const handleDecrement = () => {
    const nextVal = Math.max(min, Math.round((value - step) * 10) / 10);
    onChange(nextVal);
  };

  const handleIncrement = () => {
    const nextVal = Math.min(max, Math.round((value + step) * 10) / 10);
    onChange(nextVal);
  };

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-[11px] font-semibold text-zinc-400">
          {label}
        </label>
      )}
      <div className="flex items-center bg-zinc-800/80 border border-zinc-700/80 rounded-xl overflow-hidden focus-within:border-emerald-500 transition-colors">
        <button
          type="button"
          onClick={handleDecrement}
          className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-700/60 transition-colors cursor-pointer select-none"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>

        <input
          type="number"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value) || min)}
          className="w-full py-1.5 px-2 bg-transparent text-center text-xs font-semibold text-zinc-100 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />

        {unit && (
          <span className="text-[10px] text-zinc-500 font-mono pr-2 select-none">
            {unit}
          </span>
        )}

        <button
          type="button"
          onClick={handleIncrement}
          className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-700/60 transition-colors cursor-pointer select-none"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
