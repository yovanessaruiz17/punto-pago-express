import React, { useState, useEffect, useMemo } from 'react';
import { Modal } from '../ui/Modal';
import { MoneyInput } from '../ui/MoneyInput';
import { useApp } from '../../context/AppContext';
import { formatCOP } from '../../utils/formatters';
import {
  Wallet,
  Coins,
  Banknote,
  Sparkles,
  Calculator,
  Check,
  RotateCcw,
  ArrowRight,
  ShieldCheck,
  Info,
  Layers,
  TrendingUp,
} from 'lucide-react';

interface SetInitialCashModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultAmount?: number;
}

const DENOMINATIONS = [
  { value: 100000, label: '$100.000', type: 'billete', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  { value: 50000, label: '$50.000', type: 'billete', color: 'bg-purple-50 text-purple-800 border-purple-200' },
  { value: 20000, label: '$20.000', type: 'billete', color: 'bg-amber-50 text-amber-800 border-amber-200' },
  { value: 10000, label: '$10.000', type: 'billete', color: 'bg-rose-50 text-rose-800 border-rose-200' },
  { value: 5000, label: '$5.000', type: 'billete', color: 'bg-yellow-50 text-yellow-800 border-yellow-200' },
  { value: 2000, label: '$2.000', type: 'billete', color: 'bg-blue-50 text-blue-800 border-blue-200' },
  { value: 1000, label: '$1.000', type: 'moneda', color: 'bg-slate-100 text-slate-800 border-slate-300' },
  { value: 500, label: '$500', type: 'moneda', color: 'bg-slate-100 text-slate-800 border-slate-300' },
  { value: 200, label: '$200', type: 'moneda', color: 'bg-slate-100 text-slate-800 border-slate-300' },
  { value: 100, label: '$100', type: 'moneda', color: 'bg-slate-100 text-slate-800 border-slate-300' },
  { value: 50, label: '$50', type: 'moneda', color: 'bg-slate-100 text-slate-800 border-slate-300' },
];

const PRESETS = [200000, 500000, 1000000, 1500000, 2000000, 3000000, 5000000];

export const SetInitialCashModal: React.FC<SetInitialCashModalProps> = ({
  isOpen,
  onClose,
  defaultAmount,
}) => {
  const { currentRegister, platforms, setInitialCashBalance, isProcessing } = useApp();

  const [activeTab, setActiveTab] = useState<'cash' | 'platforms'>('cash');
  const [inputMode, setInputMode] = useState<'direct' | 'denominations'>('direct');
  const [totalCashAmount, setTotalCashAmount] = useState<number>(() => {
    if (defaultAmount !== undefined) return defaultAmount;
    if (currentRegister) return currentRegister.initialBalance;
    return 1000000;
  });

  const [platformBalancesState, setPlatformBalancesState] = useState<Record<string, number>>({});

  const [operationMode, setOperationMode] = useState<'set_base' | 'adjust_capital'>('set_base');
  const [reason, setReason] = useState<string>('');
  const [counts, setCounts] = useState<Record<number, number>>({
    100000: 0,
    50000: 0,
    20000: 0,
    10000: 0,
    5000: 0,
    2000: 0,
    1000: 0,
    500: 0,
    200: 0,
    100: 0,
    50: 0,
  });

  // Keep state synchronized when modal opens
  useEffect(() => {
    if (isOpen) {
      if (defaultAmount !== undefined) {
        setTotalCashAmount(defaultAmount);
      } else if (currentRegister) {
        setTotalCashAmount(currentRegister.initialBalance);
      } else {
        setTotalCashAmount(1000000);
      }
      setReason('');
      setCounts({
        100000: 0,
        50000: 0,
        20000: 0,
        10000: 0,
        5000: 0,
        2000: 0,
        1000: 0,
        500: 0,
        200: 0,
        100: 0,
        50: 0,
      });

      // Populate current platform balances
      const initialMap: Record<string, number> = {};
      platforms.forEach((p) => {
        initialMap[p.id] = p.currentBalance;
      });
      setPlatformBalancesState(initialMap);
    }
  }, [isOpen, currentRegister, defaultAmount, platforms]);

  // Calculate denominations total
  const calculatedDenominationsTotal = useMemo(() => {
    return Object.entries(counts).reduce((acc, [denom, count]) => {
      return acc + Number(denom) * (Number(count) || 0);
    }, 0);
  }, [counts]);

  // Total platforms initial sum
  const totalPlatformsInitial = useMemo(() => {
    return Object.values(platformBalancesState).reduce((sum: number, val: number) => sum + (val || 0), 0);
  }, [platformBalancesState]);

  // Combined Grand Total
  const grandTotalLiquidity = useMemo(() => {
    return totalCashAmount + totalPlatformsInitial;
  }, [totalCashAmount, totalPlatformsInitial]);

  // Update totalCashAmount when counting denominations
  const handleCountChange = (denom: number, value: string) => {
    const num = Math.max(0, parseInt(value, 10) || 0);
    const updated = { ...counts, [denom]: num };
    setCounts(updated);
    const newTotal = Object.entries(updated).reduce((acc, [d, c]) => acc + Number(d) * (Number(c) || 0), 0);
    setTotalCashAmount(newTotal);
  };

  const handleApplyPreset = (val: number) => {
    setTotalCashAmount(val);
  };

  const handlePlatformBalanceChange = (platformId: string, val: number) => {
    setPlatformBalancesState((prev) => ({
      ...prev,
      [platformId]: Math.max(0, val),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (totalCashAmount < 0) return;

    const platformPayload = Object.entries(platformBalancesState).map(([platformId, balance]) => ({
      platformId,
      balance,
    }));

    const success = await setInitialCashBalance({
      amount: totalCashAmount,
      mode: currentRegister ? operationMode : 'set_base',
      reason: reason.trim() || 'Montar dinero inicial en caja física y plataformas digitales',
      platformBalances: platformPayload,
    });

    if (success) {
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Montar Dinero Inicial (Caja & Plataformas)"
      subtitle="Establece el dinero base físico y el saldo que tienes en PTM, Bemovil y Punto de Pago"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Consolidated Grand Total Header Pill */}
        <div className="p-3.5 rounded-2xl bg-slate-900 text-white flex items-center justify-between shadow-md">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Gran Total de Dinero Inicial a Montar:
            </span>
            <span className="text-xl font-black text-emerald-400">
              {formatCOP(grandTotalLiquidity)} COP
            </span>
          </div>
          <div className="text-right text-[11px] text-slate-300 font-medium">
            <div>Caja Física: {formatCOP(totalCashAmount)}</div>
            <div className="text-teal-300">Plataformas: {formatCOP(totalPlatformsInitial)}</div>
          </div>
        </div>

        {/* Section Tabs: Cash Drawer vs Platforms */}
        <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200">
          <button
            type="button"
            onClick={() => setActiveTab('cash')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'cash'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Wallet className="w-4 h-4 text-emerald-600" />
            <span>1. Efectivo en Caja Física ({formatCOP(totalCashAmount)})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('platforms')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'platforms'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-4 h-4 text-teal-600" />
            <span>2. Plataformas Digitales ({formatCOP(totalPlatformsInitial)})</span>
          </button>
        </div>

        {/* TAB 1: Physical Cash */}
        {activeTab === 'cash' && (
          <div className="space-y-4">
            {/* Input Mode Selector */}
            <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200">
              <button
                type="button"
                onClick={() => setInputMode('direct')}
                className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  inputMode === 'direct'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Banknote className="w-3.5 h-3.5 text-emerald-600" />
                <span>Monto Directo</span>
              </button>
              <button
                type="button"
                onClick={() => setInputMode('denominations')}
                className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  inputMode === 'denominations'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Calculator className="w-3.5 h-3.5 text-indigo-600" />
                <span>Contador de Billetes y Monedas</span>
              </button>
            </div>

            {inputMode === 'direct' ? (
              <div className="space-y-3">
                <MoneyInput
                  id="initial-total-cash-input"
                  label="Efectivo Físico Inicial en Caja (COP)"
                  value={totalCashAmount}
                  onChange={setTotalCashAmount}
                  placeholder="0"
                  required
                />

                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
                    Montos Rápidos Sugeridos
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {PRESETS.map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => handleApplyPreset(preset)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all ${
                          totalCashAmount === preset
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {formatCOP(preset)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">
                    Conteo por denominación física (COP)
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setCounts({
                        100000: 0,
                        50000: 0,
                        20000: 0,
                        10000: 0,
                        5000: 0,
                        2000: 0,
                        1000: 0,
                        500: 0,
                        200: 0,
                        100: 0,
                        50: 0,
                      });
                      setTotalCashAmount(0);
                    }}
                    className="text-[11px] text-slate-500 hover:text-rose-600 flex items-center gap-1 font-semibold"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Reiniciar conteo
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-52 overflow-y-auto p-1">
                  {DENOMINATIONS.map((d) => {
                    const subtotal = d.value * (counts[d.value] || 0);
                    return (
                      <div
                        key={d.value}
                        className={`p-2 rounded-xl border flex flex-col justify-between ${d.color}`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-extrabold text-xs">{d.label}</span>
                          <span className="text-[9px] font-semibold opacity-75">
                            {d.type === 'billete' ? 'Billete' : 'Moneda'}
                          </span>
                        </div>

                        <input
                          type="number"
                          min="0"
                          placeholder="0"
                          value={counts[d.value] || ''}
                          onChange={(e) => handleCountChange(d.value, e.target.value)}
                          className="w-full text-center bg-white border border-slate-300 rounded-lg py-0.5 px-2 text-xs font-extrabold text-slate-900 focus:outline-emerald-600"
                        />

                        <span className="text-[9px] font-bold text-right mt-1 opacity-90">
                          = {formatCOP(subtotal)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Digital Platforms Balances (PTM, Bemovil, Punto de Pago, etc.) */}
        {activeTab === 'platforms' && (
          <div className="space-y-3">
            <div className="p-3 rounded-2xl bg-teal-50 border border-teal-200/80 text-teal-950 text-xs">
              <p className="font-bold text-teal-900 mb-0.5">
                Saldos Iniciales en Plataformas Digitales
              </p>
              <p className="text-teal-800 text-[11px]">
                Digita la cantidad exacta de dinero que tienes en cada plataforma en este momento.
              </p>
            </div>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {platforms.map((platform) => {
                const currentVal = platformBalancesState[platform.id] ?? platform.currentBalance;
                return (
                  <div
                    key={platform.id}
                    className="p-3 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                        {platform.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-extrabold text-xs text-slate-900">
                          {platform.name}
                        </h4>
                        <span className="text-[10px] text-slate-400 font-semibold">
                          Código: {platform.code}
                        </span>
                      </div>
                    </div>

                    <div className="w-full sm:w-56">
                      <MoneyInput
                        id={`init-plat-${platform.id}`}
                        value={currentVal}
                        onChange={(v) => handlePlatformBalanceChange(platform.id, v)}
                        placeholder="0"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Reason / Notes */}
        <div>
          <label htmlFor="reason-input" className="block text-xs font-bold text-slate-700 mb-1">
            Motivo / Observación (Opcional)
          </label>
          <input
            id="reason-input"
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Ej. Conteo inicial de dinero físico y saldo en plataformas al empezar"
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-hidden"
          />
        </div>

        {/* Actions Footer */}
        <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isProcessing || totalCashAmount < 0}
            className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 active:scale-95 transition-all disabled:opacity-50"
          >
            {isProcessing ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Check className="w-4 h-4 stroke-[3]" />
            )}
            <span>Guardar Todo ({formatCOP(grandTotalLiquidity)})</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
