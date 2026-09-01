import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatCOP } from '../utils/formatters';
import { supabase } from '../lib/supabase';
import {
  Settings,
  Building2,
  Database,
  ShieldCheck,
  Download,
  Copy,
  Check,
  RefreshCw,
  Sparkles,
  Server,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { settings, updateSettings, addToast, resetToSampleData } = useApp();

  const [businessName, setBusinessName] = useState<string>(settings.businessName);
  const [nit, setNit] = useState<string>(settings.nit);
  const [address, setAddress] = useState<string>(settings.address);
  const [phone, setPhone] = useState<string>(settings.phone);
  const [requireCashForSale, setRequireCashForSale] = useState<boolean>(settings.requireCashForSale);
  const [allowCashDifferenceClosing, setAllowCashDifferenceClosing] = useState<boolean>(settings.allowCashDifferenceClosing);

  const [isCopiedSQL, setIsCopiedSQL] = useState<boolean>(false);
  const [isTestingSupabase, setIsTestingSupabase] = useState<boolean>(false);
  const [supabaseStatus, setSupabaseStatus] = useState<string | null>(null);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      businessName: businessName.trim() || 'Punto de Pago Express',
      nit: nit.trim() || '901.234.567-8',
      address: address.trim() || 'Calle Principal # 45-20',
      phone: phone.trim() || '+57 310 987 6543',
      requireCashForSale,
      allowCashDifferenceClosing,
    });
  };

  const handleCopySQL = () => {
    const sqlScript = `-- SCHEMA POSTGRESQL / SUPABASE PARA PUNTO DE PAGO EXPRESS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'cajero')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.cash_registers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  opened_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  closed_at TIMESTAMPTZ,
  opened_by_user_id TEXT NOT NULL,
  opened_by_user_name TEXT NOT NULL,
  closed_by_user_id TEXT,
  closed_by_user_name TEXT,
  initial_balance NUMERIC NOT NULL DEFAULT 0,
  expected_balance NUMERIC NOT NULL DEFAULT 0,
  physical_counted_balance NUMERIC,
  difference NUMERIC,
  difference_reason TEXT,
  difference_notes TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cash_register_id UUID REFERENCES public.cash_registers(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('ingreso', 'egreso', 'prestamo_recibido', 'prestamo_entregado', 'cobro_prestamo', 'pago_prestamo', 'ajuste')),
  amount NUMERIC NOT NULL CHECK (amount >= 0),
  description TEXT NOT NULL,
  service_id UUID,
  category_id UUID,
  payment_method_code TEXT NOT NULL DEFAULT 'efectivo',
  payment_method_name TEXT NOT NULL DEFAULT 'Efectivo',
  reference TEXT,
  customer_or_provider TEXT,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  is_voided BOOLEAN NOT NULL DEFAULT false,
  void_reason TEXT,
  voided_at TIMESTAMPTZ,
  voided_by_user_id TEXT,
  loan_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.loans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL CHECK (type IN ('recibido', 'entregado')),
  counterpart_name TEXT NOT NULL,
  contact_phone TEXT,
  initial_amount NUMERIC NOT NULL CHECK (initial_amount > 0),
  paid_amount NUMERIC NOT NULL DEFAULT 0,
  current_balance NUMERIC NOT NULL,
  due_date DATE,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pendiente' CHECK (status IN ('pendiente', 'parcial', 'pagado', 'vencido')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Habilitar RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cash_registers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loans ENABLE ROW LEVEL SECURITY;
`;

    navigator.clipboard.writeText(sqlScript);
    setIsCopiedSQL(true);
    addToast('info', 'Copiado', 'Script SQL copiado al portapapeles');
    setTimeout(() => setIsCopiedSQL(false), 3000);
  };

  const handleTestSupabase = async () => {
    setIsTestingSupabase(true);
    setSupabaseStatus(null);
    try {
      if (!supabase) {
        setSupabaseStatus('Modo Offline Activo: Operando con persistencia local ultra rápida (LocalStorage). Para conectar a la nube, agrega las credenciales en .env.');
        return;
      }

      const { error } = await supabase.from('profiles').select('count', { count: 'exact', head: true });
      if (error) {
        setSupabaseStatus(`Conexión fallida o tablas no inicializadas: ${error.message}`);
      } else {
        setSupabaseStatus('✅ Conexión con Supabase establecida exitosamente.');
      }
    } catch (err: any) {
      setSupabaseStatus(`Error de red: ${err.message || 'No se pudo conectar'}`);
    } finally {
      setIsTestingSupabase(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
          Configuración General del Negocio
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Datos comerciales, reglas de control de caja y sincronización con Supabase Cloud
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Business Information Form */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSaveSettings} className="rounded-2xl border border-slate-200 bg-white p-6 space-y-5 shadow-2xs">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
              <Building2 className="w-5 h-5 text-slate-700" />
              <h3 className="text-sm font-bold text-slate-900">
                Información del Establecimiento & Comprobantes
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Nombre Comercial
                </label>
                <input
                  type="text"
                  required
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 focus:outline-hidden focus:border-slate-800 font-semibold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  NIT o Cédula
                </label>
                <input
                  type="text"
                  required
                  value={nit}
                  onChange={(e) => setNit(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 focus:outline-hidden focus:border-slate-800 font-semibold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Dirección Física
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 focus:outline-hidden focus:border-slate-800"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Teléfono de Contacto
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 focus:outline-hidden focus:border-slate-800"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Políticas Operativas de Caja
              </h4>

              <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={requireCashForSale}
                  onChange={(e) => setRequireCashForSale(e.target.checked)}
                  className="mt-0.5 rounded-sm text-emerald-600 focus:ring-emerald-500"
                />
                <div className="text-xs">
                  <span className="font-bold text-slate-900 block">
                    Exigir caja abierta para registrar ingresos y egresos
                  </span>
                  <span className="text-slate-500">
                    Evita que los cajeros realicen operaciones sin haber aperturado la caja del día.
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={allowCashDifferenceClosing}
                  onChange={(e) => setAllowCashDifferenceClosing(e.target.checked)}
                  className="mt-0.5 rounded-sm text-emerald-600 focus:ring-emerald-500"
                />
                <div className="text-xs">
                  <span className="font-bold text-slate-900 block">
                    Permitir cierre de caja con faltante o sobrante
                  </span>
                  <span className="text-slate-500">
                    Requiere justificación obligatoria cuando el dinero físico no coincida con el esperado.
                  </span>
                </div>
              </label>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs active:scale-95 transition-all"
              >
                Guardar Configuración
              </button>
            </div>
          </form>

          {/* Reset Demo Data */}
          <div className="p-5 rounded-2xl border border-slate-200 bg-white space-y-3 shadow-2xs">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Datos de Prueba & Restauración
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              ¿Deseas restablecer las transacciones, préstamos y catálogo de servicios a los datos de
              ejemplo iniciales para demostración?
            </p>
            <button
              type="button"
              onClick={resetToSampleData}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Restaurar Datos de Demostración
            </button>
          </div>
        </div>

        {/* Right 1 Col: Database & Supabase Cloud Integration */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4 shadow-2xs">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Database className="w-5 h-5 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900">
                Base de Datos & Supabase
              </h3>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-slate-400 font-bold uppercase text-[10px] block">
                  Estado de Persistencia
                </span>
                <span className="font-bold text-slate-900 block flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Local Storage Activo (Rápido y Seguro)
                </span>
                <p className="text-[11px] text-slate-500 mt-1">
                  Todos tus datos se guardan de forma instantánea y persistente en el navegador.
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleCopySQL}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-900 text-xs font-bold transition-all"
                >
                  {isCopiedSQL ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  {isCopiedSQL ? '¡SQL Copiado!' : 'Copiar Script SQL Supabase'}
                </button>
              </div>

              <div className="pt-1">
                <button
                  type="button"
                  onClick={handleTestSupabase}
                  disabled={isTestingSupabase}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all disabled:opacity-50"
                >
                  {isTestingSupabase ? (
                    <span className="w-3.5 h-3.5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Server className="w-4 h-4 text-slate-500" />
                  )}
                  Verificar Estado de Conexión
                </button>
              </div>

              {supabaseStatus && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-700 leading-relaxed">
                  {supabaseStatus}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
