import React from 'react';
import { BIOME_STYLES } from '@/constants';
import { Planet } from '@/types';

interface GalaxyHexMapProps {
  planets: Planet[];
  selectedPlanet?: string | null;
  onSelect: (planet: Planet) => void;
  onHover?: (planet: Planet | null) => void;
  zoom?: number;
  onZoomChange?: (zoom: number) => void;
  resetSignal?: number;
}

const HEX_SIZE = 46;

const axialToPixel = (q: number, r: number) => {
  const x = HEX_SIZE * (Math.sqrt(3) * q + (Math.sqrt(3) / 2) * r);
  const y = HEX_SIZE * ((3 / 2) * r);
  return { x, y };
};

const hexPath = (x: number, y: number) => {
  const points: string[] = [];
  for (let i = 0; i < 6; i += 1) {
    const angle = ((Math.PI / 180) * 60 * i) - Math.PI / 6;
    const px = x + HEX_SIZE * Math.cos(angle);
    const py = y + HEX_SIZE * Math.sin(angle);
    points.push(`${px},${py}`);
  }
  return points.join(' ');
};

/**
 * Interaktive Hex-Map mit optional extern gesteuerter Zoomstufe und Reset-Signal.
 */
const GalaxyHexMap: React.FC<GalaxyHexMapProps> = ({
  planets,
  selectedPlanet,
  onSelect,
  onHover,
  zoom,
  onZoomChange,
  resetSignal,
}) => {
  const [internalZoom, setInternalZoom] = React.useState(1);
  const currentZoom = typeof zoom === 'number' ? zoom : internalZoom;
  const [offset, setOffset] = React.useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const dragStart = React.useRef<{ x: number; y: number } | null>(null);

  const setZoomValue = React.useCallback(
    (value: number) => {
      const bounded = Math.min(Math.max(value, 0.5), 3);
      if (typeof onZoomChange === 'function') {
        onZoomChange(bounded);
      } else {
        setInternalZoom(bounded);
      }
    },
    [onZoomChange],
  );

  const handleWheel = React.useCallback(
    (e: React.WheelEvent<SVGSVGElement>) => {
      e.preventDefault();
      const delta = e.deltaY < 0 ? 0.1 : -0.1;
      setZoomValue(currentZoom + delta);
    },
    [currentZoom, setZoomValue],
  );

  const handleMouseDown = React.useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    dragStart.current = { x: e.clientX, y: e.clientY };
  }, []);

  const handleMouseMove = React.useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (!dragStart.current) {
        return;
      }
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      dragStart.current = { x: e.clientX, y: e.clientY };
      setOffset((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
    },
    [],
  );

  const handleMouseUp = React.useCallback(() => {
    dragStart.current = null;
  }, []);

  React.useEffect(() => {
    if (typeof zoom === 'number') {
      setInternalZoom(zoom);
    }
  }, [zoom]);

  React.useEffect(() => {
    if (resetSignal !== undefined) {
      setOffset({ x: 0, y: 0 });
      if (typeof zoom !== 'number') {
        setInternalZoom(1);
      }
    }
  }, [resetSignal, zoom]);

  const positioned = planets.map((planet) => {
    const { x, y } = axialToPixel(planet.axial.q, planet.axial.r);
    return { planet, x, y };
  });

  const minX = Math.min(...positioned.map((entry) => entry.x));
  const maxX = Math.max(...positioned.map((entry) => entry.x));
  const minY = Math.min(...positioned.map((entry) => entry.y));
  const maxY = Math.max(...positioned.map((entry) => entry.y));
  const padding = HEX_SIZE * 1.8;
  const width = maxX - minX + padding * 2;
  const height = maxY - minY + padding * 2;

  return (
    <div className="steampunk-glass steampunk-border rounded-lg p-4">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-[420px] w-full"
        role="presentation"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <defs>
          <radialGradient id="hex-glow" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.25)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0)" />
          </radialGradient>
        </defs>

        <g transform={`translate(${offset.x}, ${offset.y}) scale(${currentZoom})`}>
          {positioned.map(({ planet, x, y }) => {
            const biomeStyle = BIOME_STYLES[planet.biome];
            const translatedX = x - minX + padding;
            const translatedY = y - minY + padding;
            const isSelected = selectedPlanet === planet.coordinates;
            return (
              <g
                key={planet.coordinates}
                transform={`translate(${translatedX}, ${translatedY})`}
                onClick={() => onSelect(planet)}
                onMouseEnter={() => onHover?.(planet)}
                onMouseLeave={() => onHover?.(null)}
                className="cursor-pointer focus:outline-none"
                tabIndex={0}
              >
                <polygon
                  points={hexPath(0, 0)}
                  fill={biomeStyle.fill}
                  stroke={isSelected || planet.isOwnPlanet ? biomeStyle.stroke : 'rgba(0,0,0,0.45)'}
                  strokeWidth={isSelected || planet.isOwnPlanet ? 4 : 2}
                  opacity={planet.isOwnPlanet ? 1 : 0.9}
                />
                <polygon points={hexPath(0, 0)} fill="url(#hex-glow)" opacity={isSelected ? 0.65 : 0.35} />
                <text
                  x={0}
                  y={4}
                  textAnchor="middle"
                  className="font-cinzel fill-yellow-200 text-sm"
                >
                  {planet.name}
                </text>
                <text
                  x={0}
                  y={28}
                  textAnchor="middle"
                  className="fill-yellow-100 text-xs"
                >
                  {planet.coordinates}
                </text>
                {planet.isOwnPlanet && (
                  <text
                    x={0}
                    y={-26}
                    textAnchor="middle"
                    className="fill-emerald-200 text-xs"
                  >
                    Eigenes Territorium
                  </text>
                )}
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
};

export default GalaxyHexMap;
