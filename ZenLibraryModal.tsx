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
  Trophy,
  X,
  Zap,
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
  SKILL_CONFIGS,
  SanctuaryInventory,
  StoredPottedBonsai,
  ZenSkills,
  getBonsaiGroupBadgeClass,
  getBonsaiStyleDef,
  getExpRequiredForLevel,
  VerdureIcon,
} from './App';
import { BlueprintDef } from './blueprints';
import BlueprintsCatalogView from './BlueprintsCatalogView';

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
  stats = DEFAULT_STATS,
  claimAchievement,
}: ZenLibraryModalProps) {
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
  // Shrine category tabs: ['bondex', 'blueprints', 'skills']
  const [activeTab, setActiveTab] = useState<ShrineTab>('bondex');

  // Bondex Filter and Selected Species State
  const [selectedGroupFilter, setSelectedGroupFilter] = useState<string>('ALL');
  const [selectedSpeciesIndex, setSelectedSpeciesIndex] = useState<number>(0);
  const [viewerStyle, setViewerStyle] = useState<BonsaiStyle>('MOYOGI');

  const [focusedSkillIdx, setFocusedSkillIdx] = useState<number>(0);

  // Handle Gamepad Bumper tab cycling & Keyboard Navigation
  useEffect(() => {
    if (!isOpen) return;

    const ALL_STYLES: BonsaiStyle[] = [
      'CHOKAN',
      'MOYOGI',
      'SHAKAN',
      'HAN_KENGAI',
      'SOKAN',
      'KENGAI',
      'KABUDACHI',
    ];

    const skillKeys = Object.keys(SKILL_CONFIGS);

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
      } else if (e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        if (activeTab === 'bondex') {
          setSelectedSpeciesIndex((idx) => Math.max(0, idx - 1));
          gameAudio.playHoverMicroTone();
        } else if (activeTab === 'skills') {
          setFocusedSkillIdx((idx) => Math.max(0, idx - 1));
          gameAudio.playHoverMicroTone();
        }
      } else if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        if (activeTab === 'bondex') {
          setSelectedSpeciesIndex((idx) => Math.min(BONDEX_SPECIES_LIST.length - 1, idx + 1));
          gameAudio.playHoverMicroTone();
        } else if (activeTab === 'skills') {
          setFocusedSkillIdx((idx) => Math.min(skillKeys.length - 1, idx + 1));
          gameAudio.playHoverMicroTone();
        }
      } else if (e.key === 'Enter' || e.key === ' ' || e.key === 'e' || e.key === 'E') {
        e.preventDefault();
        if (activeTab === 'bondex') {
          setViewerStyle((cur) => {
            const idx = ALL_STYLES.indexOf(cur);
            return ALL_STYLES[(idx + 1) % ALL_STYLES.length];
          });
          gameAudio.playCrispClick();
        } else if (activeTab === 'skills') {
          const key = skillKeys[focusedSkillIdx];
          if (key) upgradeZenSkill(key as keyof ZenSkills);
        }
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
  }, [
    isOpen,
    activeTab,
    focusedSkillIdx,
    upgradeZenSkill,
    onClose,
  ]);

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

  const filteredList =
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
      <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2.5 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-pink-950/80 border-2 border-pink-500/70 flex items-center justify-center text-pink-300 shadow">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-pink-300 tracking-wide">📚 Zen Library</h3>
            <p className="text-[10.5px] text-slate-400">
              Botanical Bondex Compendium, Blueprints Catalog &amp; Mastery Skills
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Verdure Balance for purchasing blueprints */}
          <div className="bg-emerald-950/85 border border-emerald-500/80 px-3 py-1 rounded-xl text-xs font-black text-emerald-300 flex items-center gap-1.5 shadow">
            <VerdureIcon className="w-4 h-4" />
            <span>{verdureBalance.toFixed(2)} Verdure</span>
          </div>

          {/* Zen Points */}
          <div className="bg-pink-950/80 border border-pink-500 px-3 py-1 rounded-xl text-xs font-black text-pink-300 flex items-center gap-1.5 shadow">
            <span>🌸</span>
            <span>{zenEssence} Zen Points</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* THREE PRIMARY TABS: ['Bondex', 'Blueprints', 'Skills'] */}
      <div className="grid grid-cols-3 gap-2 mb-2.5 shrink-0">
        {/* TAB 1: BONDEX */}
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
          <span className="text-[10px] bg-slate-950/60 px-1.5 py-0.5 rounded-full font-mono text-emerald-300">
            {discoveredSpeciesCount}/20
          </span>
        </button>

        {/* TAB 2: BLUEPRINTS (MOVED FROM MARKET TO ZEN LIBRARY) */}
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
          <span className="text-[10px] bg-slate-950/60 px-1.5 py-0.5 rounded-full font-mono text-lime-300">
            58 Catalog
          </span>
        </button>

        {/* TAB 3: SKILLS */}
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
                🎋 {totalStylesLoggedCount} / 140 Styles
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
              {filteredList.map((entry) => {
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
                                Styles: {raisedCount}/7
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
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-slate-950 border border-slate-700 text-slate-300">
                      {selectedDef.rarity}
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
                    <span>7 Structural Growth Styles</span>
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
      {/* TAB 2 CONTENT: STANDARDIZED BLUEPRINTS CATALOG (MOVED FROM MARKET TO ZEN LIBRARY) */}
      {/* ========================================================================= */}
      {activeTab === 'blueprints' && (
        <div className="flex-1 overflow-hidden pr-1">
          <BlueprintsCatalogView
            unlockedBlueprints={unlockedBlueprints}
            verdureBalance={verdureBalance}
            onPurchaseBlueprint={onPurchaseBlueprint || (() => {})}
            accentTone="emerald"
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3 CONTENT: SKILLS */}
      {/* ========================================================================= */}
      {activeTab === 'skills' && (
        <div className="flex-1 flex flex-col min-h-0 space-y-2.5">
          {/* BOTANIST LEVEL & EXP INFO STRIP */}
          <div className="bg-slate-900/90 border border-emerald-500/40 px-3.5 py-2 rounded-2xl flex items-center justify-between gap-3 text-xs shrink-0 shadow">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-950 border border-emerald-400/60 flex items-center justify-center font-black text-emerald-300 text-xs">
                {playerLevel}
              </div>
              <div>
                <span className="font-bold text-slate-100">Botanist Lv.{playerLevel}</span>
                <span className="text-[10px] text-emerald-400 ml-1.5 hidden sm:inline">
                  (+2 Zen Points per Level Up)
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-1 max-w-xs">
              <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-700">
                <div
                  style={{
                    width: `${Math.min(
                      100,
                      (playerExp / getExpRequiredForLevel(playerLevel)) * 100,
                    )}%`,
                  }}
                  className="bg-gradient-to-r from-emerald-500 to-teal-300 h-full transition-all"
                />
              </div>
              <span className="text-[10px] text-slate-300 font-mono whitespace-nowrap">
                {playerExp}/{getExpRequiredForLevel(playerLevel)} EXP
              </span>
            </div>
          </div>

          {/* SKILLS MULTI-COLUMN GRID */}
          <div className="flex-1 space-y-2.5 overflow-y-auto pr-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {(Object.keys(SKILL_CONFIGS) as string[]).map((key, sIdx) => {
                const conf = SKILL_CONFIGS[key];
                if (!conf) return null;
                const currentRank = (zenSkills[key as keyof ZenSkills] as number) || 0;
                const isMax = currentRank >= conf.maxRank;
                const cost = isMax ? 0 : conf.costs[currentRank] || 5;
                const canAfford = zenEssence >= cost;
                const isFocused = focusedSkillIdx === sIdx;

                return (
                  <div
                    key={key}
                    className={`bg-slate-900/90 border p-3.5 rounded-2xl flex flex-col justify-between gap-2 shadow transition-all ${
                      isFocused ? 'border-pink-400 ring-2 ring-pink-500/50 bg-slate-850 scale-[1.01]' : 'border-slate-800'
                    }`}>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{conf.icon}</span>
                          <div>
                            <h4 className="font-bold text-xs sm:text-sm text-slate-100">{conf.name}</h4>
                            <span className="text-[11px] text-pink-400 font-semibold">
                              Rank {currentRank} / {conf.maxRank}
                            </span>
                          </div>
                        </div>

                        <button
                          disabled={isMax || !canAfford}
                          onClick={() => upgradeZenSkill(key as keyof ZenSkills)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow cursor-pointer ${
                            isMax
                              ? 'bg-slate-800 text-emerald-400 border border-emerald-500/40 cursor-default'
                              : canAfford
                              ? 'bg-pink-600 hover:bg-pink-500 text-white active:scale-95'
                              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                          }`}>
                          {isMax ? 'MAX' : `Upgrade (${cost} Zen)`}
                        </button>
                      </div>

                      <p className="text-xs text-slate-400 leading-relaxed mb-1.5">
                        {conf.description}
                      </p>
                    </div>

                    <div className="bg-slate-950/80 p-2 rounded-xl border border-slate-800 text-[11px] text-emerald-300 font-mono">
                      Bonus: <strong>{conf.getBonusText(currentRank)}</strong>
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
          🎮 [A/D / LB/RB] Switch Tabs • [W/S] Navigate • [E / A] Inspect/Select • [Arrows / R-Stick] Scroll • [Esc / B] Close
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
