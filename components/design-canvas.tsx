"use client";

import type React from "react";

import { useRef, useState } from "react";
import { Hand, Minus, Plus, RotateCcw, Square, Type } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import Artboard from "./artboard";
import { useCanvasElements, ToolType } from "@/hooks/useCanvasElements";
import { useCanvasPanZoom } from "@/hooks/useCanvasPanZoom";
import ToolSidebar from "./tool-sidebar";
import PropertiesSidebar from "./properties-sidebar";

export default function DesignCanvas() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const artboardRef = useRef<HTMLDivElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const [showGuides, setShowGuides] = useState(true);
  const [artboardDimensions, setArtboardDimensions] = useState({
    width: 500,
    height: 400,
  });
  const [selectedTool, setSelectedTool] = useState<ToolType>(null);

  // Elements logic
  const {
    elements,
    selectedElement,
    handleAddElement,
    handleSelectElement,
    handleMoveElement,
    handleResizeElement,
    handleUpdateTextContent,
    handleResetCanvas,
    getSelectedElementData,
    setElements,
    setSelectedElement,
  } = useCanvasElements(artboardDimensions);

  // Pan/zoom logic
  const {
    zoom,
    setZoom,
    canvasPosition,
    setCanvasPosition,
    transformOrigin,
    setTransformOrigin,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    isPanning,
    setIsPanning,
    panStartRef,
  } = useCanvasPanZoom(
    artboardRef as React.RefObject<HTMLDivElement>,
    canvasRef as React.RefObject<HTMLDivElement>,
    selectedTool
  );

  // Artboard dimension handlers
  const handleUpdateArtboardWidth = (width: number) => {
    setArtboardDimensions((prev) => ({ ...prev, width }));
  };
  const handleUpdateArtboardHeight = (height: number) => {
    setArtboardDimensions((prev) => ({ ...prev, height }));
  };

  // Text input change handler for sidebar
  const handleTextInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedElement) return;
    handleUpdateTextContent(selectedElement, e.target.value);
  };

  return (
    <div className="bg-muted/50 flex flex-col h-screen w-full">
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <ToolSidebar
          selectedTool={selectedTool}
          onSelectTool={setSelectedTool}
          onAddElement={handleAddElement}
          clearSelection={() => setSelectedElement(null)}
        />

        {/* Main Canvas Area */}
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
                ? `linear-gradient(to right, var(--grid-color) 1px, transparent 1px), linear-gradient(to bottom, var(--grid-color) 1px, transparent 1px)`
                : "none",
              backgroundSize: "20px 20px",
            }}
          >
            {/* Canvas Container for Panning and Artboard */}
            <Artboard
              artboardDimensions={artboardDimensions}
              zoom={zoom}
              transformOrigin={transformOrigin}
              showGuides={showGuides}
              elements={elements}
              onSelectElement={(id) =>
                handleSelectElement(id, selectedTool as ToolType)
              }
              onMoveElement={handleMoveElement}
              onResizeElement={handleResizeElement}
              onTextChange={handleUpdateTextContent}
              selectedTool={selectedTool}
              canvasPosition={canvasPosition}
              artboardRef={artboardRef as React.RefObject<HTMLDivElement>}
              canvasContainerRef={
                canvasContainerRef as React.RefObject<HTMLDivElement>
              }
            />
          </div>

          {/* Zoom Controls */}
          <div className="z-20 absolute bottom-6 left-4 flex items-center gap-2 bg-properties-blue dark:bg-properties-blue backdrop-blur-sm p-2 rounded-lg">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setZoom((prev) => Math.max(prev - 10, 50))}
              className="h-8 w-8 text-white"
            >
              <Minus className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-1">
              <Slider
                value={[zoom]}
                min={50}
                max={400}
                step={1}
                className="w-24"
                onValueChange={(value) => setZoom(value[0])}
              />
              <span className="text-white text-xs w-12">{zoom}%</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setZoom((prev) => Math.min(prev + 10, 400))}
              className="h-8 w-8 text-white"
            >
              <Plus className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleResetCanvas}
              className="h-8 w-8 text-white ml-2"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Right Sidebar */}
        <PropertiesSidebar
          artboardDimensions={artboardDimensions}
          onUpdateArtboardWidth={handleUpdateArtboardWidth}
          onUpdateArtboardHeight={handleUpdateArtboardHeight}
          selectedElementData={getSelectedElementData()}
          onTextChange={handleTextInputChange}
          handleResizeElement={handleResizeElement}
          handleMoveElement={handleMoveElement}
        />
      </div>
    </div>
  );
}
