import React, { useEffect } from 'react';
import { X, Wrench, Package, Lock, Clock, Sparkles, Zap, Trophy, Truck } from 'lucide-react';
import {
  CraftingRecipeId,
  CraftingRecipeDef,
  WorkbenchCategory,
  WORKBENCH_RECIPES,
  CraftingQueueItem,
  SanctuaryInventory,
  formatCraftDuration,
  getWorkbenchName,
  getWorkbenchAutomatonCapacity,
  AutoFabricatorLane,
} from './App';
import {
  WorkbenchModuleType,
  WORKBENCH_MODULE_CONFIGS,
} from './types';
import {
  BLUEPRINT_REQUIRED_FOR_ITEM,
  BLUEPRINT_BY_ID,
} from './blueprints';
import { gameAudio } from './utils/helper';

export function recordCraftedItem(inv: SanctuaryInventory, recipeId: string) {
  const feederDripperKeys = [
    't1_compost_feeder',
    't2_compost_feeder',
    't3_compost_feeder',
    't1_fertilizer_dripper',
    't2_fertilizer_dripper',
    't3_fertilizer_dripper',
  ];
  if (feederDripperKeys.includes(recipeId)) {
    const invKey = `${recipeId}_inv`;
    inv[recipeId] = (inv[recipeId] || 0) + 1;
    inv[invKey] = (inv[invKey] || 0) + 1;
    if (!inv.deployables) inv.deployables = {};
    inv.deployables[recipeId] = (inv.deployables[recipeId] || 0) + 1;
    if (!inv.infrastructure) inv.infrastructure = {};
    inv.infrastructure[recipeId] = (inv.infrastructure[recipeId] || 0) + 1;
  }
}

export interface WorkbenchModalProps {
  isOpen: boolean;
  onClose: () => void;
  inventory: SanctuaryInventory;
  unlockedBlueprints?: string[];
  activeCraft: CraftingQueueItem | null;
  craftingQueue: CraftingQueueItem[];
  installedCraftingArms: number;
  autoFabricatorLanes: AutoFabricatorLane[];
  powerSufficient: boolean;
  craftingPowerDrain: number;
  autoFabricatorPowerDrain: number;
  workbenchTab: WorkbenchCategory;
  setWorkbenchTab: (tab: WorkbenchCategory) => void;
  focusedWbIdx?: number;
  onEnqueueCraft: (recipeId: CraftingRecipeId) => void;
  onCancelCraft: (index: number) => void;
  onAttachWorkbenchModule?: (mod: WorkbenchModuleType) => void;
  onDetachWorkbenchModule?: (index: number) => void;
  onAttachAutoLane?: (tier: 1 | 2 | 3) => void;
  onDetachAutoLane?: (id: string) => void;
  onSetAutoLaneRecipe?: (id: string, recipe: CraftingRecipeId | 'none') => void;
  maxQueueCapacity: number;
  overclockBonusSpeed: number;
  assemblyBonusQueueSlots: number;
}

export default function WorkbenchModal({
  isOpen,
  onClose,
  inventory: inv,
  unlockedBlueprints = [],
  activeCraft,
  craftingQueue,
  installedCraftingArms,
  autoFabricatorLanes,
  powerSufficient,
  craftingPowerDrain,
  autoFabricatorPowerDrain,
  workbenchTab,
  setWorkbenchTab,
  focusedWbIdx = 0,
  onEnqueueCraft,
  onCancelCraft,
  onAttachWorkbenchModule,
  onDetachWorkbenchModule,
  onAttachAutoLane,
  onDetachAutoLane,
  onSetAutoLaneRecipe,
  maxQueueCapacity,
  overclockBonusSpeed,
  assemblyBonusQueueSlots,
}: WorkbenchModalProps) {
  // Capture Escape key to close modal with strict precedence
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const totalAttached = installedCraftingArms + autoFabricatorLanes.length + (inv.attached_workbench_modules?.length || 0);
  const maxCapacity = getWorkbenchAutomatonCapacity(inv.workbench_tier || 1);
  const totalQueued = (activeCraft ? 1 : 0) + craftingQueue.length;

  const curLic1 = inv.license_t1 ?? inv.licenseT1 ?? inv.resources?.license_t1 ?? inv.resources?.licenseT1 ?? 0;
  const curLic2 = inv.license_t2 ?? inv.licenseT2 ?? inv.resources?.license_t2 ?? inv.resources?.licenseT2 ?? 0;
  const curLic3 = inv.license_t3 ?? inv.licenseT3 ?? inv.resources?.license_t3 ?? inv.resources?.licenseT3 ?? 0;
  const curScrap = inv.scrap_metal ?? inv.scrapMetal ?? inv.resources?.scrap_metal ?? inv.resources?.scrapMetal ?? 0;
  const curWire = inv.copper_wire ?? inv.copperWire ?? inv.resources?.copper_wire ?? inv.resources?.copperWire ?? 0;
  const curGears = inv.brass_gears ?? inv.gears ?? inv.resources?.brass_gears ?? inv.resources?.gears ?? 0;
  const curCircuits = inv.circuit_boards ?? inv.microcircuits ?? inv.resources?.circuit_boards ?? inv.resources?.microcircuits ?? 0;
  const curChips = inv.electronic_chips ?? inv.chips ?? inv.quantumChips ?? inv.resources?.electronic_chips ?? inv.resources?.chips ?? 0;
  const curCondensed = inv.condensed_organic_material ?? inv.condensedOrganicMaterial ?? inv.resources?.condensed_organic_material ?? 0;
  const curBio = inv.biochemicals ?? inv.biochemical ?? inv.resources?.biochemicals ?? 0;
  const curWaste = inv.organic_waste ?? inv.organicWaste ?? inv.resources?.organic_waste ?? inv.resources?.organicWaste ?? 0;

  // 15 craftable recipes in Resources tab:
  // Copper Wire, Mechanical Gear, Microcircuit, Quantum Chip at very top in exact order;
  // followed immediately by Compost S, M, L; Fertilizer S, M, L; Speed Grow XS, S, M, L, XL
  const resourceRecipeIds: CraftingRecipeId[] = [
    'craft_copper_wire',
    'craft_gears',
    'craft_microcircuits',
    'craft_quantum_chips',
    'craft_compost_s',
    'craft_compost_m',
    'craft_compost_l',
    'craft_fertilizer_s',
    'craft_fertilizer_m',
    'craft_fertilizer_l',
    'craft_speed_grow_xs',
    'craft_speed_grow_s',
    'craft_speed_grow_m',
    'craft_speed_grow_l',
    'craft_speed_grow_xl',
  ];

  const renderRecipeCard = (recipeId: CraftingRecipeId, cardIdx?: number) => {
    const recipe = WORKBENCH_RECIPES[recipeId];
    if (!recipe) return null;
    const costs = recipe.costs;

    // Check blueprint requirement from 58 standardized catalog
    const requiredBpId = BLUEPRINT_REQUIRED_FOR_ITEM[recipeId];
    const bpDef = requiredBpId ? BLUEPRINT_BY_ID.get(requiredBpId) : null;
    const effectiveUnlocked = unlockedBlueprints || inv.unlockedBlueprints || [];
    const isBpOwned = !requiredBpId || effectiveUnlocked.includes(requiredBpId) || (recipe.requiresGuide && Boolean(inv[recipe.requiresGuide]));
    const isGuideLocked = !isBpOwned || (recipe.requiresGuide ? !inv[recipe.requiresGuide] && !effectiveUnlocked.includes(requiredBpId || '') : false);
    const requiredBlueprintName = bpDef ? bpDef.name : (recipe.guideName || 'Blueprint');

    const isFocused = cardIdx !== undefined && focusedWbIdx === cardIdx;

    const hasScrap = !costs.scrap_metal || curScrap >= costs.scrap_metal;
    const hasWire = !costs.copper_wire || curWire >= costs.copper_wire;
    const hasGears = !costs.brass_gears || curGears >= costs.brass_gears;
    const hasCircuits = !costs.circuit_boards || curCircuits >= costs.circuit_boards;
    const hasChips = !costs.electronic_chips || curChips >= costs.electronic_chips;
    const hasWaste = !costs.organic_waste || curWaste >= costs.organic_waste;
    const hasBio = !costs.biochemicals || curBio >= costs.biochemicals;
    const hasCondensed = !costs.condensed_organic_material || curCondensed >= costs.condensed_organic_material;
    const hasLic1 = !costs.license_t1 || (inv.license_t1 || inv.licenseT1 || 0) >= costs.license_t1;
    const hasLic2 = !costs.license_t2 || (inv.license_t2 || inv.licenseT2 || 0) >= costs.license_t2;
    const hasLic3 = !costs.license_t3 || (inv.license_t3 || inv.licenseT3 || 0) >= costs.license_t3;

    const isT2AlreadyActive = recipeId === 'workbench_t2_upgrade' && (inv.workbench_tier || 1) >= 2;
    const isT3AlreadyActive = recipeId === 'workbench_t3_upgrade' && (inv.workbench_tier || 1) >= 3;
    const isT3PrereqMissing = recipeId === 'workbench_t3_upgrade' && (inv.workbench_tier || 1) < 2;

    const isAlreadyInstalled = isT2AlreadyActive || isT3AlreadyActive;
    const isPrereqMissing = isT3PrereqMissing;

    const isQueuedOrCrafting =
      activeCraft?.recipeId === recipeId ||
      craftingQueue.some((it) => it.recipeId === recipeId);

    const canAfford =
      hasScrap &&
      hasWire &&
      hasGears &&
      hasCircuits &&
      hasChips &&
      hasWaste &&
      hasBio &&
      hasCondensed &&
      hasLic1 &&
      hasLic2 &&
      hasLic3 &&
      !isGuideLocked &&
      !isAlreadyInstalled &&
      !isPrereqMissing &&
      !isQueuedOrCrafting;

    const queueFull = totalQueued >= maxQueueCapacity;

    // Standardized Resource Cost Order strictly:
    // 1. License (T1, T2, or T3 License)
    // 2. Scrap (Scrap Metal)
    // 3. Wire (Copper Wire)
    // 4. Gears (Mechanical Gears)
    // 5. Circuits (Microcircuits / Circuit Boards)
    // 6. Chips (Quantum Chips / Microchips)
    // Followed by organic ingredients (Condensed Organic Material, Biochemicals, Organic Waste)
    const costStrings: string[] = [];
    if (costs.license_t1) costStrings.push(`${costs.license_t1}x T1 License`);
    if (costs.license_t2) costStrings.push(`${costs.license_t2}x T2 License`);
    if (costs.license_t3) costStrings.push(`${costs.license_t3}x T3 License`);
    if (costs.scrap_metal) costStrings.push(`${costs.scrap_metal} Scrap Metal`);
    if (costs.copper_wire) costStrings.push(`${costs.copper_wire} Copper Wire`);
    if (costs.brass_gears) costStrings.push(`${costs.brass_gears} Gears`);
    if (costs.circuit_boards) costStrings.push(`${costs.circuit_boards} Circuit Boards`);
    if (costs.electronic_chips) costStrings.push(`${costs.electronic_chips} Microchips`);
    if (costs.condensed_organic_material) costStrings.push(`${costs.condensed_organic_material} Condensed Organic Material`);
    if (costs.biochemicals) costStrings.push(`${costs.biochemicals} Biochemical`);
    if (costs.organic_waste) costStrings.push(`${costs.organic_waste} Organic Waste`);

    const isResourceRecipe = recipe.category === 'resources' || recipe.category === 'compost';

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
                </div>
                {!isGuideLocked && !isAlreadyInstalled && !isPrereqMissing && (
                  <span className="text-[10px] text-sky-400 font-mono">
                    ⏱️ {formatCraftDuration(recipe.durationSeconds)} Craft Duration{recipe.kw ? ` • ⚡ ${recipe.kw} kW` : ''}
                  </span>
                )}
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-400 mb-2 leading-relaxed">{recipe.description}</p>
        </div>

        <div>
          <div className="text-[10px] text-slate-300 bg-slate-950/80 p-1.5 rounded-xl border border-slate-800 mb-2">
            Cost: <span className="text-amber-300 font-semibold">{costStrings.join(', ')}</span>
          </div>

          {isGuideLocked ? (
            <div className="space-y-1.5">
              <div
                className="text-xs font-semibold text-amber-400 bg-amber-950/40 px-2.5 py-1.5 rounded-xl border border-amber-500/30 flex items-center gap-1.5"
                title={`Requires ${requiredBlueprintName} from Botanical Society`}>
                <Lock className="w-3.5 h-3.5 shrink-0" />
                <span>Requires: <strong>{requiredBlueprintName}</strong> from Botanical Society</span>
              </div>
              <button
                disabled
                title={`Requires ${requiredBlueprintName} from Botanical Society`}
                className="w-full py-2 rounded-xl font-bold text-xs bg-slate-800 text-slate-500 cursor-not-allowed flex items-center justify-center gap-1.5 border border-slate-700/60">
                <Lock className="w-3.5 h-3.5" />
                <span>Locked (Requires {requiredBlueprintName})</span>
              </button>
            </div>
          ) : isPrereqMissing ? (
            <div className="text-xs font-semibold text-amber-400 bg-amber-950/40 px-2.5 py-1.5 rounded-xl border border-amber-500/30 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 shrink-0" />
              <span>Requires Previous Tier First</span>
            </div>
          ) : (
            <button
              onClick={() => onEnqueueCraft(recipeId)}
              disabled={!canAfford || queueFull}
              className={`w-full py-2 rounded-xl font-bold text-xs transition-all shadow cursor-pointer ${
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
                : `Queue Craft (${formatCraftDuration(recipe.durationSeconds)})`}
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed top-12 left-0 right-0 bottom-0 z-40 bg-slate-950/95 backdrop-blur-md p-3 sm:p-5 flex flex-col overflow-hidden border-t border-slate-800 text-left select-none">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-3 shrink-0">
        <div className="flex items-center gap-3">
          <Wrench className="w-6 h-6 text-emerald-400" />
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-xl font-bold text-emerald-100">Artisan Workbench</h2>
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-900/60 border border-emerald-500/30 text-emerald-300">
                Tier {inv.workbench_tier || 1}: {getWorkbenchName(inv.workbench_tier || 1)}
              </span>
              {/* Prominently styled Manage Modules button matching active/hover look and color theme of submenu tabs */}
              <button
                onClick={() => {
                  setWorkbenchTab(workbenchTab === 'modules' ? 'resources' : 'modules');
                  gameAudio.playCrispClick();
                }}
                className={`py-1.5 px-3.5 rounded-xl text-xs sm:text-sm font-bold border transition-all flex items-center gap-2 shadow-md active:scale-95 cursor-pointer ${
                  workbenchTab === 'modules'
                    ? 'bg-cyan-600 hover:bg-cyan-500 text-white border-cyan-300 ring-2 ring-cyan-400/50 shadow-[0_0_14px_rgba(6,182,212,0.45)]'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400 hover:border-emerald-300 ring-1 ring-emerald-400/40 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                }`}>
                <span className="text-sm">⚙️</span>
                <span>Manage Modules: {totalAttached}/{maxCapacity} Max ({workbenchTab === 'modules' ? 'Viewing' : 'Open'})</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Manual Queue: <strong>{totalQueued} / {maxQueueCapacity} Slots</strong> (Base 1 + {assemblyBonusQueueSlots}) • Speed: <strong className="text-emerald-300">+{((overclockBonusSpeed) * 100).toFixed(0)}%</strong> • Attached Load: <strong className="text-amber-300">{craftingPowerDrain + autoFabricatorPowerDrain} kW</strong>
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition-colors cursor-pointer">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Standardized Resource Availability Bar strictly ordered:
          1. Licenses (T1: X | T2: Y | T3: Z)
          2. Scrap
          3. Wire
          4. Gears
          5. Circuits
          6. Chips
          7. Condensed Organic Material
          8. Biochemicals */}
      <div className="bg-slate-900/90 border border-slate-800 px-3 py-2 rounded-2xl mb-3 flex flex-wrap items-center justify-between gap-2 text-xs shrink-0">
        <span>📜 Licenses: <strong className="text-amber-300 font-mono">T1: {curLic1} | T2: {curLic2} | T3: {curLic3}</strong></span>
        <span>🔩 Scrap: <strong className="text-slate-300 font-mono">{curScrap}</strong></span>
        <span>⚡ Wire: <strong className="text-orange-400 font-mono">{curWire}</strong></span>
        <span>⚙️ Gears: <strong className="text-yellow-400 font-mono">{curGears}</strong></span>
        <span>🟩 Circuits: <strong className="text-emerald-400 font-mono">{curCircuits}</strong></span>
        <span>💎 Chips: <strong className="text-purple-400 font-mono">{curChips}</strong></span>
        <span>🧱 Condensed: <strong className="text-amber-300 font-mono">{curCondensed}</strong></span>
        <span>🧪 Bio: <strong className="text-cyan-400 font-mono">{curBio}</strong></span>
      </div>

      {/* Active Crafting Banner */}
      {activeCraft && (
        <div className="bg-sky-950/60 border border-sky-500/60 p-2.5 rounded-2xl mb-3 shrink-0">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <div className="flex items-center gap-2 font-bold text-sky-200">
              <span className="text-sm">{activeCraft.icon}</span>
              <span>Manual Queue: {activeCraft.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`font-bold ${powerSufficient ? 'text-sky-300 font-mono' : 'text-amber-400'}`}>
                {powerSufficient ? `${activeCraft.remainingTime.toFixed(1)}s remaining` : '⚡ Paused (Low Power)'}
              </span>
              <button
                onClick={() => onCancelCraft(-1)}
                className="bg-red-900/80 hover:bg-red-800 text-red-200 px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer">
                Cancel & Refund
              </button>
            </div>
          </div>

          <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-sky-800/80 relative">
            <div
              style={{
                width: `${Math.min(100, Math.max(0, ((activeCraft.totalTime - activeCraft.remainingTime) / activeCraft.totalTime) * 100))}%`,
              }}
              className={`h-full transition-all duration-75 ${powerSufficient ? 'bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.6)]' : 'bg-amber-400'}`}
            />
          </div>

          {craftingQueue.length > 0 && (
            <div className="mt-2 pt-1.5 border-t border-sky-800/40 space-y-1">
              <div className="text-[10px] font-bold text-sky-300/80 uppercase">
                Queued In Manual Backlog ({craftingQueue.length}):
              </div>
              <div className="space-y-1 max-h-16 overflow-y-auto">
                {craftingQueue.map((qItem, qIdx) => (
                  <div
                    key={qItem.id}
                    className="flex items-center justify-between text-[11px] bg-slate-900/70 px-2 py-0.5 rounded border border-slate-800">
                    <span className="text-slate-300">
                      {qItem.icon} {qItem.name} ({qItem.totalTime}s)
                    </span>
                    <button
                      onClick={() => onCancelCraft(qIdx)}
                      className="text-red-400 hover:text-red-300 text-[10px] font-semibold cursor-pointer">
                      Cancel
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUBMENU TABS */}
      <div className="grid grid-cols-5 gap-1.5 mb-3 shrink-0">
        <button
          onClick={() => {
            setWorkbenchTab('resources');
            gameAudio.playCrispClick();
          }}
          className={`py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
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
          className={`py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
            workbenchTab === 'bonsai_automatons' || workbenchTab === 'automatons'
              ? 'bg-sky-600 text-white shadow-md ring-2 ring-sky-400/40'
              : 'bg-slate-800 text-slate-400 hover:bg-slate-750'
          }`}>
          <span>💧</span>
          <span className="truncate">Bonsai Care</span>
        </button>

        <button
          onClick={() => {
            setWorkbenchTab('workbench');
            gameAudio.playCrispClick();
          }}
          className={`py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
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
          className={`py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
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
          className={`py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
            workbenchTab === 'electricity' || (workbenchTab as string) === 'infrastructure'
              ? 'bg-amber-600 text-white shadow-md ring-2 ring-amber-400/40'
              : 'bg-slate-800 text-slate-400 hover:bg-slate-750'
          }`}>
          <span>🏗️</span>
          <span className="truncate">Infrastructure</span>
        </button>
      </div>

      {/* CONTENT: SUBMENUS */}
      <div className="flex-1 space-y-2.5 mb-3 overflow-y-auto pr-1">
        {/* TAB 1: RESOURCES (Clean card grid with Copper Wire, Mechanical Gear, Microcircuit, Quantum Chip at very top, followed by Composts, Fertilizers, Speed Grows) */}
        {workbenchTab === 'resources' || workbenchTab === 'compost' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {resourceRecipeIds.map((recipeId, rIdx) => renderRecipeCard(recipeId, rIdx))}
          </div>
        ) : workbenchTab === 'bonsai_automatons' || workbenchTab === 'automatons' ? (
          /* TAB 2: BONSAI CARE (Sprinklers T1-T3 at top, followed by Compost Feeders and Fertilizer Drippers) */
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {[
              'tier1_automaton',
              'tier2_automaton',
              'tier3_automaton',
              't1_compost_feeder',
              't2_compost_feeder',
              't3_compost_feeder',
              't1_fertilizer_dripper',
              't2_fertilizer_dripper',
              't3_fertilizer_dripper',
            ].map((rId, idx) =>
              renderRecipeCard(rId as CraftingRecipeId, idx),
            )}
          </div>
        ) : workbenchTab === 'workbench' || workbenchTab === 'upgrades' ? (
          /* TAB 3: WORKBENCH UPGRADES & MODULES */
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {['workbench_t2_upgrade', 'workbench_t3_upgrade'].map((rId, idx) =>
                renderRecipeCard(rId as CraftingRecipeId, idx),
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-slate-800">
              {[
                'assembly_module_t1',
                'assembly_module_t2',
                'assembly_module_t3',
                'overclock_module_t1',
                'overclock_module_t2',
                'overclock_module_t3',
                'auto_fabrication_t1',
                'auto_fabrication_t2',
                'auto_fabrication_t3',
              ].map((rId, idx) => renderRecipeCard(rId as CraftingRecipeId, idx + 2))}
            </div>
          </div>
        ) : workbenchTab === 'rover' ? (
          /* TAB 4: ROVER (Chassis upgrades, Battery Modules T1-T3 directly above Storage Modules T1-T3, Radar Modules T1-T3) */
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {[
              'rover_chassis_t2',
              'rover_chassis_t3',
              'rover_battery_module_1',
              'rover_battery_module_2',
              'rover_battery_module_3',
              'rover_storage_module_1',
              'rover_storage_module_2',
              'rover_storage_module_3',
              'rover_radar_module_1',
              'rover_radar_module_2',
              'rover_radar_module_3',
            ].map((rId, idx) => renderRecipeCard(rId as CraftingRecipeId, idx))}
          </div>
        ) : workbenchTab === 'electricity' || (workbenchTab as string) === 'infrastructure' ? (
          /* TAB 5: INFRASTRUCTURE (Solar panels, Solar farms, Turbines, Turbine farms, Auto (Un-)Loader at very bottom) */
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {[
              'solar_panel',
              'solar_farm_2x2',
              'solar_farm_3x3',
              'wind_turbine',
              'wind_farm_2x2',
              'wind_farm_3x3',
              'auto_unloader',
            ].map((rId, idx) => renderRecipeCard(rId as CraftingRecipeId, idx))}
          </div>
        ) : workbenchTab === 'modules' ? (
          /* DEDICATED MODULE MANAGEMENT VIEW */
          <div className="space-y-4">
            {/* Installed Modules Summary */}
            <div className="bg-slate-900/90 border border-cyan-500/40 p-4 rounded-2xl shadow-lg space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-500/60 flex items-center justify-center text-xl shadow">
                    ⚙️
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-100">
                      Installed Workbench Modules ({totalAttached} / {maxCapacity} Bays)
                    </h3>
                    <p className="text-xs text-slate-400">
                      Tier {inv.workbench_tier || 1}: {getWorkbenchName(inv.workbench_tier || 1)} • Queue Capacity: {maxQueueCapacity} • Craft Speed: +{((overclockBonusSpeed) * 100).toFixed(0)}%
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-xs font-mono font-bold px-2 py-1 rounded-lg border ${
                    powerSufficient ? 'bg-emerald-950 text-emerald-300 border-emerald-500/50' : 'bg-rose-950 text-rose-300 border-rose-500/50'
                  }`}>
                    Load: {craftingPowerDrain + autoFabricatorPowerDrain} kW
                  </span>
                </div>
              </div>

              {/* Grid of Installed Modules */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-slate-800">
                {/* Legacy Assembly Arms */}
                {Array.from({ length: installedCraftingArms }).map((_, aIdx) => (
                  <div key={`arm_${aIdx}`} className="bg-slate-950/80 border border-sky-500/50 p-3 rounded-xl flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">🤖</span>
                      <div>
                        <div className="text-xs font-bold text-slate-100">Crafting Assembly Arm</div>
                        <div className="text-[10px] text-sky-300">+1 Queue Slot • +25% Speed • 3 kW</div>
                      </div>
                    </div>
                    {onDetachWorkbenchModule && (
                      <button
                        onClick={() => onDetachWorkbenchModule(aIdx)}
                        className="bg-slate-800 hover:bg-rose-950 text-slate-300 hover:text-rose-200 border border-slate-700 hover:border-rose-500 text-[10px] font-bold px-2.5 py-1 rounded-lg cursor-pointer">
                        Detach
                      </button>
                    )}
                  </div>
                ))}

                {/* Attached Modules */}
                {(inv.attached_workbench_modules || []).map((modType, mIdx) => {
                  const cfg = WORKBENCH_MODULE_CONFIGS[modType];
                  if (!cfg) return null;
                  return (
                    <div key={`mod_${mIdx}`} className="bg-slate-950/80 border border-cyan-500/50 p-3 rounded-xl flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{cfg.icon}</span>
                        <div>
                          <div className="text-xs font-bold text-slate-100">{cfg.name}</div>
                          <div className="text-[10px] text-cyan-300">{cfg.bonusLabel} • ⚡ {cfg.kw} kW</div>
                        </div>
                      </div>
                      {onDetachWorkbenchModule && (
                        <button
                          onClick={() => onDetachWorkbenchModule(mIdx)}
                          className="bg-slate-800 hover:bg-rose-950 text-slate-300 hover:text-rose-200 border border-slate-700 hover:border-rose-500 text-[10px] font-bold px-2.5 py-1 rounded-lg cursor-pointer">
                          Detach
                        </button>
                      )}
                    </div>
                  );
                })}

                {/* Auto-Fabricator Lanes */}
                {autoFabricatorLanes.map((lane) => {
                  const targetRecipe = lane.targetRecipeId !== 'none' ? WORKBENCH_RECIPES[lane.targetRecipeId] : null;
                  const kw = lane.tier === 1 ? 6 : lane.tier === 3 ? 14 : 10;
                  const speedLabel = lane.tier === 1 ? '50% Speed' : lane.tier === 3 ? '150% Speed' : '100% Speed';

                  return (
                    <div key={lane.id} className="bg-slate-950/80 border border-cyan-500/60 p-3 rounded-xl space-y-2 col-span-1 sm:col-span-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">🏭</span>
                          <div>
                            <div className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                              <span>T{lane.tier} Auto-Fabrication Lane</span>
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                                {speedLabel} • ⚡ {kw} kW
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-400">
                              Target: <strong className="text-emerald-300">{targetRecipe ? targetRecipe.name : 'None / Halted'}</strong>
                            </div>
                          </div>
                        </div>
                        {onDetachAutoLane && (
                          <button
                            onClick={() => onDetachAutoLane(lane.id)}
                            className="bg-slate-800 hover:bg-rose-950 text-slate-300 hover:text-rose-200 border border-slate-700 hover:border-rose-500 text-[10px] font-bold px-2.5 py-1 rounded-lg cursor-pointer">
                            Detach Lane
                          </button>
                        )}
                      </div>

                      {/* Recipe Selector for Auto-Lane */}
                      {onSetAutoLaneRecipe && (
                        <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-slate-800">
                          <span className="text-[10px] text-slate-400 font-semibold mr-1">Assign Recipe:</span>
                          {[
                            { id: 'craft_copper_wire', label: 'Wire' },
                            { id: 'craft_gears', label: 'Gears' },
                            { id: 'craft_microcircuits', label: 'Circuits' },
                            { id: 'craft_quantum_chips', label: 'Chips' },
                            { id: 'craft_compost_s', label: 'Compost S' },
                            { id: 'craft_fertilizer_s', label: 'Fertilizer S' },
                            { id: 'none', label: 'Halt' },
                          ].map((opt) => (
                            <button
                              key={opt.id}
                              onClick={() => onSetAutoLaneRecipe(lane.id, opt.id as any)}
                              className={`text-[10px] px-2 py-0.5 rounded-lg font-bold border transition-all cursor-pointer ${
                                lane.targetRecipeId === opt.id
                                  ? 'bg-emerald-600 text-white border-emerald-400 shadow-sm'
                                  : 'bg-slate-900 text-slate-400 border-slate-700 hover:bg-slate-800'
                              }`}>
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}

                {totalAttached === 0 && (
                  <div className="col-span-1 sm:col-span-2 text-center py-4 text-xs text-slate-500 bg-slate-950/40 rounded-xl border border-dashed border-slate-800">
                    No modules currently attached. Install available modules from your inventory below!
                  </div>
                )}
              </div>
            </div>

            {/* Unattached Modules in Inventory */}
            <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shadow-lg space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Package className="w-4 h-4 text-emerald-400" />
                  <span>Uninstalled Modules in Inventory</span>
                </h4>
                <span className="text-[11px] text-slate-400">
                  {totalAttached >= maxCapacity ? (
                    <strong className="text-amber-400">Bays Full ({totalAttached}/{maxCapacity})</strong>
                  ) : (
                    <strong className="text-emerald-400">{maxCapacity - totalAttached} Bays Open</strong>
                  )}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {(
                  [
                    'assembly_module_t1',
                    'assembly_module_t2',
                    'assembly_module_t3',
                    'overclock_module_t1',
                    'overclock_module_t2',
                    'overclock_module_t3',
                    'auto_fabrication_t1',
                    'auto_fabrication_t2',
                    'auto_fabrication_t3',
                  ] as WorkbenchModuleType[]
                ).map((mKey) => {
                  const cfg = WORKBENCH_MODULE_CONFIGS[mKey];
                  const invKey = `${mKey}_inv` as keyof SanctuaryInventory;
                  const inStock = ((inv[invKey] as number) || 0) + (mKey === 'auto_fabrication_t2' ? (inv.auto_fabricators_inv || 0) : 0);
                  const canAttach = inStock > 0 && totalAttached < maxCapacity;

                  return (
                    <div
                      key={mKey}
                      className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                        inStock > 0
                          ? 'bg-slate-950/90 border-slate-700 shadow-sm'
                          : 'bg-slate-950/40 border-slate-850 opacity-50'
                      }`}>
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-xl shrink-0">{cfg.icon}</span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h5 className="font-bold text-xs text-slate-100 truncate">{cfg.name}</h5>
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-500/40">
                              {cfg.bonusLabel} • ⚡ {cfg.kw} kW
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            Stock: <strong className={inStock > 0 ? 'text-sky-300 font-mono' : 'text-slate-500 font-mono'}>{inStock}</strong>
                          </span>
                        </div>
                      </div>

                      <button
                        disabled={!canAttach}
                        onClick={() => onAttachWorkbenchModule && onAttachWorkbenchModule(mKey)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all shadow cursor-pointer ${
                          canAttach
                            ? 'bg-emerald-600 hover:bg-emerald-500 text-white active:scale-95'
                            : inStock <= 0
                            ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                            : 'bg-slate-800 text-amber-400/80 cursor-not-allowed'
                        }`}>
                        {inStock <= 0 ? 'No Stock' : totalAttached >= maxCapacity ? 'Bays Full' : 'Install (+)'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* FOOTER */}
      <div className="pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 shrink-0 mt-1">
        <span className="font-mono text-sky-400 text-[11px] hidden sm:inline">
          🎮 [A/D / LB/RB] Switch Tabs • [W/S] Select • [E / A] Queue Craft • [Arrows / R-Stick] Scroll • [Esc / B] Close
        </span>
        <button
          onClick={onClose}
          className="px-5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold transition-all border border-slate-700 cursor-pointer">
          Close [Esc / B]
        </button>
      </div>
    </div>
  );
}
