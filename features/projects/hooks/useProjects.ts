"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  getProjects,
  deleteProject,
  type Project,
} from "@/lib/project-storage";
import { useCanvasStore } from "@/features/canvas/store/useCanvasStore";

export const useProjects = () => {
  const router = useRouter();
  const { createNewProject, clearCurrentProject, projectId } = useCanvasStore();
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
    const project = createNewProject();
    router.push(`/canvas/${project.slug}`);
  };

  const handleOpenProject = (slug: string) => {
    router.push(`/canvas/${slug}`);
  };

  const handleDeleteProject = (id: string) => {
    // If we're deleting the currently loaded project, clear it from the canvas store
    if (projectId === id) {
      clearCurrentProject();
    }
    deleteProject(id);
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
