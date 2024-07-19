import React, { useCallback, useState, createContext, useContext } from "react";

import {
  ReactFlow,
  Edge,
  Connection,
  addEdge,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
  Controls,
  Background,
  BackgroundVariant,
} from "@xyflow/react";

import CustomNode from "@/app/components/graph/custom-node";
import { Button } from "@/app/components/ui/button";
import {
  onStartNode,
  createVariableGetterNode,
  createVariableSetterNode,
  forEachNode,
  addNode,
  consoleLogNode,
} from "@/core/graph/nodes";
import { GlobalVariablesContextType } from "@/types/graph";

import "@xyflow/react/dist/style.css";

const GlobalVariablesContext = createContext<GlobalVariablesContextType>({
  variables: {},
  setVariable: (name, value) => {},
});

export const useGlobalVariables = () => useContext(GlobalVariablesContext);

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
    { ...onStartNode, id: "onStart", position: { x: 36, y: -72 } },
    createVariableGetterNode("getter-values-1", "Values", { x: 36, y: 48 }),
    createVariableGetterNode("getter-sum-1", "Sum", { x: 324, y: 108 }),
    createVariableGetterNode("getter-sum-2", "Sum", { x: 900, y: 60 }),
    createVariableSetterNode("setter-sum-1", "Sum", { x: 684, y: 24 }),
    { ...forEachNode, id: "forEach-1", position: { x: 324, y: -72 } },
    { ...addNode, id: "add-1", position: { x: 552, y: 24 } },
    { ...consoleLogNode, id: "consoleLog-1", position: { x: 900, y: -72 } },
  ]);

  const [edges, setEdges, onEdgesChange] = useEdgesState([
    {
      id: "e1-2",
      source: "onStart",
      sourceHandle: "default",
      target: "forEach-1",
      targetHandle: "default",
    },
    {
      id: "e2-3",
      source: "getter-values-1",
      sourceHandle: "value",
      target: "forEach-1",
      targetHandle: "array",
    },
    {
      id: "e3-4",
      source: "forEach-1",
      sourceHandle: "iteration",
      target: "add-1",
      targetHandle: "default",
    },
    {
      id: "e3-5",
      source: "forEach-1",
      sourceHandle: "default",
      target: "consoleLog-1",
      targetHandle: "default",
    },
    {
      id: "e3-6",
      source: "forEach-1",
      sourceHandle: "currentItem",
      target: "add-1",
      targetHandle: "a",
    },
    {
      id: "e4-4",
      source: "getter-sum-1",
      sourceHandle: "value",
      target: "add-1",
      targetHandle: "b",
    },
    {
      id: "e4-5",
      source: "add-1",
      sourceHandle: "result",
      target: "setter-sum-1",
      targetHandle: "value",
    },
    {
      id: "e4-6",
      source: "add-1",
      sourceHandle: "default",
      target: "setter-sum-1",
      targetHandle: "default",
    },
    {
      id: "e5-6",
      source: "getter-sum-2",
      sourceHandle: "value",
      target: "consoleLog-1",
      targetHandle: "value",
    },
  ]);

  const onConnect = useCallback(
    (params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  type ExecutionContext = {
    nodeOutputs: { [nodeId: string]: any };
    iterationData?: any;
  };

  const handleExecute = async () => {
    const dataDependencies: { [nodeId: string]: Set<string> } = {};
    const nodeOutputs: { [nodeId: string]: any } = {};

    // Build data dependency graph
    const buildDataDependencies = (nodeId: string) => {
      if (dataDependencies[nodeId]) return;
      dataDependencies[nodeId] = new Set();

      const inputEdges = edges.filter(
        (e) => e.target === nodeId && e.targetHandle !== "default",
      );
      for (const edge of inputEdges) {
        dataDependencies[nodeId].add(edge.source);
        buildDataDependencies(edge.source);
      }
    };

    // Resolve data dependencies
    const resolveDataDependencies = async (
      nodeId: string,
      context: ExecutionContext,
    ): Promise<void> => {
      if (nodeId in context.nodeOutputs) return;

      const deps = dataDependencies[nodeId] || new Set();
      for (const depId of deps) {
        await resolveDataDependencies(depId, context);
      }

      if (!(nodeId in context.nodeOutputs)) {
        await executeNode(nodeId, false, context);
      }
    };

    const executeNode = async (
      nodeId: string,
      triggerOutputs: boolean,
      context: ExecutionContext,
    ): Promise<void> => {
      const node = nodes.find((n) => n.id === nodeId);
      if (!node) throw new Error(`Node ${nodeId} not found`);

      setNodes((nds) =>
        nds.map((n) =>
          n.id === nodeId
            ? { ...n, data: { ...n.data, status: "running" } }
            : n,
        ),
      );

      const resolveInput = async (edge: Edge) => {
        if (
          context.iterationData &&
          edge.sourceHandle in context.iterationData
        ) {
          return context.iterationData[edge.sourceHandle];
        }
        const sourceNode = nodes.find((n) => n.id === edge.source);
        if (
          sourceNode &&
          sourceNode.data.config.execOutputs.length === 0 &&
          !(edge.source in context.nodeOutputs)
        ) {
          // This is likely a getter node, execute it on demand
          await executeNode(edge.source, false, context);
        }
        return context.nodeOutputs[edge.source]?.[
          edge.sourceHandle || "default"
        ];
      };

      const inputEdges = edges.filter((e) => e.target === nodeId);
      const inputs = await Promise.all(
        inputEdges.map(async (edge) => ({
          [edge.targetHandle || "default"]: await resolveInput(edge),
        })),
      ).then((results) => Object.assign({}, ...results));

      try {
        if (node.data.config.type === "forEach") {
          const array = inputs.array;
          if (Array.isArray(array)) {
            for (let index = 0; index < array.length; index++) {
              const iterationContext: ExecutionContext = {
                nodeOutputs: { ...context.nodeOutputs },
                iterationData: { index, currentItem: array[index] },
              };

              const iterationOutputs = await node.data.execute(
                { ...inputs, ...iterationContext.iterationData },
                async (outputPort) => {
                  const outputEdges = edges.filter(
                    (e) => e.source === nodeId && e.sourceHandle === outputPort,
                  );
                  for (const edge of outputEdges) {
                    await executeNode(edge.target, true, iterationContext);
                  }
                },
                { variables: globalVariables, setVariable },
              );

              // Update the main context with the results of this iteration
              Object.assign(context.nodeOutputs, iterationContext.nodeOutputs);
              console.log(
                `Iteration ${index} of forEach node ${nodeId}. Outputs:`,
                iterationOutputs,
              );
            }
          } else {
            console.error(`ForEach input is not an array for node ${nodeId}`);
          }
        } else {
          const outputs = await node.data.execute(
            inputs,
            async (outputPort) => {
              if (triggerOutputs) {
                const outputEdges = edges.filter(
                  (e) => e.source === nodeId && e.sourceHandle === outputPort,
                );
                for (const edge of outputEdges) {
                  await executeNode(edge.target, true, context);
                }
              }
            },
            { variables: globalVariables, setVariable },
          );
          context.nodeOutputs[nodeId] = outputs;
          console.log(
            `Executed node ${nodeId}. Inputs:`,
            inputs,
            "Outputs:",
            outputs,
          );
        }

        setNodes((nds) =>
          nds.map((n) =>
            n.id === nodeId
              ? { ...n, data: { ...n.data, status: "completed" } }
              : n,
          ),
        );
      } catch (error) {
        console.error(`Error executing node ${nodeId}:`, error);
        setNodes((nds) =>
          nds.map((n) =>
            n.id === nodeId
              ? { ...n, data: { ...n.data, status: "error" } }
              : n,
          ),
        );
      }
    };

    // Main execution function
    const executeFlow = async (startNodeId: string): Promise<void> => {
      const context: ExecutionContext = { nodeOutputs: {} };
      await resolveDataDependencies(startNodeId, context);
      await executeNode(startNodeId, true, context);

      const outputEdges = edges.filter(
        (e) => e.source === startNodeId && e.sourceHandle === "default",
      );
      for (const edge of outputEdges) {
        await executeFlow(edge.target);
      }
    };

    // Start execution
    try {
      nodes.forEach((node) => buildDataDependencies(node.id));
      await executeFlow("onStart");
      console.log("Flow execution completed. Node outputs:", nodeOutputs);
    } catch (error) {
      console.error("Error during flow execution:", error);
    }
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
      <div style={{ width: "100vw", height: "100vh" }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          snapGrid={[12, 12]}
          snapToGrid
        >
          <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
          <Controls />
        </ReactFlow>
        <div className="flex gap-2 items-center justify-end absolute right-2 top-2 z-4">
          <Button
            size="sm"
            variant="outline"
            onClick={() => console.log(nodes)}
          >
            Print Nodes
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => console.log(edges)}
          >
            Print Edges
          </Button>
          <Button onClick={handleExecute} size="sm">
            Execute Flow
          </Button>
        </div>
        <div className="flex border border-gray-200 rounded-md bg-white gap-2 shadow absolute left-2 top-2 p-2 flex-col z-4">
          <h3 className="text-sm">Global Variables</h3>
          {Object.keys(globalVariables).map((variableName) => (
            <div
              key={variableName}
              className="flex justify-between gap-6 items-center p-2 rounded-md bg-neutral-100"
            >
              <div className="text-sm flex flex-col leading-none">
                <span>{variableName}</span>
                <span className="text-xs text-gray-500">
                  {JSON.stringify(globalVariables[variableName], null, 2)}
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => addVariableNode("getter", variableName)}
                  variant="outline"
                  size="sm"
                >
                  + Getter
                </Button>
                <Button
                  onClick={() => addVariableNode("setter", variableName)}
                  variant="outline"
                  size="sm"
                >
                  + Setter
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </GlobalVariablesContext.Provider>
  );
};

const FlowWithProvider: React.FC = () => (
  <ReactFlowProvider>
    <Flow />
  </ReactFlowProvider>
);

export default FlowWithProvider;
