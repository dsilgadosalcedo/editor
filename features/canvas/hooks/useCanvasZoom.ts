import { useState, useCallback } from "react";

interface UseCanvasZoomProps {
  initialZoom?: number;
  minZoom?: number;
  maxZoom?: number;
  step?: number;
}

// ZOOM DISABLED - Fixed at 100% to prevent bugs
export const useCanvasZoom = ({
  initialZoom = 100, // Changed from 75 to 100
  minZoom = 100, // Changed from 10 to 100
  maxZoom = 100, // Changed from 500 to 100
  step = 25,
}: UseCanvasZoomProps = {}) => {
  // Fixed zoom at 100% - no state changes allowed
  const [zoom] = useState(100); // Fixed at 100%

  // Disabled zoom functions - all return fixed 100% zoom
  const ensureIntegerZoom = useCallback(
    (value: number): number => {
      return 100; // Always return 100%
    },
    []
  );

  const setZoomInteger = useCallback(
    (newZoom: number | ((prev: number) => number)) => {
      // Do nothing - zoom is fixed at 100%
      console.log("Zoom disabled - staying at 100%");
    },
    []
  );

  const zoomIn = useCallback(() => {
    // Disabled - zoom stays at 100%
    console.log("Zoom in disabled - staying at 100%");
  }, []);

  const zoomOut = useCallback(() => {
    // Disabled - zoom stays at 100%
    console.log("Zoom out disabled - staying at 100%");
  }, []);

  const zoomToFit = useCallback(() => {
    // Disabled - zoom stays at 100%
    console.log("Zoom to fit disabled - staying at 100%");
  }, []);

  const zoomTo = useCallback(
    (targetZoom: number) => {
      // Disabled - zoom stays at 100%
      console.log("Zoom to disabled - staying at 100%");
    },
    []
  );

  // Always false since zoom is fixed
  const canZoomIn = false;
  const canZoomOut = false;

  return {
    zoom: 100, // Always return 100%
    setZoom: setZoomInteger,
    zoomIn,
    zoomOut,
    zoomToFit,
    zoomTo,
    canZoomIn,
    canZoomOut,
    minZoom: 100,
    maxZoom: 100,
  };
};
