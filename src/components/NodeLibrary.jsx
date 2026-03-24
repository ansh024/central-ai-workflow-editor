import { useState } from 'react';
import { NODE_CATEGORIES, NODE_TYPES, getNodesByCategory } from '../data/nodeDefinitions';
import { Search } from 'lucide-react';
import * as Icons from 'lucide-react';

const CATEGORY_STYLES = {
  core: { iconBg: '#E5EEFF', iconStroke: '#407FF2', dot: 'bg-[#407FF2]' },
  logic: { iconBg: '#FFF3CC', iconStroke: '#F5B900', dot: 'bg-[#F5B900]' },
  integration: { iconBg: '#DCFCE7', iconStroke: '#16A34A', dot: 'bg-[#16A34A]' },
  ai: { iconBg: '#FFE4E6', iconStroke: '#E11D48', dot: 'bg-[#E11D48]' },
};

export default function NodeLibrary({ onAddNode }) {
  const [search, setSearch] = useState('');

  const renderNode = (node) => {
    const IconComponent = Icons[node.icon] || Icons.Circle;
    const style = CATEGORY_STYLES[node.category] || CATEGORY_STYLES.core;

    return (
      <button
        key={node.type}
        onClick={() => onAddNode(node.type)}
        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-white border border-transparent hover:border-gray-200 hover:shadow-sm transition-all duration-200 text-left cursor-pointer group focus:outline-none focus:ring-2 focus:ring-blue-500/20"
      >
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
          style={{ backgroundColor: style.iconBg }}
        >
          <IconComponent
            className="w-3.5 h-3.5"
            style={{ color: style.iconStroke }}
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[12px] font-medium text-gray-900 truncate">
            {node.label}
          </div>
          <div className="text-[10px] text-gray-500 truncate leading-relaxed">
            {node.description}
          </div>
        </div>
      </button>
    );
  };

  const allNodes = Object.values(NODE_TYPES);
  const filtered = search
    ? allNodes.filter(
        (n) =>
          n.label.toLowerCase().includes(search.toLowerCase()) ||
          n.description.toLowerCase().includes(search.toLowerCase())
      )
    : null;

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Header */}
      <div className="px-4 pt-3 pb-3">
        <div className="mb-1">
          <span className="text-[14px] font-semibold text-gray-900">
            Next step
          </span>
        </div>
        <p className="text-[12px] text-gray-400 mb-3">
          Add the next block in this workflow
        </p>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search blocks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-[12px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 focus:bg-white transition-all duration-200 placeholder:text-gray-400"
          />
        </div>
      </div>

      <div className="h-px bg-gray-100 mx-4" />

      {/* Node List */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-0.5">
        {filtered ? (
          <div className="space-y-0.5">
            {filtered.map(renderNode)}
            {filtered.length === 0 && (
              <div className="text-center py-10">
                <Search className="w-5 h-5 text-gray-300 mx-auto mb-2" />
                <p className="text-[12px] text-gray-400">No blocks found</p>
                <button
                  onClick={() => setSearch('')}
                  className="text-[11px] text-blue-500 mt-2 hover:underline cursor-pointer"
                >
                  Clear search
                </button>
              </div>
            )}
          </div>
        ) : (
          Object.entries(NODE_CATEGORIES).map(([key, cat]) => {
            const nodes = getNodesByCategory(key);
            const style = CATEGORY_STYLES[key];
            return (
              <div key={key} className="mb-2">
                <div className="flex items-center gap-2 px-2 py-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${style?.dot || 'bg-gray-400'}`} />
                  <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                    {cat.label}
                  </span>
                </div>
                <div className="space-y-0.5">
                  {nodes.map(renderNode)}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
