"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface MultiSelectionUIProps {
  selectedElements: any[];
  zoom: number;
  onResizeStart: (dir: string, e: React.MouseEvent) => void;
  onResizeTouchStart: (dir: string, e: React.TouchEvent) => void;
  onResizeDoubleClick: (e: React.MouseEvent) => void;
}

export default function MultiSelectionUI({
  selectedElements,
  zoom,
  onResizeStart,
  onResizeTouchStart,
  onResizeDoubleClick,
}: MultiSelectionUIProps) {
  if (selectedElements.length <= 1) return null;

  // Calculate bounding box for all selected elements
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;

  selectedElements.forEach((el) => {
    minX = Math.min(minX, el.x);
    minY = Math.min(minY, el.y);
    maxX = Math.max(maxX, el.x + el.width);
    maxY = Math.max(maxY, el.y + el.height);
  });

  const boundingBox = {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };

  return (
    <>
      {/* Multi-selection frame */}
      <div
        className="absolute pointer-events-none border-2 border-dashed border-blue-500 bg-blue-500/5"
        style={{
          left: `${boundingBox.x}px`,
          top: `${boundingBox.y}px`,
          width: `${boundingBox.width}px`,
          height: `${boundingBox.height}px`,
          zIndex: 48,
        }}
      />

      {/* Multi-selection label */}
      <div
        className="absolute text-xs text-blue-600 bg-white/80 px-1 rounded pointer-events-none font-medium"
        style={{
          left: `${boundingBox.x}px`,
          top: `${boundingBox.y - 20}px`,
          fontSize: "10px",
          transform: `scale(${100 / zoom})`,
          transformOrigin: "left bottom",
          zIndex: 49,
        }}
      >
        {selectedElements.length} elements
      </div>

      {/* Selection UI Container - for resize handles */}
      <div
        className="absolute pointer-events-none"
        style={{
          left: `${boundingBox.x + boundingBox.width / 2}px`,
          top: `${boundingBox.y + boundingBox.height / 2}px`,
          zIndex: 49,
        }}
      >
        {/* Selection border */}
        <div
          className="absolute pointer-events-none border-blue-500 rounded-none"
          style={{
            left: `${-boundingBox.width / 2 - 1 * (100 / zoom)}px`,
            top: `${-boundingBox.height / 2 - 1 * (100 / zoom)}px`,
            width: `${boundingBox.width + 1 * (100 / zoom) * 2}px`,
            height: `${boundingBox.height + 1 * (100 / zoom) * 2}px`,
            borderWidth: 1 * (100 / zoom),
            zIndex: 9996,
          }}
        />

        {/* Resize handles - only 4 corner handles for multi-selection */}
        {/* top-left */}
        <div
          className="absolute w-2 h-2 border-[0.5px] border-blue-100 inset-shadow-xs inset-shadow-blue-400/50 bg-blue-400/70 rounded-full shadow-sm hover:scale-140 transition-transform ease-out backdrop-blur-xs cursor-nwse-resize"
          style={{
            left: `${-boundingBox.width / 2 - (4.25 + 1 / 2) * (100 / zoom)}px`,
            top: `${-boundingBox.height / 2 - (4.25 + 1 / 2) * (100 / zoom)}px`,
            transform: `scale(${100 / zoom})`,
            transformOrigin: "top left",
            pointerEvents: "auto",
            zIndex: 9998,
          }}
          onMouseDown={(e) => onResizeStart("nw", e)}
          onTouchStart={(e) => onResizeTouchStart("nw", e)}
          onDoubleClick={onResizeDoubleClick}
        />

        {/* top-right */}
        <div
          className="absolute w-2 h-2 border-[0.5px] border-blue-100 inset-shadow-xs inset-shadow-blue-400/50 bg-blue-400/70 rounded-full shadow-sm hover:scale-140 transition-transform ease-out backdrop-blur-xs cursor-nesw-resize"
          style={{
            left: `${boundingBox.width / 2 - (4.25 - 1 / 2) * (100 / zoom)}px`,
            top: `${-boundingBox.height / 2 - (4.25 + 1 / 2) * (100 / zoom)}px`,
            transform: `scale(${100 / zoom})`,
            transformOrigin: "top left",
            pointerEvents: "auto",
            zIndex: 9998,
          }}
          onMouseDown={(e) => onResizeStart("ne", e)}
          onTouchStart={(e) => onResizeTouchStart("ne", e)}
          onDoubleClick={onResizeDoubleClick}
        />

        {/* bottom-left */}
        <div
          className="absolute w-2 h-2 border-[0.5px] border-blue-100 inset-shadow-xs inset-shadow-blue-400/50 bg-blue-400/70 rounded-full shadow-sm hover:scale-140 transition-transform ease-out backdrop-blur-xs cursor-nesw-resize"
          style={{
            left: `${-boundingBox.width / 2 - (4.25 + 1 / 2) * (100 / zoom)}px`,
            top: `${boundingBox.height / 2 - (4.25 - 1 / 2) * (100 / zoom)}px`,
            transform: `scale(${100 / zoom})`,
            transformOrigin: "top left",
            pointerEvents: "auto",
            zIndex: 9998,
          }}
          onMouseDown={(e) => onResizeStart("sw", e)}
          onTouchStart={(e) => onResizeTouchStart("sw", e)}
          onDoubleClick={onResizeDoubleClick}
        />

        {/* bottom-right */}
        <div
          className="absolute w-2 h-2 border-[0.5px] border-blue-100 inset-shadow-xs inset-shadow-blue-400/50 bg-blue-400/70 rounded-full shadow-sm hover:scale-140 transition-transform ease-out backdrop-blur-xs cursor-nwse-resize"
          style={{
            left: `${boundingBox.width / 2 - (4.25 - 1 / 2) * (100 / zoom)}px`,
            top: `${boundingBox.height / 2 - (4.25 - 1 / 2) * (100 / zoom)}px`,
            transform: `scale(${100 / zoom})`,
            transformOrigin: "top left",
            pointerEvents: "auto",
            zIndex: 9998,
          }}
          onMouseDown={(e) => onResizeStart("se", e)}
          onTouchStart={(e) => onResizeTouchStart("se", e)}
          onDoubleClick={onResizeDoubleClick}
        />
      </div>
    </>
  );
}
