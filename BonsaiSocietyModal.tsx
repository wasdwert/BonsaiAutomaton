import React, { useState, useEffect, useMemo } from 'react';
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
  ChevronRight,
  Shield,
  HelpCircle,
  Coins,
  Package,
} from 'lucide-react';
import {
  MasterQuestsState,
  ECO_REQUESTS,
  EcoRequestDef,
} from './types';
import { VerdureIcon } from './App';
import {
  ACHIEVEMENTS_LIST,
  AchievementDef,
  DeployedStructure,
  GameStats,
  MilestoneCategory,
  PlantedBonsai,
  SanctuaryInventory,
  StoredPottedBonsai,
} from './App';
import { BonsaiStyle, MaturityTier } from './bonsaiData';
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
  stats?: GameStats;
  claimAchievement?: (achId: string, rewardZen: number, title: string) => void;
  plantedBonsais?: PlantedBonsai[];
  storedPottedBonsais?: StoredPottedBonsai[];
  discoveredSpeciesMap?: Record<
    string,
    {
      discovered: boolean;
      highestMaturity?: MaturityTier;
      stylesRaised: BonsaiStyle[];
    }
  >;
  inventory?: SanctuaryInventory;
  deployedStructures?: DeployedStructure[];
  installedCraftingArms?: number;
}

export type SocietyMainTab = 'master_quest' | 'milestones';
export type QuestBranch = 'discovery' | 'competition' | 'eco';

export const DEFAULT_STATS: GameStats = {
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
  expeditionsPerBiome: { FOOTHILLS: 0, HIGHLANDS: 0, OVERGROWTH: 0 },
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

export default function BonsaiSocietyModal({
  isOpen,
  onClose,
  masterQuests,
  discoveredSpeciesCount,
  discoveredStylesCount,
  onCompleteDiscoveryTier1,
  onCompleteCompetitionTier1,
  onCompleteEcoTier1,
  stats = DEFAULT_STATS,
  claimAchievement,
  plantedBonsais = [],
  storedPottedBonsais = [],
  discoveredSpeciesMap = {},
  inventory,
  deployedStructures = [],
  installedCraftingArms = 0,
}: BonsaiSocietyModalProps) {
  const safeStats: GameStats = useMemo(() => ({
    leafTypeStylesGrown: stats?.leafTypeStylesGrown ?? {},
    groupBonsaisGrown: stats?.groupBonsaisGrown ?? {
      Raundo: 0,
      Erementaru: 0,
      'Roku-men': 0,
      Seikatsu: 0,
      Sanmen: 0,
      Shihen: 0,
      'Jinkō-teki': 0,
    },
    firstLevel100Reached: stats?.firstLevel100Reached ?? false,
    expeditionsPerBiome: stats?.expeditionsPerBiome ?? { FOOTHILLS: 0, HIGHLANDS: 0, OVERGROWTH: 0 },
    claimedAchievements: stats?.claimedAchievements ?? [],
    totalLevelUps: stats?.totalLevelUps ?? 0,
    maxSpecimensGrownLv10: stats?.maxSpecimensGrownLv10 ?? [],
    maxSpecimensGrownLv25: stats?.maxSpecimensGrownLv25 ?? [],
    maxSpecimensGrownLv50: stats?.maxSpecimensGrownLv50 ?? [],
    sproutLv10Ids: stats?.sproutLv10Ids ?? [],
    saplingLv15Ids: stats?.saplingLv15Ids ?? [],
    notableLv20Ids: stats?.notableLv20Ids ?? [],
    refinedLv25Ids: stats?.refinedLv25Ids ?? [],
    premiumLv30Ids: stats?.premiumLv30Ids ?? [],
  }), [stats]);

  const [mainTab, setMainTab] = useState<SocietyMainTab>('master_quest');
  const [questBranch, setQuestBranch] = useState<QuestBranch>('discovery');
  const [milestoneSubTab, setMilestoneSubTab] = useState<
    'ALL' | 'BONDEX' | 'MATURITY' | 'AUTOMATION' | 'EXPEDITIONS'
  >('ALL');

  const [focusedMilestoneIdx, setFocusedMilestoneIdx] = useState<number>(0);

  // Discovery Quest Rank 1 requirements
  const targetSpecies = 6;
  const targetStyles = 18;
  const currentSpecies = Math.min(targetSpecies, discoveredSpeciesCount);
  const currentStyles = Math.min(targetStyles, discoveredStylesCount);
  const speciesProgressPct = Math.min(100, (currentSpecies / targetSpecies) * 100);
  const stylesProgressPct = Math.min(100, (currentStyles / targetStyles) * 100);
  const canCompleteDiscoveryTier1 = discoveredSpeciesCount >= targetSpecies && discoveredStylesCount >= targetStyles;

  // Active Ranks for Quest Branches
  const discoveryRank = (masterQuests as any)?.discovery?.rank ?? 1;
  const compRank = (masterQuests as any)?.competition?.rank ?? 1;
  const ecoRank = (masterQuests as any)?.eco?.rank ?? 1;

  // Eco Quest State
  const eco = masterQuests.eco;
  const activeReqIdx = Math.min(9, eco.activeRequestIndex);
  const activeReq = ECO_REQUESTS[activeReqIdx];
  const completedRequestsCount = eco.completedRequests;
  const allRequestsFinished = completedRequestsCount >= 10;
  const canCompleteEcoTier1 = allRequestsFinished && !eco.tier1Completed;

  // Calculate category completion statistics for Milestones
  const milestoneCategoryCounts = useMemo(() => {
    const counts: Record<string, { total: number; completed: number; claimable: number }> = {
      ALL: { total: ACHIEVEMENTS_LIST.length, completed: 0, claimable: 0 },
      BONDEX: { total: 0, completed: 0, claimable: 0 },
      MATURITY: { total: 0, completed: 0, claimable: 0 },
      AUTOMATION: { total: 0, completed: 0, claimable: 0 },
      EXPEDITIONS: { total: 0, completed: 0, claimable: 0 },
    };

    ACHIEVEMENTS_LIST.forEach((ach) => {
      const isClaimed = (stats?.claimedAchievements?.includes(ach.id) ?? safeStats.claimedAchievements.includes(ach.id)) || false;
      const isUnlocked = ach.isUnlocked(
        safeStats,
        plantedBonsais,
        storedPottedBonsais,
        discoveredSpeciesMap,
        inventory,
        deployedStructures,
        installedCraftingArms,
      );
      const cat = ach.category;

      if (!counts[cat]) {
        counts[cat] = { total: 0, completed: 0, claimable: 0 };
      }
      counts[cat].total += 1;
      if (isClaimed) {
        counts[cat].completed += 1;
        counts.ALL.completed += 1;
      } else if (isUnlocked) {
        counts[cat].claimable += 1;
        counts.ALL.claimable += 1;
      } else if (isUnlocked) {
        counts[cat].claimable += 1;
        counts.ALL.claimable += 1;
      }
    });

    return counts;
  }, [
    stats,
    safeStats,
    plantedBonsais,
    storedPottedBonsais,
    discoveredSpeciesMap,
    inventory,
    deployedStructures,
    installedCraftingArms,
  ]);

  // Filtered and Sorted Milestones (Claimable highlighted at top)
  const filteredAchievements = useMemo(() => {
    const list = ACHIEVEMENTS_LIST.filter(
      (ach) => milestoneSubTab === 'ALL' || ach.category === milestoneSubTab,
    );

    return [...list].sort((a, b) => {
      const aClaimed = (stats?.claimedAchievements?.includes(a.id) ?? safeStats.claimedAchievements.includes(a.id)) || false;
      const bClaimed = (stats?.claimedAchievements?.includes(b.id) ?? safeStats.claimedAchievements.includes(b.id)) || false;
      const aUnlocked = a.isUnlocked(
        safeStats,
        plantedBonsais,
        storedPottedBonsais,
        discoveredSpeciesMap,
        inventory,
        deployedStructures,
        installedCraftingArms,
      );
      const bUnlocked = b.isUnlocked(
        safeStats,
        plantedBonsais,
        storedPottedBonsais,
        discoveredSpeciesMap,
        inventory,
        deployedStructures,
        installedCraftingArms,
      );

      const aStatus = aClaimed ? 2 : aUnlocked ? 0 : 1;
      const bStatus = bClaimed ? 2 : bUnlocked ? 0 : 1;

      return aStatus - bStatus;
    });
  }, [
    milestoneSubTab,
    stats,
    safeStats,
    plantedBonsais,
    storedPottedBonsais,
    discoveredSpeciesMap,
    inventory,
    deployedStructures,
    installedCraftingArms,
  ]);

  // Tab switching with keyboard / gamepad
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        if (mainTab === 'master_quest') {
          const branches: QuestBranch[] = ['discovery', 'competition', 'eco'];
          setQuestBranch((b) => branches[(branches.indexOf(b) - 1 + branches.length) % branches.length]);
        } else {
          setMainTab('master_quest');
        }
        gameAudio?.playCrispClick?.();
      } else if (e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        if (mainTab === 'master_quest') {
          const branches: QuestBranch[] = ['discovery', 'competition', 'eco'];
          setQuestBranch((b) => branches[(branches.indexOf(b) + 1) % branches.length]);
        } else {
          setMainTab('milestones');
        }
        gameAudio?.playCrispClick?.();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, mainTab, questBranch, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed top-12 inset-x-0 bottom-0 z-40 bg-slate-950/95 backdrop-blur-md p-3 sm:p-5 flex flex-col overflow-hidden border-t border-amber-500/40 text-left select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-3 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-amber-950/80 border-2 border-amber-500/60 flex items-center justify-center text-xl shadow">
            🏛️
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg sm:text-xl font-bold text-amber-300 tracking-wide">Bonsai Society</h2>
              <span className="text-xs bg-amber-950 text-amber-300 border border-amber-500/50 px-2.5 py-0.5 rounded-full font-bold">
                Arborist Guildhall
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Headquarters of the Grand Arborist Assembly • Unified <strong>Bonsai Master Quest</strong> &amp; <strong>Milestones</strong>
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition-colors shrink-0 cursor-pointer">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* PRIMARY SUBMENU TABS: [Bonsai Master Quest] vs [Milestones] */}
      <div className="grid grid-cols-2 gap-2 mb-3 shrink-0">
        <button
          onClick={() => {
            setMainTab('master_quest');
            gameAudio?.playCrispClick?.();
          }}
          className={`py-2 px-3 rounded-2xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 transition-all shadow cursor-pointer ${
            mainTab === 'master_quest'
              ? 'bg-amber-600 text-white ring-2 ring-amber-400/50 shadow-lg'
              : 'bg-slate-900/90 text-slate-400 hover:bg-slate-850 border border-slate-800'
          }`}>
          <Trophy className="w-4 h-4 text-amber-300" />
          <span>🏆 Bonsai Master Quest</span>
          <span className="text-[10px] bg-slate-950/70 text-amber-200 px-2 py-0.5 rounded-full font-bold">
            3 Branches
          </span>
        </button>

        <button
          onClick={() => {
            setMainTab('milestones');
            gameAudio?.playCrispClick?.();
          }}
          className={`py-2 px-3 rounded-2xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 transition-all shadow relative cursor-pointer ${
            mainTab === 'milestones'
              ? 'bg-gradient-to-r from-amber-600 to-pink-600 text-white ring-2 ring-amber-400/50 shadow-lg'
              : 'bg-slate-900/90 text-slate-400 hover:bg-slate-850 border border-slate-800'
          }`}>
          <Award className="w-4 h-4 text-pink-300" />
          <span>🌟 Milestones</span>
          <span className="text-[10px] bg-slate-950/70 text-pink-300 px-2 py-0.5 rounded-full font-mono font-bold">
            {(stats?.claimedAchievements?.length ?? safeStats.claimedAchievements.length)} / {ACHIEVEMENTS_LIST.length}
          </span>
          {milestoneCategoryCounts.ALL.claimable > 0 && (
            <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-amber-400 animate-ping shadow-[0_0_8px_#f59e0b]" />
          )}
        </button>
      </div>

      {/* ========================================================================= */}
      {/* SUBMENU 1: BONSAI MASTER QUEST (DISCOVERY, COMPETITION, ECO BRANCHES) */}
      {/* ========================================================================= */}
      {mainTab === 'master_quest' && (
        <div className="flex-1 flex flex-col min-h-0">
          {/* 3 Quest Branch Pills Navigator: Discovery – Rank 1, Competition – Rank 1, Eco – Rank 1 */}
          <div className="grid grid-cols-3 gap-2 mb-3 shrink-0">
            <button
              onClick={() => {
                setQuestBranch('discovery');
                gameAudio?.playCrispClick?.();
              }}
              className={`py-2 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all shadow cursor-pointer ${
                questBranch === 'discovery'
                  ? 'bg-emerald-600 text-white ring-2 ring-emerald-400/50'
                  : 'bg-slate-900/90 text-slate-400 hover:bg-slate-800 border border-slate-800'
              }`}>
              <Compass className="w-4 h-4 text-emerald-300" />
              <span>Discovery – Rank {discoveryRank}</span>
              {masterQuests.discovery.tier1Completed ? (
                <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-400 px-1.5 py-0.2 rounded-full font-black">
                  ✓ Rank 1
                </span>
              ) : canCompleteDiscoveryTier1 ? (
                <span className="text-[10px] bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded-full font-black animate-pulse">
                  Ready!
                </span>
              ) : null}
            </button>

            <button
              onClick={() => {
                setQuestBranch('competition');
                gameAudio?.playCrispClick?.();
              }}
              className={`py-2 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all shadow cursor-pointer ${
                questBranch === 'competition'
                  ? 'bg-sky-600 text-white ring-2 ring-sky-400/50'
                  : 'bg-slate-900/90 text-slate-400 hover:bg-slate-800 border border-slate-800'
              }`}>
              <Trophy className="w-4 h-4 text-sky-300" />
              <span>Competition – Rank {compRank}</span>
              {masterQuests.competition.tier1Completed && (
                <span className="text-[10px] bg-sky-950 text-sky-300 border border-sky-400 px-1.5 py-0.2 rounded-full font-black">
                  ✓ Rank 1
                </span>
              )}
            </button>

            <button
              onClick={() => {
                setQuestBranch('eco');
                gameAudio?.playCrispClick?.();
              }}
              className={`py-2 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all shadow cursor-pointer ${
                questBranch === 'eco'
                  ? 'bg-amber-600 text-white ring-2 ring-amber-400/50'
                  : 'bg-slate-900/90 text-slate-400 hover:bg-slate-800 border border-slate-800'
              }`}>
              <Sprout className="w-4 h-4 text-amber-300" />
              <span>Eco – Rank {ecoRank}</span>
              {masterQuests.eco.tier1Completed ? (
                <span className="text-[10px] bg-amber-950 text-amber-300 border border-amber-400 px-1.5 py-0.2 rounded-full font-black">
                  ✓ Rank 1
                </span>
              ) : canCompleteEcoTier1 ? (
                <span className="text-[10px] bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded-full font-black animate-pulse">
                  Ready!
                </span>
              ) : null}
            </button>
          </div>

          {/* BRANCH 1: DISCOVERY */}
          {questBranch === 'discovery' && (
            <div className="flex-1 overflow-y-auto space-y-3.5 pr-1">
              <div className="bg-slate-900/90 border border-emerald-500/30 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-500/50 flex items-center justify-center text-emerald-400 text-xl font-bold">
                      🌿
                    </div>
                    <div>
                      <h4 className="text-base font-black text-slate-100">
                        Discovery Branch — Rank 1
                      </h4>
                      <p className="text-xs text-emerald-300">
                        Objective: Discover 6 Bonsai Species and 18 Styles in your Botanical Bondex
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-slate-400 font-semibold block">Branch Status</span>
                    {masterQuests.discovery.tier1Completed ? (
                      <span className="text-xs font-black text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Rank 1 Completed
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
                    <span className="text-amber-400 font-bold">Rank 1 Reward:</span>
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
                      <span>Rank 1 Completed ✓</span>
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
                      <span>{canCompleteDiscoveryTier1 ? 'Complete Rank 1' : 'Complete Rank 1 (Incomplete)'}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* BRANCH 2: COMPETITION */}
          {questBranch === 'competition' && (
            <div className="flex-1 overflow-y-auto space-y-3.5 pr-1">
              <div className="bg-slate-900/90 border border-sky-500/30 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-sky-950 border border-sky-500/50 flex items-center justify-center text-sky-400 text-xl font-bold">
                      🏆
                    </div>
                    <div>
                      <h4 className="text-base font-black text-slate-100">
                        Competition Branch — Rank 1
                      </h4>
                      <p className="text-xs text-sky-300">
                        Objective: Finish the Area 1 League
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-slate-400 font-semibold block">Branch Status</span>
                    {masterQuests.competition.tier1Completed ? (
                      <span className="text-xs font-black text-sky-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Rank 1 Completed
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

                {/* Reward info & Action Button */}
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    <span className="text-amber-400 font-bold">Rank 1 Reward:</span>
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
                    <span>[Complete Rank 1] (League Coming Soon)</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* BRANCH 3: ECO */}
          {questBranch === 'eco' && (
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
                        <span>Eco Branch — Rank 1</span>
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
                    <span className="text-xs text-slate-400 font-semibold block">Rank 1 Status</span>
                    {eco.tier1Completed ? (
                      <span className="text-xs font-black text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Rank 1 Completed
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
                      You have delivered all 10 ecological restoration donations requested by the Bonsai Society. Claim your Rank 1 completion below!
                    </p>
                  </div>
                )}

                {/* Bottom Rank 1 Claim Section */}
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    <span className="text-amber-400 font-bold">Rank 1 Reward:</span>
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
                      <span>Rank 1 Completed ✓</span>
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
                      <span>{canCompleteEcoTier1 ? 'Complete Rank 1' : 'Complete Rank 1 (10 Requests Required)'}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBMENU 2: MILESTONES (MOVED FROM ZEN LIBRARY INTO BONSAI SOCIETY) */}
      {/* ========================================================================= */}
      {mainTab === 'milestones' && (
        <div className="flex-1 flex flex-col min-h-0 space-y-2.5">
          {/* CATEGORY FILTER CHIPS / SUB-TABS */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 shrink-0 scrollbar-none">
            {[
              { id: 'ALL', label: 'All', icon: '🏆' },
              { id: 'BONDEX', label: '🌿 Bondex & Taxonomy', icon: '🌿' },
              { id: 'MATURITY', label: '🌟 Maturity & Growth', icon: '🌟' },
              { id: 'AUTOMATION', label: '⚡ Automation & Energy', icon: '⚡' },
              { id: 'EXPEDITIONS', label: '🚜 Expeditions & Mastery', icon: '🚜' },
            ].map((cat) => {
              const isSelected = milestoneSubTab === cat.id;
              const cData = milestoneCategoryCounts[cat.id] || { total: 0, completed: 0, claimable: 0 };
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setMilestoneSubTab(cat.id as any);
                    gameAudio?.playCrispClick?.();
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 border flex items-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? 'bg-slate-100 text-slate-950 border-white shadow-md'
                      : 'bg-slate-900/90 text-slate-300 border-slate-800 hover:border-slate-700'
                  }`}>
                  <span>{cat.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                      isSelected
                        ? 'bg-slate-850 text-emerald-400'
                        : 'bg-slate-950 text-slate-400'
                    }`}>
                    {cData.completed}/{cData.total}
                  </span>
                  {cData.claimable > 0 && (
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping shadow-[0_0_8px_#f59e0b]" />
                  )}
                </button>
              );
            })}
          </div>

          {/* MILESTONES CARDS LIST */}
          <div className="flex-1 space-y-2.5 overflow-y-auto pr-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {filteredAchievements.map((ach, mIdx) => {
                const isClaimed = (stats?.claimedAchievements?.includes(ach.id) ?? safeStats.claimedAchievements.includes(ach.id)) || false;
                const isCompleted = ach.isUnlocked(
                  safeStats,
                  plantedBonsais,
                  storedPottedBonsais,
                  discoveredSpeciesMap,
                  inventory,
                  deployedStructures,
                  installedCraftingArms,
                );
                const isClaimable = isCompleted && !isClaimed;
                const isFocused = focusedMilestoneIdx === mIdx;
                const curVal = ach.currentValue(
                  safeStats,
                  plantedBonsais,
                  storedPottedBonsais,
                  discoveredSpeciesMap,
                  inventory,
                  deployedStructures,
                  installedCraftingArms,
                );
                const pct = Math.min(100, Math.round((curVal / ach.targetValue) * 100));

                const categoryBadgeColor: Record<MilestoneCategory, string> = {
                  BONDEX: 'bg-emerald-950 text-emerald-300 border-emerald-500/50',
                  MATURITY: 'bg-amber-950 text-amber-300 border-amber-500/50',
                  AUTOMATION: 'bg-sky-950 text-sky-300 border-sky-500/50',
                  EXPEDITIONS: 'bg-purple-950 text-purple-300 border-purple-500/50',
                };

                const categoryNames: Record<MilestoneCategory, string> = {
                  BONDEX: '🌿 Bondex',
                  MATURITY: '🌟 Maturity',
                  AUTOMATION: '⚡ Automation',
                  EXPEDITIONS: '🚜 Expeditions',
                };

                return (
                  <div
                    key={ach.id}
                    className={`p-3.5 rounded-2xl border flex flex-col justify-between gap-2.5 transition-all ${
                      isFocused
                        ? 'ring-2 ring-amber-300 border-amber-400 bg-slate-850 scale-[1.01]'
                        : isClaimable
                        ? 'bg-gradient-to-br from-amber-950/60 via-slate-900 to-emerald-950/40 border-amber-400 shadow-[0_0_18px_rgba(251,191,36,0.35)] ring-1 ring-amber-400/60'
                        : isClaimed
                        ? 'bg-slate-950/50 border-slate-800/80 opacity-70'
                        : 'bg-slate-900/80 border-slate-800'
                    }`}>
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{ach.icon}</span>
                          <div>
                            <h4 className="font-bold text-xs sm:text-sm text-slate-100 flex items-center gap-1.5">
                              <span>{ach.title}</span>
                              {isClaimed && <span className="text-emerald-400 text-xs">✓</span>}
                            </h4>
                            <span className="text-xs text-amber-300 font-semibold">{ach.subtitle}</span>
                          </div>
                        </div>

                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${categoryBadgeColor[ach.category]}`}>
                          {categoryNames[ach.category]}
                        </span>
                      </div>

                      <p className="text-xs text-slate-400 mb-1.5 leading-relaxed">{ach.description}</p>
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-[11px] text-slate-300 mb-1 font-mono">
                        <span>
                          Progress: {Math.min(ach.targetValue, curVal)} / {ach.targetValue} {ach.unit}
                        </span>
                        <span className={isCompleted ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                          {pct}%
                        </span>
                      </div>

                      <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800 mb-2">
                        <div
                          style={{ width: `${pct}%` }}
                          className={`h-full transition-all duration-300 ${
                            isCompleted
                              ? 'bg-gradient-to-r from-emerald-400 to-amber-400'
                              : 'bg-pink-500'
                          }`}
                        />
                      </div>

                      {isClaimed ? (
                        <div className="w-full py-1.5 bg-slate-950 border border-emerald-500/30 rounded-xl text-center text-xs font-bold text-emerald-400 flex items-center justify-center gap-1">
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Claimed (+{ach.rewardZen} Zen Points)</span>
                        </div>
                      ) : isCompleted ? (
                        <button
                          onClick={() => claimAchievement?.(ach.id, ach.rewardZen, ach.title)}
                          className="w-full py-2 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 hover:from-amber-300 hover:to-yellow-200 text-slate-950 font-black text-xs rounded-xl shadow-[0_0_15px_rgba(251,191,36,0.5)] transition-transform active:scale-95 flex items-center justify-center gap-1.5 animate-pulse cursor-pointer">
                          <Trophy className="w-3.5 h-3.5 fill-current" />
                          <span>CLAIM (+{ach.rewardZen} ZEN POINTS)</span>
                        </button>
                      ) : (
                        <div className="w-full py-1.5 bg-slate-950/60 border border-slate-800 rounded-xl text-center text-xs font-medium text-slate-500">
                          In Progress • Reward: +{ach.rewardZen} 🌸 Zen
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Footer Hotkeys Strip */}
      <div className="pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 shrink-0 mt-2">
        <span className="font-mono text-amber-400 text-[11px] hidden sm:inline">
          🎮 [A/D / LB/RB] Switch Submenus • [Esc / B] Close
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
