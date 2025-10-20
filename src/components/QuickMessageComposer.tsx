
import { Textarea } from './ui/textarea';
import { useAppStore, type MessageRole } from '../store/useAppStore';
import React, { useState, useRef } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { User, Bot, Settings, Wrench } from 'lucide-react';
export function QuickMessageComposer() {
  const { addMessage } = useAppStore();
  const [role, setRole] = useState<MessageRole>('user');
  const [content, setContent] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleAddMessage = () => {
    if (content.trim()) {
      addMessage(role, content.trim());
      setContent('');
      setRole('user');
      textareaRef.current?.focus();
    }
  };

  const handleAddAndGenerate = () => {
    if (content.trim()) {
      addMessage(role, content.trim());
      setContent('');
      setRole('user');
      
      setTimeout(() => {
        const generateButton = document.querySelector('[data-generate-button]') as HTMLButtonElement;
        if (generateButton && !generateButton.disabled) {
          generateButton.click();
        }
      }, 100);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      handleAddMessage();
    }
    
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleAddAndGenerate();
    }
  };

  const getRoleIcon = (role: MessageRole) => {
    switch (role) {
      case 'user':
        return <User className="h-4 w-4" />;
      case 'assistant':
        return <Bot className="h-4 w-4" />;
      case 'system':
        return <Settings className="h-4 w-4" />;
      case 'tool':
        return <Wrench className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const getRoleColor = (role: MessageRole) => {
    switch (role) {
      case 'user':
        return 'text-blue-400';
      case 'assistant':
        return 'text-green-400';
      case 'system':
        return 'text-purple-400';
      case 'tool':
        return 'text-orange-400';
      default:
        return 'text-blue-400';
    }
  };

  return (
    <div className="border-t border-border bg-background/95 backdrop-blur-sm">
      <div className="px-4 py-3 max-w-[1800px] mx-auto">
        <div className="flex items-start gap-3">
          {/* Composite Message Input */}
          <div className="flex-1 flex items-start bg-background border border-input rounded-md focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background">
            {/* Role Selector */}
            <div className="flex-shrink-0 pt-2 pl-3">
              <Select value={role} onValueChange={(value) => setRole(value as MessageRole)}>
                <SelectTrigger className="w-auto h-auto p-0 border-none bg-transparent shadow-none focus:ring-0 focus:ring-offset-0">
                  <SelectValue>
                    <div className="flex items-center gap-2">
                      <span className={getRoleColor(role)}>
                        {getRoleIcon(role)}
                      </span>
                      <span className="capitalize text-sm font-medium">{role}</span>
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-blue-400" />
                      <span>User</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="assistant">
                    <div className="flex items-center gap-2">
                      <Bot className="h-4 w-4 text-green-400" />
                      <span>Assistant</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="system">
                    <div className="flex items-center gap-2">
                      <Settings className="h-4 w-4 text-purple-400" />
                      <span>System</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="tool">
                    <div className="flex items-center gap-2">
                      <Wrench className="h-4 w-4 text-orange-400" />
                      <span>Tool</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Message Input */}
            <Textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              className="flex-1 min-h-[60px] max-h-[200px] resize-none border-none shadow-none focus-visible:ring-0 bg-transparent"
            />
          </div>
        </div>

        {/* Helper Text */}
        <div className="mt-2 text-xs text-muted-foreground flex items-center gap-4 flex-wrap">
          <span className="font-medium">💡 Quick tips:</span>
          <span><kbd className="bg-muted text-muted-foreground p-1 rounded">Enter</kbd> to add</span>
          <span><kbd className="bg-muted text-muted-foreground p-1 rounded">Ctrl+Enter</kbd> to add & generate</span>
          <span><kbd className="bg-muted text-muted-foreground p-1 rounded">Shift+Enter</kbd> for new line</span>
        </div>
      </div>
    </div>
  );
}
