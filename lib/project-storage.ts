import { CanvasElementData } from "@/features/canvas/store/useCanvasStore";

export interface Project {
  id: string;
  name: string;
  slug: string;
  data: {
    elements: CanvasElementData[];
    artboardDimensions: { width: number; height: number };
  };
  createdAt: string;
  updatedAt: string;
}

const PROJECTS_STORAGE_KEY = "canvas-projects";

// Generate a unique slug from project name
export const generateSlug = (name: string): string => {
  const baseSlug = name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single
    .replace(/^-|-$/g, ""); // Remove leading/trailing hyphens

  // Ensure the slug is unique
  const existingProjects = getProjects();
  let uniqueSlug = baseSlug || "untitled";
  let counter = 1;

  while (existingProjects.some((p) => p.slug === uniqueSlug)) {
    uniqueSlug = `${baseSlug || "untitled"}-${counter}`;
    counter++;
  }

  return uniqueSlug;
};

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

// Get a project by slug
export const getProjectBySlug = (slug: string): Project | null => {
  const projects = getProjects();
  return projects.find((p) => p.slug === slug) || null;
};

// Save a project (create or update)
export const saveProject = (project: Omit<Project, "updatedAt">): Project => {
  const projects = getProjects();
  const now = new Date().toISOString();

  const updatedProject: Project = {
    ...project,
    updatedAt: now,
  };

  const existingIndex = projects.findIndex((p) => p.id === project.id);

  if (existingIndex >= 0) {
    projects[existingIndex] = updatedProject;
  } else {
    projects.push(updatedProject);
  }

  saveProjects(projects);
  return updatedProject;
};

// Create a new project
export const createProject = (
  name?: string,
  data?: {
    elements: CanvasElementData[];
    artboardDimensions: { width: number; height: number };
  }
): Project => {
  const projectName = name || generateProjectName();
  const slug = generateSlug(projectName);
  const now = new Date().toISOString();

  const project: Project = {
    id: `project-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: projectName,
    slug,
    data: data || {
      elements: [],
      artboardDimensions: { width: 1024, height: 576 },
    },
    createdAt: now,
    updatedAt: now,
  };

  return saveProject(project);
};

// Delete a project
export const deleteProject = (id: string): boolean => {
  const projects = getProjects();
  const filteredProjects = projects.filter((p) => p.id !== id);

  if (filteredProjects.length === projects.length) {
    return false; // Project not found
  }

  saveProjects(filteredProjects);
  return true;
};

// Update project name and regenerate slug if needed
export const updateProjectName = (
  id: string,
  newName: string
): Project | null => {
  const projects = getProjects();
  const projectIndex = projects.findIndex((p) => p.id === id);

  if (projectIndex === -1) return null;

  const project = projects[projectIndex];
  const newSlug = generateSlug(newName);

  const updatedProject: Project = {
    ...project,
    name: newName,
    slug: newSlug,
    updatedAt: new Date().toISOString(),
  };

  projects[projectIndex] = updatedProject;
  saveProjects(projects);

  return updatedProject;
};
