"use client";

import { useProjects } from "../hooks/useProjects";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ProjectCard, ProjectCardSkeleton, EmptyState } from ".";
import Image from "next/image";
import { ThemeToggle } from "@/features/canvas/components/ThemeToggle";

export default function ProjectsPage() {
  const {
    projects,
    isLoading,
    handleCreateNew,
    handleOpenProject,
    handleDeleteProject,
    refreshProjects,
  } = useProjects();

  const handleProjectUpdate = (updatedProject: any) => {
    // Refresh the projects list to reflect the updated name
    refreshProjects();
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-6 py-8">
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="border">
              <Image
                src="/favicon.ico"
                alt="text"
                width={24}
                height={24}
                className="h-6 w-6"
              />
            </Button>
            <h1 className="text-3xl font-bold text-foreground">My Projects</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={handleCreateNew}>
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Button>
            <ThemeToggle />
          </div>
        </header>

        {isLoading ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 1 }).map((_, index) => (
              <ProjectCardSkeleton key={index} />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="fixed inset-0 flex items-center justify-center">
            <EmptyState onCreateNew={handleCreateNew} />
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onOpen={() => handleOpenProject(project.slug)}
                onDelete={() => handleDeleteProject(project.id)}
                onProjectUpdate={handleProjectUpdate}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
