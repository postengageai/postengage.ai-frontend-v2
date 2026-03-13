'use client';

import { ChevronDown } from 'lucide-react';

interface V2ConnectorProps {
  label?: string;
}

export function V2Connector({ label }: V2ConnectorProps) {
  return (
    <div className='flex flex-col items-center'>
      <div className='h-4 w-px bg-white/10' />
      {label && (
        <span className='mb-1 rounded-full border border-white/10 bg-[#1a1a2e] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-slate-500'>
          {label}
        </span>
      )}
      <div className='flex h-6 w-6 items-center justify-center rounded-full border border-white/10 bg-[#1a1a2e]'>
        <ChevronDown className='h-3.5 w-3.5 text-slate-500' />
      </div>
      <div className='h-4 w-px bg-white/10' />
    </div>
  );
}
