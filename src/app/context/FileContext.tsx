import React, { createContext, useContext } from "react";

import { Blueprint, File } from "@/app/types";

interface FileContextType {
  fileData: File;
  activeBlueprint: Blueprint;
  setActiveBlueprint: (blueprint: Blueprint) => void;
  openBlueprints: Blueprint[];
  setOpenBlueprints: React.Dispatch<React.SetStateAction<Blueprint[]>>;
}

const FileContext = createContext<FileContextType>({
  fileData: {} as File,
  activeBlueprint: {} as Blueprint,
  setActiveBlueprint: () => {},
  openBlueprints: [],
  setOpenBlueprints: () => {},
});

export const FileContextProvider = FileContext.Provider;

export const useFileContext = () => {
  const context = useContext(FileContext);
  if (context === undefined) {
    throw new Error("useFileContext must be used within a FileProvider");
  }
  return context;
};
