import React, { useState, useRef } from "react";
import { Input } from "@/components/ui/input";

type NumberInputProps = {
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

export const NumberInput: React.FC<NumberInputProps> = ({
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
  const lastPropValue = useRef<number>(value);

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

  if (icon) {
    return (
      <div className="relative flex items-center">
        <div className="absolute left-2 z-10 text-properties-text/70 dark:text-foreground/70">
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
