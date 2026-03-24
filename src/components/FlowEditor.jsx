import { useState, useCallback } from 'react';
import NodeLibrary from './NodeLibrary';
import FlowCanvas from './FlowCanvas';
import NodeConfigPanel from './NodeConfigPanel';
import VersionHistory from './VersionHistory';
import { NODE_TYPES } from '../data/nodeDefinitions';
import {
  Undo2, Redo2, Play, Upload, MoreHorizontal, ChevronLeft, AlertTriangle, CheckCircle2, History,
} from 'lucide-react';
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
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';

let nextId = 100;

export default function FlowEditor({ initialFlow, flowName: initName, onBack, onOpenSimulator, onNodesChange }) {
  // flowTree is the tree-structured flow data
  const [flowTree, setFlowTree] = useState(initialFlow || { trigger: { type: 'incoming_call', config: {} }, nodes: [] });
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [libraryCollapsed, setLibraryCollapsed] = useState(false);
  const [flowName, setFlowName] = useState(initName || 'Untitled Flow');
  const [status, setStatus] = useState('Draft');
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Version history
  const [versions, setVersions] = useState([
    {
      id: 'v1',
      version: 1,
      author: 'System',
      timestamp: new Date(2026, 2, 10, 9, 0),
      note: 'Auto-generated from template',
      flowJson: initialFlow,
      isActive: true,
    },
  ]);
  const [activeVersionId, setActiveVersionId] = useState('v1');

  // Undo/Redo
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);

  const pushUndo = useCallback((prevTree) => {
    setUndoStack((prev) => [...prev.slice(-19), prevTree]);
    setRedoStack([]);
  }, []);

  const undo = () => {
    if (undoStack.length === 0) return;
    const prev = undoStack[undoStack.length - 1];
    setRedoStack((r) => [...r, flowTree]);
    setUndoStack((u) => u.slice(0, -1));
    setFlowTree(prev);
  };

  const redo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setUndoStack((u) => [...u, flowTree]);
    setRedoStack((r) => r.slice(0, -1));
    setFlowTree(next);
  };

  // Count total nodes in tree
  const countNodes = (tree) => {
    if (!tree) return 0;
    let count = tree.trigger ? 1 : 0;
    const countList = (nodes) => {
      for (const n of nodes) {
        count++;
        if (n.branches) {
          for (const b of n.branches) {
            countList(b.nodes);
          }
        }
      }
    };
    if (tree.nodes) countList(tree.nodes);
    return count;
  };

  // Find a node in the tree by ID
  const findNodeInTree = (tree, nodeId) => {
    if (nodeId === 'trigger') return tree.trigger;
    const search = (nodes) => {
      for (const n of nodes) {
        if (n.id === nodeId) return n;
        if (n.branches) {
          for (const b of n.branches) {
            const found = search(b.nodes);
            if (found) return found;
          }
        }
      }
      return null;
    };
    return search(tree.nodes || []);
  };

  const selectedNode = findNodeInTree(flowTree, selectedNodeId);

  // Update a node in the tree (immutably)
  const updateNodeInTree = useCallback((tree, nodeId, updatedNode) => {
    if (nodeId === 'trigger') {
      return { ...tree, trigger: updatedNode };
    }
    const updateList = (nodes) =>
      nodes.map((n) => {
        if (n.id === nodeId) return updatedNode;
        if (n.branches) {
          return { ...n, branches: n.branches.map((b) => ({ ...b, nodes: updateList(b.nodes) })) };
        }
        return n;
      });
    return { ...tree, nodes: updateList(tree.nodes) };
  }, []);

  // Delete a node from the tree
  const deleteNodeFromTree = useCallback((tree, nodeId) => {
    const removeFromList = (nodes) =>
      nodes.filter((n) => n.id !== nodeId).map((n) => {
        if (n.branches) {
          return { ...n, branches: n.branches.map((b) => ({ ...b, nodes: removeFromList(b.nodes) })) };
        }
        return n;
      });
    return { ...tree, nodes: removeFromList(tree.nodes) };
  }, []);

  const handleUpdateNode = useCallback((updated) => {
    pushUndo(flowTree);
    const newTree = updateNodeInTree(flowTree, updated.id || selectedNodeId, updated);
    setFlowTree(newTree);
    setStatus('Modified');
    onNodesChange?.(newTree);
  }, [flowTree, selectedNodeId, updateNodeInTree, pushUndo, onNodesChange]);

  const handleDeleteNode = useCallback((id) => {
    pushUndo(flowTree);
    const newTree = deleteNodeFromTree(flowTree, id);
    setFlowTree(newTree);
    setSelectedNodeId(null);
    setStatus('Modified');
    onNodesChange?.(newTree);
  }, [flowTree, deleteNodeFromTree, pushUndo, onNodesChange]);

  const handleAddNode = useCallback((afterNodeId, depth) => {
    // For now, just append to root nodes
    pushUndo(flowTree);
    const id = 'n' + nextId++;
    const newNode = { id, type: 'greeting', config: { message: 'Hello! How can I help you?' } };
    const newTree = { ...flowTree, nodes: [...flowTree.nodes, newNode] };
    setFlowTree(newTree);
    setSelectedNodeId(id);
    setStatus('Modified');
    onNodesChange?.(newTree);
  }, [flowTree, pushUndo, onNodesChange]);

  const handleDropNode = useCallback((type) => {
    pushUndo(flowTree);
    const id = 'n' + nextId++;
    const def = NODE_TYPES[type];
    const config = {};
    if (def) {
      def.configFields.forEach((f) => {
        if (f.default !== undefined) config[f.key] = f.default;
      });
    }
    const newNode = { id, type, config };
    const newTree = { ...flowTree, nodes: [...flowTree.nodes, newNode] };
    setFlowTree(newTree);
    setSelectedNodeId(id);
    setStatus('Modified');
    onNodesChange?.(newTree);
  }, [flowTree, pushUndo, onNodesChange]);

  // Publishing
  const handlePublish = () => {
    const newVersion = {
      id: 'v' + (versions.length + 1),
      version: versions.length + 1,
      author: 'Dr. Patel',
      timestamp: new Date(),
      note: '',
      flowJson: flowTree,
      isActive: true,
    };
    setVersions((prev) =>
      [...prev.map((v) => ({ ...v, isActive: false })), newVersion]
    );
    setActiveVersionId(newVersion.id);
    setStatus('Published');
  };

  // Restore a version
  const handleRestore = (versionId) => {
    const ver = versions.find((v) => v.id === versionId);
    if (!ver) return;
    const newVersion = {
      id: 'v' + (versions.length + 1),
      version: versions.length + 1,
      author: 'Dr. Patel',
      timestamp: new Date(),
      note: `Restored from v${ver.version}`,
      flowJson: ver.flowJson,
      isActive: true,
    };
    setVersions((prev) =>
      [...prev.map((v) => ({ ...v, isActive: false })), newVersion]
    );
    setActiveVersionId(newVersion.id);
    setFlowTree(ver.flowJson);
    setStatus('Published');
    setShowVersionHistory(false);
  };

  // Discard draft
  const handleDiscard = () => {
    const activeVer = versions.find((v) => v.id === activeVersionId);
    if (activeVer) {
      setFlowTree(activeVer.flowJson);
      setStatus('Published');
    }
  };

  // Validation
  const getIssues = () => {
    const issues = [];
    const totalNodes = countNodes(flowTree);
    if (totalNodes <= 1) {
      issues.push('Flow has no steps after the trigger');
      return issues;
    }
    if (!flowTree.trigger) issues.push('Missing trigger node');
    // Check for end_call in any branch
    let hasEnd = false;
    const checkEnd = (nodes) => {
      for (const n of nodes) {
        if (n.type === 'end_call') hasEnd = true;
        if (n.branches) {
          for (const b of n.branches) checkEnd(b.nodes);
        }
      }
    };
    checkEnd(flowTree.nodes || []);
    if (!hasEnd) issues.push('Missing "End Call" node — flow needs a graceful close');
    return issues;
  };

  const issues = getIssues();
  const totalNodes = countNodes(flowTree);

  const statusBadgeVariant =
    status === 'Published' ? 'default' :
    status === 'Modified' ? 'outline' :
    'secondary';

  return (
    <TooltipProvider>
      <div className="h-screen flex flex-col bg-bg">
        {/* Top Bar */}
        <div className="h-14 border-b border-border bg-surface flex items-center px-4 gap-3 shrink-0">
          <button
            onClick={onBack}
            className="p-1.5 rounded-lg hover:bg-slate-50 transition-colors duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30"
            title="Back to gallery"
          >
            <ChevronLeft className="w-5 h-5 text-text-mid" />
          </button>

          <div className="h-6 w-px bg-border" />

          <input
            type="text"
            value={flowName}
            onChange={(e) => setFlowName(e.target.value)}
            className="text-sm font-semibold text-text-dark bg-transparent border-none outline-none hover:bg-slate-50 focus:bg-slate-50 focus:ring-2 focus:ring-primary/20 px-2.5 py-1.5 rounded-lg transition-all duration-200 max-w-[240px]"
          />

          {/* Status badge */}
          <Badge variant={statusBadgeVariant}>
            {status}
          </Badge>

          {status === 'Modified' && (
            <button
              onClick={handleDiscard}
              className="text-[11px] text-text-light hover:text-red-500 transition-colors duration-200 cursor-pointer focus:outline-none"
            >
              Discard changes
            </button>
          )}

          <div className="flex-1" />

          {/* Undo/Redo */}
          <div className="flex items-center gap-0.5 bg-slate-50 rounded-lg p-0.5">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={undo}
                  disabled={undoStack.length === 0}
                  className="p-1.5 rounded-md hover:bg-white disabled:opacity-30 transition-all duration-200 cursor-pointer disabled:cursor-not-allowed focus:outline-none"
                >
                  <Undo2 className="w-4 h-4 text-text-mid" />
                </button>
              </TooltipTrigger>
              <TooltipContent>Undo</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={redo}
                  disabled={redoStack.length === 0}
                  className="p-1.5 rounded-md hover:bg-white disabled:opacity-30 transition-all duration-200 cursor-pointer disabled:cursor-not-allowed focus:outline-none"
                >
                  <Redo2 className="w-4 h-4 text-text-mid" />
                </button>
              </TooltipTrigger>
              <TooltipContent>Redo</TooltipContent>
            </Tooltip>
          </div>

          <div className="h-6 w-px bg-border" />

          {/* Test Flow */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={onOpenSimulator}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm font-medium text-text-dark hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 cursor-pointer focus:outline-none"
              >
                <Play className="w-3.5 h-3.5 text-primary" />
                Test Flow
              </button>
            </TooltipTrigger>
            <TooltipContent>Run a simulation of this flow</TooltipContent>
          </Tooltip>

          {/* Publish */}
          <button
            onClick={handlePublish}
            className="flex items-center gap-2 px-5 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-all duration-200 cursor-pointer shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-2"
          >
            <Upload className="w-3.5 h-3.5" />
            Publish
          </button>

          {/* More menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-2 rounded-lg hover:bg-slate-50 transition-colors duration-200 cursor-pointer focus:outline-none">
                <MoreHorizontal className="w-4 h-4 text-text-mid" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => setShowVersionHistory(true)}>
                <History className="w-4 h-4 text-text-light" />
                Version History
              </DropdownMenuItem>
              <DropdownMenuItem>Duplicate</DropdownMenuItem>
              <DropdownMenuItem>Export</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onSelect={() => setShowDeleteConfirm(true)}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          <NodeLibrary
            onAddNode={(type) => handleDropNode(type)}
            collapsed={libraryCollapsed}
            onToggle={() => setLibraryCollapsed(!libraryCollapsed)}
          />
          <FlowCanvas
            flowTree={flowTree}
            selectedNodeId={selectedNodeId}
            onSelectNode={setSelectedNodeId}
            onAddNodeAt={handleAddNode}
            onDropNode={handleDropNode}
          />
          <NodeConfigPanel
            node={selectedNode}
            onUpdate={handleUpdateNode}
            onDelete={handleDeleteNode}
            onClose={() => setSelectedNodeId(null)}
          />
        </div>

        {/* Bottom Validation Bar */}
        <div className="h-10 border-t border-border bg-surface flex items-center px-4 shrink-0">
          {issues.length > 0 ? (
            <button className="flex items-center gap-2 text-amber-600 cursor-pointer hover:text-amber-700 transition-colors duration-200 focus:outline-none">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span className="text-xs font-semibold">{issues.length} issue{issues.length > 1 ? 's' : ''} found</span>
              <span className="text-[11px] text-text-light ml-1 font-normal">— {issues[0]}</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 text-emerald-600">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span className="text-xs font-semibold">Flow is valid</span>
            </div>
          )}
          <div className="flex-1" />
          <span className="text-[11px] text-text-light font-medium">{totalNodes} nodes</span>
        </div>

        {/* Version History Panel */}
        {showVersionHistory && (
          <VersionHistory
            versions={versions}
            activeVersionId={activeVersionId}
            onRestore={handleRestore}
            onClose={() => setShowVersionHistory(false)}
          />
        )}

        {/* Delete Workflow Confirmation */}
        <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete workflow?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. The workflow and all its version history will be permanently deleted.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-white hover:bg-destructive/90"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  );
}
