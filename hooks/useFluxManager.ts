/**
 * useFluxManager.ts
 * A custom React Hook that manages nodes, edges, history, and 
 * app settings in a production-ready manner. 
 */

import { FluxNodeData } from '@/types/general';
import { HistoryItem, Settings } from '@/utils/types';
import { useState, useCallback } from 'react';
import { Node, Edge } from 'reactflow';



/**
 * Defines the return shape of the `useFluxManager` hook.
 */
interface UseFluxManagerReturn {
  nodes: Node<FluxNodeData>[];
  edges: Edge[];
  settings: Settings;
  history: HistoryItem[];
  addNode: (newNode: Node<FluxNodeData>) => void;
  addEdge: (newEdge: Edge) => void;
  setSettings: (updater: Partial<Settings>) => void;
  undo: () => void;
  redo: () => void;
}

/**
 * Production-ready hook that manages:
 * - State for nodes and edges in a React Flow diagram
 * - Application-wide settings (e.g., model name, temperature)
 * - A minimal history stack for undo/redo functionality
 * 
 * @param initialNodes   Array of initial node data
 * @param initialEdges   Array of initial edge data
 * @param initialSettings Initial settings object
 */
export function useFluxManager(
  initialNodes: Node<FluxNodeData>[],
  initialEdges: Edge[],
  initialSettings: Settings,
): UseFluxManagerReturn {
  const [nodes, setNodes] = useState<Node<FluxNodeData>[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);
  const [settings, setSettingsState] = useState<Settings>(initialSettings);

  // Simple history stack: we store snapshots and a pointer to the current index
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  /**
   * Helper to capture the current snapshot of nodes/edges in history.
   */
  const captureHistory = useCallback(
    (updatedNodes: Node<FluxNodeData>[], updatedEdges: Edge[]) => {
      const newHistoryItem: HistoryItem = {
        nodes: updatedNodes,
        edges: updatedEdges,
        selectedNodeId: null,
        lastSelectedNodeId: null,
      };

      // If we made changes after undoing, discard forward history
      const truncatedHistory = history.slice(0, historyIndex + 1);

      setHistory([...truncatedHistory, newHistoryItem]);
      setHistoryIndex(truncatedHistory.length); // Move pointer to latest
    },
    [history, historyIndex],
  );

  /**
   * Adds a new node to the flow and captures a history snapshot.
   */
  const addNode = useCallback(
    (newNode: Node<FluxNodeData>) => {
      setNodes((prevNodes) => {
        const updatedNodes = [...prevNodes, newNode];
        captureHistory(updatedNodes, edges);
        return updatedNodes;
      });
    },
    [edges, captureHistory],
  );

  /**
   * Adds a new edge to the flow and captures a history snapshot.
   */
  const addEdge = useCallback(
    (newEdge: Edge) => {
      setEdges((prevEdges) => {
        const updatedEdges = [...prevEdges, newEdge];
        captureHistory(nodes, updatedEdges);
        return updatedEdges;
      });
    },
    [nodes, captureHistory],
  );

  /**
   * Updates settings with partial changes.
   */
  const setSettings = useCallback((updater: Partial<Settings>) => {
    setSettingsState((prev) => ({ ...prev, ...updater }));
  }, []);

  /**
   * Undo last change if possible.
   */
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      const { nodes: prevNodes, edges: prevEdges } = history[newIndex];
      setNodes(prevNodes);
      setEdges(prevEdges);
      setHistoryIndex(newIndex);
    }
  }, [history, historyIndex]);

  /**
   * Redo last undone change if possible.
   */
  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      const { nodes: nextNodes, edges: nextEdges } = history[newIndex];
      setNodes(nextNodes);
      setEdges(nextEdges);
      setHistoryIndex(newIndex);
    }
  }, [history, historyIndex]);

  return {
    nodes,
    edges,
    settings,
    history,
    addNode,
    addEdge,
    setSettings,
    undo,
    redo,
  };
}
