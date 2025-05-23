import { NextRequest, NextResponse } from "next/server";
import { SavedCanvas } from "@/lib/types";

// In-memory storage (should match the storage in save route)
const canvasStorage = new Map<string, SavedCanvas>();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Canvas ID is required" },
        { status: 400 }
      );
    }

    const canvasData = canvasStorage.get(id);

    if (!canvasData) {
      return NextResponse.json({ error: "Canvas not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        success: true,
        canvas: canvasData,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error loading canvas:", error);
    return NextResponse.json(
      { error: "Failed to load canvas" },
      { status: 500 }
    );
  }
}
