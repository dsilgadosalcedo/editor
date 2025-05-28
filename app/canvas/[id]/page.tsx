"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import CanvasPage from "@/features/canvas/components/CanvasPage";
import { useCanvasStore } from "@/features/canvas/store/useCanvasStore";
import { useAuth } from "@clerk/nextjs";
import { useConvexAuth, useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import {
  getProjectByIdFromLocal,
  Project as LocalProject,
} from "@/lib/project-storage";
import { toast } from "sonner";

export default function CanvasIdPage() {
  const params = useParams();
  const router = useRouter();
  const loadProjectIntoStore = useCanvasStore((state) => state.loadProjectById);
  const loadCloudProjectIntoStore = useCanvasStore(
    (state) => state.loadCloudProject
  );
  const { isSignedIn } = useAuth();
  const { isAuthenticated, isLoading: convexAuthLoading } = useConvexAuth();
  const [isLoadingPage, setIsLoadingPage] = useState(true);

  // Convex mutation for updating cloud projects
  const convexUpdateProject = useMutation(api.projects.updateProject);

  const projectIdFromParams = params.id as string;
  const isIdForCloudProject =
    projectIdFromParams && !projectIdFromParams.startsWith("project-ulid-");

  const skipCloudQuery =
    !isIdForCloudProject || !isSignedIn || !isAuthenticated;
  const cloudProjectData = useQuery(
    api.projects.getProjectById,
    skipCloudQuery ? "skip" : { id: projectIdFromParams as Id<"projects"> }
  );

  useEffect(() => {
    const performLoadProject = async () => {
      if (!projectIdFromParams) {
        router.push("/projects");
        return;
      }
      setIsLoadingPage(true);

      if (!isSignedIn || !isAuthenticated || !isIdForCloudProject) {
        const localProjectExists = loadProjectIntoStore(projectIdFromParams);
        if (localProjectExists) {
          // Removed toast - user doesn't want informational toasts
        } else {
          toast.error("Local project not found.");
          router.push("/projects");
        }
        setIsLoadingPage(false);
        return;
      }

      if (convexAuthLoading) {
        return;
      }

      if (cloudProjectData === undefined && !skipCloudQuery) {
        return;
      }

      const localProject = getProjectByIdFromLocal(projectIdFromParams);

      if (cloudProjectData && localProject) {
        const cloudDate = new Date(cloudProjectData.updatedAt);
        const localDate = new Date(localProject.updatedAt);

        if (localDate > cloudDate) {
          // Local version is more recent, sync it to cloud and use it
          console.log(
            "Local version is newer, syncing to cloud:",
            localProject.name
          );
          // Removed toast - user doesn't want informational toasts

          try {
            await convexUpdateProject({
              id: projectIdFromParams as Id<"projects">,
              name: localProject.name,
              data: localProject.data,
              updatedAt: localProject.updatedAt,
            });
            // Removed toast - user doesn't want informational toasts
          } catch (syncError) {
            console.error("Failed to sync local changes to cloud:", syncError);
            toast.warning(
              "Using local version. Cloud sync failed - will retry later."
            );
          }

          loadProjectIntoStore(localProject.id);
        } else if (cloudDate > localDate) {
          // Cloud version is more recent, use it and update local storage
          console.log(
            "Cloud version is newer, using cloud version:",
            cloudProjectData.name
          );
          loadCloudProjectIntoStore(cloudProjectData as LocalProject);
          // Removed toast - user doesn't want informational toasts
        } else {
          // Versions are the same, no need to show toast
          console.log(
            "Cloud and local versions are in sync:",
            cloudProjectData.name
          );
          loadCloudProjectIntoStore(cloudProjectData as LocalProject);
          // No toast needed - versions are already in sync
        }
      } else if (cloudProjectData) {
        loadCloudProjectIntoStore(cloudProjectData as LocalProject);
        // Removed toast - user doesn't want informational toasts
      } else if (localProject && isIdForCloudProject) {
        loadProjectIntoStore(localProject.id);
        // Removed toast - user doesn't want informational toasts
      } else if (localProject && !isIdForCloudProject) {
        loadProjectIntoStore(localProject.id);
        // Removed toast - user doesn't want informational toasts
      } else {
        toast.error("Project not found.");
        router.push("/projects");
      }
      setIsLoadingPage(false);
    };

    performLoadProject();
  }, [
    projectIdFromParams,
    loadProjectIntoStore,
    loadCloudProjectIntoStore,
    isSignedIn,
    isAuthenticated,
    convexAuthLoading,
    cloudProjectData,
    router,
    isIdForCloudProject,
    skipCloudQuery,
  ]);

  const isEffectivelyLoading =
    isLoadingPage ||
    (isIdForCloudProject &&
      isSignedIn &&
      isAuthenticated &&
      !convexAuthLoading &&
      cloudProjectData === undefined &&
      !skipCloudQuery);

  if (isEffectivelyLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-[0.5px] border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading project...</p>
        </div>
      </div>
    );
  }

  return (
    <main>
      <CanvasPage />
    </main>
  );
}
