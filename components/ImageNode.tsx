"use client";

import { memo } from "react";
import { Handle, NodeProps, Position } from "reactflow";

/**
 * Renders an image from the node's data.url if valid.
 * Optionally, you can add fallback logic for broken URLs or error handling.
 */
function ImageNode({ data }: NodeProps) {
  const { url } = data;

  return (
    <div className="bg-zinc-800 border border-zinc-700 rounded shadow-md w-[240px] text-white">
      {/* React Flow handles */}
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />

      {/* Node Header */}
      <div className="bg-zinc-900 p-2 font-bold">Image Node</div>

      {/* Body: the actual image */}
      <div className="p-2 flex items-center justify-center">
        {url ? (
          <img
            src={url}
            alt="Pasted"
            className="max-w-full max-h-40 object-contain"
            onError={(e) => {
              // For a broken link, you could show a default placeholder
              (e.target as HTMLImageElement).src = "/placeholder.png";
            }}
          />
        ) : (
          <p className="text-sm text-red-400">No URL provided.</p>
        )}
      </div>
    </div>
  );
}

export default memo(ImageNode);
