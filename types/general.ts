/**
 * types.ts
 * Place all your type definitions, enums, and interfaces in one file (or folder).
 * This keeps code organized and easy to maintain. 
 */

import { Node, Edge } from 'reactflow';
import { ChatCompletionResponseMessage } from 'openai';

/**
 * Enum representing the type of a Flux node. 
 * This helps identify what role the node plays in your flow. 
 */
export enum FluxNodeType {
  System = 'System',
  User = 'User',
  GPT = 'GPT',
  TweakedGPT = 'GPT (tweaked)',
}

/**
 * Data structure for a Flux node. 
 * - label: The display label (or “prompt”) for the node
 * - fluxNodeType: Role of the node (system, user, GPT, etc.)
 * - text: Body content or instructions
 * - streamId: Optional identifier if the node is tied to a streaming response
 * - hasCustomLabel: If the user manually edited the label 
 */
export type FluxNodeData = {
  label: string;
  fluxNodeType: FluxNodeType;
  text: string;
  streamId?: string;
  hasCustomlabel?: boolean;
};

/**
 * User settings for the application. 
 * - defaultPreamble: A default system prompt or preamble
 * - autoZoom: Whether the flow automatically zooms to fit the viewport
 * - model: Model name for GPT or other LLM 
 * - temp: Temperature for the LLM (controls randomness)
 * - n: Number of completions
 */
export type Settings = {
  defaultPreamble: string;
  autoZoom: boolean;
  model: string;
  temp: number;
  n: number;
};

/**
 * Enum for React Flow node types. 
 * Use this if you have custom node components in React Flow. 
 */
export enum ReactFlowNodeTypes {
  LabelUpdater = 'LabelUpdater',
}

/**
 * Interface representing a single stream "choice" from OpenAI’s streaming response.
 * The `delta` property is used instead of a full `message` in partial responses.
 */
export interface CreateChatCompletionStreamResponseChoicesInner {
  index?: number;
  delta?: ChatCompletionResponseMessage;
  finish_reason?: string;
}

/**
 * Captures a snapshot in time of the flow for undo/redo functionality or version tracking.
 */
export type HistoryItem = {
  nodes: Node[];
  edges: Edge[];
  selectedNodeId: string | null;
  lastSelectedNodeId: string | null;
};
