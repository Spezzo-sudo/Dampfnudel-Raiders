import React from 'react';
import OwnerChips from '@/components/galaxy/OwnerChips';
import { MissionType, SystemSnapshot } from '@/types';

interface SystemModalProps {
  system: SystemSnapshot | null;
  onClose: () => void;
  onPlanMission: (type: MissionType, system: SystemSnapshot) => void;
  onFocusPlanet?: (planetId: string) => void;
}

/**
 * Modal zur Anzeige von Systemdetails inklusive Planeten und Missionsaktionen.
 */
const SystemModal: React.FC<SystemModalProps> = ({ system, onClose, onPlanMission, onFocusPlanet }) => {
  if (!system) {
    return null;
  }
  const owners = system.planets
    .map((planet) => (planet.isOwn ? 'Du' : planet.owner))
    .filter(Boolean) as string[];
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="system-modal-title"
      onClick={onClose}
    >
      <div
        className="steampunk-glass steampunk-border max-h-[80vh] w-full max-w-2xl overflow-y-auto rounded-xl p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="mb-4 flex items-center justify-between border-b border-amber-700/40 pb-3">
          <div>
            <h2 id="system-modal-title" className="font-cinzel text-2xl text-amber-200">
              System {system.id}
            </h2>
            <p className="text-sm text-slate-300">Sektor {system.sectorQ}:{system.sectorR}</p>
          </div>
          <button type="button" className="text-slate-300 hover:text-white" onClick={onClose}>
            Schließen
          </button>
        </header>

        <section className="mb-6">
          <h3 className="font-cinzel text-lg text-amber-200">Besitzer</h3>
          <OwnerChips owners={owners} />
        </section>

        <section>
          <h3 className="font-cinzel text-lg text-amber-200">Planeten</h3>
          <ul className="mt-3 space-y-3">
            {system.planets.map((planet) => (
              <li key={planet.id} className="rounded-lg border border-amber-700/40 bg-black/40 p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-cinzel text-sm text-amber-100">
                      Slot {planet.slot}: {planet.name}
                    </p>
                    <p className="text-xs text-slate-300">
                      {planet.isOwn ? 'Eigener Planet' : planet.owner ?? 'Unbeansprucht'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="steampunk-button rounded px-3 py-1 text-xs"
                      onClick={() => onFocusPlanet?.(planet.id)}
                    >
                      Zu Planet springen
                    </button>
                    <button
                      type="button"
                      className="steampunk-button rounded px-3 py-1 text-xs"
                      onClick={() => onPlanMission('attack', system)}
                    >
                      Mission planen
                    </button>
                    {!planet.owner && (
                      <button
                        type="button"
                        className="steampunk-button rounded px-3 py-1 text-xs"
                        onClick={() => onPlanMission('colonize', system)}
                      >
                        Kolonisieren planen
                      </button>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
};

export default SystemModal;
