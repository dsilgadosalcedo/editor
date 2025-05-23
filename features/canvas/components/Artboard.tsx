import React from "react";
import CanvasElement from "./CanvasElement";

interface ArtboardProps {
  artboardDimensions: { width: number; height: number };
  zoom: number;
  transformOrigin: string;
  showGuides: boolean;
  elements: any[];
  selectedElements: string[];
  onSelectElement: (id: string | null, addToSelection?: boolean) => void;
  onMoveElement: (id: string, dx: number, dy: number) => void;
  onMoveSelectedElements: (dx: number, dy: number) => void;
  onResizeElement: (id: string, w: number, h: number) => void;
  onResizeSelectedElements: (baseId: string, w: number, h: number) => void;
  onTextChange: (id: string, content: string) => void;
  selectedTool: string | null;
  canvasPosition: { x: number; y: number };
  artboardRef: React.RefObject<HTMLDivElement | null>;
  canvasContainerRef: React.RefObject<HTMLDivElement | null>;
  onUpdateCornerRadius?: (id: string, cornerRadius: number) => void;
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
  onMoveSelectedElements,
  onResizeElement,
  onResizeSelectedElements,
  onTextChange,
  selectedTool,
  canvasPosition,
  artboardRef,
  canvasContainerRef,
  onUpdateCornerRadius,
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
            onResize={(w, h) => {
              if (
                selectedElements.length > 1 &&
                selectedElements.includes(element.id)
              ) {
                // Resize all selected elements proportionally
                onResizeSelectedElements(element.id, w, h);
              } else {
                // Resize single element
                onResizeElement(element.id, w, h);
              }
            }}
            onTextChange={(content) => onTextChange(element.id, content)}
            isPanMode={selectedTool === "hand"}
            zoom={zoom}
            onUpdateCornerRadius={onUpdateCornerRadius}
            isMultipleSelected={selectedElements.length > 1}
          />
        ))}
        {showGuides && (
          <>
            <div className="absolute -left-2 -top-2 w-4 h-4 bg-blue-200 rounded-full border-2 border-white" />
            <div className="absolute -right-2 -top-2 w-4 h-4 bg-blue-200 rounded-full border-2 border-white" />
            <div className="absolute -left-2 -bottom-2 w-4 h-4 bg-blue-200 rounded-full border-2 border-white" />
            <div className="absolute -right-2 -bottom-2 w-4 h-4 bg-blue-200 rounded-full border-2 border-white" />
          </>
        )}
      </div>
    </div>
  );
};

export default Artboard;
