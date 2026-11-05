import React, { useState } from 'react';
import { X, Sparkles, Clock, Check, AlertCircle, Package, Zap, Lock } from 'lucide-react';
import {
  StationRecipeId,
  StationRecipeDef,
  STATION_RECIPES,
} from './types';
import { DeployedStructure, SanctuaryInventory } from './App';
import { gameAudio } from './utils/helper';
import { BLUEPRINT_BY_ID } from './blueprints';

export const STATION_RECIPE_BLUEPRINTS: Partial<Record<StationRecipeId, { bpId: string; name: string }>> = {
  compost_m: { bpId: 'bp_heap_compost_m', name: 'Compost M Recipe for Compost Heap' },
  compost_l: { bpId: 'bp_heap_compost_l', name: 'Compost L Recipe for Compost Heap' },
  condensed_organic_material: { bpId: 'bp_heap_condensed_organic', name: 'Condensed Organic Material Recipe' },
  fertilizer_m: { bpId: 'bp_chem_fertilizer_m', name: 'Fertilizer M Recipe for Chemical Station' },
  fertilizer_l: { bpId: 'bp_chem_fertilizer_l', name: 'Fertilizer L Recipe for Chemical Station' },
  speed_grow_xs: { bpId: 'bp_chem_speed_grow_xs', name: 'Speed Grow XS Recipe for Chemical Station' },
  speed_grow_s: { bpId: 'bp_chem_speed_grow_s', name: 'Speed Grow S Recipe for Chemical Station' },
  speed_grow_m: { bpId: 'bp_chem_speed_grow_m', name: 'Speed Grow M Recipe for Chemical Station' },
  speed_grow_l: { bpId: 'bp_chem_speed_grow_l', name: 'Speed Grow L Recipe for Chemical Station' },
  speed_grow_xl: { bpId: 'bp_chem_speed_grow_xl', name: 'Speed Grow XL Recipe for Chemical Station' },
  biochemical: { bpId: 'bp_chem_biochemical', name: 'Biochemical Blueprint' },
  biochemicals: { bpId: 'bp_chem_biochemical', name: 'Biochemical Blueprint' },
};

export interface StationRecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
  station: DeployedStructure | null;
  inventory: SanctuaryInventory;
  unlockedBlueprints?: string[];
  onSelectRecipe: (stationId: string, recipeId: StationRecipeId) => void;
  onDepositIngredients?: (stationId: string) => void;
  onCollectGoods?: (stationId: string) => void;
}

export default function StationRecipeModal({
  isOpen,
  onClose,
  station,
  inventory,
  unlockedBlueprints,
  onSelectRecipe,
  onDepositIngredients,
  onCollectGoods,
}: StationRecipeModalProps) {
  // Chemical Station category tab: 'all' | 'fertilizer' | 'speed_grow'
  const [chemFilter, setChemFilter] = useState<'all' | 'fertilizer' | 'speed_grow'>('all');

  // Dedicated capturing Escape key listener to guarantee modal precedence
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [isOpen, onClose]);

  if (!isOpen || !station) return null;

  const isCompostHeap = station.type === 'tool_compost_heap';
  const stationTitle = isCompostHeap ? 'Compost Heap Production' : 'Chemical Station Production';
  const stationIcon = isCompostHeap ? '🍂' : '🧪';

  const allChemRecipes: StationRecipeId[] = [
    'biochemical',
    'fertilizer_s',
    'fertilizer_m',
    'fertilizer_l',
    'speed_grow_xs',
    'speed_grow_s',
    'speed_grow_m',
    'speed_grow_l',
    'speed_grow_xl',
  ];

  let relevantRecipeIds: StationRecipeId[] = [];
  if (isCompostHeap) {
    relevantRecipeIds = ['condensed_organic_material', 'compost_s', 'compost_m', 'compost_l'];
  } else {
    if (chemFilter === 'fertilizer') {
      relevantRecipeIds = ['biochemical', 'fertilizer_s', 'fertilizer_m', 'fertilizer_l'];
    } else if (chemFilter === 'speed_grow') {
      relevantRecipeIds = ['speed_grow_xs', 'speed_grow_s', 'speed_grow_m', 'speed_grow_l', 'speed_grow_xl'];
    } else {
      relevantRecipeIds = allChemRecipes;
    }
  }

  const readyUnits = station.readyUnits || 0;
  const queuedUnits = station.queuedUnits || 0;
  const timer = station.timer || 0;
  const isBusy = readyUnits > 0 || queuedUnits > 0 || timer > 0;
  const selectedRecipeId = station.selectedRecipe || null;
  const selectedDef = selectedRecipeId ? STATION_RECIPES[selectedRecipeId] : null;

  const totalInSystem = readyUnits + queuedUnits + (timer > 0 ? 1 : 0);
  const remainingCapacity = Math.max(0, 10 - totalInSystem);

  const getRecipeStyles = (def: StationRecipeDef) => {
    if (def.id === 'condensed_organic_material') {
      return {
        cardBg: 'from-amber-950/70 via-slate-900 to-slate-950 border-amber-500/50 text-amber-300',
        badgeBg: 'bg-amber-400 text-slate-950 font-black',
      };
    }
    if (def.id === 'biochemical' || def.id === 'biochemicals') {
      return {
        cardBg: 'from-cyan-950/70 via-slate-900 to-slate-950 border-cyan-500/50 text-cyan-300',
        badgeBg: 'bg-cyan-400 text-slate-950 font-black',
      };
    }

    if (def.effectCategory === 'organic') {
      if (def.tier === 'S') {
        return {
          cardBg: 'from-lime-950/60 border-lime-500/40 text-lime-300',
          badgeBg: 'bg-lime-500 text-slate-950',
        };
      }
      if (def.tier === 'M') {
        return {
          cardBg: 'from-emerald-950/60 border-emerald-500/40 text-emerald-300',
          badgeBg: 'bg-emerald-500 text-slate-950',
        };
      }
      return {
        cardBg: 'from-amber-950/60 border-amber-500/40 text-amber-300',
        badgeBg: 'bg-amber-400 text-slate-950',
      };
    }

    if (def.effectCategory === 'chemical') {
      if (def.tier === 'S') {
        return {
          cardBg: 'from-cyan-950/60 border-cyan-500/40 text-cyan-300',
          badgeBg: 'bg-cyan-500 text-slate-950',
        };
      }
      if (def.tier === 'M') {
        return {
          cardBg: 'from-sky-950/60 border-sky-500/40 text-sky-300',
          badgeBg: 'bg-sky-500 text-slate-950',
        };
      }
      return {
        cardBg: 'from-indigo-950/60 border-indigo-500/40 text-indigo-300',
        badgeBg: 'bg-indigo-400 text-slate-950',
      };
    }

    // Speed Grow
    if (def.tier === 'XS') {
      return {
        cardBg: 'from-amber-950/60 border-amber-500/40 text-amber-300',
        badgeBg: 'bg-amber-500 text-slate-950',
      };
    }
    if (def.tier === 'S') {
      return {
        cardBg: 'from-orange-950/60 border-orange-500/40 text-orange-300',
        badgeBg: 'bg-orange-500 text-slate-950',
      };
    }
    if (def.tier === 'M') {
      return {
        cardBg: 'from-yellow-950/60 border-yellow-500/40 text-yellow-300',
        badgeBg: 'bg-yellow-400 text-slate-950',
      };
    }
    if (def.tier === 'L') {
      return {
        cardBg: 'from-emerald-950/60 border-emerald-500/40 text-emerald-300',
        badgeBg: 'bg-emerald-400 text-slate-950',
      };
    }
    return {
      cardBg: 'from-purple-950/60 border-purple-500/40 text-purple-300',
      badgeBg: 'bg-purple-400 text-slate-950',
    };
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm pointer-events-auto select-none animate-in fade-in duration-150">
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl bg-slate-950/95 border-2 border-emerald-500/50 rounded-3xl p-4 sm:p-6 shadow-2xl backdrop-blur-xl flex flex-col text-left max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">{stationIcon}</span>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-100">{stationTitle}</h3>
              <p className="text-[11px] text-slate-400">
                {isCompostHeap
                  ? 'Refine organic waste into condensed organic material and tiered growth composts'
                  : 'Synthesize biochemicals, fertilizers, and instant Speed Grow accelerators (9 Recipes Total)'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-slate-200 transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chemical Station Filter Tabs */}
        {!isCompostHeap && (
          <div className="grid grid-cols-3 gap-1.5 mb-3 shrink-0">
            <button
              onClick={() => {
                setChemFilter('all');
                gameAudio.playCrispClick();
              }}
              className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                chemFilter === 'all'
                  ? 'bg-emerald-600 text-white shadow ring-2 ring-emerald-400/40'
                  : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}>
              <span>All Recipes (9)</span>
            </button>
            <button
              onClick={() => {
                setChemFilter('fertilizer');
                gameAudio.playCrispClick();
              }}
              className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                chemFilter === 'fertilizer'
                  ? 'bg-cyan-600 text-white shadow ring-2 ring-cyan-400/40'
                  : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}>
              <span>🧪 Fertilizers & Biochemicals (4)</span>
            </button>
            <button
              onClick={() => {
                setChemFilter('speed_grow');
                gameAudio.playCrispClick();
              }}
              className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                chemFilter === 'speed_grow'
                  ? 'bg-amber-600 text-white shadow ring-2 ring-amber-400/40'
                  : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}>
              <Zap className="w-3.5 h-3.5" />
              <span>Speed Grow (5)</span>
            </button>
          </div>
        )}

        {/* Current Station Status Banner */}
        <div className={`p-3 rounded-2xl border mb-3 shrink-0 text-xs ${
          isBusy
            ? 'bg-amber-950/40 border-amber-500/40 text-amber-200'
            : selectedDef
            ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
            : 'bg-slate-900/80 border-slate-800 text-slate-300'
        }`}>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="font-bold">
                {selectedDef ? (
                  <>Active Recipe: <span className="text-amber-300 font-black">{selectedDef.name}</span></>
                ) : (
                  <span className="text-slate-400">No Recipe Chosen • Select a tier below to begin</span>
                )}
              </span>
              <span className="bg-slate-900/80 px-2 py-0.5 rounded-full border border-slate-700 font-mono text-[10px]">
                Capacity: {totalInSystem} / 10 Units in System
              </span>
            </div>

            {readyUnits > 0 && selectedDef && (
              <span className="bg-emerald-500 text-slate-950 px-2 py-0.5 rounded-full font-black text-[10px] animate-pulse">
                {readyUnits} {selectedDef.name} Ready to Collect!
              </span>
            )}
          </div>

          {isBusy && (
            <p className="text-[11px] text-amber-300/80 mt-1.5 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>Cannot switch recipe while in production or holding goods. Collect all items first!</span>
            </p>
          )}
        </div>

        {/* Recipe Cards List */}
        <div className="space-y-2.5 overflow-y-auto pr-1 flex-1">
          {relevantRecipeIds.map((recipeId) => {
            const def = STATION_RECIPES[recipeId];
            const isSelected = selectedRecipeId === recipeId;

            // Blueprint unlock gating:
            // Compost S & Fertilizer S are default unlocked.
            // Other station recipes require their respective blueprint from the 58 catalog!
            const bpReq = STATION_RECIPE_BLUEPRINTS[recipeId];
            const effectiveUnlocked = unlockedBlueprints || inventory.unlockedBlueprints || [];
            const isLocked = Boolean(bpReq && !effectiveUnlocked.includes(bpReq.bpId));
            const requiredBlueprintName = bpReq?.name || 'Blueprint';

            // Compute player affordability for 1 unit
            const costEntries = Object.entries(def.costs) as [keyof typeof def.costs, number][];
            const canAffordOne = costEntries.every(([itemKey, amount]) => {
              let userStock = inventory[itemKey] || 0;
              if (itemKey === 'copper_wire' || itemKey === 'wire') {
                userStock = inventory.copper_wire ?? inventory.copperWire ?? inventory.wire ?? 0;
              } else if (itemKey === 'biochemicals' || itemKey === 'biochemical') {
                userStock = inventory.biochemicals ?? inventory.biochemical ?? inventory.resources?.biochemicals ?? 0;
              } else if (itemKey === 'condensed_organic_material') {
                userStock = inventory.condensed_organic_material ?? inventory.condensedOrganicMaterial ?? inventory.resources?.condensed_organic_material ?? 0;
              } else if (itemKey === 'organic_waste') {
                userStock = inventory.organic_waste ?? inventory.organicWaste ?? inventory.resources?.organic_waste ?? 0;
              }
              return userStock >= (amount || 0);
            });

            const styles = getRecipeStyles(def);

            return (
              <div
                key={def.id}
                className={`p-3.5 rounded-2xl border bg-gradient-to-br ${styles.cardBg} bg-slate-900/80 transition-all ${
                  isLocked
                    ? 'opacity-70 border-slate-800'
                    : isSelected
                    ? 'ring-2 ring-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.3)]'
                    : 'hover:border-slate-600'
                }`}>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2.5">
                    <span className={`px-2 py-0.5 rounded-lg text-xs font-black shadow-sm ${styles.badgeBg}`}>
                      {def.id === 'condensed_organic_material'
                        ? 'Material'
                        : def.id === 'biochemical' || def.id === 'biochemicals'
                        ? 'Reagent'
                        : `Tier ${def.tier}`}
                    </span>
                    <span className="text-xl">{def.icon}</span>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                          {def.name}
                          {isSelected && (
                            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.2 rounded-full font-black">
                              ✓ Active Recipe
                            </span>
                          )}
                        </h4>
                        {isLocked && (
                          <span
                            title={`Requires ${requiredBlueprintName} from Botanical Society`}
                            className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/50 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                            <Lock className="w-3 h-3" />
                            <span>Requires {requiredBlueprintName}</span>
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>Craft Duration: {def.durationSeconds}s per unit</span>
                      </span>
                    </div>
                  </div>

                  {/* Select Recipe Button / Locked Badge */}
                  {isLocked ? (
                    <div
                      title={`Requires ${requiredBlueprintName} from Botanical Society`}
                      className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-500 text-xs font-bold flex items-center gap-1 cursor-not-allowed">
                      <Lock className="w-3.5 h-3.5 text-amber-400" />
                      <span>Locked</span>
                    </div>
                  ) : isSelected ? (
                    <div className="px-3 py-1.5 rounded-xl bg-emerald-950 border border-emerald-500 text-emerald-300 text-xs font-black flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      <span>Selected</span>
                    </div>
                  ) : (
                    <button
                      disabled={isBusy}
                      onClick={() => {
                        onSelectRecipe(station.id, def.id);
                        gameAudio.playConfirmSelect();
                      }}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow cursor-pointer ${
                        !isBusy
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white active:scale-95'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                      }`}>
                      Select Recipe
                    </button>
                  )}
                </div>

                {/* Effect Pill */}
                <div className="bg-slate-950/70 p-2 rounded-xl border border-slate-800/80 mb-2 flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-semibold flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Effect:</span>
                  </span>
                  <span className={`font-bold font-mono ${
                    def.effectCategory === 'speed_grow' ? 'text-amber-300' : 'text-emerald-300'
                  }`}>
                    {def.effectLabel}
                  </span>
                </div>

                {/* Cost Breakdown & Stock */}
                <div className="bg-slate-950/90 p-2.5 rounded-xl border border-slate-800 text-[11px] space-y-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Cost per Unit Produced:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {costEntries.map(([costKey, amount]) => {
                      let userStock = inventory[costKey] || 0;
                      if (costKey === 'copper_wire' || costKey === 'wire') {
                        userStock = inventory.copper_wire ?? inventory.copperWire ?? inventory.wire ?? 0;
                      } else if (costKey === 'biochemicals' || costKey === 'biochemical') {
                        userStock = inventory.biochemicals ?? inventory.biochemical ?? inventory.resources?.biochemicals ?? 0;
                      } else if (costKey === 'condensed_organic_material') {
                        userStock = inventory.condensed_organic_material ?? inventory.condensedOrganicMaterial ?? inventory.resources?.condensed_organic_material ?? 0;
                      } else if (costKey === 'organic_waste') {
                        userStock = inventory.organic_waste ?? inventory.organicWaste ?? inventory.resources?.organic_waste ?? 0;
                      }
                      const hasEnough = userStock >= (amount || 0);
                      const labelMap: Record<string, string> = {
                        organic_waste: '🍂 Organic Waste',
                        copper_wire: '⚡ Copper Wire',
                        wire: '⚡ Copper Wire',
                        condensed_organic_material: '🧱 Condensed Organic Material',
                        biochemicals: '🧪 Biochemical',
                        biochemical: '🧪 Biochemical',
                        compost_s: '🍂 Compost S',
                        compost_m: '🌾 Compost M',
                        fertilizer_s: '🧪 Fertilizer S',
                        fertilizer_m: '⚡ Fertilizer M',
                      };

                      return (
                        <div
                          key={costKey}
                          className={`px-2 py-0.5 rounded-lg border flex items-center gap-1 font-mono text-[10px] ${
                            hasEnough
                              ? 'bg-slate-900 border-slate-700 text-slate-200'
                              : 'bg-rose-950/60 border-rose-500/50 text-rose-300'
                          }`}>
                          <span>{labelMap[costKey] || costKey}:</span>
                          <span className={hasEnough ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                            {amount}
                          </span>
                          <span className="text-slate-500 font-normal">
                            (You have: {userStock})
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-slate-800 shrink-0 mt-2 flex items-center justify-between gap-2 flex-wrap">
          <div className="text-[11px] font-mono text-slate-400">
            <span>[Space / X] Quick Deposit in World • Max 10 Units in System</span>
          </div>

          <div className="flex items-center gap-2">
            {readyUnits > 0 && selectedDef && onCollectGoods && (
              <button
                onClick={() => {
                  onCollectGoods(station.id);
                  onClose();
                }}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-all shadow flex items-center gap-1.5 cursor-pointer animate-pulse">
                <Package className="w-3.5 h-3.5" />
                <span>Collect {readyUnits} {selectedDef.name}</span>
              </button>
            )}

            {selectedDef && remainingCapacity > 0 && onDepositIngredients && (
              <button
                onClick={() => onDepositIngredients(station.id)}
                className="bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-all shadow flex items-center gap-1.5 cursor-pointer">
                <span>[Space] Deposit Ingredients</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold text-xs transition-all border border-slate-700 cursor-pointer">
              Close [Esc / B]
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
