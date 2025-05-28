"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@clerk/nextjs";
import { clearAllProjects } from "@/lib/project-storage";
import { useCanvasStore } from "@/features/canvas/store/useCanvasStore";
import { toast } from "sonner";

/**
 * Custom hook that handles authentication state changes
 * Clears all projects from local storage when user signs out
 */
export const useAuthStateHandler = () => {
  const { isSignedIn, isLoaded } = useAuth();
  const { clearCurrentProject } = useCanvasStore();
  const previousSignedInState = useRef<boolean | undefined | null>(null);
  const hasInitialized = useRef(false);

  useEffect(() => {
    // Add detailed logging for debugging
    console.log("Auth state change detected:", {
      isSignedIn,
      isLoaded,
      previousState: previousSignedInState.current,
      hasInitialized: hasInitialized.current,
    });

    // Wait for auth to be loaded before processing
    if (!isLoaded) {
      console.log("Auth not loaded yet, skipping...");
      return;
    }

    // On first load, if user is not signed in, clear any existing projects immediately
    if (!hasInitialized.current) {
      hasInitialized.current = true;

      if (isSignedIn === false) {
        console.log(
          "🧹 Initial load: User not signed in, clearing any existing local projects..."
        );
        const result = clearAllProjects();
        clearCurrentProject();

        if (result.success && result.cleared > 0) {
          console.log(
            `✅ Cleared ${result.cleared} existing projects on initial load`
          );
        }
      }

      previousSignedInState.current = isSignedIn;
      return;
    }

    // Detect sign out: was signed in, now not signed in
    if (previousSignedInState.current === true && isSignedIn === false) {
      console.log(
        "🚪 Sign out detected! Clearing local projects immediately..."
      );

      const result = clearAllProjects();
      clearCurrentProject();

      if (result.success && result.cleared > 0) {
        console.log(
          `✅ Cleared ${result.cleared} projects from local storage on sign out`
        );
      } else if (result.success && result.cleared === 0) {
        console.log("ℹ️ No local projects to clear on sign out");
      } else {
        console.error("❌ Failed to clear local projects on sign out");
        toast.error("Failed to clear local projects");
      }
    } else if (previousSignedInState.current === false && isSignedIn === true) {
      console.log("🔑 Sign in detected");
    }

    // Update the previous state
    console.log(
      "Updating previous state from",
      previousSignedInState.current,
      "to",
      isSignedIn
    );
    previousSignedInState.current = isSignedIn;
  }, [isSignedIn, isLoaded, clearCurrentProject]);

  // Additional effect to handle immediate clearing when not signed in
  useEffect(() => {
    if (isLoaded && isSignedIn === false && hasInitialized.current) {
      // This ensures projects are cleared immediately when auth state becomes false
      // This runs on every render when user is not signed in, but clearAllProjects
      // is safe to call multiple times
      const result = clearAllProjects();
      if (result.cleared > 0) {
        console.log(`🧹 Immediate cleanup: Cleared ${result.cleared} projects`);
      }
    }
  }, [isSignedIn, isLoaded]);
};
