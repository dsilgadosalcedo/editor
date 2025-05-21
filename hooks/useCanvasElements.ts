import { useState, useRef } from "react";

export type ElementType = "rectangle" | "text";
export type ToolType = ElementType | "hand" | null;

export interface CanvasElementData {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  content?: string;
  color: string;
  borderWidth?: number;
  borderColor?: string;
  shadowBlur?: number;
  shadowColor?: string;
  selected: boolean;
  cornerRadius?: number;
  name?: string;
}

export const useCanvasElements = (artboardDimensions: {
  width: number;
  height: number;
}) => {
  const [elements, setElements] = useState<CanvasElementData[]>([]);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);

  // History state for undo/redo
  const [past, setPast] = useState<CanvasElementData[][]>([]);
  const [future, setFuture] = useState<CanvasElementData[][]>([]);

  // Status flags for undo/redo availability
  const canUndo = past.length > 0;
  const canRedo = future.length > 0;

  // Ref for batching move and corner radius updates into one undoable action
  const lastBatchRef = useRef<{
    type: string | null;
    timeoutId: number | null;
  }>({ type: null, timeoutId: null });

  // Helper to update elements and track history
  const updateElements = (
    updater: (els: CanvasElementData[]) => CanvasElementData[]
  ) => {
    setPast((prev) => [...prev, elements]);
    setFuture([]);
    setElements((prev) => updater(prev));
  };

  // Undo the last action
  const handleUndo = () => {
    if (!canUndo) return;
    const previous = past[past.length - 1];
    setPast((prev) => prev.slice(0, prev.length - 1));
    setFuture((prev) => [elements, ...prev]);
    setElements(previous);
  };

  // Redo the next action
  const handleRedo = () => {
    if (!canRedo) return;
    const next = future[0];
    setFuture((prev) => prev.slice(1));
    setPast((prev) => [...prev, elements]);
    setElements(next);
  };

  const handleAddElement = (type: ElementType) => {
    const newElement: CanvasElementData = {
      id: `${type}-${Date.now()}`,
      type,
      x: artboardDimensions.width / 2 - (type === "rectangle" ? 50 : 40),
      y: artboardDimensions.height / 2 - (type === "rectangle" ? 50 : 20),
      width: type === "rectangle" ? 100 : 80,
      height: type === "rectangle" ? 100 : 40,
      content: type === "text" ? "New Text" : undefined,
      color: type === "rectangle" ? "#d9f99d" : "#ffffff",
      borderWidth: 0,
      borderColor: "#000000",
      shadowBlur: 0,
      shadowColor: "#000000",
      selected: true,
      cornerRadius: type === "rectangle" ? 0 : undefined,
      name: type === "rectangle" ? "Rectangle" : "Text",
    };
    updateElements((prev) => [
      ...prev.map((el) => ({ ...el, selected: false })),
      newElement,
    ]);
    setSelectedElement(newElement.id);
  };

  const handleSelectElement = (id: string, tool: ToolType) => {
    if (tool === "hand") return;
    setElements((prev) =>
      prev.map((el) => ({ ...el, selected: el.id === id }))
    );
    setSelectedElement(id);
  };

  const handleMoveElement = (id: string, dx: number, dy: number) => {
    // Updater function for move
    const updater = (els: CanvasElementData[]) =>
      els.map((el) =>
        el.id === id ? { ...el, x: el.x + dx, y: el.y + dy } : el
      );
    if (lastBatchRef.current.type !== "move") {
      updateElements(updater);
      lastBatchRef.current.type = "move";
    } else {
      setElements((prev) => updater(prev));
    }
    if (lastBatchRef.current.timeoutId) {
      clearTimeout(lastBatchRef.current.timeoutId);
    }
    lastBatchRef.current.timeoutId = window.setTimeout(() => {
      lastBatchRef.current.type = null;
      lastBatchRef.current.timeoutId = null;
    }, 300);
  };

  const handleResizeElement = (id: string, width: number, height: number) => {
    // Updater function for resize
    const updater = (els: CanvasElementData[]) =>
      els.map((el) => {
        if (el.id === id) {
          let newCornerRadius = el.cornerRadius;
          if (typeof newCornerRadius === "number") {
            newCornerRadius = Math.min(newCornerRadius, width / 2, height / 2);
          }
          return {
            ...el,
            width,
            height,
            ...(typeof newCornerRadius === "number"
              ? { cornerRadius: newCornerRadius }
              : {}),
          };
        }
        return el;
      });
    // Batch resize updates into one history entry
    if (lastBatchRef.current.type !== "resize") {
      updateElements(updater);
      lastBatchRef.current.type = "resize";
    } else {
      setElements((prev) => updater(prev));
    }
    if (lastBatchRef.current.timeoutId) {
      clearTimeout(lastBatchRef.current.timeoutId);
    }
    lastBatchRef.current.timeoutId = window.setTimeout(() => {
      lastBatchRef.current.type = null;
      lastBatchRef.current.timeoutId = null;
    }, 300);
  };

  const handleUpdateTextContent = (id: string, content: string) => {
    updateElements((prev) =>
      prev.map((el) =>
        el.id === id && el.type === "text" ? { ...el, content } : el
      )
    );
  };

  const handleResetCanvas = () => {
    updateElements(() => []);
    setSelectedElement(null);
  };

  const handleClearSelection = () => {
    updateElements((prev) => prev.map((el) => ({ ...el, selected: false })));
    setSelectedElement(null);
  };

  const handleReorderElements = (oldIndex: number, newIndex: number) => {
    updateElements((prev) => {
      const updated = [...prev];
      const [moved] = updated.splice(oldIndex, 1);
      updated.splice(newIndex, 0, moved);
      return updated;
    });
  };

  const getSelectedElementData = () =>
    elements.find((el) => el.id === selectedElement);

  const handleUpdateCornerRadius = (id: string, cornerRadius: number) => {
    // Updater function for corner radius
    const updater = (els: CanvasElementData[]) =>
      els.map((el) =>
        el.id === id && el.type === "rectangle"
          ? {
              ...el,
              cornerRadius: Math.max(
                0,
                Math.min(cornerRadius, el.width / 2, el.height / 2)
              ),
            }
          : el
      );
    // If first corner radius update in this drag, record history
    if (lastBatchRef.current.type !== "cornerRadius") {
      updateElements(updater);
      lastBatchRef.current.type = "cornerRadius";
    } else {
      // Subsequent updates apply directly without new history entry
      setElements((prev) => updater(prev));
    }
    // Reset batching after a short timeout to allow future drags
    if (lastBatchRef.current.timeoutId) {
      clearTimeout(lastBatchRef.current.timeoutId);
    }
    lastBatchRef.current.timeoutId = window.setTimeout(() => {
      lastBatchRef.current.type = null;
      lastBatchRef.current.timeoutId = null;
    }, 300);
  };

  // Update fill color of element
  const handleUpdateFillColor = (id: string, color: string) => {
    updateElements((els) =>
      els.map((el) => (el.id === id ? { ...el, color } : el))
    );
  };

  // Update border width of element
  const handleUpdateBorderWidth = (id: string, borderWidth: number) => {
    updateElements((els) =>
      els.map((el) => (el.id === id ? { ...el, borderWidth } : el))
    );
  };

  // Update border color of element
  const handleUpdateBorderColor = (id: string, borderColor: string) => {
    updateElements((els) =>
      els.map((el) => (el.id === id ? { ...el, borderColor } : el))
    );
  };

  // Update shadow blur of element
  const handleUpdateShadowBlur = (id: string, shadowBlur: number) => {
    updateElements((els) =>
      els.map((el) => (el.id === id ? { ...el, shadowBlur } : el))
    );
  };

  // Update shadow color of element
  const handleUpdateShadowColor = (id: string, shadowColor: string) => {
    updateElements((els) =>
      els.map((el) => (el.id === id ? { ...el, shadowColor } : el))
    );
  };

  // Update element name
  const handleUpdateName = (id: string, name: string) => {
    updateElements((els) =>
      els.map((el) => (el.id === id ? { ...el, name } : el))
    );
  };

  // Handler to delete an element by ID
  const handleDeleteElement = (id: string) => {
    updateElements((els) => els.filter((el) => el.id !== id));
    setSelectedElement(null);
  };

  return {
    elements,
    selectedElement,
    handleAddElement,
    handleSelectElement,
    handleMoveElement,
    handleResizeElement,
    handleUpdateTextContent,
    handleResetCanvas,
    handleUndo,
    handleRedo,
    canUndo,
    canRedo,
    getSelectedElementData,
    setElements,
    setSelectedElement,
    handleUpdateCornerRadius,
    handleClearSelection,
    handleReorderElements,
    handleUpdateFillColor,
    handleUpdateBorderWidth,
    handleUpdateBorderColor,
    handleUpdateShadowBlur,
    handleUpdateShadowColor,
    handleDeleteElement,
    handleUpdateName,
  };
};
