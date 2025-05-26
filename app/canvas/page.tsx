"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCanvasStore } from "@/features/canvas/store/useCanvasStore";

export default function CanvasHome() {
  const router = useRouter();
  const { createNewProject } = useCanvasStore();

  useEffect(() => {
    // Create a new project and redirect to its canvas
    const project = createNewProject();
    router.push(`/canvas/${project.slug}`);
  }, [createNewProject, router]);

  return (
    <main className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Creating new project...</p>
      </div>
    </main>
  );
}
