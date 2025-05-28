import React, { useState, useRef } from "react";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight, Trash2, Eye, EyeOff } from "lucide-react";
import { useCanvasStore } from "../../store/useCanvasStore";
import { cn } from "@/lib/utils";
import { useDrag, useDrop } from "react-dnd";
import { Separator } from "@/components/ui/separator";
import { LAYER_ITEM_TYPE } from "./types";

interface DragItem {
  id: string;
  type: string;
  elementType: "rectangle" | "text" | "image" | "group";
  element: any;
}

interface LayerItemProps {
  element: any;
  depth: number;
  onDeleteElement: (e: React.MouseEvent, elementId: string) => void;
  onToggleVisibility: (e: React.MouseEvent, elementId: string) => void;
  selectedElements: string[];
  selectElement: (id: string, addToSelection?: boolean) => void;
  getElementChildren: (elementId: string) => any[];
  isIsolated?: boolean;
  index: number;
  totalElements: number;
}

export const LayerItem: React.FC<LayerItemProps> = ({
  element,
  depth,
  onDeleteElement,
  onToggleVisibility,
  selectedElements,
  selectElement,
  getElementChildren,
  isIsolated = false,
  index,
  totalElements,
}) => {
  const [isGroupExpanded, setIsGroupExpanded] = useState(true);
  const { reorderElementsHierarchical, enterIsolationMode } = useCanvasStore();

  const isGroup = element.type === "group";
  const children = isGroup ? getElementChildren(element.id) : [];
  const hasChildren = children.length > 0;

  // Drag functionality
  const [{ isDragging }, drag] = useDrag(() => ({
    type: LAYER_ITEM_TYPE,
    item: {
      id: element.id,
      type: LAYER_ITEM_TYPE,
      elementType: element.type,
      element,
    } as DragItem,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  // Function to determine drop position based on mouse position
  const getDropPosition = (monitor: any): "before" | "after" | "inside" => {
    const clientOffset = monitor.getClientOffset();
    if (!clientOffset) return "after";

    const hoverBoundingRect = elementRef.current?.getBoundingClientRect();
    if (!hoverBoundingRect) return "after";

    const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
    const hoverClientY = clientOffset.y - hoverBoundingRect.top;

    // For groups, check if we're hovering over the center area for "inside" drop
    if (isGroup) {
      const threshold = 8; // pixels from top/bottom edge
      if (hoverClientY < threshold) {
        return "before";
      } else if (hoverClientY > hoverBoundingRect.height - threshold) {
        return "after";
      } else {
        return "inside";
      }
    }

    // For non-groups, just before/after based on middle
    return hoverClientY < hoverMiddleY ? "before" : "after";
  };

  // Single drop functionality with position detection
  const [{ isOver, canDrop, dropPosition }, drop] = useDrop(
    () => ({
      accept: LAYER_ITEM_TYPE,
      drop: (item: DragItem, monitor) => {
        if (!monitor.didDrop() && item.id !== element.id) {
          const position = getDropPosition(monitor);
          reorderElementsHierarchical(item.id, element.id, position);
        }
      },
      canDrop: (item: DragItem) => {
        return item.id !== element.id;
      },
      collect: (monitor) => {
        const position = getDropPosition(monitor);
        return {
          isOver: monitor.isOver({ shallow: true }),
          canDrop: monitor.canDrop(),
          dropPosition: position,
        };
      },
    }),
    [getDropPosition]
  );

  // Ref for the element to get bounding rect
  const elementRef = useRef<HTMLLIElement>(null);

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isGroup) {
      enterIsolationMode(element.id);
    }
  };

  // Combine drag and drop refs
  const attachDragRef = (el: HTMLLIElement | null) => {
    drag(el);
    elementRef.current = el;
  };

  const attachDropRef = (el: HTMLLIElement | null) => {
    drop(el);
    elementRef.current = el;
  };

  return (
    <>
      {/* Drop indicator before */}
      {isOver && canDrop && dropPosition === "before" && (
        <div className="h-0.5 w-full mx-1 rounded bg-blue-400 dark:bg-blue-500 transition-all duration-200" />
      )}

      <li
        ref={(el) => {
          attachDragRef(el);
          attachDropRef(el);
        }}
        onClick={(e) => {
          const isMultiSelectKey = e.ctrlKey || e.metaKey;
          selectElement(element.id, isMultiSelectKey);

          if (isGroup && hasChildren) {
            e.stopPropagation();
            setIsGroupExpanded(!isGroupExpanded);
          }
        }}
        onDoubleClick={handleDoubleClick}
        className={cn(
          "flex items-center justify-between border rounded-md py-1 px-1.5 cursor-pointer transition-all duration-200 relative",
          "group",
          selectedElements.includes(element.id)
            ? "border"
            : "border-transparent",
          isDragging && "invisible",
          isOver &&
            canDrop &&
            dropPosition === "inside" &&
            "bg-blue-100 dark:bg-blue-900/30 border-blue-400",
          isIsolated && "bg-amber-50 dark:bg-amber-900/20 border-amber-300"
        )}
        style={{ paddingLeft: `${0.375 + depth * 0.75}rem` }}
      >
        {depth > 0 && (
          <Separator orientation="vertical" className="absolute left-2 top-0" />
        )}

        <div className="flex items-center space-x-1 flex-1 min-w-0">
          {isGroup && hasChildren && (
            <>
              {isGroupExpanded ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )}
            </>
          )}

          <div
            className={cn(
              "w-3 h-3 rounded border flex-shrink-0",
              element.type === "text" && "bg-blue-500 border-blue-600",
              element.type === "rectangle" && "bg-green-500 border-green-600",
              element.type === "image" && "bg-purple-500 border-purple-600",
              element.type === "group" && "bg-amber-500 border-amber-600"
            )}
          />

          <span className="text-sm text-properties-text dark:text-foreground truncate font-normal">
            {element.name ||
              element.type.charAt(0).toUpperCase() + element.type.slice(1)}
          </span>
        </div>

        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={(e) => onToggleVisibility(e, element.id)}
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors duration-200"
            aria-label={`${element.visible ? "Hide" : "Show"} ${
              element.name || element.type
            }`}
          >
            {element.visible ? (
              <Eye className="h-3 w-3" />
            ) : (
              <EyeOff className="h-3 w-3" />
            )}
          </button>
          <button
            onClick={(e) => onDeleteElement(e, element.id)}
            className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors duration-200 text-red-600"
            aria-label={`Delete ${element.name || element.type}`}
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      </li>

      {/* Nested children */}
      {isGroup && hasChildren && (
        <Collapsible open={isGroupExpanded}>
          <CollapsibleContent>
            <ul className="space-y-1">
              {children.map((child, childIndex) => (
                <LayerItem
                  key={child.id}
                  element={child}
                  depth={depth + 1}
                  onDeleteElement={onDeleteElement}
                  onToggleVisibility={onToggleVisibility}
                  selectedElements={selectedElements}
                  selectElement={selectElement}
                  getElementChildren={getElementChildren}
                  index={childIndex}
                  totalElements={children.length}
                />
              ))}
            </ul>
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Drop indicator after (only if not last item) */}
      {isOver &&
        canDrop &&
        dropPosition === "after" &&
        index === totalElements - 1 && (
          <div className="h-0.5 w-full mx-1 rounded bg-blue-400 dark:bg-blue-500 transition-all duration-200" />
        )}
    </>
  );
};
