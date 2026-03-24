import { useState } from 'react';
import { NODE_CATEGORIES, NODE_TYPES, getNodesByCategory } from '../data/nodeDefinitions';
import { Search, ChevronDown, ChevronRight, GripVertical } from 'lucide-react';
import * as Icons from 'lucide-react';

// Category color map for filter pills
const CATEGORY_COLORS = {
  core:        { bg: 'bg-cyan-50',   text: 'text-cyan-700',   border: 'border-cyan-200',   dot: 'bg-cyan-500'   },
  logic:       { bg: 'bg-amber-50',  text: 'text-amber-700',  border: 'border-amber-200',  dot: 'bg-amber-500'  },
  integration: { bg: 'bg-emerald-50',text: 'text-emerald-700',border: 'border-emerald-200',dot: 'bg-emerald-500'},
  ai:          { bg: 'bg-rose-50',   text: 'text-rose-700',   border: 'border-rose-200',   dot: 'bg-rose-500'   },
};

export default function NodeLibrary({ onAddNode, collapsed, onToggle }) {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState(null); // null = all
  const [expandedCategories, setExpandedCategories] = useState({ core: true, logic: true, integration: true, ai: false });

  const toggleCategory = (cat) => {
    setExpandedCategories((prev) => ({ ...prev, [cat]: !prev[cat] }));
  };

  const allNodes = Object.values(NODE_TYPES);

  // Compute filtered nodes (text search + category filter combined)
  const filtered = (search || activeCategory)
    ? allNodes.filter((n) => {
        const matchesSearch = !search ||
          n.label.toLowerCase().includes(search.toLowerCase()) ||
          n.description.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = !activeCategory || n.category === activeCategory;
        return matchesSearch && matchesCategory;
      })
    : null;

  const renderNode = (node) => {
    const IconComponent = Icons[node.icon] || Icons.Circle;
    const cat = NODE_CATEGORIES[node.category];
    return (
      <button
        key={node.type}
        onClick={() => onAddNode(node.type)}
        draggable
        onDragStart={(e) => e.dataTransfer.setData('nodeType', node.type)}
        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-surface border border-transparent hover:border-border hover:shadow-sm transition-all duration-200 text-left cursor-grab active:cursor-grabbing group focus:outline-none focus:ring-2 focus:ring-primary/30"
      >
        <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: cat.colorHex + '12' }}>
          <IconComponent className="w-3.5 h-3.5" style={{ color: cat.colorHex }} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[12px] font-semibold text-text-dark truncate">{node.label}</div>
          <div className="text-[10px] text-text-light truncate leading-relaxed">{node.description}</div>
        </div>
        <GripVertical className="w-3.5 h-3.5 text-text-light opacity-0 group-hover:opacity-50 transition-opacity duration-200 shrink-0" />
      </button>
    );
  };

  if (collapsed) {
    return (
      <div className="w-12 border-r border-border bg-surface flex flex-col items-center py-4">
        <button
          onClick={onToggle}
          className="p-2 rounded-lg hover:bg-slate-50 transition-colors duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30"
          title="Expand node library"
          aria-label="Expand node library"
        >
          <ChevronRight className="w-4 h-4 text-text-mid" />
        </button>
      </div>
    );
  }

  return (
    <div className="w-[260px] border-r border-border bg-surface flex flex-col shrink-0">
      <div className="p-3 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-semibold text-text-dark uppercase tracking-wider">Node Library</span>
          <button
            onClick={onToggle}
            className="p-1 rounded-md hover:bg-slate-50 transition-colors duration-200 cursor-pointer focus:outline-none"
            aria-label="Collapse node library"
          >
            <ChevronDown className="w-3.5 h-3.5 text-text-light rotate-90" />
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-2.5">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-light" />
          <input
            type="text"
            placeholder="Search nodes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-2 rounded-lg border border-border text-[12px] text-text-dark focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200 placeholder:text-placeholder"
          />
        </div>

        {/* Category filter pills */}
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setActiveCategory(null)}
            className={`px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all duration-200 cursor-pointer focus:outline-none ${
              !activeCategory
                ? 'bg-primary text-white border-primary'
                : 'bg-surface border-border text-text-mid hover:bg-slate-50'
            }`}
          >
            All
          </button>
          {Object.entries(NODE_CATEGORIES).map(([key, cat]) => {
            const colors = CATEGORY_COLORS[key];
            const count = getNodesByCategory(key).length;
            const isActive = activeCategory === key;
            return (
              <button
                key={key}
                onClick={() => setActiveCategory(isActive ? null : key)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all duration-200 cursor-pointer focus:outline-none ${
                  isActive
                    ? `${colors.bg} ${colors.text} ${colors.border}`
                    : 'bg-surface border-border text-text-mid hover:bg-slate-50'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${isActive ? colors.dot : 'bg-text-light'}`} />
                {cat.label}
                <span className={`ml-0.5 text-[10px] ${isActive ? colors.text : 'text-text-light'}`}>{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2.5 space-y-0.5">
        {filtered ? (
          <div className="space-y-1">
            {filtered.map(renderNode)}
            {filtered.length === 0 && (
              <div className="text-center py-8">
                <Search className="w-5 h-5 text-text-light mx-auto mb-2" />
                <p className="text-[12px] text-text-light">No nodes found</p>
                {(search || activeCategory) && (
                  <button
                    onClick={() => { setSearch(''); setActiveCategory(null); }}
                    className="text-[11px] text-primary mt-2 hover:underline cursor-pointer focus:outline-none"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            )}
          </div>
        ) : (
          Object.entries(NODE_CATEGORIES).map(([key, cat]) => {
            const nodes = getNodesByCategory(key);
            const isExpanded = expandedCategories[key];
            const colors = CATEGORY_COLORS[key];
            return (
              <div key={key} className="mb-1">
                <button
                  onClick={() => toggleCategory(key)}
                  className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-slate-50 transition-colors duration-200 cursor-pointer focus:outline-none"
                >
                  {isExpanded ? (
                    <ChevronDown className="w-3.5 h-3.5 text-text-light" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-text-light" />
                  )}
                  <span className={`w-2 h-2 rounded-full ${colors.dot}`} />
                  <span className="text-[12px] font-semibold text-text-dark">{cat.label}</span>
                  <span className="text-[10px] text-text-light ml-auto bg-slate-100 px-1.5 py-0.5 rounded-full">{nodes.length}</span>
                </button>
                {isExpanded && (
                  <div className="mt-0.5 space-y-0.5 ml-0.5">
                    {nodes.map(renderNode)}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Drag hint */}
      <div className="px-3 py-2.5 border-t border-border">
        <p className="text-[10px] text-text-light text-center">Drag nodes to canvas or click to add</p>
      </div>
    </div>
  );
}
