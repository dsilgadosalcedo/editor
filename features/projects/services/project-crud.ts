import {
  createProjectInLocal,
  saveProjectToLocal,
  getProjects,
  updateProjectName as updateProjectNameInLocal,
  getProjectByIdFromLocal,
  deleteProjectFromLocal,
  generateProjectName,
  isProjectLimitReached,
  type Project,
} from "@/lib/project-storage";

/**
 * Service for project CRUD operations
 * Extracted from components to separate business logic from UI logic
 */

export interface ProjectCreateOptions {
  name?: string;
  data: {
    elements: any[];
    artboardDimensions: { width: number; height: number };
  };
}

export interface ProjectUpdateOptions {
  name?: string;
  data?: {
    elements: any[];
    artboardDimensions: { width: number; height: number };
  };
}

export interface ProjectListOptions {
  sortBy?: "name" | "createdAt" | "updatedAt";
  sortOrder?: "asc" | "desc";
  limit?: number;
}

/**
 * Create a new project
 */
export const createProject = async (
  options: ProjectCreateOptions
): Promise<Project> => {
  const projectName = options.name || generateProjectName();

  const project = createProjectInLocal(undefined, projectName, options.data);
  return project;
};

/**
 * Save/update an existing project
 */
export const saveProject = async (
  projectId: string,
  updates: ProjectUpdateOptions
): Promise<Project> => {
  const existingProject = getProjectByIdFromLocal(projectId);
  if (!existingProject) {
    throw new Error(`Project with ID ${projectId} not found`);
  }

  const updatedProject: Project = {
    ...existingProject,
    name: updates.name || existingProject.name,
    data: updates.data || existingProject.data,
    updatedAt: new Date().toISOString(),
  };

  const savedProject = saveProjectToLocal(updatedProject);
  return savedProject;
};

/**
 * Get a project by ID
 */
export const getProject = (projectId: string): Project | null => {
  return getProjectByIdFromLocal(projectId);
};

/**
 * Get all projects with optional filtering and sorting
 */
export const getAllProjects = (options: ProjectListOptions = {}): Project[] => {
  let projects = getProjects();

  // Apply sorting
  if (options.sortBy) {
    projects.sort((a: Project, b: Project) => {
      const aValue = a[options.sortBy!];
      const bValue = b[options.sortBy!];

      let comparison = 0;
      if (aValue < bValue) comparison = -1;
      if (aValue > bValue) comparison = 1;

      return options.sortOrder === "desc" ? -comparison : comparison;
    });
  }

  // Apply limit
  if (options.limit) {
    projects = projects.slice(0, options.limit);
  }

  return projects;
};

/**
 * Update only the project name
 */
export const updateProjectName = async (
  projectId: string,
  newName: string
): Promise<Project> => {
  const updatedProject = updateProjectNameInLocal(projectId, newName);
  if (!updatedProject) {
    throw new Error(`Failed to update project name for ID ${projectId}`);
  }
  return updatedProject;
};

/**
 * Delete a project
 */
export const deleteProject = async (projectId: string): Promise<void> => {
  const success = deleteProjectFromLocal(projectId);
  if (!success) {
    throw new Error(`Failed to delete project with ID ${projectId}`);
  }
};

/**
 * Duplicate a project
 */
export const duplicateProject = async (projectId: string): Promise<Project> => {
  const originalProject = getProjectByIdFromLocal(projectId);
  if (!originalProject) {
    throw new Error(`Project with ID ${projectId} not found`);
  }

  const duplicatedName = `${originalProject.name} (Copy)`;
  const duplicatedProject = createProjectInLocal(
    undefined,
    duplicatedName,
    originalProject.data
  );

  return duplicatedProject;
};

/**
 * Check if project limit is reached
 */
export const checkProjectLimit = (): boolean => {
  return isProjectLimitReached();
};

/**
 * Get project statistics
 */
export const getProjectStats = (): {
  total: number;
  canCreate: boolean;
  limit: number;
} => {
  const projects = getProjects();
  const limit = 20; // This should match the limit in project-storage

  return {
    total: projects.length,
    canCreate: !isProjectLimitReached(),
    limit,
  };
};

/**
 * Search projects by name
 */
export const searchProjects = (query: string): Project[] => {
  const projects = getProjects();
  const lowercaseQuery = query.toLowerCase();

  return projects.filter((project: Project) =>
    project.name.toLowerCase().includes(lowercaseQuery)
  );
};

/**
 * Get recently modified projects
 */
export const getRecentProjects = (limit = 5): Project[] => {
  return getAllProjects({
    sortBy: "updatedAt",
    sortOrder: "desc",
    limit,
  });
};
