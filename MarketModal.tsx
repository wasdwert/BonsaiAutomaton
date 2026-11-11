import React, { useState, useEffect } from 'react';
import {
  X,
  Store,
  Map as MapIcon,
  Maximize2,
  Wrench,
  Info,
} from 'lucide-react';
import {
  SanctuaryInventory,
  DeployedStructure,
  SANCTUARY_EXPANSIONS,
  getStructureInventoryCount,
  ItemVectorPreview,
  VerdureIcon,
} from './App';
import { BlueprintDef } from './blueprints';
import { gameAudio } from './utils/helper';

export type MarketTabKey =
  | 'maps'
  | 'expansions'
  | 'decorations'
  | 'equipment'
  | 'decor';

export interface MarketModalProps {
  isOpen: boolean;
  onClose: () => void;
  inventory: SanctuaryInventory;
  unlockedBlueprints?: string[];
  verdureBalance: number;
  onPurchaseBlueprint?: (blueprint: BlueprintDef) => void;
  onBuyExpeditionMap: (mapKey: 'has_map_highlands' | 'has_map_overgrowth', cost: number, mapName: string) => void;
  onBuySanctuaryExpansion: (targetTier: number, cost: number, name: string) => void;
  onBuyDecoration: (decorType: any, cost: number, name: string) => void;
  onBuyEngineeringLicense: (tier: 1 | 2 | 3, cost: number) => void;
  onBuyTool: (toolType: any, cost: number, name: string) => void;
  onBuyBiochemicals: (cost: number) => void;
  onBuyManualIrrigation: (type: any, cost: number, name: string) => void;
  assets?: Record<string, HTMLImageElement | null>;
  deployedStructures?: DeployedStructure[];
  activeTab?: MarketTabKey;
  onTabChange?: (tab: MarketTabKey) => void;
  discountRate?: number;
}

export default function MarketModal({
  isOpen,
  onClose,
  inventory,
  verdureBalance,
  onBuyExpeditionMap,
  onBuySanctuaryExpansion,
  onBuyDecoration,
  onBuyEngineeringLicense,
  onBuyTool,
  onBuyBiochemicals,
  onBuyManualIrrigation,
  assets = {},
  deployedStructures = [],
  activeTab: externalTab,
  onTabChange,
  discountRate = 0,
}: MarketModalProps) {
  const [internalTab, setInternalTab] = useState<MarketTabKey>('maps');
  const [focusedShopIdx, setFocusedShopIdx] = useState<number>(0);

  const rawTab = externalTab ?? internalTab;
  const currentTab: 'maps' | 'expansions' | 'decorations' | 'equipment' =
    rawTab === 'decor' ? 'decorations' : rawTab === 'blueprints' as any ? 'equipment' : (rawTab as any);

  const setTab = (t: MarketTabKey) => {
    const normalized: MarketTabKey = t === 'decor' ? 'decorations' : t;
    setInternalTab(normalized);
    onTabChange?.(normalized);
    setFocusedShopIdx(0);
    gameAudio?.playCrispClick?.();
  };

  const tabs: MarketTabKey[] = ['maps', 'expansions', 'decorations', 'equipment'];

  const discountMultiplier = Math.max(0.1, 1 - (discountRate || 0));
  const getPrice = (baseCost: number) => Math.max(1, Math.round(baseCost * discountMultiplier));

  const tabLengths: Record<string, number> = {
    maps: 2,
    expansions: 4,
    decorations: 10,
    decor: 10,
    equipment: 9,
  };

  // Keyboard navigation for Botanical Market
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        const next = tabs[(tabs.indexOf(currentTab) - 1 + tabs.length) % tabs.length];
        setTab(next);
      } else if (e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        const next = tabs[(tabs.indexOf(currentTab) + 1) % tabs.length];
        setTab(next);
      } else if (e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        setFocusedShopIdx((i) => Math.max(0, i - 1));
        gameAudio?.playHoverMicroTone?.();
      } else if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        const maxLen = tabLengths[currentTab] || 2;
        setFocusedShopIdx((i) => Math.min(maxLen - 1, i + 1));
        gameAudio?.playHoverMicroTone?.();
      } else if (e.key === 'Enter' || e.key === ' ' || e.key === 'e' || e.key === 'E') {
        e.preventDefault();
        if (currentTab === 'maps') {
          if (focusedShopIdx === 0) onBuyExpeditionMap('has_map_highlands', 250, 'Misty Highlands');
          else if (focusedShopIdx === 1) onBuyExpeditionMap('has_map_overgrowth', 800, 'Ancient Overgrowth');
        } else if (currentTab === 'expansions') {
          const exp = SANCTUARY_EXPANSIONS[focusedShopIdx];
          if (exp) onBuySanctuaryExpansion(exp.tier, exp.cost, exp.name);
        } else if (currentTab === 'decorations') {
          const decorList = [
            { type: 'bamboo_fence' as const, cost: 3, name: 'Bamboo Fence (Takegaki)' },
            { type: 'decor_pebble_path' as const, cost: 5, name: 'Zen Pebble Stepping Path' },
            { type: 'growing_bamboo_formation' as const, cost: 10, name: 'Growing Bamboo Formation' },
            { type: 'asparagus_fern_ball' as const, cost: 15, name: 'Asparagus Fern Ball' },
            { type: 'zen_rock_formation' as const, cost: 20, name: 'Zen Rock Formation' },
            { type: 'water_feature' as const, cost: 30, name: 'Water Feature (Shishi-Odoshi)' },
            { type: 'empty_crystal_pedestal' as const, cost: 50, name: 'Empty Pedestal' },
            { type: 'seven_lucky_gods' as const, cost: 75, name: 'Seven Lucky Gods (Shichifukujin)' },
            { type: 'stone_lantern' as const, cost: 125, name: 'Stone Lantern (Tōrō)' },
            { type: 'torii_gate' as const, cost: 250, name: 'Torii Gate (3x1)' },
          ];
          const it = decorList[focusedShopIdx];
          if (it) onBuyDecoration(it.type, it.cost, it.name);
        } else if (currentTab === 'equipment') {
          if (focusedShopIdx === 0) onBuyEngineeringLicense(1, 25);
          else if (focusedShopIdx === 1) onBuyEngineeringLicense(2, 75);
          else if (focusedShopIdx === 2) onBuyEngineeringLicense(3, 200);
          else if (focusedShopIdx === 3) onBuyTool('tool_compost_heap', 20, 'Compost Heap');
          else if (focusedShopIdx === 4) onBuyTool('fertilizer_station', 50, 'Chemical Station');
          else if (focusedShopIdx === 5) onBuyBiochemicals(5);
          else if (focusedShopIdx === 6) onBuyManualIrrigation('irrigation_t1', 10, 'T1 Manual Irrigation System');
          else if (focusedShopIdx === 7) onBuyManualIrrigation('irrigation_t2', 25, 'T2 Manual Irrigation System');
          else if (focusedShopIdx === 8) onBuyManualIrrigation('irrigation_t3', 75, 'T3 Manual Irrigation System');
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentTab, focusedShopIdx, onClose]);

  if (!isOpen) return null;

  const inv = inventory;
  const hasToriiGate =
    (inv.torii_gate_inv ?? 0) > 0 ||
    (inv.decorations?.toriiGate ?? 0) > 0 ||
    (inv.decorations?.['torii_gate'] ?? 0) > 0 ||
    deployedStructures.some((s) => s.type === 'torii_gate');

  return (
    <div className="fixed top-12 left-0 right-0 bottom-0 z-40 bg-slate-950/95 backdrop-blur-md p-3 sm:p-5 flex flex-col overflow-hidden border-t border-slate-800 text-left">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-3 shrink-0">
        <div className="flex items-center gap-2">
          <Store className="w-5 h-5 text-emerald-400" />
          <h3 className="text-lg font-bold text-emerald-300">🏪 Botanical Merchant Market</h3>
        </div>
        <div className="flex items-center gap-3">
          {discountRate > 0 && (
            <div className="bg-amber-950/80 border border-amber-500/60 px-2.5 py-1 rounded-xl text-xs font-bold text-amber-300 flex items-center gap-1.5 shadow hidden sm:flex">
              <span>🏷️</span>
              <span>Discount: -{Math.round(discountRate * 100)}%</span>
            </div>
          )}
          <div className="bg-emerald-950/85 border border-emerald-500/80 px-3 py-1 rounded-xl text-xs font-black text-emerald-300 flex items-center gap-1.5 shadow">
            <VerdureIcon className="w-4 h-4" />
            <span>{verdureBalance.toFixed(2)} Verdure</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Shop Navigation Tabs (4 Harmonized Tabs without Blueprints, which are now in Zen Library) */}
      <div className="grid grid-cols-4 gap-1.5 mb-3 shrink-0">
        <button
          onClick={() => setTab('maps')}
          className={`py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
            currentTab === 'maps'
              ? 'bg-sky-600 text-white shadow-md ring-2 ring-sky-400/40'
              : 'bg-slate-800 text-slate-400 hover:bg-slate-750'
          }`}>
          <MapIcon className="w-3.5 h-3.5" />
          <span>🗺️ Maps</span>
        </button>
        <button
          onClick={() => setTab('expansions')}
          className={`py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
            currentTab === 'expansions'
              ? 'bg-emerald-600 text-white shadow-md ring-2 ring-emerald-400/40'
              : 'bg-slate-800 text-slate-400 hover:bg-slate-750'
          }`}>
          <Maximize2 className="w-3.5 h-3.5" />
          <span>🏡 Plots</span>
        </button>
        <button
          onClick={() => setTab('decorations')}
          className={`py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
            currentTab === 'decorations'
              ? 'bg-teal-600 text-white shadow-md ring-2 ring-teal-400/40'
              : 'bg-slate-800 text-slate-400 hover:bg-slate-750'
          }`}>
          <span>🎋 Decorations</span>
        </button>
        <button
          onClick={() => setTab('equipment')}
          className={`py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
            currentTab === 'equipment'
              ? 'bg-amber-600 text-white shadow-md ring-2 ring-amber-400/40'
              : 'bg-slate-800 text-slate-400 hover:bg-slate-750'
          }`}>
          <Wrench className="w-3.5 h-3.5" />
          <span>⚡ Equipment</span>
        </button>
      </div>

      {/* TAB 1: CARTOGRAPHY & MAPS */}
      {currentTab === 'maps' && (
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
                disabled={inv.has_map_highlands || verdureBalance < getPrice(250)}
                onClick={() => onBuyExpeditionMap('has_map_highlands', 250, 'Misty Highlands')}
                className={`px-4 py-2 rounded-xl font-bold text-xs transition-all shadow flex items-center gap-1 cursor-pointer ${
                  inv.has_map_highlands
                    ? 'bg-slate-800 text-emerald-400 cursor-default border border-emerald-500/30'
                    : verdureBalance >= getPrice(250)
                    ? 'bg-sky-600 hover:bg-sky-500 text-white active:scale-95'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}>
                {!inv.has_map_highlands && <VerdureIcon className="w-3.5 h-3.5" />}
                <span>
                  {inv.has_map_highlands
                    ? 'Discovered'
                    : `Purchase (${getPrice(250)} Verdure)${discountRate > 0 ? ` [${Math.round(discountRate * 100)}% off]` : ''}`}
                </span>
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
                disabled={inv.has_map_overgrowth || verdureBalance < getPrice(800)}
                onClick={() => onBuyExpeditionMap('has_map_overgrowth', 800, 'Ancient Overgrowth')}
                className={`px-4 py-2 rounded-xl font-bold text-xs transition-all shadow flex items-center gap-1 cursor-pointer ${
                  inv.has_map_overgrowth
                    ? 'bg-slate-800 text-emerald-400 cursor-default border border-emerald-500/30'
                    : verdureBalance >= getPrice(800)
                    ? 'bg-purple-600 hover:bg-purple-500 text-white active:scale-95'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}>
                {!inv.has_map_overgrowth && <VerdureIcon className="w-3.5 h-3.5" />}
                <span>
                  {inv.has_map_overgrowth
                    ? 'Discovered'
                    : `Purchase (${getPrice(800)} Verdure)${discountRate > 0 ? ` [${Math.round(discountRate * 100)}% off]` : ''}`}
                </span>
              </button>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              An ancient runic map leading into primeval forests. High density Electronic Chips, Circuit Boards, and the legendary <strong>Mythic Golden Ginkgo</strong>.
            </p>
          </div>
        </div>
      )}

      {/* TAB 2: SANCTUARY GREENHOUSE EXPANSIONS */}
      {currentTab === 'expansions' && (
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
            const discountedExpCost = getPrice(exp.cost);
            const canAfford = verdureBalance >= discountedExpCost;
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
                    onClick={() => onBuySanctuaryExpansion(exp.tier, exp.cost, exp.name)}
                    className={`px-4 py-2 rounded-xl font-bold text-xs transition-all shadow flex items-center gap-1 cursor-pointer ${
                      isOwned
                        ? 'bg-slate-800 text-emerald-400 cursor-default border border-emerald-500/30'
                        : isPrevOwned && canAfford
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white active:scale-95'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}>
                    {!isOwned && isPrevOwned && <VerdureIcon className="w-3.5 h-3.5" />}
                    <span>
                      {isOwned
                        ? 'Active'
                        : !isPrevOwned
                        ? 'Requires Prev Tier'
                        : `Unlock (${discountedExpCost} Verdure)${discountRate > 0 ? ` [${Math.round(discountRate * 100)}% off]` : ''}`}
                    </span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 3: GARDEN DECORATIONS */}
      {currentTab === 'decorations' && (
        <div className="flex-1 space-y-2.5 mb-3 overflow-y-auto pr-1">
          <div className="text-xs text-slate-400 bg-slate-900/60 p-2.5 rounded-2xl border border-slate-800 flex items-center gap-2">
            <span className="text-base">🎋</span>
            <span>
              Decorative fixtures and sacred garden architecture. Sorted by price from lowest to highest. Placeable on open plots via [P] or [E]!
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* 1. Bamboo Fence (3 Verdure) */}
            <div className={`border p-3.5 rounded-2xl flex flex-col justify-between gap-2 shadow transition-all ${
              focusedShopIdx === 0
                ? 'bg-slate-850 ring-4 ring-emerald-400 border-emerald-300 scale-[1.01] shadow-[0_0_20px_rgba(16,185,129,0.5)]'
                : 'bg-slate-900/80 border-emerald-600/40'
            }`}>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2.5">
                    <ItemVectorPreview itemKey="bamboo_fence" width={44} height={44} />
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-slate-100 flex items-center gap-1.5">
                        {focusedShopIdx === 0 && <span className="text-emerald-400 text-xs">► [E/A]</span>}
                        <span>Bamboo Fence (Takegaki)</span>
                      </h4>
                      <span className="text-[10px] text-emerald-400 font-bold">Boundary Edge Barrier • Blocks Halos</span>
                    </div>
                  </div>
                  <span className="text-xs bg-slate-950 text-emerald-300 border border-emerald-600/40 px-2 py-0.5 rounded-lg font-mono font-bold">
                    Owned: {inv.bamboo_fence_inv || 0}
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Slender bamboo stalks lashed with hemp cords. Placed on plot borders (Top, Right, Bottom, Left). Physically cuts off and isolates halos between separated plots!
                </p>
              </div>

              <button
                disabled={verdureBalance < getPrice(3)}
                onClick={() => onBuyDecoration('bamboo_fence', 3, 'Bamboo Fence (Takegaki)')}
                className={`w-full py-2 rounded-xl font-bold text-xs transition-all shadow flex items-center justify-center gap-1.5 cursor-pointer ${
                  verdureBalance >= getPrice(3)
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white active:scale-95'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}>
                <VerdureIcon className="w-3.5 h-3.5" />
                <span>Purchase ({getPrice(3)} Verdure){discountRate > 0 ? ` [${Math.round(discountRate * 100)}% off]` : ''}</span>
              </button>
            </div>

            {/* 2. Zen Pebble Path (5 Verdure) */}
            <div className={`border p-3.5 rounded-2xl flex flex-col justify-between gap-2 shadow transition-all ${
              focusedShopIdx === 1
                ? 'bg-slate-850 ring-4 ring-emerald-400 border-emerald-300 scale-[1.01] shadow-[0_0_20px_rgba(16,185,129,0.5)]'
                : 'bg-slate-900/80 border-slate-700'
            }`}>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2.5">
                    <ItemVectorPreview itemKey="decor_pebble_path" width={44} height={44} />
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-slate-100 flex items-center gap-1.5">
                        {focusedShopIdx === 1 && <span className="text-emerald-400 text-xs">► [E/A]</span>}
                        <span>Zen Pebble Stepping Path</span>
                      </h4>
                      <span className="text-[10px] text-emerald-400 font-bold">+35% Movement Speed • 5 Variations</span>
                    </div>
                  </div>
                  <span className="text-xs bg-slate-950 text-emerald-300 border border-slate-700 px-2 py-0.5 rounded-lg font-mono font-bold">
                    Owned: {inv.decor_pebble_path_inv || 0}
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Smooth river stones and moss cushions. Grants +35% movement speed when walked on. Pure pathway tile (does not stall).
                </p>
              </div>

              <button
                disabled={verdureBalance < getPrice(5)}
                onClick={() => onBuyDecoration('decor_pebble_path', 5, 'Zen Pebble Stepping Path')}
                className={`w-full py-2 rounded-xl font-bold text-xs transition-all shadow flex items-center justify-center gap-1.5 cursor-pointer ${
                  verdureBalance >= getPrice(5)
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white active:scale-95'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}>
                <VerdureIcon className="w-3.5 h-3.5" />
                <span>Purchase ({getPrice(5)} Verdure){discountRate > 0 ? ` [${Math.round(discountRate * 100)}% off]` : ''}</span>
              </button>
            </div>

            {/* 3. Growing Bamboo Formation (10 Verdure) */}
            <div className={`border p-3.5 rounded-2xl flex flex-col justify-between gap-2 shadow transition-all ${
              focusedShopIdx === 2
                ? 'bg-slate-850 ring-4 ring-emerald-400 border-emerald-300 scale-[1.01] shadow-[0_0_20px_rgba(16,185,129,0.5)]'
                : 'bg-slate-900/80 border-emerald-500/30'
            }`}>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2.5">
                    <ItemVectorPreview itemKey="growing_bamboo_formation" width={44} height={44} />
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-slate-100 flex items-center gap-1.5">
                        {focusedShopIdx === 2 && <span className="text-emerald-400 text-xs">► [E/A]</span>}
                        <span>Growing Bamboo Formation</span>
                      </h4>
                      <span className="text-[10px] text-emerald-300 font-bold">+0.25s Pruning Effect (Quick Prune)</span>
                    </div>
                  </div>
                  <span className="text-xs bg-slate-950 text-emerald-300 border border-emerald-600/40 px-2 py-0.5 rounded-lg font-mono font-bold">
                    Owned: {getStructureInventoryCount(inv, 'growing_bamboo_formation')}
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  A cluster of growing bamboo shoots and culms sprouting with joint rings and feathered leaves. Halo Effect: Grants +0.25s Pruning Effect to adjacent trees.
                </p>
              </div>

              <button
                disabled={verdureBalance < getPrice(10)}
                onClick={() => onBuyDecoration('growing_bamboo_formation', 10, 'Growing Bamboo Formation')}
                className={`w-full py-2 rounded-xl font-bold text-xs transition-all shadow flex items-center justify-center gap-1.5 cursor-pointer ${
                  verdureBalance >= getPrice(10)
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white active:scale-95'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}>
                <VerdureIcon className="w-3.5 h-3.5" />
                <span>Purchase ({getPrice(10)} Verdure){discountRate > 0 ? ` [${Math.round(discountRate * 100)}% off]` : ''}</span>
              </button>
            </div>

            {/* 4. Asparagus Fern Ball (15 Verdure) */}
            <div className={`border p-3.5 rounded-2xl flex flex-col justify-between gap-2 shadow transition-all ${
              focusedShopIdx === 3
                ? 'bg-slate-850 ring-4 ring-lime-400 border-lime-300 scale-[1.01] shadow-[0_0_20px_rgba(163,230,53,0.5)]'
                : 'bg-slate-900/80 border-lime-500/30'
            }`}>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2.5">
                    <ItemVectorPreview itemKey="asparagus_fern_ball" width={44} height={44} />
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-slate-100 flex items-center gap-1.5">
                        {focusedShopIdx === 3 && <span className="text-lime-400 text-xs">► [E/A]</span>}
                        <span>Asparagus Fern Ball</span>
                      </h4>
                      <span className="text-[10px] text-lime-300 font-bold">+15% Extra Waste Chance (Efficient Pruning)</span>
                    </div>
                  </div>
                  <span className="text-xs bg-slate-950 text-lime-300 border border-lime-600/40 px-2 py-0.5 rounded-lg font-mono font-bold">
                    Owned: {getStructureInventoryCount(inv, 'asparagus_fern_ball')}
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  An authentic Kokedama moss ball pot on a dark coaster dish with feathery Asparagus Fern fronds. Halo Effect: Grants +15% chance to drop extra Organic Waste on level up.
                </p>
              </div>

              <button
                disabled={verdureBalance < getPrice(15)}
                onClick={() => onBuyDecoration('asparagus_fern_ball', 15, 'Asparagus Fern Ball')}
                className={`w-full py-2 rounded-xl font-bold text-xs transition-all shadow flex items-center justify-center gap-1.5 cursor-pointer ${
                  verdureBalance >= getPrice(15)
                    ? 'bg-lime-600 hover:bg-lime-500 text-white active:scale-95'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}>
                <VerdureIcon className="w-3.5 h-3.5" />
                <span>Purchase ({getPrice(15)} Verdure){discountRate > 0 ? ` [${Math.round(discountRate * 100)}% off]` : ''}</span>
              </button>
            </div>

            {/* 5. Zen Rock Formation (20 Verdure) */}
            <div className={`border p-3.5 rounded-2xl flex flex-col justify-between gap-2 shadow transition-all ${
              focusedShopIdx === 4
                ? 'bg-slate-850 ring-4 ring-amber-400 border-amber-300 scale-[1.01] shadow-[0_0_20px_rgba(245,158,11,0.5)]'
                : 'bg-slate-900/80 border-amber-500/30'
            }`}>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2.5">
                    <ItemVectorPreview itemKey="zen_rock_formation" width={44} height={44} />
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-slate-100 flex items-center gap-1.5">
                        {focusedShopIdx === 4 && <span className="text-amber-400 text-xs">► [E/A]</span>}
                        <span>Zen Rock Formation</span>
                      </h4>
                      <span className="text-[10px] text-amber-300 font-bold">+15% Level Up EXP (XP Boosted)</span>
                    </div>
                  </div>
                  <span className="text-xs bg-slate-950 text-amber-300 border border-amber-600/40 px-2 py-0.5 rounded-lg font-mono font-bold">
                    Owned: {getStructureInventoryCount(inv, 'zen_rock_formation')}
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Raked concentric sand ripples and natural granite boulders with lichen accents. Halo Effect: Grants +15% Level Up Experience (XP Boosted) to adjacent trees.
                </p>
              </div>

              <button
                disabled={verdureBalance < getPrice(20)}
                onClick={() => onBuyDecoration('zen_rock_formation', 20, 'Zen Rock Formation')}
                className={`w-full py-2 rounded-xl font-bold text-xs transition-all shadow flex items-center justify-center gap-1.5 cursor-pointer ${
                  verdureBalance >= getPrice(20)
                    ? 'bg-amber-600 hover:bg-amber-500 text-white active:scale-95'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}>
                <VerdureIcon className="w-3.5 h-3.5" />
                <span>Purchase ({getPrice(20)} Verdure){discountRate > 0 ? ` [${Math.round(discountRate * 100)}% off]` : ''}</span>
              </button>
            </div>

            {/* 6. Water Feature (30 Verdure) */}
            <div className={`border p-3.5 rounded-2xl flex flex-col justify-between gap-2 shadow transition-all ${
              focusedShopIdx === 5
                ? 'bg-slate-850 ring-4 ring-cyan-400 border-cyan-300 scale-[1.01] shadow-[0_0_20px_rgba(6,182,212,0.5)]'
                : 'bg-slate-900/80 border-cyan-500/30'
            }`}>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2.5">
                    <ItemVectorPreview itemKey="water_feature" width={44} height={44} />
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-cyan-200 flex items-center gap-1.5">
                        {focusedShopIdx === 5 && <span className="text-cyan-400 text-xs">► [E/A]</span>}
                        <span>Water Feature (Shishi-Odoshi)</span>
                      </h4>
                      <span className="text-[10px] text-cyan-300 font-bold">+10% Growth Speed (Gentle Waters)</span>
                    </div>
                  </div>
                  <span className="text-xs bg-slate-950 text-cyan-300 border border-cyan-600/40 px-2 py-0.5 rounded-lg font-mono font-bold">
                    Owned: {getStructureInventoryCount(inv, 'water_feature')}
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Authentic Japanese shishi-odoshi bamboo fountain dripping water into a carved tsukubai stone basin. Halo Effect: Grants +10% Hydration Growth Speed to adjacent trees.
                </p>
              </div>

              <button
                disabled={verdureBalance < getPrice(30)}
                onClick={() => onBuyDecoration('water_feature', 30, 'Water Feature (Shishi-Odoshi)')}
                className={`w-full py-2 rounded-xl font-bold text-xs transition-all shadow flex items-center justify-center gap-1.5 cursor-pointer ${
                  verdureBalance >= getPrice(30)
                    ? 'bg-cyan-600 hover:bg-cyan-500 text-white active:scale-95'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}>
                <VerdureIcon className="w-3.5 h-3.5" />
                <span>Purchase ({getPrice(30)} Verdure){discountRate > 0 ? ` [${Math.round(discountRate * 100)}% off]` : ''}</span>
              </button>
            </div>

            {/* 7. Empty Pedestal (50 Verdure) */}
            <div className={`border p-3.5 rounded-2xl flex flex-col justify-between gap-2 shadow transition-all ${
              focusedShopIdx === 6
                ? 'bg-slate-850 ring-4 ring-purple-400 border-purple-300 scale-[1.01] shadow-[0_0_20px_rgba(168,85,247,0.5)]'
                : 'bg-slate-900/80 border-purple-500/40'
            }`}>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2.5">
                    <ItemVectorPreview itemKey="empty_crystal_pedestal" width={44} height={44} />
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-slate-100 flex items-center gap-1.5">
                        {focusedShopIdx === 6 && <span className="text-purple-400 text-xs">► [E/A]</span>}
                        <span>Empty Pedestal</span>
                      </h4>
                      <span className="text-[10px] text-purple-300 font-semibold">Can Host Crystal Artifacts</span>
                    </div>
                  </div>
                  <span className="text-xs bg-slate-950 text-purple-300 border border-purple-600/40 px-2 py-0.5 rounded-lg font-mono font-bold">
                    Owned: {getStructureInventoryCount(inv, 'empty_crystal_pedestal')}
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Can Host Crystal Artifacts. Deploy onto any open nursery plot, then interact to socket an elemental crystal artifact from your bag.
                </p>
              </div>

              <button
                disabled={verdureBalance < getPrice(50)}
                onClick={() => onBuyDecoration('empty_crystal_pedestal', 50, 'Empty Pedestal')}
                className={`w-full py-2 rounded-xl font-bold text-xs transition-all shadow flex items-center justify-center gap-1.5 cursor-pointer ${
                  verdureBalance >= getPrice(50)
                    ? 'bg-purple-600 hover:bg-purple-500 text-white active:scale-95'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}>
                <VerdureIcon className="w-3.5 h-3.5" />
                <span>Purchase ({getPrice(50)} Verdure){discountRate > 0 ? ` [${Math.round(discountRate * 100)}% off]` : ''}</span>
              </button>
            </div>

            {/* 8. Seven Lucky Gods (75 Verdure) */}
            <div className={`border p-3.5 rounded-2xl flex flex-col justify-between gap-2 shadow transition-all ${
              focusedShopIdx === 7
                ? 'bg-slate-850 ring-4 ring-amber-400 border-amber-300 scale-[1.01] shadow-[0_0_20px_rgba(251,191,36,0.5)]'
                : 'bg-slate-900/80 border-amber-500/40'
            }`}>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2.5">
                    <ItemVectorPreview itemKey="seven_lucky_gods" width={44} height={44} />
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-amber-200 flex items-center gap-1.5">
                        {focusedShopIdx === 7 && <span className="text-amber-400 text-xs">► [E/A]</span>}
                        <span>Seven Lucky Gods (Shichifukujin)</span>
                      </h4>
                      <span className="text-[10px] text-amber-300 font-bold">+0.01 Baseprice/lvl (Fortunate Blessings)</span>
                    </div>
                  </div>
                  <span className="text-xs bg-slate-950 text-amber-300 border border-amber-600/40 px-2 py-0.5 rounded-lg font-mono font-bold">
                    Owned: {getStructureInventoryCount(inv, 'seven_lucky_gods')}
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  7 revered deities of fortune and wealth (Ebisu, Daikokuten, Bishamonten, Benzaiten, Fukurokuju, Jurojin, Hotei). Halo Effect: When an adjacent bonsai levels up, increment its persistent baseprice bonus by +0.01!
                </p>
              </div>

              <button
                disabled={verdureBalance < getPrice(75)}
                onClick={() => onBuyDecoration('seven_lucky_gods', 75, 'Seven Lucky Gods (Shichifukujin)')}
                className={`w-full py-2 rounded-xl font-bold text-xs transition-all shadow flex items-center justify-center gap-1.5 cursor-pointer ${
                  verdureBalance >= getPrice(75)
                    ? 'bg-amber-600 hover:bg-amber-500 text-white active:scale-95'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}>
                <VerdureIcon className="w-3.5 h-3.5" />
                <span>Purchase ({getPrice(75)} Verdure){discountRate > 0 ? ` [${Math.round(discountRate * 100)}% off]` : ''}</span>
              </button>
            </div>

            {/* 9. Stone Lantern (125 Verdure) */}
            <div className={`border p-3.5 rounded-2xl flex flex-col justify-between gap-2 shadow transition-all ${
              focusedShopIdx === 8
                ? 'bg-slate-850 ring-4 ring-cyan-400 border-cyan-300 scale-[1.01] shadow-[0_0_20px_rgba(56,189,248,0.5)]'
                : 'bg-slate-900/80 border-cyan-500/40'
            }`}>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2.5">
                    <ItemVectorPreview itemKey="stone_lantern" width={44} height={44} />
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-cyan-200 flex items-center gap-1.5">
                        {focusedShopIdx === 8 && <span className="text-cyan-400 text-xs">► [E/A]</span>}
                        <span>Stone Lantern (Tōrō / Kasuga-dōrō)</span>
                      </h4>
                      <span className="text-[10px] text-cyan-300 font-bold">+0.5% Zen Point Chance/lvl (Skilled Knowledge)</span>
                    </div>
                  </div>
                  <span className="text-xs bg-slate-950 text-cyan-300 border border-cyan-600/40 px-2 py-0.5 rounded-lg font-mono font-bold">
                    Owned: {getStructureInventoryCount(inv, 'stone_lantern')}
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Classical Kasuga-dōrō stone lantern with tiered base, fluted column, lotus platform, and firebox glowing with warm candlelight. Halo Effect: Roll 0.5% chance per lantern on level up to award +1 Zen Point!
                </p>
              </div>

              <button
                disabled={verdureBalance < getPrice(125)}
                onClick={() => onBuyDecoration('stone_lantern', 125, 'Stone Lantern (Tōrō)')}
                className={`w-full py-2 rounded-xl font-bold text-xs transition-all shadow flex items-center justify-center gap-1.5 cursor-pointer ${
                  verdureBalance >= getPrice(125)
                    ? 'bg-cyan-600 hover:bg-cyan-500 text-white active:scale-95'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}>
                <VerdureIcon className="w-3.5 h-3.5" />
                <span>Purchase ({getPrice(125)} Verdure){discountRate > 0 ? ` [${Math.round(discountRate * 100)}% off]` : ''}</span>
              </button>
            </div>

            {/* 10. Torii Gate (250 Verdure, Limit 1) */}
            <div className={`border p-3.5 rounded-2xl flex flex-col justify-between gap-2 shadow transition-all ${
              focusedShopIdx === 9
                ? 'bg-slate-850 ring-4 ring-red-400 border-red-300 scale-[1.01] shadow-[0_0_20px_rgba(239,68,68,0.5)]'
                : 'bg-slate-900/80 border-red-500/40'
            }`}>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2.5">
                    <ItemVectorPreview itemKey="torii_gate" width={44} height={44} />
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-red-200 flex items-center gap-1.5">
                        {focusedShopIdx === 9 && <span className="text-red-400 text-xs">► [E/A]</span>}
                        <span>Torii Gate (3x1 / 1x3)</span>
                      </h4>
                      <span className="text-[10px] text-amber-400 font-bold">2x All Halo Effects (Doubling Down) • Limit 1</span>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-lg font-mono font-bold border ${
                    hasToriiGate
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-500/50'
                      : 'bg-slate-950 text-red-300 border-red-600/40'
                  }`}>
                    {hasToriiGate ? 'Owned (Limit 1)' : 'Stock: 1'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Doubles other Halo Effects applied to Bonsai (Doubling Down)! Multi-plot rotatable archway with open walkable center.
                </p>
              </div>

              {hasToriiGate ? (
                <button
                  disabled
                  className="w-full py-2 rounded-xl font-bold text-xs bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700 flex items-center justify-center gap-1.5">
                  <span>Owned (Limit 1)</span>
                </button>
              ) : (
                <button
                  disabled={verdureBalance < getPrice(250)}
                  onClick={() => onBuyDecoration('torii_gate', 250, 'Torii Gate (3x1)')}
                  className={`w-full py-2 rounded-xl font-bold text-xs transition-all shadow flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 ${
                    verdureBalance >= getPrice(250)
                      ? 'bg-red-600 hover:bg-red-500 text-white ring-1 ring-red-400/50'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}>
                  <VerdureIcon className="w-3.5 h-3.5" />
                  <span>Purchase ({getPrice(250)} Verdure){discountRate > 0 ? ` [${Math.round(discountRate * 100)}% off]` : ''}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: EQUIPMENT & NURSERY TOOLS */}
      {currentTab === 'equipment' && (
        <div className="flex-1 space-y-2.5 mb-3 overflow-y-auto pr-1">
          <div className="text-xs text-slate-400 bg-slate-900/60 p-2.5 rounded-2xl border border-slate-800 flex items-center gap-2">
            <Wrench className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              Acquire engineering licenses, deployable nursery tools, chemical stations &amp; manual irrigation systems!
            </span>
          </div>

          {/* Engineering Licenses Section */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span>📜</span>
                <span>Engineering Licenses (Required for Advanced Crafting)</span>
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                T1: {inv.license_t1 || inv.licenseT1 || 0} • T2: {inv.license_t2 || inv.licenseT2 || 0} • T3: {inv.license_t3 || inv.licenseT3 || 0}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* T1 License */}
              <div className="bg-slate-900/90 border border-amber-500/40 p-3.5 rounded-2xl flex flex-col justify-between gap-2 shadow">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-xl bg-amber-950/80 border border-amber-500/50 flex items-center justify-center text-lg shrink-0">
                        📜
                      </div>
                      <div>
                        <h4 className="font-bold text-xs sm:text-sm text-slate-100">T1 License</h4>
                        <span className="text-[10px] text-amber-300 font-semibold">Tier 1 Engineering</span>
                      </div>
                    </div>
                    <span className="text-xs bg-slate-950 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-lg font-mono font-bold">
                      Owned: {inv.license_t1 || inv.licenseT1 || 0}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Official certification required for crafting T1 Sprinklers, T1 Modules, and T1 equipment.
                  </p>
                </div>

                <button
                  disabled={verdureBalance < getPrice(25)}
                  onClick={() => onBuyEngineeringLicense(1, 25)}
                  className={`w-full py-2 rounded-xl font-bold text-xs transition-all shadow flex items-center justify-center gap-1.5 cursor-pointer ${
                    verdureBalance >= getPrice(25)
                      ? 'bg-amber-600 hover:bg-amber-500 text-white active:scale-95'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}>
                  <VerdureIcon className="w-3.5 h-3.5" />
                  <span>Purchase ({getPrice(25)} Verdure){discountRate > 0 ? ` [${Math.round(discountRate * 100)}% off]` : ''}</span>
                </button>
              </div>

              {/* T2 License */}
              <div className="bg-slate-900/90 border border-sky-500/40 p-3.5 rounded-2xl flex flex-col justify-between gap-2 shadow">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-xl bg-sky-950/80 border border-sky-500/50 flex items-center justify-center text-lg shrink-0">
                        📜
                      </div>
                      <div>
                        <h4 className="font-bold text-xs sm:text-sm text-slate-100">T2 License</h4>
                        <span className="text-[10px] text-sky-300 font-semibold">Tier 2 Engineering</span>
                      </div>
                    </div>
                    <span className="text-xs bg-slate-950 text-sky-300 border border-sky-500/40 px-2 py-0.5 rounded-lg font-mono font-bold">
                      Owned: {inv.license_t2 || inv.licenseT2 || 0}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Advanced certification required for crafting T2 Sprinklers, T2 Workbench Upgrade, T2 Modules, and T2 Chassis.
                  </p>
                </div>

                <button
                  disabled={verdureBalance < getPrice(75)}
                  onClick={() => onBuyEngineeringLicense(2, 75)}
                  className={`w-full py-2 rounded-xl font-bold text-xs transition-all shadow flex items-center justify-center gap-1.5 cursor-pointer ${
                    verdureBalance >= getPrice(75)
                      ? 'bg-sky-600 hover:bg-sky-500 text-white active:scale-95'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}>
                  <VerdureIcon className="w-3.5 h-3.5" />
                  <span>Purchase ({getPrice(75)} Verdure){discountRate > 0 ? ` [${Math.round(discountRate * 100)}% off]` : ''}</span>
                </button>
              </div>

              {/* T3 License */}
              <div className="bg-slate-900/90 border border-purple-500/40 p-3.5 rounded-2xl flex flex-col justify-between gap-2 shadow">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-xl bg-purple-950/80 border border-purple-500/50 flex items-center justify-center text-lg shrink-0">
                        📜
                      </div>
                      <div>
                        <h4 className="font-bold text-xs sm:text-sm text-slate-100">T3 License</h4>
                        <span className="text-[10px] text-purple-300 font-semibold">Tier 3 Master Engineering</span>
                      </div>
                    </div>
                    <span className="text-xs bg-slate-950 text-purple-300 border border-purple-500/40 px-2 py-0.5 rounded-lg font-mono font-bold">
                      Owned: {inv.license_t3 || inv.licenseT3 || 0}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Master certification required for crafting T3 Sprinklers, T3 Master Foundry Upgrade, T3 Modules, and T3 Vanguard Chassis.
                  </p>
                </div>

                <button
                  disabled={verdureBalance < getPrice(200)}
                  onClick={() => onBuyEngineeringLicense(3, 200)}
                  className={`w-full py-2 rounded-xl font-bold text-xs transition-all shadow flex items-center justify-center gap-1.5 cursor-pointer ${
                    verdureBalance >= getPrice(200)
                      ? 'bg-purple-600 hover:bg-purple-500 text-white active:scale-95'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}>
                  <VerdureIcon className="w-3.5 h-3.5" />
                  <span>Purchase ({getPrice(200)} Verdure){discountRate > 0 ? ` [${Math.round(discountRate * 100)}% off]` : ''}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Nursery Equipment Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800">
            {/* 1. Compost Heap (20 Verdure) */}
            <div className={`border p-4 rounded-2xl flex flex-col justify-between gap-3 shadow transition-all ${
              focusedShopIdx === 3
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
                        {focusedShopIdx === 3 && <span className="text-lime-400 text-xs">► [E/A]</span>}
                        <span>Compost Heap</span>
                      </h4>
                      <span className="text-xs text-lime-400 font-bold">20 Waste Capacity • Passive Compost</span>
                    </div>
                  </div>
                  <span className="text-xs bg-slate-950 text-lime-300 border border-lime-600/40 px-2 py-0.5 rounded-lg font-mono font-bold">
                    Stock: {getStructureInventoryCount(inv, 'tool_compost_heap')}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  Rustic slatted cedar timber compost bin box. Deposit up to 20 Organic Waste to passively decompose into usable Enriched Organic Compost (~10s per batch).
                </p>
              </div>

              <button
                disabled={verdureBalance < getPrice(20)}
                onClick={() => onBuyTool('tool_compost_heap', 20, 'Compost Heap')}
                className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all shadow flex items-center justify-center gap-1.5 cursor-pointer ${
                  verdureBalance >= getPrice(20)
                    ? 'bg-lime-600 hover:bg-lime-500 text-white active:scale-95'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}>
                <VerdureIcon className="w-3.5 h-3.5" />
                <span>Purchase Compost Heap ({getPrice(20)} Verdure){discountRate > 0 ? ` [${Math.round(discountRate * 100)}% off]` : ''}</span>
              </button>
            </div>

            {/* 2. Chemical Station (50 Verdure) */}
            <div className={`border p-4 rounded-2xl flex flex-col justify-between gap-3 shadow transition-all ${
              focusedShopIdx === 4
                ? 'bg-slate-850 ring-4 ring-emerald-400 border-emerald-300 scale-[1.01] shadow-[0_0_20px_rgba(52,211,153,0.5)]'
                : 'bg-slate-900/80 border-emerald-500/40'
            }`}>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 flex items-center justify-center overflow-hidden shrink-0">
                      <span className="text-2xl">🧪</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-sm sm:text-base text-slate-100 flex items-center gap-1.5">
                        {focusedShopIdx === 4 && <span className="text-emerald-400 text-xs">► [E/A]</span>}
                        <span>Chemical Station</span>
                      </h4>
                      <span className="text-xs text-emerald-400 font-bold">2x2 Industrial Apparatus • 60s Cycle</span>
                    </div>
                  </div>
                  <span className="text-xs bg-slate-950 text-emerald-300 border border-emerald-600/40 px-2 py-0.5 rounded-lg font-mono font-bold">
                    Stock: {getStructureInventoryCount(inv, 'fertilizer_station')}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  Expanded 2x2 high-tech chemical apparatus. Distills 3 Waste + 1 Biochemical into 1 Fertilizer (60s). Radiates Disrupted Zen 1 plot outwards (4x4 perimeter) unless fenced.
                </p>
              </div>

              <button
                disabled={verdureBalance < getPrice(50)}
                onClick={() => onBuyTool('fertilizer_station', 50, 'Chemical Station')}
                className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all shadow flex items-center justify-center gap-1.5 cursor-pointer ${
                  verdureBalance >= getPrice(50)
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white active:scale-95'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}>
                <VerdureIcon className="w-3.5 h-3.5" />
                <span>Purchase Chemical Station ({getPrice(50)} Verdure){discountRate > 0 ? ` [${Math.round(discountRate * 100)}% off]` : ''}</span>
              </button>
            </div>

            {/* 3. Biochemicals (5 Verdure each) */}
            <div className={`border p-4 rounded-2xl flex flex-col justify-between gap-3 shadow transition-all ${
              focusedShopIdx === 5
                ? 'bg-slate-850 ring-4 ring-cyan-400 border-cyan-300 scale-[1.01] shadow-[0_0_20px_rgba(6,182,212,0.5)]'
                : 'bg-slate-900/80 border-cyan-500/40'
            }`}>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-cyan-950/80 border border-cyan-500/50 flex items-center justify-center overflow-hidden shrink-0">
                      <span className="text-2xl">🧪</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-sm sm:text-base text-slate-100 flex items-center gap-1.5">
                        {focusedShopIdx === 5 && <span className="text-cyan-400 text-xs">► [E/A]</span>}
                        <span>Biochemicals</span>
                      </h4>
                      <span className="text-xs text-cyan-300 font-bold">Eco-Chemical Reagent</span>
                    </div>
                  </div>
                  <span className="text-xs bg-slate-950 text-cyan-300 border border-cyan-600/40 px-2 py-0.5 rounded-lg font-mono font-bold">
                    Stock: {inv.biochemicals ?? inv.resources?.biochemicals ?? 0}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  Essential chemical catalyst reagent. Synthesizes Fertilizer at the Fertilizer Station when combined with Organic Waste (3 Waste + 1 Biochemical &rarr; 1 Fertilizer).
                </p>
              </div>

              <button
                disabled={verdureBalance < getPrice(5)}
                onClick={() => onBuyBiochemicals(5)}
                className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all shadow flex items-center justify-center gap-1.5 cursor-pointer ${
                  verdureBalance >= getPrice(5)
                    ? 'bg-cyan-600 hover:bg-cyan-500 text-white active:scale-95'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}>
                <VerdureIcon className="w-3.5 h-3.5" />
                <span>Purchase Biochemical ({getPrice(5)} Verdure){discountRate > 0 ? ` [${Math.round(discountRate * 100)}% off]` : ''}</span>
              </button>
            </div>

            {/* 4. T1 Manual Irrigation System (10 Verdure) */}
            <div className={`border p-4 rounded-2xl flex flex-col justify-between gap-3 shadow transition-all ${
              focusedShopIdx === 6
                ? 'bg-slate-850 ring-4 ring-sky-400 border-sky-300 scale-[1.01] shadow-[0_0_20px_rgba(56,189,248,0.5)]'
                : 'bg-slate-900/80 border-sky-500/40'
            }`}>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-sky-950/80 border border-sky-500/50 flex items-center justify-center overflow-hidden shrink-0">
                      <span className="text-2xl">💧</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-sm sm:text-base text-slate-100 flex items-center gap-1.5">
                        {focusedShopIdx === 6 && <span className="text-sky-400 text-xs">► [E/A]</span>}
                        <span>T1 Manual Irrigation System</span>
                      </h4>
                      <span className="text-xs text-sky-400 font-bold">Left &amp; Right Plots (2 Total) • 30 Seconds</span>
                    </div>
                  </div>
                  <span className="text-xs bg-slate-950 text-sky-300 border border-sky-600/40 px-2 py-0.5 rounded-lg font-mono font-bold">
                    Stock: {getStructureInventoryCount(inv, 'irrigation_t1')}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  Wooden stool with a water bucket and 2 outlet pipes extending Left and Right. Interacting [E] refills the reservoir for 30s of continuous watering.
                </p>
              </div>

              <button
                disabled={verdureBalance < getPrice(10)}
                onClick={() => onBuyManualIrrigation('irrigation_t1', 10, 'T1 Manual Irrigation System')}
                className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all shadow flex items-center justify-center gap-1.5 cursor-pointer ${
                  verdureBalance >= getPrice(10)
                    ? 'bg-sky-600 hover:bg-sky-500 text-white active:scale-95'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}>
                <VerdureIcon className="w-3.5 h-3.5" />
                <span>Purchase T1 Irrigation ({getPrice(10)} Verdure){discountRate > 0 ? ` [${Math.round(discountRate * 100)}% off]` : ''}</span>
              </button>
            </div>

            {/* 5. T2 Manual Irrigation System (25 Verdure) */}
            <div className={`border p-4 rounded-2xl flex flex-col justify-between gap-3 shadow transition-all ${
              focusedShopIdx === 7
                ? 'bg-slate-850 ring-4 ring-sky-400 border-sky-300 scale-[1.01] shadow-[0_0_20px_rgba(56,189,248,0.5)]'
                : 'bg-slate-900/80 border-sky-500/40'
            }`}>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-sky-950/80 border border-sky-500/50 flex items-center justify-center overflow-hidden shrink-0">
                      <span className="text-2xl">💧</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-sm sm:text-base text-slate-100 flex items-center gap-1.5">
                        {focusedShopIdx === 7 && <span className="text-sky-400 text-xs">► [E/A]</span>}
                        <span>T2 Manual Irrigation System</span>
                      </h4>
                      <span className="text-xs text-sky-400 font-bold">4-Way Cross Plots (4 Total) • 90 Seconds</span>
                    </div>
                  </div>
                  <span className="text-xs bg-slate-950 text-sky-300 border border-sky-600/40 px-2 py-0.5 rounded-lg font-mono font-bold">
                    Stock: {getStructureInventoryCount(inv, 'irrigation_t2')}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  Sturdy timber trestle supporting a wooden water barrel with 4 pipes extending Up, Down, Left, Right. Interacting [E] refills for 90s of continuous watering.
                </p>
              </div>

              <button
                disabled={verdureBalance < getPrice(25)}
                onClick={() => onBuyManualIrrigation('irrigation_t2', 25, 'T2 Manual Irrigation System')}
                className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all shadow flex items-center justify-center gap-1.5 cursor-pointer ${
                  verdureBalance >= getPrice(25)
                    ? 'bg-sky-600 hover:bg-sky-500 text-white active:scale-95'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}>
                <VerdureIcon className="w-3.5 h-3.5" />
                <span>Purchase T2 Irrigation ({getPrice(25)} Verdure){discountRate > 0 ? ` [${Math.round(discountRate * 100)}% off]` : ''}</span>
              </button>
            </div>

            {/* 6. T3 Manual Irrigation System (75 Verdure) */}
            <div className={`border p-4 rounded-2xl flex flex-col justify-between gap-3 shadow transition-all ${
              focusedShopIdx === 8
                ? 'bg-slate-850 ring-4 ring-sky-400 border-sky-300 scale-[1.01] shadow-[0_0_20px_rgba(56,189,248,0.5)]'
                : 'bg-slate-900/80 border-sky-500/40'
            }`}>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-sky-950/80 border border-sky-500/50 flex items-center justify-center overflow-hidden shrink-0">
                      <span className="text-2xl">💧</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-sm sm:text-base text-slate-100 flex items-center gap-1.5">
                        {focusedShopIdx === 8 && <span className="text-sky-400 text-xs">► [E/A]</span>}
                        <span>T3 Manual Irrigation System</span>
                      </h4>
                      <span className="text-xs text-sky-400 font-bold">All 8 Surrounding Plots (3x3 Grid) • 300 Seconds</span>
                    </div>
                  </div>
                  <span className="text-xs bg-slate-950 text-sky-300 border border-sky-600/40 px-2 py-0.5 rounded-lg font-mono font-bold">
                    Stock: {getStructureInventoryCount(inv, 'irrigation_t3')}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  Heavy reinforced iron cistern on stone foundations with 8 branching conduits leading to all 8 surrounding plots (3x3). Interacting [E] refills for 300s (5 min) of watering.
                </p>
              </div>

              <button
                disabled={verdureBalance < getPrice(75)}
                onClick={() => onBuyManualIrrigation('irrigation_t3', 75, 'T3 Manual Irrigation System')}
                className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all shadow flex items-center justify-center gap-1.5 cursor-pointer ${
                  verdureBalance >= getPrice(75)
                    ? 'bg-sky-600 hover:bg-sky-500 text-white active:scale-95'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}>
                <VerdureIcon className="w-3.5 h-3.5" />
                <span>Purchase T3 Irrigation ({getPrice(75)} Verdure){discountRate > 0 ? ` [${Math.round(discountRate * 100)}% off]` : ''}</span>
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
          onClick={onClose}
          className="px-5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold transition-all border border-slate-700 cursor-pointer">
          Close [Esc / B]
        </button>
      </div>
    </div>
  );
}
