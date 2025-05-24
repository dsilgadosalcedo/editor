"use client";

import React, { useState, useEffect } from "react";
import { FileUp, Upload } from "lucide-react";

interface DragDropOverlayProps {
  onFileDrop: (file: File) => void;
}

export default function DragDropOverlay({ onFileDrop }: DragDropOverlayProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isValidFile, setIsValidFile] = useState(false);

  useEffect(() => {
    let dragCounter = 0;

    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      dragCounter++;

      // Only show overlay for external file drops, not internal drag operations
      if (e.dataTransfer?.items && e.dataTransfer.items.length > 0) {
        // Check if this is an external file drag operation
        const hasFiles = Array.from(e.dataTransfer.items).some(
          (item) => item.kind === "file"
        );

        // Check if any of the files are JSON files
        const hasJsonFile = Array.from(e.dataTransfer.items).some(
          (item) =>
            item.type === "application/json" ||
            (item.kind === "file" && item.type === "")
        );

        // Only show the overlay if we have actual files being dragged
        // This prevents internal drag operations (like layer reordering) from triggering the overlay
        if (hasFiles) {
          setIsValidFile(hasJsonFile);
          setIsDragging(true);
        }
      }
    };

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
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
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 pointer-events-none flex items-center justify-center">
      <div className="text-white text-4xl font-bold">Drop to import</div>
    </div>
  );
}
