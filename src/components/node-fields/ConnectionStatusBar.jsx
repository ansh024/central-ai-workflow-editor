import { CheckCircle, AlertTriangle, XCircle, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

const INTEGRATION_LABELS = {
  google_calendar: 'Google Calendar',
  calendly: 'Calendly',
  cal_com: 'Cal.com',
  setmore: 'Setmore',
  central_crm: 'Central CRM',
  hubspot: 'HubSpot',
  salesforce: 'Salesforce',
  slack: 'Slack',
  shopify: 'Shopify',
  woocommerce: 'WooCommerce',
  square: 'Square',
  typeform: 'Typeform',
  jotform: 'JotForm',
};

// Mock connection state — in a real app this would come from context/backend
const MOCK_CONNECTED = new Set(['central_crm']);

export default function ConnectionStatusBar({ integrations = [] }) {
  if (!integrations || integrations.length === 0) return null;

  // Show status for the first required integration
  const integration = integrations[0];
  const isConnected = MOCK_CONNECTED.has(integration);
  const label = INTEGRATION_LABELS[integration] || integration;

  if (isConnected) {
    return (
      <div className={cn(
        'mx-4 mb-3 flex items-center gap-2 px-3 py-2 rounded-lg',
        'bg-emerald-50 border border-emerald-200',
      )}>
        <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
        <span className="text-[12px] text-emerald-700 flex-1">{label} connected</span>
      </div>
    );
  }

  return (
    <div className={cn(
      'mx-4 mb-3 flex items-start gap-2 px-3 py-2 rounded-lg',
      'bg-amber-50 border border-amber-200',
    )}>
      <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-[12px] text-amber-700 leading-snug">
          {label} not connected. This node will simulate in testing but won't work when published.
        </p>
        <button
          type="button"
          className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-amber-700 hover:text-amber-900 transition-colors cursor-pointer focus:outline-none"
        >
          Connect <ExternalLink className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
