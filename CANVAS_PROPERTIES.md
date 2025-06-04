# Canvas Properties Documentation

This document outlines all available properties that can be set for elements and the artboard in the canvas system.

## Artboard Properties

The artboard is the main canvas area where elements are placed. It has the following configurable properties:

### Dimensions & Layout

- **`width`** (number): Width of the artboard in pixels
- **`height`** (number): Height of the artboard in pixels
- **`artboardAspectRatio`** (number | null): Aspect ratio constraint (e.g., 16/9 = 1.778). `null` means custom/unlocked ratio
- **`isCustomAspectRatio`** (boolean): Whether the artboard uses a custom aspect ratio (unlocked dimensions)

### Project Information

- **`projectName`** (string): Name of the project/canvas
- **`projectId`** (string | null): Unique identifier for the project

### Interaction Settings

- **`panSensitivity`** (number): Controls how fast the canvas pans when dragging (range: 0.1-5.0, default: 1.6)
- **`zoomSensitivity`** (number): Controls how fast the canvas zooms with mouse wheel/trackpad (range: 0.1-3.0, default: 0.6)

### UI Preferences

- **`rightSidebarDocked`** (boolean): Whether the properties panel is docked to the right side

## Element Properties

All elements share common properties, with additional type-specific properties.

### Common Properties (All Elements)

#### Core Identity

- **`id`** (string): Unique identifier for the element
- **`type`** (ElementType): Type of element - "rectangle" | "text" | "image" | "group"
- **`name`** (string, optional): Custom name for the element (shown in layers panel)

#### Position & Dimensions

- **`x`** (number): X position relative to artboard top-left corner
- **`y`** (number): Y position relative to artboard top-left corner
- **`width`** (number): Width of the element in pixels
- **`height`** (number): Height of the element in pixels
- **`rotation`** (number, optional): Rotation angle in degrees (default: 0)

#### Appearance

- **`color`** (string): Fill color in hex format (e.g., "#FF0000")
- **`borderWidth`** (number, optional): Width of the border/stroke in pixels
- **`borderColor`** (string, optional): Color of the border/stroke in hex format
- **`shadowBlur`** (number, optional): Blur radius for drop shadow effect
- **`shadowColor`** (string, optional): Color of the drop shadow in hex format
- **`cornerRadius`** (number, optional): Radius for rounded corners (rectangles only)

#### State & Behavior

- **`selected`** (boolean): Whether the element is currently selected
- **`visible`** (boolean, optional): Whether the element is visible (default: true)
- **`lockAspectRatio`** (boolean, optional): Whether to maintain aspect ratio when resizing
- **`loading`** (boolean, optional): Loading state for async operations (e.g., image loading)

#### Hierarchy & Grouping

- **`parentId`** (string, optional): ID of parent group (if element is grouped)
- **`children`** (string[], optional): Array of child element IDs (for group elements)

#### Isolation Mode

- **`isolated`** (boolean, optional): Whether element is in isolation mode
- **`inIsolatedGroup`** (boolean, optional): Whether element is inside an isolated group
- **`isInIsolationMode`** (boolean, optional): Whether element is currently in isolation mode
- **`isSelectableInIsolation`** (boolean, optional): Whether element can be selected in isolation mode

### Text Element Properties

#### Content

- **`content`** (string, optional): The text content to display

#### Typography

- **`fontSize`** (number, optional): Font size in pixels (default: 16)
- **`fontWeight`** (number, optional): Font weight (100-900, default: 400)
- **`letterSpacing`** (number, optional): Letter spacing in pixels
- **`lineHeight`** (number, optional): Line height multiplier

#### Alignment

- **`horizontalAlign`** ("left" | "center" | "right", optional): Horizontal text alignment
- **`verticalAlign`** ("top" | "middle" | "bottom", optional): Vertical text alignment

#### Text Resizing Behavior

- **`textResizing`** ("auto-width" | "auto-height" | "fixed", optional): How text box resizes
  - `auto-width`: Text box width adjusts to content
  - `auto-height`: Text box height adjusts to content
  - `fixed`: Text box dimensions are fixed

### Image Element Properties

#### Source

- **`src`** (string, optional): URL or data URI of the image source

### Rectangle Element Properties

Rectangles use all common properties. The `cornerRadius` property is particularly relevant for rectangles to create rounded corners.

### Group Element Properties

Groups use all common properties plus:

- **`children`** (string[]): Array of element IDs that belong to this group

## Export/Import Data Structure

When exporting a project, all the above properties are preserved in this structure:

```json
{
  "version": "1.0.0",
  "timestamp": 1234567890,
  "projectName": "My Project",
  "artboard": {
    "width": 1024,
    "height": 576,
    "artboardAspectRatio": 1.777777777777778,
    "isCustomAspectRatio": false,
    "panSensitivity": 1.6,
    "zoomSensitivity": 0.6
  },
  "elements": [
    {
      "id": "element-123",
      "type": "rectangle",
      "x": 100,
      "y": 100,
      "width": 200,
      "height": 150,
      "color": "#3b82f6",
      "cornerRadius": 8,
      "borderWidth": 2,
      "borderColor": "#1e40af",
      "shadowBlur": 4,
      "shadowColor": "#000000",
      "selected": false,
      "visible": true,
      "rotation": 0,
      "name": "Blue Rectangle"
    },
    {
      "id": "text-456",
      "type": "text",
      "x": 150,
      "y": 200,
      "width": 100,
      "height": 30,
      "content": "Hello World",
      "color": "#000000",
      "fontSize": 18,
      "fontWeight": 500,
      "horizontalAlign": "center",
      "textResizing": "auto-width",
      "selected": false,
      "visible": true,
      "rotation": 0
    }
  ]
}
```

## Property Value Ranges & Constraints

### Numeric Ranges

- **Positions (x, y)**: Can be negative or positive (elements can be outside artboard)
- **Dimensions (width, height)**: Minimum 1 pixel
- **Rotation**: 0-360 degrees, wraps around
- **Font size**: 8-200 pixels recommended
- **Font weight**: 100-900 (multiples of 100)
- **Corner radius**: 0 to half of smallest dimension
- **Pan sensitivity**: 0.1-5.0
- **Zoom sensitivity**: 0.1-3.0

### Color Values

- All color properties accept hex values: `#RRGGBB` or `#RGB`
- Transparency not currently supported

### Text Content

- Text content supports Unicode characters
- Line breaks are preserved with `\n`
- Empty strings are allowed

## Import/Export Behavior

### Drag & Drop Support

- **Image files**: Automatically added as image elements at drop position
- **JSON project files**: Shows dialog to import as new project or elements
- **JSON canvas files**: Imported directly as elements (backward compatibility)

### Import Options

1. **Import as Project**: Creates new project with all artboard settings preserved
2. **Import as Elements**: Adds elements to current canvas, preserving element properties

### Project Limits

- When importing as project and limit is reached, oldest project is automatically removed
- User is notified when projects are auto-removed

## Usage Notes

1. **Aspect Ratio Lock**: When `artboardAspectRatio` is not null, changing width automatically adjusts height and vice versa
2. **Element Hierarchy**: Child elements move with their parent groups
3. **Selection State**: Only used for UI, not persisted in saved projects
4. **Loading State**: Temporary state for images, not persisted
5. **Isolation Mode**: Temporary view state, not persisted in exports
6. **Drag & Drop**: Project files with artboard metadata trigger import dialog, canvas files import directly
