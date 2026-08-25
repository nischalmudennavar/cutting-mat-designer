"use client";

import React, { ReactNode } from "react";

interface CanvasProps {
  children: ReactNode;
  zoom: number;
  x: number;
  y: number;
  containerRef: React.RefObject<HTMLDivElement | null>;
  onMouseDown: (e: React.MouseEvent) => void;
  onMouseMove: (e: React.MouseEvent) => void;
  onMouseUp: () => void;
  onMouseLeave: () => void;
  onWheel: (e: React.WheelEvent) => void;
  isDragging: boolean;
}

export function Canvas({
  children,
  zoom,
  x,
  y,
  containerRef,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  onMouseLeave,
  onWheel,
  isDragging,
}: CanvasProps) {
  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden dotted-bg select-none ${
        isDragging ? "cursor-grabbing" : "cursor-grab"
      }`}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseLeave}
      onWheel={onWheel}
    >
      {/* Hardware-accelerated Transformation Container */}
      <div
        style={{
          transform: `translate3d(${x}px, ${y}px, 0) scale(${zoom})`,
          transformOrigin: "0 0",
          willChange: isDragging ? "transform" : "auto",
        }}
        className="absolute top-0 left-0"
      >
        {children}
      </div>
    </div>
  );
}
