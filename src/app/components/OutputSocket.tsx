import { OutputSocketSpecJSON } from "@behave-graph/core";
import { CaretRightIcon } from "@radix-ui/react-icons";
import { Connection, Handle, Position, useReactFlow } from "@xyflow/react";

import { cn } from "../lib/utils";
import { colors, valueTypeColorMap } from "../utils/colors";
import { isValidConnection } from "../utils/isValidConnection";

export type OutputSocketProps = {
  connected: boolean;
} & OutputSocketSpecJSON;

export default function OutputSocket({
  connected,
  valueType,
  name,
}: OutputSocketProps) {
  const instance = useReactFlow();
  const isFlowSocket = valueType === "flow";
  let colorName = valueTypeColorMap[valueType];
  if (colorName === undefined) {
    colorName = "red";
  }
  const [backgroundColor, borderColor] = colors[colorName];
  const showName = isFlowSocket === false || name !== "flow";

  return (
    <div className="flex grow items-center justify-end h-7">
      {showName && <div className="capitalize">{name}</div>}
      {isFlowSocket && <CaretRightIcon className="ml-1" />}

      <Handle
        id={name}
        type="source"
        position={Position.Right}
        className={cn(borderColor, connected ? backgroundColor : "bg-gray-800")}
        isValidConnection={(connection: Connection) =>
          isValidConnection(connection, instance)
        }
      />
    </div>
  );
}
