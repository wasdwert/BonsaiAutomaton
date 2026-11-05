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

  const curScrap = inv.scrap_metal ?? inv.scrapMetal ?? inv.resources?.scrap_metal ?? inv.resources?.scrapMetal ?? 0;
  const curWire = inv.copper_wire ?? inv.copperWire ?? inv.resources?.copper_wire ?? inv.resources?.copperWire ?? 0;
  const curGears = inv.brass_gears ?? inv.gears ?? inv.resources?.brass_gears ?? inv.resources?.gears ?? 0;
  const curCircuits = inv.circuit_boards ?? inv.microcircuits ?? inv.resources?.circuit_boards ?? inv.resources?.microcircuits ?? 0;
  const curChips = inv.electronic_chips ?? inv.chips ?? inv.quantumChips ?? inv.resources?.electronic_chips ?? inv.resources?.chips ?? 0;
  const curWaste = inv.organic_waste ?? inv.organicWaste ?? inv.resources?.organic_waste ?? inv.resources?.organicWaste ?? 0;
  const curBio = inv.biochemicals ?? inv.biochemical ?? inv.resources?.biochemicals ?? 0;
  const curCondensed = inv.condensed_organic_material ?? inv.condensedOrganicMaterial ?? inv.resources?.condensed_organic_material ?? 0;

  // 11 fast-crafting recipes in Resources tab
  const resourceRecipeIds: CraftingRecipeId[] = [
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
    'craft_copper_wire',
    'craft_gears',
    'craft_microcircuits',
    'craft_quantum_chips',
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

    const costStrings: string[] = [];
    if (costs.license_t1) costStrings.push(`${costs.license_t1}x T1 License`);
    if (costs.license_t2) costStrings.push(`${costs.license_t2}x T2 License`);
    if (costs.license_t3) costStrings.push(`${costs.license_t3}x T3 License`);
    if (costs.condensed_organic_material) costStrings.push(`${costs.condensed_organic_material} Condensed Organic Material`);
    if (costs.biochemicals) costStrings.push(`${costs.biochemicals} Biochemical`);
    if (costs.organic_waste) costStrings.push(`${costs.organic_waste} Organic Waste`);
    if (costs.copper_wire) costStrings.push(`${costs.copper_wire} Copper Wire`);
    if (costs.scrap_metal) costStrings.push(`${costs.scrap_metal} Scrap Metal`);
    if (costs.brass_gears) costStrings.push(`${costs.brass_gears} Gears`);
    if (costs.circuit_boards) costStrings.push(`${costs.circuit_boards} Circuit Boards`);
    if (costs.electronic_chips) costStrings.push(`${costs.electronic_chips} Microchips`);

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
              <button
                onClick={() => {
                  setWorkbenchTab(workbenchTab === 'modules' ? 'resources' : 'modules');
                  gameAudio.playCrispClick();
                }}
                className={`text-xs font-bold px-3 py-1 rounded-xl border transition-all flex items-center gap-1.5 shadow active:scale-95 cursor-pointer ${
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

      {/* Materials Strip with Condensed Organic Material Tracking */}
      <div className="bg-slate-900/90 border border-slate-800 px-3 py-2 rounded-2xl mb-3 flex flex-wrap items-center justify-between gap-2 text-xs shrink-0">
        <span>🧱 Condensed: <strong className="text-amber-300 font-mono">{curCondensed}</strong></span>
        <span>🧪 Bio: <strong className="text-cyan-400 font-mono">{curBio}</strong></span>
        <span>🍂 Waste: <strong className="text-lime-400 font-mono">{curWaste}</strong></span>
        <span>⚡ Wire: <strong className="text-orange-400 font-mono">{curWire}</strong></span>
        <span>⚙️ Gears: <strong className="text-yellow-400 font-mono">{curGears}</strong></span>
        <span>🟩 Circuits: <strong className="text-emerald-400 font-mono">{curCircuits}</strong></span>
        <span>💎 Chips: <strong className="text-purple-400 font-mono">{curChips}</strong></span>
        <span>🔩 Scrap: <strong className="text-slate-300 font-mono">{curScrap}</strong></span>
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
            workbenchTab === 'electricity'
              ? 'bg-amber-600 text-white shadow-md ring-2 ring-amber-400/40'
              : 'bg-slate-800 text-slate-400 hover:bg-slate-750'
          }`}>
          <span>🏗️</span>
          <span className="truncate">Infrastructure</span>
        </button>
      </div>

      {/* CONTENT: RESOURCES SUBMENU WITH 11 FAST-CRAFTING RECIPES */}
      <div className="flex-1 space-y-2.5 mb-3 overflow-y-auto pr-1">
        {workbenchTab === 'resources' || workbenchTab === 'compost' ? (
          <div>
            <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span>🌾</span>
                <span>Fast-Crafting Recipes (Condensed Organic Material &amp; Biochemicals)</span>
              </span>
              <span className="text-[11px] text-slate-400 font-normal">
                Quick 5s - 40s synthesis in Workbench
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {resourceRecipeIds.map((recipeId, rIdx) => renderRecipeCard(recipeId, rIdx))}
            </div>
          </div>
        ) : workbenchTab === 'bonsai_automatons' || workbenchTab === 'automatons' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {[
              't1_compost_feeder',
              't2_compost_feeder',
              't3_compost_feeder',
              't1_fertilizer_dripper',
              't2_fertilizer_dripper',
              't3_fertilizer_dripper',
              'tier1_automaton',
              'tier2_automaton',
              'tier3_automaton',
            ].map((rId, idx) =>
              renderRecipeCard(rId as CraftingRecipeId, idx),
            )}
          </div>
        ) : workbenchTab === 'workbench' || workbenchTab === 'upgrades' ? (
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {[
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
            ].map((rId, idx) => renderRecipeCard(rId as CraftingRecipeId, idx))}
          </div>
        ) : workbenchTab === 'electricity' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {[
              'auto_unloader',
              'solar_panel',
              'solar_farm_2x2',
              'solar_farm_3x3',
              'wind_turbine',
              'wind_farm_2x2',
              'wind_farm_3x3',
            ].map((rId, idx) => renderRecipeCard(rId as CraftingRecipeId, idx))}
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
