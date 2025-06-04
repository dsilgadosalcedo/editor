import React from "react";
import {
  Minus,
  Plus,
  RotateCcw,
  RotateCw,
  Copy,
  Clipboard,
  Trash2,
  Home,
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
import {
  useSelectedElements,
  useHistoryState,
  useHistoryActions,
  useSelectionActions,
} from "../store/selectors";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { useShallow } from "zustand/react/shallow";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
  // Use optimized selectors
  const selectedElements = useSelectedElements();
  const historyState = useHistoryState();
  const historyActions = useHistoryActions();
  const selectionActions = useSelectionActions();

  // Group file and canvas actions
  const fileActions = useCanvasStore(
    useShallow((state) => ({
      resetCanvas: state.resetCanvas,
      exportCanvas: state.exportCanvas,
      importCanvas: state.importCanvas,
    }))
  );

  const clipboard = useCanvasStore((state) => state.clipboard);

  const handleExport = () => {
    fileActions.exportCanvas();
  };

  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const result = await fileActions.importCanvas(file);
        if (!result.success) {
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
      className="fixed bottom-1 left-4 z-50 grid place-items-center"
      style={{ paddingBottom: "max(20px, env(safe-area-inset-bottom))" }}
    >
      <Card className="flex flex-row items-center gap-2 backdrop-blur-sm p-2 bg-sidebar/70 border-card/80">
        {/* Export/Import Controls */}
        {/* <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleExport}
              className="h-8 w-8"
              aria-label="Export Canvas"
            >
              <Download className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Export canvas as JSON file</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleImport}
              className="h-8 w-8"
              aria-label="Import Canvas"
            >
              <Upload className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Import canvas from JSON file</p>
          </TooltipContent>
        </Tooltip> */}

        {/* Separator */}
        {/* <div className="h-6">
          <Separator orientation="vertical" />
        </div> */}

        {/* Zoom Controls */}
        <Tooltip>
          <TooltipTrigger asChild>
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
          </TooltipTrigger>
          <TooltipContent>
            <p>Zoom out</p>
          </TooltipContent>
        </Tooltip>
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
          <SelectTrigger className="w-[90px] bg-transparent text-sm rounded-md border-none shadow-none transition-colors">
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
        <Tooltip>
          <TooltipTrigger asChild>
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
          </TooltipTrigger>
          <TooltipContent>
            <p>Zoom in</p>
          </TooltipContent>
        </Tooltip>

        {/* Reset View */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={onResetView}
              className="h-8 w-8"
              aria-label="Reset View to Artboard"
            >
              <Home className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Reset view to artboard</p>
          </TooltipContent>
        </Tooltip>

        {/* Undo/Redo Controls */}
        {/* <div className="h-6">
          <Separator orientation="vertical" />
        </div>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={historyActions.undo}
              disabled={!historyState.canUndo}
              className="h-8 w-8"
              aria-label="Undo"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Undo last action</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={historyActions.redo}
              disabled={!historyState.canRedo}
              className="h-8 w-8"
              aria-label="Redo"
            >
              <RotateCw className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Redo last action</p>
          </TooltipContent>
        </Tooltip>

        {/* Copy/Paste Controls 
        <div className="h-6">
          <Separator orientation="vertical" />
        </div>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={selectionActions.copySelection}
              disabled={selectedElements.length === 0}
              className="h-8 w-8"
              aria-label="Copy"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Copy selected elements</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={selectionActions.pasteClipboard}
              disabled={!clipboard || clipboard.length === 0}
              className="h-8 w-8"
              aria-label="Paste"
            >
              <Clipboard className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Paste copied elements</p>
          </TooltipContent>
        </Tooltip> */}

        {/* Reset Canvas */}
        {/* <div className="h-6">
          <Separator orientation="vertical" />
        </div> */}

        {/* <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={fileActions.resetCanvas}
              className="h-8 w-8"
              aria-label="Reset Canvas"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Clear all elements from canvas</p>
          </TooltipContent>
        </Tooltip> */}
      </Card>
    </div>
  );
}
