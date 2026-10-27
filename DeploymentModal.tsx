import React, { useEffect, useRef, useState } from 'react';
import {
  Sprout,
  Wrench,
  Sun,
  Wind,
  Droplets,
  Package,
  X,
  Sparkles,
  Bookmark,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import {
  BonsaiLeafType,
  BonsaiStyle,
  MaturityTier,
  getLeafTypeDef,
  getMaturityDef,
  drawLeafShape,
  calculateDonationValue,
  getStyleAttributeWeights,
  drawBonsaiTrunkAndCanopy,
} from './bonsaiData';
import {
  SeedlingItem,
  BonsaiAttributes,
  DEFAULT_BONSAI_ATTRIBUTES,
  getAttributeTier,
  BONSAI_NATURES,
  BonsaiNature,
  getBonsaiNature,
  calculateBaseAesthetic,
  GridPlacementPreview,
} from './types';
import {
  SanctuaryInventory,
  StoredPottedBonsai,
  PlantedBonsai,
  DeployedStructure,
  DeployedStructureType,
  getBonsaiGroupBadgeClass,
  getBonsaiStyleDef,
  getStructureInventoryCount,
} from './App';
import { gameAudio } from './utils/helper';

export function formatStyleWeightsString(style?: string): string {
  const w = getStyleAttributeWeights(style);
  return `🍃 ${w.foliage.toFixed(1)} • 🪵 ${w.branches.toFixed(1)} • 🌲 ${w.trunk.toFixed(1)} • 🪴 ${w.roots.toFixed(1)}`;
}

export function getNatureFactor(
  attr: 'foliage' | 'branches' | 'trunk' | 'roots',
  nature?: BonsaiNature | string,
): { factor: number; arrow: string; colorClass: string; factorLabel: string } {
  const nat = getBonsaiNature(nature);
  const upAttr = (nat.upAttribute || (nat as any).up || '').toLowerCase();
  const downAttr = (nat.downAttribute || (nat as any).down || '').toLowerCase();

  if (upAttr === attr) {
    return {
      factor: 1.1,
      arrow: '⬆',
      colorClass: 'text-emerald-400 font-bold',
      factorLabel: '⬆ 1.1x',
    };
  }
  if (downAttr === attr) {
    return {
      factor: 0.9,
      arrow: '⬇',
      colorClass: 'text-rose-400 font-bold',
      factorLabel: '⬇ 0.9x',
    };
  }
  return {
    factor: 1.0,
    arrow: '•',
    colorClass: 'text-slate-400 font-medium',
    factorLabel: '• 1.0x',
  };
}

export interface DeploymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  inventory: SanctuaryInventory;
  seedlingList: SeedlingItem[];
  storedBonsais: StoredPottedBonsai[];
  plantedBonsais: PlantedBonsai[];
  deployedStructures: DeployedStructure[];
  onPlantSeedling: (seedling: SeedlingItem, style: BonsaiStyle, nature?: BonsaiNature) => void;
  onPlantStoredBonsai: (storedId: string) => void;
  onDeployStructure: (type: DeployedStructureType) => void;
  onStartPlacementPreview?: (preview: GridPlacementPreview) => void;
  onOpenFullInventory?: () => void;
  initialSelectedSeedling?: SeedlingItem | null;
}

export type DeploymentCategory = 'seedlings' | 'bonsais' | 'infrastructure' | 'decorations';

const STYLES: BonsaiStyle[] = [
  'CHOKAN',
  'MOYOGI',
  'SHAKAN',
  'HAN_KENGAI',
  'SOKAN',
  'KENGAI',
  'KABUDACHI',
];

/**
 * Miniature Live Canvas Preview for Bonsai Styles (Chokan, Moyogi, Shakan, etc.)
 */
export function BonsaiStyleThumbnail({
  leafType,
  styleKey,
  color,
  flowerColor,
  width = 86,
  height = 74,
}: {
  leafType: BonsaiLeafType;
  styleKey: BonsaiStyle;
  color: string;
  flowerColor: string;
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

    // Mini backdrop glow
    const bgGrad = ctx.createRadialGradient(w / 2, h / 2, 4, w / 2, h / 2, w / 2);
    bgGrad.addColorStop(0, 'rgba(30, 41, 59, 0.9)');
    bgGrad.addColorStop(1, 'rgba(15, 23, 42, 0.95)');
    ctx.fillStyle = bgGrad;
    ctx.beginPath();
    ctx.roundRect(0, 0, w, h, 6);
    ctx.fill();

    const scale = Math.min(w / 86, h / 74);
    const bx = w / 2;
    const by = h - Math.max(8, 16 * scale);
    const stageScale = 0.52 * scale;
    const trunkHeight = 26 * scale;
    const trunkThickness = Math.max(1.8, 3.6 * scale);

    // Pot shadow
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.beginPath();
    ctx.ellipse(bx, by + 6 * scale, 18 * scale, 4 * scale, 0, 0, Math.PI * 2);
    ctx.fill();

    // Ceramic pot
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.roundRect(bx - 18 * scale, by - 3 * scale, 36 * scale, 11 * scale, [2 * scale, 2 * scale, 4 * scale, 4 * scale]);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.4)';
    ctx.lineWidth = Math.max(0.6, 0.8 * scale);
    ctx.stroke();

    // Soil
    ctx.fillStyle = '#3b1802';
    ctx.beginPath();
    ctx.ellipse(bx, by - 2 * scale, 15 * scale, 3 * scale, 0, 0, Math.PI * 2);
    ctx.fill();

    // Render procedural vector trunk & foliage pads supporting all 7 styles
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
      flowerColor,
    );
  }, [leafType, styleKey, color, flowerColor, width, height]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width, height }}
      className="rounded-lg border border-slate-700 bg-slate-950/80 shrink-0 shadow-inner pointer-events-none"
    />
  );
}

/**
 * Clean vector species icon preview for seedling cards (round square container)
 */
function SeedlingSpeciesIcon({
  leafType,
  color,
  accentColor,
}: {
  leafType: BonsaiLeafType;
  color?: string;
  accentColor?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const size = 44;
    canvas.width = size * 2;
    canvas.height = size * 2;
    ctx.setTransform(2, 0, 0, 2, 0, 0);
    ctx.clearRect(0, 0, size, size);

    // Soil base shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.beginPath();
    ctx.ellipse(22, 38, 14, 4.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Little seedling stem
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 2.8;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(22, 38);
    ctx.quadraticCurveTo(19, 28, 22, 18);
    ctx.stroke();

    // Seedling foliage using authentic leaf shape
    drawLeafShape(ctx, 22, 14, 12, leafType, color || '#10b981', accentColor || '#34d399');
  }, [leafType, color, accentColor]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: 44, height: 44 }}
      className="pointer-events-none drop-shadow shrink-0"
    />
  );
}

export default function DeploymentModal({
  isOpen,
  onClose,
  inventory: inv,
  seedlingList,
  storedBonsais,
  plantedBonsais,
  deployedStructures,
  onPlantSeedling,
  onPlantStoredBonsai,
  onDeployStructure,
  onStartPlacementPreview,
  onOpenFullInventory,
  initialSelectedSeedling,
}: DeploymentModalProps) {
  const [activeCategory, setActiveCategory] = useState<DeploymentCategory>('seedlings');
  const [selectedSeedlingForStyle, setSelectedSeedlingForStyle] = useState<SeedlingItem | null>(null);
  const [activeStyleIdx, setActiveStyleIdx] = useState<number>(0);
  const [focusedItemIdx, setFocusedItemIdx] = useState<number>(0);

  useEffect(() => {
    if (initialSelectedSeedling) {
      setSelectedSeedlingForStyle(initialSelectedSeedling);
      setActiveStyleIdx(0);
    } else if (!isOpen) {
      setSelectedSeedlingForStyle(null);
    }
  }, [initialSelectedSeedling, isOpen]);

  // Reset focused item index when switching categories
  useEffect(() => {
    setFocusedItemIdx(0);
  }, [activeCategory]);

  const compostCount = getStructureInventoryCount(inv, 'tool_compost_heap');
  const wellCount = getStructureInventoryCount(inv, 'tool_garden_well');
  const solarCount = getStructureInventoryCount(inv, 'solar_panel');
  const windCount = getStructureInventoryCount(inv, 'wind_turbine');
  const toriiGateCount =
    inv.torii_gate_inv ||
    inv.decorations?.toriiGate ||
    inv.decorations?.['torii_gate'] ||
    0;

  const infraItems: DeployedStructureType[] = [
    'solar_panel',
    'wind_turbine',
    'tool_garden_well',
    'tool_compost_heap',
  ];

  const decorItems: DeployedStructureType[] = [
    'decor_pebble_path',
    'decor_rock_formation',
    'decor_shrubbery_bush',
    'decor_woven_wall',
    'torii_gate',
    'crystal_pedestal_foliage',
    'crystal_pedestal_branches',
    'crystal_pedestal_trunk',
    'crystal_pedestal_roots',
  ];

  // Handle keyboard navigation and gamepad events
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedSeedlingForStyle) {
        // "Choose Style to Plant" view
        if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
          e.preventDefault();
          setActiveStyleIdx((idx) => (idx - 1 + STYLES.length) % STYLES.length);
          gameAudio.playCrispClick();
        } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
          e.preventDefault();
          setActiveStyleIdx((idx) => (idx + 1) % STYLES.length);
          gameAudio.playCrispClick();
        } else if (e.key === 'Enter' || e.key === ' ' || e.key === 'e' || e.key === 'E') {
          e.preventDefault();
          const curStyleKey = STYLES[activeStyleIdx] || 'CHOKAN';
          const natureObj = selectedSeedlingForStyle.nature
            ? getBonsaiNature(selectedSeedlingForStyle.nature)
            : undefined;
          gameAudio.playConfirmSelect();
          if (onStartPlacementPreview) {
            onStartPlacementPreview({
              category: 'seedling',
              payload: selectedSeedlingForStyle,
              width: 1,
              height: 1,
              orientation: 'horizontal',
              style: curStyleKey,
              nature: natureObj,
            });
          } else {
            onPlantSeedling(selectedSeedlingForStyle, curStyleKey, natureObj);
          }
          setSelectedSeedlingForStyle(null);
          onClose();
        } else if (e.key === 'Escape') {
          e.preventDefault();
          setSelectedSeedlingForStyle(null);
          gameAudio.playCrispClick();
        }
      } else {
        // Main Deployment modal view
        if (e.key === 'Escape') {
          e.preventDefault();
          onClose();
        } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
          e.preventDefault();
          const cats: DeploymentCategory[] = ['seedlings', 'bonsais', 'infrastructure', 'decorations'];
          setActiveCategory((cur) => {
            const idx = cats.indexOf(cur);
            return cats[(idx - 1 + cats.length) % cats.length];
          });
          gameAudio.playCrispClick();
        } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
          e.preventDefault();
          const cats: DeploymentCategory[] = ['seedlings', 'bonsais', 'infrastructure', 'decorations'];
          setActiveCategory((cur) => {
            const idx = cats.indexOf(cur);
            return cats[(idx + 1) % cats.length];
          });
          gameAudio.playCrispClick();
        } else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
          e.preventDefault();
          setFocusedItemIdx((idx) => Math.max(0, idx - 1));
          gameAudio.playHoverMicroTone();
        } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
          e.preventDefault();
          let maxCount = 1;
          if (activeCategory === 'seedlings') maxCount = seedlingList.length;
          else if (activeCategory === 'bonsais') maxCount = storedBonsais.length;
          else if (activeCategory === 'infrastructure') maxCount = infraItems.length;
          else if (activeCategory === 'decorations') maxCount = decorItems.length;
          setFocusedItemIdx((idx) => Math.min(Math.max(0, maxCount - 1), idx + 1));
          gameAudio.playHoverMicroTone();
        } else if (e.key === 'Enter' || e.key === ' ' || e.key === 'e' || e.key === 'E') {
          e.preventDefault();
          if (activeCategory === 'seedlings' && seedlingList[focusedItemIdx]) {
            setSelectedSeedlingForStyle(seedlingList[focusedItemIdx]);
            setActiveStyleIdx(0);
            gameAudio.playCrispClick();
          } else if (activeCategory === 'bonsais' && storedBonsais[focusedItemIdx]) {
            gameAudio.playCrispClick();
            if (onStartPlacementPreview) {
              onStartPlacementPreview({
                category: 'bonsai',
                payload: storedBonsais[focusedItemIdx],
                width: 1,
                height: 1,
                orientation: 'horizontal',
              });
            } else {
              onPlantStoredBonsai(storedBonsais[focusedItemIdx].id);
            }
            onClose();
          } else if (activeCategory === 'infrastructure') {
            const item = infraItems[focusedItemIdx];
            if (item) {
              const count = getStructureInventoryCount(inv, item);
              if (count > 0) {
                gameAudio.playCrispClick();
                if (onStartPlacementPreview) {
                  onStartPlacementPreview({
                    category: 'infrastructure',
                    payload: item,
                    width: 1,
                    height: 1,
                    orientation: 'horizontal',
                  });
                } else {
                  onDeployStructure(item);
                }
                onClose();
              } else {
                gameAudio.playErrorBuzz();
              }
            }
          } else if (activeCategory === 'decorations') {
            const item = decorItems[focusedItemIdx];
            if (item) {
              const count = getStructureInventoryCount(inv, item);
              if (count > 0) {
                gameAudio.playCrispClick();
                if (onStartPlacementPreview) {
                  onStartPlacementPreview({
                    category: 'decoration',
                    payload: item,
                    width: item === 'torii_gate' ? 3 : 1,
                    height: 1,
                    orientation: 'horizontal',
                  });
                } else {
                  onDeployStructure(item);
                }
                onClose();
              } else {
                gameAudio.playErrorBuzz();
              }
            }
          }
        }
      }
    };

    const handleBumper = (e: Event) => {
      const ce = e as CustomEvent<{direction: 'left' | 'right'}>;
      const dir = ce.detail?.direction;
      if (selectedSeedlingForStyle) {
        setActiveStyleIdx((idx) =>
          dir === 'right' ? (idx + 1) % STYLES.length : (idx - 1 + STYLES.length) % STYLES.length,
        );
        gameAudio.playCrispClick();
      } else {
        const cats: DeploymentCategory[] = ['seedlings', 'bonsais', 'infrastructure', 'decorations'];
        setActiveCategory((cur) => {
          const idx = cats.indexOf(cur);
          const nextIdx = dir === 'right' ? (idx + 1) % cats.length : (idx - 1 + cats.length) % cats.length;
          return cats[nextIdx];
        });
        gameAudio.playCrispClick();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('gamepad-bumper', handleBumper);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('gamepad-bumper', handleBumper);
    };
  }, [
    isOpen,
    selectedSeedlingForStyle,
    activeStyleIdx,
    activeCategory,
    focusedItemIdx,
    seedlingList,
    storedBonsais,
    inv,
    onPlantSeedling,
    onPlantStoredBonsai,
    onDeployStructure,
    onStartPlacementPreview,
    onClose,
  ]);

  if (!isOpen) return null;

  const decorCount =
    (inv.decor_pebble_path_inv || 0) +
    (inv.decor_rock_formation_inv || 0) +
    (inv.decor_shrubbery_bush_inv || 0) +
    (inv.decor_woven_wall_inv || 0) +
    (inv.torii_gate_inv || inv.decorations?.toriiGate || inv.decorations?.['torii_gate'] || 0) +
    (inv.crystal_pedestal_foliage_inv || 0) +
    (inv.crystal_pedestal_branches_inv || 0) +
    (inv.crystal_pedestal_trunk_inv || 0) +
    (inv.crystal_pedestal_roots_inv || 0);

  const attributeRowConfigs = [
    {
      key: 'foliage' as const,
      name: 'Foliage',
      icon: '🍃',
      textClass: 'text-emerald-400 font-bold',
      barClass: 'bg-gradient-to-r from-emerald-600 via-emerald-500 to-green-400',
    },
    {
      key: 'branches' as const,
      name: 'Branches',
      icon: '🪵',
      textClass: 'text-amber-400 font-bold',
      barClass: 'bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-400',
    },
    {
      key: 'trunk' as const,
      name: 'Trunk',
      icon: '🌲',
      textClass: 'text-rose-400 font-bold',
      barClass: 'bg-gradient-to-r from-rose-600 via-rose-500 to-orange-400',
    },
    {
      key: 'roots' as const,
      name: 'Roots',
      icon: '🪴',
      textClass: 'text-blue-400 font-bold',
      barClass: 'bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-400',
    },
  ];

  return (
    <div className="fixed top-12 left-0 right-0 bottom-0 z-40 bg-slate-950/95 backdrop-blur-md p-3 sm:p-4 md:p-5 flex flex-col overflow-hidden border-t border-slate-800 text-left select-none">
      {/* ========================================================================= */}
      {/* 1. SEAMLESS "CHOOSE STYLE TO PLANT" FULL OVERLAY VIEW (NON-SCROLLING) */}
      {/* Renders in the EXACT same frame as Grid Deployment, eliminating nested modal */}
      {/* ========================================================================= */}
      {selectedSeedlingForStyle ? (() => {
        const seedling = selectedSeedlingForStyle;
        const leafType = seedling.leafType as BonsaiLeafType;
        const leafDef = getLeafTypeDef(leafType);
        const matDef = getMaturityDef(seedling.maturity as MaturityTier);
        const natureObj = seedling.nature
          ? getBonsaiNature(seedling.nature)
          : BONSAI_NATURES[Math.abs((seedling.id || 'seedling').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)) % BONSAI_NATURES.length];
        const attrs: BonsaiAttributes =
          seedling.geneticPotential || seedling.attributes || DEFAULT_BONSAI_ATTRIBUTES;

        const curStyleKey = STYLES[activeStyleIdx] || 'CHOKAN';
        const curStyleDef = getBonsaiStyleDef(curStyleKey);
        const weights = getStyleAttributeWeights(curStyleKey);

        // Compute combined multipliers: Combined = NatureFactor + StyleWeight - 1
        const natFoliage = getNatureFactor('foliage', natureObj).factor;
        const natBranches = getNatureFactor('branches', natureObj).factor;
        const natTrunk = getNatureFactor('trunk', natureObj).factor;
        const natRoots = getNatureFactor('roots', natureObj).factor;

        const combFoliage = Number((natFoliage + weights.foliage - 1).toFixed(2));
        const combBranches = Number((natBranches + weights.branches - 1).toFixed(2));
        const combTrunk = Number((natTrunk + weights.trunk - 1).toFixed(2));
        const combRoots = Number((natRoots + weights.roots - 1).toFixed(2));

        const combinedValues: Record<'foliage' | 'branches' | 'trunk' | 'roots', number> = {
          foliage: combFoliage,
          branches: combBranches,
          trunk: combTrunk,
          roots: combRoots,
        };

        const getStyleFactorDisplay = (weightVal: number) => {
          if (weightVal > 1.0) {
            return {
              arrow: '⬆',
              text: `${weightVal.toFixed(1)}x`,
              classNames: 'text-emerald-400 font-bold',
            };
          }
          if (weightVal < 1.0) {
            return {
              arrow: '⬇',
              text: `${weightVal.toFixed(1)}x`,
              classNames: 'text-rose-400 font-bold',
            };
          }
          return {
            arrow: '•',
            text: '1.0x',
            classNames: 'text-slate-400 font-medium',
          };
        };

        const getCombinedSynergyDisplay = (combVal: number) => {
          if (combVal > 1.0) {
            return {
              arrow: '⬆',
              text: `${combVal.toFixed(1)}x`,
              classNames: 'text-emerald-400 font-bold',
            };
          }
          if (combVal < 1.0) {
            return {
              arrow: '⬇',
              text: `${combVal.toFixed(1)}x`,
              classNames: 'text-rose-400 font-bold',
            };
          }
          return {
            arrow: '•',
            text: '1.0x',
            classNames: 'text-slate-400 font-medium',
          };
        };

        return (
          <div className="flex flex-col h-full justify-between overflow-hidden max-w-4xl w-full mx-auto">
            {/* Header and top tabs given flex-shrink-0 mb-3 */}
            <div className="flex-shrink-0 mb-3 space-y-2">
              {/* Header: Compact title with seedling name, maturity, and Nature pill */}
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-950/90 border border-emerald-500/50 flex items-center justify-center shrink-0 shadow-inner">
                    <Sprout className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
                  </div>
                  <div className="min-w-0 flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm sm:text-base font-black text-slate-100 truncate">
                      Choose Style to Plant: {seedling.name || `${leafDef.name} Bonsai`}
                    </h3>
                    <span
                      style={{
                        backgroundColor: matDef.bg,
                        borderColor: matDef.border,
                        color: matDef.color,
                      }}
                      className="text-[10px] px-2 py-0.5 rounded-full font-black border flex items-center gap-1 shadow-sm shrink-0">
                      <span>{matDef.kanji}</span>
                      <span>— {matDef.name}</span>
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-purple-950/90 border border-purple-500/70 text-purple-300 flex items-center gap-1 shadow-sm shrink-0">
                      <Sparkles className="w-3 h-3 text-purple-400" />
                      <span>Nature: {natureObj.name} ({natureObj.descriptor})</span>
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedSeedlingForStyle(null)}
                  className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition-colors cursor-pointer shrink-0"
                  title="Back to Seedlings">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Style Quick Tabs: Sleek horizontal row of all 7 style buttons */}
              <div className="flex items-center justify-start sm:justify-center gap-1.5 sm:gap-2 overflow-x-auto py-0.5 px-1 w-full no-scrollbar">
                {STYLES.map((stKey, sIdx) => {
                  const def = getBonsaiStyleDef(stKey);
                  const isActive = sIdx === activeStyleIdx;
                  return (
                    <button
                      key={stKey}
                      onClick={() => {
                        setActiveStyleIdx(sIdx);
                        gameAudio.playCrispClick();
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all shadow-sm cursor-pointer ${
                        isActive
                          ? 'bg-emerald-600 text-white ring-2 ring-emerald-400/50 shadow-emerald-950/80 scale-[1.02]'
                          : 'bg-slate-900/90 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800'
                      }`}>
                      <span>{def.japanese}</span>
                      <span className="text-[10px] ml-1 opacity-75 font-normal">({def.kanji})</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Main Center Area: Left arrow, Middle card, Right arrow */}
            <div className="my-auto flex items-center justify-between gap-2 sm:gap-4 w-full max-w-4xl mx-auto min-h-0">
              {/* Left Arrow Button */}
              <button
                onClick={() => {
                  setActiveStyleIdx((activeStyleIdx - 1 + STYLES.length) % STYLES.length);
                  gameAudio.playCrispClick();
                }}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-emerald-400 hover:text-emerald-300 border border-slate-700/80 hover:border-emerald-500/80 flex items-center justify-center shrink-0 shadow-lg active:scale-95 transition-all text-lg sm:text-xl font-bold cursor-pointer"
                title="Previous Style">
                ◀
              </button>

              {/* Middle Card - Given my-auto py-3 px-5 with controlled height */}
              <div className="flex-1 w-full max-w-3xl mx-auto bg-slate-900/90 border border-emerald-500/30 rounded-2xl my-auto py-3 px-5 shadow-xl flex flex-col justify-between gap-2.5">
                {/* Vector Tree preview (~44-52px height) + Style title & description */}
                <div className="flex items-center gap-3">
                  <div className="shrink-0 bg-slate-950 rounded-xl p-0.5 border border-slate-800 shadow-inner flex items-center justify-center">
                    <BonsaiStyleThumbnail
                      leafType={leafType}
                      styleKey={curStyleKey}
                      color={seedling.color || leafDef.color}
                      flowerColor={seedling.flowerColor || leafDef.accentColor}
                      width={64}
                      height={50}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="text-sm sm:text-base font-black text-slate-100">
                          {curStyleDef.japanese} ({curStyleDef.name})
                        </h4>
                        <span className="text-[10px] bg-slate-950 px-1.5 py-0.2 rounded font-mono text-emerald-400 border border-slate-800 font-bold">
                          {curStyleDef.kanji}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono shrink-0">
                        {activeStyleIdx + 1} / 7
                      </span>
                    </div>
                    <p className="text-xs text-emerald-300 font-medium truncate mt-0.5">
                      {curStyleDef.subtitle}
                    </p>
                    <p className="text-[11px] text-slate-400 line-clamp-1 leading-snug">
                      {curStyleDef.description}
                    </p>
                  </div>
                </div>

                {/* Unified 4-Column Attributes & Synergy Table */}
                <div className="bg-slate-950/85 border border-slate-800/90 rounded-xl p-2.5 sm:p-3 space-y-1.5">
                  {/* Distinct 4-Column Header Row */}
                  <div className="flex items-center gap-2 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider pb-1.5 border-b border-slate-800/80">
                    <div className="flex-1 min-w-0 flex items-center gap-1.5 text-slate-400">
                      <Bookmark className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Seedling Attributes</span>
                    </div>
                    <div className="w-16 sm:w-20 text-center text-slate-300 font-bold shrink-0 leading-tight">
                      Nature<br />Factor
                    </div>
                    <div className="w-16 sm:w-20 text-center text-slate-300 font-bold shrink-0 leading-tight">
                      Style<br />Factor
                    </div>
                    <div className="w-20 sm:w-24 text-center text-slate-300 font-bold shrink-0 leading-tight">
                      Combined<br />Synergy
                    </div>
                  </div>

                  {/* 4 Rows for Foliage, Branches, Trunk, Roots */}
                  {attributeRowConfigs.map((attr) => {
                    const val = attrs[attr.key] || 0;
                    const tier = getAttributeTier(val);
                    const natFactor = getNatureFactor(attr.key, natureObj);
                    const weightVal = weights[attr.key];
                    const factorDisplay = getStyleFactorDisplay(weightVal);
                    const combVal = combinedValues[attr.key];
                    const combDisplay = getCombinedSynergyDisplay(combVal);

                    return (
                      <div
                        key={attr.key}
                        className="flex items-center gap-2 py-1 border-b border-slate-900/60 last:border-b-0">
                        {/* Col 1: Attribute name + tier label + progress bar */}
                        <div className="flex-1 min-w-0 space-y-1 pr-2">
                          <div className="flex items-center gap-1.5 text-xs">
                            <span className="text-[12px]">{attr.icon}</span>
                            <span className={attr.textClass}>{attr.name}</span>
                            <span className="text-xs text-slate-400 font-medium ml-1.5">
                              {tier}
                            </span>
                          </div>
                          <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-800/80">
                            <div
                              style={{ width: `${val <= 0 ? 0 : Math.min(100, val)}%` }}
                              className={`h-full rounded-full ${attr.barClass}`}
                            />
                          </div>
                        </div>

                        {/* Col 2: Nature Factor */}
                        <div className="w-16 sm:w-20 text-center shrink-0">
                          <span className={`text-xs font-mono ${natFactor.colorClass}`}>
                            {natFactor.factorLabel}
                          </span>
                        </div>

                        {/* Col 3: Style Factor */}
                        <div className="w-16 sm:w-20 text-center shrink-0">
                          <span className={`text-xs font-mono ${factorDisplay.classNames}`}>
                            {factorDisplay.arrow} {factorDisplay.text}
                          </span>
                        </div>

                        {/* Col 4: Combined Synergy */}
                        <div className="w-20 sm:w-24 text-center shrink-0">
                          <span className={`text-xs font-mono ${combDisplay.classNames}`}>
                            {combDisplay.arrow} {combDisplay.text}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Arrow Button */}
              <button
                onClick={() => {
                  setActiveStyleIdx((activeStyleIdx + 1) % STYLES.length);
                  gameAudio.playCrispClick();
                }}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-emerald-400 hover:text-emerald-300 border border-slate-700/80 hover:border-emerald-500/80 flex items-center justify-center shrink-0 shadow-lg active:scale-95 transition-all text-lg sm:text-xl font-bold cursor-pointer"
                title="Next Style">
                ▶
              </button>
            </div>

            {/* Bottom Action Footer: given flex-shrink-0 mt-3 */}
            <div className="flex-shrink-0 mt-3 flex items-center justify-between gap-3 pt-2.5 border-t border-slate-800/80 w-full max-w-4xl mx-auto">
              <button
                onClick={() => setSelectedSeedlingForStyle(null)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold px-4 py-2.5 rounded-xl text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow">
                <ChevronLeft className="w-4 h-4" />
                <span>Back [Esc / B]</span>
              </button>
              <div className="text-[11px] font-mono text-emerald-400/90 hidden sm:inline">
                🎮 [A/D / LB/RB] Cycle Style • [E / A] Plant • [Esc / B] Back
              </div>
              <button
                onClick={() => {
                  gameAudio.playConfirmSelect();
                  if (onStartPlacementPreview) {
                    onStartPlacementPreview({
                      category: 'seedling',
                      payload: seedling,
                      width: 1,
                      height: 1,
                      orientation: 'horizontal',
                      style: curStyleKey,
                      nature: natureObj,
                    });
                  } else {
                    onPlantSeedling(seedling, curStyleKey, natureObj);
                  }
                  setSelectedSeedlingForStyle(null);
                  onClose();
                }}
                className="flex-1 max-w-md bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold py-2.5 rounded-xl text-xs sm:text-sm transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer ring-2 ring-emerald-400/60">
                <Sprout className="w-4 h-4" />
                <span>Plant [E / A] ({curStyleDef.japanese})</span>
              </button>
            </div>
          </div>
        );
      })() : (
        /* ========================================================================= */
        /* 2. REGULAR SANCTUARY GRID DEPLOYMENT VIEW (FOUR TABS) */
        /* ========================================================================= */
        <>
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5 mb-3 shrink-0">
            <div className="flex items-center gap-2">
              <Sprout className="w-5 h-5 text-emerald-400" />
              <div>
                <h3 className="text-lg font-bold text-emerald-400">🌱 Sanctuary Grid Deployment</h3>
                <p className="text-[11px] text-slate-400">
                  Plant individual wild seedlings, replant potted bonsais, or deploy infrastructure and decorations
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition-colors cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* FOUR CATEGORY TABS: ['seedlings', 'bonsais', 'infrastructure', 'decorations'] */}
          <div className="grid grid-cols-4 gap-1.5 mb-3 shrink-0">
            <button
              onClick={() => {
                setActiveCategory('seedlings');
                gameAudio.playCrispClick();
              }}
              className={`py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all shadow cursor-pointer ${
                activeCategory === 'seedlings'
                  ? 'bg-emerald-600 text-white ring-2 ring-emerald-400/40'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-750'
              }`}>
              <Sprout className="w-4 h-4 text-emerald-300" />
              <span>Seedlings</span>
              <span className="text-[10px] bg-slate-950/60 px-1.5 py-0.5 rounded-full font-mono text-emerald-300">
                {seedlingList.length}
              </span>
            </button>

            <button
              onClick={() => {
                setActiveCategory('bonsais');
                gameAudio.playCrispClick();
              }}
              className={`py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all shadow cursor-pointer ${
                activeCategory === 'bonsais'
                  ? 'bg-cyan-600 text-white ring-2 ring-cyan-400/40'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-750'
              }`}>
              <Package className="w-4 h-4 text-cyan-300" />
              <span>Bonsais</span>
              <span className="text-[10px] bg-slate-950/60 px-1.5 py-0.5 rounded-full font-mono text-cyan-300">
                {storedBonsais.length}
              </span>
            </button>

            <button
              onClick={() => {
                setActiveCategory('infrastructure');
                gameAudio.playCrispClick();
              }}
              className={`py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all shadow cursor-pointer ${
                activeCategory === 'infrastructure'
                  ? 'bg-gradient-to-r from-amber-600 to-sky-600 text-white ring-2 ring-amber-400/40'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-750'
              }`}>
              <Wrench className="w-4 h-4 text-amber-300" />
              <span>Infrastructure</span>
              <span className="text-[10px] bg-slate-950/60 px-1.5 py-0.5 rounded-full font-mono text-amber-300">
                {solarCount + windCount + compostCount + wellCount}
              </span>
            </button>

            <button
              onClick={() => {
                setActiveCategory('decorations');
                gameAudio.playCrispClick();
              }}
              className={`py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all shadow cursor-pointer ${
                activeCategory === 'decorations'
                  ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white ring-2 ring-teal-400/40'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-750'
              }`}>
              <Sparkles className="w-4 h-4 text-teal-300" />
              <span>Decorations</span>
              <span className="text-[10px] bg-slate-950/60 px-1.5 py-0.5 rounded-full font-mono text-teal-300">
                {decorCount}
              </span>
            </button>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 space-y-3 overflow-y-auto pr-1">
            {/* SUBMENU 1: SEEDLINGS (DUAL-COLUMN GRID ON >= SM / 640px) */}
            {activeCategory === 'seedlings' && (
              <div>
                {seedlingList.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400 bg-slate-900/60 rounded-2xl border border-slate-800 flex flex-col items-center justify-center gap-2">
                    <Sprout className="w-8 h-8 text-slate-600 mb-1" />
                    <p className="font-semibold text-slate-300">
                      No wild seedlings in inventory. Embark on rover expeditions to discover seedlings!
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Deploy to wilderness biomes via the Rover Garage Bay to locate root nodes and excavate fresh seedlings.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                    {seedlingList.map((seedling, sIdx) => {
                      const leafType = seedling.leafType as BonsaiLeafType;
                      const leafDef = getLeafTypeDef(leafType);
                      const matDef = getMaturityDef(seedling.maturity as MaturityTier);
                      const attrs: BonsaiAttributes =
                        seedling.geneticPotential || seedling.attributes || DEFAULT_BONSAI_ATTRIBUTES;
                      const natureObj = seedling.nature
                        ? getBonsaiNature(seedling.nature)
                        : BONSAI_NATURES[Math.abs((seedling.id || `${sIdx}`).split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)) % BONSAI_NATURES.length];

                      return (
                        <div
                          key={seedling.id || `seedling_${sIdx}`}
                          style={{ borderColor: `${matDef.border}50` }}
                          className="bg-slate-900/90 border p-3.5 rounded-2xl flex flex-col justify-between gap-3 shadow-md hover:border-emerald-500/50 transition-all">
                          {/* 1. Header of Seedling Card */}
                          <div className="flex items-start gap-3">
                            <div className="w-11 h-11 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                              <SeedlingSpeciesIcon
                                leafType={leafType}
                                color={seedling.color || leafDef.color}
                                accentColor={seedling.flowerColor || leafDef.accentColor}
                              />
                            </div>
                            <div className="min-w-0 flex-1 space-y-1.5">
                              <h4 className="font-bold text-xs sm:text-sm text-slate-100 truncate">
                                {seedling.name || `${leafDef.name} Bonsai`}
                              </h4>
                              {/* Directly underneath the name: Maturity rating badge, Tree type group badge, and Nature pill */}
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span
                                  style={{
                                    backgroundColor: matDef.bg,
                                    borderColor: matDef.border,
                                    color: matDef.color,
                                  }}
                                  className="text-[9.5px] px-2 py-0.5 rounded-full font-black border flex items-center gap-1 shadow-sm">
                                  <span>{matDef.kanji}</span>
                                  <span>— {matDef.name}</span>
                                </span>
                                <span
                                  className={`text-[9.5px] px-2 py-0.5 rounded-full font-black border ${getBonsaiGroupBadgeClass(
                                    (seedling.group as any) || leafDef.group,
                                  )}`}>
                                  {seedling.group || leafDef.group}
                                </span>
                                <span
                                  title={`Nature: ${natureObj.name} (${natureObj.descriptor})`}
                                  className="text-[9.5px] px-2 py-0.5 rounded-full font-bold bg-purple-950/80 text-purple-300 border border-purple-500/40 flex items-center gap-1 shadow-sm">
                                  <Sparkles className="w-3 h-3 text-purple-400" />
                                  <span>✨ Nature: {natureObj.name}</span>
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* 2. Section: Seedling Attributes with NATURE FACTOR Header */}
                          <div className="bg-slate-950/80 border border-slate-800/90 rounded-xl p-2.5 sm:p-3 space-y-2">
                            <div className="flex items-center justify-between border-b border-slate-800/80 pb-1.5 mb-1.5">
                              <div className="flex items-center gap-1.5 font-bold text-xs text-slate-200">
                                <Bookmark className="w-3.5 h-3.5 text-emerald-400" />
                                <span>Seedling Attributes</span>
                              </div>
                              <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                NATURE FACTOR
                              </span>
                            </div>

                            {/* 3. Clean 2-column layout: Column 1 Genetic Potential, Column 2 Nature Factor */}
                            <div className="space-y-2">
                              {attributeRowConfigs.map((attr) => {
                                const val = attrs[attr.key] || 0;
                                const tier = getAttributeTier(val);
                                const factorInfo = getNatureFactor(attr.key, natureObj);

                                return (
                                  <div key={attr.key} className="flex items-center justify-between gap-3">
                                    {/* Column 1: Genetic Potential (Attribute name, descriptive tier label like Decent (21-40%), and progress bar) */}
                                    <div className="flex-1 min-w-0 space-y-1">
                                      <div className="flex items-center justify-between text-[11px]">
                                        <div className="flex items-center gap-1.5 font-bold">
                                          <span className="text-xs">{attr.icon}</span>
                                          <span className={attr.textClass}>{attr.name}</span>
                                        </div>
                                        <span className="text-[11px] text-slate-400 font-medium">
                                          {tier}
                                        </span>
                                      </div>
                                      <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-800/80">
                                        <div
                                          style={{ width: `${val <= 0 ? 0 : Math.min(100, val)}%` }}
                                          className={`h-full rounded-full ${attr.barClass}`}
                                        />
                                      </div>
                                    </div>

                                    {/* Column 2: Nature Factor with directional values (⬆ 1.1x, ⬇ 0.9x, • 1.0x) */}
                                    <div className="w-16 sm:w-20 text-center shrink-0">
                                      <span className={`text-xs font-mono ${factorInfo.colorClass}`}>
                                        {factorInfo.factorLabel}
                                      </span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* 4. Bottom Full-Width Action Button */}
                          <button
                            onClick={() => {
                              gameAudio.playCrispClick();
                              setSelectedSeedlingForStyle(seedling);
                              setActiveStyleIdx(0);
                            }}
                            className={`w-full font-bold py-2 rounded-xl shadow transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer text-xs sm:text-sm ${
                              focusedItemIdx === sIdx && activeCategory === 'seedlings'
                                ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 ring-2 ring-emerald-300'
                                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                            }`}>
                            <Sprout className="w-4 h-4" />
                            <span>Choose Style to Plant [E / A]</span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* SUBMENU 2: BONSAIS */}
            {activeCategory === 'bonsais' && (
              <div className="space-y-3">
                {storedBonsais.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400 bg-slate-900/60 rounded-2xl border border-slate-800 flex flex-col items-center justify-center gap-2">
                    <Package className="w-8 h-8 text-slate-600 mb-1" />
                    <p className="font-semibold text-slate-300">
                      No potted adult bonsais in storage.
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Uproot and store any planted tree in your sanctuary by standing near it and pressing [Q]! Its levels and growth are preserved completely.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {storedBonsais.map((stored) => {
                      const sMat = getMaturityDef(stored.maturity || 'sprout');
                      const sDef = getLeafTypeDef(stored.leafType);
                      const attrs: BonsaiAttributes =
                        stored.attributes || DEFAULT_BONSAI_ATTRIBUTES;
                      const donationVal = calculateDonationValue(stored);
                      const ba = calculateBaseAesthetic(stored);

                      return (
                        <div
                          key={stored.id}
                          style={{ borderColor: `${sMat.border}50` }}
                          className="bg-slate-900/90 border p-3.5 rounded-2xl flex flex-col justify-between gap-3 shadow hover:border-cyan-500/50 transition-all">
                          <div>
                            <div className="flex items-center justify-between gap-2 mb-1.5">
                              <div className="font-bold text-xs sm:text-sm text-slate-200 flex items-center gap-1.5 flex-wrap">
                                <span
                                  style={{ backgroundColor: stored.color || sDef.color }}
                                  className="w-3.5 h-3.5 rounded-full inline-block shadow-sm"
                                />
                                <span
                                  className={`text-[10px] px-1.5 py-0.2 rounded font-black border ${getBonsaiGroupBadgeClass(
                                    stored.group,
                                  )}`}>
                                  {stored.group}
                                </span>
                                <span
                                  style={{
                                    backgroundColor: sMat.bg,
                                    borderColor: sMat.border,
                                    color: sMat.color,
                                    boxShadow: `0 0 8px ${sMat.color}30`,
                                  }}
                                  className="text-[10px] px-2 py-0.5 rounded-full font-black border flex items-center gap-1">
                                  <span>{sMat.kanji}</span>
                                  <span>{sMat.name}</span>
                                  <span className="opacity-80 font-mono">({sMat.multiplier}x)</span>
                                </span>
                                <span>{stored.name}</span>
                                <span className="text-emerald-400 font-bold">(Lv.{stored.level} • {ba.total.toFixed(2)} BA)</span>
                                {stored.nature && (() => {
                                  const nat = getBonsaiNature(stored.nature);
                                  return (
                                    <span
                                      title={`Nature: ${nat.name} (${nat.descriptor})`}
                                      className="text-[9px] px-2 py-0.2 rounded-full font-bold bg-violet-950/80 border border-violet-500/60 text-violet-300">
                                      {nat.name}
                                    </span>
                                  );
                                })()}
                              </div>
                            </div>

                            <div className="text-[11px] text-slate-400 mt-0.5 space-x-2">
                              <span>
                                Style:{' '}
                                <strong className="text-emerald-300">
                                  {getBonsaiStyleDef(stored.style).japanese}
                                </strong>
                              </span>
                              <span>
                                Shape: <strong className="text-slate-200">{sDef.leafShapeName}</strong>
                              </span>
                              <span>
                                BA:{' '}
                                <strong className="text-amber-300 font-mono">
                                  {ba.total.toFixed(2)} BA
                                </strong>
                              </span>
                              <span>
                                Donation:{' '}
                                <strong className="text-emerald-400 font-mono">
                                  +{donationVal} Verdure
                                </strong>
                              </span>
                            </div>
                          </div>

                          {/* Compact Attributes for Stored Bonsai */}
                          <div className="bg-slate-950/70 p-2 rounded-xl border border-slate-800 text-[10px] space-y-1">
                            <div className="grid grid-cols-2 gap-1.5">
                              <div className="bg-slate-900/80 px-2 py-1 rounded text-emerald-400 font-bold truncate">
                                🍃 Foliage: {getAttributeTier(attrs.foliage)}
                              </div>
                              <div className="bg-slate-900/80 px-2 py-1 rounded text-amber-400 font-bold truncate">
                                🪵 Branches: {getAttributeTier(attrs.branches)}
                              </div>
                              <div className="bg-slate-900/80 px-2 py-1 rounded text-rose-400 font-bold truncate">
                                🌲 Trunk: {getAttributeTier(attrs.trunk)}
                              </div>
                              <div className="bg-slate-900/80 px-2 py-1 rounded text-blue-400 font-bold truncate">
                                🪴 Roots: {getAttributeTier(attrs.roots)}
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={() => {
                              gameAudio.playPowerupChime();
                              if (onStartPlacementPreview) {
                                onStartPlacementPreview({
                                  category: 'bonsai',
                                  payload: stored,
                                  width: 1,
                                  height: 1,
                                  orientation: 'horizontal',
                                });
                              } else {
                                onPlantStoredBonsai(stored.id);
                              }
                              onClose();
                            }}
                            className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs py-2 rounded-xl shadow transition-transform active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer">
                            <Sprout className="w-4 h-4" />
                            <span>Deploy on Plot</span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* SUBMENU 3: INFRASTRUCTURE */}
            {activeCategory === 'infrastructure' && (
              <div className="space-y-3">
                <div className="text-xs text-slate-400 bg-slate-900/60 p-2.5 rounded-2xl border border-slate-800 flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>
                    Deploy clean energy generators and utility equipment onto open sanctuary plots. Power misting automatons and maintain sustainable irrigation!
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Solar Panel */}
                  <div className="bg-slate-900/90 border border-sky-500/40 p-4 rounded-2xl flex flex-col justify-between gap-2.5 shadow-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl">☀️</span>
                        <div>
                          <h4 className="font-bold text-sm sm:text-base text-slate-100">Solar Panel Array</h4>
                          <span className="text-xs text-sky-400 font-bold">+3 kW Clean Power (+0.5 kW/neighbor)</span>
                        </div>
                      </div>
                      <span className="text-xs bg-sky-950 text-sky-300 border border-sky-600/50 px-2 py-0.5 rounded-lg font-bold font-mono">
                        Stock: {solarCount}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Crystalline photovoltaic array. Captures greenhouse skylight to power connected misting automatons.
                    </p>
                    <button
                      disabled={solarCount <= 0}
                      onClick={() => {
                        if (onStartPlacementPreview) {
                          onStartPlacementPreview({
                            category: 'infrastructure',
                            payload: 'solar_panel',
                            width: 1,
                            height: 1,
                            orientation: 'horizontal',
                          });
                          onClose();
                        } else {
                          onDeployStructure('solar_panel');
                        }
                      }}
                      className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow cursor-pointer ${
                        solarCount > 0
                          ? 'bg-sky-600 hover:bg-sky-500 text-white active:scale-95'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}>
                      <Sun className="w-4 h-4" />
                      {solarCount > 0 ? 'Deploy Solar Panel (3 kW)' : 'Craft at Workbench First'}
                    </button>
                  </div>

                  {/* Wind Turbine */}
                  <div className="bg-slate-900/90 border border-amber-500/40 p-4 rounded-2xl flex flex-col justify-between gap-2.5 shadow-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl">💨</span>
                        <div>
                          <h4 className="font-bold text-sm sm:text-base text-slate-100">Wind Turbine Generator</h4>
                          <span className="text-xs text-amber-400 font-bold">+6 kW Clean Power (+1.0 kW/neighbor)</span>
                        </div>
                      </div>
                      <span className="text-xs bg-amber-950 text-amber-300 border border-amber-600/50 px-2 py-0.5 rounded-lg font-bold font-mono">
                        Stock: {windCount}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Brass aero-helix micro-turbine. Harnesses ventilation air currents to generate steady electricity.
                    </p>
                    <button
                      disabled={windCount <= 0}
                      onClick={() => {
                        if (onStartPlacementPreview) {
                          onStartPlacementPreview({
                            category: 'infrastructure',
                            payload: 'wind_turbine',
                            width: 1,
                            height: 1,
                            orientation: 'horizontal',
                          });
                          onClose();
                        } else {
                          onDeployStructure('wind_turbine');
                        }
                      }}
                      className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow cursor-pointer ${
                        windCount > 0
                          ? 'bg-amber-600 hover:bg-amber-500 text-white active:scale-95'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}>
                      <Wind className="w-4 h-4" />
                      {windCount > 0 ? 'Deploy Wind Turbine (6 kW)' : 'Craft at Workbench First'}
                    </button>
                  </div>

                  {/* Stone Well */}
                  <div className="bg-slate-900/90 border border-sky-500/40 p-4 rounded-2xl flex flex-col justify-between gap-2.5 shadow-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl">💧</span>
                        <div>
                          <h4 className="font-bold text-sm sm:text-base text-slate-100">Stone Well</h4>
                          <span className="text-xs text-sky-400 font-bold">3×3 Grid Irrigation (20 Seconds)</span>
                        </div>
                      </div>
                      <span className="text-xs bg-sky-950 text-sky-300 border border-sky-600/50 px-2 py-0.5 rounded-lg font-bold font-mono">
                        Stock: {wellCount}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Traditional stone well with timber awning and bucket crank. Draw fresh groundwater [E] to irrigate all Bonsais in its surrounding 3×3 grid for 20 seconds.
                    </p>
                    <button
                      disabled={wellCount <= 0}
                      onClick={() => {
                        if (onStartPlacementPreview) {
                          onStartPlacementPreview({
                            category: 'infrastructure',
                            payload: 'tool_garden_well',
                            width: 1,
                            height: 1,
                            orientation: 'horizontal',
                          });
                          onClose();
                        } else {
                          onDeployStructure('tool_garden_well');
                        }
                      }}
                      className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow cursor-pointer ${
                        wellCount > 0
                          ? 'bg-sky-600 hover:bg-sky-500 text-white active:scale-95'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}>
                      <Droplets className="w-4 h-4" />
                      {wellCount > 0 ? 'Deploy Stone Well' : 'Buy in Botanical Market'}
                    </button>
                  </div>

                  {/* Compost Heap */}
                  <div className="bg-slate-900/90 border border-lime-500/40 p-4 rounded-2xl flex flex-col justify-between gap-2.5 shadow-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl">🍂</span>
                        <div>
                          <h4 className="font-bold text-sm sm:text-base text-slate-100">Compost Heap</h4>
                          <span className="text-xs text-lime-400 font-bold">20 Waste Capacity • Passive Fertilizer</span>
                        </div>
                      </div>
                      <span className="text-xs bg-lime-950 text-lime-300 border border-lime-600/50 px-2 py-0.5 rounded-lg font-bold font-mono">
                        Stock: {compostCount}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Rustic slatted cedar timber compost bin box. Deposit up to 20 Organic Waste to passively decompose into usable Enriched Organic Compost (~10s per batch).
                    </p>
                    <button
                      disabled={compostCount <= 0}
                      onClick={() => {
                        if (onStartPlacementPreview) {
                          onStartPlacementPreview({
                            category: 'infrastructure',
                            payload: 'tool_compost_heap',
                            width: 1,
                            height: 1,
                            orientation: 'horizontal',
                          });
                          onClose();
                        } else {
                          onDeployStructure('tool_compost_heap');
                        }
                      }}
                      className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow cursor-pointer ${
                        compostCount > 0
                          ? 'bg-lime-600 hover:bg-lime-500 text-white active:scale-95'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}>
                      <span>🍂</span>
                      {compostCount > 0 ? 'Deploy Compost Heap' : 'Buy in Botanical Market'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* SUBMENU 4: DECORATIONS */}
            {activeCategory === 'decorations' && (
              <div className="space-y-3">
                <div className="text-xs text-slate-400 bg-slate-900/60 p-2.5 rounded-2xl border border-slate-800 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-teal-400 shrink-0" />
                  <span>
                    Deploy serene garden decorations and ornamental fixtures onto open sanctuary plots. Dismantle anytime with [Q]!
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Pebble Path */}
                  <div className="bg-slate-900/80 border border-slate-700/80 p-3.5 rounded-2xl flex flex-col justify-between gap-2 shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-2xl">🪨</span>
                        <div>
                          <h5 className="font-bold text-xs sm:text-sm text-slate-200 truncate">Zen Pebble Stepping Path</h5>
                          <span className="text-[10px] text-emerald-400 font-bold">+35% Player Move Speed</span>
                        </div>
                      </div>
                      <span className="text-xs bg-slate-950 text-slate-300 border border-slate-700 px-2 py-0.5 rounded-lg font-mono font-bold">
                        Stock: {inv.decor_pebble_path_inv || 0}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Grants +35% movement speed when walking on it. Pure pathway tile (does not cause stalling).
                    </p>
                    <button
                      disabled={(inv.decor_pebble_path_inv || 0) <= 0}
                      onClick={() => {
                        if (onStartPlacementPreview) {
                          onStartPlacementPreview({
                            category: 'decoration',
                            payload: 'decor_pebble_path',
                            width: 1,
                            height: 1,
                            orientation: 'horizontal',
                          });
                          onClose();
                        } else {
                          onDeployStructure('decor_pebble_path');
                        }
                      }}
                      className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all shadow flex items-center justify-center gap-1.5 cursor-pointer ${
                        (inv.decor_pebble_path_inv || 0) > 0
                          ? 'bg-slate-700 hover:bg-slate-600 text-white active:scale-95'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}>
                      Place Zen Pebble Path
                    </button>
                  </div>

                  {/* Rock Formation */}
                  <div className="bg-slate-900/80 border border-amber-500/30 p-3.5 rounded-2xl flex flex-col justify-between gap-2 shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-2xl">🪨</span>
                        <div>
                          <h5 className="font-bold text-xs sm:text-sm text-slate-200 truncate">Zen Rock Formation</h5>
                          <span className="text-[10px] text-amber-400">+0.25s Pruning Effect (Quick Prune)</span>
                        </div>
                      </div>
                      <span className="text-xs bg-slate-950 text-amber-300 border border-amber-600/40 px-2 py-0.5 rounded-lg font-mono font-bold">
                        Stock: {inv.decor_rock_formation_inv || 0}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      +0.25s Pruning Effect (Quick Prune) to adjacent bonsais in a 3×3 halo.
                    </p>
                    <button
                      disabled={(inv.decor_rock_formation_inv || 0) <= 0}
                      onClick={() => {
                        if (onStartPlacementPreview) {
                          onStartPlacementPreview({
                            category: 'decoration',
                            payload: 'decor_rock_formation',
                            width: 1,
                            height: 1,
                            orientation: 'horizontal',
                          });
                          onClose();
                        } else {
                          onDeployStructure('decor_rock_formation');
                        }
                      }}
                      className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all shadow flex items-center justify-center gap-1.5 cursor-pointer ${
                        (inv.decor_rock_formation_inv || 0) > 0
                          ? 'bg-amber-600 hover:bg-amber-500 text-white active:scale-95'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}>
                      Place Zen Rock Formation
                    </button>
                  </div>

                  {/* Topiary Shrub */}
                  <div className="bg-slate-900/80 border border-emerald-500/30 p-3.5 rounded-2xl flex flex-col justify-between gap-2 shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-2xl">🌿</span>
                        <div>
                          <h5 className="font-bold text-xs sm:text-sm text-slate-200 truncate">Topiary Shrubbery Bush</h5>
                          <span className="text-[10px] text-emerald-400">+15% Level Up Experience (XP Boosted)</span>
                        </div>
                      </div>
                      <span className="text-xs bg-slate-950 text-emerald-300 border border-emerald-600/40 px-2 py-0.5 rounded-lg font-mono font-bold">
                        Stock: {inv.decor_shrubbery_bush_inv || 0}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      +15% Level Up Experience (XP Boosted) to adjacent bonsais in a 3×3 halo per bush.
                    </p>
                    <button
                      disabled={(inv.decor_shrubbery_bush_inv || 0) <= 0}
                      onClick={() => {
                        if (onStartPlacementPreview) {
                          onStartPlacementPreview({
                            category: 'decoration',
                            payload: 'decor_shrubbery_bush',
                            width: 1,
                            height: 1,
                            orientation: 'horizontal',
                          });
                          onClose();
                        } else {
                          onDeployStructure('decor_shrubbery_bush');
                        }
                      }}
                      className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all shadow flex items-center justify-center gap-1.5 cursor-pointer ${
                        (inv.decor_shrubbery_bush_inv || 0) > 0
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white active:scale-95'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}>
                      Place Topiary Shrubbery
                    </button>
                  </div>

                  {/* Woven Lattice Wall */}
                  <div className="bg-slate-900/80 border border-yellow-600/30 p-3.5 rounded-2xl flex flex-col justify-between gap-2 shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-2xl">🎋</span>
                        <div>
                          <h5 className="font-bold text-xs sm:text-sm text-slate-200 truncate">Woven Wooden Lattice Wall</h5>
                          <span className="text-[10px] text-yellow-400">+10% Hydration Growth Speed (Private Growing)</span>
                        </div>
                      </div>
                      <span className="text-xs bg-slate-950 text-yellow-300 border border-yellow-600/40 px-2 py-0.5 rounded-lg font-mono font-bold">
                        Stock: {inv.decor_woven_wall_inv || 0}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      +10% Hydration Growth Speed (Private Growing) to adjacent bonsais in a 3×3 halo per wall. Separate counter from adjacent bonsais.
                    </p>
                    <button
                      disabled={(inv.decor_woven_wall_inv || 0) <= 0}
                      onClick={() => {
                        if (onStartPlacementPreview) {
                          onStartPlacementPreview({
                            category: 'decoration',
                            payload: 'decor_woven_wall',
                            width: 1,
                            height: 1,
                            orientation: 'horizontal',
                          });
                          onClose();
                        } else {
                          onDeployStructure('decor_woven_wall');
                        }
                      }}
                      className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all shadow flex items-center justify-center gap-1.5 cursor-pointer ${
                        (inv.decor_woven_wall_inv || 0) > 0
                          ? 'bg-amber-700 hover:bg-amber-600 text-white active:scale-95'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}>
                      Place Woven Lattice Wall
                    </button>
                  </div>

                  {/* Torii Gate (3x1 / 1x3 Rotatable) */}
                  <div className="bg-slate-900/80 border border-red-500/40 p-3.5 rounded-2xl flex flex-col justify-between gap-2 shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-2xl">⛩️</span>
                        <div>
                          <h5 className="font-bold text-xs sm:text-sm text-red-300 truncate">Torii Gate (3x1 / 1x3)</h5>
                          <span className="text-[10px] text-amber-400 font-bold">3x1 / 1x3 Multi-Plot • Rotatable Archway</span>
                        </div>
                      </div>
                      <span className="text-xs bg-slate-950 text-red-300 border border-red-600/40 px-2 py-0.5 rounded-lg font-mono font-bold">
                        Stock: {toriiGateCount}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Majestic vermilion shinto archway. Outer pillars anchor the sides, while the central archway plot remains open, walkable, and placeable!
                    </p>
                    <button
                      disabled={toriiGateCount <= 0}
                      onClick={() => {
                        if (onStartPlacementPreview) {
                          onStartPlacementPreview({
                            category: 'decoration',
                            payload: 'torii_gate',
                            width: 3,
                            height: 1,
                            orientation: 'horizontal',
                          });
                          onClose();
                        } else {
                          onDeployStructure('torii_gate');
                        }
                      }}
                      className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all shadow flex items-center justify-center gap-1.5 cursor-pointer ${
                        toriiGateCount > 0
                          ? 'bg-red-600 hover:bg-red-500 text-white active:scale-95 ring-1 ring-red-400/50'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}>
                      {toriiGateCount > 0 ? 'Place Torii Gate [E / A]' : 'Claim Free in Botanical Market'}
                    </button>
                  </div>

                  {/* Emerald Leaf Crystal Pedestal */}
                  <div className="bg-slate-900/80 border border-emerald-500/40 p-3.5 rounded-2xl flex flex-col justify-between gap-2 shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-2xl">💎</span>
                        <div>
                          <h5 className="font-bold text-xs sm:text-sm text-emerald-300 truncate">Emerald Leaf Crystal Pedestal</h5>
                          <span className="text-[10px] text-emerald-400 font-semibold">+1 Foliage Cultivation Potential per level</span>
                        </div>
                      </div>
                      <span className="text-xs bg-slate-950 text-emerald-300 border border-emerald-600/40 px-2 py-0.5 rounded-lg font-mono font-bold">
                        Stock: {inv.crystal_pedestal_foliage_inv || 0}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Carved dark slate pedestal topped with a glowing emerald leaf crystal. Stacks as part of the Crystal Pedestal family.
                    </p>
                    <button
                      disabled={(inv.crystal_pedestal_foliage_inv || 0) <= 0}
                      onClick={() => {
                        if (onStartPlacementPreview) {
                          onStartPlacementPreview({
                            category: 'decoration',
                            payload: 'crystal_pedestal_foliage',
                            width: 1,
                            height: 1,
                            orientation: 'horizontal',
                          });
                          onClose();
                        } else {
                          onDeployStructure('crystal_pedestal_foliage');
                        }
                      }}
                      className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all shadow flex items-center justify-center gap-1.5 cursor-pointer ${
                        (inv.crystal_pedestal_foliage_inv || 0) > 0
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white active:scale-95'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}>
                      {(inv.crystal_pedestal_foliage_inv || 0) > 0 ? 'Place Emerald Leaf Pedestal' : 'Buy in Botanical Market'}
                    </button>
                  </div>

                  {/* Amber Branch Crystal Pedestal */}
                  <div className="bg-slate-900/80 border border-amber-500/40 p-3.5 rounded-2xl flex flex-col justify-between gap-2 shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-2xl">💎</span>
                        <div>
                          <h5 className="font-bold text-xs sm:text-sm text-amber-300 truncate">Amber Branch Crystal Pedestal</h5>
                          <span className="text-[10px] text-amber-400 font-semibold">+1 Branches Cultivation Potential per level</span>
                        </div>
                      </div>
                      <span className="text-xs bg-slate-950 text-amber-300 border border-amber-600/40 px-2 py-0.5 rounded-lg font-mono font-bold">
                        Stock: {inv.crystal_pedestal_branches_inv || 0}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Carved dark slate pedestal topped with a glowing warm amber branching crystal. Stacks as part of the Crystal Pedestal family.
                    </p>
                    <button
                      disabled={(inv.crystal_pedestal_branches_inv || 0) <= 0}
                      onClick={() => {
                        if (onStartPlacementPreview) {
                          onStartPlacementPreview({
                            category: 'decoration',
                            payload: 'crystal_pedestal_branches',
                            width: 1,
                            height: 1,
                            orientation: 'horizontal',
                          });
                          onClose();
                        } else {
                          onDeployStructure('crystal_pedestal_branches');
                        }
                      }}
                      className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all shadow flex items-center justify-center gap-1.5 cursor-pointer ${
                        (inv.crystal_pedestal_branches_inv || 0) > 0
                          ? 'bg-amber-600 hover:bg-amber-500 text-white active:scale-95'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}>
                      {(inv.crystal_pedestal_branches_inv || 0) > 0 ? 'Place Amber Branch Pedestal' : 'Buy in Botanical Market'}
                    </button>
                  </div>

                  {/* Coral Trunk Crystal Pedestal */}
                  <div className="bg-slate-900/80 border border-rose-500/40 p-3.5 rounded-2xl flex flex-col justify-between gap-2 shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-2xl">💎</span>
                        <div>
                          <h5 className="font-bold text-xs sm:text-sm text-rose-300 truncate">Coral Trunk Crystal Pedestal</h5>
                          <span className="text-[10px] text-rose-400 font-semibold">+1 Trunk Cultivation Potential per level</span>
                        </div>
                      </div>
                      <span className="text-xs bg-slate-950 text-rose-300 border border-rose-600/40 px-2 py-0.5 rounded-lg font-mono font-bold">
                        Stock: {inv.crystal_pedestal_trunk_inv || 0}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Carved dark slate pedestal topped with a glowing rust coral trunk crystal. Stacks as part of the Crystal Pedestal family.
                    </p>
                    <button
                      disabled={(inv.crystal_pedestal_trunk_inv || 0) <= 0}
                      onClick={() => {
                        if (onStartPlacementPreview) {
                          onStartPlacementPreview({
                            category: 'decoration',
                            payload: 'crystal_pedestal_trunk',
                            width: 1,
                            height: 1,
                            orientation: 'horizontal',
                          });
                          onClose();
                        } else {
                          onDeployStructure('crystal_pedestal_trunk');
                        }
                      }}
                      className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all shadow flex items-center justify-center gap-1.5 cursor-pointer ${
                        (inv.crystal_pedestal_trunk_inv || 0) > 0
                          ? 'bg-rose-600 hover:bg-rose-500 text-white active:scale-95'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}>
                      {(inv.crystal_pedestal_trunk_inv || 0) > 0 ? 'Place Coral Trunk Pedestal' : 'Buy in Botanical Market'}
                    </button>
                  </div>

                  {/* Azure Root Crystal Pedestal */}
                  <div className="bg-slate-900/80 border border-blue-500/40 p-3.5 rounded-2xl flex flex-col justify-between gap-2 shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-2xl">💎</span>
                        <div>
                          <h5 className="font-bold text-xs sm:text-sm text-blue-300 truncate">Azure Root Crystal Pedestal</h5>
                          <span className="text-[10px] text-blue-400 font-semibold">+1 Roots Cultivation Potential per level</span>
                        </div>
                      </div>
                      <span className="text-xs bg-slate-950 text-blue-300 border border-blue-600/40 px-2 py-0.5 rounded-lg font-mono font-bold">
                        Stock: {inv.crystal_pedestal_roots_inv || 0}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Carved dark slate pedestal topped with a glowing deep azure root tendril crystal. Stacks as part of the Crystal Pedestal family.
                    </p>
                    <button
                      disabled={(inv.crystal_pedestal_roots_inv || 0) <= 0}
                      onClick={() => {
                        if (onStartPlacementPreview) {
                          onStartPlacementPreview({
                            category: 'decoration',
                            payload: 'crystal_pedestal_roots',
                            width: 1,
                            height: 1,
                            orientation: 'horizontal',
                          });
                          onClose();
                        } else {
                          onDeployStructure('crystal_pedestal_roots');
                        }
                      }}
                      className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all shadow flex items-center justify-center gap-1.5 cursor-pointer ${
                        (inv.crystal_pedestal_roots_inv || 0) > 0
                          ? 'bg-blue-600 hover:bg-blue-500 text-white active:scale-95'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}>
                      {(inv.crystal_pedestal_roots_inv || 0) > 0 ? 'Place Azure Root Pedestal' : 'Buy in Botanical Market'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Navigational Prompts Strip */}
          <div className="pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 shrink-0">
            <span className="font-mono text-emerald-400">
              🎮 [A/D / LB/RB] Switch Tabs • [W/S / ↑↓] Select • [E / A] Deploy • [Esc / B] Close
            </span>
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold transition-all">
              Close [Esc / B]
            </button>
          </div>
        </>
      )}
    </div>
  );
}
