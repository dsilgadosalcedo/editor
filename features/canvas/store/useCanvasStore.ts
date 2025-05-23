import { create } from "zustand";

export type ElementType = "rectangle" | "text" | "image";
export type ToolType = ElementType | "hand" | null;

export interface CanvasElementData {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  content?: string;
  src?: string; // For image elements
  color: string;
  borderWidth?: number;
  borderColor?: string;
  shadowBlur?: number;
  shadowColor?: string;
  selected: boolean;
  cornerRadius?: number;
  name?: string;
  fontSize?: number;
  fontWeight?: number;
  letterSpacing?: number;
  lineHeight?: number;
  horizontalAlign?: "left" | "center" | "right";
  verticalAlign?: "top" | "middle" | "bottom";
}

interface CanvasStoreState {
  elements: CanvasElementData[];
  selectedElement: string | null;
  artboardDimensions: { width: number; height: number };
  past: CanvasElementData[][];
  future: CanvasElementData[][];
  clipboard: CanvasElementData | null;
  // Helper
  addToHistory: () => {
    past: CanvasElementData[][];
    future: CanvasElementData[][];
  };
  // Actions
  setArtboardDimensions: (dims: { width: number; height: number }) => void;
  addElement: (type: ElementType) => void;
  selectElement: (id: string) => void;
  moveElement: (id: string, dx: number, dy: number) => void;
  resizeElement: (id: string, width: number, height: number) => void;
  updateTextContent: (id: string, content: string) => void;
  resetCanvas: () => void;
  undo: () => void;
  redo: () => void;
  reorderElements: (oldIndex: number, newIndex: number) => void;
  moveElementUp: (id: string) => void;
  moveElementDown: (id: string) => void;
  updateCornerRadius: (id: string, cornerRadius: number) => void;
  updateFillColor: (id: string, color: string) => void;
  updateBorderWidth: (id: string, width: number) => void;
  updateBorderColor: (id: string, color: string) => void;
  updateShadowBlur: (id: string, blur: number) => void;
  updateShadowColor: (id: string, color: string) => void;
  deleteElement: (id: string) => void;
  updateName: (id: string, name: string) => void;
  updateFontSize: (id: string, fontSize: number) => void;
  updateFontWeight: (id: string, fontWeight: number) => void;
  updateLetterSpacing: (id: string, letterSpacing: number) => void;
  updateLineHeight: (id: string, lineHeight: number) => void;
  updateHorizontalAlign: (
    id: string,
    align: "left" | "center" | "right"
  ) => void;
  updateVerticalAlign: (id: string, align: "top" | "middle" | "bottom") => void;
  clearSelection: () => void;
  getSelectedElementData: () => CanvasElementData | undefined;
  copySelection: () => void;
  pasteClipboard: () => void;
  updateImageSrc: (id: string, src: string) => void;
  // API functions
  saveCanvas: (title?: string) => Promise<string | null>;
  loadCanvas: (id: string) => Promise<boolean>;
  listCanvases: () => Promise<any[]>;
}

export const useCanvasStore = create<CanvasStoreState>((set, get) => ({
  elements: [],
  selectedElement: null,
  artboardDimensions: { width: 800, height: 600 },
  past: [],
  future: [],
  clipboard: null,

  // Helper function to add current state to history
  addToHistory: () => {
    const state = get();
    return {
      past: [...state.past, state.elements],
      future: [], // Clear future when making new changes
    };
  },

  setArtboardDimensions: (dims) => set({ artboardDimensions: dims }),
  addElement: (type) => {
    const { artboardDimensions, elements, addToHistory } = get();
    let newElement: CanvasElementData;

    if (type === "rectangle") {
      newElement = {
        id: `${type}-${Date.now()}`,
        type,
        x: artboardDimensions.width / 2 - 75,
        y: artboardDimensions.height / 2 - 37.5,
        width: 150,
        height: 75,
        color: "#3b82f6",
        selected: true,
      };
    } else if (type === "text") {
      newElement = {
        id: `${type}-${Date.now()}`,
        type,
        x: artboardDimensions.width / 2 - 50,
        y: artboardDimensions.height / 2 - 10,
        width: 100,
        height: 20,
        content: "Text",
        color: "#000000",
        selected: true,
        fontSize: 16,
        fontWeight: 400,
        letterSpacing: 0,
        lineHeight: 20,
        horizontalAlign: "left",
        verticalAlign: "top",
      };
    } else if (type === "image") {
      newElement = {
        id: `${type}-${Date.now()}`,
        type,
        x: artboardDimensions.width / 2 - 75,
        y: artboardDimensions.height / 2 - 56,
        width: 150,
        height: 112,
        src: "https://picsum.photos/150/112?random=" + Date.now(),
        color: "transparent",
        selected: true,
      };
    } else {
      return; // Invalid type
    }

    set((state) => ({
      ...addToHistory(),
      elements: [
        ...state.elements.map((el) => ({ ...el, selected: false })),
        newElement,
      ],
      selectedElement: newElement.id,
    }));
  },
  selectElement: (id) =>
    set((state) => ({
      elements: state.elements.map((el) => ({ ...el, selected: el.id === id })),
      selectedElement: id,
    })),
  moveElement: (id, dx, dy) =>
    set((state) => ({
      elements: state.elements.map((el) =>
        el.id === id ? { ...el, x: el.x + dx, y: el.y + dy } : el
      ),
    })),
  resizeElement: (id, width, height) =>
    set((state) => ({
      elements: state.elements.map((el) =>
        el.id === id ? { ...el, width, height } : el
      ),
    })),
  updateTextContent: (id, content) =>
    set((state) => ({
      elements: state.elements.map((el) =>
        el.id === id ? { ...el, content } : el
      ),
    })),
  resetCanvas: () =>
    set(() => ({
      elements: [],
      selectedElement: null,
    })),
  undo: () =>
    set((state) => {
      if (state.past.length === 0) return state;
      const previous = state.past[state.past.length - 1];
      return {
        past: state.past.slice(0, state.past.length - 1),
        future: [state.elements, ...state.future],
        elements: previous,
        selectedElement: null,
      };
    }),
  redo: () =>
    set((state) => {
      if (state.future.length === 0) return state;
      const next = state.future[0];
      return {
        past: [...state.past, state.elements],
        future: state.future.slice(1),
        elements: next,
        selectedElement: null,
      };
    }),
  reorderElements: (oldIndex, newIndex) =>
    set((state) => {
      const { addToHistory } = get();
      const updated = [...state.elements];
      const [moved] = updated.splice(oldIndex, 1);
      updated.splice(newIndex, 0, moved);
      return {
        ...addToHistory(),
        elements: updated,
      };
    }),
  moveElementUp: (id) =>
    set((state) => {
      const { addToHistory } = get();
      const elements = [...state.elements];
      const index = elements.findIndex((el) => el.id === id);
      // Move up means bring forward (higher z-index) = move to higher index in array
      // Elements later in the array are rendered on top of earlier elements
      if (index < elements.length - 1) {
        const [moved] = elements.splice(index, 1);
        elements.splice(index + 1, 0, moved);
        return {
          ...addToHistory(),
          elements,
        };
      }
      return state;
    }),
  moveElementDown: (id) =>
    set((state) => {
      const { addToHistory } = get();
      const elements = [...state.elements];
      const index = elements.findIndex((el) => el.id === id);
      // Move down means send backward (lower z-index) = move to lower index in array
      // Elements earlier in the array are rendered behind later elements
      if (index > 0) {
        const [moved] = elements.splice(index, 1);
        elements.splice(index - 1, 0, moved);
        return {
          ...addToHistory(),
          elements,
        };
      }
      return state;
    }),
  updateCornerRadius: (id, cornerRadius) =>
    set((state) => {
      const { addToHistory } = get();
      return {
        ...addToHistory(),
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
      };
    }),
  updateFillColor: (id, color) =>
    set((state) => {
      const { addToHistory } = get();
      return {
        ...addToHistory(),
        elements: state.elements.map((el) =>
          el.id === id ? { ...el, color } : el
        ),
      };
    }),
  updateBorderWidth: (id, borderWidth) =>
    set((state) => {
      const { addToHistory } = get();
      return {
        ...addToHistory(),
        elements: state.elements.map((el) =>
          el.id === id ? { ...el, borderWidth } : el
        ),
      };
    }),
  updateBorderColor: (id, borderColor) =>
    set((state) => {
      const { addToHistory } = get();
      return {
        ...addToHistory(),
        elements: state.elements.map((el) =>
          el.id === id ? { ...el, borderColor } : el
        ),
      };
    }),
  updateShadowBlur: (id, shadowBlur) =>
    set((state) => {
      const { addToHistory } = get();
      return {
        ...addToHistory(),
        elements: state.elements.map((el) =>
          el.id === id ? { ...el, shadowBlur } : el
        ),
      };
    }),
  updateShadowColor: (id, shadowColor) =>
    set((state) => {
      const { addToHistory } = get();
      return {
        ...addToHistory(),
        elements: state.elements.map((el) =>
          el.id === id ? { ...el, shadowColor } : el
        ),
      };
    }),
  deleteElement: (id) =>
    set((state) => {
      const { addToHistory } = get();
      return {
        ...addToHistory(),
        elements: state.elements.filter((el) => el.id !== id),
        selectedElement: null,
      };
    }),
  updateName: (id, name) =>
    set((state) => {
      const { addToHistory } = get();
      return {
        ...addToHistory(),
        elements: state.elements.map((el) =>
          el.id === id ? { ...el, name } : el
        ),
      };
    }),
  updateFontSize: (id, fontSize) =>
    set((state) => {
      const { addToHistory } = get();
      return {
        ...addToHistory(),
        elements: state.elements.map((el) =>
          el.id === id ? { ...el, fontSize } : el
        ),
      };
    }),
  updateFontWeight: (id, fontWeight) =>
    set((state) => {
      const { addToHistory } = get();
      return {
        ...addToHistory(),
        elements: state.elements.map((el) =>
          el.id === id ? { ...el, fontWeight } : el
        ),
      };
    }),
  updateLetterSpacing: (id, letterSpacing) =>
    set((state) => {
      const { addToHistory } = get();
      return {
        ...addToHistory(),
        elements: state.elements.map((el) =>
          el.id === id ? { ...el, letterSpacing } : el
        ),
      };
    }),
  updateLineHeight: (id, lineHeight) =>
    set((state) => {
      const { addToHistory } = get();
      return {
        ...addToHistory(),
        elements: state.elements.map((el) =>
          el.id === id ? { ...el, lineHeight } : el
        ),
      };
    }),
  updateHorizontalAlign: (id, horizontalAlign) =>
    set((state) => {
      const { addToHistory } = get();
      return {
        ...addToHistory(),
        elements: state.elements.map((el) =>
          el.id === id ? { ...el, horizontalAlign } : el
        ),
      };
    }),
  updateVerticalAlign: (id, verticalAlign) =>
    set((state) => {
      const { addToHistory } = get();
      return {
        ...addToHistory(),
        elements: state.elements.map((el) =>
          el.id === id ? { ...el, verticalAlign } : el
        ),
      };
    }),
  clearSelection: () =>
    set((state) => ({
      elements: state.elements.map((el) => ({ ...el, selected: false })),
      selectedElement: null,
    })),
  getSelectedElementData: () => {
    const { elements, selectedElement } = get();
    return elements.find((el) => el.id === selectedElement);
  },
  copySelection: () =>
    set((state) => {
      const selected = state.elements.find(
        (el) => el.id === state.selectedElement
      );
      return { clipboard: selected ? { ...selected } : null };
    }),
  pasteClipboard: () =>
    set((state) => {
      if (!state.clipboard) return {};
      const newId = `${state.clipboard.type}-${Date.now()}`;
      const newElement = {
        ...state.clipboard,
        id: newId,
        x: state.clipboard.x + 20,
        y: state.clipboard.y + 20,
        selected: true,
      };
      return {
        elements: [
          ...state.elements.map((el) => ({ ...el, selected: false })),
          newElement,
        ],
        selectedElement: newId,
      };
    }),
  updateImageSrc: (id, src) =>
    set((state) => ({
      elements: state.elements.map((el) =>
        el.id === id && el.type === "image" ? { ...el, src } : el
      ),
    })),
  // API functions
  saveCanvas: async (title?: string) => {
    const { elements, artboardDimensions } = get();
    try {
      const response = await fetch("/api/canvas/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          canvasData: {
            elements,
            artboardDimensions,
          },
          title,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save canvas");
      }

      const result = await response.json();
      return result.canvasId;
    } catch (error) {
      console.error("Error saving canvas:", error);
      return null;
    }
  },
  loadCanvas: async (id: string) => {
    try {
      const response = await fetch(`/api/canvas/load/${id}`);

      if (!response.ok) {
        throw new Error("Failed to load canvas");
      }

      const result = await response.json();
      const { elements, artboardDimensions } = result.canvas.data;

      set({
        elements,
        artboardDimensions,
        selectedElement: null,
        past: [],
        future: [],
      });

      return true;
    } catch (error) {
      console.error("Error loading canvas:", error);
      return false;
    }
  },
  listCanvases: async () => {
    try {
      const response = await fetch("/api/canvas/list");

      if (!response.ok) {
        throw new Error("Failed to list canvases");
      }

      const result = await response.json();
      return result.canvases;
    } catch (error) {
      console.error("Error listing canvases:", error);
      return [];
    }
  },
}));
