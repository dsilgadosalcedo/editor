"use client";

import { useEffect, useRef } from "react";
import { useHybridProjects } from "@/features/projects/hooks/useHybridProjects";

export default function CanvasHome() {
  const { handleCreateNew, isLoading: isLoadingProjects } = useHybridProjects();
  const creationInProgress = useRef(false);
  const hasCreated = useRef(false);

  useEffect(() => {
    // Prevent multiple project creations
    if (hasCreated.current || creationInProgress.current) {
      return;
    }

    // If projects are still loading (which includes auth checks), don't try to create yet.
    if (isLoadingProjects) {
      return;
    }

    // Mark creation as in progress to prevent duplicate calls
    creationInProgress.current = true;
    hasCreated.current = true;

    // handleCreateNew is async and will handle routing internally
    handleCreateNew().finally(() => {
      creationInProgress.current = false;
    });
  }, [handleCreateNew, isLoadingProjects]);

  return (
    <main className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-[0.5px] border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Creating new project...</p>
      </div>
    </main>
  );
}
