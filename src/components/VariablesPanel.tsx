import React, { useState } from "react";
import { useAppStore } from "../store/useAppStore";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Plus, Trash2, Variable, X } from "lucide-react";

interface VariableRowProps {
  variable: string;
  value: string;
  onChange: (value: string) => void;
  onDelete: (variable: string) => void;
  isDetected: boolean;
}

function VariableRow({
  variable,
  value,
  onChange,
  onDelete,
  isDetected,
}: VariableRowProps) {
  return (
    <div className="flex items-center gap-2 p-2 bg-card rounded border border-border hover:border-accent transition-colors">
      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
            <Variable className="h-3 w-3" />
            {variable}
          </label>
          {isDetected && (
            <span className="text-[10px] px-1.5 py-0.5 bg-blue-500/20 text-blue-300 rounded">
              Auto-detected
            </span>
          )}
        </div>
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={`Value for {{${variable}}}`}
          className="h-7 text-sm"
        />
      </div>
      {!isDetected && (
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onDelete(variable)}
          className="h-7 w-7 p-0 text-destructive hover:text-destructive"
          title="Remove variable"
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
}

export function VariablesPanel() {
  const {
    detectedVariables,
    variableValues,
    updateVariableValues,
    addManualVariable,
    deleteManualVariable,
    manualVariables,
  } = useAppStore();

  const [newVariableName, setNewVariableName] = useState("");
  const [newVariableValue, setNewVariableValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleVariableChange = (variable: string, value: string) => {
    updateVariableValues({ [variable]: value });
  };

  const handleAddVariable = () => {
    const trimmedName = newVariableName.trim();
    
    if (!trimmedName) {
      setError("Variable name cannot be empty");
      return;
    }

    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(trimmedName)) {
      setError("Variable name must start with a letter or underscore and contain only letters, numbers, and underscores");
      return;
    }

    if (detectedVariables.includes(trimmedName) || manualVariables.includes(trimmedName)) {
      setError("Variable already exists");
      return;
    }

    addManualVariable(trimmedName, newVariableValue.trim());
    setNewVariableName("");
    setNewVariableValue("");
    setError(null);
  };

  const handleDeleteVariable = (variable: string) => {
    deleteManualVariable(variable);
    const newValues = { ...variableValues };
    delete newValues[variable];
    updateVariableValues(newValues);
  };

  const handleKeyDown = (e: React.KeyboardEvent, isNameInput: boolean) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (isNameInput) {
        const valueInput = document.querySelector<HTMLInputElement>('[data-new-variable-value]');
        valueInput?.focus();
      } else {
        handleAddVariable();
      }
    }
  };

  const allVariables = [...new Set([...detectedVariables, ...manualVariables])];

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold mb-1">Variables</h2>
        <p className="text-xs text-muted-foreground">
          Manage template variables for your prompts
        </p>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* Variables List */}
          {allVariables.length > 0 ? (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Active Variables</CardTitle>
                <CardDescription className="text-xs">
                  Variables from prompts and custom additions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {allVariables.map((variable) => (
                  <VariableRow
                    key={variable}
                    variable={variable}
                    value={variableValues[variable] || ""}
                    onChange={(value) => handleVariableChange(variable, value)}
                    onDelete={handleDeleteVariable}
                    isDetected={detectedVariables.includes(variable)}
                  />
                ))}
              </CardContent>
            </Card>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Variable className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No variables yet</p>
              <p className="text-xs">
                Use {`{{variable_name}}`} in prompts or add manually below
              </p>
            </div>
          )}

          {/* Add New Variable */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Add Custom Variable</CardTitle>
              <CardDescription className="text-xs">
                Define your own variables for template reuse
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <label className="text-xs font-medium">Variable Name</label>
                <Input
                  value={newVariableName}
                  onChange={(e) => {
                    setNewVariableName(e.target.value);
                    setError(null);
                  }}
                  onKeyDown={(e) => handleKeyDown(e, true)}
                  placeholder="e.g., user_name, topic, language"
                  className="h-8 text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium">Default Value</label>
                <Input
                  data-new-variable-value
                  value={newVariableValue}
                  onChange={(e) => setNewVariableValue(e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, false)}
                  placeholder="Optional default value"
                  className="h-8 text-sm"
                />
              </div>

              {error && (
                <p className="text-xs text-red-400 bg-red-500/10 p-2 rounded">
                  {error}
                </p>
              )}

              <Button
                onClick={handleAddVariable}
                disabled={!newVariableName.trim()}
                size="sm"
                className="w-full"
              >
                <Plus className="h-3 w-3 mr-1" />
                Add Variable
              </Button>
            </CardContent>
          </Card>

          {/* Help Text */}
          <Card className="bg-blue-500/5 border-blue-500/20">
            <CardContent className="pt-4">
              <div className="text-xs space-y-2 text-muted-foreground">
                <p className="font-medium text-blue-300">How to use variables:</p>
                <ul className="space-y-1 list-disc list-inside">
                  <li>Use {`{{variable_name}}`} syntax in your prompts</li>
                  <li>Variables are automatically detected from prompts</li>
                  <li>Add custom variables for template reuse</li>
                  <li>Empty values are replaced with empty strings</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </div>
  );
}
