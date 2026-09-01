import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { MoneyInput } from '../ui/MoneyInput';
import { useApp } from '../../context/AppContext';
import { PaymentMethodCode } from '../../types';
import { ArrowUpRight } from 'lucide-react';

interface QuickExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuickExpenseModal: React.FC<QuickExpenseModalProps> = ({ isOpen, onClose }) => {
  const { categories, paymentMethods, createTransaction, currentRegister, addToast } = useApp();

  const [categoryId, setCategoryId] = useState<string>('');
  const [amount, setAmount] = useState<number>(0);
  const [paymentMethodCode, setPaymentMethodCode] = useState<PaymentMethodCode>('efectivo');
  const [description, setDescription] = useState<string>('');
  const [providerName, setProviderName] = useState<string>('');
  const [reference, setReference] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const expenseCategories = categories.filter((c) => c.type === 'egreso' && c.isActive);
  const activePaymentMethods = paymentMethods.filter((p) => p.isActive);

  const handleCategorySelect = (id: string) => {
    setCategoryId(id);
    const selected = categories.find((c) => c.id === id);
    if (selected && !description) {
      setDescription(selected.name);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentRegister) {
      addToast('error', 'Caja cerrada', 'Debes abrir una caja antes de registrar egresos.');
      return;
    }

    if (amount <= 0) {
      addToast('warning', 'Monto inválido', 'Ingresa un valor mayor a cero.');
      return;
    }

    if (!description.trim()) {
      addToast('warning', 'Concepto requerido', 'Ingresa el concepto del egreso.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createTransaction({
        type: 'egreso',
        categoryId: categoryId || undefined,
        description: description.trim(),
        amount,
        paymentMethodCode,
        customerOrProvider: providerName.trim() || undefined,
        reference: reference.trim() || undefined,
      });

      if (result) {
        setCategoryId('');
        setAmount(0);
        setDescription('');
        setProviderName('');
        setReference('');
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
      title="Registrar Egreso Operativo"
      subtitle="Compras de saldo, insumos, servicios, nómina o mantenimiento"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Category Selector Pills */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
            Categoría del Egreso
          </label>
          <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1 bg-slate-50 rounded-xl border border-slate-200/80">
            {expenseCategories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategorySelect(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  categoryId === cat.id
                    ? 'bg-rose-600 text-white shadow-2xs font-bold'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Amount Input */}
        <MoneyInput
          id="expense-amount"
          label="Valor del Egreso"
          value={amount}
          onChange={setAmount}
          placeholder="0"
          required
          autoFocus
        />

        {/* Concept / Description */}
        <div className="space-y-1.5">
          <label className="block text-sm font-semibold text-slate-700">
            Concepto del Gasto <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ej: Compra de 2 rollos de papel térmico"
            className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-rose-600 focus:ring-2 focus:ring-rose-500/20"
          />
        </div>

        {/* Payment Method Selector */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
            Método de Pago Utilizado <span className="text-rose-500">*</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {activePaymentMethods.map((pm) => (
              <button
                key={pm.id}
                type="button"
                onClick={() => setPaymentMethodCode(pm.code)}
                className={`p-2.5 rounded-xl border text-center text-xs font-bold transition-all ${
                  paymentMethodCode === pm.code
                    ? 'border-rose-600 bg-rose-600 text-white shadow-xs'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                {pm.name}
              </button>
            ))}
          </div>
        </div>

        {/* Provider and Reference */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Proveedor / Destinatario (Opcional)
            </label>
            <input
              type="text"
              value={providerName}
              onChange={(e) => setProviderName(e.target.value)}
              placeholder="Ej: Papelería Sol Naciente"
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-rose-600"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              No. Comprobante / Factura (Opcional)
            </label>
            <input
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="Ej: FACT-1094"
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-rose-600"
            />
          </div>
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
            disabled={isSubmitting || amount <= 0 || !description.trim()}
            className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold shadow-md shadow-rose-600/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <ArrowUpRight className="w-4 h-4" />
            )}
            Registrar Egreso
          </button>
        </div>
      </form>
    </Modal>
  );
};
