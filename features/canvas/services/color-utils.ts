/**
 * Color utility service for canvas components
 * Extracted from CustomColorPicker to separate utility logic from UI logic
 */

export interface HSVAColor {
  h: number; // Hue: 0-360
  s: number; // Saturation: 0-100
  v: number; // Value: 0-100
  a: number; // Alpha: 0-1
}

export interface RGBAColor {
  r: number; // Red: 0-255
  g: number; // Green: 0-255
  b: number; // Blue: 0-255
  a: number; // Alpha: 0-1
}

export interface HSLAColor {
  h: number; // Hue: 0-360
  s: number; // Saturation: 0-100
  l: number; // Lightness: 0-100
  a: number; // Alpha: 0-1
}

export type ColorFormat = "hex" | "rgb" | "rgba" | "hsl" | "hsla";

/**
 * Parse color from any format to HSVA
 */
export const parseColorToHsva = (colorStr: string): HSVAColor => {
  const trimmed = colorStr.trim().toLowerCase();

  // Hex format
  if (trimmed.startsWith("#")) {
    return hexToHsva(trimmed);
  }

  // RGB/RGBA format
  if (trimmed.startsWith("rgb")) {
    return rgbToHsva(trimmed);
  }

  // HSL/HSLA format
  if (trimmed.startsWith("hsl")) {
    return hslToHsva(trimmed);
  }

  // Fallback to hex parsing
  return hexToHsva(trimmed.startsWith("#") ? trimmed : `#${trimmed}`);
};

/**
 * Convert hex to HSVA
 */
export const hexToHsva = (hex: string): HSVAColor => {
  let r = 0,
    g = 0,
    b = 0,
    a = 1;

  if (hex.length === 4) {
    r = parseInt(hex[1] + hex[1], 16) / 255;
    g = parseInt(hex[2] + hex[2], 16) / 255;
    b = parseInt(hex[3] + hex[3], 16) / 255;
  } else if (hex.length === 7) {
    r = parseInt(hex.slice(1, 3), 16) / 255;
    g = parseInt(hex.slice(3, 5), 16) / 255;
    b = parseInt(hex.slice(5, 7), 16) / 255;
  } else if (hex.length === 9) {
    r = parseInt(hex.slice(1, 3), 16) / 255;
    g = parseInt(hex.slice(3, 5), 16) / 255;
    b = parseInt(hex.slice(5, 7), 16) / 255;
    a = parseInt(hex.slice(7, 9), 16) / 255;
  }

  return rgbToHsvaFromValues(r * 255, g * 255, b * 255, a);
};

/**
 * Convert RGB string to HSVA with improved dark zone handling
 */
export const rgbToHsva = (rgbStr: string, alphaValue?: number): HSVAColor => {
  const match = rgbStr.match(/rgba?\(([^)]+)\)/);
  if (!match) return { h: 0, s: 0, v: 0, a: 1 };

  const values = match[1].split(",").map((v) => parseFloat(v.trim()));
  const r = Math.max(0, Math.min(255, values[0]));
  const g = Math.max(0, Math.min(255, values[1]));
  const b = Math.max(0, Math.min(255, values[2]));
  const a =
    alphaValue !== undefined
      ? alphaValue
      : values[3] !== undefined
      ? Math.max(0, Math.min(1, values[3]))
      : 1;

  return rgbToHsvaFromValues(r, g, b, a);
};

/**
 * Convert RGB values to HSVA
 */
export const rgbToHsvaFromValues = (
  r: number,
  g: number,
  b: number,
  a: number = 1
): HSVAColor => {
  r = r / 255;
  g = g / 255;
  b = b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  let h = 0;
  if (delta > 0.001) {
    // Use threshold to avoid precision issues
    if (max === r) {
      h = ((g - b) / delta) % 6;
    } else if (max === g) {
      h = (b - r) / delta + 2;
    } else {
      h = (r - g) / delta + 4;
    }
    h = h * 60;
    if (h < 0) h += 360;
  }

  // Improved saturation and value calculations
  const s = max < 0.001 ? 0 : (delta / max) * 100;
  const v = max * 100;

  return {
    h: Math.round(h * 10) / 10,
    s: Math.round(s * 10) / 10,
    v: Math.round(v * 10) / 10,
    a: Math.round(a * 100) / 100,
  };
};

/**
 * Convert HSL string to HSVA
 */
export const hslToHsva = (hslStr: string): HSVAColor => {
  const match = hslStr.match(/hsla?\(([^)]+)\)/);
  if (!match) return { h: 0, s: 0, v: 0, a: 1 };

  const values = match[1].split(",").map((v) => parseFloat(v.trim()));
  const h = values[0];
  const s = values[1];
  const l = values[2];
  const a = values[3] !== undefined ? values[3] : 1;

  return hslToHsvaFromValues(h, s, l, a);
};

/**
 * Convert HSL values to HSVA
 */
export const hslToHsvaFromValues = (
  h: number,
  s: number,
  l: number,
  a: number = 1
): HSVAColor => {
  // Convert HSL to HSV
  const v = l + (s * Math.min(l, 100 - l)) / 100;
  const sNew = v === 0 ? 0 : 200 * (1 - l / v);

  return { h, s: sNew, v, a };
};

/**
 * Convert HSVA to RGBA with improved precision for dark zones
 */
export const hsvaToRgba = (
  h: number,
  s: number,
  v: number,
  a: number = 1
): RGBAColor => {
  // Normalize inputs
  s = Math.max(0, Math.min(100, s)) / 100;
  v = Math.max(0, Math.min(100, v)) / 100;
  h = ((h % 360) + 360) % 360; // Ensure hue is between 0-360

  // Handle edge cases for dark zones
  if (v === 0) {
    return { r: 0, g: 0, b: 0, a };
  }

  if (s === 0) {
    const gray = Math.round(v * 255);
    return { r: gray, g: gray, b: gray, a };
  }

  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;

  let r = 0,
    g = 0,
    b = 0;

  if (h < 60) {
    r = c;
    g = x;
    b = 0;
  } else if (h < 120) {
    r = x;
    g = c;
    b = 0;
  } else if (h < 180) {
    r = 0;
    g = c;
    b = x;
  } else if (h < 240) {
    r = 0;
    g = x;
    b = c;
  } else if (h < 300) {
    r = x;
    g = 0;
    b = c;
  } else {
    r = c;
    g = 0;
    b = x;
  }

  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
    a,
  };
};

/**
 * Convert HSVA to HSL
 */
export const hsvaToHsl = (h: number, s: number, v: number): HSLAColor => {
  s = s / 100;
  v = v / 100;

  const l = v * (1 - s / 2);
  const sNew = l === 0 || l === 1 ? 0 : (v - l) / Math.min(l, 1 - l);

  return {
    h: Math.round(h),
    s: Math.round(sNew * 100),
    l: Math.round(l * 100),
    a: 1,
  };
};

/**
 * Format color according to specified format
 */
export const formatColor = (
  h: number,
  s: number,
  v: number,
  a: number,
  format: ColorFormat
): string => {
  switch (format) {
    case "hex": {
      const rgba = hsvaToRgba(h, s, v, a);
      const hex = rgbaToHex(rgba.r, rgba.g, rgba.b, a < 1 ? rgba.a : undefined);
      return hex;
    }
    case "rgb": {
      const rgba = hsvaToRgba(h, s, v, a);
      return `rgb(${rgba.r}, ${rgba.g}, ${rgba.b})`;
    }
    case "rgba": {
      const rgba = hsvaToRgba(h, s, v, a);
      return `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${rgba.a})`;
    }
    case "hsl": {
      const hsl = hsvaToHsl(h, s, v);
      return `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
    }
    case "hsla": {
      const hsl = hsvaToHsl(h, s, v);
      return `hsla(${hsl.h}, ${hsl.s}%, ${hsl.l}%, ${a})`;
    }
    default:
      return formatColor(h, s, v, a, "hex");
  }
};

/**
 * Convert RGBA values to hex string
 */
export const rgbaToHex = (
  r: number,
  g: number,
  b: number,
  a?: number
): string => {
  const toHex = (value: number) => {
    const hex = Math.round(Math.max(0, Math.min(255, value))).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };

  let hex = `#${toHex(r)}${toHex(g)}${toHex(b)}`;

  if (a !== undefined && a < 1) {
    hex += toHex(a * 255);
  }

  return hex;
};

/**
 * Check if a color format supports alpha channel
 */
export const supportsAlpha = (format: ColorFormat): boolean => {
  return format === "rgba" || format === "hsla";
};

/**
 * Get a contrasting text color (black or white) for a background color
 */
export const getContrastingTextColor = (backgroundColor: string): string => {
  const hsva = parseColorToHsva(backgroundColor);
  const rgba = hsvaToRgba(hsva.h, hsva.s, hsva.v, hsva.a);

  // Calculate luminance
  const luminance = (0.299 * rgba.r + 0.587 * rgba.g + 0.114 * rgba.b) / 255;

  return luminance > 0.5 ? "#000000" : "#ffffff";
};

/**
 * Blend two colors with a given ratio
 */
export const blendColors = (
  color1: string,
  color2: string,
  ratio: number
): string => {
  const hsva1 = parseColorToHsva(color1);
  const hsva2 = parseColorToHsva(color2);

  const blended: HSVAColor = {
    h: hsva1.h + (hsva2.h - hsva1.h) * ratio,
    s: hsva1.s + (hsva2.s - hsva1.s) * ratio,
    v: hsva1.v + (hsva2.v - hsva1.v) * ratio,
    a: hsva1.a + (hsva2.a - hsva1.a) * ratio,
  };

  return formatColor(blended.h, blended.s, blended.v, blended.a, "hex");
};
