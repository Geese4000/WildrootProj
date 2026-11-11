// The shape of a Wild Shape as the Express API returns it (GET /api/wildshapes)
export interface NamedEntry {
  name: string;
  description: string;
}

export interface AbilityScores {
  str: number;
  dex: number;
  con: number;
  int: number;
  wis: number;
  cha: number;
}

export interface WildShape {
  _id: string;
  name: string;
  size: string;
  creatureType: string;
  alignment?: string;
  armorClass: number;
  armorClassNote?: string;
  hitPoints: number;
  hitDice?: string;
  speed: string;
  abilities: AbilityScores;
  savingThrows: string[];
  skills: string[];
  damageVulnerabilities: string[];
  damageResistances: string[];
  damageImmunities: string[];
  conditionImmunities: string[];
  senses?: string;
  languages?: string;
  challengeRating: string;
  xp?: number;
  traits: NamedEntry[];
  actions: NamedEntry[];
  tags: string[];
}