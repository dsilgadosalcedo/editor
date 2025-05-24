"use client";

import React, { useState, useRef, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface OpacityPickerProps {
  isOpen: boolean;
  onClose: () => void;
  color: string;
  onChange: (color: string) => void;
  position: { x: number; y: number };
  isTransitioning?: boolean;
}

const OpacityPicker: React.FC<OpacityPickerProps> = ({
  isOpen,
  onClose,
  color,
  onChange,
  position,
  isTransitioning = false,
}) => {
  const [alpha, setAlpha] = useState(1);
  const [isDraggingAlpha, setIsDraggingAlpha] = useState(false);
  const [pickerPosition, setPickerPosition] = useState(position);

  const alphaRef = useRef<HTMLDivElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);

  // Parse alpha from color string
  const parseAlphaFromColor = (colorStr: string): number => {
    const trimmed = colorStr.trim().toLowerCase();

    if (trimmed.startsWith("rgba")) {
      const match = trimmed.match(/rgba\([^,]+,[^,]+,[^,]+,\s*([\d.]+)\)/);
      return match ? parseFloat(match[1]) : 1;
    } else if (trimmed.startsWith("hsla")) {
      const match = trimmed.match(/hsla\([^,]+,[^,]+,[^,]+,\s*([\d.]+)\)/);
      return match ? parseFloat(match[1]) : 1;
    } else if (trimmed.startsWith("#") && trimmed.length === 9) {
      return parseInt(trimmed.slice(7, 9), 16) / 255;
    }

    return 1;
  };

  // Convert color to hex with alpha
  const updateColorWithAlpha = (newAlpha: number): string => {
    const trimmed = color.trim().toLowerCase();

    // Convert any color format to hex with alpha
    let hex = color;
    if (trimmed.startsWith("rgb")) {
      const match = trimmed.match(/rgba?\(([^)]+)\)/);
      if (match) {
        const values = match[1].split(",").map((v) => parseInt(v.trim()));
        hex = `#${values[0].toString(16).padStart(2, "0")}${values[1]
          .toString(16)
          .padStart(2, "0")}${values[2].toString(16).padStart(2, "0")}`;
      }
    } else if (trimmed.startsWith("hsl")) {
      // For simplicity, we'll keep the original format but this could be improved
      return color;
    }

    // Remove existing alpha if present
    if (hex.length === 9) {
      hex = hex.slice(0, 7);
    }

    // Add new alpha
    if (newAlpha < 1) {
      const alphaHex = Math.round(newAlpha * 255)
        .toString(16)
        .padStart(2, "0");
      return `${hex}${alphaHex}`;
    }

    return hex;
  };

  // Update picker position when position prop changes
  useEffect(() => {
    setPickerPosition(position);
  }, [position]);

  // Initialize alpha from current color
  useEffect(() => {
    const newAlpha = parseAlphaFromColor(color);
    setAlpha(newAlpha);
  }, [color]);

  // Handle alpha slider
  const handleAlphaMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDraggingAlpha(true);
    updateAlphaFromMouse(e);
  };

  const updateAlphaFromMouse = (e: React.MouseEvent | MouseEvent) => {
    if (alphaRef.current) {
      const rect = alphaRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
      const newAlpha = x / rect.width;

      setAlpha(newAlpha);
      onChange(updateColorWithAlpha(newAlpha));
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingAlpha) {
        updateAlphaFromMouse(e);
      }
    };

    const handleMouseUp = () => {
      setIsDraggingAlpha(false);
    };

    if (isDraggingAlpha) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDraggingAlpha]);

  if (!isOpen) return null;

  // Extract base color without alpha for the gradient
  const baseColor =
    color.startsWith("#") && color.length > 7 ? color.slice(0, 7) : color;

  return (
    <div
      ref={pickerRef}
      data-color-picker
      className={`fixed z-50 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-3 ${
        isTransitioning ? "transition-all duration-300 ease-out" : ""
      }`}
      style={{
        left: pickerPosition.x,
        top: pickerPosition.y,
        width: "200px",
      }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <Label className="text-xs text-gray-500 dark:text-gray-400">
          Opacity: {Math.round(alpha * 100)}%
        </Label>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-5 w-5"
        >
          <X className="w-3 h-3" />
        </Button>
      </div>

      {/* Alpha slider */}
      <div
        ref={alphaRef}
        className="relative w-full h-4 rounded cursor-ew-resize"
        style={{
          background: `linear-gradient(to right, 
            transparent 0%, 
            ${baseColor} 100%),
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
  );
};

export default OpacityPicker;
