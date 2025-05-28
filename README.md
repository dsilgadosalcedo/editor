This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

# Comprame

The best e-commerce creation tool

## Features

### Authentication State Management

The application automatically handles user authentication state changes to ensure data privacy with **multiple layers of protection**:

- **Immediate Project Clearing**: Projects are cleared **BEFORE** they can be displayed when a user signs out, preventing any flash of content from previous sessions.

- **Multi-Layer Protection**:

  1. **Global Authentication Monitoring**: Uses a global `useAuthStateHandler` hook that monitors authentication state changes
  2. **Project Loading Guard**: Checks authentication state before loading projects and clears them immediately if user is not signed in
  3. **Initial Load Cleanup**: Clears any existing projects on app initialization if user is not signed in
  4. **Continuous Monitoring**: Additional effect that ensures projects stay cleared while user is not signed in

- **Automatic Local Storage Cleanup**: When a user signs out, all locally stored projects are automatically cleared from localStorage to ensure data privacy and prevent data leakage between different user sessions.

- **Seamless Cloud Migration**: When a user signs in, their local projects are automatically migrated to cloud storage (Convex) for persistent access across devices.

- **Canvas State Cleanup**: When signing out, the current project in the canvas store is also cleared to ensure no project data persists in memory.

#### Implementation Details

- **`useAuthStateHandler()`**: Enhanced custom hook in `hooks/useAuthStateHandler.ts` that provides immediate cleanup on sign out and initial load
- **`useHybridProjects()`**: Modified project loading logic in `features/projects/hooks/useHybridProjects.ts` that checks auth state before loading projects
- **`clearAllProjects()`**: Utility function in `lib/project-storage.ts` that safely removes all projects from localStorage
- **`AuthStateProvider`**: Global provider component that ensures authentication state monitoring across the entire application
- **Canvas Store Integration**: Clears current project from canvas store on sign out

#### How It Works

1. **Immediate Clearing**: When auth state changes to signed out, projects are cleared **immediately** before any rendering occurs
2. **Project Loading Guard**: The project loading logic checks if user is signed in before loading any local projects
3. **Initial Load Protection**: On app startup, if user is not signed in, any existing projects are cleared immediately
4. **Global Monitoring**: The `useAuthStateHandler` hook runs globally via the `AuthStateProvider` component in the app layout
5. **State Detection**: Monitors `isSignedIn` state from Clerk's `useAuth` hook with enhanced timing
6. **Local Storage Cleanup**: Calls `clearAllProjects()` to remove all projects from localStorage
7. **Canvas Cleanup**: Calls `clearCurrentProject()` to clear the current project from the canvas store
8. **User Feedback**: Shows toast notifications to inform the user about the cleanup process
9. **Detailed Logging**: Provides comprehensive console logs for debugging and monitoring

#### Benefits

- **No Flash of Content**: Projects are never displayed when user is not signed in - they're cleared before rendering
- **Data Privacy**: Ensures no user data persists locally after sign out
- **Automatic**: No manual intervention required from users
- **Reliable**: Multiple protection layers ensure consistent behavior
- **Fast**: Immediate clearing prevents any delay or visual artifacts
- **Debuggable**: Comprehensive logging for troubleshooting
- **User-Friendly**: Toast notifications keep users informed

#### Fixed Issues

- **Timing Problem**: Previously, projects would load and display briefly before being cleared on sign out
- **Race Conditions**: Multiple protection layers prevent race conditions between auth state changes and project loading
- **Visual Artifacts**: No more flash of projects from previous sessions when signing out

## Development

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build
```

## Tech Stack

- **Framework**: Next.js 15
- **Authentication**: Clerk
- **Database**: Convex
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI + shadcn/ui
- **State Management**: Zustand
- **TypeScript**: Full type safety
