import { Node } from "@xyflow/react";

import { NodeData } from "@/types/graph";

export const onStartNode: Node<NodeData> = {
  id: "onStart",
  type: "custom",
  position: {
    x: 0,
    y: 0,
  },
  data: {
    label: "Start",
    config: {
      type: "ON_START",
      valueInputs: [],
      valueOutputs: [],
      execInputs: [],
      execOutputs: ["default"],
    },
    inputs: {},
    outputs: {},
    status: "idle",
    execute: async (inputs, triggerExecutionOutput, globalVariables) => {
      console.log("Execution started");
      return {};
    },
  },
};

export const createVariableGetterNode = (
  id: string,
  variableName: string,
  position?: { x: number; y: number },
): Node<NodeData> => ({
  id,
  type: "custom",
  position: position ?? { x: 0, y: 0 },
  data: {
    label: `Get ${variableName}`,
    config: {
      type: "variableGetter",
      valueInputs: [],
      valueOutputs: [{ name: "value", type: "any" }],
      execInputs: [],
      execOutputs: [],
    },
    inputs: {},
    outputs: {},
    status: "idle",
    execute: async (inputs, triggerExecutionOutput, globalVariables) => {
      const value = globalVariables.variables[variableName];
      console.log(`Retrieved value of ${variableName}:`, value);
      return { value };
    },
  },
});

export const createVariableSetterNode = (
  id: string,
  variableName: string,
  position?: { x: number; y: number },
): Node<NodeData> => ({
  id,
  type: "custom",
  position: position ?? {
    x: 0,
    y: 0,
  },
  data: {
    label: `Set ${variableName}`,
    config: {
      type: "variableSetter",
      valueInputs: [{ name: "value", type: "any" }],
      valueOutputs: [{ name: "value", type: "any" }],
      execInputs: ["default"],
      execOutputs: ["default"],
    },
    inputs: {},
    outputs: {},
    status: "idle",
    execute: async (inputs, triggerExecutionOutput, globalVariables) => {
      const value = inputs.value !== undefined ? inputs.value : 0;
      globalVariables.setVariable(variableName, value);
      console.log(`Set ${variableName} to`, value);
      return { value };
    },
  },
});

export const forEachNode: Node<NodeData> = {
  id: "forEach",
  type: "custom",
  position: { x: 0, y: 0 },
  data: {
    label: "ForEach",
    config: {
      type: "forEach",
      valueInputs: [{ name: "array", type: "array" }],
      valueOutputs: [
        {
          name: "index",
          type: "number",
        },
        { name: "currentItem", type: "any" },
      ],
      execInputs: ["default"],
      execOutputs: ["complete", "iteration"],
    },
    inputs: {},
    outputs: {},
    status: "idle",
    execute: async (inputs, triggerExecutionOutput, globalVariables) => {
      const runLoop = async () => {
        const array = inputs.array;
        if (Array.isArray(array)) {
          array.forEach((item, index) => {
            console.log(`ForEach item ${index}:`, item);
            triggerExecutionOutput("iteration");
          });
          triggerExecutionOutput("complete");
        } else {
          console.error(`Input is not an array`);
        }
      };
      await runLoop();
      return {};
    },
  },
};

export const addNode: Node<NodeData> = {
  id: "add",
  type: "custom",
  position: { x: 0, y: 0 },
  data: {
    label: "Add",
    config: {
      type: "ADD",
      valueInputs: [
        { name: "a", type: "number" },
        { name: "b", type: "number" },
      ],
      valueOutputs: [{ name: "result", type: "number" }],
      execInputs: ["default"],
      execOutputs: ["default"],
    },
    inputs: {},
    outputs: {},
    status: "idle",
    execute: async (inputs, triggerExecutionOutput, globalVariables) => {
      const result = (inputs.a || 0) + (inputs.b || 0);
      triggerExecutionOutput("default");
      return { result };
    },
  },
};

export const consoleLogNode: Node<NodeData> = {
  id: "consoleLog",
  type: "custom",
  position: { x: 0, y: 0 },
  data: {
    label: "Console Log",
    config: {
      type: "CONSOLE_LOG",
      valueInputs: [{ name: "value", type: "any" }],
      valueOutputs: [],
      execInputs: ["default"],
      execOutputs: ["default"],
    },
    inputs: {},
    outputs: {},
    status: "idle",
    execute: async (inputs, triggerExecutionOutput, globalVariables) => {
      console.log("Logged value:", inputs.value);
      return {};
    },
  },
};
