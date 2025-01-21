"use client";

import React, { memo, useState, useCallback } from "react";
import { Rnd } from "react-rnd";
import { Handle, Position, useReactFlow } from "reactflow";

import SingleQuestionChat from "./SingleQuestionChat";

function ResizableChatNode({ id, data }) {
  const { setNodes } = useReactFlow();

  // If you want the size to persist in the node’s data, read from data.dimensions:
  const initialWidth = data.dimensions?.width || 320;
  const initialHeight = data.dimensions?.height || 300;

  const [size, setSize] = useState({ width: initialWidth, height: initialHeight });

  // We'll also track the node’s title locally, as before:
  const nodeTitle = data.title || "Untitled";

  const handleDeleteNode = () => {
    setNodes((prevNodes) => prevNodes.filter((node) => node.id !== id));
  };

  // Called whenever user stops resizing:
  const handleResizeStop = useCallback(
    (e, direction, ref, delta, position) => {
      const newWidth = parseInt(ref.style.width, 10);
      const newHeight = parseInt(ref.style.height, 10);

      setSize({ width: newWidth, height: newHeight });

      // If you want to persist the new size in the node’s data (so it “sticks” on reload):
      data.updateNodeData?.(id, {
        dimensions: { width: newWidth, height: newHeight },
      });
    },
    [id, data, setSize]
  );

  return (
    <div>
      {/* React Flow handles the node’s x/y, but we handle the node's width/height with Rnd */}
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />

      <Rnd
        disableDragging // so the node still drags via React Flow, not Rnd
        size={size}
        onResizeStop={handleResizeStop}
        style={{
          // some minimal styling
          border: "1px solid #555",
          background: "rgba(0,0,0,0.5)",
          borderRadius: "4px",
        }}
      >
        <div style={{ width: "100%", height: "100%", overflow: "auto" }}>
          {/* Inside here is your existing Chat UI */}
          <SingleQuestionChat
            title={nodeTitle}
            onDelete={handleDeleteNode}
            onFinalAnswer={(answer, question) => {
              // store in data so edges can pass Q/A forward
              data.finalAnswer = answer;
              data.question = question;
            }}
            initialContext={data?.initialContext || ""}
          />
        </div>
      </Rnd>
    </div>
  );
}

export default memo(ResizableChatNode);
