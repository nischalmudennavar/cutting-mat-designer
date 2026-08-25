"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

export interface DropdownOption<T extends string | number> {
  value: T;
  label: string;
  sublabel?: string;
}

export interface DropdownProps<T extends string | number> {
  label?: string;
  value: T;
  options: DropdownOption<T>[];
  onChange: (value: T) => void;
  className?: string;
}

export function Dropdown<T extends string | number>({
  label,
  value,
  options,
  onChange,
  className = "",
}: DropdownProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value) || options[0];

  useEffect(() => {
    const handleClickOutside = (e: globalThis.MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className={`relative space-y-1 ${className}`}>
      {label && (
        <label className="block text-[11px] font-semibold text-zinc-400">
          {label}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full py-2 px-3 bg-zinc-800/80 hover:bg-zinc-800 border border-zinc-700/80 rounded-xl flex items-center justify-between text-left transition-all cursor-pointer select-none focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${
          isOpen ? "border-emerald-500 ring-2 ring-emerald-500/30" : ""
        }`}
      >
        <span className="text-xs font-medium text-zinc-100 truncate">
          {selectedOption?.label}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-emerald-400" : ""
          }`}
        />
      </button>

      {/* Floating Popover Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1.5 z-50 py-1 bg-zinc-900/95 backdrop-blur-2xl border border-zinc-700 shadow-2xl rounded-2xl max-h-56 overflow-y-auto divide-y divide-zinc-800/50">
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={String(opt.value)}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`w-full py-2 px-3 flex items-center justify-between text-left text-xs transition-colors cursor-pointer select-none ${
                  isSelected
                    ? "bg-emerald-600/15 text-emerald-300 font-semibold"
                    : "text-zinc-300 hover:bg-zinc-800/60 hover:text-white"
                }`}
              >
                <div>
                  <span>{opt.label}</span>
                  {opt.sublabel && (
                    <span className="block text-[10px] text-zinc-500 font-normal">
                      {opt.sublabel}
                    </span>
                  )}
                </div>
                {isSelected && (
                  <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
