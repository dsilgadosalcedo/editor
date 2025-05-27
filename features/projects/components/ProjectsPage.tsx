"use client";

import { useHybridProjects } from "../hooks/useHybridProjects";
import { Button } from "@/components/ui/button";
import { Cloud, Plus } from "lucide-react";
import { ProjectCard, ProjectCardSkeleton, EmptyState } from ".";
import { CloudStorageWarning } from "./CloudStorageWarning";
import Image from "next/image";
import { ThemeToggle } from "@/features/canvas/components/ThemeToggle";
import { SignInButton, UserButton } from "@clerk/nextjs";
import { Authenticated, Unauthenticated } from "convex/react";

function AuthenticatedContent() {
  const {
    projects,
    isLoading,
    handleCreateNew,
    handleOpenProject,
    handleDeleteProject,
    handleUpdateProjectName,
    refreshProjects,
  } = useHybridProjects();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-6 py-8">
          <header className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <div className="w-10 h-9 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse border"></div>
              <div className="h-9 w-48 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-10 h-9 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
              <div className="h-9 w-32 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
              <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
            </div>
          </header>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <ProjectCardSkeleton key={index} />
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-6 py-8">
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="border">
              <Image src="/favicon.ico" alt="text" width={24} height={24} />
            </Button>
            <h1 className="text-3xl font-bold text-foreground">My Projects</h1>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button
              onClick={handleCreateNew}
              className="flex items-center gap-2"
            >
              <Plus />
              New Project
            </Button>
            <UserButton afterSignOutUrl="/projects" />
          </div>
        </header>

        {projects.length === 0 ? (
          <EmptyState onCreateNew={handleCreateNew} />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onOpen={() => handleOpenProject(project.id)}
                onDelete={() => handleDeleteProject(project.id)}
                onProjectUpdate={() => refreshProjects()}
                onUpdateProjectName={handleUpdateProjectName}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function UnauthenticatedContent() {
  const {
    projects,
    isLoading,
    handleCreateNew,
    handleOpenProject,
    handleDeleteProject,
    handleUpdateProjectName,
    refreshProjects,
  } = useHybridProjects();

  return (
    <div className="relative min-h-screen bg-background">
      <main className="container mx-auto px-6 py-8">
        {/* Show warning for unauthenticated users */}
        <CloudStorageWarning />

        <header className="z-20 flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="border">
              <Image src="/favicon.ico" alt="text" width={24} height={24} />
            </Button>
            <h1 className="text-3xl font-bold text-foreground">My Projects</h1>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button onClick={handleCreateNew}>
              <Plus />
              New Project
            </Button>
            <SignInButton mode="modal" fallbackRedirectUrl="/projects">
              <Button>
                <Cloud />
                Sign In to Save
              </Button>
            </SignInButton>
          </div>
        </header>

        {isLoading ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 1 }).map((_, index) => (
              <ProjectCardSkeleton key={index} />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
            <EmptyState onCreateNew={handleCreateNew} />
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onOpen={() => handleOpenProject(project.id)}
                onDelete={() => handleDeleteProject(project.id)}
                onProjectUpdate={() => refreshProjects()}
                onUpdateProjectName={handleUpdateProjectName}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default function ProjectsPage() {
  return (
    <>
      <Unauthenticated>
        <UnauthenticatedContent />
      </Unauthenticated>

      <Authenticated>
        <AuthenticatedContent />
      </Authenticated>
    </>
  );
}
