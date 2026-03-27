import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  ReactFlowProvider,
  addEdge,
  useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Plus, Search, X } from 'lucide-react';
import * as Icons from 'lucide-react';
import { NODE_TYPES, NODE_CATEGORIES } from '../data/nodeDefinitions';
import { flowTreeToReactFlow } from '../lib/flowTreeToReactFlow';

// ── Custom Node Component ──
function WorkflowNode({ data, selected }) {
  const isTrigger = data.nodeType === 'trigger';
  const isCondition = data.nodeType === 'condition';
  const IconComponent = Icons[data.icon] || Icons.Circle;

  const bgColor = getCategoryBgColor(data.category);
  const strokeColor = getCategoryStrokeColor(data.category);

  return (
    <div
      className={`relative flex items-center justify-center rounded-xl shadow-xs w-[300px] transition-all duration-200 ${
        selected
          ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-gray-50'
          : ''
      }`}
      style={{ backgroundColor: '#d1d5db' }}
    >
      {/* Inner Shell */}
      <div
        className={`relative h-[calc(100%-2px)] w-[calc(100%-2px)] bg-white p-[11px] ${
          isTrigger
            ? 'rounded-b-[11px] rounded-tl-none rounded-tr-[11px]'
            : 'rounded-[11px]'
        }`}
      >
        {/* Trigger Tab */}
        {isTrigger && (
          <div className="absolute -top-6 left-0 flex items-center gap-x-1 rounded-t-[10px] border-gray-300 border-x border-t bg-gray-100 px-[7.5px] py-[3.5px] text-gray-700 text-xs font-medium">
            <div className="w-2 h-2 rounded-full bg-gray-500 animate-pulse" />
            Trigger
          </div>
        )}

        {/* Condition badge */}
        {isCondition && (
          <div className="absolute right-0 flex items-center gap-x-1 rounded-lg border border-gray-300 bg-gray-100 px-[5px] py-px top-[-30px] text-gray-700 text-xs font-medium">
            Branches
          </div>
        )}

        {/* Header */}
        <div className="flex gap-x-1.5 border-gray-200 border-b pb-[11px] items-center">
          <div
            className="flex items-center justify-center w-6 h-6 rounded-md"
            style={{ backgroundColor: bgColor }}
          >
            <IconComponent
              className="w-4 h-4"
              style={{ color: strokeColor }}
            />
          </div>
          <div className="flex-1 truncate text-gray-900 text-sm font-medium tracking-[-0.3px]">
            {data.label}
          </div>
          <div className="justify-self-end rounded-lg border border-gray-300 bg-gray-100 px-[6px] py-px text-gray-700 text-xs font-medium">
            {data.tag || data.categoryLabel}
          </div>
        </div>

        {/* Body */}
        <div className="mt-2 truncate text-gray-600 text-xs leading-relaxed">
          {data.description
            ? data.description.length > 80
              ? data.description.slice(0, 80) + '...'
              : data.description
            : ''}
        </div>
      </div>

      {/* Handles */}
      {!isTrigger && (
        <Handle
          type="target"
          position={Position.Top}
          className="!w-3 !h-3 !bg-white !border !border-gray-300"
        />
      )}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-white !border !border-gray-300 !z-10"
      />

      {/* Plus button below handle — only on leaf nodes */}
      {!data.hasChildren && (
        <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center">
          <div className="w-px h-2 bg-gray-300" />
          <button
            className="w-6 h-6 rounded-full bg-blue-500 hover:bg-blue-600 flex items-center justify-center shadow-sm transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            onClick={(e) => {
              e.stopPropagation();
              data.onPlusClick?.(data.nodeId);
            }}
          >
            <Plus className="w-3.5 h-3.5 text-white pointer-events-none" />
          </button>
        </div>
      )}
    </div>
  );
}

// ── Custom Animated Edge ──
function AnimatedSVGEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  label,
}) {
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 16,
  });

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{ ...style, stroke: '#D1D3D6', strokeWidth: 1 }}
      />
      <path
        d={edgePath}
        fill="none"
        stroke="url(#flow-gradient)"
        strokeWidth={2}
        className="animated-edge"
      />
      {label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all',
            }}
            className="nodrag nopan"
          >
            <div className="rounded-lg border border-gray-200 bg-gray-50 px-[6px] py-px text-gray-500 text-xs whitespace-nowrap">
              {label}
            </div>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}

const nodeTypes = { workflowNode: WorkflowNode };
const edgeTypes = { animatedSvg: AnimatedSVGEdge };

// ── Helper: category colors ──
function getCategoryBgColor(category) {
  const map = {
    core: '#E5EEFF',
    logic: '#FFF3CC',
    integration: '#DCFCE7',
    ai: '#FFE4E6',
  };
  return map[category] || '#F3F4F6';
}

function getCategoryStrokeColor(category) {
  const map = {
    core: '#407FF2',
    logic: '#F5B900',
    integration: '#16A34A',
    ai: '#E11D48',
  };
  return map[category] || '#6B7280';
}

// ── Inner Flow (needs ReactFlowProvider parent) ──
function FlowCanvasInner({
  flowTree,
  selectedNodeId,
  onSelectNode,
  onPlusClick,
}) {
  const reactFlowInstance = useReactFlow();
  const [findOpen, setFindOpen] = useState(false);
  const [findQuery, setFindQuery] = useState('');
  const findInputRef = useRef(null);
  const prevTreeRef = useRef(null);

  // Convert tree to React Flow format
  const { nodes: rfNodes, edges: rfEdges } = useMemo(
    () => flowTreeToReactFlow(flowTree),
    [flowTree]
  );

  const enrichedInitial = useMemo(
    () => rfNodes.map((n) => ({ ...n, data: { ...n.data, nodeId: n.id, onPlusClick } })),
    [rfNodes, onPlusClick]
  );
  const [nodes, setNodes, onNodesChange] = useNodesState(enrichedInitial);
  const [edges, setEdges, onEdgesChange] = useEdgesState(rfEdges);

  // Sync when flowTree changes — inject onPlusClick into each node's data
  useEffect(() => {
    const { nodes: newNodes, edges: newEdges } = flowTreeToReactFlow(flowTree);
    const enriched = newNodes.map((n) => ({
      ...n,
      data: { ...n.data, nodeId: n.id, onPlusClick },
    }));
    setNodes(enriched);
    setEdges(newEdges);
  }, [flowTree, setNodes, setEdges, onPlusClick]);

  // Fit view after initial render
  useEffect(() => {
    const timer = setTimeout(() => {
      reactFlowInstance?.fitView({ padding: 0.2, duration: 300 });
    }, 100);
    return () => clearTimeout(timer);
  }, [rfNodes.length]);

  // Update selected state
  useEffect(() => {
    setNodes((nds) =>
      nds.map((n) => ({
        ...n,
        selected: n.id === selectedNodeId,
      }))
    );
  }, [selectedNodeId, setNodes]);

  // Handle node click
  const onNodeClick = useCallback(
    (event, node) => {
      onSelectNode(node.id);
    },
    [onSelectNode]
  );

  // Handle pane click (deselect)
  const onPaneClick = useCallback(() => {
    onSelectNode(null);
  }, [onSelectNode]);

  // Handle new connections
  const onConnect = useCallback(
    (params) =>
      setEdges((eds) => addEdge({ ...params, type: 'animatedSvg' }, eds)),
    [setEdges]
  );

  // Cmd+F finder
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

  // Apply find highlighting
  useEffect(() => {
    if (!findQuery) {
      setNodes((nds) => nds.map((n) => ({ ...n, className: '' })));
      return;
    }
    setNodes((nds) =>
      nds.map((n) => {
        const isMatch = n.data.label
          .toLowerCase()
          .includes(findQuery.toLowerCase());
        return {
          ...n,
          className: isMatch ? 'ring-2 ring-amber-400' : 'opacity-30',
        };
      })
    );
  }, [findQuery, setNodes]);

  return (
    <div className="flex-1 relative">
      {/* SVG gradient for animated edges */}
      <svg style={{ position: 'absolute', width: 0, height: 0 }}>
        <defs>
          <linearGradient
            id="flow-gradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="0%"
          >
            <stop offset="0%" stopColor="rgba(59, 130, 246, 0)" />
            <stop offset="50%" stopColor="rgba(59, 130, 246, 1)" />
            <stop offset="100%" stopColor="rgba(59, 130, 246, 0)" />
          </linearGradient>
        </defs>
      </svg>

      {/* Floating finder */}
      {findOpen && (
        <div className="absolute top-4 right-4 z-30 flex items-center gap-2 bg-white border border-gray-200 rounded-xl shadow-lg px-3 py-2">
          <Search className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <input
            ref={findInputRef}
            type="text"
            value={findQuery}
            onChange={(e) => setFindQuery(e.target.value)}
            placeholder="Find nodes..."
            className="text-[13px] text-gray-900 bg-transparent border-none outline-none w-40 placeholder:text-gray-400"
          />
          <button
            onClick={() => {
              setFindOpen(false);
              setFindQuery('');
            }}
            className="text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        connectionLineStyle={{ stroke: '#D1D3D6', strokeWidth: 2 }}
        defaultEdgeOptions={{ type: 'animatedSvg' }}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.2}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
      >
        <Background variant="dots" color="#cbd5e1" gap={24} size={1.5} />
        <Controls
          showInteractive={false}
          className="!bg-white !border !border-gray-200 !rounded-xl !shadow-lg"
        />
      </ReactFlow>
    </div>
  );
}

// ── Exported Component (wraps with ReactFlowProvider) ──
export default function FlowCanvas(props) {
  return (
    <ReactFlowProvider>
      <FlowCanvasInner {...props} />
    </ReactFlowProvider>
  );
}
