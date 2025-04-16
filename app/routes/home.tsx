import type { Route } from "./+types/home";
import { YjsReactFlowPOC } from "../components/editor/YjsReactFlowPOC";

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
