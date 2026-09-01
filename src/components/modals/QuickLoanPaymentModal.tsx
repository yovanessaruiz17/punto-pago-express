import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { MoneyInput } from '../ui/MoneyInput';
import { useApp } from '../../context/AppContext';
import { PaymentMethodCode, Loan } from '../../types';
import { formatCOP } from '../../utils/formatters';
import { HandCoins } from 'lucide-react';

interface QuickLoanPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedLoan?: Loan | null;
}

export const QuickLoanPaymentModal: React.FC<QuickLoanPaymentModalProps> = ({
  isOpen,
  onClose,
  selectedLoan,
}) => {
  const { loans, paymentMethods, registerLoanPayment, currentRegister, addToast } = useApp();

  const activeLoans = loans.filter((l) => l.status !== 'pagado');
  const [loanId, setLoanId] = useState<string>('');
  const [amount, setAmount] = useState<number>(0);
  const [paymentMethodCode, setPaymentMethodCode] = useState<PaymentMethodCode>('efectivo');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (selectedLoan) {
      setLoanId(selectedLoan.id);
      setAmount(selectedLoan.currentBalance);
    } else if (activeLoans.length > 0 && !loanId) {
      setLoanId(activeLoans[0].id);
      setAmount(activeLoans[0].currentBalance);
    }
  }, [selectedLoan, activeLoans, loanId]);

  const targetLoan = loans.find((l) => l.id === loanId);
  const activePaymentMethods = paymentMethods.filter((p) => p.isActive);

  const handleLoanChange = (id: string) => {
    setLoanId(id);
    const l = loans.find((item) => item.id === id);
    if (l) {
      setAmount(l.currentBalance);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentRegister) {
      addToast('error', 'Caja cerrada', 'Debes abrir una caja antes de registrar abonos.');
      return;
    }

    if (!targetLoan) {
      addToast('warning', 'Préstamo no seleccionado', 'Selecciona el préstamo a abonar.');
      return;
    }

    if (amount <= 0 || amount > targetLoan.currentBalance) {
      addToast('error', 'Monto inválido', `El monto debe ser entre $1 y el saldo actual (${formatCOP(targetLoan.currentBalance)})`);
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await registerLoanPayment({
        loanId: targetLoan.id,
        amount,
        paymentMethodCode,
        notes: notes.trim() || undefined,
      });

      if (success) {
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
      title="Registrar Abono / Pago de Préstamo"
      subtitle="Disminuye el saldo pendiente del préstamo"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Loan selector */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
            Seleccionar Préstamo Activo <span className="text-rose-500">*</span>
          </label>
          <select
            value={loanId}
            onChange={(e) => handleLoanChange(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 bg-white focus:outline-hidden focus:border-emerald-600 font-semibold"
          >
            {activeLoans.map((l) => (
              <option key={l.id} value={l.id}>
                {l.type === 'recibido' ? '🔴 DEUDA (Pagar a):' : '🟢 POR COBRAR (De):'}{' '}
                {l.counterpartName} — Saldo: {formatCOP(l.currentBalance)}
              </option>
            ))}
          </select>
        </div>

        {targetLoan && (
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
            <div className="flex justify-between text-slate-600">
              <span>Tipo:</span>
              <span className="font-bold text-slate-800">
                {targetLoan.type === 'recibido' ? 'Préstamo Recibido (Pasivo)' : 'Préstamo Entregado (Activo)'}
              </span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Monto Inicial:</span>
              <span className="font-semibold">{formatCOP(targetLoan.initialAmount)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Total Abonado a la fecha:</span>
              <span className="font-semibold text-emerald-700">{formatCOP(targetLoan.paidAmount)}</span>
            </div>
            <div className="flex justify-between text-slate-900 border-t border-slate-200 pt-1.5 font-bold">
              <span>Saldo Pendiente Actual:</span>
              <span className="text-sm text-indigo-700">{formatCOP(targetLoan.currentBalance)}</span>
            </div>
          </div>
        )}

        {/* Amount */}
        <MoneyInput
          id="payment-amount"
          label="Monto del Abono"
          value={amount}
          onChange={setAmount}
          placeholder="0"
          required
        />

        {/* Payment Method */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
            Método de Pago <span className="text-rose-500">*</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {activePaymentMethods.map((pm) => (
              <button
                key={pm.id}
                type="button"
                onClick={() => setPaymentMethodCode(pm.code)}
                className={`p-2 rounded-xl border text-center text-xs font-bold transition-all ${
                  paymentMethodCode === pm.code
                    ? 'border-emerald-600 bg-emerald-600 text-white shadow-xs'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                {pm.name}
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-1.5">
          <label className="block text-sm font-semibold text-slate-700">
            Observaciones (Opcional)
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ej: Pago parcial correspondiente a la semana 1"
            className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:outline-hidden focus:border-emerald-600"
          />
        </div>

        {/* Submit */}
        <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting || amount <= 0 || !targetLoan}
            className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold shadow-md shadow-emerald-600/20 disabled:opacity-50"
          >
            {isSubmitting ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <HandCoins className="w-4 h-4" />
            )}
            Aplicar Abono
          </button>
        </div>
      </form>
    </Modal>
  );
};
