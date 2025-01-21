"use client";

import React from "react";
import {
  Highlight,
  themes,
  type Language,
  type RenderProps,
} from "prism-react-renderer";

interface CodeBlockProps {
  code: string;
  language: Language;
}

export default function CodeBlock({ code, language }: CodeBlockProps) {
  return (
    <Highlight
      code={code}
      language={language}
      theme={themes.dracula} 
      // or themes.nightOwl, etc.
    >
      {(props: RenderProps) => {
        const { className, style, tokens, getLineProps, getTokenProps } = props;
        return (
          <pre className={`${className} p-4 rounded-md overflow-auto`} style={style}>
            {tokens.map((line, i) => (
              <div key={i} {...getLineProps({ line, key: i })}>
                {line.map((token, key) => (
                  <span key={key} {...getTokenProps({ token, key })} />
                ))}
              </div>
            ))}
          </pre>
        );
      }}
    </Highlight>
  );
}
