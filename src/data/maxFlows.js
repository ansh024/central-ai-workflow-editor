// Pre-built demo flows for "Create with Max"
// Flow 1: Dental clinic incoming call handling
// Flow 2: E-commerce post-delivery review request

export const DENTAL_CALL_FLOW = {
  trigger: {
    type: 'incoming_call',
    config: {
      phoneNumber: 'Main Line',
      captureCallerId: true,
      recordCall: true,
      ringTimeout: 3,
      spamFilter: true,
    },
  },
  nodes: [
    {
      id: 'max-dental-1',
      type: 'business_hours',
      config: {
        weekdayOpen: '8:00 AM',
        weekdayClose: '6:00 PM',
        saturdayOpen: '9:00 AM',
        saturdayClose: '2:00 PM',
        sundayOpen: null,
        sundayClose: null,
        timezone: 'America/New_York',
      },
      branches: [
        {
          id: 'max-dental-b1',
          condition: 'during_hours',
          label: 'During Hours',
          nodes: [
            {
              id: 'max-dental-2',
              type: 'greeting',
              config: {
                message: "Hi, thanks for calling Riverside Dental! How can I help you today?",
                voice: 'professional_female',
              },
            },
            {
              id: 'max-dental-3',
              type: 'ai_intent',
              config: {
                intents: 'Book Appointment, Dental Emergency, Ask Question, Cancel / Reschedule',
              },
              branches: [
                {
                  id: 'max-dental-b2',
                  condition: 'book_appointment',
                  label: 'Book Appointment',
                  nodes: [
                    {
                      id: 'max-dental-4',
                      type: 'collect_info',
                      config: { fields: ['Full Name', 'Phone Number', 'Insurance Provider'] },
                    },
                    {
                      id: 'max-dental-5',
                      type: 'book_appointment',
                      config: {
                        calendarSource: 'Google Calendar',
                        appointmentTypes: 'Cleaning, Consultation, X-Ray, Root Canal, Crown',
                      },
                    },
                    {
                      id: 'max-dental-6',
                      type: 'send_sms',
                      config: {
                        message: "Your appointment at Riverside Dental is confirmed! We look forward to seeing you.",
                      },
                    },
                    {
                      id: 'max-dental-7',
                      type: 'end_call',
                      config: { closingMessage: "You're all set! See you at your appointment. Have a great day!" },
                    },
                  ],
                },
                {
                  id: 'max-dental-b3',
                  condition: 'dental_emergency',
                  label: 'Dental Emergency',
                  nodes: [
                    {
                      id: 'max-dental-8',
                      type: 'greeting',
                      config: { message: "I understand you have a dental emergency. Let me connect you with our team right away." },
                    },
                    {
                      id: 'max-dental-9',
                      type: 'transfer_call',
                      config: {
                        destination: 'On-Call Dentist',
                        whisperMessage: 'Dental emergency caller — please assist immediately.',
                        holdMessage: "Please hold while I connect you.",
                      },
                    },
                  ],
                },
                {
                  id: 'max-dental-b4',
                  condition: 'ask_question',
                  label: 'Ask Question',
                  nodes: [
                    {
                      id: 'max-dental-10',
                      type: 'knowledge_base',
                      config: { sources: ['Dental FAQ', 'Website'] },
                    },
                    {
                      id: 'max-dental-11',
                      type: 'end_call',
                      config: { closingMessage: "I hope that helped! Feel free to call back anytime. Have a great day!" },
                    },
                  ],
                },
                {
                  id: 'max-dental-b5',
                  condition: 'cancel_reschedule',
                  label: 'Cancel / Reschedule',
                  nodes: [
                    {
                      id: 'max-dental-12',
                      type: 'ask_question',
                      config: { question: "No problem! Would you like to reschedule, or just cancel your appointment?" },
                    },
                    {
                      id: 'max-dental-13',
                      type: 'book_appointment',
                      config: { calendarSource: 'Google Calendar', appointmentTypes: 'Reschedule' },
                    },
                    {
                      id: 'max-dental-14',
                      type: 'end_call',
                      config: { closingMessage: "Done! We've updated your appointment. See you then!" },
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          id: 'max-dental-b6',
          condition: 'after_hours',
          label: 'After Hours',
          nodes: [
            {
              id: 'max-dental-15',
              type: 'greeting',
              config: {
                message: "Thanks for calling Riverside Dental. We're currently closed. Our hours are Monday–Friday 8am–6pm and Saturday 9am–2pm. Please leave a message and we'll get back to you first thing tomorrow!",
              },
            },
            {
              id: 'max-dental-16',
              type: 'record_message',
              config: { prompt: "Please leave your name, number, and reason for calling after the tone." },
            },
            {
              id: 'max-dental-17',
              type: 'send_email',
              config: {
                to: 'front-desk@riversidedental.com',
                subject: 'After-hours voicemail received',
                message: 'A patient left a voicemail after hours. Please follow up in the morning.',
              },
            },
            {
              id: 'max-dental-18',
              type: 'end_call',
              config: { closingMessage: "Thank you! We'll call you back as soon as we open. Have a good night!" },
            },
          ],
        },
      ],
    },
  ],
};

export const ECOMMERCE_REVIEW_FLOW = {
  trigger: {
    type: 'webhook_trigger',
    config: {
      event: 'order.delivered',
      source: 'E-commerce Platform',
      description: 'Fires when an order status changes to Delivered',
    },
  },
  nodes: [
    {
      id: 'max-ecom-1',
      type: 'wait_delay',
      config: {
        duration: 24,
        unit: 'hours',
        label: 'Wait 24 hours after delivery',
      },
    },
    {
      id: 'max-ecom-2',
      type: 'send_sms',
      config: {
        message: "Hi {customer_name}! Your order from {store_name} just arrived — we hope you love it! Mind leaving us a quick review? It means a lot: {review_link}",
      },
    },
    {
      id: 'max-ecom-3',
      type: 'wait_delay',
      config: {
        duration: 72,
        unit: 'hours',
        label: 'Wait 3 days for review',
      },
    },
    {
      id: 'max-ecom-4',
      type: 'condition_check',
      config: {
        condition: 'review_submitted == true',
        description: 'Did the customer leave a review?',
      },
      branches: [
        {
          id: 'max-ecom-b1',
          condition: 'true',
          label: 'Review Submitted',
          nodes: [
            {
              id: 'max-ecom-5',
              type: 'send_email',
              config: {
                to: '{customer_email}',
                subject: 'Thank you for your review!',
                message: "Hi {customer_name}, thank you so much for taking the time to leave us a review. Your feedback helps us grow and serve you better!",
              },
            },
            {
              id: 'max-ecom-6',
              type: 'crm_sync',
              config: {
                action: 'update_contact',
                field: 'review_status',
                value: 'submitted',
              },
            },
          ],
        },
        {
          id: 'max-ecom-b2',
          condition: 'false',
          label: 'No Review Yet',
          nodes: [
            {
              id: 'max-ecom-7',
              type: 'send_email',
              config: {
                to: '{customer_email}',
                subject: 'How was your order?',
                message: "Hi {customer_name}! We noticed you haven't left a review yet. We'd really love to hear what you think — it only takes a minute: {review_link}",
              },
            },
          ],
        },
      ],
    },
  ],
};

export const MAX_FLOWS = {
  dental: DENTAL_CALL_FLOW,
  ecommerce: ECOMMERCE_REVIEW_FLOW,
};

export const FLOW_NAMES = {
  dental: 'Riverside Dental — Call Handling Flow',
  ecommerce: 'Post-Delivery Review Request',
};

const DENTAL_KEYWORDS = ['dental', 'dentist', 'clinic', 'call', 'appointment', 'patient', 'teeth', 'tooth', 'receptionist'];
const ECOMMERCE_KEYWORDS = ['ecommerce', 'e-commerce', 'order', 'delivery', 'delivered', 'review', 'shop', 'store', 'product', 'purchase', 'customer'];

export function detectFlowIntent(text) {
  const lower = text.toLowerCase();
  const dentalScore = DENTAL_KEYWORDS.filter((k) => lower.includes(k)).length;
  const ecommerceScore = ECOMMERCE_KEYWORDS.filter((k) => lower.includes(k)).length;
  if (dentalScore === 0 && ecommerceScore === 0) return null;
  return dentalScore >= ecommerceScore ? 'dental' : 'ecommerce';
}
