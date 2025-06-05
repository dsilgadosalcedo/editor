import { CanvasElementData, ElementType } from "../types";
import { generateRandomImage } from "./image-service";

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
    case "rectangle": {
      const width = 150;
      const height = 75;
      return {
        ...baseElement,
        type: "rectangle",
        x: position
          ? Math.round(position.x - width / 2)
          : Math.round(artboardWidth / 2 - width / 2),
        y: position
          ? Math.round(position.y - height / 2)
          : Math.round(artboardHeight / 2 - height / 2),
        width,
        height,
        color: "#121268",
      };
    }

    case "text": {
      const width = 100;
      const height = 20;
      return {
        ...baseElement,
        type: "text",
        x: position
          ? Math.round(position.x - width / 2)
          : Math.round(artboardWidth / 2 - width / 2),
        y: position
          ? Math.round(position.y - height / 2)
          : Math.round(artboardHeight / 2 - height / 2),
        width,
        height,
        content: "",
        color: "#000000",
        fontSize: 16,
        fontWeight: 400,
        letterSpacing: 0,
        lineHeight: 20,
        horizontalAlign: "left" as const,
        verticalAlign: "top" as const,
        textResizing: "auto-width" as const,
      };
    }

    case "image": {
      const width = 150;
      const height = 112;
      return {
        ...baseElement,
        type: "image",
        x: position
          ? Math.round(position.x - width / 2)
          : Math.round(artboardWidth / 2 - width / 2),
        y: position
          ? Math.round(position.y - height / 2)
          : Math.round(artboardHeight / 2 - height / 2),
        width,
        height,
        src: generateRandomImage({ width, height }),
        color: "transparent",
      };
    }

    case "group": {
      const width = 200;
      const height = 150;
      return {
        ...baseElement,
        type: "group",
        x: position
          ? Math.round(position.x - width / 2)
          : Math.round(artboardWidth / 2 - width / 2),
        y: position
          ? Math.round(position.y - height / 2)
          : Math.round(artboardHeight / 2 - height / 2),
        width,
        height,
        color: "transparent",
        borderWidth: 1,
        borderColor: "#3b82f6",
        children: [],
        name: "Group",
      };
    }

    default:
      throw new Error(`Invalid element type: ${type}`);
  }
};

/**
 * Create image element immediately with placeholder dimensions
 */
export const createImageElementImmediate = (
  options: CreateImageElementOptions
): CanvasElementData => {
  const { src, artboardWidth, artboardHeight, position } = options;

  // Create placeholder with standard dimensions
  const placeholderWidth = 300;
  const placeholderHeight = 200;

  const element: CanvasElementData = {
    id: `image-${Date.now()}`,
    type: "image",
    x: position
      ? Math.round(position.x - placeholderWidth / 2)
      : Math.round(artboardWidth / 2 - placeholderWidth / 2),
    y: position
      ? Math.round(position.y - placeholderHeight / 2)
      : Math.round(artboardHeight / 2 - placeholderHeight / 2),
    width: placeholderWidth,
    height: placeholderHeight,
    src,
    color: "transparent",
    selected: true,
    visible: true,
    rotation: 0,
    loading: true, // Mark as loading
  };

  return element;
};

/**
 * Load image and return updated dimensions
 */
export const loadImageDimensions = (
  src: string,
  maxWidth = 400,
  maxHeight = 300
): Promise<{ width: number; height: number; src: string }> => {
  return new Promise((resolve, reject) => {
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

      resolve({ width, height, src });
    };

    img.onerror = () => {
      // Fallback dimensions if image fails to load
      resolve({ width: 300, height: 200, src });
    };

    img.src = src;
  });
};

/**
 * Create image element with automatic dimension calculation (legacy)
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
        x: position
          ? Math.round(position.x - width / 2)
          : Math.round(artboardWidth / 2 - width / 2),
        y: position
          ? Math.round(position.y - height / 2)
          : Math.round(artboardHeight / 2 - height / 2),
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
      const fallbackWidth = 150;
      const fallbackHeight = 112;
      const fallbackElement: CanvasElementData = {
        id: `image-${Date.now()}`,
        type: "image",
        x: position
          ? Math.round(position.x - fallbackWidth / 2)
          : Math.round(artboardWidth / 2 - fallbackWidth / 2),
        y: position
          ? Math.round(position.y - fallbackHeight / 2)
          : Math.round(artboardHeight / 2 - fallbackHeight / 2),
        width: fallbackWidth,
        height: fallbackHeight,
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
