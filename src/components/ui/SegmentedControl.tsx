"use client";

import React from "react";

export interface SegmentedOption<T extends string> {
  value: T;
  label: React.ReactNode;
  sublabel?: string;
}

export interface SegmentedControlProps<T extends string> {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
  columns?: number;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  className = "",
  columns,
}: SegmentedControlProps<T>) {
  const gridStyle = columns ? { gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` } : undefined;

  return (
    <div
      style={gridStyle}
      className={`p-1 bg-zinc-950/60 border border-zinc-800/90 rounded-2xl ${
        columns ? "grid gap-1" : "flex gap-1"
      } ${className}`}
    >
      {options.map((opt) => {
        const isSelected = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`flex-1 py-1.5 px-2 rounded-xl text-center transition-all cursor-pointer select-none text-xs font-semibold ${
              isSelected
                ? "bg-zinc-800 text-white shadow-md border border-zinc-700/80"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50"
            }`}
          >
            <div>{opt.label}</div>
            {opt.sublabel && (
              <span className="block text-[9px] font-normal text-zinc-500 mt-0.5">
                {opt.sublabel}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
