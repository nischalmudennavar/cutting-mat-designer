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

export interface CuttingMatProps {
  width: number;
  height: number;
  unit: UnitType;
  borderRadiusMode?: BorderRadiusMode;
  gridOpacity: number;
  miniSubdivisions: number;
  tickMarksOnGrid: boolean;
  showProtractor: boolean;
  protractorRadius: number;
  protractorPosition: "center" | "bottom-center" | "bottom-left" | "bottom-right";
  protractorRepeatMode?: ProtractorRepeatMode;
  showDiagonals: boolean;
  brandingText: string;
  brandingFont: string;
  brandingSize: number;
  brandingPosition: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "center";
  brandingOpacity: number;
  matColor: string;
  gridColor: string;
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
      showProtractor,
      protractorRadius,
      protractorPosition,
      protractorRepeatMode = "single",
      showDiagonals,
      brandingText,
      brandingFont,
      brandingSize,
      brandingPosition,
      brandingOpacity,
      matColor,
      gridColor,
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

    // Exact integer grid cells (eliminates any partial or weird fractional gaps)
    const stepsX = Math.max(1, Math.floor((wPx - 2 * minBorderPx) / majorStepPx));
    const stepsY = Math.max(1, Math.floor((hPx - 2 * minBorderPx) / majorStepPx));

    // Balanced symmetric margins on left/right and top/bottom
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
        tickD += `M ${bxPx} ${y} L ${bxPx - 12} ${y} M ${wPx - bxPx} ${y} L ${wPx - bxPx + 12} ${y} `;

        if (j < stepsY && subdivs > 1) {
          for (let s = 1; s < subdivs; s++) {
            const subY = Math.round((y - s * subdivStepPx) * 10) / 10;
            subdivD += `M ${bxPx} ${subY} L ${wPx - bxPx} ${subY} `;

            const isHalf = subdivs % 2 === 0 && s === subdivs / 2;
            const tLen = isHalf ? 8 : 5;
            tickD += `M ${bxPx} ${subY} L ${bxPx - tLen} ${subY} M ${wPx - bxPx} ${subY} L ${wPx - bxPx + tLen} ${subY} `;
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

    // 2. Multi-Protractor Generator with Repeat Modes
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

        // Define protractor anchors based on repeat mode
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
          // Bottom-Left (0°-90°) and Bottom-Right (90°-180°)
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
          // 4 Corners (All Quadrants)
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
          // Top & Bottom Centers
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
          // Single Anchor (or concentric rings)
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

          // Handle concentric multi-ring repeat
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

            // Ticks
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

              // Labels on outer ring
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

          // Guideline Rays
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
        text: number;
        anchor: "start" | "end" | "middle";
        baseline: "auto" | "middle" | "hanging";
      }> = [];

      for (let i = 0; i <= stepsX; i++) {
        const x = bxPx + i * majorStepPx;
        const val = i * majorStepUnits;
        numbers.push({
          key: `nx-t-${i}`,
          x,
          y: byPx - 16,
          text: val,
          anchor: "middle",
          baseline: "auto",
        });
        numbers.push({
          key: `nx-b-${i}`,
          x,
          y: hPx - byPx + 24,
          text: val,
          anchor: "middle",
          baseline: "hanging",
        });
      }

      for (let j = 0; j <= stepsY; j++) {
        const y = hPx - byPx - j * majorStepPx;
        const val = j * majorStepUnits;
        numbers.push({
          key: `ny-l-${j}`,
          x: bxPx - 16,
          y,
          text: val,
          anchor: "end",
          baseline: "middle",
        });
        numbers.push({
          key: `ny-r-${j}`,
          x: wPx - bxPx + 16,
          y,
          text: val,
          anchor: "start",
          baseline: "middle",
        });
      }

      return numbers;
    }, [bxPx, byPx, hPx, wPx, majorStepPx, majorStepUnits, stepsX, stepsY]);

    // 4. Branding Label Block
    const branding = useMemo(() => {
      if (!brandingText) return null;

      let tx = wPx / 2;
      let ty = hPx / 2;
      let anchor: "start" | "end" | "middle" = "middle";
      let align: "auto" | "middle" | "hanging" | "alphabetic" = "middle";

      const paddingX = bxPx + 36;
      const paddingY = byPx + 36;

      if (brandingPosition === "top-left") {
        tx = paddingX;
        ty = paddingY + 10;
        anchor = "start";
        align = "hanging";
      } else if (brandingPosition === "top-right") {
        tx = wPx - paddingX;
        ty = paddingY + 10;
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

      return {
        tx,
        ty,
        anchor,
        align,
        fSize,
      };
    }, [brandingPosition, brandingSize, brandingText, bxPx, byPx, hPx, wPx]);

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
        {/* Mat Base Surface with Proportional Corner Radius */}
        <rect
          width={wPx}
          height={hPx}
          fill={matColor}
          rx={computedRx}
          stroke={gridColor}
          strokeWidth={2}
        />

        {/* Double Border Frame with Concentric Inner Curvature */}
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

        {/* Protractor Arcs and Degree Ticks */}
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
          <text
            key={lbl.key}
            x={lbl.x}
            y={lbl.y}
            fill={gridColor}
            fontSize={10}
            fontWeight="600"
            fontFamily={selectedFont}
            textAnchor="middle"
            dominantBaseline="middle"
            opacity={0.8}
          >
            {lbl.angle}°
          </text>
        ))}

        {/* Ruler Coordinate Numbers */}
        {rulerNumbers.map((num) => (
          <text
            key={num.key}
            x={num.x}
            y={num.y}
            fill={gridColor}
            fontSize={12}
            fontWeight="bold"
            fontFamily={selectedFont}
            textAnchor={num.anchor}
            dominantBaseline={num.baseline}
            opacity={0.9}
          >
            {num.text}
          </text>
        ))}

        {/* Branding Badge */}
        {branding && (
          <g opacity={brandingOpacity}>
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
              opacity={0.75}
            >
              SELF-HEALING CUTTING MAT • {width} × {height} {unit.toUpperCase()}
            </text>
          </g>
        )}
      </svg>
    );
  })
);

CuttingMat.displayName = "CuttingMat";
