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
  getRequiredGrowthDuration,
  calculateDonationValue,
  calculateBonsaiDonationValue,
  getBonsaiDonationBreakdown,
  calculateAttributeFactor,
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
  getBonsaiMaturityRating,
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
  bonsai: PlantedBonsai | any | null;
  synergies: BonsaiSynergies;
  powerSufficient: boolean;
  inventory: SanctuaryInventory;
  skills?: any;
  greenThumbRank: number;
  isEcoRequestMatch?: boolean;
  isStored?: boolean;
  onDonate: (id: string) => void;
  onStore?: (id: string) => void;
  onCompost?: (id: string, tier?: 'S' | 'M' | 'L') => void;
  onFertilize?: (id: string, tier?: 'S' | 'M' | 'L') => void;
  onPrune?: (id: string) => void;
  onToggleFavorite?: (id: string) => void;
  onAttachAutomaton?: (id: string, tier: 1 | 2 | 3) => void;
  onDetachAutomaton?: (id: string) => void;
}

/**
 * Live canvas visualization of the inspected bonsai tree with its specific
 * style (Chokan, Moyogi, Shakan), leaf morphology, pot, and nebari root structure.
 */
function InspectedBonsaiCanvas({ bonsai }: { bonsai: PlantedBonsai | any }) {
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
  skills,
  greenThumbRank,
  isEcoRequestMatch = false,
  isStored = false,
  onDonate,
  onStore,
  onCompost,
  onFertilize,
  onPrune,
  onToggleFavorite,
}: BonsaiInspectionModalProps) {
  // Navigation focus index for interactive buttons:
  // 0: Fertilize, 1: Compost, 2: Donate / Sell, 3: Store in Bag, 4: Favorite Toggle, 5: Close Inspection
  const [focusedBtnIdx, setFocusedBtnIdx] = useState<number>(0);

  const totalCompostStock =
    (inv.compost_s || 0) + (inv.compost_m || 0) + (inv.compost_l || 0);
  const totalFertilizerStock =
    (inv.fertilizer_s || 0) + (inv.fertilizer_m || 0) + (inv.fertilizer_l || 0);

  // Pick best available tier for quick application
  const bestCompostTier: 'L' | 'M' | 'S' | null =
    (inv.compost_l || 0) > 0 ? 'L' : (inv.compost_m || 0) > 0 ? 'M' : (inv.compost_s || 0) > 0 ? 'S' : null;
  const bestFertilizerTier: 'L' | 'M' | 'S' | null =
    (inv.fertilizer_l || 0) > 0 ? 'L' : (inv.fertilizer_m || 0) > 0 ? 'M' : (inv.fertilizer_s || 0) > 0 ? 'S' : null;

  const [selectedCompostTier, setSelectedCompostTier] = useState<'S' | 'M' | 'L'>('S');
  const [selectedFertilizerTier, setSelectedFertilizerTier] = useState<'S' | 'M' | 'L'>('S');

  // Sync selected tier to available stock if possible
  useEffect(() => {
    if (bestCompostTier) setSelectedCompostTier(bestCompostTier);
  }, [inv.compost_s, inv.compost_m, inv.compost_l]);

  useEffect(() => {
    if (bestFertilizerTier) setSelectedFertilizerTier(bestFertilizerTier);
  }, [inv.fertilizer_s, inv.fertilizer_m, inv.fertilizer_l]);

  // Live timer tick for buff countdowns
  const [nowTime, setNowTime] = useState(Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNowTime(Date.now()), 250);
    return () => clearInterval(timer);
  }, []);

  const activateFocusedButton = () => {
    if (!bonsai) return;
    if (focusedBtnIdx === 0) {
      if (bonsai.chemicalBuff && bonsai.chemicalBuff.expiresAt > nowTime) {
        gameAudio?.playErrorBuzz?.();
        return;
      }
      const chosenTier = (inv[`fertilizer_${selectedFertilizerTier.toLowerCase()}`] || 0) > 0
        ? selectedFertilizerTier
        : bestFertilizerTier;
      if (chosenTier && bonsai.level < 100) {
        onFertilize?.(bonsai.id, chosenTier);
      } else {
        gameAudio?.playErrorBuzz?.();
      }
    } else if (focusedBtnIdx === 1) {
      if (bonsai.organicBuff && bonsai.organicBuff.expiresAt > nowTime) {
        gameAudio?.playErrorBuzz?.();
        return;
      }
      const chosenTier = (inv[`compost_${selectedCompostTier.toLowerCase()}`] || 0) > 0
        ? selectedCompostTier
        : bestCompostTier;
      if (chosenTier && bonsai.level < 100) {
        onCompost?.(bonsai.id, chosenTier);
      } else {
        gameAudio?.playErrorBuzz?.();
      }
    } else if (focusedBtnIdx === 2) {
      if (bonsai.isFavorite) {
        gameAudio?.playErrorBuzz?.();
      } else {
        onDonate(bonsai.id);
      }
    } else if (focusedBtnIdx === 3) {
      if (!isStored && onStore) {
        onStore(bonsai.id);
      }
    } else if (focusedBtnIdx === 4) {
      onToggleFavorite?.(bonsai.id);
      gameAudio?.playConfirmSelect?.();
    } else if (focusedBtnIdx === 5) {
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
          if (idx === 4) return 2; // move from favorite to donate
          if (idx === 5) return 4; // move from close to favorite
          return Math.max(0, idx - 1);
        });
        gameAudio?.playHoverMicroTone?.();
      } else if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        setFocusedBtnIdx((idx) => {
          if (idx === 0 || idx === 1) return idx + 2; // move to row 2 (2 or 3)
          if (idx === 2 || idx === 3) return 4; // move to favorite toggle
          if (idx === 4) return 5; // move to close button
          return Math.min(5, idx + 1);
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
          return Math.min(5, idx + 1);
        });
        gameAudio?.playHoverMicroTone?.();
      } else if (e.key === 'e' || e.key === 'E' || e.key === 'Enter') {
        e.preventDefault();
        activateFocusedButton();
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        onToggleFavorite?.(bonsai.id);
        gameAudio?.playConfirmSelect?.();
      } else if (e.key === ' ' || e.key === 'x' || e.key === 'X') {
        e.preventDefault();
        const chosenTier = (inv[`fertilizer_${selectedFertilizerTier.toLowerCase()}`] || 0) > 0
          ? selectedFertilizerTier
          : bestFertilizerTier;
        if (chosenTier && bonsai.level < 100) {
          onFertilize?.(bonsai.id, chosenTier);
        } else {
          gameAudio?.playErrorBuzz?.();
        }
      } else if (e.key === 'c' || e.key === 'C') {
        e.preventDefault();
        const chosenTier = (inv[`compost_${selectedCompostTier.toLowerCase()}`] || 0) > 0
          ? selectedCompostTier
          : bestCompostTier;
        if (chosenTier && bonsai.level < 100) {
          onCompost?.(bonsai.id, chosenTier);
        } else {
          gameAudio?.playErrorBuzz?.();
        }
      } else if (e.key === 'v' || e.key === 'V') {
        e.preventDefault();
        if (bonsai.isFavorite) {
          gameAudio?.playErrorBuzz?.();
        } else {
          onDonate(bonsai.id);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, bonsai, focusedBtnIdx, inv, isStored, onFertilize, onCompost, onDonate, onStore, onToggleFavorite, onClose, selectedCompostTier, selectedFertilizerTier, bestCompostTier, bestFertilizerTier]);

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

  const targetSeconds = getRequiredGrowthDuration(
    bonsai.level,
    bonsai.maturityRating || bonsai.maturity || bonsai,
  );
  const growthPct = Math.min(100, Math.round((bonsai.progressSeconds / targetSeconds) * 100));
  const tierSpeed =
    bonsai.automatonTier > 0
      ? getAutomatonConfig(bonsai.automatonTier)?.speedMultiplier || 1.0
      : 1.0;
  const remainingSeconds = Math.max(0, (targetSeconds - bonsai.progressSeconds) / tierSpeed);
  const donationBreakdown = getBonsaiDonationBreakdown(bonsai, skills);
  const finalDonationValue = donationBreakdown.finalValue;

  return (
    <div className="fixed top-12 left-0 right-0 bottom-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm pointer-events-auto select-none">
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
                {bonsai.isFavorite && (
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-black bg-amber-500 text-slate-950 border border-amber-300 flex items-center gap-1 shadow-[0_0_12px_rgba(245,158,11,0.5)]">
                    <span>⭐</span>
                    <span>Favorited (Locked from Donation)</span>
                  </span>
                )}
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
                  Req: {getRequiredGrowthDuration(bonsai.level, bonsai.maturityRating || bonsai.maturity || bonsai)}s (R.{getBonsaiMaturityRating(bonsai)} • {matDef.name})
                </span>
                <span>•</span>
                <span className={`font-bold flex items-center gap-1 ${isEcoRequestMatch ? 'text-amber-300 bg-amber-950/80 border border-amber-500/50 px-2 py-0.5 rounded-lg' : 'text-emerald-300'}`}>
                  <VerdureIcon className="w-3.5 h-3.5" />
                  <span>+{(finalDonationValue * (isEcoRequestMatch ? 2 : 1)).toFixed(2)} Verdure</span>
                  {isEcoRequestMatch && (
                    <span className="text-[9px] bg-amber-400 text-slate-950 px-1 py-0.2 rounded font-black">
                      🌟 2x Match!
                    </span>
                  )}
                </span>
                <span>•</span>
                <span className="text-purple-300 font-mono font-bold text-[11px] bg-purple-950/80 border border-purple-500/40 px-2 py-0.5 rounded-lg">
                  GP/CP: x{donationBreakdown.attributeFactor.toFixed(2)}
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
                      `Timer: ${remainingSeconds.toFixed(1)}s until Level ${bonsai.level + 1} (${targetSeconds}s total)`
                    ) : (
                      `Progress: ${bonsai.progressSeconds.toFixed(1)}s / ${targetSeconds}s`
                    )}
                  </span>
                  <span className="text-slate-500">(R.{getBonsaiMaturityRating(bonsai)}: {targetSeconds}s)</span>
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
                {!bSyn.isStalled && bSyn.hasToriiGate && (
                  <span className="bg-red-950 text-red-200 border border-red-500/60 px-1.5 py-0.2 rounded font-bold">
                    ⛩️ Doubling Down (2x All Halo Effects)
                  </span>
                )}
                {!bSyn.isStalled && bSyn.bonsaiCount > 0 && (
                  <span className="bg-emerald-950 text-emerald-300 border border-emerald-500/50 px-1.5 py-0.2 rounded font-bold">
                    🌿 Growing Together x{bSyn.bonsaiCount} (+{(bSyn.bonsaiCount * 10 * (bSyn.haloMultiplier || 1))}% Growth Speed)
                  </span>
                )}
                {!bSyn.isStalled && bSyn.wallCount > 0 && (
                  <span className="bg-cyan-950 text-cyan-300 border border-cyan-500/50 px-1.5 py-0.2 rounded font-bold">
                    🌊 Gentle Waters x{bSyn.wallCount} (+{(bSyn.wallCount * 10 * (bSyn.haloMultiplier || 1))}% Hydration Growth Speed)
                  </span>
                )}
                {!bSyn.isStalled && bSyn.rockCount > 0 && (
                  <span className="bg-amber-950 text-amber-300 border border-amber-500/50 px-1.5 py-0.2 rounded font-bold">
                    🪨 XP Boosted x{bSyn.rockCount} (+{(bSyn.rockCount * 15 * (bSyn.haloMultiplier || 1))}% Level Up EXP)
                  </span>
                )}
                {!bSyn.isStalled && (bSyn.bambooCount > 0 || bSyn.bushCount > 0) && (
                  <span className="bg-emerald-950 text-emerald-300 border border-emerald-500/50 px-1.5 py-0.2 rounded font-bold">
                    🎋 Quick Prune x{bSyn.bambooCount || bSyn.bushCount} (+{((bSyn.bambooCount || bSyn.bushCount) * 0.25 * (bSyn.haloMultiplier || 1)).toFixed(2)}s Pruning Effect)
                  </span>
                )}
                {!bSyn.isStalled && (bSyn.fernBallCount || 0) > 0 && (
                  <span className="bg-lime-950 text-lime-300 border border-lime-500/50 px-1.5 py-0.2 rounded font-bold">
                    🪴 Efficient Pruning x{bSyn.fernBallCount} (+{Math.round((bSyn.fernBallCount || 0) * 15 * (bSyn.haloMultiplier || 1))}% Extra Waste Chance)
                  </span>
                )}
                {!bSyn.isStalled && (bSyn.sevenLuckyGodsCount || 0) > 0 && (
                  <span className="bg-amber-950 text-amber-300 border border-amber-500/50 px-1.5 py-0.2 rounded font-bold">
                    🌟 Fortunate Blessings x{bSyn.sevenLuckyGodsCount} (+{(bSyn.basePriceBonusRate || 0).toFixed(2)} Baseprice/lvl)
                  </span>
                )}
                {!bSyn.isStalled && (bSyn.stoneLanternCount || 0) > 0 && (
                  <span className="bg-cyan-950 text-cyan-300 border border-cyan-500/50 px-1.5 py-0.2 rounded font-bold">
                    🏮 Skilled Knowledge x{bSyn.stoneLanternCount} ({(((bSyn.zenPointChance || 0) * 100)).toFixed(1)}% Zen Point/lvl)
                  </span>
                )}
                {bSyn.isDisruptedZen && (
                  <span className="bg-amber-950 text-amber-300 border border-amber-500/50 px-1.5 py-0.2 rounded font-bold">
                    ⚠️ Disrupted Zen (-{bSyn.totalDisruptedZenPenalty}% Growth Speed)
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

                  {/* Active Organic Buff Status */}
                  {bonsai.organicBuff && bonsai.organicBuff.expiresAt > nowTime ? (
                    <div className="bg-lime-950/70 border border-lime-500/60 p-2.5 rounded-xl flex items-center justify-between shadow-sm animate-pulse">
                      <div className="flex items-center gap-2">
                        <span className="text-base">🍂</span>
                        <div>
                          <span className="font-bold text-lime-300 block text-xs">
                            Organic Boost ({bonsai.organicBuff.tier})
                          </span>
                          <span className="text-[10px] text-lime-200/80 font-mono">
                            +{Math.round(bonsai.organicBuff.multiplier * 100)}% Growth Speed
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] font-black bg-lime-900 text-lime-200 border border-lime-400 px-2 py-0.5 rounded-lg font-mono">
                        {Math.max(1, Math.ceil((bonsai.organicBuff.expiresAt - nowTime) / 1000))}s left
                      </span>
                    </div>
                  ) : null}

                  {/* Active Chemical Buff Status */}
                  {bonsai.chemicalBuff && bonsai.chemicalBuff.expiresAt > nowTime ? (
                    <div className="bg-cyan-950/70 border border-cyan-500/60 p-2.5 rounded-xl flex items-center justify-between shadow-sm animate-pulse">
                      <div className="flex items-center gap-2">
                        <span className="text-base">🧪</span>
                        <div>
                          <span className="font-bold text-cyan-300 block text-xs">
                            Chemical Boost ({bonsai.chemicalBuff.tier})
                          </span>
                          <span className="text-[10px] text-cyan-200/80 font-mono">
                            +{Math.round(bonsai.chemicalBuff.multiplier * 100)}% Hydration Speed
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] font-black bg-cyan-900 text-cyan-200 border border-cyan-400 px-2 py-0.5 rounded-lg font-mono">
                        {Math.max(1, Math.ceil((bonsai.chemicalBuff.expiresAt - nowTime) / 1000))}s left
                      </span>
                    </div>
                  ) : null}

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

                  {/* Tiered Consumables Stock Summary */}
                  <div className="bg-slate-950/80 border border-slate-800/90 p-2.5 rounded-xl space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-300 flex items-center gap-1.5">
                        <span>🍂</span>
                        <span>Compost in Bag:</span>
                      </span>
                      <div className="flex items-center gap-1.5 font-mono text-[10px]">
                        <span className="bg-slate-900 px-1.5 py-0.5 rounded border border-slate-700 text-lime-300">
                          S: {inv.compost_s || 0}
                        </span>
                        <span className="bg-slate-900 px-1.5 py-0.5 rounded border border-slate-700 text-emerald-300">
                          M: {inv.compost_m || 0}
                        </span>
                        <span className="bg-slate-900 px-1.5 py-0.5 rounded border border-slate-700 text-amber-300">
                          L: {inv.compost_l || 0}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/60">
                      <span className="font-bold text-slate-300 flex items-center gap-1.5">
                        <span>🧪</span>
                        <span>Fertilizer in Bag:</span>
                      </span>
                      <div className="flex items-center gap-1.5 font-mono text-[10px]">
                        <span className="bg-slate-900 px-1.5 py-0.5 rounded border border-slate-700 text-cyan-300">
                          S: {inv.fertilizer_s || 0}
                        </span>
                        <span className="bg-slate-900 px-1.5 py-0.5 rounded border border-slate-700 text-sky-300">
                          M: {inv.fertilizer_m || 0}
                        </span>
                        <span className="bg-slate-900 px-1.5 py-0.5 rounded border border-slate-700 text-purple-300">
                          L: {inv.fertilizer_l || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons Grid with Tier Selectors */}
            <div className="space-y-2 pt-2 border-t border-slate-800/80">
              <div className="grid grid-cols-2 gap-2">
                {/* FERTILIZER APPLICATION BUTTON */}
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between px-1 text-[10px] text-slate-400 font-bold">
                    <span>🧪 FERTILIZER TIER:</span>
                    <div className="flex items-center gap-1">
                      {(['S', 'M', 'L'] as const).map((t) => {
                        const count = inv[`fertilizer_${t.toLowerCase()}`] || 0;
                        const isChosen = selectedFertilizerTier === t;
                        return (
                          <button
                            key={t}
                            onClick={() => setSelectedFertilizerTier(t)}
                            className={`px-1.5 py-0.2 rounded font-mono text-[9px] font-bold border cursor-pointer ${
                              isChosen
                                ? 'bg-cyan-600 text-white border-cyan-400'
                                : count > 0
                                ? 'bg-slate-900 text-cyan-300 border-slate-700 hover:border-cyan-500'
                                : 'bg-slate-950 text-slate-600 border-slate-800'
                            }`}>
                            {t} ({count})
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <button
                    disabled={
                      (inv[`fertilizer_${selectedFertilizerTier.toLowerCase()}`] || 0) <= 0 ||
                      bonsai.level >= 100 ||
                      Boolean(bonsai.chemicalBuff && bonsai.chemicalBuff.expiresAt > nowTime)
                    }
                    onClick={() => onFertilize?.(bonsai.id, selectedFertilizerTier)}
                    className={`font-bold text-xs py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow active:scale-95 ${
                      focusedBtnIdx === 0
                        ? 'ring-4 ring-cyan-400 border-cyan-300 scale-[1.02] shadow-[0_0_15px_rgba(6,182,212,0.7)]'
                        : ''
                    } ${
                      (inv[`fertilizer_${selectedFertilizerTier.toLowerCase()}`] || 0) > 0 &&
                      bonsai.level < 100 &&
                      !(bonsai.chemicalBuff && bonsai.chemicalBuff.expiresAt > nowTime)
                        ? 'bg-cyan-600 hover:bg-cyan-500 text-white ring-1 ring-cyan-400/40 cursor-pointer'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                    }`}>
                    <span className="text-sm">🧪</span>
                    <span>
                      {focusedBtnIdx === 0 && '► '}
                      {bonsai.chemicalBuff && bonsai.chemicalBuff.expiresAt > nowTime
                        ? 'Active Fertilizer Running'
                        : `Apply Fertilizer ${selectedFertilizerTier} (${inv[`fertilizer_${selectedFertilizerTier.toLowerCase()}`] || 0})`}
                    </span>
                  </button>
                </div>

                {/* COMPOST APPLICATION BUTTON */}
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between px-1 text-[10px] text-slate-400 font-bold">
                    <span>🍂 COMPOST TIER:</span>
                    <div className="flex items-center gap-1">
                      {(['S', 'M', 'L'] as const).map((t) => {
                        const count = inv[`compost_${t.toLowerCase()}`] || 0;
                        const isChosen = selectedCompostTier === t;
                        return (
                          <button
                            key={t}
                            onClick={() => setSelectedCompostTier(t)}
                            className={`px-1.5 py-0.2 rounded font-mono text-[9px] font-bold border cursor-pointer ${
                              isChosen
                                ? 'bg-lime-600 text-white border-lime-400'
                                : count > 0
                                ? 'bg-slate-900 text-lime-300 border-slate-700 hover:border-lime-500'
                                : 'bg-slate-950 text-slate-600 border-slate-800'
                            }`}>
                            {t} ({count})
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <button
                    disabled={
                      (inv[`compost_${selectedCompostTier.toLowerCase()}`] || 0) <= 0 ||
                      bonsai.level >= 100 ||
                      Boolean(bonsai.organicBuff && bonsai.organicBuff.expiresAt > nowTime)
                    }
                    onClick={() => onCompost?.(bonsai.id, selectedCompostTier)}
                    className={`font-bold text-xs py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow active:scale-95 ${
                      focusedBtnIdx === 1
                        ? 'ring-4 ring-lime-400 border-lime-300 scale-[1.02] shadow-[0_0_15px_rgba(163,230,53,0.7)]'
                        : ''
                    } ${
                      (inv[`compost_${selectedCompostTier.toLowerCase()}`] || 0) > 0 &&
                      bonsai.level < 100 &&
                      !(bonsai.organicBuff && bonsai.organicBuff.expiresAt > nowTime)
                        ? 'bg-lime-600 hover:bg-lime-500 text-white ring-1 ring-lime-400/40 cursor-pointer'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                    }`}>
                    <span className="text-sm">🍂</span>
                    <span>
                      {focusedBtnIdx === 1 && '► '}
                      {bonsai.organicBuff && bonsai.organicBuff.expiresAt > nowTime
                        ? 'Active Compost Running'
                        : `Apply Compost ${selectedCompostTier} (${inv[`compost_${selectedCompostTier.toLowerCase()}`] || 0})`}
                    </span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  disabled={bonsai.isFavorite}
                  onClick={() => {
                    if (bonsai.isFavorite) {
                      gameAudio?.playErrorBuzz?.();
                      return;
                    }
                    onDonate(bonsai.id);
                  }}
                  title={bonsai.isFavorite ? 'Favorited - Locked from Donation' : undefined}
                  className={`font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow ${
                    bonsai.isFavorite
                      ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-80'
                      : isEcoRequestMatch
                      ? 'bg-gradient-to-r from-amber-600 via-emerald-600 to-amber-600 hover:from-amber-500 hover:to-emerald-500 text-amber-100 border-2 border-amber-300 ring-2 ring-emerald-400 shadow-[0_0_20px_rgba(250,204,21,0.5)] active:scale-95 cursor-pointer'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white ring-1 ring-emerald-400/40 active:scale-95 cursor-pointer'
                  } ${
                    focusedBtnIdx === 2
                      ? 'ring-4 ring-emerald-400 border-emerald-300 scale-[1.02] shadow-[0_0_15px_rgba(16,185,129,0.7)]'
                      : ''
                  }`}>
                  {bonsai.isFavorite ? (
                    <>
                      <span>🔒</span>
                      <span>Favorited (Locked from Donation)</span>
                    </>
                  ) : (
                    <>
                      <VerdureIcon className="w-4 h-4" />
                      <span>
                        {focusedBtnIdx === 2 && '► '}
                        {isEcoRequestMatch
                          ? `[E / V] Donate (🌟 2x Bonus: +${(finalDonationValue * 2).toFixed(2)})`
                          : `[E / V] Donate (+${finalDonationValue.toFixed(2)})`}
                      </span>
                      {isEcoRequestMatch && (
                        <span className="bg-amber-400 text-slate-950 px-1.5 py-0.5 rounded text-[9px] font-black uppercase">
                          🌟 2x Eco Bonus
                        </span>
                      )}
                    </>
                  )}
                </button>

                <button
                  disabled={isStored}
                  onClick={() => onStore?.(bonsai.id)}
                  className={`font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow border active:scale-95 ${
                    isStored
                      ? 'bg-slate-800 text-slate-500 border-slate-700 cursor-default opacity-75'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700 cursor-pointer'
                  } ${
                    focusedBtnIdx === 3
                      ? 'ring-4 ring-sky-400 border-sky-300 scale-[1.02] shadow-[0_0_15px_rgba(56,189,248,0.7)]'
                      : ''
                  }`}>
                  <span>🪴</span>
                  <span>
                    {focusedBtnIdx === 3 && '► '}
                    {isStored ? 'In Storage' : '[E] Store in Bag'}
                  </span>
                </button>
              </div>

              {/* DONATION VALUE FORMULA BREAKDOWN TELEMETRY CARD */}
              <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 text-[10px] space-y-1">
                <div className="flex items-center justify-between text-slate-300 font-bold">
                  <span className="flex items-center gap-1 text-amber-300">
                    <VerdureIcon className="w-3.5 h-3.5" />
                    <span>Donation Value Breakdown:</span>
                  </span>
                  <span className="text-emerald-300 font-mono font-black">
                    +{finalDonationValue.toFixed(2)} Verdure{' '}
                    <span className="text-[9px] text-slate-500">
                      (Max: {(675 * donationBreakdown.expertNegotiatorBonus).toFixed(2)})
                    </span>
                  </span>
                </div>
                <div className="text-[9px] text-slate-400 font-mono leading-tight">
                  1.0 (Base) × {donationBreakdown.speciesFindOdds.toFixed(1)}x (Odds) × {donationBreakdown.maturityRating.toFixed(1)}x (Rank {donationBreakdown.ratingRank}) × {donationBreakdown.levelFactor.toFixed(2)}x (Lv.{donationBreakdown.level}) × {donationBreakdown.attributeFactor.toFixed(2)}x (GP/CP)
                  {donationBreakdown.expertNegotiatorLvl > 0 && (
                    <span className="text-amber-300 font-bold">
                      {' '}× {donationBreakdown.expertNegotiatorBonus.toFixed(2)}x (+{donationBreakdown.expertNegotiatorLvl * 10}% Expert Negotiator)
                    </span>
                  )}
                </div>
              </div>

              {/* FAVORITE / UNFAVORITE TOGGLE BUTTON */}
              <button
                onClick={() => {
                  onToggleFavorite?.(bonsai.id);
                  gameAudio?.playConfirmSelect?.();
                }}
                className={`w-full font-bold text-xs py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow active:scale-95 border cursor-pointer ${
                  bonsai.isFavorite
                    ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 border-amber-300 ring-2 ring-amber-400/50 shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                    : 'bg-slate-900 hover:bg-slate-800 text-amber-300 border-amber-500/50 hover:border-amber-400'
                } ${
                  focusedBtnIdx === 4
                    ? 'ring-4 ring-amber-400 border-amber-300 scale-[1.02]'
                    : ''
                }`}>
                <span className="text-sm">⭐</span>
                <span>
                  {focusedBtnIdx === 4 && '► '}
                  {bonsai.isFavorite
                    ? 'Unfavorite (Unlock for Donation)'
                    : 'Favorite (Lock from Donation)'}
                </span>
                <span className="text-[10px] font-mono opacity-80">[F]</span>
              </button>
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

            {/* Attribute GP/CP Donation Multiplier Summary Card */}
            <div className="bg-slate-950/85 p-2.5 rounded-xl border border-purple-500/40 space-y-1.5 shadow-sm text-xs">
              <div className="flex items-center justify-between font-bold">
                <span className="text-purple-300 flex items-center gap-1 text-xs">
                  <Award className="w-3.5 h-3.5 text-purple-400" />
                  <span>Attribute GP/CP Multiplier:</span>
                </span>
                <span className="text-purple-300 font-mono text-xs font-black">
                  x{donationBreakdown.attributeFactor.toFixed(2)} / 9.0x
                </span>
              </div>
              <div className="grid grid-cols-2 gap-1 text-[10px] text-slate-300 font-mono pt-1 border-t border-slate-800">
                <div className="truncate">
                  GP Sum: +{(donationBreakdown.attributeBreakdown.foliageGP + donationBreakdown.attributeBreakdown.branchesGP + donationBreakdown.attributeBreakdown.trunkGP + donationBreakdown.attributeBreakdown.rootsGP).toFixed(2)} / 4.0
                </div>
                <div className="truncate">
                  CP Sum: +{(donationBreakdown.attributeBreakdown.foliageCP + donationBreakdown.attributeBreakdown.branchesCP + donationBreakdown.attributeBreakdown.trunkCP + donationBreakdown.attributeBreakdown.rootsCP).toFixed(2)} / 4.0
                </div>
              </div>
              <p className="text-[9.5px] text-slate-400 leading-tight">
                Formula: 1.0 + Sum of 4 normalized GP (0-1) &amp; 4 normalized CP (0-1). Multiplies Society donation value up to 9x!
              </p>
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
