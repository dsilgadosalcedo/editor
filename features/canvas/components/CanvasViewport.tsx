import React from "react";
import type { ToolType } from "../types/props";
import { useCanvasStore } from "../store/useCanvasStore";
import { useShallow } from "zustand/react/shallow";
import Artboard from "./Artboard";
import {
  useElements,
  useSelectedElements,
  useArtboardDimensions,
} from "../store/selectors";

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

  // Group related element actions using useShallow
  const elementActions = useCanvasStore(
    useShallow((state) => ({
      selectElement: state.selectElement,
      moveElement: state.moveElement,
      moveElementNoHistory: state.moveElementNoHistory,
      moveSelectedElements: state.moveSelectedElements,
      moveSelectedElementsNoHistory: state.moveSelectedElementsNoHistory,
      resizeElement: state.resizeElement,
      resizeElementNoHistory: state.resizeElementNoHistory,
      resizeSelectedElements: state.resizeSelectedElements,
      resizeSelectedElementsNoHistory: state.resizeSelectedElementsNoHistory,
      updateTextContent: state.updateTextContent,
      updateTextResizing: state.updateTextResizing,
      updateCornerRadius: state.updateCornerRadius,
      updateCornerRadiusNoHistory: state.updateCornerRadiusNoHistory,
      updateFontSize: state.updateFontSize,
      updateLineHeight: state.updateLineHeight,
      updateRotation: state.updateRotation,
      updateRotationNoHistory: state.updateRotationNoHistory,
      clearSelection: state.clearSelection,
      setArtboardDimensions: state.setArtboardDimensions,
      addToHistory: state.addToHistory,
    }))
  );

  return (
    <div
      className="z-10 flex-1 relative overflow-hidden"
      ref={canvasRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onContextMenu={handleContextMenu}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
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
            if (id === null) elementActions.clearSelection();
            else elementActions.selectElement(id, addToSelection);
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
          onResizeSelectedElements={(baseId, w, h, preserveAspectRatio) =>
            elementActions.resizeSelectedElements(
              baseId,
              w,
              h,
              preserveAspectRatio
            )
          }
          onResizeSelectedElementsNoHistory={(
            baseId,
            w,
            h,
            preserveAspectRatio
          ) =>
            elementActions.resizeSelectedElementsNoHistory(
              baseId,
              w,
              h,
              preserveAspectRatio
            )
          }
          onTextChange={elementActions.updateTextContent}
          onTextResizingChange={elementActions.updateTextResizing}
          selectedTool={selectedTool}
          canvasPosition={canvasPosition}
          artboardRef={artboardRef}
          canvasContainerRef={canvasContainerRef}
          onUpdateCornerRadius={elementActions.updateCornerRadius}
          onUpdateCornerRadiusNoHistory={
            elementActions.updateCornerRadiusNoHistory
          }
          onUpdateFontSize={elementActions.updateFontSize}
          onUpdateLineHeight={elementActions.updateLineHeight}
          onUpdateRotation={elementActions.updateRotation}
          onUpdateRotationNoHistory={elementActions.updateRotationNoHistory}
          onResizeArtboard={(width, height) =>
            elementActions.setArtboardDimensions({ width, height })
          }
          onAddToHistory={elementActions.addToHistory}
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
