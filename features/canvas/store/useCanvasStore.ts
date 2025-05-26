import { create } from "zustand";
import {
  createProject,
  saveProject,
  getProjectBySlug,
  getProjects,
  updateProjectName,
  type Project,
} from "@/lib/project-storage";

// Add cloud project imports
import { api } from "@/convex/_generated/api";

export type ElementType = "rectangle" | "text" | "image" | "group";
export type ToolType = ElementType | "hand" | null;

export interface SavedCanvasData {
  id: string;
  title: string;
  data: {
    elements: CanvasElementData[];
    artboardDimensions: { width: number; height: number };
  };
  createdAt: string;
  updatedAt: string;
}

export interface CanvasElementData {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  content?: string;
  src?: string; // For image elements
  color: string;
  borderWidth?: number;
  borderColor?: string;
  shadowBlur?: number;
  shadowColor?: string;
  selected: boolean;
  cornerRadius?: number;
  name?: string;
  fontSize?: number;
  fontWeight?: number;
  letterSpacing?: number;
  lineHeight?: number;
  horizontalAlign?: "left" | "center" | "right";
  verticalAlign?: "top" | "middle" | "bottom";
  visible?: boolean;
  lockAspectRatio?: boolean;
  parentId?: string; // For grouped elements
  children?: string[]; // For group elements
  rotation?: number; // Rotation in degrees
  textResizing?: "auto-width" | "auto-height" | "fixed"; // Text resizing mode (only for text elements)
}

interface CanvasStoreState {
  elements: CanvasElementData[];
  selectedElements: string[];
  artboardDimensions: { width: number; height: number };
  artboardAspectRatio: number | null; // null means custom/unlocked
  projectName: string;
  projectId: string | null;
  projectSlug: string | null;
  panSensitivity: number;
  zoomSensitivity: number;
  past: CanvasElementData[][];
  future: CanvasElementData[][];
  clipboard: CanvasElementData[] | null;
  rightSidebarDocked: boolean;
  // Isolation mode
  isolatedGroupId: string | null;
  isolationBreadcrumb: string[];
  // Helper
  addToHistory: () => void;
  getHistoryUpdate: () => {
    past: CanvasElementData[][];
    future: CanvasElementData[][];
  };
  // Group helper functions
  getElementDescendants: (elementId: string) => string[];
  getTopLevelElements: () => CanvasElementData[];
  getElementChildren: (elementId: string) => CanvasElementData[];
  // Actions
  setArtboardDimensions: (dims: { width: number; height: number }) => void;
  setArtboardAspectRatio: (ratio: number | null) => void;
  setProjectName: (name: string) => void;
  setProjectData: (
    projectId: string,
    projectSlug: string,
    projectName: string
  ) => void;
  autoSaveProject: () => void;
  manualSaveProject: () => Promise<boolean>;
  validateProjectState: () => { isValid: boolean; issues: string[] };
  reloadCurrentProject: () => boolean;
  createNewProject: (name?: string) => Project;
  loadProjectBySlug: (slug: string) => boolean;
  clearCurrentProject: () => void;
  setPanSensitivity: (sensitivity: number) => void;
  setZoomSensitivity: (sensitivity: number) => void;
  addElement: (type: ElementType) => void;
  addImageElement: (src: string, x?: number, y?: number) => void;
  selectElement: (id: string, addToSelection?: boolean) => void;
  selectMultipleElements: (ids: string[]) => void;
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
  updateTextContent: (id: string, content: string) => void;
  resetCanvas: () => void;
  undo: () => void;
  redo: () => void;
  reorderElements: (oldIndex: number, newIndex: number) => void;
  moveElementUp: (id: string) => void;
  moveElementDown: (id: string) => void;
  updateCornerRadius: (id: string, cornerRadius: number) => void;
  updateCornerRadiusNoHistory: (id: string, cornerRadius: number) => void;
  updateFillColor: (id: string, color: string) => void;
  updateBorderWidth: (id: string, width: number) => void;
  updateBorderColor: (id: string, color: string) => void;
  updateShadowBlur: (id: string, blur: number) => void;
  updateShadowColor: (id: string, color: string) => void;
  deleteElement: (id: string) => void;
  updateName: (id: string, name: string) => void;
  updateFontSize: (id: string, fontSize: number) => void;
  updateFontWeight: (id: string, fontWeight: number) => void;
  updateLetterSpacing: (id: string, letterSpacing: number) => void;
  updateLineHeight: (id: string, lineHeight: number) => void;
  updateHorizontalAlign: (
    id: string,
    align: "left" | "center" | "right"
  ) => void;
  updateVerticalAlign: (id: string, align: "top" | "middle" | "bottom") => void;
  toggleAspectRatioLock: (id: string) => void;
  clearSelection: () => void;
  getSelectedElementData: () => CanvasElementData | undefined;
  getSelectedElementsData: () => CanvasElementData[];
  hasMultipleSelection: () => boolean;
  copySelection: () => void;
  pasteClipboard: () => void;
  updateImageSrc: (id: string, src: string) => void;
  toggleElementVisibility: (id: string) => void;
  // File operations
  exportCanvas: (filename?: string) => void;
  importCanvas: (
    file: File
  ) => Promise<{ success: boolean; importedCount?: number }>;
  // API functions
  saveCanvas: (title?: string) => Promise<string | null>;
  loadCanvas: (id: string) => Promise<boolean>;
  listCanvases: () => Promise<SavedCanvasData[]>;
  // Sidebar state
  toggleRightSidebarDock: () => void;
  // Grouping
  groupElements: () => void;
  ungroupElements: () => void;
  // Rotation
  updateRotation: (id: string, rotation: number) => void;
  updateRotationNoHistory: (id: string, rotation: number) => void;
  updateTextResizing: (
    id: string,
    resizing: "auto-width" | "auto-height" | "fixed"
  ) => void;
  // Artboard alignment
  alignToArtboardLeft: (id: string) => void;
  alignToArtboardRight: (id: string) => void;
  alignToArtboardTop: (id: string) => void;
  alignToArtboardBottom: (id: string) => void;
  alignToArtboardCenterHorizontal: (id: string) => void;
  alignToArtboardCenterVertical: (id: string) => void;
  // Group management
  updateElementParenting: () => void;
  reorderElementsHierarchical: (
    draggedElementId: string,
    targetElementId: string,
    position: "before" | "after" | "inside"
  ) => void;
  moveElementToGroup: (elementId: string, groupId: string | null) => void;
  // Isolation mode
  enterIsolationMode: (groupId: string) => void;
  exitIsolationMode: () => void;
  isInIsolationMode: () => boolean;
  getIsolatedElements: () => CanvasElementData[];
  // Add new function to load cloud project
  loadCloudProject: (project: Project) => void;
  // Add function to update project name (cloud-aware)
  updateProjectNameCloudAware: (
    newName: string
  ) => Promise<{ success: boolean; updatedProject?: Project }>;
  // Helper to determine if current project is cloud-based
  isCloudProject: () => boolean;
}

export const useCanvasStore = create<CanvasStoreState>((set, get) => ({
  elements: [],
  selectedElements: [],
  artboardDimensions: { width: 1024, height: 576 },
  artboardAspectRatio: 16 / 9, // Default to 16:9 ratio
  projectName: "Untitled Project",
  projectId: null,
  projectSlug: null,
  panSensitivity: 1.6,
  zoomSensitivity: 0.6,
  past: [],
  future: [],
  clipboard: null,
  rightSidebarDocked: true,
  // Isolation mode
  isolatedGroupId: null,
  isolationBreadcrumb: [],

  // Helper function to get history update object
  getHistoryUpdate: () => {
    const state = get();
    return {
      past: [...state.past, state.elements],
      future: [], // Clear future when making new changes
    };
  },

  // Action to add current state to history
  addToHistory: () => {
    set((state) => ({
      past: [...state.past, state.elements],
      future: [], // Clear future when making new changes
    }));
    // Auto-save project after history changes
    get().autoSaveProject();
  },

  // Group helper functions
  getElementDescendants: (elementId: string) => {
    const state = get();
    const descendants: string[] = [];
    const directChildren =
      state.elements.find((el) => el.id === elementId)?.children || [];

    for (const childId of directChildren) {
      descendants.push(childId);
      descendants.push(...get().getElementDescendants(childId)); // Recursively get grandchildren
    }

    return descendants;
  },

  getTopLevelElements: () => {
    const state = get();
    return state.elements.filter((el) => !el.parentId);
  },

  getElementChildren: (elementId: string) => {
    const state = get();
    const element = state.elements.find((el) => el.id === elementId);
    if (!element?.children) return [];
    return state.elements.filter((el) => element.children?.includes(el.id));
  },

  setArtboardDimensions: (dims) => set({ artboardDimensions: dims }),
  setArtboardAspectRatio: (ratio) => set({ artboardAspectRatio: ratio }),
  setProjectName: (name) => set({ projectName: name }),
  setProjectData: (projectId, projectSlug, projectName) =>
    set({ projectId, projectSlug, projectName }),
  autoSaveProject: (() => {
    let timeoutId: NodeJS.Timeout | null = null;

    return () => {
      // Clear any existing timeout to debounce rapid saves
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      // Set a new timeout to save after a short delay
      timeoutId = setTimeout(() => {
        const {
          projectId,
          projectSlug,
          projectName,
          elements,
          artboardDimensions,
        } = get();

        if (projectId && projectSlug) {
          try {
            const savedProject = saveProject({
              id: projectId,
              name: projectName,
              slug: projectSlug,
              data: { elements, artboardDimensions },
              createdAt: new Date().toISOString(), // Will be overwritten for existing projects
            });
            return savedProject;
          } catch (error) {
            console.error("Failed to auto-save project:", error);
          }
        }

        timeoutId = null;
      }, 300); // 300ms debounce delay
    };
  })(),
  manualSaveProject: async () => {
    const state = get();
    if (!state.projectId || !state.projectSlug) {
      console.error("Cannot save: missing project ID or slug");
      return false;
    }

    try {
      const savedProject = saveProject({
        id: state.projectId,
        name: state.projectName,
        slug: state.projectSlug,
        data: {
          elements: state.elements,
          artboardDimensions: state.artboardDimensions,
        },
        createdAt: new Date().toISOString(),
      });
      return true;
    } catch (error) {
      console.error("Failed to manually save project:", error);
      return false;
    }
  },
  validateProjectState: () => {
    const state = get();
    const issues: string[] = [];

    if (!state.projectId) {
      issues.push("Missing project ID");
    }
    if (!state.projectSlug) {
      issues.push("Missing project slug");
    }
    if (!state.projectName) {
      issues.push("Missing project name");
    }

    // Check if project exists in storage
    if (state.projectSlug) {
      const project = getProjectBySlug(state.projectSlug);
      if (!project) {
        issues.push("Project not found in storage");
      }
    }

    return {
      isValid: issues.length === 0,
      issues,
    };
  },
  reloadCurrentProject: () => {
    const state = get();
    if (state.projectSlug) {
      console.log(`Reloading current project: ${state.projectSlug}`);
      return get().loadProjectBySlug(state.projectSlug);
    }
    console.warn("No current project to reload");
    return false;
  },
  createNewProject: (name) => {
    // For new projects, we want to start with empty canvas, not current elements
    const emptyData = {
      elements: [],
      artboardDimensions: { width: 1024, height: 576 },
    };
    const project = createProject(name, emptyData);
    set({
      projectId: project.id,
      projectSlug: project.slug,
      projectName: project.name,
      elements: project.data.elements,
      artboardDimensions: project.data.artboardDimensions,
      selectedElements: [],
      past: [],
      future: [],
    });

    // Ensure the project is saved immediately after creation
    setTimeout(() => {
      get().autoSaveProject();
    }, 100);

    return project;
  },
  clearCurrentProject: () => {
    set({
      projectId: null,
      projectSlug: null,
      projectName: "Untitled Project",
      elements: [],
      artboardDimensions: { width: 1024, height: 576 },
      selectedElements: [],
      past: [],
      future: [],
    });
  },
  loadProjectBySlug: (slug) => {
    // First try local storage
    const localProject = getProjectBySlug(slug);
    if (localProject) {
      set({
        projectId: localProject.id,
        projectSlug: localProject.slug,
        projectName: localProject.name,
        elements: localProject.data.elements,
        artboardDimensions: localProject.data.artboardDimensions,
        selectedElements: [],
        past: [],
        future: [],
      });
      return true;
    }

    // If not found locally, we'll need to handle cloud projects differently
    // This will be handled by the canvas page component
    return false;
  },
  // Add new function to load cloud project
  loadCloudProject: (project) => {
    set({
      projectId: project.id,
      projectSlug: project.slug,
      projectName: project.name,
      elements: project.data.elements,
      artboardDimensions: project.data.artboardDimensions,
      selectedElements: [],
      past: [],
      future: [],
    });
  },
  setPanSensitivity: (sensitivity) =>
    set({ panSensitivity: Math.round(sensitivity * 10) / 10 }),
  setZoomSensitivity: (sensitivity) =>
    set({ zoomSensitivity: Math.round(sensitivity * 10) / 10 }),
  addElement: (type) => {
    const { artboardDimensions, elements, getHistoryUpdate } = get();
    let newElement: CanvasElementData;

    if (type === "rectangle") {
      newElement = {
        id: `${type}-${Date.now()}`,
        type,
        x: Math.round(artboardDimensions.width / 2 - 75),
        y: Math.round(artboardDimensions.height / 2 - 37.5),
        width: 150,
        height: 75,
        color: "#3b82f6",
        selected: true,
        visible: true,
        rotation: 0,
      };
    } else if (type === "text") {
      newElement = {
        id: `${type}-${Date.now()}`,
        type,
        x: Math.round(artboardDimensions.width / 2 - 50),
        y: Math.round(artboardDimensions.height / 2 - 10),
        width: 100,
        height: 20,
        content: "Text",
        color: "#000000",
        selected: true,
        fontSize: 16,
        fontWeight: 400,
        letterSpacing: 0,
        lineHeight: 20,
        horizontalAlign: "left",
        verticalAlign: "top",
        visible: true,
        rotation: 0,
        textResizing: "auto-width",
      };
    } else if (type === "image") {
      newElement = {
        id: `${type}-${Date.now()}`,
        type,
        x: Math.round(artboardDimensions.width / 2 - 75),
        y: Math.round(artboardDimensions.height / 2 - 56),
        width: 150,
        height: 112,
        src: "https://picsum.photos/150/112?random=" + Date.now(),
        color: "transparent",
        selected: true,
        visible: true,
        rotation: 0,
      };
    } else if (type === "group") {
      newElement = {
        id: `${type}-${Date.now()}`,
        type,
        x: Math.round(artboardDimensions.width / 2 - 100),
        y: Math.round(artboardDimensions.height / 2 - 75),
        width: 200,
        height: 150,
        color: "transparent",
        borderWidth: 1,
        borderColor: "#3b82f6",
        selected: true,
        visible: true,
        children: [],
        name: "Group",
        rotation: 0,
      };
    } else {
      return; // Invalid type
    }

    set((state) => ({
      ...getHistoryUpdate(),
      elements: [
        ...state.elements.map((el) => ({ ...el, selected: false })),
        newElement,
      ],
      selectedElements: [newElement.id],
    }));

    // Auto-save immediately after change
    get().autoSaveProject();
  },
  addImageElement: (src, x, y) => {
    const { artboardDimensions, elements, getHistoryUpdate } = get();

    // Create image to get dimensions
    const img = new Image();
    img.onload = () => {
      const maxWidth = 400;
      const maxHeight = 300;

      // Calculate dimensions maintaining aspect ratio
      let width = img.naturalWidth;
      let height = img.naturalHeight;

      if (width > maxWidth || height > maxHeight) {
        const scale = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * scale);
        height = Math.round(height * scale);
      }

      const newElement: CanvasElementData = {
        id: `image-${Date.now()}`,
        type: "image",
        x:
          x !== undefined
            ? x
            : Math.round(artboardDimensions.width / 2 - width / 2),
        y:
          y !== undefined
            ? y
            : Math.round(artboardDimensions.height / 2 - height / 2),
        width,
        height,
        src,
        color: "transparent",
        selected: true,
        visible: true,
        rotation: 0,
      };

      set((state) => ({
        ...getHistoryUpdate(),
        elements: [
          ...state.elements.map((el) => ({ ...el, selected: false })),
          newElement,
        ],
        selectedElements: [newElement.id],
      }));
    };

    img.onerror = () => {
      // Fallback if image fails to load
      const newElement: CanvasElementData = {
        id: `image-${Date.now()}`,
        type: "image",
        x:
          x !== undefined
            ? x
            : Math.round(artboardDimensions.width / 2 - 150 / 2),
        y:
          y !== undefined
            ? y
            : Math.round(artboardDimensions.height / 2 - 112 / 2),
        width: 150,
        height: 112,
        src,
        color: "transparent",
        selected: true,
        visible: true,
        rotation: 0,
      };

      set((state) => ({
        ...getHistoryUpdate(),
        elements: [
          ...state.elements.map((el) => ({ ...el, selected: false })),
          newElement,
        ],
        selectedElements: [newElement.id],
      }));
    };

    img.src = src;
  },
  selectElement: (id, addToSelection = false) =>
    set((state) => {
      if (addToSelection) {
        // Add to or remove from selection
        const isAlreadySelected = state.selectedElements.includes(id);
        const newSelectedElements = isAlreadySelected
          ? state.selectedElements.filter((elId) => elId !== id)
          : [...state.selectedElements, id];

        return {
          elements: state.elements.map((el) => ({
            ...el,
            selected: newSelectedElements.includes(el.id),
          })),
          selectedElements: newSelectedElements,
        };
      } else {
        // Single selection
        return {
          elements: state.elements.map((el) => ({
            ...el,
            selected: el.id === id,
          })),
          selectedElements: [id],
        };
      }
    }),
  selectMultipleElements: (ids) =>
    set((state) => ({
      elements: state.elements.map((el) => ({
        ...el,
        selected: ids.includes(el.id),
      })),
      selectedElements: ids,
    })),
  moveElement: (id, dx, dy) => {
    const beforeState = get();
    const element = beforeState.elements.find((el) => el.id === id);

    if (!element) return;

    set((state) => {
      const { getHistoryUpdate, getElementDescendants } = get();

      // If moving a group, also move all its descendants
      const elementsToMove =
        element.type === "group" ? [id, ...getElementDescendants(id)] : [id];

      return {
        ...getHistoryUpdate(),
        elements: state.elements.map((el) =>
          elementsToMove.includes(el.id)
            ? { ...el, x: Math.round(el.x + dx), y: Math.round(el.y + dy) }
            : el
        ),
      };
    });

    // Auto-save immediately after change
    get().autoSaveProject();
  },
  moveElementNoHistory: (id, dx, dy) =>
    set((state) => {
      const { getElementDescendants } = get();
      const element = state.elements.find((el) => el.id === id);

      if (!element) return state;

      // If moving a group, also move all its descendants
      const elementsToMove =
        element.type === "group" ? [id, ...getElementDescendants(id)] : [id];

      return {
        elements: state.elements.map((el) =>
          elementsToMove.includes(el.id)
            ? { ...el, x: Math.round(el.x + dx), y: Math.round(el.y + dy) }
            : el
        ),
      };
    }),
  moveSelectedElements: (dx, dy) => {
    set((state) => {
      const { getHistoryUpdate, getElementDescendants } = get();

      // Get all elements that should be moved (selected elements + their descendants)
      const elementsToMove = new Set<string>();

      state.selectedElements.forEach((id) => {
        elementsToMove.add(id);
        const element = state.elements.find((el) => el.id === id);
        if (element?.type === "group") {
          getElementDescendants(id).forEach((descendantId) =>
            elementsToMove.add(descendantId)
          );
        }
      });

      return {
        ...getHistoryUpdate(),
        elements: state.elements.map((el) =>
          elementsToMove.has(el.id)
            ? { ...el, x: Math.round(el.x + dx), y: Math.round(el.y + dy) }
            : el
        ),
      };
    });
    // Auto-save immediately after change
    get().autoSaveProject();
  },
  moveSelectedElementsNoHistory: (dx, dy) =>
    set((state) => {
      const { getElementDescendants } = get();

      // Get all elements that should be moved (selected elements + their descendants)
      const elementsToMove = new Set<string>();

      state.selectedElements.forEach((id) => {
        elementsToMove.add(id);
        const element = state.elements.find((el) => el.id === id);
        if (element?.type === "group") {
          getElementDescendants(id).forEach((descendantId) =>
            elementsToMove.add(descendantId)
          );
        }
      });

      return {
        elements: state.elements.map((el) =>
          elementsToMove.has(el.id)
            ? { ...el, x: Math.round(el.x + dx), y: Math.round(el.y + dy) }
            : el
        ),
      };
    }),
  resizeElement: (id, width, height, preserveAspectRatio = false) => {
    set((state) => {
      const { getHistoryUpdate, getElementDescendants } = get();
      const element = state.elements.find((el) => el.id === id);

      if (!element) return state;

      // If resizing a group, also resize and reposition its children proportionally
      if (element.type === "group") {
        const scaleX = Math.max(20, width) / element.width;
        const scaleY = Math.max(20, height) / element.height;
        const descendants = getElementDescendants(id);

        return {
          ...getHistoryUpdate(),
          elements: state.elements.map((el) => {
            if (el.id === id) {
              // Resize the group itself
              return {
                ...el,
                width: Math.max(20, width),
                height: Math.max(20, height),
                cornerRadius: el.cornerRadius
                  ? Math.max(
                      0,
                      Math.min(
                        el.cornerRadius,
                        Math.max(20, width) / 2,
                        Math.max(20, height) / 2
                      )
                    )
                  : el.cornerRadius,
              };
            } else if (descendants.includes(el.id)) {
              // Resize and reposition children proportionally
              const relativeX = el.x - element.x;
              const relativeY = el.y - element.y;

              return {
                ...el,
                x: element.x + Math.round(relativeX * scaleX),
                y: element.y + Math.round(relativeY * scaleY),
                width: Math.max(20, Math.round(el.width * scaleX)),
                height: Math.max(20, Math.round(el.height * scaleY)),
                // Scale font size for text elements
                fontSize:
                  el.type === "text" && el.fontSize
                    ? Math.max(
                        8,
                        Math.round(el.fontSize * Math.min(scaleX, scaleY))
                      )
                    : el.fontSize,
                lineHeight:
                  el.type === "text" && el.lineHeight
                    ? Math.max(
                        10,
                        Math.round(el.lineHeight * Math.min(scaleX, scaleY))
                      )
                    : el.lineHeight,
                cornerRadius: el.cornerRadius
                  ? Math.max(
                      0,
                      Math.min(
                        el.cornerRadius,
                        Math.max(20, Math.round(el.width * scaleX)) / 2,
                        Math.max(20, Math.round(el.height * scaleY)) / 2
                      )
                    )
                  : el.cornerRadius,
              };
            }
            return el;
          }),
        };
      } else {
        // Regular element resize
        return {
          ...getHistoryUpdate(),
          elements: state.elements.map((el) =>
            el.id === id
              ? {
                  ...el,
                  width: Math.max(20, width),
                  height: Math.max(20, height),
                  cornerRadius: el.cornerRadius
                    ? Math.max(
                        0,
                        Math.min(
                          el.cornerRadius,
                          Math.max(20, width) / 2,
                          Math.max(20, height) / 2
                        )
                      )
                    : el.cornerRadius,
                }
              : el
          ),
        };
      }
    });
    // Auto-save immediately after change
    get().autoSaveProject();
  },
  resizeElementNoHistory: (id, width, height, preserveAspectRatio = false) =>
    set((state) => ({
      elements: state.elements.map((el) =>
        el.id === id
          ? {
              ...el,
              width: Math.max(20, width),
              height: Math.max(20, height),
              // Clamp corner radius to new dimensions
              cornerRadius: el.cornerRadius
                ? Math.max(
                    0,
                    Math.min(
                      el.cornerRadius,
                      Math.max(20, width) / 2,
                      Math.max(20, height) / 2
                    )
                  )
                : el.cornerRadius,
            }
          : el
      ),
    })),
  resizeSelectedElements: (
    baseId,
    newWidth,
    newHeight,
    preserveAspectRatio = false
  ) =>
    set((state) => {
      const { getHistoryUpdate } = get();
      const baseElement = state.elements.find((el) => el.id === baseId);
      if (!baseElement || !state.selectedElements.includes(baseId)) {
        return state;
      }

      let scaleX = newWidth / baseElement.width;
      let scaleY = newHeight / baseElement.height;

      // If preserving aspect ratio, use the smaller scale to maintain proportions
      if (preserveAspectRatio) {
        const scale = Math.min(scaleX, scaleY);
        scaleX = scale;
        scaleY = scale;
      }

      return {
        ...getHistoryUpdate(),
        elements: state.elements.map((el) => {
          if (state.selectedElements.includes(el.id)) {
            // For text elements, also scale font size
            if (el.type === "text") {
              const currentFontSize = el.fontSize || 16;
              const currentLineHeight = el.lineHeight || 20;

              // Use the average scale for font sizing to match the orange button behavior
              const fontScale = (scaleX + scaleY) / 2;
              const newFontSize = Math.max(
                8,
                Math.round(currentFontSize * fontScale)
              );
              const newLineHeight = Math.max(
                10,
                Math.round(currentLineHeight * fontScale)
              );

              return {
                ...el,
                width: Math.max(20, Math.round(el.width * scaleX)),
                height: Math.max(20, Math.round(el.height * scaleY)),
                fontSize: newFontSize,
                lineHeight: newLineHeight,
              };
            } else {
              // For non-text elements in multi-selection, only respect shift key (preserveAspectRatio)
              // Individual lockAspectRatio settings are ignored during multi-selection
              let finalScaleX = scaleX;
              let finalScaleY = scaleY;

              if (preserveAspectRatio) {
                // When shift is pressed, use the smaller scale to maintain proportions
                const scale = Math.min(scaleX, scaleY);
                finalScaleX = scale;
                finalScaleY = scale;
              }

              return {
                ...el,
                width: Math.max(20, Math.round(el.width * finalScaleX)),
                height: Math.max(20, Math.round(el.height * finalScaleY)),
                // Clamp corner radius to new dimensions
                cornerRadius: el.cornerRadius
                  ? Math.max(
                      0,
                      Math.min(
                        el.cornerRadius,
                        Math.max(20, Math.round(el.width * finalScaleX)) / 2,
                        Math.max(20, Math.round(el.height * finalScaleY)) / 2
                      )
                    )
                  : el.cornerRadius,
              };
            }
          }
          return el;
        }),
      };
    }),
  resizeSelectedElementsNoHistory: (
    baseId,
    newWidth,
    newHeight,
    preserveAspectRatio = false
  ) =>
    set((state) => {
      const baseElement = state.elements.find((el) => el.id === baseId);
      if (!baseElement || !state.selectedElements.includes(baseId)) {
        return state;
      }

      let scaleX = newWidth / baseElement.width;
      let scaleY = newHeight / baseElement.height;

      // If preserving aspect ratio, use the smaller scale to maintain proportions
      if (preserveAspectRatio) {
        const scale = Math.min(scaleX, scaleY);
        scaleX = scale;
        scaleY = scale;
      }

      return {
        elements: state.elements.map((el) => {
          if (state.selectedElements.includes(el.id)) {
            // For text elements, also scale font size
            if (el.type === "text") {
              const currentFontSize = el.fontSize || 16;
              const currentLineHeight = el.lineHeight || 20;

              // Use the average scale for font sizing to match the orange button behavior
              const fontScale = (scaleX + scaleY) / 2;
              const newFontSize = Math.max(
                8,
                Math.round(currentFontSize * fontScale)
              );
              const newLineHeight = Math.max(
                10,
                Math.round(currentLineHeight * fontScale)
              );

              return {
                ...el,
                width: Math.max(20, Math.round(el.width * scaleX)),
                height: Math.max(20, Math.round(el.height * scaleY)),
                fontSize: newFontSize,
                lineHeight: newLineHeight,
              };
            } else {
              // For non-text elements in multi-selection, only respect shift key (preserveAspectRatio)
              // Individual lockAspectRatio settings are ignored during multi-selection
              let finalScaleX = scaleX;
              let finalScaleY = scaleY;

              if (preserveAspectRatio) {
                // When shift is pressed, use the smaller scale to maintain proportions
                const scale = Math.min(scaleX, scaleY);
                finalScaleX = scale;
                finalScaleY = scale;
              }

              return {
                ...el,
                width: Math.max(20, Math.round(el.width * finalScaleX)),
                height: Math.max(20, Math.round(el.height * finalScaleY)),
                // Clamp corner radius to new dimensions
                cornerRadius: el.cornerRadius
                  ? Math.max(
                      0,
                      Math.min(
                        el.cornerRadius,
                        Math.max(20, Math.round(el.width * finalScaleX)) / 2,
                        Math.max(20, Math.round(el.height * finalScaleY)) / 2
                      )
                    )
                  : el.cornerRadius,
              };
            }
          }
          return el;
        }),
      };
    }),
  updateTextContent: (id, content) => {
    set((state) => ({
      elements: state.elements.map((el) =>
        el.id === id ? { ...el, content } : el
      ),
    }));
    // Auto-save immediately after change
    get().autoSaveProject();
  },
  resetCanvas: () =>
    set(() => ({
      elements: [],
      selectedElements: [],
    })),
  undo: () =>
    set((state) => {
      if (state.past.length === 0) return state;
      const previous = state.past[state.past.length - 1];

      // Preserve selection by finding elements that were selected in the current state
      const currentlySelectedIds = state.selectedElements;
      const elementsToKeepSelected = previous
        .filter((el) => currentlySelectedIds.includes(el.id))
        .map((el) => el.id);

      return {
        past: state.past.slice(0, state.past.length - 1),
        future: [state.elements, ...state.future],
        elements: previous.map((el) => ({
          ...el,
          selected: elementsToKeepSelected.includes(el.id),
        })),
        selectedElements: elementsToKeepSelected,
      };
    }),
  redo: () =>
    set((state) => {
      if (state.future.length === 0) return state;
      const next = state.future[0];

      // Preserve selection by finding elements that were selected in the current state
      const currentlySelectedIds = state.selectedElements;
      const elementsToKeepSelected = next
        .filter((el) => currentlySelectedIds.includes(el.id))
        .map((el) => el.id);

      return {
        past: [...state.past, state.elements],
        future: state.future.slice(1),
        elements: next.map((el) => ({
          ...el,
          selected: elementsToKeepSelected.includes(el.id),
        })),
        selectedElements: elementsToKeepSelected,
      };
    }),
  reorderElements: (oldIndex, newIndex) =>
    set((state) => {
      const { getHistoryUpdate } = get();
      const updated = [...state.elements];
      const [moved] = updated.splice(oldIndex, 1);
      updated.splice(newIndex, 0, moved);
      return {
        ...getHistoryUpdate(),
        elements: updated,
      };
    }),
  moveElementUp: (id) =>
    set((state) => {
      const { getHistoryUpdate, getElementDescendants } = get();
      const elements = [...state.elements];
      const element = elements.find((el) => el.id === id);

      if (!element) return state;

      // Get all elements that need to move (element + descendants if it's a group)
      const elementsToMove =
        element.type === "group" ? [id, ...getElementDescendants(id)] : [id];

      // Find the highest index among elements to move
      const indices = elementsToMove.map((elId) =>
        elements.findIndex((el) => el.id === elId)
      );
      const maxIndex = Math.max(...indices);

      // Move up means bring forward (higher z-index) = move to higher index in array
      if (maxIndex < elements.length - 1) {
        // Find the next element that's not part of the group being moved
        let targetIndex = maxIndex + 1;
        while (
          targetIndex < elements.length &&
          elementsToMove.includes(elements[targetIndex].id)
        ) {
          targetIndex++;
        }

        if (targetIndex < elements.length) {
          // Move all elements in the group together
          const elementsToMoveData = elementsToMove
            .map((elId) => elements.find((el) => el.id === elId))
            .filter((el): el is CanvasElementData => el !== undefined);

          // Remove elements to move from their current positions
          const filteredElements = elements.filter(
            (el) => !elementsToMove.includes(el.id)
          );

          // Insert them after the target position
          const targetPos = filteredElements.findIndex(
            (el) => el.id === elements[targetIndex].id
          );

          filteredElements.splice(targetPos + 1, 0, ...elementsToMoveData);

          return {
            ...getHistoryUpdate(),
            elements: filteredElements,
          };
        }
      }
      return state;
    }),
  moveElementDown: (id) =>
    set((state) => {
      const { getHistoryUpdate, getElementDescendants } = get();
      const elements = [...state.elements];
      const element = elements.find((el) => el.id === id);

      if (!element) return state;

      // Get all elements that need to move (element + descendants if it's a group)
      const elementsToMove =
        element.type === "group" ? [id, ...getElementDescendants(id)] : [id];

      // Find the lowest index among elements to move
      const indices = elementsToMove.map((elId) =>
        elements.findIndex((el) => el.id === elId)
      );
      const minIndex = Math.min(...indices);

      // Move down means send backward (lower z-index) = move to lower index in array
      if (minIndex > 0) {
        // Find the previous element that's not part of the group being moved
        let targetIndex = minIndex - 1;
        while (
          targetIndex >= 0 &&
          elementsToMove.includes(elements[targetIndex].id)
        ) {
          targetIndex--;
        }

        if (targetIndex >= 0) {
          // Move all elements in the group together
          const elementsToMoveData = elementsToMove
            .map((elId) => elements.find((el) => el.id === elId))
            .filter((el): el is CanvasElementData => el !== undefined);

          // Remove elements to move from their current positions
          const filteredElements = elements.filter(
            (el) => !elementsToMove.includes(el.id)
          );

          // Insert them before the target position
          const targetPos = filteredElements.findIndex(
            (el) => el.id === elements[targetIndex].id
          );

          filteredElements.splice(targetPos, 0, ...elementsToMoveData);

          return {
            ...getHistoryUpdate(),
            elements: filteredElements,
          };
        }
      }
      return state;
    }),
  updateCornerRadius: (id, cornerRadius) => {
    set((state) => {
      const { getHistoryUpdate } = get();
      return {
        ...getHistoryUpdate(),
        elements: state.elements.map((el) =>
          el.id === id && (el.type === "rectangle" || el.type === "image")
            ? {
                ...el,
                cornerRadius: Math.max(
                  0,
                  Math.min(cornerRadius, el.width / 2, el.height / 2)
                ),
              }
            : el
        ),
      };
    });
    // Auto-save immediately after change
    get().autoSaveProject();
  },
  updateCornerRadiusNoHistory: (id, cornerRadius) =>
    set((state) => ({
      elements: state.elements.map((el) =>
        el.id === id && (el.type === "rectangle" || el.type === "image")
          ? {
              ...el,
              cornerRadius: Math.max(
                0,
                Math.min(cornerRadius, el.width / 2, el.height / 2)
              ),
            }
          : el
      ),
    })),
  updateFillColor: (id, color) => {
    set((state) => {
      const { getHistoryUpdate } = get();
      return {
        ...getHistoryUpdate(),
        elements: state.elements.map((el) =>
          el.id === id ? { ...el, color } : el
        ),
      };
    });
    // Auto-save immediately after change
    get().autoSaveProject();
  },
  updateBorderWidth: (id, borderWidth) => {
    set((state) => {
      const { getHistoryUpdate } = get();
      return {
        ...getHistoryUpdate(),
        elements: state.elements.map((el) => {
          if (el.id === id) {
            // If setting a border width and no border color exists, set it to black
            const updatedElement = { ...el, borderWidth };
            if (borderWidth > 0 && !el.borderColor) {
              updatedElement.borderColor = "#000000";
            }
            return updatedElement;
          }
          return el;
        }),
      };
    });
    // Auto-save immediately after change
    get().autoSaveProject();
  },
  updateBorderColor: (id, borderColor) => {
    set((state) => {
      const { getHistoryUpdate } = get();
      return {
        ...getHistoryUpdate(),
        elements: state.elements.map((el) =>
          el.id === id ? { ...el, borderColor } : el
        ),
      };
    });
    // Auto-save immediately after change
    get().autoSaveProject();
  },
  updateShadowBlur: (id, shadowBlur) =>
    set((state) => {
      const { getHistoryUpdate } = get();
      return {
        ...getHistoryUpdate(),
        elements: state.elements.map((el) => {
          if (el.id === id) {
            // If setting a shadow blur and no shadow color exists, set it to black
            const updatedElement = { ...el, shadowBlur };
            if (shadowBlur > 0 && !el.shadowColor) {
              updatedElement.shadowColor = "#000000";
            }
            return updatedElement;
          }
          return el;
        }),
      };
    }),
  updateShadowColor: (id, shadowColor) =>
    set((state) => {
      const { getHistoryUpdate } = get();
      return {
        ...getHistoryUpdate(),
        elements: state.elements.map((el) =>
          el.id === id ? { ...el, shadowColor } : el
        ),
      };
    }),
  deleteElement: (id) => {
    set((state) => {
      const { getHistoryUpdate, getElementDescendants } = get();
      const elementToDelete = state.elements.find((el) => el.id === id);

      if (!elementToDelete) return state;

      // Get all elements to delete (element + its descendants)
      const elementsToDelete = [id, ...getElementDescendants(id)];

      // If deleting a child element, remove it from its parent's children array
      let updatedElements = state.elements.filter(
        (el) => !elementsToDelete.includes(el.id)
      );

      if (elementToDelete.parentId) {
        updatedElements = updatedElements.map((el) => {
          if (el.id === elementToDelete.parentId && el.children) {
            return {
              ...el,
              children: el.children.filter(
                (childId) => !elementsToDelete.includes(childId)
              ),
            };
          }
          return el;
        });
      }

      return {
        ...getHistoryUpdate(),
        elements: updatedElements,
        selectedElements: state.selectedElements.filter(
          (elId) => !elementsToDelete.includes(elId)
        ),
      };
    });
    // Auto-save immediately after change
    get().autoSaveProject();
  },
  updateName: (id, name) => {
    set((state) => {
      const { getHistoryUpdate } = get();
      return {
        ...getHistoryUpdate(),
        elements: state.elements.map((el) =>
          el.id === id ? { ...el, name } : el
        ),
      };
    });
    // Auto-save immediately after change
    get().autoSaveProject();
  },
  updateFontSize: (id, fontSize) => {
    set((state) => {
      const { getHistoryUpdate } = get();
      return {
        ...getHistoryUpdate(),
        elements: state.elements.map((el) =>
          el.id === id && el.type === "text"
            ? { ...el, fontSize: Math.max(1, fontSize) }
            : el
        ),
      };
    });
    // Auto-save immediately after change
    get().autoSaveProject();
  },
  updateFontWeight: (id, fontWeight) =>
    set((state) => {
      const { getHistoryUpdate } = get();
      return {
        ...getHistoryUpdate(),
        elements: state.elements.map((el) =>
          el.id === id ? { ...el, fontWeight } : el
        ),
      };
    }),
  updateLetterSpacing: (id, letterSpacing) =>
    set((state) => {
      const { getHistoryUpdate } = get();
      return {
        ...getHistoryUpdate(),
        elements: state.elements.map((el) =>
          el.id === id ? { ...el, letterSpacing } : el
        ),
      };
    }),
  updateLineHeight: (id, lineHeight) =>
    set((state) => {
      const { getHistoryUpdate } = get();
      return {
        ...getHistoryUpdate(),
        elements: state.elements.map((el) =>
          el.id === id ? { ...el, lineHeight } : el
        ),
      };
    }),
  updateHorizontalAlign: (id, horizontalAlign) =>
    set((state) => {
      const { getHistoryUpdate } = get();
      return {
        ...getHistoryUpdate(),
        elements: state.elements.map((el) =>
          el.id === id ? { ...el, horizontalAlign } : el
        ),
      };
    }),
  updateVerticalAlign: (id, verticalAlign) =>
    set((state) => {
      const { getHistoryUpdate } = get();
      return {
        ...getHistoryUpdate(),
        elements: state.elements.map((el) =>
          el.id === id ? { ...el, verticalAlign } : el
        ),
      };
    }),
  clearSelection: () =>
    set((state) => ({
      elements: state.elements.map((el) => ({ ...el, selected: false })),
      selectedElements: [],
    })),
  getSelectedElementData: () => {
    const { elements, selectedElements } = get();
    return selectedElements.length === 1
      ? elements.find((el) => el.id === selectedElements[0])
      : undefined;
  },
  getSelectedElementsData: () => {
    const { elements, selectedElements } = get();
    return elements.filter((el) => selectedElements.includes(el.id));
  },
  hasMultipleSelection: () => {
    const { selectedElements } = get();
    return selectedElements.length > 1;
  },
  copySelection: () => {
    const state = get();
    const { getElementDescendants } = get();

    // Get all selected elements and their descendants
    const elementsToCopy: string[] = [];

    state.selectedElements.forEach((selectedId) => {
      elementsToCopy.push(selectedId);
      // If it's a group, also include all its descendants
      const element = state.elements.find((el) => el.id === selectedId);
      if (element?.type === "group") {
        elementsToCopy.push(...getElementDescendants(selectedId));
      }
    });

    // Remove duplicates and get the actual elements
    const uniqueElementIds = [...new Set(elementsToCopy)];
    const selectedElements = state.elements.filter((el) =>
      uniqueElementIds.includes(el.id)
    );

    // Update internal clipboard to store all selected elements and their descendants
    const clipboardElements =
      selectedElements.length > 0
        ? selectedElements.map((el) => ({ ...el }))
        : null;

    set({ clipboard: clipboardElements });

    // Also copy to system clipboard for Figma compatibility
    if (selectedElements.length > 0) {
      // Import the function dynamically to avoid issues during SSR
      import("@/lib/figma-clipboard")
        .then(({ copyToFigmaClipboard }) => {
          return copyToFigmaClipboard(selectedElements, {
            includeBackground: false,
            padding: 20,
            scale: 1,
          });
        })
        .catch((error) => {
          console.warn("Failed to copy to system clipboard:", error);
          // Silently fail - the internal clipboard still works
        });
    }
  },
  pasteClipboard: () =>
    set((state) => {
      if (!state.clipboard || state.clipboard.length === 0) return {};

      const newElements: CanvasElementData[] = [];
      const newElementIds: string[] = [];
      const oldToNewIdMapping: { [oldId: string]: string } = {};

      // First pass: Create all elements with new IDs
      state.clipboard.forEach((clipboardElement, index) => {
        const newId = `${clipboardElement.type}-${Date.now()}-${index}`;
        oldToNewIdMapping[clipboardElement.id] = newId;

        const newElement: CanvasElementData = {
          ...clipboardElement,
          id: newId,
          x: clipboardElement.x + 20,
          y: clipboardElement.y + 20,
          selected: true,
          rotation: clipboardElement.rotation || 0,
        };

        // Don't modify parentId yet - will do in second pass
        newElements.push(newElement);
        newElementIds.push(newId);
      });

      // Second pass: Update all parent and children relationships
      const finalElements = newElements.map((element) => {
        const updatedElement = { ...element };

        // Update parentId if the parent was also copied
        if (element.parentId && oldToNewIdMapping[element.parentId]) {
          updatedElement.parentId = oldToNewIdMapping[element.parentId];
        } else if (element.parentId) {
          // If parent wasn't copied, make this a top-level element
          delete updatedElement.parentId;
        }

        // Update children array for groups
        if (element.type === "group" && element.children) {
          updatedElement.children = element.children
            .map((childId) => oldToNewIdMapping[childId])
            .filter(Boolean); // Only keep children that were also copied
        }

        return updatedElement;
      });

      const { getHistoryUpdate } = get();

      return {
        ...getHistoryUpdate(),
        elements: [
          ...state.elements.map((el) => ({ ...el, selected: false })),
          ...finalElements,
        ],
        selectedElements: newElementIds,
      };
    }),
  updateImageSrc: (id, src) =>
    set((state) => ({
      elements: state.elements.map((el) =>
        el.id === id && el.type === "image" ? { ...el, src } : el
      ),
    })),
  toggleElementVisibility: (id) =>
    set((state) => ({
      elements: state.elements.map((el) =>
        el.id === id
          ? { ...el, visible: el.visible !== false ? false : true }
          : el
      ),
    })),
  toggleAspectRatioLock: (id) => {
    set((state) => {
      const { getHistoryUpdate } = get();
      return {
        ...getHistoryUpdate(),
        elements: state.elements.map((el) =>
          el.id === id ? { ...el, lockAspectRatio: !el.lockAspectRatio } : el
        ),
      };
    });
    // Auto-save immediately after change
    get().autoSaveProject();
  },
  // File operations
  exportCanvas: (filename?: string) => {
    const { elements, artboardDimensions, projectName } = get();

    // Clean elements by removing id and selected properties
    const cleanElements = elements.map(
      ({ id, selected, ...element }) => element
    );

    const canvasData = {
      elements: cleanElements,
      artboardDimensions,
      projectName,
      exportedAt: new Date().toISOString(),
      version: "1.0",
    };

    const dataStr = JSON.stringify(canvasData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(dataBlob);
    link.download =
      filename ||
      `${projectName.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.json`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(link.href);
  },
  importCanvas: async (file: File) => {
    return new Promise((resolve) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const canvasData = JSON.parse(content);

          // Validate the imported data structure
          if (!canvasData.elements || !Array.isArray(canvasData.elements)) {
            console.error(
              "Invalid canvas data: missing or invalid elements array"
            );
            resolve({ success: false });
            return;
          }

          if (
            !canvasData.artboardDimensions ||
            typeof canvasData.artboardDimensions.width !== "number" ||
            typeof canvasData.artboardDimensions.height !== "number"
          ) {
            console.error(
              "Invalid canvas data: missing or invalid artboard dimensions"
            );
            resolve({ success: false });
            return;
          }

          const state = get();
          const { getHistoryUpdate } = get();

          // Generate new IDs for imported elements to avoid conflicts
          const importedElements = canvasData.elements.map(
            (el: CanvasElementData) => {
              const newId = `${el.type}-${Date.now()}-${Math.random()
                .toString(36)
                .substr(2, 9)}`;
              return {
                ...el,
                id: newId,
                selected: true, // Auto-select imported elements
                rotation: 0,
              };
            }
          );

          // Get the IDs of imported elements for selection
          const importedElementIds = importedElements.map(
            (el: CanvasElementData) => el.id
          );

          // Add imported elements to existing elements instead of replacing
          const updatedElements = [
            ...state.elements.map((el) => ({ ...el, selected: false })), // Deselect current elements
            ...importedElements,
          ];

          // Keep current artboard dimensions (don't change them)
          // Import project name if it exists in the imported data
          const updateData: Partial<CanvasStoreState> = {
            ...getHistoryUpdate(),
            elements: updatedElements,
            selectedElements: importedElementIds, // Auto-select all imported elements
          };

          if (
            canvasData.projectName &&
            typeof canvasData.projectName === "string"
          ) {
            updateData.projectName = canvasData.projectName;
          }

          set(updateData);

          resolve({ success: true, importedCount: importedElements.length });
        } catch (error) {
          console.error("Error parsing canvas file:", error);
          resolve({ success: false });
        }
      };

      reader.onerror = () => {
        console.error("Error reading file");
        resolve({ success: false });
      };

      reader.readAsText(file);
    });
  },
  // API functions
  saveCanvas: async (title?: string) => {
    const { elements, artboardDimensions } = get();
    try {
      const response = await fetch("/api/canvas/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          canvasData: {
            elements,
            artboardDimensions,
          },
          title,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save canvas");
      }

      const result = await response.json();
      return result.canvasId;
    } catch (error) {
      console.error("Error saving canvas:", error);
      return null;
    }
  },
  loadCanvas: async (id: string) => {
    try {
      const response = await fetch(`/api/canvas/load/${id}`);

      if (!response.ok) {
        throw new Error("Failed to load canvas");
      }

      const result = await response.json();
      const { elements, artboardDimensions } = result.canvas.data;

      set({
        elements,
        artboardDimensions,
        selectedElements: [],
        past: [],
        future: [],
      });

      return true;
    } catch (error) {
      console.error("Error loading canvas:", error);
      return false;
    }
  },
  listCanvases: async () => {
    try {
      const response = await fetch("/api/canvas/list");

      if (!response.ok) {
        throw new Error("Failed to list canvases");
      }

      const result = await response.json();
      return result.canvases;
    } catch (error) {
      console.error("Error listing canvases:", error);
      return [];
    }
  },
  // Sidebar state actions
  toggleRightSidebarDock: () =>
    set((state) => ({
      rightSidebarDocked: !state.rightSidebarDocked,
    })),
  // Grouping
  groupElements: () => {
    const state = get();
    const { getHistoryUpdate } = get();

    if (state.selectedElements.length < 2) return;

    const selectedElements = state.elements.filter((el) =>
      state.selectedElements.includes(el.id)
    );

    // Calculate bounding box for the group
    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;

    selectedElements.forEach((el) => {
      minX = Math.min(minX, el.x);
      minY = Math.min(minY, el.y);
      maxX = Math.max(maxX, el.x + el.width);
      maxY = Math.max(maxY, el.y + el.height);
    });

    const groupId = `group-${Date.now()}`;
    const groupElement: CanvasElementData = {
      id: groupId,
      type: "group",
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
      color: "transparent",
      borderWidth: 1,
      borderColor: "#3b82f6",
      selected: true,
      visible: true,
      children: state.selectedElements,
      name: "Group",
      rotation: 0,
    };

    // Update selected elements to have this group as parent
    const updatedElements = state.elements.map((el) => {
      if (state.selectedElements.includes(el.id)) {
        return { ...el, parentId: groupId, selected: false };
      }
      return el;
    });

    set({
      ...getHistoryUpdate(),
      elements: [...updatedElements, groupElement],
      selectedElements: [groupId],
    });
  },
  ungroupElements: () => {
    const state = get();
    const { getHistoryUpdate } = get();

    if (state.selectedElements.length !== 1) return;

    const selectedElement = state.elements.find(
      (el) => el.id === state.selectedElements[0]
    );

    if (!selectedElement || selectedElement.type !== "group") return;

    const childrenIds = selectedElement.children || [];

    // Remove the group and update children to remove parentId
    const updatedElements = state.elements
      .filter((el) => el.id !== selectedElement.id)
      .map((el) => {
        if (childrenIds.includes(el.id)) {
          return { ...el, parentId: undefined, selected: true };
        }
        return el;
      });

    set({
      ...getHistoryUpdate(),
      elements: updatedElements,
      selectedElements: childrenIds,
    });
  },
  // Rotation
  updateRotation: (id, rotation) => {
    set((state) => {
      const { getHistoryUpdate } = get();
      return {
        ...getHistoryUpdate(),
        elements: state.elements.map((el) =>
          el.id === id ? { ...el, rotation } : el
        ),
      };
    });
    // Auto-save immediately after change
    get().autoSaveProject();
  },
  updateRotationNoHistory: (id, rotation) =>
    set((state) => ({
      elements: state.elements.map((el) =>
        el.id === id ? { ...el, rotation } : el
      ),
    })),
  updateTextResizing: (id, resizing) =>
    set((state) => ({
      elements: state.elements.map((el) =>
        el.id === id && el.type === "text"
          ? { ...el, textResizing: resizing }
          : el
      ),
    })),
  // Artboard alignment
  alignToArtboardLeft: (id) => {
    const { artboardDimensions, getHistoryUpdate } = get();
    set((state) => ({
      ...getHistoryUpdate(),
      elements: state.elements.map((el) =>
        el.id === id ? { ...el, x: 0 } : el
      ),
    }));
  },
  alignToArtboardRight: (id) => {
    const { artboardDimensions, getHistoryUpdate } = get();
    set((state) => ({
      ...getHistoryUpdate(),
      elements: state.elements.map((el) =>
        el.id === id ? { ...el, x: artboardDimensions.width - el.width } : el
      ),
    }));
  },
  alignToArtboardTop: (id) => {
    const { artboardDimensions, getHistoryUpdate } = get();
    set((state) => ({
      ...getHistoryUpdate(),
      elements: state.elements.map((el) =>
        el.id === id ? { ...el, y: 0 } : el
      ),
    }));
  },
  alignToArtboardBottom: (id) => {
    const { artboardDimensions, getHistoryUpdate } = get();
    set((state) => ({
      ...getHistoryUpdate(),
      elements: state.elements.map((el) =>
        el.id === id ? { ...el, y: artboardDimensions.height - el.height } : el
      ),
    }));
  },
  alignToArtboardCenterHorizontal: (id) => {
    const { artboardDimensions, getHistoryUpdate } = get();
    set((state) => ({
      ...getHistoryUpdate(),
      elements: state.elements.map((el) =>
        el.id === id
          ? { ...el, x: (artboardDimensions.width - el.width) / 2 }
          : el
      ),
    }));
  },
  alignToArtboardCenterVertical: (id) => {
    const { artboardDimensions, getHistoryUpdate } = get();
    set((state) => ({
      ...getHistoryUpdate(),
      elements: state.elements.map((el) =>
        el.id === id
          ? { ...el, y: (artboardDimensions.height - el.height) / 2 }
          : el
      ),
    }));
  },
  // Group management
  updateElementParenting: () => {
    // This function will be implemented later to automatically manage element parenting
    // For now, it's a placeholder to satisfy the interface
  },
  // New functions for hierarchical element management
  reorderElementsHierarchical: (
    draggedElementId: string,
    targetElementId: string,
    position: "before" | "after" | "inside"
  ) =>
    set((state) => {
      const { getHistoryUpdate } = get();

      const draggedElement = state.elements.find(
        (el) => el.id === draggedElementId
      );
      const targetElement = state.elements.find(
        (el) => el.id === targetElementId
      );

      if (!draggedElement || !targetElement) return state;

      let updatedElements = [...state.elements];

      // Only remove from parent if we are actually moving to a new position
      let willMove = false;
      if (
        position === "inside" &&
        targetElement.type === "group" &&
        draggedElement.parentId !== targetElementId
      ) {
        willMove = true;
      } else if (targetElement.id !== draggedElement.id) {
        willMove = true;
      }
      if (willMove && draggedElement.parentId) {
        updatedElements = updatedElements.map((el) => {
          if (el.id === draggedElement.parentId && el.children) {
            return {
              ...el,
              children: el.children.filter(
                (childId) => childId !== draggedElementId
              ),
            };
          }
          return el;
        });
      }

      // Move element to the same level as target (before or after)
      const targetParentId = targetElement.parentId;

      updatedElements = updatedElements.map((el) => {
        if (el.id === draggedElementId) {
          return { ...el, parentId: targetParentId };
        }
        return el;
      });

      // If target has a parent, update the parent's children array
      if (targetParentId) {
        updatedElements = updatedElements.map((el) => {
          if (el.id === targetParentId && el.children) {
            const targetIndex = el.children.indexOf(targetElementId);
            const newChildren = [...el.children];

            if (position === "before") {
              newChildren.splice(targetIndex, 0, draggedElementId);
            } else {
              newChildren.splice(targetIndex + 1, 0, draggedElementId);
            }

            return { ...el, children: newChildren };
          }
          return el;
        });
      } else {
        // Handle top-level reordering
        // Remove the dragged element from its current position
        updatedElements = updatedElements.filter(
          (el) => el.id !== draggedElementId
        );

        // Find the target element's index in the filtered array
        const targetIndex = updatedElements.findIndex(
          (el) => el.id === targetElementId
        );

        if (targetIndex !== -1) {
          // Insert the dragged element at the appropriate position
          if (position === "before") {
            updatedElements.splice(targetIndex, 0, {
              ...draggedElement,
              parentId: undefined,
            });
          } else {
            updatedElements.splice(targetIndex + 1, 0, {
              ...draggedElement,
              parentId: undefined,
            });
          }
        }
      }

      return {
        ...getHistoryUpdate(),
        elements: updatedElements,
      };
    }),
  moveElementToGroup: (elementId: string, groupId: string | null) =>
    set((state) => {
      const { getHistoryUpdate } = get();

      let updatedElements = [...state.elements];
      const element = updatedElements.find((el) => el.id === elementId);

      if (!element) return state;

      // Remove from current parent
      if (element.parentId) {
        updatedElements = updatedElements.map((el) => {
          if (el.id === element.parentId && el.children) {
            return {
              ...el,
              children: el.children.filter((childId) => childId !== elementId),
            };
          }
          return el;
        });
      }

      // Add to new parent
      updatedElements = updatedElements.map((el) => {
        if (el.id === elementId) {
          return { ...el, parentId: groupId || undefined };
        }
        if (groupId && el.id === groupId && el.type === "group") {
          return {
            ...el,
            children: [...(el.children || []), elementId],
          };
        }
        return el;
      });

      return {
        ...getHistoryUpdate(),
        elements: updatedElements,
      };
    }),
  // Isolation mode
  enterIsolationMode: (groupId: string) => {
    set({ isolatedGroupId: groupId });
  },
  exitIsolationMode: () => {
    set({ isolatedGroupId: null });
  },
  isInIsolationMode: () => {
    const { isolatedGroupId } = get();
    return isolatedGroupId !== null;
  },
  getIsolatedElements: () => {
    const { elements } = get();
    return elements.filter((el) => el.parentId === get().isolatedGroupId);
  },
  // Add function to update project name (cloud-aware)
  updateProjectNameCloudAware: async (newName: string) => {
    const state = get();
    if (!state.projectId) {
      return { success: false };
    }

    // Check if it's a cloud project (Convex IDs don't start with "project-")
    const isCloud = !state.projectId.startsWith("project-");

    if (isCloud) {
      // For cloud projects, we need to use the mutation directly
      // This will be handled by the ProjectHeader component using the useProjectUpdate hook
      return { success: false };
    } else {
      // Use local storage
      try {
        const updatedProject = updateProjectName(state.projectId, newName);
        if (updatedProject) {
          set({
            projectName: updatedProject.name,
            projectSlug: updatedProject.slug,
          });
          return { success: true, updatedProject };
        }
        return { success: false };
      } catch (error) {
        console.error("Error updating local project name:", error);
        return { success: false };
      }
    }
  },
  // Helper to determine if current project is cloud-based
  isCloudProject: () => {
    const state = get();
    return state.projectId !== null && !state.projectId.startsWith("project-");
  },
}));
