import { APIConfiguration, Message, Tool } from '../store/useAppStore'

export interface StreamCallbacks {
  onStart?: () => void
  onToken?: (token: string) => void
  onComplete?: (fullResponse: string) => void
  onError?: (error: Error) => void
  onMetrics?: (metrics: { tokensPerSecond: number; totalTokens: number }) => void
}

export class OpenAIAPIService {
  private abortController: AbortController | null = null
  
  async streamCompletion(
    systemPrompt: string,
    messages: Message[],
    config: APIConfiguration,
    tools: Tool[],
    callbacks: StreamCallbacks
  ): Promise<void> {
    // Create new abort controller for this request
    this.abortController = new AbortController()
    
    try {
      callbacks.onStart?.()
      
      // Prepare the request payload
      const requestMessages: any[] = []
      
      if (systemPrompt.trim()) {
        requestMessages.push({
          role: 'system',
          content: systemPrompt
        })
      }
      
      // Add conversation messages
      requestMessages.push(...messages.map(msg => ({
        role: msg.role,
        content: msg.content
      })))
      
      const requestBody: any = {
        model: config.modelName,
        messages: requestMessages,
        temperature: config.temperature,
        max_tokens: config.maxTokens,
        top_p: config.topP,
        frequency_penalty: config.frequencyPenalty,
        presence_penalty: config.presencePenalty,
        stream: true,
        ...config.customParameters
      }
      
      // Add tools if any are enabled
      const enabledTools = tools.filter(tool => tool.enabled)
      if (enabledTools.length > 0) {
        requestBody.tools = enabledTools.map(tool => ({
          type: 'function',
          function: {
            name: tool.name,
            description: tool.description,
            parameters: tool.parameters
          }
        }))
        requestBody.tool_choice = 'auto'
      }
      
      // Make the API request
      const response = await fetch(`${config.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`,
        },
        body: JSON.stringify(requestBody),
        signal: this.abortController.signal
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: { message: 'Unknown error' } }))
        throw new Error(errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`)
      }
      
      if (!response.body) {
        throw new Error('No response body available for streaming')
      }
      
      // Process the streaming response
      await this.processStream(response.body, callbacks)
      
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        // Request was cancelled, don't call onError
        return
      }
      callbacks.onError?.(error instanceof Error ? error : new Error('Unknown error'))
    }
  }
  
  private async processStream(body: ReadableStream<Uint8Array>, callbacks: StreamCallbacks): Promise<void> {
    const reader = body.getReader()
    const decoder = new TextDecoder()
    let fullResponse = ''
    let buffer = ''
    
    const startTime = Date.now()
    let tokenCount = 0
    
    try {
      while (true) {
        const { done, value } = await reader.read()
        
        if (done) break
        
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        
        // Keep the last incomplete line in the buffer
        buffer = lines.pop() || ''
        
        for (const line of lines) {
          const trimmedLine = line.trim()
          
          if (trimmedLine === '') continue
          if (trimmedLine === 'data: [DONE]') {
            callbacks.onComplete?.(fullResponse)
            return
          }
          
          if (trimmedLine.startsWith('data: ')) {
            const jsonStr = trimmedLine.slice(6)
            
            try {
              const data = JSON.parse(jsonStr)
              
              // Handle regular content
              if (data.choices?.[0]?.delta?.content) {
                const content = data.choices[0].delta.content
                fullResponse += content
                tokenCount++
                
                callbacks.onToken?.(content)
              }
              
              // Handle tool calls
              if (data.choices?.[0]?.delta?.tool_calls) {
                const toolCalls = data.choices[0].delta.tool_calls
                const toolCallText = JSON.stringify(toolCalls, null, 2)
                fullResponse += toolCallText
                tokenCount += toolCallText.length / 4 // Rough token estimate
                
                callbacks.onToken?.(toolCallText)
                
                // Update metrics periodically
                if (tokenCount % 10 === 0) {
                  const elapsed = (Date.now() - startTime) / 1000
                  const tokensPerSecond = tokenCount / elapsed
                  callbacks.onMetrics?.({
                    tokensPerSecond: Math.round(tokensPerSecond * 100) / 100,
                    totalTokens: tokenCount
                  })
                }
              }
            } catch (parseError) {
              // Skip malformed JSON lines
              console.warn('Failed to parse streaming response line:', jsonStr)
            }
          }
        }
      }
      
      // Final metrics update
      const elapsed = (Date.now() - startTime) / 1000
      const tokensPerSecond = elapsed > 0 ? tokenCount / elapsed : 0
      callbacks.onMetrics?.({
        tokensPerSecond: Math.round(tokensPerSecond * 100) / 100,
        totalTokens: tokenCount
      })
      
      callbacks.onComplete?.(fullResponse)
      
    } finally {
      reader.releaseLock()
    }
  }
  
  stopGeneration(): void {
    if (this.abortController) {
      this.abortController.abort()
      this.abortController = null
    }
  }
  
  isGenerating(): boolean {
    return this.abortController !== null
  }
}

export const apiService = new OpenAIAPIService()