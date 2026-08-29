import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu } from 'lucide-react';
import { 
  ViewMode, 
  AuthUser, 
  CalendarEvent, 
  BankTransaction, 
  E14Record, 
  TerritorialZone, 
  GeofenceAlert, 
  ChatMessage 
} from './types';
import { isViewAllowed, isViewAllowedForModule } from './utils/rolePermissions';

// Global Navigation Components
import { Sidebar } from './components/Sidebar';
import { Modals } from './components/common/Modals';
import { LoginModal } from './components/LoginModal';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { LusionBackground } from '../../components/LusionBackground';
import { LusionCursor } from '../../components/LusionCursor';

// Landing Page & Module Selector (from repo1)
import { RedSunBeeCampaignLanding } from './components/RedSunBeeCampaignLanding';
import { ModuleSelectPage } from './components/ModuleSelectPage';

// Full Suite Views (from repo2)
import { PrimeraInterfaz } from './components/views/PrimeraInterfaz';
import { ModuloAdministrativo } from './components/views/ModuloAdministrativo';
import { GestionEstrategica } from './components/views/GestionEstrategica';
import { GestionTerritorial } from './components/views/GestionTerritorial';
import { TestigoCampoView } from './components/views/TestigoCampoView';
import { EncuestasView } from './components/views/EncuestasView';
import { JuradoCampoView } from './components/views/JuradoCampoView';
import { PresupuestoContabilidad } from './components/views/PresupuestoContabilidad';
import { ConfiguracionView } from './components/views/ConfiguracionView';
import { PruebasElectoralesView } from './components/views/PruebasElectoralesView';
import { PanelAdministrativoSaaS } from './components/views/PanelAdministrativoSaaS';
import { PanelAdminGlobal } from './components/views/PanelAdminGlobal';

// Initial Mock Datasets
import { initialTerritorialZones } from './data/initialData';

const initialCalendarEvents: CalendarEvent[] = [
  { id: 'ev-1', title: 'Debate Central Antioquia Telemedellín', date: '22 May', type: 'Medios' },
  { id: 'ev-2', title: 'Caravana de la Victoria Comuna 13', date: '23 May', type: 'Territorio' },
  { id: 'ev-3', title: 'Cierre de Campaña La Alpujarra', date: '24 May', type: 'Evento Masivo' },
  { id: 'ev-4', title: 'Reunión Jurídica y Testigos Electorales', date: '25 May', type: 'Escrutinio' },
  { id: 'ev-5', title: 'Día D: Instalación de Puestos de Mando', date: '26 May', type: 'Operación Día D' }
];

const initialTransactions: BankTransaction[] = [
  { id: 'tx-1', descripcion: 'Impresión de Volantes y Microperforados', categoria: 'Publicidad', monto: 8500000, fecha: '18 May', estado: 'Completado' },
  { id: 'tx-2', descripcion: 'Honorarios Coordinadores Territoriales Comunas 1 a 6', categoria: 'Personal', monto: 14200000, fecha: '19 May', estado: 'Completado' },
  { id: 'tx-3', descripcion: 'Logística Caravana Móvil y Sonido Comuna 13', categoria: 'Eventos', monto: 4800000, fecha: '20 May', estado: 'Completado' },
  { id: 'tx-4', descripcion: 'Aporte Donación Sector Productivo Aprobado CNE', categoria: 'Ingresos', monto: 35000000, fecha: '20 May', estado: 'Completado' },
  { id: 'tx-5', descripcion: 'Pauta Digital y Segmentación Meta/Google Ads', categoria: 'Publicidad', monto: 12000000, fecha: '21 May', estado: 'Completado' }
];

const VIEW_PATH_MAP: Record<ViewMode, string> = {
  landing: '/',
  module_select: '/modulos',
  global_admin: '/global-admin',
  saas_admin: '/saas-admin',
  primera_interfaz: '/sala-control',
  modulo_admin: '/administrativo',
  gestion_estrategica: '/estrategico',
  gestion_territorial: '/territorial',
  testigo_campo: '/testigos',
  encuestas: '/encuestas',
  jurado_campo: '/jurados',
  presupuesto: '/presupuesto',
  pruebas_electorales: '/simulacros',
  configuracion: '/configuracion',
  agenda_electoral: '/agenda',
  distribucion_electoral: '/distribucion'
};

const PATH_VIEW_MAP: Record<string, ViewMode> = {
  '/': 'landing',
  '/modulos': 'module_select',
  '/global-admin': 'global_admin',
  '/global_admin': 'global_admin',
  '/saas-admin': 'saas_admin',
  '/sala-control': 'primera_interfaz',
  '/administrativo': 'modulo_admin',
  '/estrategico': 'gestion_estrategica',
  '/territorial': 'gestion_territorial',
  '/testigos': 'testigo_campo',
  '/encuestas': 'encuestas',
  '/jurados': 'jurado_campo',
  '/presupuesto': 'presupuesto',
  '/simulacros': 'pruebas_electorales',
  '/configuracion': 'configuracion',
  '/agenda': 'agenda_electoral',
  '/distribucion': 'distribucion_electoral'
};

const parseUrlPath = (pathname: string) => {
  const parts = pathname.split('/').filter(Boolean);
  const mainSegment = parts[0] || '';
  const subSegment = parts[1] || '';
  
  let activeMod: 'admin' | 'estrategica' | 'territorial' = 'admin';
  let view: ViewMode = 'module_select';
  let adminT = 'inicio';
  let strategicT = 'diagnostico';
  let territorialT = 'registro';
  
  if (mainSegment === 'administrativo') {
    activeMod = 'admin';
    view = 'modulo_admin';
    if (subSegment === 'roles') adminT = 'roles';
    else if (subSegment === 'lideres-votantes') adminT = 'lideres_votantes';
    else if (subSegment === 'presupuesto') view = 'presupuesto';
    else if (subSegment === 'campana') adminT = 'gestion_campana';
    else if (subSegment === 'testigos') view = 'testigo_campo';
    else if (subSegment === 'jurados') view = 'jurado_campo';
    else if (subSegment === 'encuestas') view = 'encuestas';
    else if (subSegment === 'distribucion') adminT = 'distribucion_electoral';
    else if (subSegment === 'consulta-lugar') adminT = 'consulta_lugar_votacion';
  } else if (mainSegment === 'estrategico') {
    activeMod = 'estrategica';
    view = 'gestion_estrategica';
    if (subSegment === 'diagnostico-360') strategicT = 'diagnostico';
    else if (subSegment === 'diagnostico-territorial') strategicT = 'diagnostico_territorial';
    else if (subSegment === 'programa-gobierno') strategicT = 'programa_gobierno';
    else if (subSegment === 'perfil-candidato') strategicT = 'perfil';
    else if (subSegment === 'carga-cv') strategicT = 'hoja_vida';
    else if (subSegment === 'matriz-dofa') strategicT = 'dofa';
    else if (subSegment === 'narrativa-discurso') strategicT = 'discurso';
    else if (subSegment === 'comunicacion-redes') strategicT = 'comunicacion_redes';
    else if (subSegment === 'analisis-datos') strategicT = 'analisis_datos';
    else if (subSegment === 'agenda-electoral') strategicT = 'agenda_electoral';
  } else if (mainSegment === 'territorial') {
    activeMod = 'territorial';
    view = 'gestion_territorial';
    if (subSegment === 'registro') territorialT = 'registro';
    else if (subSegment === 'mapa') territorialT = 'mapa';
    else if (subSegment === 'testigos-campo') view = 'testigo_campo';
    else if (subSegment === 'modulo-encuestas') view = 'encuestas';
    else if (subSegment === 'jurados-mesa') view = 'jurado_campo';
  } else {
    const matched = PATH_VIEW_MAP['/' + mainSegment];
    if (matched) view = matched;
  }
  
  return { activeMod, view, adminT, strategicT, territorialT };
};

const getFullPath = (
  view: ViewMode,
  activeMod: 'admin' | 'estrategica' | 'territorial',
  adminT: string,
  strategicT: string,
  territorialT: string
): string => {
  if (activeMod === 'admin') {
    const base = '/administrativo';
    if (view === 'presupuesto') return `${base}/presupuesto`;
    if (view === 'testigo_campo') return `${base}/testigos`;
    if (view === 'jurado_campo') return `${base}/jurados`;
    if (view === 'encuestas') return `${base}/encuestas`;
    if (view === 'modulo_admin') {
      if (adminT === 'roles') return `${base}/roles`;
      if (adminT === 'lideres_votantes') return `${base}/lideres-votantes`;
      if (adminT === 'gestion_campana') return `${base}/campana`;
      if (adminT === 'distribucion_electoral') return `${base}/distribucion`;
      if (adminT === 'consulta_lugar_votacion') return `${base}/consulta-lugar`;
    }
    return base;
  }
  
  if (activeMod === 'estrategica') {
    const base = '/estrategico';
    if (view === 'gestion_estrategica') {
      if (strategicT === 'diagnostico') return `${base}/diagnostico-360`;
      if (strategicT === 'diagnostico_territorial') return `${base}/diagnostico-territorial`;
      if (strategicT === 'programa_gobierno') return `${base}/programa-gobierno`;
      if (strategicT === 'perfil') return `${base}/perfil-candidato`;
      if (strategicT === 'hoja_vida') return `${base}/carga-cv`;
      if (strategicT === 'dofa') return `${base}/matriz-dofa`;
      if (strategicT === 'discurso') return `${base}/narrativa-discurso`;
      if (strategicT === 'comunicacion_redes') return `${base}/comunicacion-redes`;
      if (strategicT === 'analisis_datos') return `${base}/analisis-datos`;
      if (strategicT === 'agenda_electoral') return `${base}/agenda-electoral`;
    }
    return base;
  }
  
  if (activeMod === 'territorial') {
    const base = '/territorial';
    if (view === 'testigo_campo') return `${base}/testigos-campo`;
    if (view === 'encuestas') return `${base}/modulo-encuestas`;
    if (view === 'jurado_campo') return `${base}/jurados-mesa`;
    if (view === 'gestion_territorial') {
      if (territorialT === 'registro') return `${base}/registro`;
      if (territorialT === 'mapa') return `${base}/mapa`;
    }
    return base;
  }
  
  return VIEW_PATH_MAP[view] || '/';
};

export default function BeeCampaignApp() {
  // Session Authentication State
  const [authUser, setAuthUser] = useState<AuthUser | null>(() => {
    try {
      const saved = localStorage.getItem('bee_auth_user');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error restoring session:', e);
    }
    return null;
  });

  // Deduce initial routing state from current pathname
  const initialRoute = parseUrlPath(window.location.pathname);

  // Current Active Route / View
  const [currentView, setCurrentView] = useState<ViewMode>(() => {
    const view = initialRoute.view;
    const isRestricted = !['landing', 'module_select', 'global_admin'].includes(view);
    const hasSession = localStorage.getItem('bee_auth_user');
    
    if (isRestricted && !hasSession) {
      return 'landing';
    }
    return view;
  });

  // Conceptual Active Module
  const [activeModule, setActiveModule] = useState<'admin' | 'estrategica' | 'territorial'>(() => {
    const saved = localStorage.getItem('bee_active_module');
    if (saved === 'admin' || saved === 'estrategica' || saved === 'territorial') {
      return saved;
    }
    return initialRoute.activeMod;
  });

  // Subtab navigation states
  const [adminTab, setAdminTab] = useState<string>(initialRoute.adminT);
  const [strategicTab, setStrategicTab] = useState<string>(initialRoute.strategicT);
  const [territorialSubTab, setTerritorialSubTab] = useState<'registro' | 'mapa'>(initialRoute.territorialT as any);

  // Modals & UI Controls
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [pendingViewAfterLogin, setPendingViewAfterLogin] = useState<ViewMode | null>(null);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [selectedE14, setSelectedE14] = useState<E14Record | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [unreadNotifications, setUnreadNotifications] = useState<number>(3);

  // Live Data collections
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>(initialCalendarEvents);
  const [transactions, setTransactions] = useState<BankTransaction[]>(initialTransactions);
  const [zones] = useState<TerritorialZone[]>(initialTerritorialZones);

  // Sync to localStorage
  useEffect(() => {
    if (authUser) {
      localStorage.setItem('bee_auth_user', JSON.stringify(authUser));
    } else {
      localStorage.removeItem('bee_auth_user');
    }
  }, [authUser]);

  // Load transactions from NestJS Backend on mount or authUser login
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const savedUser = localStorage.getItem('bee_auth_user');
        const token = savedUser ? JSON.parse(savedUser).access_token : '';
        if (!token) return;
        const res = await fetch('/api/v1/presupuesto/transacciones', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          const mapped: BankTransaction[] = data.map((tx: any) => ({
            id: tx.id,
            descripcion: tx.descripcion,
            categoria: tx.categoria as any,
            monto: tx.monto,
            fecha: tx.fecha,
            estado: tx.estado as any
          }));
          setTransactions(mapped.length > 0 ? mapped : initialTransactions);
        }
      } catch (err) {
        console.error('Error loading transactions:', err);
      }
    };
    fetchTransactions();
  }, [authUser]);

  useEffect(() => {
    localStorage.setItem('bee_active_module', activeModule);
  }, [activeModule]);

  useEffect(() => {
    // Automatically set active module from currentView ONLY for non-shared views
    if (['modulo_admin', 'presupuesto', 'pruebas_electorales'].includes(currentView)) {
      setActiveModule('admin');
    } else if (['gestion_estrategica', 'agenda_electoral'].includes(currentView)) {
      setActiveModule('estrategica');
    } else if (['gestion_territorial'].includes(currentView)) {
      setActiveModule('territorial');
    }
  }, [currentView]);

  useEffect(() => {
    localStorage.setItem('bee_current_view', currentView);

    // Sync state currentView and sub-tab to browser URL path (SPA routing)
    const targetPath = getFullPath(currentView, activeModule, adminTab, strategicTab, territorialSubTab);
    if (targetPath && window.location.pathname !== targetPath) {
      if (window.history.pushState) {
        window.history.pushState('', document.title, targetPath);
      }
    }
  }, [currentView, activeModule, adminTab, strategicTab, territorialSubTab]);

  useEffect(() => {
    const handleUrlCheck = () => {
      const path = window.location.pathname;
      const route = parseUrlPath(path);
      
      const isRestricted = !['landing', 'module_select', 'global_admin'].includes(route.view);
      const hasSession = localStorage.getItem('bee_auth_user');
      
      if (isRestricted && !hasSession) {
        setCurrentView('landing');
        if (window.history.replaceState) {
          window.history.replaceState('', document.title, '/');
        }
      } else {
        setCurrentView(route.view);
        setActiveModule(route.activeMod);
        setAdminTab(route.adminT);
        setStrategicTab(route.strategicT);
        setTerritorialSubTab(route.territorialT as any);
      }
    };
    handleUrlCheck();
    window.addEventListener('popstate', handleUrlCheck);
    window.addEventListener('hashchange', handleUrlCheck);
    return () => {
      window.removeEventListener('popstate', handleUrlCheck);
      window.removeEventListener('hashchange', handleUrlCheck);
    };
  }, []);

  // Login handler
  const handleLoginSuccess = (user: AuthUser, redirectRoute?: ViewMode) => {
    setAuthUser(user);
    setIsLoginModalOpen(false);
    
    // Choose appropriate view based on role or explicit redirect
    const targetRoute = pendingViewAfterLogin || redirectRoute;
    setPendingViewAfterLogin(null);

    if (targetRoute && targetRoute !== 'landing') {
      setCurrentView(targetRoute === 'primera_interfaz' ? 'modulo_admin' : targetRoute);
    } else if (user.role === 'territorial') {
      setCurrentView('gestion_territorial');
    } else if (user.role === 'estrategico') {
      setCurrentView('gestion_estrategica');
    } else {
      setCurrentView('modulo_admin');
    }
  };

  // Logout handler
  const handleLogout = () => {
    setAuthUser(null);
    localStorage.removeItem('bee_auth_user');
    setCurrentView('landing');
    setSidebarOpen(false);
  };

  // Safe navigation with RBAC check
  const handleSelectView = (view: ViewMode) => {
    const targetView = view === 'primera_interfaz' ? 'modulo_admin' : view;
    if (targetView === 'landing' || targetView === 'module_select') {
      setCurrentView(targetView);
      setSidebarOpen(false);
      return;
    }

    if (['modulo_admin', 'presupuesto', 'pruebas_electorales'].includes(targetView)) {
      setActiveModule('admin');
    } else if (['gestion_estrategica', 'agenda_electoral'].includes(targetView)) {
      setActiveModule('estrategica');
    } else if (['gestion_territorial', 'testigo_campo', 'jurado_campo', 'encuestas'].includes(targetView)) {
      setActiveModule('territorial');
    }

    if (targetView === 'modulo_admin') {
      setCurrentView('modulo_admin');
      setSidebarOpen(false);
      return;
    }

    // Role-based permission check
    const userRole = (authUser?.role || 'superadmin') as any;
    const isAllowed = userRole === 'superadmin' || (isViewAllowed(userRole, view) && isViewAllowedForModule(authUser?.moduleName, view));

    if (isAllowed || !authUser) {
      setCurrentView(view);
      setSidebarOpen(false);
    } else {
      // If forbidden, fallback to accessible module
      alert(`El rol ${userRole} no tiene permisos asignados para acceder a este módulo.`);
    }
  };

  // Add Calendar Event Modal Submit
  const handleAddCalendarEvent = (event: CalendarEvent) => {
    setCalendarEvents(prev => [event, ...prev]);
    setActiveModal(null);
  };

  // Add Transaction Modal Submit
  const handleAddTransaction = async (tx: BankTransaction) => {
    try {
      const savedUser = localStorage.getItem('bee_auth_user');
      const token = savedUser ? JSON.parse(savedUser).access_token : '';
      const payload = {
        descripcion: tx.descripcion,
        categoria: tx.categoria,
        tipo: tx.categoria === 'Ingresos' ? 'INGRESO' : 'EGRESO',
        monto: tx.monto,
        fecha: tx.fecha,
        estado: tx.estado || 'Completado'
      };

      const res = await fetch('/api/v1/presupuesto/transacciones', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const savedRecord = await res.json();
        const nuevaTx: BankTransaction = {
          id: savedRecord.id,
          descripcion: savedRecord.descripcion,
          categoria: savedRecord.categoria as any,
          monto: savedRecord.monto,
          fecha: savedRecord.fecha,
          estado: savedRecord.estado as any
        };
        setTransactions(prev => [nuevaTx, ...prev]);
      } else {
        alert('Error al registrar la transacción en el servidor.');
      }
    } catch (err) {
      console.error('Error al registrar transacción:', err);
      alert('Error de conexión al registrar transacción.');
    }
    setActiveModal(null);
  };

  // Render Full Screen Views (Landing / Module Selector)
  if (currentView === 'landing') {
    return (
        <RedSunBeeCampaignLanding 
          onLogin={() => {
            setCurrentView('module_select');
          }}
        />
    );
  }

  if (currentView === 'module_select') {
    return (
      <div className="min-h-screen bg-[#020617] text-white relative overflow-hidden">
        <LusionBackground />
        <LusionCursor />
        <div className="relative z-10">
          <ModuleSelectPage 
            onBack={() => setCurrentView('landing')}
            onSelectModule={(view) => {
              if (!authUser) {
                setPendingViewAfterLogin(view);
                setIsLoginModalOpen(true);
              } else {
                handleSelectView(view);
              }
            }}
            onOpenLogin={() => setIsLoginModalOpen(true)}
          />

          <LoginModal 
            isOpen={isLoginModalOpen}
            onClose={() => setIsLoginModalOpen(false)}
            onLoginSuccess={handleLoginSuccess}
            targetView={pendingViewAfterLogin}
          />
        </div>
      </div>
    );
  }

  if (currentView === 'saas_admin') {
    return (
      <div className="min-h-screen bg-[#020617] text-slate-100 relative overflow-hidden">
        <LusionBackground />
        <LusionCursor />
        {/* Background ambient glows */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-cyan-500/10 blur-[150px] rounded-full pointer-events-none -z-10" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-500/10 blur-[150px] rounded-full pointer-events-none -z-10" />
        <div className="relative z-10">
          <PanelAdministrativoSaaS 
            onSelectView={handleSelectView}
            authUser={authUser}
          />
        </div>
      </div>
    );
  }

  if (currentView === 'global_admin') {
    return (
      <div className="min-h-screen bg-[#020617] text-slate-100 relative overflow-hidden">
        <LusionBackground />
        <LusionCursor />
        {/* Background ambient glows */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-cyan-500/10 blur-[150px] rounded-full pointer-events-none -z-10" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-500/10 blur-[150px] rounded-full pointer-events-none -z-10" />
        <div className="relative z-10">
          <PanelAdminGlobal 
            onSelectView={handleSelectView}
            authUser={authUser}
            setAuthUser={setAuthUser}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen max-h-screen overflow-hidden flex flex-col bg-[#020617] text-slate-100 selection:bg-cyan-500 selection:text-black relative theme-light-modules">
      <LusionBackground />
      <LusionCursor />
      {/* Background ambient glows */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-cyan-500/10 blur-[150px] rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-500/10 blur-[150px] rounded-full pointer-events-none -z-10" />
      {/* Mobile Top Bar */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-[#111C30] border-b border-cyan-500/15 sticky top-0 z-30 w-full shrink-0">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setSidebarOpen(true)}
            aria-label="Abrir menú"
            className="p-2 rounded-xl bg-slate-900 border border-cyan-500/20 text-cyan-300 hover:text-white cursor-pointer transition-all min-h-[38px] min-w-[38px] flex items-center justify-center"
          >
            <Menu className="w-4 h-4" />
          </button>
          <span className="text-xs font-bold text-slate-300 uppercase tracking-widest truncate max-w-[150px] xs:max-w-none">
            {currentView === 'modulo_admin' && 'Gestión Administrativa'}
            {currentView === 'primera_interfaz' && 'Gestión Operativa'}
            {currentView === 'gestion_territorial' && 'Gestión Territorial'}
            {currentView === 'gestion_estrategica' && 'Gestión Estratégica'}
            {currentView === 'testigo_campo' && 'Testigos de Campo'}
            {currentView === 'encuestas' && 'Encuestas y Sondeos'}
            {currentView === 'configuracion' && 'Configuración'}
            {currentView === 'presupuesto' && 'Presupuesto'}
            {!['modulo_admin', 'primera_interfaz', 'gestion_territorial', 'gestion_estrategica', 'testigo_campo', 'encuestas', 'configuracion', 'presupuesto'].includes(currentView) && 'Panel de Control'}
          </span>
        </div>

        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-emerald-950/40 border-emerald-800/40 text-emerald-400 font-mono">
          {authUser?.role || 'Invitado'}
        </span>
      </div>

      {/* Main Workspace: Sidebar + Dynamic View Content */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Navigation Sidebar */}
        <Sidebar 
          currentView={currentView}
          onSelectView={handleSelectView}
          adminTab={adminTab}
          onSelectAdminTab={setAdminTab}
          strategicTab={strategicTab}
          onSelectStrategicTab={setStrategicTab}
          territorialSubTab={territorialSubTab}
          onSelectTerritorialSubTab={setTerritorialSubTab}
          onOpenUserRolesModal={() => setActiveModal('user_roles')}
          isOpen={sidebarOpen}
          onCloseMobile={() => setSidebarOpen(false)}
          authUser={authUser}
          onLogout={handleLogout}
          activeModule={activeModule}
          onSelectActiveModule={setActiveModule}
        />

        {/* Main Content Area with Smooth Motion Transitions */}
        <main className="flex-1 overflow-y-auto bg-gradient-to-b from-[#020617] via-[#020617] to-[#020617] relative custom-scrollbar">
          <ErrorBoundary 
            moduleName={currentView}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentView + (currentView === 'modulo_admin' ? adminTab : '') + (currentView === 'gestion_estrategica' ? strategicTab : '')}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="w-full h-full"
              >
                {/* Executive Command Center / Sala de Control */}
                {currentView === 'primera_interfaz' && (
                  <PrimeraInterfaz 
                    onLoginSuccess={handleLoginSuccess}
                    authUser={authUser}
                  />
                )}

                {/* Modulo 1: Gestion Administrativa & Financiera */}
                {currentView === 'modulo_admin' && (
                  <ModuloAdministrativo 
                    onSelectView={handleSelectView}
                    calendarEvents={calendarEvents}
                    onAddEventClick={() => setActiveModal('add_event')}
                    onOpenUserRolesModal={() => setActiveModal('user_roles')}
                    activeTab={adminTab}
                    onTabChange={setAdminTab}
                    authUser={authUser}
                  />
                )}

                {/* Modulo 2: Gestion Estratégica, IA, FODA & Campaña */}
                {currentView === 'gestion_estrategica' && (
                  <GestionEstrategica 
                    onSelectView={handleSelectView}
                    activeTab={strategicTab as any}
                    onSelectTab={setStrategicTab as any}
                    onOpenBudgetModal={() => setActiveModal('add_tx')}
                  />
                )}

                {/* Modulo 3: Operacion Territorial & Censo */}
                {currentView === 'gestion_territorial' && (
                  <GestionTerritorial 
                    onSelectView={handleSelectView}
                    zones={zones}
                    onOpenFieldRegistrationModal={() => setTerritorialSubTab('registro')}
                    initialSubTab={territorialSubTab}
                    onSubTabChange={setTerritorialSubTab}
                    authUser={authUser}
                  />
                )}

                {/* Testigos de Campo (Día E) */}
                {currentView === 'testigo_campo' && (
                  <TestigoCampoView 
                    onSelectView={handleSelectView}
                    authUser={authUser}
                  />
                )}

                {/* Encuestas y Sondeos Electorales */}
                {currentView === 'encuestas' && (
                  <EncuestasView 
                    onSelectView={handleSelectView}
                    authUser={authUser}
                  />
                )}

                {/* Jurados de Mesa y Escrutinio */}
                {currentView === 'jurado_campo' && (
                  <JuradoCampoView 
                    onSelectView={handleSelectView}
                    authUser={authUser}
                  />
                )}

                {/* Presupuesto y Contabilidad CNE */}
                {currentView === 'presupuesto' && (
                  <PresupuestoContabilidad 
                    onSelectView={handleSelectView}
                    transactions={transactions}
                    onOpenAddTransactionModal={() => setActiveModal('add_tx')}
                    onOpenOCRModal={() => setActiveModal('ocr_scanner')}
                  />
                )}

                {/* QA & Simulacros Electorales */}
                {currentView === 'pruebas_electorales' && (
                  <PruebasElectoralesView 
                    onSelectView={handleSelectView}
                    authUser={authUser || {
                      id: 'usr-admin-default',
                      name: 'Super Administrador Electoral',
                      email: 'admin@campanaganadora.com',
                      role: 'superadmin',
                      roleName: 'Superadministrador AI',
                      moduleName: 'Auditoría & Control'
                    }}
                  />
                )}

                {/* Configuración del Sistema */}
                {currentView === 'configuracion' && (
                  <ConfiguracionView 
                    onSelectView={handleSelectView}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </ErrorBoundary>
        </main>
      </div>

      {/* Global Modals Manager */}
      <Modals 
        activeModal={activeModal}
        onClose={() => setActiveModal(null)}
        selectedE14={selectedE14}
        onAddCalendarEvent={handleAddCalendarEvent}
        onAddTransaction={handleAddTransaction}
      />

      {/* Global Login & Persona Switcher Modal */}
      <LoginModal 
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        targetView={pendingViewAfterLogin}
      />
    </div>
  );
}
