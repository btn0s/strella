import { createContext, FC, PropsWithChildren, useContext } from "react";

import { StrellaProject } from "@/types";

interface EditorContext {
  project: StrellaProject;
  setProject: (project: StrellaProject) => void;
}

const EditorContext = createContext<EditorContext>(null);

export const EditorContextProvider: FC<
  PropsWithChildren<{
    value: EditorContext;
  }>
> = ({ value, children }) => {
  return (
    <EditorContext.Provider value={value}>{children}</EditorContext.Provider>
  );
};

export const useEditorContext = () => {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error(
      "useEditorContext must be used within a EditorContextProvider",
    );
  }
  return context;
};
