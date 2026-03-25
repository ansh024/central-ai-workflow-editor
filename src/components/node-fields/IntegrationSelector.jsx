import { CheckCircle, AlertTriangle } from 'lucide-react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

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
  custom_api: 'Custom API',
};

const MOCK_CONNECTED = new Set(['central_crm']);

export default function IntegrationSelector({ value, options = [], onChange }) {
  const isConnected = MOCK_CONNECTED.has(value);

  return (
    <div className="space-y-1.5">
      <Select value={value || ''} onValueChange={onChange}>
        <SelectTrigger className="text-[13px] focus:ring-primary/30 focus:border-primary">
          <SelectValue placeholder="Select integration..." />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => {
            const connected = MOCK_CONNECTED.has(opt);
            const label = INTEGRATION_LABELS[opt] || opt;
            return (
              <SelectItem key={opt} value={opt}>
                <span className="flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-emerald-500' : 'bg-amber-400'}`} />
                  {label}
                  {connected && <span className="text-[10px] text-emerald-600">Connected</span>}
                </span>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>

      {value && (
        <div className={`flex items-center gap-1.5 text-[11px] ${isConnected ? 'text-emerald-600' : 'text-amber-600'}`}>
          {isConnected
            ? <><CheckCircle className="w-3 h-3" /> {INTEGRATION_LABELS[value] || value} connected</>
            : <><AlertTriangle className="w-3 h-3" /> Not connected — will simulate in testing</>
          }
        </div>
      )}
    </div>
  );
}
