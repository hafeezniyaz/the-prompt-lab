import React, { useEffect } from "react";
import { PanelGroup, Panel, PanelResizeHandle } from "react-resizable-panels";
import { useAppStore } from "./store/useAppStore";
import { Header } from "./components/Header";
import { LeftPanel } from "./components/LeftPanel";
import { MainPanel } from "./components/MainPanel";
import { RightPanel } from "./components/RightPanel";
import { MessageInput } from "./components/MessageInput";
import { MissionControlDialog } from "./components/MissionControlDialog";
import "./App.css";

function App() {
  const {
    leftPanelWidth,
    rightPanelWidth,
    isRightPanelCollapsed,
    setPanelWidths,
  } = useAppStore();

  useEffect(() => {
    // Force dark mode
    document.documentElement.classList.add("dark");
  }, []);

  const handlePanelResize = (sizes: number[]) => {
    if (isRightPanelCollapsed) {
      setPanelWidths(sizes[0], 0); // Right panel collapsed, main takes remaining
    } else {
      setPanelWidths(sizes[0], sizes[2]); // Left, Main, Right
    }
  };

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

          {/* Main Panel - Output */}
          <Panel
            defaultSize={
              isRightPanelCollapsed
                ? 100 - leftPanelWidth
                : 100 - leftPanelWidth - rightPanelWidth
            }
            minSize={30}
          >
            <MainPanel />
          </Panel>

          {!isRightPanelCollapsed && (
            <>
              <PanelResizeHandle className="w-1 bg-border hover:bg-accent transition-colors" />

              {/* Right Panel - Configuration */}
              <Panel
                defaultSize={rightPanelWidth}
                minSize={20}
                maxSize={35}
                className="border-l border-border"
              >
                <RightPanel />
              </Panel>
            </>
          )}
        </PanelGroup>
      </div>

      {/* Message Input - Fixed at bottom */}
      <MessageInput />

      {/* Mission Control Dialog */}
      <MissionControlDialog />
    </div>
  );
}

export default App;
