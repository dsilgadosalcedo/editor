import { useState, useEffect, useRef, useCallback } from "react";
import {
  createTextEditingHandlers,
  createTextInputHandlers,
  calculateTextAutoResize,
} from "../services/text-operations";
import { CanvasElementData } from "../types";

interface UseTextEditingProps {
  element: CanvasElementData;
  onTextChange: (id: string, content: string) => void;
  onResizeNoHistory: (id: string, width: number, height: number) => void;
}

export const useTextEditing = ({
  element,
  onTextChange,
  onResizeNoHistory,
}: UseTextEditingProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const textRef = useRef<HTMLDivElement>(null);

  // Wrapper function to adapt signature
  const handleTextChange = useCallback(
    (content: string) => {
      onTextChange(element.id, content);
    },
    [element.id, onTextChange]
  );

  // Text editing handlers
  const textEditingHandlers = createTextEditingHandlers(
    element,
    handleTextChange,
    setIsEditing,
    textRef
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
        onResizeNoHistory(
          element.id,
          newDimensions.width,
          newDimensions.height
        );
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
    element.id,
    element.type,
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
      (width: number, height: number) =>
        onResizeNoHistory(element.id, width, height),
      textRef
    );

    return attachInputListeners();
  }, [isEditing, element, onResizeNoHistory]);

  const startEditing = useCallback(() => {
    setIsEditing(true);
  }, []);

  const stopEditing = useCallback(() => {
    setIsEditing(false);
  }, []);

  return {
    isEditing,
    textRef,
    textEditingHandlers,
    startEditing,
    stopEditing,
  };
};
