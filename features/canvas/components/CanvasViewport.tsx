import React, { useRef } from "react";
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
}: CanvasViewportProps) {
  const {
    artboardDimensions,
    elements,
    selectElement,
    moveElement,
    resizeElement,
    updateTextContent,
    updateCornerRadius,
    clearSelection,
  } = useCanvasStore();

  return (
    <div
      className="flex-1 relative overflow-hidden"
      ref={canvasRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Grid Background */}
      <div
        className="z-10 fixed w-full h-full top-0 left-0 inset-0"
        style={{
          backgroundImage: showGuides
            ? `linear-gradient(to right, var(--sidebar) 1px, transparent 1px), linear-gradient(to bottom, var(--sidebar) 1px, transparent 1px)`
            : "none",
          backgroundSize: "20px 20px",
        }}
        onMouseDown={(e) => {
          clearSelection();
        }}
        onTouchStart={(e) => {
          clearSelection();
        }}
      >
        {/* Canvas Container for Panning and Artboard */}
        <Artboard
          artboardDimensions={artboardDimensions}
          zoom={zoom}
          transformOrigin={transformOrigin}
          showGuides={showGuides}
          elements={elements}
          onSelectElement={(id) => {
            if (id === null) clearSelection();
            else selectElement(id);
          }}
          onMoveElement={moveElement}
          onResizeElement={resizeElement}
          onTextChange={updateTextContent}
          selectedTool={selectedTool}
          canvasPosition={canvasPosition}
          artboardRef={artboardRef}
          canvasContainerRef={canvasContainerRef}
          onUpdateCornerRadius={updateCornerRadius}
        />
      </div>
    </div>
  );
}
