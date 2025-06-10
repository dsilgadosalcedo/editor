import React from "react";
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
  ArrowLeftRight,
  ArrowUpDown,
  Link,
  Unlink,
  Scan,
  Square,
  Zap,
  CornerUpLeft,
  Trash2,
  Type,
  Maximize,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface RectanglePropertiesProps {
  id: string;
  name: string;
  width: number;
  height: number;
  color: string;
  cornerRadius: number;
  borderWidth: number;
  borderColor: string;
  shadowBlur: number;
  shadowColor: string;
  lockAspectRatio: boolean;
  onNameChange: (name: string) => void;
  onDimensionsChange: (width: number, height: number) => void;
  onColorChange: (color: string) => void;
  onCornerRadiusChange: (radius: number) => void;
  onCornerRadiusInstantChange: (radius: number) => void;
  onBorderWidthChange: (width: number) => void;
  onBorderColorChange: (color: string) => void;
  onShadowBlurChange: (blur: number) => void;
  onShadowColorChange: (color: string) => void;
  onToggleAspectRatioLock: () => void;
}

export function RectangleProperties({
  id,
  name,
  width,
  height,
  color,
  cornerRadius,
  borderWidth,
  borderColor,
  shadowBlur,
  shadowColor,
  lockAspectRatio,
  onNameChange,
  onDimensionsChange,
  onColorChange,
  onCornerRadiusChange,
  onCornerRadiusInstantChange,
  onBorderWidthChange,
  onBorderColorChange,
  onShadowBlurChange,
  onShadowColorChange,
  onToggleAspectRatioLock,
}: RectanglePropertiesProps) {
  const maxCornerRadius = Math.floor(Math.min(width, height) / 2);

  return (
    <>
      {/* Name Section */}
      <PropertySection>
        <PropertyTitle>Name</PropertyTitle>
        <PropertyField>
          <Input
            value={name || ""}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="Rectangle"
            className="h-8 w-full bg-white/20 border-white/60 text-properties-text dark:text-foreground"
            aria-label="Element name"
          />
        </PropertyField>
      </PropertySection>

      {/* Dimensions Section */}
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
                aria-label="Rectangle width"
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
          <PropertyField>
            <PropertyLabel>Height</PropertyLabel>
            <PropertyInput
              value={height}
              onChange={(val) => onDimensionsChange(width, val)}
              onInstantChange={(val) => onDimensionsChange(width, val)}
              icon={<ArrowUpDown className="h-3 w-3" />}
              aria-label="Rectangle height"
            />
          </PropertyField>
        </PropertyStack>
      </PropertySection>

      {/* Appearance Section */}
      <PropertySection>
        <PropertyTitle>Appearance</PropertyTitle>
        <PropertyStack distribution="column">
          <PropertyField>
            <PropertyLabel>Background</PropertyLabel>
            <ColorPicker
              value={color}
              onChange={onColorChange}
              aria-label="Background color"
              layerName={name || "Rectangle"}
              propertyName="Background"
            />
          </PropertyField>
          <PropertyField>
            <PropertyLabel>Radius</PropertyLabel>
            <PropertyInput
              value={cornerRadius}
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
                value={borderWidth}
                min={0}
                onChange={onBorderWidthChange}
                onInstantChange={onBorderWidthChange}
                icon={<Square className="h-3 w-3" />}
                aria-label="Border width"
                wrapperClassName="w-17"
              />
              <ColorPicker
                value={borderColor}
                onChange={onBorderColorChange}
                aria-label="Border color"
                layerName={name || "Rectangle"}
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
                value={shadowBlur}
                min={0}
                onChange={onShadowBlurChange}
                onInstantChange={onShadowBlurChange}
                icon={<Zap className="h-3 w-3" />}
                aria-label="Shadow blur"
                wrapperClassName="w-17"
              />
              <ColorPicker
                value={shadowColor}
                onChange={onShadowColorChange}
                aria-label="Shadow color"
                layerName={name || "Rectangle"}
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
