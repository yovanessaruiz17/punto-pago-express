import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { Modal } from '../components/ui/Modal';
import { MoneyInput } from '../components/ui/MoneyInput';
import { ServiceItem } from '../types';
import { formatCOP } from '../utils/formatters';
import {
  Layers,
  Plus,
  Search,
  SlidersHorizontal,
  Edit2,
  Trash2,
  CheckCircle2,
  Sparkles,
  Zap,
  Droplets,
  Flame,
  Smartphone,
  Send,
  Building2,
  Gamepad2,
  FileSpreadsheet,
  FileText,
  Tag,
  ToggleLeft,
  ToggleRight,
  Info,
  Check,
  ArrowDownLeft,
} from 'lucide-react';

interface ServicesPageProps {
  onOpenQuickIncomeWithService?: (serviceId: string) => void;
}

// Preset Colombian Payment Point Templates
const SERVICE_TEMPLATES: Array<{
  name: string;
  category: string;
  description: string;
  commissionType: 'fixed' | 'percentage' | 'none';
  commissionAmount?: number;
  commissionPercentage?: number;
  defaultPrice?: number;
  code?: string;
  color?: string;
  icon: any;
}> = [
  {
    name: 'Energía / Luz (Enel, EPM, Celsia, Air-e)',
    category: 'Servicios Públicos',
    description: 'Recaudo de factura de energía eléctrica residencial o comercial',
    commissionType: 'fixed',
    commissionAmount: 1000,
    code: 'Referencia / Cuenta Contrato',
    color: 'amber',
    icon: Zap,
  },
  {
    name: 'Agua / Acueducto & Alcantarillado',
    category: 'Servicios Públicos',
    description: 'Pago de factura de agua potable y alcantarillado',
    commissionType: 'fixed',
    commissionAmount: 800,
    code: 'No. de Matrícula / Referencia',
    color: 'blue',
    icon: Droplets,
  },
  {
    name: 'Gas Natural Domiciliario (Vanti / Gases)',
    category: 'Servicios Públicos',
    description: 'Pago de suministro mensual de gas natural domiciliario',
    commissionType: 'fixed',
    commissionAmount: 800,
    code: 'Referencia de Pago',
    color: 'rose',
    icon: Flame,
  },
  {
    name: 'Recargas Claro, Movistar, Tigo, Wom',
    category: 'Telefonía & Datos',
    description: 'Recargas prepago y paquetes de datos a todas las operadoras',
    commissionType: 'percentage',
    commissionPercentage: 5,
    code: 'Número de Celular (10 dígitos)',
    color: 'emerald',
    icon: Smartphone,
  },
  {
    name: 'Giros Nacionales (Efecty / SuperGiros)',
    category: 'Giros & Remesas',
    description: 'Recepción y envío de giros postales y transferencias en efectivo',
    commissionType: 'fixed',
    commissionAmount: 2500,
    code: 'Cédula del Remitente / Beneficiario',
    color: 'indigo',
    icon: Send,
  },
  {
    name: 'Corresponsal Bancolombia / Davivienda',
    category: 'Bancos & Pasarelas',
    description: 'Depósitos, retiros y pagos de tarjetas bancarias en punto',
    commissionType: 'fixed',
    commissionAmount: 1500,
    code: 'No. de Cuenta / Tarjeta',
    color: 'teal',
    icon: Building2,
  },
  {
    name: 'Recargas Betplay / Wplay / YaJuego',
    category: 'Juegos & Apuestas',
    description: 'Carga de saldo a cuentas de plataformas de entretenimiento',
    commissionType: 'fixed',
    commissionAmount: 1000,
    code: 'Cédula de Ciudadanía del Usuario',
    color: 'purple',
    icon: Gamepad2,
  },
  {
    name: 'Planilla PILA (Seguridad Social)',
    category: 'Aportes & Seguridad Social',
    description: 'Pago de aportes a salud, pensión y ARL de trabajadores independientes',
    commissionType: 'fixed',
    commissionAmount: 3000,
    code: 'Número de Planilla Asignada',
    color: 'cyan',
    icon: FileSpreadsheet,
  },
  {
    name: 'Certificados & Trámites (RUT, Antecedentes)',
    category: 'Papelería & Documentos',
    description: 'Consulta, descarga e impresión láser de certificados públicos',
    commissionType: 'fixed',
    commissionAmount: 5000,
    defaultPrice: 5000,
    code: 'Cédula / NIT',
    color: 'slate',
    icon: FileText,
  },
];

const CATEGORY_SUGGESTIONS = [
  'Servicios Públicos',
  'Telefonía & Datos',
  'Giros & Remesas',
  'Bancos & Pasarelas',
  'Juegos & Apuestas',
  'Aportes & Seguridad Social',
  'Papelería & Documentos',
  'Otros Servicios',
];

export const ServicesPage: React.FC<ServicesPageProps> = ({ onOpenQuickIncomeWithService }) => {
  const { services, categories, addService, updateService, deleteService, toggleServiceActive, currentUser } =
    useApp();

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Create Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const [category, setCategory] = useState<string>('Servicios Públicos');
  const [description, setDescription] = useState<string>('');
  const [code, setCode] = useState<string>('Referencia de Pago');
  const [commissionType, setCommissionType] = useState<'fixed' | 'percentage' | 'none'>('fixed');
  const [commissionAmount, setCommissionAmount] = useState<number>(1000);
  const [commissionPercentage, setCommissionPercentage] = useState<number>(0);
  const [defaultPrice, setDefaultPrice] = useState<number>(0);
  const [isActive, setIsActive] = useState<boolean>(true);

  // Edit Modal State
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);
  const [editName, setEditName] = useState<string>('');
  const [editCategory, setEditCategory] = useState<string>('');
  const [editDescription, setEditDescription] = useState<string>('');
  const [editCode, setEditCode] = useState<string>('');
  const [editCommissionType, setEditCommissionType] = useState<'fixed' | 'percentage' | 'none'>('fixed');
  const [editCommissionAmount, setEditCommissionAmount] = useState<number>(0);
  const [editCommissionPercentage, setEditCommissionPercentage] = useState<number>(0);
  const [editDefaultPrice, setEditDefaultPrice] = useState<number>(0);
  const [editIsActive, setEditIsActive] = useState<boolean>(true);

  // Delete Confirmation State
  const [serviceToDelete, setServiceToDelete] = useState<ServiceItem | null>(null);

  // Filtered Services List
  const filteredServices = useMemo(() => {
    return services.filter((s) => {
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const matchesName = s.name.toLowerCase().includes(term);
        const matchesCat = s.category.toLowerCase().includes(term);
        const matchesDesc = s.description.toLowerCase().includes(term);
        const matchesCode = s.code?.toLowerCase().includes(term) || false;
        if (!matchesName && !matchesCat && !matchesDesc && !matchesCode) return false;
      }

      if (selectedCategoryFilter !== 'all' && s.category !== selectedCategoryFilter) {
        return false;
      }

      if (selectedStatusFilter === 'active' && !s.isActive) return false;
      if (selectedStatusFilter === 'inactive' && s.isActive) return false;

      return true;
    });
  }, [services, searchTerm, selectedCategoryFilter, selectedStatusFilter]);

  // Unique Categories from existing services
  const existingCategories = useMemo(() => {
    const set = new Set<string>();
    services.forEach((s) => set.add(s.category));
    CATEGORY_SUGGESTIONS.forEach((c) => set.add(c));
    return Array.from(set);
  }, [services]);

  // Stats
  const totalCount = services.length;
  const activeCount = services.filter((s) => s.isActive).length;
  const inactiveCount = totalCount - activeCount;

  // Open Edit Modal with populated data
  const handleOpenEdit = (s: ServiceItem) => {
    setEditingService(s);
    setEditName(s.name);
    setEditCategory(s.category);
    setEditDescription(s.description || '');
    setEditCode(s.code || 'Referencia de Pago');
    setEditCommissionType(s.commissionType || 'fixed');
    setEditCommissionAmount(s.commissionAmount || 0);
    setEditCommissionPercentage(s.commissionPercentage || 0);
    setEditDefaultPrice(s.defaultPrice || 0);
    setEditIsActive(s.isActive);
  };

  // Submit Create
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addService({
      name: name.trim(),
      category: category.trim() || 'Servicios Públicos',
      description: description.trim() || 'Servicio de caja y recaudos',
      code: code.trim() || 'Referencia de Pago',
      commissionType,
      commissionAmount: commissionType === 'fixed' ? commissionAmount : 0,
      commissionPercentage: commissionType === 'percentage' ? commissionPercentage : 0,
      defaultPrice: defaultPrice > 0 ? defaultPrice : undefined,
      isActive,
    });

    // Reset Form
    setName('');
    setDescription('');
    setCode('Referencia de Pago');
    setCommissionAmount(1000);
    setCommissionPercentage(0);
    setDefaultPrice(0);
    setIsCreateModalOpen(false);
  };

  // Submit Edit
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService || !editName.trim()) return;

    updateService(editingService.id, {
      name: editName.trim(),
      category: editCategory.trim() || 'General',
      description: editDescription.trim(),
      code: editCode.trim() || 'Referencia de Pago',
      commissionType: editCommissionType,
      commissionAmount: editCommissionType === 'fixed' ? editCommissionAmount : 0,
      commissionPercentage: editCommissionType === 'percentage' ? editCommissionPercentage : 0,
      defaultPrice: editDefaultPrice > 0 ? editDefaultPrice : undefined,
      isActive: editIsActive,
    });

    setEditingService(null);
  };

  // Add from pre-configured template with 1-click
  const handleAddTemplate = (template: typeof SERVICE_TEMPLATES[0]) => {
    addService({
      name: template.name,
      category: template.category,
      description: template.description,
      commissionType: template.commissionType,
      commissionAmount: template.commissionAmount,
      commissionPercentage: template.commissionPercentage,
      defaultPrice: template.defaultPrice,
      code: template.code,
      isActive: true,
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Catálogo de Servicios & Recaudos
            </h2>
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full">
              {activeCount} Activos
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Crea, personaliza y configura los servicios públicos, recargas, giros y comisiones de tu punto de pago
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Crear Nuevo Servicio</span>
          </button>
        </div>
      </div>

      {/* 1-Click Quick Templates Carousel/Grid */}
      <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 via-white to-slate-50 p-4 sm:p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
              Plantillas Rápidas (Puntos de Pago Colombia)
            </h3>
          </div>
          <span className="text-[11px] text-slate-500 font-semibold hidden sm:inline">
            Haz clic en cualquier plantilla para añadirla al instante
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {SERVICE_TEMPLATES.map((tmpl, idx) => {
            const Icon = tmpl.icon;
            // Check if service already exists
            const alreadyExists = services.some(
              (s) => s.name.toLowerCase() === tmpl.name.toLowerCase()
            );

            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleAddTemplate(tmpl)}
                className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all group ${
                  alreadyExists
                    ? 'bg-slate-50/70 border-slate-200 opacity-60 hover:opacity-100'
                    : 'bg-white border-slate-200 hover:border-emerald-400 hover:shadow-2xs active:scale-95'
                }`}
                title={tmpl.description}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-1.5 rounded-lg bg-slate-100 text-slate-700 group-hover:bg-emerald-50 group-hover:text-emerald-700 transition-all">
                      <Icon className="w-4 h-4" />
                    </div>
                    {alreadyExists ? (
                      <span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                        Añadido
                      </span>
                    ) : (
                      <span className="text-[9px] font-extrabold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                        <Plus className="w-3 h-3" /> Añadir
                      </span>
                    )}
                  </div>
                  <h4 className="text-xs font-bold text-slate-800 line-clamp-1 group-hover:text-emerald-800">
                    {tmpl.name}
                  </h4>
                  <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                    {tmpl.category}
                  </p>
                </div>

                <div className="mt-2 pt-2 border-t border-slate-100 text-[10px] font-extrabold text-slate-700">
                  {tmpl.commissionType === 'fixed' && `Comisión: ${formatCOP(tmpl.commissionAmount || 0)}`}
                  {tmpl.commissionType === 'percentage' && `Comisión: ${tmpl.commissionPercentage}%`}
                  {tmpl.commissionType === 'none' && 'Sin comisión fija'}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between p-3 rounded-2xl bg-white border border-slate-200 shadow-2xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar servicio por nombre, categoría o referencia..."
            className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-emerald-600 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <select
            value={selectedCategoryFilter}
            onChange={(e) => setSelectedCategoryFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 focus:outline-emerald-600"
          >
            <option value="all">Todas las Categorías</option>
            {existingCategories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value as any)}
            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 focus:outline-emerald-600"
          >
            <option value="all">Todos los Estados</option>
            <option value="active">Solo Activos</option>
            <option value="inactive">Solo Inactivos</option>
          </select>
        </div>
      </div>

      {/* Services List Display */}
      {filteredServices.length === 0 ? (
        <EmptyState
          id="empty-services"
          icon={Layers}
          title="No se encontraron servicios"
          description="Añade tu primer servicio de recaudo o utiliza las plantillas rápidas sugeridas arriba."
          action={{
            label: 'Crear Servicio',
            onClick: () => setIsCreateModalOpen(true),
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredServices.map((service) => (
            <div
              key={service.id}
              className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                service.isActive
                  ? 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                  : 'bg-slate-50/70 border-slate-200/80 opacity-75'
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm ${
                        service.isActive
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-200 text-slate-500'
                      }`}
                    >
                      <Tag className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900 leading-tight">
                        {service.name}
                      </h4>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        {service.category}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleServiceActive(service.id)}
                    className="shrink-0 p-1 text-slate-400 hover:text-slate-700"
                    title={service.isActive ? 'Desactivar servicio' : 'Activar servicio'}
                  >
                    {service.isActive ? (
                      <ToggleRight className="w-6 h-6 text-emerald-600" />
                    ) : (
                      <ToggleLeft className="w-6 h-6 text-slate-300" />
                    )}
                  </button>
                </div>

                {/* Description & Reference Info */}
                <p className="text-xs text-slate-600 mb-3 leading-relaxed">
                  {service.description || 'Sin descripción detallada.'}
                </p>

                {/* Metadata Pills */}
                <div className="space-y-1.5 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700 mb-3">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-[11px] font-semibold">Comisión:</span>
                    <span className="font-extrabold text-emerald-700">
                      {service.commissionType === 'percentage'
                        ? `${service.commissionPercentage}% del monto`
                        : service.commissionAmount && service.commissionAmount > 0
                        ? `${formatCOP(service.commissionAmount)} fija`
                        : 'Sin comisión fija'}
                    </span>
                  </div>

                  {service.defaultPrice !== undefined && service.defaultPrice > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-[11px] font-semibold">Tarifa / Precio:</span>
                      <span className="font-extrabold text-slate-900">
                        {formatCOP(service.defaultPrice)}
                      </span>
                    </div>
                  )}

                  {service.code && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-[11px] font-semibold">Campo Referencia:</span>
                      <span className="font-semibold text-slate-700 text-[11px]">
                        {service.code}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(service)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-all"
                    title="Editar servicio"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setServiceToDelete(service)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all"
                    title="Eliminar servicio"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {onOpenQuickIncomeWithService && service.isActive && (
                  <button
                    type="button"
                    onClick={() => onOpenQuickIncomeWithService(service.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-bold transition-all"
                  >
                    <ArrowDownLeft className="w-3.5 h-3.5" />
                    <span>Recaudar</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE SERVICE MODAL */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Crear Nuevo Servicio de Recaudo"
        subtitle="Registra un nuevo concepto de facturación, recarga o servicio para tu punto"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Nombre del Servicio *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Factura Energía Enel / Recargas Betplay / Giro Efecty"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:outline-hidden"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Categoría *
              </label>
              <input
                type="text"
                required
                list="category-suggestions"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Ej. Servicios Públicos"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:border-emerald-600 focus:outline-hidden"
              />
              <datalist id="category-suggestions">
                {CATEGORY_SUGGESTIONS.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nombre de la Referencia / Identificador
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Ej. No. Cuenta / Referencia de Pago / Celular"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:border-emerald-600 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Commission Type Selector */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <label className="block text-xs font-bold text-slate-800">
              Esquema de Ganancia / Comisión
            </label>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setCommissionType('fixed')}
                className={`py-2 px-2 text-center rounded-lg text-xs font-bold border transition-all ${
                  commissionType === 'fixed'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Comisión Fija ($ COP)
              </button>
              <button
                type="button"
                onClick={() => setCommissionType('percentage')}
                className={`py-2 px-2 text-center rounded-lg text-xs font-bold border transition-all ${
                  commissionType === 'percentage'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Porcentaje (%)
              </button>
              <button
                type="button"
                onClick={() => setCommissionType('none')}
                className={`py-2 px-2 text-center rounded-lg text-xs font-bold border transition-all ${
                  commissionType === 'none'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Sin Comisión
              </button>
            </div>

            {commissionType === 'fixed' && (
              <MoneyInput
                id="create-service-commission-amount"
                label="Valor de Comisión Fija por Transacción (COP)"
                value={commissionAmount}
                onChange={setCommissionAmount}
                placeholder="1000"
              />
            )}

            {commissionType === 'percentage' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Porcentaje de Comisión (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={commissionPercentage}
                  onChange={(e) => setCommissionPercentage(parseFloat(e.target.value) || 0)}
                  placeholder="Ej. 5.0"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:border-emerald-600 focus:outline-hidden"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <MoneyInput
              id="create-service-default-price"
              label="Tarifa / Precio Base Sugerido (Opcional)"
              value={defaultPrice}
              onChange={setDefaultPrice}
              placeholder="0 (Si varía según factura)"
            />

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Estado Inicial
              </label>
              <select
                value={isActive ? 'active' : 'inactive'}
                onChange={(e) => setIsActive(e.target.value === 'active')}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:border-emerald-600"
              >
                <option value="active">Activo (Disponible en caja)</option>
                <option value="inactive">Inactivo (Oculto)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Instrucciones u Observaciones para el Cajero (Opcional)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ej. Verificar código de barras y solicitar comprobante firmado si supera $200k"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:outline-hidden"
            />
          </div>

          <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              Guardar Servicio
            </button>
          </div>
        </form>
      </Modal>

      {/* EDIT SERVICE MODAL */}
      <Modal
        isOpen={!!editingService}
        onClose={() => setEditingService(null)}
        title="Editar Servicio"
        subtitle={editingService?.name}
        maxWidth="lg"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Nombre del Servicio *
            </label>
            <input
              type="text"
              required
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:border-emerald-600 focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Categoría *
              </label>
              <input
                type="text"
                required
                value={editCategory}
                onChange={(e) => setEditCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:border-emerald-600 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nombre del Identificador / Referencia
              </label>
              <input
                type="text"
                value={editCode}
                onChange={(e) => setEditCode(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:border-emerald-600 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Commission Type Selector */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <label className="block text-xs font-bold text-slate-800">
              Esquema de Ganancia / Comisión
            </label>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setEditCommissionType('fixed')}
                className={`py-2 px-2 text-center rounded-lg text-xs font-bold border transition-all ${
                  editCommissionType === 'fixed'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Comisión Fija ($)
              </button>
              <button
                type="button"
                onClick={() => setEditCommissionType('percentage')}
                className={`py-2 px-2 text-center rounded-lg text-xs font-bold border transition-all ${
                  editCommissionType === 'percentage'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Porcentaje (%)
              </button>
              <button
                type="button"
                onClick={() => setEditCommissionType('none')}
                className={`py-2 px-2 text-center rounded-lg text-xs font-bold border transition-all ${
                  editCommissionType === 'none'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Sin Comisión
              </button>
            </div>

            {editCommissionType === 'fixed' && (
              <MoneyInput
                id="edit-service-commission-amount"
                label="Valor de Comisión Fija (COP)"
                value={editCommissionAmount}
                onChange={setEditCommissionAmount}
                placeholder="0"
              />
            )}

            {editCommissionType === 'percentage' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Porcentaje de Comisión (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={editCommissionPercentage}
                  onChange={(e) => setEditCommissionPercentage(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:border-emerald-600 focus:outline-hidden"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <MoneyInput
              id="edit-service-default-price"
              label="Tarifa Base Sugerida (Opcional)"
              value={editDefaultPrice}
              onChange={setEditDefaultPrice}
              placeholder="0"
            />

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Estado
              </label>
              <select
                value={editIsActive ? 'active' : 'inactive'}
                onChange={(e) => setEditIsActive(e.target.value === 'active')}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:border-emerald-600"
              >
                <option value="active">Activo (Visible en recaudos)</option>
                <option value="inactive">Inactivo</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Descripción / Instrucciones
            </label>
            <textarea
              rows={2}
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:border-emerald-600 focus:outline-hidden"
            />
          </div>

          <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setEditingService(null)}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs active:scale-95 transition-all"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              Guardar Cambios
            </button>
          </div>
        </form>
      </Modal>

      {/* DELETE CONFIRMATION MODAL */}
      <Modal
        isOpen={!!serviceToDelete}
        onClose={() => setServiceToDelete(null)}
        title="¿Eliminar Servicio?"
        subtitle={serviceToDelete?.name}
        maxWidth="sm"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            ¿Estás seguro de que deseas eliminar el servicio{' '}
            <strong className="text-slate-900">"{serviceToDelete?.name}"</strong>? Los recaudos e ingresos históricos registrados previamente mantendrán su información.
          </p>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => setServiceToDelete(null)}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => {
                if (serviceToDelete) {
                  deleteService(serviceToDelete.id);
                  setServiceToDelete(null);
                }
              }}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs active:scale-95 transition-all"
            >
              <Trash2 className="w-4 h-4" />
              Eliminar
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
