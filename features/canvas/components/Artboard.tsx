import React from "react";
import CanvasElement from "./CanvasElement";
import ArtboardControlPoints from "./ArtboardControlPoints";

interface ArtboardProps {
  artboardDimensions: { width: number; height: number };
  zoom: number;
  transformOrigin: string;
  showGuides: boolean;
  elements: any[];
  selectedElements: string[];
  onSelectElement: (id: string | null, addToSelection?: boolean) => void;
  onMoveElement: (id: string, dx: number, dy: number) => void;
  onMoveElementNoHistory: (id: string, dx: number, dy: number) => void;
  onMoveSelectedElements: (dx: number, dy: number) => void;
  onMoveSelectedElementsNoHistory: (dx: number, dy: number) => void;
  onResizeElement: (
    id: string,
    w: number,
    h: number,
    preserveAspectRatio?: boolean
  ) => void;
  onResizeElementNoHistory: (
    id: string,
    w: number,
    h: number,
    preserveAspectRatio?: boolean
  ) => void;
  onResizeSelectedElements: (
    baseId: string,
    w: number,
    h: number,
    preserveAspectRatio?: boolean
  ) => void;
  onResizeSelectedElementsNoHistory: (
    baseId: string,
    w: number,
    h: number,
    preserveAspectRatio?: boolean
  ) => void;
  onTextChange: (id: string, content: string) => void;
  selectedTool: string | null;
  canvasPosition: { x: number; y: number };
  artboardRef: React.RefObject<HTMLDivElement | null>;
  canvasContainerRef: React.RefObject<HTMLDivElement | null>;
  onUpdateCornerRadius?: (id: string, cornerRadius: number) => void;
  onUpdateCornerRadiusNoHistory?: (id: string, cornerRadius: number) => void;
  onUpdateFontSize?: (id: string, fontSize: number) => void;
  onUpdateLineHeight?: (id: string, lineHeight: number) => void;
  onResizeArtboard: (width: number, height: number) => void;
  onAddToHistory?: () => void;
}

const Artboard: React.FC<ArtboardProps> = ({
  artboardDimensions,
  zoom,
  transformOrigin,
  showGuides,
  elements,
  selectedElements,
  onSelectElement,
  onMoveElement,
  onMoveElementNoHistory,
  onMoveSelectedElements,
  onMoveSelectedElementsNoHistory,
  onResizeElement,
  onResizeElementNoHistory,
  onResizeSelectedElements,
  onResizeSelectedElementsNoHistory,
  onTextChange,
  selectedTool,
  canvasPosition,
  artboardRef,
  canvasContainerRef,
  onUpdateCornerRadius,
  onUpdateCornerRadiusNoHistory,
  onUpdateFontSize,
  onUpdateLineHeight,
  onResizeArtboard,
  onAddToHistory,
}) => {
  return (
    <div
      ref={canvasContainerRef}
      className="absolute"
      style={{
        transform: `translate(${canvasPosition.x}px, ${canvasPosition.y}px)`,
        transition: "transform 0.1s ease",
        width: "100%",
        height: "100%",
      }}
    >
      <div
        ref={artboardRef}
        className="bg-sky-harbor/50 relative mx-auto my-auto"
        style={{
          width: `${artboardDimensions.width}px`,
          height: `${artboardDimensions.height}px`,
          transform: `scale(${zoom / 100})`,
          transformOrigin: transformOrigin,
          transition: "transform 0.2s ease",
          position: "absolute",
          left: "50%",
          top: "50%",
          marginLeft: `-${artboardDimensions.width / 2}px`,
          marginTop: `-${artboardDimensions.height / 2}px`,
        }}
        onMouseDown={(e) => {
          onSelectElement(null);
          // if (selectedTool !== "hand") onSelectElement(null);
        }}
        onTouchStart={(e) => {
          onSelectElement(null);
          // if (selectedTool !== "hand") onSelectElement(null);
        }}
      >
        {showGuides && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage:
                "linear-gradient(to right, rgba(255,255,255,0.2) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.2) 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }}
          />
        )}
        {elements.map((element) => (
          <CanvasElement
            key={element.id}
            element={element}
            onSelect={(addToSelection) =>
              onSelectElement(element.id, addToSelection)
            }
            onMove={(dx, dy) => {
              if (
                selectedElements.length > 1 &&
                selectedElements.includes(element.id)
              ) {
                // Move all selected elements together when dragging a selected element
                onMoveSelectedElements(dx, dy);
              } else {
                // Move single element
                onMoveElement(element.id, dx, dy);
              }
            }}
            onMoveNoHistory={(dx, dy) => {
              if (
                selectedElements.length > 1 &&
                selectedElements.includes(element.id)
              ) {
                // Move all selected elements together when dragging a selected element
                onMoveSelectedElementsNoHistory(dx, dy);
              } else {
                // Move single element
                onMoveElementNoHistory(element.id, dx, dy);
              }
            }}
            onResize={(w, h, preserveAspectRatio) => {
              if (
                selectedElements.length > 1 &&
                selectedElements.includes(element.id)
              ) {
                // Resize all selected elements proportionally
                onResizeSelectedElements(element.id, w, h, preserveAspectRatio);
              } else {
                // Resize single element
                onResizeElement(element.id, w, h, preserveAspectRatio);
              }
            }}
            onResizeNoHistory={(w, h, preserveAspectRatio) => {
              if (
                selectedElements.length > 1 &&
                selectedElements.includes(element.id)
              ) {
                // Resize all selected elements proportionally
                onResizeSelectedElementsNoHistory(
                  element.id,
                  w,
                  h,
                  preserveAspectRatio
                );
              } else {
                // Resize single element
                onResizeElementNoHistory(element.id, w, h, preserveAspectRatio);
              }
            }}
            onTextChange={(content) => onTextChange(element.id, content)}
            isPanMode={selectedTool === "hand"}
            zoom={zoom}
            onUpdateCornerRadius={onUpdateCornerRadius}
            onUpdateCornerRadiusNoHistory={onUpdateCornerRadiusNoHistory}
            onUpdateFontSize={onUpdateFontSize}
            onUpdateLineHeight={onUpdateLineHeight}
            onAddToHistory={onAddToHistory}
            isMultipleSelected={selectedElements.length > 1}
          />
        ))}
        {/* Artboard control points - always visible, never hide */}
        <ArtboardControlPoints
          artboardDimensions={artboardDimensions}
          onResizeArtboard={onResizeArtboard}
          zoom={zoom}
        />
      </div>
    </div>
  );
};

export default Artboard;
