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
import { useDragSelection } from "../hooks/useDragSelection";
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
    panSensitivity,
    zoomSensitivity,
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
    moveElement,
    importCanvas,
    addImageElement,
    rightSidebarDocked,
    selectMultipleElements,
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

      // Move selected elements with arrow keys (when not typing and elements are selected)
      if (
        (e.key === "ArrowUp" ||
          e.key === "ArrowDown" ||
          e.key === "ArrowLeft" ||
          e.key === "ArrowRight") &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.shiftKey &&
        !e.altKey &&
        !isTyping &&
        selectedElements.length > 0
      ) {
        e.preventDefault();

        // Define movement amount (pixels)
        const moveAmount = 1;

        // Calculate movement delta based on arrow key
        let dx = 0;
        let dy = 0;

        switch (e.key) {
          case "ArrowUp":
            dy = -moveAmount;
            break;
          case "ArrowDown":
            dy = moveAmount;
            break;
          case "ArrowLeft":
            dx = -moveAmount;
            break;
          case "ArrowRight":
            dx = moveAmount;
            break;
        }

        // Move all selected elements
        selectedElements.forEach((id) => {
          moveElement(id, dx, dy);
        });

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
    moveElement,
    elements,
  ]);

  // Pan/zoom logic
  const {
    zoom,
    setZoom,
    canvasPosition,
    setCanvasPosition,
    transformOrigin,
    setTransformOrigin,
    handleMouseDown: handlePanMouseDown,
    handleMouseMove: handlePanMouseMove,
    handleMouseUp: handlePanMouseUp,
    handleTouchStart: handlePanTouchStart,
    handleTouchMove: handlePanTouchMove,
    handleTouchEnd: handlePanTouchEnd,
    isPanning,
    setIsPanning,
    panStartRef,
    gestureState,
  } = useCanvasPanZoom(
    artboardRef,
    canvasRef,
    selectedTool,
    panSensitivity,
    zoomSensitivity
  );

  // Drag selection logic
  const {
    dragSelection,
    handleSelectionStart,
    handleSelectionMove,
    handleSelectionEnd,
    getSelectionRectangle,
  } = useDragSelection(
    selectedTool,
    canvasPosition,
    zoom,
    elements,
    selectMultipleElements,
    artboardDimensions
  );

  // Combined mouse handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    // Always try pan handling first (especially for middle mouse button)
    if (handlePanMouseDown(e)) {
      return; // Pan handler handled it (middle mouse or hand tool)
    }

    // Only try drag selection if pan didn't handle it (left click on non-hand tool)
    if (e.button === 0) {
      handleSelectionStart(e);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    handleSelectionMove(e);
    handlePanMouseMove(e);
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
    // Try pan handler first
    if (handlePanMouseUp(e)) {
      return; // Pan handler handled it
    }

    // Handle selection end
    handleSelectionEnd();
  };

  // Prevent context menu on canvas (especially for middle mouse button)
  const handleContextMenu = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  // Combined touch handlers
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    // For touch, prioritize pan/zoom over selection when appropriate
    handlePanTouchStart(e);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    handlePanTouchMove(e);
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    handlePanTouchEnd(e);
  };

  // Helper: Zoom to fit selection
  const handleZoomToSelection = () => {
    if (selectedElements.length === 0) return;

    // Get all selected elements
    const selectedElementsData = elements.filter((el) =>
      selectedElements.includes(el.id)
    );

    if (selectedElementsData.length === 0) return;

    // Calculate bounding box of all selected elements
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    selectedElementsData.forEach((el) => {
      minX = Math.min(minX, el.x);
      minY = Math.min(minY, el.y);
      maxX = Math.max(maxX, el.x + el.width);
      maxY = Math.max(maxY, el.y + el.height);
    });

    // Calculate selection bounds
    const selectionWidth = maxX - minX;
    const selectionHeight = maxY - minY;
    const selectionCenterX = minX + selectionWidth / 2;
    const selectionCenterY = minY + selectionHeight / 2;

    // Get artboard dimensions
    const artboardW = artboardDimensions.width;
    const artboardH = artboardDimensions.height;
    const padding = 40; // px margin around selection

    // Calculate zoom to fit selection with padding
    const scaleX = (artboardW - padding * 2) / selectionWidth;
    const scaleY = (artboardH - padding * 2) / selectionHeight;
    const newZoom = Math.round(
      Math.min(
        800, // Extended max zoom (was 400)
        Math.max(10, Math.min(scaleX, scaleY) * 100) // Extended min zoom (was 50)
      )
    );

    setZoom(newZoom);

    // Center the selection in the artboard
    setCanvasPosition({
      x: artboardW / 2 - selectionCenterX * (newZoom / 100),
      y: artboardH / 2 - selectionCenterY * (newZoom / 100),
    });
  };

  // Helper: Reset view to artboard at 75% zoom
  const handleResetView = () => {
    setZoom(75);
    // Center the artboard in the viewport
    setCanvasPosition({
      x: 0,
      y: 0,
    });
    // Reset transform origin to center
    setTransformOrigin("center center");
  };

  // Handle drag and drop import
  const handleFileDrop = async (file: File) => {
    // Handle image files
    if (file.type.startsWith("image/")) {
      try {
        const dataURL = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.onerror = () => reject(new Error("Failed to read image file"));
          reader.readAsDataURL(file);
        });

        // Create image element from dropped file
        addImageElement(dataURL);
      } catch (error) {
        console.error("Error processing image file:", error);
        alert("Failed to process image file.");
      }
      return;
    }

    // Handle JSON canvas files
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
      <div className="bg-background flex h-dvh w-full overflow-hidden">
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
          handleContextMenu={handleContextMenu}
          handleTouchStart={handleTouchStart}
          handleTouchMove={handleTouchMove}
          handleTouchEnd={handleTouchEnd}
          selectionRectangle={getSelectionRectangle()}
        />

        {/* Layers Panel */}
        {layersOpen && <LayersPanel />}

        {/* Canvas Toolbar */}
        <CanvasToolbar
          zoom={zoom}
          setZoom={setZoom}
          onZoomToSelection={handleZoomToSelection}
          onResetView={handleResetView}
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
