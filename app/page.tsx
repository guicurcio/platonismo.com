"use client";

import { useRef, useCallback, useState, useEffect } from "react";
import ReactFlow, {
  useReactFlow,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  Background,
  BackgroundVariant,
  Viewport,
} from "reactflow";
import "reactflow/dist/style.css";
import NavigationBar from "@/components/NavigationBar";

import ChatNode from "@/components/ChatNode";
import NoteNode from "@/components/NoteNode";
import YouTubeNode from "@/components/YouTubeNode";
import FunctionChatNode from "@/components/FunctionChatNode";
import ModelNode from "@/components/ModelNode";

const nodeTypes = {
  chat: ChatNode,
  note: NoteNode,
  youtube: YouTubeNode,
  functionChat: FunctionChatNode,
  model: ModelNode,
};

export interface AdvancedSettings {
  systemMessage: string;
  model: "gpt-3.5-turbo" | "gpt-3.5-turbo-16k" | "gpt-4" | "gpt-4-32k";
  temperature: number;
  topP: number;
  presencePenalty: number;
  frequencyPenalty: number;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(value, max));
}

function getEventPosition(evt?: MouseEvent | TouchEvent) {
  if (!evt) {
    return { clientX: 0, clientY: 0 };
  }
  if (evt instanceof MouseEvent) {
    return { clientX: evt.clientX, clientY: evt.clientY };
  }

  return {
    clientX: evt.touches[0].clientX,
    clientY: evt.touches[0].clientY,
  };
}

export default function Page() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const [advancedSettings, setAdvancedSettings] = useState<AdvancedSettings>({
    systemMessage: "You are a helpful assistant.",
    model: "gpt-4",
    temperature: 0.7,
    topP: 1,
    presencePenalty: 0,
    frequencyPenalty: 0,
  });

  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { project, fitView, setViewport, getViewport, getZoom } =
    useReactFlow();

  const fakeLoading = useCallback(
    (nodeId: string, delay = 1000) => {
      setTimeout(() => {
        setNodes((prev) =>
          prev.map((n) =>
            n.id === nodeId
              ? { ...n, data: { ...n.data, isLoading: false } }
              : n
          )
        );
      }, delay);
    },
    [setNodes]
  );

  const updateNodeData = useCallback(
    (nodeId: string, partialData: Record<string, any>) => {
      setNodes((prevNodes) =>
        prevNodes.map((node) => {
          if (node.id === nodeId) {
            return {
              ...node,
              data: {
                ...node.data,
                ...partialData,
              },
            };
          }
          return node;
        })
      );
    },
    [setNodes]
  );

  const onConnect = useCallback(
    (params: Connection | Edge) => {
      const newEdges = addEdge(params, edges);
      setEdges(newEdges);

      if ("source" in params && "target" in params) {
        const { source, target } = params;
        const parentNode = nodes.find((n) => n.id === source);
        const childNode = nodes.find((n) => n.id === target);

        if (parentNode && childNode) {
          if (
            parentNode.type === "model" &&
            (childNode.type === "chat" || childNode.type === "functionChat")
          ) {
            const selectedModel = parentNode.data?.selectedModel;
            if (selectedModel) {
              setNodes((prevNodes) =>
                prevNodes.map((node) => {
                  if (node.id === childNode.id) {
                    return {
                      ...node,
                      data: {
                        ...node.data,
                        model: selectedModel,
                      },
                    };
                  }
                  return node;
                })
              );
            }
          }
        }
      }
    },
    [edges, nodes, setEdges, setNodes]
  );

  const [menuState, setMenuState] = useState({
    visible: false,
    screenX: 0,
    screenY: 0,
    flowX: 0,
    flowY: 0,
  });

  const onPaneContextMenu = useCallback(
    (evt: React.MouseEvent) => {
      evt.preventDefault();
      const { x, y } = project({ x: evt.clientX, y: evt.clientY });
      setMenuState({
        visible: true,
        screenX: evt.clientX,
        screenY: evt.clientY,
        flowX: x,
        flowY: y,
      });
    },
    [project]
  );

  const handleGlobalClick = useCallback(() => {
    if (menuState.visible) {
      setMenuState((prev) => ({ ...prev, visible: false }));
    }
  }, [menuState.visible]);

  const createChatNode = useCallback(
    (posX: number, posY: number) => {
      const newId = `chat-${nodes.length + 1}`;
      const newNode: Node = {
        id: newId,
        type: "chat",
        position: { x: posX, y: posY },
        data: {
          label: `Chat ${nodes.length + 1}`,
          updateNodeData,
          isLoading: true,
        },
      };
      setNodes((prev) => [...prev, newNode]);
      fakeLoading(newId, 700);
    },
    [nodes.length, updateNodeData, fakeLoading, setNodes]
  );

  const createNoteNode = useCallback(
    (posX: number, posY: number) => {
      const newId = `note-${nodes.length + 1}`;
      const newNode: Node = {
        id: newId,
        type: "note",
        position: { x: posX, y: posY },
        data: {
          label: `Note ${nodes.length + 1}`,
          isLoading: true,
        },
      };
      setNodes((prev) => [...prev, newNode]);
      fakeLoading(newId, 700);
    },
    [nodes.length, fakeLoading, setNodes]
  );

  const createFunctionChatNode = useCallback(
    (posX: number, posY: number) => {
      const newId = `functionChat-${nodes.length + 1}`;
      const newNode: Node = {
        id: newId,
        type: "functionChat",
        position: { x: posX, y: posY },
        data: {
          label: `Function Chat ${nodes.length + 1}`,
          updateNodeData,
          isLoading: true,
        },
      };
      setNodes((prev) => [...prev, newNode]);
      fakeLoading(newId, 700);
    },
    [nodes.length, updateNodeData, fakeLoading, setNodes]
  );

  const createModelNode = useCallback(
    (posX: number, posY: number) => {
      const newId = `model-${nodes.length + 1}`;
      const newNode: Node = {
        id: newId,
        type: "model",
        position: { x: posX, y: posY },
        data: {
          label: `Model Node ${nodes.length + 1}`,
          selectedModel: "gpt-4",
          isLoading: true,
          setSelectedModel: (model: string) => {
            setNodes((prev) => {
              const nextNodes = prev.map((n) => {
                if (n.id === newId) {
                  return {
                    ...n,
                    data: {
                      ...n.data,
                      selectedModel: model,
                    },
                  };
                }
                return n;
              });

              const outgoingEdges = edges.filter((e) => e.source === newId);
              const childIds = outgoingEdges.map((e) => e.target);

              return nextNodes.map((n) => {
                if (
                  childIds.includes(n.id) &&
                  (n.type === "chat" || n.type === "functionChat")
                ) {
                  return {
                    ...n,
                    data: {
                      ...n.data,
                      model,
                    },
                  };
                }
                return n;
              });
            });
          },
        },
      };
      setNodes((prev) => [...prev, newNode]);
      fakeLoading(newId, 700);
    },
    [nodes.length, edges, fakeLoading, setNodes]
  );

  const handleCreateChatNodeContext = useCallback(() => {
    createChatNode(menuState.flowX, menuState.flowY);
    setMenuState((prev) => ({ ...prev, visible: false }));
  }, [createChatNode, menuState.flowX, menuState.flowY]);

  const handleCreateNoteNodeContext = useCallback(() => {
    createNoteNode(menuState.flowX, menuState.flowY);
    setMenuState((prev) => ({ ...prev, visible: false }));
  }, [createNoteNode, menuState.flowX, menuState.flowY]);

  const createChatNodeAtCenter = useCallback(() => {
    if (!reactFlowWrapper.current) return;
    const { width, height } = reactFlowWrapper.current.getBoundingClientRect();
    const centerScreen = { x: width / 2, y: height / 2 };
    const { x, y } = project(centerScreen);
    createChatNode(x, y);
  }, [project, createChatNode]);

  const createNoteNodeAtCenter = useCallback(() => {
    if (!reactFlowWrapper.current) return;
    const { width, height } = reactFlowWrapper.current.getBoundingClientRect();
    const centerScreen = { x: width / 2, y: height / 2 };
    const { x, y } = project(centerScreen);
    createNoteNode(x, y);
  }, [project, createNoteNode]);

  const createFunctionChatNodeAtCenter = useCallback(() => {
    if (!reactFlowWrapper.current) return;
    const { width, height } = reactFlowWrapper.current.getBoundingClientRect();
    const centerScreen = { x: width / 2, y: height / 2 };
    const { x, y } = project(centerScreen);
    createFunctionChatNode(x, y);
  }, [project, createFunctionChatNode]);

  const createModelNodeAtCenter = useCallback(() => {
    if (!reactFlowWrapper.current) return;
    const { width, height } = reactFlowWrapper.current.getBoundingClientRect();
    const centerScreen = { x: width / 2, y: height / 2 };
    const { x, y } = project(centerScreen);
    createModelNode(x, y);
  }, [project, createModelNode]);

  const handleHome = useCallback(() => {
    if (!reactFlowWrapper.current) return;
    const { width, height } = reactFlowWrapper.current.getBoundingClientRect();
    setViewport({ x: width / 2, y: height / 2, zoom: 1 }, { duration: 300 });
  }, [reactFlowWrapper, setViewport]);

  useEffect(() => {
    const handlePaste = (evt: ClipboardEvent) => {
      const pastedText = evt.clipboardData?.getData("text") || "";
      if (
        pastedText.includes("youtube.com") ||
        pastedText.includes("youtu.be")
      ) {
        evt.preventDefault();

        let finalUrl = pastedText.trim();
        if (!/^https?:\/\//i.test(finalUrl)) {
          finalUrl = "https://" + finalUrl;
        }

        const newId = `youtube-${nodes.length + 1}`;
        const newNode: Node = {
          id: newId,
          type: "youtube",
          position: { x: 200, y: 200 },
          data: {
            url: finalUrl,
            isLoading: true,
          },
        };

        setNodes((prev) => [...prev, newNode]);

        requestAnimationFrame(() => {
          fitView({ padding: 0.9, duration: 300 });
        });

        fakeLoading(newId);
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => {
      window.removeEventListener("paste", handlePaste);
    };
  }, [nodes.length, fitView, setNodes, fakeLoading]);

  const handleZoom = useCallback(
    (direction: "in" | "out") => {
      if (!reactFlowWrapper.current) return;

      const { width, height } =
        reactFlowWrapper.current.getBoundingClientRect();
      const centerScreen = { x: width / 2, y: height / 2 };

      const currentZoom = getZoom();
      const { x, y } = getViewport();
      const centerInFlow = project(centerScreen);
      const factor = direction === "in" ? 1.2 : 0.8;
      const newZoom = clamp(currentZoom * factor, 0.2, 2.0);

      const newX = centerScreen.x - centerInFlow.x * newZoom;
      const newY = centerScreen.y - centerInFlow.y * newZoom;

      setViewport({ x: newX, y: newY, zoom: newZoom }, { duration: 300 });
    },
    [getViewport, getZoom, project, setViewport]
  );

  const handleZoomIn = useCallback(() => handleZoom("in"), [handleZoom]);
  const handleZoomOut = useCallback(() => handleZoom("out"), [handleZoom]);

  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState({ x: 0, y: 0 });
  const [selectionEnd, setSelectionEnd] = useState({ x: 0, y: 0 });

  const handleMoveStart = useCallback(
    (evt?: MouseEvent | TouchEvent, viewport?: Viewport) => {
      if (!isSelectionMode) return;

      const { clientX, clientY } = getEventPosition(evt);
      const flowCoords = project({ x: clientX, y: clientY });
      setSelectionStart(flowCoords);
      setSelectionEnd(flowCoords);
      setIsSelecting(true);
    },
    [isSelectionMode, project]
  );

  const handleMove = useCallback(
    (evt?: MouseEvent | TouchEvent, viewport?: Viewport) => {
      if (!isSelectionMode || !isSelecting) return;
      const { clientX, clientY } = getEventPosition(evt);
      const flowCoords = project({ x: clientX, y: clientY });
      setSelectionEnd(flowCoords);
    },
    [isSelectionMode, isSelecting, project]
  );

  const handleMoveEnd = useCallback(
    (evt?: MouseEvent | TouchEvent, viewport?: Viewport) => {
      if (!isSelectionMode) return;
      setIsSelecting(false);

      const left = Math.min(selectionStart.x, selectionEnd.x);
      const right = Math.max(selectionStart.x, selectionEnd.x);
      const top = Math.min(selectionStart.y, selectionEnd.y);
      const bottom = Math.max(selectionStart.y, selectionEnd.y);

      setNodes((prev) =>
        prev.map((node) => {
          const { x, y } = node.position;
          const isInside = x >= left && x <= right && y >= top && y <= bottom;
          return {
            ...node,
            selected: isInside,
          };
        })
      );
    },
    [isSelectionMode, selectionStart, selectionEnd, setNodes]
  );

  const getScreenCoords = useCallback(
    (flowPos: { x: number; y: number }) => {
      const { x, y, zoom } = getViewport();
      return {
        x: flowPos.x * zoom + x,
        y: flowPos.y * zoom + y,
      };
    },
    [getViewport]
  );

  let selectionStyle: React.CSSProperties = { display: "none" };
  if (isSelecting && reactFlowWrapper.current) {
    const wrapperBounds = reactFlowWrapper.current.getBoundingClientRect();
    const s1 = getScreenCoords(selectionStart);
    const s2 = getScreenCoords(selectionEnd);

    const left = Math.min(s1.x, s2.x) - wrapperBounds.left;
    const top = Math.min(s1.y, s2.y) - wrapperBounds.top;
    const width = Math.abs(s2.x - s1.x);
    const height = Math.abs(s2.y - s1.y);

    selectionStyle = {
      position: "absolute",
      left,
      top,
      width,
      height,
      backgroundColor: "rgba(0, 162, 255, 0.2)",
      border: "1px solid rgba(0, 162, 255, 0.5)",
      zIndex: 999,
      pointerEvents: "none",
    };
  }

  return (
    <div
      className="relative w-full h-screen bg-background"
      onClick={handleGlobalClick}
    >
      <div
        ref={reactFlowWrapper}
        className={`w-full h-full relative ${
          isSelectionMode ? "cursor-crosshair" : "cursor-grab"
        }`}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onPaneContextMenu={onPaneContextMenu}
          onMoveStart={handleMoveStart}
          onMove={handleMove}
          onMoveEnd={handleMoveEnd}
          fitView
          className="bg-background"
          deleteKeyCode={["Backspace", "Delete"]}
          panOnDrag={!isSelectionMode}
        >
          <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
        </ReactFlow>

        {/* The bluish selection rectangle */}
        {isSelectionMode && isSelecting && <div style={selectionStyle} />}
      </div>

      {/* Right-click context menu */}
      {menuState.visible && (
        <div
          style={{
            position: "absolute",
            top: menuState.screenY,
            left: menuState.screenX,
          }}
          className="z-50 rounded bg-card text-foreground text-sm border shadow"
        >
          <button
            className="block w-full px-4 py-2 text-left hover:bg-muted"
            onClick={handleCreateChatNodeContext}
          >
            Create Chat Node
          </button>
          <button
            className="block w-full px-4 py-2 text-left hover:bg-muted"
            onClick={handleCreateNoteNodeContext}
          >
            Create Note Node
          </button>
        </div>
      )}

      <NavigationBar
        onUndo={() => console.log("Undo")}
        onRedo={() => console.log("Redo")}
        canUndo
        canRedo
        advancedSettings={advancedSettings}
        setAdvancedSettings={setAdvancedSettings}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onInsertChatNode={createChatNodeAtCenter}
        onInsertNoteNode={createNoteNodeAtCenter}
        onInsertFunctionChatNode={createFunctionChatNodeAtCenter}
        onInsertModelNode={createModelNodeAtCenter}
        onHome={handleHome}
        isSelectionMode={isSelectionMode}
        onToggleSelectionMode={() => setIsSelectionMode((prev) => !prev)}
      />
    </div>
  );
}
