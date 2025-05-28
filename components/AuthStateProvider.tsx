"use client";

import { useAuthStateHandler } from "@/hooks/useAuthStateHandler";

/**
 * Provider component that handles authentication state changes globally
 * This component should be placed high in the component tree to ensure
 * it monitors auth state changes across the entire application
 */
export const AuthStateProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  // Handle authentication state changes (clear local storage on sign out)
  useAuthStateHandler();

  return <>{children}</>;
};
