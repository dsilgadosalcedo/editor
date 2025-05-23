export interface CanvasData {
  [key: string]: unknown;
}

export interface SavedCanvas {
  id: string;
  title: string;
  data: CanvasData;
  createdAt: string;
  updatedAt: string;
}

export interface CanvasListItem {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}
