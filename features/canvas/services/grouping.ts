import { CanvasElementData } from "../types";

/**
 * Service for managing element grouping operations
 * Extracted from useCanvasStore to separate business logic from state management
 */

export interface GroupingState {
  elements: CanvasElementData[];
  selectedElements: string[];
}

export interface GroupingResult {
  elements: CanvasElementData[];
  selectedElements: string[];
}

/**
 * Get element descendants (children and grandchildren)
 */
export const getElementDescendants = (
  elements: CanvasElementData[],
  elementId: string
): string[] => {
  const descendants: string[] = [];
  const element = elements.find((el) => el.id === elementId);
  const directChildren = element?.children || [];

  for (const childId of directChildren) {
    descendants.push(childId);
    descendants.push(...getElementDescendants(elements, childId)); // Recursively get grandchildren
  }

  return descendants;
};

/**
 * Get top-level elements (no parent)
 */
export const getTopLevelElements = (
  elements: CanvasElementData[]
): CanvasElementData[] => {
  return elements.filter((el) => !el.parentId);
};

/**
 * Get direct children of an element
 */
export const getElementChildren = (
  elements: CanvasElementData[],
  elementId: string
): CanvasElementData[] => {
  const element = elements.find((el) => el.id === elementId);
  if (!element?.children) return [];
  return elements.filter((el) => element.children?.includes(el.id));
};

/**
 * Group selected elements
 */
export const groupElements = (state: GroupingState): GroupingResult => {
  const { elements, selectedElements } = state;

  if (selectedElements.length < 2) return state;

  const selectedElementsData = elements.filter((el) =>
    selectedElements.includes(el.id)
  );

  // Calculate bounding box for the group
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;

  selectedElementsData.forEach((el) => {
    minX = Math.min(minX, el.x);
    minY = Math.min(minY, el.y);
    maxX = Math.max(maxX, el.x + el.width);
    maxY = Math.max(maxY, el.y + el.height);
  });

  const groupId = `group-${Date.now()}`;
  const groupElement: CanvasElementData = {
    id: groupId,
    type: "group",
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
    color: "transparent",
    borderWidth: 1,
    borderColor: "#3b82f6",
    selected: true,
    visible: true,
    children: selectedElements,
    name: "Group",
    rotation: 0,
  };

  // Update selected elements to have this group as parent
  const updatedElements = elements.map((el) => {
    if (selectedElements.includes(el.id)) {
      return { ...el, parentId: groupId, selected: false };
    }
    return el;
  });

  return {
    elements: [...updatedElements, groupElement],
    selectedElements: [groupId],
  };
};

/**
 * Ungroup selected group element
 */
export const ungroupElements = (state: GroupingState): GroupingResult => {
  const { elements, selectedElements } = state;

  if (selectedElements.length !== 1) return state;

  const selectedElement = elements.find((el) => el.id === selectedElements[0]);

  if (!selectedElement || selectedElement.type !== "group") return state;

  const childrenIds = selectedElement.children || [];

  // Remove the group and update children to remove parentId
  const updatedElements = elements
    .filter((el) => el.id !== selectedElement.id)
    .map((el) => {
      if (childrenIds.includes(el.id)) {
        return { ...el, parentId: undefined, selected: true };
      }
      return el;
    });

  return {
    elements: updatedElements,
    selectedElements: childrenIds,
  };
};

/**
 * Move element to a specific group
 */
export const moveElementToGroup = (
  state: GroupingState,
  elementId: string,
  groupId: string | null
): GroupingResult => {
  const { elements } = state;

  let updatedElements = [...elements];
  const element = updatedElements.find((el) => el.id === elementId);

  if (!element) return state;

  // Remove from current parent
  if (element.parentId) {
    updatedElements = updatedElements.map((el) => {
      if (el.id === element.parentId && el.children) {
        return {
          ...el,
          children: el.children.filter((childId) => childId !== elementId),
        };
      }
      return el;
    });
  }

  // Add to new parent
  updatedElements = updatedElements.map((el) => {
    if (el.id === elementId) {
      return { ...el, parentId: groupId || undefined };
    }
    if (groupId && el.id === groupId && el.type === "group") {
      return {
        ...el,
        children: [...(el.children || []), elementId],
      };
    }
    return el;
  });

  return {
    elements: updatedElements,
    selectedElements: state.selectedElements,
  };
};

/**
 * Reorder elements hierarchically
 */
export const reorderElementsHierarchical = (
  state: GroupingState,
  draggedElementId: string,
  targetElementId: string,
  position: "before" | "after" | "inside"
): GroupingResult => {
  const { elements } = state;

  const draggedElement = elements.find((el) => el.id === draggedElementId);
  const targetElement = elements.find((el) => el.id === targetElementId);

  if (!draggedElement || !targetElement) return state;

  // Prevent creating cycles: cannot drop an element into its own descendant
  if (position === "inside" && targetElement.type === "group") {
    const draggedDescendants = getElementDescendants(
      elements,
      draggedElementId
    );
    if (draggedDescendants.includes(targetElementId)) {
      return state;
    }
  }

  let updatedElements = [...elements];

  // Only remove from parent if we are actually moving to a new position
  let willMove = false;
  if (
    position === "inside" &&
    targetElement.type === "group" &&
    draggedElement.parentId !== targetElementId
  ) {
    willMove = true;
  } else if (targetElement.id !== draggedElement.id) {
    willMove = true;
  }

  if (willMove && draggedElement.parentId) {
    updatedElements = updatedElements.map((el) => {
      if (el.id === draggedElement.parentId && el.children) {
        return {
          ...el,
          children: el.children.filter(
            (childId) => childId !== draggedElementId
          ),
        };
      }
      return el;
    });
  }

  if (position === "inside" && targetElement.type === "group") {
    // Move element inside the group (append at end)
    updatedElements = updatedElements.map((el) => {
      if (el.id === draggedElementId) {
        return { ...el, parentId: targetElementId };
      }
      if (el.id === targetElementId) {
        const children = el.children ? [...el.children] : [];
        // Avoid duplicate if already present (e.g., moving from same group)
        if (!children.includes(draggedElementId)) {
          children.push(draggedElementId);
        }
        return { ...el, children };
      }
      return el;
    });
  } else {
    // Move element to the same level as target (before or after)
    const targetParentId = targetElement.parentId;

    updatedElements = updatedElements.map((el) => {
      if (el.id === draggedElementId) {
        return { ...el, parentId: targetParentId };
      }
      return el;
    });

    // If target has a parent, update the parent's children array
    if (targetParentId) {
      updatedElements = updatedElements.map((el) => {
        if (el.id === targetParentId) {
          const children = el.children ? [...el.children] : [];
          // First remove dragged if present to avoid duplicates
          const filtered = children.filter((id) => id !== draggedElementId);
          const targetIndex = filtered.indexOf(targetElementId);
          if (targetIndex === -1) return el;
          if (position === "before") {
            filtered.splice(targetIndex, 0, draggedElementId);
          } else {
            filtered.splice(targetIndex + 1, 0, draggedElementId);
          }
          return { ...el, children: filtered };
        }
        return el;
      });
    } else {
      // Handle top-level reordering
      // Remove the dragged element from its current position
      const withoutDragged = updatedElements.filter(
        (el) => el.id !== draggedElementId
      );

      // Find the target element's index in the filtered array
      const targetIndex = withoutDragged.findIndex(
        (el) => el.id === targetElementId
      );

      if (targetIndex !== -1) {
        // Insert the dragged element at the appropriate position
        if (position === "before") {
          withoutDragged.splice(targetIndex, 0, {
            ...draggedElement,
            parentId: undefined,
          });
        } else {
          withoutDragged.splice(targetIndex + 1, 0, {
            ...draggedElement,
            parentId: undefined,
          });
        }
      }

      updatedElements = withoutDragged;
    }
  }

  return {
    elements: updatedElements,
    selectedElements: state.selectedElements,
  };
};

/**
 * Check if element can be grouped
 */
export const canGroupElements = (selectedElements: string[]): boolean => {
  return selectedElements.length >= 2;
};

/**
 * Check if element can be ungrouped
 */
export const canUngroupElements = (
  elements: CanvasElementData[],
  selectedElements: string[]
): boolean => {
  if (selectedElements.length !== 1) return false;

  const selectedElement = elements.find((el) => el.id === selectedElements[0]);
  return selectedElement?.type === "group";
};
