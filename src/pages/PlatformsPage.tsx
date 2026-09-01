import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { formatCOP } from '../utils/formatters';
import { DigitalPlatform } from '../types';
import { Modal } from '../components/ui/Modal';
import { MoneyInput } from '../components/ui/MoneyInput';
import {
  Layers,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  RefreshCw,
  Edit2,
  Trash2,
  ExternalLink,
  ShieldCheck,
  Search,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Wallet,
  Coins,
  History,
  Info,
  Sliders,
  DollarSign,
  Smartphone,
  CreditCard,
} from 'lucide-react';

export const PlatformsPage: React.FC = () => {
  const {
    platforms,
    platformTransactions,
    summary,
    currentRegister,
    addPlatform,
    updatePlatform,
    deletePlatform,
    togglePlatformActive,
    adjustPlatformBalance,
    transferBetweenCashAndPlatform,
    isProcessing,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterActiveOnly, setFilterActiveOnly] = useState<boolean>(false);

  // Modals state
  const [isNewPlatformModalOpen, setIsNewPlatformModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState<boolean>(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState<boolean>(false);
  const [activePlatform, setActivePlatform] = useState<DigitalPlatform | null>(null);

  // Form states for New / Edit Platform
  const [name, setName] = useState<string>('');
  const [code, setCode] = useState<string>('');
  const [initialBalance, setInitialBalance] = useState<number>(0);
  const [portalUrl, setPortalUrl] = useState<string>('');
  const [category, setCategory] = useState<string>('recargas_facturas');
  const [commissionRate, setCommissionRate] = useState<number>(0);
  const [description, setDescription] = useState<string>('');
  const [colorTheme, setColorTheme] = useState<string>('blue');

  // Form state for Balance Adjust
  const [newAdjustBalance, setNewAdjustBalance] = useState<number>(0);
  const [adjustReason, setAdjustReason] = useState<string>('');

  // Form state for Cash <-> Platform Transfer
  const [transferPlatformId, setTransferPlatformId] = useState<string>('');
  const [transferDirection, setTransferDirection] = useState<'cash_to_platform' | 'platform_to_cash'>('cash_to_platform');
  const [transferAmount, setTransferAmount] = useState<number>(100000);
  const [transferReference, setTransferReference] = useState<string>('');
  const [transferDescription, setTransferDescription] = useState<string>('');

  // Filtered platforms
  const filteredPlatforms = useMemo(() => {
    return platforms.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesActive = filterActiveOnly ? p.isActive : true;
      return matchesSearch && matchesActive;
    });
  }, [platforms, searchTerm, filterActiveOnly]);

  const handleOpenCreateModal = () => {
    setName('');
    setCode('');
    setInitialBalance(0);
    setPortalUrl('');
    setCategory('recargas_facturas');
    setCommissionRate(0);
    setDescription('');
    setColorTheme('blue');
    setIsNewPlatformModalOpen(true);
  };

  const handleOpenEditModal = (plat: DigitalPlatform) => {
    setActivePlatform(plat);
    setName(plat.name);
    setCode(plat.code);
    setInitialBalance(plat.currentBalance);
    setPortalUrl(plat.portalUrl || '');
    setCategory(plat.category || 'recargas_facturas');
    setCommissionRate(plat.commissionRate || 0);
    setDescription(plat.description || '');
    setColorTheme(plat.colorTheme || 'blue');
    setIsEditModalOpen(true);
  };

  const handleOpenAdjustModal = (plat: DigitalPlatform) => {
    setActivePlatform(plat);
    setNewAdjustBalance(plat.currentBalance);
    setAdjustReason('Sincronización con saldo del portal web');
    setIsAdjustModalOpen(true);
  };

  const handleOpenTransferModal = (plat?: DigitalPlatform, direction?: 'cash_to_platform' | 'platform_to_cash') => {
    const selected = plat || platforms[0];
    if (selected) {
      setTransferPlatformId(selected.id);
    }
    if (direction) {
      setTransferDirection(direction);
    }
    setTransferAmount(100000);
    setTransferReference('');
    setTransferDescription('');
    setIsTransferModalOpen(true);
  };

  const handleSaveNewPlatform = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addPlatform({
      name: name.trim(),
      code: code.trim().toLowerCase() || name.trim().toLowerCase().replace(/\s+/g, '_'),
      currentBalance: initialBalance,
      isActive: true,
      portalUrl: portalUrl.trim(),
      category,
      commissionRate,
      description: description.trim(),
      colorTheme,
    });

    setIsNewPlatformModalOpen(false);
  };

  const handleSaveEditPlatform = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePlatform || !name.trim()) return;

    updatePlatform(activePlatform.id, {
      name: name.trim(),
      code: code.trim().toLowerCase() || activePlatform.code,
      portalUrl: portalUrl.trim(),
      category,
      commissionRate,
      description: description.trim(),
      colorTheme,
    });

    setIsEditModalOpen(false);
  };

  const handleSaveAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePlatform) return;
    const success = await adjustPlatformBalance(
      activePlatform.id,
      newAdjustBalance,
      adjustReason.trim() || 'Ajuste manual de saldo'
    );
    if (success) {
      setIsAdjustModalOpen(false);
    }
  };

  const handleSaveTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferPlatformId || transferAmount <= 0) return;

    const success = await transferBetweenCashAndPlatform({
      platformId: transferPlatformId,
      amount: transferAmount,
      direction: transferDirection,
      reference: transferReference.trim(),
      description: transferDescription.trim(),
    });

    if (success) {
      setIsTransferModalOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-teal-600 text-white flex items-center justify-center font-bold shadow-md shadow-teal-600/20">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-slate-900">
                Plataformas Digitales
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Control y seguimiento de saldos en PTM, Bemovil, Punto de Pago y más plataformas
              </p>
            </div>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleOpenTransferModal()}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 shadow-sm active:scale-95 transition-all"
          >
            <RefreshCw className="w-4 h-4 text-emerald-400" />
            <span>Recargar / Transferir</span>
          </button>

          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-700 shadow-md shadow-teal-600/20 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Nueva Plataforma</span>
          </button>
        </div>
      </div>

      {/* Global Liquidity Overview KPI Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Platforms Balance */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-teal-900 to-slate-900 text-white shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-300">
              Saldo en Plataformas
            </span>
            <span className="p-1.5 rounded-lg bg-teal-500/20 text-teal-300">
              <Layers className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-black text-white tracking-tight">
            {formatCOP(summary.totalPlatformsBalance)}
          </p>
          <p className="text-[11px] text-teal-200/80 mt-1 font-medium">
            {platforms.filter((p) => p.isActive).length} plataformas activas configuradas
          </p>
        </div>

        {/* Physical Cash Drawer */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Efectivo en Caja Física
            </span>
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <Wallet className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-black text-slate-900 tracking-tight">
            {formatCOP(summary.expectedCashInRegister)}
          </p>
          <p className="text-[11px] text-slate-500 mt-1 font-medium">
            {currentRegister ? 'Caja abierta en operación' : 'Caja física cerrada'}
          </p>
        </div>

        {/* Grand Total Liquidity */}
        <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-emerald-950 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              Liquidez Global Consolidada
            </span>
            <span className="p-1.5 rounded-lg bg-emerald-600 text-white">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-black text-emerald-900 tracking-tight">
            {formatCOP(summary.totalGlobalLiquidity)}
          </p>
          <p className="text-[11px] text-emerald-800 mt-1 font-medium">
            Suma total disponible (Caja + Plataformas)
          </p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-white rounded-2xl border border-slate-200 shadow-2xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar plataforma (PTM, Bemovil, Punto de Pago...)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-teal-500 font-medium"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 cursor-pointer">
            <input
              type="checkbox"
              checked={filterActiveOnly}
              onChange={(e) => setFilterActiveOnly(e.target.checked)}
              className="rounded-sm border-slate-300 text-teal-600 focus:ring-teal-500"
            />
            <span>Solo Activas</span>
          </label>
        </div>
      </div>

      {/* Platforms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPlatforms.map((platform) => {
          const isPtm = platform.code === 'ptm';
          const isBemovil = platform.code === 'bemovil';
          const isPuntoPago = platform.code === 'punto_de_pago';

          return (
            <div
              key={platform.id}
              className={`p-5 rounded-3xl bg-white border transition-all relative overflow-hidden flex flex-col justify-between ${
                platform.isActive
                  ? 'border-slate-200/90 shadow-xs hover:border-teal-300'
                  : 'border-slate-200 bg-slate-50/50 opacity-60'
              }`}
            >
              {/* Card Header */}
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center font-extrabold text-sm shadow-xs ${
                        isPtm
                          ? 'bg-blue-600 text-white'
                          : isBemovil
                          ? 'bg-amber-500 text-white'
                          : isPuntoPago
                          ? 'bg-emerald-600 text-white'
                          : 'bg-indigo-600 text-white'
                      }`}
                    >
                      {platform.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900 leading-tight">
                        {platform.name}
                      </h3>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Código: {platform.code}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => togglePlatformActive(platform.id)}
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        platform.isActive
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {platform.isActive ? 'Activa' : 'Inactiva'}
                    </button>
                  </div>
                </div>

                {/* Description */}
                {platform.description && (
                  <p className="text-xs text-slate-500 mb-4 line-clamp-2">
                    {platform.description}
                  </p>
                )}

                {/* Current Balance Box */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 mb-4">
                  <div className="flex items-center justify-between text-slate-500 text-[11px] font-semibold mb-1">
                    <span>Saldo Disponible:</span>
                    <button
                      type="button"
                      onClick={() => handleOpenAdjustModal(platform)}
                      className="text-teal-600 hover:text-teal-700 font-bold flex items-center gap-1 hover:underline text-[10px]"
                    >
                      <Edit2 className="w-2.5 h-2.5" />
                      Ajustar
                    </button>
                  </div>
                  <p className="text-xl font-black text-slate-900 tracking-tight">
                    {formatCOP(platform.currentBalance)}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Última actualización: {new Date(platform.lastUpdated).toLocaleDateString('es-CO')}
                  </p>
                </div>
              </div>

              {/* Card Actions Footer */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenTransferModal(platform, 'cash_to_platform')}
                    className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 text-xs font-bold transition-all"
                    title="Transferir efectivo de caja a esta plataforma"
                  >
                    <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Recargar</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenTransferModal(platform, 'platform_to_cash')}
                    className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold transition-all"
                    title="Descargar fondos de plataforma a caja física"
                  >
                    <ArrowUpRight className="w-3.5 h-3.5 text-amber-600" />
                    <span>Descargar</span>
                  </button>
                </div>

                <div className="flex items-center justify-between pt-1">
                  {platform.portalUrl ? (
                    <a
                      href={platform.portalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-600 hover:text-teal-800"
                    >
                      <span>Abrir Portal Web</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <span className="text-[10px] text-slate-400">Sin portal web</span>
                  )}

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(platform)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                      title="Editar plataforma"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`¿Deseas eliminar la plataforma ${platform.name}?`)) {
                          deletePlatform(platform.id);
                        }
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                      title="Eliminar plataforma"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Platform Transactions Movement History */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-slate-100 text-slate-800">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-slate-900">
                Historial de Movimientos de Plataformas
              </h2>
              <p className="text-[11px] text-slate-500 font-medium">
                Cargas de saldo desde caja, descargas a caja y ajustes
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
            {platformTransactions.length} registros
          </span>
        </div>

        {platformTransactions.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs font-medium">
            No hay movimientos registrados en las plataformas digitales aún.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Fecha / Hora</th>
                  <th className="py-3 px-4">Plataforma</th>
                  <th className="py-3 px-4">Tipo de Movimiento</th>
                  <th className="py-3 px-4">Descripción / Referencia</th>
                  <th className="py-3 px-4">Usuario</th>
                  <th className="py-3 px-4 text-right">Monto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {platformTransactions.slice(0, 15).map((tx) => {
                  const isCarga = tx.type === 'carga_desde_caja';
                  const isDescarga = tx.type === 'descarga_a_caja';

                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors font-medium">
                      <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                        {new Date(tx.createdAt).toLocaleString('es-CO', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900 whitespace-nowrap">
                        {tx.platformName}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            isCarga
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : isDescarga
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : 'bg-indigo-50 text-indigo-800 border border-indigo-200'
                          }`}
                        >
                          {isCarga ? '➕ Carga desde Caja' : isDescarga ? '➖ Descarga a Caja' : '⚡ Ajuste de Saldo'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-700 max-w-xs truncate">
                        {tx.description}
                        {tx.reference && (
                          <span className="text-slate-400 text-[10px] block">
                            Ref: {tx.reference}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                        {tx.userName || 'Sistema'}
                      </td>
                      <td className="py-3 px-4 text-right font-black text-slate-900 whitespace-nowrap">
                        {formatCOP(tx.amount)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: New Platform */}
      <Modal
        isOpen={isNewPlatformModalOpen}
        onClose={() => setIsNewPlatformModalOpen(false)}
        title="Crear Nueva Plataforma Digital"
        subtitle="Registra un nuevo canal digital para llevar el control de cupo y saldo"
        maxWidth="md"
      >
        <form onSubmit={handleSaveNewPlatform} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="plat-name">
              Nombre de la Plataforma *
            </label>
            <input
              id="plat-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. PTM, Bemovil, Punto de Pago, Movii, Efecty, Daviplata..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:border-teal-500 focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="plat-code">
                Código Único
              </label>
              <input
                id="plat-code"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="ptm, bemovil..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:border-teal-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="plat-com">
                Comisión Estimada (%)
              </label>
              <input
                id="plat-com"
                type="number"
                step="0.1"
                min="0"
                value={commissionRate || ''}
                onChange={(e) => setCommissionRate(parseFloat(e.target.value) || 0)}
                placeholder="Ej. 1.5"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:border-teal-500 focus:outline-hidden"
              />
            </div>
          </div>

          <MoneyInput
            id="plat-initial-bal"
            label="Saldo Inicial en la Plataforma (COP)"
            value={initialBalance}
            onChange={setInitialBalance}
            placeholder="0"
          />

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="plat-url">
              Enlace Web al Portal / Acceso (Opcional)
            </label>
            <input
              id="plat-url"
              type="url"
              value={portalUrl}
              onChange={(e) => setPortalUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:border-teal-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="plat-desc">
              Descripción o Servicios que opera (Opcional)
            </label>
            <textarea
              id="plat-desc"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ej. Recargas móviles, paquetes de datos, pago de facturas y pines de entretenimiento"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:border-teal-500 focus:outline-hidden"
            />
          </div>

          <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsNewPlatformModalOpen(false)}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isProcessing || !name.trim()}
              className="flex-1 py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-600/20 active:scale-95 transition-all disabled:opacity-50"
            >
              Guardar Plataforma
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Edit Platform */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Editar Plataforma Digital"
        subtitle="Actualiza la información de acceso y configuración de la plataforma"
        maxWidth="md"
      >
        <form onSubmit={handleSaveEditPlatform} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="edit-plat-name">
              Nombre de la Plataforma *
            </label>
            <input
              id="edit-plat-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:border-teal-500 focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="edit-plat-code">
                Código
              </label>
              <input
                id="edit-plat-code"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:border-teal-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="edit-plat-com">
                Comisión (%)
              </label>
              <input
                id="edit-plat-com"
                type="number"
                step="0.1"
                min="0"
                value={commissionRate || ''}
                onChange={(e) => setCommissionRate(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:border-teal-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="edit-plat-url">
              Enlace al Portal Web
            </label>
            <input
              id="edit-plat-url"
              type="url"
              value={portalUrl}
              onChange={(e) => setPortalUrl(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:border-teal-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="edit-plat-desc">
              Descripción
            </label>
            <textarea
              id="edit-plat-desc"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:border-teal-500 focus:outline-hidden"
            />
          </div>

          <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isProcessing}
              className="flex-1 py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-600/20 active:scale-95 transition-all"
            >
              Guardar Cambios
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Adjust Balance */}
      <Modal
        isOpen={isAdjustModalOpen}
        onClose={() => setIsAdjustModalOpen(false)}
        title={`Ajustar Saldo: ${activePlatform?.name}`}
        subtitle="Ajusta manualmente el saldo para que coincida con el dinero real en el portal"
        maxWidth="sm"
      >
        <form onSubmit={handleSaveAdjust} className="space-y-4">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <div className="flex justify-between mb-1 text-slate-500">
              <span>Saldo actual en sistema:</span>
              <span className="font-bold text-slate-900">
                {activePlatform ? formatCOP(activePlatform.currentBalance) : '$0'}
              </span>
            </div>
          </div>

          <MoneyInput
            id="adjust-plat-bal"
            label="Nuevo Saldo Real en Plataforma (COP)"
            value={newAdjustBalance}
            onChange={setNewAdjustBalance}
            required
            autoFocus
          />

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="adjust-reason">
              Motivo del Ajuste
            </label>
            <input
              id="adjust-reason"
              type="text"
              required
              value={adjustReason}
              onChange={(e) => setAdjustReason(e.target.value)}
              placeholder="Ej. Conteo y verificación con portal web"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:border-teal-500 focus:outline-hidden"
            />
          </div>

          <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAdjustModalOpen(false)}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isProcessing}
              className="flex-1 py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-600/20 active:scale-95 transition-all"
            >
              Confirmar Ajuste
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Transfer between Cash Drawer and Platform */}
      <Modal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        title="Transferencia / Recarga entre Caja y Plataforma"
        subtitle="Mueve dinero de la caja física hacia la plataforma o descarga comisiones/fondos a caja"
        maxWidth="md"
      >
        <form onSubmit={handleSaveTransfer} className="space-y-4">
          {/* Direction selector */}
          <div className="p-1 rounded-xl bg-slate-100 flex gap-1 border border-slate-200">
            <button
              type="button"
              onClick={() => setTransferDirection('cash_to_platform')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
                transferDirection === 'cash_to_platform'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowDownLeft className="w-4 h-4" />
              <span>Caja Física ➔ Plataforma (Recarga)</span>
            </button>
            <button
              type="button"
              onClick={() => setTransferDirection('platform_to_cash')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
                transferDirection === 'platform_to_cash'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>Plataforma ➔ Caja Física (Descarga)</span>
            </button>
          </div>

          {/* Platform Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="transfer-plat-select">
              Plataforma Digital
            </label>
            <select
              id="transfer-plat-select"
              value={transferPlatformId}
              onChange={(e) => setTransferPlatformId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-white focus:border-teal-500 focus:outline-hidden"
            >
              {platforms
                .filter((p) => p.isActive)
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} (Saldo actual: {formatCOP(p.currentBalance)})
                  </option>
                ))}
            </select>
          </div>

          <MoneyInput
            id="transfer-amount-input"
            label="Monto de la Transferencia (COP)"
            value={transferAmount}
            onChange={setTransferAmount}
            required
            autoFocus
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="transfer-ref">
                Número de Referencia / Comprobante
              </label>
              <input
                id="transfer-ref"
                type="text"
                value={transferReference}
                onChange={(e) => setTransferReference(e.target.value)}
                placeholder="Ej. REC-89421"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:border-teal-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="transfer-desc">
                Observación
              </label>
              <input
                id="transfer-desc"
                type="text"
                value={transferDescription}
                onChange={(e) => setTransferDescription(e.target.value)}
                placeholder="Ej. Recarga bancaria cupo PTM"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:border-teal-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Informational Callout */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-2">
            <Info className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
            <span>
              {transferDirection === 'cash_to_platform'
                ? 'Se registrará automáticamente una salida (egreso) en la caja física activa y se sumará el saldo a la plataforma digital seleccionada.'
                : 'Se registrará automáticamente un ingreso en la caja física activa y se descontará el saldo de la plataforma digital seleccionada.'}
            </span>
          </div>

          <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsTransferModalOpen(false)}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isProcessing || transferAmount <= 0}
              className="flex-1 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md active:scale-95 transition-all disabled:opacity-50"
            >
              Realizar Transferencia
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
