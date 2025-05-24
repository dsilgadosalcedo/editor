import { useCallback } from "react";
import { CanvasElementData } from "@/features/canvas/store/useCanvasStore";
import {
  copyToFigmaClipboard,
  isClipboardSupported,
  isSVGClipboardSupported,
} from "@/lib/figma-clipboard";

interface UseFigmaClipboardOptions {
  includeBackground?: boolean;
  backgroundColor?: string;
  padding?: number;
  scale?: number;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export const useFigmaClipboard = (options: UseFigmaClipboardOptions = {}) => {
  const {
    includeBackground = false,
    backgroundColor = "#ffffff",
    padding = 20,
    scale = 1,
    onSuccess,
    onError,
  } = options;

  const copyElements = useCallback(
    async (elements: CanvasElementData[]) => {
      try {
        if (!isClipboardSupported()) {
          throw new Error("Clipboard API is not supported in this browser");
        }

        if (elements.length === 0) {
          throw new Error("No elements selected to copy");
        }

        await copyToFigmaClipboard(elements, {
          includeBackground,
          backgroundColor,
          padding,
          scale,
        });

        onSuccess?.();
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to copy to clipboard";
        onError?.(errorMessage);
        console.error("Copy to Figma failed:", error);
      }
    },
    [includeBackground, backgroundColor, padding, scale, onSuccess, onError]
  );

  return {
    copyElements,
    isSupported: isClipboardSupported(),
    isSVGSupported: isSVGClipboardSupported(),
  };
};
