// Re-export Project type from lib
import type { Project } from "@/lib/project-storage";

export type { Project };

export interface DeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectName: string;
  onConfirm: () => void;
}

export interface EmptyStateProps {
  onCreateNew: () => void;
}

export interface ProjectCardProps {
  project: Project;
  onOpen: () => void;
  onDelete: () => void;
  onProjectUpdate?: (updatedProject: Project) => void;
  onUpdateProjectName?: (id: string, newName: string) => Promise<void>;
}

export interface ProjectLimitBadgeProps {
  isLoading: boolean;
  getProjectLimitStats: () => {
    current: number;
    remaining: number;
    isAtLimit: boolean;
  };
}

export interface HeaderActionsProps {
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
