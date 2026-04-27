'use client';

import { NodeProps } from '@xyflow/react';

type LaneData = {
  label: string;
  color: string;
};

export default function LaneNode({ data }: NodeProps) {
  const { label, color } = data as unknown as LaneData;
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        borderRadius: 14,
        border: `1px dashed ${color}35`,
        background: `${color}07`,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        padding: '10px 14px',
        pointerEvents: 'none',
      }}
    >
      <span
        style={{
          color,
          fontSize: 10,
          fontWeight: 800,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          opacity: 0.55,
        }}
      >
        {label}
      </span>
    </div>
  );
}
