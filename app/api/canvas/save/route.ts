import { NextRequest, NextResponse } from "next/server";
import { SavedCanvas, CanvasData } from "@/lib/types";

// In-memory storage (replace with actual database in production)
const canvasStorage = new Map<string, SavedCanvas>();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { canvasData, title }: { canvasData: CanvasData; title?: string } =
      body;

    if (!canvasData) {
      return NextResponse.json(
        { error: "Canvas data is required" },
        { status: 400 }
      );
    }

    // Generate unique ID
    const canvasId = `canvas_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    // Save canvas data
    const saveData: SavedCanvas = {
      id: canvasId,
      title: title || "Untitled Canvas",
      data: canvasData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    canvasStorage.set(canvasId, saveData);

    return NextResponse.json(
      {
        success: true,
        canvasId,
        message: "Canvas saved successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error saving canvas:", error);
    return NextResponse.json(
      { error: "Failed to save canvas" },
      { status: 500 }
    );
  }
}
