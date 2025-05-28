import type { Project } from "@/lib/project-storage";

/**
 * Service for validating project data and operations
 * Extracted from components to separate business logic from UI logic
 */

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validate project name
 */
export const validateProjectName = (name: string): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!name || typeof name !== "string") {
    errors.push("Project name is required");
  } else {
    const trimmedName = name.trim();

    if (trimmedName.length === 0) {
      errors.push("Project name cannot be empty");
    }

    if (trimmedName.length > 100) {
      errors.push("Project name is too long (maximum 100 characters)");
    }

    if (trimmedName.length < 3) {
      warnings.push(
        "Project name is very short (recommended minimum 3 characters)"
      );
    }

    // Check for invalid characters
    const invalidChars = /[<>:"/\\|?*\x00-\x1f]/;
    if (invalidChars.test(trimmedName)) {
      errors.push("Project name contains invalid characters");
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

/**
 * Validate project data structure
 */
export const validateProjectData = (data: any): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!data || typeof data !== "object") {
    errors.push("Project data is required");
    return { isValid: false, errors, warnings };
  }

  // Validate elements array
  if (!Array.isArray(data.elements)) {
    errors.push("Project data must contain an elements array");
  } else {
    if (data.elements.length === 0) {
      warnings.push("Project has no elements");
    }

    // Validate each element
    data.elements.forEach((element: any, index: number) => {
      if (!element || typeof element !== "object") {
        errors.push(`Element ${index} is invalid`);
        return;
      }

      if (!element.id || typeof element.id !== "string") {
        errors.push(`Element ${index} missing valid ID`);
      }

      if (!element.type || typeof element.type !== "string") {
        errors.push(`Element ${index} missing valid type`);
      }

      if (typeof element.x !== "number" || typeof element.y !== "number") {
        errors.push(`Element ${index} missing valid position`);
      }

      if (
        typeof element.width !== "number" ||
        element.width <= 0 ||
        typeof element.height !== "number" ||
        element.height <= 0
      ) {
        errors.push(`Element ${index} missing valid dimensions`);
      }
    });
  }

  // Validate artboard dimensions
  if (!data.artboardDimensions || typeof data.artboardDimensions !== "object") {
    errors.push("Project data must contain artboard dimensions");
  } else {
    const { width, height } = data.artboardDimensions;

    if (typeof width !== "number" || width <= 0) {
      errors.push("Artboard width must be a positive number");
    }

    if (typeof height !== "number" || height <= 0) {
      errors.push("Artboard height must be a positive number");
    }

    if (width > 10000 || height > 10000) {
      warnings.push("Artboard dimensions are very large");
    }

    if (width < 100 || height < 100) {
      warnings.push("Artboard dimensions are very small");
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

/**
 * Validate complete project
 */
export const validateProject = (project: Project): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate basic project structure
  if (!project || typeof project !== "object") {
    errors.push("Invalid project object");
    return { isValid: false, errors, warnings };
  }

  // Validate ID
  if (!project.id || typeof project.id !== "string") {
    errors.push("Project must have a valid ID");
  }

  // Validate name
  const nameValidation = validateProjectName(project.name);
  errors.push(...nameValidation.errors);
  warnings.push(...nameValidation.warnings);

  // Validate data
  const dataValidation = validateProjectData(project.data);
  errors.push(...dataValidation.errors);
  warnings.push(...dataValidation.warnings);

  // Validate timestamps
  if (!project.createdAt || typeof project.createdAt !== "string") {
    errors.push("Project must have a valid creation date");
  } else {
    const createdDate = new Date(project.createdAt);
    if (isNaN(createdDate.getTime())) {
      errors.push("Project creation date is invalid");
    }
  }

  if (!project.updatedAt || typeof project.updatedAt !== "string") {
    errors.push("Project must have a valid update date");
  } else {
    const updatedDate = new Date(project.updatedAt);
    if (isNaN(updatedDate.getTime())) {
      errors.push("Project update date is invalid");
    }

    // Check if updatedAt is before createdAt
    if (project.createdAt) {
      const createdDate = new Date(project.createdAt);
      if (!isNaN(createdDate.getTime()) && updatedDate < createdDate) {
        errors.push("Project update date cannot be before creation date");
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

/**
 * Validate project for duplicate detection
 */
export const validateForDuplicates = (
  project: Project,
  existingProjects: Project[]
): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check for duplicate names
  const duplicateNames = existingProjects.filter(
    (p) => p.id !== project.id && p.name === project.name
  );

  if (duplicateNames.length > 0) {
    warnings.push(
      `Project name "${project.name}" is already used by ${duplicateNames.length} other project(s)`
    );
  }

  // Check for duplicate IDs
  const duplicateIds = existingProjects.filter((p) => p.id === project.id);

  if (duplicateIds.length > 0) {
    errors.push(`Project ID "${project.id}" is already used`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

/**
 * Validate project import data
 */
export const validateImportData = (importData: any): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!importData || typeof importData !== "object") {
    errors.push("Import data is not a valid object");
    return { isValid: false, errors, warnings };
  }

  // Check if it's a single project or array of projects
  if (Array.isArray(importData)) {
    if (importData.length === 0) {
      warnings.push("Import data contains no projects");
    }

    importData.forEach((project, index) => {
      const projectValidation = validateProject(project);
      if (!projectValidation.isValid) {
        errors.push(
          `Project ${index + 1}: ${projectValidation.errors.join(", ")}`
        );
      }
      warnings.push(
        ...projectValidation.warnings.map((w) => `Project ${index + 1}: ${w}`)
      );
    });
  } else {
    // Single project
    const projectValidation = validateProject(importData);
    errors.push(...projectValidation.errors);
    warnings.push(...projectValidation.warnings);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

/**
 * Sanitize project name
 */
export const sanitizeProjectName = (name: string): string => {
  if (!name || typeof name !== "string") {
    return "Untitled Project";
  }

  // Remove invalid characters and trim
  const sanitized = name.replace(/[<>:"/\\|?*\x00-\x1f]/g, "").trim();

  // Ensure minimum length
  if (sanitized.length === 0) {
    return "Untitled Project";
  }

  // Ensure maximum length
  if (sanitized.length > 100) {
    return sanitized.substring(0, 100).trim();
  }

  return sanitized;
};
