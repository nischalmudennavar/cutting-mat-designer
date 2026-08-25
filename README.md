# cutting mat designer

> A parametric vector studio for designing custom self-healing craft and drafting cutting mats with high-precision grid mathematics, draggable decals, multi-anchor protractors, and multi-format exports.

Built by **[Nischal Mudennavar](https://nischal.dev)** • [GitHub Repository](https://github.com/nischalmudennavar/cutting-mat-designer)

---

## ✨ Features

* **📐 Parametric Dimension Engine**: Design in **Inches (`in`)**, **Metric (`cm`)**, **Fine (`mm`)**, or **Pixels (`px`)**.
* **🧲 Symmetric Gap-Free Grid Math**: Eliminates partial or awkward trailing grid gaps using mathematical margin balancing ($B_x, B_y$).
* **🎨 Astryx UI Architecture**: 100% custom, dark-theme component primitives inspired by Meta's Astryx design system (`Dropdown`, `Switch`, `ColorPicker`, `NumberInput`, `SegmentedControl`, `Slider`, `Button`, `Modal`).
* **🧭 Repeated Protractor Engine**: Degree arcs with 1°/5°/10° ticks and 30°/45°/60° diagonal guidelines with 5 repetition modes (*Single*, *Dual Corners*, *4 Corners*, *Dual Center*, *Concentric Multi-Rings*) and strict boundary clamping.
* **🏷️ Draggable Decals & Emojis**: Add workshop emojis or upload custom SVG/PNG images with on-canvas pointer dragging, boundary constraints, and realistic depth drop shadows.
* **✍️ 10 System Typography Stacks**: Personalize branding badges with scalable multipliers and custom visibility toggles.
* **💾 Multi-Format Export Studio**:
  - Vector `.svg` for laser cutters and CAD
  - Print-quality 300 DPI `.png` and `.jpg`
  - Real-scale physical `.pdf` documents

---

## 🚀 Quick Start

```bash
# Clone repository
git clone https://github.com/nischalmudennavar/cutting-mat-designer.git
cd cutting-mat-designer

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to start designing.

---

## 🤖 For AI Coding Agents & LLMs

* **Agent Context Manual**: **[CONTEXT.md](./CONTEXT.md)**
* **LLMs Standard Index**: **[`/llms.txt`](./public/llms.txt)**
* **Full Technical Ingestion**: **[`/llms-full.txt`](./public/llms-full.txt)**

---

## 👥 Contributing

We welcome contributions from developers and makers! Please read **[CONTRIBUTING.md](./CONTRIBUTING.md)** for setup instructions and contribution workflows.

---

## 👤 Author & License

* **Author**: [Nischal Mudennavar](https://nischal.dev)
* **GitHub**: [@nischalmudennavar](https://github.com/nischalmudennavar)
* **Project**: [cutting-mat-designer](https://github.com/nischalmudennavar/cutting-mat-designer)
* **License**: MIT
