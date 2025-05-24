import React, { useRef, useState } from "react";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import { ChevronDown, Trash2, Eye, EyeOff } from "lucide-react";
import type { CanvasElementData } from "../store/useCanvasStore";
import { useCanvasStore } from "../store/useCanvasStore";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const LayersPanel: React.FC = () => {
  const {
    elements,
    selectedElements,
    selectElement,
    reorderElements,
    deleteElement,
    toggleElementVisibility,
  } = useCanvasStore();
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

  const handleDeleteElement = (e: React.MouseEvent, elementId: string) => {
    e.stopPropagation();
    deleteElement(elementId);
  };

  const handleToggleVisibility = (e: React.MouseEvent, elementId: string) => {
    e.stopPropagation();
    toggleElementVisibility(elementId);
  };

  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className="bg-card/60 z-20 space-y-1 absolute bottom-5 left-26 w-48 backdrop-blur-lg rounded-xl shadow-lg border border-sky-harbor/80 p-1"
    >
      <CollapsibleTrigger
        className="w-full p-3 rounded-lg hover:bg-card/90 duration-300 transition-colors"
        aria-label={open ? "Collapse Layers" : "Expand Layers"}
      >
        <div className="flex items-center justify-between">
          <span className="font-medium text-sm">Layers</span>
          <ChevronDown
            className={`h-4 w-4 transition-transform duration-200 ${
              open ? "rotate-180" : ""
            }`}
          />
        </div>
      </CollapsibleTrigger>

      {elements.length > 0 && (
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
                    onClick={(e) => {
                      const isMultiSelectKey = e.ctrlKey || e.metaKey;
                      selectElement(el.id, isMultiSelectKey);
                    }}
                    className={cn(
                      "flex items-center justify-between border rounded-md py-1 px-1.5 cursor-pointer transition-colors",
                      "group",
                      selectedElements.includes(el.id)
                        ? "border-storm-slate dark:border-sky-harbor/80"
                        : "border-transparent hover:border-sky-harbor/80 dark:hover:border-storm-slate"
                    )}
                  >
                    <span className="text-sm text-properties-text dark:text-foreground">
                      {el.name ||
                        el.type.charAt(0).toUpperCase() + el.type.slice(1)}
                    </span>
                    <div className="flex items-center space-x-1.5 mr-1">
                      {el.visible !== false ? (
                        <Eye
                          onClick={(e) => handleToggleVisibility(e, el.id)}
                          className="h-3 w-3 text-coffee-bean dark:text-desert-sand opacity-30 group-hover:opacity-50 hover:opacity-100 transition-opacity duration-200"
                          aria-label="Hide element"
                        />
                      ) : (
                        <EyeOff
                          onClick={(e) => handleToggleVisibility(e, el.id)}
                          className="h-3 w-3 text-coffee-bean dark:text-desert-sand opacity-30 group-hover:opacity-50 hover:opacity-100 transition-opacity duration-200"
                          aria-label="Show element"
                        />
                      )}
                      <Trash2
                        onClick={(e) => handleDeleteElement(e, el.id)}
                        className="h-3 w-3 text-coffee-bean dark:text-desert-sand opacity-30 group-hover:opacity-50 hover:opacity-100 transition-opacity duration-200"
                      />
                    </div>
                  </li>
                </React.Fragment>
              );
            })}
          </ul>
        </CollapsibleContent>
      )}
    </Collapsible>
  );
};

export default LayersPanel;
