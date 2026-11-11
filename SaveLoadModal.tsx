import React, { useState, useEffect } from 'react';
import {
  Save,
  Download,
  Trash2,
  Clock,
  Sparkles,
  Sprout,
  Check,
  AlertTriangle,
  X,
  HardDrive,
} from 'lucide-react';
import {
  SaveSlotId,
  SaveSlotMetadata,
  getAllSaveSlotsMetadata,
  SAVE_SLOT_KEYS,
} from './saveManager';
import { VerdureIcon } from './App';

interface SaveLoadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveToSlot: (slot: SaveSlotId) => void;
  onLoadFromSlot: (slot: SaveSlotId) => void;
  onDeleteSlot: (slot: SaveSlotId) => void;
  currentSaveSlot?: SaveSlotId;
}

export default function SaveLoadModal({
  isOpen,
  onClose,
  onSaveToSlot,
  onLoadFromSlot,
  onDeleteSlot,
  currentSaveSlot = 'autosave',
}: SaveLoadModalProps) {
  const [slots, setSlots] = useState<Record<SaveSlotId, SaveSlotMetadata | null>>({
    autosave: null,
    1: null,
    2: null,
    3: null,
  });

  const [confirmAction, setConfirmAction] = useState<{
    type: 'overwrite' | 'load' | 'delete';
    slotId: SaveSlotId;
  } | null>(null);

  const refreshSlots = () => {
    setSlots(getAllSaveSlotsMetadata());
  };

  useEffect(() => {
    if (isOpen) {
      refreshSlots();
      setConfirmAction(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const slotDefinitions: Array<{
    id: SaveSlotId;
    title: string;
    description: string;
    isAutosave: boolean;
    icon: string;
  }> = [
    {
      id: 'autosave',
      title: 'Autosave Slot',
      description: 'Automatically saved every 30 seconds while playing.',
      isAutosave: true,
      icon: '⏳',
    },
    {
      id: 1,
      title: 'Manual Save Slot 1',
      description: 'Permanent manual archive slot.',
      isAutosave: false,
      icon: '💾',
    },
    {
      id: 2,
      title: 'Manual Save Slot 2',
      description: 'Permanent manual archive slot.',
      isAutosave: false,
      icon: '💾',
    },
    {
      id: 3,
      title: 'Manual Save Slot 3',
      description: 'Permanent manual archive slot.',
      isAutosave: false,
      icon: '💾',
    },
  ];

  const handleConfirmExecute = () => {
    if (!confirmAction) return;
    const { type, slotId } = confirmAction;

    if (type === 'overwrite') {
      onSaveToSlot(slotId);
      refreshSlots();
    } else if (type === 'load') {
      onLoadFromSlot(slotId);
      onClose();
    } else if (type === 'delete') {
      onDeleteSlot(slotId);
      refreshSlots();
    }

    setConfirmAction(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm select-none animate-in fade-in duration-200">
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl bg-slate-900 border-2 border-slate-700 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col text-left text-white max-h-[92vh] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-2xl shadow">
              <HardDrive className="w-6 h-6 text-sky-400" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-100 flex items-center gap-2">
                <span>Save &amp; Load Archives</span>
              </h2>
              <p className="text-xs text-slate-400">
                Manage 3 manual archive slots plus automatic 30s cloud-like saves with offline simulation.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-slate-200 transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Confirmation Banner */}
        {confirmAction && (
          <div className="mb-3 p-3 rounded-2xl bg-amber-950/90 border border-amber-500/80 flex items-center justify-between gap-3 text-xs text-amber-200 shadow-lg animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
              <span>
                {confirmAction.type === 'overwrite' && `Overwrite Save Slot ${confirmAction.slotId} with your current sanctuary state?`}
                {confirmAction.type === 'load' && `Load Save Slot ${confirmAction.slotId}? Any unsaved active progress will be replaced.`}
                {confirmAction.type === 'delete' && `Delete Save Slot ${confirmAction.slotId}? This action cannot be undone.`}
              </span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => setConfirmAction(null)}
                className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition-all">
                Cancel
              </button>
              <button
                onClick={handleConfirmExecute}
                className={`px-3 py-1 rounded-xl font-black text-white shadow transition-all ${
                  confirmAction.type === 'delete'
                    ? 'bg-rose-600 hover:bg-rose-500'
                    : 'bg-amber-600 hover:bg-amber-500'
                }`}>
                Confirm
              </button>
            </div>
          </div>
        )}

        {/* 4 Save Slots Grid / List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {slotDefinitions.map((slotDef) => {
            const meta = slots[slotDef.id];
            const isPopulated = Boolean(meta && meta.savedAt > 0);

            return (
              <div
                key={slotDef.id}
                className={`p-3.5 sm:p-4 rounded-2xl border transition-all ${
                  isPopulated
                    ? 'bg-slate-950/80 border-slate-700 hover:border-slate-600 shadow-md'
                    : 'bg-slate-950/40 border-dashed border-slate-800/80'
                }`}>
                <div className="flex items-start justify-between gap-3 mb-2.5 flex-wrap">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl shrink-0">{slotDef.icon}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm sm:text-base text-slate-100">
                          {slotDef.title}
                        </h4>
                        {slotDef.isAutosave && (
                          <span className="bg-sky-950/80 text-sky-300 border border-sky-500/50 text-[10px] px-2 py-0.2 rounded-full font-bold">
                            Automatic 30s
                          </span>
                        )}
                        {currentSaveSlot === slotDef.id && isPopulated && (
                          <span className="bg-emerald-950/80 text-emerald-300 border border-emerald-500/50 text-[10px] px-2 py-0.2 rounded-full font-bold">
                            Active Slot
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span>{isPopulated ? meta!.savedAtFormatted : 'Empty Slot — No saved data'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Slot Action Buttons */}
                  <div className="flex items-center gap-1.5 ml-auto">
                    {/* Save Button (For manual slots, or trigger autosave) */}
                    {!slotDef.isAutosave && (
                      <button
                        onClick={() => {
                          if (isPopulated) {
                            setConfirmAction({ type: 'overwrite', slotId: slotDef.id });
                          } else {
                            onSaveToSlot(slotDef.id);
                            refreshSlots();
                          }
                        }}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3 py-1.5 rounded-xl shadow transition-all flex items-center gap-1 cursor-pointer active:scale-95">
                        <Save className="w-3.5 h-3.5" />
                        <span>Save</span>
                      </button>
                    )}

                    {/* Load Button */}
                    <button
                      disabled={!isPopulated}
                      onClick={() => {
                        setConfirmAction({ type: 'load', slotId: slotDef.id });
                      }}
                      className={`font-bold text-xs px-3 py-1.5 rounded-xl shadow transition-all flex items-center gap-1 ${
                        isPopulated
                          ? 'bg-sky-600 hover:bg-sky-500 text-white cursor-pointer active:scale-95'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                      }`}>
                      <Download className="w-3.5 h-3.5" />
                      <span>Load</span>
                    </button>

                    {/* Delete Button */}
                    {isPopulated && (
                      <button
                        onClick={() => {
                          setConfirmAction({ type: 'delete', slotId: slotDef.id });
                        }}
                        title="Clear / Delete Slot"
                        className="bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-300 border border-slate-700 hover:border-rose-500/50 p-1.5 rounded-xl transition-all cursor-pointer active:scale-95">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Populated Slot Details Badges */}
                {isPopulated && meta && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800 text-xs">
                    <div className="bg-slate-900/80 px-2.5 py-1.5 rounded-lg border border-slate-800 flex items-center justify-between">
                      <span className="text-slate-400">Botanist:</span>
                      <strong className="text-emerald-300 font-bold">Lv.{meta.playerLevel}</strong>
                    </div>

                    <div className="bg-slate-900/80 px-2.5 py-1.5 rounded-lg border border-slate-800 flex items-center justify-between">
                      <span className="text-slate-400">Verdure:</span>
                      <strong className="text-emerald-400 font-bold flex items-center gap-0.5">
                        <VerdureIcon className="w-3 h-3" />
                        <span>{meta.verdure.toFixed(2)}</span>
                      </strong>
                    </div>

                    <div className="bg-slate-900/80 px-2.5 py-1.5 rounded-lg border border-slate-800 flex items-center justify-between">
                      <span className="text-slate-400">Bonsais:</span>
                      <strong className="text-sky-300 font-bold">{meta.bonsaiCount} Trees</strong>
                    </div>

                    <div className="bg-slate-900/80 px-2.5 py-1.5 rounded-lg border border-slate-800 flex items-center justify-between">
                      <span className="text-slate-400">Zen Points:</span>
                      <strong className="text-pink-300 font-bold">🌸 {meta.zenPoints}</strong>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 shrink-0 mt-3 flex items-center justify-between text-xs text-slate-400">
          <span className="font-mono text-slate-400 text-[11px] hidden sm:inline">
            💡 Loading any save automatically calculates and simulates offline progression!
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold transition-all border border-slate-700 cursor-pointer ml-auto">
            Close [Esc]
          </button>
        </div>
      </div>
    </div>
  );
}
