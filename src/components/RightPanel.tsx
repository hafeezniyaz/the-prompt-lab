import React, { useState } from "react";
import { useAppStore } from "../store/useAppStore";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Slider } from "./ui/slider";
import { ScrollArea } from "./ui/scroll-area";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  Settings,
  Save,
  Trash2,
  Plus,
  X,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { Switch } from "./ui/switch";

interface VariableInputProps {
  variable: string;
  value: string;
  onChange: (value: string) => void;
}

function VariableInput({ variable, value, onChange }: VariableInputProps) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-muted-foreground">
        {variable}
      </label>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={`Enter value for ${variable}`}
        className="h-8"
      />
    </div>
  );
}

interface CustomParameterRowProps {
  paramKey: string;
  paramValue: any;
  onUpdate: (key: string, value: any) => void;
  onDelete: (key: string) => void;
}

function CustomParameterRow({
  paramKey,
  paramValue,
  onUpdate,
  onDelete,
}: CustomParameterRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editKey, setEditKey] = useState(paramKey);
  const [editValue, setEditValue] = useState(JSON.stringify(paramValue));
  const [jsonError, setJsonError] = useState<string | null>(null);

  const handleSave = () => {
    try {
      const parsed = JSON.parse(editValue);
      onUpdate(editKey, parsed);
      setIsEditing(false);
      setJsonError(null);
    } catch (error) {
      setJsonError("Invalid JSON syntax");
    }
  };

  const handleValueChange = (value: string) => {
    setEditValue(value);
    if (value.trim() === "") {
      setJsonError(null);
      return;
    }
    try {
      JSON.parse(value);
      setJsonError(null);
    } catch (error) {
      setJsonError("Invalid JSON syntax");
    }
  };

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2 p-2 bg-card rounded border">
        {isEditing ? (
          <>
            <Input
              value={editKey}
              onChange={(e) => setEditKey(e.target.value)}
              className="h-7 flex-1"
              placeholder="Key"
            />
            <Input
              value={editValue}
              onChange={(e) => handleValueChange(e.target.value)}
              className={`h-7 flex-1 ${
                jsonError ? "border-red-500 focus:border-red-500" : ""
              }`}
              placeholder="Value (JSON)"
            />
            <Button
              size="sm"
              onClick={handleSave}
              className="h-7 w-7 p-0"
              disabled={!!jsonError}
            >
              <Save className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setIsEditing(false);
                setJsonError(null);
                setEditValue(JSON.stringify(paramValue));
              }}
              className="h-7 w-7 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </>
        ) : (
          <>
            <div
              className="flex-1 cursor-pointer hover:bg-accent/50 rounded p-1 transition-colors"
              onClick={() => setIsEditing(true)}
            >
              <div className="text-xs font-medium">{paramKey}</div>
              <div className="text-xs text-muted-foreground truncate">
                {JSON.stringify(paramValue)}
              </div>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onDelete(paramKey)}
              className="h-7 w-7 p-0 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </>
        )}
      </div>
      {isEditing && jsonError && (
        <p className="text-xs text-red-500 px-2">{jsonError}</p>
      )}
    </div>
  );
}

export function RightPanel() {
  const {
    apiConfiguration,
    configPresets,
    detectedVariables,
    variableValues,
    isMissionControlOpen,
    setAPIConfiguration,
    saveConfigPreset,
    loadConfigPreset,
    deleteConfigPreset,
    updateVariableValues,
    setMissionControlOpen,
  } = useAppStore();

  const [newPresetName, setNewPresetName] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [newParamKey, setNewParamKey] = useState("");
  const [newParamValue, setNewParamValue] = useState("");
  const [newParamError, setNewParamError] = useState<string | null>(null);

  const handleSavePreset = () => {
    if (newPresetName.trim()) {
      saveConfigPreset(newPresetName.trim());
      setNewPresetName("");
    }
  };

  const handleVariableChange = (variable: string, value: string) => {
    updateVariableValues({ [variable]: value });
  };

  const handleNewParamValueChange = (value: string) => {
    setNewParamValue(value);
    if (value.trim() === "") {
      setNewParamError(null);
      return;
    }
    try {
      JSON.parse(value);
      setNewParamError(null);
    } catch (error) {
      setNewParamError("Invalid JSON syntax");
    }
  };

  const addCustomParameter = () => {
    if (newParamKey.trim() && newParamValue.trim() && !newParamError) {
      try {
        const parsed = JSON.parse(newParamValue);
        setAPIConfiguration({
          customParameters: {
            ...apiConfiguration.customParameters,
            [newParamKey]: parsed,
          },
        });
        setNewParamKey("");
        setNewParamValue("");
        setNewParamError(null);
      } catch (error) {
        setNewParamError("Invalid JSON syntax");
      }
    }
  };

  const updateCustomParameter = (key: string, value: any) => {
    setAPIConfiguration({
      customParameters: {
        ...apiConfiguration.customParameters,
        [key]: value,
      },
    });
  };

  const deleteCustomParameter = (key: string) => {
    const newParams = { ...apiConfiguration.customParameters };
    delete newParams[key];
    setAPIConfiguration({ customParameters: newParams });
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold">Configuration</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMissionControlOpen(!isMissionControlOpen)}
            className="h-8"
          >
            <Settings className="h-4 w-4 mr-1" />
            Mission Control
          </Button>
        </div>

        {/* Preset Management */}
        <div className="space-y-2">
          <Select onValueChange={loadConfigPreset}>
            <SelectTrigger>
              <SelectValue placeholder="Load preset" />
            </SelectTrigger>
            <SelectContent>
              {configPresets.map((preset) => (
                <SelectItem key={preset.id} value={preset.id}>
                  {preset.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex gap-2">
            <Input
              value={newPresetName}
              onChange={(e) => setNewPresetName(e.target.value)}
              placeholder="Preset name"
              className="flex-1 h-8"
              onKeyDown={(e) => e.key === "Enter" && handleSavePreset()}
            />
            <Button
              size="sm"
              onClick={handleSavePreset}
              disabled={!newPresetName.trim()}
            >
              Save
            </Button>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* Quick Connection */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Connection</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-medium">Model</label>
                <Input
                  value={apiConfiguration.modelName}
                  onChange={(e) =>
                    setAPIConfiguration({ modelName: e.target.value })
                  }
                  placeholder="gpt-4"
                  className="h-8"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium">Base URL</label>
                <Input
                  value={apiConfiguration.baseURL}
                  onChange={(e) =>
                    setAPIConfiguration({ baseURL: e.target.value })
                  }
                  placeholder="https://api.openai.com/v1"
                  className="h-8"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium">API Key</label>
                <Input
                  type="password"
                  value={apiConfiguration.apiKey}
                  onChange={(e) =>
                    setAPIConfiguration({ apiKey: e.target.value })
                  }
                  placeholder="sk-..."
                  className="h-8"
                />
              </div>
            </CardContent>
          </Card>

          {/* Core Parameters */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Parameters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="text-xs font-medium">Temperature</label>
                  <span className="text-xs text-muted-foreground">
                    {apiConfiguration.temperature}
                  </span>
                </div>
                <Slider
                  value={[apiConfiguration.temperature]}
                  onValueChange={(value) =>
                    setAPIConfiguration({ temperature: value[0] })
                  }
                  max={2}
                  min={0}
                  step={0.01}
                  className="py-2"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="text-xs font-medium">Max Tokens</label>
                  <span className="text-xs text-muted-foreground">
                    {apiConfiguration.maxTokens}
                  </span>
                </div>
                <Slider
                  value={[apiConfiguration.maxTokens]}
                  onValueChange={(value) =>
                    setAPIConfiguration({ maxTokens: value[0] })
                  }
                  max={8000}
                  min={1}
                  step={1}
                  className="py-2"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="text-xs font-medium">Top P</label>
                  <span className="text-xs text-muted-foreground">
                    {apiConfiguration.topP}
                  </span>
                </div>
                <Slider
                  value={[apiConfiguration.topP]}
                  onValueChange={(value) =>
                    setAPIConfiguration({ topP: value[0] })
                  }
                  max={1}
                  min={0}
                  step={0.01}
                  className="py-2"
                />
              </div>
            </CardContent>
          </Card>

          {/* Advanced Parameters */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Advanced</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="h-6 w-6 p-0"
                >
                  {showAdvanced ? (
                    <ChevronDown className="h-3 w-3" />
                  ) : (
                    <ChevronRight className="h-3 w-3" />
                  )}
                </Button>
              </div>
            </CardHeader>
            {showAdvanced && (
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <label className="text-xs font-medium">
                      Frequency Penalty
                    </label>
                    <span className="text-xs text-muted-foreground">
                      {apiConfiguration.frequencyPenalty}
                    </span>
                  </div>
                  <Slider
                    value={[apiConfiguration.frequencyPenalty]}
                    onValueChange={(value) =>
                      setAPIConfiguration({ frequencyPenalty: value[0] })
                    }
                    max={2}
                    min={-2}
                    step={0.01}
                    className="py-2"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <label className="text-xs font-medium">
                      Presence Penalty
                    </label>
                    <span className="text-xs text-muted-foreground">
                      {apiConfiguration.presencePenalty}
                    </span>
                  </div>
                  <Slider
                    value={[apiConfiguration.presencePenalty]}
                    onValueChange={(value) =>
                      setAPIConfiguration({ presencePenalty: value[0] })
                    }
                    max={2}
                    min={-2}
                    step={0.01}
                    className="py-2"
                  />
                </div>

                {/* Custom Parameters */}
                <div className="space-y-2">
                  <label className="text-xs font-medium">
                    Custom Parameters
                  </label>

                  <div className="space-y-1">
                    {Object.entries(apiConfiguration.customParameters).map(
                      ([key, value]) => (
                        <CustomParameterRow
                          key={key}
                          paramKey={key}
                          paramValue={value}
                          onUpdate={updateCustomParameter}
                          onDelete={deleteCustomParameter}
                        />
                      )
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex gap-1">
                      <Input
                        value={newParamKey}
                        onChange={(e) => setNewParamKey(e.target.value)}
                        placeholder="Key"
                        className="h-7 text-xs"
                      />
                      <Input
                        value={newParamValue}
                        onChange={(e) =>
                          handleNewParamValueChange(e.target.value)
                        }
                        placeholder="Value (JSON)"
                        className={`h-7 text-xs ${
                          newParamError
                            ? "border-red-500 focus:border-red-500"
                            : ""
                        }`}
                      />
                      <Button
                        size="sm"
                        onClick={addCustomParameter}
                        className="h-7 w-7 p-0"
                        disabled={
                          !!newParamError ||
                          !newParamKey.trim() ||
                          !newParamValue.trim()
                        }
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    {newParamError && (
                      <p className="text-xs text-red-500">{newParamError}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Variables */}
          {detectedVariables.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Variables</CardTitle>
                <CardDescription className="text-xs">
                  Variables detected in your prompts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {detectedVariables.map((variable) => (
                  <VariableInput
                    key={variable}
                    variable={variable}
                    value={variableValues[variable] || ""}
                    onChange={(value) => handleVariableChange(variable, value)}
                  />
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
