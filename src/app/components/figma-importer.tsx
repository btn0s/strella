import { useRef } from "react";

import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { useEditorContext } from "@/app/context/editor";
import { importFromFigma } from "@/app/lib/figma";

const DEFAULT_FIGMA_URL =
  "https://www.figma.com/design/Xxad4I241zhgN0nTHalOCr/Untitled";

const FigmaImporter = () => {
  const { project, setProject } = useEditorContext();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async () => {
    const url = inputRef.current?.value;
    if (!url) return;
    const imported = await importFromFigma({ fileUrl: url });
    if (!imported) return;
    setProject({
      ...project,
      data: {
        ...project.data,
        figmaNodes: imported,
      },
    });
  };

  return (
    <div className="flex w-full items-center gap-2">
      <Input
        ref={inputRef}
        placeholder={DEFAULT_FIGMA_URL}
        defaultValue={DEFAULT_FIGMA_URL}
        className="w-full"
      />
      <Button onClick={handleSubmit} size="sm">
        Import
      </Button>
    </div>
  );
};

export default FigmaImporter;
