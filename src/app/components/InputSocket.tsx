import { InputSocketSpecJSON } from "@behave-graph/core";
import { CaretRightIcon } from "@radix-ui/react-icons";
import { Connection, Handle, Position, useReactFlow } from "@xyflow/react";

import { AutoSizeInput } from "./AutoSizeInput";
import { cn } from "../lib/utils";
import { colors, valueTypeColorMap } from "../utils/colors";

export type InputSocketProps = {
  connected: boolean;
  value: any | undefined;
  onChange: (key: string, value: any) => void;
} & InputSocketSpecJSON;

export default function InputSocket({
  connected,
  value,
  onChange,
  name,
  valueType,
  defaultValue,
}: InputSocketProps) {
  const instance = useReactFlow();
  const isFlowSocket = valueType === "flow";

  let colorName = valueTypeColorMap[valueType];
  if (colorName === undefined) {
    colorName = "red";
  }

  const [backgroundColor, borderColor] = colors[colorName];
  const showName = isFlowSocket === false || name !== "flow";

  return (
    <div className="flex grow items-center justify-start h-7">
      {isFlowSocket && <CaretRightIcon />}
      {showName && <div className="capitalize mr-2">{name}</div>}
      {isFlowSocket === false && connected === false && (
        <>
          {valueType === "string" && (
            <AutoSizeInput
              type="text"
              className=" bg-gray-600 disabled:bg-gray-700 py-1 px-2 nodrag"
              value={String(value) ?? defaultValue ?? ""}
              onChange={(e) => onChange(name, e.currentTarget.value)}
            />
          )}
          {valueType === "number" && (
            <AutoSizeInput
              type="number"
              className=" bg-gray-600 disabled:bg-gray-700 py-1 px-2 nodrag"
              value={String(value) ?? defaultValue ?? ""}
              onChange={(e) => onChange(name, e.currentTarget.value)}
            />
          )}
          {valueType === "float" && (
            <AutoSizeInput
              type="number"
              className=" bg-gray-600 disabled:bg-gray-700 py-1 px-2 nodrag"
              value={String(value) ?? defaultValue ?? ""}
              onChange={(e) => onChange(name, e.currentTarget.value)}
            />
          )}
          {valueType === "integer" && (
            <AutoSizeInput
              type="number"
              className=" bg-gray-600 disabled:bg-gray-700 py-1 px-2 nodrag"
              value={String(value) ?? defaultValue ?? ""}
              onChange={(e) => onChange(name, e.currentTarget.value)}
            />
          )}
          {valueType === "boolean" && (
            <input
              type="checkbox"
              className=" bg-gray-600 disabled:bg-gray-700 py-1 px-2 nodrag"
              value={String(value) ?? defaultValue ?? ""}
              onChange={(e) => onChange(name, e.currentTarget.checked)}
            />
          )}
        </>
      )}
      <Handle
        id={name}
        type="target"
        position={Position.Left}
        className={cn(borderColor, connected ? backgroundColor : "bg-gray-800")}
        isValidConnection={(connection: Connection) =>
          isValidConnection(connection, instance)
        }
      />
    </div>
  );
}
