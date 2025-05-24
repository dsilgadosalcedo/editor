import { CanvasElementData } from "@/features/canvas/store/useCanvasStore";

/**
 * Utility functions for copying canvas elements to Figma-compatible formats
 * Supports SVG, PNG, and text representations for maximum compatibility
 */

export interface FigmaClipboardOptions {
  includeBackground?: boolean;
  padding?: number;
  scale?: number;
}

/**
 * Utility function to escape XML special characters
 */
const escapeXml = (text: string): string => {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
};

/**
 * Convert a single canvas element to SVG
 */
export const elementToSVG = (element: CanvasElementData): string => {
  const { type } = element;

  switch (type) {
    case "rectangle":
      return createRectangleSVG(element);
    case "text":
      return createTextSVG(element);
    case "image":
      return createImageSVG(element);
    default:
      return "";
  }
};

/**
 * Create SVG for rectangle elements
 */
const createRectangleSVG = (element: CanvasElementData): string => {
  const {
    x,
    y,
    width,
    height,
    color,
    borderWidth = 0,
    borderColor = "#000000",
    cornerRadius = 0,
    shadowBlur = 0,
    shadowColor = "#000000",
  } = element;

  let svgContent = "";

  // Add shadow if present
  if (shadowBlur > 0) {
    const shadowId = `shadow-${element.id}`;
    svgContent += `
      <defs>
        <filter id="${shadowId}" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="2" dy="2" stdDeviation="${
            shadowBlur / 2
          }" flood-color="${shadowColor}" flood-opacity="0.3"/>
        </filter>
      </defs>`;
  }

  // Create the rectangle
  svgContent += `<rect 
    x="${x}" 
    y="${y}" 
    width="${width}" 
    height="${height}" 
    fill="${color}"
    ${
      borderWidth > 0
        ? `stroke="${borderColor}" stroke-width="${borderWidth}"`
        : ""
    }
    ${cornerRadius > 0 ? `rx="${cornerRadius}" ry="${cornerRadius}"` : ""}
    ${shadowBlur > 0 ? `filter="url(#shadow-${element.id})"` : ""}
  />`;

  return svgContent;
};

/**
 * Create SVG for text elements
 */
const createTextSVG = (element: CanvasElementData): string => {
  const {
    x,
    y,
    width,
    height,
    color,
    content = "Text",
    fontSize = 16,
    fontWeight = 400,
    horizontalAlign = "left",
    verticalAlign = "top",
  } = element;

  // Calculate text position based on alignment
  let textX = x;
  let textY = y;
  let textAnchor = "start";
  let dominantBaseline = "hanging";

  // Horizontal alignment
  switch (horizontalAlign) {
    case "center":
      textX = x + width / 2;
      textAnchor = "middle";
      break;
    case "right":
      textX = x + width;
      textAnchor = "end";
      break;
  }

  // Vertical alignment
  switch (verticalAlign) {
    case "middle":
      textY = y + height / 2;
      dominantBaseline = "central";
      break;
    case "bottom":
      textY = y + height;
      dominantBaseline = "text-after-edge";
      break;
  }

  return `<text 
    x="${textX}" 
    y="${textY}" 
    fill="${color}"
    font-size="${fontSize}"
    font-weight="${fontWeight}"
    text-anchor="${textAnchor}"
    dominant-baseline="${dominantBaseline}"
  >${escapeXml(content)}</text>`;
};

/**
 * Create SVG for image elements
 */
const createImageSVG = (element: CanvasElementData): string => {
  const { x, y, width, height, src } = element;

  if (!src) {
    // Fallback for images without src - create a placeholder rectangle
    return `<rect 
      x="${x}" 
      y="${y}" 
      width="${width}" 
      height="${height}" 
      fill="#f3f4f6" 
      stroke="#d1d5db" 
      stroke-width="1"
      stroke-dasharray="5,5"
    />
    <text 
      x="${x + width / 2}" 
      y="${y + height / 2}" 
      fill="#6b7280"
      font-size="12"
      text-anchor="middle"
      dominant-baseline="central"
    >Image</text>`;
  }

  return `<image 
    x="${x}" 
    y="${y}" 
    width="${width}" 
    height="${height}" 
    href="${src}"
  />`;
};

/**
 * Convert multiple canvas elements to a single SVG
 */
export const elementsToSVG = (
  elements: CanvasElementData[],
  options: {
    includeBackground?: boolean;
    backgroundColor?: string;
    padding?: number;
    scale?: number;
  } = {}
): string => {
  if (elements.length === 0) return "";

  const {
    includeBackground = false,
    backgroundColor = "#ffffff",
    padding = 20,
    scale = 1,
  } = options;

  // Calculate bounding box
  const bounds = calculateBounds(elements);
  const svgWidth = (bounds.width + padding * 2) * scale;
  const svgHeight = (bounds.height + padding * 2) * scale;

  // Adjust element positions relative to the bounding box
  const adjustedElements = elements.map((element) => ({
    ...element,
    x: (element.x - bounds.minX + padding) * scale,
    y: (element.y - bounds.minY + padding) * scale,
    width: element.width * scale,
    height: element.height * scale,
    fontSize: element.fontSize ? element.fontSize * scale : undefined,
  }));

  // Generate SVG content
  let svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${svgWidth}" height="${svgHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}" xmlns="http://www.w3.org/2000/svg">`;

  // Add background if requested
  if (includeBackground) {
    svgContent += `
  <rect width="100%" height="100%" fill="${backgroundColor}"/>`;
  }

  // Add all elements
  adjustedElements.forEach((element) => {
    svgContent += `
  ${elementToSVG(element)}`;
  });

  svgContent += `
</svg>`;

  return svgContent;
};

/**
 * Calculate bounding box for multiple elements
 */
const calculateBounds = (elements: CanvasElementData[]) => {
  if (elements.length === 0) {
    return { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0 };
  }

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  elements.forEach((element) => {
    minX = Math.min(minX, element.x);
    minY = Math.min(minY, element.y);
    maxX = Math.max(maxX, element.x + element.width);
    maxY = Math.max(maxY, element.y + element.height);
  });

  return {
    minX,
    minY,
    maxX,
    maxY,
    width: maxX - minX,
    height: maxY - minY,
  };
};

/**
 * Check if the browser supports the Clipboard API
 */
export const isClipboardSupported = (): boolean => {
  return (
    typeof navigator !== "undefined" &&
    "clipboard" in navigator &&
    "write" in navigator.clipboard
  );
};

/**
 * Check if the browser supports SVG in clipboard
 */
export const isSVGClipboardSupported = (): boolean => {
  return (
    isClipboardSupported() &&
    "ClipboardItem" in window &&
    "supports" in ClipboardItem &&
    ClipboardItem.supports("image/svg+xml")
  );
};

/**
 * Copy elements to clipboard in Figma-compatible format
 */
export const copyToFigmaClipboard = async (
  elements: CanvasElementData[],
  options: {
    includeBackground?: boolean;
    backgroundColor?: string;
    padding?: number;
    scale?: number;
  } = {}
): Promise<void> => {
  if (!isClipboardSupported()) {
    throw new Error("Clipboard API is not supported in this browser");
  }

  if (elements.length === 0) {
    throw new Error("No elements to copy");
  }

  const svgContent = elementsToSVG(elements, options);

  // Create multiple clipboard formats for maximum compatibility
  const clipboardItems: Record<string, Blob> = {};

  // SVG format (preferred by Figma)
  if (isSVGClipboardSupported()) {
    clipboardItems["image/svg+xml"] = new Blob([svgContent], {
      type: "image/svg+xml",
    });
  }

  // HTML format (fallback)
  const htmlContent = `<div>${svgContent}</div>`;
  clipboardItems["text/html"] = new Blob([htmlContent], {
    type: "text/html",
  });

  // Plain text format (last resort)
  clipboardItems["text/plain"] = new Blob([svgContent], {
    type: "text/plain",
  });

  try {
    await navigator.clipboard.write([new ClipboardItem(clipboardItems)]);
  } catch (error) {
    console.error("Failed to copy to clipboard:", error);
    throw new Error("Failed to copy to clipboard");
  }
};
