import React, { useState, useCallback, useEffect } from 'react';
import {
  Trophy,
  Package,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Award,
} from 'lucide-react';
import {
  BonsaiLeafType,
  BonsaiGroup,
  MaturityTier,
  getLeafTypeDef,
  getMaturityDef,
} from './bonsaiData';
import {
  BonsaiAttributes,
  BonsaiNature,
  SeedlingItem,
  ATTRIBUTE_CONFIG,
  getAttributeTier,
  getAttributeTierName,
  getAttributeTierColor,
  calculateHitPrecision,
  calculateExcavationPrecision,
  getPrecisionColor,
  getExcavationArcColor,
  TIERS,
  AREA_EXCAVATION_SPEEDS,
} from './types';
export {
  calculateHitPrecision,
  calculateExcavationPrecision,
  getPrecisionColor,
  getExcavationArcColor,
  TIERS,
  AREA_EXCAVATION_SPEEDS,
};

export const baseSpeed = AREA_EXCAVATION_SPEEDS;
import {gameAudio} from './utils/helper';
import {getBonsaiGroupBadgeClass} from './App';

export interface ExcavationResultData {
  id?: string;
  seedlingId?: string;
  leafType: BonsaiLeafType;
  group: BonsaiGroup;
  maturity: MaturityTier;
  species?: string;
  name: string;
  rarity?: string;
  nature?: BonsaiNature | string;
  findOdds?: number;
  averagePrecision: number;
  zoneHits: {
    zoneIndex: number;
    precision: number;
    isBullseye: boolean;
  }[];
  attributes: BonsaiAttributes;
  geneticPotential?: BonsaiAttributes;
  wasUpgraded?: boolean;
}

export interface BonsaiExcavationModalProps {
  isOpen: boolean;
  result: ExcavationResultData | null;
  onCollect: () => void;
  onDecline?: () => void;
  onStrike?: () => void;
}

export default function BonsaiExcavationModal({
  isOpen,
  result,
  onCollect,
  onDecline,
  onStrike,
}: BonsaiExcavationModalProps) {
  const [selectedAction, setSelectedAction] = useState<'collect' | 'decline'>('collect');

  const handleStrike = useCallback(() => {
    if (onStrike) {
      onStrike();
    } else {
      gameAudio.playCoinPickup();
      onCollect();
    }
  }, [onCollect, onStrike]);

  useEffect(() => {
    if (!isOpen || !result) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter' || e.key === 'e' || e.key === 'E') {
        e.preventDefault();
        if (selectedAction === 'decline' && onDecline) {
          gameAudio.playCrispClick();
          onDecline();
        } else {
          handleStrike();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        gameAudio.playCrispClick();
        onDecline?.();
      } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        setSelectedAction('decline');
        gameAudio.playHoverMicroTone();
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        setSelectedAction('collect');
        gameAudio.playHoverMicroTone();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, result, selectedAction, handleStrike, onDecline]);

  if (!isOpen || !result) return null;

  const matDef = getMaturityDef(result.maturity);
  const leafDef = getLeafTypeDef(result.leafType);
  const avgTierName = getAttributeTierName(result.averagePrecision);
  const avgTierColor = getAttributeTierColor(result.averagePrecision);

  const attributesList: {
    key: keyof BonsaiAttributes;
    config: typeof ATTRIBUTE_CONFIG[keyof typeof ATTRIBUTE_CONFIG];
    value: number;
  }[] = [
    {
      key: 'foliage',
      config: ATTRIBUTE_CONFIG.foliage,
      value: result.attributes.foliage,
    },
    {
      key: 'branches',
      config: ATTRIBUTE_CONFIG.branches,
      value: result.attributes.branches,
    },
    {
      key: 'trunk',
      config: ATTRIBUTE_CONFIG.trunk,
      value: result.attributes.trunk,
    },
    {
      key: 'roots',
      config: ATTRIBUTE_CONFIG.roots,
      value: result.attributes.roots,
    },
  ];

  return (
    <div className="fixed top-12 left-0 right-0 bottom-0 z-40 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md select-none">
      <div className="w-full max-w-4xl max-h-[calc(100vh-3.5rem)] overflow-y-auto bg-slate-900 border-2 border-emerald-500 rounded-3xl p-4 sm:p-5 shadow-[0_0_50px_rgba(16,185,129,0.3)] flex flex-col justify-between text-left animate-in fade-in zoom-in-95 duration-200 gap-3 sm:gap-4">
        {/* Header Ribbon */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-emerald-950/80 border border-emerald-500/60 flex items-center justify-center text-emerald-400 shadow-inner shrink-0">
              <Trophy className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-black text-slate-100">
                  Excavation Appraisal Complete!
                </h3>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 px-2 py-0.5 rounded-full font-black">
                  100% Success
                </span>
                {result.wasUpgraded && (
                  <span className="text-[10px] bg-yellow-500/20 text-yellow-300 border border-yellow-500/50 px-2 py-0.5 rounded-full font-black flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-yellow-400" />
                    <span>Botanical Foraging Uplift!</span>
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400">
                Precision digging extracted pristine root Genetic Potential
              </p>
            </div>
          </div>
        </div>

        {/* 2-Column Responsive Dashboard Layout (Zero Scrolling) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 items-stretch">
          {/* LEFT COLUMN: Seedling Specimen Card & Digging Accuracy */}
          <div className="flex flex-col justify-between gap-3">
            {/* Seedling Specimen Card */}
            <div className="bg-slate-950/90 border border-slate-800 p-3 sm:p-3.5 rounded-2xl shadow-inner flex flex-col justify-between gap-2.5">
              <div className="flex items-center gap-3">
                <div
                  style={{
                    backgroundColor: matDef.bg,
                    borderColor: matDef.border,
                    color: matDef.color,
                    boxShadow: `0 0 12px ${matDef.color}35`,
                  }}
                  className="w-12 h-12 rounded-2xl border-2 flex items-center justify-center text-xl font-black shrink-0">
                  {matDef.kanji}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-black border ${getBonsaiGroupBadgeClass(
                        result.group,
                      )}`}>
                      {result.group}
                    </span>
                    <span
                      style={{
                        backgroundColor: matDef.bg,
                        borderColor: matDef.border,
                        color: matDef.color,
                      }}
                      className="text-[10px] px-2 py-0.5 rounded-full font-black border">
                      {matDef.name} (Rank {matDef.rank})
                    </span>
                    <span className="text-[10px] bg-slate-900 border border-slate-700 text-slate-300 px-2 py-0.5 rounded-full font-semibold">
                      {result.rarity || leafDef.rarity}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm sm:text-base text-slate-100 mt-1 truncate">
                    {result.name}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Leaf Shape: <strong className="text-slate-200">{leafDef.leafShapeName}</strong> • Growth Rate: <strong style={{color: matDef.color}}>{matDef.growthMultiplier}x</strong>
                  </p>
                </div>
              </div>
            </div>

            {/* Overall Digging Precision & Zone Hit Badges */}
            <div className="bg-slate-950/80 border border-slate-800/90 rounded-2xl p-3 sm:p-3.5 space-y-2.5 flex-1 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-base">🎯</span>
                  <span className="text-xs font-bold text-slate-200">
                    Overall Digging Precision Average
                  </span>
                </div>
                <span
                  className={`text-xs font-black px-2.5 py-0.5 rounded-full border ${avgTierColor.bg} ${avgTierColor.text} ${avgTierColor.border}`}>
                  {avgTierName} ({result.averagePrecision}%)
                </span>
              </div>

              {/* Individual Zone Hit Precision Pills */}
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span>Individual Zone Hit Precision:</span>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  {result.zoneHits.map((z) => {
                    const zTier = getAttributeTierColor(z.precision);
                    return (
                      <div
                        key={z.zoneIndex}
                        className={`px-2 py-1 rounded-xl text-[11px] font-bold border flex items-center gap-1 shadow-sm ${zTier.bg} ${zTier.border} ${zTier.text}`}>
                        <span>Z{z.zoneIndex + 1}:</span>
                        <span className="font-mono">{z.precision}%</span>
                        {z.isBullseye && (
                          <span className="text-[9px] bg-amber-400 text-slate-950 font-black px-1 py-0.2 rounded uppercase">
                            Bullseye
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: The 4 Genetic Potential Attribute Cards */}
          <div className="bg-slate-950/80 border border-slate-800/90 p-3 sm:p-3.5 rounded-2xl flex flex-col justify-between gap-2">
            <div className="flex items-center justify-between text-xs pb-1 border-b border-slate-800/80">
              <span className="font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                <span>Assigned Genetic Potential:</span>
              </span>
              <span className="text-[11px] text-slate-400">
                Distributed from {result.averagePrecision}% precision
              </span>
            </div>

            <div className="space-y-2 flex-1 flex flex-col justify-around">
              {attributesList.map(({key, config, value}) => {
                const tierStr = getAttributeTier(value);

                return (
                  <div
                    key={key}
                    className={`bg-slate-900/90 border ${config.border} p-2 sm:p-2.5 rounded-xl space-y-1 shadow-sm transition-all`}>
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-base shrink-0">{config.icon}</span>
                        <span className={`font-bold ${config.text}`}>{config.name}</span>
                        <span className="text-[10px] text-slate-400 truncate hidden sm:inline">
                          — {config.desc}
                        </span>
                      </div>

                      <span
                        className={`text-[10px] sm:text-[11px] font-black px-2 py-0.5 rounded-lg border font-mono shrink-0 ${config.badgeBg} ${config.badgeText} ${config.badgeBorder}`}>
                        {tierStr}
                      </span>
                    </div>

                    {/* Themed Progress Bar */}
                    <div className="w-full bg-slate-950 h-2 sm:h-2.5 rounded-full overflow-hidden border border-slate-800 relative">
                      <div
                        style={{width: `${value}%`}}
                        className={`h-full rounded-full transition-all duration-500 ${config.bar}`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Action Bar: Collect Seedling or Decline/Leave Behind */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-3 shrink-0 pt-2 border-t border-slate-800">
          <div className="text-[11px] font-mono text-emerald-400/90 flex items-center gap-1.5 order-2 sm:order-1">
            <span>🎮 [Space / X] or [E / A] Strike/Collect • [Esc / B] Decline</span>
          </div>
          <div className="flex items-center gap-2.5 sm:gap-3 w-full sm:w-auto order-1 sm:order-2">
            <button
              onClick={() => {
                gameAudio.playCrispClick();
                onDecline?.();
              }}
              className={`px-4 py-2.5 rounded-2xl border font-bold text-xs sm:text-sm transition-all active:scale-95 flex items-center justify-center gap-1.5 shrink-0 ${
                selectedAction === 'decline'
                  ? 'bg-rose-950/80 text-rose-200 border-rose-400 ring-2 ring-rose-500/50 shadow-lg'
                  : 'border-rose-500/40 hover:bg-rose-950/50 text-rose-300'
              }`}>
              <span>Decline [Esc / B]</span>
            </button>
            <button
              onClick={handleStrike}
              autoFocus
              className={`flex-1 sm:flex-none px-6 py-2.5 rounded-2xl font-black text-xs sm:text-sm shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2 ${
                selectedAction === 'collect'
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white ring-2 ring-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.5)] scale-[1.02]'
                  : 'bg-emerald-700 text-emerald-100 hover:bg-emerald-600'
              }`}>
              <Package className="w-4 h-4" />
              <span>Collect Seedling [Space / X] or [E / A] (3.0 kg)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
