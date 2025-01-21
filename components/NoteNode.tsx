// @ts-nocheck
"use client";

import React, { memo, useState, ChangeEvent } from "react";
import { Handle, Position, useReactFlow } from "reactflow";

interface NoteNodeProps {
  id: string;
  data: {
    label?: string;
    updateNodeData?: (id: string, updates: Record<string, unknown>) => void;
  };
}

function NoteNode({ id, data }: NoteNodeProps) {
  const { setNodes } = useReactFlow();

  // Local title state (fallback to "Untitled" if no label is provided)
  const [localTitle, setLocalTitle] = useState(data.label || "Untitled");
  // Local text content of the note
  const [noteText, setNoteText] = useState("");

  // Delete this node from the flow
  const handleDeleteNode = () => {
    setNodes((prevNodes) => prevNodes.filter((node) => node.id !== id));
  };

  // Update the note's title in local state and in node data
  const handleTitleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setLocalTitle(newTitle);
    data.updateNodeData?.(id, { label: newTitle });
  };

  // Update the note's text content in local state
  const handleTextChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setNoteText(newText);
    data.updateNodeData?.(id, { text: newText });
  };

  return (
    <div className="rounded-lg shadow-md w-[320px] overflow-hidden bg-card border text-foreground">
      {/* ReactFlow Handles for connections */}
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />

      {/* --- Top Bar --- */}
      <div className="flex items-center justify-between px-4 py-2 border-b bg-secondary">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-muted" />
          <input
            type="text"
            className="bg-transparent border-none text-sm outline-none w-28"
            value={localTitle}
            onChange={handleTitleChange}
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDeleteNode}
            className="text-muted-foreground hover:text-foreground"
            title="Delete Note Node"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* --- Note Content Area --- */}
      <div className="p-4">
        <textarea
          className="w-full h-[100px] bg-transparent placeholder-muted-foreground border border-border 
                     focus:outline-none focus:ring-0 p-2 rounded resize-none"
          placeholder="Write your note here..."
          value={noteText}
          onChange={handleTextChange}
        />
      </div>
    </div>
  );
}

export default memo(NoteNode);
