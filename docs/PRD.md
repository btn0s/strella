# Strella System Specification  
**Version:** 0.7  
**Product Type:** Visual Development Environment (VDE)

## Overview

Strella is the first IDE purpose-built for design engineers. It merges the visual structure of design tools with the logic and state management capabilities of programming environments. Components in Strella are authored visually, composed declaratively, and executed live via an embedded runtime—without requiring translation from design to code.

The core of Strella is its commitment to two complementary principles:

### Code-Like Authorability

- All structure, state, and logic are explicitly declared.
- Variables, layout nodes, and functions are persistently available, inspectable, and addressable.
- Runtime artifacts never replace or obscure design-time declarations.
- Authoring in Strella mirrors authoring in code: what you define is what you see.

### Design-Tool Expressiveness

- Layout can be created visually and manipulated in real time.
- Logic flows are built as node graphs that remain intuitive to non-engineers.
- Preview updates instantly reflect all structural, logic, and data changes.
- Strella encourages expressive experimentation without sacrificing engineering rigor.

Together, these principles establish Strella as a new kind of visual environment—one where structure, behavior, and state are unified.

---

## Project and Component Structure

A Strella project is a single-page React application powered by Strella’s runtime and editor environment. Projects are made up of one or more components.

Each component is a self-contained unit that defines:

- A **layout tree**: persistent visual structure
- A **graph**: executable behavior
- A **set of variables**: local state
- A set of **functions**: reusable logic returning data
- A **preview panel**: live runtime rendering of the component output

Graphs are not standalone artifacts. They are always scoped to a component or a function. Strella’s editing environment reflects this: users don’t edit graphs generically—they edit the logic inside an entity.

Components return **UI**. Functions return **data**. This distinction matches the mental model from React and is maintained consistently in both behavior and authoring tools.

---

## Layout Model

### Layout Nodes

The layout tree is defined as an array of layout nodes. Each node includes:

- A unique identifier
- A type (e.g., "Button", "Text")
- A set of props
- A list of child node references

Layout nodes declared via the design canvas or structure panel are always visible in the authored hierarchy. These nodes behave like JSX declarations: they exist before execution and are addressable in logic.

Layout nodes created imperatively via logic (e.g., from a `SpawnUIElementNode`) are **not shown in the authored structure panel**. They are rendered only at runtime (e.g., in the preview) and shown with a **distinct treatment**, such as a dimmed or ghosted visual.

This distinction preserves a clear mental boundary between design-time structure and runtime expression—just like in code, where conditionally rendered elements don’t appear in the static tree.

### Supported Layout Primitives

Strella includes the following primitive elements:

- Containers: `Page`, `VStack`, `HStack`, `ZStack`
- Leaf elements: `Text`, `Image`, `Input`, `Button`

Custom components can also be instantiated in the layout tree or via logic, and support prop binding and event wiring.

---

## Variable System

Variables in Strella are declared explicitly, and are always visible in the component’s variable panel. They can be created via:

- The "+" button in the variable sidebar
- A shortcut in the graph view (drag from a port → "store as variable")

Each variable includes:

- A name
- A type
- An optional initial value

Variables are the only persistent state between executions. They are stored per component instance and are updated via `SetVarNode` and accessed via `GetVarNode`. When a variable value changes, any bound layout props or logic consumers are updated reactively.

Variables mirror the experience of `const` or `let` in code. They are scoped, nameable, and statically present in the authoring surface.

---

## Logic Graphs

Each component (and function) contains one or more attached logic graphs.

Graphs are not first-class citizens. They are always scoped to a parent entity—either a component (which returns UI) or a function (which returns data). This structure maintains a clean mental model: users edit entities and their logic, not disembodied flows.

Graphs are composed of:

- **Nodes**, which define logic operations
- **Edges**, which connect input and output ports across nodes
- **Execution flow edges**, which define control order (thick, white lines)
- **Data flow edges**, which move values (thin, typed lines)

Graph execution begins at a known entry point: `EntryNode` for load-time logic or `EventTriggerNode` for UI-driven events. Execution proceeds through the graph using a queue-based interpreter that resolves both flow and data values.

---

## Node Types

### Control Flow Nodes

- `EntryNode`: Executes once when the component loads
- `IfNode`, `WhileNode`, `ForEachNode`: Standard logic structures
- `FunctionCallNode`: Calls a user-defined function graph, returns data

### State and Data Nodes

- `SetVarNode`, `GetVarNode`: Mutate and access variables
- Math, string, and array utility nodes: `AddNode`, `EqualsNode`, `MapArrayNode`, `ConcatNode`, etc.

### UI Composition Nodes

- `SpawnUIElementNode`: Creates a layout element at runtime
- `CreateComponentNode`: Creates a new component instance
- `AddChildNode`: Appends an element to a layout container (used at runtime only)

Note: these nodes **do not affect design-time structure** and are shown only in the runtime preview.

### Event Nodes

- `EventTriggerNode`: Responds to UI events (e.g., `onClick`)
- `EmitEventNode`: Sends data up to a parent component

---

## Function System

Functions are scoped logic graphs that return data. They have no layout and no state.

Each function includes:

- A name
- A logic graph
- A defined return type

Functions are used for computing derived values, transforming arrays, or performing stateless operations. Strella provides a set of built-in functions (e.g., math, string manipulation), and users can define their own.

Functions are invoked with the `FunctionCallNode`. Their outputs can be connected to layout bindings or used as inputs to other nodes.

This structure mirrors how functions behave in code: they are composable, reusable, and return data—not behavior or side effects.

---

## Composition

Components may instantiate and reuse other components either:

- In the static layout tree (via the structure panel or design canvas)
- In graph logic (via the `CreateComponentNode`)

Props are passed from parent to child via bound values—either static, variable-based, or logic outputs.

Child components can emit events using `EmitEventNode`, which are captured in the parent graph via `EventTriggerNode`. This creates a clean and declarative flow of interaction across nested components.

Opportunity: In the future, consider adding support for named layout “slots” to enable advanced compositional patterns similar to React’s `children` and named props. Not needed now, but it will matter as users define deeply reusable UI pieces.

---

## Events and Execution

Events originate from user interaction (e.g., clicking a button). Elements declared in the layout tree can wire events to specific nodes in the graph using `EventTriggerNode`.

Each event triggers a new execution cycle from its entry point. Event payloads (e.g., the current input value) are passed into the graph and can be used to update variables, perform logic, or spawn additional UI.

---

## Rendering Runtime

The graph execution engine produces a tree of virtual elements:

```ts
type VirtualElement = {
  type: string
  props: Record<string, any>
  children: VirtualElement[]
}
```

This output is passed to a recursive rendering function that converts it into real React elements using `React.createElement`.

Strella's preview panel shows the merged layout:

- Static structure (declared layout tree)
- Runtime-generated elements (from logic), rendered with a distinct style to indicate their ephemeral nature

This live preview is updated whenever variables, logic, or layout bindings change.

Opportunity: Consider adding the ability to diff preview output for snapshot-based debugging or test recording.

---

## Design Mode (Planned)

The layout editor is a canvas-based interface for direct manipulation of UI structure. It includes:

- Drag-and-drop primitives
- Hierarchy view
- Property sidebar with static + bound inputs
- Quick binding UI for variables and logic outputs
- Click-to-jump to graph logic for event handling

Design mode edits the persistent layout tree. Runtime-generated elements do not appear here, but may be inspectable during preview via a parallel “render tree” panel.

---

## Dynamic Node Generation

Users may define nodes from TypeScript interfaces or JSON Schemas. These definitions are parsed into typed input/output ports and produce a structured object as output.

Strella supports:

- Nested objects
- Arrays
- Optional field flattening

This system allows for fast modeling of business objects or domain-specific workflows.

---

## Serialization

All project data is serialized into a single JSON object for export or persistence:

```ts
type ProjectFile = {
  version: string
  components: Component[]
}
```

The file includes:

- Layout trees
- Variable declarations
- Logic graphs
- Functions
- Composition metadata

---

## Implementation Phases

**Phase 1: Core MVP**

- Layout tree
- Variable system
- Graph editor (React Flow)
- Queue-based executor
- Live preview runtime

**Phase 2: Interaction Layer**

- Event handling
- Input + variable bindings
- State-driven reactivity

**Phase 3: Composition and Functions**

- Nested component rendering
- Prop binding
- Event propagation
- User-defined functions

**Phase 4: Visual Design Mode**

- Canvas layout editing
- Structure panel and bindings UI
- Graph jump from events
- Runtime-authoring split view

---

## Design Principles

1. **Graph logic is always entity-scoped**. There are no free-floating graphs. Logic is always defined inside a component or function.

2. **Runtime structure is not design-time structure**. Layout created via logic does not appear in the structure panel. It exists only in preview, visually differentiated.

3. **Functions return data. Components return UI.** This mirrors React’s model and is preserved in authoring, naming, and tooling.

4. **Everything declarable is visible and nameable**. Variables and layout nodes are always inspectable. Runtime values are intentionally ephemeral.

---

## Non-Goals

- No lifecycle modeling (`useEffect`, `onDestroy`)
- No server-side rendering
- No backend integration in MVP
- No native app export
- No code generation (initially)
- No plugin system
- No multi-user collaboration