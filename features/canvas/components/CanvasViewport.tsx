import React, { useState } from "react";

// Utility function to clear text selection
const clearTextSelection = () => {
  if (window.getSelection) {
    const selection = window.getSelection();
    if (selection) {
      selection.removeAllRanges();
    }
  }
};
import type { ToolType } from "../types/props";
import type { ElementType } from "../types";
import Artboard from "./Artboard";
import { generateRandomImage } from "../services/image-service";
import {
  useElements,
  useSelectedElements,
  useArtboardDimensions,
  useCanvasActions,
  useElementActions,
  useSelectionActions,
  useTextActions,
  useStyleActions,
  useHistoryActions,
} from "../store/selectors";

// Drag data interface for element creation
interface DragElementData {
  type: ElementType;
  isCreatingElement: boolean;
}

interface CanvasViewportProps {
  canvasRef: React.RefObject<HTMLDivElement | null>;
  artboardRef: React.RefObject<HTMLDivElement | null>;
  canvasContainerRef: React.RefObject<HTMLDivElement | null>;
  showGuides: boolean;
  selectedTool: ToolType;
  zoom: number;
  transformOrigin: string;
  canvasPosition: { x: number; y: number };
  handleMouseDown: (e: React.MouseEvent<HTMLDivElement>) => void;
  handleMouseMove: (e: React.MouseEvent<HTMLDivElement>) => void;
  handleMouseUp: (e: React.MouseEvent<HTMLDivElement>) => void;
  handleContextMenu?: (e: React.MouseEvent<HTMLDivElement>) => void;
  handleTouchStart: (e: React.TouchEvent<HTMLDivElement>) => void;
  handleTouchMove: (e: React.TouchEvent<HTMLDivElement>) => void;
  handleTouchEnd: (e: React.TouchEvent<HTMLDivElement>) => void;
  selectionRectangle?: {
    left: number;
    top: number;
    width: number;
    height: number;
  } | null;
}

export default function CanvasViewport({
  canvasRef,
  artboardRef,
  canvasContainerRef,
  showGuides,
  selectedTool,
  zoom,
  transformOrigin,
  canvasPosition,
  handleMouseDown,
  handleMouseMove,
  handleMouseUp,
  handleContextMenu,
  handleTouchStart,
  handleTouchMove,
  handleTouchEnd,
  selectionRectangle,
}: CanvasViewportProps) {
  // Use optimized selectors to prevent unnecessary re-renders
  const artboardDimensions = useArtboardDimensions();
  const elements = useElements();
  const selectedElements = useSelectedElements();
  const canvasActions = useCanvasActions();
  const elementActions = useElementActions();
  const selectionActions = useSelectionActions();
  const textActions = useTextActions();
  const styleActions = useStyleActions();
  const historyActions = useHistoryActions();

  // State for drag and drop
  const [isDragOver, setIsDragOver] = useState(false);
  const [dragOverArtboard, setDragOverArtboard] = useState(false);

  // Calculate position relative to artboard accounting for zoom
  const getArtboardPosition = (clientX: number, clientY: number) => {
    if (!artboardRef.current) return null;

    const artboardRect = artboardRef.current.getBoundingClientRect();

    // Get position relative to the artboard element
    const relativeX = clientX - artboardRect.left;
    const relativeY = clientY - artboardRect.top;

    // Adjust for zoom level - convert from screen coordinates to artboard coordinates
    // zoom is stored as percentage (e.g., 75 for 75%), so convert to decimal
    const zoomFactor = zoom / 100;
    const artboardX = relativeX / zoomFactor;
    const artboardY = relativeY / zoomFactor;

    // Check if position is within artboard bounds (using actual artboard dimensions)
    if (
      artboardX >= 0 &&
      artboardY >= 0 &&
      artboardX <= artboardDimensions.width &&
      artboardY <= artboardDimensions.height
    ) {
      return { x: artboardX, y: artboardY };
    }

    return null;
  };

  // Handle drag over
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";

    if (!isDragOver) {
      setIsDragOver(true);
    }

    // Check if dragging over artboard
    const artboardPos = getArtboardPosition(e.clientX, e.clientY);
    setDragOverArtboard(!!artboardPos);
  };

  // Handle drag enter
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  // Handle drag leave
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    // Only set to false if we're leaving the canvas viewport entirely
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
      setDragOverArtboard(false);
    }
  };

  // Handle drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    setDragOverArtboard(false);

    try {
      const dragDataString = e.dataTransfer.getData("application/json");
      if (!dragDataString) return;

      const dragData: DragElementData = JSON.parse(dragDataString);
      if (!dragData.isCreatingElement) return;

      // Calculate position relative to artboard
      const artboardPos = getArtboardPosition(e.clientX, e.clientY);
      if (!artboardPos) {
        // If dropped outside artboard, don't create element
        return;
      }

      // Create element at drop position
      if (dragData.type === "image") {
        // Generate a random image automatically instead of prompting
        const imageUrl = generateRandomImage({ width: 300, height: 200 });
        canvasActions.addImageElement(imageUrl, artboardPos.x, artboardPos.y);
      } else {
        // Create element directly at the drop position
        canvasActions.addElementAtPosition(
          dragData.type,
          artboardPos.x,
          artboardPos.y
        );
      }
    } catch (error) {
      console.error("Error handling drop:", error);
    }
  };

  return (
    <div
      className="z-10 flex-1 relative overflow-hidden canvas-viewport"
      ref={canvasRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onContextMenu={handleContextMenu}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Grid Background */}
      <div className="fixed z-10 w-full h-full top-0 left-0 canvas-background">
        <div
          className="absolute select-none w-[120vw] h-[150vw] -z-10 -top-190 left-0 rotate-45 origin-center opacity-50"
          style={{
            backgroundImage: showGuides
              ? `linear-gradient(to right, var(--sidebar) 1px, transparent 1px), linear-gradient(to bottom, var(--sidebar) 1px, transparent 1px)`
              : "none",
            backgroundSize: "40px 40px",
          }}
        />
        {/* Canvas Container for Panning and Artboard */}
        <Artboard
          artboardDimensions={artboardDimensions}
          zoom={zoom}
          transformOrigin={transformOrigin}
          showGuides={showGuides}
          elements={elements}
          selectedElements={selectedElements}
          onSelectElement={(id, addToSelection) => {
            if (id === null) selectionActions.clearSelection();
            else selectionActions.selectElement(id, addToSelection);
          }}
          onMoveElement={elementActions.moveElement}
          onMoveElementNoHistory={elementActions.moveElementNoHistory}
          onMoveSelectedElements={elementActions.moveSelectedElements}
          onMoveSelectedElementsNoHistory={
            elementActions.moveSelectedElementsNoHistory
          }
          onResizeElement={(id, w, h, preserveAspectRatio) =>
            elementActions.resizeElement(id, w, h, preserveAspectRatio)
          }
          onResizeElementNoHistory={(id, w, h, preserveAspectRatio) =>
            elementActions.resizeElementNoHistory(id, w, h, preserveAspectRatio)
          }
          onResizeSelectedElements={elementActions.resizeSelectedElements}
          onResizeSelectedElementsNoHistory={
            elementActions.resizeSelectedElementsNoHistory
          }
          onTextChange={textActions.updateTextContent}
          onTextResizingChange={textActions.updateTextResizing}
          selectedTool={selectedTool}
          canvasPosition={canvasPosition}
          artboardRef={artboardRef}
          canvasContainerRef={canvasContainerRef}
          onUpdateCornerRadius={styleActions.updateCornerRadius}
          onUpdateCornerRadiusNoHistory={
            styleActions.updateCornerRadiusNoHistory
          }
          onUpdateFontSize={textActions.updateFontSize}
          onUpdateLineHeight={textActions.updateLineHeight}
          onUpdateRotation={styleActions.updateRotation}
          onUpdateRotationNoHistory={styleActions.updateRotationNoHistory}
          onResizeArtboard={(width, height) =>
            elementActions.setArtboardDimensions({ width, height })
          }
          onAddToHistory={historyActions.addToHistory}
        />

        {/* Drop Zone Visual Feedback */}
        {isDragOver && (
          <div className="absolute inset-0 pointer-events-none z-40">
            <div
              className={`absolute inset-0 transition-colors duration-200 ${
                dragOverArtboard
                  ? "bg-blue-500/10 border-2 border-blue-500 border-dashed"
                  : "bg-red-500/5"
              }`}
            />
            {dragOverArtboard && (
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg">
                Drop to add element
              </div>
            )}
            {!dragOverArtboard && (
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg">
                Drop on artboard to add element
              </div>
            )}
          </div>
        )}

        {/* Selection Rectangle */}
        {selectionRectangle && (
          <div
            className="absolute pointer-events-none z-50 border border-blue-500 bg-blue-500/10"
            style={{
              left: selectionRectangle.left,
              top: selectionRectangle.top,
              width: selectionRectangle.width,
              height: selectionRectangle.height,
            }}
          />
        )}
      </div>
    </div>
  );
}
