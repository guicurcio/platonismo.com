// @ts-nocheck
"use client";

import React, { memo, useState } from "react";
import { Handle, Position, useReactFlow } from "reactflow";
import SingleFunctionChat from "./SingleFunctionChat";

function FunctionChatNode({ id, data }) {
  const { setNodes } = useReactFlow();
  const [title, setTitle] = useState(data.title || "Function Node");

  const handleDeleteNode = () => {
    setNodes((prevNodes) => prevNodes.filter((node) => node.id !== id));
  };

  const handleTitleChange = (newTitle: string) => {
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

      <SingleFunctionChat
        title={title}
        onTitleChange={handleTitleChange}
        onDelete={handleDeleteNode}
        onFinalAnswer={handleFinalAnswer}
        initialContext={data?.initialContext || ""}
        advancedSettings={data.advancedSettings || {
          model: "gpt-3.5-turbo",
          systemMessage: "You are a helpful assistant.",
          temperature: 0.7,
          topP: 1,
          presencePenalty: 0,
          frequencyPenalty: 0,
        }}
      />
    </div>
  );
}

export default memo(FunctionChatNode);
