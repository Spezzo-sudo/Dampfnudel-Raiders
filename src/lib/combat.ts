import { Fleet, FleetStack, TechBonuses } from '@/types';

export interface DamageProfile {
  ballistic: number;
  lichtbogen: number;
  tesla: number;
  aether: number;
}

interface ShipProfile {
  typeId: string;
  armor: number;
  hull: number;
  initiative: number;
  accuracy: number;
  evasion: number;
  damage: DamageProfile;
  cost: { Or: number; Kr: number };
}

interface StackState {
  side: 'attacker' | 'defender';
  typeId: string;
  units: number;
  currentArmor: number;
  currentHull: number;
  armorPerUnit: number;
  hullPerUnit: number;
  initiative: number;
  accuracy: number;
  evasion: number;
  damage: DamageProfile;
  cost: { Or: number; Kr: number };
  tech: TechBonuses;
}

export interface RoundVolleyLog {
  side: 'attacker' | 'defender';
  fromType: string;
  toType: string;
  hits: number;
  damage: number;
  destroyedUnits: number;
}

export interface RoundLog {
  index: number;
  volleys: RoundVolleyLog[];
}

export interface BattleInput {
  attacker: Fleet;
  defender: Fleet;
  context: {
    seed: number | string;
    roundLimit?: number;
    locationMods?: Partial<DamageProfile>;
  };
}

export interface BattleRemainingState {
  attacker: FleetStack[];
  defender: FleetStack[];
}

export interface BattleResult {
  winner: 'attacker' | 'defender' | 'draw';
  rounds: RoundLog[];
  remaining: BattleRemainingState;
  salvage: { Or: number; Kr: number };
  mvp?: { side: 'attacker' | 'defender'; typeId: string };
}

const ROUND_LIMIT = 6;

const SHIP_PROFILES: Record<string, ShipProfile> = {
  spaeherdrohne: {
    typeId: 'spaeherdrohne',
    armor: 12,
    hull: 18,
    initiative: 14,
    accuracy: 0.65,
    evasion: 0.28,
    damage: { ballistic: 4, lichtbogen: 2, tesla: 0, aether: 0 },
    cost: { Or: 300, Kr: 120 },
  },
  kohlenfrachter: {
    typeId: 'kohlenfrachter',
    armor: 45,
    hull: 60,
    initiative: 6,
    accuracy: 0.55,
    evasion: 0.08,
    damage: { ballistic: 6, lichtbogen: 1, tesla: 0, aether: 0 },
    cost: { Or: 1200, Kr: 300 },
  },
  sturmfregatte: {
    typeId: 'sturmfregatte',
    armor: 65,
    hull: 80,
    initiative: 11,
    accuracy: 0.6,
    evasion: 0.16,
    damage: { ballistic: 14, lichtbogen: 4, tesla: 2, aether: 0 },
    cost: { Or: 2200, Kr: 800 },
  },
  aetherträger: {
    typeId: 'aetherträger',
    armor: 80,
    hull: 120,
    initiative: 9,
    accuracy: 0.58,
    evasion: 0.12,
    damage: { ballistic: 8, lichtbogen: 5, tesla: 4, aether: 3 },
    cost: { Or: 3400, Kr: 1400 },
  },
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function createRng(seed: number | string) {
  let state: number;
  if (typeof seed === 'string') {
    state = 0;
    for (let i = 0; i < seed.length; i += 1) {
      state = (state * 31 + seed.charCodeAt(i)) % 2147483647;
    }
  } else {
    state = Math.abs(seed) % 2147483647;
  }
  if (state === 0) {
    state = 1;
  }
  return () => {
    state = (state * 48271) % 2147483647;
    return state / 2147483647;
  };
}

function createStack(
  side: 'attacker' | 'defender',
  stack: FleetStack,
  tech: TechBonuses,
): StackState {
  const profile = SHIP_PROFILES[stack.typeId];
  if (!profile) {
    return {
      side,
      typeId: stack.typeId,
      units: stack.count,
      currentArmor: profile?.armor ?? 0,
      currentHull: profile?.hull ?? 0,
      armorPerUnit: profile?.armor ?? 1,
      hullPerUnit: profile?.hull ?? 1,
      initiative: 1,
      accuracy: 0.5,
      evasion: 0,
      damage: profile?.damage ?? { ballistic: 2, lichtbogen: 0, tesla: 0, aether: 0 },
      cost: profile?.cost ?? { Or: 200, Kr: 100 },
      tech,
    };
  }
  const armorPerUnit = profile.armor * (1 + tech.panzerung);
  const hullPerUnit = profile.hull * (1 + tech.panzerung * 0.5);
  return {
    side,
    typeId: stack.typeId,
    units: stack.count,
    currentArmor: armorPerUnit,
    currentHull: hullPerUnit,
    armorPerUnit,
    hullPerUnit,
    initiative: profile.initiative + tech.initiative,
    accuracy: clamp(profile.accuracy + tech.accuracy, 0, 1),
    evasion: clamp(profile.evasion + tech.evasion, 0, 0.7),
    damage: profile.damage,
    cost: profile.cost,
    tech,
  };
}

function computeDamage(
  attacker: StackState,
  defender: StackState,
  hits: number,
  locationMods?: Partial<DamageProfile>,
): number {
  const damageProfile = attacker.damage;
  const offensiveLichtbogen = damageProfile.lichtbogen * (1 + attacker.tech.lichtbogen);
  const offensiveTesla = damageProfile.tesla * (1 + attacker.tech.tesla);
  const offensiveAether = damageProfile.aether * (1 + attacker.tech.aether);
  const baseBallistic = damageProfile.ballistic;
  const locationMultiplier = {
    ballistic: locationMods?.ballistic ?? 1,
    lichtbogen: locationMods?.lichtbogen ?? 1,
    tesla: locationMods?.tesla ?? 1,
    aether: locationMods?.aether ?? 1,
  };
  const ballisticDamage = baseBallistic * hits * locationMultiplier.ballistic;
  const mitigatedBallistic = ballisticDamage * (1 - clamp(defender.tech.panzerung, 0, 0.8));
  const lichtbogenDamage = offensiveLichtbogen * hits * locationMultiplier.lichtbogen;
  const teslaDamage = offensiveTesla * hits * locationMultiplier.tesla;
  const aetherDamage = offensiveAether * hits * locationMultiplier.aether;
  return mitigatedBallistic + lichtbogenDamage + teslaDamage + aetherDamage;
}

function applyDamage(target: StackState, damage: number): number {
  let destroyed = 0;
  while (damage > 0 && target.units > 0) {
    if (target.currentArmor > 0) {
      const absorbed = Math.min(target.currentArmor, damage);
      target.currentArmor -= absorbed;
      damage -= absorbed;
      if (target.currentArmor === 0 && target.armorPerUnit > 0) {
        target.currentHull = target.hullPerUnit;
      }
    } else {
      if (target.currentHull === 0) {
        target.currentHull = target.hullPerUnit;
      }
      const taken = Math.min(target.currentHull, damage);
      target.currentHull -= taken;
      damage -= taken;
      if (target.currentHull === 0) {
        target.units -= 1;
        destroyed += 1;
        target.currentArmor = target.armorPerUnit;
        target.currentHull = target.hullPerUnit;
      }
    }
  }
  return destroyed;
}

function summarize(stacks: StackState[]): FleetStack[] {
  return stacks
    .filter((stack) => stack.units > 0)
    .map((stack) => ({ typeId: stack.typeId, count: stack.units }));
}

function nextTarget(stacks: StackState[], side: 'attacker' | 'defender'): StackState | undefined {
  return stacks
    .filter((stack) => stack.side !== side && stack.units > 0)
    .sort((a, b) => b.units - a.units)[0];
}

function hasLivingStacks(stacks: StackState[], side: 'attacker' | 'defender'): boolean {
  return stacks.some((stack) => stack.side === side && stack.units > 0);
}

interface DamageTracker {
  attacker: Record<string, number>;
  defender: Record<string, number>;
}

/**
 * Executes a deterministic, round-based battle simulation between two fleets.
 */
export function simulateBattle(input: BattleInput): BattleResult {
  const roundLimit = input.context.roundLimit ?? ROUND_LIMIT;
  const rng = createRng(input.context.seed);
  const stacks: StackState[] = [
    ...input.attacker.stacks.map((stack) => createStack('attacker', stack, input.attacker.tech)),
    ...input.defender.stacks.map((stack) => createStack('defender', stack, input.defender.tech)),
  ];
  const rounds: RoundLog[] = [];
  const damageTracker: DamageTracker = { attacker: {}, defender: {} };
  const salvage = { Or: 0, Kr: 0 };

  for (let roundIndex = 0; roundIndex < roundLimit; roundIndex += 1) {
    if (!hasLivingStacks(stacks, 'attacker') || !hasLivingStacks(stacks, 'defender')) {
      break;
    }
    const order = stacks
      .filter((stack) => stack.units > 0)
      .slice()
      .sort((a, b) => b.initiative - a.initiative || (a.side === 'attacker' ? -1 : 1));
    const volleys: RoundVolleyLog[] = [];

    for (const stack of order) {
      if (stack.units <= 0) {
        continue;
      }
      const target = nextTarget(stacks, stack.side);
      if (!target) {
        continue;
      }
      const hitChance = clamp(1 - target.evasion + stack.accuracy, 0.1, 0.95);
      let hits = 0;
      for (let i = 0; i < stack.units; i += 1) {
        const roll = rng();
        if (roll <= hitChance) {
          hits += 1;
        }
      }
      if (hits === 0) {
        volleys.push({
          side: stack.side,
          fromType: stack.typeId,
          toType: target.typeId,
          hits: 0,
          damage: 0,
          destroyedUnits: 0,
        });
        continue;
      }
      const damage = computeDamage(stack, target, hits, input.context.locationMods);
      const destroyed = applyDamage(target, damage);
      const tracker = damageTracker[stack.side];
      tracker[stack.typeId] = (tracker[stack.typeId] ?? 0) + damage;
      salvage.Or += destroyed * target.cost.Or * 0.25;
      salvage.Kr += destroyed * target.cost.Kr * 0.25;
      volleys.push({
        side: stack.side,
        fromType: stack.typeId,
        toType: target.typeId,
        hits,
        damage: Math.round(damage),
        destroyedUnits: destroyed,
      });
    }

    rounds.push({ index: roundIndex + 1, volleys });
  }

  let winner: 'attacker' | 'defender' | 'draw' = 'draw';
  const attackerAlive = hasLivingStacks(stacks, 'attacker');
  const defenderAlive = hasLivingStacks(stacks, 'defender');
  if (attackerAlive && !defenderAlive) {
    winner = 'attacker';
  } else if (!attackerAlive && defenderAlive) {
    winner = 'defender';
  }

  let mvp: BattleResult['mvp'];
  let bestDamage = 0;
  for (const [side, values] of Object.entries(damageTracker)) {
    for (const [typeId, dealt] of Object.entries(values)) {
      if (dealt > bestDamage) {
        bestDamage = dealt;
        mvp = { side: side as 'attacker' | 'defender', typeId };
      }
    }
  }

  return {
    winner,
    rounds,
    remaining: {
      attacker: summarize(stacks.filter((stack) => stack.side === 'attacker')),
      defender: summarize(stacks.filter((stack) => stack.side === 'defender')),
    },
    salvage: {
      Or: Math.round(salvage.Or),
      Kr: Math.round(salvage.Kr),
    },
    mvp,
  };
}
