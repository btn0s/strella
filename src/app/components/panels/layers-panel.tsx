import { useEffect, useState } from 'react';

import { FabricObject } from 'fabric';

import Panel from '@/app/components/ui/panel';
import { useEditorContext } from '@/app/context/editor-context';

const LayersPanel = () => {
  const { canvas } = useEditorContext();
  const [layers, setLayers] = useState<FabricObject[] | null>(null);

  useEffect(() => {
    if (!canvas) return;

    const handleSelection = () => {
      console.log('canvas.getObjects()', canvas.getObjects());
      setLayers(canvas.getObjects());
    };
    handleSelection();

    canvas.on('object:added', handleSelection);
    canvas.on('object:removed', handleSelection);

    return () => {
      canvas.off('object:added', handleSelection);
      canvas.off('object:removed', handleSelection);
    };
  }, [canvas]);

  return (
    <Panel className="max-h-[300px]">
      <p>Layers</p>
      <pre className="text-xs">{JSON.stringify(layers, null, 2)}</pre>
    </Panel>
  );
};

export default LayersPanel;
