import React, { useState, useEffect } from 'react';
import { 
  mobilizationService, 
  Operation, 
  OperationDay, 
  MobilizationActivity, 
  Incident, 
  OperationalResource, 
  OperationalPoint, 
  MobilizationDashboardStats 
} from '../services/mobilization.service';
import { teamService } from '../../team/services/team.service';
import { logisticsService } from '../../logistics/services/logistics.service';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { 
  ShieldAlert, ShieldCheck, Clock, CheckCircle2, AlertTriangle, 
  TrendingUp, Map, Layers, Plus, X, Truck, Target, PlusCircle, 
  Info, Sparkles, MapPin, Users, Award, Radio, Calendar
} from 'lucide-react';
import { cn } from '../../../lib/utils';

export const MobilizationDashboard = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'operations' | 'kanban' | 'incidents' | 'resources' | 'points'>('dashboard');
  const [stats, setStats] = useState<MobilizationDashboardStats | null>(null);
  
  // Catalogs
  const [operations, setOperations] = useState<Operation[]>([]);
  const [activities, setActivities] = useState<MobilizationActivity[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [resources, setResources] = useState<OperationalResource[]>([]);
  const [points, setPoints] = useState<OperationalPoint[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [zones, setZones] = useState<any[]>([]);
  const [stations, setStations] = useState<any[]>([]);
  const [municipalities, setMunicipalities] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [selectedOperation, setSelectedOperation] = useState<Operation | null>(null);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);

  // Modals state
  const [isOpModalOpen, setIsOpModalOpen] = useState(false);
  const [isDayModalOpen, setIsDayModalOpen] = useState(false);
  const [isActModalOpen, setIsActModalOpen] = useState(false);
  const [isIncModalOpen, setIsIncModalOpen] = useState(false);
  const [isResModalOpen, setIsResModalOpen] = useState(false);
  const [isPointModalOpen, setIsPointModalOpen] = useState(false);
  const [isAssignResModalOpen, setIsAssignResModalOpen] = useState(false);

  // Forms
  const [opForm, setOpForm] = useState({ name: '', description: '', start_date: '', end_date: '', priority: 'MEDIA', status: 'BORRADOR' });
  const [dayForm, setDayForm] = useState({ operation_id: '', name: '', date: '', start_time: '08:00', end_time: '18:00', status: 'PROGRAMADA', description: '' });
  const [actForm, setActForm] = useState({ operation_id: '', operation_day_id: '', name: '', description: '', type: 'Otro', priority: 'MEDIA', status: 'PENDIENTE', start_date_time: '', end_date_time: '', municipality_id: '', zone_id: '', polling_station_id: '', polling_table_id: '', assigned_to_id: '' });
  const [incForm, setIncForm] = useState({ operation_id: '', title: '', description: '', type: 'Otra', severity: 'MEDIA', status: 'ABIERTA', reported_by_id: '', municipality_id: '', zone_id: '', polling_station_id: '' });
  const [resForm, setResForm] = useState({ name: '', type: 'GENERICO', quantity: 1, status: 'DISPONIBLE', notes: '', municipality_id: '' });
  const [pointForm, setPointForm] = useState({ name: '', type: 'Otro', address: '', latitude: 0, longitude: 0, responsible_id: '', status: 'ACTIVO', municipality_id: '', zone_id: '', polling_station_id: '' });

  // Assignment states
  const [assignResForm, setAssignResForm] = useState({ resource_id: '', member_id: '', quantity: 1 });
  const [assignIncForm, setAssignIncForm] = useState({ incident_id: '', member_id: '' });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [dStats, dOps, dActs, dIncs, dRes, dPoints, dMembers, dZones, dStations] = await Promise.all([
        mobilizationService.getDashboard(),
        mobilizationService.getOperations(),
        mobilizationService.getActivities(),
        mobilizationService.getIncidents(),
        mobilizationService.getResources(),
        mobilizationService.getPoints(),
        teamService.getMembers(),
        logisticsService.getZones(),
        logisticsService.getStations()
      ]);

      setStats(dStats);
      setOperations(dOps);
      setActivities(dActs);
      setIncidents(dIncs);
      setResources(dRes);
      setPoints(dPoints);
      setMembers(dMembers);
      setZones(dZones);
      setStations(dStations);

      const munis = Array.from(new Set(dStations.map((s: any) => s.zone?.municipality?.name))).map(name => {
        const found = dStations.find((s: any) => s.zone?.municipality?.name === name);
        return found?.zone?.municipality;
      }).filter(Boolean);
      setMunicipalities(munis);

    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateOperation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await mobilizationService.createOperation(opForm);
      setIsOpModalOpen(false);
      fetchData();
      setOpForm({ name: '', description: '', start_date: '', end_date: '', priority: 'MEDIA', status: 'BORRADOR' });
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error creando operación');
    }
  };

  const handleCreateDay = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await mobilizationService.createOperationDay(dayForm);
      setIsDayModalOpen(false);
      if (selectedOperation) {
        const updated = await mobilizationService.getOperationById(selectedOperation.id);
        setSelectedOperation(updated);
      }
      fetchData();
      setDayForm({ operation_id: '', name: '', date: '', start_time: '08:00', end_time: '18:00', status: 'PROGRAMADA', description: '' });
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error creando día operativo');
    }
  };

  const handleCreateActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await mobilizationService.createActivity({
        ...actForm,
        operation_day_id: actForm.operation_day_id || undefined,
        municipality_id: actForm.municipality_id || undefined,
        zone_id: actForm.zone_id || undefined,
        polling_station_id: actForm.polling_station_id || undefined,
        polling_table_id: actForm.polling_table_id || undefined,
        assigned_to_id: actForm.assigned_to_id || undefined,
      });
      setIsActModalOpen(false);
      if (selectedOperation) {
        const updated = await mobilizationService.getOperationById(selectedOperation.id);
        setSelectedOperation(updated);
      }
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error creando actividad');
    }
  };

  const handleCreateIncident = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await mobilizationService.createIncident({
        ...incForm,
        operation_id: incForm.operation_id || undefined,
        reported_by_id: incForm.reported_by_id || undefined,
        municipality_id: incForm.municipality_id || undefined,
        zone_id: incForm.zone_id || undefined,
        polling_station_id: incForm.polling_station_id || undefined,
      });
      setIsIncModalOpen(false);
      fetchData();
      setIncForm({ operation_id: '', title: '', description: '', type: 'Otra', severity: 'MEDIA', status: 'ABIERTA', reported_by_id: '', municipality_id: '', zone_id: '', polling_station_id: '' });
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error reportando incidencia');
    }
  };

  const handleCreateResource = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await mobilizationService.createResource({
        ...resForm,
        municipality_id: resForm.municipality_id || undefined,
      });
      setIsResModalOpen(false);
      fetchData();
      setResForm({ name: '', type: 'GENERICO', quantity: 1, status: 'DISPONIBLE', notes: '', municipality_id: '' });
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error registrando recurso');
    }
  };

  const handleCreatePoint = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await mobilizationService.createPoint({
        ...pointForm,
        latitude: Number(pointForm.latitude) || undefined,
        longitude: Number(pointForm.longitude) || undefined,
        responsible_id: pointForm.responsible_id || undefined,
        municipality_id: pointForm.municipality_id || undefined,
        zone_id: pointForm.zone_id || undefined,
        polling_station_id: pointForm.polling_station_id || undefined,
      });
      setIsPointModalOpen(false);
      fetchData();
      setPointForm({ name: '', type: 'Otro', address: '', latitude: 0, longitude: 0, responsible_id: '', status: 'ACTIVO', municipality_id: '', zone_id: '', polling_station_id: '' });
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error registrando punto');
    }
  };

  const handleAssignResource = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await mobilizationService.assignResource(assignResForm.resource_id, assignResForm.member_id, Number(assignResForm.quantity));
      setIsAssignResModalOpen(false);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error asignando recurso');
    }
  };

  const handleReleaseResource = async (assignId: string) => {
    try {
      await mobilizationService.releaseResource(assignId);
      fetchData();
    } catch (err: any) {
      alert('Error liberando recurso');
    }
  };

  const handleActivityStatus = async (actId: string, status: string) => {
    try {
      await mobilizationService.updateActivity(actId, { status });
      fetchData();
    } catch (err: any) {
      alert('Error actualizando estado de actividad');
    }
  };

  const handleIncidentStatus = async (incId: string, status: string) => {
    try {
      await mobilizationService.updateIncident(incId, { status });
      fetchData();
    } catch (err: any) {
      alert('Error actualizando incidencia');
    }
  };

  const handleAssignIncident = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await mobilizationService.assignIncident(assignIncForm.incident_id, assignIncForm.member_id);
      setSelectedIncident(null);
      fetchData();
    } catch (err: any) {
      alert('Error asignando incidencia');
    }
  };

  const viewOpDetails = async (op: Operation) => {
    try {
      const detailed = await mobilizationService.getOperationById(op.id);
      setSelectedOperation(detailed);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-primary font-semibold text-sm">
            <Radio size={16} className="animate-pulse" />
            <span>Centro de Movilización y Operación</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">Gestión de Jornada</h1>
          <p className="text-slate-500 text-sm">Supervisa en tiempo real el despliegue del equipo, recursos e incidencias operativas.</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button onClick={() => setIsOpModalOpen(true)} className="flex items-center gap-2">
            <PlusCircle size={18} /> Nueva Operación
          </Button>
          <Button onClick={() => setIsIncModalOpen(true)} variant="outline" className="flex items-center gap-2 border-danger text-danger hover:bg-danger/5">
            <ShieldAlert size={18} /> Reportar Incidencia
          </Button>
        </div>
      </div>

      {/* Real-time Alert Status Banner */}
      {stats && (
        <div className={cn(
          "p-4 rounded-xl border flex items-center justify-between shadow-xs",
          stats.alert_level === 'CRITICO' && "bg-red-50 border-red-200 text-red-800",
          stats.alert_level === 'ATENCION' && "bg-amber-50 border-amber-200 text-amber-800",
          stats.alert_level === 'NORMAL' && "bg-emerald-50 border-emerald-200 text-emerald-800"
        )}>
          <div className="flex items-center gap-3">
            {stats.alert_level === 'CRITICO' ? <ShieldAlert size={24} className="text-red-600 animate-bounce" /> :
             stats.alert_level === 'ATENCION' ? <AlertTriangle size={24} className="text-amber-600 animate-pulse" /> :
             <ShieldCheck size={24} className="text-emerald-600" />}
            <div>
              <h4 className="font-bold text-sm">Nivel de Alerta: {stats.alert_level}</h4>
              <p className="text-xs opacity-90">
                {stats.alert_level === 'CRITICO' ? 'Operaciones afectadas por incidencias críticas o tareas atrasadas. Toma acciones inmediatas.' :
                 stats.alert_level === 'ATENCION' ? 'Hay incidencias en revisión o retrasos menores. Monitorea los carriles.' :
                 'Toda la jornada transcurre en condiciones normales.'}
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold uppercase tracking-wider bg-white/60 px-3 py-1 rounded-full border">
            Estado En Vivo
          </span>
        </div>
      )}

      {/* Tabs Layout */}
      <div className="flex border-b border-slate-200 bg-white p-1 rounded-xl shadow-xs overflow-x-auto">
        {[
          { key: 'dashboard', label: 'Dashboard', icon: <Layers size={18} /> },
          { key: 'operations', label: 'Operaciones', icon: <Target size={18} /> },
          { key: 'kanban', label: 'Kanban Jornada', icon: <Calendar size={18} /> },
          { key: 'incidents', label: 'Incidencias', icon: <ShieldAlert size={18} /> },
          { key: 'resources', label: 'Recursos', icon: <Truck size={18} /> },
          { key: 'points', label: 'Puntos Operativos', icon: <MapPin size={18} /> }
        ].map(tab => (
          <button 
            key={tab.key}
            onClick={() => { setActiveTab(tab.key as any); setSelectedOperation(null); }}
            className={cn(
              "flex-1 min-w-[120px] py-3 px-4 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-all cursor-pointer", 
              activeTab === tab.key ? "bg-primary text-white" : "text-slate-600 hover:bg-slate-50"
            )}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* -------------------- TAB: DASHBOARD -------------------- */}
      {activeTab === 'dashboard' && stats && (
        <div className="space-y-6 animate-in fade-in duration-350">
          
          {/* KPI Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-sm font-semibold uppercase tracking-wider">Cobertura Operativa</span>
                <TrendingUp size={20} className="text-primary" />
              </div>
              <h3 className="text-3xl font-extrabold text-slate-800 mt-3">{stats.coverage_percentage}%</h3>
              <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
                <div className="bg-primary h-full transition-all duration-500" style={{ width: `${stats.coverage_percentage}%` }}></div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-sm font-semibold uppercase tracking-wider">Incidencias Abiertas</span>
                <ShieldAlert size={20} className="text-danger" />
              </div>
              <h3 className="text-3xl font-extrabold text-slate-800 mt-3">{stats.incidents_open}</h3>
              <p className="text-xs text-danger font-medium mt-2">{stats.critical_incidents} críticas reportadas</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-sm font-semibold uppercase tracking-wider">Actividades Hoy</span>
                <Clock size={20} className="text-info" />
              </div>
              <h3 className="text-3xl font-extrabold text-slate-800 mt-3">{stats.activities_today}</h3>
              <p className="text-xs text-slate-500 mt-2">{stats.activities_overdue} atrasadas sin finalizar</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-sm font-semibold uppercase tracking-wider">Puntos Activos</span>
                <MapPin size={20} className="text-success" />
              </div>
              <h3 className="text-3xl font-extrabold text-slate-800 mt-3">{stats.operational_points}</h3>
              <p className="text-xs text-success font-medium mt-2">Centros de coordinación</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Recent Incidents Panel */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
              <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <AlertTriangle size={20} className="text-danger" /> Alertas Recientes
              </h2>
              <div className="space-y-3">
                {incidents.slice(0, 4).map(inc => (
                  <div key={inc.id} className="p-4 rounded-xl border border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div>
                      <h4 className="font-semibold text-slate-800 text-sm">{inc.title}</h4>
                      <p className="text-xs text-slate-500 mt-1">{inc.description}</p>
                    </div>
                    <span className={cn(
                      "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border",
                      inc.severity === 'CRITICA' ? "bg-red-50 text-red-600 border-red-200 animate-pulse" : "bg-amber-50 text-amber-600 border-amber-200"
                    )}>
                      {inc.severity}
                    </span>
                  </div>
                ))}
                {incidents.length === 0 && (
                  <div className="text-center p-8 text-slate-400 text-sm">No se registran incidencias abiertas.</div>
                )}
              </div>
            </div>

            {/* Active Operations List */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
              <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Target size={20} className="text-primary" /> Operaciones Desplegadas
              </h2>
              <div className="space-y-3">
                {operations.slice(0, 4).map(op => (
                  <div key={op.id} className="p-4 rounded-xl border border-slate-100 flex justify-between items-center hover:bg-slate-50 cursor-pointer" onClick={() => setActiveTab('operations')}>
                    <div>
                      <h4 className="font-semibold text-slate-800 text-sm">{op.name}</h4>
                      <p className="text-xs text-slate-500 mt-1">{new Date(op.start_date).toLocaleDateString()}</p>
                    </div>
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-primary/10 text-primary uppercase">
                      {op.status}
                    </span>
                  </div>
                ))}
                {operations.length === 0 && (
                  <div className="text-center p-8 text-slate-400 text-sm">No hay operaciones de movilización registradas.</div>
                )}
              </div>
            </div>
          </div>

        </div>
      )}

      {/* -------------------- TAB: OPERATIONS -------------------- */}
      {activeTab === 'operations' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
          {/* Operations catalog */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="font-bold text-slate-800 text-lg">Catálogo de Movilización</h2>
            <div className="space-y-3">
              {operations.map(op => (
                <div 
                  key={op.id}
                  onClick={() => viewOpDetails(op)}
                  className={cn(
                    "p-4 rounded-xl border border-slate-100 hover:bg-slate-50 cursor-pointer transition-all",
                    selectedOperation?.id === op.id && "border-primary/50 bg-primary/5 hover:bg-primary/5"
                  )}
                >
                  <h4 className="font-semibold text-slate-800 text-sm">{op.name}</h4>
                  <p className="text-xs text-slate-500 mt-2">{op.description || 'Sin descripción'}</p>
                  <div className="flex justify-between items-center mt-3 text-[10px]">
                    <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold uppercase">{op.status}</span>
                    <span className="text-slate-400">{new Date(op.start_date).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Operation Days and Activities */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            {selectedOperation ? (
              <div className="space-y-6">
                
                {/* Header */}
                <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                  <div>
                    <h2 className="text-xl font-bold text-slate-800">{selectedOperation.name}</h2>
                    <p className="text-slate-500 text-sm mt-1">{selectedOperation.description}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => {
                      setDayForm(prev => ({ ...prev, operation_id: selectedOperation.id }));
                      setIsDayModalOpen(true);
                    }}>
                      + Día de Jornada
                    </Button>
                    <Button size="sm" onClick={() => {
                      setActForm(prev => ({ ...prev, operation_id: selectedOperation.id }));
                      setIsActModalOpen(true);
                    }}>
                      + Registrar Actividad
                    </Button>
                  </div>
                </div>

                {/* Days list */}
                <div className="space-y-4">
                  <h3 className="font-bold text-slate-700 text-sm">Días de Jornada Programados</h3>
                  
                  {selectedOperation.days?.map(day => (
                    <div key={day.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-3">
                      <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                        <h4 className="font-semibold text-slate-800 text-sm">{day.name} ({new Date(day.date).toLocaleDateString()})</h4>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary uppercase">
                          {day.status}
                        </span>
                      </div>
                      
                      {/* Activities inside Operation Day */}
                      <div className="space-y-2">
                        {day.activities?.map(act => (
                          <div key={act.id} className="bg-white p-3 rounded-lg border border-slate-100 flex justify-between items-center text-xs">
                            <div className="space-y-1">
                              <h5 className="font-bold text-slate-800">{act.name}</h5>
                              <p className="text-[10px] text-slate-400">
                                {act.type} • {act.polling_station?.name || 'Todo el municipio'}
                              </p>
                            </div>
                            <select 
                              value={act.status}
                              onChange={(e) => handleActivityStatus(act.id, e.target.value)}
                              className="border border-slate-200 rounded px-2 py-1 text-[10px] focus:outline-none"
                            >
                              <option value="PENDIENTE">Pendiente</option>
                              <option value="EN_PROGRESO">En Progreso</option>
                              <option value="COMPLETADA">Completada</option>
                              <option value="BLOQUEADA">Bloqueada</option>
                            </select>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  {(!selectedOperation.days || selectedOperation.days.length === 0) && (
                    <div className="text-center p-8 text-slate-400 text-sm">No hay días programados para esta operación.</div>
                  )}
                </div>

              </div>
            ) : (
              <div className="text-center p-16 text-slate-400">Selecciona una Operación del panel izquierdo para ver sus detalles.</div>
            )}
          </div>
        </div>
      )}

      {/* -------------------- TAB: KANBAN -------------------- */}
      {activeTab === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-in fade-in duration-300">
          {['PENDIENTE', 'EN_PROGRESO', 'BLOQUEADA', 'COMPLETADA'].map(col => {
            const colActivities = activities.filter(a => a.status === col);
            return (
              <div key={col} className="bg-slate-50/50 p-4 rounded-2xl border border-slate-200 min-h-[500px] flex flex-col gap-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <h3 className="font-bold text-slate-700 text-sm capitalize">{col.replace('_', ' ').toLowerCase()}</h3>
                  <span className="bg-slate-200/80 px-2 py-0.5 text-xs font-semibold rounded-full text-slate-600">
                    {colActivities.length}
                  </span>
                </div>
                
                <div className="flex-1 space-y-3 overflow-y-auto max-h-[600px]">
                  {colActivities.map(act => (
                    <div key={act.id} className="bg-white p-4 rounded-xl border border-slate-100 hover:shadow-xs space-y-3">
                      <h4 className="font-semibold text-slate-800 text-sm">{act.name}</h4>
                      {act.description && <p className="text-xs text-slate-500 line-clamp-2">{act.description}</p>}
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="bg-primary/5 text-primary px-2 py-0.5 rounded-full">{act.type}</span>
                        <span className="text-slate-400">{new Date(act.start_date_time).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                  {colActivities.length === 0 && (
                    <div className="text-center p-8 text-slate-400 text-xs border border-dashed border-slate-200 rounded-xl">Vacío</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* -------------------- TAB: INCIDENTS -------------------- */}
      {activeTab === 'incidents' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 animate-in fade-in duration-300">
          <h2 className="font-bold text-slate-800 text-lg flex items-center gap-2">
            <ShieldAlert size={20} className="text-danger animate-pulse" /> Bitácora de Incidencias Operativas
          </h2>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-100 text-xs uppercase">
                <tr>
                  <th className="p-3">Título / Descripción</th>
                  <th className="p-3">Tipo</th>
                  <th className="p-3">Severidad</th>
                  <th className="p-3">Estado</th>
                  <th className="p-3">Reportado por</th>
                  <th className="p-3">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {incidents.map(inc => (
                  <tr key={inc.id} className="hover:bg-slate-50/50">
                    <td className="p-3">
                      <div className="font-semibold text-slate-800">{inc.title}</div>
                      <div className="text-xs text-slate-400 mt-1">{inc.description}</div>
                    </td>
                    <td className="p-3 text-xs">{inc.type}</td>
                    <td className="p-3">
                      <span className={cn(
                        "text-[10px] font-bold px-2 py-0.5 rounded-full border",
                        inc.severity === 'CRITICA' ? "bg-red-50 text-red-600 border-red-200" : "bg-amber-50 text-amber-600 border-amber-200"
                      )}>
                        {inc.severity}
                      </span>
                    </td>
                    <td className="p-3">
                      <select 
                        value={inc.status}
                        onChange={(e) => handleIncidentStatus(inc.id, e.target.value)}
                        className="border border-slate-200 rounded px-2 py-1 text-xs focus:outline-none"
                      >
                        <option value="ABIERTA">Abierta</option>
                        <option value="EN_PROCESO">En Proceso</option>
                        <option value="RESUELTA">Resuelta</option>
                        <option value="CERRADA">Cerrada</option>
                      </select>
                    </td>
                    <td className="p-3 text-xs">
                      {inc.reported_by ? `${inc.reported_by.first_name} ${inc.reported_by.last_name}` : 'Coordinador'}
                    </td>
                    <td className="p-3 text-xs">
                      <Button size="sm" variant="ghost" onClick={() => {
                        setAssignIncForm({ incident_id: inc.id, member_id: members[0]?.id || '' });
                        setSelectedIncident(inc);
                      }}>
                        Asignar
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* -------------------- TAB: RESOURCES -------------------- */}
      {activeTab === 'resources' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
          
          {/* Inventory list */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                <Truck size={20} className="text-primary" /> Inventario de Recursos Operativos
              </h2>
              <Button size="sm" onClick={() => setIsResModalOpen(true)}>
                + Nuevo Recurso
              </Button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-100 text-xs uppercase">
                  <tr>
                    <th className="p-3">Recurso</th>
                    <th className="p-3">Tipo</th>
                    <th className="p-3">Stock Disponible</th>
                    <th className="p-3">Estado</th>
                    <th className="p-3">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {resources.map(res => (
                    <tr key={res.id} className="hover:bg-slate-50/50">
                      <td className="p-3 font-semibold text-slate-800">{res.name}</td>
                      <td className="p-3 text-xs">{res.type}</td>
                      <td className="p-3 font-bold text-slate-700">{res.quantity} unidades</td>
                      <td className="p-3">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
                          {res.status}
                        </span>
                      </td>
                      <td className="p-3">
                        <Button size="sm" variant="outline" onClick={() => {
                          setAssignResForm({ resource_id: res.id, member_id: members[0]?.id || '', quantity: 1 });
                          setIsAssignResModalOpen(true);
                        }}>
                          Asignar
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Active Assignments */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="font-bold text-slate-800 text-lg">Asignaciones en Campo</h2>
            <div className="space-y-3">
              {resources.flatMap(res => res.assignments || []).map((assign: any) => (
                <div key={assign.id} className="p-4 rounded-xl border border-slate-100 flex justify-between items-center bg-slate-50/50">
                  <div>
                    <h4 className="font-semibold text-slate-800 text-xs">{assign.resource?.name || 'Recurso'}</h4>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Asignado a: {assign.member?.first_name} {assign.member?.last_name} • Qty: {assign.quantity}
                    </p>
                  </div>
                  <Button size="sm" variant="ghost" className="text-danger hover:bg-red-50" onClick={() => handleReleaseResource(assign.id)}>
                    Liberar
                  </Button>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* -------------------- TAB: POINTS -------------------- */}
      {activeTab === 'points' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 animate-in fade-in duration-300">
          <div className="flex justify-between items-center">
            <h2 className="font-bold text-slate-800 text-lg flex items-center gap-2">
              <MapPin size={20} className="text-primary" /> Puntos Operativos y de Coordinación
            </h2>
            <Button size="sm" onClick={() => setIsPointModalOpen(true)}>
              + Registrar Punto
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-100 text-xs uppercase">
                <tr>
                  <th className="p-3">Nombre del Punto</th>
                  <th className="p-3">Tipo</th>
                  <th className="p-3">Ubicación</th>
                  <th className="p-3">Responsable</th>
                  <th className="p-3">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {points.map(pt => (
                  <tr key={pt.id} className="hover:bg-slate-50/50">
                    <td className="p-3 font-semibold text-slate-800">{pt.name}</td>
                    <td className="p-3 text-xs">{pt.type}</td>
                    <td className="p-3 text-xs">
                      {pt.address} {pt.latitude ? `(${pt.latitude}, ${pt.longitude})` : ''}
                    </td>
                    <td className="p-3 text-xs">
                      {pt.responsible ? `${pt.responsible.first_name} ${pt.responsible.last_name}` : 'Sin asignar'}
                    </td>
                    <td className="p-3">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
                        {pt.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* -------------------- MODAL: CREATE OPERATION -------------------- */}
      {isOpModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-md p-6 rounded-2xl shadow-xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800 text-lg">Nueva Operación de Movilización</h3>
              <button onClick={() => setIsOpModalOpen(false)} className="p-1 hover:bg-slate-100 rounded-lg">
                <X size={18} className="text-slate-500" />
              </button>
            </div>
            
            <form onSubmit={handleCreateOperation} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-600">Nombre de la Operación</label>
                <Input required placeholder="Ej: Operación Escolta y Movilización Día D" value={opForm.name} onChange={(e) => setOpForm(prev => ({ ...prev, name: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">Descripción</label>
                <Input placeholder="Descripción breve" value={opForm.description} onChange={(e) => setOpForm(prev => ({ ...prev, description: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-600">Fecha Inicio</label>
                  <Input required type="date" value={opForm.start_date} onChange={(e) => setOpForm(prev => ({ ...prev, start_date: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">Fecha Fin</label>
                  <Input type="date" value={opForm.end_date} onChange={(e) => setOpForm(prev => ({ ...prev, end_date: e.target.value }))} />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsOpModalOpen(false)}>Cancelar</Button>
                <Button type="submit">Crear Operación</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* -------------------- MODAL: CREATE DAY -------------------- */}
      {isDayModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-md p-6 rounded-2xl shadow-xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800 text-lg">Añadir Día de Jornada</h3>
              <button onClick={() => setIsDayModalOpen(false)} className="p-1 hover:bg-slate-100 rounded-lg">
                <X size={18} className="text-slate-500" />
              </button>
            </div>
            
            <form onSubmit={handleCreateDay} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-600">Nombre del Día</label>
                <Input required placeholder="Ej: Jornada Electoral General" value={dayForm.name} onChange={(e) => setDayForm(prev => ({ ...prev, name: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">Fecha</label>
                <Input required type="date" value={dayForm.date} onChange={(e) => setDayForm(prev => ({ ...prev, date: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-600">Hora Inicio</label>
                  <Input required type="time" value={dayForm.start_time} onChange={(e) => setDayForm(prev => ({ ...prev, start_time: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">Hora Cierre</label>
                  <Input required type="time" value={dayForm.end_time} onChange={(e) => setDayForm(prev => ({ ...prev, end_time: e.target.value }))} />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDayModalOpen(false)}>Cancelar</Button>
                <Button type="submit">Agregar Día</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* -------------------- MODAL: CREATE ACTIVITY -------------------- */}
      {isActModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-lg p-6 rounded-2xl shadow-xl space-y-4 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800 text-lg">Registrar Actividad de Movilización</h3>
              <button onClick={() => setIsActModalOpen(false)} className="p-1 hover:bg-slate-100 rounded-lg">
                <X size={18} className="text-slate-500" />
              </button>
            </div>
            
            <form onSubmit={handleCreateActivity} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-600">Asociar al Día</label>
                  <select 
                    required
                    value={actForm.operation_day_id}
                    onChange={(e) => setActForm(prev => ({ ...prev, operation_day_id: e.target.value }))}
                    className="w-full h-10 border border-slate-200 rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Ninguno (Actividad de Operación general)</option>
                    {selectedOperation?.days?.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">Tipo</label>
                  <select 
                    value={actForm.type}
                    onChange={(e) => setActForm(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full h-10 border border-slate-200 rounded-lg px-3 text-sm focus:outline-none"
                  >
                    <option value="Coordinacion">Coordinación</option>
                    <option value="Reunion">Reunión</option>
                    <option value="Visita">Visita</option>
                    <option value="Logistica">Logística</option>
                    <option value="Comunicacion">Comunicación</option>
                    <option value="Apoyo operativo">Apoyo Operativo</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600">Nombre de la Actividad</label>
                <Input required placeholder="Ej: Recorrido del vehículo de apoyo" value={actForm.name} onChange={(e) => setActForm(prev => ({ ...prev, name: e.target.value }))} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-600">Inicio (Fecha y Hora)</label>
                  <Input required type="datetime-local" value={actForm.start_date_time} onChange={(e) => setActForm(prev => ({ ...prev, start_date_time: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">Fin (Fecha y Hora)</label>
                  <Input required type="datetime-local" value={actForm.end_date_time} onChange={(e) => setActForm(prev => ({ ...prev, end_date_time: e.target.value }))} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-600">Puesto de Votación</label>
                  <select 
                    value={actForm.polling_station_id}
                    onChange={(e) => setActForm(prev => ({ ...prev, polling_station_id: e.target.value }))}
                    className="w-full h-10 border border-slate-200 rounded-lg px-3 text-sm focus:outline-none"
                  >
                    <option value="">Ninguno</option>
                    {stations.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">Responsable Asignado</label>
                  <select 
                    value={actForm.assigned_to_id}
                    onChange={(e) => setActForm(prev => ({ ...prev, assigned_to_id: e.target.value }))}
                    className="w-full h-10 border border-slate-200 rounded-lg px-3 text-sm focus:outline-none"
                  >
                    <option value="">Ninguno</option>
                    {members.map(m => (
                      <option key={m.id} value={m.id}>{m.first_name} {m.last_name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsActModalOpen(false)}>Cancelar</Button>
                <Button type="submit">Agregar Actividad</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* -------------------- MODAL: CREATE INCIDENT -------------------- */}
      {isIncModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-md p-6 rounded-2xl shadow-xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800 text-lg">Reportar Incidencia</h3>
              <button onClick={() => setIsIncModalOpen(false)} className="p-1 hover:bg-slate-100 rounded-lg">
                <X size={18} className="text-slate-500" />
              </button>
            </div>
            
            <form onSubmit={handleCreateIncident} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-600">Operación Asociada</label>
                <select 
                  value={incForm.operation_id}
                  onChange={(e) => setIncForm(prev => ({ ...prev, operation_id: e.target.value }))}
                  className="w-full h-10 border border-slate-200 rounded-lg px-3 text-sm focus:outline-none"
                >
                  <option value="">Ninguna</option>
                  {operations.map(o => (
                    <option key={o.id} value={o.id}>{o.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600">Título</label>
                <Input required placeholder="Ej: Retraso en apertura de mesas" value={incForm.title} onChange={(e) => setIncForm(prev => ({ ...prev, title: e.target.value }))} />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600">Detalles / Descripción</label>
                <Input required placeholder="Descripción de la novedad en terreno" value={incForm.description} onChange={(e) => setIncForm(prev => ({ ...prev, description: e.target.value }))} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-600">Severidad</label>
                  <select 
                    value={incForm.severity}
                    onChange={(e) => setIncForm(prev => ({ ...prev, severity: e.target.value }))}
                    className="w-full h-10 border border-slate-200 rounded-lg px-3 text-sm focus:outline-none"
                  >
                    <option value="BAJA">Baja</option>
                    <option value="MEDIA">Media</option>
                    <option value="ALTA">Alta</option>
                    <option value="CRITICA">Crítica</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">Reportero</label>
                  <select 
                    value={incForm.reported_by_id}
                    onChange={(e) => setIncForm(prev => ({ ...prev, reported_by_id: e.target.value }))}
                    className="w-full h-10 border border-slate-200 rounded-lg px-3 text-sm focus:outline-none"
                  >
                    <option value="">Ninguno</option>
                    {members.map(m => (
                      <option key={m.id} value={m.id}>{m.first_name} {m.last_name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsIncModalOpen(false)}>Cancelar</Button>
                <Button type="submit">Reportar</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* -------------------- MODAL: CREATE RESOURCE -------------------- */}
      {isResModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-md p-6 rounded-2xl shadow-xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800 text-lg">Registrar Recurso Operativo</h3>
              <button onClick={() => setIsResModalOpen(false)} className="p-1 hover:bg-slate-100 rounded-lg">
                <X size={18} className="text-slate-500" />
              </button>
            </div>
            
            <form onSubmit={handleCreateResource} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-600">Nombre del Recurso</label>
                <Input required placeholder="Ej: Miniván de soporte de ruta" value={resForm.name} onChange={(e) => setResForm(prev => ({ ...prev, name: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-600">Tipo</label>
                  <select 
                    value={resForm.type}
                    onChange={(e) => setResForm(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full h-10 border border-slate-200 rounded-lg px-3 text-sm focus:outline-none"
                  >
                    <option value="VEHICULO">Vehículo</option>
                    <option value="EQUIPO_LOGISTICO">Equipo Logístico</option>
                    <option value="MATERIAL">Material / Folletos</option>
                    <option value="GENERICO">Genérico</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">Stock Inicial</label>
                  <Input required type="number" min="1" value={resForm.quantity} onChange={(e) => setResForm(prev => ({ ...prev, quantity: Number(e.target.value) }))} />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsResModalOpen(false)}>Cancelar</Button>
                <Button type="submit">Registrar</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* -------------------- MODAL: CREATE POINT -------------------- */}
      {isPointModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-md p-6 rounded-2xl shadow-xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800 text-lg">Registrar Punto Operativo</h3>
              <button onClick={() => setIsPointModalOpen(false)} className="p-1 hover:bg-slate-100 rounded-lg">
                <X size={18} className="text-slate-500" />
              </button>
            </div>
            
            <form onSubmit={handleCreatePoint} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-600">Nombre del Punto</label>
                <Input required placeholder="Ej: Puesto de Mando Unificado Central" value={pointForm.name} onChange={(e) => setPointForm(prev => ({ ...prev, name: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-600">Tipo</label>
                  <select 
                    value={pointForm.type}
                    onChange={(e) => setPointForm(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full h-10 border border-slate-200 rounded-lg px-3 text-sm focus:outline-none"
                  >
                    <option value="Coordinacion">Coordinación</option>
                    <option value="Reunion">Reunión</option>
                    <option value="Logistica">Logística</option>
                    <option value="Apoyo">Apoyo</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">Dirección</label>
                  <Input placeholder="Dirección física" value={pointForm.address} onChange={(e) => setPointForm(prev => ({ ...prev, address: e.target.value }))} />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsPointModalOpen(false)}>Cancelar</Button>
                <Button type="submit">Registrar</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* -------------------- MODAL: ASSIGN RESOURCE -------------------- */}
      {isAssignResModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-md p-6 rounded-2xl shadow-xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800 text-lg">Asignar Recurso</h3>
              <button onClick={() => setIsAssignResModalOpen(false)} className="p-1 hover:bg-slate-100 rounded-lg">
                <X size={18} className="text-slate-500" />
              </button>
            </div>
            
            <form onSubmit={handleAssignResource} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-600">Colaborador</label>
                <select 
                  required
                  value={assignResForm.member_id}
                  onChange={(e) => setAssignResForm(prev => ({ ...prev, member_id: e.target.value }))}
                  className="w-full h-10 border border-slate-200 rounded-lg px-3 text-sm focus:outline-none"
                >
                  {members.map(m => (
                    <option key={m.id} value={m.id}>{m.first_name} {m.last_name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">Cantidad</label>
                <Input required type="number" min="1" value={assignResForm.quantity} onChange={(e) => setAssignResForm(prev => ({ ...prev, quantity: Number(e.target.value) }))} />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsAssignResModalOpen(false)}>Cancelar</Button>
                <Button type="submit">Asignar Recurso</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* -------------------- MODAL: ASSIGN INCIDENT -------------------- */}
      {selectedIncident && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-md p-6 rounded-2xl shadow-xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800 text-lg">Asignar Responsable de Resolución</h3>
              <button onClick={() => setSelectedIncident(null)} className="p-1 hover:bg-slate-100 rounded-lg">
                <X size={18} className="text-slate-500" />
              </button>
            </div>
            
            <form onSubmit={handleAssignIncident} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-600">Colaborador Resolvente</label>
                <select 
                  required
                  value={assignIncForm.member_id}
                  onChange={(e) => setAssignIncForm(prev => ({ ...prev, member_id: e.target.value }))}
                  className="w-full h-10 border border-slate-200 rounded-lg px-3 text-sm focus:outline-none"
                >
                  {members.map(m => (
                    <option key={m.id} value={m.id}>{m.first_name} {m.last_name}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setSelectedIncident(null)}>Cancelar</Button>
                <Button type="submit">Asignar Incidencia</Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
