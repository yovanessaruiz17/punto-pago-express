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
  const { currentRegister, setInitialCashBalance, isProcessing } = useApp();

  const [inputMode, setInputMode] = useState<'direct' | 'denominations'>('direct');
  const [totalAmount, setTotalAmount] = useState<number>(() => {
    if (defaultAmount !== undefined) return defaultAmount;
    if (currentRegister) return currentRegister.initialBalance;
    return 1000000;
  });

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
        setTotalAmount(defaultAmount);
      } else if (currentRegister) {
        setTotalAmount(currentRegister.initialBalance);
      } else {
        setTotalAmount(1000000);
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
    }
  }, [isOpen, currentRegister, defaultAmount]);

  // Calculate denominations total
  const calculatedDenominationsTotal = useMemo(() => {
    return Object.entries(counts).reduce((acc, [denom, count]) => {
      return acc + Number(denom) * (Number(count) || 0);
    }, 0);
  }, [counts]);

  // Update totalAmount when counting denominations
  const handleCountChange = (denom: number, value: string) => {
    const num = Math.max(0, parseInt(value, 10) || 0);
    const updated = { ...counts, [denom]: num };
    setCounts(updated);
    const newTotal = Object.entries(updated).reduce((acc, [d, c]) => acc + Number(d) * (Number(c) || 0), 0);
    setTotalAmount(newTotal);
  };

  const handleApplyPreset = (val: number) => {
    setTotalAmount(val);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (totalAmount < 0) return;

    const success = await setInitialCashBalance({
      amount: totalAmount,
      mode: currentRegister ? operationMode : 'set_base',
      reason: reason.trim() || 'Ajuste / Carga de dinero inicial en caja',
    });

    if (success) {
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Montar Dinero Inicial en Caja"
      subtitle="Establece el dinero base físico con el que inicias operaciones"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Status Callout Banner */}
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200/90 text-emerald-950 flex items-start gap-3">
          <div className="p-2 rounded-xl bg-emerald-600 text-white shrink-0 mt-0.5">
            <Wallet className="w-5 h-5" />
          </div>
          <div className="text-xs space-y-0.5">
            <p className="font-extrabold text-emerald-900 text-sm">
              {currentRegister ? 'Caja Activa Detectada' : 'Apertura de Nueva Caja'}
            </p>
            <p className="text-emerald-800 leading-relaxed">
              {currentRegister
                ? `La caja actual tiene un saldo base registrado de ${formatCOP(
                    currentRegister.initialBalance
                  )}. Puedes actualizar este saldo base o inyectar capital adicional.`
                : 'Al guardar, se abrirá automáticamente la caja con este saldo base para registrar tus servicios.'}
            </p>
          </div>
        </div>

        {/* Input Mode Selector */}
        <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200">
          <button
            type="button"
            onClick={() => setInputMode('direct')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
              inputMode === 'direct'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Banknote className="w-4 h-4 text-emerald-600" />
            <span>Monto Directo o Preajustado</span>
          </button>
          <button
            type="button"
            onClick={() => setInputMode('denominations')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
              inputMode === 'denominations'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calculator className="w-4 h-4 text-indigo-600" />
            <span>Contador de Billetes y Monedas</span>
          </button>
        </div>

        {/* Mode 1: Direct Input & Presets */}
        {inputMode === 'direct' ? (
          <div className="space-y-4">
            <MoneyInput
              id="initial-total-cash-input"
              label="Cantidad Total de Dinero Inicial (COP)"
              value={totalAmount}
              onChange={setTotalAmount}
              placeholder="0"
              required
              autoFocus
            />

            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
                Montos Rápidos Sugeridos
              </span>
              <div className="flex flex-wrap gap-2">
                {PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handleApplyPreset(preset)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                      totalAmount === preset
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    {formatCOP(preset)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Mode 2: Interactive Denominations Counter */
          <div className="space-y-3">
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
                  setTotalAmount(0);
                }}
                className="text-[11px] text-slate-500 hover:text-rose-600 flex items-center gap-1 font-semibold"
              >
                <RotateCcw className="w-3 h-3" />
                Reiniciar conteo
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-64 overflow-y-auto p-1">
              {DENOMINATIONS.map((d) => {
                const subtotal = d.value * (counts[d.value] || 0);
                return (
                  <div
                    key={d.value}
                    className={`p-2.5 rounded-xl border flex flex-col justify-between ${d.color}`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-extrabold text-xs">{d.label}</span>
                      <span className="text-[10px] font-semibold opacity-75">
                        {d.type === 'billete' ? 'Billete' : 'Moneda'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        placeholder="0"
                        value={counts[d.value] || ''}
                        onChange={(e) => handleCountChange(d.value, e.target.value)}
                        className="w-full text-center bg-white border border-slate-300 rounded-lg py-1 px-2 text-xs font-extrabold text-slate-900 focus:outline-emerald-600"
                      />
                    </div>

                    <span className="text-[10px] font-bold text-right mt-1 opacity-90">
                      = {formatCOP(subtotal)}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Calculated Counter Total Badge */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 text-white">
              <span className="text-xs font-bold text-slate-300">Total Físico Contado:</span>
              <span className="text-base font-black text-emerald-400">
                {formatCOP(calculatedDenominationsTotal)} COP
              </span>
            </div>
          </div>
        )}

        {/* Operation Mode (Only when register is currently open) */}
        {currentRegister && (
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
            <span className="text-xs font-bold text-slate-900 block">
              Tipo de acción para la caja activa:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <label
                className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all ${
                  operationMode === 'set_base'
                    ? 'bg-emerald-50 border-emerald-400 text-emerald-950 font-bold'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="operationMode"
                  value="set_base"
                  checked={operationMode === 'set_base'}
                  onChange={() => setOperationMode('set_base')}
                  className="mt-1 text-emerald-600 focus:ring-emerald-500"
                />
                <div className="text-xs">
                  <span className="block font-bold">Modificar Saldo Base Inicial</span>
                  <span className="text-[10px] text-slate-500 font-normal">
                    Reemplaza el saldo de apertura de la caja hoy
                  </span>
                </div>
              </label>

              <label
                className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all ${
                  operationMode === 'adjust_capital'
                    ? 'bg-indigo-50 border-indigo-400 text-indigo-950 font-bold'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="operationMode"
                  value="adjust_capital"
                  checked={operationMode === 'adjust_capital'}
                  onChange={() => setOperationMode('adjust_capital')}
                  className="mt-1 text-indigo-600 focus:ring-indigo-500"
                />
                <div className="text-xs">
                  <span className="block font-bold">Inyección / Aporte de Capital</span>
                  <span className="text-[10px] text-slate-500 font-normal">
                    Registra un ajuste contable sumando más efectivo
                  </span>
                </div>
              </label>
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
            placeholder="Ej. Conteo físico real al abrir el punto de pago / Base de hoy"
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
            disabled={isProcessing || totalAmount < 0}
            className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 active:scale-95 transition-all disabled:opacity-50"
          >
            {isProcessing ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Check className="w-4 h-4 stroke-[3]" />
            )}
            <span>Establecer Dinero Inicial ({formatCOP(totalAmount)})</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
