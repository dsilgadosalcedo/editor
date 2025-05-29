"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  getProjects,
  deleteProjectFromLocal,
  createProjectInLocal,
  type Project,
} from "@/lib/project-storage";
import { useCanvasStore } from "@/features/canvas/store/useCanvasStore";

export const useProjects = () => {
  const router = useRouter();

  // Use optimized selectors to prevent unnecessary re-renders
  const clearCurrentProject = useCanvasStore(
    (state) => state.clearCurrentProject
  );
  const projectId = useCanvasStore((state) => state.projectId);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading delay for better UX
    const loadProjects = async () => {
      setIsLoading(true);
      setProjects(getProjects());
      setIsLoading(false);
    };

    loadProjects();
  }, []);

  const handleCreateNew = () => {
    const now = new Date().toISOString();
    const project = createProjectInLocal(
      undefined,
      undefined,
      undefined,
      now,
      now
    );
    router.push(`/canvas/${project.id}`);
  };

  const handleOpenProject = (id: string) => {
    router.push(`/canvas/${id}`);
  };

  const handleDeleteProject = (id: string) => {
    // If we're deleting the currently loaded project, clear it from the canvas store
    if (projectId === id) {
      clearCurrentProject();
    }
    deleteProjectFromLocal(id);
    setProjects(getProjects());
  };

  const refreshProjects = () => {
    setProjects(getProjects());
  };

  return {
    projects,
    isLoading,
    handleCreateNew,
    handleOpenProject,
    handleDeleteProject,
    refreshProjects,
  };
};
