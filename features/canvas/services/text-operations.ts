/**
 * Text operations service for canvas text elements
 * Handles text editing, measurement, and auto-resizing logic
 */

import { measureText } from "../utils";

export interface TextState {
  isEditing: boolean;
  content: string;
}

export interface TextResizeOptions {
  textResizing?: "auto-width" | "auto-height" | "fixed";
  width: number;
  height: number;
  fontSize: number;
  fontWeight: number;
  letterSpacing: number;
  lineHeight: number;
}

/**
 * Calculate auto-resize dimensions for text elements
 */
export const calculateTextAutoResize = (
  content: string,
  options: TextResizeOptions,
  isEditing: boolean = false
): { width: number; height: number } => {
  const {
    textResizing,
    width,
    height,
    fontSize,
    fontWeight,
    letterSpacing,
    lineHeight,
  } = options;

  if (!textResizing || textResizing === "fixed") {
    return { width, height };
  }

  if (textResizing === "auto-width") {
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
    return { width: newWidth, height };
  } else if (textResizing === "auto-height" && !isEditing) {
    // Auto-height: only update when not editing to avoid interference
    const tempDiv = document.createElement("div");
    tempDiv.style.position = "absolute";
    tempDiv.style.visibility = "hidden";
    tempDiv.style.width = `${width - 8}px`; // Account for padding
    tempDiv.style.fontSize = `${fontSize}px`;
    tempDiv.style.fontWeight = `${fontWeight}`;
    tempDiv.style.fontFamily = "var(--font-geist-sans)";
    tempDiv.style.letterSpacing = `${letterSpacing}px`;
    tempDiv.style.lineHeight = `${lineHeight}px`;
    tempDiv.style.overflowWrap = "break-word";
    tempDiv.textContent = content;

    document.body.appendChild(tempDiv);
    const newHeight = Math.max(20, tempDiv.offsetHeight + 8); // Add some padding
    document.body.removeChild(tempDiv);

    return { width, height: newHeight };
  }

  return { width, height };
};

/**
 * Create text editing handlers
 */
export const createTextEditingHandlers = (
  element: any,
  onTextChange: (content: string) => void,
  setIsEditing: (editing: boolean) => void,
  textRef: React.RefObject<HTMLDivElement | null>,
  onResizeNoHistory?: (width: number, height: number) => void
) => {
  const handleTextDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    e.nativeEvent.stopImmediatePropagation();
    setIsEditing(true);

    // Focus the text element and place cursor at click position (Figma behavior)
    setTimeout(() => {
      if (textRef.current) {
        // Ensure the content is set before focusing
        if (
          !textRef.current.textContent ||
          textRef.current.textContent.trim() === ""
        ) {
          textRef.current.textContent = element.content || "Text";
        }

        textRef.current.focus();

        // Don't select all text - just place cursor where clicked
        const range = document.createRange();
        const selection = window.getSelection();

        // Try to place cursor at the clicked position
        try {
          let clickRange: Range | null = null;

          // Try modern approach first
          if (document.caretRangeFromPoint && e.clientX && e.clientY) {
            clickRange = document.caretRangeFromPoint(e.clientX, e.clientY);
          }
          // Fallback for browsers that don't support caretRangeFromPoint
          else if (
            (document as any).caretPositionFromPoint &&
            e.clientX &&
            e.clientY
          ) {
            const caretPos = (document as any).caretPositionFromPoint(
              e.clientX,
              e.clientY
            );
            if (caretPos) {
              clickRange = document.createRange();
              clickRange.setStart(caretPos.offsetNode, caretPos.offset);
              clickRange.collapse(true);
            }
          }

          if (
            clickRange &&
            textRef.current.contains(clickRange.startContainer)
          ) {
            selection?.removeAllRanges();
            selection?.addRange(clickRange);
            return;
          }
        } catch (error) {
          console.warn("Could not position cursor at click location:", error);
        }

        // Fallback: place cursor at end of text
        if (textRef.current.firstChild && textRef.current.textContent) {
          range.setStart(
            textRef.current.firstChild,
            textRef.current.textContent.length
          );
          range.collapse(true);
        } else {
          range.selectNodeContents(textRef.current);
          range.collapse(false);
        }
        selection?.removeAllRanges();
        selection?.addRange(range);
      }
    }, 10);
  };

  const handleTextBlur = () => {
    setIsEditing(false);
  };

  const handleTextChange = (e: React.FormEvent<HTMLDivElement>) => {
    const newContent = e.currentTarget.textContent || "Text";
    onTextChange(newContent);

    // Handle auto-height resizing during editing (like Figma)
    if (
      element.textResizing === "auto-height" &&
      onResizeNoHistory &&
      textRef.current
    ) {
      setTimeout(() => {
        if (!textRef.current) return;

        const content = textRef.current.textContent || "Text";
        const {
          fontSize = 16,
          fontWeight = 400,
          letterSpacing = 0,
          lineHeight = fontSize * 1.2,
          width,
        } = element;

        // Create a measuring div with the same styles
        const tempDiv = document.createElement("div");
        tempDiv.style.position = "absolute";
        tempDiv.style.visibility = "hidden";
        tempDiv.style.width = `${width - 8}px`; // Account for padding
        tempDiv.style.fontSize = `${fontSize}px`;
        tempDiv.style.fontWeight = `${fontWeight}`;
        tempDiv.style.fontFamily = "var(--font-geist-sans)";
        tempDiv.style.letterSpacing = `${letterSpacing}px`;
        tempDiv.style.lineHeight = `${lineHeight}px`;
        tempDiv.style.overflowWrap = "break-word";
        tempDiv.style.whiteSpace = "normal";
        tempDiv.textContent = content;

        document.body.appendChild(tempDiv);
        const newHeight = Math.max(20, tempDiv.offsetHeight + 8);
        document.body.removeChild(tempDiv);

        if (Math.abs(newHeight - element.height) > 2) {
          onResizeNoHistory(width, newHeight);
        }
      }, 0);
    }
  };

  const handleTextKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    // Handle Enter key properly for auto-height text
    if (e.key === "Enter") {
      if (element.textResizing === "auto-height") {
        // Allow natural line break for auto-height
        return;
      } else if (element.textResizing === "auto-width") {
        // Only allow line break with Shift+Enter for auto-width
        if (!e.shiftKey) {
          e.preventDefault();
          return;
        }
      }
      // For fixed size, allow Enter normally
    }

    // Handle Escape to exit editing
    if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      if (textRef.current) {
        textRef.current.blur();
      }
      return;
    }

    // Prevent other keyboard shortcuts from bubbling up
    e.stopPropagation();
  };

  return {
    handleTextDoubleClick,
    handleTextBlur,
    handleTextChange,
    handleTextKeyDown,
  };
};

/**
 * Create text input handlers for real-time auto-resizing
 */
export const createTextInputHandlers = (
  element: any,
  onResizeNoHistory: (width: number, height: number) => void,
  textRef: React.RefObject<HTMLDivElement | null>
) => {
  const handleInput = () => {
    if (!textRef.current) {
      return;
    }

    const content = textRef.current.textContent || "Text";
    const fontSize = element.fontSize || 16;
    const fontWeight = element.fontWeight || 400;
    const letterSpacing = element.letterSpacing || 0;
    const lineHeight = element.lineHeight || fontSize * 1.2;

    if (element.textResizing === "auto-width") {
      // Auto-width: measure text width and update width
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
    } else if (element.textResizing === "auto-height") {
      // Auto-height: measure text height with fixed width and update height
      const tempDiv = document.createElement("div");
      tempDiv.style.position = "absolute";
      tempDiv.style.visibility = "hidden";
      tempDiv.style.width = `${element.width - 8}px`; // Account for padding
      tempDiv.style.fontSize = `${fontSize}px`;
      tempDiv.style.fontWeight = `${fontWeight}`;
      tempDiv.style.fontFamily = "var(--font-geist-sans)";
      tempDiv.style.letterSpacing = `${letterSpacing}px`;
      tempDiv.style.lineHeight = `${lineHeight}px`;
      tempDiv.style.overflowWrap = "break-word";
      tempDiv.style.whiteSpace = "normal";
      tempDiv.textContent = content;

      document.body.appendChild(tempDiv);
      const newHeight = Math.max(20, tempDiv.offsetHeight + 8);
      document.body.removeChild(tempDiv);

      if (Math.abs(newHeight - element.height) > 2) {
        onResizeNoHistory(element.width, newHeight);
      }
    }
  };

  const attachInputListeners = () => {
    if (!textRef.current) return () => {};

    const textElement = textRef.current;
    textElement.addEventListener("input", handleInput);
    textElement.addEventListener("keyup", handleInput);

    return () => {
      textElement.removeEventListener("input", handleInput);
      textElement.removeEventListener("keyup", handleInput);
    };
  };

  return { attachInputListeners };
};

/**
 * Handle text element double-click to fit content
 */
export const handleTextFitContent = (
  element: any,
  textRef: React.RefObject<HTMLDivElement | null>,
  onResize: (
    width: number,
    height: number,
    maintainAspectRatio?: boolean
  ) => void
) => {
  if (element.type !== "text" || !textRef.current) {
    return;
  }

  // Use scrollWidth/scrollHeight for content size
  const node = textRef.current;
  const prevWidth = node.style.width;
  const prevHeight = node.style.height;

  // Temporarily set width/height to auto to measure
  node.style.width = "auto";
  node.style.height = "auto";

  const fitWidth = node.scrollWidth;
  const fitHeight = node.scrollHeight;

  // Restore previous styles
  node.style.width = prevWidth;
  node.style.height = prevHeight;

  onResize(fitWidth, fitHeight, false);
};

/**
 * Get text style properties for rendering
 */
export const getTextStyles = (element: any, isEditing: boolean = false) => {
  const baseStyles = {
    color: element.color,
    fontSize: element.fontSize ? `${element.fontSize}px` : undefined,
    fontWeight: element.fontWeight,
    letterSpacing: element.letterSpacing
      ? `${element.letterSpacing}px`
      : undefined,
    lineHeight: element.lineHeight ? `${element.lineHeight}px` : undefined,
    padding: "4px", // Add some padding
  };

  // Handle different text resizing modes
  if (element.textResizing === "auto-width") {
    return {
      ...baseStyles,
      whiteSpace: "nowrap" as const,
      overflowWrap: "normal" as const,
    };
  } else if (element.textResizing === "auto-height") {
    return {
      ...baseStyles,
      whiteSpace: "normal" as const,
      overflowWrap: "break-word" as const,
      wordWrap: "break-word" as const,
    };
  } else {
    // Fixed size
    return {
      ...baseStyles,
      whiteSpace: "normal" as const,
      overflowWrap: "break-word" as const,
      wordWrap: "break-word" as const,
    };
  }
};

/**
 * Get text alignment classes
 */
export const getTextAlignmentClasses = (element: any) => {
  const horizontalClasses = {
    left: "justify-start",
    center: "justify-center",
    right: "justify-end",
  };

  const verticalClasses = {
    top: "items-start",
    middle: "items-center",
    bottom: "items-end",
  };

  return [
    horizontalClasses[
      element.horizontalAlign as keyof typeof horizontalClasses
    ] || "justify-start",
    verticalClasses[element.verticalAlign as keyof typeof verticalClasses] ||
      "items-start",
  ].join(" ");
};
