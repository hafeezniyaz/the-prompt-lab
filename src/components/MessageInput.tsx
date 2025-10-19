import React, { useState } from "react";
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
import { Send } from "lucide-react";
import type { MessageRole } from "../store/useAppStore";

export function MessageInput() {
  const { addMessage, triggerGeneration } = useAppStore();
  const [messageContent, setMessageContent] = useState("");
  const [selectedRole, setSelectedRole] = useState<MessageRole>("user");

  const handleSend = () => {
    if (messageContent.trim()) {
      addMessage(selectedRole, messageContent.trim());
      setMessageContent("");
      // Trigger generation after adding the message
      setTimeout(() => {
        triggerGeneration();
      }, 100);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4 z-50">
      <div className="max-w-6xl mx-auto flex gap-3 items-end">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <Select
              value={selectedRole}
              onValueChange={(value: MessageRole) => setSelectedRole(value)}
            >
              <SelectTrigger className="w-32 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="assistant">Assistant</SelectItem>
                <SelectItem value="system">System</SelectItem>
                <SelectItem value="tool">Tool</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-xs text-muted-foreground">
              Ctrl+Enter to send
            </span>
          </div>
          <Textarea
            value={messageContent}
            onChange={(e) => setMessageContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message here... (Ctrl+Enter to send)"
            className="min-h-[60px] max-h-[120px] resize-none"
            rows={2}
          />
        </div>
        <Button
          onClick={handleSend}
          disabled={!messageContent.trim()}
          className="h-10 px-4"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
