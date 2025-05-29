"use client";

import { useEffect, useRef } from "react";
import { useCanvasStore } from "@/features/canvas/store/useCanvasStore";
import { useProjectUpdate } from "@/hooks/useProjectUpdate";
import { useAuth } from "@clerk/nextjs";
import { useConvexAuth } from "convex/react";
import {
  useElements,
  useArtboardDimensions,
  useProjectId,
  useProjectName,
} from "../store/selectors";

export const AutoSave = () => {
  const { isSignedIn } = useAuth();
  const { isAuthenticated } = useConvexAuth();
  const { updateProjectData } = useProjectUpdate();

  // Use optimized selectors to prevent unnecessary re-renders
  const elements = useElements();
  const artboardDimensions = useArtboardDimensions();
  const projectId = useProjectId();
  const projectName = useProjectName();

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedDataRef = useRef<string>("");

  useEffect(() => {
    // Don't auto-save if there's no project loaded
    if (!projectId) return;

    // Create a serialized version of the current state for comparison
    const currentData = JSON.stringify({
      elements,
      artboardDimensions,
    });

    // Only save if the data has actually changed
    if (currentData === lastSavedDataRef.current) return;

    // Clear any existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set a new timeout to save after a short delay (debounce)
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        const result = await updateProjectData(
          projectId,
          {
            elements,
            artboardDimensions,
          },
          projectName
        );

        if (result.success) {
          // Update the last saved data reference
          lastSavedDataRef.current = currentData;
          console.log("Auto-saved project:", projectName);
        } else {
          console.error("Auto-save failed:", result.error);
        }
      } catch (error) {
        console.error("Auto-save error:", error);
      }
    }, 1000); // Save after 1 second of inactivity

    // Cleanup function
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [
    elements,
    artboardDimensions,
    projectId,
    projectName,
    updateProjectData,
    isSignedIn,
    isAuthenticated,
  ]);

  // This component doesn't render anything
  return null;
};
