import { useState, useRef } from 'react';
import AppShell from './components/AppShell';
import TemplateGallery from './components/TemplateGallery';
import FlowEditor from './components/FlowEditor';
import CallSimulator from './components/CallSimulator';
import SetupCall from './components/SetupCall';
import Onboarding from './components/Onboarding';

function App() {
  const [activeView, setActiveView] = useState('home'); // home | workflows | editor | setupcall
  const [currentFlow, setCurrentFlow] = useState(null);
  const [flowName, setFlowName] = useState('');
  const [showSimulator, setShowSimulator] = useState(false);
  const [showNewWorkflowSidebar, setShowNewWorkflowSidebar] = useState(false);
  const editorFlowRef = useRef(null);

  const savedFlows = [
    { id: 'saved-1', name: 'Riverside Dental — Main Flow', status: 'Published', nodeCount: 14 },
    { id: 'saved-2', name: 'After Hours Emergency', status: 'Draft', nodeCount: 6 },
  ];

  const handleSelectTemplate = (template) => {
    const flow = template.flow || { trigger: { type: 'incoming_call', config: {} }, nodes: [] };
    setCurrentFlow(flow);
    editorFlowRef.current = flow;
    setFlowName(template.name || 'Untitled Flow');
    setActiveView('editor');
  };

  // "Create New Workflow" opens the sidebar
  const handleOpenSidebar = () => {
    setShowNewWorkflowSidebar(true);
  };

  const handleCloseSidebar = () => {
    setShowNewWorkflowSidebar(false);
  };

  const handleStartScratch = () => {
    setShowNewWorkflowSidebar(false);
    const emptyFlow = { trigger: { type: 'incoming_call', config: {} }, nodes: [] };
    setCurrentFlow(emptyFlow);
    editorFlowRef.current = emptyFlow;
    setFlowName('New Flow');
    setActiveView('editor');
  };

  const handleChooseMax = () => {
    setShowNewWorkflowSidebar(false);
    // Unlock audio playback by playing a silent buffer during this user gesture.
    // This allows SetupCall's useEffect to play TTS + transition sound without being blocked.
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const buf = ctx.createBuffer(1, 1, 22050);
      const src = ctx.createBufferSource();
      src.buffer = buf;
      src.connect(ctx.destination);
      src.start(0);
      window.__audioUnlocked = true;
      // Also unlock HTML Audio element
      const silence = new Audio('data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=');
      silence.volume = 0;
      silence.play().catch(() => {});
    } catch (e) { /* ignore */ }
    setActiveView('setupcall');
  };

  const handleSelectTemplateFromSidebar = (template) => {
    setShowNewWorkflowSidebar(false);
    handleSelectTemplate(template);
  };

  const handleSetupComplete = (answers, action, prebuiltFlow) => {
    const generatedFlow = prebuiltFlow || generateFlowFromAnswers(answers);
    const name = prebuiltFlow
      ? (answers?.flowName || 'Max-Generated Flow')
      : (answers.businessName ? `${answers.businessName} — Main Flow` : 'My Receptionist Flow');
    setCurrentFlow(generatedFlow);
    editorFlowRef.current = generatedFlow;
    setFlowName(name);

    if (action === 'test') {
      setActiveView('editor');
      setTimeout(() => setShowSimulator(true), 500);
    } else {
      setActiveView('editor');
    }
  };

  const handleStartOnboarding = () => {
    // Unlock audio playback for Max's voice guidance
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const buf = ctx.createBuffer(1, 1, 22050);
      const src = ctx.createBufferSource();
      src.buffer = buf;
      src.connect(ctx.destination);
      src.start(0);
      const silence = new Audio('data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=');
      silence.volume = 0;
      silence.play().catch(() => {});
    } catch (e) { /* ignore */ }
    setActiveView('onboarding');
  };

  const handleNavigate = (view) => {
    setActiveView(view);
  };

  return (
    <AppShell activeView={activeView} onNavigate={handleNavigate} onStartOnboarding={handleStartOnboarding}>
      {activeView === 'workflows' && (
        <TemplateGallery
          onSelectTemplate={handleSelectTemplateFromSidebar}
          onStartScratch={handleStartScratch}
          onChooseMax={handleChooseMax}
          savedFlows={savedFlows}
          embedded
          showSidebar={showNewWorkflowSidebar}
          onOpenSidebar={handleOpenSidebar}
          onCloseSidebar={handleCloseSidebar}
        />
      )}

      {activeView === 'editor' && (
        <FlowEditor
          initialFlow={currentFlow}
          flowName={flowName}
          onBack={() => setActiveView('workflows')}
          onOpenSimulator={() => setShowSimulator(true)}
          onNodesChange={(tree) => { editorFlowRef.current = tree; }}
        />
      )}

      {activeView === 'setupcall' && (
        <SetupCall
          onComplete={handleSetupComplete}
          onBack={() => setActiveView('workflows')}
        />
      )}

      {activeView === 'onboarding' && (
        <Onboarding
          onBack={() => setActiveView('home')}
          onComplete={(data) => {
            console.log('Onboarding complete:', data);
            setActiveView('home');
          }}
        />
      )}

      {showSimulator && (
        <CallSimulator
          nodes={editorFlowRef.current}
          onClose={() => setShowSimulator(false)}
        />
      )}

    </AppShell>
  );
}

// Generate a tree-structured flow from setup call answers
function generateFlowFromAnswers(answers) {
  const flow = {
    trigger: { type: 'incoming_call', config: {} },
    nodes: [],
  };

  // Greeting
  const greeting = {
    id: 'gen-1',
    type: 'greeting',
    config: { message: `Thanks for calling ${answers.businessName || 'our office'}! How can I help you today?` },
  };

  // Business hours
  const hours = {
    id: 'gen-2',
    type: 'business_hours',
    config: { ...answers.schedule },
    branches: [],
  };

  // During Hours branch
  const duringHoursBranch = {
    id: 'gen-b1',
    condition: 'during_hours',
    label: 'During Hours',
    nodes: [],
  };

  // Intent detection
  if (answers.intents.length > 0) {
    const intentNode = {
      id: 'gen-3',
      type: 'ai_intent',
      config: { intents: answers.intents.join(', ') },
      branches: [],
    };

    answers.intents.forEach((intent, i) => {
      const branch = {
        id: `gen-ib${i}`,
        condition: intent.toLowerCase().replace(/\s+/g, '_'),
        label: intent,
        nodes: [],
      };

      // Fill book appointment branch
      if (intent.toLowerCase().includes('appointment') || intent.toLowerCase().includes('book')) {
        branch.nodes = [
          { id: `gen-ba${i}-1`, type: 'collect_info', config: { fields: ['Name', 'Phone'] } },
          { id: `gen-ba${i}-2`, type: 'book_appointment', config: { calendarSource: answers.calendar || 'Google Calendar' } },
          { id: `gen-ba${i}-3`, type: 'send_sms', config: { message: 'Your appointment is confirmed!' } },
          { id: `gen-ba${i}-4`, type: 'end_call', config: { closingMessage: "You're all set! See you then." } },
        ];
      }
      // Emergency branch
      else if (intent.toLowerCase().includes('emergency')) {
        const transferRule = answers.transferRules.find((r) => r.condition && r.destination);
        branch.nodes = [
          { id: `gen-em${i}-1`, type: 'ask_question', config: { question: "Can you describe what's happening?" } },
          { id: `gen-em${i}-2`, type: 'transfer_call', config: { transferTo: transferRule?.label || 'On-Call', holdMessage: "I'm connecting you right away." } },
        ];
      }
      // Question/Insurance branch
      else if (intent.toLowerCase().includes('question') || intent.toLowerCase().includes('insurance')) {
        branch.nodes = [
          { id: `gen-q${i}-1`, type: 'knowledge_base', config: { sources: answers.knowledgeUrl ? ['Website'] : ['FAQ Document'] } },
          { id: `gen-q${i}-2`, type: 'end_call', config: { closingMessage: 'I hope that helped! Call back anytime.' } },
        ];
      }
      // Default
      else {
        branch.nodes = [
          { id: `gen-d${i}-1`, type: 'ask_question', config: { question: `Tell me more about your ${intent.toLowerCase()} request.` } },
          { id: `gen-d${i}-2`, type: 'end_call', config: { closingMessage: 'Thanks for calling!' } },
        ];
      }

      intentNode.branches.push(branch);
    });

    duringHoursBranch.nodes.push(intentNode);
  }

  hours.branches.push(duringHoursBranch);

  // After Hours branch
  const afterHoursBranch = {
    id: 'gen-b2',
    condition: 'after_hours',
    label: 'After Hours',
    nodes: [
      { id: 'gen-ah-1', type: 'greeting', config: { message: `We're currently closed. Our regular hours are Monday through Friday.` } },
    ],
  };

  if (answers.afterHoursMode === 'message') {
    afterHoursBranch.nodes.push(
      { id: 'gen-ah-2', type: 'record_message', config: { prompt: 'Please leave a message after the tone.' } },
      { id: 'gen-ah-3', type: 'end_call', config: { closingMessage: "Got it! We'll get back to you as soon as we open." } },
    );
  } else if (answers.afterHoursMode === 'book') {
    afterHoursBranch.nodes.push(
      { id: 'gen-ah-2', type: 'book_appointment', config: { calendarSource: answers.calendar || 'Google Calendar' } },
      { id: 'gen-ah-3', type: 'send_sms', config: { message: 'Your appointment has been booked!' } },
      { id: 'gen-ah-4', type: 'end_call', config: { closingMessage: 'Your appointment is all set!' } },
    );
  } else if (answers.afterHoursMode === 'both') {
    afterHoursBranch.nodes.push({
      id: 'gen-ah-ask',
      type: 'ask_question',
      config: { question: 'Would you like to book an appointment, or leave a message?' },
      branches: [
        {
          id: 'gen-ahb1',
          condition: 'book',
          label: 'Book',
          nodes: [
            { id: 'gen-ahb1-1', type: 'book_appointment', config: { calendarSource: answers.calendar || 'Google Calendar' } },
            { id: 'gen-ahb1-2', type: 'end_call', config: { closingMessage: 'Your appointment is booked!' } },
          ],
        },
        {
          id: 'gen-ahb2',
          condition: 'message',
          label: 'Message',
          nodes: [
            { id: 'gen-ahb2-1', type: 'record_message', config: { prompt: 'Please leave a message.' } },
            { id: 'gen-ahb2-2', type: 'end_call', config: { closingMessage: "We'll get back to you soon!" } },
          ],
        },
      ],
    });
  }

  hours.branches.push(afterHoursBranch);

  flow.nodes = [greeting, hours];
  return flow;
}

export default App;
