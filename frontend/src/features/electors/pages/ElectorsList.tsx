import React, { useState, useEffect } from 'react';
// import { axiosInstance } from '../../../lib/axios';

export const ElectorsList = () => {
  const [electors, setElectors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  // Ejemplo conceptual de consumo API protegido
  const fetchElectors = async () => {
    setLoading(true);
    try {
      // await axiosInstance.get(`/electors?page=${page}&search=${search}`);
      // Seteo mock para demostración de UI
      setElectors([{ id: '1', first_name: 'Juan', last_name: 'Pérez', document_number: '1.234.***.789', status: 'ACTIVE' }]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchElectors();
  }, [page]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">Gestión de Electores</h1>
        <div className="flex gap-2 mt-4 md:mt-0">
          <button className="bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg">Importar</button>
          <button className="bg-primary text-white px-4 py-2 rounded-lg">+ Registrar elector</button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200">
          <input 
            type="text" 
            placeholder="Buscar por documento o nombre..." 
            className="w-full md:w-1/3 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        {loading ? (
          <div className="p-8 text-center text-slate-500">Cargando información...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-600 text-sm">
                <tr>
                  <th className="p-4 font-medium">Nombre</th>
                  <th className="p-4 font-medium">Documento</th>
                  <th className="p-4 font-medium">Estado</th>
                  <th className="p-4 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {electors.map((e: any) => (
                  <tr key={e.id} className="hover:bg-slate-50">
                    <td className="p-4 text-slate-900">{e.first_name} {e.last_name}</td>
                    <td className="p-4 text-slate-600 font-mono">{e.document_number}</td>
                    <td className="p-4">
                      <span className="px-2 py-1 bg-success/10 text-success text-xs rounded-full">
                        {e.status}
                      </span>
                    </td>
                    <td className="p-4 text-primary cursor-pointer hover:underline">Ver ficha</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
