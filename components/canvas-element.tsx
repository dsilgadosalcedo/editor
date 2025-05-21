"use client";

import type React from "react";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface CanvasElementProps {
  element: {
    id: string;
    type: "rectangle" | "text";
    x: number;
    y: number;
    width: number;
    height: number;
    content?: string;
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
  };
  onSelect: () => void;
  onMove: (deltaX: number, deltaY: number) => void;
  onResize: (width: number, height: number) => void;
  onTextChange: (content: string) => void;
  isPanMode?: boolean;
  onUpdateCornerRadius?: (id: string, cornerRadius: number) => void;
}

export default function CanvasElement({
  element,
  onSelect,
  onMove,
  onResize,
  onTextChange,
  isPanMode = false,
  onUpdateCornerRadius,
}: CanvasElementProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
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

  // Remove the local content state to prevent the infinite loop
  // We'll use the element.content directly

  // Handle element dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();

    // if (isPanMode) return;

    onSelect();

    if (element.type === "text" && isEditing) {
      return;
    }

    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation();

    // if (isPanMode) return;

    onSelect();

    if (element.type === "text" && isEditing) {
      return;
    }

    setIsDragging(true);
    setDragStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
  };

  // Handle element resizing
  const handleResizeStart = (e: React.MouseEvent) => {
    // if (isPanMode) return;

    e.stopPropagation();
    e.preventDefault();
    setIsResizing(true);
    setResizeStart({
      width: element.width,
      height: element.height,
      x: e.clientX,
      y: e.clientY,
    });
  };

  const handleResizeTouchStart = (e: React.TouchEvent) => {
    // if (isPanMode) return;

    e.stopPropagation();
    e.preventDefault();
    setIsResizing(true);
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
          textRef.current.focus();

          // Place cursor at the end of text
          const range = document.createRange();
          const selection = window.getSelection();

          // Clear the text node first to avoid issues
          textRef.current.innerHTML = element.content || "";

          if (textRef.current.firstChild) {
            range.setStart(
              textRef.current.firstChild,
              (element.content || "").length
            );
            range.collapse(true);
            selection?.removeAllRanges();
            selection?.addRange(range);
          }
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
    }
  };

  // Set up global mouse/touch move and up handlers
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const deltaX = e.clientX - dragStart.x;
        const deltaY = e.clientY - dragStart.y;
        onMove(deltaX, deltaY);
        setDragStart({ x: e.clientX, y: e.clientY });
      } else if (isResizing) {
        const deltaX = e.clientX - resizeStart.x;
        const deltaY = e.clientY - resizeStart.y;
        onResize(
          Math.max(20, resizeStart.width + deltaX),
          Math.max(20, resizeStart.height + deltaY)
        );
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (isDragging) {
        const deltaX = e.touches[0].clientX - dragStart.x;
        const deltaY = e.touches[0].clientY - dragStart.y;
        onMove(deltaX, deltaY);
        setDragStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
      } else if (isResizing) {
        const deltaX = e.touches[0].clientX - resizeStart.x;
        const deltaY = e.touches[0].clientY - resizeStart.y;
        onResize(
          Math.max(20, resizeStart.width + deltaX),
          Math.max(20, resizeStart.height + deltaY)
        );
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    const handleTouchEnd = () => {
      setIsDragging(false);
      setIsResizing(false);
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
  }, [isDragging, isResizing, dragStart, resizeStart, onMove, onResize]);

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
      const dx = e.clientX - cornerRadiusStart.x;
      const dy = e.clientY - cornerRadiusStart.y;
      let newRadius = cornerRadiusStart.cornerRadius + (dx + dy) / 2;
      newRadius = Math.max(
        0,
        Math.min(newRadius, element.width / 2, element.height / 2)
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
      onResize(fitWidth, fitHeight);
    }
  };

  return (
    <div
      ref={elementRef}
      className={cn(
        "absolute cursor-move",
        element.selected ? "outline-2 outline-white" : ""
      )}
      style={{
        left: `${element.x}px`,
        top: `${element.y}px`,
        width: `${element.width}px`,
        height: `${element.height}px`,
        backgroundColor:
          element.type === "rectangle" ? element.color : "transparent",
        zIndex: element.selected ? 10 : 1,
        borderRadius:
          element.type === "rectangle"
            ? `${element.cornerRadius || 0}px`
            : undefined,
        borderWidth: element.borderWidth ?? 0,
        borderStyle: element.borderWidth ? "solid" : undefined,
        borderColor: element.borderColor ?? "transparent",
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
      {element.type === "text" && (
        <div
          ref={textRef}
          contentEditable={isEditing && !isPanMode}
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
          {element.content}
        </div>
      )}

      {/* Selection UI: Only show when selected */}
      {element.selected && (
        <>
          {/* Resize handle */}
          <div
            className="absolute -bottom-1.5 rounded-xs shadow-sm -right-1.5 w-3 h-3 hover:scale-110 transition-all duration-100 cursor-nwse-resize bg-white"
            onMouseDown={handleResizeStart}
            onTouchStart={handleResizeTouchStart}
            onDoubleClick={handleResizeDoubleClick}
          />
          {/* Corner radius handle for rectangles */}
          {element.type === "rectangle" && (
            <div
              className="absolute w-4 h-4 rounded-full bg-orange-200 border border-white inset-shadow-sm inset-shadow-orange-300 shadow-sm cursor-pointer z-20"
              onMouseDown={handleCornerRadiusDragStart}
              title="Drag to adjust corner radius"
              style={{
                left: (element.cornerRadius || 0) - 8, // 8 = handle radius for centering
                top: (element.cornerRadius || 0) - 8,
              }}
            />
          )}
        </>
      )}
    </div>
  );
}
