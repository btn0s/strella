import { Node, Edge } from "@xyflow/react";

import { NodeData, GlobalVariablesContextType } from "@/types/graph";

export const getNodeInputs = (
  nodeId: string,
  nodes: Node<NodeData>[],
  edges: Edge[],
): { [key: string]: any } => {
  const node = nodes.find((n) => n.id === nodeId);
  if (!node) return {};

  const inputValues: { [key: string]: any } = {};

  edges.forEach((edge) => {
    if (edge.target === nodeId) {
      const sourceNode = nodes.find((n) => n.id === edge.source);
      if (sourceNode && sourceNode.data.outputs) {
        const inputName = edge.targetHandle || "default";
        inputValues[inputName] =
          sourceNode.data.outputs[edge.sourceHandle || "default"];
      }
    }
  });

  console.log(
    `DEBUG: getNodeInputs for ${nodeId}:`,
    JSON.stringify(inputValues, null, 2),
  );
  return inputValues;
};

export const executeNode = async (
  nodeId: string,
  nodes: Node<NodeData>[],
  edges: Edge[],
  globalVariables: GlobalVariablesContextType,
  setNodes: React.Dispatch<React.SetStateAction<Node<NodeData>[]>>,
  executeNodeCallback: (nodeId: string) => Promise<void>,
): Promise<void> => {
  const node = nodes.find((n) => n.id === nodeId);
  if (!node || !node.data.execute) return;

  setNodes((nds) =>
    nds.map((n) =>
      n.id === nodeId ? { ...n, data: { ...n.data, status: "running" } } : n,
    ),
  );

  try {
    const inputs = getNodeInputs(nodeId, nodes, edges);
    node.data.inputs = inputs;

    const triggerExecutionOutput = async (output: string) => {
      const connectedEdges = edges.filter(
        (edge) => edge.source === nodeId && edge.sourceHandle === output,
      );
      for (const edge of connectedEdges) {
        await executeNodeCallback(edge.target);
      }
    };

    const outputs = await node.data.execute(
      inputs,
      triggerExecutionOutput,
      globalVariables,
    );

    setNodes((nds) =>
      nds.map((n) =>
        n.id === nodeId
          ? { ...n, data: { ...n.data, outputs, status: "completed" } }
          : n,
      ),
    );

    if (node.data.config.execOutputs.includes("default")) {
      await triggerExecutionOutput("default");
    }
  } catch (error) {
    console.error(`Error executing node ${nodeId}:`, error);
    setNodes((nds) =>
      nds.map((n) =>
        n.id === nodeId ? { ...n, data: { ...n.data, status: "error" } } : n,
      ),
    );
  }
};
