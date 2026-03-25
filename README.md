# Central AI — Intelligent Voice Receptionist Platform

Central AI is a full-stack web application that lets businesses build, customize, and simulate AI-powered phone receptionist workflows through a visual node-based editor. The platform features a conversational AI setup wizard (Max), a React Flow graph editor with custom animated edges, a unified right-side panel for node library and configuration, a live call simulator, version history, and a rich template gallery — all with voice synthesis powered by ElevenLabs.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [Application Views & Components](#application-views--components)
  - [AppShell](#appshell)
  - [TemplateGallery & WorkflowsTable](#templategallery--workflowstable)
  - [FlowEditor](#floweditor)
  - [FlowCanvas](#flowcanvas)
  - [RightPanel](#rightpanel)
  - [NodeLibrary](#nodelibrary)
  - [NodeConfigPanel](#nodeconfigpanel)
  - [RunsView](#runsview)
  - [SetupCall (Max AI Wizard)](#setupcall-max-ai-wizard)
  - [Onboarding](#onboarding)
  - [CallSimulator](#callsimulator)
  - [VersionHistory](#versionhistory)
- [Node Types](#node-types)
- [Templates](#templates)
- [Backend API](#backend-api)
- [Voice & Audio System](#voice--audio-system)
- [UI Component System](#ui-component-system)
- [Data Models](#data-models)
- [Design System](#design-system)

---

## Overview

Central AI enables small businesses (dental offices, law firms, salons, real estate agencies, etc.) to deploy an AI voice receptionist without any coding. Users either:

1. **Use a template** — pick from 25 pre-built workflow templates organized by business type
2. **Let Max build it** — answer 7 voice-guided questions and the app auto-generates a complete call flow
3. **Build from scratch** — add nodes via a visual flow graph editor

Completed flows can be tested immediately in the built-in call simulator before going live.

---

## Features

### Core
- **Visual Flow Builder** — Node-based graph editor powered by `@xyflow/react` (React Flow v12) with an infinite canvas
- **Max AI Wizard** — Voice-guided setup assistant that builds your flow from 7 questions
- **25 Templates** — Pre-built flows across 6 business verticals
- **Call Simulator** — Simulates a live call through your flow with AI responses
- **Version History** — Every publish creates a snapshot; restore any previous version
- **Undo / Redo** — Full undo/redo stack (up to 20 steps) in the flow editor
- **Runs Tab** — View historical call run logs and analytics

### Flow Editor
- **React Flow Canvas** — Custom `WorkflowNode` components with Attio-style card design (gray shell, white inner, colored trigger/category tags)
- **Animated Edges** — Custom `AnimatedSVGEdge` with SVG gradient overlays and smooth-step paths
- **Unified Right Panel** — Single panel with three modes: idle, library (node picker), config (node settings)
- **Plus Button Flow** — Click the `+` button below any node to open the library and insert a node after it
- **Node Finder (Cmd+F)** — Floating search bar that highlights/dims nodes by name
- **Status Badges** — Draft / Modified / Published states with visual indicators
- **Export** — Export flow as JSON
- **Duplicate** — Clone the current workflow

### Unified Right Panel (Library + Config)
- **Library mode** — Opens when user clicks `+` on a node; shows node library with search and categorized list; inserts node after the clicked node
- **Config mode** — Opens when user clicks an existing node; shows full config fields for that node type
- **Idle mode** — Panel is hidden; canvas fills the full width
- **Back arrow** — In library or config mode, a back arrow closes the panel and returns to idle

### Search & Filter
- Node Library: text search + category filter pills with node counts
- Template Gallery: text search + business-type pills + sort dropdown (Popular / Fewest Nodes / Most Nodes / A-Z)
- Workflows Table: sortable columns (Name, Status, Nodes, Last Modified) via TanStack Table
- Version History: date-range filter (All Time / Last 7 Days / Last 30 Days / Last 90 Days)

### Voice & AI
- **ElevenLabs TTS** — Max speaks every prompt through a cloned voice
- **Speech-to-Text** — Web Speech API captures user answers during setup
- **Claude AI** — Interprets natural language answers and extracts structured data
- **Transition Sound** — Subtle audio cue plays when Max finishes setup

---

## Tech Stack

### Frontend
| Library | Version | Purpose |
|---------|---------|---------|
| React | 19.2 | UI framework |
| Vite | 8.0 | Build tool & dev server |
| Tailwind CSS | 4.2 | Utility-first styling |
| `@xyflow/react` | 12.10 | React Flow v12 — graph-based flow canvas |
| `@base-ui/react` | 1.3 | Accessible UI primitives (shadcn foundation) |
| `@tanstack/react-table` | 8.21 | Sortable/filterable data tables |
| Lucide React | 1.6 | Icon library |
| `class-variance-authority` | 0.7 | Component variant management |
| `clsx` + `tailwind-merge` | latest | Conditional class merging |
| `tw-animate-css` | latest | Tailwind animation utilities |
| Geist Variable Font | 5.2 | Primary typeface |

### Backend
| Library | Version | Purpose |
|---------|---------|---------|
| Express | 5.2 | HTTP server |
| `@anthropic-ai/sdk` | 0.80 | Claude AI API client |
| `dotenv` | 17 | Environment variable loading |
| `cors` | 2.8 | Cross-origin resource sharing |
| `concurrently` | 9.2 | Run frontend + backend in parallel |

### External APIs
| Service | Usage |
|---------|-------|
| Anthropic Claude | Interprets voice answers, drives call simulation AI |
| ElevenLabs | Text-to-speech for Max's voice guidance |
| Web Speech API | Browser-native speech recognition during setup |

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      React Frontend                      │
│  App.jsx (router/state)                                  │
│  ├── AppShell (nav, chat input, notifications)          │
│  ├── TemplateGallery (browse templates, workflows table)│
│  ├── FlowEditor                                          │
│  │   ├── FlowCanvas (@xyflow/react graph editor)        │
│  │   │   ├── WorkflowNode (custom node component)       │
│  │   │   └── AnimatedSVGEdge (custom edge with gradient)│
│  │   ├── RightPanel (unified library + config panel)    │
│  │   │   ├── NodeLibrary (embedded in library mode)     │
│  │   │   └── NodeConfigPanel (embedded in config mode)  │
│  │   └── VersionHistory (side panel)                    │
│  ├── RunsView (call runs history & analytics tab)       │
│  ├── SetupCall (Max AI wizard — 7 questions)            │
│  ├── Onboarding (Max intro — 8 steps)                   │
│  └── CallSimulator (live call test overlay)             │
└───────────────────────┬─────────────────────────────────┘
                        │ HTTP (localhost:3001)
┌───────────────────────▼─────────────────────────────────┐
│                    Express Backend                        │
│  POST /api/voice/interpret      → Claude (setup answers)│
│  POST /api/voice/onboarding     → Claude (onboarding)   │
│  POST /api/voice/tts            → ElevenLabs TTS        │
│  GET  /api/health               → health check          │
└─────────────────────────────────────────────────────────┘
```

### Flow Data Model

Flows are stored as a **nested tree** (not a flat node graph), then converted to React Flow's flat nodes/edges format for rendering:

```js
// Internal tree (source of truth)
{
  trigger: { type: 'incoming_call', config: {} },
  nodes: [
    { id: 'n1', type: 'greeting', config: { message: 'Hello!' } },
    {
      id: 'n2', type: 'business_hours', config: { ... },
      branches: [
        {
          id: 'b1', condition: 'during_hours', label: 'Open',
          nodes: [
            { id: 'n3', type: 'ai_intent', config: { intents: '...' }, branches: [...] }
          ]
        },
        { id: 'b2', condition: 'after_hours', label: 'Closed', nodes: [...] }
      ]
    }
  ]
}
```

The `flowTreeToReactFlow` utility converts this tree into React Flow's flat `{ nodes[], edges[] }` format with auto-computed XY positions, handling branching layout recursively.

---

## Project Structure

```
central-ai/
├── public/
├── server/
│   ├── index.js                  # Express server entry
│   ├── config/                   # ElevenLabs / Anthropic config
│   └── routes/
│       ├── interpret.js          # POST /api/voice/interpret
│       ├── onboarding-interpret.js  # POST /api/voice/onboarding
│       └── tts.js                # POST /api/voice/tts
├── src/
│   ├── main.jsx                  # React entry point
│   ├── App.jsx                   # Root component + routing state
│   ├── index.css                 # Global styles + React Flow overrides + animated edge keyframes
│   ├── components/
│   │   ├── AppShell.jsx          # Layout shell + navigation
│   │   ├── TemplateGallery.jsx   # Template browser + workflows table
│   │   ├── NewWorkflowChooser.jsx # New workflow creation modal/chooser
│   │   ├── FlowEditor.jsx        # Flow editor container + state orchestrator
│   │   ├── FlowCanvas.jsx        # @xyflow/react canvas + WorkflowNode + AnimatedSVGEdge
│   │   ├── RightPanel.jsx        # Unified right panel (library/config/idle mode switcher)
│   │   ├── NodeLibrary.jsx       # Node picker (embedded in RightPanel library mode)
│   │   ├── NodeConfigPanel.jsx   # Node property editor (embedded in RightPanel config mode)
│   │   ├── RunsView.jsx          # Runs history tab + analytics view
│   │   ├── VersionHistory.jsx    # Version history side panel
│   │   ├── SetupCall.jsx         # Max AI setup wizard
│   │   ├── Onboarding.jsx        # Max intro onboarding
│   │   ├── CallSimulator.jsx     # Live call simulation overlay
│   │   ├── VoiceOrb.jsx          # Animated voice orb component
│   │   ├── VoiceOrb.css          # Voice orb animation styles
│   │   ├── SetupFlowPreview.jsx  # Flow preview in setup wizard
│   │   └── ui/                   # shadcn/base-ui primitives
│   │       ├── alert-dialog.jsx
│   │       ├── badge.jsx
│   │       ├── button.jsx
│   │       ├── checkbox.jsx
│   │       ├── collapsible.jsx
│   │       ├── dialog.jsx
│   │       ├── dropdown-menu.jsx
│   │       ├── input.jsx
│   │       ├── label.jsx
│   │       ├── progress.jsx
│   │       ├── scroll-area.jsx
│   │       ├── select.jsx
│   │       ├── separator.jsx
│   │       ├── sheet.jsx
│   │       ├── switch.jsx
│   │       ├── table.jsx
│   │       ├── textarea.jsx
│   │       └── tooltip.jsx
│   ├── data/
│   │   ├── nodeDefinitions.js    # All 26 node type definitions
│   │   └── templates.js          # All 25 templates across 6 business types
│   ├── hooks/
│   │   ├── useVoiceChat.js       # AI conversation management
│   │   ├── useVoiceInput.js      # Web Speech API wrapper
│   │   ├── useAudioPlayer.js     # ElevenLabs TTS audio playback
│   │   └── useTransitionSound.js # UI transition audio cue
│   └── lib/
│       ├── utils.js              # cn() class merging utility
│       └── flowTreeToReactFlow.js # Tree→React Flow nodes/edges converter
├── components.json               # shadcn config (style: base-nova)
├── vite.config.js
├── package.json
└── .env                          # See Environment Variables
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- An Anthropic API key (Claude)
- An ElevenLabs API key + Voice ID (for Max's voice)

### Installation

```bash
# Clone the repo
git clone <repo-url>
cd central-ai

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your API keys (see below)
```

### Running in Development

```bash
# Start both frontend (port 5173) and backend (port 3001) together
npm run dev:all

# Or run separately:
npm run dev         # Vite frontend only
npm run dev:server  # Express backend only
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Environment Variables

Create a `.env` file in the project root:

```env
# Anthropic (required for AI interpretation + call simulation)
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# ElevenLabs (required for Max's voice TTS)
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
ELEVENLABS_VOICE_ID=your_voice_id_here

# Optional
PORT=3001
```

> **Note:** Without the ElevenLabs keys, the app still works fully — Max's prompts display as text and voice input falls back to text input. Without the Anthropic key, the call simulator and AI interpretation features won't function.

---

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Vite dev server (frontend only, port 5173) |
| `npm run dev:server` | Start Express backend (port 3001) |
| `npm run dev:all` | Start both frontend and backend concurrently |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint |

---

## Application Views & Components

### AppShell

**File:** `src/components/AppShell.jsx`

The persistent layout wrapper that renders the sidebar navigation and main content area. Key features:

- **Navigation** — Home, Workflows (+ badge), Analytics, Settings links
- **Collapsed sidebar** — Icons-only mode with tooltips on each nav item
- **"Ask Central" chat bar** — Always-visible AI assistant input at the bottom of the sidebar
- **Notification banner** — Dismissable alert at the top of the content area
- **Onboarding trigger** — "Meet Max" button in the empty home state

The active view (`home | workflows | editor | setupcall | onboarding`) is managed by `App.jsx` state and passed down as props.

---

### TemplateGallery & WorkflowsTable

**File:** `src/components/TemplateGallery.jsx`

Two panels in one component:

#### Template Gallery (New Workflow Sidebar)
A slide-in sidebar (`showNewWorkflowSidebar`) with three workflow creation paths:

1. **Let Max build it** — Launches the SetupCall voice wizard
2. **Browse Templates** — Filter by business type + search + sort
3. **Start from scratch** — Opens empty flow in the editor

Template filtering & sorting:
- **Business type pills:** All / Dental / Legal / Real Estate / Restaurant / Salon / Medical
- **Sort dropdown:** Most Popular · Fewest Nodes · Most Nodes · Quickest Setup · A–Z
- **Text search:** Filters by template name and description simultaneously
- All three combine via `useMemo` for efficient re-computation

#### Workflows Table
Displays saved/published flows using **TanStack Table** (`@tanstack/react-table`) with shadcn `Table` primitives:

| Column | Sortable | Notes |
|--------|----------|-------|
| Name | ✅ | Click to open in editor |
| Status | ✅ | Badge: Published (green) / Draft (gray) / Modified (outline) |
| Nodes | ✅ | Integer node count |
| Last Modified | ✅ | Relative date |
| Actions | — | DropdownMenu: Edit / Duplicate / Export JSON / Delete |

The Delete action shows an `AlertDialog` confirmation before removing the row.

---

### FlowEditor

**File:** `src/components/FlowEditor.jsx`

The main editor container. Manages:

- **Flow tree state** (`flowTree`) — The complete nested flow data structure
- **Panel mode state** (`panelMode`) — `'idle' | 'library' | 'config'` controls the right panel
- **Add-after state** (`addAfterNodeId`) — Tracks which node's `+` button was clicked, so the library knows where to insert
- **Undo / Redo stacks** — Up to 20 snapshots; Cmd+Z / Cmd+Shift+Z
- **Flow name** — Inline-editable in the top bar
- **Status** — Draft → Modified (on any change) → Published (on publish)
- **Version history** — Snapshots created on every publish; up to 20 kept

Key handlers:
- `handlePlusClick(nodeId)` — Sets `panelMode='library'` and `addAfterNodeId=nodeId`
- `handleSelectNode(nodeId)` — Sets `panelMode='config'` and `selectedNodeId=nodeId`
- `handleAddNodeFromLibrary(nodeType)` — Calls `insertNodeAfter` to splice the new node into the tree after `addAfterNodeId`, then resets to idle
- `handlePanelBack()` — Resets panel to `'idle'`
- `insertNodeAfter(tree, targetId, newNode)` — Recursive tree helper that finds `targetId` in any branch and inserts `newNode` immediately after it

Top bar elements:
- Back button → returns to Workflows view
- Editable flow name
- Status badge (Draft / Modified / Published)
- Undo / Redo buttons with tooltips
- "Test Flow" button → opens CallSimulator overlay
- "Publish" button → saves snapshot, sets status to Published
- **More menu** (DropdownMenu): Version History · Duplicate · Export JSON · Delete Workflow

Delete Workflow shows an `AlertDialog` confirmation dialog.

---

### FlowCanvas

**File:** `src/components/FlowCanvas.jsx`

The visual canvas built on **`@xyflow/react` (React Flow v12)**. Renders the flow tree as an interactive directed graph.

#### Custom Node: `WorkflowNode`
Attio-inspired card design:
- **Outer shell** — `bg-gray-100` rounded container with subtle border
- **Inner card** — White `bg-white` with node label, description, and category icon
- **Trigger tab** — Top-left colored tab showing the node category color
- **Category tag** — Colored pill badge (Core / Logic / Integration / AI)
- **Plus button** — Separate circular blue button below the node (not part of the Handle); clicking it fires `onPlusClick(nodeId)` to open the library
- **Source / Target Handles** — Invisible React Flow connection handles for edge routing; overlaid by the visible `+` button

#### Custom Edge: `AnimatedSVGEdge`
- Smooth-step SVG path between nodes
- Animated SVG gradient overlay (CSS keyframes in `index.css`)
- Renders a flowing colored line effect along each connection

#### Tree-to-Graph Conversion
`src/lib/flowTreeToReactFlow.js` converts the nested flow tree into React Flow's flat `{ nodes[], edges[] }` format:
- Recursively walks the tree
- Auto-computes XY positions (vertical stacking, horizontal branching)
- Handles arbitrary branch depth
- Returns ready-to-use arrays for `<ReactFlow nodes={} edges={} />`

**Node interactions:**
- Click a node → `onSelectNode(nodeId)` → opens config panel
- Click `+` button below node → `onPlusClick(nodeId)` → opens library panel

---

### RightPanel

**File:** `src/components/RightPanel.jsx`

Thin mode-switching wrapper (~50 lines) that renders the correct content based on `panelMode`:

| Mode | Content | Trigger |
|------|---------|---------|
| `'idle'` | Panel hidden (returns `null`) | Default state |
| `'library'` | `<NodeLibrary>` embedded | Click `+` on any node |
| `'config'` | `<NodeConfigPanel>` embedded | Click an existing node |

Props:
- `panelMode` — `'idle' | 'library' | 'config'`
- `node` — The selected node object (config mode)
- `addAfterNodeId` — Target node ID (library mode)
- `onClose` / `onBack` — Resets to idle
- `onUpdate` / `onDelete` — Forwarded to NodeConfigPanel
- `onAddNode(nodeType)` — Forwarded to NodeLibrary; triggers `handleAddNodeFromLibrary` in FlowEditor

Fixed width `w-[340px]`, `border-l border-gray-200`, white background. Back arrow (`←`) visible in both library and config modes.

---

### NodeLibrary

**File:** `src/components/NodeLibrary.jsx`

Node picker panel embedded inside `RightPanel` when in library mode.

**Features:**
- **"Next step" header** — Clear label showing this is for adding a next step
- **Text search** — Filters nodes by name and description
- **Category filter pills** — All · Core · Logic · Integration · AI (with node counts)
- **Click-to-add** — Clicking a node type calls `onAddNode(nodeType)` to insert it after the target node
- No drag-and-drop (simplified for embedded right panel use)
- "Clear filters" shortcut when no results found

**Category colors:**
| Category | Color |
|----------|-------|
| Core | Cyan |
| Logic | Amber |
| Integration | Emerald |
| AI | Rose |

---

### NodeConfigPanel

**File:** `src/components/NodeConfigPanel.jsx`

Config panel embedded inside `RightPanel` when in config mode. Renders dynamic config fields based on the node type definition.

**Field types supported:**
| Type | Component |
|------|-----------|
| `text` | `<Input>` |
| `number` | `<Input type="number">` |
| `textarea` | `<Textarea>` |
| `select` | `<Select>` + `<SelectContent>` + `<SelectItem>` |
| `toggle` | `<Switch>` |
| All labels | `<Label>` |

**Advanced Settings** section uses `<Collapsible>` (expand/collapse animation) — only shown when the node definition includes advanced fields.

**Delete Node** button triggers an `<AlertDialog>` confirmation before removing the node from the tree.

The panel body is wrapped in `<ScrollArea>` to handle long config lists cleanly. Returns `null` when no node is selected (no idle placeholder).

---

### RunsView

**File:** `src/components/RunsView.jsx`

A dedicated tab in the editor showing historical call run data and analytics. Accessible via the "Runs" tab in the FlowEditor top bar.

**Features:**
- List of past call runs with timestamps and outcomes
- Run status indicators (completed, failed, in-progress)
- Basic analytics summary (total runs, success rate, etc.)

---

### SetupCall (Max AI Wizard)

**File:** `src/components/SetupCall.jsx`

A full-screen voice-guided setup wizard. Max (the AI assistant) asks 7 questions via ElevenLabs TTS audio; the user answers by speaking or typing.

**7 Questions:**

| # | Key | Question |
|---|-----|----------|
| 1 | `businessName` | What's the name of your business? |
| 2 | `businessType` | What type of business is it? |
| 3 | `schedule` | What are your business hours? |
| 4 | `intents` | What are the top 3 reasons customers call? |
| 5 | `afterHoursMode` | After hours — take messages, book appointments, or both? |
| 6 | `calendar` | What calendar system do you use? |
| 7 | `transferRules` | Are there any calls you'd like to transfer directly? |

Each answer is sent to `/api/voice/interpret` (Claude) which extracts structured data (e.g., business hours → `{ monday: { open: '9:00', close: '17:00' }, ... }`).

**Live flow preview** — A `SetupFlowPreview` component shows the flow tree being built in real-time as answers come in, displayed to the right of the wizard.

**Completion actions:** Test Flow · Edit Flow · Go Live (all navigate to the editor; Test Flow also opens the simulator).

**Exit confirmation** — Pressing the back/close button shows an `AlertDialog` asking "Exit Setup?" before discarding progress.

**Progress bar** — `<Progress value={(currentQuestion / 7) * 100} />` shows how far through setup the user is.

---

### Onboarding

**File:** `src/components/Onboarding.jsx`

An 8-step interactive onboarding flow introducing Max to new users. Each step features Max's avatar, a voice prompt (TTS), and a user interaction.

**8 Steps:**

| # | What happens |
|---|--------------|
| 1 | Welcome — Max introduces itself |
| 2 | Business name input (`<Input>`) |
| 3 | Business type selection (pill buttons) |
| 4 | Features overview |
| 5 | Node library walkthrough |
| 6 | First template pick |
| 7 | Voice test |
| 8 | Setup complete + CTA |

**Progress bar** — `<Progress value={(currentStep / 8) * 100} />` in the step header.

**Exit confirmation** — `<AlertDialog>` on back/close.

---

### CallSimulator

**File:** `src/components/CallSimulator.jsx`

A full-screen overlay that simulates a live phone call through the current flow.

**Layout (two-column):**
- **Left panel — Conversation:** Chat-style message thread showing caller ↔ AI exchanges. Uses `<ScrollArea>` for smooth overflow. `<Input>` at the bottom for typing caller responses.
- **Right panel — Flow Path:** Shows which nodes have been visited, which is active, and which are upcoming. Also uses `<ScrollArea>` for long flows.

**AI behavior:** Each user message is sent to the Express backend with the current flow tree as context. Claude responds as the AI receptionist, staying within the flow's defined branches.

**Toolbar:** End Call button, current node name indicator, call duration timer.

---

### VersionHistory

**File:** `src/components/VersionHistory.jsx`

A slide-in panel (from the right, over the canvas) showing all saved versions of the current flow.

**Features:**
- Timeline view with version numbers, authors, timestamps, and notes
- Active version highlighted with green dot + "Active" badge
- **Date filter** — `<Select>` with: All Time / Last 7 Days / Last 30 Days / Last 90 Days
- **Preview** button — (UI present, feature placeholder)
- **Restore** button — Restores a past version (creates a new snapshot; old versions are never deleted)

---

## Node Types

All 26 node types are defined in `src/data/nodeDefinitions.js`.

### Core (6 nodes)
| Type | Label | Description |
|------|-------|-------------|
| `greeting` | Greeting | Opening message spoken to the caller |
| `ask_question` | Ask Question | Prompt caller for a response |
| `collect_info` | Collect Info | Gather structured data (name, phone, etc.) |
| `end_call` | End Call | Close the call with a goodbye message |
| `record_message` | Record Message | Record a voicemail from the caller |
| `transfer_call` | Transfer Call | Forward the call to a person or department |

### Logic (5 nodes)
| Type | Label | Description |
|------|-------|-------------|
| `business_hours` | Business Hours | Branch on open/closed schedule |
| `condition` | Condition | Custom if/else branching logic |
| `ai_intent` | Detect Intent | Use AI to classify caller's intent |
| `wait` | Wait | Pause flow for a defined duration |
| `ab_test` | A/B Test | Split traffic between two flow paths |

### Integration (5 nodes)
| Type | Label | Description |
|------|-------|-------------|
| `book_appointment` | Book Appointment | Create calendar bookings |
| `send_sms` | Send SMS | Send a text message to the caller |
| `send_email` | Send Email | Send a follow-up email |
| `crm_update` | CRM Update | Push data to a CRM system |
| `webhook` | Webhook | Call an external HTTP endpoint |

### AI (5 nodes)
| Type | Label | Description |
|------|-------|-------------|
| `knowledge_base` | Knowledge Base | Answer questions from a document/URL |
| `sentiment_check` | Sentiment Check | Detect caller frustration or urgency |
| `language_detect` | Language Detect | Auto-detect and adapt to caller's language |
| `summarize` | Summarize Call | Generate a post-call summary |
| `smart_routing` | Smart Routing | AI-driven routing based on full context |

---

## Templates

25 templates across 6 business types, defined in `src/data/templates.js`.

### Dental (4 templates)
- New Patient Intake · Appointment Scheduling · Emergency Triage · Insurance Verification

### Legal (4 templates)
- New Client Intake · Consultation Scheduling · Case Status Check · Referral Routing

### Real Estate (4 templates)
- Listing Inquiry · Buyer Qualification · Showing Scheduler · Agent Routing

### Restaurant (4 templates)
- Reservation Booking · Takeout Orders · Catering Inquiry · Hours & Menu Info

### Salon (4 templates)
- Appointment Booking · Service Info · Stylist Request · Cancellation & Reschedule

### Medical (4 templates + 1 general)
- Patient Appointment · Prescription Refill · Test Results · Nurse Line Triage
- *General:* Receptionist Starter (cross-business starter template)

Each template includes: `name`, `description`, `nodeCount`, `popular` flag, and a `flow` tree pre-populated with realistic nodes and config values.

---

## Backend API

The Express server runs on port 3001 (configurable via `SERVER_PORT` env var).

### `POST /api/voice/interpret`

Interprets a user's spoken/typed answer during the SetupCall wizard.

**Request:**
```json
{
  "questionKey": "schedule",
  "userAnswer": "We're open Monday through Friday 9am to 5pm, and Saturday until noon",
  "context": { "businessType": "Dental Office" }
}
```

**Response:**
```json
{
  "structured": {
    "monday": { "open": "09:00", "close": "17:00" },
    "tuesday": { "open": "09:00", "close": "17:00" },
    "saturday": { "open": "09:00", "close": "12:00" }
  },
  "confirmation": "Got it! You're open Monday through Friday, 9 to 5, and Saturday mornings until noon."
}
```

Uses Claude with a structured prompt to extract domain-specific data from natural language answers.

---

### `POST /api/voice/onboarding`

Drives the onboarding conversation with Max. Maintains conversation history across turns.

**Request:**
```json
{
  "step": 2,
  "userMessage": "It's called Riverside Dental",
  "history": [ { "role": "assistant", "content": "Welcome! I'm Max..." } ]
}
```

**Response:**
```json
{
  "reply": "Great name! Riverside Dental it is. Now, what type of dental practice is it?",
  "extractedData": { "businessName": "Riverside Dental" }
}
```

---

### `POST /api/voice/tts`

Converts text to speech using the ElevenLabs API.

**Request:**
```json
{
  "text": "Welcome to Central AI! I'm Max, your setup assistant.",
  "voiceId": "optional-override-voice-id"
}
```

**Response:** Raw audio buffer (`audio/mpeg`) streamed back to the client.

---

### `GET /api/health`

Health check endpoint.

**Response:** `{ "status": "ok", "timestamp": "..." }`

---

## Voice & Audio System

### `useVoiceChat` — `src/hooks/useVoiceChat.js`
Manages the full conversation loop for both SetupCall and Onboarding:
1. Sends the current question text to `/api/voice/tts` to get audio
2. Plays audio via `useAudioPlayer`
3. Activates `useVoiceInput` to listen for the user's response
4. Sends the response to `/api/voice/interpret` or `/api/voice/onboarding`
5. Processes the structured result and advances to the next step

### `useVoiceInput` — `src/hooks/useVoiceInput.js`
Wrapper around the browser's `SpeechRecognition` / `webkitSpeechRecognition` API:
- `startListening()` / `stopListening()` controls
- Returns `transcript`, `isListening`, `error` state
- Falls back gracefully when speech recognition is unavailable

### `useAudioPlayer` — `src/hooks/useAudioPlayer.js`
Manages playback of ElevenLabs TTS audio:
- Accepts audio `Blob` or `ArrayBuffer`
- Creates an `AudioContext` and decodes/plays the audio buffer
- Returns `isPlaying`, `play(buffer)`, `stop()`
- Handles iOS/Safari audio context unlock requirement (silent buffer technique)

### `useTransitionSound` — `src/hooks/useTransitionSound.js`
Plays a subtle UI transition sound using the Web Audio API:
- Generates a short synthesized tone (no external file needed)
- Used when Max finishes the setup wizard

### Audio Unlock Pattern
Browser autoplay policies block audio until a user gesture. When the user clicks "Let Max build it" or "Meet Max", `App.jsx` immediately plays a 0-duration silent WAV and creates a silent `AudioContext` buffer — this "unlocks" audio for all subsequent TTS playback in that session.

---

## UI Component System

The project uses **shadcn** with the `base-nova` style, built on `@base-ui/react` (not Radix UI). All UI primitives live in `src/components/ui/`.

> **Important for contributors:** This project uses `@base-ui/react` as its primitive layer, **not Radix UI**. The key difference is that `DropdownMenuItem` (and other interactive items) use standard `onClick` handlers — **not** Radix's `onSelect` callback.

### Installed Components

| Component | Import path | Usage |
|-----------|-------------|-------|
| `Button` | `@/components/ui/button` | All action buttons with variants |
| `Badge` | `@/components/ui/badge` | Status indicators (Published/Draft/Modified) |
| `Input` | `@/components/ui/input` | All single-line text inputs |
| `Label` | `@/components/ui/label` | Accessible form labels |
| `Textarea` | `@/components/ui/textarea` | Multi-line text inputs |
| `Select` | `@/components/ui/select` | Dropdown selects (shadcn compound) |
| `Switch` | `@/components/ui/switch` | Toggle switches |
| `Checkbox` | `@/components/ui/checkbox` | Checkboxes |
| `Progress` | `@/components/ui/progress` | Progress bars (setup wizard steps) |
| `Collapsible` | `@/components/ui/collapsible` | Expand/collapse sections |
| `Dialog` | `@/components/ui/dialog` | General-purpose modal dialogs |
| `AlertDialog` | `@/components/ui/alert-dialog` | Destructive action confirmation dialogs |
| `DropdownMenu` | `@/components/ui/dropdown-menu` | Context/action menus |
| `Tooltip` | `@/components/ui/tooltip` | Hover tooltips (requires `TooltipProvider`) |
| `ScrollArea` | `@/components/ui/scroll-area` | Styled scrollable containers |
| `Separator` | `@/components/ui/separator` | Visual dividers |
| `Sheet` | `@/components/ui/sheet` | Slide-in side panels |
| `Table` | `@/components/ui/table` | Data table primitives (used with TanStack) |

### Path Alias
All UI components are imported via the `@` alias (configured in `vite.config.js` and `jsconfig.json`):
```js
import { Button } from '@/components/ui/button';
// resolves to: src/components/ui/button.jsx
```

---

## Data Models

### Node Definition (from `nodeDefinitions.js`)
```js
{
  type: 'greeting',          // unique identifier
  label: 'Greeting',         // display name
  category: 'core',          // core | logic | integration | ai
  icon: 'MessageSquare',     // Lucide icon name
  description: 'Opening message spoken to the caller',
  color: '#0EA5E9',          // node card accent color
  fields: [                  // config fields rendered in NodeConfigPanel
    {
      key: 'message',
      label: 'Message',
      type: 'textarea',      // text | number | textarea | select | toggle
      placeholder: 'Hello! How can I help you today?',
      required: true,
    }
  ],
  advancedFields: [ ... ],   // shown in collapsed "Advanced Settings" section
  branching: false,          // true for nodes that have branches
}
```

### Flow Node (runtime)
```js
{
  id: 'n-123',               // unique string ID
  type: 'greeting',          // matches nodeDefinitions key
  config: {                  // field values keyed by field.key
    message: 'Hello!',
  },
  branches: [                // only on branching nodes
    {
      id: 'b-456',
      condition: 'during_hours',
      label: 'Open',
      nodes: [ ... ]         // recursive
    }
  ]
}
```

### Template
```js
{
  id: 'dental-1',
  name: 'New Patient Intake',
  businessType: 'dental',
  description: 'Greet new patients, collect info, and book their first appointment.',
  nodeCount: 8,
  popular: true,
  flow: { trigger: { ... }, nodes: [ ... ] }  // complete flow tree
}
```

### Version Snapshot
```js
{
  id: 'v-789',
  version: 3,                // auto-incremented integer
  author: 'You',
  timestamp: Date,
  note: 'Added after-hours voicemail branch',
  flowJson: { ... },         // complete flow tree snapshot
}
```

---

## Design System

### Color Tokens (CSS custom properties)
```css
--color-primary: #4361EE      /* Indigo — CTAs, active states */
--color-primary-dark: #3451DE /* Hover state */
--color-surface: #FFFFFF      /* Panel backgrounds */
--color-bg: #F8F9FB           /* Page/canvas background */
--color-border: #E5E8EF       /* Dividers, input borders */
--color-text-dark: #111827    /* Primary text */
--color-text-mid: #6B7280     /* Secondary text */
--color-text-light: #9CA3AF   /* Tertiary text, placeholders */
--color-placeholder: #C0C7D4  /* Input placeholder text */
```

### Typography
- **Font:** Geist Variable (`@fontsource-variable/geist`) — loaded via npm, no CDN
- **Scale:** Mostly 10–15px for dense UI; 13px body default
- **Weights:** 400 (body), 500 (medium), 600 (semibold), 700 (bold/labels)

### Node Category Colors
| Category | Hex | Tailwind |
|----------|-----|---------|
| Core | `#0EA5E9` | sky-500 |
| Logic | `#F59E0B` | amber-500 |
| Integration | `#10B981` | emerald-500 |
| AI | `#F43F5E` | rose-500 |

### Conventions
- All interactive elements: `cursor-pointer focus:outline-none` (custom focus rings via `focus:ring-2 focus:ring-primary/30`)
- Animations: `animate-in fade-in`, `slide-in-from-right` via `tw-animate-css`
- Panels: `bg-surface border-l border-border shadow-xl`
- Cards: `rounded-xl border border-border bg-surface shadow-sm`
- React Flow canvas: Custom node/edge types override default styling; animated edges use CSS keyframe gradients defined in `index.css`

---

## Contributing

1. Run `npm run dev:all` to start both servers
2. Make changes in `src/`
3. `npm run build` to verify a production build passes with 0 errors
4. `npm run lint` to check for ESLint issues

When adding new shadcn components, use:
```bash
npx shadcn@latest add <component-name>
```
Components install to `src/components/ui/` automatically via the `components.json` configuration.

> Remember: this project uses `@base-ui/react`, not Radix. All menu item handlers use `onClick`, not `onSelect`.

---

*Built with React 19, Vite, Tailwind CSS 4, @xyflow/react, shadcn/base-ui, and Claude AI.*
