import { NODE_TYPES, NODE_CATEGORIES } from '../data/nodeDefinitions';

const NODE_WIDTH = 300;
const NODE_HEIGHT = 100;
const HORIZONTAL_GAP = 80;
const VERTICAL_GAP = 100;

/**
 * Convert tree-structured flowTree to React Flow nodes and edges.
 * Returns { nodes: [], edges: [] }
 */
export function flowTreeToReactFlow(flowTree) {
  if (!flowTree) return { nodes: [], edges: [] };

  const nodes = [];
  const edges = [];
  let yOffset = 0;

  // Helper to compute tree width (how many leaf paths)
  function getSubtreeWidth(nodeList) {
    if (!nodeList || nodeList.length === 0) return 1;
    let maxBranchWidth = 0;
    for (const node of nodeList) {
      if (node.branches && node.branches.length > 0) {
        let totalBranchWidth = 0;
        for (const branch of node.branches) {
          totalBranchWidth += getSubtreeWidth(branch.nodes);
        }
        maxBranchWidth = Math.max(maxBranchWidth, totalBranchWidth);
      }
    }
    return maxBranchWidth || 1;
  }

  // Process trigger node
  if (flowTree.trigger) {
    const triggerDef = NODE_TYPES[flowTree.trigger.type];
    const triggerCat = triggerDef ? NODE_CATEGORIES[triggerDef.category] : null;

    nodes.push({
      id: 'trigger',
      type: 'workflowNode',
      position: { x: 0, y: 0 },
      data: {
        nodeType: 'trigger',
        type: flowTree.trigger.type,
        config: flowTree.trigger.config,
        label: triggerDef?.label || 'Incoming Call',
        description: triggerDef?.description || '',
        icon: triggerDef?.icon || 'PhoneIncoming',
        category: triggerDef?.category || 'core',
        categoryColor: triggerCat?.colorHex || '#0EA5E9',
        categoryLabel: triggerCat?.label || 'Core',
        hasChildren: flowTree.nodes && flowTree.nodes.length > 0,
      },
    });
    yOffset = VERTICAL_GAP + NODE_HEIGHT;
  }

  // Recursive layout
  function layoutNodes(nodeList, parentId, startX, startY, parentBranchLabel) {
    if (!nodeList || nodeList.length === 0) return startY;

    let currentY = startY;

    for (let i = 0; i < nodeList.length; i++) {
      const node = nodeList[i];
      const nodeDef = NODE_TYPES[node.type];
      const cat = nodeDef ? NODE_CATEGORIES[nodeDef.category] : null;

      const nodeId = node.id;

      const hasBranches = node.branches && node.branches.length > 0;
      const hasNextSibling = i < nodeList.length - 1;
      const hasChildren = hasBranches || hasNextSibling;

      // Place this node
      nodes.push({
        id: nodeId,
        type: 'workflowNode',
        position: { x: startX, y: currentY },
        data: {
          nodeType: hasBranches ? 'condition' : 'action',
          type: node.type,
          config: node.config,
          label: nodeDef?.label || node.type,
          description: getNodePreview(node, nodeDef),
          icon: nodeDef?.icon || 'Circle',
          category: nodeDef?.category || 'core',
          categoryColor: cat?.colorHex || '#94A3B8',
          categoryLabel: cat?.label || 'Unknown',
          tag: cat?.label || '',
          hasChildren,
        },
      });

      // Edge from parent
      const edgeLabel = (i === 0 && parentBranchLabel) ? parentBranchLabel : undefined;
      if (parentId) {
        edges.push({
          id: `e-${parentId}-${nodeId}`,
          source: parentId,
          target: nodeId,
          type: 'animatedSvg',
          label: edgeLabel,
        });
      }

      // Handle branches
      if (node.branches && node.branches.length > 0) {
        const totalWidth = node.branches.reduce((sum, branch) => {
          return sum + getSubtreeWidth(branch.nodes);
        }, 0);

        const totalPixelWidth = totalWidth * (NODE_WIDTH + HORIZONTAL_GAP);
        let branchX = startX - totalPixelWidth / 2 + (NODE_WIDTH + HORIZONTAL_GAP) / 2;
        const branchY = currentY + VERTICAL_GAP + NODE_HEIGHT;

        for (const branch of node.branches) {
          const branchWidth = getSubtreeWidth(branch.nodes);
          const branchCenterX = branchX + (branchWidth - 1) * (NODE_WIDTH + HORIZONTAL_GAP) / 2;

          const endY = layoutNodes(
            branch.nodes,
            nodeId,
            branchCenterX,
            branchY,
            branch.label
          );
          currentY = Math.max(currentY, endY);

          branchX += branchWidth * (NODE_WIDTH + HORIZONTAL_GAP);
        }
      }

      parentId = nodeId;
      currentY += VERTICAL_GAP + NODE_HEIGHT;
    }

    return currentY;
  }

  // Layout main trunk
  const totalWidth = getSubtreeWidth(flowTree.nodes);
  const startX = 0; // Center will be handled by fitView
  layoutNodes(flowTree.nodes, flowTree.trigger ? 'trigger' : null, startX, yOffset, null);

  return { nodes, edges };
}

function getNodePreview(node, nodeDef) {
  if (node.config?.message) return node.config.message;
  if (node.config?.question) return node.config.question;
  if (node.config?.closingMessage) return node.config.closingMessage;
  if (node.config?.transferTo) return `Transfer to ${node.config.transferTo}`;
  if (node.config?.calendarSource) return node.config.calendarSource;
  if (node.config?.intents) return node.config.intents;
  return nodeDef?.description || '';
}
