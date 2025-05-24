import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { NumberInput } from "../NumberInput";
import { ColorPicker } from "../ColorPicker";
import {
  PropertySection,
  PropertyStack,
  PropertyTitle,
  PropertyInput,
  PropertyLabel,
} from "@/components/ui/property";
import {
  AlignStartHorizontal,
  AlignHorizontalJustifyCenter,
  AlignEndHorizontal,
  AlignStartVertical,
  AlignVerticalJustifyCenter,
  AlignEndVertical,
  Link,
  Unlink,
} from "lucide-react";

interface TextPropertiesProps {
  id: string;
  name: string;
  content: string;
  color: string;
  fontSize: number;
  fontWeight: number;
  width: number;
  height: number;
  letterSpacing: number;
  lineHeight: number;
  lockAspectRatio?: boolean;
  onNameChange: (name: string) => void;
  onContentChange: (content: string) => void;
  onColorChange: (color: string) => void;
  onFontSizeChange: (size: number) => void;
  onFontWeightChange: (weight: number) => void;
  onDimensionsChange: (width: number, height: number) => void;
  onLetterSpacingChange: (spacing: number) => void;
  onLineHeightChange: (height: number) => void;
  onHorizontalAlignChange: (align: "left" | "center" | "right") => void;
  onVerticalAlignChange: (align: "top" | "middle" | "bottom") => void;
  onToggleAspectRatioLock: () => void;
}

export function TextProperties({
  id,
  name,
  content,
  color,
  fontSize,
  fontWeight,
  width,
  height,
  letterSpacing,
  lineHeight,
  lockAspectRatio,
  onNameChange,
  onContentChange,
  onColorChange,
  onFontSizeChange,
  onFontWeightChange,
  onDimensionsChange,
  onLetterSpacingChange,
  onLineHeightChange,
  onHorizontalAlignChange,
  onVerticalAlignChange,
  onToggleAspectRatioLock,
}: TextPropertiesProps) {
  return (
    <>
      <PropertySection>
        <PropertyTitle>Name</PropertyTitle>
        <PropertyInput>
          <Input
            value={name || ""}
            onChange={(e) => onNameChange(e.target.value)}
            className="h-8 w-full bg-white/20 border-white/60 text-properties-text dark:text-foreground"
            aria-label="Element name"
          />
        </PropertyInput>
      </PropertySection>

      <PropertySection>
        <PropertyTitle>Content</PropertyTitle>
        <PropertyInput>
          <Input
            value={content || ""}
            onChange={(e) => onContentChange(e.target.value)}
          />
        </PropertyInput>
      </PropertySection>

      <PropertySection>
        <PropertyTitle>Appearance</PropertyTitle>
        <PropertyInput>
          <PropertyLabel>Color</PropertyLabel>
          <ColorPicker
            value={color}
            onChange={(newColor) => onColorChange(newColor)}
            aria-label="Text color"
          />
        </PropertyInput>
      </PropertySection>

      <PropertySection>
        <PropertyTitle>Font</PropertyTitle>
        <PropertyStack distribution="column">
          <PropertyInput>
            <PropertyLabel>Size</PropertyLabel>
            <NumberInput
              value={fontSize || 16}
              min={1}
              onChange={onFontSizeChange}
              onInstantChange={onFontSizeChange}
              aria-label="Font size"
            />
          </PropertyInput>

          <PropertyInput>
            <PropertyLabel>Weight</PropertyLabel>
            <NumberInput
              value={fontWeight || 400}
              min={100}
              max={900}
              step={100}
              onChange={onFontWeightChange}
              onInstantChange={onFontWeightChange}
              aria-label="Font weight"
            />
          </PropertyInput>
        </PropertyStack>
      </PropertySection>

      <PropertySection>
        <PropertyTitle>Dimensions</PropertyTitle>
        <PropertyStack distribution="column">
          <PropertyInput>
            <PropertyLabel>Width</PropertyLabel>
            <div className="flex items-center gap-2">
              <NumberInput
                value={width}
                onChange={(val) => onDimensionsChange(val, height)}
                onInstantChange={(val) => onDimensionsChange(val, height)}
                aria-label="Text width"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggleAspectRatioLock}
                className={`h-6 w-6 ${
                  lockAspectRatio ? "text-blue-600" : "text-gray-400"
                }`}
                title={
                  lockAspectRatio ? "Unlock aspect ratio" : "Lock aspect ratio"
                }
                aria-label={
                  lockAspectRatio ? "Unlock aspect ratio" : "Lock aspect ratio"
                }
              >
                {lockAspectRatio ? (
                  <Link className="h-3 w-3" />
                ) : (
                  <Unlink className="h-3 w-3" />
                )}
              </Button>
            </div>
          </PropertyInput>
          <PropertyInput>
            <PropertyLabel>Height</PropertyLabel>
            <NumberInput
              value={height}
              onChange={(val) => onDimensionsChange(width, val)}
              onInstantChange={(val) => onDimensionsChange(width, val)}
              aria-label="Text height"
            />
          </PropertyInput>
        </PropertyStack>
      </PropertySection>

      <PropertySection>
        <PropertyTitle>Letter Spacing</PropertyTitle>
        <PropertyInput>
          <NumberInput
            value={letterSpacing || 0}
            onChange={onLetterSpacingChange}
            onInstantChange={onLetterSpacingChange}
            aria-label="Letter spacing"
          />
        </PropertyInput>
      </PropertySection>

      <PropertySection>
        <PropertyTitle>Line Height</PropertyTitle>
        <PropertyInput>
          <NumberInput
            value={lineHeight || 20}
            min={1}
            onChange={onLineHeightChange}
            onInstantChange={onLineHeightChange}
            aria-label="Line height"
          />
        </PropertyInput>
      </PropertySection>

      <PropertySection>
        <PropertyTitle>Alignment</PropertyTitle>
        <PropertyStack distribution="column">
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onHorizontalAlignChange("left")}
              className="h-8 w-8 text-properties-text dark:text-foreground"
              aria-label="Align left"
            >
              <AlignStartVertical className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onHorizontalAlignChange("center")}
              className="h-8 w-8 text-properties-text dark:text-foreground"
              aria-label="Align center"
            >
              <AlignHorizontalJustifyCenter className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onHorizontalAlignChange("right")}
              className="h-8 w-8 text-properties-text dark:text-foreground"
              aria-label="Align right"
            >
              <AlignEndVertical className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onVerticalAlignChange("top")}
              className="h-8 w-8 text-properties-text dark:text-foreground"
              aria-label="Align top"
            >
              <AlignStartHorizontal className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onVerticalAlignChange("middle")}
              className="h-8 w-8 text-properties-text dark:text-foreground"
              aria-label="Align middle"
            >
              <AlignVerticalJustifyCenter className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onVerticalAlignChange("bottom")}
              className="h-8 w-8 text-properties-text dark:text-foreground"
              aria-label="Align bottom"
            >
              <AlignEndHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </PropertyStack>
      </PropertySection>
    </>
  );
}
