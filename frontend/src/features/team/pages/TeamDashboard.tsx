import React, { useState } from 'react';

export const TeamDashboard = () => {
  const [activeTab, setActiveTab] = useState('LIST');

  // Datos mock para UI (Regla 49)
  const mockMembers = [
    { id: 1, name: 'Juan Pérez', doc: '1.234.***.789', position: 'Coordinador Municipal', territory: 'Cotorra', user: 'juan.perez', status: 'ACTIVE' },
    { id: 2, name: 'María Gómez', doc: '8.888.***.888', position: 'Responsable de Mesa', territory: 'Mesa Demo 001', user: 'Sin usuario', status: 'PENDING' }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      
      {/* Regla 19: Dashboard e Indicadores */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500 font-medium">TOTAL MIEMBROS</p>
          <p className="text-3xl font-bold text-slate-900">250</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500 font-medium">ACTIVOS</p>
          <p className="text-3xl font-bold text-success">220</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500 font-medium">MESAS CON RESPONSABLE</p>
          <p className="text-3xl font-bold text-primary">65%</p>
          <div className="w-full bg-slate-200 h-2 mt-2 rounded-full overflow-hidden">
            <div className="bg-primary h-full" style={{ width: '65%' }}></div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 flex items-center gap-4">
          <button className="bg-primary text-white w-full py-2 rounded-lg font-medium">+ Agregar Miembro</button>
        </div>
      </div>

      {/* Regla 5 y 18: Tabla de Listado */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center">
          <input type="text" placeholder="Buscar por documento o nombre..." className="w-full md:w-1/3 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none" />
          <div className="flex gap-2">
            <button className="text-slate-600 px-4 py-2 border rounded-lg hover:bg-slate-50">Filtros</button>
            <button className="text-slate-600 px-4 py-2 border rounded-lg hover:bg-slate-50">Exportar</button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-600 text-sm">
              <tr>
                <th className="p-4 font-medium">Nombre</th>
                <th className="p-4 font-medium">Documento</th>
                <th className="p-4 font-medium">Cargo</th>
                <th className="p-4 font-medium">Territorio</th>
                <th className="p-4 font-medium">Usuario</th>
                <th className="p-4 font-medium">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {mockMembers.map((m: any) => (
                <tr key={m.id} className="hover:bg-slate-50 cursor-pointer">
                  <td className="p-4 font-medium text-slate-900">{m.name}</td>
                  <td className="p-4 text-slate-500 font-mono">{m.doc}</td>
                  <td className="p-4 text-slate-700">{m.position}</td>
                  <td className="p-4 text-slate-700">{m.territory}</td>
                  <td className="p-4 text-slate-500">{m.user}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${m.status === 'ACTIVE' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
                      {m.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
