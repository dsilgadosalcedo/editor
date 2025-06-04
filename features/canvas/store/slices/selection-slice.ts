import { StateCreator } from "zustand";
import { SelectionState, SelectionActions } from "../types/store-types";
import {
  selectElement as selectElementService,
  selectMultipleElements as selectMultipleElementsService,
  clearSelection as clearSelectionService,
  getSelectedElementData as getSelectedElementDataService,
  getSelectedElementsData as getSelectedElementsDataService,
  hasMultipleSelection as hasMultipleSelectionService,
  type SelectionState as ServiceSelectionState,
} from "../../services/selection";
import {
  copyToClipboard,
  pasteFromClipboard,
} from "../../services/canvas-state";

// Selection slice now uses centralized types
export interface SelectionSlice extends SelectionState, SelectionActions {}

export const createSelectionSlice: StateCreator<
  SelectionSlice & {
    elements: any[];
    getElementDescendants: (elementId: string) => string[];
    addToHistory: () => void;
    getHistoryUpdate: () => {
      past: any[][];
      future: any[][];
    };
  },
  [],
  [],
  SelectionSlice
> = (set, get) => ({
  // Initial state
  selectedElements: [],
  clipboard: null,

  // Actions
  selectElement: (id, addToSelection = false) => {
    const state = get();
    const selectionState: ServiceSelectionState = {
      selectedElements: state.selectedElements,
      elements: state.elements,
    };

    const result = selectElementService(selectionState, id, addToSelection);

    set({
      elements: result.updatedElements,
      selectedElements: result.selectedElements,
    });
  },

  selectMultipleElements: (ids) => {
    const state = get();
    const selectionState: ServiceSelectionState = {
      selectedElements: state.selectedElements,
      elements: state.elements,
    };

    const result = selectMultipleElementsService(selectionState, ids);

    set({
      elements: result.updatedElements,
      selectedElements: result.selectedElements,
    });
  },

  clearSelection: () => {
    const state = get();
    const selectionState: ServiceSelectionState = {
      selectedElements: state.selectedElements,
      elements: state.elements,
    };

    const result = clearSelectionService(selectionState);

    set({
      elements: result.updatedElements,
      selectedElements: result.selectedElements,
    });
  },

  getSelectedElementData: () => {
    const state = get();
    const selectionState: ServiceSelectionState = {
      selectedElements: state.selectedElements,
      elements: state.elements,
    };

    return getSelectedElementDataService(selectionState);
  },

  getSelectedElementsData: () => {
    const state = get();
    const selectionState: ServiceSelectionState = {
      selectedElements: state.selectedElements,
      elements: state.elements,
    };

    return getSelectedElementsDataService(selectionState);
  },

  hasMultipleSelection: () => {
    const state = get();
    const selectionState: ServiceSelectionState = {
      selectedElements: state.selectedElements,
      elements: state.elements,
    };

    return hasMultipleSelectionService(selectionState);
  },

  copySelection: () => {
    const state = get();
    const { getElementDescendants } = get();

    // Get all selected elements and their descendants
    const elementsToCopy: string[] = [];

    state.selectedElements.forEach((selectedId) => {
      elementsToCopy.push(selectedId);
      // If it's a group, also include all its descendants
      const element = state.elements.find((el: any) => el.id === selectedId);
      if (element?.type === "group") {
        elementsToCopy.push(...getElementDescendants(selectedId));
      }
    });

    // Remove duplicates and get the actual elements
    const uniqueElementIds = [...new Set(elementsToCopy)];
    const selectedElements = state.elements.filter((el: any) =>
      uniqueElementIds.includes(el.id)
    );

    // Update internal clipboard to store all selected elements and their descendants
    const clipboardElements =
      selectedElements.length > 0
        ? selectedElements.map((el: any) => ({ ...el }))
        : null;

    set({ clipboard: clipboardElements });

    // Also copy to system clipboard for Figma compatibility
    if (selectedElements.length > 0) {
      // Import the function dynamically to avoid issues during SSR
      import("@/lib/figma-clipboard")
        .then(({ copyToFigmaClipboard }) => {
          return copyToFigmaClipboard(selectedElements, {
            includeBackground: false,
            padding: 20,
            scale: 1,
          });
        })
        .catch((error) => {
          console.warn("Failed to copy to system clipboard:", error);
          // Silently fail - the internal clipboard still works
        });
    }
  },

  pasteClipboard: () => {
    const state = get();
    const { getHistoryUpdate } = get();

    if (!state.clipboard || state.clipboard.length === 0) return;

    const newElements: any[] = [];
    const newElementIds: string[] = [];
    const oldToNewIdMapping: { [oldId: string]: string } = {};

    // First pass: Create all elements with new IDs
    state.clipboard.forEach((clipboardElement: any, index: number) => {
      const newId = `${clipboardElement.type}-${Date.now()}-${index}`;
      oldToNewIdMapping[clipboardElement.id] = newId;

      const newElement: any = {
        ...clipboardElement,
        id: newId,
        x: clipboardElement.x + 20,
        y: clipboardElement.y + 20,
        selected: true,
        rotation: clipboardElement.rotation || 0,
      };

      // Don't modify parentId yet - will do in second pass
      newElements.push(newElement);
      newElementIds.push(newId);
    });

    // Second pass: Update all parent and children relationships
    const finalElements = newElements.map((element) => {
      const updatedElement = { ...element };

      // Update parentId if the parent was also copied
      if (element.parentId && oldToNewIdMapping[element.parentId]) {
        updatedElement.parentId = oldToNewIdMapping[element.parentId];
      } else if (element.parentId) {
        // If parent wasn't copied, make this a top-level element
        delete updatedElement.parentId;
      }

      // Update children array for groups
      if (element.type === "group" && element.children) {
        updatedElement.children = element.children
          .map((childId: string) => oldToNewIdMapping[childId])
          .filter(Boolean); // Only keep children that were also copied
      }

      return updatedElement;
    });

    set({
      ...getHistoryUpdate(),
      elements: [
        ...state.elements.map((el: any) => ({ ...el, selected: false })),
        ...finalElements,
      ],
      selectedElements: newElementIds,
    });
  },
});
