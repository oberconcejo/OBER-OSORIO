import React, { useState, useEffect } from 'react';
import { teamService, TeamMember, TeamPosition } from '../services/team.service';
import { logisticsService, PollingStation, Zone } from '../../logistics/services/logistics.service';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Plus, X, Users, BadgeCheck, MapPin } from 'lucide-react';
import { cn } from '../../../lib/utils';

export const TeamList = () => {
  const [activeTab, setActiveTab] = useState<'members' | 'positions' | 'assignments'>('members');
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [positions, setPositions] = useState<TeamPosition[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  
  // Territorial data for assignments
  const [stations, setStations] = useState<PollingStation[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);

  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'member' | 'position' | 'assignment'>('member');
  
  const [positionName, setPositionName] = useState('');
  const [memberForm, setMemberForm] = useState({ document_type: 'CC', document_number: '', first_name: '', last_name: '', phone: '' });
  
  const [assignForm, setAssignForm] = useState({
    member_id: '',
    position_id: '',
    zone_id: '',
    polling_station_id: ''
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [m, p, a, z, s] = await Promise.all([
        teamService.getMembers(),
        teamService.getPositions(),
        teamService.getAssignments(),
        logisticsService.getZones(),
        logisticsService.getStations()
      ]);
      setMembers(m);
      setPositions(p);
      setAssignments(a);
      setZones(z);
      setStations(s);
      
      if (m.length > 0 && p.length > 0) {
        setAssignForm(prev => ({ ...prev, member_id: m[0].id, position_id: p[0].id }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreatePosition = async (e: React.FormEvent) => {
    e.preventDefault();
    await teamService.createPosition({ name: positionName });
    setPositionName('');
    setIsModalOpen(false);
    fetchData();
  };

  const handleCreateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await teamService.createMember(memberForm);
      setMemberForm({ document_type: 'CC', document_number: '', first_name: '', last_name: '', phone: '' });
      setIsModalOpen(false);
      fetchData();
    } catch (e: any) {
      alert(e.response?.data?.message || 'Error creando colaborador');
    }
  };

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await teamService.assignTerritory({
        member_id: assignForm.member_id,
        position_id: assignForm.position_id,
        zone_id: assignForm.zone_id || undefined,
        polling_station_id: assignForm.polling_station_id || undefined
      });
      setIsModalOpen(false);
      fetchData();
    } catch (e: any) {
      alert(e.response?.data?.message || 'Error asignando territorio');
    }
  };

  const openModal = (type: 'member' | 'position' | 'assignment') => {
    setModalType(type);
    setIsModalOpen(true);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">Equipo y Estructura Operativa</h1>
        <div className="flex gap-2 mt-4 md:mt-0 flex-wrap justify-end">
          <Button onClick={() => openModal('position')} variant="outline"><Plus size={18} className="mr-2" /> Rol</Button>
          <Button onClick={() => openModal('member')} variant="outline"><Plus size={18} className="mr-2" /> Colaborador</Button>
          <Button onClick={() => openModal('assignment')}><MapPin size={18} className="mr-2" /> Asignar Territorio</Button>
        </div>
      </div>

      <div className="flex gap-4 border-b border-slate-200 mb-6">
        <button onClick={() => setActiveTab('members')} className={cn("pb-3 px-2 text-sm font-medium border-b-2 transition-colors", activeTab === 'members' ? "border-primary text-primary" : "border-transparent text-slate-500 hover:text-slate-700")}>
          <div className="flex items-center gap-2"><Users size={18} /> Colaboradores</div>
        </button>
        <button onClick={() => setActiveTab('positions')} className={cn("pb-3 px-2 text-sm font-medium border-b-2 transition-colors", activeTab === 'positions' ? "border-primary text-primary" : "border-transparent text-slate-500 hover:text-slate-700")}>
          <div className="flex items-center gap-2"><BadgeCheck size={18} /> Roles</div>
        </button>
        <button onClick={() => setActiveTab('assignments')} className={cn("pb-3 px-2 text-sm font-medium border-b-2 transition-colors", activeTab === 'assignments' ? "border-primary text-primary" : "border-transparent text-slate-500 hover:text-slate-700")}>
          <div className="flex items-center gap-2"><MapPin size={18} /> Asignaciones</div>
        </button>
      </div>

      {loading ? (
        <div className="p-8 text-center text-slate-500">Cargando equipo...</div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          {activeTab === 'members' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-600 text-sm">
                  <tr>
                    <th className="p-4 font-medium">Documento</th>
                    <th className="p-4 font-medium">Nombre Completo</th>
                    <th className="p-4 font-medium">Telfono</th>
                    <th className="p-4 font-medium">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {members.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50">
                      <td className="p-4 text-slate-900 font-medium">{m.document_type} {m.document_number}</td>
                      <td className="p-4 text-slate-700">{m.first_name} {m.last_name}</td>
                      <td className="p-4 text-slate-500">{m.phone || '-'}</td>
                      <td className="p-4"><span className="px-2 py-1 bg-success/10 text-success text-xs rounded-full font-medium">{m.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {activeTab === 'positions' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-4">
              {positions.map(p => (
                <div key={p.id} className="border border-slate-200 rounded-lg p-4 flex items-center justify-between hover:shadow-sm">
                  <span className="font-medium text-slate-800">{p.name}</span>
                  <BadgeCheck size={20} className="text-primary/40" />
                </div>
              ))}
            </div>
          )}
          {activeTab === 'assignments' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-600 text-sm">
                  <tr>
                    <th className="p-4 font-medium">Colaborador</th>
                    <th className="p-4 font-medium">Rol Asignado</th>
                    <th className="p-4 font-medium">Territorio</th>
                    <th className="p-4 font-medium">Fecha</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {assignments.map((a) => (
                    <tr key={a.id} className="hover:bg-slate-50">
                      <td className="p-4 text-slate-900 font-medium">{a.member.first_name} {a.member.last_name}</td>
                      <td className="p-4 text-slate-700">{a.position.name}</td>
                      <td className="p-4 text-slate-600">
                        {a.polling_station ? (
                           <span>Puesto: <strong>{a.polling_station.name}</strong></span>
                        ) : a.zone ? (
                           <span>Zona: <strong>{a.zone.name}</strong></span>
                        ) : <span>Global / Organizacional</span>}
                      </td>
                      <td className="p-4 text-slate-500 text-sm">{new Date(a.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Modals (Member, Position, Assignment) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-4 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h2 className="text-lg font-semibold">
                {modalType === 'member' ? 'Nuevo Colaborador' : modalType === 'position' ? 'Nuevo Rol' : 'Asignacin Territorial'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>

            {modalType === 'position' && (
              <form onSubmit={handleCreatePosition} className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Nombre del Rol</label>
                  <Input required value={positionName} onChange={e => setPositionName(e.target.value)} placeholder="Ej: Testigo Electoral" className="mt-1" />
                </div>
                <div className="flex justify-end gap-2 pt-2"><Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button><Button type="submit">Crear Rol</Button></div>
              </form>
            )}

            {modalType === 'member' && (
              <form onSubmit={handleCreateMember} className="space-y-4">
                 {/* SAME AS BEFORE */}
                 <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1 col-span-1"><label className="text-sm font-medium">Tipo</label><select className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm" value={memberForm.document_type} onChange={e => setMemberForm({...memberForm, document_type: e.target.value})}><option value="CC">CC</option></select></div>
                  <div className="space-y-1 col-span-2"><label className="text-sm font-medium">Documento</label><Input required value={memberForm.document_number} onChange={e => setMemberForm({...memberForm, document_number: e.target.value})} /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1"><label className="text-sm font-medium">Nombres</label><Input required value={memberForm.first_name} onChange={e => setMemberForm({...memberForm, first_name: e.target.value})} /></div>
                  <div className="space-y-1"><label className="text-sm font-medium">Apellidos</label><Input required value={memberForm.last_name} onChange={e => setMemberForm({...memberForm, last_name: e.target.value})} /></div>
                </div>
                <div className="space-y-1"><label className="text-sm font-medium">Telfono</label><Input type="tel" value={memberForm.phone} onChange={e => setMemberForm({...memberForm, phone: e.target.value})} /></div>
                <div className="flex justify-end gap-2 pt-2"><Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button><Button type="submit">Guardar</Button></div>
              </form>
            )}

            {modalType === 'assignment' && (
              <form onSubmit={handleCreateAssignment} className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Colaborador</label>
                  <select required className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm mt-1" value={assignForm.member_id} onChange={e => setAssignForm({...assignForm, member_id: e.target.value})}>
                    {members.map(m => <option key={m.id} value={m.id}>{m.first_name} {m.last_name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Rol Operativo</label>
                  <select required className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm mt-1" value={assignForm.position_id} onChange={e => setAssignForm({...assignForm, position_id: e.target.value})}>
                    {positions.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Zona (Opcional)</label>
                  <select className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm mt-1" value={assignForm.zone_id} onChange={e => setAssignForm({...assignForm, zone_id: e.target.value})}>
                    <option value="">-- Sin Zona --</option>
                    {zones.map(z => <option key={z.id} value={z.id}>{z.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Puesto de Votacin (Opcional)</label>
                  <select className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm mt-1" value={assignForm.polling_station_id} onChange={e => setAssignForm({...assignForm, polling_station_id: e.target.value})}>
                    <option value="">-- Sin Puesto --</option>
                    {stations.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div className="flex justify-end gap-2 pt-2"><Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button><Button type="submit">Confirmar Asignacin</Button></div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
