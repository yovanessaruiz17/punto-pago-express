import React, { useState, useMemo } from 'react';
import { Modal } from '../ui/Modal';
import { MoneyInput } from '../ui/MoneyInput';
import { CashDenominationCounter } from '../ui/CashDenominationCounter';
import { useApp } from '../../context/AppContext';
import { formatCOP } from '../../utils/formatters';
import { DEFAULT_DENOMINATIONS, calculateCashCountTotal } from '../../utils/calculations';
import { DenominationCount } from '../../types';
import { Lock, Calculator, CheckCircle2, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';

interface CloseCashModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DIFFERENCE_REASONS = [
  'Error de conteo físico',
  'Movimiento no registrado en sistema',
  'Error al entregar cambio / vueltas',
  'Gasto menor de caja no registrado',
  'Diferencia en transferencia o comisión bancaria',
  'Ajuste por redondeo de monedas',
  'Otro motivo justificado',
];

export const CloseCashModal: React.FC<CloseCashModalProps> = ({ isOpen, onClose }) => {
  const { currentRegister, transactions, closeCashRegister, addToast } = useApp();

  const [denominations, setDenominations] = useState<DenominationCount[]>(DEFAULT_DENOMINATIONS);
  const [useDenominations, setUseDenominations] = useState<boolean>(true);
  const [manualCount, setManualCount] = useState<number>(0);
  const [differenceReason, setDifferenceReason] = useState<string>(DIFFERENCE_REASONS[0]);
  const [differenceNotes, setDifferenceNotes] = useState<string>('');
  const [showFormulaBreakdown, setShowFormulaBreakdown] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Calculate detailed formula components
  const breakdown = useMemo(() => {
    if (!currentRegister) {
      return {
        initial: 0,
        incomes: 0,
        loansReceived: 0,
        loansCollected: 0,
        expenses: 0,
        loansGiven: 0,
        loansPaid: 0,
        adjustments: 0,
        expected: 0,
      };
    }

    const regTx = transactions.filter(
      (t) => t.cashRegisterId === currentRegister.id && !t.isVoided
    );

    let incomes = 0;
    let loansReceived = 0;
    let loansCollected = 0;
    let expenses = 0;
    let loansGiven = 0;
    let loansPaid = 0;
    let adjustments = 0;

    for (const t of regTx) {
      switch (t.type) {
        case 'ingreso':
          incomes += t.amount;
          break;
        case 'prestamo_recibido':
          loansReceived += t.amount;
          break;
        case 'cobro_prestamo':
          loansCollected += t.amount;
          break;
        case 'egreso':
          expenses += t.amount;
          break;
        case 'prestamo_entregado':
          loansGiven += t.amount;
          break;
        case 'pago_prestamo':
          loansPaid += t.amount;
          break;
        case 'ajuste':
          adjustments += t.amount;
          break;
      }
    }

    const initial = currentRegister.initialBalance;
    const expected =
      initial +
      incomes +
      loansReceived +
      loansCollected -
      expenses -
      loansGiven -
      loansPaid +
      adjustments;

    return {
      initial,
      incomes,
      loansReceived,
      loansCollected,
      expenses,
      loansGiven,
      loansPaid,
      adjustments,
      expected,
    };
  }, [currentRegister, transactions]);

  const physicalCount = useMemo(() => {
    return useDenominations ? calculateCashCountTotal(denominations) : manualCount;
  }, [useDenominations, denominations, manualCount]);

  const difference = physicalCount - breakdown.expected;
  const hasDifference = difference !== 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentRegister) {
      addToast('error', 'Error', 'No hay caja abierta');
      return;
    }

    if (physicalCount < 0) {
      addToast('error', 'Error', 'Ingresa el monto del conteo físico');
      return;
    }

    if (hasDifference && !differenceReason) {
      addToast('warning', 'Justificación requerida', 'Debes seleccionar el motivo de la diferencia');
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await closeCashRegister(
        physicalCount,
        hasDifference ? differenceReason : undefined,
        hasDifference ? differenceNotes.trim() : undefined
      );

      if (success) {
        onClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!currentRegister) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Cierre Diario de Caja (Arqueo y Conciliación)"
      subtitle="Compara el dinero físico contado contra el dinero esperado por el sistema"
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Expected Money Formula Accordion */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-3">
          <div
            onClick={() => setShowFormulaBreakdown(!showFormulaBreakdown)}
            className="flex items-center justify-between cursor-pointer select-none"
          >
            <div className="flex items-center gap-2">
              <Calculator className="w-4 h-4 text-slate-700" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Fórmula de Dinero Esperado
              </h4>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-extrabold text-indigo-700">
                {formatCOP(breakdown.expected)} COP
              </span>
              {showFormulaBreakdown ? (
                <ChevronUp className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              )}
            </div>
          </div>

          {showFormulaBreakdown && (
            <div className="text-xs space-y-2 pt-2 border-t border-slate-200/80">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-slate-600">
                <div className="p-2 rounded-xl bg-white border border-slate-200">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Saldo Inicial</span>
                  <span className="font-bold text-slate-800">{formatCOP(breakdown.initial)}</span>
                </div>
                <div className="p-2 rounded-xl bg-white border border-slate-200">
                  <span className="text-emerald-600 block text-[10px] uppercase font-bold">+ Ingresos Servicios</span>
                  <span className="font-bold text-emerald-700">{formatCOP(breakdown.incomes)}</span>
                </div>
                <div className="p-2 rounded-xl bg-white border border-slate-200">
                  <span className="text-indigo-600 block text-[10px] uppercase font-bold">+ Préstamos Recibidos</span>
                  <span className="font-bold text-indigo-700">{formatCOP(breakdown.loansReceived)}</span>
                </div>
                <div className="p-2 rounded-xl bg-white border border-slate-200">
                  <span className="text-rose-600 block text-[10px] uppercase font-bold">- Egresos Operativos</span>
                  <span className="font-bold text-rose-700">{formatCOP(breakdown.expenses)}</span>
                </div>
                <div className="p-2 rounded-xl bg-white border border-slate-200">
                  <span className="text-amber-600 block text-[10px] uppercase font-bold">- Préstamos Entregados</span>
                  <span className="font-bold text-amber-700">{formatCOP(breakdown.loansGiven)}</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-900 text-white border border-slate-800">
                  <span className="text-slate-300 block text-[10px] uppercase font-bold">= DINERO ESPERADO</span>
                  <span className="font-extrabold text-emerald-400 text-sm">{formatCOP(breakdown.expected)}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Count Type Selector */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Conteo de Dinero Físico en Caja
          </label>
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => setUseDenominations(true)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                useDenominations
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Desglose de Billetes
            </button>
            <button
              type="button"
              onClick={() => {
                setUseDenominations(false);
                setManualCount(calculateCashCountTotal(denominations) || breakdown.expected);
              }}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                !useDenominations
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Total Directo
            </button>
          </div>
        </div>

        {useDenominations ? (
          <CashDenominationCounter
            denominations={denominations}
            onChange={setDenominations}
          />
        ) : (
          <MoneyInput
            id="manual-physical-count"
            label="Total Dinero Físico Contado"
            value={manualCount}
            onChange={setManualCount}
            placeholder="0"
            required
            autoFocus
          />
        )}

        {/* Difference & Variance Box (Reglas 15, 16 & 27) */}
        <div
          className={`rounded-2xl border p-4 transition-all ${
            difference === 0
              ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
              : difference < 0
              ? 'bg-rose-50 border-rose-200 text-rose-950'
              : 'bg-amber-50 border-amber-200 text-amber-950'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {difference === 0 ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              )}
              <span className="text-sm font-bold">
                {difference === 0
                  ? '✅ CAJA CUADRADA'
                  : difference < 0
                  ? `🔴 FALTANTE DE ${formatCOP(Math.abs(difference))}`
                  : `🟢 SOBRANTE DE ${formatCOP(difference)}`}
              </span>
            </div>

            <div className="text-right">
              <span className="text-xs opacity-75 block">Diferencia neta:</span>
              <span className="font-extrabold text-base">
                {difference > 0 ? `+${formatCOP(difference)}` : formatCOP(difference)} COP
              </span>
            </div>
          </div>

          {/* If difference exists, compulsory justification fields */}
          {hasDifference && (
            <div className="mt-4 pt-3 border-t border-current/10 space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1">
                  Motivo de la Diferencia <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={differenceReason}
                  onChange={(e) => setDifferenceReason(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-slate-400"
                >
                  {DIFFERENCE_REASONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1">
                  Observaciones y Explicación del Cierre
                </label>
                <textarea
                  rows={2}
                  value={differenceNotes}
                  onChange={(e) => setDifferenceNotes(e.target.value)}
                  placeholder="Detalla qué causó el descuadre y si se identificó al responsable..."
                  className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-slate-400"
                />
              </div>
            </div>
          )}
        </div>

        {/* Submit / Cancel Actions */}
        <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting || physicalCount < 0}
            className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold shadow-md transition-all active:scale-95 disabled:opacity-50"
          >
            {isSubmitting ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Lock className="w-4 h-4" />
            )}
            Confirmar y Cerrar Caja
          </button>
        </div>
      </form>
    </Modal>
  );
};
