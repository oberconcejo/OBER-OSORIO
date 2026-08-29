import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ViewMode, AuthUser } from '../types';
import { CampaignLogoBadge } from './common/CampaignLogoIcon';
import { isViewAllowed, isViewAllowedForModule } from '../utils/rolePermissions';
import { 
  Activity, 
  CreditCard, 
  ShieldAlert, 
  UserCheck, 
  Sliders, 
  Bot, 
  Users, 
  Settings,
  LogOut,
  Building2,
  Lock,
  PieChart,
  MapPin,
  Shield,
  Layers,
  Sparkles,
  User,
  FileText,
  MessageSquare,
  DollarSign,
  BookOpen,
  Share2,
  BarChart3,
  Calendar,
  X,
  ClipboardList,
  Vote,
  Search,
  Map as MapIcon,
  ChevronDown,
  Zap
} from 'lucide-react';

interface SidebarProps {
  currentView: ViewMode;
  onSelectView: (view: ViewMode) => void;
  adminTab?: string;
  onSelectAdminTab?: (tab: string) => void;
  strategicTab?: string;
  onSelectStrategicTab?: (tab: string) => void;
  territorialSubTab?: 'registro' | 'mapa';
  onSelectTerritorialSubTab?: (tab: 'registro' | 'mapa') => void;
  onOpenUserRolesModal?: () => void;
  isOpen?: boolean;
  onCloseMobile?: () => void;
  authUser?: AuthUser | null;
  onLogout?: () => void;
  activeModule?: 'admin' | 'estrategica' | 'territorial';
  onSelectActiveModule?: (mod: 'admin' | 'estrategica' | 'territorial') => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  adminTab = 'inicio',
  onSelectAdminTab,
  strategicTab = 'diagnostico',
  onSelectStrategicTab,
  territorialSubTab = 'registro',
  onSelectTerritorialSubTab,
  onOpenUserRolesModal,
  isOpen = true,
  onCloseMobile,
  authUser,
  onLogout,
  activeModule = 'admin',
  onSelectActiveModule
}) => {
  const userRole = authUser?.role || 'superadmin';

  const [perms, setPerms] = useState<{ id: string; name: string; enabled: boolean }[]>([]);

  useEffect(() => {
    const loadPerms = () => {
      if (!authUser) return;
      const usersListStr = localStorage.getItem('campaign_users_list');
      const permissionsStr = localStorage.getItem('campaign_user_permissions');
      if (usersListStr && permissionsStr) {
        try {
          const usersList = JSON.parse(usersListStr);
          const permissions = JSON.parse(permissionsStr);
          const foundUser = usersList.find((u: any) => u.email.toLowerCase() === authUser.email.toLowerCase());
          if (foundUser && permissions[foundUser.id]) {
            setPerms(permissions[foundUser.id]);
            return;
          }
        } catch (e) {
          console.error("Error parsing user permissions in sidebar:", e);
        }
      }
      setPerms([]);
    };

    loadPerms();

    const handleUpdate = () => {
      loadPerms();
    };

    window.addEventListener('permissions-updated', handleUpdate);
    window.addEventListener('storage', loadPerms);
    return () => {
      window.removeEventListener('permissions-updated', handleUpdate);
      window.removeEventListener('storage', loadPerms);
    };
  }, [authUser]);

  const hasPermission = (permId: string) => {
    if (userRole === 'superadmin' || userRole === 'candidato' || userRole === 'auditor') {
      return true;
    }
    if (perms.length === 0) return true;
    const match = perms.find(p => p.id === permId);
    return match ? match.enabled : false;
  };

  // Módulo Estratégico Sub-Items (Mapped to permission IDs)
  // Módulo Estratégico Sub-Items (Mapped exactly as requested)
  const strategicMenuItems = [
    { id: 'est_diag_360', label: '1. Diagnóstico 360° AI', tab: 'diagnostico', icon: <Activity className="w-4 h-4 text-emerald-400" /> },
    { id: 'est_diag_territorial', label: '2. Diagnóstico Territorial', tab: 'diagnostico_territorial', icon: <MapPin className="w-4 h-4 text-cyan-400" /> },
    { id: 'est_programa', label: '3. Programa de Gobierno', tab: 'programa_gobierno', icon: <BookOpen className="w-4 h-4 text-amber-400" /> },
    { id: 'est_perfil', label: '4. Perfil del Candidato', tab: 'perfil', icon: <UserCheck className="w-4 h-4 text-teal-400" /> },
    { id: 'est_carga_cv', label: '5. Carga & Análisis CV', tab: 'hoja_vida', icon: <FileText className="w-4 h-4 text-teal-400" /> },
    { id: 'est_dofa', label: '6. Matriz DOFA / SWOT AI', tab: 'dofa', icon: <PieChart className="w-4 h-4 text-emerald-400" /> },
    { id: 'est_narrativa', label: '7. Narrativa & Discurso', tab: 'discurso', icon: <MessageSquare className="w-4 h-4 text-cyan-400" /> },
    { id: 'est_comunicacion', label: '8. Comunicación & Redes', tab: 'comunicacion_redes', icon: <Share2 className="w-4 h-4 text-emerald-400" /> },
    { id: 'est_analisis_datos', label: '9. Análisis de Datos AI', tab: 'analisis_datos', icon: <BarChart3 className="w-4 h-4 text-cyan-400" /> },
    { id: 'est_agenda', label: '10. Agenda & Calendario', tab: 'agenda_electoral', icon: <Calendar className="w-4 h-4 text-amber-400" /> },
  ];

  // Administrative Section Sub-Items (Mapped exactly as requested)
  const adminMenuItems = [
    { id: 'admin_inicio', label: '1. Inicio', tab: 'inicio', icon: <Activity className="w-4 h-4 text-emerald-400" /> },
    { id: 'admin_roles', label: '2. Gestión de Roles', tab: 'roles', icon: <UserCheck className="w-4 h-4 text-cyan-400" /> },
    { id: 'admin_lideres', label: '3. Líderes / Votantes', tab: 'lideres_votantes', icon: <Users className="w-4 h-4 text-amber-400" /> },
    { id: 'admin_presupuesto', label: '4. Presupuesto / CNE', tab: 'presupuesto_cne', icon: <CreditCard className="w-4 h-4 text-teal-400" /> },
    { id: 'admin_campana', label: '5. Gestión de Campaña', tab: 'gestion_campana', icon: <Building2 className="w-4 h-4 text-emerald-400" /> },
    { id: 'admin_testigos', label: '6. Gestión de Testigos', tab: 'gestion_testigos', icon: <ShieldAlert className="w-4 h-4 text-rose-400" /> },
    { id: 'admin_jurados', label: '7. Jurados Electorales', tab: 'jurados_electorales', icon: <Sliders className="w-4 h-4 text-amber-400" /> },
    { id: 'admin_encuestas', label: '8. Encuestas y Sondeos', tab: 'encuestas_sondeos', icon: <PieChart className="w-4 h-4 text-cyan-400" /> },
    { id: 'admin_distribucion', label: '9. Distribución Electoral', tab: 'distribucion_electoral', icon: <Vote className="w-4 h-4 text-teal-400" /> },
    { id: 'admin_consulta_lugar', label: '10. Consulta Lugar de Votación', tab: 'consulta_lugar_votacion', icon: <Search className="w-4 h-4 text-cyan-400" /> },
  ];

  // Territorial Section Sub-Items (Mapped exactly as requested)
  const territorialMenuItems = [
    { id: 'terr_registro', label: '1. Registro de Votantes', tab: 'registro', icon: <Layers className="w-4 h-4 text-emerald-400" /> },
    { id: 'terr_mapa', label: '2. Gestión Territorial', tab: 'mapa', icon: <MapIcon className="w-4 h-4 text-cyan-400" /> },
    { id: 'terr_testigos', label: '3. Testigos en Campo', tab: 'gestion_testigos', icon: <ShieldAlert className="w-4 h-4 text-rose-400" /> },
    { id: 'terr_encuestas', label: '4. Módulo de Encuestas', tab: 'encuestas_sondeos', icon: <PieChart className="w-4 h-4 text-cyan-400" /> },
    { id: 'terr_jurados', label: '5. Jurados en Mesa', tab: 'jurados_electorales', icon: <Sliders className="w-4 h-4 text-amber-400" /> },
  ];

  const isItemActive = (itemTab: string) => {
    const viewStr = currentView as string;
    if (viewStr === 'modulo_admin' && adminTab === itemTab) {
      return true;
    }
    if (itemTab === 'presupuesto_cne' && viewStr === 'presupuesto') {
      return true;
    }
    if (itemTab === 'gestion_testigos' && viewStr === 'testigo_campo') {
      return true;
    }
    if (itemTab === 'jurados_electorales' && viewStr === 'jurado_campo') {
      return true;
    }
    if (itemTab === 'encuestas_sondeos' && viewStr === 'encuestas') {
      return true;
    }
    return false;
  };

  const isStrategicItemActive = (itemTab: string) => {
    return currentView === 'gestion_estrategica' && strategicTab === itemTab;
  };

  const isTerritorialItemActive = (itemTab: string) => {
    const viewStr = currentView as string;
    if (itemTab === 'registro' || itemTab === 'mapa') {
      return viewStr === 'gestion_territorial' && territorialSubTab === itemTab;
    }
    if (itemTab === 'gestion_testigos' && viewStr === 'testigo_campo') {
      return true;
    }
    if (itemTab === 'jurados_electorales' && viewStr === 'jurado_campo') {
      return true;
    }
    if (itemTab === 'encuestas_sondeos' && viewStr === 'encuestas') {
      return true;
    }
    return false;
  };

  const isViewAccessible = (view: ViewMode) => {
    if (userRole === 'superadmin') return true;
    return isViewAllowed(userRole as any, view) && isViewAllowedForModule(authUser?.moduleName, view);
  };

  useEffect(() => {
    // ESC key listener to close mobile drawer
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && onCloseMobile) {
        onCloseMobile();
      }
    };

    // Body scroll lock on mobile and tablet when sidebar drawer is open
    if (isOpen && window.innerWidth < 1024) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onCloseMobile]);

  return (
    <>
      {/* Mobile & Tablet dark backdrop overlay when drawer is open */}
      {isOpen && (
        <div
          onClick={onCloseMobile}
          aria-hidden="true"
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden animate-in fade-in transition-all"
        />
      )}

      <aside className={`fixed inset-y-0 left-0 z-50 w-[280px] xs:w-72 md:w-64 max-w-[85vw] bg-[#030712]/95 border-r border-white/5 text-slate-100 flex flex-col justify-between shrink-0 transition-transform duration-300 ease-in-out select-none lg:relative lg:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
      <div className="p-4 sm:p-5 space-y-5 overflow-y-auto max-h-[calc(100vh-80px)] custom-scrollbar">
        
        {/* Header Block matching app design */}
        <div className="flex items-center justify-between gap-3 pb-3 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 shrink-0 animate-pulse">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-display font-extrabold text-sm tracking-wide text-white leading-tight">
                Electoral360
              </h1>
              <p className="text-[10px] font-semibold text-cyan-400/90 mt-0.5 uppercase tracking-wider">
                Panel de Control
              </p>
            </div>
          </div>
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              aria-label="Cerrar menú"
              className="lg:hidden p-2 rounded-xl bg-slate-900 border border-white/10 text-slate-300 hover:text-white cursor-pointer transition-all min-h-[38px] min-w-[38px] flex items-center justify-center"
              title="Cerrar menú"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Modules Accordion Trigger button */}
        <div className="px-1 py-1">
          <div className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-white/[0.03] border border-white/5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            <span>Módulos</span>
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
          </div>
        </div>

        {/* Navigation Menu Accordion Modules */}
        <div className="space-y-5">
          
          {/* Gestión Administrativa Dropdown Accordion */}
          <div className="space-y-1">
            <button
              onClick={() => {
                if (onSelectActiveModule) onSelectActiveModule('admin');
                onSelectView('modulo_admin');
              }}
              className={`w-full flex items-center justify-between px-2.5 py-2 text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer ${
                activeModule === 'admin' ? 'text-cyan-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>Gestión Administrativa</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${activeModule === 'admin' ? 'rotate-180 text-cyan-400' : 'text-slate-500'}`} />
            </button>

            {activeModule === 'admin' && (
              <nav className="space-y-0.5 pl-0.5 mt-1 animate-in slide-in-from-top-1 duration-200">
                {adminMenuItems.map((item) => {
                  let targetView: ViewMode = 'modulo_admin';
                  if (item.tab === 'presupuesto_cne') targetView = 'presupuesto';
                  else if (item.tab === 'gestion_testigos') targetView = 'testigo_campo';
                  else if (item.tab === 'jurados_electorales') targetView = 'jurado_campo';
                  else if (item.tab === 'encuestas_sondeos') targetView = 'encuestas';

                  if (!isViewAccessible(targetView)) return null;

                  const isActive = isItemActive(item.tab);
                  
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onSelectView(targetView);
                        if (onSelectActiveModule) onSelectActiveModule('admin');
                        if (item.tab && onSelectAdminTab) {
                          onSelectAdminTab(item.tab);
                        }
                        if (onCloseMobile) onCloseMobile();
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer border-l-2 ${
                        isActive
                          ? 'bg-cyan-500/10 text-white border-cyan-400 shadow-[inset_0_0_12px_rgba(6,182,212,0.15)] font-bold'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.02] border-transparent'
                      }`}
                    >
                      <div className={`shrink-0 transition-transform ${isActive ? 'scale-110 text-cyan-400' : 'text-slate-500'}`}>
                        {item.icon}
                      </div>
                      <span className="truncate tracking-wide">{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            )}
          </div>

          {/* Gestión Estratégica Dropdown Accordion */}
          <div className="space-y-1">
            <button
              onClick={() => {
                if (onSelectActiveModule) onSelectActiveModule('estrategica');
                onSelectView('gestion_estrategica');
              }}
              className={`w-full flex items-center justify-between px-2.5 py-2 text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer ${
                activeModule === 'estrategica' ? 'text-purple-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>Gestión Estratégica</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${activeModule === 'estrategica' ? 'rotate-180 text-purple-400' : 'text-slate-500'}`} />
            </button>

            {activeModule === 'estrategica' && (
              <nav className="space-y-0.5 pl-0.5 mt-1 animate-in slide-in-from-top-1 duration-200">
                {strategicMenuItems.map((item) => {
                  const isActive = isStrategicItemActive(item.tab);
                  
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onSelectView('gestion_estrategica');
                        if (onSelectActiveModule) onSelectActiveModule('estrategica');
                        if (item.tab && onSelectStrategicTab) {
                          onSelectStrategicTab(item.tab);
                        }
                        if (onCloseMobile) onCloseMobile();
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer border-l-2 ${
                        isActive
                          ? 'bg-purple-500/10 text-white border-purple-400 shadow-[inset_0_0_12px_rgba(168,85,247,0.15)] font-bold'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.02] border-transparent'
                      }`}
                    >
                      <div className={`shrink-0 transition-transform ${isActive ? 'scale-110 text-purple-400' : 'text-slate-500'}`}>
                        {item.icon}
                      </div>
                      <span className="truncate tracking-wide">{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            )}
          </div>

          {/* Gestión Territorial Dropdown Accordion */}
          <div className="space-y-1">
            <button
              onClick={() => {
                if (onSelectActiveModule) onSelectActiveModule('territorial');
                onSelectView('gestion_territorial');
              }}
              className={`w-full flex items-center justify-between px-2.5 py-2 text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer ${
                activeModule === 'territorial' ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>Gestión Territorial</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${activeModule === 'territorial' ? 'rotate-180 text-emerald-400' : 'text-slate-500'}`} />
            </button>

            {activeModule === 'territorial' && (
              <nav className="space-y-0.5 pl-0.5 mt-1 animate-in slide-in-from-top-1 duration-200">
                {territorialMenuItems.map((item) => {
                  const isActive = isTerritorialItemActive(item.tab);
                  
                  let targetView: ViewMode = 'gestion_territorial';
                  if (item.tab === 'gestion_testigos') {
                    targetView = 'testigo_campo';
                  } else if (item.tab === 'jurados_electorales') {
                    targetView = 'jurado_campo';
                  } else if (item.tab === 'encuestas_sondeos') {
                    targetView = 'encuestas';
                  }

                  if (!isViewAccessible(targetView)) return null;

                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onSelectView(targetView);
                        if (onSelectActiveModule) onSelectActiveModule('territorial');
                        if (targetView === 'gestion_territorial') {
                          if (item.tab && onSelectTerritorialSubTab) {
                            onSelectTerritorialSubTab(item.tab as any);
                          }
                        }
                        if (onCloseMobile) onCloseMobile();
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer border-l-2 ${
                        isActive
                          ? 'bg-emerald-500/10 text-white border-emerald-400 shadow-[inset_0_0_12px_rgba(16,185,129,0.15)] font-bold'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.02] border-transparent'
                      }`}
                    >
                      <div className={`shrink-0 transition-transform ${isActive ? 'scale-110 text-emerald-400' : 'text-slate-500'}`}>
                        {item.icon}
                      </div>
                      <span className="truncate tracking-wide">{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            )}
          </div>

          {/* Sistema Configuration link */}
          {activeModule !== 'admin' && (
            <div className="space-y-1">
              <button
                onClick={() => {
                  onSelectView('configuracion');
                  if (onCloseMobile) onCloseMobile();
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer border-l-2 ${
                  currentView === 'configuracion'
                    ? 'bg-cyan-500/10 text-white border-cyan-400 shadow-[inset_0_0_12px_rgba(6,182,212,0.15)] font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.02] border-transparent'
                }`}
              >
                <div className="shrink-0 text-slate-500">
                  <Settings className="w-4 h-4" />
                </div>
                <span className="truncate tracking-wide">Configuración</span>
              </button>
            </div>
          )}

        </div>

      </div>

      {/* User Profile Badge & Logout (Enterprise style) */}
      <div className="p-4 border-t border-white/5 bg-slate-950/30 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#0284c7] to-[#06b6d4] flex items-center justify-center font-bold text-white shrink-0 text-xs shadow-md shadow-cyan-500/10 select-none">
            {authUser?.name ? authUser.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'OB'}
          </div>
          <div className="overflow-hidden">
            <h4 className="font-bold text-xs text-white truncate leading-tight">{authUser?.name || 'Ober Osorio'}</h4>
            <p className="text-[9px] text-slate-500 truncate mt-0.5 font-bold uppercase tracking-wider">
              {authUser?.role === 'superadmin' ? 'Super Administrador' : authUser?.role || 'Administrador'}
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            if (onLogout) {
              onLogout();
            } else {
              localStorage.removeItem('bee_auth_user');
              window.location.reload();
            }
          }}
          className="p-2.5 rounded-xl bg-white/5 hover:bg-rose-500/10 hover:text-rose-400 text-slate-400 transition-all cursor-pointer shrink-0"
          title="Cerrar Sesión"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </aside>
    </>
  );
};
