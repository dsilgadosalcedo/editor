"use client";

import React, { useState, useRef, useEffect } from "react";
import { X, Move, Pipette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

// Import services
import {
  parseColorToHsva,
  formatColor,
  supportsAlpha,
  type ColorFormat,
  type HSVAColor,
} from "../services/color-utils";
import {
  createSaturationHandlers,
  createHueHandlers,
  createAlphaHandlers,
  createPickerDragHandlers,
  handleEyeDropper,
  createThrottledUpdate,
} from "../services/color-picker-interactions";

interface CustomColorPickerProps {
  isOpen: boolean;
  onClose: () => void;
  color: string;
  onChange: (color: string) => void;
  position: { x: number; y: number };
  isTransitioning?: boolean;
  layerName?: string;
  propertyName?: string;
}

const CustomColorPicker: React.FC<CustomColorPickerProps> = ({
  isOpen,
  onClose,
  color,
  onChange,
  position,
  isTransitioning = false,
  layerName,
  propertyName,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [pickerPosition, setPickerPosition] = useState(position);

  // Update picker position when position prop changes
  useEffect(() => {
    setPickerPosition(position);
  }, [position]);

  const [hue, setHue] = useState(0);
  const [saturation, setSaturation] = useState(100);
  const [value, setValue] = useState(100);
  const [alpha, setAlpha] = useState(1);
  const [isDraggingSaturation, setIsDraggingSaturation] = useState(false);
  const [isDraggingHue, setIsDraggingHue] = useState(false);
  const [isDraggingAlpha, setIsDraggingAlpha] = useState(false);
  const [isInternalUpdate, setIsInternalUpdate] = useState(false);
  const [colorFormat, setColorFormat] = useState<ColorFormat>("hex");
  const [lastUpdateTime, setLastUpdateTime] = useState(0);

  const pickerRef = useRef<HTMLDivElement>(null);
  const saturationRef = useRef<HTMLDivElement>(null);
  const hueRef = useRef<HTMLDivElement>(null);
  const alphaRef = useRef<HTMLDivElement>(null);
  const updateTimeoutRef = useRef<number | null>(null);

  // Parse incoming color and update internal state
  useEffect(() => {
    if (isInternalUpdate) {
      setIsInternalUpdate(false);
      return;
    }

    const hsva = parseColorToHsva(color);
    setHue(hsva.h);
    setSaturation(hsva.s);
    setValue(hsva.v);
    setAlpha(hsva.a);
  }, [color, isInternalUpdate]);

  // Throttled update function
  const throttledOnChange = createThrottledUpdate(onChange, 16);

  // Update color output when HSVA changes
  const updateColor = (h: number, s: number, v: number, a: number) => {
    const formattedColor = formatColor(h, s, v, a, colorFormat);
    setIsInternalUpdate(true);
    throttledOnChange(formattedColor);
  };

  // Handle saturation/value changes
  const handleSaturationChange = (newSaturation: number, newValue: number) => {
    setSaturation(newSaturation);
    setValue(newValue);
    updateColor(hue, newSaturation, newValue, alpha);
  };

  // Handle hue changes
  const handleHueChange = (newHue: number) => {
    setHue(newHue);
    updateColor(newHue, saturation, value, alpha);
  };

  // Handle alpha changes
  const handleAlphaChange = (newAlpha: number) => {
    setAlpha(newAlpha);
    updateColor(hue, saturation, value, newAlpha);
  };

  // Handle picker position changes
  const handlePositionChange = (x: number, y: number) => {
    setPickerPosition({ x, y });
  };

  // Handle eyedropper
  const handleEyeDropperClick = async () => {
    await handleEyeDropper((pickedColor) => {
      onChange(pickedColor);
    });
  };

  // Create event handlers using services
  const saturationHandlers = createSaturationHandlers(
    saturationRef,
    handleSaturationChange,
    setIsDraggingSaturation
  );

  const hueHandlers = createHueHandlers(
    hueRef,
    handleHueChange,
    setIsDraggingHue
  );

  const alphaHandlers = createAlphaHandlers(
    alphaRef,
    handleAlphaChange,
    setIsDraggingAlpha
  );

  const pickerDragHandlers = createPickerDragHandlers(
    pickerRef,
    handlePositionChange,
    setIsDragging,
    setDragOffset
  );

  // Determine if alpha should be shown
  const shouldShowAlpha = supportsAlpha(colorFormat);

  // Current color for preview
  const currentColor = formatColor(hue, saturation, value, alpha, colorFormat);

  // Header text logic
  const getHeaderText = () => {
    if (layerName && propertyName) {
      return `${layerName} • ${propertyName}`;
    } else if (layerName) {
      return layerName;
    } else if (propertyName) {
      return propertyName;
    }
    return "Color Picker";
  };

  return (
    <div
      ref={pickerRef}
      data-color-picker
      className={`fixed z-50 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 ${
        isTransitioning ? "transition-all duration-300 ease-out" : ""
      }`}
      style={{
        left: pickerPosition.x,
        top: pickerPosition.y,
        cursor: isDragging ? "grabbing" : "default",
        width: "300px",
      }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {/* Header with drag handle */}
      <header
        className="flex items-center justify-between cursor-grab active:cursor-grabbing p-4 select-none"
        onMouseDown={pickerDragHandlers.handleMouseDown}
        style={{ userSelect: "none" }}
      >
        <div
          className="flex items-center gap-2 cursor-grab active:cursor-grabbing flex-1 select-none"
          onMouseDown={pickerDragHandlers.handleMouseDown}
          style={{ userSelect: "none" }}
        >
          <Move
            className="w-4 h-4 text-gray-500 cursor-grab pointer-events-none"
            style={{ userSelect: "none" }}
          />
          <span
            className="cursor-grab text-sm font-medium text-gray-700 dark:text-gray-300 pointer-events-none"
            style={{ userSelect: "none" }}
          >
            {getHeaderText()}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleEyeDropperClick}
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            title="Pick color from screen"
            className="h-6 w-6"
          >
            <Pipette className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            className="h-6 w-6"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </header>

      <section className="p-4 pt-0">
        {/* Main color picker area */}
        <div className="mb-4">
          {/* Saturation/Value picker */}
          <div
            ref={saturationRef}
            className="relative w-full h-36 mb-3 cursor-crosshair rounded-lg overflow-hidden"
            style={{
              background: `
              linear-gradient(to top, #000, transparent),
              linear-gradient(to right, #fff, hsl(${hue}, 100%, 50%))
            `,
            }}
            onMouseDown={saturationHandlers.handleMouseDown}
          >
            <div
              className="absolute w-3 h-3 border-2 border-white rounded-full shadow-lg transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
              style={{
                left: `${saturation}%`,
                top: `${100 - value}%`,
              }}
            />
          </div>

          {/* Hue picker */}
          <div
            ref={hueRef}
            className="relative w-full h-4 rounded-lg cursor-ew-resize"
            style={{
              background: `linear-gradient(to right, 
              hsl(0, 100%, 50%) 0%,
              hsl(60, 100%, 50%) 16.66%,
              hsl(120, 100%, 50%) 33.33%,
              hsl(180, 100%, 50%) 50%,
              hsl(240, 100%, 50%) 66.66%,
              hsl(300, 100%, 50%) 83.33%,
              hsl(360, 100%, 50%) 100%)`,
            }}
            onMouseDown={hueHandlers.handleMouseDown}
          >
            {/* Hue indicator */}
            <div
              className="absolute w-3 h-6 bg-white border border-gray-300 rounded transform -translate-x-1/2 -translate-y-1/2 pointer-events-none shadow-lg"
              style={{
                left: `${(hue / 360) * 100}%`,
                top: "50%",
              }}
            />
          </div>
        </div>

        {/* Alpha slider - only show for formats that support alpha */}
        {shouldShowAlpha && (
          <div className="mb-4">
            <Label className="text-xs text-gray-500 dark:text-gray-400 mb-2 block">
              Alpha: {Math.round(alpha * 100)}%
            </Label>
            <div
              ref={alphaRef}
              className="relative w-full h-4 rounded-lg cursor-ew-resize overflow-hidden"
              style={{
                background: `linear-gradient(to right, 
                transparent 0%, 
                hsl(${hue}, ${saturation}%, ${value / 2}%) 100%),
                repeating-conic-gradient(#ccc 0% 25%, transparent 0% 50%) 50% / 8px 8px`,
              }}
              onMouseDown={alphaHandlers.handleMouseDown}
            >
              {/* Alpha indicator */}
              <div
                className="absolute w-3 h-6 bg-white border border-gray-300 rounded transform -translate-x-1/2 -translate-y-1/2 pointer-events-none shadow-lg"
                style={{
                  left: `${alpha * 100}%`,
                  top: "50%",
                }}
              />
            </div>
          </div>
        )}

        {/* Format selector */}
        <div className="mb-4">
          <Label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">
            Format
          </Label>
          <Select
            value={colorFormat}
            onValueChange={(newFormat: ColorFormat) => {
              setColorFormat(newFormat);
              const newColor = formatColor(
                hue,
                saturation,
                value,
                alpha,
                newFormat
              );
              setIsInternalUpdate(true);
              onChange(newColor);
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hex">Hex</SelectItem>
              <SelectItem value="rgb">RGB</SelectItem>
              <SelectItem value="rgba">RGBA</SelectItem>
              <SelectItem value="hsl">HSL</SelectItem>
              <SelectItem value="hsla">HSLA</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Color preview and value */}
        <div className="flex gap-2">
          <div
            className="w-12 h-9 rounded-md border relative overflow-hidden"
            style={{
              backgroundColor: currentColor,
              backgroundImage:
                alpha < 1
                  ? "repeating-conic-gradient(#ccc 0% 25%, transparent 0% 50%) 50% / 10px 10px"
                  : "none",
            }}
          />
          <Input
            type="text"
            value={currentColor}
            onChange={(e) => {
              onChange(e.target.value);
            }}
            className="flex-1 font-mono text-sm"
            placeholder="Color value"
          />
        </div>
      </section>
    </div>
  );
};

export default CustomColorPicker;
