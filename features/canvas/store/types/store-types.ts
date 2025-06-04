import { CanvasElementData, ElementType, SavedCanvasData } from "../../types";
import { Project } from "@/lib/project-storage";

// Base state interfaces
export interface CanvasState {
  elements: CanvasElementData[];
  artboardDimensions: { width: number; height: number };
  artboardAspectRatio: number | null;
  isCustomAspectRatio: boolean;
}

export interface SelectionState {
  selectedElements: string[];
  clipboard: CanvasElementData[] | null;
}

export interface HistoryState {
  past: CanvasElementData[][];
  future: CanvasElementData[][];
}

export interface ProjectState {
  projectName: string;
  projectId: string | null;
}

export interface UIState {
  rightSidebarDocked: boolean;
  panSensitivity: number;
  zoomSensitivity: number;
}

export interface IsolationState {
  isolatedGroupId: string | null;
  isolationBreadcrumb: string[];
}

// Action interfaces
export interface CanvasActions {
  // Element management
  addElement: (type: ElementType) => void;
  addElementAtPosition: (type: ElementType, x: number, y: number) => void;
  addImageElement: (src: string, x?: number, y?: number) => void;
  deleteElement: (id: string) => void;

  // Element transformations
  moveElement: (id: string, dx: number, dy: number) => void;
  moveElementNoHistory: (id: string, dx: number, dy: number) => void;
  moveSelectedElements: (dx: number, dy: number) => void;
  moveSelectedElementsNoHistory: (dx: number, dy: number) => void;

  resizeElement: (
    id: string,
    width: number,
    height: number,
    preserveAspectRatio?: boolean
  ) => void;
  resizeElementNoHistory: (
    id: string,
    width: number,
    height: number,
    preserveAspectRatio?: boolean
  ) => void;
  resizeSelectedElements: (
    baseId: string,
    newWidth: number,
    newHeight: number,
    preserveAspectRatio?: boolean
  ) => void;
  resizeSelectedElementsNoHistory: (
    baseId: string,
    newWidth: number,
    newHeight: number,
    preserveAspectRatio?: boolean
  ) => void;

  // Element properties
  updateTextContent: (id: string, content: string) => void;
  updateName: (id: string, name: string) => void;
  updateFillColor: (id: string, color: string) => void;
  updateCornerRadius: (id: string, cornerRadius: number) => void;
  updateCornerRadiusNoHistory: (id: string, cornerRadius: number) => void;
  updateBorderWidth: (id: string, width: number) => void;
  updateBorderColor: (id: string, color: string) => void;
  updateShadowBlur: (id: string, blur: number) => void;
  updateShadowColor: (id: string, color: string) => void;
  updateRotation: (id: string, rotation: number) => void;
  updateRotationNoHistory: (id: string, rotation: number) => void;

  // Text properties
  updateFontSize: (id: string, fontSize: number) => void;
  updateFontWeight: (id: string, fontWeight: number) => void;
  updateLetterSpacing: (id: string, letterSpacing: number) => void;
  updateLineHeight: (id: string, lineHeight: number) => void;
  updateHorizontalAlign: (
    id: string,
    align: "left" | "center" | "right"
  ) => void;
  updateVerticalAlign: (id: string, align: "top" | "middle" | "bottom") => void;
  updateTextResizing: (
    id: string,
    resizing: "auto-width" | "auto-height" | "fixed"
  ) => void;

  // Image properties
  updateImageSrc: (id: string, src: string) => void;
  updateImageElement: (id: string, updates: Partial<CanvasElementData>) => void;

  // Element state
  toggleElementVisibility: (id: string) => void;
  toggleAspectRatioLock: (id: string) => void;

  // Canvas operations
  resetCanvas: () => void;
  reorderElements: (oldIndex: number, newIndex: number) => void;
  moveElementUp: (id: string) => void;
  moveElementDown: (id: string) => void;

  // Artboard
  setArtboardDimensions: (dims: { width: number; height: number }) => void;
  setArtboardAspectRatio: (ratio: number | null) => void;
  setCustomAspectRatio: (isCustom: boolean) => void;
}

export interface SelectionActions {
  selectElement: (id: string, addToSelection?: boolean) => void;
  selectMultipleElements: (ids: string[]) => void;
  clearSelection: () => void;
  copySelection: () => void;
  pasteClipboard: () => void;

  // Selection queries
  getSelectedElementData: () => CanvasElementData | undefined;
  getSelectedElementsData: () => CanvasElementData[];
  hasMultipleSelection: () => boolean;
}

export interface HistoryActions {
  addToHistory: () => void;
  getHistoryUpdate: () => {
    past: CanvasElementData[][];
    future: CanvasElementData[][];
  };
  undo: () => void;
  redo: () => void;
}

export interface ProjectActions {
  setProjectName: (name: string) => void;
  setProjectData: (
    projectId: string,
    projectName: string,
    projectData: {
      elements: CanvasElementData[];
      artboardDimensions: { width: number; height: number };
    }
  ) => void;
  setProjectDataWithArtboard: (
    projectId: string,
    projectName: string,
    projectData: {
      elements: CanvasElementData[];
      artboardDimensions: { width: number; height: number };
    },
    artboardSettings?: {
      artboardAspectRatio: number | null;
      isCustomAspectRatio: boolean;
      panSensitivity: number;
      zoomSensitivity: number;
    }
  ) => void;
  validateProjectState: () => { isValid: boolean; issues: string[] };
  reloadCurrentProject: () => boolean;
  loadProjectById: (id: string) => boolean;
  loadCloudProject: (project: Project) => void;
  clearCurrentProject: () => void;
  isCloudProject: () => boolean;
}

export interface UIActions {
  toggleRightSidebarDock: () => void;
  setPanSensitivity: (sensitivity: number) => void;
  setZoomSensitivity: (sensitivity: number) => void;
}

export interface GroupingActions {
  groupElements: () => void;
  ungroupElements: () => void;
  moveElementToGroup: (elementId: string, groupId: string | null) => void;
  reorderElementsHierarchical: (
    draggedElementId: string,
    targetElementId: string,
    position: "before" | "after" | "inside"
  ) => void;
  updateElementParenting: () => void;

  // Helper functions
  getElementDescendants: (elementId: string) => string[];
  getTopLevelElements: () => CanvasElementData[];
  getElementChildren: (elementId: string) => CanvasElementData[];
}

export interface IsolationActions {
  enterIsolationMode: (groupId: string, elementToSelect?: string) => void;
  exitIsolationMode: () => void;
  isInIsolationMode: () => boolean;
  getIsolatedElements: () => CanvasElementData[];
}

export interface AlignmentActions {
  alignToArtboardLeft: (id: string) => void;
  alignToArtboardRight: (id: string) => void;
  alignToArtboardTop: (id: string) => void;
  alignToArtboardBottom: (id: string) => void;
  alignToArtboardCenterHorizontal: (id: string) => void;
  alignToArtboardCenterVertical: (id: string) => void;
}

export interface FileActions {
  exportCanvas: (filename?: string) => void;
  exportProject: (filename?: string) => void;
  importElements: (elements: any[]) => {
    success: boolean;
    importedCount?: number;
  };
  importCanvas: (
    file: File
  ) => Promise<{ success: boolean; importedCount?: number }>;
  importProject: (file: File) => Promise<{
    success: boolean;
    importedCount?: number;
    projectCreated?: boolean;
    projectId?: string;
  }>;
  saveCanvas: (title?: string) => Promise<string | null>;
  loadCanvas: (id: string) => Promise<boolean>;
  listCanvases: () => Promise<SavedCanvasData[]>;
}

// Combined store interface
export interface CanvasStore
  extends CanvasState,
    SelectionState,
    HistoryState,
    ProjectState,
    UIState,
    IsolationState,
    CanvasActions,
    SelectionActions,
    HistoryActions,
    ProjectActions,
    UIActions,
    GroupingActions,
    IsolationActions,
    AlignmentActions,
    FileActions {}
