import React, { useEffect, useMemo, useRef, useState } from 'react';
import { BIOME_STYLES, GALAXY_SNAPSHOT } from '@/constants';
import { Planet } from '@/types';
import GalaxyActionModal from '@/components/views/GalaxyActionModal';
import GalaxyHexMap from '@/components/views/GalaxyHexMap';

/**
 * Kombiniert Tabellen- und Kartenansicht der Galaxie mit Suche, Filtern und Zoom-Steuerung.
 */
const GalaxyView: React.FC = () => {
  const [modalPlanet, setModalPlanet] = useState<Planet | null>(null);
  const [focusedPlanet, setFocusedPlanet] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [resetSignal, setResetSignal] = useState(0);

  const sortedPlanets = useMemo(
    () => [...GALAXY_SNAPSHOT].sort((a, b) => a.coordinates.localeCompare(b.coordinates, 'de-DE')),
    [],
  );

  const filteredPlanets = useMemo(() => {
    const needle = searchTerm.trim().toLowerCase();
    if (!needle) {
      return sortedPlanets;
    }
    return sortedPlanets.filter((planet) => {
      const haystack = `${planet.coordinates} ${planet.name} ${planet.player}`.toLowerCase();
      return haystack.includes(needle);
    });
  }, [searchTerm, sortedPlanets]);

  const rowRefs = useRef<Record<string, HTMLTableRowElement | null>>({});

  useEffect(() => {
    if (!focusedPlanet) {
      return;
    }
    const row = rowRefs.current[focusedPlanet];
    row?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }, [focusedPlanet]);

  const handleActionClick = (planet: Planet) => {
    if (!planet.isOwnPlanet) {
      setModalPlanet(planet);
      setFocusedPlanet(planet.coordinates);
    }
  };

  const handleSelectOnMap = (planet: Planet) => {
    setFocusedPlanet(planet.coordinates);
    if (!planet.isOwnPlanet) {
      setModalPlanet(planet);
    } else {
      setModalPlanet(null);
    }
  };

  const handleCloseModal = () => {
    setModalPlanet(null);
  };

  const handleResetView = () => {
    setZoomLevel(1);
    setResetSignal((value) => value + 1);
  };

  return (
    <section className="space-y-8 pb-20">
      <header className="space-y-2">
        <h2 className="text-[clamp(1.8rem,1.2vw+1.5rem,2.4rem)] font-cinzel text-yellow-300">Galaxie</h2>
        <p className="text-sm text-gray-300">
          Suche nach Koordinaten, Spielern oder Planeten und synchronisiere Karte und Tabelle.
        </p>
      </header>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="steampunk-glass steampunk-border rounded-lg">
          <div className="flex flex-col gap-3 border-b border-yellow-800/30 p-4 sm:flex-row sm:items-center sm:justify-between">
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Koordinaten, Planet oder Spieler"
              className="w-full rounded-md border border-yellow-800/40 bg-black/50 px-3 py-2 text-sm text-gray-100 placeholder:text-gray-500 focus:border-yellow-400 focus:outline-none focus:ring-1 focus:ring-yellow-400 sm:max-w-sm"
            />
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span className="hidden sm:inline">Gefiltert:</span>
              <span className="rounded-full bg-black/40 px-3 py-1 text-yellow-200">
                {filteredPlanets.length} / {sortedPlanets.length}
              </span>
            </div>
          </div>
          <div className="max-h-[480px] overflow-y-auto">
            <table className="w-full text-left">
              <thead className="sticky top-0 z-10 bg-black/80">
                <tr>
                  <th className="p-4 font-cinzel text-yellow-400">Koordinaten</th>
                  <th className="p-4 font-cinzel text-yellow-400">Planetenname</th>
                  <th className="p-4 font-cinzel text-yellow-400">Spieler</th>
                  <th className="p-4 font-cinzel text-yellow-400">Biome</th>
                  <th className="p-4 font-cinzel text-yellow-400 text-center">Aktionen</th>
                </tr>
              </thead>
              <tbody>
                {filteredPlanets.map((planet) => {
                  const biome = BIOME_STYLES[planet.biome];
                  const isHighlighted =
                    focusedPlanet === planet.coordinates || modalPlanet?.coordinates === planet.coordinates;

                  return (
                    <tr
                      key={planet.coordinates}
                      ref={(node) => {
                        rowRefs.current[planet.coordinates] = node;
                      }}
                      className={`border-t border-yellow-800/30 transition-colors ${
                        isHighlighted ? 'bg-yellow-800/20' : 'hover:bg-yellow-800/10'
                      }`}
                      onMouseEnter={() => setFocusedPlanet(planet.coordinates)}
                      onMouseLeave={() => setFocusedPlanet(null)}
                    >
                      <td className="p-4">{planet.coordinates}</td>
                      <td className="p-4">{planet.name}</td>
                      <td className={`p-4 ${planet.isOwnPlanet ? 'text-green-400 font-semibold' : ''}`}>{planet.player}</td>
                      <td className="p-4">
                        <span className="inline-flex items-center gap-2">
                          <span
                            className="inline-block h-3 w-3 rounded-full"
                            style={{ backgroundColor: biome.fill }}
                            aria-hidden
                          />
                          {biome.label}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleActionClick(planet)}
                          disabled={planet.isOwnPlanet}
                          className="rounded-md px-4 py-2 text-sm font-cinzel steampunk-button disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Aktionen
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border border-yellow-800/30 bg-black/40 px-4 py-3 text-sm text-gray-200">
            <span>Zoom-Level: {zoomLevel.toFixed(1)}x</span>
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
                onClick={handleResetView}
                className="rounded-md bg-yellow-600/80 px-3 py-1 text-sm font-semibold text-black"
              >
                Reset
              </button>
            </div>
          </div>
          <GalaxyHexMap
            planets={filteredPlanets}
            selectedPlanet={focusedPlanet}
            onSelect={handleSelectOnMap}
            onHover={(planet) => setFocusedPlanet(planet?.coordinates ?? null)}
            zoom={zoomLevel}
            onZoomChange={setZoomLevel}
            resetSignal={resetSignal}
          />
          <div className="steampunk-glass steampunk-border rounded-lg p-4">
            <h3 className="text-xl font-cinzel text-yellow-400 mb-3">Biom-Legende</h3>
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

      {modalPlanet && <GalaxyActionModal planet={modalPlanet} onClose={handleCloseModal} />}
    </section>
  );
};

export default GalaxyView;
