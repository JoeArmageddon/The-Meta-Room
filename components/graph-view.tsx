'use client';

import { useCallback, useMemo } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  NodeProps,
  Handle,
  Position,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Entry, Relationship } from '@/app/types';
import { cn } from '@/lib/utils';
import { Sparkles, Bot, FileText, Workflow, BookOpen } from 'lucide-react';

interface GraphViewProps {
  entries: Entry[];
  relationships?: Relationship[];
  highlightedEntryId?: string;
  onNodeClick?: (entry: Entry) => void;
  className?: string;
}

const typeConfig = {
  skill: {
    icon: Sparkles,
    color: '#3b82f6',
    bgColor: '#eff6ff',
    borderColor: '#3b82f6',
  },
  agent: {
    icon: Bot,
    color: '#a855f7',
    bgColor: '#faf5ff',
    borderColor: '#a855f7',
  },
  prompt: {
    icon: FileText,
    color: '#22c55e',
    bgColor: '#f0fdf4',
    borderColor: '#22c55e',
  },
  workflow: {
    icon: Workflow,
    color: '#f97316',
    bgColor: '#fff7ed',
    borderColor: '#f97316',
  },
  documentation: {
    icon: BookOpen,
    color: '#6b7280',
    bgColor: '#f9fafb',
    borderColor: '#6b7280',
  },
};

interface CustomNodeData {
  entry: Entry;
  isHighlighted: boolean;
}

function CustomNode({ data, selected }: NodeProps<CustomNodeData>) {
  const { entry, isHighlighted } = data;
  const config = typeConfig[entry.type] || typeConfig.documentation;
  const Icon = config.icon;

  return (
    <div
      className={cn(
        'px-4 py-3 rounded-lg border-2 shadow-sm transition-all duration-200',
        'min-w-[150px] max-w-[250px]',
        isHighlighted && 'ring-2 ring-primary ring-offset-2',
        selected && 'shadow-lg scale-105'
      )}
      style={{
        backgroundColor: config.bgColor,
        borderColor: isHighlighted ? config.borderColor : 'transparent',
      }}
    >
      <Handle type="target" position={Position.Top} className="w-2 h-2" />
      
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 shrink-0" style={{ color: config.color }} />
        <span className="text-sm font-medium truncate" style={{ color: config.color }}>
          {entry.title}
        </span>
      </div>
      
      <div className="mt-1">
        <span className="text-xs capitalize opacity-70" style={{ color: config.color }}>
          {entry.type}
        </span>
      </div>

      <Handle type="source" position={Position.Bottom} className="w-2 h-2" />
    </div>
  );
}

const nodeTypes = {
  custom: CustomNode,
};

export function GraphView({
  entries,
  relationships = [],
  highlightedEntryId,
  onNodeClick,
  className,
}: GraphViewProps) {
  // Create nodes from entries
  const initialNodes: Node<CustomNodeData>[] = useMemo(() => {
    return entries.map((entry, index) => {
      // Calculate position in a grid layout
      const cols = Math.ceil(Math.sqrt(entries.length));
      const x = (index % cols) * 280 + 50;
      const y = Math.floor(index / cols) * 150 + 50;

      return {
        id: entry.id,
        type: 'custom',
        position: { x, y },
        data: {
          entry,
          isHighlighted: entry.id === highlightedEntryId,
        },
      };
    });
  }, [entries, highlightedEntryId]);

  // Create edges from relationships
  const initialEdges: Edge[] = useMemo(() => {
    return relationships.map((rel, index) => ({
      id: `edge-${index}`,
      source: rel.source_entry_id,
      target: rel.target_entry_id,
      type: 'smoothstep',
      animated: true,
      label: rel.relationship_type.replace('_', ' '),
      style: {
        stroke: '#94a3b8',
        strokeWidth: 2,
      },
      labelStyle: {
        fill: '#64748b',
        fontSize: 10,
      },
    }));
  }, [relationships]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const handleNodeClick = useCallback(
    (_: React.MouseEvent, node: Node<CustomNodeData>) => {
      onNodeClick?.(node.data.entry);
    },
    [onNodeClick]
  );

  if (entries.length === 0) {
    return (
      <div className={cn('flex items-center justify-center h-[400px] bg-muted/30 rounded-lg', className)}>
        <p className="text-muted-foreground">No entries to display</p>
      </div>
    );
  }

  return (
    <div className={cn('h-[500px] w-full border rounded-lg overflow-hidden bg-background', className)}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-right"
      >
        <Background color="#94a3b8" gap={20} size={1} />
        <Controls />
        <MiniMap
          nodeStrokeWidth={3}
          zoomable
          pannable
        />
      </ReactFlow>
    </div>
  );
}
