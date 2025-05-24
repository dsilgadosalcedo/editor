"use client";

import React, { useState, useEffect } from "react";
// Icons removed as they're not used in this component

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

        // Check if any of the files are JSON files or image files
        const hasJsonFile = Array.from(e.dataTransfer.items).some(
          (item) =>
            item.type === "application/json" ||
            (item.kind === "file" && item.type === "")
        );

        const hasImageFile = Array.from(e.dataTransfer.items).some((item) =>
          item.type.startsWith("image/")
        );

        // Only show the overlay if we have actual files being dragged
        // This prevents internal drag operations (like layer reordering) from triggering the overlay
        if (hasFiles) {
          setIsValidFile(hasJsonFile || hasImageFile);
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

      // Check for JSON files first
      const jsonFile = files.find(
        (file) =>
          file.type === "application/json" || file.name.endsWith(".json")
      );

      // Check for image files
      const imageFile = files.find((file) => file.type.startsWith("image/"));

      if (jsonFile) {
        onFileDrop(jsonFile);
      } else if (imageFile) {
        onFileDrop(imageFile);
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
      <div className="bg-black/50 rounded-lg p-8 text-center">
        <div className="text-white text-4xl font-bold mb-2">Drop to import</div>
        <div className="text-white/70 text-lg">
          {isValidFile ? "JSON canvas or image files" : "Unsupported file type"}
        </div>
      </div>
    </div>
  );
}
