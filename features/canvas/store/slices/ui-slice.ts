import { StateCreator } from "zustand";

export interface UISlice {
  // State
  rightSidebarDocked: boolean;
  panSensitivity: number;
  zoomSensitivity: number;

  // Actions
  toggleRightSidebarDock: () => void;
  setPanSensitivity: (sensitivity: number) => void;
  setZoomSensitivity: (sensitivity: number) => void;
}

export const createUISlice: StateCreator<UISlice, [], [], UISlice> = (
  set,
  get
) => ({
  // Initial state
  rightSidebarDocked: false,
  panSensitivity: 1.6,
  zoomSensitivity: 0.6,

  // Actions
  toggleRightSidebarDock: () => {
    set((state) => ({ rightSidebarDocked: !state.rightSidebarDocked }));
  },

  setPanSensitivity: (sensitivity) => {
    set({ panSensitivity: Math.round(sensitivity * 10) / 10 });
  },

  setZoomSensitivity: (sensitivity) => {
    set({ zoomSensitivity: Math.round(sensitivity * 10) / 10 });
  },
});
