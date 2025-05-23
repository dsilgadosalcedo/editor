import React from "react";
import { NumberInput } from "../NumberInput";
import {
  PropertySection,
  PropertyStack,
  PropertyTitle,
  PropertyInput,
  PropertyLabel,
} from "@/components/ui/property";

interface ArtboardPropertiesProps {
  dimensions: { width: number; height: number };
  onWidthChange: (width: number) => void;
  onHeightChange: (height: number) => void;
}

export function ArtboardProperties({
  dimensions,
  onWidthChange,
  onHeightChange,
}: ArtboardPropertiesProps) {
  return (
    <div>
      <div className="text-properties-text dark:text-foreground font-medium mb-4">
        Artboard
      </div>
      <div className="space-y-6">
        <PropertySection>
          <PropertyTitle>Dimensions</PropertyTitle>
          <PropertyStack distribution="row">
            <PropertyInput distribution="row">
              <PropertyLabel distribution="row">X</PropertyLabel>
              <NumberInput
                value={dimensions.width}
                onChange={onWidthChange}
                onInstantChange={onWidthChange}
                aria-label="Artboard width"
              />
            </PropertyInput>
            <PropertyInput distribution="row">
              <PropertyLabel distribution="row">Y</PropertyLabel>
              <NumberInput
                value={dimensions.height}
                onChange={onHeightChange}
                onInstantChange={onHeightChange}
                aria-label="Artboard height"
              />
            </PropertyInput>
          </PropertyStack>
        </PropertySection>
      </div>
    </div>
  );
}
