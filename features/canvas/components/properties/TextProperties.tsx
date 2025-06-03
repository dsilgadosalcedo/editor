import React from "react";
import { Button } from "@/components/ui/button";
import { PropertyInput } from "../PropertyInput";
import {
  PropertySection,
  PropertyStack,
  PropertyTitle,
  PropertyField,
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
  Square,
  MoveHorizontal,
  AlignJustify,
  RotateCcw,
} from "lucide-react";
import { TextContentSection, TextStyleSection } from "./text";

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
  textResizing?: "auto-width" | "auto-height" | "fixed";
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
  onTextResizingChange: (
    resizing: "auto-width" | "auto-height" | "fixed"
  ) => void;
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
  textResizing,
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
  onTextResizingChange,
}: TextPropertiesProps) {
  return (
    <>
      {/* Content Section */}
      <TextContentSection
        name={name}
        content={content}
        onNameChange={onNameChange}
        onContentChange={onContentChange}
      />

      {/* Style Section */}
      <TextStyleSection
        color={color}
        fontSize={fontSize}
        fontWeight={fontWeight}
        letterSpacing={letterSpacing}
        lineHeight={lineHeight}
        layerName={name || "Text"}
        onColorChange={onColorChange}
        onFontSizeChange={onFontSizeChange}
        onFontWeightChange={onFontWeightChange}
        onLetterSpacingChange={onLetterSpacingChange}
        onLineHeightChange={onLineHeightChange}
      />

      {/* Dimensions Section */}
      <PropertySection>
        <PropertyTitle>Dimensions</PropertyTitle>
        <PropertyStack distribution="column">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 flex-1">
              <span className="text-xs text-gray-500 w-3">W</span>
              <PropertyInput
                value={width}
                onChange={(val) => onDimensionsChange(val, height)}
                onInstantChange={(val) => onDimensionsChange(val, height)}
                aria-label="Width"
                className="text-xs"
              />
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleAspectRatioLock}
              className={`p-1 h-6 w-6 ${
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
            <div className="flex items-center gap-1 flex-1">
              <span className="text-xs text-gray-500 w-3">H</span>
              <PropertyInput
                value={height}
                onChange={(val) => onDimensionsChange(width, val)}
                onInstantChange={(val) => onDimensionsChange(width, val)}
                aria-label="Height"
                className="text-xs"
              />
            </div>
          </div>
        </PropertyStack>
      </PropertySection>

      {/* Resizing Section */}
      <PropertySection>
        <PropertyTitle>Resizing</PropertyTitle>
        <PropertyStack distribution="column">
          <div className="flex gap-1">
            <Button
              variant={textResizing === "auto-width" ? "default" : "outline"}
              size="sm"
              onClick={() => onTextResizingChange("auto-width")}
              className="p-2 h-8 w-8 flex items-center justify-center"
              aria-label="Auto width"
              title="Auto width"
            >
              <MoveHorizontal className="h-4 w-4" />
            </Button>
            <Button
              variant={textResizing === "auto-height" ? "default" : "outline"}
              size="sm"
              onClick={() => onTextResizingChange("auto-height")}
              className="p-2 h-8 w-8 flex items-center justify-center"
              aria-label="Auto height"
              title="Auto height"
            >
              <AlignJustify className="h-4 w-4" />
            </Button>
            <Button
              variant={textResizing === "fixed" ? "default" : "outline"}
              size="sm"
              onClick={() => onTextResizingChange("fixed")}
              className="p-2 h-8 w-8 flex items-center justify-center"
              aria-label="Fixed size"
              title="Fixed size"
            >
              <Square className="h-4 w-4" />
            </Button>
          </div>
        </PropertyStack>
      </PropertySection>

      {/* Alignment Section */}
      <PropertySection>
        <PropertyTitle>Alignment</PropertyTitle>
        <PropertyStack distribution="column">
          <PropertyField>
            <PropertyLabel>Horizontal</PropertyLabel>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onHorizontalAlignChange("left")}
                className="p-1 h-8 w-8"
                aria-label="Align left"
              >
                <AlignStartHorizontal className="h-3 w-3" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onHorizontalAlignChange("center")}
                className="p-1 h-8 w-8"
                aria-label="Align center"
              >
                <AlignHorizontalJustifyCenter className="h-3 w-3" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onHorizontalAlignChange("right")}
                className="p-1 h-8 w-8"
                aria-label="Align right"
              >
                <AlignEndHorizontal className="h-3 w-3" />
              </Button>
            </div>
          </PropertyField>

          <PropertyField>
            <PropertyLabel>Vertical</PropertyLabel>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onVerticalAlignChange("top")}
                className="p-1 h-8 w-8"
                aria-label="Align top"
              >
                <AlignStartVertical className="h-3 w-3" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onVerticalAlignChange("middle")}
                className="p-1 h-8 w-8"
                aria-label="Align middle"
              >
                <AlignVerticalJustifyCenter className="h-3 w-3" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onVerticalAlignChange("bottom")}
                className="p-1 h-8 w-8"
                aria-label="Align bottom"
              >
                <AlignEndVertical className="h-3 w-3" />
              </Button>
            </div>
          </PropertyField>
        </PropertyStack>
      </PropertySection>
    </>
  );
}
