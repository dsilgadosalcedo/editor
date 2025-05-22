import React, { useRef, useState } from "react";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import type { CanvasElementData } from "../store/useCanvasStore";
import { useCanvasStore } from "../store/useCanvasStore";

interface LayersPanelProps {
  className?: string;
}

const LayersPanel: React.FC<LayersPanelProps> = ({ className = "" }) => {
  const { elements, selectedElement, selectElement, reorderElements } =
    useCanvasStore();
  const [open, setOpen] = useState<boolean>(true);
  const dragItemIndex = useRef<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent<HTMLLIElement>) => {
    const idx = Number(e.currentTarget.dataset.index);
    dragItemIndex.current = idx;
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", idx.toString());
  };

  const handleDragOver = (e: React.DragEvent<HTMLLIElement>) => {
    e.preventDefault();
    const idx = Number(e.currentTarget.dataset.index);
    setDragOverIndex(idx);
  };

  const handleDrop = (e: React.DragEvent<HTMLLIElement>) => {
    e.preventDefault();
    const targetIdx = Number(e.currentTarget.dataset.index);
    if (dragItemIndex.current !== null && dragItemIndex.current !== targetIdx) {
      reorderElements(dragItemIndex.current, targetIdx);
    }
    dragItemIndex.current = null;
    setDragOverIndex(null);
  };

  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className={`${className} w-48`}
    >
      <div className="bg-white/90 dark:bg-slate-800 backdrop-blur-sm p-2 rounded-lg shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="font-medium text-properties-text dark:text-foreground">
            Layers
          </span>
          <CollapsibleTrigger
            className="p-1"
            aria-label={open ? "Collapse Layers" : "Expand Layers"}
          >
            <ChevronDown
              className={`h-4 w-4 text-properties-text dark:text-foreground transition-transform duration-200 ${
                open ? "rotate-180" : ""
              }`}
            />
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent>
          <ul className="space-y-1 max-h-64 overflow-auto">
            {[...elements].reverse().map((el, revIdx) => {
              const actualIdx = elements.length - 1 - revIdx;
              return (
                <React.Fragment key={el.id}>
                  {dragOverIndex === actualIdx && (
                    <li className="h-0">
                      <div className="mx-1 border-t-2 border-properties-blue dark:border-white/20" />
                    </li>
                  )}
                  <li
                    data-index={actualIdx}
                    draggable
                    onDragStart={handleDragStart}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onClick={() => selectElement(el.id)}
                    className={`flex items-center justify-between p-1 rounded cursor-pointer ${
                      el.id === selectedElement
                        ? "bg-properties-blue/30 dark:bg-white/20"
                        : "hover:bg-gray-100 dark:hover:bg-slate-700"
                    }`}
                  >
                    <span className="text-sm text-properties-text dark:text-foreground">
                      {el.name ||
                        el.type.charAt(0).toUpperCase() + el.type.slice(1)}
                    </span>
                    <span className="text-xs text-gray-500">{actualIdx}</span>
                  </li>
                </React.Fragment>
              );
            })}
          </ul>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};

export default LayersPanel;
