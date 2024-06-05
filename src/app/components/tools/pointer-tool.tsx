import { FC, useCallback, useEffect } from 'react';

import { useEditorContext } from '@/app/context/editor-context';
import { deleteActiveObject, deselectActiveObject } from '@/app/lib/fabric';

const PointerTool: FC = () => {
  const { canvas } = useEditorContext();

  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!canvas) return;
      switch (e.key) {
        case 'Escape':
          deselectActiveObject(canvas);
          break;
        case 'Delete': {
          deleteActiveObject(canvas);
          break;
        }
        case 'Backspace':
          deleteActiveObject(canvas);
      }
    },
    [canvas],
  );

  useEffect(() => {
    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  return null;
};

export default PointerTool;
