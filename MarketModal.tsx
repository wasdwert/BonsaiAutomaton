import React, { useState, useEffect } from 'react';
import {
  X,
  Store,
  Map as MapIcon,
  Maximize2,
  Wrench,
  Info,
  CheckCircle2,
  Lock,
  Trophy,
  Sparkles,
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
import { MasterQuestsState } from './types';
import { getMaxMasterQuestBranchRank } from './ZenLibraryModal';

export type MarketTabKey =
  | 'maps'
  | 'grid_expansions'
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
  onBuyExpeditionMap: (mapKey: string, cost: number, mapName: string) => void;
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
  masterQuests?: MasterQuestsState;
  maxBranchRank?: number;
}

export interface MapProductDef {
  id: string;
  name: string;
  areaNumber: 1 | 2 | 3;
  stepsLabel: string;
  cost: number;
  showRank: number;
  prereqId?: string;
  prereqName?: string;
  themeColor: string;
  accentColor: string;
  description: string;
}

export const MAPS_CATALOG: MapProductDef[] = [
  // Area 1 Maps
  {
    id: 'area1_exp1',
    name: 'Area 1 – Expansion Map #1 (61-80 Steps)',
    areaNumber: 1,
    stepsLabel: '61-80 Steps',
    cost: 50,
    showRank: 0,
    themeColor: '#10b981',
    accentColor: '#34d399',
    description: 'Expands allowed travel radius in Sunlit Foothills to 80 steps from camp. Unlocks richer scrap caches and copper wire.',
  },
  {
    id: 'area1_exp2',
    name: 'Area 1 – Expansion Map #2 (81-100 Steps)',
    areaNumber: 1,
    stepsLabel: '81-100 Steps',
    cost: 100,
    showRank: 0,
    prereqId: 'area1_exp1',
    prereqName: 'Area 1 Map #1',
    themeColor: '#10b981',
    accentColor: '#34d399',
    description: 'Expands allowed travel radius in Sunlit Foothills to 100 steps from camp. Unlocks brass gears and notable root nodes.',
  },
  {
    id: 'area1_exp3',
    name: 'Area 1 – Expansion Map #3 (101-120 Steps)',
    areaNumber: 1,
    stepsLabel: '101-120 Steps',
    cost: 250,
    showRank: 1,
    prereqId: 'area1_exp2',
    prereqName: 'Area 1 Map #2',
    themeColor: '#10b981',
    accentColor: '#34d399',
    description: 'Expands allowed travel radius in Sunlit Foothills to 120 steps from camp. Unlocks deep scrap deposits and crystal shards.',
  },
  {
    id: 'area1_exp4',
    name: 'Area 1 – Expansion Map #4 (121-140 Steps)',
    areaNumber: 1,
    stepsLabel: '121-140 Steps',
    cost: 500,
    showRank: 1,
    prereqId: 'area1_exp3',
    prereqName: 'Area 1 Map #3',
    themeColor: '#10b981',
    accentColor: '#34d399',
    description: 'Expands allowed travel radius in Sunlit Foothills to 140 steps from camp. Unlocks refined root specimens and double gear caches.',
  },
  {
    id: 'area1_exp5',
    name: 'Area 1 – Expansion Map #5 (141-160 Steps)',
    areaNumber: 1,
    stepsLabel: '141-160 Steps',
    cost: 1000,
    showRank: 2,
    prereqId: 'area1_exp4',
    prereqName: 'Area 1 Map #4',
    themeColor: '#10b981',
    accentColor: '#34d399',
    description: 'Expands allowed travel radius in Sunlit Foothills to max 160 steps from camp. Unlocks circuit boards and high-tier flora.',
  },

  // Area 2 Maps
  {
    id: 'area2_base',
    name: 'Area 2 – Base Map (1-60 Steps)',
    areaNumber: 2,
    stepsLabel: '1-60 Steps',
    cost: 250,
    showRank: 1,
    themeColor: '#0ea5e9',
    accentColor: '#38bdf8',
    description: 'Unlocks wilderness expeditions to Area 2: Misty Highlands up to 60 steps from basecamp.',
  },
  {
    id: 'area2_exp1',
    name: 'Area 2 – Expansion Map #1 (61-80 Steps)',
    areaNumber: 2,
    stepsLabel: '61-80 Steps',
    cost: 100,
    showRank: 1,
    prereqId: 'area2_base',
    prereqName: 'Area 2 Base Map',
    themeColor: '#0ea5e9',
    accentColor: '#38bdf8',
    description: 'Expands allowed travel radius in Misty Highlands to 80 steps from camp. Higher crystal artifact frequency.',
  },
  {
    id: 'area2_exp2',
    name: 'Area 2 – Expansion Map #2 (81-100 Steps)',
    areaNumber: 2,
    stepsLabel: '81-100 Steps',
    cost: 250,
    showRank: 1,
    prereqId: 'area2_exp1',
    prereqName: 'Area 2 Map #1',
    themeColor: '#0ea5e9',
    accentColor: '#38bdf8',
    description: 'Expands allowed travel radius in Misty Highlands to 100 steps from camp. Yields gear nodes and refined specimens.',
  },
  {
    id: 'area2_exp3',
    name: 'Area 2 – Expansion Map #3 (101-120 Steps)',
    areaNumber: 2,
    stepsLabel: '101-120 Steps',
    cost: 500,
    showRank: 2,
    prereqId: 'area2_exp2',
    prereqName: 'Area 2 Map #2',
    themeColor: '#0ea5e9',
    accentColor: '#38bdf8',
    description: 'Expands allowed travel radius in Misty Highlands to 120 steps from camp. Heavy scrap caches and high crystal odds.',
  },
  {
    id: 'area2_exp4',
    name: 'Area 2 – Expansion Map #4 (121-140 Steps)',
    areaNumber: 2,
    stepsLabel: '121-140 Steps',
    cost: 1000,
    showRank: 2,
    prereqId: 'area2_exp3',
    prereqName: 'Area 2 Map #3',
    themeColor: '#0ea5e9',
    accentColor: '#38bdf8',
    description: 'Expands allowed travel radius in Misty Highlands to 140 steps from camp. Rare circuit components and notable flora.',
  },
  {
    id: 'area2_exp5',
    name: 'Area 2 – Expansion Map #5 (141-160 Steps)',
    areaNumber: 2,
    stepsLabel: '141-160 Steps',
    cost: 1500,
    showRank: 3,
    prereqId: 'area2_exp4',
    prereqName: 'Area 2 Map #4',
    themeColor: '#0ea5e9',
    accentColor: '#38bdf8',
    description: 'Expands allowed travel radius in Misty Highlands to max 160 steps from camp. High density circuits and crystal artifacts.',
  },

  // Area 3 Maps
  {
    id: 'area3_base',
    name: 'Area 3 – Base Map (1-60 Steps)',
    areaNumber: 3,
    stepsLabel: '1-60 Steps',
    cost: 1000,
    showRank: 2,
    themeColor: '#a855f7',
    accentColor: '#c084fc',
    description: 'Unlocks wilderness expeditions to Area 3: Ancient Caldera / Overgrowth up to 60 steps from basecamp.',
  },
  {
    id: 'area3_exp1',
    name: 'Area 3 – Expansion Map #1 (61-80 Steps)',
    areaNumber: 3,
    stepsLabel: '61-80 Steps',
    cost: 250,
    showRank: 2,
    prereqId: 'area3_base',
    prereqName: 'Area 3 Base Map',
    themeColor: '#a855f7',
    accentColor: '#c084fc',
    description: 'Expands allowed travel radius in Ancient Caldera to 80 steps from camp. High crystal artifact frequency (0.60%).',
  },
  {
    id: 'area3_exp2',
    name: 'Area 3 – Expansion Map #2 (81-100 Steps)',
    areaNumber: 3,
    stepsLabel: '81-100 Steps',
    cost: 500,
    showRank: 2,
    prereqId: 'area3_exp1',
    prereqName: 'Area 3 Map #1',
    themeColor: '#a855f7',
    accentColor: '#c084fc',
    description: 'Expands allowed travel radius in Ancient Caldera to 100 steps from camp. Refined specimens and brass gear caches.',
  },
  {
    id: 'area3_exp3',
    name: 'Area 3 – Expansion Map #3 (101-120 Steps)',
    areaNumber: 3,
    stepsLabel: '101-120 Steps',
    cost: 1000,
    showRank: 3,
    prereqId: 'area3_exp2',
    prereqName: 'Area 3 Map #2',
    themeColor: '#a855f7',
    accentColor: '#c084fc',
    description: 'Expands allowed travel radius in Ancient Caldera to 120 steps from camp. Premium flora and circuit boards.',
  },
  {
    id: 'area3_exp4',
    name: 'Area 3 – Expansion Map #4 (121-140 Steps)',
    areaNumber: 3,
    stepsLabel: '121-140 Steps',
    cost: 1500,
    showRank: 3,
    prereqId: 'area3_exp3',
    prereqName: 'Area 3 Map #3',
    themeColor: '#a855f7',
    accentColor: '#c084fc',
    description: 'Expands allowed travel radius in Ancient Caldera to 140 steps from camp. Rich crystal presence (1.05%) and electronic circuits.',
  },
  {
    id: 'area3_exp5',
    name: 'Area 3 – Expansion Map #5 (141-160 Steps)',
    areaNumber: 3,
    stepsLabel: '141-160 Steps',
    cost: 2000,
    showRank: 3,
    prereqId: 'area3_exp4',
    prereqName: 'Area 3 Map #4',
    themeColor: '#a855f7',
    accentColor: '#c084fc',
    description: 'Expands allowed travel radius in Ancient Caldera to max 160 steps from camp. Peak crystal artifact rate (1.20%) and double circuits.',
  },
];

/**
 * Helper to determine whether a plot is unlocked at a given expansion tier.
 */
export function isPlotUnlockedAtTier(
  field: 'left' | 'main' | 'right',
  r: number,
  c: number,
  tier: number,
): boolean {
  if (field === 'left') {
    return tier >= 5;
  }
  if (field === 'right') {
    return tier >= 6;
  }
  // main field (16x16)
  if (r <= 3) {
    if (tier >= 2) return true;
    if (tier === 1) return c >= 4 && c <= 11;
    return c >= 6 && c <= 9; // starter 16 plots
  }
  if (r <= 5) return tier >= 3;
  if (r <= 7) return tier >= 4;
  if (r <= 11) return tier >= 7;
  return tier >= 8;
}

export type PlotVisualStatus = 'unlocked' | 'pending' | 'locked';

export function getPlotVisualStatus(
  field: 'left' | 'main' | 'right',
  r: number,
  c: number,
  currentTier: number,
  targetTier?: number,
): PlotVisualStatus {
  if (isPlotUnlockedAtTier(field, r, c, currentTier)) {
    return 'unlocked';
  }
  if (targetTier !== undefined && isPlotUnlockedAtTier(field, r, c, targetTier)) {
    return 'pending';
  }
  return 'locked';
}

/**
 * Interactive SVG Mini-Map of the Tri-Field Sanctuary Greenhouse.
 * Geometry:
 * - Left Field (8x8): rows 0..7, cols 0..7
 * - Central Greenhouse (16x16): rows 0..15, cols 0..15, vertically offset 3 rows below side fields
 * - Right Field (8x8): rows 0..7, cols 0..7
 */
export function SanctuaryMiniMap({
  currentTier,
  targetTier,
  isAllUnlocked,
}: {
  currentTier: number;
  targetTier?: number;
  isAllUnlocked: boolean;
}) {
  const step = 12;
  const tileSize = 10;

  // Left field starts at y = 32
  const leftFieldX = 22;
  const leftFieldY = 32;

  // Main field starts 3 rows below side fields: 32 + 3 * 12 = 68
  const mainFieldX = 22 + 8 * step - 2 + 18; // 134
  const mainFieldY = 68;

  // Right field starts at y = 32, after main field (134 + 16 * 12 - 2 + 18 = 342)
  const rightFieldX = 342;
  const rightFieldY = 32;

  const renderField = (
    field: 'left' | 'main' | 'right',
    startX: number,
    startY: number,
    cols: number,
    rows: number,
  ) => {
    const rects: React.ReactNode[] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const status = getPlotVisualStatus(field, r, c, currentTier, targetTier);
        const px = startX + c * step;
        const py = startY + r * step;

        let fill = '#1F2937';
        let stroke = '#374151';
        let strokeWidth = 1;
        let opacity = 0.55;
        let className = '';

        if (status === 'unlocked') {
          fill = '#10B981';
          stroke = '#059669';
          strokeWidth = 1;
          opacity = 0.95;
        } else if (status === 'pending') {
          fill = '#F59E0B';
          stroke = '#FDE047';
          strokeWidth = 1.5;
          opacity = 1;
          className = 'pending-plot';
        }

        rects.push(
          <rect
            key={`${field}_${r}_${c}`}
            x={px}
            y={py}
            width={tileSize}
            height={tileSize}
            rx={2}
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
            opacity={opacity}
            className={className}
          />,
        );
      }
    }
    return rects;
  };

  return (
    <div className="w-full flex flex-col items-center select-none">
      <svg
        viewBox="0 0 458 282"
        className="w-full max-w-lg h-auto aspect-[458/282] drop-shadow-xl">
        <defs>
          <style>{`
            @keyframes pulsePlot {
              0%, 100% { fill: #f59e0b; stroke: #fde047; stroke-width: 1.5; filter: drop-shadow(0 0 3px rgba(251, 191, 36, 0.7)); }
              50% { fill: #fbbf24; stroke: #ffffff; stroke-width: 2; filter: drop-shadow(0 0 7px rgba(251, 191, 36, 1)); }
            }
            .pending-plot {
              animation: pulsePlot 1.6s ease-in-out infinite;
            }
          `}</style>
          <filter id="miniSanctuaryGlow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#000000" floodOpacity="0.6" />
          </filter>
        </defs>

        {/* Greenhouse Master Backdrop Container */}
        <rect
          x="10"
          y="8"
          width="438"
          height="266"
          rx="12"
          fill="#090d16"
          stroke="#1e293b"
          strokeWidth="1.5"
          filter="url(#miniSanctuaryGlow)"
        />

        {/* Left Field Container */}
        <rect
          x={leftFieldX - 4}
          y={leftFieldY - 4}
          width={8 * step - 2 + 8}
          height={8 * step - 2 + 8}
          rx={6}
          fill="#0c1220"
          stroke={targetTier === 5 ? '#f59e0b' : currentTier >= 5 ? '#10b981' : '#1e293b'}
          strokeWidth={targetTier === 5 ? 1.5 : 1}
          strokeDasharray={currentTier >= 5 ? undefined : '3 3'}
        />

        {/* Main Field Container */}
        <rect
          x={mainFieldX - 4}
          y={mainFieldY - 4}
          width={16 * step - 2 + 8}
          height={16 * step - 2 + 8}
          rx={6}
          fill="#0c1220"
          stroke={targetTier && [1, 2, 3, 4, 7, 8].includes(targetTier) ? '#f59e0b' : '#10b981'}
          strokeWidth={targetTier && [1, 2, 3, 4, 7, 8].includes(targetTier) ? 1.5 : 1}
        />

        {/* Right Field Container */}
        <rect
          x={rightFieldX - 4}
          y={rightFieldY - 4}
          width={8 * step - 2 + 8}
          height={8 * step - 2 + 8}
          rx={6}
          fill="#0c1220"
          stroke={targetTier === 6 ? '#f59e0b' : currentTier >= 6 ? '#10b981' : '#1e293b'}
          strokeWidth={targetTier === 6 ? 1.5 : 1}
          strokeDasharray={currentTier >= 6 ? undefined : '3 3'}
        />

        {/* Pathway Lines */}
        <line
          x1={124}
          y1={24}
          x2={124}
          y2={220}
          stroke="#334155"
          strokeWidth="2"
          strokeDasharray="2 3"
          opacity="0.6"
        />
        <line
          x1={333}
          y1={24}
          x2={333}
          y2={220}
          stroke="#334155"
          strokeWidth="2"
          strokeDasharray="2 3"
          opacity="0.6"
        />
        <line
          x1={leftFieldX + 20}
          y1={50}
          x2={rightFieldX + 74}
          y2={50}
          stroke="#334155"
          strokeWidth="1.5"
          strokeDasharray="2 3"
          opacity="0.4"
        />

        {/* Field Header Labels */}
        <text
          x={leftFieldX + 47}
          y={leftFieldY - 8}
          textAnchor="middle"
          fill={targetTier === 5 ? '#f59e0b' : currentTier >= 5 ? '#34d399' : '#64748b'}
          fontSize="7.5"
          fontWeight="bold"
          fontFamily="system-ui">
          WEST TERRACE (8×8)
        </text>

        <text
          x={mainFieldX + 95}
          y={mainFieldY - 8}
          textAnchor="middle"
          fill={targetTier && [1, 2, 3, 4, 7, 8].includes(targetTier) ? '#f59e0b' : '#34d399'}
          fontSize="7.5"
          fontWeight="bold"
          fontFamily="system-ui">
          CENTRAL GREENHOUSE (16×16)
        </text>

        <text
          x={rightFieldX + 47}
          y={rightFieldY - 8}
          textAnchor="middle"
          fill={targetTier === 6 ? '#f59e0b' : currentTier >= 6 ? '#34d399' : '#64748b'}
          fontSize="7.5"
          fontWeight="bold"
          fontFamily="system-ui">
          EAST TERRACE (8×8)
        </text>

        {/* Plots for Left Field */}
        {renderField('left', leftFieldX, leftFieldY, 8, 8)}

        {/* Plots for Main Field */}
        {renderField('main', mainFieldX, mainFieldY, 16, 16)}

        {/* Plots for Right Field */}
        {renderField('right', rightFieldX, rightFieldY, 8, 8)}
      </svg>
    </div>
  );
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
  masterQuests,
  maxBranchRank: propMaxBranchRank,
}: MarketModalProps) {
  const [internalTab, setInternalTab] = useState<MarketTabKey>('maps');
  const [focusedShopIdx, setFocusedShopIdx] = useState<number>(0);

  const rawTab = externalTab ?? internalTab;
  const currentTab: 'maps' | 'grid_expansions' | 'decorations' | 'equipment' =
    rawTab === 'decor'
      ? 'decorations'
      : rawTab === 'expansions' || rawTab === 'grid_expansions'
      ? 'grid_expansions'
      : (rawTab as any) === 'blueprints'
      ? 'equipment'
      : (rawTab as any);

  const setTab = (t: MarketTabKey) => {
    const normalized: MarketTabKey =
      t === 'decor'
        ? 'decorations'
        : t === 'expansions' || t === 'grid_expansions'
        ? 'grid_expansions'
        : t;
    setInternalTab(normalized);
    onTabChange?.(normalized);
    setFocusedShopIdx(0);
    gameAudio?.playCrispClick?.();
  };

  const tabs: MarketTabKey[] = ['maps', 'grid_expansions', 'decorations', 'equipment'];

  const discountMultiplier = Math.max(0.1, 1 - (discountRate || 0));
  const getPrice = (baseCost: number) => Math.max(1, Math.round(baseCost * discountMultiplier));

  const effectiveBranchRank =
    propMaxBranchRank ??
    getMaxMasterQuestBranchRank(
      masterQuests || (inventory as any)?.masterQuests || (inventory as any)?.masterQuest,
    );

  const currentTier = inventory.sanctuary_expansion_tier || 0;
  const nextTier = currentTier + 1;
  const isAllUnlocked = currentTier >= 8;
  const activeExpansion = !isAllUnlocked && currentTier < SANCTUARY_EXPANSIONS.length
    ? SANCTUARY_EXPANSIONS[currentTier]
    : null;

  // Calculate dynamic plots counts
  let unlockedCount = 0;
  let pendingCount = 0;
  let lockedCount = 0;

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const stL = getPlotVisualStatus('left', r, c, currentTier, isAllUnlocked ? undefined : nextTier);
      if (stL === 'unlocked') unlockedCount++;
      else if (stL === 'pending') pendingCount++;
      else lockedCount++;

      const stR = getPlotVisualStatus('right', r, c, currentTier, isAllUnlocked ? undefined : nextTier);
      if (stR === 'unlocked') unlockedCount++;
      else if (stR === 'pending') pendingCount++;
      else lockedCount++;
    }
  }

  for (let r = 0; r < 16; r++) {
    for (let c = 0; c < 16; c++) {
      const stM = getPlotVisualStatus('main', r, c, currentTier, isAllUnlocked ? undefined : nextTier);
      if (stM === 'unlocked') unlockedCount++;
      else if (stM === 'pending') pendingCount++;
      else lockedCount++;
    }
  }

  // Exact 9-item catalog for Equipment submenu in prioritized sequence
  const equipmentCatalog = [
    {
      id: 'irrigation_t1',
      name: 'T1 Manual Irrigation System',
      price: 10,
      unlockRank: 0,
      subtitle: 'Left & Right Plots (2 Total) • 30s',
      description: 'Wooden stool with a water bucket and 2 outlet pipes extending Left and Right. Interacting [E] refills the reservoir for 30s of continuous watering.',
      stock: getStructureInventoryCount(inventory, 'irrigation_t1'),
      previewType: 'preview' as const,
      itemKey: 'irrigation_t1',
      borderTheme: 'border-sky-500/40',
      badgeTheme: 'text-sky-400',
      btnTheme: 'bg-sky-600 hover:bg-sky-500',
      onBuy: () => onBuyManualIrrigation('irrigation_t1', 10, 'T1 Manual Irrigation System'),
    },
    {
      id: 'irrigation_t2',
      name: 'T2 Manual Irrigation System',
      price: 20,
      unlockRank: 0,
      subtitle: '4-Way Cross Plots (4 Total) • 90s',
      description: 'Sturdy timber trestle supporting a wooden water barrel with 4 pipes extending Up, Down, Left, Right. Interacting [E] refills for 90s of continuous watering.',
      stock: getStructureInventoryCount(inventory, 'irrigation_t2'),
      previewType: 'preview' as const,
      itemKey: 'irrigation_t2',
      borderTheme: 'border-sky-500/40',
      badgeTheme: 'text-sky-400',
      btnTheme: 'bg-sky-600 hover:bg-sky-500',
      onBuy: () => onBuyManualIrrigation('irrigation_t2', 20, 'T2 Manual Irrigation System'),
    },
    {
      id: 'irrigation_t3',
      name: 'T3 Manual Irrigation System',
      price: 50,
      unlockRank: 0,
      subtitle: 'All 8 Surrounding Plots (3x3 Grid) • 300s',
      description: 'Heavy reinforced iron cistern on stone foundations with 8 branching conduits leading to all 8 surrounding plots (3x3). Interacting [E] refills for 300s (5 min) of watering.',
      stock: getStructureInventoryCount(inventory, 'irrigation_t3'),
      previewType: 'preview' as const,
      itemKey: 'irrigation_t3',
      borderTheme: 'border-sky-500/40',
      badgeTheme: 'text-sky-400',
      btnTheme: 'bg-sky-600 hover:bg-sky-500',
      onBuy: () => onBuyManualIrrigation('irrigation_t3', 50, 'T3 Manual Irrigation System'),
    },
    {
      id: 'tool_compost_heap',
      name: 'Compost Heap',
      price: 10,
      unlockRank: 0,
      subtitle: '20 Waste Capacity • Passive Decomposition',
      description: 'Rustic slatted cedar timber compost bin box. Deposit up to 20 Organic Waste to passively decompose into usable Enriched Organic Compost (~10s per batch).',
      stock: getStructureInventoryCount(inventory, 'tool_compost_heap'),
      previewType: 'preview' as const,
      itemKey: 'tool_compost_heap',
      borderTheme: 'border-lime-500/40',
      badgeTheme: 'text-lime-400',
      btnTheme: 'bg-lime-600 hover:bg-lime-500',
      onBuy: () => onBuyTool('tool_compost_heap', 10, 'Compost Heap'),
    },
    {
      id: 'fertilizer_station',
      name: 'Chemical Station',
      price: 25,
      unlockRank: 0,
      subtitle: '2x2 Industrial Apparatus • 60s Cycle',
      description: 'Expanded 2x2 high-tech chemical apparatus. Distills Waste & Biochemicals into powerful Fertilizer buffs (60s). Radiates Disrupted Zen 1 plot outwards (4x4 perimeter) unless fenced.',
      stock: getStructureInventoryCount(inventory, 'fertilizer_station'),
      previewType: 'preview' as const,
      itemKey: 'fertilizer_station',
      borderTheme: 'border-emerald-500/40',
      badgeTheme: 'text-emerald-400',
      btnTheme: 'bg-emerald-600 hover:bg-emerald-500',
      onBuy: () => onBuyTool('fertilizer_station', 25, 'Chemical Station'),
    },
    {
      id: 'biochemicals',
      name: 'Biochemicals',
      price: 5,
      unlockRank: 0,
      subtitle: 'Eco-Chemical Reagent',
      description: 'Essential chemical catalyst reagent. Synthesizes Fertilizer at the Chemical Station when combined with Organic Waste.',
      stock: inventory.biochemicals ?? inventory.resources?.biochemicals ?? 0,
      previewType: 'icon' as const,
      icon: '🧪',
      badgeText: '',
      borderTheme: 'border-cyan-500/40',
      badgeTheme: 'text-cyan-300',
      btnTheme: 'bg-cyan-600 hover:bg-cyan-500',
      onBuy: () => onBuyBiochemicals(5),
    },
    {
      id: 'license_t1',
      name: 'T1 License',
      price: 25,
      unlockRank: 0,
      subtitle: 'Tier 1 Engineering Certification',
      description: 'Official certification required for crafting T1 Sprinklers, T1 Modules, and T1 equipment.',
      stock: inventory.license_t1 ?? inventory.licenseT1 ?? 0,
      previewType: 'icon' as const,
      icon: '📜',
      badgeText: 'T1',
      borderTheme: 'border-amber-500/40',
      badgeTheme: 'text-amber-300',
      btnTheme: 'bg-amber-600 hover:bg-amber-500',
      onBuy: () => onBuyEngineeringLicense(1, 25),
    },
    {
      id: 'license_t2',
      name: 'T2 License',
      price: 75,
      unlockRank: 1,
      subtitle: 'Tier 2 Engineering • Requires Rank 1',
      description: 'Advanced certification required for crafting T2 Sprinklers, T2 Workbench Upgrade, T2 Modules, and T2 Chassis.',
      stock: inventory.license_t2 ?? inventory.licenseT2 ?? 0,
      previewType: 'icon' as const,
      icon: '📜',
      badgeText: 'T2',
      borderTheme: 'border-sky-500/40',
      badgeTheme: 'text-sky-300',
      btnTheme: 'bg-sky-600 hover:bg-sky-500',
      onBuy: () => onBuyEngineeringLicense(2, 75),
    },
    {
      id: 'license_t3',
      name: 'T3 License',
      price: 200,
      unlockRank: 2,
      subtitle: 'Tier 3 Master Engineering • Requires Rank 2',
      description: 'Master certification required for crafting T3 Sprinklers, T3 Master Foundry Upgrade, T3 Modules, and T3 Vanguard Chassis.',
      stock: inventory.license_t3 ?? inventory.licenseT3 ?? 0,
      previewType: 'icon' as const,
      icon: '📜',
      badgeText: 'T3',
      borderTheme: 'border-purple-500/40',
      badgeTheme: 'text-purple-300',
      btnTheme: 'bg-purple-600 hover:bg-purple-500',
      onBuy: () => onBuyEngineeringLicense(3, 200),
    },
  ];

  const visibleEquipment = equipmentCatalog.filter(
    (item) => item.unlockRank <= effectiveBranchRank,
  );

  const isMapOwned = (mapId: string) => {
    if (mapId === 'area2_base') {
      return Boolean(inventory.has_map_highlands || inventory['area2_base'] || inventory.unlockedMaps?.includes('area2_base'));
    }
    if (mapId === 'area3_base') {
      return Boolean(inventory.has_map_overgrowth || inventory['area3_base'] || inventory.unlockedMaps?.includes('area3_base'));
    }
    return Boolean(inventory[mapId] || inventory.unlockedMaps?.includes(mapId));
  };

  const visibleMaps = MAPS_CATALOG.filter(
    (m) => m.showRank <= effectiveBranchRank && !isMapOwned(m.id),
  );

  const tabLengths: Record<string, number> = {
    maps: visibleMaps.length,
    grid_expansions: 1,
    expansions: 1,
    decorations: 10,
    decor: 10,
    equipment: visibleEquipment.length,
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
        const maxLen = tabLengths[currentTab] || 1;
        setFocusedShopIdx((i) => Math.min(maxLen - 1, i + 1));
        gameAudio?.playHoverMicroTone?.();
      } else if (e.key === 'Enter' || e.key === ' ' || e.key === 'e' || e.key === 'E') {
        e.preventDefault();
        if (currentTab === 'maps') {
          const map = visibleMaps[focusedShopIdx];
          if (map) {
            const owned = isMapOwned(map.id);
            const prereqMet = !map.prereqId || isMapOwned(map.prereqId);
            const cost = getPrice(map.cost);
            if (!owned && prereqMet && verdureBalance >= cost) {
              onBuyExpeditionMap(map.id, map.cost, map.name);
            }
          }
        } else if (currentTab === 'grid_expansions') {
          if (!isAllUnlocked && activeExpansion) {
            const discountedCost = getPrice(activeExpansion.cost);
            const reqRank = (activeExpansion as any).reqRank || 0;
            const isRankMet = effectiveBranchRank >= reqRank;
            const canAfford = verdureBalance >= discountedCost;
            if (isRankMet && canAfford) {
              onBuySanctuaryExpansion(activeExpansion.tier, activeExpansion.cost, activeExpansion.name);
            } else {
              gameAudio?.playErrorBuzz?.();
            }
          }
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
          const it = visibleEquipment[focusedShopIdx];
          if (it) it.onBuy();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentTab, focusedShopIdx, visibleEquipment, activeExpansion, isAllUnlocked, effectiveBranchRank, verdureBalance, onClose]);

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

      {/* Shop Navigation Tabs */}
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
          onClick={() => setTab('grid_expansions')}
          className={`py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
            currentTab === 'grid_expansions'
              ? 'bg-emerald-600 text-white shadow-md ring-2 ring-emerald-400/40'
              : 'bg-slate-800 text-slate-400 hover:bg-slate-750'
          }`}>
          <Maximize2 className="w-3.5 h-3.5" />
          <span>🏡 Grid Expansions</span>
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
              Base allowed travel is 60 steps. Purchase expansion maps to chart deeper wilderness and travel up to 160 steps from basecamp!
            </span>
          </div>

          {visibleMaps.length === 0 ? (
            <div className="p-8 text-center bg-slate-900/40 rounded-2xl border border-slate-800 space-y-2">
              <div className="text-3xl">🗺️</div>
              <h4 className="text-sm font-bold text-slate-200">
                All Available Wilderness Charts Acquired!
              </h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                All expedition expansion maps for your current rank have been charted. Progress Zen Master Quests at the Bonsai Society to unlock higher rank wilderness charts.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {visibleMaps.map((map, idx) => {
                const isFocused = focusedShopIdx === idx;
                const owned = isMapOwned(map.id);
                const prereqMet = !map.prereqId || isMapOwned(map.prereqId);
                const discountedPrice = getPrice(map.cost);
                const canAfford = verdureBalance >= discountedPrice;

                return (
                  <div
                    key={map.id}
                    className={`border p-3.5 rounded-2xl flex flex-col justify-between gap-2 shadow transition-all ${
                      isFocused
                        ? 'bg-slate-850 ring-4 ring-sky-400 border-sky-300 scale-[1.01] shadow-[0_0_20px_rgba(56,189,248,0.5)]'
                        : 'bg-slate-900/80 border-slate-800'
                    }`}>
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            style={{
                              backgroundColor: `${map.themeColor}20`,
                              borderColor: `${map.themeColor}50`,
                            }}
                            className="w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 shadow-inner">
                            <MapIcon style={{ color: map.accentColor }} className="w-6 h-6" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-bold text-xs sm:text-sm text-slate-100 flex items-center gap-1.5 flex-wrap">
                              {isFocused && <span className="text-sky-400 text-xs">► [E/A]</span>}
                              <span>{map.name}</span>
                              {owned && (
                                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold">
                                  ✓ Owned
                                </span>
                              )}
                            </h4>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span
                                style={{ color: map.accentColor }}
                                className="text-[10px] font-bold font-mono">
                                Area {map.areaNumber} • {map.stepsLabel}
                              </span>
                              {map.showRank > 0 && (
                                <span className="text-[9px] text-slate-400 bg-slate-950 px-1.5 py-0.2 rounded border border-slate-700 font-mono">
                                  Rank {map.showRank}+
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <span className="text-xs font-mono font-bold text-slate-300 shrink-0 bg-slate-950 px-2 py-0.5 rounded-lg border border-slate-800">
                          {discountedPrice} Verdure
                        </span>
                      </div>

                      <p className="text-xs text-slate-400 leading-relaxed mt-1">
                        {map.description}
                      </p>
                    </div>

                    <div className="pt-1">
                      {owned ? (
                        <button
                          disabled
                          className="w-full py-2 rounded-xl font-bold text-xs bg-slate-800 text-emerald-400 cursor-default border border-emerald-500/30 flex items-center justify-center gap-1.5">
                          <span>✓ Owned / Purchased</span>
                        </button>
                      ) : !prereqMet ? (
                        <button
                          disabled
                          className="w-full py-2 rounded-xl font-bold text-xs bg-slate-950/80 text-amber-400/80 cursor-not-allowed border border-amber-500/30 flex items-center justify-center gap-1.5">
                          <span>🔒 Requires {map.prereqName || 'Prerequisite Map'}</span>
                        </button>
                      ) : (
                        <button
                          disabled={!canAfford}
                          onClick={() => onBuyExpeditionMap(map.id, map.cost, map.name)}
                          className={`w-full py-2 rounded-xl font-bold text-xs transition-all shadow flex items-center justify-center gap-1.5 cursor-pointer ${
                            canAfford
                              ? 'bg-sky-600 hover:bg-sky-500 text-white active:scale-95'
                              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                          }`}>
                          <VerdureIcon className="w-3.5 h-3.5" />
                          <span>
                            Purchase ({discountedPrice} Verdure)
                            {discountRate > 0 ? ` [${Math.round(discountRate * 100)}% off]` : ''}
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
      )}

      {/* TAB 2: GRID EXPANSIONS (SINGLE PHASE PRESENTATION WITH INTERACTIVE SANCTUARY MINI-MAP) */}
      {currentTab === 'grid_expansions' && (
        <div className="flex-1 space-y-3 mb-3 overflow-y-auto pr-1">
          {/* Header Banner */}
          <div className="text-xs text-slate-400 bg-slate-900/60 p-2.5 rounded-2xl border border-slate-800 flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <Maximize2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                Sanctuary Cultivation Blueprint: Visualizes the tri-field layout (Central 16×16 &amp; Flanking 8×8 Wings).
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-emerald-300 bg-slate-950 px-2.5 py-1 rounded-lg border border-emerald-500/40">
                Cultivated: <strong>{unlockedCount}</strong> / 384 Plots ({Math.round((unlockedCount / 384) * 100)}%)
              </span>
            </div>
          </div>

          {/* Interactive Layout: Mini-Map on Left/Center & Single Phase Card on Right */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
            {/* MINI-MAP CONTAINER */}
            <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 p-3 sm:p-4 rounded-2xl flex flex-col items-center shadow-lg">
              <SanctuaryMiniMap
                currentTier={currentTier}
                targetTier={isAllUnlocked ? undefined : nextTier}
                isAllUnlocked={isAllUnlocked}
              />

              {/* Color-Coded Mini-Map Legend */}
              <div className="flex items-center justify-center gap-4 text-[11px] font-bold text-slate-300 mt-3 pt-2.5 border-t border-slate-800/80 w-full flex-wrap">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-xs bg-emerald-500 border border-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.5)]" />
                  <span className="text-emerald-300">Unlocked ({unlockedCount})</span>
                </div>
                {!isAllUnlocked && (
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-xs bg-amber-500 border border-yellow-300 animate-pulse shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
                    <span className="text-amber-300 font-black">Next Phase (+{pendingCount})</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-xs bg-slate-800 border border-slate-700" />
                  <span className="text-slate-500">Locked ({lockedCount})</span>
                </div>
              </div>
            </div>

            {/* SINGLE ACTIVE EXPANSION PHASE CARD OR COMPLETION BADGE */}
            <div className="lg:col-span-5 flex flex-col justify-center">
              {isAllUnlocked ? (
                /* All 8 Expansions Unlocked Grand Completion Badge */
                <div className="bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 border-2 border-emerald-400 p-6 rounded-2xl text-center space-y-4 shadow-2xl">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-4xl shadow-[0_0_25px_rgba(52,211,153,0.5)] animate-pulse">
                    🏆
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-emerald-300 tracking-wide">
                      Sanctuary Fully Cultivated
                    </h4>
                    <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                      All 8 expansion phases completed! The entire tri-field sanctuary—including the central 16×16 greenhouse and both flanking 8×8 botanical terraces—is fully cultivated and flourishing with all 384 plots accessible.
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-2 bg-emerald-900/60 border border-emerald-400/60 px-3.5 py-1.5 rounded-full text-xs font-bold text-emerald-200 shadow">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>384 / 384 Plots Cultivated (100% Unlocked)</span>
                  </div>
                </div>
              ) : activeExpansion ? (() => {
                const reqRank = (activeExpansion as any).reqRank ?? (
                  activeExpansion.tier <= 4 ? 0 : activeExpansion.tier <= 6 ? 1 : 2
                );
                const isRankMet = effectiveBranchRank >= reqRank;
                const discountedExpCost = getPrice(activeExpansion.cost);
                const canAfford = verdureBalance >= discountedExpCost;
                const deficit = Math.max(0, discountedExpCost - verdureBalance);
                const impactDesc = (activeExpansion as any).impact || activeExpansion.description;

                return (
                  <div className="bg-slate-900/95 border-2 border-amber-500/70 p-4 sm:p-5 rounded-2xl flex flex-col justify-between gap-3 shadow-xl">
                    <div className="space-y-2.5">
                      {/* Phase Tag & Status */}
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className="text-[11px] font-mono font-bold uppercase tracking-wider bg-amber-950 text-amber-300 border border-amber-500/50 px-2.5 py-0.5 rounded-lg">
                          Phase {activeExpansion.tier} of 8
                        </span>
                        <span className="text-xs font-mono font-bold text-emerald-400 bg-slate-950 px-2 py-0.5 rounded-lg border border-slate-800">
                          {activeExpansion.plots} Total Plots
                        </span>
                      </div>

                      {/* Expansion Title */}
                      <h4 className="text-base sm:text-lg font-black text-slate-100">
                        {activeExpansion.name}
                      </h4>

                      {/* Impact Description Banner */}
                      <div className="bg-amber-950/40 border border-amber-500/40 p-2.5 rounded-xl text-xs font-semibold text-amber-200">
                        <span className="text-amber-400 font-bold block mb-0.5">Territory Impact:</span>
                        <span>{impactDesc}</span>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed">
                        {activeExpansion.description}
                      </p>

                      {/* Master Quest Rank Requirement Badge */}
                      <div className="pt-1">
                        {reqRank === 0 ? (
                          <div className="flex items-center gap-2 text-xs text-emerald-300 font-bold bg-emerald-950/80 border border-emerald-500/40 px-3 py-1.5 rounded-xl shadow-sm">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                            <span>Rank 0 (Available from Start)</span>
                          </div>
                        ) : isRankMet ? (
                          <div className="flex items-center gap-2 text-xs text-emerald-300 font-bold bg-emerald-950/80 border border-emerald-500/40 px-3 py-1.5 rounded-xl shadow-sm">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                            <span>✓ Rank {reqRank}+ Branch Finished (Current Max: Rank {effectiveBranchRank})</span>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-xs text-amber-300 font-bold bg-amber-950/90 border border-amber-500/70 px-3 py-1.5 rounded-xl shadow-sm">
                              <Lock className="w-4 h-4 text-amber-400 shrink-0" />
                              <span>🔒 Requires Rank {reqRank} Branch Finished (Current Max: Rank {effectiveBranchRank})</span>
                            </div>
                            <p className="text-[11px] text-slate-400 leading-tight">
                              Complete at least one Master Quest branch (Discovery, Competition, or Eco) to Rank {reqRank} at the Bonsai Society to qualify.
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Pricing Breakdown */}
                      <div className="bg-slate-950/90 border border-slate-800 p-2.5 rounded-xl flex items-center justify-between text-xs font-bold">
                        <span className="text-slate-400">Expansion Price:</span>
                        <div className="flex items-center gap-1.5">
                          {discountRate > 0 && (
                            <span className="line-through text-slate-500 text-xs font-mono">
                              {activeExpansion.cost}
                            </span>
                          )}
                          <span className="text-emerald-300 font-black font-mono text-sm">
                            {discountedExpCost} Verdure
                          </span>
                          {discountRate > 0 && (
                            <span className="text-[10px] text-amber-300 bg-amber-950 border border-amber-500/50 px-1.5 py-0.5 rounded font-mono">
                              -{Math.round(discountRate * 100)}%
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Interactive Action Button */}
                    <div className="pt-2">
                      {!isRankMet ? (
                        <button
                          disabled
                          className="w-full py-3 rounded-xl font-bold text-xs bg-slate-850 text-amber-400/80 border border-amber-500/40 cursor-not-allowed flex items-center justify-center gap-2 shadow-sm">
                          <Lock className="w-4 h-4 text-amber-400" />
                          <span>🔒 Requires Rank {reqRank} Branch Finished</span>
                        </button>
                      ) : !canAfford ? (
                        <button
                          disabled
                          className="w-full py-3 rounded-xl font-bold text-xs bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed flex items-center justify-center gap-2">
                          <VerdureIcon className="w-4 h-4 opacity-50" />
                          <span>Need {deficit.toFixed(0)} More Verdure</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => onBuySanctuaryExpansion(activeExpansion.tier, activeExpansion.cost, activeExpansion.name)}
                          className="w-full py-3 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/60 ring-1 ring-emerald-400/50 flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-95">
                          <VerdureIcon className="w-4 h-4" />
                          <span>Purchase Expansion ({discountedExpCost} Verdure)</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })() : null}
            </div>
          </div>
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

      {/* TAB 4: EQUIPMENT & NURSERY TOOLS (2xX GRID) */}
      {currentTab === 'equipment' && (
        <div className="flex-1 space-y-2.5 mb-3 overflow-y-auto pr-1">
          <div className="text-xs text-slate-400 bg-slate-900/60 p-2.5 rounded-2xl border border-slate-800 flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <Wrench className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                Manual irrigation systems, composting, chemical processors, and engineering licenses.
              </span>
            </div>
            {effectiveBranchRank < 2 && (
              <span className="text-[11px] font-mono font-bold text-amber-300/90 bg-amber-950/60 border border-amber-500/30 px-2 py-0.5 rounded-lg">
                Higher tier licenses unlock with Master Quest branch ranks (Rank 1 &amp; 2)
              </span>
            )}
          </div>

          {/* 2 by X Grid matching the Decorations tab layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {visibleEquipment.map((item, idx) => {
              const isFocused = focusedShopIdx === idx;
              const discountedPrice = getPrice(item.price);
              const canAfford = verdureBalance >= discountedPrice;

              return (
                <div
                  key={item.id}
                  className={`border p-3.5 rounded-2xl flex flex-col justify-between gap-2 shadow transition-all ${
                    isFocused
                      ? 'bg-slate-850 ring-4 ring-amber-400 border-amber-300 scale-[1.01] shadow-[0_0_20px_rgba(251,191,36,0.5)]'
                      : `bg-slate-900/80 ${item.borderTheme}`
                  }`}>
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2.5">
                        {item.previewType === 'preview' && item.itemKey ? (
                          <ItemVectorPreview itemKey={item.itemKey} width={44} height={44} />
                        ) : (
                          <div className="w-[44px] h-[44px] rounded-xl border border-slate-700 bg-slate-950/80 shrink-0 shadow-inner flex flex-col items-center justify-center">
                            <span className="text-xl">{item.icon}</span>
                            {item.badgeText && (
                              <span className="text-[9px] font-black font-mono text-amber-300 leading-none mt-0.5">
                                {item.badgeText}
                              </span>
                            )}
                          </div>
                        )}
                        <div>
                          <h4 className="font-bold text-xs sm:text-sm text-slate-100 flex items-center gap-1.5">
                            {isFocused && <span className="text-amber-400 text-xs">► [E/A]</span>}
                            <span>{item.name}</span>
                          </h4>
                          <span className={`text-[10px] font-bold ${item.badgeTheme}`}>
                            {item.subtitle}
                          </span>
                        </div>
                      </div>
                      <span className={`text-xs bg-slate-950 border px-2 py-0.5 rounded-lg font-mono font-bold ${item.badgeTheme} border-slate-700`}>
                        Stock: {item.stock}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <button
                    disabled={!canAfford}
                    onClick={item.onBuy}
                    className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all shadow flex items-center justify-center gap-1.5 cursor-pointer ${
                      canAfford
                        ? `${item.btnTheme} text-white active:scale-95`
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}>
                    <VerdureIcon className="w-3.5 h-3.5" />
                    <span>
                      Purchase ({discountedPrice} Verdure)
                      {discountRate > 0 ? ` [${Math.round(discountRate * 100)}% off]` : ''}
                    </span>
                  </button>
                </div>
              );
            })}
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
