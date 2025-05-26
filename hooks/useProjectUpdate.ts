"use client";

import { useAuth } from "@clerk/nextjs";
import { useConvexAuth, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { updateProjectName as updateLocalProjectName } from "@/lib/project-storage";
import { Id } from "@/convex/_generated/dataModel";

export const useProjectUpdate = () => {
  const { isSignedIn } = useAuth();
  const { isAuthenticated } = useConvexAuth();
  const updateCloudProject = useMutation(api.projects.updateProject);

  const updateProjectName = async (
    projectId: string,
    newName: string
  ): Promise<{ success: boolean; updatedProject?: any; newSlug?: string }> => {
    // Check if it's a cloud project (Convex IDs don't start with "project-")
    const isCloudProject = !projectId.startsWith("project-");

    if (isCloudProject && isSignedIn && isAuthenticated) {
      try {
        // For cloud projects, only update the name - let the backend handle slug generation
        const updatedProject = await updateCloudProject({
          id: projectId as Id<"projects">,
          name: newName,
        });

        return {
          success: true,
          updatedProject,
          newSlug: updatedProject.slug,
        };
      } catch (error) {
        console.error("Error updating cloud project name:", error);
        return { success: false };
      }
    } else {
      // Use local storage
      try {
        const updatedProject = updateLocalProjectName(projectId, newName);
        if (updatedProject) {
          return {
            success: true,
            updatedProject,
            newSlug: updatedProject.slug,
          };
        }
        return { success: false };
      } catch (error) {
        console.error("Error updating local project name:", error);
        return { success: false };
      }
    }
  };

  return { updateProjectName };
};
