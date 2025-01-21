// @ts-nocheck
"use client";

import { memo, useState, ChangeEvent } from "react";
import { Handle, Position, useReactFlow } from "reactflow";
import SingleQuestionChat from "./SingleQuestionChat";

function ChatNodeSkeleton() {
  return (
    <div className="rounded-lg shadow-md w-[320px] overflow-hidden bg-card border text-foreground p-4 animate-pulse">
      <div className="h-4 bg-muted w-3/4 mb-4" />
      <div className="h-3 bg-muted w-1/2 mb-2" />
      <div className="h-3 bg-muted w-2/3" />
    </div>
  );
}

function ChatNode({ id, data }) {
  const { setNodes } = useReactFlow();
  const [title, setTitle] = useState(data.title || "Untitled");

  if (data.isLoading) {
    return <ChatNodeSkeleton />;
  }

  const handleDeleteNode = () => {
    setNodes((prevNodes) => prevNodes.filter((node) => node.id !== id));
  };

  const handleTitleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    data.updateNodeData?.(id, { title: newTitle });
  };

  const handleFinalAnswer = (answer: string, userQuestion: string) => {
    data.finalAnswer = answer;
    data.question = userQuestion;
  };

  return (
    <div className="rounded-lg shadow-md w-[320px] overflow-hidden bg-card border text-foreground">
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />

      <SingleQuestionChat
        title={title}
        onTitleChange={handleTitleChange}
        onDelete={handleDeleteNode}
        onFinalAnswer={handleFinalAnswer}
        initialContext={data?.initialContext || ""}
      />
    </div>
  );
}

export default memo(ChatNode);
