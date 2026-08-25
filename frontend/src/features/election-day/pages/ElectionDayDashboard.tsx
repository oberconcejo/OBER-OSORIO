import React, { useState, useEffect } from 'react';

// Interfaz para la cola de sincronización offline (Regla 20 y 21)
interface SyncQueueItem {
  client_uuid: string;
  type: 'FIELD_REPORT' | 'INCIDENT' | 'CHECK_IN';
  payload: any;
  status: 'PENDING_SYNC' | 'SYNCING' | 'SYNCED' | 'FAILED';
}

export const ElectionDayDashboard = () => {
  const [activeTab, setActiveTab] = useState('MONITORING'); // MONITORING, INCIDENTS, OFFLINE_SYNC
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncQueue, setSyncQueue] = useState<SyncQueueItem[]>([]);

  // Regla 20: Detección Offline/Online
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Mock Data para Dashboard (Regla 3)
  const stats = {
    stations: { total: 120, reported: 115, pending: 5, withIssues: 2 },
    tables: { total: 850, reported: 800, pending: 40, withIssues: 10 },
    incidents: { open: 12, inProgress: 5, resolved: 28 }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      
      {/* Header y Estatus de Conexión (Regla 18 y 20) */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Operación Día Electoral</h1>
          <p className="text-sm text-slate-500">Elecciones Territoriales 2026</p>
        </div>
        <div className="flex items-center gap-4">
          {!isOnline && (
            <span className="px-3 py-1 bg-warning/20 text-warning text-sm font-semibold rounded-full border border-warning flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-warning animate-pulse"></span>
              MODO OFFLINE
            </span>
          )}
          {isOnline && (
            <span className="px-3 py-1 bg-success/20 text-success text-sm font-semibold rounded-full border border-success flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-success"></span>
              EN LÍNEA (SSE Activo)
            </span>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-slate-200 pb-2">
        <button onClick={() => setActiveTab('MONITORING')} className={`pb-2 ${activeTab === 'MONITORING' ? 'border-b-2 border-primary text-primary font-medium' : 'text-slate-500'}`}>Monitoreo General</button>
        <button onClick={() => setActiveTab('INCIDENTS')} className={`pb-2 ${activeTab === 'INCIDENTS' ? 'border-b-2 border-primary text-primary font-medium' : 'text-slate-500'}`}>Gestión de Incidentes</button>
        <button onClick={() => setActiveTab('OFFLINE_SYNC')} className={`pb-2 ${activeTab === 'OFFLINE_SYNC' ? 'border-b-2 border-primary text-primary font-medium' : 'text-slate-500'}`}>Cola de Sincronización ({syncQueue.length})</button>
      </div>

      {activeTab === 'MONITORING' && (
        <div className="space-y-6">
          {/* Dashboard Operativo (Regla 3) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* PUESTOS */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
              <h3 className="text-slate-500 font-medium text-sm mb-4">ESTADO DE PUESTOS</h3>
              <div className="flex justify-between items-end mb-2">
                <span className="text-4xl font-bold text-slate-900">{stats.stations.total}</span>
                <span className="text-sm text-slate-500">Total</span>
              </div>
              <div className="space-y-2 mt-4 text-sm">
                <div className="flex justify-between"><span className="text-success">Reportados</span> <span className="font-medium">{stats.stations.reported}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Pendientes</span> <span className="font-medium">{stats.stations.pending}</span></div>
                <div className="flex justify-between"><span className="text-error">Con Novedades</span> <span className="font-medium">{stats.stations.withIssues}</span></div>
              </div>
            </div>

            {/* MESAS */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
              <h3 className="text-slate-500 font-medium text-sm mb-4">ESTADO DE MESAS</h3>
              <div className="flex justify-between items-end mb-2">
                <span className="text-4xl font-bold text-slate-900">{stats.tables.total}</span>
                <span className="text-sm text-slate-500">Total</span>
              </div>
              <div className="space-y-2 mt-4 text-sm">
                <div className="flex justify-between"><span className="text-success">Operativas</span> <span className="font-medium">{stats.tables.reported}</span></div>
                <div className="flex justify-between"><span className="text-warning">Pendientes</span> <span className="font-medium">{stats.tables.pending}</span></div>
                <div className="flex justify-between"><span className="text-error">Con Incidentes</span> <span className="font-medium">{stats.tables.withIssues}</span></div>
              </div>
            </div>

            {/* INCIDENTES (Regla 12, 13) */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-error/30">
              <h3 className="text-slate-500 font-medium text-sm mb-4">ATENCIÓN DE INCIDENTES</h3>
              <div className="flex justify-between items-end mb-2">
                <span className="text-4xl font-bold text-error">{stats.incidents.open}</span>
                <span className="text-sm text-slate-500">Abiertos</span>
              </div>
              <div className="space-y-2 mt-4 text-sm">
                <div className="flex justify-between"><span className="text-warning">En Progreso</span> <span className="font-medium">{stats.incidents.inProgress}</span></div>
                <div className="flex justify-between"><span className="text-success">Resueltos</span> <span className="font-medium">{stats.incidents.resolved}</span></div>
              </div>
            </div>

          </div>

          {/* Semáforo Operativo y Listado de Puestos (Reglas 6 y 25) */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mt-6">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
              <span className="font-medium text-slate-700">Monitoreo Detallado por Puesto</span>
              <input type="text" placeholder="Buscar puesto o responsable..." className="px-3 py-1 border rounded text-sm focus:ring-1 outline-none" />
            </div>
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 border-b">
                <tr>
                  <th className="p-4">Puesto</th>
                  <th className="p-4">Estado Operativo</th>
                  <th className="p-4">Mesas Reportadas</th>
                  <th className="p-4">Último Reporte</th>
                  <th className="p-4">Responsable</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr className="hover:bg-slate-50">
                  <td className="p-4 font-medium">Puesto Demo 001</td>
                  <td className="p-4">
                    <span className="px-2 py-1 bg-success/10 text-success rounded-full text-xs font-semibold">OPERATIVO</span>
                  </td>
                  <td className="p-4">12 / 12</td>
                  <td className="p-4">08:35 AM</td>
                  <td className="p-4 text-slate-500">Juan Pérez</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="p-4 font-medium">Puesto Demo 002</td>
                  <td className="p-4">
                    <span className="px-2 py-1 bg-error/10 text-error rounded-full text-xs font-semibold">CON NOVEDAD</span>
                  </td>
                  <td className="p-4">8 / 10</td>
                  <td className="p-4">08:15 AM</td>
                  <td className="p-4 text-slate-500">María Gómez</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="p-4 font-medium">Puesto Demo 003</td>
                  <td className="p-4">
                    <span className="px-2 py-1 bg-warning/10 text-warning rounded-full text-xs font-semibold">SIN REPORTE</span>
                  </td>
                  <td className="p-4">0 / 5</td>
                  <td className="p-4">--</td>
                  <td className="p-4 text-slate-500">Carlos Díaz</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'OFFLINE_SYNC' && (
        <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 text-center">
          <div className="w-16 h-16 mx-auto bg-slate-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
          </div>
          <h2 className="text-xl font-medium text-slate-700">Cola de Sincronización</h2>
          <p className="text-slate-500 mt-2 max-w-md mx-auto">
            Los reportes operativos realizados sin conexión a internet se almacenan aquí de forma segura. 
            Se enviarán automáticamente cuando recuperes la conexión utilizando identificadores únicos (UUID) para evitar duplicados.
          </p>
          <div className="mt-6 inline-flex gap-2">
            <button className="px-4 py-2 bg-primary text-white rounded-lg font-medium opacity-50 cursor-not-allowed">
              Sincronizando...
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
