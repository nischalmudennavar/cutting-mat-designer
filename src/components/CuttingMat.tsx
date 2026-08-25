"use client";

import React, { forwardRef, useMemo, memo } from "react";

export type UnitType = "in" | "cm" | "mm" | "px";
export type BorderRadiusMode = "sharp" | "standard" | "smooth";
export type ProtractorRepeatMode =
  | "single"
  | "dual-bottom"
  | "four-corners"
  | "dual-center"
  | "concentric-rings";

export interface StickerItem {
  id: string;
  type: "emoji" | "image";
  content: string;
  x: number;
  y: number;
  size: number;
  rotation?: number;
}

export interface CuttingMatProps {
  width: number;
  height: number;
  unit: UnitType;
  borderRadiusMode?: BorderRadiusMode;
  gridOpacity: number;
  miniSubdivisions: number;
  tickMarksOnGrid: boolean;
  labelBackgrounds?: boolean;
  showProtractor: boolean;
  protractorRadius: number;
  protractorPosition: "center" | "bottom-center" | "bottom-left" | "bottom-right";
  protractorRepeatMode?: ProtractorRepeatMode;
  showDiagonals: boolean;
  showBranding?: boolean;
  brandingText: string;
  brandingFont: string;
  brandingSize: number;
  brandingPosition: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "center";
  brandingOpacity: number;
  matColor: string;
  gridColor: string;
  stickers?: StickerItem[];
  activeStickerId?: string | null;
  onStickerPointerDown?: (id: string, e: React.PointerEvent) => void;
}

export const FONT_OPTIONS = [
  { id: "modern-sans", name: "Modern Sans (System)", value: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' },
  { id: "technical-mono", name: "Technical Mono (Courier)", value: '"Courier New", Courier, monospace' },
  { id: "monospace-code", name: "Technical Code (Consolas)", value: 'Consolas, "Fira Code", "Courier New", monospace' },
  { id: "geometric-sans", name: "Geometric Sans (Century Gothic)", value: '"Century Gothic", sans-serif' },
  { id: "classic-serif", name: "Classic Serif (Georgia)", value: 'Georgia, serif' },
  { id: "clean-display", name: "Clean Display (Trebuchet)", value: '"Trebuchet MS", sans-serif' },
  { id: "wide-technical", name: "Wide Tech (Verdana)", value: 'Verdana, Geneva, sans-serif' },
  { id: "traditional-serif", name: "Traditional Serif (Times)", value: '"Times New Roman", Times, serif' },
  { id: "bookish-serif", name: "Bookish Serif (Garamond)", value: 'Garamond, serif' },
  { id: "bold-impact", name: "Bold Impact (Impact)", value: 'Impact, Charcoal, sans-serif' },
];

export const COLOR_PRESETS = [
  { id: "classic-green", name: "Classic Green & Yellow", mat: "#0f5132", grid: "#f5d061" },
  { id: "blueprint-blue", name: "Blueprint Blue & White", mat: "#0c3b6b", grid: "#ffffff" },
  { id: "slate-black", name: "Slate Black & Silver", mat: "#18181b", grid: "#e2e8f0" },
  { id: "translucent-gray", name: "Light Craft Gray & Dark Gray", mat: "#d4d4d8", grid: "#3f3f46" },
  { id: "cherry-red", name: "Cherry Red & White", mat: "#881337", grid: "#ffffff" },
  { id: "pink-gold", name: "Vibrant Pink & Gold", mat: "#9d174d", grid: "#fef08a" },
];

export const CuttingMat = memo(
  forwardRef<SVGSVGElement, CuttingMatProps>((props, ref) => {
    const {
      width,
      height,
      unit,
      borderRadiusMode = "standard",
      gridOpacity,
      miniSubdivisions,
      tickMarksOnGrid,
      labelBackgrounds = true,
      showProtractor,
      protractorRadius,
      protractorPosition,
      protractorRepeatMode = "single",
      showDiagonals,
      showBranding = true,
      brandingText,
      brandingFont,
      brandingSize,
      brandingPosition,
      brandingOpacity,
      matColor,
      gridColor,
      stickers = [],
      activeStickerId,
      onStickerPointerDown,
    } = props;

    // Pixel scaling
    const dpi = 96;
    const unitScale =
      unit === "in"
        ? dpi
        : unit === "cm"
        ? dpi / 2.54
        : unit === "mm"
        ? dpi / 25.4
        : 1.0;

    const wPx = width * unitScale;
    const hPx = height * unitScale;

    // Base minimum border in units
    const minBorderUnits =
      unit === "in" ? 0.5 : unit === "cm" ? 1.0 : unit === "mm" ? 10.0 : 40.0;
    const minBorderPx = Math.min(minBorderUnits * unitScale, wPx / 4, hPx / 4);

    const majorStepUnits = unit === "mm" ? 10 : unit === "px" ? 100 : 1;
    const majorStepPx = majorStepUnits * unitScale;

    // Exact integer grid cells
    const stepsX = Math.max(1, Math.floor((wPx - 2 * minBorderPx) / majorStepPx));
    const stepsY = Math.max(1, Math.floor((hPx - 2 * minBorderPx) / majorStepPx));

    // Balanced symmetric margins
    const bxPx = Math.round(((wPx - stepsX * majorStepPx) / 2) * 10) / 10;
    const byPx = Math.round(((hPx - stepsY * majorStepPx) / 2) * 10) / 10;

    const gridWPx = stepsX * majorStepPx;
    const gridHPx = stepsY * majorStepPx;

    // Proportional Corner Radius
    const minDimPx = Math.min(wPx, hPx);
    const cornerFactor =
      borderRadiusMode === "sharp"
        ? 0
        : borderRadiusMode === "smooth"
        ? 0.05
        : 0.025;
    const computedRx = Math.round(minDimPx * cornerFactor);
    const innerRx = Math.max(0, computedRx - Math.min(bxPx, byPx) * 0.35);

    const subdivs = Math.max(1, miniSubdivisions);
    const subdivStepPx = majorStepPx / subdivs;

    const selectedFont =
      FONT_OPTIONS.find((f) => f.id === brandingFont)?.value ||
      FONT_OPTIONS[0].value;

    // 1. Compound Grid Paths
    const { majorGridPath, subdivGridPath, ticksPath } = useMemo(() => {
      let majorD = "";
      let subdivD = "";
      let tickD = "";

      // Vertical Grid Lines & Ticks
      for (let i = 0; i <= stepsX; i++) {
        const x = Math.round((bxPx + i * majorStepPx) * 10) / 10;
        majorD += `M ${x} ${byPx} L ${x} ${hPx - byPx} `;

        // Top & Bottom Ticks
        tickD += `M ${x} ${byPx} L ${x} ${byPx - 12} M ${x} ${hPx - byPx} L ${x} ${hPx - byPx + 12} `;

        if (i < stepsX && subdivs > 1) {
          for (let s = 1; s < subdivs; s++) {
            const subX = Math.round((x + s * subdivStepPx) * 10) / 10;
            subdivD += `M ${subX} ${byPx} L ${subX} ${hPx - byPx} `;

            const isHalf = subdivs % 2 === 0 && s === subdivs / 2;
            const tLen = isHalf ? 8 : 5;
            tickD += `M ${subX} ${byPx} L ${subX} ${byPx - tLen} M ${subX} ${hPx - byPx} L ${subX} ${hPx - byPx + tLen} `;
          }
        }
      }

      // Horizontal Grid Lines & Ticks
      for (let j = 0; j <= stepsY; j++) {
        const y = Math.round((hPx - byPx - j * majorStepPx) * 10) / 10;
        majorD += `M ${bxPx} ${y} L ${wPx - bxPx} ${y} `;

        // Left & Right Ticks
        tickD += `M ${bxPx} ${y} L ${bxPx - 12} ${y} M ${wPx - bxPx} ${y} L ${wPx - bxPx + 12} `;

        if (j < stepsY && subdivs > 1) {
          for (let s = 1; s < subdivs; s++) {
            const subY = Math.round((y - s * subdivStepPx) * 10) / 10;
            subdivD += `M ${bxPx} ${subY} L ${wPx - bxPx} ${subY} `;

            const isHalf = subdivs % 2 === 0 && s === subdivs / 2;
            const tLen = isHalf ? 8 : 5;
            tickD += `M ${bxPx} ${subY} L ${bxPx - tLen} ${subY} M ${wPx - bxPx} ${subY} L ${wPx - bxPx + tLen} `;
          }
        }
      }

      // Internal Cross Ticks
      if (tickMarksOnGrid) {
        const size = 3;
        for (let i = 1; i < stepsX; i++) {
          const x = bxPx + i * majorStepPx;
          for (let j = 1; j < stepsY; j++) {
            const y = hPx - byPx - j * majorStepPx;
            tickD += `M ${x - size} ${y} L ${x + size} ${y} M ${x} ${y - size} L ${x} ${y + size} `;

            if (subdivs > 1) {
              for (let s = 1; s < subdivs; s++) {
                const subY = y - s * subdivStepPx;
                tickD += `M ${x - 2} ${subY} L ${x + 2} ${subY} `;
                const subX = x + s * subdivStepPx;
                if (subX < wPx - bxPx) {
                  tickD += `M ${subX} ${y - 2} L ${subX} ${y + 2} `;
                }
              }
            }
          }
        }
      }

      return {
        majorGridPath: majorD,
        subdivGridPath: subdivD,
        ticksPath: tickD,
      };
    }, [bxPx, byPx, hPx, wPx, majorStepPx, stepsX, stepsY, subdivs, subdivStepPx, tickMarksOnGrid]);

    // 2. Multi-Protractor Generator
    const { protractorPath, protractorDiagonalsPath, protractorLabels, originPoints } =
      useMemo(() => {
        if (!showProtractor) {
          return {
            protractorPath: "",
            protractorDiagonalsPath: "",
            protractorLabels: [],
            originPoints: [],
          };
        }

        interface ProtractorAnchor {
          cx: number;
          cy: number;
          startAngle: number;
          endAngle: number;
          diagonals: number[];
          maxRadiusUnits: number;
        }

        const anchors: ProtractorAnchor[] = [];

        const maxRadCorner = Math.min((wPx - 2 * bxPx) / unitScale, (hPx - 2 * byPx) / unitScale);
        const maxRadCenter = Math.min((wPx - 2 * bxPx) / 2 / unitScale, (hPx - 2 * byPx) / 2 / unitScale);
        const maxRadHalf = Math.min((wPx - 2 * bxPx) / 2 / unitScale, (hPx - 2 * byPx) / unitScale);

        if (protractorRepeatMode === "dual-bottom") {
          anchors.push({
            cx: bxPx,
            cy: hPx - byPx,
            startAngle: 0,
            endAngle: 90,
            diagonals: [30, 45, 60],
            maxRadiusUnits: maxRadCorner,
          });
          anchors.push({
            cx: wPx - bxPx,
            cy: hPx - byPx,
            startAngle: 90,
            endAngle: 180,
            diagonals: [120, 135, 150],
            maxRadiusUnits: maxRadCorner,
          });
        } else if (protractorRepeatMode === "four-corners") {
          anchors.push({
            cx: bxPx,
            cy: hPx - byPx,
            startAngle: 0,
            endAngle: 90,
            diagonals: [30, 45, 60],
            maxRadiusUnits: maxRadCorner,
          });
          anchors.push({
            cx: wPx - bxPx,
            cy: hPx - byPx,
            startAngle: 90,
            endAngle: 180,
            diagonals: [120, 135, 150],
            maxRadiusUnits: maxRadCorner,
          });
          anchors.push({
            cx: bxPx,
            cy: byPx,
            startAngle: 270,
            endAngle: 360,
            diagonals: [300, 315, 330],
            maxRadiusUnits: maxRadCorner,
          });
          anchors.push({
            cx: wPx - bxPx,
            cy: byPx,
            startAngle: 180,
            endAngle: 270,
            diagonals: [210, 225, 240],
            maxRadiusUnits: maxRadCorner,
          });
        } else if (protractorRepeatMode === "dual-center") {
          anchors.push({
            cx: wPx / 2,
            cy: hPx - byPx,
            startAngle: 0,
            endAngle: 180,
            diagonals: [30, 45, 60, 120, 135, 150],
            maxRadiusUnits: maxRadHalf,
          });
          anchors.push({
            cx: wPx / 2,
            cy: byPx,
            startAngle: 180,
            endAngle: 360,
            diagonals: [210, 225, 240, 300, 315, 330],
            maxRadiusUnits: maxRadHalf,
          });
        } else {
          let cx = wPx / 2;
          let cy = hPx - byPx;
          let startAngle = 0;
          let endAngle = 180;
          let diagonals = [30, 45, 60, 120, 135, 150];
          let maxR = maxRadHalf;

          if (protractorPosition === "center") {
            cx = wPx / 2;
            cy = hPx / 2;
            startAngle = 0;
            endAngle = 360;
            diagonals = [30, 45, 60, 120, 135, 150, 210, 225, 240, 300, 315, 330];
            maxR = maxRadCenter;
          } else if (protractorPosition === "bottom-left") {
            cx = bxPx;
            cy = hPx - byPx;
            startAngle = 0;
            endAngle = 90;
            diagonals = [30, 45, 60];
            maxR = maxRadCorner;
          } else if (protractorPosition === "bottom-right") {
            cx = wPx - bxPx;
            cy = hPx - byPx;
            startAngle = 90;
            endAngle = 180;
            diagonals = [120, 135, 150];
            maxR = maxRadCorner;
          }

          anchors.push({
            cx,
            cy,
            startAngle,
            endAngle,
            diagonals,
            maxRadiusUnits: maxR,
          });
        }

        let pD = "";
        let diagD = "";
        const allLabels: Array<{ key: string; x: number; y: number; angle: number }> = [];
        const origins: Array<{ cx: number; cy: number }> = [];

        anchors.forEach((anc, aIdx) => {
          origins.push({ cx: anc.cx, cy: anc.cy });

          const safeRadiusUnits = Math.max(0.5, Math.min(protractorRadius, anc.maxRadiusUnits));
          const baseRPx = safeRadiusUnits * unitScale;

          const ringScales = protractorRepeatMode === "concentric-rings" ? [1.0, 0.66, 0.33] : [1.0];

          ringScales.forEach((ringFactor, ringIdx) => {
            const rPx = baseRPx * ringFactor;
            if (rPx < 15) return;

            const isOuterRing = ringIdx === 0;

            if (anc.startAngle === 0 && anc.endAngle === 360) {
              pD += `M ${anc.cx + rPx} ${anc.cy} A ${rPx} ${rPx} 0 1 0 ${anc.cx - rPx} ${anc.cy} A ${rPx} ${rPx} 0 1 0 ${anc.cx + rPx} ${anc.cy} `;
              if (rPx > 20) {
                pD += `M ${anc.cx + rPx - 15} ${anc.cy} A ${rPx - 15} ${rPx - 15} 0 1 0 ${anc.cx - (rPx - 15)} ${anc.cy} A ${rPx - 15} ${rPx - 15} 0 1 0 ${anc.cx + rPx - 15} ${anc.cy} `;
              }
            } else {
              const startRad = (anc.startAngle * Math.PI) / 180;
              const endRad = (anc.endAngle * Math.PI) / 180;
              const sx = anc.cx + rPx * Math.cos(startRad);
              const sy = anc.cy - rPx * Math.sin(startRad);
              const ex = anc.cx + rPx * Math.cos(endRad);
              const ey = anc.cy - rPx * Math.sin(endRad);

              const sweep = (anc.endAngle - anc.startAngle) > 180 ? 1 : 0;
              pD += `M ${sx} ${sy} A ${rPx} ${rPx} 0 ${sweep} 0 ${ex} ${ey} `;

              if (rPx > 20) {
                const sxInner = anc.cx + (rPx - 15) * Math.cos(startRad);
                const syInner = anc.cy - (rPx - 15) * Math.sin(startRad);
                const exInner = anc.cx + (rPx - 15) * Math.cos(endRad);
                const eyInner = anc.cy - (rPx - 15) * Math.sin(endRad);
                pD += `M ${sxInner} ${syInner} A ${rPx - 15} ${rPx - 15} 0 ${sweep} 0 ${exInner} ${eyInner} `;
              }
            }

            const showMinor = rPx > 90;
            for (let a = anc.startAngle; a <= anc.endAngle; a++) {
              const isMajor = a % 10 === 0;
              const isMed = a % 5 === 0 && !isMajor;
              if (!isMajor && !isMed && !showMinor) continue;

              const rad = (a * Math.PI) / 180;
              const cos = Math.cos(rad);
              const sin = Math.sin(rad);
              const tLen = isMajor ? 14 : isMed ? 9 : 4;

              const x1 = anc.cx + rPx * cos;
              const y1 = anc.cy - rPx * sin;
              const x2 = anc.cx + (rPx - tLen) * cos;
              const y2 = anc.cy - (rPx - tLen) * sin;
              pD += `M ${x1} ${y1} L ${x2} ${y2} `;

              if (isOuterRing && isMajor && a > anc.startAngle && a < anc.endAngle && rPx > 40) {
                allLabels.push({
                  key: `plbl-${aIdx}-${a}`,
                  x: anc.cx + (rPx + 14) * cos,
                  y: anc.cy - (rPx + 14) * sin,
                  angle: a,
                });
              }
            }
          });

          if (showDiagonals) {
            anc.diagonals.forEach((angle) => {
              const rad = (angle * Math.PI) / 180;
              const dx = Math.cos(rad);
              const dy = -Math.sin(rad);

              let tMin = Infinity;
              if (dx > 0) tMin = Math.min(tMin, (wPx - bxPx - anc.cx) / dx);
              if (dx < 0) tMin = Math.min(tMin, (bxPx - anc.cx) / dx);
              if (dy > 0) tMin = Math.min(tMin, (hPx - byPx - anc.cy) / dy);
              if (dy < 0) tMin = Math.min(tMin, (byPx - anc.cy) / dy);

              if (tMin !== Infinity && tMin > 0) {
                const ex = anc.cx + tMin * dx;
                const ey = anc.cy + tMin * dy;
                diagD += `M ${anc.cx} ${anc.cy} L ${ex} ${ey} `;
              }
            });
          }
        });

        return {
          protractorPath: pD,
          protractorDiagonalsPath: diagD,
          protractorLabels: allLabels,
          originPoints: origins,
        };
      }, [
        showProtractor,
        protractorRepeatMode,
        wPx,
        bxPx,
        unitScale,
        hPx,
        byPx,
        protractorPosition,
        protractorRadius,
        showDiagonals,
      ]);

    // 3. Coordinate Ruler Numbers
    const rulerNumbers = useMemo(() => {
      const numbers: Array<{
        key: string;
        x: number;
        y: number;
        bx: number;
        by: number;
        bw: number;
        bh: number;
        text: number;
        anchor: "start" | "end" | "middle";
        baseline: "auto" | "middle" | "hanging";
      }> = [];

      for (let i = 0; i <= stepsX; i++) {
        const x = bxPx + i * majorStepPx;
        const val = i * majorStepUnits;
        const digitLen = String(val).length;
        const bw = Math.max(20, digitLen * 8 + 8);
        const bh = 15;

        numbers.push({
          key: `nx-t-${i}`,
          x,
          y: byPx - 16,
          bx: x - bw / 2,
          by: byPx - 24,
          bw,
          bh,
          text: val,
          anchor: "middle",
          baseline: "auto",
        });

        numbers.push({
          key: `nx-b-${i}`,
          x,
          y: hPx - byPx + 24,
          bx: x - bw / 2,
          by: hPx - byPx + 17,
          bw,
          bh,
          text: val,
          anchor: "middle",
          baseline: "hanging",
        });
      }

      for (let j = 0; j <= stepsY; j++) {
        const y = hPx - byPx - j * majorStepPx;
        const val = j * majorStepUnits;
        const digitLen = String(val).length;
        const bw = Math.max(20, digitLen * 8 + 8);
        const bh = 15;

        numbers.push({
          key: `ny-l-${j}`,
          x: bxPx - 16,
          y,
          bx: bxPx - 16 - bw + 2,
          by: y - bh / 2,
          bw,
          bh,
          text: val,
          anchor: "end",
          baseline: "middle",
        });

        numbers.push({
          key: `ny-r-${j}`,
          x: wPx - bxPx + 16,
          y,
          bx: wPx - bxPx + 14,
          by: y - bh / 2,
          bw,
          bh,
          text: val,
          anchor: "start",
          baseline: "middle",
        });
      }

      return numbers;
    }, [bxPx, byPx, hPx, wPx, majorStepPx, majorStepUnits, stepsX, stepsY]);

    // 4. Branding Label Block
    const branding = useMemo(() => {
      if (!showBranding || !brandingText) return null;

      let tx = wPx / 2;
      let ty = hPx / 2;
      let anchor: "start" | "end" | "middle" = "middle";
      let align: "auto" | "middle" | "hanging" | "alphabetic" = "middle";

      const paddingX = bxPx + 40;
      const paddingY = byPx + 40;

      if (brandingPosition === "top-left") {
        tx = paddingX;
        ty = paddingY + 12;
        anchor = "start";
        align = "hanging";
      } else if (brandingPosition === "top-right") {
        tx = wPx - paddingX;
        ty = paddingY + 12;
        anchor = "end";
        align = "hanging";
      } else if (brandingPosition === "bottom-left") {
        tx = paddingX;
        ty = hPx - paddingY;
        anchor = "start";
        align = "alphabetic";
      } else if (brandingPosition === "bottom-right") {
        tx = wPx - paddingX;
        ty = hPx - paddingY;
        anchor = "end";
        align = "alphabetic";
      }

      const fSize = 22 * brandingSize;
      const approxW = Math.max(brandingText.length * (fSize * 0.65), 180);
      const plaqueH = fSize * 2.2;
      const plaqueW = approxW + 28;

      let plaqueX = tx - plaqueW / 2;
      if (anchor === "start") plaqueX = tx - 14;
      if (anchor === "end") plaqueX = tx - plaqueW + 14;

      let plaqueY = ty - plaqueH / 2;
      if (align === "hanging") plaqueY = ty - 8;
      if (align === "alphabetic") plaqueY = ty - plaqueH + 8;

      return {
        tx,
        ty,
        anchor,
        align,
        fSize,
        plaqueX,
        plaqueY,
        plaqueW,
        plaqueH,
      };
    }, [brandingPosition, brandingSize, brandingText, bxPx, byPx, hPx, showBranding, wPx]);

    return (
      <svg
        ref={ref}
        width={wPx}
        height={hPx}
        viewBox={`0 0 ${wPx} ${hPx}`}
        style={{
          width: `${wPx}px`,
          height: `${hPx}px`,
          backgroundColor: matColor,
          userSelect: "none",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.7)",
          borderRadius: `${computedRx}px`,
          overflow: "visible",
        }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Subtle realistic drop shadow for stickers */}
          <filter id="sticker-shadow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="3.5" stdDeviation="3.5" floodColor="#000000" floodOpacity="0.45" />
          </filter>
        </defs>

        {/* Mat Base Surface */}
        <rect
          width={wPx}
          height={hPx}
          fill={matColor}
          rx={computedRx}
          stroke={gridColor}
          strokeWidth={2}
        />

        {/* Double Border Frame */}
        <rect
          x={bxPx}
          y={byPx}
          width={gridWPx}
          height={gridHPx}
          fill="none"
          stroke={gridColor}
          strokeWidth={1.5}
          rx={innerRx}
          opacity={0.85}
        />
        <rect
          x={bxPx - 3}
          y={byPx - 3}
          width={gridWPx + 6}
          height={gridHPx + 6}
          fill="none"
          stroke={gridColor}
          strokeWidth={0.8}
          rx={Math.max(0, innerRx + 3)}
          opacity={0.6}
        />

        {/* Compound Subdivisions Path */}
        {subdivGridPath && (
          <path
            d={subdivGridPath}
            stroke={gridColor}
            strokeWidth={0.5}
            opacity={gridOpacity * 0.4}
            strokeDasharray={subdivs > 5 ? "1 2" : undefined}
          />
        )}

        {/* Compound Major Grid Path */}
        {majorGridPath && (
          <path
            d={majorGridPath}
            stroke={gridColor}
            strokeWidth={0.9}
            opacity={gridOpacity}
          />
        )}

        {/* Compound Ticks Path */}
        {ticksPath && (
          <path
            d={ticksPath}
            stroke={gridColor}
            strokeWidth={0.8}
            opacity={0.8}
          />
        )}

        {/* Protractor Guideline Rays */}
        {protractorDiagonalsPath && (
          <path
            d={protractorDiagonalsPath}
            stroke={gridColor}
            strokeWidth={0.8}
            strokeDasharray="4 4"
            opacity={0.55}
          />
        )}

        {/* Protractor Arcs */}
        {protractorPath && (
          <path
            d={protractorPath}
            stroke={gridColor}
            strokeWidth={1.0}
            opacity={0.75}
            fill="none"
          />
        )}

        {/* Protractor Center Dots */}
        {originPoints.map((pt, i) => (
          <circle
            key={`pt-origin-${i}`}
            cx={pt.cx}
            cy={pt.cy}
            r={3}
            fill={gridColor}
            opacity={0.8}
          />
        ))}

        {/* Protractor Angle Labels */}
        {protractorLabels.map((lbl) => (
          <g key={lbl.key}>
            {labelBackgrounds && (
              <rect
                x={lbl.x - 12}
                y={lbl.y - 8}
                width={24}
                height={16}
                rx={4}
                fill={matColor}
                opacity={1}
              />
            )}
            <text
              x={lbl.x}
              y={lbl.y}
              fill={gridColor}
              fontSize={10}
              fontWeight="600"
              fontFamily={selectedFont}
              textAnchor="middle"
              dominantBaseline="middle"
              opacity={0.95}
            >
              {lbl.angle}°
            </text>
          </g>
        ))}

        {/* Ruler Coordinate Numbers */}
        {rulerNumbers.map((num) => (
          <g key={num.key}>
            {labelBackgrounds && (
              <rect
                x={num.bx}
                y={num.by}
                width={num.bw}
                height={num.bh}
                rx={3.5}
                fill={matColor}
                opacity={1}
              />
            )}
            <text
              x={num.x}
              y={num.y}
              fill={gridColor}
              fontSize={12}
              fontWeight="bold"
              fontFamily={selectedFont}
              textAnchor={num.anchor}
              dominantBaseline={num.baseline}
              opacity={0.95}
            >
              {num.text}
            </text>
          </g>
        ))}

        {/* Branding Plaque */}
        {branding && (
          <g opacity={brandingOpacity}>
            {labelBackgrounds && (
              <rect
                x={branding.plaqueX}
                y={branding.plaqueY}
                width={branding.plaqueW}
                height={branding.plaqueH}
                rx={8}
                fill={matColor}
                opacity={0.95}
              />
            )}
            <text
              x={branding.tx}
              y={branding.ty}
              fill={gridColor}
              fontSize={branding.fSize}
              fontWeight="700"
              fontFamily={selectedFont}
              textAnchor={branding.anchor}
              dominantBaseline={branding.align}
              letterSpacing="0.1em"
            >
              {brandingText.toUpperCase()}
            </text>
            <text
              x={branding.tx}
              y={
                branding.ty +
                (branding.align === "hanging"
                  ? branding.fSize + 6
                  : -(branding.fSize + 6))
              }
              fill={gridColor}
              fontSize={branding.fSize * 0.45}
              fontWeight="500"
              fontFamily={selectedFont}
              textAnchor={branding.anchor}
              dominantBaseline={branding.align}
              letterSpacing="0.08em"
              opacity={0.85}
            >
              SELF-HEALING CUTTING MAT • {width} × {height} {unit.toUpperCase()}
            </text>
          </g>
        )}

        {/* Draggable Stickers & Decals */}
        {stickers.map((stk) => {
          const isSelected = stk.id === activeStickerId;
          const rot = stk.rotation || 0;

          return (
            <g
              key={stk.id}
              className="interactive-sticker"
              transform={`translate(${stk.x}, ${stk.y}) rotate(${rot})`}
              filter="url(#sticker-shadow)"
              style={{ cursor: isSelected ? "grabbing" : "grab", touchAction: "none" }}
              onPointerDown={(e) => onStickerPointerDown?.(stk.id, e)}
            >
              {isSelected && (
                <rect
                  x={-stk.size / 2 - 4}
                  y={-stk.size / 2 - 4}
                  width={stk.size + 8}
                  height={stk.size + 8}
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth={1.5}
                  strokeDasharray="4 3"
                  rx={6}
                />
              )}

              {stk.type === "emoji" ? (
                <text
                  x={0}
                  y={0}
                  fontSize={stk.size}
                  textAnchor="middle"
                  dominantBaseline="central"
                  style={{ userSelect: "none" }}
                >
                  {stk.content}
                </text>
              ) : (
                <image
                  href={stk.content}
                  x={-stk.size / 2}
                  y={-stk.size / 2}
                  width={stk.size}
                  height={stk.size}
                  preserveAspectRatio="xMidYMid meet"
                />
              )}
            </g>
          );
        })}
      </svg>
    );
  })
);

CuttingMat.displayName = "CuttingMat";
