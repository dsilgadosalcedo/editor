"use client";

import React, { useRef, useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import ElementFloatingToolbar from "./ElementFloatingToolbar";
import { useCanvasStore } from "../store/useCanvasStore";

// Utility function to measure text dimensions
const measureText = (
  text: string,
  fontSize: number,
  fontWeight: number,
  fontFamily: string = "var(--font-geist-sans)",
  letterSpacing: number = 0,
  lineHeight: number = fontSize * 1.2
): { width: number; height: number } => {
  // Create a temporary element to measure text
  const tempDiv = document.createElement("div");
  tempDiv.style.position = "absolute";
  tempDiv.style.visibility = "hidden";
  tempDiv.style.whiteSpace = "nowrap";
  tempDiv.style.fontSize = `${fontSize}px`;
  tempDiv.style.fontWeight = `${fontWeight}`;
  tempDiv.style.fontFamily = fontFamily;
  tempDiv.style.letterSpacing = `${letterSpacing}px`;
  tempDiv.style.lineHeight = `${lineHeight}px`;
  tempDiv.textContent = text || "Text";

  document.body.appendChild(tempDiv);
  const width = tempDiv.offsetWidth;
  const height = tempDiv.offsetHeight;
  document.body.removeChild(tempDiv);

  return { width: Math.ceil(width), height: Math.ceil(height) };
};

interface CanvasElementProps {
  element: {
    id: string;
    type: "rectangle" | "text" | "image" | "group";
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
    name?: string;
    children?: string[];
    rotation?: number;
    textResizing?: "auto-width" | "auto-height" | "fixed";
    isolated?: boolean;
    inIsolatedGroup?: boolean;
    isInIsolationMode?: boolean;
    isSelectableInIsolation?: boolean;
  };
  onSelect: (addToSelection?: boolean) => void;
  onMove: (deltaX: number, deltaY: number) => void;
  onMoveNoHistory: (deltaX: number, deltaY: number) => void;
  onResize: (
    width: number,
    height: number,
    preserveAspectRatio?: boolean
  ) => void;
  onResizeNoHistory: (
    width: number,
    height: number,
    preserveAspectRatio?: boolean
  ) => void;
  onTextChange: (content: string) => void;
  isPanMode?: boolean;
  zoom: number;
  onUpdateCornerRadius?: (id: string, cornerRadius: number) => void;
  onUpdateCornerRadiusNoHistory?: (id: string, cornerRadius: number) => void;
  onUpdateFontSize?: (id: string, fontSize: number) => void;
  onUpdateLineHeight?: (id: string, lineHeight: number) => void;
  onUpdateRotation?: (id: string, rotation: number) => void;
  onUpdateRotationNoHistory?: (id: string, rotation: number) => void;
  isMultipleSelected?: boolean;
  onAddToHistory?: () => void;
}

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
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [justDragged, setJustDragged] = useState(false);
  const [prepareDrag, setPrepareDrag] = useState(false);
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
  const [isRotating, setIsRotating] = useState(false);
  const [rotationStart, setRotationStart] = useState({
    x: 0,
    y: 0,
    rotation: 0,
    centerX: 0,
    centerY: 0,
  });

  // Auto-resize text elements based on content and resizing mode
  useEffect(() => {
    if (element.type === "text" && element.textResizing) {
      // Get current content - use textRef content if editing, otherwise element.content
      const content =
        isEditing && textRef.current
          ? textRef.current.textContent || "Text"
          : element.content || "Text";

      const fontSize = element.fontSize || 16;
      const fontWeight = element.fontWeight || 400;
      const letterSpacing = element.letterSpacing || 0;
      const lineHeight = element.lineHeight || fontSize * 1.2;

      if (element.textResizing === "auto-width") {
        // Auto-width: measure text and update width, keep height fixed
        const measured = measureText(
          content,
          fontSize,
          fontWeight,
          "var(--font-geist-sans)",
          letterSpacing,
          lineHeight
        );
        const newWidth = Math.max(20, measured.width + 8); // Add some padding

        if (Math.abs(newWidth - element.width) > 2) {
          // Only update if significant change
          onResizeNoHistory(newWidth, element.height);
        }
      } else if (element.textResizing === "auto-height" && !isEditing) {
        // Auto-height: only update when not editing to avoid interference
        const tempDiv = document.createElement("div");
        tempDiv.style.position = "absolute";
        tempDiv.style.visibility = "hidden";
        tempDiv.style.width = `${element.width - 8}px`; // Account for padding
        tempDiv.style.fontSize = `${fontSize}px`;
        tempDiv.style.fontWeight = `${fontWeight}`;
        tempDiv.style.fontFamily = "var(--font-geist-sans)";
        tempDiv.style.letterSpacing = `${letterSpacing}px`;
        tempDiv.style.lineHeight = `${lineHeight}px`;
        tempDiv.style.wordWrap = "break-word";
        tempDiv.textContent = content;

        document.body.appendChild(tempDiv);
        const newHeight = Math.max(20, tempDiv.offsetHeight + 8); // Add some padding
        document.body.removeChild(tempDiv);

        if (Math.abs(newHeight - element.height) > 2) {
          // Only update if significant change
          onResizeNoHistory(element.width, newHeight);
        }
      }
      // Fixed mode: no auto-resizing
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

  // Additional effect to handle real-time content changes during editing
  useEffect(() => {
    if (
      !isEditing ||
      !textRef.current ||
      element.type !== "text" ||
      element.textResizing !== "auto-width"
    ) {
      return;
    }

    const textElement = textRef.current;

    const handleInput = () => {
      const content = textElement.textContent || "Text";
      const fontSize = element.fontSize || 16;
      const fontWeight = element.fontWeight || 400;
      const letterSpacing = element.letterSpacing || 0;
      const lineHeight = element.lineHeight || fontSize * 1.2;

      const measured = measureText(
        content,
        fontSize,
        fontWeight,
        "var(--font-geist-sans)",
        letterSpacing,
        lineHeight
      );
      const newWidth = Math.max(20, measured.width + 8);

      if (Math.abs(newWidth - element.width) > 2) {
        onResizeNoHistory(newWidth, element.height);
      }
    };

    // Use both 'input' and 'keyup' events to catch all text changes
    textElement.addEventListener("input", handleInput);
    textElement.addEventListener("keyup", handleInput);

    return () => {
      textElement.removeEventListener("input", handleInput);
      textElement.removeEventListener("keyup", handleInput);
    };
  }, [
    isEditing,
    element.type,
    element.textResizing,
    element.fontSize,
    element.fontWeight,
    element.letterSpacing,
    element.lineHeight,
    element.width,
    element.height,
    onResizeNoHistory,
  ]);

  // Handle element dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();

    // if (isPanMode) return;

    // In isolation mode, only allow selection of elements within the isolated group
    if (element.isInIsolationMode && !element.isSelectableInIsolation) {
      return;
    }

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

    // Add to history at the start of drag operation
    if (typeof onAddToHistory === "function") {
      onAddToHistory();
    }

    // Reset justDragged state for new interaction
    setJustDragged(false);
    setPrepareDrag(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation();

    // if (isPanMode) return;

    // In isolation mode, only allow selection of elements within the isolated group
    if (element.isInIsolationMode && !element.isSelectableInIsolation) {
      return;
    }

    // For touch: if element is already selected and multiple elements are selected, don't change selection
    // Otherwise, select only this element
    if (!element.selected || !isMultipleSelected) {
      onSelect(false);
    }

    if (element.type === "text" && isEditing) {
      return;
    }

    // Add to history at the start of drag operation
    if (typeof onAddToHistory === "function") {
      onAddToHistory();
    }

    // Reset justDragged state for new interaction
    setJustDragged(false);
    setPrepareDrag(true);
    setDragStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
  };

  // Handle element resizing, track which handle (direction)
  const handleResizeStart = (dir: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setResizeDir(dir);

    // If this is a text element, change to fixed mode when manually resizing
    if (element.type === "text" && element.textResizing !== "fixed") {
      const { updateTextResizing } = useCanvasStore.getState();
      updateTextResizing(element.id, "fixed");
    }

    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = element.width;
    const startHeight = element.height;

    // Add to history at the start of resize operation
    if (typeof onAddToHistory === "function") {
      onAddToHistory();
    }

    setIsResizing(true);
    setResizeStart({
      width: startWidth,
      height: startHeight,
      x: startX,
      y: startY,
    });
  };

  const handleResizeTouchStart = (dir: string, e: React.TouchEvent) => {
    // if (isPanMode) return;

    e.stopPropagation();
    e.preventDefault();

    // Add to history at the start of resize operation
    if (typeof onAddToHistory === "function") {
      onAddToHistory();
    }

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

  // Handle group double-click to enter isolation mode
  const handleGroupDoubleClick = (e: React.MouseEvent) => {
    if (element.type === "group") {
      e.stopPropagation();
      e.preventDefault();
      const { enterIsolationMode, getElementChildren } =
        useCanvasStore.getState();

      // Find the element at the click position within the group
      const rect = elementRef.current?.getBoundingClientRect();
      if (rect) {
        const relativeX = (e.clientX - rect.left) / (zoom / 100) + element.x;
        const relativeY = (e.clientY - rect.top) / (zoom / 100) + element.y;

        // Get children of the group
        const children = getElementChildren(element.id);

        // Find the topmost child element at the click position
        let elementToSelect: string | undefined;
        for (let i = children.length - 1; i >= 0; i--) {
          const child = children[i];
          if (
            relativeX >= child.x &&
            relativeX <= child.x + child.width &&
            relativeY >= child.y &&
            relativeY <= child.y + child.height
          ) {
            elementToSelect = child.id;
            break;
          }
        }

        enterIsolationMode(element.id, elementToSelect);
      } else {
        enterIsolationMode(element.id);
      }
    }
  };

  // Set up global mouse/touch move and up handlers
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (prepareDrag && !isDragging) {
        // Start dragging when movement is detected
        setIsDragging(true);
        setPrepareDrag(false);
      }

      if (isDragging) {
        const deltaX = (e.clientX - dragStart.x) / (zoom / 100);
        const deltaY = (e.clientY - dragStart.y) / (zoom / 100);

        // Mark as actually dragged when movement occurs
        setJustDragged(true);

        // Round to integers for clean positions
        onMoveNoHistory(Math.round(deltaX), Math.round(deltaY));
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
        onResizeNoHistory(newWidth, newHeight, preserveAspectRatio);
        if (moveX || moveY) {
          onMoveNoHistory(Math.round(moveX), Math.round(moveY));
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
      if (prepareDrag && !isDragging) {
        // Start dragging when movement is detected
        setIsDragging(true);
        setPrepareDrag(false);
      }

      if (isDragging) {
        const deltaX = (e.touches[0].clientX - dragStart.x) / (zoom / 100);
        const deltaY = (e.touches[0].clientY - dragStart.y) / (zoom / 100);

        // Mark as actually dragged when movement occurs
        setJustDragged(true);

        // Round to integers for clean positions
        onMoveNoHistory(Math.round(deltaX), Math.round(deltaY));
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
        onResizeNoHistory(newWidth, newHeight, false); // Touch doesn't support shift key
        if (moveX || moveY) {
          onMoveNoHistory(Math.round(moveX), Math.round(moveY));
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
      // If we were dragging and actually moved the element, trigger final save
      if (isDragging && justDragged) {
        // Call onMove with 0,0 to trigger auto-save without additional movement
        onMove(0, 0);
      }

      // If we were resizing, trigger final save
      if (isResizing) {
        // Trigger final resize to save the state
        onResize(element.width, element.height, false);
      }

      setIsDragging(false);
      setIsResizing(false);
      setIsRotating(false);
      setPrepareDrag(false);
      setResizeDir(null);
    };

    const handleTouchEnd = () => {
      // If we were dragging and actually moved the element, trigger final save
      if (isDragging && justDragged) {
        // Call onMove with 0,0 to trigger auto-save without additional movement
        onMove(0, 0);
      }

      // If we were resizing, trigger final save
      if (isResizing) {
        // Trigger final resize to save the state
        onResize(element.width, element.height, false);
      }

      setIsDragging(false);
      setIsResizing(false);
      setIsRotating(false);
      setPrepareDrag(false);
      setResizeDir(null);
    };

    if (isDragging || isResizing || isRotating || prepareDrag) {
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
    isRotating,
    prepareDrag,
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

    // Add to history at the start of corner radius drag
    if (typeof onAddToHistory === "function") {
      onAddToHistory();
    }

    setIsCornerRadiusDragging(true);
    setCornerRadiusStart({
      x: e.clientX,
      y: e.clientY,
      cornerRadius: element.cornerRadius || 0,
    });
  };

  // Handle rotation drag start
  const handleRotationStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    // Add to history at the start of rotation
    if (typeof onAddToHistory === "function") {
      onAddToHistory();
    }

    // Calculate element center in screen coordinates
    const rect = elementRef.current?.getBoundingClientRect();
    if (!rect) return;

    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    setIsRotating(true);
    setRotationStart({
      x: e.clientX,
      y: e.clientY,
      rotation: element.rotation || 0,
      centerX,
      centerY,
    });
  };

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
        typeof onUpdateCornerRadiusNoHistory === "function"
      ) {
        onUpdateCornerRadiusNoHistory(element.id, newRadius);
      }
    };
    const handleMouseUp = () => {
      // Trigger final save for corner radius change
      if (typeof onUpdateCornerRadius === "function") {
        onUpdateCornerRadius(element.id, element.cornerRadius || 0);
      }
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
    onUpdateCornerRadiusNoHistory,
    zoom,
  ]);

  // Handle rotation drag move
  useEffect(() => {
    if (!isRotating) return;
    const handleMouseMove = (e: MouseEvent) => {
      const { centerX, centerY } = rotationStart;

      // Calculate angle from center to current mouse position
      const deltaX = e.clientX - centerX;
      const deltaY = e.clientY - centerY;
      const currentAngle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);

      // Calculate angle from center to start position
      const startDeltaX = rotationStart.x - centerX;
      const startDeltaY = rotationStart.y - centerY;
      const startAngle = Math.atan2(startDeltaY, startDeltaX) * (180 / Math.PI);

      // Calculate rotation delta and apply to original rotation
      const angleDelta = currentAngle - startAngle;
      let newRotation = rotationStart.rotation + angleDelta;

      // Snap to 15-degree increments when shift is held
      if (e.shiftKey) {
        newRotation = Math.round(newRotation / 15) * 15;
      }

      // Normalize angle to 0-360 range
      newRotation = ((newRotation % 360) + 360) % 360;

      if (typeof onUpdateRotationNoHistory === "function") {
        onUpdateRotationNoHistory(element.id, newRotation);
      }
    };

    const handleMouseUp = () => {
      // Trigger final save for rotation change
      if (typeof onUpdateRotation === "function") {
        onUpdateRotation(element.id, element.rotation || 0);
      }
      setIsRotating(false);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isRotating, rotationStart, element, onUpdateRotationNoHistory]);

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
      // Trigger final save for font scaling changes
      if (typeof onUpdateFontSize === "function") {
        onUpdateFontSize(element.id, element.fontSize || 16);
      }
      if (typeof onUpdateLineHeight === "function") {
        onUpdateLineHeight(element.id, element.lineHeight || 20);
      }
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

  return (
    <>
      <div
        ref={elementRef}
        className={cn(
          "absolute transition-opacity duration-300",
          // Cursor changes based on isolation mode and selection ability
          element.isInIsolationMode && !element.isSelectableInIsolation
            ? "cursor-not-allowed"
            : "cursor-move",
          // Opacity for isolation mode - show all elements but make non-isolated ones transparent
          element.isInIsolationMode &&
            !element.isSelectableInIsolation &&
            "opacity-30",
          element.inIsolatedGroup && "opacity-100"
        )}
        style={{
          left: `${element.x}px`,
          top: `${element.y}px`,
          width: `${element.width}px`,
          height: `${element.height}px`,
          backgroundColor:
            element.type === "rectangle" ? element.color : "transparent",
          zIndex: element.inIsolatedGroup ? 10 : element.isolated ? 5 : 1,
          borderRadius:
            element.type === "rectangle" || element.type === "group"
              ? `${element.cornerRadius || 0}px`
              : undefined,
          borderWidth:
            element.type !== "image"
              ? element.borderWidth ??
                (element.type === "group" && element.selected ? 1 : 0)
              : 0,
          borderStyle:
            element.type !== "image" &&
            (element.borderWidth ||
              (element.type === "group" && element.selected))
              ? element.type === "group"
                ? "dashed"
                : "solid"
              : undefined,
          borderColor:
            element.type !== "image"
              ? element.borderColor ??
                (element.type === "group" && element.selected
                  ? "#3b82f6"
                  : "transparent")
              : undefined,
          boxShadow: element.shadowBlur
            ? `0px 0px ${element.shadowBlur}px ${element.shadowColor}`
            : undefined,
          transform: element.rotation
            ? `rotate(${element.rotation}deg)`
            : undefined,
          transformOrigin: "center center",
        }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onDoubleClick={
          element.type === "text"
            ? handleTextDoubleClick
            : element.type === "group"
            ? handleGroupDoubleClick
            : undefined
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
              "w-full h-full flex outline-none overflow-hidden",
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
              // Handle text wrapping based on resizing mode
              whiteSpace:
                element.textResizing === "auto-width" ? "nowrap" : "normal",
              wordWrap:
                element.textResizing === "auto-width" ? "normal" : "break-word",
              padding: "4px", // Add some padding
            }}
          >
            {!isEditing && element.content}
          </div>
        )}
        {element.type === "group" && element.selected && (
          <div
            className="absolute -top-5 left-0 text-xs text-blue-600 bg-white/80 px-1 rounded pointer-events-none font-medium"
            style={{
              fontSize: "10px",
              transform: `scale(${100 / zoom})`,
              transformOrigin: "left bottom",
            }}
          >
            {element.name || "Group"}
          </div>
        )}
      </div>

      {/* Selection UI: Rendered separately with independent z-index */}
      {element.selected && (
        <>
          {/* Selection UI Container - rotates as a whole around element center */}
          <div
            className="absolute pointer-events-none"
            style={{
              left: `${element.x + element.width / 2}px`,
              top: `${element.y + element.height / 2}px`,
              transform: element.rotation
                ? `rotate(${element.rotation}deg)`
                : undefined,
              transformOrigin: "center center",
              zIndex: 49,
            }}
          >
            {/* Selection group */}
            <div
              className="absolute pointer-events-none border-blue-500 rounded-none"
              style={{
                left: `${-element.width / 2 - 1 * (100 / zoom)}px`,
                top: `${-element.height / 2 - 1 * (100 / zoom)}px`,
                width: `${element.width + 1 * (100 / zoom) * 2}px`,
                height: `${element.height + 1 * (100 / zoom) * 2}px`,
                borderWidth: 1 * (100 / zoom),
                zIndex: 9996,
              }}
            />

            {/* Resize handles - show different handles based on element type */}
            {/* Hide resize handles when multiple elements are selected */}
            {!isMultipleSelected && element.type === "text" ? (
              <>
                {/* Text elements: Only corner resize handle */}
                {/* bottom-right font scale handle (special warm/green colored handle) */}
                <div
                  className="absolute w-3 h-3 hover:scale-125 transition-all duration-100 ease-out rounded-full bg-orange-200 border border-white inset-shadow-sm inset-shadow-orange-300 shadow-sm cursor-nwse-resize"
                  style={{
                    left: `${
                      element.width / 2 - (6.25 - 1 / 2) * (100 / zoom)
                    }px`,
                    top: `${
                      element.height / 2 - (6.25 - 1 / 2) * (100 / zoom)
                    }px`,
                    transform: `scale(${100 / zoom})`,
                    transformOrigin: "top left",
                    pointerEvents: "auto",
                    zIndex: 9998,
                  }}
                  onMouseDown={handleFontScaleDragStart}
                  title="Drag to scale text size"
                />
              </>
            ) : !isMultipleSelected ? (
              <>
                {/* Rectangle, Image, and Group elements: Only 4 corner handles */}
                {/* top-left */}
                <div
                  className="absolute w-2 h-2 border-[0.5px] border-blue-100 inset-shadow-xs inset-shadow-blue-400/50 bg-blue-400/70 rounded-full shadow-sm hover:scale-140 transition-transform ease-out backdrop-blur-xs cursor-nwse-resize"
                  style={{
                    left: `${
                      -element.width / 2 - (4.25 + 1 / 2) * (100 / zoom)
                    }px`,
                    top: `${
                      -element.height / 2 - (4.25 + 1 / 2) * (100 / zoom)
                    }px`,
                    transform: `scale(${100 / zoom})`,
                    transformOrigin: "top left",
                    pointerEvents: "auto",
                    zIndex: 9998,
                  }}
                  onMouseDown={(e) => handleResizeStart("nw", e)}
                  onTouchStart={(e) => handleResizeTouchStart("nw", e)}
                  onDoubleClick={handleResizeDoubleClick}
                />
                {/* top-right */}
                <div
                  className="absolute w-2 h-2 border-[0.5px] border-blue-100 inset-shadow-xs inset-shadow-blue-400/50 bg-blue-400/70 rounded-full shadow-sm hover:scale-140 transition-transform ease-out backdrop-blur-xs cursor-nesw-resize"
                  style={{
                    left: `${
                      element.width / 2 - (4.25 - 1 / 2) * (100 / zoom)
                    }px`,
                    top: `${
                      -element.height / 2 - (4.25 + 1 / 2) * (100 / zoom)
                    }px`,
                    transform: `scale(${100 / zoom})`,
                    transformOrigin: "top left",
                    pointerEvents: "auto",
                    zIndex: 9998,
                  }}
                  onMouseDown={(e) => handleResizeStart("ne", e)}
                  onTouchStart={(e) => handleResizeTouchStart("ne", e)}
                  onDoubleClick={handleResizeDoubleClick}
                />
                {/* bottom-left */}
                <div
                  className="absolute w-2 h-2 border-[0.5px] border-blue-100 inset-shadow-xs inset-shadow-blue-400/50 bg-blue-400/70 rounded-full shadow-sm hover:scale-140 transition-transform ease-out backdrop-blur-xs cursor-nesw-resize"
                  style={{
                    left: `${
                      -element.width / 2 - (4.25 + 1 / 2) * (100 / zoom)
                    }px`,
                    top: `${
                      element.height / 2 - (4.25 - 1 / 2) * (100 / zoom)
                    }px`,
                    transform: `scale(${100 / zoom})`,
                    transformOrigin: "top left",
                    pointerEvents: "auto",
                    zIndex: 9998,
                  }}
                  onMouseDown={(e) => handleResizeStart("sw", e)}
                  onTouchStart={(e) => handleResizeTouchStart("sw", e)}
                  onDoubleClick={handleResizeDoubleClick}
                />
                {/* bottom-right */}
                <div
                  className="absolute w-2 h-2 border-[0.5px] border-blue-100 inset-shadow-xs inset-shadow-blue-400/50 bg-blue-400/70 rounded-full shadow-sm hover:scale-140 transition-transform ease-out backdrop-blur-xs cursor-nwse-resize"
                  style={{
                    left: `${
                      element.width / 2 - (4.25 - 1 / 2) * (100 / zoom)
                    }px`,
                    top: `${
                      element.height / 2 - (4.25 - 1 / 2) * (100 / zoom)
                    }px`,
                    transform: `scale(${100 / zoom})`,
                    transformOrigin: "top left",
                    pointerEvents: "auto",
                    zIndex: 9998,
                  }}
                  onMouseDown={(e) => handleResizeStart("se", e)}
                  onTouchStart={(e) => handleResizeTouchStart("se", e)}
                  onDoubleClick={handleResizeDoubleClick}
                />
              </>
            ) : null}

            {/* Dedicated Rotation Handles */}
            {/* Hide rotation handles when multiple elements are selected */}
            {!isMultipleSelected && element.type !== "text" && !isRotating && (
              <>
                {/* Rotation handle - top-left */}
                <div
                  className="absolute w-8 h-8 rounded-full cursor-crosshair"
                  style={{
                    left: `${-element.width / 2 - (16 + 4) * (100 / zoom)}px`,
                    top: `${-element.height / 2 - (16 + 4) * (100 / zoom)}px`,
                    transform: `scale(${100 / zoom})`,
                    transformOrigin: "top left",
                    pointerEvents: "auto",
                    zIndex: 9997,
                  }}
                  onMouseDown={handleRotationStart}
                  title="Drag to rotate"
                />

                {/* Rotation handle - top-right */}
                <div
                  className="absolute w-8 h-8 rounded-full cursor-crosshair"
                  style={{
                    left: `${element.width / 2 - (16 - 4) * (100 / zoom)}px`,
                    top: `${-element.height / 2 - (16 + 4) * (100 / zoom)}px`,
                    transform: `scale(${100 / zoom})`,
                    transformOrigin: "top left",
                    pointerEvents: "auto",
                    zIndex: 9997,
                  }}
                  onMouseDown={handleRotationStart}
                  title="Drag to rotate"
                />

                {/* Rotation handle - bottom-left */}
                <div
                  className="absolute w-8 h-8 rounded-full cursor-crosshair"
                  style={{
                    left: `${-element.width / 2 - (16 + 4) * (100 / zoom)}px`,
                    top: `${element.height / 2 - (16 - 4) * (100 / zoom)}px`,
                    transform: `scale(${100 / zoom})`,
                    transformOrigin: "top left",
                    pointerEvents: "auto",
                    zIndex: 9997,
                  }}
                  onMouseDown={handleRotationStart}
                  title="Drag to rotate"
                />

                {/* Rotation handle - bottom-right */}
                <div
                  className="absolute w-8 h-8 rounded-full cursor-crosshair"
                  style={{
                    left: `${element.width / 2 - (16 - 4) * (100 / zoom)}px`,
                    top: `${element.height / 2 - (16 - 4) * (100 / zoom)}px`,
                    transform: `scale(${100 / zoom})`,
                    transformOrigin: "top left",
                    pointerEvents: "auto",
                    zIndex: 9997,
                  }}
                  onMouseDown={handleRotationStart}
                  title="Drag to rotate"
                />
              </>
            )}

            {/* Text elements: Only one rotation handle in bottom-right */}
            {/* Hide rotation handle when multiple elements are selected */}
            {!isMultipleSelected &&
              element.type === "text" &&
              !isRotating &&
              !isEditing && (
                <div
                  className="absolute w-8 h-8 rounded-full cursor-crosshair"
                  style={{
                    left: `${element.width / 2 - (16 - 4) * (100 / zoom)}px`,
                    top: `${element.height / 2 - (16 - 4) * (100 / zoom)}px`,
                    transform: `scale(${100 / zoom})`,
                    transformOrigin: "top left",
                    pointerEvents: "auto",
                    zIndex: 9997,
                  }}
                  onMouseDown={handleRotationStart}
                  title="Drag to rotate"
                />
              )}

            {/* Corner radius handle for rectangles and images */}
            {/* Hide corner radius handle when multiple elements are selected */}
            {!isMultipleSelected &&
              (element.type === "rectangle" || element.type === "image") && (
                <div
                  className="absolute w-3 h-3 hover:scale-125 transition-all duration-200 ease-out rounded-full bg-orange-200 border border-white inset-shadow-sm inset-shadow-orange-300 shadow-sm cursor-pointer"
                  onMouseDown={handleCornerRadiusDragStart}
                  title="Drag to adjust corner radius"
                  style={{
                    left: `${
                      -element.width / 2 +
                      Math.min(
                        element.cornerRadius || 0,
                        element.width / 2,
                        element.height / 2
                      )
                    }px`,
                    top: `${
                      -element.height / 2 +
                      Math.min(
                        element.cornerRadius || 0,
                        element.width / 2,
                        element.height / 2
                      )
                    }px`,
                    transform: `scale(${100 / zoom}) translate(-50%, -50%)`,
                    transformOrigin: "top left",
                    pointerEvents: "auto",
                    zIndex: 9999,
                    opacity: isResizing ? 0 : 1,
                  }}
                />
              )}

            {/* Rotation indicator */}
            {isRotating && (
              <div
                className="absolute pointer-events-none text-xs bg-card/60 px-2 py-1 rounded-md shadow-lg border backdrop-blur-sm animate-[var(--animate-fade-up)]"
                style={{
                  left: `${0}px`,
                  top: `${-element.height / 2 - 34 * (100 / zoom)}px`,
                  transform: `scale(${100 / zoom}) translate(-50%, 0)`,
                  transformOrigin: "top left",
                  zIndex: 9999,
                }}
              >
                {Math.round(element.rotation || 0)}°
              </div>
            )}
          </div>
        </>
      )}

      {/* Floating Toolbar - show for single selections only */}
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
            isRotating={isRotating}
            elementName={element.name}
            isMultipleSelection={isMultipleSelected}
          />
        )}
    </>
  );
}
