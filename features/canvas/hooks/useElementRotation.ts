import { useState, useCallback } from "react";
import {
  createElementRotationHandlers,
  type RotationState,
} from "../services/element-interactions";
import { CanvasElementData } from "../types";

interface UseElementRotationProps {
  element: CanvasElementData;
  onUpdateRotation: (id: string, rotation: number) => void;
  onUpdateRotationNoHistory: (id: string, rotation: number) => void;
  onAddToHistory?: () => void;
  zoom: number;
}

export const useElementRotation = ({
  element,
  onUpdateRotation,
  onUpdateRotationNoHistory,
  onAddToHistory,
  zoom,
}: UseElementRotationProps) => {
  const [rotationState, setRotationState] = useState<RotationState>({
    isRotating: false,
    startX: 0,
    startY: 0,
    startRotation: 0,
    centerX: 0,
    centerY: 0,
  });

  // Wrapper functions to adapt signatures
  const handleUpdateRotation = useCallback(
    (rotation: number) => {
      onUpdateRotation(element.id, rotation);
    },
    [element.id, onUpdateRotation]
  );

  const handleUpdateRotationNoHistory = useCallback(
    (rotation: number) => {
      onUpdateRotationNoHistory(element.id, rotation);
    },
    [element.id, onUpdateRotationNoHistory]
  );

  // Create rotation handlers using the service
  const rotationHandlers = createElementRotationHandlers(
    element,
    handleUpdateRotation,
    handleUpdateRotationNoHistory,
    onAddToHistory,
    zoom,
    setRotationState
  );

  const resetRotationState = useCallback(() => {
    setRotationState({
      isRotating: false,
      startX: 0,
      startY: 0,
      startRotation: 0,
      centerX: 0,
      centerY: 0,
    });
  }, []);

  return {
    rotationState,
    rotationHandlers,
    resetRotationState,
    isRotating: rotationState.isRotating,
  };
};
