// @ts-nocheck
"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { CodeComponent } from "react-markdown/lib/ast-to-react";

import CodeBlock from "@/components/CodeBlock";

const MarkdownCode: CodeComponent = ({ inline, className, children }) => {
  const match = /language-(\w+)/.exec(className || "");
  const language = match?.[1] || "bash";

  if (inline) {
    return <code className={className}>{children}</code>;
  }

  return (
    <CodeBlock
      code={String(children).replace(/\n$/, "")}
      language={language}
    />
  );
};

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        code: MarkdownCode,
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
