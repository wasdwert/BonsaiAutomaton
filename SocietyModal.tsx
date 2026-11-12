import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
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
} from './types';
import {
  DeployedStructure,
  GameStats,
  PlantedBonsai,
  SanctuaryInventory,
  StoredPottedBonsai,
} from './App';
import { BonsaiStyle, MaturityTier } from './bonsaiData';
import { gameAudio } from './utils/helper';
export {
  calculateBonsaiDonationValue,
  calculateDonationValue,
  calculateAttributeFactor,
  getBonsaiDonationBreakdown,
  type AttributeFactorBreakdown,
  type BonsaiDonationBreakdown,
} from './bonsaiData';

export type SocietyMainTab = 'master_quest' | 'milestones';
export type QuestBranch = 'discovery' | 'competition' | 'eco';
export type MilestoneCategory = 'Bondex' | 'Growing' | 'Maturity' | 'Species' | 'Expeditions';

export interface MilestoneDef {
  id: string;
  category: MilestoneCategory;
  title: string;
  unit: string;
  targets: [number, number, number, number, number];
  isNotObtainable?: boolean;
  getValue: (
    stats: GameStats,
    discoveredSpeciesMap: Record<string, { discovered: boolean; highestMaturity?: MaturityTier; stylesRaised: BonsaiStyle[] }>,
    plantedBonsais: PlantedBonsai[],
    storedPottedBonsais: StoredPottedBonsai[],
    inventory?: SanctuaryInventory,
  ) => number;
}

export const TIER_LABELS = ['I', 'II', 'III', 'IV', 'V'] as const;
export const BLOCK_REWARDS = [10, 25, 75, 250, 1000] as const;

export const SOCIETY_MILESTONES: MilestoneDef[] = [
  // 1. Category: Bondex
  {
    id: 'bondex_species_types',
    category: 'Bondex',
    title: 'Species Types found',
    unit: 'Species',
    targets: [3, 6, 10, 15, 20],
    getValue: (_stats, discoveredMap) =>
      Object.values(discoveredMap || {}).filter((d) => d?.discovered).length,
  },
  {
    id: 'bondex_style_types',
    category: 'Bondex',
    title: 'Style Types found',
    unit: 'Styles',
    targets: [15, 30, 60, 120, 200],
    getValue: (_stats, discoveredMap) =>
      Object.values(discoveredMap || {}).reduce((acc, d) => acc + (d?.stylesRaised?.length || 0), 0),
  },
  {
    id: 'bondex_blooming_species',
    category: 'Bondex',
    title: 'Blooming Species Types found',
    unit: 'Species',
    targets: [3, 6, 10, 15, 20],
    isNotObtainable: true,
    getValue: () => 0,
  },
  {
    id: 'bondex_blooming_styles',
    category: 'Bondex',
    title: 'Blooming Style Types found',
    unit: 'Styles',
    targets: [15, 30, 60, 120, 200],
    isNotObtainable: true,
    getValue: () => 0,
  },

  // 2. Category: Growing
  {
    id: 'growing_lv5',
    category: 'Growing',
    title: 'Bonsais Grown to Lv.5',
    unit: 'Bonsais',
    targets: [5, 10, 25, 100, 250],
    getValue: (stats, _dMap, planted, stored) => {
      const set = new Set<string>(stats?.grownLv5Ids || []);
      [...(planted || []), ...(stored || [])].forEach((b) => {
        if (b.level >= 5) set.add(b.id);
      });
      return set.size;
    },
  },
  {
    id: 'growing_lv10',
    category: 'Growing',
    title: 'Bonsais Grown to Lv.10',
    unit: 'Bonsais',
    targets: [5, 10, 25, 100, 250],
    getValue: (stats, _dMap, planted, stored) => {
      const set = new Set<string>([...(stats?.grownLv10Ids || []), ...(stats?.maxSpecimensGrownLv10 || [])]);
      [...(planted || []), ...(stored || [])].forEach((b) => {
        if (b.level >= 10) set.add(b.id);
      });
      return set.size;
    },
  },
  {
    id: 'growing_lv25',
    category: 'Growing',
    title: 'Bonsais Grown to Lv.25',
    unit: 'Bonsais',
    targets: [5, 10, 25, 100, 200],
    getValue: (stats, _dMap, planted, stored) => {
      const set = new Set<string>([...(stats?.grownLv25Ids || []), ...(stats?.maxSpecimensGrownLv25 || [])]);
      [...(planted || []), ...(stored || [])].forEach((b) => {
        if (b.level >= 25) set.add(b.id);
      });
      return set.size;
    },
  },
  {
    id: 'growing_lv50',
    category: 'Growing',
    title: 'Bonsais Grown to Lv.50',
    unit: 'Bonsais',
    targets: [5, 10, 25, 50, 150],
    getValue: (stats, _dMap, planted, stored) => {
      const set = new Set<string>([...(stats?.grownLv50Ids || []), ...(stats?.maxSpecimensGrownLv50 || [])]);
      [...(planted || []), ...(stored || [])].forEach((b) => {
        if (b.level >= 50) set.add(b.id);
      });
      return set.size;
    },
  },
  {
    id: 'growing_lv100',
    category: 'Growing',
    title: 'Bonsais Grown to Lv.100',
    unit: 'Bonsais',
    targets: [5, 10, 25, 50, 100],
    getValue: (stats, _dMap, planted, stored) => {
      const set = new Set<string>(stats?.grownLv100Ids || []);
      [...(planted || []), ...(stored || [])].forEach((b) => {
        if (b.level >= 100) set.add(b.id);
      });
      return set.size;
    },
  },

  // 3. Category: Maturity
  {
    id: 'maturity_sprout_lv10',
    category: 'Maturity',
    title: "Maturity 'Sprout' Grown to Lv.10",
    unit: 'Bonsais',
    targets: [5, 10, 25, 100, 250],
    getValue: (stats, _dMap, planted, stored) => {
      const set = new Set<string>([...(stats?.sproutLv10MilestoneIds || []), ...(stats?.sproutLv10Ids || [])]);
      [...(planted || []), ...(stored || [])].forEach((b) => {
        if ((b.maturity || 'sprout') === 'sprout' && b.level >= 10) set.add(b.id);
      });
      return set.size;
    },
  },
  {
    id: 'maturity_sapling_lv10',
    category: 'Maturity',
    title: "Maturity 'Sapling' Grown to Lv.10",
    unit: 'Bonsais',
    targets: [5, 10, 25, 100, 250],
    getValue: (stats, _dMap, planted, stored) => {
      const set = new Set<string>([...(stats?.saplingLv10MilestoneIds || []), ...(stats?.saplingLv15Ids || [])]);
      [...(planted || []), ...(stored || [])].forEach((b) => {
        if (b.maturity === 'sapling' && b.level >= 10) set.add(b.id);
      });
      return set.size;
    },
  },
  {
    id: 'maturity_notable_lv10',
    category: 'Maturity',
    title: "Maturity 'Notable' Grown to Lv.10",
    unit: 'Bonsais',
    targets: [5, 10, 25, 100, 200],
    getValue: (stats, _dMap, planted, stored) => {
      const set = new Set<string>([...(stats?.notableLv10MilestoneIds || []), ...(stats?.notableLv20Ids || [])]);
      [...(planted || []), ...(stored || [])].forEach((b) => {
        if (b.maturity === 'notable' && b.level >= 10) set.add(b.id);
      });
      return set.size;
    },
  },
  {
    id: 'maturity_refined_lv10',
    category: 'Maturity',
    title: "Maturity 'Refined' Grown to Lv.10",
    unit: 'Bonsais',
    targets: [5, 10, 25, 50, 150],
    getValue: (stats, _dMap, planted, stored) => {
      const set = new Set<string>([...(stats?.refinedLv10MilestoneIds || []), ...(stats?.refinedLv25Ids || [])]);
      [...(planted || []), ...(stored || [])].forEach((b) => {
        if (b.maturity === 'refined' && b.level >= 10) set.add(b.id);
      });
      return set.size;
    },
  },
  {
    id: 'maturity_premium_lv10',
    category: 'Maturity',
    title: "Maturity 'Premium' Grown to Lv.10",
    unit: 'Bonsais',
    targets: [5, 10, 25, 50, 100],
    getValue: (stats, _dMap, planted, stored) => {
      const set = new Set<string>([...(stats?.premiumLv10MilestoneIds || []), ...(stats?.premiumLv30Ids || [])]);
      [...(planted || []), ...(stored || [])].forEach((b) => {
        if (b.maturity === 'premium' && b.level >= 10) set.add(b.id);
      });
      return set.size;
    },
  },

  // 4. Category: Species
  {
    id: 'species_group_raundo',
    category: 'Species',
    title: "Species Group 'Raundo' Style Types grown",
    unit: 'Styles',
    targets: [3, 9, 15, 21, 30],
    getValue: (_stats, discoveredMap) => {
      const keys = ['circle', 'oval', 'circle_hole'];
      return keys.reduce((acc, k) => acc + (discoveredMap?.[k]?.stylesRaised?.length || 0), 0);
    },
  },
  {
    id: 'species_group_erementaru',
    category: 'Species',
    title: "Species Group 'Erementaru' Style Types grown",
    unit: 'Styles',
    targets: [3, 9, 15, 21, 30],
    getValue: (_stats, discoveredMap) => {
      const keys = ['raindrop', 'fire', 'cloud'];
      return keys.reduce((acc, k) => acc + (discoveredMap?.[k]?.stylesRaised?.length || 0), 0);
    },
  },
  {
    id: 'species_group_rokumen',
    category: 'Species',
    title: "Species Group 'Roku-men' Style Types grown",
    unit: 'Styles',
    targets: [3, 9, 15, 21, 30],
    getValue: (_stats, discoveredMap) => {
      const keys = ['hexagon', 'star', 'snowflake'];
      return keys.reduce((acc, k) => acc + (discoveredMap?.[k]?.stylesRaised?.length || 0), 0);
    },
  },
  {
    id: 'species_group_seikatsu',
    category: 'Species',
    title: "Species Group 'Seikatsu' Style Types grown",
    unit: 'Styles',
    targets: [3, 9, 15, 21, 30],
    getValue: (_stats, discoveredMap) => {
      const keys = ['feather', 'snail', 'eye'];
      return keys.reduce((acc, k) => acc + (discoveredMap?.[k]?.stylesRaised?.length || 0), 0);
    },
  },
  {
    id: 'species_group_sanmen',
    category: 'Species',
    title: "Species Group 'Sanmen' Style Types grown",
    unit: 'Styles',
    targets: [4, 12, 20, 28, 40],
    getValue: (_stats, discoveredMap) => {
      const keys = ['triangle', 'arrow', 'shield', 'diamond'];
      return keys.reduce((acc, k) => acc + (discoveredMap?.[k]?.stylesRaised?.length || 0), 0);
    },
  },
  {
    id: 'species_group_shihen',
    category: 'Species',
    title: "Species Group 'Shihen' Style Types grown",
    unit: 'Styles',
    targets: [2, 6, 10, 14, 20],
    getValue: (_stats, discoveredMap) => {
      const keys = ['cube', 'rectangle'];
      return keys.reduce((acc, k) => acc + (discoveredMap?.[k]?.stylesRaised?.length || 0), 0);
    },
  },
  {
    id: 'species_group_jinkoteki',
    category: 'Species',
    title: "Species Group 'Jinkō-teki' Style Types grown",
    unit: 'Styles',
    targets: [2, 6, 10, 14, 20],
    getValue: (_stats, discoveredMap) => {
      const keys = ['gear', 'bell'];
      return keys.reduce((acc, k) => acc + (discoveredMap?.[k]?.stylesRaised?.length || 0), 0);
    },
  },

  // 5. Category: Expeditions
  {
    id: 'expeditions_area1',
    category: 'Expeditions',
    title: 'Area 1 Expeditions done',
    unit: 'Expeditions',
    targets: [5, 10, 25, 50, 100],
    getValue: (stats) => stats?.expeditionsPerBiome?.['FOOTHILLS'] || 0,
  },
  {
    id: 'expeditions_area2',
    category: 'Expeditions',
    title: 'Area 2 Expeditions done',
    unit: 'Expeditions',
    targets: [5, 10, 25, 50, 100],
    getValue: (stats) => stats?.expeditionsPerBiome?.['HIGHLANDS'] || 0,
  },
  {
    id: 'expeditions_area3',
    category: 'Expeditions',
    title: 'Area 3 Expeditions done',
    unit: 'Expeditions',
    targets: [5, 10, 25, 50, 100],
    getValue: (stats) => stats?.expeditionsPerBiome?.['OVERGROWTH'] || 0,
  },
  {
    id: 'expeditions_bonsais',
    category: 'Expeditions',
    title: 'Bonsais brought back',
    unit: 'Bonsais',
    targets: [5, 10, 25, 100, 250],
    getValue: (stats, _dMap, _p, _s, inv) =>
      Math.max(stats?.totalBonsaisBroughtBack || 0, inv?.seedlingList?.length || 0),
  },
  {
    id: 'expeditions_resources',
    category: 'Expeditions',
    title: 'Resources brought back',
    unit: 'Resources',
    targets: [10, 25, 100, 250, 1000],
    getValue: (stats) => stats?.totalResourcesBroughtBack || 0,
  },
  {
    id: 'expeditions_crystals',
    category: 'Expeditions',
    title: 'Crystal Artifacts brought back',
    unit: 'Crystal',
    targets: [1, 3, 6, 10, 25],
    getValue: (stats, _dMap, _p, _s, inv) =>
      Math.max(stats?.totalCrystalsBroughtBack || 0, inv?.crystals?.length || 0),
  },
];

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
  onAwardMilestoneXP?: (amount: number, milestoneTitle: string, blockTierName: string) => void;
  onAwardMilestoneZen?: (amount: number, milestoneTitle: string, blockTierName: string) => void;
  addPlayerXP?: (amount: number, source?: string) => void;
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

export type SocietyModalProps = BonsaiSocietyModalProps;

export default function SocietyModal({
  isOpen,
  onClose,
  masterQuests,
  discoveredSpeciesCount,
  discoveredStylesCount,
  onCompleteDiscoveryTier1,
  onCompleteCompetitionTier1,
  onCompleteEcoTier1,
  stats,
  onAwardMilestoneXP,
  onAwardMilestoneZen,
  addPlayerXP,
  plantedBonsais = [],
  storedPottedBonsais = [],
  discoveredSpeciesMap = {},
  inventory,
}: SocietyModalProps) {
  const [mainTab, setMainTab] = useState<SocietyMainTab>('master_quest');
  const [questBranch, setQuestBranch] = useState<QuestBranch>('discovery');
  const [milestoneFilter, setMilestoneFilter] = useState<'All' | MilestoneCategory>('All');
  const [selectedMilestoneIndex, setSelectedMilestoneIndex] = useState<number>(0);
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<string | null>(
    SOCIETY_MILESTONES[0]?.id || null,
  );
  const milestoneListRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

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

  // Filtered Milestones list
  const filteredMilestones = useMemo(() => {
    if (milestoneFilter === 'All') return SOCIETY_MILESTONES;
    return SOCIETY_MILESTONES.filter((m) => m.category === milestoneFilter);
  }, [milestoneFilter]);

  // Total Player XP earned from milestones
  const totalMilestoneXpEarned = useMemo(() => {
    let sum = 0;
    if (!stats?.claimedMilestoneBlocks) return 0;
    Object.values(stats.claimedMilestoneBlocks).forEach((tierIndices) => {
      tierIndices.forEach((t) => {
        sum += BLOCK_REWARDS[t] || 0;
      });
    });
    return sum;
  }, [stats?.claimedMilestoneBlocks]);

  // Clamp selected milestone index and sync selectedMilestoneId when filter changes
  useEffect(() => {
    setSelectedMilestoneIndex((prev) => {
      const clamped = Math.min(prev, Math.max(0, filteredMilestones.length - 1));
      setSelectedMilestoneId(filteredMilestones[clamped]?.id || null);
      return clamped;
    });
  }, [filteredMilestones]);

  // Smooth scroll to selected milestone whenever selection changes in milestones tab
  useEffect(() => {
    if (mainTab !== 'milestones') return;
    const targetEl = itemRefs.current[selectedMilestoneIndex];
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [selectedMilestoneIndex, mainTab]);

  // AUTOMATIC THRESHOLD COMPLETION & XP PAYOUT EVALUATION
  useEffect(() => {
    if (!isOpen || !stats) return;

    let totalAwarded = 0;
    let lastTitle = '';
    let lastTier = '';

    SOCIETY_MILESTONES.forEach((ms) => {
      if (ms.isNotObtainable) return;

      const curVal = ms.getValue(stats, discoveredSpeciesMap, plantedBonsais, storedPottedBonsais, inventory);
      const claimed = stats.claimedMilestoneBlocks?.[ms.id] || [];

      for (let t = 0; t < 5; t++) {
        const threshold = ms.targets[t];
        if (curVal >= threshold && !claimed.includes(t)) {
          claimed.push(t);
          const reward = BLOCK_REWARDS[t];
          totalAwarded += reward;
          lastTitle = ms.title;
          lastTier = TIER_LABELS[t];
        }
      }

      if (!stats.claimedMilestoneBlocks) stats.claimedMilestoneBlocks = {};
      stats.claimedMilestoneBlocks[ms.id] = claimed;
    });

    if (totalAwarded > 0) {
      gameAudio?.playLevelUpStinger?.();
      if (addPlayerXP) {
        addPlayerXP(totalAwarded, `Milestone: ${lastTitle}`);
      }
      if (onAwardMilestoneXP) {
        onAwardMilestoneXP(totalAwarded, lastTitle, lastTier);
      } else if (onAwardMilestoneZen) {
        onAwardMilestoneZen(totalAwarded, lastTitle, lastTier);
      }
    }
  }, [
    isOpen,
    stats,
    discoveredSpeciesMap,
    plantedBonsais,
    storedPottedBonsais,
    inventory,
    addPlayerXP,
    onAwardMilestoneXP,
    onAwardMilestoneZen,
  ]);

  // Keyboard navigation & focus management
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (mainTab === 'milestones') {
        if (e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp') {
          e.preventDefault();
          e.stopPropagation();
          setSelectedMilestoneIndex((i) => {
            const next = Math.max(0, i - 1);
            if (next !== i) {
              setSelectedMilestoneId(filteredMilestones[next]?.id || null);
              gameAudio?.playHoverMicroTone?.();
            }
            return next;
          });
          return;
        } else if (e.key === 's' || e.key === 'S' || e.key === 'ArrowDown') {
          e.preventDefault();
          e.stopPropagation();
          setSelectedMilestoneIndex((i) => {
            const next = Math.min(filteredMilestones.length - 1, i + 1);
            if (next !== i) {
              setSelectedMilestoneId(filteredMilestones[next]?.id || null);
              gameAudio?.playHoverMicroTone?.();
            }
            return next;
          });
          return;
        }
      }

      if (e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        e.stopPropagation();
        if (mainTab === 'master_quest') {
          const branches: QuestBranch[] = ['discovery', 'competition', 'eco'];
          setQuestBranch((b) => branches[(branches.indexOf(b) - 1 + branches.length) % branches.length]);
        } else {
          setMainTab('master_quest');
        }
        gameAudio?.playCrispClick?.();
      } else if (e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        e.stopPropagation();
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

    window.addEventListener('keydown', handleKeyDown, { capture: true });
    return () => window.removeEventListener('keydown', handleKeyDown, { capture: true });
  }, [isOpen, mainTab, questBranch, filteredMilestones, onClose]);

  // Gamepad integration: bumper tab cycling & D-pad / stick milestone navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleBumper = (e: Event) => {
      const custom = e as CustomEvent<{ direction: 'left' | 'right' }>;
      if (custom.detail.direction === 'left') {
        if (mainTab === 'milestones') {
          setMainTab('master_quest');
        } else {
          const branches: QuestBranch[] = ['discovery', 'competition', 'eco'];
          setQuestBranch((b) => branches[(branches.indexOf(b) - 1 + branches.length) % branches.length]);
        }
        gameAudio?.playCrispClick?.();
      } else {
        if (mainTab === 'master_quest') {
          setMainTab('milestones');
        }
        gameAudio?.playCrispClick?.();
      }
    };
    window.addEventListener('gamepad-bumper', handleBumper);

    let animId: number;
    let lastStickY = 0;
    let lastDpadUp = false;
    let lastDpadDown = false;
    let cooldown = 0;

    const pollGamepad = () => {
      if (mainTab === 'milestones' && typeof navigator !== 'undefined' && navigator.getGamepads) {
        const gamepads = navigator.getGamepads();
        for (let i = 0; i < gamepads.length; i++) {
          const gp = gamepads[i];
          if (gp && gp.connected) {
            const axes = gp.axes || [];
            const buttons = gp.buttons || [];
            const axisY = axes[1] ?? 0;
            const dpadUp = buttons[12]?.pressed ?? false;
            const dpadDown = buttons[13]?.pressed ?? false;

            const now = Date.now();
            if (now > cooldown) {
              if ((axisY < -0.5 && lastStickY >= -0.5) || (dpadUp && !lastDpadUp)) {
                setSelectedMilestoneIndex((idx) => {
                  const next = Math.max(0, idx - 1);
                  if (next !== idx) {
                    setSelectedMilestoneId(filteredMilestones[next]?.id || null);
                    gameAudio?.playHoverMicroTone?.();
                  }
                  return next;
                });
                cooldown = now + 180;
              } else if ((axisY > 0.5 && lastStickY <= 0.5) || (dpadDown && !lastDpadDown)) {
                setSelectedMilestoneIndex((idx) => {
                  const next = Math.min(filteredMilestones.length - 1, idx + 1);
                  if (next !== idx) {
                    setSelectedMilestoneId(filteredMilestones[next]?.id || null);
                    gameAudio?.playHoverMicroTone?.();
                  }
                  return next;
                });
                cooldown = now + 180;
              }
            }

            lastStickY = axisY;
            lastDpadUp = dpadUp;
            lastDpadDown = dpadDown;
            break;
          }
        }
      }
      animId = requestAnimationFrame(pollGamepad);
    };

    animId = requestAnimationFrame(pollGamepad);

    return () => {
      window.removeEventListener('gamepad-bumper', handleBumper);
      cancelAnimationFrame(animId);
    };
  }, [isOpen, mainTab, filteredMilestones]);

  /**
   * Dedicated render helper for individual milestone cards:
   * - Interactive & selectable (clickable, keyboard navigable, visual focus ring)
   * - Two-line threshold blocks without "Block X" labels (Line 1: Target, Line 2: Reward status)
   */
  const renderMilestoneCard = (ms: MilestoneDef, idx: number) => {
    const curVal = stats ? ms.getValue(stats, discoveredSpeciesMap, plantedBonsais, storedPottedBonsais, inventory) : 0;
    const claimed = stats?.claimedMilestoneBlocks?.[ms.id] || [];
    const earnedFromMs = claimed.reduce((sum, t) => sum + (BLOCK_REWARDS[t] || 0), 0);
    const maxTarget = ms.targets[4];
    const isSelected = selectedMilestoneId === ms.id || selectedMilestoneIndex === idx;

    // Visual Fog of War / Masking:
    // Only show objective for current milestone block and already achieved blocks.
    // Following unreached blocks strictly show "???" until preceding block has been achieved!
    const currentAchievedCount = ms.isNotObtainable
      ? 0
      : Math.max(claimed.length, ms.targets.filter((tgt) => curVal >= tgt).length);

    // Category Badge Styling
    const catBadgeStyles: Record<MilestoneCategory, string> = {
      Bondex: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50',
      Growing: 'bg-green-950/80 text-green-300 border-green-500/50',
      Maturity: 'bg-amber-950/80 text-amber-300 border-amber-500/50',
      Species: 'bg-purple-950/80 text-purple-300 border-purple-500/50',
      Expeditions: 'bg-sky-950/80 text-sky-300 border-sky-500/50',
    };

    return (
      <div
        key={ms.id}
        ref={(el) => {
          itemRefs.current[idx] = el;
        }}
        tabIndex={0}
        role="button"
        aria-selected={isSelected}
        onClick={() => {
          setSelectedMilestoneIndex(idx);
          setSelectedMilestoneId(ms.id);
          gameAudio?.playHoverMicroTone?.();
        }}
        onFocus={() => {
          setSelectedMilestoneIndex(idx);
          setSelectedMilestoneId(ms.id);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setSelectedMilestoneIndex(idx);
            setSelectedMilestoneId(ms.id);
            gameAudio?.playConfirmSelect?.();
          }
        }}
        className={`rounded-2xl p-2.5 sm:p-3 flex flex-col gap-2 transition-all cursor-pointer focus:outline-none ${
          isSelected
            ? 'bg-slate-850 border-2 border-emerald-400 ring-2 ring-emerald-400/50 shadow-[0_0_15px_rgba(52,211,153,0.25)] scale-[1.008]'
            : 'bg-slate-900/90 border border-slate-800/90 hover:border-slate-700 hover:bg-slate-850/60'
        } ${ms.isNotObtainable ? 'opacity-50 pointer-events-none' : ''}`}>
        {/* TOP ROW: Category badge, Title, Progress Count / Target, and Total Player XP Earned */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2 min-w-0">
            <span className={`text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full border shrink-0 ${catBadgeStyles[ms.category]}`}>
              {ms.category}
            </span>
            <h4 className="font-bold text-xs sm:text-sm text-slate-100 truncate flex items-center gap-1">
              {isSelected && <span className="text-emerald-400 font-bold shrink-0">►</span>}
              <span className="truncate">{ms.title}</span>
            </h4>
            {ms.isNotObtainable && (
              <span className="text-[10px] text-slate-400 font-semibold bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                (Greyed out - not yet obtainable)
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 shrink-0 text-xs font-mono">
            <div className="text-slate-300">
              {ms.isNotObtainable ? (
                <span className="text-slate-500">0 / {maxTarget} {ms.unit}</span>
              ) : (
                <>
                  <strong className="text-amber-300">{curVal}</strong>
                  <span className="text-slate-500"> / </span>
                  <span className="text-slate-400">
                    {currentAchievedCount < 5 ? `${ms.targets[currentAchievedCount]} ${ms.unit}` : `${maxTarget} ${ms.unit}`}
                  </span>
                  {curVal >= maxTarget && <span className="text-emerald-400 font-bold ml-1">✓</span>}
                </>
              )}
            </div>

            <div className="bg-slate-950/90 border border-emerald-500/50 px-2 py-0.5 rounded-lg text-emerald-300 font-bold text-[11px] flex items-center gap-1 shadow-sm">
              <span>⚡</span>
              <span>{earnedFromMs} / 1360 XP</span>
            </div>
          </div>
        </div>

        {/* BOTTOM ROW: TWO-LINE THRESHOLD BLOCKS WITH VISUAL FOG OF WAR (??? ON FUTURE BLOCKS) */}
        <div className="grid grid-cols-5 gap-1.5 sm:gap-2 w-full">
          {ms.targets.map((tgt, tierIdx) => {
            const isComplete = !ms.isNotObtainable && curVal >= tgt;
            const rewardXP = BLOCK_REWARDS[tierIdx];
            const isRevealed = tierIdx <= currentAchievedCount;
            const objectiveText = isRevealed ? `${tgt} ${ms.unit}` : '???';

            // Completion gradient styling according to tier (Bronze, Silver, Gold, Platinum, Diamond)
            const tierCompletedClasses = [
              'bg-gradient-to-b from-amber-800 to-amber-700 border-amber-500 text-amber-100 shadow-sm',
              'bg-gradient-to-b from-slate-400 to-slate-300 border-slate-100 text-slate-900 shadow-sm',
              'bg-gradient-to-b from-yellow-500 to-amber-400 border-yellow-200 text-amber-950 font-bold shadow-md',
              'bg-gradient-to-b from-teal-300 to-cyan-200 border-cyan-100 text-cyan-950 font-bold shadow-md',
              'bg-gradient-to-b from-sky-400 via-indigo-300 to-purple-400 border-white text-indigo-950 font-bold shadow-lg shadow-indigo-500/20',
            ];

            return (
              <div
                key={tierIdx}
                className={`flex flex-col items-center justify-center py-1 sm:py-1.5 px-1 sm:px-1.5 rounded-lg sm:rounded-xl border text-center transition-all min-h-[38px] sm:min-h-[42px] ${
                  isComplete
                    ? tierCompletedClasses[tierIdx]
                    : isRevealed
                    ? 'bg-slate-900/90 border-slate-700 text-slate-300 ring-1 ring-emerald-500/30'
                    : 'bg-slate-950/60 border-slate-850 text-slate-600'
                }`}>
                {/* Line 1: Threshold target requirement or ??? if locked behind fog of war */}
                <div className={`text-[10px] sm:text-xs leading-tight truncate max-w-full font-bold ${
                  isRevealed ? '' : 'tracking-widest font-mono text-slate-500'
                }`}>
                  {objectiveText}
                </div>

                {/* Line 2: Player XP reward (+10 XP, +25 XP, +75 XP, +250 XP, +1000 XP) */}
                <div
                  className={`text-[9px] sm:text-[10px] font-mono leading-tight flex items-center justify-center gap-0.5 mt-0.5 ${
                    isComplete
                      ? 'font-black opacity-95'
                      : isRevealed
                      ? 'font-bold text-emerald-400'
                      : 'font-semibold text-slate-500'
                  }`}>
                  {isComplete ? `✓ +${rewardXP} XP` : `+${rewardXP} XP`}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

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

      {/* PRIMARY SUBMENU TABS: [Bonsai Master Quest] vs [Milestones] (Clean tab buttons without pill badges) */}
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
          <span>Bonsai Master Quest</span>
        </button>

        <button
          onClick={() => {
            setMainTab('milestones');
            gameAudio?.playCrispClick?.();
          }}
          className={`py-2 px-3 rounded-2xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 transition-all shadow relative cursor-pointer ${
            mainTab === 'milestones'
              ? 'bg-gradient-to-r from-amber-600 via-yellow-600 to-pink-600 text-white ring-2 ring-amber-400/50 shadow-lg'
              : 'bg-slate-900/90 text-slate-400 hover:bg-slate-850 border border-slate-800'
          }`}>
          <Award className="w-4 h-4 text-yellow-300" />
          <span>Milestones</span>
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
                    <span className="text-emerald-400 font-bold">
                      Unlocks new blueprints &amp; skills
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
                    <span className="text-sky-400 font-bold">
                      Unlocks new blueprints &amp; skills
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
                    <span className="text-amber-300 font-bold">
                      Unlocks new blueprints &amp; skills
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
      {/* SUBMENU 2: STREAMLINED SELECTABLE & SMOOTHLY SCROLLABLE MILESTONES */}
      {/* ========================================================================= */}
      {mainTab === 'milestones' && (
        <div className="flex-1 flex flex-col min-h-0 space-y-2.5">
          {/* CATEGORY FILTER CHIPS: "All", "Bondex", "Growing", "Maturity", "Species", "Expeditions" */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 shrink-0 scrollbar-none">
            {(['All', 'Bondex', 'Growing', 'Maturity', 'Species', 'Expeditions'] as const).map((cat) => {
              const isSelected = milestoneFilter === cat;
              const countInCat = cat === 'All'
                ? SOCIETY_MILESTONES.length
                : SOCIETY_MILESTONES.filter((m) => m.category === cat).length;

              return (
                <button
                  key={cat}
                  onClick={() => {
                    setMilestoneFilter(cat);
                    setSelectedMilestoneIndex(0);
                    gameAudio?.playCrispClick?.();
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 border flex items-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? 'bg-amber-500 text-slate-950 border-amber-300 font-black shadow-md'
                      : 'bg-slate-900/90 text-slate-300 border-slate-800 hover:border-slate-700'
                  }`}>
                  <span>{cat}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                      isSelected
                        ? 'bg-slate-950 text-amber-300'
                        : 'bg-slate-950 text-slate-400'
                    }`}>
                    {countInCat}
                  </span>
                </button>
              );
            })}

            <div className="ml-auto text-xs font-bold text-amber-300 flex items-center gap-1.5 shrink-0 pl-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Total: +{totalMilestoneXpEarned} XP • Auto-payout</span>
            </div>
          </div>

          {/* 27 MILESTONES LIST: STREAMLINED, SELECTABLE, SMOOTHLY SCROLLABLE */}
          <div
            ref={milestoneListRef}
            tabIndex={0}
            data-scrollable="true"
            className="flex-1 min-h-0 space-y-2 overflow-y-auto overscroll-contain touch-pan-y pr-1.5 scroll-smooth max-h-[calc(100vh-14rem)] sm:max-h-[calc(100vh-15rem)] focus:outline-none">
            {filteredMilestones.map((ms, idx) => renderMilestoneCard(ms, idx))}
          </div>
        </div>
      )}

      {/* Footer Hotkeys Strip */}
      <div className="pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 shrink-0 mt-2">
        <span className="font-mono text-amber-400 text-[11px] hidden sm:inline">
          🎮 {mainTab === 'milestones' ? '[W/S / ↑↓ / D-Pad] Select Milestone • ' : ''}[A/D / LB/RB] Switch Submenus • [Esc / B] Close
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
