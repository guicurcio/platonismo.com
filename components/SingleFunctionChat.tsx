"use client";

import { useState, useRef, FormEvent, ChangeEvent } from "react";
import { motion } from "framer-motion";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import MarkdownRenderer from "./MarkdownRenderer";

function Spinner() {
  return (
    <div className="w-4 h-4 border-2 border-t-transparent border-primary rounded-full animate-spin mr-2" />
  );
}

export interface AdvancedSettings {
  model: "gpt-3.5-turbo" | "gpt-3.5-turbo-16k" | "gpt-4" | "gpt-4-32k";
  systemMessage: string;
  temperature: number;
  topP: number;
  presencePenalty: number;
  frequencyPenalty: number;
}

interface SingleQuestionChatProps {
  title?: string;
  onTitleChange?: (newTitle: string) => void;
  onFinalAnswer?: (finalAnswer: string, question: string) => void;
  initialContext?: string;
  onDelete?: () => void;

  advancedSettings: AdvancedSettings;
}

export default function SingleQuestionChat({
  title = "Untitled",
  onTitleChange,
  onFinalAnswer,
  initialContext = "",
  onDelete,
  advancedSettings,
}: SingleQuestionChatProps) {
  const [localTitle, setLocalTitle] = useState(title);

  const {
    model,
    systemMessage,
    temperature,
    topP,
    presencePenalty,
    frequencyPenalty,
  } = advancedSettings;

  const [questionInput, setQuestionInput] = useState("");
  const [finalPrompt, setFinalPrompt] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamedText, setStreamedText] = useState("");
  const [error, setError] = useState("");
  const [lastQuestion, setLastQuestion] = useState("");
  const [hasAsked, setHasAsked] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);

  function handleTitleInput(e: ChangeEvent<HTMLInputElement>) {
    setLocalTitle(e.target.value);
    onTitleChange?.(e.target.value);
  }

  async function handleSubmit(e?: FormEvent) {
    e?.preventDefault();
    setError("");

    if (!questionInput.trim()) return;

    const combinedPrompt = initialContext
      ? initialContext + "\n" + questionInput
      : questionInput;

    setFinalPrompt(combinedPrompt);
    setLastQuestion(questionInput);
    setHasAsked(true);
    setIsStreaming(true);
    setStreamedText("");

    try {
      const controller = new AbortController();
      abortControllerRef.current = controller;

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: combinedPrompt,
          model,
          temperature,
          top_p: topP,
          presence_penalty: presencePenalty,
          frequency_penalty: frequencyPenalty,
          system_message: systemMessage,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errText = await response.text();
        setIsStreaming(false);
        setError(`OpenAI API returned an error: ${errText}`);
        return;
      }

      const reader = response.body?.getReader();
      if (!reader) {
        setIsStreaming(false);
        setError("No readable stream returned by the server");
        return;
      }

      const decoder = new TextDecoder();
      let done = false;
      let accumulated = "";

      while (!done) {
        let chunk;
        try {
          chunk = await reader.read();
        } catch (err: any) {
          if (err.name === "AbortError") {
            console.warn("Stream reading was aborted.");
          } else {
            console.error("Stream read error:", err);
          }
          setIsStreaming(false);
          return;
        }

        const { value, done: doneReading } = chunk;
        done = doneReading;
        if (value) {
          const chunkValue = decoder.decode(value);
          accumulated += chunkValue;
          setStreamedText((prev) => prev + chunkValue);
        }
      }

      setIsStreaming(false);
      onFinalAnswer?.(accumulated, questionInput);
    } catch (err: any) {
      if (err.name === "AbortError") {
        console.log("Fetch aborted by user.");
      } else {
        setError(String(err));
      }
      setIsStreaming(false);
    }
  }

  function handleStop() {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
  }

  function reset() {
    setHasAsked(false);
    setLastQuestion("");
    setQuestionInput("");
    setStreamedText("");
    setFinalPrompt("");
    setError("");
  }

  return (
    <div className="w-full bg-card border border-border text-foreground rounded-lg overflow-hidden">
      {/* --- Top Bar --- */}
      <div className="flex items-center justify-between px-4 py-2 border-b bg-secondary">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-muted" />
          <input
            type="text"
            className="bg-transparent border-none text-sm outline-none w-28"
            value={localTitle}
            onChange={handleTitleInput}
          />
        </div>

        <div className="flex items-center gap-2">
          {onDelete && (
            <button
              onClick={onDelete}
              className="text-muted-foreground hover:text-foreground"
              title="Delete Node"
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
          )}
        </div>
      </div>

      {/* --- Q/A Container --- */}
      <div className="p-4">
        {!hasAsked && (
          <motion.div
            key="question-form"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col"
          >
            <Textarea
              placeholder="Ask your single question..."
              value={questionInput}
              onChange={(e) => setQuestionInput(e.target.value)}
              className="w-full h-[100px] bg-transparent placeholder-muted-foreground border border-border 
                         focus:outline-none focus:ring-0 mb-4 p-2 rounded"
              autoFocus
            />

            {/* Ask Button */}
            <div className="flex items-center justify-end border-t border-border pt-2 mt-2">
              <Button
                className="bg-primary text-primary-foreground text-xs"
                onClick={handleSubmit}
              >
                Ask
              </Button>
            </div>
          </motion.div>
        )}

        {hasAsked && (
          <motion.div
            key="qa-display"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
          >
            <h3 className="font-bold text-sm mb-1">Question</h3>
            <p className="text-sm mb-2">{lastQuestion}</p>
            <p className="text-xs mb-4 text-muted-foreground">Model: {model}</p>

            <h3 className="font-bold text-sm mb-1">Answer</h3>
            {isStreaming && (
              <div className="flex items-center gap-2 text-sm">
                <Spinner />
                Generating...
              </div>
            )}
            <div className="mt-2">
              <MarkdownRenderer content={streamedText} />
            </div>
            {error && <p className="text-destructive text-sm mt-2">{error}</p>}

            <div className="mt-4 flex items-center justify-end gap-2">
              {isStreaming ? (
                <Button
                  className="bg-destructive text-destructive-foreground text-xs"
                  onClick={handleStop}
                >
                  Stop Generation
                </Button>
              ) : (
                <Button
                  className="bg-primary text-primary-foreground text-xs"
                  onClick={reset}
                >
                  Ask Another Question
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
