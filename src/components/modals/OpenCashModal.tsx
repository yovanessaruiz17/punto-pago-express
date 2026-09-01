import React, { useState, useMemo } from 'react';
import { Modal } from '../ui/Modal';
import { MoneyInput } from '../ui/MoneyInput';
import { useApp } from '../../context/AppContext';
import { formatCOP } from '../../utils/formatters';
import { LockOpen, Wallet, Layers, Banknote, CheckCircle2 } from 'lucide-react';

interface OpenCashModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESETS = [200000, 300000, 500000, 1000000, 1500000, 2000000];

export const OpenCashModal: React.FC<OpenCashModalProps> = ({ isOpen, onClose }) => {
  const { openCashRegister, platforms } = useApp();
  const [initialBalance, setInitialBalance] = useState<number>(500000);
  const [platformBalancesState, setPlatformBalancesState] = useState<Record<string, number>>({});
  const [activeTab, setActiveTab] = useState<'all' | 'cash' | 'platforms'>('all');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Initialize platform state
  React.useEffect(() => {
    if (isOpen) {
      const initialMap: Record<string, number> = {};
      platforms.forEach((p) => {
        initialMap[p.id] = p.currentBalance;
      });
      setPlatformBalancesState(initialMap);
    }
  }, [isOpen, platforms]);

  const totalPlatformsInitial = useMemo(() => {
    return Object.values(platformBalancesState).reduce((sum: number, val: number) => sum + (val || 0), 0);
  }, [platformBalancesState]);

  const grandTotalLiquidity = useMemo(() => {
    return (initialBalance || 0) + totalPlatformsInitial;
  }, [initialBalance, totalPlatformsInitial]);

  const handlePlatformChange = (platformId: string, val: number) => {
    setPlatformBalancesState((prev) => ({
      ...prev,
      [platformId]: Math.max(0, val),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (initialBalance < 0) return;

    setIsSubmitting(true);
    try {
      const platformPayload = Object.entries(platformBalancesState).map(([platformId, balance]) => ({
        platformId,
        balance,
      }));

      const success = await openCashRegister(initialBalance, platformPayload);
      if (success) {
        onClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Apertura de Caja & Montar Dinero"
      subtitle="Registra el dinero físico inicial en gaveta y el saldo disponible en tus plataformas"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Consolidated Liquidity Header Banner */}
        <div className="p-4 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Gran Total de Liquidez al Abrir:
            </span>
            <span className="text-2xl font-black text-emerald-400">
              {formatCOP(grandTotalLiquidity)} COP
            </span>
          </div>
          <div className="text-left sm:text-right text-xs space-y-0.5 text-slate-300 font-medium">
            <div>💵 Efectivo en Gaveta: <span className="font-bold text-white">{formatCOP(initialBalance)}</span></div>
            <div>📱 Plataformas ({platforms.length}): <span className="font-bold text-teal-300">{formatCOP(totalPlatformsInitial)}</span></div>
          </div>
        </div>

        {/* Section 1: Physical Cash Base */}
        <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-xs text-emerald-950">
              <Wallet className="w-4 h-4 text-emerald-600" />
              <span>1. Base en Efectivo Físico (Gaveta / Caja)</span>
            </div>
            <span className="text-xs font-black text-emerald-700">{formatCOP(initialBalance)}</span>
          </div>

          <MoneyInput
            id="initial-balance"
            label="Monto en Billetes y Monedas"
            value={initialBalance}
            onChange={setInitialBalance}
            placeholder="0"
            required
            autoFocus
          />

          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[10px] font-bold uppercase text-slate-400 mr-1">Sugeridos:</span>
            {PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setInitialBalance(preset)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all ${
                  initialBalance === preset
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {formatCOP(preset)}
              </button>
            ))}
          </div>
        </div>

        {/* Section 2: Digital Platforms Input (PTM, Bemovil, Punto de Pago, etc.) */}
        <div className="p-4 rounded-2xl bg-teal-50/60 border border-teal-200/80 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-xs text-teal-950">
              <Layers className="w-4 h-4 text-teal-600" />
              <span>2. Saldo en Plataformas Digitales ({platforms.length})</span>
            </div>
            <span className="text-xs font-black text-teal-800">{formatCOP(totalPlatformsInitial)}</span>
          </div>

          <p className="text-[11px] text-teal-800">
            Verifica el saldo que tienes actualmente en cada plataforma (PTM, Bemovil, Punto de Pago) para iniciar con el control sincronizado:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto pr-1">
            {platforms.map((platform) => {
              const currentVal = platformBalancesState[platform.id] ?? platform.currentBalance;
              return (
                <div
                  key={platform.id}
                  className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-[10px]">
                        {platform.name.substring(0, 2).toUpperCase()}
                      </div>
                      <span className="font-extrabold text-xs text-slate-800 truncate max-w-[120px]">
                        {platform.name}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-semibold uppercase">{platform.code}</span>
                  </div>

                  <MoneyInput
                    id={`open-plat-${platform.id}`}
                    value={currentVal}
                    onChange={(val) => handlePlatformChange(platform.id, val)}
                    placeholder="0"
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting || initialBalance < 0}
            className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 active:scale-95 transition-all disabled:opacity-50"
          >
            {isSubmitting ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <LockOpen className="w-4 h-4" />
            )}
            Abrir Caja con Dinero Inicial ({formatCOP(grandTotalLiquidity)})
          </button>
        </div>
      </form>
    </Modal>
  );
};
