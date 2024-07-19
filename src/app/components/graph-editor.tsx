import React, { useCallback, useState, createContext, useContext } from "react";

import {
  ReactFlow,
  Node,
  Edge,
  Connection,
  addEdge,
  useNodesState,
  useEdgesState,
  useReactFlow,
  NodeProps,
  Handle,
  Position,
  ReactFlowProvider,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

// Global variables context
interface GlobalVariablesContextType {
  variables: { [key: string]: any };
  setVariable: (name: string, value: any) => void;
}

const GlobalVariablesContext = createContext<GlobalVariablesContextType>({
  variables: {},
  setVariable: () => {},
});

const useGlobalVariables = () => useContext(GlobalVariablesContext);

// Node types
interface PortConfig {
  name: string;
  type: "string" | "number" | "boolean" | "array" | "object" | "any";
}

interface NodeConfig {
  type: string;
  inputs: PortConfig[];
  outputs: PortConfig[];
  executionInputs: string[];
  executionOutputs: string[];
}

type NodeData = {
  label: string;
  config: NodeConfig;
  execute: (
    inputs: any,
    executionInputs: string[],
    setOutputs: (outputs: any) => void,
    triggerExecutionOutputs: (outputs: string[]) => void,
    globalVariables: GlobalVariablesContextType,
  ) => void;
};

// Function to get input values for a node
const getNodeInputs = (nodeId: string, nodes: Node[], edges: Edge[]) => {
  const node = nodes.find((n) => n.id === nodeId);
  if (!node) return {};

  const inputValues: { [key: string]: any } = {};

  edges.forEach((edge) => {
    if (edge.target === nodeId) {
      const sourceNode = nodes.find((n) => n.id === edge.source);
      if (sourceNode) {
        const key = edge.targetHandle || "default";
        inputValues[key] =
          sourceNode.data.outputs?.[edge.sourceHandle || "default"];
      }
    }
  });

  return inputValues;
};

// Custom node component
const CustomNode: React.FC<NodeProps<NodeData>> = ({
  id,
  data,
  isConnectable,
}) => {
  const { setNodes, getNode, getEdges } = useReactFlow();
  const globalVariables = useGlobalVariables();

  const setOutputs = useCallback(
    (outputs: any) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === id) {
            return { ...node, data: { ...node.data, outputs } };
          }
          return node;
        }),
      );
    },
    [id, setNodes],
  );

  const triggerExecutionOutputs = useCallback(
    (outputs: string[]) => {
      outputs.forEach((output) => {
        const edges = getEdges().filter(
          (edge) => edge.source === id && edge.sourceHandle === output,
        );
        edges.forEach((edge) => {
          const targetNode = getNode(edge.target);
          if (targetNode && targetNode.data.execute) {
            const targetInputs = getNodeInputs(edge.target, nodes, edges);
            targetNode.data.execute(
              targetInputs,
              [edge.targetHandle || ""],
              setOutputs,
              triggerExecutionOutputs,
              globalVariables,
            );
          }
        });
      });
    },
    [id, getEdges, getNode, setOutputs, globalVariables],
  );

  return (
    <div className="bg-card border border-border rounded-lg shadow-md">
      <div className="flex text-xs font-mono justify-between px-2 pr-6 py-1 border-b border-border">
        {data.label}
      </div>
      <div className="flex flex-col p-2">
        <div className="relative h-2 mb-2">
          {data.config.executionInputs.map((input) => (
            <Handle
              type="target"
              position={Position.Left}
              id={input}
              isConnectable={isConnectable}
              className="!w-2 !h-2 !rounded-[3px]"
            />
          ))}
          {data.config.executionOutputs.map((output) => (
            <Handle
              type="source"
              position={Position.Right}
              id={output}
              isConnectable={isConnectable}
              className="!w-2 !h-2 !rounded-[3px]"
            />
          ))}
        </div>
        {data.config.inputs.map((input, index) => {
          const output = data.config.outputs[index];
          return (
            <div key={input.name} className="relative flex justify-between">
              <div>
                <div className="text-xs pl-2 pr-6">{input.name}</div>
                <Handle
                  type="target"
                  position={Position.Left}
                  id={input.name}
                  isConnectable={isConnectable}
                  className="!w-2 !h-2"
                />
              </div>
              {output && (
                <div key={output.name} className="relative text-right">
                  <div className="text-xs pr-2 pl-6">{output.name}</div>
                  <Handle
                    type="source"
                    position={Position.Right}
                    id={output.name}
                    isConnectable={isConnectable}
                    className="!w-2 !h-2"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Node definitions
const onStartConfig: NodeConfig = {
  type: "ON_START",
  inputs: [],
  outputs: [],
  executionInputs: [],
  executionOutputs: ["default"],
};

const onStartNode: Node<NodeData> = {
  id: "onStart",
  type: "custom",
  position: { x: 0, y: 0 },
  data: {
    label: "Start",
    config: onStartConfig,
    execute: (inputs, executionInputs, setOutputs, triggerExecutionOutputs) => {
      console.log("Execution started");
      triggerExecutionOutputs(["default"]);
    },
  },
};

const variableGetterConfig: NodeConfig = {
  type: "variableGetter",
  inputs: [{ name: "variableName", type: "string" }],
  outputs: [{ name: "value", type: "any" }],
  executionInputs: [],
  executionOutputs: [],
};

const variableGetterNode: Node<NodeData> = {
  id: "getter",
  type: "custom",
  position: { x: 200, y: 0 },
  data: {
    label: "Get Variable",
    config: variableGetterConfig,
    execute: (
      inputs,
      executionInputs,
      setOutputs,
      triggerExecutionOutputs,
      globalVariables,
    ) => {
      const variableName = inputs.variableName || "Values";
      const value = globalVariables.variables[variableName];
      console.log(`Retrieved value of ${variableName}:`, value);
      setOutputs({ value });
    },
  },
};

const variableSetterConfig: NodeConfig = {
  type: "variableSetter",
  inputs: [
    { name: "variableName", type: "string" },
    { name: "value", type: "any" },
  ],
  outputs: [{ name: "value", type: "any" }],
  executionInputs: ["default"],
  executionOutputs: ["default"],
};

const variableSetterNode: Node<NodeData> = {
  id: "setter",
  type: "custom",
  position: { x: 600, y: 0 },
  data: {
    label: "Set Variable",
    config: variableSetterConfig,
    execute: (
      inputs,
      executionInputs,
      setOutputs,
      triggerExecutionOutputs,
      globalVariables,
    ) => {
      const variableName = inputs.variableName || "Sum";
      const value = inputs.value !== undefined ? inputs.value : 0;
      globalVariables.setVariable(variableName, value);
      console.log(`Set ${variableName} to`, value);
      triggerExecutionOutputs(["default"]);
    },
  },
};

const forEachConfig: NodeConfig = {
  type: "forEach",
  inputs: [{ name: "array", type: "array" }],
  outputs: [{ name: "currentItem", type: "any" }],
  executionInputs: ["default"],
  executionOutputs: ["iteration", "complete"],
};

const forEachNode: Node<NodeData> = {
  id: "forEach",
  type: "custom",
  position: { x: 400, y: 0 },
  data: {
    label: "ForEach",
    config: forEachConfig,
    execute: (inputs, executionInputs, setOutputs, triggerExecutionOutputs) => {
      const array = inputs.array;
      if (Array.isArray(array)) {
        array.forEach((item, index) => {
          console.log(`ForEach item ${index}:`, item);
          setOutputs({ currentItem: item });
          triggerExecutionOutputs(["iteration"]);
        });
        triggerExecutionOutputs(["complete"]);
      } else {
        console.error(`Input is not an array`);
      }
    },
  },
};

const addConfig: NodeConfig = {
  type: "ADD",
  inputs: [
    { name: "a", type: "number" },
    { name: "b", type: "number" },
  ],
  outputs: [{ name: "result", type: "number" }],
  executionInputs: ["default"],
  executionOutputs: ["default"],
};

const addNode: Node<NodeData> = {
  id: "add",
  type: "custom",
  position: { x: 400, y: 200 },
  data: {
    label: "Add",
    config: addConfig,
    execute: (inputs, executionInputs, setOutputs, triggerExecutionOutputs) => {
      const result = (inputs.a || 0) + (inputs.b || 0);
      setOutputs({ result });
      triggerExecutionOutputs(["default"]);
    },
  },
};

const consoleLogConfig: NodeConfig = {
  type: "CONSOLE_LOG",
  inputs: [{ name: "value", type: "any" }],
  outputs: [],
  executionInputs: ["default"],
  executionOutputs: ["default"],
};

const consoleLogNode: Node<NodeData> = {
  id: "consoleLog",
  type: "custom",
  position: { x: 800, y: 0 },
  data: {
    label: "Console Log",
    config: consoleLogConfig,
    execute: (inputs, executionInputs, setOutputs, triggerExecutionOutputs) => {
      console.log("Logged value:", inputs.value);
      triggerExecutionOutputs(["default"]);
    },
  },
};

// Main component
const Flow: React.FC = () => {
  const [globalVariables, setGlobalVariables] = useState<{
    [key: string]: any;
  }>({
    Values: [1, 2, 3, 4, 5],
    Sum: 0,
  });

  const setVariable = useCallback((name: string, value: any) => {
    setGlobalVariables((prev) => ({ ...prev, [name]: value }));
  }, []);

  const nodeTypes = {
    custom: CustomNode,
  };

  const [nodes, setNodes, onNodesChange] = useNodesState([
    onStartNode,
    variableGetterNode,
    variableSetterNode,
    forEachNode,
    addNode,
    consoleLogNode,
  ]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const onConnect = useCallback(
    (params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  const executeFlow = useCallback(
    (
      startNodeId: string,
      nodes: Node[],
      edges: Edge[],
      globalVariables: GlobalVariablesContextType,
    ) => {
      const executeNode = (nodeId: string) => {
        const node = nodes.find((n) => n.id === nodeId);
        if (!node || !node.data.execute) return;

        const inputs = getNodeInputs(nodeId, nodes, edges);
        node.data.execute(
          inputs,
          node.data.config.executionInputs,
          (outputs) => {
            setNodes((nds) =>
              nds.map((n) =>
                n.id === nodeId ? { ...n, data: { ...n.data, outputs } } : n,
              ),
            );
          },
          (outputIds) => {
            outputIds.forEach((outputId) => {
              const connectedEdges = edges.filter(
                (edge) =>
                  edge.source === nodeId && edge.sourceHandle === outputId,
              );
              connectedEdges.forEach((edge) => {
                executeNode(edge.target);
              });
            });
          },
          globalVariables,
        );
      };

      executeNode(startNodeId);
    },
    [setNodes],
  );

  const handleExecute = () => {
    executeFlow("onStart", nodes, edges, {
      variables: globalVariables,
      setVariable,
    });
  };

  return (
    <GlobalVariablesContext.Provider
      value={{ variables: globalVariables, setVariable }}
    >
      <div style={{ height: "100vh", width: "100%" }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
        />
        <button
          onClick={handleExecute}
          style={{ position: "absolute", top: 10, right: 10 }}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg"
        >
          Execute Flow
        </button>
        <div style={{ position: "absolute", top: 10, left: 10 }}>
          Global Variables: {JSON.stringify(globalVariables)}
        </div>
      </div>
    </GlobalVariablesContext.Provider>
  );
};

const FlowComponent: React.FC = () => {
  return (
    <ReactFlowProvider>
      <Flow />
    </ReactFlowProvider>
  );
};

export default FlowComponent;
