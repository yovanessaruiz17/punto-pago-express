import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Lock,
  Mail,
  KeyRound,
  ShieldCheck,
  UserCheck,
  Sparkles,
  ArrowRight,
  Building2,
  CheckCircle2,
  Layers,
  Coins,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, isProcessing } = useApp();
  const [emailOrUser, setEmailOrUser] = useState<string>('admin@puntoexpress.co');
  const [password, setPassword] = useState<string>('••••••••');
  const [errorMsg, setErrorMsg] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOrUser.trim()) {
      setErrorMsg('Por favor ingresa tu correo electrónico o usuario');
      return;
    }
    setErrorMsg('');
    await login(emailOrUser, password);
  };

  const handleQuickDemoLogin = async (role: 'admin' | 'cajero') => {
    if (role === 'admin') {
      setEmailOrUser('admin@puntoexpress.co');
      setPassword('admin123');
      await login('admin@puntoexpress.co');
    } else {
      setEmailOrUser('cajero@puntoexpress.co');
      setPassword('cajero123');
      await login('cajero@puntoexpress.co');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden selection:bg-emerald-500 selection:text-white">
      {/* Background Decorative Gradient Orbs */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-500 text-slate-950 font-black text-2xl shadow-xl shadow-emerald-500/20 mb-4 ring-8 ring-emerald-500/10">
            ⚡
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Punto de Pago Express
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1.5 font-medium">
            Sistema Integral de Control de Caja, Plataformas & Servicios
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-slate-800/90 backdrop-blur-xl border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl">
          <div className="mb-6">
            <h2 className="text-lg font-extrabold text-white">Iniciar Sesión</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Ingresa tus credenciales para acceder al terminal de caja
            </p>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5" htmlFor="email-input">
                Correo Electrónico o Usuario
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="email-input"
                  type="text"
                  required
                  value={emailOrUser}
                  onChange={(e) => setEmailOrUser(e.target.value)}
                  placeholder="admin@puntoexpress.co"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-medium"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-300" htmlFor="password-input">
                  Contraseña
                </label>
                <span className="text-[11px] text-slate-400 hover:text-emerald-400 cursor-pointer">
                  ¿Olvidaste tu clave?
                </span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  id="password-input"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20 active:scale-98 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isProcessing ? (
                <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Entrar al Sistema</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Access Options */}
          <div className="mt-6 pt-6 border-t border-slate-700/80">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 text-center mb-3">
              Acceso Rápido Demostrativo
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('admin')}
                className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-slate-700/50 hover:bg-slate-700 border border-slate-600/80 text-xs font-bold text-white transition-all text-left"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <span className="block text-xs leading-none">Administrador</span>
                  <span className="text-[9px] text-slate-400 font-normal">Acceso total</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('cajero')}
                className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-slate-700/50 hover:bg-slate-700 border border-slate-600/80 text-xs font-bold text-white transition-all text-left"
              >
                <UserCheck className="w-4 h-4 text-indigo-400 shrink-0" />
                <div>
                  <span className="block text-xs leading-none">Cajero Operativo</span>
                  <span className="text-[9px] text-slate-400 font-normal">Caja y cobros</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="mt-8 grid grid-cols-3 gap-3 text-center">
          <div className="p-3 rounded-2xl bg-slate-800/40 border border-slate-800">
            <Coins className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
            <span className="text-[10px] font-bold text-slate-300 block">Caja Física</span>
            <span className="text-[9px] text-slate-500">Arqueos & Cierres</span>
          </div>
          <div className="p-3 rounded-2xl bg-slate-800/40 border border-slate-800">
            <Layers className="w-4 h-4 text-teal-400 mx-auto mb-1" />
            <span className="text-[10px] font-bold text-slate-300 block">PTM, Bemovil & Pago</span>
            <span className="text-[9px] text-slate-500">Saldo en Plataformas</span>
          </div>
          <div className="p-3 rounded-2xl bg-slate-800/40 border border-slate-800">
            <Sparkles className="w-4 h-4 text-indigo-400 mx-auto mb-1" />
            <span className="text-[10px] font-bold text-slate-300 block">Recaudos & Servicios</span>
            <span className="text-[9px] text-slate-500">Control en Tiempo Real</span>
          </div>
        </div>
      </div>
    </div>
  );
};
