import { CanvasElementData } from "@/features/canvas/store/useCanvasStore";

export interface Project {
  id: string;
  name: string;
  data: {
    elements: CanvasElementData[];
    artboardDimensions: { width: number; height: number };
  };
  createdAt: string;
  updatedAt: string;
}

const PROJECTS_STORAGE_KEY = "canvas-projects";
export const MAX_PROJECTS = 10;

// Generate a unique project name
export const generateProjectName = (): string => {
  const existingProjects = getProjects();
  let counter = 1;
  let name = "Untitled Project";

  while (existingProjects.some((p) => p.name === name)) {
    name = `Untitled Project ${counter}`;
    counter++;
  }

  return name;
};

// Get projects from localStorage with limit enforcement
export const getProjects = (): Project[] => {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const stored = localStorage.getItem(PROJECTS_STORAGE_KEY);
    if (!stored) {
      return [];
    }

    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) {
      console.warn("Invalid projects data in localStorage, resetting...");
      localStorage.removeItem(PROJECTS_STORAGE_KEY);
      return [];
    }

    // Validate each project structure
    const validProjects = parsed.filter((item): item is Project => {
      return (
        typeof item === "object" &&
        item !== null &&
        typeof item.id === "string" &&
        typeof item.name === "string" &&
        typeof item.data === "object" &&
        item.data !== null &&
        Array.isArray(item.data.elements) &&
        typeof item.data.artboardDimensions === "object" &&
        typeof item.data.artboardDimensions.width === "number" &&
        typeof item.data.artboardDimensions.height === "number" &&
        typeof item.createdAt === "string" &&
        typeof item.updatedAt === "string"
      );
    });

    // Enforce project limit - if exceeded, keep only the most recent projects
    if (validProjects.length > MAX_PROJECTS) {
      console.warn(
        `Found ${validProjects.length} projects in localStorage, but limit is ${MAX_PROJECTS}. ` +
          `Keeping only the ${MAX_PROJECTS} most recently updated projects.`
      );

      // Sort by updatedAt (most recent first) and take only the allowed number
      const limitedProjects = validProjects
        .sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        )
        .slice(0, MAX_PROJECTS);

      // Save the limited projects back to localStorage
      saveProjects(limitedProjects);

      return limitedProjects;
    }

    // If invalid projects were filtered out, save the cleaned data
    if (validProjects.length !== parsed.length) {
      console.warn(
        `Removed ${
          parsed.length - validProjects.length
        } invalid projects from localStorage`
      );
      saveProjects(validProjects);
    }

    return validProjects;
  } catch (error) {
    console.error("Error parsing projects from localStorage:", error);
    // Clear corrupted data
    localStorage.removeItem(PROJECTS_STORAGE_KEY);
    return [];
  }
};

// Save projects to localStorage
const saveProjects = (projects: Project[]): void => {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(projects));
  } catch (error) {
    console.error("Error saving projects to localStorage:", error);
  }
};

// Get a project by id
export const getProjectByIdFromLocal = (id: string): Project | null => {
  const projects = getProjects();
  return projects.find((p) => p.id === id) || null;
};

// Save a project (create or update)
// Ensures that `id`, `createdAt`, and `updatedAt` are part of the project object being saved.
// `updatedAt` is refreshed on save unless preserveTimestamp is true.
export const saveProjectToLocal = (
  project: Project,
  preserveTimestamp: boolean = false
): Project => {
  const projects = getProjects();
  const now = new Date().toISOString();

  const projectToSave: Project = {
    ...project,
    updatedAt: preserveTimestamp && project.updatedAt ? project.updatedAt : now,
  };

  // Ensure createdAt is set if not already present (should be set on creation)
  if (!projectToSave.createdAt) {
    projectToSave.createdAt = now;
  }

  const existingIndex = projects.findIndex((p) => p.id === projectToSave.id);

  if (existingIndex >= 0) {
    projects[existingIndex] = projectToSave;
  } else {
    projects.push(projectToSave);
  }

  saveProjects(projects);
  return projectToSave;
};

// Save a project with a specific timestamp (for Git-like behavior)
export const saveProjectToLocalWithTimestamp = (
  project: Project,
  updatedAt: string
): Project => {
  const projects = getProjects();

  const projectToSave: Project = {
    ...project,
    updatedAt,
  };

  // Ensure createdAt is set if not already present
  if (!projectToSave.createdAt) {
    projectToSave.createdAt = updatedAt;
  }

  const existingIndex = projects.findIndex((p) => p.id === projectToSave.id);

  if (existingIndex >= 0) {
    projects[existingIndex] = projectToSave;
  } else {
    projects.push(projectToSave);
  }

  saveProjects(projects);
  return projectToSave;
};

// Create a new project
export const createProjectInLocal = (
  id?: string, // Optional ID, can be provided if synced with cloud
  name?: string,
  data?: {
    elements: CanvasElementData[];
    artboardDimensions: { width: number; height: number };
  },
  createdAt?: string, // Optional createdAt, can be provided if synced with cloud
  updatedAt?: string // Optional updatedAt, can be provided if synced with cloud
): Project => {
  const projectName = name || generateProjectName();
  const now = new Date().toISOString();

  const projectToCreate: Project = {
    id:
      id ||
      `project-ulid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // Use ULID-like prefix for local-only
    name: projectName,
    data: data || {
      elements: [],
      artboardDimensions: { width: 1024, height: 576 },
    },
    createdAt: createdAt || now,
    updatedAt: updatedAt || now, // Will be overwritten by saveProjectToLocal if called without `updatedAt` in `project`
  };

  // Use saveProjectToLocal to add/update and save, ensuring updatedAt is correctly managed
  return saveProjectToLocal(projectToCreate);
};

// Delete a project
export const deleteProjectFromLocal = (id: string): boolean => {
  const projects = getProjects();
  const filteredProjects = projects.filter((p) => p.id !== id);

  if (filteredProjects.length === projects.length) {
    return false; // Project not found
  }

  saveProjects(filteredProjects);
  return true;
};

// Update project name
export const updateProjectName = (
  id: string,
  newName: string,
  newUpdatedAt?: string // Allow passing a specific updatedAt if needed
): Project | null => {
  const projects = getProjects();
  const projectIndex = projects.findIndex((p) => p.id === id);

  if (projectIndex === -1) return null;

  const project = projects[projectIndex];
  const updatedProject: Project = {
    ...project,
    name: newName,
    updatedAt: newUpdatedAt || new Date().toISOString(),
  };

  projects[projectIndex] = updatedProject;
  saveProjects(projects);

  return updatedProject;
};

// Clean up duplicate projects by ID, keeping only the most recent
export const cleanupDuplicateProjects = (): {
  cleaned: number;
  remaining: number;
} => {
  const projects = getProjects();
  const seenIds = new Set<string>();
  const duplicateProjects: Project[] = [];
  const uniqueProjects: Project[] = [];

  // Sort by updatedAt (most recent first) to keep the latest version of duplicates
  const sortedProjects = [...projects].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  // Find duplicates by ID
  for (const project of sortedProjects) {
    if (seenIds.has(project.id)) {
      duplicateProjects.push(project);
    } else {
      seenIds.add(project.id);
      uniqueProjects.push(project);
    }
  }

  if (duplicateProjects.length === 0) {
    return { cleaned: 0, remaining: projects.length };
  }

  // Save only unique projects (most recent versions)
  saveProjects(uniqueProjects);

  return {
    cleaned: duplicateProjects.length,
    remaining: uniqueProjects.length,
  };
};

// Get duplicate project stats without cleaning
export const getDuplicateProjectStats = (): {
  total: number;
  duplicates: number;
  unique: number;
} => {
  const projects = getProjects();
  const seenIds = new Set<string>();
  let duplicateCount = 0;

  // Count duplicates by ID
  for (const project of projects) {
    if (seenIds.has(project.id)) {
      duplicateCount++;
    } else {
      seenIds.add(project.id);
    }
  }

  return {
    total: projects.length,
    duplicates: duplicateCount,
    unique: seenIds.size,
  };
};

// Find duplicate projects by ID (returns groups of duplicates)
export const findDuplicateProjects = (): {
  [id: string]: Project[];
} => {
  const projects = getProjects();
  const projectGroups: { [id: string]: Project[] } = {};

  // Group projects by ID
  for (const project of projects) {
    if (!projectGroups[project.id]) {
      projectGroups[project.id] = [];
    }
    projectGroups[project.id].push(project);
  }

  // Filter to only include groups with duplicates
  const duplicateGroups: { [id: string]: Project[] } = {};
  for (const [id, group] of Object.entries(projectGroups)) {
    if (group.length > 1) {
      // Sort by updatedAt (most recent first)
      group.sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
      duplicateGroups[id] = group;
    }
  }

  return duplicateGroups;
};

// Check if project limit is reached
export const isProjectLimitReached = (): boolean => {
  const projects = getProjects();
  return projects.length >= MAX_PROJECTS;
};

// Get project limit info
export const getProjectLimitInfo = (): {
  current: number;
  max: number;
  isAtLimit: boolean;
  remaining: number;
} => {
  const projects = getProjects();
  const current = projects.length;
  return {
    current,
    max: MAX_PROJECTS,
    isAtLimit: current >= MAX_PROJECTS,
    remaining: Math.max(0, MAX_PROJECTS - current),
  };
};

// Remove oldest projects to make room for new ones
export const removeOldestProjects = (
  countToRemove: number = 1
): {
  removed: Project[];
  remaining: number;
} => {
  const projects = getProjects();

  // Sort by createdAt (oldest first)
  const sortedProjects = [...projects].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  const toRemove = sortedProjects.slice(0, countToRemove);
  const toKeep = projects.filter(
    (p) => !toRemove.some((removed) => removed.id === p.id)
  );

  saveProjects(toKeep);

  return {
    removed: toRemove,
    remaining: toKeep.length,
  };
};

// Clear all projects from localStorage (useful for sign out)
export const clearAllProjects = (): {
  cleared: number;
  success: boolean;
} => {
  if (typeof window === "undefined") {
    return { cleared: 0, success: false };
  }

  try {
    const projects = getProjects();
    const projectCount = projects.length;

    localStorage.removeItem(PROJECTS_STORAGE_KEY);

    return {
      cleared: projectCount,
      success: true,
    };
  } catch (error) {
    console.error("Error clearing projects from localStorage:", error);
    return {
      cleared: 0,
      success: false,
    };
  }
};

// Create project with limit enforcement
export const createProjectWithLimitCheck = (
  id?: string,
  name?: string,
  data?: {
    elements: CanvasElementData[];
    artboardDimensions: { width: number; height: number };
  },
  createdAt?: string,
  updatedAt?: string
): {
  project: Project | null;
  limitReached: boolean;
  removedProjects?: Project[];
  autoRemoved?: boolean;
} => {
  const limitInfo = getProjectLimitInfo();

  if (limitInfo.isAtLimit) {
    // Automatically remove the oldest project to make room
    const removeResult = removeOldestProjects(1);
    const project = createProjectInLocal(id, name, data, createdAt, updatedAt);

    return {
      project,
      limitReached: true,
      removedProjects: removeResult.removed,
      autoRemoved: true,
    };
  }

  const project = createProjectInLocal(id, name, data, createdAt, updatedAt);
  return {
    project,
    limitReached: false,
  };
};

// Validate and fix localStorage projects (detect manipulation attempts)
export const validateAndFixLocalStorage = (): {
  wasManipulated: boolean;
  originalCount: number;
  finalCount: number;
  removedCount: number;
  hadInvalidData: boolean;
} => {
  if (typeof window === "undefined") {
    return {
      wasManipulated: false,
      originalCount: 0,
      finalCount: 0,
      removedCount: 0,
      hadInvalidData: false,
    };
  }

  try {
    const stored = localStorage.getItem(PROJECTS_STORAGE_KEY);
    if (!stored) {
      return {
        wasManipulated: false,
        originalCount: 0,
        finalCount: 0,
        removedCount: 0,
        hadInvalidData: false,
      };
    }

    const parsed = JSON.parse(stored);
    const originalCount = Array.isArray(parsed) ? parsed.length : 0;

    // This will trigger the validation and auto-fixing in getProjects()
    const validatedProjects = getProjects();
    const finalCount = validatedProjects.length;

    const wasManipulated = originalCount > MAX_PROJECTS;
    const hadInvalidData =
      Array.isArray(parsed) &&
      parsed.length !== validatedProjects.length &&
      originalCount <= MAX_PROJECTS;
    const removedCount = Math.max(0, originalCount - finalCount);

    return {
      wasManipulated,
      originalCount,
      finalCount,
      removedCount,
      hadInvalidData,
    };
  } catch (error) {
    console.error("Error validating localStorage:", error);
    return {
      wasManipulated: false,
      originalCount: 0,
      finalCount: 0,
      removedCount: 0,
      hadInvalidData: true,
    };
  }
};
