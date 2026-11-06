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
  verdure: 250,
  coins: 250,
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
