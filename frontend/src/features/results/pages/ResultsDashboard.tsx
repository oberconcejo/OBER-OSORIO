import React, { useState } from 'react';

export const ResultsDashboard = () => {
  const [activeTab, setActiveTab] = useState('DASHBOARD'); // DASHBOARD, ACTS, CONFLICTS
  
  // Mock Data (Regla 28, 29)
  const dashboardStats = {
    tables: { total: 1000, reported: 850, validated: 600, conflicts: 12 },
    progress: 85, // "Avance de procesamiento interno"
  };

  const candidates = [
    { name: 'Candidato Demo A', votes: 15200, percentage: 45.2, status: 'VALIDADO INTERNAMENTE' },
    { name: 'Candidato Demo B', votes: 12500, percentage: 37.1, status: 'VALIDADO INTERNAMENTE' },
    { name: 'Voto en Blanco', votes: 5950, percentage: 17.7, status: 'VALIDADO INTERNAMENTE' }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      
      {/* Disclaimer Provisional (Regla 32) */}
      <div className="bg-warning/10 border border-warning text-warning-800 p-3 rounded-lg flex items-center gap-3">
        <svg className="w-5 h-5 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
        <p className="text-sm font-medium"><strong>RESULTADOS NO OFICIALES.</strong> Este módulo es una herramienta de consolidación y procesamiento logístico interno provisional.</p>
      </div>

      <div className="flex justify-between items-end mb-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Escrutinio y Resultados</h1>
          <p className="text-sm text-slate-500">Elección Alcaldía 2026 - Municipio Demo</p>
        </div>
        <button className="px-4 py-2 bg-primary text-white text-sm font-medium rounded shadow hover:bg-primary/90">
          Cargar Acta
        </button>
      </div>

      <div className="flex gap-4 border-b border-slate-200 pb-2">
        <button onClick={() => setActiveTab('DASHBOARD')} className={`pb-2 ${activeTab === 'DASHBOARD' ? 'border-b-2 border-primary text-primary font-medium' : 'text-slate-500'}`}>Consolidado General</button>
        <button onClick={() => setActiveTab('ACTS')} className={`pb-2 ${activeTab === 'ACTS' ? 'border-b-2 border-primary text-primary font-medium' : 'text-slate-500'}`}>Control de Actas ({dashboardStats.tables.reported})</button>
        <button onClick={() => setActiveTab('CONFLICTS')} className={`pb-2 ${activeTab === 'CONFLICTS' ? 'border-b-2 border-error text-error font-medium' : 'text-slate-500'}`}>Revisiones y Conflictos ({dashboardStats.tables.conflicts})</button>
      </div>

      {activeTab === 'DASHBOARD' && (
        <div className="space-y-6">
          {/* Tarjetas de Indicadores */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
              <p className="text-xs text-slate-500 font-semibold mb-1">AVANCE DE PROCESAMIENTO</p>
              <p className="text-3xl font-bold text-slate-900">{dashboardStats.progress}%</p>
              <p className="text-xs text-slate-500 mt-1">{dashboardStats.tables.reported} de {dashboardStats.tables.total} mesas procesadas</p>
              <div className="w-full bg-slate-100 h-1.5 mt-3 rounded-full overflow-hidden">
                <div className="bg-primary h-full" style={{ width: `${dashboardStats.progress}%` }}></div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
              <p className="text-xs text-slate-500 font-semibold mb-1">MESAS VALIDADAS</p>
              <p className="text-3xl font-bold text-success">{dashboardStats.tables.validated}</p>
              <p className="text-xs text-slate-500 mt-1">Doble revisión superada</p>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
              <p className="text-xs text-slate-500 font-semibold mb-1">CONFLICTOS DE OCR / ACTA</p>
              <p className="text-3xl font-bold text-error">{dashboardStats.tables.conflicts}</p>
              <p className="text-xs text-slate-500 mt-1">Requieren resolución manual</p>
            </div>
          </div>

          {/* Tabla de Resultados por Candidato (Regla 34) */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
              <span className="font-medium text-slate-700">Resultados Acumulados Internos</span>
            </div>
            <table className="w-full text-left text-sm">
              <thead className="text-slate-500 border-b">
                <tr>
                  <th className="p-4 font-medium">Candidato / Categoría</th>
                  <th className="p-4 font-medium">Votos</th>
                  <th className="p-4 font-medium">Porcentaje (%)</th>
                  <th className="p-4 font-medium">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {candidates.map((c, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="p-4 font-medium text-slate-900">{c.name}</td>
                    <td className="p-4 font-bold">{c.votes.toLocaleString()}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="w-12">{c.percentage}%</span>
                        <div className="w-24 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-primary h-full" style={{ width: `${c.percentage}%` }}></div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-semibold">
                        {c.status}
                      </span>
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
