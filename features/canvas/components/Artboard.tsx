import React, { useMemo } from "react";
import CanvasElement from "./CanvasElement";
import ArtboardControlPoints from "./ArtboardControlPoints";
import ElementFloatingToolbar from "./ElementFloatingToolbar";
import MultiSelectionUI from "./MultiSelectionUI";
import { useCanvasStore } from "../store/useCanvasStore";
import { useShallow } from "zustand/react/shallow";

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
  onTextResizingChange?: (
    id: string,
    mode: "auto-width" | "auto-height" | "fixed"
  ) => void;
  selectedTool: string | null;
  canvasPosition: { x: number; y: number };
  artboardRef: React.RefObject<HTMLDivElement | null>;
  canvasContainerRef: React.RefObject<HTMLDivElement | null>;
  onUpdateCornerRadius?: (id: string, cornerRadius: number) => void;
  onUpdateCornerRadiusNoHistory?: (id: string, cornerRadius: number) => void;
  onUpdateFontSize?: (id: string, fontSize: number) => void;
  onUpdateLineHeight?: (id: string, lineHeight: number) => void;
  onUpdateRotation?: (id: string, rotation: number) => void;
  onUpdateRotationNoHistory?: (id: string, rotation: number) => void;
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
  onTextResizingChange,
  selectedTool,
  canvasPosition,
  artboardRef,
  canvasContainerRef,
  onUpdateCornerRadius,
  onUpdateCornerRadiusNoHistory,
  onUpdateFontSize,
  onUpdateLineHeight,
  onUpdateRotation,
  onUpdateRotationNoHistory,
  onResizeArtboard,
  onAddToHistory,
}) => {
  // Use optimized selectors to prevent unnecessary re-renders
  const isolatedGroupId = useCanvasStore((state) => state.isolatedGroupId);

  // Group related isolation functions using useShallow
  const isolationActions = useCanvasStore(
    useShallow((state) => ({
      getElementDescendants: state.getElementDescendants,
      exitIsolationMode: state.exitIsolationMode,
    }))
  );

  // Viewport virtualization - only render visible elements for better performance
  const visibleElements = useMemo(() => {
    // Filter elements based on isolation mode first
    let filteredElements = elements;

    if (isolatedGroupId) {
      // In isolation mode, show all elements but mark them for different rendering
      const isolatedDescendants =
        isolationActions.getElementDescendants(isolatedGroupId);
      filteredElements = elements.map((el) => ({
        ...el,
        isolated: el.id === isolatedGroupId,
        inIsolatedGroup: isolatedDescendants.includes(el.id),
        // Elements not in the isolated group become non-selectable
        isInIsolationMode: true,
        isSelectableInIsolation:
          el.id === isolatedGroupId || isolatedDescendants.includes(el.id),
      }));
    } else {
      // When not in isolation mode, show all elements normally
      filteredElements = elements.map((el) => ({
        ...el,
        isolated: false,
        inIsolatedGroup: false,
        isInIsolationMode: false,
        isSelectableInIsolation: true,
      }));
    }

    // If we have fewer than 50 elements, render all for simplicity
    if (filteredElements.length < 50) {
      return filteredElements;
    }

    // Calculate visible viewport bounds based on canvas position and zoom
    const zoomFactor = zoom / 100;
    const viewportWidth =
      typeof window !== "undefined" ? window.innerWidth : 1920;
    const viewportHeight =
      typeof window !== "undefined" ? window.innerHeight : 1080;

    // Calculate the visible area in artboard coordinates
    const visibleLeft =
      -canvasPosition.x / zoomFactor - viewportWidth / (2 * zoomFactor);
    const visibleTop =
      -canvasPosition.y / zoomFactor - viewportHeight / (2 * zoomFactor);
    const visibleRight =
      -canvasPosition.x / zoomFactor + viewportWidth / (2 * zoomFactor);
    const visibleBottom =
      -canvasPosition.y / zoomFactor + viewportHeight / (2 * zoomFactor);

    // Add buffer zone around viewport to prevent flickering during panning
    const buffer = 200; // 200px buffer around visible area
    const bufferedLeft = visibleLeft - buffer;
    const bufferedTop = visibleTop - buffer;
    const bufferedRight = visibleRight + buffer;
    const bufferedBottom = visibleBottom + buffer;

    // Filter elements that intersect with the visible area (including buffer)
    return filteredElements.filter((element) => {
      // Always render selected elements regardless of visibility
      if (selectedElements.includes(element.id)) {
        return true;
      }

      // Check if element intersects with buffered viewport
      const elementLeft = element.x;
      const elementTop = element.y;
      const elementRight = element.x + element.width;
      const elementBottom = element.y + element.height;

      // Element is visible if it intersects with the viewport
      return !(
        elementRight < bufferedLeft ||
        elementLeft > bufferedRight ||
        elementBottom < bufferedTop ||
        elementTop > bufferedBottom
      );
    });
  }, [
    elements,
    selectedElements,
    canvasPosition,
    zoom,
    isolatedGroupId,
    // Removed isolationActions.getElementDescendants from dependencies to prevent infinite re-renders
  ]);

  // Development logging for virtualization effectiveness
  React.useEffect(() => {
    if (process.env.NODE_ENV === "development" && elements.length > 50) {
      console.log(
        `Virtualization: Rendering ${visibleElements.length}/${
          elements.length
        } elements (${Math.round(
          (visibleElements.length / elements.length) * 100
        )}% visible)${isolatedGroupId ? " [ISOLATION MODE]" : ""}`
      );
    }
  }, [visibleElements.length, elements.length, isolatedGroupId]);
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
        className="bg-card/50 relative mx-auto my-auto"
        style={{
          width: `${artboardDimensions.width}px`,
          height: `${artboardDimensions.height}px`,
          transform: `scale(${zoom / 100})`,
          transformOrigin: transformOrigin,
          transition: "transform 0.2s ease",
          position: "absolute",
          left: "calc(50% - 90px)", // Adjusted to account for left UI elements and better visual centering
          top: "calc(50% - 40px)", // Adjusted to account for bottom toolbar (approximately 80px height + margin)
          marginLeft: `-${artboardDimensions.width / 2}px`,
          marginTop: `-${artboardDimensions.height / 2}px`,
        }}
        onMouseDown={(e) => {
          // Only clear selection if clicking directly on the artboard background
          // Don't clear if clicking on an element or its controls
          const target = e.target as HTMLElement;
          if (target === e.currentTarget) {
            // Don't clear selection when in isolation mode to prevent accidental exit
            if (!isolatedGroupId) {
              onSelectElement(null);
            }
          }
        }}
        onTouchStart={(e) => {
          // Only clear selection if touching directly on the artboard background
          const target = e.target as HTMLElement;
          if (target === e.currentTarget) {
            // Don't clear selection when in isolation mode to prevent accidental exit
            if (!isolatedGroupId) {
              onSelectElement(null);
            }
          }
        }}
        onDoubleClick={(e) => {
          if (isolatedGroupId) {
            e.stopPropagation();
            isolationActions.exitIsolationMode();
          }
        }}
      >
        {showGuides && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage:
                "linear-gradient(to right, var(--background) 1px, transparent 1px), linear-gradient(to bottom,  var(--background) 1px, var(--sidebar) 1px)",
              backgroundSize: "20px 20px",
            }}
          />
        )}
        {visibleElements.map((element) => (
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
            onTextResizingChange={(mode) =>
              onTextResizingChange?.(element.id, mode)
            }
            isPanMode={selectedTool === "hand"}
            zoom={zoom}
            onUpdateCornerRadius={onUpdateCornerRadius}
            onUpdateCornerRadiusNoHistory={onUpdateCornerRadiusNoHistory}
            onUpdateFontSize={onUpdateFontSize}
            onUpdateLineHeight={onUpdateLineHeight}
            onUpdateRotation={onUpdateRotation}
            onUpdateRotationNoHistory={onUpdateRotationNoHistory}
            onAddToHistory={onAddToHistory}
            isMultipleSelected={selectedElements.length > 1}
          />
        ))}
        {/* Multi-selection UI */}
        <MultiSelectionUI
          selectedElements={elements.filter((el) =>
            selectedElements.includes(el.id)
          )}
          zoom={zoom}
          onResizeStart={(dir, e) => {
            // Handle multi-selection resize start
            e.stopPropagation();
            e.preventDefault();
            // For now, we'll just prevent the action since multi-resize is complex
            // In the future, this could be implemented to resize all selected elements proportionally
          }}
          onResizeTouchStart={(dir, e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
          onResizeDoubleClick={(e) => {
            e.stopPropagation();
          }}
        />

        {/* Artboard control points - always visible, never hide */}
        <ArtboardControlPoints
          artboardDimensions={artboardDimensions}
          onResizeArtboard={onResizeArtboard}
          zoom={zoom}
        />

        {/* Floating Toolbar for Multiple Selections */}
        {(() => {
          const selectedElementsData = elements.filter((el) =>
            selectedElements.includes(el.id)
          );

          // Show toolbar only for multiple selections
          if (selectedElementsData.length <= 1) return null;

          // Calculate the center position of the selection
          let minX = Infinity,
            minY = Infinity,
            maxX = -Infinity,
            maxY = -Infinity;

          selectedElementsData.forEach((el) => {
            minX = Math.min(minX, el.x);
            minY = Math.min(minY, el.y);
            maxX = Math.max(maxX, el.x + el.width);
            maxY = Math.max(maxY, el.y + el.height);
          });

          const centerX = (minX + maxX) / 2;
          const centerY = minY; // Position at the top of the selection

          return (
            <ElementFloatingToolbar
              elementId={selectedElementsData[0].id} // Use first element's ID
              elementType="rectangle" // Dummy type for multiple selections
              elementColor="transparent" // No color picker for multiple selections
              position={{ x: centerX, y: centerY }}
              zoom={zoom}
              isRotating={false}
              elementName="Multiple Elements"
              isMultipleSelection={true}
            />
          );
        })()}
      </div>
    </div>
  );
};

export default Artboard;
