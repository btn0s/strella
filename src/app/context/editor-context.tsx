import { createContext, useContext } from 'react';

import { IEditorState } from '@/app/types/editor';

const editorContext = createContext<IEditorState | null>(null);

const { Provider: EditorContextProvider } = editorContext;

const useEditorContext = () => {
  const context = useContext(editorContext);
  if (!context) {
    throw new Error(
      'context is null, make sure the component is wrapped in the EditorContextProvider and context value is provided.',
    );
  }
  return context;
};

export { EditorContextProvider, useEditorContext };
