import React from 'react';
import { BIOME_STYLES } from '@/constants';
import { Planet } from '@/types';

interface GalaxyActionModalProps {
  planet: Planet;
  onClose: () => void;
}

const GalaxyActionModal: React.FC<GalaxyActionModalProps> = ({ planet, onClose }) => {
  if (!planet) return null;

  const handleSpy = () => {
    console.log(`Spioniere Planet ${planet.name} auf ${planet.coordinates}`);
    onClose();
  };

  const handleAttack = () => {
    console.log(`Greife Planet ${planet.name} auf ${planet.coordinates} an`);
    onClose();
  };

  const biome = BIOME_STYLES[planet.biome];

  return (
    <div
        className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
        onClick={onClose} // Schließt das Modal bei Klick auf den Hintergrund
    >
      <div
        className="steampunk-glass steampunk-border p-6 rounded-lg w-full max-w-md mx-4"
        onClick={(e) => e.stopPropagation()} // Verhindert, dass Klicks im Modal das Modal schließen
      >
        <div className="flex justify-between items-center border-b border-yellow-800/50 pb-3 mb-4">
            <h3 className="text-2xl font-cinzel text-yellow-400">Aktionen für {planet.name}</h3>
            <button onClick={onClose} className="text-2xl text-gray-400 hover:text-white">&times;</button>
        </div>
        
        <p className="text-gray-400 mb-2">Koordinaten: {planet.coordinates} | Spieler: {planet.player}</p>
        <p className="text-gray-400 mb-6">Biom: {biome.label}</p>

        <div className="space-y-4">
            <button 
                onClick={handleSpy}
                className="w-full px-4 py-3 font-cinzel steampunk-button rounded-md flex items-center justify-center"
            >
                <span className="mr-3 text-xl">👁️</span>
                Spionieren
            </button>
            <button
                onClick={handleAttack}
                className="w-full px-4 py-3 font-cinzel steampunk-button rounded-md flex items-center justify-center"
            >
                <span className="mr-3 text-xl">💥</span>
                Angreifen
            </button>
        </div>
        <div className="mt-6 text-center">
             <button
                onClick={onClose}
                className="px-6 py-2 text-sm font-cinzel steampunk-button rounded-md bg-opacity-50"
            >
                Schließen
            </button>
        </div>
      </div>
    </div>
  );
};

export default GalaxyActionModal;
