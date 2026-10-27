// tslint:disable
/* eslint-disable */
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  Play,
  RotateCw,
  Volume2,
  VolumeX,
  Trophy,
  Sparkles,
  ArrowLeft,
  Home,
  Zap,
  Gamepad,
  Menu,
  X,
  Package,
  HelpCircle,
  Wrench,
  Droplets,
  Sprout,
  Compass,
  ArrowUpRight,
  Sun,
  Wind,
  Scissors,
  Award,
  AlertTriangle,
  CheckCircle2,
  Battery,
  Truck,
  Layers,
  Flame,
  Shield,
  Navigation,
  ShoppingBag,
  Store,
  Coins,
  Map as MapIcon,
  Lock,
  Unlock,
  Check,
  Trees,
  Mountain,
  Flower2,
  ChevronRight,
  ChevronLeft,
  Info,
  Maximize2,
  BookOpen,
} from 'lucide-react';
import {getConfig, THEME, ASSET_DOUBLE_RESOURCES} from './constants';
import BackgroundMusic from './utils/BackgroundMusic';
import {
  BonsaiLeafType,
  BonsaiGroup,
  BonsaiStyle,
  BonsaiRarity,
  MaturityTier,
  LeafTypeDefinition,
  MaturityDefinition,
  LEAF_TYPE_CONFIGS,
  BONSAI_GROUPS,
  MATURITY_CONFIGS,
  MATURITY_GROWTH_MULTIPLIERS,
  AREA_SPECIES_DISTRIBUTION,
  getLeafTypeDef,
  getMaturityDef,
  getBonsaiGroup,
  getMaturityGrowthMultiplier,
  getBonsaiLevelGrowthNeeded,
  getSpeciesAreaProbability,
  getSpeciesFindOdds,
  calculateDonationValue,
  renderLeafFoliage,
  drawLeafShape,
  drawBonsaiTrunkAndCanopy,
} from './bonsaiData';
export {getSpeciesFindOdds, calculateDonationValue};
import {
  createFixedStepper,
  drawAsset,
  drawBackground,
  Entity,
  formatTime,
  gameAudio,
  GameState,
  MenuOverlay,
  Overlay,
  prepareCanvas,
  useAssets,
  useAutoFocus,
  useInput,
  useIsMobile,
} from './utils/helper';
import {
  usePlayground,
  usePlaygroundGameLifecycle,
} from './utils/usePlayground';
import ZenLibraryModal, { ShrineTab } from './ZenLibraryModal';
import InventoryModal, { EquipmentCard } from './InventoryModal';
export { EquipmentCard };
import {
  RoverChassisTier,
  RoverModuleType,
  RoverModuleConfig,
  Bonsai,
  BonsaiAttributes,
  DEFAULT_BONSAI_ATTRIBUTES,
  CultivationPotential,
  DEFAULT_CULTIVATION_POTENTIAL,
  ATTRIBUTE_CONFIG,
  getAttributeTier,
  getAttributeTierName,
  getAttributeTierColor,
  calculateBonsaiAttributes,
  calculateHitPrecision,
  calculateExcavationPrecision,
  getExcavationArcColor,
  getPrecisionColor,
  TIERS,
  AREA_EXCAVATION_SPEEDS,
  BonsaiNature,
  BONSAI_NATURES,
  getBonsaiNature,
  CRYSTAL_PEDESTALS,
  CrystalPedestalType,
  formatCrystalPedestalBonus,
  calculateBaseAesthetic,
  formatStyleWeightsString,
  STYLE_ATTRIBUTE_WEIGHTS,
  GridPlacementPreview,
} from './types';
export { calculateBaseAesthetic };
import BonsaiExcavationModal, { ExcavationResultData } from './BonsaiExcavationModal';
import BonsaiInspectionModal from './BonsaiInspectionModal';
import DeploymentModal, { BonsaiStyleThumbnail } from './DeploymentModal';
import { SeedlingItem } from './types';

// Relaxing nature & sanctuary soundtrack
const BACKGROUND_MUSIC_URL =
  'https://storage.googleapis.com/assets-gen-playground/musiclibrary/verdant_bloom.mp3';

// Grid Configuration for Sanctuary (16 columns x 8 rows matrix, 128 total plots with vertical scrolling)
export const SANCTUARY_GRID = {
  cols: 16,
  rows: 8,
  cellW: 72,
  cellH: 74,
  startX: 100, // cols 0..15 -> 100 to 1180 (Center = 640)
  startY: 306, // rows 0..7 -> 306 to 824 (clean 16px gap below station frame at 240)
};

export const SANCTUARY_WORLD_HEIGHT = 1040;

export interface SanctuaryPlotInfo {
  col: number;
  row: number;
  x: number;
  y: number;
  width: number;
  height: number;
  centerX: number;
  centerY: number;
  isUnlocked: boolean;
}

/**
 * Returns the exact sanctuary plot physically bounding the player avatar's coordinate.
 * Returns null strictly if the player is off-grid (e.g. on the gravel promenade or outside grid perimeter).
 */
export function getPlotAtCoords(
  playerX: number,
  playerY: number,
  expansionTier = 0,
): SanctuaryPlotInfo | null {
  const halfTileW = (SANCTUARY_GRID.cellW - 8) / 2;
  const halfTileH = (SANCTUARY_GRID.cellH - 8) / 2;
  const tileW = halfTileW * 2;
  const tileH = halfTileH * 2;

  const gridLeft = SANCTUARY_GRID.startX - SANCTUARY_GRID.cellW / 2;
  const gridRight = SANCTUARY_GRID.startX + (SANCTUARY_GRID.cols - 0.5) * SANCTUARY_GRID.cellW;
  const gridTop = SANCTUARY_GRID.startY - SANCTUARY_GRID.cellH / 2;
  const gridBottom = SANCTUARY_GRID.startY + (SANCTUARY_GRID.rows - 0.5) * SANCTUARY_GRID.cellH;

  // Player is physically outside the sanctuary plots grid perimeter (e.g. promenade or borders)
  if (playerX < gridLeft || playerX >= gridRight || playerY < gridTop || playerY >= gridBottom) {
    return null;
  }

  const c = Math.floor((playerX - gridLeft) / SANCTUARY_GRID.cellW);
  const r = Math.floor((playerY - gridTop) / SANCTUARY_GRID.cellH);

  if (c < 0 || c >= SANCTUARY_GRID.cols || r < 0 || r >= SANCTUARY_GRID.rows) {
    return null;
  }

  const centerX = SANCTUARY_GRID.startX + c * SANCTUARY_GRID.cellW;
  const centerY = SANCTUARY_GRID.startY + r * SANCTUARY_GRID.cellH;
  const plotX = centerX - halfTileW;
  const plotY = centerY - halfTileH;

  let isUnlocked = false;
  if (expansionTier >= 4) isUnlocked = true;
  else if (expansionTier === 3) isUnlocked = r >= 0 && r <= 5;
  else if (expansionTier === 2) isUnlocked = r >= 0 && r <= 3;
  else if (expansionTier === 1) isUnlocked = c >= 4 && c <= 11 && r >= 0 && r <= 3;
  else isUnlocked = c >= 6 && c <= 9 && r >= 0 && r <= 3;

  return {
    col: c,
    row: r,
    x: plotX,
    y: plotY,
    width: tileW,
    height: tileH,
    centerX,
    centerY,
    isUnlocked,
  };
}

/**
 * Returns the sanctuary plot info for placement preview.
 * Clamps coordinates to the nearest valid grid plot bounds so preview is immediately active.
 */
export function getPreviewPlot(
  playerX: number,
  playerY: number,
  expansionTier = 0,
): SanctuaryPlotInfo {
  const halfTileW = (SANCTUARY_GRID.cellW - 8) / 2;
  const halfTileH = (SANCTUARY_GRID.cellH - 8) / 2;
  const gridLeft = SANCTUARY_GRID.startX - SANCTUARY_GRID.cellW / 2;
  const gridTop = SANCTUARY_GRID.startY - SANCTUARY_GRID.cellH / 2;

  const c = Math.max(0, Math.min(SANCTUARY_GRID.cols - 1, Math.floor((playerX - gridLeft) / SANCTUARY_GRID.cellW)));
  const r = Math.max(0, Math.min(SANCTUARY_GRID.rows - 1, Math.floor((playerY - gridTop) / SANCTUARY_GRID.cellH)));

  const centerX = SANCTUARY_GRID.startX + c * SANCTUARY_GRID.cellW;
  const centerY = SANCTUARY_GRID.startY + r * SANCTUARY_GRID.cellH;
  const plotX = centerX - halfTileW;
  const plotY = centerY - halfTileH;

  let isUnlocked = false;
  if (expansionTier >= 4) isUnlocked = true;
  else if (expansionTier === 3) isUnlocked = r >= 0 && r <= 5;
  else if (expansionTier === 2) isUnlocked = r >= 0 && r <= 3;
  else if (expansionTier === 1) isUnlocked = c >= 4 && c <= 11 && r >= 0 && r <= 3;
  else isUnlocked = c >= 6 && c <= 9 && r >= 0 && r <= 3;

  return {
    col: c,
    row: r,
    x: plotX,
    y: plotY,
    width: halfTileW * 2,
    height: halfTileH * 2,
    centerX,
    centerY,
    isUnlocked,
  };
}

// Excursion Grid Tile Size (64px per step)
export const EXCURSION_TILE_SIZE = 64;

export type GameLocation = 'SANCTUARY' | 'EXCURSION';
export type AutomatonTier = 0 | 1 | 2 | 3;
export type ExpeditionBiomeId = 'FOOTHILLS' | 'HIGHLANDS' | 'OVERGROWTH';
export type DeployedStructureType =
  | 'solar_panel'
  | 'wind_turbine'
  | 'decor_pebble_path'
  | 'decor_rock_formation'
  | 'decor_shrubbery_bush'
  | 'decor_woven_wall'
  | 'tool_compost_heap'
  | 'tool_garden_well'
  | 'crystal_pedestal_foliage'
  | 'crystal_pedestal_branches'
  | 'crystal_pedestal_trunk'
  | 'crystal_pedestal_roots'
  | 'torii_gate';

export interface DeployedStructure {
  id: string;
  type: DeployedStructureType;
  x: number;
  y: number;
  gridX: number;
  gridY: number;
  rotation?: number;
  variant?: number;
  orientation?: 'horizontal' | 'vertical';
  width?: number;
  height?: number;
  // Compost Heap state
  depositedWaste?: number; // up to 20
  maxCapacity?: number;    // default 20
  timer?: number;          // decomposition progress in seconds (e.g. 10s per batch)
  readyCompost?: number;   // finished Enriched Compost ready to harvest
  // Well state
  lastPumpedAt?: number;
  activeWateringRemaining?: number; // active 3x3 watering countdown (starts at 20s)
  totalActiveDuration?: number;     // initial divided watering duration for emptying bar
  cooldownRemaining?: number;       // modest cooldown before next crank (e.g. 8s)
}

export interface AutoFabricatorLane {
  id: string;
  targetRecipeId: CraftingRecipeId | 'none';
  progressSeconds: number;
}

export function getBonsaiGroupBadgeClass(group: BonsaiGroup): string {
  switch (group) {
    case 'Raundo':
      return 'bg-emerald-950 text-emerald-300 border-emerald-500/60';
    case 'Erementaru':
      return 'bg-orange-950 text-orange-300 border-orange-500/60';
    case 'Roku-men':
      return 'bg-purple-950 text-purple-300 border-purple-500/60';
    case 'Seikatsu':
      return 'bg-cyan-950 text-cyan-300 border-cyan-500/60';
    case 'Sanmen':
      return 'bg-blue-950 text-blue-300 border-blue-500/60';
    case 'Shihen':
      return 'bg-indigo-950 text-indigo-300 border-indigo-500/60';
    case 'Jinkō-teki':
      return 'bg-amber-950 text-amber-300 border-amber-500/60';
    default:
      return 'bg-slate-900 text-slate-300 border-slate-700';
  }
}

export interface BonsaiStyleDefinition {
  id: BonsaiStyle;
  name: string;
  kanji: string;
  japanese: string;
  subtitle: string;
  description: string;
  icon: string;
}

export const BONSAI_STYLES: Record<string, BonsaiStyleDefinition> = {
  CHOKAN: {
    id: 'CHOKAN',
    name: 'Formal Upright',
    kanji: '直幹',
    japanese: 'Chokan',
    subtitle: 'Tapering, straight vertical trunk with symmetrical horizontal branch pads',
    description: 'A classic towering silhouette representing strength, upright dignity, and pristine architectural balance.',
    icon: '🌲',
  },
  MOYOGI: {
    id: 'MOYOGI',
    name: 'Informal Upright',
    kanji: '模様木',
    japanese: 'Moyogi',
    subtitle: 'Elegant sinuous S-curve trunk with balanced asymmetric foliage pads',
    description: 'Graceful undulating natural trunk curvature reflecting harmony with passing winds and gentle sunlight.',
    icon: '🌿',
  },
  SHAKAN: {
    id: 'SHAKAN',
    name: 'Slanting Style',
    kanji: '斜幹',
    japanese: 'Shakan',
    subtitle: 'Expressive windswept angled trunk (35-45°) with counterbalancing branch',
    description: 'Dynamic slanting posture molded by mountain gales, anchored by a deep resilient counter-weight canopy.',
    icon: '🎋',
  },
  HAN_KENGAI: {
    id: 'HAN_KENGAI',
    name: 'Semi-Cascade Style',
    kanji: '半懸崖',
    japanese: 'Han-Kengai',
    subtitle: 'Trunk curving gently over pot rim with draping foliage and strong anchor roots',
    description: 'A resilient riverbank silhouette bending gracefully over the water rim without dipping below the pot base.',
    icon: '🌊',
  },
  SOKAN: {
    id: 'SOKAN',
    name: 'Double Trunk',
    kanji: '双幹',
    japanese: 'Sokan',
    subtitle: 'Two distinct trunks sharing a unified root flare, father and child harmony',
    description: 'Dual trunks growing from a single base in intimate harmony, sharing space, sun, and balanced foliage.',
    icon: '🌳',
  },
  KENGAI: {
    id: 'KENGAI',
    name: 'Full Cascade Style',
    kanji: '懸崖',
    japanese: 'Kengai',
    subtitle: 'Dramatic cliffside growth plunging boldly below the pot and pedestal base',
    description: 'A breathtaking cliffhanger enduring harsh mountain ravines, anchored by deep gripping root flares.',
    icon: '🏔️',
  },
  KABUDACHI: {
    id: 'KABUDACHI',
    name: 'Multi-Trunk Clump',
    kanji: '株立ち',
    japanese: 'Kabudachi',
    subtitle: 'Clump of 3-5 slender trunks radiating outward with a unified shared canopy',
    description: 'A natural grove silhouette born from a single root system, radiating outwards in communal harmony.',
    icon: '🎋',
  },
};

export function getBonsaiStyleDef(style?: string): BonsaiStyleDefinition {
  if (!style) return BONSAI_STYLES['MOYOGI'];
  const upper = style.toUpperCase().replace('-', '_');
  return BONSAI_STYLES[upper] || BONSAI_STYLES['MOYOGI'];
}

export interface BiomeDefinition {
  id: ExpeditionBiomeId;
  name: string;
  subtitle: string;
  batteryCostPerStep: number;
  unlockedByDefault: boolean;
  requiredMapKey?: 'has_map_highlands' | 'has_map_overgrowth';
  mapItemName?: string;
  mapCost?: number;
  themeColor: string;
  accentColor: string;
  bgColor: string;
  gridStrokeColor: string;
  description: string;
  resourceHighlight: string;
  saplingHighlight: string;
}

export const EXPEDITION_BIOMES: Record<string, BiomeDefinition> = {
  FOOTHILLS: {
    id: 'FOOTHILLS',
    name: 'Sunlit Foothills',
    subtitle: 'Gentle valleys & temperate woodland',
    batteryCostPerStep: 1,
    unlockedByDefault: true,
    themeColor: '#10b981',
    accentColor: '#34d399',
    bgColor: '#14532d',
    gridStrokeColor: 'rgba(52, 211, 153, 0.08)',
    description: 'Low resource spread with basic alloys and diverse temperate flora.',
    resourceHighlight: 'Common Scrap Metal, Copper Wire; Rare Gears',
    saplingHighlight: 'Raundo (Circle, Oval), Erementaru (Rain, Fire), Roku-men (Hex, Star)',
  },
  HIGHLANDS: {
    id: 'HIGHLANDS',
    name: 'Misty Highlands',
    subtitle: 'Rugged ridges shrouded in dense fog',
    batteryCostPerStep: 2,
    unlockedByDefault: false,
    requiredMapKey: 'has_map_highlands',
    mapItemName: 'Misty Highlands Chart',
    mapCost: 250,
    themeColor: '#0ea5e9',
    accentColor: '#38bdf8',
    bgColor: '#0f3d4c',
    gridStrokeColor: 'rgba(56, 189, 248, 0.1)',
    description: 'Moderate spread of mechanical components and dynamic elemental, nature & pointed flora.',
    resourceHighlight: 'Copper Wire, Brass Gears, Circuit Boards',
    saplingHighlight: 'Feather, Snail, Triangle, Arrow, Cloud, Donut, Snowflake',
  },
  OVERGROWTH: {
    id: 'OVERGROWTH',
    name: 'Ancient Caldera',
    subtitle: 'Volcanic caldera & primeval root kingdom',
    batteryCostPerStep: 3,
    unlockedByDefault: false,
    requiredMapKey: 'has_map_overgrowth',
    mapItemName: 'Ancient Caldera Map',
    mapCost: 800,
    themeColor: '#a855f7',
    accentColor: '#c084fc',
    bgColor: '#3b0764',
    gridStrokeColor: 'rgba(192, 132, 252, 0.12)',
    description: 'Rich, dense nodes of high-tech components, crafted relics and sacred geometric flora.',
    resourceHighlight: 'Circuit Boards, Electronic Chips, Plentiful Gears',
    saplingHighlight: 'Cube, Bell, Shield, Diamond, Rectangle, Gear, Eye, Snowflake',
  },
};

export function getExpeditionBiomeDef(id?: string): BiomeDefinition {
  return EXPEDITION_BIOMES[id || 'FOOTHILLS'] || EXPEDITION_BIOMES['FOOTHILLS'];
}

export type CraftingRecipeId =
  | 'crafting_automaton'
  | 'tier1_automaton'
  | 'tier2_automaton'
  | 'tier3_automaton'
  | 'auto_fabricator'
  | 'solar_panel'
  | 'wind_turbine'
  | 'craft_enriched_compost'
  | 'craft_copper_wire'
  | 'craft_gears'
  | 'craft_microcircuits'
  | 'craft_quantum_chips'
  | 'rover_chassis_t2'
  | 'rover_chassis_t3'
  | 'rover_storage_module_1'
  | 'rover_storage_module_2'
  | 'rover_storage_module_3'
  | 'rover_battery_module_1'
  | 'rover_battery_module_2'
  | 'rover_battery_module_3'
  | 'rover_radar_module_1'
  | 'rover_radar_module_2'
  | 'rover_radar_module_3'
  | 'workbench_t2_upgrade'
  | 'workbench_t3_upgrade';

export type WorkbenchCategory =
  | 'resources'
  | 'bonsai_automatons'
  | 'workbench'
  | 'rover'
  | 'electricity'
  | 'automatons'
  | 'upgrades'
  | 'modules'
  | 'compost';

export interface CraftingRecipeDef {
  id: CraftingRecipeId;
  name: string;
  category: WorkbenchCategory;
  durationSeconds: number;
  description: string;
  icon: string;
  requiresGuide?:
    | 'has_compost_guide'
    | 'has_tier1_guide'
    | 'has_tier2_guide'
    | 'has_tier3_guide'
    | 'has_auto_fabricator_guide'
    | 'has_workbench_t2_guide'
    | 'has_workbench_t3_guide'
    | 'has_rover_t2_blueprint'
    | 'has_rover_t3_blueprint'
    | 'has_storage_module_1_guide'
    | 'has_storage_module_2_guide'
    | 'has_storage_module_3_guide'
    | 'has_battery_module_1_guide'
    | 'has_battery_module_2_guide'
    | 'has_battery_module_3_guide'
    | 'has_radar_module_1_guide'
    | 'has_radar_module_2_guide'
    | 'has_radar_module_3_guide';
  guideName?: string;
  costs: {
    scrap_metal?: number;
    copper_wire?: number;
    brass_gears?: number;
    circuit_boards?: number;
    electronic_chips?: number;
    organic_waste?: number;
  };
}

export const WORKBENCH_RECIPES: Record<CraftingRecipeId, CraftingRecipeDef> = {
  crafting_automaton: {
    id: 'crafting_automaton',
    name: 'Crafting Assembly Automaton',
    category: 'workbench',
    durationSeconds: 8,
    description: 'Modular assembly arm for Workbench. When attached, adds +1 Queue Slot and +25% craft speed (3 kW). Can be attached or detached in Manage Modules.',
    icon: '🤖',
    costs: {scrap_metal: 3, copper_wire: 2, brass_gears: 1},
  },
  tier1_automaton: {
    id: 'tier1_automaton',
    name: 'Basic Mist Automaton (Tier 1)',
    category: 'bonsai_automatons',
    durationSeconds: 12,
    description: 'Gentle mist nozzles water bonsai at 1.0x baseline speed (2 kW).',
    icon: '💧',
    requiresGuide: 'has_tier1_guide',
    guideName: 'Tier 1 Mist Irrigation Guidebook',
    costs: {scrap_metal: 5, copper_wire: 4, brass_gears: 2},
  },
  tier2_automaton: {
    id: 'tier2_automaton',
    name: 'Advanced Pulsar Automaton (Tier 2)',
    category: 'bonsai_automatons',
    durationSeconds: 18,
    description: 'Pressurized micro-pulsars water bonsai at 2.5x speed (4 kW).',
    icon: '⚡',
    requiresGuide: 'has_tier2_guide',
    guideName: 'Tier 2 Pulsar Irrigation Guidebook',
    costs: {scrap_metal: 6, copper_wire: 4, brass_gears: 3, circuit_boards: 1},
  },
  tier3_automaton: {
    id: 'tier3_automaton',
    name: 'Master Hydro-Automaton (Tier 3)',
    category: 'bonsai_automatons',
    durationSeconds: 25,
    description: 'Supercharged hydro-nanite sprayers water bonsai at 5.0x ultra speed (7 kW).',
    icon: '✨',
    requiresGuide: 'has_tier3_guide',
    guideName: 'Tier 3 Hydro Irrigation Guidebook',
    costs: {scrap_metal: 8, copper_wire: 6, brass_gears: 4, circuit_boards: 2, electronic_chips: 1},
  },
  auto_fabricator: {
    id: 'auto_fabricator',
    name: 'Auto-Fabrication Automaton',
    category: 'workbench',
    durationSeconds: 30,
    description: 'Dedicated automated production lane unit. When attached to Workbench, runs its own independent continuous crafting loop (10 kW).',
    icon: '🏭',
    requiresGuide: 'has_auto_fabricator_guide',
    guideName: 'Auto-Fabrication Blueprint Guidebook',
    costs: {scrap_metal: 12, copper_wire: 10, brass_gears: 6, circuit_boards: 4, electronic_chips: 2},
  },
  solar_panel: {
    id: 'solar_panel',
    name: 'Solar Panel Generator (+3 kW)',
    category: 'electricity',
    durationSeconds: 10,
    description: 'Portable solar array. Deploy onto any open grid plot to generate 3 kW (+0.5 kW per adjacent solar panel). Can be dismantled anytime.',
    icon: '☀️',
    costs: {scrap_metal: 4, copper_wire: 3},
  },
  wind_turbine: {
    id: 'wind_turbine',
    name: 'Wind Turbine Generator (+6 kW)',
    category: 'electricity',
    durationSeconds: 15,
    description: 'Portable aero-helix turbine. Deploy onto any open grid plot to generate 6 kW (+1.0 kW per adjacent wind turbine). Can be dismantled anytime.',
    icon: '💨',
    costs: {scrap_metal: 5, copper_wire: 2, brass_gears: 3},
  },
  craft_enriched_compost: {
    id: 'craft_enriched_compost',
    name: 'Enriched Compost',
    category: 'resources',
    durationSeconds: 5,
    description: 'Refine 2 Organic Waste into 1 Enriched Compost in 5 seconds.',
    icon: '🌾',
    requiresGuide: 'has_compost_guide',
    guideName: 'Compost Guidebook',
    costs: {organic_waste: 2},
  },
  craft_copper_wire: {
    id: 'craft_copper_wire',
    name: 'Copper Wire',
    category: 'resources',
    durationSeconds: 5,
    description: 'Transmute 4 Scrap Metal into 1 conductive Copper Wire in the crafting queue (5s duration).',
    icon: '⚡',
    costs: {scrap_metal: 4},
  },
  craft_gears: {
    id: 'craft_gears',
    name: 'Mechanical Gear',
    category: 'resources',
    durationSeconds: 8,
    description: 'Precision-mill 4 Copper Wire into 1 Mechanical Gear in the crafting queue (8s duration).',
    icon: '⚙️',
    costs: {copper_wire: 4},
  },
  craft_microcircuits: {
    id: 'craft_microcircuits',
    name: 'Microcircuit',
    category: 'resources',
    durationSeconds: 12,
    description: 'Etch and solder 4 Mechanical Gears into 1 high-density Microcircuit in the crafting queue (12s duration).',
    icon: '🟩',
    costs: {brass_gears: 4},
  },
  craft_quantum_chips: {
    id: 'craft_quantum_chips',
    name: 'Quantum Chip',
    category: 'resources',
    durationSeconds: 20,
    description: 'Crystallize 4 Microcircuits into 1 advanced Quantum Chip in the crafting queue (20s duration).',
    icon: '💎',
    costs: {circuit_boards: 4},
  },
  rover_chassis_t2: {
    id: 'rover_chassis_t2',
    name: 'Surveyor Chassis (Tier 2 Upgrade)',
    category: 'rover',
    durationSeconds: 20,
    description: 'Reinforces Rover chassis with surveyor brackets. Expands outfitting module capacity from 3 to 5 slots.',
    icon: '🚜',
    requiresGuide: 'has_rover_t2_blueprint',
    guideName: 'Rover T2 Blueprint',
    costs: {scrap_metal: 12, copper_wire: 8, brass_gears: 4},
  },
  rover_chassis_t3: {
    id: 'rover_chassis_t3',
    name: 'Vanguard Heavy Chassis (Tier 3 Upgrade)',
    category: 'rover',
    durationSeconds: 35,
    description: 'Masterwork titanium chassis structure with heavy power busbars. Expands outfitting module capacity to 10 slots.',
    icon: '👑',
    requiresGuide: 'has_rover_t3_blueprint',
    guideName: 'Rover T3 Blueprint',
    costs: {scrap_metal: 24, copper_wire: 16, brass_gears: 8, circuit_boards: 4},
  },
  rover_storage_module_1: {
    id: 'rover_storage_module_1',
    name: 'Storage Module I (+2.5 kg)',
    category: 'rover',
    durationSeconds: 10,
    description: 'Modular cargo bin outfitting. Expands Rover carrying capacity by +2.5 kg when attached.',
    icon: '📦',
    requiresGuide: 'has_storage_module_1_guide',
    guideName: 'Storage Module I Guidebook',
    costs: {scrap_metal: 6, copper_wire: 4},
  },
  rover_storage_module_2: {
    id: 'rover_storage_module_2',
    name: 'Storage Module II (+5.0 kg)',
    category: 'rover',
    durationSeconds: 16,
    description: 'Reinforced pneumatic cargo module. Expands Rover carrying capacity by +5.0 kg when attached.',
    icon: '📦',
    requiresGuide: 'has_storage_module_2_guide',
    guideName: 'Storage Module II Guidebook',
    costs: {copper_wire: 10, brass_gears: 6},
  },
  rover_storage_module_3: {
    id: 'rover_storage_module_3',
    name: 'Storage Module III (+7.5 kg)',
    category: 'rover',
    durationSeconds: 24,
    description: 'Titanium-alloy high-capacity cargo rack. Expands Rover carrying capacity by +7.5 kg when attached.',
    icon: '🚜',
    requiresGuide: 'has_storage_module_3_guide',
    guideName: 'Storage Module III Guidebook',
    costs: {brass_gears: 10, circuit_boards: 6},
  },
  rover_battery_module_1: {
    id: 'rover_battery_module_1',
    name: 'Battery Module I (+25 kWh)',
    category: 'rover',
    durationSeconds: 10,
    description: 'Auxiliary lead-acid battery cell. Increases Rover battery energy by +25 kWh when attached.',
    icon: '🔋',
    requiresGuide: 'has_battery_module_1_guide',
    guideName: 'Battery Module I Guidebook',
    costs: {scrap_metal: 6, copper_wire: 6},
  },
  rover_battery_module_2: {
    id: 'rover_battery_module_2',
    name: 'Battery Module II (+50 kWh)',
    category: 'rover',
    durationSeconds: 16,
    description: 'Reinforced nickel-iron regenerative battery pack. Increases Rover battery energy by +50 kWh when attached.',
    icon: '⚡',
    requiresGuide: 'has_battery_module_2_guide',
    guideName: 'Battery Module II Guidebook',
    costs: {copper_wire: 8, brass_gears: 6},
  },
  rover_battery_module_3: {
    id: 'rover_battery_module_3',
    name: 'Battery Module III (+75 kWh)',
    category: 'rover',
    durationSeconds: 24,
    description: 'Solid-state high-density lithium matrix. Increases Rover battery energy by +75 kWh when attached.',
    icon: '✨',
    requiresGuide: 'has_battery_module_3_guide',
    guideName: 'Battery Module III Guidebook',
    costs: {brass_gears: 8, circuit_boards: 6},
  },
  rover_radar_module_1: {
    id: 'rover_radar_module_1',
    name: 'Radar Module I (+1 Step)',
    category: 'rover',
    durationSeconds: 10,
    description: 'Modular high-frequency scanner. Expands expedition Fog of War vision by +1 step when attached (Radius 2 + 1 = 3).',
    icon: '📡',
    requiresGuide: 'has_radar_module_1_guide',
    guideName: 'Radar Module I Guidebook',
    costs: {scrap_metal: 6, copper_wire: 4},
  },
  rover_radar_module_2: {
    id: 'rover_radar_module_2',
    name: 'Radar Module II (+2 Steps)',
    category: 'rover',
    durationSeconds: 16,
    description: 'Pulsed radar antenna array. Expands expedition Fog of War vision by +2 steps when attached (Radius 2 + 2 = 4).',
    icon: '📡',
    requiresGuide: 'has_radar_module_2_guide',
    guideName: 'Radar Module II Guidebook',
    costs: {copper_wire: 8, brass_gears: 4, circuit_boards: 1},
  },
  rover_radar_module_3: {
    id: 'rover_radar_module_3',
    name: 'Radar Module III (+3 Steps)',
    category: 'rover',
    durationSeconds: 24,
    description: 'Quantum bio-resonance radar core. Expands expedition Fog of War vision by +3 steps when attached (Radius 2 + 3 = 5).',
    icon: '📡',
    requiresGuide: 'has_radar_module_3_guide',
    guideName: 'Radar Module III Guidebook',
    costs: {brass_gears: 8, circuit_boards: 4, electronic_chips: 1},
  },
  workbench_t2_upgrade: {
    id: 'workbench_t2_upgrade',
    name: 'Tier 2 Precision Workbench Upgrade',
    category: 'workbench',
    durationSeconds: 20,
    description: 'Reinforces workbench frame with precision brass rails & dual conduit feeds. Expands automaton capacity from 3 to 5 units.',
    icon: '🛠️',
    requiresGuide: 'has_workbench_t2_guide',
    guideName: 'T2 Precision Workbench Blueprint',
    costs: {scrap_metal: 8, copper_wire: 6, brass_gears: 4, circuit_boards: 1},
  },
  workbench_t3_upgrade: {
    id: 'workbench_t3_upgrade',
    name: 'Tier 3 Master Foundry Upgrade',
    category: 'workbench',
    durationSeconds: 35,
    description: 'Masterwork gilded forge & nanite assembly core. Expands automaton capacity from 5 to 10 units with majestic gold/brass styling.',
    icon: '👑',
    requiresGuide: 'has_workbench_t3_guide',
    guideName: 'T3 Master Foundry Blueprint',
    costs: {scrap_metal: 15, copper_wire: 10, brass_gears: 8, circuit_boards: 4, electronic_chips: 2},
  },
};

export interface CraftingQueueItem {
  id: string;
  recipeId: CraftingRecipeId;
  name: string;
  totalTime: number;
  remainingTime: number;
  icon: string;
}

export interface AutomatonConfig {
  tier: AutomatonTier;
  name: string;
  speedMultiplier: number;
  kwDrain: number;
  description: string;
  cost: {
    scrap_metal: number;
    copper_wire: number;
    brass_gears: number;
    circuit_boards: number;
    electronic_chips: number;
  };
}

export const AUTOMATON_TIERS: Record<number, AutomatonConfig> = {
  1: {
    tier: 1,
    name: 'Basic Mist Automaton',
    speedMultiplier: 1.0,
    kwDrain: 2,
    description: 'Gentle mist nozzles water bonsai at 1.0x baseline speed.',
    cost: {
      scrap_metal: 5,
      copper_wire: 4,
      brass_gears: 2,
      circuit_boards: 0,
      electronic_chips: 0,
    },
  },
  2: {
    tier: 2,
    name: 'Advanced Pulsar Automaton',
    speedMultiplier: 2.5,
    kwDrain: 4,
    description: 'Pressurized micro-pulsars water bonsai at 2.5x speed.',
    cost: {
      scrap_metal: 6,
      copper_wire: 4,
      brass_gears: 3,
      circuit_boards: 1,
      electronic_chips: 0,
    },
  },
  3: {
    tier: 3,
    name: 'Master Hydro-Automaton',
    speedMultiplier: 5.0,
    kwDrain: 7,
    description: 'Supercharged hydro-nanite sprayers water bonsai at 5.0x ultra speed.',
    cost: {
      scrap_metal: 8,
      copper_wire: 6,
      brass_gears: 4,
      circuit_boards: 2,
      electronic_chips: 1,
    },
  },
};

export const ROVER_MODULE_CONFIGS: Record<RoverModuleType, RoverModuleConfig> = {
  storage_1: {
    id: 'storage_1',
    name: 'Storage Module I',
    category: 'storage',
    tier: 1,
    icon: '📦',
    bonusValue: 2.5,
    bonusLabel: '+2.5 kg Cargo',
    description: 'Welded alloy cargo bin outfitting. Expands Rover carrying capacity by +2.5 kg.',
  },
  storage_2: {
    id: 'storage_2',
    name: 'Storage Module II',
    category: 'storage',
    tier: 2,
    icon: '📦',
    bonusValue: 5.0,
    bonusLabel: '+5.0 kg Cargo',
    description: 'Reinforced pneumatic cargo module. Expands Rover carrying capacity by +5.0 kg.',
  },
  storage_3: {
    id: 'storage_3',
    name: 'Storage Module III',
    category: 'storage',
    tier: 3,
    icon: '🚜',
    bonusValue: 7.5,
    bonusLabel: '+7.5 kg Cargo',
    description: 'Titanium-alloy high-capacity cargo rack. Expands Rover carrying capacity by +7.5 kg.',
  },
  battery_1: {
    id: 'battery_1',
    name: 'Battery Module I',
    category: 'battery',
    tier: 1,
    icon: '🔋',
    bonusValue: 25,
    bonusLabel: '+25 kWh Battery',
    description: 'Auxiliary lead-acid battery cell. Increases Rover battery energy by +25 kWh.',
  },
  battery_2: {
    id: 'battery_2',
    name: 'Battery Module II',
    category: 'battery',
    tier: 2,
    icon: '⚡',
    bonusValue: 50,
    bonusLabel: '+50 kWh Battery',
    description: 'Reinforced nickel-iron regenerative battery pack. Increases Rover battery energy by +50 kWh.',
  },
  battery_3: {
    id: 'battery_3',
    name: 'Battery Module III',
    category: 'battery',
    tier: 3,
    icon: '✨',
    bonusValue: 75,
    bonusLabel: '+75 kWh Battery',
    description: 'Solid-state high-density lithium matrix. Increases Rover battery energy by +75 kWh.',
  },
  radar_1: {
    id: 'radar_1',
    name: 'Radar Module I',
    category: 'radar',
    tier: 1,
    icon: '📡',
    bonusValue: 1,
    bonusLabel: '+1 Step Vision',
    description: 'High-frequency radar scanner outfitting. Expands Rover Fog of War vision by +1 step when attached.',
  },
  radar_2: {
    id: 'radar_2',
    name: 'Radar Module II',
    category: 'radar',
    tier: 2,
    icon: '📡',
    bonusValue: 2,
    bonusLabel: '+2 Steps Vision',
    description: 'Pulsed radar antenna array outfitting. Expands Rover Fog of War vision by +2 steps when attached.',
  },
  radar_3: {
    id: 'radar_3',
    name: 'Radar Module III',
    category: 'radar',
    tier: 3,
    icon: '📡',
    bonusValue: 3,
    bonusLabel: '+3 Steps Vision',
    description: 'Quantum bio-resonance radar core outfitting. Expands Rover Fog of War vision by +3 steps when attached.',
  },
};

export function getRoverChassisName(tier: RoverChassisTier): string {
  if (tier === 3) return 'Vanguard Heavy Chassis';
  if (tier === 2) return 'Surveyor Chassis';
  return 'Scout Chassis';
}

export function getRoverChassisMaxSlots(tier: RoverChassisTier): number {
  if (tier === 3) return 10;
  if (tier === 2) return 5;
  return 3;
}

// Miniature Live Canvas Preview for Bonsai Styles (imported from DeploymentModal)
export { BonsaiStyleThumbnail };

// =========================================================================
// QUICK BONSAI RADIAL CROSS MENU COMPONENT (Q / Y CONTROLLER CROSS)
// =========================================================================

export interface QuickBonsaiRadialMenuProps {
  bonsai: PlantedBonsai;
  inventory: SanctuaryInventory;
  onSell: (id: string) => void;
  onStore: (id: string) => void;
  onCompost: (id: string) => void;
  onClose: () => void;
}

export function QuickBonsaiRadialMenu({
  bonsai,
  inventory,
  onSell,
  onStore,
  onCompost,
  onClose,
}: QuickBonsaiRadialMenuProps) {
  const sellPrice = calculateDonationValue(bonsai);
  const compostCount = inventory.organic_compost ?? inventory.enrichedCompost ?? 0;
  const matDef = getMaturityDef(bonsai.maturity);

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs select-none animate-in fade-in zoom-in-95 duration-150">
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-72 h-72 sm:w-88 sm:h-88 flex items-center justify-center">
        {/* Luminous circular backdrop glow */}
        <div className="absolute inset-2 sm:inset-4 rounded-full border-2 border-emerald-500/40 bg-slate-950/85 shadow-[0_0_50px_rgba(16,185,129,0.35)] pointer-events-none" />

        {/* UP QUADRANT: Quick Sell */}
        <button
          onClick={() => {
            onSell(bonsai.id);
            onClose();
          }}
          className="absolute top-0 left-1/2 -translate-x-1/2 w-36 sm:w-44 py-2 sm:py-2.5 px-2 rounded-2xl bg-gradient-to-b from-amber-950 via-slate-900 to-slate-950 border-2 border-amber-400 text-amber-200 shadow-xl hover:scale-105 active:scale-95 transition-all flex flex-col items-center gap-0.5 group cursor-pointer">
          <span className="text-[9px] sm:text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
            <span>⬆ [W / ↑ / D-Pad Up]</span>
          </span>
          <span className="text-xs sm:text-sm font-black text-amber-300 flex items-center gap-1">
            <VerdureIcon className="w-3.5 h-3.5" />
            <span>Sell (+{sellPrice} Verdure)</span>
          </span>
        </button>

        {/* DOWN QUADRANT: Store Bonsai */}
        <button
          onClick={() => {
            onStore(bonsai.id);
            onClose();
          }}
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-36 sm:w-44 py-2 sm:py-2.5 px-2 rounded-2xl bg-gradient-to-t from-sky-950 via-slate-900 to-slate-950 border-2 border-sky-400 text-sky-200 shadow-xl hover:scale-105 active:scale-95 transition-all flex flex-col items-center gap-0.5 group cursor-pointer">
          <span className="text-xs sm:text-sm font-black text-sky-300 flex items-center gap-1">
            <span>🪴</span>
            <span>Store to Bag</span>
          </span>
          <span className="text-[9px] sm:text-[10px] font-mono font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1">
            <span>⬇ [S / ↓ / D-Pad Down]</span>
          </span>
        </button>

        {/* LEFT QUADRANT: Give Compost */}
        <button
          onClick={() => {
            if (compostCount > 0) {
              onCompost(bonsai.id);
              onClose();
            } else {
              gameAudio?.playErrorBuzz?.();
            }
          }}
          className={`absolute left-0 top-1/2 -translate-y-1/2 w-32 sm:w-40 py-2 sm:py-2.5 px-1.5 rounded-2xl border-2 shadow-xl hover:scale-105 active:scale-95 transition-all flex flex-col items-center gap-0.5 ${
            compostCount > 0
              ? 'bg-gradient-to-r from-lime-950 via-slate-900 to-slate-950 border-lime-400 text-lime-200 cursor-pointer'
              : 'bg-slate-950/90 border-slate-700 text-slate-500 opacity-60 cursor-not-allowed'
          }`}>
          <span className="text-[9px] sm:text-[10px] font-mono font-bold text-lime-400 uppercase tracking-wider">
            ⬅ [A / ← / Left]
          </span>
          <span className="text-xs sm:text-sm font-black truncate">
            🌾 Compost ({compostCount > 0 ? `${compostCount}` : 'None'})
          </span>
        </button>

        {/* RIGHT QUADRANT: Give Fertilizer (Locked / Grey) */}
        <button
          disabled
          onClick={() => {
            gameAudio?.playErrorBuzz?.();
          }}
          className="absolute right-0 top-1/2 -translate-y-1/2 w-32 sm:w-40 py-2 sm:py-2.5 px-1.5 rounded-2xl border-2 border-slate-700 bg-slate-950/90 text-slate-500 opacity-50 shadow-xl flex flex-col items-center gap-0.5 cursor-not-allowed">
          <span className="text-[9px] sm:text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">
            ➡ [D / → / Right]
          </span>
          <span className="text-xs sm:text-sm font-bold truncate">
            🧪 Fertilizer (Locked)
          </span>
        </button>

        {/* CENTER HUB */}
        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-slate-900/95 border-2 border-emerald-400/80 shadow-2xl flex flex-col items-center justify-center p-1.5 text-center z-10">
          <div
            style={{ color: matDef.color }}
            className="text-[11px] font-black flex items-center gap-0.5">
            <span>{matDef.kanji}</span>
            <span>Lv.{bonsai.level}</span>
          </div>
          <div className="text-[11px] font-bold text-slate-100 truncate max-w-[80px] my-0.5">
            {bonsai.name}
          </div>
          <span className="text-[8.5px] text-slate-400 font-mono bg-slate-950 px-1 py-0.2 rounded border border-slate-800">
            [Esc / B / Q / Y]
          </span>
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// ROVER GARAGE DISCOVERY CODEX SPECIFICATIONS & PREVIEW BOXES
// =========================================================================

export interface AreaDiscoveryState {
  species: Record<ExpeditionBiomeId, BonsaiLeafType[]>;
  maturities: Record<ExpeditionBiomeId, MaturityTier[]>;
  resources: Record<ExpeditionBiomeId, ResourceItemKey[]>;
}

export const BIOME_CODEX_SPECIES: Record<ExpeditionBiomeId, BonsaiLeafType[]> = {
  FOOTHILLS: ['circle', 'oval', 'raindrop', 'fire', 'hexagon', 'star'],
  HIGHLANDS: ['circle', 'circle_hole', 'raindrop', 'cloud', 'snowflake', 'feather', 'snail', 'triangle', 'arrow'],
  OVERGROWTH: ['fire', 'hexagon', 'snowflake', 'eye', 'shield', 'diamond', 'cube', 'rectangle', 'gear', 'bell'],
};

export const BIOME_CODEX_MATURITIES: Record<ExpeditionBiomeId, MaturityTier[]> = {
  FOOTHILLS: ['sprout', 'sapling', 'notable'],
  HIGHLANDS: ['sprout', 'sapling', 'notable', 'refined'],
  OVERGROWTH: ['sprout', 'sapling', 'notable', 'refined', 'premium'],
};

export const BIOME_CODEX_RESOURCES: Record<ExpeditionBiomeId, ResourceItemKey[]> = {
  FOOTHILLS: ['scrap_metal', 'copper_wire', 'scrap_metal_double'],
  HIGHLANDS: ['scrap_metal', 'copper_wire', 'scrap_metal_double', 'copper_wire_double'],
  OVERGROWTH: ['scrap_metal', 'copper_wire', 'scrap_metal_double', 'copper_wire_double', 'brass_gears'],
};

export const CODEX_RESOURCE_ICONS: Record<ResourceItemKey, string> = {
  scrap_metal: '🔩',
  copper_wire: '⚡',
  brass_gears: '⚙️',
  circuit_boards: '🟩',
  electronic_chips: '💎',
  scrap_metal_double: '🔩x2',
  copper_wire_double: '⚡x2',
};

/**
 * Crisp high-contrast vector graphics for codex resource items.
 * Scrap (2x) and Wire (2x) directly double their 1x siblings with identical stroke and fill styling.
 */
function CodexResourceVectorArt({ resKey }: { resKey: ResourceItemKey }) {
  if (resKey === 'scrap_metal') {
    return (
      <svg className="w-5 h-5 drop-shadow" viewBox="0 0 24 24" fill="none">
        {/* Single angled rusty metal bracket plate with golden rivets */}
        <path
          d="M4.5 6L18 3.5L20 17.5L6.5 20Z"
          fill="#b45309"
          stroke="#fef08a"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
        <path d="M6.5 7.2L17 5.2L18.5 16.5L8 18.5Z" fill="#d97706" />
        <circle cx="8" cy="8.5" r="1.1" fill="#fef08a" stroke="#78350f" strokeWidth="0.5" />
        <circle cx="16" cy="6.8" r="1.1" fill="#fef08a" stroke="#78350f" strokeWidth="0.5" />
        <circle cx="17.2" cy="15.2" r="1.1" fill="#fef08a" stroke="#78350f" strokeWidth="0.5" />
        <circle cx="9.2" cy="17" r="1.1" fill="#fef08a" stroke="#78350f" strokeWidth="0.5" />
      </svg>
    );
  }

  if (resKey === 'scrap_metal_double') {
    return (
      <svg className="w-6 h-6 drop-shadow" viewBox="0 0 26 24" fill="none">
        {/* Two identical angled rusty metal plates/brackets stacked side-by-side with slight offset and shadow */}
        {/* Left / Back Plate */}
        <g transform="translate(-1, 1)">
          <path
            d="M3 6.5L14.5 4.5L16.2 16.5L4.8 18.5Z"
            fill="#92400e"
            stroke="#fde047"
            strokeWidth="1.1"
            strokeLinejoin="round"
          />
          <path d="M4.8 7.5L13.8 5.8L15 15.6L6 17.2Z" fill="#b45309" />
          <circle cx="6" cy="8.6" r="0.9" fill="#fef08a" stroke="#78350f" strokeWidth="0.4" />
          <circle cx="13" cy="7.2" r="0.9" fill="#fef08a" stroke="#78350f" strokeWidth="0.4" />
          <circle cx="6.8" cy="15.8" r="0.9" fill="#fef08a" stroke="#78350f" strokeWidth="0.4" />
        </g>
        {/* Cast shadow behind front plate */}
        <path d="M10 7L21.5 5L23.2 17L11.8 19Z" fill="rgba(0,0,0,0.4)" />
        {/* Right / Front Plate (Identical styling directly doubling 1x) */}
        <g transform="translate(8, -1)">
          <path
            d="M3 6.5L14.5 4.5L16.2 16.5L4.8 18.5Z"
            fill="#b45309"
            stroke="#fef08a"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
          <path d="M4.8 7.5L13.8 5.8L15 15.6L6 17.2Z" fill="#d97706" />
          <circle cx="6" cy="8.6" r="1.0" fill="#fef08a" stroke="#78350f" strokeWidth="0.5" />
          <circle cx="13" cy="7.2" r="1.0" fill="#fef08a" stroke="#78350f" strokeWidth="0.5" />
          <circle cx="14" cy="14.8" r="1.0" fill="#fef08a" stroke="#78350f" strokeWidth="0.5" />
          <circle cx="6.8" cy="15.8" r="1.0" fill="#fef08a" stroke="#78350f" strokeWidth="0.5" />
        </g>
      </svg>
    );
  }

  if (resKey === 'copper_wire') {
    return (
      <svg className="w-5 h-5 drop-shadow" viewBox="0 0 24 24" fill="none">
        {/* Single copper wire coil/spool */}
        <ellipse cx="12" cy="5.5" rx="7.5" ry="3" fill="#78350f" stroke="#fb923c" strokeWidth="1.1" />
        <ellipse cx="12" cy="18.5" rx="7.5" ry="3" fill="#78350f" stroke="#fb923c" strokeWidth="1.1" />
        <rect x="5.5" y="5.5" width="13" height="13" fill="#ea580c" />
        <line x1="5.5" y1="8.5" x2="18.5" y2="8.5" stroke="#fed7aa" strokeWidth="1.2" />
        <line x1="5.5" y1="11.5" x2="18.5" y2="11.5" stroke="#fed7aa" strokeWidth="1.2" />
        <line x1="5.5" y1="14.5" x2="18.5" y2="14.5" stroke="#fed7aa" strokeWidth="1.2" />
        <ellipse cx="12" cy="5.5" rx="3" ry="1.4" fill="#fef08a" stroke="#b45309" strokeWidth="0.6" />
      </svg>
    );
  }

  if (resKey === 'copper_wire_double') {
    return (
      <svg className="w-6 h-6 drop-shadow" viewBox="0 0 26 24" fill="none">
        {/* Two identical copper wire coils/spools side-by-side */}
        {/* Left Spool */}
        <g transform="translate(-4, 0) scale(0.85)">
          <ellipse cx="11" cy="6" rx="6.5" ry="2.7" fill="#78350f" stroke="#fb923c" strokeWidth="1.1" />
          <ellipse cx="11" cy="18" rx="6.5" ry="2.7" fill="#78350f" stroke="#fb923c" strokeWidth="1.1" />
          <rect x="5.5" y="6" width="11" height="12" fill="#ea580c" />
          <line x1="5.5" y1="9" x2="16.5" y2="9" stroke="#fed7aa" strokeWidth="1.1" />
          <line x1="5.5" y1="12" x2="16.5" y2="12" stroke="#fed7aa" strokeWidth="1.1" />
          <line x1="5.5" y1="15" x2="16.5" y2="15" stroke="#fed7aa" strokeWidth="1.1" />
          <ellipse cx="11" cy="6" rx="2.6" ry="1.2" fill="#fef08a" stroke="#b45309" strokeWidth="0.5" />
        </g>
        {/* Right Spool (identical) */}
        <g transform="translate(8, 0) scale(0.85)">
          <ellipse cx="11" cy="6" rx="6.5" ry="2.7" fill="#78350f" stroke="#fb923c" strokeWidth="1.1" />
          <ellipse cx="11" cy="18" rx="6.5" ry="2.7" fill="#78350f" stroke="#fb923c" strokeWidth="1.1" />
          <rect x="5.5" y="6" width="11" height="12" fill="#ea580c" />
          <line x1="5.5" y1="9" x2="16.5" y2="9" stroke="#fed7aa" strokeWidth="1.1" />
          <line x1="5.5" y1="12" x2="16.5" y2="12" stroke="#fed7aa" strokeWidth="1.1" />
          <line x1="5.5" y1="15" x2="16.5" y2="15" stroke="#fed7aa" strokeWidth="1.1" />
          <ellipse cx="11" cy="6" rx="2.6" ry="1.2" fill="#fef08a" stroke="#b45309" strokeWidth="0.5" />
        </g>
      </svg>
    );
  }

  if (resKey === 'brass_gears') {
    return (
      <svg className="w-5 h-5 drop-shadow" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 2L13.5 4.5L16.5 4L16.8 7L19.8 8L18.8 11L21 13L19 15.5L19.8 18.5L16.8 19L15.5 21.8L12.5 20.8L10 22.5L8.5 20L5.5 20.5L5.2 17.5L2.2 16.5L3.2 13.5L1 11.5L3 9L2.2 6L5.2 5.5L6.5 2.8L9.5 3.8Z"
          fill="#f59e0b"
          stroke="#fde047"
          strokeWidth="1.2"
        />
        <circle cx="12" cy="12" r="4.2" fill="#78350f" stroke="#fde047" strokeWidth="1" />
        <circle cx="12" cy="12" r="2.2" fill="#fef08a" />
      </svg>
    );
  }

  if (resKey === 'circuit_boards') {
    return (
      <svg className="w-5 h-5 drop-shadow" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="3" width="18" height="18" rx="3" fill="#047857" stroke="#34d399" strokeWidth="1.4" />
        <rect x="7" y="7" width="10" height="10" rx="1.5" fill="#064e3b" stroke="#fde047" strokeWidth="1" />
        <circle cx="12" cy="12" r="2" fill="#38bdf8" />
        <line x1="7" y1="4" x2="7" y2="7" stroke="#fde047" strokeWidth="1" />
        <line x1="12" y1="4" x2="12" y2="7" stroke="#fde047" strokeWidth="1" />
        <line x1="17" y1="4" x2="17" y2="7" stroke="#fde047" strokeWidth="1" />
        <line x1="7" y1="17" x2="7" y2="20" stroke="#fde047" strokeWidth="1" />
        <line x1="12" y1="17" x2="12" y2="20" stroke="#fde047" strokeWidth="1" />
        <line x1="17" y1="17" x2="17" y2="20" stroke="#fde047" strokeWidth="1" />
      </svg>
    );
  }

  if (resKey === 'electronic_chips') {
    return (
      <svg className="w-5 h-5 drop-shadow" viewBox="0 0 24 24" fill="none">
        <rect x="4" y="4" width="16" height="16" rx="2.5" fill="#1e1b4b" stroke="#a855f7" strokeWidth="1.4" />
        <circle cx="12" cy="12" r="4.5" fill="#38bdf8" stroke="#fde047" strokeWidth="1.2" />
        <circle cx="12" cy="12" r="2" fill="#ffffff" />
        <line x1="1" y1="8" x2="4" y2="8" stroke="#fde047" strokeWidth="1.2" />
        <line x1="1" y1="12" x2="4" y2="12" stroke="#fde047" strokeWidth="1.2" />
        <line x1="1" y1="16" x2="4" y2="16" stroke="#fde047" strokeWidth="1.2" />
        <line x1="20" y1="8" x2="23" y2="8" stroke="#fde047" strokeWidth="1.2" />
        <line x1="20" y1="12" x2="23" y2="12" stroke="#fde047" strokeWidth="1.2" />
        <line x1="20" y1="16" x2="23" y2="16" stroke="#fde047" strokeWidth="1.2" />
      </svg>
    );
  }

  return <span className="text-base">📦</span>;
}

function CodexResourceBox({
  resKey,
  discovered,
}: {
  resKey: ResourceItemKey;
  discovered: boolean;
}) {
  if (!discovered) {
    return (
      <div
        className="w-9 h-9 rounded-xl border border-dashed border-slate-700/60 bg-slate-900/40 flex items-center justify-center text-slate-600 text-xs font-bold select-none transition-all shadow-inner"
        aria-label="Undiscovered Resource">
        ?
      </div>
    );
  }

  const styles: Record<ResourceItemKey, { bg: string; border: string; glow: string; label: string }> = {
    scrap_metal: {
      bg: 'bg-gradient-to-br from-amber-950 via-amber-900 to-amber-950',
      border: 'border-amber-400',
      glow: 'shadow-[0_0_10px_rgba(251,191,36,0.4)]',
      label: 'Scrap Metal 1x',
    },
    scrap_metal_double: {
      bg: 'bg-gradient-to-br from-amber-900 via-amber-800 to-amber-950',
      border: 'border-amber-300',
      glow: 'shadow-[0_0_12px_rgba(245,158,11,0.55)]',
      label: 'Heavy Scrap 2x',
    },
    copper_wire: {
      bg: 'bg-gradient-to-br from-orange-950 via-orange-900 to-orange-950',
      border: 'border-orange-400',
      glow: 'shadow-[0_0_10px_rgba(249,115,22,0.4)]',
      label: 'Copper Wire 1x',
    },
    copper_wire_double: {
      bg: 'bg-gradient-to-br from-orange-900 via-orange-800 to-orange-950',
      border: 'border-orange-300',
      glow: 'shadow-[0_0_12px_rgba(234,88,12,0.55)]',
      label: 'Heavy Wire 2x',
    },
    brass_gears: {
      bg: 'bg-gradient-to-br from-yellow-950 via-yellow-900 to-yellow-950',
      border: 'border-yellow-400',
      glow: 'shadow-[0_0_10px_rgba(250,204,21,0.4)]',
      label: 'Mechanical Gears 1x',
    },
    circuit_boards: {
      bg: 'bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-950',
      border: 'border-emerald-400',
      glow: 'shadow-[0_0_10px_rgba(52,211,153,0.4)]',
      label: 'Circuit Boards',
    },
    electronic_chips: {
      bg: 'bg-gradient-to-br from-purple-950 via-purple-900 to-purple-950',
      border: 'border-purple-400',
      glow: 'shadow-[0_0_10px_rgba(192,132,252,0.4)]',
      label: 'Electronic Chips',
    },
  };

  const curStyle = styles[resKey] || {
    bg: 'bg-slate-900',
    border: 'border-slate-500',
    glow: 'shadow-sm',
    label: resKey,
  };

  return (
    <div
      title={curStyle.label}
      className={`w-9 h-9 rounded-xl border-2 ${curStyle.border} ${curStyle.bg} ${curStyle.glow} flex items-center justify-center p-0.5 transition-all select-none hover:scale-105`}>
      <CodexResourceVectorArt resKey={resKey} />
    </div>
  );
}

function CodexSeedlingVector({
  leafType,
  color,
  accentColor,
}: {
  leafType: BonsaiLeafType;
  color: string;
  accentColor: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const size = 36;
    canvas.width = size * 2;
    canvas.height = size * 2;
    ctx.setTransform(2, 0, 0, 2, 0, 0);
    ctx.clearRect(0, 0, size, size);

    // Mini ground shadow / soil base
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.beginPath();
    ctx.ellipse(18, 30, 9, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Little seedling stem
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 2.2;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(18, 30);
    ctx.quadraticCurveTo(16, 23, 18, 17);
    ctx.stroke();

    // Exact seedling foliage matching clean excavation minigame
    drawLeafShape(ctx, 18, 14, 9.5, leafType, color, accentColor);
  }, [leafType, color, accentColor]);

  return (
    <canvas
      ref={canvasRef}
      style={{width: 32, height: 32}}
      className="pointer-events-none drop-shadow-sm"
    />
  );
}

function CodexSeedlingBox({
  leafType,
  discovered,
}: {
  leafType: BonsaiLeafType;
  discovered: boolean;
}) {
  if (!discovered) {
    return (
      <div
        className="w-9 h-9 rounded-xl border border-dashed border-slate-700/60 bg-slate-900/40 flex items-center justify-center text-slate-600 text-xs font-bold select-none transition-all shadow-inner"
        aria-label="Undiscovered Species">
        ?
      </div>
    );
  }

  const def = getLeafTypeDef(leafType);

  return (
    <div
      title={`${def.name} (${def.group})`}
      style={{
        borderColor: def.color,
        backgroundColor: `${def.color}20`,
        boxShadow: `0 0 10px ${def.color}35`,
      }}
      className="w-9 h-9 rounded-xl border-2 flex items-center justify-center transition-all select-none hover:scale-105 overflow-hidden">
      <CodexSeedlingVector
        leafType={leafType}
        color={def.color}
        accentColor={def.accentColor}
      />
    </div>
  );
}

function CodexMaturityBox({
  matDef,
  discovered,
}: {
  matDef: MaturityDefinition;
  discovered: boolean;
}) {
  if (!discovered) {
    return (
      <div
        className="w-9 h-9 rounded-xl border border-dashed border-slate-700/60 bg-slate-900/40 flex items-center justify-center text-slate-600 text-xs font-bold select-none transition-all shadow-inner"
        aria-label="Undiscovered Maturity">
        ?
      </div>
    );
  }

  return (
    <div
      title={`${matDef.name} (Rank ${matDef.rank})`}
      style={{
        borderColor: matDef.border,
        backgroundColor: matDef.bg,
        color: matDef.color,
        boxShadow: `0 0 10px ${matDef.color}35`,
      }}
      className="w-9 h-9 rounded-xl border-2 flex items-center justify-center text-sm font-black transition-all select-none hover:scale-105">
      <span>{matDef.kanji}</span>
    </div>
  );
}

export function getAutomatonConfig(tier?: number): AutomatonConfig | undefined {
  if (!tier || tier <= 0) return undefined;
  return AUTOMATON_TIERS[tier];
}

export interface PruneEffect {
  id: string;
  x: number;
  y: number;
  startTime: number;
  duration: number; // 1000ms
}

export interface PlantedBonsai {
  id: string;
  leafType: BonsaiLeafType;
  group: BonsaiGroup;
  species?: string;
  style: BonsaiStyle;
  maturity: MaturityTier;
  name: string;
  rarity?: BonsaiRarity;
  nature?: BonsaiNature | string;
  level: number;
  progressSeconds: number;
  gridX: number;
  gridY: number;
  x: number;
  y: number;
  radius: number;
  color: string;
  flowerColor: string;
  potColor: string;
  potStyle: string;
  automatonTier: AutomatonTier; // 0 = none, 1, 2, 3
  pruneBoostTimer: number; // seconds remaining of 2.5x speed
  waterSprayAnim: number; // pulsating spray animation timer
  wateredTimer?: number; // duration in seconds of well groundwater hydration
  lastPruneTime?: number; // timestamp of last prune for 1.0s ring sync
  findOdds?: number;
  foundOdds?: number;
  attributes?: BonsaiAttributes;
  cultivationPotential?: CultivationPotential;
}

export interface StoredPottedBonsai {
  id: string;
  leafType: BonsaiLeafType;
  group: BonsaiGroup;
  species?: string;
  style: BonsaiStyle;
  maturity: MaturityTier;
  name: string;
  rarity?: BonsaiRarity;
  nature?: BonsaiNature | string;
  level: number;
  progressSeconds: number;
  color: string;
  flowerColor: string;
  potColor: string;
  potStyle: string;
  findOdds?: number;
  foundOdds?: number;
  attributes?: BonsaiAttributes;
  cultivationPotential?: CultivationPotential;
}

export interface StoredSapling {
  id?: string;
  leafType: BonsaiLeafType;
  group: BonsaiGroup;
  maturity: MaturityTier;
  species?: string;
  name: string;
  rarity?: BonsaiRarity;
  nature?: BonsaiNature | string;
  count: number;
  color: string;
  flowerColor: string;
  potColor: string;
  potStyle: string;
  findOdds?: number;
  foundOdds?: number;
  attributes?: BonsaiAttributes;
  geneticPotential?: BonsaiAttributes;
  cultivationPotential?: CultivationPotential;
}

export interface SanctuaryInventory {
  [key: string]: any;
  coins: number;
  player_level: number;
  player_exp: number;
  scrap_metal: number;
  copper_wire: number;
  brass_gears: number;
  circuit_boards: number;
  electronic_chips: number;
  organic_waste: number;
  organic_compost: number;
  seedlingList: SeedlingItem[];
  storedBonsais: (Bonsai | StoredPottedBonsai)[];
  has_compost_guide: boolean;
  has_tier1_guide: boolean;
  has_tier2_guide: boolean;
  has_tier3_guide: boolean;
  has_auto_fabricator_guide: boolean;
  has_workbench_t2_guide: boolean;
  has_workbench_t3_guide: boolean;
  workbench_tier: 1 | 2 | 3;
  crafting_automatons_inv: number; // uninstalled portable items in inventory
  auto_fabricators_inv: number;    // uninstalled portable items in inventory
  solar_panels_inv: number;        // portable deployables in inventory
  solar_panel_inv?: number;
  solarPanels?: number;
  wind_turbines_inv: number;       // portable deployables in inventory
  wind_turbine_inv?: number;
  windTurbines?: number;
  decor_pebble_path_inv: number;   // decorative deployables
  decor_rock_formation_inv: number;
  decor_shrubbery_bush_inv: number;
  decor_woven_wall_inv: number;
  torii_gate_inv?: number;
  crystal_pedestal_foliage_inv: number;
  crystal_pedestal_branches_inv: number;
  crystal_pedestal_trunk_inv: number;
  crystal_pedestal_roots_inv: number;
  decorations: {
    pebblePath: number;
    rockFormation: number;
    shrubbery: number;
    wovenWall: number;
    toriiGate?: number;
    torii_gate?: number;
    [key: string]: any;
  };
  tool_compost_heap_inv?: number;
  tool_garden_well_inv?: number;
  tools: {
    compostHeap: number;
    gardenWell: number;
  };
  rover_storage_tier: number;
  rover_battery_tier: number;
  zen_essence: number;
  automatons_tier1: number;
  automatons_tier2: number;
  automatons_tier3: number;
  rover_battery_level: number;
  rover_cargo_level: number;
  sanctuary_expansion_tier: number; // 0 = starter (12 plots: 4x3), 1 = +6 plots (18), 2 = +8 plots (26), 3 = full (36 plots)
  has_map_highlands: boolean;
  has_map_overgrowth: boolean;
  has_rover_t2_blueprint: boolean;
  has_rover_t3_blueprint: boolean;
  has_storage_module_1_guide: boolean;
  has_storage_module_2_guide: boolean;
  has_storage_module_3_guide: boolean;
  has_battery_module_1_guide: boolean;
  has_battery_module_2_guide: boolean;
  has_battery_module_3_guide: boolean;
  has_radar_module_1_guide: boolean;
  has_radar_module_2_guide: boolean;
  has_radar_module_3_guide: boolean;
  rover_chassis_tier: RoverChassisTier;
  rover_modules: Record<RoverModuleType, number>;
  roverModules?: { [key in RoverModuleType]?: number };
  attached_rover_modules: RoverModuleType[];
  attachedRoverModules?: RoverModuleType[];
}

export function getInventoryStructureKey(type: DeployedStructureType): string {
  if (type === 'solar_panel') return 'solar_panels_inv';
  if (type === 'wind_turbine') return 'wind_turbines_inv';
  if (type === 'torii_gate') return 'torii_gate_inv';
  return `${type}_inv`;
}

export function getStructureInventoryCount(inv: SanctuaryInventory, type: DeployedStructureType): number {
  if (type === 'solar_panel') {
    return inv.solar_panels_inv ?? inv.solar_panel_inv ?? inv.solarPanels ?? 0;
  }
  if (type === 'wind_turbine') {
    return inv.wind_turbines_inv ?? inv.wind_turbine_inv ?? inv.windTurbines ?? 0;
  }
  if (type === 'tool_compost_heap') {
    return inv.tool_compost_heap_inv ?? inv.tools?.compostHeap ?? 0;
  }
  if (type === 'tool_garden_well') {
    return inv.tool_garden_well_inv ?? inv.tools?.gardenWell ?? 0;
  }
  if (type === 'torii_gate') {
    return inv.torii_gate_inv ?? inv.decorations?.toriiGate ?? 0;
  }
  const key = `${type}_inv`;
  return inv[key] ?? 0;
}

export function getWorkbenchName(tier: number): string {
  return tier === 3 ? 'Master Foundry' : tier === 2 ? 'Precision Workbench' : 'Artisan Workbench';
}

export function getWorkbenchAutomatonCapacity(tier: number): number {
  return tier === 1 ? 3 : tier === 2 ? 5 : 10;
}

export interface ExcursionBackpack {
  [key: string]: any;
  scrap_metal: number;
  copper_wire: number;
  brass_gears: number;
  circuit_boards: number;
  electronic_chips: number;
  saplings: {
    leafType: BonsaiLeafType;
    group: BonsaiGroup;
    maturity: MaturityTier;
    species?: string;
    name: string;
    rarity?: BonsaiRarity;
    color: string;
    flowerColor: string;
    findOdds?: number;
    foundOdds?: number;
    attributes?: BonsaiAttributes;
    cultivationPotential?: CultivationPotential;
  }[];
}

export type ResourceItemKey =
  | 'scrap_metal'
  | 'copper_wire'
  | 'brass_gears'
  | 'circuit_boards'
  | 'electronic_chips'
  | 'scrap_metal_double'
  | 'copper_wire_double';

export interface ExcursionTileNode {
  id: string;
  tileX: number;
  tileY: number;
  type: 'RESOURCE' | 'SAPLING';
  resourceType?: ResourceItemKey;
  saplingLeafType?: BonsaiLeafType;
  saplingGroup?: BonsaiGroup;
  saplingMaturity?: MaturityTier;
  saplingSpecies?: string;
  saplingRarity?: BonsaiRarity;
  saplingName?: string;
  spawnChance?: number;
  findOdds?: number;
  collected: boolean;
}

export interface RadialDigState {
  active: boolean;
  nodeId: string;
  tileX: number;
  tileY: number;
  saplingName: string;
  leafType: BonsaiLeafType;
  group: BonsaiGroup;
  maturity: MaturityTier;
  species?: string;
  rarity?: BonsaiRarity;
  needleAngle: number;
  angularVelocity: number;
  sectors: {
    startAngle: number;
    arcLength: number;
    hit: boolean;
    precision?: number;
  }[];
  requiredHits: number;
  currentHits: number;
  strikesUsed: number;
  maxStrikes: number;
  isGated: boolean; // if strikes available < required hits
  wobbleTimer: number;
  status: 'DIGGING' | 'WON' | 'FAILED';
  spawnChance?: number;
  speciesChance: number;
  arcDeg: number;
}

export interface ZenSkills {
  [key: string]: any;
  carefulTrowel: number;
  broadSpade: number;
  greenThumb: number;
  hydrodynamics: number;
  botanicalForaging: number;
  resourceProspecting: number;
  botanicalDowsing: number;
  perpetuum_mobile: number;
  steady_hands: number;
}

export interface SkillConfigItem {
  name: string;
  description: string;
  icon: string;
  maxRank: number;
  costs: number[];
  getBonusText: (rank: number) => string;
  getNextBonusText: (rank: number) => string;
}

export interface GameStats {
  leafTypeStylesGrown: Record<string, string[]>; // { [leafType]: ['CHOKAN', 'MOYOGI', 'SHAKAN'] } that reached Lv.10+
  groupBonsaisGrown: Record<BonsaiGroup, number>; // distinct trees reached Lv.10+ in each group
  firstLevel100Reached: boolean;
  expeditionsPerBiome: Record<ExpeditionBiomeId, number>;
  claimedAchievements: string[];
  totalLevelUps: number;
  maxSpecimensGrownLv10: string[]; // IDs of distinct trees that reached Lv.10
  maxSpecimensGrownLv25: string[]; // IDs of distinct trees that reached Lv.25
  maxSpecimensGrownLv50: string[]; // IDs of distinct trees that reached Lv.50
  sproutLv10Ids?: string[];
  saplingLv15Ids?: string[];
  notableLv20Ids?: string[];
  refinedLv25Ids?: string[];
  premiumLv30Ids?: string[];
}

export type MilestoneCategory = 'BONDEX' | 'MATURITY' | 'AUTOMATION' | 'EXPEDITIONS';

export interface AchievementDef {
  id: string;
  category: MilestoneCategory;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  rewardZen: number;
  targetValue: number;
  unit: string;
  currentValue: (
    stats: GameStats,
    planted: PlantedBonsai[],
    stored: StoredPottedBonsai[],
    discoveredMap?: Record<string, any>,
    inv?: SanctuaryInventory,
    deployed?: DeployedStructure[],
    installedArms?: number,
  ) => number;
  isUnlocked: (
    stats: GameStats,
    planted: PlantedBonsai[],
    stored: StoredPottedBonsai[],
    discoveredMap?: Record<string, any>,
    inv?: SanctuaryInventory,
    deployed?: DeployedStructure[],
    installedArms?: number,
  ) => boolean;
}

export const ACHIEVEMENTS_LIST: AchievementDef[] = [
  // ==========================================
  // 1. BONDEX & TAXONOMY MILESTONES (🌿 BONDEX)
  // ==========================================
  {
    id: 'bondex_species_5',
    category: 'BONDEX',
    title: 'Novice Taxonomist',
    subtitle: 'Discover 5 different bonsai leaf species',
    description: 'Log at least 5 distinct bonsai leaf species in your Botanical Bondex.',
    icon: '🌿',
    rewardZen: 1,
    targetValue: 5,
    unit: 'Species',
    currentValue: (stats, planted, stored, discoveredMap) => {
      if (!discoveredMap) return 0;
      return Object.values(discoveredMap).filter((d: any) => d?.discovered).length;
    },
    isUnlocked: (stats, planted, stored, discoveredMap) => {
      if (!discoveredMap) return false;
      return Object.values(discoveredMap).filter((d: any) => d?.discovered).length >= 5;
    },
  },
  {
    id: 'bondex_species_10',
    category: 'BONDEX',
    title: 'Master Taxonomist',
    subtitle: 'Discover 10 different bonsai leaf species',
    description: 'Log at least 10 distinct bonsai leaf species across diverse wilderness biomes.',
    icon: '📖',
    rewardZen: 2,
    targetValue: 10,
    unit: 'Species',
    currentValue: (stats, planted, stored, discoveredMap) => {
      if (!discoveredMap) return 0;
      return Object.values(discoveredMap).filter((d: any) => d?.discovered).length;
    },
    isUnlocked: (stats, planted, stored, discoveredMap) => {
      if (!discoveredMap) return false;
      return Object.values(discoveredMap).filter((d: any) => d?.discovered).length >= 10;
    },
  },
  {
    id: 'bondex_species_20',
    category: 'BONDEX',
    title: 'Grand Arborist',
    subtitle: 'Discover all 20 bonsai leaf species',
    description: 'Catalog all 20 bonsai leaf species across the 7 sacred Tree Type Groups in the Bondex.',
    icon: '👑',
    rewardZen: 5,
    targetValue: 20,
    unit: 'Species',
    currentValue: (stats, planted, stored, discoveredMap) => {
      if (!discoveredMap) return 0;
      return Object.values(discoveredMap).filter((d: any) => d?.discovered).length;
    },
    isUnlocked: (stats, planted, stored, discoveredMap) => {
      if (!discoveredMap) return false;
      return Object.values(discoveredMap).filter((d: any) => d?.discovered).length >= 20;
    },
  },
  {
    id: 'bondex_styles_15',
    category: 'BONDEX',
    title: 'Stylistic Explorer',
    subtitle: 'Log 15 different structural styles in the Bondex',
    description: 'Cultivate and register 15 distinct structural silhouettes (Chokan, Moyogi, Shakan) in the Bondex.',
    icon: '🎋',
    rewardZen: 2,
    targetValue: 15,
    unit: 'Styles',
    currentValue: (stats, planted, stored, discoveredMap) => {
      if (!discoveredMap) return 0;
      return Object.values(discoveredMap).reduce(
        (acc: number, d: any) => acc + (d?.stylesRaised?.length || 0),
        0,
      );
    },
    isUnlocked: (stats, planted, stored, discoveredMap) => {
      if (!discoveredMap) return false;
      const count = Object.values(discoveredMap).reduce(
        (acc: number, d: any) => acc + (d?.stylesRaised?.length || 0),
        0,
      );
      return count >= 15;
    },
  },
  {
    id: 'bondex_styles_30',
    category: 'BONDEX',
    title: 'Arboreal Connoisseur',
    subtitle: 'Log 30 different structural styles in the Bondex',
    description: 'Cultivate and register 30 distinct structural silhouettes across your collection.',
    icon: '✨',
    rewardZen: 3,
    targetValue: 30,
    unit: 'Styles',
    currentValue: (stats, planted, stored, discoveredMap) => {
      if (!discoveredMap) return 0;
      return Object.values(discoveredMap).reduce(
        (acc: number, d: any) => acc + (d?.stylesRaised?.length || 0),
        0,
      );
    },
    isUnlocked: (stats, planted, stored, discoveredMap) => {
      if (!discoveredMap) return false;
      const count = Object.values(discoveredMap).reduce(
        (acc: number, d: any) => acc + (d?.stylesRaised?.length || 0),
        0,
      );
      return count >= 30;
    },
  },
  {
    id: 'bondex_styles_60',
    category: 'BONDEX',
    title: 'Ultimate Bondex',
    subtitle: 'Log 60+ stylistic variants in Bondex',
    description: 'Catalog 60 or more distinct stylistic variants across species and styles in the Botanical Bondex (out of 140 total variants)!',
    icon: '🏆',
    rewardZen: 5,
    targetValue: 60,
    unit: 'Styles',
    currentValue: (stats, planted, stored, discoveredMap) => {
      if (!discoveredMap) return 0;
      return Object.values(discoveredMap).reduce(
        (acc: number, d: any) => acc + (d?.stylesRaised?.length || 0),
        0,
      );
    },
    isUnlocked: (stats, planted, stored, discoveredMap) => {
      if (!discoveredMap) return false;
      const count = Object.values(discoveredMap).reduce(
        (acc: number, d: any) => acc + (d?.stylesRaised?.length || 0),
        0,
      );
      return count >= 60;
    },
  },

  // ==========================================
  // 2. MATURITY & GROWTH MILESTONES (🌟 MATURITY)
  // ==========================================
  {
    id: 'maturity_sprout_5',
    category: 'MATURITY',
    title: 'Sprout Caretaker',
    subtitle: 'Cultivate 5 Sprout (一) Bonsais to Lv.10+',
    description: 'Cultivate 5 Sprout (Rank I) specimens to Level 10 mastery.',
    icon: '🌱',
    rewardZen: 1,
    targetValue: 5,
    unit: 'Sprouts',
    currentValue: (stats, planted, stored) => {
      const active = [...planted, ...stored].filter(
        (b) => (b.maturity || 'sprout') === 'sprout' && b.level >= 10,
      ).length;
      return Math.max(active, (stats.sproutLv10Ids || []).length);
    },
    isUnlocked: (stats, planted, stored) => {
      const active = [...planted, ...stored].filter(
        (b) => (b.maturity || 'sprout') === 'sprout' && b.level >= 10,
      ).length;
      return Math.max(active, (stats.sproutLv10Ids || []).length) >= 5;
    },
  },
  {
    id: 'maturity_sapling_4',
    category: 'MATURITY',
    title: 'Sapling Specialist',
    subtitle: 'Cultivate 4 Sapling (二) Bonsais to Lv.15+',
    description: 'Cultivate 4 Sapling (Rank II) specimens to Level 15 mastery.',
    icon: '🌿',
    rewardZen: 2,
    targetValue: 4,
    unit: 'Saplings',
    currentValue: (stats, planted, stored) => {
      const active = [...planted, ...stored].filter(
        (b) => b.maturity === 'sapling' && b.level >= 15,
      ).length;
      return Math.max(active, (stats.saplingLv15Ids || []).length);
    },
    isUnlocked: (stats, planted, stored) => {
      const active = [...planted, ...stored].filter(
        (b) => b.maturity === 'sapling' && b.level >= 15,
      ).length;
      return Math.max(active, (stats.saplingLv15Ids || []).length) >= 4;
    },
  },
  {
    id: 'maturity_notable_3',
    category: 'MATURITY',
    title: 'Notable Nurturer',
    subtitle: 'Cultivate 3 Notable (三) Bonsais to Lv.20+',
    description: 'Cultivate 3 Notable (Rank III) specimens to Level 20 mastery.',
    icon: '🌳',
    rewardZen: 3,
    targetValue: 3,
    unit: 'Notables',
    currentValue: (stats, planted, stored) => {
      const active = [...planted, ...stored].filter(
        (b) => b.maturity === 'notable' && b.level >= 20,
      ).length;
      return Math.max(active, (stats.notableLv20Ids || []).length);
    },
    isUnlocked: (stats, planted, stored) => {
      const active = [...planted, ...stored].filter(
        (b) => b.maturity === 'notable' && b.level >= 20,
      ).length;
      return Math.max(active, (stats.notableLv20Ids || []).length) >= 3;
    },
  },
  {
    id: 'maturity_refined_2',
    category: 'MATURITY',
    title: 'Refined Master',
    subtitle: 'Cultivate 2 Refined (四) Bonsais to Lv.25+',
    description: 'Cultivate 2 Refined (Rank IV) specimens to Level 25 mastery.',
    icon: '✨',
    rewardZen: 3,
    targetValue: 2,
    unit: 'Refined',
    currentValue: (stats, planted, stored) => {
      const active = [...planted, ...stored].filter(
        (b) => b.maturity === 'refined' && b.level >= 25,
      ).length;
      return Math.max(active, (stats.refinedLv25Ids || []).length);
    },
    isUnlocked: (stats, planted, stored) => {
      const active = [...planted, ...stored].filter(
        (b) => b.maturity === 'refined' && b.level >= 25,
      ).length;
      return Math.max(active, (stats.refinedLv25Ids || []).length) >= 2;
    },
  },
  {
    id: 'maturity_premium_1',
    category: 'MATURITY',
    title: 'Premium Patron',
    subtitle: 'Cultivate 1 Premium (五) Bonsai to Lv.30+',
    description: 'Cultivate 1 sacred Premium (Rank V) specimen to Level 30 mastery.',
    icon: '👑',
    rewardZen: 5,
    targetValue: 1,
    unit: 'Premium',
    currentValue: (stats, planted, stored) => {
      const active = [...planted, ...stored].filter(
        (b) => b.maturity === 'premium' && b.level >= 30,
      ).length;
      return Math.max(active, (stats.premiumLv30Ids || []).length);
    },
    isUnlocked: (stats, planted, stored) => {
      const active = [...planted, ...stored].filter(
        (b) => b.maturity === 'premium' && b.level >= 30,
      ).length;
      return Math.max(active, (stats.premiumLv30Ids || []).length) >= 1;
    },
  },
  {
    id: 'cultivator_t1',
    category: 'MATURITY',
    title: 'Master Cultivator I',
    subtitle: 'Nurture 5 Bonsais to Lv.10+',
    description: 'Grow five distinct bonsai specimens to at least Level 10 mastery.',
    icon: '🌱',
    rewardZen: 1,
    targetValue: 5,
    unit: 'Bonsais',
    currentValue: (stats) => stats.maxSpecimensGrownLv10.length,
    isUnlocked: (stats) => stats.maxSpecimensGrownLv10.length >= 5,
  },
  {
    id: 'cultivator_t2',
    category: 'MATURITY',
    title: 'Master Cultivator II',
    subtitle: 'Nurture 10 Bonsais to Lv.25+',
    description: 'Cultivate ten distinct bonsai specimens to mature Level 25 mastery.',
    icon: '🌿',
    rewardZen: 2,
    targetValue: 10,
    unit: 'Bonsais',
    currentValue: (stats) => stats.maxSpecimensGrownLv25.length,
    isUnlocked: (stats) => stats.maxSpecimensGrownLv25.length >= 10,
  },
  {
    id: 'cultivator_t3',
    category: 'MATURITY',
    title: 'Master Cultivator III',
    subtitle: 'Nurture 25 Bonsais to Lv.50+',
    description: 'Cultivate twenty-five distinct bonsai specimens to deep Level 50 mastery.',
    icon: '🌲',
    rewardZen: 3,
    targetValue: 25,
    unit: 'Bonsais',
    currentValue: (stats) => stats.maxSpecimensGrownLv50.length,
    isUnlocked: (stats) => stats.maxSpecimensGrownLv50.length >= 25,
  },
  {
    id: 'forms_raundo',
    category: 'MATURITY',
    title: 'Triad of Raundo (Round)',
    subtitle: 'Cultivate Circle & Oval across styles',
    description: 'Cultivate Raundo group specimens across Chokan, Moyogi, and Shakan.',
    icon: '🟢',
    rewardZen: 2,
    targetValue: 3,
    unit: 'Styles',
    currentValue: (stats) => Math.max((stats.leafTypeStylesGrown['circle'] || []).length, (stats.leafTypeStylesGrown['oval'] || []).length),
    isUnlocked: (stats) => (stats.leafTypeStylesGrown['circle'] || []).length >= 3 || (stats.leafTypeStylesGrown['oval'] || []).length >= 3,
  },
  {
    id: 'forms_erementaru',
    category: 'MATURITY',
    title: 'Triad of Erementaru (Elemental)',
    subtitle: 'Cultivate Raindrop & Flame across styles',
    description: 'Complete classical growth silhouettes for Erementaru group specimens.',
    icon: '🔥',
    rewardZen: 2,
    targetValue: 3,
    unit: 'Styles',
    currentValue: (stats) => Math.max((stats.leafTypeStylesGrown['raindrop'] || []).length, (stats.leafTypeStylesGrown['fire'] || []).length),
    isUnlocked: (stats) => (stats.leafTypeStylesGrown['raindrop'] || []).length >= 3 || (stats.leafTypeStylesGrown['fire'] || []).length >= 3,
  },
  {
    id: 'forms_rokumen',
    category: 'MATURITY',
    title: 'Triad of Roku-men (Six-sides)',
    subtitle: 'Cultivate Hexagon, Star or Snowflake across styles',
    description: 'Complete sacred geometric growth silhouettes for Roku-men group specimens.',
    icon: '⭐',
    rewardZen: 2,
    targetValue: 3,
    unit: 'Styles',
    currentValue: (stats) => Math.max((stats.leafTypeStylesGrown['hexagon'] || []).length, (stats.leafTypeStylesGrown['star'] || []).length, (stats.leafTypeStylesGrown['snowflake'] || []).length),
    isUnlocked: (stats) => (stats.leafTypeStylesGrown['hexagon'] || []).length >= 3 || (stats.leafTypeStylesGrown['star'] || []).length >= 3 || (stats.leafTypeStylesGrown['snowflake'] || []).length >= 3,
  },
  {
    id: 'forms_seikatsu',
    category: 'MATURITY',
    title: 'Triad of Seikatsu (Nature)',
    subtitle: 'Cultivate Feather, Snail or Eye across styles',
    description: 'Nurture living organic forms across Chokan, Moyogi, and Shakan.',
    icon: '🪶',
    rewardZen: 2,
    targetValue: 3,
    unit: 'Styles',
    currentValue: (stats) => Math.max((stats.leafTypeStylesGrown['feather'] || []).length, (stats.leafTypeStylesGrown['snail'] || []).length, (stats.leafTypeStylesGrown['eye'] || []).length),
    isUnlocked: (stats) => (stats.leafTypeStylesGrown['feather'] || []).length >= 3 || (stats.leafTypeStylesGrown['snail'] || []).length >= 3 || (stats.leafTypeStylesGrown['eye'] || []).length >= 3,
  },
  {
    id: 'forms_sanmen',
    category: 'MATURITY',
    title: 'Triad of Sanmen (Points)',
    subtitle: 'Cultivate Triangle, Arrow, Shield or Diamond across styles',
    description: 'Complete pointed directional silhouettes across Chokan, Moyogi, and Shakan.',
    icon: '🔺',
    rewardZen: 2,
    targetValue: 3,
    unit: 'Styles',
    currentValue: (stats) => Math.max((stats.leafTypeStylesGrown['triangle'] || []).length, (stats.leafTypeStylesGrown['arrow'] || []).length, (stats.leafTypeStylesGrown['shield'] || []).length, (stats.leafTypeStylesGrown['diamond'] || []).length),
    isUnlocked: (stats) => (stats.leafTypeStylesGrown['triangle'] || []).length >= 3 || (stats.leafTypeStylesGrown['arrow'] || []).length >= 3 || (stats.leafTypeStylesGrown['shield'] || []).length >= 3 || (stats.leafTypeStylesGrown['diamond'] || []).length >= 3,
  },
  {
    id: 'forms_shihen',
    category: 'MATURITY',
    title: 'Triad of Shihen (Orthogonal)',
    subtitle: 'Cultivate Cube or Rectangle across styles',
    description: 'Master orthogonal architecture and isometric cubes across all 3 styles.',
    icon: '🧊',
    rewardZen: 2,
    targetValue: 3,
    unit: 'Styles',
    currentValue: (stats) => Math.max((stats.leafTypeStylesGrown['cube'] || []).length, (stats.leafTypeStylesGrown['rectangle'] || []).length),
    isUnlocked: (stats) => (stats.leafTypeStylesGrown['cube'] || []).length >= 3 || (stats.leafTypeStylesGrown['rectangle'] || []).length >= 3,
  },
  {
    id: 'forms_jinkoteki',
    category: 'MATURITY',
    title: 'Triad of Jinkō-teki (Crafted)',
    subtitle: 'Cultivate Gear or Bell across styles',
    description: 'Grow resonant temple bells and mechanical automata gears across styles.',
    icon: '⚙️',
    rewardZen: 2,
    targetValue: 3,
    unit: 'Styles',
    currentValue: (stats) => Math.max((stats.leafTypeStylesGrown['gear'] || []).length, (stats.leafTypeStylesGrown['bell'] || []).length),
    isUnlocked: (stats) => (stats.leafTypeStylesGrown['gear'] || []).length >= 3 || (stats.leafTypeStylesGrown['bell'] || []).length >= 3,
  },

  // ==========================================
  // 3. AUTOMATION & ENERGY (⚡ AUTOMATION)
  // ==========================================
  {
    id: 'auto_power_30',
    category: 'AUTOMATION',
    title: 'Clean Energy Grid',
    subtitle: 'Deploy 30+ kW of Clean Power in Sanctuary',
    description: 'Cluster solar arrays and wind turbines to establish a 30+ kW clean power grid.',
    icon: '⚡',
    rewardZen: 3,
    targetValue: 30,
    unit: 'kW Power',
    currentValue: (stats, planted, stored, disc, inv, deployed) => {
      if (!deployed) return 0;
      const solar = deployed.filter((s) => s.type === 'solar_panel').length * 3;
      const wind = deployed.filter((s) => s.type === 'wind_turbine').length * 6;
      return solar + wind;
    },
    isUnlocked: (stats, planted, stored, disc, inv, deployed) => {
      if (!deployed) return false;
      const solar = deployed.filter((s) => s.type === 'solar_panel').length * 3;
      const wind = deployed.filter((s) => s.type === 'wind_turbine').length * 6;
      return solar + wind >= 30;
    },
  },
  {
    id: 'auto_sprinklers_5',
    category: 'AUTOMATION',
    title: 'Hydro-Automated Nursery',
    subtitle: 'Attach Irrigation Automatons to 5 Bonsais',
    description: 'Connect automated irrigation misting units to at least 5 bonsai specimens simultaneously.',
    icon: '💧',
    rewardZen: 2,
    targetValue: 5,
    unit: 'Automatons',
    currentValue: (stats, planted) => planted.filter((b) => b.automatonTier > 0).length,
    isUnlocked: (stats, planted) => planted.filter((b) => b.automatonTier > 0).length >= 5,
  },
  {
    id: 'auto_compost_master',
    category: 'AUTOMATION',
    title: 'Recycling Alchemist',
    subtitle: 'Craft or hold 5 Enriched Organic Composts',
    description: 'Compost organic waste into high-potency fertilizer for rapid cultivation.',
    icon: '🌾',
    rewardZen: 1,
    targetValue: 5,
    unit: 'Compost',
    currentValue: (stats, planted, stored, disc, inv) => inv?.organic_compost || 0,
    isUnlocked: (stats, planted, stored, disc, inv) => (inv?.organic_compost || 0) >= 5,
  },
  {
    id: 'auto_workbench_arms',
    category: 'AUTOMATION',
    title: 'Modular Assembly Arm',
    subtitle: 'Install 2+ Crafting Assembly Arms on Workbench',
    description: 'Upgrade workbench throughput with modular automated robotic assembly arms.',
    icon: '🤖',
    rewardZen: 2,
    targetValue: 2,
    unit: 'Arms',
    currentValue: (stats, planted, stored, disc, inv, deployed, arms) => arms || 0,
    isUnlocked: (stats, planted, stored, disc, inv, deployed, arms) => (arms || 0) >= 2,
  },

  // ==========================================
  // 4. EXPEDITIONS & MASTERY (🚜 EXPEDITIONS)
  // ==========================================
  {
    id: 'pioneer_foothills_5',
    category: 'EXPEDITIONS',
    title: 'Sunlit Foothills Pioneer I',
    subtitle: 'Complete 5 Expeditions in Sunlit Foothills',
    description: 'Chart and return from 5 wilderness expeditions in Sunlit Foothills.',
    icon: '🌿',
    rewardZen: 1,
    targetValue: 5,
    unit: 'Expeditions',
    currentValue: (stats) => stats.expeditionsPerBiome['FOOTHILLS'] || 0,
    isUnlocked: (stats) => (stats.expeditionsPerBiome['FOOTHILLS'] || 0) >= 5,
  },
  {
    id: 'pioneer_foothills_10',
    category: 'EXPEDITIONS',
    title: 'Sunlit Foothills Pioneer II',
    subtitle: 'Complete 10 Expeditions in Sunlit Foothills',
    description: 'Chart and return from 10 wilderness expeditions in Sunlit Foothills.',
    icon: '🏕️',
    rewardZen: 2,
    targetValue: 10,
    unit: 'Expeditions',
    currentValue: (stats) => stats.expeditionsPerBiome['FOOTHILLS'] || 0,
    isUnlocked: (stats) => (stats.expeditionsPerBiome['FOOTHILLS'] || 0) >= 10,
  },
  {
    id: 'pioneer_highlands_5',
    category: 'EXPEDITIONS',
    title: 'Misty Highlands Pioneer I',
    subtitle: 'Complete 5 Expeditions in Misty Highlands',
    description: 'Chart and return from 5 wilderness expeditions in Misty Highlands.',
    icon: '⛰️',
    rewardZen: 2,
    targetValue: 5,
    unit: 'Expeditions',
    currentValue: (stats) => stats.expeditionsPerBiome['HIGHLANDS'] || 0,
    isUnlocked: (stats) => (stats.expeditionsPerBiome['HIGHLANDS'] || 0) >= 5,
  },
  {
    id: 'pioneer_highlands_10',
    category: 'EXPEDITIONS',
    title: 'Misty Highlands Pioneer II',
    subtitle: 'Complete 10 Expeditions in Misty Highlands',
    description: 'Chart and return from 10 wilderness expeditions in Misty Highlands.',
    icon: '🏔️',
    rewardZen: 3,
    targetValue: 10,
    unit: 'Expeditions',
    currentValue: (stats) => stats.expeditionsPerBiome['HIGHLANDS'] || 0,
    isUnlocked: (stats) => (stats.expeditionsPerBiome['HIGHLANDS'] || 0) >= 10,
  },
  {
    id: 'pioneer_overgrowth_5',
    category: 'EXPEDITIONS',
    title: 'Ancient Overgrowth Pioneer I',
    subtitle: 'Complete 5 Expeditions in Ancient Overgrowth',
    description: 'Chart and return from 5 wilderness expeditions in the Ancient Overgrowth.',
    icon: '🌌',
    rewardZen: 3,
    targetValue: 5,
    unit: 'Expeditions',
    currentValue: (stats) => stats.expeditionsPerBiome['OVERGROWTH'] || 0,
    isUnlocked: (stats) => (stats.expeditionsPerBiome['OVERGROWTH'] || 0) >= 5,
  },
  {
    id: 'pioneer_overgrowth_10',
    category: 'EXPEDITIONS',
    title: 'Ancient Overgrowth Pioneer II',
    subtitle: 'Complete 10 Expeditions in Ancient Overgrowth',
    description: 'Chart and return from 10 wilderness expeditions in the Ancient Overgrowth.',
    icon: '🔮',
    rewardZen: 4,
    targetValue: 10,
    unit: 'Expeditions',
    currentValue: (stats) => stats.expeditionsPerBiome['OVERGROWTH'] || 0,
    isUnlocked: (stats) => (stats.expeditionsPerBiome['OVERGROWTH'] || 0) >= 10,
  },
];

export interface FloatingText {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
}

export interface Particle {
  active?: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
}

export interface ExcursionReportData {
  safeReturn: boolean;
  biomeId: ExpeditionBiomeId;
  biomeName: string;
  retentionRate: number;
  distanceReached: number;
  batteryRemaining: number;
  maxBatteryKwh: number;
  totalWeight: number;
  items: {
    key: ResourceItemKey;
    name: string;
    collected: number;
    retained: number;
    lost: number;
  }[];
  saplings: {
    name: string;
    leafType: BonsaiLeafType;
    group: BonsaiGroup;
    maturity: MaturityTier;
    rarity?: BonsaiRarity;
    retained: boolean;
  }[];
}

// EXP REQUIREMENT PROGRESSION CURVE
export function getExpRequiredForLevel(lvl: number): number {
  const l = Math.max(1, lvl);
  return Math.floor(100 * Math.pow(1.25, l - 1));
}

// EXP VALUES FOR HARVESTING & EXCAVATION
export const RESOURCE_HARVEST_EXP: Record<ResourceItemKey, number> = {
  scrap_metal: 8,
  copper_wire: 12,
  brass_gears: 20,
  circuit_boards: 35,
  electronic_chips: 60,
  scrap_metal_double: 16,
  copper_wire_double: 24,
};

/**
 * Pick resource node deposit type based on biome area and distance from basecamp:
 * Area 1 (Sunlit Foothills):
 *   Close (0-20 steps): Scrap (1x): 100%
 *   Mid (21-40 steps): Scrap (1x): 88%, Wire (1x): 12%
 *   Far (41-60 steps): Scrap (1x): 78%, Wire (1x): 20%, Scrap (2x): 2%
 * Area 2 (Misty Highlands):
 *   Close (0-20 steps): Scrap (1x): 88%, Wire (1x): 12%
 *   Mid (21-40 steps): Scrap (1x): 78%, Wire (1x): 20%, Scrap (2x): 2%
 *   Far (41-60 steps): Scrap (1x): 66.5%, Wire (1x): 25%, Scrap (2x): 7.3%, Wire (2x): 1.2%
 * Area 3 (Ancient Caldera):
 *   Close (0-20 steps): Scrap (1x): 78%, Wire (1x): 20%, Scrap (2x): 2%
 *   Mid (21-40 steps): Scrap (1x): 66.5%, Wire (1x): 25%, Scrap (2x): 7.3%, Wire (2x): 1.2%
 *   Far (41-60 steps): Scrap (1x): 56.5%, Wire (1x): 28%, Scrap (2x): 11.5%, Wire (2x): 3.5%, Gears (1x): 0.5%
 */
export function pickResourceDeposit(
  biomeId: ExpeditionBiomeId,
  distSteps: number,
  resRoll: number,
): ResourceItemKey {
  if (biomeId === 'FOOTHILLS') {
    if (distSteps <= 20) {
      return 'scrap_metal';
    } else if (distSteps <= 40) {
      return resRoll < 0.88 ? 'scrap_metal' : 'copper_wire';
    } else {
      if (resRoll < 0.78) return 'scrap_metal';
      if (resRoll < 0.98) return 'copper_wire';
      return 'scrap_metal_double';
    }
  } else if (biomeId === 'HIGHLANDS') {
    if (distSteps <= 20) {
      return resRoll < 0.88 ? 'scrap_metal' : 'copper_wire';
    } else if (distSteps <= 40) {
      if (resRoll < 0.78) return 'scrap_metal';
      if (resRoll < 0.98) return 'copper_wire';
      return 'scrap_metal_double';
    } else {
      if (resRoll < 0.665) return 'scrap_metal';
      if (resRoll < 0.915) return 'copper_wire';
      if (resRoll < 0.988) return 'scrap_metal_double';
      return 'copper_wire_double';
    }
  } else {
    // Area 3 (OVERGROWTH / Ancient Caldera)
    if (distSteps <= 20) {
      if (resRoll < 0.78) return 'scrap_metal';
      if (resRoll < 0.98) return 'copper_wire';
      return 'scrap_metal_double';
    } else if (distSteps <= 40) {
      if (resRoll < 0.665) return 'scrap_metal';
      if (resRoll < 0.915) return 'copper_wire';
      if (resRoll < 0.988) return 'scrap_metal_double';
      return 'copper_wire_double';
    } else {
      if (resRoll < 0.565) return 'scrap_metal';
      if (resRoll < 0.845) return 'copper_wire';
      if (resRoll < 0.960) return 'scrap_metal_double';
      if (resRoll < 0.995) return 'copper_wire_double';
      return 'brass_gears';
    }
  }
}

// WEIGHT DEFINITIONS (kg)
export const ITEM_WEIGHTS: Record<ResourceItemKey | 'sapling', number> = {
  scrap_metal: 0.8,
  copper_wire: 0.5,
  brass_gears: 1.2,
  circuit_boards: 1.0,
  electronic_chips: 1.5,
  scrap_metal_double: 1.6,
  copper_wire_double: 1.0,
  sapling: 3.0,
};

export const SEEDLING_DIG_EXP: Record<BonsaiLeafType, number> = {
  circle: 40,
  oval: 60,
  circle_hole: 90,
  raindrop: 80,
  fire: 120,
  cloud: 95,
  hexagon: 140,
  star: 200,
  snowflake: 150,
  feather: 75,
  snail: 85,
  eye: 130,
  triangle: 65,
  arrow: 70,
  shield: 100,
  diamond: 110,
  cube: 115,
  rectangle: 75,
  gear: 105,
  bell: 135,
};

// BASE VALUES FOR BONSAI ECONOMY BY MATURITY
export const MATURITY_BASE_VALUE: Record<MaturityTier, number> = {
  sprout: 60,
  sapling: 160,
  notable: 450,
  refined: 1200,
  premium: 3500,
};

export function VerdureIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={`${className} inline-block shrink-0`} viewBox="0 0 24 24" fill="none">
      <defs>
        <linearGradient id="verdureGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#4ade80" />
          <stop offset="40%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#047857" />
        </linearGradient>
        <filter id="verdureGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="0" stdDeviation="1.2" floodColor="#34d399" floodOpacity="0.7" />
        </filter>
      </defs>
      <path
        d="M12 22C12 22 11.5 16 12 12C12.5 8 16 3 20 2C21 6 20 11 16 15C13.5 17.5 12 22 12 22Z"
        fill="url(#verdureGrad)"
        filter="url(#verdureGlow)"
      />
      <path
        d="M12 13C8.5 11 4.5 11.5 3 14C5.5 16.5 9 16 12 14.5"
        fill="#34d399"
        opacity="0.85"
      />
      <path
        d="M12 22V11"
        stroke="#065f46"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

// Compute Dynamic Verdure Donation Reward using unified multi-factor formula
export function calculateBonsaiSellPrice(
  maturityOrBonsai:
    | MaturityTier
    | undefined
    | {
        leafType?: BonsaiLeafType;
        maturity?: MaturityTier | number;
        level: number;
        findOdds?: number;
        foundOdds?: number;
      },
  level = 1,
  leafType?: BonsaiLeafType,
): number {
  if (maturityOrBonsai && typeof maturityOrBonsai === 'object') {
    return calculateDonationValue(maturityOrBonsai);
  }
  return calculateDonationValue({
    leafType: leafType || 'circle',
    maturity: maturityOrBonsai as MaturityTier | undefined,
    level,
  });
}

// POWER GENERATION (kW)
export const POWER_METRICS = {
  solar_kw: 3,
  wind_kw: 6,
};

/**
 * Count how many matching structures are in a structure's surrounding 3x3 neighboring plots.
 */
export function countAdjacentMatching(
  struct: DeployedStructure,
  structures: DeployedStructure[],
  targetType: DeployedStructureType,
): number {
  const c1 = Math.round((struct.x - SANCTUARY_GRID.startX) / SANCTUARY_GRID.cellW);
  const r1 = Math.round((struct.y - SANCTUARY_GRID.startY) / SANCTUARY_GRID.cellH);
  let count = 0;
  structures.forEach((other) => {
    if (other.id === struct.id) return;
    if (other.type !== targetType) return;
    const c2 = Math.round((other.x - SANCTUARY_GRID.startX) / SANCTUARY_GRID.cellW);
    const r2 = Math.round((other.y - SANCTUARY_GRID.startY) / SANCTUARY_GRID.cellH);
    if (Math.abs(c1 - c2) <= 1 && Math.abs(r1 - r2) <= 1) {
      count++;
    }
  });
  return count;
}

/**
 * Check if a deployed structure has at least one other matching structure
 * in any of its 8 surrounding neighboring grid plots (3x3 area).
 */
export function checkAdjacentGenerator(
  struct: DeployedStructure,
  structures: DeployedStructure[],
  targetType: DeployedStructureType,
): boolean {
  return countAdjacentMatching(struct, structures, targetType) > 0;
}

/**
 * Clean Energy Output with Stackable Proximity Resonance:
 * Solar: 3 kW base + 0.5 kW per adjacent Solar Panel in 3x3 zone.
 * Wind: 6 kW base + 1.0 kW per adjacent Wind Turbine in 3x3 zone.
 */
export function getSolarPanelOutput(struct: DeployedStructure, structures: DeployedStructure[]) {
  const count = countAdjacentMatching(struct, structures, 'solar_panel');
  const resonance = count * 0.5;
  return {base: 3, resonance, total: 3 + resonance, count};
}

export function getWindTurbineOutput(struct: DeployedStructure, structures: DeployedStructure[]) {
  const count = countAdjacentMatching(struct, structures, 'wind_turbine');
  const resonance = count * 1.0;
  return {base: 6, resonance, total: 6 + resonance, count};
}

export interface BonsaiSynergies {
  bonsaiCount: number;
  wallCount: number;
  rockCount: number;
  bushCount: number;
  decorCount: number;
  pebbleCount: number;
  energyCount: number;
  hasAdjacentBonsai: boolean;
  hasAdjacentWall: boolean;
  hasAdjacentRock: boolean;
  hasAdjacentBush: boolean;
  hasAdjacentDecor: boolean;
  hasAdjacentPebbles: boolean;
  hasAdjacentEnergy: boolean;
  growthMultiplier: number;
  expMultiplier: number;
  quickPruneBonus: number;
  growingTogetherBonus: number;
  privateGrowingBonus: number;
  isStalled: boolean;
  stalledEntityLabel?: string;
  stalledEntityKey?: string;
  maxIdenticalCount: number;
  crystalPedestals?: {
    foliage: number;
    branches: number;
    trunk: number;
    roots: number;
    total: number;
  };
}

/**
 * Compute 3x3 Proximity Synergies for a planted bonsai:
 * 🌿 "Growing Together": Each neighboring Bonsai in 3x3 grants +10% Hydration Growth Speed (stackable)
 * 🎋 "Private Growing": Each neighboring Woven Lattice Wall in 3x3 grants +10% Hydration Growth Speed (stackable)
 * 🪨 "Quick Prune": Each neighboring Zen Rock Formation in 3x3 grants +0.25s Pruning Effect to manual care (stackable)
 * 🌿 "XP Boosted": Each neighboring Topiary Shrubbery Bush in 3x3 grants +15% Level Up Experience (stackable)
 * 🔮 "Cultivating Potential": Adjacent crystal pedestals provide +1 Cultivation Potential per level to their corresponding attribute
 * ⚠️ "Disrupted Zen": Each neighboring Solar/Turbine in 3x3 inflicts -10% Growth Speed penalty (stackable)
 * ⛔ "Stalling Surroundings": 5 or more (four+ / five or more) adjacent bonsais regardless of species triggers Total Growth Stagnation (0% Growth Rate).
 * Note: Walls have their own independent counter separate from bonsais (up to 4 bonsais and 4 walls can safely coexist for +80% Hydration Growth Speed).
 */
export function getBonsaiSynergies(
  bonsai: PlantedBonsai,
  plantedBonsais: PlantedBonsai[],
  structures: DeployedStructure[],
): BonsaiSynergies {
  const c1 = Math.round((bonsai.x - SANCTUARY_GRID.startX) / SANCTUARY_GRID.cellW);
  const r1 = Math.round((bonsai.y - SANCTUARY_GRID.startY) / SANCTUARY_GRID.cellH);

  let bonsaiCount = 0;
  plantedBonsais.forEach((other) => {
    if (other.id === bonsai.id) return;
    const c2 = Math.round((other.x - SANCTUARY_GRID.startX) / SANCTUARY_GRID.cellW);
    const r2 = Math.round((other.y - SANCTUARY_GRID.startY) / SANCTUARY_GRID.cellH);
    if (Math.abs(c1 - c2) <= 1 && Math.abs(r1 - r2) <= 1) {
      bonsaiCount++;
    }
  });

  let wallCount = 0;
  let rockCount = 0;
  let bushCount = 0;
  let energyCount = 0;
  const crystalPedestals = {
    foliage: 0,
    branches: 0,
    trunk: 0,
    roots: 0,
    total: 0,
  };

  const countsByType: Record<string, number> = {};
  countsByType['bonsai'] = bonsaiCount;

  structures.forEach((s) => {
    const c2 = Math.round((s.x - SANCTUARY_GRID.startX) / SANCTUARY_GRID.cellW);
    const r2 = Math.round((s.y - SANCTUARY_GRID.startY) / SANCTUARY_GRID.cellH);
    if (Math.abs(c1 - c2) <= 1 && Math.abs(r1 - r2) <= 1) {
      if (s.type === 'decor_pebble_path') {
        // Zen Pebble Path is purely a pathway/flooring:
        // Excluded from Quick Prune and does NOT contribute to Stalling Surroundings
        return;
      } else if (s.type.startsWith('crystal_pedestal')) {
        // All 4 crystal pedestal variants belong to the same decoration family 'crystal_pedestal'
        countsByType['crystal_pedestal'] = (countsByType['crystal_pedestal'] || 0) + 1;
        crystalPedestals.total++;
        if (s.type === 'crystal_pedestal_foliage') crystalPedestals.foliage++;
        else if (s.type === 'crystal_pedestal_branches') crystalPedestals.branches++;
        else if (s.type === 'crystal_pedestal_trunk') crystalPedestals.trunk++;
        else if (s.type === 'crystal_pedestal_roots') crystalPedestals.roots++;
      } else {
        countsByType[s.type] = (countsByType[s.type] || 0) + 1;

        if (s.type === 'decor_woven_wall') {
          wallCount++;
        } else if (s.type === 'decor_rock_formation') {
          rockCount++;
        } else if (s.type === 'decor_shrubbery_bush') {
          bushCount++;
        } else if (s.type === 'solar_panel' || s.type === 'wind_turbine') {
          energyCount++;
        }
      }
    }
  });

  let maxIdenticalCount = 0;
  let stalledEntityKey = '';
  for (const [k, count] of Object.entries(countsByType)) {
    if (count > maxIdenticalCount) {
      maxIdenticalCount = count;
      stalledEntityKey = k;
    }
  }

  // 5 or more (four+ / five or more) triggers Stalling Surroundings
  const isStalled = maxIdenticalCount >= 5;

  let stalledEntityLabel = '';
  if (isStalled) {
    if (stalledEntityKey === 'bonsai') {
      stalledEntityLabel = 'Adjacent Bonsais';
    } else if (stalledEntityKey === 'decor_woven_wall') {
      stalledEntityLabel = 'Woven Walls';
    } else if (stalledEntityKey === 'decor_rock_formation') {
      stalledEntityLabel = 'Rock Formations';
    } else if (stalledEntityKey === 'decor_shrubbery_bush') {
      stalledEntityLabel = 'Topiary Shrubberies';
    } else if (stalledEntityKey === 'crystal_pedestal') {
      stalledEntityLabel = 'Crystal Pedestals';
    } else if (stalledEntityKey === 'tool_compost_heap') {
      stalledEntityLabel = 'Compost Heaps';
    } else if (stalledEntityKey === 'tool_garden_well') {
      stalledEntityLabel = 'Stone Wells';
    } else if (stalledEntityKey === 'solar_panel') {
      stalledEntityLabel = 'Solar Panels';
    } else if (stalledEntityKey === 'wind_turbine') {
      stalledEntityLabel = 'Wind Turbines';
    } else {
      stalledEntityLabel = 'Identical Entities';
    }
  }

  const hasAdjacentBonsai = bonsaiCount > 0;
  const hasAdjacentWall = wallCount > 0;
  const hasAdjacentRock = rockCount > 0;
  const hasAdjacentBush = bushCount > 0;
  const hasAdjacentEnergy = energyCount > 0;
  const hasAdjacentDecor = wallCount > 0 || rockCount > 0 || bushCount > 0;

  // Hydration Growth Speed calculation:
  // Growing Together: +10% per bonsai
  // Private Growing: +10% per wall
  // Disrupted Zen: -10% per solar/wind
  const growingTogetherBonus = bonsaiCount * 0.10;
  const privateGrowingBonus = wallCount * 0.10;
  const rawGrowthMultiplier = Math.max(
    0.2,
    1.0 + growingTogetherBonus + privateGrowingBonus - energyCount * 0.10,
  );
  // Stalling Surroundings sets growth multiplier to strictly 0 (0% growth)
  const growthMultiplier = isStalled ? 0 : rawGrowthMultiplier;

  // XP Boosted: +15% Level Up EXP per adjacent bush
  const expMultiplier = 1.0 + bushCount * 0.15;

  // Quick Prune: +0.25s Pruning Effect per adjacent rock
  const quickPruneBonus = rockCount * 0.25;

  return {
    bonsaiCount,
    wallCount,
    rockCount,
    bushCount,
    decorCount: wallCount + rockCount + bushCount,
    pebbleCount: 0,
    energyCount,
    hasAdjacentBonsai,
    hasAdjacentWall,
    hasAdjacentRock,
    hasAdjacentBush,
    hasAdjacentDecor,
    hasAdjacentPebbles: false,
    hasAdjacentEnergy,
    growthMultiplier,
    expMultiplier,
    quickPruneBonus,
    growingTogetherBonus,
    privateGrowingBonus,
    isStalled,
    stalledEntityLabel,
    stalledEntityKey,
    maxIdenticalCount,
    crystalPedestals,
  };
}

/**
 * Renders the overworld pot badge tag with formatted string: `${maturityData.kanji} | Lv.${level}`
 * Clean vertical bar separator '|', no outer brackets, color flair matching Maturity tier.
 */
export function drawBonsaiPotTag(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  maturity: MaturityTier | undefined,
  level: number,
) {
  const mDef = getMaturityDef(maturity);
  const badgeY = y;
  const badgeW = level >= 100 ? 64 : 54;

  ctx.save();
  ctx.fillStyle = mDef.bg;
  ctx.beginPath();
  ctx.roundRect(x - badgeW / 2, badgeY - 6, badgeW, 15, 4);
  ctx.fill();
  ctx.strokeStyle = mDef.border;
  ctx.lineWidth = 1.3;
  if (mDef.rank >= 4) {
    ctx.shadowColor = mDef.color;
    ctx.shadowBlur = mDef.rank >= 5 ? 8 : 4;
  }
  ctx.stroke();
  ctx.shadowBlur = 0;

  ctx.fillStyle = mDef.color;
  ctx.font = 'bold 10px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`${mDef.kanji} | Lv.${level}`, x, badgeY + 5.5);
  ctx.restore();
}

/**
 * Calculates the exact finding probability of a seedling's Maturity tier
 * in the specified biome and distance zone, taking into account Botanical Foraging rank.
 */
export function getMaturitySpawnChance(
  biomeId: ExpeditionBiomeId,
  distSteps: number,
  maturity: MaturityTier,
  foragingRank = 0,
): number {
  let weights = {sprout: 100, sapling: 0, notable: 0, refined: 0, premium: 0};

  if (biomeId === 'FOOTHILLS') {
    if (distSteps <= 20) {
      weights = {sprout: 100, sapling: 0, notable: 0, refined: 0, premium: 0};
    } else if (distSteps <= 40) {
      weights = {sprout: 88, sapling: 12, notable: 0, refined: 0, premium: 0};
    } else {
      weights = {sprout: 78, sapling: 20, notable: 2, refined: 0, premium: 0};
    }
  } else if (biomeId === 'HIGHLANDS') {
    if (distSteps <= 20) {
      weights = {sprout: 88, sapling: 12, notable: 0, refined: 0, premium: 0};
    } else if (distSteps <= 40) {
      weights = {sprout: 78, sapling: 20, notable: 2, refined: 0, premium: 0};
    } else {
      weights = {sprout: 66.5, sapling: 25, notable: 7.3, refined: 1.2, premium: 0};
    }
  } else {
    // Ancient Overgrowth
    if (distSteps <= 20) {
      weights = {sprout: 78, sapling: 20, notable: 2, refined: 0, premium: 0};
    } else if (distSteps <= 40) {
      weights = {sprout: 66.5, sapling: 25, notable: 7.3, refined: 1.2, premium: 0};
    } else {
      weights = {sprout: 56.5, sapling: 28, notable: 11.5, refined: 3.5, premium: 0.5};
    }
  }

  const maturityOrder: MaturityTier[] = ['sprout', 'sapling', 'notable', 'refined', 'premium'];
  let wArray = maturityOrder.map((m) => weights[m]);

  if (foragingRank > 0) {
    const boost = foragingRank * 0.12;
    for (let i = 1; i < wArray.length; i++) {
      if (wArray[i] > 0) {
        wArray[i] *= 1 + boost * i;
      }
    }
    if (wArray[4] > 0) {
      wArray[4] *= 1 + foragingRank * 0.5;
    }
  }

  const totalW = wArray.reduce((a, b) => a + b, 0);
  const targetIdx = maturityOrder.indexOf(maturity);
  if (targetIdx === -1 || totalW <= 0) return 0.2;
  return wArray[targetIdx] / totalW;
}

// REQUIRED DIGGING SPOTS PER MATURITY RANK (Maturity + 1: Rank 1 -> 2, Rank 2 -> 3, Rank 3 -> 4, Rank 4 -> 5, Rank 5 -> 6)
export const MATURITY_SPOTS_COUNT: Record<MaturityTier, number> = {
  sprout: 2,
  sapling: 3,
  notable: 4,
  refined: 5,
  premium: 6,
};

// ZEN SKILL DEFINITIONS & UPGRADE COSTS
export const SKILL_CONFIGS: Record<string, SkillConfigItem> = {
  steady_hands: {
    name: 'Steady Hands',
    description: 'Increases the precision score of all excavation digging tiers by +10% per rank (+50% at Max Level 5).',
    icon: '🎯',
    maxRank: 5,
    costs: [5, 10, 20, 35, 50],
    getBonusText: (rank: number) => `+${rank * 10}% Precision Tier Bonus${rank === 5 ? ' (Center 100%)' : ''}`,
    getNextBonusText: (rank: number) => `+${(rank + 1) * 10}% Precision Tier Bonus`,
  },
  carefulTrowel: {
    name: 'Careful Trowel',
    description: 'Increases shovel strike capacity to excavate multi-spot high maturity flora (Sapling: 3, Notable: 4, Refined: 5, Premium: 6 sites).',
    icon: '🥄',
    maxRank: 5,
    costs: [5, 10, 20, 35, 50],
    getBonusText: (rank: number) => `${2 + rank} Total Shovel Strikes (+${rank})`,
    getNextBonusText: (rank: number) => `${3 + rank} Total Shovel Strikes (+${rank + 1})`,
  },
  broadSpade: {
    name: 'Broad Spade',
    description: 'Widens the green root target zones on the excavation dial (+5% per rank, +25% max).',
    icon: '🎯',
    maxRank: 5,
    costs: [5, 10, 20, 35, 50],
    getBonusText: (rank: number) => `+${rank * 5}% Hit Arc Width`,
    getNextBonusText: (rank: number) => `+${(rank + 1) * 5}% Hit Arc Width`,
  },
  greenThumb: {
    name: 'Green Thumb',
    description: 'Manual Spacebar Pruning reduces growth countdown timer faster.',
    icon: '✂️',
    maxRank: 5,
    costs: [5, 10, 20, 35, 50],
    getBonusText: (rank: number) => `-${1 + rank}s Progress per Prune`,
    getNextBonusText: (rank: number) => `-${2 + rank}s Progress per Prune`,
  },
  hydrodynamics: {
    name: 'Hydrodynamics',
    description: 'Automaton watering irrigation pumps nourish trees with extra efficiency.',
    icon: '💧',
    maxRank: 5,
    costs: [5, 10, 20, 35, 50],
    getBonusText: (rank: number) => `+${rank * 20}% Automaton Growth Speed`,
    getNextBonusText: (rank: number) => `+${(rank + 1) * 20}% Automaton Growth Speed`,
  },
  botanicalForaging: {
    name: 'Botanical Foraging',
    description: 'Chance upon excavating a wild bonsai seedling to promote its Maturity rating by +1 tier (up to Premium 五).',
    icon: '🧭',
    maxRank: 5,
    costs: [10, 20, 35, 55, 80],
    getBonusText: (rank: number) => `${rank * 5}% Maturity Uplift Chance${rank === 0 ? ' (0%)' : ''}`,
    getNextBonusText: (rank: number) => `+${(rank + 1) * 5}% Maturity Uplift Chance (${(rank + 1) * 5}% total)`,
  },
  resourceProspecting: {
    name: 'Resource Prospecting',
    description: 'Zen radar attunement increases overworld resource node grid spawn chance (+2% per rank, up to +10%).',
    icon: '⛏️',
    maxRank: 5,
    costs: [8, 16, 28, 45, 65],
    getBonusText: (rank: number) => `+${rank * 2}% Resource Spawn Chance (Close ${4 + rank * 2}%, Mid ${6 + rank * 2}%, Far ${8 + rank * 2}%)`,
    getNextBonusText: (rank: number) => `+${(rank + 1) * 2}% Resource Spawn Chance`,
  },
  botanicalDowsing: {
    name: 'Botanical Dowsing',
    description: 'Bio-resonance antenna increases wild seedling root node grid spawn chance (+2% per rank, up to +10%).',
    icon: '🎋',
    maxRank: 5,
    costs: [8, 16, 28, 45, 65],
    getBonusText: (rank: number) => `+${rank * 2}% Seedling Spawn Chance (${8 + rank * 2}% per grid slot)`,
    getNextBonusText: (rank: number) => `+${(rank + 1) * 2}% Seedling Spawn Chance`,
  },
  perpetuum_mobile: {
    name: '⚡ Perpetuum Mobile',
    description: 'Grants a chance to move the Rover without consuming any battery energy.',
    icon: '⚡',
    maxRank: 5,
    costs: [5, 10, 20, 35, 50],
    getBonusText: (rank: number) => `${rank * 5}% Free Step Chance${rank === 0 ? ' (0%)' : ''}`,
    getNextBonusText: (rank: number) => `+${(rank + 1) * 5}% Free Step Chance (${(rank + 1) * 5}% total)`,
  },
};

// SANCTUARY EXPANSION TIERS (4 Staged Expansions in Botanical Market)
export const SANCTUARY_EXPANSIONS = [
  {
    tier: 1,
    name: 'Expansion I - Inner Wings Expansion',
    plots: 32,
    cost: 150,
    description: 'Unlocks 2×4 columns to left (cols 4,5) and right (cols 10,11) of starter zone (+16 plots, 32 total).',
  },
  {
    tier: 2,
    name: 'Expansion II - Northern Terraces Completion',
    plots: 64,
    cost: 400,
    description: 'Unlocks remaining outer wings on left (cols 0..3) & right (cols 12..15), completing top 4 rows (+32 plots, 64 total).',
  },
  {
    tier: 3,
    name: 'Expansion III - Central Basin Expansion',
    plots: 96,
    cost: 850,
    description: 'Unlocks the next two rows to the south: Rows 4 & 5 across all 16 columns (+32 plots, 96 total).',
  },
  {
    tier: 4,
    name: 'Expansion IV - Southern Pavilions Final Expansion',
    plots: 128,
    cost: 1600,
    description: 'Unlocks the final two southern rows (Rows 6 & 7), completing the full 16×8 = 128 plot sanctuary!',
  },
];

/**
 * Complete standalone vector rendering for Solar Panel Array.
 */
export function renderSolarPanel(
  ctx: CanvasRenderingContext2D,
  sx: number,
  sy: number,
  struct: DeployedStructure,
  structures: DeployedStructure[] = [],
) {
  const {total: totalSolarOutput, count: solarAdjCount} = getSolarPanelOutput(struct, structures);
  const hasAdjacentSolar = solarAdjCount > 0;

  // Timber mount legs
  ctx.fillStyle = '#78350f';
  ctx.fillRect(sx - 20, sy + 6, 5, 10);
  ctx.fillRect(sx + 15, sy + 6, 5, 10);
  ctx.fillRect(sx - 22, sy + 14, 44, 4);

  // Brass joint brackets
  ctx.fillStyle = '#f59e0b';
  ctx.fillRect(sx - 21, sy + 6, 6, 3);
  ctx.fillRect(sx + 15, sy + 6, 6, 3);

  // Tilted Solar Panel Substrate Frame
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.roundRect(sx - 24, sy - 18, 48, 28, 4);
  ctx.fill();
  ctx.strokeStyle = hasAdjacentSolar ? '#fbbf24' : '#38bdf8';
  ctx.lineWidth = hasAdjacentSolar ? 2 : 1.5;
  ctx.stroke();

  // Photovoltaic Crystalline Blue Gradient
  const pvGrad = ctx.createLinearGradient(sx - 22, sy - 16, sx + 22, sy + 8);
  pvGrad.addColorStop(0, '#0284c7');
  pvGrad.addColorStop(0.5, '#0369a1');
  pvGrad.addColorStop(1, '#075985');
  ctx.fillStyle = pvGrad;
  ctx.beginPath();
  ctx.roundRect(sx - 22, sy - 16, 44, 24, 2);
  ctx.fill();

  // Cell dividing grid lines & gold busbars
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(sx, sy - 16);
  ctx.lineTo(sx, sy + 8);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(sx - 22, sy - 4);
  ctx.lineTo(sx + 22, sy - 4);
  ctx.stroke();

  // Specular sun reflection glint
  const glintPulse = 0.4 + Math.sin(Date.now() * 0.003 + sx) * 0.3;
  ctx.fillStyle = `rgba(255, 255, 255, ${glintPulse})`;
  ctx.beginPath();
  ctx.moveTo(sx - 18, sy - 14);
  ctx.lineTo(sx - 6, sy - 14);
  ctx.lineTo(sx - 14, sy + 6);
  ctx.lineTo(sx - 20, sy + 6);
  ctx.closePath();
  ctx.fill();

  // Power Inverter unit with live green LED
  ctx.fillStyle = '#1e293b';
  ctx.beginPath();
  ctx.roundRect(sx + 12, sy + 4, 10, 10, 2);
  ctx.fill();
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 0.8;
  ctx.stroke();

  ctx.fillStyle = hasAdjacentSolar ? '#fbbf24' : '#10b981';
  ctx.beginPath();
  ctx.arc(sx + 17, sy + 9, 2, 0, Math.PI * 2);
  ctx.fill();

  // Generation Badge with Clean Total kW Output
  const formattedKw = `+${totalSolarOutput % 1 === 0 ? totalSolarOutput : totalSolarOutput.toFixed(1)} kW`;
  ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
  ctx.beginPath();
  ctx.roundRect(sx - 24, sy + 18, 48, 14, 4);
  ctx.fill();
  ctx.strokeStyle = hasAdjacentSolar ? '#fbbf24' : 'rgba(56, 189, 248, 0.8)';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = hasAdjacentSolar ? '#fef08a' : '#ffffff';
  ctx.font = 'bold 10px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(formattedKw, sx, sy + 28.5);
}

/**
 * Complete standalone vector rendering for Wind Turbine Generator.
 */
export function renderWindTurbine(
  ctx: CanvasRenderingContext2D,
  sx: number,
  sy: number,
  struct: DeployedStructure,
  structures: DeployedStructure[] = [],
  turbineAngle = 0,
) {
  const {total: totalTurbineOutput, count: turbineAdjCount} = getWindTurbineOutput(struct, structures);
  const hasAdjacentTurbine = turbineAdjCount > 0;

  ctx.fillStyle = '#475569';
  ctx.beginPath();
  ctx.roundRect(sx - 14, sy + 10, 28, 7, 3);
  ctx.fill();
  ctx.strokeStyle = hasAdjacentTurbine ? '#38bdf8' : '#94a3b8';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Central vertical bronze mast
  ctx.fillStyle = '#b45309';
  ctx.fillRect(sx - 2.5, sy - 22, 5, 34);
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 0.8;
  ctx.strokeRect(sx - 2.5, sy - 22, 5, 34);

  // Animated spinning vertical helical aero blades
  const spin = turbineAngle + (sx % 10);
  const bladeOffset = Math.sin(spin) * 16;

  // Left / Front Helical Blade
  ctx.fillStyle = '#fbbf24';
  ctx.beginPath();
  ctx.ellipse(sx + bladeOffset, sy - 8, Math.max(3, Math.abs(bladeOffset * 0.8)), 14, 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#d97706';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Counter Helical Blade
  ctx.fillStyle = '#f59e0b';
  ctx.beginPath();
  ctx.ellipse(sx - bladeOffset, sy - 8, Math.max(3, Math.abs(bladeOffset * 0.8)), 14, -0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#b45309';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Top brass spinner cap
  ctx.fillStyle = '#fde047';
  ctx.beginPath();
  ctx.arc(sx, sy - 24, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Cyan base dynamo coil glow
  const dynamoPulse = 0.5 + Math.sin(Date.now() * 0.008) * 0.4;
  ctx.fillStyle = hasAdjacentTurbine ? `rgba(56, 189, 248, ${dynamoPulse + 0.3})` : `rgba(56, 189, 248, ${dynamoPulse})`;
  ctx.beginPath();
  ctx.arc(sx, sy + 8, 3.5, 0, Math.PI * 2);
  ctx.fill();

  // Generation Badge with Clean Total kW Output
  const formattedTurbineKw = `+${totalTurbineOutput % 1 === 0 ? totalTurbineOutput : totalTurbineOutput.toFixed(1)} kW`;
  ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
  ctx.beginPath();
  ctx.roundRect(sx - 24, sy + 18, 48, 14, 4);
  ctx.fill();
  ctx.strokeStyle = hasAdjacentTurbine ? '#38bdf8' : 'rgba(245, 158, 11, 0.8)';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = hasAdjacentTurbine ? '#7dd3fc' : '#ffffff';
  ctx.font = 'bold 10px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(formattedTurbineKw, sx, sy + 28.5);
}

/**
 * Complete standalone vector rendering for Compost Heap.
 */
export function renderCompostHeap(
  ctx: CanvasRenderingContext2D,
  sx: number,
  sy: number,
  struct: DeployedStructure,
) {
  const waste = struct.depositedWaste || 0;
  const ready = struct.readyCompost || 0;
  const timer = struct.timer || 0;
  const boxW = 44;
  const boxH = 34;
  const bx = sx - boxW / 2;
  const by = sy - boxH / 2 - 1;

  // Ground shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
  ctx.beginPath();
  ctx.ellipse(sx, sy + 15, 24, 7, 0, 0, Math.PI * 2);
  ctx.fill();

  // Clean dark compost loam interior
  ctx.fillStyle = '#1e140a';
  ctx.beginPath();
  ctx.roundRect(bx + 2, by + 2, boxW - 4, boxH - 4, 3);
  ctx.fill();
  ctx.strokeStyle = '#451a03';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Organic compost soil layer fill based on waste capacity
  const fillPct = Math.min(1.0, waste / 20);
  const mulchH = Math.max(6, (boxH - 10) * fillPct);
  const soilY = by + boxH - 4 - mulchH;

  // Crisp dark compost layer
  const soilGrad = ctx.createLinearGradient(bx, soilY, bx, by + boxH - 4);
  soilGrad.addColorStop(0, '#38200f');
  soilGrad.addColorStop(0.6, '#291408');
  soilGrad.addColorStop(1, '#1a0c04');
  ctx.fillStyle = soilGrad;
  ctx.beginPath();
  ctx.roundRect(bx + 3, soilY, boxW - 6, mulchH, [2, 2, 0, 0]);
  ctx.fill();

  if (waste > 0) {
    const mulchColors = ['#84cc16', '#65a30d', '#a16207', '#d97706', '#4d7c0f'];
    for (let i = 0; i < 7; i++) {
      const lx = bx + 7 + ((i * 9 + 4) % (boxW - 14));
      const ly = by + boxH - 5 - ((i * 5 + 3) % Math.max(4, mulchH - 3));
      const rot = i * 0.7;
      ctx.save();
      ctx.translate(lx, ly);
      ctx.rotate(rot);
      ctx.fillStyle = mulchColors[i % mulchColors.length];
      ctx.strokeStyle = '#291408';
      ctx.lineWidth = 0.6;
      ctx.beginPath();
      ctx.moveTo(0, -2.5);
      ctx.lineTo(2.2, 0);
      ctx.lineTo(0, 2.5);
      ctx.lineTo(-2.2, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
  }

  // Crisp Horizontal Slatted Cedar Wood Planks
  const slatCount = 4;
  const slatH = 5.2;
  const slatGap = 2;
  for (let s = 0; s < slatCount; s++) {
    const slatY = by + boxH - 4 - (s + 1) * (slatH + slatGap);

    const cedarGrad = ctx.createLinearGradient(bx, slatY, bx, slatY + slatH);
    cedarGrad.addColorStop(0, '#a14d14');
    cedarGrad.addColorStop(0.5, '#853e0d');
    cedarGrad.addColorStop(1, '#652d08');
    ctx.fillStyle = cedarGrad;
    ctx.beginPath();
    ctx.roundRect(bx, slatY, boxW, slatH, 1);
    ctx.fill();

    ctx.strokeStyle = '#451a03';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.strokeStyle = 'rgba(254, 215, 170, 0.25)';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(bx + 1, slatY + 1);
    ctx.lineTo(bx + boxW - 1, slatY + 1);
    ctx.stroke();
  }

  // Vertical Cedar Framing Posts
  const postW = 5;
  ctx.fillStyle = '#652d08';
  ctx.beginPath();
  ctx.roundRect(bx - 0.5, by + 1, postW, boxH - 2, 1);
  ctx.fill();
  ctx.strokeStyle = '#3b1802';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = '#652d08';
  ctx.beginPath();
  ctx.roundRect(bx + boxW - postW + 0.5, by + 1, postW, boxH - 2, 1);
  ctx.fill();
  ctx.strokeStyle = '#3b1802';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Brass Corner Brackets
  const drawBrassBracket = (cornerX: number, cornerY: number, flipX: boolean, flipY: boolean) => {
    ctx.save();
    ctx.translate(cornerX, cornerY);
    ctx.scale(flipX ? -1 : 1, flipY ? -1 : 1);

    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(7, 0);
    ctx.lineTo(7, 3);
    ctx.lineTo(3, 3);
    ctx.lineTo(3, 7);
    ctx.lineTo(0, 7);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = '#b45309';
    ctx.lineWidth = 0.8;
    ctx.stroke();

    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(1.5, 1.5, 0.9, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  drawBrassBracket(bx - 0.5, by + 1, false, false);
  drawBrassBracket(bx + boxW + 0.5, by + 1, true, false);
  drawBrassBracket(bx - 0.5, by + boxH - 1, false, true);
  drawBrassBracket(bx + boxW + 0.5, by + boxH - 1, true, true);

  if (waste >= 2 && ready === 0) {
    const dTime = Date.now() * 0.004;
    for (let w = 0; w < 3; w++) {
      const wx = sx - 10 + w * 10 + Math.sin(dTime * 2 + w) * 2.5;
      const wy = by - 2 - ((dTime * 14 + w * 9) % 12);
      ctx.fillStyle = 'rgba(163, 230, 53, 0.85)';
      ctx.beginPath();
      ctx.arc(wx, wy, 1.2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Status Box
  const statusBoxW = 62;
  const statusBoxH = 15;
  const statusBoxX = sx - statusBoxW / 2;
  const statusBoxY = sy + 18;
  const cycleProgress = waste >= 2 ? Math.min(1.0, timer / 10) : 0;

  ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
  ctx.beginPath();
  ctx.roundRect(statusBoxX, statusBoxY, statusBoxW, statusBoxH, 4);
  ctx.fill();

  if (cycleProgress > 0) {
    const fillW = Math.max(3, (statusBoxW - 2) * cycleProgress);
    const progGrad = ctx.createLinearGradient(statusBoxX + 1, statusBoxY + 1, statusBoxX + 1 + fillW, statusBoxY + 1);
    progGrad.addColorStop(0, '#15803d');
    progGrad.addColorStop(1, '#84cc16');
    ctx.fillStyle = progGrad;
    ctx.beginPath();
    ctx.roundRect(statusBoxX + 1, statusBoxY + 1, fillW, statusBoxH - 2, 3);
    ctx.fill();
  } else if (ready > 0) {
    ctx.fillStyle = 'rgba(132, 204, 22, 0.35)';
    ctx.beginPath();
    ctx.roundRect(statusBoxX + 1, statusBoxY + 1, statusBoxW - 2, statusBoxH - 2, 3);
    ctx.fill();
  }

  ctx.strokeStyle = ready > 0 ? '#a3e635' : waste >= 2 ? '#84cc16' : '#475569';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(statusBoxX, statusBoxY, statusBoxW, statusBoxH, 4);
  ctx.stroke();

  let statusText = 'Empty';
  let statusTextColor = '#94a3b8';
  if (ready > 0) {
    statusText = `${ready} Compost`;
    statusTextColor = '#bef264';
  } else if (waste > 0) {
    statusText = 'Composting';
    statusTextColor = '#fef08a';
  }

  ctx.fillStyle = statusTextColor;
  ctx.font = 'bold 9.5px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(statusText, sx, statusBoxY + statusBoxH / 2);
  ctx.textBaseline = 'alphabetic';
}

/**
 * Complete standalone vector rendering for Garden Stone Well.
 */
export function renderGardenWell(
  ctx: CanvasRenderingContext2D,
  sx: number,
  sy: number,
  struct: DeployedStructure,
) {
  const isIrrigating = (struct.activeWateringRemaining || 0) > 0;
  const basinW = 38;
  const basinH = 17;
  const bx = sx - basinW / 2;
  const by = sy - 2;

  // Ground shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
  ctx.beginPath();
  ctx.ellipse(sx, sy + 15, 25, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  // Cylindrical Dressed-Stone Basin Body
  const stoneGrad = ctx.createLinearGradient(bx, by, bx + basinW, by);
  stoneGrad.addColorStop(0, '#475569');
  stoneGrad.addColorStop(0.3, '#64748b');
  stoneGrad.addColorStop(0.7, '#475569');
  stoneGrad.addColorStop(1, '#334155');
  ctx.fillStyle = stoneGrad;
  ctx.beginPath();
  ctx.roundRect(bx, by, basinW, basinH, [2, 2, 7, 7]);
  ctx.fill();
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 1.2;
  ctx.stroke();

  // Mortar Lines
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(bx + 1, by + 8);
  ctx.lineTo(bx + basinW - 1, by + 8);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(bx + 10, by); ctx.lineTo(bx + 10, by + 8);
  ctx.moveTo(bx + 26, by); ctx.lineTo(bx + 26, by + 8);
  ctx.moveTo(bx + 18, by + 8); ctx.lineTo(bx + 18, by + basinH);
  ctx.moveTo(bx + 6, by + 8); ctx.lineTo(bx + 6, by + basinH);
  ctx.moveTo(bx + 31, by + 8); ctx.lineTo(bx + 31, by + basinH);
  ctx.stroke();

  // Upper Rim
  ctx.fillStyle = '#64748b';
  ctx.beginPath();
  ctx.ellipse(sx, by, basinW / 2, 6.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 1.2;
  ctx.stroke();

  // Inner Opening
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.ellipse(sx, by, basinW / 2 - 3, 4.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Water Sheen
  const waterGlow = 0.6 + Math.sin(Date.now() * 0.005) * 0.3;
  ctx.fillStyle = isIrrigating ? `rgba(56, 189, 248, ${waterGlow})` : 'rgba(14, 116, 144, 0.8)';
  ctx.beginPath();
  ctx.ellipse(sx, by + 0.5, basinW / 2 - 5, 3.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Upright Posts
  const postW = 4;
  const postH = 26;
  const leftPostX = bx + 1;
  const rightPostX = bx + basinW - postW - 1;
  const postTopY = by - postH;

  ctx.fillStyle = '#78350f';
  ctx.fillRect(leftPostX, postTopY, postW, postH + 4);
  ctx.strokeStyle = '#451a03';
  ctx.lineWidth = 1;
  ctx.strokeRect(leftPostX, postTopY, postW, postH + 4);

  ctx.fillStyle = '#78350f';
  ctx.fillRect(rightPostX, postTopY, postW, postH + 4);
  ctx.strokeStyle = '#451a03';
  ctx.lineWidth = 1;
  ctx.strokeRect(rightPostX, postTopY, postW, postH + 4);

  // Brass brackets
  ctx.fillStyle = '#f59e0b';
  ctx.fillRect(leftPostX - 0.5, by - 2, postW + 1, 3);
  ctx.fillRect(rightPostX - 0.5, by - 2, postW + 1, 3);
  ctx.fillRect(leftPostX - 0.5, postTopY + 2, postW + 1, 2.5);
  ctx.fillRect(rightPostX - 0.5, postTopY + 2, postW + 1, 2.5);

  // Windlass Axle & Rope
  const windlassY = postTopY + 9;
  ctx.fillStyle = '#92400e';
  ctx.fillRect(leftPostX + postW, windlassY, rightPostX - (leftPostX + postW), 3.5);
  ctx.strokeStyle = '#451a03';
  ctx.lineWidth = 0.8;
  ctx.strokeRect(leftPostX + postW, windlassY, rightPostX - (leftPostX + postW), 3.5);

  ctx.fillStyle = '#fef08a';
  ctx.fillRect(sx - 3, windlassY - 0.5, 6, 4.5);
  ctx.strokeStyle = '#b45309';
  ctx.lineWidth = 0.5;
  ctx.strokeRect(sx - 3, windlassY - 0.5, 6, 4.5);

  ctx.strokeStyle = '#fde047';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(sx, windlassY + 4);
  ctx.lineTo(sx, windlassY + 11);
  ctx.stroke();

  // Bucket
  const bucketW = 8;
  const bucketH = 7.5;
  const bucketX = sx - bucketW / 2;
  const bucketY = windlassY + 11;

  ctx.fillStyle = '#78350f';
  ctx.beginPath();
  ctx.roundRect(bucketX, bucketY, bucketW, bucketH, [1, 1, 2, 2]);
  ctx.fill();
  ctx.strokeStyle = '#451a03';
  ctx.lineWidth = 0.8;
  ctx.stroke();

  ctx.fillStyle = '#f59e0b';
  ctx.fillRect(bucketX, bucketY + 1.5, bucketW, 1.2);
  ctx.fillRect(bucketX, bucketY + 4.5, bucketW, 1.2);

  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.arc(sx, bucketY + 1.5, bucketW / 2, Math.PI, 0);
  ctx.stroke();

  // Crank
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(rightPostX + postW, windlassY + 1.75);
  ctx.lineTo(rightPostX + postW + 5, windlassY + 1.75);
  ctx.lineTo(rightPostX + postW + 5, windlassY + 7);
  ctx.stroke();

  ctx.fillStyle = '#78350f';
  ctx.beginPath();
  ctx.arc(rightPostX + postW + 5, windlassY + 7, 1.2, 0, Math.PI * 2);
  ctx.fill();

  // Gable Roof Awning
  const roofApexY = postTopY - 9;
  const roofOverhang = 5;
  const roofLeftX = leftPostX - roofOverhang;
  const roofRightX = rightPostX + postW + roofOverhang;

  ctx.fillStyle = '#5c2b09';
  ctx.beginPath();
  ctx.moveTo(roofLeftX + 2, postTopY + 1);
  ctx.lineTo(sx, roofApexY + 2);
  ctx.lineTo(roofRightX - 2, postTopY + 1);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#92400e';
  ctx.beginPath();
  ctx.moveTo(sx, roofApexY);
  ctx.lineTo(roofLeftX, postTopY + 2);
  ctx.lineTo(roofLeftX + 2, postTopY + 4.5);
  ctx.lineTo(sx, roofApexY + 2.5);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#451a03';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = '#b45309';
  ctx.beginPath();
  ctx.moveTo(sx, roofApexY);
  ctx.lineTo(roofRightX, postTopY + 2);
  ctx.lineTo(roofRightX - 2, postTopY + 4.5);
  ctx.lineTo(sx, roofApexY + 2.5);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#451a03';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = '#fbbf24';
  ctx.beginPath();
  ctx.arc(sx, roofApexY, 2.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#b45309';
  ctx.lineWidth = 0.8;
  ctx.stroke();

  // Status Box
  const wellBoxW = 54;
  const wellBoxH = 15;
  const wellBoxX = sx - wellBoxW / 2;
  const wellBoxY = sy + 18;

  ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
  ctx.beginPath();
  ctx.roundRect(wellBoxX, wellBoxY, wellBoxW, wellBoxH, 4);
  ctx.fill();

  if (isIrrigating) {
    const wellTotal = struct.totalActiveDuration || 20;
    const wellPct = Math.max(0, Math.min(1, (struct.activeWateringRemaining || 0) / wellTotal));
    const fillW = Math.max(2, (wellBoxW - 2) * wellPct);
    const wellGrad = ctx.createLinearGradient(wellBoxX + 1, wellBoxY + 1, wellBoxX + 1 + fillW, wellBoxY + 1);
    wellGrad.addColorStop(0, '#0284c7');
    wellGrad.addColorStop(1, '#38bdf8');
    ctx.fillStyle = wellGrad;
    ctx.beginPath();
    ctx.roundRect(wellBoxX + 1, wellBoxY + 1, fillW, wellBoxH - 2, 3);
    ctx.fill();
  }

  ctx.strokeStyle = isIrrigating ? '#38bdf8' : '#475569';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(wellBoxX, wellBoxY, wellBoxW, wellBoxH, 4);
  ctx.stroke();

  ctx.fillStyle = isIrrigating ? '#e0f2fe' : '#94a3b8';
  ctx.font = 'bold 9.5px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(isIrrigating ? 'Watering' : 'Empty', sx, wellBoxY + wellBoxH / 2);
  ctx.textBaseline = 'alphabetic';
}

/**
 * Complete standalone vector rendering for Crystal Pedestal.
 */
export function renderCrystalPedestal(
  ctx: CanvasRenderingContext2D,
  sx: number,
  sy: number,
  struct: DeployedStructure,
) {
  const isFoliage = struct.type === 'crystal_pedestal_foliage';
  const isBranches = struct.type === 'crystal_pedestal_branches';
  const isTrunk = struct.type === 'crystal_pedestal_trunk';
  const isRoots = struct.type === 'crystal_pedestal_roots';

  const themeColor = isFoliage
    ? '#22c55e'
    : isBranches
    ? '#eab308'
    : isTrunk
    ? '#ef4444'
    : '#3b82f6';
  const lightColor = isFoliage
    ? '#86efac'
    : isBranches
    ? '#fef08a'
    : isTrunk
    ? '#fca5a5'
    : '#93c5fd';
  const darkColor = isFoliage
    ? '#14532d'
    : isBranches
    ? '#78350f'
    : isTrunk
    ? '#7f1d1d'
    : '#1e3a8a';

  const pulse = 0.55 + 0.35 * Math.sin(Date.now() * 0.005 + sx);

  // Ground shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
  ctx.beginPath();
  ctx.ellipse(sx, sy + 15, 20, 6.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Stepped base plinth
  const plinthGrad = ctx.createLinearGradient(sx - 16, sy + 6, sx + 16, sy + 6);
  plinthGrad.addColorStop(0, '#1e293b');
  plinthGrad.addColorStop(0.5, '#334155');
  plinthGrad.addColorStop(1, '#0f172a');
  ctx.fillStyle = plinthGrad;
  ctx.beginPath();
  ctx.roundRect(sx - 16, sy + 6, 32, 9, 2.5);
  ctx.fill();
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Column shaft
  const shaftGrad = ctx.createLinearGradient(sx - 11, sy - 8, sx + 11, sy - 8);
  shaftGrad.addColorStop(0, '#0f172a');
  shaftGrad.addColorStop(0.3, '#1e293b');
  shaftGrad.addColorStop(0.7, '#334155');
  shaftGrad.addColorStop(1, '#0f172a');
  ctx.fillStyle = shaftGrad;
  ctx.beginPath();
  ctx.roundRect(sx - 10, sy - 8, 20, 15, 1.5);
  ctx.fill();
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Capital top platform
  ctx.fillStyle = '#1e293b';
  ctx.beginPath();
  ctx.roundRect(sx - 14, sy - 12, 28, 5, 2);
  ctx.fill();
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Runic trims
  ctx.save();
  ctx.strokeStyle = themeColor;
  ctx.shadowColor = themeColor;
  ctx.shadowBlur = 4 * pulse;
  ctx.globalAlpha = 0.5 + 0.4 * pulse;
  ctx.lineWidth = 1.1;

  ctx.beginPath();
  ctx.moveTo(sx, sy - 7);
  ctx.lineTo(sx, sy + 5);
  ctx.moveTo(sx - 5, sy - 4);
  ctx.lineTo(sx, sy - 1);
  ctx.lineTo(sx + 5, sy - 4);
  ctx.moveTo(sx - 5, sy + 1);
  ctx.lineTo(sx, sy + 4);
  ctx.lineTo(sx + 5, sy + 1);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(sx - 10, sy - 9.5);
  ctx.lineTo(sx + 10, sy - 9.5);
  ctx.stroke();
  ctx.restore();

  // Crystal on top
  const crystalCy = sy - 21;
  const crystalGlow = ctx.createRadialGradient(sx, crystalCy, 2, sx, crystalCy, 22);
  crystalGlow.addColorStop(0, `${themeColor}${Math.round(pulse * 100).toString(16).padStart(2, '0')}`);
  crystalGlow.addColorStop(0.6, `${themeColor}25`);
  crystalGlow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = crystalGlow;
  ctx.beginPath();
  ctx.arc(sx, crystalCy, 22, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.shadowColor = themeColor;
  ctx.shadowBlur = 6 * pulse;

  if (isFoliage) {
    const leafGradL = ctx.createLinearGradient(sx - 10, crystalCy, sx, crystalCy);
    leafGradL.addColorStop(0, darkColor);
    leafGradL.addColorStop(1, themeColor);
    ctx.fillStyle = leafGradL;
    ctx.beginPath();
    ctx.moveTo(sx, crystalCy - 12);
    ctx.bezierCurveTo(sx - 10, crystalCy - 6, sx - 9, crystalCy + 6, sx, crystalCy + 9);
    ctx.closePath();
    ctx.fill();

    const leafGradR = ctx.createLinearGradient(sx, crystalCy, sx + 10, crystalCy);
    leafGradR.addColorStop(0, themeColor);
    leafGradR.addColorStop(1, lightColor);
    ctx.fillStyle = leafGradR;
    ctx.beginPath();
    ctx.moveTo(sx, crystalCy - 12);
    ctx.bezierCurveTo(sx + 10, crystalCy - 6, sx + 9, crystalCy + 6, sx, crystalCy + 9);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = lightColor;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(sx, crystalCy - 12);
    ctx.lineTo(sx, crystalCy + 9);
    ctx.moveTo(sx, crystalCy - 5);
    ctx.lineTo(sx - 6, crystalCy - 2);
    ctx.moveTo(sx, crystalCy - 1);
    ctx.lineTo(sx + 6, crystalCy + 2);
    ctx.moveTo(sx, crystalCy + 3);
    ctx.lineTo(sx - 5, crystalCy + 6);
    ctx.stroke();

  } else if (isBranches) {
    const bSpireGrad = ctx.createLinearGradient(sx - 4, crystalCy, sx + 4, crystalCy);
    bSpireGrad.addColorStop(0, themeColor);
    bSpireGrad.addColorStop(0.5, lightColor);
    bSpireGrad.addColorStop(1, darkColor);
    ctx.fillStyle = bSpireGrad;
    ctx.beginPath();
    ctx.moveTo(sx, crystalCy - 14);
    ctx.lineTo(sx + 3.5, crystalCy + 8);
    ctx.lineTo(sx - 3.5, crystalCy + 8);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = themeColor;
    ctx.beginPath();
    ctx.moveTo(sx - 1.5, crystalCy + 2);
    ctx.lineTo(sx - 9, crystalCy - 7);
    ctx.lineTo(sx - 6, crystalCy - 1);
    ctx.lineTo(sx - 1.5, crystalCy + 7);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = lightColor;
    ctx.beginPath();
    ctx.moveTo(sx + 1.5, crystalCy - 1);
    ctx.lineTo(sx + 8.5, crystalCy - 10);
    ctx.lineTo(sx + 7, crystalCy - 3);
    ctx.lineTo(sx + 1.5, crystalCy + 5);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(sx, crystalCy - 14);
    ctx.lineTo(sx, crystalCy + 8);
    ctx.moveTo(sx - 1.5, crystalCy + 2);
    ctx.lineTo(sx - 9, crystalCy - 7);
    ctx.moveTo(sx + 1.5, crystalCy - 1);
    ctx.lineTo(sx + 8.5, crystalCy - 10);
    ctx.stroke();

  } else if (isTrunk) {
    ctx.fillStyle = darkColor;
    ctx.beginPath();
    ctx.moveTo(sx - 8, crystalCy + 8);
    ctx.lineTo(sx - 8, crystalCy - 6);
    ctx.lineTo(sx - 4, crystalCy - 10);
    ctx.lineTo(sx - 1, crystalCy + 8);
    ctx.closePath();
    ctx.fill();

    const trunkGrad = ctx.createLinearGradient(sx - 4, crystalCy, sx + 4, crystalCy);
    trunkGrad.addColorStop(0, themeColor);
    trunkGrad.addColorStop(0.5, lightColor);
    trunkGrad.addColorStop(1, darkColor);
    ctx.fillStyle = trunkGrad;
    ctx.beginPath();
    ctx.moveTo(sx - 4.5, crystalCy + 9);
    ctx.lineTo(sx - 4.5, crystalCy - 9);
    ctx.lineTo(sx, crystalCy - 13);
    ctx.lineTo(sx + 4.5, crystalCy - 9);
    ctx.lineTo(sx + 4.5, crystalCy + 9);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = themeColor;
    ctx.beginPath();
    ctx.moveTo(sx + 1, crystalCy + 8);
    ctx.lineTo(sx + 4, crystalCy - 8);
    ctx.lineTo(sx + 7.5, crystalCy - 4);
    ctx.lineTo(sx + 7.5, crystalCy + 8);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = '#fee2e2';
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    ctx.moveTo(sx, crystalCy - 13);
    ctx.lineTo(sx, crystalCy + 9);
    ctx.moveTo(sx - 4.5, crystalCy - 9);
    ctx.lineTo(sx - 4.5, crystalCy + 9);
    ctx.moveTo(sx + 4.5, crystalCy - 9);
    ctx.lineTo(sx + 4.5, crystalCy + 9);
    ctx.stroke();

  } else {
    ctx.fillStyle = lightColor;
    ctx.beginPath();
    ctx.moveTo(sx, crystalCy - 12);
    ctx.lineTo(sx + 4, crystalCy - 3);
    ctx.lineTo(sx, crystalCy + 3);
    ctx.lineTo(sx - 4, crystalCy - 3);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = themeColor;
    ctx.beginPath();
    ctx.moveTo(sx - 2, crystalCy - 2);
    ctx.bezierCurveTo(sx - 8, crystalCy - 1, sx - 10, crystalCy + 5, sx - 8, crystalCy + 9);
    ctx.lineTo(sx - 5, crystalCy + 8);
    ctx.bezierCurveTo(sx - 6, crystalCy + 5, sx - 4, crystalCy + 1, sx, crystalCy + 2);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = darkColor;
    ctx.beginPath();
    ctx.moveTo(sx + 2, crystalCy - 2);
    ctx.bezierCurveTo(sx + 8, crystalCy - 1, sx + 10, crystalCy + 5, sx + 8, crystalCy + 9);
    ctx.lineTo(sx + 5, crystalCy + 8);
    ctx.bezierCurveTo(sx + 6, crystalCy + 5, sx + 4, crystalCy + 1, sx, crystalCy + 2);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = themeColor;
    ctx.beginPath();
    ctx.moveTo(sx - 2, crystalCy + 3);
    ctx.lineTo(sx + 2, crystalCy + 3);
    ctx.lineTo(sx, crystalCy + 9);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = '#bfdbfe';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(sx, crystalCy - 12);
    ctx.lineTo(sx, crystalCy + 9);
    ctx.moveTo(sx - 2, crystalCy - 2);
    ctx.lineTo(sx - 8, crystalCy + 9);
    ctx.moveTo(sx + 2, crystalCy - 2);
    ctx.lineTo(sx + 8, crystalCy + 9);
    ctx.stroke();
  }

  ctx.restore();

  for (let sm = 0; sm < 2; sm++) {
    const smAng = Date.now() * 0.004 + sx + sm * Math.PI;
    const smDist = 11 + Math.sin(Date.now() * 0.005 + sm) * 4;
    const smX = sx + Math.cos(smAng) * smDist;
    const smY = crystalCy + Math.sin(smAng) * (smDist * 0.6);
    ctx.fillStyle = lightColor;
    ctx.beginPath();
    ctx.arc(smX, smY, 1.2, 0, Math.PI * 2);
    ctx.fill();
  }
}

/**
 * Universal composite vector renderer for all decor & infrastructure items.
 * Dispatches to the exact same complete render function for BOTH world rendering and preview mode!
 */
export function renderCompleteDecor(
  ctx: CanvasRenderingContext2D,
  type: DeployedStructureType,
  sx: number,
  sy: number,
  orientation: 'horizontal' | 'vertical' = 'horizontal',
  struct?: DeployedStructure,
  structures: DeployedStructure[] = [],
  turbineAngle = 0,
) {
  const dummyStruct: DeployedStructure = struct || {
    id: 'decor_render',
    type,
    x: sx,
    y: sy,
    gridX: sx,
    gridY: sy,
    orientation,
    variant: 0,
    depositedWaste: 0,
    readyCompost: 0,
    timer: 0,
    activeWateringRemaining: 0,
  };

  if (type === 'solar_panel') {
    renderSolarPanel(ctx, sx, sy, dummyStruct, structures);
  } else if (type === 'wind_turbine') {
    renderWindTurbine(ctx, sx, sy, dummyStruct, structures, turbineAngle);
  } else if (type === 'decor_pebble_path') {
    renderPebbleCluster(ctx, sx, sy, dummyStruct.variant ?? 0);
  } else if (type === 'decor_rock_formation') {
    renderRockFormation(ctx, sx, sy);
  } else if (type === 'decor_shrubbery_bush') {
    renderShrubberyBush(ctx, sx, sy);
  } else if (type === 'decor_woven_wall') {
    renderWovenWall(ctx, sx, sy);
  } else if (type === 'tool_compost_heap') {
    renderCompostHeap(ctx, sx, sy, dummyStruct);
  } else if (type === 'tool_garden_well') {
    renderGardenWell(ctx, sx, sy, dummyStruct);
  } else if (type.startsWith('crystal_pedestal')) {
    renderCrystalPedestal(ctx, sx, sy, dummyStruct);
  } else if (type === 'torii_gate') {
    drawToriiGateGround(ctx, sx, sy, orientation);
    drawToriiZenBushes(ctx, sx, sy, orientation, false);
    drawToriiGatePillars(ctx, sx, sy, orientation, false);
    drawToriiGateRoofLintel(ctx, sx, sy, orientation, false);
  }
}

export function renderPebbleCluster(
  ctx: CanvasRenderingContext2D,
  sx: number,
  sy: number,
  variant = 0,
) {
  type StoneDef = {
    x: number;
    y: number;
    rx: number;
    ry: number;
    rot: number;
    fill: string;
    seam: string;
  };
  type MossDef = {x: number; y: number; r: number; col: string};
  type SpeckleDef = {x: number; y: number; r?: number};

  let stones: StoneDef[] = [];
  let mossList: MossDef[] = [];
  let speckles: SpeckleDef[] = [];

  if (variant === 0) {
    // Variant 0: Gentle S-Curve Winding Meander with Promenade Multi-Tone Slate & Sand Stones
    stones = [
      // Top Entry
      {x: sx - 16, y: sy - 24, rx: 4.2, ry: 3.2, rot: 0.3, fill: '#708090', seam: '#52525b'},
      {x: sx - 7, y: sy - 23, rx: 4.8, ry: 3.6, rot: -0.2, fill: '#778899', seam: '#475569'},
      {x: sx + 4, y: sy - 25, rx: 3.8, ry: 2.8, rot: 0.25, fill: '#696969', seam: '#44403c'},
      // Mid-Upper Cluster
      {x: sx - 18, y: sy - 14, rx: 4.5, ry: 3.4, rot: -0.15, fill: '#5f6f7f', seam: '#3f3f46'},
      {x: sx - 8, y: sy - 13, rx: 5.4, ry: 4.0, rot: 0.2, fill: '#8a9a86', seam: '#4b5563'},
      {x: sx + 3, y: sy - 14, rx: 5.0, ry: 3.6, rot: -0.25, fill: '#9ca3af', seam: '#52525b'},
      {x: sx + 14, y: sy - 12, rx: 4.4, ry: 3.3, rot: 0.4, fill: '#708090', seam: '#475569'},
      // Central Main Stepping Stones
      {x: sx - 3, y: sy - 2, rx: 5.6, ry: 4.2, rot: 0.1, fill: '#778899', seam: '#334155'},
      {x: sx + 9, y: sy + 1, rx: 5.2, ry: 3.9, rot: -0.35, fill: '#5f6f7f', seam: '#3f3f46'},
      {x: sx - 12, y: sy + 2, rx: 4.8, ry: 3.5, rot: 0.3, fill: '#8a9a86', seam: '#374151'},
      // Mid-Lower Cluster
      {x: sx - 9, y: sy + 12, rx: 5.2, ry: 3.8, rot: -0.2, fill: '#696969', seam: '#44403c'},
      {x: sx + 4, y: sy + 11, rx: 5.5, ry: 4.0, rot: 0.25, fill: '#708090', seam: '#475569'},
      {x: sx + 15, y: sy + 13, rx: 4.4, ry: 3.3, rot: -0.15, fill: '#9ca3af', seam: '#52525b'},
      // Bottom Exit
      {x: sx - 14, y: sy + 22, rx: 4.0, ry: 3.0, rot: 0.4, fill: '#778899', seam: '#3f3f46'},
      {x: sx - 5, y: sy + 24, rx: 4.9, ry: 3.7, rot: -0.3, fill: '#5f6f7f', seam: '#374151'},
      {x: sx + 8, y: sy + 23, rx: 4.5, ry: 3.3, rot: 0.2, fill: '#8a9a86', seam: '#44403c'},
      {x: sx + 18, y: sy + 22, rx: 3.8, ry: 2.8, rot: -0.4, fill: '#708090', seam: '#334155'},
    ];
    mossList = [
      {x: sx - 13, y: sy - 18, r: 2.1, col: 'rgba(34, 197, 94, 0.85)'},
      {x: sx + 10, y: sy - 18, r: 1.9, col: 'rgba(21, 128, 61, 0.8)'},
      {x: sx - 7, y: sy + 6, r: 2.3, col: 'rgba(34, 197, 94, 0.85)'},
      {x: sx + 14, y: sy + 7, r: 1.8, col: 'rgba(74, 222, 128, 0.75)'},
      {x: sx - 2, y: sy + 18, r: 2.0, col: 'rgba(21, 128, 61, 0.8)'},
    ];
    speckles = [
      {x: sx - 15, y: sy - 6, r: 0.9},
      {x: sx + 8, y: sy - 6, r: 0.9},
      {x: sx - 2, y: sy - 16, r: 0.8},
      {x: sx + 18, y: sy + 4, r: 0.9},
      {x: sx - 9, y: sy + 20, r: 0.8},
    ];
  } else if (variant === 1) {
    // Variant 1: Continuous Cross-Branching Promenade Scatter
    stones = [
      // Top Linkers
      {x: sx - 9, y: sy - 24, rx: 4.5, ry: 3.3, rot: -0.3, fill: '#696969', seam: '#44403c'},
      {x: sx + 3, y: sy - 23, rx: 5.1, ry: 3.7, rot: 0.15, fill: '#708090', seam: '#334155'},
      {x: sx + 14, y: sy - 22, rx: 4.2, ry: 3.1, rot: 0.4, fill: '#778899', seam: '#3f3f46'},
      // Lateral Cross-Connectors
      {x: sx - 19, y: sy - 12, rx: 4.3, ry: 3.2, rot: 0.25, fill: '#5f6f7f', seam: '#374151'},
      {x: sx + 18, y: sy - 10, rx: 4.4, ry: 3.3, rot: -0.2, fill: '#8a9a86', seam: '#44403c'},
      {x: sx - 20, y: sy + 2, rx: 4.1, ry: 3.0, rot: -0.35, fill: '#9ca3af', seam: '#3f3f46'},
      {x: sx + 19, y: sy + 3, rx: 4.3, ry: 3.2, rot: 0.3, fill: '#708090', seam: '#334155'},
      // Center Cluster
      {x: sx - 9, y: sy - 8, rx: 5.3, ry: 3.9, rot: 0.2, fill: '#778899', seam: '#3f3f46'},
      {x: sx + 8, y: sy - 6, rx: 5.5, ry: 4.1, rot: -0.25, fill: '#5f6f7f', seam: '#374151'},
      {x: sx - 1, y: sy - 1, rx: 5.8, ry: 4.3, rot: 0.05, fill: '#708090', seam: '#334155'},
      {x: sx - 10, y: sy + 8, rx: 5.4, ry: 3.9, rot: -0.2, fill: '#8a9a86', seam: '#44403c'},
      {x: sx + 9, y: sy + 9, rx: 5.2, ry: 3.7, rot: 0.35, fill: '#696969', seam: '#3f3f46'},
      // Bottom Linkers
      {x: sx - 17, y: sy + 18, rx: 4.2, ry: 3.1, rot: 0.15, fill: '#708090', seam: '#334155'},
      {x: sx + 16, y: sy + 19, rx: 4.4, ry: 3.2, rot: -0.3, fill: '#5f6f7f', seam: '#374151'},
      {x: sx - 8, y: sy + 23, rx: 4.9, ry: 3.6, rot: 0.3, fill: '#778899', seam: '#3f3f46'},
      {x: sx + 4, y: sy + 22, rx: 5.2, ry: 3.8, rot: -0.15, fill: '#8a9a86', seam: '#44403c'},
    ];
    mossList = [
      {x: sx - 5, y: sy - 14, r: 2.1, col: 'rgba(21, 128, 61, 0.8)'},
      {x: sx + 14, y: sy - 2, r: 2.0, col: 'rgba(34, 197, 94, 0.85)'},
      {x: sx - 14, y: sy + 10, r: 1.9, col: 'rgba(21, 128, 61, 0.8)'},
      {x: sx + 1, y: sy + 13, r: 2.2, col: 'rgba(34, 197, 94, 0.85)'},
    ];
    speckles = [
      {x: sx - 4, y: sy - 8, r: 0.9},
      {x: sx + 5, y: sy + 4, r: 0.9},
      {x: sx - 14, y: sy - 18, r: 0.8},
      {x: sx + 15, y: sy + 12, r: 0.8},
    ];
  } else if (variant === 2) {
    // Variant 2: Diagonal Southwest-to-Northeast Flow
    stones = [
      // SW Entry
      {x: sx - 19, y: sy + 21, rx: 4.4, ry: 3.2, rot: 0.45, fill: '#778899', seam: '#3f3f46'},
      {x: sx - 17, y: sy + 10, rx: 4.7, ry: 3.5, rot: 0.35, fill: '#5f6f7f', seam: '#374151'},
      {x: sx - 9, y: sy + 22, rx: 4.3, ry: 3.1, rot: 0.2, fill: '#8a9a86', seam: '#44403c'},
      // Mid-Low Spine
      {x: sx - 10, y: sy + 11, rx: 5.5, ry: 4.1, rot: 0.4, fill: '#708090', seam: '#334155'},
      {x: sx - 2, y: sy + 17, rx: 4.9, ry: 3.6, rot: -0.2, fill: '#9ca3af', seam: '#3f3f46'},
      {x: sx + 8, y: sy + 21, rx: 4.3, ry: 3.1, rot: 0.3, fill: '#708090', seam: '#334155'},
      // Center Core
      {x: sx - 3, y: sy + 2, rx: 5.8, ry: 4.3, rot: 0.45, fill: '#696969', seam: '#44403c'},
      {x: sx + 7, y: sy + 6, rx: 5.2, ry: 3.7, rot: 0.25, fill: '#5f6f7f', seam: '#374151'},
      {x: sx - 14, y: sy - 4, rx: 4.5, ry: 3.3, rot: -0.3, fill: '#778899', seam: '#3f3f46'},
      // Mid-Upper Spine
      {x: sx + 4, y: sy - 8, rx: 5.6, ry: 4.1, rot: 0.35, fill: '#708090', seam: '#334155'},
      {x: sx - 5, y: sy - 13, rx: 4.8, ry: 3.5, rot: -0.15, fill: '#8a9a86', seam: '#44403c'},
      {x: sx + 15, y: sy - 3, rx: 4.5, ry: 3.3, rot: 0.4, fill: '#9ca3af', seam: '#3f3f46'},
      // NE Exit
      {x: sx - 18, y: sy - 18, rx: 4.0, ry: 2.8, rot: 0.2, fill: '#708090', seam: '#334155'},
      {x: sx + 2, y: sy - 22, rx: 4.6, ry: 3.3, rot: -0.25, fill: '#5f6f7f', seam: '#374151'},
      {x: sx + 13, y: sy - 18, rx: 5.2, ry: 3.7, rot: 0.4, fill: '#696969', seam: '#44403c'},
      {x: sx + 19, y: sy - 11, rx: 4.3, ry: 3.1, rot: 0.3, fill: '#778899', seam: '#3f3f46'},
    ];
    mossList = [
      {x: sx - 5, y: sy + 7, r: 2.1, col: 'rgba(34, 197, 94, 0.85)'},
      {x: sx + 11, y: sy - 12, r: 2.0, col: 'rgba(21, 128, 61, 0.8)'},
      {x: sx - 12, y: sy + 16, r: 1.8, col: 'rgba(74, 222, 128, 0.75)'},
      {x: sx + 1, y: sy - 4, r: 2.2, col: 'rgba(21, 128, 61, 0.85)'},
    ];
    speckles = [
      {x: sx - 11, y: sy - 2, r: 0.9},
      {x: sx + 12, y: sy + 12, r: 0.9},
      {x: sx - 8, y: sy - 20, r: 0.8},
      {x: sx + 17, y: sy - 19, r: 0.8},
    ];
  } else if (variant === 3) {
    // Variant 3: Organic Triad Stepping Cluster
    stones = [
      // North Entry
      {x: sx - 18, y: sy - 20, rx: 4.3, ry: 3.1, rot: -0.2, fill: '#696969', seam: '#44403c'},
      {x: sx - 6, y: sy - 22, rx: 5.1, ry: 3.7, rot: 0.3, fill: '#708090', seam: '#334155'},
      {x: sx + 7, y: sy - 21, rx: 4.9, ry: 3.5, rot: -0.25, fill: '#778899', seam: '#3f3f46'},
      {x: sx + 18, y: sy - 18, rx: 4.0, ry: 2.8, rot: 0.4, fill: '#5f6f7f', seam: '#374151'},
      // Upper Focal Stones
      {x: sx - 10, y: sy - 10, rx: 5.6, ry: 4.1, rot: -0.3, fill: '#8a9a86', seam: '#44403c'},
      {x: sx + 4, y: sy - 9, rx: 5.9, ry: 4.4, rot: 0.25, fill: '#5f6f7f', seam: '#374151'},
      {x: sx + 17, y: sy - 6, rx: 4.5, ry: 3.3, rot: -0.15, fill: '#9ca3af', seam: '#3f3f46'},
      {x: sx - 19, y: sy - 4, rx: 4.3, ry: 3.1, rot: 0.35, fill: '#708090', seam: '#334155'},
      // Center & Lower Stepping Focus
      {x: sx - 2, y: sy + 3, rx: 5.9, ry: 4.4, rot: 0.05, fill: '#778899', seam: '#3f3f46'},
      {x: sx + 12, y: sy + 5, rx: 5.3, ry: 3.7, rot: -0.35, fill: '#708090', seam: '#334155'},
      {x: sx - 15, y: sy + 7, rx: 4.9, ry: 3.5, rot: 0.2, fill: '#696969', seam: '#44403c'},
      // South Exit
      {x: sx - 18, y: sy + 19, rx: 4.0, ry: 3.0, rot: -0.25, fill: '#5f6f7f', seam: '#374151'},
      {x: sx - 5, y: sy + 17, rx: 5.4, ry: 3.9, rot: 0.3, fill: '#778899', seam: '#3f3f46'},
      {x: sx + 8, y: sy + 17, rx: 5.1, ry: 3.6, rot: -0.2, fill: '#8a9a86', seam: '#44403c'},
      {x: sx + 18, y: sy + 18, rx: 4.3, ry: 3.1, rot: 0.4, fill: '#708090', seam: '#334155'},
      {x: sx + 1, y: sy + 23, rx: 4.5, ry: 3.2, rot: -0.1, fill: '#5f6f7f', seam: '#374151'},
    ];
    mossList = [
      {x: sx - 3, y: sy - 6, r: 2.2, col: 'rgba(21, 128, 61, 0.85)'},
      {x: sx + 10, y: sy - 14, r: 1.9, col: 'rgba(34, 197, 94, 0.85)'},
      {x: sx - 12, y: sy + 13, r: 2.1, col: 'rgba(21, 128, 61, 0.8)'},
      {x: sx + 6, y: sy + 9, r: 2.0, col: 'rgba(34, 197, 94, 0.85)'},
    ];
    speckles = [
      {x: sx + 5, y: sy + 1, r: 0.9},
      {x: sx - 8, y: sy + 9, r: 0.9},
      {x: sx - 15, y: sy - 14, r: 0.8},
      {x: sx + 15, y: sy - 14, r: 0.8},
    ];
  } else {
    // Variant 4: Twin Stepping Stone Trail
    stones = [
      // North Links
      {x: sx - 14, y: sy - 22, rx: 4.5, ry: 3.3, rot: -0.2, fill: '#778899', seam: '#3f3f46'},
      {x: sx - 2, y: sy - 21, rx: 5.1, ry: 3.7, rot: 0.25, fill: '#708090', seam: '#334155'},
      {x: sx + 12, y: sy - 22, rx: 4.5, ry: 3.3, rot: 0.3, fill: '#696969', seam: '#44403c'},
      // Lateral Wing Connectors
      {x: sx - 19, y: sy - 10, rx: 4.3, ry: 3.1, rot: 0.3, fill: '#5f6f7f', seam: '#374151'},
      {x: sx + 18, y: sy - 9, rx: 4.5, ry: 3.3, rot: -0.25, fill: '#9ca3af', seam: '#3f3f46'},
      {x: sx - 18, y: sy + 6, rx: 4.5, ry: 3.3, rot: -0.3, fill: '#8a9a86', seam: '#44403c'},
      {x: sx + 19, y: sy + 7, rx: 4.3, ry: 3.1, rot: 0.2, fill: '#708090', seam: '#334155'},
      // Twin Trail Midstones
      {x: sx - 9, y: sy - 9, rx: 5.4, ry: 3.9, rot: -0.15, fill: '#778899', seam: '#3f3f46'},
      {x: sx + 8, y: sy - 8, rx: 5.6, ry: 4.1, rot: 0.2, fill: '#708090', seam: '#334155'},
      {x: sx - 8, y: sy + 3, rx: 5.7, ry: 4.2, rot: 0.15, fill: '#5f6f7f', seam: '#374151'},
      {x: sx + 9, y: sy + 2, rx: 5.8, ry: 4.3, rot: -0.1, fill: '#708090', seam: '#334155'},
      {x: sx - 7, y: sy + 15, rx: 5.3, ry: 3.7, rot: -0.25, fill: '#696969', seam: '#44403c'},
      {x: sx + 8, y: sy + 14, rx: 5.5, ry: 3.9, rot: 0.3, fill: '#8a9a86', seam: '#3f3f46'},
      // South Links
      {x: sx - 18, y: sy + 20, rx: 4.0, ry: 2.8, rot: 0.4, fill: '#5f6f7f', seam: '#374151'},
      {x: sx - 1, y: sy + 23, rx: 4.9, ry: 3.6, rot: -0.15, fill: '#708090', seam: '#334155'},
      {x: sx + 18, y: sy + 21, rx: 4.3, ry: 3.1, rot: -0.3, fill: '#778899', seam: '#44403c'},
    ];
    mossList = [
      {x: sx + 1, y: sy - 14, r: 2.2, col: 'rgba(21, 128, 61, 0.85)'},
      {x: sx - 1, y: sy - 2, r: 2.4, col: 'rgba(34, 197, 94, 0.85)'},
      {x: sx + 1, y: sy + 8, r: 2.3, col: 'rgba(21, 128, 61, 0.8)'},
      {x: sx - 13, y: sy + 18, r: 1.8, col: 'rgba(74, 222, 128, 0.75)'},
    ];
    speckles = [
      {x: sx - 1, y: sy - 9, r: 0.9},
      {x: sx + 1, y: sy + 3, r: 0.9},
      {x: sx - 15, y: sy - 2, r: 0.8},
      {x: sx + 15, y: sy + 11, r: 0.8},
    ];
  }

  // Fine natural sand speckles between stones (matching promenade walkway)
  ctx.fillStyle = 'rgba(254, 240, 138, 0.3)';
  speckles.forEach((sp) => {
    ctx.beginPath();
    ctx.arc(sp.x, sp.y, sp.r || 0.8, 0, Math.PI * 2);
    ctx.fill();
  });

  // Smooth multi-tone river stones with delicate seams and surface sheen
  stones.forEach((st) => {
    ctx.fillStyle = st.fill;
    ctx.beginPath();
    ctx.ellipse(st.x, st.y, st.rx, st.ry, st.rot, 0, Math.PI * 2);
    ctx.fill();

    // Organic seam outline
    ctx.strokeStyle = st.seam;
    ctx.lineWidth = 0.7;
    ctx.stroke();

    // Natural surface sheen (matching promenade)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.14)';
    ctx.beginPath();
    ctx.ellipse(
      st.x - st.rx * 0.22,
      st.y - st.ry * 0.22,
      st.rx * 0.55,
      st.ry * 0.45,
      st.rot,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  });

  // Emerald moss cushions nestled between stones (matching promenade)
  mossList.forEach((m) => {
    ctx.fillStyle = m.col;
    ctx.beginPath();
    ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
    ctx.fill();
  });
}

/**
 * Procedural Wild Barrier Trees generated along and past the 60-step perimeter ring.
 * Foliage inspired by bonsai leaf morphologies (pine, round, cloud, fan, needle).
 * Renders a mix of 1x1 wild barrier trees and expansive 2x2 ancient wild trees.
 */
export function drawWildBarrierTree(
  ctx: CanvasRenderingContext2D,
  worldX: number,
  worldY: number,
  ts: number,
  tx: number,
  ty: number,
  isAncient2x2: boolean,
) {
  const seed = Math.sin(tx * 31.7 + ty * 67.3) * 43758.5453;
  const hash = seed - Math.floor(seed);
  const foliageType = Math.floor(hash * 5); // 0: Pine, 1: Cloud, 2: Round, 3: Fan/Star, 4: Needle

  ctx.save();

  if (isAncient2x2) {
    // 2x2 Ancient Wild Tree centered across the 2x2 slot area
    const cx = worldX + ts;
    const cy = worldY + ts + 8;
    const scale = 1.6 + hash * 0.4;
    const trunkW = 16 * scale;
    const trunkH = 48 * scale;

    // Ground shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
    ctx.beginPath();
    ctx.ellipse(cx, cy + 10, 42 * scale, 16 * scale, 0, 0, Math.PI * 2);
    ctx.fill();

    // Ancient gnarled root buttress spreading into soil
    ctx.strokeStyle = '#1c1917';
    ctx.lineWidth = 8 * scale;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(cx - 24 * scale, cy + 8);
    ctx.lineTo(cx, cy - 8);
    ctx.lineTo(cx + 24 * scale, cy + 8);
    ctx.stroke();

    // Massive Ancient Gnarled Trunk
    const trunkGrad = ctx.createLinearGradient(cx - trunkW, cy, cx + trunkW, cy);
    trunkGrad.addColorStop(0, '#1c1917');
    trunkGrad.addColorStop(0.4, '#291508');
    trunkGrad.addColorStop(0.7, '#3b1d0c');
    trunkGrad.addColorStop(1, '#1c1917');
    ctx.fillStyle = trunkGrad;

    ctx.beginPath();
    ctx.moveTo(cx - trunkW * 0.7, cy + 6);
    ctx.bezierCurveTo(
      cx - trunkW * 0.9,
      cy - trunkH * 0.3,
      cx - trunkW * 0.5,
      cy - trunkH * 0.7,
      cx - trunkW * 0.3,
      cy - trunkH,
    );
    ctx.lineTo(cx + trunkW * 0.3, cy - trunkH);
    ctx.bezierCurveTo(
      cx + trunkW * 0.5,
      cy - trunkH * 0.7,
      cx + trunkW * 0.9,
      cy - trunkH * 0.3,
      cx + trunkW * 0.7,
      cy + 6,
    );
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#0f0e0c';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Deep ancient canopy pads (dense wild cloud/pine tiers)
    const padColors = ['#022c22', '#064e3b', '#065f46', '#047857', '#0f766e'];
    const pColor1 = padColors[Math.floor(hash * padColors.length)];
    const pColor2 = padColors[(Math.floor(hash * padColors.length) + 1) % padColors.length];

    // Left main branch pad
    ctx.fillStyle = pColor1;
    ctx.beginPath();
    ctx.ellipse(cx - 28 * scale, cy - trunkH * 0.65, 26 * scale, 15 * scale, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(6, 95, 70, 0.4)';
    ctx.beginPath();
    ctx.ellipse(cx - 28 * scale, cy - trunkH * 0.68, 20 * scale, 10 * scale, -0.2, 0, Math.PI * 2);
    ctx.fill();

    // Right main branch pad
    ctx.fillStyle = pColor2;
    ctx.beginPath();
    ctx.ellipse(cx + 28 * scale, cy - trunkH * 0.6, 28 * scale, 16 * scale, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(4, 120, 87, 0.4)';
    ctx.beginPath();
    ctx.ellipse(cx + 28 * scale, cy - trunkH * 0.63, 22 * scale, 11 * scale, 0.2, 0, Math.PI * 2);
    ctx.fill();

    // Ancient Top Crown Pad
    ctx.fillStyle = '#064e3b';
    ctx.beginPath();
    ctx.ellipse(cx, cy - trunkH - 6 * scale, 34 * scale, 18 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(16, 185, 129, 0.25)';
    ctx.beginPath();
    ctx.ellipse(cx, cy - trunkH - 10 * scale, 24 * scale, 11 * scale, 0, 0, Math.PI * 2);
    ctx.fill();

    // Wild glowing amber/emerald forest eye / spore in hollow
    ctx.fillStyle = hash > 0.5 ? '#10b981' : '#f59e0b';
    ctx.beginPath();
    ctx.arc(cx, cy - trunkH * 0.35, 1.8 * scale, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // 1x1 Wild Barrier Tree centered in grid cell
    const cx = worldX + ts / 2;
    const cy = worldY + ts * 0.85;
    const scale = 0.9 + hash * 0.3;
    const trunkW = 6 * scale;
    const trunkH = 26 * scale;

    // Ground shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
    ctx.beginPath();
    ctx.ellipse(cx, cy + 4, 18 * scale, 7 * scale, 0, 0, Math.PI * 2);
    ctx.fill();

    // Trunk
    ctx.fillStyle = '#291508';
    ctx.beginPath();
    ctx.moveTo(cx - trunkW, cy + 2);
    ctx.lineTo(cx - trunkW * 0.5, cy - trunkH);
    ctx.lineTo(cx + trunkW * 0.5, cy - trunkH);
    ctx.lineTo(cx + trunkW, cy + 2);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#1c1917';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Foliage inspired by Bonsai Leaf Types
    if (foliageType === 0 || foliageType === 4) {
      // Conical / Pine Needle Pagoda (3 vertical tapering conical tiers)
      const pColors = ['#022c22', '#064e3b', '#065f46'];
      for (let t = 0; t < 3; t++) {
        const tierY = cy - trunkH * 0.4 - t * (10 * scale);
        const tierW = (20 - t * 4) * scale;
        const tierH = 14 * scale;

        ctx.fillStyle = pColors[t];
        ctx.beginPath();
        ctx.moveTo(cx, tierY - tierH);
        ctx.lineTo(cx + tierW, tierY);
        ctx.lineTo(cx - tierW, tierY);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = 'rgba(52, 211, 153, 0.2)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    } else if (foliageType === 1) {
      // Cloud Foliage (Billowing cloud pads)
      ctx.fillStyle = '#064e3b';
      ctx.beginPath();
      ctx.arc(cx - 10 * scale, cy - trunkH * 0.8, 12 * scale, 0, Math.PI * 2);
      ctx.arc(cx + 10 * scale, cy - trunkH * 0.8, 12 * scale, 0, Math.PI * 2);
      ctx.arc(cx, cy - trunkH * 1.1, 14 * scale, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(16, 185, 129, 0.2)';
      ctx.beginPath();
      ctx.arc(cx, cy - trunkH * 1.15, 8 * scale, 0, Math.PI * 2);
      ctx.fill();
    } else if (foliageType === 2) {
      // Dense Round / Oval Canopy
      ctx.fillStyle = '#047857';
      ctx.beginPath();
      ctx.ellipse(cx, cy - trunkH * 0.9, 17 * scale, 21 * scale, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#065f46';
      ctx.beginPath();
      ctx.ellipse(cx - 3 * scale, cy - trunkH * 0.95, 12 * scale, 15 * scale, 0, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Fan / Star / Snowflake Wild Foliage
      ctx.fillStyle = '#064e3b';
      for (let s = 0; s < 5; s++) {
        const sAngle = (s * Math.PI * 2) / 5 - Math.PI / 2;
        const sDist = 10 * scale;
        ctx.beginPath();
        ctx.arc(
          cx + Math.cos(sAngle) * sDist,
          cy - trunkH * 0.9 + Math.sin(sAngle) * (sDist * 0.7),
          9 * scale,
          0,
          Math.PI * 2,
        );
        ctx.fill();
      }
      ctx.fillStyle = '#047857';
      ctx.beginPath();
      ctx.arc(cx, cy - trunkH * 0.9, 10 * scale, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.restore();
}

/**
 * Procedural ground layer rendering for Torii Gate:
 * - Pebble path in the center plot (walkable flooring)
 * - Stone pedestals and ground shadows for outer pillars
 * Drawn in Ground Layer BEFORE player avatar and entities.
 */
export function drawToriiGateGround(
  ctx: CanvasRenderingContext2D,
  sx: number,
  sy: number,
  orientation: 'horizontal' | 'vertical' = 'horizontal',
) {
  ctx.save();
  // 0. Integrated Pebble Path Graphic on Middle Plot (walkable)
  renderPebbleCluster(ctx, sx, sy, 0);

  if (orientation === 'vertical') {
    // Proportional Vertical Torii Gate: Pillars placed on inner edges next to center plot
    const topY = sy - 44;
    const bottomY = sy + 44;

    // 1. Perspective portal ground shadows
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.beginPath();
    ctx.ellipse(sx - 22, bottomY + 10, 11, 4.5, 0, 0, Math.PI * 2);
    ctx.ellipse(sx + 22, bottomY + 10, 11, 4.5, 0, 0, Math.PI * 2);
    ctx.ellipse(sx - 20, topY + 10, 9, 3.8, 0, 0, Math.PI * 2);
    ctx.ellipse(sx + 20, topY + 10, 9, 3.8, 0, 0, Math.PI * 2);
    ctx.fill();

    // 2. Stepped slate stone pedestals at bottom and top portals
    const drawVerticalPedestal = (px: number, py: number, scale = 1) => {
      ctx.fillStyle = '#334155';
      ctx.beginPath();
      ctx.roundRect(px - 9 * scale, py + 2, 18 * scale, 7 * scale, 2);
      ctx.fill();
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.roundRect(px - 6 * scale, py - 3, 12 * scale, 5 * scale, 1.5);
      ctx.fill();
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 0.8;
      ctx.stroke();

      ctx.fillStyle = '#0f172a';
      ctx.fillRect(px - 4.5 * scale, py - 6, 9 * scale, 3.5);
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(px - 5 * scale, py - 7, 10 * scale, 1.2);
    };

    drawVerticalPedestal(sx - 22, bottomY + 6, 1.05);
    drawVerticalPedestal(sx + 22, bottomY + 6, 1.05);
    drawVerticalPedestal(sx - 20, topY + 6, 0.95);
    drawVerticalPedestal(sx + 20, topY + 6, 0.95);
  } else {
    // Proportional Horizontal Torii Gate (3x1 plots: left plot, center plot, right plot).
    // Pillars moved to inner edges of outside grid plots:
    // Left pillar at sx - 44 (right edge of left plot, right next to center walkway!)
    // Right pillar at sx + 44 (left edge of right plot, right next to center walkway!)
    // Gate span is ~1.22 tile widths between pillars instead of distorted 2.5 tile widths.
    const leftX = sx - 44;
    const rightX = sx + 44;
    const groundY = sy + 20;

    // 1. Ground Shadows for outer stone pedestals
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.beginPath();
    ctx.ellipse(leftX, groundY + 4, 15, 5.5, 0, 0, Math.PI * 2);
    ctx.ellipse(rightX, groundY + 4, 15, 5.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // 2. Stepped Slate Stone Pedestals (Kamebara)
    const drawPedestal = (px: number) => {
      ctx.fillStyle = '#334155';
      ctx.beginPath();
      ctx.roundRect(px - 12, groundY - 6, 24, 9, 2);
      ctx.fill();
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.roundRect(px - 9, groundY - 10, 18, 5.5, 1.5);
      ctx.fill();
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Black lacquered nemaki collar with gold trim
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(px - 6, groundY - 14, 12, 4.5);
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(px - 6.5, groundY - 15, 13, 1.5);
    };

    drawPedestal(leftX);
    drawPedestal(rightX);
  }
  ctx.restore();
}

/**
 * Ornamental Zen topiary shrubbery / evergreen bushes planted at the base of the pillars
 * on the outer footprint plots (plots 0 & 2 for Horizontal 3x1, top & bottom plots for Vertical 1x3).
 * Makes it unmistakably clear that both outer plots are occupied and styled as part of the Torii Gate installation!
 */
export function drawToriiZenBushes(
  ctx: CanvasRenderingContext2D,
  sx: number,
  sy: number,
  orientation: 'horizontal' | 'vertical' = 'horizontal',
  isGhost = false,
) {
  ctx.save();
  if (isGhost) {
    ctx.globalAlpha = 0.65;
  }

  const drawShrubCluster = (cx: number, cy: number, r: number) => {
    // 1. Loam soil base & ground shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.beginPath();
    ctx.ellipse(cx, cy + r * 0.45, r * 1.35, r * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Dark soil mound
    ctx.fillStyle = '#3b1802';
    ctx.beginPath();
    ctx.ellipse(cx, cy + r * 0.35, r * 1.15, r * 0.38, 0, 0, Math.PI * 2);
    ctx.fill();

    // Slate stone border curbing
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    ctx.stroke();

    // 2. Deep forest green evergreen base mounds (#022c22 & #064e3b)
    ctx.fillStyle = '#064e3b';
    ctx.beginPath();
    ctx.arc(cx - r * 0.45, cy - r * 0.1, r * 0.7, 0, Math.PI * 2);
    ctx.arc(cx + r * 0.45, cy - r * 0.1, r * 0.7, 0, Math.PI * 2);
    ctx.arc(cx, cy - r * 0.4, r * 0.8, 0, Math.PI * 2);
    ctx.fill();

    // 3. Midtone rich emerald topiary pads (#047857)
    ctx.fillStyle = '#047857';
    ctx.beginPath();
    ctx.arc(cx - r * 0.3, cy - r * 0.3, r * 0.55, 0, Math.PI * 2);
    ctx.arc(cx + r * 0.3, cy - r * 0.3, r * 0.55, 0, Math.PI * 2);
    ctx.arc(cx, cy - r * 0.55, r * 0.6, 0, Math.PI * 2);
    ctx.fill();

    // 4. Vibrant sunlit leaf highlights (#10b981)
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.arc(cx - r * 0.18, cy - r * 0.5, r * 0.38, 0, Math.PI * 2);
    ctx.arc(cx + r * 0.18, cy - r * 0.5, r * 0.38, 0, Math.PI * 2);
    ctx.arc(cx, cy - r * 0.7, r * 0.42, 0, Math.PI * 2);
    ctx.fill();

    // 5. Crisp spring-lime tip leaves (#34d399)
    ctx.fillStyle = '#34d399';
    ctx.beginPath();
    ctx.arc(cx - r * 0.08, cy - r * 0.75, r * 0.24, 0, Math.PI * 2);
    ctx.arc(cx + r * 0.08, cy - r * 0.75, r * 0.24, 0, Math.PI * 2);
    ctx.fill();

    // 6. Delicate blossom flecks (blush & white)
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(cx - r * 0.35, cy - r * 0.35, 1.3, 0, Math.PI * 2);
    ctx.arc(cx + r * 0.3, cy - r * 0.2, 1.3, 0, Math.PI * 2);
    ctx.arc(cx + r * 0.05, cy - r * 0.55, 1.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fbcfe8';
    ctx.beginPath();
    ctx.arc(cx - r * 0.15, cy - r * 0.4, 1.4, 0, Math.PI * 2);
    ctx.arc(cx + r * 0.25, cy - r * 0.45, 1.4, 0, Math.PI * 2);
    ctx.fill();
  };

  if (orientation === 'vertical') {
    const topY = sy - 44;
    const bottomY = sy + 44;

    // Top outer plot (plots centered at sy - SANCTUARY_GRID.cellH = sy - 74):
    // Lush manicured bushes framing around and behind top pillar post
    drawShrubCluster(sx - 28, topY - 18, 11);
    drawShrubCluster(sx + 28, topY - 18, 11);
    drawShrubCluster(sx, topY - 28, 13);

    // Bottom outer plot (plots centered at sy + SANCTUARY_GRID.cellH = sy + 74):
    // Lush manicured bushes flanking the bottom pillar post
    drawShrubCluster(sx - 28, bottomY + 16, 11);
    drawShrubCluster(sx + 28, bottomY + 16, 11);
    drawShrubCluster(sx, bottomY + 24, 13);
  } else {
    const groundY = sy + 20;

    // Left outer plot (plot centered at sx - SANCTUARY_GRID.cellW = sx - 72):
    // Lush layered green foliage shrubbery/bushes on the left side of the vermilion pillar, filling the outer plot
    drawShrubCluster(sx - 68, groundY - 2, 13);
    drawShrubCluster(sx - 80, groundY + 2, 10.5);
    drawShrubCluster(sx - 56, groundY + 1, 10.5);

    // Right outer plot (plot centered at sx + SANCTUARY_GRID.cellW = sx + 72):
    // Matching lush green bushes on the right side of the vermilion pillar, filling the outer plot
    drawShrubCluster(sx + 68, groundY - 2, 13);
    drawShrubCluster(sx + 80, groundY + 2, 10.5);
    drawShrubCluster(sx + 56, groundY + 1, 10.5);
  }
  ctx.restore();
}

/**
 * Procedural vermilion pillar posts & lower tie-beam (Hashira & Nuki) rendering for Torii Gate.
 * Drawn strictly as part of row Y during the Y-sorted entity pass (Layer 2).
 */
export function drawToriiGatePillars(
  ctx: CanvasRenderingContext2D,
  sx: number,
  sy: number,
  orientation: 'horizontal' | 'vertical' = 'horizontal',
  isGhost = false,
) {
  ctx.save();
  if (isGhost) {
    ctx.globalAlpha = 0.65;
  }

  if (orientation === 'vertical') {
    const topY = sy - 44;
    const bottomY = sy + 44;

    // Vertical Vermilion Timber Columns flanking the corridor at sx - 22 and sx + 22
    const runnerGradL = ctx.createLinearGradient(sx - 26, 0, sx - 16, 0);
    runnerGradL.addColorStop(0, '#991b1b');
    runnerGradL.addColorStop(0.5, '#dc2626');
    runnerGradL.addColorStop(1, '#7f1d1d');
    ctx.fillStyle = runnerGradL;

    ctx.fillRect(sx - 26, bottomY - 32, 8, 32);
    ctx.fillRect(sx - 24, topY - 32, 7, 32);

    const runnerGradR = ctx.createLinearGradient(sx + 16, 0, sx + 26, 0);
    runnerGradR.addColorStop(0, '#dc2626');
    runnerGradR.addColorStop(0.5, '#ef4444');
    runnerGradR.addColorStop(1, '#991b1b');
    ctx.fillStyle = runnerGradR;
    ctx.fillRect(sx + 18, bottomY - 32, 8, 32);
    ctx.fillRect(sx + 17, topY - 32, 7, 32);

    // Longitude side rails connecting top and bottom posts along outer edges
    ctx.strokeStyle = '#991b1b';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(sx - 22, bottomY - 14);
    ctx.lineTo(sx - 20, topY - 14);
    ctx.moveTo(sx + 22, bottomY - 14);
    ctx.lineTo(sx + 20, topY - 14);
    ctx.stroke();
  } else {
    // Proportional Horizontal Torii Gate
    // Pillars located at sx - 44 and sx + 44 (88px span, ~1.22 tile widths)
    const leftX = sx - 44;
    const rightX = sx + 44;
    const groundY = sy + 20;
    const beamY = sy - 46;
    const kasagiY = sy - 64;

    // Main Vermilion Wooden Pillars (Hashira)
    const drawPillar = (px: number, incline: number) => {
      const postGrad = ctx.createLinearGradient(px - 5.5, groundY - 14, px + 5.5, groundY - 14);
      postGrad.addColorStop(0, '#991b1b');
      postGrad.addColorStop(0.3, '#dc2626');
      postGrad.addColorStop(0.7, '#ef4444');
      postGrad.addColorStop(1, '#7f1d1d');

      ctx.fillStyle = postGrad;
      ctx.beginPath();
      ctx.moveTo(px - 5, groundY - 14);
      ctx.lineTo(px + incline - 4, kasagiY + 6);
      ctx.lineTo(px + incline + 4, kasagiY + 6);
      ctx.lineTo(px + 5, groundY - 14);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = '#7f1d1d';
      ctx.lineWidth = 1;
      ctx.stroke();
    };

    drawPillar(leftX, 1.2);
    drawPillar(rightX, -1.2);

    // Lower Tie-Beam (Nuki) penetrating both pillars
    const nukiGrad = ctx.createLinearGradient(0, beamY, 0, beamY + 8);
    nukiGrad.addColorStop(0, '#dc2626');
    nukiGrad.addColorStop(0.5, '#ef4444');
    nukiGrad.addColorStop(1, '#991b1b');
    ctx.fillStyle = nukiGrad;
    ctx.beginPath();
    ctx.roundRect(leftX - 12, beamY, (rightX - leftX) + 24, 7, 1);
    ctx.fill();
    ctx.strokeStyle = '#7f1d1d';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Wedge pins (Kusabi) on outer pillar joints
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.moveTo(leftX - 5, beamY - 2); ctx.lineTo(leftX - 8, beamY + 9); ctx.lineTo(leftX - 5, beamY + 9); ctx.closePath(); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(rightX + 5, beamY - 2); ctx.lineTo(rightX + 8, beamY + 9); ctx.lineTo(rightX + 5, beamY + 9); ctx.closePath(); ctx.fill();

    // Central Tablet Strut (Gakuzuka) & Framed Dedication Tablet
    ctx.fillStyle = '#b91c1c';
    ctx.fillRect(sx - 3, kasagiY + 5, 6, beamY - (kasagiY + 5));

    // Framed Tablet (Gaku)
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.roundRect(sx - 10, beamY - 12, 20, 11, 2);
    ctx.fill();
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ctx.fillStyle = '#fde047';
    ctx.font = 'bold 7px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('鳥居', sx, beamY - 4);
  }

  ctx.restore();
}

/**
 * Procedural upper Kasagi & Shimaki roof beam lintel rendering for Torii Gate.
 * Positioned way above player head height (sy - 64). Drawn overhead so player walks under the roof.
 * CRITICAL: NEVER draws bushes! Bushes are strictly drawn in Layer 2.
 */
export function drawToriiGateRoofLintel(
  ctx: CanvasRenderingContext2D,
  sx: number,
  sy: number,
  orientation: 'horizontal' | 'vertical' = 'horizontal',
  isGhost = false,
) {
  ctx.save();
  if (isGhost) {
    ctx.globalAlpha = 0.65;
  }

  if (orientation === 'vertical') {
    const topY = sy - 44;
    const bottomY = sy + 44;

    // Northern Top Arch Lintel (Kasagi & Shimaki) - raised comfortably above player head
    const topSpan = 60;
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.roundRect(sx - topSpan / 2, topY - 44, topSpan, 6, 1);
    ctx.fill();
    ctx.strokeStyle = '#7f1d1d';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(sx - topSpan / 2 - 4, topY - 43);
    ctx.quadraticCurveTo(sx, topY - 41, sx + topSpan / 2 + 4, topY - 43);
    ctx.lineTo(sx + topSpan / 2 + 7, topY - 51);
    ctx.quadraticCurveTo(sx, topY - 49, sx - topSpan / 2 - 7, topY - 51);
    ctx.closePath();
    ctx.fillStyle = '#0f172a';
    ctx.fill();
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(sx - topSpan / 2 - 7, topY - 51, 5, 8);
    ctx.fillRect(sx + topSpan / 2 + 2, topY - 51, 5, 8);

    // Southern Arch Crossbeam - raised comfortably above player head
    const botSpan = 66;
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.roundRect(sx - botSpan / 2, bottomY - 44, botSpan, 6, 1);
    ctx.fill();
    ctx.strokeStyle = '#7f1d1d';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(sx - botSpan / 2 - 4, bottomY - 43);
    ctx.quadraticCurveTo(sx, bottomY - 41, sx + botSpan / 2 + 4, bottomY - 43);
    ctx.lineTo(sx + botSpan / 2 + 7, bottomY - 51);
    ctx.quadraticCurveTo(sx, bottomY - 49, sx - botSpan / 2 - 7, bottomY - 51);
    ctx.closePath();
    ctx.fillStyle = '#0f172a';
    ctx.fill();
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(sx - botSpan / 2 - 7, bottomY - 51, 5, 8);
    ctx.fillRect(sx + botSpan / 2 + 2, bottomY - 51, 5, 8);
  } else {
    const leftX = sx - 44;
    const rightX = sx + 44;
    const beamY = sy - 46;
    const kasagiY = sy - 64;

    // Upper Lintel Beams (Shimaki & Kasagi)
    const shimakiGrad = ctx.createLinearGradient(0, kasagiY + 4, 0, kasagiY + 11);
    shimakiGrad.addColorStop(0, '#ef4444');
    shimakiGrad.addColorStop(1, '#991b1b');
    ctx.fillStyle = shimakiGrad;
    ctx.beginPath();
    ctx.roundRect(leftX - 16, kasagiY + 4, (rightX - leftX) + 32, 7, 1);
    ctx.fill();
    ctx.strokeStyle = '#7f1d1d';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Kasagi (Upper main roof beam with graceful curved upturn ends)
    const spanHalf = ((rightX - leftX) + 40) / 2;
    const kLeft = sx - spanHalf;
    const kRight = sx + spanHalf;

    ctx.beginPath();
    ctx.moveTo(kLeft, kasagiY + 4);
    ctx.quadraticCurveTo(sx, kasagiY + 6, kRight, kasagiY + 4);
    ctx.lineTo(kRight + 3, kasagiY - 6);
    ctx.quadraticCurveTo(sx, kasagiY - 3, kLeft - 3, kasagiY - 6);
    ctx.closePath();

    const kasagiGrad = ctx.createLinearGradient(0, kasagiY - 6, 0, kasagiY + 6);
    kasagiGrad.addColorStop(0, '#1e293b');
    kasagiGrad.addColorStop(0.4, '#0f172a');
    kasagiGrad.addColorStop(0.7, '#991b1b');
    kasagiGrad.addColorStop(1, '#7f1d1d');
    ctx.fillStyle = kasagiGrad;
    ctx.fill();
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // Top Dark Slate Ridge Capping
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(kLeft - 3, kasagiY - 6);
    ctx.quadraticCurveTo(sx, kasagiY - 3, kRight + 3, kasagiY - 6);
    ctx.stroke();

    // Gold-tipped corner finials (Kin-kanagu) on both Kasagi ends
    const drawGoldFinial = (fx: number, fy: number, isRight: boolean) => {
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.moveTo(fx, fy - 6);
      ctx.lineTo(isRight ? fx + 6 : fx - 3, fy - 4);
      ctx.lineTo(isRight ? fx + 3 : fx - 3, fy + 4);
      ctx.lineTo(fx, fy + 4);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 0.8;
      ctx.stroke();
    };

    drawGoldFinial(kLeft, kasagiY, false);
    drawGoldFinial(kRight, kasagiY, true);

    // Decorative amulets on outer posts
    const drawTassel = (tx: number, ty: number) => {
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(tx, ty);
      ctx.lineTo(tx, ty + 6);
      ctx.stroke();
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(tx, ty + 7, 2, 0, Math.PI * 2);
      ctx.fill();
    };
    drawTassel(leftX - 6, beamY + 7);
    drawTassel(rightX + 6, beamY + 7);
  }

  ctx.restore();
}

/**
 * Legacy compatibility alias for overhead Kasagi roof lintel.
 */
export function drawToriiGateOverhead(
  ctx: CanvasRenderingContext2D,
  sx: number,
  sy: number,
  orientation: 'horizontal' | 'vertical' = 'horizontal',
  isGhost = false,
) {
  drawToriiGateRoofLintel(ctx, sx, sy, orientation, isGhost);
}

/**
 * Procedural vector rendering for Horizontal Torii Gate (3x1 plots)
 */
export function drawToriiGateHorizontal(
  ctx: CanvasRenderingContext2D,
  sx: number,
  sy: number,
  isGhost = false,
) {
  drawToriiGateGround(ctx, sx, sy, 'horizontal');
  drawToriiZenBushes(ctx, sx, sy, 'horizontal', isGhost);
  drawToriiGatePillars(ctx, sx, sy, 'horizontal', isGhost);
  drawToriiGateRoofLintel(ctx, sx, sy, 'horizontal', isGhost);
}

/**
 * Procedural vector rendering for Vertical Torii Gate (1x3 plots)
 */
export function drawToriiGateVertical(
  ctx: CanvasRenderingContext2D,
  sx: number,
  sy: number,
  isGhost = false,
) {
  drawToriiGateGround(ctx, sx, sy, 'vertical');
  drawToriiZenBushes(ctx, sx, sy, 'vertical', isGhost);
  drawToriiGatePillars(ctx, sx, sy, 'vertical', isGhost);
  drawToriiGateRoofLintel(ctx, sx, sy, 'vertical', isGhost);
}

/**
 * Complete standalone vector rendering for Zen Rock Formation:
 * Raked circular concentric sand swirls (suiban tray base), ripple lines,
 * all 3 slate/granite boulders with facets, and emerald moss accents.
 * Used for BOTH placed world entity and preview mode!
 */
export function renderRockFormation(
  ctx: CanvasRenderingContext2D,
  sx: number,
  sy: number,
) {
  // Raked circular concentric sand swirls with gentle gravel grooves (suiban base)
  ctx.fillStyle = 'rgba(231, 229, 228, 0.15)';
  ctx.beginPath();
  ctx.ellipse(sx, sy, 26, 17, 0, 0, Math.PI * 2);
  ctx.fill();

  // Concentric raked sand ripple lines
  ctx.strokeStyle = 'rgba(214, 211, 209, 0.45)';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.ellipse(sx, sy, 24, 15, 0, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = 'rgba(214, 211, 209, 0.35)';
  ctx.beginPath();
  ctx.ellipse(sx, sy, 18, 11, 0, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = 'rgba(214, 211, 209, 0.25)';
  ctx.beginPath();
  ctx.ellipse(sx, sy, 12, 7, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Three natural slate and granite garden boulders
  // Boulder 1: Tall Center-Right Granite Monolith
  ctx.fillStyle = '#334155';
  ctx.beginPath();
  ctx.moveTo(sx - 4, sy + 7);
  ctx.lineTo(sx - 2, sy - 20);
  ctx.lineTo(sx + 9, sy - 16);
  ctx.lineTo(sx + 15, sy + 8);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Boulder 1: Sunlit rock facet highlight
  ctx.fillStyle = '#64748b';
  ctx.beginPath();
  ctx.moveTo(sx - 2, sy - 20);
  ctx.lineTo(sx + 4, sy - 18);
  ctx.lineTo(sx + 2, sy + 6);
  ctx.lineTo(sx - 4, sy + 7);
  ctx.closePath();
  ctx.fill();

  // Boulder 2: Medium Left Slanted Slate Boulder
  ctx.fillStyle = '#1e293b';
  ctx.beginPath();
  ctx.moveTo(sx - 18, sy + 8);
  ctx.lineTo(sx - 14, sy - 8);
  ctx.lineTo(sx - 5, sy - 3);
  ctx.lineTo(sx - 4, sy + 9);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 1.2;
  ctx.stroke();

  ctx.fillStyle = '#475569';
  ctx.beginPath();
  ctx.moveTo(sx - 14, sy - 8);
  ctx.lineTo(sx - 7, sy - 5);
  ctx.lineTo(sx - 6, sy + 7);
  ctx.lineTo(sx - 15, sy + 7);
  ctx.closePath();
  ctx.fill();

  // Boulder 3: Small Front Companion Pebble
  ctx.fillStyle = '#475569';
  ctx.beginPath();
  ctx.ellipse(sx + 6, sy + 10, 6, 4, 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = '#94a3b8';
  ctx.beginPath();
  ctx.ellipse(sx + 5, sy + 9, 3, 2, 0.2, 0, Math.PI * 2);
  ctx.fill();

  // Tiny emerald moss and lichen accents at boulder bases
  ctx.fillStyle = '#10b981';
  ctx.beginPath();
  ctx.arc(sx - 8, sy + 8, 2.5, 0, Math.PI * 2);
  ctx.arc(sx + 12, sy + 7, 3, 0, Math.PI * 2);
  ctx.arc(sx + 1, sy + 8, 2, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#34d399';
  ctx.beginPath();
  ctx.arc(sx - 8, sy + 7.5, 1.2, 0, Math.PI * 2);
  ctx.arc(sx + 12, sy + 6.5, 1.4, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * Complete standalone vector rendering for Topiary Shrubbery Bush.
 */
export function renderShrubberyBush(
  ctx: CanvasRenderingContext2D,
  sx: number,
  sy: number,
) {
  const planterW = 32;
  const planterH = 16;
  const planterX = sx - planterW / 2;
  const planterY = sy + 1;

  // Planter Box Cedar Body
  const cedarGrad = ctx.createLinearGradient(planterX, planterY, planterX, planterY + planterH);
  cedarGrad.addColorStop(0, '#92400e');
  cedarGrad.addColorStop(0.5, '#78350f');
  cedarGrad.addColorStop(1, '#5c2b09');
  ctx.fillStyle = cedarGrad;
  ctx.beginPath();
  ctx.roundRect(planterX, planterY, planterW, planterH, 3);
  ctx.fill();
  ctx.strokeStyle = '#b45309';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Horizontal Cedar Slats
  ctx.strokeStyle = 'rgba(254, 240, 138, 0.2)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(planterX + 3, planterY + 6);
  ctx.lineTo(planterX + planterW - 3, planterY + 6);
  ctx.moveTo(planterX + 3, planterY + 11);
  ctx.lineTo(planterX + planterW - 3, planterY + 11);
  ctx.stroke();

  // Polished Brass Corner Brackets & Screws
  ctx.fillStyle = '#f59e0b';
  ctx.fillRect(planterX, planterY, 6, 4);
  ctx.fillRect(planterX, planterY, 4, 6);
  ctx.fillRect(planterX + planterW - 6, planterY, 6, 4);
  ctx.fillRect(planterX + planterW - 4, planterY, 4, 6);
  ctx.fillRect(planterX, planterY + planterH - 4, 6, 4);
  ctx.fillRect(planterX + planterW - 6, planterY + planterH - 4, 6, 4);

  // Brass rivets
  ctx.fillStyle = '#fef08a';
  ctx.beginPath();
  ctx.arc(planterX + 2.5, planterY + 2.5, 1.2, 0, Math.PI * 2);
  ctx.arc(planterX + planterW - 2.5, planterY + 2.5, 1.2, 0, Math.PI * 2);
  ctx.fill();

  // Dark rich potting soil rim
  ctx.fillStyle = '#3b1802';
  ctx.beginPath();
  ctx.ellipse(sx, planterY, planterW / 2 - 2, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  // Lush, spherical manicured Japanese boxwood shrub
  ctx.fillStyle = '#064e3b';
  ctx.beginPath();
  ctx.arc(sx, sy - 11, 18, 0, Math.PI * 2);
  ctx.fill();

  // Rich emerald midtone foliage pads
  ctx.fillStyle = '#047857';
  ctx.beginPath();
  ctx.arc(sx - 5, sy - 14, 13, 0, Math.PI * 2);
  ctx.arc(sx + 6, sy - 13, 12, 0, Math.PI * 2);
  ctx.arc(sx, sy - 8, 14, 0, Math.PI * 2);
  ctx.fill();

  // Vibrant sunlit top foliage highlights
  ctx.fillStyle = '#10b981';
  ctx.beginPath();
  ctx.arc(sx - 3, sy - 18, 9, 0, Math.PI * 2);
  ctx.arc(sx + 4, sy - 17, 8, 0, Math.PI * 2);
  ctx.arc(sx - 6, sy - 12, 7, 0, Math.PI * 2);
  ctx.fill();

  // Crisp lime leaf crest tips
  ctx.fillStyle = '#34d399';
  ctx.beginPath();
  ctx.arc(sx - 2, sy - 20, 5, 0, Math.PI * 2);
  ctx.arc(sx + 3, sy - 19, 4.5, 0, Math.PI * 2);
  ctx.fill();

  // Tiny delicate blossom flecks
  const blossomFlecks = [
    {x: sx - 8, y: sy - 15, col: '#fbcfe8'},
    {x: sx + 7, y: sy - 16, col: '#fbcfe8'},
    {x: sx + 2, y: sy - 10, col: '#ffffff'},
    {x: sx - 5, y: sy - 8, col: '#fbcfe8'},
    {x: sx + 8, y: sy - 8, col: '#ffffff'},
  ];

  blossomFlecks.forEach((b) => {
    ctx.fillStyle = b.col;
    ctx.beginPath();
    ctx.arc(b.x, b.y, 1.5, 0, Math.PI * 2);
    ctx.fill();
  });
}

/**
 * Complete standalone vector rendering for Flame-shaped Woven Wooden Lattice Wall.
 */
export function renderWovenWall(
  ctx: CanvasRenderingContext2D,
  sx: number,
  sy: number,
) {
  const fenceW = 40;
  const baseY = sy + 13;
  const startX = sx - fenceW / 2;

  // Ground base shadow curved along flame footprint
  ctx.fillStyle = 'rgba(0, 0, 0, 0.38)';
  ctx.beginPath();
  ctx.ellipse(sx, baseY + 2, 20, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  // 5 Upward-curving tapered Cedar Bamboo flame-crest vertical posts (Outer posts at sx - 18, sx + 18)
  const flamePosts = [
    {offX: -18, topY: sy - 11, lean: -1.2, cedarCol: '#78350f'}, // Left outer upright
    {offX: -9,  topY: sy - 25, lean: -0.9, cedarCol: '#92400e'}, // Primary Tall Flame Crest
    {offX: 0,   topY: sy - 18, lean: 0.6,  cedarCol: '#b45309'},
    {offX: 9,   topY: sy - 23, lean: 1.2,  cedarCol: '#92400e'}, // Secondary Flame Crest
    {offX: 18,  topY: sy - 12, lean: 1.2,  cedarCol: '#78350f'}, // Right outer upright
  ];

  // Render flame vertical posts
  flamePosts.forEach((p) => {
    const postBaseX = sx + p.offX;
    const postTopX = postBaseX + p.lean;

    // Dark cedar post core shadow
    ctx.strokeStyle = '#3b1802';
    ctx.lineWidth = 3.8;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(postBaseX, baseY);
    ctx.quadraticCurveTo(postBaseX + p.lean * 0.4, (baseY + p.topY) * 0.5, postTopX, p.topY);
    ctx.stroke();

    // Post Body with warm Japanese cedar tones
    ctx.strokeStyle = p.cedarCol;
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.moveTo(postBaseX, baseY);
    ctx.quadraticCurveTo(postBaseX + p.lean * 0.4, (baseY + p.topY) * 0.5, postTopX, p.topY);
    ctx.stroke();

    // Bamboo joints / node rings on posts
    const nodeCount = 3;
    for (let n = 1; n <= nodeCount; n++) {
      const nt = n / (nodeCount + 1);
      const nx = postBaseX + p.lean * nt;
      const ny = baseY + (p.topY - baseY) * nt;
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.ellipse(nx, ny, 2.0, 1.1, 0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#451a03';
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }

    // Tapered flame-tip post peak with brass cap
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.ellipse(postTopX, p.topY - 1, 1.8, 1.2, 0.3, 0, Math.PI * 2);
    ctx.fill();
  });

  // Sculptural Sweeping Flame-Crest Top Rails (Upper, Mid, Lower Arches)
  ctx.strokeStyle = '#451a03';
  ctx.lineWidth = 2.8;
  ctx.beginPath();
  ctx.moveTo(sx - 18, sy - 9);
  ctx.bezierCurveTo(sx - 12, sy - 26, sx - 5, sy - 23, sx + 2, sy - 16);
  ctx.bezierCurveTo(sx + 7, sy - 24, sx + 13, sy - 22, sx + 18, sy - 10);
  ctx.stroke();

  ctx.strokeStyle = '#d97706';
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.moveTo(sx - 18, sy - 10);
  ctx.bezierCurveTo(sx - 12, sy - 27, sx - 5, sy - 24, sx + 2, sy - 17);
  ctx.bezierCurveTo(sx + 7, sy - 25, sx + 13, sy - 23, sx + 18, sy - 11);
  ctx.stroke();

  // Mid Rail
  ctx.strokeStyle = '#78350f';
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.moveTo(sx - 18, sy - 1);
  ctx.bezierCurveTo(sx - 9, sy - 10, sx + 9, sy - 8, sx + 18, sy - 2);
  ctx.stroke();

  // Lower Base Rail
  ctx.strokeStyle = '#92400e';
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(sx - 18, sy + 7);
  ctx.bezierCurveTo(sx - 7, sy + 3, sx + 7, sy + 3, sx + 18, sy + 7);
  ctx.stroke();

  // Interwoven Diagonal Bamboo Flame Lattice Weave (STRICTLY CLIPPED WITHIN OUTER POSTS)
  ctx.save();
  ctx.beginPath();
  ctx.rect(sx - 18, sy - 28, 36, baseY - (sy - 28) + 1);
  ctx.clip();

  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 1.2;
  for (let i = -1; i <= 6; i++) {
    const xStart = startX + i * 6.5;
    ctx.beginPath();
    ctx.moveTo(xStart, baseY - 2);
    ctx.lineTo(xStart + 12, sy - 20 + Math.abs(i - 2) * 2.2);
    ctx.stroke();
  }

  ctx.strokeStyle = '#d97706';
  ctx.lineWidth = 1.2;
  for (let i = 0; i <= 7; i++) {
    const xStart = startX + i * 6.5;
    ctx.beginPath();
    ctx.moveTo(xStart, baseY - 2);
    ctx.lineTo(xStart - 12, sy - 20 + Math.abs(i - 4) * 2.2);
    ctx.stroke();
  }
  ctx.restore();

  // Traditional dark twine knots & brass fasteners on posts
  flamePosts.forEach((p) => {
    const postBaseX = sx + p.offX;
    const heights = [sy + 7, sy - 4, (sy + p.topY) * 0.5];

    heights.forEach((hY) => {
      if (hY > p.topY + 3 && hY < baseY) {
        ctx.strokeStyle = '#1e1b4b';
        ctx.lineWidth = 1.1;
        ctx.beginPath();
        ctx.moveTo(postBaseX - 2.0, hY - 2.0);
        ctx.lineTo(postBaseX + 2.0, hY + 2.0);
        ctx.moveTo(postBaseX + 2.0, hY - 2.0);
        ctx.lineTo(postBaseX - 2.0, hY + 2.0);
        ctx.stroke();

        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(postBaseX, hY, 0.9, 0, Math.PI * 2);
        ctx.fill();
      }
    });
  });

  // Emerald moss cushions at post bases
  flamePosts.forEach((p, idx) => {
    const postBaseX = sx + p.offX;
    ctx.fillStyle = idx % 2 === 0 ? '#10b981' : '#059669';
    ctx.beginPath();
    ctx.arc(postBaseX, baseY + 1, 2.0, 0, Math.PI * 2);
    ctx.fill();
  });
}


export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stepperRef = useRef<ReturnType<typeof createFixedStepper>>();

  // Mobile detection
  const isMobile = useIsMobile();

  // --- Game Lifecycle State ---
  const [gameState, setGameState] = useState<GameState>({
    status: 'START',
    score: 0,
    level: 1,
  });

  const gameStateRef = useRef(gameState);
  gameStateRef.current = gameState;

  // --- PLAYGROUND SDK INTEGRATION ---
  const {sdk} = usePlayground();
  usePlaygroundGameLifecycle(gameState, sdk);

  const canvasWidth = (getConfig('baseCanvasWidth') as number) || 1280;
  const canvasHeight = (getConfig('baseCanvasHeight') as number) || 720;

  if (!stepperRef.current) {
    const stepMs = (getConfig('stepMs') as number) || 1000 / 60;
    const maxSubSteps = (getConfig('maxSubSteps') as number) || 5;
    stepperRef.current = createFixedStepper(stepMs, maxSubSteps);
  }

  // Global Menus & UI Modals
  const [isGameMenuOpen, setIsGameMenuOpen] = useState(false);
  const [isHowToPlayOpen, setIsHowToPlayOpen] = useState(false);
  const [guidebookChapter, setGuidebookChapter] = useState<number>(1);
  const [isUnifiedStorageOpen, setIsUnifiedStorageOpen] = useState(false);
  const [isPlantingModalOpen, setIsPlantingModalOpen] = useState(false);
  const [storageTab, setStorageTab] = useState<'PLANTING' | 'MATERIALS' | 'EQUIPMENT' | 'DECOR'>('PLANTING');
  const [stylingModalSapling, setStylingModalSapling] = useState<StoredSapling | SeedlingItem | any | null>(null);
  const [isWorkbenchModalOpen, setIsWorkbenchModalOpen] = useState(false);
  const [workbenchTab, setWorkbenchTab] = useState<WorkbenchCategory>('resources');
  const [isZenSkillsModalOpen, setIsZenSkillsModalOpen] = useState(false);
  const [isShopModalOpen, setIsShopModalOpen] = useState(false);
  const [isBiomeSelectOpen, setIsBiomeSelectOpen] = useState(false);
  const [garageTab, setGarageTab] = useState<'expeditions' | 'loadout'>('expeditions');
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [shopTab, setShopTab] = useState<'MAPS' | 'EXPANSIONS' | 'DECOR' | 'GUIDES' | 'EQUIPMENT'>('MAPS');
  const [excursionReport, setExcursionReport] = useState<ExcursionReportData | null>(null);
  const [excavationResult, setExcavationResult] = useState<ExcavationResultData | null>(null);
  const [inspectingBonsaiId, setInspectingBonsaiId] = useState<string | null>(null);
  const [inspectingStructureId, setInspectingStructureId] = useState<string | null>(null);
  const [quickRadialBonsai, setQuickRadialBonsai] = useState<PlantedBonsai | null>(null);
  const [focusedMenuIdx, setFocusedMenuIdx] = useState<number>(0);
  const [titleMenuIdx, setTitleMenuIdx] = useState<number>(0);
  const [focusedShopIdx, setFocusedShopIdx] = useState<number>(0);
  const [focusedWbIdx, setFocusedWbIdx] = useState<number>(0);
  const [focusedGarageIdx, setFocusedGarageIdx] = useState<number>(0);
  const [isMusicMuted, setIsMusicMuted] = useState(false);
  const [isSfxMuted, setIsSfxMuted] = useState(false);
  const [, setHudTick] = useState(0);
  const refreshHud = useCallback(() => setHudTick((t) => t + 1), []);

  // Fullscreen state and lock (with graceful pseudo-fullscreen fallback for sandboxed iframes)
  const [isFullscreen, setIsFullscreen] = useState(false);
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement || document.body.classList.contains('pseudo-fullscreen')));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement && !document.body.classList.contains('pseudo-fullscreen')) {
        let nativeSucceeded = false;
        if (document.documentElement.requestFullscreen) {
          try {
            await document.documentElement.requestFullscreen().catch(() => {});
            nativeSucceeded = Boolean(document.fullscreenElement);
          } catch {
            // Native fullscreen blocked by iframe sandbox policy
          }
        }
        if (!nativeSucceeded) {
          document.body.classList.add('pseudo-fullscreen');
        }
        if ((navigator as any).keyboard?.lock) {
          try {
            await (navigator as any).keyboard.lock(['Escape']);
          } catch (_) {}
        }
      } else {
        if (document.fullscreenElement && document.exitFullscreen) {
          await document.exitFullscreen().catch(() => {});
        }
        document.body.classList.remove('pseudo-fullscreen');
      }
    } catch (err) {
      document.body.classList.toggle('pseudo-fullscreen');
    }
    setIsFullscreen(Boolean(document.fullscreenElement || document.body.classList.contains('pseudo-fullscreen')));
  }, []);

  // Real-time grid placement preview state
  const [placementPreview, setPlacementPreview] = useState<GridPlacementPreview | null>(null);
  const placementPreviewRef = useRef<GridPlacementPreview | null>(null);
  placementPreviewRef.current = placementPreview;
  const lastPreviewPlotKeyRef = useRef<string>('');

  const togglePreviewOrientation = useCallback(() => {
    setPlacementPreview((prev) => {
      if (!prev) return null;
      const nextOrientation = prev.orientation === 'horizontal' ? 'vertical' : 'horizontal';
      return {
        ...prev,
        orientation: nextOrientation,
        width: nextOrientation === 'horizontal' ? 3 : 1,
        height: nextOrientation === 'horizontal' ? 1 : 3,
      };
    });
    gameAudio.playCrispClick();
  }, []);

  const handleStartPlacementPreview = useCallback((preview: GridPlacementPreview) => {
    setPlacementPreview(preview);
    setIsPlantingModalOpen(false);
    setIsUnifiedStorageOpen(false);
    gameAudio.playCrispClick();
  }, []);

  // Title Screen Keyboard and Menu Navigation
  useEffect(() => {
    if (gameState.status !== 'START') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        setTitleMenuIdx((i) => Math.max(0, i - 1));
        gameAudio.playHoverMicroTone();
      } else if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        setTitleMenuIdx((i) => Math.min(2, i + 1));
        gameAudio.playHoverMicroTone();
      } else if (e.key === 'e' || e.key === 'E' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (titleMenuIdx === 0) {
          setGameState((prev) => ({...prev, status: 'PLAYING'}));
          gameAudio.playPowerupChime();
          if (sdk) sdk.startGame();
        } else if (titleMenuIdx === 1) {
          setIsHowToPlayOpen(true);
          gameAudio.playCrispClick();
        } else if (titleMenuIdx === 2) {
          setIsGameMenuOpen(true);
          gameAudio.playCrispClick();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState.status, titleMenuIdx, sdk]);

  // Global pure scrolling handler for Arrow keys across all scrollable containers
  useEffect(() => {
    const handleGlobalArrows = (e: KeyboardEvent) => {
      if (placementPreviewRef.current) {
        // Yield arrow keys entirely to the authoritative placement preview handler
        return;
      }
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault();
        const dy = e.key === 'ArrowUp' ? -65 : e.key === 'ArrowDown' ? 65 : 0;
        const dx = e.key === 'ArrowLeft' ? -65 : e.key === 'ArrowRight' ? 65 : 0;
        const candidates = Array.from(
          document.querySelectorAll<HTMLElement>(
            '.overflow-y-auto, .overflow-x-auto, [data-scrollable="true"]',
          ),
        );
        for (let i = candidates.length - 1; i >= 0; i--) {
          const el = candidates[i];
          if (el && (el.offsetParent !== null || window.getComputedStyle(el).display !== 'none')) {
            const canScrollY = el.scrollHeight > el.clientHeight + 4;
            const canScrollX = el.scrollWidth > el.clientWidth + 4;
            if (dy !== 0 && canScrollY) {
              el.scrollTop += dy;
              return;
            }
            if (dx !== 0 && canScrollX) {
              el.scrollLeft += dx;
              return;
            }
          }
        }
      }
    };
    window.addEventListener('keydown', handleGlobalArrows);
    return () => window.removeEventListener('keydown', handleGlobalArrows);
  }, []);

  // Live animated progress update for Workbench Modal while open
  const [, setWorkbenchTick] = useState(0);
  useEffect(() => {
    if (!isWorkbenchModalOpen) return;
    const interval = setInterval(() => {
      setWorkbenchTick((t) => t + 1);
    }, 50);
    return () => clearInterval(interval);
  }, [isWorkbenchModalOpen]);

  // Active Location & Active Biome
  const locationRef = useRef<GameLocation>('SANCTUARY');
  const [location, setLocation] = useState<GameLocation>('SANCTUARY');
  locationRef.current = location;

  const [activeBiomeId, setActiveBiomeId] = useState<ExpeditionBiomeId>('FOOTHILLS');
  const activeBiomeIdRef = useRef<ExpeditionBiomeId>('FOOTHILLS');
  activeBiomeIdRef.current = activeBiomeId;

  // Active expedition seed for procedural world variation
  const worldSeedRef = useRef<number>(1337);
  const hasAutoplayed = useRef(false);

  // --- Gamepad / Controller API Support ---
  const [connectedGamepadName, setConnectedGamepadName] = useState<string | null>(null);
  const lastGamepadButtonsRef = useRef<boolean[]>([]);

  // Input Hook
  const inputRef = useInput(canvasRef, true, {
    width: canvasWidth,
    height: canvasHeight,
  });

  // Assets Preloading
  const ASSETS_MANIFEST: Record<string, string> = useMemo(
    () => ({
      nursery_bg: 'assets/nursery_greenhouse_bg.png',
      excursion_bg: 'assets/excursion_forest_bg.png',
      rover_vehicle: 'assets/images/expedition_rover_vehicle.png',
      circuit_board: 'assets/images/circuit_board_resource.png',
      electronic_chip: 'assets/images/electronic_chip_resource.png',
      botanical_shop: 'assets/images/botanical_market_shop.png',
      zen_library_shrine: 'assets/images/zen_library_shrine.png',
      station_zen_library: 'assets/images/station_zen_library.png',
      station_bonsai_society: 'assets/images/station_bonsai_society.png',
      rover_garage: 'assets/images/rover_garage_departure.png',
      basecamp_hub: 'assets/images/expedition_basecamp_hub.png',
      map_item: 'assets/images/expedition_map_item.png',
      compost_guide: 'assets/images/compost_guide_book.png',
      auto_fabricator_guide: 'assets/images/auto_fabricator_guide_book.png',
      irrigation_tier1_guide: 'assets/images/irrigation_tier1_guide_book.png',
      automaton_guide: 'assets/images/automaton_guide_book.png',
      workbench_tier2_guide: 'assets/images/workbench_tier2_guide_book.png',
      workbench_tier3_guide: 'assets/images/workbench_tier3_guide_book.png',
      auto_crafter_unit: 'assets/images/auto_crafter_unit.png',
      organic_compost: 'assets/images/organic_compost_item.png',
      organic_waste: 'assets/images/organic_waste_resource.png',
      crafting_automaton: 'assets/images/crafting_automaton_unit.png',
      decor_pebble_path: 'assets/images/decor_pebble_path.png',
      decor_rock_formation: 'assets/images/decor_rock_formation.png',
      decor_shrubbery_bush: 'assets/images/decor_shrubbery_bush.png',
      decor_woven_wall: 'assets/images/decor_woven_wall.png',
      tool_compost_heap: 'assets/images/tool_compost_heap.png',
      tool_garden_well: 'assets/images/tool_garden_well.png',
      scrap_metal_double_resource: ASSET_DOUBLE_RESOURCES.scrap_metal_double_resource.path,
      copper_wire_double_resource: ASSET_DOUBLE_RESOURCES.copper_wire_double_resource.path,
    }),
    [],
  );
  const {assets, isReady: assetsReady} = useAssets(ASSETS_MANIFEST);

  // --- Core Game Ref Simulation Data ---
  const plantedBonsaisRef = useRef<PlantedBonsai[]>([]);
  const deployedStructuresRef = useRef<DeployedStructure[]>([]);
  const storedPottedBonsaisRef = useRef<StoredPottedBonsai[]>([]);
  const storedSaplingsRef = useRef<StoredSapling[]>([]);

  // Modular Workbench Loadout State
  const installedCraftingArmsRef = useRef<number>(0);
  const autoFabricatorLanesRef = useRef<AutoFabricatorLane[]>([]);

  // Permanent Sanctuary Storage (with Coins Currency, Purchased Maps, Expansions, Organic Waste & Composting)
  const sanctuaryInventoryRef = useRef<SanctuaryInventory>({
    coins: 50,
    player_level: 1,
    player_exp: 0,
    scrap_metal: 0,
    copper_wire: 0,
    brass_gears: 0,
    circuit_boards: 0,
    electronic_chips: 0,
    organic_waste: 0,
    organic_compost: 0,
    seedlingList: [],
    storedBonsais: [],
    scrapMetal: 0,
    copperWire: 0,
    gears: 0,
    microcircuits: 0,
    chips: 0,
    quantumChips: 0,
    organicWaste: 0,
    enrichedCompost: 0,
    has_compost_guide: false,
    has_tier1_guide: false,
    has_tier2_guide: false,
    has_tier3_guide: false,
    has_auto_fabricator_guide: false,
    has_workbench_t2_guide: false,
    has_workbench_t3_guide: false,
    workbench_tier: 1,
    crafting_automatons_inv: 0,
    auto_fabricators_inv: 0,
    solar_panels_inv: 0,
    solar_panel_inv: 0,
    solarPanels: 0,
    wind_turbines_inv: 0,
    wind_turbine_inv: 0,
    windTurbines: 0,
    decor_pebble_path_inv: 0,
    decor_rock_formation_inv: 0,
    decor_shrubbery_bush_inv: 0,
    decor_woven_wall_inv: 0,
    torii_gate_inv: 0,
    crystal_pedestal_foliage_inv: 0,
    crystal_pedestal_branches_inv: 0,
    crystal_pedestal_trunk_inv: 0,
    crystal_pedestal_roots_inv: 0,
    decorations: {
      pebblePath: 0,
      rockFormation: 0,
      shrubbery: 0,
      wovenWall: 0,
      toriiGate: 0,
    },
    tool_compost_heap_inv: 0,
    tool_garden_well_inv: 0,
    tools: {
      compostHeap: 0,
      gardenWell: 0,
    },
    rover_storage_tier: 0,
    rover_battery_tier: 0,
    zen_essence: 0,
    automatons_tier1: 0,
    automatons_tier2: 0,
    automatons_tier3: 0,
    rover_battery_level: 0,
    rover_cargo_level: 0,
    sanctuary_expansion_tier: 0, // Starter: 12 plots unlocked
    has_map_highlands: false,
    has_map_overgrowth: false,
    has_rover_t2_blueprint: false,
    has_rover_t3_blueprint: false,
    has_storage_module_1_guide: false,
    has_storage_module_2_guide: false,
    has_storage_module_3_guide: false,
    has_battery_module_1_guide: false,
    has_battery_module_2_guide: false,
    has_battery_module_3_guide: false,
    has_radar_module_1_guide: false,
    has_radar_module_2_guide: false,
    has_radar_module_3_guide: false,
    rover_chassis_tier: 1,
    rover_modules: {
      storage_1: 0,
      storage_2: 0,
      storage_3: 0,
      battery_1: 0,
      battery_2: 0,
      battery_3: 0,
      radar_1: 0,
      radar_2: 0,
      radar_3: 0,
    },
    roverModules: {
      storage_1: 0,
      storage_2: 0,
      storage_3: 0,
      battery_1: 0,
      battery_2: 0,
      battery_3: 0,
      radar_1: 0,
      radar_2: 0,
      radar_3: 0,
    },
    attached_rover_modules: [],
    attachedRoverModules: [],
  });

  // Timed Workbench Crafting State
  const activeCraftingRef = useRef<CraftingQueueItem | null>(null);
  const craftingQueueRef = useRef<CraftingQueueItem[]>([]);

  // Area Exploration Discovery Codex State (Fog-of-War per Biome Area)
  const areaDiscoveryRef = useRef<AreaDiscoveryState>({
    species: { FOOTHILLS: [], HIGHLANDS: [], OVERGROWTH: [] },
    maturities: { FOOTHILLS: [], HIGHLANDS: [], OVERGROWTH: [] },
    resources: { FOOTHILLS: [], HIGHLANDS: [], OVERGROWTH: [] },
  });

  // Bondex Botanical Field Compendium Discovery Tracking
  const bondexDiscoveryRef = useRef<
    Record<
      string,
      {
        discovered: boolean;
        highestMaturity?: MaturityTier;
        stylesRaised: BonsaiStyle[];
      }
    >
  >({});

  const recordBondexEntry = useCallback(
    (leafType: BonsaiLeafType, maturity?: MaturityTier, style?: BonsaiStyle) => {
      const current = bondexDiscoveryRef.current[leafType] || {
        discovered: false,
        stylesRaised: [],
      };
      current.discovered = true;

      if (maturity) {
        const matRanks: Record<MaturityTier, number> = {
          sprout: 1,
          sapling: 2,
          notable: 3,
          refined: 4,
          premium: 5,
        };
        const currentRank = current.highestMaturity
          ? matRanks[current.highestMaturity] || 1
          : 0;
        const newRank = matRanks[maturity] || 1;
        if (newRank >= currentRank) {
          current.highestMaturity = maturity;
        }
      }

      if (style && !current.stylesRaised.includes(style)) {
        current.stylesRaised.push(style);
      }

      bondexDiscoveryRef.current[leafType] = current;
    },
    [],
  );

  const revealAreaSpecies = useCallback(
    (areaId: ExpeditionBiomeId, leafType: BonsaiLeafType, maturity?: MaturityTier) => {
      const disc = areaDiscoveryRef.current;
      if (!disc.species[areaId].includes(leafType)) {
        disc.species[areaId].push(leafType);
      }
      if (maturity && !disc.maturities[areaId].includes(maturity)) {
        disc.maturities[areaId].push(maturity);
      }
      recordBondexEntry(leafType, maturity);
      refreshHud();
    },
    [recordBondexEntry, refreshHud],
  );

  // Synchronize any existing species in planted, stored, or area discovery into bondexDiscoveryRef
  useEffect(() => {
    plantedBonsaisRef.current.forEach((b) => {
      recordBondexEntry(b.leafType, b.maturity, b.style);
    });
    storedPottedBonsaisRef.current.forEach((b) => {
      recordBondexEntry(b.leafType, b.maturity, b.style);
    });
    // Note: Do not pre-discover unplanted starter seeds in inventory until actually planted or excavated!
    Object.values(areaDiscoveryRef.current.species).forEach((arr) => {
      arr.forEach((lt) => recordBondexEntry(lt));
    });
  }, [recordBondexEntry]);

  // Excursion Backpack
  const backpackInventoryRef = useRef<ExcursionBackpack>({
    scrap_metal: 0,
    copper_wire: 0,
    brass_gears: 0,
    circuit_boards: 0,
    electronic_chips: 0,
    saplings: [],
  });

  // Zen Skill Tree State
  const zenSkillsRef = useRef<ZenSkills>({
    steady_hands: 0,
    carefulTrowel: 0,
    broadSpade: 0,
    greenThumb: 0,
    hydrodynamics: 0,
    botanicalForaging: 0,
    resourceProspecting: 0,
    botanicalDowsing: 0,
    perpetuum_mobile: 0,
  });

  // Zen Milestones & Stats State
  const statsRef = useRef<GameStats>({
    leafTypeStylesGrown: {},
    groupBonsaisGrown: {
      Raundo: 0,
      Erementaru: 0,
      'Roku-men': 0,
      Seikatsu: 0,
      Sanmen: 0,
      Shihen: 0,
      'Jinkō-teki': 0,
    },
    firstLevel100Reached: false,
    expeditionsPerBiome: {
      FOOTHILLS: 0,
      HIGHLANDS: 0,
      OVERGROWTH: 0,
    },
    claimedAchievements: [],
    totalLevelUps: 0,
    maxSpecimensGrownLv10: [],
    maxSpecimensGrownLv25: [],
    maxSpecimensGrownLv50: [],
    sproutLv10Ids: [],
    saplingLv15Ids: [],
    notableLv20Ids: [],
    refinedLv25Ids: [],
    premiumLv30Ids: [],
  });

  // Walkable Botanist Avatar in Sanctuary
  const avatarRef = useRef({
    x: 640,
    y: 220,
    vx: 0,
    vy: 0,
    radius: 18,
    facing: 'down' as 'up' | 'down' | 'left' | 'right',
    stepSoundTimer: 0,
    isMoving: false,
    walkFrame: 0,
  });

  // Stored Sanctuary Avatar Position across Expeditions
  const sanctuaryPlayerPosRef = useRef({
    x: 640,
    y: 220,
  });

  // --- EXCURSION ROVER & CAMERA STATE ---
  const roverRef = useRef({
    tileX: 0,
    tileY: 0,
    visualX: EXCURSION_TILE_SIZE / 2,
    visualY: EXCURSION_TILE_SIZE / 2,
    facing: 'up' as 'up' | 'down' | 'left' | 'right',
    facingDirection: 1 as 1 | -1, // 1 = right, -1 = left
    rotation: 0,
    batteryKwh: 50,
    maxBatteryKwh: 50,
    isMovingAnim: false,
    moveCooldown: 0,
    maxDistanceReached: 0,
  });

  const cameraRef = useRef({
    x: EXCURSION_TILE_SIZE / 2 - canvasWidth / 2,
    y: EXCURSION_TILE_SIZE / 2 - canvasHeight / 2,
  });

  const sanctuaryCameraRef = useRef({
    y: 0,
  });

  // --- 5 HORIZONTALLY SPACED PROMENADE SANCTUARY STATIONS (BALANCED & SYMMETRICAL) ---
  // Station 1 (Far Left): Zen Library
  const sanctuaryZenLibrary = useMemo(
    () => ({
      x: 105,
      y: 88,
      width: 150,
      height: 105,
    }),
    [],
  );

  // Station 2 (Mid Left): Artisan Workbench
  const sanctuaryWorkbench = useMemo(
    () => ({
      x: 335,
      y: 88,
      width: 150,
      height: 105,
    }),
    [],
  );

  // Station 3 (Dead Center): Bonsai Society
  const sanctuaryBonsaiSociety = useMemo(
    () => ({
      x: 565,
      y: 88,
      width: 150,
      height: 105,
    }),
    [],
  );

  // Station 4 (Mid Right): Rover Garage Bay
  const sanctuaryRoverGarage = useMemo(
    () => ({
      x: 795,
      y: 88,
      width: 150,
      height: 105,
    }),
    [],
  );

  // Station 5 (Far Right): Botanical Market
  const sanctuaryShopStand = useMemo(
    () => ({
      x: 1025,
      y: 88,
      width: 150,
      height: 105,
    }),
    [],
  );

  // Excursion World Grid Nodes
  const excursionNodesRef = useRef<Map<string, ExcursionTileNode>>(new Map());

  // Fog of War in Expedition Sector
  const exploredTilesRef = useRef<Set<string>>(new Set());

  // Compute Dynamic Vision Radius from Attached Radar Modules (Base 2 + sum of attached radar bonuses)
  const getRoverVisionRadius = useCallback(() => {
    const attached = sanctuaryInventoryRef.current.attached_rover_modules || [];
    const radarBonus = attached.reduce((acc, modType) => {
      const cfg = ROVER_MODULE_CONFIGS[modType];
      return acc + (cfg?.category === 'radar' ? cfg.bonusValue : 0);
    }, 0);
    return 2 + radarBonus;
  }, []);

  const revealFogAroundRover = useCallback((tileX: number, tileY: number) => {
    const sensorRadius = getRoverVisionRadius();
    const rCeil = Math.ceil(sensorRadius);
    const set = exploredTilesRef.current;
    for (let dx = -rCeil; dx <= rCeil; dx++) {
      for (let dy = -rCeil; dy <= rCeil; dy++) {
        if (Math.hypot(dx, dy) <= sensorRadius) {
          set.add(`${tileX + dx},${tileY + dy}`);
        }
      }
    }
  }, [getRoverVisionRadius]);

  // Radial Shovel Dig Minigame State
  const digStateRef = useRef<RadialDigState>({
    active: false,
    nodeId: '',
    tileX: 0,
    tileY: 0,
    saplingName: '',
    leafType: 'circle',
    group: 'Raundo',
    maturity: 'sprout',
    species: 'circle',
    rarity: 'COMMON',
    needleAngle: 0,
    angularVelocity: 3.2,
    sectors: [],
    requiredHits: 2,
    currentHits: 0,
    strikesUsed: 0,
    maxStrikes: 2,
    isGated: false,
    wobbleTimer: 0,
    status: 'DIGGING',
    spawnChance: 1.0,
    speciesChance: 0.5,
    arcDeg: 37.5,
  });

  // Daylight Cycle & Turbines
  const daylightCycleRef = useRef<number>(0.3);
  const turbineAngleRef = useRef<number>(0);

  // Floating text feedback
  const floatingTextsRef = useRef<FloatingText[]>([]);

  // Pre-allocated Particle Pool (Smooth lightweight 50-particle budget, zero GC allocations)
  const MAX_PARTICLES = 50;
  const particlePoolRef = useRef<Particle[]>(
    Array.from({length: MAX_PARTICLES}, () => ({
      active: false,
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      size: 2,
      color: '#ffffff',
      alpha: 0,
      life: 0,
      maxLife: 1,
    })),
  );

  const emitParticle = useCallback(
    (
      x: number,
      y: number,
      vx: number,
      vy: number,
      size: number,
      color: string,
      maxLife: number,
    ) => {
      const pool = particlePoolRef.current;
      for (let i = 0; i < pool.length; i++) {
        const p = pool[i];
        if (!p.active) {
          p.active = true;
          p.x = x;
          p.y = y;
          p.vx = vx;
          p.vy = vy;
          p.size = size;
          p.color = color;
          p.alpha = 1;
          p.life = 0;
          p.maxLife = maxLife;
          return;
        }
      }
      // If pool is full, recycle the oldest particle
      let oldestIdx = 0;
      let maxRatio = -1;
      for (let i = 0; i < pool.length; i++) {
        const ratio = pool[i].life / pool[i].maxLife;
        if (ratio > maxRatio) {
          maxRatio = ratio;
          oldestIdx = i;
        }
      }
      const p = pool[oldestIdx];
      p.active = true;
      p.x = x;
      p.y = y;
      p.vx = vx;
      p.vy = vy;
      p.size = size;
      p.color = color;
      p.alpha = 1;
      p.life = 0;
      p.maxLife = maxLife;
    },
    [],
  );

  // Synergy & Halo Calculation Caching (Invalidated only on grid mutation)
  const synergiesCacheRef = useRef<Map<string, BonsaiSynergies>>(new Map());

  const invalidateSynergiesCache = useCallback(() => {
    synergiesCacheRef.current.clear();
  }, []);

  const getCachedBonsaiSynergies = useCallback((bonsai: PlantedBonsai): BonsaiSynergies => {
    let cached = synergiesCacheRef.current.get(bonsai.id);
    if (!cached) {
      cached = getBonsaiSynergies(bonsai, plantedBonsaisRef.current, deployedStructuresRef.current);
      synergiesCacheRef.current.set(bonsai.id, cached);
    }
    return cached;
  }, []);

  // Offscreen Canvas Caching for Static Terrain & Promenade Pebbles
  const offscreenTerrainCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const offscreenTerrainDirtyRef = useRef<boolean>(true);

  // Proximity indicators for HUD
  const [nearbyBonsai, setNearbyBonsai] = useState<PlantedBonsai | null>(null);
  const [nearbyStructure, setNearbyStructure] = useState<DeployedStructure | null>(null);
  const [isNearWorkbench, setIsNearWorkbench] = useState(false);
  const [isNearZenLibrary, setIsNearZenLibrary] = useState(false);
  const [isNearBonsaiSociety, setIsNearBonsaiSociety] = useState(false);
  const [isNearGarage, setIsNearGarage] = useState(false);
  const [isNearShop, setIsNearShop] = useState(false);

  // Stable refs for React state decoupling (prevents 60fps React re-renders)
  const isNearZenLibraryRef = useRef(false);
  const isNearWorkbenchRef = useRef(false);
  const isNearBonsaiSocietyRef = useRef(false);
  const isNearGarageRef = useRef(false);
  const isNearShopRef = useRef(false);
  const nearbyBonsaiIdRef = useRef<string | null>(null);
  const nearbyStructureIdRef = useRef<string | null>(null);
  const lastWellWateringRef = useRef<boolean>(false);
  const lastCompostReadyRef = useRef<boolean>(false);
  const [standingPlot, setStandingPlot] = useState<{
    col: number;
    row: number;
    x: number;
    y: number;
  } | null>(null);
  const [activePlot, setActivePlot] = useState<SanctuaryPlotInfo | null>(null);
  const activePlotRef = useRef<SanctuaryPlotInfo | null>(null);
  const standingPlotKeyRef = useRef<string>('');

  // HUD Notification message with strict auto-dismiss timer
  const [hudMessage, setHudMessage] = useState<{text: string; color: string; time: number} | null>(null);
  const notificationTimeoutRef = useRef<number | null>(null);

  const triggerNotification = useCallback((text: string, color = '#10b981', duration = 3500) => {
    setHudMessage({text, color, time: Date.now()});
    if (notificationTimeoutRef.current) {
      window.clearTimeout(notificationTimeoutRef.current);
    }
    notificationTimeoutRef.current = window.setTimeout(() => {
      setHudMessage(null);
      notificationTimeoutRef.current = null;
    }, duration);
  }, []);

  useEffect(() => {
    return () => {
      if (notificationTimeoutRef.current) {
        window.clearTimeout(notificationTimeoutRef.current);
      }
    };
  }, []);

  // HTML5 Gamepad Connection Detection and Lifecycle
  useEffect(() => {
    const handleGamepadConnected = (e: GamepadEvent) => {
      const name = e.gamepad?.id ? e.gamepad.id.replace(/\s*\([^)]*\)/g, '').trim() || 'Controller' : 'Controller';
      setConnectedGamepadName(name);
      triggerNotification(`🎮 Controller Connected: ${name}`, '#38bdf8', 4000);
      gameAudio.playConfirmSelect();
    };

    const handleGamepadDisconnected = () => {
      setConnectedGamepadName(null);
      triggerNotification('🎮 Controller Disconnected', '#f43f5e', 3500);
      gameAudio.playErrorBuzz();
    };

    // Check if controller is already connected on mount
    if (typeof navigator !== 'undefined' && navigator.getGamepads) {
      const gps = navigator.getGamepads();
      for (let i = 0; i < gps.length; i++) {
        const gp = gps[i];
        if (gp && gp.connected) {
          const name = gp.id ? gp.id.replace(/\s*\([^)]*\)/g, '').trim() || 'Controller' : 'Controller';
          setConnectedGamepadName(name);
          break;
        }
      }
    }

    window.addEventListener('gamepadconnected', handleGamepadConnected);
    window.addEventListener('gamepaddisconnected', handleGamepadDisconnected);
    return () => {
      window.removeEventListener('gamepadconnected', handleGamepadConnected);
      window.removeEventListener('gamepaddisconnected', handleGamepadDisconnected);
    };
  }, [triggerNotification]);

  const addFloatingText = useCallback((x: number, y: number, text: string, color = '#10b981') => {
    floatingTextsRef.current.push({
      id: `ft_${Date.now()}_${Math.random()}`,
      x,
      y,
      text,
      color,
      alpha: 1,
      life: 0,
      maxLife: 1.2,
    });
  }, []);

  // --- PROGRESSIVE PLAYER LEVEL & EXP SYSTEM ---
  const gainPlayerExp = useCallback(
    (amount: number, sourceName?: string) => {
      if (amount <= 0) return;
      const inv = sanctuaryInventoryRef.current;
      inv.player_exp += amount;

      let leveledUp = false;
      let levelsGained = 0;
      while (true) {
        const needed = getExpRequiredForLevel(inv.player_level);
        if (inv.player_exp >= needed) {
          inv.player_exp -= needed;
          inv.player_level += 1;
          const zenGained = 2; // +2 Zen Points per level up!
          inv.zen_essence += zenGained;
          leveledUp = true;
          levelsGained += 1;
        } else {
          break;
        }
      }

      if (leveledUp) {
        gameAudio.playLevelUpStinger();
        const totalZenGained = levelsGained * 2;
        triggerNotification(
          `🌟 LEVEL UP! Botanist Level ${inv.player_level}! (+${totalZenGained} Zen Point${totalZenGained > 1 ? 's' : ''} Awarded)`,
          '#ec4899',
        );
        if (locationRef.current === 'SANCTUARY') {
          addFloatingText(
            avatarRef.current.x,
            avatarRef.current.y - 45,
            `★ Level Up! Botanist Lv.${inv.player_level} (+${totalZenGained} Zen) ★`,
            '#facc15',
          );
        }
      } else if (sourceName) {
        addFloatingText(
          locationRef.current === 'SANCTUARY' ? avatarRef.current.x : 640,
          locationRef.current === 'SANCTUARY' ? avatarRef.current.y - 30 : 340,
          `+${amount} EXP`,
          '#38bdf8',
        );
      }

      refreshHud();
    },
    [addFloatingText, refreshHud, triggerNotification],
  );

  // Compute Maximum Battery Points (kWh) with Modules & Chassis Outfitting
  const getMaxRoverBattery = useCallback(() => {
    const base = (getConfig('roverBaseBattery') as number) || 50;
    const attached = sanctuaryInventoryRef.current.attached_rover_modules || [];
    const moduleBonus = attached.reduce((acc, modType) => {
      const cfg = ROVER_MODULE_CONFIGS[modType];
      return acc + (cfg?.category === 'battery' ? cfg.bonusValue : 0);
    }, 0);
    return base + moduleBonus;
  }, []);

  // Compute Maximum Cargo Weight with Modules & Chassis Outfitting
  const getMaxRoverCargo = useCallback(() => {
    const base = (getConfig('roverBaseCargo') as number) || 15.0;
    const attached = sanctuaryInventoryRef.current.attached_rover_modules || [];
    const moduleBonus = attached.reduce((acc, modType) => {
      const cfg = ROVER_MODULE_CONFIGS[modType];
      return acc + (cfg?.category === 'storage' ? cfg.bonusValue : 0);
    }, 0);
    return Math.round((base + moduleBonus) * 10) / 10;
  }, []);

  // Compute Maximum Dig Strikes Allowed (Base 2 + Careful Trowel skill ranks)
  const getMaxDigStrikes = useCallback(() => {
    return 2 + zenSkillsRef.current.carefulTrowel;
  }, []);

  // Check if a Sanctuary Grid coordinate (gx, gy) is unlocked based on expansion tier (0..4)
  const isGridPlotUnlocked = useCallback((gx: number, gy: number) => {
    const colIdx = Math.round((gx - SANCTUARY_GRID.startX) / SANCTUARY_GRID.cellW);
    const rowIdx = Math.round((gy - SANCTUARY_GRID.startY) / SANCTUARY_GRID.cellH);

    if (colIdx < 0 || colIdx >= SANCTUARY_GRID.cols || rowIdx < 0 || rowIdx >= SANCTUARY_GRID.rows) {
      return false;
    }

    const tier = sanctuaryInventoryRef.current.sanctuary_expansion_tier || 0;

    // Expansion IV: Full 16x8 matrix unlocked (128 plots)
    if (tier >= 4) return true;

    // Expansion III: Central Basin - Rows 0..5 across all 16 columns (96 plots)
    if (tier === 3) {
      return rowIdx >= 0 && rowIdx <= 5;
    }

    // Expansion II: Northern Terraces - Rows 0..3 across all 16 columns (64 plots)
    if (tier === 2) {
      return rowIdx >= 0 && rowIdx <= 3;
    }

    // Expansion I: Inner Wings - Cols 4..11 for top 4 rows (32 plots)
    if (tier === 1) {
      return colIdx >= 4 && colIdx <= 11 && rowIdx >= 0 && rowIdx <= 3;
    }

    // Starter Tier 0: 4x4 Top-Middle (Cols 6..9, Rows 0..3 = 16 starter plots)
    return colIdx >= 6 && colIdx <= 9 && rowIdx >= 0 && rowIdx <= 3;
  }, []);

  // Pre-render static terrain, promenade pebbles, and soil grid to an offscreen canvas
  const renderOffscreenTerrain = useCallback(
    (targetWidth: number, targetHeight: number) => {
      let offCanvas = offscreenTerrainCanvasRef.current;
      if (!offCanvas) {
        offCanvas = document.createElement('canvas');
        offscreenTerrainCanvasRef.current = offCanvas;
      }
      if (offCanvas.width !== targetWidth || offCanvas.height !== targetHeight) {
        offCanvas.width = targetWidth;
        offCanvas.height = targetHeight;
      }
      const offCtx = offCanvas.getContext('2d');
      if (!offCtx) return;

      offCtx.clearRect(0, 0, targetWidth, targetHeight);

      // Warm greenhouse base ambiance
      const greenhouseGrad = offCtx.createLinearGradient(0, 0, 0, targetHeight);
      greenhouseGrad.addColorStop(0, 'rgba(15, 23, 42, 0.55)');
      greenhouseGrad.addColorStop(0.3, 'rgba(6, 78, 59, 0.45)');
      greenhouseGrad.addColorStop(1, 'rgba(15, 23, 42, 0.7)');
      offCtx.fillStyle = greenhouseGrad;
      offCtx.fillRect(0, 50, targetWidth, targetHeight - 50);

      // Continuous Station Promenade Zen Pebble Walkway
      offCtx.save();
      for (let c = 0; c < SANCTUARY_GRID.cols; c++) {
        const px = SANCTUARY_GRID.startX + c * SANCTUARY_GRID.cellW;
        renderPebbleCluster(offCtx, px, 218, c % 5);
      }
      offCtx.restore();

      // 16x8 Polished parquet & warm stone flooring beneath the nursery plots
      const gridW = SANCTUARY_GRID.cols * SANCTUARY_GRID.cellW;
      const gridH = SANCTUARY_GRID.rows * SANCTUARY_GRID.cellH;
      const floorX = SANCTUARY_GRID.startX - SANCTUARY_GRID.cellW / 2 - 14;
      const floorY = SANCTUARY_GRID.startY - SANCTUARY_GRID.cellH / 2 - 14;
      const floorW = gridW + 28;
      const floorH = gridH + 28;

      offCtx.fillStyle = 'rgba(20, 83, 45, 0.45)';
      offCtx.beginPath();
      offCtx.roundRect(floorX, floorY, floorW, floorH, 14);
      offCtx.fill();

      // Stone boundary border trim with wooden joinery
      offCtx.strokeStyle = 'rgba(180, 83, 9, 0.45)';
      offCtx.lineWidth = 3.5;
      offCtx.stroke();

      // Subdued parquet planks detail inside the courtyard floor
      offCtx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      offCtx.lineWidth = 1;
      for (let py = floorY + 14; py < floorY + floorH - 10; py += 36) {
        offCtx.beginPath();
        offCtx.moveTo(floorX + 10, py);
        offCtx.lineTo(floorX + floorW - 10, py);
        offCtx.stroke();
      }

      // 16x8 GRID TILE OVERLAY WITH UNLOCKED / LOCKED SANCTUARY PLOTS
      const halfTileW = (SANCTUARY_GRID.cellW - 8) / 2;
      const halfTileH = (SANCTUARY_GRID.cellH - 8) / 2;

      for (let c = 0; c < SANCTUARY_GRID.cols; c++) {
        for (let r = 0; r < SANCTUARY_GRID.rows; r++) {
          const gx = SANCTUARY_GRID.startX + c * SANCTUARY_GRID.cellW;
          const gy = SANCTUARY_GRID.startY + r * SANCTUARY_GRID.cellH;
          const isUnlocked = isGridPlotUnlocked(gx, gy);
          const tileX = gx - halfTileW;
          const tileY = gy - halfTileH;
          const tileW = halfTileW * 2;
          const tileH = halfTileH * 2;

          if (isUnlocked) {
            // Unlocked Active Soil Tile with subtle parquet grain
            offCtx.fillStyle = 'rgba(34, 197, 94, 0.07)';
            offCtx.fillRect(tileX, tileY, tileW, tileH);
            offCtx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
            offCtx.lineWidth = 1;
            offCtx.strokeRect(tileX, tileY, tileW, tileH);

            // Brass corner soil markers
            offCtx.fillStyle = 'rgba(250, 204, 21, 0.4)';
            offCtx.fillRect(tileX + 2, tileY + 2, 4, 4);
            offCtx.fillRect(tileX + tileW - 6, tileY + 2, 4, 4);
            offCtx.fillRect(tileX + 2, tileY + tileH - 6, 4, 4);
            offCtx.fillRect(tileX + tileW - 6, tileY + tileH - 6, 4, 4);

            // Center planting alignment dot
            offCtx.fillStyle = 'rgba(255, 255, 255, 0.25)';
            offCtx.fillRect(gx - 1.5, gy - 1.5, 3, 3);
          } else {
            // Locked plot boundary with subtle decorative soil ribbon & lock marker
            offCtx.fillStyle = 'rgba(15, 23, 42, 0.72)';
            offCtx.fillRect(tileX, tileY, tileW, tileH);
            offCtx.strokeStyle = 'rgba(245, 158, 11, 0.25)';
            offCtx.lineWidth = 1;
            offCtx.setLineDash([3, 3]);
            offCtx.strokeRect(tileX, tileY, tileW, tileH);
            offCtx.setLineDash([]);

            offCtx.fillStyle = 'rgba(245, 158, 11, 0.45)';
            offCtx.font = '10px system-ui';
            offCtx.textAlign = 'center';
            offCtx.fillText('🔒', gx, gy + 3.5);
          }
        }
      }

      offscreenTerrainDirtyRef.current = false;
    },
    [isGridPlotUnlocked],
  );

  // Compute Current Total Rover Cargo Weight (kg)
  const getCargoWeight = useCallback(() => {
    const back = backpackInventoryRef.current;
    const w =
      back.scrap_metal * ITEM_WEIGHTS.scrap_metal +
      back.copper_wire * ITEM_WEIGHTS.copper_wire +
      back.brass_gears * ITEM_WEIGHTS.brass_gears +
      back.circuit_boards * ITEM_WEIGHTS.circuit_boards +
      back.electronic_chips * ITEM_WEIGHTS.electronic_chips +
      back.saplings.length * ITEM_WEIGHTS.sapling;
    return Math.round(w * 10) / 10;
  }, []);

  // Compute Power Grid metrics (Dynamically sums DEPLOYED solar panels & wind turbines with stackable Proximity Resonance)
  const getPowerMetrics = useCallback(() => {
    const deployedSolarList = deployedStructuresRef.current.filter((s) => s.type === 'solar_panel');
    const deployedTurbineList = deployedStructuresRef.current.filter((s) => s.type === 'wind_turbine');

    let solarKw = 0;
    let solarBonusCount = 0;
    deployedSolarList.forEach((panel) => {
      const {total, count} = getSolarPanelOutput(panel, deployedStructuresRef.current);
      solarKw += total;
      solarBonusCount += count;
    });

    let turbineKw = 0;
    let turbineBonusCount = 0;
    deployedTurbineList.forEach((turbine) => {
      const {total, count} = getWindTurbineOutput(turbine, deployedStructuresRef.current);
      turbineKw += total;
      turbineBonusCount += count;
    });

    const totalGenerated = solarKw + turbineKw;

    let totalRequired = 0;
    let activeAutomatonsCount = 0;

    plantedBonsaisRef.current.forEach((b) => {
      if (b.automatonTier > 0) {
        activeAutomatonsCount += 1;
        const tierConfig = getAutomatonConfig(b.automatonTier);
        totalRequired += tierConfig?.kwDrain || 2;
      }
    });

    // Installed Crafting Assembly Arms consume 3 kW each
    const craftingPowerDrain = installedCraftingArmsRef.current * 3;
    totalRequired += craftingPowerDrain;

    // Installed Auto-Fabrication Lanes consume 10 kW each
    const autoFabricatorPowerDrain = autoFabricatorLanesRef.current.length * 10;
    totalRequired += autoFabricatorPowerDrain;

    const isPowerSufficient = totalGenerated >= totalRequired;

    return {
      deployedSolar: deployedSolarList.length,
      deployedTurbines: deployedTurbineList.length,
      solarKw,
      turbineKw,
      solarBonusCount,
      turbineBonusCount,
      totalGenerated,
      totalRequired,
      activeAutomatonsCount,
      craftingPowerDrain,
      autoFabricatorPowerDrain,
      isPowerSufficient,
    };
  }, []);

  // Helper to snap coordinates to sanctuary 16x8 grid
  const snapToSanctuaryGrid = useCallback((x: number, y: number) => {
    const col = Math.max(0, Math.min(SANCTUARY_GRID.cols - 1, Math.round((x - SANCTUARY_GRID.startX) / SANCTUARY_GRID.cellW)));
    const row = Math.max(0, Math.min(SANCTUARY_GRID.rows - 1, Math.round((y - SANCTUARY_GRID.startY) / SANCTUARY_GRID.cellH)));
    return {
      col,
      row,
      x: SANCTUARY_GRID.startX + col * SANCTUARY_GRID.cellW,
      y: SANCTUARY_GRID.startY + row * SANCTUARY_GRID.cellH,
    };
  }, []);

  // Helper to get distance zone name and properties based on biome & distance
  const getZoneInfo = useCallback((biomeId: ExpeditionBiomeId, distSteps: number) => {
    const biome = EXPEDITION_BIOMES[biomeId];
    if (distSteps <= 20) {
      return {
        name: `🌿 ${biome.name} - Close Range`,
        tier: 1,
        color: biome.accentColor,
        description: `Close range perimeter (0-20 steps). Drain: ${biome.batteryCostPerStep} kWh/step.`,
      };
    } else if (distSteps <= 40) {
      return {
        name: `🍂 ${biome.name} - Middle Range`,
        tier: 2,
        color: '#f59e0b',
        description: `Middle range perimeter (21-40 steps). Drain: ${biome.batteryCostPerStep} kWh/step.`,
      };
    } else {
      return {
        name: `✨ ${biome.name} - Far Range`,
        tier: 3,
        color: '#c084fc',
        description: `Far range frontier (41-60 steps). Drain: ${biome.batteryCostPerStep} kWh/step.`,
      };
    }
  }, []);

  // Generate Wilderness Excursion Grid Map with procedural clustering & Zen scouting skills
  const generateExcursionGridWorld = useCallback((biomeId: ExpeditionBiomeId) => {
    const nodes = new Map<string, ExcursionTileNode>();
    const radius = 60;
    const seed = worldSeedRef.current;

    // Simple pseudo-random hash generator based on world seed
    const pseudoNoise = (x: number, y: number, offset: number) => {
      const s = Math.sin(x * 12.9898 + y * 78.233 + offset + seed * 0.001) * 43758.5453;
      return s - Math.floor(s);
    };

    const dowsingBonus = (zenSkillsRef.current.botanicalDowsing || 0) * 0.02;
    const prospectingBonus = (zenSkillsRef.current.resourceProspecting || 0) * 0.02;
    const bonsaiChance = 0.08 + dowsingBonus;

    for (let gx = -radius; gx <= radius; gx++) {
      for (let gy = -radius; gy <= radius; gy++) {
        if (gx === 0 && gy === 0) continue;
        if (Math.abs(gx) <= 1 && Math.abs(gy) <= 1) continue;

        const dist = Math.hypot(gx, gy);
        if (dist >= 60) continue; // Boundary at 60 steps is impassable wild perimeter

        // Prioritized Spawn Calculation: Calculate Bonsai seedling chance FIRST
        const bonsaiRoll = pseudoNoise(gx, gy, 111.1);
        const hasBonsai = bonsaiRoll < bonsaiChance;

        if (hasBonsai) {
          // Exact Biome Discovery Distribution across all 20 leaf types
          let chosenLeafType: BonsaiLeafType = 'circle';
          const speciesRoll = pseudoNoise(gx, gy, 777.7);
          const distTable = AREA_SPECIES_DISTRIBUTION[biomeId] || AREA_SPECIES_DISTRIBUTION['FOOTHILLS'];
          let accSpeciesW = 0;
          for (const [sKey, sWeight] of Object.entries(distTable)) {
            accSpeciesW += sWeight;
            if (speciesRoll <= accSpeciesW) {
              chosenLeafType = sKey as BonsaiLeafType;
              break;
            }
          }

          const chosenLeaf = LEAF_TYPE_CONFIGS[chosenLeafType];

          let weights = {sprout: 100, sapling: 0, notable: 0, refined: 0, premium: 0};

          if (biomeId === 'FOOTHILLS') {
            if (dist <= 20) {
              weights = {sprout: 100, sapling: 0, notable: 0, refined: 0, premium: 0};
            } else if (dist <= 40) {
              weights = {sprout: 88, sapling: 12, notable: 0, refined: 0, premium: 0};
            } else {
              weights = {sprout: 78, sapling: 20, notable: 2, refined: 0, premium: 0};
            }
          } else if (biomeId === 'HIGHLANDS') {
            if (dist <= 20) {
              weights = {sprout: 88, sapling: 12, notable: 0, refined: 0, premium: 0};
            } else if (dist <= 40) {
              weights = {sprout: 78, sapling: 20, notable: 2, refined: 0, premium: 0};
            } else {
              weights = {sprout: 66.5, sapling: 25, notable: 7.3, refined: 1.2, premium: 0};
            }
          } else {
            // Ancient Caldera / Overgrowth
            if (dist <= 20) {
              weights = {sprout: 78, sapling: 20, notable: 2, refined: 0, premium: 0};
            } else if (dist <= 40) {
              weights = {sprout: 66.5, sapling: 25, notable: 7.3, refined: 1.2, premium: 0};
            } else {
              weights = {sprout: 56.5, sapling: 28, notable: 11.5, refined: 3.5, premium: 0.5};
            }
          }

          const wArray = [weights.sprout, weights.sapling, weights.notable, weights.refined, weights.premium];
          const totalW = wArray.reduce((a, b) => a + b, 0);
          const matRoll = pseudoNoise(gx, gy, 555.5) * totalW;

          let chosenMaturity: MaturityTier = 'sprout';
          let chosenMaturityIdx = 0;
          const maturityList: MaturityTier[] = ['sprout', 'sapling', 'notable', 'refined', 'premium'];
          let accW = 0;
          for (let i = 0; i < wArray.length; i++) {
            accW += wArray[i];
            if (matRoll <= accW) {
              chosenMaturity = maturityList[i];
              chosenMaturityIdx = i;
              break;
            }
          }

          const spawnChance = totalW > 0 ? (wArray[chosenMaturityIdx] / totalW) : 1.0;
          const matDef = getMaturityDef(chosenMaturity);

          nodes.set(`${gx},${gy}`, {
            id: `sap_${gx}_${gy}`,
            tileX: gx,
            tileY: gy,
            type: 'SAPLING',
            saplingLeafType: chosenLeaf.id,
            saplingGroup: chosenLeaf.group,
            saplingMaturity: chosenMaturity,
            saplingSpecies: chosenLeaf.id,
            saplingName: `[${chosenLeaf.group}] ${chosenLeaf.name} (${matDef.kanji} ${matDef.name})`,
            saplingRarity: chosenLeaf.rarity,
            spawnChance,
            collected: false,
          });
        } else {
          // If and ONLY if a seedling does NOT spawn on this cell, calculate resource spawn chance
          const baseResChance = dist <= 20 ? 0.04 : dist <= 40 ? 0.06 : 0.08;
          const resourceRate = baseResChance + prospectingBonus;
          const resSpawnRoll = pseudoNoise(gx, gy, 222.2);

          if (resSpawnRoll < resourceRate) {
            const resRoll = pseudoNoise(gx, gy, 888.8);
            const resourceType = pickResourceDeposit(biomeId, dist, resRoll);

            nodes.set(`${gx},${gy}`, {
              id: `res_${gx}_${gy}`,
              tileX: gx,
              tileY: gy,
              type: 'RESOURCE',
              resourceType,
              collected: false,
            });
          }
        }
      }
    }

    excursionNodesRef.current = nodes;
  }, []);

  // Launch Expedition into a specific Biome
  const startBiomeExcursion = useCallback(
    (biomeId: ExpeditionBiomeId) => {
      const biome = EXPEDITION_BIOMES[biomeId];
      const inv = sanctuaryInventoryRef.current;
      const reqKey = biome.requiredMapKey;

      if (!biome.unlockedByDefault && reqKey && !inv[reqKey]) {
        gameAudio.playErrorBuzz();
        triggerNotification(`Locked: Purchase map at Botanical Market (${biome.mapCost} Verdure)`, '#ef4444');
        return;
      }

      // 1. Store exact Sanctuary player position
      sanctuaryPlayerPosRef.current = {
        x: avatarRef.current.x,
        y: avatarRef.current.y,
      };

      setIsBiomeSelectOpen(false);
      setActiveBiomeId(biomeId);
      activeBiomeIdRef.current = biomeId;
      worldSeedRef.current = Date.now() + Math.floor(Math.random() * 100000);

      generateExcursionGridWorld(biomeId);

      // Reset Fog of War and reveal initial vision around Basecamp (0, 0)
      exploredTilesRef.current = new Set();
      revealFogAroundRover(0, 0);

      const maxBat = getMaxRoverBattery();
      roverRef.current = {
        tileX: 0,
        tileY: 0,
        visualX: EXCURSION_TILE_SIZE / 2,
        visualY: EXCURSION_TILE_SIZE / 2,
        facing: 'up',
        facingDirection: 1,
        rotation: 0,
        batteryKwh: maxBat,
        maxBatteryKwh: maxBat,
        isMovingAnim: false,
        moveCooldown: 0,
        maxDistanceReached: 0,
      };

      cameraRef.current = {
        x: EXCURSION_TILE_SIZE / 2 - canvasWidth / 2,
        y: EXCURSION_TILE_SIZE / 2 - canvasHeight / 2,
      };

      backpackInventoryRef.current = {
        scrap_metal: 0,
        copper_wire: 0,
        brass_gears: 0,
        circuit_boards: 0,
        electronic_chips: 0,
        saplings: [],
      };

      setLocation('EXCURSION');
      gameAudio.playPowerupChime();
      triggerNotification(
        `🚙 Deployed to ${biome.name}! Drain: ${biome.batteryCostPerStep} kWh/step • Battery: ${maxBat} kWh`,
        biome.accentColor,
      );
    },
    [generateExcursionGridWorld, getMaxRoverBattery, triggerNotification],
  );

  // Finish Excursion and Build Report Modal
  const finishExcursion = useCallback(
    (isStranded: boolean) => {
      const back = backpackInventoryRef.current;
      const rover = roverRef.current;
      const currentBiome = EXPEDITION_BIOMES[activeBiomeIdRef.current];
      const retention = isStranded ? 0.35 : 1.0;

      const keys: ResourceItemKey[] = [
        'scrap_metal',
        'copper_wire',
        'brass_gears',
        'circuit_boards',
        'electronic_chips',
      ];

      const itemBreakdown = keys.map((k) => {
        const collected = back[k];
        let retained = Math.floor(collected * retention);
        if (collected > 0 && retained === 0 && Math.random() < 0.5) retained = 1;
        retained = Math.min(collected, retained);
        const lost = collected - retained;

        const nameMap: Record<ResourceItemKey, string> = {
          scrap_metal: '🔩 Scrap Metal',
          copper_wire: '⚡ Copper Wire',
          brass_gears: '⚙️ Brass Gears',
          circuit_boards: '🟩 Circuit Boards',
          electronic_chips: '💎 Electronic Chips',
          scrap_metal_double: '🔩 Heavy Scrap Metal (2x)',
          copper_wire_double: '⚡ Heavy Copper Wire (2x)',
        };

        return {
          key: k,
          name: nameMap[k],
          collected,
          retained,
          lost,
        };
      });

      const totalSaplings = back.saplings.length;
      const retainedSaplingCount = Math.floor(totalSaplings * retention);
      const saplingBreakdown = back.saplings.map((sap, idx) => ({
        name: sap.name,
        leafType: sap.leafType,
        group: sap.group,
        maturity: sap.maturity || 'sprout',
        rarity: sap.rarity,
        retained: idx < retainedSaplingCount || !isStranded,
      }));

      const report: ExcursionReportData = {
        safeReturn: !isStranded,
        biomeId: currentBiome.id,
        biomeName: currentBiome.name,
        retentionRate: retention,
        distanceReached: rover.maxDistanceReached,
        batteryRemaining: rover.batteryKwh,
        maxBatteryKwh: rover.maxBatteryKwh,
        totalWeight: getCargoWeight(),
        items: itemBreakdown,
        saplings: saplingBreakdown,
      };

      if (isStranded) {
        gameAudio.playDefeatMotif();
      } else {
        gameAudio.playVictoryFanfare();
      }

      setExcursionReport(report);
    },
    [getCargoWeight],
  );

  // Deposit retained loot into Sanctuary Storage from Report Screen
  const depositHaulAndReturnToSanctuary = useCallback(() => {
    if (!excursionReport) return;

    const inv = sanctuaryInventoryRef.current;
    const report = excursionReport;

    report.items.forEach((item) => {
      inv[item.key] = (inv[item.key] || 0) + item.retained;
    });

    inv.scrapMetal = inv.scrap_metal;
    inv.copperWire = inv.copper_wire;
    inv.gears = inv.brass_gears;
    inv.microcircuits = inv.circuit_boards;
    inv.chips = inv.quantumChips = inv.electronic_chips;
    inv.organicWaste = inv.organic_waste;
    inv.enrichedCompost = inv.organic_compost;

    const back = backpackInventoryRef.current;
    report.saplings.forEach((sapReport, idx) => {
      if (sapReport.retained) {
        const sap = back.saplings[idx];
        if (sap) {
          const lType = sap.leafType;
          const mat = sap.maturity || 'sprout';
          recordBondexEntry(lType, mat);

          const uniqueId = (sap as any).id || `seedling_${Date.now()}_${Math.random().toString(36).slice(2, 7)}_${idx}`;
          const pickedNature = (sap as any).nature
            ? getBonsaiNature((sap as any).nature)
            : BONSAI_NATURES[Math.floor(Math.random() * BONSAI_NATURES.length)];
          const seedlingItem: SeedlingItem = {
            id: uniqueId,
            leafType: lType,
            group: sap.group || getLeafTypeDef(lType).group,
            maturity: mat,
            species: lType,
            name: sap.name,
            rarity: sap.rarity,
            nature: pickedNature,
            color: sap.color || getLeafTypeDef(lType).color,
            flowerColor: sap.flowerColor || getLeafTypeDef(lType).accentColor,
            findOdds: sap.findOdds,
            geneticPotential: (sap as any).geneticPotential || sap.attributes || { ...DEFAULT_BONSAI_ATTRIBUTES },
            attributes: (sap as any).geneticPotential || sap.attributes || { ...DEFAULT_BONSAI_ATTRIBUTES },
            cultivationPotential: sap.cultivationPotential || { ...DEFAULT_CULTIVATION_POTENTIAL },
            discoveredAreaId: (sap as any).discoveredAreaId || report.biomeId,
          };

          if (!sanctuaryInventoryRef.current.seedlingList) {
            sanctuaryInventoryRef.current.seedlingList = [];
          }
          sanctuaryInventoryRef.current.seedlingList.push(seedlingItem);

          storedSaplingsRef.current.push({
            leafType: lType,
            group: sap.group,
            maturity: mat,
            species: lType,
            name: sap.name,
            rarity: sap.rarity,
            count: 1,
            color: sap.color,
            flowerColor: sap.flowerColor,
            potColor: '#1e293b',
            potStyle: 'Carved Ceramic',
            findOdds: sap.findOdds,
            attributes: seedlingItem.attributes,
            cultivationPotential: sap.cultivationPotential || { ...DEFAULT_CULTIVATION_POTENTIAL },
          });
        }
      }
    });

    // Track completed expeditions per biome
    const biomeKey = report.biomeId;
    statsRef.current.expeditionsPerBiome[biomeKey] =
      (statsRef.current.expeditionsPerBiome[biomeKey] || 0) + 1;

    backpackInventoryRef.current = {
      scrap_metal: 0,
      copper_wire: 0,
      brass_gears: 0,
      circuit_boards: 0,
      electronic_chips: 0,
      saplings: [],
    };

    setExcursionReport(null);
    setIsBiomeSelectOpen(false);
    setLocation('SANCTUARY');
    locationRef.current = 'SANCTUARY';

    // Strictly restore player's Sanctuary position from before expedition departure
    avatarRef.current.x = sanctuaryPlayerPosRef.current.x;
    avatarRef.current.y = sanctuaryPlayerPosRef.current.y;
    avatarRef.current.facing = 'down';

    // Reset interaction collision references so plots/stations detect immediately
    standingPlotKeyRef.current = '';
    nearbyBonsaiIdRef.current = null;
    nearbyStructureIdRef.current = null;
    isNearZenLibraryRef.current = false;
    isNearWorkbenchRef.current = false;
    isNearBonsaiSocietyRef.current = false;
    isNearGarageRef.current = false;
    isNearShopRef.current = false;
    setNearbyBonsai(null);
    setNearbyStructure(null);
    setStandingPlot(null);
    setActivePlot(null);
    activePlotRef.current = null;

    canvasRef.current?.focus();
    refreshHud();
    gameAudio.playCoinPickup();
    triggerNotification('Haul deposited into Sanctuary Storage!', '#10b981', 3500);
  }, [excursionReport, refreshHud, triggerNotification]);

  // Initiate Dig Minigame on Sapling (2 BASE STRIKES + 100% SUCCESS REQUIRED)
  const triggerRadialDig = useCallback(
    (node: ExcursionTileNode) => {
      const curWeight = getCargoWeight();
      const maxWeight = getMaxRoverCargo();

      if (curWeight + ITEM_WEIGHTS.sapling > maxWeight) {
        gameAudio.playErrorBuzz();
        triggerNotification('🎒 Rover Cargo Bed is full (3.0kg)! Return to Campsite to unload.', '#ef4444');
        return;
      }

      const leafType: BonsaiLeafType = node.saplingLeafType || 'circle';
      const leafDef = getLeafTypeDef(leafType);
      const group: BonsaiGroup = node.saplingGroup || leafDef.group;
      const maturity: MaturityTier = node.saplingMaturity || 'sprout';
      const matDef = getMaturityDef(maturity);
      const rarity = node.saplingRarity || leafDef.rarity;

      // Number of digging zones: Rating 1: 2 zones, Rating 2: 3 zones, Rating 3: 4 zones, Rating 4: 5 zones, Rating 5: 6 zones (zonesCount = maturity + 1)
      const matRank = matDef.rank; // 1 to 5
      const totalSpots = MATURITY_SPOTS_COUNT[maturity] || (matRank + 1);

      const maxStrikesAllowed = getMaxDigStrikes(); // Base 2 + Careful Trowel ranks
      const isGated = maxStrikesAllowed < totalSpots; // Cannot win without enough strikes!

      // Digging Arc Calculation:
      // Base normal (100% size) digging area width = 16% of the full circle (0.16 * 2 * Math.PI radians, or 57.6°)
      const baseNormalArc = 0.16 * 2 * Math.PI;

      // Species Find Odds scaling:
      // 33% odds = 100% (1.0). Each 1% less in odds reduces digging area size by 1%:
      // oddsSizeMult = 1.0 - (33 - speciesFindOdds) * 0.01 (e.g., 1% odds -> 1.0 - 0.32 = 0.68)
      const rawOdds = node.findOdds ?? Math.round(getSpeciesAreaProbability(activeBiomeIdRef.current, leafType) * 100);
      const speciesFindOdds = Math.max(1, Math.min(33, rawOdds));
      const oddsSizeMult = 1.0 - (33 - speciesFindOdds) * 0.01;

      // Maturity Rating scaling:
      // Rating 1: 100% (1.00), Rating 2: 92% (0.92), Rating 3: 84% (0.84), Rating 4: 76% (0.76), Rating 5: 68% (0.68)
      const maturitySizeMultMap: Record<number, number> = {
        1: 1.00,
        2: 0.92,
        3: 0.84,
        4: 0.76,
        5: 0.68,
      };
      const maturitySizeMult = maturitySizeMultMap[matRank] ?? Math.max(0.68, 1.00 - (matRank - 1) * 0.08);

      // Broad Spade skill bonus: +5% arc width per level (+25% max at level 5)
      const broadSpadeLevel = zenSkillsRef.current.broadSpade || 0;
      const broadSpadeBonus = broadSpadeLevel * 0.05;

      // Combined arc width = (0.16 * 2 * Math.PI) * oddsSizeMult * maturitySizeMult * (1 + broadSpadeBonus)
      const arcWidth = baseNormalArc * oddsSizeMult * maturitySizeMult * (1 + broadSpadeBonus);
      const arcDeg = (arcWidth * 180) / Math.PI;

      // Shovel rotation speed by expedition area:
      // Area 1 (Sunlit Foothills): ~3.2 rad/s
      // Area 2 (Misty Highlands): ~4.4 rad/s
      // Area 3 (Ancient Caldera): ~5.8 rad/s
      const currentArea = activeBiomeIdRef.current;
      let shovelRotationSpeed: number = AREA_EXCAVATION_SPEEDS.FOOTHILLS;
      if (currentArea === 'HIGHLANDS') {
        shovelRotationSpeed = AREA_EXCAVATION_SPEEDS.HIGHLANDS;
      } else if (currentArea === 'OVERGROWTH') {
        shovelRotationSpeed = AREA_EXCAVATION_SPEEDS.OVERGROWTH;
      }

      // 100% Hit Requirement: requiredHits EQUALS totalSpots!
      const reqHits = totalSpots;

      // Distribute targetCount = targetMaturity + 1 targets around the circle without overlapping
      const sectors: RadialDigState['sectors'] = [];
      const slice = (Math.PI * 2) / totalSpots;
      const effectiveArc = Math.min(arcWidth, slice - 0.06);

      for (let i = 0; i < totalSpots; i++) {
        const maxOffset = Math.max(0, slice - effectiveArc - 0.04);
        const start = i * slice + 0.02 + Math.random() * maxOffset;
        sectors.push({
          startAngle: start,
          arcLength: effectiveArc,
          hit: false,
        });
      }

      digStateRef.current = {
        active: true,
        nodeId: node.id,
        tileX: node.tileX,
        tileY: node.tileY,
        saplingName: node.saplingName || `[${group}] ${leafDef.name} (${matDef.kanji} ${matDef.name})`,
        leafType,
        group,
        maturity,
        species: leafType,
        rarity,
        needleAngle: 0,
        angularVelocity: shovelRotationSpeed,
        sectors,
        requiredHits: reqHits,
        currentHits: 0,
        strikesUsed: 0,
        maxStrikes: maxStrikesAllowed,
        isGated,
        wobbleTimer: 0,
        status: 'DIGGING',
        speciesChance: speciesFindOdds / 100,
        arcDeg,
      };

      // Reveal species in Rover Garage Codex and Bondex immediately upon excavation initiation
      revealAreaSpecies(activeBiomeIdRef.current, leafType, maturity);

      if (isGated) {
        gameAudio.playErrorBuzz();
        triggerNotification(`⚠️ Requires ${totalSpots} Strikes (Current: ${maxStrikesAllowed})! Upgrade Careful Trowel in Zen Skills.`, '#f59e0b');
      } else {
        gameAudio.playPowerupChime();
      }
    },
    [getCargoWeight, getMaxDigStrikes, getMaxRoverCargo, triggerNotification],
  );

  // Discrete Grid Step Movement for Rover
  const attemptRoverStep = useCallback(
    (dx: number, dy: number) => {
      if (locationRef.current !== 'EXCURSION' || digStateRef.current.active || excursionReport || excavationResult) return;

      const rover = roverRef.current;
      const currentBiome = EXPEDITION_BIOMES[activeBiomeIdRef.current];
      const stepCost = currentBiome.batteryCostPerStep;

      if (rover.batteryKwh <= 0) {
        finishExcursion(true);
        return;
      }

      const nextTileX = rover.tileX + dx;
      const nextTileY = rover.tileY + dy;
      const targetDist = Math.hypot(nextTileX, nextTileY);

      // Impassable 60-Step Wilderness Barrier
      if (targetDist >= 60) {
        gameAudio.playErrorBuzz();
        triggerNotification('🚫 Impassable Wilderness Boundary', '#f43f5e');
        return;
      }

      rover.tileX = nextTileX;
      rover.tileY = nextTileY;

      // Perpetuum Mobile check (0% at Lv.0, +5% per rank up to 25% total at Lv.5)
      const perpetuumRank = zenSkillsRef.current.perpetuum_mobile || 0;
      const perpetuumChance = perpetuumRank * 0.05;
      const isFreeEnergy = perpetuumChance > 0 && Math.random() < perpetuumChance;

      if (!isFreeEnergy) {
        rover.batteryKwh = Math.max(0, rover.batteryKwh - stepCost);
      } else {
        addFloatingText(rover.visualX, rover.visualY - 25, '⚡ 0 Energy (Perpetuum Mobile!)', '#38bdf8');
      }

      // Reveal fog around new rover position
      revealFogAroundRover(nextTileX, nextTileY);

      if (dx > 0) {
        rover.facing = 'right';
        rover.facingDirection = 1;
      } else if (dx < 0) {
        rover.facing = 'left';
        rover.facingDirection = -1;
      } else if (dy > 0) {
        rover.facing = 'down';
      } else if (dy < 0) {
        rover.facing = 'up';
      }

      const currentDist = Math.round(Math.hypot(rover.tileX, rover.tileY));
      rover.maxDistanceReached = Math.max(rover.maxDistanceReached, currentDist);

      gameAudio.playFootstepWood();

      if (rover.tileX === 0 && rover.tileY === 0) {
        triggerNotification('🏕️ At Campsite Base! Click [Unload Haul] or press [Enter] to safely return with 100% loot.', '#10b981');
      }

      const key = `${rover.tileX},${rover.tileY}`;
      const node = excursionNodesRef.current.get(key);

      if (node && !node.collected) {
        if (node.type === 'RESOURCE' && node.resourceType) {
          const rt = node.resourceType;
          // Track discovered resource in codex
          const curArea = activeBiomeIdRef.current;
          const disc = areaDiscoveryRef.current;
          if (!disc.resources[curArea].includes(rt)) {
            disc.resources[curArea].push(rt);
          }
          const isDoubleScrap = rt === 'scrap_metal_double';
          const isDoubleWire = rt === 'copper_wire_double';
          const nameMap: Record<ResourceItemKey, string> = {
            scrap_metal: '🔩 Scrap Metal (0.8kg)',
            copper_wire: '⚡ Copper Wire (0.5kg)',
            brass_gears: '⚙️ Brass Gear (1.2kg)',
            circuit_boards: '🟩 Circuit Board (1.0kg)',
            electronic_chips: '💎 Electronic Chip (1.5kg)',
            scrap_metal_double: '🔩 Heavy Scrap Metal Cache (2x, 1.6kg)',
            copper_wire_double: '⚡ Heavy Copper Wire Bundle (2x, 1.0kg)',
          };
          const curWeight = getCargoWeight();
          const maxWeight = getMaxRoverCargo();
          const itemWeight = ITEM_WEIGHTS[rt];
          const remainingCapacity = maxWeight - curWeight;
          const singleWeight = isDoubleScrap ? 0.8 : isDoubleWire ? 0.5 : itemWeight;

          if (curWeight + itemWeight <= maxWeight) {
            triggerNotification(`Found ${nameMap[rt]}! Press [E] to collect.`, '#38bdf8');
          } else if ((isDoubleScrap || isDoubleWire) && remainingCapacity >= singleWeight) {
            triggerNotification(`Found ${nameMap[rt]}! [Requires 2 cargo slots - only 1 available]`, '#ef4444');
          } else {
            triggerNotification(`Found ${nameMap[rt]}! [Backpack Full - Return to Base]`, '#ef4444');
          }
        } else if (node.type === 'SAPLING') {
          const curWeight = getCargoWeight();
          const maxWeight = getMaxRoverCargo();
          if (curWeight + ITEM_WEIGHTS.sapling <= maxWeight) {
            triggerNotification(`Found ${node.saplingName || 'Wild Seedling'}! Press [E] to Excavate (3.0kg).`, '#34d399');
          } else {
            triggerNotification(`Found ${node.saplingName || 'Wild Seedling'}! [Backpack Full (3.0kg)]`, '#ef4444');
          }
        }
      }

      if (rover.batteryKwh <= 0) {
        if (rover.tileX === 0 && rover.tileY === 0) {
          finishExcursion(false);
        } else {
          finishExcursion(true);
        }
      }

      refreshHud();
    },
    [excursionReport, finishExcursion, getCargoWeight, getMaxRoverCargo, refreshHud, triggerNotification, addFloatingText, revealFogAroundRover],
  );

  // Claim Zen Milestone Achievement
  const claimAchievement = useCallback(
    (achId: string, rewardZen: number, title: string) => {
      const stats = statsRef.current;
      if (stats.claimedAchievements.includes(achId)) return;
      stats.claimedAchievements.push(achId);
      sanctuaryInventoryRef.current.zen_essence += rewardZen;
      gameAudio.playLevelUpStinger();
      addFloatingText(canvasWidth / 2, canvasHeight / 2, `🏆 +${rewardZen} Zen Points!`, '#ec4899');
      triggerNotification(`🏆 Claimed "${title}"! (+${rewardZen} Zen Points)`, '#ec4899');
      refreshHud();
    },
    [addFloatingText, canvasHeight, canvasWidth, refreshHud, triggerNotification],
  );

  // Initialize or Restart Game
  const initGame = useCallback(() => {
    plantedBonsaisRef.current = [];
    deployedStructuresRef.current = [];
    storedPottedBonsaisRef.current = [];
    storedSaplingsRef.current = [];
    installedCraftingArmsRef.current = 0;
    autoFabricatorLanesRef.current = [];

    statsRef.current = {
      leafTypeStylesGrown: {},
      groupBonsaisGrown: {
        Raundo: 0,
        Erementaru: 0,
        'Roku-men': 0,
        Seikatsu: 0,
        Sanmen: 0,
        Shihen: 0,
        'Jinkō-teki': 0,
      },
      firstLevel100Reached: false,
      expeditionsPerBiome: {
        FOOTHILLS: 0,
        HIGHLANDS: 0,
        OVERGROWTH: 0,
      },
      claimedAchievements: [],
      totalLevelUps: 0,
      maxSpecimensGrownLv10: [],
      maxSpecimensGrownLv25: [],
      maxSpecimensGrownLv50: [],
      sproutLv10Ids: [],
      saplingLv15Ids: [],
      notableLv20Ids: [],
      refinedLv25Ids: [],
      premiumLv30Ids: [],
    };

    areaDiscoveryRef.current = {
      species: { FOOTHILLS: [], HIGHLANDS: [], OVERGROWTH: [] },
      maturities: { FOOTHILLS: [], HIGHLANDS: [], OVERGROWTH: [] },
      resources: { FOOTHILLS: [], HIGHLANDS: [], OVERGROWTH: [] },
    };

    bondexDiscoveryRef.current = {};

    storedSaplingsRef.current = [];

    sanctuaryInventoryRef.current = {
      coins: 50,
      player_level: 1,
      player_exp: 0,
      scrap_metal: 0,
      copper_wire: 0,
      brass_gears: 0,
      circuit_boards: 0,
      electronic_chips: 0,
      organic_waste: 0,
      organic_compost: 0,
      seedlingList: [],
      storedBonsais: [],
      scrapMetal: 0,
      copperWire: 0,
      gears: 0,
      microcircuits: 0,
      chips: 0,
      quantumChips: 0,
      organicWaste: 0,
      enrichedCompost: 0,
      has_compost_guide: false,
      has_tier1_guide: false,
      has_tier2_guide: false,
      has_tier3_guide: false,
      has_auto_fabricator_guide: false,
      has_workbench_t2_guide: false,
      has_workbench_t3_guide: false,
      workbench_tier: 1,
      crafting_automatons_inv: 0,
      auto_fabricators_inv: 0,
      solar_panels_inv: 0,
      solar_panel_inv: 0,
      solarPanels: 0,
      wind_turbines_inv: 0,
      wind_turbine_inv: 0,
      windTurbines: 0,
      decor_pebble_path_inv: 0,
      decor_rock_formation_inv: 0,
      decor_shrubbery_bush_inv: 0,
      decor_woven_wall_inv: 0,
      torii_gate_inv: 0,
      crystal_pedestal_foliage_inv: 0,
      crystal_pedestal_branches_inv: 0,
      crystal_pedestal_trunk_inv: 0,
      crystal_pedestal_roots_inv: 0,
      decorations: {
        pebblePath: 0,
        rockFormation: 0,
        shrubbery: 0,
        wovenWall: 0,
        toriiGate: 0,
      },
      tool_compost_heap_inv: 0,
      tool_garden_well_inv: 0,
      tools: {
        compostHeap: 0,
        gardenWell: 0,
      },
      rover_storage_tier: 0,
      rover_battery_tier: 0,
      zen_essence: 0,
      automatons_tier1: 0,
      automatons_tier2: 0,
      automatons_tier3: 0,
      rover_battery_level: 0,
      rover_cargo_level: 0,
      sanctuary_expansion_tier: 0,
      has_map_highlands: false,
      has_map_overgrowth: false,
      has_rover_t2_blueprint: false,
      has_rover_t3_blueprint: false,
      has_storage_module_1_guide: false,
      has_storage_module_2_guide: false,
      has_storage_module_3_guide: false,
      has_battery_module_1_guide: false,
      has_battery_module_2_guide: false,
      has_battery_module_3_guide: false,
      has_radar_module_1_guide: false,
      has_radar_module_2_guide: false,
      has_radar_module_3_guide: false,
      rover_chassis_tier: 1,
      rover_modules: {
        storage_1: 0,
        storage_2: 0,
        storage_3: 0,
        battery_1: 0,
        battery_2: 0,
        battery_3: 0,
        radar_1: 0,
        radar_2: 0,
        radar_3: 0,
      },
      roverModules: {
        storage_1: 0,
        storage_2: 0,
        storage_3: 0,
        battery_1: 0,
        battery_2: 0,
        battery_3: 0,
        radar_1: 0,
        radar_2: 0,
        radar_3: 0,
      },
      attached_rover_modules: [],
      attachedRoverModules: [],
    };

    activeCraftingRef.current = null;
    craftingQueueRef.current = [];

    backpackInventoryRef.current = {
      scrap_metal: 0,
      copper_wire: 0,
      brass_gears: 0,
      circuit_boards: 0,
      electronic_chips: 0,
      saplings: [],
    };

    zenSkillsRef.current = {
      steady_hands: 0,
      carefulTrowel: 0,
      broadSpade: 0,
      greenThumb: 0,
      hydrodynamics: 0,
      botanicalForaging: 0,
      resourceProspecting: 0,
      botanicalDowsing: 0,
      perpetuum_mobile: 0,
    };

    avatarRef.current = {
      x: 640,
      y: 220,
      vx: 0,
      vy: 0,
      radius: 18,
      facing: 'down',
      stepSoundTimer: 0,
      isMoving: false,
      walkFrame: 0,
    };

    sanctuaryPlayerPosRef.current = {
      x: 640,
      y: 220,
    };

    roverRef.current = {
      tileX: 0,
      tileY: 0,
      visualX: EXCURSION_TILE_SIZE / 2,
      visualY: EXCURSION_TILE_SIZE / 2,
      facing: 'up',
      facingDirection: 1,
      rotation: 0,
      batteryKwh: 50,
      maxBatteryKwh: 50,
      isMovingAnim: false,
      moveCooldown: 0,
      maxDistanceReached: 0,
    };

    cameraRef.current = {
      x: EXCURSION_TILE_SIZE / 2 - canvasWidth / 2,
      y: EXCURSION_TILE_SIZE / 2 - canvasHeight / 2,
    };
    sanctuaryCameraRef.current = {y: 0};
    digStateRef.current = {
      active: false,
      nodeId: '',
      tileX: 0,
      tileY: 0,
      saplingName: '',
      leafType: 'circle',
      group: 'Raundo',
      maturity: 'sprout',
      species: 'circle',
      rarity: 'COMMON',
      needleAngle: 0,
      angularVelocity: 3.2,
      sectors: [],
      requiredHits: 2,
      currentHits: 0,
      strikesUsed: 0,
      maxStrikes: 2,
      isGated: false,
      wobbleTimer: 0,
      status: 'DIGGING',
      spawnChance: 1.0,
      speciesChance: 0.5,
      arcDeg: 37.5,
    };
    daylightCycleRef.current = 0.3;
    exploredTilesRef.current = new Set();
    particlePoolRef.current.forEach((p) => { p.active = false; });
    floatingTextsRef.current = [];
    offscreenTerrainDirtyRef.current = true;
    invalidateSynergiesCache();
    setExcursionReport(null);
    setExcavationResult(null);
    setLocation('SANCTUARY');
    setActiveBiomeId('FOOTHILLS');
    activeBiomeIdRef.current = 'FOOTHILLS';
    setInspectingBonsaiId(null);
    setInspectingStructureId(null);
    setQuickRadialBonsai(null);
    setStandingPlot(null);
    setActivePlot(null);
    activePlotRef.current = null;
    standingPlotKeyRef.current = '';
    setIsUnifiedStorageOpen(false);
    setIsPlantingModalOpen(false);
    setIsWorkbenchModalOpen(false);
    setIsZenSkillsModalOpen(false);
    setIsShopModalOpen(false);
    setIsBiomeSelectOpen(false);
    setIsGoalModalOpen(false);
    setIsNearBonsaiSociety(false);
    setWorkbenchTab('resources');

    setGameState({
      status: 'PLAYING',
      score: 0,
      level: 1,
    });

    setIsGameMenuOpen(false);
    setIsHowToPlayOpen(false);
    refreshHud();

    if (sdk) {
      sdk.startGame();
    }
  }, [sdk, refreshHud]);

  // Cancel Digging Minigame safely without spending strikes or failing
  const cancelDiggingMinigame = useCallback(() => {
    if (!digStateRef.current.active) return;
    revealAreaSpecies(activeBiomeIdRef.current, digStateRef.current.leafType, digStateRef.current.maturity);
    digStateRef.current.active = false;
    digStateRef.current.status = 'DIGGING';
    gameAudio.playCrispClick();
    triggerNotification('Left excavation site safely without spending strikes.', '#94a3b8');
    refreshHud();
  }, [revealAreaSpecies, refreshHud, triggerNotification]);

  // Voluntary Harvest of Resource Node at Rover Tile
  const collectCurrentRoverResource = useCallback(() => {
    if (locationRef.current !== 'EXCURSION' || digStateRef.current.active || excursionReport || excavationResult) return;
    const rover = roverRef.current;
    const key = `${rover.tileX},${rover.tileY}`;
    const node = excursionNodesRef.current.get(key);

    if (node && !node.collected && node.type === 'RESOURCE' && node.resourceType) {
      const rt = node.resourceType;
      const isDoubleScrap = rt === 'scrap_metal_double';
      const isDoubleWire = rt === 'copper_wire_double';
      const curWeight = getCargoWeight();
      const maxWeight = getMaxRoverCargo();
      const itemWeight = ITEM_WEIGHTS[rt];
      const remainingSpace = maxWeight - curWeight;
      const singleWeight = isDoubleScrap ? 0.8 : isDoubleWire ? 0.5 : itemWeight;

      if (curWeight + itemWeight <= maxWeight) {
        node.collected = true;
        if (isDoubleScrap) {
          backpackInventoryRef.current.scrap_metal += 2;
        } else if (isDoubleWire) {
          backpackInventoryRef.current.copper_wire += 2;
        } else {
          backpackInventoryRef.current[rt] += 1;
        }
        gameAudio.playCoinPickup();

        // Track discovered resource in current area codex
        const curArea = activeBiomeIdRef.current;
        const disc = areaDiscoveryRef.current;
        if (!disc.resources[curArea].includes(rt)) {
          disc.resources[curArea].push(rt);
        }

        const expGain = RESOURCE_HARVEST_EXP[rt] || (isDoubleScrap ? 16 : isDoubleWire ? 24 : 8);
        gainPlayerExp(expGain, rt);

        const nameMap: Record<ResourceItemKey, string> = {
          scrap_metal: '🔩 Scrap Metal (0.8kg)',
          copper_wire: '⚡ Copper Wire (0.5kg)',
          brass_gears: '⚙️ Brass Gear (1.2kg)',
          circuit_boards: '🟩 Circuit Board (1.0kg)',
          electronic_chips: '💎 Electronic Chip (1.5kg)',
          scrap_metal_double: '🔩 Heavy Scrap Metal Cache (2x, 1.6kg)',
          copper_wire_double: '⚡ Heavy Copper Wire Bundle (2x, 1.0kg)',
        };
        triggerNotification(`Harvested ${nameMap[rt]}! (+${expGain} EXP)`, '#f59e0b');
        refreshHud();
      } else {
        gameAudio.playErrorBuzz();
        if ((isDoubleScrap || isDoubleWire) && remainingSpace >= singleWeight) {
          triggerNotification('🎒 2 cargo slots required for 2x Heavy Deposit! (Only 1 slot available)', '#ef4444');
        } else {
          triggerNotification('🎒 Rover Cargo Bed full! Return to Campsite to unload.', '#ef4444');
        }
      }
    }
  }, [excursionReport, gainPlayerExp, getCargoWeight, getMaxRoverCargo, refreshHud, triggerNotification]);
  useEffect(() => {
    if (
      !hasAutoplayed.current &&
      new URLSearchParams(window.location.search).has('autoplay')
    ) {
      hasAutoplayed.current = true;
      initGame();
    }
  }, [initGame]);

  // Handle Victory fanfare
  useEffect(() => {
    if (gameState.status === 'VICTORY') {
      gameAudio.playVictoryFanfare();
    }
  }, [gameState.status]);

  // --- ECONOMY: PURCHASE CARTOGRAPHY MAPS ---
  const buyExpeditionMap = useCallback(
    (mapKey: 'has_map_highlands' | 'has_map_overgrowth', cost: number, mapName: string) => {
      const inv = sanctuaryInventoryRef.current;
      if (inv[mapKey]) return;

      if (inv.coins >= cost) {
        inv.coins -= cost;
        inv[mapKey] = true;
        gameAudio.playLevelUpStinger();
        triggerNotification(`🗺️ Charted ${mapName}! Area unlocked for wilderness excursions!`, '#38bdf8');
        refreshHud();
      } else {
        gameAudio.playErrorBuzz();
        triggerNotification(`Need ${cost} Verdure to purchase ${mapName}! Donate mature bonsais.`, '#ef4444');
      }
    },
    [refreshHud, triggerNotification],
  );

  // --- ECONOMY: PURCHASE SANCTUARY GREENHOUSE EXPANSIONS ---
  const buySanctuaryExpansion = useCallback(
    (targetTier: number, cost: number, name: string) => {
      const inv = sanctuaryInventoryRef.current;
      if (inv.sanctuary_expansion_tier >= targetTier) return;

      if (inv.coins >= cost) {
        inv.coins -= cost;
        inv.sanctuary_expansion_tier = targetTier;
        offscreenTerrainDirtyRef.current = true;
        invalidateSynergiesCache();
        gameAudio.playPowerupChime();
        triggerNotification(`🏡 Expanded Sanctuary! ${name} unlocked!`, '#10b981');
        refreshHud();
      } else {
        gameAudio.playErrorBuzz();
        triggerNotification(`Need ${cost} Verdure to purchase ${name}! Donate cultivated trees.`, '#ef4444');
      }
    },
    [refreshHud, triggerNotification],
  );

  // --- ECOLOGICAL RESTORATION: DONATE BONSAI (PLANTED OR STORED) ---
  const donatePlantedBonsai = useCallback(
    (bonsaiId: string) => {
      const bonsaiIdx = plantedBonsaisRef.current.findIndex((b) => b.id === bonsaiId);
      if (bonsaiIdx === -1) return;

      const bonsai = plantedBonsaisRef.current[bonsaiIdx];
      const payout = calculateDonationValue(bonsai);

      const inv = sanctuaryInventoryRef.current;
      if (bonsai.automatonTier > 0) {
        const oldKey =
          bonsai.automatonTier === 1
            ? 'automatons_tier1'
            : bonsai.automatonTier === 2
            ? 'automatons_tier2'
            : 'automatons_tier3';
        inv[oldKey] += 1;
      }

      inv.coins += payout;
      plantedBonsaisRef.current.splice(bonsaiIdx, 1);
      invalidateSynergiesCache();

      gameAudio.playCoinPickup();
      addFloatingText(bonsai.x, bonsai.y - 50, `+${payout} Verdure!`, '#34d399');
      triggerNotification(
        `🌱 Donated ${bonsai.name} (Lv.${bonsai.level}) to ecological restoration for +${payout} Verdure!${bonsai.automatonTier > 0 ? ' (Automaton returned to inventory)' : ''}`,
        '#10b981',
      );

      if (inspectingBonsaiId === bonsaiId) {
        setInspectingBonsaiId(null);
      }
      refreshHud();
    },
    [addFloatingText, inspectingBonsaiId, refreshHud, triggerNotification],
  );
  const sellPlantedBonsai = donatePlantedBonsai;

  const donateStoredPottedBonsai = useCallback(
    (storedId: string) => {
      const idx = storedPottedBonsaisRef.current.findIndex((b) => b.id === storedId);
      if (idx === -1) return;

      const bonsai = storedPottedBonsaisRef.current[idx];
      const payout = calculateDonationValue(bonsai);

      sanctuaryInventoryRef.current.coins += payout;
      storedPottedBonsaisRef.current.splice(idx, 1);
      sanctuaryInventoryRef.current.storedBonsais = storedPottedBonsaisRef.current;

      gameAudio.playCoinPickup();
      triggerNotification(`🌱 Donated stored ${bonsai.name} (Lv.${bonsai.level}) to ecological restoration for +${payout} Verdure!`, '#10b981');
      refreshHud();
    },
    [refreshHud, triggerNotification],
  );
  const sellStoredPottedBonsai = donateStoredPottedBonsai;

  // --- PICK UP BONSAI INTO INVENTORY ---
  const pickUpBonsaiToInventory = useCallback(
    (bonsaiId: string) => {
      const bonsaiIdx = plantedBonsaisRef.current.findIndex((b) => b.id === bonsaiId);
      if (bonsaiIdx === -1) return;

      const bonsai = plantedBonsaisRef.current[bonsaiIdx];
      const inv = sanctuaryInventoryRef.current;

      if (bonsai.automatonTier > 0) {
        const oldKey =
          bonsai.automatonTier === 1
            ? 'automatons_tier1'
            : bonsai.automatonTier === 2
            ? 'automatons_tier2'
            : 'automatons_tier3';
        inv[oldKey] += 1;
      }

      storedPottedBonsaisRef.current.push({
        id: bonsai.id,
        leafType: bonsai.leafType,
        group: bonsai.group,
        species: bonsai.species || bonsai.leafType,
        style: bonsai.style || 'MOYOGI',
        maturity: bonsai.maturity || 'sprout',
        name: bonsai.name,
        rarity: bonsai.rarity,
        nature: bonsai.nature,
        level: bonsai.level,
        progressSeconds: bonsai.progressSeconds,
        color: bonsai.color,
        flowerColor: bonsai.flowerColor,
        potColor: bonsai.potColor,
        potStyle: bonsai.potStyle,
        findOdds: bonsai.findOdds,
        attributes: bonsai.attributes || { ...DEFAULT_BONSAI_ATTRIBUTES },
        cultivationPotential: bonsai.cultivationPotential || { ...DEFAULT_CULTIVATION_POTENTIAL },
      });
      sanctuaryInventoryRef.current.storedBonsais = storedPottedBonsaisRef.current;

      plantedBonsaisRef.current.splice(bonsaiIdx, 1);
      invalidateSynergiesCache();
      setInspectingBonsaiId(null);
      gameAudio.playConfirmSelect();
      addFloatingText(bonsai.x, bonsai.y - 45, `+1 ${bonsai.name} Stored!`, '#38bdf8');
      triggerNotification(
        `🪴 Uprooted ${bonsai.name} (Lv.${bonsai.level}) to Storage! Can be replanted anywhere later with all levels intact.`,
        '#38bdf8',
      );
      refreshHud();
    },
    [addFloatingText, refreshHud, triggerNotification],
  );

  // --- ROVER UPGRADES ---
  const getRoverBatteryCost = useCallback((lvl: number) => {
    return Math.round(120 * Math.pow(1.5, lvl));
  }, []);

  const getRoverCargoCost = useCallback((lvl: number) => {
    return Math.round(150 * Math.pow(1.5, lvl));
  }, []);

  const buyRoverBatteryUpgrade = useCallback(() => {
    const inv = sanctuaryInventoryRef.current;
    const cost = getRoverBatteryCost(inv.rover_battery_level);

    if (inv.coins >= cost) {
      inv.coins -= cost;
      inv.rover_battery_level += 1;
      gameAudio.playPowerupChime();
      triggerNotification(
        `🚙 Rover Battery Upgraded to Level ${inv.rover_battery_level}! Max Battery: ${getMaxRoverBattery()} kWh`,
        '#f59e0b',
      );
      refreshHud();
    } else {
      gameAudio.playErrorBuzz();
      triggerNotification(`Need ${cost} Verdure to upgrade Battery! Donate mature bonsais.`, '#ef4444');
    }
  }, [getMaxRoverBattery, getRoverBatteryCost, refreshHud, triggerNotification]);

  const buyRoverCargoUpgrade = useCallback(() => {
    const inv = sanctuaryInventoryRef.current;
    const cost = getRoverCargoCost(inv.rover_cargo_level);

    if (inv.coins >= cost) {
      inv.coins -= cost;
      inv.rover_cargo_level += 1;
      gameAudio.playPowerupChime();
      triggerNotification(
        `🚙 Rover Cargo Bed Upgraded to Level ${inv.rover_cargo_level}! Max Capacity: ${getMaxRoverCargo()} kg`,
        '#38bdf8',
      );
      refreshHud();
    } else {
      gameAudio.playErrorBuzz();
      triggerNotification(`Need ${cost} Verdure to upgrade Cargo Bed! Donate mature bonsais.`, '#ef4444');
    }
  }, [getMaxRoverCargo, getRoverCargoCost, refreshHud, triggerNotification]);

  // --- MODULAR ROVER LOADOUT ATTACH & DETACH SYSTEM ---
  const attachRoverModule = useCallback((modType: RoverModuleType) => {
    const inv = sanctuaryInventoryRef.current;
    const attached = inv.attached_rover_modules || [];
    const maxSlots = getRoverChassisMaxSlots(inv.rover_chassis_tier || 1);

    if (attached.length >= maxSlots) {
      gameAudio.playErrorBuzz();
      triggerNotification(`Rover chassis slots full (${attached.length}/${maxSlots})! Upgrade to higher chassis tier at Workbench.`, '#ef4444');
      return;
    }

    const available = inv.rover_modules[modType] || 0;
    if (available <= 0) {
      gameAudio.playErrorBuzz();
      triggerNotification(`No unattached ${ROVER_MODULE_CONFIGS[modType].name} in storage! Craft one at Workbench.`, '#ef4444');
      return;
    }

    inv.rover_modules[modType] = available - 1;
    if (inv.roverModules) inv.roverModules[modType] = inv.rover_modules[modType];
    attached.push(modType);
    inv.attached_rover_modules = [...attached];
    inv.attachedRoverModules = inv.attached_rover_modules;

    gameAudio.playConfirmSelect();
    const cfg = ROVER_MODULE_CONFIGS[modType];
    triggerNotification(`⚙️ Attached ${cfg.name} (${cfg.bonusLabel})! Slots: ${attached.length}/${maxSlots}`, '#38bdf8');
    refreshHud();
  }, [refreshHud, triggerNotification]);

  const detachRoverModule = useCallback((slotIdx: number) => {
    const inv = sanctuaryInventoryRef.current;
    const attached = inv.attached_rover_modules || [];
    if (slotIdx < 0 || slotIdx >= attached.length) return;

    const [detached] = attached.splice(slotIdx, 1);
    inv.attached_rover_modules = [...attached];
    inv.attachedRoverModules = inv.attached_rover_modules;
    inv.rover_modules[detached] = (inv.rover_modules[detached] || 0) + 1;
    if (inv.roverModules) inv.roverModules[detached] = inv.rover_modules[detached];

    gameAudio.playCrispClick();
    const cfg = ROVER_MODULE_CONFIGS[detached];
    triggerNotification(`📦 Detached ${cfg.name}! Module returned to storage.`, '#f59e0b');
    refreshHud();
  }, [refreshHud, triggerNotification]);

  // --- ORGANIC WASTE & LEVEL-UP DISPATCHER ---
  const handleBonsaiLevelUp = useCallback(
    (bonsai: PlantedBonsai) => {
      bonsai.level += 1;

      // Calculate Proximity Synergies
      const synergies = getCachedBonsaiSynergies(bonsai);

      // Track Zen Milestones and Statistics
      const stats = statsRef.current;
      stats.totalLevelUps += 1;
      recordBondexEntry(bonsai.leafType, bonsai.maturity, bonsai.style);
      if (bonsai.level >= 10) {
        if (!stats.maxSpecimensGrownLv10.includes(bonsai.id)) {
          stats.maxSpecimensGrownLv10.push(bonsai.id);
        }
        const lt = bonsai.leafType || 'circle';
        const st = bonsai.style || 'MOYOGI';
        if (!stats.leafTypeStylesGrown[lt]) {
          stats.leafTypeStylesGrown[lt] = [];
        }
        if (!stats.leafTypeStylesGrown[lt].includes(st)) {
          stats.leafTypeStylesGrown[lt].push(st);
        }
        stats.groupBonsaisGrown[bonsai.group] = (stats.groupBonsaisGrown[bonsai.group] || 0) + 1;
      }
      if (bonsai.level >= 25 && !stats.maxSpecimensGrownLv25.includes(bonsai.id)) {
        stats.maxSpecimensGrownLv25.push(bonsai.id);
      }
      if (bonsai.level >= 50 && !stats.maxSpecimensGrownLv50.includes(bonsai.id)) {
        stats.maxSpecimensGrownLv50.push(bonsai.id);
      }
      if (bonsai.level >= 10 && (bonsai.maturity || 'sprout') === 'sprout') {
        if (!stats.sproutLv10Ids) stats.sproutLv10Ids = [];
        if (!stats.sproutLv10Ids.includes(bonsai.id)) stats.sproutLv10Ids.push(bonsai.id);
      }
      if (bonsai.level >= 15 && bonsai.maturity === 'sapling') {
        if (!stats.saplingLv15Ids) stats.saplingLv15Ids = [];
        if (!stats.saplingLv15Ids.includes(bonsai.id)) stats.saplingLv15Ids.push(bonsai.id);
      }
      if (bonsai.level >= 20 && bonsai.maturity === 'notable') {
        if (!stats.notableLv20Ids) stats.notableLv20Ids = [];
        if (!stats.notableLv20Ids.includes(bonsai.id)) stats.notableLv20Ids.push(bonsai.id);
      }
      if (bonsai.level >= 25 && bonsai.maturity === 'refined') {
        if (!stats.refinedLv25Ids) stats.refinedLv25Ids = [];
        if (!stats.refinedLv25Ids.includes(bonsai.id)) stats.refinedLv25Ids.push(bonsai.id);
      }
      if (bonsai.level >= 30 && bonsai.maturity === 'premium') {
        if (!stats.premiumLv30Ids) stats.premiumLv30Ids = [];
        if (!stats.premiumLv30Ids.includes(bonsai.id)) stats.premiumLv30Ids.push(bonsai.id);
      }
      if (bonsai.level >= 100) {
        stats.firstLevel100Reached = true;
      }

      // 1. Produce strictly +1 Organic Waste per level & advance Cultivation Potential (ONLY from adjacent Crystal Pedestals)
      if (!bonsai.cultivationPotential) {
        bonsai.cultivationPotential = { foliage: 0, branches: 0, trunk: 0, roots: 0 };
      }
      const c1 = Math.round((bonsai.x - SANCTUARY_GRID.startX) / SANCTUARY_GRID.cellW);
      const r1 = Math.round((bonsai.y - SANCTUARY_GRID.startY) / SANCTUARY_GRID.cellH);
      const adjacentPedestals = deployedStructuresRef.current.filter((d) => {
        if (!d.type.startsWith('crystal_pedestal')) return false;
        const c2 = Math.round((d.x - SANCTUARY_GRID.startX) / SANCTUARY_GRID.cellW);
        const r2 = Math.round((d.y - SANCTUARY_GRID.startY) / SANCTUARY_GRID.cellH);
        return Math.abs(c1 - c2) <= 1 && Math.abs(r1 - r2) <= 1;
      });

      const foliageBonus = adjacentPedestals.filter((d) => d.type === 'crystal_pedestal_foliage').length;
      const branchesBonus = adjacentPedestals.filter((d) => d.type === 'crystal_pedestal_branches').length;
      const trunkBonus = adjacentPedestals.filter((d) => d.type === 'crystal_pedestal_trunk').length;
      const rootsBonus = adjacentPedestals.filter((d) => d.type === 'crystal_pedestal_roots').length;

      const cp = bonsai.cultivationPotential;
      cp.foliage = Math.min(1000, (cp.foliage || 0) + foliageBonus);
      cp.branches = Math.min(1000, (cp.branches || 0) + branchesBonus);
      cp.trunk = Math.min(1000, (cp.trunk || 0) + trunkBonus);
      cp.roots = Math.min(1000, (cp.roots || 0) + rootsBonus);

      const totalBonus = foliageBonus + branchesBonus + trunkBonus + rootsBonus;
      if (totalBonus > 0) {
        addFloatingText(
          bonsai.x + (Math.random() - 0.5) * 20,
          bonsai.y - 105,
          `💎 +${totalBonus} Halo Potential!`,
          '#c084fc',
        );
      }

      const inv = sanctuaryInventoryRef.current;
      inv.organic_waste += 1;
      inv.organicWaste = inv.organic_waste;

      // 2. Botanist EXP Reward with XP Boosted (Bush) synergy multiplier
      const baseExpReward = 25 + 2 * bonsai.level;
      const expReward = Math.round(baseExpReward * synergies.expMultiplier);
      gainPlayerExp(expReward);

      gameAudio.playLevelUpStinger();
      addFloatingText(
        bonsai.x,
        bonsai.y - 65,
        `★ Tree Level ${bonsai.level}! (+${expReward} EXP) ★`,
        '#10b981',
      );
      addFloatingText(
        bonsai.x + (Math.random() - 0.5) * 30,
        bonsai.y - 85,
        `+1 🍂 Organic Waste`,
        '#a3e635',
      );

      // Organic waste floating leaf particles
      for (let i = 0; i < 4; i++) {
        const pAngle = Math.random() * Math.PI * 2;
        const pSpeed = 30 + Math.random() * 40;
        emitParticle(
          bonsai.x,
          bonsai.y - 20,
          Math.cos(pAngle) * pSpeed,
          Math.sin(pAngle) * pSpeed - 20,
          3 + Math.random() * 2,
          '#84cc16',
          0.8,
        );
      }

      triggerNotification(`🌱 ${bonsai.name} grew to Level ${bonsai.level}! (+1 🍂 Organic Waste Collected)`, '#84cc16');

      // Win Condition: Cultivate any Premium (五, Rank V) Bonsai to Level 100!
      if (bonsai.maturity === 'premium' && bonsai.level >= 100) {
        setGameState((prev) => ({
          ...prev,
          status: 'VICTORY',
          score: prev.score + 100000,
        }));
      }
    },
    [addFloatingText, gainPlayerExp, triggerNotification],
  );

  // --- PROGRESSION ADVANCE WITH LEVEL OVERFLOW ROLLOVER ---
  const advanceBonsaiProgress = useCallback(
    (bonsai: PlantedBonsai, addSeconds = 0) => {
      if (bonsai.level >= 100) {
        bonsai.progressSeconds = 0;
        return;
      }
      bonsai.progressSeconds += addSeconds;
      while (bonsai.level < 100) {
        const targetSeconds = getBonsaiLevelGrowthNeeded(bonsai.level, bonsai.maturity);
        if (bonsai.progressSeconds >= targetSeconds) {
          bonsai.progressSeconds -= targetSeconds;
          handleBonsaiLevelUp(bonsai);
        } else {
          break;
        }
      }
      if (bonsai.level >= 100) {
        bonsai.progressSeconds = 0;
      }
    },
    [handleBonsaiLevelUp],
  );

  // --- APPLY ENRICHED ORGANIC COMPOST ---
  const applyOrganicCompost = useCallback(
    (bonsaiId: string) => {
      const bonsai = plantedBonsaisRef.current.find((b) => b.id === bonsaiId);
      if (!bonsai) return;

      const inv = sanctuaryInventoryRef.current;
      if (inv.organic_compost <= 0) {
        gameAudio.playErrorBuzz();
        triggerNotification('No Enriched Organic Compost in stock! Craft at Workbench.', '#ef4444');
        return;
      }

      if (bonsai.level >= 100) {
        triggerNotification('Bonsai is already at Maximum Level 100 Mastery!', '#10b981');
        return;
      }

      const synergies = getCachedBonsaiSynergies(bonsai);

      if (synergies.isStalled) {
        gameAudio.playErrorBuzz();
        addFloatingText(bonsai.x, bonsai.y - 45, '⛔ Growth Stalled!', '#f43f5e');
        triggerNotification(
          `⛔ Cannot advance growth: Stalled by repetitive surroundings! (>4 ${synergies.stalledEntityLabel || 'identical neighbors'})`,
          '#ef4444',
        );
        return;
      }

      inv.organic_compost -= 1;
      inv.enrichedCompost = inv.organic_compost;
      gameAudio.playPowerupChime();

      // Shave off 30s or 25% of level countdown (scaled by Maturity growth threshold)
      const targetSeconds = getBonsaiLevelGrowthNeeded(bonsai.level, bonsai.maturity);
      const timeReduction = Math.max(30, targetSeconds * 0.25);

      // Award Botanist EXP with synergy multiplier
      const expReward = Math.round(15 * synergies.expMultiplier);
      gainPlayerExp(expReward, 'Compost');

      for (let i = 0; i < 6; i++) {
        const pAngle = Math.random() * Math.PI * 2;
        const pSpeed = 40 + Math.random() * 50;
        emitParticle(
          bonsai.x,
          bonsai.y - 10,
          Math.cos(pAngle) * pSpeed,
          Math.sin(pAngle) * pSpeed - 25,
          3 + Math.random() * 3,
          '#84cc16',
          0.6,
        );
      }

      addFloatingText(bonsai.x, bonsai.y - 45, `🌾 -${timeReduction.toFixed(0)}s Boost! (+${expReward} EXP)`, '#84cc16');
      triggerNotification(`🌾 Applied Organic Compost to ${bonsai.name}! Shaved -${timeReduction.toFixed(0)}s (+${expReward} EXP)`, '#84cc16');

      // Advance progress with overflow carryover
      advanceBonsaiProgress(bonsai, timeReduction);

      refreshHud();
    },
    [addFloatingText, advanceBonsaiProgress, gainPlayerExp, refreshHud, triggerNotification],
  );

  // --- ECONOMY: BUY GUIDEBOOKS & BLUEPRINTS ---
  const buyGuidebook = useCallback(
    (
      guideKey:
        | 'has_compost_guide'
        | 'has_tier1_guide'
        | 'has_tier2_guide'
        | 'has_tier3_guide'
        | 'has_auto_fabricator_guide'
        | 'has_workbench_t2_guide'
        | 'has_workbench_t3_guide'
        | 'has_rover_t2_blueprint'
        | 'has_rover_t3_blueprint'
        | 'has_storage_module_1_guide'
        | 'has_storage_module_2_guide'
        | 'has_storage_module_3_guide'
        | 'has_battery_module_1_guide'
        | 'has_battery_module_2_guide'
        | 'has_battery_module_3_guide'
        | 'has_radar_module_1_guide'
        | 'has_radar_module_2_guide'
        | 'has_radar_module_3_guide',
      cost: number,
      title: string,
    ) => {
      const inv = sanctuaryInventoryRef.current;
      if (inv[guideKey]) return;

      if (inv.coins >= cost) {
        inv.coins -= cost;
        inv[guideKey] = true;
        gameAudio.playLevelUpStinger();
        triggerNotification(`📚 ${title} Acquired! Recipe unlocked at Workbench.`, '#10b981');
        refreshHud();
      } else {
        gameAudio.playErrorBuzz();
        triggerNotification(`Need ${cost} Verdure to purchase ${title}!`, '#ef4444');
      }
    },
    [refreshHud, triggerNotification],
  );

  const buyCompostGuide = useCallback(
    (cost: number) => {
      buyGuidebook('has_compost_guide', cost, 'Master Composting Guidebook');
    },
    [buyGuidebook],
  );

  // --- MODULAR WORKBENCH LOADOUT ATTACH & DETACH SYSTEM ---
  const attachCraftingArm = useCallback(() => {
    const inv = sanctuaryInventoryRef.current;
    if (inv.crafting_automatons_inv <= 0) {
      gameAudio.playErrorBuzz();
      triggerNotification('No Crafting Assembly Automatons in inventory! Craft one first.', '#ef4444');
      return;
    }

    const currentTotal = installedCraftingArmsRef.current + autoFabricatorLanesRef.current.length;
    const maxCapacity = getWorkbenchAutomatonCapacity(inv.workbench_tier || 1);
    if (currentTotal >= maxCapacity) {
      gameAudio.playErrorBuzz();
      triggerNotification(`Workbench capacity reached (${currentTotal}/${maxCapacity})! Upgrade to next tier.`, '#ef4444');
      return;
    }

    inv.crafting_automatons_inv -= 1;
    installedCraftingArmsRef.current += 1;
    gameAudio.playPowerupChime();
    triggerNotification('🤖 Attached Crafting Assembly Arm (+25% craft speed, +1 queue slot, 3 kW).', '#38bdf8');
    refreshHud();
  }, [refreshHud, triggerNotification]);

  const detachCraftingArm = useCallback(() => {
    if (installedCraftingArmsRef.current <= 0) return;

    installedCraftingArmsRef.current -= 1;
    sanctuaryInventoryRef.current.crafting_automatons_inv += 1;
    gameAudio.playCrispClick();
    triggerNotification('🤖 Detached Crafting Assembly Arm (Returned to inventory).', '#f59e0b');
    refreshHud();
  }, [refreshHud, triggerNotification]);

  const attachAutoFabricatorLane = useCallback(() => {
    const inv = sanctuaryInventoryRef.current;
    if (inv.auto_fabricators_inv <= 0) {
      gameAudio.playErrorBuzz();
      triggerNotification('No Auto-Fabrication Automatons in inventory! Craft one first.', '#ef4444');
      return;
    }

    const currentTotal = installedCraftingArmsRef.current + autoFabricatorLanesRef.current.length;
    const maxCapacity = getWorkbenchAutomatonCapacity(inv.workbench_tier || 1);
    if (currentTotal >= maxCapacity) {
      gameAudio.playErrorBuzz();
      triggerNotification(`Workbench capacity reached (${currentTotal}/${maxCapacity})! Upgrade to next tier.`, '#ef4444');
      return;
    }

    inv.auto_fabricators_inv -= 1;
    const newLane: AutoFabricatorLane = {
      id: `lane_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      targetRecipeId: 'craft_enriched_compost',
      progressSeconds: 0,
    };
    autoFabricatorLanesRef.current.push(newLane);

    gameAudio.playPowerupChime();
    triggerNotification('🏭 Installed Automated Production Lane! Select target recipe to begin loop.', '#38bdf8');
    refreshHud();
  }, [refreshHud, triggerNotification]);

  const detachAutoFabricatorLane = useCallback((laneId: string) => {
    const idx = autoFabricatorLanesRef.current.findIndex((l) => l.id === laneId);
    if (idx === -1) return;

    autoFabricatorLanesRef.current.splice(idx, 1);
    sanctuaryInventoryRef.current.auto_fabricators_inv += 1;
    gameAudio.playCrispClick();
    triggerNotification('🏭 Detached Auto-Fabrication Lane (Unit returned to inventory).', '#f59e0b');
    refreshHud();
  }, [refreshHud, triggerNotification]);

  const setAutoFabricatorLaneRecipe = useCallback((laneId: string, recipeId: CraftingRecipeId | 'none') => {
    const lane = autoFabricatorLanesRef.current.find((l) => l.id === laneId);
    if (!lane) return;

    lane.targetRecipeId = recipeId;
    lane.progressSeconds = 0;
    gameAudio.playConfirmSelect();
    const rName = recipeId !== 'none' ? WORKBENCH_RECIPES[recipeId]?.name || recipeId : 'Halted / None';
    triggerNotification(`Lane assigned recipe: ${rName}`, '#10b981');
    refreshHud();
  }, [refreshHud, triggerNotification]);

  // --- ECONOMY: PURCHASE GARDEN DECORATIONS ---
  const buyDecoration = useCallback(
    (
      decorType:
        | 'decor_pebble_path'
        | 'decor_rock_formation'
        | 'decor_shrubbery_bush'
        | 'decor_woven_wall'
        | 'torii_gate'
        | 'crystal_pedestal_foliage'
        | 'crystal_pedestal_branches'
        | 'crystal_pedestal_trunk'
        | 'crystal_pedestal_roots',
      cost: number,
      name: string,
    ) => {
      const inv = sanctuaryInventoryRef.current;
      if (inv.coins >= cost) {
        inv.coins -= cost;
        const key = `${decorType}_inv`;
        inv[key] = (inv[key] || 0) + 1;
        if (decorType === 'decor_pebble_path') inv.decorations.pebblePath = (inv.decorations.pebblePath || 0) + 1;
        else if (decorType === 'decor_rock_formation') inv.decorations.rockFormation = (inv.decorations.rockFormation || 0) + 1;
        else if (decorType === 'decor_shrubbery_bush') inv.decorations.shrubbery = (inv.decorations.shrubbery || 0) + 1;
        else if (decorType === 'decor_woven_wall') inv.decorations.wovenWall = (inv.decorations.wovenWall || 0) + 1;
        else if (decorType === 'torii_gate') inv.decorations.toriiGate = (inv.decorations.toriiGate || 0) + 1;

        gameAudio.playCoinPickup();
        triggerNotification(`🎋 Claimed ${name}! (+1 added to Inventory)`, '#10b981');
        refreshHud();
      } else {
        gameAudio.playErrorBuzz();
        triggerNotification(`Need ${cost} Verdure to purchase ${name}! Donate mature bonsais.`, '#ef4444');
      }
    },
    [refreshHud, triggerNotification],
  );

  // --- ECONOMY: PURCHASE NURSERY TOOLS (COMPOST HEAP & STONE WELL) ---
  const buyTool = useCallback(
    (toolType: 'tool_compost_heap' | 'tool_garden_well', cost: number, name: string) => {
      const inv = sanctuaryInventoryRef.current;
      if (inv.coins >= cost) {
        inv.coins -= cost;
        const key = `${toolType}_inv`;
        inv[key] = (inv[key] || 0) + 1;
        if (!inv.tools) inv.tools = { compostHeap: 0, gardenWell: 0 };
        if (toolType === 'tool_compost_heap') {
          inv.tools.compostHeap = (inv.tools.compostHeap || 0) + 1;
        } else {
          inv.tools.gardenWell = (inv.tools.gardenWell || 0) + 1;
        }
        gameAudio.playCoinPickup();
        triggerNotification(`🔧 Purchased ${name}! (+1 added to Tools inventory)`, '#10b981');
        refreshHud();
      } else {
        gameAudio.playErrorBuzz();
        triggerNotification(`Need ${cost} Verdure to purchase ${name}! Donate mature bonsais.`, '#ef4444');
      }
    },
    [refreshHud, triggerNotification],
  );

  // --- PLACEABLE SOLAR PANELS, TURBINES, TOOLS & GARDEN DECORATIONS (PHYSICAL DEPLOYMENT & DISMANTLE) ---
  const deployStructureOnGrid = useCallback(
    (type: DeployedStructureType) => {
      const inv = sanctuaryInventoryRef.current;
      const key = getInventoryStructureKey(type);
      const stock = getStructureInventoryCount(inv, type);

      if (stock <= 0) {
      const itemLabels: Record<string, string> = {
        solar_panel: 'Solar Panels',
        wind_turbine: 'Wind Turbines',
        decor_pebble_path: 'Zen Pebble Stepping Paths',
        decor_rock_formation: 'Zen Rock Formations',
        decor_shrubbery_bush: 'Topiary Shrubbery Bushes',
        decor_woven_wall: 'Woven Wooden Lattice Walls',
        torii_gate: 'Torii Gates',
        tool_compost_heap: 'Compost Heaps',
        tool_garden_well: 'Stone Wells',
        crystal_pedestal_foliage: 'Emerald Leaf Crystal Pedestals',
        crystal_pedestal_branches: 'Amber Branch Crystal Pedestals',
        crystal_pedestal_trunk: 'Coral Trunk Crystal Pedestals',
        crystal_pedestal_roots: 'Azure Root Crystal Pedestals',
      };
      gameAudio.playErrorBuzz();
      triggerNotification(`No ${itemLabels[type] || 'items'} in stock! Purchase or craft first.`, '#ef4444');
      return;
    }

    const av = avatarRef.current;
    const currentPlot = getPlotAtCoords(av.x, av.y, inv.sanctuary_expansion_tier || 0);

    if (!currentPlot) {
      gameAudio.playErrorBuzz();
      triggerNotification('Walk onto the nursery grid plots to deploy!', '#ef4444');
      return;
    }

    if (!currentPlot.isUnlocked) {
      gameAudio.playErrorBuzz();
      triggerNotification('🔒 Locked Plot - Purchase Greenhouse Expansions at the Botanical Market!', '#f59e0b');
      return;
    }

    const snapX = currentPlot.centerX;
    const snapY = currentPlot.centerY;

    const isTreeOccupied = plantedBonsaisRef.current.some(
      (b) => Math.hypot(b.x - snapX, b.y - snapY) < 30,
    );
    const isStructureOccupied = deployedStructuresRef.current.some((s) => {
      if (s.type === 'torii_gate') {
        if (s.orientation === 'vertical') {
          return (
            Math.hypot(s.x - snapX, (s.y - SANCTUARY_GRID.cellH) - snapY) < 30 ||
            Math.hypot(s.x - snapX, (s.y + SANCTUARY_GRID.cellH) - snapY) < 30
          );
        } else {
          return (
            Math.hypot((s.x - SANCTUARY_GRID.cellW) - snapX, s.y - snapY) < 30 ||
            Math.hypot((s.x + SANCTUARY_GRID.cellW) - snapX, s.y - snapY) < 30
          );
        }
      }
      return Math.hypot(s.x - snapX, s.y - snapY) < 30;
    });

      const nearWb =
        snapX >= sanctuaryWorkbench.x - 30 &&
        snapX <= sanctuaryWorkbench.x + sanctuaryWorkbench.width + 30 &&
        snapY >= sanctuaryWorkbench.y - 30 &&
        snapY <= sanctuaryWorkbench.y + sanctuaryWorkbench.height + 30;

      const nearZenLib =
        snapX >= sanctuaryZenLibrary.x - 30 &&
        snapX <= sanctuaryZenLibrary.x + sanctuaryZenLibrary.width + 30 &&
        snapY >= sanctuaryZenLibrary.y - 30 &&
        snapY <= sanctuaryZenLibrary.y + sanctuaryZenLibrary.height + 30;

      const nearSociety =
        snapX >= sanctuaryBonsaiSociety.x - 30 &&
        snapX <= sanctuaryBonsaiSociety.x + sanctuaryBonsaiSociety.width + 30 &&
        snapY >= sanctuaryBonsaiSociety.y - 30 &&
        snapY <= sanctuaryBonsaiSociety.y + sanctuaryBonsaiSociety.height + 30;

      const nearGarage =
        snapX >= sanctuaryRoverGarage.x - 30 &&
        snapX <= sanctuaryRoverGarage.x + sanctuaryRoverGarage.width + 30 &&
        snapY >= sanctuaryRoverGarage.y - 30 &&
        snapY <= sanctuaryRoverGarage.y + sanctuaryRoverGarage.height + 30;

      const nearShop =
        snapX >= sanctuaryShopStand.x - 30 &&
        snapX <= sanctuaryShopStand.x + sanctuaryShopStand.width + 30 &&
        snapY >= sanctuaryShopStand.y - 30 &&
        snapY <= sanctuaryShopStand.y + sanctuaryShopStand.height + 30;

      if (isTreeOccupied || isStructureOccupied || nearWb || nearZenLib || nearSociety || nearGarage || nearShop) {
        gameAudio.playErrorBuzz();
        triggerNotification('Grid plot is occupied or blocked! Stand over an empty nursery plot.', '#ef4444');
        return;
      }

      inv[key] = Math.max(0, (inv[key] ?? stock) - 1);
      if (type === 'solar_panel') {
        inv.solar_panels_inv = inv[key];
        inv.solar_panel_inv = inv[key];
        inv.solarPanels = inv[key];
      } else if (type === 'wind_turbine') {
        inv.wind_turbines_inv = inv[key];
        inv.wind_turbine_inv = inv[key];
        inv.windTurbines = inv[key];
      } else if (type === 'tool_compost_heap') {
        inv.tool_compost_heap_inv = inv[key];
        if (inv.tools) inv.tools.compostHeap = inv[key];
      } else if (type === 'tool_garden_well') {
        inv.tool_garden_well_inv = inv[key];
        if (inv.tools) inv.tools.gardenWell = inv[key];
      }      else if (type === 'decor_pebble_path') inv.decorations.pebblePath = Math.max(0, (inv.decorations.pebblePath || 0) - 1);
      else if (type === 'decor_rock_formation') inv.decorations.rockFormation = Math.max(0, (inv.decorations.rockFormation || 0) - 1);
      else if (type === 'decor_shrubbery_bush') inv.decorations.shrubbery = Math.max(0, (inv.decorations.shrubbery || 0) - 1);
      else if (type === 'decor_woven_wall') inv.decorations.wovenWall = Math.max(0, (inv.decorations.wovenWall || 0) - 1);
      else if (type === 'torii_gate') {
        if (inv.decorations) inv.decorations.toriiGate = Math.max(0, (inv.decorations.toriiGate || 1) - 1);
      }

      const newStruct: DeployedStructure = {
        id: `struct_${type}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        type,
        x: snapX,
        y: snapY,
        gridX: snapX,
        gridY: snapY,
        variant: type === 'decor_pebble_path' ? Math.floor(Math.random() * 5) : 0,
        depositedWaste: type === 'tool_compost_heap' ? 0 : undefined,
        maxCapacity: type === 'tool_compost_heap' ? 20 : undefined,
        timer: type === 'tool_compost_heap' ? 0 : undefined,
        readyCompost: type === 'tool_compost_heap' ? 0 : undefined,
        activeWateringRemaining: type === 'tool_garden_well' ? 0 : undefined,
        totalActiveDuration: type === 'tool_garden_well' ? 20 : undefined,
        cooldownRemaining: type === 'tool_garden_well' ? 0 : undefined,
      };
      deployedStructuresRef.current.push(newStruct);
      invalidateSynergiesCache();

      setIsPlantingModalOpen(false);
      setIsUnifiedStorageOpen(false);
      gameAudio.playPowerupChime();

      const particleColor =
        type === 'solar_panel'
          ? '#38bdf8'
          : type === 'wind_turbine'
          ? '#f59e0b'
          : type === 'tool_compost_heap'
          ? '#84cc16'
          : type === 'tool_garden_well'
          ? '#0ea5e9'
          : type === 'decor_shrubbery_bush'
          ? '#10b981'
          : type === 'decor_pebble_path'
          ? '#94a3b8'
          : type === 'decor_rock_formation'
          ? '#f59e0b'
          : type === 'crystal_pedestal_foliage'
          ? '#22c55e'
          : type === 'crystal_pedestal_branches'
          ? '#eab308'
          : type === 'crystal_pedestal_trunk'
          ? '#ef4444'
          : type === 'crystal_pedestal_roots'
          ? '#3b82f6'
          : '#d97706';

      for (let i = 0; i < 6; i++) {
        const pAngle = Math.random() * Math.PI * 2;
        const pSpeed = 30 + Math.random() * 50;
        emitParticle(
          snapX,
          snapY,
          Math.cos(pAngle) * pSpeed,
          Math.sin(pAngle) * pSpeed - 15,
          3 + Math.random() * 3,
          particleColor,
          0.6,
        );
      }

      const titleMap: Record<string, string> = {
        solar_panel: '☀️ Solar Panel Array (3 kW)',
        wind_turbine: '💨 Wind Turbine Generator (6 kW)',
        tool_compost_heap: '🍂 Compost Heap (20 Capacity)',
        tool_garden_well: '💧 Stone Well (3×3 Irrigation)',
        decor_pebble_path: '🪨 Zen Pebble Stepping Path',
        decor_rock_formation: '🪨 Zen Rock Formation',
        decor_shrubbery_bush: '🌿 Topiary Shrubbery Bush',
        decor_woven_wall: '🎋 Woven Wooden Lattice Wall',
        torii_gate: '⛩️ Torii Gate (3x1)',
        crystal_pedestal_foliage: '💎 Emerald Leaf Crystal Pedestal',
        crystal_pedestal_branches: '💎 Amber Branch Crystal Pedestal',
        crystal_pedestal_trunk: '💎 Coral Trunk Crystal Pedestal',
        crystal_pedestal_roots: '💎 Azure Root Crystal Pedestal',
      };
      const title = titleMap[type] || 'Item';
      addFloatingText(snapX, snapY - 40, `Placed ${title}!`, particleColor);
      triggerNotification(`Placed ${title} on Sanctuary plot! [Q] to Dismantle anytime.`, '#10b981');
      refreshHud();
    },
    [addFloatingText, isGridPlotUnlocked, refreshHud, sanctuaryBonsaiSociety, sanctuaryRoverGarage, sanctuaryShopStand, sanctuaryWorkbench, sanctuaryZenLibrary, snapToSanctuaryGrid, triggerNotification],
  );

  const dismantleDeployedStructure = useCallback(
    (structId: string) => {
      const idx = deployedStructuresRef.current.findIndex((s) => s.id === structId);
      if (idx === -1) return;

      const struct = deployedStructuresRef.current[idx];
      const inv = sanctuaryInventoryRef.current;
      const key = getInventoryStructureKey(struct.type);

      if (struct.type === 'solar_panel') {
        inv.solar_panels_inv = (inv.solar_panels_inv || 0) + 1;
        inv.solar_panel_inv = inv.solar_panels_inv;
        inv.solarPanels = inv.solar_panels_inv;
      } else if (struct.type === 'wind_turbine') {
        inv.wind_turbines_inv = (inv.wind_turbines_inv || 0) + 1;
        inv.wind_turbine_inv = inv.wind_turbines_inv;
        inv.windTurbines = inv.wind_turbines_inv;
      } else if (struct.type === 'tool_compost_heap') {
        inv.tool_compost_heap_inv = (inv.tool_compost_heap_inv || 0) + 1;
        if (inv.tools) inv.tools.compostHeap = inv.tool_compost_heap_inv;
        // Refund deposited waste and ready compost
        if (struct.depositedWaste && struct.depositedWaste > 0) {
          inv.organic_waste = (inv.organic_waste || 0) + struct.depositedWaste;
          inv.organicWaste = inv.organic_waste;
        }
        if (struct.readyCompost && struct.readyCompost > 0) {
          inv.organic_compost = (inv.organic_compost || 0) + struct.readyCompost;
          inv.enrichedCompost = inv.organic_compost;
        }
      } else if (struct.type === 'tool_garden_well') {
        inv.tool_garden_well_inv = (inv.tool_garden_well_inv || 0) + 1;
        if (inv.tools) inv.tools.gardenWell = inv.tool_garden_well_inv;
      } else if (struct.type === 'decor_pebble_path') {
        inv.decor_pebble_path_inv = (inv.decor_pebble_path_inv || 0) + 1;
        if (!inv.decorations) inv.decorations = { pebblePath: 0, rockFormation: 0, shrubbery: 0, wovenWall: 0, toriiGate: 0 };
        inv.decorations.pebblePath = (inv.decorations.pebblePath || 0) + 1;
      } else if (struct.type === 'decor_rock_formation') {
        inv.decor_rock_formation_inv = (inv.decor_rock_formation_inv || 0) + 1;
        if (!inv.decorations) inv.decorations = { pebblePath: 0, rockFormation: 0, shrubbery: 0, wovenWall: 0, toriiGate: 0 };
        inv.decorations.rockFormation = (inv.decorations.rockFormation || 0) + 1;
      } else if (struct.type === 'decor_shrubbery_bush') {
        inv.decor_shrubbery_bush_inv = (inv.decor_shrubbery_bush_inv || 0) + 1;
        if (!inv.decorations) inv.decorations = { pebblePath: 0, rockFormation: 0, shrubbery: 0, wovenWall: 0, toriiGate: 0 };
        inv.decorations.shrubbery = (inv.decorations.shrubbery || 0) + 1;
      } else if (struct.type === 'decor_woven_wall') {
        inv.decor_woven_wall_inv = (inv.decor_woven_wall_inv || 0) + 1;
        if (!inv.decorations) inv.decorations = { pebblePath: 0, rockFormation: 0, shrubbery: 0, wovenWall: 0, toriiGate: 0 };
        inv.decorations.wovenWall = (inv.decorations.wovenWall || 0) + 1;
      } else if (struct.type === 'torii_gate') {
        inv.torii_gate_inv = (inv.torii_gate_inv || 0) + 1;
        if (!inv.decorations) inv.decorations = { pebblePath: 0, rockFormation: 0, shrubbery: 0, wovenWall: 0, toriiGate: 0 };
        inv.decorations.toriiGate = (inv.decorations.toriiGate || 0) + 1;
      } else {
        inv[key] = (inv[key] || 0) + 1;
      }

      deployedStructuresRef.current.splice(idx, 1);
      invalidateSynergiesCache();
      setInspectingStructureId(null);
      gameAudio.playCrispClick();

      const nameMap: Record<string, string> = {
        solar_panel: 'Solar Panel Array',
        wind_turbine: 'Wind Turbine Generator',
        tool_compost_heap: 'Compost Heap',
        tool_garden_well: 'Stone Well',
        decor_pebble_path: 'Zen Pebble Stepping Path',
        decor_rock_formation: 'Zen Rock Formation',
        decor_shrubbery_bush: 'Topiary Shrubbery Bush',
        decor_woven_wall: 'Woven Wooden Lattice Wall',
        torii_gate: '⛩️ Torii Gate',
        crystal_pedestal_foliage: 'Emerald Leaf Crystal Pedestal',
        crystal_pedestal_branches: 'Amber Branch Crystal Pedestal',
        crystal_pedestal_trunk: 'Coral Trunk Crystal Pedestal',
        crystal_pedestal_roots: 'Azure Root Crystal Pedestal',
      };
      const name = nameMap[struct.type] || 'Item';
      addFloatingText(struct.x, struct.y - 40, `+1 ${name} Stored!`, '#38bdf8');
      triggerNotification(`📦 Dismantled ${name}! Returned to Inventory.`, '#38bdf8');
      refreshHud();
    },
    [addFloatingText, refreshHud, triggerNotification],
  );

  // --- COMPOST HEAP INTERACTION METHODS (DIRECT [E] INTERACTION) ---
  const interactCompostHeapDirect = useCallback(
    (structId: string) => {
      const struct = deployedStructuresRef.current.find((s) => s.id === structId);
      if (!struct || struct.type !== 'tool_compost_heap') return;
      const inv = sanctuaryInventoryRef.current;

      const ready = struct.readyCompost || 0;
      if (ready > 0) {
        // Collect all ready compost
        inv.organic_compost = (inv.organic_compost || 0) + ready;
        inv.enrichedCompost = inv.organic_compost;
        struct.readyCompost = 0;
        gameAudio.playCoinPickup();
        addFloatingText(struct.x, struct.y - 45, `+${ready} Enriched Compost`, '#a3e635');
        triggerNotification(`🌾 Collected +${ready} Enriched Compost into Inventory!`, '#84cc16');
        refreshHud();
        return;
      }

      // No ready compost: Deposit up to 20 Organic Waste
      const current = struct.depositedWaste || 0;
      const maxCap = struct.maxCapacity || 20;
      const space = maxCap - current;

      if (space <= 0) {
        gameAudio.playErrorBuzz();
        triggerNotification('Compost Heap is at maximum capacity (20/20)!', '#f59e0b');
        return;
      }

      if ((inv.organic_waste || 0) <= 0) {
        gameAudio.playErrorBuzz();
        triggerNotification('No Organic Waste in inventory! Prune trees or cultivate levels to collect waste.', '#ef4444');
        return;
      }

      const toDeposit = Math.min(space, inv.organic_waste);
      inv.organic_waste -= toDeposit;
      inv.organicWaste = inv.organic_waste;
      struct.depositedWaste = current + toDeposit;

      gameAudio.playConfirmSelect();
      addFloatingText(struct.x, struct.y - 45, `+${toDeposit} Organic Waste Deposited`, '#84cc16');
      triggerNotification(`🍂 Deposited +${toDeposit} Organic Waste into Compost Heap (${struct.depositedWaste}/${maxCap})`, '#84cc16');
      refreshHud();
    },
    [addFloatingText, refreshHud, triggerNotification],
  );

  // --- STONE WELL GROUNDWATER DRAW METHOD (20s DIVIDED ACROSS SURROUNDING BONSAIS) ---
  const drawWaterFromWell = useCallback(
    (structId: string) => {
      const struct = deployedStructuresRef.current.find((s) => s.id === structId);
      if (!struct || struct.type !== 'tool_garden_well') return;

      if ((struct.activeWateringRemaining || 0) > 0) {
        triggerNotification(`Well is currently watering surrounding trees (${(struct.activeWateringRemaining || 0).toFixed(1)}s remaining).`, '#38bdf8');
        return;
      }

      const cWell = Math.round((struct.x - SANCTUARY_GRID.startX) / SANCTUARY_GRID.cellW);
      const rWell = Math.round((struct.y - SANCTUARY_GRID.startY) / SANCTUARY_GRID.cellH);

      const neighborBonsais = plantedBonsaisRef.current.filter((b) => {
        const cB = Math.round((b.x - SANCTUARY_GRID.startX) / SANCTUARY_GRID.cellW);
        const rB = Math.round((b.y - SANCTUARY_GRID.startY) / SANCTUARY_GRID.cellH);
        return (cB !== cWell || rB !== rWell) && Math.abs(cB - cWell) <= 1 && Math.abs(rB - rWell) <= 1;
      });

      if (neighborBonsais.length === 0) {
        gameAudio.playErrorBuzz();
        triggerNotification('No surrounding bonsais to water!', '#f59e0b');
        return;
      }

      // Strict 20.0s total groundwater reservoir divided equally across all surrounding bonsais (strictly no perk multipliers)
      const count = neighborBonsais.length;
      const exactTime = Number((20.0 / count).toFixed(2));
      neighborBonsais.forEach((b) => {
        // Direct assignment, strictly no extra multiplier
        b.wateredTimer = exactTime;

        // Water spray / splash effect on each tree
        for (let i = 0; i < 3; i++) {
          const pAngle = Math.random() * Math.PI * 2;
          emitParticle(
            b.x + (Math.random() - 0.5) * 16,
            b.y - 15,
            Math.cos(pAngle) * 20,
            Math.sin(pAngle) * 20 - 10,
            2.5,
            '#38bdf8',
            0.45,
          );
        }
      });

      struct.activeWateringRemaining = exactTime;
      struct.totalActiveDuration = exactTime;
      struct.lastPumpedAt = Date.now();

      gameAudio.playPotionGulp();
      gameAudio.playFootstepWood();

      // Splashing water ripple particles around the well
      for (let i = 0; i < 6; i++) {
        const pAngle = Math.random() * Math.PI * 2;
        const pDist = 10 + Math.random() * 35;
        emitParticle(
          struct.x + Math.cos(pAngle) * pDist,
          struct.y + Math.sin(pAngle) * pDist,
          Math.cos(pAngle) * 25,
          Math.sin(pAngle) * 25 - 10,
          2.5,
          '#38bdf8',
          0.5,
        );
      }

      addFloatingText(struct.x, struct.y - 45, `💧 20s Water (${exactTime}s/tree)`, '#38bdf8');
      triggerNotification(
        `💧 Drew groundwater! 20s reservoir divided equally across ${count} Bonsai${count > 1 ? 's' : ''} (${exactTime}s each)!`,
        '#38bdf8',
      );
      refreshHud();
    },
    [addFloatingText, refreshHud, triggerNotification],
  );

  // --- WORKBENCH TIMED CRAFTING QUEUE MANAGEMENT ---
  const getMaxCraftingQueueCapacity = useCallback(() => {
    return 1 + installedCraftingArmsRef.current;
  }, []);

  const getTotalQueuedCount = useCallback(() => {
    return (activeCraftingRef.current ? 1 : 0) + craftingQueueRef.current.length;
  }, []);

  const enqueueCraftingRecipe = useCallback(
    (recipeId: CraftingRecipeId, isSilent = false) => {
      const inv = sanctuaryInventoryRef.current;
      const recipe = WORKBENCH_RECIPES[recipeId];
      if (!recipe) return;

      const maxQueue = getMaxCraftingQueueCapacity();
      const currentCount = getTotalQueuedCount();

      if (currentCount >= maxQueue) {
        if (!isSilent) {
          gameAudio.playErrorBuzz();
          triggerNotification(`Workbench Queue is full (${currentCount}/${maxQueue})! Attach Crafting Assembly Arms for more slots.`, '#ef4444');
        }
        return;
      }

      // Check Workbench Tier Upgrades prerequisites
      if (recipeId === 'rover_chassis_t2') {
        const curTier = inv.rover_chassis_tier || 1;
        if (curTier >= 2) {
          if (!isSilent) triggerNotification('Rover chassis is already upgraded to Surveyor Tier 2 or higher!', '#10b981');
          return;
        }
        const alreadyQueued =
          activeCraftingRef.current?.recipeId === 'rover_chassis_t2' ||
          craftingQueueRef.current.some((it) => it.recipeId === 'rover_chassis_t2');
        if (alreadyQueued) {
          if (!isSilent) triggerNotification('Surveyor Chassis T2 upgrade is already queued for construction!', '#38bdf8');
          return;
        }
      } else if (recipeId === 'rover_chassis_t3') {
        const curTier = inv.rover_chassis_tier || 1;
        if (curTier >= 3) {
          if (!isSilent) triggerNotification('Rover chassis is already at Vanguard Tier 3 Max!', '#10b981');
          return;
        }
        if (curTier < 2) {
          if (!isSilent) {
            gameAudio.playErrorBuzz();
            triggerNotification('Requires Surveyor Chassis (Tier 2) upgrade first!', '#ef4444');
          }
          return;
        }
        const alreadyQueued =
          activeCraftingRef.current?.recipeId === 'rover_chassis_t3' ||
          craftingQueueRef.current.some((it) => it.recipeId === 'rover_chassis_t3');
        if (alreadyQueued) {
          if (!isSilent) triggerNotification('Vanguard Chassis T3 upgrade is already queued for construction!', '#f59e0b');
          return;
        }
      } else if (recipeId === 'workbench_t2_upgrade') {
        if ((inv.workbench_tier || 1) >= 2) {
          if (!isSilent) {
            triggerNotification('Workbench is already at Tier 2 Precision or higher!', '#10b981');
          }
          return;
        }
        const alreadyQueued =
          activeCraftingRef.current?.recipeId === 'workbench_t2_upgrade' ||
          craftingQueueRef.current.some((it) => it.recipeId === 'workbench_t2_upgrade');
        if (alreadyQueued) {
          if (!isSilent) {
            triggerNotification('Tier 2 Workbench upgrade is already queued for construction!', '#38bdf8');
          }
          return;
        }
      } else if (recipeId === 'workbench_t3_upgrade') {
        if ((inv.workbench_tier || 1) >= 3) {
          if (!isSilent) {
            triggerNotification('Workbench is already at Master Tier 3!', '#10b981');
          }
          return;
        }
        if ((inv.workbench_tier || 1) < 2) {
          if (!isSilent) {
            gameAudio.playErrorBuzz();
            triggerNotification('Must upgrade to Tier 2 Precision Workbench first!', '#ef4444');
          }
          return;
        }
        const alreadyQueued =
          activeCraftingRef.current?.recipeId === 'workbench_t3_upgrade' ||
          craftingQueueRef.current.some((it) => it.recipeId === 'workbench_t3_upgrade');
        if (alreadyQueued) {
          if (!isSilent) {
            triggerNotification('Tier 3 Workbench upgrade is already queued for construction!', '#f59e0b');
          }
          return;
        }
      }

      if (recipe.requiresGuide && !inv[recipe.requiresGuide]) {
        if (!isSilent) {
          gameAudio.playErrorBuzz();
          triggerNotification(`Requires ${recipe.guideName || 'Guidebook'} from Botanical Market!`, '#ef4444');
        }
        return;
      }

      // Check materials
      const costs = recipe.costs;
      if (
        (costs.scrap_metal && inv.scrap_metal < costs.scrap_metal) ||
        (costs.copper_wire && inv.copper_wire < costs.copper_wire) ||
        (costs.brass_gears && inv.brass_gears < costs.brass_gears) ||
        (costs.circuit_boards && inv.circuit_boards < costs.circuit_boards) ||
        (costs.electronic_chips && inv.electronic_chips < costs.electronic_chips) ||
        (costs.organic_waste && inv.organic_waste < costs.organic_waste)
      ) {
        if (!isSilent) {
          gameAudio.playErrorBuzz();
          triggerNotification('Insufficient materials to craft this item!', '#ef4444');
        }
        return;
      }

      // Deduct materials
      if (costs.scrap_metal) {
        inv.scrap_metal -= costs.scrap_metal;
        inv.scrapMetal = inv.scrap_metal;
      }
      if (costs.copper_wire) {
        inv.copper_wire -= costs.copper_wire;
        inv.copperWire = inv.copper_wire;
      }
      if (costs.brass_gears) {
        inv.brass_gears -= costs.brass_gears;
        inv.gears = inv.brass_gears;
      }
      if (costs.circuit_boards) {
        inv.circuit_boards -= costs.circuit_boards;
        inv.microcircuits = inv.circuit_boards;
      }
      if (costs.electronic_chips) {
        inv.electronic_chips -= costs.electronic_chips;
        inv.chips = inv.quantumChips = inv.electronic_chips;
      }
      if (costs.organic_waste) {
        inv.organic_waste -= costs.organic_waste;
        inv.organicWaste = inv.organic_waste;
      }

      const newItem: CraftingQueueItem = {
        id: `craft_${Date.now()}_${Math.random()}`,
        recipeId,
        name: recipe.name,
        totalTime: recipe.durationSeconds,
        remainingTime: recipe.durationSeconds,
        icon: recipe.icon,
      };

      if (!activeCraftingRef.current) {
        activeCraftingRef.current = newItem;
      } else {
        craftingQueueRef.current.push(newItem);
      }

      if (!isSilent) {
        gameAudio.playConfirmSelect();
        triggerNotification(`🛠️ Added "${recipe.name}" to Crafting Queue (${recipe.durationSeconds}s)`, '#38bdf8');
      }
      refreshHud();
    },
    [getMaxCraftingQueueCapacity, getTotalQueuedCount, refreshHud, triggerNotification],
  );



  const cancelQueuedCraft = useCallback(
    (index: number) => {
      const inv = sanctuaryInventoryRef.current;
      if (index === -1) {
        // Cancel active craft
        const active = activeCraftingRef.current;
        if (!active) return;
        const recipe = WORKBENCH_RECIPES[active.recipeId];
        if (recipe) {
          // Refund materials
          const c = recipe.costs;
          if (c.scrap_metal) {
            inv.scrap_metal += c.scrap_metal;
            inv.scrapMetal = inv.scrap_metal;
          }
          if (c.copper_wire) {
            inv.copper_wire += c.copper_wire;
            inv.copperWire = inv.copper_wire;
          }
          if (c.brass_gears) {
            inv.brass_gears += c.brass_gears;
            inv.gears = inv.brass_gears;
          }
          if (c.circuit_boards) {
            inv.circuit_boards += c.circuit_boards;
            inv.microcircuits = inv.circuit_boards;
          }
          if (c.electronic_chips) {
            inv.electronic_chips += c.electronic_chips;
            inv.chips = inv.quantumChips = inv.electronic_chips;
          }
          if (c.organic_waste) {
            inv.organic_waste += c.organic_waste;
            inv.organicWaste = inv.organic_waste;
          }
        }
        activeCraftingRef.current = craftingQueueRef.current.shift() || null;
        gameAudio.playCrispClick();
        triggerNotification('Active crafting cancelled and materials refunded.', '#f59e0b');
      } else if (index >= 0 && index < craftingQueueRef.current.length) {
        const item = craftingQueueRef.current[index];
        const recipe = WORKBENCH_RECIPES[item.recipeId];
        if (recipe) {
          const c = recipe.costs;
          if (c.scrap_metal) {
            inv.scrap_metal += c.scrap_metal;
            inv.scrapMetal = inv.scrap_metal;
          }
          if (c.copper_wire) {
            inv.copper_wire += c.copper_wire;
            inv.copperWire = inv.copper_wire;
          }
          if (c.brass_gears) {
            inv.brass_gears += c.brass_gears;
            inv.gears = inv.brass_gears;
          }
          if (c.circuit_boards) {
            inv.circuit_boards += c.circuit_boards;
            inv.microcircuits = inv.circuit_boards;
          }
          if (c.electronic_chips) {
            inv.electronic_chips += c.electronic_chips;
            inv.chips = inv.quantumChips = inv.electronic_chips;
          }
          if (c.organic_waste) {
            inv.organic_waste += c.organic_waste;
            inv.organicWaste = inv.organic_waste;
          }
        }
        craftingQueueRef.current.splice(index, 1);
        gameAudio.playCrispClick();
        triggerNotification('Queued item cancelled and materials refunded.', '#f59e0b');
      }
      refreshHud();
    },
    [refreshHud, triggerNotification],
  );

  // --- ZEN SKILLS UPGRADE HANDLER ---
  const upgradeZenSkill = useCallback((skillKey: keyof ZenSkills) => {
    const inv = sanctuaryInventoryRef.current;
    const skillConfig = SKILL_CONFIGS[skillKey as string];
    if (!skillConfig) return;
    const currentRank = (zenSkillsRef.current[skillKey as string] as number) || 0;

    if (currentRank >= skillConfig.maxRank) {
      triggerNotification('Skill already at Maximum Rank!', '#38bdf8');
      return;
    }

    const cost = skillConfig.costs[currentRank] || 5;
    if (inv.zen_essence >= cost) {
      inv.zen_essence -= cost;
      zenSkillsRef.current[skillKey as string] = currentRank + 1;
      gameAudio.playPowerupChime();
      triggerNotification(
        `Upgraded ${skillConfig.name} to Rank ${zenSkillsRef.current[skillKey as string]}!`,
        '#ec4899',
      );
      refreshHud();
    } else {
      gameAudio.playErrorBuzz();
      triggerNotification(`Need ${cost} Zen Points to upgrade ${skillConfig.name}!`, '#ef4444');
    }
  }, [triggerNotification, refreshHud]);

  // --- GRID-BASED PLANTING (WITH SANCTUARY EXPANSION TILE CHECK) ---
  const plantStoredPottedBonsai = useCallback(
    (storedId: string) => {
      const idx = storedPottedBonsaisRef.current.findIndex((b) => b.id === storedId);
      if (idx === -1) return;

      const stored = storedPottedBonsaisRef.current[idx];
      const av = avatarRef.current;
      const inv = sanctuaryInventoryRef.current;
      const currentPlot = getPlotAtCoords(av.x, av.y, inv.sanctuary_expansion_tier || 0);

      if (!currentPlot) {
        gameAudio.playErrorBuzz();
        triggerNotification('Walk onto the nursery grid plots to plant!', '#ef4444');
        return;
      }

      if (!currentPlot.isUnlocked) {
        gameAudio.playErrorBuzz();
        triggerNotification('🔒 Locked Plot - Purchase Greenhouse Expansions at the Botanical Market!', '#f59e0b');
        return;
      }

      const snapX = currentPlot.centerX;
      const snapY = currentPlot.centerY;

      const isCellOccupied =
        plantedBonsaisRef.current.some((b) => Math.hypot(b.x - snapX, b.y - snapY) < 30) ||
        deployedStructuresRef.current.some((s) => Math.hypot(s.x - snapX, s.y - snapY) < 30);

      const nearWb =
        snapX >= sanctuaryWorkbench.x - 30 &&
        snapX <= sanctuaryWorkbench.x + sanctuaryWorkbench.width + 30 &&
        snapY >= sanctuaryWorkbench.y - 30 &&
        snapY <= sanctuaryWorkbench.y + sanctuaryWorkbench.height + 30;

      const nearZenLib =
        snapX >= sanctuaryZenLibrary.x - 30 &&
        snapX <= sanctuaryZenLibrary.x + sanctuaryZenLibrary.width + 30 &&
        snapY >= sanctuaryZenLibrary.y - 30 &&
        snapY <= sanctuaryZenLibrary.y + sanctuaryZenLibrary.height + 30;

      const nearSociety =
        snapX >= sanctuaryBonsaiSociety.x - 30 &&
        snapX <= sanctuaryBonsaiSociety.x + sanctuaryBonsaiSociety.width + 30 &&
        snapY >= sanctuaryBonsaiSociety.y - 30 &&
        snapY <= sanctuaryBonsaiSociety.y + sanctuaryBonsaiSociety.height + 30;

      const nearGarage =
        snapX >= sanctuaryRoverGarage.x - 30 &&
        snapX <= sanctuaryRoverGarage.x + sanctuaryRoverGarage.width + 30 &&
        snapY >= sanctuaryRoverGarage.y - 30 &&
        snapY <= sanctuaryRoverGarage.y + sanctuaryRoverGarage.height + 30;

      const nearShop =
        snapX >= sanctuaryShopStand.x - 30 &&
        snapX <= sanctuaryShopStand.x + sanctuaryShopStand.width + 30 &&
        snapY >= sanctuaryShopStand.y - 30 &&
        snapY <= sanctuaryShopStand.y + sanctuaryShopStand.height + 30;

      if (isCellOccupied || nearWb || nearZenLib || nearSociety || nearGarage || nearShop) {
        gameAudio.playErrorBuzz();
        triggerNotification('Grid Tile blocked or occupied! Stand on an open nursery tile.', '#ef4444');
        return;
      }

      storedPottedBonsaisRef.current.splice(idx, 1);
      sanctuaryInventoryRef.current.storedBonsais = storedPottedBonsaisRef.current;

      const newBonsai: PlantedBonsai = {
        id: stored.id,
        leafType: stored.leafType,
        group: stored.group,
        species: stored.leafType,
        style: stored.style || 'MOYOGI',
        maturity: stored.maturity || 'sprout',
        name: stored.name,
        rarity: stored.rarity,
        nature: stored.nature || BONSAI_NATURES[Math.floor(Math.random() * BONSAI_NATURES.length)],
        level: stored.level,
        progressSeconds: stored.progressSeconds,
        gridX: snapX,
        gridY: snapY,
        x: snapX,
        y: snapY,
        radius: 36,
        color: stored.color,
        flowerColor: stored.flowerColor,
        potColor: stored.potColor,
        potStyle: stored.potStyle,
        automatonTier: 0,
        pruneBoostTimer: 0,
        waterSprayAnim: 0,
        attributes: stored.attributes || { ...DEFAULT_BONSAI_ATTRIBUTES },
        cultivationPotential: stored.cultivationPotential || { ...DEFAULT_CULTIVATION_POTENTIAL },
      };

      plantedBonsaisRef.current.push(newBonsai);
      invalidateSynergiesCache();
      recordBondexEntry(stored.leafType, stored.maturity, stored.style);
      setIsUnifiedStorageOpen(false);
      setIsPlantingModalOpen(false);
      refreshHud();
      gameAudio.playPowerupChime();

      const mDef = getMaturityDef(newBonsai.maturity);
      addFloatingText(snapX, snapY - 40, `Placed ${mDef.kanji} | Lv.${stored.level} ${stored.name}!`, mDef.color);
      triggerNotification(`Replanted ${stored.name} (${mDef.kanji} ${mDef.name}, ${getBonsaiStyleDef(newBonsai.style).japanese}) on grid!`, mDef.color);
    },
    [addFloatingText, isGridPlotUnlocked, refreshHud, sanctuaryBonsaiSociety, sanctuaryRoverGarage, sanctuaryShopStand, sanctuaryWorkbench, sanctuaryZenLibrary, snapToSanctuaryGrid, triggerNotification],
  );

  const plantIndividualSeedling = useCallback(
    (seedling: SeedlingItem, chosenStyle: BonsaiStyle, chosenNature?: BonsaiNature) => {
      const inv = sanctuaryInventoryRef.current;
      const av = avatarRef.current;
      const currentPlot = getPlotAtCoords(av.x, av.y, inv.sanctuary_expansion_tier || 0);

      if (!currentPlot) {
        gameAudio.playErrorBuzz();
        triggerNotification('Walk onto the nursery grid plots to plant!', '#ef4444');
        return;
      }

      if (!currentPlot.isUnlocked) {
        gameAudio.playErrorBuzz();
        triggerNotification('🔒 Locked Plot - Purchase Greenhouse Expansions at the Botanical Market!', '#f59e0b');
        return;
      }

      const snapX = currentPlot.centerX;
      const snapY = currentPlot.centerY;

      const isCellOccupied =
        plantedBonsaisRef.current.some((b) => Math.hypot(b.x - snapX, b.y - snapY) < 30) ||
        deployedStructuresRef.current.some((s) => Math.hypot(s.x - snapX, s.y - snapY) < 30);

      const nearWb =
        snapX >= sanctuaryWorkbench.x - 30 &&
        snapX <= sanctuaryWorkbench.x + sanctuaryWorkbench.width + 30 &&
        snapY >= sanctuaryWorkbench.y - 30 &&
        snapY <= sanctuaryWorkbench.y + sanctuaryWorkbench.height + 30;

      const nearZenLib =
        snapX >= sanctuaryZenLibrary.x - 30 &&
        snapX <= sanctuaryZenLibrary.x + sanctuaryZenLibrary.width + 30 &&
        snapY >= sanctuaryZenLibrary.y - 30 &&
        snapY <= sanctuaryZenLibrary.y + sanctuaryZenLibrary.height + 30;

      const nearSociety =
        snapX >= sanctuaryBonsaiSociety.x - 30 &&
        snapX <= sanctuaryBonsaiSociety.x + sanctuaryBonsaiSociety.width + 30 &&
        snapY >= sanctuaryBonsaiSociety.y - 30 &&
        snapY <= sanctuaryBonsaiSociety.y + sanctuaryBonsaiSociety.height + 30;

      const nearGarage =
        snapX >= sanctuaryRoverGarage.x - 30 &&
        snapX <= sanctuaryRoverGarage.x + sanctuaryRoverGarage.width + 30 &&
        snapY >= sanctuaryRoverGarage.y - 30 &&
        snapY <= sanctuaryRoverGarage.y + sanctuaryRoverGarage.height + 30;

      const nearShop =
        snapX >= sanctuaryShopStand.x - 30 &&
        snapX <= sanctuaryShopStand.x + sanctuaryShopStand.width + 30 &&
        snapY >= sanctuaryShopStand.y - 30 &&
        snapY <= sanctuaryShopStand.y + sanctuaryShopStand.height + 30;

      if (isCellOccupied || nearWb || nearZenLib || nearSociety || nearGarage || nearShop) {
        gameAudio.playErrorBuzz();
        triggerNotification('Grid Tile blocked or occupied! Choose an open nursery tile.', '#ef4444');
        return;
      }

      // Remove the specific seedling instance from seedlingList
      const sList = inv.seedlingList || [];
      const sIdx = sList.findIndex((s) => s.id === seedling.id);
      if (sIdx !== -1) {
        sList.splice(sIdx, 1);
      } else {
        const fbIdx = sList.findIndex((s) => s.leafType === seedling.leafType);
        if (fbIdx !== -1) sList.splice(fbIdx, 1);
      }
      inv.seedlingList = [...sList];

      // Keep legacy storedSaplingsRef synchronized
      const legIdx = storedSaplingsRef.current.findIndex(
        (s) => s.id === seedling.id || s.leafType === seedling.leafType,
      );
      if (legIdx !== -1) {
        if (storedSaplingsRef.current[legIdx].count > 1) {
          storedSaplingsRef.current[legIdx].count -= 1;
        } else {
          storedSaplingsRef.current.splice(legIdx, 1);
        }
      }

      const styleDef = getBonsaiStyleDef(chosenStyle);
      const leafType = seedling.leafType as BonsaiLeafType;
      const chosenMaturity = (seedling.maturity || 'sprout') as MaturityTier;
      const matDef = getMaturityDef(chosenMaturity);
      const leafDef = getLeafTypeDef(leafType);
      const pickedNature = chosenNature
        ? chosenNature
        : seedling.nature
        ? getBonsaiNature(seedling.nature)
        : BONSAI_NATURES[Math.floor(Math.random() * BONSAI_NATURES.length)];

      const newBonsai: PlantedBonsai = {
        id: `bonsai_${leafType}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        leafType,
        group: (seedling.group as BonsaiGroup) || leafDef.group,
        species: leafType,
        style: chosenStyle,
        maturity: chosenMaturity,
        name: seedling.name || `[${seedling.group || leafDef.group}] ${leafDef.name}`,
        rarity: (seedling.rarity as BonsaiRarity) || leafDef.rarity,
        nature: pickedNature,
        level: 0,
        progressSeconds: 0,
        gridX: snapX,
        gridY: snapY,
        x: snapX,
        y: snapY,
        radius: 36,
        color: seedling.color || leafDef.color,
        flowerColor: seedling.flowerColor || leafDef.accentColor,
        potColor: '#1e293b',
        potStyle: 'Carved Ceramic',
        automatonTier: 0,
        pruneBoostTimer: 0,
        waterSprayAnim: 0,
        findOdds: seedling.findOdds,
        attributes: seedling.geneticPotential || seedling.attributes || { ...DEFAULT_BONSAI_ATTRIBUTES },
        cultivationPotential: seedling.cultivationPotential || { ...DEFAULT_CULTIVATION_POTENTIAL },
      };

      plantedBonsaisRef.current.push(newBonsai);
      invalidateSynergiesCache();
      recordBondexEntry(leafType, chosenMaturity, chosenStyle);
      setStylingModalSapling(null);
      setIsUnifiedStorageOpen(false);
      setIsPlantingModalOpen(false);
      refreshHud();
      gameAudio.playPowerupChime();

      for (let i = 0; i < 6; i++) {
        const pAngle = Math.random() * Math.PI * 2;
        const pSpeed = 40 + Math.random() * 50;
        emitParticle(
          snapX,
          snapY,
          Math.cos(pAngle) * pSpeed,
          Math.sin(pAngle) * pSpeed,
          3 + Math.random() * 2,
          seedling.color || leafDef.color,
          0.5,
        );
      }

      addFloatingText(snapX, snapY - 40, `Planted ${matDef.kanji} | Lv.0 ${newBonsai.name}!`, matDef.color);
      triggerNotification(`Planted [${matDef.kanji} ${matDef.name}] ${newBonsai.name} (Lv.0) styled as ${styleDef.japanese} (${styleDef.name})!`, matDef.color);
    },
    [addFloatingText, emitParticle, invalidateSynergiesCache, isGridPlotUnlocked, recordBondexEntry, refreshHud, sanctuaryBonsaiSociety, sanctuaryRoverGarage, sanctuaryShopStand, sanctuaryWorkbench, sanctuaryZenLibrary, snapToSanctuaryGrid, triggerNotification],
  );

  const plantSelectedSaplingWithStyle = useCallback(
    (saplingLeafType: BonsaiLeafType, chosenStyle: BonsaiStyle, saplingMaturity?: MaturityTier) => {
      const inv = sanctuaryInventoryRef.current;
      const targetMaturity = saplingMaturity || 'sprout';
      const seedling = (inv.seedlingList || []).find(
        (s) => s.leafType === saplingLeafType && (s.maturity || 'sprout') === targetMaturity,
      ) || (inv.seedlingList || []).find(
        (s) => s.leafType === saplingLeafType,
      );

      if (seedling) {
        plantIndividualSeedling(seedling, chosenStyle);
        return;
      }

      const stored =
        storedSaplingsRef.current.find(
          (s) => s.leafType === saplingLeafType && (s.maturity || 'sprout') === targetMaturity && s.count > 0,
        ) ||
        storedSaplingsRef.current.find(
          (s) => s.leafType === saplingLeafType && s.count > 0,
        );
      if (!stored) {
        triggerNotification('No saplings of this leaf type available!', '#ef4444');
        return;
      }

      const av = avatarRef.current;
      const currentPlot = getPlotAtCoords(av.x, av.y, inv.sanctuary_expansion_tier || 0);

      if (!currentPlot) {
        gameAudio.playErrorBuzz();
        triggerNotification('Walk onto the nursery grid plots to plant!', '#ef4444');
        return;
      }

      if (!currentPlot.isUnlocked) {
        gameAudio.playErrorBuzz();
        triggerNotification('🔒 Locked Plot - Purchase Greenhouse Expansions at the Botanical Market!', '#f59e0b');
        return;
      }

      const snapX = currentPlot.centerX;
      const snapY = currentPlot.centerY;

      const isCellOccupied =
        plantedBonsaisRef.current.some((b) => Math.hypot(b.x - snapX, b.y - snapY) < 30) ||
        deployedStructuresRef.current.some((s) => Math.hypot(s.x - snapX, s.y - snapY) < 30);

      const nearWb =
        snapX >= sanctuaryWorkbench.x - 30 &&
        snapX <= sanctuaryWorkbench.x + sanctuaryWorkbench.width + 30 &&
        snapY >= sanctuaryWorkbench.y - 30 &&
        snapY <= sanctuaryWorkbench.y + sanctuaryWorkbench.height + 30;

      const nearZenLib =
        snapX >= sanctuaryZenLibrary.x - 30 &&
        snapX <= sanctuaryZenLibrary.x + sanctuaryZenLibrary.width + 30 &&
        snapY >= sanctuaryZenLibrary.y - 30 &&
        snapY <= sanctuaryZenLibrary.y + sanctuaryZenLibrary.height + 30;

      const nearSociety =
        snapX >= sanctuaryBonsaiSociety.x - 30 &&
        snapX <= sanctuaryBonsaiSociety.x + sanctuaryBonsaiSociety.width + 30 &&
        snapY >= sanctuaryBonsaiSociety.y - 30 &&
        snapY <= sanctuaryBonsaiSociety.y + sanctuaryBonsaiSociety.height + 30;

      const nearGarage =
        snapX >= sanctuaryRoverGarage.x - 30 &&
        snapX <= sanctuaryRoverGarage.x + sanctuaryRoverGarage.width + 30 &&
        snapY >= sanctuaryRoverGarage.y - 30 &&
        snapY <= sanctuaryRoverGarage.y + sanctuaryRoverGarage.height + 30;

      const nearShop =
        snapX >= sanctuaryShopStand.x - 30 &&
        snapX <= sanctuaryShopStand.x + sanctuaryShopStand.width + 30 &&
        snapY >= sanctuaryShopStand.y - 30 &&
        snapY <= sanctuaryShopStand.y + sanctuaryShopStand.height + 30;

      if (isCellOccupied || nearWb || nearZenLib || nearSociety || nearGarage || nearShop) {
        gameAudio.playErrorBuzz();
        triggerNotification('Grid Tile blocked or occupied! Choose an open nursery tile.', '#ef4444');
        return;
      }

      stored.count -= 1;
      const styleDef = getBonsaiStyleDef(chosenStyle);
      const chosenMaturity = stored.maturity || 'sprout';
      const matDef = getMaturityDef(chosenMaturity);
      const pickedNature = stored.nature
        ? getBonsaiNature(stored.nature)
        : BONSAI_NATURES[Math.floor(Math.random() * BONSAI_NATURES.length)];

      const newBonsai: PlantedBonsai = {
        id: `bonsai_${stored.leafType}_${Date.now()}`,
        leafType: stored.leafType,
        group: stored.group,
        species: stored.leafType,
        style: chosenStyle,
        maturity: chosenMaturity,
        name: stored.name,
        rarity: stored.rarity,
        nature: pickedNature,
        level: 0,
        progressSeconds: 0,
        gridX: snapX,
        gridY: snapY,
        x: snapX,
        y: snapY,
        radius: 36,
        color: stored.color,
        flowerColor: stored.flowerColor,
        potColor: stored.potColor,
        potStyle: stored.potStyle,
        automatonTier: 0,
        pruneBoostTimer: 0,
        waterSprayAnim: 0,
        findOdds: stored.findOdds,
        attributes: stored.attributes || { ...DEFAULT_BONSAI_ATTRIBUTES },
        cultivationPotential: stored.cultivationPotential || { ...DEFAULT_CULTIVATION_POTENTIAL },
      };

      plantedBonsaisRef.current.push(newBonsai);
      invalidateSynergiesCache();
      recordBondexEntry(stored.leafType, chosenMaturity, chosenStyle);
      setStylingModalSapling(null);
      setIsUnifiedStorageOpen(false);
      setIsPlantingModalOpen(false);
      refreshHud();
      gameAudio.playPowerupChime();

      for (let i = 0; i < 6; i++) {
        const pAngle = Math.random() * Math.PI * 2;
        const pSpeed = 40 + Math.random() * 50;
        emitParticle(
          snapX,
          snapY,
          Math.cos(pAngle) * pSpeed,
          Math.sin(pAngle) * pSpeed,
          3 + Math.random() * 2,
          stored.color,
          0.5,
        );
      }

      addFloatingText(snapX, snapY - 40, `Planted ${matDef.kanji} | Lv.0 ${stored.name}!`, matDef.color);
      triggerNotification(`Planted [${matDef.kanji} ${matDef.name}] ${stored.name} (Lv.0) styled as ${styleDef.japanese} (${styleDef.name})!`, matDef.color);
    },
    [addFloatingText, isGridPlotUnlocked, plantIndividualSeedling, refreshHud, sanctuaryBonsaiSociety, sanctuaryRoverGarage, sanctuaryShopStand, sanctuaryWorkbench, sanctuaryZenLibrary, snapToSanctuaryGrid, triggerNotification],
  );

  // --- PLACEMENT PREVIEW VALIDATION & CONFIRMATION ---
  const checkPlotPlacementValid = useCallback(
    (plot: SanctuaryPlotInfo | null, preview: GridPlacementPreview | null): boolean => {
      if (!plot || !preview || !plot.isUnlocked) return false;

      const snapX = plot.centerX;
      const snapY = plot.centerY;

      const nearStation =
        (snapX >= sanctuaryWorkbench.x - 30 &&
          snapX <= sanctuaryWorkbench.x + sanctuaryWorkbench.width + 30 &&
          snapY >= sanctuaryWorkbench.y - 30 &&
          snapY <= sanctuaryWorkbench.y + sanctuaryWorkbench.height + 30) ||
        (snapX >= sanctuaryZenLibrary.x - 30 &&
          snapX <= sanctuaryZenLibrary.x + sanctuaryZenLibrary.width + 30 &&
          snapY >= sanctuaryZenLibrary.y - 30 &&
          snapY <= sanctuaryZenLibrary.y + sanctuaryZenLibrary.height + 30) ||
        (snapX >= sanctuaryBonsaiSociety.x - 30 &&
          snapX <= sanctuaryBonsaiSociety.x + sanctuaryBonsaiSociety.width + 30 &&
          snapY >= sanctuaryBonsaiSociety.y - 30 &&
          snapY <= sanctuaryBonsaiSociety.y + sanctuaryBonsaiSociety.height + 30) ||
        (snapX >= sanctuaryRoverGarage.x - 30 &&
          snapX <= sanctuaryRoverGarage.x + sanctuaryRoverGarage.width + 30 &&
          snapY >= sanctuaryRoverGarage.y - 30 &&
          snapY <= sanctuaryRoverGarage.y + sanctuaryRoverGarage.height + 30) ||
        (snapX >= sanctuaryShopStand.x - 30 &&
          snapX <= sanctuaryShopStand.x + sanctuaryShopStand.width + 30 &&
          snapY >= sanctuaryShopStand.y - 30 &&
          snapY <= sanctuaryShopStand.y + sanctuaryShopStand.height + 30);

      if (nearStation) return false;

      const checkOccupied = (x: number, y: number) => {
        const isTreeOccupied = plantedBonsaisRef.current.some(
          (b) => Math.hypot(b.x - x, b.y - y) < 30,
        );
        const isStructureOccupied = deployedStructuresRef.current.some((s) => {
          if (s.type === 'torii_gate') {
            if (s.orientation === 'vertical') {
              return (
                Math.hypot(s.x - x, s.y - SANCTUARY_GRID.cellH - y) < 30 ||
                Math.hypot(s.x - x, s.y + SANCTUARY_GRID.cellH - y) < 30 ||
                Math.hypot(s.x - x, s.y - y) < 30
              );
            } else {
              return (
                Math.hypot(s.x - SANCTUARY_GRID.cellW - x, s.y - y) < 30 ||
                Math.hypot(s.x + SANCTUARY_GRID.cellW - x, s.y - y) < 30 ||
                Math.hypot(s.x - x, s.y - y) < 30
              );
            }
          }
          return Math.hypot(s.x - x, s.y - y) < 30;
        });
        return isTreeOccupied || isStructureOccupied;
      };

      if (preview.payload === 'torii_gate') {
        const isVert = preview.orientation === 'vertical';
        if (isVert) {
          if (plot.row - 1 < 0 || plot.row + 1 >= SANCTUARY_GRID.rows) return false;
          const topUnlocked = isGridPlotUnlocked(snapX, snapY - SANCTUARY_GRID.cellH);
          const botUnlocked = isGridPlotUnlocked(snapX, snapY + SANCTUARY_GRID.cellH);
          if (!topUnlocked || !botUnlocked) return false;
          if (checkOccupied(snapX, snapY)) return false;
          if (checkOccupied(snapX, snapY - SANCTUARY_GRID.cellH)) return false;
          if (checkOccupied(snapX, snapY + SANCTUARY_GRID.cellH)) return false;
          return true;
        } else {
          if (plot.col - 1 < 0 || plot.col + 1 >= SANCTUARY_GRID.cols) return false;
          const leftUnlocked = isGridPlotUnlocked(snapX - SANCTUARY_GRID.cellW, snapY);
          const rightUnlocked = isGridPlotUnlocked(snapX + SANCTUARY_GRID.cellW, snapY);
          if (!leftUnlocked || !rightUnlocked) return false;
          if (checkOccupied(snapX, snapY)) return false;
          if (checkOccupied(snapX - SANCTUARY_GRID.cellW, snapY)) return false;
          if (checkOccupied(snapX + SANCTUARY_GRID.cellW, snapY)) return false;
          return true;
        }
      }

      return !checkOccupied(snapX, snapY);
    },
    [
      isGridPlotUnlocked,
      sanctuaryBonsaiSociety,
      sanctuaryRoverGarage,
      sanctuaryShopStand,
      sanctuaryWorkbench,
      sanctuaryZenLibrary,
    ],
  );

  const handleConfirmPlacement = useCallback(() => {
    const preview = placementPreviewRef.current;
    if (!preview) return;

    const av = avatarRef.current;
    const inv = sanctuaryInventoryRef.current;
    const currentPlot = getPreviewPlot(av.x, av.y, inv.sanctuary_expansion_tier || 0);

    if (!currentPlot || !checkPlotPlacementValid(currentPlot, preview)) {
      gameAudio.playErrorBuzz();
      triggerNotification('Cannot place item here! Choose an empty unlocked plot.', '#ef4444');
      return;
    }

    if (preview.category === 'seedling') {
      plantIndividualSeedling(
        preview.payload,
        (preview.style as BonsaiStyle) || 'CHOKAN',
        preview.nature,
      );
    } else if (preview.category === 'bonsai') {
      plantStoredPottedBonsai(preview.payload.id);
    } else if (preview.category === 'infrastructure' || preview.category === 'decoration') {
      if (preview.payload === 'torii_gate') {
        const type: DeployedStructureType = 'torii_gate';
        const stock = getStructureInventoryCount(inv, type);
        if (stock <= 0) {
          gameAudio.playErrorBuzz();
          triggerNotification('No Torii Gates in stock!', '#ef4444');
          setPlacementPreview(null);
          return;
        }
        inv.torii_gate_inv = Math.max(0, (inv.torii_gate_inv ?? stock) - 1);
        if (!inv.decorations) inv.decorations = { pebblePath: 0, rockFormation: 0, shrubbery: 0, wovenWall: 0, toriiGate: 0, torii_gate: 0 };
        inv.decorations.toriiGate = Math.max(0, (inv.decorations.toriiGate || 1) - 1);
        inv.decorations['torii_gate'] = Math.max(0, (inv.decorations['torii_gate'] || 1) - 1);
        const snapX = currentPlot.centerX;
        const snapY = currentPlot.centerY;
        const newStruct: DeployedStructure = {
          id: `struct_torii_gate_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          type: 'torii_gate',
          x: snapX,
          y: snapY,
          gridX: snapX,
          gridY: snapY,
          orientation: preview.orientation || 'horizontal',
          variant: 0,
        };
        deployedStructuresRef.current.push(newStruct);
        invalidateSynergiesCache();
        gameAudio.playPowerupChime();
        addFloatingText(snapX, snapY - 40, 'Placed ⛩️ Torii Gate!', '#ef4444');
        triggerNotification('Placed ⛩️ Torii Gate on Sanctuary plot! [Q] to Dismantle anytime.', '#10b981');
        refreshHud();
      } else {
        deployStructureOnGrid(preview.payload as DeployedStructureType);
      }
    }

    setPlacementPreview(null);
  }, [
    checkPlotPlacementValid,
    deployStructureOnGrid,
    plantIndividualSeedling,
    plantStoredPottedBonsai,
    addFloatingText,
    invalidateSynergiesCache,
    refreshHud,
    triggerNotification,
  ]);

  // --- ATTACH / SWAP / DETACH TIERED WATERING AUTOMATON ---
  const attachAutomatonTier = useCallback(
    (bonsaiId: string, tier: 1 | 2 | 3) => {
      const bonsai = plantedBonsaisRef.current.find((b) => b.id === bonsaiId);
      if (!bonsai) return;

      const inv = sanctuaryInventoryRef.current;
      const invKey = tier === 1 ? 'automatons_tier1' : tier === 2 ? 'automatons_tier2' : 'automatons_tier3';

      if (inv[invKey] <= 0) {
        gameAudio.playErrorBuzz();
        triggerNotification(`No crafted Tier ${tier} Automatons in stock! Craft one at Workbench.`, '#ef4444');
        return;
      }

      if (bonsai.automatonTier > 0) {
        const oldKey =
          bonsai.automatonTier === 1
            ? 'automatons_tier1'
            : bonsai.automatonTier === 2
            ? 'automatons_tier2'
            : 'automatons_tier3';
        inv[oldKey] += 1;
      }

      inv[invKey] -= 1;
      bonsai.automatonTier = tier;
      gameAudio.playPowerupChime();

      const conf = getAutomatonConfig(tier);
      triggerNotification(`Attached ${conf?.name || 'Automaton'} to ${bonsai.name}! (${conf?.speedMultiplier || 1}x Speed, ${conf?.kwDrain || 2} kW)`, '#38bdf8');
      refreshHud();
    },
    [refreshHud, triggerNotification],
  );

  const detachAutomaton = useCallback(
    (bonsaiId: string) => {
      const bonsai = plantedBonsaisRef.current.find((b) => b.id === bonsaiId);
      if (!bonsai || bonsai.automatonTier === 0) return;

      const inv = sanctuaryInventoryRef.current;
      const oldTier = bonsai.automatonTier;
      const oldKey =
        oldTier === 1 ? 'automatons_tier1' : oldTier === 2 ? 'automatons_tier2' : 'automatons_tier3';

      inv[oldKey] += 1;
      bonsai.automatonTier = 0;
      gameAudio.playCrispClick();

      refreshHud();
      triggerNotification(`Detached Automaton (Tier ${oldTier})! Unit returned to inventory.`, '#f59e0b');
    },
    [refreshHud, triggerNotification],
  );

  // --- MANUAL IDLE PRUNING MECHANIC (1.0s Care Sync + Quick Prune Rock Bonus) ---
  const manualPruneBonsai = useCallback(
    (bonsaiId: string) => {
      const bonsai = plantedBonsaisRef.current.find((b) => b.id === bonsaiId);
      if (!bonsai) return;

      if (bonsai.level >= 100) {
        triggerNotification('Bonsai is already at Maximum Level 100 Mastery!', '#10b981');
        return;
      }

      // Proximity Synergies (includes Quick Prune bonus from adjacent rocks)
      const synergies = getCachedBonsaiSynergies(bonsai);

      // Stalling Surroundings Penalty: Complete growth freeze (0% growth)
      if (synergies.isStalled) {
        gameAudio.playErrorBuzz();
        addFloatingText(bonsai.x, bonsai.y - 45, '⛔ Growth Stalled!', '#f43f5e');
        triggerNotification(
          `⛔ Growth is stalled by repetitive surroundings! (>4 ${synergies.stalledEntityLabel || 'identical neighbors'})`,
          '#ef4444',
        );
        return;
      }

      const greenThumbBonus = zenSkillsRef.current.greenThumb;
      const matDef = getMaturityDef(bonsai.maturity);
      const progressAdvance = 1 + greenThumbBonus + synergies.quickPruneBonus;

      bonsai.pruneBoostTimer = 1.0; // 1.0s duration
      bonsai.lastPruneTime = Date.now();

      // Earning EXP: Manual Pruning with XP Boosted synergy multiplier
      const expGain = Math.round(2 * synergies.expMultiplier);
      gainPlayerExp(expGain);

      gameAudio.playCrispClick();

      for (let i = 0; i < 4; i++) {
        const pAngle = Math.random() * Math.PI * 2;
        const pSpeed = 25 + Math.random() * 35;
        emitParticle(
          bonsai.x + (Math.random() - 0.5) * 20,
          bonsai.y - 30 + (Math.random() - 0.5) * 20,
          Math.cos(pAngle) * pSpeed,
          Math.sin(pAngle) * pSpeed - 10,
          2.5,
          i % 2 === 0 ? matDef.color : '#ec4899',
          0.8,
        );
      }

      const advanceText = progressAdvance % 1 === 0 ? progressAdvance.toFixed(0) : progressAdvance.toFixed(2);
      floatingTextsRef.current.push({
        id: `ft_${Date.now()}_${Math.random()}`,
        x: bonsai.x + (Math.random() - 0.5) * 16,
        y: bonsai.y - 45,
        text: `✂️ -${advanceText}s [${matDef.kanji}] Care! (+${expGain} EXP)`,
        color: matDef.color,
        alpha: 1,
        life: 0,
        maxLife: 1.0, // Strictly 1.0s life
      });

      // Advance progress with overflow rollover
      advanceBonsaiProgress(bonsai, progressAdvance);

      refreshHud();
    },
    [advanceBonsaiProgress, gainPlayerExp, refreshHud, triggerNotification],
  );

  // --- RADIAL DIG MINIGAME EXECUTION (100% HIT REQUIREMENT, STRICT STRIKES) ---
  const executeDigAttempt = useCallback(() => {
    const dig = digStateRef.current;
    if (!dig.active || dig.status !== 'DIGGING') return;

    let current = dig.needleAngle % (Math.PI * 2);
    if (current < 0) current += Math.PI * 2;

    let hitSuccess = false;

    dig.strikesUsed += 1;

    for (let i = 0; i < dig.sectors.length; i++) {
      const sector = dig.sectors[i];
      if (sector.hit) continue;

      const sectorStart = sector.startAngle;
      const sectorArc = sector.arcLength;
      const sectorEnd = sectorStart + sectorArc;

      let inSector = false;
      if (sectorEnd <= Math.PI * 2) {
        inSector = current >= sectorStart && current <= sectorEnd;
      } else {
        inSector = current >= sectorStart || current <= (sectorEnd % (Math.PI * 2));
      }

      if (inSector) {
        sector.hit = true;
        dig.currentHits += 1;
        hitSuccess = true;

        // Calculate precision using 16-tier ladder and Steady Hands skill bonus
        const centerAngle = sector.startAngle + sector.arcLength / 2;
        let diff = current - centerAngle;
        diff = ((diff + Math.PI) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2) - Math.PI;
        const distPct = (Math.abs(diff) / sector.arcLength) * 100;
        const steadyHandsLevel = zenSkillsRef.current.steady_hands || 0;
        const precision = calculateExcavationPrecision(distPct, steadyHandsLevel);
        sector.precision = precision;

        gameAudio.playConfirmSelect();

        const particleColor = precision >= 90 ? '#facc15' : precision > 0 ? '#10b981' : '#64748b';
        for (let p = 0; p < (precision >= 90 ? 10 : 6); p++) {
          const pAngle = Math.random() * Math.PI * 2;
          const pSpeed = 50 + Math.random() * 50;
          emitParticle(
            640 + Math.cos(current) * 110,
            360 + Math.sin(current) * 110,
            Math.cos(pAngle) * pSpeed,
            Math.sin(pAngle) * pSpeed,
            precision >= 90 ? 4 : 3,
            particleColor,
            0.4,
          );
        }
        break;
      }
    }

    if (!hitSuccess) {
      dig.wobbleTimer = 0.35;
      gameAudio.playErrorBuzz();
    }

    // 100% SUCCESS: Player MUST hit EVERY single spot (requiredHits = totalSpots)
    if (dig.currentHits >= dig.requiredHits) {
      dig.status = 'WON';
      dig.active = false;
      gameAudio.playLevelUpStinger();

      const lDef = getLeafTypeDef(dig.leafType);

      // Botanical Foraging Skill Mechanic:
      // Starts at 0% at Level 0, adds +5% per rank up to 25% max at Rank 5.
      // If successful and below Premium (Rank 5), upgrade seedling maturity tier by +1.
      const foragingRank = zenSkillsRef.current.botanicalForaging || 0;
      const foragingBonusChance = foragingRank * 0.05;
      const maturityOrder: MaturityTier[] = ['sprout', 'sapling', 'notable', 'refined', 'premium'];
      let earnedMaturity: MaturityTier = dig.maturity || 'sprout';
      const curMatIdx = maturityOrder.indexOf(earnedMaturity);

      let wasUpgraded = false;
      if (foragingBonusChance > 0 && Math.random() < foragingBonusChance && curMatIdx >= 0 && curMatIdx < maturityOrder.length - 1) {
        earnedMaturity = maturityOrder[curMatIdx + 1];
        wasUpgraded = true;
      }

      const finalMatDef = getMaturityDef(earnedMaturity);
      const finalName = `[${dig.group}] ${lDef.name} (${finalMatDef.kanji} ${finalMatDef.name})`;

      if (wasUpgraded) {
        triggerNotification(
          `✨ Botanical Foraging: Seedling upgraded to Maturity ${finalMatDef.name} (${finalMatDef.kanji})!`,
          '#facc15',
        );
        addFloatingText(
          640,
          310,
          `✨ Botanical Foraging: Upgraded to ${finalMatDef.name} (${finalMatDef.kanji})!`,
          '#facc15',
        );
      }

      // Calculate Genetic Potential distribution based on excavation precision
      const precisions = dig.sectors.map((s) => s.precision ?? 50);
      const { averagePrecision, attributes } = calculateBonsaiAttributes(precisions);
      const zoneHits = dig.sectors.map((s, idx) => ({
        zoneIndex: idx,
        precision: s.precision ?? 50,
        isBullseye: (s.precision ?? 50) >= 90,
      }));

      const newSeedlingId = `seedling_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      const pickedNature = BONSAI_NATURES[Math.floor(Math.random() * BONSAI_NATURES.length)];

      // Open Excavation Results Screen modal!
      setExcavationResult({
        id: newSeedlingId,
        seedlingId: newSeedlingId,
        leafType: dig.leafType,
        group: dig.group,
        maturity: earnedMaturity,
        species: dig.leafType,
        name: finalName,
        rarity: dig.rarity,
        nature: pickedNature,
        findOdds: Math.round((dig.speciesChance || 0.33) * 100),
        averagePrecision,
        zoneHits,
        attributes,
        geneticPotential: attributes,
        wasUpgraded,
      });

      refreshHud();
    } else {
      const remainingStrikes = dig.maxStrikes - dig.strikesUsed;
      const unhitSpots = dig.requiredHits - dig.currentHits;

      // Fail if remaining strikes are less than unhit spots (since 100% hits are required!)
      if (remainingStrikes < unhitSpots || remainingStrikes <= 0) {
        dig.status = 'FAILED';
        dig.active = false;
        gameAudio.playDefeatMotif();
        // Area species remains revealed in Rover Garage Codex & Bondex even on failed attempt
        revealAreaSpecies(activeBiomeIdRef.current, dig.leafType, dig.maturity);
        triggerNotification(
          `❌ Root Snapped! Need 100% hit rate (${dig.requiredHits}/${dig.requiredHits}). Upgrade Careful Trowel in Zen Skills!`,
          '#ef4444',
        );

        const nodeKey = `${dig.tileX},${dig.tileY}`;
        const node = excursionNodesRef.current.get(nodeKey);
        if (node) {
          node.collected = true;
        }
        refreshHud();
      }
    }
  }, [triggerNotification, refreshHud, revealAreaSpecies]);

  // Handler for collecting seedling from Excavation Results Screen
  const handleCollectExcavatedSeedling = useCallback(() => {
    if (!excavationResult) return;
    const res = excavationResult;

    revealAreaSpecies(activeBiomeIdRef.current, res.leafType, res.maturity);

    const seedlingId = res.seedlingId || res.id || `seedling_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    backpackInventoryRef.current.saplings.push({
      id: seedlingId,
      leafType: res.leafType,
      group: res.group,
      maturity: res.maturity,
      species: res.leafType,
      name: res.name,
      rarity: res.rarity as BonsaiRarity,
      nature: res.nature || BONSAI_NATURES[Math.floor(Math.random() * BONSAI_NATURES.length)],
      color: getLeafTypeDef(res.leafType).color,
      flowerColor: getLeafTypeDef(res.leafType).accentColor,
      findOdds: res.findOdds,
      attributes: res.attributes,
      geneticPotential: res.attributes,
      cultivationPotential: { ...DEFAULT_CULTIVATION_POTENTIAL },
      discoveredAreaId: activeBiomeIdRef.current,
    } as any);

    const digExp = SEEDLING_DIG_EXP[res.leafType] || getLeafTypeDef(res.leafType).digExp || 40;
    gainPlayerExp(digExp, res.name);

    triggerNotification(
      `🌿 Collected ${res.name} (Avg Precision: ${res.averagePrecision}%)! (+${digExp} EXP)`,
      '#38bdf8',
    );

    const nodeKey = `${digStateRef.current.tileX},${digStateRef.current.tileY}`;
    const node = excursionNodesRef.current.get(nodeKey);
    if (node) {
      node.collected = true;
    }

    setExcavationResult(null);
    refreshHud();
  }, [excavationResult, gainPlayerExp, refreshHud, revealAreaSpecies, triggerNotification]);

  // Handler for declining/leaving behind seedling from Excavation Results Screen
  const handleDeclineExcavatedSeedling = useCallback(() => {
    if (!excavationResult) return;
    const res = excavationResult;

    revealAreaSpecies(activeBiomeIdRef.current, res.leafType, res.maturity);

    const nodeKey = `${digStateRef.current.tileX},${digStateRef.current.tileY}`;
    const node = excursionNodesRef.current.get(nodeKey);
    if (node) {
      node.collected = true;
    }

    setExcavationResult(null);
    gameAudio.playCrispClick();
    triggerNotification('Seedling returned to nature.', '#fda4af');
    refreshHud();
  }, [excavationResult, refreshHud, revealAreaSpecies, triggerNotification]);

  // Keyboard navigation for Botanical Market
  useEffect(() => {
    if (!isShopModalOpen) return;
    const tabs: ('MAPS' | 'EXPANSIONS' | 'DECOR' | 'GUIDES' | 'EQUIPMENT')[] = [
      'MAPS',
      'EXPANSIONS',
      'DECOR',
      'GUIDES',
      'EQUIPMENT',
    ];

    const tabLengths = {
      MAPS: 2,
      EXPANSIONS: 4,
      DECOR: 9,
      GUIDES: 18,
      EQUIPMENT: 2,
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        setShopTab((t) => tabs[(tabs.indexOf(t) - 1 + tabs.length) % tabs.length]);
        setFocusedShopIdx(0);
        gameAudio.playCrispClick();
      } else if (e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        setShopTab((t) => tabs[(tabs.indexOf(t) + 1) % tabs.length]);
        setFocusedShopIdx(0);
        gameAudio.playCrispClick();
      } else if (e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        setFocusedShopIdx((i) => Math.max(0, i - 1));
        gameAudio.playHoverMicroTone();
      } else if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        const maxLen = tabLengths[shopTab] || 2;
        setFocusedShopIdx((i) => Math.min(maxLen - 1, i + 1));
        gameAudio.playHoverMicroTone();
      } else if (e.key === 'Enter' || e.key === ' ' || e.key === 'e' || e.key === 'E') {
        e.preventDefault();
        // Activate purchase on focused item
        if (shopTab === 'MAPS') {
          if (focusedShopIdx === 0) buyExpeditionMap('has_map_highlands', 250, 'Misty Highlands');
          else if (focusedShopIdx === 1) buyExpeditionMap('has_map_overgrowth', 800, 'Ancient Overgrowth');
        } else if (shopTab === 'EXPANSIONS') {
          const exp = SANCTUARY_EXPANSIONS[focusedShopIdx];
          if (exp) buySanctuaryExpansion(exp.tier, exp.cost, exp.name);
        } else if (shopTab === 'DECOR') {
          const decorList = [
            { type: 'decor_pebble_path' as const, cost: 5, name: 'Zen Pebble Stepping Path' },
            { type: 'decor_rock_formation' as const, cost: 15, name: 'Zen Rock Formation' },
            { type: 'decor_shrubbery_bush' as const, cost: 25, name: 'Topiary Shrubbery Bush' },
            { type: 'decor_woven_wall' as const, cost: 40, name: 'Woven Wooden Lattice Wall' },
            { type: 'torii_gate' as const, cost: 0, name: 'Torii Gate (3x1)' },
            { type: 'crystal_pedestal_foliage' as const, cost: 100, name: 'Emerald Leaf Crystal Pedestal' },
            { type: 'crystal_pedestal_branches' as const, cost: 100, name: 'Amber Branch Crystal Pedestal' },
            { type: 'crystal_pedestal_trunk' as const, cost: 100, name: 'Coral Trunk Crystal Pedestal' },
            { type: 'crystal_pedestal_roots' as const, cost: 100, name: 'Azure Root Crystal Pedestal' },
          ];
          const it = decorList[focusedShopIdx];
          if (it) buyDecoration(it.type, it.cost, it.name);
        } else if (shopTab === 'GUIDES') {
          const guideList = [
            { key: 'has_compost_guide' as const, cost: 35, title: 'Compost Guidebook' },
            { key: 'has_tier1_guide' as const, cost: 75, title: 'Tier 1 Mist Irrigation Guidebook' },
            { key: 'has_workbench_t2_guide' as const, cost: 160, title: 'T2 Precision Workbench Blueprint' },
            { key: 'has_rover_t2_blueprint' as const, cost: 75, title: 'Rover T2 Blueprint' },
            { key: 'has_rover_t3_blueprint' as const, cost: 150, title: 'Rover T3 Blueprint' },
            { key: 'has_storage_module_1_guide' as const, cost: 25, title: 'Storage Module I Guidebook' },
            { key: 'has_storage_module_2_guide' as const, cost: 50, title: 'Storage Module II Guidebook' },
            { key: 'has_storage_module_3_guide' as const, cost: 100, title: 'Storage Module III Guidebook' },
            { key: 'has_battery_module_1_guide' as const, cost: 25, title: 'Battery Module I Guidebook' },
            { key: 'has_battery_module_2_guide' as const, cost: 50, title: 'Battery Module II Guidebook' },
            { key: 'has_battery_module_3_guide' as const, cost: 100, title: 'Battery Module III Guidebook' },
            { key: 'has_radar_module_1_guide' as const, cost: 30, title: 'Radar Module I Guidebook' },
            { key: 'has_radar_module_2_guide' as const, cost: 65, title: 'Radar Module II Guidebook' },
            { key: 'has_radar_module_3_guide' as const, cost: 120, title: 'Radar Module III Guidebook' },
            { key: 'has_tier2_guide' as const, cost: 220, title: 'Tier 2 Pulsar Irrigation Guidebook' },
            { key: 'has_auto_fabricator_guide' as const, cost: 300, title: 'Auto-Fabrication Blueprint Guidebook' },
            { key: 'has_workbench_t3_guide' as const, cost: 350, title: 'T3 Master Foundry Blueprint' },
            { key: 'has_tier3_guide' as const, cost: 450, title: 'Tier 3 Hydro Irrigation Guidebook' },
          ];
          const it = guideList[focusedShopIdx];
          if (it) buyGuidebook(it.key, it.cost, it.title);
        } else if (shopTab === 'EQUIPMENT') {
          if (focusedShopIdx === 0) buyTool('tool_compost_heap', 50, 'Compost Heap');
          else if (focusedShopIdx === 1) buyTool('tool_garden_well', 75, 'Stone Well');
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setIsShopModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isShopModalOpen, shopTab, focusedShopIdx, buyExpeditionMap, buySanctuaryExpansion, buyDecoration, buyGuidebook, buyTool]);

  // Keyboard navigation for Workbench Modal
  useEffect(() => {
    if (!isWorkbenchModalOpen) return;
    const tabs: WorkbenchCategory[] = [
      'resources',
      'bonsai_automatons',
      'workbench',
      'rover',
      'electricity',
    ];

    const tabLengths = {
      resources: 5,
      bonsai_automatons: 3,
      workbench: 4,
      rover: 11,
      electricity: 2,
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        setWorkbenchTab((t) => tabs[(tabs.indexOf(t) - 1 + tabs.length) % tabs.length]);
        setFocusedWbIdx(0);
        gameAudio.playCrispClick();
      } else if (e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        setWorkbenchTab((t) => tabs[(tabs.indexOf(t) + 1) % tabs.length]);
        setFocusedWbIdx(0);
        gameAudio.playCrispClick();
      } else if (e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        setFocusedWbIdx((i) => Math.max(0, i - 1));
        gameAudio.playHoverMicroTone();
      } else if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        const maxLen = tabLengths[workbenchTab as keyof typeof tabLengths] || 4;
        setFocusedWbIdx((i) => Math.min(maxLen - 1, i + 1));
        gameAudio.playHoverMicroTone();
      } else if (e.key === 'Enter' || e.key === ' ' || e.key === 'e' || e.key === 'E') {
        e.preventDefault();
        if (workbenchTab === 'workbench' || workbenchTab === 'upgrades') {
          const wbList: CraftingRecipeId[] = ['workbench_t2_upgrade', 'workbench_t3_upgrade', 'crafting_automaton', 'auto_fabricator'];
          const r = wbList[focusedWbIdx];
          if (r) enqueueCraftingRecipe(r);
        } else if (workbenchTab === 'rover') {
          const roverList: CraftingRecipeId[] = [
            'rover_chassis_t2',
            'rover_chassis_t3',
            'rover_storage_module_1',
            'rover_storage_module_2',
            'rover_storage_module_3',
            'rover_battery_module_1',
            'rover_battery_module_2',
            'rover_battery_module_3',
            'rover_radar_module_1',
            'rover_radar_module_2',
            'rover_radar_module_3',
          ];
          const r = roverList[focusedWbIdx];
          if (r) enqueueCraftingRecipe(r);
        } else if (workbenchTab === 'resources' || workbenchTab === 'compost') {
          const resList: CraftingRecipeId[] = ['craft_copper_wire', 'craft_gears', 'craft_microcircuits', 'craft_quantum_chips', 'craft_enriched_compost'];
          const r = resList[focusedWbIdx];
          if (r) enqueueCraftingRecipe(r);
        } else if (workbenchTab === 'bonsai_automatons' || workbenchTab === 'automatons') {
          const autoList: CraftingRecipeId[] = ['tier1_automaton', 'tier2_automaton', 'tier3_automaton'];
          const r = autoList[focusedWbIdx];
          if (r) enqueueCraftingRecipe(r);
        } else if (workbenchTab === 'electricity') {
          const elecList: CraftingRecipeId[] = ['solar_panel', 'wind_turbine'];
          const r = elecList[focusedWbIdx];
          if (r) enqueueCraftingRecipe(r);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setIsWorkbenchModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isWorkbenchModalOpen, workbenchTab, focusedWbIdx, enqueueCraftingRecipe]);

  // Keyboard navigation for Rover Garage Bay
  useEffect(() => {
    if (!isBiomeSelectOpen) return;
    const biomes: ExpeditionBiomeId[] = ['FOOTHILLS', 'HIGHLANDS', 'OVERGROWTH'];
    const ALL_ROVER_MODULE_KEYS: RoverModuleType[] = [
      'storage_1',
      'storage_2',
      'storage_3',
      'battery_1',
      'battery_2',
      'battery_3',
      'radar_1',
      'radar_2',
      'radar_3',
    ];

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'a' || e.key === 'A' || e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        setGarageTab((t) => (t === 'expeditions' ? 'loadout' : 'expeditions'));
        setFocusedGarageIdx(0);
        gameAudio.playCrispClick();
      } else if (e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        setFocusedGarageIdx((i) => Math.max(0, i - 1));
        gameAudio.playHoverMicroTone();
      } else if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        const maxLimit = garageTab === 'expeditions' ? biomes.length - 1 : ALL_ROVER_MODULE_KEYS.length - 1;
        setFocusedGarageIdx((i) => Math.min(maxLimit, i + 1));
        gameAudio.playHoverMicroTone();
      } else if (e.key === 'Enter' || e.key === ' ' || e.key === 'e' || e.key === 'E') {
        e.preventDefault();
        if (garageTab === 'expeditions') {
          const targetBiome = biomes[focusedGarageIdx];
          if (targetBiome) startBiomeExcursion(targetBiome);
        } else if (garageTab === 'loadout') {
          const modKey = ALL_ROVER_MODULE_KEYS[focusedGarageIdx];
          if (modKey) attachRoverModule(modKey);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setIsBiomeSelectOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isBiomeSelectOpen, garageTab, focusedGarageIdx, startBiomeExcursion, attachRoverModule]);

  // Keyboard navigation for Game Menu / Settings Modal
  useEffect(() => {
    if (!isGameMenuOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const menuOptionsCount = 7;
      if (e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        setFocusedMenuIdx((i) => Math.max(0, i - 1));
        gameAudio.playHoverMicroTone();
      } else if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        setFocusedMenuIdx((i) => Math.min(menuOptionsCount - 1, i + 1));
        gameAudio.playHoverMicroTone();
      } else if (e.key === 'Enter' || e.key === ' ' || e.key === 'e' || e.key === 'E') {
        e.preventDefault();
        if (focusedMenuIdx === 0) {
          setIsGameMenuOpen(false);
          if (gameState.status === 'START') setGameState((p) => ({...p, status: 'PLAYING'}));
          gameAudio.playCrispClick();
        } else if (focusedMenuIdx === 1) {
          toggleFullscreen();
          gameAudio.playCrispClick();
        } else if (focusedMenuIdx === 2) {
          setIsGoalModalOpen(true);
          gameAudio.playCrispClick();
        } else if (focusedMenuIdx === 3) {
          setIsHowToPlayOpen(true);
          gameAudio.playCrispClick();
        } else if (focusedMenuIdx === 4) {
          const muted = gameAudio.toggleMute();
          setIsSfxMuted(muted);
        } else if (focusedMenuIdx === 5) {
          setIsMusicMuted((p) => !p);
        } else if (focusedMenuIdx === 6) {
          initGame();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setIsGameMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isGameMenuOpen, focusedMenuIdx, gameState.status, toggleFullscreen, initGame]);

  // Keyboard navigation for How to Play Guide
  useEffect(() => {
    if (!isHowToPlayOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        setGuidebookChapter((c) => Math.max(1, c - 1));
        gameAudio.playCrispClick();
      } else if (e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        setGuidebookChapter((c) => Math.min(5, c + 1));
        gameAudio.playCrispClick();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setIsHowToPlayOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isHowToPlayOpen]);

  // Discrete Keyboard Event Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameStateRef.current.status !== 'PLAYING') return;

      if (e.repeat) return;

      // PRIORITY: If in placement preview mode, handle Arrow keys / R to rotate, Enter/E to place, Esc to abort
      if (placementPreviewRef.current) {
        if (
          e.key === 'ArrowLeft' ||
          e.key === 'ArrowRight' ||
          e.key === 'ArrowUp' ||
          e.key === 'ArrowDown' ||
          e.key === 'r' ||
          e.key === 'R'
        ) {
          e.preventDefault();
          e.stopPropagation();
          setPlacementPreview((prev) => {
            if (!prev) return null;
            const newOrientation = prev.orientation === 'horizontal' ? 'vertical' : 'horizontal';
            return {
              ...prev,
              orientation: newOrientation,
              width: newOrientation === 'horizontal' ? 3 : 1,
              height: newOrientation === 'horizontal' ? 1 : 3,
            };
          });
          gameAudio.playCrispClick();
          return;
        }
        if (e.key === 'Escape') {
          e.preventDefault();
          e.stopPropagation();
          setPlacementPreview(null);
          gameAudio.playCrispClick();
          return;
        }
        if (e.key === 'e' || e.key === 'E' || e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          e.stopPropagation();
          handleConfirmPlacement();
          return;
        }
      }

      if (e.key === 'Escape') {
        if (placementPreviewRef.current) {
          e.preventDefault();
          setPlacementPreview(null);
          gameAudio.playCrispClick();
          return;
        }
        if (quickRadialBonsai) {
          setQuickRadialBonsai(null);
          gameAudio.playCrispClick();
          return;
        }
        if (excavationResult) {
          handleDeclineExcavatedSeedling();
          return;
        }
        if (digStateRef.current.active) {
          cancelDiggingMinigame();
          return;
        }
        if (excursionReport) return;
        if (inspectingBonsaiId) {
          setInspectingBonsaiId(null);
        } else if (inspectingStructureId) {
          setInspectingStructureId(null);
        } else if (isPlantingModalOpen) {
          setIsPlantingModalOpen(false);
          setStylingModalSapling(null);
        } else if (isBiomeSelectOpen) {
          setIsBiomeSelectOpen(false);
        } else if (isShopModalOpen) {
          setIsShopModalOpen(false);
        } else if (isUnifiedStorageOpen) {
          setIsUnifiedStorageOpen(false);
        } else if (isWorkbenchModalOpen) {
          setIsWorkbenchModalOpen(false);
        } else if (isZenSkillsModalOpen) {
          setIsZenSkillsModalOpen(false);
        } else if (isGoalModalOpen) {
          setIsGoalModalOpen(false);
        } else if (isHowToPlayOpen) {
          setIsHowToPlayOpen(false);
        } else {
          setIsGameMenuOpen((prev) => !prev);
        }
      } else if (excursionReport) {
        if (e.key === 'e' || e.key === 'E' || e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          depositHaulAndReturnToSanctuary();
          return;
        }
      } else if (quickRadialBonsai) {
        // Quick Radial Cross Menu Directional Triggering (WASD only, Arrows are reserved for scrolling)
        if (e.key === 'w' || e.key === 'W') {
          e.preventDefault();
          donatePlantedBonsai(quickRadialBonsai.id);
          setQuickRadialBonsai(null);
          return;
        }
        if (e.key === 's' || e.key === 'S') {
          e.preventDefault();
          pickUpBonsaiToInventory(quickRadialBonsai.id);
          setQuickRadialBonsai(null);
          return;
        }
        if (e.key === 'a' || e.key === 'A') {
          e.preventDefault();
          if (sanctuaryInventoryRef.current.organic_compost > 0) {
            applyOrganicCompost(quickRadialBonsai.id);
            setQuickRadialBonsai(null);
          } else {
            gameAudio.playErrorBuzz();
            triggerNotification('No Enriched Organic Compost in stock! Craft at Workbench.', '#ef4444');
          }
          return;
        }
        if (e.key === 'd' || e.key === 'D') {
          e.preventDefault();
          gameAudio.playErrorBuzz();
          triggerNotification('🧪 Chemical Fertilizer research locked! Coming in future updates.', '#94a3b8');
          return;
        }
        if (e.key === 'q' || e.key === 'Q') {
          e.preventDefault();
          setQuickRadialBonsai(null);
          gameAudio.playCrispClick();
          return;
        }
      } else if (e.key === 'w' || e.key === 'W') {
        if (locationRef.current === 'EXCURSION') {
          e.preventDefault();
          if (roverRef.current.moveCooldown <= 0) {
            attemptRoverStep(0, -1);
            roverRef.current.moveCooldown = 0.18;
          }
        }
      } else if (e.key === 's' || e.key === 'S') {
        if (locationRef.current === 'EXCURSION') {
          e.preventDefault();
          if (roverRef.current.moveCooldown <= 0) {
            attemptRoverStep(0, 1);
            roverRef.current.moveCooldown = 0.18;
          }
        }
      } else if (e.key === 'a' || e.key === 'A') {
        if (locationRef.current === 'EXCURSION') {
          e.preventDefault();
          if (roverRef.current.moveCooldown <= 0) {
            attemptRoverStep(-1, 0);
            roverRef.current.moveCooldown = 0.18;
          }
        }
      } else if (e.key === 'd' || e.key === 'D') {
        if (locationRef.current === 'EXCURSION') {
          e.preventDefault();
          if (roverRef.current.moveCooldown <= 0) {
            attemptRoverStep(1, 0);
            roverRef.current.moveCooldown = 0.18;
          }
        }
      } else if (e.key === 'r' || e.key === 'R' || e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        if (placementPreviewRef.current?.payload === 'torii_gate') {
          e.preventDefault();
          togglePreviewOrientation();
          return;
        }
      } else if (e.key === 'e' || e.key === 'E') {
        if (placementPreviewRef.current) {
          e.preventDefault();
          handleConfirmPlacement();
          return;
        }
        if (digStateRef.current.active) return;
        if (excursionReport) {
          e.preventDefault();
          depositHaulAndReturnToSanctuary();
          return;
        }

        if (locationRef.current === 'SANCTUARY') {
          if (isNearShop) {
            setIsShopModalOpen(true);
            gameAudio.playCrispClick();
          } else if (isNearGarage) {
            setIsBiomeSelectOpen(true);
            gameAudio.playCrispClick();
          } else if (isNearBonsaiSociety) {
            gameAudio.playCrispClick();
            triggerNotification('🏛️ Bonsai Society (Grand Hall - Membership Opening Soon)', '#fbbf24');
          } else if (isNearWorkbench) {
            setWorkbenchTab('resources');
            setIsWorkbenchModalOpen(true);
            gameAudio.playCrispClick();
          } else if (isNearZenLibrary) {
            setIsZenSkillsModalOpen(true);
            gameAudio.playCrispClick();
          } else if (nearbyStructure) {
            if (nearbyStructure.type === 'tool_compost_heap') {
              interactCompostHeapDirect(nearbyStructure.id);
            } else if (nearbyStructure.type === 'tool_garden_well') {
              drawWaterFromWell(nearbyStructure.id);
            } else if (nearbyStructure.type === 'solar_panel' || nearbyStructure.type === 'wind_turbine') {
              setInspectingStructureId(nearbyStructure.id);
              gameAudio.playCrispClick();
            } else if (nearbyStructure.type.startsWith('crystal_pedestal')) {
              dismantleDeployedStructure(nearbyStructure.id);
            }
          } else if (nearbyBonsai) {
            setInspectingBonsaiId(nearbyBonsai.id);
            gameAudio.playCrispClick();
          } else {
            // Check if standing on an empty unlocked nursery plot
            const av = avatarRef.current;
            const currentPlot = getPlotAtCoords(av.x, av.y, sanctuaryInventoryRef.current.sanctuary_expansion_tier || 0);
            if (currentPlot && currentPlot.isUnlocked) {
              const isOccupied =
                plantedBonsaisRef.current.some((b) => Math.hypot(b.x - currentPlot.centerX, b.y - currentPlot.centerY) < 30) ||
                deployedStructuresRef.current.some((s) => Math.hypot(s.x - currentPlot.centerX, s.y - currentPlot.centerY) < 30);
              const isNearStation = isNearWorkbench || isNearZenLibrary || isNearBonsaiSociety || isNearGarage || isNearShop;

              if (!isOccupied && !isNearStation) {
                setIsPlantingModalOpen(true);
                gameAudio.playCrispClick();
              }
            }
          }
        } else if (locationRef.current === 'EXCURSION') {
          // If at or within 1 step of base camp: Finish Excursion and return with 100% loot!
          if (Math.hypot(roverRef.current.tileX, roverRef.current.tileY) <= 1.0) {
            e.preventDefault();
            finishExcursion(false);
          } else {
            const key = `${roverRef.current.tileX},${roverRef.current.tileY}`;
            const node = excursionNodesRef.current.get(key);
            if (node && !node.collected) {
              if (node.type === 'SAPLING') {
                triggerRadialDig(node);
              } else if (node.type === 'RESOURCE') {
                collectCurrentRoverResource();
              }
            }
          }
        }
      } else if (e.key === 'q' || e.key === 'Q') {
        if (locationRef.current === 'SANCTUARY' && !digStateRef.current.active) {
          // DO NOT show or trigger the quick radial menu if inspection modal is open!
          if (inspectingBonsaiId) {
            return;
          }
          if (quickRadialBonsai) {
            setQuickRadialBonsai(null);
            gameAudio.playCrispClick();
            return;
          }
          if (inspectingStructureId) {
            dismantleDeployedStructure(inspectingStructureId);
            return;
          }
          if (nearbyStructure) {
            dismantleDeployedStructure(nearbyStructure.id);
            return;
          }
          if (nearbyBonsai) {
            setQuickRadialBonsai(nearbyBonsai);
            gameAudio.playCrispClick();
            return;
          }

          const av = avatarRef.current;
          const currentPlot = getPlotAtCoords(av.x, av.y, sanctuaryInventoryRef.current.sanctuary_expansion_tier || 0);
          if (currentPlot) {
            const structOnTile = deployedStructuresRef.current.find((s) => Math.hypot(s.x - currentPlot.centerX, s.y - currentPlot.centerY) < 30);
            if (structOnTile) {
              dismantleDeployedStructure(structOnTile.id);
              return;
            }
            const bonsaiOnTile = plantedBonsaisRef.current.find((b) => Math.hypot(b.x - currentPlot.centerX, b.y - currentPlot.centerY) < 30);
            if (bonsaiOnTile) {
              setQuickRadialBonsai(bonsaiOnTile);
              gameAudio.playCrispClick();
              return;
            }
          }

          triggerNotification('Stand over a bonsai for [Q / Y] Menu, or item to store!', '#f59e0b');
        }
      } else if (e.key === 'v' || e.key === 'V') {
        if (locationRef.current === 'SANCTUARY' && !digStateRef.current.active) {
          if (inspectingBonsaiId) {
            donatePlantedBonsai(inspectingBonsaiId);
            return;
          }
          if (nearbyBonsai) {
            donatePlantedBonsai(nearbyBonsai.id);
            return;
          }
          triggerNotification('Stand near a bonsai or inspect it to donate [V]!', '#34d399');
        }
      } else if (e.key === 'c' || e.key === 'C') {
        if (locationRef.current === 'SANCTUARY' && !digStateRef.current.active) {
          if (nearbyBonsai) {
            const inv = sanctuaryInventoryRef.current;
            if (inv.organic_compost > 0) {
              applyOrganicCompost(nearbyBonsai.id);
            } else {
              gameAudio.playErrorBuzz();
              triggerNotification('No Enriched Organic Compost in stock! Craft at Workbench.', '#ef4444');
            }
          } else {
            triggerNotification('Stand over a planted bonsai tree to apply compost [C]!', '#f59e0b');
          }
        }
      } else if (e.key === 'i' || e.key === 'I') {
        if (locationRef.current === 'SANCTUARY' && !digStateRef.current.active) {
          setIsUnifiedStorageOpen((prev) => !prev);
          gameAudio.playCrispClick();
        }
      } else if (e.key === 'p' || e.key === 'P') {
        if (locationRef.current === 'SANCTUARY' && !digStateRef.current.active) {
          const av = avatarRef.current;
          const currentPlot = getPlotAtCoords(av.x, av.y, sanctuaryInventoryRef.current.sanctuary_expansion_tier || 0);
          if (!currentPlot) {
            triggerNotification('Walk onto the nursery grid plots to deploy or plant [P]!', '#f59e0b');
            return;
          }
          if (!currentPlot.isUnlocked) {
            gameAudio.playErrorBuzz();
            triggerNotification('🔒 Locked Plot - Stand over an unlocked empty nursery plot to deploy or plant [E]!', '#f59e0b');
            return;
          }
          const isOccupied =
            plantedBonsaisRef.current.some((b) => Math.hypot(b.x - currentPlot.centerX, b.y - currentPlot.centerY) < 30) ||
            deployedStructuresRef.current.some((s) => Math.hypot(s.x - currentPlot.centerX, s.y - currentPlot.centerY) < 30);
          const isNearStation =
            isNearWorkbench || isNearZenLibrary || isNearBonsaiSociety || isNearGarage || isNearShop;

          if (!isOccupied && !isNearStation) {
            setIsPlantingModalOpen((prev) => !prev);
            gameAudio.playCrispClick();
          } else if (isOccupied) {
            triggerNotification('This plot is already occupied! Stand over an empty plot to deploy or plant [E].', '#f59e0b');
          } else {
            triggerNotification('Stand over an empty nursery plot to deploy or plant [E]!', '#f59e0b');
          }
        }
      } else if (e.key === ' ' || e.key === 'Enter') {
        if (placementPreviewRef.current) {
          e.preventDefault();
          handleConfirmPlacement();
          return;
        }
        if (excursionReport) {
          e.preventDefault();
          depositHaulAndReturnToSanctuary();
        } else if (excavationResult) {
          e.preventDefault();
          handleCollectExcavatedSeedling();
        } else if (digStateRef.current.active) {
          e.preventDefault();
          executeDigAttempt();
        } else if (locationRef.current === 'EXCURSION' && Math.hypot(roverRef.current.tileX, roverRef.current.tileY) <= 1.0) {
          e.preventDefault();
          finishExcursion(false);
        } else if (
          locationRef.current === 'SANCTUARY' &&
          nearbyBonsai &&
          !inspectingBonsaiId &&
          !isUnifiedStorageOpen &&
          !isPlantingModalOpen &&
          !isWorkbenchModalOpen &&
          !isZenSkillsModalOpen &&
          !isShopModalOpen &&
          !isBiomeSelectOpen &&
          !quickRadialBonsai
        ) {
          e.preventDefault();
          manualPruneBonsai(nearbyBonsai.id);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    applyOrganicCompost,
    attemptRoverStep,
    cancelDiggingMinigame,
    collectCurrentRoverResource,
    executeDigAttempt,
    excursionReport,
    excavationResult,
    handleCollectExcavatedSeedling,
    handleDeclineExcavatedSeedling,
    finishExcursion,
    inspectingBonsaiId,
    inspectingStructureId,
    quickRadialBonsai,
    dismantleDeployedStructure,
    pickUpBonsaiToInventory,
    donatePlantedBonsai,
    isBiomeSelectOpen,
    isGoalModalOpen,
    isHowToPlayOpen,
    isNearGarage,
    isNearShop,
    isNearWorkbench,
    isNearZenLibrary,
    isNearBonsaiSociety,
    isPlantingModalOpen,
    isShopModalOpen,
    isUnifiedStorageOpen,
    isWorkbenchModalOpen,
    isZenSkillsModalOpen,
    manualPruneBonsai,
    nearbyBonsai,
    nearbyStructure,
    stylingModalSapling,
    triggerNotification,
    triggerRadialDig,
    handleConfirmPlacement,
  ]);

  // Pointer click on canvas in Sanctuary
  useEffect(() => {
    const handleCanvasClick = (e: MouseEvent) => {
      if (
        gameStateRef.current.status !== 'PLAYING' ||
        isGameMenuOpen ||
        digStateRef.current.active ||
        excursionReport ||
        excavationResult
      )
        return;

      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const scaleX = canvasWidth / rect.width;
      const scaleY = canvasHeight / rect.height;
      const clickX = (e.clientX - rect.left) * scaleX;
      const clickY = (e.clientY - rect.top) * scaleY;

      if (digStateRef.current.active) {
        const cx = canvasWidth / 2;
        const cy = canvasHeight / 2;
        const dialRadius = 145;
        // Check if clicked near Cancel button
        if (
          clickX >= cx - 100 &&
          clickX <= cx + 100 &&
          clickY >= cy + dialRadius + 58 &&
          clickY <= cy + dialRadius + 96
        ) {
          cancelDiggingMinigame();
          return;
        }
        executeDigAttempt();
        return;
      }

      if (locationRef.current === 'SANCTUARY') {
        const camY = sanctuaryCameraRef.current.y;
        const worldX = clickX;
        const worldY = clickY + camY;

        const shop = sanctuaryShopStand;
        if (
          worldX >= shop.x - 10 &&
          worldX <= shop.x + shop.width + 10 &&
          worldY >= shop.y - 10 &&
          worldY <= shop.y + shop.height + 10
        ) {
          setIsShopModalOpen(true);
          gameAudio.playCrispClick();
          return;
        }

        const zenLib = sanctuaryZenLibrary;
        if (
          worldX >= zenLib.x - 10 &&
          worldX <= zenLib.x + zenLib.width + 10 &&
          worldY >= zenLib.y - 10 &&
          worldY <= zenLib.y + zenLib.height + 10
        ) {
          setIsZenSkillsModalOpen(true);
          gameAudio.playCrispClick();
          return;
        }

        const wb = sanctuaryWorkbench;
        if (
          worldX >= wb.x - 10 &&
          worldX <= wb.x + wb.width + 10 &&
          worldY >= wb.y - 10 &&
          worldY <= wb.y + wb.height + 10
        ) {
          setWorkbenchTab('resources');
          setIsWorkbenchModalOpen(true);
          gameAudio.playCrispClick();
          return;
        }

        const society = sanctuaryBonsaiSociety;
        if (
          worldX >= society.x - 10 &&
          worldX <= society.x + society.width + 10 &&
          worldY >= society.y - 10 &&
          worldY <= society.y + society.height + 10
        ) {
          gameAudio.playCrispClick();
          triggerNotification('🏛️ Bonsai Society (Grand Hall - Membership Opening Soon)', '#fbbf24');
          return;
        }

        const garage = sanctuaryRoverGarage;
        if (
          worldX >= garage.x - 10 &&
          worldX <= garage.x + garage.width + 10 &&
          worldY >= garage.y - 10 &&
          worldY <= garage.y + garage.height + 10
        ) {
          setIsBiomeSelectOpen(true);
          gameAudio.playCrispClick();
          return;
        }

        const halfTileW = SANCTUARY_GRID.cellW / 2;
        const halfTileH = SANCTUARY_GRID.cellH / 2;

        for (const b of plantedBonsaisRef.current) {
          const dx = worldX - b.x;
          const dy = worldY - b.y;
          if (Math.sqrt(dx * dx + dy * dy) < b.radius + 15) {
            setInspectingBonsaiId(b.id);
            gameAudio.playCrispClick();
            return;
          }
        }

        for (const s of deployedStructuresRef.current) {
          const dx = worldX - s.x;
          const dy = worldY - s.y;
          if (Math.abs(dx) <= halfTileW + 4 && Math.abs(dy) <= halfTileH + 4) {
            if (s.type === 'tool_compost_heap') {
              interactCompostHeapDirect(s.id);
              return;
            } else if (s.type === 'tool_garden_well') {
              drawWaterFromWell(s.id);
              return;
            } else if (s.type === 'solar_panel' || s.type === 'wind_turbine') {
              setInspectingStructureId(s.id);
              gameAudio.playCrispClick();
              return;
            } else if (s.type.startsWith('crystal_pedestal')) {
              dismantleDeployedStructure(s.id);
              return;
            }
          }
        }
      }
    };

    const c = canvasRef.current;
    if (c) {
      c.addEventListener('click', handleCanvasClick);
    }
    return () => {
      if (c) c.removeEventListener('click', handleCanvasClick);
    };
  }, [
    cancelDiggingMinigame,
    canvasHeight,
    canvasWidth,
    executeDigAttempt,
    excursionReport,
    excavationResult,
    isGameMenuOpen,
    sanctuaryBonsaiSociety,
    sanctuaryRoverGarage,
    sanctuaryShopStand,
    sanctuaryWorkbench,
    sanctuaryZenLibrary,
  ]);

  // --- MAIN SIMULATION TICK ---
  const update = useCallback(
    (deltaTime: number) => {
      const dt = Math.min(deltaTime, 0.1);
      const input = inputRef.current;
      const av = avatarRef.current;
      const inv = sanctuaryInventoryRef.current;

      // Active Gamepad Polling & Controls Processing
      let gpMoveX = 0;
      let gpMoveY = 0;
      let activeGamepad: Gamepad | null = null;
      if (typeof navigator !== 'undefined' && navigator.getGamepads) {
        const gamepads = navigator.getGamepads();
        for (let i = 0; i < gamepads.length; i++) {
          const gp = gamepads[i];
          if (gp && gp.connected) {
            activeGamepad = gp;
            break;
          }
        }
      }

      if (activeGamepad) {
        const axes = activeGamepad.axes || [];
        const buttons = activeGamepad.buttons || [];

        // Left Stick (axes 0/1 with deadzone ~0.2)
        const deadzone = 0.2;
        const rawAxisX = axes[0] ?? 0;
        const rawAxisY = axes[1] ?? 0;
        if (Math.abs(rawAxisX) > deadzone) {
          gpMoveX = (rawAxisX - Math.sign(rawAxisX) * deadzone) / (1 - deadzone);
        }
        if (Math.abs(rawAxisY) > deadzone) {
          gpMoveY = (rawAxisY - Math.sign(rawAxisY) * deadzone) / (1 - deadzone);
        }

        // D-Pad (buttons 12: Up, 13: Down, 14: Left, 15: Right)
        if (buttons[14]?.pressed) gpMoveX = -1;
        if (buttons[15]?.pressed) gpMoveX = 1;
        if (buttons[12]?.pressed) gpMoveY = -1;
        if (buttons[13]?.pressed) gpMoveY = 1;

        // Right Stick (axes 2 and 3) dedicated to scrolling scrollable menus/submenus/lists
        const rightStickX = axes[2] ?? 0;
        const rightStickY = axes[3] ?? 0;
        if (Math.abs(rightStickX) > 0.18 || Math.abs(rightStickY) > 0.18) {
          const sDx = Math.abs(rightStickX) > 0.18 ? rightStickX * 14 : 0;
          const sDy = Math.abs(rightStickY) > 0.18 ? rightStickY * 14 : 0;
          const candidates = Array.from(
            document.querySelectorAll<HTMLElement>(
              '.overflow-y-auto, .overflow-x-auto, [data-scrollable="true"]',
            ),
          );
          for (let i = candidates.length - 1; i >= 0; i--) {
            const el = candidates[i];
            if (el && (el.offsetParent !== null || window.getComputedStyle(el).display !== 'none')) {
              const canScrollY = el.scrollHeight > el.clientHeight + 4;
              const canScrollX = el.scrollWidth > el.clientWidth + 4;
              if (sDy !== 0 && canScrollY) {
                el.scrollTop += sDy;
                break;
              }
              if (sDx !== 0 && canScrollX) {
                el.scrollLeft += sDx;
                break;
              }
            }
          }
        }

        // Button edge-detection (just pressed on this tick)
        const lastBtns = lastGamepadButtonsRef.current;
        const justPressed = (idx: number) => Boolean(buttons[idx]?.pressed && !lastBtns[idx]);

        // Title Screen D-Pad / Left Stick Navigation
        if (gameStateRef.current.status === 'START') {
          if (justPressed(12) || (rawAxisY < -0.5 && !lastBtns[12])) {
            setTitleMenuIdx((i) => Math.max(0, i - 1));
            gameAudio.playHoverMicroTone();
          } else if (justPressed(13) || (rawAxisY > 0.5 && !lastBtns[13])) {
            setTitleMenuIdx((i) => Math.min(2, i + 1));
            gameAudio.playHoverMicroTone();
          }
        }

        // Gamepad actions during Placement Preview Mode (A places, B cancels, Bumpers / D-Pad rotate)
        if (placementPreviewRef.current) {
          if (justPressed(0)) {
            handleConfirmPlacement();
            lastGamepadButtonsRef.current = buttons.map((b) => b.pressed);
            return;
          }
          if (justPressed(1)) {
            setPlacementPreview(null);
            gameAudio.playCrispClick();
            lastGamepadButtonsRef.current = buttons.map((b) => b.pressed);
            return;
          }
          if (justPressed(4) || justPressed(5) || justPressed(14) || justPressed(15)) {
            togglePreviewOrientation();
            lastGamepadButtonsRef.current = buttons.map((b) => b.pressed);
            return;
          }
        }

        // Button 0 (A / Cross): Start game on START screen, continue on VICTORY, primary interact
        if (justPressed(0)) {
          if (quickRadialBonsai) {
            setQuickRadialBonsai(null);
            gameAudio.playCrispClick();
          } else if (gameStateRef.current.status === 'START') {
            if (titleMenuIdx === 0) {
              setGameState((prev) => ({...prev, status: 'PLAYING'}));
              gameAudio.playPowerupChime();
              if (sdk) sdk.startGame();
            } else if (titleMenuIdx === 1) {
              setIsHowToPlayOpen(true);
              gameAudio.playCrispClick();
            } else if (titleMenuIdx === 2) {
              setIsGameMenuOpen(true);
              gameAudio.playCrispClick();
            }
          } else if (gameStateRef.current.status === 'VICTORY') {
            setGameState((prev) => ({...prev, status: 'PLAYING'}));
          } else if (excavationResult) {
            handleCollectExcavatedSeedling();
          } else if (excursionReport) {
            depositHaulAndReturnToSanctuary();
          } else if (digStateRef.current.active) {
            executeDigAttempt();
          } else if (isGoalModalOpen) {
            setIsGoalModalOpen(false);
          } else if (isHowToPlayOpen) {
            if (guidebookChapter < 5) setGuidebookChapter((c) => c + 1);
            else setIsHowToPlayOpen(false);
          } else if (isGameMenuOpen) {
            setIsGameMenuOpen(false);
          } else if (locationRef.current === 'SANCTUARY') {
            if (isNearShopRef.current) {
              setIsShopModalOpen(true);
              gameAudio.playCrispClick();
            } else if (isNearGarageRef.current) {
              setIsBiomeSelectOpen(true);
              gameAudio.playCrispClick();
            } else if (isNearBonsaiSocietyRef.current) {
              gameAudio.playCrispClick();
              triggerNotification('🏛️ Bonsai Society (Grand Hall - Membership Opening Soon)', '#fbbf24');
            } else if (isNearWorkbenchRef.current) {
              setWorkbenchTab('resources');
              setIsWorkbenchModalOpen(true);
              gameAudio.playCrispClick();
            } else if (isNearZenLibraryRef.current) {
              setIsZenSkillsModalOpen(true);
              gameAudio.playCrispClick();
            } else if (nearbyStructureIdRef.current) {
              const str = deployedStructuresRef.current.find((s) => s.id === nearbyStructureIdRef.current);
              if (str) {
                if (str.type === 'tool_compost_heap') {
                  interactCompostHeapDirect(str.id);
                } else if (str.type === 'tool_garden_well') {
                  drawWaterFromWell(str.id);
                } else if (str.type === 'solar_panel' || str.type === 'wind_turbine') {
                  setInspectingStructureId(str.id);
                  gameAudio.playCrispClick();
                } else if (str.type.startsWith('crystal_pedestal')) {
                  dismantleDeployedStructure(str.id);
                }
              }
            } else if (nearbyBonsaiIdRef.current) {
              setInspectingBonsaiId(nearbyBonsaiIdRef.current);
              gameAudio.playCrispClick();
            } else if (standingPlotKeyRef.current) {
              setIsPlantingModalOpen(true);
              gameAudio.playCrispClick();
            }
          } else if (locationRef.current === 'EXCURSION') {
            if (Math.hypot(roverRef.current.tileX, roverRef.current.tileY) <= 1.0) {
              finishExcursion(false);
            } else {
              const key = `${roverRef.current.tileX},${roverRef.current.tileY}`;
              const node = excursionNodesRef.current.get(key);
              if (node && !node.collected) {
                if (node.type === 'SAPLING') triggerRadialDig(node);
                else if (node.type === 'RESOURCE') collectCurrentRoverResource();
              }
            }
          }
        }

        // Button 1 (B / Circle): Cancel / Close / Back / Leave
        if (justPressed(1)) {
          if (placementPreviewRef.current) {
            setPlacementPreview(null);
            gameAudio.playCrispClick();
            return;
          }
          if (quickRadialBonsai) {
            setQuickRadialBonsai(null);
            gameAudio.playCrispClick();
          } else if (excavationResult) {
            handleDeclineExcavatedSeedling();
          } else if (digStateRef.current.active) {
            cancelDiggingMinigame();
          } else if (inspectingBonsaiId) {
            setInspectingBonsaiId(null);
          } else if (inspectingStructureId) {
            setInspectingStructureId(null);
          } else if (stylingModalSapling) {
            setStylingModalSapling(null);
          } else if (isPlantingModalOpen) {
            setIsPlantingModalOpen(false);
            setStylingModalSapling(null);
          } else if (isBiomeSelectOpen) {
            setIsBiomeSelectOpen(false);
          } else if (isShopModalOpen) {
            setIsShopModalOpen(false);
          } else if (isUnifiedStorageOpen) {
            setIsUnifiedStorageOpen(false);
          } else if (isWorkbenchModalOpen) {
            setIsWorkbenchModalOpen(false);
          } else if (isZenSkillsModalOpen) {
            setIsZenSkillsModalOpen(false);
          } else if (isGoalModalOpen) {
            setIsGoalModalOpen(false);
          } else if (isHowToPlayOpen) {
            setIsHowToPlayOpen(false);
          } else if (isGameMenuOpen) {
            setIsGameMenuOpen(false);
          } else {
            // When no menu open, B toggles Game Menu & Settings
            setIsGameMenuOpen(true);
            gameAudio.playCrispClick();
          }
        }

        // Button 2 (X / Square): Quick Prune / Timing needle strike in excavation
        if (justPressed(2)) {
          if (digStateRef.current.active) {
            executeDigAttempt();
          } else if (locationRef.current === 'SANCTUARY') {
            if (nearbyBonsaiIdRef.current) {
              manualPruneBonsai(nearbyBonsaiIdRef.current);
            } else if (nearbyStructureIdRef.current) {
              dismantleDeployedStructure(nearbyStructureIdRef.current);
            }
          } else if (locationRef.current === 'EXCURSION') {
            collectCurrentRoverResource();
          }
        }

        // Button 3 (Y / Triangle): Quick Selection Cross Menu on Bonsai / Store Decor
        if (justPressed(3)) {
          if (locationRef.current === 'SANCTUARY') {
            if (quickRadialBonsai) {
              setQuickRadialBonsai(null);
              gameAudio.playCrispClick();
            } else if (nearbyStructureIdRef.current) {
              dismantleDeployedStructure(nearbyStructureIdRef.current);
            } else if (nearbyBonsaiIdRef.current) {
              const b = plantedBonsaisRef.current.find((tree) => tree.id === nearbyBonsaiIdRef.current);
              if (b) {
                setQuickRadialBonsai(b);
                gameAudio.playCrispClick();
              }
            } else {
              setIsUnifiedStorageOpen((prev) => !prev);
              gameAudio.playCrispClick();
            }
          }
        }

        // Button 4 (LB / Left Bumper): Cycle / Tabs Left
        if (justPressed(4)) {
          if (placementPreviewRef.current?.payload === 'torii_gate') {
            togglePreviewOrientation();
            return;
          }
          window.dispatchEvent(new CustomEvent('gamepad-bumper', { detail: { direction: 'left' } }));
          if (isShopModalOpen) {
            const tabs: ('MAPS' | 'EXPANSIONS' | 'DECOR' | 'GUIDES' | 'EQUIPMENT')[] = ['MAPS', 'EXPANSIONS', 'DECOR', 'GUIDES', 'EQUIPMENT'];
            setShopTab((t) => tabs[(tabs.indexOf(t) - 1 + tabs.length) % tabs.length]);
            gameAudio.playCrispClick();
          } else if (isWorkbenchModalOpen) {
            const tabs: WorkbenchCategory[] = ['resources', 'bonsai_automatons', 'workbench', 'rover', 'electricity'];
            setWorkbenchTab((t) => tabs[(tabs.indexOf(t) - 1 + tabs.length) % tabs.length]);
            gameAudio.playCrispClick();
          } else if (isBiomeSelectOpen) {
            setGarageTab((t) => (t === 'expeditions' ? 'loadout' : 'expeditions'));
            gameAudio.playCrispClick();
          } else if (isUnifiedStorageOpen) {
            const tabs: ('PLANTING' | 'MATERIALS' | 'EQUIPMENT' | 'DECOR')[] = ['PLANTING', 'MATERIALS', 'EQUIPMENT', 'DECOR'];
            setStorageTab((t) => tabs[(tabs.indexOf(t) - 1 + tabs.length) % tabs.length]);
            gameAudio.playCrispClick();
          } else if (isHowToPlayOpen) {
            setGuidebookChapter((c) => (c > 1 ? c - 1 : 5));
            gameAudio.playCrispClick();
          }
        }

        // Button 5 (RB / Right Bumper): Cycle / Tabs Right
        if (justPressed(5)) {
          if (placementPreviewRef.current?.payload === 'torii_gate') {
            togglePreviewOrientation();
            return;
          }
          window.dispatchEvent(new CustomEvent('gamepad-bumper', { detail: { direction: 'right' } }));
          if (isShopModalOpen) {
            const tabs: ('MAPS' | 'EXPANSIONS' | 'DECOR' | 'GUIDES' | 'EQUIPMENT')[] = ['MAPS', 'EXPANSIONS', 'DECOR', 'GUIDES', 'EQUIPMENT'];
            setShopTab((t) => tabs[(tabs.indexOf(t) + 1) % tabs.length]);
            gameAudio.playCrispClick();
          } else if (isWorkbenchModalOpen) {
            const tabs: WorkbenchCategory[] = ['resources', 'bonsai_automatons', 'workbench', 'rover', 'electricity'];
            setWorkbenchTab((t) => tabs[(tabs.indexOf(t) + 1) % tabs.length]);
            gameAudio.playCrispClick();
          } else if (isBiomeSelectOpen) {
            setGarageTab((t) => (t === 'expeditions' ? 'loadout' : 'expeditions'));
            gameAudio.playCrispClick();
          } else if (isUnifiedStorageOpen) {
            const tabs: ('PLANTING' | 'MATERIALS' | 'EQUIPMENT' | 'DECOR')[] = ['PLANTING', 'MATERIALS', 'EQUIPMENT', 'DECOR'];
            setStorageTab((t) => tabs[(tabs.indexOf(t) + 1) % tabs.length]);
            gameAudio.playCrispClick();
          } else if (isHowToPlayOpen) {
            setGuidebookChapter((c) => (c < 5 ? c + 1 : 1));
            gameAudio.playCrispClick();
          }
        }

        // Button 8 (Select / View / -): Toggle Game Menu & Settings
        if (justPressed(8)) {
          if (isGameMenuOpen) {
            setIsGameMenuOpen(false);
          } else {
            setIsGameMenuOpen(true);
          }
          gameAudio.playCrispClick();
        }

        // Button 9 (Start / Menu / Options / +): Toggle Nursery Inventory
        if (justPressed(9)) {
          if (locationRef.current === 'SANCTUARY') {
            setIsUnifiedStorageOpen((prev) => !prev);
            gameAudio.playCrispClick();
          }
        }

        // D-Pad buttons when Quick Radial Menu is open
        if (quickRadialBonsai) {
          if (justPressed(12) || (rawAxisY < -0.5 && lastBtns[12] === false)) {
            // Up: Quick Sell
            donatePlantedBonsai(quickRadialBonsai.id);
            setQuickRadialBonsai(null);
          } else if (justPressed(13) || (rawAxisY > 0.5 && lastBtns[13] === false)) {
            // Down: Store Bonsai
            pickUpBonsaiToInventory(quickRadialBonsai.id);
            setQuickRadialBonsai(null);
          } else if (justPressed(14) || (rawAxisX < -0.5 && lastBtns[14] === false)) {
            // Left: Give Compost
            if (sanctuaryInventoryRef.current.organic_compost > 0) {
              applyOrganicCompost(quickRadialBonsai.id);
              setQuickRadialBonsai(null);
            } else {
              gameAudio.playErrorBuzz();
              triggerNotification('No Enriched Organic Compost in stock! Craft at Workbench.', '#ef4444');
            }
          } else if (justPressed(15) || (rawAxisX > 0.5 && lastBtns[15] === false)) {
            // Right: Give Fertilizer (locked)
            gameAudio.playErrorBuzz();
            triggerNotification('🧪 Chemical Fertilizer research locked! Coming in future updates.', '#94a3b8');
          }
        }

        lastGamepadButtonsRef.current = buttons.map((b) => b.pressed);
      } else {
        lastGamepadButtonsRef.current = [];
      }

      if (gameStateRef.current.status !== 'PLAYING') return;

      // 1. Daylight & Turbine Rotation
      const daySpeed = (getConfig('dayCycleSpeed') as number) || 1.0;
      daylightCycleRef.current =
        (daylightCycleRef.current + dt * 0.015 * daySpeed) % 1.0;
      turbineAngleRef.current += dt * 3.5;

      // 2. Sanctuary Avatar Movement (only when in Sanctuary & no blocking modal/overlay)
      const isAnyModalBlockingInput =
        isGameMenuOpen ||
        isHowToPlayOpen ||
        excursionReport !== null ||
        excavationResult !== null ||
        digStateRef.current.active ||
        inspectingBonsaiId !== null ||
        inspectingStructureId !== null ||
        isUnifiedStorageOpen ||
        isPlantingModalOpen ||
        isWorkbenchModalOpen ||
        isZenSkillsModalOpen ||
        isShopModalOpen ||
        isBiomeSelectOpen ||
        isGoalModalOpen;

      if (locationRef.current === 'SANCTUARY' && !isAnyModalBlockingInput) {
        const baseSpeed = (getConfig('playerWalkSpeed') as number) || 220;

        // Check if player is standing on a Zen Pebble Stepping Path or Station Promenade Walkway
        const {x: snapAvX, y: snapAvY} = snapToSanctuaryGrid(av.x, av.y);
        const promenadeLeft = SANCTUARY_GRID.startX - SANCTUARY_GRID.cellW / 2;
        const promenadeRight = SANCTUARY_GRID.startX + (SANCTUARY_GRID.cols - 0.5) * SANCTUARY_GRID.cellW;
        const inPromenadeCorridor =
          av.y >= 180 && av.y <= 250 && av.x >= promenadeLeft && av.x <= promenadeRight;
        const onGridPebblePath = deployedStructuresRef.current.some(
          (s) => s.type === 'decor_pebble_path' && Math.hypot(s.x - snapAvX, s.y - snapAvY) < 32
        );
        const onToriiGateCenter = deployedStructuresRef.current.some(
          (s) => s.type === 'torii_gate' && Math.hypot(s.x - snapAvX, s.y - snapAvY) < 32
        );
        const onPebblePath = inPromenadeCorridor || onGridPebblePath || onToriiGateCenter;
        const speedMultiplier = onPebblePath ? 1.35 : 1.0;
        const moveSpeed = baseSpeed * speedMultiplier;

        let moveX = 0;
        let moveY = 0;

        if (input.actions.left) moveX -= 1;
        if (input.actions.right) moveX += 1;
        if (input.actions.up) moveY -= 1;
        if (input.actions.down) moveY += 1;

        if (moveX !== 0 && moveY !== 0) {
          moveX *= 0.7071;
          moveY *= 0.7071;
        }

        if (gpMoveX !== 0 || gpMoveY !== 0) {
          moveX += gpMoveX;
          moveY += gpMoveY;
          const len = Math.hypot(moveX, moveY);
          if (len > 1) {
            moveX /= len;
            moveY /= len;
          }
        }

        av.vx = moveX * moveSpeed;
        av.vy = moveY * moveSpeed;

        av.x += av.vx * dt;
        av.y += av.vy * dt;

        av.x = Math.max(av.radius + 30, Math.min(canvasWidth - av.radius - 30, av.x));
        av.y = Math.max(av.radius + 60, Math.min(SANCTUARY_WORLD_HEIGHT - av.radius - 40, av.y));

        av.isMoving = moveX !== 0 || moveY !== 0;
        if (av.isMoving) {
          av.walkFrame += dt * (onPebblePath ? 11 : 8);
          if (Math.abs(moveX) > Math.abs(moveY)) {
            av.facing = moveX > 0 ? 'right' : 'left';
          } else {
            av.facing = moveY > 0 ? 'down' : 'up';
          }

          av.stepSoundTimer += dt;
          if (av.stepSoundTimer > (onPebblePath ? 0.24 : 0.32)) {
            av.stepSoundTimer = 0;
            if (onPebblePath) {
              gameAudio.playCrispClick();
            } else {
              gameAudio.playFootstepWood();
            }
          }

          // Pebble path swift stepping trail particles
          if (onPebblePath && Math.random() < 0.15) {
            emitParticle(
              av.x + (Math.random() - 0.5) * 10,
              av.y + 12,
              -av.vx * 0.1,
              -5,
              2,
              '#94a3b8',
              0.3,
            );
          }
        }
      }

      // Vertical Sanctuary Camera Tracking
      if (locationRef.current === 'SANCTUARY') {
        const targetSanctuaryCamY = Math.max(
          0,
          Math.min(SANCTUARY_WORLD_HEIGHT - canvasHeight, av.y - canvasHeight / 2)
        );
        sanctuaryCameraRef.current.y += (targetSanctuaryCamY - sanctuaryCameraRef.current.y) * Math.min(1.0, dt * 8);
      }

      // 3. Power Grid Calculation (Runs globally)
      const power = getPowerMetrics();
      const growthMult = (getConfig('growthSpeedMultiplier') as number) || 1.0;
      const hydroMult = 1.0 + (zenSkillsRef.current.hydrodynamics || 0) * 0.2;

      // 4. REAL-TIME CONTINUOUS SIMULATION (ALWAYS RUNS: IN SANCTUARY, ON EXPEDITIONS, AND IN MODALS)
      // 4a. Bonsai Growth, Hydration Decay & Automaton Watering
      plantedBonsaisRef.current.forEach((bonsai) => {
        const synergies = getCachedBonsaiSynergies(bonsai);

        let pruneMult = 1.0;
        if (bonsai.pruneBoostTimer > 0) {
          bonsai.pruneBoostTimer = Math.max(0, bonsai.pruneBoostTimer - dt);
          pruneMult = 2.5;
        }

        let tierSpeed = 0;
        if (bonsai.automatonTier > 0) {
          const tConf = getAutomatonConfig(bonsai.automatonTier);
          tierSpeed = tConf?.speedMultiplier || 1.0;
        }

        if (bonsai.wateredTimer && bonsai.wateredTimer > 0) {
          bonsai.wateredTimer = Math.max(0, bonsai.wateredTimer - dt);
          if (!synergies.isStalled && bonsai.level < 100) {
            bonsai.waterSprayAnim = (bonsai.waterSprayAnim + dt * 4) % (Math.PI * 2);
            advanceBonsaiProgress(bonsai, dt * growthMult * synergies.growthMultiplier);
          }
        }

        if (bonsai.automatonTier > 0 && power.isPowerSufficient && bonsai.level < 100 && !synergies.isStalled) {
          const effectiveGrowth =
            dt * growthMult * pruneMult * hydroMult * tierSpeed * synergies.growthMultiplier;
          bonsai.waterSprayAnim = (bonsai.waterSprayAnim + dt * 4 * tierSpeed) % (Math.PI * 2);
          advanceBonsaiProgress(bonsai, effectiveGrowth);
        } else if (bonsai.automatonTier > 0 && power.isPowerSufficient) {
          // Sputter animation without growth advance when stalled
          bonsai.waterSprayAnim = (bonsai.waterSprayAnim + dt * 1.5) % (Math.PI * 2);
        }
      });

      // 4b. Deployed Structures Simulation (Compost Heap Decomposition & Well Groundwater Timer)
      deployedStructuresRef.current.forEach((s) => {
        if (s.type === 'tool_compost_heap') {
          s.depositedWaste = s.depositedWaste ?? 0;
          s.readyCompost = s.readyCompost ?? 0;
          s.timer = s.timer ?? 0;
          s.maxCapacity = s.maxCapacity ?? 20;

          if (s.depositedWaste >= 2) {
            s.timer += dt;
            if (s.timer >= 10) {
              // Batch decomposition: 2 Organic Waste -> 1 Enriched Organic Compost (strictly 10s duration)
              s.timer = 0;
              s.depositedWaste = Math.max(0, s.depositedWaste - 2);
              s.readyCompost = (s.readyCompost || 0) + 1;
              addFloatingText(s.x, s.y - 35, '+1 🌾 Compost Ready!', '#a3e635');
            }
          } else {
            s.timer = 0;
          }
        } else if (s.type === 'tool_garden_well') {
          s.activeWateringRemaining = s.activeWateringRemaining ?? 0;
          if (s.activeWateringRemaining > 0) {
            s.activeWateringRemaining = Math.max(0, s.activeWateringRemaining - dt);

            // Ambient water splash droplets around active well if currently in sanctuary
            if (locationRef.current === 'SANCTUARY' && Math.random() < 0.12) {
              emitParticle(
                s.x + (Math.random() - 0.5) * 28,
                s.y + (Math.random() - 0.5) * 14,
                (Math.random() - 0.5) * 10,
                -10,
                2,
                '#38bdf8',
                0.35,
              );
            }
          }
        }
      });

      // 4c. Workbench Active Timed Crafting Progress
      const activeCraft = activeCraftingRef.current;
      if (activeCraft) {
        if (power.isPowerSufficient) {
          const craftingSpeedMult = 1.0 + installedCraftingArmsRef.current * 0.25;
          activeCraft.remainingTime = Math.max(0, activeCraft.remainingTime - dt * craftingSpeedMult);

          if (activeCraft.remainingTime <= 0) {
            // Finish item crafting!
            const recipeId = activeCraft.recipeId;
            if (recipeId === 'tier1_automaton') inv.automatons_tier1 += 1;
            else if (recipeId === 'tier2_automaton') inv.automatons_tier2 += 1;
            else if (recipeId === 'tier3_automaton') inv.automatons_tier3 += 1;
            else if (recipeId === 'auto_fabricator') inv.auto_fabricators_inv += 1;
            else if (recipeId === 'solar_panel') {
              inv.solar_panels_inv = (inv.solar_panels_inv || 0) + 1;
              inv.solar_panel_inv = inv.solar_panels_inv;
              inv.solarPanels = inv.solar_panels_inv;
            } else if (recipeId === 'wind_turbine') {
              inv.wind_turbines_inv = (inv.wind_turbines_inv || 0) + 1;
              inv.wind_turbine_inv = inv.wind_turbines_inv;
              inv.windTurbines = inv.wind_turbines_inv;
            } else if (recipeId === 'craft_enriched_compost') {
              inv.organic_compost = (inv.organic_compost || 0) + 1;
              inv.enrichedCompost = inv.organic_compost;
            } else if (recipeId === 'craft_copper_wire') {
              inv.copper_wire = (inv.copper_wire || 0) + 1;
              inv.copperWire = inv.copper_wire;
            } else if (recipeId === 'craft_gears') {
              inv.brass_gears = (inv.brass_gears || 0) + 1;
              inv.gears = inv.brass_gears;
            } else if (recipeId === 'craft_microcircuits') {
              inv.circuit_boards = (inv.circuit_boards || 0) + 1;
              inv.microcircuits = inv.circuit_boards;
            } else if (recipeId === 'craft_quantum_chips') {
              inv.electronic_chips = (inv.electronic_chips || 0) + 1;
              inv.chips = inv.quantumChips = inv.electronic_chips;
            } else if (recipeId === 'crafting_automaton') inv.crafting_automatons_inv += 1;
            else if (recipeId === 'rover_storage_module_1') {
              inv.rover_modules.storage_1 = (inv.rover_modules.storage_1 || 0) + 1;
              if (inv.roverModules) inv.roverModules.storage_1 = inv.rover_modules.storage_1;
              gameAudio.playLevelUpStinger();
              triggerNotification('📦 Crafted Storage Module I (+2.5 kg)! Attach in Rover Loadout.', '#38bdf8');
            } else if (recipeId === 'rover_storage_module_2') {
              inv.rover_modules.storage_2 = (inv.rover_modules.storage_2 || 0) + 1;
              if (inv.roverModules) inv.roverModules.storage_2 = inv.rover_modules.storage_2;
              gameAudio.playLevelUpStinger();
              triggerNotification('📦 Crafted Storage Module II (+5.0 kg)! Attach in Rover Loadout.', '#38bdf8');
            } else if (recipeId === 'rover_storage_module_3') {
              inv.rover_modules.storage_3 = (inv.rover_modules.storage_3 || 0) + 1;
              if (inv.roverModules) inv.roverModules.storage_3 = inv.rover_modules.storage_3;
              gameAudio.playLevelUpStinger();
              triggerNotification('🚜 Crafted Storage Module III (+7.5 kg)! Attach in Rover Loadout.', '#38bdf8');
            } else if (recipeId === 'rover_battery_module_1') {
              inv.rover_modules.battery_1 = (inv.rover_modules.battery_1 || 0) + 1;
              if (inv.roverModules) inv.roverModules.battery_1 = inv.rover_modules.battery_1;
              gameAudio.playLevelUpStinger();
              triggerNotification('🔋 Crafted Battery Module I (+25 kWh)! Attach in Rover Loadout.', '#f59e0b');
            } else if (recipeId === 'rover_battery_module_2') {
              inv.rover_modules.battery_2 = (inv.rover_modules.battery_2 || 0) + 1;
              if (inv.roverModules) inv.roverModules.battery_2 = inv.rover_modules.battery_2;
              gameAudio.playLevelUpStinger();
              triggerNotification('⚡ Crafted Battery Module II (+50 kWh)! Attach in Rover Loadout.', '#f59e0b');
            } else if (recipeId === 'rover_battery_module_3') {
              inv.rover_modules.battery_3 = (inv.rover_modules.battery_3 || 0) + 1;
              if (inv.roverModules) inv.roverModules.battery_3 = inv.rover_modules.battery_3;
              gameAudio.playLevelUpStinger();
              triggerNotification('✨ Crafted Battery Module III (+75 kWh)! Attach in Rover Loadout.', '#f59e0b');
            } else if (recipeId === 'rover_radar_module_1') {
              inv.rover_modules.radar_1 = (inv.rover_modules.radar_1 || 0) + 1;
              if (inv.roverModules) inv.roverModules.radar_1 = inv.rover_modules.radar_1;
              gameAudio.playLevelUpStinger();
              triggerNotification('📡 Crafted Radar Module I (+1 Step)! Attach in Rover Loadout.', '#38bdf8');
            } else if (recipeId === 'rover_radar_module_2') {
              inv.rover_modules.radar_2 = (inv.rover_modules.radar_2 || 0) + 1;
              if (inv.roverModules) inv.roverModules.radar_2 = inv.rover_modules.radar_2;
              gameAudio.playLevelUpStinger();
              triggerNotification('📡 Crafted Radar Module II (+2 Steps)! Attach in Rover Loadout.', '#38bdf8');
            } else if (recipeId === 'rover_radar_module_3') {
              inv.rover_modules.radar_3 = (inv.rover_modules.radar_3 || 0) + 1;
              if (inv.roverModules) inv.roverModules.radar_3 = inv.rover_modules.radar_3;
              gameAudio.playLevelUpStinger();
              triggerNotification('📡 Crafted Radar Module III (+3 Steps)! Attach in Rover Loadout.', '#38bdf8');
            } else if (recipeId === 'rover_chassis_t2') {
              inv.rover_chassis_tier = 2;
              gameAudio.playLevelUpStinger();
              triggerNotification('🚜 Upgraded Rover to Surveyor Chassis (Tier 2)! Capacity: 5 Slots', '#38bdf8');
            } else if (recipeId === 'rover_chassis_t3') {
              inv.rover_chassis_tier = 3;
              gameAudio.playLevelUpStinger();
              triggerNotification('👑 Upgraded Rover to Vanguard Heavy Chassis (Tier 3)! Capacity: 10 Slots', '#f59e0b');
            } else if (recipeId === 'workbench_t2_upgrade') {
              inv.workbench_tier = 2;
              gameAudio.playLevelUpStinger();
              triggerNotification('🛠️ Upgraded to Tier 2 Precision Workbench! Automaton Capacity: 5', '#38bdf8');
            } else if (recipeId === 'workbench_t3_upgrade') {
              inv.workbench_tier = 3;
              gameAudio.playLevelUpStinger();
              triggerNotification('👑 Upgraded to Tier 3 Master Foundry! Automaton Capacity: 10', '#f59e0b');
            }

            gameAudio.playPowerupChime();
            addFloatingText(sanctuaryWorkbench.x + sanctuaryWorkbench.width / 2, sanctuaryWorkbench.y - 25, `🛠️ Crafted ${activeCraft.name}!`, '#38bdf8');
            if (recipeId !== 'workbench_t2_upgrade' && recipeId !== 'workbench_t3_upgrade') {
              triggerNotification(`🛠️ Crafted ${activeCraft.name}! (Placed in Inventory)`, '#38bdf8');
            }

            // Pop next queued craft
            activeCraftingRef.current = craftingQueueRef.current.shift() || null;
            refreshHud();
          }
        }
      }

      // 4d. Dedicated Auto-Fabrication Independent Production Lanes
      if (autoFabricatorLanesRef.current.length > 0 && power.isPowerSufficient) {
        autoFabricatorLanesRef.current.forEach((lane) => {
          if (lane.targetRecipeId === 'none') return;
          const targetRecipe = WORKBENCH_RECIPES[lane.targetRecipeId];
          if (!targetRecipe) return;

          const isGuideUnlocked = !targetRecipe.requiresGuide || inv[targetRecipe.requiresGuide];
          if (!isGuideUnlocked) return;

          const costs = targetRecipe.costs;

          if (lane.progressSeconds === 0) {
            // Check if ingredients exist in inventory to begin cycle
            const hasMaterials =
              (!costs.scrap_metal || (inv.scrap_metal ?? 0) >= costs.scrap_metal) &&
              (!costs.copper_wire || (inv.copper_wire ?? 0) >= costs.copper_wire) &&
              (!costs.brass_gears || (inv.brass_gears ?? 0) >= costs.brass_gears) &&
              (!costs.circuit_boards || (inv.circuit_boards ?? 0) >= costs.circuit_boards) &&
              (!costs.electronic_chips || (inv.electronic_chips ?? 0) >= costs.electronic_chips) &&
              (!costs.organic_waste || (inv.organic_waste ?? 0) >= costs.organic_waste);

            if (hasMaterials) {
              if (costs.scrap_metal) inv.scrap_metal -= costs.scrap_metal;
              if (costs.copper_wire) inv.copper_wire -= costs.copper_wire;
              if (costs.brass_gears) inv.brass_gears -= costs.brass_gears;
              if (costs.circuit_boards) inv.circuit_boards -= costs.circuit_boards;
              if (costs.electronic_chips) inv.electronic_chips -= costs.electronic_chips;
              if (costs.organic_waste) inv.organic_waste -= costs.organic_waste;

              lane.progressSeconds += dt;
            }
          } else {
            lane.progressSeconds += dt;

            if (lane.progressSeconds >= targetRecipe.durationSeconds) {
              const rid = targetRecipe.id;
              if (rid === 'tier1_automaton') inv.automatons_tier1 += 1;
              else if (rid === 'tier2_automaton') inv.automatons_tier2 += 1;
              else if (rid === 'tier3_automaton') inv.automatons_tier3 += 1;
              else if (rid === 'auto_fabricator') inv.auto_fabricators_inv += 1;
              else if (rid === 'solar_panel') {
                inv.solar_panels_inv = (inv.solar_panels_inv || 0) + 1;
                inv.solar_panel_inv = inv.solar_panels_inv;
                inv.solarPanels = inv.solar_panels_inv;
              } else if (rid === 'wind_turbine') {
                inv.wind_turbines_inv = (inv.wind_turbines_inv || 0) + 1;
                inv.wind_turbine_inv = inv.wind_turbines_inv;
                inv.windTurbines = inv.wind_turbines_inv;
              } else if (rid === 'craft_enriched_compost') {
                inv.organic_compost = (inv.organic_compost || 0) + 1;
                inv.enrichedCompost = inv.organic_compost;
              } else if (rid === 'craft_copper_wire') {
                inv.copper_wire = (inv.copper_wire || 0) + 1;
                inv.copperWire = inv.copper_wire;
              } else if (rid === 'craft_gears') {
                inv.brass_gears = (inv.brass_gears || 0) + 1;
                inv.gears = inv.brass_gears;
              } else if (rid === 'craft_microcircuits') {
                inv.circuit_boards = (inv.circuit_boards || 0) + 1;
                inv.microcircuits = inv.circuit_boards;
              } else if (rid === 'craft_quantum_chips') {
                inv.electronic_chips = (inv.electronic_chips || 0) + 1;
                inv.chips = inv.quantumChips = inv.electronic_chips;
              } else if (rid === 'crafting_automaton') inv.crafting_automatons_inv += 1;
              else if (rid === 'rover_storage_module_1') {
                inv.rover_modules.storage_1 = (inv.rover_modules.storage_1 || 0) + 1;
                if (inv.roverModules) inv.roverModules.storage_1 = inv.rover_modules.storage_1;
              } else if (rid === 'rover_storage_module_2') {
                inv.rover_modules.storage_2 = (inv.rover_modules.storage_2 || 0) + 1;
                if (inv.roverModules) inv.roverModules.storage_2 = inv.rover_modules.storage_2;
              } else if (rid === 'rover_storage_module_3') {
                inv.rover_modules.storage_3 = (inv.rover_modules.storage_3 || 0) + 1;
                if (inv.roverModules) inv.roverModules.storage_3 = inv.rover_modules.storage_3;
              } else if (rid === 'rover_battery_module_1') {
                inv.rover_modules.battery_1 = (inv.rover_modules.battery_1 || 0) + 1;
                if (inv.roverModules) inv.roverModules.battery_1 = inv.rover_modules.battery_1;
              } else if (rid === 'rover_battery_module_2') {
                inv.rover_modules.battery_2 = (inv.rover_modules.battery_2 || 0) + 1;
                if (inv.roverModules) inv.roverModules.battery_2 = inv.rover_modules.battery_2;
              } else if (rid === 'rover_battery_module_3') {
                inv.rover_modules.battery_3 = (inv.rover_modules.battery_3 || 0) + 1;
                if (inv.roverModules) inv.roverModules.battery_3 = inv.rover_modules.battery_3;
              } else if (rid === 'rover_radar_module_1') {
                inv.rover_modules.radar_1 = (inv.rover_modules.radar_1 || 0) + 1;
                if (inv.roverModules) inv.roverModules.radar_1 = inv.rover_modules.radar_1;
              } else if (rid === 'rover_radar_module_2') {
                inv.rover_modules.radar_2 = (inv.rover_modules.radar_2 || 0) + 1;
                if (inv.roverModules) inv.roverModules.radar_2 = inv.rover_modules.radar_2;
              } else if (rid === 'rover_radar_module_3') {
                inv.rover_modules.radar_3 = (inv.rover_modules.radar_3 || 0) + 1;
                if (inv.roverModules) inv.roverModules.radar_3 = inv.rover_modules.radar_3;
              }

              lane.progressSeconds = 0;
              addFloatingText(sanctuaryWorkbench.x + sanctuaryWorkbench.width / 2, sanctuaryWorkbench.y - 35, `🤖 Auto-Produced ${targetRecipe.name}!`, '#38bdf8');
              refreshHud();
            }
          }
        });
      }

      // 4e. Sanctuary-Only Interaction & Proximity Checking (only when in Sanctuary)
      if (locationRef.current === 'SANCTUARY') {
        const zenLib = sanctuaryZenLibrary;
        const zenLibCenterX = zenLib.x + zenLib.width / 2;
        const zenLibCenterY = zenLib.y + zenLib.height / 2;
        const isZenNear =
          Math.abs(av.x - zenLibCenterX) < zenLib.width / 2 + 25 &&
          Math.abs(av.y - zenLibCenterY) < zenLib.height / 2 + 35;
        if (isNearZenLibraryRef.current !== isZenNear) {
          isNearZenLibraryRef.current = isZenNear;
          setIsNearZenLibrary(isZenNear);
        }

        const wb = sanctuaryWorkbench;
        const wbCenterX = wb.x + wb.width / 2;
        const wbCenterY = wb.y + wb.height / 2;
        const isWbNear =
          Math.abs(av.x - wbCenterX) < wb.width / 2 + 25 &&
          Math.abs(av.y - wbCenterY) < wb.height / 2 + 35;
        if (isNearWorkbenchRef.current !== isWbNear) {
          isNearWorkbenchRef.current = isWbNear;
          setIsNearWorkbench(isWbNear);
        }

        const society = sanctuaryBonsaiSociety;
        const societyCenterX = society.x + society.width / 2;
        const societyCenterY = society.y + society.height / 2;
        const isSocietyNear =
          Math.abs(av.x - societyCenterX) < society.width / 2 + 25 &&
          Math.abs(av.y - societyCenterY) < society.height / 2 + 35;
        if (isNearBonsaiSocietyRef.current !== isSocietyNear) {
          isNearBonsaiSocietyRef.current = isSocietyNear;
          setIsNearBonsaiSociety(isSocietyNear);
        }

        const garage = sanctuaryRoverGarage;
        const garageCenterX = garage.x + garage.width / 2;
        const garageCenterY = garage.y + garage.height / 2;
        const isGarageNear =
          Math.abs(av.x - garageCenterX) < garage.width / 2 + 25 &&
          Math.abs(av.y - garageCenterY) < garage.height / 2 + 35;
        if (isNearGarageRef.current !== isGarageNear) {
          isNearGarageRef.current = isGarageNear;
          setIsNearGarage(isGarageNear);
        }

        const shop = sanctuaryShopStand;
        const shopCenterX = shop.x + shop.width / 2;
        const shopCenterY = shop.y + shop.height / 2;
        const isShopNear =
          Math.abs(av.x - shopCenterX) < shop.width / 2 + 25 &&
          Math.abs(av.y - shopCenterY) < shop.height / 2 + 35;
        if (isNearShopRef.current !== isShopNear) {
          isNearShopRef.current = isShopNear;
          setIsNearShop(isShopNear);
        }

        let closestBonsai: PlantedBonsai | null = null;
        let minBonsaiDist = Infinity;
        const halfTileW = SANCTUARY_GRID.cellW / 2;
        const halfTileH = SANCTUARY_GRID.cellH / 2;

        plantedBonsaisRef.current.forEach((bonsai) => {
          const dx = Math.abs(av.x - bonsai.x);
          const dy = Math.abs(av.y - bonsai.y);
          const dist = Math.hypot(av.x - bonsai.x, av.y - bonsai.y);
          const isWithinTile = dx <= halfTileW + 4 && dy <= halfTileH + 4;
          if (isWithinTile && dist < minBonsaiDist) {
            minBonsaiDist = dist;
            closestBonsai = bonsai;
          }
        });

        const nextBonsaiId = closestBonsai ? (closestBonsai as PlantedBonsai).id : null;
        if (nearbyBonsaiIdRef.current !== nextBonsaiId) {
          nearbyBonsaiIdRef.current = nextBonsaiId;
          setNearbyBonsai(closestBonsai);
        }

        let closestStruct: DeployedStructure | null = null;
        let minStructDist = Infinity;
        for (const s of deployedStructuresRef.current) {
          const dist = Math.hypot(av.x - s.x, av.y - s.y);
          let isWithinTile = false;
          if (s.type === 'torii_gate') {
            if (s.orientation === 'vertical') {
              const dx = Math.abs(av.x - s.x);
              const dy = Math.abs(av.y - s.y);
              isWithinTile = dx <= halfTileW + 4 && dy <= SANCTUARY_GRID.cellH + halfTileH + 4;
            } else {
              const dx = Math.abs(av.x - s.x);
              const dy = Math.abs(av.y - s.y);
              isWithinTile = dx <= SANCTUARY_GRID.cellW + halfTileW + 4 && dy <= halfTileH + 4;
            }
          } else {
            const dx = Math.abs(av.x - s.x);
            const dy = Math.abs(av.y - s.y);
            isWithinTile = dx <= halfTileW + 4 && dy <= halfTileH + 4;
          }
          if (isWithinTile && dist < minStructDist) {
            minStructDist = dist;
            closestStruct = s;
          }
        }
        const nextStructId = closestStruct ? (closestStruct as DeployedStructure).id : null;
        if (nearbyStructureIdRef.current !== nextStructId) {
          nearbyStructureIdRef.current = nextStructId;
          setNearbyStructure(closestStruct);
        }

        const currentPlot = getPlotAtCoords(av.x, av.y, inv.sanctuary_expansion_tier || 0);
        activePlotRef.current = currentPlot;

        if (placementPreviewRef.current) {
          const prevPlot = getPreviewPlot(av.x, av.y, inv.sanctuary_expansion_tier || 0);
          const pKey = `${prevPlot.col},${prevPlot.row},${placementPreviewRef.current.orientation}`;
          if (lastPreviewPlotKeyRef.current !== pKey) {
            lastPreviewPlotKeyRef.current = pKey;
            refreshHud();
          }
        }

        const isAnyStationNear = isZenNear || isWbNear || isSocietyNear || isGarageNear || isShopNear;
        const isPlotEmpty =
          currentPlot !== null &&
          currentPlot.isUnlocked &&
          !closestBonsai &&
          !closestStruct &&
          !isAnyStationNear &&
          !plantedBonsaisRef.current.some((b) => Math.hypot(b.x - currentPlot.centerX, b.y - currentPlot.centerY) < 30) &&
          !deployedStructuresRef.current.some((s) => Math.hypot(s.x - currentPlot.centerX, s.y - currentPlot.centerY) < 30);

        const currentPlotKey = isPlotEmpty && currentPlot ? `empty_${currentPlot.col}_${currentPlot.row}` : '';
        if (standingPlotKeyRef.current !== currentPlotKey) {
          standingPlotKeyRef.current = currentPlotKey;
          setStandingPlot(isPlotEmpty && currentPlot ? {
            col: currentPlot.col,
            row: currentPlot.row,
            x: currentPlot.centerX,
            y: currentPlot.centerY,
          } : null);
        }

        const activeStruct = closestStruct as DeployedStructure | null;
        if (activeStruct) {
          const isWellWatering = activeStruct.type === 'tool_garden_well' && (activeStruct.activeWateringRemaining || 0) > 0;
          const hasCompostReady = activeStruct.type === 'tool_compost_heap' && (activeStruct.readyCompost || 0) > 0;
          if (
            (activeStruct.type === 'tool_garden_well' && isWellWatering !== lastWellWateringRef.current) ||
            (activeStruct.type === 'tool_compost_heap' && hasCompostReady !== lastCompostReadyRef.current)
          ) {
            lastWellWateringRef.current = isWellWatering;
            lastCompostReadyRef.current = hasCompostReady;
            refreshHud();
          }
        }
      }

      // 5. Excursion Scrolling Camera, Visual Interpolation & Continuous Hold-to-Drive
      if (locationRef.current === 'EXCURSION') {
        const rover = roverRef.current;

        // Continuous Smooth Driving while holding WASD / Arrow keys or Gamepad Stick / D-Pad
        if (!digStateRef.current.active && !excursionReport && !excavationResult && !isGameMenuOpen && !isHowToPlayOpen) {
          rover.moveCooldown = Math.max(0, rover.moveCooldown - dt);

          if (rover.moveCooldown <= 0) {
            let rdx = 0;
            let rdy = 0;
            if (input.actions.left) rdx -= 1;
            else if (input.actions.right) rdx += 1;
            else if (input.actions.up) rdy -= 1;
            else if (input.actions.down) rdy += 1;

            if (rdx === 0 && rdy === 0 && (Math.abs(gpMoveX) > 0.35 || Math.abs(gpMoveY) > 0.35)) {
              if (Math.abs(gpMoveX) > Math.abs(gpMoveY)) {
                rdx = gpMoveX > 0 ? 1 : -1;
              } else {
                rdy = gpMoveY > 0 ? 1 : -1;
              }
            }

            if (rdx !== 0 || rdy !== 0) {
              attemptRoverStep(rdx, rdy);
              rover.moveCooldown = 0.18; // ~180ms smooth step interval
            }
          }
        }

        const targetVisualX = rover.tileX * EXCURSION_TILE_SIZE + EXCURSION_TILE_SIZE / 2;
        const targetVisualY = rover.tileY * EXCURSION_TILE_SIZE + EXCURSION_TILE_SIZE / 2;

        rover.visualX += (targetVisualX - rover.visualX) * Math.min(1.0, dt * 14);
        rover.visualY += (targetVisualY - rover.visualY) * Math.min(1.0, dt * 14);

        const targetCamX = rover.visualX - canvasWidth / 2;
        const targetCamY = rover.visualY - canvasHeight / 2;

        cameraRef.current.x += (targetCamX - cameraRef.current.x) * Math.min(1.0, dt * 10);
        cameraRef.current.y += (targetCamY - cameraRef.current.y) * Math.min(1.0, dt * 10);
      }

      // 6. Radial Shovel Needle Rotation
      const dig = digStateRef.current;
      if (dig.active && !excavationResult) {
        dig.needleAngle += dig.angularVelocity * dt;
        if (dig.wobbleTimer > 0) {
          dig.wobbleTimer = Math.max(0, dig.wobbleTimer - dt);
        }
      }

      // 7. Update Particles & Floating Text (Zero GC allocations)
      const pool = particlePoolRef.current;
      for (let i = 0; i < pool.length; i++) {
        const p = pool[i];
        if (!p.active) continue;
        p.life += dt;
        if (p.life >= p.maxLife) {
          p.active = false;
          continue;
        }
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.alpha = Math.max(0, 1 - p.life / p.maxLife);
      }

      floatingTextsRef.current = floatingTextsRef.current.filter((ft) => {
        ft.life += dt;
        ft.y -= dt * 28;
        ft.alpha = Math.max(0, 1 - ft.life / ft.maxLife);
        return ft.life < ft.maxLife;
      });
      if (floatingTextsRef.current.length > 10) {
        floatingTextsRef.current.splice(0, floatingTextsRef.current.length - 10);
      }

      // Update Live Score & Level
      const totalLevels = plantedBonsaisRef.current.reduce((acc, b) => acc + b.level, 0);
      const totalZen = sanctuaryInventoryRef.current.zen_essence;
      const totalCoins = sanctuaryInventoryRef.current.coins;
      const currentScore = totalLevels * 150 + totalZen * 10 + Math.floor(totalCoins / 5);
      const maxLvl = Math.max(1, ...plantedBonsaisRef.current.map((b) => b.level));

      setGameState((prev) => {
        if (prev.score === currentScore && prev.level === maxLvl) {
          return prev;
        }
        return {
          ...prev,
          score: currentScore,
          level: maxLvl,
        };
      });
    },
    [
      addFloatingText,
      advanceBonsaiProgress,
      cancelDiggingMinigame,
      canvasHeight,
      canvasWidth,
      collectCurrentRoverResource,
      depositHaulAndReturnToSanctuary,
      dismantleDeployedStructure,
      drawWaterFromWell,
      executeDigAttempt,
      excursionReport,
      excavationResult,
      finishExcursion,
      gainPlayerExp,
      getPowerMetrics,
      guidebookChapter,
      handleBonsaiLevelUp,
      handleCollectExcavatedSeedling,
      handleDeclineExcavatedSeedling,
      inspectingBonsaiId,
      inspectingStructureId,
      interactCompostHeapDirect,
      isBiomeSelectOpen,
      isGameMenuOpen,
      isGoalModalOpen,
      isHowToPlayOpen,
      isPlantingModalOpen,
      isShopModalOpen,
      isUnifiedStorageOpen,
      isWorkbenchModalOpen,
      isZenSkillsModalOpen,
      manualPruneBonsai,
      pickUpBonsaiToInventory,
      refreshHud,
      sanctuaryBonsaiSociety,
      sanctuaryRoverGarage,
      sanctuaryShopStand,
      sanctuaryWorkbench,
      sanctuaryZenLibrary,
      sdk,
      stylingModalSapling,
      triggerNotification,
      triggerRadialDig,
    ],
  );

  // --- CANVAS RENDERING ---
  const draw = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      prepareCanvas(ctx, canvasWidth, canvasHeight);

      const loc = locationRef.current;
      const dayFactor = Math.max(0, Math.sin(daylightCycleRef.current * Math.PI));
      const power = getPowerMetrics();

      if (loc === 'SANCTUARY') {
        const av = avatarRef.current;
        const sCamY = sanctuaryCameraRef.current.y;
        const halfTileW = (SANCTUARY_GRID.cellW - 8) / 2;
        const halfTileH = (SANCTUARY_GRID.cellH - 8) / 2;

        // Background covering full sanctuary vertical scroll space
        ctx.fillStyle = '#064e3b';
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        ctx.save();
        ctx.translate(0, -sCamY);

        // Draw parallax greenhouse background across entire world height
        drawBackground(
          ctx,
          assets['nursery_bg'],
          canvasWidth,
          SANCTUARY_WORLD_HEIGHT,
          '#064e3b',
          0,
          sCamY * 0.4,
        );

        // Render / Blit cached offscreen terrain (ambiance, promenade pebbles, flooring, 16x8 soil plots)
        if (!offscreenTerrainCanvasRef.current || offscreenTerrainDirtyRef.current) {
          renderOffscreenTerrain(canvasWidth, SANCTUARY_WORLD_HEIGHT);
        }
        if (offscreenTerrainCanvasRef.current) {
          ctx.drawImage(offscreenTerrainCanvasRef.current, 0, 0);
        }

        // Greenhouse Arched Glass Roof Ribs & Skylight God-Rays
        const rayAlpha = 0.05 + dayFactor * 0.12;
        const rayGrad1 = ctx.createLinearGradient(200, 0, 450, SANCTUARY_WORLD_HEIGHT);
        rayGrad1.addColorStop(0, `rgba(254, 240, 138, ${rayAlpha * 1.5})`);
        rayGrad1.addColorStop(1, 'rgba(254, 240, 138, 0)');
        ctx.fillStyle = rayGrad1;
        ctx.beginPath();
        ctx.moveTo(160, 0);
        ctx.lineTo(320, 0);
        ctx.lineTo(540, SANCTUARY_WORLD_HEIGHT);
        ctx.lineTo(260, SANCTUARY_WORLD_HEIGHT);
        ctx.closePath();
        ctx.fill();

        const rayGrad2 = ctx.createLinearGradient(580, 0, 850, SANCTUARY_WORLD_HEIGHT);
        rayGrad2.addColorStop(0, `rgba(254, 240, 138, ${rayAlpha * 1.3})`);
        rayGrad2.addColorStop(1, 'rgba(254, 240, 138, 0)');
        ctx.fillStyle = rayGrad2;
        ctx.beginPath();
        ctx.moveTo(560, 0);
        ctx.lineTo(720, 0);
        ctx.lineTo(950, SANCTUARY_WORLD_HEIGHT);
        ctx.lineTo(680, SANCTUARY_WORLD_HEIGHT);
        ctx.closePath();
        ctx.fill();

        // Top architectural honey-timber rafter beam at ceiling edge (Y=6)
        ctx.strokeStyle = '#451a03';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, 6);
        ctx.lineTo(canvasWidth, 6);
        ctx.stroke();

        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, 8);
        ctx.lineTo(canvasWidth, 8);
        ctx.stroke();

        // Delicate hanging ceiling wisteria floral vines along the very top edge (Y <= 20)
        for (let wx = 30; wx < canvasWidth - 20; wx += 38) {
          const vSeed = Math.sin(wx * 12.9898);
          const vLen = 8 + Math.abs(vSeed) * 12; // 8 to 20 px hanging length
          const vCurve = vSeed * 4;

          // Green wisteria vine tendril
          ctx.strokeStyle = '#059669';
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(wx, 8);
          ctx.quadraticCurveTo(wx + vCurve, 8 + vLen * 0.5, wx + vCurve * 0.7, 8 + vLen);
          ctx.stroke();

          // Hanging wisteria flower clusters (shades of lilac, violet, and soft orchid)
          const fCount = 3 + Math.floor(Math.abs(vSeed) * 3);
          const fColors = ['#a855f7', '#c084fc', '#e9d5ff', '#d8b4fe', '#9333ea'];
          for (let f = 0; f < fCount; f++) {
            const fProgress = (f + 1) / (fCount + 1);
            const fx = wx + vCurve * fProgress;
            const fy = 8 + vLen * fProgress;
            const fRad = (fCount - f) * 0.7 + 1.2;

            ctx.fillStyle = fColors[(f + Math.floor(Math.abs(vSeed) * 5)) % fColors.length];
            ctx.beginPath();
            ctx.ellipse(fx - 1.2, fy, fRad, fRad * 0.7, 0.2, 0, Math.PI * 2);
            ctx.fill();

            ctx.beginPath();
            ctx.ellipse(fx + 1.2, fy + 0.5, fRad * 0.9, fRad * 0.6, -0.2, 0, Math.PI * 2);
            ctx.fill();
          }

          // Top leaf sprig at ceiling joint
          ctx.fillStyle = '#10b981';
          ctx.beginPath();
          ctx.ellipse(wx - 2, 8, 2.5, 1.2, -0.4, 0, Math.PI * 2);
          ctx.ellipse(wx + 2, 8, 2.5, 1.2, 0.4, 0, Math.PI * 2);
          ctx.fill();
        }

        // Floating ambient light dust motes
        const moteTime = Date.now() * 0.001;
        for (let m = 0; m < 16; m++) {
          const mx = ((m * 107 + moteTime * 18) % (canvasWidth - 100)) + 50;
          const my = ((m * 67 + Math.sin(moteTime + m) * 25) % (SANCTUARY_WORLD_HEIGHT - 160)) + 120;
          const mAlpha = 0.25 + Math.sin(moteTime * 2 + m) * 0.2;
          ctx.fillStyle = `rgba(254, 240, 138, ${mAlpha})`;
          ctx.beginPath();
          ctx.arc(mx, my, 1.5, 0, Math.PI * 2);
          ctx.fill();
        }

        // =========================================================================
        // STATION 1 (FAR LEFT): ZEN LIBRARY (COZY BOTANICAL LIBRARY PAVILION)
        // =========================================================================
        const zenLib = sanctuaryZenLibrary;
        ctx.save();
        if (isNearZenLibrary) {
          ctx.strokeStyle = '#f472b6';
          ctx.lineWidth = 3;
          ctx.setLineDash([4, 4]);
          ctx.strokeRect(zenLib.x - 8, zenLib.y - 8, zenLib.width + 16, zenLib.height + 16);
          ctx.setLineDash([]);
        }

        // Platform base shadow
        ctx.fillStyle = 'rgba(0,0,0,0.55)';
        ctx.beginPath();
        ctx.roundRect(zenLib.x + 4, zenLib.y + 8, zenLib.width, zenLib.height, 10);
        ctx.fill();

        // Warm cedar & dark chestnut pavilion chassis
        const zBaseGrad = ctx.createLinearGradient(zenLib.x, zenLib.y, zenLib.x, zenLib.y + zenLib.height);
        zBaseGrad.addColorStop(0, '#5c2b09');
        zBaseGrad.addColorStop(0.5, '#451a03');
        zBaseGrad.addColorStop(1, '#291102');
        ctx.fillStyle = zBaseGrad;
        ctx.beginPath();
        ctx.roundRect(zenLib.x, zenLib.y, zenLib.width, zenLib.height, 10);
        ctx.fill();
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Polished honey-oak floor planks
        const zFloorGrad = ctx.createLinearGradient(zenLib.x, zenLib.y + 20, zenLib.x, zenLib.y + zenLib.height);
        zFloorGrad.addColorStop(0, '#78350f');
        zFloorGrad.addColorStop(0.5, '#92400e');
        zFloorGrad.addColorStop(1, '#78350f');
        ctx.fillStyle = zFloorGrad;
        ctx.beginPath();
        ctx.roundRect(zenLib.x + 6, zenLib.y + 18, zenLib.width - 12, zenLib.height - 24, 6);
        ctx.fill();

        // Parquet plank seams
        ctx.strokeStyle = 'rgba(254, 240, 138, 0.12)';
        ctx.lineWidth = 1;
        for (let py = zenLib.y + 36; py < zenLib.y + zenLib.height - 10; py += 18) {
          ctx.beginPath();
          ctx.moveTo(zenLib.x + 8, py);
          ctx.lineTo(zenLib.x + zenLib.width - 8, py);
          ctx.stroke();
        }

        // Traditional Japanese pitched cedar roof eave with curved overhang
        ctx.fillStyle = '#291102';
        ctx.beginPath();
        ctx.moveTo(zenLib.x - 6, zenLib.y + 14);
        ctx.quadraticCurveTo(zenLib.x + zenLib.width / 2, zenLib.y - 6, zenLib.x + zenLib.width + 6, zenLib.y + 14);
        ctx.lineTo(zenLib.x + zenLib.width - 4, zenLib.y + 20);
        ctx.quadraticCurveTo(zenLib.x + zenLib.width / 2, zenLib.y + 2, zenLib.x + 4, zenLib.y + 20);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Brass corner brackets on roof eave
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(zenLib.x - 4, zenLib.y + 14, 8, 3);
        ctx.fillRect(zenLib.x + zenLib.width - 4, zenLib.y + 14, 8, 3);

        // --- LEFT / BACK: WARM CEDAR BOOKSHELVES WITH BOOKS & SCROLLS ---
        const shelfX = zenLib.x + 10;
        const shelfY = zenLib.y + 24;
        const shelfW = 76;
        const shelfH = zenLib.height - 34;

        // Shelf case frame
        ctx.fillStyle = '#451a03';
        ctx.beginPath();
        ctx.roundRect(shelfX, shelfY, shelfW, shelfH, 4);
        ctx.fill();
        ctx.strokeStyle = '#92400e';
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // 3 Shelf horizontal timber ledges
        const shelfTiers = 3;
        for (let t = 1; t < shelfTiers; t++) {
          const ly = shelfY + (shelfH / shelfTiers) * t;
          ctx.fillStyle = '#b45309';
          ctx.fillRect(shelfX + 2, ly, shelfW - 4, 3);
          ctx.strokeStyle = '#f59e0b';
          ctx.lineWidth = 0.6;
          ctx.strokeRect(shelfX + 2, ly, shelfW - 4, 3);
        }

        // Books on shelves (diverse leather/cloth spines: navy, emerald, terracotta, gold, purple)
        const bookSpineColors = [
          '#1e3a8a', '#065f46', '#991b1b', '#854d0e', '#581c87',
          '#0f766e', '#b45309', '#1e293b', '#15803d', '#701a75'
        ];

        // Tier 1 Books (Top shelf)
        let curBx = shelfX + 4;
        const t1Y = shelfY + 3;
        for (let b = 0; b < 7 && curBx < shelfX + shelfW - 16; b++) {
          const bw = 5 + (b % 3);
          const bh = 14 + (b % 4);
          ctx.fillStyle = bookSpineColors[b % bookSpineColors.length];
          ctx.beginPath();
          ctx.roundRect(curBx, t1Y + (20 - bh), bw, bh, 1.5);
          ctx.fill();
          // Gold foil title line on spine
          ctx.fillStyle = '#fbbf24';
          ctx.fillRect(curBx + 1, t1Y + (20 - bh) + 3, bw - 2, 1);
          curBx += bw + 1.5;
        }

        // Top shelf miniature potted bonsai cutting in celadon cup
        ctx.fillStyle = '#0d9488';
        ctx.beginPath();
        ctx.roundRect(shelfX + shelfW - 14, shelfY + 9, 10, 10, [1, 1, 3, 3]);
        ctx.fill();
        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.arc(shelfX + shelfW - 9, shelfY + 6, 4, 0, Math.PI * 2);
        ctx.fill();

        // Tier 2 Books & Rolled Scrolls (Middle shelf)
        const t2Y = shelfY + (shelfH / shelfTiers) + 3;
        curBx = shelfX + 4;
        for (let b = 0; b < 5 && curBx < shelfX + shelfW - 24; b++) {
          const bw = 6;
          const bh = 16 - (b % 3);
          ctx.fillStyle = bookSpineColors[(b + 4) % bookSpineColors.length];
          ctx.beginPath();
          ctx.roundRect(curBx, t2Y + (20 - bh), bw, bh, 1.5);
          ctx.fill();
          ctx.fillStyle = '#fef08a';
          ctx.fillRect(curBx + 1, t2Y + (20 - bh) + 4, bw - 2, 1);
          curBx += bw + 1.5;
        }

        // Rolled Parchment Scrolls with ribbon ties (on middle shelf)
        const scrollX1 = shelfX + shelfW - 20;
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.roundRect(scrollX1, t2Y + 4, 16, 7, 2);
        ctx.fill();
        ctx.fillStyle = '#ef4444'; // Red ribbon
        ctx.fillRect(scrollX1 + 6, t2Y + 4, 3, 7);

        ctx.fillStyle = '#fed7aa';
        ctx.beginPath();
        ctx.roundRect(scrollX1 + 2, t2Y + 12, 14, 6, 2);
        ctx.fill();
        ctx.fillStyle = '#3b82f6'; // Blue ribbon
        ctx.fillRect(scrollX1 + 8, t2Y + 12, 3, 6);

        // Tier 3 Heavy Ancient Tomes (Bottom shelf)
        const t3Y = shelfY + (shelfH / shelfTiers) * 2 + 3;
        curBx = shelfX + 4;
        for (let b = 0; b < 6 && curBx < shelfX + shelfW - 6; b++) {
          const bw = 7 + (b % 2);
          const bh = 17 - (b % 2);
          ctx.fillStyle = bookSpineColors[(b + 7) % bookSpineColors.length];
          ctx.beginPath();
          ctx.roundRect(curBx, t3Y + (20 - bh), bw, bh, 1.5);
          ctx.fill();
          ctx.fillStyle = '#fbbf24';
          ctx.fillRect(curBx + 1, t3Y + (20 - bh) + 4, bw - 2, 1.2);
          ctx.fillRect(curBx + 1, t3Y + (20 - bh) + 8, bw - 2, 1.2);
          curBx += bw + 1.5;
        }

        // --- RIGHT: COZY READING CORNER WITH ARMCHAIR & SIDE TABLE ---
        const chairX = zenLib.x + 114;
        const chairY = zenLib.y + 60;

        // Armchair Drop Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
        ctx.beginPath();
        ctx.ellipse(chairX, chairY + 22, 18, 7, 0, 0, Math.PI * 2);
        ctx.fill();

        // Armchair Wooden Legs
        ctx.fillStyle = '#451a03';
        ctx.fillRect(chairX - 12, chairY + 14, 3, 9);
        ctx.fillRect(chairX + 9, chairY + 14, 3, 9);

        // Armchair Backrest (Comfortable deep moss velvet upholstery)
        const chairGrad = ctx.createLinearGradient(chairX, chairY - 18, chairX, chairY + 14);
        chairGrad.addColorStop(0, '#15803d');
        chairGrad.addColorStop(0.5, '#166534');
        chairGrad.addColorStop(1, '#14532d');
        ctx.fillStyle = chairGrad;
        ctx.beginPath();
        ctx.roundRect(chairX - 14, chairY - 18, 28, 26, [8, 8, 4, 4]);
        ctx.fill();
        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Tufted button accents on backrest
        ctx.fillStyle = '#14532d';
        ctx.beginPath();
        ctx.arc(chairX - 5, chairY - 8, 1.5, 0, Math.PI * 2);
        ctx.arc(chairX + 5, chairY - 8, 1.5, 0, Math.PI * 2);
        ctx.arc(chairX, chairY - 2, 1.5, 0, Math.PI * 2);
        ctx.fill();

        // Padded Seat Cushion
        ctx.fillStyle = '#166534';
        ctx.beginPath();
        ctx.roundRect(chairX - 15, chairY + 4, 30, 12, [3, 3, 5, 5]);
        ctx.fill();
        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Cedar Wooden Armrests
        ctx.fillStyle = '#78350f';
        ctx.beginPath();
        ctx.roundRect(chairX - 17, chairY - 2, 4, 16, 2);
        ctx.fill();
        ctx.beginPath();
        ctx.roundRect(chairX + 13, chairY - 2, 4, 16, 2);
        ctx.fill();

        // Cozy Cream/Amber Lumbar Cushion on Chair
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.ellipse(chairX, chairY + 4, 7, 5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 0.8;
        ctx.stroke();

        // Small Cedar Reading Side Table
        const tableX = zenLib.x + 92;
        const tableY = zenLib.y + 64;

        // Table Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.ellipse(tableX, tableY + 19, 10, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        // Table leg & pedestal
        ctx.fillStyle = '#451a03';
        ctx.fillRect(tableX - 1.5, tableY + 3, 3, 16);
        ctx.fillRect(tableX - 6, tableY + 18, 12, 2.5);

        // Polished round tabletop
        ctx.fillStyle = '#92400e';
        ctx.beginPath();
        ctx.ellipse(tableX, tableY + 3, 11, 4.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Open botanical ledger on table
        ctx.fillStyle = '#fef3c7';
        ctx.beginPath();
        ctx.moveTo(tableX - 8, tableY - 1);
        ctx.lineTo(tableX, tableY + 1);
        ctx.lineTo(tableX + 7, tableY - 1);
        ctx.lineTo(tableX + 7, tableY + 3);
        ctx.lineTo(tableX, tableY + 4.5);
        ctx.lineTo(tableX - 8, tableY + 3);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#b45309';
        ctx.lineWidth = 0.6;
        ctx.stroke();

        // Celadon Ceramic Teacup on Table
        ctx.fillStyle = '#a7f3d0';
        ctx.beginPath();
        ctx.roundRect(tableX + 1, tableY - 4, 5, 4, [1, 1, 2, 2]);
        ctx.fill();
        ctx.strokeStyle = '#059669';
        ctx.lineWidth = 0.5;
        ctx.stroke();

        // Rising Steam Wisps from tea
        const steamTime = Date.now() * 0.004;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(tableX + 3.5, tableY - 5);
        ctx.quadraticCurveTo(tableX + 2 + Math.sin(steamTime) * 2, tableY - 8, tableX + 4, tableY - 11);
        ctx.stroke();

        // --- WARM WASHI PAPER LANTERN (CHŌCHIN) ---
        const lanternX = zenLib.x + 88;
        const lanternY = zenLib.y - 12;

        // Curved cedar hanging post
        ctx.strokeStyle = '#b45309';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(zenLib.x + 78, zenLib.y + 6);
        ctx.lineTo(lanternX, lanternY);
        ctx.stroke();

        // Warm radial lantern glow illuminating books & armchair
        const lGlow = ctx.createRadialGradient(lanternX, lanternY + 8, 2, lanternX, lanternY + 8, 30);
        lGlow.addColorStop(0, 'rgba(254, 240, 138, 0.5)');
        lGlow.addColorStop(0.5, 'rgba(245, 158, 11, 0.2)');
        lGlow.addColorStop(1, 'rgba(245, 158, 11, 0)');
        ctx.fillStyle = lGlow;
        ctx.beginPath();
        ctx.arc(lanternX, lanternY + 8, 30, 0, Math.PI * 2);
        ctx.fill();

        // Washi paper lantern body
        ctx.fillStyle = '#b45309';
        ctx.fillRect(lanternX - 6, lanternY + 2, 12, 2.5); // Top cap
        ctx.fillRect(lanternX - 5, lanternY + 16, 10, 2); // Bottom cap

        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.roundRect(lanternX - 5.5, lanternY + 4, 11, 12, 3);
        ctx.fill();
        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Subtle horizontal bamboo ribs on paper lantern
        ctx.strokeStyle = 'rgba(217, 119, 6, 0.4)';
        ctx.lineWidth = 0.7;
        ctx.beginPath();
        ctx.moveTo(lanternX - 5, lanternY + 8);
        ctx.lineTo(lanternX + 5, lanternY + 8);
        ctx.moveTo(lanternX - 5, lanternY + 12);
        ctx.lineTo(lanternX + 5, lanternY + 12);
        ctx.stroke();

        // Hanging red tassel
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(lanternX, lanternY + 18);
        ctx.lineTo(lanternX, lanternY + 23);
        ctx.stroke();

        // Ambient floating sakura petals / wisdom motes
        const petTime = Date.now() * 0.002;
        for (let p = 0; p < 3; p++) {
          const px = zenLib.x + 20 + ((p * 45 + petTime * 18) % (zenLib.width - 40));
          const py = zenLib.y + 12 + Math.sin(petTime * 2 + p) * 12 + p * 16;
          ctx.fillStyle = 'rgba(244, 114, 182, 0.7)';
          ctx.beginPath();
          ctx.ellipse(px, py, 3, 1.8, 0.4, 0, Math.PI * 2);
          ctx.fill();
        }

        // Header Label
        ctx.fillStyle = '#f472b6';
        ctx.font = 'bold 12px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText('📚 ZEN LIBRARY', zenLib.x + zenLib.width / 2, zenLib.y - 10);

        if (isNearZenLibrary) {
          ctx.fillStyle = '#f472b6';
          ctx.font = 'bold 11px system-ui';
          ctx.fillText('[E] Open Zen Library', zenLib.x + zenLib.width / 2, zenLib.y + zenLib.height + 16);
        }
        ctx.restore();

        // =========================================================================
        // STATION 2 (MID LEFT): ARTISAN WORKBENCH (CRAFTING & AUTOMATON ASSEMBLY)
        // =========================================================================
        const wb = sanctuaryWorkbench;
        const wbTier = inv.workbench_tier || 1;
        const activeCraft = activeCraftingRef.current;
        const queueCount = craftingQueueRef.current.length;
        ctx.save();
        if (isNearWorkbench) {
          ctx.strokeStyle = wbTier === 3 ? '#fbbf24' : wbTier === 2 ? '#38bdf8' : '#38bdf8';
          ctx.lineWidth = 3;
          ctx.setLineDash([4, 4]);
          ctx.strokeRect(wb.x - 8, wb.y - 8, wb.width + 16, wb.height + 16);
          ctx.setLineDash([]);
        }

        // Table Drop shadow
        ctx.fillStyle = 'rgba(0,0,0,0.55)';
        ctx.beginPath();
        ctx.roundRect(wb.x + 4, wb.y + 8, wb.width, wb.height, 10);
        ctx.fill();

        // Chassis styling based on tier
        const wbGrad = ctx.createLinearGradient(wb.x, wb.y, wb.x, wb.y + wb.height);
        if (wbTier === 3) {
          // Master Foundry: Gilded Obsidian & Deep Teak
          wbGrad.addColorStop(0, '#78350f');
          wbGrad.addColorStop(0.5, '#451a03');
          wbGrad.addColorStop(1, '#1e1b4b');
        } else if (wbTier === 2) {
          // Precision Workbench: Polished Chestnut & Steel
          wbGrad.addColorStop(0, '#5c2b09');
          wbGrad.addColorStop(0.5, '#451a03');
          wbGrad.addColorStop(1, '#1e293b');
        } else {
          // Artisan Workbench: Classic Honey Oak
          wbGrad.addColorStop(0, '#5c2b09');
          wbGrad.addColorStop(0.5, '#451a03');
          wbGrad.addColorStop(1, '#291102');
        }
        ctx.fillStyle = wbGrad;
        ctx.beginPath();
        ctx.roundRect(wb.x, wb.y, wb.width, wb.height, 10);
        ctx.fill();
        ctx.strokeStyle = wbTier === 3 ? '#f59e0b' : wbTier === 2 ? '#0284c7' : '#78350f';
        ctx.lineWidth = wbTier === 3 ? 3 : 2.5;
        ctx.stroke();

        // Polished tabletop timber / metallic inlay planks
        const topGrad = ctx.createLinearGradient(wb.x, wb.y, wb.x, wb.y + wb.height);
        if (wbTier === 3) {
          topGrad.addColorStop(0, '#b45309');
          topGrad.addColorStop(0.5, '#92400e');
          topGrad.addColorStop(1, '#78350f');
        } else {
          topGrad.addColorStop(0, '#92400e');
          topGrad.addColorStop(1, '#78350f');
        }
        ctx.fillStyle = topGrad;
        ctx.beginPath();
        ctx.roundRect(wb.x + 5, wb.y + 5, wb.width - 10, wb.height - 10, 6);
        ctx.fill();

        // Tabletop inlays & woodgrain
        ctx.strokeStyle = wbTier === 3 ? 'rgba(254, 240, 138, 0.18)' : 'rgba(255, 255, 255, 0.08)';
        ctx.lineWidth = 1;
        for (let py = wb.y + 24; py < wb.y + wb.height - 10; py += 22) {
          ctx.beginPath();
          ctx.moveTo(wb.x + 8, py);
          ctx.lineTo(wb.x + wb.width - 8, py);
          ctx.stroke();
        }

        // T2 & T3: Brass Back Tool Rack & Calibrated Measuring Rail
        if (wbTier >= 2) {
          ctx.fillStyle = '#b45309';
          ctx.fillRect(wb.x + 10, wb.y + 8, wb.width - 20, 5);
          ctx.fillStyle = '#f59e0b';
          for (let r = 0; r < 8; r++) {
            ctx.fillRect(wb.x + 16 + r * 14, wb.y + 6, 3, 9);
          }
          // Precision calipers hanging
          ctx.fillStyle = '#e2e8f0';
          ctx.fillRect(wb.x + 36, wb.y + 12, 4, 14);
          ctx.fillRect(wb.x + 78, wb.y + 12, 3, 16);
        }

        // T2 & T3: Dual Vertical Copper Conduit Feeds with Glowing Power Pulses
        if (wbTier >= 2) {
          const pipePulse = 0.5 + Math.sin(Date.now() * 0.005) * 0.4;
          // Left conduit
          ctx.fillStyle = '#9a3412';
          ctx.fillRect(wb.x + 2, wb.y + 14, 4, wb.height - 24);
          ctx.fillStyle = `rgba(56, 189, 248, ${pipePulse})`;
          ctx.fillRect(wb.x + 3, wb.y + 18, 2, wb.height - 32);

          // Right conduit
          ctx.fillStyle = '#9a3412';
          ctx.fillRect(wb.x + wb.width - 6, wb.y + 14, 4, wb.height - 24);
          ctx.fillStyle = `rgba(56, 189, 248, ${pipePulse})`;
          ctx.fillRect(wb.x + wb.width - 5, wb.y + 18, 2, wb.height - 32);
        }

        // T3: Masterwork Top Arch with Spinning Golden Master Cog & Steam Vents
        if (wbTier === 3) {
          const cogRot = Date.now() * 0.002;
          const archX = wb.x + wb.width / 2;
          const archY = wb.y - 4;

          // Golden Crown Arch
          ctx.fillStyle = '#78350f';
          ctx.beginPath();
          ctx.roundRect(archX - 28, archY - 14, 56, 14, [6, 6, 0, 0]);
          ctx.fill();
          ctx.strokeStyle = '#f59e0b';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // Spinning Master Cog
          ctx.save();
          ctx.translate(archX, archY - 7);
          ctx.rotate(cogRot);
          ctx.fillStyle = '#fbbf24';
          ctx.beginPath();
          for (let tc = 0; tc < 8; tc++) {
            const a1 = (tc * Math.PI * 2) / 8;
            const a2 = a1 + Math.PI / 16;
            if (tc === 0) ctx.moveTo(Math.cos(a1) * 6, Math.sin(a1) * 6);
            ctx.lineTo(Math.cos(a1) * 9, Math.sin(a1) * 9);
            ctx.lineTo(Math.cos(a2) * 9, Math.sin(a2) * 9);
            ctx.lineTo(Math.cos(a2) * 6, Math.sin(a2) * 6);
          }
          ctx.closePath();
          ctx.fill();
          ctx.fillStyle = '#451a03';
          ctx.beginPath();
          ctx.arc(0, 0, 2.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();

          // Steam Vents Wisp
          const sTime = Date.now() * 0.003;
          for (let sv = 0; sv < 2; sv++) {
            const svX = wb.x + 22 + sv * (wb.width - 44);
            const svY = wb.y + 4;
            ctx.fillStyle = `rgba(226, 232, 240, ${0.4 + Math.sin(sTime + sv) * 0.2})`;
            ctx.beginPath();
            ctx.arc(svX + Math.sin(sTime * 2 + sv) * 3, svY - 4 - (sTime * 15 + sv * 6) % 12, 2.5, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // Mortise-and-tenon wooden joinery pegs
        ctx.fillStyle = wbTier === 3 ? '#fde047' : '#fef08a';
        const wbPegs = [
          [wb.x + 10, wb.y + 10],
          [wb.x + wb.width - 10, wb.y + 10],
          [wb.x + 10, wb.y + wb.height - 10],
          [wb.x + wb.width - 10, wb.y + wb.height - 10],
        ];
        wbPegs.forEach(([px, py]) => {
          ctx.beginPath();
          ctx.arc(px, py, 2, 0, Math.PI * 2);
          ctx.fill();
        });

        // Polished brass / gold corner brackets & rivets
        ctx.fillStyle = wbTier === 3 ? '#fbbf24' : '#f59e0b';
        ctx.fillRect(wb.x + 4, wb.y + 4, 14, 4);
        ctx.fillRect(wb.x + 4, wb.y + 4, 4, 14);
        ctx.fillRect(wb.x + wb.width - 18, wb.y + 4, 14, 4);
        ctx.fillRect(wb.x + wb.width - 8, wb.y + 4, 4, 14);
        ctx.fillRect(wb.x + 4, wb.y + wb.height - 8, 14, 4);
        ctx.fillRect(wb.x + 4, wb.y + wb.height - 18, 4, 14);
        ctx.fillRect(wb.x + wb.width - 18, wb.y + wb.height - 8, 14, 4);
        ctx.fillRect(wb.x + wb.width - 8, wb.y + wb.height - 18, 4, 14);

        // Crafting Automatons Installed (Mechanical Assembly Arm)
        const installedArms = installedCraftingArmsRef.current;
        if (installedArms > 0) {
          const armAnim = activeCraft ? Math.sin(Date.now() * 0.01) * 6 : 0;
          ctx.strokeStyle = wbTier === 3 ? '#f59e0b' : '#0284c7';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(wb.x - 12, wb.y + 45);
          ctx.lineTo(wb.x - 2, wb.y + 18 + armAnim);
          ctx.lineTo(wb.x + 28, wb.y + 24 + armAnim);
          ctx.stroke();

          ctx.fillStyle = wbTier === 3 ? '#fde047' : '#38bdf8';
          ctx.beginPath();
          ctx.arc(wb.x - 12, wb.y + 45, 6, 0, Math.PI * 2);
          ctx.arc(wb.x - 2, wb.y + 18 + armAnim, 4, 0, Math.PI * 2);
          ctx.fill();

          // Welding / assembly spark when actively working
          if (activeCraft && power.isPowerSufficient) {
            ctx.fillStyle = '#facc15';
            ctx.beginPath();
            ctx.arc(wb.x + 28, wb.y + 24 + armAnim, 3.5, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // Auto-Fabricator Units Installed (Dedicated Production Lanes)
        const installedLanes = autoFabricatorLanesRef.current;
        if (installedLanes.length > 0) {
          const fabImg = assets['auto_crafter_unit'];
          if (fabImg && fabImg.complete && fabImg.naturalWidth > 0) {
            ctx.drawImage(fabImg, wb.x + wb.width - 4, wb.y + 10, 36, 36);
          } else {
            ctx.fillStyle = '#0f172a';
            ctx.beginPath();
            ctx.roundRect(wb.x + wb.width - 2, wb.y + 14, 24, 38, 4);
            ctx.fill();
            ctx.strokeStyle = '#06b6d4';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // Core glow
            const coreGlow = 0.5 + Math.sin(Date.now() * 0.006) * 0.4;
            ctx.fillStyle = power.isPowerSufficient ? `rgba(6, 182, 212, ${coreGlow})` : '#ef4444';
            ctx.beginPath();
            ctx.arc(wb.x + wb.width + 10, wb.y + 32, 6, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // Blueprint scroll on workbench
        ctx.fillStyle = wbTier === 3 ? '#1e1b4b' : '#0284c7';
        ctx.beginPath();
        ctx.roundRect(wb.x + 14, wb.y + 16, 40, 26, 3);
        ctx.fill();
        ctx.strokeStyle = wbTier === 3 ? '#fbbf24' : '#bae6fd';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Botanical tools: brass clippers & steel calipers
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(wb.x + 60, wb.y + 18, 18, 10);
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(wb.x + 82, wb.y + 14, 5, 22);

        // Potted cutting in warm terracotta cup
        ctx.fillStyle = '#b45309';
        ctx.beginPath();
        ctx.roundRect(wb.x + 96, wb.y + 20, 18, 22, [2, 2, 5, 5]);
        ctx.fill();
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 0.8;
        ctx.stroke();
        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.ellipse(wb.x + 105, wb.y + 14, 7, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        // Warm glowing brass lantern hanging from carved post (Right)
        const wbLanternX = wb.x + wb.width - 8;
        const wbLanternY = wb.y - 14;

        ctx.strokeStyle = '#b45309';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(wb.x + wb.width - 16, wb.y + 8);
        ctx.lineTo(wbLanternX, wbLanternY);
        ctx.stroke();

        const wbLanternGlow = ctx.createRadialGradient(wbLanternX, wbLanternY + 8, 2, wbLanternX, wbLanternY + 8, 26);
        wbLanternGlow.addColorStop(0, 'rgba(254, 240, 138, 0.45)');
        wbLanternGlow.addColorStop(1, 'rgba(245, 158, 11, 0)');
        ctx.fillStyle = wbLanternGlow;
        ctx.beginPath();
        ctx.arc(wbLanternX, wbLanternY + 8, 26, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(wbLanternX - 6, wbLanternY + 2, 12, 3);
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.roundRect(wbLanternX - 5, wbLanternY + 5, 10, 12, 2);
        ctx.fill();
        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 1;
        ctx.stroke();

        // T2 & T3 Second Left Lantern
        if (wbTier >= 2) {
          const leftLanternX = wb.x + 8;
          const leftLanternY = wb.y - 14;
          ctx.strokeStyle = '#b45309';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(wb.x + 16, wb.y + 8);
          ctx.lineTo(leftLanternX, leftLanternY);
          ctx.stroke();

          ctx.fillStyle = '#f59e0b';
          ctx.fillRect(leftLanternX - 6, leftLanternY + 2, 12, 3);
          ctx.fillStyle = '#fef08a';
          ctx.beginPath();
          ctx.roundRect(leftLanternX - 5, leftLanternY + 5, 10, 12, 2);
          ctx.fill();
          ctx.strokeStyle = '#d97706';
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        // Header Label above station
        ctx.fillStyle = wbTier === 3 ? '#fbbf24' : wbTier === 2 ? '#38bdf8' : '#f8fafc';
        ctx.font = 'bold 12px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText(
          wbTier === 3 ? '👑 MASTER FOUNDRY' : wbTier === 2 ? '🛠️ PRECISION WORKBENCH' : '🛠️ ARTISAN WORKBENCH',
          wb.x + wb.width / 2,
          wb.y - (wbTier === 3 ? 18 : 10),
        );

        // Active Crafting Progress Bar on Workbench
        if (activeCraft) {
          const pct = Math.max(0, Math.min(1, (activeCraft.totalTime - activeCraft.remainingTime) / activeCraft.totalTime));
          const pBarW = 100;
          const pBarX = wb.x + (wb.width - pBarW) / 2;
          const pBarY = wb.y + wb.height + 6;

          ctx.fillStyle = 'rgba(2, 6, 23, 0.9)';
          ctx.beginPath();
          ctx.roundRect(pBarX - 4, pBarY - 2, pBarW + 8, 18, 4);
          ctx.fill();
          ctx.strokeStyle = wbTier === 3 ? '#fbbf24' : '#38bdf8';
          ctx.lineWidth = 1;
          ctx.stroke();

          // Progress fill
          ctx.fillStyle = power.isPowerSufficient ? (wbTier === 3 ? '#f59e0b' : '#38bdf8') : '#f59e0b';
          ctx.beginPath();
          ctx.roundRect(pBarX, pBarY + 1, Math.max(2, pBarW * pct), 12, 2);
          ctx.fill();

          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 8px system-ui';
          ctx.textAlign = 'center';
          ctx.fillText(
            power.isPowerSufficient ? `${activeCraft.icon} ${activeCraft.remainingTime.toFixed(1)}s` : '⚡ Paused',
            wb.x + wb.width / 2,
            pBarY + 10,
          );

          if (queueCount > 0) {
            ctx.fillStyle = '#a855f7';
            ctx.beginPath();
            ctx.roundRect(wb.x + wb.width - 2, wb.y - 16, 22, 14, 4);
            ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 8px system-ui';
            ctx.fillText(`+${queueCount}`, wb.x + wb.width + 9, wb.y - 6);
          }
        } else if (isNearWorkbench) {
          ctx.fillStyle = wbTier === 3 ? '#fbbf24' : '#38bdf8';
          ctx.font = 'bold 11px system-ui';
          ctx.fillText(`[E] Open Workbench (Tier ${wbTier})`, wb.x + wb.width / 2, wb.y + wb.height + 18);
        }
        ctx.restore();

        // =========================================================================
        // STATION 3 (DEAD CENTER): BONSAI SOCIETY (GRAND CIVIC ASSEMBLY HALL)
        // =========================================================================
        const society = sanctuaryBonsaiSociety;
        ctx.save();
        if (isNearBonsaiSociety) {
          ctx.strokeStyle = '#fbbf24';
          ctx.lineWidth = 3;
          ctx.setLineDash([4, 4]);
          ctx.strokeRect(society.x - 8, society.y - 8, society.width + 16, society.height + 16);
          ctx.setLineDash([]);
        }

        // Grand building drop shadow
        ctx.fillStyle = 'rgba(0,0,0,0.55)';
        ctx.beginPath();
        ctx.roundRect(society.x + 4, society.y + 8, society.width, society.height, 10);
        ctx.fill();

        // Heavy dark cedar and chestnut civic hall chassis
        const bscGrad = ctx.createLinearGradient(society.x, society.y, society.x, society.y + society.height);
        bscGrad.addColorStop(0, '#5c2b09');
        bscGrad.addColorStop(0.5, '#451a03');
        bscGrad.addColorStop(1, '#291102');
        ctx.fillStyle = bscGrad;
        ctx.beginPath();
        ctx.roundRect(society.x, society.y, society.width, society.height, 10);
        ctx.fill();
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Grand Dressed Stone Foundation Plinth & Steps
        const plinthX = society.x + 6;
        const plinthY = society.y + society.height - 18;
        const plinthW = society.width - 12;
        const plinthH = 18;

        ctx.fillStyle = '#334155';
        ctx.beginPath();
        ctx.roundRect(plinthX, plinthY, plinthW, plinthH, [2, 2, 6, 6]);
        ctx.fill();
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Step lines leading to grand entrance
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(plinthX + 16, plinthY + 6);
        ctx.lineTo(plinthX + plinthW - 16, plinthY + 6);
        ctx.moveTo(plinthX + 24, plinthY + 12);
        ctx.lineTo(plinthX + plinthW - 24, plinthY + 12);
        ctx.stroke();

        // Recessed Grand Double Doors with Shoji Lattice Panels
        const doorW = 44;
        const doorH = 50;
        const doorX = society.x + (society.width - doorW) / 2;
        const doorY = society.y + 36;

        ctx.fillStyle = '#1e1005';
        ctx.fillRect(doorX, doorY, doorW, doorH);

        // Dark Teak Door Panels
        ctx.fillStyle = '#78350f';
        ctx.fillRect(doorX + 2, doorY + 2, doorW / 2 - 3, doorH - 3);
        ctx.fillRect(doorX + doorW / 2 + 1, doorY + 2, doorW / 2 - 3, doorH - 3);

        // Shoji Paper Grid Inlays on Doors
        ctx.fillStyle = 'rgba(254, 240, 138, 0.2)';
        ctx.fillRect(doorX + 5, doorY + 6, 14, 22);
        ctx.fillRect(doorX + doorW / 2 + 3, doorY + 6, 14, 22);

        // Grid lines on doors
        ctx.strokeStyle = '#b45309';
        ctx.lineWidth = 0.8;
        ctx.strokeRect(doorX + 5, doorY + 6, 14, 22);
        ctx.strokeRect(doorX + doorW / 2 + 3, doorY + 6, 14, 22);
        ctx.beginPath();
        ctx.moveTo(doorX + 12, doorY + 6); ctx.lineTo(doorX + 12, doorY + 28);
        ctx.moveTo(doorX + doorW / 2 + 10, doorY + 6); ctx.lineTo(doorX + doorW / 2 + 10, doorY + 28);
        ctx.moveTo(doorX + 5, doorY + 17); ctx.lineTo(doorX + 19, doorY + 17);
        ctx.moveTo(doorX + doorW / 2 + 3, doorY + 17); ctx.lineTo(doorX + doorW / 2 + 17, doorY + 17);
        ctx.stroke();

        // Polished Brass Door Handles & Studs
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(doorX + doorW / 2 - 4, doorY + 34, 2.5, 0, Math.PI * 2);
        ctx.arc(doorX + doorW / 2 + 4, doorY + 34, 2.5, 0, Math.PI * 2);
        ctx.fill();

        // 4 Stately Symmetrical Timber Columns
        const colW = 7;
        const colH = 68;
        const colY = society.y + 18;
        const colXs = [
          society.x + 14,
          society.x + 44,
          society.x + society.width - 51,
          society.x + society.width - 21,
        ];

        colXs.forEach((cx) => {
          // Column shaft
          const cGrad = ctx.createLinearGradient(cx, colY, cx + colW, colY);
          cGrad.addColorStop(0, '#78350f');
          cGrad.addColorStop(0.5, '#92400e');
          cGrad.addColorStop(1, '#5c2b09');
          ctx.fillStyle = cGrad;
          ctx.fillRect(cx, colY, colW, colH);
          ctx.strokeStyle = '#451a03';
          ctx.lineWidth = 1;
          ctx.strokeRect(cx, colY, colW, colH);

          // Polished Brass Base Plinth
          ctx.fillStyle = '#fbbf24';
          ctx.fillRect(cx - 1.5, colY + colH - 4, colW + 3, 4);

          // Polished Brass Capital Bracket
          ctx.fillStyle = '#fbbf24';
          ctx.fillRect(cx - 2, colY, colW + 4, 4);
        });

        // TIERED CEDAR GABLES & CLASSICAL ASSEMBLY ROOF
        // Lower Tier Awning Eave
        const midEaveY = society.y + 16;
        ctx.fillStyle = '#291102';
        ctx.beginPath();
        ctx.moveTo(society.x - 4, midEaveY + 6);
        ctx.quadraticCurveTo(society.x + society.width / 2, midEaveY - 4, society.x + society.width + 4, midEaveY + 6);
        ctx.lineTo(society.x + society.width + 1, midEaveY + 11);
        ctx.quadraticCurveTo(society.x + society.width / 2, midEaveY + 1, society.x - 1, midEaveY + 11);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#b45309';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Upper Grand Tiered Cedar Gable Pediment
        const pedApexX = society.x + society.width / 2;
        const pedApexY = society.y - 12;
        const pedLeftX = society.x + 18;
        const pedRightX = society.x + society.width - 18;
        const pedBaseY = society.y + 16;

        // Pediment triangular cedar infill
        ctx.fillStyle = '#451a03';
        ctx.beginPath();
        ctx.moveTo(pedLeftX, pedBaseY);
        ctx.lineTo(pedApexX, pedApexY);
        ctx.lineTo(pedRightX, pedBaseY);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Sweeping Bargeboards / Cedar Gable Eaves
        ctx.fillStyle = '#291102';
        ctx.beginPath();
        ctx.moveTo(pedLeftX - 8, pedBaseY + 2);
        ctx.lineTo(pedApexX, pedApexY - 3);
        ctx.lineTo(pedRightX + 8, pedBaseY + 2);
        ctx.lineTo(pedRightX + 4, pedBaseY + 6);
        ctx.lineTo(pedApexX, pedApexY + 2);
        ctx.lineTo(pedLeftX - 4, pedBaseY + 6);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Brass Ridge Cap Ornament at Roof Peak
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(pedApexX, pedApexY - 3, 3.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#b45309';
        ctx.lineWidth = 1;
        ctx.stroke();

        // --- DIGNIFIED BRASS / GOLD BONSAI CREST EMBLEM ---
        const crestX = pedApexX;
        const crestY = society.y + 4;
        const crestR = 12;

        // Crest Radiant Glow
        const crestGlow = ctx.createRadialGradient(crestX, crestY, 2, crestX, crestY, 22);
        crestGlow.addColorStop(0, 'rgba(250, 204, 21, 0.45)');
        crestGlow.addColorStop(1, 'rgba(250, 204, 21, 0)');
        ctx.fillStyle = crestGlow;
        ctx.beginPath();
        ctx.arc(crestX, crestY, 22, 0, Math.PI * 2);
        ctx.fill();

        // Brass Medallion Outer Ring
        ctx.fillStyle = '#b45309';
        ctx.beginPath();
        ctx.arc(crestX, crestY, crestR + 1.5, 0, Math.PI * 2);
        ctx.fill();

        // Polished Gold Medallion Body
        const crestGrad = ctx.createLinearGradient(crestX - crestR, crestY - crestR, crestX + crestR, crestY + crestR);
        crestGrad.addColorStop(0, '#fef08a');
        crestGrad.addColorStop(0.5, '#f59e0b');
        crestGrad.addColorStop(1, '#d97706');
        ctx.fillStyle = crestGrad;
        ctx.beginPath();
        ctx.arc(crestX, crestY, crestR, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#fef08a';
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Embossed Bonsai Tree Crest Silhouette inside medallion
        ctx.fillStyle = '#451a03';
        // Miniature pot
        ctx.beginPath();
        ctx.roundRect(crestX - 6, crestY + 5, 12, 3, 1);
        ctx.fill();
        // Miniature trunk
        ctx.strokeStyle = '#451a03';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(crestX, crestY + 5);
        ctx.quadraticCurveTo(crestX - 2, crestY + 1, crestX + 1, crestY - 3);
        ctx.stroke();
        // Miniature canopy pads
        ctx.fillStyle = '#14532d';
        ctx.beginPath();
        ctx.arc(crestX - 4, crestY - 1, 3.2, 0, Math.PI * 2);
        ctx.arc(crestX + 4, crestY - 2, 3, 0, Math.PI * 2);
        ctx.arc(crestX + 1, crestY - 5, 3.8, 0, Math.PI * 2);
        ctx.fill();

        // --- DUAL CIVIC WARM LANTERNS (FLANKING OUTER COLUMNS) ---
        const drawCivicLantern = (lx: number, ly: number) => {
          ctx.strokeStyle = '#f59e0b';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(lx, ly);
          ctx.lineTo(lx, ly + 8);
          ctx.stroke();

          const lanternGlow = ctx.createRadialGradient(lx, ly + 14, 2, lx, ly + 14, 24);
          lanternGlow.addColorStop(0, 'rgba(254, 240, 138, 0.45)');
          lanternGlow.addColorStop(1, 'rgba(245, 158, 11, 0)');
          ctx.fillStyle = lanternGlow;
          ctx.beginPath();
          ctx.arc(lx, ly + 14, 24, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#f59e0b';
          ctx.fillRect(lx - 5, ly + 7, 10, 2);
          ctx.fillRect(lx - 4, ly + 20, 8, 2);

          ctx.fillStyle = '#fef08a';
          ctx.beginPath();
          ctx.roundRect(lx - 4.5, ly + 9, 9, 11, 2);
          ctx.fill();
          ctx.strokeStyle = '#d97706';
          ctx.lineWidth = 1;
          ctx.stroke();
        };

        drawCivicLantern(society.x + 10, society.y + 14);
        drawCivicLantern(society.x + society.width - 10, society.y + 14);

        // Header Label
        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 12px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText('🏛️ BONSAI SOCIETY', society.x + society.width / 2, society.y - 10);

        if (isNearBonsaiSociety) {
          ctx.fillStyle = '#fef08a';
          ctx.font = 'bold 10px system-ui';
          ctx.fillText('🏛️ Grand Hall (Membership Opening Soon)', society.x + society.width / 2, society.y + society.height + 16);
        }
        ctx.restore();

        // =========================================================================
        // STATION 4 (MID RIGHT): ROVER GARAGE DEPARTURE BAY
        // =========================================================================
        const garage = sanctuaryRoverGarage;
        ctx.save();
        if (isNearGarage) {
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 3;
          ctx.setLineDash([4, 4]);
          ctx.strokeRect(garage.x - 8, garage.y - 8, garage.width + 16, garage.height + 16);
          ctx.setLineDash([]);
        }

        // Garage Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.beginPath();
        ctx.roundRect(garage.x + 4, garage.y + 8, garage.width, garage.height, 10);
        ctx.fill();

        // Honey-oak and chestnut timber frame chassis
        const gBaseGrad = ctx.createLinearGradient(garage.x, garage.y, garage.x, garage.y + garage.height);
        gBaseGrad.addColorStop(0, '#5c2b09');
        gBaseGrad.addColorStop(0.5, '#451a03');
        gBaseGrad.addColorStop(1, '#291102');
        ctx.fillStyle = gBaseGrad;
        ctx.beginPath();
        ctx.roundRect(garage.x, garage.y, garage.width, garage.height, 10);
        ctx.fill();
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Mortise-and-tenon wooden joinery pegs on garage posts
        ctx.fillStyle = '#fef08a';
        const garagePegs = [
          [garage.x + 8, garage.y + 10],
          [garage.x + garage.width - 8, garage.y + 10],
          [garage.x + 8, garage.y + garage.height - 10],
          [garage.x + garage.width - 8, garage.y + garage.height - 10],
        ];
        garagePegs.forEach(([px, py]) => {
          ctx.beginPath();
          ctx.arc(px, py, 2, 0, Math.PI * 2);
          ctx.fill();
        });

        // Polished Brass Corner Braces
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(garage.x + 4, garage.y + 4, 14, 4);
        ctx.fillRect(garage.x + 4, garage.y + 4, 4, 14);
        ctx.fillRect(garage.x + garage.width - 18, garage.y + 4, 14, 4);
        ctx.fillRect(garage.x + garage.width - 8, garage.y + 4, 4, 14);

        // Wooden Roll-Up Bay Garage Door (Slatted Honey-Teak & Cedar)
        const bayW = garage.width - 32;
        const bayH = garage.height - 38;
        const bayX = garage.x + 16;
        const bayY = garage.y + 24;

        ctx.fillStyle = '#291102';
        ctx.fillRect(bayX, bayY, bayW, bayH);

        // Slats
        for (let sl = 0; sl < 6; sl++) {
          ctx.fillStyle = sl % 2 === 0 ? '#92400e' : '#78350f';
          ctx.fillRect(bayX + 2, bayY + 2 + sl * 12, bayW - 4, 10);
          ctx.strokeStyle = '#b45309';
          ctx.lineWidth = 0.8;
          ctx.strokeRect(bayX + 2, bayY + 2 + sl * 12, bayW - 4, 10);
        }

        // Canvas Roller Awning Header above door
        const awningStripes = 6;
        const aStripeW = bayW / awningStripes;
        for (let st = 0; st < awningStripes; st++) {
          ctx.fillStyle = st % 2 === 0 ? '#0284c7' : '#fde68a';
          ctx.fillRect(bayX + st * aStripeW, bayY - 6, aStripeW, 8);
        }

        // Brass Winch Cog & Pulley on Right Beam
        const winchX = garage.x + garage.width - 14;
        const winchY = garage.y + 36;
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(winchX, winchY, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#b45309';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(winchX, winchY, 3, 0, Math.PI * 2);
        ctx.fill();

        // Vehicle Loading Timber & Brass Ramp in front of Bay
        ctx.fillStyle = '#78350f';
        ctx.beginPath();
        ctx.moveTo(bayX - 4, bayY + bayH);
        ctx.lineTo(bayX + bayW + 4, bayY + bayH);
        ctx.lineTo(bayX + bayW + 12, bayY + bayH + 18);
        ctx.lineTo(bayX - 12, bayY + bayH + 18);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Heavy Rubber Tire Tracks on Ramp
        ctx.strokeStyle = 'rgba(15, 23, 42, 0.7)';
        ctx.lineWidth = 3.5;
        ctx.setLineDash([3, 2]);
        ctx.beginPath();
        ctx.moveTo(bayX + 16, bayY + 18);
        ctx.lineTo(bayX + 10, bayY + bayH + 18);
        ctx.moveTo(bayX + bayW - 16, bayY + 18);
        ctx.lineTo(bayX + bayW - 10, bayY + bayH + 18);
        ctx.stroke();
        ctx.setLineDash([]);

        // Hanging Warm Brass Lantern on Post (Left)
        const gLanternX = garage.x + 8;
        const gLanternY = garage.y - 12;
        ctx.strokeStyle = '#b45309';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(garage.x + 16, garage.y + 6);
        ctx.lineTo(gLanternX, gLanternY);
        ctx.stroke();

        const gLanternGlow = ctx.createRadialGradient(gLanternX, gLanternY + 8, 2, gLanternX, gLanternY + 8, 26);
        gLanternGlow.addColorStop(0, 'rgba(254, 240, 138, 0.45)');
        gLanternGlow.addColorStop(1, 'rgba(245, 158, 11, 0)');
        ctx.fillStyle = gLanternGlow;
        ctx.beginPath();
        ctx.arc(gLanternX, gLanternY + 8, 26, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(gLanternX - 6, gLanternY + 2, 12, 3);
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.roundRect(gLanternX - 5, gLanternY + 5, 10, 12, 2);
        ctx.fill();
        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 12px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText('🚙 ROVER GARAGE BAY', garage.x + garage.width / 2, garage.y - 10);

        if (isNearGarage) {
          ctx.fillStyle = '#38bdf8';
          ctx.font = 'bold 11px system-ui';
          ctx.fillText('[E] Depart on Expedition', garage.x + garage.width / 2, garage.y + garage.height + 16);
        }
        ctx.restore();

        // =========================================================================
        // STATION 5 (FAR RIGHT): BOTANICAL MARKET SHOP
        // =========================================================================
        const shop = sanctuaryShopStand;
        ctx.save();
        if (isNearShop) {
          ctx.strokeStyle = '#f59e0b';
          ctx.lineWidth = 3;
          ctx.setLineDash([4, 4]);
          ctx.strokeRect(shop.x - 8, shop.y - 8, shop.width + 16, shop.height + 16);
          ctx.setLineDash([]);
        }

        // Drop shadow for the entire market stall structure
        ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
        ctx.beginPath();
        ctx.roundRect(shop.x + 4, shop.y + 10, shop.width, shop.height, 10);
        ctx.fill();

        // Heavy dark oak and chestnut stall chassis & side support pillars
        const sBaseGrad = ctx.createLinearGradient(shop.x, shop.y + 18, shop.x, shop.y + shop.height);
        sBaseGrad.addColorStop(0, '#5c2b09');
        sBaseGrad.addColorStop(0.5, '#451a03');
        sBaseGrad.addColorStop(1, '#291102');
        ctx.fillStyle = sBaseGrad;
        ctx.beginPath();
        ctx.roundRect(shop.x, shop.y + 18, shop.width, shop.height - 18, 10);
        ctx.fill();
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Polished teak timber counter face with woodgrain planks
        const sPlankGrad = ctx.createLinearGradient(shop.x, shop.y + 36, shop.x, shop.y + shop.height);
        sPlankGrad.addColorStop(0, '#92400e');
        sPlankGrad.addColorStop(1, '#78350f');
        ctx.fillStyle = sPlankGrad;
        ctx.fillRect(shop.x + 6, shop.y + 36, shop.width - 12, shop.height - 42);

        // Mortise-and-tenon wooden joinery pegs
        ctx.fillStyle = '#fef08a';
        const shopPegs = [
          [shop.x + 10, shop.y + 24],
          [shop.x + shop.width - 10, shop.y + 24],
          [shop.x + 10, shop.y + shop.height - 10],
          [shop.x + shop.width - 10, shop.y + shop.height - 10],
        ];
        shopPegs.forEach(([px, py]) => {
          ctx.beginPath();
          ctx.arc(px, py, 2, 0, Math.PI * 2);
          ctx.fill();
        });

        // Brass corner braces and structural brackets
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(shop.x, shop.y + 18, 12, 4);
        ctx.fillRect(shop.x, shop.y + 18, 4, 12);
        ctx.fillRect(shop.x + shop.width - 12, shop.y + 18, 12, 4);
        ctx.fillRect(shop.x + shop.width - 4, shop.y + 18, 4, 12);

        // Vertical timber pillar posts
        ctx.fillStyle = '#291102';
        ctx.fillRect(shop.x + 4, shop.y - 4, 10, shop.height + 2);
        ctx.fillRect(shop.x + shop.width - 14, shop.y - 4, 10, shop.height + 2);

        // Cozy striped scalloped awning canopy (Forest Emerald & Warm Amber)
        const stripeCount = 7;
        const stripeW = shop.width / stripeCount;
        for (let st = 0; st < stripeCount; st++) {
          const isStripeAmber = st % 2 === 1;
          ctx.fillStyle = isStripeAmber ? '#f59e0b' : '#047857';
          ctx.beginPath();
          ctx.roundRect(shop.x + st * stripeW, shop.y - 12, stripeW, 30, [4, 4, 5, 5]);
          ctx.fill();
          ctx.strokeStyle = isStripeAmber ? '#d97706' : '#064e3b';
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        // Hanging dried herb and botanical bundles beneath the canopy
        const herbColors = ['#10b981', '#ec4899', '#a855f7', '#fbbf24'];
        for (let hb = 0; hb < 4; hb++) {
          const hbx = shop.x + 24 + hb * 28;
          ctx.strokeStyle = '#b45309';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(hbx, shop.y + 18);
          ctx.lineTo(hbx, shop.y + 25);
          ctx.stroke();

          ctx.fillStyle = herbColors[hb];
          ctx.beginPath();
          ctx.ellipse(hbx, shop.y + 29, 3.5, 6, 0.1, 0, Math.PI * 2);
          ctx.fill();
        }

        // Countertop display: wooden seed crate with glowing specimens & terracotta flowerpots
        ctx.fillStyle = '#b45309';
        ctx.beginPath();
        ctx.roundRect(shop.x + 18, shop.y + 38, 38, 22, 3);
        ctx.fill();
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Spores / glowing seed pearls in tray
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(shop.x + 28, shop.y + 47, 3, 0, Math.PI * 2);
        ctx.arc(shop.x + 38, shop.y + 49, 3.5, 0, Math.PI * 2);
        ctx.arc(shop.x + 47, shop.y + 46, 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Brass Trade Scale with balance plates
        const scaleX = shop.x + shop.width - 45;
        const scaleY = shop.y + 38;
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(scaleX, scaleY + 2, 3, 20); // Central rod
        ctx.fillRect(scaleX - 12, scaleY + 4, 27, 3); // Crossbeam
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.ellipse(scaleX - 10, scaleY + 16, 6, 2.5, 0, 0, Math.PI * 2); // Left pan
        ctx.ellipse(scaleX + 13, scaleY + 14, 6, 2.5, 0, 0, Math.PI * 2); // Right pan
        ctx.fill();
        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 0.8;
        ctx.stroke();

        // Hanging Warm Brass Lantern on Stall Post
        const shopLanternX = shop.x + 10;
        const shopLanternY = shop.y - 18;

        ctx.strokeStyle = '#b45309';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(shop.x + 10, shop.y - 4);
        ctx.lineTo(shopLanternX, shopLanternY);
        ctx.stroke();

        const sLanternGlow = ctx.createRadialGradient(
          shopLanternX,
          shopLanternY + 8,
          2,
          shopLanternX,
          shopLanternY + 8,
          28,
        );
        sLanternGlow.addColorStop(0, 'rgba(254, 240, 138, 0.45)');
        sLanternGlow.addColorStop(1, 'rgba(245, 158, 11, 0)');
        ctx.fillStyle = sLanternGlow;
        ctx.beginPath();
        ctx.arc(shopLanternX, shopLanternY + 8, 28, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(shopLanternX - 6, shopLanternY + 2, 12, 3);
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.roundRect(shopLanternX - 5, shopLanternY + 5, 10, 12, 2);
        ctx.fill();
        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Label above station
        ctx.fillStyle = '#fef08a';
        ctx.font = 'bold 12px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText('🏪 BOTANICAL MARKET', shop.x + shop.width / 2, shop.y - 9);

        if (isNearShop) {
          ctx.fillStyle = '#facc15';
          ctx.font = 'bold 11px system-ui';
          ctx.fillText('[E] Maps & Market', shop.x + shop.width / 2, shop.y + shop.height + 16);
        }
        ctx.restore();

        const inspectingBonsai = plantedBonsaisRef.current.find((b) => b.id === inspectingBonsaiId);
        const activeHaloGenerator =
          deployedStructuresRef.current.find(
            (s) =>
              (s.type === 'solar_panel' || s.type === 'wind_turbine') &&
              Math.abs(av.x - s.x) <= halfTileW + 6 &&
              Math.abs(av.y - s.y) <= halfTileH + 6,
          ) ||
          (nearbyStructure &&
          (nearbyStructure.type === 'solar_panel' || nearbyStructure.type === 'wind_turbine')
            ? nearbyStructure
            : null);

        const activeHaloBonsai = inspectingBonsai || nearbyBonsai;

        // A. 3x3 CLEAN ENERGY RESONANCE HALO (Floor Tiles & Beams)
        if (activeHaloGenerator) {
          const isSolar = activeHaloGenerator.type === 'solar_panel';
          const centerCol = Math.round((activeHaloGenerator.x - SANCTUARY_GRID.startX) / SANCTUARY_GRID.cellW);
          const centerRow = Math.round((activeHaloGenerator.y - SANCTUARY_GRID.startY) / SANCTUARY_GRID.cellH);
          const haloTime = Date.now() * 0.005;
          const haloPulse = 0.55 + Math.sin(haloTime) * 0.35;

          const haloFill = isSolar
            ? `rgba(245, 158, 11, ${0.09 + haloPulse * 0.07})`
            : `rgba(6, 182, 212, ${0.09 + haloPulse * 0.07})`;
          const haloBorder = isSolar
            ? `rgba(251, 191, 36, ${0.55 + haloPulse * 0.35})`
            : `rgba(56, 189, 248, ${0.55 + haloPulse * 0.35})`;

          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              const gc = centerCol + dc;
              const gr = centerRow + dr;
              if (gc >= 0 && gc < SANCTUARY_GRID.cols && gr >= 0 && gr < SANCTUARY_GRID.rows) {
                const tx = SANCTUARY_GRID.startX + gc * SANCTUARY_GRID.cellW;
                const ty = SANCTUARY_GRID.startY + gr * SANCTUARY_GRID.cellH;
                const tW = SANCTUARY_GRID.cellW - 8;
                const tH = SANCTUARY_GRID.cellH - 8;

                ctx.save();
                // Glowing resonance tile backdrop
                ctx.fillStyle = haloFill;
                ctx.beginPath();
                ctx.roundRect(tx - tW / 2, ty - tH / 2, tW, tH, 6);
                ctx.fill();

                // Luminous boundary
                ctx.strokeStyle = haloBorder;
                ctx.lineWidth = dr === 0 && dc === 0 ? 2.5 : 1.8;
                ctx.setLineDash([4, 4]);
                ctx.stroke();
                ctx.setLineDash([]);

                // Visual Ambience within neighboring halo tiles
                if (isSolar) {
                  // Floating solar dust motes
                  for (let sm = 0; sm < 2; sm++) {
                    const smAng = haloTime * 2 + gc * 1.5 + gr * 2 + sm * Math.PI;
                    const smDist = 12 + Math.sin(haloTime * 3 + sm) * 6;
                    const smX = tx + Math.cos(smAng) * smDist;
                    const smY = ty + Math.sin(smAng) * (smDist * 0.7);
                    ctx.fillStyle = `rgba(254, 240, 138, ${0.4 + Math.sin(haloTime * 4 + sm) * 0.3})`;
                    ctx.beginPath();
                    ctx.arc(smX, smY, 1.6, 0, Math.PI * 2);
                    ctx.fill();
                  }
                } else {
                  // Gentle swirling breeze arcs
                  const breezeAng = haloTime * 2.5 + gc * 0.8 + gr * 1.2;
                  ctx.strokeStyle = `rgba(186, 230, 253, ${0.35 + Math.sin(haloTime * 3) * 0.2})`;
                  ctx.lineWidth = 1.2;
                  ctx.beginPath();
                  ctx.arc(tx, ty, 14, breezeAng, breezeAng + 1.2);
                  ctx.stroke();
                }

                // Check if this neighboring tile has an adjacent matching generator
                if (!(dr === 0 && dc === 0)) {
                  const hasMatching = deployedStructuresRef.current.some((s) => {
                    if (s.id === activeHaloGenerator.id) return false;
                    if (s.type !== activeHaloGenerator.type) return false;
                    const sc = Math.round((s.x - SANCTUARY_GRID.startX) / SANCTUARY_GRID.cellW);
                    const sr = Math.round((s.y - SANCTUARY_GRID.startY) / SANCTUARY_GRID.cellH);
                    return sc === gc && sr === gr;
                  });

                  if (hasMatching) {
                    // Resonance energy conduit beam linking the two generators
                    ctx.strokeStyle = isSolar ? '#facc15' : '#38bdf8';
                    ctx.lineWidth = 2.5;
                    ctx.beginPath();
                    ctx.moveTo(activeHaloGenerator.x, activeHaloGenerator.y);
                    ctx.lineTo(tx, ty);
                    ctx.stroke();

                    // Sparkle on active link
                    const sparkPulse = 0.6 + Math.sin(haloTime * 2 + gc + gr) * 0.4;
                    ctx.fillStyle = isSolar ? `rgba(254, 240, 138, ${sparkPulse})` : `rgba(186, 230, 253, ${sparkPulse})`;
                    ctx.beginPath();
                    ctx.arc((activeHaloGenerator.x + tx) / 2, (activeHaloGenerator.y + ty) / 2, 3.5, 0, Math.PI * 2);
                    ctx.fill();
                  }
                }
                ctx.restore();
              }
            }
          }
        }

        // B. 3x3 LUMINOUS EMERALD / WARNING AMBER-CRIMSON STALLED BONSAI PROXIMITY RESONANCE HALO (Floor Tiles & Beams)
        if (activeHaloBonsai && !activeHaloGenerator) {
          const haloSynergies = getCachedBonsaiSynergies(activeHaloBonsai);
          const isStalled = haloSynergies.isStalled;
          const centerCol = Math.round((activeHaloBonsai.x - SANCTUARY_GRID.startX) / SANCTUARY_GRID.cellW);
          const centerRow = Math.round((activeHaloBonsai.y - SANCTUARY_GRID.startY) / SANCTUARY_GRID.cellH);
          const haloTime = Date.now() * 0.005;
          const haloPulse = 0.55 + Math.sin(haloTime) * 0.35;

          const haloFill = isStalled
            ? `rgba(225, 29, 72, ${0.12 + haloPulse * 0.08})`
            : `rgba(16, 185, 129, ${0.08 + haloPulse * 0.06})`;
          const haloBorder = isStalled
            ? `rgba(244, 63, 94, ${0.65 + haloPulse * 0.35})`
            : `rgba(52, 211, 153, ${0.55 + haloPulse * 0.35})`;

          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              const gc = centerCol + dc;
              const gr = centerRow + dr;
              if (gc >= 0 && gc < SANCTUARY_GRID.cols && gr >= 0 && gr < SANCTUARY_GRID.rows) {
                const tx = SANCTUARY_GRID.startX + gc * SANCTUARY_GRID.cellW;
                const ty = SANCTUARY_GRID.startY + gr * SANCTUARY_GRID.cellH;
                const tW = SANCTUARY_GRID.cellW - 8;
                const tH = SANCTUARY_GRID.cellH - 8;

                ctx.save();
                // Glowing resonance tile backdrop
                ctx.fillStyle = haloFill;
                ctx.beginPath();
                ctx.roundRect(tx - tW / 2, ty - tH / 2, tW, tH, 6);
                ctx.fill();

                // Luminous boundary
                ctx.strokeStyle = haloBorder;
                ctx.lineWidth = dr === 0 && dc === 0 ? 2.5 : 1.6;
                ctx.setLineDash(isStalled ? [5, 3] : [4, 4]);
                ctx.stroke();
                ctx.setLineDash([]);

                // Visual Ambience within neighboring halo tiles
                if (isStalled) {
                  // Warning amber-crimson ember sparks
                  for (let em = 0; em < 2; em++) {
                    const emAng = haloTime * 2.2 + gc * 1.5 + gr * 1.9 + em * Math.PI;
                    const emDist = 10 + Math.sin(haloTime * 3 + em) * 6;
                    const emX = tx + Math.cos(emAng) * emDist;
                    const emY = ty + Math.sin(emAng) * (emDist * 0.65);
                    ctx.fillStyle = `rgba(244, 63, 94, ${0.55 + Math.sin(haloTime * 4 + em) * 0.35})`;
                    ctx.beginPath();
                    ctx.arc(emX, emY, 2.0, 0, Math.PI * 2);
                    ctx.fill();
                  }
                } else {
                  // Floating subtle emerald leaf motes inside halo tiles
                  for (let lm = 0; lm < 2; lm++) {
                    const lmAng = haloTime * 1.8 + gc * 1.3 + gr * 1.7 + lm * Math.PI;
                    const lmDist = 10 + Math.sin(haloTime * 2.5 + lm) * 7;
                    const lmX = tx + Math.cos(lmAng) * lmDist;
                    const lmY = ty + Math.sin(lmAng) * (lmDist * 0.65);
                    ctx.fillStyle = `rgba(52, 211, 153, ${0.45 + Math.sin(haloTime * 3 + lm) * 0.25})`;
                    ctx.beginPath();
                    ctx.ellipse(lmX, lmY, 2.2, 1.2, lmAng, 0, Math.PI * 2);
                    ctx.fill();
                  }
                }

                // Entity Synergy Links to Neighboring Tiles
                if (!(dr === 0 && dc === 0)) {
                  // Check for neighboring Bonsai
                  const matchingBonsai = plantedBonsaisRef.current.find((b) => {
                    if (b.id === activeHaloBonsai.id) return false;
                    const sc = Math.round((b.x - SANCTUARY_GRID.startX) / SANCTUARY_GRID.cellW);
                    const sr = Math.round((b.y - SANCTUARY_GRID.startY) / SANCTUARY_GRID.cellH);
                    return sc === gc && sr === gr;
                  });

                  // Check for specific Garden Decor
                  const matchingWall = deployedStructuresRef.current.find((s) => {
                    if (s.type !== 'decor_woven_wall') return false;
                    const sc = Math.round((s.x - SANCTUARY_GRID.startX) / SANCTUARY_GRID.cellW);
                    const sr = Math.round((s.y - SANCTUARY_GRID.startY) / SANCTUARY_GRID.cellH);
                    return sc === gc && sr === gr;
                  });
                  const matchingRock = deployedStructuresRef.current.find((s) => {
                    if (s.type !== 'decor_rock_formation') return false;
                    const sc = Math.round((s.x - SANCTUARY_GRID.startX) / SANCTUARY_GRID.cellW);
                    const sr = Math.round((s.y - SANCTUARY_GRID.startY) / SANCTUARY_GRID.cellH);
                    return sc === gc && sr === gr;
                  });
                  const matchingBush = deployedStructuresRef.current.find((s) => {
                    if (s.type !== 'decor_shrubbery_bush') return false;
                    const sc = Math.round((s.x - SANCTUARY_GRID.startX) / SANCTUARY_GRID.cellW);
                    const sr = Math.round((s.y - SANCTUARY_GRID.startY) / SANCTUARY_GRID.cellH);
                    return sc === gc && sr === gr;
                  });

                  // Check for neighboring Tools
                  const matchingTool = deployedStructuresRef.current.find((s) => {
                    const isTool = s.type === 'tool_compost_heap' || s.type === 'tool_garden_well';
                    if (!isTool) return false;
                    const sc = Math.round((s.x - SANCTUARY_GRID.startX) / SANCTUARY_GRID.cellW);
                    const sr = Math.round((s.y - SANCTUARY_GRID.startY) / SANCTUARY_GRID.cellH);
                    return sc === gc && sr === gr;
                  });

                  // Check for neighboring Crystal Pedestal
                  const matchingCrystal = deployedStructuresRef.current.find((s) => {
                    if (!s.type.startsWith('crystal_pedestal')) return false;
                    const sc = Math.round((s.x - SANCTUARY_GRID.startX) / SANCTUARY_GRID.cellW);
                    const sr = Math.round((s.y - SANCTUARY_GRID.startY) / SANCTUARY_GRID.cellH);
                    return sc === gc && sr === gr;
                  });

                  // Check for neighboring Energy
                  const matchingEnergy = deployedStructuresRef.current.find((s) => {
                    const isEnergy = s.type === 'solar_panel' || s.type === 'wind_turbine';
                    if (!isEnergy) return false;
                    const sc = Math.round((s.x - SANCTUARY_GRID.startX) / SANCTUARY_GRID.cellW);
                    const sr = Math.round((s.y - SANCTUARY_GRID.startY) / SANCTUARY_GRID.cellH);
                    return sc === gc && sr === gr;
                  });

                  // Stalled Surroundings: If this neighbor matches the offending repetitive entity key
                  const neighborKey = matchingBonsai
                    ? 'bonsai'
                    : matchingCrystal
                    ? 'crystal_pedestal'
                    : matchingWall
                    ? 'decor_woven_wall'
                    : matchingRock
                    ? 'decor_rock_formation'
                    : matchingBush
                    ? 'decor_shrubbery_bush'
                    : matchingTool
                    ? matchingTool.type
                    : matchingEnergy
                    ? matchingEnergy.type
                    : null;

                  if (isStalled && neighborKey && neighborKey === haloSynergies.stalledEntityKey) {
                    // Amber-Crimson warning stall conduit beam
                    ctx.strokeStyle = '#f43f5e';
                    ctx.lineWidth = 2.4;
                    ctx.setLineDash([4, 3]);
                    ctx.beginPath();
                    ctx.moveTo(activeHaloBonsai.x, activeHaloBonsai.y);
                    ctx.lineTo(tx, ty);
                    ctx.stroke();
                    ctx.setLineDash([]);

                    // Warning Stall Pulse Dot at midpoint
                    const sparkPulse = 0.7 + Math.sin(haloTime * 3 + gc + gr) * 0.3;
                    ctx.fillStyle = `rgba(244, 63, 94, ${sparkPulse})`;
                    ctx.beginPath();
                    ctx.arc((activeHaloBonsai.x + tx) / 2, (activeHaloBonsai.y + ty) / 2, 3.8, 0, Math.PI * 2);
                    ctx.fill();
                  } else if (!isStalled && matchingCrystal) {
                    // Positive Crystal Conduit Beam
                    const crystalColors: Record<string, string> = {
                      crystal_pedestal_foliage: '#22c55e',
                      crystal_pedestal_branches: '#eab308',
                      crystal_pedestal_trunk: '#ef4444',
                      crystal_pedestal_roots: '#3b82f6',
                    };
                    const beamColor = crystalColors[matchingCrystal.type] || '#c084fc';
                    ctx.strokeStyle = beamColor;
                    ctx.lineWidth = 2.0;
                    ctx.beginPath();
                    ctx.moveTo(activeHaloBonsai.x, activeHaloBonsai.y);
                    ctx.lineTo(tx, ty);
                    ctx.stroke();

                    const sparkPulse = 0.6 + Math.sin(haloTime * 2 + gc + gr) * 0.4;
                    ctx.fillStyle = beamColor;
                    ctx.beginPath();
                    ctx.arc((activeHaloBonsai.x + tx) / 2, (activeHaloBonsai.y + ty) / 2, 3.2, 0, Math.PI * 2);
                    ctx.fill();
                  } else if (!isStalled && matchingBonsai) {
                    // Positive Green Resonance Conduit Beam (Growing Together)
                    ctx.strokeStyle = '#34d399';
                    ctx.lineWidth = 2.2;
                    ctx.beginPath();
                    ctx.moveTo(activeHaloBonsai.x, activeHaloBonsai.y);
                    ctx.lineTo(tx, ty);
                    ctx.stroke();

                    // Glowing Leaf spark at midpoint
                    const sparkPulse = 0.6 + Math.sin(haloTime * 2 + gc + gr) * 0.4;
                    ctx.fillStyle = `rgba(52, 211, 153, ${sparkPulse})`;
                    ctx.beginPath();
                    ctx.arc((activeHaloBonsai.x + tx) / 2, (activeHaloBonsai.y + ty) / 2, 3.5, 0, Math.PI * 2);
                    ctx.fill();
                  } else if (!isStalled && matchingWall) {
                    // Positive Amber Conduit Beam (Private Growing)
                    ctx.strokeStyle = '#f59e0b';
                    ctx.lineWidth = 2.0;
                    ctx.beginPath();
                    ctx.moveTo(activeHaloBonsai.x, activeHaloBonsai.y);
                    ctx.lineTo(tx, ty);
                    ctx.stroke();

                    const sparkPulse = 0.6 + Math.sin(haloTime * 2 + gc + gr) * 0.4;
                    ctx.fillStyle = `rgba(245, 158, 11, ${sparkPulse})`;
                    ctx.beginPath();
                    ctx.arc((activeHaloBonsai.x + tx) / 2, (activeHaloBonsai.y + ty) / 2, 3.2, 0, Math.PI * 2);
                    ctx.fill();
                  } else if (!isStalled && matchingRock) {
                    // Positive Silver/Slate Conduit Beam (Quick Prune)
                    ctx.strokeStyle = '#94a3b8';
                    ctx.lineWidth = 2.0;
                    ctx.beginPath();
                    ctx.moveTo(activeHaloBonsai.x, activeHaloBonsai.y);
                    ctx.lineTo(tx, ty);
                    ctx.stroke();

                    const sparkPulse = 0.6 + Math.sin(haloTime * 2 + gc + gr) * 0.4;
                    ctx.fillStyle = `rgba(148, 163, 184, ${sparkPulse})`;
                    ctx.beginPath();
                    ctx.arc((activeHaloBonsai.x + tx) / 2, (activeHaloBonsai.y + ty) / 2, 3.2, 0, Math.PI * 2);
                    ctx.fill();
                  } else if (!isStalled && matchingBush) {
                    // Positive Emerald Conduit Beam (XP Boosted)
                    ctx.strokeStyle = '#10b981';
                    ctx.lineWidth = 2.0;
                    ctx.beginPath();
                    ctx.moveTo(activeHaloBonsai.x, activeHaloBonsai.y);
                    ctx.lineTo(tx, ty);
                    ctx.stroke();

                    const sparkPulse = 0.6 + Math.sin(haloTime * 2 + gc + gr) * 0.4;
                    ctx.fillStyle = `rgba(16, 185, 129, ${sparkPulse})`;
                    ctx.beginPath();
                    ctx.arc((activeHaloBonsai.x + tx) / 2, (activeHaloBonsai.y + ty) / 2, 3.2, 0, Math.PI * 2);
                    ctx.fill();
                  } else if (matchingEnergy) {
                    // Negative Disrupted Zen dashed warning beam
                    ctx.strokeStyle = 'rgba(239, 68, 68, 0.75)';
                    ctx.lineWidth = 1.6;
                    ctx.setLineDash([3, 3]);
                    ctx.beginPath();
                    ctx.moveTo(activeHaloBonsai.x, activeHaloBonsai.y);
                    ctx.lineTo(tx, ty);
                    ctx.stroke();
                    ctx.setLineDash([]);
                  }
                }
                ctx.restore();
              }
            }
          }
        }

        // =========================================================================
        // STRICT 4-LAYER RENDERING PIPELINE FOR SANCTUARY
        // =========================================================================

        // =========================================================================
        // LAYER 1: Ground Tiles, Paths, Torii Gate Walkway & Placement Preview
        // =========================================================================
        // 1.1 Deployed Pebble Paths & Torii Gate Ground Walkways
        deployedStructuresRef.current.forEach((struct) => {
          const sx = struct.x;
          const sy = struct.y;
          if (struct.type === 'decor_pebble_path') {
            renderPebbleCluster(ctx, sx, sy, struct.variant ?? 0);
          } else if (struct.type === 'torii_gate') {
            drawToriiGateGround(ctx, sx, sy, struct.orientation || 'horizontal');
          }
        });

        // 1.2 Placement Preview (Drawn strictly in Layer 1 so Player Avatar walks on top!)
        if (placementPreviewRef.current) {
          const prev = placementPreviewRef.current;
          const currentPlot = activePlotRef.current || getPreviewPlot(av.x, av.y, inv.sanctuary_expansion_tier || 0);
          if (currentPlot) {
            const isValid = checkPlotPlacementValid(currentPlot, prev);
            const px = currentPlot.centerX;
            const py = currentPlot.centerY;
            const isVert = prev.payload === 'torii_gate' && prev.orientation === 'vertical';

            ctx.save();

            // Emerald / Rose Bounding Box
            if (prev.payload === 'torii_gate') {
              ctx.strokeStyle = isValid ? '#34d399' : '#f43f5e';
              ctx.lineWidth = 3;
              ctx.setLineDash([5, 5]);
              if (isVert) {
                ctx.beginPath();
                ctx.roundRect(px - halfTileW, py - SANCTUARY_GRID.cellH - halfTileH, halfTileW * 2, SANCTUARY_GRID.cellH * 2 + halfTileH * 2, 8);
                ctx.stroke();
              } else {
                ctx.beginPath();
                ctx.roundRect(px - SANCTUARY_GRID.cellW - halfTileW, py - halfTileH, SANCTUARY_GRID.cellW * 2 + halfTileW * 2, halfTileH * 2, 8);
                ctx.stroke();
              }
              ctx.setLineDash([]);
            } else {
              ctx.strokeStyle = isValid ? '#34d399' : '#f43f5e';
              ctx.lineWidth = 3;
              ctx.strokeRect(currentPlot.x, currentPlot.y, currentPlot.width, currentPlot.height);
            }

            // Crisp Desaturated (B&W Grayscale) Complete Graphic for ALL preview items
            ctx.save();
            ctx.filter = 'grayscale(100%) contrast(120%) brightness(1.05)';
            ctx.globalAlpha = 0.85;

            const isSeedling = prev.category === 'seedling';
            const isBonsai = prev.category === 'bonsai';

            if (isSeedling || isBonsai) {
              const seedlingData = prev.payload || {};
              const leafType = (seedlingData.leafType || seedlingData.species || 'circle') as BonsaiLeafType;
              const styleKey = (prev.style || seedlingData.style || 'MOYOGI') as BonsaiStyle;
              const leafDef = getLeafTypeDef(leafType);
              const foliageColor = leafDef.color;
              const foliageAccent = leafDef.accentColor;

              const stageScale = isBonsai ? Math.min(1.0, 0.60 + ((seedlingData.level || 1) / 100) * 0.40) : 0.60;
              const trunkHeight = 32 + stageScale * 26;
              const trunkThickness = 4.5 + stageScale * 4;
              const bx = px;
              const by = py + 4;

              // Ceramic Pot Body
              ctx.fillStyle = seedlingData.potColor || '#1e293b';
              ctx.beginPath();
              ctx.roundRect(
                bx - (26 * stageScale + 4),
                by - 4,
                (26 * stageScale + 4) * 2,
                16 * stageScale + 2,
                [2, 2, 6, 6],
              );
              ctx.fill();
              ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
              ctx.lineWidth = 1.2;
              ctx.stroke();

              // Soil
              ctx.fillStyle = '#3b1802';
              ctx.beginPath();
              ctx.ellipse(bx, by - 3, 23 * stageScale + 2, 5 * stageScale, 0, 0, Math.PI * 2);
              ctx.fill();

              // Complete bonsai trunk & canopy
              drawBonsaiTrunkAndCanopy(
                ctx,
                bx,
                by,
                stageScale,
                trunkHeight,
                trunkThickness,
                styleKey,
                leafType,
                foliageColor,
                foliageAccent,
              );
            } else {
              // Infrastructure or Decoration - renders the EXACT SAME complete vector graphic!
              const decorType = (typeof prev.payload === 'string' ? prev.payload : prev.item || 'decor_rock_formation') as DeployedStructureType;
              renderCompleteDecor(
                ctx,
                decorType,
                px,
                py,
                prev.orientation || 'horizontal',
                undefined,
                deployedStructuresRef.current,
                turbineAngleRef.current,
              );
            }

            ctx.filter = 'none';
            ctx.restore();
            ctx.restore();
          }
        }

        // =========================================================================
        // LAYER 2: Y-Sorted Physical World Entities
        // =========================================================================
        type WorldEntity =
          | { kind: 'bonsai'; data: PlantedBonsai; y: number }
          | { kind: 'structure'; data: DeployedStructure; y: number };

        const worldEntities: WorldEntity[] = [];

        plantedBonsaisRef.current.forEach((b) => {
          worldEntities.push({ kind: 'bonsai', data: b, y: b.y });
        });

        deployedStructuresRef.current.forEach((s) => {
          if (s.type !== 'decor_pebble_path') {
            worldEntities.push({ kind: 'structure', data: s, y: s.y });
          }
        });

        // Strictly sort by Y ascending (top to bottom) so lower rows render OVER upper rows!
        worldEntities.sort((a, b) => a.y - b.y);

        worldEntities.forEach((entity) => {
          ctx.save();
          if (entity.kind === 'structure') {
            const struct = entity.data;
            const sx = struct.x;
            const sy = struct.y;
            const isNearby = nearbyStructure?.id === struct.id;

            if (isNearby) {
              ctx.strokeStyle = struct.type === 'solar_panel'
                ? '#38bdf8'
                : struct.type === 'wind_turbine'
                ? '#f59e0b'
                : struct.type === 'torii_gate'
                ? '#ef4444'
                : '#10b981';
              ctx.lineWidth = 2.5;
              ctx.setLineDash([4, 4]);
              ctx.beginPath();
              if (struct.type === 'torii_gate') {
                if (struct.orientation === 'vertical') {
                  ctx.roundRect(
                    sx - halfTileW,
                    sy - SANCTUARY_GRID.cellH - halfTileH,
                    halfTileW * 2,
                    SANCTUARY_GRID.cellH * 2 + halfTileH * 2,
                    8,
                  );
                } else {
                  ctx.roundRect(
                    sx - SANCTUARY_GRID.cellW - halfTileW,
                    sy - halfTileH,
                    SANCTUARY_GRID.cellW * 2 + halfTileW * 2,
                    halfTileH * 2,
                    8,
                  );
                }
              } else {
                ctx.roundRect(
                  sx - halfTileW,
                  sy - halfTileH,
                  halfTileW * 2,
                  halfTileH * 2,
                  6,
                );
              }
              ctx.stroke();
              ctx.setLineDash([]);
            }

            if (struct.type === 'torii_gate') {
              // Torii Gate Flanking Bushes & Pillars drawn strictly in row Y's entity pass!
              // When row Y+1 renders after row Y, the bonsai tree in row Y+1 renders OVER these bushes!
              drawToriiZenBushes(ctx, sx, sy, struct.orientation || 'horizontal', false);
              drawToriiGatePillars(ctx, sx, sy, struct.orientation || 'horizontal', false);
            } else {
              renderCompleteDecor(
                ctx,
                struct.type,
                sx,
                sy,
                struct.orientation || 'horizontal',
                struct,
                deployedStructuresRef.current,
                turbineAngleRef.current,
              );
            }
          } else {
            // Render Bonsai Physical Artwork (Pot, Loam Soil, Trunk, Branches, Foliage)
            const bonsai = entity.data;
            const isNearby = nearbyBonsai?.id === bonsai.id;

            if (isNearby) {
              ctx.strokeStyle = '#10b981';
              ctx.lineWidth = 2.5;
              ctx.setLineDash([4, 4]);
              ctx.beginPath();
              ctx.roundRect(
                bonsai.x - halfTileW,
                bonsai.y - halfTileH,
                halfTileW * 2,
                halfTileH * 2,
                6,
              );
              ctx.stroke();
              ctx.setLineDash([]);
            }

            const bStyle: BonsaiStyle = bonsai.style || 'MOYOGI';
            const bLeafType: BonsaiLeafType = bonsai.leafType || 'circle';
            const bDef = getLeafTypeDef(bLeafType);
            const foliageColor = bDef.color;
            const foliageAccent = bDef.accentColor;

            // Graceful scaling with level stage (0.60 at Lv.1 up to 1.0 at Lv.100)
            const stageScale = Math.min(1.0, 0.60 + (bonsai.level / 100) * 0.40);
            const trunkHeight = 32 + stageScale * 26;
            const trunkThickness = 4.5 + stageScale * 4;

            const bx = bonsai.x;
            const by = bonsai.y + 4; // base soil center

            // Ceramic Pot Shadow
            ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
            ctx.beginPath();
            ctx.ellipse(bx, by + 10, 26 * stageScale + 6, 7, 0, 0, Math.PI * 2);
            ctx.fill();

            // Ceramic Pot Body
            ctx.fillStyle = bonsai.potColor || '#1e293b';
            ctx.beginPath();
            ctx.roundRect(
              bx - (26 * stageScale + 4),
              by - 4,
              (26 * stageScale + 4) * 2,
              16 * stageScale + 2,
              [2, 2, 6, 6],
            );
            ctx.fill();
            ctx.strokeStyle = bonsai.rarity === 'MYTHIC' ? '#fbbf24' : 'rgba(255, 255, 255, 0.45)';
            ctx.lineWidth = 1.2;
            ctx.stroke();

            // Pot Rim Detail
            ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
            ctx.fillRect(bx - (25 * stageScale + 3), by - 4, (25 * stageScale + 3) * 2, 2.5);

            // Rich Dark Loam Soil
            ctx.fillStyle = '#3b1802';
            ctx.beginPath();
            ctx.ellipse(bx, by - 3, 23 * stageScale + 2, 5 * stageScale, 0, 0, Math.PI * 2);
            ctx.fill();

            // Draw the authentic trunk, branches, and foliage pads supporting all 7 classical styles
            drawBonsaiTrunkAndCanopy(
              ctx,
              bx,
              by,
              stageScale,
              trunkHeight,
              trunkThickness,
              bStyle,
              bLeafType,
              foliageColor,
              foliageAccent,
            );

            // Foliage sparkle / astral aura for Roku-men Star & Elemental Fire
            if (bLeafType === 'star') {
              ctx.fillStyle = '#fef08a';
              for (let g = 0; g < 5; g++) {
                const gx = bx + Math.sin(g * 2 + Date.now() * 0.003) * 16 * stageScale;
                const gy = by - 4 - trunkHeight * 0.8 + Math.cos(g * 2) * 12 * stageScale;
                ctx.beginPath();
                ctx.arc(gx, gy, 2.2 * stageScale, 0, Math.PI * 2);
                ctx.fill();
              }
            } else if (bLeafType === 'fire') {
              ctx.fillStyle = '#facc15';
              for (let b = 0; b < 4; b++) {
                const sx = bx + Math.sin(b * 1.6 + Date.now() * 0.004) * 14 * stageScale;
                const sy = by - 4 - trunkHeight * 0.75 + Math.cos(b * 1.6) * 10 * stageScale;
                ctx.beginPath();
                ctx.arc(sx, sy, 2.2 * stageScale, 0, Math.PI * 2);
                ctx.fill();
              }
            }

            // Level 100 Mastery Radiant Aura
            if (bonsai.level >= 100) {
              ctx.strokeStyle = bonsai.rarity === 'MYTHIC' ? 'rgba(250, 204, 21, 0.85)' : 'rgba(16, 185, 129, 0.75)';
              ctx.lineWidth = 2.5;
              ctx.beginPath();
              ctx.arc(bx, by - 4 - trunkHeight * 0.5, 38 * stageScale, 0, Math.PI * 2);
              ctx.stroke();
            }

            // Attached Watering Automaton
            if (bonsai.automatonTier > 0) {
              const tier = bonsai.automatonTier;
              const machX = bx + 26 * stageScale;
              const machY = by - 8;
              const tierColor = tier === 1 ? '#38bdf8' : tier === 2 ? '#a855f7' : '#f59e0b';

              ctx.strokeStyle = tierColor;
              ctx.lineWidth = 2;
              ctx.beginPath();
              ctx.moveTo(machX, machY + 10);
              ctx.lineTo(machX, machY - 6);
              ctx.lineTo(bx + 6, machY - 12);
              ctx.stroke();

              ctx.fillStyle = tierColor;
              ctx.beginPath();
              ctx.arc(machX, machY, 4, 0, Math.PI * 2);
              ctx.fill();

              ctx.fillStyle = power.isPowerSufficient ? tierColor : '#ef4444';
              ctx.beginPath();
              ctx.arc(bx + 6, machY - 12, 3, 0, Math.PI * 2);
              ctx.fill();

              if (power.isPowerSufficient) {
                const spraySin = Math.sin(bonsai.waterSprayAnim);
                ctx.fillStyle = tier === 3 ? 'rgba(245, 158, 11, 0.7)' : tier === 2 ? 'rgba(168, 85, 247, 0.6)' : 'rgba(56, 189, 248, 0.5)';
                const sprayCount = tier === 3 ? 4 : tier === 2 ? 3 : 2;
                for (let d = 0; d < sprayCount; d++) {
                  ctx.beginPath();
                  ctx.arc(
                    bx + 3 - d * 3.5 + spraySin * 2.5,
                    machY - 10 + d * 3,
                    1.8,
                    0,
                    Math.PI * 2,
                  );
                  ctx.fill();
                }
              }
            }

            // Groundwater hydration ripples
            if (bonsai.wateredTimer && bonsai.wateredTimer > 0) {
              const ripTime = Date.now() * 0.005;
              for (let r = 0; r < 2; r++) {
                const rRad = ((ripTime * 20 + r * 15) % 32) + 6;
                const rAlpha = Math.max(0, 1 - rRad / 38) * 0.75;
                ctx.strokeStyle = `rgba(56, 189, 248, ${rAlpha})`;
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.ellipse(bx, by - 2, rRad, rRad * 0.4, 0, 0, Math.PI * 2);
                ctx.stroke();
              }

              ctx.fillStyle = '#38bdf8';
              for (let d = 0; d < 3; d++) {
                const dAngle = ripTime * 3 + d * 2.1;
                const dropDist = 12 + d * 4;
                ctx.beginPath();
                ctx.arc(
                  bx + Math.cos(dAngle) * dropDist,
                  by - 14 + Math.sin(dAngle) * 5,
                  1.6,
                  0,
                  Math.PI * 2,
                );
                ctx.fill();
              }
            }

            // Prune Boost Glow & Expanding Care Ring
            if (bonsai.lastPruneTime) {
              const elapsed = Date.now() - bonsai.lastPruneTime;
              if (elapsed < 1000) {
                const alpha = Math.max(0, 1 - elapsed / 1000);
                const ringRadius = 24 * stageScale + (elapsed / 1000) * 26;

                ctx.save();
                ctx.strokeStyle = `rgba(236, 72, 153, ${alpha * 0.9})`;
                ctx.lineWidth = 2.5;
                ctx.beginPath();
                ctx.arc(bx, by - 14, ringRadius, 0, Math.PI * 2);
                ctx.stroke();

                ctx.strokeStyle = `rgba(168, 85, 247, ${alpha * 0.6})`;
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.arc(bx, by - 14, ringRadius + 5, 0, Math.PI * 2);
                ctx.stroke();
                ctx.restore();
              }
            } else if (bonsai.pruneBoostTimer > 0) {
              ctx.strokeStyle = 'rgba(236, 72, 153, 0.85)';
              ctx.lineWidth = 2;
              ctx.beginPath();
              ctx.arc(bx, by - 14, 34 * stageScale, 0, Math.PI * 2);
              ctx.stroke();
            }

            // NOTE: Level badge and progress bar are NOT drawn here!
            // They are rendered in Layer 3 after all Layer 2 entities finish!
          }
          ctx.restore();
        });

        // =========================================================================
        // LAYER 3: Bonsai Level Badges & Growth Progress Bars
        // (Guaranteed to be above ALL Layer 2 trees and decors!)
        // =========================================================================
        plantedBonsaisRef.current.forEach((bonsai) => {
          ctx.save();
          const bx = bonsai.x;
          const by = bonsai.y + 4;
          const mDef = getMaturityDef(bonsai.maturity);
          const badgeY = by + 14;

          // Draw the floating level badge tag: Kanji | Lv.X
          drawBonsaiPotTag(ctx, bx, badgeY, bonsai.maturity, bonsai.level);

          // Draw growth progress bar
          if (bonsai.level < 100) {
            const target = getBonsaiLevelGrowthNeeded(bonsai.level, bonsai.maturity);
            const pct = Math.min(1.0, bonsai.progressSeconds / target);
            const barY = badgeY + 11;

            ctx.fillStyle = 'rgba(2, 6, 23, 0.85)';
            ctx.beginPath();
            ctx.roundRect(bx - 20, barY, 40, 3.5, 2);
            ctx.fill();
            ctx.strokeStyle = mDef.border;
            ctx.lineWidth = 0.5;
            ctx.stroke();

            let barColor = mDef.color;
            if (bonsai.pruneBoostTimer > 0) {
              barColor = '#ec4899';
            } else if (bonsai.automatonTier > 0 && power.isPowerSufficient) {
              barColor = mDef.color;
            } else if (bonsai.automatonTier > 0 && !power.isPowerSufficient) {
              barColor = '#f59e0b';
            }

            ctx.fillStyle = barColor;
            ctx.beginPath();
            ctx.roundRect(bx - 20, barY, Math.max(2, 40 * pct), 3.5, 2);
            ctx.fill();
          }
          ctx.restore();
        });

        // =========================================================================
        // LAYER 4: Player Avatar & Overhead Torii Gate Lintel
        // =========================================================================
        // 4.1 Player Avatar (Walks on top of Layer 1 preview, Layer 2 world entities, and Layer 3 badges)
        ctx.save();
        ctx.translate(av.x, av.y);

        ctx.fillStyle = 'rgba(0,0,0,0.35)';
        ctx.beginPath();
        ctx.ellipse(0, 16, 18, 8, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#047857';
        ctx.beginPath();
        ctx.roundRect(-14, -18, 28, 30, 6);
        ctx.fill();

        ctx.fillStyle = '#b45309';
        ctx.beginPath();
        ctx.roundRect(-10, -14, 20, 18, 4);
        ctx.fill();

        ctx.fillStyle = '#fde047';
        ctx.beginPath();
        ctx.arc(0, -26, 12, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#d97706';
        ctx.beginPath();
        ctx.ellipse(0, -32, 18, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#b45309';
        ctx.beginPath();
        ctx.arc(0, -34, 9, Math.PI, 0);
        ctx.fill();

        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(-6, -26, 4, 3);
        ctx.fillRect(2, -26, 4, 3);

        ctx.restore();

        // 4.2 Torii Gate Upper Kasagi Roof Lintel (Way above player head at sy - 64)
        // Player walks underneath this roof beam!
        deployedStructuresRef.current.forEach((struct) => {
          if (struct.type === 'torii_gate') {
            drawToriiGateRoofLintel(ctx, struct.x, struct.y, struct.orientation || 'horizontal', false);
          }
        });

        // Floating texts rendered within sanctuary camera space
        floatingTextsRef.current.forEach((ft) => {
          ctx.save();
          ctx.globalAlpha = ft.alpha;
          ctx.fillStyle = ft.color;
          ctx.font = 'bold 13px system-ui';
          ctx.textAlign = 'center';
          ctx.shadowColor = 'rgba(0,0,0,0.8)';
          ctx.shadowBlur = 4;
          ctx.fillText(ft.text, ft.x, ft.y);
          ctx.restore();
        });

        // Particles rendered within sanctuary camera space (Optimized batch, single save/restore)
        ctx.save();
        const sanctuaryPool = particlePoolRef.current;
        for (let i = 0; i < sanctuaryPool.length; i++) {
          const p = sanctuaryPool[i];
          if (!p.active || p.alpha <= 0.01) continue;
          ctx.globalAlpha = p.alpha;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, Math.max(0, p.size), 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();

        ctx.restore(); // restores sanctuary camera transform (0, -sCamY)
      } else {
        // --- RENDER SCROLLING WILDERNESS EXCURSION MAP WITH DISTINCT BIOME ATMOSPHERES ---
        const cam = cameraRef.current;
        const rover = roverRef.current;
        const ts = EXCURSION_TILE_SIZE;
        const biome = EXPEDITION_BIOMES[activeBiomeIdRef.current];

        ctx.save();
        ctx.translate(-cam.x, -cam.y);

        const startTileX = Math.floor(cam.x / ts) - 1;
        const endTileX = Math.ceil((cam.x + canvasWidth) / ts) + 1;
        const startTileY = Math.floor(cam.y / ts) - 1;
        const endTileY = Math.ceil((cam.y + canvasHeight) / ts) + 1;

        for (let tx = startTileX; tx <= endTileX; tx++) {
          for (let ty = startTileY; ty <= endTileY; ty++) {
            const worldX = tx * ts;
            const worldY = ty * ts;
            const dist = Math.hypot(tx, ty);
            const isExplored = exploredTilesRef.current.has(`${tx},${ty}`);

            // Darker Background Past 60 Steps (Deep dark shaded moss/forest soil)
            if (dist >= 60) {
              ctx.fillStyle = '#0a1017';
              ctx.fillRect(worldX, worldY, ts, ts);
              ctx.fillStyle = 'rgba(10, 18, 25, 0.92)';
              ctx.fillRect(worldX, worldY, ts, ts);
              ctx.strokeStyle = 'rgba(20, 30, 45, 0.5)';
              ctx.lineWidth = 1;
              ctx.strokeRect(worldX, worldY, ts, ts);
              continue;
            }

            // Fog of War: If tile is not yet scanned by rover radar, cover with dark atmospheric shroud
            if (!isExplored) {
              ctx.fillStyle = 'rgba(10, 15, 29, 0.96)';
              ctx.fillRect(worldX, worldY, ts, ts);

              // Subtle atmospheric radar grid styling on shrouded tiles
              ctx.strokeStyle = 'rgba(30, 41, 59, 0.35)';
              ctx.lineWidth = 0.5;
              ctx.strokeRect(worldX, worldY, ts, ts);

              // Faint radar grid center mark
              ctx.fillStyle = 'rgba(51, 65, 85, 0.3)';
              ctx.fillRect(worldX + ts / 2 - 1, worldY + ts / 2 - 1, 2, 2);
              continue;
            }

            let groundColor = biome.bgColor;

            if (dist > 40) {
              groundColor = biome.id === 'OVERGROWTH' ? '#1e0538' : biome.id === 'HIGHLANDS' ? '#082f49' : '#14532d';
            } else if (dist > 20) {
              groundColor = biome.id === 'OVERGROWTH' ? '#2e1065' : biome.id === 'HIGHLANDS' ? '#0f3d4c' : '#15803d';
            }

            ctx.fillStyle = groundColor;
            ctx.fillRect(worldX, worldY, ts, ts);

            // Procedural Terrain Features based on Biome
            const tileHash = Math.sin(tx * 37.1 + ty * 59.3) * 43758.5453;
            const frac = tileHash - Math.floor(tileHash);

            if (biome.id === 'FOOTHILLS') {
              // Warm buttercups and mossy river stones
              if (frac > 0.72) {
                ctx.fillStyle = '#facc15';
                ctx.beginPath();
                ctx.arc(worldX + 18 + frac * 28, worldY + 18 + (frac * 30) % 28, 2.5, 0, Math.PI * 2);
                ctx.fill();
              } else if (frac < 0.18) {
                ctx.fillStyle = 'rgba(74, 222, 128, 0.15)';
                ctx.beginPath();
                ctx.ellipse(worldX + 32, worldY + 32, 14, 8, 0.3, 0, Math.PI * 2);
                ctx.fill();
              }
            } else if (biome.id === 'HIGHLANDS') {
              // Mountain slate stones and lavender highland heather
              if (frac > 0.75) {
                ctx.fillStyle = '#c084fc';
                ctx.beginPath();
                ctx.arc(worldX + 20 + frac * 24, worldY + 20 + (frac * 32) % 24, 2.8, 0, Math.PI * 2);
                ctx.fill();
              } else if (frac < 0.22) {
                ctx.fillStyle = '#1e293b';
                ctx.beginPath();
                ctx.roundRect(worldX + 14, worldY + 20, 20, 12, 3);
                ctx.fill();
                ctx.strokeStyle = '#475569';
                ctx.lineWidth = 1;
                ctx.stroke();
              }
            } else {
              // Ancient Overgrowth: Bioluminescent blue fungal spores & ancient root veins
              if (frac > 0.68) {
                ctx.fillStyle = '#38bdf8';
                ctx.beginPath();
                ctx.arc(worldX + 16 + frac * 32, worldY + 16 + (frac * 40) % 32, 2.5, 0, Math.PI * 2);
                ctx.fill();
              } else if (frac < 0.25) {
                ctx.strokeStyle = 'rgba(192, 132, 252, 0.25)';
                ctx.lineWidth = 2.5;
                ctx.beginPath();
                ctx.moveTo(worldX + 4, worldY + 12);
                ctx.quadraticCurveTo(worldX + 32, worldY + 44, worldX + 58, worldY + 28);
                ctx.stroke();
              }
            }

            // Aesthetic rounded tile insets matching sanctuary nurture plots
            const inset = 2;
            const tileW = ts - inset * 2;
            const tileH = ts - inset * 2;
            const tileX = worldX + inset;
            const tileY = worldY + inset;

            ctx.fillStyle = biome.id === 'OVERGROWTH'
              ? 'rgba(192, 132, 252, 0.05)'
              : biome.id === 'HIGHLANDS'
              ? 'rgba(56, 189, 248, 0.05)'
              : 'rgba(52, 211, 153, 0.05)';
            ctx.beginPath();
            ctx.roundRect(tileX, tileY, tileW, tileH, 6);
            ctx.fill();

            ctx.strokeStyle = biome.id === 'OVERGROWTH'
              ? 'rgba(192, 132, 252, 0.15)'
              : biome.id === 'HIGHLANDS'
              ? 'rgba(56, 189, 248, 0.15)'
              : 'rgba(52, 211, 153, 0.15)';
            ctx.lineWidth = 1;
            ctx.setLineDash([3, 3]);
            ctx.stroke();
            ctx.setLineDash([]);

            // Delicate corner alignment dots (matching sanctuary nursery plots)
            ctx.fillStyle = biome.id === 'OVERGROWTH'
              ? 'rgba(192, 132, 252, 0.3)'
              : biome.id === 'HIGHLANDS'
              ? 'rgba(56, 189, 248, 0.3)'
              : 'rgba(52, 211, 153, 0.3)';
            ctx.fillRect(tileX + 2, tileY + 2, 2, 2);
            ctx.fillRect(tileX + tileW - 4, tileY + 2, 2, 2);
            ctx.fillRect(tileX + 2, tileY + tileH - 4, 2, 2);
            ctx.fillRect(tileX + tileW - 4, tileY + tileH - 4, 2, 2);
          }
        }

        // Graphical Wilderness Barrier along and past the 60-step boundary ring
        for (let tx = startTileX; tx <= endTileX; tx++) {
          for (let ty = startTileY; ty <= endTileY; ty++) {
            const dist = Math.hypot(tx, ty);
            if (dist >= 60 && dist <= 66) {
              const worldX = tx * ts;
              const worldY = ty * ts;
              const isEven2x2 = Math.abs(tx) % 2 === 0 && Math.abs(ty) % 2 === 0;
              const seed = Math.sin(tx * 31.7 + ty * 67.3) * 43758.5453;
              const hash = seed - Math.floor(seed);
              if (isEven2x2 && hash > 0.4 && dist <= 64) {
                drawWildBarrierTree(ctx, worldX, worldY, ts, tx, ty, true);
              } else if (!isEven2x2 || hash <= 0.4) {
                drawWildBarrierTree(ctx, worldX, worldY, ts, tx, ty, false);
              }
            }
          }
        }

        // Distinct Circular Range Boundary Rings (Centered at ts / 2, ts / 2)
        // 1. Close Range Boundary (20 Steps)
        ctx.lineWidth = 2.5;
        ctx.setLineDash([6, 6]);
        ctx.strokeStyle = 'rgba(52, 211, 153, 0.65)';
        ctx.beginPath();
        ctx.arc(ts / 2, ts / 2, 20 * ts, 0, Math.PI * 2);
        ctx.stroke();

        // 2. Middle Range Boundary (40 Steps)
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.65)';
        ctx.beginPath();
        ctx.arc(ts / 2, ts / 2, 40 * ts, 0, Math.PI * 2);
        ctx.stroke();

        // 3. Impassable Perimeter Boundary (60 Steps)
        ctx.lineWidth = 4;
        ctx.setLineDash([12, 6]);
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.85)';
        ctx.beginPath();
        ctx.arc(ts / 2, ts / 2, 60 * ts, 0, Math.PI * 2);
        ctx.stroke();

        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.strokeStyle = 'rgba(251, 191, 36, 0.75)';
        ctx.beginPath();
        ctx.arc(ts / 2, ts / 2, 59.7 * ts, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        // Luminous labels along top of rings
        ctx.font = 'bold 11px system-ui';
        ctx.textAlign = 'center';

        ctx.fillStyle = 'rgba(52, 211, 153, 0.75)';
        ctx.fillText('— CLOSE RANGE (20 STEPS) —', ts / 2, ts / 2 - 20 * ts - 6);

        ctx.fillStyle = 'rgba(245, 158, 11, 0.75)';
        ctx.fillText('— MIDDLE RANGE (40 STEPS) —', ts / 2, ts / 2 - 40 * ts - 6);

        ctx.fillStyle = '#f87171';
        ctx.fillText('⛔ IMPASSABLE WILDERNESS BOUNDARY (60 STEPS) ⛔', ts / 2, ts / 2 - 60 * ts - 8);
        ctx.fillText('⛔ IMPASSABLE WILDERNESS BOUNDARY (60 STEPS) ⛔', ts / 2, ts / 2 + 60 * ts + 16);

        // --- WILDERNESS EXPEDITION BASECAMP HUB (0, 0) ---
        ctx.save();
        ctx.translate(ts / 2, ts / 2);
        // 1. Soft Grass Ground Cleared Zone & Brass Waypoint Ring
        const baseGlow = ctx.createRadialGradient(0, 0, 10, 0, 0, 80);
        baseGlow.addColorStop(0, 'rgba(16, 185, 129, 0.45)');
        baseGlow.addColorStop(0.7, 'rgba(16, 185, 129, 0.15)');
        baseGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = baseGlow;
        ctx.beginPath();
        ctx.arc(0, 0, 80, 0, Math.PI * 2);
        ctx.fill();

        // Brass Compass Pedestal / Rose Waypoint Outer Dial
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, 70, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = '#34d399';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.arc(0, 0, 64, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        // Compass 4 Cardinal Brass Points
        ctx.fillStyle = '#f59e0b';
        const compassDirs = [
          [0, -70],
          [70, 0],
          [0, 70],
          [-70, 0],
        ];
        compassDirs.forEach(([cx, cy]) => {
          ctx.beginPath();
          ctx.arc(cx, cy, 3.5, 0, Math.PI * 2);
          ctx.fill();
        });

        // 2. Cozy Canvas Prospector's Tent with Honey-Oak Frame Pegs (Left)
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.beginPath();
        ctx.ellipse(-32, 12, 26, 11, 0, 0, Math.PI * 2);
        ctx.fill();

        // Canvas A-frame tent body
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.moveTo(-54, 18);
        ctx.lineTo(-32, -28);
        ctx.lineTo(-10, 18);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#b45309';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Honey-oak wooden frame ridge beam and support pegs
        ctx.fillStyle = '#78350f';
        ctx.fillRect(-34, -30, 4, 8);
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(-32, -28, 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Wooden guyline pegs in ground
        ctx.fillStyle = '#451a03';
        ctx.fillRect(-58, 16, 4, 6);
        ctx.fillRect(-8, 16, 4, 6);
        ctx.strokeStyle = '#b45309';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-54, 12);
        ctx.lineTo(-56, 18);
        ctx.moveTo(-10, 12);
        ctx.lineTo(-6, 18);
        ctx.stroke();

        // Tent inner shadow / cozy entrance flap
        ctx.fillStyle = '#451a03';
        ctx.beginPath();
        ctx.moveTo(-40, 18);
        ctx.lineTo(-32, -6);
        ctx.lineTo(-24, 18);
        ctx.closePath();
        ctx.fill();

        // Warm cozy lantern hanging inside tent entry
        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.arc(-32, 2, 3.5, 0, Math.PI * 2);
        ctx.fill();

        // 3. Warm Glowing Stone Campfire Ring with Dancing Flames & Smoke (Center)
        const fireTime = Date.now() * 0.006;
        // Stone ring
        ctx.fillStyle = '#475569';
        for (let st = 0; st < 8; st++) {
          const stAngle = (st * Math.PI * 2) / 8;
          const stX = 14 + Math.cos(stAngle) * 12;
          const stY = 12 + Math.sin(stAngle) * 9;
          ctx.beginPath();
          ctx.arc(stX, stY, 3.8, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#334155';
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }

        // Burning firewood logs with mortise cut texture
        ctx.fillStyle = '#451a03';
        ctx.fillRect(8, 10, 12, 3.5);
        ctx.fillRect(10, 8, 9, 4.5);

        // Glowing campfire aura
        const fireGlow = ctx.createRadialGradient(14, 10, 2, 14, 10, 26);
        fireGlow.addColorStop(0, '#fef08a');
        fireGlow.addColorStop(0.35, '#f97316');
        fireGlow.addColorStop(0.7, '#ea580c');
        fireGlow.addColorStop(1, 'rgba(239, 68, 68, 0)');
        ctx.fillStyle = fireGlow;
        ctx.beginPath();
        ctx.arc(14, 10, 26, 0, Math.PI * 2);
        ctx.fill();

        // Fire flames flicker
        const flameH = 10 + Math.sin(fireTime * 3.2) * 3.5;
        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.moveTo(9, 12);
        ctx.quadraticCurveTo(14, 12 - flameH, 14, 12 - flameH);
        ctx.quadraticCurveTo(19, 12, 14, 13);
        ctx.fill();

        // Inner white-hot spark
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(14, 10, 2, 0, Math.PI * 2);
        ctx.fill();

        // Smoke wisps rising
        for (let sm = 0; sm < 3; sm++) {
          const smX = 14 + Math.sin(fireTime + sm * 2) * 5;
          const smY = -4 - sm * 10;
          ctx.fillStyle = `rgba(226, 232, 240, ${0.45 - sm * 0.12})`;
          ctx.beginPath();
          ctx.arc(smX, smY, 3.5 + sm * 1.5, 0, Math.PI * 2);
          ctx.fill();
        }

        // 4. Honey-Oak Wooden Supply Crates with Brass Bands (Right)
        ctx.fillStyle = '#92400e';
        ctx.beginPath();
        ctx.roundRect(32, -8, 20, 18, 3);
        ctx.fill();
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Brass bands on crate
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(35, -8, 3, 18);
        ctx.fillRect(45, -8, 3, 18);

        // Second overlapping crate
        ctx.fillStyle = '#78350f';
        ctx.beginPath();
        ctx.roundRect(26, 4, 18, 16, 3);
        ctx.fill();
        ctx.strokeStyle = '#451a03';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(29, 4, 2.5, 16);
        ctx.fillRect(38, 4, 2.5, 16);

        // 5. Wooden Trail Signpost with Brass Pointer
        ctx.fillStyle = '#451a03';
        ctx.fillRect(-6, -36, 5, 30);
        // Directional fingerboard
        ctx.fillStyle = '#92400e';
        ctx.beginPath();
        ctx.moveTo(-18, -34);
        ctx.lineTo(8, -34);
        ctx.lineTo(14, -29);
        ctx.lineTo(8, -24);
        ctx.lineTo(-18, -24);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Return to Sanctuary Trigger Label
        ctx.fillStyle = '#fef08a';
        ctx.font = 'bold 12px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText('🏕️ BASECAMP HUB (0,0)', 0, 48);

        const atBase = rover.tileX === 0 && rover.tileY === 0;
        ctx.fillStyle = atBase ? '#34d399' : '#94a3b8';
        ctx.font = 'bold 10px system-ui';
        ctx.fillText(atBase ? '★ [E] Return to Sanctuary (100%) ★' : `${biome.name} Basecamp Return Point`, 0, 62);
        ctx.restore();

        // Harvest Nodes on the Grid (Grounded, Homogenized Cozy Warm Timber & Brass Style)
        excursionNodesRef.current.forEach((node) => {
          if (node.collected) return;

          // Fog of War: Obscure unexplored seedlings and resources until scanned into vision radius
          if (!exploredTilesRef.current.has(`${node.tileX},${node.tileY}`)) return;

          const wx = node.tileX * ts + ts / 2;
          const wy = node.tileY * ts + ts / 2;

          if (
            wx < cam.x - 60 ||
            wx > cam.x + canvasWidth + 60 ||
            wy < cam.y - 60 ||
            wy > cam.y + canvasHeight + 60
          )
            return;

          ctx.save();
          const time = Date.now() * 0.003;
          // Fixed Grounded Position (Strictly NO vertical bobbing/floating translation)
          ctx.translate(wx, wy);

          // 1. Soft Grounded Drop Shadow Beneath Node
          ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
          ctx.beginPath();
          ctx.ellipse(0, 14, 20, 7, 0, 0, Math.PI * 2);
          ctx.fill();

          // Subtle Grounded Sunlight / Ambient Soil Aura
          const auraPulse = 0.25 + Math.sin(time * 2 + node.tileX * 3 + node.tileY * 5) * 0.15;

          if (node.type === 'RESOURCE') {
            const rt = node.resourceType;

            if (rt === 'scrap_metal') {
              // 1. SCRAP METAL: Neat stack of brass-riveted bronze & honey-teak plates resting on the grass
              // Small stone backing under the plates
              ctx.fillStyle = '#334155';
              ctx.beginPath();
              ctx.ellipse(0, 11, 16, 5, 0, 0, Math.PI * 2);
              ctx.fill();

              // Bottom heavy bronze structural plate
              const plateGrad1 = ctx.createLinearGradient(-15, -10, 15, 10);
              plateGrad1.addColorStop(0, '#78350f');
              plateGrad1.addColorStop(0.5, '#5c2b09');
              plateGrad1.addColorStop(1, '#451a03');
              ctx.fillStyle = plateGrad1;
              ctx.beginPath();
              ctx.roundRect(-15, -6, 30, 16, 3);
              ctx.fill();
              ctx.strokeStyle = '#b45309';
              ctx.lineWidth = 1.5;
              ctx.stroke();

              // Top stacked polished brass plate with warm honey-oak inlay
              const plateGrad2 = ctx.createLinearGradient(-12, -14, 12, 4);
              plateGrad2.addColorStop(0, '#f59e0b');
              plateGrad2.addColorStop(0.6, '#d97706');
              plateGrad2.addColorStop(1, '#92400e');
              ctx.fillStyle = plateGrad2;
              ctx.beginPath();
              ctx.roundRect(-12, -14, 24, 16, 2);
              ctx.fill();
              ctx.strokeStyle = '#fef08a';
              ctx.lineWidth = 1.2;
              ctx.stroke();

              // Polished brass corner brackets & mortise pegs
              ctx.fillStyle = '#fbbf24';
              ctx.fillRect(-12, -14, 6, 3);
              ctx.fillRect(-12, -14, 3, 6);
              ctx.fillRect(6, -14, 6, 3);
              ctx.fillRect(9, -14, 3, 6);

              // Golden round rivets with specular sheen
              const rivets = [
                [-8, -10],
                [8, -10],
                [-8, -2],
                [8, -2],
                [-11, 4],
                [11, 4],
              ];
              rivets.forEach(([rx, ry]) => {
                ctx.fillStyle = '#fef08a';
                ctx.beginPath();
                ctx.arc(rx, ry, 1.8, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#78350f';
                ctx.beginPath();
                ctx.arc(rx + 0.3, ry + 0.3, 0.7, 0, Math.PI * 2);
                ctx.fill();
              });

              // Grounded metallic sparkle glint (opacity shimmer only, no Y-movement)
              const glintAlpha = Math.max(0, Math.sin(time * 2.5 + node.tileX));
              ctx.fillStyle = `rgba(254, 240, 138, ${glintAlpha})`;
              ctx.beginPath();
              ctx.arc(6, -12, 2.5, 0, Math.PI * 2);
              ctx.fill();

            } else if (rt === 'copper_wire') {
              // 2. COPPER WIRE: Spun amber copper coil wound on a turned wooden spool with brass core
              // Turned wooden spool bottom flange (Honey-Oak with brass trim)
              ctx.fillStyle = '#5c2b09';
              ctx.beginPath();
              ctx.ellipse(0, 8, 16, 5, 0, 0, Math.PI * 2);
              ctx.fill();
              ctx.strokeStyle = '#f59e0b';
              ctx.lineWidth = 1.2;
              ctx.stroke();

              // Turned wooden spool top flange (Honey-Oak with brass trim)
              ctx.fillStyle = '#78350f';
              ctx.beginPath();
              ctx.ellipse(0, -12, 16, 5, 0, 0, Math.PI * 2);
              ctx.fill();
              ctx.strokeStyle = '#f59e0b';
              ctx.lineWidth = 1.2;
              ctx.stroke();

              // Spool core body with dense spun copper windings
              const wireGrad = ctx.createLinearGradient(-12, 0, 12, 0);
              wireGrad.addColorStop(0, '#9a3412');
              wireGrad.addColorStop(0.3, '#ea580c');
              wireGrad.addColorStop(0.6, '#f97316');
              wireGrad.addColorStop(0.8, '#fdba74');
              wireGrad.addColorStop(1, '#7c2d12');

              ctx.fillStyle = wireGrad;
              ctx.fillRect(-12, -12, 24, 20);

              // Individual spun copper coil grooves
              ctx.strokeStyle = 'rgba(124, 45, 18, 0.75)';
              ctx.lineWidth = 1.4;
              for (let c = -9; c <= 6; c += 3) {
                ctx.beginPath();
                ctx.moveTo(-12, c);
                ctx.lineTo(12, c);
                ctx.stroke();
              }

              // Polished Brass Center Spindle Core
              ctx.fillStyle = '#fef08a';
              ctx.beginPath();
              ctx.arc(0, -12, 3.5, 0, Math.PI * 2);
              ctx.fill();
              ctx.strokeStyle = '#78350f';
              ctx.lineWidth = 0.8;
              ctx.stroke();

              // Loose spun copper wire lead curled neatly outward
              ctx.strokeStyle = '#fb923c';
              ctx.lineWidth = 2;
              ctx.beginPath();
              ctx.moveTo(12, 2);
              ctx.quadraticCurveTo(18, -2, 15, -8);
              ctx.stroke();

              // Grounded amber copper spark glint
              const copperGlint = Math.max(0, Math.sin(time * 3 + node.tileY));
              ctx.fillStyle = `rgba(253, 186, 116, ${copperGlint})`;
              ctx.beginPath();
              ctx.arc(15, -8, 2, 0, Math.PI * 2);
              ctx.fill();

            } else if (rt === 'brass_gears') {
              // 3. BRASS GEARS: Intricate golden-brass clockwork cogs resting flat on a small slate stone
              // Slate stone base resting on earth
              ctx.fillStyle = '#1e293b';
              ctx.beginPath();
              ctx.ellipse(2, 6, 18, 7, -0.1, 0, Math.PI * 2);
              ctx.fill();
              ctx.strokeStyle = '#475569';
              ctx.lineWidth = 1;
              ctx.stroke();

              // Small moss accent on slate edge
              ctx.fillStyle = 'rgba(16, 185, 129, 0.7)';
              ctx.beginPath();
              ctx.ellipse(-12, 6, 4, 2, 0, 0, Math.PI * 2);
              ctx.fill();

              const drawGroundedCog = (gx: number, gy: number, rad: number, teeth: number, rot: number) => {
                ctx.save();
                ctx.translate(gx, gy);
                ctx.rotate(rot);

                const cogGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, rad + 4);
                cogGrad.addColorStop(0, '#fef08a');
                cogGrad.addColorStop(0.5, '#f59e0b');
                cogGrad.addColorStop(1, '#b45309');
                ctx.fillStyle = cogGrad;
                ctx.strokeStyle = '#fef08a';
                ctx.lineWidth = 1.2;

                ctx.beginPath();
                for (let i = 0; i < teeth; i++) {
                  const a1 = (i * Math.PI * 2) / teeth;
                  const a2 = a1 + Math.PI / teeth / 2;
                  const a3 = a1 + Math.PI / teeth;
                  const outer = rad + 3;
                  const inner = rad;

                  if (i === 0) {
                    ctx.moveTo(Math.cos(a1) * inner, Math.sin(a1) * inner);
                  }
                  ctx.lineTo(Math.cos(a1) * outer, Math.sin(a1) * outer);
                  ctx.lineTo(Math.cos(a2) * outer, Math.sin(a2) * outer);
                  ctx.lineTo(Math.cos(a2) * inner, Math.sin(a2) * inner);
                  ctx.lineTo(Math.cos(a3) * inner, Math.sin(a3) * inner);
                }
                ctx.closePath();
                ctx.fill();
                ctx.stroke();

                // Spoke cutouts
                ctx.fillStyle = '#1e293b';
                const spokes = 4;
                for (let sp = 0; sp < spokes; sp++) {
                  const spAngle = (sp * Math.PI * 2) / spokes;
                  const spDist = rad * 0.48;
                  ctx.beginPath();
                  ctx.arc(Math.cos(spAngle) * spDist, Math.sin(spAngle) * spDist, rad * 0.18, 0, Math.PI * 2);
                  ctx.fill();
                }

                // Center hub axle pin
                ctx.fillStyle = '#fef08a';
                ctx.beginPath();
                ctx.arc(0, 0, rad * 0.25, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = '#78350f';
                ctx.lineWidth = 0.8;
                ctx.stroke();

                ctx.restore();
              };

              drawGroundedCog(-3, 0, 11, 8, 0.4);
              drawGroundedCog(9, -6, 7.5, 6, -0.2);

              // Metallic corner gleam shimmer
              const gearGlint = Math.max(0, Math.sin(time * 2.8 + node.tileX * 2));
              ctx.fillStyle = `rgba(254, 240, 138, ${gearGlint})`;
              ctx.beginPath();
              ctx.arc(-3, -8, 2.2, 0, Math.PI * 2);
              ctx.fill();

            } else if (rt === 'circuit_boards') {
              // 4. CIRCUIT BOARD: Forest green substrate tile with polished gold bus lines and brass pins
              // Wooden frame bevel border
              ctx.fillStyle = '#78350f';
              ctx.beginPath();
              ctx.roundRect(-17, -13, 34, 24, 3);
              ctx.fill();

              // Forest-green PCB substrate
              const pcbGrad = ctx.createLinearGradient(-15, -11, 15, 11);
              pcbGrad.addColorStop(0, '#065f46');
              pcbGrad.addColorStop(0.5, '#047857');
              pcbGrad.addColorStop(1, '#064e3b');
              ctx.fillStyle = pcbGrad;
              ctx.beginPath();
              ctx.roundRect(-15, -11, 30, 20, 2);
              ctx.fill();
              ctx.strokeStyle = '#10b981';
              ctx.lineWidth = 1.2;
              ctx.stroke();

              // Warm Gold Edge Connector Pins
              ctx.fillStyle = '#fbbf24';
              for (let p = -12; p <= 12; p += 4) {
                ctx.fillRect(p, 7, 2.5, 3);
              }

              // Warm Gold Solder Paths & Bus Lines
              ctx.strokeStyle = '#facc15';
              ctx.lineWidth = 1.2;
              ctx.beginPath();
              ctx.moveTo(-10, -7);
              ctx.lineTo(-4, -7);
              ctx.lineTo(-4, -1);
              ctx.lineTo(7, -1);
              ctx.moveTo(-10, 3);
              ctx.lineTo(0, 3);
              ctx.lineTo(0, 6);
              ctx.stroke();

              // Polished Brass Pins & Micro-Capacitor
              ctx.fillStyle = '#f59e0b';
              ctx.fillRect(-11, -3, 3.5, 3);
              ctx.fillRect(5, 2, 3.5, 3);

              // Center Silicon Microchip with Gold Border
              ctx.fillStyle = '#0f172a';
              ctx.beginPath();
              ctx.roundRect(-5, -6, 9, 9, 1.5);
              ctx.fill();
              ctx.strokeStyle = '#fbbf24';
              ctx.lineWidth = 0.8;
              ctx.stroke();

              // Subtle pulsing emerald status diode
              const diodePulse = 0.5 + Math.sin(time * 4) * 0.5;
              ctx.fillStyle = `rgba(52, 211, 153, ${diodePulse})`;
              ctx.beginPath();
              ctx.arc(9, -7, 1.8, 0, Math.PI * 2);
              ctx.fill();

            } else if (rt === 'electronic_chips') {
              // 5. ELECTRONIC CHIP: Matte charcoal silicon processor with gold corner solder pads and cyan micro-traces
              // Bronze heatsink base plate
              ctx.fillStyle = '#78350f';
              ctx.beginPath();
              ctx.roundRect(-15, -13, 30, 24, 3);
              ctx.fill();
              ctx.strokeStyle = '#b45309';
              ctx.lineWidth = 1;
              ctx.stroke();

              // Glowing Golden Contact Lead Pins on left & right
              ctx.fillStyle = '#fbbf24';
              for (let pin = -9; pin <= 9; pin += 4.5) {
                ctx.fillRect(-18, pin - 1, 4, 2);
                ctx.fillRect(14, pin - 1, 4, 2);
              }

              // Main Matte-Charcoal Silicon Square Package
              const chipGrad = ctx.createLinearGradient(-12, -10, 12, 10);
              chipGrad.addColorStop(0, '#1e293b');
              chipGrad.addColorStop(1, '#0f172a');
              ctx.fillStyle = chipGrad;
              ctx.beginPath();
              ctx.roundRect(-12, -10, 24, 20, 2.5);
              ctx.fill();
              ctx.strokeStyle = '#d97706';
              ctx.lineWidth = 1.2;
              ctx.stroke();

              // 4 Gold Corner Solder Pads
              ctx.fillStyle = '#fef08a';
              ctx.fillRect(-10, -8, 2.5, 2.5);
              ctx.fillRect(7.5, -8, 2.5, 2.5);
              ctx.fillRect(-10, 5.5, 2.5, 2.5);
              ctx.fillRect(7.5, 5.5, 2.5, 2.5);

              // Cyan Nano-Core Pulse & Micro-traces
              const glowPulse = 0.5 + Math.sin(time * 3.5) * 0.4;
              ctx.strokeStyle = `rgba(56, 189, 248, ${glowPulse})`;
              ctx.lineWidth = 1;

              ctx.beginPath();
              ctx.moveTo(-6, 0);
              ctx.lineTo(6, 0);
              ctx.moveTo(0, -5);
              ctx.lineTo(0, 5);
              ctx.stroke();

              // Central computing core with gold ring
              ctx.fillStyle = '#38bdf8';
              ctx.beginPath();
              ctx.arc(0, 0, 3, 0, Math.PI * 2);
              ctx.fill();
              ctx.strokeStyle = '#fbbf24';
              ctx.lineWidth = 0.8;
              ctx.stroke();

            } else if (rt === 'scrap_metal_double') {
              // 6. HEAVY SCRAP METAL CACHE (2x): Two identical angled rusty metal plates/brackets stacked side-by-side with slight offset and shadow
              ctx.fillStyle = '#334155';
              ctx.beginPath();
              ctx.ellipse(0, 11, 22, 6, 0, 0, Math.PI * 2);
              ctx.fill();

              const drawScrapPlate = (px: number, py: number) => {
                ctx.save();
                ctx.translate(px, py);

                // Bottom heavy bronze structural plate
                const plateGrad1 = ctx.createLinearGradient(-11, -8, 11, 8);
                plateGrad1.addColorStop(0, '#78350f');
                plateGrad1.addColorStop(0.5, '#5c2b09');
                plateGrad1.addColorStop(1, '#451a03');
                ctx.fillStyle = plateGrad1;
                ctx.beginPath();
                ctx.roundRect(-11, -5, 22, 14, 2.5);
                ctx.fill();
                ctx.strokeStyle = '#b45309';
                ctx.lineWidth = 1.3;
                ctx.stroke();

                // Top stacked polished brass plate with warm honey-oak inlay
                const plateGrad2 = ctx.createLinearGradient(-9, -11, 9, 3);
                plateGrad2.addColorStop(0, '#f59e0b');
                plateGrad2.addColorStop(0.6, '#d97706');
                plateGrad2.addColorStop(1, '#92400e');
                ctx.fillStyle = plateGrad2;
                ctx.beginPath();
                ctx.roundRect(-9, -11, 18, 13, 2);
                ctx.fill();
                ctx.strokeStyle = '#fef08a';
                ctx.lineWidth = 1.1;
                ctx.stroke();

                // Polished brass corner brackets & mortise pegs
                ctx.fillStyle = '#fbbf24';
                ctx.fillRect(-9, -11, 4.5, 2.5);
                ctx.fillRect(-9, -11, 2.5, 4.5);
                ctx.fillRect(4.5, -11, 4.5, 2.5);
                ctx.fillRect(6.5, -11, 2.5, 4.5);

                // Golden round rivets with specular sheen
                const rivets = [
                  [-6, -8],
                  [6, -8],
                  [-6, -2],
                  [6, -2],
                  [-8, 4],
                  [8, 4],
                ];
                rivets.forEach(([rx, ry]) => {
                  ctx.fillStyle = '#fef08a';
                  ctx.beginPath();
                  ctx.arc(rx, ry, 1.3, 0, Math.PI * 2);
                  ctx.fill();
                });
                ctx.restore();
              };

              // Left Plate
              drawScrapPlate(-9, 2);

              // Shadow between plates
              ctx.fillStyle = 'rgba(0,0,0,0.38)';
              ctx.beginPath();
              ctx.ellipse(3, 0, 4, 11, 0.15, 0, Math.PI * 2);
              ctx.fill();

              // Right Plate (Slightly offset, identical styling)
              drawScrapPlate(9, -3);

              // Prominent golden 2x cache badge
              ctx.fillStyle = '#f59e0b';
              ctx.beginPath();
              ctx.roundRect(5, -18, 17, 10, 3);
              ctx.fill();
              ctx.strokeStyle = '#fef08a';
              ctx.lineWidth = 0.8;
              ctx.stroke();
              ctx.fillStyle = '#1c1917';
              ctx.font = 'bold 8px system-ui';
              ctx.textAlign = 'center';
              ctx.fillText('2x', 13.5, -10.5);

              // Shimmer glint
              const sGlint = Math.max(0, Math.sin(time * 3 + node.tileX * 2));
              ctx.fillStyle = `rgba(254, 240, 138, ${sGlint})`;
              ctx.beginPath();
              ctx.arc(3, -13, 2.4, 0, Math.PI * 2);
              ctx.fill();

            } else if (rt === 'copper_wire_double') {
              // 7. HEAVY COPPER WIRE BUNDLE (2x): Two identical copper wire coils/spools side-by-side
              ctx.fillStyle = 'rgba(0,0,0,0.45)';
              ctx.beginPath();
              ctx.ellipse(0, 11, 22, 6, 0, 0, Math.PI * 2);
              ctx.fill();

              const drawSpool = (sx: number, sy: number) => {
                ctx.save();
                ctx.translate(sx, sy);

                // Bottom flange
                ctx.fillStyle = '#5c2b09';
                ctx.beginPath();
                ctx.ellipse(0, 7, 11, 3.8, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = '#f59e0b';
                ctx.lineWidth = 1;
                ctx.stroke();

                // Top flange
                ctx.fillStyle = '#78350f';
                ctx.beginPath();
                ctx.ellipse(0, -9, 11, 3.8, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = '#f59e0b';
                ctx.lineWidth = 1;
                ctx.stroke();

                // Wire windings
                const wireGrad = ctx.createLinearGradient(-8, 0, 8, 0);
                wireGrad.addColorStop(0, '#9a3412');
                wireGrad.addColorStop(0.3, '#ea580c');
                wireGrad.addColorStop(0.6, '#f97316');
                wireGrad.addColorStop(0.8, '#fdba74');
                wireGrad.addColorStop(1, '#7c2d12');

                ctx.fillStyle = wireGrad;
                ctx.fillRect(-8.5, -9, 17, 16);

                // Spun grooves
                ctx.strokeStyle = 'rgba(124, 45, 18, 0.75)';
                ctx.lineWidth = 1.2;
                for (let c = -7; c <= 5; c += 2.5) {
                  ctx.beginPath();
                  ctx.moveTo(-8.5, c);
                  ctx.lineTo(8.5, c);
                  ctx.stroke();
                }

                // Center Spindle
                ctx.fillStyle = '#fef08a';
                ctx.beginPath();
                ctx.arc(0, -9, 2.5, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = '#78350f';
                ctx.lineWidth = 0.6;
                ctx.stroke();

                ctx.restore();
              };

              // Left Spool
              drawSpool(-9, 2);

              // Right Spool
              drawSpool(9, 0);

              // Connecting wire coil lead between spools
              ctx.strokeStyle = '#fb923c';
              ctx.lineWidth = 1.8;
              ctx.beginPath();
              ctx.moveTo(-1, 3);
              ctx.quadraticCurveTo(0, -3, 2, -1);
              ctx.stroke();

              // Prominent orange 2x bundle badge
              ctx.fillStyle = '#ea580c';
              ctx.beginPath();
              ctx.roundRect(5, -18, 17, 10, 3);
              ctx.fill();
              ctx.strokeStyle = '#fef08a';
              ctx.lineWidth = 0.8;
              ctx.stroke();
              ctx.fillStyle = '#ffffff';
              ctx.font = 'bold 8px system-ui';
              ctx.textAlign = 'center';
              ctx.fillText('2x', 13.5, -10.5);

              // Copper wire shimmer glint
              const wGlint = Math.max(0, Math.sin(time * 3.5 + node.tileY * 2));
              ctx.fillStyle = `rgba(253, 186, 116, ${wGlint})`;
              ctx.beginPath();
              ctx.arc(9, -9, 2.2, 0, Math.PI * 2);
              ctx.fill();
            }

            // Grounded Badge below
            const nameShortMap: Record<string, {name: string; weight: string; color: string}> = {
              scrap_metal: {name: 'Scrap Metal', weight: '0.8kg', color: '#fbbf24'},
              copper_wire: {name: 'Copper Wire', weight: '0.5kg', color: '#f97316'},
              brass_gears: {name: 'Brass Gears', weight: '1.2kg', color: '#eab308'},
              circuit_boards: {name: 'Circuit Board', weight: '1.0kg', color: '#34d399'},
              electronic_chips: {name: 'Electronic Chip', weight: '1.5kg', color: '#38bdf8'},
              scrap_metal_double: {name: 'Heavy Scrap 2x', weight: '1.6kg', color: '#f59e0b'},
              copper_wire_double: {name: 'Heavy Wire 2x', weight: '1.0kg', color: '#fb923c'},
            };

            const info = rt ? nameShortMap[rt] : undefined;
            if (info) {
              ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
              ctx.beginPath();
              ctx.roundRect(-30, 18, 60, 13, 3);
              ctx.fill();
              ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
              ctx.lineWidth = 1;
              ctx.stroke();

              ctx.fillStyle = info.color;
              ctx.font = 'bold 8px system-ui';
              ctx.textAlign = 'center';
              ctx.fillText(`${info.name} (${info.weight})`, 0, 27);
            }

          } else {
            // 6. WILD SEEDLING NODE: Cozy dark earthen soil mound with two vibrant green cotyledon leaves, tiny wooden identification stake, and soft grounding petal motes
            // Grounded soft glowing soil aura
            ctx.fillStyle = `rgba(34, 197, 94, ${auraPulse * 0.35})`;
            ctx.beginPath();
            ctx.ellipse(0, 6, 22, 11, 0, 0, Math.PI * 2);
            ctx.fill();

            // Rich warm dark earthen loam soil mound
            const moundGrad = ctx.createRadialGradient(0, 5, 2, 0, 5, 17);
            moundGrad.addColorStop(0, '#5c2b09');
            moundGrad.addColorStop(0.6, '#451a03');
            moundGrad.addColorStop(1, '#291102');
            ctx.fillStyle = moundGrad;
            ctx.beginPath();
            ctx.ellipse(0, 5, 18, 9, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#78350f';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // Loam soil texture specks
            ctx.fillStyle = '#78350f';
            ctx.fillRect(-7, 4, 3, 2);
            ctx.fillRect(6, 6, 2, 2);
            ctx.fillRect(-2, 7, 2, 2);

            // Tiny turned wooden identification stake in soil (Honey-Oak with Brass Rivet)
            ctx.fillStyle = '#78350f';
            ctx.fillRect(8, -10, 2.5, 14);
            ctx.fillStyle = '#fde68a';
            ctx.beginPath();
            ctx.roundRect(5, -14, 12, 7, 2);
            ctx.fill();
            ctx.strokeStyle = '#b45309';
            ctx.lineWidth = 0.8;
            ctx.stroke();
            ctx.fillStyle = '#451a03';
            ctx.font = 'bold 5.5px system-ui';
            ctx.textAlign = 'center';
            ctx.fillText('ROOT', 11, -9);

            // Botanical Sprout Stem
            ctx.strokeStyle = '#15803d';
            ctx.lineWidth = 2.5;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(0, 5);
            ctx.quadraticCurveTo(-3, -3, 0, -10);
            ctx.stroke();

            // Two vibrant green cotyledon leaves
            ctx.fillStyle = '#22c55e';
            // Left Cotyledon Leaf
            ctx.beginPath();
            ctx.ellipse(-5, -9, 6.5, 3.5, -0.4, 0, Math.PI * 2);
            ctx.fill();
            // Right Cotyledon Leaf
            ctx.fillStyle = '#4ade80';
            ctx.beginPath();
            ctx.ellipse(5, -11, 5.5, 3.2, 0.4, 0, Math.PI * 2);
            ctx.fill();

            // Center nascent bud pearl
            ctx.fillStyle = '#fef08a';
            ctx.beginPath();
            ctx.arc(0, -10, 1.5, 0, Math.PI * 2);
            ctx.fill();

            // Soft grounding petal motes around seedling (grounded orbit, no vertical drift)
            ctx.fillStyle = 'rgba(254, 240, 138, 0.75)';
            const spark1X = Math.sin(time * 2) * 14;
            const spark1Y = Math.cos(time * 2) * 6 + 4;
            ctx.beginPath();
            ctx.arc(spark1X, spark1Y, 1.5, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = 'rgba(250, 204, 21, 0.65)';
            const spark2X = Math.cos(time * 1.6 + 1.2) * 12;
            const spark2Y = Math.sin(time * 1.6 + 1.2) * 5 + 5;
            ctx.beginPath();
            ctx.arc(spark2X, spark2Y, 1.3, 0, Math.PI * 2);
            ctx.fill();

            // Badge below
            ctx.fillStyle = 'rgba(6, 78, 59, 0.92)';
            ctx.beginPath();
            ctx.roundRect(-32, 18, 64, 13, 3);
            ctx.fill();
            ctx.strokeStyle = '#34d399';
            ctx.lineWidth = 1;
            ctx.stroke();

            ctx.fillStyle = '#6ee7b7';
            ctx.font = 'bold 8px system-ui';
            ctx.textAlign = 'center';
            ctx.fillText('🌱 Wild Seedling (3.0kg)', 0, 27);
          }
          ctx.restore();
        });

        // =========================================================================
        // RENDER EXPEDITION ROVER VEHICLE (4 DISTINCT FACING PERSPECTIVES: UP, DOWN, LEFT, RIGHT)
        // (COZY BOTANICAL ATV WITH HONEY-OAK WOODWORK, BRASS BRACKETS, TREADED TIRES & DUAL BEAM HEADLIGHTS)
        // =========================================================================
        ctx.save();
        ctx.translate(rover.visualX, rover.visualY);

        // 1. Accurate Directional Headlight Beams (4 Cardinal Facings: Up, Down, Left, Right)
        ctx.save();
        if (rover.facing === 'up') {
          // Dual High-Beam Cones Shining Northward (-Y)
          const hlUpGrad = ctx.createLinearGradient(0, -12, 0, -120);
          hlUpGrad.addColorStop(0, 'rgba(254, 240, 138, 0.7)');
          hlUpGrad.addColorStop(0.35, 'rgba(254, 240, 138, 0.35)');
          hlUpGrad.addColorStop(0.7, 'rgba(250, 204, 21, 0.15)');
          hlUpGrad.addColorStop(1, 'rgba(254, 240, 138, 0)');
          ctx.fillStyle = hlUpGrad;
          ctx.beginPath();
          ctx.moveTo(-14, -14);
          ctx.lineTo(-55, -120);
          ctx.lineTo(55, -120);
          ctx.lineTo(14, -14);
          ctx.closePath();
          ctx.fill();
        } else if (rover.facing === 'down') {
          // Dual High-Beam Cones Shining Southward (+Y)
          const hlDownGrad = ctx.createLinearGradient(0, 12, 0, 120);
          hlDownGrad.addColorStop(0, 'rgba(254, 240, 138, 0.7)');
          hlDownGrad.addColorStop(0.35, 'rgba(254, 240, 138, 0.35)');
          hlDownGrad.addColorStop(0.7, 'rgba(250, 204, 21, 0.15)');
          hlDownGrad.addColorStop(1, 'rgba(254, 240, 138, 0)');
          ctx.fillStyle = hlDownGrad;
          ctx.beginPath();
          ctx.moveTo(-14, 14);
          ctx.lineTo(-55, 120);
          ctx.lineTo(55, 120);
          ctx.lineTo(14, 14);
          ctx.closePath();
          ctx.fill();
        } else if (rover.facing === 'right') {
          // High-Beam Cones Shining Eastward (+X) projecting horizontally forward from front bumper
          const hlRightGrad = ctx.createLinearGradient(20, 0, 130, 0);
          hlRightGrad.addColorStop(0, 'rgba(254, 240, 138, 0.75)');
          hlRightGrad.addColorStop(0.35, 'rgba(254, 240, 138, 0.35)');
          hlRightGrad.addColorStop(0.7, 'rgba(250, 204, 21, 0.15)');
          hlRightGrad.addColorStop(1, 'rgba(254, 240, 138, 0)');
          ctx.fillStyle = hlRightGrad;
          ctx.beginPath();
          ctx.moveTo(20, -8);
          ctx.lineTo(130, -48);
          ctx.lineTo(130, 48);
          ctx.lineTo(20, 8);
          ctx.closePath();
          ctx.fill();
        } else {
          // High-Beam Cones Shining Westward (-X) projecting horizontally forward from front bumper
          const hlLeftGrad = ctx.createLinearGradient(-20, 0, -130, 0);
          hlLeftGrad.addColorStop(0, 'rgba(254, 240, 138, 0.75)');
          hlLeftGrad.addColorStop(0.35, 'rgba(254, 240, 138, 0.35)');
          hlLeftGrad.addColorStop(0.7, 'rgba(250, 204, 21, 0.15)');
          hlLeftGrad.addColorStop(1, 'rgba(254, 240, 138, 0)');
          ctx.fillStyle = hlLeftGrad;
          ctx.beginPath();
          ctx.moveTo(-20, -8);
          ctx.lineTo(-130, -48);
          ctx.lineTo(-130, 48);
          ctx.lineTo(-20, 8);
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();

        // 2. Chassis Suspension Bounce
        const roverBounce = Math.sin(Date.now() * 0.008) * 1.2;
        ctx.translate(0, roverBounce);

        // Active Rover Sensor Radar Scanner Vision Ring
        const sensorRadSteps = getRoverVisionRadius();
        const sensorPix = sensorRadSteps * ts;
        ctx.save();
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.arc(0, 0, sensorPix, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        // Rotating radar sweep indicator
        const scanAng = Date.now() * 0.003;
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.3)';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(scanAng) * sensorPix, Math.sin(scanAng) * sensorPix);
        ctx.stroke();
        ctx.restore();

        // --- DIRECTIONAL PERSPECTIVE RENDERING ---
        if (rover.facing === 'up') {
          // ==================== NORTH (REAR/TOP-DOWN PERSPECTIVE) ====================
          // Ground shadow
          ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
          ctx.beginPath();
          ctx.ellipse(0, 6, 26, 15, 0, 0, Math.PI * 2);
          ctx.fill();

          // 4 Knobby All-Terrain Balloon Tires (Top/North view)
          const drawNorthTire = (wx: number, wy: number) => {
            ctx.fillStyle = '#0f172a';
            ctx.beginPath();
            ctx.roundRect(wx - 5, wy - 10, 10, 20, 3);
            ctx.fill();
            ctx.strokeStyle = '#334155';
            ctx.lineWidth = 1.2;
            ctx.stroke();
            // Treads
            ctx.fillStyle = '#1e293b';
            for (let t = -7; t <= 7; t += 4) {
              ctx.fillRect(wx - 5, wy + t, 10, 1.5);
            }
          };

          drawNorthTire(-20, -10); // Front Left
          drawNorthTire(20, -10);  // Front Right
          drawNorthTire(-20, 10);  // Rear Left
          drawNorthTire(20, 10);   // Rear Right

          // Teak Under-Chassis Base
          ctx.fillStyle = '#451a03';
          ctx.beginPath();
          ctx.roundRect(-18, -18, 36, 36, 4);
          ctx.fill();
          ctx.strokeStyle = '#78350f';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // Honey-Oak Wood Paneled Body (North Top-Down View)
          const bodyGradN = ctx.createLinearGradient(0, -18, 0, 18);
          bodyGradN.addColorStop(0, '#92400e');
          bodyGradN.addColorStop(0.5, '#78350f');
          bodyGradN.addColorStop(1, '#5c2b09');
          ctx.fillStyle = bodyGradN;
          ctx.beginPath();
          ctx.roundRect(-16, -16, 32, 32, [4, 4, 3, 3]);
          ctx.fill();
          ctx.strokeStyle = '#b45309';
          ctx.lineWidth = 1.8;
          ctx.stroke();

          // Vertical Planking Grooves
          ctx.strokeStyle = 'rgba(254, 240, 138, 0.15)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(-6, -14);
          ctx.lineTo(-6, 14);
          ctx.moveTo(6, -14);
          ctx.lineTo(6, 14);
          ctx.stroke();

          // Brass Corner Brackets & Screws
          ctx.fillStyle = '#f59e0b';
          ctx.fillRect(-16, -16, 5, 5);
          ctx.fillRect(11, -16, 5, 5);
          ctx.fillRect(-16, 11, 5, 5);
          ctx.fillRect(11, 11, 5, 5);

          // Front Windshield Upper Edge (North)
          ctx.fillStyle = 'rgba(56, 189, 248, 0.85)';
          ctx.beginPath();
          ctx.roundRect(-12, -15, 24, 8, [3, 3, 1, 1]);
          ctx.fill();
          ctx.strokeStyle = '#fbbf24';
          ctx.lineWidth = 1;
          ctx.stroke();

          // Driver Hat Silhouette facing North
          ctx.fillStyle = '#d97706';
          ctx.beginPath();
          ctx.ellipse(0, -9, 6, 4, 0, 0, Math.PI * 2);
          ctx.fill();

          // Rear Cargo Bed with Strapped Canvas & Specimen Vials (Bottom half)
          ctx.fillStyle = '#065f46';
          ctx.beginPath();
          ctx.roundRect(-12, 1, 24, 12, 2);
          ctx.fill();
          ctx.strokeStyle = '#fef08a';
          ctx.lineWidth = 0.8;
          ctx.stroke();

          // Leather cargo tie straps
          ctx.fillStyle = '#78350f';
          ctx.fillRect(-8, 1, 2.5, 12);
          ctx.fillRect(6, 1, 2.5, 12);

          // Specimen jar on rear rack
          ctx.fillStyle = 'rgba(56, 189, 248, 0.6)';
          ctx.beginPath();
          ctx.arc(0, 7, 3, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#34d399';
          ctx.beginPath();
          ctx.arc(0, 7, 1.5, 0, Math.PI * 2);
          ctx.fill();

          // Dual Forward Headlamps (Top North Edge)
          ctx.fillStyle = '#fef08a';
          ctx.beginPath();
          ctx.arc(-10, -16, 3, 0, Math.PI * 2);
          ctx.arc(10, -16, 3, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#f59e0b';
          ctx.lineWidth = 1;
          ctx.stroke();

          // Dual Red Tail-lights (Bottom South Edge)
          ctx.fillStyle = '#ef4444';
          ctx.fillRect(-14, 15, 4, 2);
          ctx.fillRect(10, 15, 4, 2);

          // Bio-Resonance Roof Antenna
          ctx.strokeStyle = '#f59e0b';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(-8, -4);
          ctx.lineTo(-14, -14);
          ctx.stroke();

          const antPulseN = 0.6 + Math.sin(Date.now() * 0.01) * 0.4;
          ctx.fillStyle = `rgba(56, 189, 248, ${antPulseN})`;
          ctx.beginPath();
          ctx.arc(-14, -14, 2.5, 0, Math.PI * 2);
          ctx.fill();

        } else if (rover.facing === 'down') {
          // ==================== SOUTH (FRONT-FACING PERSPECTIVE) ====================
          // Ground shadow
          ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
          ctx.beginPath();
          ctx.ellipse(0, 14, 26, 10, 0, 0, Math.PI * 2);
          ctx.fill();

          // 4 Knobby Balloon Tires (South Front View)
          const drawSouthTire = (wx: number, wy: number) => {
            ctx.fillStyle = '#0f172a';
            ctx.beginPath();
            ctx.roundRect(wx - 4.5, wy - 8, 9, 18, 3);
            ctx.fill();
            ctx.strokeStyle = '#334155';
            ctx.lineWidth = 1.2;
            ctx.stroke();
            // Treads
            ctx.fillStyle = '#1e293b';
            for (let t = -6; t <= 6; t += 4) {
              ctx.fillRect(wx - 4.5, wy + t, 9, 1.5);
            }
          };

          drawSouthTire(-20, -2); // Rear Left
          drawSouthTire(20, -2);  // Rear Right
          drawSouthTire(-18, 6);  // Front Left
          drawSouthTire(18, 6);   // Front Right

          // Heavy Teak Bottom Chassis
          ctx.fillStyle = '#451a03';
          ctx.beginPath();
          ctx.roundRect(-18, -14, 36, 26, 4);
          ctx.fill();
          ctx.strokeStyle = '#78350f';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // Honey-Oak Main Cabin Frame (South Front View)
          const bodyGradS = ctx.createLinearGradient(0, -16, 0, 12);
          bodyGradS.addColorStop(0, '#92400e');
          bodyGradS.addColorStop(0.5, '#78350f');
          bodyGradS.addColorStop(1, '#5c2b09');
          ctx.fillStyle = bodyGradS;
          ctx.beginPath();
          ctx.roundRect(-16, -16, 32, 26, [5, 5, 2, 2]);
          ctx.fill();
          ctx.strokeStyle = '#b45309';
          ctx.lineWidth = 1.8;
          ctx.stroke();

          // Polished Brass Corner Reinforcement Brackets
          ctx.fillStyle = '#f59e0b';
          ctx.fillRect(-16, -16, 5, 5);
          ctx.fillRect(11, -16, 5, 5);
          ctx.fillRect(-16, 5, 5, 5);
          ctx.fillRect(11, 5, 5, 5);

          // Wide Front Windshield (Facing South with gleam)
          ctx.fillStyle = 'rgba(56, 189, 248, 0.85)';
          ctx.beginPath();
          ctx.roundRect(-12, -13, 24, 10, [3, 3, 1, 1]);
          ctx.fill();
          ctx.strokeStyle = '#fbbf24';
          ctx.lineWidth = 1.2;
          ctx.stroke();

          // Glass Gleam
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(-8, -11);
          ctx.lineTo(-2, -5);
          ctx.stroke();

          // Botanist Aviator Silhouette in windshield facing South
          ctx.fillStyle = '#047857';
          ctx.beginPath();
          ctx.arc(0, -7, 3.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#d97706';
          ctx.fillRect(-4, -10, 8, 2); // Straw hat brim

          // Heavy Brass Radiator Grill on lower front
          ctx.fillStyle = '#b45309';
          ctx.beginPath();
          ctx.roundRect(-10, -1, 20, 9, 2);
          ctx.fill();
          ctx.strokeStyle = '#f59e0b';
          ctx.lineWidth = 1;
          ctx.stroke();

          // Grill horizontal brass bars
          ctx.fillStyle = '#fef08a';
          ctx.fillRect(-8, 1, 16, 1.2);
          ctx.fillRect(-8, 3.5, 16, 1.2);
          ctx.fillRect(-8, 6, 16, 1.2);

          // Front Heavy Brass Dual Headlamps (Shining Down)
          const drawSouthHeadlamp = (hx: number) => {
            ctx.fillStyle = '#b45309';
            ctx.beginPath();
            ctx.arc(hx, 0, 4.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#f59e0b';
            ctx.lineWidth = 1.2;
            ctx.stroke();

            // Glowing lens & white filament
            ctx.fillStyle = '#fef08a';
            ctx.beginPath();
            ctx.arc(hx, 0, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(hx, 0.5, 1.2, 0, Math.PI * 2);
            ctx.fill();
          };

          drawSouthHeadlamp(-13);
          drawSouthHeadlamp(13);

          // Front Polished Brass Bullbar / Bumper
          ctx.strokeStyle = '#f59e0b';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(-16, 10);
          ctx.lineTo(16, 10);
          ctx.moveTo(-10, 8);
          ctx.lineTo(-10, 12);
          ctx.moveTo(10, 8);
          ctx.lineTo(10, 12);
          ctx.stroke();

          // Bio-Resonance Roof Antenna
          ctx.strokeStyle = '#f59e0b';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(0, -16);
          ctx.lineTo(0, -26);
          ctx.stroke();

          const antPulseS = 0.6 + Math.sin(Date.now() * 0.01) * 0.4;
          ctx.fillStyle = `rgba(56, 189, 248, ${antPulseS})`;
          ctx.beginPath();
          ctx.arc(0, -26, 3, 0, Math.PI * 2);
          ctx.fill();

        } else {
          // ==================== EAST (RIGHT) & WEST (LEFT - MIRRORED) ====================
          if (rover.facing === 'left') {
            ctx.scale(-1, 1);
          }

          // Ground shadow beneath heavy all-terrain tires
          ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
          ctx.beginPath();
          ctx.ellipse(0, 16, 30, 10, 0, 0, Math.PI * 2);
          ctx.fill();

          // All-Terrain Treaded Balloon Tires with Bronze Hubcaps
          const drawBalloonTire = (wx: number, wy: number) => {
            ctx.fillStyle = '#0f172a';
            ctx.beginPath();
            ctx.roundRect(wx - 8, wy - 8, 16, 22, 5);
            ctx.fill();
            ctx.strokeStyle = '#334155';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            ctx.fillStyle = '#1e293b';
            for (let tr = -6; tr <= 10; tr += 5) {
              ctx.fillRect(wx - 9, wy - 6 + tr, 3, 2.5);
              ctx.fillRect(wx + 6, wy - 6 + tr, 3, 2.5);
            }

            ctx.fillStyle = '#92400e';
            ctx.beginPath();
            ctx.arc(wx, wy + 3, 5.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#f59e0b';
            ctx.lineWidth = 1.2;
            ctx.stroke();

            ctx.fillStyle = '#fef08a';
            ctx.beginPath();
            ctx.arc(wx, wy + 3, 2.2, 0, Math.PI * 2);
            ctx.fill();
          };

          drawBalloonTire(-18, 4); // Rear tire
          drawBalloonTire(16, 4);  // Front tire

          // Heavy Teak / Chestnut Bottom Under-Chassis Frame
          ctx.fillStyle = '#451a03';
          ctx.beginPath();
          ctx.roundRect(-24, -2, 48, 10, 3);
          ctx.fill();
          ctx.strokeStyle = '#78350f';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // Honey-Oak Wood-Paneled Main Cabin Body (Facing Right natively)
          const cabinGrad = ctx.createLinearGradient(-22, -18, 22, 6);
          cabinGrad.addColorStop(0, '#92400e');
          cabinGrad.addColorStop(0.5, '#78350f');
          cabinGrad.addColorStop(1, '#5c2b09');
          ctx.fillStyle = cabinGrad;
          ctx.beginPath();
          ctx.roundRect(-22, -16, 44, 20, [4, 6, 3, 3]);
          ctx.fill();
          ctx.strokeStyle = '#b45309';
          ctx.lineWidth = 2;
          ctx.stroke();

          // Horizontal Honey-Oak Plank Groove Inlays
          ctx.strokeStyle = 'rgba(254, 240, 138, 0.15)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(-20, -10);
          ctx.lineTo(18, -10);
          ctx.moveTo(-20, -4);
          ctx.lineTo(20, -4);
          ctx.stroke();

          // Polished Brass Corner Reinforcement Brackets & Rivets
          ctx.fillStyle = '#f59e0b';
          ctx.fillRect(-22, -16, 7, 3);
          ctx.fillRect(-22, -16, 3, 7);
          ctx.fillRect(-22, 1, 7, 3);
          ctx.fillRect(-22, -3, 3, 7);
          ctx.fillRect(15, -16, 7, 3);
          ctx.fillRect(19, -16, 3, 7);
          ctx.fillRect(15, 1, 7, 3);
          ctx.fillRect(19, -3, 3, 7);

          // Rear Brass Luggage Rack with Strapped Canvas Pack & Specimen Jar
          ctx.strokeStyle = '#f59e0b';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(-21, -22, 14, 7);

          ctx.fillStyle = '#065f46';
          ctx.beginPath();
          ctx.roundRect(-20, -21, 12, 6, 2);
          ctx.fill();
          ctx.strokeStyle = '#fef08a';
          ctx.lineWidth = 0.8;
          ctx.stroke();

          ctx.fillStyle = '#78350f';
          ctx.fillRect(-18, -21, 2, 6);
          ctx.fillRect(-12, -21, 2, 6);

          ctx.fillStyle = 'rgba(56, 189, 248, 0.4)';
          ctx.beginPath();
          ctx.roundRect(-6, -20, 7, 6, 1.5);
          ctx.fill();
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 0.8;
          ctx.stroke();

          ctx.fillStyle = '#34d399';
          ctx.beginPath();
          ctx.arc(-2.5, -17, 1.5, 0, Math.PI * 2);
          ctx.fill();

          // Cockpit Windshield (Side view)
          ctx.fillStyle = 'rgba(56, 189, 248, 0.85)';
          ctx.beginPath();
          ctx.roundRect(2, -14, 16, 10, [2, 6, 2, 2]);
          ctx.fill();
          ctx.strokeStyle = '#fbbf24';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(5, -12);
          ctx.lineTo(13, -6);
          ctx.stroke();

          // Tiny Botanist Aviator Silhouette in Driver Seat
          ctx.fillStyle = '#047857';
          ctx.beginPath();
          ctx.arc(8, -8, 3.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#d97706';
          ctx.fillRect(5, -11, 6, 2);

          // Polished Brass Headlamp Casing (Front Nose)
          ctx.fillStyle = '#b45309';
          ctx.beginPath();
          ctx.roundRect(19, -9, 5, 7, 2);
          ctx.fill();
          ctx.strokeStyle = '#f59e0b';
          ctx.lineWidth = 1.2;
          ctx.stroke();

          ctx.fillStyle = '#fef08a';
          ctx.beginPath();
          ctx.arc(23, -5.5, 3.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#f59e0b';
          ctx.lineWidth = 1;
          ctx.stroke();

          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(23.5, -5.5, 1.5, 0, Math.PI * 2);
          ctx.fill();

          // Front Bullbar Guard
          ctx.strokeStyle = '#f59e0b';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(21, -1);
          ctx.lineTo(26, 4);
          ctx.lineTo(21, 9);
          ctx.stroke();

          // Bio-Resonance Antenna on Cabin Roof
          ctx.strokeStyle = '#f59e0b';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(-10, -16);
          ctx.lineTo(-14, -26);
          ctx.stroke();

          const antPulse = 0.6 + Math.sin(Date.now() * 0.01) * 0.4;
          ctx.fillStyle = `rgba(56, 189, 248, ${antPulse})`;
          ctx.beginPath();
          ctx.arc(-14, -26, 3, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#fef08a';
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }

        ctx.restore(); // restores rover local position

        ctx.restore(); // restores camera transform
      }

      // --- 8. DRAW AMBIENT PARTICLES & FLOATING TEXT (FOR EXCURSION / GLOBAL) ---
      if (loc !== 'SANCTUARY') {
        ctx.save();
        const exPool = particlePoolRef.current;
        for (let i = 0; i < exPool.length; i++) {
          const p = exPool[i];
          if (!p.active || p.alpha <= 0.01) continue;
          ctx.globalAlpha = p.alpha;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, Math.max(0, p.size), 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();

        floatingTextsRef.current.forEach((ft) => {
          ctx.save();
          ctx.globalAlpha = ft.alpha;
          ctx.fillStyle = ft.color;
          ctx.font = 'bold 13px system-ui';
          ctx.textAlign = 'center';
          ctx.shadowColor = 'rgba(0,0,0,0.8)';
          ctx.shadowBlur = 4;
          ctx.fillText(ft.text, ft.x, ft.y);
          ctx.restore();
        });
      }

      // --- 9. RADIAL SHOVEL DIGGING MINIGAME OVERLAY (GRAPHICAL OVERHAUL) ---
      const dig = digStateRef.current;
      if (dig.active) {
        ctx.save();
        ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        const cx = canvasWidth / 2;
        const cy = canvasHeight / 2;
        const dialRadius = 145;
        const TRACK_WIDTH = 22;

        // Elegant Non-Digging Track: Dark Obsidian/Slate Ring with Metallic Borders & Delicate Ticks
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = TRACK_WIDTH;
        ctx.lineCap = 'butt';
        ctx.beginPath();
        ctx.arc(cx, cy, dialRadius, 0, Math.PI * 2);
        ctx.stroke();

        // Inner and outer metallic border rings
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
        ctx.lineWidth = 1.2;
        ctx.lineCap = 'butt';
        ctx.beginPath();
        ctx.arc(cx, cy, dialRadius - TRACK_WIDTH / 2, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(cx, cy, dialRadius + TRACK_WIDTH / 2, 0, Math.PI * 2);
        ctx.stroke();

        // Delicate circular tick marks around the entire track
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.lineWidth = 1;
        ctx.lineCap = 'butt';
        const totalTicks = 72; // every 5 degrees
        for (let i = 0; i < totalTicks; i++) {
          const angle = (i * Math.PI * 2) / totalTicks;
          const isMajor = i % 6 === 0; // every 30 degrees
          const tickLen = isMajor ? 5 : 2.5;
          ctx.beginPath();
          ctx.moveTo(
            cx + Math.cos(angle) * (dialRadius - tickLen),
            cy + Math.sin(angle) * (dialRadius - tickLen),
          );
          ctx.lineTo(
            cx + Math.cos(angle) * (dialRadius + tickLen),
            cy + Math.sin(angle) * (dialRadius + tickLen),
          );
          ctx.stroke();
        }

        // Inner center disc backdrop
        ctx.fillStyle = '#090e1a';
        ctx.beginPath();
        ctx.arc(cx, cy, dialRadius - TRACK_WIDTH / 2 - 1, 0, Math.PI * 2);
        ctx.fill();

        // 1. CENTER BONSAI SAPLING & GLOWING SOIL MOUND
        ctx.save();
        // Glowing soil mound base
        const moundGrad = ctx.createRadialGradient(cx, cy + 10, 5, cx, cy + 10, 55);
        moundGrad.addColorStop(0, 'rgba(180, 83, 9, 0.5)');
        moundGrad.addColorStop(1, 'rgba(15, 23, 42, 0)');
        ctx.fillStyle = moundGrad;
        ctx.beginPath();
        ctx.arc(cx, cy + 10, 55, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#451a03';
        ctx.beginPath();
        ctx.ellipse(cx, cy + 20, 38, 14, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Species Sapling Mini Tree with Custom Leaf Shape
        const sapDef = getLeafTypeDef(dig.leafType);
        const sapColor = sapDef.color;
        const sapFlower = sapDef.accentColor;

        // Little seedling stem
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 6;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(cx, cy + 18);
        ctx.quadraticCurveTo(cx - 8, cy - 2, cx + 2, cy - 22);
        ctx.stroke();

        // Seedling Foliage using custom leaf shape
        drawLeafShape(ctx, cx - 10, cy - 20, 14, dig.leafType, sapColor, sapFlower);
        drawLeafShape(ctx, cx + 12, cy - 22, 12, dig.leafType, sapColor, sapFlower);
        drawLeafShape(ctx, cx + 2, cy - 34, 16, dig.leafType, sapColor, sapFlower);
        ctx.restore();

        // 2. ROOT SECTORS TO UNCOVER WITH NON-LINEAR PRECISION GRADIENT & RAZOR-SHARP RADIAL BORDERS
        dig.sectors.forEach((sec, idx) => {
          const halfWidth = sec.arcLength / 2;
          const midAngle = sec.startAngle + halfWidth;

          if (sec.hit) {
            // Already hit: completed sector with elegant luminous emerald/cyan glow, crisp butt caps & border brackets
            ctx.lineCap = 'butt';
            ctx.strokeStyle = 'rgba(16, 185, 129, 0.3)';
            ctx.lineWidth = TRACK_WIDTH;
            ctx.beginPath();
            ctx.arc(cx, cy, dialRadius, sec.startAngle, sec.startAngle + sec.arcLength);
            ctx.stroke();

            // Inner and outer border arcs
            ctx.strokeStyle = '#10b981';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(cx, cy, dialRadius - TRACK_WIDTH / 2, sec.startAngle, sec.startAngle + sec.arcLength);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(cx, cy, dialRadius + TRACK_WIDTH / 2, sec.startAngle, sec.startAngle + sec.arcLength);
            ctx.stroke();

            // Radial boundaries at start and end
            [sec.startAngle, sec.startAngle + sec.arcLength].forEach((ang) => {
              ctx.beginPath();
              ctx.moveTo(
                cx + Math.cos(ang) * (dialRadius - TRACK_WIDTH / 2),
                cy + Math.sin(ang) * (dialRadius - TRACK_WIDTH / 2),
              );
              ctx.lineTo(
                cx + Math.cos(ang) * (dialRadius + TRACK_WIDTH / 2),
                cy + Math.sin(ang) * (dialRadius + TRACK_WIDTH / 2),
              );
              ctx.stroke();
            });

            // Center hit marker
            ctx.strokeStyle = '#facc15';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.moveTo(
              cx + Math.cos(midAngle) * (dialRadius - TRACK_WIDTH / 2),
              cy + Math.sin(midAngle) * (dialRadius - TRACK_WIDTH / 2),
            );
            ctx.lineTo(
              cx + Math.cos(midAngle) * (dialRadius + TRACK_WIDTH / 2),
              cy + Math.sin(midAngle) * (dialRadius + TRACK_WIDTH / 2),
            );
            ctx.stroke();
          } else {
            // Unhit active digging zone: render discrete bands mirroring the 16 tiers (mirrored left and right of center)
            const steadyHandsRank = zenSkillsRef.current.steady_hands || 0;
            const skillBonus = steadyHandsRank * 10;
            const totalArc = sec.arcLength;

            ctx.lineCap = 'butt';
            ctx.lineWidth = TRACK_WIDTH;

            for (let i = 0; i < TIERS.length; i++) {
              const tier = TIERS[i];
              const prevMaxPct = i === 0 ? 0 : TIERS[i - 1].maxDistPct;
              const maxPct = tier.maxDistPct;
              const effectivePrecision = tier.base + skillBonus;
              const tierColor = getPrecisionColor(effectivePrecision);

              ctx.strokeStyle = tierColor;

              // Right side of center
              const rAng1 = midAngle + (prevMaxPct / 100) * totalArc;
              const rAng2 = midAngle + (maxPct / 100) * totalArc;
              ctx.beginPath();
              ctx.arc(cx, cy, dialRadius, rAng1, rAng2 + 0.001);
              ctx.stroke();

              // Left side of center
              const lAng1 = midAngle - (maxPct / 100) * totalArc;
              const lAng2 = midAngle - (prevMaxPct / 100) * totalArc;
              ctx.beginPath();
              ctx.arc(cx, cy, dialRadius, lAng1, lAng2 + 0.001);
              ctx.stroke();
            }

            // Glowing outer/inner bracket arcs bounding the active zone
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
            ctx.lineWidth = 2;
            ctx.lineCap = 'butt';
            ctx.beginPath();
            ctx.arc(cx, cy, dialRadius - TRACK_WIDTH / 2, sec.startAngle, sec.startAngle + sec.arcLength);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(cx, cy, dialRadius + TRACK_WIDTH / 2, sec.startAngle, sec.startAngle + sec.arcLength);
            ctx.stroke();

            // Crisp radial boundary lines at start and end angles of the digging arc
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2.5;
            ctx.lineCap = 'butt';
            [sec.startAngle, sec.startAngle + sec.arcLength].forEach((ang) => {
              ctx.beginPath();
              ctx.moveTo(
                cx + Math.cos(ang) * (dialRadius - TRACK_WIDTH / 2 - 1),
                cy + Math.sin(ang) * (dialRadius - TRACK_WIDTH / 2 - 1),
              );
              ctx.lineTo(
                cx + Math.cos(ang) * (dialRadius + TRACK_WIDTH / 2 + 1),
                cy + Math.sin(ang) * (dialRadius + TRACK_WIDTH / 2 + 1),
              );
              ctx.stroke();
            });

            // Center line of the bullseye (d = 0): crisp radial line in brilliant white
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 3;
            ctx.lineCap = 'butt';
            ctx.beginPath();
            ctx.moveTo(
              cx + Math.cos(midAngle) * (dialRadius - TRACK_WIDTH / 2 - 3),
              cy + Math.sin(midAngle) * (dialRadius - TRACK_WIDTH / 2 - 3),
            );
            ctx.lineTo(
              cx + Math.cos(midAngle) * (dialRadius + TRACK_WIDTH / 2 + 3),
              cy + Math.sin(midAngle) * (dialRadius + TRACK_WIDTH / 2 + 3),
            );
            ctx.stroke();
          }

          // Spot Number Tag / Precision Feedback Tag (Positioned cleanly outside the dial track)
          const tagX = cx + Math.cos(midAngle) * (dialRadius - 32);
          const tagY = cy + Math.sin(midAngle) * (dialRadius - 32);

          ctx.fillStyle = sec.hit ? '#38bdf8' : '#10b981';
          ctx.beginPath();
          ctx.arc(tagX, tagY, sec.hit ? 12 : 10, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#0f172a';
          ctx.font = sec.hit ? 'bold 8px system-ui' : 'bold 9px system-ui';
          ctx.textAlign = 'center';
          ctx.fillText(sec.hit ? `${sec.precision ?? 100}%` : `${idx + 1}`, tagX, tagY + 3.5);
        });

        // 3. ANIMATED SHOVEL / TROWEL SPRITE & BLADE SILHOUETTE ORBITING SMOOTHLY
        const wobble = dig.wobbleTimer > 0 ? Math.sin(Date.now() * 0.05) * 0.15 : 0;
        const needleAngle = dig.needleAngle + wobble;

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(needleAngle);

        // Shovel shaft
        ctx.strokeStyle = '#b45309';
        ctx.lineWidth = 5;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(35, 0);
        ctx.lineTo(dialRadius - 16, 0);
        ctx.stroke();

        // Shovel handle grip
        ctx.fillStyle = '#d97706';
        ctx.beginPath();
        ctx.roundRect(30, -7, 12, 14, 3);
        ctx.fill();

        // Steel Shovel / Trowel Blade
        ctx.save();
        ctx.translate(dialRadius - 10, 0);
        ctx.fillStyle = '#e2e8f0';
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(-6, -12);
        ctx.lineTo(16, 0);
        ctx.lineTo(-6, 12);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Shovel blade center bevel ridge
        ctx.strokeStyle = '#cbd5e1';
        ctx.beginPath();
        ctx.moveTo(-6, 0);
        ctx.lineTo(14, 0);
        ctx.stroke();
        ctx.restore();

        // Shovel pivot ring
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(0, 0, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // 4. HEADER & SPECIES INFO WITH MATURITY COLOR FLAIR & SPECIES PROBABILITY ARC
        const digMatDef = getMaturityDef(dig.maturity);
        ctx.fillStyle = digMatDef.color;
        ctx.font = 'bold 13px system-ui';
        ctx.textAlign = 'center';
        const speciesChancePct = Math.round((dig.speciesChance ?? 0.33) * 100);
        const arcDisplay = (dig.arcDeg ?? 57.6).toFixed(1);
        ctx.fillText(
          `${digMatDef.kanji} | Rank ${digMatDef.rank} (${digMatDef.name}) • ${dig.requiredHits} Root Sites • Species Find Odds: ${speciesChancePct}% (${arcDisplay}° Arc Width)`,
          cx,
          cy - dialRadius - 70,
        );

        ctx.fillStyle = '#f8fafc';
        ctx.font = 'bold 22px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText(`Radial Root Dig: ${dig.saplingName}`, cx, cy - dialRadius - 46);

        // 100% HIT REQUIREMENT BADGE
        ctx.font = 'bold 13px system-ui';
        ctx.fillStyle = '#10b981';
        ctx.fillText(
          `Root Sectors Hit: ${dig.currentHits} / ${dig.requiredHits} (100% Hit Required - No Misses!)`,
          cx,
          cy - dialRadius - 24,
        );

        // 5. GATING PROMPT / WARNING BADGE
        const remainingStrikes = dig.maxStrikes - dig.strikesUsed;
        if (dig.isGated) {
          ctx.fillStyle = '#ef4444';
          ctx.font = 'bold 13px system-ui';
          ctx.fillText(
            `⚠️ Requires ${dig.requiredHits} Strikes (Current Max: ${dig.maxStrikes}) - Upgrade "Careful Trowel" in Zen Skills!`,
            cx,
            cy + dialRadius + 22,
          );
        } else {
          ctx.fillStyle = remainingStrikes <= 1 ? '#ef4444' : '#fbbf24';
          ctx.font = 'bold 13px system-ui';
          ctx.fillText(
            `Shovel Strikes Remaining: ${remainingStrikes} / ${dig.maxStrikes}`,
            cx,
            cy + dialRadius + 22,
          );
        }

        ctx.font = 'bold 15px system-ui';
        ctx.fillStyle = dig.isGated ? '#f87171' : '#facc15';
        ctx.fillText(
          isMobile
            ? 'TAP DIG BUTTON • [LEAVE SITE] TO CANCEL'
            : '[Space / X] Strike Needle • [Esc / B] Cancel / Leave',
          cx,
          cy + dialRadius + 48,
        );

        // ESC Cancel Button visual tag
        ctx.fillStyle = 'rgba(239, 68, 68, 0.2)';
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(cx - 95, cy + dialRadius + 64, 190, 24, 6);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#fca5a5';
        ctx.font = 'bold 11px system-ui';
        ctx.fillText('Cancel / Leave Site [Esc / B]', cx, cy + dialRadius + 80);

        ctx.restore();
      }
    },
    [
      assets,
      canvasHeight,
      canvasWidth,
      getPowerMetrics,
      isGridPlotUnlocked,
      isMobile,
      isNearGarage,
      isNearShop,
      isNearWorkbench,
      isNearZenLibrary,
      isNearBonsaiSociety,
      isUnifiedStorageOpen,
      nearbyBonsai,
      sanctuaryBonsaiSociety,
      sanctuaryRoverGarage,
      sanctuaryShopStand,
      sanctuaryWorkbench,
      sanctuaryZenLibrary,
      snapToSanctuaryGrid,
    ],
  );

  // --- RAF LOOP ---
  const updateRef = useRef(update);
  const drawRef = useRef(draw);
  updateRef.current = update;
  drawRef.current = draw;

  useEffect(() => {
    let raf = 0;
    const loop = (time: number) => {
      stepperRef.current?.(time, (dt) => updateRef.current(dt));
      const ctx = canvasRef.current?.getContext('2d');
      if (ctx) drawRef.current(ctx);
      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const inspectingBonsai = plantedBonsaisRef.current.find(
    (b) => b.id === inspectingBonsaiId,
  );

  const inv = sanctuaryInventoryRef.current;
  const rover = roverRef.current;
  const currentBiome = getExpeditionBiomeDef(activeBiomeId);
  const currentDist = Math.round(Math.hypot(rover.tileX, rover.tileY));
  const zoneInfo = getZoneInfo(activeBiomeId, currentDist);
  const currentBackWeight = getCargoWeight();
  const maxBackWeight = getMaxRoverCargo();
  const maxBatteryKwh = getMaxRoverBattery();
  const power = getPowerMetrics();
  const totalAvailableSeedlings = inv.seedlingList
    ? inv.seedlingList.length
    : storedSaplingsRef.current.reduce((acc, s) => acc + s.count, 0);
  const totalStoredPots = storedPottedBonsaisRef.current.length;

  const highestPremiumLevel = useMemo(() => {
    let max = 0;
    plantedBonsaisRef.current.forEach((b) => {
      if (b.maturity === 'premium') max = Math.max(max, b.level);
    });
    storedPottedBonsaisRef.current.forEach((b) => {
      if (b.maturity === 'premium') max = Math.max(max, b.level);
    });
    return max;
  }, [plantedBonsaisRef.current, storedPottedBonsaisRef.current, gameState.score]);

  return (
    <div className="fixed inset-0 overflow-hidden touch-none flex flex-col items-center justify-center bg-slate-950 text-white font-sans select-none">
      <style>{`
        body.pseudo-fullscreen {
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          right: 0 !important;
          bottom: 0 !important;
          width: 100vw !important;
          height: 100vh !important;
          z-index: 999999 !important;
          margin: 0 !important;
          padding: 0 !important;
          overflow: hidden !important;
          background-color: #020617 !important;
        }
        body.pseudo-fullscreen #root,
        body.pseudo-fullscreen #root > div {
          width: 100vw !important;
          height: 100vh !important;
          position: fixed !important;
          inset: 0 !important;
        }
      `}</style>

      {!assetsReady && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-950 text-white">
          <Sparkles className="w-10 h-10 text-emerald-400 animate-spin mb-4" />
          <div className="text-lg font-bold">Cultivating Walkable Sanctuary & Botanical Market...</div>
        </div>
      )}

      <BackgroundMusic
        url={BACKGROUND_MUSIC_URL}
        isPlaying={gameState.status === 'PLAYING' && !isMusicMuted}
        isMuted={isMusicMuted}
        volume={(getConfig('defaultMusicVolume') as number) || 0.06}
      />

      {/* ========================================================================= */}
      {/* REFINED TOP HUD (UNIFIED LEVEL + ZEN BADGE, ELECTRICAL GRID BADGE, INVENTORY) */}
      {/* ========================================================================= */}
      <header className="w-full h-12 bg-slate-900/95 backdrop-blur-md border-b border-slate-800/80 px-3 flex items-center justify-between gap-2 z-50 shrink-0">
        {/* LEFT: Location, Unified [Lv + EXP + Zen] Badge, Coins (Sanctuary only) & Power Grid Pill */}
        <div className="flex items-center flex-wrap gap-2">
          {/* 🎮 Gamepad Active Indicator */}
          {connectedGamepadName && (
            <div
              className="bg-slate-950/90 border border-sky-500/60 px-2.5 py-1 rounded-lg text-sky-300 font-bold text-xs flex items-center gap-1.5 shadow"
              title={`Controller Active: ${connectedGamepadName}`}>
              <Gamepad className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
              <span className="hidden xl:inline">{connectedGamepadName}</span>
              <span className="xl:hidden">Controller</span>
            </div>
          )}
          <div
            className={`px-2.5 py-1 rounded-lg text-xs font-black flex items-center gap-1.5 shadow ${
              location === 'SANCTUARY'
                ? 'bg-emerald-900/80 text-emerald-200 border border-emerald-500/50'
                : 'bg-amber-900/80 text-amber-200 border border-amber-500/50'
            }`}>
            {location === 'SANCTUARY' ? (
              <>
                <Home className="w-3.5 h-3.5 text-emerald-300" />
                <span>Sanctuary</span>
              </>
            ) : (
              <>
                <Truck className="w-3.5 h-3.5 text-amber-300" />
                <span>Rover: {currentBiome.name}</span>
              </>
            )}
          </div>

          {/* ⭐ Unified Botanist Level, EXP Progress Bar & 🌸 Zen Points Badge */}
          <div className="bg-slate-950/90 border border-emerald-500/70 px-2.5 py-1 rounded-lg flex items-center gap-2 text-xs font-bold shadow">
            <div className="flex items-center gap-1 text-emerald-400 font-black">
              <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
              <span>Lv.{inv.player_level}</span>
            </div>
            <div className="w-14 sm:w-20 bg-slate-800 h-2 rounded-full overflow-hidden border border-slate-700">
              <div
                style={{
                  width: `${Math.min(
                    100,
                    (inv.player_exp / getExpRequiredForLevel(inv.player_level)) * 100,
                  )}%`,
                }}
                className="bg-gradient-to-r from-emerald-500 via-teal-300 to-pink-400 h-full transition-all duration-300"
              />
            </div>
            <span className="text-[10px] text-slate-300 font-mono hidden sm:inline">
              {inv.player_exp}/{getExpRequiredForLevel(inv.player_level)} EXP
            </span>
            <span className="text-slate-600 font-light">|</span>
            <div className="flex items-center gap-1 text-pink-300 font-bold">
              <span>🌸 {inv.zen_essence} Zen</span>
            </div>
          </div>

          {/* 🌱 Verdure Balance (Sanctuary Only) */}
          {location === 'SANCTUARY' && (
            <div className="bg-emerald-950/85 border border-emerald-500/70 px-2.5 py-1 rounded-lg flex items-center gap-1.5 text-xs font-black text-emerald-300 shadow">
              <VerdureIcon className="w-4 h-4" />
              <span>{inv.coins} Verdure</span>
            </div>
          )}

          {/* ⚡ Electrical Grid Display Badge (Sanctuary Only) */}
          {location === 'SANCTUARY' && (
            <div
              className={`px-2.5 py-1 rounded-lg flex items-center gap-1.5 text-xs font-bold shadow border transition-colors ${
                power.totalGenerated < power.totalRequired
                  ? 'bg-rose-950/80 border-rose-500/70 text-rose-300'
                  : power.totalGenerated === 0 && power.totalRequired === 0
                  ? 'bg-slate-950/80 border-slate-700 text-slate-400'
                  : 'bg-emerald-950/80 border-emerald-500/70 text-emerald-300'
              }`}
              title={`Deployed Solar: ${power.deployedSolar} (+${power.solarKw} kW), Deployed Turbines: ${power.deployedTurbines} (+${power.turbineKw} kW), Total Load: ${power.totalRequired} kW`}>
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${
                  power.totalGenerated < power.totalRequired
                    ? 'bg-rose-500 animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.8)]'
                    : power.totalGenerated === 0 && power.totalRequired === 0
                    ? 'bg-slate-500'
                    : 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]'
                }`}
              />
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>
                ⚡ {power.totalGenerated} / {power.totalRequired} kW
              </span>
              <span className="text-[10px] text-slate-400 font-normal hidden md:inline">
                {power.totalGenerated < power.totalRequired
                  ? 'Deficit'
                  : power.totalGenerated === 0 && power.totalRequired === 0
                  ? 'Idle'
                  : 'Active'}
              </span>
            </div>
          )}
        </div>

        {/* RIGHT: Unified Menu Actions & Telemetry */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {location === 'SANCTUARY' ? (
            <>
              {/* 📦 Nursery Inventory */}
              <button
                onClick={() => {
                  setIsUnifiedStorageOpen(true);
                  gameAudio.playCrispClick();
                }}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow transition-transform active:scale-95 border border-slate-700">
                <Package className="w-3.5 h-3.5 text-sky-300" />
                <span>Nursery Inventory [I / +]</span>
              </button>
            </>
          ) : (
            <>
              {/* 🔋 Rover Battery */}
              <div
                className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 border shadow ${
                  rover.batteryKwh <= 10
                    ? 'bg-red-950/90 text-red-300 border-red-500 animate-pulse'
                    : 'bg-slate-950/90 text-amber-300 border-slate-700'
                }`}>
                <Battery className="w-3.5 h-3.5" />
                <span>
                  🔋 <strong>{rover.batteryKwh}</strong> / {maxBatteryKwh} kWh
                </span>
                <span className="text-[10px] text-amber-400/80">(-{currentBiome.batteryCostPerStep}/step)</span>
              </div>

              {/* 🎒 Cargo Bed */}
              <div className="bg-slate-950/90 border border-slate-700 px-2.5 py-1 rounded-lg flex items-center gap-1 text-xs font-bold">
                <Package className="w-3.5 h-3.5 text-amber-400" />
                <span>
                  <span className={currentBackWeight >= maxBackWeight ? 'text-red-400' : 'text-amber-300'}>
                    {currentBackWeight}
                  </span>
                  /{maxBackWeight}kg
                </span>
              </div>

              {/* Return / Tow Emergency Button */}
              <button
                onClick={() => {
                  if (rover.tileX === 0 && rover.tileY === 0) {
                    finishExcursion(false);
                  } else {
                    finishExcursion(true);
                  }
                }}
                className={`text-white text-xs font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1 shadow transition-transform active:scale-95 ${
                  rover.tileX === 0 && rover.tileY === 0
                    ? 'bg-emerald-600 hover:bg-emerald-500'
                    : 'bg-rose-700 hover:bg-rose-600'
                }`}>
                {rover.tileX === 0 && rover.tileY === 0 ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Unload (100%)</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Tow (35%)</span>
                  </>
                )}
              </button>
            </>
          )}

          {/* Menu Button */}
          <button
            data-testid="menu-button"
            onClick={() => {
              setIsGameMenuOpen((prev) => !prev);
              gameAudio.playCrispClick();
            }}
            title="Menu & Settings [Esc / -]"
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors min-w-[34px] min-h-[34px] flex items-center justify-center border border-slate-700">
            <Menu className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* FLOATING NOTIFICATION BANNER */}
      {hudMessage && (
        <div
          style={{borderColor: hudMessage.color, color: hudMessage.color}}
          className="absolute top-14 z-30 bg-slate-900/95 px-4 py-1.5 rounded-full border shadow-xl text-xs sm:text-sm font-bold animate-bounce flex items-center gap-2 pointer-events-none">
          <Sparkles className="w-4 h-4" />
          {hudMessage.text}
        </div>
      )}

      {/* MAIN CANVAS VIEWPORT */}
      <div className="flex-1 w-full min-h-0 relative flex items-center justify-center bg-slate-950 overflow-hidden">
              <canvas
                ref={canvasRef}
                width={canvasWidth}
          height={canvasHeight}
          style={{
            aspectRatio: `${canvasWidth} / ${canvasHeight}`,
            width: `min(100%, calc(100vh * ${canvasWidth} / ${canvasHeight}))`,
          }}
          className="h-auto max-w-full max-h-full drop-shadow-2xl shadow-2xl"
        />

        {/* SANCTUARY PROXIMITY INTERACTION BAR */}
        {location === 'SANCTUARY' && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-slate-900/95 border border-slate-800 px-4 py-2 rounded-2xl flex items-center gap-3 shadow-2xl z-20 max-w-2xl w-full justify-between">
            {placementPreview ? (() => {
              const currentPlot = activePlotRef.current || getPlotAtCoords(avatarRef.current.x, avatarRef.current.y, inv.sanctuary_expansion_tier || 0);
              const isValid = checkPlotPlacementValid(currentPlot, placementPreview);
              const isRotatable = placementPreview.payload === 'torii_gate';
              const isPlantable = placementPreview.category === 'seedling' || placementPreview.category === 'bonsai';

              let haloText = '';
              if (isPlantable && currentPlot) {
                // Calculate the exact halo effects that this bonsai WOULD receive from adjacent plots around (currentPlot.centerX, currentPlot.centerY)
                const simBonsai: PlantedBonsai = {
                  id: 'sim_preview',
                  leafType: placementPreview.category === 'seedling' ? placementPreview.payload.leafType : placementPreview.payload.leafType,
                  group: placementPreview.category === 'seedling' ? placementPreview.payload.group : placementPreview.payload.group,
                  style: (placementPreview.style as BonsaiStyle) || 'CHOKAN',
                  maturity: placementPreview.category === 'seedling' ? placementPreview.payload.maturity : placementPreview.payload.maturity,
                  name: placementPreview.payload.name || 'Preview',
                  level: placementPreview.category === 'bonsai' ? placementPreview.payload.level : 1,
                  progressSeconds: 0,
                  gridX: currentPlot.centerX,
                  gridY: currentPlot.centerY,
                  x: currentPlot.centerX,
                  y: currentPlot.centerY,
                  radius: 36,
                  color: '#10b981',
                  flowerColor: '#34d399',
                  potColor: '#1e293b',
                  potStyle: 'Carved Ceramic',
                  automatonTier: 0,
                  pruneBoostTimer: 0,
                  waterSprayAnim: 0,
                };
                const simSynergies = getBonsaiSynergies(simBonsai, plantedBonsaisRef.current, deployedStructuresRef.current);

                const haloParts: string[] = [];
                if (simSynergies.isStalled) {
                  haloParts.push(`⛔ Stalling Surroundings (>4 ${simSynergies.stalledEntityLabel || 'identical neighbors'})`);
                } else {
                  if (simSynergies.bonsaiCount > 0) {
                    haloParts.push(`Growing Together x${simSynergies.bonsaiCount} (+${simSynergies.bonsaiCount * 10}% Hydration)`);
                  }
                  if (simSynergies.wallCount > 0) {
                    haloParts.push(`Private Growing x${simSynergies.wallCount} (+${simSynergies.wallCount * 10}% Hydration)`);
                  }
                  if (simSynergies.rockCount > 0) {
                    haloParts.push(`Quick Prune x${simSynergies.rockCount} (+${(simSynergies.rockCount * 0.25).toFixed(2)}s Prune)`);
                  }
                  if (simSynergies.bushCount > 0) {
                    haloParts.push(`XP Boosted x${simSynergies.bushCount} (+${simSynergies.bushCount * 15}% EXP)`);
                  }
                  if (simSynergies.crystalPedestals && simSynergies.crystalPedestals.total > 0) {
                    haloParts.push(`Cultivating Potential (${formatCrystalPedestalBonus(simSynergies.crystalPedestals)})`);
                  }
                  if (simSynergies.energyCount > 0) {
                    haloParts.push(`Disrupted Zen x${simSynergies.energyCount} (-${simSynergies.energyCount * 10}% Growth)`);
                  }
                }
                haloText = haloParts.length > 0 ? haloParts.join(' • ') : 'No adjacent halos detected';
              }

              return (
                <div className="w-full flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-xl shrink-0">
                      {placementPreview.payload === 'torii_gate' ? '⛩️' : isPlantable ? '🌱' : '📦'}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`font-bold ${isValid ? 'text-emerald-300' : 'text-rose-400'}`}>
                          {isValid ? 'Placement Preview Active' : 'Invalid Placement Location (Occupied or Off-Grid)'}
                        </span>
                        {isRotatable && (
                          <span className="bg-sky-950 text-sky-300 border border-sky-500/50 px-2 py-0.5 rounded text-[10px] font-mono font-bold">
                            Orientation: {placementPreview.orientation}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-300 truncate">
                        {isPlantable ? (
                          <span>
                            <strong>Halo Preview:</strong>{' '}
                            <span className={haloText.startsWith('⛔') ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
                              {haloText || 'No adjacent halos detected'}
                            </span>
                          </span>
                        ) : isRotatable ? (
                          <span className="text-slate-400">
                            Spans 3 plots with open center pebble path (+35% Speed) • [← / → or LB / RB] Rotate ({placementPreview.orientation})
                          </span>
                        ) : (
                          <span className="text-slate-400">
                            Deploy onto open plot
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {isRotatable && (
                      <button
                        onClick={togglePreviewOrientation}
                        className="bg-sky-700 hover:bg-sky-600 text-white font-bold text-xs px-2.5 py-1.5 rounded-xl shadow transition-transform active:scale-95 flex items-center gap-1 cursor-pointer">
                        <span>🔄</span>
                        <span>[← / →] Rotate</span>
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setPlacementPreview(null);
                        gameAudio.playCrispClick();
                      }}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs px-3 py-1.5 rounded-xl transition-all border border-slate-700 cursor-pointer">
                      [Esc / B] Cancel
                    </button>
                    <button
                      disabled={!isValid}
                      onClick={handleConfirmPlacement}
                      className={`font-bold text-xs px-3.5 py-1.5 rounded-xl shadow transition-transform active:scale-95 flex items-center gap-1.5 cursor-pointer ${
                        isValid
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white ring-1 ring-emerald-400/50'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                      }`}>
                      <Check className="w-3.5 h-3.5" />
                      <span>{isPlantable ? '[E / A] Place Bonsai' : '[E / A] Place Item'}</span>
                    </button>
                  </div>
                </div>
              );
            })() : isNearShop ? (
              <>
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-amber-400" />
                  <div>
                    <div className="text-xs font-bold text-amber-300">Botanical Market Stand</div>
                    <div className="text-[11px] text-slate-400">Greenhouse Expansions, Biome Maps & Bonsai Trading</div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setIsShopModalOpen(true);
                    gameAudio.playCrispClick();
                  }}
                  className="bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs px-3 py-2 rounded-xl flex items-center gap-1.5 shadow transition-transform active:scale-95 min-h-[38px]">
                  <ShoppingBag className="w-4 h-4" />
                  [E / A] Open Market
                </button>
              </>
            ) : isNearWorkbench ? (
              <>
                <div className="flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-sky-400" />
                  <div>
                    <div className="text-xs font-bold text-sky-200">
                      Sanctuary Workbench (Tier {inv.workbench_tier || 1})
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Craft Automatons, Clean Energy, Compost & Manage Modules
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setWorkbenchTab('resources');
                    setIsWorkbenchModalOpen(true);
                    gameAudio.playCrispClick();
                  }}
                  className="bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow transition-transform active:scale-95 min-h-[38px]">
                  <Wrench className="w-4 h-4" />
                  [E / A] Open Workbench (Tier {inv.workbench_tier || 1})
                </button>
              </>
            ) : isNearZenLibrary ? (
              <>
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-pink-400" />
                  <div>
                    <div className="text-xs font-bold text-pink-300">Zen Library</div>
                    <div className="text-[11px] text-slate-400">Botanical Bondex, Mastery Skills &amp; Milestones</div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setIsZenSkillsModalOpen(true);
                    gameAudio.playCrispClick();
                  }}
                  className="bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow transition-transform active:scale-95 min-h-[38px]">
                  <BookOpen className="w-4 h-4" />
                  [E / A] Open Zen Library
                </button>
              </>
            ) : isNearBonsaiSociety ? (
              <div className="w-full flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🏛️</span>
                  <div>
                    <div className="text-xs font-bold text-amber-300">🏛️ Bonsai Society (Grand Hall - Membership Opening Soon)</div>
                    <div className="text-[11px] text-slate-400">Civic Assembly &amp; Master Arborist Guild Hall</div>
                  </div>
                </div>
                <div className="bg-slate-800/80 text-amber-300 border border-amber-500/40 text-[11px] font-bold px-3 py-1.5 rounded-xl shadow">
                  Opening Soon
                </div>
              </div>
            ) : isNearGarage ? (
              <>
                <div className="flex items-center gap-2">
                  <Truck className="w-5 h-5 text-sky-400" />
                  <div>
                    <div className="text-xs font-bold text-sky-300">Rover Garage Departure Bay</div>
                    <div className="text-[11px] text-slate-400">Embark Rover on Wilderness Excursions</div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setIsBiomeSelectOpen(true);
                    gameAudio.playCrispClick();
                  }}
                  className="bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 shadow transition-transform active:scale-95 min-h-[38px]">
                  <Truck className="w-4 h-4" />
                  [E / A] Garage Departure
                </button>
              </>
            ) : nearbyStructure ? (() => {
              const isSolar = nearbyStructure.type === 'solar_panel';
              const isTurbine = nearbyStructure.type === 'wind_turbine';
              const isCompost = nearbyStructure.type === 'tool_compost_heap';
              const isWell = nearbyStructure.type === 'tool_garden_well';
              const isEnergy = isSolar || isTurbine;

              const solarInfo = isSolar ? getSolarPanelOutput(nearbyStructure, deployedStructuresRef.current) : null;
              const turbineInfo = isTurbine ? getWindTurbineOutput(nearbyStructure, deployedStructuresRef.current) : null;

              const hasBonus = isSolar ? (solarInfo?.count || 0) > 0 : isTurbine ? (turbineInfo?.count || 0) > 0 : false;
              const resonanceLabel = isSolar
                ? `+${(solarInfo?.resonance || 0).toFixed(1)} kW Solar Resonance`
                : isTurbine
                ? `+${(turbineInfo?.resonance || 0).toFixed(1)} kW Wind Resonance`
                : '';

              const totalStructKw = isSolar ? (solarInfo?.total || 3) : isTurbine ? (turbineInfo?.total || 6) : 0;

              // Compost specific state
              const compostReady = nearbyStructure.readyCompost || 0;
              const compostWaste = nearbyStructure.depositedWaste || 0;
              const compostProgress = compostWaste >= 2 ? Math.min(1.0, (nearbyStructure.timer || 0) / 10) : 0;

              // Well specific state
              const isWatering = (nearbyStructure.activeWateringRemaining || 0) > 0;

              return (
                <>
                  <div className="flex items-center gap-2">
                    {isSolar ? (
                      <Sun className="w-5 h-5 text-sky-400" />
                    ) : isTurbine ? (
                      <Wind className="w-5 h-5 text-amber-400" />
                    ) : isCompost ? (
                      <span className="text-xl">🍂</span>
                    ) : isWell ? (
                      <Droplets className="w-5 h-5 text-sky-400" />
                    ) : nearbyStructure.type === 'torii_gate' ? (
                      <span className="text-xl">⛩️</span>
                    ) : nearbyStructure.type === 'decor_shrubbery_bush' ? (
                      <Trees className="w-5 h-5 text-emerald-400" />
                    ) : nearbyStructure.type === 'decor_woven_wall' ? (
                      <Shield className="w-5 h-5 text-amber-400" />
                    ) : nearbyStructure.type.startsWith('crystal_pedestal') ? (
                      <Sparkles className="w-5 h-5 text-purple-400" />
                    ) : (
                      <Sparkles className="w-5 h-5 text-slate-300" />
                    )}
                    <div>
                      <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                        {isCompost ? (
                          <div className="flex items-center gap-1.5">
                            <span>Compost Heap</span>
                            {/* Animated progress fill box for bottom HUD (persists when ready compost > 0 while remaining waste decomposes) */}
                            <div className={`relative overflow-hidden bg-slate-950 border px-2.5 py-0.5 rounded-lg text-[10px] font-bold min-w-[72px] text-center ${
                              compostReady > 0 ? 'border-lime-400/80 shadow-[0_0_8px_rgba(163,230,53,0.3)]' : compostWaste >= 2 ? 'border-lime-500/50' : 'border-slate-700'
                            }`}>
                              {compostWaste >= 2 && (
                                <div
                                  style={{width: `${compostProgress * 100}%`}}
                                  className="absolute inset-0 bg-lime-600/40 transition-all duration-200 pointer-events-none"
                                />
                              )}
                              <span className="relative z-10 text-lime-300">
                                {compostReady > 0
                                  ? `${compostReady} Compost`
                                  : compostWaste > 0
                                  ? 'Composting'
                                  : 'Empty'}
                              </span>
                            </div>
                          </div>
                        ) : isWell ? (() => {
                          const wellTotalDuration = nearbyStructure.totalActiveDuration || 20;
                          const wellProgress = isWatering
                            ? Math.max(0, Math.min(1, (nearbyStructure.activeWateringRemaining || 0) / wellTotalDuration))
                            : 0;

                          return (
                            <div className="flex items-center gap-1.5">
                              <span>Stone Well</span>
                              {/* Animated depleting/emptying horizontal bar behind Watering text in bottom HUD */}
                              <div className={`relative overflow-hidden bg-slate-950 border px-2.5 py-0.5 rounded-lg text-[10px] font-bold min-w-[66px] text-center ${
                                isWatering ? 'border-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.35)]' : 'border-slate-700'
                              }`}>
                                {isWatering && (
                                  <div
                                    style={{width: `${wellProgress * 100}%`}}
                                    className="absolute inset-0 bg-gradient-to-r from-cyan-600/50 via-sky-500/60 to-cyan-400/70 transition-all duration-75 pointer-events-none"
                                  />
                                )}
                                <span className={`relative z-10 ${isWatering ? 'text-sky-200' : 'text-slate-400'}`}>
                                  {isWatering ? 'Watering' : 'Empty'}
                                </span>
                              </div>
                            </div>
                          );
                        })() : (
                          <span>
                            {isSolar
                              ? `☀️ Solar Panel Array (+${totalStructKw.toFixed(1)} kW)`
                              : isTurbine
                              ? `💨 Wind Turbine Generator (+${totalStructKw.toFixed(1)} kW)`
                              : nearbyStructure.type === 'torii_gate'
                              ? `⛩️ Torii Gate (${nearbyStructure.orientation === 'vertical' ? '1x3' : '3x1'})`
                              : nearbyStructure.type === 'decor_pebble_path'
                              ? '🪨 Zen Pebble Stepping Path'
                              : nearbyStructure.type === 'decor_rock_formation'
                              ? '🪨 Zen Rock Formation'
                              : nearbyStructure.type === 'decor_shrubbery_bush'
                              ? '🌿 Topiary Shrubbery Bush'
                              : nearbyStructure.type === 'decor_woven_wall'
                              ? '🎋 Woven Wooden Lattice Wall'
                              : nearbyStructure.type === 'crystal_pedestal_foliage'
                              ? '💎 Emerald Leaf Crystal Pedestal'
                              : nearbyStructure.type === 'crystal_pedestal_branches'
                              ? '💎 Amber Branch Crystal Pedestal'
                              : nearbyStructure.type === 'crystal_pedestal_trunk'
                              ? '💎 Coral Trunk Crystal Pedestal'
                              : nearbyStructure.type === 'crystal_pedestal_roots'
                              ? '💎 Azure Root Crystal Pedestal'
                              : '💎 Crystal Pedestal'}
                          </span>
                        )}

                        {isEnergy && (
                          <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold border ${hasBonus ? 'bg-amber-500/20 text-amber-300 border-amber-500/50' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>
                            {resonanceLabel}
                          </span>
                        )}
                      </div>

                      <div className="text-[11px] text-emerald-400">
                        {nearbyStructure.type === 'torii_gate'
                          ? `Torii Gate (${nearbyStructure.orientation === 'vertical' ? '1x3' : '3x1'}) • [E / A] Inspect • [Q / Y] Store`
                          : isCompost
                          ? compostReady > 0
                            ? '[E / A] Collect Compost | [Q / Y] Store to Bag'
                            : compostWaste > 0
                            ? `[E / A] Add Waste (${inv.organic_waste || 0} avail) | [Q / Y] Store to Bag`
                            : '[E / A] Deposit Waste | [Q / Y] Store to Bag'
                          : isWell
                          ? isWatering
                            ? '[Q / Y] Store to Bag'
                            : '[E / A] Draw Water (20s) | [Q / Y] Store to Bag'
                          : isEnergy
                          ? `[E / A] Inspect | [Q / Y] Store to Bag • ${resonanceLabel}`
                          : nearbyStructure.type.startsWith('crystal_pedestal')
                          ? '[E / A] Store into Inventory'
                          : '[Q / Y] Store to Bag'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isCompost && (
                      <button
                        onClick={() => interactCompostHeapDirect(nearbyStructure.id)}
                        className={`font-bold text-xs px-3 py-2 rounded-xl flex items-center gap-1 shadow transition-transform active:scale-95 min-h-[38px] ${
                          compostReady > 0
                            ? 'bg-lime-600 hover:bg-lime-500 text-white animate-pulse'
                            : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                        }`}>
                        <span>{compostReady > 0 ? '🌾' : '🍂'}</span>
                        <span>
                          {compostReady > 0
                            ? `[E / A] Collect (${compostReady})`
                            : `[E / A] Deposit Waste (${inv.organic_waste || 0})`}
                        </span>
                      </button>
                    )}

                    {isWell && !isWatering && (
                      <button
                        onClick={() => drawWaterFromWell(nearbyStructure.id)}
                        className="bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow transition-transform active:scale-95 min-h-[38px]">
                        <Droplets className="w-4 h-4" />
                        <span>[E / A] Draw Water (20s)</span>
                      </button>
                    )}

                    {isEnergy && (
                      <button
                        onClick={() => {
                          setInspectingStructureId(nearbyStructure.id);
                          gameAudio.playCrispClick();
                        }}
                        className="bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow transition-transform active:scale-95 min-h-[38px]">
                        <Wrench className="w-4 h-4" />
                        <span>[E / A] Inspect</span>
                      </button>
                    )}

                    <button
                      onClick={() => dismantleDeployedStructure(nearbyStructure.id)}
                      className="bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs px-3 py-2 rounded-xl flex items-center gap-1 shadow transition-transform active:scale-95 min-h-[38px]">
                      <Package className="w-4 h-4" />
                      <span>{nearbyStructure.type.startsWith('crystal_pedestal') ? '[E / A] Store to Bag' : '[Q / Y] Store to Bag'}</span>
                    </button>
                  </div>
                </>
              );
            })() : nearbyBonsai ? (() => {
              const bSyn = getCachedBonsaiSynergies(nearbyBonsai);

              return (
                <>
                  <div className="flex items-center gap-2">
                    <Sprout className="w-5 h-5 text-emerald-400" />
                    <div>
                      <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5 flex-wrap">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-black border ${getBonsaiGroupBadgeClass(nearbyBonsai.group)}`}>
                          {nearbyBonsai.group}
                        </span>
                        {(() => {
                          const nbMat = getMaturityDef(nearbyBonsai.maturity);
                          return (
                            <span
                              style={{
                                backgroundColor: nbMat.bg,
                                borderColor: nbMat.border,
                                color: nbMat.color,
                                boxShadow: `0 0 8px ${nbMat.color}30`,
                              }}
                              className="text-[10px] px-2 py-0.5 rounded-full font-black border flex items-center gap-1 shadow-sm">
                              <span>{nbMat.kanji}</span>
                              <span>{nbMat.name}</span>
                              <span className="opacity-80 font-mono">({nbMat.multiplier}x)</span>
                            </span>
                          );
                        })()}
                        <span>
                          {nearbyBonsai.name} (Lv.{nearbyBonsai.level} • {calculateBaseAesthetic(nearbyBonsai).total.toFixed(2)} BA)
                        </span>
                        <span className="text-emerald-400 font-medium">[{getBonsaiStyleDef(nearbyBonsai.style).japanese}]</span>
                        <span className="text-emerald-300 font-bold flex items-center gap-0.5">
                          <VerdureIcon className="w-3.5 h-3.5" />
                          <span>+{calculateDonationValue(nearbyBonsai)} Verdure</span>
                        </span>
                        {nearbyBonsai.nature && (() => {
                          const nat = getBonsaiNature(nearbyBonsai.nature);
                          return (
                            <span
                              title={`Nature: ${nat.name} (${nat.descriptor})`}
                              className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-violet-950/80 border border-violet-500/60 text-violet-300">
                              Nature: {nat.name}
                            </span>
                          );
                        })()}
                        {bSyn.isStalled ? (
                          <span className="bg-rose-950 text-rose-200 border border-rose-500 text-[10px] px-2 py-0.5 rounded font-black flex items-center gap-1 shadow animate-pulse">
                            <span>⛔</span>
                            <span>⛔ Stalling Surroundings (Growth Stalled: &gt;4 identical neighbors)</span>
                          </span>
                        ) : (
                          <>
                            {bSyn.hasAdjacentBonsai && (
                              <span className="bg-emerald-950 text-emerald-300 border border-emerald-500/50 text-[10px] px-1.5 py-0.2 rounded font-bold">
                                🌿 Growing Together x{bSyn.bonsaiCount} (+{bSyn.bonsaiCount * 10}% Hydration Growth Speed)
                              </span>
                            )}
                            {bSyn.hasAdjacentWall && (
                              <span className="bg-amber-950 text-amber-300 border border-amber-500/50 text-[10px] px-1.5 py-0.2 rounded font-bold">
                                🎋 Private Growing x{bSyn.wallCount} (+{bSyn.wallCount * 10}% Hydration Growth Speed)
                              </span>
                            )}
                            {bSyn.hasAdjacentRock && (
                              <span className="bg-slate-800 text-slate-200 border border-slate-600 text-[10px] px-1.5 py-0.2 rounded font-bold">
                                🪨 Quick Prune x{bSyn.rockCount} (+{(bSyn.rockCount * 0.25).toFixed(2)}s Pruning Effect)
                              </span>
                            )}
                            {bSyn.hasAdjacentBush && (
                              <span className="bg-emerald-950 text-emerald-300 border border-emerald-500/50 text-[10px] px-1.5 py-0.2 rounded font-bold">
                                🌿 XP Boosted x{bSyn.bushCount} (+{bSyn.bushCount * 15}% Level Up EXP)
                              </span>
                            )}
                            {bSyn.crystalPedestals && bSyn.crystalPedestals.total > 0 && (
                              <span className="bg-purple-950 text-purple-300 border border-purple-500/50 text-[10px] px-1.5 py-0.2 rounded font-bold">
                                🔮 Cultivating Potential ({formatCrystalPedestalBonus(bSyn.crystalPedestals)})
                              </span>
                            )}
                            {bSyn.hasAdjacentEnergy && (
                              <span className="bg-amber-950 text-amber-300 border border-amber-500/50 text-[10px] px-1.5 py-0.2 rounded font-bold">
                                ⚠️ Disrupted Zen x{bSyn.energyCount} (-{bSyn.energyCount * 10}% Growth Penalty)
                              </span>
                            )}
                          </>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {bSyn.isStalled ? (
                          <span className="text-rose-400 font-bold">
                            ⛔ Stalling Surroundings: 0% Growth Rate • Space/Prune Stalled (&gt;4 {bSyn.stalledEntityLabel || 'identical neighbors'})
                          </span>
                        ) : (
                          <span>
                            [E / A] Inspect • [Space / X] Quick Prune • [Q / Y] Bonsai Menu • Growth: x{bSyn.growthMultiplier.toFixed(2)}{nearbyBonsai.wateredTimer && nearbyBonsai.wateredTimer > 0 ? ` • 💧 Hydrated: ${nearbyBonsai.wateredTimer.toFixed(1)}s` : ''}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {inv.organic_compost > 0 && nearbyBonsai.level < 100 && (
                      <button
                        onClick={() => applyOrganicCompost(nearbyBonsai.id)}
                        className={`font-bold text-xs px-2.5 py-2 rounded-xl flex items-center gap-1 shadow transition-transform active:scale-95 min-h-[38px] ${
                          bSyn.isStalled
                            ? 'bg-slate-800 text-slate-500 border border-slate-700'
                            : 'bg-lime-600 hover:bg-lime-500 text-white'
                        }`}>
                        <span>🌾</span>
                        <span>[C] Compost ({inv.organic_compost})</span>
                      </button>
                    )}

                    <button
                      onClick={() => manualPruneBonsai(nearbyBonsai.id)}
                      className={`font-bold text-xs px-2.5 py-2 rounded-xl flex items-center gap-1 shadow transition-transform active:scale-95 min-h-[38px] ${
                        bSyn.isStalled
                          ? 'bg-rose-950 text-rose-300 border border-rose-500/80 hover:bg-rose-900'
                          : 'bg-pink-600 hover:bg-pink-500 text-white'
                      }`}>
                      <Scissors className="w-4 h-4" />
                      <span>{bSyn.isStalled ? 'Prune (Stalled)' : '[Space / X] Prune'}</span>
                    </button>

                    <button
                      onClick={() => {
                        setQuickRadialBonsai(nearbyBonsai);
                        gameAudio.playCrispClick();
                      }}
                      className="bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs px-2.5 py-2 rounded-xl flex items-center gap-1 shadow transition-transform active:scale-95 min-h-[38px]"
                      title="Open Quick Radial Cross Menu [Q / Y]">
                      <span>🪴</span>
                      <span>[Q / Y] Menu</span>
                    </button>

                    <button
                      onClick={() => {
                        setInspectingBonsaiId(nearbyBonsai.id);
                        gameAudio.playCrispClick();
                      }}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3 py-2 rounded-xl flex items-center gap-1 shadow transition-transform active:scale-95 min-h-[38px]">
                      <Wrench className="w-4 h-4" />
                      <span>[E / A] Inspect</span>
                    </button>
                  </div>
                </>
              );
            })() : standingPlot ? (
              <>
                <div className="flex items-center gap-2">
                  <Sprout className="w-5 h-5 text-emerald-400" />
                  <div>
                    <div className="text-xs font-bold text-emerald-300">
                      Empty Nursery Plot ({standingPlot.col + 1}, {standingPlot.row + 1})
                    </div>
                    <div className="text-[11px] text-slate-400">Ready for bonsai planting or clean energy generator</div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setIsPlantingModalOpen(true);
                    gameAudio.playCrispClick();
                  }}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow transition-transform active:scale-95 min-h-[38px] border border-emerald-400/50">
                  <Sprout className="w-4 h-4 text-emerald-200" />
                  <span>[E / A] Deploy Bonsai or Item</span>
                </button>
              </>
            ) : (
              <div className="w-full text-center text-xs text-slate-400">
                <span>[WASD / Stick] Walk • [E / A] Interact • [I / +] Inventory • [Esc / -] Settings</span>
              </div>
            )}
          </div>
        )}

        {/* EXCURSION ROVER BOTTOM CONTROLS & VOLUNTARY RESOURCE / SEEDLING COLLECTION */}
        {location === 'EXCURSION' && !excursionReport && !digStateRef.current.active && !excavationResult && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-slate-900/95 border border-slate-800 px-4 py-2.5 rounded-2xl flex items-center gap-4 shadow-2xl z-20 max-w-xl w-full justify-between text-xs">
            <div className="flex items-center gap-2">
              <Compass className="w-5 h-5 text-amber-400 animate-spin-slow" />
              <div>
                <div className="font-bold text-slate-200">
                  {zoneInfo.name} (Dist: {currentDist} steps)
                </div>
                <div className="text-[11px] text-slate-400">
                  Base: [{rover.tileX > 0 ? `-${rover.tileX}` : `+${Math.abs(rover.tileX)}`}, {rover.tileY > 0 ? `-${rover.tileY}` : `+${Math.abs(rover.tileY)}`}] • Battery: {rover.batteryKwh} kWh • Radar: {getRoverVisionRadius()} steps
                </div>
              </div>
            </div>

            {/* Check for node at rover position (strictly exact tile, no adjacent search) */}
            {(() => {
              const currentKey = `${rover.tileX},${rover.tileY}`;
              const targetNode = excursionNodesRef.current.get(currentKey);

              if (targetNode && !targetNode.collected) {
                if (targetNode.type === 'SAPLING') {
                  const curWeight = getCargoWeight();
                  const maxWeight = getMaxRoverCargo();
                  const canFit = curWeight + ITEM_WEIGHTS.sapling <= maxWeight;

                  return (
                    <button
                      onClick={() => triggerRadialDig(targetNode!)}
                      disabled={!canFit}
                      className={`font-bold px-3 py-1.5 rounded-xl shadow transition-transform active:scale-95 flex items-center gap-1.5 ${
                        canFit
                          ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 animate-pulse'
                          : 'bg-red-900/80 text-red-200 border border-red-500/50 cursor-not-allowed'
                      }`}>
                      <Sprout className="w-4 h-4" />
                      <span>{canFit ? `[E] Dig Wild Seedling (3.0 kg)` : `[Cargo Bed Full (${curWeight}/${maxWeight}kg)]`}</span>
                    </button>
                  );
                } else if (targetNode.type === 'RESOURCE' && targetNode.resourceType) {
                  const rt = targetNode.resourceType;
                  const isDoubleScrap = rt === 'scrap_metal_double';
                  const isDoubleWire = rt === 'copper_wire_double';
                  const weight = ITEM_WEIGHTS[rt] || 0.8;
                  const curWeight = getCargoWeight();
                  const maxWeight = getMaxRoverCargo();
                  const canFit = curWeight + weight <= maxWeight;
                  const remainingSpace = maxWeight - curWeight;
                  const singleWeight = isDoubleScrap ? 0.8 : isDoubleWire ? 0.5 : weight;

                  const nameMap: Record<string, string> = {
                    scrap_metal: 'Scrap Metal',
                    copper_wire: 'Copper Wire',
                    brass_gears: 'Brass Gear',
                    circuit_boards: 'Circuit Board',
                    electronic_chips: 'Electronic Chip',
                    scrap_metal_double: 'Heavy Scrap Metal (2x)',
                    copper_wire_double: 'Heavy Copper Wire (2x)',
                  };

                  let btnLabel = `[E] Collect ${nameMap[rt] || 'Resource'} (${weight}kg)`;
                  if (!canFit) {
                    if ((isDoubleScrap || isDoubleWire) && remainingSpace >= singleWeight) {
                      btnLabel = `[Requires 2 cargo slots - only 1 left]`;
                    } else {
                      btnLabel = `[Backpack Full - ${curWeight}/${maxWeight}kg]`;
                    }
                  }

                  return (
                    <button
                      onClick={collectCurrentRoverResource}
                      disabled={!canFit}
                      className={`font-bold px-3 py-1.5 rounded-xl shadow transition-transform active:scale-95 flex items-center gap-1.5 ${
                        canFit
                          ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 animate-pulse'
                          : 'bg-red-900/80 text-red-200 border border-red-500/50 cursor-not-allowed'
                      }`}>
                      <Package className="w-4 h-4" />
                      <span>{btnLabel}</span>
                    </button>
                  );
                }
              }

              if (rover.tileX === 0 && rover.tileY === 0) {
                return (
                  <button
                    onClick={() => finishExcursion(false)}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-xl shadow transition-transform active:scale-95">
                    ✅ Return to Sanctuary (100%)
                  </button>
                );
              }

              return (
                <span className="text-slate-400 text-[11px] hidden sm:inline">
                  [WASD / Stick] Drive • [E / A] Interact • [Space / X] Strike Needle • [Esc / B] Leave
                </span>
              );
            })()}
          </div>
        )}



        {/* MOBILE DIG / CANCEL BUTTONS */}
        {location === 'EXCURSION' && digStateRef.current.active && (
          <div className="absolute bottom-6 right-6 z-30 flex flex-col gap-2">
            <button
              onClick={executeDigAttempt}
              className="w-20 h-20 bg-amber-500 hover:bg-amber-400 active:scale-95 text-black font-black text-sm rounded-full shadow-2xl border-4 border-amber-300 flex flex-col items-center justify-center">
              <span>DIG!</span>
              <span className="text-[10px]">TAP</span>
            </button>
            <button
              onClick={cancelDiggingMinigame}
              className="bg-slate-800/90 text-red-300 border border-red-500/50 hover:bg-slate-700 text-xs font-bold py-1.5 px-3 rounded-xl">
              Leave Site (ESC)
            </button>
          </div>
        )}
      </div>

      {/* QUICK BONSAI RADIAL CROSS MENU OVERLAY [Q / Y BUTTON] */}
      {quickRadialBonsai && (
        <QuickBonsaiRadialMenu
          bonsai={quickRadialBonsai}
          inventory={sanctuaryInventoryRef.current}
          onSell={(id) => donatePlantedBonsai(id)}
          onStore={(id) => pickUpBonsaiToInventory(id)}
          onCompost={(id) => applyOrganicCompost(id)}
          onClose={() => setQuickRadialBonsai(null)}
        />
      )}

      {/* ========================================================================= */}
      {/* MODAL: PLANT OR DEPLOY ON GRID PLOT ('P' KEY) - DEPLOYMENT MODAL */}
      {/* ========================================================================= */}
      <DeploymentModal
        isOpen={isPlantingModalOpen}
        onClose={() => {
          setIsPlantingModalOpen(false);
          setStylingModalSapling(null);
        }}
        inventory={sanctuaryInventoryRef.current}
        seedlingList={sanctuaryInventoryRef.current.seedlingList || []}
        storedBonsais={storedPottedBonsaisRef.current}
        plantedBonsais={plantedBonsaisRef.current}
        deployedStructures={deployedStructuresRef.current}
        onPlantSeedling={plantIndividualSeedling}
        onPlantStoredBonsai={plantStoredPottedBonsai}
        onDeployStructure={deployStructureOnGrid}
        onStartPlacementPreview={handleStartPlacementPreview}
        onOpenFullInventory={() => {
          setIsPlantingModalOpen(false);
          setIsUnifiedStorageOpen(true);
        }}
        initialSelectedSeedling={stylingModalSapling}
      />

      {/* ========================================================================= */}
      {/* MODAL: INSPECT DEPLOYED GENERATOR STRUCTURE (SOLAR / TURBINE) */}
      {/* ========================================================================= */}
      {inspectingStructureId && (() => {
        const struct = deployedStructuresRef.current.find((s) => s.id === inspectingStructureId);
        if (!struct) return null;

        const isSolar = struct.type === 'solar_panel';
        const isTurbine = struct.type === 'wind_turbine';
        const isEnergy = isSolar || isTurbine;
        if (!isEnergy) return null; // Decorations do not have an inspection modal

        const solarInfo = isSolar ? getSolarPanelOutput(struct, deployedStructuresRef.current) : null;
        const turbineInfo = isTurbine ? getWindTurbineOutput(struct, deployedStructuresRef.current) : null;

        const baseKw = isSolar ? 3 : 6;
        const resonanceKw = isSolar ? (solarInfo?.resonance || 0) : (turbineInfo?.resonance || 0);
        const neighborCount = isSolar ? (solarInfo?.count || 0) : (turbineInfo?.count || 0);
        const totalOutput = isSolar ? (solarInfo?.total || 3) : (turbineInfo?.total || 6);
        const resName = isSolar ? 'Solar' : 'Wind';

        const nameMap: Record<string, {name: string; icon: string; desc: string}> = {
          solar_panel: {
            name: `Solar Panel Array (+${totalOutput.toFixed(1)} kW)`,
            icon: '☀️',
            desc: 'Crystalline photovoltaic array capturing greenhouse sunlight. Base Output: 3 kW. Stackable Resonance: +0.5 kW per adjacent Solar Panel in the surrounding 3x3 zone.',
          },
          wind_turbine: {
            name: `Wind Turbine Generator (+${totalOutput.toFixed(1)} kW)`,
            icon: '💨',
            desc: 'Brass aero-helix micro-turbine harnessing ventilation airflow. Base Output: 6 kW. Stackable Resonance: +1.0 kW per adjacent Wind Turbine in the surrounding 3x3 zone.',
          },
        };

        const info = nameMap[struct.type] || {name: 'Clean Generator', icon: '⚡', desc: 'Placed power generator.'};

        return (
          <div className="fixed top-12 left-0 right-0 bottom-0 z-40 bg-slate-950/95 backdrop-blur-md p-3 sm:p-5 flex flex-col overflow-hidden border-t border-slate-800 text-left">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-3 shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{info.icon}</span>
                <div>
                  <h3 className="text-lg font-bold text-slate-100">{info.name}</h3>
                  <span className="text-xs text-emerald-400 font-bold">Status: Active on Sanctuary Grid</span>
                </div>
              </div>
              <button
                onClick={() => setInspectingStructureId(null)}
                className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-w-xl w-full mx-auto space-y-3 flex-1 overflow-y-auto">
              <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 space-y-3">
                <p className="text-xs text-slate-300 leading-relaxed">{info.desc}</p>

                {/* Generator Output Metrics Breakdown */}
                <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Base Generator Power:</span>
                    <strong className="text-slate-200 font-mono">{baseKw} kW</strong>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">3x3 Proximity Resonance Bonus:</span>
                    <strong className={`font-mono ${neighborCount > 0 ? 'text-amber-300 font-bold' : 'text-slate-400'}`}>
                      {neighborCount > 0 ? `+${resonanceKw.toFixed(1)} kW ${resName} Resonance (${neighborCount} neighbors) 🌟` : `0 kW ${resName} Resonance (Place adjacent to another ${isSolar ? 'Solar Panel' : 'Wind Turbine'})`}
                    </strong>
                  </div>

                  <div className="flex items-center justify-between pt-1.5 border-t border-slate-800 font-bold">
                    <span className="text-emerald-400">Total Generator Output:</span>
                    <strong className="text-emerald-300 font-mono text-sm">+{totalOutput.toFixed(1)} kW Clean Electricity</strong>
                  </div>
                </div>

                {/* Overall Grid Telemetry */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block text-[11px]">Total Grid Supply:</span>
                    <strong className="text-sky-300 text-sm font-mono">{power.totalGenerated} kW</strong>
                  </div>

                  <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block text-[11px]">Active Automaton Load:</span>
                    <strong className="text-amber-300 text-sm font-mono">{power.totalRequired} kW</strong>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => dismantleDeployedStructure(struct.id)}
                  className="flex-1 bg-amber-600 hover:bg-amber-500 text-white font-bold py-2.5 rounded-xl transition-all shadow flex items-center justify-center gap-2 min-h-[40px] text-xs active:scale-95">
                  <Package className="w-4 h-4" />
                  <span>📦 [Q] Dismantle to Inventory</span>
                </button>

                <button
                  onClick={() => setInspectingStructureId(null)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-4 py-2.5 rounded-xl transition-colors min-h-[40px] text-xs">
                  Close
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ========================================================================= */}
      {/* MODAL: UNIFIED NURSERY INVENTORY & PLANTING STORAGE */}
      {/* ========================================================================= */}
      <InventoryModal
        isOpen={isUnifiedStorageOpen}
        onClose={() => setIsUnifiedStorageOpen(false)}
        inventory={sanctuaryInventoryRef.current}
        storageTab={storageTab}
        setStorageTab={setStorageTab}
        storedPottedBonsais={storedPottedBonsaisRef.current}
        storedSaplings={storedSaplingsRef.current}
        seedlingList={sanctuaryInventoryRef.current.seedlingList || []}
        plantedBonsais={plantedBonsaisRef.current}
        deployedStructures={deployedStructuresRef.current}
        installedCraftingArms={installedCraftingArmsRef.current}
        autoFabricatorLanesCount={autoFabricatorLanesRef.current.length}
        onPlantStoredBonsai={plantStoredPottedBonsai}
        onPlantSaplingClick={(sap) => {
          setIsUnifiedStorageOpen(false);
          setStylingModalSapling(sap);
          setIsPlantingModalOpen(true);
          gameAudio.playCrispClick();
        }}
      />

      {/* ========================================================================= */}
      {/* MODAL: ROVER GARAGE BAY (EXPEDITIONS & MODULAR LOADOUT) */}
      {/* ========================================================================= */}
      {isBiomeSelectOpen && (() => {
        const chassisTier = inv.rover_chassis_tier || 1;
        const maxSlots = getRoverChassisMaxSlots(chassisTier);
        const attached = inv.attached_rover_modules || [];
        const effBattery = getMaxRoverBattery();
        const effCargo = getMaxRoverCargo();
        const effVision = getRoverVisionRadius();
        const ALL_ROVER_MODULE_KEYS: RoverModuleType[] = [
          'storage_1',
          'storage_2',
          'storage_3',
          'battery_1',
          'battery_2',
          'battery_3',
          'radar_1',
          'radar_2',
          'radar_3',
        ];
        const totalUnattached = ALL_ROVER_MODULE_KEYS.reduce(
          (acc, k) => acc + (inv.rover_modules[k] || 0),
          0,
        );

        return (
          <div className="fixed top-12 left-0 right-0 bottom-0 z-40 bg-slate-950/95 backdrop-blur-md p-3 sm:p-5 flex flex-col overflow-hidden border-t border-slate-800 text-left">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-3 shrink-0">
              <div className="flex items-center gap-3">
                <Truck className="w-6 h-6 text-cyan-400" />
                <div className="flex items-center gap-3 flex-wrap">
                  <h2 className="text-xl font-bold text-cyan-100">Rover Garage Bay</h2>
                  <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-cyan-900/60 border border-cyan-500/30 text-cyan-300">
                    Tier {chassisTier}: {getRoverChassisName(chassisTier)}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsBiomeSelectOpen(false)}
                className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Top-Level Tabs Switcher */}
            <div className="grid grid-cols-2 gap-2 mb-3 shrink-0">
              <button
                onClick={() => {
                  setGarageTab('expeditions');
                  gameAudio.playCrispClick();
                }}
                className={`py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all shadow ${
                  garageTab === 'expeditions'
                    ? 'bg-amber-600 text-white ring-2 ring-amber-400/40'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-750'
                }`}>
                <Truck className="w-4 h-4" />
                <span>🚜 Expeditions</span>
                <span className="text-[10px] bg-slate-950/60 px-1.5 py-0.5 rounded-full font-mono text-amber-300">
                  3 Regions
                </span>
              </button>

              <button
                onClick={() => {
                  setGarageTab('loadout');
                  gameAudio.playCrispClick();
                }}
                className={`py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all shadow ${
                  garageTab === 'loadout'
                    ? 'bg-sky-600 text-white ring-2 ring-sky-400/40'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-750'
                }`}>
                <Wrench className="w-4 h-4" />
                <span>⚙️ Rover Loadout</span>
                <span className="text-[10px] bg-slate-950/60 px-1.5 py-0.5 rounded-full font-mono text-sky-300">
                  {attached.length} / {maxSlots} Slots
                </span>
              </button>
            </div>

            {/* TAB 1: EXPEDITIONS DEPARTURE & CODEX */}
            {garageTab === 'expeditions' && (
              <div className="flex-1 space-y-3 mb-3 overflow-y-auto pr-1">
                {(['FOOTHILLS', 'HIGHLANDS', 'OVERGROWTH'] as ExpeditionBiomeId[]).map((biomeId, bIdx) => {
                  const b = getExpeditionBiomeDef(biomeId);
                  const reqKey = b.requiredMapKey;
                  const isUnlocked = b.unlockedByDefault || (reqKey ? inv[reqKey] : false);
                  const isFocused = focusedGarageIdx === bIdx;

                  return (
                    <div
                      key={biomeId}
                      style={{borderColor: isFocused ? '#38bdf8' : isUnlocked ? b.accentColor : '#334155'}}
                      className={`p-3.5 sm:p-4 rounded-2xl border-2 transition-all ${
                        isFocused
                          ? 'bg-slate-850 ring-4 ring-sky-400 shadow-[0_0_20px_rgba(56,189,248,0.5)] scale-[1.01]'
                          : isUnlocked
                          ? 'bg-slate-900/90 hover:bg-slate-850'
                          : 'bg-slate-900/50 opacity-80'
                      }`}>
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex items-center gap-2.5">
                          <div
                            style={{backgroundColor: isUnlocked ? b.themeColor : '#334155'}}
                            className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shrink-0 shadow">
                            {biomeId === 'FOOTHILLS' ? <Trees className="w-5 h-5" /> : biomeId === 'HIGHLANDS' ? <Mountain className="w-5 h-5" /> : <Flower2 className="w-5 h-5" />}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-sm sm:text-base text-slate-100 flex items-center gap-1.5">
                                {isFocused && <span className="text-sky-400 text-xs">► [E/A]</span>}
                                <span>{b.name}</span>
                              </h4>
                              <span
                                style={{backgroundColor: `${b.themeColor}25`, color: b.accentColor}}
                                className="text-[10px] font-bold px-2 py-0.5 rounded-full border border-current">
                                ⚡ {b.batteryCostPerStep} kWh / Step
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-400">{b.subtitle}</span>
                          </div>
                        </div>

                        {isUnlocked ? (
                          <button
                            onClick={() => startBiomeExcursion(biomeId)}
                            style={{backgroundColor: b.themeColor}}
                            className={`hover:opacity-90 text-white font-bold text-xs px-4 py-2 rounded-xl shadow transition-transform active:scale-95 flex items-center gap-1 shrink-0 ${
                              isFocused ? 'ring-2 ring-white scale-105' : ''
                            }`}>
                            <span>Depart Rover [E/A]</span>
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        ) : (
                          <div className="flex items-center gap-1.5 bg-slate-800/90 text-amber-300 px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 border border-slate-700">
                            <Lock className="w-3.5 h-3.5 text-amber-400" />
                            <span>Locked</span>
                          </div>
                        )}
                      </div>

                      <p className="text-xs text-slate-300 mb-2.5">{b.description}</p>

                      {/* ROVER GARAGE DISCOVERY CODEX ("FOG-OF-WAR" AREA EXPLORATION GRID) */}
                      <div className="bg-slate-950/80 border border-slate-800/90 rounded-2xl p-3 space-y-2.5 mb-2">
                        {/* Row 1: Bonsai Species (Seedling Foliage Preview) */}
                        <div>
                          <div className="text-[10px] font-bold text-emerald-400/90 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                            <Sprout className="w-3 h-3 text-emerald-400" />
                            <span>Bonsai Species</span>
                          </div>
                          <div className="flex flex-wrap items-center gap-1.5">
                            {(BIOME_CODEX_SPECIES[biomeId] || []).map((leafType) => (
                              <CodexSeedlingBox
                                key={leafType}
                                leafType={leafType}
                                discovered={(areaDiscoveryRef.current.species[biomeId] || []).includes(leafType)}
                              />
                            ))}
                          </div>
                        </div>

                        {/* Row 2: Maturity Ratings (Kanji Characters) */}
                        <div>
                          <div className="text-[10px] font-bold text-amber-400/90 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                            <Award className="w-3 h-3 text-amber-400" />
                            <span>Maturity Ratings</span>
                          </div>
                          <div className="flex flex-wrap items-center gap-1.5">
                            {(BIOME_CODEX_MATURITIES[biomeId] || []).map((matTier) => (
                              <CodexMaturityBox
                                key={matTier}
                                matDef={getMaturityDef(matTier)}
                                discovered={(areaDiscoveryRef.current.maturities[biomeId] || []).includes(matTier)}
                              />
                            ))}
                          </div>
                        </div>

                        {/* Row 3: Expedition Resources */}
                        <div>
                          <div className="text-[10px] font-bold text-sky-400/90 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                            <Package className="w-3 h-3 text-sky-400" />
                            <span>Expedition Resources</span>
                          </div>
                          <div className="flex flex-wrap items-center gap-1.5">
                            {(BIOME_CODEX_RESOURCES[biomeId] || []).map((resKey) => (
                              <CodexResourceBox
                                key={resKey}
                                resKey={resKey}
                                discovered={(areaDiscoveryRef.current.resources[biomeId] || []).includes(resKey)}
                              />
                            ))}
                          </div>
                        </div>
                      </div>

                      {!isUnlocked && (
                        <div className="mt-2 text-xs font-semibold text-amber-400 flex items-center gap-2 bg-amber-950/40 p-2 rounded-xl border border-amber-500/30">
                          <Lock className="w-3.5 h-3.5 shrink-0" />
                          <span>Locked: Purchase map at the Botanical Market ({b.mapCost} Verdure)</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* TAB 2: ROVER LOADOUT (CHASSIS & MODULAR OUTFITTING) */}
            {garageTab === 'loadout' && (
              <div className="flex-1 space-y-3 mb-3 overflow-y-auto pr-1">
                {/* 1. Interactive Chassis Overview Card */}
                <div className="bg-slate-900/90 border border-sky-500/40 p-4 rounded-2xl shadow-lg space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-900 to-indigo-950 border-2 border-sky-400/60 flex items-center justify-center text-2xl shadow">
                        {chassisTier === 3 ? '👑' : chassisTier === 2 ? '🚜' : '🚙'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="bg-sky-950 text-sky-300 border border-sky-500/60 text-xs px-2.5 py-0.5 rounded-full font-black">
                            Tier {chassisTier}
                          </span>
                          <h4 className="text-base sm:text-lg font-black text-slate-100">
                            {getRoverChassisName(chassisTier)}
                          </h4>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {chassisTier === 3
                            ? 'Vanguard Heavy Chassis: 10 upgrade slots for extended wilderness operations.'
                            : chassisTier === 2
                            ? 'Surveyor Chassis: 5 upgrade slots with reinforced load brackets.'
                            : 'Scout Chassis: 3 upgrade slots. Upgrade at Workbench for more module capacity.'}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xs text-slate-400 font-semibold">Chassis Module Slots</div>
                      <div className="text-lg font-black text-sky-300 font-mono">
                        {attached.length} / {maxSlots} Slots Used
                      </div>
                    </div>
                  </div>

                  {/* Telemetry Stats Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2 border-t border-slate-800 text-xs">
                    <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">Max Battery:</span>
                      <strong className="text-amber-300 text-sm font-mono">{effBattery} kWh</strong>
                      <span className="text-[10px] text-slate-500 block">Base 50 + {effBattery - 50} kWh</span>
                    </div>

                    <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">Max Cargo Payload:</span>
                      <strong className="text-emerald-300 text-sm font-mono">{effCargo} kg</strong>
                      <span className="text-[10px] text-slate-500 block">Base 15.0 + {(effCargo - 15.0).toFixed(1)} kg</span>
                    </div>

                    <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">Radar Vision:</span>
                      <strong className="text-sky-300 text-sm font-mono">{effVision} Steps</strong>
                      <span className="text-[10px] text-slate-500 block">Base 2 + {effVision - 2} Steps</span>
                    </div>

                    <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">Attached Modules:</span>
                      <strong className="text-sky-300 text-sm font-mono">{attached.length} Installed</strong>
                      <span className="text-[10px] text-slate-500 block">{maxSlots - attached.length} Free Bays</span>
                    </div>

                    <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">Unattached Storage:</span>
                      <strong className="text-slate-200 text-sm font-mono">{totalUnattached} in Bag</strong>
                      <span className="text-[10px] text-slate-500 block">Spare Modules</span>
                    </div>
                  </div>
                </div>

                {/* 2. Visual Grid of Chassis Module Slots (10 Total Visualized) */}
                <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-slate-200">
                      <span>⚙️ Chassis Module Bays (Slots 1 - 10)</span>
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono">
                      Active: {maxSlots} Slots • {10 - maxSlots > 0 ? `${10 - maxSlots} Locked` : 'All Unlocked'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {Array.from({ length: 10 }).map((_, slotIdx) => {
                      const isSlotActive = slotIdx < maxSlots;
                      const equippedMod = isSlotActive ? attached[slotIdx] : null;
                      const modCfg = equippedMod ? ROVER_MODULE_CONFIGS[equippedMod] : null;

                      if (!isSlotActive) {
                        return (
                          <div
                            key={slotIdx}
                            className="bg-slate-950/60 border border-dashed border-slate-800 p-2.5 rounded-xl flex flex-col items-center justify-center text-center gap-1 opacity-60">
                            <Lock className="w-4 h-4 text-slate-600" />
                            <span className="text-[10px] font-bold text-slate-500 font-mono">
                              Bay {slotIdx + 1}
                            </span>
                            <span className="text-[9px] text-amber-400/80 font-semibold line-clamp-1">
                              {slotIdx < 5 ? 'T2 Chassis' : 'T3 Chassis'}
                            </span>
                          </div>
                        );
                      }

                      if (equippedMod && modCfg) {
                        return (
                          <div
                            key={slotIdx}
                            className="bg-slate-950 border border-sky-500/60 p-2.5 rounded-xl flex flex-col justify-between gap-1 shadow-md">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-mono font-bold text-sky-400">
                                Bay {slotIdx + 1}
                              </span>
                              <span className="text-sm">{modCfg.icon}</span>
                            </div>
                            <div className="my-0.5">
                              <div className="text-[11px] font-bold text-slate-100 truncate">
                                {modCfg.name}
                              </div>
                              <div className={`text-[10px] font-bold ${
                                modCfg.category === 'battery'
                                  ? 'text-amber-300'
                                  : modCfg.category === 'radar'
                                  ? 'text-sky-300'
                                  : 'text-emerald-300'
                              }`}>
                                {modCfg.bonusLabel}
                              </div>
                            </div>
                            <button
                              onClick={() => detachRoverModule(slotIdx)}
                              className="w-full bg-slate-800 hover:bg-red-950 text-slate-300 hover:text-red-300 border border-slate-700 hover:border-red-500/60 text-[10px] font-bold py-1 rounded-lg transition-all active:scale-95">
                              Detach
                            </button>
                          </div>
                        );
                      }

                      return (
                        <div
                          key={slotIdx}
                          className="bg-slate-950/80 border border-dashed border-sky-500/40 p-2.5 rounded-xl flex flex-col items-center justify-center text-center gap-1">
                          <span className="text-[10px] font-mono font-bold text-sky-400/70">
                            Bay {slotIdx + 1}
                          </span>
                          <span className="text-[11px] font-bold text-slate-400">
                            Available Slot
                          </span>
                          <span className="text-[9px] text-slate-500">
                            Attach below
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Unattached Modules in Inventory Storage */}
                <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-2xl space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-emerald-300">
                      <Package className="w-4 h-4" />
                      <span>Unattached Modules in Storage ({totalUnattached})</span>
                    </div>
                    <span className="text-[11px] text-slate-400">
                      Craft more at Artisan Workbench
                    </span>
                  </div>

                  {totalUnattached === 0 && (
                    <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 text-center space-y-1.5">
                      <p className="text-xs text-slate-300 font-semibold">
                        No unattached modules in storage.
                      </p>
                      <p className="text-[11px] text-slate-400 leading-relaxed max-w-md mx-auto">
                        Craft <strong>Storage Modules (I-III)</strong>, <strong>Battery Modules (I-III)</strong>, or <strong>Radar Modules (I-III)</strong> in the <strong>Workbench</strong> (Rover tab), or purchase blueprints at the Botanical Market!
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {ALL_ROVER_MODULE_KEYS.map((mKey, mIdx) => {
                      const cfg = ROVER_MODULE_CONFIGS[mKey];
                      const inStock = inv.rover_modules[mKey] || 0;
                      const isFull = attached.length >= maxSlots;
                      const canAttach = inStock > 0 && !isFull;
                      const isFocused = focusedGarageIdx === mIdx;

                      return (
                        <div
                          key={mKey}
                          className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                            isFocused
                              ? 'bg-slate-850 border-sky-300 ring-4 ring-sky-400 scale-[1.01] shadow-[0_0_15px_rgba(56,189,248,0.5)]'
                              : inStock > 0
                              ? 'bg-slate-950/90 border-slate-700 shadow-sm'
                              : 'bg-slate-950/40 border-slate-850 opacity-60'
                          }`}>
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="text-2xl shrink-0">{cfg.icon}</span>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <h5 className="font-bold text-xs text-slate-100 truncate">
                                  {isFocused && <span className="text-sky-400 mr-1">► [E/A]</span>}
                                  {cfg.name}
                                </h5>
                                <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${
                                  cfg.category === 'battery'
                                    ? 'bg-amber-950/80 text-amber-300 border-amber-500/50'
                                    : cfg.category === 'radar'
                                    ? 'bg-sky-950/80 text-sky-300 border-sky-500/50'
                                    : 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50'
                                }`}>
                                  {cfg.bonusLabel}
                                </span>
                              </div>
                              <span className="text-[10px] text-slate-400 block mt-0.5 line-clamp-1">
                                {cfg.description} • Stock: <strong className={inStock > 0 ? 'text-sky-300 font-mono' : 'text-slate-500 font-mono'}>{inStock}</strong>
                              </span>
                            </div>
                          </div>

                          <button
                            disabled={!canAttach}
                            onClick={() => attachRoverModule(mKey)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all shadow ${
                              canAttach
                                ? 'bg-sky-600 hover:bg-sky-500 text-white active:scale-95'
                                : inStock <= 0
                                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                : 'bg-slate-800 text-amber-400/80 cursor-not-allowed'
                            }`}>
                            {inStock <= 0 ? 'No Stock' : isFull ? 'Bays Full' : 'Attach (+)'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* FOOTER CONTROLLER & KEYBOARD PROMPTS STRIP */}
            <div className="pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 shrink-0 mt-1">
              <span className="font-mono text-cyan-400 text-[11px] hidden sm:inline">
                🎮 [A/D / LB/RB] Switch Tabs • [W/S] Select • [E / A] Depart/Equip • [Arrows / R-Stick] Scroll • [Esc / B] Close
              </span>
              <button
                onClick={() => setIsBiomeSelectOpen(false)}
                className="px-5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold transition-all border border-slate-700">
                Close [Esc / B]
              </button>
            </div>
          </div>
        );
      })()}

      {/* ========================================================================= */}
      {/* MODAL: BOTANICAL MARKET (MAPS, EXPANSIONS, DECOR, GUIDES, EQUIPMENT) */}
      {/* ========================================================================= */}
      {isShopModalOpen && (
        <div className="fixed top-12 left-0 right-0 bottom-0 z-40 bg-slate-950/95 backdrop-blur-md p-3 sm:p-5 flex flex-col overflow-hidden border-t border-slate-800 text-left">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-3 shrink-0">
            <div className="flex items-center gap-2">
              <Store className="w-5 h-5 text-emerald-400" />
              <h3 className="text-lg font-bold text-emerald-300">🏪 Botanical Merchant Market</h3>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-emerald-950/85 border border-emerald-500/80 px-3 py-1 rounded-xl text-xs font-black text-emerald-300 flex items-center gap-1.5 shadow">
                <VerdureIcon className="w-4 h-4" />
                <span>{inv.coins} Verdure</span>
              </div>
              <button
                onClick={() => setIsShopModalOpen(false)}
                className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Shop Navigation Tabs (5 Harmonized Tabs) */}
          <div className="grid grid-cols-5 gap-1.5 mb-3 shrink-0">
            <button
              onClick={() => setShopTab('MAPS')}
              className={`py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1 transition-all ${
                shopTab === 'MAPS'
                  ? 'bg-sky-600 text-white shadow-md ring-2 ring-sky-400/40'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-750'
              }`}>
              <MapIcon className="w-3.5 h-3.5" />
              <span>🗺️ Maps</span>
            </button>
            <button
              onClick={() => setShopTab('EXPANSIONS')}
              className={`py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1 transition-all ${
                shopTab === 'EXPANSIONS'
                  ? 'bg-emerald-600 text-white shadow-md ring-2 ring-emerald-400/40'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-750'
              }`}>
              <Maximize2 className="w-3.5 h-3.5" />
              <span>🏡 Plots</span>
            </button>
            <button
              onClick={() => setShopTab('DECOR')}
              className={`py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1 transition-all ${
                shopTab === 'DECOR'
                  ? 'bg-teal-600 text-white shadow-md ring-2 ring-teal-400/40'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-750'
              }`}>
              <span>🎋 Decor</span>
            </button>
            <button
              onClick={() => setShopTab('GUIDES')}
              className={`py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1 transition-all ${
                shopTab === 'GUIDES'
                  ? 'bg-lime-600 text-white shadow-md ring-2 ring-lime-400/40'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-750'
              }`}>
              <BookOpen className="w-3.5 h-3.5" />
              <span>📚 Guides</span>
            </button>
            <button
              onClick={() => setShopTab('EQUIPMENT')}
              className={`py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1 transition-all ${
                shopTab === 'EQUIPMENT'
                  ? 'bg-amber-600 text-white shadow-md ring-2 ring-amber-400/40'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-750'
              }`}>
              <Wrench className="w-3.5 h-3.5" />
              <span>⚡ Equipment</span>
            </button>
          </div>

          {/* TAB 1: CARTOGRAPHY & MAPS */}
          {shopTab === 'MAPS' && (
            <div className="flex-1 space-y-3 mb-3 overflow-y-auto pr-1">
              <div className="text-xs text-slate-400 bg-slate-900/60 p-2.5 rounded-2xl border border-slate-800 flex items-center gap-2">
                <Info className="w-4 h-4 text-sky-400 shrink-0" />
                <span>
                  Purchased charts permanently unlock new wilderness regions with rich resource densities and rare saplings!
                </span>
              </div>

              {/* Map 1: Misty Highlands Chart */}
              <div className={`border p-4 rounded-2xl flex flex-col gap-2 transition-all ${
                focusedShopIdx === 0
                  ? 'bg-slate-850 ring-4 ring-sky-400 border-sky-300 scale-[1.01] shadow-[0_0_20px_rgba(56,189,248,0.5)]'
                  : 'bg-slate-900/80 border-slate-800'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-sky-950/80 border border-sky-500/50 flex items-center justify-center overflow-hidden">
                      {assets['map_item']?.src ? (
                        <img src={assets['map_item'].src} alt="Map" className="w-8 h-8 object-contain" />
                      ) : (
                        <MapIcon className="w-6 h-6 text-sky-400" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm sm:text-base text-slate-100 flex items-center gap-2">
                        {focusedShopIdx === 0 && <span className="text-sky-400 text-xs">► [E/A]</span>}
                        Misty Highlands Chart
                        {inv.has_map_highlands && (
                          <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                            ✓ Owned
                          </span>
                        )}
                      </h4>
                      <span className="text-xs text-sky-300 font-semibold">
                        Unlocks Area 2: Misty Highlands (2 kWh/step)
                      </span>
                    </div>
                  </div>

                  <button
                    disabled={inv.has_map_highlands || inv.coins < 250}
                    onClick={() => buyExpeditionMap('has_map_highlands', 250, 'Misty Highlands')}
                    className={`px-4 py-2 rounded-xl font-bold text-xs transition-all shadow flex items-center gap-1 ${
                      inv.has_map_highlands
                        ? 'bg-slate-800 text-emerald-400 cursor-default border border-emerald-500/30'
                        : inv.coins >= 250
                        ? 'bg-sky-600 hover:bg-sky-500 text-white active:scale-95'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}>
                    {!inv.has_map_highlands && <VerdureIcon className="w-3.5 h-3.5" />}
                    <span>{inv.has_map_highlands ? 'Discovered' : 'Purchase (250 Verdure)'}</span>
                  </button>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  A topographic parchment revealing misty mountain ridges. Contains rich Copper Wire, Brass Gears, Circuit Boards, and Autumn Maple saplings.
                </p>
              </div>

              {/* Map 2: Ancient Overgrowth Map */}
              <div className={`border p-4 rounded-2xl flex flex-col gap-2 transition-all ${
                focusedShopIdx === 1
                  ? 'bg-slate-850 ring-4 ring-purple-400 border-purple-300 scale-[1.01] shadow-[0_0_20px_rgba(168,85,247,0.5)]'
                  : 'bg-slate-900/80 border-slate-800'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-950/80 border border-purple-500/50 flex items-center justify-center overflow-hidden">
                      {assets['map_item']?.src ? (
                        <img src={assets['map_item'].src} alt="Map" className="w-8 h-8 object-contain" />
                      ) : (
                        <MapIcon className="w-6 h-6 text-purple-400" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm sm:text-base text-slate-100 flex items-center gap-2">
                        {focusedShopIdx === 1 && <span className="text-purple-400 text-xs">► [E/A]</span>}
                        Ancient Overgrowth Map
                        {inv.has_map_overgrowth && (
                          <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                            ✓ Owned
                          </span>
                        )}
                      </h4>
                      <span className="text-xs text-purple-300 font-semibold">
                        Unlocks Area 3: Ancient Overgrowth (3 kWh/step)
                      </span>
                    </div>
                  </div>

                  <button
                    disabled={inv.has_map_overgrowth || inv.coins < 800}
                    onClick={() => buyExpeditionMap('has_map_overgrowth', 800, 'Ancient Overgrowth')}
                    className={`px-4 py-2 rounded-xl font-bold text-xs transition-all shadow flex items-center gap-1 ${
                      inv.has_map_overgrowth
                        ? 'bg-slate-800 text-emerald-400 cursor-default border border-emerald-500/30'
                        : inv.coins >= 800
                        ? 'bg-purple-600 hover:bg-purple-500 text-white active:scale-95'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}>
                    {!inv.has_map_overgrowth && <VerdureIcon className="w-3.5 h-3.5" />}
                    <span>{inv.has_map_overgrowth ? 'Discovered' : 'Purchase (800 Verdure)'}</span>
                  </button>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  An ancient runic map leading into primeval forests. High density Electronic Chips, Circuit Boards, and the legendary <strong>Mythic Golden Ginkgo</strong>.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: SANCTUARY GREENHOUSE EXPANSIONS */}
          {shopTab === 'EXPANSIONS' && (
            <div className="flex-1 space-y-2.5 mb-3 overflow-y-auto pr-1">
              <div className="text-xs text-slate-400 bg-slate-900/60 p-2.5 rounded-2xl border border-slate-800 flex items-center gap-2">
                <Info className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  Unlock additional planting plots across the nursery floor to grow and automate more simultaneous bonsais!
                </span>
              </div>

              {SANCTUARY_EXPANSIONS.map((exp, expIdx) => {
                const isOwned = inv.sanctuary_expansion_tier >= exp.tier;
                const isPrevOwned = inv.sanctuary_expansion_tier >= exp.tier - 1;
                const canAfford = inv.coins >= exp.cost;
                const isFocused = focusedShopIdx === expIdx;

                return (
                  <div
                    key={exp.tier}
                    className={`border p-3.5 sm:p-4 rounded-2xl flex flex-col gap-2 transition-all ${
                      isFocused
                        ? 'bg-slate-850 ring-4 ring-emerald-400 border-emerald-300 scale-[1.01] shadow-[0_0_20px_rgba(16,185,129,0.5)]'
                        : 'bg-slate-900/80 border-slate-800'
                    }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-950/80 border border-emerald-500/50 flex items-center justify-center">
                          <Maximize2 className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm sm:text-base text-slate-100 flex items-center gap-2">
                            {isFocused && <span className="text-emerald-400 text-xs">► [E/A]</span>}
                            {exp.name}
                            {isOwned && (
                              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                                ✓ Unlocked
                              </span>
                            )}
                          </h4>
                          <span className="text-xs text-emerald-300 font-semibold">
                            {exp.description}
                          </span>
                        </div>
                      </div>

                      <button
                        disabled={isOwned || !isPrevOwned || !canAfford}
                        onClick={() => buySanctuaryExpansion(exp.tier, exp.cost, exp.name)}
                        className={`px-4 py-2 rounded-xl font-bold text-xs transition-all shadow flex items-center gap-1 ${
                          isOwned
                            ? 'bg-slate-800 text-emerald-400 cursor-default border border-emerald-500/30'
                            : isPrevOwned && canAfford
                            ? 'bg-emerald-600 hover:bg-emerald-500 text-white active:scale-95'
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        }`}>
                        {!isOwned && isPrevOwned && <VerdureIcon className="w-3.5 h-3.5" />}
                        <span>{isOwned ? 'Active' : !isPrevOwned ? 'Requires Prev Tier' : `Unlock (${exp.cost} Verdure)`}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 3: GARDEN DECORATIONS (🎋 DECOR) */}
          {shopTab === 'DECOR' && (
            <div className="flex-1 space-y-2.5 mb-3 overflow-y-auto pr-1">
              <div className="text-xs text-slate-400 bg-slate-900/60 p-2.5 rounded-2xl border border-slate-800 flex items-center gap-2">
                <span className="text-base">🎋</span>
                <span>
                  Purchase decorative zen fixtures and garden structures to place on open nursery plots. Placeable via [P] and dismantlable via [Q]!
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* 1. Zen Pebble Stepping Path (5 Verdure) */}
                <div className={`border p-3.5 rounded-2xl flex flex-col justify-between gap-2 transition-all ${
                  focusedShopIdx === 0
                    ? 'bg-slate-850 ring-4 ring-emerald-400 border-emerald-300 scale-[1.01] shadow-[0_0_20px_rgba(16,185,129,0.5)]'
                    : 'bg-slate-900/80 border-slate-800'
                }`}>
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-xl shrink-0 overflow-hidden">
                          {assets['decor_pebble_path']?.src ? (
                            <img src={assets['decor_pebble_path'].src} alt="Pebble Path" className="w-8 h-8 object-contain" />
                          ) : (
                            <span>🪨</span>
                          )}
                        </div>
                        <div>
                          <h4 className="font-bold text-xs sm:text-sm text-slate-100 flex items-center gap-1.5">
                            {focusedShopIdx === 0 && <span className="text-emerald-400 text-xs">► [E/A]</span>}
                            <span>Zen Pebble Stepping Path</span>
                          </h4>
                          <span className="text-[10px] text-emerald-400 font-bold">+35% player movement speed when traversed</span>
                        </div>
                      </div>
                      <span className="text-xs bg-slate-950 text-emerald-300 border border-slate-700 px-2 py-0.5 rounded-lg font-mono font-bold">
                        Owned: {inv.decor_pebble_path_inv || 0}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Grants +35% movement speed when walking on it. Pure pathway tile (does not cause stalling).
                    </p>
                  </div>

                  <button
                    disabled={inv.coins < 5}
                    onClick={() => buyDecoration('decor_pebble_path', 5, 'Zen Pebble Stepping Path')}
                    className={`w-full py-2 rounded-xl font-bold text-xs transition-all shadow flex items-center justify-center gap-1.5 ${
                      inv.coins >= 5
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white active:scale-95'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}>
                    <VerdureIcon className="w-3.5 h-3.5" />
                    <span>Purchase (5 Verdure)</span>
                  </button>
                </div>

                {/* 2. Zen Rock Formation (15 Verdure) */}
                <div className={`border p-3.5 rounded-2xl flex flex-col justify-between gap-2 transition-all ${
                  focusedShopIdx === 1
                    ? 'bg-slate-850 ring-4 ring-amber-400 border-amber-300 scale-[1.01] shadow-[0_0_20px_rgba(245,158,11,0.5)]'
                    : 'bg-slate-900/80 border-amber-500/30'
                }`}>
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-amber-950/60 border border-amber-500/40 flex items-center justify-center text-xl shrink-0 overflow-hidden">
                          {assets['decor_rock_formation']?.src ? (
                            <img src={assets['decor_rock_formation'].src} alt="Rock Formation" className="w-8 h-8 object-contain" />
                          ) : (
                            <span>🪨</span>
                          )}
                        </div>
                        <div>
                          <h4 className="font-bold text-xs sm:text-sm text-slate-100 flex items-center gap-1.5">
                            {focusedShopIdx === 1 && <span className="text-amber-400 text-xs">► [E/A]</span>}
                            <span>Zen Rock Formation</span>
                          </h4>
                          <span className="text-[10px] text-amber-300 font-bold">+0.25s Pruning Effect (Quick Prune)</span>
                        </div>
                      </div>
                      <span className="text-xs bg-slate-950 text-amber-300 border border-amber-600/40 px-2 py-0.5 rounded-lg font-mono font-bold">
                        Owned: {inv.decor_rock_formation_inv || 0}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      +0.25s Pruning Effect (Quick Prune)
                    </p>
                  </div>

                  <button
                    disabled={inv.coins < 15}
                    onClick={() => buyDecoration('decor_rock_formation', 15, 'Zen Rock Formation')}
                    className={`w-full py-2 rounded-xl font-bold text-xs transition-all shadow flex items-center justify-center gap-1.5 ${
                      inv.coins >= 15
                        ? 'bg-amber-600 hover:bg-amber-500 text-white active:scale-95'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}>
                    <VerdureIcon className="w-3.5 h-3.5" />
                    <span>Purchase (15 Verdure)</span>
                  </button>
                </div>

                {/* 3. Topiary Shrubbery Bush (25 Verdure) */}
                <div className={`border p-3.5 rounded-2xl flex flex-col justify-between gap-2 transition-all ${
                  focusedShopIdx === 2
                    ? 'bg-slate-850 ring-4 ring-emerald-400 border-emerald-300 scale-[1.01] shadow-[0_0_20px_rgba(16,185,129,0.5)]'
                    : 'bg-slate-900/80 border-emerald-500/30'
                }`}>
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-emerald-950/60 border border-emerald-500/40 flex items-center justify-center text-xl shrink-0 overflow-hidden">
                          {assets['decor_shrubbery_bush']?.src ? (
                            <img src={assets['decor_shrubbery_bush'].src} alt="Topiary Shrub" className="w-8 h-8 object-contain" />
                          ) : (
                            <span>🌿</span>
                          )}
                        </div>
                        <div>
                          <h4 className="font-bold text-xs sm:text-sm text-slate-100 flex items-center gap-1.5">
                            {focusedShopIdx === 2 && <span className="text-emerald-400 text-xs">► [E/A]</span>}
                            <span>Topiary Shrubbery Bush</span>
                          </h4>
                          <span className="text-[10px] text-emerald-300 font-bold">+15% Level Up Experience (XP Boosted)</span>
                        </div>
                      </div>
                      <span className="text-xs bg-slate-950 text-emerald-300 border border-emerald-600/40 px-2 py-0.5 rounded-lg font-mono font-bold">
                        Owned: {inv.decor_shrubbery_bush_inv || 0}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      +15% Level Up Experience (XP Boosted)
                    </p>
                  </div>

                  <button
                    disabled={inv.coins < 25}
                    onClick={() => buyDecoration('decor_shrubbery_bush', 25, 'Topiary Shrubbery Bush')}
                    className={`w-full py-2 rounded-xl font-bold text-xs transition-all shadow flex items-center justify-center gap-1.5 ${
                      inv.coins >= 25
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white active:scale-95'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}>
                    <VerdureIcon className="w-3.5 h-3.5" />
                    <span>Purchase (25 Verdure)</span>
                  </button>
                </div>

                {/* 4. Woven Wooden Lattice Wall (40 Verdure) */}
                <div className={`border p-3.5 rounded-2xl flex flex-col justify-between gap-2 transition-all ${
                  focusedShopIdx === 3
                    ? 'bg-slate-850 ring-4 ring-yellow-400 border-yellow-300 scale-[1.01] shadow-[0_0_20px_rgba(250,204,21,0.5)]'
                    : 'bg-slate-900/80 border-yellow-600/30'
                }`}>
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-yellow-950/60 border border-yellow-600/40 flex items-center justify-center text-xl shrink-0 overflow-hidden">
                          {assets['decor_woven_wall']?.src ? (
                            <img src={assets['decor_woven_wall'].src} alt="Woven Wall" className="w-8 h-8 object-contain" />
                          ) : (
                            <span>🎋</span>
                          )}
                        </div>
                        <div>
                          <h4 className="font-bold text-xs sm:text-sm text-slate-100 flex items-center gap-1.5">
                            {focusedShopIdx === 3 && <span className="text-yellow-400 text-xs">► [E/A]</span>}
                            <span>Woven Wooden Lattice Wall</span>
                          </h4>
                          <span className="text-[10px] text-yellow-300 font-bold">+10% Hydration Growth Speed (Private Growing)</span>
                        </div>
                      </div>
                      <span className="text-xs bg-slate-950 text-yellow-300 border border-yellow-600/40 px-2 py-0.5 rounded-lg font-mono font-bold">
                        Owned: {inv.decor_woven_wall_inv || 0}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      +10% Hydration Growth Speed (Private Growing)
                    </p>
                  </div>

                  <button
                    disabled={inv.coins < 40}
                    onClick={() => buyDecoration('decor_woven_wall', 40, 'Woven Wooden Lattice Wall')}
                    className={`w-full py-2 rounded-xl font-bold text-xs transition-all shadow flex items-center justify-center gap-1.5 ${
                      inv.coins >= 40
                        ? 'bg-amber-600 hover:bg-amber-500 text-white active:scale-95'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}>
                    <VerdureIcon className="w-3.5 h-3.5" />
                    <span>Purchase (40 Verdure)</span>
                  </button>
                </div>

                {/* 5. Torii Gate (0 Verdure / Free) */}
                <div className={`border p-3.5 rounded-2xl flex flex-col justify-between gap-2 shadow transition-all ${
                  focusedShopIdx === 4
                    ? 'bg-slate-850 ring-4 ring-red-400 border-red-300 scale-[1.01] shadow-[0_0_20px_rgba(239,68,68,0.5)]'
                    : 'bg-slate-900/80 border-red-500/30'
                }`}>
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-red-950/80 border border-red-500/50 flex items-center justify-center text-xl shrink-0 shadow-inner">
                          <span>⛩️</span>
                        </div>
                        <div>
                          <h4 className="font-bold text-xs sm:text-sm text-red-200 flex items-center gap-1.5">
                            {focusedShopIdx === 4 && <span className="text-red-400 text-xs">► [E/A]</span>}
                            <span>Torii Gate (3x1 / 1x3)</span>
                          </h4>
                          <span className="text-[10px] text-amber-400 font-bold">3x1 / 1x3 Multi-Plot • Open Center Walkway</span>
                        </div>
                      </div>
                      <span className="text-xs bg-slate-950 text-red-300 border border-red-600/40 px-2 py-0.5 rounded-lg font-mono font-bold">
                        Owned: {inv.torii_gate_inv || 0}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Majestic vermilion shinto archway spanning 3 plots. Outer pillars anchor the sides, while the central archway plot remains open, walkable, and placeable!
                    </p>
                  </div>

                  <button
                    onClick={() => buyDecoration('torii_gate', 0, 'Torii Gate (3x1)')}
                    className="w-full py-2 rounded-xl font-bold text-xs bg-red-600 hover:bg-red-500 text-white transition-all shadow flex items-center justify-center gap-1.5 active:scale-95 ring-1 ring-red-400/50 cursor-pointer">
                    <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                    <span>Claim Free Torii Gate (0 Verdure)</span>
                  </button>
                </div>

                {/* 6. Emerald Leaf Crystal Pedestal (100 Verdure) */}
                <div className={`border p-3.5 rounded-2xl flex flex-col justify-between gap-2 shadow transition-all ${
                  focusedShopIdx === 5
                    ? 'bg-slate-850 ring-4 ring-emerald-400 border-emerald-300 scale-[1.01] shadow-[0_0_20px_rgba(16,185,129,0.5)]'
                    : 'bg-slate-900/80 border-emerald-500/40'
                }`}>
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-emerald-950/80 border border-emerald-500/60 flex items-center justify-center text-xl shrink-0 shadow-inner">
                          <span>💎</span>
                        </div>
                        <div>
                          <h4 className="font-bold text-xs sm:text-sm text-slate-100 flex items-center gap-1.5">
                            {focusedShopIdx === 5 && <span className="text-emerald-400 text-xs">► [E/A]</span>}
                            <span>Emerald Leaf Crystal Pedestal</span>
                          </h4>
                          <span className="text-[10px] text-emerald-400 font-semibold">+1 Foliage Cultivation Potential / lvl</span>
                        </div>
                      </div>
                      <span className="text-xs bg-slate-950 text-emerald-300 border border-emerald-600/40 px-2 py-0.5 rounded-lg font-mono font-bold">
                        Owned: {inv.crystal_pedestal_foliage_inv || 0}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Carved stone pedestal topped with a glowing emerald leaf crystal (#22c55e). Proximity halo boosts adjacent bonsai foliage growth potential by +1 per level.
                    </p>
                  </div>

                  <button
                    disabled={inv.coins < 100}
                    onClick={() => buyDecoration('crystal_pedestal_foliage', 100, 'Emerald Leaf Crystal Pedestal')}
                    className={`w-full py-2 rounded-xl font-bold text-xs transition-all shadow flex items-center justify-center gap-1.5 ${
                      inv.coins >= 100
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white active:scale-95'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}>
                    <VerdureIcon className="w-3.5 h-3.5" />
                    <span>Purchase (100 Verdure)</span>
                  </button>
                </div>

                {/* 7. Amber Branch Crystal Pedestal (100 Verdure) */}
                <div className={`border p-3.5 rounded-2xl flex flex-col justify-between gap-2 shadow transition-all ${
                  focusedShopIdx === 6
                    ? 'bg-slate-850 ring-4 ring-amber-400 border-amber-300 scale-[1.01] shadow-[0_0_20px_rgba(245,158,11,0.5)]'
                    : 'bg-slate-900/80 border-amber-500/40'
                }`}>
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-amber-950/80 border border-amber-500/60 flex items-center justify-center text-xl shrink-0 shadow-inner">
                          <span>💎</span>
                        </div>
                        <div>
                          <h4 className="font-bold text-xs sm:text-sm text-slate-100 flex items-center gap-1.5">
                            {focusedShopIdx === 6 && <span className="text-amber-400 text-xs">► [E/A]</span>}
                            <span>Amber Branch Crystal Pedestal</span>
                          </h4>
                          <span className="text-[10px] text-amber-400 font-semibold">+1 Branches Cultivation Potential / lvl</span>
                        </div>
                      </div>
                      <span className="text-xs bg-slate-950 text-amber-300 border border-amber-600/40 px-2 py-0.5 rounded-lg font-mono font-bold">
                        Owned: {inv.crystal_pedestal_branches_inv || 0}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Carved stone pedestal topped with a glowing warm amber branching twig crystal (#eab308). Proximity halo boosts adjacent bonsai branch growth potential by +1 per level.
                    </p>
                  </div>

                  <button
                    disabled={inv.coins < 100}
                    onClick={() => buyDecoration('crystal_pedestal_branches', 100, 'Amber Branch Crystal Pedestal')}
                    className={`w-full py-2 rounded-xl font-bold text-xs transition-all shadow flex items-center justify-center gap-1.5 ${
                      inv.coins >= 100
                        ? 'bg-amber-600 hover:bg-amber-500 text-white active:scale-95'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}>
                    <VerdureIcon className="w-3.5 h-3.5" />
                    <span>Purchase (100 Verdure)</span>
                  </button>
                </div>

                {/* 8. Coral Trunk Crystal Pedestal (100 Verdure) */}
                <div className={`border p-3.5 rounded-2xl flex flex-col justify-between gap-2 shadow transition-all ${
                  focusedShopIdx === 7
                    ? 'bg-slate-850 ring-4 ring-rose-400 border-rose-300 scale-[1.01] shadow-[0_0_20px_rgba(244,63,94,0.5)]'
                    : 'bg-slate-900/80 border-rose-500/40'
                }`}>
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-rose-950/80 border border-rose-500/60 flex items-center justify-center text-xl shrink-0 shadow-inner">
                          <span>💎</span>
                        </div>
                        <div>
                          <h4 className="font-bold text-xs sm:text-sm text-slate-100 flex items-center gap-1.5">
                            {focusedShopIdx === 7 && <span className="text-rose-400 text-xs">► [E/A]</span>}
                            <span>Coral Trunk Crystal Pedestal</span>
                          </h4>
                          <span className="text-[10px] text-rose-400 font-semibold">+1 Trunk Cultivation Potential / lvl</span>
                        </div>
                      </div>
                      <span className="text-xs bg-slate-950 text-rose-300 border border-rose-600/40 px-2 py-0.5 rounded-lg font-mono font-bold">
                        Owned: {inv.crystal_pedestal_trunk_inv || 0}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Carved stone pedestal topped with a glowing rust coral red trunk crystal (#ef4444). Proximity halo boosts adjacent bonsai trunk growth potential by +1 per level.
                    </p>
                  </div>

                  <button
                    disabled={inv.coins < 100}
                    onClick={() => buyDecoration('crystal_pedestal_trunk', 100, 'Coral Trunk Crystal Pedestal')}
                    className={`w-full py-2 rounded-xl font-bold text-xs transition-all shadow flex items-center justify-center gap-1.5 ${
                      inv.coins >= 100
                        ? 'bg-rose-600 hover:bg-rose-500 text-white active:scale-95'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}>
                    <VerdureIcon className="w-3.5 h-3.5" />
                    <span>Purchase (100 Verdure)</span>
                  </button>
                </div>

                {/* 9. Azure Root Crystal Pedestal (100 Verdure) */}
                <div className={`border p-3.5 rounded-2xl flex flex-col justify-between gap-2 shadow transition-all ${
                  focusedShopIdx === 8
                    ? 'bg-slate-850 ring-4 ring-blue-400 border-blue-300 scale-[1.01] shadow-[0_0_20px_rgba(59,130,246,0.5)]'
                    : 'bg-slate-900/80 border-blue-500/40'
                }`}>
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-blue-950/80 border border-blue-500/60 flex items-center justify-center text-xl shrink-0 shadow-inner">
                          <span>💎</span>
                        </div>
                        <div>
                          <h4 className="font-bold text-xs sm:text-sm text-slate-100 flex items-center gap-1.5">
                            {focusedShopIdx === 8 && <span className="text-blue-400 text-xs">► [E/A]</span>}
                            <span>Azure Root Crystal Pedestal</span>
                          </h4>
                          <span className="text-[10px] text-blue-400 font-semibold">+1 Roots Cultivation Potential / lvl</span>
                        </div>
                      </div>
                      <span className="text-xs bg-slate-950 text-blue-300 border border-blue-600/40 px-2 py-0.5 rounded-lg font-mono font-bold">
                        Owned: {inv.crystal_pedestal_roots_inv || 0}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Carved stone pedestal topped with a glowing deep azure root tendril crystal (#3b82f6). Proximity halo boosts adjacent bonsai root growth potential by +1 per level.
                    </p>
                  </div>

                  <button
                    disabled={inv.coins < 100}
                    onClick={() => buyDecoration('crystal_pedestal_roots', 100, 'Azure Root Crystal Pedestal')}
                    className={`w-full py-2 rounded-xl font-bold text-xs transition-all shadow flex items-center justify-center gap-1.5 ${
                      inv.coins >= 100
                        ? 'bg-blue-600 hover:bg-blue-500 text-white active:scale-95'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}>
                    <VerdureIcon className="w-3.5 h-3.5" />
                    <span>Purchase (100 Verdure)</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: GUIDEBOOKS & BLUEPRINTS */}
          {shopTab === 'GUIDES' && (
            <div className="flex-1 space-y-2.5 mb-3 overflow-y-auto pr-1">
              <div className="text-xs text-slate-400 bg-slate-900/60 p-2.5 rounded-2xl border border-slate-800 flex items-center gap-2">
                <Info className="w-4 h-4 text-lime-400 shrink-0" />
                <span>
                  Acquire ancient manuscripts and engineering blueprints to unlock advanced irrigation automatons and automated fabrication assembly!
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* 1. Compost Guidebook (Index 0) */}
                <div className={`border p-3 rounded-2xl flex flex-col justify-between gap-2 transition-all ${
                  focusedShopIdx === 0
                    ? 'ring-4 ring-lime-400 border-lime-300 scale-[1.01] bg-slate-850 shadow-[0_0_20px_rgba(163,230,53,0.5)]'
                    : 'bg-slate-900/80 border-slate-800'
                }`}>
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-xl bg-lime-950/80 border border-lime-500/50 flex items-center justify-center overflow-hidden shrink-0">
                          {assets['compost_guide']?.src ? (
                            <img src={assets['compost_guide'].src} alt="Guidebook" className="w-7 h-7 object-contain" />
                          ) : (
                            <BookOpen className="w-4 h-4 text-lime-400" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-bold text-xs sm:text-sm text-slate-100 flex items-center gap-1.5">
                            {focusedShopIdx === 0 && <span className="text-lime-400 text-xs">► [E/A]</span>}
                            <span>Compost Guidebook</span>
                          </h4>
                          <span className="text-[10px] text-lime-300 font-semibold">Organic Waste Recycling Guide</span>
                        </div>
                      </div>
                      {inv.has_compost_guide && (
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                          ✓ Owned
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400">
                      Unlocks the <strong>Enriched Compost</strong> recipe at the Artisan Workbench (Refine 2 Organic Waste &rarr; 1 Enriched Compost in 5s).
                    </p>
                  </div>

                  <button
                    disabled={inv.has_compost_guide || inv.coins < 35}
                    onClick={() => buyGuidebook('has_compost_guide', 35, 'Compost Guidebook')}
                    className={`w-full py-1.5 rounded-xl font-bold text-xs transition-all shadow flex items-center justify-center gap-1 ${
                      inv.has_compost_guide
                        ? 'bg-slate-800 text-emerald-400 cursor-default border border-emerald-500/30'
                        : inv.coins >= 35
                        ? 'bg-lime-600 hover:bg-lime-500 text-white active:scale-95'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}>
                    <VerdureIcon className="w-3.5 h-3.5" />
                    <span>{inv.has_compost_guide ? 'Studied' : 'Purchase (35 Verdure)'}</span>
                  </button>
                </div>

                {/* 2. Tier 1 Mist Irrigation Guidebook (Index 1) */}
                <div className={`border p-3 rounded-2xl flex flex-col justify-between gap-2 transition-all ${
                  focusedShopIdx === 1
                    ? 'ring-4 ring-sky-400 border-sky-300 scale-[1.01] bg-slate-850 shadow-[0_0_20px_rgba(56,189,248,0.5)]'
                    : 'bg-slate-900/80 border-slate-800'
                }`}>
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-xl bg-sky-950/80 border border-sky-500/50 flex items-center justify-center overflow-hidden shrink-0">
                          {assets['irrigation_tier1_guide']?.src ? (
                            <img src={assets['irrigation_tier1_guide'].src} alt="Tier 1 Guide" className="w-7 h-7 object-contain" />
                          ) : (
                            <BookOpen className="w-4 h-4 text-sky-400" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-bold text-xs sm:text-sm text-slate-100 flex items-center gap-1.5">
                            {focusedShopIdx === 1 && <span className="text-sky-400 text-xs">► [E/A]</span>}
                            <span>Tier 1 Mist Irrigation Guidebook</span>
                          </h4>
                          <span className="text-[10px] text-sky-300 font-semibold">1.0x Baseline Speed (2 kW)</span>
                        </div>
                      </div>
                      {inv.has_tier1_guide && (
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                          ✓ Owned
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400">
                      Foundational hydraulic schematics for entry-level mist sprayers (gentle steady hydration).
                    </p>
                  </div>

                  <button
                    disabled={inv.has_tier1_guide || inv.coins < 75}
                    onClick={() => buyGuidebook('has_tier1_guide', 75, 'Tier 1 Mist Irrigation Guidebook')}
                    className={`w-full py-1.5 rounded-xl font-bold text-xs transition-all shadow flex items-center justify-center gap-1 ${
                      inv.has_tier1_guide
                        ? 'bg-slate-800 text-emerald-400 cursor-default border border-emerald-500/30'
                        : inv.coins >= 75
                        ? 'bg-sky-600 hover:bg-sky-500 text-white active:scale-95'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}>
                    <VerdureIcon className="w-3.5 h-3.5" />
                    <span>{inv.has_tier1_guide ? 'Studied' : 'Purchase (75 Verdure)'}</span>
                  </button>
                </div>

                {/* 3. T2 Precision Workbench Blueprint */}
                <div className={`border p-3 rounded-2xl flex flex-col justify-between gap-2 transition-all ${
                  focusedShopIdx === 2
                    ? 'ring-4 ring-sky-400 border-sky-300 scale-[1.01] bg-slate-850 shadow-[0_0_20px_rgba(56,189,248,0.5)]'
                    : 'bg-slate-900/80 border-slate-800'
                }`}>
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-xl bg-sky-950/80 border border-sky-500/50 flex items-center justify-center overflow-hidden shrink-0">
                          {assets['workbench_tier2_guide']?.src ? (
                            <img src={assets['workbench_tier2_guide'].src} alt="T2 Blueprint" className="w-7 h-7 object-contain" />
                          ) : (
                            <BookOpen className="w-4 h-4 text-sky-400" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-bold text-xs sm:text-sm text-slate-100 flex items-center gap-1.5">
                            {focusedShopIdx === 2 && <span className="text-sky-400 text-xs">► [E/A]</span>}
                            <span>T2 Precision Workbench Blueprint</span>
                          </h4>
                          <span className="text-[10px] text-sky-300 font-semibold">Capacity: 5 Units</span>
                        </div>
                      </div>
                      {inv.has_workbench_t2_guide && (
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                          ✓ Owned
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400">
                      Reinforces workbench frame with precision brass rails. Expands automaton capacity from 3 to 5 units.
                    </p>
                  </div>

                  <button
                    disabled={inv.has_workbench_t2_guide || inv.coins < 160}
                    onClick={() => buyGuidebook('has_workbench_t2_guide', 160, 'T2 Precision Workbench Blueprint')}
                    className={`w-full py-1.5 rounded-xl font-bold text-xs transition-all shadow flex items-center justify-center gap-1 ${
                      inv.has_workbench_t2_guide
                        ? 'bg-slate-800 text-emerald-400 cursor-default border border-emerald-500/30'
                        : inv.coins >= 160
                        ? 'bg-sky-600 hover:bg-sky-500 text-white active:scale-95'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}>
                    <VerdureIcon className="w-3.5 h-3.5" />
                    <span>{inv.has_workbench_t2_guide ? 'Studied' : 'Purchase (160 Verdure)'}</span>
                  </button>
                </div>

                {/* Rover T2 Blueprint */}
                <div className={`border p-3 rounded-2xl flex flex-col justify-between gap-2 shadow transition-all ${
                  focusedShopIdx === 3
                    ? 'ring-4 ring-sky-400 border-sky-300 scale-[1.01] bg-slate-850 shadow-[0_0_20px_rgba(56,189,248,0.5)]'
                    : 'bg-slate-900/80 border-sky-500/30'
                }`}>
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-xl bg-sky-950/80 border border-sky-500/50 flex items-center justify-center overflow-hidden shrink-0">
                          <Truck className="w-4 h-4 text-sky-400" />
                        </div>
                        <div>
                          <h4 className="font-bold text-xs sm:text-sm text-slate-100 flex items-center gap-1.5">
                            {focusedShopIdx === 3 && <span className="text-sky-400 text-xs">► [E/A]</span>}
                            <span>Rover T2 Blueprint</span>
                          </h4>
                          <span className="text-[10px] text-sky-300 font-semibold">Surveyor Chassis (5 Slots)</span>
                        </div>
                      </div>
                      {inv.has_rover_t2_blueprint && (
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                          ✓ Owned
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400">
                      Engineering blueprint required to construct the Surveyor Chassis (Tier 2 Upgrade) in the Workbench. Expands Rover module capacity to 5 slots.
                    </p>
                  </div>

                  <button
                    disabled={inv.has_rover_t2_blueprint || inv.coins < 75}
                    onClick={() => buyGuidebook('has_rover_t2_blueprint', 75, 'Rover T2 Blueprint')}
                    className={`w-full py-1.5 rounded-xl font-bold text-xs transition-all shadow flex items-center justify-center gap-1 ${
                      inv.has_rover_t2_blueprint
                        ? 'bg-slate-800 text-emerald-400 cursor-default border border-emerald-500/30'
                        : inv.coins >= 75
                        ? 'bg-sky-600 hover:bg-sky-500 text-white active:scale-95'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}>
                    <VerdureIcon className="w-3.5 h-3.5" />
                    <span>{inv.has_rover_t2_blueprint ? 'Acquired' : 'Purchase (75 Verdure)'}</span>
                  </button>
                </div>

                {/* Rover T3 Blueprint */}
                <div className={`border p-3 rounded-2xl flex flex-col justify-between gap-2 shadow transition-all ${
                  focusedShopIdx === 4
                    ? 'ring-4 ring-amber-400 border-amber-300 scale-[1.01] bg-slate-850 shadow-[0_0_20px_rgba(245,158,11,0.5)]'
                    : 'bg-slate-900/80 border-amber-500/30'
                }`}>
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-xl bg-amber-950/80 border border-amber-500/50 flex items-center justify-center overflow-hidden shrink-0">
                          <Trophy className="w-4 h-4 text-amber-400" />
                        </div>
                        <div>
                          <h4 className="font-bold text-xs sm:text-sm text-slate-100 flex items-center gap-1.5">
                            {focusedShopIdx === 4 && <span className="text-amber-400 text-xs">► [E/A]</span>}
                            <span>Rover T3 Blueprint</span>
                          </h4>
                          <span className="text-[10px] text-amber-300 font-semibold">Vanguard Chassis (10 Slots)</span>
                        </div>
                      </div>
                      {inv.has_rover_t3_blueprint && (
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                          ✓ Owned
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400">
                      Master blueprint required to construct the Vanguard Heavy Chassis (Tier 3 Upgrade) in the Workbench. Expands Rover module capacity to 10 slots.
                    </p>
                  </div>

                  <button
                    disabled={inv.has_rover_t3_blueprint || inv.coins < 150}
                    onClick={() => buyGuidebook('has_rover_t3_blueprint', 150, 'Rover T3 Blueprint')}
                    className={`w-full py-1.5 rounded-xl font-bold text-xs transition-all shadow flex items-center justify-center gap-1 ${
                      inv.has_rover_t3_blueprint
                        ? 'bg-slate-800 text-emerald-400 cursor-default border border-emerald-500/30'
                        : inv.coins >= 150
                        ? 'bg-amber-600 hover:bg-amber-500 text-white active:scale-95'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}>
                    <VerdureIcon className="w-3.5 h-3.5" />
                    <span>{inv.has_rover_t3_blueprint ? 'Acquired' : 'Purchase (150 Verdure)'}</span>
                  </button>
                </div>

                {/* Storage Module I Guidebook */}
                <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-2xl flex flex-col justify-between gap-2">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-xl bg-emerald-950/80 border border-emerald-500/50 flex items-center justify-center text-sm shrink-0">
                          📦
                        </div>
                        <div>
                          <h4 className="font-bold text-xs sm:text-sm text-slate-100">Storage Module I Guidebook</h4>
                          <span className="text-[10px] text-emerald-300 font-semibold">+2.5 kg Cargo Module</span>
                        </div>
                      </div>
                      {inv.has_storage_module_1_guide && (
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                          ✓ Owned
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400">
                      Unlocks crafting Storage Module I (+2.5 kg cargo) at the Workbench. Modules can be attached/detached in the Rover Loadout bay.
                    </p>
                  </div>

                  <button
                    disabled={inv.has_storage_module_1_guide || inv.coins < 25}
                    onClick={() => buyGuidebook('has_storage_module_1_guide', 25, 'Storage Module I Guidebook')}
                    className={`w-full py-1.5 rounded-xl font-bold text-xs transition-all shadow flex items-center justify-center gap-1 ${
                      inv.has_storage_module_1_guide
                        ? 'bg-slate-800 text-emerald-400 cursor-default border border-emerald-500/30'
                        : inv.coins >= 25
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white active:scale-95'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}>
                    <VerdureIcon className="w-3.5 h-3.5" />
                    <span>{inv.has_storage_module_1_guide ? 'Studied' : 'Purchase (25 Verdure)'}</span>
                  </button>
                </div>

                {/* Storage Module II Guidebook */}
                <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-2xl flex flex-col justify-between gap-2">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-xl bg-emerald-950/80 border border-emerald-500/50 flex items-center justify-center text-sm shrink-0">
                          📦
                        </div>
                        <div>
                          <h4 className="font-bold text-xs sm:text-sm text-slate-100">Storage Module II Guidebook</h4>
                          <span className="text-[10px] text-emerald-300 font-semibold">+5.0 kg Cargo Module</span>
                        </div>
                      </div>
                      {inv.has_storage_module_2_guide && (
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                          ✓ Owned
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400">
                      Unlocks crafting Storage Module II (+5.0 kg cargo) at the Workbench. Modules can be attached/detached in the Rover Loadout bay.
                    </p>
                  </div>

                  <button
                    disabled={inv.has_storage_module_2_guide || inv.coins < 50}
                    onClick={() => buyGuidebook('has_storage_module_2_guide', 50, 'Storage Module II Guidebook')}
                    className={`w-full py-1.5 rounded-xl font-bold text-xs transition-all shadow flex items-center justify-center gap-1 ${
                      inv.has_storage_module_2_guide
                        ? 'bg-slate-800 text-emerald-400 cursor-default border border-emerald-500/30'
                        : inv.coins >= 50
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white active:scale-95'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}>
                    <VerdureIcon className="w-3.5 h-3.5" />
                    <span>{inv.has_storage_module_2_guide ? 'Studied' : 'Purchase (50 Verdure)'}</span>
                  </button>
                </div>

                {/* Storage Module III Guidebook */}
                <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-2xl flex flex-col justify-between gap-2">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-xl bg-emerald-950/80 border border-emerald-500/50 flex items-center justify-center text-sm shrink-0">
                          🚜
                        </div>
                        <div>
                          <h4 className="font-bold text-xs sm:text-sm text-slate-100">Storage Module III Guidebook</h4>
                          <span className="text-[10px] text-emerald-300 font-semibold">+7.5 kg Cargo Module</span>
                        </div>
                      </div>
                      {inv.has_storage_module_3_guide && (
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                          ✓ Owned
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400">
                      Unlocks crafting high-capacity Storage Module III (+7.5 kg cargo) at the Workbench. Modules can be attached/detached in Rover Loadout.
                    </p>
                  </div>

                  <button
                    disabled={inv.has_storage_module_3_guide || inv.coins < 100}
                    onClick={() => buyGuidebook('has_storage_module_3_guide', 100, 'Storage Module III Guidebook')}
                    className={`w-full py-1.5 rounded-xl font-bold text-xs transition-all shadow flex items-center justify-center gap-1 ${
                      inv.has_storage_module_3_guide
                        ? 'bg-slate-800 text-emerald-400 cursor-default border border-emerald-500/30'
                        : inv.coins >= 100
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white active:scale-95'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}>
                    <VerdureIcon className="w-3.5 h-3.5" />
                    <span>{inv.has_storage_module_3_guide ? 'Studied' : 'Purchase (100 Verdure)'}</span>
                  </button>
                </div>

                {/* Battery Module I Guidebook */}
                <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-2xl flex flex-col justify-between gap-2">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-xl bg-amber-950/80 border border-amber-500/50 flex items-center justify-center text-sm shrink-0">
                          🔋
                        </div>
                        <div>
                          <h4 className="font-bold text-xs sm:text-sm text-slate-100">Battery Module I Guidebook</h4>
                          <span className="text-[10px] text-amber-300 font-semibold">+25 kWh Battery Module</span>
                        </div>
                      </div>
                      {inv.has_battery_module_1_guide && (
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                          ✓ Owned
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400">
                      Unlocks crafting Battery Module I (+25 kWh energy) at the Workbench. Modules can be attached/detached in the Rover Loadout bay.
                    </p>
                  </div>

                  <button
                    disabled={inv.has_battery_module_1_guide || inv.coins < 25}
                    onClick={() => buyGuidebook('has_battery_module_1_guide', 25, 'Battery Module I Guidebook')}
                    className={`w-full py-1.5 rounded-xl font-bold text-xs transition-all shadow flex items-center justify-center gap-1 ${
                      inv.has_battery_module_1_guide
                        ? 'bg-slate-800 text-emerald-400 cursor-default border border-emerald-500/30'
                        : inv.coins >= 25
                        ? 'bg-amber-600 hover:bg-amber-500 text-white active:scale-95'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}>
                    <VerdureIcon className="w-3.5 h-3.5" />
                    <span>{inv.has_battery_module_1_guide ? 'Studied' : 'Purchase (25 Verdure)'}</span>
                  </button>
                </div>

                {/* Battery Module II Guidebook */}
                <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-2xl flex flex-col justify-between gap-2">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-xl bg-amber-950/80 border border-amber-500/50 flex items-center justify-center text-sm shrink-0">
                          ⚡
                        </div>
                        <div>
                          <h4 className="font-bold text-xs sm:text-sm text-slate-100">Battery Module II Guidebook</h4>
                          <span className="text-[10px] text-amber-300 font-semibold">+50 kWh Battery Module</span>
                        </div>
                      </div>
                      {inv.has_battery_module_2_guide && (
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                          ✓ Owned
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400">
                      Unlocks crafting Battery Module II (+50 kWh energy) at the Workbench. Modules can be attached/detached in the Rover Loadout bay.
                    </p>
                  </div>

                  <button
                    disabled={inv.has_battery_module_2_guide || inv.coins < 50}
                    onClick={() => buyGuidebook('has_battery_module_2_guide', 50, 'Battery Module II Guidebook')}
                    className={`w-full py-1.5 rounded-xl font-bold text-xs transition-all shadow flex items-center justify-center gap-1 ${
                      inv.has_battery_module_2_guide
                        ? 'bg-slate-800 text-emerald-400 cursor-default border border-emerald-500/30'
                        : inv.coins >= 50
                        ? 'bg-amber-600 hover:bg-amber-500 text-white active:scale-95'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}>
                    <VerdureIcon className="w-3.5 h-3.5" />
                    <span>{inv.has_battery_module_2_guide ? 'Studied' : 'Purchase (50 Verdure)'}</span>
                  </button>
                </div>

                {/* Battery Module III Guidebook */}
                <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-2xl flex flex-col justify-between gap-2">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-xl bg-amber-950/80 border border-amber-500/50 flex items-center justify-center text-sm shrink-0">
                          ✨
                        </div>
                        <div>
                          <h4 className="font-bold text-xs sm:text-sm text-slate-100">Battery Module III Guidebook</h4>
                          <span className="text-[10px] text-amber-300 font-semibold">+75 kWh Battery Module</span>
                        </div>
                      </div>
                      {inv.has_battery_module_3_guide && (
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                          ✓ Owned
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400">
                      Unlocks crafting high-density Battery Module III (+75 kWh energy) at the Workbench. Modules can be attached/detached in Rover Loadout.
                    </p>
                  </div>

                  <button
                    disabled={inv.has_battery_module_3_guide || inv.coins < 100}
                    onClick={() => buyGuidebook('has_battery_module_3_guide', 100, 'Battery Module III Guidebook')}
                    className={`w-full py-1.5 rounded-xl font-bold text-xs transition-all shadow flex items-center justify-center gap-1 ${
                      inv.has_battery_module_3_guide
                        ? 'bg-slate-800 text-emerald-400 cursor-default border border-emerald-500/30'
                        : inv.coins >= 100
                        ? 'bg-amber-600 hover:bg-amber-500 text-white active:scale-95'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}>
                    <VerdureIcon className="w-3.5 h-3.5" />
                    <span>{inv.has_battery_module_3_guide ? 'Studied' : 'Purchase (100 Verdure)'}</span>
                  </button>
                </div>

                {/* Radar Module I Guidebook */}
                <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-2xl flex flex-col justify-between gap-2">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-xl bg-sky-950/80 border border-sky-500/50 flex items-center justify-center text-sm shrink-0">
                          📡
                        </div>
                        <div>
                          <h4 className="font-bold text-xs sm:text-sm text-slate-100">Radar Module I Guidebook</h4>
                          <span className="text-[10px] text-sky-300 font-semibold">+1 Step Vision (Radius 2 + 1 = 3)</span>
                        </div>
                      </div>
                      {inv.has_radar_module_1_guide && (
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                          ✓ Owned
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400">
                      Unlocks crafting Radar Module I at the Workbench (+1 step Fog of War vision). Physical module attachable in Rover Loadout.
                    </p>
                  </div>

                  <button
                    disabled={inv.has_radar_module_1_guide || inv.coins < 30}
                    onClick={() => buyGuidebook('has_radar_module_1_guide', 30, 'Radar Module I Guidebook')}
                    className={`w-full py-1.5 rounded-xl font-bold text-xs transition-all shadow flex items-center justify-center gap-1 ${
                      inv.has_radar_module_1_guide
                        ? 'bg-slate-800 text-emerald-400 cursor-default border border-emerald-500/30'
                        : inv.coins >= 30
                        ? 'bg-sky-600 hover:bg-sky-500 text-white active:scale-95'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}>
                    <VerdureIcon className="w-3.5 h-3.5" />
                    <span>{inv.has_radar_module_1_guide ? 'Studied' : 'Purchase (30 Verdure)'}</span>
                  </button>
                </div>

                {/* Radar Module II Guidebook */}
                <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-2xl flex flex-col justify-between gap-2">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-xl bg-sky-950/80 border border-sky-500/50 flex items-center justify-center text-sm shrink-0">
                          📡
                        </div>
                        <div>
                          <h4 className="font-bold text-xs sm:text-sm text-slate-100">Radar Module II Guidebook</h4>
                          <span className="text-[10px] text-sky-300 font-semibold">+2 Steps Vision (Radius 2 + 2 = 4)</span>
                        </div>
                      </div>
                      {inv.has_radar_module_2_guide && (
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                          ✓ Owned
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400">
                      Unlocks crafting Radar Module II at the Workbench (+2 steps Fog of War vision). Physical module attachable in Rover Loadout.
                    </p>
                  </div>

                  <button
                    disabled={inv.has_radar_module_2_guide || inv.coins < 65}
                    onClick={() => buyGuidebook('has_radar_module_2_guide', 65, 'Radar Module II Guidebook')}
                    className={`w-full py-1.5 rounded-xl font-bold text-xs transition-all shadow flex items-center justify-center gap-1 ${
                      inv.has_radar_module_2_guide
                        ? 'bg-slate-800 text-emerald-400 cursor-default border border-emerald-500/30'
                        : inv.coins >= 65
                        ? 'bg-sky-600 hover:bg-sky-500 text-white active:scale-95'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}>
                    <VerdureIcon className="w-3.5 h-3.5" />
                    <span>{inv.has_radar_module_2_guide ? 'Studied' : 'Purchase (65 Verdure)'}</span>
                  </button>
                </div>

                {/* Radar Module III Guidebook */}
                <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-2xl flex flex-col justify-between gap-2">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-xl bg-sky-950/80 border border-sky-500/50 flex items-center justify-center text-sm shrink-0">
                          📡
                        </div>
                        <div>
                          <h4 className="font-bold text-xs sm:text-sm text-slate-100">Radar Module III Guidebook</h4>
                          <span className="text-[10px] text-sky-300 font-semibold">+3 Steps Vision (Radius 2 + 3 = 5)</span>
                        </div>
                      </div>
                      {inv.has_radar_module_3_guide && (
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                          ✓ Owned
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400">
                      Unlocks crafting Radar Module III at the Workbench (+3 steps Fog of War vision). Quantum bio-resonance radar unit.
                    </p>
                  </div>

                  <button
                    disabled={inv.has_radar_module_3_guide || inv.coins < 120}
                    onClick={() => buyGuidebook('has_radar_module_3_guide', 120, 'Radar Module III Guidebook')}
                    className={`w-full py-1.5 rounded-xl font-bold text-xs transition-all shadow flex items-center justify-center gap-1 ${
                      inv.has_radar_module_3_guide
                        ? 'bg-slate-800 text-emerald-400 cursor-default border border-emerald-500/30'
                        : inv.coins >= 120
                        ? 'bg-sky-600 hover:bg-sky-500 text-white active:scale-95'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}>
                    <VerdureIcon className="w-3.5 h-3.5" />
                    <span>{inv.has_radar_module_3_guide ? 'Studied' : 'Purchase (120 Verdure)'}</span>
                  </button>
                </div>

                {/* 4. Tier 2 Pulsar Irrigation Guidebook */}
                <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-2xl flex flex-col justify-between gap-2">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-xl bg-purple-950/80 border border-purple-500/50 flex items-center justify-center overflow-hidden shrink-0">
                          {assets['automaton_guide']?.src ? (
                            <img src={assets['automaton_guide'].src} alt="Tier 2 Guide" className="w-7 h-7 object-contain" />
                          ) : (
                            <BookOpen className="w-4 h-4 text-purple-400" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-bold text-xs sm:text-sm text-slate-100">Tier 2 Pulsar Irrigation Guidebook</h4>
                          <span className="text-[10px] text-purple-300 font-semibold">2.5x Speed (4 kW)</span>
                        </div>
                      </div>
                      {inv.has_tier2_guide && (
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                          ✓ Owned
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400">
                      High-pressure pulsating valve schematics watering trees at 2.5x accelerated speed.
                    </p>
                  </div>

                  <button
                    disabled={inv.has_tier2_guide || inv.coins < 220}
                    onClick={() => buyGuidebook('has_tier2_guide', 220, 'Tier 2 Pulsar Irrigation Guidebook')}
                    className={`w-full py-1.5 rounded-xl font-bold text-xs transition-all shadow flex items-center justify-center gap-1 ${
                      inv.has_tier2_guide
                        ? 'bg-slate-800 text-emerald-400 cursor-default border border-emerald-500/30'
                        : inv.coins >= 220
                        ? 'bg-purple-600 hover:bg-purple-500 text-white active:scale-95'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}>
                    <VerdureIcon className="w-3.5 h-3.5" />
                    <span>{inv.has_tier2_guide ? 'Studied' : 'Purchase (220 Verdure)'}</span>
                  </button>
                </div>

                {/* 5. Auto-Automaton Guidebook (Auto-Fabrication) */}
                <div className="bg-slate-900/80 border border-cyan-500/40 p-3 rounded-2xl flex flex-col justify-between gap-2 shadow">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-xl bg-cyan-950/80 border border-cyan-500/50 flex items-center justify-center overflow-hidden shrink-0">
                          {assets['auto_fabricator_guide']?.src ? (
                            <img src={assets['auto_fabricator_guide'].src} alt="Auto Fabricator Guide" className="w-7 h-7 object-contain" />
                          ) : (
                            <BookOpen className="w-4 h-4 text-cyan-400" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-bold text-xs sm:text-sm text-slate-100">Auto-Automaton Guidebook</h4>
                          <span className="text-[10px] text-cyan-300 font-semibold">Continuous Assembly (10 kW)</span>
                        </div>
                      </div>
                      {inv.has_auto_fabricator_guide && (
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                          ✓ Owned
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400">
                      Blueprints for dedicated automated fabrication lanes. Synthesizes continuous production loops independently on Workbench.
                    </p>
                  </div>

                  <button
                    disabled={inv.has_auto_fabricator_guide || inv.coins < 300}
                    onClick={() => buyGuidebook('has_auto_fabricator_guide', 300, 'Auto-Fabrication Blueprint Guidebook')}
                    className={`w-full py-1.5 rounded-xl font-bold text-xs transition-all shadow flex items-center justify-center gap-1 ${
                      inv.has_auto_fabricator_guide
                        ? 'bg-slate-800 text-emerald-400 cursor-default border border-emerald-500/30'
                        : inv.coins >= 300
                        ? 'bg-cyan-600 hover:bg-cyan-500 text-white active:scale-95'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}>
                    <VerdureIcon className="w-3.5 h-3.5" />
                    <span>{inv.has_auto_fabricator_guide ? 'Studied' : 'Purchase (300 Verdure)'}</span>
                  </button>
                </div>

                {/* 6. T3 Artisan Workbench Guidebook (Master Foundry) */}
                <div className="bg-slate-900/80 border border-amber-500/40 p-3 rounded-2xl flex flex-col justify-between gap-2 shadow">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-xl bg-amber-950/80 border border-amber-500/50 flex items-center justify-center overflow-hidden shrink-0">
                          {assets['workbench_tier3_guide']?.src ? (
                            <img src={assets['workbench_tier3_guide'].src} alt="T3 Workbench Guide" className="w-7 h-7 object-contain" />
                          ) : (
                            <BookOpen className="w-4 h-4 text-amber-400" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-bold text-xs sm:text-sm text-slate-100">T3 Artisan Workbench Guidebook</h4>
                          <span className="text-[10px] text-amber-300 font-semibold">Master Foundry (10 Units)</span>
                        </div>
                      </div>
                      {inv.has_workbench_t3_guide && (
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                          ✓ Owned
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400">
                      High-tech precision engineering bench with gilded master forge core. Expands automaton module capacity from 5 to 10 units!
                    </p>
                  </div>

                  <button
                    disabled={inv.has_workbench_t3_guide || inv.coins < 350}
                    onClick={() => buyGuidebook('has_workbench_t3_guide', 350, 'T3 Master Foundry Blueprint')}
                    className={`w-full py-1.5 rounded-xl font-bold text-xs transition-all shadow flex items-center justify-center gap-1 ${
                      inv.has_workbench_t3_guide
                        ? 'bg-slate-800 text-emerald-400 cursor-default border border-emerald-500/30'
                        : inv.coins >= 350
                        ? 'bg-amber-600 hover:bg-amber-500 text-white active:scale-95'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}>
                    <VerdureIcon className="w-3.5 h-3.5" />
                    <span>{inv.has_workbench_t3_guide ? 'Studied' : 'Purchase (350 Verdure)'}</span>
                  </button>
                </div>

                {/* 7. T3 Water Automaton Guidebook (Master Hydro-Irrigation) */}
                <div className="bg-slate-900/80 border border-emerald-500/40 p-3 rounded-2xl flex flex-col justify-between gap-2 shadow col-span-1 sm:col-span-2">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-xl bg-emerald-950/80 border border-emerald-500/50 flex items-center justify-center overflow-hidden shrink-0">
                          {assets['automaton_guide']?.src ? (
                            <img src={assets['automaton_guide'].src} alt="T3 Automaton Guide" className="w-7 h-7 object-contain" />
                          ) : (
                            <BookOpen className="w-4 h-4 text-emerald-400" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-bold text-xs sm:text-sm text-slate-100">T3 Water Automaton Guidebook</h4>
                          <span className="text-[10px] text-emerald-300 font-semibold">Master Hydro-Sprinkler System (5.0x Ultra Speed, 7 kW)</span>
                        </div>
                      </div>
                      {inv.has_tier3_guide && (
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                          ✓ Owned
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400">
                      Supercharged hydro-nanite misting sprayers that accelerate bonsai maturation by 5.0x ultra speed. Essential for cultivating Level 100 Premium specimens!
                    </p>
                  </div>

                  <button
                    disabled={inv.has_tier3_guide || inv.coins < 450}
                    onClick={() => buyGuidebook('has_tier3_guide', 450, 'Tier 3 Hydro Irrigation Guidebook')}
                    className={`w-full py-1.5 rounded-xl font-bold text-xs transition-all shadow flex items-center justify-center gap-1 ${
                      inv.has_tier3_guide
                        ? 'bg-slate-800 text-emerald-400 cursor-default border border-emerald-500/30'
                        : inv.coins >= 450
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white active:scale-95'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}>
                    <VerdureIcon className="w-3.5 h-3.5" />
                    <span>{inv.has_tier3_guide ? 'Studied' : 'Purchase (450 Verdure)'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: EQUIPMENT & NURSERY TOOLS */}
          {shopTab === 'EQUIPMENT' && (
            <div className="flex-1 space-y-2.5 mb-3 overflow-y-auto pr-1">
              <div className="text-xs text-slate-400 bg-slate-900/60 p-2.5 rounded-2xl border border-slate-800 flex items-center gap-2">
                <Wrench className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  Acquire functional deployable nursery equipment &amp; tools! Deploy onto unlocked plots via [P] or [E], and dismantle anytime with [Q].
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 1. Compost Heap (50 Verdure) */}
                <div className={`border p-4 rounded-2xl flex flex-col justify-between gap-3 shadow transition-all ${
                  focusedShopIdx === 0
                    ? 'bg-slate-850 ring-4 ring-lime-400 border-lime-300 scale-[1.01] shadow-[0_0_20px_rgba(163,230,53,0.5)]'
                    : 'bg-slate-900/80 border-lime-500/40'
                }`}>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-lime-950/80 border border-lime-500/50 flex items-center justify-center overflow-hidden shrink-0">
                          {assets['tool_compost_heap']?.src ? (
                            <img src={assets['tool_compost_heap'].src} alt="Compost Heap" className="w-9 h-9 object-contain" />
                          ) : (
                            <span className="text-2xl">🍂</span>
                          )}
                        </div>
                        <div>
                          <h4 className="font-bold text-sm sm:text-base text-slate-100 flex items-center gap-1.5">
                            {focusedShopIdx === 0 && <span className="text-lime-400 text-xs">► [E/A]</span>}
                            <span>Compost Heap</span>
                          </h4>
                          <span className="text-xs text-lime-400 font-bold">Passive Organic Decomposition (10s Cycle)</span>
                        </div>
                      </div>
                      <span className="text-xs bg-slate-950 text-lime-300 border border-lime-600/40 px-2 py-0.5 rounded-lg font-mono font-bold">
                        Stock: {getStructureInventoryCount(inv, 'tool_compost_heap')}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      Rustic slatted cedar timber compost bin box. Deposit up to 20 Organic Waste to passively decompose into usable Enriched Organic Compost (~10s per batch). Collect finished compost with 1 click!
                    </p>
                  </div>

                  <button
                    disabled={inv.coins < 50}
                    onClick={() => buyTool('tool_compost_heap', 50, 'Compost Heap')}
                    className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all shadow flex items-center justify-center gap-1.5 ${
                      inv.coins >= 50
                        ? 'bg-lime-600 hover:bg-lime-500 text-white active:scale-95'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}>
                    <VerdureIcon className="w-3.5 h-3.5" />
                    <span>Purchase Compost Heap (50 Verdure)</span>
                  </button>
                </div>

                {/* 2. Stone Well (75 Verdure) */}
                <div className={`border p-4 rounded-2xl flex flex-col justify-between gap-3 shadow transition-all ${
                  focusedShopIdx === 1
                    ? 'bg-slate-850 ring-4 ring-sky-400 border-sky-300 scale-[1.01] shadow-[0_0_20px_rgba(56,189,248,0.5)]'
                    : 'bg-slate-900/80 border-sky-500/40'
                }`}>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-sky-950/80 border border-sky-500/50 flex items-center justify-center overflow-hidden shrink-0">
                          {assets['tool_garden_well']?.src ? (
                            <img src={assets['tool_garden_well'].src} alt="Stone Well" className="w-9 h-9 object-contain" />
                          ) : (
                            <span className="text-2xl">💧</span>
                          )}
                        </div>
                        <div>
                          <h4 className="font-bold text-sm sm:text-base text-slate-100 flex items-center gap-1.5">
                            {focusedShopIdx === 1 && <span className="text-sky-400 text-xs">► [E/A]</span>}
                            <span>Stone Well</span>
                          </h4>
                          <span className="text-xs text-sky-400 font-bold">3×3 Grid Irrigation (20 Seconds)</span>
                        </div>
                      </div>
                      <span className="text-xs bg-slate-950 text-sky-300 border border-sky-600/40 px-2 py-0.5 rounded-lg font-mono font-bold">
                        Stock: {getStructureInventoryCount(inv, 'tool_garden_well')}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      Traditional stone well with timber awning and bucket crank. Interacting [E] cranks the bucket windlass to draw fresh groundwater and water all Bonsais in its surrounding 3×3 grid for 20 seconds!
                    </p>
                  </div>

                  <button
                    disabled={inv.coins < 75}
                    onClick={() => buyTool('tool_garden_well', 75, 'Stone Well')}
                    className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all shadow flex items-center justify-center gap-1.5 ${
                      inv.coins >= 75
                        ? 'bg-sky-600 hover:bg-sky-500 text-white active:scale-95'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}>
                    <VerdureIcon className="w-3.5 h-3.5" />
                    <span>Purchase Stone Well (75 Verdure)</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* FOOTER CONTROLLER & KEYBOARD PROMPTS STRIP */}
          <div className="pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 shrink-0 mt-1">
            <span className="font-mono text-amber-400 text-[11px] hidden sm:inline">
              🎮 [A/D / LB/RB] Switch Tabs • [W/S] Select Item • [E / A] Purchase • [Arrows / R-Stick] Scroll • [Esc / B] Close
            </span>
            <button
              onClick={() => setIsShopModalOpen(false)}
              className="px-5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold transition-all border border-slate-700">
              Close [Esc / B]
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: BONSAI INSPECTION & TIERED AUTOMATON / SELL / PICK UP */}
      {/* ========================================================================= */}
      <BonsaiInspectionModal
        isOpen={!!inspectingBonsai}
        onClose={() => setInspectingBonsaiId(null)}
        bonsai={inspectingBonsai || null}
        synergies={
          inspectingBonsai
            ? getCachedBonsaiSynergies(inspectingBonsai)
            : {
                bonsaiCount: 0,
                wallCount: 0,
                rockCount: 0,
                bushCount: 0,
                decorCount: 0,
                pebbleCount: 0,
                energyCount: 0,
                hasAdjacentBonsai: false,
                hasAdjacentWall: false,
                hasAdjacentRock: false,
                hasAdjacentBush: false,
                hasAdjacentDecor: false,
                hasAdjacentPebbles: false,
                hasAdjacentEnergy: false,
                growthMultiplier: 1,
                expMultiplier: 1,
                quickPruneBonus: 0,
                growingTogetherBonus: 0,
                privateGrowingBonus: 0,
                isStalled: false,
                maxIdenticalCount: 0,
              }
        }
        powerSufficient={power.isPowerSufficient}
        inventory={inv}
        greenThumbRank={zenSkillsRef.current.greenThumb || 0}
        onDonate={donatePlantedBonsai}
        onStore={pickUpBonsaiToInventory}
        onCompost={applyOrganicCompost}
        onPrune={manualPruneBonsai}
        onAttachAutomaton={attachAutomatonTier}
        onDetachAutomaton={detachAutomaton}
      />

      {/* ========================================================================= */}
      {/* MODAL: EXCAVATION RESULTS SCREEN */}
      {/* ========================================================================= */}
      <BonsaiExcavationModal
        isOpen={!!excavationResult}
        result={excavationResult}
        onCollect={handleCollectExcavatedSeedling}
        onDecline={handleDeclineExcavatedSeedling}
      />

      {/* ========================================================================= */}
      {/* MODAL: EXCURSION REPORT SCREEN */}
      {/* ========================================================================= */}
      {excursionReport && (
        <MenuOverlay tone={excursionReport.safeReturn ? 'victory' : 'danger'} zIndex={80}>
          <div className="w-full max-w-lg bg-slate-900 border-2 border-amber-500 rounded-2xl p-6 shadow-2xl flex flex-col text-left">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Truck className="w-6 h-6 text-amber-400" />
                <h3 className="text-xl font-black text-amber-300">Excursion Report: {excursionReport.biomeName}</h3>
              </div>
            </div>

            <div
              className={`p-3.5 rounded-xl border mb-4 flex items-center gap-3 ${
                excursionReport.safeReturn
                  ? 'bg-emerald-950/90 border-emerald-500 text-emerald-200'
                  : 'bg-rose-950/90 border-rose-500 text-rose-200'
              }`}>
              {excursionReport.safeReturn ? (
                <CheckCircle2 className="w-7 h-7 text-emerald-400 shrink-0" />
              ) : (
                <AlertTriangle className="w-7 h-7 text-rose-400 shrink-0" />
              )}
              <div>
                <h4 className="font-bold text-sm">
                  {excursionReport.safeReturn
                    ? 'Safe Return to Campsite (100% Haul Retained)'
                    : 'Battery Depleted - Emergency Tow (35% Retained Penalty)'}
                </h4>
                <p className="text-xs opacity-80">
                  {excursionReport.safeReturn
                    ? 'The Expedition Rover made it safely back to the campsite portal with battery to spare.'
                    : 'The Rover ran out of battery in the wild! Emergency tow recovered 35% of your haul.'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs mb-4">
              <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                <div className="text-slate-400">Max Distance</div>
                <div className="text-base font-black text-amber-300">{excursionReport.distanceReached} steps</div>
              </div>
              <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                <div className="text-slate-400">Battery Left</div>
                <div className="text-base font-black text-sky-300">{excursionReport.batteryRemaining} kWh</div>
              </div>
              <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                <div className="text-slate-400">Total Weight</div>
                <div className="text-base font-black text-emerald-300">{excursionReport.totalWeight} kg</div>
              </div>
            </div>

            <div className="bg-slate-950/90 border border-slate-800 p-3 rounded-xl mb-4 max-h-[35vh] overflow-y-auto space-y-2">
              <div className="text-xs font-bold text-slate-300 border-b border-slate-800 pb-1">
                Harvested Materials & Saplings Breakdown:
              </div>

              {excursionReport.items.map((item) => (
                <div key={item.key} className="flex items-center justify-between text-xs py-1 border-b border-slate-900">
                  <span className="text-slate-300">{item.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-emerald-400">+{item.retained} Retained</span>
                    {item.lost > 0 && <span className="text-rose-400 line-through">({item.lost} Lost)</span>}
                  </div>
                </div>
              ))}

              {excursionReport.saplings.length > 0 && (
                <div className="pt-1">
                  <div className="text-[11px] font-bold text-amber-400 mb-1">Excavated Saplings:</div>
                  {excursionReport.saplings.map((sap, i) => (
                    <div key={i} className="flex items-center justify-between text-xs py-0.5">
                      <span className="text-slate-300">🌿 {sap.name} ({sap.rarity})</span>
                      <span className={`font-bold ${sap.retained ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {sap.retained ? '✓ Retained' : '✗ Lost in Wild'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={depositHaulAndReturnToSanctuary}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg min-h-[44px] flex items-center justify-center gap-2 text-sm">
              <CheckCircle2 className="w-5 h-5" />
              Deposit Retained Loot & Return to Sanctuary
            </button>
          </div>
        </MenuOverlay>
      )}

      {/* ========================================================================= */}
      {/* MODAL: WORKBENCH CRAFTING & MODULAR LOADOUT MANAGER */}
      {/* ========================================================================= */}
      {isWorkbenchModalOpen && (() => {
        const totalAttached = installedCraftingArmsRef.current + autoFabricatorLanesRef.current.length;
        const maxCapacity = getWorkbenchAutomatonCapacity(inv.workbench_tier || 1);

        return (
          <div className="fixed top-12 left-0 right-0 bottom-0 z-40 bg-slate-950/95 backdrop-blur-md p-3 sm:p-5 flex flex-col overflow-hidden border-t border-slate-800 text-left">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-3 shrink-0">
              <div className="flex items-center gap-3">
                <Wrench className="w-6 h-6 text-emerald-400" />
                <div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <h2 className="text-xl font-bold text-emerald-100">Artisan Workbench</h2>
                    <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-900/60 border border-emerald-500/30 text-emerald-300">
                      Tier {inv.workbench_tier || 1}{inv.workbench_tier === 3 ? ': Master Fabricator' : inv.workbench_tier === 2 ? ': Precision Foundry' : ''}
                    </span>
                    <button
                      onClick={() => {
                        setWorkbenchTab(workbenchTab === 'modules' ? 'workbench' : 'modules');
                        gameAudio.playCrispClick();
                      }}
                      className={`text-xs font-bold px-3 py-1 rounded-xl border transition-all flex items-center gap-1.5 shadow active:scale-95 ${
                        workbenchTab === 'modules'
                          ? 'bg-cyan-600 text-white border-cyan-400 ring-2 ring-cyan-400/40'
                          : totalAttached >= maxCapacity
                          ? 'bg-amber-950/80 text-amber-300 border-amber-500/60 hover:bg-amber-900'
                          : 'bg-emerald-950/80 text-emerald-300 border-emerald-500/60 hover:bg-emerald-900'
                      }`}>
                      <span>⚙️</span>
                      <span>Manage Modules: {totalAttached} / {maxCapacity} Max</span>
                      <span className="text-[10px] opacity-75 font-normal">({workbenchTab === 'modules' ? 'Viewing' : 'Open'})</span>
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Manual Queue: <strong>{getTotalQueuedCount()} / {getMaxCraftingQueueCapacity()} Slots</strong> • Craft Speed: <strong className="text-emerald-300">+{installedCraftingArmsRef.current * 25}%</strong> • Attached Load: <strong className="text-amber-300">{power.craftingPowerDrain + power.autoFabricatorPowerDrain} kW</strong>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsWorkbenchModalOpen(false)}
                className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Inventory Materials Strip */}
            <div className="bg-slate-900/90 border border-slate-800 px-3 py-2 rounded-2xl mb-3 flex flex-wrap items-center justify-between gap-2 text-xs shrink-0">
              <span>🔩 Scrap: <strong className="text-slate-200 font-mono">{inv.scrap_metal ?? inv.scrapMetal ?? 0}</strong></span>
              <span>⚡ Wire: <strong className="text-orange-400 font-mono">{inv.copper_wire ?? inv.copperWire ?? 0}</strong></span>
              <span>⚙️ Gears: <strong className="text-yellow-400 font-mono">{inv.brass_gears ?? inv.gears ?? 0}</strong></span>
              <span>🟩 Circuits: <strong className="text-emerald-400 font-mono">{inv.circuit_boards ?? inv.microcircuits ?? 0}</strong></span>
              <span>💎 Chips: <strong className="text-purple-400 font-mono">{inv.electronic_chips ?? inv.chips ?? inv.quantumChips ?? 0}</strong></span>
              <span>🍂 Waste: <strong className="text-lime-400 font-mono">{inv.organic_waste ?? inv.organicWaste ?? 0}</strong></span>
              <span>🌾 Compost: <strong className="text-amber-300 font-mono">{inv.organic_compost ?? inv.enrichedCompost ?? 0}</strong></span>
            </div>

            {/* ACTIVE MANUAL CRAFTING STATUS & QUEUE BANNER */}
            {activeCraftingRef.current && (() => {
              const active = activeCraftingRef.current;
              const percent = Math.min(
                100,
                Math.max(
                  0,
                  ((active.totalTime - active.remainingTime) / active.totalTime) * 100,
                ),
              );
              return (
                <div className="bg-sky-950/60 border border-sky-500/60 p-2.5 rounded-2xl mb-3 shrink-0">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <div className="flex items-center gap-2 font-bold text-sky-200">
                      <span className="text-sm">{active.icon}</span>
                      <span>Manual Queue: {active.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`font-bold ${power.isPowerSufficient ? 'text-sky-300 font-mono' : 'text-amber-400'}`}>
                        {power.isPowerSufficient ? `${active.remainingTime.toFixed(1)}s remaining (${percent.toFixed(0)}%)` : '⚡ Paused (Low Power)'}
                      </span>
                      <button
                        onClick={() => cancelQueuedCraft(-1)}
                        className="bg-red-900/80 hover:bg-red-800 text-red-200 px-2 py-0.5 rounded text-[10px] font-bold">
                        Cancel & Refund
                      </button>
                    </div>
                  </div>

                  <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-sky-800/80 relative">
                    <div
                      style={{
                        width: `${percent}%`,
                      }}
                      className={`h-full transition-all duration-75 ${power.isPowerSufficient ? 'bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.6)]' : 'bg-amber-400'}`}
                    />
                  </div>

                  {/* Queued Backlog Items */}
                  {craftingQueueRef.current.length > 0 && (
                    <div className="mt-2 pt-1.5 border-t border-sky-800/40 space-y-1">
                      <div className="text-[10px] font-bold text-sky-300/80 uppercase">
                        Queued In Manual Backlog ({craftingQueueRef.current.length}):
                      </div>
                      <div className="space-y-1 max-h-16 overflow-y-auto">
                        {craftingQueueRef.current.map((qItem, qIdx) => (
                          <div
                            key={qItem.id}
                            className="flex items-center justify-between text-[11px] bg-slate-900/70 px-2 py-0.5 rounded border border-slate-800">
                            <span className="text-slate-300">
                              {qItem.icon} {qItem.name} ({qItem.totalTime}s)
                            </span>
                            <button
                              onClick={() => cancelQueuedCraft(qIdx)}
                              className="text-red-400 hover:text-red-300 text-[10px] font-semibold">
                              Cancel
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* WORKBENCH SUBMENU TABS */}
            <div className="grid grid-cols-5 gap-1.5 mb-3 shrink-0">
              <button
                onClick={() => {
                  setWorkbenchTab('resources');
                  gameAudio.playCrispClick();
                }}
                className={`py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1 transition-all ${
                  workbenchTab === 'resources' || workbenchTab === 'compost'
                    ? 'bg-emerald-600 text-white shadow-md ring-2 ring-emerald-400/40'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-750'
                }`}>
                <span>📦</span>
                <span className="truncate">Resources</span>
              </button>

              <button
                onClick={() => {
                  setWorkbenchTab('bonsai_automatons');
                  gameAudio.playCrispClick();
                }}
                className={`py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1 transition-all ${
                  workbenchTab === 'bonsai_automatons' || workbenchTab === 'automatons'
                    ? 'bg-sky-600 text-white shadow-md ring-2 ring-sky-400/40'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-750'
                }`}>
                <span>💧</span>
                <span className="truncate">Bonsai Automatons</span>
              </button>

              <button
                onClick={() => {
                  setWorkbenchTab('workbench');
                  gameAudio.playCrispClick();
                }}
                className={`py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1 transition-all ${
                  workbenchTab === 'workbench' || workbenchTab === 'upgrades'
                    ? 'bg-indigo-600 text-white shadow-md ring-2 ring-indigo-400/40'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-750'
                }`}>
                <span>🛠️</span>
                <span className="truncate">Workbench</span>
              </button>

              <button
                onClick={() => {
                  setWorkbenchTab('rover');
                  gameAudio.playCrispClick();
                }}
                className={`py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1 transition-all ${
                  workbenchTab === 'rover'
                    ? 'bg-purple-600 text-white shadow-md ring-2 ring-purple-400/40'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-750'
                }`}>
                <span>🚜</span>
                <span className="truncate">Rover</span>
              </button>

              <button
                onClick={() => {
                  setWorkbenchTab('electricity');
                  gameAudio.playCrispClick();
                }}
                className={`py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1 transition-all ${
                  workbenchTab === 'electricity'
                    ? 'bg-amber-600 text-white shadow-md ring-2 ring-amber-400/40'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-750'
                }`}>
                <span>⚡</span>
                <span className="truncate">Energy</span>
              </button>
            </div>

            {/* TAB: INSTALLED MODULES & AUTOMATED PRODUCTION LANES (ACCESSED VIA HEADER BUTTON) */}
            {workbenchTab === 'modules' && (
              <div className="flex-1 space-y-3 mb-3 overflow-y-auto pr-1">
                {/* Back to Recipes Header Strip */}
                <div className="flex items-center justify-between bg-cyan-950/60 border border-cyan-500/40 p-3 rounded-2xl">
                  <div>
                    <h4 className="font-bold text-sm text-cyan-200 flex items-center gap-1.5">
                      <span>⚙️ Workbench Modular Loadout Manager</span>
                    </h4>
                    <p className="text-[11px] text-cyan-300/80">
                      Capacity: <strong>{totalAttached} / {maxCapacity} Units</strong> • Attached Drain: <strong>{power.craftingPowerDrain + power.autoFabricatorPowerDrain} kW</strong>
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setWorkbenchTab('workbench');
                      gameAudio.playCrispClick();
                    }}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs px-3 py-1.5 rounded-xl border border-slate-600 transition-all flex items-center gap-1">
                    <span>← Back to Recipes</span>
                  </button>
                </div>

                {/* 1. Crafting Assembly Arms Manager */}
                <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Wrench className="w-5 h-5 text-sky-400" />
                      <div>
                        <h4 className="font-bold text-xs sm:text-sm text-slate-100">
                          Installed Crafting Assembly Arms ({installedCraftingArmsRef.current})
                        </h4>
                        <span className="text-[11px] text-sky-300">
                          +{installedCraftingArmsRef.current * 25}% Speed • +{installedCraftingArmsRef.current} Manual Queue Slots • {installedCraftingArmsRef.current * 3} kW Drain
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        disabled={installedCraftingArmsRef.current <= 0}
                        onClick={detachCraftingArm}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          installedCraftingArmsRef.current > 0
                            ? 'bg-amber-700 hover:bg-amber-600 text-white shadow active:scale-95'
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        }`}>
                        Detach (-)
                      </button>
                      <button
                        disabled={inv.crafting_automatons_inv <= 0 || totalAttached >= maxCapacity}
                        onClick={attachCraftingArm}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          inv.crafting_automatons_inv > 0 && totalAttached < maxCapacity
                            ? 'bg-sky-600 hover:bg-sky-500 text-white shadow active:scale-95'
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        }`}>
                        Attach (+) ({inv.crafting_automatons_inv} in Bag)
                      </button>
                    </div>
                  </div>
                </div>

                {/* 2. Dedicated Auto-Fabrication Production Lanes */}
                <div className="bg-slate-900/90 border border-cyan-500/40 p-3.5 rounded-2xl space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl">🏭</span>
                      <div>
                        <h4 className="font-bold text-xs sm:text-sm text-cyan-200">
                          Dedicated Automated Production Lanes ({autoFabricatorLanesRef.current.length})
                        </h4>
                        <span className="text-[11px] text-cyan-400/80">
                          Independent continuous synthesis loop • 10 kW Drain per attached lane
                        </span>
                      </div>
                    </div>

                    <button
                      disabled={inv.auto_fabricators_inv <= 0 || totalAttached >= maxCapacity}
                      onClick={attachAutoFabricatorLane}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        inv.auto_fabricators_inv > 0 && totalAttached < maxCapacity
                          ? 'bg-cyan-600 hover:bg-cyan-500 text-white shadow active:scale-95'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}>
                      + Attach Auto-Lane ({inv.auto_fabricators_inv} in Bag)
                    </button>
                  </div>

                  {autoFabricatorLanesRef.current.length === 0 ? (
                    <div className="p-3 text-center text-xs text-slate-400 bg-slate-950/60 rounded-2xl border border-slate-800">
                      No automated production lanes attached. Craft an <strong>Auto-Fabrication Automaton</strong> and attach it to run dedicated continuous recipe loops!
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {autoFabricatorLanesRef.current.map((lane, laneIdx) => {
                        const targetRecipe = lane.targetRecipeId !== 'none' ? WORKBENCH_RECIPES[lane.targetRecipeId] : null;
                        const pct = targetRecipe && lane.progressSeconds > 0 ? Math.min(100, (lane.progressSeconds / targetRecipe.durationSeconds) * 100) : 0;

                        return (
                          <div
                            key={lane.id}
                            className="bg-slate-950/90 border border-cyan-500/30 p-3 rounded-2xl space-y-2">
                            <div className="flex items-center justify-between text-xs">
                              <div className="flex items-center gap-2 font-bold text-cyan-200">
                                <span className="bg-cyan-950 border border-cyan-500/50 px-2 py-0.5 rounded-lg text-xs">
                                  Lane {laneIdx + 1}
                                </span>
                                <span className="text-xs sm:text-sm">
                                  {targetRecipe ? `${targetRecipe.icon} ${targetRecipe.name}` : '🛑 Halted / No Recipe Assigned'}
                                </span>
                              </div>

                              <div className="flex items-center gap-2">
                                <span className={`text-xs font-bold ${power.isPowerSufficient ? (lane.progressSeconds > 0 ? 'text-cyan-300' : 'text-slate-400') : 'text-rose-400'}`}>
                                  {power.isPowerSufficient ? (lane.progressSeconds > 0 ? `⏱️ Active (${lane.progressSeconds.toFixed(1)}s)` : 'Waiting Ingredients') : '⚡ Low Power'}
                                </span>
                                <button
                                  onClick={() => detachAutoFabricatorLane(lane.id)}
                                  className="bg-red-900/80 hover:bg-red-800 text-red-200 px-2.5 py-0.5 rounded-lg text-xs font-bold transition-all">
                                  Detach (-)
                                </button>
                              </div>
                            </div>

                            {/* Live Lane Progress Bar */}
                            {targetRecipe && (
                              <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-cyan-900/80">
                                <div
                                  style={{width: `${pct}%`}}
                                  className={`h-full transition-all ${power.isPowerSufficient ? 'bg-cyan-400' : 'bg-amber-400'}`}
                                />
                              </div>
                            )}

                            {/* Recipe Assignment Selector Buttons */}
                            <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-800/80">
                              <span className="text-[10px] text-slate-400 font-bold uppercase">Assign Recipe:</span>
                              <button
                                onClick={() => setAutoFabricatorLaneRecipe(lane.id, 'none')}
                                className={`px-2 py-0.5 rounded-lg text-xs font-bold transition-all ${
                                  lane.targetRecipeId === 'none'
                                    ? 'bg-slate-700 text-white border border-slate-500'
                                    : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
                                }`}>
                                🛑 Halt
                              </button>
                              <button
                                onClick={() => setAutoFabricatorLaneRecipe(lane.id, 'craft_copper_wire')}
                                className={`px-2 py-0.5 rounded-lg text-xs font-bold transition-all ${
                                  lane.targetRecipeId === 'craft_copper_wire'
                                    ? 'bg-orange-600 text-white border border-orange-400'
                                    : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
                                }`}>
                                ⚡ Wire
                              </button>
                              <button
                                onClick={() => setAutoFabricatorLaneRecipe(lane.id, 'craft_gears')}
                                className={`px-2 py-0.5 rounded-lg text-xs font-bold transition-all ${
                                  lane.targetRecipeId === 'craft_gears'
                                    ? 'bg-yellow-600 text-white border border-yellow-400'
                                    : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
                                }`}>
                                ⚙️ Gears
                              </button>
                              <button
                                onClick={() => setAutoFabricatorLaneRecipe(lane.id, 'craft_microcircuits')}
                                className={`px-2 py-0.5 rounded-lg text-xs font-bold transition-all ${
                                  lane.targetRecipeId === 'craft_microcircuits'
                                    ? 'bg-emerald-600 text-white border border-emerald-400'
                                    : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
                                }`}>
                                🟩 Circuits
                              </button>
                              <button
                                onClick={() => setAutoFabricatorLaneRecipe(lane.id, 'craft_quantum_chips')}
                                className={`px-2 py-0.5 rounded-lg text-xs font-bold transition-all ${
                                  lane.targetRecipeId === 'craft_quantum_chips'
                                    ? 'bg-purple-600 text-white border border-purple-400'
                                    : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
                                }`}>
                                💎 Chips
                              </button>
                              {inv.has_compost_guide && (
                                <button
                                  onClick={() => setAutoFabricatorLaneRecipe(lane.id, 'craft_enriched_compost')}
                                  className={`px-2 py-0.5 rounded-lg text-xs font-bold transition-all ${
                                    lane.targetRecipeId === 'craft_enriched_compost'
                                      ? 'bg-lime-600 text-white border border-lime-400'
                                      : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
                                  }`}>
                                  🌾 Compost
                                </button>
                              )}
                              <button
                                onClick={() => setAutoFabricatorLaneRecipe(lane.id, 'solar_panel')}
                                className={`px-2 py-0.5 rounded-lg text-xs font-bold transition-all ${
                                  lane.targetRecipeId === 'solar_panel'
                                    ? 'bg-sky-600 text-white border border-sky-400'
                                    : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
                                }`}>
                                ☀️ Solar
                              </button>
                              <button
                                onClick={() => setAutoFabricatorLaneRecipe(lane.id, 'wind_turbine')}
                                className={`px-2 py-0.5 rounded-lg text-xs font-bold transition-all ${
                                  lane.targetRecipeId === 'wind_turbine'
                                    ? 'bg-amber-600 text-white border border-amber-400'
                                    : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
                                }`}>
                                💨 Turbine
                              </button>
                              <button
                                onClick={() => setAutoFabricatorLaneRecipe(lane.id, 'crafting_automaton')}
                                className={`px-2 py-0.5 rounded-lg text-xs font-bold transition-all ${
                                  lane.targetRecipeId === 'crafting_automaton'
                                    ? 'bg-cyan-600 text-white border border-cyan-400'
                                    : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
                                }`}>
                                🤖 Arm
                              </button>
                              {inv.has_tier1_guide && (
                                <button
                                  onClick={() => setAutoFabricatorLaneRecipe(lane.id, 'tier1_automaton')}
                                  className={`px-2 py-0.5 rounded-lg text-xs font-bold transition-all ${
                                    lane.targetRecipeId === 'tier1_automaton'
                                      ? 'bg-sky-600 text-white border border-sky-400'
                                      : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
                                  }`}>
                                  💧 T1 Mist
                                </button>
                              )}
                              {inv.has_tier2_guide && (
                                <button
                                  onClick={() => setAutoFabricatorLaneRecipe(lane.id, 'tier2_automaton')}
                                  className={`px-2 py-0.5 rounded-lg text-xs font-bold transition-all ${
                                    lane.targetRecipeId === 'tier2_automaton'
                                      ? 'bg-purple-600 text-white border border-purple-400'
                                      : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
                                  }`}>
                                  ⚡ T2 Pulsar
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* RECIPES LIST FILTERED BY ACTIVE SUBMENU TAB (WHEN NOT ON MODULES TAB) */}
            {workbenchTab !== 'modules' && (() => {
              const renderRecipeCard = (recipeId: CraftingRecipeId, cardIdx?: number) => {
                const recipe = WORKBENCH_RECIPES[recipeId];
                if (!recipe) return null;
                const costs = recipe.costs;
                const isGuideLocked = recipe.requiresGuide ? !inv[recipe.requiresGuide] : false;
                const isFocused = cardIdx !== undefined && focusedWbIdx === cardIdx;

                const hasScrap = !costs.scrap_metal || (inv.scrap_metal ?? 0) >= costs.scrap_metal;
                const hasWire = !costs.copper_wire || (inv.copper_wire ?? 0) >= costs.copper_wire;
                const hasGears = !costs.brass_gears || (inv.brass_gears ?? 0) >= costs.brass_gears;
                const hasCircuits = !costs.circuit_boards || (inv.circuit_boards ?? 0) >= costs.circuit_boards;
                const hasChips = !costs.electronic_chips || (inv.electronic_chips ?? 0) >= costs.electronic_chips;
                const hasWaste = !costs.organic_waste || (inv.organic_waste ?? 0) >= costs.organic_waste;

                const isT2AlreadyActive = recipeId === 'workbench_t2_upgrade' && (inv.workbench_tier || 1) >= 2;
                const isT3AlreadyActive = recipeId === 'workbench_t3_upgrade' && (inv.workbench_tier || 1) >= 3;
                const isT3PrereqMissing = recipeId === 'workbench_t3_upgrade' && (inv.workbench_tier || 1) < 2;

                const isAlreadyInstalled = isT2AlreadyActive || isT3AlreadyActive;
                const isPrereqMissing = isT3PrereqMissing;

                const isQueuedOrCrafting =
                  activeCraftingRef.current?.recipeId === recipeId ||
                  craftingQueueRef.current.some((it) => it.recipeId === recipeId);

                const canAfford =
                  hasScrap &&
                  hasWire &&
                  hasGears &&
                  hasCircuits &&
                  hasChips &&
                  hasWaste &&
                  !isGuideLocked &&
                  !isAlreadyInstalled &&
                  !isPrereqMissing &&
                  !isQueuedOrCrafting;

                const queueFull = getTotalQueuedCount() >= getMaxCraftingQueueCapacity();

                const costStrings: string[] = [];
                if (costs.organic_waste) costStrings.push(`${costs.organic_waste} Organic Waste`);
                if (costs.scrap_metal) costStrings.push(`${costs.scrap_metal} Scrap Metal`);
                if (costs.copper_wire) costStrings.push(`${costs.copper_wire} Copper Wire`);
                if (costs.brass_gears) costStrings.push(`${costs.brass_gears} Mechanical Gears`);
                if (costs.circuit_boards) costStrings.push(`${costs.circuit_boards} Microcircuits`);
                if (costs.electronic_chips) costStrings.push(`${costs.electronic_chips} Quantum Chips`);

                // Resource category specific telemetry
                const isResourceRecipe = recipe.category === 'resources' || recipe.category === 'compost';

                // Determine input and output current stock counts
                let inputStock = 0;
                let inputNeeded = 0;
                let inputLabel = '';
                let outputStock = 0;
                let outputLabel = '';

                if (recipeId === 'craft_copper_wire') {
                  inputStock = inv.scrap_metal ?? inv.scrapMetal ?? 0;
                  inputNeeded = 4;
                  inputLabel = 'Scrap Metal';
                  outputStock = inv.copper_wire ?? inv.copperWire ?? 0;
                  outputLabel = 'Copper Wire';
                } else if (recipeId === 'craft_gears') {
                  inputStock = inv.copper_wire ?? inv.copperWire ?? 0;
                  inputNeeded = 4;
                  inputLabel = 'Copper Wire';
                  outputStock = inv.brass_gears ?? inv.gears ?? 0;
                  outputLabel = 'Mechanical Gears';
                } else if (recipeId === 'craft_microcircuits') {
                  inputStock = inv.brass_gears ?? inv.gears ?? 0;
                  inputNeeded = 4;
                  inputLabel = 'Mechanical Gears';
                  outputStock = inv.circuit_boards ?? inv.microcircuits ?? 0;
                  outputLabel = 'Microcircuits';
                } else if (recipeId === 'craft_quantum_chips') {
                  inputStock = inv.circuit_boards ?? inv.microcircuits ?? 0;
                  inputNeeded = 4;
                  inputLabel = 'Microcircuits';
                  outputStock = inv.electronic_chips ?? inv.chips ?? inv.quantumChips ?? 0;
                  outputLabel = 'Quantum Chips';
                } else if (recipeId === 'craft_enriched_compost') {
                  inputStock = inv.organic_waste ?? inv.organicWaste ?? 0;
                  inputNeeded = 2;
                  inputLabel = 'Organic Waste';
                  outputStock = inv.organic_compost ?? inv.enrichedCompost ?? 0;
                  outputLabel = 'Enriched Compost';
                }

                const canInstantCraft =
                  hasScrap &&
                  hasWire &&
                  hasGears &&
                  hasCircuits &&
                  hasChips &&
                  hasWaste &&
                  !isGuideLocked &&
                  !isAlreadyInstalled;

                return (
                  <div
                    key={recipeId}
                    className={`p-3.5 rounded-2xl border flex flex-col justify-between gap-2.5 transition-all shadow-sm ${
                      isFocused
                        ? 'bg-slate-850 ring-4 ring-sky-400 border-sky-300 scale-[1.01] shadow-[0_0_20px_rgba(56,189,248,0.5)]'
                        : isAlreadyInstalled
                        ? 'bg-emerald-950/40 border-emerald-500/40'
                        : isQueuedOrCrafting
                        ? 'bg-sky-950/40 border-sky-500/50'
                        : isGuideLocked || isPrereqMissing
                        ? 'bg-slate-900/50 border-amber-500/30 opacity-80'
                        : isResourceRecipe
                        ? 'bg-slate-900/90 border-slate-750 hover:border-emerald-500/50'
                        : 'bg-slate-900/80 border-slate-800'
                    }`}>
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-9 h-9 rounded-xl border flex items-center justify-center text-lg shrink-0 shadow-inner ${
                              isAlreadyInstalled
                                ? 'bg-emerald-950 border-emerald-500 text-emerald-300'
                                : isQueuedOrCrafting
                                ? 'bg-sky-950 border-sky-400 text-sky-300'
                                : isGuideLocked || isPrereqMissing
                                ? 'bg-amber-950/50 border-amber-500/40 text-amber-300'
                                : isResourceRecipe
                                ? 'bg-slate-950 border-emerald-500/40'
                                : 'bg-slate-950 border-slate-700'
                            }`}>
                            {isAlreadyInstalled ? '✓' : isQueuedOrCrafting ? '⏳' : isGuideLocked || isPrereqMissing ? '🔒' : recipe.icon}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-bold text-xs sm:text-sm text-slate-100">{recipe.name}</h4>
                              {isGuideLocked && (
                                <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/50 px-2 py-0.5 rounded-full font-black flex items-center gap-1">
                                  <Lock className="w-3 h-3" />
                                  <span>Locked</span>
                                </span>
                              )}
                              {isResourceRecipe && recipeId.startsWith('craft_') && recipeId !== 'craft_enriched_compost' && (
                                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 px-2 py-0.2 rounded-full font-black">
                                  4:1 Ratio
                                </span>
                              )}
                              {recipeId === 'craft_enriched_compost' && (
                                <span className="text-[10px] bg-lime-500/20 text-lime-300 border border-lime-500/50 px-2 py-0.2 rounded-full font-black">
                                  2:1 Ratio
                                </span>
                              )}
                            </div>
                            {!isGuideLocked && !isAlreadyInstalled && !isPrereqMissing && (
                              <span className="text-[10px] text-sky-400 font-mono">
                                ⏱️ {recipe.durationSeconds}s Craft Duration
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <p className="text-xs text-slate-400 mb-2 leading-relaxed">{recipe.description}</p>

                      {/* Resource Inventory Stocks Card */}
                      {isResourceRecipe && inputLabel && (
                        <div className="bg-slate-950/80 p-2 rounded-xl border border-slate-800 text-[11px] mb-2 flex items-center justify-between">
                          <span className="text-slate-400">
                            Input: <strong className={inputStock >= inputNeeded ? 'text-emerald-300' : 'text-rose-400'}>{inputStock}</strong> / {inputNeeded} {inputLabel}
                          </span>
                          <span className="text-slate-400">
                            Current Stock: <strong className="text-amber-300 font-mono">{outputStock} {outputLabel}</strong>
                          </span>
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="text-[10px] text-slate-300 bg-slate-950/80 p-1.5 rounded-xl border border-slate-800 mb-2">
                        Exchange Cost: <span className="text-amber-300 font-semibold">{costStrings.join(', ')}</span>
                      </div>

                      {isGuideLocked ? (
                        <div className="space-y-1.5">
                          <div className="text-xs font-semibold text-amber-400 bg-amber-950/40 px-2.5 py-1.5 rounded-xl border border-amber-500/30 flex items-center gap-1.5">
                            <Lock className="w-3.5 h-3.5 shrink-0" />
                            <span>Requires <strong>{recipe.guideName || 'Guidebook'}</strong> from Botanical Market</span>
                          </div>
                          <button
                            disabled
                            className="w-full py-2 rounded-xl font-bold text-xs bg-slate-800 text-slate-500 cursor-not-allowed flex items-center justify-center gap-1.5 border border-slate-700/60">
                            <Lock className="w-3.5 h-3.5" />
                            <span>Queue Craft (Requires {recipe.guideName || 'Guidebook'})</span>
                          </button>
                        </div>
                      ) : isPrereqMissing ? (
                        <div className="text-xs font-semibold text-amber-400 bg-amber-950/40 px-2.5 py-1.5 rounded-xl border border-amber-500/30 flex items-center gap-1.5">
                          <Lock className="w-3.5 h-3.5 shrink-0" />
                          <span>Requires Previous Tier First</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => enqueueCraftingRecipe(recipeId)}
                          disabled={!canAfford || queueFull}
                          className={`w-full py-2 rounded-xl font-bold text-xs transition-all shadow ${
                            isAlreadyInstalled
                              ? 'bg-slate-800 text-emerald-400 border border-emerald-500/40 cursor-default'
                              : queueFull
                              ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                              : canAfford
                              ? 'bg-sky-600 hover:bg-sky-500 text-white active:scale-95'
                              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                          }`}>
                          {isAlreadyInstalled
                            ? '✓ Installed'
                            : queueFull
                            ? 'Queue Full'
                            : `Queue Craft (${recipe.durationSeconds}s)`}
                        </button>
                      )}
                    </div>
                  </div>
                );
              };

              return (
                <div className="flex-1 space-y-2.5 mb-3 overflow-y-auto pr-1">
                  {workbenchTab === 'workbench' || workbenchTab === 'upgrades' ? (
                    <div className="space-y-3">
                      {/* Sub-header 1: Workbench Chassis Upgrades */}
                      <div>
                        <div className="text-xs font-bold text-sky-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <Wrench className="w-3.5 h-3.5" />
                            <span>Workbench Chassis Upgrades (Current: Tier {inv.workbench_tier || 1} - {getWorkbenchName(inv.workbench_tier || 1)})</span>
                          </span>
                          <span className="text-[11px] text-slate-400 font-normal">
                            Capacity: {getWorkbenchAutomatonCapacity(inv.workbench_tier || 1)} Units Max
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {(inv.workbench_tier || 1) >= 3 ? (
                            <div className="p-3.5 rounded-2xl border bg-amber-950/40 border-amber-500/50 flex flex-col justify-between gap-2.5 shadow col-span-1 sm:col-span-2">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-amber-950 border border-amber-400 flex items-center justify-center text-xl text-amber-300">
                                  👑
                                </div>
                                <div>
                                  <h4 className="font-bold text-sm text-slate-100">Master Foundry (Tier 3 Max)</h4>
                                  <span className="text-xs text-amber-400 font-bold">10 Unit Automaton Capacity • Maximum Workbench Frame</span>
                                </div>
                              </div>
                              <p className="text-xs text-slate-400 leading-relaxed">
                                Gilded master forge and nanite assembly core installed. Maximum modular capacity unlocked (10 units).
                              </p>
                              <div className="w-full py-2 bg-amber-950/80 border border-amber-500/50 rounded-xl text-center text-xs font-black text-amber-300">
                                ★ Maximum Workbench Tier Achieved ★
                              </div>
                            </div>
                          ) : (inv.workbench_tier || 1) === 1 ? (
                            <>
                              {renderRecipeCard('workbench_t2_upgrade', 0)}
                              {renderRecipeCard('workbench_t3_upgrade', 1)}
                            </>
                          ) : (
                            <>
                              <div className="p-3.5 rounded-2xl border bg-sky-950/40 border-sky-500/50 flex flex-col justify-between gap-2 shadow">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-8 h-8 rounded-xl bg-sky-950 border border-sky-400 flex items-center justify-center text-lg text-sky-300">
                                    ✓
                                  </div>
                                  <div>
                                    <h4 className="font-bold text-xs sm:text-sm text-slate-100">Precision Workbench (Tier 2)</h4>
                                    <span className="text-[10px] text-sky-400 font-bold">Active: 5 Units Capacity</span>
                                  </div>
                                </div>
                                <div className="text-[11px] text-slate-400">Reinforced chassis frame with precision brass rails.</div>
                              </div>
                              {renderRecipeCard('workbench_t3_upgrade', 1)}
                            </>
                          )}
                        </div>
                      </div>

                      {/* Sub-header 2: Workbench Modules */}
                      <div className="pt-2 border-t border-slate-800">
                        <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <Package className="w-3.5 h-3.5" />
                            <span>Workbench Modules (Craft & Install in Manage Modules)</span>
                          </span>
                          <span className="text-[11px] text-slate-400 font-normal">
                            Installed: {totalAttached} / {maxCapacity} Units
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {renderRecipeCard('crafting_automaton', 2)}
                          {renderRecipeCard('auto_fabricator', 3)}
                        </div>
                      </div>
                    </div>
                  ) : workbenchTab === 'rover' ? (
                    <div className="space-y-3">
                      {/* Chassis Tier Section */}
                      <div>
                        <div className="text-xs font-bold text-sky-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <Truck className="w-3.5 h-3.5" />
                            <span>Rover Chassis Upgrades (Current: Tier {inv.rover_chassis_tier || 1} - {getRoverChassisName(inv.rover_chassis_tier || 1)})</span>
                          </span>
                          <span className="text-[11px] text-slate-400 font-normal">
                            Slots: {getRoverChassisMaxSlots(inv.rover_chassis_tier || 1)} Modules Max
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {(inv.rover_chassis_tier || 1) >= 3 ? (
                            <div className="p-3.5 rounded-2xl border bg-amber-950/40 border-amber-500/50 flex flex-col justify-between gap-2.5 shadow col-span-1 sm:col-span-2">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-amber-950 border border-amber-400 flex items-center justify-center text-xl text-amber-300">
                                  👑
                                </div>
                                <div>
                                  <h4 className="font-bold text-sm text-slate-100">Vanguard Heavy Chassis (Tier 3 Max)</h4>
                                  <span className="text-xs text-amber-400 font-bold">10 Module Slots Active • Maximum Chassis Frame</span>
                                </div>
                              </div>
                              <p className="text-xs text-slate-400 leading-relaxed">
                                Heavy titanium vanguard frame installed. Maximum Rover module outfitting capacity unlocked (10 slots).
                              </p>
                              <div className="w-full py-2 bg-amber-950/80 border border-amber-500/50 rounded-xl text-center text-xs font-black text-amber-300">
                                ★ Maximum Chassis Tier Achieved ★
                              </div>
                            </div>
                          ) : (inv.rover_chassis_tier || 1) === 1 ? (
                            <>
                              {renderRecipeCard('rover_chassis_t2', 0)}
                              {renderRecipeCard('rover_chassis_t3', 1)}
                            </>
                          ) : (
                            <>
                              <div className="p-3.5 rounded-2xl border bg-sky-950/40 border-sky-500/50 flex flex-col justify-between gap-2 shadow">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-8 h-8 rounded-xl bg-sky-950 border border-sky-400 flex items-center justify-center text-lg text-sky-300">
                                    ✓
                                  </div>
                                  <div>
                                    <h4 className="font-bold text-xs sm:text-sm text-slate-100">Surveyor Chassis (Tier 2)</h4>
                                    <span className="text-[10px] text-sky-400 font-bold">Active: 5 Module Slots</span>
                                  </div>
                                </div>
                                <div className="text-[11px] text-slate-400">Current active chassis frame with 5 module bays.</div>
                              </div>
                              {renderRecipeCard('rover_chassis_t3', 1)}
                            </>
                          )}
                        </div>
                      </div>

                      {/* Modular Outfitting Modules Section */}
                      <div className="pt-2 border-t border-slate-800">
                        <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <Package className="w-3.5 h-3.5" />
                            <span>Modular Rover Upgrades (Craft & Attach in Rover Loadout)</span>
                          </span>
                          <span className="text-[11px] text-slate-400 font-normal">Physical Detachable Modules</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {renderRecipeCard('rover_storage_module_1', 2)}
                          {renderRecipeCard('rover_storage_module_2', 3)}
                          {renderRecipeCard('rover_storage_module_3', 4)}
                          {renderRecipeCard('rover_battery_module_1', 5)}
                          {renderRecipeCard('rover_battery_module_2', 6)}
                          {renderRecipeCard('rover_battery_module_3', 7)}
                          {renderRecipeCard('rover_radar_module_1', 8)}
                          {renderRecipeCard('rover_radar_module_2', 9)}
                          {renderRecipeCard('rover_radar_module_3', 10)}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {(
                        [
                          'craft_copper_wire',
                          'craft_gears',
                          'craft_microcircuits',
                          'craft_quantum_chips',
                          'craft_enriched_compost',
                          'tier1_automaton',
                          'tier2_automaton',
                          'tier3_automaton',
                          'solar_panel',
                          'wind_turbine',
                        ] as CraftingRecipeId[]
                      )
                        .filter((recipeId) => {
                          const r = WORKBENCH_RECIPES[recipeId];
                          if (!r) return false;
                          if (workbenchTab === 'resources' || workbenchTab === 'compost') {
                            return r.category === 'resources' || r.category === 'compost';
                          }
                          if (workbenchTab === 'bonsai_automatons' || workbenchTab === 'automatons') {
                            return r.category === 'bonsai_automatons' || r.category === 'automatons';
                          }
                          return r.category === workbenchTab;
                        })
                        .map((recipeId, rIdx) => renderRecipeCard(recipeId, rIdx))}
                    </div>
                  )}
                </div>
              );
            })()}

            {/* FOOTER CONTROLLER & KEYBOARD PROMPTS STRIP */}
            <div className="pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 shrink-0 mt-1">
              <span className="font-mono text-sky-400 text-[11px] hidden sm:inline">
                🎮 [A/D / LB/RB] Switch Tabs • [W/S] Select • [E / A] Queue Craft • [Arrows / R-Stick] Scroll • [Esc / B] Close
              </span>
              <button
                onClick={() => setIsWorkbenchModalOpen(false)}
                className="px-5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold transition-all border border-slate-700">
                Close [Esc / B]
              </button>
            </div>
          </div>
        );
      })()}

      {/* ========================================================================= */}
      {/* MODAL: ZEN LIBRARY (BONDEX, SKILLS, MILESTONES) */}
      {/* ========================================================================= */}
      <ZenLibraryModal
        isOpen={isZenSkillsModalOpen}
        onClose={() => setIsZenSkillsModalOpen(false)}
        zenEssence={inv.zen_essence}
        playerLevel={inv.player_level}
        playerExp={inv.player_exp}
        zenSkills={zenSkillsRef.current}
        upgradeZenSkill={upgradeZenSkill}
        stats={statsRef.current}
        claimAchievement={claimAchievement}
        plantedBonsais={plantedBonsaisRef.current}
        storedPottedBonsais={storedPottedBonsaisRef.current}
        discoveredSpeciesMap={bondexDiscoveryRef.current}
        inventory={sanctuaryInventoryRef.current}
        deployedStructures={deployedStructuresRef.current}
        installedCraftingArms={installedCraftingArmsRef.current}
        discoveredAreaSpecies={areaDiscoveryRef.current.species}
      />

      {/* ========================================================================= */}
      {/* MODAL: GRAND MASTERY GOAL (LAYERED OVER GAME MENU) */}
      {/* ========================================================================= */}
      {isGoalModalOpen && (
        <MenuOverlay tone="neutral" zIndex={1200}>
          <div className="w-full max-w-md bg-slate-900 border-2 border-yellow-500 rounded-2xl p-6 shadow-2xl flex flex-col text-left">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Trophy className="w-6 h-6 text-yellow-400" />
                <h3 className="text-xl font-black text-yellow-300">Grand Mastery Goal</h3>
              </div>
              <button
                onClick={() => setIsGoalModalOpen(false)}
                className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-yellow-950/70 border border-yellow-500/70 p-4 rounded-xl mb-4 text-center shadow-[0_0_20px_rgba(250,204,21,0.2)]">
              <div className="w-12 h-12 mx-auto rounded-xl bg-yellow-500/20 border-2 border-yellow-400 flex items-center justify-center text-yellow-300 text-2xl font-black mb-2 shadow">
                五
              </div>
              <h4 className="font-black text-base text-yellow-300">Cultivate any Premium (五, Rank V) Bonsai to Level 100!</h4>
              <p className="text-xs text-yellow-100/90 mt-2 leading-relaxed">
                Embark on deep expeditions to the <strong>Ancient Caldera / Overgrowth</strong> (&gt;1000m) to unearth a sacred <strong>Premium (五, Rank V)</strong> wild seedling. Nurture it in your sanctuary to <strong>Level 100 Mastery</strong> with high-tier automatons, organic compost, and harmonious 3x3 synergies for ultimate victory!
              </p>
            </div>

            <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 mb-4 flex items-center justify-between">
              <span className="text-xs text-slate-300 font-semibold">Highest Premium (五) Mastery:</span>
              <span className="text-base font-black text-yellow-400">
                {highestPremiumLevel > 0 ? `Level ${highestPremiumLevel} / 100` : 'Not Yet Cultivated'}
              </span>
            </div>

            <button
              onClick={() => setIsGoalModalOpen(false)}
              className="w-full bg-yellow-600 hover:bg-yellow-500 text-slate-950 font-black py-2.5 rounded-xl transition-colors min-h-[40px] shadow">
              Understood
            </button>
          </div>
        </MenuOverlay>
      )}

      {/* --- OVERLAYS: ZERO-SCROLL FULLSCREEN TITLE SCREEN ON GAME LAUNCH --- */}
      {gameState.status === 'START' && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-slate-950 p-4 select-none">
          <div className="w-full max-w-md bg-slate-900/95 border-2 border-emerald-500 rounded-3xl p-5 md:p-6 flex flex-col items-center shadow-2xl text-center backdrop-blur-md">
            <div className="w-14 h-14 md:w-16 md:h-16 bg-emerald-950/90 border-2 border-emerald-400/50 rounded-2xl flex items-center justify-center mb-3 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
              <Sprout className="w-8 h-8 md:w-9 md:h-9 animate-pulse" />
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-emerald-400 tracking-wide mb-1 font-serif">
              BONSAI AUTOMATA
            </h1>
            <p className="text-[11px] sm:text-xs text-emerald-300 font-bold uppercase tracking-widest mb-3">
              Zen Botanical Cultivation & Automation
            </p>
            <p className="text-xs sm:text-sm text-slate-300 mb-4 leading-relaxed max-w-sm">
              Cultivate 20 distinct leaf-shape bonsai types across 7 sacred Tree Type Groups (<strong>Raundo</strong>, <strong>Erementaru</strong>, <strong>Roku-men</strong>, <strong>Seikatsu</strong>, <strong>Sanmen</strong>, <strong>Shihen</strong>, <strong>Jinkō-teki</strong>) in authentic <strong>Chokan</strong>, <strong>Moyogi</strong>, and <strong>Shakan</strong> styles, design automated mist irrigation loops, drive your Rover through wilderness biomes, trade at the Botanical Market, and nurture any <strong>Premium (五, Rank V) Bonsai</strong> to <strong>Level 100</strong>!
            </p>

            <div className="w-full space-y-2 max-w-xs">
              <button
                onClick={() => {
                  setGameState((prev) => ({...prev, status: 'PLAYING'}));
                  gameAudio.playPowerupChime();
                  if (sdk) {
                    sdk.startGame();
                  }
                }}
                autoFocus
                className={`w-full font-black text-sm sm:text-base py-3 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  titleMenuIdx === 0
                    ? 'bg-emerald-400 hover:bg-emerald-300 text-slate-950 ring-4 ring-emerald-300/80 scale-105 shadow-[0_0_25px_rgba(52,211,153,0.7)]'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                }`}>
                <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
                <span>{titleMenuIdx === 0 ? '► START GAME [E / A]' : 'START GAME [E / A]'}</span>
              </button>

              <button
                onClick={() => {
                  setIsHowToPlayOpen(true);
                  gameAudio.playCrispClick();
                }}
                className={`w-full font-bold text-xs sm:text-sm py-2.5 rounded-2xl transition-all flex items-center justify-center gap-2 border cursor-pointer ${
                  titleMenuIdx === 1
                    ? 'bg-slate-700 text-white ring-4 ring-emerald-400/80 scale-105 border-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.5)]'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                }`}>
                <HelpCircle className="w-4 h-4 text-emerald-400" />
                <span>{titleMenuIdx === 1 ? '► How to Play [E/A]' : '📖 How to Play (5 Chapters)'}</span>
              </button>

              <button
                onClick={() => {
                  setIsGameMenuOpen(true);
                  gameAudio.playCrispClick();
                }}
                className={`w-full font-bold text-xs sm:text-sm py-2 rounded-2xl transition-all flex items-center justify-center gap-2 border cursor-pointer ${
                  titleMenuIdx === 2
                    ? 'bg-slate-700 text-white ring-4 ring-sky-400/80 scale-105 border-sky-400 shadow-[0_0_20px_rgba(56,189,248,0.5)]'
                    : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border-slate-700/80'
                }`}>
                <Wrench className="w-4 h-4 text-sky-400" />
                <span>{titleMenuIdx === 2 ? '► Settings [E/A]' : '⚙️ Settings & Controls'}</span>
              </button>
            </div>
            <div className="mt-4 text-[11px] text-slate-400 font-mono">
              🎮 [W/S / D-Pad] Select Option • [E / Enter / A / Space] Start Game
            </div>
          </div>
        </div>
      )}

      {/* --- OVERLAYS: GAME MENU / SETTINGS --- */}
      {isGameMenuOpen && (
        <MenuOverlay tone="neutral" zIndex={1010}>
          <div className="w-full max-w-md bg-slate-900 border-2 border-slate-700 rounded-2xl p-6 shadow-2xl flex flex-col items-center">
            <h2 className="text-2xl font-black text-emerald-400 mb-6">⚙️ GAME MENU & SETTINGS</h2>

            <div className="w-full space-y-3 mb-6">
              <button
                onClick={() => {
                  setIsGameMenuOpen(false);
                  if (gameState.status === 'START') {
                    setGameState((prev) => ({...prev, status: 'PLAYING'}));
                  }
                  gameAudio.playCrispClick();
                }}
                className={`w-full font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 min-h-[48px] ${
                  focusedMenuIdx === 0
                    ? 'bg-emerald-500 text-slate-950 ring-2 ring-emerald-300 scale-[1.02] shadow-[0_0_15px_rgba(16,185,129,0.5)]'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                }`}>
                <Play className="w-5 h-5" />
                {gameState.status === 'START' ? 'Enter Sanctuary [E / A]' : 'Resume Cultivation [E / A]'}
              </button>

              {/* Fullscreen Mode Toggle Button */}
              <button
                onClick={() => {
                  toggleFullscreen();
                  gameAudio.playCrispClick();
                }}
                className={`w-full font-bold text-xs py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 min-h-[44px] border ${
                  focusedMenuIdx === 1
                    ? 'bg-sky-500 text-slate-950 border-sky-300 ring-2 ring-sky-300/80 scale-[1.02] shadow-[0_0_15px_rgba(56,189,248,0.5)]'
                    : isFullscreen
                    ? 'bg-sky-950/80 hover:bg-sky-900 text-sky-200 border-sky-500/50'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                }`}>
                <Maximize2 className="w-4 h-4 text-sky-400" />
                <span>Fullscreen Mode: [{isFullscreen ? 'ON' : 'OFF'}]</span>
              </button>

              <button
                onClick={() => {
                  setIsGoalModalOpen(true);
                  gameAudio.playCrispClick();
                }}
                className={`w-full font-semibold text-xs py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 min-h-[44px] border ${
                  focusedMenuIdx === 2
                    ? 'bg-yellow-900 text-yellow-100 border-yellow-400 ring-2 ring-yellow-400/50 scale-[1.02]'
                    : 'bg-yellow-950/80 hover:bg-yellow-900 text-yellow-200 border-yellow-500/40'
                }`}>
                <Trophy className="w-4 h-4 text-yellow-400" />
                🏆 View Mastery Goal (Level 100 Premium)
              </button>

              <button
                onClick={() => {
                  setIsHowToPlayOpen(true);
                  gameAudio.playCrispClick();
                }}
                className={`w-full font-semibold text-xs py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 min-h-[44px] border ${
                  focusedMenuIdx === 3
                    ? 'bg-slate-700 text-white border-emerald-400 ring-2 ring-emerald-400/50 scale-[1.02]'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                }`}>
                <HelpCircle className="w-4 h-4" />
                📖 How to Play Guide (5 Chapters)
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    const muted = gameAudio.toggleMute();
                    setIsSfxMuted(muted);
                  }}
                  className={`font-semibold text-xs py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 min-h-[44px] border ${
                    focusedMenuIdx === 4
                      ? 'bg-slate-700 text-white border-sky-400 ring-2 ring-sky-400/50 scale-[1.02]'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                  }`}>
                  {isSfxMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
                  SFX: {isSfxMuted ? 'Off' : 'On'}
                </button>

                <button
                  onClick={() => setIsMusicMuted((prev) => !prev)}
                  className={`font-semibold text-xs py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 min-h-[44px] border ${
                    focusedMenuIdx === 5
                      ? 'bg-slate-700 text-white border-sky-400 ring-2 ring-sky-400/50 scale-[1.02]'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                  }`}>
                  {isMusicMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
                  Music: {isMusicMuted ? 'Off' : 'On'}
                </button>
              </div>

              <button
                onClick={initGame}
                className={`w-full font-semibold text-xs py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 min-h-[44px] border ${
                  focusedMenuIdx === 6
                    ? 'bg-amber-900/90 text-amber-200 border-amber-400 ring-2 ring-amber-400/50 scale-[1.02]'
                    : 'bg-slate-800/80 hover:bg-slate-700 text-amber-400 border-slate-700'
                }`}>
                <RotateCw className="w-4 h-4" />
                Restart Sanctuary
              </button>
            </div>

            <div className="w-full pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span className="font-mono text-emerald-400 text-[11px]">
                🎮 [W/S / ↑↓] Navigate • [E / A] Select • [Esc / B / -] Close
              </span>
              <button
                onClick={() => {
                  setIsGameMenuOpen(false);
                  setGameState((prev) => ({...prev, status: 'START'}));
                }}
                className="text-xs text-slate-400 hover:text-slate-200 transition-colors">
                Quit to Title
              </button>
            </div>
          </div>
        </MenuOverlay>
      )}

      {/* --- OVERLAYS: STRUCTURED 5-CHAPTER HOW TO PLAY GUIDE --- */}
      {isHowToPlayOpen && (
        <MenuOverlay tone="neutral" zIndex={1250}>
          <div className="w-full max-w-2xl bg-slate-900 border-2 border-emerald-500 rounded-3xl p-5 md:p-7 shadow-2xl flex flex-col text-left">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
              <div className="flex items-center gap-2.5">
                <BookOpen className="w-6 h-6 text-emerald-400" />
                <div>
                  <h3 className="text-xl font-black text-emerald-400">Botanist Field Guide</h3>
                  <p className="text-xs text-slate-400">Mastery Handbook in 5 Distinct Chapters</p>
                </div>
              </div>
              <button
                onClick={() => setIsHowToPlayOpen(false)}
                className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 5 CHAPTER TABS */}
            <div className="grid grid-cols-5 gap-1.5 mb-3 shrink-0">
              {[
                {id: 1, label: '1. Goal', icon: '🏆'},
                {id: 2, label: '2. Expeditions', icon: '🚙'},
                {id: 3, label: '3. Automation', icon: '⚙️'},
                {id: 4, label: '4. Decor & Halos', icon: '✨'},
                {id: 5, label: '5. Zen Mastery', icon: '🌸'},
              ].map((ch) => (
                <button
                  key={ch.id}
                  onClick={() => {
                    setGuidebookChapter(ch.id);
                    gameAudio.playCrispClick();
                  }}
                  className={`py-2 px-1 rounded-xl text-[11px] sm:text-xs font-bold flex flex-col sm:flex-row items-center justify-center gap-1 transition-all ${
                    guidebookChapter === ch.id
                      ? 'bg-emerald-600 text-white shadow-md ring-2 ring-emerald-400/40'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-750'
                  }`}>
                  <span>{ch.icon}</span>
                  <span className="truncate">{ch.label}</span>
                </button>
              ))}
            </div>

            {/* CHAPTER CONTENT CONTAINER */}
            <div className="text-xs md:text-sm text-slate-300 overflow-y-auto max-h-[58vh] pr-2 space-y-3">
              {/* CHAPTER 1: THE ULTIMATE GOAL */}
              {guidebookChapter === 1 && (
                <div className="space-y-3">
                  <div className="bg-slate-950/80 border border-yellow-500/40 p-4 rounded-2xl space-y-2">
                    <div className="flex items-center gap-2 font-black text-yellow-300 text-sm sm:text-base">
                      <span className="text-xl">🏆</span>
                      <span>Chapter 1: The Ultimate Goal & Maturity Progression</span>
                    </div>
                    <p className="text-slate-200 leading-relaxed">
                      Your overarching objective as the Sanctuary Botanist is to cultivate any <strong>Premium (五, Rank V) Bonsai to Level 100 Mastery</strong>! Unearth rare root specimens from deep expeditions, balance your sanctuary with clean electricity, and nurture your tree to the pinnacle of botanical prestige.
                    </p>
                    <p className="text-xs text-yellow-200/90 leading-relaxed">
                      <strong>Maturity-Specific Growth Scaling:</strong> Growth requirements scale per level based on the bonsai's Maturity tier: <strong>Sprout (一): 1.0x baseline</strong> (fastest early progression), <strong>Sapling (二): 1.4x</strong>, <strong>Notable (三): 2.0x</strong>, <strong>Refined (四): 2.8x</strong>, and <strong>Premium (五): 4.0x</strong> growth dedication needed for top economic payoff and deepest late-game cultivation challenge.
                    </p>
                  </div>

                  <div className="bg-slate-950/60 border border-slate-800 p-3.5 rounded-2xl space-y-2">
                    <h4 className="font-bold text-slate-100 flex items-center gap-2 text-xs sm:text-sm">
                      <span className="text-emerald-400">🌱</span>
                      <span>Sanctuary Grid Balance & Clean Power</span>
                    </h4>
                    <p className="text-slate-300 text-xs leading-relaxed">
                      The Sanctuary contains up to <strong>128 nursery plots</strong>. You must carefully balance your physical plots between:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-slate-400 pl-1 text-xs">
                      <li><strong>Living Bonsai Trees:</strong> Nurture diverse botanical species through manual pruning or automated sprayers.</li>
                      <li><strong>Clean Power Generators:</strong> Deploy Solar Panels and Wind Turbines directly on open plots to generate electricity.</li>
                      <li><strong>Garden Decorations:</strong> Place pebble paths, rockeries, topiary shrubs, and lattice walls to maximize proximity synergies.</li>
                    </ul>
                  </div>

                  <div className="bg-slate-950/60 border border-slate-800 p-3.5 rounded-2xl space-y-2">
                    <h4 className="font-bold text-slate-100 flex items-center gap-2 text-xs sm:text-sm">
                      <span className="text-amber-400">⚡</span>
                      <span>Power Grid Equilibrium</span>
                    </h4>
                    <p className="text-slate-300 text-xs leading-relaxed">
                      Every attached irrigation automaton, assembly arm, and auto-fabrication lane demands electrical power (kW). If total generator output falls below demand, automatons and crafting will halt until more power is deployed!
                    </p>
                  </div>
                </div>
              )}

              {/* CHAPTER 2: EXPEDITIONS & PLANTING */}
              {guidebookChapter === 2 && (
                <div className="space-y-3">
                  <div className="bg-slate-950/80 border border-emerald-500/40 p-4 rounded-2xl space-y-2">
                    <div className="flex items-center gap-2 font-black text-emerald-300 text-sm sm:text-base">
                      <span className="text-xl">🚙</span>
                      <span>Chapter 2: Expeditions & Planting</span>
                    </div>
                    <p className="text-slate-200 leading-relaxed">
                      The sanctuary cannot thrive in isolation. Venture out into uncharted wilderness biomes to forage rare saplings and salvage essential technological scrap.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div className="bg-slate-950/70 border border-emerald-500/30 p-3 rounded-2xl space-y-1">
                      <span className="text-xs font-bold text-emerald-300 block">1. Sunlit Foothills</span>
                      <span className="text-[11px] text-slate-400 block">Drain: 1 kWh/step</span>
                      <p className="text-[11px] text-slate-300">Alpine Pine saplings, Scrap Metal, and Copper Wire.</p>
                    </div>

                    <div className="bg-slate-950/70 border border-sky-500/30 p-3 rounded-2xl space-y-1">
                      <span className="text-xs font-bold text-sky-300 block">2. Misty Highlands</span>
                      <span className="text-[11px] text-slate-400 block">Drain: 2 kWh/step</span>
                      <p className="text-[11px] text-slate-300">Sakura & Maple saplings, Brass Gears, and Circuit Boards.</p>
                    </div>

                    <div className="bg-slate-950/70 border border-purple-500/30 p-3 rounded-2xl space-y-1">
                      <span className="text-xs font-bold text-purple-300 block">3. Ancient Overgrowth</span>
                      <span className="text-[11px] text-slate-400 block">Drain: 3 kWh/step</span>
                      <p className="text-[11px] text-slate-300">Royal Wisteria & Mythic Golden Ginkgo, Electronic Chips.</p>
                    </div>
                  </div>

                  <div className="bg-slate-950/60 border border-slate-800 p-3.5 rounded-2xl space-y-2">
                    <h4 className="font-bold text-slate-100 flex items-center gap-2 text-xs sm:text-sm">
                      <span className="text-amber-400">🥄</span>
                      <span>Precision Shovel Excavation (Species-Scaled Arc & 100% Success)</span>
                    </h4>
                    <p className="text-slate-300 text-xs leading-relaxed">
                      Wild saplings must be excavated through the <strong>radial shovel minigame</strong>. Time your strike to hit root targets on the dial. The <strong>angular hit arc width</strong> scales directly from the bonsai species' find probability in the current biome (50% odds = ~36°-38° arc; 100% odds = ~60° wide arc). The <strong>number of digging sites</strong> is governed by Maturity tier (Sprout: 2 sites up to Premium: 6 sites). You must achieve a 100% hit rate before shovel strikes expire!
                    </p>
                  </div>

                  <div className="bg-slate-950/60 border border-slate-800 p-3.5 rounded-2xl space-y-2">
                    <h4 className="font-bold text-slate-100 flex items-center gap-2 text-xs sm:text-sm">
                      <span className="text-emerald-400">🎋</span>
                      <span>Three Classical Bonsai Growth Styles</span>
                    </h4>
                    <p className="text-slate-300 text-xs leading-relaxed">
                      When planting any sapling on the nursery grid, choose from 3 authentic styles with bespoke branch silhouettes:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-slate-400 pl-1 text-xs">
                      <li><strong>直幹 Chokan (Formal Upright):</strong> Tapering straight vertical trunk with symmetrical horizontal branch pads.</li>
                      <li><strong>模様木 Moyogi (Informal Upright):</strong> Elegant S-curve trunk with undulating natural curvature and balanced foliage.</li>
                      <li><strong>斜幹 Shakan (Slanting Style):</strong> Windswept angled trunk (35-45°) with deep counterbalancing branch canopy.</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* CHAPTER 3: AUTOMATION & WORKBENCH */}
              {guidebookChapter === 3 && (
                <div className="space-y-3">
                  <div className="bg-slate-950/80 border border-sky-500/40 p-4 rounded-2xl space-y-2">
                    <div className="flex items-center gap-2 font-black text-sky-300 text-sm sm:text-base">
                      <span className="text-xl">⚙️</span>
                      <span>Chapter 3: Automation & Workbench</span>
                    </div>
                    <p className="text-slate-200 leading-relaxed">
                      Transform manual gardening into an automated engineering marvel using the Sanctuary Workbench.
                    </p>
                  </div>

                  <div className="bg-slate-950/60 border border-slate-800 p-3.5 rounded-2xl space-y-2">
                    <h4 className="font-bold text-slate-100 flex items-center gap-2 text-xs sm:text-sm">
                      <span className="text-sky-400">🤖</span>
                      <span>Modular Workbench Loadout</span>
                    </h4>
                    <ul className="list-disc list-inside space-y-1 text-slate-400 pl-1 text-xs">
                      <li><strong>Crafting Assembly Automatons:</strong> Modular arm units that attach to the Workbench. Each unit grants <strong>+1 manual queue slot</strong> and <strong>+25% craft speed</strong> (3 kW load).</li>
                      <li><strong>Auto-Fabrication Automatons:</strong> Dedicated continuous automated synthesis lanes (10 kW). Runs independent production loops continuously without occupying manual queue slots!</li>
                      <li><strong>Workbench Tier Upgrades:</strong> Upgrade from Artisan (T1, 3 units) to Precision (T2, 5 units) and Master Foundry (T3, 10 units).</li>
                    </ul>
                  </div>

                  <div className="bg-slate-950/60 border border-slate-800 p-3.5 rounded-2xl space-y-2">
                    <h4 className="font-bold text-slate-100 flex items-center gap-2 text-xs sm:text-sm">
                      <span className="text-cyan-400">💧</span>
                      <span>Tiered Irrigation Automatons</span>
                    </h4>
                    <p className="text-slate-300 text-xs leading-relaxed">
                      Attach sprayers to individual potted trees to water them continuously without manual pruning:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-slate-400 pl-1 text-xs">
                      <li><strong>Tier 1 Mist Automaton:</strong> 1.0x baseline growth speed (2 kW).</li>
                      <li><strong>Tier 2 Pulsar Automaton:</strong> 2.5x accelerated growth speed (4 kW).</li>
                      <li><strong>Tier 3 Master Hydro-Automaton:</strong> 5.0x ultra growth speed (7 kW).</li>
                    </ul>
                  </div>

                  <div className="bg-slate-950/60 border border-slate-800 p-3.5 rounded-2xl space-y-2">
                    <h4 className="font-bold text-slate-100 flex items-center gap-2 text-xs sm:text-sm">
                      <span className="text-lime-400">🌾</span>
                      <span>Enriched Organic Compost</span>
                    </h4>
                    <p className="text-slate-300 text-xs leading-relaxed">
                      Every bonsai level-up generates <strong>+1 Organic Waste</strong>. Recycle waste at the Workbench into <strong>Enriched Organic Compost</strong>, which shaves <strong>-30s</strong> off any tree's growth countdown and awards <strong>+15 Botanist EXP</strong>!
                    </p>
                  </div>
                </div>
              )}

              {/* CHAPTER 4: MARKET TRADE, DECOR & PROXIMITY HALOS */}
              {guidebookChapter === 4 && (
                <div className="space-y-3">
                  <div className="bg-slate-950/80 border border-amber-500/40 p-4 rounded-2xl space-y-2">
                    <div className="flex items-center gap-2 font-black text-amber-300 text-sm sm:text-base">
                      <span className="text-xl">✨</span>
                      <span>Chapter 4: Market Trade, Decor & Proximity Halos</span>
                    </div>
                    <p className="text-slate-200 leading-relaxed">
                      Trade mature trees at the Botanical Market to fund expansions, purchase decor, and harness the powerful 3x3 proximity resonance system.
                    </p>
                  </div>

                  <div className="bg-slate-950/60 border border-slate-800 p-3.5 rounded-2xl space-y-2">
                    <h4 className="font-bold text-slate-100 flex items-center gap-2 text-xs sm:text-sm">
                      <span className="text-amber-400">🏪</span>
                      <span>Botanical Market & Greenhouse Expansions</span>
                    </h4>
                    <p className="text-slate-300 text-xs leading-relaxed">
                      Donate mature bonsais to ecological restoration for Verdure (values scale steeply from Lv.1 to Lv.100 and with rarity). Spend Verdure on:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-slate-400 pl-1 text-xs">
                      <li><strong>Greenhouse Expansions (I-IV):</strong> Expand from 16 starter plots to 32, 64, 96, and the full 128-plot nursery floor!</li>
                      <li><strong>Cartography Charts:</strong> Unlock the Misty Highlands (250 Verdure) and Ancient Overgrowth (800 Verdure).</li>
                      <li><strong>Rover Modular Progression:</strong> Purchase Rover T2/T3 Blueprints and Storage/Battery Guidebooks to craft modular chassis upgrades and outfitting units at the Workbench!</li>
                    </ul>
                  </div>

                  <div className="bg-slate-950/60 border border-slate-800 p-3.5 rounded-2xl space-y-2">
                    <h4 className="font-bold text-slate-100 flex items-center gap-2 text-xs sm:text-sm">
                      <span className="text-emerald-400">✨</span>
                      <span>The 3x3 Proximity Halo Mechanics (Fully Stackable)</span>
                    </h4>
                    <p className="text-slate-300 text-xs leading-relaxed">
                      Every entity on the nursery grid projects a 3x3 halo affecting its 8 surrounding neighbors:
                    </p>
                    <div className="space-y-1.5 text-xs text-slate-300 mt-2">
                      <div className="bg-slate-900/90 p-2 rounded-xl border border-sky-500/30">
                        <strong className="text-sky-300">☀️/💨 Clean Energy Resonance:</strong> +0.5 kW per adjacent Solar Panel, +1.0 kW per adjacent Wind Turbine. Cluster generators together for massive power bonuses!
                      </div>
                      <div className="bg-slate-900/90 p-2 rounded-xl border border-emerald-500/30">
                        <strong className="text-emerald-300">🌿 Growing Together:</strong> Each neighboring Bonsai in the 3x3 zone grants <strong>+10% Hydration Growth Speed</strong> (stackable). Up to 4 adjacent bonsais can coexist without stalling!
                      </div>
                      <div className="bg-slate-900/90 p-2 rounded-xl border border-amber-500/30">
                        <strong className="text-amber-300">🎋 Private Growing:</strong> Each neighboring Woven Lattice Wall in the 3x3 zone grants <strong>+10% Hydration Growth Speed</strong> with its own independent counter. 4 walls and 4 bonsais safely give +80% Hydration Growth Speed!
                      </div>
                      <div className="bg-slate-900/90 p-2 rounded-xl border border-slate-700">
                        <strong className="text-slate-200">🪨 Quick Prune:</strong> Each neighboring Zen Rock Formation in the 3x3 zone grants <strong>+0.25s Pruning Effect</strong> to manual care.
                      </div>
                      <div className="bg-slate-900/90 p-2 rounded-xl border border-emerald-500/30">
                        <strong className="text-emerald-300">🌿 XP Boosted:</strong> Each neighboring Topiary Shrubbery Bush in the 3x3 zone grants <strong>+15% Level Up Experience</strong>.
                      </div>
                      <div className="bg-slate-900/90 p-2 rounded-xl border border-slate-700">
                        <strong className="text-slate-200">🪨 Zen Pebble Path:</strong> Moving along pebble paths grants a <strong>+35% movement speed boost</strong>! Pure pathway flooring that does not trigger or contribute to stalling surroundings.
                      </div>
                      <div className="bg-slate-900/90 p-2 rounded-xl border border-rose-500/30">
                        <strong className="text-rose-300">⛔ Stalling Surroundings Penalty:</strong> 5 or more adjacent bonsais (regardless of species) or 5 or more of any identical structure (e.g. 5 walls) triggers Total Growth Stagnation (0% Growth Rate).
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* CHAPTER 5: ZEN MASTERY & ACHIEVEMENTS */}
              {guidebookChapter === 5 && (
                <div className="space-y-3">
                  <div className="bg-slate-950/80 border border-pink-500/40 p-4 rounded-2xl space-y-2">
                    <div className="flex items-center gap-2 font-black text-pink-300 text-sm sm:text-base">
                      <span className="text-xl">🌸</span>
                      <span>Chapter 5: Zen Mastery & Achievements</span>
                    </div>
                    <p className="text-slate-200 leading-relaxed">
                      Every action in Bonsai Automata fuels your personal Botanist progression, awarding Zen Points for powerful permanent perks.
                    </p>
                  </div>

                  <div className="bg-slate-950/60 border border-slate-800 p-3.5 rounded-2xl space-y-2">
                    <h4 className="font-bold text-slate-100 flex items-center gap-2 text-xs sm:text-sm">
                      <span className="text-pink-400">🌸</span>
                      <span>Botanist Level & Zen Point Economy</span>
                    </h4>
                    <p className="text-slate-300 text-xs leading-relaxed">
                      Earn Botanist EXP through manual pruning, harvesting resource nodes, successfully excavating seedlings, applying compost, and tree level-ups. Every time your Botanist Level increases, you gain <strong>+2 Zen Points (🌸)</strong> to spend at the Zen Library!
                    </p>
                  </div>

                  <div className="bg-slate-950/60 border border-slate-800 p-3.5 rounded-2xl space-y-2">
                    <h4 className="font-bold text-slate-100 flex items-center gap-2 text-xs sm:text-sm">
                      <span className="text-purple-400">✨</span>
                      <span>Zen Library Perk Branches</span>
                    </h4>
                  <ul className="list-disc list-inside space-y-1 text-slate-400 pl-1 text-xs">
                    <li><strong>Steady Hands:</strong> Increases excavation digging precision by +10% per rank (+50% at Max Level 5).</li>
                    <li><strong>Careful Trowel:</strong> Adds extra shovel strikes, essential for unearthing multi-root flora (Sakura, Maple, Wisteria, Ginkgo).</li>
                      <li><strong>Broad Spade:</strong> Widens hit target arcs on the excavation dial (+5% per rank, up to +25%).</li>
                      <li><strong>Green Thumb:</strong> Accelerates manual pruning progress reduction.</li>
                      <li><strong>Hydrodynamics:</strong> Increases automaton watering irrigation pump speed.</li>
                      <li><strong>Botanical Foraging:</strong> Grants a 5% chance per rank (up to 25% at Rank 5) to upgrade a wild seedling to +1 higher Maturity tier upon excavation.</li>
                      <li><strong>Resource Prospecting:</strong> Increases overworld resource deposit spawn rate (+2% per rank, up to +10%).</li>
                      <li><strong>Botanical Dowsing:</strong> Bio-resonance antenna that increases wild seedling root node grid spawn chance (+2% per rank, up to 18% per grid slot).</li>
                      <li><strong>Perpetuum Mobile:</strong> Grants a chance (up to 25%) to move the Rover without consuming any battery energy. (Fog of War vision is enhanced via modular Radar Attachments).</li>
                    </ul>
                  </div>

                  <div className="bg-slate-950/60 border border-slate-800 p-3.5 rounded-2xl space-y-2">
                    <h4 className="font-bold text-slate-100 flex items-center gap-2 text-xs sm:text-sm">
                      <span className="text-yellow-400">🏆</span>
                      <span>Zen Milestones & Achievements</span>
                    </h4>
                    <p className="text-slate-300 text-xs leading-relaxed">
                      Claim large bonus Zen Point rewards through the Achievements tab:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-slate-400 pl-1 text-xs">
                    <li><strong>Taxonomy &amp; Styles:</strong> Catalog up to 20 leaf species and 140 stylistic variants in your Bondex.</li>
                      <li><strong>Maturity &amp; Forms:</strong> Cultivate Sprout through Premium specimens and complete Tree Group triads.</li>
                      <li><strong>Wilderness Pioneer:</strong> Complete 5 and 10 expeditions in each biome.</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {/* MODAL FOOTER NAVIGATION */}
            <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-800 shrink-0">
              <button
                disabled={guidebookChapter <= 1}
                onClick={() => {
                  setGuidebookChapter((c) => Math.max(1, c - 1));
                  gameAudio.playCrispClick();
                }}
                className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1 transition-all ${
                  guidebookChapter > 1
                    ? 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                    : 'bg-slate-900 text-slate-600 cursor-not-allowed'
                }`}>
                <ChevronLeft className="w-4 h-4" />
                <span>Prev [A / LB]</span>
              </button>

              <span className="text-xs font-mono text-slate-400">
                Chapter {guidebookChapter} of 5 • 🎮 [A/D / LB/RB]
              </span>

              {guidebookChapter < 5 ? (
                <button
                  onClick={() => {
                    setGuidebookChapter((c) => Math.min(5, c + 1));
                    gameAudio.playCrispClick();
                  }}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-all shadow flex items-center gap-1">
                  <span>Next [D / RB]</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => setIsHowToPlayOpen(false)}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow">
                  Close Guide [Esc / B]
                </button>
              )}
            </div>
          </div>
        </MenuOverlay>
      )}

      {/* --- OVERLAYS: VICTORY SCREEN --- */}
      {gameState.status === 'VICTORY' && (
        <Overlay
          title="LEGENDARY MASTER BOTANIST"
          description={`Triumphant Zen Mastery! You cultivated a legendary Premium (五, Rank V) Bonsai to Level 100! Final Score: ${gameState.score} • Total Verdure: ${inv.coins}`}
          actionLabel="CONTINUE CULTIVATING"
          onAction={() => setGameState((prev) => ({...prev, status: 'PLAYING'}))}
          icon={<Trophy size={24} />}
          tone="victory"
        />
      )}
    </div>
  );
}
