import React, { useState, useRef } from "react";
import { Input } from "@/components/ui/input";

type PropertyInputProps = {
  value: number;
  onChange: (value: number) => void; // Called on blur
  onInstantChange: (value: number) => void; // Called on left/right arrow
  className?: string;
  "aria-label"?: string;
  min?: number;
  max?: number;
  step?: number;
  tabIndex?: number;
  icon?: React.ReactNode;
};

export const PropertyInput: React.FC<PropertyInputProps> = ({
  value,
  onChange,
  onInstantChange,
  className = "",
  "aria-label": ariaLabel,
  min,
  max,
  step = 1,
  tabIndex = 0,
  icon,
  ...rest
}) => {
  const [internalValue, setInternalValue] = useState<string>(value.toString());
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const lastPropValue = useRef<number>(value);
  const dragStartX = useRef<number>(0);
  const dragStartValue = useRef<number>(0);

  // Sync internal value if prop changes from outside
  React.useEffect(() => {
    if (value !== lastPropValue.current) {
      setInternalValue(value.toString());
      lastPropValue.current = value;
    }
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInternalValue(e.target.value);
  };

  const handleBlur = () => {
    const num = Number(internalValue);
    if (!isNaN(num) && num !== value) {
      onChange(num);
    } else {
      setInternalValue(value.toString()); // Reset if invalid
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault();
      let newValue = Number(internalValue);
      if (isNaN(newValue)) newValue = value;
      if (e.key === "ArrowUp") newValue += step;
      if (e.key === "ArrowDown") newValue -= step;
      if (typeof min === "number" && newValue < min) newValue = min;
      if (typeof max === "number" && newValue > max) newValue = max;

      // Fix floating point precision issues by rounding to appropriate decimal places
      const decimalPlaces = step.toString().split(".")[1]?.length || 0;
      newValue =
        Math.round(newValue * Math.pow(10, decimalPlaces)) /
        Math.pow(10, decimalPlaces);

      setInternalValue(newValue.toString());
      onInstantChange(newValue);
    } else if (e.key === "Enter") {
      const num = Number(internalValue);
      if (!isNaN(num) && num !== value) {
        onChange(num);
      } else {
        setInternalValue(value.toString());
      }
      (e.target as HTMLInputElement).blur();
    }
  };

  const handleIconMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    dragStartX.current = e.clientX;
    dragStartValue.current = Number(internalValue) || value;

    // Add cursor style to body during drag
    document.body.style.cursor = "ew-resize";
    document.body.style.userSelect = "none";

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - dragStartX.current;
      // Sensitivity: 1 pixel = 0.1 steps, adjust as needed
      const sensitivity = 0.1;
      const valueChange = deltaX * sensitivity * step;
      let newValue = dragStartValue.current + valueChange;

      // Apply min/max constraints
      if (typeof min === "number" && newValue < min) newValue = min;
      if (typeof max === "number" && newValue > max) newValue = max;

      // Fix floating point precision issues
      const decimalPlaces = step.toString().split(".")[1]?.length || 0;
      newValue =
        Math.round(newValue * Math.pow(10, decimalPlaces)) /
        Math.pow(10, decimalPlaces);

      setInternalValue(newValue.toString());
      onInstantChange(newValue);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";

      // Trigger onChange on drag end
      const finalValue = Number(internalValue);
      if (!isNaN(finalValue) && finalValue !== value) {
        onChange(finalValue);
      }

      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  if (icon) {
    return (
      <div className="relative flex items-center max-w-37">
        <div
          className={`absolute left-2 z-10 text-properties-text/70 dark:text-foreground/70 cursor-ew-resize select-none ${
            isDragging
              ? "text-blue-500"
              : "hover:text-properties-text dark:hover:text-foreground"
          }`}
          onMouseDown={handleIconMouseDown}
          role="button"
          tabIndex={0}
          aria-label="Drag to adjust value"
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              // Could implement keyboard drag mode here if needed
            }
          }}
        >
          {icon}
        </div>
        <Input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={internalValue}
          onChange={handleInputChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          aria-label={ariaLabel}
          tabIndex={tabIndex}
          className={`appearance-none outline-none pl-7 ${className}`}
          // Hide spinners for number input
          style={{ MozAppearance: "textfield" } as React.CSSProperties}
          {...rest}
        />
      </div>
    );
  }

  return (
    <Input
      type="text"
      inputMode="numeric"
      pattern="[0-9]*"
      value={internalValue}
      onChange={handleInputChange}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      aria-label={ariaLabel}
      tabIndex={tabIndex}
      className={`appearance-none outline-none ${className}`}
      // Hide spinners for number input
      style={{ MozAppearance: "textfield" } as React.CSSProperties}
      {...rest}
    />
  );
};
