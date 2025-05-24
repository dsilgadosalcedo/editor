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
  visible?: boolean;
  lockAspectRatio?: boolean;
}

interface CanvasStoreState {
  elements: CanvasElementData[];
  selectedElements: string[];
  artboardDimensions: { width: number; height: number };
  projectName: string;
  past: CanvasElementData[][];
  future: CanvasElementData[][];
  clipboard: CanvasElementData | null;
  rightSidebarDocked: boolean;
  // Helper
  addToHistory: () => void;
  getHistoryUpdate: () => {
    past: CanvasElementData[][];
    future: CanvasElementData[][];
  };
  // Actions
  setArtboardDimensions: (dims: { width: number; height: number }) => void;
  setProjectName: (name: string) => void;
  addElement: (type: ElementType) => void;
  selectElement: (id: string, addToSelection?: boolean) => void;
  selectMultipleElements: (ids: string[]) => void;
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
  updateTextContent: (id: string, content: string) => void;
  resetCanvas: () => void;
  undo: () => void;
  redo: () => void;
  reorderElements: (oldIndex: number, newIndex: number) => void;
  moveElementUp: (id: string) => void;
  moveElementDown: (id: string) => void;
  updateCornerRadius: (id: string, cornerRadius: number) => void;
  updateCornerRadiusNoHistory: (id: string, cornerRadius: number) => void;
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
  toggleAspectRatioLock: (id: string) => void;
  clearSelection: () => void;
  getSelectedElementData: () => CanvasElementData | undefined;
  getSelectedElementsData: () => CanvasElementData[];
  hasMultipleSelection: () => boolean;
  copySelection: () => void;
  pasteClipboard: () => void;
  updateImageSrc: (id: string, src: string) => void;
  toggleElementVisibility: (id: string) => void;
  // File operations
  exportCanvas: (filename?: string) => void;
  importCanvas: (
    file: File
  ) => Promise<{ success: boolean; importedCount?: number }>;
  // API functions
  saveCanvas: (title?: string) => Promise<string | null>;
  loadCanvas: (id: string) => Promise<boolean>;
  listCanvases: () => Promise<any[]>;
  // Sidebar state
  toggleRightSidebarDock: () => void;
}

export const useCanvasStore = create<CanvasStoreState>((set, get) => ({
  elements: [],
  selectedElements: [],
  artboardDimensions: { width: 800, height: 600 },
  projectName: "Untitled Project",
  past: [],
  future: [],
  clipboard: null,
  rightSidebarDocked: true,

  // Helper function to get history update object
  getHistoryUpdate: () => {
    const state = get();
    return {
      past: [...state.past, state.elements],
      future: [], // Clear future when making new changes
    };
  },

  // Action to add current state to history
  addToHistory: () => {
    set((state) => ({
      past: [...state.past, state.elements],
      future: [], // Clear future when making new changes
    }));
  },

  setArtboardDimensions: (dims) => set({ artboardDimensions: dims }),
  setProjectName: (name) => set({ projectName: name }),
  addElement: (type) => {
    const { artboardDimensions, elements, getHistoryUpdate } = get();
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
        visible: true,
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
        visible: true,
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
        visible: true,
      };
    } else {
      return; // Invalid type
    }

    set((state) => ({
      ...getHistoryUpdate(),
      elements: [
        ...state.elements.map((el) => ({ ...el, selected: false })),
        newElement,
      ],
      selectedElements: [newElement.id],
    }));
  },
  selectElement: (id, addToSelection = false) =>
    set((state) => {
      if (addToSelection) {
        // Add to or remove from selection
        const isAlreadySelected = state.selectedElements.includes(id);
        const newSelectedElements = isAlreadySelected
          ? state.selectedElements.filter((elId) => elId !== id)
          : [...state.selectedElements, id];

        return {
          elements: state.elements.map((el) => ({
            ...el,
            selected: newSelectedElements.includes(el.id),
          })),
          selectedElements: newSelectedElements,
        };
      } else {
        // Single selection
        return {
          elements: state.elements.map((el) => ({
            ...el,
            selected: el.id === id,
          })),
          selectedElements: [id],
        };
      }
    }),
  selectMultipleElements: (ids) =>
    set((state) => ({
      elements: state.elements.map((el) => ({
        ...el,
        selected: ids.includes(el.id),
      })),
      selectedElements: ids,
    })),
  moveElement: (id, dx, dy) =>
    set((state) => {
      const { getHistoryUpdate } = get();
      return {
        ...getHistoryUpdate(),
        elements: state.elements.map((el) =>
          el.id === id ? { ...el, x: el.x + dx, y: el.y + dy } : el
        ),
      };
    }),
  moveElementNoHistory: (id, dx, dy) =>
    set((state) => ({
      elements: state.elements.map((el) =>
        el.id === id ? { ...el, x: el.x + dx, y: el.y + dy } : el
      ),
    })),
  moveSelectedElements: (dx, dy) =>
    set((state) => {
      const { getHistoryUpdate } = get();
      return {
        ...getHistoryUpdate(),
        elements: state.elements.map((el) =>
          state.selectedElements.includes(el.id)
            ? { ...el, x: el.x + dx, y: el.y + dy }
            : el
        ),
      };
    }),
  moveSelectedElementsNoHistory: (dx, dy) =>
    set((state) => ({
      elements: state.elements.map((el) =>
        state.selectedElements.includes(el.id)
          ? { ...el, x: el.x + dx, y: el.y + dy }
          : el
      ),
    })),
  resizeElement: (id, width, height, preserveAspectRatio = false) =>
    set((state) => {
      const { getHistoryUpdate } = get();
      return {
        ...getHistoryUpdate(),
        elements: state.elements.map((el) =>
          el.id === id
            ? {
                ...el,
                width: Math.max(20, width),
                height: Math.max(20, height),
              }
            : el
        ),
      };
    }),
  resizeElementNoHistory: (id, width, height, preserveAspectRatio = false) =>
    set((state) => ({
      elements: state.elements.map((el) =>
        el.id === id
          ? { ...el, width: Math.max(20, width), height: Math.max(20, height) }
          : el
      ),
    })),
  resizeSelectedElements: (
    baseId,
    newWidth,
    newHeight,
    preserveAspectRatio = false
  ) =>
    set((state) => {
      const { getHistoryUpdate } = get();
      const baseElement = state.elements.find((el) => el.id === baseId);
      if (!baseElement || !state.selectedElements.includes(baseId)) {
        return state;
      }

      let scaleX = newWidth / baseElement.width;
      let scaleY = newHeight / baseElement.height;

      // If preserving aspect ratio, use the smaller scale to maintain proportions
      if (preserveAspectRatio) {
        const scale = Math.min(scaleX, scaleY);
        scaleX = scale;
        scaleY = scale;
      }

      return {
        ...getHistoryUpdate(),
        elements: state.elements.map((el) => {
          if (state.selectedElements.includes(el.id)) {
            // For text elements, also scale font size
            if (el.type === "text") {
              const currentFontSize = el.fontSize || 16;
              const currentLineHeight = el.lineHeight || 20;

              // Use the average scale for font sizing to match the orange button behavior
              const fontScale = (scaleX + scaleY) / 2;
              const newFontSize = Math.max(
                8,
                Math.round(currentFontSize * fontScale)
              );
              const newLineHeight = Math.max(
                10,
                Math.round(currentLineHeight * fontScale)
              );

              return {
                ...el,
                width: Math.max(20, Math.round(el.width * scaleX)),
                height: Math.max(20, Math.round(el.height * scaleY)),
                fontSize: newFontSize,
                lineHeight: newLineHeight,
              };
            } else {
              // For non-text elements in multi-selection, only respect shift key (preserveAspectRatio)
              // Individual lockAspectRatio settings are ignored during multi-selection
              let finalScaleX = scaleX;
              let finalScaleY = scaleY;

              if (preserveAspectRatio) {
                // When shift is pressed, use the smaller scale to maintain proportions
                const scale = Math.min(scaleX, scaleY);
                finalScaleX = scale;
                finalScaleY = scale;
              }

              return {
                ...el,
                width: Math.max(20, Math.round(el.width * finalScaleX)),
                height: Math.max(20, Math.round(el.height * finalScaleY)),
              };
            }
          }
          return el;
        }),
      };
    }),
  resizeSelectedElementsNoHistory: (
    baseId,
    newWidth,
    newHeight,
    preserveAspectRatio = false
  ) =>
    set((state) => {
      const baseElement = state.elements.find((el) => el.id === baseId);
      if (!baseElement || !state.selectedElements.includes(baseId)) {
        return state;
      }

      let scaleX = newWidth / baseElement.width;
      let scaleY = newHeight / baseElement.height;

      // If preserving aspect ratio, use the smaller scale to maintain proportions
      if (preserveAspectRatio) {
        const scale = Math.min(scaleX, scaleY);
        scaleX = scale;
        scaleY = scale;
      }

      return {
        elements: state.elements.map((el) => {
          if (state.selectedElements.includes(el.id)) {
            // For text elements, also scale font size
            if (el.type === "text") {
              const currentFontSize = el.fontSize || 16;
              const currentLineHeight = el.lineHeight || 20;

              // Use the average scale for font sizing to match the orange button behavior
              const fontScale = (scaleX + scaleY) / 2;
              const newFontSize = Math.max(
                8,
                Math.round(currentFontSize * fontScale)
              );
              const newLineHeight = Math.max(
                10,
                Math.round(currentLineHeight * fontScale)
              );

              return {
                ...el,
                width: Math.max(20, Math.round(el.width * scaleX)),
                height: Math.max(20, Math.round(el.height * scaleY)),
                fontSize: newFontSize,
                lineHeight: newLineHeight,
              };
            } else {
              // For non-text elements in multi-selection, only respect shift key (preserveAspectRatio)
              // Individual lockAspectRatio settings are ignored during multi-selection
              let finalScaleX = scaleX;
              let finalScaleY = scaleY;

              if (preserveAspectRatio) {
                // When shift is pressed, use the smaller scale to maintain proportions
                const scale = Math.min(scaleX, scaleY);
                finalScaleX = scale;
                finalScaleY = scale;
              }

              return {
                ...el,
                width: Math.max(20, Math.round(el.width * finalScaleX)),
                height: Math.max(20, Math.round(el.height * finalScaleY)),
              };
            }
          }
          return el;
        }),
      };
    }),
  updateTextContent: (id, content) =>
    set((state) => ({
      elements: state.elements.map((el) =>
        el.id === id ? { ...el, content } : el
      ),
    })),
  resetCanvas: () =>
    set(() => ({
      elements: [],
      selectedElements: [],
    })),
  undo: () =>
    set((state) => {
      if (state.past.length === 0) return state;
      const previous = state.past[state.past.length - 1];

      // Preserve selection by finding elements that were selected in the current state
      const currentlySelectedIds = state.selectedElements;
      const elementsToKeepSelected = previous
        .filter((el) => currentlySelectedIds.includes(el.id))
        .map((el) => el.id);

      return {
        past: state.past.slice(0, state.past.length - 1),
        future: [state.elements, ...state.future],
        elements: previous.map((el) => ({
          ...el,
          selected: elementsToKeepSelected.includes(el.id),
        })),
        selectedElements: elementsToKeepSelected,
      };
    }),
  redo: () =>
    set((state) => {
      if (state.future.length === 0) return state;
      const next = state.future[0];

      // Preserve selection by finding elements that were selected in the current state
      const currentlySelectedIds = state.selectedElements;
      const elementsToKeepSelected = next
        .filter((el) => currentlySelectedIds.includes(el.id))
        .map((el) => el.id);

      return {
        past: [...state.past, state.elements],
        future: state.future.slice(1),
        elements: next.map((el) => ({
          ...el,
          selected: elementsToKeepSelected.includes(el.id),
        })),
        selectedElements: elementsToKeepSelected,
      };
    }),
  reorderElements: (oldIndex, newIndex) =>
    set((state) => {
      const { getHistoryUpdate } = get();
      const updated = [...state.elements];
      const [moved] = updated.splice(oldIndex, 1);
      updated.splice(newIndex, 0, moved);
      return {
        ...getHistoryUpdate(),
        elements: updated,
      };
    }),
  moveElementUp: (id) =>
    set((state) => {
      const { getHistoryUpdate } = get();
      const elements = [...state.elements];
      const index = elements.findIndex((el) => el.id === id);
      // Move up means bring forward (higher z-index) = move to higher index in array
      // Elements later in the array are rendered on top of earlier elements
      if (index < elements.length - 1) {
        const [moved] = elements.splice(index, 1);
        elements.splice(index + 1, 0, moved);
        return {
          ...getHistoryUpdate(),
          elements,
        };
      }
      return state;
    }),
  moveElementDown: (id) =>
    set((state) => {
      const { getHistoryUpdate } = get();
      const elements = [...state.elements];
      const index = elements.findIndex((el) => el.id === id);
      // Move down means send backward (lower z-index) = move to lower index in array
      // Elements earlier in the array are rendered behind later elements
      if (index > 0) {
        const [moved] = elements.splice(index, 1);
        elements.splice(index - 1, 0, moved);
        return {
          ...getHistoryUpdate(),
          elements,
        };
      }
      return state;
    }),
  updateCornerRadius: (id, cornerRadius) =>
    set((state) => {
      const { getHistoryUpdate } = get();
      return {
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
      };
    }),
  updateCornerRadiusNoHistory: (id, cornerRadius) =>
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
    })),
  updateFillColor: (id, color) =>
    set((state) => {
      const { getHistoryUpdate } = get();
      return {
        ...getHistoryUpdate(),
        elements: state.elements.map((el) =>
          el.id === id ? { ...el, color } : el
        ),
      };
    }),
  updateBorderWidth: (id, borderWidth) =>
    set((state) => {
      const { getHistoryUpdate } = get();
      return {
        ...getHistoryUpdate(),
        elements: state.elements.map((el) =>
          el.id === id ? { ...el, borderWidth } : el
        ),
      };
    }),
  updateBorderColor: (id, borderColor) =>
    set((state) => {
      const { getHistoryUpdate } = get();
      return {
        ...getHistoryUpdate(),
        elements: state.elements.map((el) =>
          el.id === id ? { ...el, borderColor } : el
        ),
      };
    }),
  updateShadowBlur: (id, shadowBlur) =>
    set((state) => {
      const { getHistoryUpdate } = get();
      return {
        ...getHistoryUpdate(),
        elements: state.elements.map((el) =>
          el.id === id ? { ...el, shadowBlur } : el
        ),
      };
    }),
  updateShadowColor: (id, shadowColor) =>
    set((state) => {
      const { getHistoryUpdate } = get();
      return {
        ...getHistoryUpdate(),
        elements: state.elements.map((el) =>
          el.id === id ? { ...el, shadowColor } : el
        ),
      };
    }),
  deleteElement: (id) =>
    set((state) => {
      const { getHistoryUpdate } = get();
      return {
        ...getHistoryUpdate(),
        elements: state.elements.filter((el) => el.id !== id),
        selectedElements: state.selectedElements.filter((elId) => elId !== id),
      };
    }),
  updateName: (id, name) =>
    set((state) => {
      const { getHistoryUpdate } = get();
      return {
        ...getHistoryUpdate(),
        elements: state.elements.map((el) =>
          el.id === id ? { ...el, name } : el
        ),
      };
    }),
  updateFontSize: (id, fontSize) =>
    set((state) => {
      const { getHistoryUpdate } = get();
      return {
        ...getHistoryUpdate(),
        elements: state.elements.map((el) =>
          el.id === id ? { ...el, fontSize } : el
        ),
      };
    }),
  updateFontWeight: (id, fontWeight) =>
    set((state) => {
      const { getHistoryUpdate } = get();
      return {
        ...getHistoryUpdate(),
        elements: state.elements.map((el) =>
          el.id === id ? { ...el, fontWeight } : el
        ),
      };
    }),
  updateLetterSpacing: (id, letterSpacing) =>
    set((state) => {
      const { getHistoryUpdate } = get();
      return {
        ...getHistoryUpdate(),
        elements: state.elements.map((el) =>
          el.id === id ? { ...el, letterSpacing } : el
        ),
      };
    }),
  updateLineHeight: (id, lineHeight) =>
    set((state) => {
      const { getHistoryUpdate } = get();
      return {
        ...getHistoryUpdate(),
        elements: state.elements.map((el) =>
          el.id === id ? { ...el, lineHeight } : el
        ),
      };
    }),
  updateHorizontalAlign: (id, horizontalAlign) =>
    set((state) => {
      const { getHistoryUpdate } = get();
      return {
        ...getHistoryUpdate(),
        elements: state.elements.map((el) =>
          el.id === id ? { ...el, horizontalAlign } : el
        ),
      };
    }),
  updateVerticalAlign: (id, verticalAlign) =>
    set((state) => {
      const { getHistoryUpdate } = get();
      return {
        ...getHistoryUpdate(),
        elements: state.elements.map((el) =>
          el.id === id ? { ...el, verticalAlign } : el
        ),
      };
    }),
  clearSelection: () =>
    set((state) => ({
      elements: state.elements.map((el) => ({ ...el, selected: false })),
      selectedElements: [],
    })),
  getSelectedElementData: () => {
    const { elements, selectedElements } = get();
    return selectedElements.length === 1
      ? elements.find((el) => el.id === selectedElements[0])
      : undefined;
  },
  getSelectedElementsData: () => {
    const { elements, selectedElements } = get();
    return elements.filter((el) => selectedElements.includes(el.id));
  },
  hasMultipleSelection: () => {
    const { selectedElements } = get();
    return selectedElements.length > 1;
  },
  copySelection: () => {
    const state = get();
    const selectedElements = state.elements.filter((el) =>
      state.selectedElements.includes(el.id)
    );

    // Update internal clipboard (for backward compatibility)
    const selected =
      selectedElements.length > 0 ? { ...selectedElements[0] } : null;

    set({ clipboard: selected });

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
        selectedElements: [newId],
      };
    }),
  updateImageSrc: (id, src) =>
    set((state) => ({
      elements: state.elements.map((el) =>
        el.id === id && el.type === "image" ? { ...el, src } : el
      ),
    })),
  toggleElementVisibility: (id) =>
    set((state) => ({
      elements: state.elements.map((el) =>
        el.id === id
          ? { ...el, visible: el.visible !== false ? false : true }
          : el
      ),
    })),
  toggleAspectRatioLock: (id) =>
    set((state) => {
      const { getHistoryUpdate } = get();
      return {
        ...getHistoryUpdate(),
        elements: state.elements.map((el) =>
          el.id === id ? { ...el, lockAspectRatio: !el.lockAspectRatio } : el
        ),
      };
    }),
  // File operations
  exportCanvas: (filename?: string) => {
    const { elements, artboardDimensions, projectName } = get();

    // Clean elements by removing id and selected properties
    const cleanElements = elements.map(
      ({ id, selected, ...element }) => element
    );

    const canvasData = {
      elements: cleanElements,
      artboardDimensions,
      projectName,
      exportedAt: new Date().toISOString(),
      version: "1.0",
    };

    const dataStr = JSON.stringify(canvasData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(dataBlob);
    link.download =
      filename ||
      `${projectName.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.json`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(link.href);
  },
  importCanvas: async (file: File) => {
    return new Promise((resolve) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const canvasData = JSON.parse(content);

          // Validate the imported data structure
          if (!canvasData.elements || !Array.isArray(canvasData.elements)) {
            console.error(
              "Invalid canvas data: missing or invalid elements array"
            );
            resolve({ success: false });
            return;
          }

          if (
            !canvasData.artboardDimensions ||
            typeof canvasData.artboardDimensions.width !== "number" ||
            typeof canvasData.artboardDimensions.height !== "number"
          ) {
            console.error(
              "Invalid canvas data: missing or invalid artboard dimensions"
            );
            resolve({ success: false });
            return;
          }

          const state = get();
          const { getHistoryUpdate } = get();

          // Generate new IDs for imported elements to avoid conflicts
          const importedElements = canvasData.elements.map(
            (el: CanvasElementData) => {
              const newId = `${el.type}-${Date.now()}-${Math.random()
                .toString(36)
                .substr(2, 9)}`;
              return {
                ...el,
                id: newId,
                selected: true, // Auto-select imported elements
              };
            }
          );

          // Get the IDs of imported elements for selection
          const importedElementIds = importedElements.map(
            (el: CanvasElementData) => el.id
          );

          // Add imported elements to existing elements instead of replacing
          const updatedElements = [
            ...state.elements.map((el) => ({ ...el, selected: false })), // Deselect current elements
            ...importedElements,
          ];

          // Keep current artboard dimensions (don't change them)
          // Import project name if it exists in the imported data
          const updateData: any = {
            ...getHistoryUpdate(),
            elements: updatedElements,
            selectedElements: importedElementIds, // Auto-select all imported elements
          };

          if (
            canvasData.projectName &&
            typeof canvasData.projectName === "string"
          ) {
            updateData.projectName = canvasData.projectName;
          }

          set(updateData);

          resolve({ success: true, importedCount: importedElements.length });
        } catch (error) {
          console.error("Error parsing canvas file:", error);
          resolve({ success: false });
        }
      };

      reader.onerror = () => {
        console.error("Error reading file");
        resolve({ success: false });
      };

      reader.readAsText(file);
    });
  },
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
        selectedElements: [],
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
  // Sidebar state actions
  toggleRightSidebarDock: () =>
    set((state) => ({
      rightSidebarDocked: !state.rightSidebarDocked,
    })),
}));
