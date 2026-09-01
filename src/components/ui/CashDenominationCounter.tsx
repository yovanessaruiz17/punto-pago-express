import React from 'react';
import { DenominationCount } from '../../types';
import { formatCOP } from '../../utils/formatters';
import { calculateCashCountTotal } from '../../utils/calculations';
import { Banknote, Coins, RotateCcw } from 'lucide-react';

interface CashDenominationCounterProps {
  denominations: DenominationCount[];
  onChange: (denominations: DenominationCount[]) => void;
  onTotalCalculated?: (total: number) => void;
}

export const CashDenominationCounter: React.FC<CashDenominationCounterProps> = ({
  denominations,
  onChange,
}) => {
  const handleCountChange = (index: number, count: number) => {
    const updated = [...denominations];
    updated[index] = {
      ...updated[index],
      count: Math.max(0, count || 0),
    };
    onChange(updated);
  };

  const handleReset = () => {
    const cleared = denominations.map((d) => ({ ...d, count: 0 }));
    onChange(cleared);
  };

  const total = calculateCashCountTotal(denominations);
  const billetes = denominations.filter((d) => d.type === 'billete');
  const monedas = denominations.filter((d) => d.type === 'moneda');

  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50/50 p-4 sm:p-5">
      <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
        <div>
          <h4 className="text-sm font-bold text-slate-900">Arqueo por Denominaciones</h4>
          <p className="text-xs text-slate-500">Ingresa la cantidad de billetes y monedas contados</p>
        </div>
        <button
          type="button"
          onClick={handleReset}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 active:scale-95 transition-all shadow-2xs"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reiniciar
        </button>
      </div>

      {/* Billetes */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
          <Banknote className="w-4 h-4 text-emerald-600" />
          <span>Billetes</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {billetes.map((item) => {
            const index = denominations.findIndex((d) => d.denomination === item.denomination);
            const subtotal = item.denomination * (item.count || 0);
            return (
              <div
                key={`denom-${item.denomination}`}
                className="flex flex-col gap-1 p-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs focus-within:border-emerald-500 transition-all"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800">{formatCOP(item.denomination)}</span>
                  <span className="text-[11px] font-semibold text-slate-400">
                    ={formatCOP(subtotal)}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-slate-400">x</span>
                  <input
                    type="number"
                    min="0"
                    value={item.count === 0 ? '' : item.count}
                    onChange={(e) => handleCountChange(index, parseInt(e.target.value, 10) || 0)}
                    placeholder="0"
                    className="w-full text-center font-bold text-sm text-slate-900 bg-slate-50 rounded-lg py-1 border border-slate-100 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Monedas */}
      <div className="space-y-2 pt-2 border-t border-slate-200/60">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
          <Coins className="w-4 h-4 text-amber-600" />
          <span>Monedas</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
          {monedas.map((item) => {
            const index = denominations.findIndex((d) => d.denomination === item.denomination);
            const subtotal = item.denomination * (item.count || 0);
            return (
              <div
                key={`denom-${item.denomination}`}
                className="flex flex-col gap-1 p-2 rounded-xl bg-white border border-slate-200 shadow-2xs focus-within:border-amber-500 transition-all"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800">{formatCOP(item.denomination)}</span>
                  <span className="text-[10px] font-semibold text-slate-400">
                    ={formatCOP(subtotal)}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-slate-400">x</span>
                  <input
                    type="number"
                    min="0"
                    value={item.count === 0 ? '' : item.count}
                    onChange={(e) => handleCountChange(index, parseInt(e.target.value, 10) || 0)}
                    placeholder="0"
                    className="w-full text-center font-bold text-xs text-slate-900 bg-slate-50 rounded-lg py-1 border border-slate-100 focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Total sum indicator */}
      <div className="flex items-center justify-between rounded-xl bg-slate-900 text-white px-4 py-3 shadow-sm">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
          Total Contado Físico
        </span>
        <span className="text-lg font-extrabold text-emerald-400">{formatCOP(total)} COP</span>
      </div>
    </div>
  );
};
