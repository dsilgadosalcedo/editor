import { NumberInput } from "../NumberInput";
import {
  PropertySection,
  PropertyStack,
  PropertyTitle,
  PropertyInput,
  PropertyLabel,
} from "@/components/ui/property";
import { useCanvasStore } from "@/features/canvas/store/useCanvasStore";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";

export function ArtboardProperties() {
  const {
    artboardDimensions,
    setArtboardDimensions,
    projectName,
    setProjectName,
    panSensitivity,
    setPanSensitivity,
    zoomSensitivity,
    setZoomSensitivity,
  } = useCanvasStore();

  const handleUpdateArtboardWidth = (width: number) => {
    setArtboardDimensions({ ...artboardDimensions, width });
  };

  const handleUpdateArtboardHeight = (height: number) => {
    setArtboardDimensions({ ...artboardDimensions, height });
  };

  return (
    <div>
      <div className="grid gap-5">
        <PropertySection>
          <PropertyTitle>Project Name</PropertyTitle>
          <PropertyInput>
            <Input
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              aria-label="Project name"
              placeholder="Enter project name"
            />
          </PropertyInput>
        </PropertySection>

        <Separator />

        <span className="text-foreground font-medium">Artboard</span>

        <PropertySection>
          <PropertyTitle>Dimensions</PropertyTitle>
          <PropertyStack distribution="row">
            <PropertyInput distribution="row">
              <PropertyLabel distribution="row">X</PropertyLabel>
              <NumberInput
                value={artboardDimensions.width}
                onChange={handleUpdateArtboardWidth}
                onInstantChange={handleUpdateArtboardWidth}
                aria-label="Artboard width"
              />
            </PropertyInput>
            <PropertyInput distribution="row">
              <PropertyLabel distribution="row">Y</PropertyLabel>
              <NumberInput
                value={artboardDimensions.height}
                onChange={handleUpdateArtboardHeight}
                onInstantChange={handleUpdateArtboardHeight}
                aria-label="Artboard height"
              />
            </PropertyInput>
          </PropertyStack>
        </PropertySection>

        <PropertySection>
          <PropertyTitle>Sensitivity</PropertyTitle>
          <PropertyStack>
            <PropertyInput>
              <PropertyLabel>Pan</PropertyLabel>
              <NumberInput
                value={panSensitivity}
                min={0.1}
                max={5.0}
                step={0.1}
                onChange={(val) => setPanSensitivity(val)}
                onInstantChange={(val) => setPanSensitivity(val)}
                aria-label="Pan sensitivity"
              />
            </PropertyInput>

            <PropertyInput>
              <PropertyLabel>Zoom</PropertyLabel>
              <NumberInput
                value={zoomSensitivity}
                min={0.1}
                max={3.0}
                step={0.1}
                onChange={(val) => setZoomSensitivity(val)}
                onInstantChange={(val) => setZoomSensitivity(val)}
                aria-label="Zoom sensitivity"
              />
            </PropertyInput>
          </PropertyStack>
          <div className="text-xs text-muted-foreground mt-2">
            Controls how fast the canvas pans and zoom. Higher values = faster.
          </div>
        </PropertySection>
      </div>
    </div>
  );
}
