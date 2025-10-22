export enum ResourceType {
  Orichalkum = 'Orichalkum',
  Fokuskristalle = 'Fokuskristalle',
  Vitriol = 'Vitriol',
}

export type Resources = Record<ResourceType, number>;
export type Storage = Resources;

export interface Building {
  id: string;
  name: string;
  description: string;
  baseCost: Resources;
  costMultiplier: number;
  baseProduction: Resources;
  productionMultiplier?: number;
  baseEnergyConsumption?: number;
  energyConsumptionMultiplier?: number;
  baseEnergySupply?: number;
  energySupplyMultiplier?: number;
}

export interface Research {
  id: string;
  name: string;
  description: string;
  baseCost: Resources;
  costMultiplier: number;
}

export interface ShipBlueprint {
  id: string;
  name: string;
  description: string;
  role: 'Aufklärung' | 'Transport' | 'Angriff' | 'Unterstützung';
  hangarSlots: number;
  baseCost: Resources;
  buildTimeSeconds: number;
  crew: number;
  cargo: number;
}

export enum View {
  Uebersicht = 'Uebersicht',
  Gebaeude = 'Gebaeude',
  Forschung = 'Forschung',
  Werft = 'Werft',
  Galaxie = 'Galaxie',
}

export interface BuildQueueItem {
  entityId: string;
  level: number;
  startTime: number;
  endTime: number;
}

export interface AxialCoordinates {
  q: number;
  r: number;
}

export enum PlanetBiome {
  Messingwueste = 'Messingwueste',
  Aethermoor = 'Aethermoor',
  Dampfarchipel = 'Dampfarchipel',
  Uhrwerksteppe = 'Uhrwerksteppe',
  Glimmerkluft = 'Glimmerkluft',
}

export interface Planet {
  id: string;
  systemId: string;
  slot: number;
  name: string;
  isOwn?: boolean;
  owner?: string;
  biome: PlanetBiome;
  axial?: AxialCoordinates;
}

export interface SystemSnapshot {
  id: string;
  sectorQ: number;
  sectorR: number;
  sysIndex: number;
  biome: PlanetBiome;
  planets: Planet[];
}

export interface FleetStack {
  typeId: string;
  count: number;
}

export interface FleetCargo {
  Or: number;
  Kr: number;
  Vi: number;
}

export interface TechBonuses {
  panzerung: number;
  lichtbogen: number;
  tesla: number;
  aether: number;
  evasion: number;
  accuracy: number;
  initiative: number;
}

export interface Fleet {
  id: string;
  ownerId: string;
  stacks: FleetStack[];
  cargo: FleetCargo;
  tech: TechBonuses;
}

export type MissionType = 'attack' | 'transport' | 'colonize' | 'spy' | 'reinforce';

export interface MissionEndpoint {
  systemId: string;
  planetId?: string;
}

export type MissionStatus = 'enroute' | 'arrived' | 'resolved';

export interface Mission {
  id: string;
  type: MissionType;
  fleetId: string;
  from: MissionEndpoint;
  to: MissionEndpoint;
  departAt: number;
  arriveAt: number;
  payload?: unknown;
  status: MissionStatus;
  reportId?: string;
}
