import { CheckCircle2, XCircle, Loader2, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';

// Mock run data
const MOCK_RUNS = [
  { id: 'run-001', startedAt: new Date(2026, 2, 25, 14, 32), duration: 12.4, status: 'completed', trigger: 'Incoming Call', caller: '+1 (555) 234-8901' },
  { id: 'run-002', startedAt: new Date(2026, 2, 25, 14, 18), duration: 8.1, status: 'completed', trigger: 'Incoming Call', caller: '+1 (555) 876-5432' },
  { id: 'run-003', startedAt: new Date(2026, 2, 25, 13, 55), duration: null, status: 'in_progress', trigger: 'Incoming Call', caller: '+1 (555) 111-2233' },
  { id: 'run-004', startedAt: new Date(2026, 2, 25, 13, 41), duration: 3.2, status: 'failed', trigger: 'Incoming Call', caller: '+1 (555) 999-0011' },
  { id: 'run-005', startedAt: new Date(2026, 2, 25, 12, 10), duration: 15.7, status: 'completed', trigger: 'Incoming Call', caller: '+1 (555) 321-6547' },
  { id: 'run-006', startedAt: new Date(2026, 2, 25, 11, 48), duration: 9.3, status: 'completed', trigger: 'Incoming Call', caller: '+1 (555) 654-3210' },
  { id: 'run-007', startedAt: new Date(2026, 2, 25, 10, 22), duration: 2.1, status: 'failed', trigger: 'Incoming Call', caller: '+1 (555) 444-7788' },
  { id: 'run-008', startedAt: new Date(2026, 2, 24, 16, 45), duration: 11.0, status: 'completed', trigger: 'Incoming Call', caller: '+1 (555) 777-1234' },
  { id: 'run-009', startedAt: new Date(2026, 2, 24, 15, 30), duration: 14.2, status: 'completed', trigger: 'Incoming Call', caller: '+1 (555) 888-5678' },
  { id: 'run-010', startedAt: new Date(2026, 2, 24, 14, 15), duration: 7.8, status: 'completed', trigger: 'Incoming Call', caller: '+1 (555) 222-9900' },
];

const STATUS_CONFIG = {
  completed: { label: 'Completed', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  failed: { label: 'Failed', icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
  in_progress: { label: 'In Progress', icon: Loader2, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
};

function formatTime(date) {
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

function formatDuration(seconds) {
  if (seconds == null) return '—';
  return `${seconds.toFixed(1)}s`;
}

export default function RunsView() {
  const completed = MOCK_RUNS.filter((r) => r.status === 'completed').length;
  const failed = MOCK_RUNS.filter((r) => r.status === 'failed').length;
  const inProgress = MOCK_RUNS.filter((r) => r.status === 'in_progress').length;
  const completedRuns = MOCK_RUNS.filter((r) => r.status === 'completed' && r.duration != null);
  const avgRuntime =
    completedRuns.length > 0
      ? completedRuns.reduce((sum, r) => sum + r.duration, 0) / completedRuns.length
      : 0;

  const stats = [
    { label: 'Completed', value: completed, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Failed', value: failed, icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' },
    { label: 'In Progress', value: inProgress, icon: Loader2, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Avg. Runtime', value: `${avgRuntime.toFixed(1)}s`, icon: Clock, color: 'text-gray-600', bg: 'bg-gray-50' },
  ];

  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="max-w-5xl mx-auto">
        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="rounded-xl border border-gray-200 bg-white p-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-7 h-7 rounded-lg ${stat.bg} flex items-center justify-center`}>
                    <Icon className={`w-3.5 h-3.5 ${stat.color}`} />
                  </div>
                  <span className="text-[12px] text-gray-500 font-medium">{stat.label}</span>
                </div>
                <div className="text-2xl font-semibold text-gray-900">{stat.value}</div>
              </div>
            );
          })}
        </div>

        {/* Runs Table */}
        <div className="rounded-xl border border-gray-200 bg-white">
          <div className="px-4 py-3 border-b border-gray-100">
            <h3 className="text-[13px] font-semibold text-gray-900">Run History</h3>
          </div>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-[11px] text-gray-500 font-medium h-8">Run ID</TableHead>
                <TableHead className="text-[11px] text-gray-500 font-medium h-8">Status</TableHead>
                <TableHead className="text-[11px] text-gray-500 font-medium h-8">Started</TableHead>
                <TableHead className="text-[11px] text-gray-500 font-medium h-8">Duration</TableHead>
                <TableHead className="text-[11px] text-gray-500 font-medium h-8">Trigger</TableHead>
                <TableHead className="text-[11px] text-gray-500 font-medium h-8">Caller</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_RUNS.map((run) => {
                const statusConf = STATUS_CONFIG[run.status];
                const StatusIcon = statusConf.icon;
                return (
                  <TableRow key={run.id} className="hover:bg-gray-50/50">
                    <TableCell className="text-[12px] text-gray-500 font-mono py-2">{run.id}</TableCell>
                    <TableCell className="py-2">
                      <Badge
                        variant="outline"
                        className={`text-[11px] font-medium ${statusConf.color} ${statusConf.bg} ${statusConf.border} gap-1`}
                      >
                        <StatusIcon className={`w-3 h-3 ${run.status === 'in_progress' ? 'animate-spin' : ''}`} />
                        {statusConf.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-[12px] text-gray-600 py-2">{formatTime(run.startedAt)}</TableCell>
                    <TableCell className="text-[12px] text-gray-600 font-mono py-2">{formatDuration(run.duration)}</TableCell>
                    <TableCell className="text-[12px] text-gray-600 py-2">{run.trigger}</TableCell>
                    <TableCell className="text-[12px] text-gray-500 font-mono py-2">{run.caller}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
