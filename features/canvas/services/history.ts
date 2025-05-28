import { CanvasElementData } from "../types";

/**
 * Service for managing canvas history (undo/redo functionality)
 * Extracted from useCanvasStore to separate business logic from state management
 */

export interface HistoryState {
  elements: CanvasElementData[];
  past: CanvasElementData[][];
  future: CanvasElementData[][];
}

export interface HistoryResult {
  elements: CanvasElementData[];
  past: CanvasElementData[][];
  future: CanvasElementData[][];
}

/**
 * Add current state to history
 */
export const addToHistory = (state: HistoryState): HistoryResult => {
  const { elements, past } = state;

  return {
    elements,
    past: [...past, elements],
    future: [], // Clear future when making new changes
  };
};

/**
 * Get history update object for adding to past
 */
export const getHistoryUpdate = (
  state: HistoryState
): { past: CanvasElementData[][]; future: CanvasElementData[][] } => {
  const { elements, past } = state;

  return {
    past: [...past, elements],
    future: [], // Clear future when making new changes
  };
};

/**
 * Undo last action
 */
export const undo = (
  state: HistoryState,
  selectedElements: string[]
): HistoryResult => {
  const { elements, past, future } = state;

  if (past.length === 0) return state;

  const previous = past[past.length - 1];

  // Preserve selection by finding elements that were selected in the current state
  const elementsToKeepSelected = previous
    .filter((el) => selectedElements.includes(el.id))
    .map((el) => el.id);

  const updatedElements = previous.map((el) => ({
    ...el,
    selected: elementsToKeepSelected.includes(el.id),
  }));

  return {
    elements: updatedElements,
    past: past.slice(0, past.length - 1),
    future: [elements, ...future],
  };
};

/**
 * Redo last undone action
 */
export const redo = (
  state: HistoryState,
  selectedElements: string[]
): HistoryResult => {
  const { elements, past, future } = state;

  if (future.length === 0) return state;

  const next = future[0];

  // Preserve selection by finding elements that were selected in the current state
  const elementsToKeepSelected = next
    .filter((el) => selectedElements.includes(el.id))
    .map((el) => el.id);

  const updatedElements = next.map((el) => ({
    ...el,
    selected: elementsToKeepSelected.includes(el.id),
  }));

  return {
    elements: updatedElements,
    past: [...past, elements],
    future: future.slice(1),
  };
};

/**
 * Clear history
 */
export const clearHistory = (): Pick<HistoryResult, "past" | "future"> => {
  return {
    past: [],
    future: [],
  };
};

/**
 * Check if undo is available
 */
export const canUndo = (state: HistoryState): boolean => {
  return state.past.length > 0;
};

/**
 * Check if redo is available
 */
export const canRedo = (state: HistoryState): boolean => {
  return state.future.length > 0;
};

/**
 * Get history statistics
 */
export const getHistoryStats = (
  state: HistoryState
): {
  undoCount: number;
  redoCount: number;
  totalOperations: number;
} => {
  const { past, future } = state;

  return {
    undoCount: past.length,
    redoCount: future.length,
    totalOperations: past.length + future.length,
  };
};
