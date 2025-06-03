"use client";

import { useHybridProjects } from "../hooks/useHybridProjects";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Cloud, Plus, Trash2, Database, Info } from "lucide-react";
import { ProjectCard, ProjectCardSkeleton, EmptyState } from ".";
import { CloudStorageWarning } from "./CloudStorageWarning";
import Image from "next/image";
import { ThemeToggle } from "@/features/canvas/components/ThemeToggle";
import { SignInButton, UserButton } from "@clerk/nextjs";
import { Authenticated, Unauthenticated } from "convex/react";
import { useGlobalKeyboardShortcuts } from "@/hooks/useGlobalKeyboardShortcuts";
import { Skeleton } from "@/components/ui/skeleton";
import { clearAllProjects } from "@/lib/project-storage";
import { useCanvasStore } from "@/features/canvas/store/useCanvasStore.new";
import { toast } from "sonner";

interface ProjectLimitBadgeProps {
  isLoading: boolean;
  getProjectLimitStats: () => {
    current: number;
    remaining: number;
    isAtLimit: boolean;
  };
}

const ProjectLimitBadge = ({
  isLoading,
  getProjectLimitStats,
}: ProjectLimitBadgeProps) => {
  if (isLoading) return null;

  const stats = getProjectLimitStats();

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Badge variant="secondary" className="cursor-help">
          <Database size={14} />
          {stats.current}/10
        </Badge>
      </HoverCardTrigger>
      <HoverCardContent side="bottom" className="w-80">
        <div className="space-y-2">
          <h4 className="text-sm font-semibold">Project Limit</h4>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>
              You have <strong>{stats.current} of 10</strong> allowed projects
            </p>
            {stats.isAtLimit ? (
              <p className="text-xs pt-1 border-t text-orange-600 dark:text-orange-400">
                <Info size={14} className="inline mr-1" />
                Limit reached! Delete some projects to create new ones.
              </p>
            ) : (
              <p className="text-xs pt-1 border-t">
                You can create <strong>{stats.remaining} more</strong> projects
                before reaching the limit.
              </p>
            )}
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};

interface HeaderActionsProps {
  isLoading: boolean;
  getDuplicateStats: () => { duplicates: number };
  handleCleanupDuplicates: () => void;
  handleCreateNew: () => void;
  getProjectLimitStats: () => {
    current: number;
    remaining: number;
    isAtLimit: boolean;
  };
}

const HeaderActions = ({
  isLoading,
  getDuplicateStats,
  handleCleanupDuplicates,
  handleCreateNew,
  getProjectLimitStats,
}: HeaderActionsProps) => {
  const limitStats = getProjectLimitStats();
  const isAtLimit = !isLoading && limitStats.isAtLimit;

  return (
    <div className="flex items-center gap-2">
      <ThemeToggle />
      {!isLoading && getDuplicateStats().duplicates > 0 && (
        <Button
          onClick={handleCleanupDuplicates}
          variant="outline"
          className="text-orange-600 border-orange-200 hover:bg-orange-50 dark:text-orange-400 dark:border-orange-800 dark:hover:bg-orange-950"
        >
          <Trash2 />
          Clean Duplicates ({getDuplicateStats().duplicates})
        </Button>
      )}

      {!isLoading ? (
        <Button
          onClick={handleCreateNew}
          className="flex items-center gap-2"
          disabled={isAtLimit}
          variant={isAtLimit ? "outline" : "default"}
        >
          <Plus />
          New Project
        </Button>
      ) : (
        <Skeleton className="w-32.5 h-9" />
      )}

      <Authenticated>
        <UserButton afterSignOutUrl="/projects" />
      </Authenticated>

      <Unauthenticated>
        <SignInButton mode="modal" fallbackRedirectUrl="/projects">
          <Button>
            <Cloud />
            Sign In to Save
          </Button>
        </SignInButton>
      </Unauthenticated>
    </div>
  );
};

export default function ProjectsPage() {
  const projectsHook = useHybridProjects();
  const {
    projects,
    isLoading: hookIsLoading,
    handleCreateNew,
    handleOpenProject,
    handleDeleteProject,
    handleUpdateProjectName,
    refreshProjects,
    handleCleanupDuplicates,
    getDuplicateStats,
    getProjectLimitStats,
  } = projectsHook;

  // Global keyboard shortcuts (including theme toggle)
  useGlobalKeyboardShortcuts();

  // Ensure isLoading is always a boolean
  const isLoading = Boolean(hookIsLoading);

  const renderContent = () => {
    if (isLoading) return <ProjectCardSkeleton />;

    if (projects.length === 0)
      return <EmptyState onCreateNew={handleCreateNew} />;

    return (
      <>
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
      </>
    );
  };

  return (
    <div className="relative min-h-screen bg-background">
      <main className="container mx-auto px-6 py-8">
        <Unauthenticated>
          <CloudStorageWarning />
        </Unauthenticated>

        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="border">
              <Image src="/favicon.ico" alt="text" width={24} height={24} />
            </Button>
            <h1 className="text-3xl font-bold text-foreground">My Projects</h1>
            <ProjectLimitBadge
              isLoading={isLoading}
              getProjectLimitStats={getProjectLimitStats}
            />
          </div>
          <HeaderActions
            isLoading={isLoading}
            getDuplicateStats={getDuplicateStats}
            handleCleanupDuplicates={handleCleanupDuplicates}
            handleCreateNew={handleCreateNew}
            getProjectLimitStats={getProjectLimitStats}
          />
        </header>

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 items-start">
          {renderContent()}
        </section>
      </main>
    </div>
  );
}
