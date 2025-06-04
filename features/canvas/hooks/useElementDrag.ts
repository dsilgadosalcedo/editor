import { useState, useCallback } from "react";
import {
  createElementDragHandlers,
  type ElementDragState,
} from "../services/element-interactions";

interface UseElementDragProps {
  elementId: string;
  onMove: (id: string, dx: number, dy: number) => void;
  onMoveNoHistory: (id: string, dx: number, dy: number) => void;
  onAddToHistory?: () => void;
  zoom: number;
}

export const useElementDrag = ({
  elementId,
  onMove,
  onMoveNoHistory,
  onAddToHistory,
  zoom,
}: UseElementDragProps) => {
  const [dragState, setDragState] = useState<ElementDragState>({
    isDragging: false,
    startX: 0,
    startY: 0,
  });
  const [prepareDrag, setPrepareDrag] = useState(false);
  const [justDragged, setJustDragged] = useState(false);

  // Wrapper functions to adapt signatures
  const handleMove = useCallback(
    (dx: number, dy: number) => {
      onMove(elementId, dx, dy);
    },
    [elementId, onMove]
  );

  const handleMoveNoHistory = useCallback(
    (dx: number, dy: number) => {
      onMoveNoHistory(elementId, dx, dy);
    },
    [elementId, onMoveNoHistory]
  );

  // Create drag handlers using the service
  const dragHandlers = createElementDragHandlers(
    elementId,
    handleMove,
    handleMoveNoHistory,
    onAddToHistory,
    zoom,
    { isDragging: dragState.isDragging },
    setDragState,
    setPrepareDrag,
    setJustDragged
  );

  const resetDragState = useCallback(() => {
    setDragState({
      isDragging: false,
      startX: 0,
      startY: 0,
    });
    setPrepareDrag(false);
    setJustDragged(false);
  }, []);

  return {
    dragState,
    prepareDrag,
    justDragged,
    dragHandlers,
    resetDragState,
    isDragging: dragState.isDragging,
  };
};
