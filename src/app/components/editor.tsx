import { FC, useEffect, useRef, useState } from 'react';

import { CursorArrowIcon, FrameIcon } from '@radix-ui/react-icons';
import { fabric } from 'fabric';

import CameraManager from '@/app/components/camera-manager';
import ToolManager from '@/app/components/tool-manager';
import { Button } from '@/app/components/ui/button';
import { EditorContextProvider } from '@/app/context/editor-context';
import { EToolType } from '@/app/types/editor';

const Editor: FC = () => {
  const [activeTool, setActiveTool] = useState<EToolType>(EToolType.POINTER);
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const options = {};
    const canvas = new fabric.Canvas(canvasRef.current, options);

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
        <CameraManager />
        <ToolManager />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex items-center justify-center p-6">
          <div className="pointer-events-auto flex gap-4">
            <Button
              className="shadow-2xl"
              variant={
                activeTool === EToolType.POINTER ? 'default' : 'secondary'
              }
              onClick={() => {
                setActiveTool(EToolType.POINTER);
              }}
            >
              <CursorArrowIcon />
            </Button>
            <Button
              className="shadow-2xl"
              variant={activeTool === EToolType.FRAME ? 'default' : 'secondary'}
              onClick={() => {
                setActiveTool(EToolType.FRAME);
              }}
            >
              <FrameIcon />
            </Button>
          </div>
        </div>
      </div>
    </EditorContextProvider>
  );
};

export default Editor;
