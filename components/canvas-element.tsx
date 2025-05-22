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
  const [resizeDir, setResizeDir] = useState<string | null>(null);

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
      } else if (isResizing && resizeDir) {
        const dx = e.clientX - resizeStart.x;
        const dy = e.clientY - resizeStart.y;
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
        newWidth = Math.max(20, newWidth);
        newHeight = Math.max(20, newHeight);
        // Apply size change then position change
        onResize(newWidth, newHeight);
        if (moveX || moveY) {
          onMove(moveX, moveY);
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
        const deltaX = e.touches[0].clientX - dragStart.x;
        const deltaY = e.touches[0].clientY - dragStart.y;
        onMove(deltaX, deltaY);
        setDragStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
      } else if (isResizing && resizeDir) {
        const dx = e.touches[0].clientX - resizeStart.x;
        const dy = e.touches[0].clientY - resizeStart.y;
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
        newWidth = Math.max(20, newWidth);
        newHeight = Math.max(20, newHeight);
        // Apply size change then position change
        onResize(newWidth, newHeight);
        if (moveX || moveY) {
          onMove(moveX, moveY);
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
      className="absolute cursor-move"
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
          {/* Selection frame: offset by 4px + borderWidth if present */}
          <div
            className="absolute pointer-events-none border border-blue-400 rounded-none"
            style={{
              left: `-${1 + (element.borderWidth ?? 0)}px`,
              top: `-${1 + (element.borderWidth ?? 0)}px`,
              width: `calc(100% + ${(1 + (element.borderWidth ?? 0)) * 2}px)`,
              height: `calc(100% + ${(1 + (element.borderWidth ?? 0)) * 2}px)`,
            }}
          />
          {/* Resize handles */}
          {/* top-left */}
          <div
            className="absolute w-2 h-2 border-[0.5px] border-blue-100 inset-shadow-xs inset-shadow-blue-400/50  bg-blue-400/70 rounded-full shadow-sm hover:scale-140 transition-transform ease-out backdrop-blur-xs cursor-nwse-resize"
            style={{
              left: `-${5 + (element.borderWidth ?? 0)}px`,
              top: `-${5 + (element.borderWidth ?? 0)}px`,
            }}
            onMouseDown={(e) => handleResizeStart("nw", e)}
            onTouchStart={(e) => handleResizeTouchStart("nw", e)}
            onDoubleClick={handleResizeDoubleClick}
          />
          {/* top-center */}
          <div
            className="absolute left-1/2 -translate-x-1/2 w-2 h-2 border-[0.5px] border-blue-100 inset-shadow-xs inset-shadow-blue-400/50  bg-blue-400/70 rounded-full shadow-sm hover:scale-140 transition-transform ease-out backdrop-blur-xs cursor-ns-resize"
            style={{
              top: `-${5 + (element.borderWidth ?? 0)}px`,
            }}
            onMouseDown={(e) => handleResizeStart("n", e)}
            onTouchStart={(e) => handleResizeTouchStart("n", e)}
            onDoubleClick={handleResizeDoubleClick}
          />
          {/* top-right */}
          <div
            className="absolute w-2 h-2 border-[0.5px] border-blue-100 inset-shadow-xs inset-shadow-blue-400/50  bg-blue-400/70 rounded-full shadow-sm hover:scale-140 transition-transform ease-out backdrop-blur-xs cursor-nesw-resize"
            style={{
              right: `-${5 + (element.borderWidth ?? 0)}px`,
              top: `-${5 + (element.borderWidth ?? 0)}px`,
            }}
            onMouseDown={(e) => handleResizeStart("ne", e)}
            onTouchStart={(e) => handleResizeTouchStart("ne", e)}
            onDoubleClick={handleResizeDoubleClick}
          />
          {/* middle-left */}
          <div
            className="absolute top-1/2 -translate-y-1/2 w-2 h-2 border-[0.5px] border-blue-100 inset-shadow-xs inset-shadow-blue-400/50  bg-blue-400/70 rounded-full shadow-sm hover:scale-140 transition-transform ease-out backdrop-blur-xs cursor-ew-resize"
            style={{
              left: `-${5 + (element.borderWidth ?? 0)}px`,
            }}
            onMouseDown={(e) => handleResizeStart("w", e)}
            onTouchStart={(e) => handleResizeTouchStart("w", e)}
            onDoubleClick={handleResizeDoubleClick}
          />
          {/* middle-right */}
          <div
            className="absolute top-1/2 -translate-y-1/2 w-2 h-2 border-[0.5px] border-blue-100 inset-shadow-xs inset-shadow-blue-400/50  bg-blue-400/70 rounded-full shadow-sm hover:scale-140 transition-transform ease-out backdrop-blur-xs cursor-ew-resize"
            style={{
              right: `-${5 + (element.borderWidth ?? 0)}px`,
            }}
            onMouseDown={(e) => handleResizeStart("e", e)}
            onTouchStart={(e) => handleResizeTouchStart("e", e)}
            onDoubleClick={handleResizeDoubleClick}
          />
          {/* bottom-left */}
          <div
            className="absolute w-2 h-2 border-[0.5px] border-blue-100 inset-shadow-xs inset-shadow-blue-400/50  bg-blue-400/70 rounded-full shadow-sm hover:scale-140 transition-transform ease-out backdrop-blur-xs cursor-nesw-resize"
            style={{
              left: `-${5 + (element.borderWidth ?? 0)}px`,
              bottom: `-${5 + (element.borderWidth ?? 0)}px`,
            }}
            onMouseDown={(e) => handleResizeStart("sw", e)}
            onTouchStart={(e) => handleResizeTouchStart("sw", e)}
            onDoubleClick={handleResizeDoubleClick}
          />
          {/* bottom-center */}
          <div
            className="absolute left-1/2 -translate-x-1/2 w-2 h-2 border-[0.5px] border-blue-100 inset-shadow-xs inset-shadow-blue-400/50  bg-blue-400/70 rounded-full shadow-sm hover:scale-140 transition-transform ease-out backdrop-blur-xs cursor-ns-resize"
            style={{
              bottom: `-${5 + (element.borderWidth ?? 0)}px`,
            }}
            onMouseDown={(e) => handleResizeStart("s", e)}
            onTouchStart={(e) => handleResizeTouchStart("s", e)}
            onDoubleClick={handleResizeDoubleClick}
          />
          {/* bottom-right */}
          <div
            className="absolute w-2 h-2 border-[0.5px] border-blue-100 inset-shadow-xs inset-shadow-blue-400/50  bg-blue-400/70 rounded-full shadow-sm hover:scale-140 transition-transform ease-out backdrop-blur-xs cursor-nwse-resize"
            style={{
              right: `-${5 + (element.borderWidth ?? 0)}px`,
              bottom: `-${5 + (element.borderWidth ?? 0)}px`,
            }}
            onMouseDown={(e) => handleResizeStart("se", e)}
            onTouchStart={(e) => handleResizeTouchStart("se", e)}
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
