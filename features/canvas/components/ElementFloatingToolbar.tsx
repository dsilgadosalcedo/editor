import React, { useState, useEffect, useRef } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { useCanvasStore } from "../store/useCanvasStore";
import { Button } from "@/components/ui/button";

interface ElementFloatingToolbarProps {
  elementId: string;
  elementType: "rectangle" | "text" | "image";
  elementColor: string;
  position: { x: number; y: number };
  zoom: number;
}

const ElementFloatingToolbar: React.FC<ElementFloatingToolbarProps> = ({
  elementId,
  elementType,
  elementColor,
  position,
  zoom,
}) => {
  const { moveElementUp, moveElementDown, updateFillColor } = useCanvasStore();
  const colorInputRef = useRef<HTMLInputElement>(null);

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
    // Directly trigger the hidden color input
    if (colorInputRef.current) {
      colorInputRef.current.click();
    }
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    updateFillColor(elementId, e.target.value);
  };

  const toolbarScale = Math.max(0.8, Math.min(1.2, zoom / 100));

  return (
    <div
      className="absolute pointer-events-auto z-50"
      style={{
        left: position.x,
        top: position.y - 50,
        transform: `scale(${toolbarScale}) translate(-50%, 0)`,
        transformOrigin: "top center",
      }}
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 flex items-center gap-1 p-1"
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
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
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

            {/* Color Picker Input */}
            <input
              ref={colorInputRef}
              type="color"
              value={elementColor}
              onChange={handleColorChange}
              className="hidden"
              tabIndex={0}
              aria-label="Color picker"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ElementFloatingToolbar;
