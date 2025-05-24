"use client";

import type React from "react";

import { useRef, useState, useEffect } from "react";
import ToolSidebar from "./ToolSidebar";
import PropertiesPanel from "./PropertiesPanel";
import LayersPanel from "./LayersPanel";
import CanvasToolbar from "./CanvasToolbar";
import CanvasViewport from "./CanvasViewport";
import KeyboardShortcuts from "./KeyboardShortcuts";
import DragDropOverlay from "./DragDropOverlay";
import { useCanvasPanZoom } from "../hooks/useCanvasPanZoom";
import { useCanvasStore } from "../store/useCanvasStore";
import type { ToolType } from "../store/useCanvasStore";
import { ColorPickerProvider } from "./ColorPicker";

export default function CanvasPage() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const artboardRef = useRef<HTMLDivElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const [showGuides, setShowGuides] = useState(true);
  const [selectedTool, setSelectedTool] = useState<ToolType>(null);
  const [layersOpen, setLayersOpen] = useState(true);

  // Zustand store
  const {
    elements,
    selectedElements,
    artboardDimensions,
    deleteElement,
    undo,
    redo,
    copySelection,
    pasteClipboard,
    saveCanvas,
    loadCanvas,
    clearSelection,
    moveElementUp,
    moveElementDown,
    importCanvas,
    rightSidebarDocked,
  } = useCanvasStore();

  // Keyboard shortcuts: Full professional shortcuts support
  useEffect(() => {
    const onKeyDown = async (e: KeyboardEvent) => {
      // Check if user is typing in an input field or contentEditable element
      const target = e.target as HTMLElement;
      const isTyping =
        target instanceof HTMLElement &&
        (target.isContentEditable ||
          target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA");

      // Handle modifier key shortcuts FIRST (higher priority)
      const modifier = e.ctrlKey || e.metaKey;
      const key = e.key.toLowerCase();

      if (modifier) {
        // Save with Ctrl/Cmd+S (always prevent default to avoid browser save dialog)
        if (key === "s") {
          e.preventDefault();
          const title = prompt("Enter canvas title (optional):");
          const canvasId = await saveCanvas(title || undefined);
          if (canvasId) {
            alert(`Canvas saved successfully! ID: ${canvasId}`);
          } else {
            alert("Failed to save canvas");
          }
          return;
        }

        // Load with Ctrl/Cmd+O (always prevent default to avoid browser open dialog)
        if (key === "o") {
          e.preventDefault();
          const canvasId = prompt("Enter canvas ID to load:");
          if (canvasId) {
            const success = await loadCanvas(canvasId);
            if (success) {
              alert("Canvas loaded successfully!");
            } else {
              alert("Failed to load canvas");
            }
          }
          return;
        }

        // Select All with Ctrl/Cmd+A (only when not typing in inputs)
        if (key === "a" && !isTyping) {
          e.preventDefault();
          // Select all elements
          const allElementIds = elements.map((el) => el.id);
          if (allElementIds.length > 0) {
            // Use selectMultipleElements to select all
            const { selectMultipleElements } = useCanvasStore.getState();
            selectMultipleElements(allElementIds);
          }
          return;
        }

        // Undo/Redo with Ctrl/Cmd+Z (only when not typing in inputs)
        if (key === "z" && !isTyping) {
          e.preventDefault();
          if (e.shiftKey) {
            redo();
          } else {
            undo();
          }
          return;
        }

        // Copy with Ctrl/Cmd+C (only when not typing in inputs and element is selected)
        if (key === "c" && selectedElements.length > 0 && !isTyping) {
          e.preventDefault();
          copySelection();
          return;
        }

        // Paste with Ctrl/Cmd+V (only when not typing in inputs)
        if (key === "v" && !isTyping) {
          e.preventDefault();
          pasteClipboard();
          return;
        }

        // Move element up one layer with Ctrl/Cmd+ArrowUp (only when not typing and single element is selected)
        if (key === "arrowup" && selectedElements.length === 1 && !isTyping) {
          e.preventDefault();
          moveElementUp(selectedElements[0]);
          return;
        }

        // Move element down one layer with Ctrl/Cmd+ArrowDown (only when not typing and single element is selected)
        if (key === "arrowdown" && selectedElements.length === 1 && !isTyping) {
          e.preventDefault();
          moveElementDown(selectedElements[0]);
          return;
        }

        // If we reach here with a modifier key, don't process further
        return;
      }

      // Handle non-modifier key shortcuts (lower priority)

      // Delete selected elements on Backspace (when not typing in inputs or contentEditable)
      if (
        e.key === "Backspace" &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.shiftKey &&
        !e.altKey &&
        !isTyping &&
        selectedElements.length > 0
      ) {
        e.preventDefault();
        // Delete all selected elements
        selectedElements.forEach((id) => deleteElement(id));
        return;
      }

      // Clear selection on Escape
      if (e.key === "Escape") {
        // Don't clear selection if keyboard shortcuts are visible - let the component handle it
        const isShortcutsVisible = document.querySelector(
          ".fixed.inset-0.bg-black\\/50"
        );
        if (!isShortcutsVisible) {
          e.preventDefault();
          clearSelection();
        }
        return;
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [
    undo,
    redo,
    deleteElement,
    selectedElements,
    copySelection,
    pasteClipboard,
    saveCanvas,
    loadCanvas,
    clearSelection,
    moveElementUp,
    moveElementDown,
  ]);

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
  } = useCanvasPanZoom(artboardRef, canvasRef, selectedTool);

  // Helper: Zoom to fit selection
  const handleZoomToSelection = () => {
    if (selectedElements.length === 0) return;
    const el = elements.find((el) => el.id === selectedElements[0]);
    if (!el) return;
    // Get artboard and canvas sizes
    const artboardW = artboardDimensions.width;
    const artboardH = artboardDimensions.height;
    const padding = 40; // px, for some margin
    const scaleX = (artboardW - padding * 2) / el.width;
    const scaleY = (artboardH - padding * 2) / el.height;
    const newZoom = Math.min(
      400,
      Math.max(10, Math.floor(Math.min(scaleX, scaleY) * 100))
    );
    setZoom(newZoom);
    // Center the element
    setCanvasPosition({
      x: artboardW / 2 - (el.x + el.width / 2) * (newZoom / 100),
      y: artboardH / 2 - (el.y + el.height / 2) * (newZoom / 100),
    });
  };

  // Handle drag and drop import
  const handleFileDrop = async (file: File) => {
    try {
      const result = await importCanvas(file);
      if (!result.success) {
        alert(
          "Failed to import canvas. Please make sure it's a valid canvas file."
        );
      }
    } catch (error) {
      console.error("Error importing canvas:", error);
      alert(
        "Failed to import canvas. Please make sure it's a valid canvas file."
      );
    }
  };

  return (
    <ColorPickerProvider>
      <div className="bg-background flex h-screen w-full">
        {/* Left Sidebar */}
        <ToolSidebar
          selectedTool={selectedTool}
          onSelectTool={setSelectedTool}
          onToggleLayers={() => setLayersOpen((prev) => !prev)}
          layersOpen={layersOpen}
        />

        {/* Main Canvas Area */}
        <CanvasViewport
          canvasRef={canvasRef}
          artboardRef={artboardRef}
          canvasContainerRef={canvasContainerRef}
          showGuides={showGuides}
          selectedTool={selectedTool}
          zoom={zoom}
          transformOrigin={transformOrigin}
          canvasPosition={canvasPosition}
          handleMouseDown={handleMouseDown}
          handleMouseMove={handleMouseMove}
          handleMouseUp={handleMouseUp}
        />

        {/* Layers Panel */}
        {layersOpen && <LayersPanel />}

        {/* Canvas Toolbar */}
        <CanvasToolbar
          zoom={zoom}
          setZoom={setZoom}
          onZoomToSelection={handleZoomToSelection}
        />

        {/* Right Sidebar */}
        <PropertiesPanel />
      </div>

      {/* Keyboard Shortcuts Overlay */}
      <KeyboardShortcuts />

      {/* Drag and Drop Overlay */}
      <DragDropOverlay onFileDrop={handleFileDrop} />
    </ColorPickerProvider>
  );
}
