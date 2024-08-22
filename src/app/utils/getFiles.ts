import { Registry, registerCoreProfile } from "@behave-graph/core";
import { v4 as uuidv4 } from "uuid";

import { behaveToFlow } from "../transformers/behaveToFlow";
import { flowToBehave } from "../transformers/flowToBehave";
import { File, Blueprint } from "../types";

export const getFiles = (): File[] => {
  const registry = new Registry();
  registerCoreProfile(registry);

  // Root Blueprint: Todo List Manager
  const todoListGraphJSON = {
    nodes: [
      {
        type: "lifecycle/onStart",
        id: "1",
        flows: { flow: { nodeId: "2", socket: "flow" } },
        metadata: { positionX: "0", positionY: "0" },
      },
      {
        type: "debug/log",
        id: "2",
        parameters: { text: { value: "Todo List Started" } },
        metadata: { positionX: "200", positionY: "0" },
      },
    ],
  };

  const [rootNodes, rootEdges] = behaveToFlow(todoListGraphJSON);
  const rootBehaveGraphJSON = flowToBehave(rootNodes, rootEdges);

  // Child Blueprint: Todo Item
  const todoItemGraphJSON = {
    nodes: [
      {
        type: "lifecycle/onStart",
        id: "1",
        flows: { flow: { nodeId: "2", socket: "flow" } },
        metadata: { positionX: "0", positionY: "0" },
      },
      {
        type: "debug/log",
        id: "2",
        parameters: { text: { value: "Todo Item Started" } },
        metadata: { positionX: "200", positionY: "0" },
      },
    ],
  };

  const [childNodes, childEdges] = behaveToFlow(todoItemGraphJSON);
  const childBehaveGraphJSON = flowToBehave(childNodes, childEdges);

  const rootBlueprint: Blueprint = {
    id: "root",
    name: "Todo List Manager",
    sceneData: [
      {
        id: uuidv4(),
        name: "Main Scene",
        type: "primitive",
        primitiveType: "v-stack",
        children: [
          {
            id: uuidv4(),
            name: "Top Bar",
            type: "primitive",
            primitiveType: "h-stack",
            children: [
              {
                id: uuidv4(),
                name: "Todo List Title",
                type: "primitive",
                primitiveType: "text",
                children: [],
                location: { x: 0, y: 0, z: 0 },
                locationType: "relative",
                rotation: { x: 0, y: 0, z: 0 },
                transform: { width: 100, height: 50 },
              },
              {
                id: uuidv4(),
                name: "Add Todo Button",
                type: "primitive",
                primitiveType: "button",
                children: [],
                location: { x: 0, y: 60, z: 0 },
                locationType: "relative",
                rotation: { x: 0, y: 0, z: 0 },
                transform: { width: 100, height: 40 },
              },
            ],
            location: { x: 0, y: 0, z: 0 },
            locationType: "relative",
            rotation: { x: 0, y: 0, z: 0 },
            transform: { width: 100, height: 100 },
          },
          {
            id: uuidv4(),
            name: "Todo Items Container",
            type: "primitive",
            primitiveType: "v-stack",
            children: [
              {
                id: uuidv4(),
                name: "Todo Item 1",
                type: "blueprint",
                blueprintId: "child1",
                children: [],
                location: { x: 0, y: 0, z: 0 },
                locationType: "relative",
                rotation: { x: 0, y: 0, z: 0 },
                transform: { width: 100, height: 40 },
              },
            ],
            location: { x: 0, y: 110, z: 0 },
            locationType: "relative",
            rotation: { x: 0, y: 0, z: 0 },
            transform: { width: 100, height: 200 },
          },
        ],
        location: { x: 0, y: 0, z: 0 },
        locationType: "absolute",
        rotation: { x: 0, y: 0, z: 0 },
        transform: { width: 100, height: 100 },
      },
    ],
    graphData: [
      {
        id: uuidv4(),
        name: "Todo List Manager",
        graphJSON: rootBehaveGraphJSON,
        registry: registry,
      },
    ],
  };

  const childBlueprint: Blueprint = {
    id: "child1",
    name: "Todo Item",
    sceneData: [
      {
        id: uuidv4(),
        name: "Todo Item Scene",
        type: "primitive",
        primitiveType: "h-stack",
        children: [
          {
            id: uuidv4(),
            name: "Todo Text",
            type: "primitive",
            primitiveType: "text",
            children: [],
            location: { x: 0, y: 0, z: 0 },
            locationType: "relative",
            rotation: { x: 0, y: 0, z: 0 },
            transform: { width: 80, height: 30 },
          },
          {
            id: uuidv4(),
            name: "Edit Button",
            type: "primitive",
            primitiveType: "button",
            children: [],
            location: { x: 85, y: 0, z: 0 },
            locationType: "relative",
            rotation: { x: 0, y: 0, z: 0 },
            transform: { width: 30, height: 30 },
          },
        ],
        location: { x: 0, y: 0, z: 0 },
        locationType: "relative",
        rotation: { x: 0, y: 0, z: 0 },
        transform: { width: 100, height: 40 },
      },
    ],
    graphData: [
      {
        id: uuidv4(),
        name: "Todo Item",
        graphJSON: childBehaveGraphJSON,
        registry: registry,
      },
    ],
  };

  const todoListFile: File = {
    id: uuidv4(),
    name: "Todo List Project",
    blueprints: [rootBlueprint, childBlueprint],
  };

  return [todoListFile];
};