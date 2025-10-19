import React, { useState } from "react";
import { useAppStore } from "../store/useAppStore";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import {
  Plus,
  Play,
  Trash2,
  Edit2,
  Save,
  X,
  Clock,
  MessageSquare,
  Settings,
  Wrench,
} from "lucide-react";
import { PlaygroundSession } from "../services/localStorageService";

interface SessionItemProps {
  session: PlaygroundSession;
  isActive: boolean;
  onLoad: (sessionId: string) => void;
  onDelete: (sessionId: string) => void;
  onRename: (sessionId: string, newName: string) => void;
}

function SessionItem({
  session,
  isActive,
  onLoad,
  onDelete,
  onRename,
}: SessionItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(session.name);

  const handleSave = () => {
    if (editName.trim() && editName !== session.name) {
      onRename(session.id, editName.trim());
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditName(session.name);
    setIsEditing(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return "Just now";
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 168) {
      // 7 days
      return `${Math.floor(diffInHours / 24)}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getSessionStats = () => {
    const messageCount = session.messages.length;
    const hasSystemPrompt = session.systemPrompt.trim().length > 0;
    const toolCount = session.tools.length;
    const hasConfig = session.apiConfiguration.apiKey.trim().length > 0;

    return { messageCount, hasSystemPrompt, toolCount, hasConfig };
  };

  const stats = getSessionStats();

  return (
    <Card
      className={`cursor-pointer transition-all hover:border-accent ${
        isActive ? "border-primary bg-primary/5" : "border-border"
      }`}
    >
      <CardContent className="p-3">
        <div className="flex items-start justify-between mb-2">
          {isEditing ? (
            <div className="flex-1 flex items-center gap-1">
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="h-6 text-sm"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSave();
                  if (e.key === "Escape") handleCancel();
                }}
                autoFocus
              />
              <Button
                size="sm"
                variant="ghost"
                onClick={handleSave}
                className="h-6 w-6 p-0"
              >
                <Save className="h-3 w-3" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleCancel}
                className="h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ) : (
            <div className="flex-1">
              <h4
                className="text-sm font-medium truncate"
                onClick={() => onLoad(session.id)}
              >
                {session.name}
              </h4>
              <div className="flex items-center gap-1 mt-1">
                <Clock className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  {formatDate(session.updatedAt)}
                </span>
              </div>
            </div>
          )}

          {!isEditing && (
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsEditing(true)}
                className="h-6 w-6 p-0"
                title="Rename session"
              >
                <Edit2 className="h-3 w-3" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onDelete(session.id)}
                className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                title="Delete session"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-1">
          {stats.messageCount > 0 && (
            <Badge variant="secondary" className="text-xs h-5">
              <MessageSquare className="h-2 w-2 mr-1" />
              {stats.messageCount}
            </Badge>
          )}
          {stats.hasSystemPrompt && (
            <Badge variant="secondary" className="text-xs h-5">
              <Settings className="h-2 w-2 mr-1" />
              System
            </Badge>
          )}
          {stats.toolCount > 0 && (
            <Badge variant="secondary" className="text-xs h-5">
              <Wrench className="h-2 w-2 mr-1" />
              {stats.toolCount}
            </Badge>
          )}
          {stats.hasConfig && (
            <Badge variant="outline" className="text-xs h-5">
              API
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function SessionsPanel() {
  const {
    currentSessionId,
    createSession,
    loadSession,
    deleteSession,
    renameSession,
    getAllSessions,
    saveCurrentSession,
  } = useAppStore();

  const [newSessionName, setNewSessionName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const sessions = getAllSessions();

  const handleCreateSession = () => {
    if (newSessionName.trim()) {
      // Save current session before creating new one
      saveCurrentSession();
      createSession(newSessionName.trim());
      setNewSessionName("");
      setIsCreating(false);
    }
  };

  const handleLoadSession = (sessionId: string) => {
    // Save current session before loading new one
    saveCurrentSession();
    loadSession(sessionId);
  };

  const handleDeleteSession = (sessionId: string) => {
    if (
      confirm(
        "Are you sure you want to delete this session? This action cannot be undone."
      )
    ) {
      deleteSession(sessionId);
    }
  };

  const handleRenameSession = (sessionId: string, newName: string) => {
    renameSession(sessionId, newName);
  };

  return (
    <div className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Sessions</CardTitle>
          <Button
            size="sm"
            onClick={() => setIsCreating(!isCreating)}
            className="h-7"
          >
            <Plus className="h-3 w-3 mr-1" />
            New
          </Button>
        </div>

        {isCreating && (
          <div className="flex gap-2 mt-2">
            <Input
              value={newSessionName}
              onChange={(e) => setNewSessionName(e.target.value)}
              placeholder="Session name"
              className="h-8 text-sm"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreateSession();
                if (e.key === "Escape") {
                  setIsCreating(false);
                  setNewSessionName("");
                }
              }}
              autoFocus
            />
            <Button size="sm" onClick={handleCreateSession} className="h-8">
              <Save className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setIsCreating(false);
                setNewSessionName("");
              }}
              className="h-8"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        )}
      </CardHeader>

      <ScrollArea className="flex-1 px-4">
        <div className="space-y-2 pb-4">
          {sessions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Play className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No sessions yet</p>
              <p className="text-xs">
                Create your first session to get started
              </p>
            </div>
          ) : (
            sessions.map((session) => (
              <div key={session.id} className="group">
                <SessionItem
                  session={session}
                  isActive={currentSessionId === session.id}
                  onLoad={handleLoadSession}
                  onDelete={handleDeleteSession}
                  onRename={handleRenameSession}
                />
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      {currentSessionId && (
        <div className="p-4 border-t border-border">
          <div className="text-xs text-muted-foreground text-center">
            Auto-saved to current session
          </div>
        </div>
      )}
    </div>
  );
}
