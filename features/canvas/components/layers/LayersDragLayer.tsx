import React from "react";
import { useDragLayer } from "react-dnd";
import { LAYER_ITEM_TYPE, DragItem } from "./types";

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
  };
}

export const LayersDragLayer: React.FC = () => {
  const { itemType, isDragging, item, currentOffset } = useDragLayer(
    (monitor) => ({
      item: monitor.getItem() as DragItem,
      itemType: monitor.getItemType(),
      currentOffset: monitor.getSourceClientOffset(),
      isDragging: monitor.isDragging(),
    })
  );

  if (!isDragging || itemType !== LAYER_ITEM_TYPE) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-[9999]">
      <div style={getItemStyles(currentOffset)}>
        <div className="bg-white dark:bg-gray-800 border rounded p-2 shadow-lg opacity-80">
          {item?.element?.name || item?.elementType || "Item"}
        </div>
      </div>
    </div>
  );
};
