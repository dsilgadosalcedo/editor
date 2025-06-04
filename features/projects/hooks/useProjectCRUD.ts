import { useState, useCallback } from "react";
import {
  createProject,
  saveProject,
  deleteProject,
  type ProjectCreateOptions,
  type ProjectUpdateOptions,
} from "../services/project-crud";
import {
  validateProjectName,
  validateProjectData,
} from "../services/project-validation";
import type { Project } from "../types";

interface UseProjectCRUDProps {
  onSuccess?: (message: string) => void;
  onError?: (error: string) => void;
}

export const useProjectCRUD = ({
  onSuccess,
  onError,
}: UseProjectCRUDProps = {}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateProject = useCallback(
    async (projectData: ProjectCreateOptions) => {
      setIsLoading(true);
      setError(null);

      try {
        // Validate project data
        if (projectData.name) {
          const nameValidation = validateProjectName(projectData.name);
          if (!nameValidation.isValid) {
            throw new Error(nameValidation.errors.join(", "));
          }
        }

        if (projectData.data) {
          const dataValidation = validateProjectData(projectData.data);
          if (!dataValidation.isValid) {
            throw new Error(dataValidation.errors.join(", "));
          }
        }

        const newProject = await createProject(projectData);
        onSuccess?.("Project created successfully");
        return newProject;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to create project";
        setError(errorMessage);
        onError?.(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [onSuccess, onError]
  );

  const handleUpdateProject = useCallback(
    async (id: string, projectData: ProjectUpdateOptions) => {
      setIsLoading(true);
      setError(null);

      try {
        // Validate project data if provided
        if (projectData.name) {
          const nameValidation = validateProjectName(projectData.name);
          if (!nameValidation.isValid) {
            throw new Error(nameValidation.errors.join(", "));
          }
        }

        if (projectData.data) {
          const dataValidation = validateProjectData(projectData.data);
          if (!dataValidation.isValid) {
            throw new Error(dataValidation.errors.join(", "));
          }
        }

        const updatedProject = await saveProject(id, projectData);
        onSuccess?.("Project updated successfully");
        return updatedProject;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to update project";
        setError(errorMessage);
        onError?.(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [onSuccess, onError]
  );

  const handleDeleteProject = useCallback(
    async (id: string) => {
      setIsLoading(true);
      setError(null);

      try {
        await deleteProject(id);
        onSuccess?.("Project deleted successfully");
        return true;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to delete project";
        setError(errorMessage);
        onError?.(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [onSuccess, onError]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isLoading,
    error,
    createProject: handleCreateProject,
    updateProject: handleUpdateProject,
    deleteProject: handleDeleteProject,
    clearError,
  };
};
