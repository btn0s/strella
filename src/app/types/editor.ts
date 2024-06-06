import { Canvas } from 'fabric';

export enum EToolType {
  POINTER = 'POINTER',
  FRAME = 'FRAME',
}

export interface IFrame {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  backgroundColor: string;
  children?: IFrame[];
}

export interface IDocument {
  id: string;
  frames: IFrame[];
}

export interface IProject {
  id: string;
  name: string;
  document: IDocument;
}

export interface IEditorState {
  // project: IProject;
  canvas: Canvas | null;
  activeTool: string;
  setActiveTool: (tool: EToolType) => void;
}
