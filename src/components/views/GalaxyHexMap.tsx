import React from 'react';
import { BIOME_STYLES } from '@/constants';
import { SystemSnapshot } from '@/types';
import { axialToPixel } from '@/lib/hex';

interface GalaxyHexMapProps {
  systems: SystemSnapshot[];
  selectedSystemId?: string | null;
  highlightedSystemId?: string | null;
  onSelect: (system: SystemSnapshot) => void;
  onHover?: (system: SystemSnapshot | null) => void;
  zoom?: number;
  onZoomChange?: (zoom: number) => void;
  resetSignal?: number;
}

const HEX_SIZE = 46;

const hexPath = (size: number) => {
  const points: string[] = [];
  for (let i = 0; i < 6; i += 1) {
    const angle = ((Math.PI / 180) * 60 * i) - Math.PI / 6;
    const px = size * Math.cos(angle);
    const py = size * Math.sin(angle);
    points.push(`${px},${py}`);
  }
  return points.join(' ');
};

/**
 * Interaktive Hex-Map die Systeme darstellt und Hover/Keyboard-Interaktion unterstützt.
 */
const GalaxyHexMap: React.FC<GalaxyHexMapProps> = ({
  systems,
  selectedSystemId,
  highlightedSystemId,
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
    (event: React.WheelEvent<SVGSVGElement>) => {
      event.preventDefault();
      const delta = event.deltaY < 0 ? 0.1 : -0.1;
      setZoomValue(currentZoom + delta);
    },
    [currentZoom, setZoomValue],
  );

  const handleMouseDown = React.useCallback((event: React.MouseEvent<SVGSVGElement>) => {
    dragStart.current = { x: event.clientX, y: event.clientY };
  }, []);

  const handleMouseMove = React.useCallback((event: React.MouseEvent<SVGSVGElement>) => {
    if (!dragStart.current) {
      return;
    }
    const dx = event.clientX - dragStart.current.x;
    const dy = event.clientY - dragStart.current.y;
    dragStart.current = { x: event.clientX, y: event.clientY };
    setOffset((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
  }, []);

  const handleMouseUp = React.useCallback(() => {
    dragStart.current = null;
  }, []);

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<SVGSVGElement>) => {
      if (event.key === '+' || event.key === '=') {
        setZoomValue(currentZoom + 0.1);
      }
      if (event.key === '-') {
        setZoomValue(currentZoom - 0.1);
      }
      if (event.key === 'ArrowUp') {
        setOffset((prev) => ({ x: prev.x, y: prev.y + 30 }));
      }
      if (event.key === 'ArrowDown') {
        setOffset((prev) => ({ x: prev.x, y: prev.y - 30 }));
      }
      if (event.key === 'ArrowLeft') {
        setOffset((prev) => ({ x: prev.x + 30, y: prev.y }));
      }
      if (event.key === 'ArrowRight') {
        setOffset((prev) => ({ x: prev.x - 30, y: prev.y }));
      }
    },
    [currentZoom, setZoomValue],
  );

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

  const positioned = React.useMemo(() => {
    return systems.map((system) => {
      const { x, y } = axialToPixel({ q: system.sectorQ, r: system.sectorR });
      return { system, x, y };
    });
  }, [systems]);

  const minX = Math.min(...positioned.map((entry) => entry.x));
  const maxX = Math.max(...positioned.map((entry) => entry.x));
  const minY = Math.min(...positioned.map((entry) => entry.y));
  const maxY = Math.max(...positioned.map((entry) => entry.y));
  const padding = HEX_SIZE * 2.4;
  const width = maxX - minX + padding * 2;
  const height = maxY - minY + padding * 2;

  return (
    <div className="steampunk-glass steampunk-border rounded-lg p-4">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-[420px] w-full"
        role="presentation"
        tabIndex={0}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onKeyDown={handleKeyDown}
        aria-label="Galaxiekarte"
      >
        <defs>
          <radialGradient id="hex-glow" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.25)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0)" />
          </radialGradient>
        </defs>

        <g transform={`translate(${offset.x}, ${offset.y}) scale(${currentZoom})`}>
          {positioned.map(({ system, x, y }) => {
            const biomeStyle = BIOME_STYLES[system.biome];
            const translatedX = x - minX + padding;
            const translatedY = y - minY + padding;
            const isSelected = system.id === selectedSystemId;
            const isHighlighted = system.id === highlightedSystemId;
            const owners = system.planets
              .map((planet) => (planet.isOwn ? 'Du' : planet.owner))
              .filter(Boolean) as string[];
            const primaryOwner = owners[0];
            return (
              <g
                key={system.id}
                transform={`translate(${translatedX}, ${translatedY})`}
                onClick={() => onSelect(system)}
                onMouseEnter={() => onHover?.(system)}
                onMouseLeave={() => onHover?.(null)}
                className="cursor-pointer focus:outline-none"
                tabIndex={0}
              >
                <polygon
                  points={hexPath(HEX_SIZE)}
                  fill={biomeStyle.fill}
                  stroke={isSelected || isHighlighted ? biomeStyle.stroke : 'rgba(0,0,0,0.45)'}
                  strokeWidth={isSelected || isHighlighted ? 4 : 2}
                  opacity={primaryOwner === 'Du' ? 1 : 0.9}
                />
                <polygon points={hexPath(HEX_SIZE)} fill="url(#hex-glow)" opacity={isSelected ? 0.65 : 0.35} />
                <text x={0} y={4} textAnchor="middle" className="font-cinzel fill-yellow-200 text-xs">
                  {system.id}
                </text>
                {primaryOwner && (
                  <text x={0} y={28} textAnchor="middle" className="fill-emerald-200 text-[10px]">
                    {primaryOwner}
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
