"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
// import { useCanvasStore } from "@/features/canvas/store/useCanvasStore"; // No longer needed for createNewProject
import { useHybridProjects } from "@/features/projects/hooks/useHybridProjects"; // Import useHybridProjects

export default function CanvasHome() {
  const router = useRouter(); // Keep router if handleCreateNew doesn't always redirect or if needed for fallback
  const { handleCreateNew, isLoading: isLoadingProjects } = useHybridProjects(); // Get handleCreateNew and loading state

  useEffect(() => {
    // If projects are still loading (which includes auth checks), don't try to create yet.
    if (isLoadingProjects) {
      return;
    }
    // handleCreateNew is async and will handle routing internally
    handleCreateNew();
    // The original router.push(`/canvas/${project.id}`); is now handled by handleCreateNew.
  }, [handleCreateNew, isLoadingProjects, router]); // Add isLoadingProjects to dependencies

  return (
    <main className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Creating new project...</p>
      </div>
    </main>
  );
}
