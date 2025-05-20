import React from "react";
import { Input } from "@/components/ui/input";
import type { CanvasElementData } from "@/hooks/useCanvasElements";

interface PropertiesSidebarProps {
  artboardDimensions: { width: number; height: number };
  onUpdateArtboardWidth: (width: number) => void;
  onUpdateArtboardHeight: (height: number) => void;
  selectedElementData?: CanvasElementData;
  onTextChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleResizeElement: (id: string, width: number, height: number) => void;
  handleMoveElement: (id: string, dx: number, dy: number) => void;
}

export default function PropertiesSidebar({
  artboardDimensions,
  onUpdateArtboardWidth,
  onUpdateArtboardHeight,
  selectedElementData,
  onTextChange,
  handleResizeElement,
  handleMoveElement,
}: PropertiesSidebarProps) {
  return (
    <div className="z-20 m-4 p-1 bg-properties-blue/20 dark:bg-white/10 rounded-2xl shadow flex flex-col backdrop-blur-sm">
      <div className="flex-1 bg-white/15 dark:bg-white/10 border border-properties-blue dark:border-white/20 rounded-xl p-4 w-64">
        <div className="text-properties-text dark:text-foreground font-medium mb-4">Artboard</div>
        <div className="space-y-4">
          <div>
            <div className="text-properties-text dark:text-foreground text-sm mb-2">Dimensions</div>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center">
                <span className="text-properties-text dark:text-foreground mr-2">x</span>
                <Input
                  type="number"
                  value={artboardDimensions.width}
                  onChange={(e) =>
                    onUpdateArtboardWidth(Number(e.target.value))
                  }
                  className="h-8 w-21 bg-white/20 border-white/60 text-properties-text dark:text-foreground"
                />
              </div>
              <div className="flex items-center">
                <span className="text-properties-text dark:text-foreground mr-2">y</span>
                <Input
                  type="number"
                  value={artboardDimensions.height}
                  onChange={(e) =>
                    onUpdateArtboardHeight(Number(e.target.value))
                  }
                  className="h-8 w-21 bg-white/20 border-white/60 text-properties-text dark:text-foreground"
                />
              </div>
            </div>
          </div>

          {selectedElementData && (
            <div className="space-y-2">
              <div className="text-properties-text dark:text-foreground font-medium">
                Element Properties
              </div>
              {selectedElementData.type === "text" ? (
                <div>
                  <div className="text-properties-text dark:text-foreground mb-2">Text Content</div>
                  <Input
                    value={selectedElementData.content || ""}
                    onChange={onTextChange}
                    className="h-8 w-full bg-white/20 border-white/60 text-properties-text dark:text-foreground"
                  />
                </div>
              ) : (
                <div>
                  <div className="text-properties-text dark:text-foreground mb-2">Rectangle Size</div>
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center">
                      <span className="text-properties-text dark:text-foreground mr-2">w</span>
                      <Input
                        type="number"
                        value={selectedElementData.width}
                        onChange={(e) =>
                          handleResizeElement(
                            selectedElementData.id,
                            Number(e.target.value),
                            selectedElementData.height
                          )
                        }
                        className="h-8 w-21 bg-white/20 border-white/60 text-properties-text dark:text-foreground"
                      />
                    </div>
                    <div className="flex items-center">
                      <span className="text-properties-text dark:text-foreground mr-2">h</span>
                      <Input
                        type="number"
                        value={selectedElementData.height}
                        onChange={(e) =>
                          handleResizeElement(
                            selectedElementData.id,
                            selectedElementData.width,
                            Number(e.target.value)
                          )
                        }
                        className="h-8 w-21 bg-white/20 border-white/60 text-properties-text dark:text-foreground"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div>
                <div className="text-properties-text dark:text-foreground text-sm mb-2">Position</div>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center">
                    <span className="text-properties-text dark:text-foreground mr-2">x</span>
                    <Input
                      type="number"
                      value={selectedElementData.x}
                      onChange={(e) =>
                        handleMoveElement(
                          selectedElementData.id,
                          Number(e.target.value) - selectedElementData.x,
                          0
                        )
                      }
                      className="h-8 w-21 bg-white/20 border-white/60 text-properties-text dark:text-foreground"
                    />
                  </div>
                  <div className="flex items-center">
                    <span className="text-properties-text dark:text-foreground mr-2">y</span>
                    <Input
                      type="number"
                      value={selectedElementData.y}
                      onChange={(e) =>
                        handleMoveElement(
                          selectedElementData.id,
                          0,
                          Number(e.target.value) - selectedElementData.y
                        )
                      }
                      className="h-8 w-21 bg-white/20 border-white/60 text-properties-text dark:text-foreground"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
