import { FC, useEffect, useRef, useState } from 'react';

import { CursorArrowIcon, FrameIcon } from '@radix-ui/react-icons';
import { Canvas } from 'fabric';

import CameraManager from '@/app/components/camera-manager';
import LayersPanel from '@/app/components/panels/layers-panel';
import PropertiesPanel from '@/app/components/panels/properties-panel';
import ToolManager from '@/app/components/tool-manager';
import { Button } from '@/app/components/ui/button';
import {
  EditorContextProvider,
  useEditorContext,
} from '@/app/context/editor-context';
import { EToolType } from '@/app/types/editor';

const LeftToolbar: FC = () => {
  return (
    <div className="pointer-events-none absolute bottom-0 left-0 top-[30px] z-10 flex w-64 flex-col gap-4 p-6">
      <LayersPanel />
    </div>
  );
};

const RightToolbar: FC = () => {
  return (
    <div className="pointer-events-none absolute bottom-0 right-0 top-[30px] z-10 flex w-64 flex-col gap-4 p-6">
      <PropertiesPanel />
    </div>
  );
};

const BottomToolbar: FC = () => {
  const { activeTool, setActiveTool } = useEditorContext();
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex items-center justify-center p-6">
      <div className="pointer-events-auto flex gap-2 rounded-lg bg-card p-2">
        <Button
          className="shadow"
          variant={activeTool === EToolType.POINTER ? 'default' : 'secondary'}
          onClick={() => {
            setActiveTool(EToolType.POINTER);
          }}
        >
          <CursorArrowIcon />
        </Button>
        <Button
          className="shadow"
          variant={activeTool === EToolType.FRAME ? 'default' : 'secondary'}
          onClick={() => {
            setActiveTool(EToolType.FRAME);
          }}
        >
          <FrameIcon />
        </Button>
      </div>
    </div>
  );
};

const Editor: FC = () => {
  const [activeTool, setActiveTool] = useState<EToolType>(EToolType.POINTER);
  const [canvas, setCanvas] = useState<Canvas | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const options = {};
    const canvas = new Canvas(canvasRef.current, options);

    setCanvas(canvas);

    return () => {
      setCanvas(null);
      canvas.dispose();
    };
  }, []);

  return (
    <EditorContextProvider
      value={{
        canvas,
        activeTool,
        setActiveTool,
      }}
    >
      <div style={{ width: '100vw', height: '100vh' }}>
        <canvas
          id="canvas"
          ref={canvasRef}
          width={window.innerWidth}
          height={window.innerHeight}
        />
        {/* Managers */}
        <CameraManager />
        <ToolManager />
        {/* Toolbars */}
        <LeftToolbar />
        <RightToolbar />
        <BottomToolbar />
      </div>
    </EditorContextProvider>
  );
};

export default Editor;
