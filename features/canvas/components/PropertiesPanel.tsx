import React from "react";
import { Input } from "@/components/ui/input";
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

export default function PropertiesPanel() {
  const {
    artboardDimensions,
    setArtboardDimensions,
    selectedElements,
    getSelectedElementData,
    hasMultipleSelection,
    updateTextContent,
    resizeElement,
    moveElement,
    updateCornerRadius,
    updateFillColor,
    updateBorderWidth,
    updateBorderColor,
    updateShadowBlur,
    updateShadowColor,
    updateName,
    updateFontSize,
    updateFontWeight,
    updateLetterSpacing,
    updateLineHeight,
    updateHorizontalAlign,
    updateVerticalAlign,
    updateImageSrc,
  } = useCanvasStore();

  const selectedElementData = getSelectedElementData();

  const handleUpdateArtboardWidth = (width: number) => {
    setArtboardDimensions({ ...artboardDimensions, width });
  };

  const handleUpdateArtboardHeight = (height: number) => {
    setArtboardDimensions({ ...artboardDimensions, height });
  };

  return (
    <div className="z-20 m-4 p-1 bg-card/80 rounded-[1.25rem] shadow flex flex-col backdrop-blur-sm">
      <div className="flex-1 overflow-y-auto bg-white/15 dark:bg-white/10 border border-sky-harbor/80 rounded-xl p-4 w-64">
        {selectedElements.length === 0 ? (
          <ArtboardProperties
            dimensions={artboardDimensions}
            onWidthChange={handleUpdateArtboardWidth}
            onHeightChange={handleUpdateArtboardHeight}
          />
        ) : hasMultipleSelection() ? (
          <div className="space-y-4">
            <PropertySection>
              <PropertyTitle>Multiple Selection</PropertyTitle>
              <div className="text-sm text-muted-foreground">
                {selectedElements.length} elements selected
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                Individual properties are not available when multiple elements
                are selected. You can still move and delete the selected
                elements.
              </div>
            </PropertySection>
          </div>
        ) : selectedElementData ? (
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
                    resizeElement(selectedElementData.id, width, height)
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
                  onNameChange={(name) =>
                    updateName(selectedElementData.id, name)
                  }
                  onSrcChange={(src) =>
                    updateImageSrc(selectedElementData.id, src)
                  }
                  onDimensionsChange={(width, height) =>
                    resizeElement(selectedElementData.id, width, height)
                  }
                  onCornerRadiusChange={(radius) =>
                    updateCornerRadius(selectedElementData.id, radius)
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
                      <NumberInput
                        value={selectedElementData.width}
                        onChange={(val) =>
                          resizeElement(
                            selectedElementData.id,
                            val,
                            selectedElementData.height
                          )
                        }
                        onInstantChange={(val) =>
                          resizeElement(
                            selectedElementData.id,
                            val,
                            selectedElementData.height
                          )
                        }
                        aria-label="Rectangle width"
                      />
                    </PropertyInput>
                    <PropertyInput>
                      <PropertyLabel>Height</PropertyLabel>
                      <NumberInput
                        value={selectedElementData.height}
                        onChange={(val) =>
                          resizeElement(
                            selectedElementData.id,
                            selectedElementData.width,
                            val
                          )
                        }
                        onInstantChange={(val) =>
                          resizeElement(
                            selectedElementData.id,
                            selectedElementData.width,
                            val
                          )
                        }
                        aria-label="Rectangle height"
                      />
                    </PropertyInput>
                  </PropertyStack>
                </PropertySection>

                <PropertySection>
                  <PropertyTitle>Appearance</PropertyTitle>
                  <PropertyStack distribution="column">
                    <PropertyInput>
                      <PropertyLabel>Background</PropertyLabel>
                      <ColorPicker
                        value={selectedElementData.color}
                        onChange={(color) =>
                          updateFillColor(selectedElementData.id, color)
                        }
                        aria-label="Background color"
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
                        aria-label="Corner radius"
                      />
                    </PropertyInput>
                    <PropertyInput>
                      <PropertyLabel>Opacity</PropertyLabel>
                      <NumberInput
                        value={100}
                        onChange={() => {
                          console.log("opacity changed");
                        }}
                        onInstantChange={() => {
                          console.log("opacity changed");
                        }}
                        aria-label="Opacity"
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
                      />
                    </PropertyInput>
                  </PropertyStack>
                </PropertySection>

                <PositionProperties
                  x={selectedElementData.x}
                  y={selectedElementData.y}
                  onXChange={(deltaX) =>
                    moveElement(selectedElementData.id, deltaX, 0)
                  }
                  onYChange={(deltaY) =>
                    moveElement(selectedElementData.id, 0, deltaY)
                  }
                />
              </>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
