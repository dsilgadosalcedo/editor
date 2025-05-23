import { NextResponse } from "next/server";
import { SavedCanvas, CanvasListItem } from "@/lib/types";

// In-memory storage (should match the storage in save route)
const canvasStorage = new Map<string, SavedCanvas>();

export async function GET() {
  try {
    const canvasList: CanvasListItem[] = Array.from(canvasStorage.values()).map(
      (canvas) => ({
        id: canvas.id,
        title: canvas.title,
        createdAt: canvas.createdAt,
        updatedAt: canvas.updatedAt,
        // Don't return the full canvas data for performance
      })
    );

    return NextResponse.json(
      {
        success: true,
        canvases: canvasList,
        count: canvasList.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error listing canvases:", error);
    return NextResponse.json(
      { error: "Failed to list canvases" },
      { status: 500 }
    );
  }
}
