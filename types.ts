import type {
  BonsaiLeafType,
  BonsaiGroup,
  MaturityTier,
} from './bonsaiData';

export type RoverChassisTier = 1 | 2 | 3;

export const AREA_EXCAVATION_SPEEDS = {
  FOOTHILLS: 3.2,
  HIGHLANDS: 4.4,
  OVERGROWTH: 5.8,
} as const;

export type RoverModuleType =
  | 'storage_1'
  | 'storage_2'
  | 'storage_3'
  | 'battery_1'
  | 'battery_2'
  | 'battery_3'
  | 'radar_1'
  | 'radar_2'
  | 'radar_3';

export interface RoverModuleConfig {
  id: RoverModuleType;
  name: string;
  category: 'storage' | 'battery' | 'radar';
  tier: 1 | 2 | 3;
  icon: string;
  bonusValue: number;
  bonusLabel: string;
  description: string;
}

/**
 * Individual unique Seedling instance stored in inventory / haul.
 * Stores exact genetic potential without collapsing or stacking.
 */
export interface SeedlingItem {
  id: string; // unique uuid / timestamp
  leafType: BonsaiLeafType;
  maturity: MaturityTier | number; // 1 to 5 or MaturityTier
  name?: string;
  group?: BonsaiGroup;
  species?: string;
  rarity?: string;
  color?: string;
  flowerColor?: string;
  findOdds?: number;
  nature?: BonsaiNature | string;
  geneticPotential: BonsaiAttributes; // individual { foliage, branches, trunk, roots }
  attributes?: BonsaiAttributes; // alias for compatibility
  cultivationPotential?: CultivationPotential;
  discoveredAreaId?: string;
}

/**
 * Four Botanical Attributes determining a Bonsai's intrinsic Genetic Potential.
 */
export interface BonsaiAttributes {
  foliage: number; // 0-100
  branches: number; // 0-100
  trunk: number; // 0-100
  roots: number; // 0-100
}

export const DEFAULT_BONSAI_ATTRIBUTES: BonsaiAttributes = {
  foliage: 50,
  branches: 50,
  trunk: 50,
  roots: 50,
};

export type CrystalAttributeType = 'foliage' | 'branches' | 'trunk' | 'roots';

export interface CrystalItem {
  id: string;
  crystalType: CrystalAttributeType;
  strength: 0.5 | 1.0;
  name: string;
  color: string;
  discoveredAreaId?: string;
}

export const CRYSTAL_METADATA: Record<
  CrystalAttributeType,
  { name: string; attributeName: string; color: string; desc: string }
> = {
  foliage: {
    name: 'Foliage Emerald',
    attributeName: 'Foliage',
    color: '#22c55e',
    desc: 'Emerald crystal shard radiating verdant foliage energy.',
  },
  branches: {
    name: 'Branch Amber',
    attributeName: 'Branches',
    color: '#eab308',
    desc: 'Amber crystal shard radiating golden branching harmony.',
  },
  trunk: {
    name: 'Trunk Coral',
    attributeName: 'Trunk',
    color: '#ef4444',
    desc: 'Coral red crystal shard radiating sturdy trunk strength.',
  },
  roots: {
    name: 'Root Azure',
    attributeName: 'Roots',
    color: '#3b82f6',
    desc: 'Azure blue crystal shard radiating deep anchoring resilience.',
  },
};

/**
 * Four Botanical Attributes determining a Bonsai's nurtured Cultivation Potential.
 * Tracks internal cultivation growth points from 0 to 1000 points.
 */
export interface CultivationPotential {
  foliage: number; // 0 - 1000 points
  branches: number; // 0 - 1000 points
  trunk: number; // 0 - 1000 points
  roots: number; // 0 - 1000 points
}

export const DEFAULT_CULTIVATION_POTENTIAL: CultivationPotential = {
  foliage: 0,
  branches: 0,
  trunk: 0,
  roots: 0,
};

/**
 * 16 Bonsai Natures System
 */
export interface BonsaiNature {
  name: string;
  descriptor: string;
  upAttribute?: 'foliage' | 'branches' | 'trunk' | 'roots';
  downAttribute?: 'foliage' | 'branches' | 'trunk' | 'roots';
}

export const BONSAI_NATURES: BonsaiNature[] = [
  { name: 'Balanced', descriptor: 'No changes' },
  { name: 'Leafed', descriptor: 'Foliage: Up; Roots: Down', upAttribute: 'foliage', downAttribute: 'roots' },
  { name: 'Branched', descriptor: 'Branches: Up; Roots: Down', upAttribute: 'branches', downAttribute: 'roots' },
  { name: 'Strengthened', descriptor: 'Trunk: Up; Roots: Down', upAttribute: 'trunk', downAttribute: 'roots' },
  { name: 'Equalised', descriptor: 'No changes' },
  { name: 'Adorned', descriptor: 'Foliage: Up; Trunk: Down', upAttribute: 'foliage', downAttribute: 'trunk' },
  { name: 'Ramified', descriptor: 'Branches: Up; Trunk: Down', upAttribute: 'branches', downAttribute: 'trunk' },
  { name: 'Grounded', descriptor: 'Roots: Up; Trunk: Down', upAttribute: 'roots', downAttribute: 'trunk' },
  { name: 'Adjusted', descriptor: 'No changes' },
  { name: 'Decorated', descriptor: 'Foliage: Up; Branches: Down', upAttribute: 'foliage', downAttribute: 'branches' },
  { name: 'Fortified', descriptor: 'Trunk: Up; Branches: Down', upAttribute: 'trunk', downAttribute: 'branches' },
  { name: 'Fixed', descriptor: 'Roots: Up; Branches: Down', upAttribute: 'roots', downAttribute: 'branches' },
  { name: 'Tempered', descriptor: 'No changes' },
  { name: 'Dispersed', descriptor: 'Branches: Up; Foliage: Down', upAttribute: 'branches', downAttribute: 'foliage' },
  { name: 'Consolidated', descriptor: 'Trunk: Up; Foliage: Down', upAttribute: 'trunk', downAttribute: 'foliage' },
  { name: 'Earthed', descriptor: 'Roots: Up; Foliage: Down', upAttribute: 'roots', downAttribute: 'foliage' },
];

export function getBonsaiNature(nameOrNature?: string | BonsaiNature): BonsaiNature {
  if (!nameOrNature) return BONSAI_NATURES[0];
  if (typeof nameOrNature === 'object') return nameOrNature;
  return (
    BONSAI_NATURES.find((n) => n.name.toLowerCase() === nameOrNature.toLowerCase()) || {
      name: nameOrNature,
      descriptor: 'No changes',
    }
  );
}

/**
 * Pedestal Crystal Decorations configuration
 */
export type CrystalPedestalType =
  | 'empty_crystal_pedestal'
  | 'crystal_pedestal'
  | 'crystal_pedestal_foliage'
  | 'crystal_pedestal_branches'
  | 'crystal_pedestal_trunk'
  | 'crystal_pedestal_roots';

export interface CrystalPedestalDef {
  type: CrystalPedestalType;
  name: string;
  attribute?: 'foliage' | 'branches' | 'trunk' | 'roots';
  attributeName?: string;
  color?: string;
  price: number;
  bonusLabel: string;
  description: string;
}

export const EMPTY_CRYSTAL_PEDESTAL: CrystalPedestalDef = {
  type: 'empty_crystal_pedestal',
  name: 'Empty Crystal Pedestal',
  price: 50,
  bonusLabel: 'Socket with expedition crystals for +CP',
  description: 'Carved stone pedestal without any crystal on top. Deploy in sanctuary, then interact [E] to socket any crystal shard found during expeditions.',
};

export const CRYSTAL_PEDESTALS: Record<string, CrystalPedestalDef> = {
  empty_crystal_pedestal: EMPTY_CRYSTAL_PEDESTAL,
  crystal_pedestal_foliage: {
    type: 'crystal_pedestal_foliage',
    name: 'Emerald Leaf Crystal Pedestal',
    attribute: 'foliage',
    attributeName: 'Foliage',
    color: '#22c55e',
    price: 50,
    bonusLabel: '+1 Foliage Cultivation Potential per level',
    description: 'Carved dark slate pedestal topped with a glowing emerald leaf crystal.',
  },
  crystal_pedestal_branches: {
    type: 'crystal_pedestal_branches',
    name: 'Amber Branch Crystal Pedestal',
    attribute: 'branches',
    attributeName: 'Branches',
    color: '#eab308',
    price: 50,
    bonusLabel: '+1 Branches Cultivation Potential per level',
    description: 'Carved dark slate pedestal topped with a glowing warm amber branching twig crystal.',
  },
  crystal_pedestal_trunk: {
    type: 'crystal_pedestal_trunk',
    name: 'Coral Trunk Crystal Pedestal',
    attribute: 'trunk',
    attributeName: 'Trunk',
    color: '#ef4444',
    price: 50,
    bonusLabel: '+1 Trunk Cultivation Potential per level',
    description: 'Carved dark slate pedestal topped with a glowing rust coral trunk crystal.',
  },
  crystal_pedestal_roots: {
    type: 'crystal_pedestal_roots',
    name: 'Azure Root Crystal Pedestal',
    attribute: 'roots',
    attributeName: 'Roots',
    color: '#3b82f6',
    price: 50,
    bonusLabel: '+1 Roots Cultivation Potential per level',
    description: 'Carved dark slate pedestal topped with a glowing deep azure root tendril crystal.',
  },
};

export function formatCrystalPedestalBonus(pedestals: {
  foliage?: number;
  branches?: number;
  trunk?: number;
  roots?: number;
}): string {
  const parts: string[] = [];
  if (pedestals.trunk && pedestals.trunk > 0) parts.push(`+${pedestals.trunk % 1 === 0 ? pedestals.trunk : pedestals.trunk.toFixed(1)} Trunk`);
  if (pedestals.branches && pedestals.branches > 0) parts.push(`+${pedestals.branches % 1 === 0 ? pedestals.branches : pedestals.branches.toFixed(1)} Branches`);
  if (pedestals.foliage && pedestals.foliage > 0) parts.push(`+${pedestals.foliage % 1 === 0 ? pedestals.foliage : pedestals.foliage.toFixed(1)} Foliage`);
  if (pedestals.roots && pedestals.roots > 0) parts.push(`+${pedestals.roots % 1 === 0 ? pedestals.roots : pedestals.roots.toFixed(1)} Roots`);
  if (parts.length === 0) return '';
  return `${parts.join(' & ')} Cultivation Potential per level`;
}

export type GrowthStyle =
  | 'chokan'
  | 'moyogi'
  | 'shakan'
  | 'han_kengai'
  | 'sokan'
  | 'kengai'
  | 'kabudachi'
  | 'CHOKAN'
  | 'MOYOGI'
  | 'SHAKAN'
  | 'HAN_KENGAI'
  | 'SOKAN'
  | 'KENGAI'
  | 'KABUDACHI';

export interface HaloPlotCoord {
  col: number;
  row: number;
}

/**
 * Returns the exact relative offset array for a bonsai of given maturity rating (1 to 5).
 * - Rating 1: 4 Spots (Orthogonal only: Up, Down, Left, Right)
 * - Rating 2: 6 Spots (Up, Down, Left, Right, Upper Left, Lower Right)
 * - Rating 3: 8 Spots (Standard 3x3 perimeter)
 * - Rating 4: 10 Spots (Standard 3x3 perimeter [8 spots] PLUS Left and Right 2 plots away)
 * - Rating 5: 12 Spots (4x4 perimeter around the 2x2 bonsai core [x..x+1] x [y..y+1])
 */
export function getBonsaiHaloOffsets(rating: number): { dc: number; dr: number }[] {
  switch (rating) {
    case 1:
      return [
        { dc: 0, dr: -1 },
        { dc: 0, dr: 1 },
        { dc: -1, dr: 0 },
        { dc: 1, dr: 0 },
      ];
    case 2:
      return [
        { dc: 0, dr: -1 },
        { dc: 0, dr: 1 },
        { dc: -1, dr: 0 },
        { dc: 1, dr: 0 },
        { dc: -1, dr: -1 },
        { dc: 1, dr: 1 },
      ];
    case 3:
      return [
        { dc: -1, dr: -1 },
        { dc: 0, dr: -1 },
        { dc: 1, dr: -1 },
        { dc: -1, dr: 0 },
        { dc: 1, dr: 0 },
        { dc: -1, dr: 1 },
        { dc: 0, dr: 1 },
        { dc: 1, dr: 1 },
      ];
    case 4:
      return [
        { dc: -1, dr: -1 },
        { dc: 0, dr: -1 },
        { dc: 1, dr: -1 },
        { dc: -1, dr: 0 },
        { dc: 1, dr: 0 },
        { dc: -1, dr: 1 },
        { dc: 0, dr: 1 },
        { dc: 1, dr: 1 },
        { dc: -2, dr: 0 },
        { dc: 2, dr: 0 },
      ];
    case 5:
      return [
        // Top row (4 plots): (x-1, y-1), (x, y-1), (x+1, y-1), (x+2, y-1)
        { dc: -1, dr: -1 },
        { dc: 0, dr: -1 },
        { dc: 1, dr: -1 },
        { dc: 2, dr: -1 },
        // Bottom row (4 plots): (x-1, y+2), (x, y+2), (x+1, y+2), (x+2, y+2)
        { dc: -1, dr: 2 },
        { dc: 0, dr: 2 },
        { dc: 1, dr: 2 },
        { dc: 2, dr: 2 },
        // Left col (2 plots): (x-1, y), (x-1, y+1)
        { dc: -1, dr: 0 },
        { dc: -1, dr: 1 },
        // Right col (2 plots): (x+2, y), (x+2, y+1)
        { dc: 2, dr: 0 },
        { dc: 2, dr: 1 },
      ];
    default:
      return [
        { dc: 0, dr: -1 },
        { dc: 0, dr: 1 },
        { dc: -1, dr: 0 },
        { dc: 1, dr: 0 },
      ];
  }
}

/**
 * Returns absolute grid plot coordinates for a bonsai's halo zone.
 */
export function getBonsaiHaloPlots(
  col: number,
  row: number,
  rating: number,
  gridCols = 16,
  gridRows = 8,
): HaloPlotCoord[] {
  const offsets = getBonsaiHaloOffsets(rating);
  const result: HaloPlotCoord[] = [];
  for (const { dc, dr } of offsets) {
    const c = col + dc;
    const r = row + dr;
    if (c >= 0 && c < gridCols && r >= 0 && r < gridRows) {
      result.push({ col: c, row: r });
    }
  }
  return result;
}

/**
 * Resolves the numeric Maturity Rating (1 to 5) for a bonsai or seedling.
 */
export function getBonsaiMaturityRating(bonsai?: any): number {
  if (!bonsai) return 1;
  if (typeof bonsai.maturityRating === 'number') return bonsai.maturityRating;
  if (typeof bonsai.maturity === 'number') return bonsai.maturity;
  if (bonsai.maturity === 'premium' || (bonsai.level !== undefined && bonsai.level >= 21)) return 5;
  if (bonsai.maturity === 'refined') return 4;
  if (bonsai.maturity === 'notable') return 3;
  if (bonsai.maturity === 'sapling') return 2;
  return 1;
}

/**
 * Opaque solid colors matching the bonsai's Maturity Rating:
 * Rating 1 (Sprout): Emerald #10b981
 * Rating 2 (Sapling): Teal/Cyan #06b6d4
 * Rating 3 (Young): Blue #3b82f6
 * Rating 4 (Mature): Purple/Violet #8b5cf6
 * Rating 5 (Ancient / Master): Amber/Gold #f59e0b
 */
export function getMaturityBadgeColor(rating: number): string {
  switch (rating) {
    case 1:
      return '#38bdf8'; // I. Sprout (Baby Blue)
    case 2:
      return '#2dd4bf'; // II. Sapling (Turquoise)
    case 3:
      return '#34d399'; // III. Notable (Green)
    case 4:
      return '#a3e635'; // IV. Refined (Bright Green)
    case 5:
      return '#facc15'; // V. Premium (Golden Yellow)
    default:
      return '#38bdf8';
  }
}

/**
 * Real-time Sanctuary Grid Deployment placement preview state
 */
export interface GridPlacementPreview {
  category: 'seedling' | 'bonsai' | 'infrastructure' | 'decoration';
  payload: any;
  width: number;
  height: number;
  orientation: 'horizontal' | 'vertical'; // default 'horizontal'
  style?: GrowthStyle;
  nature?: BonsaiNature;
  bonsai?: any;
  data?: any;
  item?: any;
}

export const STYLE_ATTRIBUTE_WEIGHTS: Record<
  string,
  { foliage: number; branches: number; trunk: number; roots: number }
> = {
  chokan: { foliage: 1.1, branches: 1.0, trunk: 0.9, roots: 1.0 },
  moyogi: { foliage: 1.1, branches: 1.1, trunk: 0.9, roots: 0.9 },
  shakan: { foliage: 1.1, branches: 1.0, trunk: 1.0, roots: 0.9 },
  han_kengai: { foliage: 1.0, branches: 0.9, trunk: 1.0, roots: 1.1 },
  'han-kengai': { foliage: 1.0, branches: 0.9, trunk: 1.0, roots: 1.1 },
  sokan: { foliage: 0.9, branches: 1.0, trunk: 1.2, roots: 0.9 },
  kengai: { foliage: 1.0, branches: 0.8, trunk: 1.0, roots: 1.2 },
  kabudachi: { foliage: 1.0, branches: 1.2, trunk: 1.1, roots: 0.7 },

  CHOKAN: { foliage: 1.1, branches: 1.0, trunk: 0.9, roots: 1.0 },
  MOYOGI: { foliage: 1.1, branches: 1.1, trunk: 0.9, roots: 0.9 },
  SHAKAN: { foliage: 1.1, branches: 1.0, trunk: 1.0, roots: 0.9 },
  HAN_KENGAI: { foliage: 1.0, branches: 0.9, trunk: 1.0, roots: 1.1 },
  'HAN-KENGAI': { foliage: 1.0, branches: 0.9, trunk: 1.0, roots: 1.1 },
  SOKAN: { foliage: 0.9, branches: 1.0, trunk: 1.2, roots: 0.9 },
  KENGAI: { foliage: 1.0, branches: 0.8, trunk: 1.0, roots: 1.2 },
  KABUDACHI: { foliage: 1.0, branches: 1.2, trunk: 1.1, roots: 0.7 },
};

export function getStyleAttributeWeights(style?: string): {
  foliage: number;
  branches: number;
  trunk: number;
  roots: number;
} {
  if (!style) return STYLE_ATTRIBUTE_WEIGHTS.moyogi;
  const key = style.toLowerCase().replace('-', '_');
  return STYLE_ATTRIBUTE_WEIGHTS[key] || STYLE_ATTRIBUTE_WEIGHTS.moyogi;
}

export function formatStyleWeightsString(style?: string): string {
  const w = getStyleAttributeWeights(style);
  return `🍃 ${w.foliage.toFixed(1)} • 🪵 ${w.branches.toFixed(1)} • 🌲 ${w.trunk.toFixed(1)} • 🪴 ${w.roots.toFixed(1)}`;
}

export interface Bonsai {
  id: string;
  name: string;
  level: number;
  maturity?: string | number;
  leafType?: string;
  style?: string;
  group?: string;
  nature?: BonsaiNature | string;
  attributes?: BonsaiAttributes;
  geneticPotential?: BonsaiAttributes;
  cultivationPotential?: CultivationPotential;
  [key: string]: any;
}

export interface BaseAestheticResult {
  total: number;
  foliage: number;
  branches: number;
  trunk: number;
  roots: number;
  raw?: {
    foliage: number;
    branches: number;
    trunk: number;
    roots: number;
  };
  weights?: {
    foliage: number;
    branches: number;
    trunk: number;
    roots: number;
  };
}

/**
 * Standardized "Base Aesthetic" (BA) metric for all bonsais to make specimens
 * comparable across maturity ratings, genetics, cultivation, and levels.
 *
 * Step 1: Total Growth Pool (TGP)
 *   Max TGP for Level 100 bonsai by Maturity:
 *   Rank 1 (Sprout): 2000, Rank 2 (Sapling): 2200, Rank 3 (Notable): 2400,
 *   Rank 4 (Refined): 2800, Rank 5 (Premium): 3400.
 *   Scaled TGP = (maxTGP / 100) * level (Level 0 = 0 TGP).
 *
 * Step 2: Base Aesthetic per Attribute:
 *   BA_attr = (((TGP / 8) * (GP / 100)) + ((TGP / 8) * (CP / 1000))) * (NatureFactor + StyleWeight - 1)
 *   GP = 0-100, CP = 0-1000.
 *
 * Step 3: Nature Factor:
 *   Up = 1.1, Down = 0.9, Unaffected/Neutral = 1.0.
 *
 * Step 4: Attribute Style Weight:
 *   Chokan: Foliage 1.1, Branches 1.0, Trunk 0.9, Roots 1.0
 *   Moyogi: Foliage 1.1, Branches 1.1, Trunk 0.9, Roots 0.9
 *   Shakan: Foliage 1.1, Branches 1.0, Trunk 1.0, Roots 0.9
 *   Han-Kengai: Foliage 1.0, Branches 0.9, Trunk 1.0, Roots 1.1
 *   Sokan: Foliage 0.9, Branches 1.0, Trunk 1.2, Roots 0.9
 *   Kengai: Foliage 1.0, Branches 0.8, Trunk 1.0, Roots 1.2
 *   Kabudachi: Foliage 1.0, Branches 1.2, Trunk 1.1, Roots 0.7
 *   Multiplier = NatureFactor + StyleWeight - 1
 *
 * Step 5: Total BA = round(BA_Foliage + BA_Branches + BA_Trunk + BA_Roots).
 */
export function calculateBaseAesthetic(bonsai: Bonsai | any): BaseAestheticResult {
  const maxTGPMap: Record<number, number> = { 1: 2000, 2: 2200, 3: 2400, 4: 2800, 5: 3400 };

  const matRank =
    typeof bonsai.maturity === 'number'
      ? bonsai.maturity
      : bonsai.maturity === 'premium'
      ? 5
      : bonsai.maturity === 'refined'
      ? 4
      : bonsai.maturity === 'notable'
      ? 3
      : bonsai.maturity === 'sapling'
      ? 2
      : 1;

  const maxTGP = maxTGPMap[matRank] || 2000;
  const currentLevel = bonsai.level || 0;
  const currentTGP = (maxTGP / 100) * currentLevel;

  const natureName = typeof bonsai.nature === 'string' ? bonsai.nature : bonsai.nature?.name;

  const getNatureFactor = (attr: 'foliage' | 'branches' | 'trunk' | 'roots', name?: string): number => {
    if (!name) return 1.0;
    const nature = BONSAI_NATURES.find((n) => n.name.toLowerCase() === name.toLowerCase());
    if (!nature) return 1.0;
    const upAttr = (nature.upAttribute || (nature as any).up || '').toLowerCase();
    const downAttr = (nature.downAttribute || (nature as any).down || '').toLowerCase();
    if (upAttr === attr) return 1.1;
    if (downAttr === attr) return 0.9;
    return 1.0;
  };

  const styleWeights = getStyleAttributeWeights(bonsai.style);

  const attrs = ['foliage', 'branches', 'trunk', 'roots'] as const;
  const rawResult: Record<string, number> = {};
  const weightedResult: Record<string, number> = {};
  let sumWeighted = 0;

  const gpObj = bonsai.geneticPotential || bonsai.attributes || DEFAULT_BONSAI_ATTRIBUTES;
  const cpObj = bonsai.cultivationPotential || DEFAULT_CULTIVATION_POTENTIAL;

  attrs.forEach((attr) => {
    const gp = gpObj[attr] || 0;
    const cp = cpObj[attr] || 0;
    const natureFactor = getNatureFactor(attr, natureName);
    const styleWeight = styleWeights[attr] ?? 1.0;
    const combinedMultiplier = natureFactor + styleWeight - 1;
    const baseVal = (((currentTGP / 8) * (gp / 100)) + ((currentTGP / 8) * (cp / 1000)));
    const attrBA = baseVal * combinedMultiplier;
    rawResult[attr] = baseVal;
    weightedResult[attr] = attrBA;
    sumWeighted += attrBA;
  });

  return {
    total: Number(sumWeighted.toFixed(2)),
    foliage: Number((weightedResult.foliage || 0).toFixed(2)),
    branches: Number((weightedResult.branches || 0).toFixed(2)),
    trunk: Number((weightedResult.trunk || 0).toFixed(2)),
    roots: Number((weightedResult.roots || 0).toFixed(2)),
    raw: {
      foliage: Number((rawResult.foliage || 0).toFixed(2)),
      branches: Number((rawResult.branches || 0).toFixed(2)),
      trunk: Number((rawResult.trunk || 0).toFixed(2)),
      roots: Number((rawResult.roots || 0).toFixed(2)),
    },
    weights: {
      foliage: styleWeights.foliage,
      branches: styleWeights.branches,
      trunk: styleWeights.trunk,
      roots: styleWeights.roots,
    },
  };
}

/**
 * Visual styling theme per Genetic Potential attribute:
 * - Foliage: Vibrant Green
 * - Branches: Warm Yellow / Amber
 * - Trunk: Rich Rust / Red-Orange
 * - Roots: Calming Ocean Blue
 */
export const ATTRIBUTE_CONFIG = {
  foliage: {
    key: 'foliage' as const,
    name: 'Foliage',
    icon: '🍃',
    desc: 'Canopy density, vitality, and leaf luster',
    text: 'text-emerald-400',
    lightText: 'text-emerald-300',
    bg: 'bg-emerald-950/80',
    border: 'border-emerald-500/30',
    badgeBorder: 'border-emerald-500/50',
    badgeBg: 'bg-emerald-950/80',
    badgeText: 'text-emerald-300',
    bar: 'bg-gradient-to-r from-emerald-600 via-emerald-500 to-green-400',
    dot: 'bg-emerald-400',
    hex: '#22c55e',
  },
  branches: {
    key: 'branches' as const,
    name: 'Branches',
    icon: '🪵',
    desc: 'Symmetry, taper, and structural ramification',
    text: 'text-amber-400',
    lightText: 'text-amber-300',
    bg: 'bg-amber-950/80',
    border: 'border-amber-500/30',
    badgeBorder: 'border-amber-500/50',
    badgeBg: 'bg-amber-950/80',
    badgeText: 'text-amber-300',
    bar: 'bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-400',
    dot: 'bg-amber-400',
    hex: '#eab308',
  },
  trunk: {
    key: 'trunk' as const,
    name: 'Trunk',
    icon: '🌲',
    desc: 'Girth, bark texture, and artistic taper (Tachiagari)',
    text: 'text-rose-400',
    lightText: 'text-rose-300',
    bg: 'bg-rose-950/80',
    border: 'border-rose-500/30',
    badgeBorder: 'border-rose-500/50',
    badgeBg: 'bg-rose-950/80',
    badgeText: 'text-rose-300',
    bar: 'bg-gradient-to-r from-rose-600 via-rose-500 to-orange-400',
    dot: 'bg-rose-400',
    hex: '#ef4444',
  },
  roots: {
    key: 'roots' as const,
    name: 'Roots',
    icon: '🪴',
    desc: 'Radial anchor flare, health, and surface root spread (Nebari)',
    text: 'text-blue-400',
    lightText: 'text-blue-300',
    bg: 'bg-blue-950/80',
    border: 'border-blue-500/30',
    badgeBorder: 'border-blue-500/50',
    badgeBg: 'bg-blue-950/80',
    badgeText: 'text-blue-300',
    bar: 'bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-400',
    dot: 'bg-blue-400',
    hex: '#3b82f6',
  },
} as const;

export type AttributeKey = keyof typeof ATTRIBUTE_CONFIG;

/**
 * Maps numeric Genetic Potential percentages to descriptive tier labels.
 */
export function getAttributeTier(value: number): string {
  if (value >= 100) return 'Best (100%)';
  if (value >= 81) return 'Great (81-99%)';
  if (value >= 61) return 'Good (61-80%)';
  if (value >= 41) return 'Fine (41-60%)';
  if (value >= 21) return 'Decent (21-40%)';
  return 'Little (0-20%)';
}

export function getAttributeTierName(value: number): string {
  if (value >= 100) return 'Best';
  if (value >= 81) return 'Great';
  if (value >= 61) return 'Good';
  if (value >= 41) return 'Fine';
  if (value >= 21) return 'Decent';
  return 'Little';
}

export function getAttributeTierColor(value: number): {
  text: string;
  bg: string;
  border: string;
  bar: string;
} {
  if (value >= 100) {
    return {
      text: 'text-amber-300',
      bg: 'bg-amber-950/80',
      border: 'border-amber-400',
      bar: 'bg-gradient-to-r from-amber-400 to-yellow-300',
    };
  }
  if (value >= 81) {
    return {
      text: 'text-purple-300',
      bg: 'bg-purple-950/80',
      border: 'border-purple-400',
      bar: 'bg-gradient-to-r from-purple-500 to-fuchsia-400',
    };
  }
  if (value >= 61) {
    return {
      text: 'text-emerald-300',
      bg: 'bg-emerald-950/80',
      border: 'border-emerald-400',
      bar: 'bg-gradient-to-r from-emerald-500 to-teal-400',
    };
  }
  if (value >= 41) {
    return {
      text: 'text-sky-300',
      bg: 'bg-sky-950/80',
      border: 'border-sky-400',
      bar: 'bg-gradient-to-r from-sky-500 to-cyan-400',
    };
  }
  if (value >= 21) {
    return {
      text: 'text-orange-300',
      bg: 'bg-orange-950/80',
      border: 'border-orange-400',
      bar: 'bg-gradient-to-r from-orange-500 to-amber-400',
    };
  }
  return {
    text: 'text-slate-400',
    bg: 'bg-slate-900',
    border: 'border-slate-700',
    bar: 'bg-slate-500',
  };
}

/**
 * 16-Tier Discrete Precision Ladder for Excavation Digging Zones:
 * - Distance from center measured as a percentage of total digging area W (0% to 50% on each side)
 * - Base precision drops from 50% at center to -25% at perimeter edge
 */
export interface ExcavationTier {
  maxDistPct: number;
  base: number;
}

export const TIERS: ExcavationTier[] = [
  { maxDistPct: 0.5, base: 50 },
  { maxDistPct: 1.0, base: 45 },
  { maxDistPct: 2.0, base: 40 },
  { maxDistPct: 3.0, base: 35 },
  { maxDistPct: 4.5, base: 30 },
  { maxDistPct: 6.0, base: 25 },
  { maxDistPct: 8.0, base: 20 },
  { maxDistPct: 10.0, base: 15 },
  { maxDistPct: 12.5, base: 10 },
  { maxDistPct: 15.5, base: 5 },
  { maxDistPct: 19.0, base: 0 },
  { maxDistPct: 23.0, base: -5 },
  { maxDistPct: 28.0, base: -10 },
  { maxDistPct: 34.0, base: -15 },
  { maxDistPct: 41.0, base: -20 },
  { maxDistPct: 50.0, base: -25 },
];

export const EXCAVATION_PRECISION_TIERS = TIERS;

/**
 * Calculates hit precision based on discrete 16-tier ladder and Steady Hands skill bonus.
 * Formula for a hit: Math.max(0, Math.min(100, tierBasePrecision + skillBonus))
 * When a hit resolves to <= 0% precision, it is counted as strictly 0%.
 *
 * @param distPct Distance from center as a percentage of the total digging area W (0% to 50%)
 * @param steadyHandsLevel Rank of Steady Hands skill (0-5, granting +10% per rank)
 */
export function calculateExcavationPrecision(distPct: number, steadyHandsLevel = 0): number {
  const d = Math.max(0, distPct);
  let basePrecision = -25;
  for (const tier of TIERS) {
    if (d <= tier.maxDistPct) {
      basePrecision = tier.base;
      break;
    }
  }
  const skillBonus = (steadyHandsLevel || 0) * 10;
  return Math.max(0, Math.min(100, basePrecision + skillBonus));
}

/**
 * Backwards-compatible alias for calculateExcavationPrecision
 */
export function calculateHitPrecision(distPct: number, steadyHandsLevel = 0): number {
  return calculateExcavationPrecision(distPct, steadyHandsLevel);
}

/**
 * Dynamic Color Gradient (Green 100% -> Red 5% -> Grey <= 0%):
 * - If effective precision <= 0%: Render in Grey (#475569)
 * - If effective precision > 0%: Render using gradient from Green (100%) down to Red (5%):
 *   * 100%: Pure Green (#22c55e)
 *   * ~70-80%: Yellow-Green (#84cc16)
 *   * ~45-50%: Yellow/Amber (#eab308)
 *   * ~25-30%: Orange (#f97316)
 *   * 5%: Crimson Red (#ef4444)
 */
export function getPrecisionColor(effectivePrecision: number): string {
  if (effectivePrecision <= 0) {
    return '#475569';
  }

  const p = Math.max(5, Math.min(100, effectivePrecision));

  if (p >= 75) {
    // 75% -> 100%: Yellow-Green (132, 204, 22) -> Pure Green (34, 197, 94)
    const t = (p - 75) / 25;
    const r = Math.round(132 + t * (34 - 132));
    const g = Math.round(204 + t * (197 - 204));
    const b = Math.round(22 + t * (94 - 22));
    return `rgb(${r}, ${g}, ${b})`;
  } else if (p >= 50) {
    // 50% -> 75%: Yellow/Amber (234, 179, 8) -> Yellow-Green (132, 204, 22)
    const t = (p - 50) / 25;
    const r = Math.round(234 + t * (132 - 234));
    const g = Math.round(179 + t * (204 - 179));
    const b = Math.round(8 + t * (22 - 8));
    return `rgb(${r}, ${g}, ${b})`;
  } else if (p >= 25) {
    // 25% -> 50%: Orange (249, 115, 22) -> Yellow/Amber (234, 179, 8)
    const t = (p - 25) / 25;
    const r = Math.round(249 + t * (234 - 249));
    const g = Math.round(115 + t * (179 - 115));
    const b = Math.round(22 + t * (8 - 22));
    return `rgb(${r}, ${g}, ${b})`;
  } else {
    // 5% -> 25%: Crimson Red (239, 68, 68) -> Orange (249, 115, 22)
    const t = (p - 5) / 20;
    const r = Math.round(239 + t * (249 - 239));
    const g = Math.round(68 + t * (115 - 68));
    const b = Math.round(68 + t * (22 - 68));
    return `rgb(${r}, ${g}, ${b})`;
  }
}

export function getExcavationArcColor(effectivePrecision: number): string {
  return getPrecisionColor(effectivePrecision);
}

/**
 * Distributes Genetic Potential across the 4 attributes using:
 * (“Attribute random number, between 0-31” / ”Sum of all Attribute random numbers, total must be between 0-124”) * (“Precision Average” * 4).
 * All 4 random numbers are generated independently in [0, 31] and summed before formula is run.
 * If any attribute exceeds 100%, clamp to 100% and redistribute the excess surplus proportionally to the other attributes below 100%,
 * preserving the player's true average score without loss (sum of 4 attributes === precisionAvg * 4).
 */
export function calculateBonsaiAttributes(precisions: number[]): {
  averagePrecision: number;
  attributes: BonsaiAttributes;
} {
  const avg =
    precisions.length > 0
      ? precisions.reduce((a, b) => a + b, 0) / precisions.length
      : 50;
  const roundedAvg = Math.round(avg);

  // Generate true discrete integer in [0, 31] inclusive for each attribute independently
  let rFoliage = Math.floor(Math.random() * 32);
  let rBranches = Math.floor(Math.random() * 32);
  let rTrunk = Math.floor(Math.random() * 32);
  let rRoots = Math.floor(Math.random() * 32);

  let sum = rFoliage + rBranches + rTrunk + rRoots;
  if (sum === 0) {
    rFoliage = 1;
    sum = 1;
  }

  const totalPool = roundedAvg * 4;

  const rawFoliage = (rFoliage / sum) * totalPool;
  const rawBranches = (rBranches / sum) * totalPool;
  const rawTrunk = (rTrunk / sum) * totalPool;
  const rawRoots = (rRoots / sum) * totalPool;

  const vals = [rawFoliage, rawBranches, rawTrunk, rawRoots];

  // Distribute excess surplus if any attribute exceeds 100%
  for (let iter = 0; iter < 10; iter++) {
    let excess = 0;
    let underSum = 0;
    let underCount = 0;

    for (let i = 0; i < 4; i++) {
      if (vals[i] > 100) {
        excess += vals[i] - 100;
        vals[i] = 100;
      } else if (vals[i] < 100) {
        underSum += vals[i];
        underCount++;
      }
    }

    if (excess <= 0.0001 || underCount === 0) break;

    for (let i = 0; i < 4; i++) {
      if (vals[i] < 100) {
        if (underSum > 0) {
          vals[i] += excess * (vals[i] / underSum);
        } else {
          vals[i] += excess / underCount;
        }
      }
    }
  }

  // Discrete integer rounding while strictly preserving sum === totalPool
  const intVals = vals.map((v) => Math.min(100, Math.max(0, Math.round(v))));
  let diff = totalPool - intVals.reduce((a, b) => a + b, 0);

  if (diff !== 0) {
    // Sort indices by rounding delta
    const order = [0, 1, 2, 3].sort(
      (a, b) => (vals[b] - intVals[b]) - (vals[a] - intVals[a]),
    );
    for (const idx of order) {
      if (diff === 0) break;
      if (diff > 0 && intVals[idx] < 100) {
        const add = Math.min(diff, 100 - intVals[idx]);
        intVals[idx] += add;
        diff -= add;
      } else if (diff < 0 && intVals[idx] > 0) {
        const sub = Math.min(-diff, intVals[idx]);
        intVals[idx] -= sub;
        diff += sub;
      }
    }
  }

  return {
    averagePrecision: roundedAvg,
    attributes: {
      foliage: intVals[0],
      branches: intVals[1],
      trunk: intVals[2],
      roots: intVals[3],
    },
  };
}

