import { StateCreator } from "zustand";
import { CanvasState, CanvasActions } from "../types/store-types";
import { ElementType } from "../../types";
import {
  createElement,
  createImageElement,
  CreateElementOptions,
  CreateImageElementOptions,
} from "../../services/element-operations";
import {
  moveElement as moveElementService,
  moveSelectedElements as moveSelectedElementsService,
  resizeElement as resizeElementService,
  deleteElement as deleteElementService,
  updateElementProperty,
  toggleElementVisibility as toggleElementVisibilityService,
  resetCanvas as resetCanvasService,
} from "../../services/canvas-state";

// Canvas slice now uses centralized types
export interface CanvasSlice extends CanvasState, CanvasActions {}

export const createCanvasSlice: StateCreator<
  CanvasSlice & {
    selectedElements: string[];
    addToHistory: () => void;
    getHistoryUpdate: () => {
      past: any[][];
      future: any[][];
    };
    getElementDescendants: (elementId: string) => string[];
  },
  [],
  [],
  CanvasSlice
> = (set, get) => ({
  // Initial state
  elements: [],
  artboardDimensions: { width: 1024, height: 576 },
  artboardAspectRatio: 16 / 9,
  isCustomAspectRatio: false,

  // Actions
  setArtboardDimensions: (dims) => {
    set({ artboardDimensions: dims });
  },

  setArtboardAspectRatio: (ratio) => {
    set({ artboardAspectRatio: ratio });
  },

  setCustomAspectRatio: (isCustom) => {
    set({ isCustomAspectRatio: isCustom });
  },

  addElement: (type) => {
    const { artboardDimensions, getHistoryUpdate } = get();
    const options: CreateElementOptions = {
      artboardWidth: artboardDimensions.width,
      artboardHeight: artboardDimensions.height,
    };
    const newElement = createElement(type, options);

    set((state) => ({
      ...getHistoryUpdate(),
      elements: [
        ...state.elements.map((el) => ({ ...el, selected: false })),
        newElement,
      ],
    }));
  },

  addElementAtPosition: (type: ElementType, x: number, y: number) => {
    const { artboardDimensions, getHistoryUpdate } = get();
    const options: CreateElementOptions = {
      artboardWidth: artboardDimensions.width,
      artboardHeight: artboardDimensions.height,
      position: { x, y },
    };
    const newElement = createElement(type, options);

    set((state) => ({
      ...getHistoryUpdate(),
      elements: [
        ...state.elements.map((el) => ({ ...el, selected: false })),
        newElement,
      ],
    }));
  },

  addImageElement: (src, x, y) => {
    const { artboardDimensions, getHistoryUpdate } = get();
    const options: CreateImageElementOptions = {
      src,
      artboardWidth: artboardDimensions.width,
      artboardHeight: artboardDimensions.height,
      position: x !== undefined && y !== undefined ? { x, y } : undefined,
    };

    createImageElement(options).then((newElement) => {
      set((state) => ({
        ...getHistoryUpdate(),
        elements: [
          ...state.elements.map((el) => ({ ...el, selected: false })),
          newElement,
        ],
      }));
    });
  },

  moveElement: (id, dx, dy) => {
    const { getHistoryUpdate, getElementDescendants } = get();
    set((state) => {
      const updatedElements = moveElementService(
        state.elements,
        id,
        dx,
        dy,
        getElementDescendants
      );
      return {
        ...getHistoryUpdate(),
        elements: updatedElements,
      };
    });
  },

  moveElementNoHistory: (id, dx, dy) => {
    const { getElementDescendants } = get();
    set((state) => ({
      elements: moveElementService(
        state.elements,
        id,
        dx,
        dy,
        getElementDescendants
      ),
    }));
  },

  moveSelectedElements: (dx, dy) => {
    const { getHistoryUpdate, getElementDescendants, selectedElements } = get();
    set((state) => {
      const updatedElements = moveSelectedElementsService(
        state.elements,
        selectedElements,
        dx,
        dy,
        getElementDescendants
      );
      return {
        ...getHistoryUpdate(),
        elements: updatedElements,
      };
    });
  },

  moveSelectedElementsNoHistory: (dx, dy) => {
    const { getElementDescendants, selectedElements } = get();
    set((state) => ({
      elements: moveSelectedElementsService(
        state.elements,
        selectedElements,
        dx,
        dy,
        getElementDescendants
      ),
    }));
  },

  resizeElement: (id, width, height, preserveAspectRatio = false) => {
    const { getHistoryUpdate, getElementDescendants } = get();
    set((state) => {
      const updatedElements = resizeElementService(
        state.elements,
        id,
        width,
        height,
        preserveAspectRatio,
        getElementDescendants
      );
      return {
        ...getHistoryUpdate(),
        elements: updatedElements,
      };
    });
  },

  resizeElementNoHistory: (id, width, height, preserveAspectRatio = false) => {
    const { getElementDescendants } = get();
    set((state) => ({
      elements: resizeElementService(
        state.elements,
        id,
        width,
        height,
        preserveAspectRatio,
        getElementDescendants
      ),
    }));
  },

  resizeSelectedElements: (
    baseId,
    newWidth,
    newHeight,
    preserveAspectRatio = false
  ) => {
    const { getHistoryUpdate, selectedElements } = get();
    set((state) => {
      const baseElement = state.elements.find((el) => el.id === baseId);
      if (!baseElement || !selectedElements.includes(baseId)) {
        return state;
      }

      let scaleX = newWidth / baseElement.width;
      let scaleY = newHeight / baseElement.height;

      if (preserveAspectRatio) {
        const scale = Math.min(scaleX, scaleY);
        scaleX = scale;
        scaleY = scale;
      }

      return {
        ...getHistoryUpdate(),
        elements: state.elements.map((el) => {
          if (selectedElements.includes(el.id)) {
            return {
              ...el,
              width: Math.max(20, Math.round(el.width * scaleX)),
              height: Math.max(20, Math.round(el.height * scaleY)),
            };
          }
          return el;
        }),
      };
    });
  },

  resizeSelectedElementsNoHistory: (
    baseId,
    newWidth,
    newHeight,
    preserveAspectRatio = false
  ) => {
    const { selectedElements } = get();
    set((state) => {
      const baseElement = state.elements.find((el) => el.id === baseId);
      if (!baseElement || !selectedElements.includes(baseId)) {
        return state;
      }

      let scaleX = newWidth / baseElement.width;
      let scaleY = newHeight / baseElement.height;

      if (preserveAspectRatio) {
        const scale = Math.min(scaleX, scaleY);
        scaleX = scale;
        scaleY = scale;
      }

      return {
        elements: state.elements.map((el) => {
          if (selectedElements.includes(el.id)) {
            return {
              ...el,
              width: Math.max(20, Math.round(el.width * scaleX)),
              height: Math.max(20, Math.round(el.height * scaleY)),
            };
          }
          return el;
        }),
      };
    });
  },

  deleteElement: (id) => {
    const { getHistoryUpdate, getElementDescendants } = get();
    set((state) => {
      const updatedElements = deleteElementService(
        state.elements,
        id,
        getElementDescendants
      );
      return {
        ...getHistoryUpdate(),
        elements: updatedElements,
      };
    });
  },

  updateTextContent: (id, content) => {
    set((state) => ({
      elements: state.elements.map((el) =>
        el.id === id ? { ...el, content } : el
      ),
    }));
  },

  updateName: (id, name) => {
    const { getHistoryUpdate } = get();
    set((state) => ({
      ...getHistoryUpdate(),
      elements: state.elements.map((el) =>
        el.id === id ? { ...el, name } : el
      ),
    }));
  },

  updateFillColor: (id, color) => {
    const { getHistoryUpdate } = get();
    set((state) => ({
      ...getHistoryUpdate(),
      elements: state.elements.map((el) =>
        el.id === id ? { ...el, color } : el
      ),
    }));
  },

  updateCornerRadius: (id, cornerRadius) => {
    const { getHistoryUpdate } = get();
    set((state) => ({
      ...getHistoryUpdate(),
      elements: state.elements.map((el) =>
        el.id === id && (el.type === "rectangle" || el.type === "image")
          ? {
              ...el,
              cornerRadius: Math.max(
                0,
                Math.min(cornerRadius, el.width / 2, el.height / 2)
              ),
            }
          : el
      ),
    }));
  },

  updateCornerRadiusNoHistory: (id, cornerRadius) => {
    set((state) => ({
      elements: state.elements.map((el) =>
        el.id === id && (el.type === "rectangle" || el.type === "image")
          ? {
              ...el,
              cornerRadius: Math.max(
                0,
                Math.min(cornerRadius, el.width / 2, el.height / 2)
              ),
            }
          : el
      ),
    }));
  },

  updateBorderWidth: (id, borderWidth) => {
    const { getHistoryUpdate } = get();
    set((state) => ({
      ...getHistoryUpdate(),
      elements: state.elements.map((el) => {
        if (el.id === id) {
          const updatedElement = { ...el, borderWidth };
          if (borderWidth > 0 && !el.borderColor) {
            updatedElement.borderColor = "#374151"; // Professional gray color
          }
          return updatedElement;
        }
        return el;
      }),
    }));
  },

  updateBorderColor: (id, borderColor) => {
    const { getHistoryUpdate } = get();
    set((state) => ({
      ...getHistoryUpdate(),
      elements: state.elements.map((el) =>
        el.id === id ? { ...el, borderColor } : el
      ),
    }));
  },

  updateShadowBlur: (id, shadowBlur) => {
    const { getHistoryUpdate } = get();
    set((state) => ({
      ...getHistoryUpdate(),
      elements: state.elements.map((el) => {
        if (el.id === id) {
          const updatedElement = { ...el, shadowBlur };
          if (shadowBlur > 0 && !el.shadowColor) {
            updatedElement.shadowColor = "#374151"; // Professional gray color
          }
          return updatedElement;
        }
        return el;
      }),
    }));
  },

  updateShadowColor: (id, shadowColor) => {
    const { getHistoryUpdate } = get();
    set((state) => ({
      ...getHistoryUpdate(),
      elements: state.elements.map((el) =>
        el.id === id ? { ...el, shadowColor } : el
      ),
    }));
  },

  updateFontSize: (id, fontSize) => {
    const { getHistoryUpdate } = get();
    set((state) => ({
      ...getHistoryUpdate(),
      elements: state.elements.map((el) => {
        if (el.id === id && el.type === "text") {
          const newFontSize = Math.max(1, fontSize);
          const currentFontSize = el.fontSize || 16; // Default font size if not set
          const currentLineHeight = el.lineHeight || currentFontSize * 1.2; // Default line height if not set

          // Calculate the difference and apply it to line height
          const fontSizeDifference = newFontSize - currentFontSize;
          const newLineHeight = currentLineHeight + fontSizeDifference;

          return {
            ...el,
            fontSize: newFontSize,
            lineHeight: Math.max(1, newLineHeight), // Ensure line height is at least 1
          };
        }
        return el;
      }),
    }));
  },

  updateFontWeight: (id, fontWeight) => {
    const { getHistoryUpdate } = get();
    set((state) => ({
      ...getHistoryUpdate(),
      elements: state.elements.map((el) =>
        el.id === id ? { ...el, fontWeight } : el
      ),
    }));
  },

  updateLetterSpacing: (id, letterSpacing) => {
    const { getHistoryUpdate } = get();
    set((state) => ({
      ...getHistoryUpdate(),
      elements: state.elements.map((el) =>
        el.id === id ? { ...el, letterSpacing } : el
      ),
    }));
  },

  updateLineHeight: (id, lineHeight) => {
    const { getHistoryUpdate } = get();
    set((state) => ({
      ...getHistoryUpdate(),
      elements: state.elements.map((el) =>
        el.id === id ? { ...el, lineHeight } : el
      ),
    }));
  },

  updateHorizontalAlign: (id, horizontalAlign) => {
    const { getHistoryUpdate } = get();
    set((state) => ({
      ...getHistoryUpdate(),
      elements: state.elements.map((el) =>
        el.id === id ? { ...el, horizontalAlign } : el
      ),
    }));
  },

  updateVerticalAlign: (id, verticalAlign) => {
    const { getHistoryUpdate } = get();
    set((state) => ({
      ...getHistoryUpdate(),
      elements: state.elements.map((el) =>
        el.id === id ? { ...el, verticalAlign } : el
      ),
    }));
  },

  updateRotation: (id, rotation) => {
    const { getHistoryUpdate } = get();
    set((state) => ({
      ...getHistoryUpdate(),
      elements: state.elements.map((el) =>
        el.id === id ? { ...el, rotation } : el
      ),
    }));
  },

  updateRotationNoHistory: (id, rotation) => {
    set((state) => ({
      elements: state.elements.map((el) =>
        el.id === id ? { ...el, rotation } : el
      ),
    }));
  },

  updateTextResizing: (id, resizing) => {
    set((state) => ({
      elements: state.elements.map((el) =>
        el.id === id && el.type === "text"
          ? { ...el, textResizing: resizing }
          : el
      ),
    }));
  },

  updateImageSrc: (id, src) => {
    set((state) => ({
      elements: state.elements.map((el) =>
        el.id === id && el.type === "image" ? { ...el, src } : el
      ),
    }));
  },

  updateImageElement: (id, updates) => {
    set((state) => ({
      elements: state.elements.map((el) =>
        el.id === id ? { ...el, ...updates } : el
      ),
    }));
  },

  toggleElementVisibility: (id) => {
    set((state) => ({
      elements: toggleElementVisibilityService(state.elements, id),
    }));
  },

  toggleAspectRatioLock: (id) => {
    const { getHistoryUpdate } = get();
    set((state) => ({
      ...getHistoryUpdate(),
      elements: state.elements.map((el) =>
        el.id === id ? { ...el, lockAspectRatio: !el.lockAspectRatio } : el
      ),
    }));
  },

  resetCanvas: () => {
    const result = resetCanvasService();
    set(result);
  },

  reorderElements: (oldIndex, newIndex) => {
    const { getHistoryUpdate } = get();
    set((state) => {
      const updated = [...state.elements];
      const [moved] = updated.splice(oldIndex, 1);
      updated.splice(newIndex, 0, moved);
      return {
        ...getHistoryUpdate(),
        elements: updated,
      };
    });
  },

  moveElementUp: (id) => {
    const { getHistoryUpdate, getElementDescendants } = get();
    set((state) => {
      const elements = [...state.elements];
      const element = elements.find((el) => el.id === id);

      if (!element) return state;

      const elementsToMove =
        element.type === "group" ? [id, ...getElementDescendants(id)] : [id];

      const indices = elementsToMove.map((elId) =>
        elements.findIndex((el) => el.id === elId)
      );
      const maxIndex = Math.max(...indices);

      if (maxIndex < elements.length - 1) {
        let targetIndex = maxIndex + 1;
        while (
          targetIndex < elements.length &&
          elementsToMove.includes(elements[targetIndex].id)
        ) {
          targetIndex++;
        }

        if (targetIndex < elements.length) {
          const elementsToMoveData = elementsToMove
            .map((elId) => elements.find((el) => el.id === elId))
            .filter((el) => el !== undefined);

          const filteredElements = elements.filter(
            (el) => !elementsToMove.includes(el.id)
          );

          const targetPos = filteredElements.findIndex(
            (el) => el.id === elements[targetIndex].id
          );

          filteredElements.splice(targetPos + 1, 0, ...elementsToMoveData);

          return {
            ...getHistoryUpdate(),
            elements: filteredElements,
          };
        }
      }
      return state;
    });
  },

  moveElementDown: (id) => {
    const { getHistoryUpdate, getElementDescendants } = get();
    set((state) => {
      const elements = [...state.elements];
      const element = elements.find((el) => el.id === id);

      if (!element) return state;

      const elementsToMove =
        element.type === "group" ? [id, ...getElementDescendants(id)] : [id];

      const indices = elementsToMove.map((elId) =>
        elements.findIndex((el) => el.id === elId)
      );
      const minIndex = Math.min(...indices);

      if (minIndex > 0) {
        let targetIndex = minIndex - 1;
        while (
          targetIndex >= 0 &&
          elementsToMove.includes(elements[targetIndex].id)
        ) {
          targetIndex--;
        }

        if (targetIndex >= 0) {
          const elementsToMoveData = elementsToMove
            .map((elId) => elements.find((el) => el.id === elId))
            .filter((el) => el !== undefined);

          const filteredElements = elements.filter(
            (el) => !elementsToMove.includes(el.id)
          );

          const targetPos = filteredElements.findIndex(
            (el) => el.id === elements[targetIndex].id
          );

          filteredElements.splice(targetPos, 0, ...elementsToMoveData);

          return {
            ...getHistoryUpdate(),
            elements: filteredElements,
          };
        }
      }
      return state;
    });
  },
});
