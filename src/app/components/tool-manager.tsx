import { FC, ReactNode, useCallback, useEffect } from 'react';

import FrameTool from '@/app/components/tools/frame-tool';
import PointerTool from '@/app/components/tools/pointer-tool';
import { useEditorContext } from '@/app/context/editor-context';
import { EToolType } from '@/app/types/editor';

const TOOLS: Record<
  EToolType,
  {
    shortcut: string;
    component: ReactNode;
  }
> = {
  [EToolType.POINTER]: {
    shortcut: 'P',
    component: <PointerTool />,
  },
  [EToolType.FRAME]: {
    shortcut: 'F',
    component: <FrameTool />,
  },
};

const ToolManager: FC = () => {
  const { activeTool, setActiveTool } = useEditorContext();

  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      for (const tool of Object.keys(TOOLS) as EToolType[]) {
        if (e.key.toUpperCase() === TOOLS[tool].shortcut) {
          setActiveTool(tool);
        }
      }
    },
    [setActiveTool],
  );

  useEffect(() => {
    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  return <>{TOOLS[activeTool].component}</>;
};

export default ToolManager;
