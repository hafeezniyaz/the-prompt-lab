import React from "react";
import { useAppStore } from "../store/useAppStore";
import { Button } from "./ui/button";
import { ChevronUp, ChevronDown } from "lucide-react";
import { VariablesPanel } from "./VariablesPanel";

export function RightPanel() {
  const {
    detectedVariables,
    variableValues,
    isRightPanelCollapsed,
    updateVariableValues,
    setRightPanelCollapsed,
  } = useAppStore();

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Variables</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setRightPanelCollapsed(!isRightPanelCollapsed)}
            className="h-8 w-8 p-0"
          >
            {isRightPanelCollapsed ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Variables Panel */}
      <div className="flex-1 p-4">
        <VariablesPanel />
      </div>
    </div>
  );
}
