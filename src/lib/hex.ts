import { AxialCoordinates } from '@/types';

export interface HexBBox {
  minQ: number;
  maxQ: number;
  minR: number;
  maxR: number;
}

export interface PixelPosition {
  x: number;
  y: number;
}

const HEX_WIDTH = 90;
const HEX_HEIGHT = 78;

/**
 * Calculates the axial distance between two hex coordinates using cube coordinates.
 */
export function axialDistance(a: AxialCoordinates, b: AxialCoordinates): number {
  const dx = a.q - b.q;
  const dy = a.r - b.r;
  const dz = -a.q - a.r + b.q + b.r;
  return Math.max(Math.abs(dx), Math.abs(dy), Math.abs(dz));
}

/**
 * Converts axial coordinates to pixel coordinates on a pointy-top hex grid.
 */
export function axialToPixel(coord: AxialCoordinates, scale = 1): PixelPosition {
  const x = HEX_WIDTH * scale * (coord.q + coord.r / 2);
  const y = HEX_HEIGHT * scale * (coord.r * 0.75);
  return { x, y };
}

/**
 * Converts pixel coordinates back to axial coordinates.
 */
export function pixelToAxial(position: PixelPosition, scale = 1): AxialCoordinates {
  const q = (position.x / (HEX_WIDTH * scale)) - (position.y / (HEX_HEIGHT * scale * 1.5));
  const r = (position.y / (HEX_HEIGHT * scale * 0.75));
  const rq = Math.round(q);
  const rr = Math.round(r);
  return { q: rq, r: rr };
}

/**
 * Computes the currently visible bounding box for the galaxy map.
 */
export function visibleBBox(
  center: AxialCoordinates,
  viewport: { width: number; height: number },
  zoom: number,
): HexBBox {
  const hexWidth = HEX_WIDTH * zoom;
  const hexHeight = HEX_HEIGHT * zoom;
  const halfCols = Math.ceil(viewport.width / hexWidth / 2);
  const halfRows = Math.ceil(viewport.height / hexHeight / 2);
  return {
    minQ: center.q - halfCols,
    maxQ: center.q + halfCols,
    minR: center.r - halfRows,
    maxR: center.r + halfRows,
  };
}
