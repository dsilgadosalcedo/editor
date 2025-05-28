import React from "react";
import { useCanvasStore } from "../store/useCanvasStore";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArtboardProperties,
  PositionProperties,
  PropertiesPanelHeader,
  ElementPropertiesRenderer,
} from "./properties";

export default function PropertiesPanel() {
  const {
    selectedElements,
    getSelectedElementData,
    hasMultipleSelection,
    updateName,
    updateTextContent,
    updateFillColor,
    updateFontSize,
    updateFontWeight,
    updateLetterSpacing,
    updateLineHeight,
    updateHorizontalAlign,
    updateVerticalAlign,
    resizeElement,
    moveElement,
    updateCornerRadius,
    updateCornerRadiusNoHistory,
    updateBorderWidth,
    updateBorderColor,
    updateShadowBlur,
    updateShadowColor,
    toggleAspectRatioLock,
    updateImageSrc,
    rightSidebarDocked,
    toggleRightSidebarDock,
    updateTextResizing,
    updateRotation,
    alignToArtboardLeft,
    alignToArtboardRight,
    alignToArtboardTop,
    alignToArtboardBottom,
    alignToArtboardCenterHorizontal,
    alignToArtboardCenterVertical,
  } = useCanvasStore();

  const selectedElementData = getSelectedElementData();

  return (
    <div
      className={`z-50 transition-all duration-300 p-1 bg-sidebar/80 rounded-[1.25rem] shadow flex flex-col backdrop-blur-sm ${
        rightSidebarDocked ? "m-4" : "rounded-r-none"
      }`}
    >
      <Card
        className={`flex-1 overflow-y-auto w-64 bg-card/50 dark:bg-card/50 border rounded-xl shadow-sm pt-0`}
      >
        {/* Header */}
        <PropertiesPanelHeader
          rightSidebarDocked={rightSidebarDocked}
          onToggleDock={toggleRightSidebarDock}
        />

        {/* Content */}
        <CardContent className="px-4">
          {selectedElements.length === 0 || hasMultipleSelection() ? (
            <ArtboardProperties />
          ) : selectedElementData ? (
            <div className="space-y-6">
              {/* Element-specific properties */}
              <ElementPropertiesRenderer
                element={selectedElementData}
                onNameChange={(name) =>
                  updateName(selectedElementData.id, name)
                }
                onContentChange={(content) =>
                  updateTextContent(selectedElementData.id, content)
                }
                onColorChange={(color) =>
                  updateFillColor(selectedElementData.id, color)
                }
                onFontSizeChange={(size) =>
                  updateFontSize(selectedElementData.id, size)
                }
                onFontWeightChange={(weight) =>
                  updateFontWeight(selectedElementData.id, weight)
                }
                onDimensionsChange={(width, height) =>
                  resizeElement(selectedElementData.id, width, height, false)
                }
                onLetterSpacingChange={(spacing) =>
                  updateLetterSpacing(selectedElementData.id, spacing)
                }
                onLineHeightChange={(height) =>
                  updateLineHeight(selectedElementData.id, height)
                }
                onHorizontalAlignChange={(align) =>
                  updateHorizontalAlign(selectedElementData.id, align)
                }
                onVerticalAlignChange={(align) =>
                  updateVerticalAlign(selectedElementData.id, align)
                }
                onToggleAspectRatioLock={() =>
                  toggleAspectRatioLock(selectedElementData.id)
                }
                onTextResizingChange={(resizing) =>
                  updateTextResizing(selectedElementData.id, resizing)
                }
                onSrcChange={(src) =>
                  updateImageSrc(selectedElementData.id, src)
                }
                onCornerRadiusChange={(radius) =>
                  updateCornerRadius(selectedElementData.id, radius)
                }
                onCornerRadiusInstantChange={(radius) =>
                  updateCornerRadiusNoHistory(selectedElementData.id, radius)
                }
                onBorderWidthChange={(width) =>
                  updateBorderWidth(selectedElementData.id, width)
                }
                onBorderColorChange={(color) =>
                  updateBorderColor(selectedElementData.id, color)
                }
                onShadowBlurChange={(blur) =>
                  updateShadowBlur(selectedElementData.id, blur)
                }
                onShadowColorChange={(color) =>
                  updateShadowColor(selectedElementData.id, color)
                }
              />

              {/* Position properties (common for all elements) */}
              <PositionProperties
                x={selectedElementData.x}
                y={selectedElementData.y}
                rotation={selectedElementData.rotation || 0}
                onXChange={(deltaX) =>
                  moveElement(selectedElementData.id, deltaX, 0)
                }
                onYChange={(deltaY) =>
                  moveElement(selectedElementData.id, 0, deltaY)
                }
                onRotationChange={(rotation) =>
                  updateRotation(selectedElementData.id, rotation)
                }
                onAlignLeft={() => alignToArtboardLeft(selectedElementData.id)}
                onAlignRight={() =>
                  alignToArtboardRight(selectedElementData.id)
                }
                onAlignTop={() => alignToArtboardTop(selectedElementData.id)}
                onAlignBottom={() =>
                  alignToArtboardBottom(selectedElementData.id)
                }
                onAlignCenterHorizontal={() =>
                  alignToArtboardCenterHorizontal(selectedElementData.id)
                }
                onAlignCenterVertical={() =>
                  alignToArtboardCenterVertical(selectedElementData.id)
                }
              />
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
