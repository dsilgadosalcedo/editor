import { Button } from "@/components/ui/button";
import { FolderOpen } from "lucide-react";

interface EmptyStateProps {
  onCreateNew: () => void;
}

export default function EmptyState({ onCreateNew }: EmptyStateProps) {
  return (
    <div className="text-center py-12">
      <div className="mb-4 text-muted-foreground">
        <FolderOpen className="w-16 h-16 mx-auto" />
      </div>
      <h3 className="text-lg font-medium text-foreground mb-2">
        No projects yet
      </h3>
      <p className="text-muted-foreground mb-6">
        Get started by creating your first project
      </p>
      <Button onClick={onCreateNew}>Create First Project</Button>
    </div>
  );
}
