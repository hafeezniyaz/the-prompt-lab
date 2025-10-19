import React, { useState } from 'react'
import { useAppStore } from '../store/useAppStore'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Slider } from './ui/slider'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Settings, Save, Trash2, Plus, X, ChevronDown, ChevronRight, Menu, Zap, Play, Square } from 'lucide-react'
import { Switch } from './ui/switch'

interface VariableInputProps {
  variable: string
  value: string
  onChange: (value: string) => void
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
  )
}

interface CustomParameterRowProps {
  paramKey: string
  paramValue: any
  onUpdate: (key: string, value: any) => void
  onDelete: (key: string) => void
}

function CustomParameterRow({ paramKey, paramValue, onUpdate, onDelete }: CustomParameterRowProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editKey, setEditKey] = useState(paramKey)
  const [editValue, setEditValue] = useState(JSON.stringify(paramValue))
  
  const handleSave = () => {
    try {
      const parsed = JSON.parse(editValue)
      onUpdate(editKey, parsed)
      setIsEditing(false)
    } catch (error) {
      // Keep editing if JSON is invalid
    }
  }
  
  return (
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
            onChange={(e) => setEditValue(e.target.value)}
            className="h-7 flex-1"
            placeholder="Value (JSON)"
          />
          <Button size="sm" onClick={handleSave} className="h-7 w-7 p-0">
            <Save className="h-3 w-3" />
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => setIsEditing(false)}
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
  )
}

export function Header() {
  const {
    apiConfiguration,
    configPresets,
    detectedVariables,
    variableValues,
    isMissionControlOpen,
    isGenerating,
    setAPIConfiguration,
    saveConfigPreset,
    loadConfigPreset,
    deleteConfigPreset,
    updateVariableValues,
    setMissionControlOpen
  } = useAppStore()
  
  const [newPresetName, setNewPresetName] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [newParamKey, setNewParamKey] = useState('')
  const [newParamValue, setNewParamValue] = useState('')
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  
  const handleSavePreset = () => {
    if (newPresetName.trim()) {
      saveConfigPreset(newPresetName.trim())
      setNewPresetName('')
    }
  }
  
  const handleVariableChange = (variable: string, value: string) => {
    updateVariableValues({ [variable]: value })
  }
  
  const addCustomParameter = () => {
    if (newParamKey.trim() && newParamValue.trim()) {
      try {
        const parsed = JSON.parse(newParamValue)
        setAPIConfiguration({
          customParameters: {
            ...apiConfiguration.customParameters,
            [newParamKey]: parsed
          }
        })
        setNewParamKey('')
        setNewParamValue('')
      } catch (error) {
        // Handle invalid JSON
      }
    }
  }
  
  const updateCustomParameter = (key: string, value: any) => {
    setAPIConfiguration({
      customParameters: {
        ...apiConfiguration.customParameters,
        [key]: value
      }
    })
  }
  
  const deleteCustomParameter = (key: string) => {
    const newParams = { ...apiConfiguration.customParameters }
    delete newParams[key]
    setAPIConfiguration({ customParameters: newParams })
  }

  const handleGenerate = () => {
    // Find and trigger the generate button in MainPanel
    const generateButton = document.querySelector('[data-generate-button]') as HTMLButtonElement
    if (generateButton && !generateButton.disabled) {
      generateButton.click()
    }
  }

  const hasValidConfig = apiConfiguration.apiKey.trim() && 
                        apiConfiguration.baseURL.trim() && 
                        apiConfiguration.modelName.trim()
  
  return (
    <header className="bg-background border-b border-border sticky top-0 z-50">
      <div className="px-4 py-3">
        {/* Main Header Row */}
        <div className="flex items-center justify-between gap-4">
          {/* Left Section - Title */}
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white hidden sm:block">The Prompt Lab</h1>
            <h1 className="text-lg font-bold text-white sm:hidden">Prompt Lab</h1>
          </div>
          
          {/* Center Section - Core Configuration (Hidden on Mobile) */}
          <div className="hidden lg:flex items-center gap-3 flex-1 max-w-2xl">
            <div className="flex-1">
              <Input
                value={apiConfiguration.modelName}
                onChange={(e) => setAPIConfiguration({ modelName: e.target.value })}
                placeholder="Model (e.g., gpt-4)"
                className="h-8"
              />
            </div>
            <div className="flex-1">
              <Input
                type="password"
                value={apiConfiguration.apiKey}
                onChange={(e) => setAPIConfiguration({ apiKey: e.target.value })}
                placeholder="API Key"
                className="h-8"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground whitespace-nowrap">Temp:</span>
              <div className="w-16">
                <Slider
                  value={[apiConfiguration.temperature]}
                  onValueChange={(value) => setAPIConfiguration({ temperature: value[0] })}
                  max={2}
                  min={0}
                  step={0.01}
                  className="w-full"
                />
              </div>
              <span className="text-xs text-muted-foreground min-w-[2rem]">
                {apiConfiguration.temperature.toFixed(2)}
              </span>
            </div>
          </div>
          
          {/* Right Section - Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Quick Generate Button (Always Visible) */}
            <Button
              onClick={handleGenerate}
              disabled={!hasValidConfig}
              size="sm"
              className="h-8 hidden sm:flex"
            >
              {isGenerating ? (
                <>
                  <Square className="h-3 w-3 mr-1" />
                  Stop
                </>
              ) : (
                <>
                  <Play className="h-3 w-3 mr-1" />
                  Generate
                </>
              )}
            </Button>
            
            {/* Advanced Settings Button (Desktop) */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="h-8 hidden lg:flex"
            >
              <Settings className="h-4 w-4 mr-1" />
              Advanced
            </Button>
            
            {/* Mission Control Button (Tablet) */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMissionControlOpen(!isMissionControlOpen)}
              className="h-8 hidden md:flex lg:hidden"
            >
              <Settings className="h-4 w-4" />
            </Button>
            
            {/* Mobile Menu Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="h-8 md:hidden"
            >
              <Menu className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Advanced Configuration Section (Collapsible) */}
        {showAdvanced && (
          <div className="mt-3 pt-3 border-t border-border hidden lg:block">
            <div className="grid grid-cols-12 gap-3 items-end">
              {/* Base URL */}
              <div className="col-span-3">
                <label className="text-xs font-medium text-muted-foreground">Base URL</label>
                <Input
                  value={apiConfiguration.baseURL}
                  onChange={(e) => setAPIConfiguration({ baseURL: e.target.value })}
                  placeholder="https://api.openai.com/v1"
                  className="h-8 mt-1"
                />
              </div>
              
              {/* Max Tokens */}
              <div className="col-span-2">
                <label className="text-xs font-medium text-muted-foreground">Max Tokens</label>
                <div className="flex items-center gap-2 mt-1">
                  <Slider
                    value={[apiConfiguration.maxTokens]}
                    onValueChange={(value) => setAPIConfiguration({ maxTokens: value[0] })}
                    max={8000}
                    min={1}
                    step={1}
                    className="flex-1"
                  />
                  <span className="text-xs text-muted-foreground min-w-[3rem]">
                    {apiConfiguration.maxTokens}
                  </span>
                </div>
              </div>
              
              {/* Top P */}
              <div className="col-span-2">
                <label className="text-xs font-medium text-muted-foreground">Top P</label>
                <div className="flex items-center gap-2 mt-1">
                  <Slider
                    value={[apiConfiguration.topP]}
                    onValueChange={(value) => setAPIConfiguration({ topP: value[0] })}
                    max={1}
                    min={0}
                    step={0.01}
                    className="flex-1"
                  />
                  <span className="text-xs text-muted-foreground min-w-[2rem]">
                    {apiConfiguration.topP.toFixed(2)}
                  </span>
                </div>
              </div>
              
              {/* Presets */}
              <div className="col-span-3">
                <label className="text-xs font-medium text-muted-foreground">Presets</label>
                <div className="flex gap-1 mt-1">
                  <Select onValueChange={loadConfigPreset}>
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="Load preset" />
                    </SelectTrigger>
                    <SelectContent>
                      {configPresets.map(preset => (
                        <SelectItem key={preset.id} value={preset.id}>
                          {preset.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setMissionControlOpen(true)}
                    className="h-8 w-8 p-0"
                    title="Open Mission Control"
                  >
                    <Settings className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              
              {/* Generate Button */}
              <div className="col-span-2">
                <Button
                  onClick={handleGenerate}
                  disabled={!hasValidConfig}
                  className="h-8 w-full"
                >
                  {isGenerating ? (
                    <>
                      <Square className="h-3 w-3 mr-1" />
                      Stop
                    </>
                  ) : (
                    <>
                      <Zap className="h-3 w-3 mr-1" />
                      Generate
                    </>
                  )}
                </Button>
              </div>
            </div>
            
            {/* Variables Section */}
            {detectedVariables.length > 0 && (
              <div className="mt-3 pt-3 border-t border-border">
                <label className="text-xs font-medium text-muted-foreground mb-2 block">Variables</label>
                <div className="grid grid-cols-6 gap-2">
                  {detectedVariables.map(variable => (
                    <VariableInput
                      key={variable}
                      variable={variable}
                      value={variableValues[variable] || ''}
                      onChange={(value) => handleVariableChange(variable, value)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Mobile Configuration Menu */}
        {showMobileMenu && (
          <div className="mt-3 pt-3 border-t border-border md:hidden">
            <div className="space-y-3">
              {/* Core Configuration */}
              <div className="grid grid-cols-1 gap-2">
                <Input
                  value={apiConfiguration.modelName}
                  onChange={(e) => setAPIConfiguration({ modelName: e.target.value })}
                  placeholder="Model (e.g., gpt-4)"
                  className="h-8"
                />
                <Input
                  type="password"
                  value={apiConfiguration.apiKey}
                  onChange={(e) => setAPIConfiguration({ apiKey: e.target.value })}
                  placeholder="API Key"
                  className="h-8"
                />
                <Input
                  value={apiConfiguration.baseURL}
                  onChange={(e) => setAPIConfiguration({ baseURL: e.target.value })}
                  placeholder="Base URL"
                  className="h-8"
                />
              </div>
              
              {/* Parameters */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Temperature</label>
                  <div className="flex items-center gap-2 mt-1">
                    <Slider
                      value={[apiConfiguration.temperature]}
                      onValueChange={(value) => setAPIConfiguration({ temperature: value[0] })}
                      max={2}
                      min={0}
                      step={0.01}
                      className="flex-1"
                    />
                    <span className="text-xs text-muted-foreground min-w-[2rem]">
                      {apiConfiguration.temperature.toFixed(2)}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Max Tokens</label>
                  <div className="flex items-center gap-2 mt-1">
                    <Slider
                      value={[apiConfiguration.maxTokens]}
                      onValueChange={(value) => setAPIConfiguration({ maxTokens: value[0] })}
                      max={8000}
                      min={1}
                      step={1}
                      className="flex-1"
                    />
                    <span className="text-xs text-muted-foreground min-w-[3rem]">
                      {apiConfiguration.maxTokens}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Variables */}
              {detectedVariables.length > 0 && (
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-2 block">Variables</label>
                  <div className="grid grid-cols-1 gap-2">
                    {detectedVariables.map(variable => (
                      <VariableInput
                        key={variable}
                        variable={variable}
                        value={variableValues[variable] || ''}
                        onChange={(value) => handleVariableChange(variable, value)}
                      />
                    ))}
                  </div>
                </div>
              )}
              
              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button
                  onClick={handleGenerate}
                  disabled={!hasValidConfig}
                  className="flex-1 h-8"
                >
                  {isGenerating ? (
                    <>
                      <Square className="h-3 w-3 mr-1" />
                      Stop
                    </>
                  ) : (
                    <>
                      <Play className="h-3 w-3 mr-1" />
                      Generate
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setMissionControlOpen(true)}
                  className="h-8 px-3"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}