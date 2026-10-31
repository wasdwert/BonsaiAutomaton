import React, { useState, useEffect } from 'react';
import {
  X,
  Trophy,
  Sparkles,
  Award,
  CheckCircle2,
  Compass,
  Sprout,
  Trees,
  Check,
  Lock,
  ArrowRight,
  BookOpen,
  ChevronRight,
  Shield,
  HelpCircle,
} from 'lucide-react';
import {
  MasterQuestsState,
  ECO_REQUESTS,
  EcoRequestDef,
} from './types';
import { VerdureIcon } from './App';
import { gameAudio } from './utils/helper';

export interface BonsaiSocietyModalProps {
  isOpen: boolean;
  onClose: () => void;
  masterQuests: MasterQuestsState;
  discoveredSpeciesCount: number;
  discoveredStylesCount: number;
  onCompleteDiscoveryTier1: () => void;
  onCompleteCompetitionTier1: () => void;
  onCompleteEcoTier1: () => void;
}

export type QuestCategoryTab = 'discovery' | 'competition' | 'eco';

export default function BonsaiSocietyModal({
  isOpen,
  onClose,
  masterQuests,
  discoveredSpeciesCount,
  discoveredStylesCount,
  onCompleteDiscoveryTier1,
  onCompleteCompetitionTier1,
  onCompleteEcoTier1,
}: BonsaiSocietyModalProps) {
  const [activeTab, setActiveTab] = useState<QuestCategoryTab>('discovery');
  const [focusedBtnIdx, setFocusedBtnIdx] = useState<number>(0);

  // Tab switching with keyboard / gamepad
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const tabs: QuestCategoryTab[] = ['discovery', 'competition', 'eco'];

      if (e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        setActiveTab((t) => tabs[(tabs.indexOf(t) - 1 + tabs.length) % tabs.length]);
        setFocusedBtnIdx(0);
        gameAudio?.playCrispClick?.();
      } else if (e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        setActiveTab((t) => tabs[(tabs.indexOf(t) + 1) % tabs.length]);
        setFocusedBtnIdx(0);
        gameAudio?.playCrispClick?.();
      } else if (e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        setFocusedBtnIdx((idx) => Math.max(0, idx - 1));
        gameAudio?.playHoverMicroTone?.();
      } else if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        setFocusedBtnIdx((idx) => Math.min(1, idx + 1));
        gameAudio?.playHoverMicroTone?.();
      } else if (e.key === 'Enter' || e.key === ' ' || e.key === 'e' || e.key === 'E') {
        e.preventDefault();
        if (focusedBtnIdx === 0) {
          if (activeTab === 'discovery' && canCompleteDiscoveryTier1 && !masterQuests.discovery.tier1Completed) {
            onCompleteDiscoveryTier1();
          } else if (activeTab === 'competition' && !masterQuests.competition.tier1Completed) {
            onCompleteCompetitionTier1();
          } else if (activeTab === 'eco' && canCompleteEcoTier1 && !masterQuests.eco.tier1Completed) {
            onCompleteEcoTier1();
          }
        } else if (focusedBtnIdx === 1) {
          onClose();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, activeTab, focusedBtnIdx, masterQuests, discoveredSpeciesCount, discoveredStylesCount, onClose]);

  if (!isOpen) return null;

  // Discovery Quest Tier 1 requirements
  const targetSpecies = 6;
  const targetStyles = 18;
  const currentSpecies = Math.min(targetSpecies, discoveredSpeciesCount);
  const currentStyles = Math.min(targetStyles, discoveredStylesCount);
  const speciesProgressPct = Math.min(100, (currentSpecies / targetSpecies) * 100);
  const stylesProgressPct = Math.min(100, (currentStyles / targetStyles) * 100);
  const canCompleteDiscoveryTier1 = discoveredSpeciesCount >= targetSpecies && discoveredStylesCount >= targetStyles;

  // Eco Quest State
  const eco = masterQuests.eco;
  const activeReqIdx = Math.min(9, eco.activeRequestIndex);
  const activeReq = ECO_REQUESTS[activeReqIdx];
  const completedRequestsCount = eco.completedRequests;
  const allRequestsFinished = completedRequestsCount >= 10;
  const canCompleteEcoTier1 = allRequestsFinished && !eco.tier1Completed;

  return (
    <div className="fixed top-12 left-0 right-0 bottom-0 z-40 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm pointer-events-auto select-none">
      <div className="w-full max-w-4xl h-full max-h-[calc(100vh-3.5rem)] flex flex-col bg-slate-950/95 border border-amber-500/40 rounded-3xl p-3 sm:p-5 shadow-2xl backdrop-blur-xl overflow-hidden text-left">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-950/80 border-2 border-amber-500/60 flex items-center justify-center text-2xl shadow">
              🏛️
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-black text-amber-300">Bonsai Society</h2>
                <span className="text-xs bg-amber-950 text-amber-300 border border-amber-500/50 px-2.5 py-0.5 rounded-full font-bold">
                  Arborist Guildhall
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Headquarters of the Grand Arborist Assembly • Core <strong>Bonsai Master Quest</strong> Operations
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-slate-200 transition-colors shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Primary Submenu Banner: Bonsai Master Quest */}
        <div className="bg-gradient-to-r from-amber-950/80 via-slate-900 to-amber-950/80 border border-amber-500/40 p-3 rounded-2xl mb-3 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <Trophy className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="text-sm sm:text-base font-black text-amber-200 uppercase tracking-wider">
                Bonsai Master Quest
              </h3>
              <p className="text-[11px] text-slate-300">
                Complete all three Grand Master quest lines (Tier 1 &rarr; Tier 2 &rarr; Tier 3) to achieve prestigious Arborist Master rank.
              </p>
            </div>
          </div>

          {/* Tier Pills Navigator */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-xs font-bold px-3 py-1 rounded-xl bg-amber-500 text-slate-950 shadow-md">
              Tier 1 (Active)
            </span>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-xl bg-slate-900 text-slate-500 border border-slate-800 flex items-center gap-1">
              <Lock className="w-3 h-3" />
              <span>Tier 2</span>
            </span>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-xl bg-slate-900 text-slate-500 border border-slate-800 flex items-center gap-1">
              <Lock className="w-3 h-3" />
              <span>Tier 3</span>
            </span>
          </div>
        </div>

        {/* 3 Tabbed Quest Categories Navigator */}
        <div className="grid grid-cols-3 gap-2 mb-3 shrink-0">
          <button
            onClick={() => {
              setActiveTab('discovery');
              setFocusedBtnIdx(0);
              gameAudio?.playCrispClick?.();
            }}
            className={`py-2 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all shadow ${
              activeTab === 'discovery'
                ? 'bg-emerald-600 text-white ring-2 ring-emerald-400/50'
                : 'bg-slate-900/90 text-slate-400 hover:bg-slate-800 border border-slate-800'
            }`}>
            <Compass className="w-4 h-4 text-emerald-300" />
            <span>Discovery Quest</span>
            {masterQuests.discovery.tier1Completed ? (
              <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-400 px-1.5 py-0.2 rounded-full font-black">
                ✓ Tier 1
              </span>
            ) : canCompleteDiscoveryTier1 ? (
              <span className="text-[10px] bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded-full font-black animate-pulse">
                Ready!
              </span>
            ) : null}
          </button>

          <button
            onClick={() => {
              setActiveTab('competition');
              setFocusedBtnIdx(0);
              gameAudio?.playCrispClick?.();
            }}
            className={`py-2 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all shadow ${
              activeTab === 'competition'
                ? 'bg-sky-600 text-white ring-2 ring-sky-400/50'
                : 'bg-slate-900/90 text-slate-400 hover:bg-slate-800 border border-slate-800'
            }`}>
            <Trophy className="w-4 h-4 text-sky-300" />
            <span>Competition Quest</span>
            {masterQuests.competition.tier1Completed && (
              <span className="text-[10px] bg-sky-950 text-sky-300 border border-sky-400 px-1.5 py-0.2 rounded-full font-black">
                ✓ Tier 1
              </span>
            )}
          </button>

          <button
            onClick={() => {
              setActiveTab('eco');
              setFocusedBtnIdx(0);
              gameAudio?.playCrispClick?.();
            }}
            className={`py-2 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all shadow ${
              activeTab === 'eco'
                ? 'bg-amber-600 text-white ring-2 ring-amber-400/50'
                : 'bg-slate-900/90 text-slate-400 hover:bg-slate-800 border border-slate-800'
            }`}>
            <Sprout className="w-4 h-4 text-amber-300" />
            <span>Eco Quest</span>
            {masterQuests.eco.tier1Completed ? (
              <span className="text-[10px] bg-amber-950 text-amber-300 border border-amber-400 px-1.5 py-0.2 rounded-full font-black">
                ✓ Tier 1
              </span>
            ) : canCompleteEcoTier1 ? (
              <span className="text-[10px] bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded-full font-black animate-pulse">
                Ready!
              </span>
            ) : (
              <span className="text-[10px] bg-slate-950/80 text-amber-300 border border-amber-500/40 px-1.5 py-0.2 rounded-full font-mono font-bold">
                {completedRequestsCount}/10
              </span>
            )}
          </button>
        </div>

        {/* ========================================================================= */}
        {/* QUEST TAB 1: DISCOVERY QUEST (TIER 1) */}
        {/* ========================================================================= */}
        {activeTab === 'discovery' && (
          <div className="flex-1 overflow-y-auto space-y-3.5 pr-1">
            <div className="bg-slate-900/90 border border-emerald-500/30 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-500/50 flex items-center justify-center text-emerald-400 text-xl font-bold">
                    🌿
                  </div>
                  <div>
                    <h4 className="text-base font-black text-slate-100">
                      Discovery Quest — Tier 1
                    </h4>
                    <p className="text-xs text-emerald-300">
                      Objective: Discover 6 Bonsai Species and 18 Styles in your Botanical Bondex
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs text-slate-400 font-semibold block">Quest Status</span>
                  {masterQuests.discovery.tier1Completed ? (
                    <span className="text-xs font-black text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Tier 1 Completed
                    </span>
                  ) : canCompleteDiscoveryTier1 ? (
                    <span className="text-xs font-black text-amber-400 animate-pulse">
                      🌟 Ready to Claim!
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-slate-400">In Progress</span>
                  )}
                </div>
              </div>

              {/* Live Progress Bar 1: Species Discovered */}
              <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-bold flex items-center gap-1.5">
                    <Sprout className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Species Discovered in Bondex:</span>
                  </span>
                  <span className="font-mono font-bold text-emerald-300">
                    {discoveredSpeciesCount} / 6 Species {discoveredSpeciesCount >= 6 ? '✓' : ''}
                  </span>
                </div>
                <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800">
                  <div
                    style={{ width: `${speciesProgressPct}%` }}
                    className="h-full bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-400 rounded-full transition-all duration-300"
                  />
                </div>
                <p className="text-[10px] text-slate-400">
                  Catalog new species by excavating wild seedlings on expeditions or cultivating them in the nursery.
                </p>
              </div>

              {/* Live Progress Bar 2: Styles Discovered */}
              <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-bold flex items-center gap-1.5">
                    <Trees className="w-3.5 h-3.5 text-sky-400" />
                    <span>Styles Discovered across Species in Bondex:</span>
                  </span>
                  <span className="font-mono font-bold text-sky-300">
                    {discoveredStylesCount} / 18 Styles {discoveredStylesCount >= 18 ? '✓' : ''}
                  </span>
                </div>
                <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800">
                  <div
                    style={{ width: `${stylesProgressPct}%` }}
                    className="h-full bg-gradient-to-r from-sky-600 via-sky-500 to-cyan-400 rounded-full transition-all duration-300"
                  />
                </div>
                <p className="text-[10px] text-slate-400">
                  Grow trees in Chokan, Moyogi, Shakan, and classical variants to Level 10+ to register distinct style variants in the Botanical Bondex.
                </p>
              </div>

              {/* Reward info & Action Button */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <span className="text-amber-400 font-bold">Tier 1 Completion Reward:</span>
                  <span className="bg-amber-950/80 text-amber-300 border border-amber-500/50 px-2 py-0.5 rounded-lg font-mono font-bold flex items-center gap-1">
                    <VerdureIcon className="w-3 h-3" />
                    <span>+250.00 Verdure</span>
                  </span>
                  <span className="bg-pink-950/80 text-pink-300 border border-pink-500/50 px-2 py-0.5 rounded-lg font-mono font-bold">
                    🌸 +5 Zen Points
                  </span>
                </div>

                {masterQuests.discovery.tier1Completed ? (
                  <div className="bg-emerald-950/80 text-emerald-300 border border-emerald-500/60 px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 shadow">
                    <Check className="w-4 h-4" />
                    <span>Tier 1 Completed ✓</span>
                  </div>
                ) : (
                  <button
                    disabled={!canCompleteDiscoveryTier1}
                    onClick={onCompleteDiscoveryTier1}
                    className={`font-black text-xs px-5 py-2.5 rounded-xl shadow-lg transition-all flex items-center gap-1.5 ${
                      canCompleteDiscoveryTier1
                        ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 ring-2 ring-emerald-300 active:scale-95 animate-pulse cursor-pointer'
                        : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                    }`}>
                    <Award className="w-4 h-4" />
                    <span>{canCompleteDiscoveryTier1 ? '[Complete Tier 1]' : 'Complete Tier 1 (Incomplete)'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* QUEST TAB 2: COMPETITION QUEST (TIER 1) */}
        {/* ========================================================================= */}
        {activeTab === 'competition' && (
          <div className="flex-1 overflow-y-auto space-y-3.5 pr-1">
            <div className="bg-slate-900/90 border border-sky-500/30 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-sky-950 border border-sky-500/50 flex items-center justify-center text-sky-400 text-xl font-bold">
                    🏆
                  </div>
                  <div>
                    <h4 className="text-base font-black text-slate-100">
                      Competition Quest — Tier 1
                    </h4>
                    <p className="text-xs text-sky-300">
                      Objective: Finish the Area 1 League
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs text-slate-400 font-semibold block">Quest Status</span>
                  {masterQuests.competition.tier1Completed ? (
                    <span className="text-xs font-black text-sky-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Tier 1 Completed
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-amber-400">In Progress</span>
                  )}
                </div>
              </div>

              {/* Status Box */}
              <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl space-y-2 text-center">
                <div className="w-10 h-10 rounded-full bg-sky-950 border border-sky-500/40 flex items-center justify-center mx-auto text-sky-300">
                  <Trophy className="w-5 h-5 animate-pulse" />
                </div>
                <h5 className="font-bold text-sm text-slate-200">
                  Area 1 League: In Progress (League challenges coming soon)
                </h5>
                <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                  The Botanical League committee is currently finalizing tournament rankings and aesthetic judging criteria for Area 1 competitors.
                </p>

                <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800 max-w-xs mx-auto mt-2">
                  <div className="h-full bg-sky-500/40 w-0" />
                </div>
                <span className="text-[10px] text-slate-500 font-mono block">
                  0 / 1 League Completed
                </span>
              </div>

              {/* Action Button (Disabled until league completes) */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <span className="text-amber-400 font-bold">Tier 1 Completion Reward:</span>
                  <span className="bg-amber-950/80 text-amber-300 border border-amber-500/50 px-2 py-0.5 rounded-lg font-mono font-bold flex items-center gap-1">
                    <VerdureIcon className="w-3 h-3" />
                    <span>+300.00 Verdure</span>
                  </span>
                  <span className="bg-pink-950/80 text-pink-300 border border-pink-500/50 px-2 py-0.5 rounded-lg font-mono font-bold">
                    🌸 +5 Zen Points
                  </span>
                </div>

                <button
                  disabled
                  className="font-bold text-xs px-5 py-2.5 rounded-xl bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed flex items-center gap-1.5">
                  <Award className="w-4 h-4" />
                  <span>[Complete Tier 1] (League Coming Soon)</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* QUEST TAB 3: ECO QUEST (TIER 1 - 10 BOTANICAL REQUESTS) */}
        {/* ========================================================================= */}
        {activeTab === 'eco' && (
          <div className="flex-1 overflow-y-auto space-y-3.5 pr-1">
            <div className="bg-slate-900/90 border border-amber-500/30 rounded-2xl p-4 space-y-3">
              {/* Header with finished count */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-amber-950 border border-amber-500/50 flex items-center justify-center text-amber-400 text-xl font-bold">
                    🌱
                  </div>
                  <div>
                    <h4 className="text-base font-black text-slate-100 flex items-center gap-2">
                      <span>Eco Quest — Tier 1</span>
                      <span className="text-xs bg-amber-950 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full font-mono font-bold">
                        {completedRequestsCount} out of 10 Requests Finished
                      </span>
                    </h4>
                    <p className="text-xs text-amber-300">
                      Deliver 10 distinct botanical donations to ecological restoration
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs text-slate-400 font-semibold block">Tier 1 Status</span>
                  {eco.tier1Completed ? (
                    <span className="text-xs font-black text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Tier 1 Completed
                    </span>
                  ) : canCompleteEcoTier1 ? (
                    <span className="text-xs font-black text-amber-400 animate-pulse">
                      🌟 Ready to Claim!
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-slate-400">Request #{activeReqIdx + 1} of 10</span>
                  )}
                </div>
              </div>

              {/* Overall 10 Requests Progress Bar */}
              <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
                <div
                  style={{ width: `${(completedRequestsCount / 10) * 100}%` }}
                  className="h-full bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-400 rounded-full transition-all duration-300"
                />
              </div>

              {/* 🌟 2x Bonus Notice Banner */}
              <div className="bg-emerald-950/60 border border-emerald-500/50 p-2.5 rounded-xl flex items-center gap-2 text-xs text-emerald-300 font-semibold shadow-sm">
                <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  <strong>🌟 Eco Request Matching Bonus:</strong> Any donated Bonsai matching the current active Request awards <strong>2x Verdure payout</strong> (+100% bonus value)!
                </span>
              </div>

              {/* Active Request Card (One Request at a time) */}
              {!allRequestsFinished && activeReq ? (
                <div className="bg-slate-950/90 border-2 border-amber-500/60 rounded-2xl p-4 space-y-3 shadow-md">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
                        Active Botanical Request ({activeReqIdx + 1} / 10)
                      </span>
                      <h5 className="text-base font-black text-slate-100 mt-0.5">
                        {activeReq.title}
                      </h5>
                    </div>
                    <span className="text-xs bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2.5 py-1 rounded-xl font-bold">
                      {activeReq.description}
                    </span>
                  </div>

                  {/* Targets breakdown with progress bars */}
                  <div className="space-y-2 pt-1 border-t border-slate-800/80">
                    <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                      Delivery Progress:
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {activeReq.targets.map((target) => {
                        const curCount = eco.requestCounts[target.key] || 0;
                        const pct = Math.min(100, (curCount / target.count) * 100);
                        const isTargetComplete = curCount >= target.count;

                        return (
                          <div
                            key={target.key}
                            className={`p-2.5 rounded-xl border flex flex-col justify-between gap-1.5 ${
                              isTargetComplete
                                ? 'bg-emerald-950/60 border-emerald-500/60'
                                : 'bg-slate-900 border-slate-800'
                            }`}>
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-bold text-slate-200 truncate">{target.label}</span>
                              <span className={`font-mono font-bold ${isTargetComplete ? 'text-emerald-400' : 'text-amber-300'}`}>
                                {curCount} / {target.count} {isTargetComplete ? '✓' : ''}
                              </span>
                            </div>

                            <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                              <div
                                style={{ width: `${pct}%` }}
                                className={`h-full rounded-full transition-all duration-200 ${
                                  isTargetComplete ? 'bg-emerald-400' : 'bg-amber-400'
                                }`}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 italic">
                    💡 Donate matching bonsai via Quick Radial menu [Q / Y &rarr; Up] or Inspection Modal to fulfill this request and collect 2x payout! Completing this request advances automatically to the next.
                  </p>
                </div>
              ) : (
                <div className="bg-emerald-950/70 border-2 border-emerald-500 rounded-2xl p-5 text-center space-y-2 shadow-lg">
                  <div className="w-12 h-12 rounded-full bg-emerald-900 border-2 border-emerald-400 flex items-center justify-center mx-auto text-emerald-300">
                    <Check className="w-6 h-6" />
                  </div>
                  <h5 className="text-base font-black text-emerald-200">
                    All 10 Botanical Requests Finished!
                  </h5>
                  <p className="text-xs text-emerald-300/90 max-w-md mx-auto">
                    You have delivered all 10 ecological restoration donations requested by the Bonsai Society. Claim your Tier 1 completion below!
                  </p>
                </div>
              )}

              {/* Bottom Tier 1 Claim Section */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <span className="text-amber-400 font-bold">Tier 1 Completion Reward:</span>
                  <span className="bg-amber-950/80 text-amber-300 border border-amber-500/50 px-2 py-0.5 rounded-lg font-mono font-bold flex items-center gap-1">
                    <VerdureIcon className="w-3 h-3" />
                    <span>+500.00 Verdure</span>
                  </span>
                  <span className="bg-pink-950/80 text-pink-300 border border-pink-500/50 px-2 py-0.5 rounded-lg font-mono font-bold">
                    🌸 +5 Zen Points
                  </span>
                </div>

                {eco.tier1Completed ? (
                  <div className="bg-emerald-950/80 text-emerald-300 border border-emerald-500/60 px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 shadow">
                    <Check className="w-4 h-4" />
                    <span>Tier 1 Completed ✓</span>
                  </div>
                ) : (
                  <button
                    disabled={!canCompleteEcoTier1}
                    onClick={onCompleteEcoTier1}
                    className={`font-black text-xs px-5 py-2.5 rounded-xl shadow-lg transition-all flex items-center gap-1.5 ${
                      canCompleteEcoTier1
                        ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 ring-2 ring-amber-300 active:scale-95 animate-pulse cursor-pointer'
                        : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                    }`}>
                    <Award className="w-4 h-4" />
                    <span>{canCompleteEcoTier1 ? '[Complete Tier 1]' : 'Complete Tier 1 (10 Requests Required)'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Footer Hotkeys Strip */}
        <div className="pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 shrink-0 mt-2">
          <span className="font-mono text-amber-400 text-[11px] hidden sm:inline">
            🎮 [A/D / LB/RB] Switch Quests • [W/S] Select • [E / A] Confirm • [Esc / B] Close
          </span>
          <button
            onClick={onClose}
            className="px-5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold transition-all border border-slate-700">
            Close [Esc / B]
          </button>
        </div>
      </div>
    </div>
  );
}
