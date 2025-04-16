# Strella Wireframe Documentation

**IMPORTANT NOTE:** These wireframes are conceptual illustrations only, intended to provide visual context for the concepts detailed in the authoritative specification documents (`PRD.md`, `TECH-SPEC.md`, and `PLAN.md`). In all cases, those documents are the source of truth for development decisions. These wireframes exist only to support and visualize those specifications.

This document provides a detailed explanation of the conceptual wireframes for Strella, the local-first Visual Development Environment (VDE) with real-time collaboration features.

## Overview

The wireframes represent four key views of the Strella interface, using a Todo List application as the example vertical slice:

1. **Project View (Design)** - The main project overview in design mode
2. **Page View (Graph)** - Component view focusing on the graph logic editor
3. **Page View (Graph with Preview)** - Graph editor with the live preview panel
4. **Page View (Design)** - Component view focusing on the visual design editor

These wireframes illustrate the core UI concepts but are intentionally conceptual rather than pixel-perfect designs, focusing on the functional layout and user workflow rather than visual styling details. The actual implementation should follow the specifications in the PRD and Technical Specification documents.

## 1. Project View - Design Mode (`project-view-design.png`)

This wireframe shows the project-level overview in design mode:

- **Top Navigation Bar**: Component breadcrumbs
  - Project > Todo List > List Item navigation path
  - Mode switcher (Design/Graph) and edit code button (which would open VSCode/Cursor *future*)
  - Settings icon
  
- **Left Sidebar**: Project navigation and component listing
  - **Structure Panel**: Component hierarchy showing Todo List (self) with nested Header and List (v-stack)
  - **Primitives Panel**: Reusable layout elements (Page, V-stack)
  - **Library Panel**: Reusable components (Header, List Item)

- **Main Canvas**: Design view showing component structure
  - Empty Todo List component placeholder with title
  - Visual representation of component hierarchy
  
- **Right Sidebar**: Property panel and details
  - Component name (Todo List)
  - Type information
  - Variables count (2)
  - Functions count (1)

*Note: The actual implementation of this view should adhere to the Layout Model and Design Mode specifications in the PRD document.*

## 2. Page View - Graph Mode (`page-view-graph.png`)

This wireframe illustrates the graph editing interface for a component:

- **Top Navigation**: Same breadcrumb pattern with Project > Todo List > List Item
  - Mode tabs (Design/Graph) and edit code button
  - "Main flow" dropdown selector
  
- **Left Sidebar**: Structured panels
  - **Structure Panel**: Component hierarchy as in design mode
  - **Graphs Panel**: Available graphs (Main Graph)
  - **Functions Panel**: Function definitions (Get List Data)
  - **Variables Panel**: Defined variables (List Data)

- **Graph Canvas**: Node-based visual programming interface
  - **Lifecycle Nodes**: OnBeforeLoad, OnLoad
  - **Data Flow Nodes**: Get List Data with outputs
  - **State Management Nodes**: SET Variable (List Data)
  - **Control Flow Nodes**: For Each with Array/Index/Element/Complete ports
  - **UI Generation Nodes**: Create Component, Add Child
  - **Connection Types**: 
    - Execution flow (thicker arrows)
    - Data flow (with typed ports and connections)

- **Right Sidebar**: Component details panel
  - Same details as in design mode

*Note: The actual implementation of graph nodes and connections should follow the Logic Graphs and Node Types specifications from the PRD document.*

## 3. Page View - Graph with Preview (`page-view-graph-w-preview.png`)

This wireframe shows the graph editor with the preview panel activated:

- **Graph Editor**: Same layout as the standard graph view
  - Node connections showing data flow between OnBeforeLoad > Get List Data > SET Variable
  - Logic flow for dynamic component creation (OnLoad > For Each > Create Component > Add Child)

- **Preview Panel**: Live component rendering
  - Window-style controls (minimize, maximize, close)
  - Empty preview area showing runtime rendering
  - Connected to the graph execution context

- **Shared Context**: Clear relationship between graph and output
  - Graph nodes that affect UI directly connect to preview state
  - Logic flow visibly affects the preview rendering

*Note: The actual implementation of the preview panel should adhere to the Rendering Runtime specifications in the PRD document.*

## 4. Page View - Design Mode (`page-view-design.png`)

This wireframe presents the visual design editor for a component:

- **Left Sidebar**: Same structure as other views
  - Hierarchy showing Todo List (page)
  - Nested components including dynamic List Items (shown with dashed borders)
  - Item Detail component as a separate page

- **Design Canvas**: Visual component editor
  - Split view showing Todo List and Item Detail components
  - Selection highlighting (orange border around Todo List)
  - Visual representation of container boundaries
  
- **Right Sidebar**: Details panel
  - Same component metadata as other views

*Note: As specified in the PLAN document, the initial implementation will use a simplified Design Mode with Structure Panel and basic Property Panel rather than a full canvas-based interface.*

## Implementation Notes

These wireframes represent conceptual UI for building a Todo List application and should inform development without constraining it unnecessarily. They are intended to illustrate the vertical slice approach described in the implementation plan. Key considerations for implementation:

1. **Component Relationships**: The wireframes show how components relate to each other, with parent-child hierarchies (Todo List > List Item) clearly visible.

2. **Data Flow Visualization**: The graph view demonstrates how data flows from source nodes through transformation nodes to UI elements and variables.

3. **Multi-View Consistency**: Each view (Design/Graph) maintains consistent access to the core component structure, variables, and functions.

4. **Visual Node System**: The graph editor uses a visual node system with different node types for lifecycle events, data operations, control flow, and UI manipulation.

5. **Progressive Implementation**: As outlined in the implementation plan, initial development should focus on implementing core features like the graph editor, variable management, and basic preview functionality before adding refined design tools.

The initial vertical slice implementation should enable creating a working Todo List application by connecting these basic node types, manipulating component structure, and managing simple state variables.

## Authoritative Documentation

**IMPORTANT:** These wireframes are supplementary illustrations only. For all development decisions, refer to the following authoritative documents:

1. **PRD.md** - Product Requirements Document defining the core concepts, principles, and user capabilities
2. **TECH-SPEC.md** - Technical Specification detailing the architecture, data models, and implementation approach
3. **PLAN.md** - Implementation Plan outlining the phased approach and development priorities

In case of any discrepancy between these wireframes and the written specifications, the PRD, TECH-SPEC, and PLAN documents should be considered the source of truth. 