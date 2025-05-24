# Figma Clipboard Integration

This project now supports copying canvas elements directly to the system clipboard in a format that can be pasted into Figma as editable vector shapes.

## How It Works

When you copy elements from the canvas, the system:

1. **Converts elements to SVG format** - Canvas elements (rectangles, text, images) are converted to SVG markup
2. **Copies to system clipboard** - Uses the modern Clipboard API to copy in multiple formats:
   - `image/svg+xml` (preferred by Figma)
   - `text/html` (fallback)
   - `text/plain` (last resort)
3. **Preserves styling** - Colors, borders, shadows, fonts, and positioning are maintained

## Usage

### In the Canvas Application

1. **Select elements** on the canvas (single or multiple)
2. **Click the Copy button** in the toolbar (or use Ctrl/Cmd+C)
3. **Open Figma** in another tab/window
4. **Paste** with Ctrl/Cmd+V in your Figma design

### Programmatic Usage

```typescript
import { useFigmaClipboard } from "@/hooks/useFigmaClipboard";
import { copyToFigmaClipboard } from "@/lib/figma-clipboard";

// Using the React hook
const { copyElements, isSupported, isSVGSupported } = useFigmaClipboard({
  onSuccess: () => console.log("Copied successfully!"),
  onError: (error) => console.error("Copy failed:", error),
});

// Copy elements
await copyElements(selectedElements);

// Or use the utility function directly
await copyToFigmaClipboard(elements, {
  includeBackground: false,
  padding: 20,
  scale: 1,
});
```

## Supported Elements

### Rectangles

- ✅ Fill color
- ✅ Border width and color
- ✅ Corner radius
- ✅ Drop shadows
- ✅ Position and size

### Text

- ✅ Content
- ✅ Font size and weight
- ✅ Text color
- ✅ Horizontal alignment (left, center, right)
- ✅ Vertical alignment (top, middle, bottom)
- ✅ Position and size

### Images

- ✅ External image URLs
- ✅ Position and size
- ✅ Placeholder for missing images

## Browser Support

### Clipboard API Support

- ✅ Chrome 66+
- ✅ Firefox 63+
- ✅ Safari 13.1+
- ✅ Edge 79+

### SVG Clipboard Support

- ✅ Chrome 76+
- ✅ Edge 79+
- ⚠️ Firefox: Limited (falls back to HTML/text)
- ⚠️ Safari: Limited (falls back to HTML/text)

## Configuration Options

```typescript
interface FigmaClipboardOptions {
  includeBackground?: boolean; // Add white background
  backgroundColor?: string; // Background color (if enabled)
  padding?: number; // Padding around elements (px)
  scale?: number; // Scale factor (1.0 = 100%)
}
```

## Technical Details

### SVG Generation

- Elements are converted to clean SVG markup
- Positioning is relative to the bounding box of all selected elements
- Styling is preserved using SVG attributes
- Shadows use SVG filter effects

### Clipboard Formats

The system writes multiple formats to maximize compatibility:

1. **SVG** (`image/svg+xml`) - Preferred by Figma for vector editing
2. **HTML** (`text/html`) - Contains SVG wrapped in HTML
3. **Text** (`text/plain`) - Raw SVG markup as fallback

### Security

- SVG content is sanitized when pasted into Figma
- No JavaScript or external resources in generated SVG
- Only safe SVG elements and attributes are used

## Troubleshooting

### "Clipboard API not supported"

- Ensure you're using a modern browser
- Check that the site is served over HTTPS (required for Clipboard API)

### "Failed to copy to clipboard"

- Browser may require user interaction (click/keypress) before clipboard access
- Some browsers block clipboard access in certain contexts

### Elements don't appear in Figma

- Ensure you're pasting into a Figma design file (not FigJam)
- Try pasting as "Paste here" from the right-click menu
- Check browser console for any errors

### Styling differences

- Some advanced styling may not transfer perfectly
- Complex shadows or effects might be simplified
- Font families may fall back to system defaults

## Future Enhancements

Potential improvements for future versions:

- [ ] Support for gradients and complex fills
- [ ] Better font family preservation
- [ ] Group/layer structure preservation
- [ ] Animation/transition support
- [ ] Bitmap image embedding
- [ ] Custom shape support
