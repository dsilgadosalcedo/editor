import { useShallow } from "zustand/react/shallow";
import { useCanvasStore } from "./useCanvasStore";
import { CanvasElementData } from "../types";

// Optimized selectors that prevent unnecessary re-renders

// Canvas selectors
export const useElements = () => useCanvasStore((state) => state.elements);
export const useArtboardDimensions = () =>
  useCanvasStore((state) => state.artboardDimensions);
export const useArtboardAspectRatio = () =>
  useCanvasStore((state) => state.artboardAspectRatio);
export const useIsCustomAspectRatio = () =>
  useCanvasStore((state) => state.isCustomAspectRatio);

// Selection selectors
export const useSelectedElements = () =>
  useCanvasStore((state) => state.selectedElements);

// ✅ FIXED: Use primitive state values instead of function calls
export const useSelectedElementData = () =>
  useCanvasStore((state) => {
    if (state.selectedElements.length === 1) {
      return state.elements.find((el) => el.id === state.selectedElements[0]);
    }
    return undefined;
  });

export const useHasMultipleSelection = () =>
  useCanvasStore((state) => state.selectedElements.length > 1);

// UI selectors
export const useRightSidebarDocked = () =>
  useCanvasStore((state) => state.rightSidebarDocked);
export const usePanSensitivity = () =>
  useCanvasStore((state) => state.panSensitivity);
export const useZoomSensitivity = () =>
  useCanvasStore((state) => state.zoomSensitivity);

// Project selectors
export const useProjectName = () =>
  useCanvasStore((state) => state.projectName);
export const useProjectId = () => useCanvasStore((state) => state.projectId);

// History selectors
export const usePast = () => useCanvasStore((state) => state.past);
export const useFuture = () => useCanvasStore((state) => state.future);

// Isolation selectors
export const useIsolatedGroupId = () =>
  useCanvasStore((state) => state.isolatedGroupId);
export const useIsolationBreadcrumb = () =>
  useCanvasStore((state) => state.isolationBreadcrumb);

// Combined selectors using useShallow for multiple values
export const useCanvasState = () =>
  useCanvasStore(
    useShallow((state) => ({
      elements: state.elements,
      artboardDimensions: state.artboardDimensions,
      artboardAspectRatio: state.artboardAspectRatio,
      isCustomAspectRatio: state.isCustomAspectRatio,
    }))
  );

export const useSelectionState = () =>
  useCanvasStore(
    useShallow((state) => ({
      selectedElements: state.selectedElements,
      hasMultipleSelection: state.selectedElements.length > 1,
      selectedElementData:
        state.selectedElements.length === 1
          ? state.elements.find((el) => el.id === state.selectedElements[0])
          : undefined,
    }))
  );

export const useProjectState = () =>
  useCanvasStore(
    useShallow((state) => ({
      projectName: state.projectName,
      projectId: state.projectId,
      isCloudProject: Boolean(
        state.projectId && !state.projectId.startsWith("local-")
      ),
    }))
  );

export const useHistoryState = () =>
  useCanvasStore(
    useShallow((state) => ({
      past: state.past,
      future: state.future,
      canUndo: state.past.length > 0,
      canRedo: state.future.length > 0,
    }))
  );

export const useUIState = () =>
  useCanvasStore(
    useShallow((state) => ({
      rightSidebarDocked: state.rightSidebarDocked,
      panSensitivity: state.panSensitivity,
      zoomSensitivity: state.zoomSensitivity,
    }))
  );

// Element-specific selectors
export const useElementById = (id: string) =>
  useCanvasStore((state) => state.elements.find((el) => el.id === id));

export const useElementsByType = (type: string) =>
  useCanvasStore((state) => state.elements.filter((el) => el.type === type));

export const useVisibleElements = () =>
  useCanvasStore((state) =>
    state.elements.filter((el) => el.visible !== false)
  );

// Action selectors - group related actions together
export const useCanvasActions = () =>
  useCanvasStore(
    useShallow((state) => ({
      addElement: state.addElement,
      addElementAtPosition: state.addElementAtPosition,
      addImageElement: state.addImageElement,
      deleteElement: state.deleteElement,
      resetCanvas: state.resetCanvas,
    }))
  );

export const useElementActions = () =>
  useCanvasStore(
    useShallow((state) => ({
      moveElement: state.moveElement,
      moveElementNoHistory: state.moveElementNoHistory,
      moveSelectedElements: state.moveSelectedElements,
      moveSelectedElementsNoHistory: state.moveSelectedElementsNoHistory,
      resizeElement: state.resizeElement,
      resizeElementNoHistory: state.resizeElementNoHistory,
      resizeSelectedElements: state.resizeSelectedElements,
      resizeSelectedElementsNoHistory: state.resizeSelectedElementsNoHistory,
      updateName: state.updateName,
      updateFillColor: state.updateFillColor,
      setArtboardDimensions: state.setArtboardDimensions,
    }))
  );

export const useSelectionActions = () =>
  useCanvasStore(
    useShallow((state) => ({
      selectElement: state.selectElement,
      selectMultipleElements: state.selectMultipleElements,
      clearSelection: state.clearSelection,
      copySelection: state.copySelection,
      pasteClipboard: state.pasteClipboard,
    }))
  );

export const useHistoryActions = () =>
  useCanvasStore(
    useShallow((state) => ({
      undo: state.undo,
      redo: state.redo,
      addToHistory: state.addToHistory,
    }))
  );

export const useProjectActions = () =>
  useCanvasStore(
    useShallow((state) => ({
      setProjectName: state.setProjectName,
      setProjectData: state.setProjectData,
      setProjectDataWithArtboard: state.setProjectDataWithArtboard,
      clearCurrentProject: state.clearCurrentProject,
      validateProjectState: state.validateProjectState,
    }))
  );

export const useUIActions = () =>
  useCanvasStore(
    useShallow((state) => ({
      toggleRightSidebarDock: state.toggleRightSidebarDock,
      setPanSensitivity: state.setPanSensitivity,
      setZoomSensitivity: state.setZoomSensitivity,
    }))
  );

// Text-specific actions
export const useTextActions = () =>
  useCanvasStore(
    useShallow((state) => ({
      updateTextContent: state.updateTextContent,
      updateFontSize: state.updateFontSize,
      updateFontWeight: state.updateFontWeight,
      updateLetterSpacing: state.updateLetterSpacing,
      updateLineHeight: state.updateLineHeight,
      updateHorizontalAlign: state.updateHorizontalAlign,
      updateVerticalAlign: state.updateVerticalAlign,
      updateTextResizing: state.updateTextResizing,
    }))
  );

// Style-specific actions
export const useStyleActions = () =>
  useCanvasStore(
    useShallow((state) => ({
      updateCornerRadius: state.updateCornerRadius,
      updateCornerRadiusNoHistory: state.updateCornerRadiusNoHistory,
      updateBorderWidth: state.updateBorderWidth,
      updateBorderColor: state.updateBorderColor,
      updateShadowBlur: state.updateShadowBlur,
      updateShadowColor: state.updateShadowColor,
      updateRotation: state.updateRotation,
      updateRotationNoHistory: state.updateRotationNoHistory,
    }))
  );

// Grouping actions
export const useGroupingActions = () =>
  useCanvasStore(
    useShallow((state) => ({
      groupElements: state.groupElements,
      ungroupElements: state.ungroupElements,
      enterIsolationMode: state.enterIsolationMode,
      exitIsolationMode: state.exitIsolationMode,
      getElementDescendants: state.getElementDescendants,
      getElementChildren: state.getElementChildren,
    }))
  );

// Alignment actions
export const useAlignmentActions = () =>
  useCanvasStore(
    useShallow((state) => ({
      alignToArtboardLeft: state.alignToArtboardLeft,
      alignToArtboardRight: state.alignToArtboardRight,
      alignToArtboardTop: state.alignToArtboardTop,
      alignToArtboardBottom: state.alignToArtboardBottom,
      alignToArtboardCenterHorizontal: state.alignToArtboardCenterHorizontal,
      alignToArtboardCenterVertical: state.alignToArtboardCenterVertical,
    }))
  );

// File actions
export const useFileActions = () =>
  useCanvasStore(
    useShallow((state) => ({
      exportCanvas: state.exportCanvas,
      exportProject: state.exportProject,
      exportCanvasAsSVG: state.exportCanvasAsSVG,
      importCanvas: state.importCanvas,
      importProject: state.importProject,
      saveCanvas: state.saveCanvas,
      loadCanvas: state.loadCanvas,
      listCanvases: state.listCanvases,
    }))
  );
