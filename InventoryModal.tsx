import React from 'react';
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
} from './bonsaiData';
import {gameAudio} from './utils/helper';
import {
  SanctuaryInventory,
  StoredPottedBonsai,
  StoredSapling,
  PlantedBonsai,
  DeployedStructure,
  getBonsaiGroupBadgeClass,
  getBonsaiStyleDef,
  calculateDonationValue,
  calculateBonsaiSellPrice,
  getStructureInventoryCount,
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
} from './types';

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
  stockCount,
  activeCount,
  activeLabel,
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
        </div>
      </div>
      <div className="shrink-0 px-2.5 py-1 rounded-xl bg-slate-950/90 border border-slate-700/80 flex items-center gap-1.5 font-mono text-xs shadow-sm">
        <span className={stockCount > 0 ? 'text-emerald-400 font-black' : 'text-slate-500 font-semibold'}>
          {stockCount} in Stock
        </span>
        <span className="text-slate-600 font-light">/</span>
        <span className={activeCount > 0 ? 'text-sky-300 font-bold' : 'text-slate-500 font-semibold'}>
          {activeCount} {activeLabel}
        </span>
      </div>
    </div>
  );
}

export interface InventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  inventory: SanctuaryInventory;
  storageTab: 'PLANTING' | 'MATERIALS' | 'EQUIPMENT' | 'DECOR';
  setStorageTab: (tab: 'PLANTING' | 'MATERIALS' | 'EQUIPMENT' | 'DECOR') => void;
  storedPottedBonsais: StoredPottedBonsai[];
  storedSaplings: StoredSapling[];
  seedlingList?: SeedlingItem[];
  plantedBonsais: PlantedBonsai[];
  deployedStructures: DeployedStructure[];
  installedCraftingArms: number;
  autoFabricatorLanesCount: number;
  onPlantStoredBonsai: (id: string) => void;
  onPlantSaplingClick: (sap: any) => void;
}

export default function InventoryModal({
  isOpen,
  onClose,
  inventory: inv,
  storageTab,
  setStorageTab,
  storedPottedBonsais,
  storedSaplings,
  seedlingList = [],
  plantedBonsais,
  deployedStructures,
  installedCraftingArms,
  autoFabricatorLanesCount,
  onPlantStoredBonsai,
  onPlantSaplingClick,
}: InventoryModalProps) {
  if (!isOpen) return null;

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
          <span>Decor ({(inv.decor_pebble_path_inv || 0) + (inv.decor_rock_formation_inv || 0) + (inv.decor_shrubbery_bush_inv || 0) + (inv.decor_woven_wall_inv || 0)})</span>
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
                  return (
                    <div
                      key={stored.id}
                      style={{borderColor: `${sMat.border}50`}}
                      className="bg-slate-900/80 border p-3 rounded-2xl flex flex-col justify-between gap-2.5 shadow hover:border-sky-500/50 transition-all">
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <div className="font-bold text-xs sm:text-sm text-slate-200 flex items-center gap-1.5 flex-wrap">
                            <span style={{backgroundColor: sDef.color}} className="w-3 h-3 rounded-full inline-block shadow-sm" />
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
                              className="text-[10px] px-2 py-0.5 rounded-full font-black border flex items-center gap-1">
                              <span>{sMat.kanji}</span>
                              <span>{sMat.name}</span>
                              <span className="opacity-80 font-mono">({sMat.multiplier}x)</span>
                            </span>
                            <span>{stored.name} (Lv.{stored.level} • {ba.total.toFixed(2)} BA)</span>
                          </div>
                          <button
                            onClick={() => onPlantStoredBonsai(stored.id)}
                            className="bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs px-2.5 py-1 rounded-xl transition-transform active:scale-95 shadow shrink-0">
                            Plant on Plot
                          </button>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1">
                          Style: <span className="text-emerald-400 font-medium">{getBonsaiStyleDef(stored.style).japanese}</span> • Shape: <span className="text-slate-300">{sDef.leafShapeName}</span> • BA: <span className="text-amber-300 font-bold font-mono">{ba.total.toFixed(2)} BA</span> • Donation: <span className="text-emerald-300 font-bold">+{calculateDonationValue(stored)} Verdure</span>
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
                          <span className="truncate">{seedling.name || sDef.name}</span>
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
              <div className="text-[10px] text-slate-500 mt-0.5">Fallen clippings (+1 per level up)</div>
            </div>

            <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-amber-500/30 col-span-2 sm:col-span-3">
              <div className="text-xs text-amber-300 font-semibold mb-1">🌾 Enriched Organic Compost</div>
              <div className="text-2xl font-black text-amber-300">{inv.organic_compost ?? inv.enrichedCompost ?? 0}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">High potency growth accelerator (-30s, +15 EXP) • Refine from Organic Waste</div>
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
                title="Compost Heap"
                subtitle="20 Waste Cap • Passive Decomposition"
                stockCount={getStructureInventoryCount(inv, 'tool_compost_heap')}
                activeCount={deployedStructures.filter((s) => s.type === 'tool_compost_heap').length}
                activeLabel="Deployed"
              />

              <EquipmentCard
                icon={<Droplets className="w-5 h-5 text-sky-400" />}
                iconBg="bg-sky-950/80"
                iconBorder="border-sky-500/50"
                title="Zen Stone Well"
                subtitle="3×3 Grid Groundwater Irrigation (20s)"
                stockCount={getStructureInventoryCount(inv, 'tool_garden_well')}
                activeCount={deployedStructures.filter((s) => s.type === 'tool_garden_well').length}
                activeLabel="Deployed"
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
                title="Basic Mist Automaton (Tier 1)"
                subtitle="1.0x Growth Speed • 2 kW Grid Drain"
                stockCount={inv.automatons_tier1 || 0}
                activeCount={plantedBonsais.filter((b) => b.automatonTier === 1).length}
                activeLabel="Deployed"
              />

              <EquipmentCard
                icon={<Zap className="w-5 h-5 text-purple-400" />}
                iconBg="bg-purple-950/80"
                iconBorder="border-purple-500/50"
                title="Advanced Pulsar Automaton (Tier 2)"
                subtitle="2.5x Growth Speed • 4 kW Grid Drain"
                stockCount={inv.automatons_tier2 || 0}
                activeCount={plantedBonsais.filter((b) => b.automatonTier === 2).length}
                activeLabel="Deployed"
              />

              <EquipmentCard
                icon={<Sparkles className="w-5 h-5 text-amber-400" />}
                iconBg="bg-amber-950/80"
                iconBorder="border-amber-500/50"
                title="Master Hydro-Automaton (Tier 3)"
                subtitle="5.0x Ultra Speed • 7 kW Grid Drain"
                stockCount={inv.automatons_tier3 || 0}
                activeCount={plantedBonsais.filter((b) => b.automatonTier === 3).length}
                activeLabel="Deployed"
              />
            </div>
          </div>

          {/* SUB-HEADER 3: WORKBENCH */}
          <div>
            <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5" />
                <span>Workbench</span>
              </span>
              <span className="text-[11px] text-slate-400 font-normal">
                Modular assembly arms and continuous synthesis lanes
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <EquipmentCard
                icon={<Wrench className="w-5 h-5 text-sky-400" />}
                iconBg="bg-sky-950/80"
                iconBorder="border-sky-500/50"
                title="Crafting Assembly Arms"
                subtitle="+1 Queue Slot • +25% Speed (3 kW)"
                stockCount={inv.crafting_automatons_inv || 0}
                activeCount={installedCraftingArms}
                activeLabel="Attached"
              />

              <EquipmentCard
                icon={<span className="text-xl">🏭</span>}
                iconBg="bg-cyan-950/80"
                iconBorder="border-cyan-500/50"
                title="Auto-Fabrication Automatons"
                subtitle="Dedicated Auto-Synthesis Lane (10 kW)"
                stockCount={inv.auto_fabricators_inv || 0}
                activeCount={autoFabricatorLanesCount}
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
                title="Storage Module I"
                subtitle="Modular Cargo Bin (+2.5 kg Payload)"
                stockCount={inv.rover_modules.storage_1 || 0}
                activeCount={(inv.attached_rover_modules || []).filter((m) => m === 'storage_1').length}
                activeLabel="Attached"
              />

              <EquipmentCard
                icon={<span className="text-xl">📦</span>}
                iconBg="bg-emerald-950/80"
                iconBorder="border-emerald-500/50"
                title="Storage Module II"
                subtitle="Reinforced Cargo Module (+5.0 kg Payload)"
                stockCount={inv.rover_modules.storage_2 || 0}
                activeCount={(inv.attached_rover_modules || []).filter((m) => m === 'storage_2').length}
                activeLabel="Attached"
              />

              <EquipmentCard
                icon={<span className="text-xl">🚜</span>}
                iconBg="bg-emerald-950/80"
                iconBorder="border-emerald-500/50"
                title="Storage Module III"
                subtitle="Titanium Cargo Rack (+7.5 kg Payload)"
                stockCount={inv.rover_modules.storage_3 || 0}
                activeCount={(inv.attached_rover_modules || []).filter((m) => m === 'storage_3').length}
                activeLabel="Attached"
              />

              {/* Battery Modules */}
              <EquipmentCard
                icon={<Battery className="w-5 h-5 text-amber-400" />}
                iconBg="bg-amber-950/80"
                iconBorder="border-amber-500/50"
                title="Battery Module I"
                subtitle="Lead-Acid Energy Cell (+25 kWh Battery)"
                stockCount={inv.rover_modules.battery_1 || 0}
                activeCount={(inv.attached_rover_modules || []).filter((m) => m === 'battery_1').length}
                activeLabel="Attached"
              />

              <EquipmentCard
                icon={<Zap className="w-5 h-5 text-amber-400" />}
                iconBg="bg-amber-950/80"
                iconBorder="border-amber-500/50"
                title="Battery Module II"
                subtitle="Nickel-Iron Energy Pack (+50 kWh Battery)"
                stockCount={inv.rover_modules.battery_2 || 0}
                activeCount={(inv.attached_rover_modules || []).filter((m) => m === 'battery_2').length}
                activeLabel="Attached"
              />

              <EquipmentCard
                icon={<Sparkles className="w-5 h-5 text-amber-400" />}
                iconBg="bg-amber-950/80"
                iconBorder="border-amber-500/50"
                title="Battery Module III"
                subtitle="Solid-State Matrix (+75 kWh Battery)"
                stockCount={inv.rover_modules.battery_3 || 0}
                activeCount={(inv.attached_rover_modules || []).filter((m) => m === 'battery_3').length}
                activeLabel="Attached"
              />

              {/* Radar Modules */}
              <EquipmentCard
                icon={<Navigation className="w-5 h-5 text-sky-400" />}
                iconBg="bg-sky-950/80"
                iconBorder="border-sky-500/50"
                title="Radar Module I"
                subtitle="High-Frequency Scanner (+1 Step Vision)"
                stockCount={inv.rover_modules.radar_1 || 0}
                activeCount={(inv.attached_rover_modules || []).filter((m) => m === 'radar_1').length}
                activeLabel="Attached"
              />

              <EquipmentCard
                icon={<Navigation className="w-5 h-5 text-sky-400" />}
                iconBg="bg-sky-950/80"
                iconBorder="border-sky-500/50"
                title="Radar Module II"
                subtitle="Pulsed Radar Antenna (+2 Steps Vision)"
                stockCount={inv.rover_modules.radar_2 || 0}
                activeCount={(inv.attached_rover_modules || []).filter((m) => m === 'radar_2').length}
                activeLabel="Attached"
              />

              <EquipmentCard
                icon={<Navigation className="w-5 h-5 text-sky-400" />}
                iconBg="bg-sky-950/80"
                iconBorder="border-sky-500/50"
                title="Radar Module III"
                subtitle="Quantum Bio-Resonance Core (+3 Steps Vision)"
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
                  <p className="text-[10px] text-amber-400 font-semibold">+0.25s Pruning Effect in 3×3 halo (Quick Prune)</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-black text-amber-300">{inv.decor_rock_formation_inv || 0} in Stock</div>
                <span className="text-[10px] text-slate-400">
                  {deployedStructures.filter((s) => s.type === 'decor_rock_formation').length} Placed
                </span>
              </div>
            </div>

            <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-emerald-500/40 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">🌿</span>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-slate-200">Topiary Shrubbery Bushes</h4>
                  <p className="text-[10px] text-emerald-400 font-semibold">+15% Level Up EXP in 3×3 halo (XP Boosted)</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-black text-emerald-300">{inv.decor_shrubbery_bush_inv || 0} in Stock</div>
                <span className="text-[10px] text-slate-400">
                  {deployedStructures.filter((s) => s.type === 'decor_shrubbery_bush').length} Placed
                </span>
              </div>
            </div>

            <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-yellow-600/40 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">🎋</span>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-slate-200">Woven Wooden Lattice Walls</h4>
                  <p className="text-[10px] text-yellow-400 font-semibold">+10% Hydration Growth Speed in 3×3 halo (Private Growing)</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-black text-yellow-300">{inv.decor_woven_wall_inv || 0} in Stock</div>
                <span className="text-[10px] text-slate-400">
                  {deployedStructures.filter((s) => s.type === 'decor_woven_wall').length} Placed
                </span>
              </div>
            </div>

            <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-emerald-500/40 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">💎</span>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-emerald-300">Emerald Leaf Crystal Pedestals</h4>
                  <p className="text-[10px] text-slate-400">+1 Foliage Cultivation Potential per level</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-black text-emerald-400">{inv.crystal_pedestal_foliage_inv || 0} in Stock</div>
                <span className="text-[10px] text-slate-400">
                  {deployedStructures.filter((s) => s.type === 'crystal_pedestal_foliage').length} Placed
                </span>
              </div>
            </div>

            <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-amber-500/40 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">💎</span>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-amber-300">Amber Branch Crystal Pedestals</h4>
                  <p className="text-[10px] text-slate-400">+1 Branches Cultivation Potential per level</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-black text-amber-400">{inv.crystal_pedestal_branches_inv || 0} in Stock</div>
                <span className="text-[10px] text-slate-400">
                  {deployedStructures.filter((s) => s.type === 'crystal_pedestal_branches').length} Placed
                </span>
              </div>
            </div>

            <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-rose-500/40 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">💎</span>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-rose-300">Coral Trunk Crystal Pedestals</h4>
                  <p className="text-[10px] text-slate-400">+1 Trunk Cultivation Potential per level</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-black text-rose-400">{inv.crystal_pedestal_trunk_inv || 0} in Stock</div>
                <span className="text-[10px] text-slate-400">
                  {deployedStructures.filter((s) => s.type === 'crystal_pedestal_trunk').length} Placed
                </span>
              </div>
            </div>

            <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-blue-500/40 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">💎</span>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-blue-300">Azure Root Crystal Pedestals</h4>
                  <p className="text-[10px] text-slate-400">+1 Roots Cultivation Potential per level</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-black text-blue-400">{inv.crystal_pedestal_roots_inv || 0} in Stock</div>
                <span className="text-[10px] text-slate-400">
                  {deployedStructures.filter((s) => s.type === 'crystal_pedestal_roots').length} Placed
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={onClose}
        className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-2.5 rounded-xl transition-colors min-h-[40px] shrink-0 text-xs">
        Close Inventory
      </button>
    </div>
  );
}
