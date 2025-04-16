**Strella Technical Specification v1.3**, fully aligned with your latest architectural decisions:

- Using **Vite + React** as the core stack  
- Using **React Flow** for graph visualization and interaction  
- Using **ShadCN UI + Tailwind** for styling  
- Using **React Router** for **Figma-style deep linking** to specific components/nodes
- Implementing a **Local-First Architecture** using **CRDTs (e.g., Yjs)** for state management and real-time sync
- Utilizing a **Lightweight WebSocket Server** for relaying CRDT updates
- Supporting eventual **desktop deployment** (Electron/Tauri-ready)  
- Maintaining the philosophy of **entity-scoped logic**, **code-like declarations**, and **design-tool expressiveness**

---

# Strella Technical Specification  
**Version:** v1.3  
**Type:** Engineering Blueprint  
**Target:** Local-First VDE with Real-time Collaboration using React Flow

## Initial Scope & Focus

This specification targets an initial vertical slice implementation focused on TODO app complexity:

- **User Capabilities:** Creating and editing simple interactive components (2-3 node types)
- **Scale:** Supporting small graphs (10-20 nodes) initially
- **Collaboration:** 2-user real-time editing via WebRTC
- **UI Complexity:** Structure Panel with click-to-add elements and basic Property Panel
- **Data Model:** Simplified CRDT structure focused on essential elements

The implementation follows a progressive enhancement approach, starting with simpler versions of each system component and adding complexity only as needed to support user capabilities. This ensures rapid validation of core architectural assumptions without getting distracted by advanced features.

---

## 0. Guiding Principles

1. **Local-First:** The user's local file is the source of truth. Full offline functionality is required.
2. **Real-time Collaboration:** Changes sync automatically and efficiently between collaborators when online.
3. **CRDT-Powered:** Conflict-free Replicated Data Types manage all shared project state, ensuring eventual consistency.
4. **Entity-Scoped Logic:** Graphs are always attached to components or functions.
5. **Code-Like Authorability:** Structure and state are explicitly declared and managed via CRDTs.
6. **Design-Tool Expressiveness:** Layout and behavior are authored visually.
7. **URL for Navigation:** The URL reflects the current *navigational* context (e.g., open component, view mode), but not necessarily the entire collaborative state.
8. **Cross-Platform Portability:** Core logic runs equally well in web and desktop environments.

---

## 1. Runtime Stack

- **Framework/UI:** Vite + React + TypeScript
- **Graph UI Library:** **React Flow** (for rendering nodes, edges, handling graph interactions)
- **Styling:** Tailwind CSS + shadcn/ui
- **Routing:** React Router v7 (for navigation/deep-linking)
- **Shared State Management:** **Yjs (or similar CRDT library)** for all shared project data (layout, graph structure, variables, etc.). Yjs is the source of truth.
- **CRDT Persistence (Client):**
    - **Web:** `y-indexeddb` (or similar) for caching/offline storage.
    - **Desktop:** Direct file system access (via Electron/Tauri APIs) to load/save the project file snapshot.
    - **Mechanism:** Saving involves serializing the Yjs document state; loading involves deserializing it.
- **Real-time Sync (Client):** **`y-websocket`** provider connecting to the sync server.
- **Transient Local UI State:** Zustand (Optional). Used *strictly* for ephemeral, non-collaborative, non-persisted UI state specific to the local user session. Examples: visibility state of UI panels, current tool selection *if not collaborative*, local-only viewport state *if not managed by Yjs Awareness*. **All project data, component structure, graph logic, variables, and collaborative state MUST reside within the Yjs CRDT document.**

---

## 2. Routing Model

Strella uses React Router primarily for **navigating** between different parts of the application (components, modes) and **deep-linking**. Shared collaborative state (like specific node selections or transient UI states shared across users) should ideally be managed via the CRDT model (e.g., using Yjs awareness protocol) rather than URL search parameters to avoid overly complex URLs and potential state conflicts.

### Example URL (Focus on Navigation)

```
/component/component-uuid-123/graph
```

### Route Schema

| Segment              | Purpose                               |
|----------------------|---------------------------------------|
| `/component/:id`     | Load/Focus a specific component       |
| `/:mode`             | Editor Mode: `graph`, `design`, `preview` |

- `useParams()` retrieves the component ID and mode.
- Other collaborative states (selections, presence) managed by CRDT awareness.

---

## 3. Component System

*(Note: Underlying data structures managed by CRDTs, e.g., a Y.Map for the component registry, Y.Map for each component's properties)*

Each component consists of:

- **Layout tree** (CRDT representation, e.g., Y.Array of Y.Maps)
- **Graph** (CRDT representation, e.g., Y.Map containing nodes and edges)
- **Variable store** (CRDT representation, e.g., Y.Map)
- **Functions** (CRDT representation, e.g., Y.Map)

```ts
// Conceptual Interface - actual data held in Yjs types
interface Component {
  id: string;
  name: string; // Likely Y.Text or primitive
  layout: Y.Array<Y.Map<any>>; // Represents LayoutNode structure
  graph: Y.Map<any>; // Represents Graph structure
  functions: Y.Map<Y.Map<any>>; // Represents FunctionDefinition map
  variables: Y.Map<any>; // Represents VariableDefinition map
}
```

---

## 4. Layout Runtime

*(Note: LayoutNode structure is represented and modified using CRDTs)*

### LayoutNode (Conceptual)

```ts
// Conceptual Interface - actual data held in Y.Map
interface LayoutNode {
  id: string; // Unique ID within the document
  type: string; // "Text", "Button", etc.
  props: Y.Map<any>; // Props stored in a CRDT Map
  children: Y.Array<Y.Map<any>>; // Child nodes in a CRDT Array
}
```

### Runtime Layout Tree

- Renderer reads directly from the CRDT layout structure.
- Combines declared layout + graph-spawned nodes (dynamic nodes marked `runtimeOnly: true`, potentially via a flag in their Y.Map).
- Preview panel renders the full tree using `React.createElement()` derived from CRDT state.

---

## 5. Graph Execution Engine (Simplified Initial Approach)

*(Note: Graph structure (nodes, edges, data) managed by CRDTs. Execution reads from the CRDT state.)*

### Initial Synchronous Execution Model

For the initial implementation focused on TODO app complexity, we'll use a simpler synchronous execution model:

1. **Direct CRDT State Access** - Read values directly from the CRDT document rather than using snapshots
2. **Sequential Evaluation** - Process nodes in a deterministic order using a simple queue
3. **Synchronous Operations** - Focus on operations that complete immediately before moving to the next node

```ts
// Simple initial execution model
function executeGraph(entryNodeId, yjsDoc) {
  const visited = new Set();
  const queue = [entryNodeId];
  
  while (queue.length > 0) {
    const nodeId = queue.shift();
    if (visited.has(nodeId)) continue;
    visited.add(nodeId);
    
    const nodeData = getNodeFromYjs(yjsDoc, nodeId);
    const outputs = evaluateNode(nodeData, yjsDoc);
    
    // Get outgoing edges and add target nodes to queue
    const outgoingEdges = getOutgoingEdgesFromYjs(yjsDoc, nodeId);
    for (const edge of outgoingEdges) {
      queue.push(edge.target);
    }
  }
}
```

### Future Advanced Execution Context

As the application grows in complexity, the execution engine will evolve to include:

- **Snapshot-based state** for consistent execution across concurrent edits
- **Advanced queue with priority handling** for more complex control flows
- **Asynchronous node operations** while maintaining execution integrity

```ts
interface ExecutionContext {
  componentId: string;
  variablesSnapshot: Map<string, any>; // Snapshot of variable state
  propsSnapshot: Record<string, any>; // Snapshot of component props
  eventPayload?: any;
  crdtDoc: Y.Doc; // Access to the main CRDT doc for mutations
}
```

This progressive approach ensures we can validate core concepts quickly with a simpler implementation before adding complexity for advanced use cases.

---

## 6. Node and Port Schema

*(Note: Node structure and data managed by CRDTs, e.g., a Y.Map per node. This data is mapped to React Flow's `Node` objects.)*

### Node (Conceptual)

```ts
// Conceptual Interface - actual data held in Y.Map
interface Node {
  id: string;
  type: string; // Corresponds to React Flow custom node type
  position: { x: number, y: number }; // Stored in Y.Map, drives React Flow node position
  data: Y.Map<any>; // Node-specific configuration, passed to React Flow custom node component
  // Port definitions static based on node type; connections stored in graph edges CRDT
}
```

- **React Flow Mapping:** The Yjs data for each node is mapped to the `data` prop of the corresponding React Flow `Node`. The `position` from Yjs directly maps to the React Flow `Node` position.
- **Ports/Handles:** Custom React Flow node components (`nodeTypes`) will use the `<Handle>` component to render connection points based on the node's static type definition.

Performance monitoring for the React Flow rendering, especially under heavy CRDT load (many nodes/edges or frequent updates), will be crucial. Optimization strategies such as node/edge virtualization (rendering only visible elements), debouncing/throttling state updates passed to React Flow, and optimizing the `useYjsReactFlowBridge` hook should be considered and benchmarked as the application scales.

---

## 7. Variable System

*(Note: Variable definitions and potentially their runtime values managed by CRDTs, e.g., a Y.Map for definitions, another Y.Map for runtime values if preview is collaborative)*

- Variables declared per component, stored in a CRDT Map.
- Updated via `SetVarNode` (which performs a CRDT update), accessed via `GetVarNode` (which reads from the CRDT).
- Layout props bind reactively to CRDT variable state changes.

```ts
// Conceptual Interface - actual data held in Y.Map
interface VariableDefinition {
  name: string;
  type: string;
  initialValue: any;
}
```

---

## 8. Function System

*(Note: Function definitions and their internal graphs managed by CRDTs)*

- Logic-only graphs returning a single data value.
- Stored within the component's CRDT structure.
- Invoked via `FunctionCallNode`.

```ts
// Conceptual Interface - actual data held in Y.Map
interface FunctionDefinition {
  name: string;
  graph: Y.Map<any>; // CRDT representation of the function graph
  inputs: Record<string, string>; // Static definition
  returnType: string; // Static definition
}
```

---

## 9. Event System

*(Note: Event triggers initiate graph execution which operates on CRDT state)*

- Layout elements (defined in CRDTs) have handlers (`onClick`, etc.).
- Events map to `EventTriggerNode` in the graph (defined in CRDTs).
- Payload passed into execution context.

---

## 10. Graph Renderer (React Flow)

- The graph UI is rendered using the `<ReactFlow>` component.
- **Controlled Component:** React Flow operates in a fully controlled manner. The `nodes` and `edges` props passed to `<ReactFlow>` are derived directly from the Yjs CRDT state via the synchronization layer (See Section 12).
- **Custom Nodes/Edges (`nodeTypes`, `edgeTypes`):** Custom React components are defined for different node and edge types.
    - These components receive node/edge data (originating from Yjs) via props (`NodeProps`, `EdgeProps`).
    - They render the visual representation (using HTML/SVG, styled with Tailwind/CSS).
    - They use `<Handle>` components to define connection points.
    - Interactions within custom nodes (e.g., editing text in an input) directly trigger Yjs updates via the adapter layer.
- **Rendering:** React Flow handles SVG rendering, node positioning (based on props), edge routing, zooming, and panning.

---

## 11. React Router + App State Sync (Revised)

- React Router handles *navigation* (selecting component, view mode).
- CRDTs (Yjs) handle the *collaborative project state* (content, structure, selections, presence).
- UI binds directly to CRDT data.
- Loading a route triggers loading the corresponding component data into the main CRDT structure.
- **React Flow Viewport State:**
    - **Decision:** Viewport state (zoom, pan) will initially be **local** to each user (managed by React Flow internally or via Zustand if needed) to simplify initial implementation.
    - **Future:** Collaborative viewport syncing can be added later using the Yjs Awareness protocol if required.

### Synchronization Error Handling & Recovery
The client must handle sync provider errors gracefully. This includes: displaying connection status indicators (connecting, online, offline, error); implementing automatic reconnection attempts with backoff for transient network issues; using Yjs state vectors on reconnect to efficiently fetch only missing updates; potentially detecting persistent divergence (e.g., via checksums or versioning if necessary, though CRDTs aim to prevent this) and notifying the user, possibly suggesting a page reload or providing diagnostic information.

---

## 12. NEW: React Flow <-> Yjs Synchronization Layer

This adapter layer is responsible for bidirectional data flow between the Yjs CRDT source of truth and the React Flow UI component.

- **Yjs -> React Flow (`syncGraphFromYjs`):**
    - **Mechanism:** Uses a React hook (e.g., `useYjsReactFlowBridge`) that subscribes to deep changes within the relevant Yjs graph data (`Y.Map` containing nodes `Y.Array` and edges `Y.Array`).
    - **Action:** On Yjs change, reads the current nodes and edges from Yjs, transforms them into the format expected by React Flow (`Node[]`, `Edge[]`), and updates the React state variables that are passed as props to `<ReactFlow>`.
    - **Optimization:** Uses memoization and potentially selective state updates to ensure performance.
- **React Flow -> Yjs (`applyReactFlowChangesToYjs`):**
    - **Mechanism:** Functions called from React Flow's event handlers (`onNodesChange`, `onEdgesChange`, `onConnect`, `onNodesDelete`, `onEdgesDelete`).
    - **Action:** Translates React Flow change objects into specific Yjs operations, wrapped in `doc.transact()`:
        - `onNodesChange` (type: `'position'`): Update the `x`, `y` properties in the corresponding node's `Y.Map`.
        - `onNodesChange` (type: `'select'`): Update selection state via Yjs Awareness protocol (if implemented).
        - `onEdgesChange` (type: `'select'`): Update selection state via Yjs Awareness protocol.
        - `onConnect`: Create a new edge `Y.Map` with source/target/handle info and add it to the edges `Y.Array`.
        - `onNodesDelete`: Find and delete the corresponding node `Y.Map`(s) from the nodes `Y.Array`.
        - `onEdgesDelete`: Find and delete the corresponding edge `Y.Map`(s) from the edges `Y.Array`.
    - **Custom Nodes:** Interactions within custom nodes (e.g., `onChange` in an input) call specific functions that perform Yjs updates on the node's `data` (`Y.Map`).
- **Reference:** The React Flow collaborative example provides a conceptual basis for this pattern.

---

## 13. Serialization (Revised: Local-First + CRDTs)

- **In-Memory:** Project state is held in a top-level CRDT document (e.g., `Y.Doc`).
- **Persistence:** The CRDT document state is periodically/explicitly saved to a local file (`.strella`).
    - **Format:** Can be a highly efficient binary **CRDT state vector/snapshot** generated by the CRDT library (preferred for performance) or a structured format like JSON representing the snapshot.
    - **Loading:** The file is read, and its contents are used to hydrate/initialize the in-memory CRDT document.
- **Offline:** The application reads from and writes to the local file snapshot.
- **Online:** The `y-websocket` provider syncs *CRDT updates* (not full snapshots) with the backend relay and other clients.

```ts
// In-memory structure
const projectDoc = new Y.Doc();

// Saving (Conceptual)
const snapshot: Uint8Array | string = Y.encodeStateAsUpdate(projectDoc); // Or similar snapshot mechanism
writeFile('project.strella', snapshot);

// Loading (Conceptual)
const fileContent = readFile('project.strella');
const initialDoc = new Y.Doc();
 Y.applyUpdate(initialDoc, fileContent);
```

---

## 14. Real-time Synchronization Architecture (Revised)

- **Initial Approach (2-User Collaboration):**
  - **Client:** Uses a CRDT provider (e.g., `y-webrtc`) for direct peer-to-peer collaboration.
    - Supports small-scale collaboration (2-10 users) without a dedicated server.
    - Uses default public signaling servers initially.
    - Handles Yjs awareness protocol for presence indicators.
    - Automatically manages reconnection and state synchronization.
  
  ```ts
  // Simple WebRTC implementation example
  import * as Y from 'yjs';
  import { WebrtcProvider } from 'y-webrtc';
  
  const doc = new Y.Doc();
  const webrtcProvider = new WebrtcProvider('strella-doc-id', doc, {
    signaling: ['wss://signaling.yjs.dev']  // Default public signaling server
  });
  ```

- **Future Scaling (WebSocket Server):**
  - **Role:** Lightweight message relay and temporary update log.
  - **Technology:** Node.js + `ws` library + `y-websocket-server` (or equivalent for chosen CRDT).
  - **Functionality:**
    - Manages WebSocket connections per project/document ID.
    - Receives CRDT updates from one client.
    - Broadcasts updates to all other clients connected to the same document.
    - Persists recent CRDT *updates* temporarily to allow newly connected clients to efficiently fetch missed changes.
    - Manages awareness data relay.
  - **Does NOT hold the full project state.**

---

## 15. CRDT Data Model Examples (Simplified for Initial Implementation)

For the initial implementation focused on TODO app complexity, we'll use a streamlined CRDT structure:

```ts
// Top level document
const doc = new Y.Doc();

// Components collection
const components = doc.getMap('components');

// Single component structure (simplified)
const todoComponent = components.get('todo-list');
const nodes = todoComponent.get('nodes'); // Y.Array
const edges = todoComponent.get('edges'); // Y.Array
const variables = todoComponent.get('variables'); // Y.Map
```

This simplified approach focuses on the essential structures needed for a working vertical slice. As the application evolves, we can extend to the more comprehensive model:

- **Project Structure:** Top-level `Y.Doc`.
- **Components:** `Y.Map<Y.Map<any>>` mapping component ID to component data.
- **Layout Tree:** `Y.Array<Y.Map<any>>` where each `Y.Map` represents a `LayoutNode`.
- **Node Props:** `Y.Map<any>` within each layout node's map.
- **Graph Nodes/Edges:** `Y.Map` containing `Y.Map<Y.Map<any>>` for nodes and `Y.Array<Y.Map<any>>` for edges.
- **Variables:** `Y.Map<any>` for definitions, potentially another `Y.Map<any>` for shared runtime values.
- **Text Content:** `Y.Text` for collaborative text editing within nodes (e.g., Text node content, code snippets).

This progressive implementation approach allows for quick validation of core concepts while maintaining the option to expand the CRDT model as complexity increases.

---

## 16. Devtools

- **Enhancements:**
    - Visualize CRDT update flow.
    - Inspect raw CRDT data structures.
    - **Inspect React Flow `nodes`/`edges` props** derived from Yjs state to debug the sync layer.
    - Debug merge conflicts (though CRDTs minimize explicit conflicts).
    - Trace execution based on CRDT snapshots.

---

## 17. Packaging and Portability

- **Web:** Vite build for static hosting. Requires backend sync server URL.
- **Desktop:** Electron/Tauri package. Can bundle sync server or connect to a remote one. Uses native file system APIs for CRDT persistence.

---

## 18. Implementation Phases (Tactical, Iterative Approach)

### Phase 1 – Foundational Type System & Core Models
- **1.1 Core Type Definitions**
  - Define TypeScript types for Component, Graph, Node, Edge interfaces
  - Define Yjs CRDT schema mapping (how our domain models map to Y.Doc, Y.Map, Y.Array)
  - Define React Flow adapter type interfaces
  - Create type guards and validation utilities

- **1.2 CRDT Storage POC**
  - Implement minimal Yjs document structure
  - Create basic CRUD operations for Components, Nodes, Edges
  - Write tests for basic CRDT operations
  - Develop serialization/deserialization helpers for `.strella` files

- **1.3 React Flow Integration POC**
  - Create minimal mapping layer between Yjs and React Flow
  - Implement basic `useYjsReactFlowBridge` hook
  - Test bidirectional updates (Yjs → React Flow → Yjs)
  - Create sample custom node and edge types

### Phase 2 – Interactive Primitives & Sync Foundation

- **2.1 Custom Node Development**
  - Define standard node interface with `<Handle>` components
  - Implement core node types (GetVarNode, SetVarNode, EntryNode, etc.)
  - Build node type registry and factory
  - Create styling system for nodes and handles

- **2.2 Sync Layer Development**
  - Implement complete `syncGraphFromYjs` with optimizations
  - Build all React Flow event handlers (`onNodesChange`, `onConnect`, etc.)
  - Create provider component encapsulating sync logic
  - Develop proper error handling and recovery strategies

- **2.3 Local Storage & File System POC**
  - Build persistence layer for Yjs documents (browser localStorage/IndexedDB)
  - Create file saving/loading utilities
  - Test offline editing and state recovery
  - Develop schema versioning/migration strategy

### Phase 3 – Execution Engine & Component System

- **3.1 Queue-Based Executor**
  - Implement core execution queue
  - Create snapshot mechanism for CRDT state during execution
  - Build node evaluation system with input/output resolution
  - Test execution with basic node types

- **3.2 Variable System Implementation**
  - Develop variable definition and storage system
  - Implement binding mechanism for UI props
  - Create variable panel UI components
  - Build reactive updates between variables and UI

- **3.3 Multi-Component System**
  - Implement component navigation and loading
  - Create component instantiation mechanism
  - Develop prop passing between components
  - Build event propagation system

### Phase 4 – Collaboration & Functions

- **4.1 Initial P2P Collaboration (WebRTC)**
  - Implement y-webrtc provider integration
  - Use public signaling servers for connection establishment
  - Test 2-user editing scenarios
  - Add basic connection status indicators

- **4.2 Awareness Protocol Integration**
  - Implement simple presence indicators (cursors, selections)
  - Create basic conflict visualization
  - Test collaboration edge cases in P2P model
  - *(Defer)* Advanced user identity and permissions system

- **4.3 Function System Implementation**
  - Build function definition system
  - Implement function invocation through FunctionCallNode
  - Create function argument/return handling
  - Test complex function compositions

### Phase 5 – Visual Design Mode & Production Readiness

- **5.1 Design Canvas Implementation (Simplified for Vertical Slice)**
  - Create Structure Panel with click-to-add element functionality
  - Implement basic Property Panel for essential CSS properties (background, margin, padding, text)
  - Add simple controls for numerical/text values and basic color selection
  - *(Defer)* Canvas-based drag-and-drop interactions
  - *(Defer)* Advanced snapping and alignment guides
  - *(Defer)* Complex multi-select tools and operations

- **5.2 Runtime vs. Authored View**
  - Build visualization for runtime-generated elements
  - Create toggle between runtime and authored views
  - Implement runtime inspection tools
  - Develop state diffing visualization

- **5.3 Error Handling & Production Hardening**
  - Implement comprehensive error boundaries
  - Create error recovery strategies
  - Build performance optimizations
  - Develop telemetry and diagnostics

- **5.4 Comprehensive Integration Testing**
  - Create end-to-end test suite
  - Build performance benchmarks
  - Test multi-user scenarios
  - Validate cross-platform behavior

---

## 19. Core Design Principles (Enforced Table - Updated)

| Principle                         | System Behavior                                                                 |
|----------------------------------|---------------------------------------------------------------------------------|
| Local-First                      | App functions offline; local file (`.strella`) is the primary user data store.     |
| Real-time Sync (Online)          | CRDT updates shared via WebRTC (initially) or WebSocket for larger scale collaboration. |
| CRDTs Manage State               | All shared project data (layout, graph, vars) resides in CRDT structures (Yjs). |
| Graphs are entity-scoped         | Always belong to a component or function within the CRDT structure.              |
| Layout is declarative (in CRDT)  | Declared layout is visible, stored in CRDTs.                                    |
| Runtime UI is ephemeral          | Only appears in preview; potentially marked in CRDTs if needed.                  |
| URL reflects Navigation          | Used for component/mode selection, not granular collaborative state.            |
| Variables are nameable + scoped  | Defined and accessed via CRDTs.                                                 |
| Functions return data            | Cannot directly cause CRDT mutations outside their scope (unless via return value).|
| Implementation Complexity        | Start simple (TODO app scale), add complexity only as needed for user capabilities. |