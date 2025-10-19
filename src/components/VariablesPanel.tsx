import React, { useState } from "react";
import { useAppStore } from "../store/useAppStore";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Plus, Trash2 } from "lucide-react";

export function VariablesPanel() {
  const { detectedVariables, variableValues, updateVariableValues } =
    useAppStore();

  const [newVariableName, setNewVariableName] = useState("");
  const [newVariableValue, setNewVariableValue] = useState("");

  const handleVariableChange = (variable: string, value: string) => {
    updateVariableValues({ [variable]: value });
  };

  const handleRemoveVariable = (variable: string) => {
    const newValues = { ...variableValues };
    delete newValues[variable];
    updateVariableValues(newValues);
  };

  const handleAddVariable = () => {
    if (
      newVariableName.trim() &&
      !detectedVariables.includes(newVariableName.trim())
    ) {
      updateVariableValues({ [newVariableName.trim()]: newVariableValue });
      setNewVariableName("");
      setNewVariableValue("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAddVariable();
    }
  };

  if (detectedVariables.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">Variables</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {detectedVariables.map((variable) => (
          <div key={variable} className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-muted-foreground">
                {variable}
              </label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveVariable(variable)}
                className="h-6 w-6 p-0 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
            <Input
              value={variableValues[variable] || ""}
              onChange={(e) => handleVariableChange(variable, e.target.value)}
              placeholder={`Enter value for ${variable}`}
              className="h-8"
            />
          </div>
        ))}

        <div className="pt-2 border-t border-border">
          <div className="text-xs font-medium text-muted-foreground mb-2">
            Add Custom Variable
          </div>
          <div className="flex gap-2">
            <Input
              value={newVariableName}
              onChange={(e) => setNewVariableName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Variable name"
              className="h-8 text-xs"
            />
            <Input
              value={newVariableValue}
              onChange={(e) => setNewVariableValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Value"
              className="h-8 text-xs"
            />
            <Button
              size="sm"
              onClick={handleAddVariable}
              disabled={
                !newVariableName.trim() ||
                detectedVariables.includes(newVariableName.trim())
              }
              className="h-8 w-8 p-0"
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
