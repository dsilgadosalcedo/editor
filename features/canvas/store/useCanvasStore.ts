import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { CanvasStore } from "./types/store-types";
import { CanvasElementData, ElementType } from "../types";

// Import services
import {
  createElement,
  createImageElement,
  createImageElementImmediate,
  loadImageDimensions,
  CreateElementOptions,
  CreateImageElementOptions,
} from "../services/element-operations";
import {
  moveElement as moveElementService,
  moveSelectedElements as moveSelectedElementsService,
  resizeElement as resizeElementService,
  deleteElement as deleteElementService,
  updateElementProperty,
  toggleElementVisibility as toggleElementVisibilityService,
  resetCanvas as resetCanvasService,
} from "../services/canvas-state";
import {
  selectElement as selectElementService,
  selectMultipleElements as selectMultipleElementsService,
  clearSelection as clearSelectionService,
  getSelectedElementData as getSelectedElementDataService,
  getSelectedElementsData as getSelectedElementsDataService,
  hasMultipleSelection as hasMultipleSelectionService,
  type SelectionState as ServiceSelectionState,
} from "../services/selection";
import {
  addToHistory as addToHistoryService,
  getHistoryUpdate as getHistoryUpdateService,
  undo as undoService,
  redo as redoService,
} from "../services/history";
import {
  validateProjectState as validateProjectStateService,
  type ProjectValidationState,
} from "../services/validation";
import {
  getElementDescendants,
  getTopLevelElements,
  getElementChildren,
} from "../services/grouping";
import {
  exportCanvasToJSON,
  exportProjectToJSON,
  importCanvasFromFile,
} from "../services/file-operations";
import {
  createProjectWithLimitCheck,
  isProjectLimitReached,
} from "@/lib/project-storage";
import {
  alignElementToArtboardLeft,
  alignElementToArtboardRight,
  alignElementToArtboardTop,
  alignElementToArtboardBottom,
  alignElementToArtboardCenterHorizontal,
  alignElementToArtboardCenterVertical,
} from "../services/alignment-operations";
import {
  saveProjectToLocal,
  getProjectByIdFromLocal,
  type Project,
} from "@/lib/project-storage";

export const useCanvasStore = create<CanvasStore>()(
  devtools(
    immer((set, get) => ({
      // Canvas state
      elements: [],
      artboardDimensions: { width: 1024, height: 576 },
      artboardAspectRatio: 16 / 9,
      isCustomAspectRatio: false,

      // Selection state
      selectedElements: [],
      clipboard: null,

      // History state
      past: [],
      future: [],

      // Project state
      projectName: "Untitled Project",
      projectId: null,

      // UI state
      rightSidebarDocked: true,
      panSensitivity: 1.6,
      zoomSensitivity: 0.6,

      // Isolation state
      isolatedGroupId: null,
      isolationBreadcrumb: [],

      // Canvas actions
      setArtboardDimensions: (dims) => {
        set({ artboardDimensions: dims });
      },

      setArtboardAspectRatio: (ratio) => {
        set({ artboardAspectRatio: ratio });
      },

      setCustomAspectRatio: (isCustom) => {
        set({ isCustomAspectRatio: isCustom });
      },

      addElement: (type) => {
        const { artboardDimensions } = get();
        const options: CreateElementOptions = {
          artboardWidth: artboardDimensions.width,
          artboardHeight: artboardDimensions.height,
        };
        const newElement = createElement(type, options);

        set((state) => ({
          ...get().getHistoryUpdate(),
          elements: [
            ...state.elements.map((el: CanvasElementData) => ({
              ...el,
              selected: false,
            })),
            newElement,
          ],
          selectedElements: [newElement.id],
        }));
      },

      addElementAtPosition: (type, x, y) => {
        const { artboardDimensions } = get();
        const options: CreateElementOptions = {
          artboardWidth: artboardDimensions.width,
          artboardHeight: artboardDimensions.height,
          position: { x, y },
        };
        const newElement = createElement(type, options);

        set((state) => ({
          ...get().getHistoryUpdate(),
          elements: [
            ...state.elements.map((el: CanvasElementData) => ({
              ...el,
              selected: false,
            })),
            newElement,
          ],
          selectedElements: [newElement.id],
        }));
      },

      addImageElement: (src, x, y) => {
        const { artboardDimensions } = get();
        const options: CreateImageElementOptions = {
          src,
          artboardWidth: artboardDimensions.width,
          artboardHeight: artboardDimensions.height,
          position: x !== undefined && y !== undefined ? { x, y } : undefined,
        };

        // Create element immediately with loading state
        const newElement = createImageElementImmediate(options);

        set((state) => ({
          ...get().getHistoryUpdate(),
          elements: [
            ...state.elements.map((el: CanvasElementData) => ({
              ...el,
              selected: false,
            })),
            newElement,
          ],
          selectedElements: [newElement.id],
        }));

        // Load actual image dimensions in background
        loadImageDimensions(src)
          .then((dimensions) => {
            get().updateImageElement(newElement.id, {
              width: dimensions.width,
              height: dimensions.height,
              loading: false,
            });
          })
          .catch((error) => {
            console.warn("Failed to load image dimensions:", error);
            // Remove loading state even if failed
            get().updateImageElement(newElement.id, {
              loading: false,
            });
          });
      },

      deleteElement: (id) => {
        const state = get();
        const updatedElements = deleteElementService(
          state.elements,
          id,
          (elementId) => getElementDescendants(state.elements, elementId)
        );
        set({
          ...state.getHistoryUpdate(),
          elements: updatedElements,
          selectedElements: state.selectedElements.filter(
            (selectedId) => selectedId !== id
          ),
        });
      },

      moveElement: (id, dx, dy) => {
        const state = get();
        const updatedElements = moveElementService(
          state.elements,
          id,
          dx,
          dy,
          (elementId) => getElementDescendants(state.elements, elementId)
        );
        set({
          ...state.getHistoryUpdate(),
          elements: updatedElements,
        });
      },

      moveElementNoHistory: (id, dx, dy) => {
        const state = get();
        const updatedElements = moveElementService(
          state.elements,
          id,
          dx,
          dy,
          (elementId) => getElementDescendants(state.elements, elementId)
        );
        set({ elements: updatedElements });
      },

      moveSelectedElements: (dx, dy) => {
        const state = get();
        const updatedElements = moveSelectedElementsService(
          state.elements,
          state.selectedElements,
          dx,
          dy,
          (elementId) => getElementDescendants(state.elements, elementId)
        );
        set({
          ...state.getHistoryUpdate(),
          elements: updatedElements,
        });
      },

      moveSelectedElementsNoHistory: (dx, dy) => {
        const state = get();
        const updatedElements = moveSelectedElementsService(
          state.elements,
          state.selectedElements,
          dx,
          dy,
          (elementId) => getElementDescendants(state.elements, elementId)
        );
        set({ elements: updatedElements });
      },

      resizeElement: (id, width, height, preserveAspectRatio = false) => {
        const state = get();
        const updatedElements = resizeElementService(
          state.elements,
          id,
          width,
          height,
          preserveAspectRatio,
          (elementId) => getElementDescendants(state.elements, elementId)
        );
        set({
          ...state.getHistoryUpdate(),
          elements: updatedElements,
        });
      },

      resizeElementNoHistory: (
        id,
        width,
        height,
        preserveAspectRatio = false
      ) => {
        const state = get();
        const updatedElements = resizeElementService(
          state.elements,
          id,
          width,
          height,
          preserveAspectRatio,
          (elementId) => getElementDescendants(state.elements, elementId)
        );
        set({ elements: updatedElements });
      },

      resizeSelectedElements: (
        baseId,
        newWidth,
        newHeight,
        preserveAspectRatio = false
      ) => {
        const state = get();
        const baseElement = state.elements.find((el) => el.id === baseId);
        if (!baseElement || !state.selectedElements.includes(baseId)) {
          return;
        }

        let scaleX = newWidth / baseElement.width;
        let scaleY = newHeight / baseElement.height;

        if (preserveAspectRatio) {
          const scale = Math.min(scaleX, scaleY);
          scaleX = scale;
          scaleY = scale;
        }

        const updatedElements = state.elements.map((el) => {
          if (state.selectedElements.includes(el.id)) {
            return {
              ...el,
              width: el.width * scaleX,
              height: el.height * scaleY,
            };
          }
          return el;
        });

        set({
          ...state.getHistoryUpdate(),
          elements: updatedElements,
        });
      },

      resizeSelectedElementsNoHistory: (
        baseId,
        newWidth,
        newHeight,
        preserveAspectRatio = false
      ) => {
        const state = get();
        const baseElement = state.elements.find((el) => el.id === baseId);
        if (!baseElement || !state.selectedElements.includes(baseId)) {
          return;
        }

        let scaleX = newWidth / baseElement.width;
        let scaleY = newHeight / baseElement.height;

        if (preserveAspectRatio) {
          const scale = Math.min(scaleX, scaleY);
          scaleX = scale;
          scaleY = scale;
        }

        const updatedElements = state.elements.map((el) => {
          if (state.selectedElements.includes(el.id)) {
            return {
              ...el,
              width: el.width * scaleX,
              height: el.height * scaleY,
            };
          }
          return el;
        });

        set({ elements: updatedElements });
      },

      // Element property updates
      updateTextContent: (id, content) => {
        const state = get();
        const updatedElements = updateElementProperty(
          state.elements,
          id,
          "content",
          content
        );
        set({
          ...state.getHistoryUpdate(),
          elements: updatedElements,
        });
      },

      updateName: (id, name) => {
        const state = get();
        const updatedElements = updateElementProperty(
          state.elements,
          id,
          "name",
          name
        );
        set({
          ...state.getHistoryUpdate(),
          elements: updatedElements,
        });
      },

      updateFillColor: (id, color) => {
        const state = get();
        const updatedElements = updateElementProperty(
          state.elements,
          id,
          "color",
          color
        );
        set({
          ...state.getHistoryUpdate(),
          elements: updatedElements,
        });
      },

      updateCornerRadius: (id, cornerRadius) => {
        const state = get();
        const updatedElements = updateElementProperty(
          state.elements,
          id,
          "cornerRadius",
          cornerRadius
        );
        set({
          ...state.getHistoryUpdate(),
          elements: updatedElements,
        });
      },

      updateCornerRadiusNoHistory: (id, cornerRadius) => {
        const state = get();
        const updatedElements = updateElementProperty(
          state.elements,
          id,
          "cornerRadius",
          cornerRadius
        );
        set({ elements: updatedElements });
      },

      updateBorderWidth: (id, width) => {
        const state = get();
        const updatedElements = updateElementProperty(
          state.elements,
          id,
          "borderWidth",
          width
        );
        set({
          ...state.getHistoryUpdate(),
          elements: updatedElements,
        });
      },

      updateBorderColor: (id, color) => {
        const state = get();
        const updatedElements = updateElementProperty(
          state.elements,
          id,
          "borderColor",
          color
        );
        set({
          ...state.getHistoryUpdate(),
          elements: updatedElements,
        });
      },

      updateShadowBlur: (id, blur) => {
        const state = get();

        // Update shadow blur and automatically set shadow color if blur > 0
        const updatedElements = state.elements.map((el) => {
          if (el.id === id) {
            const updatedElement = { ...el, shadowBlur: blur };
            // If blur is being set to a value > 0 and no shadow color exists, set it to black
            if (blur > 0 && !el.shadowColor) {
              updatedElement.shadowColor = "#000000";
            }
            return updatedElement;
          }
          return el;
        });

        set({
          ...state.getHistoryUpdate(),
          elements: updatedElements,
        });
      },

      updateShadowColor: (id, color) => {
        const state = get();
        const updatedElements = updateElementProperty(
          state.elements,
          id,
          "shadowColor",
          color
        );
        set({
          ...state.getHistoryUpdate(),
          elements: updatedElements,
        });
      },

      updateRotation: (id, rotation) => {
        const state = get();
        const updatedElements = updateElementProperty(
          state.elements,
          id,
          "rotation",
          rotation
        );
        set({
          ...state.getHistoryUpdate(),
          elements: updatedElements,
        });
      },

      updateRotationNoHistory: (id, rotation) => {
        const state = get();
        const updatedElements = updateElementProperty(
          state.elements,
          id,
          "rotation",
          rotation
        );
        set({ elements: updatedElements });
      },

      // Text properties
      updateFontSize: (id, fontSize) => {
        const state = get();
        const updatedElements = updateElementProperty(
          state.elements,
          id,
          "fontSize",
          fontSize
        );
        set({
          ...state.getHistoryUpdate(),
          elements: updatedElements,
        });
      },

      updateFontWeight: (id, fontWeight) => {
        const state = get();
        const updatedElements = updateElementProperty(
          state.elements,
          id,
          "fontWeight",
          fontWeight
        );
        set({
          ...state.getHistoryUpdate(),
          elements: updatedElements,
        });
      },

      updateLetterSpacing: (id, letterSpacing) => {
        const state = get();
        const updatedElements = updateElementProperty(
          state.elements,
          id,
          "letterSpacing",
          letterSpacing
        );
        set({
          ...state.getHistoryUpdate(),
          elements: updatedElements,
        });
      },

      updateLineHeight: (id, lineHeight) => {
        const state = get();
        const updatedElements = updateElementProperty(
          state.elements,
          id,
          "lineHeight",
          lineHeight
        );
        set({
          ...state.getHistoryUpdate(),
          elements: updatedElements,
        });
      },

      updateHorizontalAlign: (id, align) => {
        const state = get();
        const updatedElements = updateElementProperty(
          state.elements,
          id,
          "horizontalAlign",
          align
        );
        set({
          ...state.getHistoryUpdate(),
          elements: updatedElements,
        });
      },

      updateVerticalAlign: (id, align) => {
        const state = get();
        const updatedElements = updateElementProperty(
          state.elements,
          id,
          "verticalAlign",
          align
        );
        set({
          ...state.getHistoryUpdate(),
          elements: updatedElements,
        });
      },

      updateTextResizing: (id, resizing) => {
        const state = get();
        const updatedElements = updateElementProperty(
          state.elements,
          id,
          "textResizing",
          resizing
        );
        set({
          ...state.getHistoryUpdate(),
          elements: updatedElements,
        });
      },

      // Image properties
      updateImageSrc: (id, src) => {
        const state = get();
        const updatedElements = updateElementProperty(
          state.elements,
          id,
          "src",
          src
        );
        set({
          ...state.getHistoryUpdate(),
          elements: updatedElements,
        });
      },

      updateImageElement: (id, updates) => {
        const state = get();
        const updatedElements = state.elements.map((el) =>
          el.id === id ? { ...el, ...updates } : el
        );
        set({
          elements: updatedElements,
        });
      },

      // Element state
      toggleElementVisibility: (id) => {
        const state = get();
        const updatedElements = toggleElementVisibilityService(
          state.elements,
          id
        );
        set({
          ...state.getHistoryUpdate(),
          elements: updatedElements,
        });
      },

      toggleAspectRatioLock: (id) => {
        const state = get();
        const element = state.elements.find((el) => el.id === id);
        if (element) {
          const updatedElements = updateElementProperty(
            state.elements,
            id,
            "lockAspectRatio",
            !element.lockAspectRatio
          );
          set({
            ...state.getHistoryUpdate(),
            elements: updatedElements,
          });
        }
      },

      // Canvas operations
      resetCanvas: () => {
        const state = get();
        const result = resetCanvasService();
        set({
          ...state.getHistoryUpdate(),
          elements: result.elements,
          selectedElements: result.selectedElements,
        });
      },

      reorderElements: (oldIndex, newIndex) => {
        const state = get();
        const elements = [...state.elements];
        const [removed] = elements.splice(oldIndex, 1);
        elements.splice(newIndex, 0, removed);
        set({
          ...state.getHistoryUpdate(),
          elements,
        });
      },

      moveElementUp: (id) => {
        const state = get();
        const index = state.elements.findIndex((el) => el.id === id);
        if (index < state.elements.length - 1) {
          get().reorderElements(index, index + 1);
        }
      },

      moveElementDown: (id) => {
        const state = get();
        const index = state.elements.findIndex((el) => el.id === id);
        if (index > 0) {
          get().reorderElements(index, index - 1);
        }
      },

      // Selection actions
      selectElement: (id, addToSelection = false) => {
        const state = get();
        const selectionState: ServiceSelectionState = {
          selectedElements: state.selectedElements,
          elements: state.elements,
        };

        const result = selectElementService(selectionState, id, addToSelection);

        set({
          elements: result.updatedElements,
          selectedElements: result.selectedElements,
        });
      },

      selectMultipleElements: (ids) => {
        const state = get();
        const selectionState: ServiceSelectionState = {
          selectedElements: state.selectedElements,
          elements: state.elements,
        };

        const result = selectMultipleElementsService(selectionState, ids);

        set({
          elements: result.updatedElements,
          selectedElements: result.selectedElements,
        });
      },

      clearSelection: () => {
        const state = get();
        const selectionState: ServiceSelectionState = {
          selectedElements: state.selectedElements,
          elements: state.elements,
        };

        const result = clearSelectionService(selectionState);

        set({
          elements: result.updatedElements,
          selectedElements: result.selectedElements,
        });
      },

      getSelectedElementData: () => {
        const state = get();
        const selectionState: ServiceSelectionState = {
          selectedElements: state.selectedElements,
          elements: state.elements,
        };

        return getSelectedElementDataService(selectionState);
      },

      getSelectedElementsData: () => {
        const state = get();
        const selectionState: ServiceSelectionState = {
          selectedElements: state.selectedElements,
          elements: state.elements,
        };

        return getSelectedElementsDataService(selectionState);
      },

      hasMultipleSelection: () => {
        const state = get();
        const selectionState: ServiceSelectionState = {
          selectedElements: state.selectedElements,
          elements: state.elements,
        };

        return hasMultipleSelectionService(selectionState);
      },

      copySelection: () => {
        const state = get();

        // Get all selected elements and their descendants
        const elementsToCopy: string[] = [];

        state.selectedElements.forEach((selectedId) => {
          elementsToCopy.push(selectedId);
          // If it's a group, also include all its descendants
          const element = state.elements.find((el) => el.id === selectedId);
          if (element?.type === "group") {
            elementsToCopy.push(
              ...getElementDescendants(state.elements, selectedId)
            );
          }
        });

        // Remove duplicates and get the actual elements
        const uniqueElementIds = [...new Set(elementsToCopy)];
        const selectedElements = state.elements.filter((el) =>
          uniqueElementIds.includes(el.id)
        );

        // Update internal clipboard
        const clipboardElements =
          selectedElements.length > 0
            ? selectedElements.map((el) => ({ ...el }))
            : null;

        set({ clipboard: clipboardElements });

        // Also copy to system clipboard for Figma compatibility
        if (selectedElements.length > 0) {
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
            });
        }
      },

      pasteClipboard: () => {
        const state = get();

        if (!state.clipboard || state.clipboard.length === 0) return;

        const newElements: any[] = [];
        const newElementIds: string[] = [];
        const oldToNewIdMapping: { [oldId: string]: string } = {};

        // First pass: Create all elements with new IDs
        state.clipboard.forEach((clipboardElement, index) => {
          const newId = `${clipboardElement.type}-${Date.now()}-${index}`;
          oldToNewIdMapping[clipboardElement.id] = newId;

          const newElement = {
            ...clipboardElement,
            id: newId,
            x: clipboardElement.x + 20,
            y: clipboardElement.y + 20,
            selected: true,
            rotation: clipboardElement.rotation || 0,
          };

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

          // Update children if this is a group
          if (element.children && Array.isArray(element.children)) {
            updatedElement.children = element.children
              .map((childId: string) => oldToNewIdMapping[childId])
              .filter(Boolean);
          }

          return updatedElement;
        });

        // Add pasted elements to canvas
        const updatedElements = [
          ...state.elements.map((el) => ({ ...el, selected: false })),
          ...finalElements,
        ];

        set({
          ...state.getHistoryUpdate(),
          elements: updatedElements,
          selectedElements: newElementIds,
        });
      },

      // History actions
      addToHistory: () => {
        const state = get();
        const historyResult = addToHistoryService({
          elements: state.elements,
          past: state.past,
          future: state.future,
        });

        set({
          past: historyResult.past,
          future: historyResult.future,
        });
      },

      getHistoryUpdate: () => {
        const state = get();
        return getHistoryUpdateService({
          elements: state.elements,
          past: state.past,
          future: state.future,
        });
      },

      undo: () => {
        const state = get();
        const historyResult = undoService(
          {
            elements: state.elements,
            past: state.past,
            future: state.future,
          },
          state.selectedElements
        );

        set({
          elements: historyResult.elements,
          past: historyResult.past,
          future: historyResult.future,
        });
      },

      redo: () => {
        const state = get();
        const historyResult = redoService(
          {
            elements: state.elements,
            past: state.past,
            future: state.future,
          },
          state.selectedElements
        );

        set({
          elements: historyResult.elements,
          past: historyResult.past,
          future: historyResult.future,
        });
      },

      // Project actions
      setProjectName: (name) => {
        set({ projectName: name });
      },

      setProjectData: (projectId, projectName, projectData) => {
        set({
          projectId,
          projectName,
          elements: projectData.elements,
          artboardDimensions: projectData.artboardDimensions,
          past: [],
          future: [],
          isolatedGroupId: null,
          isolationBreadcrumb: [],
        });
      },

      setProjectDataWithArtboard: (
        projectId,
        projectName,
        projectData,
        artboardSettings
      ) => {
        set({
          projectId,
          projectName,
          elements: projectData.elements,
          artboardDimensions: projectData.artboardDimensions,
          artboardAspectRatio: artboardSettings?.artboardAspectRatio ?? null,
          isCustomAspectRatio: artboardSettings?.isCustomAspectRatio ?? false,
          panSensitivity: artboardSettings?.panSensitivity ?? 1.6,
          zoomSensitivity: artboardSettings?.zoomSensitivity ?? 0.6,
          past: [],
          future: [],
          isolatedGroupId: null,
          isolationBreadcrumb: [],
        });
      },

      validateProjectState: () => {
        const state = get();
        const validationState: ProjectValidationState = {
          projectId: state.projectId,
          projectName: state.projectName,
          elements: state.elements,
        };

        const result = validateProjectStateService(validationState);

        return {
          isValid: result.isValid,
          issues: result.issues,
        };
      },

      clearCurrentProject: () => {
        set({
          elements: [],
          selectedElements: [],
          projectName: "Untitled Project",
          projectId: null,
          past: [],
          future: [],
          artboardDimensions: { width: 1024, height: 576 },
          isolatedGroupId: null,
          isolationBreadcrumb: [],
        });
      },

      loadProjectById: (id: string) => {
        const project = getProjectByIdFromLocal(id);
        if (project) {
          set({
            projectId: project.id,
            projectName: project.name,
            elements: project.data.elements,
            artboardDimensions: project.data.artboardDimensions,
            past: [],
            future: [],
            isolatedGroupId: null,
            isolationBreadcrumb: [],
          });
          return true;
        }
        return false;
      },

      reloadCurrentProject: () => {
        const state = get();
        if (state.projectId) {
          return get().loadProjectById(state.projectId);
        }
        return false;
      },

      loadCloudProject: (project: Project) => {
        set({
          projectId: project.id,
          projectName: project.name,
          elements: project.data.elements,
          artboardDimensions: project.data.artboardDimensions,
          past: [],
          future: [],
          isolatedGroupId: null,
          isolationBreadcrumb: [],
        });

        // Save a copy to local storage after loading from cloud
        saveProjectToLocal(
          {
            id: project.id,
            name: project.name,
            data: project.data,
            createdAt: project.createdAt,
            updatedAt: project.updatedAt,
          },
          true
        );
      },

      isCloudProject: () => {
        const state = get();
        return (
          state.projectId !== null &&
          !state.projectId.startsWith("project-ulid-")
        );
      },

      // UI actions
      toggleRightSidebarDock: () => {
        set((state) => ({ rightSidebarDocked: !state.rightSidebarDocked }));
      },

      setPanSensitivity: (sensitivity) => {
        set({ panSensitivity: Math.round(sensitivity * 10) / 10 });
      },

      setZoomSensitivity: (sensitivity) => {
        set({ zoomSensitivity: Math.round(sensitivity * 10) / 10 });
      },

      // Group helper functions
      getElementDescendants: (elementId: string) => {
        const state = get();
        return getElementDescendants(state.elements, elementId);
      },

      getTopLevelElements: () => {
        const state = get();
        return getTopLevelElements(state.elements);
      },

      getElementChildren: (elementId: string) => {
        const state = get();
        return getElementChildren(state.elements, elementId);
      },

      // Grouping operations
      groupElements: () => {
        const state = get();

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
        const groupElement = {
          id: groupId,
          type: "group" as const,
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
          ...state.getHistoryUpdate(),
          elements: [...updatedElements, groupElement],
          selectedElements: [groupId],
        });
      },

      ungroupElements: () => {
        const state = get();

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
          ...state.getHistoryUpdate(),
          elements: updatedElements,
          selectedElements: childrenIds,
        });
      },

      moveElementToGroup: (elementId: string, groupId: string | null) => {
        const state = get();

        let updatedElements = [...state.elements];
        const element = updatedElements.find((el) => el.id === elementId);

        if (!element) return;

        // Remove from current parent
        if (element.parentId) {
          updatedElements = updatedElements.map((el) => {
            if (el.id === element.parentId && el.children) {
              return {
                ...el,
                children: el.children.filter(
                  (childId) => childId !== elementId
                ),
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

        set({
          ...state.getHistoryUpdate(),
          elements: updatedElements,
        });
      },

      reorderElementsHierarchical: (
        draggedElementId: string,
        targetElementId: string,
        position: "before" | "after" | "inside"
      ) => {
        // Placeholder implementation
        console.log("reorderElementsHierarchical not implemented yet");
      },

      updateElementParenting: () => {
        // Placeholder for automatic element parenting logic
      },

      // Isolation mode
      enterIsolationMode: (groupId: string, elementToSelect?: string) => {
        set({
          isolatedGroupId: groupId,
          selectedElements: elementToSelect ? [elementToSelect] : [],
          elements: get().elements.map((el) => ({
            ...el,
            selected: elementToSelect ? el.id === elementToSelect : false,
          })),
        });
      },

      exitIsolationMode: () => {
        set({
          isolatedGroupId: null,
          selectedElements: [],
          elements: get().elements.map((el) => ({ ...el, selected: false })),
        });
      },

      isInIsolationMode: () => {
        const state = get();
        return state.isolatedGroupId !== null;
      },

      getIsolatedElements: () => {
        const state = get();
        return state.elements.filter(
          (el) => el.parentId === state.isolatedGroupId
        );
      },

      // Artboard alignment
      alignToArtboardLeft: (id: string) => {
        const state = get();
        const updatedElements = alignElementToArtboardLeft(
          state.elements,
          id,
          state.artboardDimensions
        );
        set({
          ...state.getHistoryUpdate(),
          elements: updatedElements,
        });
      },

      alignToArtboardRight: (id: string) => {
        const state = get();
        const updatedElements = alignElementToArtboardRight(
          state.elements,
          id,
          state.artboardDimensions
        );
        set({
          ...state.getHistoryUpdate(),
          elements: updatedElements,
        });
      },

      alignToArtboardTop: (id: string) => {
        const state = get();
        const updatedElements = alignElementToArtboardTop(
          state.elements,
          id,
          state.artboardDimensions
        );
        set({
          ...state.getHistoryUpdate(),
          elements: updatedElements,
        });
      },

      alignToArtboardBottom: (id: string) => {
        const state = get();
        const updatedElements = alignElementToArtboardBottom(
          state.elements,
          id,
          state.artboardDimensions
        );
        set({
          ...state.getHistoryUpdate(),
          elements: updatedElements,
        });
      },

      alignToArtboardCenterHorizontal: (id: string) => {
        const state = get();
        const updatedElements = alignElementToArtboardCenterHorizontal(
          state.elements,
          id,
          state.artboardDimensions
        );
        set({
          ...state.getHistoryUpdate(),
          elements: updatedElements,
        });
      },

      alignToArtboardCenterVertical: (id: string) => {
        const state = get();
        const updatedElements = alignElementToArtboardCenterVertical(
          state.elements,
          id,
          state.artboardDimensions
        );
        set({
          ...state.getHistoryUpdate(),
          elements: updatedElements,
        });
      },

      // File operations
      exportCanvas: (filename?: string) => {
        const state = get();
        exportCanvasToJSON(
          state.elements,
          state.artboardDimensions,
          filename || state.projectName
        );
      },

      exportProject: (filename?: string) => {
        const state = get();
        exportProjectToJSON(
          state.elements,
          state.artboardDimensions,
          state.projectName,
          {
            artboardAspectRatio: state.artboardAspectRatio,
            isCustomAspectRatio: state.isCustomAspectRatio,
            panSensitivity: state.panSensitivity,
            zoomSensitivity: state.zoomSensitivity,
          },
          filename
        );
      },

      importElements: (elements: any[]) => {
        try {
          // Generate new IDs for imported elements to avoid conflicts
          const importedElements = elements.map((el, index) => {
            // Use a more reliable ID generation to prevent conflicts
            const timestamp = Date.now();
            const newId = `${el.type}-${timestamp}-${index}-${Math.random()
              .toString(36)
              .substr(2, 5)}`;
            return {
              ...el,
              id: newId,
              selected: true, // Auto-select imported elements
              rotation: el.rotation || 0, // Preserve original rotation
              // Ensure all required properties exist
              visible: el.visible !== false,
            };
          });

          const importedElementIds = importedElements.map((el) => el.id);

          // Use safer state update with proper history handling
          set((state) => {
            const historyUpdate = state.getHistoryUpdate();

            return {
              ...state,
              elements: [
                // Clear selection from existing elements
                ...state.elements.map((el) => ({ ...el, selected: false })),
                // Add imported elements
                ...importedElements,
              ],
              selectedElements: importedElementIds,
              past: historyUpdate.past,
              future: historyUpdate.future,
            };
          });

          return { success: true, importedCount: importedElements.length };
        } catch (error) {
          console.error("Error importing elements:", error);
          return { success: false };
        }
      },

      importCanvas: async (file: File) => {
        const state = get();

        const result = await importCanvasFromFile(file);

        if (result.success && result.elements) {
          // Use the new importElements method
          return get().importElements(result.elements);
        }

        return { success: false };
      },

      importProject: async (file: File) => {
        const result = await importCanvasFromFile(file);

        if (result.success && result.elements) {
          // This function will be called from the ToolSidebar with user choice handling
          // For now, just return the result - the UI component will handle the choice
          return {
            success: true,
            importedCount: result.elements.length,
            projectCreated: false, // Will be set by the UI component
          };
        }

        return { success: false };
      },

      // API functions (these would need to be implemented based on your backend)
      saveCanvas: async (title?: string) => {
        const state = get();
        try {
          const response = await fetch("/api/canvas/save", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              canvasData: {
                elements: state.elements,
                artboardDimensions: state.artboardDimensions,
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
    })),
    {
      name: "canvas-store",
    }
  )
);
