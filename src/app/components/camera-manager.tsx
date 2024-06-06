import { useEffect, useState } from 'react';

import { Point } from 'fabric';

import { useEditorContext } from '@/app/context/editor-context';

const CameraManager = () => {
  const { canvas } = useEditorContext();
  const [isDragging, setIsDragging] = useState(false);
  const [lastPosX, setLastPosX] = useState(0);
  const [lastPosY, setLastPosY] = useState(0);

  useEffect(() => {
    if (!canvas) return;

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 2) {
        // Middle mouse button
        setIsDragging(true);
        canvas.selection = false;
        setLastPosX(e.clientX);
        setLastPosY(e.clientY);
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const vpt = canvas.viewportTransform;
        if (vpt) {
          vpt[4] += e.clientX - lastPosX;
          vpt[5] += e.clientY - lastPosY;
          canvas.requestRenderAll();
          setLastPosX(e.clientX);
          setLastPosY(e.clientY);
          canvas.setViewportTransform(vpt);
        }
      }
    };

    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        canvas.selection = true;
        const vpt = canvas.viewportTransform;
        if (vpt) {
          canvas.setViewportTransform(vpt);
        }
      }
    };

    const handleWheel = (e: WheelEvent) => {
      const vpt = canvas.viewportTransform;
      if (e.altKey) {
        // Zoom with Alt key
        const delta = e.deltaY;
        let zoom = canvas.getZoom();
        zoom *= 0.999 ** delta;
        if (zoom > 20) zoom = 20;
        if (zoom < 0.1) zoom = 0.1;
        canvas.zoomToPoint(new Point(e.offsetX, e.offsetY), zoom);
      } else if (vpt) {
        // Pan with default wheel
        vpt[4] -= e.deltaX;
        vpt[5] -= e.deltaY;
        canvas.requestRenderAll();
        canvas.setViewportTransform(vpt);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '0') {
        canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
      }
    };

    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('wheel', handleWheel);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [canvas, isDragging, lastPosX, lastPosY]);

  return null;
};

export default CameraManager;
