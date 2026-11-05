import React, { useState, useEffect } from 'react';
import { X, Wrench, Shield, Check, RotateCcw, ChevronLeft, ChevronRight, Sliders, ArrowUpRight, ArrowDownRight, Package } from 'lucide-react';
import { AutoUnloaderSettings, DEFAULT_AUTO_UNLOADER_SETTINGS } from './types';
import { DeployedStructure, SanctuaryInventory } from './App';
import { gameAudio } from './utils/helper';

export interface AutoUnloaderSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  loader: DeployedStructure | null;
  inventory: SanctuaryInventory;
  globalSettings?: AutoUnloaderSettings;
  onUpdateSettings: (loaderId: string, newSettings: AutoUnloaderSettings) => void;
}

interface BufferItemDef {
  key: string;
  name: string;
  icon: string;
  desc: string;
  invKey: string;
}

const BUFFER_ITEMS: BufferItemDef[] = [
  { key: 'organic_waste', name: 'Organic Waste', icon: '🍂', desc: 'Raw clippings from bonsai level-ups', invKey: 'organic_waste' },
  { key: 'biochemicals', name: 'Biochemical', icon: '🧪', desc: 'Catalyst reagent for fertilizer distillation', invKey: 'biochemicals' },
  { key: 'condensed_organic_material', name: 'Condensed Organic Material', icon: '🧱', desc: 'Refined substrate block', invKey: 'condensed_organic_material' },
  { key: 'compost_s', name: 'Compost S', icon: '🍂', desc: 'Starter compost (+15% growth)', invKey: 'compost_s' },
  { key: 'compost_m', name: 'Compost M', icon: '🌾', desc: 'Enriched compost (+30% growth)', invKey: 'compost_m' },
  { key: 'fertilizer_s', name: 'Fertilizer S', icon: '🧪', desc: 'Starter fertilizer (+25% hydration)', invKey: 'fertilizer_s' },
  { key: 'fertilizer_m', name: 'Fertilizer M', icon: '⚡', desc: 'Pressurized fertilizer (+50% hydration)', invKey: 'fertilizer_m' },
];

const TARGET_ITEMS: BufferItemDef[] = [
  { key: 'compost_s', name: 'Compost S', icon: '🍂', desc: 'Starter compost (+15% growth for 30s)', invKey: 'compost_s' },
  { key: 'compost_m', name: 'Compost M', icon: '🌾', desc: 'Enriched compost (+30% growth for 150s)', invKey: 'compost_m' },
  { key: 'compost_l', name: 'Compost L', icon: '✨', desc: 'Master loam compost (+45% growth for 900s)', invKey: 'compost_l' },
  { key: 'condensed_organic_material', name: 'Condensed Organic Material', icon: '🧱', desc: 'Refined substrate block', invKey: 'condensed_organic_material' },
  { key: 'fertilizer_s', name: 'Fertilizer S', icon: '🧪', desc: 'Starter fertilizer (+25% hydration for 90s)', invKey: 'fertilizer_s' },
  { key: 'fertilizer_m', name: 'Fertilizer M', icon: '⚡', desc: 'Pressurized fertilizer (+50% hydration for 600s)', invKey: 'fertilizer_m' },
  { key: 'fertilizer_l', name: 'Fertilizer L', icon: '🌟', desc: 'Master fertilizer (+75% hydration for 3600s)', invKey: 'fertilizer_l' },
  { key: 'speed_grow_xs', name: 'Speed Grow XS', icon: '⚡', desc: '+30s Instant Growth', invKey: 'speed_grow_xs' },
  { key: 'speed_grow_s', name: 'Speed Grow S', icon: '⚡', desc: '+120s Instant Growth', invKey: 'speed_grow_s' },
  { key: 'speed_grow_m', name: 'Speed Grow M', icon: '⚡', desc: '+600s Instant Growth', invKey: 'speed_grow_m' },
  { key: 'speed_grow_l', name: 'Speed Grow L', icon: '✨', desc: '+3,600s Instant Growth', invKey: 'speed_grow_l' },
  { key: 'speed_grow_xl', name: 'Speed Grow XL', icon: '🌟', desc: '+28,800s Instant Growth', invKey: 'speed_grow_xl' },
  { key: 'biochemicals', name: 'Biochemical', icon: '🧪', desc: 'Catalyst reagent', invKey: 'biochemicals' },
];

export default function AutoUnloaderSettingsModal({
  isOpen,
  onClose,
  loader,
  inventory: inv,
  globalSettings,
  onUpdateSettings,
}: AutoUnloaderSettingsModalProps) {
  const [activeTab, setActiveTab] = useState<'buffer' | 'target'>('buffer');
  const [selectedRow, setSelectedRow] = useState<number>(0);
  const [settings, setSettings] = useState<AutoUnloaderSettings>(() => {
    return loader?.loaderSettings
      ? JSON.parse(JSON.stringify(loader.loaderSettings))
      : globalSettings
      ? JSON.parse(JSON.stringify(globalSettings))
      : JSON.parse(JSON.stringify(DEFAULT_AUTO_UNLOADER_SETTINGS));
  });

  useEffect(() => {
    if (loader?.loaderSettings) {
      setSettings(JSON.parse(JSON.stringify(loader.loaderSettings)));
    } else if (globalSettings) {
      setSettings(JSON.parse(JSON.stringify(globalSettings)));
    } else {
      setSettings(JSON.parse(JSON.stringify(DEFAULT_AUTO_UNLOADER_SETTINGS)));
    }
  }, [loader, globalSettings]);

  useEffect(() => {
    setSelectedRow(0);
  }, [activeTab]);

  const currentList = activeTab === 'buffer' ? BUFFER_ITEMS : TARGET_ITEMS;

  const handleAdjustValue = (key: string, delta: number) => {
    setSettings((prev) => {
      const next = {
        minimumToKeep: { ...prev.minimumToKeep },
        targetAmount: { ...prev.targetAmount },
      };
      if (activeTab === 'buffer') {
        const cur = next.minimumToKeep[key] ?? 0;
        next.minimumToKeep[key] = Math.max(0, Math.min(999, cur + delta));
      } else {
        const cur = next.targetAmount[key] ?? 10;
        next.targetAmount[key] = Math.max(0, Math.min(999, cur + delta));
      }
      return next;
    });
    gameAudio?.playCrispClick?.();
  };

  const handleResetDefaults = () => {
    setSettings(JSON.parse(JSON.stringify(DEFAULT_AUTO_UNLOADER_SETTINGS)));
    gameAudio?.playConfirmSelect?.();
  };

  const handleSaveAndClose = () => {
    if (loader) {
      onUpdateSettings(loader.id, settings);
    }
    gameAudio?.playConfirmSelect?.();
    onClose();
  };

  // Keyboard navigation & gamepad support
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const step = e.shiftKey ? 5 : 1;

      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        handleSaveAndClose();
      } else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        setSelectedRow((r) => Math.max(0, r - 1));
        gameAudio?.playHoverMicroTone?.();
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        e.preventDefault();
        setSelectedRow((r) => Math.min(currentList.length - 1, r + 1));
        gameAudio?.playHoverMicroTone?.();
      } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A' || e.key === '-') {
        e.preventDefault();
        const curItem = currentList[selectedRow];
        if (curItem) handleAdjustValue(curItem.key, -step);
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D' || e.key === '+' || e.key === '=') {
        e.preventDefault();
        const curItem = currentList[selectedRow];
        if (curItem) handleAdjustValue(curItem.key, step);
      } else if (e.key === 'Tab') {
        e.preventDefault();
        setActiveTab((t) => (t === 'buffer' ? 'target' : 'buffer'));
        gameAudio?.playCrispClick?.();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        handleSaveAndClose();
      }
    };

    const handleBumper = (e: Event) => {
      const ce = e as CustomEvent<{ direction: 'left' | 'right' }>;
      const curItem = currentList[selectedRow];
      if (curItem) {
        handleAdjustValue(curItem.key, ce.detail?.direction === 'left' ? -5 : 5);
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('gamepad-bumper', handleBumper);
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('gamepad-bumper', handleBumper);
    };
  }, [isOpen, selectedRow, currentList, activeTab, settings, loader]);

  if (!isOpen) return null;

  return (
    <div className="fixed top-12 left-0 right-0 bottom-0 z-40 bg-slate-950/95 backdrop-blur-md p-3 sm:p-5 flex flex-col overflow-hidden border-t border-slate-800 text-left select-none">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-900 to-slate-950 border border-indigo-500/60 flex items-center justify-center text-2xl shadow">
            🦾
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-100">Auto (Un-)Loader Settings</h2>
              <span className="bg-sky-950 text-sky-300 border border-sky-500/60 text-xs px-2.5 py-0.5 rounded-full font-bold">
                Facing: {loader?.loaderFacing || 'UP'}
              </span>
              <span className="bg-emerald-950 text-emerald-300 border border-emerald-500/60 text-xs px-2.5 py-0.5 rounded-full font-bold">
                ⚡ 2 kW Draw
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Configure inventory minimum reserve buffers and production ceiling targets (centralized across all Auto (Un-)Loaders)
            </p>
          </div>
        </div>

        <button
          onClick={handleSaveAndClose}
          className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition-colors cursor-pointer">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-2 gap-2 mb-3 shrink-0 max-w-2xl w-full mx-auto">
        <button
          onClick={() => {
            setActiveTab('buffer');
            gameAudio?.playCrispClick?.();
          }}
          className={`py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all shadow cursor-pointer ${
            activeTab === 'buffer'
              ? 'bg-amber-600 text-white ring-2 ring-amber-400/40'
              : 'bg-slate-800 text-slate-400 hover:bg-slate-750'
          }`}>
          <ArrowDownRight className="w-4 h-4 text-amber-300" />
          <span>Keep in Inventory (Minimum Buffer)</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('target');
            gameAudio?.playCrispClick?.();
          }}
          className={`py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all shadow cursor-pointer ${
            activeTab === 'target'
              ? 'bg-emerald-600 text-white ring-2 ring-emerald-400/40'
              : 'bg-slate-800 text-slate-400 hover:bg-slate-750'
          }`}>
          <ArrowUpRight className="w-4 h-4 text-emerald-300" />
          <span>Produce Target (Maximum Ceiling)</span>
        </button>
      </div>

      {/* Explanatory Banner */}
      <div className="bg-slate-900/80 border border-slate-800 p-2.5 rounded-xl mb-3 text-xs text-slate-300 shrink-0 max-w-2xl w-full mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-base shrink-0">{activeTab === 'buffer' ? '🛡️' : '🎯'}</span>
          <span className="truncate">
            {activeTab === 'buffer'
              ? 'Only deposit into machines if your personal inventory exceeds this reserve threshold.'
              : 'Stop depositing recipe ingredients when your personal inventory reaches this target ceiling.'}
          </span>
        </div>
        <button
          onClick={handleResetDefaults}
          className="bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 hover:border-amber-500/50 text-[11px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 shrink-0 transition-all cursor-pointer">
          <RotateCcw className="w-3 h-3" />
          <span>Defaults</span>
        </button>
      </div>

      {/* Item List */}
      <div className="flex-1 space-y-2 overflow-y-auto pr-1 max-w-2xl w-full mx-auto">
        {currentList.map((item, idx) => {
          const isSelected = selectedRow === idx;
          const currentVal =
            activeTab === 'buffer'
              ? settings.minimumToKeep[item.key] ?? 0
              : settings.targetAmount[item.key] ?? 10;
          const playerStock = (inv as any)[item.invKey] ?? (inv.resources as any)?.[item.invKey] ?? 0;

          return (
            <div
              key={item.key}
              onClick={() => setSelectedRow(idx)}
              className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                isSelected
                  ? 'bg-slate-850 border-sky-400 ring-2 ring-sky-400/50 shadow-[0_0_15px_rgba(56,189,248,0.25)]'
                  : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
              }`}>
              {/* Item Info */}
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-2xl shrink-0">{item.icon}</span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-bold text-xs sm:text-sm text-slate-100 truncate">{item.name}</h4>
                    <span className="text-[10px] px-2 py-0.2 rounded-full font-mono bg-slate-950 border border-slate-700 text-slate-300">
                      In Bag: <strong>{playerStock}</strong>
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate">{item.desc}</p>
                </div>
              </div>

              {/* Adjuster Stepper */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAdjustValue(item.key, -5);
                  }}
                  title="-5"
                  className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono font-bold text-xs border border-slate-700 flex items-center justify-center cursor-pointer active:scale-95">
                  -5
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAdjustValue(item.key, -1);
                  }}
                  title="-1"
                  className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold text-base border border-slate-700 flex items-center justify-center cursor-pointer active:scale-95">
                  -
                </button>

                <div className="w-14 text-center font-mono font-black text-sm sm:text-base text-amber-300 bg-slate-950 px-2 py-1 rounded-xl border border-slate-800">
                  {currentVal}
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAdjustValue(item.key, 1);
                  }}
                  title="+1"
                  className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold text-base border border-slate-700 flex items-center justify-center cursor-pointer active:scale-95">
                  +
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAdjustValue(item.key, 5);
                  }}
                  title="+5"
                  className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono font-bold text-xs border border-slate-700 flex items-center justify-center cursor-pointer active:scale-95">
                  +5
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="pt-2.5 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 shrink-0 max-w-2xl w-full mx-auto">
        <span className="font-mono text-sky-400 text-[11px] hidden sm:inline">
          🎮 [W/S / ↑↓] Select • [A/D / ←→] -/+ (Shift: 5) • [Tab] Toggle Tab • [Esc / B / Enter] Save &amp; Close
        </span>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSaveAndClose}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-all shadow flex items-center gap-1.5 cursor-pointer active:scale-95">
            <Check className="w-4 h-4" />
            <span>Save &amp; Close [Esc / B]</span>
          </button>
        </div>
      </div>
    </div>
  );
}
