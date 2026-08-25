"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Plus, Minus, Maximize, HelpCircle } from "lucide-react";
import { usePanZoom } from "@/hooks/usePanZoom";
import { Canvas } from "@/components/Canvas";
import { CuttingMat, CuttingMatProps } from "@/components/CuttingMat";
import { Sidebar } from "@/components/Sidebar";

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
    showProtractor: true,
    protractorRadius: 6,
    protractorPosition: "bottom-center",
    protractorRepeatMode: "single",
    showDiagonals: true,
    brandingText: "Craftsman Studio",
    brandingFont: "technical-mono",
    brandingSize: 1.0,
    brandingPosition: "bottom-right",
    brandingOpacity: 0.5,
    matColor: "#0f5132",
    gridColor: "#f5d061",
  });

  const [sidebarOpen, setSidebarOpen] = useState(true);

  // 2. High-Performance Pan & Zoom Hook
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

  // 3. Pixel calculations helper
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

  // 4. Center Mat on Mount or Size Change
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

  // 5. File Export Handler (SVG, PNG, JPG, PDF)
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

      // SVG Download
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

      // Raster Export Pipeline
      const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
      const svgUrl = URL.createObjectURL(blob);

      // Adaptive multiplier (cap at max dimension to avoid memory exhaust on 8000px images)
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
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onWheel={handleWheel}
          isDragging={isDragging}
        >
          <CuttingMat ref={svgRef} {...props} />
        </Canvas>

        {/* Floating Zoom & Center Island Toolbar (Lower Right) */}
        <div className="interactive-ui absolute bottom-6 right-6 z-30 flex items-center gap-1 bg-zinc-900/90 backdrop-blur-xl border border-zinc-800 shadow-2xl rounded-2xl p-1 text-zinc-300">
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
          <span>Click + drag on canvas to Pan • Scroll to Zoom</span>
        </div>
      </main>

      {/* Floating Island Sidebar */}
      <Sidebar
        props={props}
        onChangeProps={setProps}
        onCenter={handleManualCenter}
        onExport={handleExport}
        zoom={zoom}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />
    </div>
  );
}
