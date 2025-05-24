"use client";

import React from "react";
import { cn } from "@/lib/utils";

function PropertySection({ ...props }: React.ComponentProps<"section">) {
  return <section {...props}>{props.children}</section>;
}

function PropertyStack({
  distribution = "column",
  ...props
}: React.ComponentProps<"div"> & {
  distribution?: "row" | "column";
}) {
  return (
    <div
      className={cn(
        "flex",
        distribution === "row"
          ? "items-center justify-between gap-4"
          : "flex-col gap-2"
      )}
      {...props}
    >
      {props.children}
    </div>
  );
}

function PropertyTitle({ ...props }: React.ComponentProps<"h4">) {
  return (
    <h4 className="text-sm font-semibold text-foreground mb-2" {...props} />
  );
}

function PropertyInput({
  distribution = "row",
  ...props
}: React.ComponentProps<"div"> & {
  distribution?: "row" | "column";
}) {
  return (
    <div
      className={cn(
        "flex gap-2",
        distribution === "row" ? "items-center flex-row" : "flex-col"
      )}
      {...props}
    >
      {props.children}
    </div>
  );
}

function PropertyLabel({
  distribution = "column",
  ...props
}: React.ComponentProps<"label"> & {
  distribution?: "row" | "column";
}) {
  return (
    <label
      className={cn(
        "text-xs text-foreground text-ellipsis overflow-hidden",
        distribution === "column" && "w-20"
      )}
      {...props}
    />
  );
}

export {
  PropertySection,
  PropertyStack,
  PropertyTitle,
  PropertyInput,
  PropertyLabel,
};
