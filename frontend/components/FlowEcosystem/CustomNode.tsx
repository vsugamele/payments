import { Handle, Position } from '@xyflow/react';
import * as Icons from 'lucide-react';
import { LucideProps } from 'lucide-react';
import { ComponentType } from 'react';
import { NodeData } from './nodes';

export default function CustomNode({ data, selected }: { data: NodeData; selected: boolean }) {
  const IconComponent = (Icons[data.icon as keyof typeof Icons] || Icons.HelpCircle) as ComponentType<LucideProps>;

  return (
    <div
      className={`relative rounded-xl border-2 bg-background p-4 shadow-lg transition-all min-w-[220px] ${
        selected ? 'ring-2 ring-ring shadow-xl scale-105' : 'hover:scale-105'
      }`}
      style={{ borderColor: selected ? data.color : `${data.color}40` }}
    >
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-muted-foreground border-2 border-background" />
      
      <div className="flex items-center gap-4">
        <div 
          className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0 border"
          style={{ background: `${data.color}15`, color: data.color, borderColor: `${data.color}30` }}
        >
          <IconComponent size={24} />
        </div>
        
        <div>
          <div className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: data.color }}>
            {data.sub}
          </div>
          <div className="text-sm font-bold text-foreground leading-tight">
            {data.label}
          </div>
        </div>
      </div>

      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-muted-foreground border-2 border-background" />
    </div>
  );
}
