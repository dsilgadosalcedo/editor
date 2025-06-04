// Element operations
export * from "./element-operations";

// Selection management
export * from "./selection";

// History management
export * from "./history";

// Grouping operations
export * from "./grouping";

// Canvas state management
export * from "./canvas-state";

// Color utilities
export * from "./color-utils";

// Color picker interactions
export * from "./color-picker-interactions";

// UI interactions
export * from "./ui-interactions";

// Element interactions (NEW)
export * from "./element-interactions";

// Text operations (NEW)
export * from "./text-operations";

// Element rendering (NEW)
export * from "./element-rendering";

// Isolation operations (NEW)
export * from "./isolation-operations";

// Alignment operations (NEW - Phase 2 completion)
export * from "./alignment-operations";

// File operations (NEW - Phase 2 completion)
export * from "./file-operations";

// Project operations (NEW - Phase 2 completion)
export * from "./project-operations";

// Validation services (resolve naming conflicts)
export {
  validateElement as validateElementData,
  validateElements,
  validateProjectState,
  validateArtboardDimensions,
  validateProjectData,
  validateOperation,
  validateElementBounds,
  type ValidationResult,
  type ProjectValidationState,
} from "./validation";
