import { useCallback, useEffect, useState } from "react";

import { createFileRoute } from "@tanstack/react-router";
import {
  addEdge,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  ReactFlow,
  useEdgesState,
  useNodesState,
  type Node,
  type Edge,
} from "@xyflow/react";

import FlowComponent from "@/app/components/graph-editor";
import { EditorContextProvider } from "@/app/context/editor";
import { StrellaProject } from "@/types";

export const Route = createFileRoute("/editor/$fileID")({
  component: Index,
});

const executeGraph = async (graph: { nodes: Node[]; edges: Edge[] }) => {};

const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

const NodeGraph = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: any) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        snapGrid={[12, 12]}
        snapToGrid
      >
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
      </ReactFlow>
    </div>
  );
};

const VisualEditor = () => {
  // This is a placeholder for the visual editor which will render the component and its properties in a visual editor (including the children).
};

const ComponentEditor = () => {
  // This is a placeholder for the component editor which will implement the display of a visual editor and graph for individual components.
};

const ComponentTree = () => {
  // This is a placeholder for the component tree which will implement the display of the component tree and its properties.
};

const PropertiesPanel = () => {
  // This is a placeholder for the properties panel which will implement the display of the properties of the selected component.
};

const UtilityPanel = () => {
  // This is a placeholder for the utility panel which will implement the display of the variables and functions for the given component scope.
};

// The main project view has it's own visual editor and graph editor, and then from the component tree you can drill into the "component editor" which will open the dedicated views for the selected component.
// The properties panel shows details about the selected component without having to drill into the component editor.
// Maybe some sort of tab system would be nice to have? Top tabs where the "project" tab is pinned left and each new component editor instance opens a new tab to the right?

function Index() {
  const { fileID } = Route.useParams();
  const [project, setProject] = useState<StrellaProject>();

  useEffect(() => {
    void window.strella.getProject(fileID).then(setProject);
  }, [fileID]);

  return (
    <EditorContextProvider value={{ project, setProject }}>
      <div className="h-svh w-svw isolate">
        {/*Editor experience goes here*/}
        <FlowComponent />
      </div>
    </EditorContextProvider>
  );
}
