/**
 * Project operations service for canvas
 * Handles project loading, saving, and management logic
 */

import { CanvasElementData, SavedCanvasData } from "../types";

export interface ProjectData {
  projectId: string | null;
  projectName: string;
  elements: CanvasElementData[];
  artboardDimensions: { width: number; height: number };
}

export interface ProjectLoadResult {
  success: boolean;
  projectData?: ProjectData;
  error?: string;
}

/**
 * Prepare project data for saving
 */
export const prepareProjectForSave = (
  elements: CanvasElementData[],
  artboardDimensions: { width: number; height: number },
  projectName: string,
  projectId: string | null
): ProjectData => {
  // Clean up elements for saving - remove selected states and temporary properties
  const cleanElements = elements.map((element) => ({
    ...element,
    selected: false, // Don't save selection state
  }));

  return {
    projectId,
    projectName,
    elements: cleanElements,
    artboardDimensions,
  };
};

/**
 * Validate project data before loading
 */
export const validateProjectData = (data: any): data is ProjectData => {
  return (
    data &&
    typeof data === "object" &&
    typeof data.projectName === "string" &&
    Array.isArray(data.elements) &&
    data.artboardDimensions &&
    typeof data.artboardDimensions.width === "number" &&
    typeof data.artboardDimensions.height === "number"
  );
};

/**
 * Process loaded project data for canvas state
 */
export const processLoadedProject = (
  projectData: ProjectData
): {
  elements: CanvasElementData[];
  artboardDimensions: { width: number; height: number };
  projectName: string;
  projectId: string | null;
} => {
  // Ensure all elements have required properties and are not selected
  const processedElements = projectData.elements.map((element) => ({
    ...element,
    selected: false,
    // Ensure all required properties exist with defaults
    id: element.id,
    type: element.type,
    x: element.x || 0,
    y: element.y || 0,
    width: element.width || 100,
    height: element.height || 100,
    color: element.color || "#000000",
    rotation: element.rotation || 0,
    visible: element.visible !== false, // Default to true if not specified
  }));

  return {
    elements: processedElements,
    artboardDimensions: projectData.artboardDimensions,
    projectName: projectData.projectName,
    projectId: projectData.projectId,
  };
};

/**
 * Clear project state for new project
 */
export const getNewProjectState = (): {
  elements: CanvasElementData[];
  selectedElements: string[];
  projectName: string;
  projectId: string | null;
  artboardDimensions: { width: number; height: number };
  past: CanvasElementData[][];
  future: CanvasElementData[][];
  isolatedGroupId: string | null;
  isolationBreadcrumb: string[];
} => {
  return {
    elements: [],
    selectedElements: [],
    projectName: "Untitled Project",
    projectId: null,
    artboardDimensions: { width: 1024, height: 576 },
    past: [],
    future: [],
    isolatedGroupId: null,
    isolationBreadcrumb: [],
  };
};

/**
 * Generate unique project name
 */
export const generateProjectName = (existingNames: string[] = []): string => {
  const baseNames = [
    "Creative Project",
    "Design Workspace",
    "Canvas Creation",
    "New Artwork",
    "Design Board",
    "Visual Project",
    "Creative Canvas",
    "Art Board",
  ];

  const baseName = baseNames[Math.floor(Math.random() * baseNames.length)];

  // Check if base name is available
  if (!existingNames.includes(baseName)) {
    return baseName;
  }

  // Find next available numbered version
  let counter = 1;
  while (existingNames.includes(`${baseName} ${counter}`)) {
    counter++;
  }

  return `${baseName} ${counter}`;
};

/**
 * Check if project state is dirty (has unsaved changes)
 */
export const isProjectDirty = (
  currentElements: CanvasElementData[],
  savedElements: CanvasElementData[]
): boolean => {
  if (currentElements.length !== savedElements.length) {
    return true;
  }

  // Simple comparison - in a real app you might want more sophisticated comparison
  return JSON.stringify(currentElements) !== JSON.stringify(savedElements);
};

/**
 * Get project summary for display
 */
export const getProjectSummary = (
  elements: CanvasElementData[]
): {
  elementCount: number;
  textElementCount: number;
  rectangleCount: number;
  imageCount: number;
  groupCount: number;
} => {
  const summary = {
    elementCount: elements.length,
    textElementCount: 0,
    rectangleCount: 0,
    imageCount: 0,
    groupCount: 0,
  };

  elements.forEach((element) => {
    switch (element.type) {
      case "text":
        summary.textElementCount++;
        break;
      case "rectangle":
        summary.rectangleCount++;
        break;
      case "image":
        summary.imageCount++;
        break;
      case "group":
        summary.groupCount++;
        break;
    }
  });

  return summary;
};
