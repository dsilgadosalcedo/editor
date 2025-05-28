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
  Home,
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
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

interface CanvasToolbarProps {
  zoom: number;
  setZoom: (zoom: number | ((prev: number) => number)) => void;
  onZoomToSelection: () => void;
  onResetView: () => void;
}

export default function CanvasToolbar({
  zoom,
  setZoom,
  onZoomToSelection,
  onResetView,
}: CanvasToolbarProps) {
  const {
    selectedElements,
    past,
    future,
    undo,
    redo,
    resetCanvas,
    copySelection,
    pasteClipboard,
    clipboard,
    exportCanvas,
    importCanvas,
  } = useCanvasStore();

  const canUndo = past.length > 0;
  const canRedo = future.length > 0;

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
          toast.error(
            "Failed to import canvas. Please make sure it's a valid canvas file."
          );
        }
      }
    };
    input.click();
  };

  return (
    <div
      className="fixed bottom-1 left-1/2 -translate-x-1/2 z-50 grid place-items-center"
      style={{ paddingBottom: "max(20px, env(safe-area-inset-bottom))" }}
    >
      <Card className="flex flex-row items-center gap-2 backdrop-blur-sm p-2 bg-sidebar/70 border-card/80">
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
        <div className="h-6">
          <Separator orientation="vertical" />
        </div>

        {/* Zoom Controls */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() =>
            setZoom((prev) => {
              const levels = [
                10, 25, 50, 75, 100, 125, 150, 200, 300, 400, 600, 800,
              ];
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
            {[10, 25, 50, 75, 100, 125, 150, 200, 300, 400, 600, 800].map(
              (val) => (
                <SelectItem key={val} value={String(val)}>
                  {val}%
                </SelectItem>
              )
            )}
            <SelectItem
              value="selection"
              className="text-blue-500 font-semibold rounded-none border-t border-blue-100 mt-1"
              disabled={selectedElements.length === 0}
            >
              {selectedElements.length === 0
                ? "Zoom to Selection"
                : selectedElements.length === 1
                ? "Zoom to Selection (1 element)"
                : `Zoom to Selection (${selectedElements.length} elements)`}
            </SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="ghost"
          size="icon"
          onClick={() =>
            setZoom((prev) => {
              const levels = [
                10, 25, 50, 75, 100, 125, 150, 200, 300, 400, 600, 800,
              ];
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

        {/* Reset View */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onResetView}
          className="h-8 w-8"
          aria-label="Reset View to Artboard"
          title="Reset view to artboard at 100% zoom"
        >
          <Home className="h-4 w-4" />
        </Button>

        {/* Undo/Redo Controls */}
        <div className="h-6">
          <Separator orientation="vertical" />
        </div>

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
      </Card>
    </div>
  );
}
