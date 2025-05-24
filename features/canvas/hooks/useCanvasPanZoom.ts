import { useState, useRef, useEffect, useCallback } from "react";

type GestureState = "idle" | "panning" | "zooming";

// Utility function to ensure zoom is always an integer
const ensureIntegerZoom = (zoom: number): number => Math.round(zoom);

export const useCanvasPanZoom = (
  artboardRef: React.RefObject<HTMLDivElement | null>,
  canvasRef: React.RefObject<HTMLDivElement | null>,
  selectedTool: string | null,
  panSensitivity: number = 1.6,
  zoomSensitivity: number = 0.6
) => {
  const [zoom, setZoom] = useState(75);
  const [canvasPosition, setCanvasPosition] = useState({ x: 0, y: 0 });
  const [transformOrigin, setTransformOrigin] =
    useState<string>("center center");
  const [isPanning, setIsPanning] = useState(false);
  const [gestureState, setGestureState] = useState<GestureState>("idle");
  const panStartRef = useRef<{ x: number; y: number } | null>(null);
  const gestureTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Custom zoom setter that ensures integer values
  const setZoomInteger = useCallback(
    (newZoom: number | ((prev: number) => number)) => {
      if (typeof newZoom === "function") {
        setZoom((prev) => ensureIntegerZoom(newZoom(prev)));
      } else {
        setZoom(ensureIntegerZoom(newZoom));
      }
    },
    []
  );

  // Clear any pending gesture timeout
  const clearGestureTimeout = useCallback(() => {
    if (gestureTimeoutRef.current) {
      clearTimeout(gestureTimeoutRef.current);
      gestureTimeoutRef.current = null;
    }
  }, []);

  // Reset gesture state with reduced debounce for faster response
  const resetGestureState = useCallback(() => {
    clearGestureTimeout();
    gestureTimeoutRef.current = setTimeout(() => {
      setGestureState("idle");
    }, 50); // Reduced from 100ms to 50ms for faster response
  }, [clearGestureTimeout]);

  // Mouse pan handlers - optimized for performance
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      // Middle mouse button (wheel press) always pans, regardless of selected tool
      if (e.button === 1) {
        e.preventDefault(); // Prevent default middle mouse behavior
        setGestureState("panning");
        setIsPanning(true);
        clearGestureTimeout();

        panStartRef.current = {
          x: e.clientX - canvasPosition.x,
          y: e.clientY - canvasPosition.y,
        };
        if (canvasRef.current) canvasRef.current.style.cursor = "grabbing";
        return true; // Indicate that we handled the event
      }

      // Left mouse button only pans when hand tool is selected and no other gesture is active
      if (
        e.button === 0 &&
        selectedTool === "hand" &&
        gestureState === "idle"
      ) {
        setGestureState("panning");
        setIsPanning(true);
        clearGestureTimeout();

        panStartRef.current = {
          x: e.clientX - canvasPosition.x,
          y: e.clientY - canvasPosition.y,
        };
        if (canvasRef.current) canvasRef.current.style.cursor = "grabbing";
        return true; // Indicate that we handled the event
      }

      return false; // Indicate that we didn't handle the event
    },
    [selectedTool, gestureState, clearGestureTimeout, canvasPosition]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      // Only allow mouse move if we're actively panning
      if (gestureState !== "panning" || !isPanning || !panStartRef.current)
        return;

      // Direct state update for better performance
      setCanvasPosition({
        x: e.clientX - panStartRef.current.x,
        y: e.clientY - panStartRef.current.y,
      });
    },
    [gestureState, isPanning]
  );

  const handleMouseUp = useCallback(
    (e?: React.MouseEvent) => {
      // Only handle mouse up if we were panning
      if (gestureState !== "panning" || !isPanning) return false;

      setIsPanning(false);
      panStartRef.current = null;

      // Reset cursor based on whether we're using hand tool or not
      if (canvasRef.current) {
        if (selectedTool === "hand") {
          canvasRef.current.style.cursor = "grab";
        } else {
          canvasRef.current.style.cursor = "default";
        }
      }

      // Reset gesture state after panning ends
      resetGestureState();
      return true; // Indicate that we handled the event
    },
    [gestureState, isPanning, resetGestureState, selectedTool]
  );

  // Touch pan/zoom handlers with gesture state management
  const touchStartRef = useRef<{
    x: number;
    y: number;
    distance?: number;
  } | null>(null);
  const lastTouchesRef = useRef<React.TouchList | null>(null);

  const getTouchDistance = (touches: React.TouchList) => {
    if (touches.length < 2) return 0;
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const getTouchCenter = (touches: React.TouchList) => {
    if (touches.length === 1) {
      return { x: touches[0].clientX, y: touches[0].clientY };
    }
    const x = (touches[0].clientX + touches[1].clientX) / 2;
    const y = (touches[0].clientY + touches[1].clientY) / 2;
    return { x, y };
  };

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      // Block if another gesture is active
      if (gestureState !== "idle") return;

      const touches = e.touches;
      lastTouchesRef.current = touches;

      if (touches.length === 1) {
        // Single finger - potential pan (only with hand tool)
        if (selectedTool === "hand") {
          setGestureState("panning");
          setIsPanning(true);
          clearGestureTimeout();

          touchStartRef.current = {
            x: touches[0].clientX - canvasPosition.x,
            y: touches[0].clientY - canvasPosition.y,
          };
        }
      } else if (touches.length === 2) {
        // Two fingers - potential pinch zoom
        const distance = getTouchDistance(touches);
        const center = getTouchCenter(touches);

        setGestureState("zooming");
        clearGestureTimeout();

        touchStartRef.current = {
          x: center.x,
          y: center.y,
          distance: distance,
        };
      }
    },
    [gestureState, selectedTool, clearGestureTimeout, canvasPosition]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      const touches = e.touches;

      if (
        gestureState === "panning" &&
        touches.length === 1 &&
        touchStartRef.current &&
        selectedTool === "hand"
      ) {
        // Handle pan
        e.preventDefault();
        setCanvasPosition({
          x: touches[0].clientX - touchStartRef.current.x,
          y: touches[0].clientY - touchStartRef.current.y,
        });
      } else if (
        gestureState === "zooming" &&
        touches.length === 2 &&
        touchStartRef.current &&
        touchStartRef.current.distance
      ) {
        // Handle pinch zoom - optimized with faster scaling
        e.preventDefault();

        const currentDistance = getTouchDistance(touches);
        const currentCenter = getTouchCenter(touches);
        const scale = currentDistance / touchStartRef.current.distance;

        // Calculate new zoom with extended range and faster response
        const minZoom = 10; // Extended zoom out range
        const maxZoom = 800; // Extended zoom in range
        const newZoom = Math.round(
          Math.min(maxZoom, Math.max(minZoom, zoom * scale))
        );

        if (Math.abs(newZoom - zoom) > 0.5) {
          // Only update if change is significant - simple center-based zoom
          setZoomInteger(newZoom);
        }

        // Update distance for next move
        touchStartRef.current = {
          ...touchStartRef.current,
          distance: currentDistance,
        };
      }

      lastTouchesRef.current = touches;
    },
    [gestureState, selectedTool, zoom, setZoomInteger]
  );

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      // Only handle if we were actively in a gesture
      if (gestureState === "idle") return;

      const touches = e.touches;

      if (touches.length === 0) {
        // All fingers lifted
        if (gestureState === "panning") {
          setIsPanning(false);
        }
        touchStartRef.current = null;
        lastTouchesRef.current = null;
        resetGestureState();
      } else if (gestureState === "zooming" && touches.length === 1) {
        // Went from pinch to single finger - could transition to pan if hand tool
        if (selectedTool === "hand") {
          setGestureState("panning");
          setIsPanning(true);
          touchStartRef.current = {
            x: touches[0].clientX - canvasPosition.x,
            y: touches[0].clientY - canvasPosition.y,
          };
        } else {
          resetGestureState();
        }
      }
    },
    [gestureState, selectedTool, canvasPosition, resetGestureState]
  );

  // Enhanced wheel handler for both trackpad pan/zoom and mouse wheel zoom - OPTIMIZED
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleWheel = (e: WheelEvent) => {
      // Always prevent default browser zoom/scroll behavior on canvas
      e.preventDefault();

      if (e.deltaMode !== 0) return;

      const isZoomModifier = e.ctrlKey || e.metaKey; // Ctrl on Windows/Linux, Cmd on macOS
      const hasHorizontalDelta = Math.abs(e.deltaX) > 0;
      const hasVerticalDelta = Math.abs(e.deltaY) > 0;

      // Handle zoom with Ctrl/Cmd + scroll wheel (both trackpad and mouse)
      if (isZoomModifier && hasVerticalDelta) {
        // Block if panning is in progress
        if (gestureState === "panning") return;

        // If idle, commit to zooming gesture
        if (gestureState === "idle") {
          setGestureState("zooming");
          clearGestureTimeout();
        }

        // Only proceed if we're in zooming state
        if (gestureState !== "zooming") return;

        setTransformOrigin("center center");

        const minZoom = 10; // Extended zoom out range
        const maxZoom = 800; // Extended zoom in range

        // Zoom steps - trackpad pinch typically has smaller deltaY values
        const isTrackpadPinch = Math.abs(e.deltaY) < 50; // Trackpad pinch gestures typically have smaller delta values
        const zoomStep = isTrackpadPinch
          ? Math.max(1, zoom * 0.15 * zoomSensitivity) // Finer control for trackpad pinch
          : Math.max(5, zoom * 0.15 * zoomSensitivity); // Faster for mouse wheel

        let newZoom = zoom;

        if (e.deltaY < 0)
          newZoom = Math.round(Math.min(maxZoom, zoom + zoomStep));
        else if (e.deltaY > 0)
          newZoom = Math.round(Math.max(minZoom, zoom - zoomStep));

        if (Math.abs(newZoom - zoom) < 0.1) {
          // No significant zoom change, reset gesture state
          resetGestureState();
          return;
        }

        // Simple center-based zoom - no pointer-following behavior
        setZoomInteger(newZoom);

        // Reset gesture state after zoom completes
        resetGestureState();
        return;
      }

      // Handle panning (trackpad scroll or mouse wheel without modifier)
      if ((hasHorizontalDelta || hasVerticalDelta) && !isZoomModifier) {
        // Block if zooming is in progress
        if (gestureState === "zooming") return;

        // Commit to panning gesture
        if (gestureState === "idle") {
          setGestureState("panning");
          clearGestureTimeout();
        }

        // Only proceed if we're in panning state
        if (gestureState !== "panning") return;

        // Pan with sensitivity
        setCanvasPosition((prev) => ({
          x: prev.x - e.deltaX * panSensitivity,
          y: prev.y - e.deltaY * panSensitivity,
        }));

        // Reset gesture state after panning
        resetGestureState();
        return;
      }
    };

    canvas.addEventListener("wheel", handleWheel, { passive: false });
    return () => canvas.removeEventListener("wheel", handleWheel);
  }, [
    zoom,
    gestureState,
    clearGestureTimeout,
    resetGestureState,
    panSensitivity,
    zoomSensitivity,
    setZoomInteger,
  ]);

  // Update cursor based on tool and gesture state
  useEffect(() => {
    if (canvasRef.current) {
      if (selectedTool === "hand") {
        if (gestureState === "panning" || isPanning) {
          canvasRef.current.style.cursor = "grabbing";
        } else if (gestureState === "idle") {
          canvasRef.current.style.cursor = "grab";
        } else {
          // During zoom or other gestures, maintain current cursor
          canvasRef.current.style.cursor = "grab";
        }
      } else {
        canvasRef.current.style.cursor = "default";
      }
    }
  }, [selectedTool, isPanning, gestureState]);

  // Cleanup gesture timeout on unmount
  useEffect(() => {
    return () => {
      clearGestureTimeout();
    };
  }, [clearGestureTimeout]);

  return {
    zoom,
    setZoom: setZoomInteger,
    canvasPosition,
    setCanvasPosition,
    transformOrigin,
    setTransformOrigin,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    isPanning,
    setIsPanning,
    panStartRef,
    gestureState, // Expose gesture state for debugging or external use
  };
};
