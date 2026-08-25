import React, { useState } from 'react';

export const ControlCenterDashboard = () => {
  const [activeTab, setActiveTab] = useState('EXECUTIVE'); // EXECUTIVE, TERRITORIAL, AUDIT, EXPORTS
  
  // Datos mock que provienen exclusivamente de las Fases 1 a 9 (Regla 1 y 79)
  const stats = {
    tablesTotal: 1000,
    tablesReported: 850,
    tablesValidated: 600,
    incidentsOpen: 12,
    incidentsResolved: 156,
  };

  const auditLogs = [
    { id: 'AL-001', user: 'Admin', action: 'RESULT_VALIDATED', entity: 'Mesa 001', date: '2026-10-25 15:30:00' },
    { id: 'AL-002', user: 'Coordinador Z1', action: 'INCIDENT_CREATED', entity: 'Puesto Demo', date: '2026-10-25 15:28:00' }
  ];

  const exportJobs = [
    { id: 'JOB-991', type: 'RESULTADOS CONSOLIDADOS', status: 'COMPLETED', date: '2026-10-25 14:00', url: '#' },
    { id: 'JOB-992', type: 'INFORME DE INCIDENTES', status: 'PROCESSING', date: '2026-10-25 15:30', url: null }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 bg-slate-50 min-h-screen">
      
      {/* Encabezado y Filtros Globales (Regla 2, 4 y 5) */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Centro de Control Electoral</h1>
          <p className="text-sm text-slate-500">Elección Alcaldía 2026 - Vista Ejecutiva Integral</p>
        </div>
        <div className="flex gap-2">
          <select className="px-3 py-2 border rounded-lg text-sm bg-slate-50 outline-none focus:border-primary">
            <option>Filtro: Todo el Departamento</option>
            <option>Municipio Demo</option>
          </select>
          <select className="px-3 py-2 border rounded-lg text-sm bg-slate-50 outline-none focus:border-primary">
            <option>Rango: Día Electoral</option>
            <option>Últimos 7 días</option>
          </select>
          <button className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium shadow">Actualizar</button>
        </div>
      </div>

      {/* Navegación del Dashboard (Regla 3) */}
      <div className="flex gap-4 border-b border-slate-200 pb-2 overflow-x-auto">
        <button onClick={() => setActiveTab('EXECUTIVE')} className={`pb-2 whitespace-nowrap ${activeTab === 'EXECUTIVE' ? 'border-b-2 border-primary text-primary font-medium' : 'text-slate-500'}`}>Resumen Ejecutivo</button>
        <button onClick={() => setActiveTab('TERRITORIAL')} className={`pb-2 whitespace-nowrap ${activeTab === 'TERRITORIAL' ? 'border-b-2 border-primary text-primary font-medium' : 'text-slate-500'}`}>Analítica Territorial</button>
        <button onClick={() => setActiveTab('AUDIT')} className={`pb-2 whitespace-nowrap ${activeTab === 'AUDIT' ? 'border-b-2 border-primary text-primary font-medium' : 'text-slate-500'}`}>Centro de Auditoría</button>
        <button onClick={() => setActiveTab('EXPORTS')} className={`pb-2 whitespace-nowrap ${activeTab === 'EXPORTS' ? 'border-b-2 border-primary text-primary font-medium' : 'text-slate-500'}`}>Exportaciones y Reportes</button>
      </div>

      {activeTab === 'EXECUTIVE' && (
        <div className="space-y-6">
          {/* Tarjetas de Métricas - Datos provienen de F8 y F9 (Reglas 8, 9, 10, 11) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 hover:border-primary transition cursor-pointer">
              <p className="text-xs text-slate-500 font-bold mb-1">COBERTURA DE MESAS</p>
              <p className="text-3xl font-bold text-slate-900">85%</p>
              <p className="text-xs text-slate-500 mt-1">{stats.tablesReported} de {stats.tablesTotal} cubiertas</p>
            </div>
            <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 hover:border-success transition cursor-pointer">
              <p className="text-xs text-slate-500 font-bold mb-1">RESULTADOS VALIDADOS</p>
              <p className="text-3xl font-bold text-success">{stats.tablesValidated}</p>
              <p className="text-xs text-slate-500 mt-1">Doble revisión completada</p>
            </div>
            <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 hover:border-error transition cursor-pointer">
              <p className="text-xs text-slate-500 font-bold mb-1">INCIDENTES ABIERTOS</p>
              <p className="text-3xl font-bold text-error">{stats.incidentsOpen}</p>
              <p className="text-xs text-slate-500 mt-1">{stats.incidentsResolved} resueltos (Fase 8)</p>
            </div>
            <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 hover:border-primary transition cursor-pointer flex flex-col justify-center items-center text-center">
              <p className="text-sm font-bold text-primary mb-2">Generar Informe General</p>
              <button className="px-4 py-2 bg-primary/10 text-primary font-medium rounded-lg text-xs w-full">Exportar PDF</button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'AUDIT' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
            <span className="font-medium text-slate-700">Trazabilidad Inmutable (Regla 18 y 21)</span>
            <input type="text" placeholder="Buscar ID, Usuario o Acción..." className="px-3 py-1 border rounded text-sm outline-none focus:ring-1 focus:ring-primary" />
          </div>
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 border-b">
              <tr>
                <th className="p-4">Fecha / Hora</th>
                <th className="p-4">Usuario</th>
                <th className="p-4">Acción</th>
                <th className="p-4">Entidad</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {auditLogs.map((log, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="p-4 text-slate-500 font-mono text-xs">{log.date}</td>
                  <td className="p-4 font-medium text-slate-900">{log.user}</td>
                  <td className="p-4">
                    <span className="px-2 py-1 bg-slate-100 rounded text-xs font-semibold">{log.action}</span>
                  </td>
                  <td className="p-4 text-slate-600">{log.entity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'EXPORTS' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
            <span className="font-medium text-slate-700">Historial de Exportaciones Asíncronas (Regla 23, 24)</span>
            <button className="px-4 py-2 bg-primary text-white rounded shadow text-sm font-medium">Nueva Exportación</button>
          </div>
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 border-b">
              <tr>
                <th className="p-4">ID Job</th>
                <th className="p-4">Tipo de Reporte</th>
                <th className="p-4">Fecha Solicitud</th>
                <th className="p-4">Estado</th>
                <th className="p-4">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {exportJobs.map((job, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="p-4 text-slate-500 font-mono text-xs">{job.id}</td>
                  <td className="p-4 font-medium text-slate-900">{job.type}</td>
                  <td className="p-4 text-slate-600">{job.date}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${job.status === 'COMPLETED' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
                      {job.status}
                    </span>
                  </td>
                  <td className="p-4">
                    {job.url ? (
                      <a href={job.url} className="text-primary hover:underline font-medium">Descargar</a>
                    ) : (
                      <span className="text-slate-400">Generando...</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
