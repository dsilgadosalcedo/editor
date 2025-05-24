"use client";

import type React from "react";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { useElementDragResize } from "../hooks/useElementDragResize";
import ElementFloatingToolbar from "./ElementFloatingToolbar";

interface CanvasElementProps {
  element: {
    id: string;
    type: "rectangle" | "text" | "image";
    x: number;
    y: number;
    width: number;
    height: number;
    content?: string;
    src?: string;
    color: string;
    selected: boolean;
    cornerRadius?: number;
    borderWidth?: number;
    borderColor?: string;
    shadowBlur?: number;
    shadowColor?: string;
    fontSize?: number;
    fontWeight?: number;
    letterSpacing?: number;
    lineHeight?: number;
    horizontalAlign?: "left" | "center" | "right";
    verticalAlign?: "top" | "middle" | "bottom";
    visible?: boolean;
    lockAspectRatio?: boolean;
  };
  onSelect: (addToSelection?: boolean) => void;
  onMove: (deltaX: number, deltaY: number) => void;
  onResize: (
    width: number,
    height: number,
    preserveAspectRatio?: boolean
  ) => void;
  onTextChange: (content: string) => void;
  isPanMode?: boolean;
  zoom: number;
  onUpdateCornerRadius?: (id: string, cornerRadius: number) => void;
  onUpdateFontSize?: (id: string, fontSize: number) => void;
  onUpdateLineHeight?: (id: string, lineHeight: number) => void;
  isMultipleSelected?: boolean;
}

export default function CanvasElement({
  element,
  onSelect,
  onMove,
  onResize,
  onTextChange,
  isPanMode = false,
  zoom,
  onUpdateCornerRadius,
  onUpdateFontSize,
  onUpdateLineHeight,
  isMultipleSelected = false,
}: CanvasElementProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [justDragged, setJustDragged] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({
    width: 0,
    height: 0,
    x: 0,
    y: 0,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isCornerRadiusDragging, setIsCornerRadiusDragging] = useState(false);
  const [cornerRadiusStart, setCornerRadiusStart] = useState({
    x: 0,
    y: 0,
    cornerRadius: 0,
  });
  const [isFontScaling, setIsFontScaling] = useState(false);
  const [fontScaleStart, setFontScaleStart] = useState({
    x: 0,
    y: 0,
    fontSize: 0,
    lineHeight: 0,
    width: 0,
    height: 0,
  });
  const [resizeDir, setResizeDir] = useState<string | null>(null);

  // Remove the local content state to prevent the infinite loop
  // We'll use the element.content directly

  // Handle element dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();

    // if (isPanMode) return;

    // Check for Ctrl/Cmd key for multiple selection
    const isMultiSelectKey = e.ctrlKey || e.metaKey;

    // Smart selection logic:
    // 1. If Ctrl/Cmd is held, toggle selection (add/remove from selection)
    // 2. If clicking on already selected element without Ctrl/Cmd and multiple elements are selected, don't change selection (start dragging)
    // 3. If clicking on non-selected element without Ctrl/Cmd, select only that element
    if (isMultiSelectKey) {
      // Modifier key held - toggle selection
      onSelect(true);
    } else if (!element.selected || !isMultipleSelected) {
      // Not holding modifier and (element not selected OR only single selection) - select this element only
      onSelect(false);
    }
    // If element is selected and multiple elements are selected and no modifier key, don't change selection

    if (element.type === "text" && isEditing) {
      return;
    }

    // Reset justDragged state for new interaction
    setJustDragged(false);
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation();

    // if (isPanMode) return;

    // For touch: if element is already selected and multiple elements are selected, don't change selection
    // Otherwise, select only this element
    if (!element.selected || !isMultipleSelected) {
      onSelect(false);
    }

    if (element.type === "text" && isEditing) {
      return;
    }

    // Reset justDragged state for new interaction
    setJustDragged(false);
    setIsDragging(true);
    setDragStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
  };

  // Handle element resizing, track which handle (direction)
  const handleResizeStart = (dir: string, e: React.MouseEvent) => {
    // if (isPanMode) return;

    e.stopPropagation();
    e.preventDefault();
    setIsResizing(true);
    setResizeDir(dir);
    setResizeStart({
      width: element.width,
      height: element.height,
      x: e.clientX,
      y: e.clientY,
    });
  };

  const handleResizeTouchStart = (dir: string, e: React.TouchEvent) => {
    // if (isPanMode) return;

    e.stopPropagation();
    e.preventDefault();
    setIsResizing(true);
    setResizeDir(dir);
    setResizeStart({
      width: element.width,
      height: element.height,
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    });
  };

  // Handle text editing
  const handleTextDoubleClick = (e: React.MouseEvent) => {
    // if (isPanMode) return;

    if (element.type === "text") {
      e.stopPropagation();
      setIsEditing(true);

      // Use setTimeout to ensure the DOM is ready
      setTimeout(() => {
        if (textRef.current) {
          // Set the initial content when starting to edit
          textRef.current.textContent = element.content || "";
          textRef.current.focus();

          // Move cursor to end of text
          const selection = window.getSelection();
          const range = document.createRange();

          // Select all text content
          range.selectNodeContents(textRef.current);
          // Collapse to end to place cursor at the end
          range.collapse(false);

          selection?.removeAllRanges();
          selection?.addRange(range);
        }
      }, 0);
    }
  };

  const handleTextBlur = () => {
    setIsEditing(false);
  };

  const handleTextChange = (e: React.FormEvent<HTMLDivElement>) => {
    const newContent = e.currentTarget.textContent || "";
    // Only call onTextChange when the content actually changes
    if (newContent !== element.content) {
      onTextChange(newContent);
    }
  };

  // Handle text key events
  const handleTextKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      textRef.current?.blur();
    } else if (e.key === "Escape") {
      e.preventDefault();
      textRef.current?.blur();
      setIsEditing(false);
    }
  };

  // Set up global mouse/touch move and up handlers
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const deltaX = (e.clientX - dragStart.x) / (zoom / 100);
        const deltaY = (e.clientY - dragStart.y) / (zoom / 100);

        // Mark as actually dragged when movement occurs
        setJustDragged(true);

        // Round to integers for clean positions
        onMove(Math.round(deltaX), Math.round(deltaY));
        setDragStart({ x: e.clientX, y: e.clientY });
      } else if (isResizing && resizeDir) {
        const dx = (e.clientX - resizeStart.x) / (zoom / 100);
        const dy = (e.clientY - resizeStart.y) / (zoom / 100);
        let newWidth = resizeStart.width;
        let newHeight = resizeStart.height;
        let moveX = 0;
        let moveY = 0;

        // Check if shift is pressed OR element has aspect ratio locked
        const preserveAspectRatio = e.shiftKey || element.lockAspectRatio;

        switch (resizeDir) {
          case "e":
            newWidth = resizeStart.width + dx;
            if (preserveAspectRatio) {
              const aspectRatio = resizeStart.height / resizeStart.width;
              newHeight = newWidth * aspectRatio;
            }
            break;
          case "w":
            newWidth = resizeStart.width - dx;
            moveX = dx;
            if (preserveAspectRatio) {
              const aspectRatio = resizeStart.height / resizeStart.width;
              newHeight = newWidth * aspectRatio;
              const heightDiff = newHeight - resizeStart.height;
              moveY = -heightDiff / 2;
            }
            break;
          case "s":
            newHeight = resizeStart.height + dy;
            if (preserveAspectRatio) {
              const aspectRatio = resizeStart.width / resizeStart.height;
              newWidth = newHeight * aspectRatio;
            }
            break;
          case "n":
            newHeight = resizeStart.height - dy;
            moveY = dy;
            if (preserveAspectRatio) {
              const aspectRatio = resizeStart.width / resizeStart.height;
              newWidth = newHeight * aspectRatio;
              const widthDiff = newWidth - resizeStart.width;
              moveX = -widthDiff / 2;
            }
            break;
          case "ne":
            newWidth = resizeStart.width + dx;
            newHeight = resizeStart.height - dy;
            moveY = dy;
            if (preserveAspectRatio) {
              // Calculate scale based on the more significant change
              const scaleX = newWidth / resizeStart.width;
              const scaleY = newHeight / resizeStart.height;
              // Use the scale that represents the larger absolute change from 1.0
              const scale =
                Math.abs(scaleX - 1) > Math.abs(scaleY - 1) ? scaleX : scaleY;
              newWidth = resizeStart.width * scale;
              newHeight = resizeStart.height * scale;
              moveY = resizeStart.height - newHeight;
            }
            break;
          case "nw":
            newWidth = resizeStart.width - dx;
            newHeight = resizeStart.height - dy;
            moveX = dx;
            moveY = dy;
            if (preserveAspectRatio) {
              const scaleX = newWidth / resizeStart.width;
              const scaleY = newHeight / resizeStart.height;
              // Use the scale that represents the larger absolute change from 1.0
              const scale =
                Math.abs(scaleX - 1) > Math.abs(scaleY - 1) ? scaleX : scaleY;
              newWidth = resizeStart.width * scale;
              newHeight = resizeStart.height * scale;
              moveX = resizeStart.width - newWidth;
              moveY = resizeStart.height - newHeight;
            }
            break;
          case "se":
            newWidth = resizeStart.width + dx;
            newHeight = resizeStart.height + dy;
            if (preserveAspectRatio) {
              const scaleX = newWidth / resizeStart.width;
              const scaleY = newHeight / resizeStart.height;
              // Use the scale that represents the larger absolute change from 1.0
              const scale =
                Math.abs(scaleX - 1) > Math.abs(scaleY - 1) ? scaleX : scaleY;
              newWidth = resizeStart.width * scale;
              newHeight = resizeStart.height * scale;
            }
            break;
          case "sw":
            newWidth = resizeStart.width - dx;
            newHeight = resizeStart.height + dy;
            moveX = dx;
            if (preserveAspectRatio) {
              const scaleX = newWidth / resizeStart.width;
              const scaleY = newHeight / resizeStart.height;
              // Use the scale that represents the larger absolute change from 1.0
              const scale =
                Math.abs(scaleX - 1) > Math.abs(scaleY - 1) ? scaleX : scaleY;
              newWidth = resizeStart.width * scale;
              newHeight = resizeStart.height * scale;
              moveX = resizeStart.width - newWidth;
            }
            break;
        }
        newWidth = Math.max(20, Math.round(newWidth));
        newHeight = Math.max(20, Math.round(newHeight));
        // Apply size change then position change
        onResize(newWidth, newHeight, preserveAspectRatio);
        if (moveX || moveY) {
          onMove(Math.round(moveX), Math.round(moveY));
        }
        // Update base for next incremental resize
        setResizeStart({
          width: newWidth,
          height: newHeight,
          x: e.clientX,
          y: e.clientY,
        });
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (isDragging) {
        const deltaX = (e.touches[0].clientX - dragStart.x) / (zoom / 100);
        const deltaY = (e.touches[0].clientY - dragStart.y) / (zoom / 100);

        // Mark as actually dragged when movement occurs
        setJustDragged(true);

        // Round to integers for clean positions
        onMove(Math.round(deltaX), Math.round(deltaY));
        setDragStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
      } else if (isResizing && resizeDir) {
        const dx = (e.touches[0].clientX - resizeStart.x) / (zoom / 100);
        const dy = (e.touches[0].clientY - resizeStart.y) / (zoom / 100);
        let newWidth = resizeStart.width;
        let newHeight = resizeStart.height;
        let moveX = 0;
        let moveY = 0;
        switch (resizeDir) {
          case "e":
            newWidth = resizeStart.width + dx;
            break;
          case "w":
            newWidth = resizeStart.width - dx;
            moveX = dx;
            break;
          case "s":
            newHeight = resizeStart.height + dy;
            break;
          case "n":
            newHeight = resizeStart.height - dy;
            moveY = dy;
            break;
          case "ne":
            newWidth = resizeStart.width + dx;
            newHeight = resizeStart.height - dy;
            moveY = dy;
            break;
          case "nw":
            newWidth = resizeStart.width - dx;
            newHeight = resizeStart.height - dy;
            moveX = dx;
            moveY = dy;
            break;
          case "se":
            newWidth = resizeStart.width + dx;
            newHeight = resizeStart.height + dy;
            break;
          case "sw":
            newWidth = resizeStart.width - dx;
            newHeight = resizeStart.height + dy;
            moveX = dx;
            break;
        }
        newWidth = Math.max(20, Math.round(newWidth));
        newHeight = Math.max(20, Math.round(newHeight));
        // Apply size change then position change
        onResize(newWidth, newHeight, false); // Touch doesn't support shift key
        if (moveX || moveY) {
          onMove(Math.round(moveX), Math.round(moveY));
        }
        // Update base for next incremental resize
        setResizeStart({
          width: newWidth,
          height: newHeight,
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
      setResizeDir(null);
    };

    const handleTouchEnd = () => {
      setIsDragging(false);
      setIsResizing(false);
      setResizeDir(null);
    };

    if (isDragging || isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.addEventListener("touchmove", handleTouchMove);
      document.addEventListener("touchend", handleTouchEnd);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [
    isDragging,
    isResizing,
    resizeDir,
    dragStart,
    resizeStart,
    onMove,
    onResize,
    zoom,
  ]);

  // Handle corner radius drag start
  const handleCornerRadiusDragStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsCornerRadiusDragging(true);
    setCornerRadiusStart({
      x: e.clientX,
      y: e.clientY,
      cornerRadius: element.cornerRadius || 0,
    });
  };

  // Handle corner radius drag move
  useEffect(() => {
    if (!isCornerRadiusDragging) return;
    const handleMouseMove = (e: MouseEvent) => {
      const dx = (e.clientX - cornerRadiusStart.x) / (zoom / 100);
      const dy = (e.clientY - cornerRadiusStart.y) / (zoom / 100);
      let newRadius = cornerRadiusStart.cornerRadius + (dx + dy) / 2;
      newRadius = Math.max(
        0,
        Math.min(Math.round(newRadius), element.width / 2, element.height / 2)
      );
      if (
        element.cornerRadius !== newRadius &&
        typeof onUpdateCornerRadius === "function"
      ) {
        onUpdateCornerRadius(element.id, newRadius);
      }
    };
    const handleMouseUp = () => {
      setIsCornerRadiusDragging(false);
    };
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [
    isCornerRadiusDragging,
    cornerRadiusStart,
    element,
    onUpdateCornerRadius,
    zoom,
  ]);

  // Handle font scaling drag start
  const handleFontScaleDragStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsFontScaling(true);
    setFontScaleStart({
      x: e.clientX,
      y: e.clientY,
      fontSize: element.fontSize || 16,
      lineHeight: element.lineHeight || 20,
      width: element.width,
      height: element.height,
    });
  };

  // Handle font scaling drag move
  useEffect(() => {
    if (!isFontScaling) return;
    const handleMouseMove = (e: MouseEvent) => {
      const dx = (e.clientX - fontScaleStart.x) / (zoom / 100);
      const dy = (e.clientY - fontScaleStart.y) / (zoom / 100);

      // Use diagonal distance to determine scale factor
      const distance = Math.sqrt(dx * dx + dy * dy);
      const scaleFactor = distance > 0 ? (dx + dy) / 100 : 0;

      let newFontSize = Math.max(8, fontScaleStart.fontSize + scaleFactor * 20);
      let newLineHeight = Math.max(
        10,
        fontScaleStart.lineHeight + scaleFactor * 24
      );

      // Round to reasonable increments
      newFontSize = Math.round(newFontSize);
      newLineHeight = Math.round(newLineHeight);

      // Calculate font scale ratio to apply to dimensions
      const fontScaleRatio = newFontSize / fontScaleStart.fontSize;

      // Scale the text box dimensions proportionally from original size
      const newWidth = Math.max(
        20,
        Math.round(fontScaleStart.width * fontScaleRatio)
      );
      const newHeight = Math.max(
        20,
        Math.round(fontScaleStart.height * fontScaleRatio)
      );

      // Update font properties
      if (
        element.fontSize !== newFontSize &&
        typeof onUpdateFontSize === "function"
      ) {
        onUpdateFontSize(element.id, newFontSize);
      }

      if (
        element.lineHeight !== newLineHeight &&
        typeof onUpdateLineHeight === "function"
      ) {
        onUpdateLineHeight(element.id, newLineHeight);
      }

      // Update dimensions to accommodate the scaled text
      if (
        (element.width !== newWidth || element.height !== newHeight) &&
        typeof onResize === "function"
      ) {
        onResize(newWidth, newHeight, false);
      }
    };

    const handleMouseUp = () => {
      setIsFontScaling(false);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [
    isFontScaling,
    fontScaleStart,
    element,
    onUpdateFontSize,
    onUpdateLineHeight,
    onResize,
    zoom,
  ]);

  // Double-click resize handle to fit text
  const handleResizeDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (element.type === "text" && textRef.current) {
      // Use scrollWidth/scrollHeight for content size
      const node = textRef.current;
      const rect = node.getBoundingClientRect();
      // Temporarily set width/height to auto to measure
      const prevWidth = node.style.width;
      const prevHeight = node.style.height;
      node.style.width = "auto";
      node.style.height = "auto";
      const fitWidth = node.scrollWidth;
      const fitHeight = node.scrollHeight;
      node.style.width = prevWidth;
      node.style.height = prevHeight;
      onResize(fitWidth, fitHeight, false);
    }
  };

  // Don't render anything if element is hidden
  if (element.visible === false) {
    return null;
  }

  const topPoint = element.y - (4.25 + 1 / 2) * (100 / zoom);
  const leftPoint = element.x - (4.25 + 1 / 2) * (100 / zoom);
  const bottomPoint =
    element.y + element.height - (4.25 - 1 / 2) * (100 / zoom);
  const rightPoint = element.x + element.width - (4.25 - 1 / 2) * (100 / zoom);
  const middleXPoint =
    element.x + element.width / 2 - (4.25 - 1 / 2) * (100 / zoom);
  const middleYPoint =
    element.y + element.height / 2 - (4.25 - 1 / 2) * (100 / zoom);

  return (
    <>
      <div
        ref={elementRef}
        className="absolute cursor-move"
        style={{
          left: `${element.x}px`,
          top: `${element.y}px`,
          width: `${element.width}px`,
          height: `${element.height}px`,
          backgroundColor:
            element.type === "rectangle" ? element.color : "transparent",
          zIndex: 1,
          borderRadius:
            element.type === "rectangle"
              ? `${element.cornerRadius || 0}px`
              : undefined,
          borderWidth: element.type !== "image" ? element.borderWidth ?? 0 : 0,
          borderStyle:
            element.type !== "image" && element.borderWidth
              ? "solid"
              : undefined,
          borderColor:
            element.type !== "image"
              ? element.borderColor ?? "transparent"
              : undefined,
          boxShadow: element.shadowBlur
            ? `0px 0px ${element.shadowBlur}px ${element.shadowColor}`
            : undefined,
        }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onDoubleClick={
          element.type === "text" ? handleTextDoubleClick : undefined
        }
      >
        {element.type === "image" && (
          <img
            src={element.src}
            alt="Canvas element"
            className="w-full h-full object-cover"
            style={{
              borderRadius: `${element.cornerRadius || 0}px`,
              borderWidth: element.borderWidth ?? 0,
              borderStyle: element.borderWidth ? "solid" : undefined,
              borderColor: element.borderColor ?? "transparent",
              boxSizing: "border-box",
            }}
            draggable={false}
          />
        )}
        {element.type === "text" && (
          <div
            ref={textRef}
            contentEditable={isEditing}
            // contentEditable={isEditing && !isPanMode}
            suppressContentEditableWarning
            onBlur={handleTextBlur}
            onInput={handleTextChange}
            onKeyDown={handleTextKeyDown}
            className={cn(
              "w-full h-full flex outline-none",
              // Dynamic horizontal alignment
              element.horizontalAlign === "left" && "justify-start",
              element.horizontalAlign === "center" && "justify-center",
              element.horizontalAlign === "right" && "justify-end",
              // Dynamic vertical alignment
              element.verticalAlign === "top" && "items-start",
              element.verticalAlign === "middle" && "items-center",
              element.verticalAlign === "bottom" && "items-end",
              isEditing && "bg-blue-600/30"
            )}
            style={{
              color: element.color,
              fontSize: element.fontSize ? `${element.fontSize}px` : undefined,
              fontWeight: element.fontWeight,
              letterSpacing: element.letterSpacing
                ? `${element.letterSpacing}px`
                : undefined,
              lineHeight: element.lineHeight
                ? `${element.lineHeight}px`
                : undefined,
            }}
          >
            {!isEditing && element.content}
          </div>
        )}
      </div>

      {/* Selection UI: Rendered separately with independent z-index */}
      {element.selected && (
        <>
          {/* Selection frame */}
          <div
            className="absolute pointer-events-none border-blue-500 rounded-none"
            style={{
              left: `${element.x - 1 * (100 / zoom)}px`,
              top: `${element.y - 1 * (100 / zoom)}px`,
              width: `${element.width + 1 * (100 / zoom) * 2}px`,
              height: `${element.height + 1 * (100 / zoom) * 2}px`,
              borderWidth: 1 * (100 / zoom),
              zIndex: 9999,
            }}
          />

          {/* Resize handles - show different handles based on element type */}
          {element.type === "text" ? (
            <>
              {/* Text elements: Only 3 handles like Apple's FreeForm */}
              {/* middle-right for width adjustment */}
              <div
                className="absolute w-2 h-2 border-[0.5px] border-blue-100 inset-shadow-xs inset-shadow-blue-400/50 bg-blue-400/70 rounded-full shadow-sm hover:scale-140 transition-transform ease-out backdrop-blur-xs cursor-ew-resize"
                style={{
                  left: `${element.x + element.width + 4 * (100 / zoom)}px`,
                  top: `${element.y + element.height / 2}px`,
                  transform: `scale(${100 / zoom}) translate(-50%, -50%)`,
                  transformOrigin: "center",
                  zIndex: 9999,
                }}
                onMouseDown={(e) => handleResizeStart("e", e)}
                onTouchStart={(e) => handleResizeTouchStart("e", e)}
                onDoubleClick={handleResizeDoubleClick}
              />
              {/* bottom-center for height adjustment */}
              <div
                className="absolute w-2 h-2 border-[0.5px] border-blue-100 inset-shadow-xs inset-shadow-blue-400/50 bg-blue-400/70 rounded-full shadow-sm hover:scale-140 transition-transform ease-out backdrop-blur-xs cursor-ns-resize"
                style={{
                  left: `${element.x + element.width / 2}px`,
                  top: `${element.y + element.height + 4 * (100 / zoom)}px`,
                  transform: `scale(${100 / zoom}) translate(-50%, -50%)`,
                  transformOrigin: "center",
                  zIndex: 9999,
                }}
                onMouseDown={(e) => handleResizeStart("s", e)}
                onTouchStart={(e) => handleResizeTouchStart("s", e)}
                onDoubleClick={handleResizeDoubleClick}
              />
              {/* bottom-right font scale handle (special warm/green colored handle) */}
              <div
                className="absolute w-3 h-3 hover:scale-125 transition-all duration-100 ease-out rounded-full bg-orange-200 border border-white inset-shadow-sm inset-shadow-orange-300 shadow-sm cursor-nwse-resize"
                style={{
                  left: `${element.x + element.width + 8 * (100 / zoom)}px`,
                  top: `${element.y + element.height + 8 * (100 / zoom)}px`,
                  transform: `scale(${100 / zoom}) translate(-50%, -50%)`,
                  transformOrigin: "center",
                  zIndex: 9999,
                }}
                onMouseDown={handleFontScaleDragStart}
                title="Drag to scale text size"
              />
            </>
          ) : (
            <>
              {/* (1 / 2) * (100 / zoom) px is frame the border width */}
              {/* Rectangle and Image elements: All 8 handles */}
              {/* top-left */}
              <div
                className="absolute w-2 h-2 border-[0.5px] border-blue-100 inset-shadow-xs inset-shadow-blue-400/50 bg-blue-400/70 rounded-full shadow-sm hover:scale-140 transition-transform ease-out backdrop-blur-xs cursor-nwse-resize"
                style={{
                  left: `${leftPoint}px`,
                  top: `${topPoint}px`,
                  transform: `scale(${100 / zoom}) `,
                  transformOrigin: "top left",
                  zIndex: 9999,
                }}
                onMouseDown={(e) => handleResizeStart("nw", e)}
                onTouchStart={(e) => handleResizeTouchStart("nw", e)}
                onDoubleClick={handleResizeDoubleClick}
              />
              {/* top-center */}
              <div
                className="absolute w-2 h-2 border-[0.5px] border-blue-100 inset-shadow-xs inset-shadow-blue-400/50 bg-blue-400/70 rounded-full shadow-sm hover:scale-140 transition-transform ease-out backdrop-blur-xs cursor-ns-resize"
                style={{
                  left: `${middleXPoint}px`,
                  top: `${topPoint}px`,
                  transform: `scale(${100 / zoom})`,
                  transformOrigin: "top left",
                  zIndex: 9999,
                }}
                onMouseDown={(e) => handleResizeStart("n", e)}
                onTouchStart={(e) => handleResizeTouchStart("n", e)}
                onDoubleClick={handleResizeDoubleClick}
              />
              {/* top-right */}
              <div
                className="absolute w-2 h-2 border-[0.5px] border-blue-100 inset-shadow-xs inset-shadow-blue-400/50 bg-blue-400/70 rounded-full shadow-sm hover:scale-140 transition-transform ease-out backdrop-blur-xs cursor-nesw-resize"
                style={{
                  left: `${rightPoint}px`,
                  top: `${topPoint}px`,
                  transform: `scale(${100 / zoom})`,
                  transformOrigin: "top left",
                  zIndex: 9999,
                }}
                onMouseDown={(e) => handleResizeStart("ne", e)}
                onTouchStart={(e) => handleResizeTouchStart("ne", e)}
                onDoubleClick={handleResizeDoubleClick}
              />
              {/* middle-left */}
              <div
                className="absolute w-2 h-2 border-[0.5px] border-blue-100 inset-shadow-xs inset-shadow-blue-400/50 bg-blue-400/70 rounded-full shadow-sm hover:scale-140 transition-transform ease-out backdrop-blur-xs cursor-ew-resize"
                style={{
                  left: `${leftPoint}px`,
                  top: `${middleYPoint}px`,
                  transform: `scale(${100 / zoom})`,
                  transformOrigin: "top left",
                  zIndex: 9999,
                }}
                onMouseDown={(e) => handleResizeStart("w", e)}
                onTouchStart={(e) => handleResizeTouchStart("w", e)}
                onDoubleClick={handleResizeDoubleClick}
              />
              {/* middle-right */}
              <div
                className="absolute w-2 h-2 border-[0.5px] border-blue-100 inset-shadow-xs inset-shadow-blue-400/50 bg-blue-400/70 rounded-full shadow-sm hover:scale-140 transition-transform ease-out backdrop-blur-xs cursor-ew-resize"
                style={{
                  left: `${rightPoint}px`,
                  top: `${middleYPoint}px`,
                  transform: `scale(${100 / zoom})`,
                  transformOrigin: "top left",
                  zIndex: 9999,
                }}
                onMouseDown={(e) => handleResizeStart("e", e)}
                onTouchStart={(e) => handleResizeTouchStart("e", e)}
                onDoubleClick={handleResizeDoubleClick}
              />
              {/* bottom-left */}
              <div
                className="absolute w-2 h-2 border-[0.5px] border-blue-100 inset-shadow-xs inset-shadow-blue-400/50 bg-blue-400/70 rounded-full shadow-sm hover:scale-140 transition-transform ease-out backdrop-blur-xs cursor-nesw-resize"
                style={{
                  left: `${leftPoint}px`,
                  top: `${bottomPoint}px`,
                  transform: `scale(${100 / zoom})`,
                  transformOrigin: "top left",
                  zIndex: 9999,
                }}
                onMouseDown={(e) => handleResizeStart("sw", e)}
                onTouchStart={(e) => handleResizeTouchStart("sw", e)}
                onDoubleClick={handleResizeDoubleClick}
              />
              {/* bottom-center */}
              <div
                className="absolute w-2 h-2 border-[0.5px] border-blue-100 inset-shadow-xs inset-shadow-blue-400/50 bg-blue-400/70 rounded-full shadow-sm hover:scale-140 transition-transform ease-out backdrop-blur-xs cursor-ns-resize"
                style={{
                  left: `${middleXPoint}px`,
                  top: `${bottomPoint}px`,
                  transform: `scale(${100 / zoom})`,
                  transformOrigin: "top left",
                  zIndex: 9999,
                }}
                onMouseDown={(e) => handleResizeStart("s", e)}
                onTouchStart={(e) => handleResizeTouchStart("s", e)}
                onDoubleClick={handleResizeDoubleClick}
              />
              {/* bottom-right */}
              <div
                className="absolute w-2 h-2 border-[0.5px] border-blue-100 inset-shadow-xs inset-shadow-blue-400/50 bg-blue-400/70 rounded-full shadow-sm hover:scale-140 transition-transform ease-out backdrop-blur-xs cursor-nwse-resize"
                style={{
                  left: `${rightPoint}px`,
                  top: `${bottomPoint}px`,
                  transform: `scale(${100 / zoom})`,
                  transformOrigin: "top left",
                  zIndex: 9999,
                }}
                onMouseDown={(e) => handleResizeStart("se", e)}
                onTouchStart={(e) => handleResizeTouchStart("se", e)}
                onDoubleClick={handleResizeDoubleClick}
              />
            </>
          )}

          {/* Corner radius handle for rectangles and images */}
          {(element.type === "rectangle" || element.type === "image") && (
            <div
              className="absolute w-3 h-3 hover:scale-125 transition-all duration-100 ease-out rounded-full bg-orange-200 border border-white inset-shadow-sm inset-shadow-orange-300 shadow-sm cursor-pointer"
              onMouseDown={handleCornerRadiusDragStart}
              title="Drag to adjust corner radius"
              style={{
                left: `${element.x + (element.cornerRadius || 0)}px`,
                top: `${element.y + (element.cornerRadius || 0)}px`,
                transform: `scale(${100 / zoom}) translate(-50%, -50%)`,
                transformOrigin: "top left",
                zIndex: 9999,
              }}
            />
          )}
        </>
      )}

      {/* Floating Toolbar - only show for single selection */}
      {element.selected &&
        !isMultipleSelected &&
        !(element.type === "text" && isEditing) &&
        !isDragging &&
        !isResizing &&
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
          />
        )}
    </>
  );
}
