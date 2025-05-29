import { StateCreator } from "zustand";
import { CanvasElementData, ElementType } from "../../types";
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

export interface CanvasSlice {
  // State
  elements: CanvasElementData[];
  artboardDimensions: { width: number; height: number };
  artboardAspectRatio: number | null;

  // Actions
  setElements: (elements: CanvasElementData[]) => void;
  setArtboardDimensions: (dims: { width: number; height: number }) => void;
  setArtboardAspectRatio: (ratio: number | null) => void;
  addElement: (type: ElementType) => void;
  addImageElement: (src: string, x?: number, y?: number) => void;
  moveElement: (id: string, dx: number, dy: number) => void;
  moveElementNoHistory: (id: string, dx: number, dy: number) => void;
  moveSelectedElements: (dx: number, dy: number) => void;
  moveSelectedElementsNoHistory: (dx: number, dy: number) => void;
  resizeElement: (
    id: string,
    width: number,
    height: number,
    preserveAspectRatio?: boolean
  ) => void;
  resizeElementNoHistory: (
    id: string,
    width: number,
    height: number,
    preserveAspectRatio?: boolean
  ) => void;
  resizeSelectedElements: (
    baseId: string,
    newWidth: number,
    newHeight: number,
    preserveAspectRatio?: boolean
  ) => void;
  resizeSelectedElementsNoHistory: (
    baseId: string,
    newWidth: number,
    newHeight: number,
    preserveAspectRatio?: boolean
  ) => void;
  deleteElement: (id: string) => void;
  updateTextContent: (id: string, content: string) => void;
  updateName: (id: string, name: string) => void;
  updateFillColor: (id: string, color: string) => void;
  updateCornerRadius: (id: string, cornerRadius: number) => void;
  updateCornerRadiusNoHistory: (id: string, cornerRadius: number) => void;
  updateBorderWidth: (id: string, width: number) => void;
  updateBorderColor: (id: string, color: string) => void;
  updateShadowBlur: (id: string, blur: number) => void;
  updateShadowColor: (id: string, color: string) => void;
  updateFontSize: (id: string, fontSize: number) => void;
  updateFontWeight: (id: string, fontWeight: number) => void;
  updateLetterSpacing: (id: string, letterSpacing: number) => void;
  updateLineHeight: (id: string, lineHeight: number) => void;
  updateHorizontalAlign: (
    id: string,
    align: "left" | "center" | "right"
  ) => void;
  updateVerticalAlign: (id: string, align: "top" | "middle" | "bottom") => void;
  updateRotation: (id: string, rotation: number) => void;
  updateRotationNoHistory: (id: string, rotation: number) => void;
  updateTextResizing: (
    id: string,
    resizing: "auto-width" | "auto-height" | "fixed"
  ) => void;
  updateImageSrc: (id: string, src: string) => void;
  toggleElementVisibility: (id: string) => void;
  toggleAspectRatioLock: (id: string) => void;
  resetCanvas: () => void;
}

export const createCanvasSlice: StateCreator<
  CanvasSlice,
  [],
  [],
  CanvasSlice
> = (set, get) => ({
  // Initial state
  elements: [],
  artboardDimensions: { width: 1024, height: 576 },
  artboardAspectRatio: 16 / 9,

  // Actions
  setElements: (elements) => set({ elements }),

  setArtboardDimensions: (dims) => set({ artboardDimensions: dims }),

  setArtboardAspectRatio: (ratio) => set({ artboardAspectRatio: ratio }),

  addElement: (type) => {
    const { artboardDimensions } = get();
    const options: CreateElementOptions = {
      artboardWidth: artboardDimensions.width,
      artboardHeight: artboardDimensions.height,
    };
    const newElement = createElement(type, options);

    set((state) => ({
      elements: [...state.elements, newElement],
    }));
  },

  addImageElement: async (src, x, y) => {
    const { artboardDimensions } = get();
    const options: CreateImageElementOptions = {
      src,
      artboardWidth: artboardDimensions.width,
      artboardHeight: artboardDimensions.height,
      position: x !== undefined && y !== undefined ? { x, y } : undefined,
    };

    try {
      const newElement = await createImageElement(options);
      set((state) => ({
        elements: [...state.elements, newElement],
      }));
    } catch (error) {
      console.error("Failed to add image element:", error);
    }
  },

  moveElement: (id, dx, dy) => {
    const { elements } = get();
    const getElementDescendants = (elementId: string) => {
      // This should be imported from grouping service
      return [];
    };
    const updatedElements = moveElementService(
      elements,
      id,
      dx,
      dy,
      getElementDescendants
    );
    set({ elements: updatedElements });
  },

  moveElementNoHistory: (id, dx, dy) => {
    const { elements } = get();
    const getElementDescendants = (elementId: string) => {
      return [];
    };
    const updatedElements = moveElementService(
      elements,
      id,
      dx,
      dy,
      getElementDescendants
    );
    set({ elements: updatedElements });
  },

  moveSelectedElements: (dx, dy) => {
    // This will need access to selection state
    // For now, implement basic version
    set((state) => ({
      elements: state.elements.map((el) =>
        el.selected ? { ...el, x: el.x + dx, y: el.y + dy } : el
      ),
    }));
  },

  moveSelectedElementsNoHistory: (dx, dy) => {
    set((state) => ({
      elements: state.elements.map((el) =>
        el.selected ? { ...el, x: el.x + dx, y: el.y + dy } : el
      ),
    }));
  },

  resizeElement: (id, width, height, preserveAspectRatio = false) => {
    const { elements } = get();
    const getElementDescendants = (elementId: string) => [];
    const updatedElements = resizeElementService(
      elements,
      id,
      width,
      height,
      preserveAspectRatio,
      getElementDescendants
    );
    set({ elements: updatedElements });
  },

  resizeElementNoHistory: (id, width, height, preserveAspectRatio = false) => {
    const { elements } = get();
    const getElementDescendants = (elementId: string) => [];
    const updatedElements = resizeElementService(
      elements,
      id,
      width,
      height,
      preserveAspectRatio,
      getElementDescendants
    );
    set({ elements: updatedElements });
  },

  resizeSelectedElements: (
    baseId,
    newWidth,
    newHeight,
    preserveAspectRatio = false
  ) => {
    // Implementation for multi-element resize
    set((state) => ({
      elements: state.elements.map((el) => {
        if (el.id === baseId) {
          return { ...el, width: newWidth, height: newHeight };
        }
        return el;
      }),
    }));
  },

  resizeSelectedElementsNoHistory: (
    baseId,
    newWidth,
    newHeight,
    preserveAspectRatio = false
  ) => {
    set((state) => ({
      elements: state.elements.map((el) => {
        if (el.id === baseId) {
          return { ...el, width: newWidth, height: newHeight };
        }
        return el;
      }),
    }));
  },

  deleteElement: (id) => {
    const { elements } = get();
    const getElementDescendants = (elementId: string) => [];
    const updatedElements = deleteElementService(
      elements,
      id,
      getElementDescendants
    );
    set({ elements: updatedElements });
  },

  updateTextContent: (id, content) => {
    const { elements } = get();
    const updatedElements = updateElementProperty(
      elements,
      id,
      "content",
      content
    );
    set({ elements: updatedElements });
  },

  updateName: (id, name) => {
    const { elements } = get();
    const updatedElements = updateElementProperty(elements, id, "name", name);
    set({ elements: updatedElements });
  },

  updateFillColor: (id, color) => {
    const { elements } = get();
    const updatedElements = updateElementProperty(elements, id, "color", color);
    set({ elements: updatedElements });
  },

  updateCornerRadius: (id, cornerRadius) => {
    const { elements } = get();
    const updatedElements = updateElementProperty(
      elements,
      id,
      "cornerRadius",
      cornerRadius
    );
    set({ elements: updatedElements });
  },

  updateCornerRadiusNoHistory: (id, cornerRadius) => {
    const { elements } = get();
    const updatedElements = updateElementProperty(
      elements,
      id,
      "cornerRadius",
      cornerRadius
    );
    set({ elements: updatedElements });
  },

  updateBorderWidth: (id, width) => {
    const { elements } = get();
    const updatedElements = updateElementProperty(
      elements,
      id,
      "borderWidth",
      width
    );
    set({ elements: updatedElements });
  },

  updateBorderColor: (id, color) => {
    const { elements } = get();
    const updatedElements = updateElementProperty(
      elements,
      id,
      "borderColor",
      color
    );
    set({ elements: updatedElements });
  },

  updateShadowBlur: (id, blur) => {
    const { elements } = get();
    const updatedElements = updateElementProperty(
      elements,
      id,
      "shadowBlur",
      blur
    );
    set({ elements: updatedElements });
  },

  updateShadowColor: (id, color) => {
    const { elements } = get();
    const updatedElements = updateElementProperty(
      elements,
      id,
      "shadowColor",
      color
    );
    set({ elements: updatedElements });
  },

  updateFontSize: (id, fontSize) => {
    const { elements } = get();
    const updatedElements = updateElementProperty(
      elements,
      id,
      "fontSize",
      fontSize
    );
    set({ elements: updatedElements });
  },

  updateFontWeight: (id, fontWeight) => {
    const { elements } = get();
    const updatedElements = updateElementProperty(
      elements,
      id,
      "fontWeight",
      fontWeight
    );
    set({ elements: updatedElements });
  },

  updateLetterSpacing: (id, letterSpacing) => {
    const { elements } = get();
    const updatedElements = updateElementProperty(
      elements,
      id,
      "letterSpacing",
      letterSpacing
    );
    set({ elements: updatedElements });
  },

  updateLineHeight: (id, lineHeight) => {
    const { elements } = get();
    const updatedElements = updateElementProperty(
      elements,
      id,
      "lineHeight",
      lineHeight
    );
    set({ elements: updatedElements });
  },

  updateHorizontalAlign: (id, align) => {
    const { elements } = get();
    const updatedElements = updateElementProperty(
      elements,
      id,
      "horizontalAlign",
      align
    );
    set({ elements: updatedElements });
  },

  updateVerticalAlign: (id, align) => {
    const { elements } = get();
    const updatedElements = updateElementProperty(
      elements,
      id,
      "verticalAlign",
      align
    );
    set({ elements: updatedElements });
  },

  updateRotation: (id, rotation) => {
    const { elements } = get();
    const updatedElements = updateElementProperty(
      elements,
      id,
      "rotation",
      rotation
    );
    set({ elements: updatedElements });
  },

  updateRotationNoHistory: (id, rotation) => {
    const { elements } = get();
    const updatedElements = updateElementProperty(
      elements,
      id,
      "rotation",
      rotation
    );
    set({ elements: updatedElements });
  },

  updateTextResizing: (id, resizing) => {
    const { elements } = get();
    const updatedElements = updateElementProperty(
      elements,
      id,
      "textResizing",
      resizing
    );
    set({ elements: updatedElements });
  },

  updateImageSrc: (id, src) => {
    const { elements } = get();
    const updatedElements = updateElementProperty(elements, id, "src", src);
    set({ elements: updatedElements });
  },

  toggleElementVisibility: (id) => {
    const { elements } = get();
    const updatedElements = toggleElementVisibilityService(elements, id);
    set({ elements: updatedElements });
  },

  toggleAspectRatioLock: (id) => {
    const { elements } = get();
    const element = elements.find((el) => el.id === id);
    if (element) {
      const updatedElements = updateElementProperty(
        elements,
        id,
        "lockAspectRatio",
        !element.lockAspectRatio
      );
      set({ elements: updatedElements });
    }
  },

  resetCanvas: () => {
    const result = resetCanvasService();
    set({
      elements: result.elements,
      artboardDimensions: { width: 1024, height: 576 },
      artboardAspectRatio: 16 / 9,
    });
  },
});
