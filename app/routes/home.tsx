import type { Route } from "./+types/home";
import { YjsReactFlowPOC } from "app/components/editor/yjs-reactflow-poc";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Strella POC" },
    {
      name: "description",
      content: "Strella: Visual Development Environment POC",
    },
  ];
}

export default function Home() {
  return <YjsReactFlowPOC />;
}
