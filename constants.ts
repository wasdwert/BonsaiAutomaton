import {SpriteConfig} from './utils/helper';
export {SPECIES_PALETTE, type SpeciesPaletteEntry} from './bonsaiData';

/**
 * Aesthetic theme colors and styles for Bonsai Automata
 */
export const THEME = {
  primary: '#10b981', // emerald
  secondary: '#f59e0b', // amber
  accent: '#ec4899', // sakura pink
  violet: '#a855f7', // wisteria
  bgDark: '#0f172a',
  panelBg: 'rgba(15, 23, 42, 0.92)',
  fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
};

/**
 * Configuration for the game.
 */
export const CONFIG = {
  title: {
    value: 'Bonsai Automata',
    type: 'string',
    label: 'Game Title',
    group: 'GAME',
  },
  baseCanvasWidth: {
    value: 1280,
    type: 'number',
    label: 'Base Canvas Width',
    group: 'GAME',
  },
  baseCanvasHeight: {
    value: 720,
    type: 'number',
    label: 'Base Canvas Height',
    group: 'GAME',
  },
  targetFPS: {
    value: 60,
    type: 'number',
    label: 'Target FPS',
    group: 'SYSTEM',
  },
  stepMs: {
    value: 1000 / 60,
    type: 'number',
    label: 'Step MS',
    group: 'SYSTEM',
  },
  maxSubSteps: {
    value: 5,
    type: 'number',
    label: 'Max Sub Steps',
    group: 'SYSTEM',
  },
  backgroundColor: {
    value: '#0f172a',
    type: 'color',
    label: 'Background Color',
    group: 'THEME',
  },
  primaryColor: {
    value: '#10b981',
    type: 'color',
    label: 'Primary Color',
    group: 'THEME',
  },
  fontFamily: {
    value: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    type: 'string',
    label: 'Font Family',
    group: 'THEME',
  },
  defaultMusicVolume: {
    value: 0.06,
    type: 'number',
    label: 'Default Music Volume',
    group: 'AUDIO',
  },
  defaultSfxVolume: {
    value: 0.6,
    type: 'number',
    label: 'Default SFX Volume',
    group: 'AUDIO',
  },

  // Tunable Gameplay Variables (Used in playground_config.json)
  growthSpeedMultiplier: {
    value: 1.0,
    type: 'number',
    label: 'Growth Speed Multiplier',
    group: 'Rules',
  },
  playerWalkSpeed: {
    value: 220,
    type: 'number',
    label: 'Explorer Move Speed',
    group: 'Rules',
  },
  roverBaseBattery: {
    value: 50,
    type: 'number',
    label: 'Rover Base Battery (kWh)',
    group: 'Rules',
  },
  roverBaseCargo: {
    value: 15.0,
    type: 'number',
    label: 'Rover Base Cargo Capacity (kg)',
    group: 'Rules',
  },
  backpackBaseCapacity: {
    value: 20,
    type: 'number',
    label: 'Backpack Base Capacity (kg)',
    group: 'Rules',
  },
  solarPeakKw: {
    value: 3.0,
    type: 'number',
    label: 'Solar Peak Power (kW)',
    group: 'Rules',
  },
  turbineBaseKw: {
    value: 1.8,
    type: 'number',
    label: 'Turbine Base Power (kW)',
    group: 'Rules',
  },
  pumpBaseLps: {
    value: 2.5,
    type: 'number',
    label: 'Water Pump Flow (L/s)',
    group: 'Rules',
  },
  digSweetSpotMultiplier: {
    value: 1.0,
    type: 'number',
    label: 'Dig Sweetspot Width Multiplier',
    group: 'Rules',
  },
  dayCycleSpeed: {
    value: 1.0,
    type: 'number',
    label: 'Day / Night Cycle Speed',
    group: 'Rules',
  },

  // Asset dimensions and Aspect Ratios (for robust Canvas rendering)
  assetHeroWidth: {
    value: 64,
    type: 'number',
    label: 'Explorer Width',
    group: 'ASSETS',
  },
  assetHeroHeight: {
    value: 80,
    type: 'number',
    label: 'Explorer Height',
    group: 'ASSETS',
  },
  assetHeroAspectRatio: {
    value: 0.8,
    type: 'number',
    label: 'Explorer Aspect Ratio',
    group: 'ASSETS',
  },
  assetBgWidth: {
    value: 1280,
    type: 'number',
    label: 'Background Width',
    group: 'ASSETS',
  },
  assetBgHeight: {
    value: 720,
    type: 'number',
    label: 'Background Height',
    group: 'ASSETS',
  },
  assetBgAspectRatio: {
    value: 1.777,
    type: 'number',
    label: 'Background Aspect Ratio',
    group: 'ASSETS',
  },
};

// Merge customized config values if present (injected by Playground)
const {playgroundConfig} = globalThis as {
  playgroundConfig?: Record<string, unknown>;
};
if (playgroundConfig) {
  for (const [key, value] of Object.entries(playgroundConfig)) {
    if (key in CONFIG) {
      Object.assign(CONFIG[key as keyof typeof CONFIG], {value});
    }
  }
}

/**
 * Station labels across the Sanctuary greenhouse
 */
export const STATION_LABELS = {
  ZEN_LIBRARY: 'ZEN LIBRARY',
  WORKBENCH: 'WORKBENCH',
  BONSAI_SOCIETY: 'BONSAI SOCIETY',
  ROVER_GARAGE: 'ROVER GARAGE BAY',
  MARKET: 'BOTANICAL MARKET',
  ZEN_SHRINE: 'ZEN LIBRARY',
} as const;

/**
 * Heavy 2x Resource Deposit metadata and asset configurations
 */
export const ASSET_DOUBLE_RESOURCES = {
  scrap_metal_double_resource: {
    id: 'scrap_metal_double_resource',
    path: 'assets/images/scrap_metal_double_resource.png',
    name: 'Heavy Scrap Metal Cache (2x)',
    shortName: 'Scrap Metal 2x',
    width: 756,
    height: 691,
    weight: 1.6,
    yield: 2,
    baseKey: 'scrap_metal',
  },
  copper_wire_double_resource: {
    id: 'copper_wire_double_resource',
    path: 'assets/images/copper_wire_double_resource.png',
    name: 'Heavy Copper Wire Bundle (2x)',
    shortName: 'Copper Wire 2x',
    width: 839,
    height: 656,
    weight: 1.0,
    yield: 2,
    baseKey: 'copper_wire',
  },
} as const;

/**
 * Type helper for reading values in game code
 */
export type ConfigKey = keyof typeof CONFIG;

/**
 * Gets a configuration value by key.
 * @param key The configuration key.
 * @return The configuration value.
 */
export function getConfig<K extends ConfigKey>(
  key: K,
): (typeof CONFIG)[K]['value'] {
  return CONFIG[key].value;
}

export const PRESETS = {};
