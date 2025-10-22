import React from 'react';
import { BattleResult } from '@/lib/combat';

interface BattleReportProps {
  isOpen: boolean;
  report?: BattleResult;
  onClose: () => void;
}

/**
 * Zeigt das Ergebnis einer simulierten Schlacht inklusive Download-Funktion.
 */
const BattleReport: React.FC<BattleReportProps> = ({ isOpen, report, onClose }) => {
  const handleDownload = React.useCallback(() => {
    if (!report) {
      return;
    }
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `battle-report-${report.mvp?.typeId ?? 'unknown'}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }, [report]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" role="dialog" aria-modal="true">
      <div className="steampunk-glass steampunk-border max-h-[80vh] w-full max-w-3xl overflow-y-auto rounded-xl p-6">
        <header className="mb-4 flex items-center justify-between border-b border-amber-700/40 pb-3">
          <div>
            <h2 className="font-cinzel text-2xl text-amber-200">Gefechtsbericht</h2>
            <p className="text-sm text-slate-300">Auswertung der letzten simulierten Runde</p>
          </div>
          <button type="button" className="text-slate-300 hover:text-white" onClick={onClose}>
            Schließen
          </button>
        </header>

        {!report && <p className="text-slate-200">Keine Daten verfügbar.</p>}

        {report && (
          <div className="space-y-4 text-slate-100">
            <p>
              Sieger: <span className="font-semibold text-amber-200">{report.winner}</span>
            </p>
            {report.mvp && (
              <p>
                MVP: <span className="font-semibold text-amber-200">{report.mvp.side} · {report.mvp.typeId}</span>
              </p>
            )}
            <section>
              <h3 className="font-cinzel text-lg text-amber-200">Runden</h3>
              <ul className="mt-2 space-y-3 text-sm">
                {report.rounds.map((round) => (
                  <li key={round.index} className="rounded border border-amber-700/40 bg-black/30 p-3">
                    <p className="font-semibold">Runde {round.index}</p>
                    <ul className="mt-2 space-y-1">
                      {round.volleys.map((volley, volleyIndex) => (
                        <li key={`${round.index}-${volleyIndex}`}>
                          {volley.side} {volley.fromType} → {volley.toType} · Treffer: {volley.hits} · Schaden:{' '}
                          {volley.damage} · Verluste: {volley.destroyedUnits}
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            </section>
            <section className="grid gap-4 md:grid-cols-2">
              <div>
                <h3 className="font-cinzel text-lg text-amber-200">Verbleibende Schiffe</h3>
                <p className="text-sm">Angreifer:</p>
                <ul className="ml-4 list-disc text-sm">
                  {report.remaining.attacker.map((stack) => (
                    <li key={`att-${stack.typeId}`}>{stack.typeId}: {stack.count}</li>
                  ))}
                </ul>
                <p className="mt-2 text-sm">Verteidiger:</p>
                <ul className="ml-4 list-disc text-sm">
                  {report.remaining.defender.map((stack) => (
                    <li key={`def-${stack.typeId}`}>{stack.typeId}: {stack.count}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-cinzel text-lg text-amber-200">Bergung</h3>
                <p>Or: {report.salvage.Or}</p>
                <p>Kr: {report.salvage.Kr}</p>
                <button type="button" className="mt-3 steampunk-button rounded px-4 py-2 text-sm" onClick={handleDownload}>
                  JSON exportieren
                </button>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
};

export default BattleReport;
