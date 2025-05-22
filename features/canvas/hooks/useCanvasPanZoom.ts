import { useState, useRef, useEffect } from "react";

export const useCanvasPanZoom = (
  artboardRef: React.RefObject<HTMLDivElement>,
  canvasRef: React.RefObject<HTMLDivElement>,
  selectedTool: string | null
) => {
  const [zoom, setZoom] = useState(100);
  const [canvasPosition, setCanvasPosition] = useState({ x: 0, y: 0 });
  const [transformOrigin, setTransformOrigin] =
    useState<string>("center center");
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef<{ x: number; y: number } | null>(null);

  // Mouse pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsPanning(true);
    panStartRef.current = {
      x: e.clientX - canvasPosition.x,
      y: e.clientY - canvasPosition.y,
    };
    if (canvasRef.current) canvasRef.current.style.cursor = "grabbing";
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning && panStartRef.current) {
      setCanvasPosition({
        x: e.clientX - panStartRef.current.x,
        y: e.clientY - panStartRef.current.y,
      });
    }
  };
  const handleMouseUp = () => {
    if (isPanning) {
      setIsPanning(false);
      panStartRef.current = null;
      if (canvasRef.current) canvasRef.current.style.cursor = "grab";
    }
  };

  // Touch pan/zoom handlers (pinch, pan)
  // ... (for brevity, you can move the touch logic from DesignCanvas here)

  // Wheel zoom handler
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const handleWheel = (e: WheelEvent) => {
      if (e.deltaMode !== 0) return;
      e.preventDefault();
      setTransformOrigin("center center");
      const minZoom = 50;
      const maxZoom = 400;
      const zoomStep = 5;
      let newZoom = zoom;
      if (e.deltaY < 0) newZoom = Math.min(maxZoom, zoom + zoomStep);
      else if (e.deltaY > 0) newZoom = Math.max(minZoom, zoom - zoomStep);
      if (newZoom === zoom) return;
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
    };
    canvas.addEventListener("wheel", handleWheel, { passive: false });
    return () => canvas.removeEventListener("wheel", handleWheel);
  }, [zoom, artboardRef, canvasRef]);

  useEffect(() => {
    if (canvasRef.current) {
      canvasRef.current.style.cursor = isPanning ? "grabbing" : "grab";
    }
  }, [selectedTool, isPanning, canvasRef]);

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
    isPanning,
    setIsPanning,
    panStartRef,
  };
};
