import React, { useMemo, useState } from 'react';
import { BIOME_STYLES, SYSTEM_SNAPSHOT } from '@/constants';
import { MissionType, SystemSnapshot } from '@/types';
import GalaxyHexMap from '@/components/views/GalaxyHexMap';
import SystemModal from '@/components/galaxy/SystemModal';
import OwnerChips from '@/components/galaxy/OwnerChips';
import { VirtualList } from '@/lib/virtualization';
import { useGameStore } from '@/store/gameStore';

const ROW_HEIGHT = 72;

/**
 * Skalierbare Galaxie-Ansicht mit virtueller Tabelle und synchronisierter Hex-Karte.
 */
const GalaxyView: React.FC = () => {
  const queueMission = useGameStore((state) => state.queueMission);
  const systems = SYSTEM_SNAPSHOT;
  const [searchTerm, setSearchTerm] = useState('');
  const [onlyOwn, setOnlyOwn] = useState(false);
  const [selectedBiome, setSelectedBiome] = useState<string>('');
  const [selectedSystemId, setSelectedSystemId] = useState<string | null>(null);
  const [highlightedSystemId, setHighlightedSystemId] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [resetSignal, setResetSignal] = useState(0);
  const [modalSystem, setModalSystem] = useState<SystemSnapshot | null>(null);

  const filteredSystems = useMemo(() => {
    const needle = searchTerm.trim().toLowerCase();
    return systems.filter((system) => {
      if (onlyOwn && !system.planets.some((planet) => planet.isOwn)) {
        return false;
      }
      if (selectedBiome && system.biome !== selectedBiome) {
        return false;
      }
      if (!needle) {
        return true;
      }
      const ownerNames = system.planets
        .map((planet) => (planet.isOwn ? 'Du' : planet.owner ?? ''))
        .join(' ')
        .toLowerCase();
      const haystack = `${system.id} ${system.sectorQ}:${system.sectorR} ${ownerNames}`.toLowerCase();
      return haystack.includes(needle);
    });
  }, [onlyOwn, searchTerm, selectedBiome, systems]);

  const scrollToIndex = useMemo(() => {
    if (!selectedSystemId) {
      return null;
    }
    const index = filteredSystems.findIndex((system) => system.id === selectedSystemId);
    return index >= 0 ? index : null;
  }, [filteredSystems, selectedSystemId]);

  const handleSelectSystem = (system: SystemSnapshot) => {
    setSelectedSystemId(system.id);
    setModalSystem(system);
  };

  const handlePlanMission = (type: MissionType, system: SystemSnapshot) => {
    queueMission({
      type,
      fleetId: 'fleet-1',
      fromSystem: systems[0],
      toSystem: system,
    });
    setModalSystem(null);
  };

  const handleFocusPlanet = () => {
    if (!modalSystem) {
      return;
    }
    setSelectedSystemId(modalSystem.id);
    setHighlightedSystemId(modalSystem.id);
  };

  const handleReset = () => {
    setZoomLevel(1);
    setResetSignal((value) => value + 1);
  };

  return (
    <section className="space-y-8 pb-20">
      <header className="space-y-2">
        <h2 className="text-[clamp(1.8rem,1.2vw+1.5rem,2.4rem)] font-cinzel text-yellow-300">Galaxie</h2>
        <p className="text-sm text-gray-300">
          Suche Systeme, filtere nach Besitzern oder Biomen und synchronisiere Tabelle sowie Hex-Karte.
        </p>
      </header>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <div className="steampunk-glass steampunk-border rounded-lg">
          <div className="flex flex-wrap items-center gap-3 border-b border-yellow-800/30 p-4">
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="System, Spieler oder Koordinaten"
              className="w-full rounded-md border border-yellow-800/40 bg-black/50 px-3 py-2 text-sm text-gray-100 placeholder:text-gray-500 focus:border-yellow-400 focus:outline-none focus:ring-1 focus:ring-yellow-400 sm:max-w-xs"
            />
            <label className="flex items-center gap-2 text-xs text-gray-300">
              <input
                type="checkbox"
                checked={onlyOwn}
                onChange={(event) => setOnlyOwn(event.target.checked)}
                className="h-3 w-3 rounded border-yellow-700 bg-black"
              />
              Nur eigene Systeme
            </label>
            <select
              value={selectedBiome}
              onChange={(event) => setSelectedBiome(event.target.value)}
              className="rounded-md border border-yellow-800/40 bg-black/50 px-3 py-2 text-sm text-gray-100"
            >
              <option value="">Alle Biome</option>
              {Object.entries(BIOME_STYLES).map(([key, biome]) => (
                <option key={key} value={key}>
                  {biome.label}
                </option>
              ))}
            </select>
            <span className="ml-auto rounded-full bg-black/40 px-3 py-1 text-xs text-yellow-200">
              {filteredSystems.length} / {systems.length}
            </span>
          </div>
          <VirtualList
            rowCount={filteredSystems.length}
            rowHeight={ROW_HEIGHT}
            height={480}
            className="relative"
            scrollToIndex={scrollToIndex}
            renderRow={(index) => {
              const system = filteredSystems[index];
              const biome = BIOME_STYLES[system.biome];
              const owners = system.planets
                .map((planet) => (planet.isOwn ? 'Du' : planet.owner))
                .filter(Boolean) as string[];
              const isHighlighted =
                system.id === selectedSystemId || system.id === highlightedSystemId || system.id === modalSystem?.id;
              return (
                <div
                  key={system.id}
                  className={`flex h-full cursor-pointer items-center justify-between border-b border-yellow-800/30 px-4 transition-colors ${
                    isHighlighted ? 'bg-yellow-800/20' : 'hover:bg-yellow-800/10'
                  }`}
                  onMouseEnter={() => setHighlightedSystemId(system.id)}
                  onMouseLeave={() => setHighlightedSystemId(null)}
                  onClick={() => handleSelectSystem(system)}
                >
                  <div>
                    <p className="font-cinzel text-sm text-yellow-200">{system.id}</p>
                    <p className="text-xs text-gray-300">Sektor {system.sectorQ}:{system.sectorR}</p>
                    <OwnerChips owners={owners} />
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-200">
                    <span className="inline-flex items-center gap-2">
                      <span
                        className="inline-block h-3 w-3 rounded-full"
                        style={{ backgroundColor: biome.fill }}
                        aria-hidden
                      />
                      {biome.label}
                    </span>
                    <button type="button" className="steampunk-button rounded px-3 py-1 text-xs">
                      Details
                    </button>
                  </div>
                </div>
              );
            }}
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border border-yellow-800/30 bg-black/40 px-4 py-3 text-sm text-gray-200">
            <span>Zoom: {zoomLevel.toFixed(1)}x</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setZoomLevel((value) => Math.max(0.5, parseFloat((value - 0.2).toFixed(1))))}
                className="rounded-md bg-black/50 px-3 py-1 text-sm hover:bg-yellow-800/30"
              >
                −
              </button>
              <button
                type="button"
                onClick={() => setZoomLevel((value) => Math.min(3, parseFloat((value + 0.2).toFixed(1))))}
                className="rounded-md bg-black/50 px-3 py-1 text-sm hover:bg-yellow-800/30"
              >
                +
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="rounded-md bg-yellow-600/80 px-3 py-1 text-sm font-semibold text-black"
              >
                Reset
              </button>
            </div>
          </div>
          <GalaxyHexMap
            systems={filteredSystems}
            selectedSystemId={selectedSystemId}
            highlightedSystemId={highlightedSystemId}
            onSelect={(system) => {
              setSelectedSystemId(system.id);
              setModalSystem(system);
            }}
            onHover={(system) => setHighlightedSystemId(system?.id ?? null)}
            zoom={zoomLevel}
            onZoomChange={setZoomLevel}
            resetSignal={resetSignal}
          />
          <div className="steampunk-glass steampunk-border rounded-lg p-4">
            <h3 className="mb-3 font-cinzel text-xl text-yellow-400">Biom-Legende</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {Object.entries(BIOME_STYLES).map(([key, biome]) => (
                <div key={key} className="flex items-center gap-3">
                  <span
                    className="h-4 w-4 rounded-full border border-yellow-200/50"
                    style={{ backgroundColor: biome.fill, boxShadow: `0 0 6px ${biome.stroke}` }}
                    aria-hidden
                  />
                  <span className="text-sm text-gray-200">{biome.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <SystemModal
        system={modalSystem}
        onClose={() => setModalSystem(null)}
        onPlanMission={handlePlanMission}
        onFocusPlanet={handleFocusPlanet}
      />
    </section>
  );
};

export default GalaxyView;
