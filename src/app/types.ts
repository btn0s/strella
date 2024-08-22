import { GraphJSON, Registry } from "@behave-graph/core";

type BaseSceneComponent = {
  id: string;
  name: string;
  location: { x: number; y: number; z: number };
  locationType: "absolute" | "relative";
  rotation: { x: number; y: number; z: number };
  transform: { width: number; height: number };
  children: SceneComponent[];
};

export type PrimitiveSceneComponent = BaseSceneComponent & {
  type: "primitive";
  primitiveType: "h-stack" | "v-stack" | "text" | "image" | "button";
  svg?: string;
};

export type BlueprintSceneComponent = BaseSceneComponent & {
  type: "blueprint";
  blueprintId: string;
};

export type SceneComponent = PrimitiveSceneComponent | BlueprintSceneComponent;

export type GraphComponent = {
  id: string;
  name: string;
  graphJSON: GraphJSON;
  registry: Registry;
};

export interface Blueprint {
  id: string;
  name: string;
  graphData: GraphComponent[];
  sceneData: SceneComponent[];
}

export interface File {
  id: string;
  name: string;
  blueprints: Blueprint[];
}
