import { FC, useEffect, useState } from 'react';

import { fabric } from 'fabric';

import { Input } from '@/app/components/ui/input';
import Panel from '@/app/components/ui/panel';
import { useEditorContext } from '@/app/context/editor-context';

const PropertiesPanel: FC = () => {
  const { canvas } = useEditorContext();
  const [activeObject, setActiveObject] = useState<fabric.Object | null>(null);
  const [dimensions, setDimensions] = useState({
    left: 0,
    top: 0,
    width: 0,
    height: 0,
  });

  useEffect(() => {
    if (!canvas) return;

    const handleSelection = () => {
      const obj = canvas.getActiveObject();
      setActiveObject(obj);
      if (obj) {
        setDimensions({
          left: obj.left || 0,
          top: obj.top || 0,
          width: obj.width ? obj.width * (obj.scaleX || 1) : 0,
          height: obj.height ? obj.height * (obj.scaleY || 1) : 0,
        });
      }
    };

    const handleSelectionCleared = () => {
      setActiveObject(null);
      setDimensions({ left: 0, top: 0, width: 0, height: 0 });
    };

    canvas.on('selection:created', handleSelection);
    canvas.on('selection:updated', handleSelection);
    canvas.on('selection:cleared', handleSelectionCleared);

    return () => {
      canvas.off('selection:created', handleSelection);
      canvas.off('selection:updated', handleSelection);
      canvas.off('selection:cleared', handleSelectionCleared);
    };
  }, [canvas]);

  useEffect(() => {
    if (!activeObject || !canvas) return;

    const updateDimensions = (obj: fabric.Object) => {
      setDimensions({
        left: obj.left || 0,
        top: obj.top || 0,
        width: obj.width ? obj.width * (obj.scaleX || 1) : 0,
        height: obj.height ? obj.height * (obj.scaleY || 1) : 0,
      });
    };

    const handleObjectMoving = (e: fabric.IEvent) => {
      if (e.target) updateDimensions(e.target);
    };

    const handleObjectScaling = (e: fabric.IEvent) => {
      if (e.target) updateDimensions(e.target);
    };

    canvas.on('object:moving', handleObjectMoving);
    canvas.on('object:scaling', handleObjectScaling);

    return () => {
      canvas.off('object:moving', handleObjectMoving);
      canvas.off('object:scaling', handleObjectScaling);
    };
  }, [activeObject, canvas]);

  const handleChange =
    (property: 'left' | 'top' | 'width' | 'height') =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!activeObject || !canvas) return;
      const value = parseInt(e.target.value, 10);
      activeObject.set(property, value);
      if (property === 'width' || property === 'height') {
        activeObject.set(
          property,
          value /
            (activeObject[`scale${property === 'width' ? 'X' : 'Y'}`] || 1),
        );
      }
      canvas.requestRenderAll();
      setDimensions((prev) => ({ ...prev, [property]: value }));
    };

  return (
    <Panel>
      <p className="mb-2">Active Object</p>
      {activeObject ? (
        <div className="flex flex-col gap-2">
          {(
            [
              ['left', 'top'],
              ['width', 'height'],
            ] as const
          ).map((row) => (
            <div className="flex gap-2">
              {row.map((prop) => (
                <div key={prop} className="flex flex-col">
                  <span className="text-xs opacity-75">{prop}</span>
                  <Input
                    type="number"
                    value={dimensions[prop]}
                    onChange={handleChange(prop)}
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      ) : (
        <p className="opacity-75">No active object</p>
      )}
    </Panel>
  );
};

export default PropertiesPanel;
