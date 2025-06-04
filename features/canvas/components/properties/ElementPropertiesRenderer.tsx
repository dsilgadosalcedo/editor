import React from "react";
import { CanvasElementData } from "../../types";
import { TextProperties } from "./TextProperties";
import { ImageProperties } from "./ImageProperties";
import { RectangleProperties } from "./RectangleProperties";

interface ElementPropertiesRendererProps {
  element: CanvasElementData;
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
  onSrcChange: (src: string) => void;
  onCornerRadiusChange: (radius: number) => void;
  onCornerRadiusInstantChange: (radius: number) => void;
  onBorderWidthChange: (width: number) => void;
  onBorderColorChange: (color: string) => void;
  onShadowBlurChange: (blur: number) => void;
  onShadowColorChange: (color: string) => void;
}

export function ElementPropertiesRenderer({
  element,
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
  onSrcChange,
  onCornerRadiusChange,
  onCornerRadiusInstantChange,
  onBorderWidthChange,
  onBorderColorChange,
  onShadowBlurChange,
  onShadowColorChange,
}: ElementPropertiesRendererProps) {
  switch (element.type) {
    case "text":
      return (
        <TextProperties
          id={element.id}
          name={element.name || ""}
          content={element.content || ""}
          color={element.color}
          fontSize={element.fontSize || 16}
          fontWeight={element.fontWeight || 400}
          width={element.width}
          height={element.height}
          letterSpacing={element.letterSpacing || 0}
          lineHeight={element.lineHeight || 20}
          lockAspectRatio={element.lockAspectRatio || false}
          textResizing={element.textResizing || "auto-width"}
          onNameChange={onNameChange}
          onContentChange={onContentChange}
          onColorChange={onColorChange}
          onFontSizeChange={onFontSizeChange}
          onFontWeightChange={onFontWeightChange}
          onDimensionsChange={onDimensionsChange}
          onLetterSpacingChange={onLetterSpacingChange}
          onLineHeightChange={onLineHeightChange}
          onHorizontalAlignChange={onHorizontalAlignChange}
          onVerticalAlignChange={onVerticalAlignChange}
          onToggleAspectRatioLock={onToggleAspectRatioLock}
          onTextResizingChange={onTextResizingChange}
        />
      );

    case "image":
      return (
        <ImageProperties
          id={element.id}
          name={element.name || ""}
          src={element.src || ""}
          width={element.width}
          height={element.height}
          cornerRadius={element.cornerRadius || 0}
          borderWidth={element.borderWidth || 0}
          borderColor={element.borderColor || "#000000"}
          shadowBlur={element.shadowBlur || 0}
          shadowColor={element.shadowColor || "#000000"}
          lockAspectRatio={element.lockAspectRatio || false}
          onNameChange={onNameChange}
          onSrcChange={onSrcChange}
          onDimensionsChange={onDimensionsChange}
          onCornerRadiusChange={onCornerRadiusChange}
          onCornerRadiusInstantChange={onCornerRadiusInstantChange}
          onBorderWidthChange={onBorderWidthChange}
          onBorderColorChange={onBorderColorChange}
          onShadowBlurChange={onShadowBlurChange}
          onShadowColorChange={onShadowColorChange}
          onToggleAspectRatioLock={onToggleAspectRatioLock}
        />
      );

    case "rectangle":
    case "group": // Groups share rectangle properties for now
      return (
        <RectangleProperties
          id={element.id}
          name={element.name || ""}
          width={element.width}
          height={element.height}
          color={element.color}
          cornerRadius={element.cornerRadius || 0}
          borderWidth={element.borderWidth || 0}
          borderColor={element.borderColor || "#000000"}
          shadowBlur={element.shadowBlur || 0}
          shadowColor={element.shadowColor || "#000000"}
          lockAspectRatio={element.lockAspectRatio || false}
          onNameChange={onNameChange}
          onDimensionsChange={onDimensionsChange}
          onColorChange={onColorChange}
          onCornerRadiusChange={onCornerRadiusChange}
          onCornerRadiusInstantChange={onCornerRadiusInstantChange}
          onBorderWidthChange={onBorderWidthChange}
          onBorderColorChange={onBorderColorChange}
          onShadowBlurChange={onShadowBlurChange}
          onShadowColorChange={onShadowColorChange}
          onToggleAspectRatioLock={onToggleAspectRatioLock}
        />
      );

    default:
      return null;
  }
}
