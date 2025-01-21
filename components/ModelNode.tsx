// file: ModelNode.tsx
import React, { memo } from "react";
import { Handle, Position, NodeProps } from "reactflow";

// Define the shape of the data prop
interface ModelNodeData {
  label: string;
  selectedModel: string;
  setSelectedModel?: (model: string) => void;
}

// Use NodeProps<ModelNodeData> so 'data' is strongly typed
function ModelNode({ data }: NodeProps<ModelNodeData>) {
  const { label, selectedModel, setSelectedModel } = data;

  return (
    <div className="p-2 w-40 bg-white border border-gray-300 rounded shadow">
      <strong>{label}</strong>
      <div className="mt-2">
        <select
          className="w-full text-sm"
          value={selectedModel}
          onChange={(e) => setSelectedModel?.(e.target.value)}
        >
          <option value="gpt-3.5-turbo">gpt-3.5-turbo</option>
          <option value="gpt-3.5-turbo-16k">gpt-3.5-turbo-16k</option>
          <option value="gpt-4">gpt-4</option>
          <option value="gpt-4-32k">gpt-4-32k</option>
        </select>
      </div>

      {/* Only an output handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: "#555" }}
      />
    </div>
  );
}

export default memo(ModelNode);
