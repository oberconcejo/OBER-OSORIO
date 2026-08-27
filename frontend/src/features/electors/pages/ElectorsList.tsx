import React, { useState, useEffect } from 'react';
import { electorsService, Elector } from '../services/electors.service';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { AlertCircle, Plus, Search, X } from 'lucide-react';

export const ElectorsList = () => {
  const [electors, setElectors] = useState<Elector[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [formData, setFormData] = useState({
    document_type: 'CC',
    document_number: '',
    first_name: '',
    last_name: ''
  });

  const fetchElectors = async () => {
    setLoading(true);
    try {
      const data = await electorsService.getAll(search);
      setElectors(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchElectors();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalLoading(true);
    setModalError(null);
    try {
      await electorsService.create(formData);
      setIsModalOpen(false);
      setFormData({ document_type: 'CC', document_number: '', first_name: '', last_name: '' });
      fetchElectors();
    } catch (err: any) {
      setModalError(err.response?.data?.message || 'Error al crear elector');
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">Gestin de Electores</h1>
        <div className="flex gap-2 mt-4 md:mt-0">
          <Button variant="outline">Importar</Button>
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus size={18} className="mr-2" />
            Registrar elector
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center gap-2">
          <Search size={20} className="text-slate-400" />
          <input 
            type="text" 
            placeholder="Buscar por documento o nombre..." 
            className="w-full md:w-1/3 px-2 py-1 outline-none text-slate-700"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        {loading && electors.length === 0 ? (
          <div className="p-8 text-center text-slate-500">Cargando informacin...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-600 text-sm">
                <tr>
                  <th className="p-4 font-medium">Documento</th>
                  <th className="p-4 font-medium">Nombre Completo</th>
                  <th className="p-4 font-medium">Estado</th>
                  <th className="p-4 font-medium">Registro</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {electors.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-slate-500">
                      No se encontraron electores
                    </td>
                  </tr>
                )}
                {electors.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 text-slate-900 font-medium">
                      {e.document_type} {e.document_number}
                    </td>
                    <td className="p-4 text-slate-700">{e.first_name} {e.last_name}</td>
                    <td className="p-4">
                      <span className="px-2 py-1 bg-success/10 text-success text-xs rounded-full font-medium">
                        {e.status}
                      </span>
                    </td>
                    <td className="p-4 text-slate-500 text-sm">
                      {new Date(e.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Creacin */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-lg font-semibold">Registrar Elector</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="p-4 space-y-4">
                {modalError && (
                  <div className="flex items-center gap-2 rounded-md bg-danger/15 p-3 text-sm text-danger">
                    <AlertCircle size={16} />
                    <p>{modalError}</p>
                  </div>
                )}
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1 col-span-1">
                    <label className="text-sm font-medium">Tipo</label>
                    <select 
                      className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      value={formData.document_type}
                      onChange={(e) => setFormData({...formData, document_type: e.target.value})}
                    >
                      <option value="CC">CC</option>
                      <option value="TI">TI</option>
                      <option value="CE">CE</option>
                      <option value="PASAPORTE">PASAPORTE</option>
                    </select>
                  </div>
                  <div className="space-y-1 col-span-2">
                    <label className="text-sm font-medium">Nmero de Documento</label>
                    <Input 
                      required 
                      value={formData.document_number}
                      onChange={(e) => setFormData({...formData, document_number: e.target.value})}
                      placeholder="Ej: 1000123456" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Nombres</label>
                    <Input 
                      required 
                      value={formData.first_name}
                      onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Apellidos</label>
                    <Input 
                      required 
                      value={formData.last_name}
                      onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 p-4 border-t bg-slate-50">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={modalLoading}>
                  {modalLoading ? 'Guardando...' : 'Guardar elector'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
