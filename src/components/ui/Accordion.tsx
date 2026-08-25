"use client";

import React from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

export interface AccordionProps {
  id: string;
  title: string;
  icon?: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

export function Accordion({
  title,
  icon,
  isOpen,
  onToggle,
  children,
}: AccordionProps) {
  return (
    <div className="border-b border-zinc-800 last:border-b-0">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between py-3 px-4 text-left font-semibold text-xs tracking-wide text-zinc-200 hover:bg-zinc-800/60 transition-colors cursor-pointer select-none"
      >
        <div className="flex items-center gap-2.5">
          {icon}
          <span>{title}</span>
        </div>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-zinc-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-zinc-400" />
        )}
      </button>
      {isOpen && <div className="p-4 space-y-4 text-xs">{children}</div>}
    </div>
  );
}
