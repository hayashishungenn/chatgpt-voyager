# Folder Manager

This folder contains the implementation of the conversation folder management feature for ChatGPT Voyager.

## Overview

The folder manager allows users to:

- Create and manage folders and subfolders (2-level nesting)
- Drag and drop conversations from the sidebar into folders
- Move conversations between folders
- Navigate to conversations without page reload (SPA-style)
- Optionally map agent icons (legacy Gemini config, kept for compatibility)

## File Structure

- **`types.ts`** - TypeScript type definitions for folders, conversations, and drag data
- **`manager.ts`** - Core folder management logic and UI rendering
- **`gemConfig.ts`** - Legacy Gemini gem icon mapping (optional/compat)
- **`index.ts`** - Entry point that initializes the folder manager
- **`README.md`** - This file

## Legacy Gemini Gem Support (Optional)

`gemConfig.ts` is retained for compatibility with Gemini-specific UI metadata. It is **not required** for ChatGPT usage, but can be reused if you target additional Gemini-based surfaces.
