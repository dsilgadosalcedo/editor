import React, { useRef, useState } from "react";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight, Trash2, Eye, EyeOff } from "lucide-react";
import { useCanvasStore } from "../store/useCanvasStore";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

interface LayerItemProps {
  element: any;
  actualIdx: number;
  depth: number;
  dragItemIndex: React.MutableRefObject<number | null>;
  dragOverIndex: number | null;
  setDragOverIndex: (index: number | null) => void;
  onDragStart: (e: React.DragEvent<HTMLLIElement>) => void;
  onDragOver: (e: React.DragEvent<HTMLLIElement>) => void;
  onDrop: (e: React.DragEvent<HTMLLIElement>) => void;
  onDeleteElement: (e: React.MouseEvent, elementId: string) => void;
  onToggleVisibility: (e: React.MouseEvent, elementId: string) => void;
  selectedElements: string[];
  selectElement: (id: string, addToSelection?: boolean) => void;
  getElementChildren: (elementId: string) => any[];
}

const LayerItem: React.FC<LayerItemProps> = ({
  element,
  actualIdx,
  depth,
  dragItemIndex,
  dragOverIndex,
  setDragOverIndex,
  onDragStart,
  onDragOver,
  onDrop,
  onDeleteElement,
  onToggleVisibility,
  selectedElements,
  selectElement,
  getElementChildren,
}) => {
  const [isGroupExpanded, setIsGroupExpanded] = useState(true);
  const isGroup = element.type === "group";
  const children = isGroup ? getElementChildren(element.id) : [];
  const hasChildren = children.length > 0;

  return (
    <>
      {dragOverIndex === actualIdx && (
        <li className="h-0 px-2">
          <Separator />
        </li>
      )}
      <li
        data-index={actualIdx}
        draggable
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onClick={(e) => {
          const isMultiSelectKey = e.ctrlKey || e.metaKey;
          selectElement(element.id, isMultiSelectKey);
        }}
        className={cn(
          "flex items-center justify-between border rounded-md py-1 px-1.5 cursor-pointer transition-colors",
          "group",
          selectedElements.includes(element.id)
            ? "border-storm-slate dark:border-sky-harbor/80"
            : "border-transparent hover:border-sky-harbor/80 dark:hover:border-storm-slate"
        )}
        style={{ paddingLeft: `${0.375 + depth * 0.75}rem` }}
      >
        <div className="flex items-center space-x-1 flex-1 min-w-0">
          {isGroup && hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsGroupExpanded(!isGroupExpanded);
              }}
              className="p-0.5 hover:bg-card/50 rounded transition-colors"
              aria-label={isGroupExpanded ? "Collapse group" : "Expand group"}
            >
              {isGroupExpanded ? (
                <ChevronDown className="h-3 w-3 text-coffee-bean dark:text-desert-sand" />
              ) : (
                <ChevronRight className="h-3 w-3 text-coffee-bean dark:text-desert-sand" />
              )}
            </button>
          )}
          {isGroup && !hasChildren && (
            <div className="w-4 h-4" /> // Spacer for alignment
          )}
          {!isGroup && (
            <div className="w-4 h-4" /> // Spacer for alignment with groups
          )}
          <span className="text-sm text-properties-text dark:text-foreground truncate">
            {element.name ||
              element.type.charAt(0).toUpperCase() + element.type.slice(1)}
          </span>
        </div>
        <div className="flex items-center space-x-1.5 mr-1">
          {element.visible !== false ? (
            <Eye
              onClick={(e) => onToggleVisibility(e, element.id)}
              className="h-3 w-3 text-coffee-bean dark:text-desert-sand opacity-30 group-hover:opacity-50 hover:opacity-100 transition-opacity duration-200"
              aria-label="Hide element"
            />
          ) : (
            <EyeOff
              onClick={(e) => onToggleVisibility(e, element.id)}
              className="h-3 w-3 text-coffee-bean dark:text-desert-sand opacity-30 group-hover:opacity-50 hover:opacity-100 transition-opacity duration-200"
              aria-label="Show element"
            />
          )}
          <Trash2
            onClick={(e) => onDeleteElement(e, element.id)}
            className="h-3 w-3 text-coffee-bean dark:text-desert-sand opacity-30 group-hover:opacity-50 hover:opacity-100 transition-opacity duration-200"
          />
        </div>
      </li>
      {isGroup && hasChildren && isGroupExpanded && (
        <>
          {children.map((child, childIdx) => (
            <LayerItem
              key={child.id}
              element={child}
              actualIdx={actualIdx + childIdx + 1} // Adjust index for children
              depth={depth + 1}
              dragItemIndex={dragItemIndex}
              dragOverIndex={dragOverIndex}
              setDragOverIndex={setDragOverIndex}
              onDragStart={onDragStart}
              onDragOver={onDragOver}
              onDrop={onDrop}
              onDeleteElement={onDeleteElement}
              onToggleVisibility={onToggleVisibility}
              selectedElements={selectedElements}
              selectElement={selectElement}
              getElementChildren={getElementChildren}
            />
          ))}
        </>
      )}
    </>
  );
};

const LayersPanel: React.FC = () => {
  const {
    elements,
    selectedElements,
    selectElement,
    reorderElements,
    deleteElement,
    toggleElementVisibility,
    getTopLevelElements,
    getElementChildren,
  } = useCanvasStore();
  const [open, setOpen] = useState<boolean>(true);
  const dragItemIndex = useRef<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Get only top-level elements (elements without parentId)
  const topLevelElements = getTopLevelElements();

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
      className="bg-card/60 z-30 space-y-1 fixed bottom-0 left-20 w-48 backdrop-blur-lg rounded-xl shadow-lg border border-sky-harbor/80 p-1 ml-6"
      style={{ marginBottom: "max(20px, env(safe-area-inset-bottom))" }}
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

      {topLevelElements.length > 0 && (
        <CollapsibleContent>
          <ul className="space-y-1 max-h-64 overflow-auto">
            {[...topLevelElements].reverse().map((el, revIdx) => {
              const actualIdx = topLevelElements.length - 1 - revIdx;
              return (
                <LayerItem
                  key={el.id}
                  element={el}
                  actualIdx={actualIdx}
                  depth={0}
                  dragItemIndex={dragItemIndex}
                  dragOverIndex={dragOverIndex}
                  setDragOverIndex={setDragOverIndex}
                  onDragStart={handleDragStart}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onDeleteElement={handleDeleteElement}
                  onToggleVisibility={handleToggleVisibility}
                  selectedElements={selectedElements}
                  selectElement={selectElement}
                  getElementChildren={getElementChildren}
                />
              );
            })}
          </ul>
        </CollapsibleContent>
      )}
    </Collapsible>
  );
};

export default LayersPanel;
