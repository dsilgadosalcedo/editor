import React, { useState } from "react";
import {
  Hand,
  Square,
  Type,
  Layers,
  Image as ImageIcon,
  MousePointer,
  MoreHorizontal,
  Download,
  Group,
  Keyboard,
  Sun,
  Moon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ToolType } from "../types/props";
import Image from "next/image";
import { ThemeToggle } from "./ThemeToggle";
import { useCanvasStore } from "../store/useCanvasStore";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { useTheme } from "next-themes";
import KeyboardShortcuts from "./KeyboardShortcuts";

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
  const {
    elements,
    selectedElements,
    addElement,
    projectName,
    artboardDimensions,
    clearSelection,
  } = useCanvasStore();
  const { theme, setTheme } = useTheme();
  const [showShortcuts, setShowShortcuts] = useState(false);

  const handleDownloadAsSVG = () => {
    try {
      // Get the artboard element
      const artboard = document.querySelector('[data-artboard="true"]');
      if (!artboard) {
        toast.error("Artboard not found");
        return;
      }

      // Create SVG content
      const svgContent = `
        <svg xmlns="http://www.w3.org/2000/svg" width="${
          artboardDimensions.width
        }" height="${artboardDimensions.height}" viewBox="0 0 ${
        artboardDimensions.width
      } ${artboardDimensions.height}">
          ${elements
            .map((element) => {
              if (element.type === "rectangle") {
                return `<rect x="${element.x}" y="${element.y}" width="${
                  element.width
                }" height="${element.height}" fill="${element.color}" rx="${
                  element.cornerRadius || 0
                }" />`;
              } else if (element.type === "text") {
                return `<text x="${element.x}" y="${
                  element.y + (element.fontSize || 16)
                }" font-size="${element.fontSize || 16}" fill="${
                  element.color
                }">${element.content || ""}</text>`;
              }
              return "";
            })
            .join("")}
        </svg>
      `;

      // Create and download the file
      const blob = new Blob([svgContent], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `canvas-${Date.now()}.svg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading SVG:", error);
      toast.error("Failed to download SVG. Please try again.");
    }
  };

  return (
    <aside className="fixed top-1/2 -translate-y-1/2 left-4 grid gap-3 place-content-center z-50">
      <section className="p-1 bg-sidebar/80 rounded-[1.25rem] shadow flex flex-col backdrop-blur-sm">
        <div className="flex-1 bg-card/50 dark:bg-card/50 border rounded-xl flex flex-col p-4 w-16 items-center gap-2 shadow-sm">
          <Button
            variant="ghost"
            size="icon"
            className="bg-background hover:bg-background"
          >
            <Image
              src="/favicon.ico"
              alt="text"
              width={24}
              height={24}
              className="h-6 w-6"
            />
          </Button>

          <div
            aria-label="Toggle Theme"
            className="relative flex flex-col items-center"
          >
            <ThemeToggle />
            <span className="absolute -bottom-2.5 w-full text-[8px] text-gray-400 select-none pointer-events-none text-center">
              ⌘ ⇧ L
            </span>
          </div>
        </div>
      </section>

      <section className="p-1 bg-sidebar/80 rounded-[1.25rem] shadow flex flex-col backdrop-blur-sm">
        <div className="flex-1 bg-card/50 dark:bg-card/50 border rounded-xl flex flex-col p-4 w-16 items-center gap-2 shadow-sm">
          <ToolButton
            onClick={() => addElement("text")}
            aria-label="Add text (Shortcut: 1)"
            tabIndex={0}
            shortcut="1"
          >
            <ToolIcon icon={Type} />
          </ToolButton>
          <ToolButton
            onClick={() => {
              addElement("rectangle");
            }}
            aria-label="Add rectangle (Shortcut: 2)"
            tabIndex={0}
            shortcut="2"
          >
            <ToolIcon icon={Square} />
          </ToolButton>
          <ToolButton
            onClick={() => addElement("image")}
            aria-label="Add image (Shortcut: 3)"
            tabIndex={0}
            shortcut="3"
          >
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
            className={cn(layersOpen && "bg-accent")}
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
      </section>

      <section className="p-1 bg-sidebar/80 rounded-[1.25rem] shadow flex flex-col backdrop-blur-sm">
        <div className="flex-1 bg-card/50 dark:bg-card/50 border rounded-xl flex flex-col p-4 w-16 items-center gap-2 shadow-sm">
          <ToolButton
            onClick={() => setShowShortcuts(true)}
            aria-label="Keyboard Shortcuts"
            shortcut="?"
          >
            <ToolIcon icon={Keyboard} />
          </ToolButton>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-6 w-6 group-active:text-properties-gold dark:group-active:text-properties-gold group-active:scale-90 transition-all duration-200 text-properties-text dark:text-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              side="right"
              align="end"
              className="w-48 z-[60]"
            >
              <DropdownMenuItem onClick={handleDownloadAsSVG}>
                <Download className="w-4 h-4 mr-2" />
                Download as SVG
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </section>

      {/* Keyboard Shortcuts Modal */}
      <KeyboardShortcuts
        isOpen={showShortcuts}
        onClose={() => setShowShortcuts(false)}
      />
    </aside>
  );
}

type ToolButtonProps = {
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
  tabIndex?: number;
  "aria-label"?: string;
  shortcut?: string;
};

const ToolButton = ({
  onClick,
  className,
  shortcut,
  children,
  tabIndex,
  "aria-label": ariaLabel,
}: ToolButtonProps) => {
  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn("relative group", className)}
      onClick={onClick}
      tabIndex={tabIndex}
      aria-label={ariaLabel}
    >
      {children}
      {shortcut && (
        <span className="absolute bottom-1 right-1 text-[8px] text-gray-400 select-none pointer-events-none">
          {shortcut}
        </span>
      )}
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
