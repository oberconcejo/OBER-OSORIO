import React, { useState, useEffect, useRef } from 'react';
import { ViewMode, AuthUser } from '../types';
import { CampaignLogoBadge } from './common/CampaignLogoIcon';
import { isViewAllowed, isViewAllowedForModule } from '../utils/rolePermissions';
import {
  Bot,
  LayoutDashboard,
  User,
  Bell,
  Clock,
  Settings,
  LogOut,
  MapPin,
  Shield,
  CreditCard,
  Layers,
  Sparkles,
  Menu,
  FileText,
  BarChart3,
  Users
} from 'lucide-react';

interface HeaderProps {
  currentView: ViewMode;
  onSelectView: (view: ViewMode) => void;
  unreadNotifications: number;
  onClearNotifications?: () => void;
  authUser?: AuthUser | null;
  onLogout?: () => void;
  onToggleSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onSelectView,
  unreadNotifications,
  onClearNotifications,
  authUser,
  onLogout,
  onToggleSidebar
}) => {
  const [time, setTime] = useState('01:28:57');
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, text: 'Nueva encuesta de intención de voto cargada en Gestión Territorial', time: 'Hace 5 min', read: false },
    { id: 2, text: 'Ober Osorio envió un comando de análisis al Centro de Control', time: 'Hace 15 min', read: false },
    { id: 3, text: 'Alerta: Posible abstención detectada en Comuna 4 (Aranjuez)', time: 'Hace 1 hora', read: false }
  ]);

  const [candidatePhoto, setCandidatePhoto] = useState<string | null>(() => {
    return localStorage.getItem('candidate_photo');
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Sync new notifications when unreadCount increases in parent
  useEffect(() => {
    const unreadLocal = notifications.filter(n => !n.read).length;
    if (unreadNotifications > unreadLocal) {
      const diff = unreadNotifications - unreadLocal;
      const newNotifs = Array.from({ length: diff }).map((_, i) => ({
        id: Date.now() + i,
        text: 'Nueva alerta del Centro de Comando IA: Se procesó un comando de análisis territorial.',
        time: 'Hace un momento',
        read: false
      }));
      setNotifications(prev => [...newNotifs, ...prev]);
    } else if (unreadNotifications === 0 && unreadLocal > 0) {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    }
  }, [unreadNotifications]);

  // Click outside listener for notification popover
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    if (onClearNotifications) {
      onClearNotifications();
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        localStorage.setItem('candidate_photo', base64String);
        setCandidatePhoto(base64String);
        window.dispatchEvent(new Event('candidate_photo_updated'));
      };
      reader.readAsDataURL(file);
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return 'OO';
    return name
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setTime(now.toLocaleTimeString('es-ES', { hour12: false }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const allViews: { id: ViewMode; title: string; subtitle: string; icon: React.ReactNode; color: string }[] = [
    {
      id: 'gestion_estrategica',
      title: 'Diagnóstico & Perfil',
      subtitle: 'Auditoría 360°, CV & DOFA',
      icon: <Bot className="w-4 h-4" />,
      color: 'from-emerald-500 to-teal-600'
    },
    {
      id: 'modulo_admin',
      title: 'Gestión Administrativa',
      subtitle: 'Resumen, Roles & Cuotas',
      icon: <LayoutDashboard className="w-4 h-4" />,
      color: 'from-cyan-500 to-teal-600'
    },

    {
      id: 'gestion_territorial',
      title: 'Gestión Territorial',
      subtitle: 'Mapa de Calor & Puestos',
      icon: <MapPin className="w-4 h-4" />,
      color: 'from-amber-500 to-teal-600'
    },
    {
      id: 'testigo_campo',
      title: 'Testigo de Campo (Día E)',
      subtitle: 'Reportes de Mesa, Participación y E-14',
      icon: <FileText className="w-4 h-4" />,
      color: 'from-emerald-500 to-teal-600'
    },
    {
      id: 'encuestas',
      title: 'Módulo de Encuestas',
      subtitle: 'Respuestas, Estadísticas y Toma de Datos',
      icon: <BarChart3 className="w-4 h-4" />,
      color: 'from-blue-500 to-indigo-600'
    },
    {
      id: 'jurado_campo',
      title: 'Módulo de Jurados de Mesa',
      subtitle: 'Instalación de Mesa, Padrón E-11, Conteo y Acta E-14',
      icon: <Users className="w-4 h-4" />,
      color: 'from-cyan-500 to-blue-600'
    },

    {
      id: 'presupuesto',
      title: 'Presupuesto y CNE',
      subtitle: 'Gastos, OCR & Cuentas',
      icon: <CreditCard className="w-4 h-4" />,
      color: 'from-emerald-600 to-cyan-600'
    },

    {
      id: 'configuracion',
      title: 'Configuración del Sistema',
      subtitle: 'IA, API & Seguridad',
      icon: <Settings className="w-4 h-4" />,
      color: 'from-cyan-600 to-teal-500'
    }
  ];

  const userRole = (authUser?.role || 'superadmin') as any;
  const allowedViews = allViews.filter(v => userRole === 'superadmin' || (isViewAllowed(userRole, v.id) && isViewAllowedForModule(authUser?.moduleName, v.id)));
  const currentViewData = allViews.find(v => v.id === currentView) || allowedViews[0] || allViews[0];

  const getModuleHeaderInfo = () => {
    const viewStr = currentView as string;
    if (viewStr === 'modulo_admin' || viewStr === 'presupuesto') {
      return {
        title: 'GESTIÓN ADMINISTRATIVA',
        description: 'Administración central de recursos y operación electoral.'
      };
    }
    if (viewStr === 'gestion_estrategica') {
      return {
        title: 'GESTIÓN ESTRATÉGICA',
        description: 'Planificación, análisis y diseño de estrategias inteligentes.'
      };
    }
    if (viewStr === 'gestion_territorial' || viewStr === 'testigo_campo' || viewStr === 'jurado_campo' || viewStr === 'encuestas') {
      return {
        title: 'GESTIÓN TERRITORIAL',
        description: 'Trabajo en campo, registro de información y despliegue territorial.'
      };
    }
    return {
      title: 'ELECTORAL360',
      description: 'Plataforma premium de gestión y analítica electoral.'
    };
  };

  const headerInfo = getModuleHeaderInfo();

  return (
    <header className="sticky top-0 z-40 bg-[#050816]/90 border-b border-white/5 text-white px-4 py-2.5 sm:px-6 sm:py-3 shadow-xl backdrop-blur-md transition-all w-full">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">

        {/* Left Side: Hamburger + Active Module Title & Description */}
        <div className="flex items-center gap-3 min-w-0">
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              aria-label="Abrir menú de navegación"
              className="lg:hidden p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-slate-300 transition-all cursor-pointer shrink-0 min-h-[36px] min-w-[36px] flex items-center justify-center"
              title="Abrir menú"
            >
              <Menu className="w-4 h-4" />
            </button>
          )}
          
          <div className="min-w-0">
            <h1 className="font-display font-extrabold text-xs sm:text-sm tracking-wide text-white uppercase leading-none">
              {headerInfo.title}
            </h1>
            <p className="text-[10px] sm:text-xs text-slate-400 truncate mt-1.5 leading-normal font-light hidden sm:block">
              {headerInfo.description}
            </p>
          </div>
        </div>

        {/* Right Status Controls */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {/* Live Timer */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/5 text-slate-300 text-xs font-mono shadow-md font-bold">
            <Clock className="w-3.5 h-3.5 text-cyan-400 animate-spin" style={{ animationDuration: '8s' }} />
            <span>{time}</span>
          </div>

          {/* Notifications Popover */}
          <div className="relative" ref={popoverRef}>
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              aria-label="Notificaciones"
              className="relative p-2 sm:p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-slate-300 hover:text-white transition-all cursor-pointer shadow-md min-h-[38px] min-w-[38px] sm:min-h-[40px] sm:min-w-[40px] flex items-center justify-center"
            >
              <Bell className="w-4 h-4 text-slate-300" />
              {unreadNotifications > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-bounce">
                  {unreadNotifications}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="fixed sm:absolute right-2 sm:right-0 top-14 sm:top-auto sm:mt-3.5 w-[calc(100vw-1rem)] sm:w-80 max-w-[340px] bg-slate-900/98 border border-white/5 rounded-2xl p-3.5 sm:p-4 shadow-2xl backdrop-blur-xl z-50 text-left space-y-3">
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-200">Notificaciones</h3>
                  {unreadNotifications > 0 && (
                    <button
                      onClick={handleMarkAllAsRead}
                      className="text-[10px] text-cyan-400 hover:text-cyan-200 font-black uppercase tracking-wider transition-colors cursor-pointer py-1 px-2"
                    >
                      Marcar leídas
                    </button>
                  )}
                </div>
                <div className="max-h-60 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                  {notifications.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-4">No hay notificaciones pendientes</p>
                  ) : (
                    notifications.map(notif => (
                      <div 
                        key={notif.id} 
                        className={`p-2.5 rounded-xl border transition-all ${
                          notif.read 
                            ? 'bg-slate-950/40 border-white/5 text-slate-400' 
                            : 'bg-cyan-500/10 border-cyan-500/30 text-slate-200 shadow-sm'
                        }`}
                      >
                        <p className="text-xs font-medium leading-relaxed">{notif.text}</p>
                        <span className="text-[9px] text-cyan-500/70 mt-1.5 block font-mono font-semibold">{notif.time}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile & Logout */}
          <div className="flex items-center gap-1.5 sm:gap-3 pl-1.5 sm:pl-3 border-l border-white/5">
            {candidatePhoto ? (
              <div className="relative group cursor-pointer w-8 h-8 sm:w-9 sm:h-9 shrink-0">
                <img
                  src={candidatePhoto}
                  alt={authUser?.name || "Usuario"}
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border-2 border-emerald-400 object-cover shadow-lg shadow-emerald-950/50 transition-all duration-300 group-hover:border-cyan-300"
                  onClick={() => fileInputRef.current?.click()}
                  loading="lazy"
                  decoding="async"
                  width={36}
                  height={36}
                />
                <div 
                  className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <span className="text-[7px] sm:text-[8px] text-cyan-300 font-black uppercase tracking-widest text-center leading-none">Subir</span>
                </div>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border-2 border-cyan-500/40 bg-white/5 hover:bg-white/10 text-cyan-300 hover:text-cyan-100 flex items-center justify-center font-black text-xs sm:text-sm tracking-wider shadow-lg transition-all shrink-0 cursor-pointer animate-pulse"
                title="Subir foto del candidato"
                aria-label="Perfil de usuario"
              >
                {getInitials(authUser?.name)}
              </button>
            )}

            <input
              type="file"
              ref={fileInputRef}
              onChange={handlePhotoUpload}
              accept="image/*"
              className="hidden"
            />
            <div className="hidden md:block text-left text-xs space-y-0.5">
              <div className="font-bold text-xs lg:text-sm text-slate-100 leading-tight truncate max-w-[120px] lg:max-w-[160px]">
                {authUser?.name || 'Usuario'}
              </div>
              <div className="text-[10px] lg:text-[11px] text-cyan-400 font-bold uppercase tracking-wider truncate max-w-[120px] lg:max-w-[160px]">
                {authUser?.role === 'superadmin' ? 'SUPERADMIN' : (authUser?.role || 'ADMIN').toUpperCase()}
              </div>
            </div>
            
            {onLogout && (
              <button
                onClick={onLogout}
                title="Cerrar Sesión"
                aria-label="Cerrar sesión"
                className="px-2 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 active:bg-rose-500/35 border border-rose-500/45 text-rose-300 hover:text-white transition-all cursor-pointer flex items-center gap-1.5 text-xs font-extrabold shadow-md shadow-rose-950/40 min-h-[36px]"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden xl:inline">Salir</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
