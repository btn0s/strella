import { app, BrowserWindow } from "electron";
import fs from "node:fs";
import path from "path";

import { createEditorWindow } from "../core/window";
import { SProjectMetadata } from "../types";

export const getProject = (id: string): SProjectMetadata | null => {
  const appDataPath = path.join(app.getPath("home"), ".strella");
  const projectPath = path.join(appDataPath, id);
  const projectData = fs.readFileSync(path.join(projectPath, "project.json"));
  return JSON.parse(projectData.toString());
};

export const getProjects = () => {
  const appDataPath = path.join(app.getPath("home"), ".strella");
  const projects = fs
    .readdirSync(appDataPath)
    .filter((id) => !id.startsWith("."));

  const projectMetadata: SProjectMetadata[] = projects.map((id) =>
    getProject(id),
  );

  return projectMetadata;
};

export const createProject = async (projectId: string, projectName: string) => {
  const appDataPath = path.join(app.getPath("home"), ".strella");
  const projectPath = path.join(appDataPath, projectId);
  if (!fs.existsSync(projectPath)) {
    fs.mkdirSync(projectPath);
    const projectData = {
      id: projectId,
      name: projectName,
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
    };
    fs.writeFileSync(
      path.join(projectPath, "project.json"),
      JSON.stringify(projectData),
    );
    return projectData;
  }
};

export const deleteProject = async (projectName: string) => {
  const appDataPath = path.join(app.getPath("home"), ".strella");
  const projectPath = path.join(appDataPath, projectName);
  if (fs.existsSync(projectPath)) {
    fs.rmSync(projectPath, { recursive: true });
  }
};

export const openProject = async (id: string) => {
  const fileBrowserWindow = BrowserWindow.getAllWindows()[0];
  if (fileBrowserWindow) {
    fileBrowserWindow.close();
  }

  const project = getProject(id);
  const window = createEditorWindow(project);
  void window.webContents.loadURL(`/editor/${project.id}`);
};
