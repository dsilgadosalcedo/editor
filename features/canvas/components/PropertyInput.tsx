import React, { useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type PropertyInputProps = {
  value: number;
  onChange: (value: number) => void; // Called on blur
  onInstantChange: (value: number) => void; // Called on left/right arrow
  className?: string;
  wrapperClassName?: string;
  "aria-label"?: string;
  min?: number;
  max?: number;
  step?: number;
  tabIndex?: number;
  icon?: React.ReactNode;
  allowFloat?: boolean; // New prop to control integer vs float behavior
};

export const PropertyInput: React.FC<PropertyInputProps> = ({
  value,
  onChange,
  onInstantChange,
  className = "",
  wrapperClassName,
  "aria-label": ariaLabel,
  min,
  max,
  step = 1,
  tabIndex = 0,
  icon,
  allowFloat = false, // Default to integer behavior for backward compatibility
  ...rest
}) => {
  // Conditionally ensure value is an integer or keep as float
  const processedValue = allowFloat ? value : Math.round(value);
  const [internalValue, setInternalValue] = useState<string>(
    processedValue.toString()
  );
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const lastPropValue = useRef<number>(processedValue);
  const dragStartX = useRef<number>(0);
  const dragStartValue = useRef<number>(0);

  // Helper function to process numeric values based on allowFloat
  const processNumericValue = (num: number): number => {
    return allowFloat ? num : Math.round(num);
  };

  // Sync internal value if prop changes from outside
  React.useEffect(() => {
    const roundedValue = processNumericValue(value);
    if (roundedValue !== lastPropValue.current) {
      setInternalValue(roundedValue.toString());
      lastPropValue.current = roundedValue;
    }
  }, [value, allowFloat]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInternalValue(e.target.value);
  };

  const handleBlur = () => {
    const num = processNumericValue(Number(internalValue));
    if (!isNaN(num) && num !== processedValue) {
      onChange(num);
    } else {
      setInternalValue(processedValue.toString()); // Reset if invalid
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault();
      let newValue = processNumericValue(Number(internalValue));
      if (isNaN(newValue)) newValue = processedValue;
      if (e.key === "ArrowUp") newValue += processNumericValue(step);
      if (e.key === "ArrowDown") newValue -= processNumericValue(step);
      if (typeof min === "number" && newValue < min)
        newValue = processNumericValue(min);
      if (typeof max === "number" && newValue > max)
        newValue = processNumericValue(max);

      // Process the result based on allowFloat
      newValue = processNumericValue(newValue);

      setInternalValue(newValue.toString());
      onInstantChange(newValue);
    } else if (e.key === "Enter") {
      const num = processNumericValue(Number(internalValue));
      if (!isNaN(num) && num !== processedValue) {
        onChange(num);
      } else {
        setInternalValue(processedValue.toString());
      }
      (e.target as HTMLInputElement).blur();
    }
  };

  const handleIconMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    dragStartX.current = e.clientX;
    dragStartValue.current =
      processNumericValue(Number(internalValue)) || processedValue;

    // Add cursor style to body during drag
    document.body.style.cursor = "ew-resize";
    document.body.style.userSelect = "none";

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - dragStartX.current;
      // Sensitivity: 1 pixel = 0.1 steps, adjust as needed
      const sensitivity = 0.1;
      const valueChange = deltaX * sensitivity * processNumericValue(step);
      let newValue = dragStartValue.current + valueChange;

      // Apply min/max constraints
      if (typeof min === "number" && newValue < min)
        newValue = processNumericValue(min);
      if (typeof max === "number" && newValue > max)
        newValue = processNumericValue(max);

      // Process the result based on allowFloat
      newValue = processNumericValue(newValue);

      setInternalValue(newValue.toString());
      onInstantChange(newValue);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";

      // Trigger onChange on drag end
      const finalValue = processNumericValue(Number(internalValue));
      if (!isNaN(finalValue) && finalValue !== processedValue) {
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
      <div
        className={cn("relative flex items-center max-w-37", wrapperClassName)}
      >
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
          pattern={allowFloat ? "[0-9]*\\.?[0-9]*" : "[0-9]*"}
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
      pattern={allowFloat ? "[0-9]*\\.?[0-9]*" : "[0-9]*"}
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
