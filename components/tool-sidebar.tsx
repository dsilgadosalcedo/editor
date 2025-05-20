import React from "react";
import { Hand, Square, Type } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ToolType, ElementType } from "@/hooks/useCanvasElements";
import Image from "next/image";
import { ThemeToggle } from "./theme-toggle";

interface ToolSidebarProps {
  selectedTool: ToolType;
  onSelectTool: (tool: ToolType) => void;
  onAddElement: (type: ElementType) => void;
  clearSelection: () => void;
}

export default function ToolSidebar({
  selectedTool,
  onSelectTool,
  onAddElement,
  clearSelection,
}: ToolSidebarProps) {
  return (
    <div className="z-20 m-4 p-1 bg-properties-blue/20 dark:bg-white/10 rounded-2xl shadow flex flex-col backdrop-blur-sm">
      <div className="flex-1 bg-white/15 dark:bg-white/10 border border-properties-blue dark:border-white/20 rounded-xl flex flex-col p-4 w-16 items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="border border-white/30 hover:bg-transparent"
        >
          <Image
            src="/favicon.ico"
            alt="text"
            width={24}
            height={24}
            className="h-6 w-6"
          />
        </Button>
        <ThemeToggle />
        <div className="w-full h-px bg-properties-blue/30 dark:bg-slate-100/30 my-1"></div>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "rounded-md",
            selectedTool === "text"
              ? "bg-white/60 hover:bg-white/60 dark:bg-white/30 dark:hover:bg-white/40"
              : "bg-white/30 hover:bg-white/40 dark:bg-white/10 dark:hover:bg-white/20"
          )}
          onClick={() => {
            onSelectTool("text");
            onAddElement("text");
          }}
        >
          <Type
            className={cn(
              "h-6 w-6",
              selectedTool === "text"
                ? "text-properties-gold"
                : "text-properties-text dark:text-foreground"
            )}
          />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "rounded-md",
            selectedTool === "rectangle"
              ? "bg-white/60 hover:bg-white/60 dark:bg-white/30 dark:hover:bg-white/40"
              : "bg-white/30 hover:bg-white/40 dark:bg-white/10 dark:hover:bg-white/20"
          )}
          onClick={() => {
            onSelectTool("rectangle");
            onAddElement("rectangle");
          }}
        >
          <Square
            className={cn(
              "h-6 w-6",
              selectedTool === "rectangle"
                ? "text-properties-gold"
                : "text-properties-text dark:text-foreground"
            )}
          />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "rounded-md",
            selectedTool === "hand"
              ? "bg-white/60 hover:bg-white/60 dark:bg-white/30 dark:hover:bg-white/40"
              : "bg-white/30 hover:bg-white/40 dark:bg-white/10 dark:hover:bg-white/20"
          )}
          onClick={() => {
            const next = selectedTool === "hand" ? null : "hand";
            onSelectTool(next);
            clearSelection();
          }}
        >
          <Hand
            className={cn(
              "h-6 w-6",
              selectedTool === "hand"
                ? "text-properties-gold"
                : "text-properties-text dark:text-foreground"
            )}
          />
        </Button>
      </div>
    </div>
  );
}
