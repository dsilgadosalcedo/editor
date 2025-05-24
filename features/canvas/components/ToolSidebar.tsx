import React from "react";
import {
  Hand,
  Square,
  Type,
  Layers,
  Image as ImageIcon,
  MousePointer,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ToolType } from "../store/useCanvasStore";
import Image from "next/image";
import { ThemeToggle } from "./ThemeToggle";
import { useCanvasStore } from "../store/useCanvasStore";
import { Separator } from "@/components/ui/separator";

interface ToolSidebarProps {
  selectedTool: ToolType;
  onSelectTool: (tool: ToolType) => void;
  onToggleLayers: () => void;
  layersOpen: boolean;
}

export default function ToolSidebar({
  selectedTool,
  onSelectTool,
  onToggleLayers,
  layersOpen,
}: ToolSidebarProps) {
  const { addElement, clearSelection } = useCanvasStore();

  return (
    <div className="z-20 m-4 p-1 bg-card/80 rounded-[1.25rem] shadow flex flex-col backdrop-blur-sm">
      <div className="flex-1 bg-white/15 dark:bg-white/10 border border-sky-harbor/80 rounded-xl flex flex-col p-4 w-16 items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="border border-white/30 hover:bg-transparent dark:hover:bg-transparent"
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

        <Separator />

        <ToolButton onClick={() => addElement("text")}>
          <ToolIcon icon={Type} />
        </ToolButton>
        <ToolButton
          onClick={() => {
            addElement("rectangle");
          }}
        >
          <ToolIcon icon={Square} />
        </ToolButton>
        <ToolButton onClick={() => addElement("image")}>
          <ToolIcon icon={ImageIcon} />
        </ToolButton>

        <Separator />

        <ToolButton
          className={cn(
            selectedTool === "hand" &&
              "bg-white/60 hover:bg-white/60 dark:bg-white/30 dark:hover:bg-white/40"
          )}
          onClick={() => {
            onSelectTool(selectedTool === "hand" ? null : "hand");
            clearSelection();
          }}
        >
          <ToolIcon
            icon={selectedTool === "hand" ? Hand : MousePointer}
            className={cn(layersOpen && "text-properties-gold")}
          />
        </ToolButton>
        <ToolButton
          className={cn(
            layersOpen &&
              "bg-white/60 hover:bg-white/60 dark:bg-white/30 dark:hover:bg-white/40"
          )}
          onClick={() => {
            onToggleLayers();
            clearSelection();
          }}
        >
          <ToolIcon
            icon={Layers}
            className={cn(layersOpen && "text-properties-gold")}
          />
        </ToolButton>
      </div>
    </div>
  );
}

const ToolButton = ({
  onClick,
  className,
  children,
}: {
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn(
        "rounded-md group bg-white/30 hover:bg-white/40 dark:bg-white/10 dark:hover:bg-white/20 dark:active:bg-white/30 active:bg-white/60",
        className
      )}
      onClick={onClick}
    >
      {children}
    </Button>
  );
};

const ToolIcon = ({
  icon,
  className,
}: {
  icon: React.ElementType;
  className?: string;
}) => {
  const Icon = icon;
  return (
    <Icon
      className={cn(
        "h-6 w-6 group-active:text-properties-gold dark:group-active:text-properties-gold group-active:scale-90 transition-all duration-200 text-properties-text dark:text-foreground",
        className
      )}
    />
  );
};
