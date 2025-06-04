import { CanvasElementData } from "../types";
import type { Project } from "@/lib/project-storage";

/**
 * Service for validating canvas state and operations
 * Extracted from useCanvasStore to separate business logic from state management
 */

export interface ValidationResult {
  isValid: boolean;
  issues: string[];
}

export interface ProjectValidationState {
  projectId: string | null;
  projectName: string;
  elements: CanvasElementData[];
}

/**
 * Validate a single canvas element
 */
export const validateElement = (
  element: CanvasElementData
): ValidationResult => {
  const issues: string[] = [];

  // Basic validation
  if (!element.id) issues.push("Element missing ID");
  if (!element.type) issues.push("Element missing type");

  // Dimension validation
  if (typeof element.x !== "number" || isNaN(element.x)) {
    issues.push("Element has invalid x position");
  }
  if (typeof element.y !== "number" || isNaN(element.y)) {
    issues.push("Element has invalid y position");
  }
  if (typeof element.width !== "number" || element.width <= 0) {
    issues.push("Element has invalid width");
  }
  if (typeof element.height !== "number" || element.height <= 0) {
    issues.push("Element has invalid height");
  }

  // Type-specific validation
  switch (element.type) {
    case "text":
      if (!element.content && element.content !== "") {
        issues.push("Text element missing content");
      }
      if (
        element.fontSize &&
        (element.fontSize < 1 || element.fontSize > 1000)
      ) {
        issues.push("Text element has invalid font size");
      }
      break;

    case "image":
      if (!element.src) {
        issues.push("Image element missing src");
      }
      break;

    case "group":
      if (!Array.isArray(element.children)) {
        issues.push("Group element missing children array");
      }
      break;
  }

  // Color validation
  if (element.color && typeof element.color !== "string") {
    issues.push("Element has invalid color");
  }

  // Rotation validation
  if (
    element.rotation !== undefined &&
    (typeof element.rotation !== "number" || isNaN(element.rotation))
  ) {
    issues.push("Element has invalid rotation");
  }

  return {
    isValid: issues.length === 0,
    issues,
  };
};

/**
 * Validate all canvas elements
 */
export const validateElements = (
  elements: CanvasElementData[]
): ValidationResult => {
  const allIssues: string[] = [];
  const elementIds = new Set<string>();

  elements.forEach((element, index) => {
    // Check for duplicate IDs
    if (elementIds.has(element.id)) {
      allIssues.push(`Duplicate element ID: ${element.id}`);
    } else {
      elementIds.add(element.id);
    }

    // Validate individual element
    const elementValidation = validateElement(element);
    if (!elementValidation.isValid) {
      allIssues.push(
        ...elementValidation.issues.map(
          (issue) => `Element ${index} (${element.id}): ${issue}`
        )
      );
    }
  });

  // Validate parent-child relationships
  elements.forEach((element) => {
    if (element.parentId && !elementIds.has(element.parentId)) {
      allIssues.push(
        `Element ${element.id} has invalid parent ID: ${element.parentId}`
      );
    }

    if (element.type === "group" && element.children) {
      element.children.forEach((childId) => {
        if (!elementIds.has(childId)) {
          allIssues.push(
            `Group ${element.id} has invalid child ID: ${childId}`
          );
        }
      });
    }
  });

  return {
    isValid: allIssues.length === 0,
    issues: allIssues,
  };
};

/**
 * Validate project state
 */
export const validateProjectState = (
  state: ProjectValidationState
): ValidationResult => {
  const issues: string[] = [];

  if (!state.projectId) {
    issues.push("Missing project ID");
  }

  if (!state.projectName || state.projectName.trim() === "") {
    issues.push("Missing or empty project name");
  }

  // Validate elements
  const elementsValidation = validateElements(state.elements);
  if (!elementsValidation.isValid) {
    issues.push(...elementsValidation.issues);
  }

  return {
    isValid: issues.length === 0,
    issues,
  };
};

/**
 * Validate artboard dimensions
 */
export const validateArtboardDimensions = (dimensions: {
  width: number;
  height: number;
}): ValidationResult => {
  const issues: string[] = [];

  if (typeof dimensions.width !== "number" || dimensions.width <= 0) {
    issues.push("Invalid artboard width");
  }

  if (typeof dimensions.height !== "number" || dimensions.height <= 0) {
    issues.push("Invalid artboard height");
  }

  // Check reasonable bounds
  if (dimensions.width > 10000 || dimensions.height > 10000) {
    issues.push("Artboard dimensions are too large");
  }

  if (dimensions.width < 100 || dimensions.height < 100) {
    issues.push("Artboard dimensions are too small");
  }

  return {
    isValid: issues.length === 0,
    issues,
  };
};

/**
 * Validate project data format
 */
export const validateProjectData = (project: Project): ValidationResult => {
  const issues: string[] = [];

  if (!project.id) issues.push("Project missing ID");
  if (!project.name) issues.push("Project missing name");
  if (!project.data) issues.push("Project missing data");

  if (project.data) {
    if (!Array.isArray(project.data.elements)) {
      issues.push("Project data missing elements array");
    } else {
      const elementsValidation = validateElements(project.data.elements);
      if (!elementsValidation.isValid) {
        issues.push(...elementsValidation.issues);
      }
    }

    if (!project.data.artboardDimensions) {
      issues.push("Project data missing artboard dimensions");
    } else {
      const dimensionsValidation = validateArtboardDimensions(
        project.data.artboardDimensions
      );
      if (!dimensionsValidation.isValid) {
        issues.push(...dimensionsValidation.issues);
      }
    }
  }

  return {
    isValid: issues.length === 0,
    issues,
  };
};

/**
 * Validate canvas operation parameters
 */
export const validateOperation = (
  operation: string,
  params: Record<string, any>
): ValidationResult => {
  const issues: string[] = [];

  switch (operation) {
    case "move":
      if (typeof params.deltaX !== "number" || isNaN(params.deltaX)) {
        issues.push("Invalid deltaX for move operation");
      }
      if (typeof params.deltaY !== "number" || isNaN(params.deltaY)) {
        issues.push("Invalid deltaY for move operation");
      }
      break;

    case "resize":
      if (typeof params.width !== "number" || params.width <= 0) {
        issues.push("Invalid width for resize operation");
      }
      if (typeof params.height !== "number" || params.height <= 0) {
        issues.push("Invalid height for resize operation");
      }
      break;

    case "rotate":
      if (typeof params.rotation !== "number" || isNaN(params.rotation)) {
        issues.push("Invalid rotation for rotate operation");
      }
      break;

    case "updateProperty":
      if (!params.property) {
        issues.push("Missing property name for update operation");
      }
      if (params.value === undefined) {
        issues.push("Missing value for update operation");
      }
      break;
  }

  return {
    isValid: issues.length === 0,
    issues,
  };
};

/**
 * Check if element is within artboard bounds
 */
export const validateElementBounds = (
  element: CanvasElementData,
  artboardDimensions: { width: number; height: number }
): ValidationResult => {
  const issues: string[] = [];

  if (element.x < 0) {
    issues.push("Element extends beyond left artboard boundary");
  }

  if (element.y < 0) {
    issues.push("Element extends beyond top artboard boundary");
  }

  if (element.x + element.width > artboardDimensions.width) {
    issues.push("Element extends beyond right artboard boundary");
  }

  if (element.y + element.height > artboardDimensions.height) {
    issues.push("Element extends beyond bottom artboard boundary");
  }

  return {
    isValid: issues.length === 0,
    issues,
  };
};
