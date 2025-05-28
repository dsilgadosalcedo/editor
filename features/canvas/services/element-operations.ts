import { CanvasElementData, ElementType } from "../types";

/**
 * Service for element creation and basic operations
 * Extracted from useCanvasStore to separate business logic from state management
 */

export interface CreateElementOptions {
  artboardWidth: number;
  artboardHeight: number;
  position?: { x: number; y: number };
}

export interface CreateImageElementOptions extends CreateElementOptions {
  src: string;
  maxWidth?: number;
  maxHeight?: number;
}

/**
 * Create a new canvas element with default properties
 */
export const createElement = (
  type: ElementType,
  options: CreateElementOptions
): CanvasElementData => {
  const { artboardWidth, artboardHeight, position } = options;
  const id = `${type}-${Date.now()}`;

  const baseElement = {
    id,
    type,
    selected: true,
    visible: true,
    rotation: 0,
  };

  switch (type) {
    case "rectangle":
      return {
        ...baseElement,
        type: "rectangle",
        x: position?.x ?? Math.round(artboardWidth / 2 - 75),
        y: position?.y ?? Math.round(artboardHeight / 2 - 37.5),
        width: 150,
        height: 75,
        color: "#3b82f6",
      };

    case "text":
      return {
        ...baseElement,
        type: "text",
        x: position?.x ?? Math.round(artboardWidth / 2 - 50),
        y: position?.y ?? Math.round(artboardHeight / 2 - 10),
        width: 100,
        height: 20,
        content: "Text",
        color: "#000000",
        fontSize: 16,
        fontWeight: 400,
        letterSpacing: 0,
        lineHeight: 20,
        horizontalAlign: "left" as const,
        verticalAlign: "top" as const,
        textResizing: "auto-width" as const,
      };

    case "image":
      return {
        ...baseElement,
        type: "image",
        x: position?.x ?? Math.round(artboardWidth / 2 - 75),
        y: position?.y ?? Math.round(artboardHeight / 2 - 56),
        width: 150,
        height: 112,
        src: "https://picsum.photos/150/112?random=" + Date.now(),
        color: "transparent",
      };

    case "group":
      return {
        ...baseElement,
        type: "group",
        x: position?.x ?? Math.round(artboardWidth / 2 - 100),
        y: position?.y ?? Math.round(artboardHeight / 2 - 75),
        width: 200,
        height: 150,
        color: "transparent",
        borderWidth: 1,
        borderColor: "#3b82f6",
        children: [],
        name: "Group",
      };

    default:
      throw new Error(`Invalid element type: ${type}`);
  }
};

/**
 * Create image element with automatic dimension calculation
 */
export const createImageElement = (
  options: CreateImageElementOptions
): Promise<CanvasElementData> => {
  return new Promise((resolve, reject) => {
    const {
      src,
      artboardWidth,
      artboardHeight,
      position,
      maxWidth = 400,
      maxHeight = 300,
    } = options;

    const img = new Image();

    img.onload = () => {
      // Calculate dimensions maintaining aspect ratio
      let width = img.naturalWidth;
      let height = img.naturalHeight;

      if (width > maxWidth || height > maxHeight) {
        const scale = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * scale);
        height = Math.round(height * scale);
      }

      const element: CanvasElementData = {
        id: `image-${Date.now()}`,
        type: "image",
        x: position?.x ?? Math.round(artboardWidth / 2 - width / 2),
        y: position?.y ?? Math.round(artboardHeight / 2 - height / 2),
        width,
        height,
        src,
        color: "transparent",
        selected: true,
        visible: true,
        rotation: 0,
      };

      resolve(element);
    };

    img.onerror = () => {
      // Fallback if image fails to load
      const fallbackElement: CanvasElementData = {
        id: `image-${Date.now()}`,
        type: "image",
        x: position?.x ?? Math.round(artboardWidth / 2 - 75),
        y: position?.y ?? Math.round(artboardHeight / 2 - 56),
        width: 150,
        height: 112,
        src,
        color: "transparent",
        selected: true,
        visible: true,
        rotation: 0,
      };

      resolve(fallbackElement);
    };

    img.src = src;
  });
};

/**
 * Update element properties
 */
export const updateElementProperties = (
  element: CanvasElementData,
  updates: Partial<CanvasElementData>
): CanvasElementData => {
  return { ...element, ...updates };
};

/**
 * Validate element data
 */
export const validateElement = (element: CanvasElementData): boolean => {
  if (!element.id || !element.type) return false;
  if (element.width <= 0 || element.height <= 0) return false;
  if (typeof element.x !== "number" || typeof element.y !== "number")
    return false;

  // Type-specific validations
  if (element.type === "text" && !element.content) return false;
  if (element.type === "image" && !element.src) return false;

  return true;
};

/**
 * Get element center point
 */
export const getElementCenter = (
  element: CanvasElementData
): { x: number; y: number } => {
  return {
    x: element.x + element.width / 2,
    y: element.y + element.height / 2,
  };
};

/**
 * Check if point is inside element bounds
 */
export const isPointInsideElement = (
  point: { x: number; y: number },
  element: CanvasElementData
): boolean => {
  return (
    point.x >= element.x &&
    point.x <= element.x + element.width &&
    point.y >= element.y &&
    point.y <= element.y + element.height
  );
};
