import { useState, useCallback, useMemo } from "react";
import { CanvasElementData } from "../types";

interface UseSelectionStateProps {
  elements: CanvasElementData[];
  onElementUpdate?: (elements: CanvasElementData[]) => void;
}

export const useSelectionState = ({
  elements,
  onElementUpdate,
}: UseSelectionStateProps) => {
  const [selectedElements, setSelectedElements] = useState<string[]>([]);

  // Get selected element data
  const selectedElementData = useMemo(() => {
    if (selectedElements.length !== 1) return null;
    return elements.find((el) => el.id === selectedElements[0]) || null;
  }, [elements, selectedElements]);

  // Check if multiple elements are selected
  const hasMultipleSelection = useCallback(() => {
    return selectedElements.length > 1;
  }, [selectedElements]);

  // Select a single element
  const selectElement = useCallback(
    (id: string | null, addToSelection = false) => {
      if (id === null) {
        setSelectedElements([]);
        return;
      }

      setSelectedElements((prev) => {
        if (addToSelection) {
          // Toggle selection if element is already selected
          if (prev.includes(id)) {
            return prev.filter((elId) => elId !== id);
          } else {
            return [...prev, id];
          }
        } else {
          // Single selection
          return [id];
        }
      });

      // Update element selected state
      if (onElementUpdate) {
        const updatedElements = elements.map((el) => ({
          ...el,
          selected: addToSelection
            ? selectedElements.includes(el.id)
              ? !el.selected
              : el.id === id
            : el.id === id,
        }));
        onElementUpdate(updatedElements);
      }
    },
    [elements, selectedElements, onElementUpdate]
  );

  // Select multiple elements
  const selectMultipleElements = useCallback(
    (ids: string[]) => {
      setSelectedElements(ids);

      // Update element selected state
      if (onElementUpdate) {
        const updatedElements = elements.map((el) => ({
          ...el,
          selected: ids.includes(el.id),
        }));
        onElementUpdate(updatedElements);
      }
    },
    [elements, onElementUpdate]
  );

  // Clear selection
  const clearSelection = useCallback(() => {
    setSelectedElements([]);

    // Update element selected state
    if (onElementUpdate) {
      const updatedElements = elements.map((el) => ({
        ...el,
        selected: false,
      }));
      onElementUpdate(updatedElements);
    }
  }, [elements, onElementUpdate]);

  // Select all elements
  const selectAll = useCallback(() => {
    const allIds = elements.map((el) => el.id);
    setSelectedElements(allIds);

    if (onElementUpdate) {
      const updatedElements = elements.map((el) => ({
        ...el,
        selected: true,
      }));
      onElementUpdate(updatedElements);
    }
  }, [elements, onElementUpdate]);

  // Check if element is selected
  const isElementSelected = useCallback(
    (id: string) => {
      return selectedElements.includes(id);
    },
    [selectedElements]
  );

  // Get selection bounds (for multi-selection UI)
  const getSelectionBounds = useCallback(() => {
    if (selectedElements.length === 0) return null;

    const selectedElementsData = elements.filter((el) =>
      selectedElements.includes(el.id)
    );

    if (selectedElementsData.length === 0) return null;

    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;

    selectedElementsData.forEach((el) => {
      minX = Math.min(minX, el.x);
      minY = Math.min(minY, el.y);
      maxX = Math.max(maxX, el.x + el.width);
      maxY = Math.max(maxY, el.y + el.height);
    });

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
    };
  }, [elements, selectedElements]);

  return {
    selectedElements,
    selectedElementData,
    hasMultipleSelection,
    selectElement,
    selectMultipleElements,
    clearSelection,
    selectAll,
    isElementSelected,
    getSelectionBounds,
    selectionCount: selectedElements.length,
  };
};
