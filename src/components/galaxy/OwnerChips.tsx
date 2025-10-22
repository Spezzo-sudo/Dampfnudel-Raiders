import React from 'react';

interface OwnerChipsProps {
  owners: string[];
}

/**
 * Displays up to three owners and an aggregated "+N" indicator for further parties.
 */
const OwnerChips: React.FC<OwnerChipsProps> = ({ owners }) => {
  if (owners.length === 0) {
    return <span className="rounded-full bg-slate-700 px-3 py-1 text-xs text-slate-200">Unentdeckt</span>;
  }
  const visible = owners.slice(0, 3);
  const extra = owners.length - visible.length;
  return (
    <div className="flex flex-wrap gap-2">
      {visible.map((owner) => (
        <span key={owner} className="rounded-full bg-amber-800/60 px-3 py-1 text-xs font-semibold text-amber-100">
          {owner}
        </span>
      ))}
      {extra > 0 && (
        <span className="rounded-full bg-slate-700 px-3 py-1 text-xs text-slate-200">+{extra}</span>
      )}
    </div>
  );
};

export default OwnerChips;
