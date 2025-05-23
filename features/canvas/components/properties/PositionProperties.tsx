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
  return (
    <PropertySection>
      <PropertyTitle>Position</PropertyTitle>
      <PropertyStack distribution="row">
        <PropertyInput distribution="row">
          <PropertyLabel distribution="row">X</PropertyLabel>
          <NumberInput
            value={x}
            onChange={(val) => onXChange(val - x)}
            onInstantChange={(val) => onXChange(val - x)}
            aria-label="Element X position"
          />
        </PropertyInput>
        <PropertyInput distribution="row">
          <PropertyLabel distribution="row">Y</PropertyLabel>
          <NumberInput
            value={y}
            onChange={(val) => onYChange(val - y)}
            onInstantChange={(val) => onYChange(val - y)}
            aria-label="Element Y position"
          />
        </PropertyInput>
      </PropertyStack>
    </PropertySection>
  );
}
