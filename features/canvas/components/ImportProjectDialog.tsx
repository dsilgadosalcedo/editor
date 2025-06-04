import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FolderPlus, Layers } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ImportChoice {
  type: "project" | "elements";
  data: {
    elements: any[];
    artboardDimensions: { width: number; height: number };
    version?: string;
    timestamp?: number;
  };
}

interface ImportProjectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onChoice: (choice: ImportChoice) => void;
  projectData: {
    elements: any[];
    artboardDimensions: { width: number; height: number };
    version?: string;
    timestamp?: number;
  } | null;
  isProjectLimitReached: boolean;
}

export default function ImportProjectDialog({
  isOpen,
  onClose,
  onChoice,
  projectData,
  isProjectLimitReached,
}: ImportProjectDialogProps) {
  if (!projectData) return null;

  const handleChoice = (type: "project" | "elements") => {
    onChoice({
      type,
      data: projectData,
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Import Project</DialogTitle>
          <DialogDescription>
            How would you like to import this project?
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-3 py-4">
          <Button
            variant="outline"
            className={cn(
              "h-auto py-4 px-8 flex justify-start gap-4 text-left",
              isProjectLimitReached && "opacity-50 cursor-not-allowed"
            )}
            onClick={() => handleChoice("project")}
            disabled={isProjectLimitReached}
          >
            <div>
              <FolderPlus className="text-accent-foreground" />
            </div>
            <div className="space-y-1">
              <div className="font-medium">As New Project</div>
              <div className="text-sm text-muted-foreground">
                Create a new project with {projectData.elements.length} elements
                {isProjectLimitReached && " (Project limit reached)"}
              </div>
            </div>
          </Button>

          <Button
            variant="outline"
            className="h-auto py-4 px-8 flex justify-start gap-4 text-left"
            onClick={() => handleChoice("elements")}
          >
            <div>
              <Layers className="text-green-500" />
            </div>
            <div className="space-y-1">
              <div className="font-medium">As Elements</div>
              <div className="text-sm text-muted-foreground">
                Add {projectData.elements.length} elements to current canvas
              </div>
            </div>
          </Button>
        </div>

        <div className="flex justify-end">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
