import React, { createContext, useContext, useState } from "react";

import { File } from "../types";

interface AppContextType {
  files: File[];
  setFiles: React.Dispatch<React.SetStateAction<File[]>>;
  activeFile: File | null;
  setActiveFile: React.Dispatch<React.SetStateAction<File | null>>;
}

const AppContext = createContext<AppContextType>({
  files: [],
  setFiles: () => {},
  activeFile: null,
  setActiveFile: () => {},
});

export const AppContextProvider = AppContext.Provider;

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};
