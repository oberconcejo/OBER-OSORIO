import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, 
  Key, 
  CreditCard, 
  Users, 
  ShieldCheck, 
  Layers, 
  Briefcase, 
  FileText, 
  Activity, 
  Settings, 
  Plus, 
  Search, 
  Filter, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  TrendingUp, 
  DollarSign, 
  Download, 
  Trash2, 
  Edit3, 
  UserPlus,
  ArrowRight,
  Menu,
  ChevronRight,
  X,
  PieChart
} from 'lucide-react';
import { AuthUser, ViewMode } from '../../types';

interface PanelAdministrativoSaaSProps {
  onSelectView: (view: ViewMode) => void;
  authUser: AuthUser | null;
}

export type SaaSMenuTab = 
  | 'dashboard' 
  | 'clientes' 
  | 'licencias' 
  | 'suscripciones' 
  | 'usuarios' 
  | 'roles' 
  | 'modulos' 
  | 'planes' 
  | 'reportes' 
  | 'auditoria' 
  | 'configuracion'
  | 'importacion_electoral';

export const PanelAdministrativoSaaS: React.FC<PanelAdministrativoSaaSProps> = ({ onSelectView, authUser }) => {
  const [activeTab, setActiveTab] = useState<SaaSMenuTab>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Database States
  const [clients, setClients] = useState<any[]>([]);
  const [licenses, setLicenses] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Forms states
  const [clientFormOpen, setClientFormOpen] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [newClientPlan, setNewClientPlan] = useState('Starter');

  const [planFormOpen, setPlanFormOpen] = useState(false);
  const [newPlanName, setNewPlanName] = useState('');
  const [newPlanPrice, setNewPlanPrice] = useState(199);
  const [newPlanMaxUsers, setNewPlanMaxUsers] = useState(25);
  const [newPlanModules, setNewPlanModules] = useState<string[]>([]);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [planFilter, setPlanFilter] = useState('Todos');

  // Load SaaS Data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [clientsRes, licensesRes, subsRes, plansRes, logsRes] = await Promise.all([
        fetch('/api/saas/clients').then(res => res.json()),
        fetch('/api/saas/licenses').then(res => res.json()),
        fetch('/api/saas/subscriptions').then(res => res.json()),
        fetch('/api/saas/plans').then(res => res.json()),
        fetch('/api/saas/audit-logs').then(res => res.json())
      ]);

      setClients(clientsRes);
      setLicenses(licensesRes);
      setSubscriptions(subsRes);
      setPlans(plansRes);
      setAuditLogs(logsRes);
    } catch (err) {
      console.error('Error loading SaaS data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName || !newClientEmail) return;

    try {
      const res = await fetch('/api/saas/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newClientName,
          email: newClientEmail,
          phone: newClientPhone,
          plan: newClientPlan
        })
      });

      if (res.ok) {
        setNewClientName('');
        setNewClientEmail('');
        setNewClientPhone('');
        setClientFormOpen(false);
        fetchData();
      }
    } catch (err) {
      console.error('Error creating SaaS client:', err);
    }
  };

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlanName) return;

    try {
      const res = await fetch('/api/saas/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newPlanName,
          price: newPlanPrice,
          duration: 'Mensual',
          maxUsers: newPlanMaxUsers,
          modules: newPlanModules
        })
      });

      if (res.ok) {
        setNewPlanName('');
        setPlanFormOpen(false);
        fetchData();
      }
    } catch (err) {
      console.error('Error creating SaaS plan:', err);
    }
  };

  const handleUpdateClientStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/saas/clients/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) fetchData();
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const handleUpdateLicenseStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/saas/licenses/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) fetchData();
    } catch (err) {
      console.error('Error updating license:', err);
    }
  };

  const handleUpdateSubscription = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/saas/subscriptions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) fetchData();
    } catch (err) {
      console.error('Error updating subscription:', err);
    }
  };

  // Calculations for KPI Cards
  const activeClientsCount = clients.filter(c => c.status === 'Activo').length;
  const activeLicensesCount = licenses.filter(l => l.status === 'Activa').length;
  const expiredLicensesCount = licenses.filter(l => l.status === 'Vencida').length;
  const totalMrr = subscriptions.filter(s => s.status === 'Activo').reduce((acc, curr) => acc + curr.mrr, 0);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Activo':
      case 'Activa':
        return <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-[#111C30]0/10 text-emerald-400 border border-emerald-500/20">Activo</span>;
      case 'Suspendido':
      case 'Suspendida':
        return <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-[#111C30]0/10 text-amber-400 border border-amber-500/20">Suspendido</span>;
      case 'Vencida':
      case 'Vencido':
        return <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">Vencido</span>;
      case 'Inactivo':
      case 'Cancelada':
        return <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-[#111C30]0/10 text-slate-400 border border-slate-500/20">Inactivo</span>;
      default:
        return <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">{status}</span>;
    }
  };

  const tabsConfig = [
    { id: 'dashboard' as SaaSMenuTab, label: 'Dashboard', icon: <Activity className="w-4 h-4" /> },
    { id: 'clientes' as SaaSMenuTab, label: 'Clientes / Tenants', icon: <Building2 className="w-4 h-4" /> },
    { id: 'licencias' as SaaSMenuTab, label: 'Licencias reales', icon: <Key className="w-4 h-4" /> },
    { id: 'suscripciones' as SaaSMenuTab, label: 'Suscripciones MRR', icon: <CreditCard className="w-4 h-4" /> },
    { id: 'usuarios' as SaaSMenuTab, label: 'Usuarios SaaS', icon: <Users className="w-4 h-4" /> },
    { id: 'roles' as SaaSMenuTab, label: 'Roles & Permisos', icon: <ShieldCheck className="w-4 h-4" /> },
    { id: 'modulos' as SaaSMenuTab, label: 'Módulos SaaS', icon: <Layers className="w-4 h-4" /> },
    { id: 'planes' as SaaSMenuTab, label: 'Planes comerciales', icon: <Briefcase className="w-4 h-4" /> },
    { id: 'reportes' as SaaSMenuTab, label: 'Reportes & Métricas', icon: <FileText className="w-4 h-4" /> },
    { id: 'auditoria' as SaaSMenuTab, label: 'Registro de Auditoría', icon: <Clock className="w-4 h-4" /> },
    { id: 'configuracion' as SaaSMenuTab, label: 'Configuración SaaS', icon: <Settings className="w-4 h-4" /> },
    { id: 'importacion_electoral' as SaaSMenuTab, label: 'Importación Electoral', icon: <Download className="w-4 h-4" /> },
  ];

  return (
    <div className="flex h-full min-h-[85vh] bg-[#020617] text-slate-100 font-sans">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-slate-800 bg-[#020617] shrink-0">
        <div className="p-5 border-b border-slate-800 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white shadow-md shadow-indigo-950/50">
            TN
          </div>
          <div>
            <h2 className="font-extrabold text-sm text-white tracking-wider leading-none">TECHNEO</h2>
            <span className="text-[10px] font-semibold text-purple-400 mt-1 block uppercase">SaaS Engine</span>
          </div>
        </div>

        <nav className="p-4 space-y-1 flex-1">
          {tabsConfig.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-900/40 border border-indigo-400/35'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button
            onClick={() => onSelectView('primera_interfaz')}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 text-slate-300 hover:text-white transition-all"
          >
            Volver a la App
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </aside>

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Subheader / Mobile Menu controller */}
        <div className="lg:hidden p-4 bg-[#020617] border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="font-extrabold text-sm tracking-widest text-white">TECHNEO SaaS</span>
          </div>
          <span className="text-xs bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full border border-indigo-500/30 font-bold uppercase">
            Superadmin
          </span>
        </div>

        {/* Mobile menu drawer */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <div className="fixed inset-0 z-50 flex lg:hidden">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMobileMenuOpen(false)}
                className="fixed inset-0 bg-black/70 backdrop-blur-sm"
              />
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 25 }}
                className="relative flex flex-col w-72 max-w-[80vw] bg-[#020617] h-full border-r border-slate-800 p-5 z-10"
              >
                <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
                  <span className="font-extrabold text-sm text-white tracking-widest uppercase">TECHNEO SaaS</span>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-1 rounded-lg bg-slate-900 text-slate-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <nav className="space-y-1 flex-1 overflow-y-auto">
                  {tabsConfig.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                        activeTab === tab.id
                          ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                      }`}
                    >
                      {tab.icon}
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </nav>
                <div className="pt-4 border-t border-slate-800 mt-4">
                  <button
                    onClick={() => onSelectView('primera_interfaz')}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold bg-slate-900 border border-slate-800 text-slate-300"
                  >
                    Volver a la App
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Content Body */}
        <div className="p-4 sm:p-6 md:p-8 flex-1">
          {loading ? (
            <div className="h-96 flex flex-col items-center justify-center gap-3">
              <RefreshCw className="w-10 h-10 text-indigo-400 animate-spin" />
              <p className="text-sm text-slate-400 font-medium">Sincronizando base de datos SaaS...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Header Info */}
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400 bg-indigo-950/60 px-2 py-0.5 rounded-full border border-indigo-800/50">
                      SaaS Control Center
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400 font-mono">TN-v3.0 Secure</span>
                  </div>
                  <h1 className="text-xl sm:text-2xl font-black text-white mt-1 uppercase tracking-wide">
                    {tabsConfig.find(t => t.id === activeTab)?.label}
                  </h1>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={fetchData}
                    className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 transition-all cursor-pointer"
                    title="Actualizar Datos"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                  {activeTab === 'clientes' && (
                    <button
                      onClick={() => setClientFormOpen(true)}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-xs shadow-md shadow-indigo-950/40 border border-indigo-400/30 transition-all cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      Crear Cliente
                    </button>
                  )}
                  {activeTab === 'planes' && (
                    <button
                      onClick={() => setPlanFormOpen(true)}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-xs shadow-md shadow-indigo-950/40 border border-indigo-400/30 transition-all cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      Crear Plan Comercial
                    </button>
                  )}
                </div>
              </div>

              {/* TAB 1: DASHBOARD */}
              {activeTab === 'dashboard' && (
                <div className="space-y-6">
                  {/* KPI Cards Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-5 rounded-2xl bg-gradient-to-br from-[#051124] to-[#020815] border border-slate-800 shadow-xl flex items-center justify-between">
                      <div>
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Clientes Totales</span>
                        <h3 className="text-2xl font-black text-white mt-1 font-mono">{clients.length}</h3>
                        <p className="text-[10px] text-emerald-400 font-bold mt-1">+{activeClientsCount} activos en red</p>
                      </div>
                      <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                        <Building2 className="w-6 h-6" />
                      </div>
                    </div>

                    <div className="p-5 rounded-2xl bg-gradient-to-br from-[#051124] to-[#020815] border border-slate-800 shadow-xl flex items-center justify-between">
                      <div>
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Licencias Activas</span>
                        <h3 className="text-2xl font-black text-white mt-1 font-mono">{activeLicensesCount}</h3>
                        <p className="text-[10px] text-emerald-400 font-bold mt-1">0 suspendidas hoy</p>
                      </div>
                      <div className="w-12 h-12 rounded-xl bg-[#111C30]0/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                        <Key className="w-6 h-6" />
                      </div>
                    </div>

                    <div className="p-5 rounded-2xl bg-gradient-to-br from-[#051124] to-[#020815] border border-slate-800 shadow-xl flex items-center justify-between">
                      <div>
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Suscripciones MRR</span>
                        <h3 className="text-2xl font-black text-emerald-400 mt-1 font-mono">${totalMrr.toLocaleString('en-US')} <span className="text-xs text-slate-400">USD</span></h3>
                        <p className="text-[10px] text-emerald-400 font-bold mt-1">100% cobro mensual</p>
                      </div>
                      <div className="w-12 h-12 rounded-xl bg-[#111C30]0/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                        <CreditCard className="w-6 h-6" />
                      </div>
                    </div>

                    <div className="p-5 rounded-2xl bg-gradient-to-br from-[#051124] to-[#020815] border border-slate-800 shadow-xl flex items-center justify-between">
                      <div>
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Límites & Alertas</span>
                        <h3 className="text-2xl font-black text-amber-400 mt-1 font-mono">{expiredLicensesCount}</h3>
                        <p className="text-[10px] text-amber-400 font-bold mt-1">Licencia(s) próxima a vencer</p>
                      </div>
                      <div className="w-12 h-12 rounded-xl bg-[#111C30]0/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                        <AlertTriangle className="w-6 h-6" />
                      </div>
                    </div>
                  </div>

                  {/* Charts & Subsections Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Licencias por Estado & Ingresos */}
                    <div className="lg:col-span-2 p-5 rounded-2xl bg-[#020617] border border-slate-800 flex flex-col justify-between">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                        <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                          <Activity className="w-4 h-4 text-indigo-400" />
                          Rendimiento e Ingresos Mensuales Proyectados
                        </h3>
                        <span className="text-[10px] bg-indigo-500/20 text-indigo-300 font-bold px-2 py-0.5 rounded-full">Análisis Anual</span>
                      </div>
                      {/* Interactive Visual Bar Representation */}
                      <div className="space-y-4 py-4">
                        <div>
                          <div className="flex justify-between text-xs font-semibold text-slate-400 mb-1.5">
                            <span>Ingresos por Plan Enterprise Master ($5,000 USD)</span>
                            <span className="text-indigo-400">62.5%</span>
                          </div>
                          <div className="w-full bg-slate-900 rounded-full h-3.5 border border-slate-800 overflow-hidden">
                            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 h-full rounded-full" style={{ width: '62.5%' }} />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-xs font-semibold text-slate-400 mb-1.5">
                            <span>Ingresos por Plan Pro AI ($850 USD)</span>
                            <span className="text-purple-400">27.5%</span>
                          </div>
                          <div className="w-full bg-slate-900 rounded-full h-3.5 border border-slate-800 overflow-hidden">
                            <div className="bg-[#111C30]0 h-full rounded-full" style={{ width: '27.5%' }} />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-xs font-semibold text-slate-400 mb-1.5">
                            <span>Ingresos por Plan Starter ($150 USD)</span>
                            <span className="text-emerald-400">10%</span>
                          </div>
                          <div className="w-full bg-slate-900 rounded-full h-3.5 border border-slate-800 overflow-hidden">
                            <div className="bg-[#111C30]0 h-full rounded-full" style={{ width: '10%' }} />
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 p-4 rounded-xl bg-indigo-950/20 border border-indigo-500/10 text-xs text-indigo-300 flex items-center gap-3">
                        <TrendingUp className="w-5 h-5 shrink-0" />
                        <span>TECHNEO SaaS registra un incremento constante del <strong>15.4% de MRR</strong> este trimestre, impulsado por licencias electorales activas en Colombia.</span>
                      </div>
                    </div>

                    {/* Donut Chart / Licencias por Estado representation */}
                    <div className="p-5 rounded-2xl bg-[#020617] border border-slate-800 flex flex-col justify-between">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                        <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                          <PieChart className="w-4 h-4 text-purple-400" />
                          Licencias por Estado
                        </h3>
                      </div>

                      <div className="flex flex-col items-center justify-center py-4 flex-1">
                        {/* Circular progress bar mock representing status distribution */}
                        <div className="relative w-28 h-28 flex items-center justify-center">
                          <svg className="w-full h-full transform -rotate-90">
                            <circle cx="56" cy="56" r="48" stroke="#1e293b" strokeWidth="8" fill="transparent" />
                            <circle cx="56" cy="56" r="48" stroke="#6366f1" strokeWidth="8" fill="transparent" strokeDasharray="301" strokeDashoffset="75" />
                            <circle cx="56" cy="56" r="48" stroke="#a855f7" strokeWidth="8" fill="transparent" strokeDasharray="301" strokeDashoffset="180" />
                          </svg>
                          <div className="absolute text-center">
                            <span className="text-xl font-mono font-black text-white">{licenses.length}</span>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Totales</p>
                          </div>
                        </div>

                        {/* Chart Legends */}
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-4 w-full">
                          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 block shrink-0" />
                            <span>Activas: {licenses.filter(l => l.status === 'Activa').length}</span>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#111C30]0 block shrink-0" />
                            <span>Suspendidas: {licenses.filter(l => l.status === 'Suspendida').length}</span>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 block shrink-0" />
                            <span>Vencidas: {licenses.filter(l => l.status === 'Vencida').length}</span>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#111C30]0 block shrink-0" />
                            <span>Pendientes: {licenses.filter(l => l.status === 'Pendiente').length}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Table: Próximas a vencer */}
                  <div className="p-5 rounded-2xl bg-[#020617] border border-slate-800">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                      <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                        <Clock className="w-4 h-4 text-amber-400" />
                        Próximas Licencias y Suscripciones a Vencer
                      </h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-400">
                            <th className="pb-3 pr-4">Cliente / Campaña</th>
                            <th className="pb-3 pr-4">Plan Habilitado</th>
                            <th className="pb-3 pr-4">Código Licencia</th>
                            <th className="pb-3 pr-4">Fecha Vencimiento</th>
                            <th className="pb-3 text-right">Acciones</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800 text-xs">
                          {licenses.slice(0, 3).map((lic) => (
                            <tr key={lic.id} className="hover:bg-slate-900/40 transition-colors">
                              <td className="py-3.5 font-bold text-white pr-4">{lic.clientName}</td>
                              <td className="py-3.5 text-slate-300 pr-4">{lic.planName}</td>
                              <td className="py-3.5 text-slate-400 font-mono text-[10px] pr-4">{lic.code}</td>
                              <td className="py-3.5 text-amber-400 font-mono font-bold pr-4">{lic.expirationDate}</td>
                              <td className="py-3.5 text-right">
                                <button
                                  onClick={() => setActiveTab('licencias')}
                                  className="px-3 py-1.5 rounded-lg bg-indigo-500/20 hover:bg-indigo-600 text-indigo-300 hover:text-white font-bold transition-all"
                                >
                                  Gestionar
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: CLIENTES */}
              {activeTab === 'clientes' && (
                <div className="space-y-6">
                  {/* Filter & search */}
                  <div className="flex flex-col sm:flex-row gap-4 justify-between bg-slate-950/40 border border-slate-800 p-4 rounded-2xl">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Buscar cliente por nombre o correo..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div className="flex gap-2">
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 focus:outline-none"
                      >
                        <option value="Todos">Todos los Estados</option>
                        <option value="Activo">Activo</option>
                        <option value="Suspendido">Suspendido</option>
                        <option value="Inactivo">Inactivo</option>
                      </select>
                    </div>
                  </div>

                  {/* Clients List */}
                  <div className="bg-[#020617] border border-slate-800 rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-950/20">
                            <th className="p-4">ID</th>
                            <th className="p-4">Cliente / Organización</th>
                            <th className="p-4">Correo</th>
                            <th className="p-4">Teléfono</th>
                            <th className="p-4">Plan Actual</th>
                            <th className="p-4">Registro</th>
                            <th className="p-4">Estado</th>
                            <th className="p-4 text-right">Acciones</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800 text-xs">
                          {clients
                            .filter(c => statusFilter === 'Todos' || c.status === statusFilter)
                            .filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.email.toLowerCase().includes(searchTerm.toLowerCase()))
                            .map((client) => (
                              <tr key={client.id} className="hover:bg-slate-900/30 transition-colors">
                                <td className="p-4 font-mono text-[10px] text-slate-400">{client.id}</td>
                                <td className="p-4 font-bold text-white">{client.name}</td>
                                <td className="p-4 text-slate-300 font-mono">{client.email}</td>
                                <td className="p-4 text-slate-400 font-mono">{client.phone || 'N/A'}</td>
                                <td className="p-4">
                                  <span className="px-2.5 py-1 text-[10px] font-extrabold rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 uppercase tracking-wider">{client.plan}</span>
                                </td>
                                <td className="p-4 text-slate-400 font-mono">{client.joinedDate}</td>
                                <td className="p-4">{getStatusBadge(client.status)}</td>
                                <td className="p-4 text-right space-x-1 whitespace-nowrap">
                                  {client.status === 'Activo' ? (
                                    <button
                                      onClick={() => handleUpdateClientStatus(client.id, 'Suspendido')}
                                      className="px-2.5 py-1.5 rounded-lg bg-[#111C30]0/10 hover:bg-amber-600 text-amber-400 hover:text-white font-bold transition-all text-[11px]"
                                    >
                                      Suspender
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => handleUpdateClientStatus(client.id, 'Activo')}
                                      className="px-2.5 py-1.5 rounded-lg bg-[#111C30]0/10 hover:bg-emerald-600 text-emerald-400 hover:text-white font-bold transition-all text-[11px]"
                                    >
                                      Activar
                                    </button>
                                  )}
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: LICENCIAS */}
              {activeTab === 'licencias' && (
                <div className="space-y-6">
                  {/* Licenses List */}
                  <div className="bg-[#020617] border border-slate-800 rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-950/20">
                            <th className="p-4">Código Real</th>
                            <th className="p-4">Cliente</th>
                            <th className="p-4">Plan</th>
                            <th className="p-4">Límite Usuarios</th>
                            <th className="p-4">Vencimiento</th>
                            <th className="p-4">Estado</th>
                            <th className="p-4 text-right">Modificar</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800 text-xs">
                          {licenses.map((lic) => (
                            <tr key={lic.id} className="hover:bg-slate-900/30 transition-colors">
                              <td className="p-4 font-mono text-[10px] text-purple-400 font-bold">{lic.code}</td>
                              <td className="p-4 font-bold text-white">{lic.clientName}</td>
                              <td className="p-4 text-slate-300 font-bold">{lic.planName}</td>
                              <td className="p-4 text-slate-400 font-mono font-bold">{lic.maxUsers} Usuarios Max</td>
                              <td className="p-4 text-slate-300 font-mono">{lic.expirationDate}</td>
                              <td className="p-4">{getStatusBadge(lic.status)}</td>
                              <td className="p-4 text-right space-x-1 whitespace-nowrap">
                                <button
                                  onClick={() => {
                                    const nextStatus = lic.status === 'Activa' ? 'Suspendida' : 'Activa';
                                    handleUpdateLicenseStatus(lic.id, nextStatus);
                                  }}
                                  className="px-2.5 py-1.5 rounded-lg bg-indigo-500/20 hover:bg-indigo-600 text-indigo-300 hover:text-white font-bold transition-all text-[11px]"
                                >
                                  {lic.status === 'Activa' ? 'Inhabilitar' : 'Habilitar'}
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: SUSCRIPCIONES */}
              {activeTab === 'suscripciones' && (
                <div className="space-y-6">
                  {/* Suscripciones List */}
                  <div className="bg-[#020617] border border-slate-800 rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-950/20">
                            <th className="p-4">ID</th>
                            <th className="p-4">Cliente</th>
                            <th className="p-4">Plan Contratado</th>
                            <th className="p-4">Ciclo</th>
                            <th className="p-4">Próxima Renovación</th>
                            <th className="p-4">MRR Mensual</th>
                            <th className="p-4">Estado Cobro</th>
                            <th className="p-4 text-right">Renovación</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800 text-xs">
                          {subscriptions.map((sub) => (
                            <tr key={sub.id} className="hover:bg-slate-900/30 transition-colors">
                              <td className="p-4 font-mono text-[10px] text-slate-400">{sub.id}</td>
                              <td className="p-4 font-bold text-white">{sub.clientName}</td>
                              <td className="p-4 text-indigo-300 font-bold">{sub.planName}</td>
                              <td className="p-4 text-slate-400 font-semibold">{sub.billingCycle}</td>
                              <td className="p-4 text-slate-300 font-mono">{sub.nextRenewal}</td>
                              <td className="p-4 font-bold text-emerald-400 font-mono">${sub.mrr} USD</td>
                              <td className="p-4">{getStatusBadge(sub.status)}</td>
                              <td className="p-4 text-right whitespace-nowrap">
                                <button
                                  onClick={() => handleUpdateSubscription(sub.id, 'Activo')}
                                  className="px-2.5 py-1.5 rounded-lg bg-[#111C30]0/10 hover:bg-emerald-600 text-emerald-400 hover:text-white font-bold transition-all text-[11px]"
                                >
                                  Renovar Pago
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: USUARIOS */}
              {activeTab === 'usuarios' && (
                <div className="space-y-6">
                  {/* Users of clients representation */}
                  <div className="bg-[#020617] border border-slate-800 rounded-2xl p-5">
                    <p className="text-sm text-slate-300 mb-4">
                      Lista de usuarios autorizados dentro del ecosistema multi-tenant de la plataforma electoral. Cada usuario se mapea a su respectivo cliente.
                    </p>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-400">
                            <th className="pb-3">Nombre</th>
                            <th className="pb-3">Cédula</th>
                            <th className="pb-3">Correo</th>
                            <th className="pb-3">Tenant / Cliente</th>
                            <th className="pb-3">Rol Técnico</th>
                            <th className="pb-3">Estado</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800 text-xs">
                          {clients.map((c, idx) => (
                            <tr key={idx} className="hover:bg-slate-900/30 transition-colors">
                              <td className="py-3.5 text-white font-bold">Coord. General {c.name.split(' ')[1] || 'SaaS'}</td>
                              <td className="py-3.5 text-slate-400 font-mono">10207849{idx}0</td>
                              <td className="py-3.5 text-slate-300 font-mono">coordinador@{c.email.split('@')[1]}</td>
                              <td className="py-3.5 text-indigo-400 font-semibold">{c.name}</td>
                              <td className="py-3.5 text-slate-400">Coordinador Principal</td>
                              <td className="py-3.5">{getStatusBadge('Activo')}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 6: ROLES */}
              {activeTab === 'roles' && (
                <div className="p-5 rounded-2xl bg-[#020617] border border-slate-800 space-y-4">
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">Configuración Jerárquica de Roles SaaS</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Define la jerarquía de roles estándar aplicada a los tenants y campañas registradas en la plataforma.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {['SUPERADMIN', 'ADMIN_CLIENTE', 'USUARIO', 'USUARIO_LIMITADO'].map((role, rIdx) => (
                      <div key={role} className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                        <span className="text-[10px] font-mono text-purple-400 font-bold">Jerarquía {rIdx + 1}</span>
                        <h4 className="text-sm font-bold text-white mt-1">{role}</h4>
                        <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                          {role === 'SUPERADMIN' && 'Control total del SaaS, acceso al Panel Administrativo y configuración general.'}
                          {role === 'ADMIN_CLIENTE' && 'Administración completa de la campaña/cliente contratado, licencias, subusuarios y carga de datos.'}
                          {role === 'USUARIO' && 'Acceso general para consulta, actualización, reportes y uso de los módulos autorizados.'}
                          {role === 'USUARIO_LIMITADO' && 'Permisos básicos de lectura de datos o rol especializado en territorio.'}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 7: MODULOS */}
              {activeTab === 'modulos' && (
                <div className="space-y-6">
                  {/* Dynamic Modules List */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                      { id: '1', name: 'Dashboard Principal', desc: 'Command Center y widgets interactivos.', icon: 'Activity', route: '/primera_interfaz' },
                      { id: '2', name: 'Módulo Estratégico', desc: 'Análisis DAFO, inteligencia de campaña y perfil del candidato.', icon: 'Briefcase', route: '/gestion_estrategica' },
                      { id: '3', name: 'Módulo Territorial', desc: 'CRM político, registro de votantes y georreferenciación de puestos.', icon: 'MapPin', route: '/gestion_territorial' },
                      { id: '4', name: 'Testigos de Campo', desc: 'Control en tiempo real de jurados, testigos y reporte de actas E-14.', icon: 'Key', route: '/testigo_campo' },
                      { id: '5', name: 'Encuestas y Sondeos', desc: 'Carga de encuestas y visualizador estadístico de intención de voto.', icon: 'PieChart', route: '/encuestas' },
                      { id: '6', name: 'Presupuesto CNE', desc: 'Control de ingresos y egresos de la campaña según normativas de cuentas claras.', icon: 'DollarSign', route: '/presupuesto' }
                    ].map((mod) => (
                      <div key={mod.id} className="p-5 rounded-2xl bg-[#020617] border border-slate-800 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                              <Layers className="w-5 h-5" />
                            </div>
                            <div>
                              <h4 className="text-sm font-bold text-white">{mod.name}</h4>
                              <span className="text-[10px] font-mono text-slate-400">{mod.route}</span>
                            </div>
                          </div>
                          <p className="text-xs text-slate-400 mt-3 leading-relaxed">{mod.desc}</p>
                        </div>
                        <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] font-bold text-indigo-400">
                          <span>Estado: Activo</span>
                          <span className="text-[10px] bg-slate-900 border border-slate-800 text-slate-400 px-2.5 py-0.5 rounded-full uppercase tracking-wider">Habilitado</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 8: PLANES */}
              {activeTab === 'planes' && (
                <div className="space-y-6">
                  {/* Plans List */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {plans.map((p) => (
                      <div key={p.id} className="p-6 rounded-2xl bg-[#020617] border border-slate-800 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="text-base font-black text-white">{p.name}</h4>
                              <span className="text-[10px] font-mono text-slate-400">{p.id}</span>
                            </div>
                            <span className="text-xs bg-indigo-500/10 text-indigo-300 font-bold px-2.5 py-0.5 rounded-full border border-indigo-500/25 uppercase">Activo</span>
                          </div>
                          <div className="my-5">
                            <span className="text-3xl font-mono font-black text-white">${p.price}</span>
                            <span className="text-xs text-slate-400 font-semibold"> / {p.duration}</span>
                          </div>
                          <ul className="space-y-3.5 text-xs text-slate-400 border-t border-slate-800/80 pt-4">
                            <li className="flex items-center gap-2.5">
                              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                              <span>Máximo {p.maxUsers} usuarios</span>
                            </li>
                            <li className="flex items-center gap-2.5">
                              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                              <span>{p.modules.length} Módulos habilitados</span>
                            </li>
                            <li className="flex items-center gap-2.5">
                              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                              <span>Soporte técnico 24/7 real</span>
                            </li>
                          </ul>
                        </div>
                        <div className="mt-6 pt-4 border-t border-slate-800/80">
                          <button
                            onClick={() => alert(`El plan comercial ${p.name} ya está activo para contratación.`)}
                            className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-bold text-slate-300 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer text-center"
                          >
                            Editar Plan
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 9: REPORTES */}
              {activeTab === 'reportes' && (
                <div className="p-6 rounded-2xl bg-[#020617] border border-slate-800 space-y-4">
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">Métricas Financieras y Reporte de MRR</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Descarga reportes certificados de rendimiento de licencias contratadas, próximas renovaciones e ingresos mensuales recurrentes (MRR).
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                    <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
                      <div>
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider">Reporte de Facturación CNE</h4>
                        <p className="text-[11px] text-slate-400 mt-1">Ingresos y egresos generados por campañas colombianas</p>
                      </div>
                      <button
                        onClick={() => alert('Descargando PDF de facturación de campañas...')}
                        className="p-3 rounded-xl bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white transition-all cursor-pointer"
                      >
                        <Download className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
                      <div>
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider">Reporte de Uso de Recursos</h4>
                        <p className="text-[11px] text-slate-400 mt-1">Concurrencia de usuarios, pings GPS de testigos y OCR</p>
                      </div>
                      <button
                        onClick={() => alert('Descargando reporte de uso de recursos...')}
                        className="p-3 rounded-xl bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white transition-all cursor-pointer"
                      >
                        <Download className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 10: AUDITORIA */}
              {activeTab === 'auditoria' && (
                <div className="p-5 rounded-2xl bg-[#020617] border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                    <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                      <Clock className="w-4 h-4 text-indigo-400" />
                      Registro de Auditoría de Seguridad SaaS (Real-time Logs)
                    </h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-400">
                          <th className="pb-3 pr-4">ID</th>
                          <th className="pb-3 pr-4">Acción Realizada</th>
                          <th className="pb-3 pr-4">Usuario Responsable</th>
                          <th className="pb-3 pr-4">Cliente / Ecosistema</th>
                          <th className="pb-3 pr-4">Fecha & Hora</th>
                          <th className="pb-3">Detalle</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800 text-xs">
                        {auditLogs.map((log) => (
                          <tr key={log.id} className="hover:bg-slate-900/30 transition-colors">
                            <td className="py-3.5 font-mono text-[10px] text-slate-400 pr-4">{log.id}</td>
                            <td className="py-3.5 text-white font-bold pr-4">{log.action}</td>
                            <td className="py-3.5 text-slate-300 font-mono pr-4">{log.user}</td>
                            <td className="py-3.5 text-indigo-400 font-semibold pr-4">{log.client || 'System'}</td>
                            <td className="py-3.5 text-slate-400 font-mono pr-4">{log.timestamp}</td>
                            <td className="py-3.5 text-slate-300">{log.details}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 11: CONFIGURACION */}
              {activeTab === 'configuracion' && (
                <div className="p-6 rounded-2xl bg-[#020617] border border-slate-800 space-y-6">
                  <div>
                    <h3 className="text-sm font-black text-white uppercase tracking-wider">Ajustes Generales del SaaS</h3>
                    <p className="text-xs text-slate-400 mt-1">Configura parámetros globales de TECHNEO.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-800/80">
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-slate-300">Modo de Mantenimiento</label>
                      <select className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none">
                        <option value="false">Desactivado (En línea)</option>
                        <option value="true">Activado (Mantenimiento)</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-slate-300">Tasa de Límite de Peticiones de API (Rate Limit)</label>
                      <input
                        type="number"
                        defaultValue={1200}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 12: IMPORTACION ELECTORAL */}
              {activeTab === 'importacion_electoral' && (
                <ElectoralImportView />
              )}
            </div>
          )}
        </div>
      </div>

      {/* CREATE CLIENT MODAL */}
      <AnimatePresence>
        {clientFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setClientFormOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-2xl z-10 text-slate-100"
            >
              <h2 className="text-base font-black text-white uppercase tracking-wider border-b border-slate-800 pb-3">
                Crear Nuevo Cliente (Tenant)
              </h2>
              <form onSubmit={handleCreateClient} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300 block">Nombre del Cliente / Campaña *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Campaña Bogotá Líder 2026"
                    value={newClientName}
                    onChange={(e) => setNewClientName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300 block">Correo Electrónico de Contacto *</label>
                  <input
                    type="email"
                    required
                    placeholder="Ej. contacto@bogotalider.com"
                    value={newClientEmail}
                    onChange={(e) => setNewClientEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300 block">Teléfono Móvil</label>
                  <input
                    type="text"
                    placeholder="Ej. +57 300 123 4567"
                    value={newClientPhone}
                    onChange={(e) => setNewClientPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300 block">Plan de Contratación Inicial</label>
                  <select
                    value={newClientPlan}
                    onChange={(e) => setNewClientPlan(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none"
                  >
                    <option value="Starter">Starter - $150/mes</option>
                    <option value="Pro AI">Pro AI - $850/mes</option>
                    <option value="Enterprise Master">Enterprise Master - $2,500/mes</option>
                  </select>
                </div>

                <div className="pt-4 border-t border-slate-800/80 flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => setClientFormOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-bold shadow-md shadow-indigo-950/40 border border-indigo-400/30"
                  >
                    Guardar Cliente
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ======================================================================
// COMPONENTE AUXILIAR PARA LA IMPORTACIÓN ELECTORAL DE DIVIPOLE Y CENSO
// ======================================================================
const ElectoralImportView: React.FC = () => {
  const [imports, setImports] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Form states
  const [file, setFile] = useState<File | null>(null);
  const [fuente, setFuente] = useState('DIVIPOLE Registraduría');
  const [eleccion, setEleccion] = useState('Presidencia 2026');
  const [fechaFuente, setFechaFuente] = useState(() => new Date().toISOString().split('T')[0]);

  // Messages
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchImports = async () => {
    setLoading(true);
    try {
      const savedUser = localStorage.getItem('bee_auth_user');
      const token = savedUser ? JSON.parse(savedUser).access_token : '';
      
      const res = await fetch('/api/electoral/imports', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setImports(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImports();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setErrorMsg('Por favor seleccione un archivo para importar.');
      return;
    }

    setUploading(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const savedUser = localStorage.getItem('bee_auth_user');
      const token = savedUser ? JSON.parse(savedUser).access_token : '';

      const formData = new FormData();
      formData.append('file', file);
      formData.append('fuente', fuente);
      formData.append('eleccion', eleccion);
      formData.append('fechaFuente', fechaFuente);

      const res = await fetch('/api/electoral/import', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await res.json();
      
      if (res.ok) {
        setSuccessMsg(data.message || 'Archivo importado y normalizado exitosamente.');
        setFile(null);
        // Clear file input
        const fileInput = document.getElementById('electoral-file-input') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
        fetchImports();
      } else {
        setErrorMsg(data.message || 'Hubo un error al procesar el archivo. Verifique el formato.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error de conexión con el servidor.');
    } finally {
      setUploading(false);
    }
  };

  const handleActivate = async (id: string) => {
    try {
      const savedUser = localStorage.getItem('bee_auth_user');
      const token = savedUser ? JSON.parse(savedUser).access_token : '';

      const res = await fetch(`/api/electoral/imports/${id}/activate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        setSuccessMsg('Versión del censo electoral activada de manera exitosa.');
        fetchImports();
      } else {
        const data = await res.json();
        setErrorMsg(data.message || 'No fue posible activar la versión.');
      }
    } catch (e: any) {
      setErrorMsg(e.message || 'Error de comunicación.');
    }
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Upload Box Form */}
      <div className="p-6 rounded-2xl bg-[#0F172A] border border-slate-800 space-y-4">
        <div>
          <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
            <Download className="w-5 h-5 text-indigo-400" />
            <span>Importar Nuevo Archivo de DIVIPOLE / Censo Oficial</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Suba archivos CSV o XLSX. El sistema normalizará encabezados, validará totales e insertará de manera idempotente.
          </p>
        </div>

        {successMsg && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold flex items-center gap-2">
            <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleUploadSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="space-y-2">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Elección Asignada</label>
            <select
              value={eleccion}
              onChange={(e) => setEleccion(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none"
            >
              <option value="Presidencia 2026">Presidencia 2026</option>
              <option value="Congreso 2026">Congreso 2026</option>
              <option value="Elecciones Territoriales 2027">Elecciones Territoriales 2027</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Fuente de Información</label>
            <input
              type="text"
              value={fuente}
              onChange={(e) => setFuente(e.target.value)}
              placeholder="Ej. DIVIPOLE Registraduría"
              className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none placeholder-slate-600"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Fecha de la Fuente</label>
            <input
              type="date"
              value={fechaFuente}
              onChange={(e) => setFechaFuente(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Archivo (CSV / XLSX)</label>
            <input
              id="electoral-file-input"
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileChange}
              className="w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-slate-900 file:text-indigo-400 hover:file:bg-slate-800 file:cursor-pointer"
            />
          </div>

          <div className="md:col-span-4 flex justify-end">
            <button
              type="submit"
              disabled={uploading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-xs shadow-md border border-indigo-400/20 disabled:opacity-50 cursor-pointer"
            >
              {uploading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>Procesando e Importando...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 text-white" />
                  <span>Comenzar Importación</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* History Audit Logs */}
      <div className="p-6 rounded-2xl bg-[#0F172A] border border-slate-800 space-y-4">
        <div>
          <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-400" />
            <span>Historial de Auditoría de Carga / Versiones del Censo</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Lista de importaciones históricas procesadas. Solo puede haber una versión activa por elección.
          </p>
        </div>

        {loading ? (
          <div className="py-12 flex justify-center items-center">
            <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto border border-slate-800/80 rounded-xl">
            <table className="w-full text-xs text-slate-300">
              <thead>
                <tr className="bg-slate-900 text-slate-400 font-extrabold uppercase text-[10px] border-b border-slate-800/80">
                  <th className="px-4 py-3 text-left">Elección</th>
                  <th className="px-4 py-3 text-left">Archivo / Fuente</th>
                  <th className="px-4 py-3 text-center">Fecha Importación</th>
                  <th className="px-4 py-3 text-center">Registros (C/A/E)</th>
                  <th className="px-4 py-3 text-center">Estado</th>
                  <th className="px-4 py-3 text-center">Versión Activa</th>
                  <th className="px-4 py-3 text-center w-28">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40 font-mono">
                {imports.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-slate-500 font-sans">
                      No se registran importaciones de DIVIPOLE en el sistema.
                    </td>
                  </tr>
                ) : (
                  imports.map((imp) => (
                    <tr key={imp.id} className="hover:bg-slate-800/20 transition-colors">
                      <td className="px-4 py-3 font-bold text-white font-sans">{imp.eleccion}</td>
                      <td className="px-4 py-3 text-left font-sans">
                        <span className="block font-bold text-slate-200">{imp.nombre_archivo}</span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">{imp.fuente} (Vigencia: {imp.fecha_fuente})</span>
                      </td>
                      <td className="px-4 py-3 text-center text-[10px]">{new Date(imp.fecha_importacion).toLocaleString()}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-emerald-400 font-bold">+{imp.registros_creados}</span>
                        <span className="text-slate-400"> / ~{imp.registros_actualizados}</span>
                        {imp.registros_error > 0 && (
                          <span className="text-rose-500 font-bold block text-[10px]">({imp.registros_error} errores)</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {imp.estado === 'COMPLETADO' && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-950/60 text-emerald-400 border border-emerald-800/50">COMPLETADO</span>
                        )}
                        {imp.estado === 'COMPLETADO_CON_ADVERTENCIAS' && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-950/60 text-amber-400 border border-amber-800/50 font-sans">CON ADVERTENCIAS</span>
                        )}
                        {imp.estado === 'PROCESANDO' && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-blue-950/60 text-blue-400 border border-blue-800/50 animate-pulse">PROCESANDO</span>
                        )}
                        {imp.estado === 'ERROR' && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-rose-950/60 text-rose-400 border border-rose-800/50">ERROR</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center text-xs font-sans">
                        {imp.activa ? (
                          <span className="text-cyan-400 font-extrabold flex items-center justify-center gap-1">
                            <CheckCircle className="w-3.5 h-3.5 text-cyan-400" />
                            Activa
                          </span>
                        ) : (
                          <span className="text-slate-500">Inactiva</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center font-sans">
                        {!imp.activa && imp.estado.startsWith('COMPLETADO') && (
                          <button
                            type="button"
                            onClick={() => handleActivate(imp.id)}
                            className="px-2.5 py-1 text-[10px] font-extrabold bg-slate-800 hover:bg-slate-700 text-indigo-400 rounded-lg transition-colors cursor-pointer border border-slate-700 hover:border-indigo-500/30"
                          >
                            Activar
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};

