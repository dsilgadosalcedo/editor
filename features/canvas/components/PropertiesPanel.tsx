import React from "react";
import { Input } from "@/components/ui/input";
import { NumberInput } from "./NumberInput";
import { Button } from "@/components/ui/button";
import {
  AlignStartHorizontal,
  AlignHorizontalJustifyCenter,
  AlignEndHorizontal,
  AlignStartVertical,
  AlignVerticalJustifyCenter,
  AlignEndVertical,
} from "lucide-react";
import type { CanvasElementData } from "../store/useCanvasStore";
import { useCanvasStore } from "../store/useCanvasStore";

export default function PropertiesPanel() {
  const {
    artboardDimensions,
    setArtboardDimensions,
    selectedElement,
    getSelectedElementData,
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

  const handleTextInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedElement) return;
    updateTextContent(selectedElement, e.target.value);
  };

  return (
    <div className="z-20 m-4 p-1 bg-properties-blue/20 dark:bg-white/10 rounded-2xl shadow flex flex-col backdrop-blur-sm">
      <div className="flex-1 overflow-y-auto bg-white/15 dark:bg-white/10 border border-properties-blue dark:border-white/20 rounded-xl p-4 w-64">
        {!selectedElementData ? (
          <>
            <div className="text-properties-text dark:text-foreground font-medium mb-4">
              Artboard
            </div>
            <div className="space-y-4">
              <div>
                <div className="text-properties-text dark:text-foreground text-sm mb-2">
                  Dimensions
                </div>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center">
                    <span className="text-properties-text dark:text-foreground mr-2">
                      x
                    </span>
                    <NumberInput
                      value={artboardDimensions.width}
                      onChange={handleUpdateArtboardWidth}
                      onInstantChange={handleUpdateArtboardWidth}
                      className="h-8 w-21 bg-white/20 border-white/60 text-properties-text dark:text-foreground"
                      aria-label="Artboard width"
                    />
                  </div>
                  <div className="flex items-center">
                    <span className="text-properties-text dark:text-foreground mr-2">
                      y
                    </span>
                    <NumberInput
                      value={artboardDimensions.height}
                      onChange={handleUpdateArtboardHeight}
                      onInstantChange={handleUpdateArtboardHeight}
                      className="h-8 w-21 bg-white/20 border-white/60 text-properties-text dark:text-foreground"
                      aria-label="Artboard height"
                    />
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="space-y-6">
            {/* Element Name Input */}
            <section>
              <div className="text-sm font-bold text-properties-text dark:text-foreground mb-2">
                Name
              </div>
              <Input
                value={selectedElementData.name || ""}
                onChange={(e) =>
                  updateName(selectedElementData.id, e.target.value)
                }
                className="h-8 w-full bg-white/20 border-white/60 text-properties-text dark:text-foreground"
                aria-label="Element name"
              />
            </section>
            {selectedElementData.type === "text" ? (
              <>
                {/* Content Input */}
                <section>
                  <div className="text-sm font-bold text-properties-text dark:text-foreground mb-2">
                    Content
                  </div>
                  <Input
                    value={selectedElementData.content || ""}
                    onChange={handleTextInputChange}
                    className="h-8 w-full bg-white/20 border-white/60 text-properties-text dark:text-foreground"
                  />
                </section>
                {/* Text Color Input */}
                <section>
                  <div className="text-sm font-bold text-properties-text dark:text-foreground mb-2">
                    Text Color
                  </div>
                  <Input
                    type="color"
                    value={selectedElementData.color}
                    onChange={(e) =>
                      updateFillColor(selectedElementData.id, e.target.value)
                    }
                    className="w-full h-8 p-0 rounded"
                    aria-label="Text color"
                  />
                </section>
                {/* Font Size & Font Weight Row */}
                <section>
                  <div className="text-sm font-bold text-properties-text dark:text-foreground mb-2">
                    Font
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center">
                      <span className="w-12 text-xs text-properties-text dark:text-foreground mr-2">
                        Size
                      </span>
                      <NumberInput
                        value={selectedElementData.fontSize || 16}
                        min={1}
                        onChange={(val) =>
                          updateFontSize(selectedElementData.id, val)
                        }
                        onInstantChange={(val) =>
                          updateFontSize(selectedElementData.id, val)
                        }
                        className="h-8 w-21 bg-white/20 border-white/60 text-properties-text dark:text-foreground"
                        aria-label="Font size"
                      />
                    </div>

                    <div className="flex items-center">
                      <span className="w-12 text-xs text-properties-text dark:text-foreground mr-2">
                        Weight
                      </span>
                      <NumberInput
                        value={selectedElementData.fontWeight || 400}
                        min={100}
                        max={900}
                        step={100}
                        onChange={(val) =>
                          updateFontWeight(selectedElementData.id, val)
                        }
                        onInstantChange={(val) =>
                          updateFontWeight(selectedElementData.id, val)
                        }
                        className="h-8 w-21 bg-white/20 border-white/60 text-properties-text dark:text-foreground"
                        aria-label="Font weight"
                      />
                    </div>
                  </div>
                </section>
                {/* Width & Height for Text */}
                <section>
                  <div className="text-sm font-bold text-properties-text dark:text-foreground mb-2">
                    Dimensions
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center">
                      <span className="w-12 text-xs text-properties-text dark:text-foreground mr-2">
                        Width
                      </span>
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
                        className="h-8 w-21 bg-white/20 border-white/60 text-properties-text dark:text-foreground"
                        aria-label="Text width"
                      />
                    </div>
                    <div className="flex items-center">
                      <span className="w-12 text-xs text-properties-text dark:text-foreground mr-2">
                        Height
                      </span>
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
                        className="h-8 w-21 bg-white/20 border-white/60 text-properties-text dark:text-foreground"
                        aria-label="Text height"
                      />
                    </div>
                  </div>
                </section>
                {/* Letter Spacing Input */}
                <section>
                  <div className="text-sm font-bold text-properties-text dark:text-foreground mb-2">
                    Letter Spacing
                  </div>
                  <NumberInput
                    value={selectedElementData.letterSpacing || 0}
                    onChange={(val) =>
                      updateLetterSpacing(selectedElementData.id, val)
                    }
                    onInstantChange={(val) =>
                      updateLetterSpacing(selectedElementData.id, val)
                    }
                    className="h-8 w-21 bg-white/20 border-white/60 text-properties-text dark:text-foreground"
                    aria-label="Letter spacing"
                  />
                </section>
                {/* Line Height Input */}
                <section>
                  <div className="text-sm font-bold text-properties-text dark:text-foreground mb-2">
                    Line Height
                  </div>
                  <NumberInput
                    value={selectedElementData.lineHeight || 20}
                    min={1}
                    onChange={(val) =>
                      updateLineHeight(selectedElementData.id, val)
                    }
                    onInstantChange={(val) =>
                      updateLineHeight(selectedElementData.id, val)
                    }
                    className="h-8 w-21 bg-white/20 border-white/60 text-properties-text dark:text-foreground"
                    aria-label="Line height"
                  />
                </section>
                {/* Alignment Input */}
                <section>
                  <div className="text-sm font-bold text-properties-text dark:text-foreground mb-2">
                    Alignment
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        updateHorizontalAlign(selectedElementData.id, "left")
                      }
                      className="h-8 w-8 text-properties-text dark:text-foreground"
                      aria-label="Align left"
                    >
                      <AlignStartVertical className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        updateHorizontalAlign(selectedElementData.id, "center")
                      }
                      className="h-8 w-8 text-properties-text dark:text-foreground"
                      aria-label="Align center"
                    >
                      <AlignHorizontalJustifyCenter className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        updateHorizontalAlign(selectedElementData.id, "right")
                      }
                      className="h-8 w-8 text-properties-text dark:text-foreground"
                      aria-label="Align right"
                    >
                      <AlignEndVertical className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center space-x-1 mt-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        updateVerticalAlign(selectedElementData.id, "top")
                      }
                      className="h-8 w-8 text-properties-text dark:text-foreground"
                      aria-label="Align top"
                    >
                      <AlignStartHorizontal className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        updateVerticalAlign(selectedElementData.id, "middle")
                      }
                      className="h-8 w-8 text-properties-text dark:text-foreground"
                      aria-label="Align middle"
                    >
                      <AlignVerticalJustifyCenter className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        updateVerticalAlign(selectedElementData.id, "bottom")
                      }
                      className="h-8 w-8 text-properties-text dark:text-foreground"
                      aria-label="Align bottom"
                    >
                      <AlignEndHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </section>
              </>
            ) : selectedElementData.type === "image" ? (
              <>
                {/* Image Source Input */}
                <section>
                  <div className="text-sm font-bold text-properties-text dark:text-foreground mb-2">
                    Image Source
                  </div>
                  <Input
                    value={selectedElementData.src || ""}
                    onChange={(e) =>
                      updateImageSrc(selectedElementData.id, e.target.value)
                    }
                    className="h-8 w-full bg-white/20 border-white/60 text-properties-text dark:text-foreground"
                    placeholder="Enter image URL"
                    aria-label="Image source URL"
                  />
                </section>

                <section>
                  <div className="text-sm font-bold text-properties-text dark:text-foreground mb-2">
                    Dimensions
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center">
                      <span className="w-12 text-xs text-properties-text dark:text-foreground mr-2">
                        Width
                      </span>
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
                        className="h-8 w-21 bg-white/20 border-white/60 text-properties-text dark:text-foreground"
                        aria-label="Image width"
                      />
                    </div>
                    <div className="flex items-center">
                      <span className="w-12 text-xs text-properties-text dark:text-foreground mr-2">
                        Height
                      </span>
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
                        className="h-8 w-21 bg-white/20 border-white/60 text-properties-text dark:text-foreground"
                        aria-label="Image height"
                      />
                    </div>
                  </div>
                </section>

                {/* Corner Radius Input for Images */}
                <section>
                  <div className="text-sm font-bold text-properties-text dark:text-foreground mb-2">
                    Appearance
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="flex items-center">
                      <span className="w-12 text-xs text-properties-text dark:text-foreground mr-2">
                        Radius
                      </span>
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
                        className="h-8 w-21 bg-white/20 border-white/60 text-properties-text dark:text-foreground"
                        aria-label="Corner radius"
                      />
                    </div>
                  </div>
                </section>

                {/* Border Width Input for Images */}
                <section>
                  <div className="text-sm font-bold text-properties-text dark:text-foreground mb-2">
                    Border Width
                  </div>
                  <NumberInput
                    value={selectedElementData.borderWidth || 0}
                    min={0}
                    onChange={(val) =>
                      updateBorderWidth(selectedElementData.id, val)
                    }
                    onInstantChange={(val) =>
                      updateBorderWidth(selectedElementData.id, val)
                    }
                    className="h-8 w-21 bg-white/20 border-white/60 text-properties-text dark:text-foreground"
                    aria-label="Border width"
                  />
                </section>

                {/* Border Color Input for Images */}
                <section>
                  <div className="text-sm font-bold text-properties-text dark:text-foreground mb-2">
                    Border Color
                  </div>
                  <Input
                    type="color"
                    value={selectedElementData.borderColor || "#000000"}
                    onChange={(e) =>
                      updateBorderColor(selectedElementData.id, e.target.value)
                    }
                    className="w-full h-8 p-0 rounded"
                    aria-label="Border color"
                  />
                </section>

                {/* Shadow Blur Input for Images */}
                <section>
                  <div className="text-sm font-bold text-properties-text dark:text-foreground mb-2">
                    Shadow Blur
                  </div>
                  <NumberInput
                    value={selectedElementData.shadowBlur || 0}
                    min={0}
                    onChange={(val) =>
                      updateShadowBlur(selectedElementData.id, val)
                    }
                    onInstantChange={(val) =>
                      updateShadowBlur(selectedElementData.id, val)
                    }
                    className="h-8 w-21 bg-white/20 border-white/60 text-properties-text dark:text-foreground"
                    aria-label="Shadow blur"
                  />
                </section>

                {/* Shadow Color Input for Images */}
                <section>
                  <div className="text-sm font-bold text-properties-text dark:text-foreground mb-2">
                    Shadow Color
                  </div>
                  <Input
                    type="color"
                    value={selectedElementData.shadowColor || "#000000"}
                    onChange={(e) =>
                      updateShadowColor(selectedElementData.id, e.target.value)
                    }
                    className="w-full h-8 p-0 rounded"
                    aria-label="Shadow color"
                  />
                </section>
              </>
            ) : (
              <>
                {/* Background Color Input */}
                <section>
                  <div className="text-sm font-bold text-properties-text dark:text-foreground mb-2">
                    Background Color
                  </div>
                  <Input
                    type="color"
                    value={selectedElementData.color}
                    onChange={(e) =>
                      updateFillColor(selectedElementData.id, e.target.value)
                    }
                    className="w-full h-8 p-0 rounded"
                    aria-label="Background color"
                  />
                </section>

                <section>
                  <div className="text-sm font-bold text-properties-text dark:text-foreground mb-2">
                    Dimensions
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center">
                      <span className="w-12 text-xs text-properties-text dark:text-foreground mr-2">
                        Width
                      </span>
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
                        className="h-8 w-21 bg-white/20 border-white/60 text-properties-text dark:text-foreground"
                        aria-label="Rectangle width"
                      />
                    </div>
                    <div className="flex items-center">
                      <span className="w-12 text-xs text-properties-text dark:text-foreground mr-2">
                        Height
                      </span>
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
                        className="h-8 w-21 bg-white/20 border-white/60 text-properties-text dark:text-foreground"
                        aria-label="Rectangle height"
                      />
                    </div>
                  </div>
                </section>

                {/* Corner Radius Input */}
                <section>
                  <div className="text-sm font-bold text-properties-text dark:text-foreground mb-2">
                    Appearance
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="flex items-center">
                      <span className="w-12 text-xs text-properties-text dark:text-foreground mr-2">
                        Radius
                      </span>
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
                        className="h-8 w-21 bg-white/20 border-white/60 text-properties-text dark:text-foreground"
                        aria-label="Corner radius"
                      />
                    </div>
                    <div className="flex items-center">
                      <span className="w-12 text-xs text-properties-text dark:text-foreground mr-2">
                        Opacity
                      </span>
                      <NumberInput
                        value={100}
                        onChange={() => {
                          console.log("opacity changed");
                        }}
                        onInstantChange={() => {
                          console.log("opacity changed");
                        }}
                        className="h-8 w-21 bg-white/20 border-white/60 text-properties-text dark:text-foreground"
                        aria-label="Opacity"
                      />
                    </div>
                  </div>
                </section>

                {/* Border Width Input */}
                <section>
                  <div className="text-sm font-bold text-properties-text dark:text-foreground mb-2">
                    Border Width
                  </div>
                  <NumberInput
                    value={selectedElementData.borderWidth || 0}
                    min={0}
                    onChange={(val) =>
                      updateBorderWidth(selectedElementData.id, val)
                    }
                    onInstantChange={(val) =>
                      updateBorderWidth(selectedElementData.id, val)
                    }
                    className="h-8 w-21 bg-white/20 border-white/60 text-properties-text dark:text-foreground"
                    aria-label="Border width"
                  />
                </section>

                {/* Border Color Input */}
                <section>
                  <div className="text-sm font-bold text-properties-text dark:text-foreground mb-2">
                    Border Color
                  </div>
                  <Input
                    type="color"
                    value={selectedElementData.borderColor || "#000000"}
                    onChange={(e) =>
                      updateBorderColor(selectedElementData.id, e.target.value)
                    }
                    className="w-full h-8 p-0 rounded"
                    aria-label="Border color"
                  />
                </section>

                {/* Shadow Blur Input */}
                <section>
                  <div className="text-sm font-bold text-properties-text dark:text-foreground mb-2">
                    Shadow Blur
                  </div>
                  <NumberInput
                    value={selectedElementData.shadowBlur || 0}
                    min={0}
                    onChange={(val) =>
                      updateShadowBlur(selectedElementData.id, val)
                    }
                    onInstantChange={(val) =>
                      updateShadowBlur(selectedElementData.id, val)
                    }
                    className="h-8 w-21 bg-white/20 border-white/60 text-properties-text dark:text-foreground"
                    aria-label="Shadow blur"
                  />
                </section>

                {/* Shadow Color Input */}
                <section>
                  <div className="text-sm font-bold text-properties-text dark:text-foreground mb-2">
                    Shadow Color
                  </div>
                  <Input
                    type="color"
                    value={selectedElementData.shadowColor || "#000000"}
                    onChange={(e) =>
                      updateShadowColor(selectedElementData.id, e.target.value)
                    }
                    className="w-full h-8 p-0 rounded"
                    aria-label="Shadow color"
                  />
                </section>
              </>
            )}

            <section>
              <div className="text-sm font-bold text-properties-text dark:text-foreground mb-2">
                Position
              </div>
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center">
                  <span className="text-xs text-properties-text dark:text-foreground mr-2">
                    X
                  </span>
                  <NumberInput
                    value={selectedElementData.x}
                    onChange={(val) =>
                      moveElement(
                        selectedElementData.id,
                        val - selectedElementData.x,
                        0
                      )
                    }
                    onInstantChange={(val) =>
                      moveElement(
                        selectedElementData.id,
                        val - selectedElementData.x,
                        0
                      )
                    }
                    className="h-8 w-21 bg-white/20 border-white/60 text-properties-text dark:text-foreground"
                    aria-label="Element X position"
                  />
                </div>
                <div className="flex items-center">
                  <span className="text-xs text-properties-text dark:text-foreground mr-2">
                    Y
                  </span>
                  <NumberInput
                    value={selectedElementData.y}
                    onChange={(val) =>
                      moveElement(
                        selectedElementData.id,
                        0,
                        val - selectedElementData.y
                      )
                    }
                    onInstantChange={(val) =>
                      moveElement(
                        selectedElementData.id,
                        0,
                        val - selectedElementData.y
                      )
                    }
                    className="h-8 w-21 bg-white/20 border-white/60 text-properties-text dark:text-foreground"
                    aria-label="Element Y position"
                  />
                </div>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
