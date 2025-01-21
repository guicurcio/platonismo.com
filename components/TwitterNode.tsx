"use client";

import { memo, useEffect, useRef } from "react";
import { Handle, NodeProps, Position } from "reactflow";

/**
 * Renders an embedded Tweet from the node's data.tweetId.
 * We rely on "https://platform.twitter.com/widgets.js" being loaded globally.
 */
function TwitterNode({ data }: NodeProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Wait until the script is loaded and "twttr" is available.
    // Then embed the tweet by ID.
    if (
      typeof window !== "undefined" &&
      (window as any).twttr &&
      data.tweetId &&
      containerRef.current
    ) {
      (window as any).twttr.widgets
        .createTweet(data.tweetId, containerRef.current, {
          // Additional options (theme, conversation, etc.) can go here
          conversation: "none", 
          align: "left",
        })
        .catch((err: any) => console.error("Failed to load Tweet embed:", err));
    }
  }, [data.tweetId]);

  return (
    <div className="bg-zinc-800 border border-zinc-700 rounded shadow-md w-[320px] text-white">
      {/* Node handles (optional) */}
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />

      {/* Header */}
      <div className="bg-zinc-900 p-2 font-bold text-sm">Twitter Node</div>

      {/* Body: The Tweet embed container */}
      <div className="p-2" ref={containerRef}>
        {/* The Twitter embed is inserted here by the script. */}
        {/* If you like, you can show a small "Loading..." text or spinner. */}
      </div>
    </div>
  );
}

export default memo(TwitterNode);
