import { FC, useEffect, useRef, useState } from 'react';

import { LayoutManager, FixedLayout, Group } from 'fabric';

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

  const frameRef = useRef<Group | null>(null);

  useEffect(() => {
    if (!canvas) return;

    deselectActiveObject(canvas);
    disableObjectSelection(canvas);
    canvas.setCursor('crosshair');

    const handleMouseDown = (e) => {
      canvas.selection = false;

      const { x, y } = canvas.getScenePoint(e);
      const target = canvas.findTarget(e);

      console.log({
        x,
        y,
        target,
      });

      setStartPoint({ x, y });
      setIsDrawing(true);

      const frame = new Group([], {
        top: y,
        left: x,
        width: 0,
        height: 0,
        backgroundColor: 'white',
        fill: 'white',
        stroke: 'rgba(255,255,255,1)',
        subTargetCheck: true,
        interactive: true,
        layoutManager: new LayoutManager(new FixedLayout()),
      });

      frameRef.current = frame;

      if (target && target instanceof Group) {
        target.add(frame);
      } else {
        canvas.add(frame);
      }
    };

    const handleMouseMove = (e) => {
      canvas.setCursor('crosshair');
      if (!isDrawing || !startPoint) return;

      const { x, y } = canvas.getScenePoint(e);
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
      frameRef.current = null;
    };

    canvas.on('mouse:down', handleMouseDown);
    canvas.on('mouse:move', handleMouseMove);
    canvas.on('mouse:up', handleMouseUp);

    return () => {
      enableObjectSelection(canvas);
      canvas.setCursor('default');
      canvas.off('mouse:down', handleMouseDown);
      canvas.off('mouse:move', handleMouseMove);
      canvas.off('mouse:up', handleMouseUp);
    };
  }, [isDrawing, startPoint, canvas]);

  return null;
};

export default FrameTool;
