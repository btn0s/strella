import { Node, Edge } from "@xyflow/react";

export type NodeStatus = "idle" | "running" | "completed" | "error";

export interface PortConfig {
  name: string;
  type: "string" | "number" | "boolean" | "array" | "object" | "any";
}

export interface NodeConfig {
  type: string;
  valueInputs: PortConfig[];
  valueOutputs: PortConfig[];
  execInputs: string[];
  execOutputs: string[];
}

export interface GlobalVariablesContextType {
  variables: { [key: string]: any };
  setVariable: (name: string, value: any) => void;
}

export type NodeData = {
  label: string;
  config: NodeConfig;
  status?: NodeStatus;
  inputs: { [key: string]: any };
  outputs: { [key: string]: any };
  execute: (
    inputs: { [key: string]: any },
    triggerExecutionOutput: (output: string) => Promise<void>,
    globalVariables: GlobalVariablesContextType,
  ) => Promise<{ [key: string]: any }>;
};

export type CustomNodeType = Node<NodeData>;
