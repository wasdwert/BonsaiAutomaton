import React, { useState, useMemo, useEffect } from 'react';
import {
  Check,
  Sparkles,
  Layers,
  Award,
  Lock,
} from 'lucide-react';
import {
  BlueprintDef,
  BlueprintCategory,
  BlueprintUnlockRank,
  BLUEPRINTS_CATALOG,
  getBlueprintRequiredRank,
} from './blueprints';
import { VerdureIcon } from './App';
import { gameAudio } from './utils/helper';

export interface BlueprintsCatalogViewProps {
  unlockedBlueprints: string[];
  verdureBalance: number;
  onPurchaseBlueprint: (blueprint: BlueprintDef) => void;
  maxBranchRank?: number;
  accentTone?: 'amber' | 'emerald' | 'sky';
  discountRate?: number;
}

const CATEGORIES: ('All' | BlueprintCategory)[] = [
  'All',
  'Bonsai Care',
  'Workbench',
  'Rover',
  'Infrastructure',
  'Crafting Recipes',
];

const RANKS: { label: string; value: 'All' | BlueprintUnlockRank }[] = [
  { label: 'All', value: 'All' },
  { label: 'Rank 0', value: 'Unlock Rank 0' },
  { label: 'Rank 1', value: 'Unlock Rank 1' },
  { label: 'Rank 2', value: 'Unlock Rank 2' },
  { label: 'Rank 3', value: 'Unlock Rank 3' },
];

export default function BlueprintsCatalogView({
  unlockedBlueprints,
  verdureBalance,
  onPurchaseBlueprint,
  maxBranchRank = 0,
  accentTone = 'amber',
  discountRate = 0,
}: BlueprintsCatalogViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<'All' | BlueprintCategory>('All');
  const [selectedRank, setSelectedRank] = useState<'All' | BlueprintUnlockRank>('All');
  const [localPurchased, setLocalPurchased] = useState<Set<string>>(new Set());

  const discountMultiplier = Math.max(0.1, 1 - (discountRate || 0));
  const getDiscountedPrice = (price: number) => Math.max(1, Math.round(price * discountMultiplier));

  // Reset selected rank to 'All' when maxBranchRank < 1
  useEffect(() => {
    if (maxBranchRank < 1 && selectedRank !== 'All') {
      setSelectedRank('All');
    }
  }, [maxBranchRank, selectedRank]);

  // Synchronize when unlockedBlueprints prop updates
  useEffect(() => {
    if (unlockedBlueprints && unlockedBlueprints.length > 0) {
      setLocalPurchased((prev) => {
        const next = new Set(prev);
        unlockedBlueprints.forEach((id) => next.add(id));
        return next;
      });
    }
  }, [unlockedBlueprints]);

  const ownedSet = useMemo(() => {
    const set = new Set(unlockedBlueprints || []);
    localPurchased.forEach((id) => set.add(id));
    return set;
  }, [unlockedBlueprints, localPurchased]);

  // Completely hide blueprints whose branch rank prerequisite has not been met yet!
  // Only show blueprints that are unlocked by branch rank (available to purchase or already purchased)
  const filteredBlueprints = useMemo(() => {
    return BLUEPRINTS_CATALOG.filter((bp) => {
      const reqRank = getBlueprintRequiredRank(bp);
      if (reqRank > maxBranchRank) {
        return false;
      }
      if (selectedCategory !== 'All' && bp.category !== selectedCategory) {
        return false;
      }
      if (selectedRank !== 'All' && bp.unlockRank !== selectedRank) {
        return false;
      }
      return true;
    }).sort((a, b) => {
      const aOwned = ownedSet.has(a.id) ? 1 : 0;
      const bOwned = ownedSet.has(b.id) ? 1 : 0;
      return aOwned - bOwned;
    });
  }, [ownedSet, selectedCategory, selectedRank, maxBranchRank]);

  const handleBuy = (bp: BlueprintDef) => {
    const reqRank = getBlueprintRequiredRank(bp);
    if (reqRank > 0 && maxBranchRank < reqRank) {
      gameAudio?.playErrorBuzz?.();
      return;
    }
    // Instantly add to local set so the card disappears on the very same frame
    setLocalPurchased((prev) => new Set(prev).add(bp.id));
    onPurchaseBlueprint(bp);
    gameAudio?.playConfirmSelect?.();
  };

  const getRankBadgeColor = (rank: BlueprintUnlockRank) => {
    switch (rank) {
      case 'Unlock Rank 0':
        return 'bg-slate-800 text-slate-300 border-slate-700';
      case 'Unlock Rank 1':
        return 'bg-emerald-950 text-emerald-300 border-emerald-500/50';
      case 'Unlock Rank 2':
        return 'bg-sky-950 text-sky-300 border-sky-500/50';
      case 'Unlock Rank 3':
        return 'bg-purple-950 text-purple-300 border-purple-500/50';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const getCategoryBadgeColor = (cat: BlueprintCategory) => {
    switch (cat) {
      case 'Bonsai Care':
        return 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40';
      case 'Workbench':
        return 'bg-indigo-950/80 text-indigo-300 border-indigo-500/40';
      case 'Rover':
        return 'bg-sky-950/80 text-sky-300 border-sky-500/40';
      case 'Infrastructure':
        return 'bg-amber-950/80 text-amber-300 border-amber-500/40';
      case 'Crafting Recipes':
        return 'bg-lime-950/80 text-lime-300 border-lime-500/40';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="flex flex-col h-full space-y-2.5">
      {/* Dual Filter Bars (Clean & Compact at top) */}
      <div className="space-y-1.5 shrink-0 pt-0.5">
        {/* Category Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-[10px] font-bold uppercase text-slate-400 shrink-0 mr-1 flex items-center gap-1">
            <Layers className="w-3 h-3" />
            <span>Category:</span>
          </span>
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  gameAudio?.playCrispClick?.();
                }}
                className={`px-2.5 py-1 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-amber-600 text-white shadow-md ring-2 ring-amber-400/40'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800'
                }`}>
                {cat}
              </button>
            );
          })}
        </div>

        {/* Rank Filters - Only displayed after at least Rank 1 of any branch has been finished */}
        {maxBranchRank >= 1 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <span className="text-[10px] font-bold uppercase text-slate-400 shrink-0 mr-1 flex items-center gap-1">
              <Award className="w-3 h-3" />
              <span>Rank:</span>
            </span>
            {RANKS.map((r) => {
              const isSelected = selectedRank === r.value;
              return (
                <button
                  key={r.label}
                  onClick={() => {
                    setSelectedRank(r.value);
                    gameAudio?.playCrispClick?.();
                  }}
                  className={`px-2.5 py-1 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-sky-600 text-white shadow-md ring-2 ring-sky-400/40'
                      : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800'
                  }`}>
                  {r.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Blueprints Grid (Scrollable) */}
      <div className="flex-1 overflow-y-auto pr-1">
        {filteredBlueprints.length === 0 ? (
          <div className="bg-slate-900/60 border border-slate-800 p-8 rounded-2xl text-center space-y-2">
            <p className="text-slate-300 font-bold">No blueprints available!</p>
            <p className="text-xs text-slate-500">There are no blueprints matching this filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {filteredBlueprints.map((bp) => {
              const isPurchased = ownedSet.has(bp.id) || unlockedBlueprints?.includes(bp.id) || localPurchased.has(bp.id);
              const discountedPrice = getDiscountedPrice(bp.price);
              const canAfford = verdureBalance >= discountedPrice;

              return (
                <div
                  key={bp.id}
                  className={`p-3.5 rounded-2xl border flex flex-col justify-between gap-2.5 transition-all shadow-sm ${
                    isPurchased
                      ? 'bg-slate-950/70 border-emerald-500/40 shadow-inner'
                      : canAfford
                      ? 'bg-slate-900/90 border-slate-800 hover:border-amber-500/40'
                      : 'bg-slate-950/70 border-slate-850 opacity-75'
                  }`}>
                  <div>
                    {/* Top Badges */}
                    <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${getCategoryBadgeColor(
                            bp.category,
                          )}`}>
                          {bp.category}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${getRankBadgeColor(
                            bp.unlockRank,
                          )}`}>
                          {bp.unlockRank}
                        </span>
                        {isPurchased && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md border bg-emerald-950 text-emerald-300 border-emerald-500/60 flex items-center gap-1">
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span>Learned</span>
                          </span>
                        )}
                      </div>

                      {!isPurchased && (
                        <span className="text-xs font-black text-amber-300 flex items-center gap-1 font-mono">
                          <VerdureIcon className="w-3.5 h-3.5" />
                          <span>{discountedPrice} Verdure</span>
                          {discountRate > 0 && (
                            <span className="text-[10px] text-slate-400 line-through">({bp.price})</span>
                          )}
                        </span>
                      )}
                    </div>

                    {/* Blueprint Title */}
                    <h5 className="font-bold text-xs sm:text-sm text-slate-100 flex items-center gap-1.5">
                      <span className="text-base">📜</span>
                      <span>{bp.name}</span>
                    </h5>

                    {/* Description */}
                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                      {bp.description || `Unlocks the crafting recipe for ${bp.name}.`}
                    </p>
                  </div>

                  {/* Purchase Button or Purchased Badge */}
                  <div>
                    {isPurchased ? (
                      <div className="w-full py-2 rounded-xl text-xs font-bold transition-all shadow flex items-center justify-center gap-1.5 bg-emerald-950/80 text-emerald-300 border border-emerald-500/50">
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Purchased ✓</span>
                      </div>
                    ) : (
                      <button
                        disabled={!canAfford}
                        onClick={() => handleBuy(bp)}
                        className={`w-full py-2 rounded-xl text-xs font-bold transition-all shadow flex items-center justify-center gap-1.5 cursor-pointer ${
                          canAfford
                            ? 'bg-amber-600 hover:bg-amber-500 text-white active:scale-95 ring-1 ring-amber-400/50'
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                        }`}>
                        <VerdureIcon className="w-3.5 h-3.5" />
                        <span>
                          {canAfford
                            ? `Purchase Blueprint (${discountedPrice} Verdure)`
                            : `Need ${discountedPrice} Verdure`}
                        </span>
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
  );
}
