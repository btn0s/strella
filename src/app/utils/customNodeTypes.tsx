import { NodeTypes } from "@xyflow/react";

import { getNodeSpecJSON } from "./getNodeSpecJSON";
import { Node } from "../components/Node";

const spec = getNodeSpecJSON();

export const customNodeTypes = spec.reduce((nodes, node) => {
  nodes[node.type] = (props) => <Node spec={node} {...props} />;
  return nodes;
}, {} as NodeTypes);
