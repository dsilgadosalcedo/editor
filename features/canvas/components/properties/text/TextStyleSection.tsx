import React from "react";
import { PropertyInput } from "../../PropertyInput";
import { ColorPicker } from "../../ColorPicker";
import {
  PropertySection,
  PropertyStack,
  PropertyTitle,
  PropertyField,
  PropertyLabel,
} from "@/components/ui/property";
import { Type, Bold, Space, AlignVerticalSpaceAround } from "lucide-react";

interface TextStyleSectionProps {
  color: string;
  fontSize: number;
  fontWeight: number;
  letterSpacing: number;
  lineHeight: number;
  layerName: string;
  onColorChange: (color: string) => void;
  onFontSizeChange: (size: number) => void;
  onFontWeightChange: (weight: number) => void;
  onLetterSpacingChange: (spacing: number) => void;
  onLineHeightChange: (height: number) => void;
}

export function TextStyleSection({
  color,
  fontSize,
  fontWeight,
  letterSpacing,
  lineHeight,
  layerName,
  onColorChange,
  onFontSizeChange,
  onFontWeightChange,
  onLetterSpacingChange,
  onLineHeightChange,
}: TextStyleSectionProps) {
  return (
    <>
      {/* Appearance Section */}
      <PropertySection>
        <PropertyTitle>Appearance</PropertyTitle>
        <PropertyField>
          <PropertyLabel>Color</PropertyLabel>
          <ColorPicker
            value={color}
            onChange={onColorChange}
            aria-label="Text color"
            layerName={layerName}
            propertyName="Text Color"
          />
        </PropertyField>
      </PropertySection>

      {/* Font Section */}
      <PropertySection>
        <PropertyTitle>Font</PropertyTitle>
        <PropertyStack distribution="column">
          <PropertyField>
            <PropertyLabel>Size</PropertyLabel>
            <PropertyInput
              value={fontSize}
              min={1}
              onChange={onFontSizeChange}
              onInstantChange={onFontSizeChange}
              icon={<Type className="h-3 w-3" />}
              aria-label="Font size"
            />
          </PropertyField>

          <PropertyField>
            <PropertyLabel>Weight</PropertyLabel>
            <PropertyInput
              value={fontWeight}
              min={100}
              max={900}
              step={100}
              onChange={onFontWeightChange}
              onInstantChange={onFontWeightChange}
              icon={<Bold className="h-3 w-3" />}
              aria-label="Font weight"
            />
          </PropertyField>
        </PropertyStack>
      </PropertySection>

      {/* Typography Section */}
      <PropertySection>
        <PropertyTitle>Typography</PropertyTitle>
        <PropertyStack distribution="column">
          <PropertyField>
            <PropertyLabel>Letter Spacing</PropertyLabel>
            <PropertyInput
              value={letterSpacing}
              onChange={onLetterSpacingChange}
              onInstantChange={onLetterSpacingChange}
              icon={<Space className="h-3 w-3" />}
              aria-label="Letter spacing"
            />
          </PropertyField>

          <PropertyField>
            <PropertyLabel>Line Height</PropertyLabel>
            <PropertyInput
              value={lineHeight}
              min={1}
              onChange={onLineHeightChange}
              onInstantChange={onLineHeightChange}
              icon={<AlignVerticalSpaceAround className="h-3 w-3" />}
              aria-label="Line height"
            />
          </PropertyField>
        </PropertyStack>
      </PropertySection>
    </>
  );
}
