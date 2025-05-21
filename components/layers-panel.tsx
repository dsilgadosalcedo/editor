import React, { useRef } from "react";
import type { CanvasElementData } from "@/hooks/useCanvasElements";

interface LayersPanelProps {
  elements: CanvasElementData[];
  selectedElement: string | null;
  onSelect: (id: string) => void;
  onReorder: (oldIndex: number, newIndex: number) => void;
  className?: string;
}

const LayersPanel: React.FC<LayersPanelProps> = ({
  elements,
  selectedElement,
  onSelect,
  onReorder,
  className = "",
}) => {
  const dragItemIndex = useRef<number | null>(null);

  const handleDragStart = (e: React.DragEvent<HTMLLIElement>) => {
    const idx = Number(e.currentTarget.dataset.index);
    dragItemIndex.current = idx;
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", idx.toString());
  };

  const handleDragOver = (e: React.DragEvent<HTMLLIElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLLIElement>) => {
    e.preventDefault();
    const targetIdx = Number(e.currentTarget.dataset.index);
    if (dragItemIndex.current !== null && dragItemIndex.current !== targetIdx) {
      onReorder(dragItemIndex.current, targetIdx);
    }
    dragItemIndex.current = null;
  };

  return (
    <div
      className={`${className} w-48 bg-white/90 dark:bg-slate-800 backdrop-blur-sm p-2 rounded-lg shadow-lg`}
    >
      <div className="font-medium text-properties-text dark:text-foreground mb-2">
        Layers
      </div>
      <ul className="space-y-1 max-h-64 overflow-auto">
        {[...elements].reverse().map((el, revIdx) => {
          const actualIdx = elements.length - 1 - revIdx;
          return (
            <li
              key={el.id}
              data-index={actualIdx}
              draggable
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => onSelect(el.id)}
              className={`flex items-center justify-between p-1 rounded cursor-pointer ${
                el.id === selectedElement
                  ? "bg-properties-blue/30 dark:bg-white/20"
                  : "hover:bg-gray-100 dark:hover:bg-slate-700"
              }`}
            >
              <span className="text-sm text-properties-text dark:text-foreground">
                {el.type.charAt(0).toUpperCase() + el.type.slice(1)}
              </span>
              <span className="text-xs text-gray-500">{actualIdx}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default LayersPanel;
