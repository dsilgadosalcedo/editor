import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import React, {
  useRef,
  createContext,
  useContext,
  useState,
  ReactNode,
} from "react";
import { Blend } from "lucide-react";
import CustomColorPicker from "./CustomColorPicker";
import OpacityPicker from "./OpacityPicker";

interface ColorPickerContextType {
  openColorPicker: (
    color: string,
    onChange: (color: string) => void,
    position: { x: number; y: number },
    layerName?: string,
    propertyName?: string
  ) => void;
  closeColorPicker: () => void;
  openOpacityPicker: (
    color: string,
    onChange: (color: string) => void,
    position: { x: number; y: number }
  ) => void;
  closeOpacityPicker: () => void;
}

const ColorPickerContext = createContext<ColorPickerContextType | null>(null);

interface ColorPickerProviderProps {
  children: ReactNode;
}

export const ColorPickerProvider: React.FC<ColorPickerProviderProps> = ({
  children,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [currentColor, setCurrentColor] = useState("#000000");
  const [currentOnChange, setCurrentOnChange] = useState<
    ((color: string) => void) | null
  >(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [layerName, setLayerName] = useState<string | undefined>(undefined);
  const [propertyName, setPropertyName] = useState<string | undefined>(
    undefined
  );

  // Opacity picker state
  const [isOpacityOpen, setIsOpacityOpen] = useState(false);
  const [opacityPosition, setOpacityPosition] = useState({ x: 0, y: 0 });
  const [currentOpacityColor, setCurrentOpacityColor] = useState("#000000");
  const [currentOpacityOnChange, setCurrentOpacityOnChange] = useState<
    ((color: string) => void) | null
  >(null);
  const [isOpacityTransitioning, setIsOpacityTransitioning] = useState(false);

  const openColorPicker = (
    color: string,
    onChange: (color: string) => void,
    newPosition: { x: number; y: number },
    newLayerName?: string,
    newPropertyName?: string
  ) => {
    const wasAlreadyOpen = isOpen;

    setCurrentColor(color);
    setCurrentOnChange(() => onChange);
    setLayerName(newLayerName);
    setPropertyName(newPropertyName);

    if (wasAlreadyOpen) {
      // If already open, smoothly transition to new position
      setIsTransitioning(true);
      setPosition(newPosition);

      // Reset transition flag after animation completes
      setTimeout(() => {
        setIsTransitioning(false);
      }, 300); // Match the CSS transition duration
    } else {
      // If not open, just set position and open immediately
      setPosition(newPosition);
      setIsOpen(true);
    }
  };

  const closeColorPicker = () => {
    setIsOpen(false);
    setCurrentOnChange(null);
    setIsTransitioning(false);
    setLayerName(undefined);
    setPropertyName(undefined);
  };

  const openOpacityPicker = (
    color: string,
    onChange: (color: string) => void,
    newPosition: { x: number; y: number }
  ) => {
    const wasAlreadyOpen = isOpacityOpen;

    setCurrentOpacityColor(color);
    setCurrentOpacityOnChange(() => onChange);

    if (wasAlreadyOpen) {
      setIsOpacityTransitioning(true);
      setOpacityPosition(newPosition);

      setTimeout(() => {
        setIsOpacityTransitioning(false);
      }, 300);
    } else {
      setOpacityPosition(newPosition);
      setIsOpacityOpen(true);
    }
  };

  const closeOpacityPicker = () => {
    setIsOpacityOpen(false);
    setCurrentOpacityOnChange(null);
    setIsOpacityTransitioning(false);
  };

  // Close pickers when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;

      // Check if clicked outside color picker
      if (isOpen) {
        if (
          !target.closest("[data-color-picker]") &&
          !target.closest("[data-color-picker-trigger]")
        ) {
          closeColorPicker();
        }
      }

      // Check if clicked outside opacity picker
      if (isOpacityOpen) {
        if (
          !target.closest("[data-opacity-picker]") &&
          !target.closest("[data-color-picker-trigger]")
        ) {
          closeOpacityPicker();
        }
      }
    };

    if (isOpen || isOpacityOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, isOpacityOpen]);

  const handleColorChange = (color: string) => {
    setCurrentColor(color);
    if (currentOnChange) {
      currentOnChange(color);
    }
  };

  const handleOpacityChange = (color: string) => {
    setCurrentOpacityColor(color);
    if (currentOpacityOnChange) {
      currentOpacityOnChange(color);
    }
  };

  return (
    <ColorPickerContext.Provider
      value={{
        openColorPicker,
        closeColorPicker,
        openOpacityPicker,
        closeOpacityPicker,
      }}
    >
      {children}
      <CustomColorPicker
        isOpen={isOpen}
        onClose={closeColorPicker}
        color={currentColor}
        onChange={handleColorChange}
        position={position}
        isTransitioning={isTransitioning}
        layerName={layerName}
        propertyName={propertyName}
      />
      <OpacityPicker
        isOpen={isOpacityOpen}
        onClose={closeOpacityPicker}
        color={currentOpacityColor}
        onChange={handleOpacityChange}
        position={opacityPosition}
        isTransitioning={isOpacityTransitioning}
      />
    </ColorPickerContext.Provider>
  );
};

const useColorPicker = () => {
  const context = useContext(ColorPickerContext);
  if (!context) {
    throw new Error("useColorPicker must be used within a ColorPickerProvider");
  }
  return context;
};

export { useColorPicker };

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  className?: string;
  "aria-label"?: string;
  layerName?: string;
  propertyName?: string;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({
  value,
  onChange,
  className = "",
  "aria-label": ariaLabel,
  layerName,
  propertyName,
}) => {
  const { openColorPicker, openOpacityPicker } = useColorPicker();
  const colorButtonRef = useRef<HTMLButtonElement>(null);
  const opacityButtonRef = useRef<HTMLButtonElement>(null);

  // Convert any color to hex for display (without #)
  const getHexDisplay = (color: string): string => {
    const trimmed = color.trim().toLowerCase();

    if (trimmed.startsWith("#")) {
      return trimmed.slice(1).toUpperCase();
    } else if (trimmed.startsWith("rgb")) {
      const match = trimmed.match(/rgba?\(([^)]+)\)/);
      if (match) {
        const values = match[1].split(",").map((v) => parseInt(v.trim()));
        return `${values[0].toString(16).padStart(2, "0")}${values[1]
          .toString(16)
          .padStart(2, "0")}${values[2]
          .toString(16)
          .padStart(2, "0")}`.toUpperCase();
      }
    }

    return color.replace("#", "").toUpperCase();
  };

  const handleColorClick = (e: React.MouseEvent) => {
    if (colorButtonRef.current) {
      const rect = colorButtonRef.current.getBoundingClientRect();
      const colorPickerWidth = 280;
      const colorPickerHeight = 400;
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const gap = 8;

      // Calculate distances from each edge
      const distanceFromTop = rect.top;
      const distanceFromBottom = viewportHeight - rect.bottom;
      const distanceFromLeft = rect.left;
      const distanceFromRight = viewportWidth - rect.right;

      // Position horizontally (prefer left alignment, but adjust if needed)
      let x = rect.left;
      if (distanceFromRight < colorPickerWidth) {
        // Not enough space on the right, position to the left
        x = rect.right - colorPickerWidth;
      }
      // Ensure it stays within viewport
      x = Math.max(8, Math.min(x, viewportWidth - colorPickerWidth - 8));

      // Position vertically based on available space
      let y;
      if (distanceFromBottom >= colorPickerHeight + gap) {
        // Enough space below - position below
        y = rect.bottom + gap;
      } else if (distanceFromTop >= colorPickerHeight + gap) {
        // Enough space above - position above
        y = rect.top - colorPickerHeight - gap;
      } else {
        // Not enough space in either direction - position where there's more space
        if (distanceFromBottom > distanceFromTop) {
          // More space below
          y = rect.bottom + gap;
        } else {
          // More space above
          y = Math.max(8, rect.top - colorPickerHeight - gap);
        }
      }

      // Final bounds check
      y = Math.max(8, Math.min(y, viewportHeight - colorPickerHeight - 8));

      openColorPicker(value, onChange, { x, y }, layerName, propertyName);
    }
  };

  const handleOpacityClick = (e: React.MouseEvent) => {
    if (opacityButtonRef.current) {
      const rect = opacityButtonRef.current.getBoundingClientRect();
      const pickerWidth = 200;
      const pickerHeight = 80;
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const gap = 8;

      // Calculate distances from each edge
      const distanceFromTop = rect.top;
      const distanceFromBottom = viewportHeight - rect.bottom;
      const distanceFromRight = viewportWidth - rect.right;

      // Position horizontally (prefer left alignment)
      let x = rect.left;
      if (distanceFromRight < pickerWidth) {
        x = rect.right - pickerWidth;
      }
      x = Math.max(8, Math.min(x, viewportWidth - pickerWidth - 8));

      // Position vertically
      let y;
      if (distanceFromBottom >= pickerHeight + gap) {
        y = rect.bottom + gap;
      } else if (distanceFromTop >= pickerHeight + gap) {
        y = rect.top - pickerHeight - gap;
      } else {
        y =
          distanceFromBottom > distanceFromTop
            ? rect.bottom + gap
            : Math.max(8, rect.top - pickerHeight - gap);
      }

      y = Math.max(8, Math.min(y, viewportHeight - pickerHeight - 8));

      openOpacityPicker(value, onChange, { x, y });
    }
  };

  return (
    <div className="flex gap-1 max-w-37 w-full">
      <Button
        ref={colorButtonRef}
        data-color-picker-trigger
        onClick={handleColorClick}
        className={cn(
          "flex items-center rounded-md border border-input transition-colors hover:bg-transparent hover:cursor-pointer flex-1",
          className
        )}
        variant="ghost"
        aria-label={ariaLabel}
        style={{ backgroundColor: value }}
      >
        <span className="text-white text-ellipsis overflow-hidden font-mono text-sm">
          {getHexDisplay(value)}
        </span>
      </Button>
      <Button
        ref={opacityButtonRef}
        data-color-picker-trigger
        onClick={handleOpacityClick}
        size="icon"
        variant="ghost"
        aria-label="Adjust opacity"
      >
        <Blend />
      </Button>
    </div>
  );
};
