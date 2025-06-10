/**
 * Element rendering service for canvas elements
 * Handles styling, cursor management, and visual appearance logic
 */

export interface ElementStyles {
  position: React.CSSProperties;
  container: React.CSSProperties;
  image?: React.CSSProperties;
}

/**
 * Get cursor for rotated resize handles
 */
export const getRotatedCursor = (
  direction: string,
  rotation: number = 0
): string => {
  // Normalize rotation to 0-360
  const normalizedRotation = ((rotation % 360) + 360) % 360;

  const rotationMap = {
    nw: [
      "cursor-nw-resize",
      "cursor-n-resize",
      "cursor-ne-resize",
      "cursor-e-resize",
      "cursor-se-resize",
      "cursor-s-resize",
      "cursor-sw-resize",
      "cursor-w-resize",
    ],
    n: [
      "cursor-n-resize",
      "cursor-ne-resize",
      "cursor-e-resize",
      "cursor-se-resize",
      "cursor-s-resize",
      "cursor-sw-resize",
      "cursor-w-resize",
      "cursor-nw-resize",
    ],
    ne: [
      "cursor-ne-resize",
      "cursor-e-resize",
      "cursor-se-resize",
      "cursor-s-resize",
      "cursor-sw-resize",
      "cursor-w-resize",
      "cursor-nw-resize",
      "cursor-n-resize",
    ],
    e: [
      "cursor-e-resize",
      "cursor-se-resize",
      "cursor-s-resize",
      "cursor-sw-resize",
      "cursor-w-resize",
      "cursor-nw-resize",
      "cursor-n-resize",
      "cursor-ne-resize",
    ],
    se: [
      "cursor-se-resize",
      "cursor-s-resize",
      "cursor-sw-resize",
      "cursor-w-resize",
      "cursor-nw-resize",
      "cursor-n-resize",
      "cursor-ne-resize",
      "cursor-e-resize",
    ],
    s: [
      "cursor-s-resize",
      "cursor-sw-resize",
      "cursor-w-resize",
      "cursor-nw-resize",
      "cursor-n-resize",
      "cursor-ne-resize",
      "cursor-e-resize",
      "cursor-se-resize",
    ],
    sw: [
      "cursor-sw-resize",
      "cursor-w-resize",
      "cursor-nw-resize",
      "cursor-n-resize",
      "cursor-ne-resize",
      "cursor-e-resize",
      "cursor-se-resize",
      "cursor-s-resize",
    ],
    w: [
      "cursor-w-resize",
      "cursor-nw-resize",
      "cursor-n-resize",
      "cursor-ne-resize",
      "cursor-e-resize",
      "cursor-se-resize",
      "cursor-s-resize",
      "cursor-sw-resize",
    ],
  };

  const cursorIndex = Math.round(normalizedRotation / 45) % 8;
  return (
    rotationMap[direction as keyof typeof rotationMap]?.[cursorIndex] ||
    "cursor-pointer"
  );
};

/**
 * Get element container styles
 */
export const getElementContainerStyles = (
  element: any,
  zoom: number
): React.CSSProperties => {
  return {
    left: `${element.x}px`,
    top: `${element.y}px`,
    width: `${element.width}px`,
    height: `${element.height}px`,
    backgroundColor:
      element.type === "rectangle" ? element.color : "transparent",
    zIndex: element.inIsolatedGroup ? 10 : element.isolated ? 5 : 1,
    borderRadius:
      element.type === "rectangle" || element.type === "group"
        ? `${element.cornerRadius || 0}px`
        : undefined,
    borderWidth:
      element.type !== "image"
        ? element.borderWidth ??
          (element.type === "group" && element.selected ? 1 : 0)
        : 0,
    borderStyle:
      element.type !== "image" &&
      (element.borderWidth || (element.type === "group" && element.selected))
        ? element.type === "group" && element.selected
          ? "dashed"
          : "solid"
        : undefined,
    borderColor:
      element.type !== "image"
        ? element.borderColor ??
          (element.type === "group" && element.selected
            ? "#121268"
            : "transparent")
        : undefined,
    // Only apply shadow to non-image elements (images get shadow applied directly)
    boxShadow:
      element.type !== "image" && element.shadowBlur
        ? `0px 0px ${element.shadowBlur}px ${element.shadowColor}`
        : undefined,
    transform: element.rotation ? `rotate(${element.rotation}deg)` : undefined,
    transformOrigin: "center center",
  };
};

/**
 * Get element container CSS classes
 */
export const getElementContainerClasses = (element: any) => {
  const baseClasses = ["absolute", "transition-opacity", "duration-300"];

  // Cursor changes based on isolation mode and selection ability
  if (element.isInIsolationMode && !element.isSelectableInIsolation) {
    baseClasses.push("cursor-not-allowed");
  } else if (element.parentId && !element.isInIsolationMode) {
    baseClasses.push("cursor-pointer"); // Child elements should show they'll select the parent
  } else {
    baseClasses.push("cursor-move");
  }

  // Opacity for isolation mode - show all elements but make non-isolated ones transparent
  if (element.isInIsolationMode && !element.isSelectableInIsolation) {
    baseClasses.push("opacity-30");
  }

  if (element.inIsolatedGroup) {
    baseClasses.push("opacity-100");
  }

  return baseClasses.join(" ");
};

/**
 * Get image element styles
 */
export const getImageStyles = (element: any): React.CSSProperties => {
  return {
    borderRadius: `${element.cornerRadius || 0}px`,
    borderWidth: element.borderWidth ?? 0,
    borderStyle: element.borderWidth ? "solid" : undefined,
    borderColor: element.borderColor ?? "transparent",
    boxSizing: "border-box",
    // Apply shadow to image elements so it follows the border radius
    boxShadow: element.shadowBlur
      ? `0px 0px ${element.shadowBlur}px ${element.shadowColor}`
      : undefined,
  };
};

/**
 * Get group label styles
 */
export const getGroupLabelStyles = (
  element: any,
  zoom: number
): React.CSSProperties => {
  return {
    fontSize: "10px",
    transform: `scale(${100 / zoom})`,
    transformOrigin: "left bottom",
  };
};

/**
 * Calculate handle positions and styles
 */
export const getResizeHandleStyles = (
  element: any,
  zoom: number,
  direction: string
): React.CSSProperties => {
  const scaleFactor = 100 / zoom;

  // Handle dimensions in pre-scaled pixels (rem values converted to px, e.g., w-2 -> 8px)
  let handleWidth = 8;
  let handleHeight = 8;
  if (direction === "n" || direction === "s") {
    handleWidth = 16;
  } else if (direction === "e" || direction === "w") {
    handleHeight = 16;
  }

  // The final, on-screen dimensions of the handle after scaling
  const scaledWidth = handleWidth * scaleFactor;
  const scaledHeight = handleHeight * scaleFactor;

  let left = 0;
  let top = 0;

  // Position the handle's CENTER on the desired point of the selection box.
  // We calculate the required top-left position to achieve this.
  if (direction.includes("w")) {
    left = -element.width / 2 - scaledWidth / 2;
  } else if (direction.includes("e")) {
    left = element.width / 2 - scaledWidth / 2;
  } else {
    // For n and s handles, center horizontally
    left = 0 - scaledWidth / 2;
  }

  if (direction.includes("n")) {
    top = -element.height / 2 - scaledHeight / 2;
  } else if (direction.includes("s")) {
    top = element.height / 2 - scaledHeight / 2;
  } else {
    // For w and e handles, center vertically
    top = 0 - scaledHeight / 2;
  }

  return {
    left: `${left}px`,
    top: `${top}px`,
    transform: `scale(${scaleFactor})`,
    transformOrigin: "top left", // Scale from top-left, so the `left` and `top` properties are not affected by the scale.
    pointerEvents: "auto",
    zIndex: 9998,
  };
};

/**
 * Get font scale handle styles for text elements
 */
export const getFontScaleHandleStyles = (
  element: any,
  zoom: number
): React.CSSProperties => {
  const scaleFactor = 100 / zoom;

  return {
    left: `${element.width / 2 - (6.25 - 1 / 2) * scaleFactor}px`,
    top: `${element.height / 2 - (6.25 - 1 / 2) * scaleFactor}px`,
    transform: `scale(${scaleFactor})`,
    transformOrigin: "top left",
    pointerEvents: "auto",
    zIndex: 9998,
  };
};

/**
 * Get rotation handle styles
 */
export const getRotationHandleStyles = (
  element: any,
  zoom: number,
  position: "tl" | "tr" | "bl" | "br"
): React.CSSProperties => {
  const scaleFactor = 100 / zoom;
  const handleSize = 8; // 32px handle size
  const offset = 16 + 4; // 20px offset from element edge

  let left = 0;
  let top = 0;

  switch (position) {
    case "tl":
      left = -element.width / 2 - offset * scaleFactor;
      top = -element.height / 2 - offset * scaleFactor;
      break;
    case "tr":
      left = element.width / 2 - (handleSize - 4) * scaleFactor;
      top = -element.height / 2 - offset * scaleFactor;
      break;
    case "bl":
      left = -element.width / 2 - offset * scaleFactor;
      top = element.height / 2 - (handleSize - 4) * scaleFactor;
      break;
    case "br":
      left = element.width / 2 - (handleSize - 4) * scaleFactor;
      top = element.height / 2 - (handleSize - 4) * scaleFactor;
      break;
  }

  return {
    left: `${left}px`,
    top: `${top}px`,
    transform: `scale(${scaleFactor})`,
    transformOrigin: "top left",
    pointerEvents: "auto",
    zIndex: 9997,
  };
};

/**
 * Get corner radius handle styles
 */
export const getCornerRadiusHandleStyles = (
  element: any,
  zoom: number
): React.CSSProperties => {
  const scaleFactor = 100 / zoom;
  const cornerRadius = element.cornerRadius || 0;

  return {
    left: `${
      -element.width / 2 +
      Math.min(cornerRadius, element.width / 2, element.height / 2)
    }px`,
    top: `${
      -element.height / 2 +
      Math.min(cornerRadius, element.width / 2, element.height / 2)
    }px`,
    transform: `scale(${scaleFactor}) translate(-50%, -50%)`,
    transformOrigin: "top left",
    pointerEvents: "auto",
    zIndex: 9999,
  };
};

/**
 * Get selection container styles
 */
export const getSelectionContainerStyles = (
  element: any
): React.CSSProperties => {
  return {
    left: `${element.x + element.width / 2}px`,
    top: `${element.y + element.height / 2}px`,
    transform: element.rotation ? `rotate(${element.rotation}deg)` : undefined,
    transformOrigin: "center center",
    zIndex: 49,
  };
};

/**
 * Get selection border styles
 */
export const getSelectionBorderStyles = (
  element: any,
  zoom: number
): React.CSSProperties => {
  const scaleFactor = 100 / zoom;

  return {
    left: `${-element.width / 2 - 1 * scaleFactor}px`,
    top: `${-element.height / 2 - 1 * scaleFactor}px`,
    width: `${element.width + 1 * scaleFactor * 2}px`,
    height: `${element.height + 1 * scaleFactor * 2}px`,
    borderWidth: 1 * scaleFactor,
    zIndex: 9996,
  };
};

/**
 * Get rotation indicator styles
 */
export const getRotationIndicatorStyles = (
  element: any,
  zoom: number
): React.CSSProperties => {
  const scaleFactor = 100 / zoom;

  return {
    left: "0px",
    top: `${-element.height / 2 - 34 * scaleFactor}px`,
    transform: `scale(${scaleFactor}) translate(-50%, 0)`,
    transformOrigin: "top left",
    zIndex: 9999,
  };
};
