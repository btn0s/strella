import { useEffect, useState } from 'react';

import { fabric } from 'fabric';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/app/components/ui/accordion';
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
      <Accordion type="multiple">
        {layers?.map((layer, index) => (
          <AccordionItem key={index} value={`layer-${index}`}>
            <AccordionTrigger>{layer.type}</AccordionTrigger>
            <AccordionContent>layer-{index}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </Panel>
  );
};

export default LayersPanel;
