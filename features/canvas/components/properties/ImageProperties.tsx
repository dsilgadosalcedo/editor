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
  Link,
  Unlink,
  ArrowLeftRight,
  ArrowUpDown,
  CornerUpLeft,
  Square,
  Zap,
  Maximize,
} from "lucide-react";

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
  onCornerRadiusInstantChange: (radius: number) => void;
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
  onCornerRadiusInstantChange,
  onBorderWidthChange,
  onBorderColorChange,
  onShadowBlurChange,
  onShadowColorChange,
  onToggleAspectRatioLock,
}: ImagePropertiesProps) {
  const maxCornerRadius = Math.floor(Math.min(width, height) / 2);

  return (
    <>
      <PropertySection>
        <PropertyTitle>Name</PropertyTitle>
        <PropertyField>
          <Input
            value={name || ""}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="Image"
            className="h-8 w-full bg-white/20 border-white/60 text-properties-text dark:text-foreground"
            aria-label="Element name"
          />
        </PropertyField>
      </PropertySection>

      <PropertySection>
        <PropertyTitle>Image Source</PropertyTitle>
        <PropertyField>
          <Input
            value={src || ""}
            onChange={(e) => onSrcChange(e.target.value)}
            placeholder="Enter image URL"
            aria-label="Image source URL"
          />
        </PropertyField>
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
                aria-label="Image width"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggleAspectRatioLock}
                className={` ${
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
          <PropertyField>
            <PropertyLabel>Height</PropertyLabel>
            <PropertyInput
              value={height}
              onChange={(val) => onDimensionsChange(width, val)}
              onInstantChange={(val) => onDimensionsChange(width, val)}
              icon={<ArrowUpDown className="h-3 w-3" />}
              aria-label="Image height"
            />
          </PropertyField>
        </PropertyStack>
      </PropertySection>

      <PropertySection>
        <PropertyTitle>Appearance</PropertyTitle>
        <PropertyStack distribution="column">
          <PropertyField>
            <PropertyLabel>Radius</PropertyLabel>
            <PropertyInput
              value={cornerRadius || 0}
              min={0}
              max={maxCornerRadius}
              onChange={(val) =>
                onCornerRadiusChange(
                  Math.max(0, Math.min(val, maxCornerRadius))
                )
              }
              onInstantChange={(val) =>
                onCornerRadiusInstantChange(
                  Math.max(0, Math.min(val, maxCornerRadius))
                )
              }
              icon={<Maximize className="h-3 w-3" />}
              aria-label="Corner radius"
            />
          </PropertyField>
          <PropertyField>
            <PropertyLabel>Border</PropertyLabel>
            <div className="flex items-center gap-x-1">
              <PropertyInput
                value={borderWidth || 0}
                min={0}
                onChange={onBorderWidthChange}
                onInstantChange={onBorderWidthChange}
                icon={<Square className="h-3 w-3" />}
                aria-label="Border width"
                wrapperClassName="w-17"
              />
              <ColorPicker
                value={borderColor || "#000000"}
                onChange={(color) => onBorderColorChange(color)}
                aria-label="Border color"
                layerName={name || "Image"}
                propertyName="Border"
                showHex={false}
                showIcon={true}
              />
            </div>
          </PropertyField>
          <PropertyField>
            <PropertyLabel>Shadow</PropertyLabel>
            <div className="flex items-center gap-x-1">
              <PropertyInput
                value={shadowBlur || 0}
                min={0}
                onChange={onShadowBlurChange}
                onInstantChange={onShadowBlurChange}
                icon={<Zap className="h-3 w-3" />}
                aria-label="Shadow blur"
                wrapperClassName="w-17"
              />
              <ColorPicker
                value={shadowColor || "#000000"}
                onChange={(color) => onShadowColorChange(color)}
                aria-label="Shadow color"
                layerName={name || "Image"}
                propertyName="Shadow"
                showHex={false}
                showIcon={true}
              />
            </div>
          </PropertyField>
        </PropertyStack>
      </PropertySection>
    </>
  );
}
