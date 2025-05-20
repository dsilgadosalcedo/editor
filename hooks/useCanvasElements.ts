import { useState, useCallback, useRef } from "react"

export type ElementType = "rectangle" | "text"
export type ToolType = ElementType | "hand" | null

export interface CanvasElementData {
  id: string
  type: ElementType
  x: number
  y: number
  width: number
  height: number
  content?: string
  color: string
  selected: boolean
}

export const useCanvasElements = (artboardDimensions: { width: number; height: number }) => {
  const [elements, setElements] = useState<CanvasElementData[]>([])
  const [selectedElement, setSelectedElement] = useState<string | null>(null)
  const isHandlingTextChange = useRef(false)

  const handleAddElement = (type: ElementType) => {
    const newElement: CanvasElementData = {
      id: `${type}-${Date.now()}`,
      type,
      x: artboardDimensions.width / 2 - (type === "rectangle" ? 50 : 40),
      y: artboardDimensions.height / 2 - (type === "rectangle" ? 50 : 20),
      width: type === "rectangle" ? 100 : 80,
      height: type === "rectangle" ? 100 : 40,
      content: type === "text" ? "New Text" : undefined,
      color: type === "rectangle" ? "#d9f99d" : "#ffffff",
      selected: true,
    }
    setElements((prev) => [...prev.map((el) => ({ ...el, selected: false })), newElement])
    setSelectedElement(newElement.id)
  }

  const handleSelectElement = (id: string, tool: ToolType) => {
    if (tool === "hand") return
    setElements((prev) => prev.map((el) => ({ ...el, selected: el.id === id })))
    setSelectedElement(id)
  }

  const handleMoveElement = (id: string, dx: number, dy: number) => {
    setElements((prev) => prev.map((el) => el.id === id ? { ...el, x: el.x + dx, y: el.y + dy } : el))
  }

  const handleResizeElement = (id: string, width: number, height: number) => {
    setElements((prev) => prev.map((el) => el.id === id ? { ...el, width, height } : el))
  }

  const handleUpdateTextContent = useCallback((id: string, content: string) => {
    if (isHandlingTextChange.current) return
    isHandlingTextChange.current = true
    setElements((prev) => prev.map((el) => el.id === id && el.type === "text" ? { ...el, content } : el))
    setTimeout(() => { isHandlingTextChange.current = false }, 0)
  }, [])

  const handleResetCanvas = () => {
    setElements([])
    setSelectedElement(null)
  }

  const getSelectedElementData = () => elements.find((el) => el.id === selectedElement)

  return {
    elements,
    selectedElement,
    handleAddElement,
    handleSelectElement,
    handleMoveElement,
    handleResizeElement,
    handleUpdateTextContent,
    handleResetCanvas,
    getSelectedElementData,
    setElements,
    setSelectedElement,
  }
} 