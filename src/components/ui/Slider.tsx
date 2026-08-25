"use client";

import React from "react";

export interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (val: number) => void;
  formatValue?: (val: number) => string;
}

export function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  unit = "",
  onChange,
  formatValue,
}: SliderProps) {
  const displayVal = formatValue ? formatValue(value) : `${value}${unit ? ` ${unit}` : ""}`;

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center text-xs">
        <label className="text-zinc-300 font-semibold">{label}</label>
        <span className="font-mono text-emerald-400 font-bold bg-zinc-950/60 px-2 py-0.5 rounded-lg border border-zinc-800 text-[11px]">
          {displayVal}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={Math.max(min, max)}
        step={step}
        value={Math.min(Math.max(value, min), Math.max(min, max))}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
      />
      <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
      </div>
    </div>
  );
}
