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
        <div className="relative mb-2 flex">
          <div className="flex flex-1 flex-col">
            {data.config.executionInputs.map((input) => (
              <div key={input} className="relative flex h-4">
                <Handle
                  type="target"
                  position={Position.Left}
                  id={input}
                  isConnectable={isConnectable}
                  className="!w-2 !h-2 !rounded-[3px]"
                />
              </div>
            ))}
          </div>
          <div className="flex flex-1 flex-col items-end">
            {data.config.executionOutputs.map((output) => (
              <div key={output} className="relative flex h-4">
                {output !== "default" && (
                  <div className="text-xs pr-2 pl-6">{output}</div>
                )}
                <Handle
                  type="source"
                  position={Position.Right}
                  id={output}
                  isConnectable={isConnectable}
                  className="!w-2 !h-2 !rounded-[3px]"
                />
              </div>
            ))}
          </div>
        </div>
        <div className="flex">
          <div className="flex flex-1 flex-col">
            {data.config.inputs.map((input, index) => {
              return (
                <div key={input.name} className="relative flex">
                  <div className="text-xs pl-2 pr-6">{input.name}</div>
                  <Handle
                    type="target"
                    position={Position.Left}
                    id={input.name}
                    isConnectable={isConnectable}
                    className="!w-2 !h-2"
                  />
                </div>
              );
            })}
          </div>
          <div className="flex flex-col flex-1 items-end">
            {data.config.outputs.map((output, index) => {
              return (
                <div
                  key={output.name}
                  className="relative flex justify-between"
                >
                  <div>
                    <div className="text-xs pr-2 pl-6">{output.name}</div>
                    <Handle
                      type="source"
                      position={Position.Right}
                      id={output.name}
                      isConnectable={isConnectable}
                      className="!w-2 !h-2"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
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

const createVariableGetterNode = (
  id: string,
  variableName: string,
): Node<NodeData> => ({
  id,
  type: "custom",
  position: { x: 200, y: Math.random() * 300 }, // Random y position to avoid overlap
  data: {
    label: `Get ${variableName}`,
    config: {
      type: "variableGetter",
      inputs: [],
      outputs: [{ name: "value", type: "any" }],
      executionInputs: [],
      executionOutputs: [],
    },
    execute: (
      inputs,
      executionInputs,
      setOutputs,
      triggerExecutionOutputs,
      globalVariables,
    ) => {
      const value = globalVariables.variables[variableName];
      console.log(`Retrieved value of ${variableName}:`, value);
      setOutputs({ value });
    },
  },
});

const createVariableSetterNode = (
  id: string,
  variableName: string,
): Node<NodeData> => ({
  id,
  type: "custom",
  position: { x: 600, y: Math.random() * 300 }, // Random y position to avoid overlap
  data: {
    label: `Set ${variableName}`,
    config: {
      type: "variableSetter",
      inputs: [{ name: "value", type: "any" }],
      outputs: [{ name: "value", type: "any" }],
      executionInputs: ["default"],
      executionOutputs: ["default"],
    },
    execute: (
      inputs,
      executionInputs,
      setOutputs,
      triggerExecutionOutputs,
      globalVariables,
    ) => {
      const value = inputs.value !== undefined ? inputs.value : 0;
      globalVariables.setVariable(variableName, value);
      console.log(`Set ${variableName} to`, value);
      triggerExecutionOutputs(["default"]);
    },
  },
});

const forEachConfig: NodeConfig = {
  type: "forEach",
  inputs: [{ name: "array", type: "array" }],
  outputs: [
    {
      name: "index",
      type: "number",
    },
    { name: "currentItem", type: "any" },
  ],
  executionInputs: ["default"],
  executionOutputs: ["complete", "iteration"],
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

// Function to execute a node
const executeNode = (
  nodeId: string,
  nodes: Node[],
  edges: Edge[],
  globalVariables: GlobalVariablesContextType,
  executeNodeCallback: (nodeId: string) => void,
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>,
) => {
  const node = nodes.find((n) => n.id === nodeId);
  if (!node || !node.data.execute) return;

  // Retrieve the input values for the node
  const inputs = getNodeInputs(nodeId, nodes, edges);

  // Check if the node has any inputs that need to fetch values from getter nodes
  const valueInputs = node.data.config.inputs.filter((input) =>
    ["string", "number", "boolean", "array", "object", "any"].includes(
      input.type,
    ),
  );

  // If there are value inputs, find the corresponding getter nodes and execute them first
  valueInputs.forEach((input) => {
    const edge = edges.find(
      (e) => e.target === nodeId && e.targetHandle === input.name,
    );
    if (edge) {
      const getterNodeId = edge.source;
      const getterNode = nodes.find((n) => n.id === getterNodeId);
      if (getterNode && getterNode.data.execute) {
        // Execute the getter node
        getterNode.data.execute(
          {},
          [],
          (getterOutputs) => {
            inputs[input.name] = getterOutputs.value;
            // Continue with the execution of the main node after the getter node has provided its value
            node.data.execute(
              inputs,
              node.data.config.executionInputs,
              (outputs) => {
                setNodes((nds) =>
                  nds.map((n) =>
                    n.id === nodeId
                      ? { ...n, data: { ...n.data, outputs } }
                      : n,
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
                    executeNodeCallback(edge.target);
                  });
                });
              },
              globalVariables,
            );
          },
          () => {},
          globalVariables,
        );
      }
    }
  });

  // Execute the main node logic
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
          (edge) => edge.source === nodeId && edge.sourceHandle === outputId,
        );
        connectedEdges.forEach((edge) => {
          executeNodeCallback(edge.target);
        });
      });
    },
    globalVariables,
  );
};

// Function to execute the flow
const executeFlow = (
  startNodeId: string,
  nodes: Node[],
  edges: Edge[],
  globalVariables: GlobalVariablesContextType,
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>,
) => {
  const executeNodeCallback = (nodeId: string) => {
    executeNode(
      nodeId,
      nodes,
      edges,
      globalVariables,
      executeNodeCallback,
      setNodes,
    );
  };

  executeNodeCallback(startNodeId);
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
    createVariableGetterNode("getter-values-1", "Values"),
    createVariableGetterNode("getter-sum-1", "Sum"),
    createVariableGetterNode("getter-sum-2", "Sum"),
    createVariableSetterNode("setter-sum-1", "Sum"),
    forEachNode,
    addNode,
    consoleLogNode,
  ]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([
    {
      id: "e1-2",
      source: "onStart",
      sourceHandle: "default",
      target: "forEach",
    },
    {
      id: "e2-3",
      source: "getter-values-1",
      sourceHandle: "value",
      target: "forEach",
      targetHandle: "array",
    },
    {
      id: "e3-4",
      source: "forEach",
      sourceHandle: "iteration",
      target: "add",
      targetHandle: "default",
    },
    {
      id: "e3-5",
      source: "forEach",
      sourceHandle: "complete",
      target: "consoleLog",
      targetHandle: "default",
    },
    {
      id: "e3-6",
      source: "forEach",
      sourceHandle: "currentItem",
      target: "add",
      targetHandle: "a",
    },
    {
      id: "e4-4",
      source: "getter-sum-1",
      sourceHandle: "value",
      target: "add",
      targetHandle: "b",
    },
    {
      id: "e4-5",
      source: "add",
      sourceHandle: "result",
      target: "setter-sum-1",
      targetHandle: "value",
    },
    {
      id: "e5-6",
      source: "getter-sum-2",
      sourceHandle: "value",
      target: "consoleLog",
      targetHandle: "value",
    },
  ]);

  const onConnect = useCallback(
    (params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  const handleExecute = () => {
    executeFlow(
      "onStart",
      nodes,
      edges,
      {
        variables: globalVariables,
        setVariable,
      },
      setNodes,
    );
  };

  const addVariableNode = (type: "getter" | "setter", variableName: string) => {
    const id = `${type}-${variableName}-${Date.now()}`;
    const newNode =
      type === "getter"
        ? createVariableGetterNode(id, variableName)
        : createVariableSetterNode(id, variableName);

    setNodes((nds) => [...nds, newNode]);
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
        <div
          className="flex flex-col"
          style={{ position: "absolute", top: 50, right: 10 }}
        >
          {Object.keys(globalVariables).map((variableName) => (
            <div key={variableName} className="flex justify-between mb-2">
              <div className="flex items-center mr-2">{variableName}</div>
              <button
                onClick={() => addVariableNode("getter", variableName)}
                className="bg-green-500 text-white px-4 py-2 rounded-lg mr-2"
              >
                + Getter
              </button>
              <button
                onClick={() => addVariableNode("setter", variableName)}
                className="bg-red-500 text-white px-4 py-2 rounded-lg"
              >
                + Setter
              </button>
            </div>
          ))}
        </div>
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
