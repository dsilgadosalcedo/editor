import React from "react";
import { Input } from "@/components/ui/input";
import { NumberInput } from "@/components/number-input";
import type { CanvasElementData } from "@/hooks/useCanvasElements";

interface PropertiesSidebarProps {
  artboardDimensions: { width: number; height: number };
  onUpdateArtboardWidth: (width: number) => void;
  onUpdateArtboardHeight: (height: number) => void;
  selectedElementData?: CanvasElementData;
  onTextChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleResizeElement: (id: string, width: number, height: number) => void;
  handleMoveElement: (id: string, dx: number, dy: number) => void;
  handleUpdateCornerRadius?: (id: string, cornerRadius: number) => void;
  handleUpdateFillColor?: (id: string, color: string) => void;
  handleUpdateBorderWidth?: (id: string, width: number) => void;
  handleUpdateBorderColor?: (id: string, color: string) => void;
  handleUpdateShadowBlur?: (id: string, blur: number) => void;
  handleUpdateShadowColor?: (id: string, color: string) => void;
}

export default function PropertiesSidebar({
  artboardDimensions,
  onUpdateArtboardWidth,
  onUpdateArtboardHeight,
  selectedElementData,
  onTextChange,
  handleResizeElement,
  handleMoveElement,
  handleUpdateCornerRadius,
  handleUpdateFillColor,
  handleUpdateBorderWidth,
  handleUpdateBorderColor,
  handleUpdateShadowBlur,
  handleUpdateShadowColor,
}: PropertiesSidebarProps) {
  return (
    <div className="z-20 m-4 p-1 bg-properties-blue/20 dark:bg-white/10 rounded-2xl shadow flex flex-col backdrop-blur-sm">
      <div className="flex-1 bg-white/15 dark:bg-white/10 border border-properties-blue dark:border-white/20 rounded-xl p-4 w-64">
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
                      onChange={onUpdateArtboardWidth}
                      onInstantChange={onUpdateArtboardWidth}
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
                      onChange={onUpdateArtboardHeight}
                      onInstantChange={onUpdateArtboardHeight}
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
            <div className="text-properties-text dark:text-foreground font-medium flex items-center justify-between">
              <span>
                {selectedElementData.type === "rectangle"
                  ? "Rectangle"
                  : "Text"}{" "}
                Properties
              </span>
            </div>
            {selectedElementData.type === "text" ? (
              <div>
                <div className="text-sm font-bold text-properties-text dark:text-foreground mb-2">
                  Content
                </div>
                <Input
                  value={selectedElementData.content || ""}
                  onChange={onTextChange}
                  className="h-8 w-full bg-white/20 border-white/60 text-properties-text dark:text-foreground"
                />
              </div>
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
                      handleUpdateFillColor &&
                      handleUpdateFillColor(
                        selectedElementData.id,
                        e.target.value
                      )
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
                          handleResizeElement(
                            selectedElementData.id,
                            val,
                            selectedElementData.height
                          )
                        }
                        onInstantChange={(val) =>
                          handleResizeElement(
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
                          handleResizeElement(
                            selectedElementData.id,
                            selectedElementData.width,
                            val
                          )
                        }
                        onInstantChange={(val) =>
                          handleResizeElement(
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
                          handleUpdateCornerRadius &&
                          handleUpdateCornerRadius(
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
                          handleUpdateCornerRadius &&
                          handleUpdateCornerRadius(
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
                      handleUpdateBorderWidth &&
                      handleUpdateBorderWidth(selectedElementData.id, val)
                    }
                    onInstantChange={(val) =>
                      handleUpdateBorderWidth &&
                      handleUpdateBorderWidth(selectedElementData.id, val)
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
                      handleUpdateBorderColor &&
                      handleUpdateBorderColor(
                        selectedElementData.id,
                        e.target.value
                      )
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
                      handleUpdateShadowBlur &&
                      handleUpdateShadowBlur(selectedElementData.id, val)
                    }
                    onInstantChange={(val) =>
                      handleUpdateShadowBlur &&
                      handleUpdateShadowBlur(selectedElementData.id, val)
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
                      handleUpdateShadowColor &&
                      handleUpdateShadowColor(
                        selectedElementData.id,
                        e.target.value
                      )
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
                      handleMoveElement(
                        selectedElementData.id,
                        val - selectedElementData.x,
                        0
                      )
                    }
                    onInstantChange={(val) =>
                      handleMoveElement(
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
                      handleMoveElement(
                        selectedElementData.id,
                        0,
                        val - selectedElementData.y
                      )
                    }
                    onInstantChange={(val) =>
                      handleMoveElement(
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
