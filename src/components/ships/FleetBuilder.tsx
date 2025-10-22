import React from 'react';
import { SHIP_BLUEPRINTS } from '@/constants';
import { Fleet } from '@/types';
import { simulateBattle, BattleResult } from '@/lib/combat';
import BattleReport from '@/components/combat/BattleReport';
import { useGameStore } from '@/store/gameStore';

const MAX_HANGAR = 30;
const MAX_CREW = 800;
const MAX_CARGO = 12000;

/**
 * Ermöglicht das Zusammenstellen einer Flotte mit Validierung und Gefechtsvorschau.
 */
const FleetBuilder: React.FC = () => {
  const tech = useGameStore((state) => state.fleets[0]?.tech);
  const [counts, setCounts] = React.useState<Record<string, number>>({});
  const [reportOpen, setReportOpen] = React.useState(false);
  const [report, setReport] = React.useState<BattleResult | undefined>();

  const stacks = React.useMemo(
    () =>
      SHIP_BLUEPRINTS.map((blueprint) => ({
        blueprint,
        count: counts[blueprint.id] ?? 0,
      })),
    [counts],
  );

  const totals = React.useMemo(() => {
    return stacks.reduce(
      (acc, entry) => {
        acc.hangar += entry.blueprint.hangarSlots * entry.count;
        acc.crew += entry.blueprint.crew * entry.count;
        acc.cargo += entry.blueprint.cargo * entry.count;
        return acc;
      },
      { hangar: 0, crew: 0, cargo: 0 },
    );
  }, [stacks]);

  const hasShips = stacks.some((stack) => stack.count > 0);
  const invalid = totals.hangar > MAX_HANGAR || totals.crew > MAX_CREW || totals.cargo > MAX_CARGO;

  const handleChange = React.useCallback((id: string, value: number) => {
    setCounts((prev) => ({ ...prev, [id]: Math.max(0, value) }));
  }, []);

  const handlePreview = React.useCallback(() => {
    if (!tech) {
      return;
    }
    const attacker: Fleet = {
      id: 'preview-attacker',
      ownerId: 'player',
      stacks: stacks.filter((stack) => stack.count > 0).map((stack) => ({ typeId: stack.blueprint.id, count: stack.count })),
      cargo: { Or: 0, Kr: 0, Vi: 0 },
      tech,
    };
    const defender = useGameStore.getState().fleets[0];
    const result = simulateBattle({
      attacker,
      defender: defender ?? attacker,
      context: { seed: `preview-${Date.now()}`, roundLimit: 6 },
    });
    setReport(result);
    setReportOpen(true);
  }, [stacks, tech]);

  return (
    <section className="space-y-4">
      <header>
        <h2 className="font-cinzel text-xl text-amber-200">Flottenplaner</h2>
        <p className="text-sm text-slate-300">Stelle neue Geschwader zusammen und prüfe die Gefechtsvorschau.</p>
      </header>
      <table className="w-full table-fixed border-separate border-spacing-y-2 text-sm">
        <thead className="text-left text-xs uppercase text-amber-200">
          <tr>
            <th className="px-3">Schiff</th>
            <th className="px-3">Rolle</th>
            <th className="px-3">Hangar</th>
            <th className="px-3">Crew</th>
            <th className="px-3">Laderaum</th>
            <th className="px-3">Anzahl</th>
          </tr>
        </thead>
        <tbody>
          {stacks.map(({ blueprint, count }) => (
            <tr key={blueprint.id} className="rounded bg-black/40">
              <td className="px-3 py-2 font-cinzel text-amber-100">{blueprint.name}</td>
              <td className="px-3 py-2 text-slate-300">{blueprint.role}</td>
              <td className="px-3 py-2 text-slate-300">{blueprint.hangarSlots}</td>
              <td className="px-3 py-2 text-slate-300">{blueprint.crew}</td>
              <td className="px-3 py-2 text-slate-300">{blueprint.cargo}</td>
              <td className="px-3 py-2">
                <input
                  type="number"
                  min={0}
                  value={count}
                  onChange={(event) => handleChange(blueprint.id, Number(event.target.value))}
                  className="w-20 rounded border border-amber-700/40 bg-black/60 px-2 py-1 text-slate-200"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <footer className="space-y-2 text-sm text-slate-200">
        <p>Hangar: {totals.hangar} / {MAX_HANGAR}</p>
        <p>Crew: {totals.crew} / {MAX_CREW}</p>
        <p>Laderaum: {totals.cargo} / {MAX_CARGO}</p>
        {invalid && <p className="text-red-300">Grenzwerte überschritten – Anpassung nötig.</p>}
        <button
          type="button"
          className="steampunk-button rounded px-4 py-2 text-sm"
          disabled={!hasShips || invalid}
          onClick={handlePreview}
        >
          Kampfvorschau
        </button>
      </footer>

      <BattleReport isOpen={reportOpen} report={report} onClose={() => setReportOpen(false)} />
    </section>
  );
};

export default FleetBuilder;
