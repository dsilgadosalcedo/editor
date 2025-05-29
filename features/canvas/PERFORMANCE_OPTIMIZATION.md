# Canvas Performance Optimization Guide

## Overview

This document outlines the performance optimizations implemented in the canvas application to prevent unnecessary re-renders and improve overall performance. The main issue was that components were using massive destructuring from the Zustand store, causing re-renders whenever ANY store property changed.

## Problem Identified

### Before Optimization

Components were using the anti-pattern of destructuring many properties from the Zustand store:

```tsx
// ❌ ANTI-PATTERN - Causes re-renders on ANY store change
const {
  selectedElements,
  getSelectedElementData,
  hasMultipleSelection,
  updateName,
  updateTextContent,
  updateFillColor,
  // ... 20+ more properties
} = useCanvasStore();
```

This caused severe performance issues where moving or interacting with any element would trigger re-renders throughout the entire application, as observed in React DevTools.

### Additional Issue: Infinite Loop Error

We also encountered infinite loop errors caused by:

- Selectors calling functions that return new objects on every call
- Function references in `useMemo` dependencies causing constant re-computation
- Unstable store wrappers creating new objects on every render

## Solution Implemented

### 1. Store Slicing Architecture

Created modular store slices for better organization and performance:

- `canvas-slice.ts` - Elements and artboard state (484 lines)
- `selection-slice.ts` - Selection management (116 lines)
- `ui-slice.ts` - UI state like sidebar docking (37 lines)
- `project-slice.ts` - Project metadata (99 lines)
- `history-slice.ts` - Undo/redo functionality (99 lines)
- `index.ts` - Exports all slices (6 lines)

### 2. Optimized Selectors

Created `selectors.ts` (221 lines) with performance-optimized hooks:

#### Individual Selectors

```tsx
// ✅ OPTIMIZED - Only re-renders when specific data changes
const elements = useElements();
const selectedElements = useSelectedElements();
const artboardDimensions = useArtboardDimensions();
```

#### Fixed Infinite Loop Issues

```tsx
// ❌ PROBLEMATIC - Function calls return new objects every time
export const useSelectedElementData = () =>
  useCanvasStore((state) => state.getSelectedElementData());

// ✅ FIXED - Direct state access with inline computation
export const useSelectedElementData = () =>
  useCanvasStore((state) => {
    if (state.selectedElements.length === 1) {
      return state.elements.find((el) => el.id === state.selectedElements[0]);
    }
    return undefined;
  });
```

#### Grouped Actions with useShallow

```tsx
// ✅ OPTIMIZED - Groups related actions, prevents object recreation
const elementActions = useCanvasStore(
  useShallow((state) => ({
    updateName: state.updateName,
    updateTextContent: state.updateTextContent,
    updateFillColor: state.updateFillColor,
  }))
);
```

#### Combined State Selectors

```tsx
// ✅ OPTIMIZED - Returns combined state with shallow comparison
const historyState = useHistoryState(); // {past, future, canUndo, canRedo}
```

### 3. Infinite Loop Fixes

#### Fixed Problematic Function Dependencies

```tsx
// ❌ PROBLEMATIC - Function reference in dependencies causes infinite re-renders
const visibleElements = useMemo(() => {
  // ... computation logic
}, [elements, selectedElements, isolationActions.getElementDescendants]);

// ✅ FIXED - Removed function reference from dependencies
const visibleElements = useMemo(() => {
  // Function called inside useMemo, not in dependencies
  const isolatedDescendants =
    isolationActions.getElementDescendants(isolatedGroupId);
  // ... computation logic
}, [elements, selectedElements, isolatedGroupId]);
```

#### Stable Store Wrapper

```tsx
// ✅ FIXED - Created stable wrapper with useMemo
const stableStoreWrapper = React.useMemo(
  () => ({
    getState: () => ({ elements }),
    enterIsolationMode: isolationActions.enterIsolationMode,
    exitIsolationMode: isolationActions.exitIsolationMode,
  }),
  [
    elements,
    isolationActions.enterIsolationMode,
    isolationActions.exitIsolationMode,
  ]
);
```

### 3. Components Optimized

All major components have been optimized with the new patterns:

#### Core Canvas Components

- ✅ **Artboard.tsx** - Isolation actions grouped with useShallow
- ✅ **CanvasViewport.tsx** - Element actions grouped, individual selectors used
- ✅ **CanvasElement.tsx** - Isolation context optimized
- ✅ **AutoSave.tsx** - Individual selectors for project data
- ✅ **ElementFloatingToolbar.tsx** - Element actions grouped with useShallow

#### Layer Management

- ✅ **LayersPanel.tsx** - Already optimized with selectors
- ✅ **LayerItem.tsx** - Layer actions grouped with useShallow
- ✅ **LayersDragLayer.tsx** - Individual elements selector

#### Navigation & Properties

- ✅ **ProjectHeader.tsx** - Project actions grouped, individual selectors
- ✅ **PropertiesPanel.tsx** - Already optimized with grouped actions
- ✅ **ArtboardProperties.tsx** - Artboard actions grouped with useShallow
- ✅ **ArtboardControlPoints.tsx** - Individual aspect ratio selector

#### Toolbars & UI

- ✅ **ToolSidebar.tsx** - Already optimized with selectors
- ✅ **CanvasToolbar.tsx** - Already optimized with grouped actions

#### Hooks & External Components

- ✅ **useAuthStateHandler.ts** - Individual selector for clearCurrentProject
- ✅ **useProjects.ts** - Individual selectors for project state
- ✅ **useHybridProjects.ts** - Individual selectors for canvas state

## Performance Benefits

### Before Optimization

- Components re-rendered on ANY store change
- React DevTools showed everything highlighting when interacting with elements
- Poor performance during element manipulation
- Unnecessary object creation and garbage collection

### After Optimization

- Components only re-render when their specific data changes
- React DevTools shows precise re-render patterns
- Smooth performance during element interactions
- Reduced memory usage and garbage collection
- Clear separation of concerns

## Usage Guidelines

### ✅ Do's

1. **Use Individual Selectors for State**

```tsx
const elements = useElements();
const selectedElements = useSelectedElements();
```

2. **Group Related Actions with useShallow**

```tsx
const elementActions = useCanvasStore(
  useShallow((state) => ({
    updateName: state.updateName,
    updateColor: state.updateColor,
  }))
);
```

3. **Use Combined State Selectors**

```tsx
const historyState = useHistoryState();
const { canUndo, canRedo } = historyState;
```

### ❌ Don'ts

1. **Never Use Massive Destructuring**

```tsx
// ❌ NEVER DO THIS
const { elements, selectedElements, updateName, updateColor, ... } = useCanvasStore();
```

2. **Don't Access Unrelated State**

```tsx
// ❌ BAD - Component doesn't need all this data
const { elements, projectName, panSensitivity } = useCanvasStore();
```

3. **Don't Create Objects in Selectors Without useShallow**

```tsx
// ❌ BAD - Creates new object on every render
const { updateName, updateColor, updateSize } = useCanvasStore();

// ✅ GOOD - Uses useShallow to prevent object recreation
const actions = useCanvasStore(
  useShallow((state) => ({
    updateName: state.updateName,
    updateColor: state.updateColor,
  }))
);
```

4. **Don't Call Functions in Selectors**

```tsx
// ❌ BAD - Function calls return new objects causing infinite loops
const selectedData = useCanvasStore((state) => state.getSelectedElementData());

// ✅ GOOD - Direct state access with inline computation
const selectedData = useCanvasStore((state) => {
  if (state.selectedElements.length === 1) {
    return state.elements.find((el) => el.id === state.selectedElements[0]);
  }
  return undefined;
});
```

5. **Don't Include Function References in useMemo Dependencies**

```tsx
// ❌ BAD - Function reference changes on every render
const memoizedValue = useMemo(() => {
  return computeValue(someFunction);
}, [data, someFunction]); // someFunction reference changes

// ✅ GOOD - Call function inside useMemo, don't include in deps
const memoizedValue = useMemo(() => {
  return computeValue(someFunction);
}, [data]); // Only include stable dependencies
```

6. **Don't Create Unstable Store Wrappers**

```tsx
// ❌ BAD - Creates new object on every render
const groupActions = useCanvasStore(
  useShallow((state) => ({
    getState: () => state, // This function reference changes every time
  }))
);

// ✅ GOOD - Use stable wrapper with useMemo
const stableWrapper = useMemo(
  () => ({
    getState: () => ({ elements }),
    action: someAction,
  }),
  [elements, someAction]
);
```

## Migration Guide for New Components

When creating new components that need canvas store access:

1. **Identify what data you actually need**
2. **Use individual selectors for state**
3. **Group related actions with useShallow**
4. **Test with React DevTools to verify no unnecessary re-renders**

Example template:

```tsx
import { useCanvasStore } from "../store/useCanvasStore";
import { useElements, useSelectedElements } from "../store/selectors";
import { useShallow } from "zustand/react/shallow";

export const MyComponent = () => {
  // Individual selectors for state
  const elements = useElements();
  const selectedElements = useSelectedElements();

  // Grouped actions with useShallow
  const elementActions = useCanvasStore(
    useShallow((state) => ({
      updateName: state.updateName,
      deleteElement: state.deleteElement,
    }))
  );

  // Component logic...
};
```

## Performance Testing

To verify optimizations are working:

1. **Enable React DevTools Profiler**
2. **Turn on "Highlight updates when components render"**
3. **Interact with canvas elements**
4. **Verify only relevant components re-render**

## Future Optimization Opportunities

1. **Virtualization** - Already implemented for large element lists
2. **Memoization** - Consider React.memo for expensive components
3. **Code Splitting** - Lazy load heavy features
4. **Web Workers** - For heavy computations
5. **Canvas Rendering** - Consider moving to Canvas API for better performance

## Conclusion

The performance optimization successfully eliminated the massive re-render issues by:

- Replacing destructuring anti-patterns with optimized selectors
- Using useShallow for grouped actions
- Creating individual selectors for specific state
- Maintaining clear separation of concerns

All components now follow the optimized patterns, resulting in precise re-renders and improved performance.
