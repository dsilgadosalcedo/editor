"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import {
  getProjects as getLocalProjects,
  deleteProject as deleteLocalProject,
  createProject as createLocalProject,
  updateProjectName as updateLocalProjectName,
  type Project,
} from "@/lib/project-storage";
import { useCanvasStore } from "@/features/canvas/store/useCanvasStore";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

// Cloud project type (matching Convex schema)
type CloudProject = {
  id: string;
  name: string;
  slug: string;
  data: {
    elements: any[];
    artboardDimensions: { width: number; height: number };
  };
  createdAt: string;
  updatedAt: string;
};

// Unified project type
type UnifiedProject = Project | CloudProject;

export const useHybridProjects = () => {
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const { isAuthenticated, isLoading: convexAuthLoading } = useConvexAuth();
  const { createNewProject, clearCurrentProject, projectId } = useCanvasStore();

  const [projects, setProjects] = useState<UnifiedProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMigrated, setHasMigrated] = useState(false);

  // Convex hooks for cloud operations
  const cloudProjects = useQuery(
    api.projects.getProjects,
    isSignedIn && isAuthenticated ? {} : "skip"
  );
  const createCloudProject = useMutation(api.projects.createProject);
  const updateCloudProject = useMutation(api.projects.updateProject);
  const deleteCloudProject = useMutation(api.projects.deleteProject);

  // Auto-migrate local projects to cloud when user signs in for the first time
  useEffect(() => {
    const migrateLocalProjects = async () => {
      if (!isSignedIn || !isAuthenticated || hasMigrated || convexAuthLoading) {
        return;
      }

      const localProjects = getLocalProjects();

      // Check if user already has cloud projects
      if (cloudProjects && cloudProjects.length > 0) {
        setHasMigrated(true);
        return;
      }

      // If user has local projects but no cloud projects, migrate them
      if (localProjects.length > 0) {
        console.log("Migrating local projects to cloud...");
        try {
          for (const localProject of localProjects) {
            await createCloudProject({
              name: localProject.name,
              slug: localProject.slug,
              data: localProject.data,
            });
          }

          // Clear local storage after successful migration
          localStorage.removeItem("canvas-projects");
          console.log("Migration completed successfully!");
          setHasMigrated(true);
        } catch (error) {
          console.error("Error migrating projects to cloud:", error);
        }
      } else {
        setHasMigrated(true);
      }
    };

    migrateLocalProjects();
  }, [
    isSignedIn,
    isAuthenticated,
    cloudProjects,
    createCloudProject,
    hasMigrated,
    convexAuthLoading,
  ]);

  // Load projects based on authentication state
  useEffect(() => {
    if (isSignedIn && isAuthenticated) {
      if (cloudProjects !== undefined) {
        // Use cloud projects
        setProjects(cloudProjects);
        setIsLoading(false);
      }
      // Keep loading true if cloudProjects is still undefined
    } else if (!convexAuthLoading) {
      // Load from local storage
      const localProjects = getLocalProjects();
      setProjects(localProjects);
      setIsLoading(false);
    }
    // Keep loading true if convexAuthLoading is true
  }, [isSignedIn, isAuthenticated, convexAuthLoading, cloudProjects]);

  const handleCreateNew = async () => {
    if (isSignedIn && isAuthenticated) {
      try {
        // Create in cloud
        const project = await createCloudProject({
          name: "Untitled Project",
          slug: `untitled-${Date.now()}`,
          data: {
            elements: [],
            artboardDimensions: { width: 1024, height: 576 },
          },
        });
        router.push(`/canvas/${project.slug}`);
      } catch (error) {
        console.error("Error creating cloud project:", error);
        // Fallback to local creation
        const project = createLocalProject();
        router.push(`/canvas/${project.slug}`);
      }
    } else {
      // Create locally
      const project = createNewProject();
      router.push(`/canvas/${project.slug}`);
    }
  };

  const handleOpenProject = (slug: string) => {
    router.push(`/canvas/${slug}`);
  };

  const handleDeleteProject = async (id: string) => {
    // If we're deleting the currently loaded project, clear it from the canvas store
    if (projectId === id) {
      clearCurrentProject();
    }

    if (isSignedIn && isAuthenticated) {
      try {
        // Delete from cloud
        await deleteCloudProject({
          id: id as Id<"projects">,
        });
        // Projects will be updated automatically via the useQuery hook
      } catch (error) {
        console.error("Error deleting cloud project:", error);
        // Fallback to local deletion
        deleteLocalProject(id);
        setProjects(getLocalProjects());
      }
    } else {
      // Delete locally
      deleteLocalProject(id);
      setProjects(getLocalProjects());
    }
  };

  const handleUpdateProjectName = async (id: string, newName: string) => {
    if (isSignedIn && isAuthenticated) {
      try {
        // Update in cloud
        await updateCloudProject({
          id: id as Id<"projects">,
          name: newName,
          slug:
            newName
              .toLowerCase()
              .replace(/[^a-z0-9\s-]/g, "")
              .replace(/\s+/g, "-")
              .replace(/-+/g, "-")
              .replace(/^-|-$/g, "") || "untitled",
        });
        // Projects will be updated automatically via the useQuery hook
      } catch (error) {
        console.error("Error updating cloud project name:", error);
        // Fallback to local update
        updateLocalProjectName(id, newName);
        setProjects(getLocalProjects());
      }
    } else {
      // Update locally
      updateLocalProjectName(id, newName);
      setProjects(getLocalProjects());
    }
  };

  const refreshProjects = async () => {
    if (isSignedIn && isAuthenticated) {
      // Cloud projects will refresh automatically via useQuery
      return;
    } else {
      setProjects(getLocalProjects());
    }
  };

  return {
    projects,
    isLoading:
      isLoading ||
      convexAuthLoading ||
      (isSignedIn && isAuthenticated && cloudProjects === undefined),
    isAuthenticated: isSignedIn && isAuthenticated,
    handleCreateNew,
    handleOpenProject,
    handleDeleteProject,
    handleUpdateProjectName,
    refreshProjects,
  };
};
