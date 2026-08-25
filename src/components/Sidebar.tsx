"use client";

import React, { useState, useRef } from "react";
import {
  Maximize,
  Compass,
  Grid as GridIcon,
  Palette,
  Settings,
  Type,
  Download,
  Menu,
  X,
  Smile,
  Upload,
  Trash2,
  HelpCircle,
} from "lucide-react";
import {
  CuttingMatProps,
  FONT_OPTIONS,
  COLOR_PRESETS,
  UnitType,
  BorderRadiusMode,
  ProtractorRepeatMode,
  StickerItem,
} from "./CuttingMat";
import { Button } from "./ui/Button";
import { SegmentedControl } from "./ui/SegmentedControl";
import { Slider } from "./ui/Slider";
import { Input } from "./ui/Input";
import { Dropdown } from "./ui/Dropdown";
import { Switch } from "./ui/Switch";
import { ColorPicker } from "./ui/ColorPicker";
import { NumberInput } from "./ui/NumberInput";
import { Accordion } from "./ui/Accordion";

const EMOJI_PALETTE = [
  "✂️", "📏", "📐", "✏️", "🏷️", "☕", "🎨", "🚀", "⭐", "🔥",
  "🎯", "🛠️", "🪵", "💡", "⚡", "🧵", "🐱", "🌸", "🍀", "💎"
];

interface SidebarProps {
  props: CuttingMatProps;
  onChangeProps: (updater: (prev: CuttingMatProps) => CuttingMatProps) => void;
  onCenter: () => void;
  onExport: (type: "svg" | "png" | "jpg" | "pdf") => void;
  onOpenGuide: () => void;
  zoom: number;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  stickers: StickerItem[];
  activeStickerId: string | null;
  onAddSticker: (type: "emoji" | "image", content: string) => void;
  onUpdateSticker: (id: string, updates: Partial<StickerItem>) => void;
  onDeleteSticker: (id: string) => void;
  onSelectSticker: (id: string | null) => void;
  onClearStickers: () => void;
}

export function Sidebar({
  props,
  onChangeProps,
  onCenter,
  onExport,
  onOpenGuide,
  zoom,
  isOpen,
  setIsOpen,
  stickers,
  activeStickerId,
  onAddSticker,
  onUpdateSticker,
  onDeleteSticker,
  onSelectSticker,
  onClearStickers,
}: SidebarProps) {
  const [activeSection, setActiveSection] = useState<string | null>("dimensions");
  const [snapToGrid, setSnapToGrid] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleSection = (section: string) => {
    setActiveSection(activeSection === section ? null : section);
  };

  const updateProp = <K extends keyof CuttingMatProps>(
    key: K,
    value: CuttingMatProps[K]
  ) => {
    onChangeProps((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const getMajorStep = (unit: UnitType) => {
    return unit === "mm" ? 10 : unit === "px" ? 100 : 1;
  };

  const getBaseBorder = (unit: UnitType) => {
    return unit === "in" ? 0.5 : unit === "cm" ? 1.0 : unit === "mm" ? 10.0 : 40.0;
  };

  const handleDimensionChange = (dimension: "width" | "height", rawVal: number) => {
    const step = getMajorStep(props.unit);
    const baseBorder = getBaseBorder(props.unit);

    if (snapToGrid) {
      const innerUnits = Math.max(step, rawVal - 2 * baseBorder);
      const snappedN = Math.max(1, Math.round(innerUnits / step));
      const snappedVal = snappedN * step + 2 * baseBorder;
      updateProp(dimension, snappedVal);
    } else {
      updateProp(dimension, Math.max(1, rawVal));
    }
  };

  const handleUnitChange = (newUnit: UnitType) => {
    updateProp("unit", newUnit);
    if (newUnit === "in") {
      updateProp("width", 24);
      updateProp("height", 18);
      updateProp("miniSubdivisions", 8);
      updateProp("protractorRadius", 6);
    } else if (newUnit === "cm") {
      updateProp("width", 42);
      updateProp("height", 29.7);
      updateProp("miniSubdivisions", 10);
      updateProp("protractorRadius", 12);
    } else if (newUnit === "mm") {
      updateProp("width", 420);
      updateProp("height", 297);
      updateProp("miniSubdivisions", 10);
      updateProp("protractorRadius", 120);
    } else if (newUnit === "px") {
      updateProp("width", 1200);
      updateProp("height", 800);
      updateProp("miniSubdivisions", 10);
      updateProp("protractorRadius", 350);
    }
  };

  const handlePresetSelect = (presetId: string) => {
    if (presetId === "preset-18-12") {
      updateProp("unit", "in");
      updateProp("width", 18);
      updateProp("height", 12);
      updateProp("protractorRadius", 5);
    } else if (presetId === "preset-24-18") {
      updateProp("unit", "in");
      updateProp("width", 24);
      updateProp("height", 18);
      updateProp("protractorRadius", 6);
    } else if (presetId === "preset-36-24") {
      updateProp("unit", "in");
      updateProp("width", 36);
      updateProp("height", 24);
      updateProp("protractorRadius", 8);
    } else if (presetId === "preset-a4") {
      updateProp("unit", "cm");
      updateProp("width", 29.7);
      updateProp("height", 21);
      updateProp("miniSubdivisions", 10);
      updateProp("protractorRadius", 9);
    } else if (presetId === "preset-a3") {
      updateProp("unit", "cm");
      updateProp("width", 42);
      updateProp("height", 29.7);
      updateProp("miniSubdivisions", 10);
      updateProp("protractorRadius", 13);
    } else if (presetId === "preset-fhd") {
      updateProp("unit", "px");
      updateProp("width", 1920);
      updateProp("height", 1080);
      updateProp("miniSubdivisions", 10);
      updateProp("protractorRadius", 450);
    } else if (presetId === "preset-web") {
      updateProp("unit", "px");
      updateProp("width", 1200);
      updateProp("height", 800);
      updateProp("miniSubdivisions", 10);
      updateProp("protractorRadius", 350);
    }
  };

  const handleColorPreset = (preset: { mat: string; grid: string }) => {
    onChangeProps((prev) => ({
      ...prev,
      matColor: preset.mat,
      gridColor: preset.grid,
    }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        onAddSticker("image", dataUrl);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const baseBorderOffset = getBaseBorder(props.unit);
  const borderOffset = Math.min(baseBorderOffset, props.width / 4, props.height / 4);
  const maxProtractorRadius =
    props.protractorPosition === "bottom-center" || props.protractorRepeatMode === "dual-center"
      ? Math.min((props.width - 2 * borderOffset) / 2, props.height - 2 * borderOffset)
      : props.protractorPosition === "center"
      ? Math.min((props.width - 2 * borderOffset) / 2, (props.height - 2 * borderOffset) / 2)
      : Math.min(props.width - 2 * borderOffset, props.height - 2 * borderOffset);

  const roundedMaxProtractor = Math.max(
    1,
    props.unit === "px" ? Math.floor(maxProtractorRadius) : Math.floor(maxProtractorRadius * 10) / 10
  );

  const activeSticker = stickers.find((s) => s.id === activeStickerId);

  return (
    <>
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="interactive-ui fixed top-4 left-4 z-50 p-3 bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700 shadow-2xl rounded-2xl text-zinc-100 transition-all hover:scale-105 backdrop-blur-xl cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>
      )}

      {/* Floating Island Sidebar */}
      <div
        className={`interactive-ui fixed top-4 bottom-4 left-4 z-40 w-90 md:w-96 flex flex-col bg-zinc-900/95 backdrop-blur-2xl border border-zinc-800 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] rounded-3xl transition-all duration-300 overflow-hidden ${
          isOpen
            ? "translate-x-0 opacity-100"
            : "-translate-x-[420px] opacity-0 pointer-events-none"
        }`}
      >
        {/* Header */}
        <div className="p-4 border-b border-zinc-800 bg-zinc-950/50">
          <div className="flex items-center justify-between">
            <h1 className="text-base font-bold text-white tracking-tight">
              cutting mat designer
            </h1>
            <div className="flex items-center gap-1">
              <Button
                size="icon"
                variant="ghost"
                onClick={onOpenGuide}
                title="How to Guide (?)"
              >
                <HelpCircle className="w-4 h-4 text-emerald-400 hover:text-emerald-300" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={onCenter}
                title="Fit to Screen"
              >
                <Maximize className="w-4 h-4 text-zinc-400 hover:text-white" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setIsOpen(false)}
              >
                <X className="w-4 h-4 text-zinc-400 hover:text-white" />
              </Button>
            </div>
          </div>
          <p className="text-[11px] text-zinc-400 mt-1.5 leading-relaxed">
            A parametric studio for designing custom self-healing craft and drafting cutting mats.
          </p>
        </div>

        {/* Live Scale Banner */}
        <div className="bg-zinc-950/80 py-1.5 px-4 border-b border-zinc-800/80 text-[10px] text-zinc-400 flex items-center justify-between font-mono">
          <span>Viewport Zoom: {Math.round(zoom * 100)}%</span>
          <span className="text-emerald-400 font-semibold">{props.width} × {props.height} {props.unit}</span>
        </div>

        {/* Accordion Panels */}
        <div className="flex-1 overflow-y-auto divide-y divide-zinc-800">
          {/* SECTION 1: Dimensions & Presets */}
          <Accordion
            id="dimensions"
            title="Dimensions & Presets"
            icon={<Settings className="w-4 h-4 text-emerald-400" />}
            isOpen={activeSection === "dimensions"}
            onToggle={() => toggleSection("dimensions")}
          >
            {/* Unit Selector */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                Unit Mode
              </label>
              <SegmentedControl<UnitType>
                columns={4}
                value={props.unit}
                onChange={handleUnitChange}
                options={[
                  { value: "in", label: "Inches", sublabel: "in" },
                  { value: "cm", label: "Metric", sublabel: "cm" },
                  { value: "mm", label: "Fine", sublabel: "mm" },
                  { value: "px", label: "Pixels", sublabel: "px" },
                ]}
              />
            </div>

            {/* Presets Grid */}
            <div className="space-y-1.5 pt-1">
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                Size Templates
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {props.unit === "in" && (
                  <>
                    <button
                      onClick={() => handlePresetSelect("preset-18-12")}
                      className="p-2 bg-zinc-800/60 hover:bg-zinc-800 border border-zinc-700/60 hover:border-emerald-500 rounded-xl text-left transition-colors font-medium text-zinc-200 cursor-pointer"
                    >
                      18" × 12"{" "}
                      <span className="text-[9px] text-zinc-400 block font-normal">
                        Small Craft
                      </span>
                    </button>
                    <button
                      onClick={() => handlePresetSelect("preset-24-18")}
                      className="p-2 bg-zinc-800/60 hover:bg-zinc-800 border border-zinc-700/60 hover:border-emerald-500 rounded-xl text-left transition-colors font-medium text-zinc-200 cursor-pointer"
                    >
                      24" × 18"{" "}
                      <span className="text-[9px] text-zinc-400 block font-normal">
                        Standard
                      </span>
                    </button>
                    <button
                      onClick={() => handlePresetSelect("preset-36-24")}
                      className="p-2 bg-zinc-800/60 hover:bg-zinc-800 border border-zinc-700/60 hover:border-emerald-500 rounded-xl text-left transition-colors font-medium text-zinc-200 cursor-pointer col-span-2"
                    >
                      36" × 24"{" "}
                      <span className="text-[9px] text-zinc-400 block font-normal">
                        Large Workbench Mat
                      </span>
                    </button>
                  </>
                )}

                {(props.unit === "cm" || props.unit === "mm") && (
                  <>
                    <button
                      onClick={() => handlePresetSelect("preset-a4")}
                      className="p-2 bg-zinc-800/60 hover:bg-zinc-800 border border-zinc-700/60 hover:border-emerald-500 rounded-xl text-left transition-colors font-medium text-zinc-200 cursor-pointer"
                    >
                      A4{" "}
                      <span className="text-[9px] text-zinc-400 block font-normal">
                        29.7 × 21.0 cm
                      </span>
                    </button>
                    <button
                      onClick={() => handlePresetSelect("preset-a3")}
                      className="p-2 bg-zinc-800/60 hover:bg-zinc-800 border border-zinc-700/60 hover:border-emerald-500 rounded-xl text-left transition-colors font-medium text-zinc-200 cursor-pointer"
                    >
                      A3{" "}
                      <span className="text-[9px] text-zinc-400 block font-normal">
                        42.0 × 29.7 cm
                      </span>
                    </button>
                  </>
                )}

                {props.unit === "px" && (
                  <>
                    <button
                      onClick={() => handlePresetSelect("preset-fhd")}
                      className="p-2 bg-zinc-800/60 hover:bg-zinc-800 border border-zinc-700/60 hover:border-emerald-500 rounded-xl text-left transition-colors font-medium text-zinc-200 cursor-pointer"
                    >
                      1920 × 1080{" "}
                      <span className="text-[9px] text-zinc-400 block font-normal">
                        Full HD Display
                      </span>
                    </button>
                    <button
                      onClick={() => handlePresetSelect("preset-web")}
                      className="p-2 bg-zinc-800/60 hover:bg-zinc-800 border border-zinc-700/60 hover:border-emerald-500 rounded-xl text-left transition-colors font-medium text-zinc-200 cursor-pointer"
                    >
                      1200 × 800{" "}
                      <span className="text-[9px] text-zinc-400 block font-normal">
                        Standard Web Canvas
                      </span>
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Dimension Inputs & Snap to Grid */}
            <div className="space-y-3 pt-2 border-t border-zinc-800">
              <Switch
                label="Snap to Grid Cells"
                description="Keeps dimensions aligned to whole square increments"
                checked={snapToGrid}
                onChange={setSnapToGrid}
              />

              <div className="grid grid-cols-2 gap-3">
                <NumberInput
                  label={`Width (${props.unit})`}
                  min={props.unit === "px" ? 100 : 2}
                  max={props.unit === "px" ? 8000 : 200}
                  step={snapToGrid ? getMajorStep(props.unit) : 0.5}
                  value={props.width}
                  onChange={(val) => handleDimensionChange("width", val)}
                />
                <NumberInput
                  label={`Height (${props.unit})`}
                  min={props.unit === "px" ? 100 : 2}
                  max={props.unit === "px" ? 8000 : 200}
                  step={snapToGrid ? getMajorStep(props.unit) : 0.5}
                  value={props.height}
                  onChange={(val) => handleDimensionChange("height", val)}
                />
              </div>
            </div>

            {/* Corner Radius Mode */}
            <div className="space-y-1.5 pt-2 border-t border-zinc-800">
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                Corner Radius (Proportional)
              </label>
              <SegmentedControl<BorderRadiusMode>
                columns={3}
                value={props.borderRadiusMode || "standard"}
                onChange={(mode) => updateProp("borderRadiusMode", mode)}
                options={[
                  { value: "sharp", label: "Sharp", sublabel: "0% (90°)" },
                  { value: "standard", label: "Standard", sublabel: "2.5% (Classic)" },
                  { value: "smooth", label: "Smooth", sublabel: "5.0% (Soft)" },
                ]}
              />
            </div>
          </Accordion>

          {/* SECTION 2: Stickers & Decals */}
          <Accordion
            id="stickers"
            title="Stickers & Decals"
            icon={<Smile className="w-4 h-4 text-yellow-400" />}
            isOpen={activeSection === "stickers"}
            onToggle={() => toggleSection("stickers")}
          >
            {/* Emoji Palette */}
            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                Add Craft Emojis
              </label>
              <div className="grid grid-cols-5 gap-1.5 p-2 bg-zinc-800/40 rounded-2xl border border-zinc-800">
                {EMOJI_PALETTE.map((emoji, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => onAddSticker("emoji", emoji)}
                    className="p-2 hover:bg-zinc-700/60 rounded-xl text-lg flex items-center justify-center transition-transform hover:scale-125 cursor-pointer active:scale-95"
                    title={`Add ${emoji}`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom SVG/PNG Upload */}
            <div className="pt-2 border-t border-zinc-800 space-y-2">
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                Upload Custom Sticker (SVG / PNG)
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/svg+xml, image/jpeg, image/webp"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button
                variant="outline"
                className="w-full justify-center gap-2"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-4 h-4 text-emerald-400" />
                <span>Upload SVG / PNG Decal</span>
              </Button>
            </div>

            {/* Active Selected Sticker Controls */}
            {activeSticker && (
              <div className="pt-2 border-t border-zinc-800 space-y-3 bg-zinc-800/20 p-2.5 rounded-2xl border border-zinc-800">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-zinc-200">
                    Selected Sticker
                  </span>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => onDeleteSticker(activeSticker.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </Button>
                </div>

                <Slider
                  label="Size"
                  min={20}
                  max={200}
                  step={2}
                  unit="px"
                  value={activeSticker.size}
                  onChange={(size) => onUpdateSticker(activeSticker.id, { size })}
                />

                <Slider
                  label="Rotation"
                  min={0}
                  max={360}
                  step={5}
                  unit="°"
                  value={activeSticker.rotation || 0}
                  onChange={(rotation) => onUpdateSticker(activeSticker.id, { rotation })}
                />
              </div>
            )}

            {/* Placed Stickers List */}
            {stickers.length > 0 && (
              <div className="pt-2 border-t border-zinc-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                    Placed Stickers ({stickers.length})
                  </span>
                  <button
                    type="button"
                    onClick={onClearStickers}
                    className="text-[10px] text-rose-400 hover:text-rose-300 font-semibold cursor-pointer"
                  >
                    Clear All
                  </button>
                </div>

                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {stickers.map((stk, i) => (
                    <div
                      key={stk.id}
                      onClick={() => onSelectSticker(stk.id)}
                      className={`flex items-center justify-between p-2 rounded-xl border transition-colors cursor-pointer ${
                        stk.id === activeStickerId
                          ? "bg-emerald-600/15 border-emerald-500/50 text-white"
                          : "bg-zinc-800/40 border-zinc-800 hover:bg-zinc-800/70 text-zinc-300"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        {stk.type === "emoji" ? (
                          <span className="text-base">{stk.content}</span>
                        ) : (
                          <img
                            src={stk.content}
                            alt="Sticker"
                            className="w-5 h-5 object-contain rounded"
                          />
                        )}
                        <span className="text-[11px] font-medium">
                          Sticker #{i + 1} ({Math.round(stk.size)}px)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteSticker(stk.id);
                        }}
                        className="text-zinc-500 hover:text-rose-400 p-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Accordion>

          {/* SECTION 3: Color Palette */}
          <Accordion
            id="colors"
            title="Color Themes"
            icon={<Palette className="w-4 h-4 text-amber-400" />}
            isOpen={activeSection === "colors"}
            onToggle={() => toggleSection("colors")}
          >
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">
                Accessible Schemes
              </label>
              <div className="grid grid-cols-2 gap-2">
                {COLOR_PRESETS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleColorPreset(p)}
                    className="flex items-center gap-2.5 p-2 bg-zinc-800/60 hover:bg-zinc-800 border border-zinc-700/60 rounded-xl hover:border-amber-500 transition-colors text-left text-zinc-200 font-medium cursor-pointer"
                  >
                    <span
                      className="w-4 h-4 rounded-md border border-white/20 flex-shrink-0"
                      style={{
                        backgroundColor: p.mat,
                        backgroundImage: `radial-gradient(${p.grid} 1px, transparent 1px)`,
                        backgroundSize: "4px 4px",
                      }}
                    />
                    <span className="truncate text-[11px]">{p.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-zinc-800">
              <ColorPicker
                label="Surface"
                value={props.matColor}
                onChange={(val) => updateProp("matColor", val)}
              />
              <ColorPicker
                label="Markings"
                value={props.gridColor}
                onChange={(val) => updateProp("gridColor", val)}
              />
            </div>
          </Accordion>

          {/* SECTION 4: Grid & Ticks */}
          <Accordion
            id="grid"
            title="Grid & Technical Ticks"
            icon={<GridIcon className="w-4 h-4 text-blue-400" />}
            isOpen={activeSection === "grid"}
            onToggle={() => toggleSection("grid")}
          >
            <Slider
              label="Grid Opacity"
              min={0.05}
              max={1.0}
              step={0.05}
              value={props.gridOpacity}
              onChange={(val) => updateProp("gridOpacity", val)}
              formatValue={(v) => `${Math.round(v * 100)}%`}
            />

            <Dropdown<number>
              label="Subdivisions (Mini Grid)"
              value={props.miniSubdivisions}
              onChange={(val) => updateProp("miniSubdivisions", val)}
              options={[
                { value: 1, label: "None (1:1 Major Grid Only)" },
                { value: 2, label: "2 Subdivisions (Halves)" },
                { value: 4, label: "4 Subdivisions (Quarters)" },
                { value: 5, label: "5 Subdivisions (Metric-friendly)" },
                { value: 8, label: "8 Subdivisions (Classic Imperial 1/8\")" },
                { value: 10, label: "10 Subdivisions (Standard Metric 1mm / 10px)" },
                { value: 16, label: "16 Subdivisions (Fine 1/16\")" },
                { value: 20, label: "20 Subdivisions (Dense 5px)" },
              ]}
            />

            <div className="pt-2 border-t border-zinc-800 space-y-2">
              <Switch
                label="Ticks Along Grid Lines"
                description="Draftsman cross-ticks across intersections"
                checked={props.tickMarksOnGrid}
                onChange={(checked) => updateProp("tickMarksOnGrid", checked)}
              />

              <Switch
                label="Label Background Containers"
                description="High-contrast badges behind numbers and words"
                checked={props.labelBackgrounds ?? true}
                onChange={(checked) => updateProp("labelBackgrounds", checked)}
              />
            </div>
          </Accordion>

          {/* SECTION 5: Protractor & Repeat Mode */}
          <Accordion
            id="protractor"
            title="Protractor & Repeat Modes"
            icon={<Compass className="w-4 h-4 text-purple-400" />}
            isOpen={activeSection === "protractor"}
            onToggle={() => toggleSection("protractor")}
          >
            <Switch
              label="Enable Protractor"
              description="Renders degree arcs with angle indicators"
              checked={props.showProtractor}
              onChange={(checked) => updateProp("showProtractor", checked)}
            />

            {props.showProtractor && (
              <>
                <Dropdown<ProtractorRepeatMode>
                  label="Protractor Repeat Layout"
                  value={props.protractorRepeatMode || "single"}
                  onChange={(mode) => updateProp("protractorRepeatMode", mode)}
                  options={[
                    { value: "single", label: "Single Origin" },
                    { value: "dual-bottom", label: "Dual Bottom Corners" },
                    { value: "four-corners", label: "4 Corners (All Quadrants)" },
                    { value: "dual-center", label: "Dual Center (Top & Bottom)" },
                    { value: "concentric-rings", label: "Multi-Ring Concentric Arcs" },
                  ]}
                />

                {(!props.protractorRepeatMode || props.protractorRepeatMode === "single" || props.protractorRepeatMode === "concentric-rings") && (
                  <Dropdown<CuttingMatProps["protractorPosition"]>
                    label="Origin Anchor Position"
                    value={props.protractorPosition}
                    onChange={(pos) => updateProp("protractorPosition", pos)}
                    options={[
                      { value: "bottom-center", label: "Bottom Center (Standard)" },
                      { value: "center", label: "Mat Center" },
                      { value: "bottom-left", label: "Bottom Left Corner" },
                      { value: "bottom-right", label: "Bottom Right Corner" },
                    ]}
                  />
                )}

                {/* Safe Clamped Radius Slider */}
                <Slider
                  label={`Radius (${props.unit})`}
                  min={props.unit === "px" ? 50 : 1}
                  max={roundedMaxProtractor}
                  step={props.unit === "px" ? 10 : 0.5}
                  unit={props.unit}
                  value={Math.min(props.protractorRadius, roundedMaxProtractor)}
                  onChange={(val) => updateProp("protractorRadius", val)}
                />
              </>
            )}

            <div className="border-t border-zinc-800 pt-2">
              <Switch
                label="Diagonal Guidelines"
                description="Renders 30°, 45°, and 60° dashed rays"
                checked={props.showDiagonals}
                onChange={(checked) => updateProp("showDiagonals", checked)}
              />
            </div>
          </Accordion>

          {/* SECTION 6: Branding & Typography */}
          <Accordion
            id="branding"
            title="Branding & 10 Fonts"
            icon={<Type className="w-4 h-4 text-pink-400" />}
            isOpen={activeSection === "branding"}
            onToggle={() => toggleSection("branding")}
          >
            <Switch
              label="Enable Branding Label"
              description="Displays brand text badge and mat specifications"
              checked={props.showBranding ?? true}
              onChange={(checked) => updateProp("showBranding", checked)}
            />

            {props.showBranding && (
              <>
                <Input
                  label="Brand Label"
                  type="text"
                  placeholder="Enter brand name..."
                  value={props.brandingText}
                  onChange={(e) => updateProp("brandingText", e.target.value)}
                />

                <Dropdown<string>
                  label="Font Family (10 Options)"
                  value={props.brandingFont}
                  onChange={(font) => updateProp("brandingFont", font)}
                  options={FONT_OPTIONS.map((f) => ({ value: f.id, label: f.name }))}
                />

                <div className="grid grid-cols-2 gap-3">
                  <Dropdown<CuttingMatProps["brandingPosition"]>
                    label="Position"
                    value={props.brandingPosition}
                    onChange={(pos) => updateProp("brandingPosition", pos)}
                    options={[
                      { value: "bottom-right", label: "Bottom Right" },
                      { value: "top-left", label: "Top Left" },
                      { value: "top-right", label: "Top Right" },
                      { value: "bottom-left", label: "Bottom Left" },
                      { value: "center", label: "Center" },
                    ]}
                  />

                  <NumberInput
                    label="Scale Multiplier"
                    min={0.3}
                    max={4.0}
                    step={0.1}
                    value={props.brandingSize}
                    onChange={(size) => updateProp("brandingSize", size)}
                  />
                </div>

                <Slider
                  label="Branding Opacity"
                  min={0.1}
                  max={1.0}
                  step={0.05}
                  value={props.brandingOpacity}
                  onChange={(val) => updateProp("brandingOpacity", val)}
                  formatValue={(v) => `${Math.round(v * 100)}%`}
                />
              </>
            )}
          </Accordion>

          {/* SECTION 7: High Resolution Exports */}
          <Accordion
            id="exports"
            title="Export Studio"
            icon={<Download className="w-4 h-4 text-indigo-400" />}
            isOpen={activeSection === "exports"}
            onToggle={() => toggleSection("exports")}
          >
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Export vector SVG or high-res print raster formats (PNG, JPG, real-scale PDF).
            </p>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <Button variant="outline" onClick={() => onExport("svg")}>
                SVG Vector
              </Button>
              <Button variant="primary" onClick={() => onExport("png")}>
                PNG (300 DPI)
              </Button>
              <Button variant="secondary" onClick={() => onExport("jpg")}>
                JPG Image
              </Button>
              <Button variant="danger" onClick={() => onExport("pdf")}>
                PDF Document
              </Button>
            </div>
          </Accordion>
        </div>

        {/* Sidebar Footer with Author & GitHub Links */}
        <div className="p-3 border-t border-zinc-800/80 bg-zinc-950/70 text-[10px] text-zinc-400 flex items-center justify-between">
          <span>
            Crafted by{" "}
            <a
              href="https://nischal.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-200 hover:text-emerald-400 font-semibold underline underline-offset-2 transition-colors"
            >
              Nischal
            </a>
          </span>
          <a
            href="https://github.com/nischalmudennavar/cutting-mat-designer"
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-400 hover:text-white transition-colors"
          >
            GitHub
          </a>
        </div>
      </div>
    </>
  );
}
