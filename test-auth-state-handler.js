/**
 * Manual Test for Authentication State Handler
 *
 * This file demonstrates how the authentication state handler works
 * and can be used for manual testing of the sign-out functionality.
 *
 * IMPROVED IMPLEMENTATION:
 * The application now uses multiple layers of protection to ensure projects
 * are cleared IMMEDIATELY when the user signs out, preventing them from
 * being displayed even briefly.
 *
 * PROTECTION LAYERS:
 * 1. Global auth state handler that detects sign out events
 * 2. Project loading logic that checks auth state before loading
 * 3. Immediate cleanup on initial load if user is not signed in
 * 4. Additional effect that runs on every render when user is not signed in
 *
 * To test the IMPROVED AUTH STATE HANDLER:
 * 1. Run the application: pnpm dev
 * 2. Create some local projects (while signed out)
 * 3. Sign in to the application
 * 4. Go to /projects page
 * 5. Click on your user avatar (UserButton) in the top right
 * 6. Click "Sign out" from the dropdown menu
 * 7. Projects should be cleared IMMEDIATELY without being displayed
 * 8. Check browser console for confirmation messages like:
 *    - "🧹 User not signed in but local projects found, clearing them..."
 *    - "🚪 Sign out detected! Clearing local projects immediately..."
 *    - "✅ Cleared X projects from local storage on sign out"
 * 9. Check localStorage to verify projects are removed
 * 10. You should see a toast notification about cleared projects
 *
 * WHAT HAPPENS AUTOMATICALLY:
 * - Projects are cleared BEFORE they can be displayed
 * - Multiple cleanup mechanisms ensure no projects persist
 * - Both localStorage and canvas store are cleared
 * - Toast notifications inform the user
 * - Detailed logging helps with debugging
 *
 * DEBUGGING:
 * - Open browser console to see detailed logs
 * - Check localStorage before and after sign out
 * - Look for toast notifications
 * - Verify that projects are never displayed when user is signed out
 * - Check that the project count shows 0 immediately after sign out
 */

// Simulate the clearAllProjects function for testing
const PROJECTS_STORAGE_KEY = "canvas-projects";

const clearAllProjects = () => {
  if (typeof window === "undefined") {
    return { cleared: 0, success: false };
  }

  try {
    const stored = localStorage.getItem(PROJECTS_STORAGE_KEY);
    const projects = stored ? JSON.parse(stored) : [];
    const projectCount = projects.length;

    localStorage.removeItem(PROJECTS_STORAGE_KEY);

    return {
      cleared: projectCount,
      success: true,
    };
  } catch (error) {
    console.error("Error clearing projects from localStorage:", error);
    return {
      cleared: 0,
      success: false,
    };
  }
};

// Test function to create sample projects
const createTestProjects = () => {
  const testProjects = [
    {
      id: "test-1",
      name: "Test Project 1",
      data: { elements: [], artboardDimensions: { width: 1024, height: 576 } },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "test-2",
      name: "Test Project 2",
      data: { elements: [], artboardDimensions: { width: 1024, height: 576 } },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "test-3",
      name: "Test Project 3",
      data: { elements: [], artboardDimensions: { width: 1024, height: 576 } },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "test-4",
      name: "Test Project 4",
      data: { elements: [], artboardDimensions: { width: 1024, height: 576 } },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "test-5",
      name: "Test Project 5",
      data: { elements: [], artboardDimensions: { width: 1024, height: 576 } },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(testProjects));
  console.log("✅ Created test projects:", testProjects);
  return testProjects;
};

// Test function to verify projects are cleared
const testClearProjects = () => {
  console.log("=== Testing clearAllProjects functionality ===");

  // Create test projects
  const projects = createTestProjects();
  console.log("Before clearing - Projects in localStorage:", projects.length);

  // Clear projects
  const result = clearAllProjects();
  console.log("Clear result:", result);

  // Verify projects are cleared
  const remainingProjects = localStorage.getItem(PROJECTS_STORAGE_KEY);
  console.log("After clearing - Projects in localStorage:", remainingProjects);

  if (result.success && result.cleared === 5 && remainingProjects === null) {
    console.log("✅ Test PASSED: Projects successfully cleared");
  } else {
    console.log("❌ Test FAILED: Projects not properly cleared");
  }
};

// Test function to check current localStorage state
const checkCurrentState = () => {
  console.log("=== Current localStorage state ===");
  const stored = localStorage.getItem(PROJECTS_STORAGE_KEY);
  const projects = stored ? JSON.parse(stored) : [];
  console.log("Current projects in localStorage:", projects.length);
  console.log("Projects:", projects);
};

// Test function to simulate the improved auth state handler behavior
const simulateImprovedAuthStateHandler = () => {
  console.log("=== Simulating IMPROVED Auth State Handler ===");

  // Create some test projects first
  createTestProjects();

  console.log("🔑 Simulating sign in...");
  console.log("User is now signed in, projects are available");

  setTimeout(() => {
    console.log("🚪 Simulating sign out...");
    console.log(
      "Auth state change detected: isSignedIn changed from true to false"
    );

    // Simulate the immediate clearing that happens in the project loading logic
    console.log(
      "🧹 Project loading logic: User not signed in but local projects found, clearing them..."
    );

    const result = clearAllProjects();

    if (result.success && result.cleared > 0) {
      console.log(
        `✅ Cleared ${result.cleared} projects IMMEDIATELY (before display)`
      );
      console.log("📱 Toast notification: Cleared local projects on sign out");
      console.log(
        "🎯 Projects were cleared BEFORE they could be displayed to user"
      );
    } else if (result.success && result.cleared === 0) {
      console.log("ℹ️ No local projects to clear on sign out");
    } else {
      console.error("❌ Failed to clear local projects on sign out");
    }
  }, 2000);
};

// Test function to simulate the timing issue that was fixed
const simulateTimingFix = () => {
  console.log("=== Demonstrating Timing Fix ===");

  createTestProjects();

  console.log("❌ OLD BEHAVIOR: Projects would load first, then get cleared");
  console.log("1. Projects load from localStorage");
  console.log("2. Projects are displayed to user");
  console.log("3. Auth state handler detects sign out");
  console.log("4. Projects are cleared (too late!)");

  setTimeout(() => {
    console.log("\n✅ NEW BEHAVIOR: Projects are cleared before display");
    console.log("1. Auth state is checked BEFORE loading projects");
    console.log(
      "2. If user is not signed in, projects are cleared immediately"
    );
    console.log("3. Empty project list is displayed");
    console.log("4. No flash of projects before clearing");

    clearAllProjects();
    console.log("🎯 Projects cleared immediately - no flash of content!");
  }, 3000);
};

// Export for browser console testing
if (typeof window !== "undefined") {
  window.testAuthStateHandler = {
    clearAllProjects,
    createTestProjects,
    testClearProjects,
    checkCurrentState,
    simulateImprovedAuthStateHandler,
    simulateTimingFix,
  };

  console.log("🧪 IMPROVED Auth State Handler test functions available:");
  console.log("- window.testAuthStateHandler.createTestProjects()");
  console.log("- window.testAuthStateHandler.clearAllProjects()");
  console.log("- window.testAuthStateHandler.testClearProjects()");
  console.log("- window.testAuthStateHandler.checkCurrentState()");
  console.log(
    "- window.testAuthStateHandler.simulateImprovedAuthStateHandler()"
  );
  console.log("- window.testAuthStateHandler.simulateTimingFix()");
}

// Run test if in Node.js environment
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    clearAllProjects,
    createTestProjects,
    testClearProjects,
    checkCurrentState,
    simulateImprovedAuthStateHandler,
    simulateTimingFix,
  };
}
