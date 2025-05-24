import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  PanelLeftOpen,
  PanelRightOpen,
  Link,
  Unlink,
  ArrowLeftRight,
  ArrowUpDown,
  CornerUpLeft,
  Circle,
  Square,
  Zap,
  Move,
  MoveVertical,
  Scan,
} from "lucide-react";
import { NumberInput } from "./NumberInput";
import { ColorPicker } from "./ColorPicker";
import { useCanvasStore } from "../store/useCanvasStore";
import {
  PropertySection,
  PropertyStack,
  PropertyTitle,
  PropertyInput,
  PropertyLabel,
} from "@/components/ui/property";
import {
  ArtboardProperties,
  PositionProperties,
  TextProperties,
  ImageProperties,
} from "./properties";
import { Separator } from "@/components/ui/separator";

export default function PropertiesPanel() {
  const {
    elements,
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
      className={`z-30 flex flex-col bg-card/95 shadow-xl backdrop-blur-md border border-white/20 transition-all duration-300 p-1 rounded-[1.25rem] ${
        rightSidebarDocked
          ? "m-4 bg-card/80 shadow backdrop-blur-sm"
          : "p-1 rounded-r-none"
      }`}
    >
      <aside className="flex-1 overflow-y-auto bg-white/15 dark:bg-white/10 border border-sky-harbor/80 rounded-xl w-64">
        {/* Header with dock/undock button */}
        <header className="flex items-center justify-between p-3">
          <h3 className="text-sm font-medium text-properties-text dark:text-foreground">
            Properties
          </h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleRightSidebarDock}
            onMouseDown={(e) => e.stopPropagation()}
            className="hover:bg-transparent transition-all duration-200 hover:scale-110 active:scale-95"
            aria-label={rightSidebarDocked ? "Undock sidebar" : "Dock sidebar"}
            title={rightSidebarDocked ? "Undock sidebar" : "Dock sidebar"}
          >
            {rightSidebarDocked ? (
              <PanelLeftOpen className="opacity-70 hover:opacity-100 transition-opacity duration-200" />
            ) : (
              <PanelRightOpen className="opacity-70 hover:opacity-100 transition-opacity duration-200" />
            )}
          </Button>
        </header>

        <Separator />

        {/* Content */}
        <div className="p-4">
          {selectedElements.length === 0 || hasMultipleSelection() ? (
            <ArtboardProperties />
          ) : // ) : hasMultipleSelection() ? (
          //   <div className="space-y-4">
          //     <PropertySection>
          //       <PropertyTitle>Multiple Selection</PropertyTitle>
          //       <div className="text-sm text-muted-foreground">
          //         {selectedElements.length} elements selected
          //       </div>
          //       <div className="text-xs text-muted-foreground mt-2">
          //         Individual properties are not available when multiple elements
          //         are selected. You can still move and delete the selected
          //         elements.
          //       </div>
          //     </PropertySection>
          //   </div>
          selectedElementData ? (
            <div className="space-y-6">
              {selectedElementData.type === "text" ? (
                <>
                  <TextProperties
                    id={selectedElementData.id}
                    name={selectedElementData.name || ""}
                    content={selectedElementData.content || ""}
                    color={selectedElementData.color}
                    fontSize={selectedElementData.fontSize || 16}
                    fontWeight={selectedElementData.fontWeight || 400}
                    width={selectedElementData.width}
                    height={selectedElementData.height}
                    letterSpacing={selectedElementData.letterSpacing || 0}
                    lineHeight={selectedElementData.lineHeight || 20}
                    lockAspectRatio={
                      selectedElementData.lockAspectRatio || false
                    }
                    textResizing={
                      selectedElementData.textResizing || "auto-width"
                    }
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
                      resizeElement(
                        selectedElementData.id,
                        width,
                        height,
                        false
                      )
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
                  />
                </>
              ) : selectedElementData.type === "image" ? (
                <>
                  <ImageProperties
                    id={selectedElementData.id}
                    name={selectedElementData.name || ""}
                    src={selectedElementData.src || ""}
                    width={selectedElementData.width}
                    height={selectedElementData.height}
                    cornerRadius={selectedElementData.cornerRadius || 0}
                    borderWidth={selectedElementData.borderWidth || 0}
                    borderColor={selectedElementData.borderColor || "#000000"}
                    shadowBlur={selectedElementData.shadowBlur || 0}
                    shadowColor={selectedElementData.shadowColor || "#000000"}
                    lockAspectRatio={
                      selectedElementData.lockAspectRatio || false
                    }
                    onNameChange={(name) =>
                      updateName(selectedElementData.id, name)
                    }
                    onSrcChange={(src) =>
                      updateImageSrc(selectedElementData.id, src)
                    }
                    onDimensionsChange={(width, height) =>
                      resizeElement(
                        selectedElementData.id,
                        width,
                        height,
                        false
                      )
                    }
                    onCornerRadiusChange={(radius) =>
                      updateCornerRadius(selectedElementData.id, radius)
                    }
                    onCornerRadiusInstantChange={(radius) =>
                      updateCornerRadiusNoHistory(
                        selectedElementData.id,
                        radius
                      )
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
                    onToggleAspectRatioLock={() =>
                      toggleAspectRatioLock(selectedElementData.id)
                    }
                  />
                </>
              ) : (
                <>
                  <PropertySection>
                    <PropertyTitle>Name</PropertyTitle>
                    <PropertyInput>
                      <Input
                        value={selectedElementData.name || ""}
                        onChange={(e) =>
                          updateName(selectedElementData.id, e.target.value)
                        }
                        placeholder={
                          selectedElementData.type.charAt(0).toUpperCase() +
                          selectedElementData.type.slice(1)
                        }
                        className="h-8 w-full bg-white/20 border-white/60 text-properties-text dark:text-foreground"
                        aria-label="Element name"
                      />
                    </PropertyInput>
                  </PropertySection>

                  <PropertySection>
                    <PropertyTitle>Dimensions</PropertyTitle>
                    <PropertyStack distribution="column">
                      <PropertyInput>
                        <PropertyLabel>Width</PropertyLabel>
                        <div className="flex items-center gap-2">
                          <NumberInput
                            value={selectedElementData.width}
                            onChange={(val) =>
                              resizeElement(
                                selectedElementData.id,
                                val,
                                selectedElementData.height,
                                false
                              )
                            }
                            onInstantChange={(val) =>
                              resizeElement(
                                selectedElementData.id,
                                val,
                                selectedElementData.height,
                                false
                              )
                            }
                            icon={<ArrowLeftRight className="h-3 w-3" />}
                            aria-label="Rectangle width"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              toggleAspectRatioLock(selectedElementData.id)
                            }
                            className={`h-6 w-6 ${
                              selectedElementData.lockAspectRatio
                                ? "text-sky-harbor"
                                : "text-gray-400"
                            }`}
                            title={
                              selectedElementData.lockAspectRatio
                                ? "Unlock aspect ratio"
                                : "Lock aspect ratio"
                            }
                            aria-label={
                              selectedElementData.lockAspectRatio
                                ? "Unlock aspect ratio"
                                : "Lock aspect ratio"
                            }
                          >
                            {selectedElementData.lockAspectRatio ? (
                              <Link className="h-3 w-3" />
                            ) : (
                              <Unlink className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                      </PropertyInput>
                      <PropertyInput>
                        <PropertyLabel>Height</PropertyLabel>
                        <NumberInput
                          value={selectedElementData.height}
                          onChange={(val) =>
                            resizeElement(
                              selectedElementData.id,
                              selectedElementData.width,
                              val,
                              false
                            )
                          }
                          onInstantChange={(val) =>
                            resizeElement(
                              selectedElementData.id,
                              selectedElementData.width,
                              val,
                              false
                            )
                          }
                          icon={<ArrowUpDown className="h-3 w-3" />}
                          aria-label="Rectangle height"
                        />
                      </PropertyInput>
                    </PropertyStack>
                  </PropertySection>

                  <PropertySection>
                    <PropertyTitle>Appearance</PropertyTitle>
                    <PropertyStack>
                      <PropertyInput>
                        <PropertyLabel>Background</PropertyLabel>
                        <ColorPicker
                          value={selectedElementData.color}
                          onChange={(color) =>
                            updateFillColor(selectedElementData.id, color)
                          }
                          aria-label="Background color"
                          layerName={
                            selectedElementData.name ||
                            selectedElementData.type.charAt(0).toUpperCase() +
                              selectedElementData.type.slice(1)
                          }
                          propertyName="Background"
                        />
                      </PropertyInput>
                      <PropertyInput>
                        <PropertyLabel>Radius</PropertyLabel>
                        <NumberInput
                          value={selectedElementData.cornerRadius || 0}
                          min={0}
                          max={Math.floor(
                            Math.min(
                              selectedElementData.width,
                              selectedElementData.height
                            ) / 2
                          )}
                          onChange={(val) =>
                            updateCornerRadius(
                              selectedElementData.id,
                              Math.max(
                                0,
                                Math.min(
                                  val,
                                  Math.floor(
                                    Math.min(
                                      selectedElementData.width,
                                      selectedElementData.height
                                    ) / 2
                                  )
                                )
                              )
                            )
                          }
                          onInstantChange={(val) =>
                            updateCornerRadiusNoHistory(
                              selectedElementData.id,
                              Math.max(
                                0,
                                Math.min(
                                  val,
                                  Math.floor(
                                    Math.min(
                                      selectedElementData.width,
                                      selectedElementData.height
                                    ) / 2
                                  )
                                )
                              )
                            )
                          }
                          icon={<Scan className="h-3 w-3" />}
                          aria-label="Corner radius"
                        />
                      </PropertyInput>
                    </PropertyStack>
                  </PropertySection>

                  <PropertySection>
                    <PropertyTitle>Border</PropertyTitle>
                    <PropertyStack distribution="column">
                      <PropertyInput>
                        <PropertyLabel>Width</PropertyLabel>
                        <NumberInput
                          value={selectedElementData.borderWidth || 0}
                          min={0}
                          onChange={(val) =>
                            updateBorderWidth(selectedElementData.id, val)
                          }
                          onInstantChange={(val) =>
                            updateBorderWidth(selectedElementData.id, val)
                          }
                          icon={<Square className="h-3 w-3" />}
                          aria-label="Border width"
                        />
                      </PropertyInput>
                      <PropertyInput>
                        <PropertyLabel>Color</PropertyLabel>
                        <ColorPicker
                          value={selectedElementData.borderColor || "#000000"}
                          onChange={(color) =>
                            updateBorderColor(selectedElementData.id, color)
                          }
                          aria-label="Border color"
                          layerName={
                            selectedElementData.name ||
                            selectedElementData.type.charAt(0).toUpperCase() +
                              selectedElementData.type.slice(1)
                          }
                          propertyName="Border"
                        />
                      </PropertyInput>
                    </PropertyStack>
                  </PropertySection>

                  <PropertySection>
                    <PropertyTitle>Shadow</PropertyTitle>
                    <PropertyStack distribution="column">
                      <PropertyInput>
                        <PropertyLabel>Blur</PropertyLabel>
                        <NumberInput
                          value={selectedElementData.shadowBlur || 0}
                          min={0}
                          onChange={(val) =>
                            updateShadowBlur(selectedElementData.id, val)
                          }
                          onInstantChange={(val) =>
                            updateShadowBlur(selectedElementData.id, val)
                          }
                          icon={<Zap className="h-3 w-3" />}
                          aria-label="Shadow blur"
                        />
                      </PropertyInput>
                      <PropertyInput>
                        <PropertyLabel>Color</PropertyLabel>
                        <ColorPicker
                          value={selectedElementData.shadowColor || "#000000"}
                          onChange={(color) =>
                            updateShadowColor(selectedElementData.id, color)
                          }
                          aria-label="Shadow color"
                          layerName={
                            selectedElementData.name ||
                            selectedElementData.type.charAt(0).toUpperCase() +
                              selectedElementData.type.slice(1)
                          }
                          propertyName="Shadow"
                        />
                      </PropertyInput>
                    </PropertyStack>
                  </PropertySection>
                </>
              )}

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
        </div>
      </aside>
    </div>
  );
}
