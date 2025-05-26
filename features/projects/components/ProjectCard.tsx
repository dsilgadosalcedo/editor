"use client";

import { useState, useEffect } from "react";
import { type Project } from "@/lib/project-storage";
import { updateProjectName } from "@/lib/project-storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardAction,
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Trash2, Info } from "lucide-react";
import DeleteConfirmDialog from "./DeleteConfirmDialog";

interface ProjectCardProps {
  project: Project;
  onOpen: () => void;
  onDelete: () => void;
  onProjectUpdate?: (updatedProject: Project) => void;
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function ProjectCard({
  project,
  onOpen,
  onDelete,
  onProjectUpdate,
}: ProjectCardProps) {
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [editName, setEditName] = useState(project.name);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Sync editName with project name when it changes
  useEffect(() => {
    setEditName(project.name);
  }, [project.name]);

  const handleSaveEdit = () => {
    if (editName.trim() && editName !== project.name) {
      const updatedProject = updateProjectName(project.id, editName.trim());
      if (updatedProject && onProjectUpdate) {
        onProjectUpdate(updatedProject);
      }
    }
    setEditName(project.name);
  };

  const handleCancelEdit = () => {
    setEditName(project.name);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSaveEdit();
    } else if (e.key === "Escape") {
      handleCancelEdit();
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div className="flex-1 mr-2">
          <CardTitle>
            <Input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={handleSaveEdit}
              onKeyDown={handleKeyDown}
              maxLength={50}
            />
          </CardTitle>
        </div>
        <div className="flex items-center gap-1">
          <Collapsible open={isInfoOpen} onOpenChange={setIsInfoOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="icon" title="Project info">
                <Info />
              </Button>
            </CollapsibleTrigger>
          </Collapsible>
          <Button
            variant="destructive"
            size="icon"
            onClick={() => setIsDeleteDialogOpen(true)}
            title="Delete project"
          >
            <Trash2 />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <Collapsible open={isInfoOpen} onOpenChange={setIsInfoOpen}>
          <CollapsibleContent>
            <div className="text-sm text-muted-foreground mb-4 space-y-1 p-3 bg-muted/30 rounded-md">
              <div>Created: {formatDate(project.createdAt)}</div>
              <div>Updated: {formatDate(project.updatedAt)}</div>
              <div>{project.data.elements.length} elements</div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        <Button
          onClick={onOpen}
          variant="secondary"
          className="w-full"
          aria-label={`Open ${project.name} project`}
        >
          Open Project
        </Button>
      </CardContent>

      <DeleteConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        projectName={project.name}
        onConfirm={onDelete}
      />
    </Card>
  );
}
