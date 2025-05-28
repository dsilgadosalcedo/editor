/**
 * Types for layer components
 */

export const LAYER_ITEM_TYPE = "LAYER_ITEM";

export interface DragItem {
  id: string;
  type: string;
  elementType: "rectangle" | "text" | "image" | "group";
  element: any;
}
