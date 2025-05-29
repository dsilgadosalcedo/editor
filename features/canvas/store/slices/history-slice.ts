import { StateCreator } from "zustand";
import { CanvasElementData } from "../../types";
import {
  addToHistory as addToHistoryService,
  getHistoryUpdate as getHistoryUpdateService,
  undo as undoService,
  redo as redoService,
  type HistoryState,
} from "../../services/history";

export interface HistorySlice {
  // State
  past: CanvasElementData[][];
  future: CanvasElementData[][];

  // Actions
  addToHistory: () => void;
  getHistoryUpdate: () => {
    past: CanvasElementData[][];
    future: CanvasElementData[][];
  };
  undo: () => void;
  redo: () => void;
}

export const createHistorySlice: StateCreator<
  HistorySlice & {
    elements: CanvasElementData[];
    selectedElements: string[];
  },
  [],
  [],
  HistorySlice
> = (set, get) => ({
  // Initial state
  past: [],
  future: [],

  // Actions
  addToHistory: () => {
    const state = get();
    const historyResult = addToHistoryService({
      elements: state.elements,
      past: state.past,
      future: state.future,
    });

    set({
      past: historyResult.past,
      future: historyResult.future,
    });
  },

  getHistoryUpdate: () => {
    const state = get();
    return getHistoryUpdateService({
      elements: state.elements,
      past: state.past,
      future: state.future,
    });
  },

  undo: () => {
    const state = get();
    const historyResult = undoService(
      {
        elements: state.elements,
        past: state.past,
        future: state.future,
      },
      state.selectedElements
    );

    set({
      elements: historyResult.elements,
      past: historyResult.past,
      future: historyResult.future,
    });
  },

  redo: () => {
    const state = get();
    const historyResult = redoService(
      {
        elements: state.elements,
        past: state.past,
        future: state.future,
      },
      state.selectedElements
    );

    set({
      elements: historyResult.elements,
      past: historyResult.past,
      future: historyResult.future,
    });
  },
});
