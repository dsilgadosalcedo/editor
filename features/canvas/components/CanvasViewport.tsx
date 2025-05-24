import React from "react";
import type { ToolType } from "../store/useCanvasStore";
import { useCanvasStore } from "../store/useCanvasStore";
import Artboard from "./Artboard";

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
  handleTouchStart,
  handleTouchMove,
  handleTouchEnd,
  selectionRectangle,
}: CanvasViewportProps) {
  const {
    artboardDimensions,
    elements,
    selectedElements,
    selectElement,
    moveElement,
    moveElementNoHistory,
    moveSelectedElements,
    moveSelectedElementsNoHistory,
    resizeElement,
    resizeElementNoHistory,
    resizeSelectedElements,
    resizeSelectedElementsNoHistory,
    updateTextContent,
    updateCornerRadius,
    updateCornerRadiusNoHistory,
    updateFontSize,
    updateLineHeight,
    updateRotation,
    updateRotationNoHistory,
    clearSelection,
    setArtboardDimensions,
    addToHistory,
  } = useCanvasStore();

  return (
    <div
      className="flex-1 relative overflow-hidden"
      ref={canvasRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Grid Background */}
      <div
        className="fixed z-10 w-full h-full top-0 left-0 canvas-background"
        onMouseDown={() => {
          clearSelection();
        }}
        onTouchStart={() => {
          clearSelection();
        }}
      >
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
            if (id === null) clearSelection();
            else selectElement(id, addToSelection);
          }}
          onMoveElement={moveElement}
          onMoveElementNoHistory={moveElementNoHistory}
          onMoveSelectedElements={moveSelectedElements}
          onMoveSelectedElementsNoHistory={moveSelectedElementsNoHistory}
          onResizeElement={(id, w, h, preserveAspectRatio) =>
            resizeElement(id, w, h, preserveAspectRatio)
          }
          onResizeElementNoHistory={(id, w, h, preserveAspectRatio) =>
            resizeElementNoHistory(id, w, h, preserveAspectRatio)
          }
          onResizeSelectedElements={(baseId, w, h, preserveAspectRatio) =>
            resizeSelectedElements(baseId, w, h, preserveAspectRatio)
          }
          onResizeSelectedElementsNoHistory={(
            baseId,
            w,
            h,
            preserveAspectRatio
          ) =>
            resizeSelectedElementsNoHistory(baseId, w, h, preserveAspectRatio)
          }
          onTextChange={updateTextContent}
          selectedTool={selectedTool}
          canvasPosition={canvasPosition}
          artboardRef={artboardRef}
          canvasContainerRef={canvasContainerRef}
          onUpdateCornerRadius={updateCornerRadius}
          onUpdateCornerRadiusNoHistory={updateCornerRadiusNoHistory}
          onUpdateFontSize={updateFontSize}
          onUpdateLineHeight={updateLineHeight}
          onUpdateRotation={updateRotation}
          onUpdateRotationNoHistory={updateRotationNoHistory}
          onResizeArtboard={(width, height) =>
            setArtboardDimensions({ width, height })
          }
          onAddToHistory={addToHistory}
        />

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
