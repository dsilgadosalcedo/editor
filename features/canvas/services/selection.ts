import { CanvasElementData } from "../types";

/**
 * Service for managing element selection state and operations
 * Extracted from useCanvasStore to separate business logic from state management
 */

export interface SelectionState {
  selectedElements: string[];
  elements: CanvasElementData[];
}

export interface SelectionResult {
  selectedElements: string[];
  updatedElements: CanvasElementData[];
}

/**
 * Select a single element
 */
export const selectElement = (
  state: SelectionState,
  elementId: string,
  addToSelection = false
): SelectionResult => {
  const { selectedElements, elements } = state;

  let newSelectedElements: string[];

  if (addToSelection) {
    // Add to or remove from selection
    const isAlreadySelected = selectedElements.includes(elementId);
    newSelectedElements = isAlreadySelected
      ? selectedElements.filter((id) => id !== elementId)
      : [...selectedElements, elementId];
  } else {
    // Single selection
    newSelectedElements = [elementId];
  }

  const updatedElements = elements.map((el) => ({
    ...el,
    selected: newSelectedElements.includes(el.id),
  }));

  return {
    selectedElements: newSelectedElements,
    updatedElements,
  };
};

/**
 * Select multiple elements
 */
export const selectMultipleElements = (
  state: SelectionState,
  elementIds: string[]
): SelectionResult => {
  const { elements } = state;

  const updatedElements = elements.map((el) => ({
    ...el,
    selected: elementIds.includes(el.id),
  }));

  return {
    selectedElements: elementIds,
    updatedElements,
  };
};

/**
 * Clear all selections
 */
export const clearSelection = (state: SelectionState): SelectionResult => {
  const { elements } = state;

  const updatedElements = elements.map((el) => ({
    ...el,
    selected: false,
  }));

  return {
    selectedElements: [],
    updatedElements,
  };
};

/**
 * Get selected element data (single selection)
 */
export const getSelectedElementData = (
  state: SelectionState
): CanvasElementData | undefined => {
  const { selectedElements, elements } = state;

  return selectedElements.length === 1
    ? elements.find((el) => el.id === selectedElements[0])
    : undefined;
};

/**
 * Get all selected elements data
 */
export const getSelectedElementsData = (
  state: SelectionState
): CanvasElementData[] => {
  const { selectedElements, elements } = state;

  return elements.filter((el) => selectedElements.includes(el.id));
};

/**
 * Check if multiple elements are selected
 */
export const hasMultipleSelection = (state: SelectionState): boolean => {
  return state.selectedElements.length > 1;
};

/**
 * Select elements within a rectangle (drag selection)
 */
export const selectElementsInRectangle = (
  state: SelectionState,
  rectangle: {
    left: number;
    top: number;
    width: number;
    height: number;
  },
  addToSelection = false
): SelectionResult => {
  const { elements, selectedElements } = state;
  const { left, top, width, height } = rectangle;

  const elementsInRectangle = elements
    .filter((el) => {
      // Check if element overlaps with selection rectangle
      const elementRight = el.x + el.width;
      const elementBottom = el.y + el.height;
      const rectRight = left + width;
      const rectBottom = top + height;

      return !(
        el.x > rectRight ||
        elementRight < left ||
        el.y > rectBottom ||
        elementBottom < top
      );
    })
    .map((el) => el.id);

  let newSelectedElements: string[];

  if (addToSelection) {
    // Add to existing selection
    newSelectedElements = [
      ...new Set([...selectedElements, ...elementsInRectangle]),
    ];
  } else {
    // Replace selection
    newSelectedElements = elementsInRectangle;
  }

  const updatedElements = elements.map((el) => ({
    ...el,
    selected: newSelectedElements.includes(el.id),
  }));

  return {
    selectedElements: newSelectedElements,
    updatedElements,
  };
};

/**
 * Select all elements
 */
export const selectAll = (state: SelectionState): SelectionResult => {
  const { elements } = state;

  const allElementIds = elements.map((el) => el.id);
  const updatedElements = elements.map((el) => ({
    ...el,
    selected: true,
  }));

  return {
    selectedElements: allElementIds,
    updatedElements,
  };
};

/**
 * Invert selection
 */
export const invertSelection = (state: SelectionState): SelectionResult => {
  const { elements, selectedElements } = state;

  const newSelectedElements = elements
    .filter((el) => !selectedElements.includes(el.id))
    .map((el) => el.id);

  const updatedElements = elements.map((el) => ({
    ...el,
    selected: newSelectedElements.includes(el.id),
  }));

  return {
    selectedElements: newSelectedElements,
    updatedElements,
  };
};
