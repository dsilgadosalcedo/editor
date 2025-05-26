import React, { useState } from "react";
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
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

const LAYER_ITEM_TYPE = "LAYER_ITEM";

interface DragItem {
  id: string;
  type: string;
  elementType: "rectangle" | "text" | "image" | "group";
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
    } as DragItem,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  // Drop functionality
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: LAYER_ITEM_TYPE,
    drop: (item: DragItem, monitor) => {
      if (!monitor.didDrop() && item.id !== element.id) {
        // Simple reordering for now - place after the target
        reorderElementsHierarchical(item.id, element.id, "after");
      }
    },
    canDrop: (item: DragItem) => {
      return item.id !== element.id;
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
      canDrop: monitor.canDrop(),
    }),
  }));

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isGroup) {
      enterIsolationMode(element.id);
    }
  };

  // Combine drag and drop refs
  const attachRef = (el: HTMLElement | null) => {
    drag(el);
    drop(el);
  };

  return (
    <>
      <li
        ref={attachRef}
        onClick={(e) => {
          const isMultiSelectKey = e.ctrlKey || e.metaKey;
          selectElement(element.id, isMultiSelectKey);
        }}
        onDoubleClick={handleDoubleClick}
        className={cn(
          "flex items-center justify-between border rounded-md py-1 px-1.5 cursor-pointer transition-all duration-200",
          "group",
          selectedElements.includes(element.id)
            ? "border-storm-slate dark:border-sky-harbor/80 bg-sky-harbor/10"
            : "border-transparent hover:border-sky-harbor/80 dark:hover:border-storm-slate hover:bg-sky-harbor/5",
          isDragging && "opacity-50 scale-95",
          isOver &&
            canDrop &&
            "bg-blue-100 dark:bg-blue-900/30 border-blue-400",
          isIsolated && "bg-amber-50 dark:bg-amber-900/20 border-amber-300"
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
          {isGroup && !hasChildren && <div className="w-4 h-4" />}
          {!isGroup && <div className="w-4 h-4" />}

          <span className="text-sm text-properties-text dark:text-foreground truncate">
            {element.name ||
              element.type.charAt(0).toUpperCase() + element.type.slice(1)}
            {isGroup && (
              <span className="text-xs text-gray-500 ml-1">
                (Double-click to isolate)
              </span>
            )}
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

      {/* Child elements */}
      {isGroup && hasChildren && isGroupExpanded && (
        <>
          {children.map((child) => (
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
      <Collapsible
        open={open}
        onOpenChange={setOpen}
        className="bg-card/60 z-50 space-y-1 fixed bottom-1 left-20 w-48 backdrop-blur-lg rounded-xl shadow-lg border border-sky-harbor/80 p-1 ml-6"
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
              {elementsToDisplay.map((el) => (
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
