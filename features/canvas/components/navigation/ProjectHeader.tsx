"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCanvasStore } from "../../store/useCanvasStore";
import { useProjectUpdate } from "@/hooks/useProjectUpdate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ChevronLeft, FolderOpen } from "lucide-react";

export default function ProjectHeader() {
  const router = useRouter();
  const { projectName, projectId, setProjectName, setProjectData } =
    useCanvasStore();
  const { updateProjectName } = useProjectUpdate();
  const [editName, setEditName] = useState(projectName);

  // Sync editName with projectName when it changes
  useEffect(() => {
    setEditName(projectName);
  }, [projectName]);

  const handleSaveEdit = async () => {
    if (editName.trim() && editName !== projectName && projectId) {
      try {
        const result = await updateProjectName(projectId, editName.trim());
        if (result.success && result.updatedProject) {
          setProjectName(result.updatedProject.name);
          if (result.newSlug) {
            // Update the URL to reflect the new slug
            window.history.replaceState(null, "", `/canvas/${result.newSlug}`);
            // Update the project data in the store
            setProjectData(
              projectId,
              result.newSlug,
              result.updatedProject.name
            );
          }
        } else {
          // Revert the name if update failed
          setEditName(projectName);
        }
      } catch (error) {
        console.error("Error updating project name:", error);
        // Revert the name if update failed
        setEditName(projectName);
      }
    } else {
      setEditName(projectName);
    }
  };

  const handleCancelEdit = () => {
    setEditName(projectName);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSaveEdit();
    } else if (e.key === "Escape") {
      handleCancelEdit();
    }
  };

  return (
    <div className="absolute top-5 left-5 z-50 flex items-center gap-2">
      {/* Projects button */}
      <Button
        variant="outline"
        size="icon"
        onClick={() => router.push("/projects")}
        title="Go to Projects"
      >
        <ChevronLeft />
      </Button>

      {/* Project name */}
      <div>
        <Input
          type="text"
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          onBlur={handleSaveEdit}
          onKeyDown={handleKeyDown}
          maxLength={50}
        />
      </div>
    </div>
  );
}
