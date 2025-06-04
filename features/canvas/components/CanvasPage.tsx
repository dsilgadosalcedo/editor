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
import ProjectHeader from "./navigation/ProjectHeader";
import { AutoSave } from "./AutoSave";
import ImportProjectDialog, { ImportChoice } from "./ImportProjectDialog";
import { useCanvasPanZoom } from "../hooks/useCanvasPanZoom";
import { useDragSelection } from "../hooks/useDragSelection";
import { useCanvasStore } from "../store/useCanvasStore";
import {
  useElements,
  useSelectedElements,
  useArtboardDimensions,
  usePanSensitivity,
  useZoomSensitivity,
  useRightSidebarDocked,
  useCanvasActions,
  useSelectionActions,
  useHistoryActions,
} from "../store/selectors";
import type { ToolType } from "../types/props";
import { ColorPickerProvider } from "./ColorPicker";
import { toast } from "sonner";
import { useTheme } from "next-themes";
import { useShallow } from "zustand/react/shallow";
import { generateRandomImage } from "../services/image-service";
import { importCanvasFromFile } from "../services/file-operations";
import {
  isProjectLimitReached,
  createProjectWithLimitCheck,
} from "@/lib/project-storage";
import { useRouter } from "next/navigation";

// Utility function to clear text selection
const clearTextSelection = () => {
  if (window.getSelection) {
    const selection = window.getSelection();
    if (selection) {
      selection.removeAllRanges();
    }
  }
};

export default function CanvasPage() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const artboardRef = useRef<HTMLDivElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const [showGuides, setShowGuides] = useState(true);
  const [selectedTool, setSelectedTool] = useState<ToolType>(null);
  const [layersOpen, setLayersOpen] = useState(true);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importData, setImportData] = useState<any>(null);
  const router = useRouter();

  // Use optimized selectors to prevent unnecessary re-renders
  const elements = useElements();
  const selectedElements = useSelectedElements();
  const artboardDimensions = useArtboardDimensions();
  const panSensitivity = usePanSensitivity();
  const zoomSensitivity = useZoomSensitivity();
  const rightSidebarDocked = useRightSidebarDocked();

  // Group related actions using optimized selectors
  const canvasActions = useCanvasActions();
  const selectionActions = useSelectionActions();
  const historyActions = useHistoryActions();

  // Additional actions that need individual selectors
  const layerActions = useCanvasStore(
    useShallow((state) => ({
      moveElementUp: state.moveElementUp,
      moveElementDown: state.moveElementDown,
      moveElement: state.moveElement,
    }))
  );

  const fileActions = useCanvasStore(
    useShallow((state) => ({
      importElements: state.importElements,
      importCanvas: state.importCanvas,
      saveCanvas: state.saveCanvas,
      loadCanvas: state.loadCanvas,
    }))
  );

  const { setTheme, theme } = useTheme();

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
        // Save with Ctrl/Cmd+S (prevent default but do nothing - auto-save is enabled)
        if (key === "s") {
          e.preventDefault();
          // Projects are auto-saved, so we don't need to do anything
          return;
        }

        // Load with Ctrl/Cmd+O (prevent default but do nothing - use projects page)
        if (key === "o") {
          e.preventDefault();
          // Use the projects page to load projects instead
          return;
        }

        // Select All with Ctrl/Cmd+A (only when not typing in inputs)
        if (key === "a" && !isTyping) {
          e.preventDefault();
          // Select all elements
          const allElementIds = elements.map((el) => el.id);
          if (allElementIds.length > 0) {
            selectionActions.selectMultipleElements(allElementIds);
          }
          return;
        }

        // Undo/Redo with Ctrl/Cmd+Z (only when not typing in inputs)
        if (key === "z" && !isTyping) {
          e.preventDefault();
          if (e.shiftKey) {
            historyActions.redo();
          } else {
            historyActions.undo();
          }
          return;
        }

        // Copy with Ctrl/Cmd+C (only when not typing in inputs and element is selected)
        if (key === "c" && selectedElements.length > 0 && !isTyping) {
          e.preventDefault();
          selectionActions.copySelection();
          return;
        }

        // Paste with Ctrl/Cmd+V (only when not typing in inputs)
        if (key === "v" && !isTyping) {
          e.preventDefault();
          selectionActions.pasteClipboard();
          return;
        }

        // Move element up one layer with Ctrl/Cmd+ArrowUp (only when not typing and single element is selected)
        if (key === "arrowup" && selectedElements.length === 1 && !isTyping) {
          e.preventDefault();
          layerActions.moveElementUp(selectedElements[0]);
          return;
        }

        // Move element down one layer with Ctrl/Cmd+ArrowDown (only when not typing and single element is selected)
        if (key === "arrowdown" && selectedElements.length === 1 && !isTyping) {
          e.preventDefault();
          layerActions.moveElementDown(selectedElements[0]);
          return;
        }

        // Toggle theme with Ctrl/Cmd+Shift+L (only when not typing in inputs)
        if (key === "l" && e.shiftKey && !isTyping) {
          e.preventDefault();
          setTheme(theme === "dark" ? "light" : "dark");
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
        selectedElements.forEach((id) => canvasActions.deleteElement(id));
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
          selectionActions.clearSelection();
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
          layerActions.moveElement(id, dx, dy);
        });

        return;
      }

      // Add element shortcuts: 1=text, 2=rectangle, 3=image (when not typing)
      if (!isTyping && !modifier && !e.altKey && !e.shiftKey) {
        if (e.key === "1") {
          e.preventDefault();
          canvasActions.addElement("text");
          return;
        }
        if (e.key === "2") {
          e.preventDefault();
          canvasActions.addElement("rectangle");
          return;
        }
        if (e.key === "3") {
          e.preventDefault();
          // Generate a random image automatically instead of prompting
          const imageUrl = generateRandomImage({ width: 300, height: 200 });
          canvasActions.addImageElement(imageUrl);
          return;
        }
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [
    elements,
    selectedElements,
    canvasActions,
    selectionActions,
    historyActions,
    layerActions,
    setTheme,
    theme,
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
    selectionActions.selectMultipleElements,
    artboardDimensions
  );

  // Combined mouse handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    // Clear any existing text selection to prevent browser text selection during canvas interactions
    clearTextSelection();

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

    // Calculate bounding box of all selected elements (in artboard coordinates)
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

    // Get viewport dimensions
    const viewportW = window.innerWidth;
    const viewportH = window.innerHeight;
    const padding = 60; // px margin around selection

    // Calculate zoom to fit selection with padding
    const scaleX = (viewportW - padding * 2) / selectionWidth;
    const scaleY = (viewportH - padding * 2) / selectionHeight;
    const newZoom = Math.round(
      Math.min(
        800, // Max zoom
        Math.max(10, Math.min(scaleX, scaleY) * 100) // Min zoom
      )
    );

    setZoom(newZoom);

    // Calculate where the artboard center should be in viewport to center the selection
    // Account for artboard offset: the artboard is positioned at calc(50% - 90px) left and calc(50% - 40px) top
    const artboardOffsetX = viewportW / 2 - 90; // matches artboard positioning
    const artboardOffsetY = viewportH / 2 - 40; // matches artboard positioning

    // Calculate canvas position to center the selection in viewport
    // We want: viewportCenter = artboardOffset + artboardCenter + (selectionCenter - artboardCenter) * zoom
    // Solving for canvasPosition: canvasPosition = viewportCenter - (artboardOffset + selectionCenter * zoom)
    const targetCanvasX =
      viewportW / 2 - (artboardOffsetX + selectionCenterX * (newZoom / 100));
    const targetCanvasY =
      viewportH / 2 - (artboardOffsetY + selectionCenterY * (newZoom / 100));

    setCanvasPosition({
      x: targetCanvasX,
      y: targetCanvasY,
    });
  };

  // Helper: Reset view to artboard at 75% zoom
  const handleResetView = () => {
    setZoom(75);
    // Center the artboard in the viewport accounting for its offset positioning
    // The artboard is positioned at calc(50% - 90px) left and calc(50% - 40px) top
    // So to center it, we need to account for these offsets
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
        canvasActions.addImageElement(dataURL);
      } catch (error) {
        console.error("Error processing image file:", error);
        toast.error("Failed to process image file.");
      }
      return;
    }

    // Handle JSON canvas/project files
    if (file.type.includes("json")) {
      try {
        const result = await importCanvasFromFile(file);
        if (result.success && result.elements) {
          // Check if this looks like a project file (has project metadata or artboard settings)
          const hasProjectMetadata = result.projectName || result.artboard;

          if (hasProjectMetadata) {
            // Show import dialog for project files
            setImportData({
              elements: result.elements,
              artboardDimensions: result.artboardDimensions,
              version: result.version,
              timestamp: result.timestamp,
              projectName: result.projectName,
              artboard: result.artboard,
            });
            setShowImportDialog(true);
          } else {
            // For basic canvas files without project metadata, import as elements directly
            const importResult = await fileActions.importCanvas(file);
            if (!importResult.success) {
              toast.error("Failed to import canvas elements.");
            }
          }
        } else {
          toast.error(
            "Failed to import file. Please make sure it's a valid canvas or project file."
          );
        }
      } catch (error) {
        console.error("Error importing file:", error);
        toast.error(
          "Failed to import file. Please make sure it's a valid canvas or project file."
        );
      }
      return;
    }

    // Unsupported file type
    toast.error(
      "Unsupported file type. Please drop an image or JSON project file."
    );
  };

  // Handle import choice from dialog
  const handleImportChoice = async (choice: ImportChoice) => {
    if (choice.type === "elements") {
      // Import as elements to current canvas using a safer approach
      try {
        // Add a small delay to prevent rapid state changes
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Use the safe importElements action from the store
        const result = fileActions.importElements(choice.data.elements);

        if (!result.success) {
          toast.error("Failed to import elements");
        }
      } catch (error) {
        console.error("Error importing elements:", error);
        toast.error("Failed to import elements");
      }
    } else if (choice.type === "project") {
      // Create new project
      const projectLimitReached = isProjectLimitReached();

      // Prepare project data
      const projectData = {
        elements: choice.data.elements,
        artboardDimensions: choice.data.artboardDimensions,
      };

      if (projectLimitReached) {
        // Auto-remove oldest project and create new one
        const result = createProjectWithLimitCheck(
          undefined,
          choice.data.projectName || `Imported Project`,
          projectData
        );

        if (result.project) {
          if (result.autoRemoved && result.removedProjects) {
            toast.info(
              `Removed oldest project "${result.removedProjects[0].name}" to make room`
            );
          }
          // Store artboard settings for the canvas page to apply
          if (choice.data.artboard) {
            sessionStorage.setItem(
              `import-artboard-${result.project.id}`,
              JSON.stringify(choice.data.artboard)
            );
          }
          router.push(`/canvas/${result.project.id}`);
        } else {
          toast.error("Failed to create project");
        }
      } else {
        const result = createProjectWithLimitCheck(
          undefined,
          choice.data.projectName || `Imported Project`,
          projectData
        );

        if (result.project) {
          // Store artboard settings for the canvas page to apply
          if (choice.data.artboard) {
            sessionStorage.setItem(
              `import-artboard-${result.project.id}`,
              JSON.stringify(choice.data.artboard)
            );
          }
          router.push(`/canvas/${result.project.id}`);
        } else {
          toast.error("Failed to create project");
        }
      }
    }
  };

  return (
    <ColorPickerProvider>
      <div className="bg-background flex h-dvh w-full overflow-hidden">
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
        {/* {layersOpen && <LayersPanel />} */}

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

      {/* Left Sidebar */}
      <ToolSidebar
        selectedTool={selectedTool}
        onSelectTool={setSelectedTool}
        onToggleLayers={() => setLayersOpen((prev) => !prev)}
        layersOpen={layersOpen}
      />

      {/* Project Header */}
      <ProjectHeader />

      {/* Keyboard Shortcuts Overlay */}
      <KeyboardShortcuts />

      {/* Drag and Drop Overlay */}
      <DragDropOverlay onFileDrop={handleFileDrop} />

      {/* Auto Save */}
      <AutoSave />

      {/* Import Project Dialog */}
      <ImportProjectDialog
        isOpen={showImportDialog}
        onClose={() => setShowImportDialog(false)}
        onChoice={handleImportChoice}
        projectData={importData}
        isProjectLimitReached={isProjectLimitReached()}
      />
    </ColorPickerProvider>
  );
}
