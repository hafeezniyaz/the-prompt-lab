import React, { useState } from 'react'
import { useAppStore } from '../store/useAppStore'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { ScrollArea } from './ui/scroll-area'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Switch } from './ui/switch'
import { Badge } from './ui/badge'
import { Plus, Edit2, Trash2, Save, X, Wrench, ChevronDown, ChevronRight, Download, Upload } from 'lucide-react'
import type { Tool } from '../store/useAppStore'

interface ToolEditFormProps {
  tool?: Tool
  onSave: (tool: Omit<Tool, 'id'>) => void
  onCancel: () => void
}

function ToolEditForm({ tool, onSave, onCancel }: ToolEditFormProps) {
  const [name, setName] = useState(tool?.name || '')
  const [description, setDescription] = useState(tool?.description || '')
  const [enabled, setEnabled] = useState(tool?.enabled ?? true)
  const [parametersJson, setParametersJson] = useState(
    JSON.stringify(tool?.parameters || {
      type: 'object',
      properties: {},
      required: []
    }, null, 2)
  )
  const [jsonError, setJsonError] = useState('')

  const handleSave = () => {
    if (!name.trim()) {
      setJsonError('Tool name is required')
      return
    }

    try {
      const parameters = JSON.parse(parametersJson)
      if (!parameters.type || parameters.type !== 'object') {
        setJsonError('Parameters must be an object with type "object"')
        return
      }

      onSave({
        name: name.trim(),
        description: description.trim(),
        enabled,
        parameters
      })
      setJsonError('')
    } catch (error) {
      setJsonError('Invalid JSON format')
    }
  }

  return (
    <Card className="border-accent">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">
          {tool ? 'Edit Tool' : 'New Tool'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1">
          <label className="text-xs font-medium">Name</label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Tool name"
            className="h-8"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium">Description</label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe what this tool does"
            className="h-16 resize-none"
          />
        </div>

        <div className="flex items-center justify-between">
          <label className="text-xs font-medium">Enabled</label>
          <Switch
            checked={enabled}
            onCheckedChange={setEnabled}
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium">Parameters (JSON Schema)</label>
          <Textarea
            value={parametersJson}
            onChange={(e) => {
              setParametersJson(e.target.value)
              setJsonError('')
            }}
            placeholder="JSON schema for tool parameters"
            className="h-32 resize-none font-mono text-xs"
          />
          {jsonError && (
            <div className="text-xs text-destructive">{jsonError}</div>
          )}
        </div>

        <div className="flex gap-2 justify-end">
          <Button variant="outline" size="sm" onClick={onCancel}>
            <X className="h-3 w-3 mr-1" />
            Cancel
          </Button>
          <Button size="sm" onClick={handleSave}>
            <Save className="h-3 w-3 mr-1" />
            Save
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

interface ToolCardProps {
  tool: Tool
  onEdit: () => void
  onDelete: () => void
  onToggle: () => void
}

function ToolCard({ tool, onEdit, onDelete, onToggle }: ToolCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <Card className={`group transition-colors ${
      tool.enabled ? 'border-white/20 bg-white/5' : 'border-border'
    }`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wrench className={`h-4 w-4 ${
              tool.enabled ? 'text-white' : 'text-muted-foreground'
            }`} />
            <CardTitle className="text-sm">{tool.name}</CardTitle>
            <Badge variant={tool.enabled ? 'default' : 'secondary'} className="text-xs">
              {tool.enabled ? 'Enabled' : 'Disabled'}
            </Badge>
          </div>
          <div className="flex items-center gap-1">
            <Switch
              checked={tool.enabled}
              onCheckedChange={onToggle}
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              {isExpanded ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onEdit}
              className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Edit2 className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {tool.description || 'No description provided'}
        </p>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="pt-0">
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Schema Preview:</label>
            <pre className="text-xs bg-muted/50 p-2 rounded overflow-x-auto">
              {JSON.stringify(tool.parameters, null, 2)}
            </pre>
          </div>
        </CardContent>
      )}
    </Card>
  )
}

export function ToolsSection() {
  const {
    tools,
    toolSets,
    addTool,
    updateTool,
    deleteTool,
    toggleTool,
    saveToolSet,
    loadToolSet,
    deleteToolSet
  } = useAppStore()
  
  const [isEditing, setIsEditing] = useState(false)
  const [editingTool, setEditingTool] = useState<Tool | null>(null)
  const [newToolSetName, setNewToolSetName] = useState('')
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  const handleSaveTool = (toolData: Omit<Tool, 'id'>) => {
    if (editingTool) {
      updateTool(editingTool.id, toolData)
    } else {
      addTool(toolData)
    }
    setIsEditing(false)
    setEditingTool(null)
  }

  const handleEditTool = (tool: Tool) => {
    setEditingTool(tool)
    setIsEditing(true)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditingTool(null)
  }

  const handleSaveToolSet = () => {
    if (newToolSetName.trim()) {
      saveToolSet(newToolSetName.trim())
      setNewToolSetName('')
    }
  }
  
  const handleDeleteToolSet = (id: string) => {
    if (deleteConfirmId === id) {
      deleteToolSet(id)
      setDeleteConfirmId(null)
    } else {
      setDeleteConfirmId(id)
      // Auto-cancel confirmation after 3 seconds
      setTimeout(() => {
        setDeleteConfirmId(null)
      }, 3000)
    }
  }

  const exportToolSet = () => {
    if (tools.length === 0) return
    
    const data = {
      name: 'Exported Tool Set',
      tools,
      exportedAt: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'tools.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const importToolSet = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string)
        if (data.tools && Array.isArray(data.tools)) {
          data.tools.forEach((tool: any) => {
            if (tool.name && tool.parameters) {
              addTool({
                name: tool.name,
                description: tool.description || '',
                enabled: tool.enabled ?? true,
                parameters: tool.parameters
              })
            }
          })
        }
      } catch (error) {
        console.error('Failed to import tools:', error)
      }
    }
    reader.readAsText(file)
    event.target.value = '' // Reset input
  }

  const enabledToolsCount = tools.filter(t => t.enabled).length

  return (
    <div className="space-y-2">
      {/* Header */}
      <div 
        className="flex items-center justify-between cursor-pointer p-2 hover:bg-accent/50 rounded transition-colors"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <div className="flex items-center gap-2">
          <Wrench className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-medium">Tools</h3>
          {enabledToolsCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {enabledToolsCount} enabled
            </Badge>
          )}
        </div>
        {isCollapsed ? (
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </div>

      {!isCollapsed && (
        <div className="space-y-3">
          {/* Tool Set Management */}
          <div className="space-y-2">
            <Select onValueChange={loadToolSet}>
              <SelectTrigger className="h-8">
                <SelectValue placeholder="Load tool set" />
              </SelectTrigger>
              <SelectContent>
                {toolSets.map(toolSet => (
                  <SelectItem key={toolSet.id} value={toolSet.id}>
                    {toolSet.name} ({toolSet.tools.length} tools)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {/* Saved Tool Sets with Delete Option */}
            {toolSets.length > 0 && (
              <div className="space-y-1 max-h-32 overflow-y-auto">
                <label className="text-xs font-medium text-muted-foreground">Saved Tool Sets:</label>
                {toolSets.map(toolSet => (
                  <div key={toolSet.id} className="flex items-center justify-between p-2 bg-card rounded border group">
                    <div className="flex-1">
                      <div className="text-xs font-medium">{toolSet.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {toolSet.tools.length} tools • {new Date(toolSet.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteToolSet(toolSet.id)}
                      className={`h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity ${
                        deleteConfirmId === toolSet.id ? 'text-destructive bg-destructive/10' : 'text-muted-foreground hover:text-destructive'
                      }`}
                      title={deleteConfirmId === toolSet.id ? 'Click again to confirm deletion' : 'Delete tool set'}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            
            <div className="flex gap-1">
              <Input
                value={newToolSetName}
                onChange={(e) => setNewToolSetName(e.target.value)}
                placeholder="Tool set name"
                className="flex-1 h-7 text-xs"
                onKeyDown={(e) => e.key === 'Enter' && handleSaveToolSet()}
              />
              <Button size="sm" onClick={handleSaveToolSet} disabled={!newToolSetName.trim()} className="h-7">
                Save
              </Button>
            </div>

            {/* Import/Export */}
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={exportToolSet}
                disabled={tools.length === 0}
                className="h-7 flex-1"
              >
                <Download className="h-3 w-3 mr-1" />
                Export
              </Button>
              <label className="flex-1">
                <input
                  type="file"
                  accept=".json"
                  onChange={importToolSet}
                  className="hidden"
                />
                <Button variant="outline" size="sm" className="h-7 w-full" asChild>
                  <span>
                    <Upload className="h-3 w-3 mr-1" />
                    Import
                  </span>
                </Button>
              </label>
            </div>
          </div>

          {/* Add Tool Button */}
          {!isEditing && (
            <Button
              size="sm"
              onClick={() => setIsEditing(true)}
              className="w-full h-8"
            >
              <Plus className="h-3 w-3 mr-1" />
              Add Tool
            </Button>
          )}

          {/* Tool Edit Form */}
          {isEditing && (
            <ToolEditForm
              tool={editingTool || undefined}
              onSave={handleSaveTool}
              onCancel={handleCancelEdit}
            />
          )}

          {/* Tools List */}
          <div className="space-y-2">
            {tools.map((tool) => (
              <ToolCard
                key={tool.id}
                tool={tool}
                onEdit={() => handleEditTool(tool)}
                onDelete={() => deleteTool(tool.id)}
                onToggle={() => toggleTool(tool.id)}
              />
            ))}
          </div>

          {tools.length === 0 && !isEditing && (
            <div className="text-center py-4 text-muted-foreground">
              <Wrench className="h-6 w-6 mx-auto mb-2 opacity-50" />
              <p className="text-xs">No tools configured</p>
              <p className="text-xs opacity-70">Add tools to enhance your AI interactions</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
