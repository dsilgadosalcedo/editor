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
          <div className="space-y-2">
            <div className="text-properties-text dark:text-foreground font-medium">
              Element Properties
            </div>
            {selectedElementData.type === "text" ? (
              <div>
                <div className="text-properties-text dark:text-foreground mb-2">
                  Text Content
                </div>
                <Input
                  value={selectedElementData.content || ""}
                  onChange={onTextChange}
                  className="h-8 w-full bg-white/20 border-white/60 text-properties-text dark:text-foreground"
                />
              </div>
            ) : (
              <div>
                <div className="text-properties-text dark:text-foreground mb-2">
                  Rectangle Size
                </div>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center">
                    <span className="text-properties-text dark:text-foreground mr-2">
                      w
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
                    <span className="text-properties-text dark:text-foreground mr-2">
                      h
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
                {/* Corner Radius Input */}
                <div className="mt-2">
                  <div className="text-properties-text dark:text-foreground mb-2">
                    Corner Radius
                  </div>
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
                    className="h-8 w-24 bg-white/20 border-white/60 text-properties-text dark:text-foreground"
                    aria-label="Rectangle corner radius"
                  />
                </div>
              </div>
            )}

            <div>
              <div className="text-properties-text dark:text-foreground text-sm mb-2">
                Position
              </div>
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center">
                  <span className="text-properties-text dark:text-foreground mr-2">
                    x
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
                  <span className="text-properties-text dark:text-foreground mr-2">
                    y
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
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
