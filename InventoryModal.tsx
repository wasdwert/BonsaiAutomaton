import React, { useState, useEffect } from 'react';
import {
  Package,
  Sprout,
  Wrench,
  Sun,
  Wind,
  Droplets,
  Zap,
  Sparkles,
  Truck,
  Battery,
  Navigation,
  Info,
  X,
  Award,
} from 'lucide-react';
import {
  BonsaiLeafType,
  BonsaiGroup,
  MaturityTier,
  getLeafTypeDef,
  getMaturityDef,
  getBonsaiDisplayName,
  getSpeciesName,
} from './bonsaiData';
import {gameAudio} from './utils/helper';
import {
  SanctuaryInventory,
  StoredPottedBonsai,
  StoredSapling,
  PlantedBonsai,
  DeployedStructure,
  AutoFabricatorLane,
  getBonsaiGroupBadgeClass,
  getBonsaiStyleDef,
  calculateDonationValue,
  calculateBonsaiSellPrice,
  getStructureInventoryCount,
  VerdureIcon,
} from './App';
import {
  BonsaiAttributes,
  DEFAULT_BONSAI_ATTRIBUTES,
  ATTRIBUTE_CONFIG,
  getAttributeTier,
  getAttributeTierName,
  getAttributeTierColor,
  SeedlingItem,
  getBonsaiNature,
  calculateBaseAesthetic,
  checkMatchesEcoRequest,
  GridPlacementPreview,
} from './types';
import { DeployedStructureType } from './App';

export interface EquipmentCardProps {
  icon: React.ReactNode;
  iconBg?: string;
  iconBorder?: string;
  title: string;
  subtitle: string;
  description?: string;
  stockCount: number;
  activeCount: number;
  activeLabel: 'Deployed' | 'Attached';
  onDeploy?: () => void;
}

/**
 * Standardized, cohesive card component for all Inventory Equipment sub-menus.
 * Provides identical border radius, typography, badge positioning, and telemetry pill format.
 */
export function EquipmentCard({
  icon,
  iconBg = 'bg-slate-950',
  iconBorder = 'border-slate-800',
  title,
  subtitle,
  description,
  stockCount,
  activeCount,
  activeLabel,
  onDeploy,
}: EquipmentCardProps) {
  return (
    <div className="bg-slate-900/80 border border-slate-800 hover:border-slate-700/90 p-3.5 rounded-2xl flex items-center justify-between gap-3 shadow transition-all min-h-[76px]">
      <div className="flex items-center gap-3 min-w-0">
        <div
          className={`w-10 h-10 rounded-xl ${iconBg} border ${iconBorder} flex items-center justify-center text-xl shrink-0 shadow-inner`}>
          {icon}
        </div>
        <div className="min-w-0">
          <h4 className="font-bold text-xs sm:text-sm text-slate-100 truncate">{title}</h4>
          <p className="text-[10px] sm:text-[11px] text-slate-400 line-clamp-1">{subtitle}</p>
          {description && (
            <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">{description}</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <div className="px-2.5 py-1 rounded-xl bg-slate-950/90 border border-slate-700/80 flex items-center gap-1.5 font-mono text-xs shadow-sm">
          <span className={stockCount > 0 ? 'text-emerald-400 font-black' : 'text-slate-500 font-semibold'}>
            {stockCount} in Stock
          </span>
          <span className="text-slate-600 font-light">/</span>
          <span className={activeCount > 0 ? 'text-sky-300 font-bold' : 'text-slate-500 font-semibold'}>
            {activeCount} {activeLabel}
          </span>
        </div>
        {onDeploy && (
          <button
            disabled={stockCount <= 0}
            onClick={onDeploy}
            className={`font-bold text-xs px-3 py-1.5 rounded-xl transition-all shadow flex items-center gap-1 shrink-0 ${
              stockCount > 0
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white active:scale-95 cursor-pointer ring-1 ring-emerald-400/50'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
            }`}>
            <Sprout className="w-3.5 h-3.5" />
            <span>Deploy</span>
          </button>
        )}
      </div>
    </div>
  );
}

export interface InventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  inventory: SanctuaryInventory;
  skills?: any;
  storageTab: 'PLANTING' | 'MATERIALS' | 'EQUIPMENT' | 'DECOR';
  setStorageTab: (tab: 'PLANTING' | 'MATERIALS' | 'EQUIPMENT' | 'DECOR') => void;
  storedPottedBonsais: StoredPottedBonsai[];
  storedSaplings: StoredSapling[];
  seedlingList?: SeedlingItem[];
  plantedBonsais: PlantedBonsai[];
  deployedStructures: DeployedStructure[];
  installedCraftingArms: number;
  autoFabricatorLanesCount: number;
  autoFabricatorLanes?: AutoFabricatorLane[];
  onPlantStoredBonsai: (id: string) => void;
  onPlantSaplingClick: (sap: any) => void;
  onInspectBonsai?: (id: string) => void;
  onDonateStoredBonsai?: (id: string) => void;
  onDeployStructure?: (type: DeployedStructureType) => void;
  onStartPlacementPreview?: (preview: GridPlacementPreview) => void;
  activeEcoRequestIndex?: number;
  ecoRequestCounts?: Record<string, number>;
  isInspecting?: boolean;
}

export default function InventoryModal({
  isOpen,
  onClose,
  inventory: inv,
  skills,
  storageTab,
  setStorageTab,
  storedPottedBonsais,
  storedSaplings,
  seedlingList = [],
  plantedBonsais,
  deployedStructures,
  installedCraftingArms,
  autoFabricatorLanesCount,
  autoFabricatorLanes = [],
  onPlantStoredBonsai,
  onPlantSaplingClick,
  onInspectBonsai,
  onDonateStoredBonsai,
  onDeployStructure,
  onStartPlacementPreview,
  activeEcoRequestIndex = 0,
  ecoRequestCounts = {},
  isInspecting = false,
}: InventoryModalProps) {
  const [focusedIdx, setFocusedIdx] = useState<number>(0);

  // Use individual seedlingList if available, otherwise fallback to storedSaplings
  const effectiveSeedlings: SeedlingItem[] =
    seedlingList.length > 0
      ? seedlingList
      : (inv.seedlingList && inv.seedlingList.length > 0)
      ? inv.seedlingList
      : storedSaplings.flatMap((s, idx) =>
          Array.from({ length: s.count }).map((_, cIdx) => ({
            id: s.id || `sapling_${idx}_${cIdx}`,
            leafType: s.leafType,
            maturity: s.maturity || 'sprout',
            group: s.group,
            name: s.name,
            rarity: s.rarity,
            color: s.color,
            flowerColor: s.flowerColor,
            findOdds: s.findOdds,
            geneticPotential: s.attributes || s.geneticPotential || DEFAULT_BONSAI_ATTRIBUTES,
            attributes: s.attributes || DEFAULT_BONSAI_ATTRIBUTES,
          })),
        );

  const totalAvailableSeedlings = effectiveSeedlings.length;
  const totalStoredPots = storedPottedBonsais.length;

  // Reset focused item index when switching tabs
  useEffect(() => {
    setFocusedIdx(0);
  }, [storageTab]);

  // Handle Gamepad Bumper tab cycling & Keyboard Navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const tabs: ('PLANTING' | 'MATERIALS' | 'EQUIPMENT' | 'DECOR')[] = [
        'PLANTING',
        'MATERIALS',
        'EQUIPMENT',
        'DECOR',
      ];

      if (e.key === 'Escape') {
        if (isInspecting) return;
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        const idx = tabs.indexOf(storageTab);
        const nextIdx = (idx - 1 + tabs.length) % tabs.length;
        setStorageTab(tabs[nextIdx]);
        gameAudio.playCrispClick();
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        const idx = tabs.indexOf(storageTab);
        const nextIdx = (idx + 1) % tabs.length;
        setStorageTab(tabs[nextIdx]);
        gameAudio.playCrispClick();
      } else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        setFocusedIdx((i) => Math.max(0, i - 1));
        gameAudio.playHoverMicroTone();
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        e.preventDefault();
        const maxItems =
          storageTab === 'PLANTING'
            ? storedPottedBonsais.length + effectiveSeedlings.length
            : 10;
        setFocusedIdx((i) => Math.min(Math.max(0, maxItems - 1), i + 1));
        gameAudio.playHoverMicroTone();
      } else if (e.key === 'Enter' || e.key === ' ' || e.key === 'e' || e.key === 'E') {
        if (storageTab === 'PLANTING') {
          e.preventDefault();
          if (focusedIdx < storedPottedBonsais.length) {
            const potted = storedPottedBonsais[focusedIdx];
            if (potted) onPlantStoredBonsai(potted.id);
          } else {
            const seedIdx = focusedIdx - storedPottedBonsais.length;
            const seed = effectiveSeedlings[seedIdx];
            if (seed) onPlantSaplingClick(seed);
          }
        }
      }
    };

    const handleBumper = (e: Event) => {
      const ce = e as CustomEvent<{direction: 'left' | 'right'}>;
      const dir = ce.detail?.direction;
      const tabs: ('PLANTING' | 'MATERIALS' | 'EQUIPMENT' | 'DECOR')[] = [
        'PLANTING',
        'MATERIALS',
        'EQUIPMENT',
        'DECOR',
      ];
      const idx = tabs.indexOf(storageTab);
      const nextIdx =
        dir === 'right'
          ? (idx + 1) % tabs.length
          : (idx - 1 + tabs.length) % tabs.length;
      setStorageTab(tabs[nextIdx]);
      gameAudio.playCrispClick();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('gamepad-bumper', handleBumper);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('gamepad-bumper', handleBumper);
    };
  }, [isOpen, storageTab, setStorageTab, focusedIdx, storedPottedBonsais, effectiveSeedlings, onPlantStoredBonsai, onPlantSaplingClick, onClose]);

  if (!isOpen) return null;

  const handleDeployItem = (type: DeployedStructureType, is3x3 = false, is2x2 = false) => {
    onClose();
    if (onStartPlacementPreview) {
      onStartPlacementPreview({
        category: 'infrastructure',
        payload: type,
        width: is3x3 ? 3 : is2x2 ? 2 : 1,
        height: is3x3 ? 3 : is2x2 ? 2 : 1,
        orientation: 'horizontal',
        loaderFacing: 'UP',
        dispenserFacing: 'UP',
        dispenserOrientation: 'horizontal',
      });
    } else if (onDeployStructure) {
      onDeployStructure(type);
    }
  };

  return (
    <div className="fixed top-12 left-0 right-0 bottom-0 z-40 bg-slate-950/95 backdrop-blur-md p-3 sm:p-5 flex flex-col overflow-hidden border-t border-slate-800 text-left select-none">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-3 shrink-0">
        <div className="flex items-center gap-2">
          <Sprout className="w-5 h-5 text-emerald-400" />
          <div>
            <h3 className="text-lg font-bold text-emerald-400">🌱 Nursery Inventory &amp; Storage</h3>
            <p className="text-[11px] text-slate-400">Manage plant specimens, raw crafting salvage, and automaton units</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Unified 4-Tab Selector */}
      <div className="grid grid-cols-4 gap-1.5 mb-3 shrink-0">
        <button
          onClick={() => {
            setStorageTab('PLANTING');
            gameAudio.playCrispClick();
          }}
          className={`py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1 transition-all ${
            storageTab === 'PLANTING'
              ? 'bg-emerald-600 text-white shadow-md ring-2 ring-emerald-400/40'
              : 'bg-slate-800 text-slate-400 hover:bg-slate-750'
          }`}>
          <Sprout className="w-3.5 h-3.5" />
          <span>🌱 Plants ({totalStoredPots + totalAvailableSeedlings})</span>
        </button>
        <button
          onClick={() => {
            setStorageTab('MATERIALS');
            gameAudio.playCrispClick();
          }}
          className={`py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1 transition-all ${
            storageTab === 'MATERIALS'
              ? 'bg-amber-600 text-white shadow-md ring-2 ring-amber-400/40'
              : 'bg-slate-800 text-slate-400 hover:bg-slate-750'
          }`}>
          <Package className="w-3.5 h-3.5" />
          <span>📦 Materials</span>
        </button>
        <button
          onClick={() => {
            setStorageTab('EQUIPMENT');
            gameAudio.playCrispClick();
          }}
          className={`py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1 transition-all ${
            storageTab === 'EQUIPMENT'
              ? 'bg-sky-600 text-white shadow-md ring-2 ring-sky-400/40'
              : 'bg-slate-800 text-slate-400 hover:bg-slate-750'
          }`}>
          <Wrench className="w-3.5 h-3.5" />
          <span>⚡ Equipment</span>
        </button>
        <button
          onClick={() => {
            setStorageTab('DECOR');
            gameAudio.playCrispClick();
          }}
          className={`py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1 transition-all ${
            storageTab === 'DECOR'
              ? 'bg-teal-600 text-white shadow-md ring-2 ring-teal-400/40'
              : 'bg-slate-800 text-slate-400 hover:bg-slate-750'
          }`}>
          <span>🎋</span>
            <span>Decorations ({
            (inv.bamboo_fence_inv || 0) +
            (inv.decor_pebble_path_inv || 0) +
            (inv.zen_rock_formation_inv || inv.decor_rock_formation_inv || 0) +
            (inv.growing_bamboo_formation_inv || inv.decor_shrubbery_bush_inv || 0) +
            (inv.asparagus_fern_ball_inv || 0) +
            (inv.water_feature_inv || inv.decor_woven_wall_inv || 0) +
            (inv.torii_gate_inv || inv.decorations?.toriiGate || inv.decorations?.['torii_gate'] || 0) +
            getStructureInventoryCount(inv, 'empty_crystal_pedestal') +
            getStructureInventoryCount(inv, 'seven_lucky_gods') +
            getStructureInventoryCount(inv, 'stone_lantern')
          })</span>
        </button>
      </div>

      {/* TAB 1: SEEDLINGS & STORED POTTED BONSAIS */}
      {storageTab === 'PLANTING' && (
        <div className="flex-1 space-y-4 mb-3 overflow-y-auto pr-1">
          <div className="text-xs text-slate-300 bg-slate-900/80 p-2.5 rounded-2xl border border-emerald-500/40 flex items-center gap-2 shadow-sm">
            <Info className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Deploy by standing on an empty plot in the sanctuary and pressing [E] or [P]</span>
          </div>

          {/* Stored Potted Bonsais */}
          <div>
            <div className="text-xs font-bold text-sky-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5" />
              <span>Stored Potted Bonsais ({storedPottedBonsais.length})</span>
            </div>

            {storedPottedBonsais.length === 0 ? (
              <div className="p-3 text-center text-xs text-slate-500 bg-slate-900/60 rounded-2xl border border-slate-800/80">
                No potted trees in storage. (Pick up any planted tree with [Q] to preserve its level!)
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {storedPottedBonsais.map((stored) => {
                  const sMat = getMaturityDef(stored.maturity || 'sprout');
                  const sDef = getLeafTypeDef(stored.leafType);
                  const attrs: BonsaiAttributes = stored.attributes || DEFAULT_BONSAI_ATTRIBUTES;
                  const ba = calculateBaseAesthetic(stored);
                  const isEcoMatch = checkMatchesEcoRequest(
                    stored,
                    activeEcoRequestIndex,
                    ecoRequestCounts,
                  ).matches;
                  const baseValue = calculateDonationValue(stored, skills);
                  const donationPayout = isEcoMatch ? Math.floor((baseValue * 2 + 1e-9) * 100) / 100 : baseValue;

                  return (
                    <div
                      key={stored.id}
                      style={{borderColor: stored.isFavorite ? '#f59e0b' : `${sMat.border}50`}}
                      className={`bg-slate-900/80 border p-3 rounded-2xl flex flex-col justify-between gap-2.5 shadow transition-all ${
                        stored.isFavorite
                          ? 'border-amber-500/80 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                          : 'hover:border-sky-500/50'
                      }`}>
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <div className="font-bold text-xs sm:text-sm text-slate-200 flex items-center gap-1.5 flex-wrap min-w-0">
                            <span style={{backgroundColor: sDef.color}} className="w-3 h-3 rounded-full inline-block shadow-sm shrink-0" />
                            <span className={`text-[10px] px-1.5 py-0.2 rounded font-black border ${getBonsaiGroupBadgeClass(stored.group)}`}>
                              {stored.group}
                            </span>
                            <span
                              style={{
                                backgroundColor: sMat.bg,
                                borderColor: sMat.border,
                                color: sMat.color,
                                boxShadow: `0 0 8px ${sMat.color}30`,
                              }}
                              className="text-[10px] px-2 py-0.5 rounded-full font-black border flex items-center gap-1 shrink-0">
                              <span>{sMat.kanji}</span>
                              <span>{sMat.name}</span>
                              <span className="opacity-80 font-mono">({sMat.multiplier}x)</span>
                            </span>
                            <span className="truncate">{getBonsaiDisplayName(stored)} (Lv.{stored.level} • {ba.total.toFixed(2)} BA)</span>
                            {stored.isFavorite && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full font-black bg-amber-500 text-slate-950 border border-amber-300 flex items-center gap-1 shadow-sm shrink-0">
                                <span>⭐</span>
                                <span>Favorited</span>
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="text-[10px] text-slate-400 mt-1">
                          Style: <span className="text-emerald-400 font-medium">{getBonsaiStyleDef(stored.style).japanese}</span> • Shape: <span className="text-slate-300">{sDef.leafShapeName}</span> • BA: <span className="text-amber-300 font-bold font-mono">{ba.total.toFixed(2)} BA</span> • Valuation: <span className={`font-bold ${isEcoMatch ? 'text-amber-300' : 'text-emerald-300'}`}>+{donationPayout.toFixed(2)} Verdure{isEcoMatch ? ' (🌟 2x Match)' : ''}</span>
                        </div>
                      </div>

                      {/* Compact Attributes Display (No Progress Bars) */}
                      <div className="bg-slate-950/70 p-2 rounded-xl border border-slate-800 text-[10px] space-y-1">
                        <div className="text-[10px] font-bold text-slate-400 flex items-center justify-between">
                          <span className="flex items-center gap-1">
                            <Award className="w-3 h-3 text-amber-400" />
                            <span>Genetic Potential</span>
                          </span>
                          <span className="font-mono text-slate-400 font-bold">
                            {getAttributeTier(Math.round((attrs.foliage + attrs.branches + attrs.trunk + attrs.roots) / 4))}
                          </span>
                        </div>
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

                      {/* Action Buttons: Plant, Inspect, Donate */}
                      <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-800/80 flex-wrap">
                        <button
                          onClick={() => onPlantStoredBonsai(stored.id)}
                          className="bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs px-2.5 py-1.5 rounded-xl transition-transform active:scale-95 shadow shrink-0 cursor-pointer">
                          Plant on Plot
                        </button>

                        <button
                          onClick={() => onInspectBonsai?.(stored.id)}
                          className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-600 font-bold text-xs px-2.5 py-1.5 rounded-xl transition-transform active:scale-95 shadow shrink-0 flex items-center gap-1 cursor-pointer">
                          <span>🔍</span>
                          <span>Inspect</span>
                        </button>

                        <button
                          disabled={stored.isFavorite}
                          onClick={() => {
                            if (stored.isFavorite) {
                              gameAudio?.playErrorBuzz?.();
                              return;
                            }
                            onDonateStoredBonsai?.(stored.id);
                          }}
                          title={stored.isFavorite ? 'Favorited - Locked from Donation' : undefined}
                          className={`font-bold text-xs px-2.5 py-1.5 rounded-xl transition-transform active:scale-95 shadow shrink-0 flex items-center gap-1 ${
                            stored.isFavorite
                              ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-75'
                              : isEcoMatch
                              ? 'bg-gradient-to-r from-amber-600 to-emerald-600 hover:from-amber-500 hover:to-emerald-500 text-amber-100 border border-amber-300 ring-1 ring-emerald-400 cursor-pointer'
                              : 'bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer'
                          }`}>
                          {stored.isFavorite ? (
                            <>
                              <span>⭐</span>
                              <span>Favorited (Locked)</span>
                            </>
                          ) : (
                            <>
                              <VerdureIcon className="w-3.5 h-3.5" />
                              <span>Donate (+{donationPayout.toFixed(2)})</span>
                              {isEcoMatch && (
                                <span className="text-[9px] bg-amber-400 text-slate-950 px-1 py-0.2 rounded font-black">
                                  2x
                                </span>
                              )}
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Fresh Individual Wild Seedlings */}
          <div>
            <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Sprout className="w-3.5 h-3.5" />
                <span>Foraged Wild Seedlings ({effectiveSeedlings.length})</span>
              </span>
              <span className="text-[11px] text-slate-400 font-normal">Each seedling has unique genetic attributes</span>
            </div>

            {effectiveSeedlings.length === 0 ? (
              <div className="p-3 text-center text-xs text-slate-500 bg-slate-900/60 rounded-2xl border border-slate-800/80">
                No wild seedlings in inventory. Embark on rover expeditions to discover seedlings!
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {effectiveSeedlings.map((seedling, idx) => {
                  const sMat = getMaturityDef(seedling.maturity as MaturityTier);
                  const sDef = getLeafTypeDef(seedling.leafType as BonsaiLeafType);
                  const attrs: BonsaiAttributes =
                    seedling.geneticPotential || seedling.attributes || DEFAULT_BONSAI_ATTRIBUTES;

                  return (
                    <div
                      key={seedling.id || `seedling_${idx}`}
                      style={{borderColor: `${sMat.border}50`}}
                      className="bg-slate-900/80 border p-3 rounded-2xl flex flex-col justify-between gap-2.5 shadow hover:border-emerald-500/50 transition-all">
                      <div className="flex items-center justify-between gap-2">
                        <div className="font-bold text-xs sm:text-sm text-slate-200 flex items-center gap-1.5 flex-wrap min-w-0">
                          <span style={{backgroundColor: seedling.color || sDef.color}} className="w-3 h-3 rounded-full inline-block shadow-sm shrink-0" />
                          <span className={`text-[10px] px-1.5 py-0.2 rounded font-black border ${getBonsaiGroupBadgeClass((seedling.group as any) || sDef.group)}`}>
                            {seedling.group || sDef.group}
                          </span>
                            <span
                              style={{
                                backgroundColor: sMat.bg,
                                borderColor: sMat.border,
                                color: sMat.color,
                                boxShadow: `0 0 8px ${sMat.color}30`,
                              }}
                              className="text-[10px] px-2 py-0.5 rounded-full font-black border flex items-center gap-1 shrink-0">
                              <span>{sMat.kanji}</span>
                              <span>{sMat.name}</span>
                              <span className="opacity-80 font-mono">({sMat.multiplier}x)</span>
                            </span>
                            <span className="truncate">{getBonsaiDisplayName(seedling)}</span>
                            {seedling.nature && (() => {
                            const nat = getBonsaiNature(seedling.nature);
                            return (
                              <span
                                title={`Nature: ${nat.name} (${nat.descriptor})`}
                                className="text-[9px] px-2 py-0.2 rounded-full font-bold bg-violet-950/80 border border-violet-500/60 text-violet-300">
                                Nature: {nat.name}
                              </span>
                            );
                          })()}
                        </div>

                        <button
                          onClick={() => onPlantSaplingClick(seedling)}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-2.5 py-1 rounded-xl transition-transform active:scale-95 shadow shrink-0">
                          Plant
                        </button>
                      </div>

                      <div className="text-[10px] text-slate-400">
                        Shape: <span className="text-slate-300">{sDef.leafShapeName}</span> • Growth Req: <strong style={{color: sMat.color}}>{sMat.growthMultiplier}x</strong>
                      </div>

                      {/* COMPACT GENETIC ATTRIBUTES DISPLAY: NO PROGRESS BARS */}
                      <div className="bg-slate-950/70 p-2 rounded-xl border border-slate-800 text-[10px] space-y-1">
                        <div className="text-[10px] font-bold text-slate-400 flex items-center justify-between">
                          <span className="flex items-center gap-1">
                            <Award className="w-3 h-3 text-amber-400" />
                            <span>Genetic Potential</span>
                          </span>
                          <span className="font-mono text-slate-400 font-bold">
                            {getAttributeTier(Math.round((attrs.foliage + attrs.branches + attrs.trunk + attrs.roots) / 4))}
                          </span>
                        </div>
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
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: RAW CRAFTING MATERIALS */}
      {storageTab === 'MATERIALS' && (
        <div className="flex-1 space-y-3 mb-3 overflow-y-auto pr-1">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-amber-500/40">
              <div className="text-xs text-amber-300 font-semibold mb-1">📜 T1 License</div>
              <div className="text-2xl font-black text-amber-300">{inv.license_t1 || inv.licenseT1 || 0}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Tier 1 Engineering Certification</div>
            </div>

            <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-sky-500/40">
              <div className="text-xs text-sky-300 font-semibold mb-1">📜 T2 License</div>
              <div className="text-2xl font-black text-sky-300">{inv.license_t2 || inv.licenseT2 || 0}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Tier 2 Engineering Certification</div>
            </div>

            <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-purple-500/40">
              <div className="text-xs text-purple-300 font-semibold mb-1">📜 T3 License</div>
              <div className="text-2xl font-black text-purple-300">{inv.license_t3 || inv.licenseT3 || 0}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Tier 3 Master Certification</div>
            </div>

            <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800">
              <div className="text-xs text-slate-400 font-semibold mb-1">🔩 Scrap Metal (Tier 1)</div>
              <div className="text-2xl font-black text-slate-200">{inv.scrap_metal ?? inv.scrapMetal ?? 0}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Base salvage • Up-craft to Wire (4:1)</div>
            </div>

            <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800">
              <div className="text-xs text-orange-400 font-semibold mb-1">⚡ Copper Wire (Tier 2)</div>
              <div className="text-2xl font-black text-orange-400">{inv.copper_wire ?? inv.copperWire ?? 0}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Conduits • Up-craft to Gears (4:1)</div>
            </div>

            <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800">
              <div className="text-xs text-yellow-400 font-semibold mb-1">⚙️ Mechanical Gears (Tier 3)</div>
              <div className="text-2xl font-black text-yellow-400">{inv.brass_gears ?? inv.gears ?? 0}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Rotary misters • Up-craft to Circuits (4:1)</div>
            </div>

            <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800">
              <div className="text-xs text-emerald-400 font-semibold mb-1">🟩 Microcircuits (Tier 4)</div>
              <div className="text-2xl font-black text-emerald-400">{inv.circuit_boards ?? inv.microcircuits ?? 0}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Controllers • Up-craft to Chips (4:1)</div>
            </div>

            <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-purple-500/30">
              <div className="text-xs text-purple-400 font-semibold mb-1">💎 Quantum Chips (Tier 5)</div>
              <div className="text-2xl font-black text-purple-400">{inv.electronic_chips ?? inv.chips ?? inv.quantumChips ?? 0}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Master nanite processor core</div>
            </div>

            <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-lime-500/30">
              <div className="text-xs text-lime-400 font-semibold mb-1">🍂 Organic Waste</div>
              <div className="text-2xl font-black text-lime-400">{inv.organic_waste ?? inv.organicWaste ?? 0}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Fallen clippings (+1 per level up) • Feed for Compost Heap</div>
            </div>

            <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-amber-600/40">
              <div className="text-xs text-amber-300 font-semibold mb-1">🧱 Condensed Organic Material</div>
              <div className="text-2xl font-black text-amber-300">{inv.condensed_organic_material ?? inv.condensedOrganicMaterial ?? inv.resources?.condensed_organic_material ?? 0}</div>
              <div className="text-[10px] text-amber-400/90 mt-0.5">High-density organic substrate</div>
              <div className="text-[9px] text-slate-500">Refined at Compost Heap (4 Waste • 30s)</div>
            </div>

            <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-cyan-500/30">
              <div className="text-xs text-cyan-400 font-semibold mb-1">🧪 Biochemicals</div>
              <div className="text-2xl font-black text-cyan-400">{inv.biochemicals ?? inv.resources?.biochemicals ?? 0}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Eco-catalyst reagent • Chemical Station (2 Waste &amp; 1 Wire • 60s)</div>
            </div>

            {/* COMPOST TIERS SECTION */}
            <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-lime-500/40">
              <div className="text-xs text-lime-300 font-semibold mb-1">🍂 Compost S (Tier S)</div>
              <div className="text-2xl font-black text-lime-300">{inv.compost_s || 0}</div>
              <div className="text-[10px] text-lime-400/90 mt-0.5">+15% Growth Speed for 30s</div>
              <div className="text-[9px] text-slate-500">Craft at Compost Heap (2 Waste • 10s)</div>
            </div>

            <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-emerald-500/40">
              <div className="text-xs text-emerald-300 font-semibold mb-1">🌾 Compost M (Tier M)</div>
              <div className="text-2xl font-black text-emerald-300">{inv.compost_m || 0}</div>
              <div className="text-[10px] text-emerald-400/90 mt-0.5">+30% Growth Speed for 150s</div>
              <div className="text-[9px] text-slate-500">Craft at Compost Heap (4 Waste &amp; 1 Compost S • 20s)</div>
            </div>

            <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-amber-500/40">
              <div className="text-xs text-amber-300 font-semibold mb-1">✨ Compost L (Tier L)</div>
              <div className="text-2xl font-black text-amber-300">{inv.compost_l || 0}</div>
              <div className="text-[10px] text-amber-400/90 mt-0.5">+45% Growth Speed for 900s</div>
              <div className="text-[9px] text-slate-500">Craft at Compost Heap (6 Waste &amp; 1 Compost M • 30s)</div>
            </div>

            {/* FERTILIZER TIERS SECTION */}
            <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-cyan-500/40">
              <div className="text-xs text-cyan-300 font-semibold mb-1">🧪 Fertilizer S (Tier S)</div>
              <div className="text-2xl font-black text-cyan-300">{inv.fertilizer_s || 0}</div>
              <div className="text-[10px] text-cyan-400/90 mt-0.5">+25% Hydration Growth for 90s</div>
              <div className="text-[9px] text-slate-500">Craft at Chemical Station (4 Waste &amp; 1 Bio • 20s)</div>
            </div>

            <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-sky-500/40">
              <div className="text-xs text-sky-300 font-semibold mb-1">⚡ Fertilizer M (Tier M)</div>
              <div className="text-2xl font-black text-sky-300">{inv.fertilizer_m || 0}</div>
              <div className="text-[10px] text-sky-400/90 mt-0.5">+50% Hydration Growth for 600s</div>
              <div className="text-[9px] text-slate-500">Craft at Chemical Station (6 Waste, 1 Bio &amp; 1 Fert S • 40s)</div>
            </div>

            <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-purple-500/40">
              <div className="text-xs text-purple-300 font-semibold mb-1">🌟 Fertilizer L (Tier L)</div>
              <div className="text-2xl font-black text-purple-300">{inv.fertilizer_l || 0}</div>
              <div className="text-[10px] text-purple-400/90 mt-0.5">+75% Hydration Growth for 3600s</div>
              <div className="text-[9px] text-slate-500">Craft at Chemical Station (10 Waste, 1 Bio &amp; 1 Fert M • 60s)</div>
            </div>

            {/* SPEED GROW INSTANT PROGRESSION SECTION */}
            <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-emerald-500/40">
              <div className="text-xs text-emerald-300 font-semibold mb-1">⚡ Speed Grow XS</div>
              <div className="text-2xl font-black text-emerald-300">{inv.speed_grow_xs || 0}</div>
              <div className="text-[10px] text-emerald-400/90 mt-0.5">Instant +30s Tree Growth</div>
              <div className="text-[9px] text-slate-500">Chemical Station (3 Waste &amp; 1 Bio • 15s)</div>
            </div>

            <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-cyan-500/40">
              <div className="text-xs text-cyan-300 font-semibold mb-1">⚡ Speed Grow S</div>
              <div className="text-2xl font-black text-cyan-300">{inv.speed_grow_s || 0}</div>
              <div className="text-[10px] text-cyan-400/90 mt-0.5">Instant +120s Tree Growth</div>
              <div className="text-[9px] text-slate-500">Chemical Station (5 Waste, 2 Bio, 1 Compost S • 30s)</div>
            </div>

            <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-blue-500/40">
              <div className="text-xs text-blue-300 font-semibold mb-1">⚡ Speed Grow M</div>
              <div className="text-2xl font-black text-blue-300">{inv.speed_grow_m || 0}</div>
              <div className="text-[10px] text-blue-400/90 mt-0.5">Instant +600s Tree Growth</div>
              <div className="text-[9px] text-slate-500">Chemical Station (7 Waste, 2 Bio, 1 Compost S, 1 Fert S • 45s)</div>
            </div>

            <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-purple-500/40">
              <div className="text-xs text-purple-300 font-semibold mb-1">⚡ Speed Grow L</div>
              <div className="text-2xl font-black text-purple-300">{inv.speed_grow_l || 0}</div>
              <div className="text-[10px] text-purple-400/90 mt-0.5">Instant +3,600s Tree Growth</div>
              <div className="text-[9px] text-slate-500">Chemical Station (10 Waste, 3 Bio, 1 Compost M, 1 Fert S • 60s)</div>
            </div>

            <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-amber-500/40">
              <div className="text-xs text-amber-300 font-semibold mb-1">⚡ Speed Grow XL</div>
              <div className="text-2xl font-black text-amber-300">{inv.speed_grow_xl || 0}</div>
              <div className="text-[10px] text-amber-400/90 mt-0.5">Instant +28,800s Tree Growth</div>
              <div className="text-[9px] text-slate-500">Chemical Station (15 Waste, 3 Bio, 1 Compost M, 1 Fert M • 90s)</div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: STANDARDIZED HARMONIZED EQUIPMENT SUBMENU (ALL 4 CATEGORIES) */}
      {storageTab === 'EQUIPMENT' && (
        <div className="flex-1 space-y-4 mb-3 overflow-y-auto pr-1">
          {/* SUB-HEADER 1: GRID DEPLOYABLE */}
          <div>
            <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Sprout className="w-3.5 h-3.5" />
                <span>Grid Deployable</span>
              </span>
              <span className="text-[11px] text-slate-400 font-normal">
                Physical structures deployable on sanctuary plots
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <EquipmentCard
                icon={<span className="text-xl">🍂</span>}
                iconBg="bg-lime-950/80"
                iconBorder="border-lime-500/50"
                title="T1 Compost Feeder"
                subtitle="1 Adjacent Bonsai (Rotatable) • 6 kW"
                description="Automatically feeds compost to 1 facing bonsai. Rotatable."
                stockCount={getStructureInventoryCount(inv, 't1_compost_feeder')}
                activeCount={deployedStructures.filter((s) => s.type === 't1_compost_feeder').length}
                activeLabel="Deployed"
                onDeploy={() => handleDeployItem('t1_compost_feeder')}
              />

              <EquipmentCard
                icon={<span className="text-xl">🌾</span>}
                iconBg="bg-lime-950/80"
                iconBorder="border-lime-500/50"
                title="T2 Compost Feeder"
                subtitle="2 Adjacent Bonsais (Rotatable) • 10 kW"
                description="Tends 2 adjacent bonsais (H/V). Consumes 1 compost total."
                stockCount={getStructureInventoryCount(inv, 't2_compost_feeder')}
                activeCount={deployedStructures.filter((s) => s.type === 't2_compost_feeder').length}
                activeLabel="Deployed"
                onDeploy={() => handleDeployItem('t2_compost_feeder')}
              />

              <EquipmentCard
                icon={<span className="text-xl">✨</span>}
                iconBg="bg-lime-950/80"
                iconBorder="border-lime-500/50"
                title="T3 Compost Feeder"
                subtitle="4-Way Omni (4 Bonsais) • 16 kW"
                description="Omni-chute feeder nourishing all 4 cardinal bonsais."
                stockCount={getStructureInventoryCount(inv, 't3_compost_feeder')}
                activeCount={deployedStructures.filter((s) => s.type === 't3_compost_feeder').length}
                activeLabel="Deployed"
                onDeploy={() => handleDeployItem('t3_compost_feeder')}
              />

              <EquipmentCard
                icon={<span className="text-xl">🧪</span>}
                iconBg="bg-cyan-950/80"
                iconBorder="border-cyan-500/50"
                title="T1 Fertilizer Dripper"
                subtitle="1 Adjacent Bonsai (Rotatable) • 7 kW"
                description="Automatically injects fertilizer into 1 facing bonsai."
                stockCount={getStructureInventoryCount(inv, 't1_fertilizer_dripper')}
                activeCount={deployedStructures.filter((s) => s.type === 't1_fertilizer_dripper').length}
                activeLabel="Deployed"
                onDeploy={() => handleDeployItem('t1_fertilizer_dripper')}
              />

              <EquipmentCard
                icon={<span className="text-xl">⚡</span>}
                iconBg="bg-cyan-950/80"
                iconBorder="border-cyan-500/50"
                title="T2 Fertilizer Dripper"
                subtitle="2 Adjacent Bonsais (Rotatable) • 12 kW"
                description="Tends 2 adjacent bonsais (H/V). Consumes 1 fertilizer total."
                stockCount={getStructureInventoryCount(inv, 't2_fertilizer_dripper')}
                activeCount={deployedStructures.filter((s) => s.type === 't2_fertilizer_dripper').length}
                activeLabel="Deployed"
                onDeploy={() => handleDeployItem('t2_fertilizer_dripper')}
              />

              <EquipmentCard
                icon={<span className="text-xl">🌟</span>}
                iconBg="bg-cyan-950/80"
                iconBorder="border-cyan-500/50"
                title="T3 Fertilizer Dripper"
                subtitle="4-Way Omni (4 Bonsais) • 18 kW"
                description="Omni-channel injector nourishing all 4 cardinal bonsais."
                stockCount={getStructureInventoryCount(inv, 't3_fertilizer_dripper')}
                activeCount={deployedStructures.filter((s) => s.type === 't3_fertilizer_dripper').length}
                activeLabel="Deployed"
                onDeploy={() => handleDeployItem('t3_fertilizer_dripper')}
              />

              <EquipmentCard
                icon={<span className="text-xl">🦾</span>}
                iconBg="bg-indigo-950/80"
                iconBorder="border-indigo-500/50"
                title="Auto (Un-)Loader"
                subtitle="1x1 Automation • 2 kW • Auto Load &amp; Unload"
                stockCount={getStructureInventoryCount(inv, 'auto_unloader' as any)}
                activeCount={deployedStructures.filter((s) => s.type === ('auto_unloader' as any)).length}
                activeLabel="Deployed"
                onDeploy={() => handleDeployItem('auto_unloader')}
              />

              <EquipmentCard
                icon={<span className="text-xl">🍂</span>}
                iconBg="bg-lime-950/80"
                iconBorder="border-lime-500/50"
                title="Compost Heap"
                subtitle="20 Waste Cap • Passive Decomposition"
                stockCount={getStructureInventoryCount(inv, 'tool_compost_heap')}
                activeCount={deployedStructures.filter((s) => s.type === 'tool_compost_heap').length}
                activeLabel="Deployed"
                onDeploy={() => handleDeployItem('tool_compost_heap')}
              />

              <EquipmentCard
                icon={<span className="text-xl">🧪</span>}
                iconBg="bg-emerald-950/80"
                iconBorder="border-emerald-500/50"
                title="Chemical Station (2x2)"
                subtitle="Eco-Chemical Distiller • 300s Growth Boost Yield"
                stockCount={getStructureInventoryCount(inv, 'fertilizer_station')}
                activeCount={deployedStructures.filter((s) => s.type === 'fertilizer_station').length}
                activeLabel="Deployed"
                onDeploy={() => handleDeployItem('fertilizer_station', false, true)}
              />

              <EquipmentCard
                icon={<Droplets className="w-5 h-5 text-sky-400" />}
                iconBg="bg-sky-950/80"
                iconBorder="border-sky-500/50"
                title="T1 Manual Irrigation System"
                subtitle="Left & Right Plots • 30s Reservoir"
                stockCount={getStructureInventoryCount(inv, 'irrigation_t1')}
                activeCount={deployedStructures.filter((s) => s.type === 'irrigation_t1').length}
                activeLabel="Deployed"
                onDeploy={() => handleDeployItem('irrigation_t1')}
              />

              <EquipmentCard
                icon={<Droplets className="w-5 h-5 text-sky-400" />}
                iconBg="bg-sky-950/80"
                iconBorder="border-sky-500/50"
                title="T2 Manual Irrigation System"
                subtitle="4-Way Cross Plots • 90s Reservoir"
                stockCount={getStructureInventoryCount(inv, 'irrigation_t2')}
                activeCount={deployedStructures.filter((s) => s.type === 'irrigation_t2').length}
                activeLabel="Deployed"
                onDeploy={() => handleDeployItem('irrigation_t2')}
              />

              <EquipmentCard
                icon={<Droplets className="w-5 h-5 text-sky-400" />}
                iconBg="bg-sky-950/80"
                iconBorder="border-sky-500/50"
                title="T3 Manual Irrigation System"
                subtitle="3x3 Grid (8 Plots) • 300s Reservoir"
                stockCount={getStructureInventoryCount(inv, 'irrigation_t3')}
                activeCount={deployedStructures.filter((s) => s.type === 'irrigation_t3').length}
                activeLabel="Deployed"
                onDeploy={() => handleDeployItem('irrigation_t3')}
              />

              <EquipmentCard
                icon={<Sun className="w-5 h-5 text-sky-400" />}
                iconBg="bg-sky-950/80"
                iconBorder="border-sky-500/50"
                title="Solar Panel Array"
                subtitle="+3 kW Clean Power (+0.5 kW/neighbor)"
                stockCount={getStructureInventoryCount(inv, 'solar_panel')}
                activeCount={deployedStructures.filter((s) => s.type === 'solar_panel').length}
                activeLabel="Deployed"
                onDeploy={() => handleDeployItem('solar_panel')}
              />

              <EquipmentCard
                icon={<span className="text-xl">☀️</span>}
                iconBg="bg-sky-950/80"
                iconBorder="border-sky-500/50"
                title="Solar Panel Farm (2x2)"
                subtitle="+24 kW Clean Power (+1.0 kW/adj unit)"
                stockCount={getStructureInventoryCount(inv, 'solar_farm_2x2' as any)}
                activeCount={deployedStructures.filter((s) => s.type === 'solar_farm_2x2').length}
                activeLabel="Deployed"
                onDeploy={() => handleDeployItem('solar_farm_2x2' as any, false, true)}
              />

              <EquipmentCard
                icon={<span className="text-xl">☀️</span>}
                iconBg="bg-sky-950/80"
                iconBorder="border-sky-500/50"
                title="Big Solar Panel Farm (3x3)"
                subtitle="+87 kW Clean Power (+1.5 kW/adj unit)"
                stockCount={getStructureInventoryCount(inv, 'solar_farm_3x3' as any)}
                activeCount={deployedStructures.filter((s) => s.type === 'solar_farm_3x3').length}
                activeLabel="Deployed"
                onDeploy={() => handleDeployItem('solar_farm_3x3' as any, true, false)}
              />

              <EquipmentCard
                icon={<Wind className="w-5 h-5 text-amber-400" />}
                iconBg="bg-amber-950/80"
                iconBorder="border-amber-500/50"
                title="Wind Turbine Generator"
                subtitle="+6 kW Clean Power (+1.0 kW/neighbor)"
                stockCount={getStructureInventoryCount(inv, 'wind_turbine')}
                activeCount={deployedStructures.filter((s) => s.type === 'wind_turbine').length}
                activeLabel="Deployed"
                onDeploy={() => handleDeployItem('wind_turbine')}
              />

              <EquipmentCard
                icon={<span className="text-xl">💨</span>}
                iconBg="bg-amber-950/80"
                iconBorder="border-amber-500/50"
                title="Wind Turbine Farm (2x2)"
                subtitle="+42 kW Clean Power (+1.5 kW/adj unit)"
                stockCount={getStructureInventoryCount(inv, 'wind_farm_2x2' as any)}
                activeCount={deployedStructures.filter((s) => s.type === 'wind_farm_2x2').length}
                activeLabel="Deployed"
                onDeploy={() => handleDeployItem('wind_farm_2x2' as any, false, true)}
              />

              <EquipmentCard
                icon={<span className="text-xl">💨</span>}
                iconBg="bg-amber-950/80"
                iconBorder="border-amber-500/50"
                title="Big Wind Turbine Farm (3x3)"
                subtitle="+134 kW Clean Power (+2.0 kW/adj unit)"
                stockCount={getStructureInventoryCount(inv, 'wind_farm_3x3' as any)}
                activeCount={deployedStructures.filter((s) => s.type === 'wind_farm_3x3').length}
                activeLabel="Deployed"
                onDeploy={() => handleDeployItem('wind_farm_3x3' as any, true, false)}
              />
            </div>
          </div>

          {/* SUB-HEADER 2: BONSAI AUTOMATONS */}
          <div>
            <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Droplets className="w-3.5 h-3.5" />
                <span>Bonsai Automatons</span>
              </span>
              <span className="text-[11px] text-slate-400 font-normal">
                Automated mist irrigation systems
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <EquipmentCard
                icon={<Droplets className="w-5 h-5 text-sky-400" />}
                iconBg="bg-sky-950/80"
                iconBorder="border-sky-500/50"
                title="T1 Hydration Sprinkler"
                subtitle="Left & Right Plots (2 Total) • 4 kW Load"
                stockCount={getStructureInventoryCount(inv, 'automaton_t1')}
                activeCount={deployedStructures.filter((s) => s.type === 'automaton_t1').length + plantedBonsais.filter((b) => b.automatonTier === 1).length}
                activeLabel="Deployed"
              />

              <EquipmentCard
                icon={<Zap className="w-5 h-5 text-purple-400" />}
                iconBg="bg-purple-950/80"
                iconBorder="border-purple-500/50"
                title="T2 Hydration Sprinkler"
                subtitle="4-Way Cross Plots (4 Total) • 7 kW Load"
                stockCount={getStructureInventoryCount(inv, 'automaton_t2')}
                activeCount={deployedStructures.filter((s) => s.type === 'automaton_t2').length + plantedBonsais.filter((b) => b.automatonTier === 2).length}
                activeLabel="Deployed"
              />

              <EquipmentCard
                icon={<Sparkles className="w-5 h-5 text-amber-400" />}
                iconBg="bg-amber-950/80"
                iconBorder="border-amber-500/50"
                title="T3 Hydration Sprinkler"
                subtitle="360° Radial 3x3 (8 Plots) • 12 kW Load"
                stockCount={getStructureInventoryCount(inv, 'automaton_t3')}
                activeCount={deployedStructures.filter((s) => s.type === 'automaton_t3').length + plantedBonsais.filter((b) => b.automatonTier === 3).length}
                activeLabel="Deployed"
              />
            </div>
          </div>

          {/* SUB-HEADER 3: WORKBENCH */}
          <div>
            <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5" />
                <span>Workbench Modules</span>
              </span>
              <span className="text-[11px] text-slate-400 font-normal">
                Assembly queue expansions and overclock modules
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <EquipmentCard
                icon={<span className="text-xl">🦾</span>}
                iconBg="bg-sky-950/80"
                iconBorder="border-sky-500/50"
                title="T1 Assembly Bench Module"
                subtitle="+1 Queue Slot (2 kW)"
                stockCount={inv.assembly_module_t1_inv || 0}
                activeCount={(inv.attached_workbench_modules || []).filter((m) => m === 'assembly_module_t1').length}
                activeLabel="Attached"
              />

              <EquipmentCard
                icon={<span className="text-xl">🦾</span>}
                iconBg="bg-sky-950/80"
                iconBorder="border-sky-500/50"
                title="T2 Assembly Bench Module"
                subtitle="+2 Queue Slots (3 kW)"
                stockCount={inv.assembly_module_t2_inv || 0}
                activeCount={(inv.attached_workbench_modules || []).filter((m) => m === 'assembly_module_t2').length}
                activeLabel="Attached"
              />

              <EquipmentCard
                icon={<span className="text-xl">🦾</span>}
                iconBg="bg-sky-950/80"
                iconBorder="border-sky-500/50"
                title="T3 Assembly Bench Module"
                subtitle="+3 Queue Slots (4 kW)"
                stockCount={inv.assembly_module_t3_inv || 0}
                activeCount={(inv.attached_workbench_modules || []).filter((m) => m === 'assembly_module_t3').length}
                activeLabel="Attached"
              />

              <EquipmentCard
                icon={<span className="text-xl">⚡</span>}
                iconBg="bg-amber-950/80"
                iconBorder="border-amber-500/50"
                title="T1 Overclock Workbench Module"
                subtitle="+5% Craft Speed (3 kW)"
                stockCount={inv.overclock_module_t1_inv || 0}
                activeCount={(inv.attached_workbench_modules || []).filter((m) => m === 'overclock_module_t1').length}
                activeLabel="Attached"
              />

              <EquipmentCard
                icon={<span className="text-xl">⚡</span>}
                iconBg="bg-amber-950/80"
                iconBorder="border-amber-500/50"
                title="T2 Overclock Workbench Module"
                subtitle="+10% Craft Speed (5 kW)"
                stockCount={inv.overclock_module_t2_inv || 0}
                activeCount={(inv.attached_workbench_modules || []).filter((m) => m === 'overclock_module_t2').length}
                activeLabel="Attached"
              />

              <EquipmentCard
                icon={<span className="text-xl">⚡</span>}
                iconBg="bg-amber-950/80"
                iconBorder="border-amber-500/50"
                title="T3 Overclock Workbench Module"
                subtitle="+20% Craft Speed (7 kW)"
                stockCount={inv.overclock_module_t3_inv || 0}
                activeCount={(inv.attached_workbench_modules || []).filter((m) => m === 'overclock_module_t3').length}
                activeLabel="Attached"
              />

              <EquipmentCard
                icon={<span className="text-xl">🏭</span>}
                iconBg="bg-cyan-950/80"
                iconBorder="border-cyan-500/50"
                title="T1 Auto-Fabrication Module"
                subtitle="Dedicated Auto-Synthesis Lane (50% Speed • 6 kW)"
                stockCount={inv.auto_fabrication_t1_inv || 0}
                activeCount={(autoFabricatorLanes || []).filter((l) => (l.tier || 1) === 1).length}
                activeLabel="Attached"
              />

              <EquipmentCard
                icon={<span className="text-xl">🏭</span>}
                iconBg="bg-cyan-950/80"
                iconBorder="border-cyan-500/50"
                title="T2 Auto-Fabrication Module"
                subtitle="Dedicated Auto-Synthesis Lane (100% Speed • 10 kW)"
                stockCount={(inv.auto_fabrication_t2_inv || 0) + (inv.auto_fabricators_inv || 0)}
                activeCount={(autoFabricatorLanes || []).filter((l) => l.tier === 2).length}
                activeLabel="Attached"
              />

              <EquipmentCard
                icon={<span className="text-xl">🏭</span>}
                iconBg="bg-cyan-950/80"
                iconBorder="border-cyan-500/50"
                title="T3 Auto-Fabrication Module"
                subtitle="Dedicated Auto-Synthesis Lane (150% Speed • 14 kW)"
                stockCount={inv.auto_fabrication_t3_inv || 0}
                activeCount={(autoFabricatorLanes || []).filter((l) => l.tier === 3).length}
                activeLabel="Attached"
              />
            </div>
          </div>

          {/* SUB-HEADER 4: ROVER */}
          <div>
            <div className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5" />
                <span>Rover</span>
              </span>
              <span className="text-[11px] text-slate-400 font-normal">
                Modular outfitting modules attachable to chassis bays
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Storage Modules */}
              <EquipmentCard
                icon={<span className="text-xl">📦</span>}
                iconBg="bg-emerald-950/80"
                iconBorder="border-emerald-500/50"
                title="T1 Storage Module"
                subtitle="Modular Cargo Bin (+2.5 kg Payload • 4 kW)"
                stockCount={inv.rover_modules.storage_1 || 0}
                activeCount={(inv.attached_rover_modules || []).filter((m) => m === 'storage_1').length}
                activeLabel="Attached"
              />

              <EquipmentCard
                icon={<span className="text-xl">📦</span>}
                iconBg="bg-emerald-950/80"
                iconBorder="border-emerald-500/50"
                title="T2 Storage Module"
                subtitle="Reinforced Cargo Module (+5.0 kg Payload • 7 kW)"
                stockCount={inv.rover_modules.storage_2 || 0}
                activeCount={(inv.attached_rover_modules || []).filter((m) => m === 'storage_2').length}
                activeLabel="Attached"
              />

              <EquipmentCard
                icon={<span className="text-xl">🚜</span>}
                iconBg="bg-emerald-950/80"
                iconBorder="border-emerald-500/50"
                title="T3 Storage Module"
                subtitle="Titanium Cargo Rack (+7.5 kg Payload • 10 kW)"
                stockCount={inv.rover_modules.storage_3 || 0}
                activeCount={(inv.attached_rover_modules || []).filter((m) => m === 'storage_3').length}
                activeLabel="Attached"
              />

              {/* Battery Modules */}
              <EquipmentCard
                icon={<Battery className="w-5 h-5 text-amber-400" />}
                iconBg="bg-amber-950/80"
                iconBorder="border-amber-500/50"
                title="T1 Battery Module"
                subtitle="Lead-Acid Energy Cell (+25 kWh Battery • 3 kW)"
                stockCount={inv.rover_modules.battery_1 || 0}
                activeCount={(inv.attached_rover_modules || []).filter((m) => m === 'battery_1').length}
                activeLabel="Attached"
              />

              <EquipmentCard
                icon={<Zap className="w-5 h-5 text-amber-400" />}
                iconBg="bg-amber-950/80"
                iconBorder="border-amber-500/50"
                title="T2 Battery Module"
                subtitle="Nickel-Iron Energy Pack (+50 kWh Battery • 5 kW)"
                stockCount={inv.rover_modules.battery_2 || 0}
                activeCount={(inv.attached_rover_modules || []).filter((m) => m === 'battery_2').length}
                activeLabel="Attached"
              />

              <EquipmentCard
                icon={<Sparkles className="w-5 h-5 text-amber-400" />}
                iconBg="bg-amber-950/80"
                iconBorder="border-amber-500/50"
                title="T3 Battery Module"
                subtitle="Solid-State Matrix (+75 kWh Battery • 7 kW)"
                stockCount={inv.rover_modules.battery_3 || 0}
                activeCount={(inv.attached_rover_modules || []).filter((m) => m === 'battery_3').length}
                activeLabel="Attached"
              />

              {/* Radar Modules */}
              <EquipmentCard
                icon={<Navigation className="w-5 h-5 text-sky-400" />}
                iconBg="bg-sky-950/80"
                iconBorder="border-sky-500/50"
                title="T1 Radar Module"
                subtitle="High-Frequency Scanner (+1 Step Vision • 5 kW)"
                stockCount={inv.rover_modules.radar_1 || 0}
                activeCount={(inv.attached_rover_modules || []).filter((m) => m === 'radar_1').length}
                activeLabel="Attached"
              />

              <EquipmentCard
                icon={<Navigation className="w-5 h-5 text-sky-400" />}
                iconBg="bg-sky-950/80"
                iconBorder="border-sky-500/50"
                title="T2 Radar Module"
                subtitle="Pulsed Radar Antenna (+2 Steps Vision • 8 kW)"
                stockCount={inv.rover_modules.radar_2 || 0}
                activeCount={(inv.attached_rover_modules || []).filter((m) => m === 'radar_2').length}
                activeLabel="Attached"
              />

              <EquipmentCard
                icon={<Navigation className="w-5 h-5 text-sky-400" />}
                iconBg="bg-sky-950/80"
                iconBorder="border-sky-500/50"
                title="T3 Radar Module"
                subtitle="Quantum Bio-Resonance Core (+3 Steps Vision • 12 kW)"
                stockCount={inv.rover_modules.radar_3 || 0}
                activeCount={(inv.attached_rover_modules || []).filter((m) => m === 'radar_3').length}
                activeLabel="Attached"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: GARDEN DECORATIONS */}
      {storageTab === 'DECOR' && (
        <div className="flex-1 space-y-2.5 mb-3 overflow-y-auto pr-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">🪨</span>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-slate-200">Zen Pebble Stepping Paths</h4>
                  <p className="text-[10px] text-emerald-400 font-semibold">+35% player movement speed when traversed</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-black text-slate-200">{inv.decor_pebble_path_inv || 0} in Stock</div>
                <span className="text-[10px] text-slate-400">
                  {deployedStructures.filter((s) => s.type === 'decor_pebble_path').length} Placed
                </span>
              </div>
            </div>

            <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-amber-500/40 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">🪨</span>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-slate-200">Zen Rock Formations</h4>
                  <p className="text-[10px] text-amber-400 font-semibold">+15% Level Up EXP in 3×3 halo (XP Boosted)</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-black text-amber-300">{getStructureInventoryCount(inv, 'zen_rock_formation')} in Stock</div>
                <span className="text-[10px] text-slate-400">
                  {deployedStructures.filter((s) => s.type === 'zen_rock_formation' || s.type === 'decor_rock_formation').length} Placed
                </span>
              </div>
            </div>

            <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-emerald-500/40 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">🎋</span>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-slate-200">Growing Bamboo Formations</h4>
                  <p className="text-[10px] text-emerald-400 font-semibold">+0.25s Pruning Effect in 3×3 halo (Quick Prune)</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-black text-emerald-300">{getStructureInventoryCount(inv, 'growing_bamboo_formation')} in Stock</div>
                <span className="text-[10px] text-slate-400">
                  {deployedStructures.filter((s) => s.type === 'growing_bamboo_formation' || s.type === 'decor_shrubbery_bush').length} Placed
                </span>
              </div>
            </div>

            <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-lime-500/40 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">🪴</span>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-slate-200">Asparagus Fern Balls</h4>
                  <p className="text-[10px] text-lime-400 font-semibold">+15% Chance for Extra Organic Waste on Level Up (Efficient Pruning)</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-black text-lime-300">{getStructureInventoryCount(inv, 'asparagus_fern_ball')} in Stock</div>
                <span className="text-[10px] text-slate-400">
                  {deployedStructures.filter((s) => s.type === 'asparagus_fern_ball').length} Placed
                </span>
              </div>
            </div>

            <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-emerald-600/40 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">🎋</span>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-slate-200">Bamboo Fences (Takegaki)</h4>
                  <p className="text-[10px] text-emerald-400 font-semibold">Boundary edge-placed takegaki • Physically cuts off halos</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-black text-emerald-300">{inv.bamboo_fence_inv || inv.decorations?.bambooFence || 0} in Stock</div>
                <span className="text-[10px] text-slate-400">
                  {deployedStructures.filter((s) => s.type === 'bamboo_fence').length} Placed
                </span>
              </div>
            </div>

            <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-cyan-500/40 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">🌊</span>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-slate-200">Water Features (Shishi-Odoshi)</h4>
                  <p className="text-[10px] text-cyan-400 font-semibold">+10% Hydration Growth Speed in 3×3 halo</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-black text-cyan-300">{(inv.water_feature_inv || inv.decor_woven_wall_inv || inv.decorations?.waterFeature || 0)} in Stock</div>
                <span className="text-[10px] text-slate-400">
                  {deployedStructures.filter((s) => s.type === 'water_feature' || s.type === 'decor_woven_wall').length} Placed
                </span>
              </div>
            </div>

            <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-red-500/40 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">⛩️</span>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-red-300">Torii Gate (3x1 / 1x3)</h4>
                  <p className="text-[10px] text-amber-400 font-semibold">3x1 / 1x3 Multi-Plot • Open Center Walkway</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-black text-red-300">{inv.torii_gate_inv || inv.decorations?.toriiGate || inv.decorations?.['torii_gate'] || 0} in Stock</div>
                <span className="text-[10px] text-slate-400">
                  {deployedStructures.filter((s) => s.type === 'torii_gate').length} Placed
                </span>
              </div>
            </div>

            <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-purple-500/40 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">🏛️</span>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-purple-300">Empty Pedestals</h4>
                  <p className="text-[10px] text-slate-400">Can Host Crystal Artifacts</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-black text-purple-400">{getStructureInventoryCount(inv, 'empty_crystal_pedestal')} in Stock</div>
                <span className="text-[10px] text-slate-400">
                  {deployedStructures.filter((s) => s.type === 'empty_crystal_pedestal' || s.type === 'crystal_pedestal').length} Placed
                </span>
              </div>
            </div>

            <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-amber-500/40 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">✨</span>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-amber-200">Seven Lucky Gods</h4>
                  <p className="text-[10px] text-amber-400 font-semibold">+0.01 Baseprice/lvl (Fortunate Blessings)</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-black text-amber-300">{getStructureInventoryCount(inv, 'seven_lucky_gods')} in Stock</div>
                <span className="text-[10px] text-slate-400">
                  {deployedStructures.filter((s) => s.type === 'seven_lucky_gods').length} Placed
                </span>
              </div>
            </div>

            <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-cyan-500/40 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">🏮</span>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-cyan-200">Stone Lanterns (Kasuga-dōrō)</h4>
                  <p className="text-[10px] text-cyan-400 font-semibold">+0.5% Zen Point Chance/lvl (Skilled Knowledge)</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-black text-cyan-300">{getStructureInventoryCount(inv, 'stone_lantern')} in Stock</div>
                <span className="text-[10px] text-slate-400">
                  {deployedStructures.filter((s) => s.type === 'stone_lantern').length} Placed
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-3 shrink-0">
        <div className="text-[11px] font-mono text-emerald-400/90 hidden sm:flex items-center gap-1.5">
          <span>🎮 [A/D / LB/RB] Switch Tabs • [W/S / ↑↓] Navigate • [E / A] Plant/Action</span>
        </div>
        <button
          onClick={onClose}
          className="flex-1 sm:flex-initial bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-2.5 px-6 rounded-xl transition-colors min-h-[40px] text-xs border border-slate-700">
          Close Inventory [Esc / B]
        </button>
      </div>
    </div>
  );
}
