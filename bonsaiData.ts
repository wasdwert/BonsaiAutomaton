import {
  calculateBaseAesthetic,
  getBonsaiHaloOffsets,
  getBonsaiHaloPlots,
  getBonsaiMaturityRating,
  getMaturityBadgeColor,
} from './types';
export {
  calculateBaseAesthetic,
  getBonsaiHaloOffsets,
  getBonsaiHaloPlots,
  getBonsaiMaturityRating,
  getMaturityBadgeColor,
};

export type BonsaiLeafType =
  | 'circle'
  | 'oval'
  | 'circle_hole'
  | 'raindrop'
  | 'fire'
  | 'cloud'
  | 'hexagon'
  | 'star'
  | 'snowflake'
  | 'feather'
  | 'snail'
  | 'eye'
  | 'triangle'
  | 'arrow'
  | 'shield'
  | 'diamond'
  | 'cube'
  | 'rectangle'
  | 'gear'
  | 'bell';

export type BonsaiGroup =
  | 'Raundo'
  | 'Erementaru'
  | 'Roku-men'
  | 'Seikatsu'
  | 'Sanmen'
  | 'Shihen'
  | 'Jinkō-teki';

export type BonsaiStyle =
  | 'CHOKAN'
  | 'MOYOGI'
  | 'SHAKAN'
  | 'HAN_KENGAI'
  | 'SOKAN'
  | 'KENGAI'
  | 'KABUDACHI'
  | 'chokan'
  | 'moyogi'
  | 'shakan'
  | 'han_kengai'
  | 'sokan'
  | 'kengai'
  | 'kabudachi';
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

export const ALL_BONSAI_STYLES: BonsaiStyle[] = [
  'CHOKAN',
  'MOYOGI',
  'SHAKAN',
  'HAN_KENGAI',
  'SOKAN',
  'KENGAI',
  'KABUDACHI',
];

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
export type BonsaiRarity = 'COMMON' | 'UNCOMMON' | 'RARE' | 'ANCIENT' | 'MYTHIC';
export type MaturityTier = 'sprout' | 'sapling' | 'notable' | 'refined' | 'premium';

export interface MaturityDefinition {
  id: MaturityTier;
  kanji: string;
  name: string;
  rank: number;
  color: string;
  bg: string;
  border: string;
  multiplier: number;
  growthMultiplier: number;
  baseCareRate: number;
  description: string;
}

export const MATURITY_GROWTH_MULTIPLIERS: Record<MaturityTier, number> = {
  sprout: 1.0,
  sapling: 1.4,
  notable: 2.0,
  refined: 2.8,
  premium: 4.0,
};

export const MATURITY_CONFIGS: Record<MaturityTier, MaturityDefinition> = {
  sprout: {
    id: 'sprout',
    kanji: '一',
    name: 'Sprout',
    rank: 1,
    color: '#38bdf8',
    bg: 'rgba(56, 189, 248, 0.2)',
    border: '#38bdf8',
    multiplier: 1.0,
    growthMultiplier: 1.0,
    baseCareRate: 1.0,
    description: 'Freshly germinated root specimen with vibrant vitality. 1.0x baseline growth needed to level.',
  },
  sapling: {
    id: 'sapling',
    kanji: '二',
    name: 'Sapling',
    rank: 2,
    color: '#2dd4bf',
    bg: 'rgba(45, 212, 191, 0.2)',
    border: '#2dd4bf',
    multiplier: 1.2,
    growthMultiplier: 1.4,
    baseCareRate: 1.0,
    description: 'Developing wood fiber showing balanced poise. 1.4x growth needed to advance levels.',
  },
  notable: {
    id: 'notable',
    kanji: '三',
    name: 'Notable',
    rank: 3,
    color: '#34d399',
    bg: 'rgba(52, 211, 153, 0.2)',
    border: '#34d399',
    multiplier: 1.5,
    growthMultiplier: 2.0,
    baseCareRate: 1.0,
    description: 'Distinguished botanical form with pronounced bark texture. 2.0x growth needed to advance levels.',
  },
  refined: {
    id: 'refined',
    kanji: '四',
    name: 'Refined',
    rank: 4,
    color: '#a3e635',
    bg: 'rgba(163, 230, 53, 0.2)',
    border: '#a3e635',
    multiplier: 2.0,
    growthMultiplier: 2.8,
    baseCareRate: 1.0,
    description: 'Masterfully structured natural posture possessing remarkable poise. 2.8x growth needed to advance levels.',
  },
  premium: {
    id: 'premium',
    kanji: '五',
    name: 'Premium',
    rank: 5,
    color: '#facc15',
    bg: 'rgba(250, 204, 21, 0.25)',
    border: '#facc15',
    multiplier: 3.0,
    growthMultiplier: 4.0,
    baseCareRate: 1.0,
    description: 'Legendary pinnacle specimen radiating golden prestige. 4.0x growth needed for deepest late-game cultivation challenge.',
  },
};

export function getMaturityDef(maturity?: MaturityTier | string): MaturityDefinition {
  if (maturity && maturity in MATURITY_CONFIGS) {
    return MATURITY_CONFIGS[maturity as MaturityTier];
  }
  return MATURITY_CONFIGS['sprout'];
}

export function getMaturityGrowthMultiplier(maturity?: MaturityTier | string): number {
  if (maturity && maturity in MATURITY_GROWTH_MULTIPLIERS) {
    return MATURITY_GROWTH_MULTIPLIERS[maturity as MaturityTier];
  }
  return 1.0;
}

export function getBonsaiLevelGrowthNeeded(level: number, maturity?: MaturityTier | string): number {
  const baseGrowthNeeded = 6 * Math.pow(1.07, Math.max(1, level) - 1);
  return baseGrowthNeeded * getMaturityGrowthMultiplier(maturity);
}

/**
 * Exact Biome Discovery Distributions
 */
export const AREA_SPECIES_DISTRIBUTION: Record<string, Partial<Record<BonsaiLeafType, number>>> = {
  FOOTHILLS: {
    circle: 0.24,
    oval: 0.10,
    raindrop: 0.23,
    fire: 0.10,
    hexagon: 0.23,
    star: 0.10,
  },
  HIGHLANDS: {
    circle: 0.20,
    circle_hole: 0.04,
    raindrop: 0.20,
    cloud: 0.04,
    snowflake: 0.04,
    feather: 0.20,
    snail: 0.08,
    triangle: 0.08,
    arrow: 0.12,
  },
  OVERGROWTH: {
    fire: 0.14,
    hexagon: 0.23,
    snowflake: 0.04,
    eye: 0.04,
    shield: 0.09,
    diamond: 0.08,
    cube: 0.15,
    rectangle: 0.06,
    gear: 0.06,
    bell: 0.11,
  },
};

export function getSpeciesAreaProbability(biomeId: string, leafType: BonsaiLeafType): number {
  const areaTable = AREA_SPECIES_DISTRIBUTION[biomeId] || AREA_SPECIES_DISTRIBUTION['FOOTHILLS'];
  return areaTable[leafType] ?? 0.04;
}

/**
 * Returns the highest encounter probability percentage for a species in its native wilderness biomes.
 */
export function getSpeciesFindOdds(leafType?: BonsaiLeafType): number {
  if (!leafType) return 25;
  let maxOdds = 0;
  for (const dist of Object.values(AREA_SPECIES_DISTRIBUTION)) {
    const p = dist[leafType];
    if (p !== undefined && p > maxOdds) {
      maxOdds = p;
    }
  }
  return maxOdds > 0 ? Math.round(maxOdds * 100) : 25;
}

/**
 * Exact Formula for Bonsai Valuation with Baseprice = 1:
 * Donation Value = Baseprice * SpeciesFindOddsMultiplier * MaturityRatingMultiplier * LevelMultiplier
 * - Baseprice: 1
 * - SpeciesFindOddsMultiplier: 1.8 for 33% odds, +0.1 per -1% odds decrease (up to 5.0 for 1% odds).
 *   Formula: Math.min(5.0, 1.8 + Math.max(0, 33 - oddsPercent) * 0.1).
 * - MaturityRatingMultiplier:
 *   Rating 1: 1.0, Rating 2: 1.2, Rating 3: 1.5, Rating 4: 2.0, Rating 5: 3.0.
 * - LevelMultiplier: 1.0 + level * 0.05 (Level 1 = 1.05, Level 100 = 6.00).
 * - Rounding: Strictly rounded DOWN to two decimal places: Math.floor(value * 100) / 100.
 * (Maximum specimen donation value = 1 * 5.0 * 3.0 * 6.0 = 90.00 Verdure).
 */
export function calculateDonationValue(bonsai: {
  leafType?: BonsaiLeafType;
  maturity?: MaturityTier | number;
  maturityRating?: number;
  level?: number;
  findOdds?: number;
  foundOdds?: number;
  [key: string]: any;
}): number {
  const basePrice = 1.0;

  // Species Find Odds Multiplier
  const oddsPercent = bonsai.findOdds ?? bonsai.foundOdds ?? getSpeciesFindOdds(bonsai.leafType);
  const speciesFindOddsMultiplier = Math.min(5.0, 1.8 + Math.max(0, 33 - oddsPercent) * 0.1);

  // Maturity Rating Multiplier
  const rating = getBonsaiMaturityRating(bonsai);
  const maturityMultipliers: Record<number, number> = {
    1: 1.0,
    2: 1.2,
    3: 1.5,
    4: 2.0,
    5: 3.0,
  };
  const maturityRatingMultiplier = maturityMultipliers[rating] ?? 1.0;

  // Level Multiplier (Level 1 = 1.05, Level 100 = 6.00)
  const level = bonsai.level ?? 1;
  const levelMultiplier = 1.0 + level * 0.05;

  const rawValue = basePrice * speciesFindOddsMultiplier * maturityRatingMultiplier * levelMultiplier;
  const roundedValue = Math.floor(rawValue * 100) / 100;
  return roundedValue;
}

export const calculateBonsaiSellPrice = calculateDonationValue;
export const calculateBonsaiValue = calculateDonationValue;

export interface LeafTypeDefinition {
  id: BonsaiLeafType;
  name: string;
  leafShapeName: string;
  group: BonsaiGroup;
  groupLabel: string;
  groupKanji: string;
  rarity: BonsaiRarity;
  color: string;
  accentColor: string;
  kanji: string;
  japanese: string;
  description: string;
  icon: string;
  digSpots: number;
  digExp: number;
}

export const BONSAI_GROUPS: Record<
  BonsaiGroup,
  {
    name: string;
    english: string;
    kanji: string;
    description: string;
    themeColor: string;
    leafTypes: BonsaiLeafType[];
  }
> = {
  Raundo: {
    name: 'Raundo',
    english: 'Round',
    kanji: '円象',
    description: 'Harmonious continuous curved foliage representing wholeness, zen serenity, and infinite cycles.',
    themeColor: '#10b981',
    leafTypes: ['circle', 'oval', 'circle_hole'],
  },
  Erementaru: {
    name: 'Erementaru',
    english: 'Elemental',
    kanji: '自然元',
    description: 'Dynamic natural manifestations shaped by fluid droplets, floating clouds, and dancing embers.',
    themeColor: '#f97316',
    leafTypes: ['raindrop', 'fire', 'cloud'],
  },
  'Roku-men': {
    name: 'Roku-men',
    english: 'Six-sides',
    kanji: '六面界',
    description: 'Sacred hexagonal geometry, crystalline snowflakes, and celestial starburst aster foliage.',
    themeColor: '#a855f7',
    leafTypes: ['hexagon', 'star', 'snowflake'],
  },
  Seikatsu: {
    name: 'Seikatsu',
    english: 'Life / Nature',
    kanji: '生活界',
    description: 'Living organic patterns inspired by airy feathers, spiral snail shells, and playful comic eyes.',
    themeColor: '#06b6d4',
    leafTypes: ['feather', 'snail', 'eye'],
  },
  Sanmen: {
    name: 'Sanmen',
    english: 'Three-faces / Points',
    kanji: '三面界',
    description: 'Directional pointed geometries featuring triangles, arrows, shields, and sparkling diamonds.',
    themeColor: '#3b82f6',
    leafTypes: ['triangle', 'arrow', 'shield', 'diamond'],
  },
  Shihen: {
    name: 'Shihen',
    english: 'Four-sides / Orthogonal',
    kanji: '四辺界',
    description: 'Clean orthogonal forms and isometric three-dimensional block and cube structures.',
    themeColor: '#6366f1',
    leafTypes: ['cube', 'rectangle'],
  },
  'Jinkō-teki': {
    name: 'Jinkō-teki',
    english: 'Artificial / Crafted',
    kanji: '人工的',
    description: 'Artisanal mechanical and resonant artifacts shaped as toothed gears and flared temple bells.',
    themeColor: '#eab308',
    leafTypes: ['gear', 'bell'],
  },
};

export interface SpeciesPaletteEntry {
  base: string;
  highlight: string;
  shadow: string;
}

/**
 * Harmonized botanical leaf color palette across all 20 species
 */
export const SPECIES_PALETTE: Record<BonsaiLeafType, SpeciesPaletteEntry> = {
  circle: { base: '#33CC33', highlight: '#70E670', shadow: '#1F8A1F' },
  oval: { base: '#00B050', highlight: '#33D67A', shadow: '#007A38' },
  circle_hole: { base: '#CCCC00', highlight: '#FFFF4D', shadow: '#8F8F00' },
  raindrop: { base: '#CCFF33', highlight: '#E6FF80', shadow: '#8FB324' },
  fire: { base: '#00CC99', highlight: '#33FFCC', shadow: '#008F6B' },
  cloud: { base: '#99FFCC', highlight: '#E0FFF2', shadow: '#66B38F' },
  hexagon: { base: '#99CC00', highlight: '#C2F033', shadow: '#6B8F00' },
  star: { base: '#00FF99', highlight: '#66FFC2', shadow: '#00B36B' },
  snowflake: { base: '#CC9900', highlight: '#FFCC33', shadow: '#8F6B00' },
  feather: { base: '#92D050', highlight: '#B8E685', shadow: '#669238' },
  snail: { base: '#00B050', highlight: '#33D67A', shadow: '#007A38' },
  eye: { base: '#CCCC00', highlight: '#FFFF4D', shadow: '#8F8F00' },
  triangle: { base: '#00CC99', highlight: '#33FFCC', shadow: '#008F6B' },
  arrow: { base: '#33CC33', highlight: '#70E670', shadow: '#1F8A1F' },
  shield: { base: '#CCFF33', highlight: '#E6FF80', shadow: '#8FB324' },
  diamond: { base: '#99FFCC', highlight: '#E0FFF2', shadow: '#66B38F' },
  cube: { base: '#00B050', highlight: '#33D67A', shadow: '#007A38' },
  rectangle: { base: '#99CC00', highlight: '#C2F033', shadow: '#6B8F00' },
  gear: { base: '#00FF99', highlight: '#66FFC2', shadow: '#00B36B' },
  bell: { base: '#92D050', highlight: '#B8E685', shadow: '#669238' },
};

export const LEAF_TYPE_CONFIGS: Record<BonsaiLeafType, LeafTypeDefinition> = {
  // Raundo
  circle: {
    id: 'circle',
    name: 'Pristine Circle Bonsai',
    leafShapeName: 'Spherical Orb',
    group: 'Raundo',
    groupLabel: 'Raundo (Round)',
    groupKanji: '円形',
    rarity: 'COMMON',
    color: SPECIES_PALETTE.circle.base,
    accentColor: SPECIES_PALETTE.circle.highlight,
    kanji: '円',
    japanese: 'En-maru',
    description: 'Pristine spherical orb foliage pads symbolizing wholeness, serenity, and continuous life flow.',
    icon: '🟢',
    digSpots: 2,
    digExp: 40,
  },
  oval: {
    id: 'oval',
    name: 'Horizontal Oval Bonsai',
    leafShapeName: 'Elongated Cloud',
    group: 'Raundo',
    groupLabel: 'Raundo (Round)',
    groupKanji: '楕円',
    rarity: 'UNCOMMON',
    color: SPECIES_PALETTE.oval.base,
    accentColor: SPECIES_PALETTE.oval.highlight,
    kanji: '楕',
    japanese: 'Da-en',
    description: 'Elongated horizontal cloud foliage clusters floating peacefully across staggered boughs.',
    icon: '☁️',
    digSpots: 3,
    digExp: 60,
  },
  circle_hole: {
    id: 'circle_hole',
    name: 'Ring Donut Bonsai',
    leafShapeName: 'Ring with Center Hole',
    group: 'Raundo',
    groupLabel: 'Raundo (Round)',
    groupKanji: '円環',
    rarity: 'RARE',
    color: SPECIES_PALETTE.circle_hole.base,
    accentColor: SPECIES_PALETTE.circle_hole.highlight,
    kanji: '環',
    japanese: 'En-kan',
    description: 'Concentric ring torus foliage with a negative zen aperture in its center.',
    icon: '🔘',
    digSpots: 4,
    digExp: 90,
  },

  // Erementaru
  raindrop: {
    id: 'raindrop',
    name: 'Tapered Raindrop Bonsai',
    leafShapeName: 'Teardrop Dew',
    group: 'Erementaru',
    groupLabel: 'Erementaru (Elemental)',
    groupKanji: '雨滴',
    rarity: 'RARE',
    color: SPECIES_PALETTE.raindrop.base,
    accentColor: SPECIES_PALETTE.raindrop.highlight,
    kanji: '雫',
    japanese: 'Shizuku',
    description: 'Teardrop-shaped foliage with tapered apex, channeling dew nourishment and mountain rain.',
    icon: '💧',
    digSpots: 4,
    digExp: 80,
  },
  fire: {
    id: 'fire',
    name: 'Dancing Flame Bonsai',
    leafShapeName: 'Flame Crest',
    group: 'Erementaru',
    groupLabel: 'Erementaru (Elemental)',
    groupKanji: '火炎',
    rarity: 'ANCIENT',
    color: SPECIES_PALETTE.fire.base,
    accentColor: SPECIES_PALETTE.fire.highlight,
    kanji: '炎',
    japanese: 'Homura',
    description: 'Dancing multi-pointed flame crest foliage radiating vibrant warmth and spiritual vitality.',
    icon: '🔥',
    digSpots: 5,
    digExp: 120,
  },
  cloud: {
    id: 'cloud',
    name: 'Cumulus Cloud Bonsai',
    leafShapeName: 'Puffy Cloud',
    group: 'Erementaru',
    groupLabel: 'Erementaru (Elemental)',
    groupKanji: '雲象',
    rarity: 'RARE',
    color: SPECIES_PALETTE.cloud.base,
    accentColor: SPECIES_PALETTE.cloud.highlight,
    kanji: '雲',
    japanese: 'Kumo',
    description: 'Billowing puffy cumulus cloud foliage pads softly resting upon balanced boughs.',
    icon: '⛅',
    digSpots: 4,
    digExp: 95,
  },

  // Roku-men
  hexagon: {
    id: 'hexagon',
    name: 'Geometric Hexagon Bonsai',
    leafShapeName: 'Hexagonal Plate',
    group: 'Roku-men',
    groupLabel: 'Roku-men (Six-sides)',
    groupKanji: '六角',
    rarity: 'ANCIENT',
    color: SPECIES_PALETTE.hexagon.base,
    accentColor: SPECIES_PALETTE.hexagon.highlight,
    kanji: '六',
    japanese: 'Rokkaku',
    description: 'Faceted geometric hexagonal foliage plates embodying structural precision and sacred geometry.',
    icon: '⬡',
    digSpots: 5,
    digExp: 140,
  },
  star: {
    id: 'star',
    name: 'Six-Pointed Star Bonsai',
    leafShapeName: 'Starburst Aster',
    group: 'Roku-men',
    groupLabel: 'Roku-men (Six-sides)',
    groupKanji: '星芒',
    rarity: 'MYTHIC',
    color: SPECIES_PALETTE.star.base,
    accentColor: SPECIES_PALETTE.star.highlight,
    kanji: '星',
    japanese: 'Hoshikuzu',
    description: 'Legendary 6-pointed aster starburst linear foliage glowing with radiant astral brilliance.',
    icon: '⭐',
    digSpots: 6,
    digExp: 200,
  },
  snowflake: {
    id: 'snowflake',
    name: 'Crystalline Snowflake Bonsai',
    leafShapeName: 'Ice Crystal',
    group: 'Roku-men',
    groupLabel: 'Roku-men (Six-sides)',
    groupKanji: '雪花',
    rarity: 'ANCIENT',
    color: SPECIES_PALETTE.snowflake.base,
    accentColor: SPECIES_PALETTE.snowflake.highlight,
    kanji: '雪',
    japanese: 'Yukibana',
    description: 'Delicate six-armed ice crystal star foliage radiating intricate branching symmetry.',
    icon: '❄️',
    digSpots: 5,
    digExp: 150,
  },

  // Seikatsu
  feather: {
    id: 'feather',
    name: 'Airy Feather Bonsai',
    leafShapeName: 'Quill Vane',
    group: 'Seikatsu',
    groupLabel: 'Seikatsu (Life / Nature)',
    groupKanji: '羽毛',
    rarity: 'UNCOMMON',
    color: SPECIES_PALETTE.feather.base,
    accentColor: SPECIES_PALETTE.feather.highlight,
    kanji: '羽',
    japanese: 'Hane',
    description: 'Stylized airy quill shaft with sleek diagonal feather barbs swaying gently in mountain winds.',
    icon: '🪶',
    digSpots: 3,
    digExp: 75,
  },
  snail: {
    id: 'snail',
    name: 'Nautilus Snail Bonsai',
    leafShapeName: 'Spiral Shell',
    group: 'Seikatsu',
    groupLabel: 'Seikatsu (Life / Nature)',
    groupKanji: '蝸牛',
    rarity: 'RARE',
    color: SPECIES_PALETTE.snail.base,
    accentColor: SPECIES_PALETTE.snail.highlight,
    kanji: '螺',
    japanese: 'Maimai',
    description: 'Curved spiral whorl shell foliage illustrating nature’s sacred golden ratio spiral.',
    icon: '🐌',
    digSpots: 4,
    digExp: 85,
  },
  eye: {
    id: 'eye',
    name: 'Comic Eye Bonsai',
    leafShapeName: 'Playful Eye Iris',
    group: 'Seikatsu',
    groupLabel: 'Seikatsu (Life / Nature)',
    groupKanji: '眼目',
    rarity: 'ANCIENT',
    color: SPECIES_PALETTE.eye.base,
    accentColor: SPECIES_PALETTE.eye.highlight,
    kanji: '瞳',
    japanese: 'Hitomi',
    description: 'Playful cartoon almond foliage pad featuring an inquisitive dark pupil and glossy highlight.',
    icon: '👁️',
    digSpots: 5,
    digExp: 130,
  },

  // Sanmen
  triangle: {
    id: 'triangle',
    name: 'Rounded Triangle Bonsai',
    leafShapeName: 'Soft Delta',
    group: 'Sanmen',
    groupLabel: 'Sanmen (Three-faces)',
    groupKanji: '三角',
    rarity: 'COMMON',
    color: SPECIES_PALETTE.triangle.base,
    accentColor: SPECIES_PALETTE.triangle.highlight,
    kanji: '三',
    japanese: 'Sankaku',
    description: 'Soft three-cornered rounded delta foliage pads embodying stability and three-way balance.',
    icon: '🔺',
    digSpots: 3,
    digExp: 65,
  },
  arrow: {
    id: 'arrow',
    name: 'Chevron Arrow Bonsai',
    leafShapeName: 'Arrowhead Chevron',
    group: 'Sanmen',
    groupLabel: 'Sanmen (Three-faces)',
    groupKanji: '矢羽',
    rarity: 'UNCOMMON',
    color: SPECIES_PALETTE.arrow.base,
    accentColor: SPECIES_PALETTE.arrow.highlight,
    kanji: '矢',
    japanese: 'Yajirushi',
    description: 'Dynamic upward pointing arrowhead chevron foliage pads directing chi towards the heavens.',
    icon: '🏹',
    digSpots: 3,
    digExp: 70,
  },
  shield: {
    id: 'shield',
    name: 'Heater Shield Bonsai',
    leafShapeName: 'Heraldic Heater Shield',
    group: 'Sanmen',
    groupLabel: 'Sanmen (Three-faces)',
    groupKanji: '防盾',
    rarity: 'RARE',
    color: SPECIES_PALETTE.shield.base,
    accentColor: SPECIES_PALETTE.shield.highlight,
    kanji: '盾',
    japanese: 'Tate',
    description: 'Classic heraldic curved heater shield foliage with flat top crest and pointed base.',
    icon: '🛡️',
    digSpots: 4,
    digExp: 100,
  },
  diamond: {
    id: 'diamond',
    name: 'Rhombus Diamond Bonsai',
    leafShapeName: 'Faceted Rhombus',
    group: 'Sanmen',
    groupLabel: 'Sanmen (Three-faces)',
    groupKanji: '菱形',
    rarity: 'RARE',
    color: SPECIES_PALETTE.diamond.base,
    accentColor: SPECIES_PALETTE.diamond.highlight,
    kanji: '菱',
    japanese: 'Hishigata',
    description: 'Sharp 4-point diamond rhombus facet foliage reflecting pristine crystalline clarity.',
    icon: '💎',
    digSpots: 4,
    digExp: 110,
  },

  // Shihen
  cube: {
    id: 'cube',
    name: 'Isometric Cube Bonsai',
    leafShapeName: '3D Box Cube',
    group: 'Shihen',
    groupLabel: 'Shihen (Four-sides)',
    groupKanji: '立体',
    rarity: 'RARE',
    color: SPECIES_PALETTE.cube.base,
    accentColor: SPECIES_PALETTE.cube.highlight,
    kanji: '箱',
    japanese: 'Rittai',
    description: 'Isometric 3D outlined box/cube foliage pads with three distinct shaded facets.',
    icon: '🧊',
    digSpots: 4,
    digExp: 115,
  },
  rectangle: {
    id: 'rectangle',
    name: 'Orthogonal Brick Bonsai',
    leafShapeName: 'Rounded Rectangle',
    group: 'Shihen',
    groupLabel: 'Shihen (Four-sides)',
    groupKanji: '長方',
    rarity: 'UNCOMMON',
    color: SPECIES_PALETTE.rectangle.base,
    accentColor: SPECIES_PALETTE.rectangle.highlight,
    kanji: '矩',
    japanese: 'Chōhō',
    description: 'Clean vertical and orthogonal brick-block foliage pads showcasing architectural poise.',
    icon: '🧱',
    digSpots: 3,
    digExp: 75,
  },

  // Jinkō-teki
  gear: {
    id: 'gear',
    name: 'Mechanical Gear Bonsai',
    leafShapeName: 'Toothed Cogwheel',
    group: 'Jinkō-teki',
    groupLabel: 'Jinkō-teki (Crafted)',
    groupKanji: '歯車',
    rarity: 'RARE',
    color: SPECIES_PALETTE.gear.base,
    accentColor: SPECIES_PALETTE.gear.highlight,
    kanji: '輪',
    japanese: 'Haguruma',
    description: 'Circular disc foliage with 6 protruding square gear teeth reflecting automata synergy.',
    icon: '⚙️',
    digSpots: 4,
    digExp: 105,
  },
  bell: {
    id: 'bell',
    name: 'Temple Bell Bonsai',
    leafShapeName: 'Resonant Bell Dome',
    group: 'Jinkō-teki',
    groupLabel: 'Jinkō-teki (Crafted)',
    groupKanji: '梵鐘',
    rarity: 'ANCIENT',
    color: SPECIES_PALETTE.bell.base,
    accentColor: SPECIES_PALETTE.bell.highlight,
    kanji: '鐘',
    japanese: 'Bonshō',
    description: 'Arched dome temple bell silhouette with flared rim and resonant bottom clapper.',
    icon: '🔔',
    digSpots: 5,
    digExp: 135,
  },
};

export function getLeafTypeDef(type?: string): LeafTypeDefinition {
  if (type && type in LEAF_TYPE_CONFIGS) {
    return LEAF_TYPE_CONFIGS[type as BonsaiLeafType];
  }
  return LEAF_TYPE_CONFIGS['circle'];
}

export function getBonsaiGroup(type?: string): BonsaiGroup {
  return getLeafTypeDef(type).group;
}

/**
 * Procedural leaf canopy drawing onto a foliage pad cluster:
 * Supports all 20 leaf types cleanly without external assets!
 */
export function drawLeafShape(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  leafType: BonsaiLeafType,
  color: string,
  accentColor: string,
) {
  const r = Math.max(3, radius);
  ctx.save();

  if (leafType === 'circle') {
    // 1. CIRCLE
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = accentColor;
    ctx.beginPath();
    ctx.arc(cx - r * 0.25, cy - r * 0.25, r * 0.55, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.beginPath();
    ctx.arc(cx - r * 0.35, cy - r * 0.35, r * 0.2, 0, Math.PI * 2);
    ctx.fill();
  } else if (leafType === 'oval') {
    // 2. OVAL
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(cx, cy, r * 1.55, r * 0.72, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = accentColor;
    ctx.beginPath();
    ctx.ellipse(cx - r * 0.4, cy - r * 0.15, r * 0.9, r * 0.45, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.beginPath();
    ctx.ellipse(cx + r * 0.2, cy - r * 0.2, r * 0.6, r * 0.25, 0, 0, Math.PI * 2);
    ctx.fill();
  } else if (leafType === 'circle_hole') {
    // 3. CIRCLE WITH HOLE (Donut/Ring)
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(cx, cy, r * 1.15, 0, Math.PI * 2, false);
    ctx.arc(cx, cy, r * 0.45, 0, Math.PI * 2, true);
    ctx.fill();

    ctx.strokeStyle = accentColor;
    ctx.lineWidth = Math.max(1, r * 0.18);
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.8, 0, Math.PI * 2);
    ctx.stroke();
  } else if (leafType === 'raindrop') {
    // 4. RAINDROP
    ctx.fillStyle = color;
    ctx.beginPath();
    const apexY = cy - r * 1.45;
    const baseY = cy + r * 0.85;
    const bulbR = r * 0.95;

    ctx.moveTo(cx, apexY);
    ctx.bezierCurveTo(cx + bulbR * 1.3, cy, cx + bulbR, baseY, cx, baseY);
    ctx.bezierCurveTo(cx - bulbR, baseY, cx - bulbR * 1.3, cy, cx, apexY);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = accentColor;
    ctx.beginPath();
    ctx.ellipse(cx - bulbR * 0.28, cy + bulbR * 0.15, bulbR * 0.45, bulbR * 0.3, -0.2, 0, Math.PI * 2);
    ctx.fill();
  } else if (leafType === 'fire') {
    // 5. FIRE
    ctx.fillStyle = color;
    ctx.beginPath();
    const bottomY = cy + r * 0.8;
    ctx.moveTo(cx - r * 0.9, bottomY);
    ctx.bezierCurveTo(cx - r * 1.2, cy - r * 0.2, cx - r * 0.8, cy - r * 0.9, cx - r * 0.4, cy - r * 0.6);
    ctx.bezierCurveTo(cx - r * 0.3, cy - r * 1.5, cx + r * 0.2, cy - r * 1.5, cx + r * 0.1, cy - r * 0.7);
    ctx.bezierCurveTo(cx + r * 0.6, cy - r * 1.2, cx + r * 1.2, cy - r * 0.5, cx + r * 0.9, bottomY);
    ctx.bezierCurveTo(cx + r * 0.5, bottomY + r * 0.3, cx - r * 0.5, bottomY + r * 0.3, cx - r * 0.9, bottomY);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = accentColor;
    ctx.beginPath();
    ctx.arc(cx, cy + r * 0.1, r * 0.3, 0, Math.PI * 2);
    ctx.fill();
  } else if (leafType === 'cloud') {
    // 6. CLOUD (Puffy 3-lobe silhouette)
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(cx - r * 0.55, cy + r * 0.1, r * 0.6, 0, Math.PI * 2);
    ctx.arc(cx, cy - r * 0.25, r * 0.8, 0, Math.PI * 2);
    ctx.arc(cx + r * 0.55, cy + r * 0.1, r * 0.6, 0, Math.PI * 2);
    ctx.arc(cx, cy + r * 0.3, r * 0.65, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = accentColor;
    ctx.beginPath();
    ctx.arc(cx - r * 0.2, cy - r * 0.25, r * 0.45, 0, Math.PI * 2);
    ctx.fill();
  } else if (leafType === 'hexagon') {
    // 7. HEXAGON
    ctx.fillStyle = color;
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3 - Math.PI / 6;
      const hx = cx + Math.cos(angle) * r * 1.15;
      const hy = cy + Math.sin(angle) * r * 1.15;
      if (i === 0) ctx.moveTo(hx, hy);
      else ctx.lineTo(hx, hy);
    }
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = accentColor;
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3 - Math.PI / 6;
      const hx = cx + Math.cos(angle) * r * 0.65;
      const hy = cy + Math.sin(angle) * r * 0.65;
      if (i === 0) ctx.moveTo(hx, hy);
      else ctx.lineTo(hx, hy);
    }
    ctx.closePath();
    ctx.fill();
  } else if (leafType === 'star') {
    // 8. STAR (6-pointed)
    ctx.fillStyle = color;
    ctx.beginPath();
    const points = 6;
    for (let i = 0; i < points * 2; i++) {
      const angle = (i * Math.PI) / points - Math.PI / 2;
      const rad = i % 2 === 0 ? r * 1.35 : r * 0.48;
      const sx = cx + Math.cos(angle) * rad;
      const sy = cy + Math.sin(angle) * rad;
      if (i === 0) ctx.moveTo(sx, sy);
      else ctx.lineTo(sx, sy);
    }
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = accentColor;
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.35, 0, Math.PI * 2);
    ctx.fill();
  } else if (leafType === 'snowflake') {
    // 9. SNOWFLAKE (6-armed crystal star with branchlets)
    ctx.strokeStyle = color;
    ctx.lineWidth = Math.max(2, r * 0.22);
    ctx.lineCap = 'round';
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      const ex = cx + Math.cos(angle) * r * 1.15;
      const ey = cy + Math.sin(angle) * r * 1.15;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(ex, ey);
      ctx.stroke();

      // Branchlets
      const bx = cx + Math.cos(angle) * r * 0.7;
      const by = cy + Math.sin(angle) * r * 0.7;
      const bRad = r * 0.35;
      ctx.beginPath();
      ctx.moveTo(bx, by);
      ctx.lineTo(bx + Math.cos(angle + 0.6) * bRad, by + Math.sin(angle + 0.6) * bRad);
      ctx.moveTo(bx, by);
      ctx.lineTo(bx + Math.cos(angle - 0.6) * bRad, by + Math.sin(angle - 0.6) * bRad);
      ctx.stroke();
    }

    ctx.fillStyle = accentColor;
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.3, 0, Math.PI * 2);
    ctx.fill();
  } else if (leafType === 'feather') {
    // 10. FEATHER (Quill shaft with diagonal barbs)
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(cx, cy, r * 0.65, r * 1.35, 0.35, 0, Math.PI * 2);
    ctx.fill();

    // Quill shaft
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = Math.max(1.2, r * 0.12);
    ctx.beginPath();
    ctx.moveTo(cx - r * 0.45, cy + r * 1.2);
    ctx.lineTo(cx + r * 0.45, cy - r * 1.2);
    ctx.stroke();

    // Vane barbs
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 1;
    for (let i = -3; i <= 3; i++) {
      const my = cy + (i * r * 0.28);
      const mx = cx + (i * r * 0.1);
      ctx.beginPath();
      ctx.moveTo(mx, my);
      ctx.lineTo(mx - r * 0.4, my - r * 0.2);
      ctx.moveTo(mx, my);
      ctx.lineTo(mx + r * 0.4, my + r * 0.2);
      ctx.stroke();
    }
  } else if (leafType === 'snail') {
    // 11. SNAIL (Spiral whorl shell)
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(cx, cy, r * 1.1, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = accentColor;
    ctx.lineWidth = Math.max(2, r * 0.2);
    ctx.beginPath();
    // Archimedean spiral arc
    for (let a = 0; a <= Math.PI * 3.8; a += 0.2) {
      const dist = (a / (Math.PI * 3.8)) * r * 0.95;
      const sx = cx + Math.cos(a) * dist;
      const sy = cy + Math.sin(a) * dist;
      if (a === 0) ctx.moveTo(sx, sy);
      else ctx.lineTo(sx, sy);
    }
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.18, 0, Math.PI * 2);
    ctx.fill();
  } else if (leafType === 'eye') {
    // 12. EYE (Cartoon almond shape with pupil and highlight)
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(cx - r * 1.2, cy);
    ctx.quadraticCurveTo(cx, cy - r * 0.9, cx + r * 1.2, cy);
    ctx.quadraticCurveTo(cx, cy + r * 0.9, cx - r * 1.2, cy);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.lineWidth = Math.max(1.5, r * 0.15);
    ctx.stroke();

    // Iris
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.55, 0, Math.PI * 2);
    ctx.fill();

    // Pupil
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.32, 0, Math.PI * 2);
    ctx.fill();

    // Highlight
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(cx - r * 0.15, cy - r * 0.15, r * 0.14, 0, Math.PI * 2);
    ctx.fill();
  } else if (leafType === 'triangle') {
    // 13. TRIANGLE (Rounded soft delta)
    ctx.fillStyle = color;
    ctx.beginPath();
    const h = r * 1.2;
    const w = r * 1.2;
    ctx.moveTo(cx, cy - h);
    ctx.lineTo(cx + w, cy + h * 0.7);
    ctx.lineTo(cx - w, cy + h * 0.7);
    ctx.closePath();
    ctx.lineJoin = 'round';
    ctx.lineWidth = r * 0.4;
    ctx.strokeStyle = color;
    ctx.stroke();
    ctx.fill();

    ctx.fillStyle = accentColor;
    ctx.beginPath();
    ctx.moveTo(cx, cy - h * 0.45);
    ctx.lineTo(cx + w * 0.55, cy + h * 0.45);
    ctx.lineTo(cx - w * 0.55, cy + h * 0.45);
    ctx.closePath();
    ctx.fill();
  } else if (leafType === 'arrow') {
    // 14. ARROW (Upward pointing chevron)
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(cx, cy - r * 1.35);
    ctx.lineTo(cx + r * 1.1, cy + r * 0.3);
    ctx.lineTo(cx + r * 0.45, cy + r * 0.3);
    ctx.lineTo(cx + r * 0.45, cy + r * 1.1);
    ctx.lineTo(cx - r * 0.45, cy + r * 1.1);
    ctx.lineTo(cx - r * 0.45, cy + r * 0.3);
    ctx.lineTo(cx - r * 1.1, cy + r * 0.3);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = accentColor;
    ctx.lineWidth = Math.max(1, r * 0.15);
    ctx.stroke();
  } else if (leafType === 'shield') {
    // 15. SHIELD (Heater shield)
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(cx - r * 0.9, cy - r * 1.1);
    ctx.lineTo(cx + r * 0.9, cy - r * 1.1);
    ctx.lineTo(cx + r * 0.9, cy);
    ctx.bezierCurveTo(cx + r * 0.9, cy + r * 0.8, cx, cy + r * 1.2, cx, cy + r * 1.3);
    ctx.bezierCurveTo(cx, cy + r * 1.2, cx - r * 0.9, cy + r * 0.8, cx - r * 0.9, cy);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = accentColor;
    ctx.lineWidth = Math.max(1.5, r * 0.16);
    ctx.stroke();

    ctx.fillStyle = accentColor;
    ctx.beginPath();
    ctx.arc(cx, cy - r * 0.2, r * 0.28, 0, Math.PI * 2);
    ctx.fill();
  } else if (leafType === 'diamond') {
    // 16. DIAMOND (4-point rhombus)
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(cx, cy - r * 1.35);
    ctx.lineTo(cx + r * 1.05, cy);
    ctx.lineTo(cx, cy + r * 1.35);
    ctx.lineTo(cx - r * 1.05, cy);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = accentColor;
    ctx.beginPath();
    ctx.moveTo(cx, cy - r * 0.7);
    ctx.lineTo(cx + r * 0.55, cy);
    ctx.lineTo(cx, cy + r * 0.7);
    ctx.lineTo(cx - r * 0.55, cy);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.2, 0, Math.PI * 2);
    ctx.fill();
  } else if (leafType === 'cube') {
    // 17. CUBE / SQUARE (Isometric 3D cube with shaded facets)
    const cw = r * 0.9;
    const ch = r * 0.55;

    // Top face (Highlight)
    ctx.fillStyle = accentColor;
    ctx.beginPath();
    ctx.moveTo(cx, cy - ch * 2);
    ctx.lineTo(cx + cw, cy - ch);
    ctx.lineTo(cx, cy);
    ctx.lineTo(cx - cw, cy - ch);
    ctx.closePath();
    ctx.fill();

    // Left face (Base)
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(cx - cw, cy - ch);
    ctx.lineTo(cx, cy);
    ctx.lineTo(cx, cy + ch * 1.8);
    ctx.lineTo(cx - cw, cy + ch * 0.8);
    ctx.closePath();
    ctx.fill();

    // Right face (Shadow)
    ctx.fillStyle = SPECIES_PALETTE.cube.shadow;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + cw, cy - ch);
    ctx.lineTo(cx + cw, cy + ch * 0.8);
    ctx.lineTo(cx, cy + ch * 1.8);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.lineWidth = 1;
    ctx.stroke();
  } else if (leafType === 'rectangle') {
    // 18. RECTANGLE (Clean rounded brick/block)
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(cx - r * 1.25, cy - r * 0.75, r * 2.5, r * 1.5, r * 0.25);
    ctx.fill();

    ctx.strokeStyle = accentColor;
    ctx.lineWidth = Math.max(1.5, r * 0.16);
    ctx.stroke();

    ctx.fillStyle = accentColor;
    ctx.beginPath();
    ctx.roundRect(cx - r * 0.7, cy - r * 0.35, r * 1.4, r * 0.7, r * 0.15);
    ctx.fill();
  } else if (leafType === 'gear') {
    // 19. GEAR (Cogwheel with 6-8 teeth)
    const teeth = 6;
    ctx.fillStyle = color;
    ctx.beginPath();
    for (let i = 0; i < teeth; i++) {
      const a1 = (i * Math.PI * 2) / teeth;
      const a2 = a1 + Math.PI / teeth / 2;
      const a3 = a1 + Math.PI / teeth;
      const outer = r * 1.25;
      const inner = r * 0.85;

      if (i === 0) ctx.moveTo(cx + Math.cos(a1) * inner, cy + Math.sin(a1) * inner);
      ctx.lineTo(cx + Math.cos(a1) * outer, cy + Math.sin(a1) * outer);
      ctx.lineTo(cx + Math.cos(a2) * outer, cy + Math.sin(a2) * outer);
      ctx.lineTo(cx + Math.cos(a2) * inner, cy + Math.sin(a2) * inner);
      ctx.lineTo(cx + Math.cos(a3) * inner, cy + Math.sin(a3) * inner);
    }
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = accentColor;
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.45, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.22, 0, Math.PI * 2);
    ctx.fill();
  } else if (leafType === 'bell') {
    // 20. BELL (Arched dome with flared rim and clapper dot)
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(cx - r * 0.3, cy - r * 1.1);
    ctx.bezierCurveTo(cx - r * 0.9, cy - r * 0.7, cx - r * 0.9, cy + r * 0.5, cx - r * 1.15, cy + r * 0.85);
    ctx.lineTo(cx + r * 1.15, cy + r * 0.85);
    ctx.bezierCurveTo(cx + r * 0.9, cy + r * 0.5, cx + r * 0.9, cy - r * 0.7, cx + r * 0.3, cy - r * 1.1);
    ctx.closePath();
    ctx.fill();

    // Top loop
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = Math.max(1.5, r * 0.2);
    ctx.beginPath();
    ctx.arc(cx, cy - r * 1.15, r * 0.25, 0, Math.PI * 2);
    ctx.stroke();

    // Clapper dot
    ctx.fillStyle = accentColor;
    ctx.beginPath();
    ctx.arc(cx, cy + r * 1.05, r * 0.25, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

export const renderLeafFoliage = drawLeafShape;

/**
 * Shared procedural tree trunk & foliage pad renderer supporting all 7 Growth Styles:
 * 1. Chokan (Formal Upright)
 * 2. Moyogi (Informal Upright)
 * 3. Shakan (Slanting Style)
 * 4. Han-Kengai (Semi-Cascade Style)
 * 5. Sokan (Double Trunk)
 * 6. Kengai (Full Cascade Style)
 * 7. Kabudachi (Multi-Trunk Clump)
 */
export function drawBonsaiTrunkAndCanopy(
  ctx: CanvasRenderingContext2D,
  bx: number,
  by: number,
  stageScale: number,
  trunkHeight: number,
  trunkThickness: number,
  style: BonsaiStyle | string,
  leafType: BonsaiLeafType,
  foliageColor: string,
  foliageAccent: string,
  isStyleUnlogged = false,
) {
  const normStyle = (style || 'MOYOGI').toUpperCase().replace('-', '_');

  const trunkColor = isStyleUnlogged
    ? '#1e293b'
    : normStyle === 'SHAKAN'
    ? '#8b3a1a'
    : normStyle === 'KENGAI' || normStyle === 'HAN_KENGAI'
    ? '#6b2d10'
    : normStyle === 'SOKAN' || normStyle === 'KABUDACHI'
    ? '#854d0e'
    : leafType === 'star'
    ? '#854d0e'
    : leafType === 'fire'
    ? '#7c2d12'
    : '#78350f';

  const folColor = isStyleUnlogged ? '#1e293b' : foliageColor;
  const folAccent = isStyleUnlogged ? '#334155' : foliageAccent;

  ctx.save();
  ctx.strokeStyle = trunkColor;
  ctx.fillStyle = trunkColor;
  ctx.lineWidth = trunkThickness;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  if (normStyle === 'CHOKAN') {
    // 1. CHOKAN (Formal Upright): Vertical tapering trunk with symmetrical horizontal branch pads
    // Nebari roots
    ctx.beginPath();
    ctx.moveTo(bx - 10 * stageScale, by - 3);
    ctx.lineTo(bx, by - 7);
    ctx.lineTo(bx + 10 * stageScale, by - 3);
    ctx.lineWidth = trunkThickness * 0.75;
    ctx.stroke();

    ctx.lineWidth = trunkThickness;
    ctx.beginPath();
    ctx.moveTo(bx, by - 4);
    ctx.lineTo(bx, by - 4 - trunkHeight);
    ctx.stroke();

    const tiers = 3;
    for (let t = 1; t <= tiers; t++) {
      const tierY = by - 4 - (trunkHeight * t) / (tiers + 0.6);
      const branchSpread = (16 + (tiers - t) * 6) * stageScale;

      ctx.lineWidth = Math.max(1.8, trunkThickness * 0.45);
      ctx.beginPath();
      ctx.moveTo(bx, tierY);
      ctx.lineTo(bx - branchSpread, tierY - 1);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(bx, tierY - 2);
      ctx.lineTo(bx + branchSpread, tierY - 3);
      ctx.stroke();

      const padRad = (11 + (tiers - t) * 2.5) * stageScale;
      drawLeafShape(ctx, bx - branchSpread - 1, tierY - 2, padRad, leafType, folColor, folAccent);
      drawLeafShape(ctx, bx + branchSpread + 1, tierY - 4, padRad, leafType, folColor, folAccent);
    }

    // Apex Crown Pad
    drawLeafShape(ctx, bx, by - 4 - trunkHeight - 2, 13 * stageScale, leafType, folColor, folAccent);

  } else if (normStyle === 'MOYOGI') {
    // 2. MOYOGI (Informal Upright): Graceful sinuous 'S'-curve trunk
    ctx.beginPath();
    ctx.moveTo(bx - 9 * stageScale, by - 3);
    ctx.lineTo(bx, by - 7);
    ctx.lineTo(bx + 9 * stageScale, by - 3);
    ctx.lineWidth = trunkThickness * 0.75;
    ctx.stroke();

    ctx.lineWidth = trunkThickness;
    const curveOffset = 13 * stageScale;
    ctx.beginPath();
    ctx.moveTo(bx, by - 4);
    ctx.bezierCurveTo(
      bx - curveOffset,
      by - 4 - trunkHeight * 0.35,
      bx + curveOffset * 1.2,
      by - 4 - trunkHeight * 0.7,
      bx + 2 * stageScale,
      by - 4 - trunkHeight,
    );
    ctx.stroke();

    const pads = [
      { x: bx - curveOffset * 1.2, y: by - 4 - trunkHeight * 0.4, r: 12 * stageScale },
      { x: bx + curveOffset * 1.3, y: by - 4 - trunkHeight * 0.72, r: 13 * stageScale },
      { x: bx + 2 * stageScale, y: by - 4 - trunkHeight - 2, r: 14 * stageScale },
    ];
    pads.forEach((pad) => {
      drawLeafShape(ctx, pad.x, pad.y, pad.r, leafType, folColor, folAccent);
    });

  } else if (normStyle === 'SHAKAN') {
    // 3. SHAKAN (Slanting Style): Windswept ~40° slanting trunk with counterbalancing branch
    ctx.beginPath();
    ctx.moveTo(bx - 12 * stageScale, by - 3);
    ctx.lineTo(bx, by - 7);
    ctx.lineTo(bx + 8 * stageScale, by - 3);
    ctx.lineWidth = trunkThickness * 0.75;
    ctx.stroke();

    const sweepX = 28 * stageScale;
    const trunkStartY = by - 4;
    const trunkApexX = bx + sweepX;
    const trunkApexY = by - 4 - trunkHeight * 0.88;

    ctx.lineWidth = trunkThickness * 1.1;
    ctx.beginPath();
    ctx.moveTo(bx - 1, trunkStartY);
    ctx.bezierCurveTo(
      bx + sweepX * 0.2,
      trunkStartY - trunkHeight * 0.25,
      bx + sweepX * 0.55,
      trunkStartY - trunkHeight * 0.55,
      trunkApexX,
      trunkApexY,
    );
    ctx.stroke();

    // Counter-balancing branch
    const b1StartX = bx + sweepX * 0.28;
    const b1StartY = trunkStartY - trunkHeight * 0.32;
    const b1EndX = bx - 19 * stageScale;
    const b1EndY = trunkStartY - trunkHeight * 0.28;

    ctx.lineWidth = Math.max(1.8, trunkThickness * 0.55);
    ctx.beginPath();
    ctx.moveTo(b1StartX, b1StartY);
    ctx.quadraticCurveTo(bx - 1, b1StartY + 1, b1EndX, b1EndY);
    ctx.stroke();

    // Mid-left branch
    const b2StartX = bx + sweepX * 0.52;
    const b2StartY = trunkStartY - trunkHeight * 0.54;
    const b2EndX = bx + 1.5 * stageScale;
    const b2EndY = trunkStartY - trunkHeight * 0.58;

    ctx.beginPath();
    ctx.moveTo(b2StartX, b2StartY);
    ctx.lineTo(b2EndX, b2EndY);
    ctx.stroke();

    // Mid-right branch
    const b3StartX = bx + sweepX * 0.65;
    const b3StartY = trunkStartY - trunkHeight * 0.64;
    const b3EndX = bx + sweepX + 12 * stageScale;
    const b3EndY = trunkStartY - trunkHeight * 0.62;

    ctx.beginPath();
    ctx.moveTo(b3StartX, b3StartY);
    ctx.lineTo(b3EndX, b3EndY);
    ctx.stroke();

    drawLeafShape(ctx, b1EndX - 3 * stageScale, b1EndY + 1, 8.5 * stageScale, leafType, folColor, folAccent);
    drawLeafShape(ctx, b1EndX + 5 * stageScale, b1EndY - 1, 7.5 * stageScale, leafType, folColor, folAccent);
    drawLeafShape(ctx, b2EndX, b2EndY, 8 * stageScale, leafType, folColor, folAccent);
    drawLeafShape(ctx, b3EndX, b3EndY, 8.5 * stageScale, leafType, folColor, folAccent);
    drawLeafShape(ctx, trunkApexX + 1, trunkApexY - 7 * stageScale, 11 * stageScale, leafType, folColor, folAccent);

  } else if (normStyle === 'HAN_KENGAI') {
    // 4. HAN-KENGAI (Semi-Cascade): Trunk angles gracefully over the rim of the pot with foliage draping down to pot-rim level
    // Prominent exposed anchor roots gripping the soil on the left
    ctx.beginPath();
    ctx.moveTo(bx - 18 * stageScale, by - 2);
    ctx.lineTo(bx - 6 * stageScale, by - 8);
    ctx.lineTo(bx, by - 6);
    ctx.lineWidth = trunkThickness * 0.9;
    ctx.stroke();

    // Main trunk arching gracefully over right pot rim
    ctx.lineWidth = trunkThickness * 1.05;
    const archApexX = bx + 12 * stageScale;
    const archApexY = by - 4 - trunkHeight * 0.55;
    const drapeX = bx + 28 * stageScale;
    const drapeY = by - 1;

    ctx.beginPath();
    ctx.moveTo(bx, by - 4);
    ctx.bezierCurveTo(
      bx - 2 * stageScale,
      by - 4 - trunkHeight * 0.35,
      archApexX - 4 * stageScale,
      archApexY,
      archApexX,
      archApexY,
    );
    ctx.bezierCurveTo(
      archApexX + 12 * stageScale,
      archApexY + 4 * stageScale,
      drapeX - 2 * stageScale,
      drapeY - 8 * stageScale,
      drapeX,
      drapeY,
    );
    ctx.stroke();

    // Sub-branch pointing upward from apex
    ctx.lineWidth = Math.max(1.8, trunkThickness * 0.5);
    ctx.beginPath();
    ctx.moveTo(archApexX, archApexY);
    ctx.lineTo(archApexX - 6 * stageScale, archApexY - 14 * stageScale);
    ctx.stroke();

    // Mid cascading branch
    ctx.beginPath();
    ctx.moveTo(archApexX + 8 * stageScale, archApexY + 8 * stageScale);
    ctx.lineTo(archApexX + 18 * stageScale, archApexY + 4 * stageScale);
    ctx.stroke();

    // Draping foliage pads down to pot rim level
    drawLeafShape(ctx, archApexX - 6 * stageScale, archApexY - 15 * stageScale, 10 * stageScale, leafType, folColor, folAccent);
    drawLeafShape(ctx, archApexX + 19 * stageScale, archApexY + 3 * stageScale, 9.5 * stageScale, leafType, folColor, folAccent);
    drawLeafShape(ctx, drapeX + 1 * stageScale, drapeY - 2, 11 * stageScale, leafType, folColor, folAccent);
    drawLeafShape(ctx, drapeX - 8 * stageScale, drapeY + 4 * stageScale, 8.5 * stageScale, leafType, folColor, folAccent);

  } else if (normStyle === 'SOKAN') {
    // 5. SOKAN (Double Trunk): Two distinct trunks emerging from a single root base, one dominant and one secondary
    // Unified root flare
    ctx.beginPath();
    ctx.moveTo(bx - 14 * stageScale, by - 3);
    ctx.lineTo(bx, by - 8);
    ctx.lineTo(bx + 14 * stageScale, by - 3);
    ctx.lineWidth = trunkThickness * 0.9;
    ctx.stroke();

    // Primary dominant trunk (tall, sweeping slightly left then upright)
    ctx.lineWidth = trunkThickness * 1.0;
    const pApexX = bx - 10 * stageScale;
    const pApexY = by - 4 - trunkHeight;

    ctx.beginPath();
    ctx.moveTo(bx - 2 * stageScale, by - 5);
    ctx.bezierCurveTo(
      bx - 16 * stageScale,
      by - 4 - trunkHeight * 0.35,
      bx - 2 * stageScale,
      by - 4 - trunkHeight * 0.7,
      pApexX,
      pApexY,
    );
    ctx.stroke();

    // Primary trunk branch
    ctx.lineWidth = Math.max(1.8, trunkThickness * 0.5);
    ctx.beginPath();
    ctx.moveTo(bx - 9 * stageScale, by - 4 - trunkHeight * 0.55);
    ctx.lineTo(bx - 24 * stageScale, by - 4 - trunkHeight * 0.58);
    ctx.stroke();

    // Secondary complementary trunk (shorter, ~68% height, leaning outward right)
    ctx.lineWidth = trunkThickness * 0.75;
    const sApexX = bx + 20 * stageScale;
    const sApexY = by - 4 - trunkHeight * 0.68;

    ctx.beginPath();
    ctx.moveTo(bx + 2 * stageScale, by - 5);
    ctx.bezierCurveTo(
      bx + 8 * stageScale,
      by - 4 - trunkHeight * 0.25,
      bx + 14 * stageScale,
      by - 4 - trunkHeight * 0.5,
      sApexX,
      sApexY,
    );
    ctx.stroke();

    // Secondary trunk branch
    ctx.beginPath();
    ctx.moveTo(bx + 12 * stageScale, by - 4 - trunkHeight * 0.38);
    ctx.lineTo(bx + 26 * stageScale, by - 4 - trunkHeight * 0.34);
    ctx.stroke();

    // Foliage pads on primary trunk
    drawLeafShape(ctx, bx - 25 * stageScale, by - 4 - trunkHeight * 0.59, 10 * stageScale, leafType, folColor, folAccent);
    drawLeafShape(ctx, pApexX - 3 * stageScale, pApexY - 3 * stageScale, 13 * stageScale, leafType, folColor, folAccent);
    drawLeafShape(ctx, pApexX + 10 * stageScale, pApexY + 8 * stageScale, 9 * stageScale, leafType, folColor, folAccent);

    // Foliage pads on secondary trunk
    drawLeafShape(ctx, bx + 27 * stageScale, by - 4 - trunkHeight * 0.34, 8.5 * stageScale, leafType, folColor, folAccent);
    drawLeafShape(ctx, sApexX, sApexY - 3 * stageScale, 11 * stageScale, leafType, folColor, folAccent);

  } else if (normStyle === 'KENGAI') {
    // 6. KENGAI (Full Cascade): Dramatic cliff-side growth where main trunk sweeps boldly downwards below pot base
    // Deep anchor roots on left
    ctx.beginPath();
    ctx.moveTo(bx - 20 * stageScale, by - 2);
    ctx.lineTo(bx - 8 * stageScale, by - 9);
    ctx.lineTo(bx, by - 6);
    ctx.lineWidth = trunkThickness * 1.0;
    ctx.stroke();

    // Trunk loops gently upward then plunges boldly down below pot base
    ctx.lineWidth = trunkThickness * 1.15;
    const crestX = bx + 14 * stageScale;
    const crestY = by - 4 - trunkHeight * 0.42;
    const plungeX = bx + 26 * stageScale;
    const plungeY = by + 22 * stageScale;

    ctx.beginPath();
    ctx.moveTo(bx, by - 5);
    ctx.bezierCurveTo(
      bx - 2 * stageScale,
      by - 4 - trunkHeight * 0.25,
      crestX - 6 * stageScale,
      crestY,
      crestX,
      crestY,
    );
    ctx.bezierCurveTo(
      crestX + 16 * stageScale,
      crestY + 6 * stageScale,
      plungeX + 6 * stageScale,
      by + 6 * stageScale,
      plungeX,
      plungeY,
    );
    ctx.stroke();

    // Cascading branch pads
    ctx.lineWidth = Math.max(1.8, trunkThickness * 0.5);
    ctx.beginPath();
    ctx.moveTo(crestX, crestY);
    ctx.lineTo(crestX - 8 * stageScale, crestY - 12 * stageScale);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(crestX + 10 * stageScale, by + 4 * stageScale);
    ctx.lineTo(crestX + 22 * stageScale, by + 2 * stageScale);
    ctx.stroke();

    // Cascading foliage pads (cliffhanger clouds)
    drawLeafShape(ctx, crestX - 8 * stageScale, crestY - 13 * stageScale, 10 * stageScale, leafType, folColor, folAccent);
    drawLeafShape(ctx, crestX + 23 * stageScale, by + 2 * stageScale, 9.5 * stageScale, leafType, folColor, folAccent);
    drawLeafShape(ctx, plungeX + 2 * stageScale, plungeY - 3 * stageScale, 12 * stageScale, leafType, folColor, folAccent);
    drawLeafShape(ctx, plungeX - 8 * stageScale, plungeY + 4 * stageScale, 9 * stageScale, leafType, folColor, folAccent);

  } else {
    // 7. KABUDACHI (Multi-Trunk Clump): Clump of 3-5 slender trunks radiating upwards from unified flare
    // Broad unified root flare
    ctx.beginPath();
    ctx.moveTo(bx - 16 * stageScale, by - 3);
    ctx.lineTo(bx, by - 9);
    ctx.lineTo(bx + 16 * stageScale, by - 3);
    ctx.lineWidth = trunkThickness * 1.1;
    ctx.stroke();

    // 5 Slender radiating trunks
    const slenderW = Math.max(1.8, trunkThickness * 0.55);
    ctx.lineWidth = slenderW;

    const trunks = [
      { endX: bx - 22 * stageScale, endY: by - 4 - trunkHeight * 0.68, cpX: bx - 14 * stageScale },
      { endX: bx - 10 * stageScale, endY: by - 4 - trunkHeight * 0.88, cpX: bx - 7 * stageScale },
      { endX: bx + 1 * stageScale, endY: by - 4 - trunkHeight * 1.02, cpX: bx },
      { endX: bx + 12 * stageScale, endY: by - 4 - trunkHeight * 0.85, cpX: bx + 8 * stageScale },
      { endX: bx + 23 * stageScale, endY: by - 4 - trunkHeight * 0.65, cpX: bx + 15 * stageScale },
    ];

    trunks.forEach((trk) => {
      ctx.beginPath();
      ctx.moveTo(bx + (trk.cpX - bx) * 0.4, by - 6);
      ctx.quadraticCurveTo(trk.cpX, by - 4 - trunkHeight * 0.4, trk.endX, trk.endY);
      ctx.stroke();
    });

    // Shared crown foliage clouds atop each trunk terminal
    drawLeafShape(ctx, trunks[0].endX, trunks[0].endY - 2, 8.5 * stageScale, leafType, folColor, folAccent);
    drawLeafShape(ctx, trunks[1].endX, trunks[1].endY - 2, 10 * stageScale, leafType, folColor, folAccent);
    drawLeafShape(ctx, trunks[2].endX, trunks[2].endY - 3, 12 * stageScale, leafType, folColor, folAccent);
    drawLeafShape(ctx, trunks[3].endX, trunks[3].endY - 2, 9.5 * stageScale, leafType, folColor, folAccent);
    drawLeafShape(ctx, trunks[4].endX, trunks[4].endY - 2, 8 * stageScale, leafType, folColor, folAccent);
  }

  ctx.restore();
}
