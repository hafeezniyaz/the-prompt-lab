import { getEncoding } from 'js-tiktoken'

let encoding: any = null

// Initialize encoding lazily
const getTokenEncoding = () => {
  if (!encoding) {
    try {
      encoding = getEncoding('cl100k_base') // GPT-4 encoding
    } catch (error) {
      console.warn('Failed to initialize tiktoken encoding, using fallback')
      return null
    }
  }
  return encoding
}

// Fallback token estimation (roughly 4 characters per token)
const estimateTokensFallback = (text: string): number => {
  return Math.ceil(text.length / 4)
}

export const countTokens = (text: string): number => {
  if (!text) return 0
  
  const enc = getTokenEncoding()
  if (!enc) {
    return estimateTokensFallback(text)
  }
  
  try {
    return enc.encode(text).length
  } catch (error) {
    console.warn('Token counting failed, using fallback:', error)
    return estimateTokensFallback(text)
  }
}

export const countPromptTokens = (systemPrompt: string, messages: { role: string; content: string }[]): number => {
  let totalTokens = 0
  
  // Count system prompt tokens
  if (systemPrompt.trim()) {
    totalTokens += countTokens(systemPrompt)
    totalTokens += 3 // Overhead for system message
  }
  
  // Count message tokens
  messages.forEach(message => {
    totalTokens += countTokens(message.content)
    totalTokens += 3 // Overhead per message (role, content, etc.)
  })
  
  // Add overhead for the completion
  totalTokens += 3
  
  return totalTokens
}

export const formatTokenCount = (count: number): string => {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k`
  }
  return count.toString()
}