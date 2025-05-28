import { useState, useCallback } from "react";
import type { CanvasElementData } from "../types";

interface DragSelectionState {
  isSelecting: boolean;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
}

export const useDragSelection = (
  selectedTool: string | null,
  canvasPosition: { x: number; y: number },
  zoom: number,
  elements: CanvasElementData[],
  onSelectMultiple: (ids: string[]) => void,
  artboardDimensions?: { width: number; height: number }
) => {
  const [dragSelection, setDragSelection] = useState<DragSelectionState>({
    isSelecting: false,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
  });

  const handleSelectionStart = useCallback(
    (e: React.MouseEvent) => {
      // Only allow drag selection when not using hand tool
      if (selectedTool === "hand") return false;

      // Check if clicking on empty space (not on elements)
      const target = e.target as HTMLElement;
      const isEmptySpace =
        target.classList.contains("canvas-background") ||
        target.closest(".canvas-background");

      if (!isEmptySpace) return false;

      // Use clientX and clientY directly since the selection rectangle
      // is positioned in a fixed container at top-0 left-0
      const x = e.clientX;
      const y = e.clientY;

      setDragSelection({
        isSelecting: true,
        startX: x,
        startY: y,
        currentX: x,
        currentY: y,
      });

      return true;
    },
    [selectedTool]
  );

  const handleSelectionMove = useCallback(
    (e: React.MouseEvent) => {
      if (!dragSelection.isSelecting) return;

      // Use clientX and clientY directly since the selection rectangle
      // is positioned in a fixed container at top-0 left-0
      const x = e.clientX;
      const y = e.clientY;

      setDragSelection((prev) => ({
        ...prev,
        currentX: x,
        currentY: y,
      }));
    },
    [dragSelection.isSelecting]
  );

  const handleSelectionEnd = useCallback(() => {
    if (!dragSelection.isSelecting) return;

    // Calculate selection rectangle in canvas coordinates
    const minX = Math.min(dragSelection.startX, dragSelection.currentX);
    const maxX = Math.max(dragSelection.startX, dragSelection.currentX);
    const minY = Math.min(dragSelection.startY, dragSelection.currentY);
    const maxY = Math.max(dragSelection.startY, dragSelection.currentY);

    // Convert screen coordinates to artboard coordinates
    // We need to reverse the transformations applied to the artboard:
    // 1. Artboard container has translate(canvasPosition.x, canvasPosition.y)
    // 2. Artboard is centered in viewport (50%, 50% with negative margins)
    // 3. Artboard has scale(zoom/100)

    const canvasScale = zoom / 100;
    const viewportCenterX = window.innerWidth / 2;
    const viewportCenterY = window.innerHeight / 2;

    // Convert from screen coordinates to artboard coordinates
    // Step 1: Offset from viewport center and account for canvas pan
    const offsetX = minX - viewportCenterX - canvasPosition.x;
    const offsetY = minY - viewportCenterY - canvasPosition.y;
    const offsetMaxX = maxX - viewportCenterX - canvasPosition.x;
    const offsetMaxY = maxY - viewportCenterY - canvasPosition.y;

    // Step 2: Reverse the zoom scale and account for artboard center
    const artboardCenterX = artboardDimensions
      ? artboardDimensions.width / 2
      : 400;
    const artboardCenterY = artboardDimensions
      ? artboardDimensions.height / 2
      : 300;

    const canvasMinX = offsetX / canvasScale + artboardCenterX;
    const canvasMaxX = offsetMaxX / canvasScale + artboardCenterX;
    const canvasMinY = offsetY / canvasScale + artboardCenterY;
    const canvasMaxY = offsetMaxY / canvasScale + artboardCenterY;

    // Find elements that intersect with selection rectangle
    const selectedElementIds = elements
      .filter((element) => {
        const elementLeft = element.x;
        const elementRight = element.x + element.width;
        const elementTop = element.y;
        const elementBottom = element.y + element.height;

        // Check if element intersects with selection rectangle
        return !(
          elementRight < canvasMinX ||
          elementLeft > canvasMaxX ||
          elementBottom < canvasMinY ||
          elementTop > canvasMaxY
        );
      })
      .map((element) => element.id);

    // Only select if we have a meaningful selection area (minimum 5px)
    const selectionWidth = maxX - minX;
    const selectionHeight = maxY - minY;

    if (
      selectionWidth > 5 &&
      selectionHeight > 5 &&
      selectedElementIds.length > 0
    ) {
      onSelectMultiple(selectedElementIds);
    }

    setDragSelection({
      isSelecting: false,
      startX: 0,
      startY: 0,
      currentX: 0,
      currentY: 0,
    });
  }, [
    dragSelection,
    canvasPosition,
    zoom,
    elements,
    onSelectMultiple,
    artboardDimensions,
  ]);

  const getSelectionRectangle = useCallback(() => {
    if (!dragSelection.isSelecting) return null;

    const minX = Math.min(dragSelection.startX, dragSelection.currentX);
    const maxX = Math.max(dragSelection.startX, dragSelection.currentX);
    const minY = Math.min(dragSelection.startY, dragSelection.currentY);
    const maxY = Math.max(dragSelection.startY, dragSelection.currentY);

    return {
      left: minX,
      top: minY,
      width: maxX - minX,
      height: maxY - minY,
    };
  }, [dragSelection]);

  return {
    dragSelection,
    handleSelectionStart,
    handleSelectionMove,
    handleSelectionEnd,
    getSelectionRectangle,
  };
};
