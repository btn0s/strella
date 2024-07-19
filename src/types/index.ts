import { ReactNode } from "react";

import { Edge } from "@xyflow/react";

export enum ProjectWindowType {
  FILE_BROWSER = "file-browser",
  EDITOR = "editor",
}

enum VariableType {
  SINGLE = "SINGLE",
  ARRAY = "ARRAY",
  MAP = "MAP",
}

interface VariableBase<T> {
  name: string;
  type: VariableType;
  value: T;
}

interface VariableSingle<T> extends VariableBase<T> {
  type: VariableType.SINGLE;
  value: T;
}

interface VariableArray<T> extends VariableBase<T[]> {
  type: VariableType.ARRAY;
  value: T[];
}

interface VariableMap<T> extends VariableBase<Record<string, T>> {
  type: VariableType.MAP;
  value: Record<string, T>;
}

type Variable<T> = VariableSingle<T> | VariableArray<T> | VariableMap<T>;

export interface SComponentData {
  variables: Record<string, Variable<any>>;
  functions: Record<string, string>;
  graphData: {
    nodes: Node[];
    edges: Edge[];
  };
  figmaNodes: any[];
}

export interface SComponent {
  id: string;
  name: string;
  data: SComponentData;
  components: SComponent[];
}

export interface SProjectMetadata {
  id: string;
  name: string;
  createdAt: string;
  lastModified: string;
}

export interface StrellaProject extends SProjectMetadata {
  components: SComponent[];
  data: SComponentData;
}

export interface StrellaFile extends SProjectMetadata {
  components: string;
  data: string;
}
