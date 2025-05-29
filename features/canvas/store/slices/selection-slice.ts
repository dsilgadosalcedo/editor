import { StateCreator } from "zustand";
import { CanvasElementData } from "../../types";
import {
  selectElement as selectElementService,
  selectMultipleElements as selectMultipleElementsService,
  clearSelection as clearSelectionService,
  getSelectedElementData as getSelectedElementDataService,
  getSelectedElementsData as getSelectedElementsDataService,
  hasMultipleSelection as hasMultipleSelectionService,
  type SelectionState,
} from "../../services/selection";
import {
  copyToClipboard,
  pasteFromClipboard,
} from "../../services/canvas-state";

export interface SelectionSlice {
  // State
  selectedElements: string[];
  clipboard: CanvasElementData[] | null;

  // Actions
  selectElement: (id: string, addToSelection?: boolean) => void;
  selectMultipleElements: (ids: string[]) => void;
  clearSelection: () => void;
  getSelectedElementData: () => CanvasElementData | undefined;
  getSelectedElementsData: () => CanvasElementData[];
  hasMultipleSelection: () => boolean;
  copySelection: () => void;
  pasteClipboard: () => void;
}

export const createSelectionSlice: StateCreator<
  SelectionSlice & { elements: CanvasElementData[] },
  [],
  [],
  SelectionSlice
> = (set, get) => ({
  // Initial state
  selectedElements: [],
  clipboard: null,

  // Actions
  selectElement: (id, addToSelection = false) => {
    const { elements, selectedElements } = get();
    const selectionState: SelectionState = { elements, selectedElements };
    const result = selectElementService(selectionState, id, addToSelection);

    set({
      selectedElements: result.selectedElements,
      elements: result.updatedElements,
    });
  },

  selectMultipleElements: (ids) => {
    const { elements, selectedElements } = get();
    const selectionState: SelectionState = { elements, selectedElements };
    const result = selectMultipleElementsService(selectionState, ids);

    set({
      selectedElements: result.selectedElements,
      elements: result.updatedElements,
    });
  },

  clearSelection: () => {
    const { elements, selectedElements } = get();
    const selectionState: SelectionState = { elements, selectedElements };
    const result = clearSelectionService(selectionState);

    set({
      selectedElements: result.selectedElements,
      elements: result.updatedElements,
    });
  },

  getSelectedElementData: () => {
    const { elements, selectedElements } = get();
    const selectionState: SelectionState = { elements, selectedElements };
    return getSelectedElementDataService(selectionState);
  },

  getSelectedElementsData: () => {
    const { elements, selectedElements } = get();
    const selectionState: SelectionState = { elements, selectedElements };
    return getSelectedElementsDataService(selectionState);
  },

  hasMultipleSelection: () => {
    const { selectedElements } = get();
    return selectedElements.length > 1;
  },

  copySelection: () => {
    const { elements, selectedElements } = get();
    const getElementDescendants = (elementId: string) => [];
    const copiedElements = copyToClipboard(
      elements,
      selectedElements,
      getElementDescendants
    );
    set({ clipboard: copiedElements });
  },

  pasteClipboard: () => {
    const { elements, clipboard } = get();
    if (clipboard && clipboard.length > 0) {
      const result = pasteFromClipboard(elements, clipboard);
      set({
        elements: result.elements,
        selectedElements: result.newElementIds,
      });
    }
  },
});
