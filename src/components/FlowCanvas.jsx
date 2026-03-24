import { useState, useCallback, useEffect, useRef, createContext, useContext } from 'react';
import { NODE_TYPES, NODE_CATEGORIES } from '../data/nodeDefinitions';
import { Plus, ChevronRight, ChevronDown, Workflow, GripVertical, Search, X } from 'lucide-react';
import * as Icons from 'lucide-react';

// Context for expand/collapse state
const TreeContext = createContext();

function useTree() {
  return useContext(TreeContext);
}

// Count nodes in a branch (including nested)
function countBranchNodes(nodes) {
  let count = 0;
  for (const node of nodes) {
    count++;
    if (node.branches) {
      for (const branch of node.branches) {
        count += countBranchNodes(branch.nodes);
      }
    }
  }
  return count;
}

// Find the terminal node type label in a branch
function getTerminalAction(nodes) {
  if (!nodes || nodes.length === 0) return null;
  const last = nodes[nodes.length - 1];
  // Check if last node has branches with deeper nodes
  if (last.branches && last.branches.length > 0) {
    // Return the type of the branching node itself
    const def = NODE_TYPES[last.type];
    return def?.label || last.type;
  }
  const def = NODE_TYPES[last.type];
  return def?.label || last.type;
}

// ── Collapsed Branch Card ──
function CollapsedBranchCard({ branch, depth, onExpand, parentColor }) {
  const nodeCount = countBranchNodes(branch.nodes);
  const terminalAction = getTerminalAction(branch.nodes);

  return (
    <button
      onClick={onExpand}
      className="w-full text-left rounded-xl border border-border bg-surface hover:shadow-md hover:border-slate-300 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-1 group"
    >
      {/* Color accent */}
      <div className="absolute left-0 top-2 bottom-2 w-1 rounded-full" style={{ backgroundColor: parentColor || '#94A3B8' }} />

      <div className="pl-5 pr-4 py-3.5">
        <div className="flex items-center gap-2.5 mb-1">
          <ChevronRight className="w-4 h-4 text-text-light group-hover:text-primary transition-colors duration-200 shrink-0" />
          <span className="text-[13px] font-semibold text-text-dark">{branch.label}</span>
        </div>
        <div className="flex items-center gap-3 ml-[26px] text-[11px] text-text-light">
          <span>{nodeCount} node{nodeCount !== 1 ? 's' : ''}</span>
          {terminalAction && (
            <>
              <span className="text-slate-300">·</span>
              <span>Ends with: {terminalAction}</span>
            </>
          )}
        </div>
      </div>
    </button>
  );
}

// ── Expanded Branch Header ──
function ExpandedBranchHeader({ branch, onCollapse, parentColor }) {
  return (
    <button
      onClick={onCollapse}
      className="w-full text-left flex items-center gap-2.5 px-4 py-2.5 rounded-lg hover:bg-slate-50 transition-colors duration-200 cursor-pointer focus:outline-none group"
    >
      <ChevronDown className="w-4 h-4 text-primary shrink-0" />
      <span className="text-[13px] font-semibold" style={{ color: parentColor || '#0EA5E9' }}>{branch.label}</span>
      <span className="text-[11px] text-text-light ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-200">collapse</span>
    </button>
  );
}

// ── Node Card (trunk node) ──
function NodeCard({ node, onSelect, isSelected }) {
  const { onAddNode, findQuery } = useTree();
  const nodeDef = NODE_TYPES[node.type];
  if (!nodeDef) return null;
  const cat = NODE_CATEGORIES[nodeDef.category];
  const IconComponent = Icons[nodeDef.icon] || Icons.Circle;

  // Find-highlight logic
  const isMatch = findQuery && nodeDef.label.toLowerCase().includes(findQuery.toLowerCase());
  const isDimmed = findQuery && !isMatch;

  const getPreview = () => {
    if (node.config?.message) return node.config.message;
    if (node.config?.question) return node.config.question;
    if (node.config?.closingMessage) return node.config.closingMessage;
    if (node.config?.transferTo) return `Transfer to ${node.config.transferTo}`;
    if (node.config?.calendarSource) return node.config.calendarSource;
    if (node.config?.intents) return node.config.intents;
    return nodeDef.description;
  };

  const preview = getPreview();
  const truncated = preview.length > 65 ? preview.slice(0, 65) + '...' : preview;

  return (
    <button
      onClick={() => onSelect(node.id)}
      className={`w-[280px] text-left rounded-xl bg-surface shadow-sm transition-all duration-200 group relative cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2 border ${
        isSelected
          ? 'ring-2 ring-primary shadow-md border-primary/20'
          : 'border-border hover:shadow-md hover:-translate-y-0.5 hover:border-slate-300'
      } ${isDimmed ? 'opacity-30' : ''} ${isMatch ? 'ring-2 ring-amber-400 border-amber-300' : ''}`}
    >
      <div className="absolute left-0 top-2 bottom-2 w-1 rounded-full" style={{ backgroundColor: cat?.colorHex || '#94A3B8' }} />
      <div className="pl-5 pr-4 py-3.5">
        <div className="flex items-center gap-2.5 mb-1.5">
          <div className="w-6 h-6 rounded-md flex items-center justify-center shrink-0" style={{ backgroundColor: cat?.colorHex + '12' }}>
            <IconComponent className="w-3.5 h-3.5" style={{ color: cat?.colorHex }} />
          </div>
          <span className="text-[13px] font-semibold text-text-dark flex-1">{nodeDef.label}</span>
          <GripVertical className="w-3.5 h-3.5 text-text-light opacity-0 group-hover:opacity-60 transition-opacity duration-200 cursor-grab" />
        </div>
        {truncated && (
          <p className="text-[11px] text-text-light leading-relaxed ml-[34px] line-clamp-2">{truncated}</p>
        )}
      </div>
    </button>
  );
}

// ── Connector line + Add button ──
function Connector({ nodeId, depth }) {
  const { onAddNode } = useTree();
  return (
    <div className="flex flex-col items-center">
      <div className="w-px h-4 bg-slate-200" />
      <button
        onClick={(e) => { e.stopPropagation(); onAddNode(nodeId, depth); }}
        className="w-6 h-6 rounded-full border border-slate-200 bg-surface flex items-center justify-center text-text-light hover:bg-primary hover:border-primary hover:text-white transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30 shadow-sm"
        title="Add node here"
      >
        <Plus className="w-3 h-3" />
      </button>
      <div className="w-px h-4 bg-slate-200" />
    </div>
  );
}

// ── Branch Point: renders branches as collapsible cards ──
function BranchPoint({ node, depth, onSelect, selectedNodeId }) {
  const { expandedBranches, toggleBranch } = useTree();
  const nodeDef = NODE_TYPES[node.type];
  const cat = NODE_CATEGORIES[nodeDef?.category];

  if (!node.branches || node.branches.length === 0) return null;

  return (
    <div className="flex flex-col items-center w-full">
      {node.branches.map((branch) => {
        const isExpanded = expandedBranches.has(branch.id);
        const indent = depth * 16;

        return (
          <div key={branch.id} className="w-full flex flex-col items-center">
            {/* Branch connector */}
            <div className="flex items-center gap-2 w-[280px]" style={{ paddingLeft: indent }}>
              <div className="w-4 border-t-2 border-dashed" style={{ borderColor: cat?.colorHex || '#94A3B8' }} />
              <div className="flex-1">
                {isExpanded ? (
                  <ExpandedBranchHeader
                    branch={branch}
                    onCollapse={() => toggleBranch(branch.id, depth)}
                    parentColor={cat?.colorHex}
                  />
                ) : (
                  <CollapsedBranchCard
                    branch={branch}
                    depth={depth}
                    onExpand={() => toggleBranch(branch.id, depth)}
                    parentColor={cat?.colorHex}
                  />
                )}
              </div>
            </div>

            {/* Expanded branch contents */}
            {isExpanded && (
              <div className="flex flex-col items-center mt-1 mb-2 animate-in slide-in-from-top-2 fade-in duration-200">
                <div className="w-px h-3" style={{ backgroundColor: cat?.colorHex + '40' }} />
                <NodeList
                  nodes={branch.nodes}
                  depth={depth + 1}
                  onSelect={onSelect}
                  selectedNodeId={selectedNodeId}
                  accentColor={cat?.colorHex}
                />
              </div>
            )}

            {/* Spacer between sibling branches */}
            <div className="h-1.5" />
          </div>
        );
      })}
    </div>
  );
}

// ── Node List: renders a linear sequence of nodes with branch points ──
function NodeList({ nodes, depth = 0, onSelect, selectedNodeId, accentColor }) {
  if (!nodes || nodes.length === 0) return null;

  return (
    <div className="flex flex-col items-center">
      {/* Accent border for nested branches */}
      {depth > 0 && (
        <div className="relative w-full flex flex-col items-center" style={{
          borderLeft: `2px solid ${accentColor || '#94A3B8'}20`,
          marginLeft: depth * 4,
          paddingLeft: 8,
        }}>
          {nodes.map((node, i) => (
            <div key={node.id} className="flex flex-col items-center w-full">
              <NodeCard node={node} onSelect={onSelect} isSelected={selectedNodeId === node.id} />
              {/* Connector + Add button (unless last node without branches) */}
              {(i < nodes.length - 1 || (node.branches && node.branches.length > 0)) && (
                <Connector nodeId={node.id} depth={depth} />
              )}
              {/* Branch point */}
              {node.branches && node.branches.length > 0 && (
                <BranchPoint node={node} depth={depth + 1} onSelect={onSelect} selectedNodeId={selectedNodeId} />
              )}
            </div>
          ))}
        </div>
      )}

      {depth === 0 && nodes.map((node, i) => (
        <div key={node.id} className="flex flex-col items-center">
          <NodeCard node={node} onSelect={onSelect} isSelected={selectedNodeId === node.id} />
          {(i < nodes.length - 1 || (node.branches && node.branches.length > 0)) && (
            <Connector nodeId={node.id} depth={depth} />
          )}
          {node.branches && node.branches.length > 0 && (
            <BranchPoint node={node} depth={depth + 1} onSelect={onSelect} selectedNodeId={selectedNodeId} />
          )}
        </div>
      ))}
    </div>
  );
}

// ── Main FlowCanvas ──
export default function FlowCanvas({ flowTree, selectedNodeId, onSelectNode, onAddNodeAt, onDropNode }) {
  const [expandedBranches, setExpandedBranches] = useState(new Set());
  const [findOpen, setFindOpen] = useState(false);
  const [findQuery, setFindQuery] = useState('');
  const findInputRef = useRef(null);

  // Cmd+F / Ctrl+F to open finder, Escape to close
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'f') {
        e.preventDefault();
        setFindOpen(true);
        setTimeout(() => findInputRef.current?.focus(), 50);
      }
      if (e.key === 'Escape') {
        setFindOpen(false);
        setFindQuery('');
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const toggleBranch = useCallback((branchId, depth) => {
    setExpandedBranches((prev) => {
      const next = new Set(prev);
      if (next.has(branchId)) {
        // Collapse this branch and all children
        next.delete(branchId);
      } else {
        // Accordion: collapse siblings at same depth (find parent's branches)
        // For simplicity, just expand this one
        next.add(branchId);
      }
      return next;
    });
  }, []);

  const contextValue = {
    expandedBranches,
    toggleBranch,
    onAddNode: onAddNodeAt,
    findQuery,
  };

  // Handle trigger node
  const triggerNode = flowTree?.trigger;
  const triggerDef = triggerNode ? NODE_TYPES[triggerNode.type] : null;
  const triggerCat = triggerDef ? NODE_CATEGORIES[triggerDef.category] : null;
  const TriggerIcon = triggerDef ? (Icons[triggerDef.icon] || Icons.Circle) : Icons.PhoneIncoming;

  const hasNodes = flowTree?.nodes && flowTree.nodes.length > 0;

  return (
    <TreeContext.Provider value={contextValue}>
      {/* Floating node finder */}
      {findOpen && (
        <div className="absolute top-4 right-4 z-30 flex items-center gap-2 bg-surface border border-border rounded-[10px] shadow-lg px-3 py-2">
          <Search className="w-3.5 h-3.5 text-text-light shrink-0" />
          <input
            ref={findInputRef}
            type="text"
            value={findQuery}
            onChange={(e) => setFindQuery(e.target.value)}
            placeholder="Find nodes…"
            className="text-[13px] text-text-dark bg-transparent border-none outline-none w-40 placeholder:text-placeholder"
          />
          <button
            onClick={() => { setFindOpen(false); setFindQuery(''); }}
            className="text-text-light hover:text-text-mid cursor-pointer focus:outline-none"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
      <div
        className="flex-1 overflow-auto bg-bg p-8 relative"
        onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; }}
        onDrop={(e) => {
          e.preventDefault();
          const nodeType = e.dataTransfer.getData('nodeType');
          if (nodeType && onDropNode) onDropNode(nodeType);
        }}
      >
        <div className="flex flex-col items-center min-w-max mx-auto py-6" style={{
          backgroundImage: 'radial-gradient(circle, #e2e8f0 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}>
          {/* Trigger Node (always first) */}
          {triggerNode && (
            <div className="flex flex-col items-center">
              <button
                onClick={() => onSelectNode('trigger')}
                className={`w-[280px] text-left rounded-xl bg-surface shadow-sm transition-all duration-200 group relative cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2 border ${
                  selectedNodeId === 'trigger'
                    ? 'ring-2 ring-primary shadow-md border-primary/20'
                    : 'border-border hover:shadow-md hover:-translate-y-0.5 hover:border-slate-300'
                }`}
              >
                <div className="absolute left-0 top-2 bottom-2 w-1 rounded-full" style={{ backgroundColor: triggerCat?.colorHex || '#0EA5E9' }} />
                <div className="pl-5 pr-4 py-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-md flex items-center justify-center shrink-0" style={{ backgroundColor: (triggerCat?.colorHex || '#0EA5E9') + '12' }}>
                      <TriggerIcon className="w-3.5 h-3.5" style={{ color: triggerCat?.colorHex || '#0EA5E9' }} />
                    </div>
                    <span className="text-[13px] font-semibold text-text-dark">{triggerDef?.label || 'Incoming Call'}</span>
                  </div>
                </div>
              </button>
              {hasNodes && <Connector nodeId="trigger" depth={0} />}
            </div>
          )}

          {/* Main Trunk Nodes */}
          {hasNodes && (
            <NodeList
              nodes={flowTree.nodes}
              depth={0}
              onSelect={onSelectNode}
              selectedNodeId={selectedNodeId}
            />
          )}

          {/* Empty state */}
          {!hasNodes && (
            <div className="flex flex-col items-center py-16">
              {!triggerNode && (
                <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-5">
                  <Workflow className="w-7 h-7 text-text-light" />
                </div>
              )}
              <p className="text-[15px] font-medium text-text-dark mb-1 mt-6">
                {triggerNode ? 'Add your first step' : 'No nodes yet'}
              </p>
              <p className="text-[13px] text-text-light mb-5">Drag nodes from the library or click below</p>
              <button
                onClick={() => onAddNodeAt(null, 0)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-colors duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-2 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Add first node
              </button>
            </div>
          )}
        </div>
      </div>
    </TreeContext.Provider>
  );
}
