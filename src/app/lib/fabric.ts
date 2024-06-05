import { fabric } from 'fabric';

export const deselectActiveObject = (canvas: fabric.Canvas) => {
  canvas.discardActiveObject();
  canvas.renderAll();
};

export const deleteActiveObject = (canvas: fabric.Canvas) => {
  const activeObject = canvas.getActiveObjects();

  if (activeObject) {
    activeObject.forEach((object) => {
      canvas.remove(object);
    });
  }

  deselectActiveObject(canvas);
};
