**Strella Technical Specification v1.1**, fully aligned with your latest architectural decisions:

- Using **Vite + React** as the core stack  
- Using **ShadCN UI + Tailwind** for styling  
- Using **React Router** to support **Figma-style deep linking**  
- Supporting eventual **desktop deployment** (Electron/Tauri-ready)  
- Maintaining the philosophy of **entity-scoped logic**, **code-like declarations**, and **design-tool expressiveness**

---

# Strella Technical Specification  
**Version:** v1.1  
**Type:** Engineering Blueprint  
**Target:** Web-first VDE with future desktop deployment

---

## 0. Guiding Principles

1. **Entity-Scoped Logic:** Graphs are always attached to components or functions—never free-floating.  
2. **Code-Like Authorability:** Structure and state are explicitly declared and always visible.  
3. **Design-Tool Expressiveness:** Layout and behavior are authored visually, and logic flows are intuitive to non-engineers.  
4. **URL-As-State Model:** App state is reflected in the URL (à la Figma) using React Router.  
5. **Cross-Platform Portability:** No SSR or Next.js features—Strella runs equally well in web and desktop environments.

---

## 1. Runtime Stack

- **Vite + React + TypeScript**
- **Tailwind CSS + shadcn**
- **React Router v7** for navigation + deep linking  
- **Zustand** for internal editor state  
- **Local file-based serialization** (browser: localStorage, desktop: file I/O)

---

## 2. Routing Model

Strella follows a **Figma-style URL structure** to enable navigation, sharing, and session persistence.

### Example URL

```
/component/1234/graph?node=5678&panel=variables
```

### Route Schema

| Segment                  | Purpose                        |
|--------------------------|--------------------------------|
| `/component/:id`         | Load a specific component      |
| `/:mode`                 | Mode: `graph`, `design`, `preview` |
| `?node=5678`             | Select specific graph node     |
| `?panel=variables`       | Open specific UI panel         |

This is managed via **React Router**, using:

- `useParams()` for path values
- `useSearchParams()` for transient UI state

---

## 3. Component System

Each component consists of:

- **Layout tree** (declared structure)  
- **Graph** (behavior logic)  
- **Variable store** (state)  
- **Functions** (pure logic units)  
- **Attached route state** (via `componentId` in URL)

```ts
interface Component {
  id: string;
  name: string;
  layout: LayoutNode[];
  graph: Graph;
  functions: Record<string, FunctionDefinition>;
  variables: VariableDefinition[];
}
```

---

## 4. Layout Runtime

### LayoutNode

```ts
interface LayoutNode {
  id: string;
  type: string; // "Text", "Button", etc.
  props: Record<string, any>;
  children: LayoutNode[];
}
```

### Runtime Layout Tree

- Combines declared layout + graph-spawned nodes
- Dynamic nodes are marked `runtimeOnly: true`
- Preview panel renders the full tree using `React.createElement()`

---

## 5. Graph Execution Engine

### Node Evaluation Lifecycle

1. **Input resolution**  
2. **Node `evaluate()` call**  
3. **Output propagation**  
4. **Queue next node(s)**

### Execution Queue

- FIFO queue per graph run
- Each node may enqueue successors
- Supports suspension for async nodes (`wait`, `fetch`, etc.)

### Execution Context

```ts
interface ExecutionContext {
  componentId: string;
  variables: Map<string, any>;
  props: Record<string, any>;
  eventPayload?: any;
}
```

---

## 6. Node and Port Schema

### Node

```ts
interface Node {
  id: string;
  type: string;
  data: Record<string, any>;
  ports: {
    inputs: Port[];
    outputs: Port[];
  };
}
```

### Port

```ts
interface Port {
  id: string;
  label: string;
  type: 'number' | 'string' | 'boolean' | 'object' | 'array';
  portType: 'data' | 'execution';
  direction: 'input' | 'output';
}
```

---

## 7. Variable System

- Variables are declared per component  
- Stored in a scoped `VariableStore`  
- Updated via `SetVarNode`, accessed via `GetVarNode`  
- Layout props can bind to variable values  

```ts
interface VariableDefinition {
  name: string;
  type: string;
  initialValue: any;
}
```

---

## 8. Function System

- Logic-only graphs returning a single data value  
- May be invoked via `FunctionCallNode`  
- Functions are stateless, have no access to layout

```ts
interface FunctionDefinition {
  name: string;
  graph: Graph;
  inputs: Record<string, string>;
  returnType: string;
}
```

---

## 9. Event System

- Layout elements can define handlers (`onClick`, etc.)  
- Events map to `EventTriggerNode` in the graph  
- Payload passed as execution context input

---

## 10. Renderer

### Virtual Layout Element

```ts
interface VirtualElement {
  type: string;
  props: Record<string, any>;
  children: VirtualElement[];
}
```

### Render Pipeline

- Merges authored layout and runtime output  
- Resolved into React elements via `React.createElement()`  
- Runtime-only elements receive ghost styling in preview

---

## 11. React Router + App State Sync

- Route params (e.g. `componentId`, `mode`) determine active editor context  
- Search params (e.g. `node=123`) sync selection state  
- State updates reflect in the URL  
- URL loads drive initial app state

---

## 12. Serialization

```ts
interface ProjectFile {
  version: string;
  components: Component[];
}
```

Includes:
- Layout
- Graphs
- Variables
- Functions
- Metadata (e.g. labels, timestamps)

---

## 13. Devtools

Planned features:
- Node execution trace overlay  
- Variable watch panel  
- Layout tree inspector (design vs. runtime)  
- Route-driven “deep link to bug” for debugging

---

## 14. Packaging and Portability

- Web app: built via Vite, deployed to static hosting or localhost
- Desktop: packaged via Electron or Tauri
- All system code (graph engine, layout builder) is framework-agnostic and portable

---

## 15. Implementation Phases

### Phase 1 – Runtime MVP
- Graph engine  
- Layout tree renderer  
- Variable store  
- React Router basic shell  

### Phase 2 – Graph + Variable Editing
- Node kit  
- Variable panel  
- Execution view  
- Graph → layout integration

### Phase 3 – Component Reuse + Functions
- Component instantiation  
- Prop mapping  
- Function authoring  
- Project explorer

### Phase 4 – Visual Design Mode
- Layout canvas  
- Drag/drop primitives  
- Prop editor  
- Structure tree  
- Runtime vs. authored view

---

## 16. Core Design Principles (Enforced)

| Principle                         | System Behavior                                                          |
|----------------------------------|---------------------------------------------------------------------------|
| Graphs are entity-scoped         | Always belong to a component or function                                 |
| Layout is declarative            | Declared layout is always visible in the structure panel                 |
| Runtime UI is ephemeral          | Only appears in preview; ghosted visuals                                 |
| URL reflects editor state        | Synced via React Router, not internal-only state                         |
| Variables are nameable + scoped  | Always declared and addressable; no hidden memory                        |
| Functions return data            | Cannot spawn UI or mutate component state                                |