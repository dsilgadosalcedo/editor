"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useHybridProjects } from "@/features/projects/hooks/useHybridProjects";
import { useGlobalKeyboardShortcuts } from "@/hooks/useGlobalKeyboardShortcuts";
import { toast } from "sonner";

export default function CanvasHome() {
  const router = useRouter();
  const {
    handleCreateNew,
    isLoading: isLoadingProjects,
    getProjectLimitStats,
  } = useHybridProjects();
  const creationInProgress = useRef(false);
  const hasCreated = useRef(false);
  const hasCheckedLimit = useRef(false);

  // Global keyboard shortcuts (including theme toggle)
  useGlobalKeyboardShortcuts();

  useEffect(() => {
    // Prevent multiple project creations
    if (hasCreated.current || creationInProgress.current) {
      return;
    }

    // If projects are still loading (which includes auth checks), don't try to create yet.
    if (isLoadingProjects) {
      return;
    }

    // Check project limit before creating
    if (!hasCheckedLimit.current) {
      const limitStats = getProjectLimitStats();
      if (limitStats.isAtLimit) {
        toast.error(
          `Project limit reached! You have ${limitStats.current}/10 projects. Please delete some projects before creating new ones.`
        );
        router.push("/projects");
        return;
      }
      hasCheckedLimit.current = true;
    }

    // Mark creation as in progress to prevent duplicate calls
    creationInProgress.current = true;
    hasCreated.current = true;

    // handleCreateNew is async and will handle routing internally
    handleCreateNew(true).finally(() => {
      creationInProgress.current = false;
    });
  }, [handleCreateNew, isLoadingProjects, getProjectLimitStats, router]);

  return (
    <main className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-[0.5px] border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Creating new project...</p>
      </div>
    </main>
  );
}
