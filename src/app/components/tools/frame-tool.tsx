import { FC, useEffect, useRef, useState } from 'react';

import { fabric } from 'fabric';

import { useEditorContext } from '@/app/context/editor-context';
import {
  deselectActiveObject,
  disableObjectSelection,
  enableObjectSelection,
} from '@/app/lib/fabric';
import { EToolType } from '@/app/types/editor';

const FrameTool: FC = () => {
  const { canvas, setActiveTool } = useEditorContext();
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(
    null,
  );

  const frameRef = useRef<fabric.Rect | null>(null);

  useEffect(() => {
    if (!canvas) return;

    deselectActiveObject(canvas);
    disableObjectSelection(canvas);
    canvas.setCursor('crosshair');

    const handleMouseDown = (e) => {
      canvas.selection = false;

      const { x, y } = canvas.getPointer(e);

      setStartPoint({ x, y });
      setIsDrawing(true);

      const frame = new fabric.Rect({
        top: y,
        left: x,
        width: 0,
        height: 0,
        backgroundColor: 'white',
        fill: 'white',
        borderScaleFactor: 1,
        borderColor: 'rgba(255,255,255,0.2)',
        hasBorders: true,
        shadow: 'rgba(0,0,0,0.2) 0px 0px 5px',
      });

      frameRef.current = frame;

      canvas.add(frame);
    };

    const handleMouseMove = (e) => {
      canvas.setCursor('crosshair');
      if (!isDrawing || !startPoint) return;
      const { x, y } = canvas.getPointer(e);
      const width = x - startPoint.x;
      const height = y - startPoint.y;

      if (frameRef.current) {
        frameRef.current.set({ width, height });
        canvas.renderAll();
      }

      canvas.selection = true;
    };

    const handleMouseUp = () => {
      if (!isDrawing || !startPoint || !frameRef.current) return;

      canvas.setActiveObject(frameRef.current);
      setActiveTool(EToolType.POINTER);

      setIsDrawing(false);
      setStartPoint(null);
    };

    canvas.on('mouse:down', function (options) {
      handleMouseDown(options);
    });
    canvas.on('mouse:move', function (options) {
      handleMouseMove(options);
    });
    canvas.on('mouse:up', function () {
      handleMouseUp();
    });

    return () => {
      enableObjectSelection(canvas);
      canvas.setCursor('default');
      canvas.off('mouse:down');
      canvas.off('mouse:move');
      canvas.off('mouse:up');
    };
  }, [isDrawing, startPoint, canvas]);

  return null;
};

export default FrameTool;
