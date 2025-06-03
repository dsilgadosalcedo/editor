"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCanvasStore } from "../../store/useCanvasStore";
import { useProjectUpdate } from "@/hooks/useProjectUpdate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ChevronLeft, FolderOpen, ArrowLeft } from "lucide-react";
import {
  useProjectName,
  useProjectId,
  useIsolatedGroupId,
} from "../../store/selectors";
import { useShallow } from "zustand/react/shallow";

export default function ProjectHeader() {
  const router = useRouter();

  // Use optimized selectors to prevent unnecessary re-renders
  const projectName = useProjectName();
  const projectId = useProjectId();
  const isolatedGroupId = useIsolatedGroupId();

  // Group related project actions using useShallow
  const projectActions = useCanvasStore(
    useShallow((state) => ({
      setProjectName: state.setProjectName,
      setProjectData: state.setProjectData,
      exitIsolationMode: state.exitIsolationMode,
    }))
  );

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
          // Only update the project name in the store
          projectActions.setProjectName(result.updatedProject.name);
          // The project data (elements, dimensions) remains unchanged, so no need to call setProjectData here.
          // If updateProjectName also returned full data, and we wanted to refresh it, then call setProjectData.
        } else {
          // If success is false but there's an error type like 'cloud_update_failed',
          // the local name is already updated by useProjectUpdate's call to updateLocalProjectNameOnly.
          // The store's projectName would reflect the new name from local storage if we set it here too.
          if (result.error === "cloud_update_failed" && result.updatedProject) {
            projectActions.setProjectName(result.updatedProject.name); // Reflect successful local update
          } else {
            setEditName(projectName); // Revert UI editName if local save also failed or other error
          }
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

  const handleExitIsolation = () => {
    projectActions.exitIsolationMode();
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

      {/* Exit Isolation Mode Button */}
      {isolatedGroupId && (
        <Button
          onClick={handleExitIsolation}
          variant="secondary"
          size="sm"
          className="bg-amber-100/90 hover:bg-amber-200/90 border border-amber-300 text-amber-800 shadow-md"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Exit Isolation
        </Button>
      )}
    </div>
  );
}
