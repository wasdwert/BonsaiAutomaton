import React, { useEffect } from 'react';
import {
  Sparkles,
  ArrowRight,
  Award,
  CheckCircle2,
  Package,
} from 'lucide-react';
import {
  BonsaiAttributes,
  CultivationPotential,
  ATTRIBUTE_CONFIG,
  getAttributeTier,
} from './types';
import {
  getMaturityDef,
  getBonsaiDisplayName,
  getBonsaiStyleDef,
} from './bonsaiData';
import { StoredPottedBonsai } from './App';
import SanctuaryCanvas from './SanctuaryCanvas';
import { gameAudio } from './utils/helper';

export interface BonsaiMaturedModalData {
  originalBonsai: any;
  maturedSpecimen: StoredPottedBonsai;
  currentRating: number;
  targetRating: number;
  retainedRatio: number;
  newRatio: number;
  oldGP: BonsaiAttributes;
  newGP: BonsaiAttributes;
  finalGP: BonsaiAttributes;
  finalCP: CultivationPotential;
  averagePrecision: number;
  zonePrecisions: number[];
}

export interface BonsaiMaturedModalProps {
  isOpen: boolean;
  data: BonsaiMaturedModalData | null;
  onConfirm: () => void;
}

export default function BonsaiMaturedModal({
  isOpen,
  data,
  onConfirm,
}: BonsaiMaturedModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter' || e.key === 'e' || e.key === 'E' || e.key === 'Escape') {
        e.preventDefault();
        onConfirm();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onConfirm]);

  if (!isOpen || !data) return null;

  const {
    originalBonsai,
    maturedSpecimen,
    currentRating,
    targetRating,
    retainedRatio,
    newRatio,
    oldGP,
    newGP,
    finalGP,
    finalCP,
    averagePrecision,
  } = data;

  const currentMatDef = getMaturityDef(originalBonsai.maturity || 'sprout');
  const targetMatDef = getMaturityDef(maturedSpecimen.maturity || 'sapling');
  const styleDef = getBonsaiStyleDef(maturedSpecimen.style);

  const attributes = [
    { key: 'foliage' as const, config: ATTRIBUTE_CONFIG.foliage },
    { key: 'branches' as const, config: ATTRIBUTE_CONFIG.branches },
    { key: 'trunk' as const, config: ATTRIBUTE_CONFIG.trunk },
    { key: 'roots' as const, config: ATTRIBUTE_CONFIG.roots },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 select-none overflow-hidden animate-in fade-in duration-200">
      <div className="w-full max-w-5xl max-h-[88vh] overflow-y-auto bg-slate-900/95 border-2 border-amber-500/50 rounded-2xl shadow-2xl p-5 sm:p-7 flex flex-col gap-5 sm:gap-6 text-white text-left">
        {/* Header Ribbon */}
        <div className="flex items-center justify-between border-b border-amber-500/30 pb-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-950/90 border-2 border-amber-400/80 flex items-center justify-center text-amber-300 text-2xl shadow-[0_0_20px_rgba(245,158,11,0.5)]">
              🌟
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-xl sm:text-2xl font-black text-amber-300 tracking-wide">
                  Bonsai Matured!
                </h3>
                <span className="text-[10px] bg-amber-400 text-slate-950 font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Success
                </span>
                {maturedSpecimen.variant === 'blooming' && (
                  <span className="text-[10px] bg-pink-950 text-pink-300 border border-pink-400 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                    <span>🌸</span>
                    <span>Blooming</span>
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-amber-200/80">
                Specimen elevated to Maturity Rating {targetRating} ({targetMatDef.name})!
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-slate-950/90 text-amber-300 border border-amber-500/40 px-3 py-1 rounded-xl font-mono font-bold shadow-inner">
              Excavation Precision: {averagePrecision}%
            </span>
          </div>
        </div>

        {/* 2-Column Wide Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch flex-1">
          {/* LEFT COLUMN: Specimen Showcase with Large Vector Bonsai Render (5 Cols) */}
          <div className="lg:col-span-5 bg-slate-950/90 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col items-center justify-between gap-4 shadow-inner">
            {/* Specimen Header */}
            <div className="w-full flex items-center justify-between border-b border-slate-800/80 pb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Specimen Showcase
              </span>
              <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-500/40 px-2.5 py-0.5 rounded-full">
                Level 1 (Reset)
              </span>
            </div>

            {/* Large Vector Bonsai Render */}
            <div className="w-full flex items-center justify-center py-1">
              <SanctuaryCanvas
                bonsai={maturedSpecimen}
                width={260}
                height={200}
                className="shadow-md"
              />
            </div>

            {/* Specimen Details & Maturity Upgrade Pill */}
            <div className="w-full space-y-3">
              <div className="text-center">
                <h4 className="text-lg font-black text-slate-100 flex items-center justify-center gap-1.5">
                  {maturedSpecimen.variant === 'blooming' && <span>🌸</span>}
                  <span>{getBonsaiDisplayName(maturedSpecimen)}</span>
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  Style: <strong className="text-emerald-300">{styleDef.japanese} ({styleDef.name})</strong> • Nature: <strong>{maturedSpecimen.nature ? (typeof maturedSpecimen.nature === 'string' ? maturedSpecimen.nature : maturedSpecimen.nature.name) : 'Balanced'}</strong>
                </p>
              </div>

              {/* Maturity Rating Elevation Pill (Rating 1 -> Rating 2) */}
              <div className="flex items-center justify-center gap-3 py-2 px-3 bg-slate-900/90 rounded-xl border border-slate-800">
                <div
                  style={{
                    backgroundColor: currentMatDef.bg,
                    borderColor: currentMatDef.border,
                    color: currentMatDef.color,
                  }}
                  className="text-xs font-black px-2.5 py-1 rounded-lg border flex items-center gap-1 opacity-75">
                  <span>{currentMatDef.kanji}</span>
                  <span>Rating {currentRating}</span>
                </div>

                <ArrowRight className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />

                <div
                  style={{
                    backgroundColor: targetMatDef.bg,
                    borderColor: targetMatDef.border,
                    color: targetMatDef.color,
                    boxShadow: `0 0 14px ${targetMatDef.color}40`,
                  }}
                  className="text-xs font-black px-3 py-1 rounded-lg border-2 flex items-center gap-1.5 shadow-md">
                  <span>{targetMatDef.kanji}</span>
                  <span>Rating {targetRating} ({targetMatDef.name})</span>
                  <Sparkles className="w-3.5 h-3.5 fill-current" />
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Genetic Potential (GP) Synthesis (7 Cols) */}
          <div className="lg:col-span-7 bg-slate-950/90 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col justify-between gap-3 shadow-inner">
            <div>
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 mb-2 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-400" />
                  <span className="text-sm font-bold text-amber-300">
                    Genetic Potential (GP) Synthesis Breakdown
                  </span>
                </div>
                <span className="text-[11px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                  Retained: <strong>{(retainedRatio * 100).toFixed(0)}%</strong> • New: <strong>{(newRatio * 100).toFixed(0)}%</strong>
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Final GP = round((Old GP × {(retainedRatio * 100).toFixed(0)}%) + (New GP from minigame × {(newRatio * 100).toFixed(0)}%))
              </p>
            </div>

            {/* 4 Spacious Attribute Cards (Zero Overlapping Text) */}
            <div className="space-y-2.5 flex-1 flex flex-col justify-around">
              {attributes.map(({ key, config }) => {
                const oldVal = oldGP[key] || 0;
                const newVal = newGP[key] || 0;
                const fVal = finalGP[key] || 0;
                const retainedAmt = (oldVal * retainedRatio).toFixed(1);
                const newAmt = (newVal * newRatio).toFixed(1);
                const tierName = getAttributeTier(fVal);

                return (
                  <div
                    key={key}
                    className={`p-3 rounded-xl bg-slate-900/90 border ${config.border} space-y-2 shadow-sm`}>
                    {/* Top Row: Attribute Name & Final Result Badge */}
                    <div className="flex items-center justify-between">
                      <span className={`font-bold text-xs sm:text-sm flex items-center gap-1.5 ${config.text}`}>
                        <span>{config.icon}</span>
                        <span>{config.name}</span>
                      </span>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-black font-mono ${config.lightText}`}>
                          = {fVal}%
                        </span>
                        <span className="text-[10px] text-slate-300 font-semibold bg-slate-950 px-2 py-0.5 rounded-md border border-slate-800">
                          {tierName}
                        </span>
                      </div>
                    </div>

                    {/* Middle Row: Clean, Formatted Calculation Badges */}
                    <div className="flex items-center gap-2 text-xs font-mono flex-wrap">
                      <span className="bg-slate-950/80 text-slate-300 px-2.5 py-0.5 rounded-md border border-slate-800">
                        Old: <strong>{oldVal}%</strong> (Retained: <strong className="text-amber-300">{retainedAmt}%</strong>)
                      </span>
                      <span className="text-amber-400 font-bold">+</span>
                      <span className="bg-slate-950/80 text-slate-300 px-2.5 py-0.5 rounded-md border border-slate-800">
                        New: <strong>{newVal}%</strong> (Added: <strong className="text-emerald-300">{newAmt}%</strong>)
                      </span>
                    </div>

                    {/* Bottom Row: Clear Progress Bar */}
                    <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
                      <div
                        style={{ width: `${Math.max(2, Math.min(100, fVal))}%` }}
                        className={`h-full rounded-full transition-all duration-300 ${config.bar}`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* BOTTOM SECTION: Preserved Cultivation Potential (CP) Summary */}
        <div className="bg-slate-950/80 border border-purple-500/40 rounded-2xl p-4 space-y-2.5 shadow-md">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-1.5 flex-wrap gap-2">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-purple-300">
              <span>🔮</span>
              <span>Preserved Cultivation Potential (CP)</span>
            </div>
            <span className="text-[11px] bg-purple-950 text-purple-200 border border-purple-500/50 px-2.5 py-0.5 rounded-full font-bold">
              ✨ 100% Carried Over Without Loss
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-mono">
            <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 text-center">
              <span className="text-emerald-400 font-bold block text-[11px]">🍃 Foliage</span>
              <strong className="text-slate-100 text-sm">{finalCP.foliage} CP</strong>
              <span className="text-[10px] text-slate-400 block font-normal">
                ({(finalCP.foliage / 10).toFixed(0)}%)
              </span>
            </div>
            <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 text-center">
              <span className="text-amber-400 font-bold block text-[11px]">🪵 Branches</span>
              <strong className="text-slate-100 text-sm">{finalCP.branches} CP</strong>
              <span className="text-[10px] text-slate-400 block font-normal">
                ({(finalCP.branches / 10).toFixed(0)}%)
              </span>
            </div>
            <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 text-center">
              <span className="text-rose-400 font-bold block text-[11px]">🌲 Trunk</span>
              <strong className="text-slate-100 text-sm">{finalCP.trunk} CP</strong>
              <span className="text-[10px] text-slate-400 block font-normal">
                ({(finalCP.trunk / 10).toFixed(0)}%)
              </span>
            </div>
            <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 text-center">
              <span className="text-blue-400 font-bold block text-[11px]">🪴 Roots</span>
              <strong className="text-slate-100 text-sm">{finalCP.roots} CP</strong>
              <span className="text-[10px] text-slate-400 block font-normal">
                ({(finalCP.roots / 10).toFixed(0)}%)
              </span>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 leading-tight">
            All Cultivation Potential accumulated from Crystal Pedestals is strictly preserved without loss during maturation.
          </p>
        </div>

        {/* BOTTOM ACTION BAR */}
        <div className="pt-2 border-t border-slate-800 shrink-0">
          <button
            onClick={() => {
              gameAudio?.playConfirmSelect?.();
              onConfirm();
            }}
            autoFocus
            className="w-full bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-600 hover:from-emerald-500 hover:to-teal-400 text-white font-black py-3.5 px-6 rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 text-sm sm:text-base cursor-pointer active:scale-95 ring-2 ring-emerald-400/50">
            <CheckCircle2 className="w-5 h-5" />
            <span>Deposit into Nursery Inventory [E / Enter]</span>
          </button>
        </div>
      </div>
    </div>
  );
}
