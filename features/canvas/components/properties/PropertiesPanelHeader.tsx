import React from "react";
import { Button } from "@/components/ui/button";
import { CardHeader } from "@/components/ui/card";
import { PanelLeftOpen, PanelRightOpen } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface PropertiesPanelHeaderProps {
  rightSidebarDocked: boolean;
  onToggleDock: () => void;
}

export function PropertiesPanelHeader({
  rightSidebarDocked,
  onToggleDock,
}: PropertiesPanelHeaderProps) {
  return (
    <CardHeader className="flex flex-row items-center justify-between pt-2 [.border-b]:pb-2 border-b">
      <h3 className="text-sm font-medium text-properties-text dark:text-foreground">
        Properties
      </h3>
      <div className="flex items-center gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleDock}
              onMouseDown={(e) => e.stopPropagation()}
              className="hover:bg-transparent transition-all duration-200 hover:scale-110 active:scale-95"
              aria-label={
                rightSidebarDocked ? "Undock sidebar" : "Dock sidebar"
              }
            >
              {rightSidebarDocked ? (
                <PanelRightOpen className="opacity-70 hover:opacity-100 transition-opacity duration-200" />
              ) : (
                <PanelLeftOpen className="opacity-70 hover:opacity-100 transition-opacity duration-200" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{rightSidebarDocked ? "Undock sidebar" : "Dock sidebar"}</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </CardHeader>
  );
}
