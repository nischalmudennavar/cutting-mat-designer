# CONTEXT.md — AI Agent Operating Manual

> **Purpose**: This document provides autonomous AI coding agents with high-density architectural invariants, mathematical domain formulas, coordinate transformation rules, and component conventions for `cutting-mat-designer`.

---

## 1. Project Overview & Tech Stack

`cutting-mat-designer` is a high-performance parametric vector CAD & craft cutting mat designer with an infinite pan/zoom canvas, interactive stickers, technical drafting protractors, and multi-format exports.

* **Framework**: Next.js 16 (Turbopack, App Router, React 19)
* **Language**: TypeScript (Strict Mode)
* **Styling**: Tailwind CSS v4 (`@import "tailwindcss";` in `globals.css`)
* **Design System**: Meta Astryx-inspired modular component primitives (`src/components/ui/`)
* **Export Engine**: Vector XMLSerializer (`.svg`), HTML5 Canvas 300 DPI rasterizer (`.png`, `.jpg`), `jspdf` (`.pdf`)
* **Author**: [Nischal Mudennavar](https://nischal.dev)
* **Repository**: [`https://github.com/nischalmudennavar/cutting-mat-designer`](https://github.com/nischalmudennavar/cutting-mat-designer)

---

## 2. Operational Commands

```bash
# Start local development server (Turbopack)
npm run dev

# Production build and typecheck
npm run build

# Start production server
npm run start

# Lint codebase
npm run lint
```

---

## 3. Core Architectural Invariants & Mathematics

### A. Coordinate Scaling Standard (96 DPI)
All internal SVG dimensions and physics are calculated in SVG user units (pixels) at the 96 DPI screen standard:
$$\text{Scale} = \begin{cases} 96.0 & \text{unit} = \text{"in"} \\ \frac{96.0}{2.54} \approx 37.795 & \text{unit} = \text{"cm"} \\ \frac{96.0}{25.4} \approx 3.7795 & \text{unit} = \text{"mm"} \\ 1.0 & \text{unit} = \text{"px"} \end{cases}$$

$$\text{Major Step Units} = \begin{cases} 1 & \text{unit} \in \{\text{"in"}, \text{"cm"}\} \\ 10 & \text{unit} = \text{"mm"} \\ 100 & \text{unit} = \text{"px"} \end{cases}$$

### B. Symmetric Integer Grid Gap Elimination Formula
To prevent fractional, asymmetrical grid squares on border edges:
$$N_x = \max\left(1, \left\lfloor \frac{W_{px} - 2 B_{min}}{\text{step}_{px}} \right\rfloor\right), \quad N_y = \max\left(1, \left\lfloor \frac{H_{px} - 2 B_{min}}{\text{step}_{px}} \right\rfloor\right)$$
$$B_x = \frac{W_{px} - N_x \times \text{step}_{px}}{2}, \quad B_y = \frac{H_{px} - N_y \times \text{step}_{px}}{2}$$
* **Invariant**: All grid cells are guaranteed to be 100% full, symmetrical integer squares with balanced $B_x$ and $B_y$ margins on left/right and top/bottom.

### C. Protractor Radius Clamping
Protractor radius $R$ is strictly bounded by origin anchor to prevent clipping outside mat borders:
$$R_{max} = \begin{cases} \min\left(\frac{W - 2B}{2}, H - 2B\right) & \text{position} = \text{"bottom-center"} \lor \text{repeat} = \text{"dual-center"} \\ \min\left(\frac{W - 2B}{2}, \frac{H - 2B}{2}\right) & \text{position} = \text{"center"} \\ \min(W - 2B, H - 2B) & \text{position} \in \{\text{"bottom-left"}, \text{"bottom-right"}\} \lor \text{repeat} \in \{\text{"dual-bottom"}, \text{"four-corners"}\} \end{cases}$$

### D. Pan & Zoom Pointer Coordinate Translation
Converting viewport screen coordinates $(cX, cY)$ to mat-relative coordinates $(x_{mat}, y_{mat})$:
$$x_{mat} = \frac{cX - x_{canvas}}{\text{zoom}}, \quad y_{mat} = \frac{cY - y_{canvas}}{\text{zoom}}$$

### E. Compound SVG Path GPU Tessellation (Performance Invariant)
* **NEVER** render thousands of discrete `<line>` elements for grid lines and ticks.
* **ALWAYS** concatenate grid paths into compound `<path d="M...L...M...L..." />` elements (`majorGridPath`, `subdivGridPath`, `ticksPath`, `protractorPath`, `protractorDiagonalsPath`). This reduces DOM tree overhead from thousands of nodes to 5 GPU-accelerated buffers.

---

## 4. File Structure & Component Mapping

```
src/
├── app/
│   ├── globals.css              # Dark dotted background & scrollbar styling
│   ├── layout.tsx               # Root metadata & font declarations
│   └── page.tsx                 # Master state coordinator, export pipeline, guide modal
├── components/
│   ├── ui/                      # Astryx Modular Component Primitives
│   │   ├── Accordion.tsx        # Collapsible card panels with chevron state
│   │   ├── Button.tsx           # Primary, secondary, outline, ghost, icon, danger variants
│   │   ├── ColorPicker.tsx      # Custom swatch button & hex badge
│   │   ├── Dropdown.tsx         # Floating popover menu with checkmarks & click-outside dismiss
│   │   ├── Input.tsx            # Form text input
│   │   ├── Modal.tsx            # Glassmorphic dialog modal with escape/backdrop dismiss
│   │   ├── NumberInput.tsx      # Stepper numeric field with +/- buttons
│   │   ├── SegmentedControl.tsx # Active pill selector (Units, Radius mode)
│   │   ├── Slider.tsx           # Range slider with live value readout badge
│   │   └── Switch.tsx           # Animated sliding thumb toggle switch
│   ├── Canvas.tsx               # Infinite canvas viewport with GPU translate3d
│   ├── CuttingMat.tsx           # Memoized compound SVG cutting mat & sticker renderer
│   └── Sidebar.tsx              # Floating island studio panel with Astryx primitives
└── hooks/
    └── usePanZoom.ts            # Pointer pan & zoom engine with RAF throttling
```

---

## 5. Coding Standards & Non-Negotiables

1. **Zero Native Form Controls**: Never use native `<select>`, `<input type="checkbox">`, or `<input type="color">`. Always use the custom Astryx primitives from `src/components/ui/`.
2. **Interactive Elements Classing**:
   - Floating UI elements must include `className="interactive-ui"` so canvas clicks do not trigger panning.
   - Draggable sticker elements must include `className="interactive-sticker"`.
3. **Pointer Capture for Draggable Items**: Always use `targetEl.setPointerCapture(e.pointerId)` on `pointerdown` for draggable elements to ensure uninterrupted drag tracking across browser boundaries.
4. **Dynamic Import for SSR**: Libraries that reference DOM globals (such as `jspdf`) must always be dynamically imported inside client handlers (`const { jsPDF } = await import("jspdf")`).
5. **Type Safety**: Maintain strict TypeScript typing without `any`.
