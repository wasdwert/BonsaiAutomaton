import React from 'react';
import { Sparkles, Trophy, Sprout, Clock, ArrowRight, Package, Check, X } from 'lucide-react';
import { OfflineSummary } from './saveManager';
import { VerdureIcon } from './App';

interface OfflineReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  summary: OfflineSummary | null;
}

export default function OfflineReportModal({
  isOpen,
  onClose,
  summary,
}: OfflineReportModalProps) {
  if (!isOpen || !summary) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm select-none animate-in fade-in duration-200">
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg bg-slate-900 border-2 border-emerald-500 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col text-left text-white max-h-[90vh] overflow-hidden">
        
        {/* Luminous Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-950 border border-emerald-400/60 flex items-center justify-center text-2xl shadow-[0_0_15px_rgba(16,185,129,0.3)]">
              🌿
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-emerald-400 flex items-center gap-2">
                <span>Sanctuary Catch-Up</span>
                <Sparkles className="w-5 h-5 text-emerald-300 animate-pulse" />
              </h2>
              <div className="flex items-center gap-1.5 text-xs text-slate-300 font-medium">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>You were away for </span>
                <strong className="text-amber-300 font-bold">{summary.timeAwayFormatted}</strong>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-slate-200 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Summary Body */}
        <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 text-xs sm:text-sm">
          {/* Welcome Message Card */}
          <div className="bg-gradient-to-r from-emerald-950/70 via-slate-900 to-slate-950 p-3.5 rounded-2xl border border-emerald-500/30 text-xs text-emerald-200 leading-relaxed shadow-sm">
            Welcome back to your sanctuary! While you were offline, your automated sprinklers, irrigation lines, and care machinery nurtured your bonsai collection and processed garden resources without interruption.
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
            <div className="bg-slate-950/80 p-2.5 rounded-xl border border-emerald-500/40 shadow-sm">
              <span className="text-slate-400 text-[10px] block uppercase font-bold tracking-wider">Levels Gained</span>
              <strong className="text-emerald-300 text-base font-black font-mono">+{summary.levelsGained}</strong>
              <span className="text-[10px] text-slate-500 block">across {summary.bonsaisGrown} trees</span>
            </div>

            <div className="bg-slate-950/80 p-2.5 rounded-xl border border-sky-500/40 shadow-sm">
              <span className="text-slate-400 text-[10px] block uppercase font-bold tracking-wider">Player XP</span>
              <strong className="text-sky-300 text-base font-black font-mono">+{summary.playerXPGained}</strong>
              <span className="text-[10px] text-slate-500 block">
                {summary.playerLevelUps > 0 ? `+${summary.playerLevelUps} Lv. Up!` : 'Progress gained'}
              </span>
            </div>

            <div className="bg-slate-950/80 p-2.5 rounded-xl border border-pink-500/40 shadow-sm">
              <span className="text-slate-400 text-[10px] block uppercase font-bold tracking-wider">Zen Points</span>
              <strong className="text-pink-300 text-base font-black font-mono">+{summary.zenPointsGained}</strong>
              <span className="text-[10px] text-slate-500 block">🌸 Points Earned</span>
            </div>

            <div className="bg-slate-950/80 p-2.5 rounded-xl border border-amber-500/40 shadow-sm">
              <span className="text-slate-400 text-[10px] block uppercase font-bold tracking-wider">Organic Waste</span>
              <strong className="text-amber-300 text-base font-black font-mono">+{summary.organicWasteProduced}</strong>
              <span className="text-[10px] text-slate-500 block">🍂 Harvested</span>
            </div>
          </div>

          {/* Production & Automation Output */}
          {(summary.compostProduced > 0 || summary.fertilizerProduced > 0 || Object.keys(summary.itemsConsumed).length > 0) && (
            <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 space-y-2">
              <h4 className="font-bold text-xs text-slate-300 flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-cyan-400" />
                <span>Automation Output &amp; Feeding:</span>
              </h4>
              <div className="flex flex-wrap gap-2 text-xs">
                {summary.compostProduced > 0 && (
                  <span className="bg-lime-950/80 text-lime-300 border border-lime-500/40 px-2.5 py-1 rounded-lg font-bold flex items-center gap-1">
                    <span>🌾</span>
                    <span>+{summary.compostProduced} Compost Refined</span>
                  </span>
                )}
                {summary.fertilizerProduced > 0 && (
                  <span className="bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 px-2.5 py-1 rounded-lg font-bold flex items-center gap-1">
                    <span>🧪</span>
                    <span>+{summary.fertilizerProduced} Fertilizer Synthesized</span>
                  </span>
                )}
                {Object.entries(summary.itemsConsumed).map(([res, count]) => (
                  <span key={res} className="bg-slate-900 text-slate-400 border border-slate-700 px-2.5 py-1 rounded-lg font-medium text-[11px]">
                    -{count} {res.replace('_', ' ')} used
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Bonsais That Gained Growth Details */}
          {summary.bonsaiDetails.length > 0 ? (
            <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 space-y-2">
              <h4 className="font-bold text-xs text-slate-300 flex items-center gap-1.5">
                <Sprout className="w-3.5 h-3.5 text-emerald-400" />
                <span>Bonsai Growth Milestones ({summary.bonsaiDetails.length} Trees Leveled Up):</span>
              </h4>
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {summary.bonsaiDetails.map((b, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between bg-slate-900/90 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
                    <span className="font-bold text-slate-200">{b.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 line-through text-[11px]">Lv.{b.oldLevel}</span>
                      <ArrowRight className="w-3 h-3 text-emerald-400" />
                      <span className="font-black text-emerald-300">Lv.{b.newLevel}</span>
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950 px-1.5 py-0.2 rounded border border-emerald-500/30">
                        +{b.levelsGained}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-slate-950/50 p-3.5 rounded-2xl border border-slate-800 text-center text-xs text-slate-400">
              No trees were ready for level-ups yet, but their hydration and growth progress advanced smoothly!
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="pt-3 border-t border-slate-800 shrink-0 mt-3">
          <button
            onClick={onClose}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-3 rounded-2xl transition-all shadow-xl flex items-center justify-center gap-2 text-sm cursor-pointer active:scale-98">
            <Check className="w-5 h-5" />
            <span>Continue to Sanctuary</span>
          </button>
        </div>
      </div>
    </div>
  );
}
