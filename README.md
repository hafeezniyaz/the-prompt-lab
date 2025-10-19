# The Prompt Lab

A sophisticated React-based web application for prompt engineering and testing with OpenAI-compatible APIs. Built for developers and AI researchers who need a powerful, flexible tool for iterating on and testing prompts.

## Features

### Core Functionality
- **Three-Panel Layout**: Intuitive workspace with dedicated panels for prompt construction, configuration, and output
- **Real-time Streaming**: Token-by-token streaming responses with live metrics
- **Dynamic Message Management**: Drag-and-drop reordering and role switching for conversation messages
- **Variable Detection**: Automatic detection of `{{variable}}` placeholders with dynamic input generation
- **Template System**: Save and load prompt templates for reuse
- **Configuration Presets**: Store and manage API configuration sets

### Advanced Features
- **Mission Control**: Comprehensive configuration interface with preset models and providers
- **Token Counting**: Live token counting with approximate calculations
- **Export/Import**: Backup and restore your templates and configurations
- **Markdown Rendering**: Rich output display with syntax highlighting
- **Error Handling**: Robust error management with informative feedback
- **Dark Theme**: Professional dark interface optimized for extended use

### API Compatibility
- **OpenAI Compatible**: Works with any OpenAI-standard API endpoint
- **Multiple Providers**: Built-in support for OpenAI, Anthropic, local models, and custom endpoints
- **Streaming Support**: Real-time response streaming with cancellation
- **Custom Parameters**: Add any custom API parameters as needed

## Tech Stack

### Frontend Framework
- **React 18.3** with TypeScript for type safety
- **Vite 6.0** for fast development and optimized builds
- **Tailwind CSS** for styling with custom dark theme

### UI Components
- **shadcn/ui** for consistent, accessible components
- **Radix UI** primitives for robust interactions
- **Lucide React** for beautiful, consistent icons

### State Management & Utilities
- **Zustand** for lightweight, efficient state management
- **React DnD Kit** for drag-and-drop functionality
- **React Markdown** with syntax highlighting for output rendering
- **js-tiktoken** for token counting

### Key Dependencies
- **react-resizable-panels** for adjustable layout
- **react-syntax-highlighter** for code highlighting
- **remark-gfm** for GitHub Flavored Markdown support

## Getting Started

### Prerequisites
- Node.js 18+ 
- pnpm (recommended) or npm

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd prompt-lab

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

### Building for Production

```bash
# Build the application
pnpm build

# Preview the build
pnpm preview
```

## Usage Guide

### 1. Configuration Setup
1. Click the "Mission Control" button in the right panel
2. Configure your API endpoint:
   - **Model Name**: e.g., `gpt-4`, `claude-3-sonnet-20240229`
   - **Base URL**: e.g., `https://api.openai.com/v1`
   - **API Key**: Your API key for the service
3. Adjust parameters like temperature, max tokens, etc.
4. Save as a preset for future use

### 2. Prompt Construction
1. **System Prompt**: Enter your system instructions in the left panel
2. **Messages**: Add conversation messages with different roles:
   - **User**: Human input
   - **Assistant**: AI responses
   - **System**: System instructions
   - **Tool**: Tool/function call results
3. **Variables**: Use `{{variable_name}}` syntax for dynamic content
4. **Reordering**: Drag messages to reorder them

### 3. Variable Management
- Variables are automatically detected when you use `{{variable}}` syntax
- Input fields appear in the right panel for each detected variable
- Fill in values before generating to replace variables in your prompts

### 4. Generation
1. Click "Generate" to start streaming
2. Watch real-time token generation with metrics
3. Use "Stop" to cancel generation mid-stream
4. "Copy" to copy the output
5. "Retry" to regenerate with the same prompt

### 5. Template Management
- Save frequently used prompts as templates
- Load templates to quickly restore prompt configurations
- Export/import for backup or sharing

## File Structure

```
src/
├── components/           # React components
│   ├── ui/              # shadcn/ui components
│   ├── LeftPanel.tsx    # Prompt construction interface
│   ├── RightPanel.tsx   # Configuration and variables
│   ├── MainPanel.tsx    # Output display
│   └── MissionControlDialog.tsx # Advanced settings
├── store/               # State management
│   └── useAppStore.ts   # Zustand store
├── services/            # API services
│   └── apiService.ts    # OpenAI API integration
├── utils/               # Utility functions
│   └── tokenCounter.ts  # Token counting logic
└── App.tsx             # Main application component
```

## API Integration

The application supports any OpenAI-compatible API endpoint. Key features:

### Streaming Support
```javascript
// Example API call structure
const response = await fetch(`${baseURL}/chat/completions`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`,
  },
  body: JSON.stringify({
    model: modelName,
    messages: processedMessages,
    temperature,
    max_tokens: maxTokens,
    stream: true,
    // ... other parameters
  })
})
```

### Supported Providers
- **OpenAI**: GPT-4, GPT-4 Turbo, GPT-3.5 Turbo
- **Anthropic**: Claude 3 models (via compatible proxy)
- **Local Models**: Ollama, LM Studio, etc.
- **Custom**: Any OpenAI-compatible endpoint

## Configuration Options

### Core Parameters
- **Temperature**: Controls randomness (0-2)
- **Max Tokens**: Maximum response length
- **Top P**: Nucleus sampling parameter
- **Frequency Penalty**: Reduces repetition based on frequency
- **Presence Penalty**: Encourages new topics

### Advanced Options
- **Custom Parameters**: Add any provider-specific parameters
- **System Prompts**: Configure system-level instructions
- **Message Roles**: Support for user, assistant, system, and tool roles

## Development

### Available Scripts
- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm preview` - Preview production build
- `pnpm lint` - Run ESLint

### Project Structure Philosophy
- **Component-Based**: Modular, reusable components
- **Type-Safe**: Full TypeScript coverage
- **State Management**: Centralized Zustand store
- **Responsive Design**: Mobile-friendly interface

## Deployment

The application builds to static files and can be deployed to any static hosting service:

- **Vercel**: Zero-config deployment
- **Netlify**: Drag-and-drop deployment
- **GitHub Pages**: Free hosting for public repos
- **AWS S3**: Scalable cloud hosting

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

This project is open source and available under the [MIT License](LICENSE).

## Support

For questions, issues, or feature requests:
1. Check existing GitHub issues
2. Create a new issue with detailed information
3. Include reproduction steps for bugs

## Roadmap

### Planned Features
- [ ] Conversation branching and tree view
- [ ] Advanced prompt templates with logic
- [ ] Batch processing for multiple prompts
- [ ] Integration with vector databases
- [ ] Prompt optimization suggestions
- [ ] Team collaboration features
- [ ] Plugin system for custom integrations

### Technical Improvements
- [ ] Code splitting for better performance
- [ ] PWA support for offline use
- [ ] Advanced caching strategies
- [ ] Keyboard shortcuts
- [ ] Accessibility improvements

---

**The Prompt Lab** - Precision tooling for prompt engineering excellence.