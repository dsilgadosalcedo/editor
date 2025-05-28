/**
 * UI interaction service for canvas components
 * Handles complex mouse, keyboard, and touch interactions
 */

export interface MousePosition {
  x: number;
  y: number;
}

export interface DragState {
  isDragging: boolean;
  startPosition: MousePosition;
  currentPosition: MousePosition;
  deltaX: number;
  deltaY: number;
}

export interface TouchState {
  isTouching: boolean;
  startPosition: MousePosition;
  currentPosition: MousePosition;
  deltaX: number;
  deltaY: number;
}

export interface KeyboardState {
  isShiftPressed: boolean;
  isCtrlPressed: boolean;
  isAltPressed: boolean;
  isMetaPressed: boolean;
}

/**
 * Get mouse position relative to an element
 */
export const getRelativeMousePosition = (
  event: React.MouseEvent | MouseEvent,
  element: HTMLElement
): MousePosition => {
  const rect = element.getBoundingClientRect();
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  };
};

/**
 * Get touch position relative to an element
 */
export const getRelativeTouchPosition = (
  event: React.TouchEvent | TouchEvent,
  element: HTMLElement
): MousePosition => {
  const rect = element.getBoundingClientRect();
  const touch = event.touches[0] || event.changedTouches[0];
  return {
    x: touch.clientX - rect.left,
    y: touch.clientY - rect.top,
  };
};

/**
 * Calculate distance between two points
 */
export const calculateDistance = (
  point1: MousePosition,
  point2: MousePosition
): number => {
  const dx = point2.x - point1.x;
  const dy = point2.y - point1.y;
  return Math.sqrt(dx * dx + dy * dy);
};

/**
 * Calculate angle between two points in degrees
 */
export const calculateAngle = (
  center: MousePosition,
  point: MousePosition
): number => {
  const dx = point.x - center.x;
  const dy = point.y - center.y;
  return (Math.atan2(dy, dx) * 180) / Math.PI;
};

/**
 * Constrain a value between min and max
 */
export const clamp = (value: number, min: number, max: number): number => {
  return Math.max(min, Math.min(max, value));
};

/**
 * Round a number to a specific precision
 */
export const roundToPrecision = (value: number, precision: number): number => {
  const factor = Math.pow(10, precision);
  return Math.round(value * factor) / factor;
};

/**
 * Check if a point is inside a rectangle
 */
export const isPointInRectangle = (
  point: MousePosition,
  rectangle: {
    x: number;
    y: number;
    width: number;
    height: number;
  }
): boolean => {
  return (
    point.x >= rectangle.x &&
    point.x <= rectangle.x + rectangle.width &&
    point.y >= rectangle.y &&
    point.y <= rectangle.y + rectangle.height
  );
};

/**
 * Get current keyboard modifier state
 */
export const getKeyboardState = (
  event: React.KeyboardEvent | KeyboardEvent | React.MouseEvent | MouseEvent
): KeyboardState => {
  return {
    isShiftPressed: event.shiftKey,
    isCtrlPressed: event.ctrlKey,
    isAltPressed: event.altKey,
    isMetaPressed: event.metaKey,
  };
};

/**
 * Create a drag handler with callback support
 */
export const createDragHandler = (
  element: HTMLElement | null,
  onDragStart?: (position: MousePosition, state: KeyboardState) => void,
  onDragMove?: (
    position: MousePosition,
    delta: MousePosition,
    state: KeyboardState
  ) => void,
  onDragEnd?: (position: MousePosition, state: KeyboardState) => void
) => {
  if (!element) return () => {};

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const startPosition = getRelativeMousePosition(e, element);
    const keyboardState = getKeyboardState(e);

    onDragStart?.(startPosition, keyboardState);

    const handleMouseMove = (e: MouseEvent) => {
      const currentPosition = getRelativeMousePosition(e, element);
      const delta = {
        x: currentPosition.x - startPosition.x,
        y: currentPosition.y - startPosition.y,
      };
      const currentKeyboardState = getKeyboardState(e);

      onDragMove?.(currentPosition, delta, currentKeyboardState);
    };

    const handleMouseUp = (e: MouseEvent) => {
      const finalPosition = getRelativeMousePosition(e, element);
      const finalKeyboardState = getKeyboardState(e);

      onDragEnd?.(finalPosition, finalKeyboardState);

      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  return handleMouseDown;
};

/**
 * Create a touch handler with callback support
 */
export const createTouchHandler = (
  element: HTMLElement | null,
  onTouchStart?: (position: MousePosition) => void,
  onTouchMove?: (position: MousePosition, delta: MousePosition) => void,
  onTouchEnd?: (position: MousePosition) => void
) => {
  if (!element) return () => {};

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const startPosition = getRelativeTouchPosition(e, element);
    onTouchStart?.(startPosition);

    const handleTouchMove = (e: TouchEvent) => {
      const currentPosition = getRelativeTouchPosition(e, element);
      const delta = {
        x: currentPosition.x - startPosition.x,
        y: currentPosition.y - startPosition.y,
      };

      onTouchMove?.(currentPosition, delta);
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const finalPosition = getRelativeTouchPosition(e, element);
      onTouchEnd?.(finalPosition);

      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };

    document.addEventListener("touchmove", handleTouchMove, { passive: false });
    document.addEventListener("touchend", handleTouchEnd);
  };

  return handleTouchStart;
};

/**
 * Create a double-click handler with delay support
 */
export const createDoubleClickHandler = (
  callback: (position: MousePosition, state: KeyboardState) => void,
  delay: number = 300
) => {
  let clickCount = 0;
  let clickTimer: number | null = null;
  let lastClickPosition: MousePosition = { x: 0, y: 0 };

  return (e: React.MouseEvent, element: HTMLElement) => {
    const currentPosition = getRelativeMousePosition(e, element);
    const keyboardState = getKeyboardState(e);

    // Check if clicks are close together (within 10px)
    const distanceFromLastClick = calculateDistance(
      lastClickPosition,
      currentPosition
    );

    if (distanceFromLastClick > 10) {
      // Reset if clicks are too far apart
      clickCount = 0;
    }

    clickCount++;
    lastClickPosition = currentPosition;

    if (clickTimer) {
      clearTimeout(clickTimer);
    }

    if (clickCount === 2) {
      // Double click detected
      callback(currentPosition, keyboardState);
      clickCount = 0;
      clickTimer = null;
    } else {
      // Wait for potential second click
      clickTimer = window.setTimeout(() => {
        clickCount = 0;
        clickTimer = null;
      }, delay);
    }
  };
};

/**
 * Create a keyboard event handler
 */
export const createKeyboardHandler = (
  onKeyDown?: (key: string, state: KeyboardState) => void,
  onKeyUp?: (key: string, state: KeyboardState) => void
) => {
  const handleKeyDown = (e: KeyboardEvent) => {
    const keyboardState = getKeyboardState(e);
    onKeyDown?.(e.key, keyboardState);
  };

  const handleKeyUp = (e: KeyboardEvent) => {
    const keyboardState = getKeyboardState(e);
    onKeyUp?.(e.key, keyboardState);
  };

  return { handleKeyDown, handleKeyUp };
};

/**
 * Debounce function for expensive operations
 */
export const createDebounced = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): T => {
  let timeoutId: number | null = null;

  return ((...args: any[]) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = window.setTimeout(() => {
      func(...args);
    }, delay);
  }) as T;
};

/**
 * Throttle function for high-frequency events
 */
export const createThrottled = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): T => {
  let lastCall = 0;
  let timeoutId: number | null = null;

  return ((...args: any[]) => {
    const now = Date.now();

    if (now - lastCall >= delay) {
      func(...args);
      lastCall = now;
    } else {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      timeoutId = window.setTimeout(() => {
        func(...args);
        lastCall = Date.now();
      }, delay - (now - lastCall));
    }
  }) as T;
};

/**
 * Create a resize observer for responsive behaviors
 */
export const createResizeObserver = (
  element: HTMLElement | null,
  callback: (width: number, height: number) => void
): (() => void) => {
  if (!element || typeof ResizeObserver === "undefined") {
    return () => {};
  }

  const observer = new ResizeObserver((entries) => {
    for (const entry of entries) {
      const { width, height } = entry.contentRect;
      callback(width, height);
    }
  });

  observer.observe(element);

  return () => {
    observer.disconnect();
  };
};

/**
 * Prevent default behaviors for specific events
 */
export const preventDefaults = (e: Event) => {
  e.preventDefault();
  e.stopPropagation();
};

/**
 * Check if element or its parents have a specific class
 */
export const hasParentWithClass = (
  element: HTMLElement | null,
  className: string
): boolean => {
  if (!element) return false;

  if (element.classList.contains(className)) {
    return true;
  }

  return hasParentWithClass(element.parentElement, className);
};
