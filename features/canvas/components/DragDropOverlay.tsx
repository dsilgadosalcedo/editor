"use client";

import React, { useState, useEffect } from "react";
import { FileUp, Upload } from "lucide-react";

interface DragDropOverlayProps {
  onFileDrop: (file: File) => void;
}

export default function DragDropOverlay({ onFileDrop }: DragDropOverlayProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isValidFile, setIsValidFile] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    let dragCounter = 0;

    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      dragCounter++;

      if (e.dataTransfer?.items) {
        const hasJsonFile = Array.from(e.dataTransfer.items).some(
          (item) =>
            item.type === "application/json" ||
            (item.type === "" && item.kind === "file")
        );
        setIsValidFile(hasJsonFile);
        setIsDragging(true);
      }
    };

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      dragCounter--;

      if (dragCounter === 0) {
        setIsDragging(false);
        setIsValidFile(false);
      }
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      dragCounter = 0;
      setIsDragging(false);
      setIsValidFile(false);

      const files = Array.from(e.dataTransfer?.files || []);
      const jsonFile = files.find(
        (file) =>
          file.type === "application/json" || file.name.endsWith(".json")
      );

      if (jsonFile) {
        onFileDrop(jsonFile);
      }
    };

    document.addEventListener("dragenter", handleDragEnter);
    document.addEventListener("dragover", handleDragOver);
    document.addEventListener("dragleave", handleDragLeave);
    document.addEventListener("drop", handleDrop);

    return () => {
      document.removeEventListener("dragenter", handleDragEnter);
      document.removeEventListener("dragover", handleDragOver);
      document.removeEventListener("dragleave", handleDragLeave);
      document.removeEventListener("drop", handleDrop);
    };
  }, [onFileDrop]);

  if (!isDragging) return null;

  return (
    <>
      {/* Full screen overlay */}
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 pointer-events-none" />

      {/* Floating message that follows cursor */}
      <div
        className="fixed z-50 pointer-events-none transition-all duration-150 ease-out"
        style={{
          left: mousePosition.x + 20,
          top: mousePosition.y - 60,
          transform: "translateX(-50%)",
        }}
      >
        <div
          className={`
          px-4 py-3 rounded-lg shadow-lg border backdrop-blur-md
          flex items-center gap-3 min-w-max
          ${
            isValidFile
              ? "bg-green-500/90 border-green-400 text-white"
              : "bg-orange-500/90 border-orange-400 text-white"
          }
        `}
        >
          {isValidFile ? (
            <>
              <FileUp className="h-5 w-5" />
              <div className="text-sm font-medium">
                <div>Drop to import & auto-select</div>
                <div className="text-xs opacity-90">JSON canvas detected</div>
              </div>
            </>
          ) : (
            <>
              <Upload className="h-5 w-5" />
              <div className="text-sm font-medium">
                <div>Drop JSON files here</div>
                <div className="text-xs opacity-90">Canvas import ready</div>
              </div>
            </>
          )}
        </div>

        {/* Arrow pointing down to drop zone */}
        <div
          className={`
          w-0 h-0 mx-auto mt-1
          border-l-[8px] border-r-[8px] border-t-[8px]
          border-l-transparent border-r-transparent
          ${isValidFile ? "border-t-green-500/90" : "border-t-orange-500/90"}
        `}
        />
      </div>
    </>
  );
}
