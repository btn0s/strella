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
      console.log("NODE DEBUG: onStart node executed");
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
      console.log("NODE DEBUG: variableGetter node executed");
      const value = globalVariables.variables[variableName];
      console.log(
        `NODE DEBUG: variableGetter node retrieved value of ${variableName}:`,
        value,
      );
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
      console.log("NODE DEBUG: variableSetter node executed");
      const value = inputs.value !== undefined ? inputs.value : 0;
      console.log(
        `NODE DEBUG: variableSetter node setting ${variableName} to`,
        value,
      );
      globalVariables.setVariable(variableName, value);
      console.log(
        `NODE DEBUG: variableSetter node set ${variableName} to`,
        value,
      );
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
      execOutputs: ["default", "iteration"],
    },
    inputs: {},
    outputs: {},
    status: "idle",
    execute: async (inputs, triggerExecutionOutput, globalVariables) => {
      console.log("NODE DEBUG: forEach node executed");
      const runLoop = async () => {
        const array = inputs.array;
        if (Array.isArray(array)) {
          array.forEach((item, index) => {
            console.log(`NODE DEBUG: forEach node item ${index}:`, item);
            triggerExecutionOutput("iteration");
          });
        } else {
          console.error(`NODE DEBUG: forEach node input is not an array`);
        }
      };
      await runLoop();
      console.log("NODE DEBUG: forEach node completed");
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
      console.log("NODE DEBUG: add node executed", { inputs });
      const result = (inputs.a || 0) + (inputs.b || 0);
      console.log(`NODE DEBUG: add node result:`, { result });
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
      console.log("NODE DEBUG: consoleLog node executed");
      console.log(`NODE DEBUG: consoleLog node value:`, inputs.value);
      return {};
    },
  },
};
