# Central AI — Supplementary Design Spec: Voice-Based Setup Call (Layer 1)

## For: Claude Code Prototype Session

This document specifies the **Setup Call** experience — the voice-powered onboarding that creates a complete call flow from a conversation. This is Layer 1 of the 3-layer architecture (serves 80% of users). Read `Central_Workflow_Builder_UI_Design_Spec.md` for overall context.

---

## THE CONCEPT

Central's AI assistant "Max" calls the user **inside the browser**. Max asks 7-8 structured questions via voice. As the user answers, a call flow builds itself in real-time on-screen. By the end of the conversation, the user has a fully configured voice receptionist — without ever touching a flow editor.

The interaction is **multimodal**: Max speaks and listens, but the right side of the screen adapts to each question — sometimes showing a text chat, sometimes an integration picker, sometimes a file drop zone, sometimes a visual time-picker. The input surface changes based on what the question needs.

---

## VISUAL LIFECYCLE: 4 STAGES

### Stage 1: The Welcome (0-10 seconds)

**Full-screen centered.**

A glowing gradient voice orb sits in the center of the screen. Think: animated radial gradient pulsing between cyan (#0EA5E9) and emerald (#10B981), with a subtle glow halo. Reference implementation: [openai-realtime-blocks](https://github.com/cameronking4/openai-realtime-blocks).

Background: dark (#0F172A). No chrome, no nav, no distractions.

Max speaks:

> "Hey! I'm Max, Central's AI assistant. I'm going to help you set up your voice receptionist in about 3 minutes. I'll ask you a few questions about your business, and by the end, your phones will be answered 24/7. Ready? Let's start."

The orb pulses with Max's speech amplitude. When Max finishes talking, the orb shifts to a "listening" state — smaller, steady pulse, ring highlight — indicating it's the user's turn.

**No user input required here.** Max auto-advances to Question 1 after a 1-second pause.

### Stage 2: The Transition (after Max's intro, ~2 seconds)

The orb animates from center to the **left 20%** of the screen. It smoothly scales down and docks into a persistent left sidebar.

The **right 80%** wakes up: a clean workspace area fades in with a subtle slide-up animation. This is the **adaptive input surface** — it changes layout based on what each question needs.

The left panel (20%) contains:
- Max's voice orb (always visible, always pulsing when speaking/listening)
- A text transcript of the conversation so far (scrollable, auto-updates)
- A small progress indicator: "Question 1 of 7" with dots or a minimal progress bar
- A "Type instead" text input at the bottom (always available as fallback)

### Stage 3: The Q&A Loop (bulk of the experience, ~3 minutes)

Max asks each question by voice. The right panel adapts per question (see Question Design below). User can answer via:
- **Voice** (default — just speak, Max listens)
- **Text** (type in the left-panel chat input)
- **Visual interaction** (click, drag, toggle on the right panel — depends on the question)

After each answer is captured, three things happen simultaneously:
1. Max acknowledges the answer briefly ("Got it — dental clinic.")
2. The right panel shows a **flow preview** that grows with each answer — nodes appear and connect in real-time with a smooth animation
3. Max immediately moves to the next question

The flow preview is a simplified version of the mind-tree canvas. It builds top-to-bottom as answers come in. Nodes glow briefly when they're created, then settle into their steady state. The user watches their receptionist take shape.

### Stage 4: The Reveal (after all questions)

Max speaks: "All set! Here's your receptionist. Let me walk you through what I built."

The left panel collapses. The completed flow expands to full screen in the **Flow Editor** view (Layer 2). Max does a quick voice tour — highlighting 2-3 key nodes and explaining what they do. Each node highlights with a glow border as Max describes it.

Then:
- "Want to test it? Hit the phone icon and I'll call you as a pretend patient."
- CTA button: **"Test Your Receptionist"** (launches the Call Simulator)
- Secondary: "Edit Flow" (enters the Flow Editor as power user)
- Tertiary: "Looks good — Go Live"

---

## QUESTION DESIGN: THE 7 QUESTIONS

Each question is designed to extract one layer of the call flow. The order matters — each answer unlocks the context for the next question.

---

### Q1: "What kind of business do you run?"

**What Max says:**
"First up — what kind of business do you run? Like a dental clinic, law firm, salon... just tell me in your own words."

**Right panel — Adaptive Input:**
- Grid of 8 common industry cards (icon + label): Dental, Legal, HVAC/Plumbing, Salon/Spa, Medical Practice, Real Estate, Auto Repair, Other
- Each card is clickable
- Below the grid: a text field labeled "Or describe your business" for unlisted industries
- User can also just speak the answer — voice-to-text fills in automatically

**What this creates in the flow:**
- Sets the **industry template base** — pre-populates greeting language, common intents, terminology
- Creates the **Incoming Call** trigger node (always present)
- Creates a **Greeting** node with industry-appropriate default: "Thanks for calling [Business Name]! How can I help you today?"

**Smart behavior:**
- If user says "dental clinic," Max follows up: "Great — Riverside Dental, or do you have a different name?" (pulls from user's account if available)
- Sets industry context that makes later questions smarter (e.g., dental → "appointments" not "bookings," "patients" not "clients")

**Flow preview after Q1:**
```
[Incoming Call] → [Greeting: "Thanks for calling {Business}!"]
```

---

### Q2: "What are your business hours?"

**What Max says:**
"When are you open? I'll make sure your receptionist knows when to handle calls normally versus after hours."

**Right panel — Adaptive Input:**
- A **visual weekly schedule picker** (7-day grid)
- Each day shows a toggle (Open/Closed) + time range selector (start/end)
- Pre-filled with industry defaults (e.g., Dental → Mon-Fri 8a-6p, Sat 9a-1p, Sun Closed)
- User can adjust visually OR just speak: "Monday through Friday 9 to 5, closed weekends"
- Voice input auto-fills the schedule grid in real-time

**What this creates in the flow:**
- Creates a **Business Hours Check** node right after Greeting
- Creates two branches: **During Hours** and **After Hours**
- After Hours branch gets a default **After-Hours Greeting** node: "We're currently closed. Our hours are [hours]. I can help you leave a message or book an appointment for when we're back."

**Flow preview after Q2:**
```
[Incoming Call] → [Greeting] → [Business Hours?]
                                  ├── During Hours → •••
                                  └── After Hours  → [After-Hours Greeting] → •••
```

---

### Q3: "What do people usually call you about?"

**What Max says:**
"What are the main reasons people call you? For example — appointments, questions about services, pricing, emergencies... list as many as you want."

**Right panel — Adaptive Input:**
- A set of **suggested reason chips** based on industry (pre-populated from Q1):
  - Dental: Book Appointment, Cancel/Reschedule, Insurance Question, Emergency/Pain, Directions/Hours, New Patient Info, Billing Question
  - Legal: Schedule Consultation, Case Status, New Client Inquiry, Document Request, Emergency/Urgent
- Chips are toggleable (selected = filled cyan, unselected = outlined)
- "Add your own" field at the bottom for custom reasons
- User can also just speak — Max parses the list and toggles the matching chips

**What this creates in the flow:**
- Creates an **AI Intent Detection** node under the During Hours branch
- Each selected reason becomes a **branch** off the intent node
- Each branch gets a placeholder terminal action (to be refined in later questions)

**Why this question is critical:**
This is the core routing logic. Everything else hangs off these branches. Getting this right means the flow actually matches how the business gets called.

**Flow preview after Q3:**
```
[Incoming Call] → [Greeting] → [Business Hours?]
                                  ├── During Hours → [Intent Detection]
                                  │                    ├── Book Appointment → •••
                                  │                    ├── Insurance Question → •••
                                  │                    ├── Emergency → •••
                                  │                    └── General Question → •••
                                  └── After Hours → [After-Hours Greeting] → •••
```

---

### Q4: "How do you handle appointments today?"

**What Max says:**
"Let's set up appointment booking. Do you use any scheduling tool — like Google Calendar, Calendly, Acuity, or something else? Or do you handle it manually?"

**Right panel — Adaptive Input:**
- A grid of **integration cards** with recognizable logos:
  - Google Calendar (icon)
  - Calendly (icon)
  - Cal.com (icon)
  - Acuity / Setmore (icon)
  - "We use a different tool" (generic icon)
  - "No tool — just a paper book" (manual icon)
- Clicking an integration card triggers an **OAuth connect flow** (or shows a "connect later" option)
- Below: "What types of appointments do you offer?" with a tag input (e.g., "Cleaning - 45 min", "Consultation - 30 min", "Emergency - 15 min")
- If user says "Google Calendar" by voice, the Google Calendar card highlights and a connect button appears

**What this creates in the flow:**
- Fills in the **Book Appointment** branch: Ask Question (new/existing patient) → Collect Info (name, phone) → Calendar Check → Book Slot → SMS Confirmation → End Call
- Creates the **Book Appointment** integration node with the selected calendar provider
- Creates a **Send SMS** confirmation node at the end of the booking branch

**Flow preview after Q4:**
```
Book Appointment → [New/Existing?] → [Collect Info] → [Check Calendar] → [Book Slot] → [SMS Confirm] → [End Call]
```
(This branch expands inside the "Book Appointment" mind-tree branch)

---

### Q5: "What should happen after hours?"

**What Max says:**
"When someone calls outside your business hours, what would you like to happen? For example — take a message, let them book for the next available slot, or both?"

**Right panel — Adaptive Input:**
- 3 **option cards** (radio-style, pick one primary):
  - **Take a Message** — "Record a voicemail, transcribe it, and email it to you"
  - **Book Next Slot** — "Let them book the next available appointment automatically"
  - **Both** — "Offer booking first, take a message if they prefer"
- Below the cards: a toggle — "Enable emergency override?" (if yes → links to Q6)
- User can speak naturally: "Just take a message" or "Let them book but also give an option to leave a message"

**What this creates in the flow:**
- Fills in the **After Hours** branch with the chosen path
- If "Both" selected: After-Hours Greeting → Ask Question ("Book or leave message?") → two sub-branches
- If emergency override enabled → adds an intent check for urgency before the standard after-hours path

**Flow preview after Q5:**
```
After Hours → [After-Hours Greeting] → [Book or Message?]
                                          ├── Book → [Calendar Check] → [Book Slot] → [SMS] → [End]
                                          └── Message → [Record Message] → [Email to Owner] → [End]
```

---

### Q6: "Any calls that should reach you directly?"

**What Max says:**
"Are there situations where a call should come straight to you or someone on your team? Like emergencies, VIP clients, or specific keywords?"

**Right panel — Adaptive Input:**
- A **transfer rules builder** with simple form fields:
  - Row 1: "If the caller says ___ → transfer to ___" (e.g., "emergency" → "Dr. Patel's cell")
  - Row 2: "If the caller is ___ → transfer to ___" (e.g., "existing patient with urgent issue" → "front desk")
  - "+ Add another rule" button
- Each transfer destination has: Name, Phone Number, Label (e.g., "Dr. Patel — Cell", "Front Desk", "On-Call")
- A **contacts drag-drop zone**: "Drag a CSV or vCard to import your team" OR manual entry
- Voice input: "If it's an emergency, call me at 555-0123" → auto-fills the rule

**What this creates in the flow:**
- Creates **Transfer Call** nodes at the right points in the flow
- Emergency branch: Triage Questions → Severity Check → Transfer to On-Call + SMS Alert
- VIP/keyword triggers added as conditional checks before standard routing

**Flow preview after Q6:**
```
Emergency → [Triage Questions] → [Transfer: Dr. Patel Cell] + [SMS Alert to Team]
```

---

### Q7: "Do you have any info you'd like your receptionist to know?"

**What Max says:**
"Last thing — do you have a website, FAQ page, or any documents with common questions and answers? Your receptionist can use these to answer callers on the spot."

**Right panel — Adaptive Input:**
- A **knowledge base upload zone** with 3 options:
  - **Website URL** — text field: "Paste your website URL and I'll learn from it" (shows a crawl progress bar when submitted)
  - **Upload files** — drag-and-drop zone: "Drop PDFs, Word docs, or text files here" (accepts .pdf, .docx, .txt)
  - **Type it** — expandable text area: "Paste or type your FAQs directly"
- Shows a preview of extracted Q&As as they're processed: "Found 12 questions from your website"
- Confidence indicator: "Your receptionist can now answer questions about: insurance accepted, services offered, pricing, parking, COVID policy..."

**What this creates in the flow:**
- Creates **Knowledge Base Answer** nodes on the "General Question" and "Insurance Question" branches
- Each KB-powered branch: Intent Detected → Knowledge Base Lookup → If answer found → Speak Answer → End Call / If not found → Take Message or Transfer

**Flow preview after Q7:**
```
Insurance Question → [Knowledge Base Lookup] → [Answer Found?]
                                                  ├── Yes → [Speak Answer] → [End]
                                                  └── No  → [Take Message] → [End]
```

---

## THE COMPLETE DUMMY FLOW: DR. PATEL'S DENTAL CLINIC

Here's the full flow that gets generated from a complete Setup Call session.

### Answers Given:
| Q# | Question | Dr. Patel's Answer |
|----|----------|-------------------|
| Q1 | Business type | "Dental clinic — Riverside Dental" |
| Q2 | Hours | Mon-Fri 8a-6p, Sat 9a-1p, Sun closed |
| Q3 | Call reasons | Appointments, insurance questions, emergencies, general questions |
| Q4 | Appointment tool | Google Calendar — cleanings (45 min), consultations (30 min), emergency (15 min) |
| Q5 | After hours | Both (book + message), emergency override on |
| Q6 | Direct transfers | Emergency → Dr. Patel cell (555-0123), VIP flag for patients with active treatment plans |
| Q7 | Knowledge base | riversidedental.com + uploaded insurance FAQ PDF |

### Generated Flow (Mind-Tree View):

```
Incoming Call
    ↓
Greeting: "Thanks for calling Riverside Dental! How can I help you today?"
    ↓
Business Hours Check
    ├── [During Hours: Mon-Fri 8a-6p, Sat 9a-1p]
    │       ↓
    │   Caller Type Check (CRM lookup)
    │       ↓
    │   AI Intent Detection
    │       ├── [Book Appointment]
    │       │       ↓
    │       │   Ask: "New or existing patient?"
    │       │       ↓
    │       │   Collect Info (name, phone, insurance)
    │       │       ↓
    │       │   Google Calendar → Check availability
    │       │       ↓
    │       │   Book slot → Confirm by voice
    │       │       ↓
    │       │   Send SMS: "Your appointment is confirmed for {date} at {time}"
    │       │       ↓
    │       │   End Call: "You're all set! See you then."
    │       │
    │       ├── [Insurance Question]
    │       │       ↓
    │       │   Knowledge Base Lookup (FAQ PDF + website)
    │       │       ├── Answer Found → Speak answer → "Anything else?" → End Call
    │       │       └── No Answer → "Let me have the team get back to you" → Record details → Email front desk → End Call
    │       │
    │       ├── [Emergency / Pain]
    │       │       ↓
    │       │   Triage: "Can you describe what's happening?"
    │       │       ↓
    │       │   Severity check (AI assessment)
    │       │       ├── Urgent → Transfer to Dr. Patel (cell) + SMS alert to team
    │       │       └── Non-urgent → Book next emergency slot (15 min) → SMS confirm → End
    │       │
    │       └── [General Question]
    │               ↓
    │           Knowledge Base Lookup (website)
    │               ├── Answer Found → Speak answer → End Call
    │               └── No Answer → Record Message → Email to office → End Call
    │
    └── [After Hours: evenings, Sunday]
            ↓
        After-Hours Greeting: "We're currently closed. Our hours are Mon-Fri 8-6, Sat 9-1."
            ↓
        Emergency Check (AI): "Is this an emergency?"
            ├── [Yes — Emergency]
            │       ↓
            │   Triage → Transfer to Dr. Patel (cell) + SMS alert
            │
            └── [No — Standard After-Hours]
                    ↓
                Ask: "Would you like to book an appointment, or leave a message?"
                    ├── Book → Calendar Check → Book next available → SMS → End
                    └── Message → Record voicemail → Transcribe → Email to Dr. Patel → End
```

**Node count:** 28 nodes across 8 branches
**Estimated generation time:** ~3 minutes of conversation
**Manual equivalent:** ~45 minutes in a flow editor

---

## COMPONENT ARCHITECTURE (for prototype)

### Layout Components

```
<SetupCallPage>                         // Full-screen container
  ├── <VoiceOrbWelcome />               // Stage 1: centered orb, auto-plays intro
  │
  ├── <SetupCallWorkspace>              // Stage 2-3: split layout
  │     ├── <LeftPanel>                 // 20% width
  │     │     ├── <VoiceOrb />          // Persistent, smaller, pulsing
  │     │     ├── <Transcript />        // Scrollable chat transcript
  │     │     ├── <ProgressBar />       // "Q3 of 7"
  │     │     └── <TextInput />         // "Type instead" fallback
  │     │
  │     └── <RightPanel>               // 80% width — swaps per question
  │           ├── <IndustryPicker />    // Q1: industry card grid
  │           ├── <ScheduleBuilder />   // Q2: weekly hours grid
  │           ├── <IntentChips />       // Q3: reason tag selector
  │           ├── <IntegrationPicker /> // Q4: calendar integration cards + appt types
  │           ├── <AfterHoursOptions /> // Q5: option cards + emergency toggle
  │           ├── <TransferRules />     // Q6: rule builder + contacts import
  │           ├── <KnowledgeUpload />   // Q7: URL + file drop + text input
  │           └── <FlowPreview />       // Persistent: grows with each answer
  │
  └── <SetupCallReveal>                // Stage 4: full-screen flow + test CTA
        ├── <FlowEditor />             // Full mind-tree view of generated flow
        ├── <MaxNarration />           // Max voice tour of key nodes
        └── <CTABar>
              ├── "Test Your Receptionist"   // Primary — launches Call Simulator
              ├── "Edit Flow"                // Secondary — enters Flow Editor
              └── "Go Live"                  // Tertiary — publishes immediately
```

### Voice Orb Component

```
<VoiceOrb>
  Props:
    state: "speaking" | "listening" | "thinking" | "idle"
    size: "large" (welcome) | "small" (docked)
    amplitude: number (0-1, drives pulse intensity during speech)

  Visual States:
    speaking:  Fast animated gradient pulse (cyan↔emerald), glow radius expands with amplitude
    listening: Steady slow pulse, ring highlight, subtle "recording" indicator
    thinking:  Gradient rotates slowly, slight fade
    idle:      Static gradient, minimal glow

  Animation:
    - CSS: radial-gradient with animated stops + box-shadow for glow
    - Amplitude drives scale transform (1.0 to 1.15 range)
    - Transition from large→small: 600ms ease-out with position: absolute → fixed
```

### Flow Preview Component

```
<FlowPreview>
  Props:
    nodes: FlowNode[]     // Grows as answers come in
    activeNodeId: string  // Node currently being created (glows)

  Behavior:
    - Renders a simplified mind-tree (same structure as Flow Editor but read-only)
    - New nodes animate in with a 300ms scale-up + glow effect
    - Branches that haven't been filled yet show as "•••" placeholder cards
    - Auto-scrolls to keep the newest node visible
    - Collapsed by default during Q&A; can be expanded to see full tree
    - At Stage 4 (Reveal), this transitions into the full FlowEditor component

  Layout:
    - Sits in the bottom-right of the RightPanel during Q&A (overlays the input surface)
    - Height: 30% of viewport by default, expandable to 100%
    - Semi-transparent dark background so it doesn't compete with the input surface
```

### Adaptive Right Panel

```
<RightPanel>
  Props:
    currentQuestion: 1-7
    answers: Record<number, Answer>

  Behavior:
    - Cross-fades between input surfaces when question changes (200ms fade)
    - Each input surface is independent — user can go back and change previous answers
    - Persistent FlowPreview floats in bottom-right corner
    - Input surfaces are form-based — no code, no JSON, no complexity
```

---

## DATA MODEL

### Setup Call Session

```typescript
interface SetupCallSession {
  id: string;
  userId: string;
  status: "in_progress" | "completed" | "abandoned";
  startedAt: Date;
  completedAt?: Date;

  // Answers
  businessType: string;                    // Q1
  businessName: string;                    // Q1 follow-up
  schedule: WeeklySchedule;                // Q2
  callReasons: string[];                   // Q3
  calendarProvider?: string;               // Q4
  appointmentTypes?: AppointmentType[];    // Q4
  afterHoursMode: "message" | "book" | "both"; // Q5
  emergencyOverride: boolean;              // Q5
  transferRules: TransferRule[];           // Q6
  knowledgeBase: KnowledgeSource[];        // Q7

  // Output
  generatedFlow?: FlowDefinition;         // The complete flow JSON
}

interface WeeklySchedule {
  [day: string]: { open: boolean; start?: string; end?: string };
}

interface AppointmentType {
  name: string;
  duration: number; // minutes
}

interface TransferRule {
  condition: string;       // "emergency", "VIP", keyword
  destination: string;     // phone number
  label: string;           // "Dr. Patel — Cell"
}

interface KnowledgeSource {
  type: "url" | "file" | "text";
  value: string;           // URL, file path, or raw text
  status: "processing" | "ready" | "failed";
  extractedCount?: number; // number of Q&As found
}
```

### Flow Generation Logic

After all 7 questions are answered, the system generates a `FlowDefinition` (same JSON structure defined in the main Supplementary Design Spec). The generation follows this mapping:

| Question | Nodes Created |
|----------|--------------|
| Q1 (Business type) | Incoming Call, Greeting (with business name + industry tone) |
| Q2 (Hours) | Business Hours Check node + During/After branches |
| Q3 (Call reasons) | AI Intent Detection + one branch per reason |
| Q4 (Appointments) | Book Appointment chain: Ask → Collect → Calendar → Book → SMS → End |
| Q5 (After hours) | After-Hours Greeting + book/message sub-branches |
| Q6 (Transfers) | Transfer Call nodes + triage logic on emergency branch |
| Q7 (Knowledge base) | Knowledge Base Answer nodes on question/insurance branches |

---

## INTERACTION DETAILS

### Voice Input Handling

- **Wake word:** None — Max listens continuously when in "listening" state
- **End-of-speech detection:** 1.5 second silence threshold triggers processing
- **Fallback:** If voice fails or user prefers text, the left-panel text input is always available
- **Hybrid input:** User can speak AND click/drag on the right panel simultaneously. Example: user says "Google Calendar" while also clicking the Google Calendar card — the system deduplicates
- **Correction:** User can say "wait, go back" or "change that" — Max re-asks the current question
- **Skip:** User can say "skip this" or "I'll set this up later" — the question gets a default value and the branch uses a placeholder node

### Right Panel Transitions

Each question transition follows this sequence:
1. Max finishes speaking the new question (orb in "speaking" state)
2. Right panel cross-fades to the new input surface (200ms)
3. Orb switches to "listening" state
4. FlowPreview animates new nodes from previous answer (300ms)
5. User interacts (voice, text, or visual)
6. Max confirms ("Got it"), brief pause (500ms)
7. Next question begins

### Progress & Navigation

- Progress dots (top of left panel) show completed questions in green, current in cyan, upcoming in gray
- User can click any completed dot to revisit a question — the right panel switches back, existing answer is pre-filled
- Changing a previous answer triggers a **flow regeneration** for all downstream nodes (animated rebuild)
- The flow preview shows a brief "recalculating..." state during regeneration

### Error States

- **Mic permission denied:** Show a clear prompt: "I need microphone access to hear you. Click Allow, or you can type your answers instead." Text input remains functional.
- **Can't understand:** After 2 failed voice recognitions, Max says: "I didn't catch that. Could you try again, or type it below?" Highlights the text input.
- **Integration OAuth fails:** Show inline error: "Couldn't connect to Google Calendar. You can try again or connect later from Settings." Skip to next question.
- **Website crawl fails:** "I couldn't reach that URL. Want to try a different one, or upload a file instead?"

---

## WHAT NOT TO BUILD (for prototype)

- **No actual speech-to-text** — simulate with pre-scripted interactions or text-only mode
- **No real OAuth flows** — show the integration card as "connected" on click
- **No real website crawling** — fake the "processing" state and show dummy extracted Q&As
- **No real calendar integration** — show mock availability data
- **No real-time voice orb amplitude tracking** — use a CSS animation loop instead
- **No conversation branching** — prototype follows the fixed 7-question sequence; skip is OK but don't build conditional question logic

**What IS important to prototype:**
- The visual lifecycle (centered orb → split layout → reveal)
- The adaptive right panel (different input surface per question)
- The flow preview building in real-time
- The overall feel of "I talked for 3 minutes and got a working receptionist"

---

## DESIGN TOKENS

Use the same palette as the Flow Editor:

| Token | Value | Usage |
|-------|-------|-------|
| `--bg-dark` | #0F172A | Welcome screen, left panel bg |
| `--bg-mid` | #1E293B | Right panel bg, cards |
| `--cyan` | #0EA5E9 | Max orb primary, accent, progress |
| `--emerald` | #10B981 | Max orb secondary, success states |
| `--amber` | #F59E0B | Warning, schedule picker |
| `--rose` | #F43F5E | Emergency, errors |
| `--text-primary` | #F8FAFC | Headings on dark bg |
| `--text-secondary` | #CBD5E1 | Body text on dark bg |
| `--text-muted` | #94A3B8 | Labels, placeholders |

Orb gradient: `radial-gradient(circle, var(--cyan), var(--emerald))` with animated angle and stops.

Typography: System font stack (Inter preferred). Clean, generous spacing. No clutter.
