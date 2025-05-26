"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCanvasStore } from "../../store/useCanvasStore";
import { updateProjectName } from "@/lib/project-storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ChevronLeft, FolderOpen } from "lucide-react";

export default function ProjectHeader() {
  const router = useRouter();
  const { projectName, projectId, setProjectName } = useCanvasStore();
  const [editName, setEditName] = useState(projectName);

  // Sync editName with projectName when it changes
  useEffect(() => {
    setEditName(projectName);
  }, [projectName]);

  const handleSaveEdit = () => {
    if (editName.trim() && editName !== projectName && projectId) {
      const updatedProject = updateProjectName(projectId, editName.trim());
      if (updatedProject) {
        setProjectName(updatedProject.name);
        window.history.replaceState(null, "", `/canvas/${updatedProject.slug}`);
      }
    }
    setEditName(projectName);
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
