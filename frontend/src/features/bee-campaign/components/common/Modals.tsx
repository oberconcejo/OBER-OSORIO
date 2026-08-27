import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { E14Record, CalendarEvent, BankTransaction, UserRole } from '../../types';
import { X, Check, Sparkles, UploadCloud, ShieldCheck, AlertCircle, Plus, Calendar as CalendarIcon, Crown, UserCheck, Eye, Trash2, UserPlus, Users, Search, Award, MapPin, CheckSquare, Shield } from 'lucide-react';

// iOS Spring Physics Configuration
const iosModalSpring = {
  type: 'spring' as const,
  stiffness: 380,
  damping: 32,
  mass: 0.85
};

export interface UserRoleAccount {
  id: string;
  name: string;
  email: string;
  cargo: string;
  role: UserRole;
  ip?: string;
  estado: string;
}

interface ModalsProps {
  activeModal: string | null;
  onClose: () => void;
  selectedE14?: E14Record | null;
  onAddCalendarEvent?: (event: CalendarEvent) => void;
  onAddTransaction?: (tx: BankTransaction) => void;
  onConfirmOCRScan?: (scannedData: { proveedora: string; monto: number; fecha: string }) => void;
}

export const Modals: React.FC<ModalsProps> = ({
  activeModal,
  onClose,
  selectedE14,
  onAddCalendarEvent,
  onAddTransaction,
  onConfirmOCRScan
}) => {
  // Calendar Event State
  const [eventDate, setEventDate] = useState('18 Nov');
  const [eventTitle, setEventTitle] = useState('');
  const [eventType, setEventType] = useState('Campaña');

  // Transaction State
  const [txDesc, setTxDesc] = useState('');
  const [txMonto, setTxMonto] = useState('');
  const [txCat, setTxCat] = useState<'Ingresos' | 'Operaciones' | 'Personal' | 'Eventos' | 'Publicidad'>('Operaciones');

  // OCR Simulator state
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<{ proveedor: string; monto: number; fecha: string } | null>(null);

  // RBAC Users State (Allows adding multiple Super Usuarios, Administradores, and Auditores)
  const [rbacUsers, setRbacUsers] = useState<UserRoleAccount[]>([
    {
      id: 'usr_1',
      name: 'Santiago Pérez',
      email: 'santiago.perez@campana.ai',
      cargo: 'Director Técnico Root',
      role: 'superadmin',
      ip: '190.157.22.10',
      estado: 'Activo'
    },
    {
      id: 'usr_2',
      name: 'Soporte Root System',
      email: 'root@campana.ai',
      cargo: 'Infraestructura Cloud Global',
      role: 'superadmin',
      ip: '10.0.0.1',
      estado: 'Activo'
    },
    {
      id: 'usr_3',
      name: 'Admin General - Javier',
      email: 'admin@campana.ai',
      cargo: 'Coordinador General de Operaciones',
      role: 'administrador',
      ip: '186.116.45.88',
      estado: 'Activo'
    },
    {
      id: 'usr_4',
      name: 'Carlos Ramírez',
      email: 'carlos.ramirez@campana.ai',
      cargo: 'Administrador Zonal',
      role: 'administrador',
      ip: '200.21.14.05',
      estado: 'Activo'
    },
    {
      id: 'usr_5',
      name: 'Dra. Elena Rostova',
      email: 'elena.rostova@auditoria.org',
      cargo: 'Auditora Externa de Cumplimiento',
      role: 'auditor',
      ip: '186.116.45.99',
      estado: 'Activo'
    },
    {
      id: 'usr_6',
      name: 'Oficina Control Interno',
      email: 'auditoria@campana.ai',
      cargo: 'Inspector de Seguridad de Datos',
      role: 'auditor',
      ip: '190.157.22.88',
      estado: 'Activo'
    }
  ]);

  // Form State for Adding New User
  const [showAddUserForm, setShowAddUserForm] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserCargo, setNewUserCargo] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('administrador');
  const [filterRole, setFilterRole] = useState<'all' | UserRole>('all');
  const [userSuccessMessage, setUserSuccessMessage] = useState<string | null>(null);

  const roleLabelsMap: Record<UserRole, string> = {
    superadmin: 'Super Usuario (Root)',
    administrador: 'Administrador',
    auditor: 'Auditor',
    candidato: 'Candidato',
    coordinador_general_zona: 'Coordinador General de Zona',
    coordinador_zona: 'Coordinador de Zona',
    coordinador_puesto: 'Coordinador de Puesto',
    lider_zonal_senior: 'Líder Zonal Senior',
    lider: 'Líder',
    lider_barrio_vereda: 'Líder de Barrio / Vereda',
    puntero_territorial: 'Puntero Territorial',
    testigo_electoral: 'Testigo Electoral',
    jurado_mesa: 'Jurado de Mesa',
    estrategico: 'Estratégico / Asesor',
    territorial: 'Territorial / Brigadista'
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) return;

    const newUser: UserRoleAccount = {
      id: 'usr_' + Date.now(),
      name: newUserName.trim(),
      email: newUserEmail.trim(),
      cargo: newUserCargo.trim() || roleLabelsMap[newUserRole],
      role: newUserRole,
      ip: '192.168.1.' + Math.floor(Math.random() * 200 + 10),
      estado: 'Activo'
    };

    setRbacUsers(prev => [newUser, ...prev]);

    setUserSuccessMessage(`¡Usuario ${newUser.name} agregado como ${roleLabelsMap[newUser.role]}!`);
    setTimeout(() => setUserSuccessMessage(null), 4000);

    // Reset Form
    setNewUserName('');
    setNewUserEmail('');
    setNewUserCargo('');
    setShowAddUserForm(false);
  };

  const handleDeleteUser = (id: string) => {
    setRbacUsers(prev => prev.filter(u => u.id !== id));
  };

  const handleRoleChange = (id: string, newRole: UserRole) => {
    setRbacUsers(prev => prev.map(u => u.id === id ? { ...u, role: newRole } : u));
  };

  const filteredUsers = filterRole === 'all' 
    ? rbacUsers 
    : rbacUsers.filter(u => u.role === filterRole);

  const superAdminCount = rbacUsers.filter(u => u.role === 'superadmin').length;
  const adminCount = rbacUsers.filter(u => u.role === 'administrador').length;
  const auditorCount = rbacUsers.filter(u => u.role === 'auditor').length;

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle.trim()) return;
    if (onAddCalendarEvent) {
      onAddCalendarEvent({
        id: 'ev_' + Date.now(),
        date: eventDate,
        title: eventTitle,
        type: eventType
      });
    }
    onClose();
  };

  const handleCreateTx = (e: React.FormEvent) => {
    e.preventDefault();
    if (!txDesc.trim() || !txMonto) return;
    if (onAddTransaction) {
      onAddTransaction({
        id: 'tx_' + Date.now(),
        fecha: new Date().toLocaleDateString('es-ES'),
        descripcion: txDesc,
        categoria: txCat,
        monto: parseFloat(txMonto),
        estado: 'Completado'
      });
    }
    onClose();
  };

  const handleSimulateOCR = () => {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      setScanResult({
        proveedor: 'Imprenta Electoral Central S.A.',
        monto: -3450.00,
        fecha: '15/10/2024'
      });
    }, 2000);
  };

  return (
    <AnimatePresence>
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 md:p-6 overflow-hidden select-none">
          {/* Glassmorphism Backdrop Overlay with Dismissible Click */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            onClick={onClose}
            aria-hidden="true"
            className="absolute inset-0 bg-black/75 backdrop-blur-xl cursor-pointer"
          />

          {/* Modal Container Card with iOS Spring, Drag-to-Dismiss, Glassmorphism & Stacking */}
          <motion.div
            initial={{ y: '100%', opacity: 0, scale: 0.94 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: '100%', opacity: 0, scale: 0.94 }}
            transition={iosModalSpring}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0.05, bottom: 0.65 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 100 || info.velocity.y > 400) {
                onClose();
              }
            }}
            className="relative z-10 bg-[#040e1e]/95 border border-cyan-500/35 rounded-2xl sm:rounded-3xl max-w-lg md:max-w-xl lg:max-w-2xl w-[96vw] sm:w-full text-slate-100 p-3.5 sm:p-6 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] backdrop-blur-2xl overflow-hidden max-h-[92vh] flex flex-col pointer-events-auto"
          >
            {/* iOS Tactile Drag Pill Handle */}
            <div className="w-12 h-1.5 bg-slate-500/50 hover:bg-slate-300 rounded-full mx-auto mb-2.5 sm:mb-3 cursor-grab active:cursor-grabbing shrink-0 transition-colors" />

            {/* Close Button */}
            <button
              onClick={onClose}
              aria-label="Cerrar ventana modal"
              className="absolute top-3 right-3 sm:top-4 sm:right-4 text-slate-400 hover:text-white p-2 rounded-xl hover:bg-cyan-500/20 active:bg-cyan-500/30 transition-all cursor-pointer z-20 min-h-[40px] min-w-[40px] flex items-center justify-center"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Scrollable Content Container */}
            <div className="overflow-y-auto pr-1 flex-1 custom-scrollbar">

        {/* Modal: RBAC & User Roles Management */}
        {activeModal === 'user_roles' && (
          <div className="space-y-4 max-h-[85vh] overflow-y-auto pr-1">
            <div className="flex items-center justify-between border-b border-cyan-500/30 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-cyan-300">
                    Gestión de Usuarios, Roles y Aislamiento (RBAC)
                  </h3>
                  <p className="text-[11px] text-slate-300">
                    Administre múltiples Super Usuarios, Administradores y Auditores
                  </p>
                </div>
              </div>
            </div>

            {/* Success Toast */}
            {userSuccessMessage && (
              <div className="bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 p-2.5 rounded-xl text-xs flex items-center gap-2 animate-fadeIn">
                <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{userSuccessMessage}</span>
              </div>
            )}

            {/* Counters Badge Row */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-amber-950/40 border border-amber-500/30 p-2 rounded-xl">
                <div className="text-[10px] text-amber-300/80 font-bold flex items-center justify-center gap-1">
                  <Crown className="w-3 h-3 text-amber-400" /> Super Usuarios
                </div>
                <div className="text-base font-black text-amber-300 mt-0.5">{superAdminCount}</div>
              </div>

              <div className="bg-cyan-950/40 border border-cyan-500/30 p-2 rounded-xl">
                <div className="text-[10px] text-cyan-300/80 font-bold flex items-center justify-center gap-1">
                  <UserCheck className="w-3 h-3 text-cyan-400" /> Administradores
                </div>
                <div className="text-base font-black text-cyan-300 mt-0.5">{adminCount}</div>
              </div>

              <div className="bg-emerald-950/40 border border-emerald-500/30 p-2 rounded-xl">
                <div className="text-[10px] text-emerald-300/80 font-bold flex items-center justify-center gap-1">
                  <Eye className="w-3 h-3 text-emerald-400" /> Auditores
                </div>
                <div className="text-base font-black text-emerald-300 mt-0.5">{auditorCount}</div>
              </div>
            </div>

            {/* Filter Tabs and Add Button */}
            <div className="flex items-center justify-between gap-2 pt-1">
              <div className="flex gap-1 bg-slate-900/80 p-1 rounded-xl border border-cyan-500/20 text-[11px]">
                <button
                  type="button"
                  onClick={() => setFilterRole('all')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all ${filterRole === 'all' ? 'bg-cyan-500/30 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                  Todos ({rbacUsers.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterRole('superadmin')}
                  className={`px-2 py-1 rounded-lg font-bold transition-all ${filterRole === 'superadmin' ? 'bg-amber-500/30 text-amber-300' : 'text-slate-400 hover:text-amber-300'}`}
                >
                  Super
                </button>
                <button
                  type="button"
                  onClick={() => setFilterRole('administrador')}
                  className={`px-2 py-1 rounded-lg font-bold transition-all ${filterRole === 'administrador' ? 'bg-cyan-500/30 text-cyan-300' : 'text-slate-400 hover:text-cyan-300'}`}
                >
                  Admin
                </button>
                <button
                  type="button"
                  onClick={() => setFilterRole('auditor')}
                  className={`px-2 py-1 rounded-lg font-bold transition-all ${filterRole === 'auditor' ? 'bg-emerald-500/30 text-emerald-300' : 'text-slate-400 hover:text-emerald-300'}`}
                >
                  Auditor
                </button>
              </div>

              <button
                type="button"
                onClick={() => setShowAddUserForm(!showAddUserForm)}
                className="px-3 py-1.5 bg-emerald-500 text-slate-950 font-black text-xs rounded-xl shadow hover:bg-emerald-400 transition-all flex items-center gap-1.5 shrink-0"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>{showAddUserForm ? 'Cancelar' : '+ Agregar Usuario'}</span>
              </button>
            </div>

            {/* Add User Form */}
            {showAddUserForm && (
              <form onSubmit={handleAddUser} className="bg-slate-900/90 border border-emerald-500/40 p-3.5 rounded-2xl space-y-3">
                <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2">
                  <h4 className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                    <UserPlus className="w-4 h-4 text-emerald-400" />
                    Registrar Nuevo Usuario en el Sistema
                  </h4>
                  <span className="text-[10px] text-slate-400">Asignación Inmediata</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-300 mb-1">Nombre Completo *</label>
                    <input
                      type="text"
                      required
                      value={newUserName}
                      onChange={(e) => setNewUserName(e.target.value)}
                      placeholder="Ej. Ing. Mateo Gomez"
                      className="w-full bg-slate-950 border border-cyan-500/30 rounded-xl px-2.5 py-1.5 text-white focus:outline-none focus:border-emerald-400"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-300 mb-1">Correo Electrónico *</label>
                    <input
                      type="email"
                      required
                      value={newUserEmail}
                      onChange={(e) => setNewUserEmail(e.target.value)}
                      placeholder="ejemplo@campana.ai"
                      className="w-full bg-slate-950 border border-cyan-500/30 rounded-xl px-2.5 py-1.5 text-white focus:outline-none focus:border-emerald-400"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-300 mb-1">Cargo / Descripción</label>
                    <input
                      type="text"
                      value={newUserCargo}
                      onChange={(e) => setNewUserCargo(e.target.value)}
                      placeholder="Ej. Director Zonal Norte"
                      className="w-full bg-slate-950 border border-cyan-500/30 rounded-xl px-2.5 py-1.5 text-white focus:outline-none focus:border-emerald-400"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-300 mb-1">Perfil / Rol Asignado *</label>
                    <select
                      value={newUserRole}
                      onChange={(e) => setNewUserRole(e.target.value as any)}
                      className="w-full bg-slate-950 border border-cyan-500/30 rounded-xl px-2.5 py-1.5 text-white focus:outline-none focus:border-emerald-400 font-medium"
                    >
                      <option value="superadmin">👑 Super Usuario (Root)</option>
                      <option value="administrador">👤 Administrador (Operativo)</option>
                      <option value="auditor">👁️ Auditor (Cumplimiento)</option>
                      <option value="candidato">🎗️ Candidato (Liderazgo Político)</option>
                      <option value="coordinador_general_zona">📍 Coordinador General de Zona</option>
                      <option value="coordinador_zona">🗺️ Coordinador de Zona</option>
                      <option value="coordinador_puesto">🏫 Coordinador de Puesto</option>
                      <option value="lider_zonal_senior">⭐ Líder Zonal Senior</option>
                      <option value="lider">👥 Líder Territorial</option>
                      <option value="lider_barrio_vereda">🏡 Líder de Barrio / Vereda</option>
                      <option value="puntero_territorial">🚩 Puntero Territorial</option>
                      <option value="testigo_electoral">🛡️ Testigo Electoral</option>
                      <option value="jurado_mesa">⚖️ Jurado de Mesa</option>
                      <option value="estrategico">📊 Director Estratégico</option>
                      <option value="territorial">🚀 Coordinador de Campo</option>
                    </select>
                  </div>
                </div>

                <div className="pt-1 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddUserForm(false)}
                    className="px-3 py-1 bg-slate-800 text-slate-300 text-xs rounded-xl hover:bg-slate-700"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl shadow hover:bg-emerald-400"
                  >
                    Guardar Nuevo Usuario
                  </button>
                </div>
              </form>
            )}

            {/* Users List with Dynamic Roles */}
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {filteredUsers.length === 0 ? (
                <div className="p-4 text-center text-slate-400 text-xs bg-slate-900/60 rounded-xl border border-dashed border-cyan-500/20">
                  No hay usuarios registrados con el perfil seleccionado.
                </div>
              ) : (
                filteredUsers.map((usr) => {
                  const roleConfigs: Record<UserRole, { border: string; badge: string; label: string; icon: React.ReactNode }> = {
                    superadmin: {
                      border: 'border-amber-500/40 bg-amber-950/20',
                      badge: 'bg-amber-500/20 text-amber-300 border-amber-400/30',
                      label: 'Super Usuario (Root)',
                      icon: <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    },
                    administrador: {
                      border: 'border-cyan-500/40 bg-cyan-950/20',
                      badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-400/30',
                      label: 'Administrador',
                      icon: <UserCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    },
                    auditor: {
                      border: 'border-emerald-500/40 bg-emerald-950/20',
                      badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30',
                      label: 'Auditor',
                      icon: <Eye className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    },
                    candidato: {
                      border: 'border-purple-500/40 bg-purple-950/20',
                      badge: 'bg-purple-500/20 text-purple-300 border-purple-400/30',
                      label: 'Candidato',
                      icon: <Award className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    },
                    coordinador_general_zona: {
                      border: 'border-blue-500/40 bg-blue-950/20',
                      badge: 'bg-blue-500/20 text-blue-300 border-blue-400/30',
                      label: 'Coordinador General de Zona',
                      icon: <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    },
                    coordinador_zona: {
                      border: 'border-blue-500/40 bg-blue-950/20',
                      badge: 'bg-blue-500/20 text-blue-300 border-blue-400/30',
                      label: 'Coordinador de Zona',
                      icon: <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    },
                    coordinador_puesto: {
                      border: 'border-blue-500/40 bg-blue-950/20',
                      badge: 'bg-blue-500/20 text-blue-300 border-blue-400/30',
                      label: 'Coordinador de Puesto',
                      icon: <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    },
                    lider_zonal_senior: {
                      border: 'border-teal-500/40 bg-teal-950/20',
                      badge: 'bg-teal-500/20 text-teal-300 border-teal-400/30',
                      label: 'Líder Zonal Senior',
                      icon: <Users className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                    },
                    lider: {
                      border: 'border-teal-500/40 bg-teal-950/20',
                      badge: 'bg-teal-500/20 text-teal-300 border-teal-400/30',
                      label: 'Líder',
                      icon: <Users className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                    },
                    lider_barrio_vereda: {
                      border: 'border-teal-500/40 bg-teal-950/20',
                      badge: 'bg-teal-500/20 text-teal-300 border-teal-400/30',
                      label: 'Líder de Barrio / Vereda',
                      icon: <Users className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                    },
                    puntero_territorial: {
                      border: 'border-amber-500/40 bg-amber-950/20',
                      badge: 'bg-amber-500/20 text-amber-300 border-amber-400/30',
                      label: 'Puntero Territorial',
                      icon: <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    },
                    testigo_electoral: {
                      border: 'border-rose-500/40 bg-rose-950/20',
                      badge: 'bg-rose-500/20 text-rose-300 border-rose-400/30',
                      label: 'Testigo Electoral',
                      icon: <Shield className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    },
                    jurado_mesa: {
                      border: 'border-indigo-500/40 bg-indigo-950/20',
                      badge: 'bg-indigo-500/20 text-indigo-300 border-indigo-400/30',
                      label: 'Jurado de Mesa',
                      icon: <CheckSquare className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    },
                    estrategico: {
                      border: 'border-emerald-500/40 bg-emerald-950/20',
                      badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30',
                      label: 'Estratégico / Asesor',
                      icon: <UserCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    },
                    territorial: {
                      border: 'border-cyan-500/40 bg-cyan-950/20',
                      badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-400/30',
                      label: 'Territorial / Brigadista',
                      icon: <UserCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    }
                  };

                  const cfg = roleConfigs[usr.role] || roleConfigs.administrador;

                  return (
                    <div key={usr.id} className={`flex items-center justify-between p-2.5 rounded-xl border ${cfg.border} text-xs transition-all`}>
                      <div className="space-y-0.5">
                        <div className="font-bold text-white flex items-center gap-2">
                          {usr.name}
                          <span className={`px-2 py-0.5 rounded-full border text-[10px] font-semibold flex items-center gap-1 ${cfg.badge}`}>
                            {cfg.icon}
                            {cfg.label}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-300">
                          {usr.cargo} • <span className="text-cyan-300/80">{usr.email}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Selector to change role on the fly */}
                        <select
                          value={usr.role}
                          onChange={(e) => handleRoleChange(usr.id, e.target.value as any)}
                          className="bg-slate-950 text-slate-200 border border-cyan-500/30 rounded-lg text-[10px] px-2 py-1 focus:outline-none focus:border-cyan-400"
                        >
                          <option value="superadmin">Root</option>
                          <option value="administrador">Admin</option>
                          <option value="auditor">Auditor</option>
                          <option value="candidato">Candidato</option>
                          <option value="coordinador_general_zona">Coord. General Zona</option>
                          <option value="coordinador_zona">Coord. Zona</option>
                          <option value="coordinador_puesto">Coord. Puesto</option>
                          <option value="lider_zonal_senior">Líder Zonal Senior</option>
                          <option value="lider">Líder</option>
                          <option value="lider_barrio_vereda">Líder Barrio/Vereda</option>
                          <option value="puntero_territorial">Puntero Territorial</option>
                          <option value="testigo_electoral">Testigo Electoral</option>
                          <option value="jurado_mesa">Jurado de Mesa</option>
                        </select>

                        <button
                          type="button"
                          onClick={() => handleDeleteUser(usr.id)}
                          title="Eliminar usuario"
                          className="p-1 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <button
              onClick={onClose}
              className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-xs rounded-xl cursor-pointer hover:brightness-110 shadow-lg"
            >
              Guardar Configuración de Permisos ({rbacUsers.length} Usuarios)
            </button>
          </div>
        )}

        {/* Modal: New Calendar Event */}
        {activeModal === 'add_event' && (
          <form onSubmit={handleCreateEvent} className="space-y-4">
            <h3 className="text-lg font-bold text-cyan-300 flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-emerald-400" />
              Nuevo Evento Electoral
            </h3>
            <p className="text-xs text-slate-300">
              Agregar un hito o reunión al calendario oficial de campaña.
            </p>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Fecha</label>
              <input
                type="text"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                placeholder="ej: 18 Nov"
                className="w-full bg-slate-900 border border-cyan-500/30 rounded-xl px-3 py-2 text-xs text-white"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Título del Evento</label>
              <input
                type="text"
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                placeholder="ej: Cierre de Gira Distrito 3"
                className="w-full bg-slate-900 border border-cyan-500/30 rounded-xl px-3 py-2 text-xs text-white"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Categoría</label>
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                className="w-full bg-slate-900 border border-cyan-500/30 rounded-xl px-3 py-2 text-xs text-white"
              >
                <option value="Electoral">Electoral</option>
                <option value="Campaña">Campaña</option>
                <option value="Medios">Medios</option>
                <option value="Territorial">Territorial</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg cursor-pointer hover:brightness-110"
            >
              Guardar Evento
            </button>
          </form>
        )}

        {/* Modal: AI OCR Document Scanner */}
        {activeModal === 'ocr_scanner' && (
          <div className="space-y-4 text-center">
            <h3 className="text-lg font-bold text-cyan-300 flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5 text-teal-400" />
              Lectura Inteligente de Facturas (AI OCR)
            </h3>

            {!scanResult ? (
              <div className="border-2 border-dashed border-cyan-500/40 rounded-2xl p-6 bg-slate-900/60">
                <UploadCloud className="w-12 h-12 text-cyan-400 mx-auto mb-2 animate-bounce" />
                <p className="text-xs font-semibold text-slate-200">
                  Arrastra tu factura o haz clic para escanear
                </p>
                <p className="text-[10px] text-slate-400 mt-1">
                  Gemini extrae automáticamente proveedor, valor total, impuestos y fechas.
                </p>

                <button
                  onClick={handleSimulateOCR}
                  disabled={scanning}
                  className="mt-4 px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-teal-600 text-white rounded-xl text-xs font-bold cursor-pointer hover:brightness-110"
                >
                  {scanning ? 'Escaneando con IA...' : 'Iniciar Escaneo Simulado'}
                </button>
              </div>
            ) : (
              <div className="space-y-3 bg-emerald-950/60 border border-emerald-500/40 p-4 rounded-2xl text-left">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                  <Check className="w-5 h-5" />
                  Factura Procesada con Éxito
                </div>
                <div className="text-xs space-y-1 text-slate-200">
                  <p><strong>Proveedor:</strong> {scanResult.proveedor}</p>
                  <p><strong>Monto Extraído:</strong> ${Math.abs(scanResult.monto).toLocaleString()}</p>
                  <p><strong>Fecha:</strong> {scanResult.fecha}</p>
                </div>

                <button
                  onClick={() => {
                    if (onAddTransaction) {
                      onAddTransaction({
                        id: 'tx_ocr_' + Date.now(),
                        fecha: scanResult.fecha,
                        descripcion: scanResult.proveedor,
                        categoria: 'Publicidad',
                        monto: scanResult.monto,
                        estado: 'Completado'
                      });
                    }
                    onClose();
                  }}
                  className="w-full py-2 bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Registrar en Contabilidad
                </button>
              </div>
            )}
          </div>
        )}

        {/* Modal: E-14 Electoral Inspector */}
        {activeModal === 'e14_detail' && selectedE14 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-cyan-500/20 pb-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <h3 className="text-base font-bold text-cyan-300">
                Inspección de Acta {selectedE14.id}
              </h3>
            </div>

            <div className="bg-slate-900/80 p-3 rounded-xl border border-cyan-500/20 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Puesto Electoral:</span>
                <span className="font-bold text-white">{selectedE14.puesto}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Mesa:</span>
                <span className="font-bold text-white">{selectedE14.mesa}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Votos Registrados:</span>
                <span className="font-bold text-emerald-400">{selectedE14.votosRegistrados || 350}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Estado OCR:</span>
                <span className="font-bold text-cyan-300">{selectedE14.ocrStatus}</span>
              </div>
            </div>

            <div className="p-3 bg-amber-950/40 border border-amber-500/30 rounded-xl text-xs text-amber-200">
              <p className="font-bold mb-1 flex items-center gap-1">
                <AlertCircle className="w-4 h-4 text-amber-400" />
                Verificación de Integridad de Acta E-14
              </p>
              <p className="text-[11px] opacity-90">
                La firma digital y huella del jurado fueron escaneadas y validadas contra la base oficial de testigos.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="flex-1 py-2 bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl cursor-pointer"
              >
                Aprobar Acta E-14
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-2 bg-slate-800 text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        )}

        {/* Modal: New Transaction */}
        {activeModal === 'add_tx' && (
          <form onSubmit={handleCreateTx} className="space-y-4">
            <h3 className="text-base font-bold text-cyan-300">Nuevo Movimiento Bancario</h3>
            
            <div>
              <label className="text-xs text-slate-300 block mb-1">Descripción</label>
              <input
                type="text"
                value={txDesc}
                onChange={(e) => setTxDesc(e.target.value)}
                placeholder="ej: Pago de sonido para mitin"
                className="w-full bg-slate-900 border border-cyan-500/30 rounded-xl px-3 py-2 text-xs text-white"
                required
              />
            </div>

            <div>
              <label className="text-xs text-slate-300 block mb-1">Monto (negativo para gasto, positivo para ingreso)</label>
              <input
                type="number"
                value={txMonto}
                onChange={(e) => setTxMonto(e.target.value)}
                placeholder="ej: -1500"
                className="w-full bg-slate-900 border border-cyan-500/30 rounded-xl px-3 py-2 text-xs text-white"
                required
              />
            </div>

            <div>
              <label className="text-xs text-slate-300 block mb-1">Categoría</label>
              <select
                value={txCat}
                onChange={(e) => setTxCat(e.target.value as any)}
                className="w-full bg-slate-900 border border-cyan-500/30 rounded-xl px-3 py-2 text-xs text-white"
              >
                <option value="Operaciones">Operaciones</option>
                <option value="Ingresos">Ingresos</option>
                <option value="Personal">Personal</option>
                <option value="Publicidad">Publicidad</option>
                <option value="Eventos">Eventos</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg cursor-pointer"
            >
              Guardar Transacción
            </button>
          </form>
        )}

            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
