import { CanvasElementData, ElementType } from "./element";

export type ToolType = ElementType | "hand" | null;

export interface CanvasElementProps {
  element: CanvasElementData;
  onSelect: (addToSelection?: boolean) => void;
  onMove: (deltaX: number, deltaY: number) => void;
  onMoveNoHistory: (deltaX: number, deltaY: number) => void;
  onResize: (
    width: number,
    height: number,
    preserveAspectRatio?: boolean
  ) => void;
  onResizeNoHistory: (
    width: number,
    height: number,
    preserveAspectRatio?: boolean
  ) => void;
  onTextChange: (content: string) => void;
  onTextResizingChange?: (mode: "auto-width" | "auto-height" | "fixed") => void;
  isPanMode?: boolean;
  zoom: number;
  onUpdateCornerRadius?: (id: string, cornerRadius: number) => void;
  onUpdateCornerRadiusNoHistory?: (id: string, cornerRadius: number) => void;
  onUpdateFontSize?: (id: string, fontSize: number) => void;
  onUpdateLineHeight?: (id: string, lineHeight: number) => void;
  onUpdateRotation?: (id: string, rotation: number) => void;
  onUpdateRotationNoHistory?: (id: string, rotation: number) => void;
  isMultipleSelected?: boolean;
  onAddToHistory?: () => void;
}

export interface ArtboardProps {
  artboardDimensions: { width: number; height: number };
  zoom: number;
  transformOrigin: string;
  showGuides: boolean;
  elements: CanvasElementData[];
  selectedElements: string[];
  onSelectElement: (id: string | null, addToSelection?: boolean) => void;
  onMoveElement: (id: string, dx: number, dy: number) => void;
  onMoveElementNoHistory: (id: string, dx: number, dy: number) => void;
  onMoveSelectedElements: (dx: number, dy: number) => void;
  onMoveSelectedElementsNoHistory: (dx: number, dy: number) => void;
  onResizeElement: (
    id: string,
    w: number,
    h: number,
    preserveAspectRatio?: boolean
  ) => void;
  onResizeElementNoHistory: (
    id: string,
    w: number,
    h: number,
    preserveAspectRatio?: boolean
  ) => void;
  onResizeSelectedElements: (
    baseId: string,
    w: number,
    h: number,
    preserveAspectRatio?: boolean
  ) => void;
  onResizeSelectedElementsNoHistory: (
    baseId: string,
    w: number,
    h: number,
    preserveAspectRatio?: boolean
  ) => void;
  onTextChange: (id: string, content: string) => void;
  onTextResizingChange?: (
    id: string,
    mode: "auto-width" | "auto-height" | "fixed"
  ) => void;
  selectedTool: string | null;
  canvasPosition: { x: number; y: number };
  artboardRef: React.RefObject<HTMLDivElement | null>;
  canvasContainerRef: React.RefObject<HTMLDivElement | null>;
  onUpdateCornerRadius?: (id: string, cornerRadius: number) => void;
  onUpdateCornerRadiusNoHistory?: (id: string, cornerRadius: number) => void;
  onUpdateFontSize?: (id: string, fontSize: number) => void;
  onUpdateLineHeight?: (id: string, lineHeight: number) => void;
  onUpdateRotation?: (id: string, rotation: number) => void;
  onUpdateRotationNoHistory?: (id: string, rotation: number) => void;
  onResizeArtboard: (width: number, height: number) => void;
  onAddToHistory?: () => void;
}

export interface ArtboardControlPointsProps {
  artboardDimensions: { width: number; height: number };
  onResizeArtboard: (width: number, height: number) => void;
  zoom: number;
}

export interface CanvasViewportProps {
  canvasRef: React.RefObject<HTMLDivElement | null>;
  artboardRef: React.RefObject<HTMLDivElement | null>;
  canvasContainerRef: React.RefObject<HTMLDivElement | null>;
  showGuides: boolean;
  selectedTool: ToolType;
  zoom: number;
  transformOrigin: string;
  canvasPosition: { x: number; y: number };
  handleMouseDown: (e: React.MouseEvent<HTMLDivElement>) => void;
  handleMouseMove: (e: React.MouseEvent<HTMLDivElement>) => void;
  handleMouseUp: (e: React.MouseEvent<HTMLDivElement>) => void;
  handleContextMenu?: (e: React.MouseEvent<HTMLDivElement>) => void;
  handleTouchStart: (e: React.TouchEvent<HTMLDivElement>) => void;
  handleTouchMove: (e: React.TouchEvent<HTMLDivElement>) => void;
  handleTouchEnd: (e: React.TouchEvent<HTMLDivElement>) => void;
  selectionRectangle?: {
    left: number;
    top: number;
    width: number;
    height: number;
  } | null;
}

export interface CanvasToolbarProps {
  zoom: number;
  setZoom: (zoom: number | ((prev: number) => number)) => void;
  onZoomToSelection: () => void;
  onResetView: () => void;
}

export interface ToolSidebarProps {
  selectedTool: ToolType;
  onSelectTool: (tool: ToolType) => void;
  onToggleLayers: () => void;
  layersOpen: boolean;
}

export interface ElementFloatingToolbarProps {
  elementId: string;
  elementType: ElementType;
  elementColor: string;
  position: { x: number; y: number };
  zoom: number;
  isRotating?: boolean;
  elementName?: string;
  isMultipleSelection?: boolean;
}

export interface MultiSelectionUIProps {
  selectedElements: CanvasElementData[];
  zoom: number;
  onResizeStart: (dir: string, e: React.MouseEvent) => void;
  onResizeTouchStart: (dir: string, e: React.TouchEvent) => void;
  onResizeDoubleClick: (e: React.MouseEvent) => void;
}

export interface KeyboardShortcutsProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export interface DragDropOverlayProps {
  onFileDrop: (file: File) => void;
}

export interface CustomColorPickerProps {
  isOpen: boolean;
  onClose: () => void;
  color: string;
  onChange: (color: string) => void;
  position: { x: number; y: number };
  isTransitioning?: boolean;
  layerName?: string;
  propertyName?: string;
}

export interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  className?: string;
  "aria-label"?: string;
  layerName?: string;
  propertyName?: string;
}

export interface OpacityPickerProps {
  isOpen: boolean;
  onClose: () => void;
  color: string;
  onChange: (color: string) => void;
  position: { x: number; y: number };
  isTransitioning?: boolean;
}

export interface AspectRatioSelectorProps {
  currentDimensions: { width: number; height: number };
  onDimensionsChange: (dimensions: { width: number; height: number }) => void;
  onAspectRatioChange?: (ratio: number | null) => void;
  variant?: "default" | "compact";
  showIcons?: boolean;
}

export interface PropertyInputProps {
  value: number;
  onChange: (value: number) => void;
  onInstantChange: (value: number) => void;
  className?: string;
  "aria-label"?: string;
  min?: number;
  max?: number;
  step?: number;
  tabIndex?: number;
  icon?: React.ReactNode;
}
