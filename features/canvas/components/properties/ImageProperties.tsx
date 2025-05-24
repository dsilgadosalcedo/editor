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
import { Link, Unlink } from "lucide-react";

interface ImagePropertiesProps {
  id: string;
  name: string;
  src: string;
  width: number;
  height: number;
  cornerRadius: number;
  borderWidth: number;
  borderColor: string;
  shadowBlur: number;
  shadowColor: string;
  lockAspectRatio?: boolean;
  onNameChange: (name: string) => void;
  onSrcChange: (src: string) => void;
  onDimensionsChange: (width: number, height: number) => void;
  onCornerRadiusChange: (radius: number) => void;
  onBorderWidthChange: (width: number) => void;
  onBorderColorChange: (color: string) => void;
  onShadowBlurChange: (blur: number) => void;
  onShadowColorChange: (color: string) => void;
  onToggleAspectRatioLock: () => void;
}

export function ImageProperties({
  id,
  name,
  src,
  width,
  height,
  cornerRadius,
  borderWidth,
  borderColor,
  shadowBlur,
  shadowColor,
  lockAspectRatio,
  onNameChange,
  onSrcChange,
  onDimensionsChange,
  onCornerRadiusChange,
  onBorderWidthChange,
  onBorderColorChange,
  onShadowBlurChange,
  onShadowColorChange,
  onToggleAspectRatioLock,
}: ImagePropertiesProps) {
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
        <PropertyTitle>Image Source</PropertyTitle>
        <PropertyInput>
          <Input
            value={src || ""}
            onChange={(e) => onSrcChange(e.target.value)}
            placeholder="Enter image URL"
            aria-label="Image source URL"
          />
        </PropertyInput>
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
                aria-label="Image width"
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
              aria-label="Image height"
            />
          </PropertyInput>
        </PropertyStack>
      </PropertySection>

      <PropertySection>
        <PropertyTitle>Appearance</PropertyTitle>
        <PropertyInput>
          <PropertyLabel>Radius</PropertyLabel>
          <NumberInput
            value={cornerRadius || 0}
            min={0}
            max={Math.floor(Math.min(width, height) / 2)}
            onChange={(val) =>
              onCornerRadiusChange(
                Math.max(
                  0,
                  Math.min(val, Math.floor(Math.min(width, height) / 2))
                )
              )
            }
            onInstantChange={(val) =>
              onCornerRadiusChange(
                Math.max(
                  0,
                  Math.min(val, Math.floor(Math.min(width, height) / 2))
                )
              )
            }
            aria-label="Corner radius"
          />
        </PropertyInput>
      </PropertySection>

      <PropertySection>
        <PropertyTitle>Border</PropertyTitle>
        <PropertyStack distribution="column">
          <PropertyInput>
            <PropertyLabel>Width</PropertyLabel>
            <NumberInput
              value={borderWidth || 0}
              min={0}
              onChange={onBorderWidthChange}
              onInstantChange={onBorderWidthChange}
              aria-label="Border width"
            />
          </PropertyInput>
          <PropertyInput>
            <PropertyLabel>Color</PropertyLabel>
            <ColorPicker
              value={borderColor || "#000000"}
              onChange={(color) => onBorderColorChange(color)}
              aria-label="Border color"
            />
          </PropertyInput>
        </PropertyStack>
      </PropertySection>

      <PropertySection>
        <PropertyTitle>Shadow</PropertyTitle>
        <PropertyStack distribution="column">
          <PropertyInput>
            <PropertyLabel>Blur</PropertyLabel>
            <NumberInput
              value={shadowBlur || 0}
              min={0}
              onChange={onShadowBlurChange}
              onInstantChange={onShadowBlurChange}
              aria-label="Shadow blur"
            />
          </PropertyInput>
          <PropertyInput>
            <PropertyLabel>Color</PropertyLabel>
            <ColorPicker
              value={shadowColor || "#000000"}
              onChange={(color) => onShadowColorChange(color)}
              aria-label="Shadow color"
            />
          </PropertyInput>
        </PropertyStack>
      </PropertySection>
    </>
  );
}
