import React, { useState, useMemo, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { MoneyInput } from '../ui/MoneyInput';
import { CashDenominationCounter } from '../ui/CashDenominationCounter';
import { useApp } from '../../context/AppContext';
import { formatCOP } from '../../utils/formatters';
import { DEFAULT_DENOMINATIONS, calculateCashCountTotal } from '../../utils/calculations';
import { DenominationCount } from '../../types';
import {
  Lock,
  Calculator,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Wallet,
  Layers,
  Sparkles,
} from 'lucide-react';

interface CloseCashModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DIFFERENCE_REASONS = [
  'Error de conteo físico en gaveta',
  'Diferencia en saldo de plataforma digital (reajuste o comisión)',
  'Movimiento no registrado en sistema',
  'Error al entregar cambio / vueltas',
  'Gasto menor de caja no registrado',
  'Diferencia en transferencia o comisión bancaria',
  'Ajuste por redondeo de monedas',
  'Otro motivo justificado',
];

export const CloseCashModal: React.FC<CloseCashModalProps> = ({ isOpen, onClose }) => {
  const { currentRegister, transactions, platforms, closeCashRegister, addToast } = useApp();

  const [activeTab, setActiveTab] = useState<'cash' | 'platforms'>('cash');
  const [denominations, setDenominations] = useState<DenominationCount[]>(DEFAULT_DENOMINATIONS);
  const [useDenominations, setUseDenominations] = useState<boolean>(true);
  const [manualCount, setManualCount] = useState<number>(0);
  const [platformBalancesState, setPlatformBalancesState] = useState<Record<string, number>>({});

  const [differenceReason, setDifferenceReason] = useState<string>(DIFFERENCE_REASONS[0]);
  const [differenceNotes, setDifferenceNotes] = useState<string>('');
  const [showFormulaBreakdown, setShowFormulaBreakdown] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Initialize platform balances when opened
  useEffect(() => {
    if (isOpen) {
      const initialMap: Record<string, number> = {};
      platforms.forEach((p) => {
        initialMap[p.id] = p.currentBalance;
      });
      setPlatformBalancesState(initialMap);
    }
  }, [isOpen, platforms]);

  // Calculate detailed physical formula components
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

  // Physical cash counted
  const physicalCount = useMemo(() => {
    return useDenominations ? calculateCashCountTotal(denominations) : manualCount;
  }, [useDenominations, denominations, manualCount]);

  const cashDifference = physicalCount - breakdown.expected;

  // Platform calculations
  const platformReconciliation = useMemo(() => {
    let totalExpected = 0;
    let totalActual = 0;

    const items = platforms.map((p) => {
      const exp = p.currentBalance;
      const act = platformBalancesState[p.id] ?? exp;
      const diff = act - exp;
      totalExpected += exp;
      totalActual += act;
      return {
        ...p,
        expectedBalance: exp,
        actualBalance: act,
        difference: diff,
      };
    });

    return {
      items,
      totalExpected,
      totalActual,
      totalDifference: totalActual - totalExpected,
    };
  }, [platforms, platformBalancesState]);

  // Global Liquidity Consolidation
  const globalExpected = breakdown.expected + platformReconciliation.totalExpected;
  const globalActual = physicalCount + platformReconciliation.totalActual;
  const globalDifference = globalActual - globalExpected;
  const hasAnyDifference = globalDifference !== 0 || cashDifference !== 0 || platformReconciliation.totalDifference !== 0;

  const handlePlatformBalanceChange = (platformId: string, val: number) => {
    setPlatformBalancesState((prev) => ({
      ...prev,
      [platformId]: Math.max(0, val),
    }));
  };

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

    if (hasAnyDifference && !differenceReason) {
      addToast('warning', 'Justificación requerida', 'Debes seleccionar el motivo de la diferencia encontrada');
      return;
    }

    setIsSubmitting(true);
    try {
      const platformPayload = Object.entries(platformBalancesState).map(([platformId, actualBalance]) => ({
        platformId,
        actualBalance,
      }));

      const success = await closeCashRegister(
        physicalCount,
        platformPayload,
        hasAnyDifference ? differenceReason : undefined,
        hasAnyDifference ? differenceNotes.trim() : undefined
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
      title="Cierre Diario de Caja & Plataformas"
      subtitle="Arqueo físico de efectivo y verificación de saldos en PTM, Bemovil y Punto de Pago"
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Consolidated Liquidity Summary Card */}
        <div className="p-4 rounded-2xl bg-slate-900 text-white shadow-md space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Gran Total Liquidez a Conciliar (Caja + Plataformas):
              </span>
              <div className="flex items-center gap-3 mt-0.5">
                <span className="text-2xl font-black text-emerald-400">
                  {formatCOP(globalActual)} COP
                </span>
                <span className="text-xs text-slate-400">
                  (Esperado: {formatCOP(globalExpected)})
                </span>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Diferencia Global Consolidada:
              </span>
              <span
                className={`text-base font-black ${
                  globalDifference === 0
                    ? 'text-emerald-400'
                    : globalDifference < 0
                    ? 'text-rose-400'
                    : 'text-amber-400'
                }`}
              >
                {globalDifference === 0
                  ? '✅ Cuadrada Exacta'
                  : globalDifference < 0
                  ? `🔴 Faltante ${formatCOP(Math.abs(globalDifference))}`
                  : `🟢 Sobrante +${formatCOP(globalDifference)}`}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
            <div className="p-2 rounded-xl bg-slate-800/80 border border-slate-700/60 flex justify-between items-center">
              <span>💵 Efectivo Gaveta:</span>
              <span className="font-bold text-white">{formatCOP(physicalCount)}</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-800/80 border border-slate-700/60 flex justify-between items-center">
              <span>📱 Plataformas ({platforms.length}):</span>
              <span className="font-bold text-teal-300">{formatCOP(platformReconciliation.totalActual)}</span>
            </div>
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
            <span>1. Arqueo Efectivo Físico ({formatCOP(physicalCount)})</span>
            {cashDifference !== 0 && (
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            )}
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
            <span>2. Plataformas Digitales ({formatCOP(platformReconciliation.totalActual)})</span>
            {platformReconciliation.totalDifference !== 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            )}
          </button>
        </div>

        {/* TAB 1: Cash Drawer Arqueo */}
        {activeTab === 'cash' && (
          <div className="space-y-3">
            {/* Expected Money Formula Accordion */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5 space-y-2">
              <div
                onClick={() => setShowFormulaBreakdown(!showFormulaBreakdown)}
                className="flex items-center justify-between cursor-pointer select-none"
              >
                <div className="flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-slate-700" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Efectivo Físico Esperado en Gaveta
                  </h4>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold text-indigo-700">
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
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-slate-600">
                    <div className="p-2 rounded-xl bg-white border border-slate-200">
                      <span className="text-slate-400 block text-[9px] uppercase font-bold">Base Inicial</span>
                      <span className="font-bold text-slate-800 text-xs">{formatCOP(breakdown.initial)}</span>
                    </div>
                    <div className="p-2 rounded-xl bg-white border border-slate-200">
                      <span className="text-emerald-600 block text-[9px] uppercase font-bold">+ Ingresos</span>
                      <span className="font-bold text-emerald-700 text-xs">{formatCOP(breakdown.incomes)}</span>
                    </div>
                    <div className="p-2 rounded-xl bg-white border border-slate-200">
                      <span className="text-indigo-600 block text-[9px] uppercase font-bold">+ Préstamos Rec.</span>
                      <span className="font-bold text-indigo-700 text-xs">{formatCOP(breakdown.loansReceived)}</span>
                    </div>
                    <div className="p-2 rounded-xl bg-white border border-slate-200">
                      <span className="text-rose-600 block text-[9px] uppercase font-bold">- Egresos</span>
                      <span className="font-bold text-rose-700 text-xs">{formatCOP(breakdown.expenses)}</span>
                    </div>
                    <div className="p-2 rounded-xl bg-white border border-slate-200">
                      <span className="text-amber-600 block text-[9px] uppercase font-bold">- Préstamos Ent.</span>
                      <span className="font-bold text-amber-700 text-xs">{formatCOP(breakdown.loansGiven)}</span>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-900 text-white border border-slate-800">
                      <span className="text-slate-300 block text-[9px] uppercase font-bold">= ESPERADO FÍSICO</span>
                      <span className="font-extrabold text-emerald-400 text-xs">{formatCOP(breakdown.expected)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Count Type Selector */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Conteo Físico en Billetes y Monedas
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

            {/* Cash Variance Indicator */}
            <div
              className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
                cashDifference === 0
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                  : cashDifference < 0
                  ? 'bg-rose-50 border-rose-200 text-rose-950'
                  : 'bg-amber-50 border-amber-200 text-amber-950'
              }`}
            >
              <span className="font-bold">
                {cashDifference === 0
                  ? '✅ Efectivo Físico Cuadrado'
                  : cashDifference < 0
                  ? `🔴 Faltante en Efectivo: ${formatCOP(Math.abs(cashDifference))}`
                  : `🟢 Sobrante en Efectivo: +${formatCOP(cashDifference)}`}
              </span>
              <span className="font-extrabold">{formatCOP(physicalCount)} / {formatCOP(breakdown.expected)}</span>
            </div>
          </div>
        )}

        {/* TAB 2: Digital Platforms Reconciliation (PTM, Bemovil, Punto de Pago, etc.) */}
        {activeTab === 'platforms' && (
          <div className="space-y-3">
            <div className="p-3 rounded-2xl bg-teal-50 border border-teal-200/80 text-teal-950 text-xs">
              <p className="font-bold text-teal-900 mb-0.5">
                Verificación de Saldos en Plataformas Digitales
              </p>
              <p className="text-teal-800 text-[11px]">
                Ingresa a tus plataformas (PTM, Bemovil, Punto de Pago) y digita el saldo exacto actual para cuadrar el cierre:
              </p>
            </div>

            <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
              {platformReconciliation.items.map((platform) => {
                const diff = platform.difference;
                return (
                  <div
                    key={platform.id}
                    className="p-3 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                          {platform.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-extrabold text-xs text-slate-900">
                            {platform.name}
                          </h4>
                          <span className="text-[10px] text-slate-400 font-semibold">
                            Esperado por sistema: <strong className="text-slate-700">{formatCOP(platform.expectedBalance)}</strong>
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span
                          className={`text-xs font-bold ${
                            diff === 0
                              ? 'text-emerald-600'
                              : diff < 0
                              ? 'text-rose-600'
                              : 'text-amber-600'
                          }`}
                        >
                          {diff === 0 ? '✅ Cuadrada' : diff < 0 ? `Dif: ${formatCOP(diff)}` : `Dif: +${formatCOP(diff)}`}
                        </span>
                      </div>
                    </div>

                    <MoneyInput
                      id={`close-plat-${platform.id}`}
                      label={`Saldo Real Verificado en ${platform.name}`}
                      value={platform.actualBalance}
                      onChange={(v) => handlePlatformBalanceChange(platform.id, v)}
                      placeholder="0"
                    />
                  </div>
                );
              })}
            </div>

            {/* Platforms Total Summary Pill */}
            <div
              className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
                platformReconciliation.totalDifference === 0
                  ? 'bg-teal-50 border-teal-200 text-teal-950'
                  : 'bg-amber-50 border-amber-200 text-amber-950'
              }`}
            >
              <span className="font-bold">
                {platformReconciliation.totalDifference === 0
                  ? '✅ Todas las plataformas cuadradas'
                  : `⚠️ Diferencia en plataformas: ${formatCOP(platformReconciliation.totalDifference)}`}
              </span>
              <span className="font-extrabold">
                {formatCOP(platformReconciliation.totalActual)} / {formatCOP(platformReconciliation.totalExpected)}
              </span>
            </div>
          </div>
        )}

        {/* Justification Box if any difference exists */}
        {hasAnyDifference && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50/70 p-4 space-y-3">
            <div className="flex items-center gap-2 font-bold text-xs text-rose-900">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>Diferencia detectada en el Arqueo (Justificación obligatoria)</span>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-rose-950 mb-1">
                Motivo del Descuadre <span className="text-rose-600">*</span>
              </label>
              <select
                required
                value={differenceReason}
                onChange={(e) => setDifferenceReason(e.target.value)}
                className="w-full rounded-xl border border-rose-200 bg-white px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-rose-400"
              >
                {DIFFERENCE_REASONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-rose-950 mb-1">
                Observaciones y Explicación del Cierre
              </label>
              <textarea
                rows={2}
                value={differenceNotes}
                onChange={(e) => setDifferenceNotes(e.target.value)}
                placeholder="Detalla si el descuadre fue en efectivo o en qué plataforma..."
                className="w-full rounded-xl border border-rose-200 bg-white p-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-rose-400"
              />
            </div>
          </div>
        )}

        {/* Submit / Cancel Actions */}
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
            disabled={isSubmitting || physicalCount < 0}
            className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md transition-all active:scale-95 disabled:opacity-50"
          >
            {isSubmitting ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Lock className="w-4 h-4" />
            )}
            Confirmar Arqueo y Cerrar Caja ({formatCOP(globalActual)})
          </button>
        </div>
      </form>
    </Modal>
  );
};
