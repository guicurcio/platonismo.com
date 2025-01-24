



https://github.com/user-attachments/assets/80b64a41-1f4c-4e2f-9554-8dce7af06c5f




# platonismo.com – Non-Linear LLM Chat Application with Node Connections

A **non-linear**, node-based LLM chat application where you can create, organize, and connect multiple chat nodes on an infinite canvas. Each node can represent a separate chat session or specialized context, and they can be linked to form a network of ideas or collaborative discussions.

> **Note**: This repository is open-source under the [MIT License](#license). We encourage you to explore, fork, and contribute!

## Table of Contents

- [platonismo.com – Non-Linear LLM Chat Application with Node Connections](#platonismocom--non-linear-llm-chat-application-with-node-connections)
  - [Table of Contents](#table-of-contents)
  - [Overview](#overview)
  - [Key Features](#key-features)
  - [Tech Stack](#tech-stack)
  - [Project Structure](#project-structure)
  - [How It Works](#how-it-works)
    - [Infinite Canvas](#infinite-canvas)
    - [Connecting Chat Nodes](#connecting-chat-nodes)
    - [Advanced AI Features](#advanced-ai-features)
  - [Usage](#usage)
    - [Creating Nodes](#creating-nodes)
    - [Linking Chats](#linking-chats)
    - [Navigating and Zooming](#navigating-and-zooming)
  - [Contributing](#contributing)
  - [License](#license)

---

## Overview

`platonismo.com` provides a **non-linear LLM chat** experience on an **infinite canvas**. Rather than a single chat thread, you can create multiple chat nodes, each with its own context and conversation. You can then connect these nodes with edges, enabling structured brainstorming, reference linking, or multi-step workflows across different chat sessions.

For example, one node might focus on summarizing a text, another on brainstorming code ideas, and a third on generating design suggestions. By linking them, you create a web of knowledge where each node can inform or reference others.

---

## Key Features

- **Multiple Chat Nodes**: Create separate LLM chat instances, each with its own context or prompt.
- **Non-Linear Chat Flow**: Connect related nodes to share context, gather references, and build complex conversation graphs.
- **Infinite Canvas**: Pan, zoom, and arrange nodes freely without space constraints.
- **Drag-and-Drop**: Move nodes, connect them, and embed external media like YouTube videos or notes.
- **Lightweight and Minimal UI**: A clean interface that emphasizes your content, with a dark background for visual contrast.

---

## Tech Stack

- **[Next.js 14](https://nextjs.org/)** – React-based framework for routing, server-side rendering, and more.
- **[TypeScript](https://www.typescriptlang.org/)** – Type-safe JavaScript.
- **[React Flow](https://reactflow.dev/)** – Node/edge-based canvas library for flow diagrams.
- **[OpenAI API](https://platform.openai.com/docs/introduction)** – GPT-3.5/4 integration for chat-based nodes.
- **[Tailwind CSS](https://tailwindcss.com/)** – Utility-first CSS framework for rapid UI development.

---

## Project Structure

```plaintext
.
├─ app/
│  ├─ layout.tsx                # Defines the root layout
│  ├─ page.tsx                  # Main page with React Flow
│  ├─ api/
│  │  ├─ chat/route.ts          # Streams GPT responses
│  │  └─ chat-function/route.ts # Demonstration of function calling
├─ components/
│  ├─ ChatNode.tsx              # Node for a single LLM chat
│  ├─ NoteNode.tsx              # Simple text note node
│  ├─ ...
│  └─ providers/ClientProviders.tsx  # Theme, ReactFlow, etc.
├─ public/
│  └─ favicon.ico
├─ README.md
├─ package.json
├─ tsconfig.json
```

## How It Works

### Infinite Canvas

React Flow powers the canvas, letting you drag, drop, and connect node elements. Each node can represent a chat, note, video embed, or other content block.

### Connecting Chat Nodes

Edges: Connect from one node’s handle to another, passing context or referencing content.
Model Node (optional): Can pass a specific GPT model to connected Chat Nodes.

### Advanced AI Features

- Streaming GPT Responses: The chat node uses a streaming endpoint to output tokens in real time.
- Function Calling: The chat-function route demonstrates how GPT can decide to call a function (e.g., to fetch weather data), then incorporate the results back into the conversation.

## Usage

### Creating Nodes

Right-Click on Canvas: Opens a context menu to create a Chat Node or a Note Node.
Paste YouTube Links: Automatically embeds a YouTube node.

### Linking Chats

Drag from one node’s handle to another to create a link.
Model Node → Chat Node: Inherits model selection from the Model Node.

### Navigating and Zooming

Pan: Drag the canvas background.
Zoom: Scroll or pinch. You can also use toolbar buttons or keyboard shortcuts (Ctrl +, Ctrl -).
Home Button: Resets the viewport to center.

## Contributing

1. Fork the project & create a new branch.
2. Commit your changes with clear messages.
3. Open a Pull Request.
4. We welcome ideas, bug fixes, and new node types!

## License

Licensed under the MIT License. Feel free to use and adapt this project for your own non-linear LLM chat or infinite canvas applications. Let us know if you build something cool with it!
