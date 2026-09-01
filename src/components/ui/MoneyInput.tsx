import React from 'react';
import { formatCOP, parseCOPInput } from '../../utils/formatters';

interface MoneyInputProps {
  id?: string;
  label?: string;
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  showQuickPills?: boolean;
  required?: boolean;
}

export const MoneyInput: React.FC<MoneyInputProps> = ({
  id,
  label,
  value,
  onChange,
  placeholder = '0',
  error,
  disabled = false,
  autoFocus = false,
  showQuickPills = true,
  required = false,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const num = parseCOPInput(raw);
    onChange(num);
  };

  const addAmount = (amount: number) => {
    onChange((value || 0) + amount);
  };

  const setFixedAmount = (amount: number) => {
    onChange(amount);
  };

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={id} className="block text-sm font-semibold text-slate-700">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      <div className="relative rounded-xl shadow-2xs">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
          <span className="text-lg font-bold text-slate-500">$</span>
        </div>
        <input
          id={id}
          type="text"
          inputMode="numeric"
          value={value ? formatCOP(value, false) : ''}
          onChange={handleChange}
          disabled={disabled}
          autoFocus={autoFocus}
          placeholder={placeholder}
          className={`block w-full rounded-xl border pl-9 pr-14 py-3 text-lg font-bold text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 transition-all ${
            error
              ? 'border-rose-300 bg-rose-50/40 focus:border-rose-500'
              : 'border-slate-200 bg-white focus:border-emerald-600'
          } ${disabled ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : ''}`}
        />
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-100 px-2 py-1 rounded-md">
            COP
          </span>
        </div>
      </div>

      {error && <p className="text-xs font-medium text-rose-600">{error}</p>}

      {showQuickPills && !disabled && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          <button
            type="button"
            onClick={() => addAmount(10000)}
            className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 active:scale-95 transition-all"
          >
            +10k
          </button>
          <button
            type="button"
            onClick={() => addAmount(20000)}
            className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 active:scale-95 transition-all"
          >
            +20k
          </button>
          <button
            type="button"
            onClick={() => addAmount(50000)}
            className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 active:scale-95 transition-all"
          >
            +50k
          </button>
          <button
            type="button"
            onClick={() => addAmount(100000)}
            className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 active:scale-95 transition-all"
          >
            +100k
          </button>
          <button
            type="button"
            onClick={() => addAmount(500000)}
            className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 active:scale-95 transition-all border border-emerald-200"
          >
            +500k
          </button>
          <button
            type="button"
            onClick={() => setFixedAmount(0)}
            className="text-xs font-medium px-2 py-1 rounded-lg text-slate-500 hover:bg-slate-100 active:scale-95 transition-all ml-auto"
          >
            Limpiar
          </button>
        </div>
      )}
    </div>
  );
};
