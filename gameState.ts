import type { GameResourceType, Inventory } from './types';
import { getBonsaiMaturityRating } from './types';

export interface GameStateResources {
  condensed_organic_material: number;
  condensedOrganicMaterial: number;
  organic_waste: number;
  organicWaste?: number;
  biochemicals: number;
  biochemical?: number;
  copper_wire: number;
  copperWire: number;
  scrap_metal: number;
  scrapMetal: number;
  brass_gears: number;
  gears: number;
  circuit_boards: number;
  circuit_board: number;
  circuits: number;
  microcircuits: number;
  electronic_chips: number;
  microchip: number;
  chip: number;
  chips: number;
  t1_compost_feeder?: number;
  t2_compost_feeder?: number;
  t3_compost_feeder?: number;
  t1_fertilizer_dripper?: number;
  t2_fertilizer_dripper?: number;
  t3_fertilizer_dripper?: number;
  t1_compost_feeder_inv?: number;
  t2_compost_feeder_inv?: number;
  t3_compost_feeder_inv?: number;
  t1_fertilizer_dripper_inv?: number;
  t2_fertilizer_dripper_inv?: number;
  t3_fertilizer_dripper_inv?: number;
  unlockedBlueprints?: string[];
  [key: string]: any;
}

export const INITIAL_RESOURCES: GameStateResources = {
  condensed_organic_material: 0,
  condensedOrganicMaterial: 0,
  organic_waste: 0,
  organicWaste: 0,
  biochemicals: 0,
  biochemical: 0,
  copper_wire: 25,
  copperWire: 25,
  scrap_metal: 25,
  scrapMetal: 25,
  brass_gears: 25,
  gears: 25,
  circuit_boards: 25,
  circuit_board: 25,
  circuits: 25,
  microcircuits: 25,
  electronic_chips: 25,
  microchip: 25,
  chip: 25,
  chips: 25,
  t1_compost_feeder: 0,
  t2_compost_feeder: 0,
  t3_compost_feeder: 0,
  t1_fertilizer_dripper: 0,
  t2_fertilizer_dripper: 0,
  t3_fertilizer_dripper: 0,
  t1_compost_feeder_inv: 0,
  t2_compost_feeder_inv: 0,
  t3_compost_feeder_inv: 0,
  t1_fertilizer_dripper_inv: 0,
  t2_fertilizer_dripper_inv: 0,
  t3_fertilizer_dripper_inv: 0,
};

export const INITIAL_GAME_STATE = {
  verdure: 12000,
  coins: 12000,
  battery: 500,
  maxBattery: 500,
  roverBattery: 500,
  roverMaxBattery: 500,
  rover: {
    battery: 500,
    maxBattery: 500,
    batteryKwh: 500,
    maxBatteryKwh: 500,
  },
  unlockedMaps: ['area1_base'],
  player_level: 0,
  player_exp: 0,
  level: 0,
  xp: 0,
  playerLevel: 0,
  playerXP: 0,
  stats: {
    playerLevel: 0,
    playerXP: 0,
    level: 0,
    xp: 0,
  },
  unlockedBlueprints: [] as string[],
  resources: INITIAL_RESOURCES,
  deployables: {
    t1_compost_feeder: 0,
    t2_compost_feeder: 0,
    t3_compost_feeder: 0,
    t1_fertilizer_dripper: 0,
    t2_fertilizer_dripper: 0,
    t3_fertilizer_dripper: 0,
  },
  infrastructure: {
    t1_compost_feeder: 0,
    t2_compost_feeder: 0,
    t3_compost_feeder: 0,
    t1_fertilizer_dripper: 0,
    t2_fertilizer_dripper: 0,
    t3_fertilizer_dripper: 0,
  },
};

export const defaultGameState = INITIAL_GAME_STATE;
export const initialGameState = INITIAL_GAME_STATE;
export const DEFAULT_GAME_STATE = INITIAL_GAME_STATE;

/**
 * Player Level Progression Table (Levels 0 to 100).
 * Level 1 requirement: 200 XP.
 * For Level L (L >= 2): XP Needed = ceil((XP needed for level (L-1) + 50) * 1.05).
 * Level 100 reaches 156685 XP (Max level = 100).
 */
export const XP_FOR_LEVEL: number[] = [200, 200];
for (let l = 2; l <= 100; l++) {
  XP_FOR_LEVEL[l] = Math.ceil((XP_FOR_LEVEL[l - 1] + 50) * 1.05);
}

export const XP_REQUIREMENTS = XP_FOR_LEVEL;

/**
 * Returns required XP to reach targetLevel.
 * If targetLevel <= 1: returns 200 XP (required to reach Level 1 from Level 0).
 * If targetLevel == 2: returns 263 XP.
 * If targetLevel == 3: returns 329 XP.
 */
export function getXPRequirementForLevel(targetLevel: number): number {
  if (targetLevel <= 1) return 200;
  if (targetLevel >= 100) return 156685;
  let req = 200;
  for (let l = 2; l <= targetLevel; l++) {
    req = Math.ceil((req + 50) * 1.05);
  }
  return req;
}

export const getExpRequiredForLevel = getXPRequirementForLevel;

/**
 * Maturity Factor Table for Player XP Calculation:
 * Rating 1 (Sprout): 1.0
 * Rating 2 (Sapling): 1.1
 * Rating 3 (Mature): 1.2
 * Rating 4 (Ancient): 1.4
 * Rating 5 (Mythic): 1.7
 */
export const MATURITY_XP_FACTORS: Record<number, number> = {
  1: 1.0,
  2: 1.1,
  3: 1.2,
  4: 1.4,
  5: 1.7,
};

export function getMaturityXPFactor(maturityOrRating?: any): number {
  const rating = getBonsaiMaturityRating(maturityOrRating);
  return MATURITY_XP_FACTORS[rating] ?? 1.0;
}

export const SPECIES_FIND_ODDS_TABLE: Record<string, number> = {
  circle: 24,
  oval: 10,
  circle_hole: 4,
  raindrop: 23,
  fire: 14,
  cloud: 4,
  hexagon: 23,
  star: 10,
  snowflake: 4,
  feather: 20,
  snail: 8,
  eye: 4,
  triangle: 8,
  arrow: 12,
  shield: 9,
  diamond: 8,
  cube: 15,
  rectangle: 6,
  gear: 6,
  bell: 11,
  maru: 24,
  daen: 10,
  yubiwa: 4,
  otosu: 23,
  hi: 14,
  kumo: 4,
  rokkakkei: 23,
  asutarisuku: 10,
  sunōfurēku: 4,
  sunofureku: 4,
  fezā: 20,
  feza: 20,
  makigai: 8,
  me: 4,
  sankakkei: 8,
  yajirushi: 12,
  shīrudo: 9,
  shirudo: 9,
  daiyamondo: 8,
  shikaku: 15,
  kukei: 6,
  sōbi: 6,
  sobi: 6,
  beru: 11,
};

/**
 * Species Finding Odds for Player XP:
 * Uses identical scaling as the Donation Value calculation:
 * Math.min(5.0, 1.8 + Math.max(0, 33 - oddsPercent) * 0.1)
 * 33% finding chance -> 1.8 odds multiplier
 * 23% finding chance -> 2.8 odds multiplier (5 * 1.0 * 2.8 = 14 XP)
 * 1% finding chance  -> 5.0 odds multiplier
 */
export function getSpeciesFindingOddsForXP(speciesOrBonsai?: any): number {
  if (!speciesOrBonsai) return 1.8;
  let oddsPercent: number | undefined;

  if (typeof speciesOrBonsai === 'number') {
    // If caller already passed an odds multiplier between 1.0 and 5.0 (like 2.8):
    if (speciesOrBonsai <= 5.0 && (speciesOrBonsai < 4 || !Number.isInteger(speciesOrBonsai) || speciesOrBonsai === 5)) {
      return speciesOrBonsai;
    }
    oddsPercent = speciesOrBonsai;
  } else if (typeof speciesOrBonsai === 'string') {
    const clean = speciesOrBonsai.toLowerCase().trim();
    oddsPercent = SPECIES_FIND_ODDS_TABLE[clean] ?? 23;
  } else if (typeof speciesOrBonsai === 'object') {
    if (typeof speciesOrBonsai.findOdds === 'number') {
      oddsPercent = speciesOrBonsai.findOdds;
    } else if (typeof speciesOrBonsai.foundOdds === 'number') {
      oddsPercent = speciesOrBonsai.foundOdds;
    } else {
      const sKey = (speciesOrBonsai.leafType || speciesOrBonsai.species || speciesOrBonsai.name || '').toLowerCase().trim();
      oddsPercent = SPECIES_FIND_ODDS_TABLE[sKey] ?? 23;
    }
  }

  const finalOdds = oddsPercent ?? 23;
  const clampedOdds = Math.max(1, Math.min(33, finalOdds));
  const oddsMultiplier = Math.min(5.0, Number((1.8 + Math.max(0, 33 - clampedOdds) * 0.1).toFixed(2)));
  return oddsMultiplier;
}

export interface PlayerXPProgressionState {
  player_level: number;
  player_exp: number;
  zen_essence?: number;
  zenPoints?: number;
  [key: string]: any;
}

export interface PlayerLevelUpResult {
  newLevel: number;
  newExp: number;
  newZen: number;
  levelsGained: number;
  zenPointsGained: number;
  leveledUp: boolean;
  message?: string;
}

/**
 * Handles adding player XP and leveling up.
 * When newLevel > currentLevel:
 *   const levelsGained = newLevel - currentLevel;
 *   Award levelsGained * 5 Zen Points (e.g. zenPoints += levelsGained * 5).
 *   Toast / notification message: `🎉 Botanist Level ${newLevel}! (+${levelsGained * 5} Zen Points)`.
 */
export function awardPlayerXP(
  state: PlayerXPProgressionState,
  amount: number,
  onLevelUp?: (message: string, newLevel: number, levelsGained: number, zenPointsGained: number) => void,
): PlayerLevelUpResult {
  const cleanXP = Math.max(0, Math.round(amount));
  const currentLevel = state.player_level;
  const currentZen = state.zen_essence ?? state.zenPoints ?? 0;

  if (currentLevel >= 100) {
    state.player_level = 100;
    state.player_exp = 0;
    return {
      newLevel: 100,
      newExp: 0,
      newZen: currentZen,
      levelsGained: 0,
      zenPointsGained: 0,
      leveledUp: false,
    };
  }

  state.player_exp = Math.round((state.player_exp + cleanXP) * 100) / 100;

  let levelsGained = 0;
  while (state.player_level < 100) {
    const targetLevel = state.player_level + 1;
    const needed = getXPRequirementForLevel(targetLevel);
    if (state.player_exp >= needed) {
      state.player_exp = Math.round((state.player_exp - needed) * 100) / 100;
      state.player_level += 1;
      levelsGained += 1;
    } else {
      break;
    }
  }

  if (state.player_level >= 100) {
    state.player_level = 100;
    state.player_exp = 0;
  }

  const zenPointsGained = levelsGained * 5;
  if (zenPointsGained > 0) {
    if (state.zen_essence !== undefined) {
      state.zen_essence += zenPointsGained;
    }
    if (state.zenPoints !== undefined) {
      state.zenPoints += zenPointsGained;
    }
  }

  const message =
    levelsGained > 0
      ? `🎉 Botanist Level ${state.player_level}! (+${zenPointsGained} Zen Points)`
      : undefined;

  if (levelsGained > 0 && onLevelUp && message) {
    onLevelUp(message, state.player_level, levelsGained, zenPointsGained);
  }

  return {
    newLevel: state.player_level,
    newExp: state.player_exp,
    newZen: currentZen + zenPointsGained,
    levelsGained,
    zenPointsGained,
    leveledUp: levelsGained > 0,
    message,
  };
}

/**
 * Ensures player XP gain is strictly rounded to the nearest full integer,
 * or awards XP and levels up when passed state object.
 */
export function addPlayerXP(
  amountOrState: number | PlayerXPProgressionState,
  amountIfState?: number,
  onLevelUp?: (message: string, newLevel: number, levelsGained: number, zenPointsGained: number) => void,
): any {
  if (typeof amountOrState === 'number') {
    return Math.max(0, Math.round(amountOrState));
  }
  return awardPlayerXP(amountOrState, amountIfState ?? 0, onLevelUp);
}

/**
 * Activity 1: Manual Pruning & Care Player XP:
 * XP = 0.4 * Maturity Factor * Species Finding Odds
 * Strictly: const pruneXP = Math.round(0.4 * maturityFactor * speciesOdds);
 * When 0.4 * 1.0 * 2.8 = 1.12, Math.round(1.12) MUST evaluate strictly to 1 XP.
 */
export function calculatePruningXP(maturityFactorOrRating?: any, speciesOddsOrBonsai?: any): number {
  let maturityFactor = 1.0;
  if (typeof maturityFactorOrRating === 'number') {
    if (maturityFactorOrRating in MATURITY_XP_FACTORS) {
      maturityFactor = MATURITY_XP_FACTORS[maturityFactorOrRating];
    } else {
      maturityFactor = maturityFactorOrRating;
    }
  } else if (maturityFactorOrRating !== undefined && maturityFactorOrRating !== null) {
    maturityFactor = getMaturityXPFactor(maturityFactorOrRating);
  }

  let speciesOdds = 2.8;
  if (typeof speciesOddsOrBonsai === 'number') {
    if (speciesOddsOrBonsai <= 5.0 && (speciesOddsOrBonsai < 4 || !Number.isInteger(speciesOddsOrBonsai) || speciesOddsOrBonsai === 5)) {
      speciesOdds = speciesOddsOrBonsai;
    } else {
      speciesOdds = getSpeciesFindingOddsForXP(speciesOddsOrBonsai);
    }
  } else if (speciesOddsOrBonsai !== undefined && speciesOddsOrBonsai !== null) {
    speciesOdds = getSpeciesFindingOddsForXP(speciesOddsOrBonsai);
  } else {
    speciesOdds = getSpeciesFindingOddsForXP(maturityFactorOrRating);
  }

  const pruneXP = Math.round(0.4 * maturityFactor * speciesOdds);
  return Math.max(0, pruneXP);
}

/**
 * Activity 2: Bonsai Leveling Up Player XP (Both manual & automated):
 * XP = 1.0 * Maturity Factor * Species Finding Odds * ((Growth Duration Seconds / 100) + 1)
 * Always rounded to the closest full integer: Math.max(0, Math.round(rawXP))
 */
export function calculateBonsaiLevelUpXP(
  levelTransition: number,
  maturityOrRating?: any,
  speciesOrBonsai?: any,
): number {
  const mat = getMaturityXPFactor(maturityOrRating);
  const odds = getSpeciesFindingOddsForXP(speciesOrBonsai ?? maturityOrRating);
  const growthDurationSeconds = getRequiredGrowthDuration(levelTransition, maturityOrRating);
  const durationFactor = (growthDurationSeconds / 100) + 1;
  const rawXP = 1.0 * mat * odds * durationFactor;
  return Math.max(0, Math.round(rawXP));
}

/**
 * Activity 3: Expeditions: Finding Seedling/Bonsai Player XP:
 * XP = 5.0 * Maturity Factor * Species Finding Odds
 * Always rounded to the closest full integer: Math.max(0, Math.round(rawXP))
 * Example: 5 * 1.0 (R1) * 2.8 (23% odds) = 14 XP
 */
export function calculateFindingSeedlingXP(maturityOrRating?: any, speciesOrBonsai?: any): number {
  const mat = getMaturityXPFactor(maturityOrRating);
  const odds = getSpeciesFindingOddsForXP(speciesOrBonsai ?? maturityOrRating);
  const rawXP = 5.0 * mat * odds;
  return Math.max(0, Math.round(rawXP));
}

/**
 * Activity 4: Expeditions: Finding Crystal Artifact Player XP:
 * +0.5 Points Artifact: 25 XP
 * +1.0 Points Artifact: 50 XP
 * +1.5 Points Artifact: 100 XP
 */
export function calculateFindingCrystalXP(strength = 0.5): number {
  if (strength >= 1.5) return 100;
  if (strength >= 1.0) return 50;
  return 25;
}

/**
 * Activity 5: Expeditions: Finding Resources Player XP:
 * Scrap Metal: 3 XP per piece (3 * count)
 * Copper Wire: 6 XP per piece (6 * count)
 * Mechanical Gear: 12 XP per piece (12 * count)
 * Microcircuit: 25 XP per piece (25 * count)
 * Quantum Chip: 50 XP per piece (50 * count)
 * Always rounded to the closest full integer: Math.max(0, Math.round(rawXP))
 */
export function calculateFindingResourceXP(resourceType: string, stackCount = 1): number {
  let perPiece = 3;
  switch (resourceType) {
    case 'scrap_metal':
      perPiece = 3;
      break;
    case 'scrap_metal_double':
      return Math.max(0, Math.round(3 * 2));
    case 'copper_wire':
      perPiece = 6;
      break;
    case 'copper_wire_double':
      return Math.max(0, Math.round(6 * 2));
    case 'brass_gears':
    case 'gears':
    case 'mechanical_gear':
      perPiece = 12;
      break;
    case 'circuit_boards':
    case 'microcircuits':
    case 'circuits':
    case 'microcircuit':
      perPiece = 25;
      break;
    case 'electronic_chips':
    case 'quantum_chips':
    case 'chips':
    case 'quantum_chip':
      perPiece = 50;
      break;
    default:
      perPiece = 3;
      break;
  }
  return Math.max(0, Math.round(perPiece * stackCount));
}

/**
 * Calculates the exact growth velocity (seconds of growth progress per second watered)
 * for a sprinkler or manual irrigation system based on its tier and unlocked Zen skills.
 *
 * Base Mechanic: 1.0s/s base growth velocity.
 * Skill Scaling: 1 + skillLevel (s/s).
 */
export function calculateWateringGrowthRate(
  structureType:
    | 'automaton_t1'
    | 'automaton_t2'
    | 'automaton_t3'
    | 'irrigation_t1'
    | 'irrigation_t2'
    | 'irrigation_t3'
    | string,
  skills: Record<string, number> = {},
): number {
  let skillKey = '';
  if (structureType === 'automaton_t1') skillKey = 'hydrodynamicsSprinklerT1';
  else if (structureType === 'automaton_t2') skillKey = 'hydrodynamicsSprinklerT2';
  else if (structureType === 'automaton_t3') skillKey = 'hydrodynamicsSprinklerT3';
  else if (structureType === 'irrigation_t1') skillKey = 'hydrodynamicsIrrigationT1';
  else if (structureType === 'irrigation_t2') skillKey = 'hydrodynamicsIrrigationT2';
  else if (structureType === 'irrigation_t3') skillKey = 'hydrodynamicsIrrigationT3';

  const skillLevel = skillKey ? (skills[skillKey] || 0) : 0;
  return 1 + skillLevel;
}

/**
 * Calculates the exact duration (in seconds) required to advance from currentLevel to currentLevel + 1.
 * Covers Levels 0 to 99 (transitions Lvl 0->1 through Lvl 99->100) across Maturity Ratings 1 to 5.
 *
 * Maturity Rating mapping:
 * - R.1: Maturity Rating 1 (Sprout / Rating 1)
 * - R.2: Maturity Rating 2 (Sapling / Rating 2)
 * - R.3: Maturity Rating 3 (Mature / Rating 3)
 * - R.4: Maturity Rating 4 (Ancient / Rating 4)
 * - R.5: Maturity Rating 5 (Mythic / Rating 5)
 * Clamped strictly to 1..5 (defaulting to 1 if not set).
 */
export function getRequiredGrowthDuration(
  currentLevel: number,
  maturityRating: number | string | any = 1,
): number {
  const L = Math.max(0, Math.min(99, Math.floor(currentLevel)));
  const rating = getBonsaiMaturityRating(maturityRating);
  const R = Math.max(1, Math.min(5, Math.round(rating)));

  // Lvl 0 to 20: All ratings are identical for each level
  if (L <= 3) {
    // 0->1: 6s | 1->2: 12s | 2->3: 18s | 3->4: 24s (step 6)
    return (L + 1) * 6;
  }
  if (L <= 6) {
    // 4->5: 36s | 5->6: 48s | 6->7: 60s (step 12)
    return 36 + (L - 4) * 12;
  }
  if (L <= 10) {
    // 7->8: 90s | 8->9: 120s | 9->10: 150s | 10->11: 180s (step 30)
    return 90 + (L - 7) * 30;
  }
  if (L <= 15) {
    // 11->12: 240s | ... | 15->16: 480s (step 60)
    return 240 + (L - 11) * 60;
  }
  if (L <= 20) {
    // 16->17: 600s | ... | 20->21: 1080s (step 120)
    return 600 + (L - 16) * 120;
  }

  // Lvl 21 to 100:
  if (R === 1) {
    // R.1: Starts at 1200s at Lvl 21->22, increases by +120s every level up to Lvl 99->100 (10560s)
    return 1200 + (L - 21) * 120;
  }

  if (R === 2) {
    // R.2: Starts at 1260s at Lvl 21->22, increases by +180s every level up to Lvl 99->100 (15300s)
    return 1260 + (L - 21) * 180;
  }

  if (R === 3) {
    // R.3:
    // Lvl 21->24: matches R.2 (1260, 1440, 1620, 1800)
    if (L <= 24) {
      return 1260 + (L - 21) * 180;
    }
    // Lvl 25->99: starts at 2100s at Lvl 25->26, increases by +300s every level up to Lvl 99->100 (24300s)
    return 2100 + (L - 25) * 300;
  }

  if (R === 4) {
    // R.4:
    // Lvl 21->30: matches R.3
    if (L <= 24) {
      return 1260 + (L - 21) * 180;
    }
    if (L <= 30) {
      return 2100 + (L - 25) * 300;
    }
    // Lvl 31->99: starts at 4200s at Lvl 31->32, increases by +600s every level up to Lvl 99->100 (45000s)
    return 4200 + (L - 31) * 600;
  }

  // R === 5
  // Lvl 21->36: matches R.4
  if (L <= 24) {
    return 1260 + (L - 21) * 180;
  }
  if (L <= 30) {
    return 2100 + (L - 25) * 300;
  }
  if (L <= 36) {
    return 4200 + (L - 31) * 600;
  }
  // Lvl 37->99: starts at 8400s at Lvl 37->38, increases by +1200s every level up to Lvl 99->100 (82800s)
  return 8400 + (L - 37) * 1200;
}

export const getLevelRequirement = getRequiredGrowthDuration;

export function getBonsaiLevelGrowthNeeded(
  level: number,
  maturityOrRating?: any,
): number {
  return getRequiredGrowthDuration(level, maturityOrRating);
}

/**
 * Calculates discounted price given a base Verdure price and Discount Hunter skill level.
 * Formula: discountMultiplier = Math.max(0.1, 1 - (discountHunterLvl * 0.02))
 * Discounted Price = Math.max(1, Math.round(basePrice * discountMultiplier))
 */
export function calculateDiscountedPrice(basePrice: number, discountHunterLvl = 0): number {
  const discountMultiplier = Math.max(0.1, 1 - (discountHunterLvl * 0.02));
  return Math.max(1, Math.round(basePrice * discountMultiplier));
}

/**
 * Precalculated Comprehensive Bonsai Growth Duration Table (Levels 0..99 across Ratings 1..5).
 * Allows index access: GROWTH_TIME_TABLE[level][rating] or GROWTH_TIME_TABLE[level].R1
 */
export interface GrowthTimeRow {
  [rating: number]: number;
  R1: number;
  R2: number;
  R3: number;
  R4: number;
  R5: number;
  sprout: number;
  sapling: number;
  notable: number;
  refined: number;
  premium: number;
}

export const GROWTH_TIME_TABLE: GrowthTimeRow[] = [];
for (let lvl = 0; lvl <= 100; lvl++) {
  const r1 = getRequiredGrowthDuration(lvl, 1);
  const r2 = getRequiredGrowthDuration(lvl, 2);
  const r3 = getRequiredGrowthDuration(lvl, 3);
  const r4 = getRequiredGrowthDuration(lvl, 4);
  const r5 = getRequiredGrowthDuration(lvl, 5);

  const row: GrowthTimeRow = Object.assign([r1, r1, r2, r3, r4, r5], {
    R1: r1,
    R2: r2,
    R3: r3,
    R4: r4,
    R5: r5,
    sprout: r1,
    sapling: r2,
    notable: r3,
    refined: r4,
    premium: r5,
  });
  GROWTH_TIME_TABLE.push(row);
}

export {
  calculateBonsaiDonationValue,
  calculateDonationValue,
  calculateBonsaiSellPrice,
  calculateBonsaiValue,
  calculateAttributeFactor,
  getBonsaiDonationBreakdown,
  type AttributeFactorBreakdown,
  type BonsaiDonationBreakdown,
} from './bonsaiData';

export type { Inventory, GameResourceType };

export {
  saveGame,
  loadGame,
  deleteSaveSlot,
  simulateOfflineProgress,
  getAllSaveSlotsMetadata,
  getSaveSlotMetadata,
  formatTimeAway,
  SAVE_SLOT_KEYS,
  type SaveSlotId,
  type SaveSlotMetadata,
  type FullSaveState,
  type OfflineSummary,
} from './saveManager';
