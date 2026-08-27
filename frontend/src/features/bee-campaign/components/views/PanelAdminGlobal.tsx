import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, 
  Key, 
  Users, 
  UserCheck,
  Layers, 
  FileText, 
  Activity, 
  Settings, 
  Plus, 
  Search, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  TrendingUp, 
  Download, 
  Trash2, 
  Edit3, 
  UserPlus,
  ArrowRight,
  Menu,
  ChevronRight,
  X,
  PieChart,
  Lock,
  LogOut,
  Server,
  Database,
  ShieldCheck,
  ToggleLeft,
  ToggleRight,
  Mail,
  ShieldAlert
} from 'lucide-react';
import { AuthUser, ViewMode } from '../../types';

interface PanelAdminGlobalProps {
  onSelectView: (view: ViewMode) => void;
  authUser: AuthUser | null;
  setAuthUser: (user: AuthUser | null) => void;
}

type GlobalMenuTab = 
  | 'dashboard' 
  | 'usuarios' 
  | 'roles' 
  | 'campanas' 
  | 'modulos' 
  | 'apis' 
  | 'auditoria' 
  | 'seguridad' 
  | 'configuracion'
  | 'sistema';

export const PanelAdminGlobal: React.FC<PanelAdminGlobalProps> = ({ onSelectView, authUser, setAuthUser }) => {
  const [activeTab, setActiveTab] = useState<GlobalMenuTab>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Authentication states
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);

  // Data States
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [apis, setApis] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [securityData, setSecurityData] = useState<any>(null);
  const [systemStatus, setSystemStatus] = useState<any>(null);
  const [modules, setModules] = useState<any[]>([]);
  const [configData, setConfigData] = useState<any>(null);

  // Modals & Forms States
  const [userFormOpen, setUserFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userCedula, setUserCedula] = useState('');
  const [userRole, setUserRole] = useState('Usuario');
  const [userStatus, setUserStatus] = useState('Activo');

  // Search Filter
  const [searchTerm, setSearchTerm] = useState('');

  // Local token management
  const getToken = () => localStorage.getItem('global_admin_token');

  // New Editing Modals
  const [editingRole, setEditingRole] = useState<any>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [editingCampaign, setEditingCampaign] = useState<any>(null);
  const [campName, setCampName] = useState('');
  const [campStatus, setCampStatus] = useState('Activo');
  const [campAdmin, setCampAdmin] = useState('');
  const [editingApi, setEditingApi] = useState<any>(null);
  const [apiToken, setApiToken] = useState('');
  const [apiLimit, setApiLimit] = useState(0);
  const [apiStatus, setApiStatus] = useState('online');
  const [ipFormOpen, setIpFormOpen] = useState(false);
  const [ipInput, setIpInput] = useState('');
  const [ipReason, setIpReason] = useState('');

  // Fetch Panel Data
  const fetchPanelData = async () => {
    const token = getToken();
    if (!token || !authUser || authUser.role !== 'GLOBAL_ADMIN') {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const headers = { 'Authorization': `Bearer ${token}` };

      // Parallel data fetching
      const [
        dashRes,
        usersRes,
        rolesRes,
        campRes,
        apisRes,
        logsRes,
        secRes,
        sysRes,
        modRes,
        configRes
      ] = await Promise.all([
        fetch('/api/global-admin/dashboard', { headers }).then(r => r.json()),
        fetch('/api/global-admin/users', { headers }).then(r => r.json()),
        fetch('/api/global-admin/roles', { headers }).then(r => r.json()),
        fetch('/api/global-admin/campaigns', { headers }).then(r => r.json()),
        fetch('/api/global-admin/apis', { headers }).then(r => r.json()),
        fetch('/api/global-admin/audit-logs', { headers }).then(r => r.json()),
        fetch('/api/global-admin/security', { headers }).then(r => r.json()),
        fetch('/api/global-admin/system', { headers }).then(r => r.json()),
        fetch('/api/global-admin/modules', { headers }).then(r => r.json()),
        fetch('/api/global-admin/configuracion', { headers }).then(r => r.json())
      ]);

      setDashboardData(dashRes.data);
      setUsers(usersRes.data || []);
      setRoles(rolesRes.data || []);
      setCampaigns(campRes.data || []);
      setApis(apisRes.data || []);
      setAuditLogs(logsRes.data || []);
      setSecurityData(secRes.data);
      setSystemStatus(sysRes.data);
      setModules(modRes.data || []);
      setConfigData(configRes.data || null);
    } catch (e) {
      console.error('Error fetching administrative datasets:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRolePermissions = async () => {
    if (!editingRole) return;
    const token = getToken();
    try {
      const response = await fetch(`/api/global-admin/roles/${editingRole.id}/permissions`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ permissions: selectedPermissions })
      });
      if (response.ok) {
        setEditingRole(null);
        fetchPanelData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveCampaign = async () => {
    if (!editingCampaign) return;
    const token = getToken();
    try {
      const response = await fetch(`/api/global-admin/campaigns/${editingCampaign.id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: campName, status: campStatus, adminName: campAdmin })
      });
      if (response.ok) {
        setEditingCampaign(null);
        fetchPanelData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveApi = async () => {
    if (!editingApi) return;
    const token = getToken();
    try {
      const response = await fetch(`/api/global-admin/apis/${editingApi.name}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token: apiToken, limit: apiLimit, status: apiStatus })
      });
      if (response.ok) {
        setEditingApi(null);
        fetchPanelData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleModule = async (id: string, currentStatus: string) => {
    const token = getToken();
    const newStatus = currentStatus === 'Activo' ? 'Inactivo' : 'Activo';
    try {
      const response = await fetch(`/api/global-admin/modules/${id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (response.ok) {
        fetchPanelData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveSecuritySettings = async (updates: any) => {
    const token = getToken();
    try {
      const response = await fetch('/api/global-admin/security/settings', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });
      if (response.ok) {
        fetchPanelData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleBlockIp = async () => {
    const token = getToken();
    try {
      const response = await fetch('/api/global-admin/security/block-ip', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ip: ipInput, reason: ipReason })
      });
      if (response.ok) {
        setIpFormOpen(false);
        setIpInput('');
        setIpReason('');
        fetchPanelData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUnblockIp = async (ip: string) => {
    const token = getToken();
    try {
      const response = await fetch('/api/global-admin/security/unblock-ip', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ip })
      });
      if (response.ok) {
        fetchPanelData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveConfig = async (updates: any) => {
    const token = getToken();
    try {
      const response = await fetch('/api/global-admin/configuracion', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });
      if (response.ok) {
        fetchPanelData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchPanelData();
  }, [authUser]);

  // Auth Handler
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setAuthError(null);

    try {
      const response = await fetch('/api/global-admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailInput, password: passwordInput })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Credenciales incorrectas o sesión inválida.');
      }

      const resData = await response.json();
      const data = resData.data;
      localStorage.setItem('global_admin_token', data.access_token);
      localStorage.setItem('bee_auth_user', JSON.stringify(data.user));
      setAuthUser(data.user);
    } catch (err: any) {
      setAuthError(err.message || 'Tu sesión ha expirado o las credenciales no son válidas.');
    } finally {
      setLoginLoading(false);
    }
  };

  // Safe Logout
  const handleLogout = () => {
    localStorage.removeItem('global_admin_token');
    localStorage.removeItem('bee_auth_user');
    localStorage.removeItem('bee_current_view');
    setAuthUser(null);
    if (window.history.pushState) {
      window.history.pushState('', document.title, '/');
    } else {
      window.location.hash = '';
    }
    onSelectView('landing');
  };

  // User Actions
  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getToken();
    if (!token) return;

    try {
      const headers = { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      let res;
      if (editingUser) {
        // Update user
        res = await fetch(`/api/global-admin/users/${editingUser.id}`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify({ name: userName, email: userEmail, cedula: userCedula, role: userRole, status: userStatus })
        });
      } else {
        // Create user
        res = await fetch('/api/global-admin/users', {
          method: 'POST',
          headers,
          body: JSON.stringify({ name: userName, email: userEmail, cedula: userCedula, role: userRole, status: userStatus })
        });
      }

      if (res.ok) {
        setUserFormOpen(false);
        setEditingUser(null);
        fetchPanelData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleEditUserClick = (u: any) => {
    setEditingUser(u);
    setUserName(u.name);
    setUserEmail(u.email);
    setUserCedula(u.cedula || '');
    setUserRole(u.role);
    setUserStatus(u.status);
    setUserFormOpen(true);
  };

  const handleCreateUserClick = () => {
    setEditingUser(null);
    setUserName('');
    setUserEmail('');
    setUserCedula('');
    setUserRole('Usuario');
    setUserStatus('Activo');
    setUserFormOpen(true);
  };

  // Check Authorization
  const hasGlobalAccess = authUser && authUser.role === 'GLOBAL_ADMIN';

  // --- RENDER LOGIN IF NOT AUTHORIZED ---
  if (!hasGlobalAccess) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4 selection:bg-cyan-500 selection:text-black font-sans relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-cyan-500/5 rounded-full blur-[130px] pointer-events-none animate-pulse" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-indigo-600/5 rounded-full blur-[90px] pointer-events-none" />
        
        {/* Technical grid backdrop overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-35 pointer-events-none" />

        <div className="relative w-full max-w-lg bg-[#0a1120]/90 backdrop-blur-xl p-8 sm:p-10 rounded-3xl border border-cyan-500/20 shadow-[0_0_50px_-12px_rgba(6,182,212,0.15)] space-y-6">
          
          {/* Header & Lock Shield */}
          <div className="text-center space-y-3">
            <div className="mx-auto w-16 h-16 bg-gradient-to-tr from-cyan-500/20 to-cyan-500/5 text-cyan-400 border border-cyan-500/30 rounded-full flex items-center justify-center relative shadow-[0_0_20px_rgba(6,182,212,0.15)] mb-3">
              <span className="absolute inset-0 rounded-full bg-cyan-400/20 animate-ping opacity-60 pointer-events-none" />
              <ShieldAlert className="w-6 h-6 relative z-10" />
            </div>
            <div>
              <span className="text-[10px] text-cyan-400 tracking-widest font-black uppercase block mb-1">Sistema de Control Central</span>
              <h2 className="font-extrabold text-2xl tracking-tight text-white uppercase">Panel de Control Global</h2>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
              Acceso restringido únicamente para personal certificado de nivel superior. Todas las operaciones son registradas inmutablemente.
            </p>
          </div>

          {/* Active Session Warning */}
          {authUser && (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold flex items-start gap-2 animate-shake">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span>Tu perfil actual ({authUser.name}) no tiene autorización. Cierra tu sesión actual para ingresar con una credencial válida.</span>
                <button 
                  onClick={() => {
                    localStorage.removeItem('bee_auth_user');
                    setAuthUser(null);
                  }}
                  className="block mt-2 font-bold underline text-cyan-400 hover:text-white"
                >
                  Cerrar Sesión Activa
                </button>
              </div>
            </div>
          )}

          {/* Login Error Notification */}
          {authError && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-semibold flex items-start gap-2.5 animate-shake">
              <XCircle className="w-4.5 h-4.5 text-rose-400 shrink-0 mt-0.5" />
              <span>{authError}</span>
            </div>
          )}

          {/* Login Form */}
          {!authUser && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Correo Electrónico</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    required
                    autoComplete="off"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="ejemplo@partido.org"
                    className="w-full bg-[#111C30]/50 border border-white/10 focus:border-cyan-500/40 rounded-xl pl-10 pr-4 py-3 text-xs text-white focus:outline-none transition-all font-mono font-bold tracking-wide"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Contraseña Administrativa</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="password"
                    required
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-[#111C30]/50 border border-white/10 focus:border-cyan-500/40 rounded-xl pl-10 pr-4 py-3 text-xs text-white focus:outline-none transition-all font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full mt-3 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-slate-900 font-black text-xs uppercase tracking-widest transition-all cursor-pointer shadow-lg shadow-cyan-950/20 active:scale-[0.98]"
              >
                {loginLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Iniciar Sesión Administrativa</span>}
              </button>
            </form>
          )}

          {/* Safety disclaimer & System status badges */}
          <div className="pt-4 border-t border-white/5 space-y-4">
            <div className="flex flex-wrap items-center justify-center gap-3">
              <span className="px-2 py-0.5 rounded bg-slate-900 border border-white/5 text-[9px] font-mono text-cyan-400">TLS 1.3 / AES-256</span>
              <span className="px-2 py-0.5 rounded bg-slate-900 border border-white/5 text-[9px] font-mono text-cyan-400">IP Auditada</span>
              <span className="px-2 py-0.5 rounded bg-slate-900 border border-white/5 text-[9px] font-mono text-cyan-400">Firmado Digitalmente</span>
            </div>
            
            <p className="text-[9px] text-slate-500 text-center leading-relaxed font-medium">
              <span className="text-rose-500/70 font-bold uppercase mr-1">Aviso legal:</span>
              El uso no autorizado de este sistema constituye un delito informático bajo el Art. 269 de la Ley penal. Se registrará la firma del navegador, marca de tiempo e IP.
            </p>
          </div>

          <div className="text-center pt-2">
            <button
              onClick={() => {
                if (window.history.pushState) {
                  window.history.pushState('', document.title, '/');
                } else {
                  window.location.hash = '';
                }
                onSelectView('landing');
              }}
              className="text-xs text-slate-500 hover:text-slate-300 font-semibold transition-colors"
            >
              Volver al Portal Público
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Define Menu Items
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <PieChart className="w-4 h-4" /> },
    { id: 'usuarios', label: 'Usuarios', icon: <Users className="w-4 h-4" /> },
    { id: 'roles', label: 'Roles y Permisos', icon: <UserCheck className="w-4 h-4" /> },
    { id: 'campanas', label: 'Campañas', icon: <Building2 className="w-4 h-4" /> },
    { id: 'modulos', label: 'Módulos', icon: <Layers className="w-4 h-4" /> },
    { id: 'apis', label: 'APIs', icon: <Key className="w-4 h-4" /> },
    { id: 'auditoria', label: 'Auditoría', icon: <FileText className="w-4 h-4" /> },
    { id: 'seguridad', label: 'Seguridad', icon: <ShieldCheck className="w-4 h-4" /> },
    { id: 'configuracion', label: 'Configuración Global', icon: <Settings className="w-4 h-4" /> },
    { id: 'sistema', label: 'Sistema', icon: <Activity className="w-4 h-4" /> },
  ];

  return (
    <div className="h-screen max-h-screen overflow-hidden flex flex-col bg-[#020617] text-slate-100 selection:bg-cyan-500 selection:text-black font-sans relative">
      {/* Mobile Top Bar */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-[#111C30] border-b border-cyan-500/15 sticky top-0 z-30 w-full shrink-0">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 rounded-xl bg-slate-900 border border-cyan-500/20 text-cyan-300 hover:text-white cursor-pointer min-h-[38px] min-w-[38px]"
          >
            <Menu className="w-4 h-4" />
          </button>
          <span className="text-xs font-black text-cyan-400 uppercase tracking-widest">
            Centro Global de Control
          </span>
        </div>
        <button
          onClick={handleLogout}
          className="p-2 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 hover:text-white cursor-pointer text-xs"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Sidebar Menu */}
        <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#111C30] border-r border-cyan-500/15 flex flex-col justify-between transition-transform duration-300 lg:relative lg:translate-x-0 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}>
          <div className="p-5 flex-1 flex flex-col overflow-y-auto max-h-[calc(100vh-80px)] space-y-6">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-slate-900 font-extrabold text-sm border border-cyan-400/25">
                  CG
                </div>
                <div>
                  <h3 className="font-extrabold text-xs text-white uppercase tracking-wider">Electoral 360</h3>
                  <p className="text-[9px] text-cyan-400 font-bold uppercase mt-0.5">Admin Global</p>
                </div>
              </div>
              <button className="lg:hidden p-1.5" onClick={() => setIsMobileMenuOpen(false)}>
                <X className="w-4 h-4 text-slate-400 hover:text-white" />
              </button>
            </div>

            <nav className="space-y-1">
              {menuItems.map(item => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id as GlobalMenuTab);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[11px] font-bold tracking-wide transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#006e62] text-white shadow-lg border border-emerald-400/20'
                        : 'text-slate-400 hover:text-white hover:bg-cyan-500/5'
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-4 border-t border-cyan-500/15">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 font-bold text-[11px] transition-all cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Cerrar Sesión Global</span>
            </button>
          </div>
        </aside>

        {/* Content Panel Area */}
        <main className="flex-1 overflow-y-auto bg-gradient-to-b from-[#020617] to-[#020617] relative custom-scrollbar p-6 space-y-6">
          {loading ? (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
              <RefreshCw className="w-8 h-8 animate-spin text-cyan-400" />
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Sincronizando base de datos...</p>
            </div>
          ) : (
            <>
              {/* HEADER BLOCK */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
                <div>
                  <span className="text-[10px] text-cyan-400 uppercase font-black tracking-widest">Panel Administrativo Central</span>
                  <h1 className="font-extrabold text-2xl text-white mt-1 capitalize">{activeTab}</h1>
                </div>
                <button
                  onClick={fetchPanelData}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-[10px] font-bold text-slate-300 hover:text-white rounded-lg border border-white/5 flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Sincronizar
                </button>
              </div>

              {/* TABS CONTENT PANELS */}
              
              {/* TAB 1: DASHBOARD */}
              {activeTab === 'dashboard' && dashboardData && (
                <div className="space-y-6">
                  {/* METRIC CARD STATS GRID */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-[#111C30] p-5 rounded-2xl border border-white/5 flex items-center gap-4">
                      <div className="w-10 h-10 bg-cyan-500/10 text-cyan-400 rounded-xl flex items-center justify-center shrink-0">
                        <Users className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Usuarios Totales</span>
                        <h4 className="font-black text-xl text-white mt-0.5">{dashboardData.summary.totalUsers}</h4>
                      </div>
                    </div>

                    <div className="bg-[#111C30] p-5 rounded-2xl border border-white/5 flex items-center gap-4">
                      <div className="w-10 h-10 bg-emerald-500/10 text-emerald-400 rounded-xl flex items-center justify-center shrink-0">
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Campañas Activas</span>
                        <h4 className="font-black text-xl text-white mt-0.5">{dashboardData.summary.campaignsCount}</h4>
                      </div>
                    </div>

                    <div className="bg-[#111C30] p-5 rounded-2xl border border-white/5 flex items-center gap-4">
                      <div className="w-10 h-10 bg-indigo-500/10 text-indigo-400 rounded-xl flex items-center justify-center shrink-0">
                        <Key className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Consumo de APIs</span>
                        <h4 className="font-black text-xl text-white mt-0.5">{dashboardData.summary.apiConsumptions} reqs</h4>
                      </div>
                    </div>

                    <div className="bg-[#111C30] p-5 rounded-2xl border border-white/5 flex items-center gap-4">
                      <div className="w-10 h-10 bg-rose-500/10 text-rose-400 rounded-xl flex items-center justify-center shrink-0">
                        <AlertTriangle className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Alertas Seguridad</span>
                        <h4 className="font-black text-xl text-white mt-0.5">{dashboardData.summary.securityAlertsCount}</h4>
                      </div>
                    </div>
                  </div>

                  {/* VISUAL CHARTS METRICS GRID */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* API Consumption Stats */}
                    <div className="bg-[#111C30] p-5 rounded-2xl border border-white/5 space-y-4">
                      <h3 className="font-extrabold text-sm text-slate-200">Consumo de API por Integración</h3>
                      <div className="space-y-3">
                        {dashboardData.metrics.apiConsumption.map((api: any) => {
                          const pct = Math.min(100, (api.count / 1000) * 100);
                          return (
                            <div key={api.name} className="space-y-1">
                              <div className="flex justify-between text-xs">
                                <span className="font-semibold text-slate-300">{api.name}</span>
                                <span className="font-bold text-cyan-400">{api.count} reqs</span>
                              </div>
                              <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden">
                                <div className="h-full bg-cyan-500 transition-all duration-500" style={{ width: `${pct}%` }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Users by Module Stats */}
                    <div className="bg-[#111C30] p-5 rounded-2xl border border-white/5 space-y-4">
                      <h3 className="font-extrabold text-sm text-slate-200">Usuarios por Módulo Activo</h3>
                      <div className="space-y-3">
                        {dashboardData.metrics.usersByModule.map((mod: any) => {
                          return (
                            <div key={mod.name} className="flex justify-between items-center p-3.5 bg-slate-900/50 rounded-xl border border-white/5">
                              <span className="text-xs font-bold text-slate-300">{mod.name}</span>
                              <span className="px-3 py-1 bg-cyan-500/10 text-cyan-400 rounded-lg text-xs font-black">{mod.value}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* SECURITY WARNINGS/EVENTS */}
                  <div className="bg-[#111C30] p-5 rounded-2xl border border-white/5 space-y-3">
                    <h3 className="font-extrabold text-sm text-slate-200 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-rose-400" />
                      Alertas de Seguridad y Auditoría Crítica
                    </h3>
                    <div className="space-y-2">
                      <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 flex justify-between items-center text-xs">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-rose-400 shrink-0" />
                          <span className="text-slate-300 font-semibold">Intento de acceso denegado a `/global-admin` desde IP 190.14.82.105</span>
                        </div>
                        <span className="text-rose-400 font-bold uppercase text-[10px]">Rechazado</span>
                      </div>
                      <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex justify-between items-center text-xs">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                          <span className="text-slate-300 font-semibold">Exportación de censo electoral de votantes activada por USR-1001</span>
                        </div>
                        <span className="text-amber-400 font-bold uppercase text-[10px]">Aviso</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: USUARIOS */}
              {activeTab === 'usuarios' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-sm">
                      <Search className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Buscar usuarios..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-[#111C30] border border-white/5 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                    <button
                      onClick={handleCreateUserClick}
                      className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-slate-900 font-extrabold text-xs rounded-xl flex items-center gap-2 cursor-pointer"
                    >
                      <UserPlus className="w-4 h-4" />
                      Crear Nuevo Usuario
                    </button>
                  </div>

                  {/* USERS TABLE */}
                  <div className="bg-[#111C30] rounded-2xl border border-white/5 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-950/60 border-b border-white/5 text-slate-400 font-black uppercase text-[10px] tracking-wider">
                            <th className="p-4">Usuario / Correo</th>
                            <th className="p-4">Identificación</th>
                            <th className="p-4">Rol</th>
                            <th className="p-4">Nivel de Acceso</th>
                            <th className="p-4">Estado</th>
                            <th className="p-4 text-center">Acciones</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {users
                            .filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase()))
                            .map((u: any) => (
                              <tr key={u.id} className="hover:bg-slate-900/30">
                                <td className="p-4">
                                  <span className="font-extrabold text-white block">{u.name}</span>
                                  <span className="text-[10px] text-slate-400 font-mono mt-0.5">{u.email}</span>
                                </td>
                                <td className="p-4 text-slate-300 font-mono">{u.cedula || 'N/A'}</td>
                                <td className="p-4">
                                  <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-semibold">{u.role}</span>
                                </td>
                                <td className="p-4 text-slate-300 font-semibold">{u.accessLevel}</td>
                                <td className="p-4">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                                    u.status === 'Activo' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                  }`}>
                                    {u.status}
                                  </span>
                                </td>
                                <td className="p-4 text-center">
                                  <button onClick={() => handleEditUserClick(u)} className="p-1.5 bg-slate-900 hover:bg-slate-800 text-cyan-300 rounded border border-white/5 cursor-pointer inline-flex items-center justify-center">
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          {users.length === 0 && (
                            <tr>
                              <td colSpan={6} className="p-8 text-center text-slate-500">No hay usuarios registrados</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: ROLES Y PERMISOS */}
              {activeTab === 'roles' && (
                <div className="space-y-4">
                  <div className="bg-[#111C30] p-5 rounded-2xl border border-white/5 space-y-4">
                    <h3 className="font-extrabold text-sm text-slate-200">Políticas de Roles y Control de Acceso (RBAC)</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      El control de accesos se valida en cada endpoint de API del backend. El rol `SUPER_ADMIN` o `GLOBAL_ADMIN` anula las restricciones normales y posee privilegios completos.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {roles.map((r: any) => (
                      <div key={r.id} className="bg-[#111C30] p-5 rounded-2xl border border-white/5 space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-black text-sm text-white">{r.name}</h4>
                            <p className="text-xs text-slate-400 mt-0.5">{r.description}</p>
                          </div>
                          <span className="px-2.5 py-0.5 bg-cyan-500/10 text-cyan-400 rounded border border-cyan-500/20 text-[10px] font-mono">
                            {r.id}
                          </span>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-white/5">
                          <div className="flex flex-wrap gap-2">
                            {r.permissions.map((perm: string) => (
                              <span key={perm} className="px-2 py-0.5 rounded bg-slate-900 border border-white/5 text-[9px] font-bold text-cyan-300 uppercase tracking-wide">
                                {perm}
                              </span>
                            ))}
                          </div>
                          <button
                            onClick={() => {
                              setEditingRole(r);
                              setSelectedPermissions(r.permissions);
                            }}
                            className="px-3 py-1 bg-slate-950 hover:bg-slate-900 border border-white/5 text-[10px] font-bold text-cyan-400 rounded-lg flex items-center gap-1 cursor-pointer"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>Editar Permisos</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: CAMPAÑAS */}
              {activeTab === 'campanas' && (
                <div className="space-y-4">
                  <div className="bg-[#111C30] rounded-2xl border border-white/5 overflow-hidden">
                    <div className="p-4 bg-slate-950/60 border-b border-white/5 font-black text-xs uppercase tracking-wider text-slate-300">
                      Campañas Electorales Registradas
                    </div>
                    <div className="divide-y divide-white/5 text-xs">
                      {campaigns.map((c: any) => (
                        <div key={c.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="space-y-1">
                            <h4 className="font-extrabold text-sm text-white">{c.name}</h4>
                            <div className="flex gap-4 text-slate-400 text-[11px]">
                              <span>Admin: <strong className="text-slate-300 font-bold">{c.adminName}</strong></span>
                              <span>Miembros: <strong className="text-slate-300 font-bold">{c.usersCount}</strong></span>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <span className="text-[10px] text-slate-400 block">Creado: {c.createdAt}</span>
                              <span className="text-[10px] text-cyan-300 block mt-0.5">Última act: {c.lastActivity}</span>
                            </div>
                            <span className={`px-3 py-1 border rounded-lg text-[10px] font-black uppercase ${
                              c.status === 'Activo' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                            }`}>
                              {c.status}
                            </span>
                            <button
                              onClick={() => {
                                setEditingCampaign(c);
                                setCampName(c.name);
                                setCampStatus(c.status);
                                setCampAdmin(c.adminName);
                              }}
                              className="p-1.5 bg-slate-950 hover:bg-slate-900 text-cyan-300 border border-white/5 rounded-lg cursor-pointer inline-flex items-center justify-center"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: MÓDULOS */}
              {activeTab === 'modulos' && (
                <div className="space-y-4">
                  <div className="bg-[#111C30] p-5 rounded-2xl border border-white/5 space-y-4">
                    <h3 className="font-extrabold text-sm text-slate-200">Activación de Módulos del Sistema</h3>
                    <p className="text-xs text-slate-400">
                      Habilite o deshabilite módulos completos de la plataforma electoral. Al desactivar un módulo principal, los usuarios con roles normales ya no verán el enlace o la tarjeta en su pantalla inicial.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {modules.map((m: any) => (
                      <div key={m.id} className="bg-[#111C30] p-5 rounded-2xl border border-white/5 space-y-4 flex flex-col justify-between">
                        <div className="space-y-2">
                          <div className="w-10 h-10 bg-cyan-500/10 text-cyan-400 rounded-xl flex items-center justify-center">
                            {m.id === 'modulo_admin' && <Users className="w-5 h-5" />}
                            {m.id === 'gestion_estrategica' && <TrendingUp className="w-5 h-5" />}
                            {m.id === 'gestion_territorial' && <Building2 className="w-5 h-5" />}
                          </div>
                          <h4 className="font-extrabold text-sm text-white">{m.name}</h4>
                          <p className="text-xs text-slate-400 leading-relaxed">
                            {m.description}
                          </p>
                        </div>
                        <button
                          onClick={() => !m.mandatory && handleToggleModule(m.id, m.status)}
                          disabled={m.mandatory}
                          className="flex items-center gap-2 pt-2 border-t border-white/5 justify-between w-full text-left cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <span className={`text-[10px] font-black uppercase tracking-widest ${
                            m.status === 'Activo' ? 'text-emerald-400' : 'text-slate-400'
                          }`}>
                            {m.status} {m.mandatory && '(Mandatorio)'}
                          </span>
                          {m.status === 'Activo' ? (
                            <ToggleRight className="w-6 h-6 text-emerald-400" />
                          ) : (
                            <ToggleLeft className="w-6 h-6 text-slate-500" />
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 6: APIS */}
              {activeTab === 'apis' && (
                <div className="space-y-4">
                  <div className="bg-[#111C30] rounded-2xl border border-white/5 overflow-hidden">
                    <div className="p-4 bg-slate-950/60 border-b border-white/5 font-black text-xs uppercase tracking-wider text-slate-300">
                      Conexión de APIs y Gateways Externos
                    </div>
                    <div className="divide-y divide-white/5 text-xs">
                      {apis.map((api: any) => (
                        <div key={api.name} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="space-y-1">
                            <h4 className="font-extrabold text-sm text-white">{api.name}</h4>
                            <div className="flex flex-wrap gap-4 text-slate-400 text-[11px]">
                              <span>Tipo: <strong className="text-slate-300">{api.type}</strong></span>
                              <span>Peticiones: <strong className="text-slate-300">{api.usage}</strong></span>
                              <span>Límite: <strong className="text-slate-300">{api.limit}</strong></span>
                              <span>Errores: <strong className="text-rose-400">{api.errors}</strong></span>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <span className="text-[10px] text-slate-500 font-mono block">Token: {api.maskKey}</span>
                              <span className="text-[10px] text-slate-400 block mt-0.5">Última act: {api.lastUsed}</span>
                            </div>
                            <span className={`px-3 py-1 border rounded-lg text-[10px] font-black uppercase ${
                              api.status === 'online' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                            }`}>
                              {api.status}
                            </span>
                            <button
                              onClick={() => {
                                setEditingApi(api);
                                setApiToken(api.token || '');
                                setApiLimit(api.limit);
                                setApiStatus(api.status);
                              }}
                              className="p-1.5 bg-slate-950 hover:bg-slate-900 text-cyan-300 border border-white/5 rounded-lg cursor-pointer inline-flex items-center justify-center"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 7: AUDITORÍA */}
              {activeTab === 'auditoria' && (
                <div className="space-y-4">
                  <div className="bg-[#111C30] rounded-2xl border border-white/5 overflow-hidden">
                    <div className="p-4 bg-slate-950/60 border-b border-white/5 font-black text-xs uppercase tracking-wider text-slate-300">
                      Registro de Auditoría Central Inmutable
                    </div>
                    <div className="divide-y divide-white/5 text-xs max-h-[600px] overflow-y-auto">
                      {auditLogs.map((log: any) => (
                        <div key={log.id} className="p-4 space-y-2 hover:bg-slate-900/30">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded bg-slate-950 text-cyan-300 font-mono text-[9px] border border-white/5">{log.id}</span>
                              <h4 className="font-extrabold text-white text-[12px]">{log.action}</h4>
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              {log.timestamp}
                            </div>
                          </div>
                          <p className="text-slate-300 text-[11px] font-sans leading-relaxed">{log.details}</p>
                          <div className="flex flex-wrap gap-x-4 text-[10px] text-slate-400 pt-1 font-mono">
                            <span>Usuario: <strong className="text-slate-300 font-bold">{log.user}</strong></span>
                            <span>IP: <strong className="text-slate-300">{log.ip}</strong></span>
                            <span>Agent: <strong className="text-slate-300">{log.userAgent}</strong></span>
                            <span>Estado: <strong className={log.result === 'Éxito' ? 'text-emerald-400' : 'text-rose-400'}>{log.result}</strong></span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 8: SEGURIDAD */}
              {activeTab === 'seguridad' && securityData && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-[#111C30] p-5 rounded-2xl border border-white/5 space-y-4">
                      <div className="flex justify-between items-center border-b border-white/5 pb-2">
                        <h3 className="font-extrabold text-sm text-slate-200">Bloqueo de IPs y Seguridad de Tráfico</h3>
                        <button
                          onClick={() => setIpFormOpen(true)}
                          className="px-2.5 py-1 bg-rose-950/60 hover:bg-rose-900 border border-rose-500/30 text-rose-300 text-[10px] font-black uppercase rounded-lg flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Bloquear IP</span>
                        </button>
                      </div>
                      <div className="divide-y divide-white/5 max-h-[300px] overflow-y-auto custom-scrollbar">
                        {securityData.blockedUsers.map((b: any) => (
                          <div key={b.ip} className="py-3 flex justify-between items-center text-xs">
                            <div>
                              <strong className="text-white block font-mono">{b.ip}</strong>
                              <span className="text-slate-400 mt-0.5">Motivo: {b.reason}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px] font-bold">
                                Bloqueado
                              </span>
                              <button
                                onClick={() => handleUnblockIp(b.ip)}
                                className="p-1 bg-slate-950 hover:bg-slate-900 text-rose-400 border border-white/5 rounded cursor-pointer inline-flex items-center justify-center"
                                title="Desbloquear IP"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-[#111C30] p-5 rounded-2xl border border-white/5 space-y-4">
                      <h3 className="font-extrabold text-sm text-slate-200 font-sans">Configuraciones Generales de Seguridad</h3>
                      <div className="space-y-4 text-xs">
                        <div className="flex justify-between items-center py-2 border-b border-white/5 gap-4">
                          <span className="text-slate-300">Complejidad de Contraseña</span>
                          <select
                            value={securityData.settings.passwordComplexity}
                            onChange={(e) => handleSaveSecuritySettings({ passwordComplexity: e.target.value })}
                            className="bg-[#111C30] border border-white/10 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-cyan-500 font-bold"
                          >
                            <option value="Alta">Alta</option>
                            <option value="Media">Media</option>
                            <option value="Baja">Baja</option>
                          </select>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-white/5 gap-4">
                          <span className="text-slate-300">Expiración de Sesión (Minutos)</span>
                          <input
                            type="number"
                            value={securityData.settings.sessionTimeoutMinutes}
                            onChange={(e) => handleSaveSecuritySettings({ sessionTimeoutMinutes: Number(e.target.value) })}
                            className="w-20 bg-[#111C30] border border-white/10 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-cyan-500 font-bold text-center"
                          />
                        </div>
                        <div className="flex justify-between items-center py-2 gap-4">
                          <span className="text-slate-300">Autenticación Multifactor obligatoria</span>
                          <button
                            onClick={() => handleSaveSecuritySettings({ mfaRequired: !securityData.settings.mfaRequired })}
                            className="cursor-pointer"
                          >
                            {securityData.settings.mfaRequired ? (
                              <span className="px-2.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase">
                                Habilitado
                              </span>
                            ) : (
                              <span className="px-2.5 py-0.5 rounded bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] font-black uppercase">
                                Desactivado
                              </span>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 9: CONFIGURACIÓN GLOBAL */}
              {activeTab === 'configuracion' && configData && (
                <div className="space-y-4">
                  <div className="bg-[#111C30] p-5 rounded-2xl border border-white/5 space-y-6">
                    <h3 className="font-extrabold text-sm text-slate-200">Ajustes Generales del Servidor y Base de Datos</h3>
                    <div className="space-y-4 text-xs">
                      <div className="flex justify-between items-center py-2 border-b border-white/5 gap-4">
                        <span className="text-slate-300 font-semibold">Modo de Mantenimiento</span>
                        <button
                          onClick={() => handleSaveConfig({ maintenanceMode: !configData.maintenanceMode })}
                          className="cursor-pointer"
                        >
                          {configData.maintenanceMode ? (
                            <span className="px-2.5 py-0.5 rounded bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] font-black uppercase">
                              Activado
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded bg-slate-900 border border-white/5 text-slate-400 text-[10px] font-black uppercase">
                              Desactivado
                            </span>
                          )}
                        </button>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-white/5 gap-4">
                        <span className="text-slate-300 font-semibold">Tasa de Rate Limiting por IP (Peticiones / Min)</span>
                        <input
                          type="number"
                          value={configData.rateLimit}
                          onChange={(e) => handleSaveConfig({ rateLimit: Number(e.target.value) })}
                          className="w-24 bg-[#111C30] border border-white/10 rounded px-2.5 py-1 text-xs text-white focus:outline-none focus:border-cyan-500 font-bold font-mono text-center"
                        />
                      </div>
                      <div className="flex justify-between items-center py-2 gap-4">
                        <span className="text-slate-300 font-semibold">Verificación SHA-256 de base de datos</span>
                        <button
                          onClick={() => handleSaveConfig({ databaseVerification: !configData.databaseVerification })}
                          className="cursor-pointer"
                        >
                          {configData.databaseVerification ? (
                            <span className="px-2.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase">
                              Habilitado
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] font-black uppercase">
                              Deshabilitado
                            </span>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 10: SISTEMA */}
              {activeTab === 'sistema' && systemStatus && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-[#111C30] p-5 rounded-2xl border border-white/5 space-y-3">
                      <div className="w-10 h-10 bg-cyan-500/10 text-cyan-400 rounded-xl flex items-center justify-center">
                        <Server className="w-5 h-5" />
                      </div>
                      <h4 className="font-extrabold text-sm text-white">Backend Status</h4>
                      <div className="space-y-1.5 text-xs text-slate-300 font-mono">
                        <div className="flex justify-between">
                          <span>Estado:</span>
                          <span className="text-emerald-400 font-bold uppercase">Online</span>
                        </div>
                        <div className="flex justify-between">
                          <span>CPU:</span>
                          <span>{systemStatus.cpuLoad}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>RAM:</span>
                          <span>{systemStatus.memoryUsage}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#111C30] p-5 rounded-2xl border border-white/5 space-y-3">
                      <div className="w-10 h-10 bg-indigo-500/10 text-indigo-400 rounded-xl flex items-center justify-center">
                        <Database className="w-5 h-5" />
                      </div>
                      <h4 className="font-extrabold text-sm text-white">Base de Datos</h4>
                      <div className="space-y-1.5 text-xs text-slate-300 font-mono">
                        <div className="flex justify-between">
                          <span>Provider:</span>
                          <span>SQLite</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Uptime:</span>
                          <span>{systemStatus.uptime}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Versión:</span>
                          <span>{systemStatus.version}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#111C30] p-5 rounded-2xl border border-white/5 space-y-3">
                      <div className="w-10 h-10 bg-emerald-500/10 text-emerald-400 rounded-xl flex items-center justify-center">
                        <CheckCircle className="w-5 h-5" />
                      </div>
                      <h4 className="font-extrabold text-sm text-white">Integraciones</h4>
                      <div className="space-y-1.5 text-xs text-slate-300 font-mono">
                        <div className="flex justify-between">
                          <span>Registraduría:</span>
                          <span className="text-emerald-400 font-bold uppercase">Conectado</span>
                        </div>
                        <div className="flex justify-between">
                          <span>SMS Gateway:</span>
                          <span className="text-emerald-400 font-bold uppercase">Conectado</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Maps SDK:</span>
                          <span className="text-emerald-400 font-bold uppercase">Online</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* USER FORM MODAL */}
      <AnimatePresence>
        {userFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-[#0F172A] border border-cyan-500/20 p-6 rounded-3xl space-y-5"
            >
              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <h3 className="font-black text-sm text-white uppercase tracking-wider">
                  {editingUser ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
                </h3>
                <button onClick={() => setUserFormOpen(false)} className="p-1">
                  <X className="w-4 h-4 text-slate-400 hover:text-white" />
                </button>
              </div>

              <form onSubmit={handleSaveUser} className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-[9px] font-bold text-slate-400 uppercase">Nombre Completo</label>
                  <input
                    type="text"
                    required
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="Ej. Juan Pérez"
                    className="w-full bg-[#111C30] border border-white/5 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[9px] font-bold text-slate-400 uppercase">Correo Electrónico</label>
                  <input
                    type="email"
                    required
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    placeholder="correo@partido.org"
                    className="w-full bg-[#111C30] border border-white/5 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-bold font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[9px] font-bold text-slate-400 uppercase">Identificación / Cédula</label>
                  <input
                    type="text"
                    value={userCedula}
                    onChange={(e) => setUserCedula(e.target.value.replace(/\D/g, ''))}
                    placeholder="10293847"
                    className="w-full bg-[#111C30] border border-white/5 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-bold font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-[9px] font-bold text-slate-400 uppercase">Rol</label>
                    <select
                      value={userRole}
                      onChange={(e) => setUserRole(e.target.value)}
                      className="w-full bg-[#111C30] border border-white/5 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-bold"
                    >
                      <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                      <option value="ADMINISTRADOR">ADMINISTRADOR</option>
                      <option value="CANDIDATO">CANDIDATO</option>
                      <option value="COORDINADOR_TERRITORIAL">COORDINADOR_TERRITORIAL</option>
                      <option value="TESTIGO_ELECTORAL">TESTIGO_ELECTORAL</option>
                      <option value="Usuario">Usuario</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[9px] font-bold text-slate-400 uppercase">Estado</label>
                    <select
                      value={userStatus}
                      onChange={(e) => setUserStatus(e.target.value)}
                      className="w-full bg-[#111C30] border border-white/5 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-bold"
                    >
                      <option value="Activo">Activo</option>
                      <option value="Inactivo">Inactivo</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full mt-2 flex items-center justify-center gap-2 py-3 bg-cyan-600 hover:bg-cyan-500 text-slate-900 font-black text-xs uppercase rounded-xl transition-all cursor-pointer border border-cyan-400/20"
                >
                  <span>Guardar Cambios</span>
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EDIT ROLE PERMISSIONS MODAL */}
      <AnimatePresence>
        {editingRole && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-[#0F172A] border border-cyan-500/20 p-6 rounded-3xl space-y-5"
            >
              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <h3 className="font-black text-sm text-white uppercase tracking-wider">
                  Editar Permisos: {editingRole.name}
                </h3>
                <button onClick={() => setEditingRole(null)} className="p-1">
                  <X className="w-4 h-4 text-slate-400 hover:text-white" />
                </button>
              </div>

              <div className="space-y-4">
                <p className="text-xs text-slate-400">Seleccione los permisos permitidos para este rol en el sistema:</p>
                
                <div className="space-y-2 max-h-[250px] overflow-y-auto custom-scrollbar pr-1">
                  {[
                    'ALL', 'ADMIN_VIEW', 'CNE_WRITE', 'STRATEGIC_VIEW', 'TERRITORIAL_WRITE', 
                    'E14_SUBMIT', 'AUDIT_LOG_VIEW', 'API_KEY_MANAGE'
                  ].map((perm) => {
                    const isChecked = selectedPermissions.includes(perm);
                    return (
                      <label key={perm} className="flex items-center gap-3 p-3 bg-[#111C30] hover:bg-slate-900/50 rounded-xl cursor-pointer border border-white/5">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedPermissions([...selectedPermissions, perm]);
                            } else {
                              setSelectedPermissions(selectedPermissions.filter(p => p !== perm));
                            }
                          }}
                          className="accent-cyan-500 rounded border-white/10"
                        />
                        <span className="text-xs font-mono font-bold text-white tracking-wide">{perm}</span>
                      </label>
                    );
                  })}
                </div>

                <button
                  onClick={handleSaveRolePermissions}
                  className="w-full mt-2 flex items-center justify-center gap-2 py-3 bg-cyan-600 hover:bg-cyan-500 text-slate-900 font-black text-xs uppercase rounded-xl transition-all cursor-pointer border border-cyan-400/20"
                >
                  <span>Guardar Permisos</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EDIT CAMPAIGN MODAL */}
      <AnimatePresence>
        {editingCampaign && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-[#0F172A] border border-cyan-500/20 p-6 rounded-3xl space-y-5"
            >
              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <h3 className="font-black text-sm text-white uppercase tracking-wider">
                  Editar Campaña
                </h3>
                <button onClick={() => setEditingCampaign(null)} className="p-1">
                  <X className="w-4 h-4 text-slate-400 hover:text-white" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-[9px] font-bold text-slate-400 uppercase">Nombre de Campaña</label>
                  <input
                    type="text"
                    required
                    value={campName}
                    onChange={(e) => setCampName(e.target.value)}
                    className="w-full bg-[#111C30] border border-white/5 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[9px] font-bold text-slate-400 uppercase">Administrador (Correo)</label>
                  <input
                    type="email"
                    required
                    value={campAdmin}
                    onChange={(e) => setCampAdmin(e.target.value)}
                    className="w-full bg-[#111C30] border border-white/5 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-bold font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[9px] font-bold text-slate-400 uppercase">Estado</label>
                  <select
                    value={campStatus}
                    onChange={(e) => setCampStatus(e.target.value)}
                    className="w-full bg-[#111C30] border border-white/5 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-bold"
                  >
                    <option value="Activo">Activo</option>
                    <option value="Inactivo">Inactivo</option>
                  </select>
                </div>

                <button
                  onClick={handleSaveCampaign}
                  className="w-full mt-2 flex items-center justify-center gap-2 py-3 bg-cyan-600 hover:bg-cyan-500 text-slate-900 font-black text-xs uppercase rounded-xl transition-all cursor-pointer border border-cyan-400/20"
                >
                  <span>Guardar Campaña</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EDIT API MODAL */}
      <AnimatePresence>
        {editingApi && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-[#0F172A] border border-cyan-500/20 p-6 rounded-3xl space-y-5"
            >
              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <h3 className="font-black text-sm text-white uppercase tracking-wider">
                  Modificar API: {editingApi.name}
                </h3>
                <button onClick={() => setEditingApi(null)} className="p-1">
                  <X className="w-4 h-4 text-slate-400 hover:text-white" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-[9px] font-bold text-slate-400 uppercase">Token de Acceso / Key</label>
                  <input
                    type="text"
                    required
                    value={apiToken}
                    onChange={(e) => setApiToken(e.target.value)}
                    placeholder="Ingrese el token oficial..."
                    className="w-full bg-[#111C30] border border-white/5 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[9px] font-bold text-slate-400 uppercase">Límite Mensual de Peticiones</label>
                  <input
                    type="number"
                    required
                    value={apiLimit}
                    onChange={(e) => setApiLimit(Number(e.target.value))}
                    className="w-full bg-[#111C30] border border-white/5 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-bold font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[9px] font-bold text-slate-400 uppercase">Estado</label>
                  <select
                    value={apiStatus}
                    onChange={(e) => setApiStatus(e.target.value)}
                    className="w-full bg-[#111C30] border border-white/5 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-bold"
                  >
                    <option value="online">Online</option>
                    <option value="offline">Offline</option>
                  </select>
                </div>

                <button
                  onClick={handleSaveApi}
                  className="w-full mt-2 flex items-center justify-center gap-2 py-3 bg-cyan-600 hover:bg-cyan-500 text-slate-900 font-black text-xs uppercase rounded-xl transition-all cursor-pointer border border-cyan-400/20"
                >
                  <span>Guardar Ajustes de API</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* BLOCK IP MODAL */}
      <AnimatePresence>
        {ipFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-[#0F172A] border border-cyan-500/20 p-6 rounded-3xl space-y-5"
            >
              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <h3 className="font-black text-sm text-white uppercase tracking-wider">
                  Bloquear Dirección IP
                </h3>
                <button onClick={() => setIpFormOpen(false)} className="p-1">
                  <X className="w-4 h-4 text-slate-400 hover:text-white" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-[9px] font-bold text-slate-400 uppercase">Dirección IP</label>
                  <input
                    type="text"
                    required
                    value={ipInput}
                    onChange={(e) => setIpInput(e.target.value)}
                    placeholder="Ej. 192.168.1.100"
                    className="w-full bg-[#111C30] border border-white/5 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[9px] font-bold text-slate-400 uppercase">Motivo del Bloqueo</label>
                  <input
                    type="text"
                    required
                    value={ipReason}
                    onChange={(e) => setIpReason(e.target.value)}
                    placeholder="Ej. Intentos fallidos de login / Escaneo de puertos"
                    className="w-full bg-[#111C30] border border-white/5 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-semibold"
                  />
                </div>

                <button
                  onClick={handleBlockIp}
                  className="w-full mt-2 flex items-center justify-center gap-2 py-3 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs uppercase rounded-xl transition-all cursor-pointer border border-rose-400/20"
                >
                  <span>Confirmar Bloqueo</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
