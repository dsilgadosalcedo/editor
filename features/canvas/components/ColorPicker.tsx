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
      const colorPickerHeight = 420; // More accurate height estimate including all components
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const margin = 16; // Increased margin for better spacing

      // Calculate horizontal position
      let x = rect.left;
      if (rect.left + colorPickerWidth > viewportWidth - margin) {
        // Position to the left of the button if it would go off-screen
        x = rect.right - colorPickerWidth;
      }
      // Ensure it doesn't go off the edges with margin
      x = Math.max(
        margin,
        Math.min(x, viewportWidth - colorPickerWidth - margin)
      );

      // Calculate vertical position
      let y = rect.bottom + margin;

      // Check if positioning below would go off-screen
      if (y + colorPickerHeight > viewportHeight - margin) {
        // Try positioning above the button
        const yAbove = rect.top - colorPickerHeight - margin;

        // If positioning above would also go off-screen (near top)
        if (yAbove < margin) {
          // Check available space and position optimally
          const spaceAbove = rect.top - margin;
          const spaceBelow = viewportHeight - rect.bottom - margin;

          if (spaceBelow >= spaceAbove && spaceBelow > colorPickerHeight / 2) {
            // More space below and sufficient, position to use available space below
            y = rect.bottom + margin;
          } else if (spaceAbove > colorPickerHeight / 2) {
            // Sufficient space above, position to use available space above
            y = Math.max(margin, rect.top - colorPickerHeight - margin);
          } else {
            // Neither space is sufficient, position at top with margin
            y = margin;
          }
        } else {
          // Position above the button
          y = yAbove;
        }
      }

      // Final safety check to ensure it's within viewport bounds
      y = Math.max(
        margin,
        Math.min(y, viewportHeight - colorPickerHeight - margin)
      );

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
          "flex max-w-[159.51px] w-full items-center rounded-md border border-input transition-colors hover:bg-transparent hover:cursor-pointer",
          className
        )}
        variant="ghost"
        aria-label={ariaLabel}
        style={{ backgroundColor: value }}
      >
        <span className="text-white text-ellipsis overflow-hidden">
          {value}
        </span>
      </Button>
    </div>
  );
};
