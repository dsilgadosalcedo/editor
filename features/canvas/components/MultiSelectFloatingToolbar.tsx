import React from "react";
import { Group, Ungroup } from "lucide-react";
import { useCanvasStore } from "../store/useCanvasStore";
import { Button } from "@/components/ui/button";

interface MultiSelectFloatingToolbarProps {
  position: { x: number; y: number };
  zoom: number;
}

const MultiSelectFloatingToolbar: React.FC<MultiSelectFloatingToolbarProps> = ({
  position,
  zoom,
}) => {
  const { selectedElements, elements, groupElements, ungroupElements } =
    useCanvasStore();

  // Check if we have a single frame selected (for ungroup option)
  const selectedElement =
    selectedElements.length === 1
      ? elements.find((el) => el.id === selectedElements[0])
      : null;

  const isFrame = selectedElement?.type === "frame";
  const canGroup = selectedElements.length > 1 && !isFrame;
  const canUngroup = selectedElements.length === 1 && isFrame;

  if (!canGroup && !canUngroup) return null;

  // Apply inverse scaling to keep toolbar at consistent size regardless of zoom
  const toolbarScale = 1 / (zoom / 100);
  const scaledYOffset = (24 + 8 + 2 + 2 + 16) * (100 / zoom);

  const handleGroup = (e: React.MouseEvent) => {
    e.stopPropagation();
    groupElements();
  };

  const handleUngroup = (e: React.MouseEvent) => {
    e.stopPropagation();
    ungroupElements();
  };

  return (
    <div
      className="absolute pointer-events-auto z-50"
      style={{
        left: position.x,
        top: position.y - scaledYOffset,
        transform: `scale(${toolbarScale}) translate(-50%, 0)`,
        transformOrigin: "top left",
      }}
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 flex items-center gap-1 p-1"
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        {canGroup && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleGroup}
            title="Group elements into frame"
            aria-label="Group elements into frame"
            className="h-6 w-6"
          >
            <Group className="w-4 h-4" />
          </Button>
        )}

        {canUngroup && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleUngroup}
            title="Ungroup frame"
            aria-label="Ungroup frame elements"
            className="h-6 w-6"
          >
            <Ungroup className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default MultiSelectFloatingToolbar;
