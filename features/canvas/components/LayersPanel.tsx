import React from "react";
import { ArrowLeft } from "lucide-react";
import { useCanvasStore } from "../store/useCanvasStore";
import {
  useSelectedElements,
  useIsolatedGroupId,
  useCanvasActions,
  useSelectionActions,
} from "../store/selectors";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { LayerItem, LayersDragLayer } from "./layers";
import { useShallow } from "zustand/react/shallow";

const LayersPanel: React.FC = () => {
  // Use optimized selectors
  const selectedElements = useSelectedElements();
  const isolatedGroupId = useIsolatedGroupId();
  const canvasActions = useCanvasActions();
  const selectionActions = useSelectionActions();

  // Group related layer functions
  const layerFunctions = useCanvasStore(
    useShallow((state) => ({
      getTopLevelElements: state.getTopLevelElements,
      getElementChildren: state.getElementChildren,
      toggleElementVisibility: state.toggleElementVisibility,
      exitIsolationMode: state.exitIsolationMode,
    }))
  );

  const handleDeleteElement = (e: React.MouseEvent, elementId: string) => {
    e.stopPropagation();
    canvasActions.deleteElement(elementId);
  };

  const handleToggleVisibility = (e: React.MouseEvent, elementId: string) => {
    e.stopPropagation();
    layerFunctions.toggleElementVisibility(elementId);
  };

  const handleExitIsolation = () => {
    layerFunctions.exitIsolationMode();
  };

  const topLevelElements = layerFunctions.getTopLevelElements();

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="fixed top-1/2 -translate-y-1/2 left-28 z-50">
        <div className="p-1 bg-sidebar/80 rounded-[1.25rem] shadow flex flex-col backdrop-blur-sm">
          <div className="flex-1 bg-card/50 dark:bg-card/50 border rounded-xl flex flex-col p-4 w-64 shadow-sm max-h-70 overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-properties-text dark:text-foreground">
                Layers
              </h3>
              {isolatedGroupId && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleExitIsolation}
                  className="text-xs p-1 h-auto"
                  aria-label="Exit isolation mode"
                >
                  <ArrowLeft className="h-3 w-3 mr-1" />
                  Exit
                </Button>
              )}
            </div>

            <Separator className="mb-4" />

            {/* Layers List */}
            <div className="flex-1 overflow-y-auto max-h-96">
              {topLevelElements.length === 0 ? (
                <div className="text-center text-sm text-gray-500 dark:text-gray-400 py-8">
                  No elements on canvas
                </div>
              ) : (
                <ul className="space-y-1">
                  {topLevelElements.map((element, index) => (
                    <LayerItem
                      key={element.id}
                      element={element}
                      depth={0}
                      onDeleteElement={handleDeleteElement}
                      onToggleVisibility={handleToggleVisibility}
                      selectedElements={selectedElements}
                      selectElement={selectionActions.selectElement}
                      getElementChildren={layerFunctions.getElementChildren}
                      isIsolated={element.id === isolatedGroupId}
                      index={index}
                      totalElements={topLevelElements.length}
                    />
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Drag Layer */}
      <LayersDragLayer />
    </DndProvider>
  );
};

export default LayersPanel;
