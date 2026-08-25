"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Plus,
  Minus,
  Maximize,
  HelpCircle,
  MousePointer,
  Ruler,
  Smile,
  Compass,
  FileCheck,
  Type,
} from "lucide-react";
import { usePanZoom } from "@/hooks/usePanZoom";
import { Canvas } from "@/components/Canvas";
import { CuttingMat, CuttingMatProps, StickerItem } from "@/components/CuttingMat";
import { Sidebar } from "@/components/Sidebar";
import { Modal } from "@/components/ui/Modal";

export default function Home() {
  // 1. Cutting Mat State
  const [props, setProps] = useState<CuttingMatProps>({
    width: 24,
    height: 18,
    unit: "in",
    borderRadiusMode: "standard",
    gridOpacity: 0.65,
    miniSubdivisions: 8,
    tickMarksOnGrid: true,
    labelBackgrounds: true,
    showProtractor: true,
    protractorRadius: 6,
    protractorPosition: "bottom-center",
    protractorRepeatMode: "single",
    showDiagonals: true,
    showBranding: true,
    brandingText: "Craftsman Studio",
    brandingFont: "technical-mono",
    brandingSize: 1.0,
    brandingPosition: "bottom-right",
    brandingOpacity: 0.5,
    matColor: "#0f5132",
    gridColor: "#f5d061",
  });

  // 2. Stickers State
  const [stickers, setStickers] = useState<StickerItem[]>([]);
  const [activeStickerId, setActiveStickerId] = useState<string | null>(null);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Dragging sticker tracking ref
  const draggingRef = useRef<{
    id: string;
    startClientX: number;
    startClientY: number;
    startX: number;
    startY: number;
  } | null>(null);

  // 3. High-Performance Pan & Zoom Hook
  const {
    x,
    y,
    zoom,
    containerRef,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleMouseLeave,
    handleWheel,
    centerOn,
    isDragging,
  } = usePanZoom(0.8, 100, 50);

  const svgRef = useRef<SVGSVGElement>(null);

  // 4. Pixel calculations helper
  const getMatPixelDimensions = useCallback(() => {
    const dpi = 96;
    const scale =
      props.unit === "in"
        ? dpi
        : props.unit === "cm"
        ? dpi / 2.54
        : props.unit === "mm"
        ? dpi / 25.4
        : 1.0;
    return {
      wPx: props.width * scale,
      hPx: props.height * scale,
    };
  }, [props.width, props.height, props.unit]);

  // Center Mat on Mount or Size Change
  useEffect(() => {
    const { wPx, hPx } = getMatPixelDimensions();
    const handle = requestAnimationFrame(() => {
      centerOn(wPx, hPx);
    });
    return () => cancelAnimationFrame(handle);
  }, [props.width, props.height, props.unit, centerOn, getMatPixelDimensions]);

  const handleManualCenter = () => {
    const { wPx, hPx } = getMatPixelDimensions();
    centerOn(wPx, hPx);
  };

  // Zoom Button Handlers
  const handleZoomIn = () => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const fakeWheelEvent = {
      preventDefault: () => {},
      clientX: rect.left + cx,
      clientY: rect.top + cy,
      deltaY: -100,
    } as unknown as React.WheelEvent<HTMLDivElement>;
    handleWheel(fakeWheelEvent);
  };

  const handleZoomOut = () => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const fakeWheelEvent = {
      preventDefault: () => {},
      clientX: rect.left + cx,
      clientY: rect.top + cy,
      deltaY: 100,
    } as unknown as React.WheelEvent<HTMLDivElement>;
    handleWheel(fakeWheelEvent);
  };

  // 5. Sticker CRUD Actions
  const handleAddSticker = (type: "emoji" | "image", content: string) => {
    const { wPx, hPx } = getMatPixelDimensions();
    const newSticker: StickerItem = {
      id: `stk-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      type,
      content,
      x: wPx / 2 + (Math.random() - 0.5) * 80,
      y: hPx / 2 + (Math.random() - 0.5) * 80,
      size: type === "emoji" ? 48 : 64,
      rotation: 0,
    };
    setStickers((prev) => [...prev, newSticker]);
    setActiveStickerId(newSticker.id);
  };

  const handleUpdateSticker = (id: string, updates: Partial<StickerItem>) => {
    setStickers((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
  };

  const handleDeleteSticker = (id: string) => {
    setStickers((prev) => prev.filter((s) => s.id !== id));
    if (activeStickerId === id) {
      setActiveStickerId(null);
    }
  };

  const handleClearStickers = () => {
    setStickers([]);
    setActiveStickerId(null);
  };

  // 6. On-Canvas Interactive Sticker Drag with Pointer Capture
  const handleStickerPointerDown = (id: string, e: React.PointerEvent) => {
    e.stopPropagation();
    setActiveStickerId(id);
    const targetSticker = stickers.find((s) => s.id === id);
    if (!targetSticker) return;

    const targetEl = e.currentTarget as Element;
    if (targetEl.setPointerCapture) {
      targetEl.setPointerCapture(e.pointerId);
    }

    draggingRef.current = {
      id,
      startClientX: e.clientX,
      startClientY: e.clientY,
      startX: targetSticker.x,
      startY: targetSticker.y,
    };
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (draggingRef.current) {
      const { id, startClientX, startClientY, startX, startY } = draggingRef.current;
      const dx = (e.clientX - startClientX) / zoom;
      const dy = (e.clientY - startClientY) / zoom;

      const { wPx, hPx } = getMatPixelDimensions();
      const currentSticker = stickers.find((s) => s.id === id);
      const halfSize = (currentSticker?.size || 48) / 2;

      // Clamped strictly to mat boundaries
      const clampedX = Math.max(halfSize, Math.min(wPx - halfSize, startX + dx));
      const clampedY = Math.max(halfSize, Math.min(hPx - halfSize, startY + dy));

      setStickers((prev) =>
        prev.map((s) => (s.id === id ? { ...s, x: clampedX, y: clampedY } : s))
      );
      return;
    }

    handleMouseMove(e);
  };

  const handleCanvasMouseUp = () => {
    if (draggingRef.current) {
      draggingRef.current = null;
      return;
    }
    handleMouseUp();
  };

  // 7. File Export Handler (SVG, PNG, JPG, PDF)
  const handleExport = useCallback(
    async (type: "svg" | "png" | "jpg" | "pdf") => {
      if (!svgRef.current) return;

      const { wPx, hPx } = getMatPixelDimensions();
      const serializer = new XMLSerializer();
      let svgString = serializer.serializeToString(svgRef.current);

      if (!svgString.match(/^<svg[^>]+xmlns="http:\/\/www\.w3\.org\/2000\/svg"/)) {
        svgString = svgString.replace(
          /^<svg/,
          '<svg xmlns="http://www.w3.org/2000/svg"'
        );
      }
      if (!svgString.match(/^<svg[^>]+xmlns:xlink="http:\/\/www\.w3\.org\/1999\/xlink"/)) {
        svgString = svgString.replace(
          /^<svg/,
          '<svg xmlns:xlink="http://www.w3.org/1999/xlink"'
        );
      }

      svgString = '<?xml version="1.0" encoding="utf-8"?>\n' + svgString;

      // SVG Vector Download
      if (type === "svg") {
        const blob = new Blob([svgString], {
          type: "image/svg+xml;charset=utf-8",
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `cutting-mat-${props.width}x${props.height}-${props.unit}.svg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        return;
      }

      // Raster Pipeline
      const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
      const svgUrl = URL.createObjectURL(blob);

      const maxDim = Math.max(wPx, hPx);
      const multiplier = maxDim > 3000 ? 1 : maxDim > 1500 ? 2 : 3;
      const exportWidth = wPx * multiplier;
      const exportHeight = hPx * multiplier;

      const canvas = document.createElement("canvas");
      canvas.width = exportWidth;
      canvas.height = exportHeight;
      const ctx = canvas.getContext("2d");

      const img = new Image();
      img.onload = async () => {
        if (!ctx) return;

        ctx.fillStyle = props.matColor;
        ctx.fillRect(0, 0, exportWidth, exportHeight);
        ctx.drawImage(img, 0, 0, exportWidth, exportHeight);

        if (type === "pdf") {
          const { jsPDF } = await import("jspdf");

          const ptScale =
            props.unit === "in"
              ? 72
              : props.unit === "cm"
              ? 72 / 2.54
              : props.unit === "mm"
              ? 72 / 25.4
              : 72 / 96;
          const pdfW = props.width * ptScale;
          const pdfH = props.height * ptScale;
          const orientation = props.width >= props.height ? "l" : "p";

          const pdf = new jsPDF({
            orientation: orientation,
            unit: "pt",
            format: [pdfW, pdfH],
          });

          const imgData = canvas.toDataURL("image/png");
          pdf.addImage(imgData, "PNG", 0, 0, pdfW, pdfH);
          pdf.save(
            `cutting-mat-${props.width}x${props.height}-${props.unit}.pdf`
          );
        } else {
          const mimeType = type === "jpg" ? "image/jpeg" : "image/png";
          const ext = type === "jpg" ? "jpg" : "png";
          const quality = type === "jpg" ? 0.96 : undefined;
          const imgData = canvas.toDataURL(mimeType, quality);

          const link = document.createElement("a");
          link.href = imgData;
          link.download = `cutting-mat-${props.width}x${props.height}-${props.unit}.${ext}`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }

        URL.revokeObjectURL(svgUrl);
      };

      img.onerror = () => {
        console.error("Failed to load SVG for export rendering.");
        URL.revokeObjectURL(svgUrl);
      };

      img.src = svgUrl;
    },
    [props, getMatPixelDimensions]
  );

  return (
    <div className="flex w-screen h-screen overflow-hidden bg-zinc-950">
      {/* Infinite Canvas */}
      <main className="flex-1 h-full relative">
        <Canvas
          zoom={zoom}
          x={x}
          y={y}
          containerRef={containerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          onMouseLeave={handleMouseLeave}
          onWheel={handleWheel}
          isDragging={isDragging}
        >
          <CuttingMat
            ref={svgRef}
            {...props}
            stickers={stickers}
            activeStickerId={activeStickerId}
            onStickerPointerDown={handleStickerPointerDown}
          />
        </Canvas>

        {/* Floating Zoom & Center Island Toolbar (Lower Right) */}
        <div className="interactive-ui absolute bottom-6 right-6 z-30 flex items-center gap-1 bg-zinc-900/90 backdrop-blur-xl border border-zinc-800 shadow-2xl rounded-2xl p-1 text-zinc-300">
          <button
            onClick={() => setIsGuideOpen(true)}
            className="p-2 hover:text-emerald-400 hover:bg-zinc-800 rounded-xl transition-colors cursor-pointer"
            title="How to Guide (?)"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
          <div className="w-px h-4 bg-zinc-800" />
          <button
            onClick={handleZoomIn}
            className="p-2 hover:text-white hover:bg-zinc-800 rounded-xl transition-colors cursor-pointer"
            title="Zoom In"
          >
            <Plus className="w-4 h-4" />
          </button>
          <div className="w-px h-4 bg-zinc-800" />
          <button
            onClick={handleZoomOut}
            className="p-2 hover:text-white hover:bg-zinc-800 rounded-xl transition-colors cursor-pointer"
            title="Zoom Out"
          >
            <Minus className="w-4 h-4" />
          </button>
          <div className="w-px h-4 bg-zinc-800" />
          <button
            onClick={handleManualCenter}
            className="p-2 hover:text-white hover:bg-zinc-800 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold px-3"
            title="Recenter cutting mat"
          >
            <Maximize className="w-3.5 h-3.5" />
            <span>Center</span>
          </button>
        </div>

        {/* Info Overlay (Lower Left) */}
        <div
          className={`absolute bottom-6 z-30 flex items-center gap-2 text-[10px] bg-zinc-900/80 backdrop-blur-md border border-zinc-800/80 shadow-lg rounded-xl py-1.5 px-3 text-zinc-400 font-medium transition-all duration-300 ${
            sidebarOpen ? "left-6 md:left-104" : "left-6"
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5 text-zinc-400" />
          <span>Click + drag canvas to Pan • Drag stickers to reposition</span>
        </div>
      </main>

      {/* Floating Island Sidebar */}
      <Sidebar
        props={props}
        onChangeProps={setProps}
        onCenter={handleManualCenter}
        onExport={handleExport}
        onOpenGuide={() => setIsGuideOpen(true)}
        zoom={zoom}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        stickers={stickers}
        activeStickerId={activeStickerId}
        onAddSticker={handleAddSticker}
        onUpdateSticker={handleUpdateSticker}
        onDeleteSticker={handleDeleteSticker}
        onSelectSticker={setActiveStickerId}
        onClearStickers={handleClearStickers}
      />

      {/* How to Guide Astryx Modal */}
      <Modal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        title="How to Guide & Shortcuts"
        maxWidth="max-w-2xl"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-zinc-300">
          <div className="flex items-start gap-3 bg-zinc-800/40 p-3 rounded-2xl border border-zinc-800">
            <MousePointer className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-white text-xs">Canvas Navigation</p>
              <p className="text-[11px] text-zinc-400 leading-normal">
                Click and drag on the canvas background to pan smoothly. Use your mouse scroll wheel to zoom in and out. Click "Center" anytime to fit the mat on screen.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-zinc-800/40 p-3 rounded-2xl border border-zinc-800">
            <Ruler className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-white text-xs">Dimensions & Gap-Free Grid</p>
              <p className="text-[11px] text-zinc-400 leading-normal">
                Switch between Inches (`in`), Metric (`cm`), Fine (`mm`), or Pixels (`px`). Enable "Snap to Grid" to maintain standard symmetric 1:1 square cells.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-zinc-800/40 p-3 rounded-2xl border border-zinc-800">
            <Smile className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-white text-xs">Draggable Stickers & Decals</p>
              <p className="text-[11px] text-zinc-400 leading-normal">
                Add workshop emojis or upload custom SVG/PNG images. Drag decals anywhere on the mat with boundary clamping and realistic depth drop shadows.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-zinc-800/40 p-3 rounded-2xl border border-zinc-800">
            <Compass className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-white text-xs">Protractors & Repeat Modes</p>
              <p className="text-[11px] text-zinc-400 leading-normal">
                Add degree protractor arcs with angle ticks and 30°/45°/60° diagonal guideline rays. Repeat across Dual Corners, 4 Corners, Dual Centers, or Multi-Rings.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-zinc-800/40 p-3 rounded-2xl border border-zinc-800">
            <Type className="w-5 h-5 text-pink-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-white text-xs">Branding & 10 Fonts</p>
              <p className="text-[11px] text-zinc-400 leading-normal">
                Personalize the craft board with custom brand text, font sizing multipliers, 10 system typography stacks, and instant visibility toggle.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-zinc-800/40 p-3 rounded-2xl border border-zinc-800">
            <FileCheck className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-white text-xs">Export Studio</p>
              <p className="text-[11px] text-zinc-400 leading-normal">
                Download pure vector SVG files for laser cutters and CAD, or export high-resolution print raster formats (300 DPI PNG, JPG, and real-scale PDF).
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer with Author & GitHub Links */}
        <div className="mt-4 pt-4 border-t border-zinc-800 flex items-center justify-between text-zinc-400 text-xs">
          <span>
            Crafted with ❤️ by{" "}
            <a
              href="https://nischal.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 hover:text-emerald-300 font-semibold underline underline-offset-2 transition-colors"
            >
              Nischal Mudennavar
            </a>
          </span>
          <a
            href="https://github.com/nischalmudennavar/cutting-mat-designer"
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-400 hover:text-white transition-colors font-medium underline underline-offset-2"
          >
            GitHub Repository
          </a>
        </div>
      </Modal>
    </div>
  );
}
