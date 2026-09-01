import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { UserProfile, UserRole } from '../types';
import { formatDateTime } from '../utils/formatters';
import {
  Users,
  Plus,
  ShieldCheck,
  UserCheck,
  ToggleLeft,
  ToggleRight,
  ShieldAlert,
} from 'lucide-react';

export const UsersPage: React.FC = () => {
  const { users, currentUser, addUser, toggleUserActive } = useApp();

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [role, setRole] = useState<UserRole>('cajero');

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    addUser({
      name: name.trim(),
      email: email.trim(),
      role,
      isActive: true,
    });

    setName('');
    setEmail('');
    setRole('cajero');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Gestión de Usuarios & Roles
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Administración de permisos de acceso (Administradores y Cajeros)
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          Nuevo Usuario
        </button>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map((user) => (
          <div
            key={user.id}
            className={`rounded-2xl border p-5 bg-white space-y-4 shadow-2xs transition-all ${
              user.isActive ? 'border-slate-200' : 'border-slate-100 opacity-60 bg-slate-50'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm text-white ${
                    user.role === 'admin' ? 'bg-indigo-600' : 'bg-emerald-600'
                  }`}
                >
                  {user.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">{user.name}</h4>
                  <span className="text-xs text-slate-500">{user.email}</span>
                </div>
              </div>

              {currentUser.id !== user.id && (
                <button
                  type="button"
                  onClick={() => toggleUserActive(user.id)}
                  className="text-slate-400 hover:text-slate-700"
                  title={user.isActive ? 'Desactivar usuario' : 'Activar usuario'}
                >
                  {user.isActive ? (
                    <ToggleRight className="w-6 h-6 text-emerald-600" />
                  ) : (
                    <ToggleLeft className="w-6 h-6 text-slate-300" />
                  )}
                </button>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
              <span className="text-slate-400">Rol asignado:</span>
              <Badge variant={user.role === 'admin' ? 'indigo' : 'emerald'} size="sm">
                {user.role === 'admin' ? '🛡️ Administrador' : '💼 Cajero'}
              </Badge>
            </div>

            <div className="text-[11px] text-slate-400">
              Registrado: {formatDateTime(user.createdAt)}
            </div>
          </div>
        ))}
      </div>

      {/* New User Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Crear Nuevo Usuario"
        subtitle="Asigna un nuevo operador o administrador para el punto de pago"
        maxWidth="md"
      >
        <form onSubmit={handleCreateUser} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Nombre Completo <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Camilo Andrés Morales"
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:outline-hidden focus:border-slate-800"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Correo Electrónico <span className="text-rose-500">*</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="camilo@puntodepago.com"
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:outline-hidden focus:border-slate-800"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Rol en el Sistema <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label
                className={`flex flex-col p-3 rounded-xl border cursor-pointer transition-all ${
                  role === 'cajero'
                    ? 'border-emerald-600 bg-emerald-50/50 text-emerald-950 font-bold'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <input
                    type="radio"
                    name="userRole"
                    value="cajero"
                    checked={role === 'cajero'}
                    onChange={() => setRole('cajero')}
                    className="accent-emerald-600"
                  />
                  <span className="text-xs">💼 Cajero</span>
                </div>
                <span className="text-[11px] font-normal text-slate-500">
                  Operaciones diarias, cobros, gastos y arqueo.
                </span>
              </label>

              <label
                className={`flex flex-col p-3 rounded-xl border cursor-pointer transition-all ${
                  role === 'admin'
                    ? 'border-indigo-600 bg-indigo-50/50 text-indigo-950 font-bold'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <input
                    type="radio"
                    name="userRole"
                    value="admin"
                    checked={role === 'admin'}
                    onChange={() => setRole('admin')}
                    className="accent-indigo-600"
                  />
                  <span className="text-xs">🛡️ Administrador</span>
                </div>
                <span className="text-[11px] font-normal text-slate-500">
                  Control total, reapertura de caja, configuración y auditoría.
                </span>
              </label>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!name.trim() || !email.trim()}
              className="flex-1 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold shadow-md shadow-slate-900/20 disabled:opacity-50"
            >
              Guardar Usuario
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
