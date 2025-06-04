import { StateCreator } from "zustand";
import { CanvasElementData } from "../../types";
import {
  validateProjectState as validateProjectStateService,
  type ProjectValidationState,
} from "../../services/validation";

export interface ProjectSlice {
  // State
  projectName: string;
  projectId: string | null;

  // Actions
  setProjectName: (name: string) => void;
  setProjectData: (
    projectId: string,
    projectName: string,
    projectData: {
      elements: CanvasElementData[];
      artboardDimensions: { width: number; height: number };
    }
  ) => void;
  validateProjectState: () => { isValid: boolean; issues: string[] };
  clearCurrentProject: () => void;
  isCloudProject: () => boolean;
}

export const createProjectSlice: StateCreator<
  ProjectSlice & {
    elements: CanvasElementData[];
    artboardDimensions: { width: number; height: number };
    selectedElements: string[];
    past: CanvasElementData[][];
    future: CanvasElementData[][];
    isolatedGroupId: string | null;
    isolationBreadcrumb: string[];
  },
  [],
  [],
  ProjectSlice
> = (set, get) => ({
  // Initial state
  projectName: "Untitled Project",
  projectId: null,

  // Actions
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

  isCloudProject: () => {
    const { projectId } = get();
    return projectId ? projectId.startsWith("cloud_") : false;
  },
});
