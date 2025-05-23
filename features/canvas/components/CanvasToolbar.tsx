import React from "react";
import {
  Minus,
  Plus,
  Eraser,
  RotateCcw,
  RotateCw,
  Copy,
  Clipboard,
  Save,
  FolderOpen,
  Download,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCanvasStore } from "../store/useCanvasStore";

interface CanvasToolbarProps {
  zoom: number;
  setZoom: (zoom: number | ((prev: number) => number)) => void;
  onZoomToSelection: () => void;
}

export default function CanvasToolbar({
  zoom,
  setZoom,
  onZoomToSelection,
}: CanvasToolbarProps) {
  const {
    selectedElement,
    past,
    future,
    undo,
    redo,
    resetCanvas,
    copySelection,
    pasteClipboard,
    clipboard,
    saveCanvas,
    loadCanvas,
    exportCanvas,
    importCanvas,
  } = useCanvasStore();

  const canUndo = past.length > 0;
  const canRedo = future.length > 0;

  const handleSave = async () => {
    const title = prompt("Enter canvas title (optional):");
    const canvasId = await saveCanvas(title || undefined);
    if (canvasId) {
      alert(`Canvas saved successfully! ID: ${canvasId}`);
    } else {
      alert("Failed to save canvas");
    }
  };

  const handleLoad = async () => {
    const canvasId = prompt("Enter canvas ID to load:");
    if (canvasId) {
      const success = await loadCanvas(canvasId);
      if (success) {
        alert("Canvas loaded successfully!");
      } else {
        alert("Failed to load canvas");
      }
    }
  };

  const handleExport = () => {
    exportCanvas();
  };

  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const success = await importCanvas(file);
        if (!success) {
          alert(
            "Failed to import canvas. Please make sure it's a valid canvas file."
          );
        }
      }
    };
    input.click();
  };

  return (
    <div className="absolute grid place-items-center bottom-4 z-10 w-full">
      <div className="bg-card/60 w-fit flex items-center gap-2 backdrop-blur-md p-2 rounded-xl shadow-lg border border-sky-harbor/80">
        {/* Export/Import Controls */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleExport}
          className="h-8 w-8"
          aria-label="Export Canvas"
        >
          <Download className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleImport}
          className="h-8 w-8"
          aria-label="Import Canvas"
        >
          <Upload className="h-4 w-4" />
        </Button>

        {/* Separator */}
        <div className="w-px h-6 bg-blue-200/40 mx-1" />

        {/* Zoom Controls */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() =>
            setZoom((prev) => {
              const levels = [10, 25, 50, 75, 100, 125, 150, 200, 300, 400];
              const idx = levels.findIndex((z) => z >= prev);
              return levels[Math.max(0, idx - 1)];
            })
          }
          className="h-8 w-8"
          aria-label="Zoom Out"
        >
          <Minus className="h-4 w-4" />
        </Button>
        <Select
          value={String(zoom)}
          onValueChange={(val) => {
            if (val === "selection") {
              onZoomToSelection();
            } else {
              setZoom(Number(val));
            }
          }}
        >
          <SelectTrigger className="w-[90px] bg-transparent text-sm rounded-md border-none hover:border-blue-400 transition-colors">
            <SelectValue placeholder="Zoom">{zoom}%</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {[10, 25, 50, 75, 100, 125, 150, 200, 300, 400].map((val) => (
              <SelectItem key={val} value={String(val)}>
                {val}%
              </SelectItem>
            ))}
            <SelectItem
              value="selection"
              className="text-blue-500 font-semibold rounded-none border-t border-blue-100 mt-1"
              disabled={!selectedElement}
            >
              Zoom to Selection
            </SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="ghost"
          size="icon"
          onClick={() =>
            setZoom((prev) => {
              const levels = [10, 25, 50, 75, 100, 125, 150, 200, 300, 400];
              const idx = levels.findIndex((z) => z > prev);
              return levels[
                Math.min(
                  levels.length - 1,
                  idx === -1 ? levels.length - 1 : idx
                )
              ];
            })
          }
          className="h-8 w-8"
          aria-label="Zoom In"
        >
          <Plus className="h-4 w-4" />
        </Button>

        {/* Copy/Paste Controls */}
        {/* <div className="w-px h-6 bg-blue-200/40 mx-1" />
        <Button
          variant="ghost"
          size="icon"
          onClick={copySelection}
          disabled={!selectedElement}
          className="h-8 w-8"
          aria-label="Copy"
        >
          <Copy className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={pasteClipboard}
          disabled={!clipboard}
          className="h-8 w-8"
          aria-label="Paste"
        >
          <Clipboard className="h-4 w-4" />
        </Button> */}

        {/* Undo/Redo Controls */}
        <div className="w-px h-6 bg-blue-200/40 mx-1" />
        <Button
          variant="ghost"
          size="icon"
          onClick={undo}
          disabled={!canUndo}
          className="h-8 w-8"
          aria-label="Undo"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={redo}
          disabled={!canRedo}
          className="h-8 w-8"
          aria-label="Redo"
        >
          <RotateCw className="h-4 w-4" />
        </Button>

        {/* Reset Canvas */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            if (
              window.confirm(
                "Are you sure you want to reset the canvas? All changes will be lost."
              )
            ) {
              resetCanvas();
            }
          }}
          className="h-8 w-8 ml-2"
          aria-label="Reset Canvas"
        >
          <Eraser className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
