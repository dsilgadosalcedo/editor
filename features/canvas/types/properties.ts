export interface TextPropertiesProps {
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

export interface ImagePropertiesProps {
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

export interface PositionPropertiesProps {
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
