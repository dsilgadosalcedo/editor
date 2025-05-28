/**
 * File operations service for canvas
 * Handles canvas import, export, and file processing logic
 */

import { CanvasElementData, SavedCanvasData } from "../types";

export interface CanvasExportData {
  elements: CanvasElementData[];
  artboardDimensions: { width: number; height: number };
  version: string;
  timestamp: number;
}

export interface ImportResult {
  success: boolean;
  importedCount?: number;
  error?: string;
  elements?: CanvasElementData[];
  artboardDimensions?: { width: number; height: number };
  version?: string;
  timestamp?: number;
}

/**
 * Export canvas data to JSON format
 */
export const exportCanvasToJSON = (
  elements: CanvasElementData[],
  artboardDimensions: { width: number; height: number },
  filename?: string
): void => {
  try {
    const exportData: CanvasExportData = {
      elements,
      artboardDimensions,
      version: "1.0.0",
      timestamp: Date.now(),
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(dataBlob);
    link.download = filename || `canvas-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up
    URL.revokeObjectURL(link.href);
  } catch (error) {
    console.error("Error exporting canvas:", error);
    throw new Error("Failed to export canvas");
  }
};

/**
 * Import canvas data from JSON file
 */
export const importCanvasFromFile = async (
  file: File
): Promise<ImportResult> => {
  try {
    if (!file.type.includes("json")) {
      return {
        success: false,
        error: "File must be a JSON file",
      };
    }

    const text = await file.text();
    const data = JSON.parse(text);

    // Validate the imported data structure
    if (!data.elements || !Array.isArray(data.elements)) {
      return {
        success: false,
        error: "Invalid canvas file format - missing elements array",
      };
    }

    if (
      !data.artboardDimensions ||
      typeof data.artboardDimensions !== "object"
    ) {
      return {
        success: false,
        error: "Invalid canvas file format - missing artboard dimensions",
      };
    }

    // Regenerate IDs to avoid conflicts using crypto.randomUUID or fallback
    const generateId = () => {
      if (typeof crypto !== "undefined" && crypto.randomUUID) {
        return crypto.randomUUID();
      }
      return Math.random().toString(36).substring(2) + Date.now().toString(36);
    };

    const elementsWithNewIds = data.elements.map((element: any) => ({
      ...element,
      id: generateId(),
      selected: false, // Ensure imported elements aren't selected
    }));

    return {
      success: true,
      importedCount: elementsWithNewIds.length,
      elements: elementsWithNewIds,
      artboardDimensions: data.artboardDimensions,
      version: data.version,
      timestamp: data.timestamp,
    };
  } catch (error) {
    console.error("Error importing canvas:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to import canvas",
    };
  }
};

/**
 * Convert canvas to SVG format
 */
export const exportCanvasToSVG = (
  elements: CanvasElementData[],
  artboardDimensions: { width: number; height: number },
  filename?: string
): void => {
  try {
    const svgContent = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${
        artboardDimensions.width
      }" height="${artboardDimensions.height}" viewBox="0 0 ${
      artboardDimensions.width
    } ${artboardDimensions.height}">
        ${elements
          .map((element) => {
            if (element.type === "rectangle") {
              return `<rect x="${element.x}" y="${element.y}" width="${
                element.width
              }" height="${element.height}" fill="${element.color}" rx="${
                element.cornerRadius || 0
              }" />`;
            } else if (element.type === "text") {
              return `<text x="${element.x}" y="${
                element.y + (element.fontSize || 16)
              }" font-size="${element.fontSize || 16}" fill="${
                element.color
              }">${element.content || ""}</text>`;
            } else if (element.type === "image" && element.src) {
              return `<image x="${element.x}" y="${element.y}" width="${element.width}" height="${element.height}" href="${element.src}" />`;
            }
            return "";
          })
          .join("")}
      </svg>
    `;

    const blob = new Blob([svgContent], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename || `canvas-${Date.now()}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error exporting SVG:", error);
    throw new Error("Failed to export SVG");
  }
};

/**
 * Process dropped image file for canvas import
 */
export const processImageFile = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("File must be an image"));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result === "string") {
        resolve(result);
      } else {
        reject(new Error("Failed to read image file"));
      }
    };
    reader.onerror = () => reject(new Error("Failed to read image file"));
    reader.readAsDataURL(file);
  });
};

/**
 * Validate canvas data structure
 */
export const validateCanvasData = (data: any): data is CanvasExportData => {
  return (
    data &&
    typeof data === "object" &&
    Array.isArray(data.elements) &&
    data.artboardDimensions &&
    typeof data.artboardDimensions.width === "number" &&
    typeof data.artboardDimensions.height === "number"
  );
};
