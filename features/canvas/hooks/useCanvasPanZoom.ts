import { useState, useRef, useEffect } from "react";

type GestureState = "idle" | "panning" | "zooming";

export const useCanvasPanZoom = (
  artboardRef: React.RefObject<HTMLDivElement | null>,
  canvasRef: React.RefObject<HTMLDivElement | null>,
  selectedTool: string | null
) => {
  const [zoom, setZoom] = useState(100);
  const [canvasPosition, setCanvasPosition] = useState({ x: 0, y: 0 });
  const [transformOrigin, setTransformOrigin] =
    useState<string>("center center");
  const [isPanning, setIsPanning] = useState(false);
  const [gestureState, setGestureState] = useState<GestureState>("idle");
  const panStartRef = useRef<{ x: number; y: number } | null>(null);
  const gestureTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Clear any pending gesture timeout
  const clearGestureTimeout = () => {
    if (gestureTimeoutRef.current) {
      clearTimeout(gestureTimeoutRef.current);
      gestureTimeoutRef.current = null;
    }
  };

  // Reset gesture state with debounce to prevent rapid state changes
  const resetGestureState = () => {
    clearGestureTimeout();
    gestureTimeoutRef.current = setTimeout(() => {
      setGestureState("idle");
    }, 100); // Small delay to prevent flickering between gestures
  };

  // Mouse pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    // Don't pan if not using hand tool or if another gesture is active
    if (selectedTool !== "hand" || gestureState !== "idle") return;

    // Commit to panning gesture
    setGestureState("panning");
    setIsPanning(true);
    clearGestureTimeout();

    panStartRef.current = {
      x: e.clientX - canvasPosition.x,
      y: e.clientY - canvasPosition.y,
    };
    if (canvasRef.current) canvasRef.current.style.cursor = "grabbing";
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    // Only allow mouse move if we're actively panning
    if (gestureState !== "panning" || !isPanning || !panStartRef.current)
      return;

    setCanvasPosition({
      x: e.clientX - panStartRef.current.x,
      y: e.clientY - panStartRef.current.y,
    });
  };

  const handleMouseUp = () => {
    // Only handle mouse up if we were panning
    if (gestureState !== "panning" || !isPanning) return;

    setIsPanning(false);
    panStartRef.current = null;
    if (canvasRef.current) canvasRef.current.style.cursor = "grab";

    // Reset gesture state after panning ends
    resetGestureState();
  };

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

  const handleTouchStart = (e: React.TouchEvent) => {
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
  };

  const handleTouchMove = (e: React.TouchEvent) => {
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
      // Handle pinch zoom
      e.preventDefault();

      const currentDistance = getTouchDistance(touches);
      const currentCenter = getTouchCenter(touches);
      const scale = currentDistance / touchStartRef.current.distance;

      // Calculate new zoom
      const minZoom = 50;
      const maxZoom = 400;
      const newZoom = Math.min(maxZoom, Math.max(minZoom, zoom * scale));

      if (newZoom !== zoom && artboardRef.current) {
        const artboardRect = artboardRef.current.getBoundingClientRect();
        const scaleBefore = zoom / 100;
        const scaleAfter = newZoom / 100;
        const centerX = artboardRect.left + artboardRect.width / 2;
        const centerY = artboardRect.top + artboardRect.height / 2;
        const offsetX = currentCenter.x - centerX;
        const offsetY = currentCenter.y - centerY;

        setCanvasPosition((prev) => ({
          x: prev.x + offsetX * (1 - scaleAfter / scaleBefore),
          y: prev.y + offsetY * (1 - scaleAfter / scaleBefore),
        }));

        setZoom(newZoom);
      }

      // Update distance for next move
      touchStartRef.current = {
        ...touchStartRef.current,
        distance: currentDistance,
      };
    }

    lastTouchesRef.current = touches;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
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
  };

  // Enhanced wheel handler for both trackpad pan/zoom and mouse wheel zoom
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.deltaMode !== 0) return;

      const isPinchZoom = e.ctrlKey; // macOS trackpad pinch gesture
      const isTrackpadPan =
        !isPinchZoom && (Math.abs(e.deltaX) > 0 || Math.abs(e.deltaY) > 0);

      // Handle trackpad panning (two-finger scroll without pinch) - works with any tool
      if (isTrackpadPan) {
        // Block if zooming is in progress
        if (gestureState === "zooming") return;

        // Commit to panning gesture
        if (gestureState === "idle") {
          setGestureState("panning");
          clearGestureTimeout();
        }

        // Only proceed if we're in panning state
        if (gestureState !== "panning") return;

        e.preventDefault();

        // Apply trackpad panning with appropriate sensitivity
        const panSensitivity = 1.0;
        setCanvasPosition((prev) => ({
          x: prev.x - e.deltaX * panSensitivity,
          y: prev.y - e.deltaY * panSensitivity,
        }));

        // Reset gesture state after a short delay
        resetGestureState();
        return;
      }

      // Handle zoom (trackpad pinch or mouse wheel when not panning)
      if (isPinchZoom || (!isTrackpadPan && !isPinchZoom)) {
        // Block if panning is in progress
        if (gestureState === "panning") return;

        // If idle, commit to zooming gesture
        if (gestureState === "idle") {
          setGestureState("zooming");
          clearGestureTimeout();
        }

        // Only proceed if we're in zooming state
        if (gestureState !== "zooming") return;

        e.preventDefault();
        setTransformOrigin("center center");

        const minZoom = 50;
        const maxZoom = 400;
        const zoomStep = isPinchZoom ? 2 : 5; // Finer control for trackpad pinch
        let newZoom = zoom;

        if (e.deltaY < 0) newZoom = Math.min(maxZoom, zoom + zoomStep);
        else if (e.deltaY > 0) newZoom = Math.max(minZoom, zoom - zoomStep);

        if (newZoom === zoom) {
          // No zoom change, reset gesture state
          resetGestureState();
          return;
        }

        if (artboardRef.current) {
          const artboardRect = artboardRef.current.getBoundingClientRect();
          const scaleBefore = zoom / 100;
          const scaleAfter = newZoom / 100;
          const centerX = artboardRect.left + artboardRect.width / 2;
          const centerY = artboardRect.top + artboardRect.height / 2;
          const offsetX = e.clientX - centerX;
          const offsetY = e.clientY - centerY;

          setCanvasPosition((prev) => ({
            x: prev.x + offsetX * (1 - scaleAfter / scaleBefore),
            y: prev.y + offsetY * (1 - scaleAfter / scaleBefore),
          }));
        }

        setZoom(newZoom);

        // Reset gesture state after zoom completes
        resetGestureState();
      }
    };

    canvas.addEventListener("wheel", handleWheel, { passive: false });
    return () => canvas.removeEventListener("wheel", handleWheel);
  }, [zoom, artboardRef, canvasRef, selectedTool, gestureState]);

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
  }, [selectedTool, isPanning, gestureState, canvasRef]);

  // Cleanup gesture timeout on unmount
  useEffect(() => {
    return () => {
      clearGestureTimeout();
    };
  }, []);

  return {
    zoom,
    setZoom,
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
