import React, { useState, useRef } from "react";
import {
  Type,
  Square,
  Image as ImageIcon,
  Hand,
  MousePointer,
  Keyboard,
  MoreHorizontal,
  Download,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ToolType } from "../types/props";
import type { ElementType } from "../types";
import Image from "next/image";
import { ThemeToggle } from "./ThemeToggle";
import {
  useElements,
  useSelectedElements,
  useProjectName,
  useArtboardDimensions,
  useCanvasActions,
  useSelectionActions,
  useFileActions,
} from "../store/selectors";
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
import { generateRandomImage } from "../services/image-service";
import ImportProjectDialog, { ImportChoice } from "./ImportProjectDialog";
import {
  isProjectLimitReached,
  createProjectWithLimitCheck,
} from "@/lib/project-storage";
import { importCanvasFromFile } from "../services/file-operations";
import { useRouter } from "next/navigation";

interface ToolSidebarProps {
  selectedTool: ToolType;
  onSelectTool: (tool: ToolType) => void;
  onToggleLayers: () => void;
  layersOpen: boolean;
}

// Drag data interface for element creation
interface DragElementData {
  type: ElementType;
  isCreatingElement: boolean;
}

export default function ToolSidebar({
  selectedTool,
  onSelectTool,
  onToggleLayers,
  layersOpen,
}: ToolSidebarProps) {
  // Use optimized selectors
  const elements = useElements();
  const selectedElements = useSelectedElements();
  const projectName = useProjectName();
  const artboardDimensions = useArtboardDimensions();
  const canvasActions = useCanvasActions();
  const selectionActions = useSelectionActions();
  const fileActions = useFileActions();
  const router = useRouter();

  const [showShortcuts, setShowShortcuts] = useState(false);
  const [draggedElementType, setDraggedElementType] =
    useState<ElementType | null>(null);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importData, setImportData] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle drag start for element creation
  const handleDragStart = (e: React.DragEvent, elementType: ElementType) => {
    setDraggedElementType(elementType);

    // Set drag data
    const dragData: DragElementData = {
      type: elementType,
      isCreatingElement: true,
    };

    e.dataTransfer.setData("application/json", JSON.stringify(dragData));
    e.dataTransfer.effectAllowed = "copy";

    // Add visual feedback
    e.dataTransfer.setDragImage(e.currentTarget as HTMLElement, 24, 24);
  };

  // Handle drag end
  const handleDragEnd = () => {
    setDraggedElementType(null);
  };

  // Handle click for immediate element creation (fallback)
  const handleElementClick = (elementType: ElementType) => {
    if (elementType === "image") {
      // Generate a random image automatically instead of prompting
      const imageUrl = generateRandomImage({ width: 300, height: 200 });
      canvasActions.addImageElement(imageUrl);
    } else {
      canvasActions.addElement(elementType);
    }
  };

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

  const handleDownloadAsProject = () => {
    try {
      fileActions.exportProject();
      toast.success("Project exported successfully");
    } catch (error) {
      console.error("Error downloading project:", error);
      toast.error("Failed to export project. Please try again.");
    }
  };

  const handleImportProject = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const result = await importCanvasFromFile(file);
      if (result.success && result.elements) {
        setImportData(result);
        setShowImportDialog(true);
      } else {
        toast.error(result.error || "Failed to import project");
      }
    } catch (error) {
      console.error("Error importing project:", error);
      toast.error("Failed to import project. Please try again.");
    }

    // Clear the input
    event.target.value = "";
  };

  const handleImportChoice = async (choice: ImportChoice) => {
    try {
      if (choice.type === "project") {
        // Create new project
        const projectLimitReached = isProjectLimitReached();
        if (projectLimitReached) {
          // Auto-remove oldest project and create new one
          const result = createProjectWithLimitCheck(
            undefined,
            `Imported Project`,
            choice.data
          );

          if (result.project) {
            if (result.autoRemoved && result.removedProjects) {
              toast.info(
                `Removed oldest project "${result.removedProjects[0].name}" to make room`
              );
            }
            router.push(`/canvas/${result.project.id}`);
          } else {
            toast.error("Failed to create project");
          }
        } else {
          const result = createProjectWithLimitCheck(
            undefined,
            `Imported Project`,
            choice.data
          );

          if (result.project) {
            router.push(`/canvas/${result.project.id}`);
          } else {
            toast.error("Failed to create project");
          }
        }
      } else {
        // Import as elements to current canvas
        const importResult = await fileActions.importCanvas(
          new File([JSON.stringify(choice.data)], "import.json", {
            type: "application/json",
          })
        );

        if (!importResult.success) {
          toast.error("Failed to import elements");
        }
      }
    } catch (error) {
      console.error("Error handling import choice:", error);
      toast.error("Failed to import project. Please try again.");
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
            onClick={() => handleElementClick("text")}
            onDragStart={(e) => handleDragStart(e, "text")}
            onDragEnd={handleDragEnd}
            aria-label="Add text (Shortcut: 1)"
            tabIndex={0}
            shortcut="1"
            draggable={true}
            isDragging={draggedElementType === "text"}
          >
            <ToolIcon icon={Type} />
          </ToolButton>
          <ToolButton
            onClick={() => handleElementClick("rectangle")}
            onDragStart={(e) => handleDragStart(e, "rectangle")}
            onDragEnd={handleDragEnd}
            aria-label="Add rectangle (Shortcut: 2)"
            tabIndex={0}
            shortcut="2"
            draggable={true}
            isDragging={draggedElementType === "rectangle"}
          >
            <ToolIcon icon={Square} />
          </ToolButton>
          <ToolButton
            onClick={() => handleElementClick("image")}
            onDragStart={(e) => handleDragStart(e, "image")}
            onDragEnd={handleDragEnd}
            aria-label="Add image (Shortcut: 3)"
            tabIndex={0}
            shortcut="3"
            draggable={true}
            isDragging={draggedElementType === "image"}
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
              selectionActions.clearSelection();
            }}
          >
            <ToolIcon icon={selectedTool === "hand" ? Hand : MousePointer} />
          </ToolButton>
          {/* <ToolButton
            className={cn(layersOpen && "bg-accent")}
            onClick={() => {
              onToggleLayers();
              selectionActions.clearSelection();
            }}
          >
            <ToolIcon
              icon={Layers}
              className={cn(layersOpen && "text-properties-gold")}
            />
          </ToolButton> */}
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
            <DropdownMenuContent align="start" side="right">
              <DropdownMenuItem onClick={handleDownloadAsSVG}>
                <Download className="mr-2 h-4 w-4" />
                Download as SVG
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDownloadAsProject}>
                <Download className="mr-2 h-4 w-4" />
                Download as Project
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleImportProject}>
                <Upload className="mr-2 h-4 w-4" />
                Import Project
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </section>

      {/* Hidden file input for importing projects */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileChange}
        style={{ display: "none" }}
      />

      {/* Import Project Dialog */}
      <ImportProjectDialog
        isOpen={showImportDialog}
        onClose={() => setShowImportDialog(false)}
        onChoice={handleImportChoice}
        projectData={importData}
        isProjectLimitReached={isProjectLimitReached()}
      />

      {/* Keyboard Shortcuts Modal */}
      {showShortcuts && (
        <KeyboardShortcuts onClose={() => setShowShortcuts(false)} />
      )}
    </aside>
  );
}

interface ToolButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  shortcut?: string;
  isDragging?: boolean;
  onDragStart?: (e: React.DragEvent<HTMLButtonElement>) => void;
  onDragEnd?: () => void;
}

const ToolButton = ({
  onClick,
  className,
  shortcut,
  children,
  tabIndex,
  "aria-label": ariaLabel,
  isDragging = false,
  onDragStart,
  onDragEnd,
  ...props
}: ToolButtonProps) => {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onClick}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className={cn(
        "group active:text-properties-gold dark:active:text-properties-gold active:scale-90 transition-all duration-200 relative",
        isDragging && "opacity-50 scale-95",
        className
      )}
      tabIndex={tabIndex}
      aria-label={ariaLabel}
      {...props}
    >
      {children}

      {shortcut && (
        <span className="absolute bottom-0.5 -right-2.5 w-full text-[8px] text-secondary-foreground select-none pointer-events-none text-center">
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
