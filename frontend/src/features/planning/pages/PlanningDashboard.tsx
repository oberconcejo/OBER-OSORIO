import React, { useState, useEffect } from 'react';
import { planningService, Plan, Objective, Activity, PlanningDashboardStats } from '../services/planning.service';
import { teamService } from '../../team/services/team.service';
import { logisticsService } from '../../logistics/services/logistics.service';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { 
  Calendar as CalendarIcon, 
  ListTodo, 
  KanbanSquare, 
  Trophy, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Users, 
  MapPin, 
  Plus, 
  X, 
  ChevronRight, 
  MessageSquare, 
  Paperclip, 
  FolderPlus,
  Target,
  Sparkles,
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import { cn } from '../../../lib/utils';

export const PlanningDashboard = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'plans' | 'kanban' | 'calendar'>('dashboard');
  const [stats, setStats] = useState<PlanningDashboardStats | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [municipalities, setMunicipalities] = useState<any[]>([]);
  const [zones, setZones] = useState<any[]>([]);
  const [stations, setStations] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);

  // Modals state
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [isObjModalOpen, setIsObjModalOpen] = useState(false);
  const [isActModalOpen, setIsActModalOpen] = useState(false);
  
  // Forms state
  const [planForm, setPlanForm] = useState({
    name: '',
    description: '',
    start_date: '',
    end_date: '',
    priority: 'MEDIA',
    status: 'DRAFT',
    municipality_id: '',
    zone_id: '',
    polling_station_id: ''
  });

  const [objForm, setObjForm] = useState({
    name: '',
    description: '',
    status: 'PENDING',
    priority: 'MEDIUM',
    due_date: '',
    assignee_id: ''
  });

  const [actForm, setActForm] = useState({
    plan_id: '',
    objective_id: '',
    name: '',
    description: '',
    type: 'OTRA',
    priority: 'MEDIA',
    status: 'PENDIENTE',
    start_date: '',
    due_date: '',
    municipality_id: '',
    zone_id: '',
    polling_station_id: '',
    polling_table_id: '',
    assignee_ids: [] as string[],
    dependency_ids: [] as string[]
  });

  // Comments and Checklist temporary inputs
  const [newComment, setNewComment] = useState('');
  const [newCheckItem, setNewCheckItem] = useState('');
  const [evidenceName, setEvidenceName] = useState('');
  const [evidenceUrl, setEvidenceUrl] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [dStats, dPlans, dActivities, dMembers, dZones, dStations] = await Promise.all([
        planningService.getDashboard(),
        planningService.getPlans(),
        planningService.getActivities(),
        teamService.getMembers(),
        logisticsService.getZones(),
        logisticsService.getStations()
      ]);

      setStats(dStats);
      setPlans(dPlans);
      setActivities(dActivities);
      setMembers(dMembers);
      setZones(dZones);
      setStations(dStations);

      // Simple mock for municipalities since it maps from departments / zones
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

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await planningService.createPlan({
        ...planForm,
        municipality_id: planForm.municipality_id || undefined,
        zone_id: planForm.zone_id || undefined,
        polling_station_id: planForm.polling_station_id || undefined,
      });
      setIsPlanModalOpen(false);
      fetchData();
      setPlanForm({
        name: '',
        description: '',
        start_date: '',
        end_date: '',
        priority: 'MEDIA',
        status: 'DRAFT',
        municipality_id: '',
        zone_id: '',
        polling_station_id: ''
      });
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al crear plan');
    }
  };

  const handleCreateObjective = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan) return;
    try {
      await planningService.createObjective(selectedPlan.id, {
        ...objForm,
        assignee_id: objForm.assignee_id || undefined,
        due_date: objForm.due_date || undefined
      });
      setIsObjModalOpen(false);
      // Reload current plan details
      const updatedPlan = await planningService.getPlanById(selectedPlan.id);
      setSelectedPlan(updatedPlan);
      fetchData();
      setObjForm({
        name: '',
        description: '',
        status: 'PENDING',
        priority: 'MEDIUM',
        due_date: '',
        assignee_id: ''
      });
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al crear objetivo');
    }
  };

  const handleCreateActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await planningService.createActivity({
        ...actForm,
        objective_id: actForm.objective_id || undefined,
        municipality_id: actForm.municipality_id || undefined,
        zone_id: actForm.zone_id || undefined,
        polling_station_id: actForm.polling_station_id || undefined,
        polling_table_id: actForm.polling_table_id || undefined
      });
      setIsActModalOpen(false);
      if (selectedPlan) {
        const updatedPlan = await planningService.getPlanById(selectedPlan.id);
        setSelectedPlan(updatedPlan);
      }
      fetchData();
      setActForm({
        plan_id: '',
        objective_id: '',
        name: '',
        description: '',
        type: 'OTRA',
        priority: 'MEDIA',
        status: 'PENDIENTE',
        start_date: '',
        due_date: '',
        municipality_id: '',
        zone_id: '',
        polling_station_id: '',
        polling_table_id: '',
        assignee_ids: [],
        dependency_ids: []
      });
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al crear actividad');
    }
  };

  const handleStatusChange = async (activityId: string, newStatus: string) => {
    try {
      await planningService.updateActivityStatus(activityId, newStatus);
      if (selectedActivity && selectedActivity.id === activityId) {
        const updatedAct = await planningService.getActivityById(selectedActivity.id);
        setSelectedActivity(updatedAct);
      }
      if (selectedPlan) {
        const updatedPlan = await planningService.getPlanById(selectedPlan.id);
        setSelectedPlan(updatedPlan);
      }
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al cambiar estado');
    }
  };

  const handleAddCheckItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedActivity || !newCheckItem) return;
    try {
      await planningService.addChecklistItem(selectedActivity.id, newCheckItem);
      setNewCheckItem('');
      const updatedAct = await planningService.getActivityById(selectedActivity.id);
      setSelectedActivity(updatedAct);
      fetchData();
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleToggleCheckItem = async (itemId: string, currentStatus: boolean) => {
    if (!selectedActivity) return;
    try {
      await planningService.toggleChecklistItem(itemId, !currentStatus);
      const updatedAct = await planningService.getActivityById(selectedActivity.id);
      setSelectedActivity(updatedAct);
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedActivity || !newComment) return;
    try {
      await planningService.addComment(selectedActivity.id, newComment);
      setNewComment('');
      const updatedAct = await planningService.getActivityById(selectedActivity.id);
      setSelectedActivity(updatedAct);
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleAddEvidence = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedActivity || !evidenceName || !evidenceUrl) return;
    try {
      await planningService.addEvidence(selectedActivity.id, evidenceName, evidenceUrl);
      setEvidenceName('');
      setEvidenceUrl('');
      const updatedAct = await planningService.getActivityById(selectedActivity.id);
      setSelectedActivity(updatedAct);
    } catch (err: any) {
      console.error(err);
    }
  };

  const viewPlanDetail = async (plan: Plan) => {
    try {
      const detailed = await planningService.getPlanById(plan.id);
      setSelectedPlan(detailed);
    } catch (err) {
      console.error(err);
    }
  };

  const viewActivityDetail = async (activity: Activity) => {
    try {
      const detailed = await planningService.getActivityById(activity.id);
      setSelectedActivity(detailed);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Cargando planeación territorial...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      
      {/* Header Premium */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-primary font-semibold text-sm">
            <Sparkles size={16} />
            <span>Operaciones de Campaña</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">Planeación Territorial</h1>
          <p className="text-slate-500 text-sm">Convierte la cobertura electoral en metas, objetivos y planes de acción medibles.</p>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={() => setIsPlanModalOpen(true)} className="flex items-center gap-2">
            <FolderPlus size={18} />
            Nuevo Plan
          </Button>
          <Button onClick={() => {
            if (plans.length === 0) {
              alert('Debes crear un Plan primero.');
              return;
            }
            setActForm(prev => ({ ...prev, plan_id: plans[0].id }));
            setIsActModalOpen(true);
          }} variant="outline" className="flex items-center gap-2">
            <Plus size={18} />
            Nueva Actividad
          </Button>
        </div>
      </div>

      {/* Tabs Layout */}
      <div className="flex border-b border-slate-200 bg-white p-1 rounded-xl shadow-xs">
        <button 
          onClick={() => { setActiveTab('dashboard'); setSelectedPlan(null); }}
          className={cn("flex-1 py-3 px-4 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-all", activeTab === 'dashboard' ? "bg-primary text-white" : "text-slate-600 hover:bg-slate-50")}
        >
          <Trophy size={18} /> Dashboard
        </button>
        <button 
          onClick={() => { setActiveTab('plans'); }}
          className={cn("flex-1 py-3 px-4 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-all", activeTab === 'plans' ? "bg-primary text-white" : "text-slate-600 hover:bg-slate-50")}
        >
          <Target size={18} /> Planes y Objetivos
        </button>
        <button 
          onClick={() => { setActiveTab('kanban'); setSelectedPlan(null); }}
          className={cn("flex-1 py-3 px-4 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-all", activeTab === 'kanban' ? "bg-primary text-white" : "text-slate-600 hover:bg-slate-50")}
        >
          <KanbanSquare size={18} /> Kanban de Actividades
        </button>
        <button 
          onClick={() => { setActiveTab('calendar'); setSelectedPlan(null); }}
          className={cn("flex-1 py-3 px-4 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-all", activeTab === 'calendar' ? "bg-primary text-white" : "text-slate-600 hover:bg-slate-50")}
        >
          <CalendarIcon size={18} /> Calendario
        </button>
      </div>

      {/* -------------------- TAB: DASHBOARD -------------------- */}
      {activeTab === 'dashboard' && stats && (
        <div className="space-y-6 animate-in fade-in duration-350">
          {/* KPIs Section */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-sm font-semibold uppercase tracking-wider">Avance General</span>
                <TrendingUp size={20} className="text-primary" />
              </div>
              <h3 className="text-3xl font-extrabold text-slate-800 mt-3">{stats.percentage_completed}%</h3>
              <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
                <div className="bg-primary h-full transition-all duration-500" style={{ width: `${stats.percentage_completed}%` }}></div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-sm font-semibold uppercase tracking-wider">Atrasadas</span>
                <AlertTriangle size={20} className="text-danger" />
              </div>
              <h3 className="text-3xl font-extrabold text-slate-800 mt-3">{stats.activities_overdue}</h3>
              <p className="text-xs text-danger font-medium mt-2">Requieren atención urgente</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-sm font-semibold uppercase tracking-wider">En Progreso</span>
                <Clock size={20} className="text-info" />
              </div>
              <h3 className="text-3xl font-extrabold text-slate-800 mt-3">{stats.activities_in_progress}</h3>
              <p className="text-xs text-slate-500 mt-2">Actividades activas hoy</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-sm font-semibold uppercase tracking-wider">Colaboradores</span>
                <Users size={20} className="text-success" />
              </div>
              <h3 className="text-3xl font-extrabold text-slate-800 mt-3">{stats.active_members}</h3>
              <p className="text-xs text-success font-medium mt-2">Asignados a planeación</p>
            </div>
          </div>

          {/* Quick List / Action Area */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Active Plans Card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
              <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Target size={20} className="text-primary" /> Planes Activos
              </h2>
              <div className="space-y-3">
                {plans.slice(0, 5).map(plan => (
                  <div 
                    key={plan.id} 
                    onClick={() => { setActiveTab('plans'); viewPlanDetail(plan); }}
                    className="flex justify-between items-center p-4 rounded-xl border border-slate-100 hover:border-primary/30 hover:bg-primary/5 cursor-pointer transition-all"
                  >
                    <div>
                      <h4 className="font-semibold text-slate-800">{plan.name}</h4>
                      <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                        <span>Desde: {new Date(plan.start_date).toLocaleDateString()}</span>
                        {plan.municipality && (
                          <span className="flex items-center gap-1 text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                            <MapPin size={10} /> {plan.municipality.name}
                          </span>
                        )}
                      </p>
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary uppercase">
                      {plan.status}
                    </span>
                  </div>
                ))}
                {plans.length === 0 && (
                  <div className="text-center p-8 text-slate-400 text-sm">No hay planes activos registrados.</div>
                )}
              </div>
            </div>

            {/* Impending Activities Card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
              <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Clock size={20} className="text-primary" /> Próximas Actividades
              </h2>
              <div className="space-y-3">
                {activities.filter(a => a.status !== 'COMPLETADA').slice(0, 5).map(act => (
                  <div 
                    key={act.id} 
                    onClick={() => viewActivityDetail(act)}
                    className="flex justify-between items-center p-4 rounded-xl border border-slate-100 hover:border-primary/30 hover:bg-primary/5 cursor-pointer transition-all"
                  >
                    <div>
                      <h4 className="font-semibold text-slate-800">{act.name}</h4>
                      <p className="text-xs text-slate-500 mt-1">
                        Límite: {new Date(act.due_date).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={cn(
                      "text-[10px] font-bold px-2 py-1 rounded-full uppercase",
                      act.priority === 'CRITICA' && "bg-red-50 text-red-600 border border-red-200",
                      act.priority === 'ALTA' && "bg-orange-50 text-orange-600 border border-orange-200",
                      act.priority === 'MEDIA' && "bg-yellow-50 text-yellow-600 border border-yellow-200",
                      act.priority === 'BAJA' && "bg-slate-50 text-slate-600 border border-slate-200"
                    )}>
                      {act.priority}
                    </span>
                  </div>
                ))}
                {activities.filter(a => a.status !== 'COMPLETADA').length === 0 && (
                  <div className="text-center p-8 text-slate-400 text-sm">Felicidades, no tienes actividades pendientes.</div>
                )}
              </div>
            </div>
            
          </div>
        </div>
      )}

      {/* -------------------- TAB: PLANS -------------------- */}
      {activeTab === 'plans' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
          
          {/* Left panel: Plan list */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
            <h2 className="font-bold text-slate-800 text-lg">Catálogo de Planes</h2>
            <div className="space-y-3">
              {plans.map(plan => (
                <div 
                  key={plan.id}
                  onClick={() => viewPlanDetail(plan)}
                  className={cn(
                    "p-4 rounded-xl border border-slate-100 cursor-pointer transition-all hover:bg-slate-50",
                    selectedPlan?.id === plan.id && "border-primary/50 bg-primary/5 hover:bg-primary/5"
                  )}
                >
                  <h4 className="font-semibold text-slate-800">{plan.name}</h4>
                  <p className="text-xs text-slate-500 mt-2 line-clamp-2">{plan.description || 'Sin descripción'}</p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 uppercase">
                      {plan.status}
                    </span>
                    <span className="text-xs text-slate-400">
                      {new Date(plan.start_date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
              {plans.length === 0 && (
                <div className="text-center p-8 text-slate-400 text-sm">No hay planes registrados.</div>
              )}
            </div>
          </div>

          {/* Right panel: Plan Details & Objectives / Activities */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
            {selectedPlan ? (
              <div className="space-y-6">
                
                {/* Details Header */}
                <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                  <div>
                    <h2 className="text-xl font-bold text-slate-800">{selectedPlan.name}</h2>
                    <p className="text-slate-500 text-sm mt-1">{selectedPlan.description}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => {
                      setObjForm(prev => ({ ...prev, plan_id: selectedPlan.id }));
                      setIsObjModalOpen(true);
                    }} size="sm" variant="outline">
                      + Objetivo
                    </Button>
                    <Button onClick={() => {
                      setActForm(prev => ({ ...prev, plan_id: selectedPlan.id }));
                      setIsActModalOpen(true);
                    }} size="sm">
                      + Actividad
                    </Button>
                  </div>
                </div>

                {/* Objectives list */}
                <div className="space-y-4">
                  <h3 className="font-bold text-slate-700 text-md flex items-center gap-2">
                    <Target size={18} className="text-primary" /> Objetivos Estratégicos
                  </h3>

                  {selectedPlan.objectives?.map(obj => (
                    <div key={obj.id} className="p-4 rounded-xl border border-slate-100 space-y-3 bg-slate-50/50">
                      <div className="flex justify-between items-center">
                        <h4 className="font-semibold text-slate-800">{obj.name}</h4>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary uppercase">
                          {obj.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">{obj.description}</p>
                      
                      {/* Activities inside Objective */}
                      <div className="space-y-2 pt-2 border-t border-slate-100">
                        {obj.activities?.map(act => (
                          <div 
                            key={act.id} 
                            onClick={() => viewActivityDetail(act)}
                            className="flex justify-between items-center p-3 bg-white rounded-lg border border-slate-100 hover:border-primary/20 cursor-pointer transition-all"
                          >
                            <div className="flex items-center gap-2">
                              <CheckCircle 
                                size={16} 
                                className={act.status === 'COMPLETADA' ? "text-success" : "text-slate-300"} 
                                onClick={(e: React.MouseEvent) => {
                                  e.stopPropagation();
                                  handleStatusChange(act.id, act.status === 'COMPLETADA' ? 'PENDIENTE' : 'COMPLETADA');
                                }}
                              />
                              <span className={cn("text-xs text-slate-700", act.status === 'COMPLETADA' && "line-through text-slate-400")}>
                                {act.name}
                              </span>
                            </div>
                            <span className="text-[10px] font-semibold text-slate-400">
                              Límite: {new Date(act.due_date).toLocaleDateString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  {/* Orphan activities list */}
                  {selectedPlan.activities && selectedPlan.activities.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-semibold text-slate-700 text-xs uppercase tracking-wider">Otras Actividades Operativas</h4>
                      {selectedPlan.activities.map(act => (
                        <div 
                          key={act.id}
                          onClick={() => viewActivityDetail(act)}
                          className="flex justify-between items-center p-3 bg-white rounded-lg border border-slate-100 hover:border-primary/20 cursor-pointer transition-all"
                        >
                          <div className="flex items-center gap-2">
                            <CheckCircle 
                              size={16} 
                              className={act.status === 'COMPLETADA' ? "text-success" : "text-slate-300"} 
                              onClick={(e: React.MouseEvent) => {
                                e.stopPropagation();
                                handleStatusChange(act.id, act.status === 'COMPLETADA' ? 'PENDIENTE' : 'COMPLETADA');
                              }}
                            />
                            <span className={cn("text-xs text-slate-700", act.status === 'COMPLETADA' && "line-through text-slate-400")}>
                              {act.name}
                            </span>
                          </div>
                          <span className="text-[10px] font-semibold text-slate-400">
                            Límite: {new Date(act.due_date).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {(!selectedPlan.objectives || selectedPlan.objectives.length === 0) && (!selectedPlan.activities || selectedPlan.activities.length === 0) && (
                    <div className="text-center p-8 text-slate-400 text-sm">Este plan no tiene objetivos ni actividades asignadas.</div>
                  )}
                </div>

              </div>
            ) : (
              <div className="text-center p-16 text-slate-400">Selecciona un Plan para ver sus objetivos y actividades en detalle.</div>
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
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-slate-700 text-sm capitalize">
                    {col.replace('_', ' ').toLowerCase()}
                  </h3>
                  <span className="bg-slate-200/80 px-2 py-0.5 text-xs font-semibold rounded-full text-slate-600">
                    {colActivities.length}
                  </span>
                </div>
                
                <div className="flex-1 space-y-3 overflow-y-auto">
                  {colActivities.map(act => (
                    <div 
                      key={act.id} 
                      onClick={() => viewActivityDetail(act)}
                      className="bg-white p-4 rounded-xl border border-slate-100 hover:shadow-xs cursor-pointer transition-all space-y-3"
                    >
                      <h4 className="font-semibold text-slate-800 text-sm">{act.name}</h4>
                      {act.description && <p className="text-xs text-slate-500 line-clamp-2">{act.description}</p>}
                      
                      <div className="flex justify-between items-center text-[10px]">
                        <span className={cn(
                          "px-2 py-0.5 rounded-full font-bold uppercase",
                          act.priority === 'CRITICA' && "bg-red-50 text-red-600",
                          act.priority === 'ALTA' && "bg-orange-50 text-orange-600",
                          act.priority === 'MEDIA' && "bg-yellow-50 text-yellow-600",
                          act.priority === 'BAJA' && "bg-slate-50 text-slate-600"
                        )}>
                          {act.priority}
                        </span>
                        <span className="text-slate-400">
                          {new Date(act.due_date).toLocaleDateString()}
                        </span>
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

      {/* -------------------- TAB: CALENDAR -------------------- */}
      {activeTab === 'calendar' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs animate-in fade-in duration-300">
          <h2 className="font-bold text-slate-800 text-lg mb-4">Cronograma de Actividades</h2>
          <div className="grid grid-cols-7 gap-1 bg-slate-100 p-1 rounded-xl">
            {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(d => (
              <div key={d} className="text-center text-xs font-bold text-slate-500 py-2">{d}</div>
            ))}
            
            {/* Simple mock calendar layout */}
            {Array.from({ length: 35 }).map((_, i) => {
              const day = (i % 28) + 1;
              const hasActivity = i % 7 === 0;
              return (
                <div key={i} className="bg-white min-h-[80px] p-2 border border-slate-50 hover:bg-slate-50/50 transition-all rounded-lg flex flex-col justify-between">
                  <span className="text-xs font-bold text-slate-400">{day}</span>
                  {hasActivity && (
                    <div className="bg-primary/10 text-primary text-[10px] font-semibold p-1 rounded-md truncate">
                      Visita Territorial
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* -------------------- DETAIL PANEL: ACTIVITY DRAWER / MODAL -------------------- */}
      {selectedActivity && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex justify-end z-50 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg h-full flex flex-col p-6 space-y-6 shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-350">
            
            {/* Header */}
            <div className="flex justify-between items-start border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-bold text-slate-800 text-lg">{selectedActivity.name}</h3>
                <p className="text-slate-500 text-sm mt-1">{selectedActivity.description || 'Sin descripción'}</p>
              </div>
              <button onClick={() => setSelectedActivity(null)} className="p-1 hover:bg-slate-100 rounded-lg">
                <X size={20} className="text-slate-500" />
              </button>
            </div>

            {/* Quick transition buttons */}
            <div className="flex flex-wrap gap-2">
              {['PENDIENTE', 'EN_PROGRESO', 'BLOQUEADA', 'COMPLETADA'].map(state => (
                <button
                  key={state}
                  onClick={() => handleStatusChange(selectedActivity.id, state)}
                  className={cn(
                    "text-xs font-bold px-3 py-1.5 rounded-full border transition-all",
                    selectedActivity.status === state 
                      ? "bg-primary text-white border-primary" 
                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                  )}
                >
                  {state.replace('_', ' ')}
                </button>
              ))}
            </div>

            {/* Checklist */}
            <div className="space-y-3">
              <h4 className="font-bold text-slate-700 text-sm flex items-center gap-2">
                <ListTodo size={16} /> Checklist de Tareas
              </h4>
              <form onSubmit={handleAddCheckItem} className="flex gap-2">
                <Input 
                  placeholder="Agregar elemento a la lista..." 
                  value={newCheckItem} 
                  onChange={(e) => setNewCheckItem(e.target.value)} 
                />
                <Button type="submit">Añadir</Button>
              </form>
              <div className="space-y-2">
                {selectedActivity.checklist?.map(item => (
                  <div key={item.id} className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-100 bg-slate-50/50">
                    <input 
                      type="checkbox" 
                      checked={item.is_completed} 
                      onChange={() => handleToggleCheckItem(item.id, item.is_completed)}
                      className="rounded text-primary focus:ring-primary h-4 w-4"
                    />
                    <span className={cn("text-xs text-slate-700", item.is_completed && "line-through text-slate-400")}>
                      {item.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Evidence & Attachments */}
            <div className="space-y-3">
              <h4 className="font-bold text-slate-700 text-sm flex items-center gap-2">
                <Paperclip size={16} /> Evidencias y Adjuntos
              </h4>
              <form onSubmit={handleAddEvidence} className="flex gap-2">
                <Input 
                  placeholder="Nombre de la evidencia..." 
                  value={evidenceName}
                  onChange={(e) => setEvidenceName(e.target.value)}
                />
                <Input 
                  placeholder="URL del archivo..." 
                  value={evidenceUrl}
                  onChange={(e) => setEvidenceUrl(e.target.value)}
                />
                <Button type="submit">Adjuntar</Button>
              </form>
              <div className="space-y-2">
                {selectedActivity.evidence?.map(ev => (
                  <a 
                    key={ev.id} 
                    href={ev.file_url} 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-all text-xs text-primary"
                  >
                    <span>{ev.file_name}</span>
                    <ArrowRight size={14} />
                  </a>
                ))}
              </div>
            </div>

            {/* Comments Section */}
            <div className="space-y-3 flex-1 flex flex-col">
              <h4 className="font-bold text-slate-700 text-sm flex items-center gap-2">
                <MessageSquare size={16} /> Comentarios y Bitácora
              </h4>
              <div className="flex-1 overflow-y-auto max-h-[150px] space-y-2">
                {selectedActivity.comments?.map(comment => (
                  <div key={comment.id} className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 text-xs">
                    <div className="flex justify-between items-center font-bold text-slate-700 mb-1">
                      <span>{comment.user.name}</span>
                      <span className="text-slate-400 font-normal">{new Date(comment.created_at).toLocaleDateString()}</span>
                    </div>
                    <p className="text-slate-600">{comment.content}</p>
                  </div>
                ))}
              </div>
              <form onSubmit={handleAddComment} className="flex gap-2">
                <Input 
                  placeholder="Escribir comentario interno..." 
                  value={newComment} 
                  onChange={(e) => setNewComment(e.target.value)} 
                />
                <Button type="submit">Enviar</Button>
              </form>
            </div>

          </div>
        </div>
      )}

      {/* -------------------- MODAL: CREATE PLAN -------------------- */}
      {isPlanModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-md p-6 rounded-2xl shadow-xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800 text-lg">Nuevo Plan Territorial</h3>
              <button onClick={() => setIsPlanModalOpen(false)} className="p-1 hover:bg-slate-100 rounded-lg">
                <X size={18} className="text-slate-500" />
              </button>
            </div>
            
            <form onSubmit={handleCreatePlan} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-600">Nombre del Plan</label>
                <Input 
                  required 
                  placeholder="Ej: Plan de Voluntariado Zona Norte" 
                  value={planForm.name} 
                  onChange={(e) => setPlanForm(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600">Descripción</label>
                <Input 
                  placeholder="Detalles sobre los objetivos y alcance" 
                  value={planForm.description} 
                  onChange={(e) => setPlanForm(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-600">Fecha Inicio</label>
                  <Input 
                    required
                    type="date" 
                    value={planForm.start_date} 
                    onChange={(e) => setPlanForm(prev => ({ ...prev, start_date: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">Fecha Fin</label>
                  <Input 
                    type="date" 
                    value={planForm.end_date} 
                    onChange={(e) => setPlanForm(prev => ({ ...prev, end_date: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-600">Prioridad</label>
                  <select 
                    value={planForm.priority}
                    onChange={(e) => setPlanForm(prev => ({ ...prev, priority: e.target.value }))}
                    className="w-full h-10 border border-slate-200 rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="BAJA">Baja</option>
                    <option value="MEDIA">Media</option>
                    <option value="ALTA">Alta</option>
                    <option value="CRITICA">Crítica</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">Municipio</label>
                  <select 
                    value={planForm.municipality_id}
                    onChange={(e) => setPlanForm(prev => ({ ...prev, municipality_id: e.target.value }))}
                    className="w-full h-10 border border-slate-200 rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Ninguno</option>
                    {municipalities.map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsPlanModalOpen(false)}>Cancelar</Button>
                <Button type="submit">Crear Plan</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* -------------------- MODAL: CREATE OBJECTIVE -------------------- */}
      {isObjModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-md p-6 rounded-2xl shadow-xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800 text-lg">Añadir Objetivo</h3>
              <button onClick={() => setIsObjModalOpen(false)} className="p-1 hover:bg-slate-100 rounded-lg">
                <X size={18} className="text-slate-500" />
              </button>
            </div>

            <form onSubmit={handleCreateObjective} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-600">Objetivo Estratégico</label>
                <Input 
                  required 
                  placeholder="Ej: Completar los testigos del Puesto Principal" 
                  value={objForm.name} 
                  onChange={(e) => setObjForm(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600">Descripción</label>
                <Input 
                  placeholder="Detalles sobre este objetivo" 
                  value={objForm.description} 
                  onChange={(e) => setObjForm(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-600">Fecha Objetivo</label>
                  <Input 
                    type="date" 
                    value={objForm.due_date} 
                    onChange={(e) => setObjForm(prev => ({ ...prev, due_date: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">Responsable</label>
                  <select 
                    value={objForm.assignee_id}
                    onChange={(e) => setObjForm(prev => ({ ...prev, assignee_id: e.target.value }))}
                    className="w-full h-10 border border-slate-200 rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Ninguno</option>
                    {members.map(m => (
                      <option key={m.id} value={m.id}>{m.first_name} {m.last_name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsObjModalOpen(false)}>Cancelar</Button>
                <Button type="submit">Añadir</Button>
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
              <h3 className="font-bold text-slate-800 text-lg">Nueva Actividad Operativa</h3>
              <button onClick={() => setIsActModalOpen(false)} className="p-1 hover:bg-slate-100 rounded-lg">
                <X size={18} className="text-slate-500" />
              </button>
            </div>

            <form onSubmit={handleCreateActivity} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-600">Asociar al Plan</label>
                  <select 
                    required
                    value={actForm.plan_id}
                    onChange={(e) => setActForm(prev => ({ ...prev, plan_id: e.target.value }))}
                    className="w-full h-10 border border-slate-200 rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {plans.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600">Objetivo Relacionado</label>
                  <select 
                    value={actForm.objective_id}
                    onChange={(e) => setActForm(prev => ({ ...prev, objective_id: e.target.value }))}
                    className="w-full h-10 border border-slate-200 rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Ninguno</option>
                    {plans.find(p => p.id === actForm.plan_id)?.objectives?.map(o => (
                      <option key={o.id} value={o.id}>{o.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600">Nombre de la Actividad</label>
                <Input 
                  required 
                  placeholder="Ej: Entrega de acreditaciones a testigos" 
                  value={actForm.name} 
                  onChange={(e) => setActForm(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600">Descripción</label>
                <Input 
                  placeholder="Instrucciones del plan de acción" 
                  value={actForm.description} 
                  onChange={(e) => setActForm(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-600">Tipo de Actividad</label>
                  <select 
                    value={actForm.type}
                    onChange={(e) => setActForm(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full h-10 border border-slate-200 rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="REUNION">Reunión</option>
                    <option value="VISITA">Visita</option>
                    <option value="CAPACITACION">Capacitación</option>
                    <option value="ORGANIZACION">Organización</option>
                    <option value="SEGUIMIENTO">Seguimiento</option>
                    <option value="LOGISTICA">Logística</option>
                    <option value="OTRA">Otra</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600">Fecha Inicio</label>
                  <Input 
                    required
                    type="date" 
                    value={actForm.start_date} 
                    onChange={(e) => setActForm(prev => ({ ...prev, start_date: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600">Fecha Límite</label>
                  <Input 
                    required
                    type="date" 
                    value={actForm.due_date} 
                    onChange={(e) => setActForm(prev => ({ ...prev, due_date: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-600">Zona Territorial</label>
                  <select 
                    value={actForm.zone_id}
                    onChange={(e) => setActForm(prev => ({ ...prev, zone_id: e.target.value }))}
                    className="w-full h-10 border border-slate-200 rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Todas</option>
                    {zones.map(z => (
                      <option key={z.id} value={z.id}>{z.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600">Puesto de Votación</label>
                  <select 
                    value={actForm.polling_station_id}
                    onChange={(e) => setActForm(prev => ({ ...prev, polling_station_id: e.target.value }))}
                    className="w-full h-10 border border-slate-200 rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Todos</option>
                    {stations.filter(s => !actForm.zone_id || s.zone_id === actForm.zone_id).map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600">Asignar a Colaboradores</label>
                <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto border border-slate-100 p-2.5 rounded-lg">
                  {members.map(m => (
                    <label key={m.id} className="flex items-center gap-2 text-xs">
                      <input 
                        type="checkbox" 
                        value={m.id} 
                        onChange={(e) => {
                          if (e.target.checked) {
                            setActForm(prev => ({ ...prev, assignee_ids: [...prev.assignee_ids, m.id] }));
                          } else {
                            setActForm(prev => ({ ...prev, assignee_ids: prev.assignee_ids.filter(id => id !== m.id) }));
                          }
                        }}
                        className="rounded text-primary focus:ring-primary h-3.5 w-3.5"
                      />
                      <span>{m.first_name} {m.last_name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600">Dependencias (Actividades Precedentes)</label>
                <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto border border-slate-100 p-2.5 rounded-lg">
                  {activities.filter(a => a.plan_id === actForm.plan_id).map(act => (
                    <label key={act.id} className="flex items-center gap-2 text-xs">
                      <input 
                        type="checkbox" 
                        value={act.id} 
                        onChange={(e) => {
                          if (e.target.checked) {
                            setActForm(prev => ({ ...prev, dependency_ids: [...prev.dependency_ids, act.id] }));
                          } else {
                            setActForm(prev => ({ ...prev, dependency_ids: prev.dependency_ids.filter(id => id !== act.id) }));
                          }
                        }}
                        className="rounded text-primary focus:ring-primary h-3.5 w-3.5"
                      />
                      <span>{act.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsActModalOpen(false)}>Cancelar</Button>
                <Button type="submit">Crear Actividad</Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
