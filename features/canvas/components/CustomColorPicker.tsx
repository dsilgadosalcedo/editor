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

interface CustomColorPickerProps {
  isOpen: boolean;
  onClose: () => void;
  color: string;
  onChange: (color: string) => void;
  position: { x: number; y: number };
  isTransitioning?: boolean;
}

type ColorFormat = "hex" | "rgb" | "rgba" | "hsl" | "hsla";

const CustomColorPicker: React.FC<CustomColorPickerProps> = ({
  isOpen,
  onClose,
  color,
  onChange,
  position,
  isTransitioning = false,
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
  const [value, setValue] = useState(100); // Using HSV instead of HSL
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

  // Parse color from any format to HSVA
  const parseColorToHsva = (colorStr: string) => {
    const trimmed = colorStr.trim().toLowerCase();

    // Hex format
    if (trimmed.startsWith("#")) {
      return hexToHsva(trimmed);
    }

    // RGB/RGBA format
    if (trimmed.startsWith("rgb")) {
      return rgbToHsva(trimmed);
    }

    // HSL/HSLA format
    if (trimmed.startsWith("hsl")) {
      return hslToHsva(trimmed);
    }

    // Fallback to hex parsing
    return hexToHsva(trimmed.startsWith("#") ? trimmed : `#${trimmed}`);
  };

  // Convert hex to HSVA
  const hexToHsva = (hex: string) => {
    let r = 0,
      g = 0,
      b = 0,
      a = 1;

    if (hex.length === 4) {
      r = parseInt(hex[1] + hex[1], 16) / 255;
      g = parseInt(hex[2] + hex[2], 16) / 255;
      b = parseInt(hex[3] + hex[3], 16) / 255;
    } else if (hex.length === 7) {
      r = parseInt(hex.slice(1, 3), 16) / 255;
      g = parseInt(hex.slice(3, 5), 16) / 255;
      b = parseInt(hex.slice(5, 7), 16) / 255;
    } else if (hex.length === 9) {
      r = parseInt(hex.slice(1, 3), 16) / 255;
      g = parseInt(hex.slice(3, 5), 16) / 255;
      b = parseInt(hex.slice(5, 7), 16) / 255;
      a = parseInt(hex.slice(7, 9), 16) / 255;
    }

    return rgbToHsva(
      `rgb(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(
        b * 255
      )})`,
      a
    );
  };

  // Convert RGB string to HSVA with improved dark zone handling
  const rgbToHsva = (rgbStr: string, alphaValue?: number) => {
    const match = rgbStr.match(/rgba?\(([^)]+)\)/);
    if (!match) return { h: 0, s: 0, v: 0, a: 1 };

    const values = match[1].split(",").map((v) => parseFloat(v.trim()));
    const r = Math.max(0, Math.min(255, values[0])) / 255;
    const g = Math.max(0, Math.min(255, values[1])) / 255;
    const b = Math.max(0, Math.min(255, values[2])) / 255;
    const a =
      alphaValue !== undefined
        ? alphaValue
        : values[3] !== undefined
        ? Math.max(0, Math.min(1, values[3]))
        : 1;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const delta = max - min;

    let h = 0;
    if (delta > 0.001) {
      // Use threshold to avoid precision issues
      if (max === r) {
        h = ((g - b) / delta) % 6;
      } else if (max === g) {
        h = (b - r) / delta + 2;
      } else {
        h = (r - g) / delta + 4;
      }
      h = h * 60;
      if (h < 0) h += 360;
    }

    // Improved saturation and value calculations
    const s = max < 0.001 ? 0 : (delta / max) * 100;
    const v = max * 100;

    return {
      h: Math.round(h * 10) / 10,
      s: Math.round(s * 10) / 10,
      v: Math.round(v * 10) / 10,
      a: Math.round(a * 100) / 100,
    };
  };

  // Convert HSL string to HSVA
  const hslToHsva = (hslStr: string) => {
    const match = hslStr.match(/hsla?\(([^)]+)\)/);
    if (!match) return { h: 0, s: 0, v: 0, a: 1 };

    const values = match[1].split(",").map((v) => parseFloat(v.trim()));
    const h = values[0];
    const s = values[1];
    const l = values[2];
    const a = values[3] !== undefined ? values[3] : 1;

    // Convert HSL to HSV
    const v = l + (s * Math.min(l, 100 - l)) / 100;
    const sNew = v === 0 ? 0 : 200 * (1 - l / v);

    return { h, s: sNew, v, a };
  };

  // Convert HSVA to RGBA with improved precision for dark zones
  const hsvaToRgba = (h: number, s: number, v: number, a: number = 1) => {
    // Normalize inputs
    s = Math.max(0, Math.min(100, s)) / 100;
    v = Math.max(0, Math.min(100, v)) / 100;
    h = ((h % 360) + 360) % 360; // Ensure hue is between 0-360

    // Handle edge cases for dark zones
    if (v === 0) {
      return { r: 0, g: 0, b: 0, a };
    }

    if (s === 0) {
      const gray = Math.round(v * 255);
      return { r: gray, g: gray, b: gray, a };
    }

    const c = v * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = v - c;

    let r = 0,
      g = 0,
      b = 0;

    // Use more precise boundaries
    const hueSegment = Math.floor(h / 60);
    switch (hueSegment) {
      case 0:
        r = c;
        g = x;
        b = 0;
        break;
      case 1:
        r = x;
        g = c;
        b = 0;
        break;
      case 2:
        r = 0;
        g = c;
        b = x;
        break;
      case 3:
        r = 0;
        g = x;
        b = c;
        break;
      case 4:
        r = x;
        g = 0;
        b = c;
        break;
      case 5:
        r = c;
        g = 0;
        b = x;
        break;
      default:
        r = c;
        g = x;
        b = 0;
        break;
    }

    // Apply more precise rounding for dark values
    const finalR = Math.max(0, Math.min(255, Math.round((r + m) * 255)));
    const finalG = Math.max(0, Math.min(255, Math.round((g + m) * 255)));
    const finalB = Math.max(0, Math.min(255, Math.round((b + m) * 255)));

    return { r: finalR, g: finalG, b: finalB, a };
  };

  // Convert HSVA to HSL
  const hsvaToHsl = (h: number, s: number, v: number) => {
    s /= 100;
    v /= 100;

    const l = (v * (2 - s)) / 2;
    const sNew = l === 0 || l === 1 ? 0 : (v - l) / Math.min(l, 1 - l);

    return {
      h: Math.round(h),
      s: Math.round(sNew * 100),
      l: Math.round(l * 100),
    };
  };

  // Format color based on selected format
  const formatColor = (h: number, s: number, v: number, a: number) => {
    const rgba = hsvaToRgba(h, s, v, a);

    switch (colorFormat) {
      case "hex":
        if (a < 1) {
          const alphaHex = Math.round(a * 255)
            .toString(16)
            .padStart(2, "0");
          return `#${rgba.r.toString(16).padStart(2, "0")}${rgba.g
            .toString(16)
            .padStart(2, "0")}${rgba.b
            .toString(16)
            .padStart(2, "0")}${alphaHex}`;
        }
        return `#${rgba.r.toString(16).padStart(2, "0")}${rgba.g
          .toString(16)
          .padStart(2, "0")}${rgba.b.toString(16).padStart(2, "0")}`;

      case "rgb":
        return `rgb(${rgba.r}, ${rgba.g}, ${rgba.b})`;

      case "rgba":
        return `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${a.toFixed(2)})`;

      case "hsl":
        const hsl = hsvaToHsl(h, s, v);
        return `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;

      case "hsla":
        const hsla = hsvaToHsl(h, s, v);
        return `hsla(${hsla.h}, ${hsla.s}%, ${hsla.l}%, ${a.toFixed(2)})`;

      default:
        return `#${rgba.r.toString(16).padStart(2, "0")}${rgba.g
          .toString(16)
          .padStart(2, "0")}${rgba.b.toString(16).padStart(2, "0")}`;
    }
  };

  // Eyedropper functionality
  const handleEyeDropper = async () => {
    if (!("EyeDropper" in window)) {
      alert(
        "EyeDropper API is not supported in this browser. Please use Chrome 95+ or Edge 95+"
      );
      return;
    }

    try {
      // @ts-ignore - EyeDropper is not in TypeScript types yet
      const eyeDropper = new EyeDropper();
      const result = await eyeDropper.open();
      if (result.sRGBHex) {
        onChange(result.sRGBHex);
      }
    } catch (error) {
      // User cancelled or other error
      console.log("EyeDropper cancelled or failed:", error);
    }
  };

  // Initialize HSVA from current color
  useEffect(() => {
    if (!isInternalUpdate) {
      const hsva = parseColorToHsva(color);
      setHue(hsva.h);
      setSaturation(hsva.s);
      setValue(hsva.v);
      setAlpha(hsva.a);
    }
    setIsInternalUpdate(false);
  }, [color, isInternalUpdate]);

  // Update position when prop changes
  useEffect(() => {
    setPickerPosition(position);
  }, [position]);

  // Cleanup animation frames on unmount
  useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) {
        cancelAnimationFrame(updateTimeoutRef.current);
      }
    };
  }, []);

  // Handle dragging the entire picker
  const handleMouseDown = (e: React.MouseEvent) => {
    if (pickerRef.current && e.target === e.currentTarget) {
      e.preventDefault();
      setDragOffset({
        x: e.clientX - pickerPosition.x,
        y: e.clientY - pickerPosition.y,
      });
      setIsDragging(true);
    }
  };

  // Handle saturation/value picker
  const handleSaturationMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingSaturation(true);
    updateSaturationFromMouse(e);
  };

  const updateSaturationFromMouse = (e: React.MouseEvent | MouseEvent) => {
    if (saturationRef.current) {
      const rect = saturationRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
      const y = Math.max(0, Math.min(rect.height, e.clientY - rect.top));

      // Calculate new values with improved precision
      let newSaturation = (x / rect.width) * 100;
      let newValue = 100 - (y / rect.height) * 100;

      // Apply threshold-based smoothing for dark zones to prevent jumping
      const now = Date.now();
      const timeSinceLastUpdate = now - lastUpdateTime;

      // Dynamic threshold based on value (darker = higher threshold)
      const dynamicThreshold = newValue < 10 ? 2 : newValue < 30 ? 1 : 0.5;

      // Skip micro-movements and enforce minimum time between updates
      if (
        timeSinceLastUpdate < 16 && // ~60fps throttling
        Math.abs(newSaturation - saturation) < dynamicThreshold &&
        Math.abs(newValue - value) < dynamicThreshold
      ) {
        return;
      }

      setLastUpdateTime(now);

      // Round values appropriately based on value range
      if (newValue < 10) {
        // In very dark zones, use coarser granularity
        newSaturation = Math.round(newSaturation / 2) * 2;
        newValue = Math.round(newValue / 2) * 2;
      } else if (newValue < 30) {
        // In dark zones, use medium granularity
        newSaturation = Math.round(newSaturation);
        newValue = Math.round(newValue);
      } else {
        // In normal zones, use fine granularity
        newSaturation = Math.round(newSaturation * 10) / 10;
        newValue = Math.round(newValue * 10) / 10;
      }

      // Clamp values
      newSaturation = Math.max(0, Math.min(100, newSaturation));
      newValue = Math.max(0, Math.min(100, newValue));

      // Update immediately for visual feedback
      setSaturation(newSaturation);
      setValue(newValue);

      // Debounce the onChange callback to prevent excessive calls
      if (updateTimeoutRef.current) {
        cancelAnimationFrame(updateTimeoutRef.current);
      }

      updateTimeoutRef.current = requestAnimationFrame(() => {
        setIsInternalUpdate(true);
        onChange(formatColor(hue, newSaturation, newValue, alpha));
        updateTimeoutRef.current = null;
      });
    }
  };

  // Handle hue picker
  const handleHueMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingHue(true);
    updateHueFromMouse(e);
  };

  const updateHueFromMouse = (e: React.MouseEvent | MouseEvent) => {
    if (hueRef.current) {
      const rect = hueRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
      const newHue = Math.min(
        359,
        Math.round((x / rect.width) * 360 * 10) / 10
      ); // Ensure hue stays within 0-359

      // Update immediately for visual feedback
      setHue(newHue);

      // Debounce the onChange callback
      if (updateTimeoutRef.current) {
        cancelAnimationFrame(updateTimeoutRef.current);
      }

      updateTimeoutRef.current = requestAnimationFrame(() => {
        setIsInternalUpdate(true);
        onChange(formatColor(newHue, saturation, value, alpha));
        updateTimeoutRef.current = null;
      });
    }
  };

  // Handle alpha picker
  const handleAlphaMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingAlpha(true);
    updateAlphaFromMouse(e);
  };

  const updateAlphaFromMouse = (e: React.MouseEvent | MouseEvent) => {
    if (alphaRef.current) {
      const rect = alphaRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
      const newAlpha = Math.round((x / rect.width) * 100) / 100; // Round to 2 decimal places

      // Update immediately for visual feedback
      setAlpha(newAlpha);

      // Debounce the onChange callback
      if (updateTimeoutRef.current) {
        cancelAnimationFrame(updateTimeoutRef.current);
      }

      updateTimeoutRef.current = requestAnimationFrame(() => {
        setIsInternalUpdate(true);
        onChange(formatColor(hue, saturation, value, newAlpha));
        updateTimeoutRef.current = null;
      });
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      if (isDragging) {
        setPickerPosition({
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y,
        });
      } else if (isDraggingSaturation) {
        updateSaturationFromMouse(e);
      } else if (isDraggingHue) {
        updateHueFromMouse(e);
      } else if (isDraggingAlpha) {
        updateAlphaFromMouse(e);
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      e.preventDefault();
      setIsDragging(false);
      setIsDraggingSaturation(false);
      setIsDraggingHue(false);
      setIsDraggingAlpha(false);
    };

    if (
      isDragging ||
      isDraggingSaturation ||
      isDraggingHue ||
      isDraggingAlpha
    ) {
      document.addEventListener("mousemove", handleMouseMove, {
        passive: false,
      });
      document.addEventListener("mouseup", handleMouseUp, { passive: false });
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [
    isDragging,
    isDraggingSaturation,
    isDraggingHue,
    isDraggingAlpha,
    dragOffset,
    hue,
    saturation,
    value,
    alpha,
  ]);

  if (!isOpen) return null;

  const currentColor = formatColor(hue, saturation, value, alpha);
  const shouldShowAlpha =
    colorFormat === "rgba" || colorFormat === "hsla" || colorFormat === "hex";

  return (
    <div
      ref={pickerRef}
      data-color-picker
      className={`fixed z-50 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-4 ${
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
      <div
        className="flex items-center justify-between mb-4 cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center gap-2">
          <Move className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Color Picker
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleEyeDropper}
            title="Pick color from screen"
            className="h-6 w-6"
          >
            <Pipette className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-6 w-6"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

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
          onMouseDown={handleSaturationMouseDown}
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
          onMouseDown={handleHueMouseDown}
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
            onMouseDown={handleAlphaMouseDown}
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
            onChange(formatColor(hue, saturation, value, alpha));
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
    </div>
  );
};

export default CustomColorPicker;
