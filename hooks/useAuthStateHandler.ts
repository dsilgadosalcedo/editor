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

  // Use optimized selector to prevent unnecessary re-renders
  const clearCurrentProject = useCanvasStore(
    (state) => state.clearCurrentProject
  );
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

    // On first load, just record state; do not clear local projects for anonymous users
    if (!hasInitialized.current) {
      hasInitialized.current = true;
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

  // Remove over-eager clearing for anonymous state; only clear on real sign-out above
};
