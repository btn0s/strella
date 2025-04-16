import { useCallback, useEffect, useState, useRef } from "react";
import {
  ReactFlow,
  Controls,
  Background,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
} from "@xyflow/react";
import type {
  Node,
  Edge,
  NodeChange,
  EdgeChange,
  Connection,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import * as Y from "yjs";
import { WebrtcProvider } from "y-webrtc";

// Initial nodes for demo
const initialNodes: Node[] = [
  {
    id: "1",
    type: "default",
    position: { x: 100, y: 100 },
    data: { label: "Node 1" },
  },
  {
    id: "2",
    type: "default",
    position: { x: 400, y: 100 },
    data: { label: "Node 2" },
  },
];

// Initial edges for demo
const initialEdges: Edge[] = [];

// Create a unique document ID for this POC session
const DOC_ID = "strella-poc-session";

export function YjsReactFlowPOC() {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);
  const [connectionCount, setConnectionCount] = useState(0);

  // Use refs to store Yjs document and provider
  const ydocRef = useRef<Y.Doc | null>(null);
  const providerRef = useRef<WebrtcProvider | null>(null);
  const yNodesMapRef = useRef<Y.Map<any> | null>(null);
  const yEdgesMapRef = useRef<Y.Map<any> | null>(null);

  // Convert YJS map entries to React Flow nodes
  const syncNodesFromYjs = useCallback(() => {
    if (!yNodesMapRef.current) return;

    const nodesArr: Node[] = [];
    yNodesMapRef.current.forEach((value) => {
      const nodeData = JSON.parse(value as string);
      nodesArr.push(nodeData);
    });
    setNodes(nodesArr);
  }, []);

  // Convert YJS map entries to React Flow edges
  const syncEdgesFromYjs = useCallback(() => {
    if (!yEdgesMapRef.current) return;

    const edgesArr: Edge[] = [];
    yEdgesMapRef.current.forEach((value) => {
      const edgeData = JSON.parse(value as string);
      edgesArr.push(edgeData);
    });
    setEdges(edgesArr);
  }, []);

  // Initialize Yjs document and WebRTC provider only on the client
  useEffect(() => {
    // Check if we're running in the browser
    if (typeof window === "undefined") return;

    // Initialize YJS document and provider
    ydocRef.current = new Y.Doc();
    providerRef.current = new WebrtcProvider(DOC_ID, ydocRef.current, {
      signaling: ["wss://signaling.yjs.dev"],
    });

    // Create shared types for nodes and edges
    yNodesMapRef.current = ydocRef.current.getMap("nodes");
    yEdgesMapRef.current = ydocRef.current.getMap("edges");

    // Prime yjs with initial nodes if not already present
    if (yNodesMapRef.current.size === 0) {
      initialNodes.forEach((node) => {
        yNodesMapRef.current?.set(node.id, JSON.stringify(node));
      });
    } else {
      syncNodesFromYjs();
    }

    // Listen for YJS changes
    yNodesMapRef.current.observe(() => {
      syncNodesFromYjs();
    });

    if (yEdgesMapRef.current) {
      yEdgesMapRef.current.observe(() => {
        syncEdgesFromYjs();
      });
    }

    // Track connection count via awareness
    const updateConnectionCount = () => {
      if (providerRef.current) {
        setConnectionCount(providerRef.current.awareness.getStates().size);
      }
    };

    if (providerRef.current) {
      providerRef.current.awareness.on("change", updateConnectionCount);
      updateConnectionCount();
    }

    // Cleanup function
    return () => {
      if (providerRef.current) {
        providerRef.current.awareness.off("change", updateConnectionCount);
        providerRef.current.destroy();
      }
      if (ydocRef.current) {
        ydocRef.current.destroy();
      }
    };
  }, [syncNodesFromYjs, syncEdgesFromYjs]);

  // Handle node changes (position, removal, etc.)
  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      // Apply changes to local state first for UI responsiveness
      setNodes((nds) => applyNodeChanges(changes, nds));

      // Then apply changes to YJS document
      if (!yNodesMapRef.current) return;

      changes.forEach((change) => {
        if (change.type === "position" && change.position) {
          const nodeId = change.id;
          const node = nodes.find((n) => n.id === nodeId);

          if (node) {
            const updatedNode = {
              ...node,
              position: change.position,
            };
            yNodesMapRef.current?.set(nodeId, JSON.stringify(updatedNode));
          }
        } else if (change.type === "remove") {
          yNodesMapRef.current?.delete(change.id);
        }
      });
    },
    [nodes]
  );

  // Handle edge changes (removal, etc.)
  const onEdgesChange = useCallback((changes: EdgeChange[]) => {
    // Apply changes to local state
    setEdges((eds) => applyEdgeChanges(changes, eds));

    // Apply changes to YJS document
    if (!yEdgesMapRef.current) return;

    changes.forEach((change) => {
      if (change.type === "remove") {
        yEdgesMapRef.current?.delete(change.id);
      }
    });
  }, []);

  // Handle new connections between nodes
  const onConnect = useCallback((connection: Connection) => {
    if (!yEdgesMapRef.current) return;

    // Create a new edge with a unique ID
    const newEdge = {
      ...connection,
      id: `e-${Date.now()}`,
    } as Edge;

    // Update local state
    setEdges((eds) => addEdge(newEdge, eds));

    // Update YJS state
    yEdgesMapRef.current.set(newEdge.id, JSON.stringify(newEdge));
  }, []);

  // Add a new node when clicking the "Add Node" button
  const addNode = useCallback(() => {
    if (!yNodesMapRef.current) return;

    const newNodeId = `node-${Date.now()}`;
    const newNode: Node = {
      id: newNodeId,
      type: "default",
      position: {
        x: Math.random() * 400,
        y: Math.random() * 400,
      },
      data: { label: `Node ${newNodeId.slice(0, 6)}` },
    };

    // Update YJS state (local state will update via observer)
    yNodesMapRef.current.set(newNodeId, JSON.stringify(newNode));
  }, []);

  return (
    <div className="flex flex-col h-screen">
      <div className="p-4 bg-slate-100 flex items-center justify-between">
        <h1 className="text-xl font-bold">Strella POC: React Flow + Yjs</h1>
        <div className="flex gap-4 items-center">
          <span className="text-sm">Connected clients: {connectionCount}</span>
          <button
            onClick={addNode}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Add Node
          </button>
        </div>
      </div>
      <div className="flex-grow">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
        >
          <Background />
          <Controls />
        </ReactFlow>
      </div>
      <div className="p-4 bg-slate-100 text-sm">
        <p>
          Open this page in another browser or tab to test real-time
          collaboration.
        </p>
        <p>
          Try moving nodes, connecting them, or adding new nodes to see changes
          sync in real-time.
        </p>
      </div>
    </div>
  );
}
