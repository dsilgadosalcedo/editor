import { useState, useCallback } from "react";
import {
  createElementResizeHandlers,
  type ResizeState,
} from "../services/element-interactions";
import { transformRotatedResize } from "../utils";
import { CanvasElementData } from "../types";

interface UseElementResizeProps {
  element: CanvasElementData;
  onResize: (
    id: string,
    width: number,
    height: number,
    maintainAspectRatio?: boolean
  ) => void;
  onResizeNoHistory: (id: string, width: number, height: number) => void;
  onMove: (id: string, dx: number, dy: number) => void;
  onMoveNoHistory: (id: string, dx: number, dy: number) => void;
  onAddToHistory?: () => void;
  zoom: number;
}

export const useElementResize = ({
  element,
  onResize,
  onResizeNoHistory,
  onMove,
  onMoveNoHistory,
  onAddToHistory,
  zoom,
}: UseElementResizeProps) => {
  const [resizeState, setResizeState] = useState<ResizeState>({
    isResizing: false,
    direction: "",
    startWidth: 0,
    startHeight: 0,
    startX: 0,
    startY: 0,
  });

  // Wrapper functions to adapt signatures
  const handleResize = useCallback(
    (width: number, height: number, maintainAspectRatio?: boolean) => {
      onResize(element.id, width, height, maintainAspectRatio);
    },
    [element.id, onResize]
  );

  const handleResizeNoHistory = useCallback(
    (width: number, height: number) => {
      onResizeNoHistory(element.id, width, height);
    },
    [element.id, onResizeNoHistory]
  );

  const handleMove = useCallback(
    (dx: number, dy: number) => {
      onMove(element.id, dx, dy);
    },
    [element.id, onMove]
  );

  const handleMoveNoHistory = useCallback(
    (dx: number, dy: number) => {
      onMoveNoHistory(element.id, dx, dy);
    },
    [element.id, onMoveNoHistory]
  );

  // Create resize handlers using the service
  const resizeHandlers = createElementResizeHandlers(
    element,
    handleResize,
    handleResizeNoHistory,
    handleMove,
    handleMoveNoHistory,
    onAddToHistory,
    zoom,
    setResizeState,
    transformRotatedResize
  );

  const resetResizeState = useCallback(() => {
    setResizeState({
      isResizing: false,
      direction: "",
      startWidth: 0,
      startHeight: 0,
      startX: 0,
      startY: 0,
    });
  }, []);

  return {
    resizeState,
    resizeHandlers,
    resetResizeState,
    isResizing: resizeState.isResizing,
  };
};
