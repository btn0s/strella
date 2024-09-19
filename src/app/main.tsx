import { useState, useCallback, useEffect } from "react";

import {
  DefaultLogger,
  Engine,
  ManualLifecycleEventEmitter,
  readGraphFromJSON,
  registerCoreProfile,
  registerSceneProfile,
  Registry,
  GraphJSON,
} from "@behave-graph/core";
import {
  ButtonIcon,
  HomeIcon,
  StackIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  PlayIcon,
  ViewHorizontalIcon,
  ViewVerticalIcon,
} from "@radix-ui/react-icons";
import {
  ReactFlow,
  Background,
  Controls,
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  BackgroundVariant,
  useReactFlow,
  ReactFlowProvider,
  NodeChange,
  EdgeChange,
  Edge,
  Connection,
} from "@xyflow/react";
import {
  ComponentIcon,
  DiamondIcon,
  ImageIcon,
  MoveDown,
  MoveHorizontalIcon,
  MoveVerticalIcon,
  SquareIcon,
  TextIcon,
  XIcon,
} from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./components/ui/accordion";
import { Button } from "./components/ui/button";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "./components/ui/resizable";
import { ScrollArea } from "./components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { AppContextProvider, useAppContext } from "./context/AppContext";
import {
  BlueprintContextProvider,
  useBlueprintContext,
} from "./context/BlueprintContext";
import { FileContextProvider, useFileContext } from "./context/FileContext";
import { behaveToFlow } from "./transformers/behaveToFlow";
import { flowToBehave } from "./transformers/flowToBehave";
import { Blueprint, File, SceneComponent } from "./types";
import { customNodeTypes } from "./utils/customNodeTypes";
import { getFiles } from "./utils/getFiles";

const TopBar = () => {
  const {
    fileData,
    activeBlueprint,
    setActiveBlueprint,
    openBlueprints,
    setOpenBlueprints,
  } = useFileContext();

  const handleTabChange = (id: string) => {
    const blueprint = fileData.blueprints.find((bp) => bp.id === id);
    if (blueprint) {
      setActiveBlueprint(blueprint);
    }
  };

  const closeTab = (blueprintId: string) => {
    if (blueprintId === "root") return; // Prevent closing the root tab
    setOpenBlueprints((prev) => {
      const newOpenBlueprints = prev.filter((bp) => bp.id !== blueprintId);
      if (activeBlueprint.id === blueprintId) {
        const index = prev.findIndex((bp) => bp.id === blueprintId);
        const newActiveBlueprint =
          newOpenBlueprints[index - 1] ||
          newOpenBlueprints[0] ||
          fileData.blueprints.find((bp) => bp.id === "root");
        setActiveBlueprint(newActiveBlueprint);
      }
      return newOpenBlueprints;
    });
  };

  const handleRun = async () => {
    const registry = new Registry();
    const logger = new DefaultLogger();
    const manualLifecycleEventEmitter = new ManualLifecycleEventEmitter();
    registerCoreProfile(registry, logger, manualLifecycleEventEmitter);
    registerSceneProfile(registry);

    const engines: Engine[] = [];

    // Function to create an engine for a blueprint
    const createEngine = (blueprint: Blueprint) => {
      const graphJSON = blueprint.graphData[0].graphJSON;
      const graph = readGraphFromJSON(graphJSON, registry);
      return new Engine(graph);
    };

    // Function to recursively process blueprints
    const processBlueprint = (blueprint: Blueprint) => {
      const engine = createEngine(blueprint);
      engines.push(engine);

      // Recursive function to process components and their children
      const processComponent = (component: SceneComponent) => {
        if (component.type === "blueprint") {
          const childBlueprint = fileData.blueprints.find(
            (bp) => bp.id === component.blueprintId
          );
          if (childBlueprint) {
            processBlueprint(childBlueprint);
          }
        }
        // Process children recursively
        component.children.forEach(processComponent);
      };

      // Process all components in the blueprint's scene data
      blueprint.sceneData[0].children.forEach(processComponent);
    };

    console.log(engines);

    // Start with the root blueprint
    const rootBlueprint = fileData.blueprints.find((bp) => bp.id === "root");
    if (rootBlueprint) {
      processBlueprint(rootBlueprint);
    }

    // Execute all engines
    for (const engine of engines) {
      if (manualLifecycleEventEmitter.startEvent.listenerCount > 0) {
        manualLifecycleEventEmitter.startEvent.emit();
        await engine.executeAllAsync(5);
      }

      if (manualLifecycleEventEmitter.tickEvent.listenerCount > 0) {
        const iterations = 100;
        const tickDuration = 0.01;
        for (let tick = 0; tick < iterations; tick++) {
          manualLifecycleEventEmitter.tickEvent.emit();
          engine.executeAllSync(tickDuration);
          await new Promise((resolve) =>
            setTimeout(resolve, tickDuration * 1000)
          );
        }
      }

      if (manualLifecycleEventEmitter.endEvent.listenerCount > 0) {
        manualLifecycleEventEmitter.endEvent.emit();
        await engine.executeAllAsync(5);
      }
    }
  };

  return (
    <div className="border border-b flex items-center">
      <div className="flex items-center gap-2 rounded-none px-2 pr-8 text-xs">
        {fileData.name}
      </div>
      <Tabs
        value={activeBlueprint.id}
        onValueChange={handleTabChange}
        className="flex-1 border-x"
      >
        <TabsList className="w-full justify-start rounded-none p-0">
          {openBlueprints.map((blueprint) => (
            <TabsTrigger
              key={blueprint.id}
              value={blueprint.id}
              className="rounded-none text-xs py-2 h-full gap-2"
            >
              {blueprint.id === "root" ? (
                <HomeIcon className="size-3" />
              ) : (
                <ComponentIcon className="size-3" />
              )}
              {blueprint.name}
              {blueprint.id !== "root" && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="size-4 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    closeTab(blueprint.id);
                  }}
                >
                  <XIcon className="size-3" />
                </Button>
              )}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      <div className="border-l border-border flex">
        <Button
          variant="ghost"
          className="gap-2 rounded-none text-xs"
          onClick={handleRun}
        >
          Run <PlayIcon className="size-3" />
        </Button>
      </div>
    </div>
  );
};

const PLACEHOLDER_TOOLS = [
  {
    name: "Stack",
    icon: <StackIcon className="w-4 h-4" />,
  },
  {
    name: "Text",
    icon: <TextIcon className="w-4 h-4" />,
  },
  {
    name: "Image",
    icon: <ImageIcon className="w-4 h-4" />,
  },
  {
    name: "Button",
    icon: <ButtonIcon className="w-4 h-4" />,
  },
];

const SceneEditorLeftPanelItems = () => {
  return (
    <ResizablePanel>
      <div>
        <div className="flex items-center border-b p-2 text-xs w-full">
          Tools
        </div>
        <div className="grid grid-cols-2 gap-2 p-2">
          {PLACEHOLDER_TOOLS.map((tool) => (
            <Button
              key={tool.name}
              variant="outline"
              className="w-full justify-between"
            >
              {tool.name}
              {tool.icon}
            </Button>
          ))}
        </div>
      </div>
    </ResizablePanel>
  );
};

const GraphEditorLeftPanelItems = () => {
  return (
    <>
      <ResizablePanel defaultSize={25}>
        <div>
          <div className="flex items-center border-b p-2 text-xs w-full">
            Variables
          </div>
          <pre className="text-xs p-2">
            {/* eslint-disable-next-line */}
            {"// TODO: Add variables"}
          </pre>
        </div>
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel defaultSize={25}>
        <div>
          <div className="flex items-center border-b p-2 text-xs w-full">
            Functions
          </div>
          <pre className="text-xs p-2">
            {/* eslint-disable-next-line */}
            {"// TODO: Add functions"}
          </pre>
        </div>
      </ResizablePanel>
    </>
  );
};

const COMPONENT_ICON_MAP = {
  primitive: {
    "h-stack": <MoveHorizontalIcon className="size-3" />,
    "v-stack": <MoveVerticalIcon className="size-3" />,
    text: <TextIcon className="size-3" />,
    image: <ImageIcon className="size-3" />,
    button: <ButtonIcon className="size-3" />,
  },
  blueprint: <ComponentIcon className="size-3" />,
};

const SceneComponentItem = ({
  component,
  depth = 0,
  openBlueprint,
}: {
  component: SceneComponent;
  depth?: number;
  openBlueprint: (component: SceneComponent) => void;
}) => {
  const { fileData, setActiveBlueprint, openBlueprints, setOpenBlueprints } =
    useFileContext();
  const [isExpanded, setIsExpanded] = useState(true);

  const toggleExpand = () => setIsExpanded(!isExpanded);

  const handleClick = () => {
    toggleExpand();
  };

  const handleDoubleClick = () => {
    if (component.type === "blueprint") {
      const blueprint = fileData.blueprints.find(
        (bp) => bp.id === component.blueprintId
      );
      if (blueprint) {
        setActiveBlueprint(blueprint);
        if (!openBlueprints.some((bp) => bp.id === blueprint.id)) {
          setOpenBlueprints((prev) => [...prev, blueprint]);
        }
      }
    }
  };

  return (
    <div>
      <Button
        size="sm"
        variant="ghost"
        className="w-full justify-between"
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
      >
        <span className="text-xs flex gap-2 items-center truncate">
          {component.type === "primitive"
            ? COMPONENT_ICON_MAP.primitive[component.primitiveType]
            : null}
          {component.type === "blueprint" ? COMPONENT_ICON_MAP.blueprint : null}

          {component.name}
        </span>
        {component.children.length > 0 && (
          <>
            {isExpanded ? (
              <ChevronDownIcon className="w-4 h-4" />
            ) : (
              <ChevronRightIcon className="w-4 h-4" />
            )}
          </>
        )}
      </Button>
      {isExpanded && component.children.length > 0 && (
        <div
          className="w-full py-1"
          style={{ paddingLeft: `${depth * 8 + 8}px` }}
        >
          {component.children.map((child) => (
            <SceneComponentItem
              key={child.id}
              component={child}
              depth={depth + 1}
              openBlueprint={openBlueprint}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const SceneStructure = () => {
  const { activeBlueprint, setActiveBlueprint, setOpenBlueprints } =
    useFileContext();

  const openBlueprint = (component: SceneComponent) => {
    if (component.type === "blueprint") {
      const blueprint = fileData.blueprints.find(
        (bp) => bp.id === component.blueprintId
      );
      if (blueprint) {
        setActiveBlueprint(blueprint);
        setOpenBlueprints((prev) => [...prev, blueprint]);
      }
    }
  };

  return activeBlueprint.sceneData.map((component) => (
    <SceneComponentItem
      key={component.id}
      component={component}
      openBlueprint={openBlueprint}
    />
  ));
};

const LeftPanel = () => {
  const { activeEditor } = useBlueprintContext();

  return (
    <ResizablePanel defaultSize={15} minSize={10} maxSize={20}>
      <ResizablePanelGroup direction="vertical">
        <ResizablePanel>
          <div>
            <div className="flex items-center border-b p-2 text-xs w-full">
              Scene Structure
            </div>
            <ScrollArea className="h-[300px] p-2">
              <SceneStructure />
            </ScrollArea>
          </div>
        </ResizablePanel>
        <ResizableHandle />
        {activeEditor === "scene" ? <SceneEditorLeftPanelItems /> : null}
        {activeEditor === "graph" ? <GraphEditorLeftPanelItems /> : null}
      </ResizablePanelGroup>
    </ResizablePanel>
  );
};

const RightPanel = () => {
  return (
    <ResizablePanel defaultSize={15} minSize={10} maxSize={20}>
      <div className="flex flex-col">
        <div className="flex items-center border-b p-2 text-xs w-full">
          Properties
        </div>
        <pre className="text-xs p-2">
          {/* eslint-disable-next-line */}
          {"// TODO: Add properties"}
        </pre>
      </div>
    </ResizablePanel>
  );
};

const SceneEditor = () => {
  return (
    <div className="p-2">
      {/* Add any additional scene editor content here */}
    </div>
  );
};

const GraphEditor = () => {
  const { activeBlueprint } = useFileContext();

  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);

  useEffect(() => {
    const graphComponent = activeBlueprint.graphData[0];
    const [initialNodes, initialEdges] = behaveToFlow(graphComponent.graphJSON);
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [activeBlueprint]);

  const onNodesChange = useCallback((changes: NodeChange[]) => {
    setNodes((nds) => applyNodeChanges(changes, nds));
  }, []);

  const onEdgesChange = useCallback((changes: EdgeChange[]) => {
    setEdges((eds) => applyEdgeChanges(changes, eds));
  }, []);

  const onConnect = useCallback((params: Connection) => {
    setEdges((eds) => addEdge(params, eds));
  }, []);

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={customNodeTypes}
        fitView
        fitViewOptions={{
          maxZoom: 1.5,
        }}
      >
        <Background variant={BackgroundVariant.Lines} color="#ffffff05" />
        <Controls
          position="top-right"
          orientation="horizontal"
          className="text-black"
        />
      </ReactFlow>
    </div>
  );
};

const MainContent = () => {
  const { activeEditor, setActiveEditor } = useBlueprintContext();

  return (
    <ResizablePanel className="bg-black/5">
      <Tabs
        value={activeEditor}
        onValueChange={(value) => setActiveEditor(value as "scene" | "graph")}
        className="w-full h-full"
      >
        <TabsList className="w-full justify-start border-t border-t-black rounded-none p-0 h-auto">
          <TabsTrigger value="scene" className="rounded-none text-xs py-2">
            Scene Editor
          </TabsTrigger>
          <TabsTrigger value="graph" className="rounded-none text-xs py-2">
            Graph Editor
          </TabsTrigger>
        </TabsList>
        <TabsContent value="scene" className="mt-0 h-full shadow-inner">
          <SceneEditor />
        </TabsContent>
        <TabsContent value="graph" className="mt-0 h-full shadow-inner">
          <GraphEditor />
        </TabsContent>
      </Tabs>
    </ResizablePanel>
  );
};

const BottomPanel = () => {
  const { fileData, setActiveBlueprint, openBlueprints, setOpenBlueprints } =
    useFileContext();

  const openBlueprint = (blueprint: Blueprint) => {
    setActiveBlueprint(blueprint);
    if (!openBlueprints.some((bp) => bp.id === blueprint.id)) {
      setOpenBlueprints((prev) => [...prev, blueprint]);
    }
  };

  return (
    <div className="absolute bottom-0 inset-x-0">
      <Accordion
        type="single"
        collapsible
        className="bg-background border border-border shadow-xl"
      >
        <AccordionItem value="content-drawer" className="border-none">
          <AccordionTrigger className="px-4 py-2 hover:no-underline">
            <h3 className="text-sm">Content Drawer</h3>
          </AccordionTrigger>
          <AccordionContent>
            <ScrollArea className="h-[200px]">
              <div className="p-2">
                {fileData.blueprints.map((blueprint) => (
                  <Button
                    key={blueprint.id}
                    variant="ghost"
                    className="w-full justify-start text-left"
                    onClick={() => openBlueprint(blueprint)}
                  >
                    {blueprint.name}
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

const BlueprintEditor = () => {
  const { activeBlueprint } = useFileContext();

  const [activeEditor, setActiveEditor] = useState<"scene" | "graph">("scene");

  return (
    <BlueprintContextProvider
      value={{ blueprintData: activeBlueprint, activeEditor, setActiveEditor }}
    >
      <div className="relative h-full pb-10">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          <LeftPanel />
          <ResizableHandle />
          <MainContent />
          <ResizableHandle />
          <RightPanel />
        </ResizablePanelGroup>
        <BottomPanel />
      </div>
    </BlueprintContextProvider>
  );
};

const FileEditor = () => {
  const { activeFile } = useAppContext();

  const [activeBlueprint, setActiveBlueprint] = useState<Blueprint>(
    activeFile.blueprints.find((bp) => bp.id === "root")
  );
  const [openBlueprints, setOpenBlueprints] = useState<Blueprint[]>([
    activeFile.blueprints.find((bp) => bp.id === "root"),
  ]);

  return (
    <FileContextProvider
      value={{
        fileData: activeFile,
        activeBlueprint,
        setActiveBlueprint,
        openBlueprints,
        setOpenBlueprints,
      }}
    >
      <div className="flex dark flex-col h-screen">
        <TopBar />
        <BlueprintEditor />
      </div>
    </FileContextProvider>
  );
};

const App = () => {
  const [files, setFiles] = useState<File[]>(getFiles());
  const [activeFile, setActiveFile] = useState<File>(getFiles()[0]);

  return (
    <AppContextProvider value={{ files, setFiles, activeFile, setActiveFile }}>
      <ReactFlowProvider>
        <FileEditor />
      </ReactFlowProvider>
    </AppContextProvider>
  );
};

export default App;
