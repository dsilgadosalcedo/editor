import React, { useState, useEffect, useRef } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { useCanvasStore } from "../store/useCanvasStore";
import { Button } from "@/components/ui/button";
import { useColorPicker } from "./ColorPicker";

interface ElementFloatingToolbarProps {
  elementId: string;
  elementType: "rectangle" | "text" | "image" | "frame";
  elementColor: string;
  position: { x: number; y: number };
  zoom: number;
  isRotating?: boolean;
}

const ElementFloatingToolbar: React.FC<ElementFloatingToolbarProps> = ({
  elementId,
  elementType,
  elementColor,
  position,
  zoom,
  isRotating = false,
}) => {
  const { moveElementUp, moveElementDown, updateFillColor } = useCanvasStore();
  const { openColorPicker } = useColorPicker();

  const handleMoveUp = (e: React.MouseEvent) => {
    e.stopPropagation();
    moveElementUp(elementId);
  };

  const handleMoveDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    moveElementDown(elementId);
  };

  const handleColorClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    // Account for the toolbar scaling and position
    const scaledOffset = 52 * (100 / zoom); // Account for toolbar scaling
    const scaledYOffset = (24 + 8 + 2 + 2 + 16) * (100 / zoom);

    const colorPickerWidth = 280;
    const colorPickerHeight = 360;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Calculate initial position
    let x = position.x + scaledOffset;
    let y = position.y - scaledYOffset + 30;

    // Adjust if off-screen horizontally
    if (x + colorPickerWidth > viewportWidth) {
      x = position.x - colorPickerWidth;
    }

    // Adjust if off-screen vertically
    if (y + colorPickerHeight > viewportHeight) {
      y = position.y - scaledYOffset - colorPickerHeight - 8;
    }

    const handleColorChange = (newColor: string) => {
      updateFillColor(elementId, newColor);
    };

    openColorPicker(elementColor, handleColorChange, { x, y });
  };

  // Apply inverse scaling to keep toolbar at consistent size regardless of zoom
  const toolbarScale = 1 / (zoom / 100);
  // Scale the offset distance to maintain consistent visual spacing
  // 24 is the height of the toolbar, 8 is the padding, 2+2=4 is the borders
  const baseYOffset = (24 + 8 + 2 + 2 + 16) * (100 / zoom);
  // Add extra offset when rotating to avoid overlapping with rotation indicator
  const rotationExtraOffset = isRotating ? 20 * (100 / zoom) : 0;
  const scaledYOffset = baseYOffset + rotationExtraOffset;

  return (
    <div
      className="absolute pointer-events-auto z-50 transition-all duration-200 ease-out"
      style={{
        left: position.x,
        top: position.y - scaledYOffset,
        transform: `scale(${toolbarScale}) translate(-50%, 0)`,
        transformOrigin: "top left",
      }}
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
    >
      <div
        className="bg-card/80 backdrop-blur-sm rounded-lg shadow-lg border flex items-center gap-1 p-1"
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Move Up Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleMoveUp}
          title="Move up one layer"
          aria-label="Move element up one layer"
          className="h-6 w-6"
        >
          <ChevronUp className="w-4 h-4" />
        </Button>

        {/* Move Down Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleMoveDown}
          title="Move down one layer"
          aria-label="Move element down one layer"
          className="h-6 w-6"
        >
          <ChevronDown className="w-4 h-4" />
        </Button>

        {/* Color Picker */}
        {(elementType === "rectangle" || elementType === "text") && (
          <Button
            variant="ghost"
            size="icon"
            data-color-picker-trigger
            onClick={handleColorClick}
            title={elementType === "text" ? "Text color" : "Background color"}
            aria-label={`Change ${
              elementType === "text" ? "text" : "background"
            } color`}
            className="h-6 w-6"
          >
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: elementColor }}
            />
          </Button>
        )}
      </div>
    </div>
  );
};

export default ElementFloatingToolbar;
