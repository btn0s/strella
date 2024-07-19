// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from "electron";

const API = {
  getProjects: () => ipcRenderer.invoke("get-projects"),
  getProject: (projectId: string) =>
    ipcRenderer.invoke("get-project", projectId),
  createProject: (projectId: string, projectName: string) =>
    ipcRenderer.invoke("create-project", { projectId, projectName }),
  deleteProject: (projectId: string) =>
    ipcRenderer.invoke("delete-project", projectId),
  openProject: (projectId: string) => {
    console.log("opening project", projectId);
    return ipcRenderer.invoke("open-project", projectId);
  },
};

type StrellaAPI = typeof API;

declare global {
  interface Window {
    strella: StrellaAPI;
  }
}

contextBridge.exposeInMainWorld("strella", API);
