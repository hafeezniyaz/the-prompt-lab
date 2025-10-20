
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useAppStore } from "../store/useAppStore";
import React, { useState } from "react";
import { ScrollArea } from "./ui/scroll-area";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  ChevronDown,
  ChevronRight,
  Variable,
  ChevronLeft,
  Plus,
  Trash2,
} from "lucide-react";

export function RightPanel() {
  const {
    detectedVariables,
    manualVariables,
    variableValues,
    updateVariableValues,
    addManualVariable,
    deleteManualVariable,
    setRightPanelCollapsed,
  } = useAppStore();

  const [showVariables, setShowVariables] = useState(true);
  const [newVariableName, setNewVariableName] = useState("");
  const [newVariableValue, setNewVariableValue] = useState("");

  const handleVariableChange = (variable: string, value: string) => {
    updateVariableValues({ [variable]: value });
  };

  const handleAddManualVariable = () => {
    if (newVariableName.trim()) {
      addManualVariable(newVariableName.trim(), newVariableValue);
      setNewVariableName("");
      setNewVariableValue("");
    }
  };

  const allVariables = [...new Set([...detectedVariables, ...manualVariables])];

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Variables</h2>
          <p className="text-sm text-muted-foreground">
            Manage template variables
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setRightPanelCollapsed(true)}
          title="Hide Variables Panel"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* Variables Section */}
          <Card>
            <CardHeader
              className="pb-3 cursor-pointer hover:bg-accent/50 transition-colors"
              onClick={() => setShowVariables(!showVariables)}
            >
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  {showVariables ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                  <Variable className="h-4 w-4" />
                  Variables
                </CardTitle>
                <span className="text-xs text-muted-foreground">
                  {allVariables.length} total
                </span>
              </div>
            </CardHeader>
            {showVariables && (
              <CardContent className="space-y-3">
                {allVariables.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground">
                    <Variable className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No variables yet</p>
                    <p className="text-xs mt-1">
                      Use {"{variable_name}"} in your prompts or add manually below
                    </p>
                  </div>
                ) : (
                  allVariables.map((variable) => {
                    const isManual = manualVariables.includes(variable);
                    const isDetected = detectedVariables.includes(variable);
                    
                    return (
                      <div key={variable} className="space-y-2 p-3 bg-card rounded border border-border">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium flex items-center gap-2">
                            <Variable className="h-3 w-3 text-muted-foreground" />
                            {variable}
                          </label>
                          <div className="flex items-center gap-2">
                            {isDetected && (
                              <span className="text-[10px] px-1.5 py-0.5 bg-blue-500/20 text-blue-300 rounded">
                                Auto
                              </span>
                            )}
                            {isManual && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteManualVariable(variable)}
                                className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                        <Input
                          value={variableValues[variable] || ""}
                          onChange={(e) =>
                            handleVariableChange(variable, e.target.value)
                          }
                          placeholder={`Enter value for ${variable}`}
                          className="font-mono text-sm"
                        />
                      </div>
                    );
                  })
                )}
              </CardContent>
            )}
          </Card>

          {/* Add Manual Variable Section */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Manual Variable
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Variable Name</label>
                <Input
                  value={newVariableName}
                  onChange={(e) => setNewVariableName(e.target.value)}
                  placeholder="e.g., custom_input"
                  className="font-mono text-sm"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddManualVariable();
                    }
                  }}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Default Value (Optional)</label>
                <Input
                  value={newVariableValue}
                  onChange={(e) => setNewVariableValue(e.target.value)}
                  placeholder="Enter default value"
                  className="text-sm"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddManualVariable();
                    }
                  }}
                />
              </div>
              <Button
                onClick={handleAddManualVariable}
                disabled={!newVariableName.trim()}
                className="w-full"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Variable
              </Button>
            </CardContent>
          </Card>

          {/* Help Text */}
          <Card className="bg-blue-500/5 border-blue-500/20">
            <CardContent className="pt-4">
              <div className="text-xs space-y-2 text-muted-foreground">
                <p className="font-medium text-blue-300">How Variables Work:</p>
                <ul className="space-y-1 list-disc list-inside">
                  <li>Use {"{variable_name}"} in system prompt or messages</li>
                  <li>Variables are auto-detected when you type them</li>
                  <li>Add manual variables for reusable inputs</li>
                  <li>Variable values are replaced when generating</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </div>
  );
}
