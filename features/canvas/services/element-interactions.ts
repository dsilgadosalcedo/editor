/**
 * Element interaction service for canvas elements
 * Handles complex drag, resize, rotate, and other interaction logic
 */

export interface ElementDragState {
  isDragging: boolean;
  startX: number;
  startY: number;
}

export interface ResizeState {
  isResizing: boolean;
  direction: string;
  startWidth: number;
  startHeight: number;
  startX: number;
  startY: number;
}

export interface RotationState {
  isRotating: boolean;
  startX: number;
  startY: number;
  startRotation: number;
  centerX: number;
  centerY: number;
}

export interface FontScaleState {
  isFontScaling: boolean;
  startX: number;
  startY: number;
  startFontSize: number;
  startLineHeight: number;
  startWidth: number;
  startHeight: number;
}

export interface CornerRadiusState {
  isCornerRadiusDragging: boolean;
  startX: number;
  startY: number;
  startCornerRadius: number;
}

/**
 * Create drag handlers for element movement
 */
export const createElementDragHandlers = (
  elementId: string,
  onMove: (dx: number, dy: number) => void,
  onMoveNoHistory: (dx: number, dy: number) => void,
  onAddToHistory: (() => void) | undefined,
  zoom: number,
  dragState: { isDragging: boolean },
  setDragState: React.Dispatch<React.SetStateAction<ElementDragState>>,
  setPrepareDrag: (prepare: boolean) => void,
  setJustDragged: (dragged: boolean) => void
) => {
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Skip if clicking on handles or toolbar
    const target = e.target as HTMLElement;
    if (target.closest("[data-handle]") || target.closest("[data-toolbar]")) {
      return;
    }

    setPrepareDrag(true);
    const startX = e.clientX;
    const startY = e.clientY;
    let lastX = startX;
    let lastY = startY;
    let currentDragState: ElementDragState = {
      isDragging: false,
      startX,
      startY,
    };
    setDragState(currentDragState);

    const handleMouseMove = (e: MouseEvent) => {
      const totalDx = (e.clientX - startX) / (zoom / 100);
      const totalDy = (e.clientY - startY) / (zoom / 100);

      // Start dragging if moved more than 3 pixels
      if (
        !currentDragState.isDragging &&
        (Math.abs(totalDx) > 3 || Math.abs(totalDy) > 3)
      ) {
        currentDragState = { ...currentDragState, isDragging: true };
        setDragState(currentDragState);
        setPrepareDrag(false);
      }

      if (currentDragState.isDragging) {
        // Calculate incremental movement since last frame
        const dx = (e.clientX - lastX) / (zoom / 100);
        const dy = (e.clientY - lastY) / (zoom / 100);
        onMoveNoHistory(dx, dy);

        // Update last position
        lastX = e.clientX;
        lastY = e.clientY;
      }
    };

    const handleMouseUp = () => {
      setDragState((prev) => ({ ...prev, isDragging: false }));
      setPrepareDrag(false);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);

      if (currentDragState.isDragging) {
        onAddToHistory?.();
        setJustDragged(true);
        setTimeout(() => setJustDragged(false), 100);
      }
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const touch = e.touches[0];
    setPrepareDrag(true);
    const startX = touch.clientX;
    const startY = touch.clientY;
    let lastX = startX;
    let lastY = startY;
    let currentDragState: ElementDragState = {
      isDragging: false,
      startX,
      startY,
    };
    setDragState(currentDragState);

    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      const totalDx = (touch.clientX - startX) / (zoom / 100);
      const totalDy = (touch.clientY - startY) / (zoom / 100);

      if (
        !currentDragState.isDragging &&
        (Math.abs(totalDx) > 3 || Math.abs(totalDy) > 3)
      ) {
        currentDragState = { ...currentDragState, isDragging: true };
        setDragState(currentDragState);
        setPrepareDrag(false);
      }

      if (currentDragState.isDragging) {
        // Calculate incremental movement since last frame
        const dx = (touch.clientX - lastX) / (zoom / 100);
        const dy = (touch.clientY - lastY) / (zoom / 100);
        onMoveNoHistory(dx, dy);

        // Update last position
        lastX = touch.clientX;
        lastY = touch.clientY;
      }
    };

    const handleTouchEnd = () => {
      setDragState((prev) => ({ ...prev, isDragging: false }));
      setPrepareDrag(false);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);

      if (currentDragState.isDragging) {
        onAddToHistory?.();
        setJustDragged(true);
        setTimeout(() => setJustDragged(false), 100);
      }
    };

    document.addEventListener("touchmove", handleTouchMove, { passive: false });
    document.addEventListener("touchend", handleTouchEnd);
  };

  return { handleMouseDown, handleTouchStart };
};

/**
 * Create resize handlers for element resizing
 */
export const createElementResizeHandlers = (
  element: any,
  onResize: (
    width: number,
    height: number,
    maintainAspectRatio?: boolean
  ) => void,
  onResizeNoHistory: (width: number, height: number) => void,
  onMove: (dx: number, dy: number) => void,
  onMoveNoHistory: (dx: number, dy: number) => void,
  onAddToHistory: (() => void) | undefined,
  zoom: number,
  setResizeState: React.Dispatch<React.SetStateAction<ResizeState>>,
  transformRotatedResize: (
    dx: number,
    dy: number,
    direction: string,
    rotation: number
  ) => { dx: number; dy: number },
  onTextResizingChange?: (mode: "auto-width" | "auto-height" | "fixed") => void
) => {
  const handleResizeStart = (direction: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const startX = e.clientX;
    const startY = e.clientY;
    const {
      width: startWidth,
      height: startHeight,
      x: startElementX,
      y: startElementY,
    } = element;

    setResizeState({
      isResizing: true,
      direction,
      startWidth,
      startHeight,
      startX: startElementX,
      startY: startElementY,
    });

    let lastMoveX = 0;
    let lastMoveY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      let rawDx = (e.clientX - startX) / (zoom / 100);
      let rawDy = (e.clientY - startY) / (zoom / 100);

      // Apply rotation transformation if element is rotated
      if (element.rotation) {
        const rotated = transformRotatedResize(
          rawDx,
          rawDy,
          direction,
          element.rotation
        );
        rawDx = rotated.dx;
        rawDy = rotated.dy;
      }

      let newWidth = startWidth;
      let newHeight = startHeight;

      // Calculate new dimensions based on resize direction
      if (direction.includes("e")) newWidth = Math.max(10, startWidth + rawDx);
      if (direction.includes("w")) newWidth = Math.max(10, startWidth - rawDx);
      if (direction.includes("s"))
        newHeight = Math.max(10, startHeight + rawDy);
      if (direction.includes("n"))
        newHeight = Math.max(10, startHeight - rawDy);

      // Maintain aspect ratio if Shift is held
      if (
        e.shiftKey &&
        (direction === "nw" ||
          direction === "ne" ||
          direction === "sw" ||
          direction === "se")
      ) {
        const aspectRatio = startWidth / startHeight;
        if (Math.abs(rawDx) > Math.abs(rawDy)) {
          newHeight = newWidth / aspectRatio;
        } else {
          newWidth = newHeight * aspectRatio;
        }
      }

      let totalMoveX = 0;
      let totalMoveY = 0;
      if (direction.includes("w")) {
        totalMoveX = startWidth - newWidth;
      }
      if (direction.includes("n")) {
        totalMoveY = startHeight - newHeight;
      }

      const incrementalMoveX = totalMoveX - lastMoveX;
      const incrementalMoveY = totalMoveY - lastMoveY;
      lastMoveX = totalMoveX;
      lastMoveY = totalMoveY;

      if (incrementalMoveX !== 0 || incrementalMoveY !== 0) {
        onMoveNoHistory(incrementalMoveX, incrementalMoveY);
      }

      onResizeNoHistory(newWidth, newHeight);
    };

    const handleMouseUp = () => {
      onAddToHistory?.();
      setResizeState((prev) => ({ ...prev, isResizing: false }));

      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleResizeTouchStart = (direction: string, e: React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const touch = e.touches[0];
    const startX = touch.clientX;
    const startY = touch.clientY;
    const {
      width: startWidth,
      height: startHeight,
      x: startElementX,
      y: startElementY,
    } = element;

    setResizeState({
      isResizing: true,
      direction,
      startWidth,
      startHeight,
      startX: startElementX,
      startY: startElementY,
    });

    let lastMoveX = 0;
    let lastMoveY = 0;

    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      let rawDx = (touch.clientX - startX) / (zoom / 100);
      let rawDy = (touch.clientY - startY) / (zoom / 100);

      if (element.rotation) {
        const rotated = transformRotatedResize(
          rawDx,
          rawDy,
          direction,
          element.rotation
        );
        rawDx = rotated.dx;
        rawDy = rotated.dy;
      }

      let newWidth = startWidth;
      let newHeight = startHeight;

      if (direction.includes("e")) newWidth = Math.max(10, startWidth + rawDx);
      if (direction.includes("w")) newWidth = Math.max(10, startWidth - rawDx);
      if (direction.includes("s"))
        newHeight = Math.max(10, startHeight + rawDy);
      if (direction.includes("n"))
        newHeight = Math.max(10, startHeight - rawDy);

      let totalMoveX = 0;
      let totalMoveY = 0;
      if (direction.includes("w")) {
        totalMoveX = startWidth - newWidth;
      }
      if (direction.includes("n")) {
        totalMoveY = startHeight - newHeight;
      }

      const incrementalMoveX = totalMoveX - lastMoveX;
      const incrementalMoveY = totalMoveY - lastMoveY;
      lastMoveX = totalMoveX;
      lastMoveY = totalMoveY;

      if (incrementalMoveX !== 0 || incrementalMoveY !== 0) {
        onMoveNoHistory(incrementalMoveX, incrementalMoveY);
      }

      onResizeNoHistory(newWidth, newHeight);
    };

    const handleTouchEnd = () => {
      onAddToHistory?.();
      setResizeState((prev) => ({ ...prev, isResizing: false }));

      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };

    document.addEventListener("touchmove", handleTouchMove, { passive: false });
    document.addEventListener("touchend", handleTouchEnd);
  };

  return { handleResizeStart, handleResizeTouchStart };
};

/**
 * Create rotation handlers for element rotation
 */
export const createElementRotationHandlers = (
  element: any,
  onUpdateRotation: (rotation: number) => void,
  onUpdateRotationNoHistory: (rotation: number) => void,
  onAddToHistory: (() => void) | undefined,
  zoom: number,
  setRotationState: React.Dispatch<React.SetStateAction<RotationState>>
) => {
  const handleRotationStart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const startX = e.clientX;
    const startY = e.clientY;
    const startRotation = element.rotation || 0;
    const centerX = element.x + element.width / 2;
    const centerY = element.y + element.height / 2;

    setRotationState({
      isRotating: true,
      startX,
      startY,
      startRotation,
      centerX,
      centerY,
    });

    const handleMouseMove = (e: MouseEvent) => {
      const currentX = e.clientX;
      const currentY = e.clientY;

      // Calculate angle from center to current mouse position
      const startAngle = Math.atan2(startY - centerY, startX - centerX);
      const currentAngle = Math.atan2(currentY - centerY, currentX - centerX);
      let deltaAngle = (currentAngle - startAngle) * (180 / Math.PI);

      let newRotation = startRotation + deltaAngle;

      // Snap to 15-degree increments if Shift is held
      if (e.shiftKey) {
        newRotation = Math.round(newRotation / 15) * 15;
      }

      // Normalize to 0-360 range
      newRotation = ((newRotation % 360) + 360) % 360;

      onUpdateRotationNoHistory(newRotation);
    };

    const handleMouseUp = (e: MouseEvent) => {
      const currentX = e.clientX;
      const currentY = e.clientY;

      const startAngle = Math.atan2(startY - centerY, startX - centerX);
      const currentAngle = Math.atan2(currentY - centerY, currentX - centerX);
      let deltaAngle = (currentAngle - startAngle) * (180 / Math.PI);

      let newRotation = startRotation + deltaAngle;

      if (e.shiftKey) {
        newRotation = Math.round(newRotation / 15) * 15;
      }

      newRotation = ((newRotation % 360) + 360) % 360;

      onUpdateRotation(newRotation);
      onAddToHistory?.();
      setRotationState((prev) => ({ ...prev, isRotating: false }));

      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  return { handleRotationStart };
};

/**
 * Create font scale handlers for text elements
 */
export const createFontScaleHandlers = (
  element: any,
  onUpdateFontSize: (fontSize: number) => void,
  onUpdateLineHeight: (lineHeight: number) => void,
  onResize: (
    width: number,
    height: number,
    maintainAspectRatio?: boolean
  ) => void,
  zoom: number,
  setFontScaleState: React.Dispatch<React.SetStateAction<FontScaleState>>
) => {
  const handleFontScaleDragStart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const startX = e.clientX;
    const startY = e.clientY;
    const startFontSize = element.fontSize || 16;
    const startLineHeight = element.lineHeight || startFontSize * 1.2;
    const startWidth = element.width;
    const startHeight = element.height;

    setFontScaleState({
      isFontScaling: true,
      startX,
      startY,
      startFontSize,
      startLineHeight,
      startWidth,
      startHeight,
    });

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = (e.clientX - startX) / (zoom / 100);
      const deltaY = (e.clientY - startY) / (zoom / 100);
      const scale = 1 + (deltaX + deltaY) / 100;

      const newFontSize = Math.max(8, Math.min(200, startFontSize * scale));
      const newLineHeight = startLineHeight * scale;

      onUpdateFontSize(newFontSize);
      onUpdateLineHeight(newLineHeight);

      // Also resize the element proportionally
      const newWidth = startWidth * scale;
      const newHeight = startHeight * scale;
      onResize(newWidth, newHeight, false);
    };

    const handleMouseUp = () => {
      setFontScaleState((prev) => ({ ...prev, isFontScaling: false }));
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  return { handleFontScaleDragStart };
};

/**
 * Create corner radius handlers for rectangle and image elements
 */
export const createCornerRadiusHandlers = (
  element: any,
  onUpdateCornerRadius: (radius: number) => void,
  onUpdateCornerRadiusNoHistory: (radius: number) => void,
  onAddToHistory: (() => void) | undefined,
  zoom: number,
  setCornerRadiusState: React.Dispatch<React.SetStateAction<CornerRadiusState>>
) => {
  const handleCornerRadiusDragStart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const startX = e.clientX;
    const startY = e.clientY;
    const startCornerRadius = element.cornerRadius || 0;

    setCornerRadiusState({
      isCornerRadiusDragging: true,
      startX,
      startY,
      startCornerRadius,
    });

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = (e.clientX - startX) / (zoom / 100);
      const deltaY = (e.clientY - startY) / (zoom / 100);
      const delta = (deltaX + deltaY) / 2;

      const maxRadius = Math.min(element.width, element.height) / 2;
      const newRadius = Math.max(
        0,
        Math.min(maxRadius, startCornerRadius + delta)
      );

      onUpdateCornerRadiusNoHistory(newRadius);
    };

    const handleMouseUp = (e: MouseEvent) => {
      const deltaX = (e.clientX - startX) / (zoom / 100);
      const deltaY = (e.clientY - startY) / (zoom / 100);
      const delta = (deltaX + deltaY) / 2;

      const maxRadius = Math.min(element.width, element.height) / 2;
      const newRadius = Math.max(
        0,
        Math.min(maxRadius, startCornerRadius + delta)
      );

      onUpdateCornerRadius(newRadius);
      onAddToHistory?.();
      setCornerRadiusState((prev) => ({
        ...prev,
        isCornerRadiusDragging: false,
      }));

      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  return { handleCornerRadiusDragStart };
};
