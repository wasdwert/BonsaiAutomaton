import React, { useState, useEffect } from 'react';
import { X, Check, RotateCcw, Package, Sparkles } from 'lucide-react';
import {
  FeederSettings,
  DEFAULT_FEEDER_SETTINGS,
  GlobalCareDispenserLimits,
  DEFAULT_CARE_DISPENSER_LIMITS,
} from './types';
import { DeployedStructure, SanctuaryInventory } from './App';
import { gameAudio } from './utils/helper';

export interface FeederDripperSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  dispenser: DeployedStructure | null;
  inventory: SanctuaryInventory;
  globalLimits: GlobalCareDispenserLimits;
  onUpdateDispenserTiers: (dispenserId: string, allowedTiers: { S: boolean; M: boolean; L: boolean }) => void;
  onUpdateGlobalLimits: (newLimits: GlobalCareDispenserLimits) => void;
}

export default function FeederDripperSettingsModal({
  isOpen,
  onClose,
  dispenser,
  inventory: inv,
  globalLimits,
  onUpdateDispenserTiers,
  onUpdateGlobalLimits,
}: FeederDripperSettingsModalProps) {
  const isCompost = Boolean(dispenser?.type.includes('compost'));
  const machineType = dispenser?.type || 't1_compost_feeder';

  // Individual machine allowed tiers (default all false on new placement)
  const [allowedTiers, setAllowedTiers] = useState<{ S: boolean; M: boolean; L: boolean }>(() => {
    return dispenser?.feederSettings?.allowedTiers
      ? { ...dispenser.feederSettings.allowedTiers }
      : { ...DEFAULT_FEEDER_SETTINGS.allowedTiers };
  });

  // Centralized limits for all Feeders & Drippers
  const [limits, setLimits] = useState<GlobalCareDispenserLimits>(() => {
    return globalLimits ? { ...globalLimits } : { ...DEFAULT_CARE_DISPENSER_LIMITS };
  });

  const [selectedIdx, setSelectedIdx] = useState<number>(0);

  useEffect(() => {
    if (dispenser?.feederSettings?.allowedTiers) {
      setAllowedTiers({ ...dispenser.feederSettings.allowedTiers });
    } else {
      setAllowedTiers({ ...DEFAULT_FEEDER_SETTINGS.allowedTiers });
    }
  }, [dispenser]);

  useEffect(() => {
    if (globalLimits) {
      setLimits({ ...globalLimits });
    }
  }, [globalLimits]);

  const handleToggleTier = (tier: 'S' | 'M' | 'L') => {
    setAllowedTiers((prev) => {
      const next = { ...prev, [tier]: !prev[tier] };
      return next;
    });
    gameAudio?.playCrispClick?.();
  };

  const handleAdjustLimit = (key: keyof GlobalCareDispenserLimits, delta: number) => {
    setLimits((prev) => {
      const cur = prev[key] ?? 0;
      const nextVal = Math.max(0, Math.min(999, cur + delta));
      const next = { ...prev, [key]: nextVal };
      onUpdateGlobalLimits(next);
      return next;
    });
    gameAudio?.playCrispClick?.();
  };

  const handleResetLimits = () => {
    const next = { ...DEFAULT_CARE_DISPENSER_LIMITS };
    setLimits(next);
    onUpdateGlobalLimits(next);
    gameAudio?.playConfirmSelect?.();
  };

  const handleSaveAndClose = () => {
    if (dispenser) {
      onUpdateDispenserTiers(dispenser.id, allowedTiers);
    }
    onUpdateGlobalLimits(limits);
    gameAudio?.playConfirmSelect?.();
    onClose();
  };

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const step = e.shiftKey ? 5 : 1;
      const maxRows = 3 + (isCompost ? 3 : 3); // 3 toggles + 3 steppers for current type

      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        handleSaveAndClose();
      } else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        setSelectedIdx((r) => Math.max(0, r - 1));
        gameAudio?.playHoverMicroTone?.();
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        e.preventDefault();
        setSelectedIdx((r) => Math.min(maxRows - 1, r + 1));
        gameAudio?.playHoverMicroTone?.();
      } else if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        if (selectedIdx === 0) handleToggleTier('S');
        else if (selectedIdx === 1) handleToggleTier('M');
        else if (selectedIdx === 2) handleToggleTier('L');
        else handleSaveAndClose();
      } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A' || e.key === '-') {
        e.preventDefault();
        if (selectedIdx >= 3) {
          const limitIdx = selectedIdx - 3;
          const targetKey = isCompost
            ? (['compost_s', 'compost_m', 'compost_l'][limitIdx] as keyof GlobalCareDispenserLimits)
            : (['fertilizer_s', 'fertilizer_m', 'fertilizer_l'][limitIdx] as keyof GlobalCareDispenserLimits);
          if (targetKey) handleAdjustLimit(targetKey, -step);
        }
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D' || e.key === '+' || e.key === '=') {
        e.preventDefault();
        if (selectedIdx >= 3) {
          const limitIdx = selectedIdx - 3;
          const targetKey = isCompost
            ? (['compost_s', 'compost_m', 'compost_l'][limitIdx] as keyof GlobalCareDispenserLimits)
            : (['fertilizer_s', 'fertilizer_m', 'fertilizer_l'][limitIdx] as keyof GlobalCareDispenserLimits);
          if (targetKey) handleAdjustLimit(targetKey, step);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [isOpen, selectedIdx, allowedTiers, limits, isCompost]);

  if (!isOpen || !dispenser) return null;

  const machineName =
    machineType === 't1_compost_feeder'
      ? 'T1 Compost Feeder'
      : machineType === 't2_compost_feeder'
      ? 'T2 Compost Feeder'
      : machineType === 't3_compost_feeder'
      ? 'T3 Compost Feeder'
      : machineType === 't1_fertilizer_dripper'
      ? 'T1 Fertilizer Dripper'
      : machineType === 't2_fertilizer_dripper'
      ? 'T2 Fertilizer Dripper'
      : 'T3 Fertilizer Dripper';

  const kw =
    machineType === 't1_compost_feeder'
      ? 6
      : machineType === 't2_compost_feeder'
      ? 10
      : machineType === 't3_compost_feeder'
      ? 16
      : machineType === 't1_fertilizer_dripper'
      ? 7
      : machineType === 't2_fertilizer_dripper'
      ? 12
      : 18;

  const facingDesc =
    machineType.startsWith('t1_')
      ? `Facing: ${dispenser.dispenserFacing || dispenser.loaderFacing || 'UP'} (Tends 1 adjacent bonsai)`
      : machineType.startsWith('t2_')
      ? `Orientation: ${dispenser.dispenserOrientation || dispenser.orientation || 'horizontal'} (Tends 2 adjacent bonsais simultaneously)`
      : '4-Way Omni (Tends all 4 adjacent bonsais simultaneously)';

  const tiersList: Array<{ tier: 'S' | 'M' | 'L'; label: string; desc: string; stockKey: string; limitKey: keyof GlobalCareDispenserLimits; icon: string }> = isCompost
    ? [
        { tier: 'S', label: 'Compost S', desc: '+15% Growth Speed for 30s', stockKey: 'compost_s', limitKey: 'compost_s', icon: '🍂' },
        { tier: 'M', label: 'Compost M', desc: '+30% Growth Speed for 150s', stockKey: 'compost_m', limitKey: 'compost_m', icon: '🌾' },
        { tier: 'L', label: 'Compost L', desc: '+45% Growth Speed for 900s', stockKey: 'compost_l', limitKey: 'compost_l', icon: '✨' },
      ]
    : [
        { tier: 'S', label: 'Fertilizer S', desc: '+25% Hydration Growth for 90s', stockKey: 'fertilizer_s', limitKey: 'fertilizer_s', icon: '🧪' },
        { tier: 'M', label: 'Fertilizer M', desc: '+50% Hydration Growth for 600s', stockKey: 'fertilizer_m', limitKey: 'fertilizer_m', icon: '⚡' },
        { tier: 'L', label: 'Fertilizer L', desc: '+75% Hydration Growth for 3600s', stockKey: 'fertilizer_l', limitKey: 'fertilizer_l', icon: '🌟' },
      ];

  const hasAnyActiveTier = allowedTiers.S || allowedTiers.M || allowedTiers.L;

  return (
    <div className="fixed top-12 left-0 right-0 bottom-0 z-40 bg-slate-950/95 backdrop-blur-md p-3 sm:p-5 flex flex-col overflow-hidden border-t border-slate-800 text-left select-none animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-2xl shadow ${
            isCompost
              ? 'bg-gradient-to-br from-lime-900 to-slate-950 border border-lime-500/60'
              : 'bg-gradient-to-br from-cyan-900 to-slate-950 border border-cyan-500/60'
          }`}>
            {isCompost ? '🍂' : '🧪'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-100">{machineName} Settings</h2>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${
                isCompost ? 'bg-lime-950 text-lime-300 border-lime-500/60' : 'bg-cyan-950 text-cyan-300 border-cyan-500/60'
              }`}>
                ⚡ {kw} kW Draw
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {facingDesc} • Consumes ONLY 1 unit to nourish ALL tended bonsais simultaneously!
            </p>
          </div>
        </div>

        <button
          onClick={handleSaveAndClose}
          className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition-colors cursor-pointer">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto pr-1 max-w-2xl w-full mx-auto">
        {/* Warning if all untoggled */}
        {!hasAnyActiveTier && (
          <div className="bg-amber-950/70 border border-amber-500/60 p-3 rounded-2xl text-xs text-amber-200 flex items-center gap-2.5">
            <span className="text-lg">⚠️</span>
            <span>
              <strong>Machine Inactive:</strong> All tiers are currently untoggled (default on placement). Check at least one tier below to enable automatic administration!
            </span>
          </div>
        )}

        {/* Section 1: Tier Selection Toggles (Individual per machine instance) */}
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-base">{isCompost ? '🍂' : '🧪'}</span>
              <h3 className="font-bold text-sm text-slate-100">
                1. Allowed {isCompost ? 'Compost' : 'Fertilizer'} Tiers (This Machine)
              </h3>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">
              Priority: L &gt; M &gt; S
            </span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Choose which types of {isCompost ? 'compost' : 'fertilizer'} this machine is authorized to administer. If multiple tiers are checked, it <strong>always consumes the highest tier available first</strong> (L first, then M, then S last).
          </p>

          <div className="space-y-2 pt-1">
            {tiersList.map((item, idx) => {
              const isChecked = allowedTiers[item.tier];
              const isSelected = selectedIdx === idx;
              const stock = (inv as any)[item.stockKey] ?? 0;
              const reserve = limits[item.limitKey] ?? 0;
              const availableAfterReserve = Math.max(0, stock - reserve);

              return (
                <div
                  key={item.tier}
                  onClick={() => handleToggleTier(item.tier)}
                  className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-all cursor-pointer ${
                    isSelected
                      ? 'ring-2 ring-sky-400 border-sky-400 bg-slate-850 shadow-[0_0_12px_rgba(56,189,248,0.25)]'
                      : isChecked
                      ? isCompost
                        ? 'bg-lime-950/50 border-lime-500/60'
                        : 'bg-cyan-950/50 border-cyan-500/60'
                      : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                  }`}>
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-6 h-6 rounded-lg border flex items-center justify-center text-sm font-black transition-all ${
                        isChecked
                          ? isCompost
                            ? 'bg-lime-500 text-slate-950 border-lime-400 shadow-[0_0_8px_rgba(163,230,53,0.5)]'
                            : 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.5)]'
                          : 'bg-slate-900 border-slate-700 text-transparent'
                      }`}>
                      ✓
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base">{item.icon}</span>
                        <h4 className="font-bold text-xs sm:text-sm text-slate-100">{item.label}</h4>
                        <span className="text-[10px] px-2 py-0.2 rounded-full font-mono bg-slate-950 border border-slate-700 text-slate-300">
                          In Bag: <strong>{stock}</strong> (Usable: <strong>{availableAfterReserve}</strong>)
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">{item.desc}</p>
                    </div>
                  </div>

                  <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${
                    isChecked
                      ? isCompost
                        ? 'bg-lime-950 text-lime-300 border-lime-500/50'
                        : 'bg-cyan-950 text-cyan-300 border-cyan-500/50'
                      : 'bg-slate-900 text-slate-500 border-slate-800'
                  }`}>
                    {isChecked ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 2: Depletion Stock Floor / Inventory Reserve (Centralized) */}
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-base">🛡️</span>
              <h3 className="font-bold text-sm text-slate-100">
                2. Depletion Stock Floor / Inventory Reserve (Centralized)
              </h3>
            </div>
            <button
              onClick={handleResetLimits}
              className="bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 hover:border-amber-500/50 text-[11px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all cursor-pointer">
              <RotateCcw className="w-3 h-3" />
              <span>Reset to 0</span>
            </button>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            The machine will only use an item if <code>playerInventory[item] &gt; minimumReserveLimit</code>. Changing limits here automatically applies across <strong>ALL Feeders and Drippers</strong> in your sanctuary.
          </p>

          <div className="space-y-2 pt-1">
            {tiersList.map((item, idx) => {
              const rowIdx = 3 + idx;
              const isSelected = selectedIdx === rowIdx;
              const currentVal = limits[item.limitKey] ?? 0;
              const stock = (inv as any)[item.stockKey] ?? 0;

              return (
                <div
                  key={item.limitKey}
                  onClick={() => setSelectedIdx(rowIdx)}
                  className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                    isSelected
                      ? 'ring-2 ring-sky-400 border-sky-400 bg-slate-850 shadow-[0_0_12px_rgba(56,189,248,0.25)]'
                      : 'bg-slate-950/70 border-slate-800'
                  }`}>
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-xl shrink-0">{item.icon}</span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-xs sm:text-sm text-slate-100">{item.label} Floor</h4>
                        <span className="text-[10px] px-2 py-0.2 rounded-full font-mono bg-slate-950 border border-slate-700 text-slate-400">
                          Stock: {stock}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        {stock > currentVal ? (
                          <span className="text-emerald-400">Active: {stock - currentVal} units available for feeding</span>
                        ) : (
                          <span className="text-amber-400">Protected: At or below reserve ({stock} &le; {currentVal})</span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Stepper Controls */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAdjustLimit(item.limitKey, -5);
                      }}
                      className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono font-bold text-xs border border-slate-700 flex items-center justify-center cursor-pointer active:scale-95">
                      -5
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAdjustLimit(item.limitKey, -1);
                      }}
                      className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold text-base border border-slate-700 flex items-center justify-center cursor-pointer active:scale-95">
                      -
                    </button>
                    <div className="w-14 text-center font-mono font-black text-sm sm:text-base text-amber-300 bg-slate-950 px-2 py-1 rounded-xl border border-slate-800">
                      {currentVal}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAdjustLimit(item.limitKey, 1);
                      }}
                      className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold text-base border border-slate-700 flex items-center justify-center cursor-pointer active:scale-95">
                      +
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAdjustLimit(item.limitKey, 5);
                      }}
                      className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono font-bold text-xs border border-slate-700 flex items-center justify-center cursor-pointer active:scale-95">
                      +5
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-2.5 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 shrink-0 max-w-2xl w-full mx-auto">
        <span className="font-mono text-sky-400 text-[11px] hidden sm:inline">
          🎮 [W/S / ↑↓] Select • [Space / Enter] Toggle • [A/D / ←→] Adjust • [Esc / B] Save &amp; Close
        </span>

        <button
          onClick={handleSaveAndClose}
          className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-all shadow flex items-center gap-1.5 cursor-pointer active:scale-95">
          <Check className="w-4 h-4" />
          <span>Save &amp; Close [Esc / B]</span>
        </button>
      </div>
    </div>
  );
}
