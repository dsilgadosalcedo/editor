import { useState, useRef, useEffect } from "react"

interface UseElementDragResizeProps {
  isPanMode: boolean
  onMove: (dx: number, dy: number) => void
  onResize: (w: number, h: number) => void
  onSelect: () => void
  isEditing: boolean
  setIsEditing: (v: boolean) => void
  element: { width: number; height: number; type: string }
}

export const useElementDragResize = ({
  isPanMode,
  onMove,
  onResize,
  onSelect,
  isEditing,
  setIsEditing,
  element,
}: UseElementDragResizeProps) => {
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [resizeStart, setResizeStart] = useState({ width: 0, height: 0, x: 0, y: 0 })

  // Drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isPanMode) return
    onSelect()
    if (element.type === "text" && isEditing) return
    setIsDragging(true)
    setDragStart({ x: e.clientX, y: e.clientY })
  }
  const handleTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation()
    if (isPanMode) return
    onSelect()
    if (element.type === "text" && isEditing) return
    setIsDragging(true)
    setDragStart({ x: e.touches[0].clientX, y: e.touches[0].clientY })
  }
  // Resize handlers
  const handleResizeStart = (e: React.MouseEvent) => {
    if (isPanMode) return
    e.stopPropagation()
    e.preventDefault()
    setIsResizing(true)
    setResizeStart({
      width: element.width,
      height: element.height,
      x: e.clientX,
      y: e.clientY,
    })
  }
  const handleResizeTouchStart = (e: React.TouchEvent) => {
    if (isPanMode) return
    e.stopPropagation()
    e.preventDefault()
    setIsResizing(true)
    setResizeStart({
      width: element.width,
      height: element.height,
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    })
  }
  // Global move/up handlers
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const deltaX = e.clientX - dragStart.x
        const deltaY = e.clientY - dragStart.y
        onMove(deltaX, deltaY)
        setDragStart({ x: e.clientX, y: e.clientY })
      } else if (isResizing) {
        const deltaX = e.clientX - resizeStart.x
        const deltaY = e.clientY - resizeStart.y
        onResize(Math.max(20, resizeStart.width + deltaX), Math.max(20, resizeStart.height + deltaY))
      }
    }
    const handleTouchMove = (e: TouchEvent) => {
      if (isDragging) {
        const deltaX = e.touches[0].clientX - dragStart.x
        const deltaY = e.touches[0].clientY - dragStart.y
        onMove(deltaX, deltaY)
        setDragStart({ x: e.touches[0].clientX, y: e.touches[0].clientY })
      } else if (isResizing) {
        const deltaX = e.touches[0].clientX - resizeStart.x
        const deltaY = e.touches[0].clientY - resizeStart.y
        onResize(Math.max(20, resizeStart.width + deltaX), Math.max(20, resizeStart.height + deltaY))
      }
    }
    const handleMouseUp = () => {
      setIsDragging(false)
      setIsResizing(false)
    }
    const handleTouchEnd = () => {
      setIsDragging(false)
      setIsResizing(false)
    }
    if (isDragging || isResizing) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
      document.addEventListener("touchmove", handleTouchMove)
      document.addEventListener("touchend", handleTouchEnd)
    }
    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
      document.removeEventListener("touchmove", handleTouchMove)
      document.removeEventListener("touchend", handleTouchEnd)
    }
  }, [isDragging, isResizing, dragStart, resizeStart, onMove, onResize])

  return {
    isDragging,
    isResizing,
    handleMouseDown,
    handleTouchStart,
    handleResizeStart,
    handleResizeTouchStart,
    setIsDragging,
    setIsResizing,
  }
} 