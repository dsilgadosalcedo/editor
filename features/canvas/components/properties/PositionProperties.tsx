import React from "react";
import { NumberInput } from "../NumberInput";
import { Button } from "@/components/ui/button";
import {
  AlignHorizontalJustifyCenter,
  AlignVerticalJustifyCenter,
  AlignStartHorizontal,
  AlignEndHorizontal,
  AlignStartVertical,
  AlignEndVertical,
  RotateCw,
  Move,
  MoveVertical,
  MoveHorizontal,
} from "lucide-react";
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
  rotation?: number;
  onXChange: (deltaX: number) => void;
  onYChange: (deltaY: number) => void;
  onRotationChange?: (rotation: number) => void;
  onAlignLeft?: () => void;
  onAlignRight?: () => void;
  onAlignTop?: () => void;
  onAlignBottom?: () => void;
  onAlignCenterHorizontal?: () => void;
  onAlignCenterVertical?: () => void;
}

export function PositionProperties({
  x,
  y,
  rotation = 0,
  onXChange,
  onYChange,
  onRotationChange,
  onAlignLeft,
  onAlignRight,
  onAlignTop,
  onAlignBottom,
  onAlignCenterHorizontal,
  onAlignCenterVertical,
}: PositionPropertiesProps) {
  // Round positions to integers for display
  const roundedX = Math.round(x);
  const roundedY = Math.round(y);
  const roundedRotation = Math.round(rotation);

  return (
    <PropertySection>
      <PropertyTitle>Position</PropertyTitle>
      <PropertyStack distribution="column">
        <PropertyStack distribution="row">
          <PropertyInput distribution="row">
            <PropertyLabel distribution="row">X</PropertyLabel>
            <NumberInput
              value={roundedX}
              onChange={(val) => onXChange(val - roundedX)}
              onInstantChange={(val) => onXChange(val - roundedX)}
              icon={<MoveHorizontal className="h-3 w-3" />}
              aria-label="Element X position"
            />
          </PropertyInput>
          <PropertyInput distribution="row">
            <PropertyLabel distribution="row">Y</PropertyLabel>
            <NumberInput
              value={roundedY}
              onChange={(val) => onYChange(val - roundedY)}
              onInstantChange={(val) => onYChange(val - roundedY)}
              icon={<MoveVertical className="h-3 w-3" />}
              aria-label="Element Y position"
            />
          </PropertyInput>
        </PropertyStack>

        {onRotationChange && (
          <PropertyInput distribution="row">
            <PropertyLabel distribution="column">Rotation</PropertyLabel>
            <NumberInput
              value={roundedRotation}
              onChange={(val) => onRotationChange(val)}
              onInstantChange={(val) => onRotationChange(val)}
              min={0}
              icon={<RotateCw className="h-3 w-3" />}
              max={360}
              aria-label="Element rotation in degrees"
            />
          </PropertyInput>
        )}

        {/* Alignment Grid */}
        {(onAlignLeft ||
          onAlignRight ||
          onAlignTop ||
          onAlignBottom ||
          onAlignCenterHorizontal ||
          onAlignCenterVertical) && (
          <PropertyInput distribution="column">
            <PropertyLabel distribution="row">Align to Artboard</PropertyLabel>
            <section>
              <div className="flex items-center space-x-0.5">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onAlignLeft}
                  disabled={!onAlignLeft}
                  aria-label="Align to left"
                  title="Align to left"
                >
                  <AlignStartVertical className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onAlignCenterHorizontal}
                  disabled={!onAlignCenterHorizontal}
                  aria-label="Align to horizontal center"
                  title="Align to horizontal center"
                >
                  <AlignHorizontalJustifyCenter className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onAlignRight}
                  disabled={!onAlignRight}
                  aria-label="Align to right"
                  title="Align to right"
                >
                  <AlignEndVertical className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onAlignTop}
                  disabled={!onAlignTop}
                  aria-label="Align to top"
                  title="Align to top"
                >
                  <AlignStartHorizontal className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onAlignCenterVertical}
                  disabled={!onAlignCenterVertical}
                  aria-label="Align to vertical center"
                  title="Align to vertical center"
                >
                  <AlignVerticalJustifyCenter className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onAlignBottom}
                  disabled={!onAlignBottom}
                  aria-label="Align to bottom"
                  title="Align to bottom"
                >
                  <AlignEndHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </section>
          </PropertyInput>
        )}
      </PropertyStack>
    </PropertySection>
  );
}
