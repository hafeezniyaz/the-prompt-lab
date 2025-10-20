# The Prompt Lab - Replit Project

## Overview
The Prompt Lab is a sophisticated React-based web application for prompt engineering and testing with OpenAI-compatible APIs. Built for developers and AI researchers who need a powerful, flexible tool for iterating on and testing prompts.

**Current Status**: Project configured and running on Replit (October 19, 2025)

## Project Architecture

### Tech Stack
- **Frontend Framework**: React 18.3 with TypeScript
- **Build Tool**: Vite 6.0
- **Styling**: Tailwind CSS with custom dark theme
- **UI Components**: shadcn/ui with Radix UI primitives
- **State Management**: Zustand
- **Additional Libraries**: 
  - React DnD Kit (drag-and-drop)
  - React Markdown (output rendering)
  - js-tiktoken (token counting)
  - react-resizable-panels (layout)

### Project Structure
```
src/
├── components/           # React components
│   ├── ui/              # shadcn/ui components
│   ├── LeftPanel.tsx    # Prompt construction interface
│   ├── RightPanel.tsx   # Configuration and variables
│   ├── MainPanel.tsx    # Output display
│   └── MissionControlDialog.tsx # Advanced settings
├── store/               # State management (Zustand)
├── services/            # API services
├── utils/               # Utility functions
└── App.tsx             # Main application component
```

## Replit Configuration

### Workflow
- **Name**: Server
- **Command**: `npm run dev`
- **Port**: 5000
- **Output**: Web view

### Server Configuration
The Vite development server is configured to:
- Listen on `0.0.0.0:5000` (required for Replit proxy)
- Use strict port enforcement
- Support Hot Module Replacement (HMR)

### Environment
- **Package Manager**: npm (using package-lock.json)
- **Node.js**: 18+
- **Build System**: Vite with TypeScript

## Key Features
- Three-panel layout for prompt construction, configuration, and output
- Real-time streaming responses with live metrics
- Dynamic message management with drag-and-drop
- Variable detection (`{{variable}}` placeholders)
- Template system for saving and loading prompts
- Configuration presets for API settings
- Support for OpenAI-compatible APIs (OpenAI, Anthropic, local models, custom endpoints)
- Token counting with live metrics
- Markdown rendering with syntax highlighting
- Dark theme interface

## Development

### Running the Application
The application runs automatically via the configured workflow. To restart:
1. Use the Replit workflow controls
2. Or run: `npm run dev`

### Building for Production
```bash
npm run build        # Standard build
npm run build:prod   # Production build (without source identifier plugin)
```

### Other Commands
```bash
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

## Recent Changes

### October 19, 2025 - Feature Enhancements
- **Quick Message Input**: Added fixed message input component at bottom of LeftPanel
  - Role selector (user/assistant/system/tool)
  - Quick keyboard shortcuts (Enter to add, Ctrl+Enter to add & generate)
  - Eliminates need to click "Add Message" button repeatedly
- **Variables Panel**: Created third collapsible panel for variable management
  - Auto-detects {{variable_name}} patterns in system prompts and messages
  - Manual variable creation with validation
  - Key-value pair editing and deletion
  - Empty variable values replaced with empty strings
  - Collapsible with toggle button
- **Three-Panel Layout**: Updated to support Prompt | Output | Variables panels
  - Proper sizing (25% + 50% + 25% = 100%)
  - Smooth panel resizing
  - Variables panel can be hidden for more output space
- **Push Animation**: Added subtle slide-left animation (0.5s) when pushing output to messages
- **Sticky Messages Header**: Messages section header and Add Message button stay fixed while scrolling
- **UI Improvements**: Enhanced user experience with better scrolling and layout

### October 19, 2025 - Initial Replit Setup
- Configured Vite to work with Replit's proxy system:
  - Server listening on 0.0.0.0:5000
  - Added allowedHosts for .repl.co and .replit.dev domains
  - Set HMR clientPort to 443 for Replit's proxy
- Set up Server workflow for automatic startup
- Updated .gitignore with comprehensive Node.js patterns
- Configured deployment (autoscale) with build and preview commands
- Created project documentation (replit.md)
- Verified successful deployment and server startup with browser console connection

## User Preferences
None specified yet.

## Notes
- The application uses local storage for templates and configurations
- No backend required - fully client-side application
- API keys are stored in browser local storage (users should provide their own)
- Compatible with any OpenAI-standard API endpoint
