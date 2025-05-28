import { CanvasElementData, ElementType } from "./element";

export interface DragItem {
  id: string;
  type: string;
  elementType: ElementType;
  element: CanvasElementData;
}

export interface LayerItemProps {
  element: CanvasElementData;
  depth: number;
  onDeleteElement: (e: React.MouseEvent, elementId: string) => void;
  onToggleVisibility: (e: React.MouseEvent, elementId: string) => void;
  selectedElements: string[];
  selectElement: (id: string, addToSelection?: boolean) => void;
  getElementChildren: (elementId: string) => CanvasElementData[];
  isIsolated?: boolean;
  index: number;
  totalElements: number;
}
