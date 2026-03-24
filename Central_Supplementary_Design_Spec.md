# Central AI — Supplementary Design Spec: Collapsible Mind-Tree Canvas + Flow Versioning

## For: Claude Code Prototype Session

This document supplements the main UI Design Spec. Read `Central_Workflow_Builder_UI_Design_Spec.md` first.

---

## PART 1: MIND-TREE CANVAS DESIGN

### The Problem with Flat Flow Builders

Every visual flow builder (n8n, Voiceflow, Synthflow, Gumloop) renders branches as parallel columns. When a decision node splits into 4 paths, you get 4 columns side by side. Each column has its own sub-flows. Two levels of branching = 16 columns. The canvas becomes unreadable spaghetti that you scroll through horizontally, losing context of where you are.

This is the exact problem Central's builder must avoid. A dental clinic flow has at least 3 branch points (business hours, caller type, intent detection). That's potentially dozens of parallel paths rendered flat.

### The Solution: Collapsible Mind-Tree

The flow canvas uses a **collapsible tree structure** — like a mind map — where branch paths are collapsed by default and expand on click.

#### How it works:

**The Main Trunk (always visible):**
```
Incoming Call
    ↓
Business Hours Check
    ├── [During Hours]  →  ••• (collapsed — click to expand)
    └── [After Hours]   →  ••• (collapsed — click to expand)
```

The user sees the top-level decision structure without seeing every detail of every branch. The trunk reads like a table of contents for the call flow.

**Expanded Branch (click "During Hours"):**
```
Incoming Call
    ↓
Business Hours Check
    ├── [During Hours]  ▼  (expanded)
    │       ↓
    │   Greeting + Caller ID
    │       ↓
    │   AI Intent Detection
    │       ├── [Book Appointment]  →  ••• (collapsed)
    │       ├── [Question]          →  ••• (collapsed)
    │       └── [Emergency]         →  ••• (collapsed)
    │
    └── [After Hours]   →  ••• (collapsed)
```

Only ONE branch level expands at a time per branch point. The user drills into the path they want to edit, does their work, collapses it, and moves to the next branch. They never see more than one path's detail at once.

**Deep expansion (click "Book Appointment" inside the expanded "During Hours"):**
```
Incoming Call
    ↓
Business Hours Check
    ├── [During Hours]  ▼
    │       ↓
    │   Greeting + Caller ID
    │       ↓
    │   AI Intent Detection
    │       ├── [Book Appointment]  ▼
    │       │       ↓
    │       │   Collect Info (name, insurance, reason)
    │       │       ↓
    │       │   Calendar Check → Book Slot
    │       │       ↓
    │       │   SMS Confirmation
    │       │       ↓
    │       │   End Call
    │       │
    │       ├── [Question]          →  •••
    │       └── [Emergency]         →  •••
    │
    └── [After Hours]   →  •••
```

### Collapsed Branch Card — What it Shows

Each collapsed branch is a card that shows just enough to understand what happens without expanding:

```
┌─────────────────────────────────────────┐
│  📋 New Patient                         │
│  5 nodes  •  Ends with: Book Appointment│
│  Last edited: Dr. Patel, March 10       │
│                              [Expand ▶] │
└─────────────────────────────────────────┘
```

Fields:
- **Branch name** (derived from the condition, e.g., "New Patient", "Emergency", "After Hours")
- **Node count** — how many steps in this branch
- **Terminal action** — what happens at the end (Book Appointment, Transfer Call, End Call, Send SMS)
- **Last edited by** — who touched this branch last (ties into versioning)
- **Expand button** — or click anywhere on the card

### Expanded Branch — What it Shows

When expanded, the branch shows its full sub-flow inline, indented under the parent branch point. The sub-flow uses the same node card format as the main trunk:
- Color-coded left border
- Node name
- 1-line config preview
- Click to open config panel on the right

### Interaction Details

**Expanding:**
- Click a collapsed branch card → it expands with a smooth animation (200ms slide-down)
- The other sibling branches stay collapsed and shift down to make room
- The expanded branch is highlighted with a subtle left-border accent matching its category color

**Collapsing:**
- Click the branch header again (now showing ▼) → collapses back
- Or: click a different sibling branch → this one collapses, the other expands (accordion behavior)

**Adding nodes inside a branch:**
- "+" button appears between nodes inside the expanded branch
- Node library panel (left) is context-aware: it knows you're inside a branch and offers relevant nodes

**Adding a new branch to a decision node:**
- Click "+" on the decision node itself → "Add Branch" option
- User names the branch and sets the condition
- New branch appears as a collapsed card

**Reordering branches:**
- Drag collapsed branch cards to reorder (purely visual priority, doesn't affect logic)

**Nesting limit:**
- Max 3 levels deep (branch → sub-branch → sub-sub-branch)
- Beyond 3 levels, the system suggests: "This flow is getting complex. Consider simplifying or using a sub-flow."
- This prevents users from creating deeply nested flows that become unmaintainable

### Why This Is Better Than Flat Layout

| Problem | Flat Layout (n8n/Voiceflow) | Mind-Tree (Central) |
|---------|---------------------------|---------------------|
| 4 branches after categorization | 4 parallel columns, horizontal scroll | 4 collapsed cards, vertically stacked |
| Editing one branch | Must visually filter out 3 other branches | Other branches are collapsed, zero distraction |
| Understanding the full flow | Zoom out to 30% to see everything (unreadable) | Trunk view shows the entire decision structure at a glance |
| Finding where something happens | Search + scroll + zoom | Read the trunk, expand the right branch |
| Complex flows (20+ nodes) | Canvas becomes a wall of boxes and lines | Trunk stays clean; complexity is inside branches |

### Implementation Notes for Claude Code

**Data structure:**
Each flow is a tree, not a flat list:
```javascript
{
  id: "flow_1",
  name: "Riverside Dental - Main Flow",
  trigger: { type: "incoming_call", config: {} },
  nodes: [
    { id: "n1", type: "business_hours", config: {...},
      branches: [
        { condition: "during_hours", label: "During Hours",
          nodes: [
            { id: "n2", type: "greeting", config: {...} },
            { id: "n3", type: "intent_detection", config: {...},
              branches: [
                { condition: "book_appointment", label: "Book Appointment",
                  nodes: [
                    { id: "n4", type: "collect_info", config: {...} },
                    { id: "n5", type: "book_appointment", config: {...} },
                    { id: "n6", type: "send_sms", config: {...} },
                    { id: "n7", type: "end_call", config: {...} }
                  ]
                },
                { condition: "question", label: "Question",
                  nodes: [...]
                },
                { condition: "emergency", label: "Emergency",
                  nodes: [...]
                }
              ]
            }
          ]
        },
        { condition: "after_hours", label: "After Hours",
          nodes: [...]
        }
      ]
    }
  ]
}
```

**React component structure:**
```
<FlowEditor>
  <NodeLibraryPanel />        <!-- left -->
  <FlowCanvas>                <!-- center -->
    <TrunkNode />             <!-- always visible -->
    <BranchPoint>
      <CollapsedBranch />     <!-- default state -->
      <ExpandedBranch>        <!-- on click -->
        <TrunkNode />
        <BranchPoint>
          <CollapsedBranch />
          ...
        </BranchPoint>
      </ExpandedBranch>
    </BranchPoint>
  </FlowCanvas>
  <NodeConfigPanel />          <!-- right, on node click -->
</FlowEditor>
```

**State management:**
- `expandedBranches: Set<string>` — tracks which branch IDs are currently expanded
- Accordion behavior: expanding a branch at a given level collapses siblings at that level
- Use React context to pass expand/collapse handlers down the tree

---

## PART 2: FLOW VERSIONING & GOVERNANCE

### Design Principle

**"One flow per phone number. One active version at a time."**

There are no competing flows. Multiple team members edit the same flow. Publishing creates a version snapshot. If something breaks, restore a previous version with one click.

### How It Works

**Backend model:**
```
Flow (1 per phone number)
  ├── published_version_id → points to the LIVE version
  ├── draft → current unpublished edits (null if no draft)
  └── versions[] → array of snapshots
       ├── v1 — { author, timestamp, note, flow_json }
       ├── v2 — { author, timestamp, note, flow_json }
       ├── v3 — { author, timestamp, note, flow_json }  ← LIVE
       └── v4 — { author, timestamp, note, flow_json }  ← DRAFT (unpublished)
```

Each version is a complete JSON snapshot of the flow tree (see data structure above). No diffs. No merging. Just snapshots and a pointer.

**Publishing:**
1. User edits the flow (creates an implicit draft)
2. Top bar shows status: "Draft — unpublished changes" (amber badge)
3. User clicks "Publish"
4. System creates a new version entry with the current flow JSON
5. `published_version_id` updates to point to the new version
6. AI receptionist immediately starts using the new flow
7. Status badge turns green: "Published"

**Restoring:**
1. User opens Version History (from "..." menu)
2. Sees a timeline of all published versions
3. Clicks "Restore" on v2
4. System creates a NEW version (v5) that's a copy of v2's flow JSON
5. v5 becomes the live version
6. History is preserved: v3 and v4 still exist, nothing is deleted

**Draft behavior:**
- Editing a published flow creates an implicit draft
- The live receptionist still follows the last published version
- The user sees their draft in the editor with an amber "Draft" badge
- Other team members see the published version by default
- "Discard changes" resets to the published version

### Version History UI

Accessible from the "..." menu in the top bar. Opens as a slide-over panel or modal.

```
┌──────────────────────────────────────────────────┐
│  Version History                           [✕]   │
│                                                  │
│  ● v5 — Dr. Patel — March 16            ACTIVE  │
│    "Restored v2 after intern's change"           │
│                                      [Preview]   │
│                                                  │
│  ○ v4 — Intern — March 15                        │
│    "Changed insurance to email workflow"          │
│                             [Preview] [Restore]  │
│                                                  │
│  ○ v3 — Dr. Patel — March 12                     │
│    "Added emergency triage path"                  │
│                             [Preview] [Restore]  │
│                                                  │
│  ○ v2 — Dr. Patel — March 10                     │
│    "Initial setup from Setup Call"                │
│                             [Preview] [Restore]  │
│                                                  │
│  ○ v1 — System — March 10                        │
│    "Auto-generated from Setup Call"               │
│                             [Preview] [Restore]  │
└──────────────────────────────────────────────────┘
```

- Active version: green dot + "ACTIVE" badge
- Past versions: gray dot
- Each entry: version number, author, date, optional note
- "Preview" opens a read-only view of that version in the editor
- "Restore" creates a new version from the selected snapshot
- No diffs. No merge UI. No branch comparison.

### Role-Based Permissions (Optional, Phase 2)

- **Owner:** Can edit and publish anything
- **Editor:** Can edit and publish, changes are logged
- **Viewer:** Can see the flow but not edit
- **Restricted Editor:** Can edit but must "Request Publish" — owner gets notification and approves/rejects

For MVP (Phase 1): Everyone who has access can edit and publish. Version history provides the safety net.

For Phase 2: Add roles when multi-location or franchise customers need tighter controls.

### What NOT to Build

- No diffs between versions (users are SMB owners, not developers)
- No merge conflicts (one flow per number eliminates this)
- No branching/forking of flows (Git-style branching adds complexity with zero value for this audience)
- No comments or annotations on versions (keep it simple)
- No automatic rollback triggers (users decide when to restore)
