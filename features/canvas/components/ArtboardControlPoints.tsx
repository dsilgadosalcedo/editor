import { cn } from "@/lib/utils";
import React, { useState, useRef } from "react";
import { useCanvasStore } from "@/features/canvas/store/useCanvasStore.new";
import { useArtboardAspectRatio } from "../store/selectors";

interface ArtboardControlPointsProps {
  artboardDimensions: { width: number; height: number };
  onResizeArtboard: (width: number, height: number) => void;
  zoom: number;
}

type ResizeHandle =
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right"
  | "top"
  | "bottom"
  | "left"
  | "right";

const ArtboardControlPoints: React.FC<ArtboardControlPointsProps> = ({
  artboardDimensions,
  onResizeArtboard,
  zoom,
}) => {
  // Use optimized selector to prevent unnecessary re-renders
  const artboardAspectRatio = useArtboardAspectRatio();
  const [isDragging, setIsDragging] = useState(false);
  const [activeHandle, setActiveHandle] = useState<ResizeHandle | null>(null);
  const startDimensions = useRef({ width: 0, height: 0 });
  const startMousePos = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent, handle: ResizeHandle) => {
    e.preventDefault();
    e.stopPropagation();

    setIsDragging(true);
    setActiveHandle(handle);
    startDimensions.current = { ...artboardDimensions };
    startMousePos.current = { x: e.clientX, y: e.clientY };

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = (e.clientX - startMousePos.current.x) / (zoom / 100);
      const deltaY = (e.clientY - startMousePos.current.y) / (zoom / 100);

      let newWidth = startDimensions.current.width;
      let newHeight = startDimensions.current.height;

      if (artboardAspectRatio !== null) {
        // Aspect ratio is locked - maintain ratio during resize
        switch (handle) {
          case "top-left":
          case "top-right":
          case "bottom-left":
          case "bottom-right":
            // Corner handles - use the larger delta to maintain aspect ratio
            const widthDelta = handle.includes("right") ? deltaX : -deltaX;
            const heightDelta = handle.includes("bottom") ? deltaY : -deltaY;

            // Calculate new dimensions based on width change
            const newWidthFromWidth = Math.max(
              200,
              startDimensions.current.width + widthDelta
            );
            const newHeightFromWidth = Math.max(
              150,
              newWidthFromWidth / artboardAspectRatio
            );

            // Calculate new dimensions based on height change
            const newHeightFromHeight = Math.max(
              150,
              startDimensions.current.height + heightDelta
            );
            const newWidthFromHeight = Math.max(
              200,
              newHeightFromHeight * artboardAspectRatio
            );

            // Use the change that results in larger dimensions to give better user control
            if (Math.abs(widthDelta) > Math.abs(heightDelta)) {
              newWidth = newWidthFromWidth;
              newHeight = newHeightFromWidth;
            } else {
              newWidth = newWidthFromHeight;
              newHeight = newHeightFromHeight;
            }
            break;
          case "top":
          case "bottom":
            // Vertical handles - adjust width to maintain ratio
            newHeight = Math.max(
              150,
              startDimensions.current.height +
                (handle === "bottom" ? deltaY : -deltaY)
            );
            newWidth = Math.max(200, newHeight * artboardAspectRatio);
            break;
          case "left":
          case "right":
            // Horizontal handles - adjust height to maintain ratio
            newWidth = Math.max(
              200,
              startDimensions.current.width +
                (handle === "right" ? deltaX : -deltaX)
            );
            newHeight = Math.max(150, newWidth / artboardAspectRatio);
            break;
        }
      } else {
        // Custom ratio - allow free resizing
        switch (handle) {
          case "top-left":
            newWidth = Math.max(200, startDimensions.current.width - deltaX);
            newHeight = Math.max(150, startDimensions.current.height - deltaY);
            break;
          case "top-right":
            newWidth = Math.max(200, startDimensions.current.width + deltaX);
            newHeight = Math.max(150, startDimensions.current.height - deltaY);
            break;
          case "bottom-left":
            newWidth = Math.max(200, startDimensions.current.width - deltaX);
            newHeight = Math.max(150, startDimensions.current.height + deltaY);
            break;
          case "bottom-right":
            newWidth = Math.max(200, startDimensions.current.width + deltaX);
            newHeight = Math.max(150, startDimensions.current.height + deltaY);
            break;
          case "top":
            newHeight = Math.max(150, startDimensions.current.height - deltaY);
            break;
          case "bottom":
            newHeight = Math.max(150, startDimensions.current.height + deltaY);
            break;
          case "left":
            newWidth = Math.max(200, startDimensions.current.width - deltaX);
            break;
          case "right":
            newWidth = Math.max(200, startDimensions.current.width + deltaX);
            break;
        }
      }

      onResizeArtboard(Math.round(newWidth), Math.round(newHeight));
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setActiveHandle(null);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const controlPointStyle =
    "absolute border-2 shadow-lg cursor-pointer hover:scale-110 transition-transform bg-card opacity-50 hover:opacity-100";
  const cornerPointStyle = `${controlPointStyle} w-4.5 h-4.5  rounded-full`;
  const sidePointStyle = `${controlPointStyle} w-3.5 h-3.5  transform rotate-45`;

  const offset = 24; // Distance from artboard edge - increased for better separation

  return (
    <>
      {/* Corner control points (circles) */}
      <div
        className={cornerPointStyle}
        style={{
          left: -offset - 6,
          top: -offset - 6,
          cursor: "nw-resize",
        }}
        onMouseDown={(e) => handleMouseDown(e, "top-left")}
      />
      <div
        className={cornerPointStyle}
        style={{
          right: -offset - 6,
          top: -offset - 6,
          cursor: "ne-resize",
        }}
        onMouseDown={(e) => handleMouseDown(e, "top-right")}
      />
      <div
        className={cornerPointStyle}
        style={{
          left: -offset - 6,
          bottom: -offset - 6,
          cursor: "sw-resize",
        }}
        onMouseDown={(e) => handleMouseDown(e, "bottom-left")}
      />
      <div
        className={cornerPointStyle}
        style={{
          right: -offset - 6,
          bottom: -offset - 6,
          cursor: "se-resize",
        }}
        onMouseDown={(e) => handleMouseDown(e, "bottom-right")}
      />

      {/* Side control points (diamonds) */}
      <div
        className={cn(sidePointStyle, "left-[calc(50%-7.2px)]")}
        style={{
          top: -offset - 6,
          cursor: "n-resize",
        }}
        onMouseDown={(e) => handleMouseDown(e, "top")}
      />
      <div
        className={cn(sidePointStyle, "left-[calc(50%-7.2px)]")}
        style={{
          bottom: -offset - 6,
          cursor: "s-resize",
        }}
        onMouseDown={(e) => handleMouseDown(e, "bottom")}
      />
      <div
        className={cn(sidePointStyle, "top-[calc(50%-7.2px)]")}
        style={{
          left: -offset - 6,
          cursor: "w-resize",
        }}
        onMouseDown={(e) => handleMouseDown(e, "left")}
      />
      <div
        className={cn(sidePointStyle, "top-[calc(50%-7.2px)]")}
        style={{
          right: -offset - 6,
          cursor: "e-resize",
        }}
        onMouseDown={(e) => handleMouseDown(e, "right")}
      />
    </>
  );
};

export default ArtboardControlPoints;
