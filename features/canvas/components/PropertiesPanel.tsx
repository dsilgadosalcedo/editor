import React from "react";
import { useShallow } from "zustand/react/shallow";
import { useCanvasStore } from "../store/useCanvasStore.new";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArtboardProperties,
  PositionProperties,
  PropertiesPanelHeader,
  ElementPropertiesRenderer,
} from "./properties";

export default function PropertiesPanel() {
  // Use optimized selectors to prevent unnecessary re-renders
  const selectedElements = useCanvasStore((state) => state.selectedElements);
  const selectedElementData = useCanvasStore((state) =>
    state.getSelectedElementData()
  );
  const hasMultipleSelection = useCanvasStore((state) =>
    state.hasMultipleSelection()
  );
  const rightSidebarDocked = useCanvasStore(
    (state) => state.rightSidebarDocked
  );

  // Group related actions together using useShallow
  const elementActions = useCanvasStore(
    useShallow((state) => ({
      updateName: state.updateName,
      updateTextContent: state.updateTextContent,
      updateFillColor: state.updateFillColor,
      updateFontSize: state.updateFontSize,
      updateFontWeight: state.updateFontWeight,
      updateLetterSpacing: state.updateLetterSpacing,
      updateLineHeight: state.updateLineHeight,
      updateHorizontalAlign: state.updateHorizontalAlign,
      updateVerticalAlign: state.updateVerticalAlign,
      resizeElement: state.resizeElement,
      moveElement: state.moveElement,
      updateCornerRadius: state.updateCornerRadius,
      updateCornerRadiusNoHistory: state.updateCornerRadiusNoHistory,
      updateBorderWidth: state.updateBorderWidth,
      updateBorderColor: state.updateBorderColor,
      updateShadowBlur: state.updateShadowBlur,
      updateShadowColor: state.updateShadowColor,
      toggleAspectRatioLock: state.toggleAspectRatioLock,
      updateImageSrc: state.updateImageSrc,
      updateTextResizing: state.updateTextResizing,
      updateRotation: state.updateRotation,
    }))
  );

  const alignmentActions = useCanvasStore(
    useShallow((state) => ({
      alignToArtboardLeft: state.alignToArtboardLeft,
      alignToArtboardRight: state.alignToArtboardRight,
      alignToArtboardTop: state.alignToArtboardTop,
      alignToArtboardBottom: state.alignToArtboardBottom,
      alignToArtboardCenterHorizontal: state.alignToArtboardCenterHorizontal,
      alignToArtboardCenterVertical: state.alignToArtboardCenterVertical,
    }))
  );

  const uiActions = useCanvasStore(
    useShallow((state) => ({
      toggleRightSidebarDock: state.toggleRightSidebarDock,
    }))
  );

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
          onToggleDock={uiActions.toggleRightSidebarDock}
        />

        {/* Content */}
        <CardContent className="px-4">
          {selectedElements.length === 0 || hasMultipleSelection ? (
            <ArtboardProperties />
          ) : selectedElementData ? (
            <div className="space-y-6">
              {/* Element-specific properties */}
              <ElementPropertiesRenderer
                element={selectedElementData}
                onNameChange={(name) =>
                  elementActions.updateName(selectedElementData.id, name)
                }
                onContentChange={(content) =>
                  elementActions.updateTextContent(
                    selectedElementData.id,
                    content
                  )
                }
                onColorChange={(color) =>
                  elementActions.updateFillColor(selectedElementData.id, color)
                }
                onFontSizeChange={(size) =>
                  elementActions.updateFontSize(selectedElementData.id, size)
                }
                onFontWeightChange={(weight) =>
                  elementActions.updateFontWeight(
                    selectedElementData.id,
                    weight
                  )
                }
                onDimensionsChange={(width, height) =>
                  elementActions.resizeElement(
                    selectedElementData.id,
                    width,
                    height,
                    false
                  )
                }
                onLetterSpacingChange={(spacing) =>
                  elementActions.updateLetterSpacing(
                    selectedElementData.id,
                    spacing
                  )
                }
                onLineHeightChange={(height) =>
                  elementActions.updateLineHeight(
                    selectedElementData.id,
                    height
                  )
                }
                onHorizontalAlignChange={(align) =>
                  elementActions.updateHorizontalAlign(
                    selectedElementData.id,
                    align
                  )
                }
                onVerticalAlignChange={(align) =>
                  elementActions.updateVerticalAlign(
                    selectedElementData.id,
                    align
                  )
                }
                onToggleAspectRatioLock={() =>
                  elementActions.toggleAspectRatioLock(selectedElementData.id)
                }
                onTextResizingChange={(resizing) =>
                  elementActions.updateTextResizing(
                    selectedElementData.id,
                    resizing
                  )
                }
                onSrcChange={(src) =>
                  elementActions.updateImageSrc(selectedElementData.id, src)
                }
                onCornerRadiusChange={(radius) =>
                  elementActions.updateCornerRadius(
                    selectedElementData.id,
                    radius
                  )
                }
                onCornerRadiusInstantChange={(radius) =>
                  elementActions.updateCornerRadiusNoHistory(
                    selectedElementData.id,
                    radius
                  )
                }
                onBorderWidthChange={(width) =>
                  elementActions.updateBorderWidth(
                    selectedElementData.id,
                    width
                  )
                }
                onBorderColorChange={(color) =>
                  elementActions.updateBorderColor(
                    selectedElementData.id,
                    color
                  )
                }
                onShadowBlurChange={(blur) =>
                  elementActions.updateShadowBlur(selectedElementData.id, blur)
                }
                onShadowColorChange={(color) =>
                  elementActions.updateShadowColor(
                    selectedElementData.id,
                    color
                  )
                }
              />

              {/* Position properties (common for all elements) */}
              <PositionProperties
                x={selectedElementData.x}
                y={selectedElementData.y}
                rotation={selectedElementData.rotation || 0}
                onXChange={(deltaX) =>
                  elementActions.moveElement(selectedElementData.id, deltaX, 0)
                }
                onYChange={(deltaY) =>
                  elementActions.moveElement(selectedElementData.id, 0, deltaY)
                }
                onRotationChange={(rotation) =>
                  elementActions.updateRotation(
                    selectedElementData.id,
                    rotation
                  )
                }
                onAlignLeft={() =>
                  alignmentActions.alignToArtboardLeft(selectedElementData.id)
                }
                onAlignRight={() =>
                  alignmentActions.alignToArtboardRight(selectedElementData.id)
                }
                onAlignTop={() =>
                  alignmentActions.alignToArtboardTop(selectedElementData.id)
                }
                onAlignBottom={() =>
                  alignmentActions.alignToArtboardBottom(selectedElementData.id)
                }
                onAlignCenterHorizontal={() =>
                  alignmentActions.alignToArtboardCenterHorizontal(
                    selectedElementData.id
                  )
                }
                onAlignCenterVertical={() =>
                  alignmentActions.alignToArtboardCenterVertical(
                    selectedElementData.id
                  )
                }
              />
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
