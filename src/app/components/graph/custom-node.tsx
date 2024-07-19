import React, { useCallback, useEffect, useState } from "react";

import {
  Handle,
  NodeProps,
  Position,
  useHandleConnections,
  useNodeId,
  useNodesData,
  useReactFlow,
} from "@xyflow/react";

import { Button } from "@/app/components/ui/button";
import { cn } from "@/app/lib/utils";
import { CustomNodeType } from "@/types/graph";

const CustomTargetHandle = ({
  id,
  label,
  onChange,
}: {
  id: string;
  label: string;
  onChange: (value: any) => void;
}) => {
  const connections = useHandleConnections({
    type: "target",
    id,
  });

  const nodeData = useNodesData(connections?.[0].source);

  useEffect(() => {
    onChange(nodeData?.data ? nodeData.data.value : 0);
  }, [nodeData]);

  return (
    <div className="relative flex">
      <div className="text-xs pl-2 pr-6">{label}</div>
      <Handle
        id={id}
        type="target"
        position={Position.Left}
        className="!w-2 !h-2"
      />
    </div>
  );
};

const CustomSourceHandle = ({
  id,
  label,
  onChange,
}: {
  id: string;
  label: string;
  onChange: (value: any) => void;
}) => {
  const connections = useHandleConnections({
    type: "source",
    id,
  });

  const nodeData = useNodesData(connections?.[0]?.target);

  useEffect(() => {
    onChange(nodeData?.data ? nodeData.data.value : 0);
  }, [nodeData]);

  return (
    <div className="relative flex">
      <div className="text-xs pr-2 pl-6">{label}</div>
      <Handle
        id={id}
        type="source"
        position={Position.Right}
        className="!w-2 !h-2"
      />
    </div>
  );
};

const CustomNode: React.FC<NodeProps<CustomNodeType>> = ({ data }) => {
  const { updateNodeData } = useReactFlow();
  const nodeId = useNodeId();
  const nodeData = useNodesData(nodeId);

  const [showDebug, setShowDebug] = useState(false);

  useEffect(() => {
    const inputs = data.config.valueInputs.map((input) => ({
      name: input.name,
      value: undefined,
    }));
    const outputs = data.config.valueOutputs.map((output) => ({
      name: output.name,
      value: undefined,
    }));
    updateNodeData(nodeId, { inputs, outputs });
  }, []);

  return (
    <div
      className={cn("bg-card border border-border rounded-lg shadow-md", {
        "border-red-500 bg-red-50": data.status === "error",
        "border-green-500 bg-green-50": data.status === "completed",
        "border-blue-500 bg-blue-50": data.status === "running",
      })}
    >
      <div
        className={cn(
          "flex text-xs justify-between px-2 gap-6 py-1 border-b border-border",
          {
            "border-red-500": data.status === "error",
            "border-green-500": data.status === "completed",
            "border-blue-500": data.status === "running",
          },
        )}
      >
        <span className="font-mono">{data.label}</span>
        <span className="text-xs text-gray-500">{nodeId}</span>
      </div>
      <div className="flex flex-col p-2">
        <div className="relative mb-2 flex">
          <div className="flex flex-1 flex-col">
            {data.config.execInputs.map((input) => (
              <div key={input} className="relative flex h-4">
                <Handle
                  type="target"
                  position={Position.Left}
                  id={input}
                  className="!w-2 !h-2 !rounded-[3px]"
                />
              </div>
            ))}
          </div>
          <div className="flex flex-1 flex-col items-end">
            {data.config.execOutputs.map((output) => (
              <div key={output} className="relative flex h-4">
                {output !== "default" && (
                  <div className="text-xs pr-2 pl-6">{output}</div>
                )}
                <Handle
                  type="source"
                  position={Position.Right}
                  id={output}
                  className="!w-2 !h-2 !rounded-[3px]"
                />
              </div>
            ))}
          </div>
        </div>
        <div className="flex">
          <div className="flex flex-1 flex-col">
            {data.config.valueInputs.map((input, index) => (
              <CustomTargetHandle
                key={input.name}
                id={input.name}
                label={input.name}
                onChange={() => {}}
              />
            ))}
          </div>
          <div className="flex flex-col flex-1 items-end">
            {data.config.valueOutputs.map((output, index) => (
              <CustomSourceHandle
                key={output.name}
                id={output.name}
                label={output.name}
                onChange={() => {}}
              />
            ))}
          </div>
        </div>
      </div>
      <div className="flex flex-1 flex-col absolute top-full w-full gap-2 pt-2">
        <Button
          onClick={() => setShowDebug(!showDebug)}
          size="sm"
          variant="outline"
        >
          Debug
        </Button>
        {showDebug && (
          <pre className="p-1 bg-gray-50 rounded-sm text-[10px]">
            {JSON.stringify(nodeData, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
};

export default CustomNode;
