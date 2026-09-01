import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { MoneyInput } from '../ui/MoneyInput';
import { useApp } from '../../context/AppContext';
import { PaymentMethodCode } from '../../types';
import { ArrowDownLeft, PlusCircle } from 'lucide-react';

interface QuickIncomeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuickIncomeModal: React.FC<QuickIncomeModalProps> = ({ isOpen, onClose }) => {
  const { services, paymentMethods, createTransaction, currentRegister, addToast } = useApp();

  const [serviceId, setServiceId] = useState<string>('');
  const [amount, setAmount] = useState<number>(0);
  const [paymentMethodCode, setPaymentMethodCode] = useState<PaymentMethodCode>('efectivo');
  const [description, setDescription] = useState<string>('');
  const [reference, setReference] = useState<string>('');
  const [customerName, setCustomerName] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleServiceSelect = (id: string) => {
    setServiceId(id);
    const selected = services.find((s) => s.id === id);
    if (selected) {
      setDescription(selected.name);
      if (selected.defaultPrice && selected.defaultPrice > 0) {
        setAmount(selected.defaultPrice);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentRegister) {
      addToast('error', 'Caja cerrada', 'Debes abrir una caja antes de registrar ingresos.');
      return;
    }

    if (amount <= 0) {
      addToast('warning', 'Monto inválido', 'Ingresa un valor mayor a cero.');
      return;
    }

    const finalDesc = description.trim() || services.find((s) => s.id === serviceId)?.name || 'Ingreso por servicio';

    setIsSubmitting(true);
    try {
      const result = await createTransaction({
        type: 'ingreso',
        serviceId: serviceId || undefined,
        description: finalDesc,
        amount,
        paymentMethodCode,
        reference: reference.trim() || undefined,
        customerOrProvider: customerName.trim() || undefined,
      });

      if (result) {
        // Reset form & close
        setServiceId('');
        setAmount(0);
        setDescription('');
        setReference('');
        setCustomerName('');
        onClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeServices = services.filter((s) => s.isActive);
  const activePaymentMethods = paymentMethods.filter((p) => p.isActive);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Registrar Ingreso Operativo"
      subtitle="Recaudos, facturas, recargas, giros y comisiones"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Quick Service Selection Pills */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
            Seleccionar Servicio
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {activeServices.map((srv) => (
              <button
                key={srv.id}
                type="button"
                onClick={() => handleServiceSelect(srv.id)}
                className={`flex flex-col text-left p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                  serviceId === srv.id
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <span className="font-bold truncate">{srv.name}</span>
                <span className="text-[10px] text-slate-500 font-normal truncate">
                  {srv.category}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Amount Input */}
        <MoneyInput
          id="income-amount"
          label="Valor del Servicio"
          value={amount}
          onChange={setAmount}
          placeholder="0"
          required
          autoFocus
        />

        {/* Payment Method Selector */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
            Método de Pago <span className="text-rose-500">*</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {activePaymentMethods.map((pm) => (
              <button
                key={pm.id}
                type="button"
                onClick={() => setPaymentMethodCode(pm.code)}
                className={`p-2.5 rounded-xl border text-center text-xs font-bold transition-all ${
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

        {/* Concept / Description */}
        <div className="space-y-1.5">
          <label className="block text-sm font-semibold text-slate-700">
            Detalle / Concepto
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ej: Pago factura de energía Enel #10294"
            className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>

        {/* Reference & Customer (Optional Row) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Referencia / No. Factura (Opcional)
            </label>
            <input
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="Ej: FAC-84920"
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-emerald-600"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Cliente (Opcional)
            </label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Ej: Juan Pérez"
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-emerald-600"
            />
          </div>
        </div>

        {/* Submit Button */}
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
            disabled={isSubmitting || amount <= 0}
            className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold shadow-md shadow-emerald-600/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <ArrowDownLeft className="w-4 h-4" />
            )}
            Registrar Ingreso
          </button>
        </div>
      </form>
    </Modal>
  );
};
