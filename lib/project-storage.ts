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

// Get all projects from localStorage
export const getProjects = (): Project[] => {
  if (typeof window === "undefined") return [];

  try {
    const stored = localStorage.getItem(PROJECTS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Error reading projects from localStorage:", error);
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
