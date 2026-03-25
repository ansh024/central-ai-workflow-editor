import { ArrowLeft, MousePointerClick } from 'lucide-react';
import NodeConfigPanel from './NodeConfigPanel';
import NodeLibrary from './NodeLibrary';

export default function RightPanel({
  panelMode,
  node,
  onUpdate,
  onDelete,
  onAddNode,
  onBack,
}) {
  return (
    <div className="w-[340px] border-l border-gray-200 bg-white flex flex-col shrink-0">
      {/* Back button for config and library modes */}
      {(panelMode === 'config' || panelMode === 'library') && (
        <div className="px-4 pt-3 pb-1">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-[12px] text-gray-500 hover:text-gray-700 transition-colors duration-200 cursor-pointer focus:outline-none"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back
          </button>
        </div>
      )}

      {/* Panel content */}
      {panelMode === 'idle' && (
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center">
            <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-4">
              <MousePointerClick className="w-6 h-6 text-gray-300" />
            </div>
            <p className="text-sm font-medium text-gray-600 mb-1">Select a node</p>
            <p className="text-[12px] text-gray-400 leading-relaxed max-w-[180px] mx-auto">
              Click any node on the canvas to view and edit its configuration
            </p>
          </div>
        </div>
      )}

      {panelMode === 'config' && node && (
        <NodeConfigPanel
          node={node}
          onUpdate={onUpdate}
          onDelete={onDelete}
          onClose={onBack}
        />
      )}

      {panelMode === 'library' && (
        <NodeLibrary onAddNode={onAddNode} />
      )}
    </div>
  );
}
