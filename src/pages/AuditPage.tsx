import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { formatDateTime } from '../utils/formatters';
import { ShieldAlert, Search, History, Filter } from 'lucide-react';

export const AuditPage: React.FC = () => {
  const { auditLogs } = useApp();

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedActionFilter, setSelectedActionFilter] = useState<string>('all');

  const filteredLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      if (selectedActionFilter !== 'all' && log.action !== selectedActionFilter) {
        return false;
      }

      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const matchesDetails = log.details.toLowerCase().includes(term);
        const matchesUser = log.userName.toLowerCase().includes(term);
        const matchesAction = log.action.toLowerCase().includes(term);
        if (!matchesDetails && !matchesUser && !matchesAction) {
          return false;
        }
      }

      return true;
    });
  }, [auditLogs, selectedActionFilter, searchTerm]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
          Registro de Auditoría & Trazabilidad
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Bitácora inalterable de aperturas, cierres, anulaciones, préstamos y modificaciones críticas
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por usuario o detalle..."
            className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:border-slate-800"
          />
        </div>

        <select
          value={selectedActionFilter}
          onChange={(e) => setSelectedActionFilter(e.target.value)}
          className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden font-medium"
        >
          <option value="all">Todas las acciones</option>
          <option value="apertura_caja">Aperturas de Caja</option>
          <option value="cierre_caja">Cierres de Caja</option>
          <option value="reapertura_caja">Reaperturas de Caja</option>
          <option value="anulacion_movimiento">Anulaciones de Movimiento</option>
          <option value="creacion_prestamo">Creación de Préstamos</option>
          <option value="abono_prestamo">Abonos a Préstamos</option>
          <option value="cambio_configuracion">Cambios de Configuración</option>
        </select>
      </div>

      {/* Audit Log Timeline */}
      {filteredLogs.length === 0 ? (
        <EmptyState
          title="Sin registros de auditoría"
          description="Las acciones críticas del sistema quedarán registradas automáticamente aquí."
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Fecha y Hora</th>
                  <th className="py-3 px-4">Acción</th>
                  <th className="py-3 px-4">Usuario Responsable</th>
                  <th className="py-3 px-4">Detalle del Evento</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 whitespace-nowrap font-medium text-slate-500">
                      {formatDateTime(log.createdAt)}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="inline-block px-2.5 py-1 rounded-md font-bold text-[10px] uppercase bg-slate-900 text-white">
                        {log.action.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap font-bold text-slate-900">
                      {log.userName}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-700 font-medium leading-relaxed">
                      {log.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
