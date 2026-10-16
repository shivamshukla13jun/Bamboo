'use client';
import React from 'react';
import { ArrowRight, ShieldAlert, X } from 'lucide-react';
import { ReferenceCheckResult } from '../../types';

interface ReferenceWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: ReferenceCheckResult | null;
}

export const ReferenceWarningModal: React.FC<ReferenceWarningModalProps> = ({
  isOpen,
  onClose,
  result
}) => {
  if (!isOpen || !result) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-neutral-900 text-neutral-100 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-accent-700/60 space-y-5">
        <div className="flex items-start justify-between border-b border-neutral-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-accent-950/70 text-accent-400 border border-accent-800/60 rounded-xl">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-neutral-50">Deletion Blocked - Active References Found</h3>
              <p className="text-xs text-neutral-400">Referential Integrity Protection Engine</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-200 p-1 rounded-lg hover:bg-neutral-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-accent-950/40 rounded-xl p-4 border border-accent-800/50 space-y-2">
          <p className="text-sm font-semibold text-accent-300">
            Cannot delete <span className="underline decoration-accent-500">{result.targetEntity.type}</span>: &quot;{result.targetEntity.name}&quot;
          </p>
          <p className="text-xs text-accent-200/80 leading-relaxed">
            This master item or product is currently linked to active records in the database. Deleting it directly would break product listings or order histories.
          </p>
        </div>

        {/* References list */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-neutral-400">
            Active Dependent References ({result.references.length})
          </label>
          <div className="max-h-40 overflow-y-auto space-y-2 pr-1">
            {result.references.map((ref, idx) => (
              <div key={idx} className="p-3 bg-neutral-950 rounded-lg border border-neutral-800 text-xs text-neutral-300 space-y-1">
                <div className="flex items-center justify-between font-medium">
                  <span className="bg-neutral-800 text-neutral-200 px-2 py-0.5 rounded-md font-mono text-[10px]">
                    {ref.entityType}
                  </span>
                  <span className="text-neutral-500 font-mono">ID: {ref.id}</span>
                </div>
                <p className="text-neutral-100 font-medium">{ref.name}</p>
                <p className="text-neutral-400 text-[11px]">{ref.detail}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Suggested Actions */}
        <div className="space-y-2 bg-neutral-950 text-neutral-100 rounded-xl p-4 border border-neutral-800 text-xs">
          <div className="flex items-center space-x-2 text-primary-400 font-bold">
            <ArrowRight className="w-4 h-4" />
            <span>Recommended Step-By-Step Actions to Delete:</span>
          </div>
          <ul className="space-y-1.5 list-disc list-inside text-neutral-300">
            {result.suggestedActions.map((action, idx) => (
              <li key={idx} className="leading-tight">{action}</li>
            ))}
          </ul>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-neutral-800 text-white rounded-xl hover:bg-neutral-700 border border-neutral-700 text-sm font-medium transition"
          >
            I Understand, Keep Item
          </button>
        </div>
      </div>
    </div>
  );
};
