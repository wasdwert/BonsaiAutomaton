import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Droplets,
  Wrench,
  Package,
  Scissors,
  Sprout,
  Sparkles,
  Award,
  Activity,
  Heart,
  Zap,
} from 'lucide-react';
import {
  PlantedBonsai,
  SanctuaryInventory,
  getBonsaiGroupBadgeClass,
  getBonsaiStyleDef,
  getAutomatonConfig,
  BonsaiSynergies,
  VerdureIcon,
} from './App';
import {
  getLeafTypeDef,
  getMaturityDef,
  getBonsaiLevelGrowthNeeded,
  calculateDonationValue,
  drawLeafShape,
  drawBonsaiTrunkAndCanopy,
  getStyleAttributeWeights,
  getBonsaiDisplayName,
  getSpeciesName,
} from './bonsaiData';
import {
  BonsaiAttributes,
  DEFAULT_BONSAI_ATTRIBUTES,
  CultivationPotential,
  DEFAULT_CULTIVATION_POTENTIAL,
  ATTRIBUTE_CONFIG,
  getAttributeTier,
  getBonsaiNature,
  formatCrystalPedestalBonus,
  calculateBaseAesthetic,
} from './types';
import { getNatureFactor } from './DeploymentModal';
import { gameAudio } from './utils/helper';

function getFactorDisplay(val: number): { arrow: string; text: string; colorClass: string } {
  if (val > 1.0) {
    return {
      arrow: '⬆',
      text: `${val.toFixed(1)}x`,
      colorClass: 'text-emerald-400 font-bold',
    };
  }
  if (val < 1.0) {
    return {
      arrow: '⬇',
      text: `${val.toFixed(1)}x`,
      colorClass: 'text-rose-400 font-bold',
    };
  }
  return {
    arrow: '•',
    text: '1.0x',
    colorClass: 'text-slate-400 font-medium',
  };
}

export interface BonsaiInspectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  bonsai: PlantedBonsai | null;
  synergies: BonsaiSynergies;
  powerSufficient: boolean;
  inventory: SanctuaryInventory;
  greenThumbRank: number;
  isEcoRequestMatch?: boolean;
  onDonate: (id: string) => void;
  onStore: (id: string) => void;
  onCompost: (id: string) => void;
  onFertilize: (id: string) => void;
  onPrune?: (id: string) => void;
  onAttachAutomaton?: (id: string, tier: 1 | 2 | 3) => void;
  onDetachAutomaton?: (id: string) => void;
}

/**
 * Live canvas visualization of the inspected bonsai tree with its specific
 * style (Chokan, Moyogi, Shakan), leaf morphology, pot, and nebari root structure.
 */
function InspectedBonsaiCanvas({ bonsai }: { bonsai: PlantedBonsai }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = 260;
    const h = 200;
    canvas.width = w * 2;
    canvas.height = h * 2;
    ctx.setTransform(2, 0, 0, 2, 0, 0);
    ctx.clearRect(0, 0, w, h);

    // Warm radial greenhouse backdrop glow
    const bgGrad = ctx.createRadialGradient(w / 2, h / 2 + 10, 10, w / 2, h / 2 + 10, 110);
    bgGrad.addColorStop(0, 'rgba(15, 23, 42, 0.95)');
    bgGrad.addColorStop(0.7, 'rgba(6, 78, 59, 0.35)');
    bgGrad.addColorStop(1, 'rgba(15, 23, 42, 0.9)');
    ctx.fillStyle = bgGrad;
    ctx.beginPath();
    ctx.roundRect(0, 0, w, h, 14);
    ctx.fill();

    const bx = w / 2;
    const by = h - 34;
    const stageScale = Math.min(1.0, 0.65 + (bonsai.level / 100) * 0.35);
    const trunkHeight = 42 + stageScale * 30;
    const trunkThickness = 5.5 + stageScale * 4.5;

    // Pot shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
    ctx.beginPath();
    ctx.ellipse(bx, by + 12, 44 * stageScale, 9, 0, 0, Math.PI * 2);
    ctx.fill();

    // Ceramic pot body
    ctx.fillStyle = bonsai.potColor || '#1e293b';
    ctx.beginPath();
    ctx.roundRect(bx - 44 * stageScale, by - 6, 88 * stageScale, 24 * stageScale, [3, 3, 7, 7]);
    ctx.fill();
    ctx.strokeStyle = bonsai.rarity === 'MYTHIC' ? '#fbbf24' : 'rgba(255, 255, 255, 0.45)';
    ctx.lineWidth = 1.4;
    ctx.stroke();

    // Pot rim highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.fillRect(bx - 43 * stageScale, by - 6, 86 * stageScale, 2.5);

    // Dark nutrient soil
    ctx.fillStyle = '#3b1802';
    ctx.beginPath();
    ctx.ellipse(bx, by - 5, 39 * stageScale, 6 * stageScale, 0, 0, Math.PI * 2);
    ctx.fill();

    const bStyle = bonsai.style || 'MOYOGI';
    const bLeafType = bonsai.leafType || 'circle';
    const leafDef = getLeafTypeDef(bLeafType);
    const foliageColor = leafDef.color;
    const foliageAccent = leafDef.accentColor;

    // Render procedural vector trunk & foliage pads supporting all 7 styles
    drawBonsaiTrunkAndCanopy(
      ctx,
      bx,
      by,
      stageScale,
      trunkHeight,
      trunkThickness,
      bStyle,
      bLeafType,
      foliageColor,
      foliageAccent,
    );
  }, [bonsai]);

  return (
    <div className="relative flex justify-center items-center w-full">
      <canvas
        ref={canvasRef}
        style={{ width: '100%', maxWidth: '280px', height: '175px' }}
        className="rounded-2xl border border-emerald-500/20 bg-slate-950/80 shadow-inner"
      />
    </div>
  );
}

export default function BonsaiInspectionModal({
  isOpen,
  onClose,
  bonsai,
  synergies: bSyn,
  powerSufficient,
  inventory: inv,
  greenThumbRank,
  isEcoRequestMatch = false,
  onDonate,
  onStore,
  onCompost,
  onFertilize,
  onPrune,
}: BonsaiInspectionModalProps) {
  // Navigation focus index for interactive buttons:
  // 0: Fertilize, 1: Compost, 2: Donate / Sell, 3: Store in Bag, 4: Close Inspection
  const [focusedBtnIdx, setFocusedBtnIdx] = useState<number>(0);

  const activateFocusedButton = () => {
    if (!bonsai) return;
    if (focusedBtnIdx === 0) {
      if ((inv.fertilizer || inv.resources?.fertilizer || 0) > 0 && bonsai.level < 100) {
        onFertilize(bonsai.id);
      } else {
        gameAudio?.playErrorBuzz?.();
      }
    } else if (focusedBtnIdx === 1) {
      if (inv.organic_compost > 0 && bonsai.level < 100) {
        onCompost(bonsai.id);
      } else {
        gameAudio?.playErrorBuzz?.();
      }
    } else if (focusedBtnIdx === 2) {
      onDonate(bonsai.id);
    } else if (focusedBtnIdx === 3) {
      onStore(bonsai.id);
    } else if (focusedBtnIdx === 4) {
      onClose();
    }
  };

  // Keyboard and controller shortcut listener
  useEffect(() => {
    if (!isOpen || !bonsai) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        setFocusedBtnIdx((idx) => {
          if (idx === 2 || idx === 3) return idx - 2; // move to row 1 (0 or 1)
          if (idx === 4) return 2; // move from close to donate
          return Math.max(0, idx - 1);
        });
        gameAudio?.playHoverMicroTone?.();
      } else if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        setFocusedBtnIdx((idx) => {
          if (idx === 0 || idx === 1) return idx + 2; // move to row 2 (2 or 3)
          if (idx === 2 || idx === 3) return 4; // move to close button
          return Math.min(4, idx + 1);
        });
        gameAudio?.playHoverMicroTone?.();
      } else if (e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        setFocusedBtnIdx((idx) => {
          if (idx === 1) return 0;
          if (idx === 3) return 2;
          return Math.max(0, idx - 1);
        });
        gameAudio?.playHoverMicroTone?.();
      } else if (e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        setFocusedBtnIdx((idx) => {
          if (idx === 0) return 1;
          if (idx === 2) return 3;
          return Math.min(4, idx + 1);
        });
        gameAudio?.playHoverMicroTone?.();
      } else if (e.key === 'e' || e.key === 'E' || e.key === 'Enter') {
        e.preventDefault();
        activateFocusedButton();
      } else if (e.key === ' ' || e.key === 'x' || e.key === 'X') {
        e.preventDefault();
        if ((inv.fertilizer || inv.resources?.fertilizer || 0) > 0 && bonsai.level < 100) {
          onFertilize(bonsai.id);
        } else {
          gameAudio?.playErrorBuzz?.();
        }
      } else if (e.key === 'c' || e.key === 'C') {
        e.preventDefault();
        if (inv.organic_compost > 0 && bonsai.level < 100) {
          onCompost(bonsai.id);
        } else {
          gameAudio?.playErrorBuzz?.();
        }
      } else if (e.key === 'v' || e.key === 'V') {
        e.preventDefault();
        onDonate(bonsai.id);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, bonsai, focusedBtnIdx, inv.organic_compost, inv.fertilizer, onFertilize, onCompost, onDonate, onStore, onClose]);

  if (!isOpen || !bonsai) return null;

  const matDef = getMaturityDef(bonsai.maturity || 'sprout');
  const leafDef = getLeafTypeDef(bonsai.leafType);
  const attributes: BonsaiAttributes = bonsai.attributes || DEFAULT_BONSAI_ATTRIBUTES;
  const cultivation: CultivationPotential =
    bonsai.cultivationPotential || DEFAULT_CULTIVATION_POTENTIAL;
  const baseAesthetic = calculateBaseAesthetic(bonsai);
  const styleWeights = getStyleAttributeWeights(bonsai.style);

  const attributeList = [
    {
      key: 'foliage' as const,
      config: ATTRIBUTE_CONFIG.foliage,
      geneticVal: attributes.foliage,
      cultPoints: cultivation.foliage ?? 0,
    },
    {
      key: 'branches' as const,
      config: ATTRIBUTE_CONFIG.branches,
      geneticVal: attributes.branches,
      cultPoints: cultivation.branches ?? 0,
    },
    {
      key: 'trunk' as const,
      config: ATTRIBUTE_CONFIG.trunk,
      geneticVal: attributes.trunk,
      cultPoints: cultivation.trunk ?? 0,
    },
    {
      key: 'roots' as const,
      config: ATTRIBUTE_CONFIG.roots,
      geneticVal: attributes.roots,
      cultPoints: cultivation.roots ?? 0,
    },
  ];

  const targetSeconds = getBonsaiLevelGrowthNeeded(bonsai.level, bonsai.maturity);
  const growthPct = Math.min(100, Math.round((bonsai.progressSeconds / targetSeconds) * 100));
  const tierSpeed =
    bonsai.automatonTier > 0
      ? getAutomatonConfig(bonsai.automatonTier)?.speedMultiplier || 1.0
      : 1.0;
  const remainingSeconds = Math.max(0, (targetSeconds - bonsai.progressSeconds) / tierSpeed);

  return (
    <div className="fixed top-12 left-0 right-0 bottom-0 z-40 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm pointer-events-auto select-none">
      <div className="w-full max-w-6xl h-full max-h-[calc(100vh-3.5rem)] flex flex-col bg-slate-950/95 border border-emerald-500/30 rounded-3xl p-3 sm:p-5 shadow-2xl backdrop-blur-xl overflow-hidden text-left">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div
              style={{
                backgroundColor: matDef.bg,
                borderColor: matDef.border,
                boxShadow: `0 0 16px ${matDef.color}40`,
              }}
              className="w-11 h-11 rounded-2xl border-2 flex items-center justify-center text-xl font-black shadow shrink-0">
              <span style={{ color: matDef.color }}>{matDef.kanji}</span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  style={{
                    backgroundColor: matDef.bg,
                    borderColor: matDef.border,
                    color: matDef.color,
                    boxShadow: `0 0 10px ${matDef.color}35`,
                  }}
                  className="text-xs px-2.5 py-0.5 rounded-full font-black border flex items-center gap-1 shadow-sm">
                  <span>{matDef.kanji}</span>
                  <span>{matDef.name} (Rank {matDef.rank})</span>
                  <span className="font-mono text-slate-300 font-normal">({matDef.multiplier}x Multiplier)</span>
                </span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-black border ${getBonsaiGroupBadgeClass(
                    bonsai.group,
                  )}`}>
                  Group: {bonsai.group}
                </span>
                {/* Prominent Base Aesthetic (BA) Metric Badge */}
                <span className="text-xs px-2.5 py-0.5 rounded-full font-black bg-gradient-to-r from-amber-950/90 via-yellow-950/90 to-amber-950/90 border border-amber-400 text-amber-300 flex items-center gap-1.5 shadow-[0_0_12px_rgba(245,158,11,0.35)]">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                  <span>Base Aesthetic: <strong>{baseAesthetic.total.toFixed(2)} BA</strong></span>
                </span>
                <h3 className="text-base sm:text-lg font-black text-slate-100 truncate">{getBonsaiDisplayName(bonsai)}</h3>
                {(() => {
                  const nat = getBonsaiNature(bonsai.nature);
                  return (
                    <span
                      title={`Nature: ${nat.name} (${nat.descriptor})`}
                      className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-violet-950/90 border border-violet-500/70 text-violet-200 flex items-center gap-1.5 shadow-sm">
                      <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                      <span>Nature: <strong>{nat.name}</strong></span>
                      <span className="opacity-80 text-[10px] font-normal font-mono">({nat.descriptor})</span>
                    </span>
                  );
                })()}
              </div>
              <div className="flex items-center gap-2 mt-0.5 flex-wrap text-xs text-slate-400">
                <span>
                  Leaf Shape: <strong className="text-amber-300 font-semibold">{leafDef.leafShapeName}</strong>
                </span>
                <span>•</span>
                <span className="text-emerald-300 font-semibold">
                  Style: {getBonsaiStyleDef(bonsai.style).japanese} ({getBonsaiStyleDef(bonsai.style).name})
                </span>
                <span>•</span>
                <span style={{ color: matDef.color }} className="font-semibold">
                  Growth Req: {matDef.growthMultiplier}x ({matDef.name})
                </span>
                <span>•</span>
                <span className={`font-bold flex items-center gap-1 ${isEcoRequestMatch ? 'text-amber-300 bg-amber-950/80 border border-amber-500/50 px-2 py-0.5 rounded-lg' : 'text-emerald-300'}`}>
                  <VerdureIcon className="w-3.5 h-3.5" />
                  <span>+{(calculateDonationValue(bonsai) * (isEcoRequestMatch ? 2 : 1)).toFixed(2)} Verdure</span>
                  {isEcoRequestMatch && (
                    <span className="text-[9px] bg-amber-400 text-slate-950 px-1 py-0.2 rounded font-black">
                      🌟 2x Match!
                    </span>
                  )}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-slate-200 transition-colors shrink-0 ml-2">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3-Column Balanced Dashboard Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 overflow-y-auto pr-1">
          {/* ========================================================================= */}
          {/* PANEL 1 (LEFT, 4 COLS): TREE CANVAS PREVIEW & GROWTH/LEVEL INFO */}
          {/* ========================================================================= */}
          <div className="lg:col-span-4 flex flex-col justify-between gap-3 bg-slate-900/80 border border-slate-800/90 rounded-2xl p-3.5 shadow-sm">
            <div className="space-y-3">
              {/* Tree Canvas */}
              <InspectedBonsaiCanvas bonsai={bonsai} />

              {/* Specimen Details & Vitality */}
              <div className="bg-slate-950/80 border border-slate-800/90 rounded-xl p-2.5 space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-slate-300 font-semibold">
                  <span className="flex items-center gap-1.5 text-emerald-300">
                    <Heart className="w-3.5 h-3.5 text-rose-400" />
                    <span>Health &amp; Vitality</span>
                  </span>
                  <span className="text-emerald-400 font-bold">100% (Flourishing)</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-slate-800/70">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Specimen Rarity:</span>
                    <strong className="text-slate-200">{bonsai.rarity || leafDef.rarity || 'Common'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Ceramic Pot:</span>
                    <strong className="text-slate-200">{bonsai.potStyle || 'Carved Ceramic'}</strong>
                  </div>
                </div>
              </div>

              {/* Level & Progress Bar */}
              <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-100 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>{bonsai.level >= 100 ? '★ LEVEL 100 MASTER ★' : `Mastery: Level ${bonsai.level} / 100`}</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-amber-300 font-black bg-amber-950/60 border border-amber-500/40 px-1.5 py-0.2 rounded">
                      {baseAesthetic.total.toFixed(2)} BA
                    </span>
                    <span className="text-[11px] font-mono text-emerald-400 font-bold">
                      {bSyn.isStalled ? '0% (STALLED ⛔)' : `${growthPct}%`}
                    </span>
                  </div>
                </div>

                {bonsai.level < 100 && (
                  <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800">
                    <div
                      style={{ width: `${growthPct}%` }}
                      className={`h-full rounded-full transition-all duration-300 ${
                        bSyn.isStalled ? 'bg-rose-500' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                      }`}
                    />
                  </div>
                )}

                <div className="text-[10px] text-slate-400 flex items-center justify-between font-mono">
                  <span>
                    {bSyn.isStalled ? (
                      <strong className="text-rose-400 font-bold">
                        ⛔ Growth Stalled (&gt;4 {bSyn.stalledEntityLabel || 'identical neighbors'})
                      </strong>
                    ) : bonsai.automatonTier > 0 && powerSufficient ? (
                      `Timer: ${remainingSeconds.toFixed(1)}s until Level ${bonsai.level + 1}`
                    ) : (
                      `Progress: ${bonsai.progressSeconds.toFixed(1)}s / ${targetSeconds.toFixed(1)}s`
                    )}
                  </span>
                  <span className="text-slate-500">({matDef.growthMultiplier}x Multiplier)</span>
                </div>
              </div>
            </div>

            {/* Synergies Pill Summary */}
            <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-2.5 text-xs space-y-1.5">
              <div className="flex items-center justify-between font-bold text-[11px]">
                <span className="text-slate-300 flex items-center gap-1">
                  <span>✨ 3x3 Halo Rate:</span>
                </span>
                <span className={bSyn.isStalled ? 'text-rose-400' : 'text-emerald-300'}>
                  {bSyn.isStalled ? '0.00x (STALLED ⛔)' : `x${bSyn.growthMultiplier.toFixed(2)} Speed`}
                </span>
              </div>
              <div className="text-[10px] text-slate-400 flex items-center justify-between font-mono">
                <span>Care EXP: x{bSyn.expMultiplier.toFixed(2)}</span>
                {bSyn.quickPruneBonus > 0 && <span>Quick Prune: +{bSyn.quickPruneBonus.toFixed(2)}s</span>}
                {(bSyn.extraWasteChance || 0) > 0 && <span>Extra Waste: +{Math.round((bSyn.extraWasteChance || 0) * 100)}%</span>}
              </div>

              {/* Active Halos List */}
              <div className="flex flex-wrap gap-1 text-[9px] pt-1 border-t border-slate-800/60">
                {bSyn.isStalled && (
                  <span className="bg-rose-950 text-rose-300 border border-rose-500/80 px-1.5 py-0.2 rounded font-bold">
                    ⛔ Stalling Surroundings (&gt;4 {bSyn.stalledEntityLabel || 'identical neighbors'})
                  </span>
                )}
                {!bSyn.isStalled && bSyn.bonsaiCount > 0 && (
                  <span className="bg-emerald-950 text-emerald-300 border border-emerald-500/50 px-1.5 py-0.2 rounded font-bold">
                    🌿 Growing Together x{bSyn.bonsaiCount} (+{bSyn.bonsaiCount * 10}% Hydration Growth Speed)
                  </span>
                )}
                {!bSyn.isStalled && bSyn.wallCount > 0 && (
                  <span className="bg-cyan-950 text-cyan-300 border border-cyan-500/50 px-1.5 py-0.2 rounded font-bold">
                    🌊 Gentle Waters x{bSyn.wallCount} (+{bSyn.wallCount * 10}% Hydration Growth Speed)
                  </span>
                )}
                {!bSyn.isStalled && bSyn.rockCount > 0 && (
                  <span className="bg-amber-950 text-amber-300 border border-amber-500/50 px-1.5 py-0.2 rounded font-bold">
                    🪨 XP Boosted x{bSyn.rockCount} (+{bSyn.rockCount * 15}% Level Up EXP)
                  </span>
                )}
                {!bSyn.isStalled && (bSyn.bambooCount > 0 || bSyn.bushCount > 0) && (
                  <span className="bg-emerald-950 text-emerald-300 border border-emerald-500/50 px-1.5 py-0.2 rounded font-bold">
                    🎋 Quick Prune x{bSyn.bambooCount || bSyn.bushCount} (+{((bSyn.bambooCount || bSyn.bushCount) * 0.25).toFixed(2)}s Pruning Effect)
                  </span>
                )}
                {!bSyn.isStalled && (bSyn.fernBallCount || 0) > 0 && (
                  <span className="bg-lime-950 text-lime-300 border border-lime-500/50 px-1.5 py-0.2 rounded font-bold">
                    🪴 Efficient Pruning x{bSyn.fernBallCount} (+{(bSyn.fernBallCount || 0) * 15}% Extra Waste Chance)
                  </span>
                )}
              </div>

              {/* Consolidated Crystal Pedestals Halo Effect */}
              {bSyn.crystalPedestals && bSyn.crystalPedestals.total > 0 && (
                <div className="pt-1.5 border-t border-slate-800/80 space-y-1">
                  <div className="flex items-center justify-between font-bold text-[11px]">
                    <span className="text-purple-300 flex items-center gap-1">
                      <span>💎</span>
                      <span>Cultivating Potential:</span>
                    </span>
                    <span className="text-purple-200 font-mono text-[10px]">
                      {formatCrystalPedestalBonus(bSyn.crystalPedestals)}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-1">
                    {bSyn.crystalPedestals.foliage > 0 && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded font-bold bg-emerald-950/80 border border-emerald-500/50 text-emerald-300">
                        +{bSyn.crystalPedestals.foliage} Foliage/lvl
                      </span>
                    )}
                    {bSyn.crystalPedestals.branches > 0 && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded font-bold bg-amber-950/80 border border-amber-500/50 text-amber-300">
                        +{bSyn.crystalPedestals.branches} Branches/lvl
                      </span>
                    )}
                    {bSyn.crystalPedestals.trunk > 0 && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded font-bold bg-rose-950/80 border border-rose-500/50 text-rose-300">
                        +{bSyn.crystalPedestals.trunk} Trunk/lvl
                      </span>
                    )}
                    {bSyn.crystalPedestals.roots > 0 && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded font-bold bg-blue-950/80 border border-blue-500/50 text-blue-300">
                        +{bSyn.crystalPedestals.roots} Roots/lvl
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ========================================================================= */}
          {/* PANEL 2 (CENTER, 4 COLS): CARE ACTIONS & STAT GAUGES */}
          {/* ========================================================================= */}
          <div className="lg:col-span-4 flex flex-col justify-between gap-3 bg-slate-900/80 border border-slate-800/90 rounded-2xl p-3.5 shadow-sm">
            <div className="space-y-3">
              {/* Care Gauges */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5 pb-1 border-b border-slate-800">
                  <Activity className="w-3.5 h-3.5 text-sky-400" />
                  <span>Care Status &amp; Vital Gauges</span>
                </div>

                <div className="grid grid-cols-1 gap-2 text-xs">
                  {/* Moisture Gauge */}
                  <div className="bg-slate-950/80 border border-slate-800/90 p-2.5 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Droplets className="w-4 h-4 text-sky-400" />
                      <div>
                        <span className="font-semibold text-slate-200 block text-xs">Soil Hydration</span>
                        <span className="text-[10px] text-slate-400">
                          {bonsai.wateredTimer && bonsai.wateredTimer > 0
                            ? `Hydrated by Well (${bonsai.wateredTimer.toFixed(1)}s)`
                            : bonsai.automatonTier > 0
                            ? `Automated (Tier ${bonsai.automatonTier})`
                            : 'Manual Pruning / Spraying Ready'}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${
                        bonsai.wateredTimer && bonsai.wateredTimer > 0
                          ? 'bg-sky-950 text-sky-300 border-sky-500/50'
                          : bonsai.automatonTier > 0
                          ? powerSufficient
                            ? 'bg-emerald-950 text-emerald-300 border-emerald-500/50'
                            : 'bg-amber-950 text-amber-300 border-amber-500/50'
                          : 'bg-slate-900 text-slate-400 border-slate-700'
                      }`}>
                      {bonsai.wateredTimer && bonsai.wateredTimer > 0
                        ? 'Hydrated'
                        : bonsai.automatonTier > 0
                        ? powerSufficient
                          ? 'Active'
                          : 'No Power'
                        : 'Manual'}
                    </span>
                  </div>

                  {/* Pruning Vitality */}
                  <div className="bg-slate-950/80 border border-slate-800/90 p-2.5 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Scissors className="w-4 h-4 text-pink-400" />
                      <div>
                        <span className="font-semibold text-slate-200 block text-xs">Foliage Canopy</span>
                        <span className="text-[10px] text-slate-400">
                          {bonsai.pruneBoostTimer > 0
                            ? `Care Boost Active (${bonsai.pruneBoostTimer.toFixed(1)}s)`
                            : 'Balanced leaf pads and ramification'}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold bg-pink-950/80 text-pink-300 border border-pink-500/40 px-2 py-0.5 rounded-lg">
                      {bonsai.pruneBoostTimer > 0 ? '2.5x Boost' : 'Ready'}
                    </span>
                  </div>

                  {/* Soil Nutrients / Compost */}
                  <div className="bg-slate-950/80 border border-slate-800/90 p-2.5 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-base">🌾</span>
                      <div>
                        <span className="font-semibold text-slate-200 block text-xs">Soil Nutrients</span>
                        <span className="text-[10px] text-slate-400">
                          {inv.organic_compost > 0
                            ? `${inv.organic_compost} Enriched Compost in Bag`
                            : '0 Compost in stock (Craft at Workbench)'}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold bg-lime-950/80 text-lime-300 border border-lime-500/40 px-2 py-0.5 rounded-lg font-mono">
                      {inv.organic_compost} Available
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons Grid */}
            <div className="space-y-2 pt-2 border-t border-slate-800/80">
              <div className="grid grid-cols-2 gap-2">
                <button
                  disabled={(inv.fertilizer || inv.resources?.fertilizer || 0) <= 0 || bonsai.level >= 100}
                  onClick={() => onFertilize(bonsai.id)}
                  className={`font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow active:scale-95 ${
                    focusedBtnIdx === 0
                      ? 'ring-4 ring-emerald-400 border-emerald-300 scale-[1.02] shadow-[0_0_15px_rgba(52,211,153,0.7)]'
                      : ''
                  } ${
                    (inv.fertilizer || inv.resources?.fertilizer || 0) > 0 && bonsai.level < 100
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white ring-1 ring-emerald-400/40 hover:ring-emerald-300 cursor-pointer'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                  }`}>
                  <span className="text-sm">🧪</span>
                  <span>
                    {focusedBtnIdx === 0 && '► '}
                    [E / Space] Fertilize (-300s) ({inv.fertilizer || inv.resources?.fertilizer || 0})
                  </span>
                </button>

                <button
                  disabled={inv.organic_compost <= 0 || bonsai.level >= 100}
                  onClick={() => onCompost(bonsai.id)}
                  className={`py-2.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow ${
                    focusedBtnIdx === 1
                      ? 'ring-4 ring-lime-400 border-lime-300 scale-[1.02] shadow-[0_0_15px_rgba(163,230,53,0.7)]'
                      : ''
                  } ${
                    inv.organic_compost > 0 && bonsai.level < 100
                      ? 'bg-lime-600 hover:bg-lime-500 text-white ring-1 ring-lime-400/40 active:scale-95'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}>
                  <span>🌾</span>
                  <span>
                    {focusedBtnIdx === 1 && '► '}
                    [E / C] Compost ({inv.organic_compost})
                  </span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => onDonate(bonsai.id)}
                  className={`font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow active:scale-95 ${
                    isEcoRequestMatch
                      ? 'bg-gradient-to-r from-amber-600 via-emerald-600 to-amber-600 hover:from-amber-500 hover:to-emerald-500 text-amber-100 border-2 border-amber-300 ring-2 ring-emerald-400 shadow-[0_0_20px_rgba(250,204,21,0.5)]'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white ring-1 ring-emerald-400/40'
                  } ${
                    focusedBtnIdx === 2
                      ? 'ring-4 ring-emerald-400 border-emerald-300 scale-[1.02] shadow-[0_0_15px_rgba(16,185,129,0.7)]'
                      : ''
                  }`}>
                  <VerdureIcon className="w-4 h-4" />
                  <span>
                    {focusedBtnIdx === 2 && '► '}
                    {isEcoRequestMatch
                      ? `[E / V] Donate (🌟 2x Bonus: +${(calculateDonationValue(bonsai) * 2).toFixed(2)})`
                      : `[E / V] Donate (+${calculateDonationValue(bonsai).toFixed(2)})`}
                  </span>
                  {isEcoRequestMatch && (
                    <span className="bg-amber-400 text-slate-950 px-1.5 py-0.5 rounded text-[9px] font-black uppercase">
                      🌟 2x Eco Bonus
                    </span>
                  )}
                </button>

                <button
                  onClick={() => onStore(bonsai.id)}
                  className={`bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow border border-slate-700 active:scale-95 ${
                    focusedBtnIdx === 3
                      ? 'ring-4 ring-sky-400 border-sky-300 scale-[1.02] shadow-[0_0_15px_rgba(56,189,248,0.7)]'
                      : ''
                  }`}>
                  <span>🪴</span>
                  <span>
                    {focusedBtnIdx === 3 && '► '}
                    [E] Store in Bag
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* PANEL 3 (RIGHT, 4 COLS): 4-COLUMN "TREE ATTRIBUTES" SECTION */}
          {/* ========================================================================= */}
          <div className="lg:col-span-4 flex flex-col justify-between gap-3 bg-slate-900/80 border border-slate-800/90 rounded-2xl p-3.5 shadow-sm">
            <div className="space-y-2.5">
              {/* Header with Abbreviations Legend on Right */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-400" />
                  <h4 className="font-bold text-slate-100 text-sm">Tree Attributes</h4>
                </div>
                <span className="text-[10px] text-slate-400 font-medium">
                  GP: Genetic Potential • CP: Cultivation Potential
                </span>
              </div>

              {/* 4-Column Table Header */}
              <div className="flex items-center gap-2 px-1 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider pb-1.5 border-b border-slate-800/80">
                <div className="flex-1 min-w-0 font-bold text-slate-400">
                  Attribute
                </div>
                <div className="w-14 sm:w-16 text-center text-slate-300 font-bold shrink-0 leading-tight">
                  Nature<br />Factor
                </div>
                <div className="w-14 sm:w-16 text-center text-slate-300 font-bold shrink-0 leading-tight">
                  Style<br />Factor
                </div>
                <div className="w-16 sm:w-18 text-center text-slate-300 font-bold shrink-0 leading-tight">
                  Combined<br />Synergy
                </div>
              </div>

              {/* 4 Compact Attribute Rows */}
              <div className="space-y-2">
                {attributeList.map(({ key, config, geneticVal, cultPoints }) => {
                  const cpPoints = Math.max(0, Math.min(1000, cultPoints || 0));
                  const cpPercent = (cpPoints / 1000) * 100;
                  const geneticTier = getAttributeTier(geneticVal);
                  const cultTier = getAttributeTier(cpPercent);
                  const natFactor = getNatureFactor(key, bonsai.nature);
                  const styleWeightVal = styleWeights[key] ?? baseAesthetic.weights?.[key] ?? 1.0;
                  const styleFactorDisplay = getFactorDisplay(styleWeightVal);
                  const combinedVal = Number((natFactor.factor + styleWeightVal - 1).toFixed(2));
                  const combDisplay = getFactorDisplay(combinedVal);
                  const attrBA = (baseAesthetic[key] ?? 0).toFixed(2);

                  return (
                    <div
                      key={key}
                      className={`p-2.5 rounded-xl bg-slate-950/80 border ${config.border} flex items-center gap-2 shadow-sm`}>
                      {/* Column 1: Tree Attributes (Icon, Name, Inline BA, GP bar, CP bar) */}
                      <div className="flex-1 min-w-0 space-y-1.5 pr-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="text-xs shrink-0">{config.icon}</span>
                            <span className={`font-bold text-xs truncate ${config.text}`}>{config.name}</span>
                          </div>
                          <span
                            title={`Style Multiplier: x${styleWeightVal.toFixed(1)} (${getBonsaiStyleDef(bonsai.style).name}) • Raw BA: ${(baseAesthetic.raw?.[key] ?? 0).toFixed(2)}`}
                            className="text-[10px] bg-amber-950/80 text-amber-300 border border-amber-500/40 px-1.5 py-0.5 rounded font-bold font-mono shrink-0">
                            {attrBA} BA
                          </span>
                        </div>

                        {/* GP Row */}
                        <div className="flex items-center gap-1.5 text-[10px]">
                          <span className={`font-mono font-bold text-[10px] w-5 shrink-0 ${config.text}`}>
                            GP:
                          </span>
                          <div className="flex-1 bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-800">
                            <div
                              style={{ width: `${geneticVal}%` }}
                              className={`h-full rounded-full transition-all duration-300 ${config.bar}`}>
                            </div>
                          </div>
                          <span
                            className={`text-[10px] font-bold shrink-0 font-mono ${config.lightText}`}>
                            {geneticTier}
                          </span>
                        </div>

                        {/* CP Row */}
                        <div className="flex items-center gap-1.5 text-[10px]">
                          <span className={`font-mono font-bold text-[10px] w-5 shrink-0 ${config.text}`}>
                            CP:
                          </span>
                          <div className="flex-1 bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-800">
                            <div
                              style={{ width: cpPoints === 0 ? '0%' : `${cpPercent}%` }}
                              className={`h-full rounded-full transition-all duration-300 ${config.bar}`}>
                            </div>
                          </div>
                          <span
                            className={`text-[10px] font-bold shrink-0 font-mono ${config.lightText}`}>
                            {cultTier}
                          </span>
                        </div>
                      </div>

                      {/* Column 2: Nature Factor */}
                      <div className="w-14 sm:w-16 text-center shrink-0">
                        <span className={`text-xs font-mono ${natFactor.colorClass}`}>
                          {natFactor.factorLabel}
                        </span>
                      </div>

                      {/* Column 3: Style Factor */}
                      <div className="w-14 sm:w-16 text-center shrink-0">
                        <span className={`text-xs font-mono ${styleFactorDisplay.colorClass}`}>
                          {styleFactorDisplay.arrow} {styleFactorDisplay.text}
                        </span>
                      </div>

                      {/* Column 4: Combined Synergy */}
                      <div className="w-16 sm:w-18 text-center shrink-0">
                        <span className={`text-xs font-mono ${combDisplay.colorClass}`}>
                          {combDisplay.arrow} {combDisplay.text}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Subtle Guidance Note */}
            <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 text-[10px] text-slate-400 leading-relaxed">
              <span className="text-slate-300 font-semibold block mb-0.5">ℹ️ Potential Guidance:</span>
              <span>
                Genetic Potential (GP) is inherited during wild root excavation. Cultivation Potential (CP) starts at 0 and is gained upon level up from adjacent Crystal Pedestals (+1 pt/level).
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Close Button & Controller Hotkeys Bar */}
        <div className="pt-3 border-t border-slate-800 shrink-0 mt-3 flex items-center justify-between gap-3">
          <div className="text-[11px] font-mono text-slate-400 hidden sm:flex items-center gap-2">
            <span>🎮 [WASD / D-Pad] Select Button</span>
            <span>•</span>
            <span>[E / A] Activate Focused</span>
            <span>•</span>
            <span>[Arrows / R-Stick] Scroll</span>
          </div>
          <button
            onClick={onClose}
            className={`flex-1 sm:flex-initial font-bold text-xs py-2.5 px-6 rounded-xl transition-all min-h-[38px] border ${
              focusedBtnIdx === 4
                ? 'bg-slate-700 text-white ring-4 ring-slate-300 border-white scale-[1.02] shadow-[0_0_15px_rgba(255,255,255,0.4)]'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border-slate-700'
            }`}>
            {focusedBtnIdx === 4 && '► '}
            Close Inspection Menu [Esc / B]
          </button>
        </div>
      </div>
    </div>
  );
}
