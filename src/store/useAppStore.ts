import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import {
  localStorageService,
  PlaygroundSession,
} from "../services/localStorageService";

export type MessageRole = "system" | "user" | "assistant" | "tool";
export type MessageType = "regular" | "thinking" | "tool_call";

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  type?: MessageType;
  metadata?: any;
}

export interface Tool {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  parameters: {
    type: "object";
    properties: Record<string, any>;
    required?: string[];
  };
}

export interface ToolSet {
  id: string;
  name: string;
  tools: Tool[];
  createdAt: string;
}

export interface APIConfiguration {
  modelName: string;
  baseURL: string;
  apiKey: string;
  temperature: number;
  maxTokens: number;
  topP: number;
  frequencyPenalty: number;
  presencePenalty: number;
  customParameters: Record<string, any>;
}

export interface Template {
  id: string;
  name: string;
  systemPrompt: string;
  messages: Message[];
  createdAt: string;
}

export interface ConfigPreset {
  id: string;
  name: string;
  configuration: APIConfiguration;
  createdAt: string;
}

export interface AppState {
  // Current Session
  currentSessionId: string | null;

  // Prompt and Messages
  systemPrompt: string;
  messages: Message[];

  // API Configuration
  apiConfiguration: APIConfiguration;

  // Templates and Presets
  templates: Template[];
  configPresets: ConfigPreset[];

  // Tools
  tools: Tool[];
  toolSets: ToolSet[];

  // Output and Generation
  output: string;
  outputType: MessageType;
  isGenerating: boolean;
  generationMetrics: {
    tokensPerSecond: number;
    totalTokens: number;
  };

  // Variables
  detectedVariables: string[];
  variableValues: Record<string, string>;

  // UI State
  isMissionControlOpen: boolean;
  leftPanelWidth: number;
  rightPanelWidth: number;
  isRightPanelCollapsed: boolean;

  // Actions
  setSystemPrompt: (prompt: string) => void;
  addMessage: (
    role: MessageRole,
    content?: string,
    type?: MessageType,
    metadata?: any
  ) => void;
  updateMessage: (id: string, updates: Partial<Message>) => void;
  deleteMessage: (id: string) => void;
  duplicateMessage: (id: string) => void;
  reorderMessages: (oldIndex: number, newIndex: number) => void;
  pushOutputToMessages: () => void;
  triggerGeneration: () => void;

  setAPIConfiguration: (config: Partial<APIConfiguration>) => void;

  saveTemplate: (name: string) => void;
  loadTemplate: (id: string) => void;
  deleteTemplate: (id: string) => void;

  saveConfigPreset: (name: string) => void;
  loadConfigPreset: (id: string) => void;
  deleteConfigPreset: (id: string) => void;

  // Tools
  addTool: (tool: Omit<Tool, "id">) => void;
  updateTool: (id: string, updates: Partial<Tool>) => void;
  deleteTool: (id: string) => void;
  toggleTool: (id: string) => void;
  saveToolSet: (name: string) => void;
  loadToolSet: (id: string) => void;
  deleteToolSet: (id: string) => void;

  setOutput: (output: string, type?: MessageType) => void;
  setGenerating: (generating: boolean) => void;
  updateGenerationMetrics: (
    metrics: Partial<AppState["generationMetrics"]>
  ) => void;

  updateVariableValues: (values: Record<string, string>) => void;

  setMissionControlOpen: (open: boolean) => void;
  setPanelWidths: (left: number, right: number) => void;
  setRightPanelCollapsed: (collapsed: boolean) => void;

  // Session Management
  createSession: (name: string) => void;
  loadSession: (sessionId: string) => void;
  saveCurrentSession: () => void;
  deleteSession: (sessionId: string) => void;
  renameSession: (sessionId: string, newName: string) => void;
  getAllSessions: () => PlaygroundSession[];
  setCurrentSessionId: (sessionId: string | null) => void;

  // Utilities
  getProcessedPrompt: () => string;
  getProcessedMessages: () => Message[];
  resetOutput: () => void;
}

const defaultAPIConfiguration: APIConfiguration = {
  modelName: "gpt-4",
  baseURL: "https://api.openai.com/v1",
  apiKey: "",
  temperature: 0.7,
  maxTokens: 2000,
  topP: 1,
  frequencyPenalty: 0,
  presencePenalty: 0,
  customParameters: {},
};

const generateId = () => Math.random().toString(36).substring(2, 15);

const detectVariables = (text: string): string[] => {
  const matches = text.match(/\{\{([^}]+)\}\}/g);
  if (!matches) return [];
  return Array.from(new Set(matches.map((match) => match.slice(2, -2).trim())));
};

const processTextWithVariables = (
  text: string,
  variables: Record<string, string>
): string => {
  let processed = text;
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, "g");
    processed = processed.replace(regex, value);
  });
  return processed;
};

export const useAppStore = create<AppState>((set, get) => {
  // Initialize from localStorage
  const initializeFromStorage = () => {
    const settings = localStorageService.getSettings();
    const currentSessionId = localStorageService.getCurrentSessionId();

    let sessionData = {
      systemPrompt: "",
      messages: [],
      apiConfiguration: defaultAPIConfiguration,
      tools: [],
      variableValues: {},
    };

    if (currentSessionId) {
      const session = localStorageService.getSession(currentSessionId);
      if (session) {
        sessionData = {
          systemPrompt: session.systemPrompt,
          messages: session.messages,
          apiConfiguration: session.apiConfiguration,
          tools: session.tools,
          variableValues: session.variableValues,
        };
      }
    }

    return {
      currentSessionId,
      ...sessionData,
      templates: localStorageService.getAllTemplates(),
      configPresets: localStorageService.getAllConfigPresets(),
      toolSets: localStorageService.getAllToolSets(),
      leftPanelWidth: settings.leftPanelWidth,
      rightPanelWidth: settings.rightPanelWidth,
      isRightPanelCollapsed: settings.isRightPanelCollapsed,
    };
  };

  return {
    // Initial state
    ...initializeFromStorage(),
    output: "",
    outputType: "regular",
    isGenerating: false,
    generationMetrics: {
      tokensPerSecond: 0,
      totalTokens: 0,
    },
    detectedVariables: [],
    isMissionControlOpen: false,

    // Actions
    setSystemPrompt: (prompt: string) => {
      const variables = detectVariables(prompt);
      set((state) => ({
        systemPrompt: prompt,
        detectedVariables: [
          ...new Set([...state.detectedVariables, ...variables]),
        ],
      }));
      // Auto-save current session
      get().saveCurrentSession();
    },

    addMessage: (
      role: MessageRole,
      content = "",
      type: MessageType = "regular",
      metadata = null
    ) => {
      const newMessage: Message = {
        id: generateId(),
        role,
        content,
        type,
        metadata,
      };
      set((state) => ({ messages: [...state.messages, newMessage] }));
      // Auto-save current session
      get().saveCurrentSession();
    },

    updateMessage: (id: string, updates: Partial<Message>) => {
      set((state) => ({
        messages: state.messages.map((msg) =>
          msg.id === id ? { ...msg, ...updates } : msg
        ),
      }));

      // Update detected variables if content changed
      if (updates.content !== undefined) {
        const state = get();
        const allText =
          state.systemPrompt +
          " " +
          state.messages.map((m) => m.content).join(" ");
        const variables = detectVariables(allText);
        set({ detectedVariables: variables });
      }
      // Auto-save current session
      get().saveCurrentSession();
    },

    deleteMessage: (id: string) => {
      set((state) => ({
        messages: state.messages.filter((msg) => msg.id !== id),
      }));
      // Auto-save current session
      get().saveCurrentSession();
    },

    duplicateMessage: (id: string) => {
      set((state) => {
        const messageIndex = state.messages.findIndex((msg) => msg.id === id);
        if (messageIndex === -1) return state;

        const originalMessage = state.messages[messageIndex];
        const duplicatedMessage: Message = {
          ...originalMessage,
          id: generateId(),
          metadata: {
            ...originalMessage.metadata,
            duplicatedFrom: id,
            duplicatedAt: new Date().toISOString(),
          },
        };

        const newMessages = [...state.messages];
        newMessages.splice(messageIndex + 1, 0, duplicatedMessage);

        return { messages: newMessages };
      });
      // Auto-save current session
      get().saveCurrentSession();
    },

    reorderMessages: (oldIndex: number, newIndex: number) => {
      set((state) => {
        const newMessages = [...state.messages];
        const [movedMessage] = newMessages.splice(oldIndex, 1);
        newMessages.splice(newIndex, 0, movedMessage);
        return { messages: newMessages };
      });
      // Auto-save current session
      get().saveCurrentSession();
    },

    setAPIConfiguration: (config: Partial<APIConfiguration>) => {
      set((state) => ({
        apiConfiguration: { ...state.apiConfiguration, ...config },
      }));
      // Auto-save current session
      get().saveCurrentSession();
    },

    saveTemplate: (name: string) => {
      const state = get();
      const template: Template = {
        id: generateId(),
        name,
        systemPrompt: state.systemPrompt,
        messages: state.messages,
        createdAt: new Date().toISOString(),
      };
      localStorageService.saveTemplate(template);
      set((state) => ({ templates: [...state.templates, template] }));
    },

    loadTemplate: (id: string) => {
      const state = get();
      const template = state.templates.find((t) => t.id === id);
      if (template) {
        set({
          systemPrompt: template.systemPrompt,
          messages: template.messages,
        });
        // Auto-save current session after loading template
        get().saveCurrentSession();
      }
    },

    deleteTemplate: (id: string) => {
      localStorageService.deleteTemplate(id);
      set((state) => ({
        templates: state.templates.filter((t) => t.id !== id),
      }));
    },

    saveConfigPreset: (name: string) => {
      const state = get();
      const preset: ConfigPreset = {
        id: generateId(),
        name,
        configuration: state.apiConfiguration,
        createdAt: new Date().toISOString(),
      };
      localStorageService.saveConfigPreset(preset);
      set((state) => ({ configPresets: [...state.configPresets, preset] }));
    },

    loadConfigPreset: (id: string) => {
      const state = get();
      const preset = state.configPresets.find((p) => p.id === id);
      if (preset) {
        set({ apiConfiguration: preset.configuration });
        // Auto-save current session after loading preset
        get().saveCurrentSession();
      }
    },

    deleteConfigPreset: (id: string) => {
      localStorageService.deleteConfigPreset(id);
      set((state) => ({
        configPresets: state.configPresets.filter((p) => p.id !== id),
      }));
    },

    setOutput: (output: string, type: MessageType = "regular") =>
      set({ output, outputType: type }),

    pushOutputToMessages: () => {
      const state = get();
      if (!state.output.trim()) return;

      // Enhanced content parsing for proper type detection
      const detectContentType = (
        content: string
      ): { type: MessageType; cleanContent: string } => {
        const cleanContent = content.trim();
        const lowerContent = cleanContent.toLowerCase();

        // Check for thinking content patterns
        if (
          cleanContent.includes("<think>") &&
          cleanContent.includes("</think>")
        ) {
          return { type: "thinking", cleanContent };
        }

        // Check for reasoning_content patterns (API response format)
        if (
          lowerContent.includes("reasoning_content") ||
          lowerContent.includes("reasoning:") ||
          lowerContent.includes("let me think") ||
          lowerContent.includes("step by step") ||
          lowerContent.includes("my thoughts:") ||
          lowerContent.includes("thinking:") ||
          lowerContent.includes("i need to think") ||
          lowerContent.includes("let me analyze") ||
          lowerContent.includes("first, let me") ||
          lowerContent.includes("i should consider")
        ) {
          return { type: "thinking", cleanContent };
        }

        // Check for tool call patterns (more comprehensive)
        if (
          // Standard tool call patterns
          (cleanContent.includes("tool_calls") && cleanContent.includes("[")) ||
          (cleanContent.includes('"function"') &&
            cleanContent.includes('"name"') &&
            cleanContent.includes('"arguments"')) ||
          (cleanContent.startsWith("{") &&
            cleanContent.includes('"type": "function"')) ||
          // Additional tool call indicators
          cleanContent.includes('"tool_calls"') ||
          cleanContent.includes('"type": "tool_call"') ||
          cleanContent.includes('"tool_use"') ||
          // Function call patterns
          (cleanContent.includes('"function_call"') &&
            cleanContent.includes('"name"')) ||
          // Anthropic tool use format
          (cleanContent.includes('"tool_use"') &&
            cleanContent.includes('"name"'))
        ) {
          return { type: "tool_call", cleanContent };
        }

        return { type: "regular", cleanContent };
      };

      const { type, cleanContent } = detectContentType(state.output);

      // Check if content should be pushable (has tool calls or regular content, not just reasoning)
      const isPushableContent = (content: string): boolean => {
        const cleanContent = content.trim();

        // Check for tool call patterns
        if (
          (cleanContent.includes("tool_calls") && cleanContent.includes("[")) ||
          (cleanContent.includes('"function"') &&
            cleanContent.includes('"name"') &&
            cleanContent.includes('"arguments"')) ||
          (cleanContent.startsWith("{") &&
            cleanContent.includes('"type": "function"')) ||
          cleanContent.includes('"tool_calls"') ||
          cleanContent.includes('"type": "tool_call"') ||
          cleanContent.includes('"tool_use"') ||
          (cleanContent.includes('"function_call"') &&
            cleanContent.includes('"name"')) ||
          (cleanContent.includes('"tool_use"') &&
            cleanContent.includes('"name"'))
        ) {
          return true; // Has tool calls
        }

        // Check if it has regular content (not just reasoning)
        const hasRegularContent =
          cleanContent.length > 0 &&
          !cleanContent.toLowerCase().includes("reasoning_content") &&
          !cleanContent.includes("<think>") &&
          !cleanContent.toLowerCase().includes("reasoning:") &&
          !cleanContent.toLowerCase().includes("let me think") &&
          !cleanContent.toLowerCase().includes("step by step") &&
          !cleanContent.toLowerCase().includes("my thoughts:") &&
          !cleanContent.toLowerCase().includes("thinking:") &&
          !cleanContent.toLowerCase().includes("i need to think") &&
          !cleanContent.toLowerCase().includes("let me analyze") &&
          !cleanContent.toLowerCase().includes("first, let me") &&
          !cleanContent.toLowerCase().includes("i should consider");

        return hasRegularContent;
      };

      // Don't push if content is not pushable (only reasoning/thinking)
      if (!isPushableContent(state.output)) {
        return;
      }

      // Determine the final message type for pushing (not for display)
      const getFinalMessageType = (content: string): MessageType => {
        const cleanContent = content.trim();

        // Check for tool call patterns
        if (
          (cleanContent.includes("tool_calls") && cleanContent.includes("[")) ||
          (cleanContent.includes('"function"') &&
            cleanContent.includes('"name"') &&
            cleanContent.includes('"arguments"')) ||
          (cleanContent.startsWith("{") &&
            cleanContent.includes('"type": "function"')) ||
          cleanContent.includes('"tool_calls"') ||
          cleanContent.includes('"type": "tool_call"') ||
          cleanContent.includes('"tool_use"') ||
          (cleanContent.includes('"function_call"') &&
            cleanContent.includes('"name"')) ||
          (cleanContent.includes('"tool_use"') &&
            cleanContent.includes('"name"'))
        ) {
          return "tool_call";
        }

        return "regular";
      };

      // Add the output to messages with proper type
      const newMessage: Message = {
        id: generateId(),
        role: "assistant",
        content: cleanContent,
        type: getFinalMessageType(state.output),
        metadata: {
          addedFromOutput: true,
          timestamp: new Date().toISOString(),
          detectedType: type,
          originalOutputType: state.outputType,
        },
      };

      set((state) => ({ messages: [...state.messages, newMessage] }));
      // Auto-save current session
      get().saveCurrentSession();
    },
    setGenerating: (generating: boolean) => set({ isGenerating: generating }),
    updateGenerationMetrics: (
      metrics: Partial<AppState["generationMetrics"]>
    ) => {
      set((state) => ({
        generationMetrics: { ...state.generationMetrics, ...metrics },
      }));
    },

    updateVariableValues: (values: Record<string, string>) => {
      set((state) => ({
        variableValues: { ...state.variableValues, ...values },
      }));
      // Auto-save current session
      get().saveCurrentSession();
    },

    // Tool management functions
    addTool: (tool: Omit<Tool, "id">) => {
      const newTool: Tool = {
        ...tool,
        id: generateId(),
      };
      set((state) => ({ tools: [...state.tools, newTool] }));
      // Auto-save current session
      get().saveCurrentSession();
    },

    updateTool: (id: string, updates: Partial<Tool>) => {
      set((state) => ({
        tools: state.tools.map((tool) =>
          tool.id === id ? { ...tool, ...updates } : tool
        ),
      }));
      // Auto-save current session
      get().saveCurrentSession();
    },

    deleteTool: (id: string) => {
      set((state) => ({
        tools: state.tools.filter((tool) => tool.id !== id),
      }));
      // Auto-save current session
      get().saveCurrentSession();
    },

    toggleTool: (id: string) => {
      set((state) => ({
        tools: state.tools.map((tool) =>
          tool.id === id ? { ...tool, enabled: !tool.enabled } : tool
        ),
      }));
      // Auto-save current session
      get().saveCurrentSession();
    },

    saveToolSet: (name: string) => {
      const state = get();
      const toolSet: ToolSet = {
        id: generateId(),
        name,
        tools: state.tools,
        createdAt: new Date().toISOString(),
      };
      localStorageService.saveToolSet(toolSet);
      set((state) => ({ toolSets: [...state.toolSets, toolSet] }));
    },

    loadToolSet: (id: string) => {
      const state = get();
      const toolSet = state.toolSets.find((ts) => ts.id === id);
      if (toolSet) {
        set({ tools: toolSet.tools });
        // Auto-save current session after loading tool set
        get().saveCurrentSession();
      }
    },

    deleteToolSet: (id: string) => {
      localStorageService.deleteToolSet(id);
      set((state) => ({
        toolSets: state.toolSets.filter((ts) => ts.id !== id),
      }));
    },

    setMissionControlOpen: (open: boolean) =>
      set({ isMissionControlOpen: open }),
    setPanelWidths: (left: number, right: number) => {
      set({ leftPanelWidth: left, rightPanelWidth: right });
      localStorageService.updateSettings({
        leftPanelWidth: left,
        rightPanelWidth: right,
      });
    },
    setRightPanelCollapsed: (collapsed: boolean) => {
      set({ isRightPanelCollapsed: collapsed });
      localStorageService.updateSettings({ isRightPanelCollapsed: collapsed });
    },

    triggerGeneration: () => {
      // This will be implemented in MainPanel to trigger generation
      // Added here for keyboard shortcut support
    },

    getProcessedPrompt: () => {
      const state = get();
      return processTextWithVariables(state.systemPrompt, state.variableValues);
    },

    getProcessedMessages: () => {
      const state = get();
      return state.messages.map((msg) => ({
        ...msg,
        content: processTextWithVariables(msg.content, state.variableValues),
      }));
    },

    resetOutput: () => {
      set({
        output: "",
        generationMetrics: { tokensPerSecond: 0, totalTokens: 0 },
      });
    },

    // Session Management
    createSession: (name: string) => {
      const state = get();
      const session = localStorageService.createSession(name, {
        systemPrompt: state.systemPrompt,
        messages: state.messages,
        apiConfiguration: state.apiConfiguration,
        tools: state.tools,
        variableValues: state.variableValues,
      });

      set({ currentSessionId: session.id });
      localStorageService.setCurrentSession(session.id);
    },

    loadSession: (sessionId: string) => {
      const session = localStorageService.getSession(sessionId);
      if (session) {
        set({
          currentSessionId: sessionId,
          systemPrompt: session.systemPrompt,
          messages: session.messages,
          apiConfiguration: session.apiConfiguration,
          tools: session.tools,
          variableValues: session.variableValues,
        });
        localStorageService.setCurrentSession(sessionId);
      }
    },

    saveCurrentSession: () => {
      const state = get();
      if (state.currentSessionId) {
        localStorageService.updateSession(state.currentSessionId, {
          systemPrompt: state.systemPrompt,
          messages: state.messages,
          apiConfiguration: state.apiConfiguration,
          tools: state.tools,
          variableValues: state.variableValues,
        });
      }
    },

    deleteSession: (sessionId: string) => {
      localStorageService.deleteSession(sessionId);
      const state = get();
      if (state.currentSessionId === sessionId) {
        set({
          currentSessionId: null,
          systemPrompt: "",
          messages: [],
          apiConfiguration: defaultAPIConfiguration,
          tools: [],
          variableValues: {},
        });
      }
    },

    renameSession: (sessionId: string, newName: string) => {
      localStorageService.renameSession(sessionId, newName);
    },

    getAllSessions: () => {
      return localStorageService.getAllSessions();
    },

    setCurrentSessionId: (sessionId: string | null) => {
      set({ currentSessionId: sessionId });
      localStorageService.setCurrentSession(sessionId);
    },
  };
});
