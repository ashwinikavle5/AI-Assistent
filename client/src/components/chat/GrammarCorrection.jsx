import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';

export const GrammarCorrection = ({ correction }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!correction || !correction.better) return null;

  return (
    <div
      className="mt-2.5 rounded-2xl border transition-all duration-200 overflow-hidden text-xs"
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderColor: 'var(--border-main)'
      }}
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-3.5 py-2 hover:bg-white/5 transition-colors cursor-pointer"
        style={{ color: 'var(--text-main)' }}
      >
        <div className="flex items-center gap-2 font-semibold">
          <span className="text-amber-400">✏️</span>
          <span>Grammar Tip</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 font-medium">
            Expand to view
          </span>
        </div>
        {isExpanded ? <ChevronUp size={16} style={{ color: 'var(--text-muted)' }} /> : <ChevronDown size={16} style={{ color: 'var(--text-muted)' }} />}
      </button>

      {isExpanded && (
        <div className="px-3.5 pb-3 pt-1 space-y-2 border-t" style={{ borderColor: 'var(--border-main)' }}>
          {/* Original */}
          <div className="space-y-0.5">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-red-400/90">
              You wrote:
            </span>
            <p className="p-2 rounded-xl text-red-300/90 font-mono text-[11px] bg-red-500/10 border border-red-500/20">
              "{correction.original}"
            </p>
          </div>

          {/* Better */}
          <div className="space-y-0.5">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
              <CheckCircle2 size={12} /> Better English:
            </span>
            <p className="p-2 rounded-xl text-emerald-300 font-medium text-[11px] bg-emerald-500/10 border border-emerald-500/20">
              "{correction.better}"
            </p>
          </div>

          {/* Why */}
          <div className="space-y-0.5">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-blue-400 flex items-center gap-1">
              <Sparkles size={12} /> Why?
            </span>
            <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {correction.explanation}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
