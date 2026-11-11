import {
  calculateBonsaiLevelUpXP,
  getXPRequirementForLevel,
  calculateWateringGrowthRate,
  getRequiredGrowthDuration,
} from './gameState';
import {
  getBonsaiMaturityRating,
  STATION_RECIPES,
  StationRecipeId,
  AutoUnloaderSettings,
  DEFAULT_AUTO_UNLOADER_SETTINGS,
  GlobalCareDispenserLimits,
  DEFAULT_CARE_DISPENSER_LIMITS,
  LoaderFacing,
  isHaloBlockedByFence,
} from './types';
import { getBonsaiDisplayName } from './bonsaiData';

export type SaveSlotId = 'autosave' | 1 | 2 | 3;

export const SAVE_SLOT_KEYS: Record<SaveSlotId, string> = {
  autosave: 'bonsai_automata_autosave',
  1: 'bonsai_automata_save_slot_1',
  2: 'bonsai_automata_save_slot_2',
  3: 'bonsai_automata_save_slot_3',
};

export interface SaveSlotMetadata {
  slotId: SaveSlotId;
  savedAt: number; // Unix timestamp in ms
  savedAtFormatted: string;
  playerLevel: number;
  playerXP: number;
  verdure: number;
  zenPoints: number;
  bonsaiCount: number;
  activeBonsaisMaxLevel: number;
}

export interface FullSaveState {
  metadata: SaveSlotMetadata;
  gameState: any;
  plantedBonsais: any[];
  deployedStructures: any[];
  storedPottedBonsais: any[];
  storedSaplings: any[];
  sanctuaryInventory: any;
  zenSkills: any;
  stats: any;
  bondexDiscovery: any;
  areaDiscovery: any;
  installedCraftingArms: number;
  autoFabricatorLanes: any[];
  globalAutoUnloaderSettings: AutoUnloaderSettings;
  globalCareDispenserLimits: GlobalCareDispenserLimits;
  masterQuests: any;
  activeCrafting: any;
  craftingQueue: any[];
  avatarPos: { x: number; y: number };
}

export interface OfflineSummary {
  elapsedSeconds: number;
  timeAwayFormatted: string;
  bonsaisGrown: number;
  levelsGained: number;
  playerXPGained: number;
  playerLevelUps: number;
  zenPointsGained: number;
  organicWasteProduced: number;
  compostProduced: number;
  fertilizerProduced: number;
  speedGrowProduced: number;
  itemsConsumed: Record<string, number>;
  bonsaiDetails: Array<{
    name: string;
    oldLevel: number;
    newLevel: number;
    levelsGained: number;
  }>;
}

export function formatTimeAway(seconds: number): string {
  if (seconds < 60) {
    return `${Math.max(1, Math.floor(seconds))} secs`;
  }
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  if (m < 60) {
    return s > 0 ? `${m} mins ${s} secs` : `${m} mins`;
  }
  const h = Math.floor(m / 60);
  const remainingM = m % 60;
  if (h < 24) {
    return remainingM > 0 ? `${h} hrs ${remainingM} mins` : `${h} hrs`;
  }
  const d = Math.floor(h / 24);
  const remainingH = h % 24;
  return remainingH > 0 ? `${d} days ${remainingH} hrs` : `${d} days`;
}

export function formatSaveDate(timestamp: number): string {
  if (!timestamp) return 'Never';
  const d = new Date(timestamp);
  return d.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export function getSaveSlotKey(slot: SaveSlotId | string | number): string {
  const normalized = String(slot).toLowerCase();
  if (normalized === 'autosave') return SAVE_SLOT_KEYS.autosave;
  if (normalized === '1' || normalized === 'slot_1') return SAVE_SLOT_KEYS[1];
  if (normalized === '2' || normalized === 'slot_2') return SAVE_SLOT_KEYS[2];
  if (normalized === '3' || normalized === 'slot_3') return SAVE_SLOT_KEYS[3];
  return SAVE_SLOT_KEYS.autosave;
}

export function getSaveSlotMetadata(slot: SaveSlotId): SaveSlotMetadata | null {
  if (typeof window === 'undefined' || !window.localStorage) return null;
  try {
    const key = SAVE_SLOT_KEYS[slot];
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !parsed.metadata) return null;
    return parsed.metadata;
  } catch (err) {
    console.error(`Failed to read metadata for save slot ${slot}:`, err);
    return null;
  }
}

export function getAllSaveSlotsMetadata(): Record<SaveSlotId, SaveSlotMetadata | null> {
  return {
    autosave: getSaveSlotMetadata('autosave'),
    1: getSaveSlotMetadata(1),
    2: getSaveSlotMetadata(2),
    3: getSaveSlotMetadata(3),
  };
}

export function saveGame(
  slot: SaveSlotId,
  data: Omit<FullSaveState, 'metadata'>,
): SaveSlotMetadata {
  const now = Date.now();
  const activeTrees = data.plantedBonsais || [];
  const maxLvl = activeTrees.reduce((max, b) => Math.max(max, b.level || 0), 0);
  const inv = data.sanctuaryInventory || {};
  const verdure = typeof inv.coins === 'number' ? inv.coins : (inv.verdure || 0);
  const pLevel = inv.player_level ?? inv.playerLevel ?? 0;
  const pExp = inv.player_exp ?? inv.playerXP ?? 0;
  const zen = inv.zen_essence ?? inv.zenPoints ?? 0;

  const metadata: SaveSlotMetadata = {
    slotId: slot,
    savedAt: now,
    savedAtFormatted: formatSaveDate(now),
    playerLevel: pLevel,
    playerXP: pExp,
    verdure: Number(verdure.toFixed(2)),
    zenPoints: zen,
    bonsaiCount: activeTrees.length,
    activeBonsaisMaxLevel: maxLvl,
  };

  const payload: FullSaveState = {
    ...data,
    metadata,
  };

  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const key = SAVE_SLOT_KEYS[slot];
      localStorage.setItem(key, JSON.stringify(payload));
    } catch (err) {
      console.error(`Failed to save game to slot ${slot}:`, err);
    }
  }

  return metadata;
}

export function deleteSaveSlot(slot: SaveSlotId): boolean {
  if (typeof window === 'undefined' || !window.localStorage) return false;
  try {
    const key = SAVE_SLOT_KEYS[slot];
    localStorage.removeItem(key);
    return true;
  } catch (err) {
    console.error(`Failed to delete save slot ${slot}:`, err);
    return false;
  }
}

export function loadGame(
  slot: SaveSlotId,
): { fullState: FullSaveState; elapsedSeconds: number; offlineSummary?: OfflineSummary } | null {
  if (typeof window === 'undefined' || !window.localStorage) return null;
  try {
    const key = SAVE_SLOT_KEYS[slot];
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as FullSaveState;
    if (!parsed || !parsed.metadata) return null;

    const savedAt = parsed.metadata.savedAt || Date.now();
    const rawElapsed = Math.floor((Date.now() - savedAt) / 1000);
    // Cap at 48 hours to prevent unbounded calculation
    const elapsedSeconds = Math.max(0, Math.min(rawElapsed, 172800));

    if (elapsedSeconds >= 10) {
      const sim = simulateOfflineProgress(parsed, elapsedSeconds);
      return {
        fullState: sim.updatedState,
        elapsedSeconds,
        offlineSummary: sim.summary,
      };
    }

    return {
      fullState: parsed,
      elapsedSeconds,
    };
  } catch (err) {
    console.error(`Failed to load save slot ${slot}:`, err);
    return null;
  }
}

/**
 * Calculates power metrics offline from deployed structures
 */
function calculateOfflinePower(deployedStructures: any[], zenSkills: any) {
  let solarKw = 0;
  let turbineKw = 0;

  deployedStructures.forEach((s) => {
    if (s.type === 'solar_panel') solarKw += 3;
    else if (s.type === 'solar_farm_2x2') solarKw += 24;
    else if (s.type === 'solar_farm_3x3') solarKw += 87;
    else if (s.type === 'wind_turbine') turbineKw += 6;
    else if (s.type === 'wind_farm_2x2') turbineKw += 42;
    else if (s.type === 'wind_farm_3x3') turbineKw += 134;
  });

  const solarSkill = zenSkills?.solarExpert || 0;
  if (solarSkill > 0) solarKw *= (1 + solarSkill * 0.1);
  const windSkill = zenSkills?.windExpert || 0;
  if (windSkill > 0) turbineKw *= (1 + windSkill * 0.1);

  const totalGenerated = solarKw + turbineKw;

  let totalRequired = 0;
  deployedStructures.forEach((s) => {
    if (s.type === 'automaton_t1') totalRequired += 4;
    else if (s.type === 'automaton_t2') totalRequired += 7;
    else if (s.type === 'automaton_t3') totalRequired += 12;
    else if (s.type === 'auto_unloader') totalRequired += 2;
    else if (s.type === 't1_compost_feeder') totalRequired += 6;
    else if (s.type === 't2_compost_feeder') totalRequired += 10;
    else if (s.type === 't3_compost_feeder') totalRequired += 16;
    else if (s.type === 't1_fertilizer_dripper') totalRequired += 7;
    else if (s.type === 't2_fertilizer_dripper') totalRequired += 12;
    else if (s.type === 't3_fertilizer_dripper') totalRequired += 18;
  });

  return {
    totalGenerated,
    totalRequired,
    isPowerSufficient: totalGenerated >= totalRequired,
  };
}

/**
 * Stepped Offline Progression Simulation
 * Accounts for bottlenecks: power, station timers, feeder buffers, unloader queues.
 */
export function simulateOfflineProgress(
  saveState: FullSaveState,
  elapsedSeconds: number,
): { updatedState: FullSaveState; summary: OfflineSummary } {
  // Clone state to prevent side effects
  const state: FullSaveState = JSON.parse(JSON.stringify(saveState));
  const simSeconds = Math.min(elapsedSeconds, 172800); // 48h cap

  const inv = state.sanctuaryInventory || {};
  const skills = state.zenSkills || {};
  const planted = state.plantedBonsais || [];
  const structures = state.deployedStructures || [];
  const autoUnloaderSettings: AutoUnloaderSettings =
    state.globalAutoUnloaderSettings || DEFAULT_AUTO_UNLOADER_SETTINGS;
  const careLimits: GlobalCareDispenserLimits =
    state.globalCareDispenserLimits || DEFAULT_CARE_DISPENSER_LIMITS;

  const power = calculateOfflinePower(structures, skills);

  // Summary tracking
  const initialPlayerLevel = inv.player_level || 0;
  const initialPlayerExp = inv.player_exp || 0;
  const initialZen = inv.zen_essence || 0;
  const initialWaste = inv.organic_waste || 0;
  const initialCompostS = inv.compost_s || 0;
  const initialCompostM = inv.compost_m || 0;
  const initialCompostL = inv.compost_l || 0;
  const initialFertS = inv.fertilizer_s || 0;
  const initialFertM = inv.fertilizer_m || 0;
  const initialFertL = inv.fertilizer_l || 0;

  let totalBonsaiLevelUps = 0;
  let totalPlayerXPGained = 0;
  let organicWasteProduced = 0;
  let compostProduced = 0;
  let fertilizerProduced = 0;
  let speedGrowProduced = 0;
  const itemsConsumed: Record<string, number> = {};

  const bonsaiInitialLevels = new Map<string, number>();
  planted.forEach((b) => {
    bonsaiInitialLevels.set(b.id, b.level || 0);
  });

  // Calculate covered plots for sprinklers and irrigation
  const SANCTUARY_COLS = 16;
  const SANCTUARY_ROWS = 8;
  const SANCTUARY_START_X = 100;
  const SANCTUARY_START_Y = 306;
  const SANCTUARY_CELL_W = 72;
  const SANCTUARY_CELL_H = 74;

  const activeSprinklerMap = new Map<string, number>();
  structures.forEach((s) => {
    if (power.isPowerSufficient && (s.type === 'automaton_t1' || s.type === 'automaton_t2' || s.type === 'automaton_t3')) {
      const speed = calculateWateringGrowthRate(s.type, skills);
      const sc = Math.round((s.x - SANCTUARY_START_X) / SANCTUARY_CELL_W);
      const sr = Math.round((s.y - SANCTUARY_START_Y) / SANCTUARY_CELL_H);

      let offsets: { dc: number; dr: number }[] = [];
      if (s.type === 'automaton_t1') {
        offsets = s.orientation === 'vertical' ? [{ dc: 0, dr: -1 }, { dc: 0, dr: 1 }] : [{ dc: -1, dr: 0 }, { dc: 1, dr: 0 }];
      } else if (s.type === 'automaton_t2') {
        offsets = [{ dc: 0, dr: -1 }, { dc: 0, dr: 1 }, { dc: -1, dr: 0 }, { dc: 1, dr: 0 }];
      } else {
        for (let dc = -1; dc <= 1; dc++) {
          for (let dr = -1; dr <= 1; dr++) {
            if (dc !== 0 || dr !== 0) offsets.push({ dc, dr });
          }
        }
      }

      offsets.forEach(({ dc, dr }) => {
        const c = sc + dc;
        const r = sr + dr;
        if (c >= 0 && c < SANCTUARY_COLS && r >= 0 && r < SANCTUARY_ROWS) {
          const key = `${c},${r}`;
          const prev = activeSprinklerMap.get(key) || 0;
          if (speed > prev) activeSprinklerMap.set(key, speed);
        }
      });
    }
  });

  // Step simulation in 10-second slices
  const stepDt = 10;
  const totalSteps = Math.ceil(simSeconds / stepDt);

  for (let step = 0; step < totalSteps; step++) {
    const curStepDt = Math.min(stepDt, simSeconds - step * stepDt);
    if (curStepDt <= 0) break;

    // 1. Advance Manual Irrigation Systems
    structures.forEach((s) => {
      if (s.type === 'irrigation_t1' || s.type === 'irrigation_t2' || s.type === 'irrigation_t3') {
        if (s.waterDuration && s.waterDuration > 0) {
          s.waterDuration = Math.max(0, s.waterDuration - curStepDt);
        }
      }
    });

    // 2. Advance Stations (Compost Heap & Chemical Station)
    structures.forEach((s) => {
      if (s.type === 'tool_compost_heap' || s.type === 'fertilizer_station') {
        s.readyUnits = s.readyUnits || 0;
        s.queuedUnits = s.queuedUnits || 0;
        s.timer = s.timer || 0;

        if (s.selectedRecipe && (s.timer > 0 || s.queuedUnits > 0)) {
          const def = STATION_RECIPES[s.selectedRecipe as StationRecipeId];
          if (def) {
            if (s.timer <= 0 && s.queuedUnits > 0) {
              s.queuedUnits -= 1;
              s.timer = def.durationSeconds;
            }

            if (s.timer > 0) {
              s.timer -= curStepDt;
              if (s.timer <= 0) {
                s.readyUnits += 1;
                if (s.type === 'tool_compost_heap') compostProduced += 1;
                else fertilizerProduced += 1;

                if (s.queuedUnits > 0) {
                  s.queuedUnits -= 1;
                  s.timer += def.durationSeconds;
                } else {
                  s.timer = 0;
                }
              }
            }
          }
        }
      }
    });

    // 3. Auto-Unloader & Auto-Feeder logic
    if (power.isPowerSufficient) {
      // Auto-Unloader
      structures.forEach((s) => {
        if (s.type === 'auto_unloader') {
          const f: LoaderFacing = s.loaderFacing || s.facing || 'UP';
          const sc = s.col ?? Math.round((s.x - SANCTUARY_START_X) / SANCTUARY_CELL_W);
          const sr = s.row ?? Math.round((s.y - SANCTUARY_START_Y) / SANCTUARY_CELL_H);
          let tc = sc;
          let tr = sr;
          if (f === 'UP') tr -= 1;
          else if (f === 'RIGHT') tc += 1;
          else if (f === 'DOWN') tr += 1;
          else if (f === 'LEFT') tc -= 1;

          const targetStation = structures.find((other) => {
            if (other.id === s.id) return false;
            if (other.type !== 'tool_compost_heap' && other.type !== 'fertilizer_station') return false;
            const oc = other.col ?? Math.round((other.x - SANCTUARY_START_X) / SANCTUARY_CELL_W);
            const or = other.row ?? Math.round((other.y - SANCTUARY_START_Y) / SANCTUARY_CELL_H);
            return oc === tc && or === tr;
          });

          if (targetStation && targetStation.selectedRecipe) {
            const def = STATION_RECIPES[targetStation.selectedRecipe as StationRecipeId];
            if (def) {
              // Unload finished goods
              if ((targetStation.readyUnits || 0) > 0) {
                const amount = targetStation.readyUnits;
                targetStation.readyUnits = 0;
                inv[def.outputItem] = (inv[def.outputItem] || 0) + amount;
              }

              // Load raw ingredients if queue has room
              const inQueue = (targetStation.queuedUnits || 0) + ((targetStation.timer || 0) > 0 ? 1 : 0);
              if (inQueue < 10) {
                const targetMax = autoUnloaderSettings.targetAmount[def.outputItem] ?? 10;
                const currentInvCount = inv[def.outputItem] || 0;
                if (currentInvCount < targetMax) {
                  let canDeposit = true;
                  for (const [resKey, needed] of Object.entries(def.costs)) {
                    if (!needed) continue;
                    const stock = inv[resKey] || 0;
                    const minKeep = autoUnloaderSettings.minimumToKeep[resKey] || 0;
                    if (stock < needed + minKeep) {
                      canDeposit = false;
                      break;
                    }
                  }

                  if (canDeposit) {
                    for (const [resKey, needed] of Object.entries(def.costs)) {
                      if (!needed) continue;
                      inv[resKey] = Math.max(0, (inv[resKey] || 0) - needed);
                      itemsConsumed[resKey] = (itemsConsumed[resKey] || 0) + needed;
                    }
                    targetStation.queuedUnits = (targetStation.queuedUnits || 0) + 1;
                  }
                }
              }
            }
          }
        }
      });
    }

    // 4. Bonsai Growth and Level Ups
    planted.forEach((bonsai) => {
      if (bonsai.level >= 100) return;

      const bc = bonsai.col !== undefined ? bonsai.col : Math.round((bonsai.x - SANCTUARY_START_X) / SANCTUARY_CELL_W);
      const br = bonsai.row !== undefined ? bonsai.row : Math.round((bonsai.y - SANCTUARY_START_Y) / SANCTUARY_CELL_H);
      const plotKey = `${bc},${br}`;

      const sprinklerSpeed = activeSprinklerMap.get(plotKey) || 0;
      let manualSpeed = 0;
      structures.forEach((s) => {
        if ((s.waterDuration || 0) > 0 && (s.type === 'irrigation_t1' || s.type === 'irrigation_t2' || s.type === 'irrigation_t3')) {
          const sc = Math.round((s.x - SANCTUARY_START_X) / SANCTUARY_CELL_W);
          const sr = Math.round((s.y - SANCTUARY_START_Y) / SANCTUARY_CELL_H);
          if (Math.abs(sc - bc) <= 1 && Math.abs(sr - br) <= 1) {
            manualSpeed = Math.max(manualSpeed, calculateWateringGrowthRate(s.type, skills));
          }
        }
      });

      const effectiveWaterSpeed = Math.max(sprinklerSpeed, manualSpeed);

      if (effectiveWaterSpeed > 0) {
        let organicMult = 1.0;
        let chemicalMult = 1.0;

        if (bonsai.organicBuff && bonsai.organicBuff.expiresAt > Date.now()) {
          organicMult = 1.0 + (bonsai.organicBuff.multiplier || 0.15);
        }
        if (bonsai.chemicalBuff && bonsai.chemicalBuff.expiresAt > Date.now()) {
          chemicalMult = 1.0 + (bonsai.chemicalBuff.multiplier || 0.25);
        }

        const growthThisStep = effectiveWaterSpeed * curStepDt * organicMult * chemicalMult;
        bonsai.progressSeconds = (bonsai.progressSeconds || 0) + growthThisStep;

        // Level up loop
        while (bonsai.level < 100) {
          const needed = getRequiredGrowthDuration(bonsai.level, bonsai.maturityRating || bonsai.maturity || 1);
          if (bonsai.progressSeconds >= needed) {
            bonsai.progressSeconds -= needed;
            bonsai.level += 1;
            totalBonsaiLevelUps += 1;

            // Award player XP
            const earnedXP = calculateBonsaiLevelUpXP(bonsai.level - 1, bonsai.maturityRating || bonsai.maturity || 1, bonsai.leafType || 'circle');
            totalPlayerXPGained += earnedXP;
            inv.player_exp = (inv.player_exp || 0) + earnedXP;

            // Produce organic waste
            inv.organic_waste = (inv.organic_waste || 0) + 1;
            organicWasteProduced += 1;
          } else {
            break;
          }
        }
      }
    });
  }

  // 5. Calculate Player Level Ups & Zen Points
  let playerLevelUps = 0;
  while (inv.player_level < 100) {
    const nextReq = getXPRequirementForLevel(inv.player_level + 1);
    if ((inv.player_exp || 0) >= nextReq) {
      inv.player_exp -= nextReq;
      inv.player_level += 1;
      playerLevelUps += 1;
      inv.zen_essence = (inv.zen_essence || 0) + 5; // 5 ZP per level up
    } else {
      break;
    }
  }

  const zenPointsGained = playerLevelUps * 5;

  // Build bonsai details list
  const bonsaiDetails: Array<{ name: string; oldLevel: number; newLevel: number; levelsGained: number }> = [];
  planted.forEach((b) => {
    const oldLvl = bonsaiInitialLevels.get(b.id) || 0;
    const newLvl = b.level || 0;
    if (newLvl > oldLvl) {
      bonsaiDetails.push({
        name: getBonsaiDisplayName(b.leafType || b.species),
        oldLevel: oldLvl,
        newLevel: newLvl,
        levelsGained: newLvl - oldLvl,
      });
    }
  });

  const summary: OfflineSummary = {
    elapsedSeconds: simSeconds,
    timeAwayFormatted: formatTimeAway(simSeconds),
    bonsaisGrown: bonsaiDetails.length,
    levelsGained: totalBonsaiLevelUps,
    playerXPGained: totalPlayerXPGained,
    playerLevelUps,
    zenPointsGained,
    organicWasteProduced,
    compostProduced,
    fertilizerProduced,
    speedGrowProduced,
    itemsConsumed,
    bonsaiDetails,
  };

  // Update save metadata
  state.metadata.savedAt = Date.now();
  state.metadata.savedAtFormatted = formatSaveDate(Date.now());
  state.metadata.playerLevel = inv.player_level;
  state.metadata.playerXP = inv.player_exp;
  state.metadata.zenPoints = inv.zen_essence;

  return {
    updatedState: state,
    summary,
  };
}
