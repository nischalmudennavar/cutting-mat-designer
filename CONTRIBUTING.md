# Contributing to Cutting Mat Designer

First off, thank you for considering contributing to **Cutting Mat Designer**! 🎉

This project is built to provide artists, makers, and CAD draftsmen with a fast, high-precision parametric cutting mat studio. Whether you are fixing a bug, adding new grid presets, improving performance, or designing new Astryx UI components, your contributions are welcome!

---

## 🛠️ Getting Started

### Prerequisites
* **Node.js**: `v18.17.0` or higher
* **npm** or **pnpm**

### Local Setup
```bash
# 1. Clone the repository
git clone https://github.com/nischalmudennavar/cutting-mat-designer.git
cd cutting-mat-designer

# 2. Install dependencies
npm install

# 3. Start the Turbopack development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

---

## 🏗️ Architecture Overview

The codebase is organized cleanly around 3 main pillars:

### 1. High-Performance Canvas (`src/hooks/usePanZoom.ts` & `src/components/Canvas.tsx`)
* Implements cursor-relative smooth zooming and drag-to-pan.
* Pointer events are throttled with `requestAnimationFrame` and rendered using GPU hardware-accelerated `translate3d(x, y, 0)`.

### 2. Compound Parametric SVG Engine (`src/components/CuttingMat.tsx`)
* Uses 96 DPI physical scaling for `in`, `cm`, `mm`, and `px`.
* Eliminates partial border gap artifacts through mathematical symmetric centering ($B_x, B_y$).
* Concatenates thousands of grid lines into 4 compound `<path>` elements, enabling smooth 60fps interaction on large canvases.
* Renders draggable stickers with realistic SVG `<feDropShadow>` filters.

### 3. Astryx UI Component System (`src/components/ui/`)
* Built with Meta Astryx-inspired design principles: modular, atomic, fully themeable with dark tokens, and accessible.
* Includes custom `Dropdown`, `Switch`, `ColorPicker`, `NumberInput`, `SegmentedControl`, `Slider`, `Button`, `Accordion`, and `Modal`.
* **Rule**: Do not use native unstyled browser inputs.

---

## 📐 Development Guidelines

1. **TypeScript Strictness**: Ensure all components and functions have strict type definitions.
2. **Performance**: Avoid rendering large arrays of discrete SVG `<line>` elements; use compound path strings (`M...L...`) wherever possible.
3. **Responsive UI**: Ensure all floating panels include `className="interactive-ui"` and draggable items include `className="interactive-sticker"` to prevent event interference with canvas panning.
4. **Verification**: Always run `npm run build` before submitting changes to ensure zero compilation or type errors.

---

## 🤝 Contribution Workflow

1. Fork the repository on GitHub.
2. Create a feature branch: `git checkout -b feature/your-feature-name`.
3. Commit your changes: `git commit -m "feat: add your awesome feature"`.
4. Push to your branch: `git push origin feature/your-feature-name`.
5. Open a Pull Request on GitHub.

---

## 👤 Author & Repository

* **Author**: [Nischal Mudennavar](https://nischal.dev)
* **GitHub Repository**: [github.com/nischalmudennavar/cutting-mat-designer](https://github.com/nischalmudennavar/cutting-mat-designer)
