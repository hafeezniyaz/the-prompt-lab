import {
  APIConfiguration,
  Template,
  ConfigPreset,
  Tool,
  ToolSet,
  Message,
} from "../store/useAppStore";

export interface PlaygroundSession {
  id: string;
  name: string;
  systemPrompt: string;
  messages: Message[];
  apiConfiguration: APIConfiguration;
  tools: Tool[];
  variableValues: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

export interface AppData {
  sessions: PlaygroundSession[];
  templates: Template[];
  configPresets: ConfigPreset[];
  toolSets: ToolSet[];
  currentSessionId: string | null;
  settings: {
    leftPanelWidth: number;
    rightPanelWidth: number;
    isRightPanelCollapsed: boolean;
  };
}

const STORAGE_KEY = "prompt-lab-data";
const CURRENT_SESSION_KEY = "prompt-lab-current-session";

class LocalStorageService {
  private getStorageData(): AppData {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) {
        return this.getDefaultData();
      }
      return JSON.parse(data);
    } catch (error) {
      console.error("Error reading from localStorage:", error);
      return this.getDefaultData();
    }
  }

  private setStorageData(data: AppData): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error("Error writing to localStorage:", error);
    }
  }

  private getDefaultData(): AppData {
    return {
      sessions: [],
      templates: [],
      configPresets: [],
      toolSets: [],
      currentSessionId: null,
      settings: {
        leftPanelWidth: 25,
        rightPanelWidth: 25,
        isRightPanelCollapsed: false,
      },
    };
  }

  // Session Management
  createSession(
    name: string,
    sessionData: Partial<PlaygroundSession>
  ): PlaygroundSession {
    const newSession: PlaygroundSession = {
      id: this.generateId(),
      name,
      systemPrompt: sessionData.systemPrompt || "",
      messages: sessionData.messages || [],
      apiConfiguration:
        sessionData.apiConfiguration || this.getDefaultAPIConfig(),
      tools: sessionData.tools || [],
      variableValues: sessionData.variableValues || {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const data = this.getStorageData();
    data.sessions.push(newSession);
    this.setStorageData(data);

    return newSession;
  }

  updateSession(sessionId: string, updates: Partial<PlaygroundSession>): void {
    const data = this.getStorageData();
    const sessionIndex = data.sessions.findIndex((s) => s.id === sessionId);

    if (sessionIndex !== -1) {
      data.sessions[sessionIndex] = {
        ...data.sessions[sessionIndex],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      this.setStorageData(data);
    }
  }

  renameSession(sessionId: string, newName: string): void {
    const data = this.getStorageData();
    const sessionIndex = data.sessions.findIndex((s) => s.id === sessionId);

    if (sessionIndex !== -1) {
      data.sessions[sessionIndex] = {
        ...data.sessions[sessionIndex],
        name: newName,
        updatedAt: new Date().toISOString(),
      };
      this.setStorageData(data);
    }
  }

  deleteSession(sessionId: string): void {
    const data = this.getStorageData();
    const sessionIndex = data.sessions.findIndex((s) => s.id === sessionId);

    if (sessionIndex === -1) {
      return; // Session not found
    }

    data.sessions.splice(sessionIndex, 1);

    // If we deleted the current session, find a new one to make active
    if (data.currentSessionId === sessionId) {
      // Sort remaining sessions by most recently updated
      const sortedSessions = [...data.sessions].sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );

      // Set the new current session to the most recent one, or null if none are left
      const newCurrentSessionId =
        sortedSessions.length > 0 ? sortedSessions[0].id : null;
      data.currentSessionId = newCurrentSessionId;

      if (newCurrentSessionId) {
        localStorage.setItem(CURRENT_SESSION_KEY, newCurrentSessionId);
      } else {
        localStorage.removeItem(CURRENT_SESSION_KEY);
      }
    }

    this.setStorageData(data);
  }

  getSession(sessionId: string): PlaygroundSession | null {
    const data = this.getStorageData();
    return data.sessions.find((s) => s.id === sessionId) || null;
  }

  getAllSessions(): PlaygroundSession[] {
    const data = this.getStorageData();
    return data.sessions.sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  setCurrentSession(sessionId: string | null): void {
    const data = this.getStorageData();
    data.currentSessionId = sessionId;
    this.setStorageData(data);

    if (sessionId) {
      localStorage.setItem(CURRENT_SESSION_KEY, sessionId);
    } else {
      localStorage.removeItem(CURRENT_SESSION_KEY);
    }
  }

  getCurrentSessionId(): string | null {
    return localStorage.getItem(CURRENT_SESSION_KEY);
  }

  // Templates Management
  saveTemplate(template: Template): void {
    const data = this.getStorageData();
    const existingIndex = data.templates.findIndex((t) => t.id === template.id);

    if (existingIndex !== -1) {
      data.templates[existingIndex] = template;
    } else {
      data.templates.push(template);
    }

    this.setStorageData(data);
  }

  deleteTemplate(templateId: string): void {
    const data = this.getStorageData();
    data.templates = data.templates.filter((t) => t.id !== templateId);
    this.setStorageData(data);
  }

  getAllTemplates(): Template[] {
    const data = this.getStorageData();
    return data.templates;
  }

  // Config Presets Management
  saveConfigPreset(preset: ConfigPreset): void {
    const data = this.getStorageData();
    const existingIndex = data.configPresets.findIndex(
      (p) => p.id === preset.id
    );

    if (existingIndex !== -1) {
      data.configPresets[existingIndex] = preset;
    } else {
      data.configPresets.push(preset);
    }

    this.setStorageData(data);
  }

  deleteConfigPreset(presetId: string): void {
    const data = this.getStorageData();
    data.configPresets = data.configPresets.filter((p) => p.id !== presetId);
    this.setStorageData(data);
  }

  getAllConfigPresets(): ConfigPreset[] {
    const data = this.getStorageData();
    return data.configPresets;
  }

  // Tool Sets Management
  saveToolSet(toolSet: ToolSet): void {
    const data = this.getStorageData();
    const existingIndex = data.toolSets.findIndex((ts) => ts.id === toolSet.id);

    if (existingIndex !== -1) {
      data.toolSets[existingIndex] = toolSet;
    } else {
      data.toolSets.push(toolSet);
    }

    this.setStorageData(data);
  }

  deleteToolSet(toolSetId: string): void {
    const data = this.getStorageData();
    data.toolSets = data.toolSets.filter((ts) => ts.id !== toolSetId);
    this.setStorageData(data);
  }

  getAllToolSets(): ToolSet[] {
    const data = this.getStorageData();
    return data.toolSets;
  }

  // Settings Management
  updateSettings(settings: Partial<AppData["settings"]>): void {
    const data = this.getStorageData();
    data.settings = { ...data.settings, ...settings };
    this.setStorageData(data);
  }

  getSettings(): AppData["settings"] {
    const data = this.getStorageData();
    return data.settings;
  }

  // Utility Methods
  private generateId(): string {
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    );
  }

  private getDefaultAPIConfig(): APIConfiguration {
    return {
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
  }

  // Export/Import functionality
  exportData(): string {
    const data = this.getStorageData();
    return JSON.stringify(data, null, 2);
  }

  importData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData) as AppData;
      this.setStorageData(data);
      return true;
    } catch (error) {
      console.error("Error importing data:", error);
      return false;
    }
  }

  // Clear all data
  clearAllData(): void {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(CURRENT_SESSION_KEY);
  }
}

export const localStorageService = new LocalStorageService();
