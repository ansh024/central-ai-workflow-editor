import { useState, useRef, useEffect } from 'react';
import { NODE_TYPES, NODE_CATEGORIES } from '../data/nodeDefinitions';
import { X, Send, RotateCcw, Phone, PhoneOff, Volume2 } from 'lucide-react';
import * as Icons from 'lucide-react';

const SIMULATED_RESPONSES = {
  greeting: (config) => ({
    speaker: 'ai',
    text: config?.message || "Hi, thanks for calling! How can I help you today?",
  }),
  ask_question: (config) => ({
    speaker: 'ai',
    text: config?.question || "How can I help you?",
  }),
  collect_info: (config) => ({
    speaker: 'ai',
    text: `I'd like to collect some information. Could you please provide your ${(config?.fields || ['name']).join(', ')}?`,
  }),
  business_hours: () => ({
    speaker: 'system',
    text: '⏰ Checking business hours... Currently OPEN',
  }),
  caller_type: () => ({
    speaker: 'system',
    text: '👤 Checking caller type... NEW CALLER',
  }),
  ai_intent: () => ({
    speaker: 'system',
    text: '🧠 Detecting intent from conversation...',
  }),
  knowledge_base: (config) => ({
    speaker: 'ai',
    text: "Let me look that up for you... Based on our records, I can help with that.",
  }),
  transfer_call: (config) => ({
    speaker: 'system',
    text: `📞 Transferring to ${config?.transferTo || 'staff member'}... Please hold.`,
  }),
  book_appointment: (config) => ({
    speaker: 'ai',
    text: `I can help you book an appointment. Let me check availability on ${config?.calendarSource || 'the calendar'}...`,
  }),
  send_sms: (config) => ({
    speaker: 'system',
    text: `📱 SMS sent: "${config?.message || 'Follow-up message sent.'}"`,
  }),
  send_email: () => ({
    speaker: 'system',
    text: '📧 Email notification sent to team.',
  }),
  end_call: (config) => ({
    speaker: 'ai',
    text: config?.closingMessage || "Thank you for calling! Have a great day.",
  }),
  record_message: () => ({
    speaker: 'ai',
    text: "Please leave your message after the tone. *beep*",
  }),
  send_notification: () => ({
    speaker: 'system',
    text: '🔔 Team notification sent.',
  }),
  crm_lookup: () => ({
    speaker: 'system',
    text: '🔍 Looking up caller in CRM...',
  }),
  sentiment_detection: () => ({
    speaker: 'system',
    text: '💚 Sentiment: Positive — caller sounds satisfied.',
  }),
  conversation_memory: () => ({
    speaker: 'system',
    text: '💾 Context saved for this conversation.',
  }),
  incoming_call: () => ({
    speaker: 'system',
    text: '📞 Incoming call received. Caller ID captured.',
  }),
  if_else: () => ({
    speaker: 'system',
    text: '🔀 Evaluating condition...',
  }),
  conditional_branch: () => ({
    speaker: 'system',
    text: '🔀 Evaluating multi-way condition...',
  }),
};

export default function CallSimulator({ nodes, onClose }) {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [currentNodeIndex, setCurrentNodeIndex] = useState(0);
  const [activeNodeId, setActiveNodeId] = useState(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [suggestedResponses, setSuggestedResponses] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Build linear path through nodes (simplified - follows first branch)
  const getLinearPath = () => {
    if (!nodes || nodes.length === 0) return [];
    const nodeMap = new Map(nodes.map((n) => [n.id, n]));
    const childrenMap = new Map();
    nodes.forEach((n) => {
      if (n.parentId) {
        if (!childrenMap.has(n.parentId)) childrenMap.set(n.parentId, []);
        childrenMap.get(n.parentId).push(n);
      }
    });

    const path = [];
    const rootNode = nodes.find((n) => !n.parentId) || nodes[0];
    const visited = new Set();

    const traverse = (node) => {
      if (!node || visited.has(node.id)) return;
      visited.add(node.id);
      path.push(node);
      const children = childrenMap.get(node.id) || [];
      if (children.length > 0) {
        traverse(children[0]); // Follow first branch
      }
    };

    traverse(rootNode);
    return path;
  };

  const linearPath = getLinearPath();

  const startCall = () => {
    setMessages([]);
    setCurrentNodeIndex(0);
    setIsCallActive(true);
    setCallEnded(false);
    setSuggestedResponses([]);

    // Auto-advance through first few nodes
    setTimeout(() => advanceNode(0), 500);
  };

  const advanceNode = (index) => {
    if (index >= linearPath.length) {
      endCall();
      return;
    }

    const node = linearPath[index];
    setActiveNodeId(node.id);
    const responseGen = SIMULATED_RESPONSES[node.type];
    if (responseGen) {
      const response = responseGen(node.config);
      setMessages((prev) => [...prev, { ...response, nodeId: node.id, nodeType: node.type }]);
    }

    // For nodes that need user input, pause and show suggestions
    if (['ask_question', 'greeting', 'collect_info', 'ai_intent'].includes(node.type)) {
      if (node.type === 'ai_intent') {
        setSuggestedResponses(['I need to book an appointment', 'I have a question', "It's an emergency"]);
      } else if (node.type === 'collect_info') {
        setSuggestedResponses(['John Smith, 555-0123, john@email.com']);
      } else {
        setSuggestedResponses(["I'd like to book an appointment", "I have a question about your services", "I need help with something urgent"]);
      }
      setCurrentNodeIndex(index + 1);
      return;
    }

    // Auto-advance for system/action nodes
    setCurrentNodeIndex(index + 1);
    if (node.type === 'end_call') {
      setTimeout(() => endCall(), 1000);
    } else {
      setTimeout(() => advanceNode(index + 1), 800);
    }
  };

  const endCall = () => {
    setIsCallActive(false);
    setCallEnded(true);
    setActiveNodeId(null);
    setSuggestedResponses([]);
    setMessages((prev) => [
      ...prev,
      {
        speaker: 'system',
        text: '--- Call ended ---',
        isSummary: true,
      },
    ]);
  };

  const handleSend = (text) => {
    const msg = text || userInput;
    if (!msg.trim()) return;

    setMessages((prev) => [...prev, { speaker: 'caller', text: msg }]);
    setUserInput('');
    setSuggestedResponses([]);

    // Continue advancing
    setTimeout(() => advanceNode(currentNodeIndex), 600);
  };

  const restart = () => {
    setMessages([]);
    setCurrentNodeIndex(0);
    setActiveNodeId(null);
    setIsCallActive(false);
    setCallEnded(false);
    setSuggestedResponses([]);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4">
      <div className="bg-surface rounded-2xl shadow-2xl w-full max-w-5xl h-[80vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-border flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Phone className="w-4 h-4 text-primary" />
            </div>
            <div>
              <div className="text-sm font-semibold text-text-dark">Call Simulator</div>
              <div className="text-[11px] text-text-light">Test your flow with a simulated call</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={restart}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-medium text-text-mid hover:bg-slate-50 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Try Again
            </button>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-50 transition-colors">
              <X className="w-4 h-4 text-text-light" />
            </button>
          </div>
        </div>

        {/* Content: Flow + Chat */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left: Mini flow visualization */}
          <div className="w-64 border-r border-border bg-bg overflow-y-auto p-4 shrink-0">
            <div className="text-[11px] font-semibold text-text-light uppercase tracking-wider mb-3">Flow Path</div>
            <div className="space-y-1">
              {linearPath.map((node, i) => {
                const def = NODE_TYPES[node.type];
                if (!def) return null;
                const cat = NODE_CATEGORIES[def.category];
                const IconComponent = Icons[def.icon] || Icons.Circle;
                const isActive = activeNodeId === node.id;
                const isPast = messages.some((m) => m.nodeId === node.id);

                return (
                  <div key={node.id}>
                    <div
                      className={`flex items-center gap-2 px-2.5 py-2 rounded-lg transition-all ${
                        isActive ? 'bg-primary/10 ring-1 ring-primary/30' : isPast ? 'opacity-60' : 'opacity-40'
                      }`}
                    >
                      <IconComponent className="w-3.5 h-3.5 shrink-0" style={{ color: cat.colorHex }} />
                      <span className={`text-[12px] truncate ${isActive ? 'font-semibold text-text-dark' : 'text-text-mid'}`}>
                        {def.label}
                      </span>
                      {isActive && (
                        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                      )}
                    </div>
                    {i < linearPath.length - 1 && (
                      <div className="ml-[18px] w-px h-2 bg-border" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Chat */}
          <div className="flex-1 flex flex-col">
            {!isCallActive && !callEnded ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Phone className="w-7 h-7 text-primary" />
                  </div>
                  <p className="text-sm font-medium text-text-dark mb-1">Ready to test your flow</p>
                  <p className="text-xs text-text-light mb-5">Simulate a call to see how your receptionist handles it</p>
                  <button
                    onClick={startCall}
                    className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-colors"
                  >
                    Start Simulated Call
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-5 space-y-3">
                  {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.speaker === 'caller' ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[75%] px-3.5 py-2.5 rounded-xl text-[13px] leading-relaxed ${
                          msg.speaker === 'caller'
                            ? 'bg-primary text-white rounded-br-sm'
                            : msg.speaker === 'system'
                            ? 'bg-slate-100 text-text-mid italic text-[12px] rounded-bl-sm'
                            : 'bg-surface border border-border text-text-dark rounded-bl-sm shadow-sm'
                        }`}
                      >
                        {msg.speaker === 'ai' && (
                          <div className="flex items-center gap-1.5 mb-1">
                            <Volume2 className="w-3 h-3 text-primary" />
                            <span className="text-[10px] font-semibold text-primary uppercase tracking-wider">AI Receptionist</span>
                          </div>
                        )}
                        {msg.speaker === 'caller' && (
                          <div className="text-[10px] font-semibold text-white/70 uppercase tracking-wider mb-1">You (Caller)</div>
                        )}
                        {msg.text}
                      </div>
                    </div>
                  ))}

                  {/* Call summary */}
                  {callEnded && (
                    <div className="bg-slate-50 border border-border rounded-xl p-4 mt-4">
                      <div className="text-xs font-semibold text-text-dark mb-2">Call Summary</div>
                      <div className="text-[12px] text-text-mid space-y-1">
                        <p>Nodes visited: {messages.filter((m) => m.nodeId).length}</p>
                        <p>Caller messages: {messages.filter((m) => m.speaker === 'caller').length}</p>
                        <p>Status: Call completed successfully</p>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Suggested responses */}
                {suggestedResponses.length > 0 && (
                  <div className="px-5 pb-2 flex flex-wrap gap-2">
                    {suggestedResponses.map((resp, i) => (
                      <button
                        key={i}
                        onClick={() => handleSend(resp)}
                        className="px-3 py-1.5 rounded-full border border-border text-[12px] text-text-mid hover:bg-slate-50 hover:border-primary/30 transition-colors"
                      >
                        {resp}
                      </button>
                    ))}
                  </div>
                )}

                {/* Input */}
                <div className="px-5 py-3 border-t border-border">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                      placeholder={callEnded ? 'Call ended. Click "Try Again" to restart.' : 'Type a caller response...'}
                      disabled={callEnded || !isCallActive}
                      className="flex-1 px-3.5 py-2 rounded-lg border border-border text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary disabled:opacity-50 transition-all"
                    />
                    <button
                      onClick={() => handleSend()}
                      disabled={callEnded || !isCallActive || !userInput.trim()}
                      className="p-2 rounded-lg bg-primary text-white hover:bg-primary-dark disabled:opacity-30 transition-colors"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
