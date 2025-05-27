"use client";

import { useAuth } from "@clerk/nextjs";
import { useConvexAuth, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  updateProjectName as updateLocalProjectNameOnly,
  saveProjectToLocalWithTimestamp,
  getProjectByIdFromLocal,
  Project as LocalProject, // Type for local project structure
} from "@/lib/project-storage";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";

// Define a more specific type for project data updates
interface ProjectData {
  elements: any[]; // Replace 'any' with your actual CanvasElementData type if possible
  artboardDimensions: { width: number; height: number };
}

export const useProjectUpdate = () => {
  const { isSignedIn } = useAuth();
  const { isAuthenticated } = useConvexAuth();
  const convexUpdateProjectMutation = useMutation(api.projects.updateProject);

  const updateProjectName = async (
    projectId: string,
    newName: string
  ): Promise<{ success: boolean; updatedProject?: any; error?: string }> => {
    const isCloudSyncProject = !projectId.startsWith("project-ulid-");
    const now = new Date().toISOString();

    // 1. ALWAYS save locally first (Git-like behavior)
    const localUpdated = updateLocalProjectNameOnly(projectId, newName, now);
    if (!localUpdated) {
      const message = "Failed to update project name locally.";
      toast.error(message);
      return { success: false, error: message };
    }

    // 2. For authenticated users with cloud projects, attempt cloud sync
    if (isCloudSyncProject && isSignedIn && isAuthenticated) {
      try {
        const cloudUpdatedProject = await convexUpdateProjectMutation({
          id: projectId as Id<"projects">,
          name: newName,
          updatedAt: now, // Send the same timestamp used locally
        });
        // Success: both local and cloud are now in sync
        return { success: true, updatedProject: cloudUpdatedProject };
      } catch (error) {
        console.error("Error updating cloud project name:", error);
        // Cloud sync failed, but local save succeeded
        toast.warning(
          "Name updated locally. Cloud sync failed - will retry later."
        );
        return {
          success: true,
          updatedProject: localUpdated,
          error: "cloud_update_failed",
        };
      }
    } else {
      // For unauthenticated users or local-only projects
      return { success: true, updatedProject: localUpdated };
    }
  };

  const updateProjectData = async (
    projectId: string,
    newData: ProjectData,
    currentName?: string // Pass current name if not changing, or new name if changing along with data
  ): Promise<{ success: boolean; updatedProject?: any; error?: string }> => {
    const isCloudSyncProject = !projectId.startsWith("project-ulid-");
    const now = new Date().toISOString();

    // 1. ALWAYS save locally first (Git-like behavior)
    let projectToSave: LocalProject | null = getProjectByIdFromLocal(projectId);

    if (!projectToSave) {
      // This case implies the project ID is for a cloud project not yet in local storage,
      // or a new project being saved for the first time.
      if (currentName === undefined) {
        const message =
          "Project not found locally and name not provided for potential creation/update.";
        console.error(message, { projectId });
        toast.error("Error saving: Project not found locally.");
        return { success: false, error: message };
      }
      projectToSave = {
        id: projectId,
        name: currentName,
        data: newData,
        createdAt: now, // Potentially problematic if it's an existing cloud project not yet local
        updatedAt: now,
      };
    } else {
      projectToSave = {
        ...projectToSave,
        data: newData,
        // If currentName is provided and different, update it. Otherwise, keep existing.
        name:
          currentName !== undefined && currentName !== projectToSave.name
            ? currentName
            : projectToSave.name,
        updatedAt: now, // This will be overridden by saveProjectToLocal anyway
      };
    }

    const localSavedProject = saveProjectToLocalWithTimestamp(
      projectToSave,
      now
    );
    if (!localSavedProject) {
      const message = "Failed to save project data locally.";
      toast.error(message);
      return { success: false, error: message };
    }

    // 2. For authenticated users with cloud projects, attempt cloud sync
    if (isCloudSyncProject && isSignedIn && isAuthenticated) {
      try {
        const cloudUpdatePayload: {
          id: Id<"projects">;
          data: ProjectData;
          updatedAt: string;
          name?: string;
        } = {
          id: projectId as Id<"projects">,
          data: newData,
          updatedAt: now, // Use the same timestamp
        };
        if (currentName !== undefined && currentName !== projectToSave.name) {
          // Only send name if it was intended to be updated
          cloudUpdatePayload.name = currentName;
        }

        const cloudUpdatedProject = await convexUpdateProjectMutation(
          cloudUpdatePayload
        );
        // Success: both local and cloud are now in sync
        return { success: true, updatedProject: cloudUpdatedProject };
      } catch (error) {
        console.error("Error updating cloud project data:", error);
        // Cloud sync failed, but local save succeeded
        // This ensures we always have the most recent version locally
        toast.warning("Saved locally. Cloud sync failed - will retry later.");
        return {
          success: true,
          updatedProject: localSavedProject,
          error: "cloud_update_failed",
        };
      }
    } else {
      // For unauthenticated users or local-only projects
      return { success: true, updatedProject: localSavedProject };
    }
  };

  return { updateProjectName, updateProjectData };
};
