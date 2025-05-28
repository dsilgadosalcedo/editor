/**
 * Color picker interaction service
 * Handles mouse events, dragging, and UI interactions for color pickers
 */

export interface ColorPickerDragState {
  isDragging: boolean;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
}

export interface ColorPickerDragHandlers {
  onSaturationChange: (saturation: number, value: number) => void;
  onHueChange: (hue: number) => void;
  onAlphaChange: (alpha: number) => void;
}

/**
 * Calculate saturation and value from mouse position on color area
 */
export const calculateSaturationValue = (
  mouseEvent: React.MouseEvent | MouseEvent,
  containerElement: HTMLElement
): { saturation: number; value: number } => {
  const rect = containerElement.getBoundingClientRect();
  const x = mouseEvent.clientX - rect.left;
  const y = mouseEvent.clientY - rect.top;

  const saturation = Math.max(0, Math.min(100, (x / rect.width) * 100));
  const value = Math.max(
    0,
    Math.min(100, ((rect.height - y) / rect.height) * 100)
  );

  return { saturation, value };
};

/**
 * Calculate hue from mouse position on hue slider
 */
export const calculateHue = (
  mouseEvent: React.MouseEvent | MouseEvent,
  containerElement: HTMLElement
): number => {
  const rect = containerElement.getBoundingClientRect();
  const x = mouseEvent.clientX - rect.left;

  const hue = Math.max(0, Math.min(360, (x / rect.width) * 360));
  return hue;
};

/**
 * Calculate alpha from mouse position on alpha slider
 */
export const calculateAlpha = (
  mouseEvent: React.MouseEvent | MouseEvent,
  containerElement: HTMLElement
): number => {
  const rect = containerElement.getBoundingClientRect();
  const x = mouseEvent.clientX - rect.left;

  const alpha = Math.max(0, Math.min(1, x / rect.width));
  return alpha;
};

/**
 * Create mouse event handlers for saturation/value area
 */
export const createSaturationHandlers = (
  containerRef: React.RefObject<HTMLDivElement>,
  onSaturationChange: (saturation: number, value: number) => void,
  setIsDragging: (isDragging: boolean) => void
) => {
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!containerRef.current) return;

    const { saturation, value } = calculateSaturationValue(
      e,
      containerRef.current
    );
    onSaturationChange(saturation, value);
    setIsDragging(true);

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;

      const { saturation, value } = calculateSaturationValue(
        e,
        containerRef.current
      );
      onSaturationChange(saturation, value);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  return { handleMouseDown };
};

/**
 * Create mouse event handlers for hue slider
 */
export const createHueHandlers = (
  containerRef: React.RefObject<HTMLDivElement>,
  onHueChange: (hue: number) => void,
  setIsDragging: (isDragging: boolean) => void
) => {
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!containerRef.current) return;

    const hue = calculateHue(e, containerRef.current);
    onHueChange(hue);
    setIsDragging(true);

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;

      const hue = calculateHue(e, containerRef.current);
      onHueChange(hue);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  return { handleMouseDown };
};

/**
 * Create mouse event handlers for alpha slider
 */
export const createAlphaHandlers = (
  containerRef: React.RefObject<HTMLDivElement>,
  onAlphaChange: (alpha: number) => void,
  setIsDragging: (isDragging: boolean) => void
) => {
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!containerRef.current) return;

    const alpha = calculateAlpha(e, containerRef.current);
    onAlphaChange(alpha);
    setIsDragging(true);

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;

      const alpha = calculateAlpha(e, containerRef.current);
      onAlphaChange(alpha);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  return { handleMouseDown };
};

/**
 * Create drag handlers for moveable color picker
 */
export const createPickerDragHandlers = (
  pickerRef: React.RefObject<HTMLDivElement>,
  onPositionChange: (x: number, y: number) => void,
  setIsDragging: (isDragging: boolean) => void,
  setDragOffset?: (offset: { x: number; y: number }) => void
) => {
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!pickerRef.current) return;

    const rect = pickerRef.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;

    if (setDragOffset) {
      setDragOffset({ x: offsetX, y: offsetY });
    }
    setIsDragging(true);

    const handleMouseMove = (e: MouseEvent) => {
      const newX = e.clientX - offsetX;
      const newY = e.clientY - offsetY;

      // Keep picker within viewport bounds
      const maxX = window.innerWidth - (pickerRef.current?.offsetWidth || 300);
      const maxY =
        window.innerHeight - (pickerRef.current?.offsetHeight || 400);

      const constrainedX = Math.max(0, Math.min(maxX, newX));
      const constrainedY = Math.max(0, Math.min(maxY, newY));

      onPositionChange(constrainedX, constrainedY);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  return { handleMouseDown };
};

/**
 * Handle eyedropper API for color picking from screen
 */
export const handleEyeDropper = async (
  onColorChange: (color: string) => void
): Promise<boolean> => {
  if (!("EyeDropper" in window)) {
    console.warn("EyeDropper API not supported");
    return false;
  }

  try {
    // @ts-ignore - EyeDropper is not yet in TypeScript definitions
    const eyeDropper = new EyeDropper();
    const result = await eyeDropper.open();

    if (result?.sRGBHex) {
      onColorChange(result.sRGBHex);
      return true;
    }
  } catch (error) {
    console.warn("EyeDropper cancelled or failed:", error);
  }

  return false;
};

/**
 * Throttle function for color updates during dragging
 */
export const createThrottledUpdate = (
  updateFn: (...args: any[]) => void,
  delay: number = 16 // ~60fps
) => {
  let lastUpdate = 0;
  let timeoutId: number | null = null;

  return (...args: any[]) => {
    const now = Date.now();

    if (now - lastUpdate >= delay) {
      updateFn(...args);
      lastUpdate = now;
    } else {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      timeoutId = window.setTimeout(() => {
        updateFn(...args);
        lastUpdate = Date.now();
      }, delay - (now - lastUpdate));
    }
  };
};
