import { CanvasElementData } from "../types";

/**
 * Service for managing canvas state operations
 * Extracted from useCanvasStore to separate business logic from state management
 */

export interface CanvasStateData {
  elements: CanvasElementData[];
  artboardDimensions: { width: number; height: number };
  artboardAspectRatio: number | null;
}

export interface ClipboardState {
  clipboard: CanvasElementData[] | null;
}

export interface TransformOperation {
  elementId: string;
  deltaX?: number;
  deltaY?: number;
  width?: number;
  height?: number;
  rotation?: number;
  preserveAspectRatio?: boolean;
}

/**
 * Move element by delta
 */
export const moveElement = (
  elements: CanvasElementData[],
  elementId: string,
  deltaX: number,
  deltaY: number,
  getElementDescendants: (id: string) => string[]
): CanvasElementData[] => {
  const element = elements.find((el) => el.id === elementId);
  if (!element) return elements;

  // If moving a group, also move all its descendants
  const elementsToMove =
    element.type === "group"
      ? [elementId, ...getElementDescendants(elementId)]
      : [elementId];

  return elements.map((el) =>
    elementsToMove.includes(el.id)
      ? { ...el, x: Math.round(el.x + deltaX), y: Math.round(el.y + deltaY) }
      : el
  );
};

/**
 * Move multiple selected elements
 */
export const moveSelectedElements = (
  elements: CanvasElementData[],
  selectedElements: string[],
  deltaX: number,
  deltaY: number,
  getElementDescendants: (id: string) => string[]
): CanvasElementData[] => {
  // Get all elements that should be moved (selected elements + their descendants)
  const elementsToMove = new Set<string>();

  selectedElements.forEach((id) => {
    elementsToMove.add(id);
    const element = elements.find((el) => el.id === id);
    if (element?.type === "group") {
      getElementDescendants(id).forEach((descendantId) =>
        elementsToMove.add(descendantId)
      );
    }
  });

  return elements.map((el) =>
    elementsToMove.has(el.id)
      ? { ...el, x: Math.round(el.x + deltaX), y: Math.round(el.y + deltaY) }
      : el
  );
};

/**
 * Resize element
 */
export const resizeElement = (
  elements: CanvasElementData[],
  elementId: string,
  width: number,
  height: number,
  preserveAspectRatio = false,
  getElementDescendants: (id: string) => string[]
): CanvasElementData[] => {
  const element = elements.find((el) => el.id === elementId);
  if (!element) return elements;

  // If resizing a group, also resize and reposition its children proportionally
  if (element.type === "group") {
    const scaleX = Math.max(20, width) / element.width;
    const scaleY = Math.max(20, height) / element.height;
    const descendants = getElementDescendants(elementId);

    return elements.map((el) => {
      if (el.id === elementId) {
        // Resize the group itself
        return {
          ...el,
          width: Math.max(20, width),
          height: Math.max(20, height),
          cornerRadius: el.cornerRadius
            ? Math.max(
                0,
                Math.min(
                  el.cornerRadius,
                  Math.max(20, width) / 2,
                  Math.max(20, height) / 2
                )
              )
            : el.cornerRadius,
        };
      } else if (descendants.includes(el.id)) {
        // Resize and reposition children proportionally
        const relativeX = el.x - element.x;
        const relativeY = el.y - element.y;

        return {
          ...el,
          x: element.x + Math.round(relativeX * scaleX),
          y: element.y + Math.round(relativeY * scaleY),
          width: Math.max(20, Math.round(el.width * scaleX)),
          height: Math.max(20, Math.round(el.height * scaleY)),
          // Scale font size for text elements
          fontSize:
            el.type === "text" && el.fontSize
              ? Math.max(8, Math.round(el.fontSize * Math.min(scaleX, scaleY)))
              : el.fontSize,
          lineHeight:
            el.type === "text" && el.lineHeight
              ? Math.max(
                  10,
                  Math.round(el.lineHeight * Math.min(scaleX, scaleY))
                )
              : el.lineHeight,
          cornerRadius: el.cornerRadius
            ? Math.max(
                0,
                Math.min(
                  el.cornerRadius,
                  Math.max(20, Math.round(el.width * scaleX)) / 2,
                  Math.max(20, Math.round(el.height * scaleY)) / 2
                )
              )
            : el.cornerRadius,
        };
      }
      return el;
    });
  } else {
    // Regular element resize
    return elements.map((el) =>
      el.id === elementId
        ? {
            ...el,
            width: Math.max(20, width),
            height: Math.max(20, height),
            cornerRadius: el.cornerRadius
              ? Math.max(
                  0,
                  Math.min(
                    el.cornerRadius,
                    Math.max(20, width) / 2,
                    Math.max(20, height) / 2
                  )
                )
              : el.cornerRadius,
          }
        : el
    );
  }
};

/**
 * Delete element and its descendants
 */
export const deleteElement = (
  elements: CanvasElementData[],
  elementId: string,
  getElementDescendants: (id: string) => string[]
): CanvasElementData[] => {
  const elementToDelete = elements.find((el) => el.id === elementId);
  if (!elementToDelete) return elements;

  // Get all elements to delete (element + its descendants)
  const elementsToDelete = [elementId, ...getElementDescendants(elementId)];

  // If deleting a child element, remove it from its parent's children array
  let updatedElements = elements.filter(
    (el) => !elementsToDelete.includes(el.id)
  );

  if (elementToDelete.parentId) {
    updatedElements = updatedElements.map((el) => {
      if (el.id === elementToDelete.parentId && el.children) {
        const newChildren = el.children.filter(
          (childId) => !elementsToDelete.includes(childId)
        );
        return {
          ...el,
          children: newChildren,
        };
      }
      return el;
    });

    // Check if parent group is now empty and delete it
    const parentGroup = updatedElements.find(
      (el) => el.id === elementToDelete.parentId
    );
    if (
      parentGroup &&
      parentGroup.type === "group" &&
      parentGroup.children &&
      parentGroup.children.length === 0
    ) {
      // Remove the empty parent group
      updatedElements = updatedElements.filter(
        (el) => el.id !== parentGroup.id
      );
    }
  }

  return updatedElements;
};

/**
 * Reorder elements
 */
export const reorderElements = (
  elements: CanvasElementData[],
  oldIndex: number,
  newIndex: number
): CanvasElementData[] => {
  const updated = [...elements];
  const [moved] = updated.splice(oldIndex, 1);
  updated.splice(newIndex, 0, moved);
  return updated;
};

/**
 * Update element properties
 */
export const updateElementProperty = <K extends keyof CanvasElementData>(
  elements: CanvasElementData[],
  elementId: string,
  property: K,
  value: CanvasElementData[K]
): CanvasElementData[] => {
  return elements.map((el) =>
    el.id === elementId ? { ...el, [property]: value } : el
  );
};

/**
 * Copy selected elements to clipboard
 */
export const copyToClipboard = (
  elements: CanvasElementData[],
  selectedElements: string[],
  getElementDescendants: (id: string) => string[]
): CanvasElementData[] => {
  // Get all selected elements and their descendants
  const elementsToCopy: string[] = [];

  selectedElements.forEach((selectedId) => {
    elementsToCopy.push(selectedId);
    // If it's a group, also include all its descendants
    const element = elements.find((el) => el.id === selectedId);
    if (element?.type === "group") {
      elementsToCopy.push(...getElementDescendants(selectedId));
    }
  });

  // Remove duplicates and get the actual elements
  const uniqueElementIds = [...new Set(elementsToCopy)];
  const selectedElementsData = elements.filter((el) =>
    uniqueElementIds.includes(el.id)
  );

  return selectedElementsData.length > 0
    ? selectedElementsData.map((el) => ({ ...el }))
    : [];
};

/**
 * Paste from clipboard
 */
export const pasteFromClipboard = (
  elements: CanvasElementData[],
  clipboard: CanvasElementData[]
): { elements: CanvasElementData[]; newElementIds: string[] } => {
  if (!clipboard || clipboard.length === 0) {
    return { elements, newElementIds: [] };
  }

  const newElements: CanvasElementData[] = [];
  const newElementIds: string[] = [];
  const oldToNewIdMapping: { [oldId: string]: string } = {};

  // First pass: Create all elements with new IDs
  clipboard.forEach((clipboardElement, index) => {
    const newId = `${clipboardElement.type}-${Date.now()}-${index}`;
    oldToNewIdMapping[clipboardElement.id] = newId;

    const newElement: CanvasElementData = {
      ...clipboardElement,
      id: newId,
      x: clipboardElement.x + 20,
      y: clipboardElement.y + 20,
      selected: true,
      rotation: clipboardElement.rotation || 0,
    };

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
        .map((childId) => oldToNewIdMapping[childId])
        .filter(Boolean); // Only keep children that were also copied
    }

    return updatedElement;
  });

  return {
    elements: [
      ...elements.map((el) => ({ ...el, selected: false })),
      ...finalElements,
    ],
    newElementIds,
  };
};

/**
 * Reset canvas to initial state
 */
export const resetCanvas = (): {
  elements: CanvasElementData[];
  selectedElements: string[];
} => {
  return {
    elements: [],
    selectedElements: [],
  };
};

/**
 * Toggle element visibility
 */
export const toggleElementVisibility = (
  elements: CanvasElementData[],
  elementId: string
): CanvasElementData[] => {
  return elements.map((el) =>
    el.id === elementId
      ? { ...el, visible: el.visible !== false ? false : true }
      : el
  );
};
