import { useState, useEffect, useRef, useMemo } from 'react';
import { BUSINESS_TYPES, getTemplatesByType } from '../data/templates';
import { Search, Plus, Clock, ArrowLeft, Workflow, Sparkles, Check, X, LayoutTemplate, Pencil, ChevronsUpDown, ChevronUp, ChevronDown, MoreHorizontal, Copy, Trash2, Download } from 'lucide-react';
import * as Icons from 'lucide-react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';

/* ───────────────────────────── New Workflow Sidebar ───────────────────────────── */

function NewWorkflowSidebar({ open, onClose, onChooseMax, onStartScratch, onSelectTemplate }) {
  const [sidebarView, setSidebarView] = useState('options'); // 'options' | 'templates'
  const [selectedType, setSelectedType] = useState('all');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('popular');
  const backdropRef = useRef(null);

  // Reset view when sidebar opens
  useEffect(() => {
    if (open) {
      setSidebarView('options');
      setSearch('');
    }
  }, [open]);

  // "All" shows templates from every business type
  const allTemplates = BUSINESS_TYPES.flatMap((bt) => getTemplatesByType(bt.id));
  const typeTemplates = selectedType === 'all' ? allTemplates : getTemplatesByType(selectedType);

  const filtered = useMemo(() => {
    let result = search
      ? typeTemplates.filter(
          (t) =>
            t.name.toLowerCase().includes(search.toLowerCase()) ||
            t.description.toLowerCase().includes(search.toLowerCase())
        )
      : [...typeTemplates];

    // Sort
    if (sortBy === 'popular') result.sort((a, b) => (b.popular ? 1 : 0) - (a.popular ? 1 : 0));
    else if (sortBy === 'fewest') result.sort((a, b) => (a.nodeCount || 0) - (b.nodeCount || 0));
    else if (sortBy === 'most') result.sort((a, b) => (b.nodeCount || 0) - (a.nodeCount || 0));
    else if (sortBy === 'quickest') result.sort((a, b) => (a.setupTime || '').localeCompare(b.setupTime || ''));
    else if (sortBy === 'az') result.sort((a, b) => a.name.localeCompare(b.name));

    return result;
  }, [typeTemplates, search, sortBy]);

  const selectedBusiness = BUSINESS_TYPES.find((b) => b.id === selectedType);

  const handleBackdropClick = (e) => {
    if (e.target === backdropRef.current) onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        ref={backdropRef}
        onClick={handleBackdropClick}
        className={`fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px] transition-opacity duration-300 ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Sidebar panel */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-[400px] max-w-[90vw] bg-surface border-l border-border shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border shrink-0">
          {sidebarView === 'templates' ? (
            <button
              onClick={() => { setSidebarView('options'); setSearch(''); }}
              className="flex items-center gap-2 text-[15px] font-semibold text-text-dark hover:text-primary transition-colors duration-200 cursor-pointer focus:outline-none"
            >
              <ArrowLeft className="w-4 h-4" />
              Browse Templates
            </button>
          ) : (
            <div>
              <h2 className="text-[16px] font-semibold text-text-dark">New Workflow</h2>
              <p className="text-[13px] text-text-mid mt-0.5">How would you like to get started?</p>
            </div>
          )}
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-50 text-text-light hover:text-text-mid transition-colors duration-200 cursor-pointer focus:outline-none"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {sidebarView === 'options' ? (
            /* ── Three option cards ── */
            <div className="p-5 space-y-3">
              {/* Create with Max */}
              <button
                onClick={onChooseMax}
                className="w-full text-left p-5 rounded-[10px] border border-primary/20 bg-primary/[0.03] hover:bg-primary/[0.06] hover:border-primary/40 hover:shadow-md transition-all duration-200 cursor-pointer group focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-[10px] bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center shrink-0">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[14px] font-semibold text-text-dark group-hover:text-primary transition-colors duration-200">Create with Max</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide bg-primary/15 text-primary">Recommended</span>
                    </div>
                    <p className="text-[13px] text-text-mid leading-relaxed">
                      Answer a few quick questions by voice or text. Max builds your complete call flow in minutes.
                    </p>
                  </div>
                </div>
              </button>

              {/* Select from Templates */}
              <button
                onClick={() => setSidebarView('templates')}
                className="w-full text-left p-5 rounded-[10px] border border-border hover:border-primary/30 hover:shadow-md hover:bg-slate-50/50 transition-all duration-200 cursor-pointer group focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-[10px] bg-primary/10 flex items-center justify-center shrink-0">
                    <LayoutTemplate className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[14px] font-semibold text-text-dark group-hover:text-primary transition-colors duration-200 block mb-1">Select from Templates</span>
                    <p className="text-[13px] text-text-mid leading-relaxed">
                      Choose from 30+ pre-built workflows for dental, legal, HVAC, salon, medical, and real estate.
                    </p>
                  </div>
                </div>
              </button>

              {/* Start from Scratch */}
              <button
                onClick={onStartScratch}
                className="w-full text-left p-5 rounded-[10px] border border-border hover:border-primary/30 hover:shadow-md hover:bg-slate-50/50 transition-all duration-200 cursor-pointer group focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-[10px] bg-slate-100 flex items-center justify-center shrink-0">
                    <Plus className="w-5 h-5 text-text-mid" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[14px] font-semibold text-text-dark group-hover:text-primary transition-colors duration-200 block mb-1">Start from Scratch</span>
                    <p className="text-[13px] text-text-mid leading-relaxed">
                      Build your flow node by node using the visual editor. Full control over every step.
                    </p>
                  </div>
                </div>
              </button>
            </div>
          ) : (
            /* ── Template browser ── */
            <div className="p-5">
              {/* Filter pills — "All" + business types */}
              <div className="flex flex-wrap gap-2 mb-4">
                <button
                  onClick={() => { setSelectedType('all'); setSearch(''); }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium border transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30 ${
                    selectedType === 'all'
                      ? 'bg-primary text-white border-primary shadow-sm'
                      : 'bg-surface border-border text-text-mid hover:border-slate-300 hover:bg-slate-50 hover:text-text-dark'
                  }`}
                >
                  All
                  {selectedType === 'all' && <Check className="w-3 h-3 ml-0.5" />}
                </button>
                {BUSINESS_TYPES.map((type) => {
                  const TypeIcon = Icons[type.icon] || Icons.Building2;
                  const isActive = selectedType === type.id;
                  return (
                    <button
                      key={type.id}
                      onClick={() => { setSelectedType(type.id); setSearch(''); }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium border transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30 ${
                        isActive
                          ? 'bg-primary text-white border-primary shadow-sm'
                          : 'bg-surface border-border text-text-mid hover:border-slate-300 hover:bg-slate-50 hover:text-text-dark'
                      }`}
                    >
                      <TypeIcon className="w-3.5 h-3.5" />
                      {type.label}
                      {isActive && <Check className="w-3 h-3 ml-0.5" />}
                    </button>
                  );
                })}
              </div>

              {/* Search + Sort row */}
              <div className="flex items-center gap-2 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-light" />
                  <input
                    type="text"
                    placeholder={selectedType === 'all' ? 'Search all workflows...' : `Search ${selectedBusiness?.label || ''} workflows...`}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 rounded-[10px] border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200"
                  />
                </div>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[120px] text-[12px] h-9 shrink-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="popular">Popular</SelectItem>
                    <SelectItem value="fewest">Fewest Nodes</SelectItem>
                    <SelectItem value="most">Most Nodes</SelectItem>
                    <SelectItem value="quickest">Quickest Setup</SelectItem>
                    <SelectItem value="az">A → Z</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Template list */}
              <div className="space-y-2">
                {filtered.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => onSelectTemplate(template)}
                    className="w-full text-left p-4 rounded-[10px] border border-border hover:border-primary/30 hover:shadow-sm hover:bg-slate-50/50 transition-all duration-200 cursor-pointer group focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <h4 className="text-[13px] font-semibold text-text-dark group-hover:text-primary transition-colors duration-200">
                        {template.name}
                      </h4>
                      {template.popular && (
                        <span className="text-[10px] font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                          Popular
                        </span>
                      )}
                    </div>
                    <p className="text-[12px] text-text-mid leading-relaxed line-clamp-2">
                      {template.description}
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-[11px] text-text-light">
                      <span className="flex items-center gap-1">
                        <Workflow className="w-3 h-3" />
                        {template.nodeCount} nodes
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {template.setupTime}
                      </span>
                    </div>
                  </button>
                ))}
              </div>

              {filtered.length === 0 && (
                <div className="text-center py-10">
                  <Search className="w-6 h-6 text-text-light mx-auto mb-2" />
                  <p className="text-sm text-text-mid">No workflows match &ldquo;{search}&rdquo;</p>
                  <button
                    onClick={() => setSearch('')}
                    className="text-sm text-primary mt-2 hover:underline cursor-pointer focus:outline-none"
                  >
                    Clear search
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

/* ───────────────────────────── Mock dates helper ───────────────────────────── */

const MOCK_DATES = {
  'saved-1': 'Mar 22, 2026',
  'saved-2': 'Mar 18, 2026',
};

function getMockDate(id) {
  return MOCK_DATES[id] || 'Mar 15, 2026';
}

/* ───────────────────────────── Status Badge ───────────────────────────── */

function StatusBadge({ status }) {
  const cfg = {
    Published: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Modified:  'bg-amber-50 text-amber-700 border-amber-200',
    Draft:     'bg-slate-100 text-text-mid border-slate-200',
  };
  const label = status || 'Draft';
  return (
    <span className={`inline-flex items-center text-[11px] font-semibold px-2.5 py-1 rounded-full border ${cfg[label] ?? cfg.Draft}`}>
      {label}
    </span>
  );
}

/* ───────────────────────────── Sort Header Button ───────────────────────────── */

function SortButton({ column, children }) {
  const sorted = column.getIsSorted();
  return (
    <button
      onClick={column.getToggleSortingHandler()}
      className="flex items-center gap-1 group/sort cursor-pointer focus:outline-none"
    >
      {children}
      <span className="text-text-light/60 group-hover/sort:text-text-light transition-colors">
        {sorted === 'asc'  ? <ChevronUp className="w-3.5 h-3.5" /> :
         sorted === 'desc' ? <ChevronDown className="w-3.5 h-3.5" /> :
                             <ChevronsUpDown className="w-3.5 h-3.5" />}
      </span>
    </button>
  );
}

/* ───────────────────────────── Workflows Table ───────────────────────────── */

function WorkflowsTable({ savedFlows, onSelectFlow }) {
  const [sorting, setSorting] = useState([]);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const data = useMemo(
    () => savedFlows.map((f) => ({ ...f, lastModified: getMockDate(f.id) })),
    [savedFlows]
  );

  const columns = useMemo(() => [
    {
      accessorKey: 'name',
      header: ({ column }) => <SortButton column={column}>Name</SortButton>,
      cell: ({ row }) => (
        <span className="text-[14px] font-medium text-text-dark group-hover:text-primary transition-colors duration-200">
          {row.getValue('name')}
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: ({ column }) => <SortButton column={column}>Status</SortButton>,
      cell: ({ row }) => <StatusBadge status={row.getValue('status')} />,
    },
    {
      accessorKey: 'nodeCount',
      header: ({ column }) => <SortButton column={column}>Nodes</SortButton>,
      cell: ({ row }) => (
        <span className="text-[13px] text-text-mid flex items-center gap-1.5">
          <Workflow className="w-3.5 h-3.5 text-text-light shrink-0" />
          {row.getValue('nodeCount') ?? 0}
        </span>
      ),
    },
    {
      accessorKey: 'lastModified',
      header: ({ column }) => <SortButton column={column}>Last Modified</SortButton>,
      cell: ({ row }) => (
        <span className="text-[13px] text-text-mid">{row.getValue('lastModified')}</span>
      ),
    },
    {
      id: 'actions',
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-1.5 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30">
                <MoreHorizontal className="w-4 h-4 text-text-light" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => onSelectFlow(row.original)}>
                <Pencil className="w-3.5 h-3.5" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => onSelectFlow(row.original)}>
                <Copy className="w-3.5 h-3.5" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => {}}>
                <Download className="w-3.5 h-3.5" />
                Export JSON
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onSelect={() => setDeleteTarget(row.original)}>
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
      enableSorting: false,
    },
  ], [onSelectFlow]);

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  if (savedFlows.length === 0) return null;

  return (
    <>
    <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete workflow?</AlertDialogTitle>
          <AlertDialogDescription>
            <strong>{deleteTarget?.name}</strong> will be permanently deleted. This cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction className="bg-destructive text-white hover:bg-destructive/90" onClick={() => setDeleteTarget(null)}>
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    <div className="bg-surface border border-border rounded-[10px] overflow-hidden">
      <Table>
        <TableHeader className="bg-slate-50/80">
          {table.getHeaderGroups().map((hg) => (
            <TableRow key={hg.id} className="border-border hover:bg-transparent">
              {hg.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className={`px-5 py-3 text-[11px] font-semibold text-text-light uppercase tracking-wider h-auto
                    ${header.column.id === 'nodeCount' ? 'hidden sm:table-cell' : ''}
                    ${header.column.id === 'lastModified' ? 'hidden md:table-cell' : ''}
                    ${header.column.id === 'actions' ? 'text-right' : ''}
                  `}
                >
                  {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow
              key={row.id}
              className="border-border hover:bg-slate-50/60 transition-colors duration-150 group"
            >
              {row.getVisibleCells().map((cell) => (
                <TableCell
                  key={cell.id}
                  className={`px-5 py-4
                    ${cell.column.id === 'nodeCount' ? 'hidden sm:table-cell' : ''}
                    ${cell.column.id === 'lastModified' ? 'hidden md:table-cell' : ''}
                  `}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
    </>
  );
}

/* ───────────────────────────── Main Component ───────────────────────────── */

export default function TemplateGallery({
  onSelectTemplate,
  onStartScratch,
  onChooseMax,
  savedFlows = [],
  embedded = false,
  showSidebar = false,
  onCloseSidebar,
  onOpenSidebar,
}) {
  return (
    <div className={`${embedded ? 'h-full overflow-y-auto' : 'min-h-screen'} bg-bg`}>
      {/* Header -- only shown when standalone */}
      {!embedded && (
        <header className="border-b border-border bg-surface px-8 py-4">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-sm">
                <Workflow className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-[15px] font-semibold text-text-dark tracking-tight">Central AI</span>
                <span className="text-xs text-text-light ml-2 hidden sm:inline">Workflow Builder</span>
              </div>
            </div>
            <button
              onClick={onOpenSidebar}
              className="flex items-center gap-2 px-4 py-2.5 rounded-[10px] bg-primary text-white text-sm font-medium hover:bg-primary-dark shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-2"
            >
              <Plus className="w-4 h-4" />
              New Workflow
            </button>
          </div>
        </header>
      )}

      <div className="max-w-6xl mx-auto px-8 py-8">
        {/* Page heading + New Workflow button */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold text-text-dark tracking-tight">Workflows</h1>
            <p className="text-[13px] text-text-mid mt-1">Manage your call flows and automations.</p>
          </div>
          {embedded && (
            <button
              onClick={onOpenSidebar}
              className="flex items-center gap-2 px-4 py-2.5 rounded-[10px] bg-primary text-white text-sm font-medium hover:bg-primary-dark shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-2"
            >
              <Plus className="w-4 h-4" />
              New Workflow
            </button>
          )}
        </div>

        {/* Your Workflows Table */}
        {savedFlows.length > 0 ? (
          <WorkflowsTable savedFlows={savedFlows} onSelectFlow={onSelectTemplate} />
        ) : (
          <div className="bg-surface border border-border rounded-[10px] p-12 text-center">
            <Workflow className="w-10 h-10 text-text-light mx-auto mb-3" />
            <h3 className="text-[15px] font-semibold text-text-dark mb-1">No workflows yet</h3>
            <p className="text-[13px] text-text-mid mb-5">Create your first workflow to get started.</p>
            <button
              onClick={onOpenSidebar}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[10px] bg-primary text-white text-sm font-medium hover:bg-primary-dark shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-2"
            >
              <Plus className="w-4 h-4" />
              New Workflow
            </button>
          </div>
        )}
      </div>

      {/* Right Sidebar */}
      <NewWorkflowSidebar
        open={showSidebar}
        onClose={onCloseSidebar}
        onChooseMax={onChooseMax}
        onStartScratch={onStartScratch}
        onSelectTemplate={onSelectTemplate}
      />
    </div>
  );
}
