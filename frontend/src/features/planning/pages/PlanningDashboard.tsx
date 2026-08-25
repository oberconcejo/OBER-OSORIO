import React, { useState } from 'react';

export const PlanningDashboard = () => {
  const [activeView, setActiveView] = useState('DASHBOARD'); // DASHBOARD, KANBAN, ALERTS

  // Datos mock para UI que reflejan la lógica backend solicitada
  const coverageMock = { total: 850, covered: 680, pending: 170, percentage: 80, semaphore: 'ALTO' };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      
      {/* Header con breadcrumbs (Regla 5) */}
      <div className="flex flex-col mb-4">
        <h1 className="text-2xl font-semibold text-slate-900">Gestión Territorial Operativa</h1>
        <div className="text-sm text-slate-500 mt-1 flex gap-2">
          <span className="hover:text-primary cursor-pointer">Córdoba</span> {'>'} 
          <span className="hover:text-primary cursor-pointer">Cotorra</span> {'>'} 
          <span className="font-medium text-slate-700">Zona 001</span>
        </div>
      </div>

      {/* Navegación de vistas */}
      <div className="flex gap-4 border-b border-slate-200 pb-2">
        <button onClick={() => setActiveView('DASHBOARD')} className={`pb-2 ${activeView === 'DASHBOARD' ? 'border-b-2 border-primary text-primary font-medium' : 'text-slate-500'}`}>Dashboard & Cobertura</button>
        <button onClick={() => setActiveView('KANBAN')} className={`pb-2 ${activeView === 'KANBAN' ? 'border-b-2 border-primary text-primary font-medium' : 'text-slate-500'}`}>Tablero Kanban</button>
        <button onClick={() => setActiveView('ALERTS')} className={`pb-2 ${activeView === 'ALERTS' ? 'border-b-2 border-primary text-primary font-medium' : 'text-slate-500'}`}>Centro de Alertas</button>
      </div>

      {activeView === 'DASHBOARD' && (
        <div className="space-y-6">
          {/* Indicadores Principales (Regla 3) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
              <p className="text-sm text-slate-500 font-medium">TOTAL ELECTORES</p>
              <p className="text-2xl font-bold text-slate-900">12,540</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
              <p className="text-sm text-slate-500 font-medium">MIEMBROS EQUIPO</p>
              <p className="text-2xl font-bold text-slate-900">85</p>
            </div>
            
            {/* Semáforo Operativo (Regla 10) */}
            <div className={`p-4 rounded-lg shadow-sm border ${coverageMock.semaphore === 'ALTO' ? 'bg-success/10 border-success' : 'bg-warning/10 border-warning'}`}>
              <p className="text-sm font-medium">COBERTURA DE MESAS</p>
              <p className="text-3xl font-bold">{coverageMock.percentage}%</p>
              <p className="text-xs mt-1">{coverageMock.covered} de {coverageMock.total} cubiertas</p>
            </div>
          </div>

          {/* Matriz Territorial (Regla 9) */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50 font-medium text-slate-700">Matriz Territorial</div>
            <table className="w-full text-left">
              <thead className="text-sm text-slate-500 border-b">
                <tr>
                  <th className="p-4">Territorio</th>
                  <th className="p-4">Electores</th>
                  <th className="p-4">Equipo</th>
                  <th className="p-4">Puestos</th>
                  <th className="p-4">Mesas</th>
                  <th className="p-4">Cobertura</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr className="hover:bg-slate-50">
                  <td className="p-4 font-medium">Municipio A</td>
                  <td className="p-4">12,540</td>
                  <td className="p-4">80</td>
                  <td className="p-4">12</td>
                  <td className="p-4">86</td>
                  <td className="p-4"><span className="text-success font-medium">81%</span></td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="p-4 font-medium">Municipio B</td>
                  <td className="p-4">8,200</td>
                  <td className="p-4">40</td>
                  <td className="p-4">8</td>
                  <td className="p-4">60</td>
                  <td className="p-4"><span className="text-warning font-medium">67%</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeView === 'KANBAN' && (
        <div className="bg-slate-50 p-4 rounded-lg flex gap-4 overflow-x-auto min-h-[400px]">
          {/* Regla 14: Tablero Kanban Visual */}
          <div className="w-80 flex-shrink-0 bg-slate-200/50 rounded-lg p-2 border border-slate-200">
            <h3 className="font-semibold text-slate-700 mb-2 px-2">PENDIENTE</h3>
            <div className="bg-white p-3 rounded shadow-sm border border-slate-200 mb-2 cursor-grab">
              <span className="text-xs font-bold text-error bg-error/10 px-2 py-1 rounded">CRITICAL</span>
              <p className="mt-2 text-sm font-medium">Actualizar responsables Municipio A</p>
            </div>
          </div>
          <div className="w-80 flex-shrink-0 bg-slate-200/50 rounded-lg p-2 border border-slate-200">
            <h3 className="font-semibold text-slate-700 mb-2 px-2">EN PROGRESO</h3>
          </div>
          <div className="w-80 flex-shrink-0 bg-slate-200/50 rounded-lg p-2 border border-slate-200">
            <h3 className="font-semibold text-slate-700 mb-2 px-2">COMPLETADO</h3>
          </div>
        </div>
      )}
    </div>
  );
};
