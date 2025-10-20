
import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useAppStore } from "../store/useAppStore";
import { apiService } from "../services/apiService";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import {
  Play,
  Square,
  Copy,
  RotateCcw,
  Loader2,
  Zap,
  Hash,
  MessageSquarePlus,
  Brain,
  Wrench,
  MessageCircle,
} from "lucide-react";
import { countPromptTokens } from "../utils/tokenCounter";
import type { MessageType } from "../store/useAppStore";

interface OutputWrapperProps {
  children: React.ReactNode;
  outputType: MessageType;
}

function OutputWrapper({ children, outputType }: OutputWrapperProps) {
  const getOutputStyle = () => {
    switch (outputType) {
      case "thinking":
        return "bg-gray-500/5 border-gray-500/10";
      case "tool_call":
        return "bg-gray-600/5 border-gray-600/10";
      default:
        return "bg-transparent border-transparent";
    }
  };

  const getOutputIcon = () => {
    switch (outputType) {
      case "thinking":
        return <Brain className="h-3 w-3 text-gray-300" />;
      case "tool_call":
        return <Wrench className="h-3 w-3 text-gray-400" />;
      default:
        return <MessageCircle className="h-3 w-3 text-white" />;
    }
  };

  return (
    <div className={`rounded-lg border p-4 ${getOutputStyle()}`}>
      {outputType !== "regular" && (
        <div className="flex items-center gap-2 mb-3 text-xs text-muted-foreground">
          {getOutputIcon()}
          <span className="capitalize">
            {outputType === "tool_call" ? "Tool Call" : outputType} Content
          </span>
        </div>
      )}
      {children}
    </div>
  );
}

interface PushToMessageButtonProps {
  output: string;
  outputType: MessageType;
  onPush: () => void;
  disabled?: boolean;
}

function PushToMessageButton({
  output,
  outputType,
  onPush,
  disabled,
}: PushToMessageButtonProps) {
  if (!output.trim() || disabled) return null;

  // Check if content should be pushable (has tool calls or regular content)
  const isPushableContent = (content: string): boolean => {
    const cleanContent = content.trim();

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
      (cleanContent.includes('"tool_use"') && cleanContent.includes('"name"'))
    ) {
      return true; // Has tool calls
    }

    // Check if it has regular content (not just reasoning)
    const hasRegularContent =
      cleanContent.length > 0 &&
      !cleanContent.toLowerCase().includes("reasoning_content") &&
      !cleanContent.includes("<tool_call>") &&
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

  // Don't show push button if content is not pushable
  if (!isPushableContent(output)) {
    return null;
  }

  // Determine the actual content type for button text
  const detectContentTypeForPush = (content: string): MessageType => {
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
      (cleanContent.includes('"tool_use"') && cleanContent.includes('"name"'))
    ) {
      return "tool_call";
    }

    return "regular";
  };

  const actualType = detectContentTypeForPush(output);

  const getButtonText = () => {
    switch (actualType) {
      case "tool_call":
        return "Push as Tool Call";
      default:
        return "Push as Assistant";
    }
  };

  const getButtonIcon = () => {
    switch (actualType) {
      case "tool_call":
        return <Wrench className="h-3 w-3 mr-1" />;
      default:
        return <MessageSquarePlus className="h-3 w-3 mr-1" />;
    }
  };

  return (
    <Button variant="outline" size="sm" onClick={onPush} className="h-8">
      {getButtonIcon()}
      {getButtonText()}
    </Button>
  );
}

interface CodeProps {
  inline?: boolean;
  className?: string;
  children: React.ReactNode;
}

function CodeBlock({ inline, className, children, ...props }: CodeProps) {
  const match = /language-(\w+)/.exec(className || "");
  const language = match ? match[1] : "";

  if (!inline && language) {
    return (
      <SyntaxHighlighter
        style={vscDarkPlus}
        language={language}
        PreTag="div"
        className="rounded-md my-2"
        {...props}
      >
        {String(children).replace(/\n$/, "")}
      </SyntaxHighlighter>
    );
  }

  return (
    <code className="bg-muted px-1 py-0.5 rounded text-sm font-mono" {...props}>
      {children}
    </code>
  );
}

interface MetricsDisplayProps {
  tokensPerSecond: number;
  totalTokens: number;
  isGenerating: boolean;
}

function MetricsDisplay({
  tokensPerSecond,
  totalTokens,
  isGenerating,
}: MetricsDisplayProps) {
  return (
    <div className="flex items-center gap-4 text-xs text-muted-foreground">
      <div className="flex items-center gap-1">
        <Zap className="h-3 w-3" />
        <span>{tokensPerSecond.toFixed(1)} tok/s</span>
      </div>
      <div className="flex items-center gap-1">
        <Hash className="h-3 w-3" />
        <span>{totalTokens} tokens</span>
      </div>
      {isGenerating && (
        <div className="flex items-center gap-1 text-white">
          <Loader2 className="h-3 w-3 animate-spin" />
          <span>Generating...</span>
        </div>
      )}
    </div>
  );
}

export function MainPanel() {
  const {
    systemPrompt,
    messages,
    tools,
    apiConfiguration,
    output,
    outputType,
    isGenerating,
    generationMetrics,
    getProcessedPrompt,
    getProcessedMessages,
    setOutput,
    setGenerating,
    updateGenerationMetrics,
    resetOutput,
    pushOutputToMessages,
  } = useAppStore();

  const [error, setError] = useState<string | null>(null);
  const outputRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const [currentOutput, setCurrentOutput] = useState("");
  const [isPushing, setIsPushing] = useState(false);

  // Auto-scroll to bottom during generation
  useEffect(() => {
    if (autoScroll && outputRef.current && isGenerating) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output, autoScroll, isGenerating]);

  const handleGenerate = async () => {
    if (isGenerating) {
      apiService.stopGeneration();
      setGenerating(false);
      return;
    }

    if (!apiConfiguration.apiKey.trim()) {
      setError("Please configure your API key in the right panel");
      return;
    }

    setError(null);
    resetOutput();
    setGenerating(true);

    const processedPrompt = getProcessedPrompt();
    const processedMessages = getProcessedMessages();

    // Enhanced content type detection during streaming
    const detectStreamingContentType = (
      content: string,
      prompt: string,
      messages: any[]
    ): MessageType => {
      const cleanContent = content.trim().toLowerCase();
      const combinedInput = (
        prompt +
        " " +
        messages.map((m) => m.content).join(" ")
      ).toLowerCase();

      // Check for thinking content patterns in output
      if (
        cleanContent.includes("<tool_call>") ||
        cleanContent.includes("<tool_call>")
      ) {
        return "thinking";
      }

      // Check for reasoning patterns in output
      if (
        cleanContent.includes("reasoning:") ||
        cleanContent.includes("let me think") ||
        cleanContent.includes("step by step") ||
        cleanContent.includes("my thoughts:") ||
        cleanContent.includes("thinking:") ||
        cleanContent.includes("analysis:")
      ) {
        return "thinking";
      }

      // Check for tool call patterns (specific)
      if (
        (cleanContent.includes("tool_calls") && cleanContent.includes("[")) ||
        (cleanContent.includes('"function"') &&
          cleanContent.includes('"name"') &&
          cleanContent.includes('"arguments"')) ||
        (cleanContent.startsWith("{") &&
          cleanContent.includes('"type": "function"'))
      ) {
        return "tool_call";
      }

      // Check if input suggests thinking/reasoning
      if (
        combinedInput.includes("think") ||
        combinedInput.includes("reasoning") ||
        combinedInput.includes("step by step")
      ) {
        return "thinking";
      }

      // Check if input suggests tool usage
      if (
        combinedInput.includes("tool") ||
        combinedInput.includes("function") ||
        combinedInput.includes("call")
      ) {
        return "tool_call";
      }

      return "regular";
    };

    try {
      await apiService.streamCompletion(
        processedPrompt,
        processedMessages,
        apiConfiguration,
        tools,
        {
          onStart: () => {
            setCurrentOutput("");
            setOutput("", "regular");
            updateGenerationMetrics({ tokensPerSecond: 0, totalTokens: 0 });
          },
          onToken: (token) => {
            setCurrentOutput((prev) => {
              const newOutput = prev + token;
              // Dynamically detect content type as we stream
              const detectedType = detectStreamingContentType(
                newOutput,
                processedPrompt,
                processedMessages
              );
              setOutput(newOutput, detectedType);
              return newOutput;
            });
          },
          onComplete: (fullResponse) => {
            // Final content type detection
            const finalType = detectStreamingContentType(
              fullResponse,
              processedPrompt,
              processedMessages
            );
            setOutput(fullResponse, finalType);
            setCurrentOutput(fullResponse);
            setGenerating(false);
          },
          onError: (error) => {
            setError(error.message);
            setGenerating(false);
          },
          onMetrics: (metrics) => {
            updateGenerationMetrics(metrics);
          },
        }
      );
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Unknown error occurred"
      );
      setGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (output) {
      try {
        await navigator.clipboard.writeText(output);
        // Could add a toast notification here
      } catch (error) {
        console.error("Failed to copy:", error);
      }
    }
  };

  const handleRetry = () => {
    if (!isGenerating) {
      handleGenerate();
    }
  };

  const handlePush = () => {
    setIsPushing(true);
    // Wait for animation to complete before pushing
    setTimeout(() => {
      pushOutputToMessages();
      setIsPushing(false);
      resetOutput();
    }, 500);
  };

  const processedPrompt = getProcessedPrompt();
  const processedMessages = getProcessedMessages();
  const promptTokens = countPromptTokens(processedPrompt, processedMessages);

  const hasValidConfig =
    apiConfiguration.apiKey.trim() &&
    apiConfiguration.baseURL.trim() &&
    apiConfiguration.modelName.trim();

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Output</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-muted-foreground">
                Prompt: {promptTokens} tokens
              </span>
              {(processedPrompt || processedMessages.length > 0) &&
                hasValidConfig && (
                  <span className="text-xs text-white">• Ready</span>
                )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <MetricsDisplay
              tokensPerSecond={generationMetrics.tokensPerSecond}
              totalTokens={generationMetrics.totalTokens}
              isGenerating={isGenerating}
            />

            {output && !isGenerating && (
              <>
                <PushToMessageButton
                  output={output}
                  outputType={outputType}
                  onPush={handlePush}
                  disabled={isGenerating || isPushing}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  className="h-8"
                >
                  <Copy className="h-3 w-3 mr-1" />
                  Copy
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRetry}
                  className="h-8"
                >
                  <RotateCcw className="h-3 w-3 mr-1" />
                  Retry
                </Button>
              </>
            )}

            <Button
              onClick={handleGenerate}
              disabled={
                !hasValidConfig ||
                (!processedPrompt && processedMessages.length === 0)
              }
              className="h-8"
              data-generate-button
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
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-hidden relative">
        {error && (
          <div className="absolute top-0 left-0 right-0 z-10">
            <div className="m-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <div className="text-sm text-destructive font-medium mb-1">
                Error
              </div>
              <div className="text-sm text-destructive/80">{error}</div>
            </div>
          </div>
        )}

        <ScrollArea className="h-full">
          <div className="p-4">
            {!output && !isGenerating && !error && (
              <div className="h-full flex items-center justify-center">
                <div className="text-center space-y-3">
                  <Play className="h-12 w-12 mx-auto text-muted-foreground/50" />
                  <div>
                    <p className="text-muted-foreground font-medium">
                      Ready to Generate
                    </p>
                    <p className="text-sm text-muted-foreground/70">
                      Configure your prompt and click Generate to start
                    </p>
                  </div>

                  {!hasValidConfig && (
                    <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        Missing configuration:
                      </p>
                      <ul className="text-xs text-muted-foreground mt-1 space-y-1">
                        {!apiConfiguration.apiKey.trim() && <li>• API Key</li>}
                        {!apiConfiguration.baseURL.trim() && (
                          <li>• Base URL</li>
                        )}
                        {!apiConfiguration.modelName.trim() && (
                          <li>• Model Name</li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {(output || isGenerating) && (
              <Card className={`border-0 shadow-none bg-transparent ${isPushing ? 'push-to-messages-animation' : ''}`}>
                <CardContent className="p-0">
                  <OutputWrapper outputType={outputType}>
                    <div className="prose prose-invert prose-sm max-w-none">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeHighlight]}
                        components={{
                          code: CodeBlock,
                        }}
                      >
                        {output + (isGenerating ? "▋" : "")}
                      </ReactMarkdown>
                    </div>
                  </OutputWrapper>
                </CardContent>
              </Card>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
