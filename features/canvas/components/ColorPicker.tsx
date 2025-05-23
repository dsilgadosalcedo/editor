import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import React, { useRef } from "react";

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
  const colorInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    if (colorInputRef.current) {
      colorInputRef.current.click();
    }
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className="relative w-full">
      <Button
        onClick={handleClick}
        className={cn(
          "flex items-center w-full rounded-md border bg-transparent dark:bg-input/30 border-input transition-colors hover:bg-transparent dark:hover:bg-input/30 hover:cursor-pointer",
          className
        )}
        variant="ghost"
        aria-label={ariaLabel}
      >
        <div
          className="w-4 h-4 rounded-sm flex-shrink-0"
          style={{ backgroundColor: value }}
        />
        <span className="text-sm font-mono uppercase">{value}</span>
      </Button>
      <input
        ref={colorInputRef}
        type="color"
        value={value}
        onChange={handleColorChange}
        className="absolute opacity-0 pointer-events-none"
        tabIndex={-1}
      />
    </div>
  );
};
