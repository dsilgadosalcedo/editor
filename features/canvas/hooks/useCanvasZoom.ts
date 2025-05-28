import { useState, useCallback } from "react";

interface UseCanvasZoomProps {
  initialZoom?: number;
  minZoom?: number;
  maxZoom?: number;
  step?: number;
}

export const useCanvasZoom = ({
  initialZoom = 75,
  minZoom = 10,
  maxZoom = 500,
  step = 25,
}: UseCanvasZoomProps = {}) => {
  const [zoom, setZoom] = useState(initialZoom);

  // Ensure zoom is always an integer within bounds
  const ensureIntegerZoom = useCallback(
    (value: number): number => {
      return Math.max(minZoom, Math.min(maxZoom, Math.round(value)));
    },
    [minZoom, maxZoom]
  );

  // Custom zoom setter that ensures integer values
  const setZoomInteger = useCallback(
    (newZoom: number | ((prev: number) => number)) => {
      if (typeof newZoom === "function") {
        setZoom((prev) => ensureIntegerZoom(newZoom(prev)));
      } else {
        setZoom(ensureIntegerZoom(newZoom));
      }
    },
    [ensureIntegerZoom]
  );

  const zoomIn = useCallback(() => {
    setZoomInteger((prev) => prev + step);
  }, [setZoomInteger, step]);

  const zoomOut = useCallback(() => {
    setZoomInteger((prev) => prev - step);
  }, [setZoomInteger, step]);

  const zoomToFit = useCallback(() => {
    setZoomInteger(100);
  }, [setZoomInteger]);

  const zoomTo = useCallback(
    (targetZoom: number) => {
      setZoomInteger(targetZoom);
    },
    [setZoomInteger]
  );

  const canZoomIn = zoom < maxZoom;
  const canZoomOut = zoom > minZoom;

  return {
    zoom,
    setZoom: setZoomInteger,
    zoomIn,
    zoomOut,
    zoomToFit,
    zoomTo,
    canZoomIn,
    canZoomOut,
    minZoom,
    maxZoom,
  };
};
