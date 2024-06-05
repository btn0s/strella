import { FC, useEffect, useRef, useState } from 'react';

import { CursorArrowIcon, FrameIcon } from '@radix-ui/react-icons';
import { fabric } from 'fabric';

import CameraManager from '@/app/components/camera-manager';
import ActiveLayerPropertiesPanel from '@/app/components/panels/active-layer-properties';
import ToolManager from '@/app/components/tool-manager';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/app/components/ui/accordion';
import { Button } from '@/app/components/ui/button';
import Panel from '@/app/components/ui/panel';
import {
  EditorContextProvider,
  useEditorContext,
} from '@/app/context/editor-context';
import { EToolType } from '@/app/types/editor';

const LayersPanel: FC = () => {
  const { canvas } = useEditorContext();

  return (
    <Panel>
      <p>Layers</p>
      <Accordion type="multiple">
        {canvas?.getObjects().map((layer, index) => (
          <AccordionItem key={index} value={`layer-${index}`}>
            <AccordionTrigger>{layer.type}</AccordionTrigger>
            <AccordionContent>layer-{index}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </Panel>
  );
};

const LeftToolbar: FC = () => {
  return (
    <div className="pointer-events-none absolute bottom-0 left-0 top-[30px] z-10 flex w-64 flex-col gap-4 p-6">
      <LayersPanel />
    </div>
  );
};

const RightToolbar: FC = () => {
  return (
    <div className="pointer-events-none absolute bottom-0 right-0 top-[30px] z-10 flex w-64 flex-col p-6">
      <ActiveLayerPropertiesPanel />
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
