import React, { useEffect } from 'react'
import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels'
import { useAppStore } from './store/useAppStore'
import { Header } from './components/Header'
import { LeftPanel } from './components/LeftPanel'
import { MainPanel } from './components/MainPanel'
import { MissionControlDialog } from './components/MissionControlDialog'
import './App.css'

function App() {
  const { 
    leftPanelWidth,
    setPanelWidths
  } = useAppStore()
  
  useEffect(() => {
    // Force dark mode
    document.documentElement.classList.add('dark')
  }, [])
  
  const handlePanelResize = (sizes: number[]) => {
    setPanelWidths(sizes[0], 75) // Main panel takes remaining space
  }
  
  return (
    <div className="h-screen bg-background text-foreground overflow-hidden flex flex-col">
      {/* Header - Mission Control */}
      <Header />
      
      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden">
        <PanelGroup 
          direction="horizontal" 
          onLayout={handlePanelResize}
          className="h-full"
        >
          {/* Left Panel - Prompt Construction */}
          <Panel 
            defaultSize={leftPanelWidth} 
            minSize={25} 
            maxSize={45}
            className="border-r border-border"
          >
            <LeftPanel />
          </Panel>
          
          <PanelResizeHandle className="w-1 bg-border hover:bg-accent transition-colors" />
          
          {/* Main Panel - Output (Now Expanded) */}
          <Panel 
            defaultSize={75} 
            minSize={55}
          >
            <MainPanel />
          </Panel>
        </PanelGroup>
      </div>
      
      {/* Mission Control Dialog */}
      <MissionControlDialog />
    </div>
  )
}

export default App
