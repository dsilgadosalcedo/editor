import React, { useState, useRef } from "react";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import {
  ChevronDown,
  ChevronRight,
  Trash2,
  Eye,
  EyeOff,
  ArrowLeft,
} from "lucide-react";
import { useCanvasStore } from "../store/useCanvasStore";
import { cn } from "@/lib/utils";
import { DndProvider, useDrag, useDrop, useDragLayer } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export const LAYER_ITEM_TYPE = "LAYER_ITEM";

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

const LayerItem: React.FC<LayerItemProps> = ({
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
      {/* Drop zone before element */}
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

          <span className="text-sm text-properties-text dark:text-foreground truncate">
            {element.name ||
              element.type.charAt(0).toUpperCase() + element.type.slice(1)}
            {/* {isGroup && (
              <span className="text-xs text-gray-500 ml-1">
                (Double-click to isolate)
              </span>
            )} */}
          </span>
        </div>

        <div className="flex items-center space-x-1.5 mr-1">
          {element.visible !== false ? (
            <Eye
              onClick={(e) => onToggleVisibility(e, element.id)}
              className="h-3 w-3 opacity-30 group-hover:opacity-50 hover:opacity-100 transition-opacity duration-200"
              aria-label="Hide element"
            />
          ) : (
            <EyeOff
              onClick={(e) => onToggleVisibility(e, element.id)}
              className="h-3 w-3 opacity-30 group-hover:opacity-50 hover:opacity-100 transition-opacity duration-200"
              aria-label="Show element"
            />
          )}
          <Trash2
            onClick={(e) => onDeleteElement(e, element.id)}
            className="h-3 w-3 opacity-30 group-hover:opacity-50 hover:opacity-100 transition-opacity duration-200"
          />
        </div>
      </li>

      {/* Drop indicator after */}
      {isOver && canDrop && dropPosition === "after" && (
        <div className="h-0.5 w-full mx-1 rounded bg-blue-400 dark:bg-blue-500 transition-all duration-200" />
      )}

      {/* Child elements */}
      {isGroup && hasChildren && isGroupExpanded && (
        <>
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
              isIsolated={isIsolated}
              index={childIndex}
              totalElements={children.length}
            />
          ))}
        </>
      )}
    </>
  );
};

// Custom drag layer to render a live preview of the dragged layer item
const layerStyles: React.CSSProperties = {
  position: "fixed",
  pointerEvents: "none",
  zIndex: 1000,
  left: 0,
  top: 0,
};

function getItemStyles(currentOffset: { x: number; y: number } | null) {
  if (!currentOffset) {
    return { display: "none" };
  }
  const { x, y } = currentOffset;
  const transform = `translate(${x}px, ${y}px)`;
  return {
    transform,
    WebkitTransform: transform,
    opacity: 0.8,
    minWidth: 0,
    maxWidth: "220px", // match panel width
    width: "auto",
  };
}

const LayersDragLayer: React.FC = () => {
  const { item, isDragging, currentOffset } = useDragLayer((monitor) => ({
    item: monitor.getItem(),
    isDragging:
      monitor.isDragging() && monitor.getItemType() === LAYER_ITEM_TYPE,
    currentOffset: monitor.getClientOffset(),
  }));
  // Always get elements hook unconditionally
  const { elements } = useCanvasStore();
  if (!isDragging) return null;
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
};

const LayersPanel: React.FC = () => {
  const {
    elements,
    selectedElements,
    selectElement,
    deleteElement,
    toggleElementVisibility,
    getTopLevelElements,
    getElementChildren,
    isolatedGroupId,
    exitIsolationMode,
    getIsolatedElements,
  } = useCanvasStore();

  const [open, setOpen] = useState<boolean>(false);

  const handleDeleteElement = (e: React.MouseEvent, elementId: string) => {
    e.stopPropagation();
    deleteElement(elementId);
  };

  const handleToggleVisibility = (e: React.MouseEvent, elementId: string) => {
    e.stopPropagation();
    toggleElementVisibility(elementId);
  };

  const handleExitIsolation = () => {
    exitIsolationMode();
  };

  // Get elements to display based on isolation mode
  const elementsToDisplay = isolatedGroupId
    ? getIsolatedElements()
    : [...getTopLevelElements()].reverse();

  const isolatedGroup = isolatedGroupId
    ? elements.find((el) => el.id === isolatedGroupId)
    : null;

  return (
    <DndProvider backend={HTML5Backend}>
      <LayersDragLayer />
      <Collapsible
        open={open}
        onOpenChange={setOpen}
        className="bg-sidebar/60 z-50 space-y-1 fixed bottom-1 left-20 w-48 backdrop-blur-sm rounded-xl shadow border border-card/80 p-1 ml-6"
        style={{ marginBottom: "max(20px, env(safe-area-inset-bottom))" }}
      >
        <CollapsibleTrigger
          className="w-full p-3 rounded-lg hover:bg-card/90 duration-300 transition-colors"
          aria-label={open ? "Collapse Layers" : "Expand Layers"}
        >
          <div className="flex items-center justify-between">
            <span className="font-medium text-sm">
              Layers ({elementsToDisplay.length})
              {isolatedGroupId && (
                <span className="text-xs text-amber-600 dark:text-amber-400 block">
                  Isolated
                </span>
              )}
            </span>
            <ChevronDown
              className={`h-4 w-4 transition-transform duration-200 ${
                open ? "rotate-180" : ""
              }`}
            />
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          {/* Isolation mode header */}
          {isolatedGroupId && (
            <div className="mb-2 p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <ArrowLeft className="h-3 w-3" />
                  <span className="text-xs font-medium">
                    {isolatedGroup?.name || "Group"}
                  </span>
                </div>
                <button
                  onClick={handleExitIsolation}
                  className="text-xs text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-200"
                >
                  Exit
                </button>
              </div>
            </div>
          )}

          {elementsToDisplay.length === 0 ? (
            <div className="p-3 text-xs text-gray-500 text-center">
              {isolatedGroupId ? "No elements in group" : "No elements yet"}
            </div>
          ) : (
            <ul className="space-y-1 max-h-64 overflow-auto">
              {elementsToDisplay.map((el, index) => (
                <LayerItem
                  key={el.id}
                  element={el}
                  depth={0}
                  onDeleteElement={handleDeleteElement}
                  onToggleVisibility={handleToggleVisibility}
                  selectedElements={selectedElements}
                  selectElement={selectElement}
                  getElementChildren={getElementChildren}
                  isIsolated={!!isolatedGroupId}
                  index={index}
                  totalElements={elementsToDisplay.length}
                />
              ))}
            </ul>
          )}
        </CollapsibleContent>
      </Collapsible>
    </DndProvider>
  );
};

export default LayersPanel;
