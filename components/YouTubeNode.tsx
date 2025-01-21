"use client";

import React, { memo, useEffect, useState } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { Youtube } from "lucide-react";

/**
 * Safely extracts the video ID from a YouTube link
 * (supports youtu.be/VID or youtube.com/watch?v=VID),
 * and gracefully handles links missing the protocol.
 */
function getYoutubeVideoId(url: string): string | null {
  let finalUrl = url.trim();
  
  // If there's no protocol, prepend https://
  if (!/^https?:\/\//i.test(finalUrl)) {
    finalUrl = "https://" + finalUrl;
  }

  try {
    const parsed = new URL(finalUrl);

    // youtu.be short links
    if (parsed.hostname === "youtu.be") {
      return parsed.pathname.slice(1);
    }

    // full youtube.com links (handles youtube.com, www.youtube.com, m.youtube.com, etc.)
    if (parsed.hostname.includes("youtube.com")) {
      return parsed.searchParams.get("v");
    }

    // If not recognized as a valid YouTube link
    return null;
  } catch {
    // new URL() threw an error, likely invalid input
    return null;
  }
}

function YouTubeNode({ data }: NodeProps) {
  const [videoId, setVideoId] = useState<string | null>(null);

  useEffect(() => {
    if (data.url) {
      const id = getYoutubeVideoId(data.url);
      setVideoId(id);
    }
  }, [data.url]);

  return (
    <div className="bg-zinc-800 border border-zinc-700 rounded shadow-md w-[240px] text-white">
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />

      {/* Node Header */}
      <div className="bg-zinc-900 p-2 font-bold flex items-center gap-2">
        <Youtube className="h-5 w-5 text-red-600" />
        <span>YouTube Node</span>
      </div>

      {/* Body */}
      {videoId ? (
        <div className="p-2 flex flex-col items-center gap-2">
          <img
            src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`}
            alt="Thumbnail"
            className="w-full object-cover aspect-video rounded"
          />
          <button
            className="text-sm text-blue-400 underline hover:text-blue-300"
            onClick={() =>
              window.open(`https://www.youtube.com/watch?v=${videoId}`, "_blank")
            }
          >
            Watch Video
          </button>
        </div>
      ) : (
        <div className="p-2 text-sm text-red-400">
          <p>Invalid or no URL provided.</p>
        </div>
      )}
    </div>
  );
}

export default memo(YouTubeNode);
