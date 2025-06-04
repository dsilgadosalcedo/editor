/**
 * Helper function to calculate new element properties when resizing a rotated element
 */
export const calculateRotatedResize = (
  element: {
    x: number;
    y: number;
    width: number;
    height: number;
    rotation?: number;
  },
  resizeDir: string,
  newWidth: number,
  newHeight: number
) => {
  const rotation = element.rotation || 0;

  // For non-rotated elements, use the normal position adjustment logic
  if (!rotation) {
    let newX = element.x;
    let newY = element.y;

    switch (resizeDir) {
      case "w":
      case "nw":
      case "sw":
        newX = element.x + (element.width - newWidth);
        break;
    }

    switch (resizeDir) {
      case "n":
      case "nw":
      case "ne":
        newY = element.y + (element.height - newHeight);
        break;
    }

    return {
      x: newX,
      y: newY,
      width: newWidth,
      height: newHeight,
      shouldMove: true,
    };
  }

  // For rotated elements, don't adjust position - just resize from center
  // This prevents the unwanted movement while maintaining the resize functionality
  return {
    x: element.x,
    y: element.y,
    width: newWidth,
    height: newHeight,
    shouldMove: false,
  };
};

/**
 * Transform mouse deltas for rotated element resizing
 * This function adjusts the mouse movement deltas based on element rotation
 */
export const transformRotatedResize = (
  dx: number,
  dy: number,
  direction: string,
  rotation: number
): { dx: number; dy: number } => {
  if (!rotation) {
    return { dx, dy };
  }

  // Convert rotation to radians
  const radians = (rotation * Math.PI) / 180;
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);

  // Apply inverse rotation to mouse deltas
  const transformedDx = dx * cos + dy * sin;
  const transformedDy = -dx * sin + dy * cos;

  return {
    dx: transformedDx,
    dy: transformedDy,
  };
};

/**
 * Helper function to get appropriate cursor for rotated resize handle
 */
export const getRotatedCursor = (direction: string, rotation: number) => {
  if (!rotation) {
    // Default cursors for non-rotated elements
    switch (direction) {
      case "nw":
        return "cursor-nw-resize";
      case "ne":
        return "cursor-ne-resize";
      case "sw":
        return "cursor-sw-resize";
      case "se":
        return "cursor-se-resize";
      default:
        return "cursor-pointer";
    }
  }

  // For rotated elements, calculate the effective direction
  // Normalize rotation to 0-360 range
  const normalizedRotation = ((rotation % 360) + 360) % 360;

  // Map direction based on rotation in 45-degree increments
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
  };

  const cursorIndex = Math.round(normalizedRotation / 45) % 8;
  return (
    rotationMap[direction as keyof typeof rotationMap]?.[cursorIndex] ||
    "cursor-pointer"
  );
};
