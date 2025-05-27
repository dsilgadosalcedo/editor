import { PropertyInput } from "../PropertyInput";
import {
  PropertySection,
  PropertyStack,
  PropertyTitle,
  PropertyField,
  PropertyLabel,
} from "@/components/ui/property";
import { useCanvasStore } from "@/features/canvas/store/useCanvasStore";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { AspectRatioSelector } from "../AspectRatioSelector";
import { Lock, Unlock } from "lucide-react";

export function ArtboardProperties() {
  const {
    artboardDimensions,
    artboardAspectRatio,
    setArtboardDimensions,
    setArtboardAspectRatio,
    projectName,
    setProjectName,
    panSensitivity,
    setPanSensitivity,
    zoomSensitivity,
    setZoomSensitivity,
  } = useCanvasStore();

  const handleUpdateArtboardWidth = (width: number) => {
    if (artboardAspectRatio !== null) {
      // Lock aspect ratio - adjust height to maintain ratio
      const newHeight = Math.round(width / artboardAspectRatio);
      setArtboardDimensions({ width, height: newHeight });
    } else {
      // Custom ratio - allow free resizing
      setArtboardDimensions({ ...artboardDimensions, width });
    }
  };

  const handleUpdateArtboardHeight = (height: number) => {
    if (artboardAspectRatio !== null) {
      // Lock aspect ratio - adjust width to maintain ratio
      const newWidth = Math.round(height * artboardAspectRatio);
      setArtboardDimensions({ width: newWidth, height });
    } else {
      // Custom ratio - allow free resizing
      setArtboardDimensions({ ...artboardDimensions, height });
    }
  };

  return (
    <div>
      <div className="grid gap-5">
        <PropertySection>
          <PropertyTitle>Project Name</PropertyTitle>
          <PropertyField>
            <Input
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              aria-label="Project name"
              placeholder="Enter project name"
            />
          </PropertyField>
        </PropertySection>

        <Separator />

        <span className="text-foreground font-medium">Artboard</span>

        <PropertySection>
          <PropertyTitle>Aspect Ratio</PropertyTitle>
          <PropertyField distribution="column">
            <AspectRatioSelector
              currentDimensions={artboardDimensions}
              onDimensionsChange={setArtboardDimensions}
              onAspectRatioChange={setArtboardAspectRatio}
              variant="default"
            />
          </PropertyField>
        </PropertySection>

        <PropertySection>
          <PropertyTitle>
            <div className="flex items-center gap-2">
              Dimensions
              {artboardAspectRatio !== null ? (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Lock className="w-3 h-3" />
                  <span>Ratio Locked</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Unlock className="w-3 h-3" />
                  <span>Custom</span>
                </div>
              )}
            </div>
          </PropertyTitle>
          <PropertyStack distribution="row">
            <PropertyField distribution="row">
              <PropertyLabel distribution="row">X</PropertyLabel>
              <PropertyInput
                value={artboardDimensions.width}
                onChange={handleUpdateArtboardWidth}
                onInstantChange={handleUpdateArtboardWidth}
                aria-label="Artboard width"
              />
            </PropertyField>
            <PropertyField distribution="row">
              <PropertyLabel distribution="row">Y</PropertyLabel>
              <PropertyInput
                value={artboardDimensions.height}
                onChange={handleUpdateArtboardHeight}
                onInstantChange={handleUpdateArtboardHeight}
                aria-label="Artboard height"
              />
            </PropertyField>
          </PropertyStack>
          {/* {artboardAspectRatio !== null && (
            <div className="text-xs text-muted-foreground mt-2">
              Aspect ratio locked: {artboardAspectRatio.toFixed(2)}:1. Change
              aspect ratio above to unlock.
            </div>
          )} */}
        </PropertySection>

        <PropertySection>
          <PropertyTitle>Sensitivity</PropertyTitle>
          <PropertyStack>
            <PropertyField>
              <PropertyLabel>Pan</PropertyLabel>
              <PropertyInput
                value={panSensitivity}
                min={0.1}
                max={5.0}
                step={0.1}
                onChange={(val) => setPanSensitivity(val)}
                onInstantChange={(val) => setPanSensitivity(val)}
                aria-label="Pan sensitivity"
              />
            </PropertyField>

            <PropertyField>
              <PropertyLabel>Zoom</PropertyLabel>
              <PropertyInput
                value={zoomSensitivity}
                min={0.1}
                max={3.0}
                step={0.1}
                onChange={(val) => setZoomSensitivity(val)}
                onInstantChange={(val) => setZoomSensitivity(val)}
                aria-label="Zoom sensitivity"
              />
            </PropertyField>
          </PropertyStack>
          <div className="text-xs text-muted-foreground mt-2">
            Controls how fast the canvas pans and zoom. Higher values = faster.
          </div>
        </PropertySection>
      </div>
    </div>
  );
}
