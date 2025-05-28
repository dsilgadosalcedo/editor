/**
 * Utility function to measure text dimensions
 * Creates a temporary DOM element to accurately measure text width and height
 */
export const measureText = (
  text: string,
  fontSize: number,
  fontWeight: number,
  fontFamily: string = "var(--font-geist-sans)",
  letterSpacing: number = 0,
  lineHeight: number = fontSize * 1.2
): { width: number; height: number } => {
  // Create a temporary element to measure text
  const tempDiv = document.createElement("div");
  tempDiv.style.position = "absolute";
  tempDiv.style.visibility = "hidden";
  tempDiv.style.whiteSpace = "nowrap";
  tempDiv.style.fontSize = `${fontSize}px`;
  tempDiv.style.fontWeight = `${fontWeight}`;
  tempDiv.style.fontFamily = fontFamily;
  tempDiv.style.letterSpacing = `${letterSpacing}px`;
  tempDiv.style.lineHeight = `${lineHeight}px`;
  tempDiv.textContent = text || "Text";

  document.body.appendChild(tempDiv);
  const width = tempDiv.offsetWidth;
  const height = tempDiv.offsetHeight;
  document.body.removeChild(tempDiv);

  return { width: Math.ceil(width), height: Math.ceil(height) };
};
