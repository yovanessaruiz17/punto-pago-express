import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { Modal } from '../components/ui/Modal';
import { MoneyInput } from '../components/ui/MoneyInput';
import { ReceiptModal } from '../components/modals/ReceiptModal';
import { VoidTransactionModal } from '../components/modals/VoidTransactionModal';
import { Transaction } from '../types';
import { formatCOP, formatDateTime } from '../utils/formatters';
import {
  ArrowDownLeft,
  Plus,
  Search,
  SlidersHorizontal,
  Eye,
  Ban,
  Tag,
  ToggleLeft,
  ToggleRight,
  Sparkles,
} from 'lucide-react';

interface IncomesPageProps {
  onOpenQuickIncome: () => void;
}

export const IncomesPage: React.FC<IncomesPageProps> = ({ onOpenQuickIncome }) => {
  const { transactions, services, currentRegister, addService, toggleServiceActive, currentUser } = useApp();

  const [activeTab, setActiveTab] = useState<'incomes' | 'services'>('incomes');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedServiceFilter, setSelectedServiceFilter] = useState<string>('all');
  const [selectedPaymentMethodFilter, setSelectedPaymentMethodFilter] = useState<string>('all');
  const [selectedReceiptTx, setSelectedReceiptTx] = useState<Transaction | null>(null);
  const [selectedVoidTx, setSelectedVoidTx] = useState<Transaction | null>(null);

  // New Service Modal
  const [isNewServiceModalOpen, setIsNewServiceModalOpen] = useState<boolean>(false);
  const [newServiceName, setNewServiceName] = useState<string>('');
  const [newServiceCategory, setNewServiceCategory] = useState<string>('');
  const [newServiceDesc, setNewServiceDesc] = useState<string>('');
  const [newServicePrice, setNewServicePrice] = useState<number>(0);

  // Filter income transactions
  const incomeTransactions = useMemo(() => {
    return transactions.filter((t) => {
      if (t.type !== 'ingreso') return false;

      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const matchesDesc = t.description.toLowerCase().includes(term);
        const matchesRef = t.reference?.toLowerCase().includes(term) || false;
        const matchesClient = t.customerOrProvider?.toLowerCase().includes(term) || false;
        if (!matchesDesc && !matchesRef && !matchesClient) return false;
      }

      if (selectedServiceFilter !== 'all' && t.serviceId !== selectedServiceFilter) {
        return false;
      }

      if (selectedPaymentMethodFilter !== 'all' && t.paymentMethodCode !== selectedPaymentMethodFilter) {
        return false;
      }

      return true;
    });
  }, [transactions, searchTerm, selectedServiceFilter, selectedPaymentMethodFilter]);

  const totalIncomesSum = useMemo(() => {
    return incomeTransactions
      .filter((t) => !t.isVoided)
      .reduce((sum, t) => sum + t.amount, 0);
  }, [incomeTransactions]);

  const handleCreateService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServiceName.trim()) return;

    addService({
      name: newServiceName.trim(),
      category: newServiceCategory.trim() || 'General',
      description: newServiceDesc.trim() || 'Servicio de caja',
      defaultPrice: newServicePrice,
      isActive: true,
    });

    setNewServiceName('');
    setNewServiceCategory('');
    setNewServiceDesc('');
    setNewServicePrice(0);
    setIsNewServiceModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Gestión de Ingresos & Servicios
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Control de recaudos operativos, facturación, recargas, giros y comisiones
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'incomes' ? (
            <button
              type="button"
              onClick={onOpenQuickIncome}
              disabled={!currentRegister}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs active:scale-95 transition-all disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              Registrar Ingreso
            </button>
          ) : (
            currentUser.role === 'admin' && (
              <button
                type="button"
                onClick={() => setIsNewServiceModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4" />
                Nuevo Servicio
              </button>
            )
          )}
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab('incomes')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'incomes'
              ? 'border-emerald-600 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <ArrowDownLeft className="w-4 h-4" />
          <span>Historial de Ingresos ({incomeTransactions.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('services')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'services'
              ? 'border-emerald-600 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Tag className="w-4 h-4" />
          <span>Catálogo de Servicios ({services.length})</span>
        </button>
      </div>

      {activeTab === 'incomes' ? (
        <div className="space-y-4">
          {/* Summary Banner & Filters */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-emerald-100 text-emerald-700">
                <ArrowDownLeft className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-slate-400 font-semibold block uppercase">
                  Total Ingresos Filtrados
                </span>
                <span className="text-xl font-extrabold text-slate-900">
                  {formatCOP(totalIncomesSum)} COP
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Search input */}
              <div className="relative min-w-[200px]">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar por concepto, cliente..."
                  className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:border-emerald-600"
                />
              </div>

              {/* Service filter */}
              <select
                value={selectedServiceFilter}
                onChange={(e) => setSelectedServiceFilter(e.target.value)}
                className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden font-medium"
              >
                <option value="all">Todos los servicios</option>
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>

              {/* Payment method filter */}
              <select
                value={selectedPaymentMethodFilter}
                onChange={(e) => setSelectedPaymentMethodFilter(e.target.value)}
                className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden font-medium"
              >
                <option value="all">Todos los métodos</option>
                <option value="efectivo">Efectivo</option>
                <option value="nequi">Nequi</option>
                <option value="daviplata">Daviplata</option>
                <option value="bancolombia">Bancolombia</option>
                <option value="tarjeta">Tarjeta</option>
              </select>
            </div>
          </div>

          {/* Income Table */}
          {incomeTransactions.length === 0 ? (
            <EmptyState
              title="No se encontraron ingresos"
              description="No hay ingresos registrados con los filtros seleccionados."
              actionLabel="Registrar nuevo ingreso"
              onAction={onOpenQuickIncome}
            />
          ) : (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Fecha / Hora</th>
                      <th className="py-3 px-4">Servicio / Concepto</th>
                      <th className="py-3 px-4">Método</th>
                      <th className="py-3 px-4">Cajero / Usuario</th>
                      <th className="py-3 px-4 text-right">Monto</th>
                      <th className="py-3 px-4 text-center">Estado</th>
                      <th className="py-3 px-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {incomeTransactions.map((tx) => (
                      <tr
                        key={tx.id}
                        className={`hover:bg-slate-50/60 transition-colors ${
                          tx.isVoided ? 'bg-slate-50/50 opacity-60' : ''
                        }`}
                      >
                        <td className="py-3 px-4 whitespace-nowrap font-medium text-slate-500">
                          {formatDateTime(tx.createdAt)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{tx.description}</div>
                          {tx.reference && (
                            <span className="text-[10px] text-slate-400">Ref: {tx.reference}</span>
                          )}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 font-semibold text-[11px] text-slate-700">
                            {tx.paymentMethodName}
                          </span>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap font-medium">{tx.userName}</td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <span
                            className={`font-extrabold text-sm ${
                              tx.isVoided ? 'line-through text-slate-400' : 'text-emerald-700'
                            }`}
                          >
                            +{formatCOP(tx.amount)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          {tx.isVoided ? (
                            <Badge variant="rose" size="sm">
                              Anulado
                            </Badge>
                          ) : (
                            <Badge variant="emerald" size="sm">
                              Activo
                            </Badge>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => setSelectedReceiptTx(tx)}
                              className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                              title="Ver Comprobante"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {!tx.isVoided && (
                              <button
                                type="button"
                                onClick={() => setSelectedVoidTx(tx)}
                                className="p-1.5 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                                title="Anular Movimiento"
                              >
                                <Ban className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Services Catalog Tab */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((srv) => (
            <div
              key={srv.id}
              className={`rounded-2xl border p-5 bg-white space-y-3 transition-all ${
                srv.isActive ? 'border-slate-200 shadow-2xs' : 'border-slate-100 opacity-60 bg-slate-50'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-bold text-sm text-slate-900">{srv.name}</h4>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md mt-1 inline-block">
                    {srv.category}
                  </span>
                </div>

                {currentUser.role === 'admin' && (
                  <button
                    type="button"
                    onClick={() => toggleServiceActive(srv.id)}
                    className="text-slate-400 hover:text-slate-700"
                    title={srv.isActive ? 'Desactivar servicio' : 'Activar servicio'}
                  >
                    {srv.isActive ? (
                      <ToggleRight className="w-6 h-6 text-emerald-600" />
                    ) : (
                      <ToggleLeft className="w-6 h-6 text-slate-300" />
                    )}
                  </button>
                )}
              </div>

              <p className="text-xs text-slate-500 leading-relaxed min-h-[36px]">
                {srv.description || 'Sin descripción'}
              </p>

              <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
                <span className="text-slate-400 font-medium">Precio sugerido:</span>
                <span className="font-extrabold text-slate-900">
                  {srv.defaultPrice && srv.defaultPrice > 0 ? formatCOP(srv.defaultPrice) : 'Variable'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Service Modal */}
      <Modal
        isOpen={isNewServiceModalOpen}
        onClose={() => setIsNewServiceModalOpen(false)}
        title="Crear Nuevo Servicio"
        subtitle="Agrega un servicio al catálogo del punto de pago"
        maxWidth="md"
      >
        <form onSubmit={handleCreateService} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Nombre del Servicio <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={newServiceName}
              onChange={(e) => setNewServiceName(e.target.value)}
              placeholder="Ej: Impresión de RUT o Certificados"
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:outline-hidden focus:border-emerald-600"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Categoría
            </label>
            <input
              type="text"
              value={newServiceCategory}
              onChange={(e) => setNewServiceCategory(e.target.value)}
              placeholder="Ej: Documentación y Trámites"
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:outline-hidden focus:border-emerald-600"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Descripción
            </label>
            <textarea
              rows={2}
              value={newServiceDesc}
              onChange={(e) => setNewServiceDesc(e.target.value)}
              placeholder="Detalles sobre cómo se atiende este servicio..."
              className="w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-900 focus:outline-hidden focus:border-emerald-600"
            />
          </div>

          <MoneyInput
            id="service-price"
            label="Precio Fijo o Base Sugerido (Opcional)"
            value={newServicePrice}
            onChange={setNewServicePrice}
            placeholder="0"
          />

          <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsNewServiceModalOpen(false)}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!newServiceName.trim()}
              className="flex-1 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold shadow-md shadow-emerald-600/20 disabled:opacity-50"
            >
              Guardar Servicio
            </button>
          </div>
        </form>
      </Modal>

      {/* Modals for Receipt & Void */}
      <ReceiptModal
        isOpen={Boolean(selectedReceiptTx)}
        onClose={() => setSelectedReceiptTx(null)}
        transaction={selectedReceiptTx}
      />
      <VoidTransactionModal
        isOpen={Boolean(selectedVoidTx)}
        onClose={() => setSelectedVoidTx(null)}
        transaction={selectedVoidTx}
      />
    </div>
  );
};
