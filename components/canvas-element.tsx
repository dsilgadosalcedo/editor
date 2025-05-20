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
  };
  onSelect: () => void;
  onMove: (deltaX: number, deltaY: number) => void;
  onResize: (width: number, height: number) => void;
  onTextChange: (content: string) => void;
  isPanMode?: boolean;
}

export default function CanvasElement({
  element,
  onSelect,
  onMove,
  onResize,
  onTextChange,
  isPanMode = false,
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

  return (
    <div
      ref={elementRef}
      className={cn(
        "absolute cursor-move",
        element.selected && "outline-2 outline-white"
      )}
      style={{
        left: `${element.x}px`,
        top: `${element.y}px`,
        width: `${element.width}px`,
        height: `${element.height}px`,
        backgroundColor:
          element.type === "rectangle" ? element.color : "transparent",
        zIndex: element.selected ? 10 : 1,
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
          // contentEditable={isEditing && !isPanMode}
          contentEditable={isEditing}
          suppressContentEditableWarning
          onBlur={handleTextBlur}
          onInput={handleTextChange}
          onKeyDown={handleTextKeyDown}
          className={cn(
            "w-full h-full flex items-center justify-center text-white outline-none",
            isEditing && "bg-blue-600/30"
          )}
        >
          {element.content}
        </div>
      )}

      {/* Resize handle */}
      {/* {element.selected && !isPanMode && ( */}
      {element.selected && (
        <div
          className="absolute bottom-0 right-0 w-3 h-3 bg-white cursor-nwse-resize"
          onMouseDown={handleResizeStart}
          onTouchStart={handleResizeTouchStart}
        />
      )}
    </div>
  );
}
