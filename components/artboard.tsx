import React from "react"
import CanvasElement from "./canvas-element"
import { cn } from "@/lib/utils"

interface ArtboardProps {
  artboardDimensions: { width: number; height: number }
  zoom: number
  transformOrigin: string
  showGuides: boolean
  elements: any[]
  onSelectElement: (id: string) => void
  onMoveElement: (id: string, dx: number, dy: number) => void
  onResizeElement: (id: string, w: number, h: number) => void
  onTextChange: (id: string, content: string) => void
  selectedTool: string | null
  canvasPosition: { x: number; y: number }
  artboardRef: React.RefObject<HTMLDivElement | null>
  canvasContainerRef: React.RefObject<HTMLDivElement | null>
}

const Artboard: React.FC<ArtboardProps> = ({
  artboardDimensions,
  zoom,
  transformOrigin,
  showGuides,
  elements,
  onSelectElement,
  onMoveElement,
  onResizeElement,
  onTextChange,
  selectedTool,
  canvasPosition,
  artboardRef,
  canvasContainerRef,
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
        className="bg-blue-300/50 relative mx-auto my-auto"
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
            onSelect={() => onSelectElement(element.id)}
            onMove={(dx, dy) => onMoveElement(element.id, dx, dy)}
            onResize={(w, h) => onResizeElement(element.id, w, h)}
            onTextChange={(content) => onTextChange(element.id, content)}
            isPanMode={selectedTool === "hand"}
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
  )
}

export default Artboard 