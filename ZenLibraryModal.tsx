import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Award,
  BookOpen,
  Check,
  ChevronRight,
  Compass,
  Layers,
  Lock,
  Sparkles,
  Sprout,
  X,
  Zap,
  Tag,
  Info,
  Shield,
} from 'lucide-react';
import {
  BonsaiGroup,
  BonsaiLeafType,
  BonsaiStyle,
  MaturityTier,
  BONSAI_GROUPS,
  LEAF_TYPE_CONFIGS,
  MATURITY_CONFIGS,
  AREA_SPECIES_DISTRIBUTION,
  getLeafTypeDef,
  getMaturityDef,
  getSpeciesName,
  getBonsaiDisplayName,
  drawLeafShape,
  renderLeafFoliage,
  drawBonsaiTrunkAndCanopy,
} from './bonsaiData';
import { gameAudio } from './utils/helper';
import {
  DeployedStructure,
  GameStats,
  PlantedBonsai,
  SanctuaryInventory,
  StoredPottedBonsai,
  ZenSkills,
  getBonsaiGroupBadgeClass,
  getBonsaiStyleDef,
  getExpRequiredForLevel,
} from './App';
import { BlueprintDef } from './blueprints';
import BlueprintsCatalogView from './BlueprintsCatalogView';
import {
  ZEN_SKILLS_DATA,
  SKILL_BY_ID,
  SkillCategory,
  SkillDefinition,
} from './skillsData';
import { MasterQuestsState } from './types';

export type ShrineTab = 'bondex' | 'blueprints' | 'skills';

export interface BondexSpeciesEntry {
  num: string;
  id: BonsaiLeafType;
}

export const BONDEX_SPECIES_LIST: BondexSpeciesEntry[] = [
  { num: '#001', id: 'circle' },
  { num: '#002', id: 'oval' },
  { num: '#003', id: 'circle_hole' },
  { num: '#004', id: 'raindrop' },
  { num: '#005', id: 'fire' },
  { num: '#006', id: 'cloud' },
  { num: '#007', id: 'hexagon' },
  { num: '#008', id: 'star' },
  { num: '#009', id: 'snowflake' },
  { num: '#010', id: 'feather' },
  { num: '#011', id: 'snail' },
  { num: '#012', id: 'eye' },
  { num: '#013', id: 'triangle' },
  { num: '#014', id: 'arrow' },
  { num: '#015', id: 'shield' },
  { num: '#016', id: 'diamond' },
  { num: '#017', id: 'cube' },
  { num: '#018', id: 'rectangle' },
  { num: '#019', id: 'gear' },
  { num: '#020', id: 'bell' },
];

/**
 * Helper to determine player's highest completed Master Quest branch rank (0, 1, 2, or 3)
 */
export function getMaxMasterQuestBranchRank(masterQuests?: MasterQuestsState | any): number {
  if (!masterQuests) return 0;
  const getBranchMax = (b: any) => {
    if (!b) return 0;
    if (typeof b.completedRank === 'number') return b.completedRank;
    if (b.tier3Completed || b.rank3Completed || b.rank >= 4) return 3;
    if (b.tier2Completed || b.rank2Completed || b.rank >= 3) return 2;
    if (b.tier1Completed || b.rank1Completed || b.rank >= 2) return 1;
    if (typeof b.completedTier === 'number') return b.completedTier;
    return 0;
  };
  return Math.max(
    getBranchMax(masterQuests.discovery),
    getBranchMax(masterQuests.competition),
    getBranchMax(masterQuests.eco),
  );
}

/**
 * Returns the biomes and probability percentages where a species can be encountered.
 */
export function getSpeciesBiomeEncounters(leafType: BonsaiLeafType): {
  biomeId: string;
  name: string;
  percent: number;
}[] {
  const encounters: { biomeId: string; name: string; percent: number }[] = [];
  const biomeNames: Record<string, string> = {
    FOOTHILLS: 'Sunlit Foothills',
    HIGHLANDS: 'Misty Highlands',
    OVERGROWTH: 'Ancient Caldera',
  };

  for (const [bId, dist] of Object.entries(AREA_SPECIES_DISTRIBUTION)) {
    const chance = dist[leafType];
    if (chance !== undefined && chance > 0) {
      encounters.push({
        biomeId: bId,
        name: biomeNames[bId] || bId,
        percent: Math.round(chance * 100),
      });
    }
  }

  return encounters;
}

/**
 * Vector leaf thumbnail for Bondex species list item (#001 - #020)
 */
export function BondexLeafThumbnail({
  leafType,
  color,
  accentColor,
}: {
  leafType: BonsaiLeafType;
  color: string;
  accentColor: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const w = 32;
    const h = 32;
    canvas.width = w * 2;
    canvas.height = h * 2;
    ctx.setTransform(2, 0, 0, 2, 0, 0);
    ctx.clearRect(0, 0, w, h);

    renderLeafFoliage(ctx, 16, 16, 9.5, leafType, color, accentColor);
  }, [leafType, color, accentColor]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: 32, height: 32 }}
      width={64}
      height={64}
      className="pointer-events-none shrink-0"
    />
  );
}

/**
 * Live Procedural Canvas Preview for the Bondex Pokédex Display
 */
export function BondexStylePreviewCanvas({
  leafType,
  styleKey,
  color,
  accentColor,
  isUndiscovered,
  isStyleUnlogged,
  width = 240,
  height = 200,
}: {
  leafType: BonsaiLeafType;
  styleKey: BonsaiStyle;
  color: string;
  accentColor: string;
  isUndiscovered?: boolean;
  isStyleUnlogged?: boolean;
  width?: number;
  height?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = width;
    const h = height;
    canvas.width = w * 2;
    canvas.height = h * 2;
    ctx.setTransform(2, 0, 0, 2, 0, 0);
    ctx.clearRect(0, 0, w, h);

    // Dark LCD screen backdrop with radial glow
    const bgGrad = ctx.createRadialGradient(w / 2, h / 2, 8, w / 2, h / 2, w * 0.6);
    if (isUndiscovered) {
      bgGrad.addColorStop(0, '#0f172a');
      bgGrad.addColorStop(1, '#020617');
    } else if (isStyleUnlogged) {
      bgGrad.addColorStop(0, '#0f172a');
      bgGrad.addColorStop(0.7, '#1e1b4b1a');
      bgGrad.addColorStop(1, '#020617');
    } else {
      bgGrad.addColorStop(0, 'rgba(15, 23, 42, 0.95)');
      bgGrad.addColorStop(0.7, 'rgba(6, 78, 59, 0.25)');
      bgGrad.addColorStop(1, 'rgba(2, 6, 23, 0.98)');
    }
    ctx.fillStyle = bgGrad;
    ctx.beginPath();
    ctx.roundRect(0, 0, w, h, 14);
    ctx.fill();

    // Subtle CRT scanline overlay
    ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
    for (let y = 0; y < h; y += 4) {
      ctx.fillRect(0, y, w, 1.5);
    }

    // Outer cyber-glass border
    ctx.strokeStyle = isUndiscovered
      ? 'rgba(71, 85, 105, 0.4)'
      : isStyleUnlogged
      ? 'rgba(245, 158, 11, 0.35)'
      : 'rgba(52, 211, 153, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    const bx = w / 2;
    const by = h - 36;
    const stageScale = 0.95;
    const trunkHeight = 52 * stageScale;
    const trunkThickness = 6.5 * stageScale;

    if (isUndiscovered) {
      ctx.fillStyle = 'rgba(30, 41, 59, 0.6)';
      ctx.beginPath();
      ctx.ellipse(bx, by + 12, 34, 7, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.roundRect(bx - 32, by - 4, 64, 16, [3, 3, 6, 6]);
      ctx.fill();

      ctx.strokeStyle = '#334155';
      ctx.lineWidth = trunkThickness;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(bx, by - 4);
      ctx.lineTo(bx, by - 4 - trunkHeight);
      ctx.stroke();

      ctx.fillStyle = '#334155';
      ctx.beginPath();
      ctx.arc(bx, by - 4 - trunkHeight - 4, 26, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#64748b';
      ctx.font = 'bold 36px system-ui';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('?', bx, by - 4 - trunkHeight - 4);
      return;
    }

    // Pot ground shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
    ctx.beginPath();
    ctx.ellipse(bx, by + 14, 40, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Ceramic pot body
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.roundRect(bx - 38, by - 4, 76, 20, [3, 3, 7, 7]);
    ctx.fill();
    ctx.strokeStyle = isStyleUnlogged ? '#334155' : 'rgba(255, 255, 255, 0.35)';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    ctx.fillStyle = isStyleUnlogged ? 'rgba(51, 65, 85, 0.3)' : 'rgba(255, 255, 255, 0.15)';
    ctx.fillRect(bx - 36, by - 4, 72, 3);

    ctx.fillStyle = isStyleUnlogged ? '#0f172a' : '#3b1802';
    ctx.beginPath();
    ctx.ellipse(bx, by - 3, 34, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    drawBonsaiTrunkAndCanopy(
      ctx,
      bx,
      by,
      stageScale,
      trunkHeight,
      trunkThickness,
      styleKey,
      leafType,
      color,
      accentColor,
      isStyleUnlogged,
    );

    if (!isStyleUnlogged) {
      if (leafType === 'star') {
        ctx.fillStyle = '#fef08a';
        for (let s = 0; s < 5; s++) {
          const sx = bx + Math.sin(s * 1.8) * 32 * stageScale;
          const sy = by - 4 - trunkHeight * 0.7 + Math.cos(s * 2.2) * 20 * stageScale;
          ctx.beginPath();
          ctx.arc(sx, sy, 2.2, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (leafType === 'fire') {
        ctx.fillStyle = '#facc15';
        for (let s = 0; s < 4; s++) {
          const sx = bx + Math.sin(s * 1.5) * 28 * stageScale;
          const sy = by - 4 - trunkHeight * 0.75 + Math.cos(s * 1.7) * 18 * stageScale;
          ctx.beginPath();
          ctx.arc(sx, sy, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    } else {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
      ctx.beginPath();
      ctx.roundRect(w / 2 - 58, 10, 116, 20, 6);
      ctx.fill();
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.5)';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = '#f59e0b';
      ctx.font = 'bold 10px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🔒 Style Unlogged', w / 2, 20);
    }
  }, [leafType, styleKey, color, accentColor, isUndiscovered, isStyleUnlogged, width, height]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width, height }}
      className="rounded-2xl border border-slate-700/80 bg-slate-950/95 shadow-inner"
    />
  );
}

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

export interface ZenLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  zenEssence: number;
  playerLevel: number;
  playerExp: number;
  zenSkills: ZenSkills;
  upgradeZenSkill: (key: keyof ZenSkills) => void;
  unlockedBlueprints?: string[];
  verdureBalance?: number;
  onPurchaseBlueprint?: (blueprint: BlueprintDef) => void;
  plantedBonsais?: PlantedBonsai[];
  storedPottedBonsais?: StoredPottedBonsai[];
  discoveredSpeciesMap: Record<
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
  discoveredAreaSpecies?: Record<string, BonsaiLeafType[]>;
  stats?: GameStats;
  claimAchievement?: (achId: string, rewardZen: number, title: string) => void;
  masterQuests?: MasterQuestsState;
  masterQuest?: MasterQuestsState;
}

export default function ZenLibraryModal({
  isOpen,
  onClose,
  zenEssence,
  playerLevel,
  playerExp,
  zenSkills,
  upgradeZenSkill,
  unlockedBlueprints = [],
  verdureBalance = 0,
  onPurchaseBlueprint,
  discoveredSpeciesMap,
  discoveredAreaSpecies,
  masterQuests,
  masterQuest,
}: ZenLibraryModalProps) {
  // Primary Tabs: ['bondex', 'blueprints', 'skills']
  const [activeTab, setActiveTab] = useState<ShrineTab>('skills');

  // Bondex Filter and Selected Species State
  const [selectedGroupFilter, setSelectedGroupFilter] = useState<string>('ALL');
  const [selectedSpeciesIndex, setSelectedSpeciesIndex] = useState<number>(0);
  const [viewerStyle, setViewerStyle] = useState<BonsaiStyle>('MOYOGI');

  // Skills Category Filter: 'ALL' | 'Expedition' | 'Growing' | 'Economy & Energy' | 'Competition'
  const [selectedSkillCategory, setSelectedSkillCategory] = useState<'ALL' | SkillCategory>('ALL');

  const effectiveMasterQuests = masterQuests || masterQuest;

  // Highest completed branch rank across all 3 branches (Discovery, Competition, Eco)
  const maxCompletedBranchRank = useMemo(() => {
    return getMaxMasterQuestBranchRank(effectiveMasterQuests);
  }, [effectiveMasterQuests]);

  // Filter skills by Category
  const filteredSkills = useMemo(() => {
    return ZEN_SKILLS_DATA.filter((skill) => {
      if (selectedSkillCategory !== 'ALL' && skill.category !== selectedSkillCategory) {
        return false;
      }
      return true;
    });
  }, [selectedSkillCategory]);

  // Category counts for quick tabs
  const categoryCounts = useMemo(() => {
    const counts = {
      ALL: ZEN_SKILLS_DATA.length,
      Expedition: 0,
      Growing: 0,
      'Economy & Energy': 0,
      Competition: 0,
    };
    ZEN_SKILLS_DATA.forEach((s) => {
      counts[s.category] += 1;
    });
    return counts;
  }, []);

  // Handle Gamepad Bumper tab cycling & Keyboard Navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const tabs: ShrineTab[] = ['bondex', 'blueprints', 'skills'];

      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        const idx = tabs.indexOf(activeTab);
        const nextIdx = (idx - 1 + tabs.length) % tabs.length;
        setActiveTab(tabs[nextIdx]);
        gameAudio.playCrispClick();
      } else if (e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        const idx = tabs.indexOf(activeTab);
        const nextIdx = (idx + 1) % tabs.length;
        setActiveTab(tabs[nextIdx]);
        gameAudio.playCrispClick();
      }
    };

    const handleBumper = (e: Event) => {
      const ce = e as CustomEvent<{ direction: 'left' | 'right' }>;
      const dir = ce.detail?.direction;
      const tabs: ShrineTab[] = ['bondex', 'blueprints', 'skills'];
      setActiveTab((cur) => {
        const idx = tabs.indexOf(cur);
        const nextIdx = dir === 'right' ? (idx + 1) % tabs.length : (idx - 1 + tabs.length) % tabs.length;
        return tabs[nextIdx];
      });
      gameAudio.playCrispClick();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('gamepad-bumper', handleBumper);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('gamepad-bumper', handleBumper);
    };
  }, [isOpen, activeTab, onClose]);

  // Calculate Bondex Discovery Statistics
  let discoveredSpeciesCount = 0;
  let totalStylesLoggedCount = 0;

  BONDEX_SPECIES_LIST.forEach((sp) => {
    const entry = discoveredSpeciesMap[sp.id];
    if (entry && entry.discovered) {
      discoveredSpeciesCount += 1;
      totalStylesLoggedCount += entry.stylesRaised ? entry.stylesRaised.length : 0;
    }
  });

  const selectedEntry = BONDEX_SPECIES_LIST[selectedSpeciesIndex] || BONDEX_SPECIES_LIST[0];
  const selectedDef = getLeafTypeDef(selectedEntry.id);
  const selectedDiscovery = discoveredSpeciesMap[selectedEntry.id];
  const isSelectedDiscovered = selectedDiscovery ? selectedDiscovery.discovered : false;
  const selectedHighestMaturity = selectedDiscovery?.highestMaturity || 'sprout';
  const selectedMatDef = getMaturityDef(selectedHighestMaturity);
  const selectedRaisedStyles = selectedDiscovery?.stylesRaised || [];
  const selectedBiomes = getSpeciesBiomeEncounters(selectedEntry.id);

  const revealedBiomes = selectedBiomes.filter(
    (bio) =>
      discoveredAreaSpecies &&
      (discoveredAreaSpecies[bio.biomeId] || []).includes(selectedEntry.id),
  );

  const filteredBondexList =
    selectedGroupFilter === 'ALL'
      ? BONDEX_SPECIES_LIST
      : BONDEX_SPECIES_LIST.filter((sp) => {
          const def = getLeafTypeDef(sp.id);
          return def.group === selectedGroupFilter;
        });

  if (!isOpen) return null;

  return (
    <div className="fixed top-12 left-0 right-0 bottom-0 z-40 bg-slate-950/95 backdrop-blur-md p-3 sm:p-5 flex flex-col overflow-hidden border-t border-slate-800 text-left">
      {/* LIBRARY HEADER */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2.5 shrink-0 flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-pink-950/80 border-2 border-pink-500/70 flex items-center justify-center text-pink-300 shadow">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-pink-300 tracking-wide">📚 Zen Library</h3>
            <p className="text-[10.5px] text-slate-400">
              Botanical Bondex Compendium, Blueprints Catalog &amp; 36 Zen Mastery Skills
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* THREE PRIMARY TABS: ['Bondex', 'Blueprints', 'Skills'] */}
      <div className="grid grid-cols-3 gap-2 mb-2.5 shrink-0">
        <button
          onClick={() => {
            setActiveTab('bondex');
            gameAudio.playCrispClick();
          }}
          className={`py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all shadow cursor-pointer ${
            activeTab === 'bondex'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white ring-2 ring-emerald-400/50'
              : 'bg-slate-800 text-slate-400 hover:bg-slate-750'
          }`}>
          <BookOpen className="w-4 h-4 text-emerald-300" />
          <span>📖 Bondex</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('blueprints');
            gameAudio.playCrispClick();
          }}
          className={`py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all shadow cursor-pointer ${
            activeTab === 'blueprints'
              ? 'bg-gradient-to-r from-lime-600 to-emerald-600 text-white ring-2 ring-lime-400/50'
              : 'bg-slate-800 text-slate-400 hover:bg-slate-750'
          }`}>
          <BookOpen className="w-4 h-4 text-lime-300" />
          <span>📜 Blueprints</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('skills');
            gameAudio.playCrispClick();
          }}
          className={`py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all shadow cursor-pointer ${
            activeTab === 'skills'
              ? 'bg-pink-600 text-white ring-2 ring-pink-400/50'
              : 'bg-slate-800 text-slate-400 hover:bg-slate-750'
          }`}>
          <Award className="w-4 h-4 text-pink-300" />
          <span>🌸 Skills</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1 CONTENT: COMPACT, STREAMLINED POKÉDEX-STYLE "BONDEX" COMPENDIUM */}
      {/* ========================================================================= */}
      {activeTab === 'bondex' && (
        <div className="flex-1 flex flex-col min-h-0 space-y-2">
          {/* Progress Status Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-900/80 border border-emerald-500/40 px-3 py-1.5 rounded-xl text-xs shrink-0 shadow-sm">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse" />
              <span className="font-bold text-slate-200 text-xs">Botanical Bondex</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="bg-slate-950/90 border border-emerald-500/60 px-2.5 py-0.5 rounded-lg text-emerald-300 font-bold font-mono text-[11px] shadow-sm">
                🌿 {discoveredSpeciesCount} / 20 Species Discovered ({Math.round((discoveredSpeciesCount / 20) * 100)}%)
              </div>
              <div className="bg-slate-950/90 border border-amber-500/60 px-2.5 py-0.5 rounded-lg text-amber-300 font-bold font-mono text-[11px] shadow-sm">
                🎋 {totalStylesLoggedCount} / 200 Styles
              </div>
            </div>
          </div>

          {/* TREE TYPE GROUP (TTG) FILTER CHIPS */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 shrink-0 scrollbar-none">
            <button
              onClick={() => {
                setSelectedGroupFilter('ALL');
                gameAudio.playCrispClick();
              }}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all shrink-0 border cursor-pointer ${
                selectedGroupFilter === 'ALL'
                  ? 'bg-slate-100 text-slate-950 border-white shadow'
                  : 'bg-slate-900/90 text-slate-400 border-slate-800 hover:border-slate-700'
              }`}>
              All Species (20)
            </button>
            {(Object.keys(BONSAI_GROUPS) as BonsaiGroup[]).map((grpKey) => {
              const grp = BONSAI_GROUPS[grpKey];
              const isSelected = selectedGroupFilter === grpKey;
              return (
                <button
                  key={grpKey}
                  onClick={() => {
                    setSelectedGroupFilter(grpKey);
                    gameAudio.playCrispClick();
                  }}
                  style={{
                    borderColor: isSelected ? grp.themeColor : undefined,
                    color: isSelected ? grp.themeColor : undefined,
                  }}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all shrink-0 border cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 font-black shadow'
                      : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:border-slate-700'
                  }`}>
                  <span>{grp.name}</span>
                  <span className="text-[10px] ml-1 opacity-70">({grp.leafTypes.length})</span>
                </button>
              );
            })}
          </div>

          {/* POKÉDEX MASTER-DETAIL TWO-COLUMN VIEWPORT */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-3 min-h-0 overflow-hidden">
            {/* LEFT PANE: 20 SPECIES INDEX LIST (#001 TO #020) */}
            <div className="md:col-span-5 bg-slate-900/80 border border-slate-800 rounded-2xl p-2 flex flex-col min-h-0 overflow-y-auto space-y-1.5 pr-1.5">
              {filteredBondexList.map((entry) => {
                const def = getLeafTypeDef(entry.id);
                const disc = discoveredSpeciesMap[entry.id];
                const isDiscovered = disc ? disc.discovered : false;
                const isSelected = selectedEntry.id === entry.id;
                const raisedCount = disc?.stylesRaised?.length || 0;

                return (
                  <div
                    key={entry.id}
                    onClick={() => {
                      const realIdx = BONDEX_SPECIES_LIST.findIndex((sp) => sp.id === entry.id);
                      if (realIdx !== -1) setSelectedSpeciesIndex(realIdx);
                      gameAudio.playCrispClick();
                    }}
                    style={{
                      borderColor: isSelected
                        ? isDiscovered
                          ? def.color
                          : '#64748b'
                        : undefined,
                    }}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2.5 ${
                      isSelected
                        ? isDiscovered
                          ? 'bg-slate-850 ring-2 ring-emerald-500/40 shadow-md'
                          : 'bg-slate-850 ring-2 ring-slate-500/40 shadow-md'
                        : 'bg-slate-950/70 border-slate-850 hover:border-slate-700'
                    }`}>
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-xs font-mono font-bold text-slate-500 shrink-0">
                        {entry.num}
                      </span>

                      <div
                        style={{
                          backgroundColor: isDiscovered ? `${def.color}25` : '#0f172a',
                          borderColor: isDiscovered ? def.color : '#334155',
                        }}
                        className="w-8 h-8 rounded-lg border flex items-center justify-center text-sm font-bold shrink-0 overflow-hidden">
                        {isDiscovered ? (
                          <BondexLeafThumbnail
                            leafType={entry.id}
                            color={def.color}
                            accentColor={def.accentColor}
                          />
                        ) : (
                          <Lock className="w-3.5 h-3.5 text-slate-600" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4
                            className={`text-xs font-bold truncate ${
                              isDiscovered ? 'text-slate-100' : 'text-slate-500'
                            }`}>
                            {isDiscovered ? getBonsaiDisplayName(entry.id) : '??? Unknown Specimen'}
                          </h4>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-slate-400 truncate">
                          {isDiscovered ? (
                            <>
                              <span className={`px-1 py-0.2 rounded border font-semibold ${getBonsaiGroupBadgeClass(def.group)}`}>
                                {def.group}
                              </span>
                              <span className="text-emerald-400 font-mono">
                                Styles: {raisedCount}/10
                              </span>
                            </>
                          ) : (
                            <span className="text-slate-600">Undiscovered Flora</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <ChevronRight
                      className={`w-4 h-4 shrink-0 transition-transform ${
                        isSelected ? 'text-emerald-400 translate-x-0.5' : 'text-slate-600'
                      }`}
                    />
                  </div>
                );
              })}
            </div>

            {/* RIGHT PANE: SELECTED ENTRY POKÉDEX LCD SCREEN */}
            <div className="md:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 flex flex-col min-h-0 overflow-y-auto space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-black text-emerald-400">
                    {selectedEntry.num}
                  </span>
                  <h4 className="text-sm sm:text-base font-black text-slate-100">
                    {isSelectedDiscovered ? getBonsaiDisplayName(selectedEntry.id) : '??? Undiscovered Specimen'}
                  </h4>
                </div>

                {isSelectedDiscovered && (
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-black border ${getBonsaiGroupBadgeClass(selectedDef.group)}`}>
                      {selectedDef.group}
                    </span>
                  </div>
                )}
              </div>

              {/* Live Canvases */}
              <div className="flex flex-col sm:flex-row items-center gap-3 bg-slate-950/80 p-3 rounded-2xl border border-slate-800/80">
                <div className="shrink-0 flex flex-col items-center">
                  <BondexStylePreviewCanvas
                    leafType={selectedEntry.id}
                    styleKey={viewerStyle}
                    color={selectedDef.color}
                    accentColor={selectedDef.accentColor}
                    isUndiscovered={!isSelectedDiscovered}
                    isStyleUnlogged={isSelectedDiscovered && !selectedRaisedStyles.includes(viewerStyle)}
                    width={220}
                    height={180}
                  />
                  {isSelectedDiscovered && selectedRaisedStyles.includes(viewerStyle) && (
                    <span className="text-[10px] text-emerald-400 font-mono mt-1 font-bold flex items-center gap-1">
                      <span>Viewing: {getBonsaiStyleDef(viewerStyle).japanese} ({getBonsaiStyleDef(viewerStyle).name})</span>
                      <span className="text-emerald-300 font-semibold">✓ Logged</span>
                    </span>
                  )}
                </div>

                {/* Style Selector Buttons */}
                <div className="flex-1 w-full space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 sticky top-0 bg-slate-950/90 py-0.5 z-10">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span>10 Structural Growth Styles</span>
                  </div>

                  {(
                    [
                      'CHOKAN',
                      'MOYOGI',
                      'SHAKAN',
                      'HAN_KENGAI',
                      'SOKAN',
                      'KENGAI',
                      'KABUDACHI',
                      'HOKIDACHI',
                      'BUNJINGI',
                      'FUKINAASHI',
                    ] as BonsaiStyle[]
                  ).map((stKey) => {
                    const stDef = getBonsaiStyleDef(stKey);
                    const isSelected = viewerStyle === stKey;
                    const hasRaised = selectedRaisedStyles.includes(stKey);

                    return (
                      <button
                        key={stKey}
                        disabled={!isSelectedDiscovered}
                        onClick={() => {
                          setViewerStyle(stKey);
                          gameAudio.playCrispClick();
                        }}
                        className={`w-full p-2 rounded-xl text-left border transition-all flex items-center justify-between gap-2 cursor-pointer ${
                          !isSelectedDiscovered
                            ? 'bg-slate-900/40 border-slate-800 text-slate-600 cursor-not-allowed'
                            : isSelected
                            ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200 ring-1 ring-emerald-500/50 shadow'
                            : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 text-slate-300'
                        }`}>
                        <div>
                          <div className="flex items-center gap-1.5 font-bold text-xs">
                            <span>{stDef.japanese}</span>
                            <span className="text-[10px] opacity-75 font-normal">({stDef.name})</span>
                          </div>
                          <div className="text-[10px] text-slate-400 line-clamp-1">{stDef.subtitle}</div>
                        </div>

                        <span
                          className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase shrink-0 border ${
                            hasRaised
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                              : 'bg-slate-800 text-amber-300 border-amber-500/40'
                          }`}>
                          {hasRaised ? '✓ Logged' : '🔒 Unlogged'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* SPECIES FIELD DATA & BOTANICAL LORE */}
              {isSelectedDiscovered ? (
                <div className="space-y-2.5">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">
                        Leaf Morphology:
                      </span>
                      <strong className="text-slate-200">{selectedDef.leafShapeName}</strong>
                    </div>

                    <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">
                        Highest Maturity Recorded:
                      </span>
                      <span
                        style={{
                          backgroundColor: selectedMatDef.bg,
                          borderColor: selectedMatDef.border,
                          color: selectedMatDef.color,
                        }}
                        className="text-[11px] px-2 py-0.5 rounded-lg font-black border inline-flex items-center gap-1 mt-0.5">
                        <span>{selectedMatDef.kanji}</span>
                        <span>{selectedMatDef.name} (Rank {selectedMatDef.rank})</span>
                      </span>
                    </div>
                  </div>

                  <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold mb-1">
                      Natural Biome Habitats:
                    </span>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {revealedBiomes.length > 0 ? (
                        revealedBiomes.map((bio) => (
                          <span
                            key={bio.biomeId}
                            className="bg-slate-900 border border-emerald-500/50 text-emerald-300 text-[11px] px-2 py-0.5 rounded-lg font-mono font-semibold shadow-sm">
                            🌿 {bio.name} ({bio.percent}%)
                          </span>
                        ))
                      ) : (
                        <span className="bg-slate-900/60 border border-dashed border-slate-700 text-slate-500 text-[11px] px-2.5 py-0.5 rounded-lg font-mono flex items-center gap-1.5">
                          <Lock className="w-3 h-3 text-slate-600" />
                          <span>Undiscovered Biome Habitat</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-emerald-400 block text-[10px] uppercase font-bold mb-0.5">
                      Botanical Field Lore:
                    </span>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {selectedDef.description}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 text-center space-y-2">
                  <span className="text-2xl">🔒</span>
                  <h5 className="font-bold text-xs text-slate-300">Specimen Not Yet Discovered</h5>
                  <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
                    Chart new territory with your Expedition Rover to uncover wild root nodes. Once excavated or cultivated, its leaf morphology, authentic styles, and botanical lore will be permanently registered in the Bondex!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2 CONTENT: STANDARDIZED BLUEPRINTS CATALOG */}
      {/* ========================================================================= */}
      {activeTab === 'blueprints' && (
        <div className="flex-1 overflow-hidden pr-1">
          <BlueprintsCatalogView
            unlockedBlueprints={unlockedBlueprints}
            verdureBalance={verdureBalance}
            onPurchaseBlueprint={onPurchaseBlueprint || (() => {})}
            maxBranchRank={maxCompletedBranchRank}
            accentTone="emerald"
            discountRate={(zenSkills.discountHunter ?? (zenSkills as any)['discount_hunter'] ?? 0) * 0.02}
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3 CONTENT: 36 ZEN MASTERY SKILLS OVERHAUL */}
      {/* ========================================================================= */}
      {activeTab === 'skills' && (
        <div className="flex-1 flex flex-col min-h-0 space-y-2.5">
          {/* CATEGORY FILTER PILLS & ZEN POINTS BALANCE BADGE */}
          <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 shrink-0 flex-wrap sm:flex-nowrap">
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
              {(['ALL', 'Expedition', 'Growing', 'Economy & Energy', 'Competition'] as const).map((cat) => {
                const isSelected = selectedSkillCategory === cat;
                const count = categoryCounts[cat];

                return (
                  <button
                    key={cat}
                    onClick={() => {
                      setSelectedSkillCategory(cat);
                      gameAudio.playCrispClick();
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 border flex items-center gap-1.5 cursor-pointer ${
                      isSelected
                        ? 'bg-pink-600 text-white border-pink-400 shadow-md ring-2 ring-pink-400/40'
                        : 'bg-slate-900/90 text-slate-300 border-slate-800 hover:border-slate-700'
                    }`}>
                    <span>{cat === 'ALL' ? 'All' : cat}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                        isSelected ? 'bg-slate-950 text-pink-300' : 'bg-slate-950 text-slate-400'
                      }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Clean Zen Points Balance Badge */}
            <div className="bg-pink-950/80 border border-pink-500/80 px-3 py-1.5 rounded-xl text-xs font-black text-pink-300 flex items-center gap-1.5 shadow shrink-0">
              <span>🌸</span>
              <span>Zen Points: <strong className="font-mono text-pink-200">{zenEssence}</strong></span>
            </div>
          </div>

          {/* 36 SKILLS GRID */}
          <div className="flex-1 space-y-2.5 overflow-y-auto pr-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {filteredSkills.map((skill) => {
                const currentLevel = (zenSkills[skill.id as keyof ZenSkills] as number) || 0;
                const isMax = currentLevel >= skill.maxLevel;
                const nextLevelData = isMax ? null : skill.levels[currentLevel];
                const cost = nextLevelData ? nextLevelData.cost : 0;
                const reqRank = nextLevelData ? nextLevelData.requiredBranchRank : undefined;

                // Rank gating check: Player must have completed at least Rank X in ANY Master Quest branch!
                const isRankLocked = Boolean(reqRank && maxCompletedBranchRank < reqRank);
                const canAfford = zenEssence >= cost;
                const isGreyedOut = Boolean(skill.isGreyedOut);

                const canUpgrade = !isMax && !isGreyedOut && !isRankLocked && canAfford;

                // Badge styling by category
                const catBadgeStyles: Record<SkillCategory, string> = {
                  Expedition: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40',
                  Growing: 'bg-green-950/80 text-green-300 border-green-500/40',
                  'Economy & Energy': 'bg-amber-950/80 text-amber-300 border-amber-500/40',
                  Competition: 'bg-purple-950/80 text-purple-300 border-purple-500/40',
                };

                return (
                  <div
                    key={skill.id}
                    className={`p-3.5 rounded-2xl flex flex-col justify-between gap-2.5 border transition-all ${
                      isGreyedOut
                        ? 'bg-slate-950/40 border-slate-850 opacity-60'
                        : isMax
                        ? 'bg-slate-900/90 border-emerald-500/40 shadow-sm'
                        : isRankLocked
                        ? 'bg-slate-900/80 border-slate-800'
                        : canAfford
                        ? 'bg-slate-900/90 border-slate-700/80 hover:border-pink-500/60 shadow'
                        : 'bg-slate-900/80 border-slate-800'
                    }`}>
                    <div>
                      {/* Top Header: Icon, Name, Category Badge & Upgrade Button */}
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="text-2xl shrink-0">{skill.icon}</span>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h4 className="font-bold text-xs sm:text-sm text-slate-100 truncate">
                                {skill.name}
                              </h4>
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className={`text-[9.5px] px-1.5 py-0.2 rounded-md font-bold border ${catBadgeStyles[skill.category]}`}>
                                {skill.category}
                              </span>
                              {isGreyedOut && (
                                <span className="text-[9.5px] bg-slate-800 text-amber-300/90 border border-amber-500/30 px-1.5 py-0.2 rounded-md font-semibold">
                                  System in development
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* UPGRADE BUTTON OR STATUS BADGE */}
                        <div className="shrink-0">
                          {isGreyedOut ? (
                            <span className="bg-slate-950 text-slate-500 text-[10px] font-bold px-2.5 py-1 rounded-xl border border-slate-800 inline-block">
                              Locked
                            </span>
                          ) : isMax ? (
                            <span className="bg-emerald-950/80 text-emerald-300 border border-emerald-500/60 text-xs font-black px-2.5 py-1 rounded-xl shadow-sm inline-flex items-center gap-1">
                              <Check className="w-3.5 h-3.5" />
                              <span>MAX</span>
                            </span>
                          ) : isRankLocked ? (
                            <button
                              disabled
                              title={`Requires finishing 1 Master Quest Branch to Rank ${reqRank}`}
                              className="bg-slate-950 text-amber-400/80 border border-amber-500/40 text-[11px] font-bold px-2.5 py-1 rounded-xl cursor-not-allowed flex items-center gap-1 shadow-sm">
                              <Lock className="w-3 h-3 text-amber-400" />
                              <span>Rank {reqRank} Req</span>
                            </button>
                          ) : (
                            <button
                              disabled={!canUpgrade}
                              onClick={() => {
                                upgradeZenSkill(skill.id as keyof ZenSkills);
                              }}
                              className={`px-3 py-1 rounded-xl text-xs font-black transition-all shadow cursor-pointer flex items-center gap-1 ${
                                canUpgrade
                                  ? 'bg-pink-600 hover:bg-pink-500 text-white active:scale-95 ring-1 ring-pink-400'
                                  : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                              }`}>
                              <span>Upgrade ({cost} ZP)</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* LEVEL PIPS / STARS (e.g. ★★★☆☆) */}
                      <div className="flex items-center gap-1 my-1.5">
                        {Array.from({ length: skill.maxLevel }).map((_, pipIdx) => {
                          const isLevelFilled = pipIdx < currentLevel;
                          return (
                            <span
                              key={pipIdx}
                              className={`text-xs ${
                                isLevelFilled ? 'text-amber-400 drop-shadow-[0_0_4px_rgba(250,204,21,0.6)]' : 'text-slate-700'
                              }`}>
                              ★
                            </span>
                          );
                        })}
                        <span className="text-[10px] text-slate-400 font-mono font-bold ml-1">
                          Level {currentLevel} / {skill.maxLevel}
                        </span>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed mb-1.5">
                        {skill.description}
                      </p>
                    </div>

                    {/* BOTTOM STATUS & EFFECT BOX */}
                    <div className="bg-slate-950/80 p-2 rounded-xl border border-slate-800 space-y-1 text-[11px]">
                      <div className="flex items-center justify-between text-slate-300">
                        <span className="text-slate-400 font-semibold">Current Effect:</span>
                        <strong className="text-emerald-300 font-mono">
                          {skill.getCurrentEffectText(currentLevel)}
                        </strong>
                      </div>

                      {!isMax && !isGreyedOut && (
                        <div className="flex items-center justify-between text-slate-400 text-[10.5px]">
                          <span>Next Level:</span>
                          <span className="text-sky-300 font-mono font-semibold">
                            {skill.getNextEffectText(currentLevel)}
                          </span>
                        </div>
                      )}

                      {/* RANK PREREQUISITE WARNING LABEL IF LOCKED */}
                      {isRankLocked && reqRank && (
                        <div className="flex items-center gap-1 text-[10.5px] text-amber-400 font-bold pt-1 border-t border-slate-900">
                          <Lock className="w-3 h-3 text-amber-400 shrink-0" />
                          <span>Requires finishing 1 Master Quest Branch to Rank {reqRank}</span>
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

      {/* FOOTER CONTROLLER & KEYBOARD PROMPTS STRIP */}
      <div className="pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 shrink-0 mt-1">
        <span className="font-mono text-pink-400 text-[11px] hidden sm:inline">
          🎮 [A/D / LB/RB] Switch Tabs • [W/S] Navigate • [E / A] Select • [Esc / B] Close
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
