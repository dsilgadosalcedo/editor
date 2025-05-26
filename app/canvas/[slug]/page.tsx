"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import CanvasPage from "@/features/canvas/components/CanvasPage";
import { useCanvasStore } from "@/features/canvas/store/useCanvasStore";
import { useAuth } from "@clerk/nextjs";
import { useConvexAuth, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function CanvasSlugPage() {
  const params = useParams();
  const router = useRouter();
  const { loadProjectBySlug, loadCloudProject } = useCanvasStore();
  const { isSignedIn } = useAuth();
  const { isAuthenticated } = useConvexAuth();
  const [isLoading, setIsLoading] = useState(true);

  const slug = params.slug as string;

  // Query cloud project by slug if authenticated
  const cloudProject = useQuery(
    api.projects.getProjectBySlug,
    isSignedIn && isAuthenticated ? { slug } : "skip"
  );

  useEffect(() => {
    const loadProject = async () => {
      if (!slug) return;

      setIsLoading(true);

      // First try local storage
      const localSuccess = loadProjectBySlug(slug);
      if (localSuccess) {
        setIsLoading(false);
        return;
      }

      // If authenticated, try cloud storage
      if (isSignedIn && isAuthenticated) {
        if (cloudProject !== undefined) {
          if (cloudProject) {
            // Found in cloud, load it
            loadCloudProject(cloudProject);
            setIsLoading(false);
            return;
          } else {
            // Not found in cloud either
            router.push("/projects");
            return;
          }
        }
        // Still loading cloud project, wait
        return;
      }

      // Not authenticated and not found locally
      router.push("/projects");
    };

    loadProject();
  }, [
    slug,
    loadProjectBySlug,
    loadCloudProject,
    isSignedIn,
    isAuthenticated,
    cloudProject,
    router,
  ]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
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
