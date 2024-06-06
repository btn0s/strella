import { useEffect, useState } from 'react';

import { fabric } from 'fabric';

import Panel from '@/app/components/ui/panel';
import { useEditorContext } from '@/app/context/editor-context';

const LayersPanel = () => {
  const { canvas } = useEditorContext();
  const [layers, setLayers] = useState<fabric.Object[] | null>(null);

  useEffect(() => {
    if (!canvas) return;

    const handleSelection = () => {
      setLayers(canvas.getObjects());
    };
    handleSelection();

    canvas.on('object:added', handleSelection);
    canvas.on('object:removed', handleSelection);

    return () => {
      canvas.off('object:added', handleSelection);
      canvas.off('object:removed', handleSelection);
    };
  }, []);

  return (
    <Panel>
      <p>Layers</p>
      <pre className="text-xs">{JSON.stringify(layers, null, 2)}</pre>
    </Panel>
  );
};

export default LayersPanel;
