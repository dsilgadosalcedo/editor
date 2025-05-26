"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import CanvasPage from "@/features/canvas/components/CanvasPage";
import { useCanvasStore } from "@/features/canvas/store/useCanvasStore";

export default function CanvasSlugPage() {
  const params = useParams();
  const router = useRouter();
  const { loadProjectBySlug } = useCanvasStore();

  const slug = params.slug as string;

  useEffect(() => {
    if (slug) {
      const success = loadProjectBySlug(slug);
      if (!success) {
        // Project not found, redirect to projects page
        router.push("/projects");
      }
    }
  }, [slug, loadProjectBySlug, router]);

  return (
    <main>
      <CanvasPage />
    </main>
  );
}
