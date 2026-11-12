import React from 'react';
import {
  X,
  Truck,
  Wrench,
  Trees,
  Mountain,
  Flower2,
  ChevronRight,
  Lock,
  Sprout,
  Award,
  Package,
} from 'lucide-react';
import {
  ExpeditionBiomeId,
  SanctuaryInventory,
  AreaDiscoveryState,
  ROVER_MODULE_CONFIGS,
  BIOME_CODEX_SPECIES,
  getExpeditionBiomeDef,
  getRoverChassisName,
  getRoverChassisMaxSlots,
  getMaxAllowedStepsForArea,
  getAvailableCodexMaturities,
  getAvailableCodexResources,
} from './App';
import { RoverModuleType } from './types';
import { getMaturityDef } from './bonsaiData';
import { gameAudio } from './utils/helper';

export interface RoverModalProps {
  isOpen: boolean;
  onClose: () => void;
  inventory: SanctuaryInventory;
  areaDiscovery: AreaDiscoveryState;
  garageTab: 'expeditions' | 'loadout';
  setGarageTab: (tab: 'expeditions' | 'loadout') => void;
  focusedGarageIdx: number;
  setFocusedGarageIdx?: (idx: number) => void;
  onStartBiomeExcursion: (biomeId: ExpeditionBiomeId) => void;
  onAttachRoverModule: (modKey: RoverModuleType) => void;
  onDetachRoverModule: (slotIdx: number) => void;
  maxRoverBattery: number;
  maxRoverCargo: number;
  roverVisionRadius: number;
  roverPowerDrain: number;
  CodexSeedlingBox: React.ComponentType<{ leafType: any; discovered: boolean }>;
  CodexMaturityBox: React.ComponentType<{ matDef: any; discovered: boolean }>;
  CodexResourceBox: React.ComponentType<{ resKey: any; discovered: boolean }>;
}

export default function RoverModal({
  isOpen,
  onClose,
  inventory,
  areaDiscovery,
  garageTab,
  setGarageTab,
  focusedGarageIdx,
  onStartBiomeExcursion,
  onAttachRoverModule,
  onDetachRoverModule,
  maxRoverBattery,
  maxRoverCargo,
  roverVisionRadius,
  roverPowerDrain,
  CodexSeedlingBox,
  CodexMaturityBox,
  CodexResourceBox,
}: RoverModalProps) {
  if (!isOpen) return null;

  const inv = inventory;
  const chassisTier = inv.rover_chassis_tier || 1;
  const maxSlots = getRoverChassisMaxSlots(chassisTier);
  const attached = inv.attached_rover_modules || [];
  const effBattery = maxRoverBattery;
  const effCargo = maxRoverCargo;
  const effVision = roverVisionRadius;

  const ALL_ROVER_MODULE_KEYS: RoverModuleType[] = [
    'storage_1',
    'storage_2',
    'storage_3',
    'battery_1',
    'battery_2',
    'battery_3',
    'radar_1',
    'radar_2',
    'radar_3',
  ];
  const totalUnattached = ALL_ROVER_MODULE_KEYS.reduce(
    (acc, k) => acc + (inv.rover_modules[k] || 0),
    0,
  );

  return (
    <div className="fixed top-12 left-0 right-0 bottom-0 z-40 bg-slate-950/95 backdrop-blur-md p-3 sm:p-5 flex flex-col overflow-hidden border-t border-slate-800 text-left">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-3 shrink-0">
        <div className="flex items-center gap-3">
          <Truck className="w-6 h-6 text-cyan-400" />
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-xl font-bold text-cyan-100">Rover Garage Bay</h2>
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-cyan-900/60 border border-cyan-500/30 text-cyan-300">
              Tier {chassisTier}: {getRoverChassisName(chassisTier)}
            </span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Top-Level Tabs Switcher */}
      <div className="grid grid-cols-2 gap-2 mb-3 shrink-0">
        <button
          onClick={() => {
            setGarageTab('expeditions');
            gameAudio?.playCrispClick?.();
          }}
          className={`py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all shadow ${
            garageTab === 'expeditions'
              ? 'bg-amber-600 text-white ring-2 ring-amber-400/40'
              : 'bg-slate-800 text-slate-400 hover:bg-slate-750'
          }`}>
          <Truck className="w-4 h-4" />
          <span>🚜 Expeditions</span>
          <span className="text-[10px] bg-slate-950/60 px-1.5 py-0.5 rounded-full font-mono text-amber-300">
            3 Regions
          </span>
        </button>

        <button
          onClick={() => {
            setGarageTab('loadout');
            gameAudio?.playCrispClick?.();
          }}
          className={`py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all shadow ${
            garageTab === 'loadout'
              ? 'bg-sky-600 text-white ring-2 ring-sky-400/40'
              : 'bg-slate-800 text-slate-400 hover:bg-slate-750'
          }`}>
          <Wrench className="w-4 h-4" />
          <span>⚙️ Rover Loadout</span>
          <span className="text-[10px] bg-slate-950/60 px-1.5 py-0.5 rounded-full font-mono text-sky-300">
            {attached.length} / {maxSlots} Slots
          </span>
        </button>
      </div>

      {/* TAB 1: EXPEDITIONS DEPARTURE & CODEX */}
      {garageTab === 'expeditions' && (
        <div className="flex-1 space-y-3 mb-3 overflow-y-auto pr-1">
          {(['FOOTHILLS', 'HIGHLANDS', 'OVERGROWTH'] as ExpeditionBiomeId[]).map((biomeId, bIdx) => {
            const b = getExpeditionBiomeDef(biomeId);
            const reqKey = b.requiredMapKey;
            const isUnlocked = b.unlockedByDefault || (reqKey ? inv[reqKey] : false);
            const isFocused = focusedGarageIdx === bIdx;
            const maxAllowedSteps = getMaxAllowedStepsForArea(biomeId, inv);
            const availableMaturities = getAvailableCodexMaturities(biomeId, maxAllowedSteps);
            const availableResources = getAvailableCodexResources(biomeId, maxAllowedSteps);

            return (
              <div
                key={biomeId}
                style={{ borderColor: isFocused ? '#38bdf8' : isUnlocked ? b.accentColor : '#334155' }}
                className={`p-3.5 sm:p-4 rounded-2xl border-2 transition-all ${
                  isFocused
                    ? 'bg-slate-850 ring-4 ring-sky-400 shadow-[0_0_20px_rgba(56,189,248,0.5)] scale-[1.01]'
                    : isUnlocked
                    ? 'bg-slate-900/90 hover:bg-slate-850'
                    : 'bg-slate-900/50 opacity-80'
                }`}>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2.5">
                    <div
                      style={{ backgroundColor: isUnlocked ? b.themeColor : '#334155' }}
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shrink-0 shadow">
                      {biomeId === 'FOOTHILLS' ? (
                        <Trees className="w-5 h-5" />
                      ) : biomeId === 'HIGHLANDS' ? (
                        <Mountain className="w-5 h-5" />
                      ) : (
                        <Flower2 className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-sm sm:text-base text-slate-100 flex items-center gap-1.5">
                          {isFocused && <span className="text-sky-400 text-xs">► [E/A]</span>}
                          <span>{b.name}</span>
                        </h4>
                        <span
                          style={{ backgroundColor: `${b.themeColor}25`, color: b.accentColor }}
                          className="text-[10px] font-bold px-2 py-0.5 rounded-full border border-current">
                          ⚡ {b.batteryCostPerStep} kWh / Step
                        </span>
                        {/* Prominent Current Expedition Distance Range Pill */}
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full border font-mono bg-sky-950/80 text-sky-300 border-sky-500/50 shadow-sm">
                          🧭 Range: Up to {maxAllowedSteps} Steps
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400">{b.subtitle}</span>
                    </div>
                  </div>

                  {isUnlocked ? (
                    <button
                      onClick={() => onStartBiomeExcursion(biomeId)}
                      style={{ backgroundColor: b.themeColor }}
                      className={`hover:opacity-90 text-white font-bold text-xs px-4 py-2 rounded-xl shadow transition-transform active:scale-95 flex items-center gap-1 shrink-0 cursor-pointer ${
                        isFocused ? 'ring-2 ring-white scale-105' : ''
                      }`}>
                      <span>Depart Rover [E/A]</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <div className="flex items-center gap-1.5 bg-slate-800/90 text-amber-300 px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 border border-slate-700">
                      <Lock className="w-3.5 h-3.5 text-amber-400" />
                      <span>Locked</span>
                    </div>
                  )}
                </div>

                <p className="text-xs text-slate-300 mb-2.5">{b.description}</p>

                {/* ROVER GARAGE DISCOVERY CODEX ("FOG-OF-WAR" AREA EXPLORATION GRID) */}
                <div className="bg-slate-950/80 border border-slate-800/90 rounded-2xl p-3 space-y-2.5 mb-2">
                  {/* Row 1: Bonsai Species (Seedling Foliage Preview) */}
                  <div>
                    <div className="text-[10px] font-bold text-emerald-400/90 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                      <Sprout className="w-3 h-3 text-emerald-400" />
                      <span>Bonsai Species</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {(BIOME_CODEX_SPECIES[biomeId] || []).map((leafType) => (
                        <CodexSeedlingBox
                          key={leafType}
                          leafType={leafType}
                          discovered={(areaDiscovery.species[biomeId] || []).includes(leafType)}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Row 2: Dynamic Maturity Ratings (Kanji Characters) based on unlocked step range */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="text-[10px] font-bold text-amber-400/90 uppercase tracking-wider flex items-center gap-1">
                        <Award className="w-3 h-3 text-amber-400" />
                        <span>Maturity Ratings ({availableMaturities.length} Tiers at {maxAllowedSteps} Steps)</span>
                      </div>
                      <span className="text-[9.5px] text-slate-500 font-mono">
                        Range: ≤ {maxAllowedSteps} Steps
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {availableMaturities.map((matTier) => (
                        <CodexMaturityBox
                          key={matTier}
                          matDef={getMaturityDef(matTier)}
                          discovered={(areaDiscovery.maturities[biomeId] || []).includes(matTier)}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Row 3: Dynamic Expedition Resources based on unlocked step range */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="text-[10px] font-bold text-sky-400/90 uppercase tracking-wider flex items-center gap-1">
                        <Package className="w-3 h-3 text-sky-400" />
                        <span>Expedition Resources ({availableResources.length} Types at {maxAllowedSteps} Steps)</span>
                      </div>
                      <span className="text-[9.5px] text-slate-500 font-mono">
                        Range: ≤ {maxAllowedSteps} Steps
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {availableResources.map((resKey) => (
                        <CodexResourceBox
                          key={resKey}
                          resKey={resKey}
                          discovered={(areaDiscovery.resources[biomeId] || []).includes(resKey)}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {!isUnlocked && (
                  <div className="mt-2 text-xs font-semibold text-amber-400 flex items-center gap-2 bg-amber-950/40 p-2 rounded-xl border border-amber-500/30">
                    <Lock className="w-3.5 h-3.5 shrink-0" />
                    <span>Locked: Purchase map at the Botanical Market ({b.mapCost} Verdure)</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: ROVER LOADOUT (CHASSIS & MODULAR OUTFITTING) */}
      {garageTab === 'loadout' && (
        <div className="flex-1 space-y-3 mb-3 overflow-y-auto pr-1">
          {/* 1. Interactive Chassis Overview Card */}
          <div className="bg-slate-900/90 border border-sky-500/40 p-4 rounded-2xl shadow-lg space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-900 to-indigo-950 border-2 border-sky-400/60 flex items-center justify-center text-2xl shadow">
                  {chassisTier === 3 ? '👑' : chassisTier === 2 ? '🚜' : '🚙'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="bg-sky-950 text-sky-300 border border-sky-500/60 text-xs px-2.5 py-0.5 rounded-full font-black">
                      Tier {chassisTier}
                    </span>
                    <h4 className="text-base sm:text-lg font-black text-slate-100">
                      {getRoverChassisName(chassisTier)}
                    </h4>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {chassisTier === 3
                      ? 'Vanguard Heavy Chassis: 10 upgrade slots for extended wilderness operations.'
                      : chassisTier === 2
                      ? 'Surveyor Chassis: 5 upgrade slots with reinforced load brackets.'
                      : 'Scout Chassis: 3 upgrade slots. Upgrade at Workbench for more module capacity.'}
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="text-xs text-slate-400 font-semibold">Chassis Module Slots</div>
                <div className="text-lg font-black text-sky-300 font-mono">
                  {attached.length} / {maxSlots} Slots Used
                </div>
              </div>
            </div>

            {/* Telemetry Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 pt-2 border-t border-slate-800 text-xs">
              <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Max Battery:</span>
                <strong className="text-amber-300 text-sm font-mono">{effBattery} kWh</strong>
                <span className="text-[10px] text-slate-500 block">Base 50 + {effBattery - 50} kWh</span>
              </div>

              <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Max Cargo Payload:</span>
                <strong className="text-emerald-300 text-sm font-mono">{effCargo} kg</strong>
                <span className="text-[10px] text-slate-500 block">Base 15.0 + {(effCargo - 15.0).toFixed(1)} kg</span>
              </div>

              <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Radar Vision:</span>
                <strong className="text-sky-300 text-sm font-mono">{effVision} Steps</strong>
                <span className="text-[10px] text-slate-500 block">Base 2 + {effVision - 2} Steps</span>
              </div>

              <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Grid Power Draw:</span>
                <strong className="text-amber-400 text-sm font-mono">{roverPowerDrain} kW</strong>
                <span className="text-[10px] text-slate-500 block">Rover Modules Load</span>
              </div>

              <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Attached Modules:</span>
                <strong className="text-sky-300 text-sm font-mono">{attached.length} Installed</strong>
                <span className="text-[10px] text-slate-500 block">{maxSlots - attached.length} Free Bays</span>
              </div>

              <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Unattached Storage:</span>
                <strong className="text-slate-200 text-sm font-mono">{totalUnattached} in Bag</strong>
                <span className="text-[10px] text-slate-500 block">Spare Modules</span>
              </div>
            </div>
          </div>

          {/* 2. Visual Grid of Chassis Module Slots (10 Total Visualized) */}
          <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 font-bold text-slate-200">
                <span>⚙️ Chassis Module Bays (Slots 1 - 10)</span>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                Active: {maxSlots} Slots • {10 - maxSlots > 0 ? `${10 - maxSlots} Locked` : 'All Unlocked'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {Array.from({ length: 10 }).map((_, slotIdx) => {
                const isSlotActive = slotIdx < maxSlots;
                const equippedMod = isSlotActive ? attached[slotIdx] : null;
                const modCfg = equippedMod ? ROVER_MODULE_CONFIGS[equippedMod] : null;

                if (!isSlotActive) {
                  return (
                    <div
                      key={slotIdx}
                      className="bg-slate-950/60 border border-dashed border-slate-800 p-2.5 rounded-xl flex flex-col items-center justify-center text-center gap-1 opacity-60">
                      <Lock className="w-4 h-4 text-slate-600" />
                      <span className="text-[10px] font-bold text-slate-500 font-mono">
                        Bay {slotIdx + 1}
                      </span>
                      <span className="text-[9px] text-amber-400/80 font-semibold line-clamp-1">
                        {slotIdx < 5 ? 'T2 Chassis' : 'T3 Chassis'}
                      </span>
                    </div>
                  );
                }

                if (equippedMod && modCfg) {
                  return (
                    <div
                      key={slotIdx}
                      className="bg-slate-950 border border-sky-500/60 p-2.5 rounded-xl flex flex-col justify-between gap-1 shadow-md">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold text-sky-400">
                          Bay {slotIdx + 1}
                        </span>
                        <span className="text-sm">{modCfg.icon}</span>
                      </div>
                      <div className="my-0.5">
                        <div className="text-[11px] font-bold text-slate-100 truncate">
                          {modCfg.name}
                        </div>
                        <div className={`text-[10px] font-bold ${
                          modCfg.category === 'battery'
                            ? 'text-amber-300'
                            : modCfg.category === 'radar'
                            ? 'text-sky-300'
                            : 'text-emerald-300'
                        }`}>
                          {modCfg.bonusLabel} • ⚡ {modCfg.kw} kW
                        </div>
                      </div>
                      <button
                        onClick={() => onDetachRoverModule(slotIdx)}
                        className="w-full bg-slate-800 hover:bg-red-950 text-slate-300 hover:text-red-300 border border-slate-700 hover:border-red-500/60 text-[10px] font-bold py-1 rounded-lg transition-all active:scale-95 cursor-pointer">
                        Detach
                      </button>
                    </div>
                  );
                }

                return (
                  <div
                    key={slotIdx}
                    className="bg-slate-950/80 border border-dashed border-sky-500/40 p-2.5 rounded-xl flex flex-col items-center justify-center text-center gap-1">
                    <span className="text-[10px] font-mono font-bold text-sky-400/70">
                      Bay {slotIdx + 1}
                    </span>
                    <span className="text-[11px] font-bold text-slate-400">
                      Available Slot
                    </span>
                    <span className="text-[9px] text-slate-500">
                      Attach below
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. Unattached Modules in Inventory Storage */}
          <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-2xl space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 font-bold text-emerald-300">
                <Package className="w-4 h-4" />
                <span>Unattached Modules in Storage ({totalUnattached})</span>
              </div>
              <span className="text-[11px] text-slate-400">
                Craft more at Artisan Workbench
              </span>
            </div>

            {totalUnattached === 0 && (
              <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 text-center space-y-1.5">
                <p className="text-xs text-slate-300 font-semibold">
                  No unattached modules in storage.
                </p>
                <p className="text-[11px] text-slate-400 leading-relaxed max-w-md mx-auto">
                  Craft <strong>Storage Modules (I-III)</strong>, <strong>Battery Modules (I-III)</strong>, or <strong>Radar Modules (I-III)</strong> in the <strong>Workbench</strong> (Rover tab), or purchase blueprints at the Botanical Market!
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {ALL_ROVER_MODULE_KEYS.map((mKey, mIdx) => {
                const cfg = ROVER_MODULE_CONFIGS[mKey];
                const inStock = inv.rover_modules[mKey] || 0;
                const isFull = attached.length >= maxSlots;
                const canAttach = inStock > 0 && !isFull;
                const isFocused = focusedGarageIdx === mIdx;

                return (
                  <div
                    key={mKey}
                    className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                      isFocused
                        ? 'bg-slate-850 border-sky-300 ring-4 ring-sky-400 scale-[1.01] shadow-[0_0_15px_rgba(56,189,248,0.5)]'
                        : inStock > 0
                        ? 'bg-slate-950/90 border-slate-700 shadow-sm'
                        : 'bg-slate-950/40 border-slate-850 opacity-60'
                    }`}>
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-2xl shrink-0">{cfg.icon}</span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h5 className="font-bold text-xs text-slate-100 truncate">
                            {isFocused && <span className="text-sky-400 mr-1">► [E/A]</span>}
                            {cfg.name}
                          </h5>
                          <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${
                            cfg.category === 'battery'
                              ? 'bg-amber-950/80 text-amber-300 border-amber-500/50'
                              : cfg.category === 'radar'
                              ? 'bg-sky-950/80 text-sky-300 border-sky-500/50'
                              : 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50'
                          }`}>
                            {cfg.bonusLabel} • ⚡ {cfg.kw} kW
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 block mt-0.5 line-clamp-1">
                          {cfg.description} • Stock: <strong className={inStock > 0 ? 'text-sky-300 font-mono' : 'text-slate-500 font-mono'}>{inStock}</strong>
                        </span>
                      </div>
                    </div>

                    <button
                      disabled={!canAttach}
                      onClick={() => onAttachRoverModule(mKey)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all shadow cursor-pointer ${
                        canAttach
                          ? 'bg-sky-600 hover:bg-sky-500 text-white active:scale-95'
                          : inStock <= 0
                          ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                          : 'bg-slate-800 text-amber-400/80 cursor-not-allowed'
                      }`}>
                      {inStock <= 0 ? 'No Stock' : isFull ? 'Bays Full' : 'Attach (+)'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* FOOTER CONTROLLER & KEYBOARD PROMPTS STRIP */}
      <div className="pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 shrink-0 mt-1">
        <span className="font-mono text-cyan-400 text-[11px] hidden sm:inline">
          🎮 [A/D / LB/RB] Switch Tabs • [W/S] Select • [E / A] Depart/Equip • [Arrows / R-Stick] Scroll • [Esc / B] Close
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
