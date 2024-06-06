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

export const disableObjectSelection = (canvas: fabric.Canvas) => {
  canvas.forEachObject((obj) => {
    obj.selectable = false;
    obj.lockMovementX = true;
    obj.lockMovementY = true;
    obj.hoverCursor = 'default';
  });
  canvas.renderAll();
};

export const enableObjectSelection = (canvas: fabric.Canvas) => {
  canvas.forEachObject((obj) => {
    obj.selectable = true;
    obj.lockMovementX = false;
    obj.lockMovementY = false;
    obj.hoverCursor = 'default';
  });
  canvas.renderAll();
};
