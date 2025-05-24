import React from "react";
import { NumberInput } from "../NumberInput";
import {
  PropertySection,
  PropertyStack,
  PropertyTitle,
  PropertyInput,
  PropertyLabel,
} from "@/components/ui/property";

interface PositionPropertiesProps {
  x: number;
  y: number;
  onXChange: (deltaX: number) => void;
  onYChange: (deltaY: number) => void;
}

export function PositionProperties({
  x,
  y,
  onXChange,
  onYChange,
}: PositionPropertiesProps) {
  // Round positions to integers for display
  const roundedX = Math.round(x);
  const roundedY = Math.round(y);

  return (
    <PropertySection>
      <PropertyTitle>Position</PropertyTitle>
      <PropertyStack distribution="row">
        <PropertyInput distribution="row">
          <PropertyLabel distribution="row">X</PropertyLabel>
          <NumberInput
            value={roundedX}
            onChange={(val) => onXChange(val - roundedX)}
            onInstantChange={(val) => onXChange(val - roundedX)}
            aria-label="Element X position"
          />
        </PropertyInput>
        <PropertyInput distribution="row">
          <PropertyLabel distribution="row">Y</PropertyLabel>
          <NumberInput
            value={roundedY}
            onChange={(val) => onYChange(val - roundedY)}
            onInstantChange={(val) => onYChange(val - roundedY)}
            aria-label="Element Y position"
          />
        </PropertyInput>
      </PropertyStack>
    </PropertySection>
  );
}
