export type ColorFormat = "hex" | "rgb" | "rgba" | "hsl" | "hsla";

export interface ColorPickerContextType {
  openColorPicker: (
    color: string,
    onChange: (color: string) => void,
    position: { x: number; y: number },
    layerName?: string,
    propertyName?: string
  ) => void;
  closeColorPicker: () => void;
  openOpacityPicker: (
    color: string,
    onChange: (color: string) => void,
    position: { x: number; y: number }
  ) => void;
  closeOpacityPicker: () => void;
}

export interface ColorPickerProviderProps {
  children: React.ReactNode;
}
