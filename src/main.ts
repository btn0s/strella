import { app, BrowserWindow, ipcMain } from "electron";
import * as fs from "node:fs";
import path from "path";

import { v4 as uuidv4 } from "uuid"; // Assume we're using UUID for generating IDs

import {
  createProject,
  deleteProject,
  getProject,
  getProjects,
  openProject,
} from "./core/files";
import { createFileBrowserWindow } from "./core/window";

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  app.quit();
}

const init = async () => {
  await app.whenReady();
  // make sure app data directory exists, if not create it
  const appDataPath = path.join(app.getPath("home"), ".strella");
  if (!fs.existsSync(appDataPath)) {
    fs.mkdirSync(appDataPath);
  }

  // Open last project
  const lastProject = getProjects().sort((a, b) => {
    return (
      new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()
    );
  })[0];

  if (lastProject) {
    void openProject(lastProject.id);
  } else {
    createFileBrowserWindow();
  }
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", init);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createFileBrowserWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

// Open a project in the editor window

ipcMain.handle("open-project", async (event, projectId) => {
  return openProject(projectId);
});

// CRUD for projects in the .strella directory.

ipcMain.handle("get-project", async (event, projectId) => {
  return getProject(projectId);
});

ipcMain.handle("get-projects", async () => {
  return getProjects();
});

ipcMain.handle("create-project", async (event, payload) => {
  return createProject(payload.projectId, payload.projectName);
});

ipcMain.handle("delete-project", async (event, projectId) => {
  return deleteProject(projectId);
});
