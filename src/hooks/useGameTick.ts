import { useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';
import { TICK_INTERVAL } from '@/constants';

/**
 * React hook that registers the core game tick interval.
 * It advances the simulation at the configured tick rate while the component tree is mounted.
 */
export const useGameTick = () => {
  const gameTick = useGameStore((state) => state.gameTick);

  useEffect(() => {
    const intervalId = setInterval(() => {
      gameTick();
    }, TICK_INTERVAL);

    return () => clearInterval(intervalId);
  }, [gameTick]);
};
