import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import React, {
  useRef,
  createContext,
  useContext,
  useState,
  ReactNode,
} from "react";
import CustomColorPicker from "./CustomColorPicker";

interface ColorPickerContextType {
  openColorPicker: (
    color: string,
    onChange: (color: string) => void,
    position: { x: number; y: number }
  ) => void;
  closeColorPicker: () => void;
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

  const openColorPicker = (
    color: string,
    onChange: (color: string) => void,
    newPosition: { x: number; y: number }
  ) => {
    const wasAlreadyOpen = isOpen;

    setCurrentColor(color);
    setCurrentOnChange(() => onChange);

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
  };

  // Close color picker when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen) {
        const target = event.target as HTMLElement;
        // Don't close if clicking on color picker buttons or the picker itself
        if (
          !target.closest("[data-color-picker]") &&
          !target.closest("[data-color-picker-trigger]")
        ) {
          closeColorPicker();
        }
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleColorChange = (color: string) => {
    setCurrentColor(color);
    if (currentOnChange) {
      currentOnChange(color);
    }
  };

  return (
    <ColorPickerContext.Provider value={{ openColorPicker, closeColorPicker }}>
      {children}
      <CustomColorPicker
        isOpen={isOpen}
        onClose={closeColorPicker}
        color={currentColor}
        onChange={handleColorChange}
        position={position}
        isTransitioning={isTransitioning}
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
}

export const ColorPicker: React.FC<ColorPickerProps> = ({
  value,
  onChange,
  className = "",
  "aria-label": ariaLabel,
}) => {
  const { openColorPicker } = useColorPicker();
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleClick = (e: React.MouseEvent) => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const colorPickerWidth = 280; // Width of the CustomColorPicker
      const colorPickerHeight = 360; // Approximate height of the CustomColorPicker
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      // Calculate horizontal position
      let x = rect.left;
      if (rect.left + colorPickerWidth > viewportWidth) {
        // Position to the left of the button if it would go off-screen
        x = rect.right - colorPickerWidth;
      }

      // Calculate vertical position
      let y = rect.bottom + 8;
      if (rect.bottom + colorPickerHeight > viewportHeight) {
        // Position above the button if it would go off-screen
        y = rect.top - colorPickerHeight - 8;
      }

      openColorPicker(value, onChange, { x, y });
    }
  };

  return (
    <div className="relative w-full">
      <Button
        ref={buttonRef}
        data-color-picker-trigger
        onClick={handleClick}
        className={cn(
          "flex max-w-[159.51px] overflow-x-scroll items-center w-full rounded-md border bg-transparent dark:bg-input/30 p-0 border-input transition-colors hover:bg-transparent dark:hover:bg-input/30 hover:cursor-pointer",
          className
        )}
        variant="ghost"
        aria-label={ariaLabel}
      >
        <div
          className="w-full h-full rounded-sm flex-shrink-0"
          style={{ backgroundColor: value }}
        />
      </Button>
    </div>
  );
};
