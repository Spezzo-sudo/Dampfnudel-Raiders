import { simulateBattle } from '@/lib/combat';
import { Fleet, TechBonuses } from '@/types';

const BASE_TECH: TechBonuses = {
  panzerung: 0,
  lichtbogen: 0,
  tesla: 0,
  aether: 0,
  evasion: 0,
  accuracy: 0,
  initiative: 0,
};

function createFleet(overrides: Partial<Fleet>): Fleet {
  const { tech, ...rest } = overrides;
  return {
    id: 'test-fleet',
    ownerId: 'player',
    stacks: [{ typeId: 'sturmfregatte', count: 3 }],
    cargo: { Or: 0, Kr: 0, Vi: 0 },
    tech: { ...BASE_TECH, ...(tech ?? {}) },
    ...rest,
  };
}

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}

if (process.env.NODE_ENV === 'test') {
  const mirrorBattle = simulateBattle({
    attacker: createFleet({ id: 'mirrorA' }),
    defender: createFleet({ id: 'mirrorD' }),
    context: { seed: 'mirror', roundLimit: 6 },
  });
  assert(mirrorBattle.winner === 'draw', 'Spiegelkampf sollte unentschieden enden');

  const fastAttacker = simulateBattle({
    attacker: createFleet({
      id: 'fast',
      stacks: [
        { typeId: 'spaeherdrohne', count: 15 },
        { typeId: 'sturmfregatte', count: 1 },
      ],
      tech: { ...BASE_TECH, initiative: 2, accuracy: 0.05 },
    }),
    defender: createFleet({
      id: 'slow',
      stacks: [{ typeId: 'aetherträger', count: 2 }],
      tech: { ...BASE_TECH, panzerung: 0.05 },
    }),
    context: { seed: 'initiative', roundLimit: 4 },
  });
  assert(fastAttacker.winner === 'attacker', 'Schnelle Kleinstacks sollten Initiative-Vorteil nutzen');

  const armoredDefender = simulateBattle({
    attacker: createFleet({
      id: 'ballistic',
      stacks: [{ typeId: 'sturmfregatte', count: 6 }],
      tech: { ...BASE_TECH, accuracy: 0.1 },
    }),
    defender: createFleet({
      id: 'resist',
      tech: { ...BASE_TECH, panzerung: 0.4 },
    }),
    context: { seed: 'resist', roundLimit: 6 },
  });
  assert(armoredDefender.salvage.Or < 600, 'Hohe Panzerung sollte ballistischen Schaden stark reduzieren');
}
