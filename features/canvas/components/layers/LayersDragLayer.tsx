import React from "react";
import { useDragLayer } from "react-dnd";
import { cn } from "@/lib/utils";
import { useCanvasStore } from "../../store/useCanvasStore.new";
import { useElements } from "../../store/selectors";
import { LAYER_ITEM_TYPE } from "./types";

const layerStyles: React.CSSProperties = {
  position: "fixed",
  pointerEvents: "none",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  zIndex: 1000,
};

function getItemStyles(currentOffset: { x: number; y: number } | null) {
  if (!currentOffset) {
    return {
      display: "none",
    };
  }

  const { x, y } = currentOffset;
  const transform = `translate(${x}px, ${y}px)`;
  return {
    transform,
    WebkitTransform: transform,
    opacity: 0.8,
  };
}

export default function LayersDragLayer() {
  const { item, isDragging, currentOffset } = useDragLayer((monitor) => ({
    item: monitor.getItem(),
    isDragging:
      monitor.isDragging() && monitor.getItemType() === LAYER_ITEM_TYPE,
    currentOffset: monitor.getClientOffset(),
  }));

  if (!isDragging) {
    return null;
  }

  const elements = useElements();
  const element = elements.find((el) => el.id === item.id);
  const name =
    element?.name ||
    (element
      ? element.type.charAt(0).toUpperCase() + element.type.slice(1)
      : "");

  return (
    <div style={layerStyles}>
      <div style={getItemStyles(currentOffset)}>
        <div
          className={cn(
            "flex items-center justify-between border rounded-md py-1 px-1.5 bg-card cursor-grabbing",
            "bg-card/20 dark:bg-card/20"
          )}
        >
          <span className="text-sm text-properties-text dark:text-foreground truncate">
            {name}
          </span>
        </div>
      </div>
    </div>
  );
}
