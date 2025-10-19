import React, { useState, useEffect } from "react";
import { useAppStore } from "../store/useAppStore";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { Save, Trash2, Download, Upload, RotateCcw } from "lucide-react";

const presetModels = [
  { name: "GPT-4", model: "gpt-4", provider: "OpenAI" },
  { name: "GPT-4 Turbo", model: "gpt-4-turbo-preview", provider: "OpenAI" },
  { name: "GPT-3.5 Turbo", model: "gpt-3.5-turbo", provider: "OpenAI" },
  {
    name: "Claude 3 Sonnet",
    model: "claude-3-sonnet-20240229",
    provider: "Anthropic",
  },
  {
    name: "Claude 3 Haiku",
    model: "claude-3-haiku-20240307",
    provider: "Anthropic",
  },
  { name: "Llama 2 70B", model: "llama-2-70b-chat", provider: "Meta" },
  { name: "Mistral Large", model: "mistral-large-latest", provider: "Mistral" },
];

const providerEndpoints = {
  OpenAI: "https://api.openai.com/v1",
  Anthropic: "https://api.anthropic.com/v1",
  Local: "http://localhost:1234/v1",
  Custom: "",
};

export function MissionControlDialog() {
  const {
    apiConfiguration,
    configPresets,
    templates,
    isMissionControlOpen,
    setAPIConfiguration,
    saveConfigPreset,
    deleteConfigPreset,
    deleteTemplate,
    setMissionControlOpen,
  } = useAppStore();

  // State for custom parameters JSON editing
  const [customParamsJson, setCustomParamsJson] = useState("");
  const [jsonError, setJsonError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState("connection");
  const [newPresetName, setNewPresetName] = useState("");

  // Initialize custom parameters JSON when dialog opens or config changes
  useEffect(() => {
    if (isMissionControlOpen) {
      setCustomParamsJson(
        JSON.stringify(apiConfiguration.customParameters, null, 2)
      );
      setJsonError(null);
    }
  }, [isMissionControlOpen, apiConfiguration.customParameters]);

  // Handle custom parameters JSON changes with validation
  const handleCustomParamsChange = (value: string) => {
    setCustomParamsJson(value);

    // Validate JSON in real-time
    if (value.trim() === "") {
      setJsonError(null);
      setAPIConfiguration({ customParameters: {} });
      return;
    }

    try {
      const parsed = JSON.parse(value);
      if (
        typeof parsed === "object" &&
        parsed !== null &&
        !Array.isArray(parsed)
      ) {
        setJsonError(null);
        setAPIConfiguration({ customParameters: parsed });
      } else {
        setJsonError("Custom parameters must be a JSON object");
      }
    } catch (error) {
      setJsonError("Invalid JSON syntax");
    }
  };

  const handleModelSelect = (modelName: string) => {
    const model = presetModels.find((m) => m.model === modelName);
    if (model) {
      setAPIConfiguration({
        modelName: model.model,
        baseURL:
          providerEndpoints[model.provider as keyof typeof providerEndpoints] ||
          apiConfiguration.baseURL,
      });
    }
  };

  const handleProviderSelect = (provider: string) => {
    const endpoint =
      providerEndpoints[provider as keyof typeof providerEndpoints];
    if (endpoint !== undefined) {
      setAPIConfiguration({ baseURL: endpoint });
    }
  };

  const resetToDefaults = () => {
    setAPIConfiguration({
      modelName: "gpt-4",
      baseURL: "https://api.openai.com/v1",
      temperature: 0.7,
      maxTokens: 2000,
      topP: 1,
      frequencyPenalty: 0,
      presencePenalty: 0,
      customParameters: {},
    });
  };

  const exportConfig = () => {
    const exportData = {
      version: "1.0",
      timestamp: new Date().toISOString(),
      configuration: apiConfiguration,
      presets: configPresets,
      templates: templates,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `prompt-lab-export-${
      new Date().toISOString().split("T")[0]
    }.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importConfig = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);

        if (data.configuration) {
          setAPIConfiguration(data.configuration);
        }

        // Note: In a real app, you'd want to merge presets and templates
        // rather than replace them completely
      } catch (error) {
        console.error("Failed to import configuration:", error);
      }
    };
    reader.readAsText(file);
  };

  return (
    <Dialog open={isMissionControlOpen} onOpenChange={setMissionControlOpen}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Mission Control</DialogTitle>
          <DialogDescription>
            Advanced configuration and management for your prompt engineering
            environment
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="connection">Connection</TabsTrigger>
            <TabsTrigger value="parameters">Parameters</TabsTrigger>
            <TabsTrigger value="presets">Presets</TabsTrigger>
            <TabsTrigger value="data">Data</TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[600px] mt-4">
            <TabsContent value="connection" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Model Selection</CardTitle>
                  <CardDescription>
                    Choose from preset models or configure custom endpoints
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Provider</label>
                      <Select onValueChange={handleProviderSelect}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select provider" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.keys(providerEndpoints).map((provider) => (
                            <SelectItem key={provider} value={provider}>
                              {provider}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Preset Models
                      </label>
                      <Select onValueChange={handleModelSelect}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select model" />
                        </SelectTrigger>
                        <SelectContent>
                          {presetModels.map((model) => (
                            <SelectItem key={model.model} value={model.model}>
                              <div className="flex items-center gap-2">
                                <span>{model.name}</span>
                                <Badge variant="secondary" className="text-xs">
                                  {model.provider}
                                </Badge>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Model Name</label>
                      <Input
                        value={apiConfiguration.modelName}
                        onChange={(e) =>
                          setAPIConfiguration({ modelName: e.target.value })
                        }
                        placeholder="gpt-4"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Base URL</label>
                      <Input
                        value={apiConfiguration.baseURL}
                        onChange={(e) =>
                          setAPIConfiguration({ baseURL: e.target.value })
                        }
                        placeholder="https://api.openai.com/v1"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">API Key</label>
                      <Input
                        type="password"
                        value={apiConfiguration.apiKey}
                        onChange={(e) =>
                          setAPIConfiguration({ apiKey: e.target.value })
                        }
                        placeholder="sk-..."
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="parameters" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Generation Parameters</CardTitle>
                  <CardDescription>
                    Fine-tune model behavior and output characteristics
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <label className="text-sm font-medium">
                            Temperature
                          </label>
                          <span className="text-sm text-muted-foreground">
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
                        />
                        <p className="text-xs text-muted-foreground">
                          Controls randomness: 0 = focused, 2 = creative
                        </p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <label className="text-sm font-medium">
                            Max Tokens
                          </label>
                          <span className="text-sm text-muted-foreground">
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
                        />
                        <p className="text-xs text-muted-foreground">
                          Maximum length of generated response
                        </p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <label className="text-sm font-medium">Top P</label>
                          <span className="text-sm text-muted-foreground">
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
                        />
                        <p className="text-xs text-muted-foreground">
                          Alternative to temperature, controls diversity
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <label className="text-sm font-medium">
                            Frequency Penalty
                          </label>
                          <span className="text-sm text-muted-foreground">
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
                        />
                        <p className="text-xs text-muted-foreground">
                          Reduces repetition based on frequency
                        </p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <label className="text-sm font-medium">
                            Presence Penalty
                          </label>
                          <span className="text-sm text-muted-foreground">
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
                        />
                        <p className="text-xs text-muted-foreground">
                          Encourages talking about new topics
                        </p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Custom Parameters (JSON)
                    </label>
                    <Textarea
                      value={customParamsJson}
                      onChange={(e) => handleCustomParamsChange(e.target.value)}
                      className={`font-mono text-sm ${
                        jsonError ? "border-red-500 focus:border-red-500" : ""
                      }`}
                      rows={4}
                      placeholder='{\n  "stop": ["\n"],\n  "seed": 42\n}'
                    />
                    {jsonError && (
                      <p className="text-xs text-red-500 mt-1">{jsonError}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="presets" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Configuration Presets</CardTitle>
                  <CardDescription>
                    Save and manage different configuration sets
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      value={newPresetName}
                      onChange={(e) => setNewPresetName(e.target.value)}
                      placeholder="Preset name"
                      className="flex-1"
                    />
                    <Button
                      onClick={() => {
                        if (newPresetName.trim()) {
                          saveConfigPreset(newPresetName.trim());
                          setNewPresetName("");
                        }
                      }}
                      disabled={!newPresetName.trim()}
                    >
                      <Save className="h-4 w-4 mr-1" />
                      Save Current
                    </Button>
                  </div>

                  <div className="space-y-2">
                    {configPresets.map((preset) => (
                      <div
                        key={preset.id}
                        className="flex items-center justify-between p-3 bg-card rounded-lg border"
                      >
                        <div>
                          <div className="font-medium">{preset.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {preset.configuration.modelName} •{" "}
                            {new Date(preset.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteConfigPreset(preset.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  {configPresets.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Save className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No saved presets</p>
                      <p className="text-xs">
                        Save your current configuration to reuse later
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="data" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Data Management</CardTitle>
                  <CardDescription>
                    Export, import, and reset your prompt lab data
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      onClick={exportConfig}
                      className="h-16 flex-col gap-1"
                    >
                      <Download className="h-5 w-5" />
                      <span>Export Data</span>
                    </Button>

                    <div className="relative">
                      <Button className="h-16 flex-col gap-1 w-full">
                        <Upload className="h-5 w-5" />
                        <span>Import Data</span>
                      </Button>
                      <input
                        type="file"
                        accept=".json"
                        onChange={importConfig}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Reset Options</h4>
                    <Button
                      variant="outline"
                      onClick={resetToDefaults}
                      className="w-full justify-start"
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Reset Configuration to Defaults
                    </Button>
                  </div>

                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>
                      <strong>Export:</strong> Downloads all your templates,
                      presets, and current configuration
                    </p>
                    <p>
                      <strong>Import:</strong> Loads data from a previously
                      exported file
                    </p>
                    <p>
                      <strong>Reset:</strong> Restores default API configuration
                      settings
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
