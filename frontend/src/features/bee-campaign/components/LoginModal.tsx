import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, 
  Sparkles, 
  X, 
  Brain, 
  MapPin, 
  DollarSign, 
  Vote, 
  ChevronRight,
  Shield,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Info,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { AuthUser, UserRole, ViewMode } from '../types';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: AuthUser, initialRoute?: ViewMode) => void;
  targetView?: ViewMode | null;
}

// Preset pre-configured demo personas with real roles
const PRESET_PERSONAS: Array<{
  id: string;
  name: string;
  cedula: string;
  email: string;
  role: UserRole;
  roleName: string;
  moduleName: string;
  badgeColor: string;
  icon: any;
  defaultView: ViewMode;
}> = [
  {
    id: 'USR-1001',
    name: 'Dra. María Paula Restrepo',
    cedula: '1085294312',
    email: 'admin.general@campanaganadora.co',
    role: 'superadmin',
    roleName: 'Superadministradora / Candidata',
    moduleName: 'Gestión Administrativa',
    badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    icon: ShieldCheck,
    defaultView: 'modulo_admin'
  }
];

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  targetView
}) => {
  if (!isOpen) return null;

  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showDemoDrawer, setShowDemoDrawer] = useState(false);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!emailInput.trim() || !passwordInput.trim()) {
      setErrorMsg('Por favor ingrese usuario/correo y contraseña.');
      return;
    }

    const matchedPersona = PRESET_PERSONAS.find(
      p => p.email.toLowerCase() === emailInput.trim().toLowerCase()
    );

    let expectedPassword = 'password123';
    if (matchedPersona) {
      if (matchedPersona.id === 'USR-1001' || matchedPersona.id === 'USR-1004') expectedPassword = 'admin2026';
      else if (matchedPersona.id === 'USR-1002') expectedPassword = 'estrategia2026';
      else if (matchedPersona.id === 'USR-1003') expectedPassword = 'operaciones2026';
      else if (matchedPersona.id === 'USR-1005') expectedPassword = 'testigo2026';
      else if (matchedPersona.id === 'USR-1006') expectedPassword = 'jurado2026';
    }

    if (matchedPersona && passwordInput === expectedPassword) {
      let isAllowed = true;
      if (targetView === 'modulo_admin') {
        isAllowed = ['superadmin', 'candidato', 'administrador'].includes(matchedPersona.role);
      } else if (targetView === 'primera_interfaz') {
        isAllowed = ['superadmin', 'candidato', 'coordinador_general_zona', 'administrador'].includes(matchedPersona.role);
      } else if (targetView === 'gestion_territorial') {
        isAllowed = ['superadmin', 'candidato', 'coordinador_general_zona', 'testigo_electoral', 'jurado_mesa'].includes(matchedPersona.role);
      }

      if (!isAllowed) {
        setErrorMsg(`El perfil de ${matchedPersona.name} no está autorizado para acceder a este módulo.`);
        return;
      }

      const getModuleNameFromTargetView = (view: ViewMode | null): string => {
        if (view === 'modulo_admin') return 'Gestión Administrativa';
        if (view === 'primera_interfaz') return 'Gestión Operativa';
        if (view === 'gestion_territorial') return 'Gestión Territorial';
        return '';
      };

      const finalModuleName = (targetView && getModuleNameFromTargetView(targetView)) || matchedPersona.moduleName;

      const user: AuthUser = {
        id: matchedPersona.id,
        name: matchedPersona.name,
        email: matchedPersona.email,
        cedula: matchedPersona.cedula,
        role: matchedPersona.role,
        roleName: matchedPersona.roleName,
        moduleName: finalModuleName,
        clientName: 'Campaña María Paula Restrepo 2026',
        clientId: 'CLI-2026-COL'
      };
      onLoginSuccess(user, targetView || matchedPersona.defaultView);
      onClose();
    } else {
      setErrorMsg('Usuario o contraseña incorrectos.');
    }
  };

  const filteredPersonas = PRESET_PERSONAS.filter(persona => {
    if (!targetView) return true;
    if (targetView === 'modulo_admin') {
      return ['superadmin', 'candidato', 'administrador'].includes(persona.role);
    }
    if (targetView === 'primera_interfaz') {
      return ['superadmin', 'candidato', 'coordinador_general_zona', 'administrador'].includes(persona.role);
    }
    if (targetView === 'gestion_territorial') {
      return ['superadmin', 'candidato', 'coordinador_general_zona', 'testigo_electoral', 'jurado_mesa'].includes(persona.role);
    }
    return true;
  });

  const getSubtitle = () => {
    if (!targetView) {
      return 'Selecciona uno de los perfiles para ingresar a la plataforma con los niveles de autorización RBAC correspondientes:';
    }
    if (targetView === 'modulo_admin') {
      return 'Selecciona un perfil autorizado para ingresar al Módulo de Gestión Administrativa:';
    }
    if (targetView === 'primera_interfaz') {
      return 'Selecciona un perfil autorizado para ingresar al Módulo de Gestión Operativa:';
    }
    if (targetView === 'gestion_territorial') {
      return 'Selecciona un perfil autorizado para ingresar al Módulo de Gestión Estratégica y Territorial:';
    }
    return 'Selecciona uno de los perfiles para ingresar a la plataforma:';
  };

  const handleSelectPersona = (persona: typeof PRESET_PERSONAS[0]) => {
    const getModuleNameFromTargetView = (view: ViewMode | null): string => {
      if (view === 'modulo_admin') return 'Gestión Administrativa';
      if (view === 'primera_interfaz') return 'Gestión Operativa';
      if (view === 'gestion_territorial') return 'Gestión Territorial';
      return '';
    };

    const finalModuleName = (targetView && getModuleNameFromTargetView(targetView)) || persona.moduleName;

    const user: AuthUser = {
      id: persona.id,
      name: persona.name,
      email: persona.email,
      cedula: persona.cedula,
      role: persona.role,
      roleName: persona.roleName,
      moduleName: finalModuleName,
      clientName: 'Campaña María Paula Restrepo 2026',
      clientId: 'CLI-2026-COL'
    };
    onLoginSuccess(user, targetView || persona.defaultView);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/85 pointer-events-auto"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ type: 'spring', stiffness: 350, damping: 30 }}
          className="relative w-full max-w-md bg-[#050c18] border border-cyan-500/25 rounded-3xl shadow-2xl shadow-[#020617]/90 p-6 sm:p-8 z-10 text-slate-100 flex flex-col overflow-y-auto max-h-[92vh]"
        >

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl bg-slate-900 border border-cyan-500/15 text-slate-400 hover:text-white transition-all cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center z-20"
            aria-label="Cerrar modal"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Header */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center mb-3">
              <Lock className="w-5 h-5 text-cyan-400 animate-pulse" />
            </div>
            <h2 className="text-xl font-black text-white tracking-wide">
              Firma Digital & Acceso RBAC
            </h2>
            <p className="text-[11px] text-slate-400 mt-2 max-w-xs leading-relaxed">
              Ingrese sus credenciales de seguridad. Este portal está protegido mediante políticas de control de acceso electoral.
            </p>
          </div>

          {/* Credential Login Form */}
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            {/* Username/Email Input */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Usuario / Correo Electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="ejemplo@campanaganadora.co"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-cyan-500/70 focus:ring-1 focus:ring-cyan-500/20 transition-all font-medium placeholder-slate-700"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Contraseña de Acceso
                </label>
                <a href="#reset" onClick={(e) => e.preventDefault()} className="text-[10px] text-cyan-400 hover:underline font-bold">
                  ¿Olvidó su contraseña?
                </a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-cyan-500/70 focus:ring-1 focus:ring-cyan-500/20 transition-all font-medium placeholder-slate-700"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-white cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember me check */}
            <div className="flex items-center gap-2 py-0.5">
              <input
                type="checkbox"
                id="remember"
                className="rounded border-slate-800 bg-slate-950 text-cyan-500 focus:ring-0 w-3.5 h-3.5 cursor-pointer"
              />
              <label htmlFor="remember" className="text-[11px] text-slate-400 cursor-pointer font-medium">
                Mantener sesión iniciada
              </label>
            </div>

            {errorMsg && (
              <div className="flex items-start gap-2 text-[11px] text-rose-400 font-bold bg-rose-950/20 border border-rose-900/40 p-3 rounded-xl">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-600 hover:brightness-110 hover:shadow-lg hover:shadow-cyan-500/10 text-white font-extrabold text-xs tracking-wide active:scale-[0.98] transition-all cursor-pointer border border-cyan-500/30"
            >
              Autenticar & Firmar Ingreso →
            </button>
          </form>

          {/* Test Credentials Collapsible Drawer */}
          <div className="mt-6 pt-4 border-t border-slate-800/80">
            <button
              type="button"
              onClick={() => setShowDemoDrawer(!showDemoDrawer)}
              className="w-full flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase tracking-widest hover:text-slate-400 cursor-pointer transition-all"
            >
              <span>Ver credenciales demo autorizadas ({filteredPersonas.length})</span>
              {showDemoDrawer ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            <AnimatePresence>
              {showDemoDrawer && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden mt-3 space-y-2 max-h-[160px] overflow-y-auto custom-scrollbar pr-1"
                >
                  <p className="text-[10px] text-slate-500 mb-1 leading-normal">
                    Haga clic en cualquier perfil demo para auto-completar los campos de entrada:
                  </p>
                  {filteredPersonas.map((persona) => {
                    const pass = (persona.id === 'USR-1001' || persona.id === 'USR-1004') ? 'admin2026' : 
                                 (persona.id === 'USR-1002') ? 'estrategia2026' : 
                                 (persona.id === 'USR-1003') ? 'operaciones2026' : 
                                 (persona.id === 'USR-1005') ? 'testigo2026' : 'jurado2026';
                    return (
                      <div
                        key={persona.id}
                        onClick={() => {
                          setEmailInput(persona.email);
                          setPasswordInput(pass);
                          setErrorMsg(null);
                        }}
                        className="p-2 rounded-xl bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-between gap-2 cursor-pointer text-left"
                      >
                        <div>
                          <div className="text-[10px] font-bold text-white leading-tight">
                            {persona.name}
                          </div>
                          <div className="text-[9px] text-slate-400 mt-0.5">
                            {persona.roleName}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-[9px] font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-800/40 px-2 py-0.5 rounded">
                            {persona.role}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
