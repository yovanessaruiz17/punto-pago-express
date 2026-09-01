import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { MoneyInput } from '../ui/MoneyInput';
import { useApp } from '../../context/AppContext';
import { PaymentMethodCode, LoanType } from '../../types';
import { HandCoins, ArrowDownRight, ArrowUpRight, Info } from 'lucide-react';

interface QuickLoanModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: LoanType;
}

export const QuickLoanModal: React.FC<QuickLoanModalProps> = ({
  isOpen,
  onClose,
  defaultType = 'recibido',
}) => {
  const { paymentMethods, createLoan, currentRegister, addToast } = useApp();

  const [type, setType] = useState<LoanType>(defaultType);
  const [counterpartName, setCounterpartName] = useState<string>('');
  const [contactPhone, setContactPhone] = useState<string>('');
  const [amount, setAmount] = useState<number>(0);
  const [dueDate, setDueDate] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [paymentMethodCode, setPaymentMethodCode] = useState<PaymentMethodCode>('efectivo');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const activePaymentMethods = paymentMethods.filter((p) => p.isActive);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentRegister) {
      addToast('error', 'Caja cerrada', 'Debes abrir una caja antes de registrar préstamos.');
      return;
    }

    if (amount <= 0) {
      addToast('warning', 'Monto inválido', 'Ingresa un monto válido para el préstamo.');
      return;
    }

    if (!counterpartName.trim()) {
      addToast('warning', 'Nombre requerido', type === 'recibido' ? 'Ingresa el nombre del prestamista.' : 'Ingresa a quién le prestas el dinero.');
      return;
    }

    if (!reason.trim()) {
      addToast('warning', 'Motivo requerido', 'Ingresa el motivo del préstamo.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createLoan({
        type,
        counterpartName: counterpartName.trim(),
        contactPhone: contactPhone.trim() || undefined,
        initialAmount: amount,
        dueDate: dueDate || undefined,
        reason: reason.trim(),
        notes: notes.trim() || undefined,
        paymentMethodCode,
      });

      if (result) {
        setCounterpartName('');
        setContactPhone('');
        setAmount(0);
        setDueDate('');
        setReason('');
        setNotes('');
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
      title="Registrar Movimiento de Préstamo"
      subtitle="Inyecciones de liquidez, préstamos a terceros o deudas"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Toggle Type */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
          <button
            type="button"
            onClick={() => setType('recibido')}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all ${
              type === 'recibido'
                ? 'bg-white text-indigo-900 shadow-xs ring-1 ring-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ArrowDownRight className="w-4 h-4 text-indigo-600" />
            Préstamo Recibido (Deuda)
          </button>
          <button
            type="button"
            onClick={() => setType('entregado')}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all ${
              type === 'entregado'
                ? 'bg-white text-amber-900 shadow-xs ring-1 ring-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ArrowUpRight className="w-4 h-4 text-amber-600" />
            Dinero Prestado (Por Cobrar)
          </button>
        </div>

        {/* Financial Rule Notice */}
        <div
          className={`flex items-start gap-2.5 p-3 rounded-xl border text-xs leading-relaxed ${
            type === 'recibido'
              ? 'bg-indigo-50/70 border-indigo-200 text-indigo-950'
              : 'bg-amber-50/70 border-amber-200 text-amber-950'
          }`}
        >
          <Info className="w-4 h-4 shrink-0 mt-0.5" />
          <span>
            {type === 'recibido'
              ? '📌 Este dinero incrementa la liquidez en caja, pero NO se contabiliza como ganancia operativa.'
              : '📌 Este dinero disminuye la caja física, pero NO se contabiliza como gasto operativo.'}
          </span>
        </div>

        {/* Counterpart Name & Phone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              {type === 'recibido' ? 'Prestamista / Entidad' : 'Prestatario / Persona'}{' '}
              <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={counterpartName}
              onChange={(e) => setCounterpartName(e.target.value)}
              placeholder={type === 'recibido' ? 'Ej: Inversiones López' : 'Ej: Don Mario'}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-indigo-600"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Teléfono de Contacto (Opcional)
            </label>
            <input
              type="tel"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              placeholder="Ej: 3101234567"
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-indigo-600"
            />
          </div>
        </div>

        {/* Amount */}
        <MoneyInput
          id="loan-amount"
          label="Monto del Préstamo"
          value={amount}
          onChange={setAmount}
          placeholder="0"
          required
        />

        {/* Due Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Fecha Límite / Compromiso (Opcional)
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-900 focus:outline-hidden focus:border-indigo-600"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Método de Entrega / Recepción <span className="text-rose-500">*</span>
            </label>
            <select
              value={paymentMethodCode}
              onChange={(e) => setPaymentMethodCode(e.target.value as PaymentMethodCode)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 bg-white focus:outline-hidden focus:border-indigo-600 font-medium"
            >
              {activePaymentMethods.map((pm) => (
                <option key={pm.id} value={pm.code}>
                  {pm.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Reason / Motivo */}
        <div className="space-y-1.5">
          <label className="block text-sm font-semibold text-slate-700">
            Motivo del Préstamo <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={
              type === 'recibido'
                ? 'Ej: Liquidez para atender giros de la tarde'
                : 'Ej: Préstamo para cambio en efectivo'
            }
            className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-indigo-600"
          />
        </div>

        {/* Submit */}
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
            disabled={isSubmitting || amount <= 0 || !counterpartName.trim()}
            className={`flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-bold shadow-md transition-all active:scale-95 disabled:opacity-50 ${
              type === 'recibido'
                ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20'
                : 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20'
            }`}
          >
            {isSubmitting ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <HandCoins className="w-4 h-4" />
            )}
            Guardar Préstamo
          </button>
        </div>
      </form>
    </Modal>
  );
};
