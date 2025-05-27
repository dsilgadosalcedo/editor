import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PropertyInput } from "../PropertyInput";
import { ColorPicker } from "../ColorPicker";
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
  Expand,
  ArrowRightLeft,
  ArrowUpDown,
  Type,
  Bold,
  ArrowLeftRight,
  Space,
  AlignVerticalSpaceAround,
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
      <PropertySection>
        <PropertyTitle>Name</PropertyTitle>
        <PropertyField>
          <Input
            value={name || ""}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="Text"
            className="h-8 w-full bg-white/20 border-white/60 text-properties-text dark:text-foreground"
            aria-label="Element name"
          />
        </PropertyField>
      </PropertySection>

      <PropertySection>
        <PropertyTitle>Content</PropertyTitle>
        <PropertyField>
          <Input
            value={content || ""}
            onChange={(e) => onContentChange(e.target.value)}
          />
        </PropertyField>
      </PropertySection>

      <PropertySection>
        <PropertyTitle>Appearance</PropertyTitle>
        <PropertyField>
          <PropertyLabel>Color</PropertyLabel>
          <ColorPicker
            value={color}
            onChange={(newColor) => onColorChange(newColor)}
            aria-label="Text color"
            layerName={name || "Text"}
            propertyName="Text Color"
          />
        </PropertyField>
      </PropertySection>

      <PropertySection>
        <PropertyTitle>Font</PropertyTitle>
        <PropertyStack distribution="column">
          <PropertyField>
            <PropertyLabel>Size</PropertyLabel>
            <PropertyInput
              value={fontSize || 16}
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
              value={fontWeight || 400}
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

      <PropertySection>
        <PropertyTitle>Dimensions</PropertyTitle>
        <PropertyStack distribution="column">
          <PropertyField>
            <PropertyLabel>Width</PropertyLabel>
            <div className="flex items-center max-w-37 gap-1">
              <PropertyInput
                value={width}
                onChange={(val) => onDimensionsChange(val, height)}
                onInstantChange={(val) => onDimensionsChange(val, height)}
                icon={<ArrowLeftRight className="h-3 w-3" />}
                aria-label="Text width"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggleAspectRatioLock}
                className={`${
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
          </PropertyField>
          <PropertyField distribution="row">
            <PropertyLabel>Height</PropertyLabel>
            <PropertyInput
              value={height}
              onChange={(val) => onDimensionsChange(width, val)}
              onInstantChange={(val) => onDimensionsChange(width, val)}
              icon={<ArrowUpDown className="h-3 w-3" />}
              aria-label="Text height"
            />
          </PropertyField>
        </PropertyStack>
      </PropertySection>

      <PropertySection>
        <PropertyTitle>Letter Spacing</PropertyTitle>
        <PropertyField>
          <PropertyInput
            value={letterSpacing || 0}
            onChange={onLetterSpacingChange}
            onInstantChange={onLetterSpacingChange}
            icon={<Space className="h-3 w-3" />}
            aria-label="Letter spacing"
          />
        </PropertyField>
      </PropertySection>

      <PropertySection>
        <PropertyTitle>Line Height</PropertyTitle>
        <PropertyField>
          <PropertyInput
            value={lineHeight || 20}
            min={1}
            onChange={onLineHeightChange}
            onInstantChange={onLineHeightChange}
            icon={<AlignVerticalSpaceAround className="h-3 w-3" />}
            aria-label="Line height"
          />
        </PropertyField>
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

      <PropertySection>
        <PropertyTitle>Text Resizing</PropertyTitle>
        <PropertyField>
          <div className="flex gap-1 w-full">
            <Button
              variant={textResizing === "auto-width" ? "default" : "outline"}
              size="sm"
              onClick={() => onTextResizingChange("auto-width")}
              className="flex-1 gap-1"
              title="Auto width - width adapts to text content"
            >
              <ArrowRightLeft className="h-3 w-3" />
              Auto W
            </Button>
            <Button
              variant={textResizing === "auto-height" ? "default" : "outline"}
              size="sm"
              onClick={() => onTextResizingChange("auto-height")}
              className="flex-1 gap-1"
              title="Auto height - text wraps to fit width"
            >
              <ArrowUpDown className="h-3 w-3" />
              Auto H
            </Button>
            <Button
              variant={textResizing === "fixed" ? "default" : "outline"}
              size="sm"
              onClick={() => onTextResizingChange("fixed")}
              className="flex-1 gap-1"
              title="Fixed size - fixed width and height"
            >
              <Expand className="h-3 w-3" />
              Fixed
            </Button>
          </div>
        </PropertyField>
      </PropertySection>
    </>
  );
}
