import React, { useState, useEffect } from 'react';
import { logisticsService, PollingStation, Zone } from '../services/logistics.service';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Plus, MapPin, Hash, X } from 'lucide-react';

export const Logistics = () => {
  const [stations, setStations] = useState<PollingStation[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal para Puesto
  const [isStationModalOpen, setIsStationModalOpen] = useState(false);
  const [newStationName, setNewStationName] = useState('');
  const [selectedZoneId, setSelectedZoneId] = useState('');

  // Modal para Mesa
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [activeStationId, setActiveStationId] = useState('');
  const [newTableNumber, setNewTableNumber] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [z, s] = await Promise.all([
        logisticsService.getZones(),
        logisticsService.getStations()
      ]);
      setZones(z);
      setStations(s);
      if (z.length > 0) setSelectedZoneId(z[0].id);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateStation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await logisticsService.createStation(selectedZoneId, newStationName);
      setNewStationName('');
      setIsStationModalOpen(false);
      fetchData();
    } catch (e) {
      alert('Error creando el puesto');
    }
  };

  const handleCreateTable = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await logisticsService.createTable(activeStationId, newTableNumber);
      setNewTableNumber('');
      setIsTableModalOpen(false);
      fetchData();
    } catch (e) {
      alert('Error creando la mesa');
    }
  };

  const openTableModal = (stationId: string) => {
    setActiveStationId(stationId);
    setIsTableModalOpen(true);
  };

  if (loading && stations.length === 0) return <div className="p-8 text-center">Cargando logstica...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-slate-900">Estructura Logstica</h1>
        <Button onClick={() => setIsStationModalOpen(true)}>
          <Plus size={18} className="mr-2" />
          Nuevo Puesto de Votacin
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {stations.map(station => (
          <div key={station.id} className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <MapPin size={18} className="text-primary" />
                  {station.name}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  {station.zone.municipality.name} - {station.zone.name}
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={() => openTableModal(station.id)}>
                <Plus size={16} className="mr-1" /> Mesa
              </Button>
            </div>
            <div className="p-4 flex flex-wrap gap-2">
              {station.polling_tables.length === 0 ? (
                <span className="text-sm text-slate-400">No hay mesas registradas</span>
              ) : (
                station.polling_tables.map(table => (
                  <div key={table.id} className="flex items-center gap-1 bg-primary/10 text-primary px-3 py-1.5 rounded-lg text-sm font-medium border border-primary/20">
                    <Hash size={14} />
                    {table.table_number}
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal Puesto */}
      {isStationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm p-4">
            <h2 className="text-lg font-semibold mb-4">Nuevo Puesto de Votacin</h2>
            <form onSubmit={handleCreateStation} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Zona</label>
                <select 
                  className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm mt-1"
                  value={selectedZoneId}
                  onChange={(e) => setSelectedZoneId(e.target.value)}
                  required
                >
                  {zones.map(z => (
                    <option key={z.id} value={z.id}>{z.municipality.name} - {z.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Nombre del Puesto</label>
                <Input required value={newStationName} onChange={e => setNewStationName(e.target.value)} placeholder="Ej: Colegio Nacional" className="mt-1" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsStationModalOpen(false)}>Cancelar</Button>
                <Button type="submit">Guardar</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Mesa */}
      {isTableModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm p-4">
            <h2 className="text-lg font-semibold mb-4">Nueva Mesa de Votacin</h2>
            <form onSubmit={handleCreateTable} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Nmero de Mesa</label>
                <Input required type="number" min="1" max="999" value={newTableNumber} onChange={e => setNewTableNumber(e.target.value)} placeholder="Ej: 1" className="mt-1" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsTableModalOpen(false)}>Cancelar</Button>
                <Button type="submit">Crear Mesa</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
