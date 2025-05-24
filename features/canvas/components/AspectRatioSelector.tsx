import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Monitor, Square, Smartphone, Tablet, Ratio } from "lucide-react";

export interface AspectRatioOption {
  label: string;
  ratio: number;
  width: number;
  height: number;
  icon?: React.ReactNode;
}

const aspectRatioOptions: AspectRatioOption[] = [
  {
    label: "1:1 (Square)",
    ratio: 1,
    width: 800,
    height: 800,
    icon: <Square className="w-4 h-4" />,
  },
  {
    label: "4:3 (Standard)",
    ratio: 4 / 3,
    width: 800,
    height: 600,
    icon: <Monitor className="w-4 h-4" />,
  },
  {
    label: "16:9 (Widescreen)",
    ratio: 16 / 9,
    width: 1024,
    height: 576,
    icon: <Monitor className="w-4 h-4" />,
  },
  {
    label: "3:2 (Photography)",
    ratio: 3 / 2,
    width: 900,
    height: 600,
    icon: <Ratio className="w-4 h-4" />,
  },
  {
    label: "9:16 (Mobile Portrait)",
    ratio: 9 / 16,
    width: 360,
    height: 640,
    icon: <Smartphone className="w-4 h-4" />,
  },
  {
    label: "4:5 (Instagram)",
    ratio: 4 / 5,
    width: 640,
    height: 800,
    icon: <Square className="w-4 h-4" />,
  },
  {
    label: "3:4 (Tablet Portrait)",
    ratio: 3 / 4,
    width: 768,
    height: 1024,
    icon: <Tablet className="w-4 h-4" />,
  },
];

interface AspectRatioSelectorProps {
  currentDimensions: { width: number; height: number };
  onDimensionsChange: (dimensions: { width: number; height: number }) => void;
  onAspectRatioChange?: (ratio: number | null) => void;
  variant?: "default" | "compact";
  showIcons?: boolean;
}

export const AspectRatioSelector: React.FC<AspectRatioSelectorProps> = ({
  currentDimensions,
  onDimensionsChange,
  onAspectRatioChange,
  variant = "default",
  showIcons = true,
}) => {
  const currentRatio = currentDimensions.width / currentDimensions.height;

  const getCurrentSelection = (): string => {
    const matchingOption = aspectRatioOptions.find(
      (option) => Math.abs(option.ratio - currentRatio) < 0.01
    );
    return matchingOption ? matchingOption.label : "custom";
  };

  const handleRatioChange = (value: string) => {
    if (value === "custom") {
      onAspectRatioChange?.(null); // Unlock aspect ratio for custom
      return;
    }

    const selectedOption = aspectRatioOptions.find(
      (option) => option.label === value
    );
    if (selectedOption) {
      onDimensionsChange({
        width: selectedOption.width,
        height: selectedOption.height,
      });
      onAspectRatioChange?.(selectedOption.ratio); // Lock aspect ratio
    }
  };

  const handleCustomRatio = () => {
    // Keep current dimensions for custom ratio
    // User can manually adjust in the properties panel
  };

  if (variant === "compact") {
    return (
      <div className="flex items-center gap-1">
        <Select value={getCurrentSelection()} onValueChange={handleRatioChange}>
          <SelectTrigger className="w-auto min-w-[120px] h-8 text-xs bg-background/80 backdrop-blur-sm border border-border/50">
            <SelectValue placeholder="Ratio" />
          </SelectTrigger>
          <SelectContent>
            {aspectRatioOptions.map((option) => (
              <SelectItem key={option.label} value={option.label}>
                <div className="flex items-center gap-2">
                  {showIcons && option.icon}
                  <span>{option.label}</span>
                </div>
              </SelectItem>
            ))}
            <SelectItem value="custom">
              <div className="flex items-center gap-2">
                <Ratio className="w-4 h-4" />
                <span>Custom</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Select value={getCurrentSelection()} onValueChange={handleRatioChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select aspect ratio" />
        </SelectTrigger>
        <SelectContent>
          {aspectRatioOptions.map((option) => (
            <SelectItem key={option.label} value={option.label}>
              <div className="flex items-center gap-2">
                {showIcons && option.icon}
                <span>{option.label}</span>
              </div>
            </SelectItem>
          ))}
          <SelectItem value="custom">
            <div className="flex items-center gap-2">
              <Ratio className="w-4 h-4" />
              <span>Custom</span>
            </div>
          </SelectItem>
        </SelectContent>
      </Select>

      <div className="text-xs text-muted-foreground">
        {/* Current: {currentDimensions.width} × {currentDimensions.height} */}
        Ratio:{" "}
        {getCurrentSelection() === "custom"
          ? (currentDimensions.width / currentDimensions.height).toFixed(2)
          : getCurrentSelection()}
      </div>
    </div>
  );
};

export default AspectRatioSelector;
