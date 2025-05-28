/**
 * Isolation operations service for canvas elements
 * Handles group isolation mode, double-click behaviors, and group interactions
 */

export interface IsolationContext {
  isInIsolationMode: boolean;
  isolatedGroupId?: string;
  selectedElementId?: string;
}

/**
 * Handle group double-click operations
 */
export const createGroupInteractionHandlers = (
  element: any,
  canvasStore: any
) => {
  const handleGroupDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    e.nativeEvent.stopImmediatePropagation();

    const state = canvasStore.getState();
    const { x: mouseX, y: mouseY } = getMousePositionInElement(e, element);

    // Find the topmost child element at the mouse position
    const childAtPosition = findChildElementAtPosition(
      element.id,
      mouseX,
      mouseY,
      state.elements
    );

    if (childAtPosition) {
      // Enter isolation mode with this group and select the child element
      canvasStore.enterIsolationMode(element.id, childAtPosition.id);
    } else {
      // No child at position, just enter isolation mode for the group
      canvasStore.enterIsolationMode(element.id);
    }
  };

  const handleGeneralDoubleClick = (e: React.MouseEvent) => {
    // Text editing takes priority
    if (element.type === "text") {
      return; // Let text double-click handler take over
    }

    // Prevent other handlers
    e.stopPropagation();
    e.preventDefault();
    e.nativeEvent.stopImmediatePropagation();

    // If already in isolation mode, exit on double-click
    if (element.isInIsolationMode) {
      canvasStore.exitIsolationMode();
      return;
    }

    // If this is a group, enter isolation (possibly selecting a child)
    if (element.type === "group") {
      handleGroupDoubleClick(e);
      return;
    }

    // If this element is inside a group, double-click isolates its parent group and selects this element
    if (element.parentId) {
      canvasStore.enterIsolationMode(element.parentId, element.id);
      return;
    }
  };

  return {
    handleGroupDoubleClick,
    handleGeneralDoubleClick,
  };
};

/**
 * Get mouse position relative to element
 */
const getMousePositionInElement = (
  e: React.MouseEvent,
  element: any
): { x: number; y: number } => {
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  // Adjust for element's position within its container
  const relativeX = mouseX - element.x;
  const relativeY = mouseY - element.y;

  return { x: relativeX, y: relativeY };
};

/**
 * Find child element at specific position within a group
 */
const findChildElementAtPosition = (
  groupId: string,
  x: number,
  y: number,
  allElements: any[]
): any | null => {
  // Get all children of this group
  const children = allElements.filter((el) => el.parentId === groupId);

  // Sort by z-index (higher z-index = on top)
  children.sort((a, b) => (b.zIndex || 0) - (a.zIndex || 0));

  // Find the topmost child that contains the point
  for (const child of children) {
    if (isPointInElement(x, y, child)) {
      // If this child is also a group, recursively check its children
      if (child.type === "group") {
        const nestedChild = findChildElementAtPosition(
          child.id,
          x - child.x,
          y - child.y,
          allElements
        );
        if (nestedChild) {
          return nestedChild;
        }
      }
      return child;
    }
  }

  return null;
};

/**
 * Check if a point is within an element's bounds
 */
const isPointInElement = (x: number, y: number, element: any): boolean => {
  return (
    x >= element.x &&
    x <= element.x + element.width &&
    y >= element.y &&
    y <= element.y + element.height
  );
};

/**
 * Determine isolation mode properties for an element
 */
export const getIsolationProperties = (
  element: any,
  isolationContext: IsolationContext
): {
  isInIsolationMode: boolean;
  isSelectableInIsolation: boolean;
  inIsolatedGroup: boolean;
  isolated: boolean;
} => {
  const { isInIsolationMode, isolatedGroupId } = isolationContext;

  if (!isInIsolationMode || !isolatedGroupId) {
    return {
      isInIsolationMode: false,
      isSelectableInIsolation: true,
      inIsolatedGroup: false,
      isolated: false,
    };
  }

  // Element is in isolation mode if there's an active isolation
  const elementIsInIsolationMode = isInIsolationMode;

  // Element is selectable if it's the isolated group or a child of it
  const isSelectableInIsolation =
    element.id === isolatedGroupId || element.parentId === isolatedGroupId;

  // Element is in isolated group if it's a child of the isolated group
  const inIsolatedGroup = element.parentId === isolatedGroupId;

  // Element is isolated if it's the group being isolated
  const isolated = element.id === isolatedGroupId;

  return {
    isInIsolationMode: elementIsInIsolationMode,
    isSelectableInIsolation,
    inIsolatedGroup,
    isolated,
  };
};

/**
 * Handle element selection in isolation mode
 */
export const handleIsolationSelection = (
  element: any,
  isolationContext: IsolationContext,
  onSelect: (elementId: string) => void
) => {
  const { isSelectableInIsolation } = getIsolationProperties(
    element,
    isolationContext
  );

  if (!isSelectableInIsolation) {
    // Element is not selectable in isolation mode
    return false;
  }

  // Proceed with normal selection
  onSelect(element.id);
  return true;
};

/**
 * Create isolation mode UI helpers
 */
export const createIsolationUIHelpers = (
  element: any,
  isolationContext: IsolationContext
) => {
  const properties = getIsolationProperties(element, isolationContext);

  const getVisibilityProps = () => {
    if (!properties.isInIsolationMode) {
      return { visible: true, opacity: 1 };
    }

    if (properties.isSelectableInIsolation) {
      return { visible: true, opacity: 1 };
    }

    // Non-selectable elements in isolation mode are dimmed
    return { visible: true, opacity: 0.3 };
  };

  const getCursorProps = () => {
    if (properties.isInIsolationMode && !properties.isSelectableInIsolation) {
      return "cursor-not-allowed";
    }

    if (element.parentId && !properties.isInIsolationMode) {
      return "cursor-pointer"; // Child elements show they'll select the parent
    }

    return "cursor-move";
  };

  const getZIndexProps = () => {
    if (properties.inIsolatedGroup) return 10;
    if (properties.isolated) return 5;
    return 1;
  };

  return {
    ...properties,
    ...getVisibilityProps(),
    cursor: getCursorProps(),
    zIndex: getZIndexProps(),
  };
};
