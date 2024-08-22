import React, { createContext, useContext } from "react";

import { Blueprint } from "../types";

interface BlueprintContextType {
  blueprintData: Blueprint;
  activeEditor: "scene" | "graph";
  setActiveEditor: React.Dispatch<React.SetStateAction<"scene" | "graph">>;
}

const BlueprintContext = createContext<BlueprintContextType>({
  blueprintData: {} as Blueprint,
  activeEditor: "scene",
  setActiveEditor: () => {},
});

export const BlueprintContextProvider = BlueprintContext.Provider;

export const useBlueprintContext = () => {
  const context = useContext(BlueprintContext);
  if (context === undefined) {
    throw new Error(
      "useBlueprintContext must be used within a BlueprintProvider"
    );
  }
  return context;
};
