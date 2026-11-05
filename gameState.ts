import type { GameResourceType, Inventory } from './types';

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
