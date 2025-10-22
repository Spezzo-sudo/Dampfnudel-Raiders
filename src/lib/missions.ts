import { SystemSnapshot } from '@/types';
import { axialDistance } from '@/lib/hex';

/**
 * Calculates the travel time between two systems based on axial hex distance and ship speed.
 */
export function travelTime(
  fromSystem: SystemSnapshot,
  toSystem: SystemSnapshot,
  speed: number,
  serverSpeed: number,
): number {
  const from = { q: fromSystem.sectorQ, r: fromSystem.sectorR };
  const to = { q: toSystem.sectorQ, r: toSystem.sectorR };
  const distance = axialDistance(from, to) + Math.abs(fromSystem.sysIndex - toSystem.sysIndex) * 0.25;
  const normalizedSpeed = Math.max(speed, 1);
  const travelHours = (distance / normalizedSpeed) * serverSpeed;
  return Math.max(60_000, Math.round(travelHours * 60 * 60 * 1000));
}

/**
 * Returns the arrival timestamp for a mission leaving now.
 */
export function etaFromNow(durationMs: number): number {
  return Date.now() + durationMs;
}
