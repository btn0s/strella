import { BrowserWindow } from "electron";
import path from "path";

import { ProjectWindowType, SProjectMetadata } from "../types";

const IS_DEV = process.env.NODE_ENV === "development";
const DEV_SERVER_URL = process.env.MAIN_WINDOW_VITE_DEV_SERVER_URL;
const VITE_NAME = process.env.MAIN_WINDOW_VITE_NAME;

const WINDOW_DIMS: Record<
  ProjectWindowType,
  {
    width: number;
    height: number;
  }
> = {
  [ProjectWindowType.FILE_BROWSER]: {
    width: 800,
    height: 600,
  },
  [ProjectWindowType.EDITOR]: {
    width: 1920,
    height: 1080,
  },
};

const activeWindows: Record<ProjectWindowType, BrowserWindow> = {
  [ProjectWindowType.FILE_BROWSER]: null,
  [ProjectWindowType.EDITOR]: null,
};

export const createFileBrowserWindow = () => {
  const window = new BrowserWindow({
    width: WINDOW_DIMS[ProjectWindowType.FILE_BROWSER].width,
    height: WINDOW_DIMS[ProjectWindowType.FILE_BROWSER].height,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  // and load the index.html of the app.
  if (IS_DEV && DEV_SERVER_URL) {
    void window.loadURL(DEV_SERVER_URL);
  } else {
    void window.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
    );
  }

  // Open the DevTools.
  window.webContents.openDevTools({ mode: "detach" });

  activeWindows[ProjectWindowType.FILE_BROWSER] = window;
};

export const createEditorWindow = (project: SProjectMetadata) => {
  const window = new BrowserWindow({
    title: `${project.name} - Strella`,
    width: WINDOW_DIMS[ProjectWindowType.EDITOR].width,
    height: WINDOW_DIMS[ProjectWindowType.EDITOR].height,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  // and load the index.html of the app.
  if (IS_DEV && DEV_SERVER_URL) {
    void window.loadURL(`${DEV_SERVER_URL}/editor/${project.id}`);
  } else {
    void window.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
      {
        hash: `/editor/${project.id}`,
      },
    );
  }

  // Open the DevTools.
  window.webContents.openDevTools();

  activeWindows[ProjectWindowType.EDITOR] = window;

  window.on("closed", () => {
    activeWindows[ProjectWindowType.EDITOR] = null;
    createFileBrowserWindow();
  });

  return window;
};
