"use client";

import type React from "react";

import { useRef, useState, useEffect } from "react";
import { Minus, Plus, Eraser, RotateCcw, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import Artboard from "./artboard";
import { useCanvasElements, ToolType } from "@/hooks/useCanvasElements";
import { useCanvasPanZoom } from "@/hooks/useCanvasPanZoom";
import ToolSidebar from "./tool-sidebar";
import PropertiesSidebar from "./properties-sidebar";
import LayersPanel from "@/components/layers-panel";

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
  const [layersOpen, setLayersOpen] = useState(false);

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
    handleUndo,
    handleRedo,
    canUndo,
    canRedo,
    getSelectedElementData,
    setElements,
    setSelectedElement,
    handleUpdateCornerRadius,
    handleClearSelection,
    handleReorderElements,
    handleUpdateFillColor,
    handleUpdateBorderWidth,
    handleUpdateBorderColor,
    handleUpdateShadowBlur,
    handleUpdateShadowColor,
    handleDeleteElement,
    handleUpdateName,
  } = useCanvasElements(artboardDimensions);

  // Keyboard shortcuts: Backspace => Delete element; Ctrl/Cmd+Z => Undo; Ctrl/Cmd+Shift+Z => Redo
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      // Delete selected element on Backspace (when not typing in inputs or contentEditable)
      if (
        e.key === "Backspace" &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.shiftKey &&
        !e.altKey
      ) {
        const target = e.target as HTMLElement;
        const isTyping =
          target instanceof HTMLElement &&
          (target.isContentEditable ||
            target.tagName === "INPUT" ||
            target.tagName === "TEXTAREA");
        if (!isTyping && selectedElement) {
          e.preventDefault();
          handleDeleteElement(selectedElement);
        }
        return;
      }
      // Undo/Redo with Ctrl/Cmd+Z
      const modifier = e.ctrlKey || e.metaKey;
      if (!modifier) return;
      const key = e.key.toLowerCase();
      if (key === "z" && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      }
      if (key === "z" && e.shiftKey) {
        e.preventDefault();
        handleRedo();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [handleUndo, handleRedo, handleDeleteElement, selectedElement]);

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
          clearSelection={handleClearSelection}
          onToggleLayers={() => setLayersOpen((prev) => !prev)}
          layersOpen={layersOpen}
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
            onMouseDown={(e) => {
              if (selectedTool !== "hand") handleClearSelection();
            }}
            onTouchStart={(e) => {
              if (selectedTool !== "hand") handleClearSelection();
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
                if (id === null) handleClearSelection();
                else handleSelectElement(id, selectedTool as ToolType);
              }}
              onMoveElement={handleMoveElement}
              onResizeElement={handleResizeElement}
              onTextChange={handleUpdateTextContent}
              selectedTool={selectedTool}
              canvasPosition={canvasPosition}
              artboardRef={artboardRef as React.RefObject<HTMLDivElement>}
              canvasContainerRef={
                canvasContainerRef as React.RefObject<HTMLDivElement>
              }
              onUpdateCornerRadius={handleUpdateCornerRadius}
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
              onClick={handleUndo}
              disabled={!canUndo}
              className="h-8 w-8 text-white"
              aria-label="Undo"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRedo}
              disabled={!canRedo}
              className="h-8 w-8 text-white"
              aria-label="Redo"
            >
              <RotateCw className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                if (
                  window.confirm(
                    "Are you sure you want to reset the canvas? All changes will be lost."
                  )
                ) {
                  handleResetCanvas();
                }
              }}
              className="h-8 w-8 text-white ml-2"
              aria-label="Reset Canvas"
            >
              <Eraser className="h-4 w-4" />
            </Button>
          </div>

          {/* Layers Panel */}
          {layersOpen && (
            <LayersPanel
              elements={elements}
              selectedElement={selectedElement}
              onSelect={(id: string) =>
                handleSelectElement(id, selectedTool as ToolType)
              }
              onReorder={(oldIndex: number, newIndex: number) =>
                handleReorderElements(oldIndex, newIndex)
              }
              className="z-20 absolute bottom-6 right-4"
            />
          )}
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
          handleUpdateCornerRadius={handleUpdateCornerRadius}
          handleUpdateFillColor={handleUpdateFillColor}
          handleUpdateBorderWidth={handleUpdateBorderWidth}
          handleUpdateBorderColor={handleUpdateBorderColor}
          handleUpdateShadowBlur={handleUpdateShadowBlur}
          handleUpdateShadowColor={handleUpdateShadowColor}
          handleUpdateName={handleUpdateName}
        />
      </div>
    </div>
  );
}
