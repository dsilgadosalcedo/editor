"use client";

import React, { useRef, useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import ElementFloatingToolbar from "./ElementFloatingToolbar";
import { useCanvasStore } from "../store/useCanvasStore.new";
import { useIsolatedGroupId, useElements } from "../store/selectors";
import { useShallow } from "zustand/react/shallow";
import { CanvasElementProps } from "../types";
import { calculateRotatedResize, transformRotatedResize } from "../utils";

// Import services
import {
  createElementDragHandlers,
  createElementResizeHandlers,
  createElementRotationHandlers,
  createFontScaleHandlers,
  createCornerRadiusHandlers,
  type ElementDragState,
  type ResizeState,
  type RotationState,
  type FontScaleState,
  type CornerRadiusState,
} from "../services/element-interactions";

import {
  calculateTextAutoResize,
  createTextEditingHandlers,
  createTextInputHandlers,
  handleTextFitContent,
  getTextStyles,
  getTextAlignmentClasses,
} from "../services/text-operations";

import {
  getRotatedCursor,
  getElementContainerStyles,
  getElementContainerClasses,
  getImageStyles,
  getGroupLabelStyles,
  getResizeHandleStyles,
  getFontScaleHandleStyles,
  getRotationHandleStyles,
  getCornerRadiusHandleStyles,
  getSelectionContainerStyles,
  getSelectionBorderStyles,
  getRotationIndicatorStyles,
} from "../services/element-rendering";

import {
  createGroupInteractionHandlers,
  createIsolationUIHelpers,
  type IsolationContext,
} from "../services/isolation-operations";

export default function CanvasElement({
  element,
  onSelect,
  onMove,
  onMoveNoHistory,
  onResize,
  onResizeNoHistory,
  onTextChange,
  isPanMode = false,
  zoom,
  onUpdateCornerRadius,
  onUpdateCornerRadiusNoHistory,
  onUpdateFontSize,
  onUpdateLineHeight,
  onUpdateRotation,
  onUpdateRotationNoHistory,
  isMultipleSelected = false,
  onAddToHistory,
}: CanvasElementProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  // State management
  const [dragState, setDragState] = useState<ElementDragState>({
    isDragging: false,
    startX: 0,
    startY: 0,
  });
  const [resizeState, setResizeState] = useState<ResizeState>({
    isResizing: false,
    direction: "",
    startWidth: 0,
    startHeight: 0,
    startX: 0,
    startY: 0,
  });
  const [rotationState, setRotationState] = useState<RotationState>({
    isRotating: false,
    startX: 0,
    startY: 0,
    startRotation: 0,
    centerX: 0,
    centerY: 0,
  });
  const [fontScaleState, setFontScaleState] = useState<FontScaleState>({
    isFontScaling: false,
    startX: 0,
    startY: 0,
    startFontSize: 0,
    startLineHeight: 0,
    startWidth: 0,
    startHeight: 0,
  });
  const [cornerRadiusState, setCornerRadiusState] = useState<CornerRadiusState>(
    {
      isCornerRadiusDragging: false,
      startX: 0,
      startY: 0,
      startCornerRadius: 0,
    }
  );

  const [isEditing, setIsEditing] = useState(false);
  const [justDragged, setJustDragged] = useState(false);
  const [prepareDrag, setPrepareDrag] = useState(false);

  // Use optimized selectors to prevent unnecessary re-renders
  const isolatedGroupId = useIsolatedGroupId();

  // Get isolation actions using useShallow to prevent re-renders
  const isolationActions = useCanvasStore(
    useShallow((state) => ({
      enterIsolationMode: state.enterIsolationMode,
      exitIsolationMode: state.exitIsolationMode,
    }))
  );

  // Get elements for isolation calculations
  const elements = useElements();

  // Create isolation context
  const isolationContext: IsolationContext = {
    isInIsolationMode: Boolean(isolatedGroupId),
    isolatedGroupId: isolatedGroupId || undefined,
  };

  // Get isolation UI helpers
  const isolationUI = createIsolationUIHelpers(element, isolationContext);

  // Create a stable store wrapper for group interactions
  const stableStoreWrapper = React.useMemo(
    () => ({
      getState: () => ({
        elements: elements,
      }),
      enterIsolationMode: isolationActions.enterIsolationMode,
      exitIsolationMode: isolationActions.exitIsolationMode,
    }),
    [
      elements,
      isolationActions.enterIsolationMode,
      isolationActions.exitIsolationMode,
    ]
  );

  // Auto-resize text elements based on content
  useEffect(() => {
    if (element.type === "text" && element.textResizing) {
      const content =
        isEditing && textRef.current
          ? textRef.current.textContent || "Text"
          : element.content || "Text";

      const newDimensions = calculateTextAutoResize(
        content,
        {
          textResizing: element.textResizing,
          width: element.width,
          height: element.height,
          fontSize: element.fontSize || 16,
          fontWeight: element.fontWeight || 400,
          letterSpacing: element.letterSpacing || 0,
          lineHeight: element.lineHeight || (element.fontSize || 16) * 1.2,
        },
        isEditing
      );

      if (
        Math.abs(newDimensions.width - element.width) > 2 ||
        Math.abs(newDimensions.height - element.height) > 2
      ) {
        onResizeNoHistory(newDimensions.width, newDimensions.height);
      }
    }
  }, [
    element.content,
    element.fontSize,
    element.fontWeight,
    element.letterSpacing,
    element.lineHeight,
    element.textResizing,
    element.width,
    element.height,
    isEditing,
    onResizeNoHistory,
  ]);

  // Real-time text input handlers for auto-width
  useEffect(() => {
    if (
      !isEditing ||
      element.type !== "text" ||
      element.textResizing !== "auto-width"
    ) {
      return;
    }

    const { attachInputListeners } = createTextInputHandlers(
      element,
      onResizeNoHistory,
      textRef
    );

    return attachInputListeners();
  }, [isEditing, element, onResizeNoHistory]);

  // Create wrapper functions to adapt prop signatures to service expectations
  const handleUpdateRotation = (rotation: number) => {
    onUpdateRotation?.(element.id, rotation);
  };

  const handleUpdateRotationNoHistory = (rotation: number) => {
    onUpdateRotationNoHistory?.(element.id, rotation);
  };

  const handleUpdateFontSize = (fontSize: number) => {
    onUpdateFontSize?.(element.id, fontSize);
  };

  const handleUpdateLineHeight = (lineHeight: number) => {
    onUpdateLineHeight?.(element.id, lineHeight);
  };

  const handleUpdateCornerRadius = (radius: number) => {
    onUpdateCornerRadius?.(element.id, radius);
  };

  const handleUpdateCornerRadiusNoHistory = (radius: number) => {
    onUpdateCornerRadiusNoHistory?.(element.id, radius);
  };

  // Create event handlers using services
  const dragHandlers = createElementDragHandlers(
    element.id,
    onMove,
    onMoveNoHistory,
    onAddToHistory,
    zoom,
    dragState,
    setDragState,
    setPrepareDrag,
    setJustDragged
  );

  const resizeHandlers = createElementResizeHandlers(
    element,
    onResize,
    onResizeNoHistory,
    onAddToHistory,
    zoom,
    setResizeState,
    transformRotatedResize
  );

  const rotationHandlers = createElementRotationHandlers(
    element,
    handleUpdateRotation,
    handleUpdateRotationNoHistory,
    onAddToHistory,
    zoom,
    setRotationState
  );

  const fontScaleHandlers = createFontScaleHandlers(
    element,
    handleUpdateFontSize,
    handleUpdateLineHeight,
    onResize,
    zoom,
    setFontScaleState
  );

  const cornerRadiusHandlers = createCornerRadiusHandlers(
    element,
    handleUpdateCornerRadius,
    handleUpdateCornerRadiusNoHistory,
    onAddToHistory,
    zoom,
    setCornerRadiusState
  );

  const textEditingHandlers = createTextEditingHandlers(
    element,
    onTextChange,
    setIsEditing,
    textRef
  );

  const groupInteractionHandlers = createGroupInteractionHandlers(
    element,
    stableStoreWrapper
  );

  // Handle element selection and drag initiation
  const handleElementMouseDown = (e: React.MouseEvent) => {
    // Skip if clicking on handles or toolbar
    const target = e.target as HTMLElement;
    if (target.closest("[data-handle]") || target.closest("[data-toolbar]")) {
      return;
    }

    // Select the element if not already selected
    if (!element.selected) {
      onSelect(e.shiftKey || e.ctrlKey || e.metaKey);
    }

    // Call the drag handler
    dragHandlers.handleMouseDown(e);
  };

  const handleElementTouchStart = (e: React.TouchEvent) => {
    // Select the element if not already selected
    if (!element.selected) {
      onSelect(false);
    }

    // Call the drag handler
    dragHandlers.handleTouchStart(e);
  };

  // Handle resize double-click to fit text
  const handleResizeDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleTextFitContent(element, textRef, onResize);
  };

  // Don't render anything if element is hidden
  if (element.visible === false) {
    return null;
  }

  return (
    <>
      <div
        ref={elementRef}
        className={getElementContainerClasses(element)}
        style={getElementContainerStyles(element, zoom)}
        onMouseDown={handleElementMouseDown}
        onTouchStart={handleElementTouchStart}
        onDoubleClick={
          element.type === "text"
            ? textEditingHandlers.handleTextDoubleClick
            : groupInteractionHandlers.handleGeneralDoubleClick
        }
      >
        {/* Image rendering */}
        {element.type === "image" && (
          <img
            src={element.src}
            alt="Canvas element"
            className="w-full h-full object-cover"
            style={getImageStyles(element)}
            draggable={false}
          />
        )}

        {/* Text rendering */}
        {element.type === "text" && (
          <div
            ref={textRef}
            contentEditable={isEditing}
            suppressContentEditableWarning
            onBlur={textEditingHandlers.handleTextBlur}
            onInput={textEditingHandlers.handleTextChange}
            onKeyDown={textEditingHandlers.handleTextKeyDown}
            className={cn(
              "w-full h-full flex outline-none overflow-hidden",
              getTextAlignmentClasses(element),
              isEditing && "bg-blue-600/30"
            )}
            style={getTextStyles(element)}
          >
            {!isEditing && element.content}
          </div>
        )}

        {/* Group label */}
        {element.type === "group" && element.selected && (
          <div
            className="absolute -top-5 left-0 text-xs text-blue-600 bg-white/80 px-1 rounded pointer-events-none font-medium"
            style={getGroupLabelStyles(element, zoom)}
          >
            {element.name || "Group"}
          </div>
        )}
      </div>

      {/* Selection UI */}
      {element.selected && (
        <>
          <div
            className="absolute pointer-events-none"
            style={getSelectionContainerStyles(element)}
          >
            {/* Selection border */}
            <div
              className="absolute pointer-events-none border-blue-500 rounded-none"
              style={getSelectionBorderStyles(element, zoom)}
            />

            {/* Resize handles */}
            {!isMultipleSelected && element.type === "text" ? (
              // Text elements: Font scale handle
              <div
                data-handle="font-scale"
                className="absolute w-3 h-3 hover:scale-125 transition-all duration-100 ease-out rounded-full bg-orange-200 border border-white inset-shadow-sm inset-shadow-orange-300 shadow-sm cursor-nwse-resize"
                style={getFontScaleHandleStyles(element, zoom)}
                onMouseDown={fontScaleHandlers.handleFontScaleDragStart}
                title="Drag to scale text size"
              />
            ) : !isMultipleSelected ? (
              // Rectangle, Image, and Group elements: Corner handles
              <>
                {["nw", "ne", "sw", "se"].map((direction) => (
                  <div
                    key={direction}
                    data-handle={`resize-${direction}`}
                    className={`absolute w-2 h-2 border-[0.5px] border-blue-100 inset-shadow-xs inset-shadow-blue-400/50 bg-blue-400/70 rounded-full shadow-sm hover:scale-140 transition-transform ease-out backdrop-blur-xs ${getRotatedCursor(
                      direction,
                      element.rotation || 0
                    )}`}
                    style={getResizeHandleStyles(element, zoom, direction)}
                    onMouseDown={(e) =>
                      resizeHandlers.handleResizeStart(direction, e)
                    }
                    onTouchStart={(e) =>
                      resizeHandlers.handleResizeTouchStart(direction, e)
                    }
                    onDoubleClick={handleResizeDoubleClick}
                  />
                ))}
              </>
            ) : null}

            {/* Rotation handles */}
            {!isMultipleSelected &&
              element.type !== "text" &&
              !rotationState.isRotating && (
                <>
                  {(["tl", "tr", "bl", "br"] as const).map((position) => (
                    <div
                      key={position}
                      data-handle={`rotation-${position}`}
                      className="absolute w-8 h-8 rounded-full cursor-crosshair"
                      style={getRotationHandleStyles(element, zoom, position)}
                      onMouseDown={rotationHandlers.handleRotationStart}
                      title="Drag to rotate"
                    />
                  ))}
                </>
              )}

            {/* Text rotation handle */}
            {!isMultipleSelected &&
              element.type === "text" &&
              !rotationState.isRotating &&
              !isEditing && (
                <div
                  data-handle="rotation-text"
                  className="absolute w-8 h-8 rounded-full cursor-crosshair"
                  style={getRotationHandleStyles(element, zoom, "br")}
                  onMouseDown={rotationHandlers.handleRotationStart}
                  title="Drag to rotate"
                />
              )}

            {/* Corner radius handle */}
            {!isMultipleSelected &&
              (element.type === "rectangle" || element.type === "image") && (
                <div
                  data-handle="corner-radius"
                  className="absolute w-3 h-3 hover:scale-125 transition-all duration-200 ease-out rounded-full bg-orange-200 border border-white inset-shadow-sm inset-shadow-orange-300 shadow-sm cursor-pointer"
                  onMouseDown={cornerRadiusHandlers.handleCornerRadiusDragStart}
                  title="Drag to adjust corner radius"
                  style={{
                    ...getCornerRadiusHandleStyles(element, zoom),
                    opacity: resizeState.isResizing ? 0 : 1,
                  }}
                />
              )}

            {/* Rotation indicator */}
            {rotationState.isRotating && (
              <div
                className="absolute pointer-events-none text-xs bg-card/60 px-2 py-1 rounded-md shadow-lg border backdrop-blur-sm animate-[var(--animate-fade-up)]"
                style={getRotationIndicatorStyles(element, zoom)}
              >
                {Math.round(element.rotation || 0)}°
              </div>
            )}
          </div>
        </>
      )}

      {/* Floating Toolbar */}
      {element.selected &&
        !isMultipleSelected &&
        !(element.type === "text" && isEditing) &&
        !dragState.isDragging &&
        !resizeState.isResizing &&
        !justDragged && (
          <ElementFloatingToolbar
            elementId={element.id}
            elementType={element.type}
            elementColor={element.color}
            position={{
              x: element.x + element.width / 2,
              y: element.y,
            }}
            zoom={zoom}
            isRotating={rotationState.isRotating}
            elementName={element.name}
            isMultipleSelection={isMultipleSelected}
          />
        )}
    </>
  );
}
