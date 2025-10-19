import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useAppStore } from "../store/useAppStore";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { ScrollArea } from "./ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import {
  Plus,
  GripVertical,
  Edit2,
  Trash2,
  Copy,
  User,
  Bot,
  Settings,
  Wrench,
  Play,
  FolderOpen,
  ChevronDown,
  ChevronRight,
  Maximize2,
} from "lucide-react";
import { countTokens } from "../utils/tokenCounter";
import { ToolsSection } from "./ToolsSection";
import { SessionsPanel } from "./SessionsPanel";
import type { MessageRole, MessageType } from "../store/useAppStore";

const roleIcons = {
  user: User,
  assistant: Bot,
  system: Settings,
  tool: Wrench,
};

const roleColors = {
  user: "text-gray-200",
  assistant: "text-white",
  system: "text-gray-400",
  tool: "text-gray-300",
};

interface SortableMessageProps {
  message: {
    id: string;
    role: MessageRole;
    content: string;
  };
  onUpdate: (id: string, updates: any) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onGenerate: () => void;
}

function SortableMessage({
  message,
  onUpdate,
  onDelete,
  onDuplicate,
  onGenerate,
}: SortableMessageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: message.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    onUpdate(message.id, { content: editContent });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditContent(message.content);
    setIsEditing(false);
  };

  const handleRoleChange = (newRole: MessageRole) => {
    onUpdate(message.id, { role: newRole });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      if (isEditing) {
        handleSave();
      }
      // Trigger generation after a brief delay to allow state to update
      setTimeout(() => {
        onGenerate();
      }, 100);

      // Show visual feedback
      if (textareaRef.current) {
        textareaRef.current.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
        setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.style.backgroundColor = "";
          }
        }, 200);
      }
    }
  };

  const IconComponent = roleIcons[message.role];
  const tokenCount = countTokens(message.content);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group relative bg-card border border-border rounded-lg p-3 mb-2 hover:border-accent transition-colors"
    >
      {/* Drag Handle */}
      <div
        className="absolute left-1 top-1 opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing transition-opacity"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-2 ml-6">
        <div className="flex items-center gap-2">
          <Select value={message.role} onValueChange={handleRoleChange}>
            <SelectTrigger className="w-28 h-7">
              <div className="flex items-center gap-1">
                <IconComponent
                  className={`h-3 w-3 ${roleColors[message.role]}`}
                />
                <SelectValue />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="user">
                <div className="flex items-center gap-2">
                  <User className="h-3 w-3 text-gray-200" />
                  User
                </div>
              </SelectItem>
              <SelectItem value="assistant">
                <div className="flex items-center gap-2">
                  <Bot className="h-3 w-3 text-white" />
                  Assistant
                </div>
              </SelectItem>
              <SelectItem value="system">
                <div className="flex items-center gap-2">
                  <Settings className="h-3 w-3 text-gray-400" />
                  System
                </div>
              </SelectItem>
              <SelectItem value="tool">
                <div className="flex items-center gap-2">
                  <Wrench className="h-3 w-3 text-gray-300" />
                  Tool
                </div>
              </SelectItem>
            </SelectContent>
          </Select>

          <span className="text-xs text-muted-foreground">
            {tokenCount} tokens
          </span>
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDuplicate(message.id)}
            className="h-6 w-6 p-0"
            title="Duplicate message"
          >
            <Copy className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
            className="h-6 w-6 p-0"
            title="Edit message"
          >
            <Edit2 className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(message.id)}
            className="h-6 w-6 p-0 text-destructive hover:text-destructive"
            title="Delete message"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Content */}
      {isEditing ? (
        <div className="space-y-2">
          <Textarea
            ref={textareaRef}
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            onKeyDown={handleKeyDown}
            className="min-h-[80px] resize-none"
            placeholder="Enter message content... (Ctrl+Enter to save and generate)"
          />
          <div className="flex justify-end gap-1">
            <Button variant="outline" size="sm" onClick={handleCancel}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave}>
              Save
            </Button>
          </div>
        </div>
      ) : (
        <div
          className="text-sm whitespace-pre-wrap cursor-pointer hover:bg-accent/50 rounded p-2 transition-colors"
          onClick={() => setIsEditing(true)}
        >
          {message.content || (
            <span className="text-muted-foreground italic">
              Click to add content...
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export function LeftPanel() {
  const {
    systemPrompt,
    messages,
    templates,
    setSystemPrompt,
    addMessage,
    updateMessage,
    deleteMessage,
    duplicateMessage,
    reorderMessages,
    saveTemplate,
    loadTemplate,
    deleteTemplate,
  } = useAppStore();

  const [newTemplateName, setNewTemplateName] = useState("");
  const [isSystemPromptEditing, setIsSystemPromptEditing] = useState(false);
  const [systemPromptEdit, setSystemPromptEdit] = useState(systemPrompt);
  const [isSystemPromptCollapsed, setIsSystemPromptCollapsed] = useState(false);
  const [isSystemPromptModalOpen, setIsSystemPromptModalOpen] = useState(false);
  const systemPromptRef = useRef<HTMLTextAreaElement>(null);
  const systemPromptModalRef = useRef<HTMLTextAreaElement>(null);
  const [generateTrigger, setGenerateTrigger] = useState(0);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (isSystemPromptEditing && systemPromptRef.current) {
      systemPromptRef.current.focus();
    }
  }, [isSystemPromptEditing]);

  useEffect(() => {
    if (isSystemPromptModalOpen && systemPromptModalRef.current) {
      systemPromptModalRef.current.focus();
    }
  }, [isSystemPromptModalOpen]);

  useEffect(() => {
    setSystemPromptEdit(systemPrompt);
  }, [systemPrompt]);

  // Trigger generation when generateTrigger changes
  useEffect(() => {
    if (generateTrigger > 0) {
      // Find and trigger the generate button in MainPanel
      const generateButton = document.querySelector(
        "[data-generate-button]"
      ) as HTMLButtonElement;
      if (generateButton && !generateButton.disabled) {
        generateButton.click();
      }
    }
  }, [generateTrigger]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = messages.findIndex((msg) => msg.id === active.id);
      const newIndex = messages.findIndex((msg) => msg.id === over.id);
      reorderMessages(oldIndex, newIndex);
    }
  };

  const handleSystemPromptSave = () => {
    setSystemPrompt(systemPromptEdit);
    setIsSystemPromptEditing(false);
  };

  const handleSystemPromptCancel = () => {
    setSystemPromptEdit(systemPrompt);
    setIsSystemPromptEditing(false);
  };

  const handleSystemPromptModalSave = () => {
    setSystemPrompt(systemPromptEdit);
    setIsSystemPromptModalOpen(false);
  };

  const handleSystemPromptModalCancel = () => {
    setSystemPromptEdit(systemPrompt);
    setIsSystemPromptModalOpen(false);
  };

  const handleSystemPromptModalKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSystemPromptModalSave();
      setGenerateTrigger((prev) => prev + 1);
    }
    if (e.key === "Escape") {
      e.preventDefault();
      handleSystemPromptModalCancel();
    }
  };

  const handleSaveTemplate = () => {
    if (newTemplateName.trim()) {
      saveTemplate(newTemplateName.trim());
      setNewTemplateName("");
    }
  };

  const handleGenerate = () => {
    setGenerateTrigger((prev) => prev + 1);
  };

  const handleSystemPromptKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      if (isSystemPromptEditing) {
        handleSystemPromptSave();
      }
      // Trigger generation after a brief delay
      setTimeout(() => {
        handleGenerate();
      }, 100);

      // Show visual feedback
      if (systemPromptRef.current) {
        systemPromptRef.current.style.backgroundColor =
          "rgba(255, 255, 255, 0.1)";
        setTimeout(() => {
          if (systemPromptRef.current) {
            systemPromptRef.current.style.backgroundColor = "";
          }
        }, 200);
      }
    }
  };

  const systemPromptTokens = countTokens(systemPrompt);
  const totalMessageTokens = messages.reduce(
    (total, msg) => total + countTokens(msg.content),
    0
  );

  return (
    <div className="h-full flex flex-col">
      <Tabs defaultValue="sessions" className="h-full flex flex-col">
        <div className="p-4 border-b border-border">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="sessions" className="flex items-center gap-2">
              <FolderOpen className="h-4 w-4" />
              Sessions
            </TabsTrigger>
            <TabsTrigger value="prompt" className="flex items-center gap-2">
              <Play className="h-4 w-4" />
              Prompt
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="sessions" className="flex-1 m-0">
          <SessionsPanel />
        </TabsContent>

        <TabsContent value="prompt" className="flex-1 m-0">
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-border">
              <h2 className="text-lg font-semibold mb-2">
                Prompt Construction
              </h2>

              {/* Template Management */}
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Select onValueChange={loadTemplate}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Load template" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTemplateName}
                    onChange={(e) => setNewTemplateName(e.target.value)}
                    placeholder="Template name"
                    className="flex-1 px-2 py-1 text-sm bg-background border border-input rounded"
                    onKeyDown={(e) => e.key === "Enter" && handleSaveTemplate()}
                  />
                  <Button
                    size="sm"
                    onClick={handleSaveTemplate}
                    disabled={!newTemplateName.trim()}
                  >
                    Save
                  </Button>
                </div>
              </div>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-4 space-y-4">
                {/* System Prompt */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setIsSystemPromptCollapsed(!isSystemPromptCollapsed)
                        }
                        className="h-6 w-6 p-0 hover:bg-accent"
                      >
                        {isSystemPromptCollapsed ? (
                          <ChevronRight className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                      <label className="text-sm font-medium">
                        System Prompt
                      </label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsSystemPromptModalOpen(true)}
                        className="h-6 w-6 p-0 hover:bg-accent"
                        title="Expand to full screen editor"
                      >
                        <Maximize2 className="h-4 w-4" />
                      </Button>
                      <span className="text-xs text-muted-foreground">
                        {systemPromptTokens} tokens
                      </span>
                    </div>
                  </div>

                  {!isSystemPromptCollapsed && (
                    <>
                      {isSystemPromptEditing ? (
                        <div className="space-y-2">
                          <Textarea
                            ref={systemPromptRef}
                            value={systemPromptEdit}
                            onChange={(e) =>
                              setSystemPromptEdit(e.target.value)
                            }
                            onKeyDown={handleSystemPromptKeyDown}
                            className="min-h-[200px] max-h-[400px] resize-none font-mono text-sm overflow-y-auto"
                            placeholder="Enter system prompt instructions... (Ctrl+Enter to save and generate)"
                          />
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleSystemPromptCancel}
                            >
                              Cancel
                            </Button>
                            <Button size="sm" onClick={handleSystemPromptSave}>
                              Save
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div
                          className="min-h-[120px] max-h-[300px] p-3 bg-card border border-border rounded-lg cursor-pointer hover:border-accent transition-colors overflow-y-auto"
                          onClick={() => setIsSystemPromptEditing(true)}
                        >
                          <div className="text-sm font-mono whitespace-pre-wrap">
                            {systemPrompt || (
                              <span className="text-muted-foreground italic">
                                Click to add system prompt...
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Tools Section */}
                <ToolsSection />

                {/* Messages */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between sticky top-0 bg-background/95 backdrop-blur-sm z-10 py-2 -my-2 border-b border-border/50">
                    <label className="text-sm font-medium">Messages</label>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {totalMessageTokens} tokens
                      </span>
                      <Button
                        size="sm"
                        onClick={() => addMessage("user")}
                        className="h-7"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Message
                      </Button>
                    </div>
                  </div>

                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={messages.map((m) => m.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <AnimatePresence>
                        {messages.map((message) => (
                          <motion.div
                            key={message.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.2 }}
                          >
                            <SortableMessage
                              message={message}
                              onUpdate={updateMessage}
                              onDelete={deleteMessage}
                              onDuplicate={duplicateMessage}
                              onGenerate={handleGenerate}
                            />
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </SortableContext>
                  </DndContext>

                  {messages.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Bot className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No messages yet</p>
                      <p className="text-xs">
                        Click "+ Message" to start building your conversation
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </ScrollArea>

            {/* Footer */}
            <div className="p-4 border-t border-border">
              <div className="text-xs text-muted-foreground text-center">
                Total: {systemPromptTokens + totalMessageTokens} tokens
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* System Prompt Modal */}
      <Dialog
        open={isSystemPromptModalOpen}
        onOpenChange={setIsSystemPromptModalOpen}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>System Prompt Editor</DialogTitle>
            <DialogDescription>
              Edit your system prompt with a maximized view. Use Ctrl+Enter to
              save and generate, or Escape to cancel.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-muted-foreground">
                {systemPromptTokens} tokens
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleSystemPromptModalCancel}
                >
                  Cancel
                </Button>
                <Button onClick={handleSystemPromptModalSave}>
                  Save & Close
                </Button>
              </div>
            </div>

            <Textarea
              ref={systemPromptModalRef}
              value={systemPromptEdit}
              onChange={(e) => setSystemPromptEdit(e.target.value)}
              onKeyDown={handleSystemPromptModalKeyDown}
              className="flex-1 min-h-[400px] resize-none font-mono text-sm"
              placeholder="Enter system prompt instructions... (Ctrl+Enter to save and generate, Escape to cancel)"
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
