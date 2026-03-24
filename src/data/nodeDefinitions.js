export const NODE_CATEGORIES = {
  core: { label: 'Core', color: 'core', colorHex: '#0EA5E9' },
  logic: { label: 'Logic', color: 'logic', colorHex: '#F59E0B' },
  integration: { label: 'Integration', color: 'integration', colorHex: '#10B981' },
  ai: { label: 'AI (Advanced)', color: 'ai', colorHex: '#F43F5E' },
};

export const NODE_TYPES = {
  // Core nodes
  incoming_call: {
    type: 'incoming_call',
    label: 'Incoming Call',
    category: 'core',
    description: 'Entry point. Captures caller ID, time, source.',
    icon: 'PhoneIncoming',
    configFields: [
      { key: 'captureCallerId', type: 'toggle', label: 'Capture Caller ID', default: true },
      { key: 'captureSource', type: 'toggle', label: 'Capture Call Source', default: true },
    ],
  },
  greeting: {
    type: 'greeting',
    label: 'Greeting',
    category: 'core',
    description: 'Branded greeting, personalized by caller type.',
    icon: 'MessageSquare',
    configFields: [
      { key: 'message', type: 'textarea', label: 'Greeting Message', default: 'Hi, thanks for calling {business_name}! How can I help you today?' },
      { key: 'voice', type: 'select', label: 'Voice', options: ['Professional Female', 'Professional Male', 'Friendly Female', 'Friendly Male', 'Warm & Calm'], default: 'Professional Female' },
      { key: 'personalizeReturning', type: 'toggle', label: 'Personalize for returning callers', default: true },
    ],
    advancedFields: [
      { key: 'delayMs', type: 'number', label: 'Delay before greeting (ms)', default: 0 },
      { key: 'fallbackGreeting', type: 'textarea', label: 'Fallback greeting if name lookup fails', default: '' },
    ],
  },
  ask_question: {
    type: 'ask_question',
    label: 'Ask Question',
    category: 'core',
    description: 'Asks caller a question, routes based on response.',
    icon: 'HelpCircle',
    configFields: [
      { key: 'question', type: 'textarea', label: 'Question', default: 'How can I help you today?' },
      { key: 'expectedResponses', type: 'text', label: 'Expected responses (comma-separated)', default: '' },
    ],
  },
  collect_info: {
    type: 'collect_info',
    label: 'Collect Info',
    category: 'core',
    description: 'Captures name, phone, email, insurance, custom fields.',
    icon: 'ClipboardList',
    configFields: [
      { key: 'fields', type: 'multiselect', label: 'Fields to collect', options: ['Name', 'Phone', 'Email', 'Insurance Provider', 'Date of Birth', 'Address'], default: ['Name', 'Phone'] },
      { key: 'requireConfirmation', type: 'toggle', label: 'Require caller confirmation', default: true },
    ],
  },
  record_message: {
    type: 'record_message',
    label: 'Record Message',
    category: 'core',
    description: 'Takes detailed voicemail with transcript.',
    icon: 'Mic',
    configFields: [
      { key: 'prompt', type: 'textarea', label: 'Prompt before recording', default: 'Please leave your message after the tone.' },
      { key: 'maxDuration', type: 'number', label: 'Max duration (seconds)', default: 120 },
      { key: 'transcribe', type: 'toggle', label: 'Transcribe message', default: true },
    ],
  },
  end_call: {
    type: 'end_call',
    label: 'End Call',
    category: 'core',
    description: 'Graceful close with summary + optional follow-up.',
    icon: 'PhoneOff',
    configFields: [
      { key: 'closingMessage', type: 'textarea', label: 'Closing message', default: 'Thank you for calling! Have a great day.' },
      { key: 'sendSummary', type: 'toggle', label: 'Send call summary via email', default: true },
    ],
  },

  // Logic nodes
  business_hours: {
    type: 'business_hours',
    label: 'Business Hours',
    category: 'logic',
    description: 'Routes by schedule: open / closed / weekend.',
    icon: 'Clock',
    configFields: [
      { key: 'timezone', type: 'select', label: 'Timezone', options: ['US/Eastern', 'US/Central', 'US/Mountain', 'US/Pacific', 'US/Hawaii'], default: 'US/Eastern' },
      { key: 'weekdayOpen', type: 'text', label: 'Weekday open', default: '9:00 AM' },
      { key: 'weekdayClose', type: 'text', label: 'Weekday close', default: '5:00 PM' },
      { key: 'saturdayOpen', type: 'text', label: 'Saturday open', default: '10:00 AM' },
      { key: 'saturdayClose', type: 'text', label: 'Saturday close', default: '2:00 PM' },
      { key: 'sundayClosed', type: 'toggle', label: 'Closed on Sunday', default: true },
    ],
    branches: ['Open', 'Closed'],
  },
  caller_type: {
    type: 'caller_type',
    label: 'Caller Type',
    category: 'logic',
    description: 'New vs. returning (CRM phone match).',
    icon: 'Users',
    configFields: [
      { key: 'lookupMethod', type: 'select', label: 'Lookup method', options: ['Phone number', 'Caller ID', 'CRM match'], default: 'Phone number' },
    ],
    branches: ['New Caller', 'Returning Caller'],
  },
  if_else: {
    type: 'if_else',
    label: 'If/Else Branch',
    category: 'logic',
    description: 'Conditional routing on any variable.',
    icon: 'GitBranch',
    configFields: [
      { key: 'conditionField', type: 'select', label: 'Condition', options: ['Caller Intent', 'Data Field', 'Time of Day', 'Custom'], default: 'Caller Intent' },
      { key: 'operator', type: 'select', label: 'Operator', options: ['equals', 'contains', 'is not', 'greater than', 'less than'], default: 'equals' },
      { key: 'value', type: 'text', label: 'Value', default: '' },
    ],
    branches: ['If True', 'If False'],
  },
  conditional_branch: {
    type: 'conditional_branch',
    label: 'Conditional Branch',
    category: 'logic',
    description: 'Multi-way split (3+ paths).',
    icon: 'GitFork',
    configFields: [
      { key: 'conditionField', type: 'select', label: 'Branch on', options: ['Department', 'Service Type', 'Caller Intent', 'Custom'], default: 'Department' },
    ],
    branches: ['Path A', 'Path B', 'Path C'],
  },

  // Integration nodes
  transfer_call: {
    type: 'transfer_call',
    label: 'Transfer Call',
    category: 'integration',
    description: 'Warm transfer: hold > dial > summary > bridge.',
    icon: 'PhoneForwarded',
    configFields: [
      { key: 'transferTo', type: 'text', label: 'Transfer to (name or number)', default: '' },
      { key: 'holdMessage', type: 'textarea', label: 'Hold message', default: "I'm going to transfer you now. Please hold for a moment." },
      { key: 'verbalSummary', type: 'toggle', label: 'Provide verbal summary to recipient', default: true },
    ],
  },
  book_appointment: {
    type: 'book_appointment',
    label: 'Book Appointment',
    category: 'integration',
    description: 'Calendar check + booking.',
    icon: 'CalendarPlus',
    configFields: [
      { key: 'calendarSource', type: 'select', label: 'Calendar', options: ['Google Calendar', 'Calendly', 'Cal.com', 'Setmore', 'Acuity'], default: 'Google Calendar' },
      { key: 'appointmentTypes', type: 'text', label: 'Appointment types (comma-separated)', default: 'Consultation, Follow-up' },
      { key: 'confirmViaSms', type: 'toggle', label: 'Send SMS confirmation', default: true },
    ],
  },
  send_sms: {
    type: 'send_sms',
    label: 'Send SMS',
    category: 'integration',
    description: 'Text the caller during or after the call.',
    icon: 'MessageCircle',
    configFields: [
      { key: 'message', type: 'textarea', label: 'SMS message', default: 'Thanks for calling {business_name}! We\'ll follow up shortly.' },
      { key: 'timing', type: 'select', label: 'When to send', options: ['Immediately', 'After call ends', '5 minutes after', '1 hour after'], default: 'Immediately' },
    ],
  },
  send_email: {
    type: 'send_email',
    label: 'Send Email',
    category: 'integration',
    description: 'Email follow-up or notification.',
    icon: 'Mail',
    configFields: [
      { key: 'to', type: 'select', label: 'Send to', options: ['Caller', 'Team', 'Both'], default: 'Both' },
      { key: 'subject', type: 'text', label: 'Subject', default: 'Call Summary from {business_name}' },
      { key: 'includeTranscript', type: 'toggle', label: 'Include call transcript', default: true },
    ],
  },
  send_notification: {
    type: 'send_notification',
    label: 'Send Notification',
    category: 'integration',
    description: 'Alert team via Slack, webhook, or push.',
    icon: 'Bell',
    configFields: [
      { key: 'channel', type: 'select', label: 'Channel', options: ['Slack', 'Webhook', 'Push Notification', 'Email'], default: 'Slack' },
      { key: 'message', type: 'textarea', label: 'Notification message', default: 'New call received from {caller_name}' },
    ],
  },
  crm_lookup: {
    type: 'crm_lookup',
    label: 'CRM Lookup',
    category: 'integration',
    description: 'Query CRM for caller history/context.',
    icon: 'Database',
    configFields: [
      { key: 'crmSource', type: 'select', label: 'CRM', options: ['HubSpot', 'Salesforce', 'Zoho', 'Custom'], default: 'HubSpot' },
      { key: 'lookupField', type: 'select', label: 'Lookup by', options: ['Phone Number', 'Email', 'Name'], default: 'Phone Number' },
    ],
  },

  // AI nodes
  ai_intent: {
    type: 'ai_intent',
    label: 'AI Intent Detection',
    category: 'ai',
    description: 'Classifies caller intent from natural speech.',
    icon: 'Brain',
    configFields: [
      { key: 'intents', type: 'text', label: 'Intents to detect (comma-separated)', default: 'Book Appointment, Ask Question, Emergency, Cancel, Reschedule' },
      { key: 'confidenceThreshold', type: 'number', label: 'Confidence threshold (%)', default: 80 },
    ],
    branches: ['Book Appointment', 'Question', 'Emergency', 'Other'],
  },
  sentiment_detection: {
    type: 'sentiment_detection',
    label: 'Sentiment Detection',
    category: 'ai',
    description: 'Monitors tone, escalates on frustration.',
    icon: 'Heart',
    configFields: [
      { key: 'escalateOn', type: 'select', label: 'Escalate on', options: ['Frustrated', 'Angry', 'Confused', 'Any negative'], default: 'Frustrated' },
      { key: 'escalateTo', type: 'text', label: 'Escalate to', default: '' },
    ],
  },
  knowledge_base: {
    type: 'knowledge_base',
    label: 'Knowledge Base Answer',
    category: 'ai',
    description: 'Searches docs/website for real-time answers.',
    icon: 'BookOpen',
    configFields: [
      { key: 'sources', type: 'multiselect', label: 'Knowledge sources', options: ['Website', 'FAQ Document', 'PDF Upload', 'Custom Database'], default: ['Website', 'FAQ Document'] },
      { key: 'fallbackMessage', type: 'textarea', label: 'Fallback if no answer found', default: "I don't have that information right now. Let me connect you with someone who can help." },
    ],
  },
  conversation_memory: {
    type: 'conversation_memory',
    label: 'Conversation Memory',
    category: 'ai',
    description: 'Stores context so later nodes don\'t re-ask.',
    icon: 'MemoryStick',
    configFields: [
      { key: 'remember', type: 'multiselect', label: 'Remember', options: ['Name', 'Intent', 'Collected Data', 'Sentiment', 'All'], default: ['All'] },
    ],
  },
};

export const getNodesByCategory = (category) =>
  Object.values(NODE_TYPES).filter((n) => n.category === category);
