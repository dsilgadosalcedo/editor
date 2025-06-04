import React from "react";
import { Input } from "@/components/ui/input";
import {
  PropertySection,
  PropertyTitle,
  PropertyField,
} from "@/components/ui/property";

interface TextContentSectionProps {
  name: string;
  content: string;
  onNameChange: (name: string) => void;
  onContentChange: (content: string) => void;
}

export function TextContentSection({
  name,
  content,
  onNameChange,
  onContentChange,
}: TextContentSectionProps) {
  return (
    <>
      {/* Name Section */}
      <PropertySection>
        <PropertyTitle>Name</PropertyTitle>
        <PropertyField>
          <Input
            value={name || ""}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="Text"
            className="h-8 w-full bg-white/20 border-white/60 text-properties-text dark:text-foreground"
            aria-label="Element name"
          />
        </PropertyField>
      </PropertySection>

      {/* Content Section */}
      <PropertySection>
        <PropertyTitle>Content</PropertyTitle>
        <PropertyField>
          <Input
            value={content || ""}
            onChange={(e) => onContentChange(e.target.value)}
            placeholder="Enter text content"
            className="h-8 w-full bg-white/20 border-white/60 text-properties-text dark:text-foreground"
            aria-label="Text content"
          />
        </PropertyField>
      </PropertySection>
    </>
  );
}
