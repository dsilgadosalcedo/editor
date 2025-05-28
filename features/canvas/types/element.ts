export type ElementType = "rectangle" | "text" | "image" | "group";

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
  // Isolation mode properties
  isolated?: boolean;
  inIsolatedGroup?: boolean;
  isInIsolationMode?: boolean;
  isSelectableInIsolation?: boolean;
}

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

export interface AspectRatioOption {
  label: string;
  ratio: number;
  width: number;
  height: number;
  icon?: React.ReactNode;
}
