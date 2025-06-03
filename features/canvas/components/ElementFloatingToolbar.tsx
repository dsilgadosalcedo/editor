import React, { useState, useEffect, useRef } from "react";
import { ChevronUp, ChevronDown, Group, Ungroup, Eye } from "lucide-react";
import { useCanvasStore } from "../store/useCanvasStore";
import { Button } from "@/components/ui/button";
import { useSelectedElements } from "../store/selectors";
import { useShallow } from "zustand/react/shallow";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ColorPicker } from "./ColorPicker";

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

  // Get current element data to access dimensions
  const currentElement = useCanvasStore(
    useShallow((state) => state.elements.find((el) => el.id === elementId))
  );

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

  const handleColorChange = (newColor: string) => {
    elementActions.updateFillColor(elementId, newColor);
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

  // Calculate smart positioning
  const calculatePosition = () => {
    const toolbarHeight = 32; // Approximate height of the toolbar
    const gap = 16; // Gap between element and toolbar
    const viewportHeight = window.innerHeight;

    // Scale the gap based on zoom
    const scaledGap = gap * (100 / zoom);
    const scaledToolbarHeight = toolbarHeight * (100 / zoom);

    // Add extra offset when rotating to avoid overlapping with rotation indicator
    const rotationExtraOffset = isRotating ? 20 * (100 / zoom) : 0;

    // Total space needed above the element
    const spaceNeededAbove =
      scaledToolbarHeight + scaledGap + rotationExtraOffset;

    // Calculate distance from top of viewport to element position
    const distanceFromTop = position.y;

    // Get element height (scaled by zoom)
    const elementHeight = currentElement
      ? currentElement.height * (zoom / 100)
      : 0;

    let finalY = position.y;
    let shouldPositionBelow = false;

    if (distanceFromTop >= spaceNeededAbove) {
      // Enough space above - position above the element (default behavior)
      finalY = position.y - spaceNeededAbove;
    } else {
      // Not enough space above - position below the element's bottom edge
      finalY = position.y + elementHeight + scaledGap;
      shouldPositionBelow = true;
    }

    return {
      x: position.x,
      y: finalY,
      isBelow: shouldPositionBelow,
    };
  };

  const smartPosition = calculatePosition();

  return (
    <div
      data-toolbar="element-floating-toolbar"
      className="absolute pointer-events-auto z-50 transition-all duration-200 ease-out animate-[var(--animate-fade-up)]"
      style={{
        left: smartPosition.x,
        top: smartPosition.y,
        transform: `scale(${toolbarScale}) translate(-50%, 0)`,
        transformOrigin: smartPosition.isBelow ? "top left" : "top left",
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
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleMoveUp}
                aria-label="Move element up one layer"
                className="h-6 w-6"
              >
                <ChevronUp className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Move up one layer</p>
            </TooltipContent>
          </Tooltip>
        )}

        {/* Move Down Button - only show for single selections */}
        {!currentlyHasMultipleSelection && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleMoveDown}
                aria-label="Move element down one layer"
                className="h-6 w-6"
              >
                <ChevronDown className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Move down one layer</p>
            </TooltipContent>
          </Tooltip>
        )}

        {/* Color Picker - only show for single selections */}
        {!currentlyHasMultipleSelection &&
          (elementType === "rectangle" || elementType === "text") && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="h-6 w-6 flex items-center justify-center">
                  <ColorPicker
                    value={elementColor}
                    onChange={handleColorChange}
                    layerName={
                      elementName ||
                      elementType.charAt(0).toUpperCase() + elementType.slice(1)
                    }
                    propertyName={
                      elementType === "text" ? "Text Color" : "Background"
                    }
                    aria-label={`Change ${
                      elementType === "text" ? "text" : "background"
                    } color`}
                    className="h-6 w-6 p-0 min-w-6"
                    showHex={false}
                    showOpacity={false}
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  {elementType === "text" ? "Text color" : "Background color"}
                </p>
              </TooltipContent>
            </Tooltip>
          )}

        {/* Group Elements */}
        {currentlyHasMultipleSelection && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleGroupElements}
                aria-label="Group selected elements"
                className="h-6 w-6"
              >
                <Group className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Group selected elements</p>
            </TooltipContent>
          </Tooltip>
        )}

        {/* Ungroup Elements */}
        {elementType === "group" && !currentlyHasMultipleSelection && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleUngroupElements}
                aria-label="Ungroup group elements"
                className="h-6 w-6"
              >
                <Ungroup className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Ungroup group elements</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </div>
  );
};

export default ElementFloatingToolbar;
