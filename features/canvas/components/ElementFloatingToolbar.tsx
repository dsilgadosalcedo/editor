import React, { useState, useEffect, useRef } from "react";
import { ChevronUp, ChevronDown, Group, Ungroup, Eye } from "lucide-react";
import { useCanvasStore } from "../store/useCanvasStore.new";
import { Button } from "@/components/ui/button";
import { useColorPicker } from "./ColorPicker";
import { useSelectedElements } from "../store/selectors";
import { useShallow } from "zustand/react/shallow";

interface ElementFloatingToolbarProps {
  elementId: string;
  elementType: "rectangle" | "text" | "image" | "group";
  elementColor: string;
  position: { x: number; y: number };
  zoom: number;
  isRotating?: boolean;
  elementName?: string;
  isMultipleSelection?: boolean;
}

const ElementFloatingToolbar: React.FC<ElementFloatingToolbarProps> = ({
  elementId,
  elementType,
  elementColor,
  position,
  zoom,
  isRotating = false,
  elementName,
  isMultipleSelection = false,
}) => {
  // Use optimized selectors to prevent unnecessary re-renders
  const selectedElements = useSelectedElements();

  // Group related actions using useShallow
  const elementActions = useCanvasStore(
    useShallow((state) => ({
      moveElementUp: state.moveElementUp,
      moveElementDown: state.moveElementDown,
      updateFillColor: state.updateFillColor,
      groupElements: state.groupElements,
      ungroupElements: state.ungroupElements,
      hasMultipleSelection: state.hasMultipleSelection,
      enterIsolationMode: state.enterIsolationMode,
    }))
  );

  const { openColorPicker } = useColorPicker();

  // Check if we currently have multiple elements selected
  const currentlyHasMultipleSelection = selectedElements.length > 1;

  const handleMoveUp = (e: React.MouseEvent) => {
    e.stopPropagation();
    elementActions.moveElementUp(elementId);
  };

  const handleMoveDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    elementActions.moveElementDown(elementId);
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
      elementActions.updateFillColor(elementId, newColor);
    };

    const layerName =
      elementName || elementType.charAt(0).toUpperCase() + elementType.slice(1);
    const propertyName = elementType === "text" ? "Text Color" : "Background";

    openColorPicker(
      elementColor,
      handleColorChange,
      { x, y },
      layerName,
      propertyName
    );
  };

  const handleGroupElements = (e: React.MouseEvent) => {
    e.stopPropagation();
    elementActions.groupElements();
  };

  const handleUngroupElements = (e: React.MouseEvent) => {
    e.stopPropagation();
    elementActions.ungroupElements();
  };

  const handleEnterIsolation = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (elementType === "group") {
      elementActions.enterIsolationMode(elementId);
    }
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
      data-toolbar="element-floating-toolbar"
      className="absolute pointer-events-auto z-50 transition-all duration-200 ease-out animate-[var(--animate-fade-up)]"
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
        {/* Move Up Button - only show for single selections */}
        {!currentlyHasMultipleSelection && (
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
        )}

        {/* Move Down Button - only show for single selections */}
        {!currentlyHasMultipleSelection && (
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
        )}

        {/* Color Picker - only show for single selections */}
        {!currentlyHasMultipleSelection &&
          (elementType === "rectangle" || elementType === "text") && (
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

        {/* Group Elements */}
        {currentlyHasMultipleSelection && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleGroupElements}
            title="Group elements"
            aria-label="Group selected elements"
            className="h-6 w-6"
          >
            <Group className="w-4 h-4" />
          </Button>
        )}

        {/* Ungroup Elements */}
        {elementType === "group" && !currentlyHasMultipleSelection && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleUngroupElements}
            title="Ungroup group"
            aria-label="Ungroup group elements"
            className="h-6 w-6"
          >
            <Ungroup className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default ElementFloatingToolbar;
