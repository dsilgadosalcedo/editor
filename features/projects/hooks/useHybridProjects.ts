"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import {
  getProjects as getLocalProjects,
  deleteProjectFromLocal,
  createProjectInLocal,
  saveProjectToLocal,
  getProjectByIdFromLocal,
  cleanupDuplicateProjects,
  getDuplicateProjectStats,
  createProjectWithLimitCheck,
  validateAndFixLocalStorage,
  MAX_PROJECTS,
  type Project,
} from "@/lib/project-storage";
import { useProjectUpdate } from "@/hooks/useProjectUpdate";
import { useCanvasStore } from "@/features/canvas/store/useCanvasStore.new";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";

// Cloud project type (matching Convex schema)
type CloudProject = {
  id: string;
  name: string;
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

  // Use optimized selectors to prevent unnecessary re-renders
  const clearCurrentProject = useCanvasStore(
    (state) => state.clearCurrentProject
  );
  const currentCanvasProjectId = useCanvasStore((state) => state.projectId);

  const { updateProjectName } = useProjectUpdate();

  const [projects, setProjects] = useState<UnifiedProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMigrated, setHasMigrated] = useState(false);

  // Convex hooks for cloud operations
  const cloudProjects = useQuery(
    api.projects.getProjects,
    isSignedIn && isAuthenticated ? {} : "skip"
  );
  const convexCreateProject = useMutation(api.projects.createProject);
  const convexUpdateProject = useMutation(api.projects.updateProject);
  const convexDeleteProject = useMutation(api.projects.deleteProject);

  // Auto-migrate local projects to cloud when user signs in
  useEffect(() => {
    const migrateLocalProjects = async () => {
      if (
        !isSignedIn ||
        !isAuthenticated ||
        hasMigrated ||
        convexAuthLoading ||
        !cloudProjects
      ) {
        return;
      }

      const localProjectsToMigrate = getLocalProjects();

      if (localProjectsToMigrate.length > 0 && cloudProjects.length === 0) {
        console.log("Migrating local projects to cloud...");
        let allMigratedSuccessfully = true;
        for (const localProject of localProjectsToMigrate) {
          try {
            const now = new Date().toISOString();
            // Ensure local projects have valid createdAt/updatedAt for migration
            const createdAt = localProject.createdAt || now;
            const updatedAt = localProject.updatedAt || now;

            await convexCreateProject({
              name: localProject.name,
              data: localProject.data,
              createdAt: createdAt,
              updatedAt: updatedAt,
            });
            // Optionally, delete local project immediately after successful migration of that specific project
            // deleteProjectFromLocal(localProject.id);
          } catch (error) {
            console.error(
              `Error migrating project ${localProject.name} to cloud:`,
              error
            );
            toast.error(`Failed to migrate project: ${localProject.name}`);
            allMigratedSuccessfully = false;
            // Decide if you want to stop migration on first error or continue with others
          }
        }

        if (allMigratedSuccessfully) {
          localStorage.removeItem("canvas-projects"); // Clear all local storage only if all migrated
          console.log("Migration completed successfully!");
        } else {
          toast.warning(
            "Some local projects could not be migrated. They remain available locally."
          );
        }
        setHasMigrated(true); // Mark migration as attempted
        // Refresh projects list after migration
        if (isSignedIn && isAuthenticated) {
          // Cloud projects will refresh via useQuery, local ones are cleared or partially remain
        } else {
          setProjects(getLocalProjects());
        }
      } else {
        setHasMigrated(true); // No local projects to migrate or cloud projects already exist
      }
    };

    if (!isLoading) {
      // Ensure initial load is complete before attempting migration
      migrateLocalProjects();
    }
  }, [
    isSignedIn,
    isAuthenticated,
    cloudProjects,
    convexCreateProject,
    hasMigrated,
    convexAuthLoading,
    isLoading,
  ]);

  // Load projects based on authentication state
  useEffect(() => {
    if (convexAuthLoading) {
      setIsLoading(true);
      return;
    }

    if (isSignedIn && isAuthenticated) {
      if (cloudProjects !== undefined) {
        setProjects(cloudProjects.map((p) => ({ ...p, id: p.id as string })));
        setIsLoading(false);
      }
      // else: cloudProjects is still loading, isLoading remains true
    } else {
      // For unauthenticated users, only load local projects if they exist
      // and the user hasn't just signed out

      // First, validate localStorage to detect manipulation attempts
      const validationResult = validateAndFixLocalStorage();

      if (validationResult.wasManipulated) {
        console.warn(
          `🚨 Detected localStorage manipulation: Found ${validationResult.originalCount} projects, ` +
            `but limit is ${MAX_PROJECTS}. Automatically removed ${validationResult.removedCount} excess projects.`
        );
        toast.warning(
          `Project limit enforced: Removed ${validationResult.removedCount} excess projects. ` +
            `Maximum allowed: ${MAX_PROJECTS} projects.`
        );
      } else if (validationResult.hadInvalidData) {
        console.warn(
          `🧹 Cleaned up ${validationResult.removedCount} invalid projects from localStorage`
        );
      }

      const local = getLocalProjects(); // This now returns validated/limited projects

      // If user is explicitly not signed in (false, not undefined),
      // and we have local projects, it might be from a previous session
      if (isSignedIn === false && local.length > 0) {
        console.log(
          "🧹 User not signed in but local projects found, clearing them..."
        );
        // Clear projects immediately to prevent them from being displayed
        localStorage.removeItem("canvas-projects");
        setProjects([]);
      } else {
        setProjects(local);
      }
      setIsLoading(false);
    }
  }, [isSignedIn, isAuthenticated, convexAuthLoading, cloudProjects]);

  const handleCreateNew = async (skipLimitCheck = false) => {
    // Check project limit for EVERYONE (authenticated and unauthenticated)
    // Skip this check if called from canvas page (which already checks the limit)
    if (!skipLimitCheck) {
      const currentProjectCount = projects.length;
      if (currentProjectCount >= MAX_PROJECTS) {
        toast.error(
          `Project limit reached! You can have a maximum of ${MAX_PROJECTS} projects. Please delete some projects before creating new ones.`
        );
        return;
      }
    }

    const now = new Date().toISOString();
    const initialProjectData = {
      elements: [],
      artboardDimensions: { width: 1024, height: 576 },
    };

    if (isSignedIn && isAuthenticated) {
      try {
        // Create in cloud first
        const cloudResult = await convexCreateProject({
          name: "Untitled Project",
          data: initialProjectData,
          createdAt: now,
          updatedAt: now,
        });

        // Also save to local storage using the cloud ID and timestamps
        createProjectInLocal(
          cloudResult.id,
          cloudResult.name,
          cloudResult.data,
          cloudResult.createdAt,
          cloudResult.updatedAt
        );
        router.push(`/canvas/${cloudResult.id}`);
      } catch (error) {
        console.error("Error creating cloud project:", error);
        toast.error("Failed to create project in the cloud. Please try again.");
        return;
      }
    } else {
      // Create locally for unauthenticated user
      const localProject = createProjectInLocal(
        undefined,
        "Untitled Project",
        initialProjectData,
        now,
        now
      );
      router.push(`/canvas/${localProject.id}`);
    }
  };

  const handleOpenProject = async (id: string) => {
    // For authenticated users, implement Git-like behavior
    if (isSignedIn && isAuthenticated) {
      try {
        // Fetch the cloud version
        const cloudProject = cloudProjects?.find((p) => p.id === id);
        const localProject = getProjectByIdFromLocal(id);

        if (cloudProject && localProject) {
          // Compare timestamps to determine which version is more recent
          const cloudUpdatedAt = new Date(cloudProject.updatedAt);
          const localUpdatedAt = new Date(localProject.updatedAt);

          if (localUpdatedAt > cloudUpdatedAt) {
            // Local version is more recent, sync it to cloud and use it
            console.log(
              "Local version is newer, syncing to cloud:",
              localProject.name
            );

            try {
              await convexUpdateProject({
                id: id as Id<"projects">,
                name: localProject.name,
                data: localProject.data,
                updatedAt: localProject.updatedAt,
              });
            } catch (syncError) {
              console.error(
                "Failed to sync local changes to cloud:",
                syncError
              );
              toast.warning(
                "Using local version. Cloud sync failed - will retry later."
              );
            }
          } else if (cloudUpdatedAt > localUpdatedAt) {
            // Cloud version is more recent, update local storage and show toast
            console.log(
              "Cloud version is newer, updating local storage:",
              cloudProject.name
            );
            saveProjectToLocal(
              {
                id: cloudProject.id,
                name: cloudProject.name,
                data: cloudProject.data,
                createdAt: cloudProject.createdAt,
                updatedAt: cloudProject.updatedAt,
              },
              true
            ); // Preserve the cloud timestamp
          } else {
            // Versions are the same, no need to show toast
            console.log(
              "Cloud and local versions are in sync:",
              cloudProject.name
            );
            // Silently ensure local storage is up to date
            saveProjectToLocal(
              {
                id: cloudProject.id,
                name: cloudProject.name,
                data: cloudProject.data,
                createdAt: cloudProject.createdAt,
                updatedAt: cloudProject.updatedAt,
              },
              true
            ); // Preserve the cloud timestamp
          }
        } else if (cloudProject && !localProject) {
          // Only cloud version exists, save to local (this is a meaningful sync)
          console.log(
            "Downloading cloud project to local storage:",
            cloudProject.name
          );
          saveProjectToLocal(
            {
              id: cloudProject.id,
              name: cloudProject.name,
              data: cloudProject.data,
              createdAt: cloudProject.createdAt,
              updatedAt: cloudProject.updatedAt,
            },
            true
          ); // Preserve the cloud timestamp
        } else if (localProject && !cloudProject) {
          // Only local version exists for a cloud project ID, sync it to cloud
          console.log(
            "Local project exists but not in cloud, syncing to cloud"
          );

          try {
            await convexCreateProject({
              name: localProject.name,
              data: localProject.data,
              createdAt: localProject.createdAt,
              updatedAt: localProject.updatedAt,
            });
          } catch (syncError) {
            console.error("Failed to sync local project to cloud:", syncError);
            toast.warning(
              "Using local version. Cloud sync failed - will retry later."
            );
          }
        }
        // If neither exists, the canvas page will handle the error
      } catch (error) {
        console.error("Error comparing project versions:", error);
        // Continue with opening the project anyway
      }
    }

    router.push(`/canvas/${id}`);
  };

  const handleDeleteProject = async (id: string) => {
    if (currentCanvasProjectId === id) {
      clearCurrentProject();
    }

    if (isSignedIn && isAuthenticated) {
      try {
        await convexDeleteProject({ id: id as Id<"projects"> });
        deleteProjectFromLocal(id);
        // Projects list will update via useQuery for cloud, or manually if only local was shown before auth
      } catch (error) {
        console.error("Error deleting cloud project:", error);
        toast.error(
          "Failed to delete project from cloud. Project remains in cloud."
        );
        // DO NOT delete locally if cloud fails for authenticated users
        return;
      }
    } else {
      deleteProjectFromLocal(id);
      setProjects(getLocalProjects());
    }
    // Manually trigger a refresh of the projects list if not relying purely on useQuery
    if (!(isSignedIn && isAuthenticated && cloudProjects !== undefined)) {
      setProjects(getLocalProjects());
    }
  };

  const handleUpdateProjectName = async (id: string, newName: string) => {
    const result = await updateProjectName(id, newName);

    if (result.success) {
      // Update the local projects list to reflect the change
      if (isSignedIn && isAuthenticated) {
        // For authenticated users, the cloud projects will update via useQuery
        // But we also need to update the local state for immediate UI feedback
        setProjects((prev) =>
          prev.map((p) =>
            p.id === id
              ? {
                  ...p,
                  name: newName,
                  updatedAt:
                    result.updatedProject?.updatedAt ||
                    new Date().toISOString(),
                }
              : p
          )
        );
      } else {
        // For unauthenticated users, refresh from local storage
        setProjects(getLocalProjects());
      }

      if (!result.error) {
        // Removed toast - user doesn't want informational toasts
      }
      // If there's an error but success is true, it means local save worked but cloud failed
      // The useProjectUpdate hook already shows the appropriate warning
    } else {
      toast.error("Failed to update project name.");
    }
  };

  const refreshProjects = async () => {
    if (isSignedIn && isAuthenticated) {
      // Cloud projects will refresh automatically via useQuery
      return;
    } else {
      // Validate localStorage before refreshing for unauthenticated users
      const validationResult = validateAndFixLocalStorage();

      if (validationResult.wasManipulated) {
        console.warn(
          `🚨 Detected localStorage manipulation: Found ${validationResult.originalCount} projects, ` +
            `but limit is ${MAX_PROJECTS}. Automatically removed ${validationResult.removedCount} excess projects.`
        );
        toast.warning(
          `Project limit enforced: Removed ${validationResult.removedCount} excess projects. ` +
            `Maximum allowed: ${MAX_PROJECTS} projects.`
        );
      }

      setProjects(getLocalProjects());
    }
  };

  const handleCleanupDuplicates = async () => {
    try {
      const stats = getDuplicateProjectStats();
      if (stats.duplicates === 0) {
        // Removed toast - user doesn't want informational toasts
        return;
      }

      const result = cleanupDuplicateProjects();
      // Removed toast - user doesn't want informational toasts

      // Refresh the projects list
      refreshProjects();
    } catch (error) {
      console.error("Error cleaning up duplicates:", error);
      toast.error("Failed to clean up duplicate projects.");
    }
  };

  const getDuplicateStats = () => {
    return getDuplicateProjectStats();
  };

  const getProjectLimitStats = () => {
    // Use the actual projects state which includes both local and cloud projects
    const current = projects.length;
    const max = MAX_PROJECTS;
    return {
      current,
      max,
      isAtLimit: current >= max,
      remaining: Math.max(0, max - current),
    };
  };

  const checkProjectLimit = () => {
    // Use the actual projects state instead of just local storage
    return projects.length >= MAX_PROJECTS;
  };

  return {
    projects,
    isLoading:
      isLoading ||
      convexAuthLoading ||
      (isSignedIn &&
        isAuthenticated &&
        cloudProjects === undefined &&
        !hasMigrated),
    isAuthenticated: isSignedIn && isAuthenticated,
    handleCreateNew,
    handleOpenProject,
    handleDeleteProject,
    handleUpdateProjectName,
    refreshProjects,
    handleCleanupDuplicates,
    getDuplicateStats,
    getProjectLimitStats,
    checkProjectLimit,
  };
};
