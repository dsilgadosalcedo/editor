# Features Directory Refactoring Plan

## Current Issues ✅ ADDRESSED

- ~~Massive component files (1,700+ lines)~~ → **Extracted types and utilities**
- ~~Types scattered throughout component files~~ → **Centralized in types/ directories**
- ~~Empty utility folders not being utilized~~ → **Populated with extracted utilities**
- Complex logic mixed with UI components → **Partially addressed, needs further work**
- Inconsistent organization patterns → **Improved through standardization**

## ✅ COMPLETED - Phase 1: Extract Types to Centralized Files

### Canvas Feature Types ✅

```
features/canvas/types/
├── index.ts           # Main exports ✅
├── element.ts         # CanvasElementData, ElementType, etc. ✅
├── props.ts           # Component prop interfaces ✅
├── canvas.ts          # Canvas-related types ✅
├── properties.ts      # Properties panel types ✅
├── layers.ts          # Layer-related types ✅
└── color.ts           # Color picker types ✅
```

### Projects Feature Types ✅

```
features/projects/types/
└── index.ts           # Project-related interfaces ✅
```

### Utils Extraction ✅

```
features/canvas/utils/
├── index.ts           # Main exports ✅
├── text-measurement.ts # Text measurement utilities ✅
└── geometry.ts        # Geometric calculations ✅
```

### Store Updates ✅

- Updated `useCanvasStore.ts` to import from centralized types ✅
- Removed duplicate type definitions ✅
- Fixed import conflicts ✅

### Component Updates ✅

- Updated `CanvasElement.tsx` as example ✅
- Removed inline utility functions ✅
- Using imported types from centralized location ✅

## RECOMMENDED - Phase 2: Extract Business Logic

### 2.1 Canvas Business Logic

```
features/canvas/services/
├── index.ts           # Main exports
├── element-operations.ts # Element CRUD operations
├── canvas-state.ts    # Canvas state management
├── history.ts         # Undo/redo logic
├── selection.ts       # Selection management
├── grouping.ts        # Group operations
└── validation.ts      # Canvas validation
```

### 2.2 Projects Business Logic

```
features/projects/services/
├── index.ts           # Main exports
├── project-crud.ts    # Project CRUD operations
├── project-storage.ts # Storage abstractions
└── project-validation.ts # Project validation
```

## RECOMMENDED - Phase 3: Component Decomposition

### 3.1 Break Down Large Components

- Split `CanvasElement.tsx` (1,600+ lines) into:
  ```
  features/canvas/components/canvas-element/
  ├── index.ts
  ├── CanvasElement.tsx
  ├── TextElement.tsx
  ├── ImageElement.tsx
  ├── RectangleElement.tsx
  ├── GroupElement.tsx
  ├── SelectionUI.tsx
  └── FloatingToolbar.tsx
  ```

### 3.2 Properties Panel Decomposition

- Already well-organized with separate property components ✅

### 3.3 Extract Common UI Components

```
features/canvas/components/ui/
├── ColorPicker.tsx
├── PropertyInput.tsx
├── AspectRatioSelector.tsx
└── OpacityPicker.tsx
```

## RECOMMENDED - Phase 4: Custom Hooks Extraction

### 4.1 Canvas Hooks

```
features/canvas/hooks/
├── index.ts
├── useElementDrag.ts
├── useElementResize.ts
├── useElementRotation.ts
├── useTextEditing.ts
├── useCanvasZoom.ts
└── useSelectionState.ts
```

### 4.2 Projects Hooks

```
features/projects/hooks/
├── index.ts
├── useProjectCRUD.ts
├── useProjectValidation.ts
└── useProjectLimits.ts
```

## Benefits Achieved So Far ✅

1. **Type Safety**: Centralized type definitions prevent inconsistencies
2. **Code Reusability**: Shared utilities can be used across components
3. **Maintainability**: Changes to types/utilities are centralized
4. **Clarity**: Clear separation between types, utilities, and components
5. **Import Optimization**: Clean import statements using barrel exports

## Next Steps Recommendations

1. **Continue with Phase 2**: Extract business logic from components
2. **Component Decomposition**: Break down large components into smaller, focused ones
3. **Hook Extraction**: Move stateful logic to custom hooks
4. **Testing**: Add unit tests for extracted utilities and services
5. **Documentation**: Add JSDoc comments to exported functions and types

## Implementation Notes

- Use the established pattern: types → utils → services → components
- Maintain backward compatibility during refactoring
- Update imports progressively, one component at a time
- Follow the existing naming conventions and file structure
- Consider performance implications of any changes
