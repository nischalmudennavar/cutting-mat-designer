"use client";

import { useState, useCallback, useRef, MouseEvent, WheelEvent } from "react";

interface PanZoomState {
  x: number;
  y: number;
  zoom: number;
}

export function usePanZoom(initialZoom = 0.8, initialX = 100, initialY = 50) {
  const [state, setState] = useState<PanZoomState>({
    x: initialX,
    y: initialY,
    zoom: initialZoom,
  });

  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const rafId = useRef<number | null>(null);
  const pendingPos = useRef<{ x: number; y: number } | null>(null);

  const handleMouseDown = useCallback((e: MouseEvent) => {
    // Only left or middle mouse button
    if (e.button !== 0 && e.button !== 1) return;

    // Ignore clicks on floating UI panels
    const target = e.target as HTMLElement;
    if (target.closest(".interactive-ui")) return;

    isDragging.current = true;
    dragStart.current = { x: e.clientX - state.x, y: e.clientY - state.y };
    e.preventDefault();
  }, [state.x, state.y]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging.current) return;

    const nextX = e.clientX - dragStart.current.x;
    const nextY = e.clientY - dragStart.current.y;
    pendingPos.current = { x: nextX, y: nextY };

    if (rafId.current === null) {
      rafId.current = requestAnimationFrame(() => {
        if (pendingPos.current) {
          setState((prev) => ({
            ...prev,
            x: pendingPos.current!.x,
            y: pendingPos.current!.y,
          }));
        }
        rafId.current = null;
      });
    }
  }, []);

  const handleMouseUpOrLeave = useCallback(() => {
    isDragging.current = false;
    if (rafId.current !== null) {
      cancelAnimationFrame(rafId.current);
      rafId.current = null;
    }
  }, []);

  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const zoomIntensity = 0.12;
    const delta = -e.deltaY;
    const zoomFactor = delta > 0 ? (1 + zoomIntensity) : (1 - zoomIntensity);

    setState((prev) => {
      const nextZoom = Math.min(Math.max(prev.zoom * zoomFactor, 0.15), 8);
      const nextX = mouseX - (mouseX - prev.x) * (nextZoom / prev.zoom);
      const nextY = mouseY - (mouseY - prev.y) * (nextZoom / prev.zoom);

      return {
        x: nextX,
        y: nextY,
        zoom: nextZoom,
      };
    });
  }, []);

  const reset = useCallback((zoom = 0.8, x = 100, y = 50) => {
    setState({ x, y, zoom });
  }, []);

  const centerOn = useCallback((matWidthPx: number, matHeightPx: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const containerW = rect.width;
    const containerH = rect.height;

    const padding = 80;
    const zoomW = (containerW - padding) / matWidthPx;
    const zoomH = (containerH - padding) / matHeightPx;
    const nextZoom = Math.min(Math.max(Math.min(zoomW, zoomH), 0.2), 3);

    const nextX = (containerW - matWidthPx * nextZoom) / 2;
    const nextY = (containerH - matHeightPx * nextZoom) / 2;

    setState({
      x: nextX,
      y: nextY,
      zoom: nextZoom,
    });
  }, []);

  return {
    x: state.x,
    y: state.y,
    zoom: state.zoom,
    containerRef,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp: handleMouseUpOrLeave,
    handleMouseLeave: handleMouseUpOrLeave,
    handleWheel,
    reset,
    centerOn,
    isDragging: isDragging.current,
  };
}
