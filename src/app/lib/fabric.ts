import { Canvas } from 'fabric';

export const deselectActiveObject = (canvas: Canvas) => {
  canvas.discardActiveObject();
  canvas.renderAll();
};

export const deleteActiveObject = (canvas: Canvas) => {
  const activeObject = canvas.getActiveObjects();

  if (activeObject.length > 0) {
    activeObject.forEach((object) => {
      const activeObjectParent = object.group;

      if (activeObjectParent) {
        activeObjectParent.remove(object);
        canvas.remove(object);
        canvas.requestRenderAll();
        return;
      }

      canvas.remove(object);
      canvas.requestRenderAll();
    });
  }

  deselectActiveObject(canvas);
};

export const disableObjectSelection = (canvas: Canvas) => {
  canvas.forEachObject((obj) => {
    obj.selectable = false;
    obj.lockMovementX = true;
    obj.lockMovementY = true;
    obj.hoverCursor = 'default';
  });
  canvas.renderAll();
};

export const enableObjectSelection = (canvas: Canvas) => {
  canvas.forEachObject((obj) => {
    obj.selectable = true;
    obj.lockMovementX = false;
    obj.lockMovementY = false;
    obj.hoverCursor = 'default';
  });
  canvas.renderAll();
};
