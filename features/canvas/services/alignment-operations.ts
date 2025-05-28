/**
 * Alignment operations service for canvas elements
 * Handles element alignment to artboard boundaries and centers
 */

import { CanvasElementData } from "../types";

export interface ArtboardDimensions {
  width: number;
  height: number;
}

/**
 * Align element to the left edge of the artboard
 */
export const alignElementToArtboardLeft = (
  elements: CanvasElementData[],
  elementId: string,
  artboardDimensions: ArtboardDimensions
): CanvasElementData[] => {
  return elements.map((el) => (el.id === elementId ? { ...el, x: 0 } : el));
};

/**
 * Align element to the right edge of the artboard
 */
export const alignElementToArtboardRight = (
  elements: CanvasElementData[],
  elementId: string,
  artboardDimensions: ArtboardDimensions
): CanvasElementData[] => {
  return elements.map((el) =>
    el.id === elementId ? { ...el, x: artboardDimensions.width - el.width } : el
  );
};

/**
 * Align element to the top edge of the artboard
 */
export const alignElementToArtboardTop = (
  elements: CanvasElementData[],
  elementId: string,
  artboardDimensions: ArtboardDimensions
): CanvasElementData[] => {
  return elements.map((el) => (el.id === elementId ? { ...el, y: 0 } : el));
};

/**
 * Align element to the bottom edge of the artboard
 */
export const alignElementToArtboardBottom = (
  elements: CanvasElementData[],
  elementId: string,
  artboardDimensions: ArtboardDimensions
): CanvasElementData[] => {
  return elements.map((el) =>
    el.id === elementId
      ? { ...el, y: artboardDimensions.height - el.height }
      : el
  );
};

/**
 * Align element to the horizontal center of the artboard
 */
export const alignElementToArtboardCenterHorizontal = (
  elements: CanvasElementData[],
  elementId: string,
  artboardDimensions: ArtboardDimensions
): CanvasElementData[] => {
  return elements.map((el) =>
    el.id === elementId
      ? { ...el, x: (artboardDimensions.width - el.width) / 2 }
      : el
  );
};

/**
 * Align element to the vertical center of the artboard
 */
export const alignElementToArtboardCenterVertical = (
  elements: CanvasElementData[],
  elementId: string,
  artboardDimensions: ArtboardDimensions
): CanvasElementData[] => {
  return elements.map((el) =>
    el.id === elementId
      ? { ...el, y: (artboardDimensions.height - el.height) / 2 }
      : el
  );
};

/**
 * Center element both horizontally and vertically on the artboard
 */
export const centerElementOnArtboard = (
  elements: CanvasElementData[],
  elementId: string,
  artboardDimensions: ArtboardDimensions
): CanvasElementData[] => {
  return elements.map((el) =>
    el.id === elementId
      ? {
          ...el,
          x: (artboardDimensions.width - el.width) / 2,
          y: (artboardDimensions.height - el.height) / 2,
        }
      : el
  );
};
