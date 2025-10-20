import { useAppStore } from './store/useAppStore'
import { QuickMessageComposer } from './components/QuickMessageComposer'
import { RightPanel } from './components/RightPanel'
import { Header } from './components/Header'
import { useEffect, useRef, useState } from 'react'
import { LeftPanel } from './components/LeftPanel'
import { MissionControlDialog } from './components/MissionControlDialog'
import { MainPanel } from './components/MainPanel'
import { Button } from './components/ui/button'
import { ChevronLeft, Variable } from 'lucide-react'

function App() {
  const { 
    leftPanelWidth, 
    rightPanelWidth, 
    isRightPanelCollapsed,
    setPanelWidths,
    setRightPanelCollapsed,
  } = useAppStore()
  
  const [isDraggingLeft, setIsDraggingLeft] = useState(false)
  const [isDraggingRight, setIsDraggingRight] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return
      
      const containerRect = containerRef.current.getBoundingClientRect()
      const containerWidth = containerRect.width
      
      if (isDraggingLeft) {
        const newLeftWidth = ((e.clientX - containerRect.left) / containerWidth) * 100
        if (newLeftWidth >= 20 && newLeftWidth <= 50) {
          setPanelWidths(newLeftWidth, rightPanelWidth)
        }
      }
      
      if (isDraggingRight && !isRightPanelCollapsed) {
        const newRightWidth = ((containerRect.right - e.clientX) / containerWidth) * 100
        if (newRightWidth >= 20 && newRightWidth <= 50) {
          setPanelWidths(leftPanelWidth, newRightWidth)
        }
      }
    }

    const handleMouseUp = () => {
      setIsDraggingLeft(false)
      setIsDraggingRight(false)
    }

    if (isDraggingLeft || isDraggingRight) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
  }, [isDraggingLeft, isDraggingRight, leftPanelWidth, rightPanelWidth, isRightPanelCollapsed, setPanelWidths])

  const middlePanelWidth = isRightPanelCollapsed 
    ? 100 - leftPanelWidth 
    : 100 - leftPanelWidth - rightPanelWidth

  return (
    <div className="h-screen flex flex-col bg-background text-foreground">
      <Header />
      
      <div ref={containerRef} className="flex-1 flex overflow-hidden relative">
        {/* Left Panel */}
        <div 
          className="border-r border-border overflow-hidden flex flex-col"
          style={{ width: `${leftPanelWidth}%` }}
        >
          <LeftPanel />
        </div>

        {/* Left Resizer */}
        <div
          className="w-1 hover:w-2 bg-border hover:bg-accent cursor-col-resize transition-all flex-shrink-0"
          onMouseDown={() => setIsDraggingLeft(true)}
        />

        {/* Middle Panel */}
        <div 
          className="overflow-hidden flex flex-col"
          style={{ width: `${middlePanelWidth}%` }}
        >
          <MainPanel />
        </div>

        {/* Right Resizer - only show when panel is not collapsed */}
        {!isRightPanelCollapsed && (
          <div
            className="w-1 hover:w-2 bg-border hover:bg-accent cursor-col-resize transition-all flex-shrink-0"
            onMouseDown={() => setIsDraggingRight(true)}
          />
        )}

        {/* Right Panel - only show when not collapsed */}
        {!isRightPanelCollapsed && (
          <div 
            className="border-l border-border overflow-hidden flex flex-col"
            style={{ width: `${rightPanelWidth}%` }}
          >
            <RightPanel />
          </div>
        )}

        {/* Floating expand button when right panel is collapsed */}
        {isRightPanelCollapsed && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setRightPanelCollapsed(false)}
            className="absolute right-2 top-1/2 -translate-y-1/2 h-16 w-8 rounded-md border border-border bg-background/95 hover:bg-accent shadow-lg backdrop-blur-sm flex flex-col items-center justify-center gap-1 z-50"
            title="Show Variables Panel"
          >
            <Variable className="h-4 w-4" />
            <ChevronLeft className="h-3 w-3 rotate-180" />
          </Button>
        )}
      </div>

      {/* Mission Control Dialog */}
      <MissionControlDialog />

      {/* Quick Message Composer Footer */}
      <QuickMessageComposer />
    </div>
  )
}

export default App