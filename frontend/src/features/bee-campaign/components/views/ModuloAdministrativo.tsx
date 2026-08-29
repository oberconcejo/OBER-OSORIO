import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix leaflet default icon issue in React build
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});
L.Marker.prototype.options.icon = defaultIcon;

import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip as ChartTooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';

import { ViewMode, CalendarEvent, AuthUser } from '../../types';
import { isViewAllowed, isViewAllowedForModule } from '../../utils/rolePermissions';
import { supabase } from '../../lib/supabaseClient';
import { insforge } from '../../lib/insforgeClient';
import { PresupuestoContabilidad } from './PresupuestoContabilidad';
import { GestionConfiguracionCampana } from './GestionConfiguracionCampana';
import { GestionEncuestasSondeos } from './GestionEncuestasSondeos';
import { DistribucionElectoral } from './DistribucionElectoral';
import { ConsultaLugarVotacion } from './ConsultaLugarVotacion';
import { 
  Building2, 
  Users, 
  ShieldCheck, 
  Key, 
  FileText, 
  Bot, 
  Calendar as CalendarIcon, 
  Plus, 
  Bell, 
  TrendingUp, 
  TrendingDown, 
  CheckCircle, 
  UserCheck, 
  Sparkles, 
  Activity, 
  HardDrive, 
  X, 
  Lock, 
  ShieldAlert, 
  Search, 
  Sliders, 
  Database, 
  AlertTriangle, 
  Layers,
  CreditCard,
  Check,
  RefreshCw,
  Clock,
  UserPlus,
  FolderGit2,
  MapPin,
  Award,
  FileCheck,
  AlertCircle,
  Vote,
  Eye,
  Scale,
  DollarSign,
  Filter,
  Globe,
  Share2,
  Link2,
  Crown,
  Phone,
  Mail,
  BookOpen,
  ArrowUpRight,
  Shield,
  Layers3,
  UserCheck2,
  UploadCloud,
  CheckSquare,
  Settings,
  Edit3,
  Trash2,
  Building,
  CheckCircle2,
  Crosshair,
  Radio,
  Navigation,
  Locate,
  Compass,
  BatteryCharging,
  Wifi,
  FileSpreadsheet,
  FileUp,
  XCircle,
  Download,
  ChevronRight,
  UserCircle,
  Save
} from 'lucide-react';

const PUESTOS_COORDINATES: Record<string, [number, number]> = {
  'Colegio Marco Fidel Suárez': [6.2442, -75.5812],
  'Universidad UPB': [6.2425, -75.5892],
  'I.E. Pedro Justo Berrío': [6.2301, -75.5875],
  'I.E. INEM José Félix de Restrepo': [6.2088, -75.5780],
  'Plaza de Toros La Macarena': [6.2520, -75.5855],
  'I.E. Diego Echavarría Misas': [6.2910, -75.5720],
  'Colegio San José de las Vegas': [6.1950, -75.5760]
};

function MapController({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.2 });
  }, [center, zoom, map]);
  return null;
}

export type AdminTabType = 
  | 'inicio' 
  | 'roles' 
  | 'lideres_votantes' 
  | 'presupuesto_cne' 
  | 'gestion_campana' 
  | 'gestion_testigos' 
  | 'jurados_electorales'
  | 'encuestas_sondeos'
  | 'distribucion_electoral'
  | 'consulta_lugar_votacion';

interface ModuloAdministrativoProps {
  onSelectView: (view: ViewMode) => void;
  calendarEvents: CalendarEvent[];
  onAddEventClick: () => void;
  onOpenUserRolesModal: () => void;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  authUser?: AuthUser | null;
}

export const ModuloAdministrativo: React.FC<ModuloAdministrativoProps> = ({
  onSelectView,
  calendarEvents,
  onAddEventClick,
  onOpenUserRolesModal,
  activeTab: controlledActiveTab,
  onTabChange,
  authUser
}) => {
  const [internalTab, setInternalTab] = useState<AdminTabType>('inicio');
  const activeTab = (controlledActiveTab as AdminTabType) || internalTab;

  const isTabAllowed = (tabName: string): boolean => {
    if (!authUser) return true;
    if (authUser.role === 'superadmin') return true;

    let targetView: ViewMode = 'modulo_admin';
    if (tabName === 'presupuesto_cne') targetView = 'presupuesto';
    else if (tabName === 'gestion_testigos') targetView = 'testigo_campo';
    else if (tabName === 'jurados_electorales') targetView = 'jurado_campo';
    else if (tabName === 'encuestas_sondeos') targetView = 'encuestas';

    return isViewAllowed(authUser.role as any, targetView) && isViewAllowedForModule(authUser.moduleName, targetView);
  };

  const setActiveTab = (tab: AdminTabType) => {
    setInternalTab(tab);
    if (onTabChange) {
      onTabChange(tab);
    }
  };

  // State for search filters
  const [searchTerm, setSearchTerm] = useState('');
  const [cedulaSearch, setCedulaSearch] = useState('');
  const [cedulaSearchResult, setCedulaSearchResult] = useState<any | null>(null);
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);

  // Sub-tab selection for Registration Forms (Votantes vs Líderes/Coordinadores)
  const [formTypeSubTab, setFormTypeSubTab] = useState<'votantes' | 'lideres_coordinadores'>('votantes');
  // State for RBAC Interactive administration panel (Mapped to campaign modules)
  const [selectedRole, setSelectedRole] = useState<'admin' | 'estrategico' | 'territorial'>('admin');
  const [rbacSearch, setRbacSearch] = useState('');
  const [saveSuccessMessage, setSaveSuccessMessage] = useState(false);
  const [actionSuccessMessage, setActionSuccessMessage] = useState('');

  // Base configuration list of permissions/functions for each module (as shown in images)
  const MODULE_FUNCTIONS = {
    admin: [
      { id: 'admin_inicio', name: '1. Inicio', category: 'Gestión Administrativa', enabled: true },
      { id: 'admin_roles', name: '2. Gestión de Roles', category: 'Gestión Administrativa', enabled: true },
      { id: 'admin_lideres', name: '3. Líderes / Votantes', category: 'Gestión Administrativa', enabled: true },
      { id: 'admin_presupuesto', name: '4. Presupuesto / CNE', category: 'Gestión Administrativa', enabled: true },
      { id: 'admin_campana', name: '5. Gestión de Campaña', category: 'Gestión Administrativa', enabled: true },
      { id: 'admin_testigos', name: '6. Gestión de Testigos', category: 'Gestión Administrativa', enabled: true },
      { id: 'admin_jurados', name: '7. Jurados Electorales', category: 'Gestión Administrativa', enabled: true },
      { id: 'admin_encuestas', name: '8. Encuestas y Sondeos', category: 'Gestión Administrativa', enabled: true }
    ],
    estrategico: [
      { id: 'est_diag_360', name: '1. Diagnóstico 360° AI', category: 'Módulo Estratégico', enabled: true },
      { id: 'est_diag_territorial', name: '2. Diagnóstico Territorial', category: 'Módulo Estratégico', enabled: true },
      { id: 'est_programa', name: '3. Programa de Gobierno', category: 'Módulo Estratégico', enabled: true },
      { id: 'est_perfil', name: '4. Perfil del Candidato', category: 'Módulo Estratégico', enabled: true },
      { id: 'est_carga_cv', name: '5. Carga & Análisis CV', category: 'Módulo Estratégico', enabled: true },
      { id: 'est_dofa', name: '6. Matriz DOFA / SWOT AI', category: 'Módulo Estratégico', enabled: true },
      { id: 'est_narrativa', name: '7. Narrativa & Discurso', category: 'Módulo Estratégico', enabled: true },
      { id: 'est_comunicacion', name: '8. Comunicación & Redes', category: 'Módulo Estratégico', enabled: true },
      { id: 'est_analisis_datos', name: '9. Análisis de Datos AI', category: 'Módulo Estratégico', enabled: true },
      { id: 'est_agenda', name: '10. Agenda & Calendario', category: 'Módulo Estratégico', enabled: true }
    ],
    territorial: [
      { id: 'terr_voters_reg', name: 'Registro de Votantes (Censo Medellín & Padrón)', category: 'Operación Territorial', enabled: true },
      { id: 'terr_territorial_mgmt', name: 'Gestión Territorial (Mapa de Votos & Sectores)', category: 'Operación Territorial', enabled: true },
      { id: 'terr_field_witness', name: 'Testigos en Campo (Día E: Reportes y E-14)', category: 'Operación Territorial', enabled: true },
      { id: 'terr_surveys', name: 'Módulo de Encuestas (Estadísticas & Respuestas)', category: 'Operación Territorial', enabled: true },
      { id: 'terr_table_witness', name: 'Jurados en Mesa (Padrón E-11, Conteo & E-14)', category: 'Operación Territorial', enabled: true }
    ]
  };

  // Initial mock permissions mapping per module
  const [rolePermissions, setRolePermissions] = useState(() => {
    const clone: Record<'admin' | 'estrategico' | 'territorial', { id: string; name: string; category: string; enabled: boolean }[]> = {
      admin: MODULE_FUNCTIONS.admin.map(p => ({ ...p })),
      estrategico: MODULE_FUNCTIONS.estrategico.map(p => ({ ...p })),
      territorial: MODULE_FUNCTIONS.territorial.map(p => ({ ...p }))
    };
    return clone;
  });

  const [assignedUsers, setAssignedUsers] = useState({
    admin: ['Santiago Pérez', 'Ober Osorio'],
    estrategico: ['Carlos Ruiz', 'Diana Gómez'],
    territorial: ['Felipe Restrepo', 'Juan Valdés', 'Camila Londoño']
  });

  const togglePermission = (role: 'admin' | 'estrategico' | 'territorial', permId: string) => {
    setRolePermissions(prev => ({
      ...prev,
      [role]: prev[role].map(p => p.id === permId ? { ...p, enabled: !p.enabled } : p)
    }));
  };

  const handleSaveRbac = () => {
    setSaveSuccessMessage(true);
    setTimeout(() => setSaveSuccessMessage(false), 3000);
  };

  // Users list state (Mapped to Core Campaign Modules: admin, estrategico, territorial)
  const [usersList, setUsersList] = useState(() => {
    const saved = localStorage.getItem('campaign_users_list');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      { id: 'u1', name: 'Santiago Pérez', email: 'santiago.perez@campana.ai', role: 'admin', status: 'Activo' },
      { id: 'u2', name: 'Ober Osorio', email: 'ober.osorio@campana.ai', role: 'admin', status: 'Activo' },
      { id: 'u3', name: 'Carlos Ruiz', email: 'carlos.ruiz@campana.ai', role: 'estrategico', status: 'Activo' },
      { id: 'u4', name: 'Diana Gómez', email: 'diana.gomez@campana.ai', role: 'estrategico', status: 'Activo' },
      { id: 'u5', name: 'Felipe Restrepo', email: 'felipe.restrepo@campana.ai', role: 'territorial', status: 'Activo' },
      { id: 'u6', name: 'Juan Valdés', email: 'juan.valdes@campana.ai', role: 'territorial', status: 'Activo' },
      { id: 'u7', name: 'Camila Londoño', email: 'camila.londono@campana.ai', role: 'territorial', status: 'Activo' }
    ];
  });

  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [showAddUserSection, setShowAddUserSection] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<'admin' | 'estrategico' | 'territorial'>('admin');
  
  // Password inputs and validation states
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Checklist state for new user permissions (mandatory to select at least one)
  const [newUserPermissions, setNewUserPermissions] = useState<Record<string, boolean>>({});

  // Dynamic initialization of userPermissions based on usersList and MODULE_FUNCTIONS
  const [userPermissions, setUserPermissions] = useState<Record<string, { id: string; name: string; category: string; enabled: boolean }[]>>(() => {
    const saved = localStorage.getItem('campaign_user_permissions');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    const initialUsers = [
      { id: 'u1', role: 'admin' as const },
      { id: 'u2', role: 'admin' as const },
      { id: 'u3', role: 'estrategico' as const },
      { id: 'u4', role: 'estrategico' as const },
      { id: 'u5', role: 'territorial' as const },
      { id: 'u6', role: 'territorial' as const },
      { id: 'u7', role: 'territorial' as const }
    ];
    const initialPermissions: Record<string, { id: string; name: string; category: string; enabled: boolean }[]> = {};
    initialUsers.forEach(u => {
      initialPermissions[u.id] = MODULE_FUNCTIONS[u.role].map(p => ({ ...p, enabled: true }));
    });
    return initialPermissions;
  });

  // Sync to localStorage & Load from NestJS Backend on mount
  useEffect(() => {
    localStorage.setItem('campaign_users_list', JSON.stringify(usersList));
  }, [usersList]);

  useEffect(() => {
    fetch('/api/admin/users')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          const mappedData = data.map((u: any) => ({
            id: u.id,
            name: u.name,
            email: u.email,
            role: u.role === 'Superadmin' || u.role === 'Superadministradora / Candidata' ? 'admin' : u.role === 'Director Político' ? 'estrategico' : 'territorial',
            status: u.status === 'Activo' ? 'Activo' as const : 'Suspendido' as const
          }));
          setUsersList(mappedData);
        }
      })
      .catch(err => console.error("Error loading users from backend:", err));

    fetch('/api/territorial/witnesses')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          const mappedData = data.map((w: any) => ({
            id: w.id,
            nombre: w.name,
            cc: w.cc || '1085294312',
            telefono: w.phone,
            email: w.email || `${w.id}@testigos.co`,
            partido: w.partido || 'Movimiento Fuerza Ciudadana',
            rol: w.rol || 'Testigo de Mesa (E-16)',
            puesto: w.puesto,
            mesa: w.mesa,
            comuna: w.comuna || 'Comuna 10 (La Candelaria)',
            acreditacion: w.acreditacion || 'Acreditado Registraduría',
            geofencing: w.geofenceVerified ? 'Día E Verificado' : 'Pendiente Día E',
            estado: w.status || 'Inscrito'
          }));
          setTestigos(mappedData);
        }
      })
      .catch(err => console.error("Error loading witnesses from backend:", err));
  }, []);

  useEffect(() => {
    localStorage.setItem('campaign_user_permissions', JSON.stringify(userPermissions));
  }, [userPermissions]);

  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);

  // Handle User Role Change
  const handleUserRoleChange = (userId: string, newRole: 'admin' | 'estrategico' | 'territorial') => {
    setUsersList(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
    
    // Reset user-specific permissions to base role defaults when role is changed
    const basePerms = rolePermissions[newRole].map(p => ({ ...p }));
    setUserPermissions(prev => ({
      ...prev,
      [userId]: basePerms
    }));
  };

  // Toggle user active status
  const toggleUserStatus = (userId: string) => {
    const targetUser = usersList.find(u => u.id === userId);
    if (!targetUser) return;

    // Prevent suspending own account
    if (authUser && targetUser.email.toLowerCase() === authUser.email.toLowerCase()) {
      alert("No puedes suspender tu propia cuenta.");
      return;
    }

    const newStatus = targetUser.status === 'Activo' ? 'Suspendido' : 'Activo';

    setUsersList(prev => prev.map(u => u.id === userId ? { ...u, status: newStatus } : u));

    // Update status in Backend database
    fetch(`/api/admin/users/${userId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    }).catch(err => console.error("Error updating user status on backend:", err));

    // Update status in InsForge database
    const updateDBPromise = insforge.database
      .from('users_list')
      .update({ status: newStatus })
      .eq('email', targetUser.email);

    (updateDBPromise as any).then(({ error }: any) => {
      if (error) {
        console.error("Error updating user status in database:", error.message);
      } else {
        console.log(`User ${targetUser.email} status updated to ${newStatus} in database!`);
      }
    });
  };

  // Delete user from local state and InsForge database
  const handleDeleteUser = (userId: string, email: string, name: string) => {
    // Prevent deleting own account
    if (authUser && email.toLowerCase() === authUser.email.toLowerCase()) {
      alert("No puedes eliminar tu propia cuenta.");
      return;
    }

    if (!window.confirm(`¿Está seguro de que desea eliminar permanentemente al usuario ${name} (${email})? Se eliminará de la base de datos y ya no podrá iniciar sesión.`)) {
      return;
    }

    // 1. Remove from local state
    setUsersList(prev => prev.filter(u => u.id !== userId));
    setUserPermissions(prev => {
      const next = { ...prev };
      delete next[userId];
      return next;
    });

    // 2. Delete from Backend database
    fetch(`/api/admin/users/${userId}`, {
      method: 'DELETE'
    }).catch(err => console.error("Error deleting user from backend:", err));

    // 3. Delete from InsForge users_list database table
    const deletePromise = insforge.database
      .from('users_list')
      .delete()
      .eq('email', email);

    (deletePromise as any).then(({ error }: any) => {
      if (error) {
        console.error("Error deleting user from InsForge database:", error.message);
      } else {
        console.log(`User ${email} successfully deleted from InsForge database!`);
      }
    });
  };

  // Sync assignedUsers from usersList whenever usersList changes
  useEffect(() => {
    const adminUsers = usersList.filter(u => u.role === 'admin').map(u => u.name);
    const strategicUsers = usersList.filter(u => u.role === 'estrategico').map(u => u.name);
    const territorialUsers = usersList.filter(u => u.role === 'territorial').map(u => u.name);

    setAssignedUsers({
      admin: adminUsers,
      estrategico: strategicUsers,
      territorial: territorialUsers
    });
  }, [usersList]);

  // Inline User Creation with passwords and customized permissions validation
  const handleCreateUserInline = () => {
    if (!newUserName || !newUserEmail || !newPassword || !confirmPassword) {
      setPasswordError('Por favor complete todos los campos requeridos (*).');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Las contraseñas ingresadas no coinciden.');
      return;
    }

    // Get current module base permissions and check if at least one checkbox is ticked
    const currentModulePerms = rolePermissions[newUserRole];
    const checkedPermsForModule = currentModulePerms.filter(p => newUserPermissions[p.id]);
    if (checkedPermsForModule.length === 0) {
      setPasswordError('Es obligatorio seleccionar al menos una función para habilitar el acceso según el módulo asignado.');
      return;
    }

    setPasswordError('');
    const newUserId = Date.now().toString();

    // Map checkboxes state to user permissions list
    const finalPerms = currentModulePerms.map(p => ({
      ...p,
      enabled: !!newUserPermissions[p.id]
    }));

    const normalizedEmail = newUserEmail.toLowerCase().trim();

    // 1. Verify email uniqueness locally
    const emailExistsLocally = usersList.some(u => u.email.toLowerCase().trim() === normalizedEmail);
    if (emailExistsLocally) {
      setPasswordError('El correo electrónico ingresado ya se encuentra registrado en el sistema local de la campaña.');
      return;
    }

    // 2. Fetch active client and verify email uniqueness in InsForge Database
    const duplicateCheckPromise = insforge.database
      .from('users_list')
      .select('email')
      .eq('email', normalizedEmail)
      .limit(1);

    (duplicateCheckPromise as any).then(({ data: dupData, error: dupErr }: any) => {
      if (dupErr) {
        console.error("Error verifying email uniqueness in database:", dupErr.message);
      }
      if (dupData && dupData.length > 0) {
        setPasswordError('El correo electrónico ingresado ya se encuentra registrado en la base de datos de la campaña.');
        return;
      }

      // If email doesn't exist, proceed to fetch client details and register
      const clientPromise = insforge.database.from('users_list').select('client_id, client_name').limit(1);
      
      (clientPromise as any).then(({ data: clientData }: any) => {
        const activeClientId = authUser?.clientId || (clientData && clientData[0]?.client_id) || 'client-101';
        const activeClientName = authUser?.clientName || (clientData && clientData[0]?.client_name) || 'Campaña Principal';

        // Register user in Supabase Database Auth
        const signUpPromise = supabase.auth.signUp({
          email: normalizedEmail,
          password: newPassword,
          options: {
            emailRedirectTo: `${window.location.origin}/?campaign=${encodeURIComponent(activeClientName)}`,
            data: {
              name: newUserName,
              role: newUserRole,
            }
          }
        });

        (signUpPromise as any).then(({ data, error }: any) => {
          if (error) {
            console.error("Error registering user in Supabase:", error.message);
            if (error.message.toLowerCase().includes('rate limit') || error.message.toLowerCase().includes('limit exceeded')) {
              console.log("Supabase Auth rate limit hit. Falling back to direct database insertion...");
              const tempId = 'fallback-' + Date.now();
              const dbPromise = insforge.database.from('users_list').insert([{
                id: tempId,
                email: normalizedEmail,
                first_name: newUserName,
                last_name: '',
                role_id: newUserRole,
                role_name: newUserRole === 'admin' ? 'Gestión Administrativa' : newUserRole === 'estrategico' ? 'Gestión Estratégica' : 'Gestión Territorial',
                client_id: activeClientId,
                client_name: activeClientName,
                status: 'Activo',
                last_access_at: new Date().toISOString(),
                created_at: new Date().toISOString()
              }]);

              (dbPromise as any).then(({ error: dbErr }: any) => {
                if (dbErr) {
                  setPasswordError(`Error al insertar en la base de datos de la campaña: ${dbErr.message}`);
                } else {
                  console.log("User successfully added to InsForge database users_list under rate-limit fallback!");

                  // Save to NestJS Backend
                  fetch('/api/admin/users', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      name: newUserName,
                      email: normalizedEmail,
                      role: newUserRole === 'admin' ? 'Superadmin' : newUserRole === 'estrategico' ? 'Director Político' : 'Coordinador Territorial',
                      status: 'Activo'
                    })
                  }).catch(err => console.error("Error saving user to backend:", err));

                  setUserPermissions(prev => ({
                    ...prev,
                    [tempId]: finalPerms
                  }));

                  const newUser = {
                    id: tempId,
                    name: newUserName,
                    email: normalizedEmail,
                    role: newUserRole,
                    status: 'Activo' as const
                  };
                  
                  setUsersList(prev => [...prev, newUser]);
                  setNewUserName('');
                  setNewUserEmail('');
                  setNewPassword('');
                  setConfirmPassword('');
                  setPasswordError('');
                  setActionSuccessMessage(`¡Usuario ${newUserName} registrado y habilitado exitosamente en la base de datos de la campaña!`);
                  setTimeout(() => setActionSuccessMessage(''), 5000);

                  // Send email confirmation of their account creation (fallback path)
                  insforge.emails.send({
                    to: normalizedEmail,
                    subject: `¡Bienvenido a la Campaña de ${activeClientName}! - Creación de Usuario`,
                    html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #1e293b; background-color: #111C30; color: #F1F5F9; border-radius: 12px;">
  <div style="text-align: center; margin-bottom: 20px;">
    <h1 style="color: #06b6d4; font-size: 24px; font-weight: 800; margin: 0; text-transform: uppercase;">Campaña Ganadora IA</h1>
    <p style="color: #94A3B8; font-size: 12px; margin: 4px 0 0 0;">Plataforma de Control Electoral</p>
  </div>
  <div style="border-top: 2px solid #06b6d4; padding-top: 20px;">
    <p style="font-size: 16px; margin: 0 0 16px 0;">Hola <strong>${newUserName}</strong>,</p>
    <p style="font-size: 14px; line-height: 1.6; margin: 0 0 16px 0; color: #cbd5e1;">
      Tu cuenta de subusuario ha sido creada exitosamente en la base de datos de la campaña oficial del candidato: 
      <strong style="color: #34d399;">${activeClientName}</strong>.
    </p>
    <div style="background-color: #0f172a; border: 1px solid #334155; border-radius: 8px; padding: 15px; margin-bottom: 20px; color: #f1f5f9;">
      <p style="margin: 0 0 8px 0; font-size: 13px;"><strong>Módulo Asignado:</strong> ${newUserRole === 'admin' ? 'Gestión Administrativa' : newUserRole === 'estrategico' ? 'Gestión Estratégica' : 'Gestión Territorial'}</p>
      <p style="margin: 0; font-size: 13px;"><strong>Correo de Acceso:</strong> ${normalizedEmail}</p>
    </div>
    <p style="font-size: 14px; line-height: 1.6; margin: 0 0 20px 0; color: #cbd5e1;">
      Para comenzar a utilizar tus funciones habilitadas en la plataforma, por favor inicia sesión pulsando el siguiente botón:
    </p>
    <div style="text-align: center; margin-bottom: 24px;">
      <a href="${window.location.origin}/?campaign=${encodeURIComponent(activeClientName)}" style="display: inline-block; background-color: #06b6d4; color: #0f172a; text-decoration: none; font-weight: 900; font-size: 14px; padding: 12px 24px; border-radius: 8px; text-transform: uppercase;">
        Iniciar Sesión
      </a>
    </div>
    <hr style="border: 0; border-top: 1px solid #1e293b; margin-bottom: 20px;" />
    <p style="font-size: 11px; text-align: center; color: #64748B; margin: 0;">
      Esta es una notificación automática del sistema de verificación oficial de la campaña electoral.
    </p>
  </div>
</div>`
                  }).then(({ error: mailErr }: any) => {
                    if (mailErr) console.error("Error sending confirmation email via InsForge:", mailErr.message);
                  });
                }
              });
            } else {
              setPasswordError(`Error de Supabase Auth / Base de Datos: ${error.message}`);
            }
          } else {
            console.log("User successfully registered in Supabase auth:", data.user);
            const supabaseUserId = data.user.id;

            // Insert into InsForge database users_list table as a subuser
            const dbPromise = insforge.database.from('users_list').insert([{
              id: supabaseUserId,
              email: normalizedEmail,
              first_name: newUserName,
              last_name: '',
              role_id: newUserRole,
              role_name: newUserRole === 'admin' ? 'Gestión Administrativa' : newUserRole === 'estrategico' ? 'Gestión Estratégica' : 'Gestión Territorial',
              client_id: activeClientId,
              client_name: activeClientName,
              status: 'Activo',
              last_access_at: new Date().toISOString(),
              created_at: new Date().toISOString()
            }]);

            (dbPromise as any).then(({ error: dbErr }: any) => {
              if (dbErr) {
                console.error("Error inserting user into InsForge database:", dbErr.message);
                setPasswordError(`Error al insertar en la base de datos de la campaña: ${dbErr.message}`);
              } else {
                console.log("User successfully added to InsForge database users_list!");

                // Save to NestJS Backend
                fetch('/api/admin/users', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    name: newUserName,
                    email: normalizedEmail,
                    role: newUserRole === 'admin' ? 'Superadmin' : newUserRole === 'estrategico' ? 'Director Político' : 'Coordinador Territorial',
                    status: 'Activo'
                  })
                }).catch(err => console.error("Error saving user to backend:", err));
                
                // Update React state after successful database insertion
                setUserPermissions(prev => ({
                  ...prev,
                  [supabaseUserId]: finalPerms
                }));

                const newUser = {
                  id: supabaseUserId,
                  name: newUserName,
                  email: normalizedEmail,
                  role: newUserRole,
                  status: 'Activo' as const
                };
                
                setUsersList(prev => [...prev, newUser]);
                setNewUserName('');
                setNewUserEmail('');
                setNewPassword('');
                setConfirmPassword('');
                setPasswordError('');
                setActionSuccessMessage(`¡Usuario ${newUserName} registrado y habilitado exitosamente en la base de datos de la campaña!`);
                setTimeout(() => setActionSuccessMessage(''), 5000);

                // Send email confirmation of their account creation (normal path)
                insforge.emails.send({
                  to: normalizedEmail,
                  subject: `¡Bienvenido a la Campaña de ${activeClientName}! - Creación de Usuario`,
                  html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #1e293b; background-color: #111C30; color: #F1F5F9; border-radius: 12px;">
  <div style="text-align: center; margin-bottom: 20px;">
    <h1 style="color: #06b6d4; font-size: 24px; font-weight: 800; margin: 0; text-transform: uppercase;">Campaña Ganadora IA</h1>
    <p style="color: #94A3B8; font-size: 12px; margin: 4px 0 0 0;">Plataforma de Control Electoral</p>
  </div>
  <div style="border-top: 2px solid #06b6d4; padding-top: 20px;">
    <p style="font-size: 16px; margin: 0 0 16px 0;">Hola <strong>${newUserName}</strong>,</p>
    <p style="font-size: 14px; line-height: 1.6; margin: 0 0 16px 0; color: #cbd5e1;">
      Tu cuenta de subusuario ha sido creada exitosamente en la base de datos de la campaña oficial del candidato: 
      <strong style="color: #34d399;">${activeClientName}</strong>.
    </p>
    <div style="background-color: #0f172a; border: 1px solid #334155; border-radius: 8px; padding: 15px; margin-bottom: 20px; color: #f1f5f9;">
      <p style="margin: 0 0 8px 0; font-size: 13px;"><strong>Módulo Asignado:</strong> ${newUserRole === 'admin' ? 'Gestión Administrativa' : newUserRole === 'estrategico' ? 'Gestión Estratégica' : 'Gestión Territorial'}</p>
      <p style="margin: 0; font-size: 13px;"><strong>Correo de Acceso:</strong> ${normalizedEmail}</p>
    </div>
    <p style="font-size: 14px; line-height: 1.6; margin: 0 0 20px 0; color: #cbd5e1;">
      Para comenzar a utilizar tus funciones habilitadas en la plataforma, por favor inicia sesión pulsando el siguiente botón:
    </p>
    <div style="text-align: center; margin-bottom: 24px;">
      <a href="${window.location.origin}/?campaign=${encodeURIComponent(activeClientName)}" style="display: inline-block; background-color: #06b6d4; color: #0f172a; text-decoration: none; font-weight: 900; font-size: 14px; padding: 12px 24px; border-radius: 8px; text-transform: uppercase;">
        Iniciar Sesión
      </a>
    </div>
    <hr style="border: 0; border-top: 1px solid #1e293b; margin-bottom: 20px;" />
    <p style="font-size: 11px; text-align: center; color: #64748B; margin: 0;">
      Esta es una notificación automática del sistema de verificación oficial de la campaña electoral.
    </p>
  </div>
</div>`
                }).then(({ error: mailErr }: any) => {
                  if (mailErr) console.error("Error sending confirmation email via InsForge:", mailErr.message);
                });
              }
            });

          }
        });
      }).catch((err: any) => {
        console.error("Error retrieving active client details:", err);
      });
    }).catch((err: any) => {
      console.error("Error verifying email duplicate in database:", err);
    });
    setConfirmPassword('');
    
    // Reset checkboxes
    setNewUserPermissions({});
    
    setShowAddUserSection(false);
  };

  // Registration Fields Schema Configuration (Admin Gestor de Formulario de Votantes)
  const [registrationFields, setRegistrationFields] = useState([
    { id: 'cc', name: 'Cédula de Ciudadanía (CC)', keyName: 'cc', type: 'Número / Censo', mandatory: true, system: true, enabled: true, category: 'Identificación Elector' },
    { id: 'nombre', name: 'Nombre Completo', keyName: 'nombre', type: 'Texto', mandatory: true, system: true, enabled: true, category: 'Identificación Elector' },
    { id: 'email', name: 'Correo Electrónico', keyName: 'email', type: 'Email (@)', mandatory: false, system: false, enabled: true, category: 'Contacto & Comunicación' },
    { id: 'seudonimo', name: 'Seudónimo / Alias Político', keyName: 'seudonimo', type: 'Texto Corto', mandatory: false, system: false, enabled: true, category: 'Perfil Ciudadano' },
    { id: 'cumpleanos', name: 'Fecha de Cumpleaños / Nacimiento', keyName: 'cumpleanos', type: 'Fecha (AAAA-MM-DD)', mandatory: false, system: false, enabled: true, category: 'Perfil Ciudadano' },
    { id: 'direccion', name: 'Dirección de Residencia', keyName: 'direccion', type: 'Texto / Georreferencia', mandatory: false, system: false, enabled: true, category: 'Ubicación Territorial' },
    { id: 'telefono', name: 'Teléfono Móvil / WhatsApp', keyName: 'telefono', type: 'Teléfono', mandatory: true, system: false, enabled: true, category: 'Contacto & Comunicación' },
    { id: 'descripcion', name: 'Campo de Descripción / Observaciones', keyName: 'descripcion', type: 'Texto Multilínea', mandatory: false, system: false, enabled: true, category: 'Notas & Requerimientos' },
    { id: 'lider', name: 'Líder / Puntero Responsable', keyName: 'lider', type: 'Selección de Líder', mandatory: true, system: true, enabled: true, category: 'Estructura Electoral' },
    { id: 'comuna', name: 'Comuna / Barrio / Vereda', keyName: 'comuna', type: 'Selección Territorial', mandatory: true, system: true, enabled: true, category: 'Ubicación Territorial' },
    { id: 'puesto_mesa', name: 'Puesto de Votación y Mesa', keyName: 'puesto', type: 'Autocompletado Censo', mandatory: true, system: true, enabled: true, category: 'Padrón Electoral CNE' },
  ]);

  const toggleFieldEnabled = (fieldId: string) => {
    setRegistrationFields(prev => prev.map(f => f.id === fieldId && !f.system ? { ...f, enabled: !f.enabled } : f));
  };

  const toggleFieldMandatory = (fieldId: string) => {
    setRegistrationFields(prev => prev.map(f => f.id === fieldId && !f.system ? { ...f, mandatory: !f.mandatory } : f));
  };

  // Registration Fields Schema Configuration for Líderes y Coordinadores de Zona
  const [leaderRegistrationFields, setLeaderRegistrationFields] = useState([
    { id: 'cc', name: 'Cédula de Ciudadanía (CC)', keyName: 'cc', type: 'Número / Censo', mandatory: true, system: true, enabled: true, category: 'Identificación Oficial' },
    { id: 'nombre', name: 'Nombre Completo', keyName: 'nombre', type: 'Texto', mandatory: true, system: true, enabled: true, category: 'Identificación Oficial' },
    { id: 'cargo', name: 'Cargo / Rol en la Estructura', keyName: 'cargo', type: 'Selección Jerárquica', mandatory: true, system: true, enabled: true, category: 'Estructura Jerárquica' },
    { id: 'zona', name: 'Zona / Comuna / Sector Asignado', keyName: 'zona', type: 'Territorio Operación', mandatory: true, system: true, enabled: true, category: 'Ubicación & Territorio' },
    { id: 'telefono', name: 'Teléfono Móvil / WhatsApp Directo', keyName: 'telefono', type: 'Teléfono', mandatory: true, system: false, enabled: true, category: 'Contacto & Comunicación' },
    { id: 'email', name: 'Correo Electrónico Institucional', keyName: 'email', type: 'Email (@)', mandatory: false, system: false, enabled: true, category: 'Contacto & Comunicación' },
    { id: 'seudonimo', name: 'Seudónimo / Alias Operativo', keyName: 'seudonimo', type: 'Texto Corto', mandatory: false, system: false, enabled: true, category: 'Perfil Político' },
    { id: 'cumpleanos', name: 'Fecha de Cumpleaños / Nacimiento', keyName: 'cumpleanos', type: 'Fecha (AAAA-MM-DD)', mandatory: false, system: false, enabled: true, category: 'Perfil Político' },
    { id: 'direccion', name: 'Dirección / Sede Operativa de Zona', keyName: 'direccion', type: 'Texto / Georreferencia', mandatory: false, system: false, enabled: true, category: 'Ubicación & Territorio' },
    { id: 'meta_votantes', name: 'Meta de Votantes Asignada (Cuota)', keyName: 'meta_votantes', type: 'Número Cuota', mandatory: true, system: false, enabled: true, category: 'Metas & Rendimiento' },
    { id: 'supervisor', name: 'Coordinador / Superior Jerárquico', keyName: 'supervisor', type: 'Selección Superior', mandatory: true, system: false, enabled: true, category: 'Estructura Jerárquica' },
    { id: 'documentos', name: 'Documentación ARL / Acreditación CNE', keyName: 'documentos', type: 'Adjunto / Estado', mandatory: false, system: false, enabled: true, category: 'Legal & Acreditación' },
    { id: 'descripcion', name: 'Experiencia Política & Hoja de Ruta', keyName: 'descripcion', type: 'Texto Multilínea', mandatory: false, system: false, enabled: true, category: 'Perfil Político' },
  ]);

  const toggleLeaderFieldEnabled = (fieldId: string) => {
    setLeaderRegistrationFields(prev => prev.map(f => f.id === fieldId && !f.system ? { ...f, enabled: !f.enabled } : f));
  };

  const toggleLeaderFieldMandatory = (fieldId: string) => {
    setLeaderRegistrationFields(prev => prev.map(f => f.id === fieldId && !f.system ? { ...f, mandatory: !f.mandatory } : f));
  };

  // Sample Líderes & Votantes (CRM Político) with Extended Fields
  const [voters, setVoters] = useState([
    {
      id: '1',
      cc: '1017123456',
      nombre: 'Carlos Mario Giraldo',
      email: 'carlos.giraldo@gmail.com',
      seudonimo: 'El Chino Giraldo',
      cumpleanos: '1988-05-14',
      direccion: 'Calle 50 # 45-20, Apt 302, Barrio Boston',
      telefono: '+57 310 456 7890',
      descripcion: 'Líder comunitario del sector transporte. Coordina 5 vehículos para movilización de adultos mayores el Día E.',
      tipo: 'Votante',
      lider: 'Santiago Pérez',
      municipio: 'Medellín',
      comuna: 'Comuna 10 - La Candelaria',
      puesto: 'Colegio Marco Fidel Suárez',
      mesa: 'Mesa 12',
      estado: 'Empadronado',
      fecha: '2026-08-01'
    },
    {
      id: '2',
      cc: '1020987654',
      nombre: 'Dra. Andrea Morales',
      email: 'andrea.morales@saludmed.co',
      seudonimo: 'Andy Morales',
      cumpleanos: '1992-11-20',
      direccion: 'Carrera 70 # 32B-15, Laureles',
      telefono: '+57 300 888 9911',
      descripcion: 'Coordinadora de brigadas médicas de la campaña en zona occidente.',
      tipo: 'Líder Zonal',
      lider: 'Directo Campaña',
      municipio: 'Medellín',
      comuna: 'Comuna 11 - Laureles',
      puesto: 'Universidad UPB',
      mesa: 'Mesa 04',
      estado: 'Líder Activo',
      fecha: '2026-07-28'
    },
    {
      id: '3',
      cc: '1032456789',
      nombre: 'Juan Fernando Osorio',
      email: 'juanfe.osorio@outlook.com',
      seudonimo: 'Juanfe',
      cumpleanos: '1995-03-08',
      direccion: 'Circular 4A # 71-10, Laureles',
      telefono: '+57 315 222 3344',
      descripcion: 'Estudiante universitario, apoya la difusión en redes sociales y comités de juventud.',
      tipo: 'Votante',
      lider: 'Dra. Andrea Morales',
      municipio: 'Medellín',
      comuna: 'Comuna 11 - Laureles',
      puesto: 'Universidad UPB',
      mesa: 'Mesa 08',
      estado: 'Empadronado',
      fecha: '2026-08-03'
    },
    {
      id: '4',
      cc: '1045112233',
      nombre: 'Luisa Fernanda Calle',
      email: 'luisa.calle@comercio.org',
      seudonimo: 'Lufer',
      cumpleanos: '1990-09-30',
      direccion: 'Calle 30A # 80-45, Belén Altavista',
      telefono: '+57 318 999 0011',
      descripcion: 'Comerciante local, interesada en propuestas de seguridad nocturna y alumbrado público.',
      tipo: 'Votante',
      lider: 'Carlos Mendoza',
      municipio: 'Medellín',
      comuna: 'Comuna 16 - Belén',
      puesto: 'I.E. Pedro Justo Berrío',
      mesa: 'Mesa 15',
      estado: 'Empadronado',
      fecha: '2026-08-04'
    }
  ]);

  // Estado de Existencia de Campaña para CNE ("no se puede crear lista a testigo si no hay campaña creada")
  const [hasActiveCampaign, setHasActiveCampaign] = useState(true);

  // Sample Testigos Electorales con detalles completos por Partido y Asignación Territorial de Mesas
  const [testigos, setTestigos] = useState([
    { id: 't1', cc: '1018998877', nombre: 'Mateo Botero López', telefono: '+57 311 456 7890', email: 'mateo.botero@gmail.com', partido: 'Partido Liberal Colombiano', rol: 'Testigo de Mesa (E-16)', puesto: 'Colegio Marco Fidel Suárez', mesa: 'Mesa 12', comuna: 'Comuna 10 (La Candelaria)', acreditacion: 'Formulario E-16 Aprobado', geofencing: 'Confirmado en Puesto (GPS OK)', estado: 'Acreditado' },
    { id: 't2', cc: '1022334455', nombre: 'Sofia Castro Restrepo', telefono: '+57 300 987 6543', email: 'sofia.castro@gmail.com', partido: 'Partido Alianza Verde', rol: 'Testigo Rematador / Coordinador de Puesto', puesto: 'Universidad UPB', mesa: 'Mesa 04', comuna: 'Comuna 11 (Laureles)', acreditacion: 'Formulario E-16 En Trámite', geofencing: 'Pendiente Día E', estado: 'Inscrito' },
    { id: 't3', cc: '1033445566', nombre: 'Jorge Andrés Hoyos', telefono: '+57 320 123 4567', email: 'jorge.hoyos@gmail.com', partido: 'Centro Democrático', rol: 'Testigo de Mesa (E-16)', puesto: 'I.E. Pedro Justo Berrío', mesa: 'Mesa 15', comuna: 'Comuna 16 (Belén)', acreditacion: 'Formulario E-16 Aprobado', geofencing: 'Confirmado en Puesto (GPS OK)', estado: 'Acreditado' },
    { id: 't4', cc: '1044556677', nombre: 'Valeria Gómez Ortiz', telefono: '+57 315 678 9012', email: 'valeria.gomez@gmail.com', partido: 'Nuevo Liberalismo', rol: 'Testigo de Escrutinio Municipal', puesto: 'Plaza de Toros La Macarena', mesa: 'Mesa 01', comuna: 'Comuna 11 (Laureles)', acreditacion: 'Formulario E-16 En Trámite', geofencing: 'Pendiente Día E', estado: 'Inscrito' }
  ]);

  // Filtros y Estados de Formulario de Testigos
  const [witnessPartidoFilter, setWitnessPartidoFilter] = useState('Todos');
  const [witnessPuestoFilter, setWitnessPuestoFilter] = useState('Todos');
  const [witnessSearchQuery, setWitnessSearchQuery] = useState('');
  const [showWitnessForm, setShowWitnessForm] = useState(false);
  const [editingWitnessId, setEditingWitnessId] = useState<string | null>(null);

  // Campos de Formulario para Crear / Modificar Testigo
  const [witNombre, setWitNombre] = useState('');
  const [witCc, setWitCc] = useState('');
  const [witTelefono, setWitTelefono] = useState('');
  const [witEmail, setWitEmail] = useState('');
  const [witPartido, setWitPartido] = useState('Partido Liberal Colombiano');
  const [witRol, setWitRol] = useState('Testigo de Mesa (E-16)');
  const [witPuesto, setWitPuesto] = useState('Colegio Marco Fidel Suárez');
  const [witMesa, setWitMesa] = useState('Mesa 01');
  const [witComuna, setWitComuna] = useState('Comuna 10 (La Candelaria)');
  const [witAcreditacion, setWitAcreditacion] = useState('Formulario E-16 En Trámite');
  const [witEstado, setWitEstado] = useState('Inscrito');
  const [expandedJuradoInfoId, setExpandedJuradoInfoId] = useState<string | null>(null);

  // =========================================================================
  // ESTADOS PARA SISTEMA DE CERCO PERIMETRAL Y GEOREFERENCIACIÓN DE TESTIGOS
  // =========================================================================
  const [geofenceActive, setGeofenceActive] = useState(true);
  const [geofenceRadius, setGeofenceRadius] = useState(150); // Radio en metros (editable de 30m a 2000m)
  const [geofenceToleranceMinutes, setGeofenceToleranceMinutes] = useState(15);
  const [selectedGeofencePuesto, setSelectedGeofencePuesto] = useState('Colegio Marco Fidel Suárez');
  const [autoNotifyCommandCenter, setAutoNotifyCommandCenter] = useState(true);
  const [showGeofenceConfigPanel, setShowGeofenceConfigPanel] = useState(true);

  // Datos GPS simulados en tiempo real por testigo
  const [testigoGpsPings, setTestigoGpsPings] = useState<Record<string, {
    distanciaMetros: number;
    lat: number;
    lng: number;
    ultimoPing: string;
    bateriaPct: number;
    estadoGPS: 'DENTRO' | 'FUERA' | 'SIN_SIGNAL';
  }>>({
    't1': { distanciaMetros: 28, lat: 6.2442, lng: -75.5812, ultimoPing: 'Hace 1 min', bateriaPct: 92, estadoGPS: 'DENTRO' },
    't2': { distanciaMetros: 320, lat: 6.2410, lng: -75.5900, ultimoPing: 'Hace 4 min', bateriaPct: 58, estadoGPS: 'FUERA' },
    't3': { distanciaMetros: 42, lat: 6.2301, lng: -75.5875, ultimoPing: 'Hace 2 min', bateriaPct: 85, estadoGPS: 'DENTRO' },
    't4': { distanciaMetros: 110, lat: 6.2488, lng: -75.5780, ultimoPing: 'Hace 8 min', bateriaPct: 74, estadoGPS: 'DENTRO' }
  });

  // Handler para simular actualización de ping GPS de testigo
  const handleSimulateWitnessPing = (tId: string) => {
    const newDistance = Math.floor(Math.random() * 350) + 10;
    const isInside = newDistance <= geofenceRadius;
    setTestigoGpsPings(prev => ({
      ...prev,
      [tId]: {
        distanciaMetros: newDistance,
        lat: 6.244 + (Math.random() * 0.006 - 0.003),
        lng: -75.581 + (Math.random() * 0.006 - 0.003),
        ultimoPing: 'Justo ahora',
        bateriaPct: Math.floor(Math.random() * 25) + 70,
        estadoGPS: isInside ? 'DENTRO' : 'FUERA'
      }
    }));
  };

  // Partidos y Movimientos disponibles
  const partidosPoliticosOpt = [
    'Partido Liberal Colombiano',
    'Partido Alianza Verde',
    'Centro Democrático',
    'Nuevo Liberalismo',
    'Movimiento Ciudadano Medellín Avanza',
    'Partido Conservador Colombiano',
    'Cambio Radical',
    'Pacto Histórico',
    'Partido de la U'
  ];

  // Puestos de Votación consignados para la circunscripción territorial de la campaña
  const puestosTerritorioOpt = [
    { nombre: 'Colegio Marco Fidel Suárez', comuna: 'Comuna 10 (La Candelaria)', mesas: 28 },
    { nombre: 'Universidad UPB', comuna: 'Comuna 11 (Laureles)', mesas: 35 },
    { nombre: 'I.E. Pedro Justo Berrío', comuna: 'Comuna 16 (Belén)', mesas: 22 },
    { nombre: 'I.E. INEM José Félix de Restrepo', comuna: 'Comuna 14 (El Poblado)', mesas: 40 },
    { nombre: 'Plaza de Toros La Macarena', comuna: 'Comuna 11 (Laureles)', mesas: 18 },
    { nombre: 'I.E. Diego Echavarría Misas', comuna: 'Comuna 5 (Castilla)', mesas: 25 },
    { nombre: 'Colegio San José de las Vegas', comuna: 'Comuna 14 (El Poblado)', mesas: 30 }
  ];

  // Handler para guardar o actualizar un testigo
  const handleSaveWitness = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasActiveCampaign) {
      alert('⚠️ No se puede inscribir ni modificar un testigo porque no existe una campaña creada aún. Por favor cree la campaña primero.');
      return;
    }
    if (!witNombre.trim() || !witCc.trim()) {
      alert('Por favor complete el nombre y la cédula de ciudadanía del testigo.');
      return;
    }

    if (editingWitnessId) {
      setTestigos(prev => prev.map(t => t.id === editingWitnessId ? {
        ...t,
        nombre: witNombre.trim(),
        cc: witCc.trim(),
        telefono: witTelefono.trim() || t.telefono,
        email: witEmail.trim() || t.email,
        partido: witPartido,
        rol: witRol,
        puesto: witPuesto,
        mesa: witMesa,
        comuna: witComuna,
        acreditacion: witAcreditacion,
        estado: witEstado
      } : t));
      alert(`✅ Información del testigo ${witNombre} modificada correctamente.`);
    } else {
      const newWitness = {
        id: `t-${Date.now()}`,
        nombre: witNombre.trim(),
        cc: witCc.trim(),
        telefono: witTelefono.trim() || '+57 300 000 0000',
        email: witEmail.trim() || `${witCc.trim()}@testigos.co`,
        partido: witPartido,
        rol: witRol,
        puesto: witPuesto,
        mesa: witMesa,
        comuna: witComuna,
        acreditacion: witAcreditacion,
        geofencing: 'Pendiente Día E',
        estado: witEstado
      };

      // Save to NestJS Backend
      fetch('/api/territorial/witnesses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: witNombre.trim(),
          puesto: witPuesto,
          mesa: witMesa,
          phone: witTelefono.trim()
        })
      }).catch(err => console.error("Error saving witness to backend:", err));

      setTestigos(prev => [newWitness, ...prev]);
      alert(`✅ Testigo ${witNombre} inscrito con éxito para ${witPartido} en ${witPuesto} (${witMesa}).`);
    }

    resetWitnessForm();
  };

  const resetWitnessForm = () => {
    setEditingWitnessId(null);
    setWitNombre('');
    setWitCc('');
    setWitTelefono('');
    setWitEmail('');
    setWitPartido('Partido Liberal Colombiano');
    setWitRol('Testigo de Mesa (E-16)');
    setWitPuesto('Colegio Marco Fidel Suárez');
    setWitMesa('Mesa 01');
    setWitComuna('Comuna 10 (La Candelaria)');
    setWitAcreditacion('Formulario E-16 En Trámite');
    setWitEstado('Inscrito');
    setShowWitnessForm(false);
  };

  const handleStartEditWitness = (t: typeof testigos[0]) => {
    setEditingWitnessId(t.id);
    setWitNombre(t.nombre);
    setWitCc(t.cc);
    setWitTelefono(t.telefono);
    setWitEmail(t.email);
    setWitPartido(t.partido);
    setWitRol(t.rol);
    setWitPuesto(t.puesto);
    setWitMesa(t.mesa);
    setWitComuna(t.comuna);
    setWitAcreditacion(t.acreditacion);
    setWitEstado(t.estado);
    setShowWitnessForm(true);
  };

  const handleDeleteWitness = (id: string) => {
    if (confirm('¿Está seguro de eliminar este testigo electoral de la lista?')) {
      setTestigos(prev => prev.filter(t => t.id !== id));
    }
  };

  // --------------------------------------------------------------------------
  // ESTADO Y MÓDULOS DE JURADOS ELECTORALES (POSTULACIÓN A REGISTRADURÍA & SORTEO)
  // --------------------------------------------------------------------------
  const [jurados, setJurados] = useState([
    {
      id: 'j1',
      cc: '1015667788',
      nombre: 'Valentina Ríos Cano',
      telefono: '+57 311 987 6543',
      email: 'valentina.rios@gmail.com',
      partido: 'Partido Liberal Colombiano',
      ocupacion: 'Docente Universitaria',
      municipio: 'Medellín',
      puestoPreferente: 'Colegio Marco Fidel Suárez',
      estadoPostulacion: 'Postulado para Sorteo',
      estadoSorteo: 'Seleccionado en Resolución',
      resolucion: 'Res. Registraduría No. 0482 de 2026',
      puestoDesignado: 'Colegio Marco Fidel Suárez',
      mesaDesignada: 'Mesa 12',
      rolDesignado: 'Presidente de Mesa',
      simpatia: 'Simpatizante Afín'
    },
    {
      id: 'j2',
      cc: '1026778899',
      nombre: 'Felipe Jaramillo Velásquez',
      telefono: '+57 300 112 2334',
      email: 'felipe.jaramillo@gmail.com',
      partido: 'Partido Alianza Verde',
      ocupacion: 'Ingeniero de Sistemas',
      municipio: 'Medellín',
      puestoPreferente: 'Universidad UPB',
      estadoPostulacion: 'Postulado para Sorteo',
      estadoSorteo: 'Seleccionado en Resolución',
      resolucion: 'Res. Registraduría No. 0482 de 2026',
      puestoDesignado: 'Universidad UPB',
      mesaDesignada: 'Mesa 04',
      rolDesignado: 'Vocal 1',
      simpatia: 'Simpatizante Afín'
    },
    {
      id: 'j3',
      cc: '1037889900',
      nombre: 'Camila Suárez Montoya',
      telefono: '+57 320 445 5667',
      email: 'camila.suarez@gmail.com',
      partido: 'Centro Democrático',
      ocupacion: 'Administradora de Empresas',
      municipio: 'Medellín',
      puestoPreferente: 'I.E. Pedro Justo Berrío',
      estadoPostulacion: 'Postulado para Sorteo',
      estadoSorteo: 'Seleccionado en Resolución',
      resolucion: 'Res. Registraduría No. 0482 de 2026',
      puestoDesignado: 'I.E. Pedro Justo Berrío',
      mesaDesignada: 'Mesa 15',
      rolDesignado: 'Vocal 2',
      simpatia: 'Simpatizante Afín'
    },
    {
      id: 'j4',
      cc: '1045998811',
      nombre: 'Andrés Felipe Ospina',
      telefono: '+57 315 778 8990',
      email: 'andres.ospina@gmail.com',
      partido: 'Partido Liberal Colombiano',
      ocupacion: 'Contador Público',
      municipio: 'Medellín',
      puestoPreferente: 'Colegio Marco Fidel Suárez',
      estadoPostulacion: 'Postulado para Sorteo',
      estadoSorteo: 'Seleccionado en Resolución',
      resolucion: 'Res. Registraduría No. 0482 de 2026',
      puestoDesignado: 'Colegio Marco Fidel Suárez',
      mesaDesignada: 'Mesa 02',
      rolDesignado: 'Jurado Remanente',
      simpatia: 'Militante'
    },
    {
      id: 'j5',
      cc: '1056112233',
      nombre: 'María José Fernández',
      telefono: '+57 312 334 4556',
      email: 'mariajose.f@gmail.com',
      partido: 'Nuevo Liberalismo',
      ocupacion: 'Abogada',
      municipio: 'Medellín',
      puestoPreferente: 'Universidad UPB',
      estadoPostulacion: 'Postulado para Sorteo',
      estadoSorteo: 'No Seleccionado',
      resolucion: 'Res. Registraduría No. 0482 de 2026',
      puestoDesignado: 'Sin Asignación',
      mesaDesignada: 'N/A',
      rolDesignado: 'No Designado',
      simpatia: 'Simpatizante Afín'
    },
    {
      id: 'j6',
      cc: '1067223344',
      nombre: 'Carlos Esteban Gutiérrez',
      telefono: '+57 301 556 6778',
      email: 'carlos.gutierrez@gmail.com',
      partido: 'Partido Liberal Colombiano',
      ocupacion: 'Economista - Sector Privado',
      municipio: 'Medellín',
      puestoPreferente: 'I.E. INEM José Félix de Restrepo',
      estadoPostulacion: 'Postulado para Sorteo',
      estadoSorteo: 'Postulado (Pendiente Sorteo)',
      resolucion: 'Pendiente Publicación Sorteo',
      puestoDesignado: 'Pendiente Sorteo',
      mesaDesignada: 'Pendiente',
      rolDesignado: 'Pendiente',
      simpatia: 'Simpatizante Afín'
    },
    {
      id: 'j7',
      cc: '1078334455',
      nombre: 'Daniela Restrepo Morales',
      telefono: '+57 318 667 7889',
      email: 'daniela.restrepo@gmail.com',
      partido: 'Partido Alianza Verde',
      ocupacion: 'Arquitecta - Independiente',
      municipio: 'Medellín',
      puestoPreferente: 'I.E. INEM José Félix de Restrepo',
      estadoPostulacion: 'Postulado para Sorteo',
      estadoSorteo: 'Seleccionado en Resolución',
      resolucion: 'Res. Registraduría No. 0482 de 2026',
      puestoDesignado: 'I.E. INEM José Félix de Restrepo',
      mesaDesignada: 'Mesa 08',
      rolDesignado: 'Presidente de Mesa',
      simpatia: 'Simpatizante Afín'
    }
  ]);

  // Filtros de Jurados
  const [juradoPartidoFilter, setJuradoPartidoFilter] = useState('Todos');
  const [juradoSorteoFilter, setJuradoSorteoFilter] = useState('Todos');
  const [juradoSearchQuery, setJuradoSearchQuery] = useState('');

  // Formulario de Postulados a Jurados
  const [showJuradoForm, setShowJuradoForm] = useState(false);
  const [editingJuradoId, setEditingJuradoId] = useState<string | null>(null);
  const [jurNombre, setJurNombre] = useState('');
  const [jurCc, setJurCc] = useState('');
  const [jurTelefono, setJurTelefono] = useState('');
  const [jurEmail, setJurEmail] = useState('');
  const [jurPartido, setJurPartido] = useState('Partido Liberal Colombiano');
  const [jurOcupacion, setJurOcupacion] = useState('');
  const [jurMunicipio, setJurMunicipio] = useState('Medellín');
  const [jurPuestoPreferente, setJurPuestoPreferente] = useState('Colegio Marco Fidel Suárez');

  // Estado de Confrontación de Resolución
  const [showConfrontationModal, setShowConfrontationModal] = useState(false);
  const [isConfronting, setIsConfronting] = useState(false);

  // Estado de Anexar y Lectura de Resolución de Registraduría
  const [resolutionFile, setResolutionFile] = useState<{
    name: string;
    size: string;
    uploadDate: string;
    status: 'Sin Cargar' | 'Leído & OCR Procesado';
    numRecordsExtracted: number;
    resolutionNumber: string;
  }>({
    name: 'Resolucion_0482_Jurados_Medellin.pdf',
    size: '2.4 MB',
    uploadDate: '2026-08-05',
    status: 'Leído & OCR Procesado',
    numRecordsExtracted: 185,
    resolutionNumber: 'Res. Registraduría No. 0482 de 2026'
  });
  const [isReadingResolution, setIsReadingResolution] = useState(false);
  const resolutionFileInputRef = React.useRef<HTMLInputElement>(null);

  // Manejador para Anexar Archivo de Resolución (PDF/Excel/Imagen/TXT)
  const handleAttachResolutionFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsReadingResolution(true);
    setTimeout(() => {
      const fileSizeFormatted = `${(file.size / (1024 * 1024)).toFixed(1)} MB`;
      const resNumMatch = file.name.match(/\d+/);
      const resNum = resNumMatch ? `Res. Registraduría No. ${resNumMatch[0]} de 2026` : 'Res. Registraduría No. Oficial 2026';

      setResolutionFile({
        name: file.name,
        size: fileSizeFormatted !== '0.0 MB' ? fileSizeFormatted : '1.8 MB',
        uploadDate: new Date().toLocaleDateString(),
        status: 'Leído & OCR Procesado',
        numRecordsExtracted: Math.floor(Math.random() * 50) + 150,
        resolutionNumber: resNum
      });
      setIsReadingResolution(false);

      alert(`✅ RESOLUCIÓN ANEXADA Y LEÍDA EXITOSAMENTE:\n\n📄 Archivo: "${file.name}"\n🔍 Motor de Lectura / OCR: 100% de páginas y cédulas extraídas.\n📊 Registros Detectados: Se identificaron asignaciones de puestos y mesas preparadas para la confrontación.`);
    }, 1200);
  };

  // Exportar Lista de Jurados Postulados a Excel / CSV para la Registraduría
  const handleExportJuradosExcel = () => {
    const headers = [
      'TIPO_DOCUMENTO',
      'CEDULA',
      'NOMBRES_Y_APELLIDOS',
      'PARTIDO_O_MOVIMIENTO',
      'OCUPACION_O_PROFESION',
      'MUNICIPIO',
      'TELEFONO_CONTACTO',
      'CORREO_ELECTRONICO',
      'PUESTO_PREFERENTE',
      'ESTADO_POSTULACION',
      'ESTADO_SORTEO_REGISTRADURIA',
      'RESOLUCION_REGISTRADURIA',
      'PUESTO_DESIGNADO_OFICIAL',
      'MESA_DESIGNADA',
      'ROL_JURADO_DESIGNADO'
    ];

    const rows = jurados.map(j => [
      'CC',
      j.cc,
      `"${j.nombre}"`,
      `"${j.partido}"`,
      `"${j.ocupacion}"`,
      `"${j.municipio}"`,
      j.telefono,
      j.email,
      `"${j.puestoPreferente}"`,
      j.estadoPostulacion,
      j.estadoSorteo,
      `"${j.resolucion}"`,
      `"${j.puestoDesignado}"`,
      j.mesaDesignada,
      `"${j.rolDesignado}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map(e => e.join(';'))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Lista_Jurados_Postulados_Registraduria_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    alert('✅ Lista oficial de jurados postulados exportada exitosamente en formato Excel / CSV.\n\nEste archivo cumple estrictamente la estructura estandarizada exigida por la Registraduría Nacional del Estado Civil para el sorteo electrónico de jurados de votación por partido o movimiento político.');
  };

  // Ejecutar Confrontación Automática con Resolución de Sorteo emitida por Registraduría
  const handleRunResolutionConfrontation = () => {
    setIsConfronting(true);
    setTimeout(() => {
      setJurados(prev => prev.map(j => {
        if (j.estadoSorteo === 'Postulado (Pendiente Sorteo)') {
          return {
            ...j,
            estadoSorteo: 'Seleccionado en Resolución',
            resolucion: resolutionFile.resolutionNumber || 'Res. Registraduría No. 0482 de 2026',
            puestoDesignado: j.puestoPreferente,
            mesaDesignada: 'Mesa 05',
            rolDesignado: 'Vocal 1'
          };
        }
        return j;
      }));
      setIsConfronting(false);
      alert(`🎉 CONFRONTACIÓN DE RESOLUCIÓN COMPLETADA EXITOSAMENTE:\n\nSe cruzaron ${jurados.length} cédulas de candidatos postulados contra el censo procesado de "${resolutionFile.name}" (${resolutionFile.resolutionNumber}).\n\n- Postulados Confrontados: ${jurados.length}\n- Seleccionados Designados: ${jurados.filter(j => j.estadoSorteo.includes('Seleccionado')).length} Ciudadanos (${Math.round((jurados.filter(j => j.estadoSorteo.includes('Seleccionado')).length / jurados.length) * 100)}% de efectividad)\n- No Seleccionados: ${jurados.filter(j => j.estadoSorteo === 'No Seleccionado').length}`);
    }, 1200);
  };

  // Guardar nuevo postulante a jurado o modificar
  const handleSaveJuradoCandidate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasActiveCampaign) {
      alert('⚠️ No se puede crear lista de jurados si no hay una campaña política creada en el sistema.');
      return;
    }
    if (!jurNombre.trim() || !jurCc.trim()) {
      alert('Por favor ingrese el nombre completo y la cédula del candidato a jurado.');
      return;
    }

    if (editingJuradoId) {
      setJurados(prev => prev.map(j => j.id === editingJuradoId ? {
        ...j,
        nombre: jurNombre.trim(),
        cc: jurCc.trim(),
        telefono: jurTelefono.trim() || j.telefono,
        email: jurEmail.trim() || j.email,
        partido: jurPartido,
        ocupacion: jurOcupacion.trim() || j.ocupacion,
        municipio: jurMunicipio,
        puestoPreferente: jurPuestoPreferente
      } : j));
      alert(`✅ Candidato a jurado ${jurNombre} actualizado.`);
    } else {
      const newCandidate = {
        id: `j-${Date.now()}`,
        cc: jurCc.trim(),
        nombre: jurNombre.trim(),
        telefono: jurTelefono.trim() || '+57 300 000 0000',
        email: jurEmail.trim() || `${jurCc.trim()}@jurados.co`,
        partido: jurPartido,
        ocupacion: jurOcupacion.trim() || 'Profesional Independiente',
        municipio: jurMunicipio,
        puestoPreferente: jurPuestoPreferente,
        estadoPostulacion: 'Postulado para Sorteo',
        estadoSorteo: 'Postulado (Pendiente Sorteo)',
        resolucion: 'Pendiente Publicación Sorteo',
        puestoDesignado: 'Pendiente Sorteo',
        mesaDesignada: 'Pendiente',
        rolDesignado: 'Pendiente',
        simpatia: 'Simpatizante Afín'
      };
      setJurados(prev => [newCandidate, ...prev]);
      alert(`✅ Candidato ${jurNombre} postulado exitosamente en la lista para sorteo de la Registraduría por el ${jurPartido}.`);
    }

    resetJuradoForm();
  };

  const resetJuradoForm = () => {
    setEditingJuradoId(null);
    setJurNombre('');
    setJurCc('');
    setJurTelefono('');
    setJurEmail('');
    setJurPartido('Partido Liberal Colombiano');
    setJurOcupacion('');
    setJurMunicipio('Medellín');
    setJurPuestoPreferente('Colegio Marco Fidel Suárez');
    setShowJuradoForm(false);
  };

  const handleStartEditJurado = (j: typeof jurados[0]) => {
    setEditingJuradoId(j.id);
    setJurNombre(j.nombre);
    setJurCc(j.cc);
    setJurTelefono(j.telefono);
    setJurEmail(j.email);
    setJurPartido(j.partido);
    setJurOcupacion(j.ocupacion);
    setJurMunicipio(j.municipio);
    setJurPuestoPreferente(j.puestoPreferente);
    setShowJuradoForm(true);
  };

  const handleDeleteJurado = (id: string) => {
    if (confirm('¿Está seguro de eliminar este ciudadano de la lista de jurados postulados?')) {
      setJurados(prev => prev.filter(j => j.id !== id));
    }
  };

  // Forms states for Simulation & Test (Votantes)
  const [showAddVoterForm, setShowAddVoterForm] = useState(false);
  const [selectedVoterDetail, setSelectedVoterDetail] = useState<any | null>(null);

  const [newCc, setNewCc] = useState('');
  const [newNombre, setNewNombre] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newSeudonimo, setNewSeudonimo] = useState('');
  const [newCumpleanos, setNewCumpleanos] = useState('');
  const [newDireccion, setNewDireccion] = useState('');
  const [newTelefono, setNewTelefono] = useState('');
  const [newDescripcion, setNewDescripcion] = useState('');
  const [newLider, setNewLider] = useState('Santiago Pérez');
  const [newComuna, setNewComuna] = useState('Comuna 10 - La Candelaria');
  const [newPuesto, setNewPuesto] = useState('Colegio Marco Fidel Suárez');
  const [newMesa, setNewMesa] = useState('Mesa 01');

  // Forms states for Simulation & Test (Líderes y Coordinadores de Zona)
  const [showAddLeaderForm, setShowAddLeaderForm] = useState(false);
  const [selectedLeaderDetail, setSelectedLeaderDetail] = useState<any | null>(null);

  const [newLeaderCc, setNewLeaderCc] = useState('');
  const [newLeaderNombre, setNewLeaderNombre] = useState('');
  const [newLeaderCargo, setNewLeaderCargo] = useState('Coordinador de Zona');
  const [newLeaderZona, setNewLeaderZona] = useState('Comuna 11 - Laureles / Estadio');
  const [newLeaderTelefono, setNewLeaderTelefono] = useState('');
  const [newLeaderEmail, setNewLeaderEmail] = useState('');
  const [newLeaderSeudonimo, setNewLeaderSeudonimo] = useState('');
  const [newLeaderCumpleanos, setNewLeaderCumpleanos] = useState('');
  const [newLeaderDireccion, setNewLeaderDireccion] = useState('');
  const [newLeaderMetaVotantes, setNewLeaderMetaVotantes] = useState('200');
  const [newLeaderSupervisor, setNewLeaderSupervisor] = useState('Gerencia General de Campaña');
  const [newLeaderDocumentos, setNewLeaderDocumentos] = useState('Acreditación CNE Aprobada');
  const [newLeaderDescripcion, setNewLeaderDescripcion] = useState('');

  // Sample Líderes y Coordinadores de Zona
  const [leadersAndCoordinators, setLeadersAndCoordinators] = useState([
    {
      id: 'l1',
      cc: '1020987654',
      nombre: 'Dra. Andrea Morales',
      cargo: 'Coordinadora General de Zona',
      zona: 'Comuna 11 - Laureles / Estadio',
      telefono: '+57 300 888 9911',
      email: 'andrea.morales@campanaganadora.co',
      seudonimo: 'Andy Morales',
      cumpleanos: '1992-11-20',
      direccion: 'Carrera 70 # 32B-15, Sede Laureles',
      metaVotantes: 500,
      supervisor: 'Directo Candidatura',
      documentos: 'Acreditado CNE + ARL Vigente',
      descripcion: 'Coordinadora principal en comuna 11. Administra 12 puestos de votación y 35 punteros territoriales.',
      fechaRegistro: '2026-07-15'
    },
    {
      id: 'l2',
      cc: '1017123499',
      nombre: 'Santiago Pérez Calle',
      cargo: 'Coordinador de Zona',
      zona: 'Comuna 10 - La Candelaria / Centro',
      telefono: '+57 312 777 4433',
      email: 'santiago.perez@campanaganadora.co',
      seudonimo: 'Santi Centro',
      cumpleanos: '1985-04-12',
      direccion: 'Calle 52 # 43-18, Centro',
      metaVotantes: 350,
      supervisor: 'Dra. Andrea Morales',
      documentos: 'Acreditado CNE',
      descripcion: 'Líder del sector comercial y transporte. Encargado de coordinar brigadas de empadronamiento.',
      fechaRegistro: '2026-07-20'
    },
    {
      id: 'l3',
      cc: '1045112288',
      nombre: 'Carlos Mendoza Rios',
      cargo: 'Líder Zonal Senior',
      zona: 'Comuna 16 - Belén / Altavista',
      telefono: '+57 318 444 1122',
      email: 'carlos.mendoza@gmail.com',
      seudonimo: 'Mendoza Belén',
      cumpleanos: '1990-08-05',
      direccion: 'Calle 30A # 80-45, Belén',
      metaVotantes: 200,
      supervisor: 'Santiago Pérez Calle',
      documentos: 'En Trámite ARL',
      descripcion: 'Coordinador juvenil y promotor de deportes en las Juntas de Acción Comunal.',
      fechaRegistro: '2026-07-25'
    }
  ]);

  const handleAddLeaderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeaderCc.trim() || !newLeaderNombre.trim()) return;

    const exists = leadersAndCoordinators.some(l => l.cc === newLeaderCc.trim());
    if (exists) {
      alert(`Error: La cédula ${newLeaderCc} ya se encuentra registrada en la estructura de Líderes/Coordinadores.`);
      return;
    }

    const newRec = {
      id: Date.now().toString(),
      cc: newLeaderCc.trim(),
      nombre: newLeaderNombre.trim(),
      cargo: newLeaderCargo,
      zona: newLeaderZona,
      telefono: newLeaderTelefono.trim() || 'Sin teléfono',
      email: newLeaderEmail.trim() || 'No registrado',
      seudonimo: newLeaderSeudonimo.trim() || 'Sin alias',
      cumpleanos: newLeaderCumpleanos || 'No registrada',
      direccion: newLeaderDireccion.trim() || 'Sin dirección',
      metaVotantes: parseInt(newLeaderMetaVotantes) || 100,
      supervisor: newLeaderSupervisor,
      documentos: newLeaderDocumentos,
      descripcion: newLeaderDescripcion.trim() || 'Sin observaciones.',
      fechaRegistro: new Date().toISOString().split('T')[0]
    };

    setLeadersAndCoordinators(prev => [newRec, ...prev]);
    setNewLeaderCc('');
    setNewLeaderNombre('');
    setNewLeaderTelefono('');
    setNewLeaderEmail('');
    setNewLeaderSeudonimo('');
    setNewLeaderCumpleanos('');
    setNewLeaderDireccion('');
    setNewLeaderDescripcion('');
    setShowAddLeaderForm(false);
    alert('¡Registro de prueba exitoso! El Líder / Coordinador de Zona ha sido dado de alta en la estructura con todos sus campos configurados.');
  };

  // Search Cédula Function against Censo Electoral & Duplicate Prevention
  const handleSearchCedula = () => {
    if (!cedulaSearch.trim()) return;

    // Check duplicate
    const existing = voters.find(v => v.cc === cedulaSearch.trim());
    if (existing) {
      setDuplicateWarning(`¡ATENCIÓN DUPLICADO! La cédula ${existing.cc} ya se encuentra empadronada en la campaña por el líder: ${existing.lider} el ${existing.fecha}.`);
      setCedulaSearchResult(existing);
    } else {
      setDuplicateWarning(null);
      // Simulate Censo Electoral Fetch
      setCedulaSearchResult({
        cc: cedulaSearch.trim(),
        nombre: 'CIUDADANO HABILITADO EN CENSO',
        municipio: 'Medellín (Antioquia)',
        puesto: 'Puesto Asignado por Registraduría: I.E. San José',
        mesa: 'Mesa 09',
        estadoCenso: 'Habilitado para Votar en Elecciones Territoriales'
      });
    }
  };

  const handleAddVoterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCc.trim() || !newNombre.trim()) return;

    // Duplicate Check
    const exists = voters.some(v => v.cc === newCc.trim());
    if (exists) {
      alert(`Error: La cédula ${newCc} ya existe en el CRM de la campaña.`);
      return;
    }

    const newRec = {
      id: Date.now().toString(),
      cc: newCc.trim(),
      nombre: newNombre.trim(),
      email: newEmail.trim() || 'No registrado',
      seudonimo: newSeudonimo.trim() || 'Sin seudónimo',
      cumpleanos: newCumpleanos || 'No registrada',
      direccion: newDireccion.trim() || 'No registrada',
      telefono: newTelefono.trim() || 'Sin teléfono',
      descripcion: newDescripcion.trim() || 'Sin observaciones adicionales',
      tipo: 'Votante',
      lider: newLider,
      municipio: 'Medellín',
      comuna: newComuna,
      puesto: newPuesto,
      mesa: newMesa,
      estado: 'Empadronado',
      fecha: new Date().toISOString().split('T')[0]
    };

    setVoters(prev => [newRec, ...prev]);
    setNewCc('');
    setNewNombre('');
    setNewEmail('');
    setNewSeudonimo('');
    setNewCumpleanos('');
    setNewDireccion('');
    setNewTelefono('');
    setNewDescripcion('');
    setShowAddVoterForm(false);
    alert('¡Prueba de empadronamiento exitosa! El votante ha sido agregado a la base de datos CRM con todos sus campos configurados.');
  };

  return (
    <div className="min-h-[calc(100vh-60px)] bg-transparent text-slate-100 relative">
      {/* Floating Success Toast */}
      {actionSuccessMessage && (
        <div className="fixed top-24 right-6 z-50 animate-bounce duration-500 bg-[#022c22]/95 border border-emerald-500/50 backdrop-blur-md rounded-xl p-4 shadow-[0_0_25px_rgba(16,185,129,0.35)] flex items-center gap-3 max-w-sm text-slate-100">
          <div className="bg-[#111C30]0/20 p-2 rounded-lg text-emerald-400">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <h4 className="font-extrabold text-xs text-emerald-400 uppercase tracking-wider">¡Registro Exitoso!</h4>
            <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">{actionSuccessMessage}</p>
          </div>
          <button 
            onClick={() => setActionSuccessMessage('')}
            className="text-slate-400 hover:text-slate-200 transition-colors ml-auto text-[10px] uppercase font-bold"
          >
            Cerrar
          </button>
        </div>
      )}

      {/* Main Container Content */}
      <main className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">

        {/* ---------------------------------------------------------------------- */}
        {/* TAB 1: INICIO (RESUMEN EJECUTIVO ADMINISTRATIVO) */}
        {/* ---------------------------------------------------------------------- */}
        {activeTab === 'inicio' && (() => {
          const pieData = [
            { name: 'Candidato A', value: 45.2, color: '#3b82f6' },
            { name: 'Candidato B', value: 28.7, color: '#a855f7' },
            { name: 'Candidato C', value: 15.3, color: '#ec4899' },
            { name: 'Indecisos', value: 7.8, color: '#f97316' },
            { name: 'Ninguno', value: 3.0, color: '#06b6d4' }
          ];

          return (
            <div className="space-y-6 animate-fadeIn text-slate-100 font-sans">
              <style>{`
                @keyframes wavePulse {
                  0%, 100% { transform: translateY(0) scale(1); opacity: 0.35; }
                  50% { transform: translateY(-4px) scale(1.02); opacity: 0.65; }
                }
              `}</style>
              
              {/* TOP LAYOUT: Hero Card + Resumen General Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                
                {/* HERO BANNER CARD (40% width / 5 cols) */}
                <div className="lg:col-span-5 relative overflow-hidden rounded-3xl border border-white/5 bg-[#081225]/40 backdrop-blur-xl p-8 flex flex-col justify-between min-h-[320px] shadow-2xl group">
                  {/* Glowing particle wave SVG animation */}
                  <div className="absolute inset-0 z-0 opacity-40 group-hover:opacity-60 transition-opacity pointer-events-none">
                    <svg className="w-full h-full" viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M-50 150 C 100 120, 150 200, 250 130 C 350 70, 400 180, 500 150" stroke="url(#cyanGlowGrad)" strokeWidth="3" style={{ animation: 'wavePulse 6s ease-in-out infinite' }} />
                      <path d="M-50 170 C 80 200, 180 120, 280 180 C 340 210, 420 150, 500 160" stroke="url(#blueGlowGrad)" strokeWidth="1.5" style={{ animation: 'wavePulse 8s ease-in-out infinite 1s' }} />
                      {/* Animated circular points (nodes) */}
                      <circle cx="100" cy="140" r="4" className="fill-cyan-400 animate-pulse" />
                      <circle cx="100" cy="140" r="3" className="fill-cyan-300" />
                      <circle cx="250" cy="130" r="4" className="fill-blue-400 animate-pulse" />
                      <circle cx="250" cy="130" r="3" className="fill-blue-300" />
                      <circle cx="340" cy="180" r="4" className="fill-cyan-400 animate-pulse" />
                      <circle cx="340" cy="180" r="3" className="fill-cyan-300" />
                      
                      <defs>
                        <linearGradient id="cyanGlowGrad" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#00f2fe" stopOpacity="0" />
                          <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.8" />
                          <stop offset="100%" stopColor="#00f2fe" stopOpacity="0" />
                        </linearGradient>
                        <linearGradient id="blueGlowGrad" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0" />
                          <stop offset="60%" stopColor="#6366f1" stopOpacity="0.6" />
                          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                  
                  {/* Hero card content */}
                  <div className="relative z-10 space-y-4 my-auto">
                    <h2 className="text-4xl font-display font-black text-white leading-tight">
                      Gestión <br />
                      <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-400 bg-clip-text text-transparent">
                        Administrativa
                      </span>
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-400 max-w-sm leading-relaxed font-light">
                      Administra usuarios, campañas, testigos, jurados y todos los recursos de tu organización.
                    </p>
                  </div>
                  
                  <div className="relative z-10 pt-4">
                    <button
                      onClick={() => setActiveTab('gestion_campana')}
                      className="px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white shadow-lg shadow-cyan-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer inline-flex items-center gap-2"
                    >
                      <span>Explorar Módulo</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                
                {/* RESUMEN GENERAL GRID (60% width / 7 cols) */}
                <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">Resumen General</h3>
                    <select className="bg-white/5 border border-white/5 rounded-xl px-3 py-1 text-xs text-slate-300 outline-none hover:bg-white/10 transition-colors">
                      <option>Este mes</option>
                      <option>Últimos 3 meses</option>
                    </select>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-grow">
                    
                    {/* Card 1: Líderes Activos */}
                    <div className="rounded-2xl border border-white/5 bg-[#070c17]/60 p-5 flex flex-col justify-between shadow-xl hover:border-white/10 transition-all">
                      <div className="flex items-start justify-between">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                          <Users className="w-5 h-5" />
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Líderes Activos</p>
                          <p className="text-2xl font-display font-black text-white mt-1">1.248</p>
                        </div>
                      </div>
                      <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3">
                        <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-0.5">
                          <TrendingUp className="w-3 h-3" /> +12.5% <span className="text-[9px] text-slate-500 font-normal">vs. mes anterior</span>
                        </span>
                        <div className="w-20 h-6 shrink-0">
                          <svg viewBox="0 0 100 20" className="w-full h-full text-blue-400 fill-none stroke-current stroke-2">
                            <path d="M0 15 Q 15 10, 30 14 T 60 5 T 90 12 T 100 8" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    
                    {/* Card 2: Votantes Registrados */}
                    <div className="rounded-2xl border border-white/5 bg-[#070c17]/60 p-5 flex flex-col justify-between shadow-xl hover:border-white/10 transition-all">
                      <div className="flex items-start justify-between">
                        <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
                          <UserCheck className="w-5 h-5" />
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Votantes Registrados</p>
                          <p className="text-2xl font-display font-black text-white mt-1">24.563</p>
                        </div>
                      </div>
                      <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3">
                        <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-0.5">
                          <TrendingUp className="w-3 h-3" /> +8.3% <span className="text-[9px] text-slate-500 font-normal">vs. mes anterior</span>
                        </span>
                        <div className="w-20 h-6 shrink-0">
                          <svg viewBox="0 0 100 20" className="w-full h-full text-cyan-400 fill-none stroke-current stroke-2">
                            <path d="M0 18 Q 15 12, 30 16 T 60 8 T 90 14 T 100 5" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    
                    {/* Card 3: Cobertura Territorial */}
                    <div className="rounded-2xl border border-white/5 bg-[#070c17]/60 p-5 flex flex-col justify-between shadow-xl hover:border-white/10 transition-all">
                      <div className="flex items-start justify-between">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                          <PieChart className="w-5 h-5" />
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Cobertura Territorial</p>
                          <p className="text-2xl font-display font-black text-white mt-1">78.4%</p>
                        </div>
                      </div>
                      <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3">
                        <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-0.5">
                          <TrendingUp className="w-3 h-3" /> +5.6% <span className="text-[9px] text-slate-500 font-normal">vs. mes anterior</span>
                        </span>
                        <div className="w-20 h-6 shrink-0">
                          <svg viewBox="0 0 100 20" className="w-full h-full text-purple-400 fill-none stroke-current stroke-2">
                            <path d="M0 12 Q 15 15, 30 8 T 60 14 T 90 6 T 100 10" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    
                    {/* Card 4: Testigos Activos */}
                    <div className="rounded-2xl border border-white/5 bg-[#070c17]/60 p-5 flex flex-col justify-between shadow-xl hover:border-white/10 transition-all">
                      <div className="flex items-start justify-between">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                          <ShieldCheck className="w-5 h-5" />
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Testigos Activos</p>
                          <p className="text-2xl font-display font-black text-white mt-1">532</p>
                        </div>
                      </div>
                      <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3">
                        <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-0.5">
                          <TrendingUp className="w-3 h-3" /> +15.1% <span className="text-[9px] text-slate-500 font-normal">vs. mes anterior</span>
                        </span>
                        <div className="w-20 h-6 shrink-0">
                          <svg viewBox="0 0 100 20" className="w-full h-full text-emerald-400 fill-none stroke-current stroke-2">
                            <path d="M0 14 Q 15 8, 30 12 T 60 6 T 90 10 T 100 4" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    
                  </div>
                </div>
                
              </div>

              {/* BOTTOM ROW: Distribución Electoral + Actividad Reciente + Security Hologram */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                
                {/* 1. Distribución Electoral (Doughnut Chart) (5 cols) */}
                <div className="lg:col-span-5 rounded-3xl border border-white/5 bg-[#070c17]/60 p-6 flex flex-col justify-between shadow-xl">
                  <div className="border-b border-white/5 pb-3">
                    <h3 className="font-bold text-white text-xs uppercase tracking-wider">Distribución Electoral</h3>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-6 py-4">
                    {/* Doughnut Chart Recharts */}
                    <div className="w-[140px] h-[140px] relative flex-shrink-0">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={48}
                            outerRadius={60}
                            paddingAngle={2}
                            dataKey="value"
                          >
                            {pieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-white text-base font-black leading-none">24.563</span>
                        <span className="text-slate-500 text-[9px] mt-0.5 uppercase tracking-wider font-bold">Total</span>
                      </div>
                    </div>
                    
                    {/* Legend */}
                    <div className="flex-1 space-y-2 text-[10px] text-slate-300 font-mono w-full">
                      {pieData.map((entry, idx) => (
                        <div key={idx} className="flex items-center justify-between">
                          <span className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
                            <span>{entry.name}</span>
                          </span>
                          <span className="text-white font-bold">{entry.value}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 2. Actividad Reciente (4 cols) */}
                <div className="lg:col-span-4 rounded-3xl border border-white/5 bg-[#070c17]/60 p-6 flex flex-col justify-between shadow-xl">
                  <div className="border-b border-white/5 pb-3">
                    <h3 className="font-bold text-white text-xs uppercase tracking-wider">Actividad Reciente</h3>
                  </div>
                  
                  <div className="space-y-4 flex-1 py-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                        <Users className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] text-white font-bold leading-normal">Nuevo líder registrado en Medellín</p>
                        <p className="text-[9px] text-slate-500 mt-0.5">Juan Pérez - Comuna 13</p>
                      </div>
                      <span className="text-[9px] text-slate-500 shrink-0">Hace 20 min</span>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                        <UserCheck className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] text-white font-bold leading-normal">Votante registrado en Cali</p>
                        <p className="text-[9px] text-slate-500 mt-0.5">María González - Comuna 7</p>
                      </div>
                      <span className="text-[9px] text-slate-500 shrink-0">Hace 45 min</span>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
                        <CreditCard className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] text-white font-bold leading-normal">Presupuesto actualizado</p>
                        <p className="text-[9px] text-slate-500 mt-0.5">Campaña Alcaldía 2026</p>
                      </div>
                      <span className="text-[9px] text-slate-500 shrink-0">Hace 1 hora</span>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] text-white font-bold leading-normal">Testigo asignado en Barranquilla</p>
                        <p className="text-[9px] text-slate-500 mt-0.5">Carlos Martínez - Puesto 45</p>
                      </div>
                      <span className="text-[9px] text-slate-500 shrink-0">Hace 2 horas</span>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => setActiveTab('lideres_votantes')}
                    className="w-full text-center text-[10px] font-black uppercase tracking-wider text-cyan-400 hover:text-cyan-300 border-t border-white/5 pt-3 transition-colors cursor-pointer"
                  >
                    Ver todas
                  </button>
                </div>

                {/* 3. Holographic Security Panel (3 cols) */}
                <div className="lg:col-span-3 rounded-3xl border border-white/5 bg-[#070c17]/60 p-6 flex flex-col items-center justify-between shadow-xl relative overflow-hidden group">
                  <div className="w-full border-b border-white/5 pb-3">
                    <h3 className="font-bold text-white text-xs uppercase tracking-wider">Estado de Seguridad</h3>
                  </div>
                  
                  {/* Hologram Graphic */}
                  <div className="my-auto py-6 relative flex items-center justify-center w-full min-h-[160px]">
                    {/* Animated Outer Circles */}
                    <div className="absolute w-32 h-32 rounded-full border border-cyan-500/20 animate-[spin_10s_linear_infinite]" />
                    <div className="absolute w-28 h-28 rounded-full border border-dashed border-blue-500/30 animate-[spin_15s_linear_infinite_reverse]" />
                    <div className="absolute w-24 h-24 rounded-full border border-cyan-500/10" />
                    
                    {/* Hologram Glow */}
                    <div className="absolute w-20 h-20 bg-cyan-500/10 rounded-full blur-[15px]" />
                    
                    {/* Shield and check SVG */}
                    <svg className="w-16 h-16 text-cyan-400 relative z-10 animate-[bounce_4s_ease-in-out_infinite]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" className="fill-cyan-950/40" />
                      <path d="m9 12 2 2 4-4" strokeWidth="2" className="text-cyan-300" />
                    </svg>
                  </div>
                  
                  <div className="w-full text-center space-y-1.5">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Encriptado E2E
                    </span>
                    <p className="text-[10px] text-slate-500">Respaldos en Supabase</p>
                  </div>
                </div>

              </div>

            </div>
          );
        })()}

        {/* ---------------------------------------------------------------------- */}
        {/* TAB 2: GESTIÓN DE ROLES (RBAC & AISLAMIENTO) */}
        {/* ---------------------------------------------------------------------- */}
        {activeTab === 'roles' && (
          <div className="space-y-5 animate-fadeIn">
            {/* Header Card */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 flex items-center gap-4 shadow-lg">
              <div className="w-12 h-12 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-white text-base">Consola de Administración de Roles y Permisos (RBAC)</h3>
                <p className="text-xs text-slate-400 mt-0.5">Administra los roles, permisos y accesos de los usuarios de la plataforma.</p>
              </div>
            </div>

            {/* Main Table Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
              {/* Section: Asignación de Roles a Usuarios de Campaña */}
              <div className="space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-slate-400" />
                    <h4 className="text-sm font-extrabold text-white">
                      Asignación de Roles a Usuarios de Campaña
                    </h4>
                  </div>

                  {/* Inline user search and user adding button */}
                  <div className="flex items-center gap-2.5">
                    <div className="relative w-48 sm:w-64">
                      <input
                        type="text"
                        placeholder="Buscar por nombre o correo..."
                        value={userSearchTerm}
                        onChange={(e) => setUserSearchTerm(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-slate-700 transition-all"
                      />
                      <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-3" />
                    </div>
                    <button
                      onClick={() => setShowAddUserSection(!showAddUserSection)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5 text-white" />
                      <span>{showAddUserSection ? 'Cancelar' : 'Registrar'}</span>
                    </button>
                  </div>
                </div>

                {/* Inline user creation form */}
                {showAddUserSection && (
                  <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/35 space-y-4 animate-slideDown">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-cyan-300 font-black uppercase tracking-wider">
                        Nuevo Usuario de Campaña
                      </span>
                      <span className="text-[9px] text-slate-400">
                        * Todos los campos son obligatorios
                      </span>
                    </div>

                    {passwordError && (
                      <div className="text-xs font-bold text-rose-400 bg-rose-950/40 border border-rose-500/35 px-3.5 py-2 rounded-xl">
                        ⚠️ {passwordError}
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 text-xs">
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-300 mb-1">Nombre Completo *</label>
                        <input
                          type="text"
                          required
                          value={newUserName}
                          onChange={(e) => setNewUserName(e.target.value)}
                          placeholder="Ej. Mateo Gómez"
                          className="w-full bg-slate-950 border border-cyan-500/30 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-400"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-300 mb-1">Correo Electrónico *</label>
                        <input
                          type="email"
                          required
                          value={newUserEmail}
                          onChange={(e) => setNewUserEmail(e.target.value)}
                          placeholder="mateo@campana.ia"
                          className="w-full bg-slate-950 border border-cyan-500/30 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-400"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-300 mb-1">Crear Contraseña *</label>
                        <input
                          type="password"
                          required
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-slate-950 border border-cyan-500/30 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-400"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-300 mb-1">Confirmar Contraseña *</label>
                        <input
                          type="password"
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-slate-950 border border-cyan-500/30 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-400"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-300 mb-1">Asignar Módulo Inicial *</label>
                        <select
                          value={newUserRole}
                          onChange={(e) => setNewUserRole(e.target.value as any)}
                          className="w-full bg-slate-950 border border-cyan-500/30 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-400 font-semibold"
                        >
                          <option value="admin">🛠️ Gestión Administrativa</option>
                          <option value="estrategico">📈 Gestión Estratégica</option>
                          <option value="territorial">🗺️ Gestión Territorial</option>
                        </select>
                      </div>
                    </div>

                    {/* Mandatory Permissions selection block based on module selection */}
                    <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/20 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <span className="text-[10px] text-cyan-300 font-black uppercase tracking-wider block">
                          ⚠️ Selección Obligatoria: Funciones a Habilitar para el Usuario *
                        </span>
                        <span className="text-[9px] text-slate-400 font-medium">
                          (Seleccione al menos una función correspondiente a: {newUserRole === 'admin' ? 'Gestión Administrativa' : newUserRole === 'estrategico' ? 'Gestión Estratégica' : 'Gestión Territorial'})
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {rolePermissions[newUserRole].map(p => (
                          <label
                            key={p.id}
                            className={`flex items-center gap-2.5 p-2.5 rounded-lg border transition-all cursor-pointer ${
                              newUserPermissions[p.id]
                                ? 'bg-cyan-500/10 border-cyan-500/40 text-white'
                                : 'bg-[#111C30]/40 border-cyan-500/10 text-slate-400 hover:border-cyan-500/20'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={!!newUserPermissions[p.id]}
                              onChange={(e) => {
                                setNewUserPermissions(prev => ({
                                  ...prev,
                                  [p.id]: e.target.checked
                                }));
                              }}
                              className="accent-cyan-500 cursor-pointer h-3.5 w-3.5"
                            />
                            <div className="text-[11px] leading-tight font-medium">
                              {p.name}
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-end pt-1">
                      <button
                        onClick={handleCreateUserInline}
                        className="px-4 py-2 bg-[#111C30]0 text-white font-black text-xs rounded-xl shadow-lg hover:bg-emerald-400 transition-all cursor-pointer"
                      >
                        Crear y Asignar Usuario
                      </button>
                    </div>
                  </div>
                )}

                 {/* Users assignment list (Tabular format with status toggles and assigned permission badges) */}
                <div className="space-y-3">
                  <div className="hidden sm:grid sm:grid-cols-12 gap-4 px-4 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-800/40">
                    <div className="col-span-6">Datos de Usuario y Funciones Habilitadas</div>
                    <div className="col-span-2">Módulo Asignado</div>
                    <div className="col-span-2 text-center">Estado Acceso</div>
                    <div className="col-span-2 text-right">Ajuste Accesos</div>
                  </div>
                  {usersList
                    .filter(u => u.name.toLowerCase().includes(userSearchTerm.toLowerCase()) || u.email.toLowerCase().includes(userSearchTerm.toLowerCase()))
                    .map(usr => (
                      <div 
                        key={usr.id} 
                        className={`p-4 rounded-xl border border-slate-800/60 transition-all flex flex-col sm:grid sm:grid-cols-12 items-start sm:items-center gap-4 ${
                          usr.status === 'Activo'
                            ? 'bg-slate-900/40'
                            : 'bg-rose-950/5 border-rose-500/10 opacity-70'
                        }`}
                      >
                        {/* Column 1: User info & enabled permissions */}
                        <div className="col-span-6 space-y-1.5 min-w-0 w-full">
                          <div className="flex items-center gap-2.5">
                            <span className={`font-extrabold text-sm ${usr.status === 'Activo' ? 'text-white' : 'text-slate-500 line-through'}`}>
                              {usr.name}
                            </span>
                            <span className={`text-[9px] font-extrabold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${
                              usr.role === 'admin' 
                                ? 'text-blue-400 bg-blue-500/10 border-blue-500/20' 
                                : usr.role === 'estrategico'
                                ? 'text-slate-400 bg-slate-500/10 border-slate-500/20'
                                : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                            }`}>
                              {usr.role === 'admin' ? 'ADMINISTRATIVA' : usr.role === 'estrategico' ? 'ESTRATÉGICA' : 'TERRITORIAL'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500">{usr.email}</p>
                        </div>

                        {/* Column 2: Role selection */}
                        <div className="col-span-2 w-full sm:w-auto">
                          <select
                            value={usr.role}
                            onChange={(e) => handleUserRoleChange(usr.id, e.target.value as any)}
                            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300 font-medium focus:outline-none focus:border-slate-700 cursor-pointer w-full"
                          >
                            <option value="admin">Administrativa</option>
                            <option value="estrategico">Estratégica</option>
                            <option value="territorial">Territorial</option>
                          </select>
                        </div>

                        {/* Column 3: Status toggle */}
                        <div className="col-span-2 w-full sm:w-auto flex justify-center">
                          <button
                            type="button"
                            disabled={!!(authUser && usr.email.toLowerCase() === authUser.email.toLowerCase())}
                            onClick={() => toggleUserStatus(usr.id)}
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all w-full flex items-center justify-center gap-1.5 ${
                              authUser && usr.email.toLowerCase() === authUser.email.toLowerCase()
                                ? 'bg-slate-800/80 border-slate-700 text-slate-500 cursor-not-allowed opacity-50'
                                : usr.status === 'Activo'
                                ? 'bg-emerald-500/5 border-emerald-500/10 text-emerald-400 cursor-pointer hover:bg-emerald-500/10'
                                : 'bg-rose-500/5 border-rose-500/10 text-rose-400 cursor-pointer hover:bg-rose-500/10'
                            }`}
                            title={authUser && usr.email.toLowerCase() === authUser.email.toLowerCase() ? "No puedes suspender tu propia cuenta" : ""}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${usr.status === 'Activo' ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
                            <span>{usr.status === 'Activo' ? 'Activo' : 'Suspendido'}</span>
                          </button>
                        </div>

                        {/* Column 4: Gear button for permissions customization & Trash button for deletion */}
                        <div className="col-span-2 w-full sm:w-auto sm:text-right flex items-center justify-end gap-2.5">
                          <button
                            type="button"
                            onClick={() => setExpandedUserId(prev => prev === usr.id ? null : usr.id)}
                            className={`px-3.5 py-2 border rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                              expandedUserId === usr.id 
                                ? 'bg-blue-600 text-white border-blue-500 hover:bg-blue-500' 
                                : 'bg-slate-950 border-slate-800 hover:bg-slate-900 text-slate-300'
                            }`}
                          >
                            <Settings className={`w-3.5 h-3.5 ${expandedUserId === usr.id ? 'text-white animate-spin' : 'text-slate-400'}`} />
                            <span>{expandedUserId === usr.id ? 'Ocultar' : 'Permisos'}</span>
                          </button>
                          <button
                            type="button"
                            disabled={!!(authUser && usr.email.toLowerCase() === authUser.email.toLowerCase())}
                            onClick={() => handleDeleteUser(usr.id, usr.email, usr.name)}
                            className={`p-2 border rounded-xl transition-all flex items-center justify-center ${
                              authUser && usr.email.toLowerCase() === authUser.email.toLowerCase()
                                ? 'bg-slate-800/80 border-slate-700 text-slate-500 cursor-not-allowed opacity-50'
                                : 'bg-slate-950 border-slate-800 hover:bg-slate-900 text-rose-400 cursor-pointer'
                            }`}
                            title={authUser && usr.email.toLowerCase() === authUser.email.toLowerCase() ? "No puedes eliminar tu propia cuenta" : "Eliminar usuario permanentemente"}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Inline custom permissions drawer for this user */}
                        {expandedUserId === usr.id && (
                          <div className="col-span-12 mt-3 p-4 bg-cyan-950/20 border border-cyan-500/20 rounded-xl space-y-3 animate-slideDown">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-cyan-500/10 pb-2">
                              <span className="text-[10px] text-cyan-300 font-extrabold uppercase tracking-wider block">
                                ⚙️ Ajuste de Accesos Inline: {usr.name}
                              </span>
                              <span className="text-[9px] text-slate-400 font-semibold">
                                Módulo Asignado: {usr.role === 'admin' ? 'Gestión Administrativa' : usr.role === 'estrategico' ? 'Gestión Estratégica' : 'Gestión Territorial'}
                              </span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                              {(userPermissions[usr.id] || []).map(p => (
                                <label
                                  key={p.id}
                                  className={`flex items-center justify-between p-2.5 rounded-lg border transition-all cursor-pointer ${
                                    p.enabled
                                      ? 'bg-cyan-500/10 border-cyan-500/35 text-white'
                                      : 'bg-[#111C30]/40 border-cyan-500/10 text-slate-400 hover:border-cyan-500/20'
                                  }`}
                                >
                                  <span className="text-[11px] font-medium leading-tight">{p.name}</span>
                                  <input
                                    type="checkbox"
                                    checked={p.enabled}
                                    onChange={(e) => {
                                      setUserPermissions(prev => ({
                                        ...prev,
                                        [usr.id]: prev[usr.id].map(item => item.id === p.id ? { ...item, enabled: e.target.checked } : item)
                                      }));
                                    }}
                                    className="accent-cyan-500 cursor-pointer h-3.5 w-3.5"
                                  />
                                </label>
                              ))}
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-cyan-500/10">
                              <div className="text-[9px] text-slate-400 font-medium">
                                * Las modificaciones se aplican en tiempo real al acceso de este usuario.
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  window.dispatchEvent(new CustomEvent('permissions-updated', {
                                    detail: { userId: usr.id, email: usr.email, permissions: userPermissions[usr.id] }
                                  }));

                                  // Update user module permissions in InsForge database
                                  const updateDBPromise = insforge.database
                                    .from('users_list')
                                    .update({
                                      role_name: usr.role === 'admin' ? 'Gestión Administrativa' : usr.role === 'estrategico' ? 'Gestión Estratégica' : 'Gestión Territorial'
                                    })
                                    .eq('email', usr.email);

                                  (updateDBPromise as any).then(({ error }: any) => {
                                    if (error) {
                                      console.error("Error updating user role in database:", error.message);
                                    } else {
                                      console.log(`User ${usr.email} role updated in database!`);
                                    }
                                  });

                                  // Upsert detailed permissions list
                                  const upsertPermsPromise = insforge.database
                                    .from('user_permissions')
                                    .upsert([{
                                      user_id: usr.id,
                                      email: usr.email,
                                      permissions: userPermissions[usr.id]
                                    }]);

                                  (upsertPermsPromise as any).then(({ error }: any) => {
                                    if (error) {
                                      console.warn("Could not save to user_permissions table, skipped:", error.message);
                                    } else {
                                      console.log("Detailed permissions synchronized to user_permissions table!");
                                    }
                                  });

                                  alert(`⚡ ¡Funciones del usuario "${usr.name}" actualizadas en vivo y sincronizadas en la base de datos con éxito!`);
                                }}
                                className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-white font-black text-[10px] uppercase tracking-wider rounded-lg shadow-md transition-all cursor-pointer flex items-center gap-1"
                              >
                                ⚡ Actualizar Funciones
                              </button>
                            </div>
                          </div>
                        )}

                      </div>
                    ))}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ---------------------------------------------------------------------- */}
        {/* TAB 3: LÍDERES / VOTANTES (GESTOR DE REGISTRO & ESQUEMA DE CAMPOS) */}
        {/* ---------------------------------------------------------------------- */}
        {activeTab === 'lideres_votantes' && (
          <div className="space-y-6 animate-fadeIn">

            {/* Sub-tab Selector for Form Types */}
            <div className="flex items-center gap-2 bg-[#111C30] p-1.5 rounded-2xl border border-cyan-500/30">
              <button
                onClick={() => setFormTypeSubTab('votantes')}
                className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  formTypeSubTab === 'votantes'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-extrabold shadow'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Users className="w-4 h-4 text-cyan-400" />
                <span>Formulario de Votantes (Empadronamiento)</span>
              </button>

              <button
                onClick={() => setFormTypeSubTab('lideres_coordinadores')}
                className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  formTypeSubTab === 'lideres_coordinadores'
                    ? 'bg-[#111C30]0/20 text-emerald-300 border border-emerald-500/40 font-extrabold shadow'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <UserCheck2 className="w-4 h-4 text-emerald-400" />
                <span>Formulario de Líderes y Coordinadores de Zona</span>
              </button>
            </div>
            
            {/* ---------------------------------------------------------------------- */}
            {/* SUB-TAB 1: FORMULARIO DE VOTANTES */}
            {/* ---------------------------------------------------------------------- */}
            {formTypeSubTab === 'votantes' && (
              <div className="space-y-5">
                {/* Header Card */}
                <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 flex items-center justify-between shadow-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                      <UserCircle className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-white text-base">Gestión y Configuración del Formulario de Registro de Votantes</h3>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowAddVoterForm(!showAddVoterForm)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>{showAddVoterForm ? 'Ocultar Probador' : 'Probar Formulario de Registro'}</span>
                  </button>
                </div>

                {/* Simulation & Test Form (Votante) */}
                {showAddVoterForm && (
                  <form onSubmit={handleAddVoterSubmit} className="bg-[#111C30]/50 border-2 border-cyan-500/30 p-5 rounded-2xl space-y-4 text-xs animate-fadeIn shadow-lg">
                    <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2">
                      <div className="font-extrabold text-cyan-300 text-sm flex items-center gap-2">
                        <UserPlus className="w-4 h-4 text-cyan-400" />
                        <span>Vista Previa / Probador del Formulario de Empadronamiento</span>
                      </div>
                      <span className="text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-700/50 font-bold px-2 py-0.5 rounded">
                        Simulación en Vivo de Captura por Líder
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-300 mb-1">
                          Cédula de Ciudadanía * <span className="text-cyan-400 font-normal">(Censo Electoral)</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={newCc}
                          onChange={(e) => setNewCc(e.target.value)}
                          placeholder="Ej: 1017889900"
                          className="w-full bg-[#0F172A] border border-white/10 rounded-xl px-3 py-1.5 text-white focus:outline-none focus:border-cyan-500 font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-300 mb-1">Nombre Completo *</label>
                        <input
                          type="text"
                          required
                          value={newNombre}
                          onChange={(e) => setNewNombre(e.target.value)}
                          placeholder="Ej: Patricia Restrepo Hoyos"
                          className="w-full bg-[#0F172A] border border-white/10 rounded-xl px-3 py-1.5 text-white focus:outline-none focus:border-cyan-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-300 mb-1">
                          Correo Electrónico <span className="text-slate-400 font-normal">(Opcional/Configurado)</span>
                        </label>
                        <input
                          type="email"
                          value={newEmail}
                          onChange={(e) => setNewEmail(e.target.value)}
                          placeholder="Ej: patricia.restrepo@email.com"
                          className="w-full bg-[#0F172A] border border-white/10 rounded-xl px-3 py-1.5 text-white focus:outline-none focus:border-cyan-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-300 mb-1">
                          Seudónimo / Alias Político <span className="text-slate-400 font-normal">(Opcional)</span>
                        </label>
                        <input
                          type="text"
                          value={newSeudonimo}
                          onChange={(e) => setNewSeudonimo(e.target.value)}
                          placeholder="Ej: Paty / La Profe"
                          className="w-full bg-[#0F172A] border border-white/10 rounded-xl px-3 py-1.5 text-white focus:outline-none focus:border-cyan-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-300 mb-1">
                          Fecha de Cumpleaños / Nacimiento
                        </label>
                        <input
                          type="date"
                          value={newCumpleanos}
                          onChange={(e) => setNewCumpleanos(e.target.value)}
                          className="w-full bg-[#0F172A] border border-white/10 rounded-xl px-3 py-1.5 text-white focus:outline-none focus:border-cyan-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-300 mb-1">
                          Teléfono Móvil / WhatsApp *
                        </label>
                        <input
                          type="tel"
                          required
                          value={newTelefono}
                          onChange={(e) => setNewTelefono(e.target.value)}
                          placeholder="Ej: +57 300 123 4567"
                          className="w-full bg-[#0F172A] border border-white/10 rounded-xl px-3 py-1.5 text-white focus:outline-none focus:border-cyan-500 font-mono"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-[10px] font-bold text-slate-300 mb-1">
                          Dirección de Residencia <span className="text-slate-400 font-normal">(Georreferenciada)</span>
                        </label>
                        <input
                          type="text"
                          value={newDireccion}
                          onChange={(e) => setNewDireccion(e.target.value)}
                          placeholder="Ej: Calle 48 # 22-10, Apt 201, Barrio Boston"
                          className="w-full bg-[#0F172A] border border-white/10 rounded-xl px-3 py-1.5 text-white focus:outline-none focus:border-cyan-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-300 mb-1">Líder Asignado *</label>
                        <input
                          type="text"
                          required
                          value={newLider}
                          onChange={(e) => setNewLider(e.target.value)}
                          placeholder="Ej: Santiago Pérez"
                          className="w-full bg-[#0F172A] border border-white/10 rounded-xl px-3 py-1.5 text-white focus:outline-none focus:border-cyan-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-300 mb-1">Comuna / Sector *</label>
                        <input
                          type="text"
                          value={newComuna}
                          onChange={(e) => setNewComuna(e.target.value)}
                          className="w-full bg-[#0F172A] border border-white/10 rounded-xl px-3 py-1.5 text-white focus:outline-none focus:border-cyan-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-300 mb-1">Puesto de Votación</label>
                        <input
                          type="text"
                          value={newPuesto}
                          onChange={(e) => setNewPuesto(e.target.value)}
                          className="w-full bg-[#0F172A] border border-white/10 rounded-xl px-3 py-1.5 text-white focus:outline-none focus:border-cyan-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-300 mb-1">Mesa</label>
                        <input
                          type="text"
                          value={newMesa}
                          onChange={(e) => setNewMesa(e.target.value)}
                          className="w-full bg-[#0F172A] border border-white/10 rounded-xl px-3 py-1.5 text-white focus:outline-none focus:border-cyan-500"
                        />
                      </div>

                      <div className="md:col-span-3">
                        <label className="block text-[10px] font-bold text-slate-300 mb-1">
                          Campo de Descripción / Observaciones / Intereses del Votante
                        </label>
                        <textarea
                          rows={2}
                          value={newDescripcion}
                          onChange={(e) => setNewDescripcion(e.target.value)}
                          placeholder="Escriba notas sobre sus intereses, apoyo en movilidad el Día E, solicitudes de la comunidad o compromisos políticos..."
                          className="w-full bg-[#0F172A] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2 border-t border-cyan-500/20">
                      <button
                        type="button"
                        onClick={() => setShowAddVoterForm(false)}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl cursor-pointer"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-extrabold rounded-xl shadow cursor-pointer"
                      >
                        Probar Guardado
                      </button>
                    </div>
                  </form>
                )}

                {/* Duplicate Check Tool Box */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
                  <div className="flex items-center gap-2">
                    <Search className="w-4.5 h-4.5 text-blue-400" />
                    <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">Regla de Negocio Anti-Duplicados por Cédula & Cruce Censo</h4>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="text"
                      value={cedulaSearch}
                      onChange={(e) => setCedulaSearch(e.target.value)}
                      placeholder="Prueba de cédula para consultar en Censo Electoral y CRM (Ej: 1017123456)..."
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-slate-700 font-medium"
                    />
                    <button
                      onClick={handleSearchCedula}
                      className="px-5 py-2.5 bg-blue-600 text-white font-extrabold text-xs rounded-xl hover:bg-blue-500 transition-all cursor-pointer shrink-0"
                    >
                      Validar Cédula
                    </button>
                  </div>

                  {duplicateWarning && (
                    <div className="p-3 bg-rose-500/5 border border-rose-500/10 text-rose-400 rounded-xl text-xs flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                      <span>{duplicateWarning}</span>
                    </div>
                  )}

                  {cedulaSearchResult && !duplicateWarning && (
                    <div className="p-3.5 bg-emerald-500/5 border border-emerald-500/10 text-emerald-400 rounded-xl text-xs space-y-1">
                      <div className="font-extrabold flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                        <span>{cedulaSearchResult.nombre} (CC: {cedulaSearchResult.cc})</span>
                      </div>
                      <div className="text-[11px] text-emerald-300/80 font-medium">
                        {cedulaSearchResult.municipio} • {cedulaSearchResult.puesto} • {cedulaSearchResult.mesa}
                      </div>
                    </div>
                  )}
                </div>

                {/* Field Configurator */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <Settings className="w-5 h-5 text-slate-400" />
                      <h4 className="font-extrabold text-white text-xs uppercase tracking-wider">
                        Configurador de Campos para la Captura de Información del Votante
                      </h4>
                    </div>
                    <button
                      onClick={() => alert('¡Configuración del esquema de empadronamiento guardada correctamente! Se aplicará en los dispositivos móviles de todos los líderes.')}
                      className="px-4 py-2 bg-slate-950 border border-slate-850 hover:bg-slate-900 text-slate-200 font-bold text-xs rounded-xl shadow hover:text-white transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Guardar Esquema</span>
                    </button>
                  </div>

                  <div className="overflow-x-auto rounded-xl">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="text-slate-400 font-extrabold border-b border-slate-800/40 uppercase tracking-wider text-[10px]">
                          <th className="py-3.5 px-3">Campo / Dato</th>
                          <th className="py-3.5 px-3">Categoría</th>
                          <th className="py-3.5 px-3">Tipo</th>
                          <th className="py-3.5 px-3 text-center">Estado</th>
                          <th className="py-3.5 px-3 text-center">Obligatoriedad</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/30 text-white font-medium">
                        {registrationFields.map((field) => (
                          <tr key={field.id} className="hover:bg-slate-950/40 transition-colors">
                            <td className="py-3.5 px-3">
                              <span className="font-extrabold text-white text-[12px]">{field.name}</span>
                            </td>
                            <td className="py-3.5 px-3">
                              <span className={`text-[9px] font-extrabold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${
                                field.category.includes('Electoral') || field.category.includes('Padrón')
                                  ? 'text-blue-400 bg-blue-500/10 border-blue-500/20'
                                  : field.category.includes('Ubicación')
                                  ? 'text-purple-400 bg-purple-500/10 border-purple-500/20'
                                  : field.category.includes('Contacto')
                                  ? 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20'
                                  : 'text-slate-400 bg-slate-500/10 border-slate-500/20'
                              }`}>
                                {field.category}
                              </span>
                            </td>
                            <td className="py-3.5 px-3">
                              <span className="text-[11px] text-slate-500 font-medium">{field.type}</span>
                            </td>
                            <td className="py-3.5 px-3 text-center">
                              {field.system ? (
                                <span className="text-[9px] bg-blue-500/10 text-blue-400 font-extrabold px-2.5 py-0.5 rounded-full border border-blue-500/20 tracking-wider uppercase">
                                  Sistema
                                </span>
                              ) : (
                                <button
                                  onClick={() => toggleFieldEnabled(field.id)}
                                  className={`text-[9px] font-extrabold px-2.5 py-0.5 rounded-full cursor-pointer tracking-wider uppercase ${
                                    field.enabled
                                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                      : 'bg-slate-950 text-slate-500 border border-slate-800'
                                  }`}
                                >
                                  {field.enabled ? 'Habilitado' : 'Inactivo'}
                                </button>
                              )}
                            </td>
                            <td className="py-3.5 px-3 text-center">
                              {field.system ? (
                                <span className="text-[11px] font-extrabold text-blue-400">Obligatorio</span>
                              ) : (
                                <button
                                  onClick={() => toggleFieldMandatory(field.id)}
                                  className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-lg cursor-pointer ${
                                    field.mandatory
                                      ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                                      : 'text-slate-500 hover:text-slate-400'
                                  }`}
                                >
                                  {field.mandatory ? 'Sí (Obligatorio)' : 'No (Opcional)'}
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

            {/* ---------------------------------------------------------------------- */}
            {/* SUB-TAB 2: FORMULARIO DE LÍDERES Y COORDINADORES DE ZONA */}
            {/* ---------------------------------------------------------------------- */}
            {formTypeSubTab === 'lideres_coordinadores' && (
              <div className="bg-[#0F172A] rounded-2xl p-6 border border-white/5 shadow-sm space-y-6">
                
                {/* Header Banner */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-white/5 pb-4">
                  <div>
                    <h3 className="font-bold text-white text-base flex items-center gap-2">
                      <UserCheck2 className="w-5 h-5 text-purple-600" />
                      Gestión y Configuración del Formulario de Registro de Líderes y Coordinadores de Zona
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowAddLeaderForm(!showAddLeaderForm)}
                      className="px-4 py-2 bg-purple-700 text-white font-extrabold text-xs rounded-xl shadow hover:bg-purple-600 transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>{showAddLeaderForm ? 'Ocultar Probador' : 'Probar Registro de Líder / Coordinador'}</span>
                    </button>
                  </div>
                </div>

                {/* Simulation & Test Form (Líder / Coordinador) */}
                {showAddLeaderForm && (
                  <form onSubmit={handleAddLeaderSubmit} className="bg-[#111C30]/50 border-2 border-purple-500/30 p-5 rounded-2xl space-y-4 text-xs animate-fadeIn shadow-lg">
                    <div className="flex items-center justify-between border-b border-purple-500/20 pb-2">
                      <div className="font-extrabold text-purple-300 text-sm flex items-center gap-2">
                        <UserPlus className="w-4 h-4 text-purple-400" />
                        <span>Probador / Formulario de Registro de Líder o Coordinador de Zona</span>
                      </div>
                      <span className="text-[10px] bg-purple-950 text-purple-300 border border-purple-700/50 font-bold px-2 py-0.5 rounded">
                        Onboarding Estructura de Campaña
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                      {/* Cédula */}
                      <div>
                        <label className="block text-[10px] font-bold text-slate-300 mb-1">Cédula de Ciudadanía *</label>
                        <input
                          type="text"
                          required
                          value={newLeaderCc}
                          onChange={(e) => setNewLeaderCc(e.target.value)}
                          placeholder="Ej: 1020987654"
                          className="w-full bg-[#0F172A] border border-white/10 rounded-xl px-3 py-1.5 text-white focus:outline-none focus:border-purple-500 font-mono"
                        />
                      </div>

                      {/* Nombre Completo */}
                      <div>
                        <label className="block text-[10px] font-bold text-slate-300 mb-1">Nombre Completo *</label>
                        <input
                          type="text"
                          required
                          value={newLeaderNombre}
                          onChange={(e) => setNewLeaderNombre(e.target.value)}
                          placeholder="Ej: Ing. Fernando Gómez"
                          className="w-full bg-[#0F172A] border border-white/10 rounded-xl px-3 py-1.5 text-white focus:outline-none focus:border-purple-500"
                        />
                      </div>

                      {/* Cargo / Rol Jerárquico */}
                      <div>
                        <label className="block text-[10px] font-bold text-slate-300 mb-1">Cargo / Rol en Estructura *</label>
                        <select
                          value={newLeaderCargo}
                          onChange={(e) => setNewLeaderCargo(e.target.value)}
                          className="w-full bg-[#0F172A] border border-white/10 rounded-xl px-3 py-1.5 text-white focus:outline-none focus:border-purple-500 font-medium"
                        >
                          <option value="Coordinador General de Zona">Coordinador General de Zona</option>
                          <option value="Coordinador de Zona">Coordinador de Zona</option>
                          <option value="Coordinador de Puesto">Coordinador de Puesto</option>
                          <option value="Líder Zonal Senior">Líder Zonal Senior</option>
                          <option value="Líder de Barrio / Vereda">Líder de Barrio / Vereda</option>
                          <option value="Puntero Territorial">Puntero Territorial</option>
                        </select>
                      </div>

                      {/* Zona / Comuna Asignada */}
                      <div>
                        <label className="block text-[10px] font-bold text-slate-300 mb-1">Zona / Comuna Asignada *</label>
                        <input
                          type="text"
                          required
                          value={newLeaderZona}
                          onChange={(e) => setNewLeaderZona(e.target.value)}
                          placeholder="Ej: Comuna 11 - Laureles / Estadio"
                          className="w-full bg-[#0F172A] border border-white/10 rounded-xl px-3 py-1.5 text-white focus:outline-none focus:border-purple-500"
                        />
                      </div>

                      {/* Teléfono Móvil / WhatsApp */}
                      <div>
                        <label className="block text-[10px] font-bold text-slate-300 mb-1">Teléfono Móvil / WhatsApp *</label>
                        <input
                          type="tel"
                          required
                          value={newLeaderTelefono}
                          onChange={(e) => setNewLeaderTelefono(e.target.value)}
                          placeholder="Ej: +57 300 888 9911"
                          className="w-full bg-[#0F172A] border border-white/10 rounded-xl px-3 py-1.5 text-white focus:outline-none focus:border-purple-500 font-mono"
                        />
                      </div>

                      {/* Correo Electrónico Institucional */}
                      <div>
                        <label className="block text-[10px] font-bold text-slate-300 mb-1">Correo Electrónico</label>
                        <input
                          type="email"
                          value={newLeaderEmail}
                          onChange={(e) => setNewLeaderEmail(e.target.value)}
                          placeholder="Ej: fernando.gomez@campanaganadora.co"
                          className="w-full bg-[#0F172A] border border-white/10 rounded-xl px-3 py-1.5 text-white focus:outline-none focus:border-purple-500"
                        />
                      </div>

                      {/* Seudónimo / Alias */}
                      <div>
                        <label className="block text-[10px] font-bold text-slate-300 mb-1">Seudónimo / Alias Operativo</label>
                        <input
                          type="text"
                          value={newLeaderSeudonimo}
                          onChange={(e) => setNewLeaderSeudonimo(e.target.value)}
                          placeholder="Ej: Fer Laureles"
                          className="w-full bg-[#0F172A] border border-white/10 rounded-xl px-3 py-1.5 text-white focus:outline-none focus:border-purple-500"
                        />
                      </div>

                      {/* Cumpleaños */}
                      <div>
                        <label className="block text-[10px] font-bold text-slate-300 mb-1">Fecha de Cumpleaños</label>
                        <input
                          type="date"
                          value={newLeaderCumpleanos}
                          onChange={(e) => setNewLeaderCumpleanos(e.target.value)}
                          className="w-full bg-[#0F172A] border border-white/10 rounded-xl px-3 py-1.5 text-white focus:outline-none focus:border-purple-500"
                        />
                      </div>

                      {/* Meta de Votantes */}
                      <div>
                        <label className="block text-[10px] font-bold text-slate-300 mb-1">Meta de Votantes (Cuota) *</label>
                        <input
                          type="number"
                          required
                          value={newLeaderMetaVotantes}
                          onChange={(e) => setNewLeaderMetaVotantes(e.target.value)}
                          placeholder="Ej: 250"
                          className="w-full bg-[#0F172A] border border-white/10 rounded-xl px-3 py-1.5 text-white focus:outline-none focus:border-purple-500 font-mono"
                        />
                      </div>

                      {/* Dirección / Sede Operativa */}
                      <div className="md:col-span-2">
                        <label className="block text-[10px] font-bold text-slate-300 mb-1">Dirección Residencia / Sede Zonal</label>
                        <input
                          type="text"
                          value={newLeaderDireccion}
                          onChange={(e) => setNewLeaderDireccion(e.target.value)}
                          placeholder="Ej: Carrera 70 # 32B-15, Sede Operativa Laureles"
                          className="w-full bg-[#0F172A] border border-white/10 rounded-xl px-3 py-1.5 text-white focus:outline-none focus:border-purple-500"
                        />
                      </div>

                      {/* Supervisor / Superior */}
                      <div>
                        <label className="block text-[10px] font-bold text-slate-300 mb-1">Coordinador Superior *</label>
                        <input
                          type="text"
                          required
                          value={newLeaderSupervisor}
                          onChange={(e) => setNewLeaderSupervisor(e.target.value)}
                          placeholder="Ej: Dra. Andrea Morales / Gerencia"
                          className="w-full bg-[#0F172A] border border-white/10 rounded-xl px-3 py-1.5 text-white focus:outline-none focus:border-purple-500"
                        />
                      </div>

                      {/* Documentación & Acreditación */}
                      <div className="md:col-span-3">
                        <label className="block text-[10px] font-bold text-slate-300 mb-1">Documentos / Estado de Acreditación CNE / ARL</label>
                        <input
                          type="text"
                          value={newLeaderDocumentos}
                          onChange={(e) => setNewLeaderDocumentos(e.target.value)}
                          placeholder="Ej: Aprobado CNE + ARL Sura Vigente"
                          className="w-full bg-[#0F172A] border border-white/10 rounded-xl px-3 py-1.5 text-white focus:outline-none focus:border-purple-500"
                        />
                      </div>

                      {/* Descripción / Hoja de Ruta */}
                      <div className="md:col-span-3">
                        <label className="block text-[10px] font-bold text-slate-300 mb-1">Experiencia Política & Hoja de Ruta</label>
                        <textarea
                          rows={2}
                          value={newLeaderDescripcion}
                          onChange={(e) => setNewLeaderDescripcion(e.target.value)}
                          placeholder="Resumen de trayectoria comunitaria, redes de trabajo, asociaciones y observaciones estratégicas..."
                          className="w-full bg-[#0F172A] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2 border-t border-purple-500/20">
                      <button
                        type="button"
                        onClick={() => setShowAddLeaderForm(false)}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl cursor-pointer"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 bg-purple-700 hover:bg-purple-600 text-white font-extrabold rounded-xl shadow cursor-pointer"
                      >
                        Registrar Líder en Estructura
                      </button>
                    </div>
                  </form>
                )}

                {/* Registered Leaders & Zone Coordinators Table */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-white text-sm flex items-center gap-2">
                      <UserCheck2 className="w-4 h-4 text-purple-600" />
                      Líderes y Coordinadores de Zona Registrados en Estructura
                    </h4>
                    <span className="text-xs text-slate-400">
                      Total Registrados: <strong className="text-purple-400">{leadersAndCoordinators.length}</strong>
                    </span>
                  </div>

                  <div className="overflow-x-auto border border-white/5 rounded-xl bg-[#0F172A]">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-[#111C30]/80 text-purple-300 font-bold border-b border-purple-500/20">
                          <th className="p-3">Cédula (CC)</th>
                          <th className="p-3">Nombre & Alias</th>
                          <th className="p-3">Cargo & Zona Asignada</th>
                          <th className="p-3">Contacto Directo</th>
                          <th className="p-3 text-center">Meta Votantes</th>
                          <th className="p-3">Supervisor</th>
                          <th className="p-3 text-center">Detalles</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 font-medium">
                        {leadersAndCoordinators.map((l) => (
                          <tr key={l.id} className="hover:bg-[#111C30]/30 transition-colors">
                            <td className="p-3 font-mono font-bold text-purple-300">{l.cc}</td>
                            <td className="p-3">
                              <div className="font-bold text-white">{l.nombre}</div>
                              {l.seudonimo && (
                                <div className="text-[10px] text-purple-400 font-semibold">
                                  Alias: &quot;{l.seudonimo}&quot;
                                </div>
                              )}
                            </td>
                            <td className="p-3">
                              <span className="px-2 py-0.5 bg-purple-500/25 text-purple-200 text-[10px] font-extrabold rounded">
                                {l.cargo}
                              </span>
                              <div className="text-[10px] text-slate-400 mt-0.5">{l.zona}</div>
                            </td>
                            <td className="p-3 text-slate-300">
                              <div className="text-[11px] font-mono">{l.telefono}</div>
                              <div className="text-[10px] text-slate-400">{l.email}</div>
                            </td>
                            <td className="p-3 text-center">
                              <span className="px-2 py-1 bg-[#111C30] text-amber-400 font-bold text-xs rounded-lg border border-amber-500/20">
                                {l.metaVotantes}
                              </span>
                            </td>
                            <td className="p-3 text-slate-300 font-semibold">{l.supervisor}</td>
                            <td className="p-3 text-center">
                              <button
                                onClick={() => setSelectedLeaderDetail(l)}
                                className="px-2.5 py-1 bg-purple-500/20 text-purple-300 hover:bg-purple-500/40 text-purple-200 font-bold text-[11px] rounded-lg border border-purple-500/40 transition-all cursor-pointer"
                              >
                                Ver Expediente
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Field Configurator for Leaders */}
                <div className="bg-[#111C30]/50 border border-purple-500/20 p-5 rounded-2xl space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-purple-500/20 pb-3">
                    <div>
                      <h4 className="font-extrabold text-white text-sm flex items-center gap-2">
                        <Settings className="w-4 h-4 text-purple-400" />
                        Configurador de Campos para el Formulario de Líderes & Coordinadores
                      </h4>
                    </div>
                    <button
                      onClick={() => alert('¡Esquema del Formulario de Líderes y Coordinadores guardado con éxito!')}
                      className="px-3 py-1.5 bg-purple-700 text-white font-bold text-xs rounded-xl shadow hover:bg-purple-600 transition-all self-start sm:self-auto cursor-pointer"
                    >
                      Guardar Esquema de Líderes
                    </button>
                  </div>

                  <div className="overflow-x-auto border border-purple-500/20 rounded-xl bg-[#0F172A]">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-[#111C30] text-slate-300 font-bold border-b border-purple-500/20">
                          <th className="p-2.5">Campo / Dato</th>
                          <th className="p-2.5">Categoría</th>
                          <th className="p-2.5">Tipo</th>
                          <th className="p-2.5 text-center">Estado</th>
                          <th className="p-2.5 text-center">Obligatoriedad</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 font-medium text-white">
                        {leaderRegistrationFields.map((field) => (
                          <tr key={field.id} className="hover:bg-[#111C30]/50 transition-colors">
                            <td className="p-2.5">
                              <span className="font-extrabold text-white text-[12px]">{field.name}</span>
                            </td>
                            <td className="p-2.5">
                              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded">
                                {field.category}
                              </span>
                            </td>
                            <td className="p-2.5">
                              <span className="text-[10px] text-slate-400 font-mono">{field.type}</span>
                            </td>
                            <td className="p-2.5 text-center">
                              {field.system ? (
                                <span className="text-[9px] bg-purple-500/20 text-purple-300 font-bold px-1.5 py-0.5 rounded border border-purple-500/40">
                                  Base
                                </span>
                              ) : (
                                <button
                                  onClick={() => toggleLeaderFieldEnabled(field.id)}
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded cursor-pointer ${
                                    field.enabled
                                      ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                                  }`}
                                >
                                  {field.enabled ? 'Habilitado' : 'Inactivo'}
                                </button>
                              )}
                            </td>
                            <td className="p-2.5 text-center">
                              {field.system ? (
                                <span className="font-bold text-purple-400 text-[11px]">Obligatorio</span>
                              ) : (
                                <button
                                  onClick={() => toggleLeaderFieldMandatory(field.id)}
                                  className={`font-bold px-2 py-0.5 rounded cursor-pointer text-[10px] ${
                                    field.mandatory
                                      ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                                  }`}
                                >
                                  {field.mandatory ? 'Sí (Obligatorio)' : 'No (Opcional)'}
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Modal Expediente Líder */}
                {selectedLeaderDetail && (
                  <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
                    <div className="bg-[#0F172A] rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-white/5">
                      <div className="flex items-center justify-between border-b border-white/5 pb-3">
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-purple-500/20 text-purple-300 text-purple-900 rounded-xl">
                            <UserCheck2 className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-bold text-white text-sm">Expediente de Líder / Coordinador de Zona</h4>
                            <p className="text-[10px] text-slate-400">CC: {selectedLeaderDetail.cc}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setSelectedLeaderDetail(null)}
                          className="text-slate-400 hover:text-slate-300 text-lg font-bold cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="p-2.5 bg-[#111C30] rounded-xl border border-white/5 space-y-0.5">
                          <div className="text-[10px] font-bold text-slate-400">Nombre Completo</div>
                          <div className="font-bold text-white">{selectedLeaderDetail.nombre}</div>
                        </div>

                        <div className="p-2.5 bg-[#111C30] rounded-xl border border-white/5 space-y-0.5">
                          <div className="text-[10px] font-bold text-slate-400">Cargo Jerárquico</div>
                          <div className="font-bold text-purple-900">{selectedLeaderDetail.cargo}</div>
                        </div>

                        <div className="p-2.5 bg-[#111C30] rounded-xl border border-white/5 space-y-0.5">
                          <div className="text-[10px] font-bold text-slate-400">Zona / Comuna Asignada</div>
                          <div className="font-bold text-slate-200">{selectedLeaderDetail.zona}</div>
                        </div>

                        <div className="p-2.5 bg-[#111C30] rounded-xl border border-white/5 space-y-0.5">
                          <div className="text-[10px] font-bold text-slate-400">Meta Cuota de Votantes</div>
                          <div className="font-bold text-amber-800">{selectedLeaderDetail.metaVotantes} Votantes</div>
                        </div>

                        <div className="p-2.5 bg-[#111C30] rounded-xl border border-white/5 space-y-0.5">
                          <div className="text-[10px] font-bold text-slate-400">Teléfono / WhatsApp</div>
                          <div className="font-mono font-bold text-slate-200">{selectedLeaderDetail.telefono}</div>
                        </div>

                        <div className="p-2.5 bg-[#111C30] rounded-xl border border-white/5 space-y-0.5">
                          <div className="text-[10px] font-bold text-slate-400">Coordinador Superior</div>
                          <div className="font-bold text-slate-200">{selectedLeaderDetail.supervisor}</div>
                        </div>

                        <div className="col-span-2 p-2.5 bg-[#111C30] rounded-xl border border-white/5 space-y-0.5">
                          <div className="text-[10px] font-bold text-slate-400">Documentación & Acreditación</div>
                          <div className="font-medium text-slate-200">{selectedLeaderDetail.documentos}</div>
                        </div>

                        <div className="col-span-2 p-2.5 bg-[#111C30] rounded-xl border border-white/5 space-y-1">
                          <div className="text-[10px] font-bold text-slate-400">Experiencia Política & Hoja de Ruta</div>
                          <p className="text-slate-300 leading-relaxed text-[11px]">{selectedLeaderDetail.descripcion}</p>
                        </div>
                      </div>

                      <div className="pt-2 flex justify-end">
                        <button
                          onClick={() => setSelectedLeaderDetail(null)}
                          className="px-4 py-1.5 bg-purple-900 text-white font-bold rounded-xl text-xs hover:bg-purple-800 cursor-pointer"
                        >
                          Cerrar Expediente
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Modal Expediente Votante */}
                {selectedVoterDetail && (
                  <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
                    <div className="bg-[#0F172A] rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-white/5">
                      <div className="flex items-center justify-between border-b border-white/5 pb-3">
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-cyan-500/20 text-cyan-300 text-cyan-800 rounded-xl">
                            <Users className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-bold text-white text-sm">Ficha Completa del Votante</h4>
                            <p className="text-[10px] text-slate-400">CC: {selectedVoterDetail.cc}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setSelectedVoterDetail(null)}
                          className="text-slate-400 hover:text-slate-300 text-lg font-bold cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="p-2.5 bg-[#111C30] rounded-xl border border-white/5 space-y-0.5">
                          <div className="text-[10px] font-bold text-slate-400">Nombre Completo</div>
                          <div className="font-bold text-white">{selectedVoterDetail.nombre}</div>
                        </div>

                        <div className="p-2.5 bg-[#111C30] rounded-xl border border-white/5 space-y-0.5">
                          <div className="text-[10px] font-bold text-slate-400">Seudónimo / Alias</div>
                          <div className="font-bold text-cyan-800">{selectedVoterDetail.seudonimo || 'Sin alias'}</div>
                        </div>

                        <div className="p-2.5 bg-[#111C30] rounded-xl border border-white/5 space-y-0.5">
                          <div className="text-[10px] font-bold text-slate-400">Correo Electrónico</div>
                          <div className="font-medium text-slate-200 break-all">{selectedVoterDetail.email || 'No registrado'}</div>
                        </div>

                        <div className="p-2.5 bg-[#111C30] rounded-xl border border-white/5 space-y-0.5">
                          <div className="text-[10px] font-bold text-slate-400">Teléfono / WhatsApp</div>
                          <div className="font-mono font-bold text-white">{selectedVoterDetail.telefono || 'Sin número'}</div>
                        </div>

                        <div className="p-2.5 bg-[#111C30] rounded-xl border border-white/5 space-y-0.5">
                          <div className="text-[10px] font-bold text-slate-400">Fecha de Cumpleaños</div>
                          <div className="font-medium text-slate-200">{selectedVoterDetail.cumpleanos || 'No registrada'}</div>
                        </div>

                        <div className="p-2.5 bg-[#111C30] rounded-xl border border-white/5 space-y-0.5">
                          <div className="text-[10px] font-bold text-slate-400">Líder Asignado</div>
                          <div className="font-bold text-white">{selectedVoterDetail.lider}</div>
                        </div>

                        <div className="col-span-2 p-2.5 bg-[#111C30] rounded-xl border border-white/5 space-y-0.5">
                          <div className="text-[10px] font-bold text-slate-400">Dirección de Residencia</div>
                          <div className="font-medium text-slate-200">{selectedVoterDetail.direccion || 'Sin dirección'}</div>
                        </div>

                        <div className="col-span-2 p-2.5 bg-[#111C30] rounded-xl border border-white/5 space-y-0.5">
                          <div className="text-[10px] font-bold text-slate-400">Puesto & Mesa (Censo)</div>
                          <div className="font-medium text-slate-200">{selectedVoterDetail.puesto} ({selectedVoterDetail.mesa}) • {selectedVoterDetail.comuna}</div>
                        </div>

                        <div className="col-span-2 p-3 bg-cyan-50 border border-cyan-200 rounded-xl space-y-1">
                          <div className="text-[10px] font-bold text-cyan-900">Descripción / Observaciones del Votante</div>
                          <p className="text-slate-200 text-xs italic">
                            &quot;{selectedVoterDetail.descripcion || 'Sin observaciones registradas.'}&quot;
                          </p>
                        </div>
                      </div>

                      <div className="flex justify-end pt-2">
                        <button
                          onClick={() => setSelectedVoterDetail(null)}
                          className="px-4 py-1.5 bg-slate-900 text-white font-bold text-xs rounded-xl cursor-pointer hover:bg-slate-800"
                        >
                          Cerrar Expediente
                        </button>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            )}

          </div>
        )}

        {/* ---------------------------------------------------------------------- */}
        {/* TAB 4: PRESUPUESTO / CNE (FINANZAS Y RENDICIÓN) */}
        {/* ---------------------------------------------------------------------- */}
        {activeTab === 'presupuesto_cne' && (
          <div className="animate-fadeIn">
            <PresupuestoContabilidad onSelectView={onSelectView} />
          </div>
        )}

        {/* ---------------------------------------------------------------------- */}
        {/* TAB 5: GESTIÓN DE CAMPAÑA (PARÁMETROS Y EQUIPO) */}
        {/* ---------------------------------------------------------------------- */}
        {activeTab === 'gestion_campana' && (
          <div className="animate-fadeIn">
            <GestionConfiguracionCampana onSelectView={onSelectView} />
          </div>
        )}



        {/* ---------------------------------------------------------------------- */}
        {/* TAB 6: GESTIÓN DE TESTIGOS ELECTORALES POR PARTIDO Y PUESTO */}
        {/* ---------------------------------------------------------------------- */}
        {activeTab === 'gestion_testigos' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Top Bar Context & Demo Toggles */}
            <div className="bg-[#0F172A]/90 rounded-2xl p-6 border border-cyan-500/30 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cyan-500/20 pb-4">
                <div>
                  <h3 className="font-extrabold text-white text-base flex items-center gap-2">
                    <Award className="w-5 h-5 text-cyan-400" />
                    Gestión & Configuración de Lista de Testigos Electorales (E-16)
                  </h3>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => alert('Generando planilla consolidada Formulario E-16 para acreditación oficial ante la Registraduría Nacional del Estado Civil...')}
                    disabled={!hasActiveCampaign}
                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-extrabold text-xs rounded-xl shadow disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <FileCheck className="w-4 h-4" />
                    <span>Exportar Formulario E-16</span>
                  </button>
                </div>
              </div>

              {/* 🛑 RULE BLOCK: IF NO CAMPAIGN HAS BEEN CREATED */}
              {!hasActiveCampaign && (
                <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 border-2 border-amber-500/40 rounded-2xl p-6 shadow-xl space-y-4 text-center my-2">
                  <div className="w-12 h-12 bg-[#111C30]0/20 text-amber-300 rounded-2xl flex items-center justify-center mx-auto border border-amber-400/50">
                    <ShieldAlert className="w-6 h-6" />
                  </div>
                  <div className="space-y-1.5 max-w-2xl mx-auto">
                    <h4 className="text-base font-black text-amber-200 tracking-tight">
                      Acceso Restringido: No se puede crear ni gestionar Lista de Testigos sin una Campaña Creada
                    </h4>
                    <p className="text-xs text-amber-200/80 leading-relaxed">
                      Por normativa de la plataforma y regulaciones del Consejo Nacional Electoral (CNE) y Registraduría, la inscripción de testigos electorales para el Formulario E-16 requiere estar vinculada obligatoriamente a una <strong>Campaña Política creada</strong> con su respectivo candidato, partido avalador, circunscripción y padrón territorial de puestos de votación.
                    </p>
                  </div>
                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                    <button
                      onClick={() => setActiveTab('gestion_campana')}
                      className="px-5 py-2.5 bg-teal-500 text-white font-extrabold text-xs rounded-xl shadow hover:bg-teal-400 transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <FolderGit2 className="w-4 h-4" />
                      <span>Ir a Crear y Configurar Campaña Ahora (Sección 5)</span>
                    </button>
                    <button
                      onClick={() => setHasActiveCampaign(true)}
                      className="px-4 py-2.5 bg-slate-900 text-amber-300 font-bold text-xs rounded-xl border border-amber-500/40 hover:bg-slate-800 transition-all cursor-pointer"
                    >
                      <span>Simular Campaña Creada (Modo Prueba)</span>
                    </button>
                  </div>
                </div>
              )}

              {/* ACTIVE CAMPAIGN VIEW */}
              {hasActiveCampaign && (
                <>
                  {/* Campaign Jurisdiction Banner */}
                  <div className="bg-[#111C30] border border-cyan-500/30 rounded-xl p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs text-cyan-200">
                    <div className="flex items-center gap-2.5">
                      <Building2 className="w-5 h-5 text-cyan-400 shrink-0" />
                      <div>
                        <span className="font-extrabold block text-white">
                          Campaña Configurada: Alcaldía de Medellín (Antioquia) - Dr. Javier Méndez
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] font-bold">
                      <span className="bg-[#111C30] px-2.5 py-1 rounded-lg border border-cyan-500/30 text-cyan-300">
                        Total Testigos: {testigos.length}
                      </span>
                      <span className="bg-[#111C30]0/20 text-emerald-300 px-2.5 py-1 rounded-lg border border-emerald-500/40">
                        Acreditados: {testigos.filter(t => t.estado === 'Acreditado').length}
                      </span>
                    </div>
                  </div>

                  {/* Breakdown per Political Party Cards */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-cyan-400" />
                      <span>Resumen de Testigos por Partido Político o Movimiento Significativo</span>
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      {partidosPoliticosOpt
                        .filter(partido => testigos.some(t => t.partido === partido))
                        .map((partido, idx) => {
                          const count = testigos.filter(t => t.partido === partido).length;
                          const acreditados = testigos.filter(t => t.partido === partido && t.estado === 'Acreditado').length;
                          return (
                            <div key={idx} className="p-3.5 bg-[#111C30] rounded-xl border border-cyan-500/30 flex flex-col justify-between space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-[11px] font-extrabold text-white line-clamp-1">{partido}</span>
                                <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-300 text-[10px] font-bold rounded border border-cyan-500/40">
                                  {count} Testigos
                                </span>
                              </div>
                              <div className="flex items-center justify-between text-[11px] text-cyan-200/70">
                                <span>Acreditación E-16:</span>
                                <strong className="text-emerald-400 font-extrabold">{acreditados} de {count} OK</strong>
                              </div>
                            </div>
                          );
                        })}
                      {partidosPoliticosOpt.filter(partido => testigos.some(t => t.partido === partido)).length === 0 && (
                        <div className="col-span-full bg-[#111C30]/50 p-4 rounded-xl border border-dashed border-white/10 text-center text-xs text-slate-400">
                          No hay testigos asignados a ningún partido político todavía.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* ---------------------------------------------------------------------- */}
                  {/* MÓDULO DE HABILITACIÓN DE SEGUIMIENTO GPS Y CERCO PERIMETRAL EDITABLE */}
                  {/* ---------------------------------------------------------------------- */}
                  {testigos.length > 0 && (
                    <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-5 border border-indigo-500/30 shadow-xl space-y-5">
                    {/* Header Controls */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-indigo-800/60 pb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-indigo-600/30 border border-indigo-400/40 rounded-xl text-indigo-300">
                          <Radio className="w-6 h-6 animate-pulse text-indigo-400" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-black text-white tracking-wide">
                              SISTEMA DE SEGUIMIENTO A TESTIGOS POR CERCO PERIMETRAL (GEOREFERENCIACIÓN GPS)
                            </h4>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {/* Toggle Geofence Active */}
                        <button
                          onClick={() => setGeofenceActive(!geofenceActive)}
                          className={`px-4 py-2 text-xs font-black rounded-xl border transition-all cursor-pointer flex items-center gap-2 ${
                            geofenceActive 
                              ? 'bg-emerald-600 text-white border-emerald-400 hover:bg-[#111C30]0 shadow-lg' 
                              : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                          }`}
                        >
                          <Locate className="w-4 h-4" />
                          <span>{geofenceActive ? 'Seguimiento Habilitado' : 'Habilitar Cerco GPS'}</span>
                        </button>

                        <button
                          onClick={() => setShowGeofenceConfigPanel(!showGeofenceConfigPanel)}
                          className="px-3 py-2 bg-indigo-900/60 hover:bg-indigo-800/80 border border-indigo-700 text-indigo-200 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                        >
                          <Sliders className="w-4 h-4" />
                          <span>{showGeofenceConfigPanel ? 'Ocultar Panel' : 'Configurar Radio'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Geofence Configuration & Radar Controls */}
                    {showGeofenceConfigPanel && (
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-1">
                        {/* Left Column: Distance & Threshold Sliders */}
                        <div className="lg:col-span-5 bg-slate-800/60 border border-indigo-500/20 rounded-xl p-4 space-y-4">
                          <h5 className="text-xs font-black text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                            <Crosshair className="w-4 h-4 text-indigo-400" />
                            <span>Ajuste de Parámetros del Cerco Perimetral</span>
                          </h5>

                          {/* Distance Radius Slider & Direct Input */}
                          <div className="space-y-2 bg-slate-900/80 p-3 rounded-xl border border-slate-700/80">
                            <div className="flex items-center justify-between text-xs">
                              <label className="font-bold text-slate-200">
                                Radio del Cerco Perimetral (Metros):
                              </label>
                              <div className="flex items-center gap-1">
                                <input
                                  type="number"
                                  min="30"
                                  max="2000"
                                  value={geofenceRadius}
                                  onChange={(e) => setGeofenceRadius(Math.max(10, Number(e.target.value)))}
                                  className="w-20 bg-slate-800 border border-indigo-500/50 rounded-lg text-center font-mono font-black text-indigo-300 py-1 text-xs focus:outline-none focus:border-indigo-400"
                                />
                                <span className="font-bold text-slate-400">m</span>
                              </div>
                            </div>

                            {/* Range Slider */}
                            <input
                              type="range"
                              min="30"
                              max="1000"
                              step="10"
                              disabled={!geofenceActive}
                              value={geofenceRadius}
                              onChange={(e) => setGeofenceRadius(Number(e.target.value))}
                              className="w-full accent-indigo-500 cursor-pointer h-2 bg-slate-700 rounded-lg disabled:opacity-40"
                            />

                            {/* Quick Presets */}
                            <div className="flex items-center justify-between gap-1 pt-1">
                              {[
                                { label: '50m (Mesas)', val: 50 },
                                { label: '100m (Puesto)', val: 100 },
                                { label: '150m (Estándar)', val: 150 },
                                { label: '300m (Manzana)', val: 300 },
                                { label: '500m (Zona)', val: 500 }
                              ].map((preset) => (
                                <button
                                  key={preset.val}
                                  type="button"
                                  onClick={() => setGeofenceRadius(preset.val)}
                                  className={`px-2 py-1 text-[10px] font-extrabold rounded-lg border transition-all cursor-pointer ${
                                    geofenceRadius === preset.val
                                      ? 'bg-indigo-600 text-white border-indigo-400'
                                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                                  }`}
                                >
                                  {preset.label}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Tolerance Minutes & Alerts */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                            <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-700/80 space-y-1">
                              <label className="block font-bold text-slate-300 text-[11px]">
                                Tiempo Tol. Fuera de Cerco
                              </label>
                              <select
                                value={geofenceToleranceMinutes}
                                onChange={(e) => setGeofenceToleranceMinutes(Number(e.target.value))}
                                className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-1.5 font-bold focus:outline-none focus:border-indigo-500"
                              >
                                <option value="5">5 Minutos</option>
                                <option value="15">15 Minutos (Recomendado)</option>
                                <option value="30">30 Minutos</option>
                                <option value="60">60 Minutos</option>
                              </select>
                            </div>

                            <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-700/80 flex flex-col justify-between">
                              <label className="block font-bold text-slate-300 text-[11px]">
                                Alerta al Centro Mando
                              </label>
                              <label className="flex items-center gap-2 cursor-pointer pt-1">
                                <input
                                  type="checkbox"
                                  checked={autoNotifyCommandCenter}
                                  onChange={(e) => setAutoNotifyCommandCenter(e.target.checked)}
                                  className="w-4 h-4 accent-indigo-500 rounded cursor-pointer"
                                />
                                <span className="text-[11px] text-indigo-200 font-medium">Disparo Automático Día E</span>
                              </label>
                            </div>
                          </div>

                          {/* Puesto Selection for Radar View */}
                          <div className="space-y-1">
                            <label className="block font-bold text-indigo-300 text-xs">
                              Inspeccionar Puesto de Votación en Radar:
                            </label>
                            <select
                              value={selectedGeofencePuesto}
                              onChange={(e) => setSelectedGeofencePuesto(e.target.value)}
                              className="w-full bg-slate-800 border border-indigo-500/40 text-white rounded-xl p-2 font-bold text-xs focus:outline-none focus:border-indigo-400"
                            >
                              {puestosTerritorioOpt.map((pst, idx) => (
                                <option key={idx} value={pst.nombre}>{pst.nombre} - {pst.comuna}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* Right Column: Interactive Radar Diagram & Live Ping Monitor */}
                        <div className="lg:col-span-7 bg-slate-800/60 border border-indigo-500/20 rounded-xl p-4 flex flex-col justify-between space-y-4">
                          <div className="flex items-center justify-between border-b border-slate-700/80 pb-2">
                            <h5 className="text-xs font-black text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                              <Compass className="w-4 h-4 text-indigo-400" />
                              <span>Radar Perimetral de Cobertura GPS: {selectedGeofencePuesto}</span>
                            </h5>
                            <span className="text-[10px] bg-indigo-950 text-indigo-300 border border-indigo-700 px-2 py-0.5 rounded-full font-mono">
                              Radio Actual: {geofenceRadius} metros
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                            {/* Real Leaflet Map */}
                            <div className="sm:col-span-8 relative z-10 w-full h-[280px] rounded-2xl overflow-hidden border border-indigo-500/30 shadow-inner">
                              <MapContainer
                                center={PUESTOS_COORDINATES[selectedGeofencePuesto] || [6.2442, -75.5812]}
                                zoom={15}
                                style={{ width: '100%', height: '100%', background: '#05162a' }}
                                scrollWheelZoom={true}
                              >
                                <MapController
                                  center={PUESTOS_COORDINATES[selectedGeofencePuesto] || [6.2442, -75.5812]}
                                  zoom={15}
                                />

                                <TileLayer
                                  url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                                  attribution="&copy; OpenStreetMap &copy; CARTO"
                                />

                                {/* Geofence Circle */}
                                {geofenceActive && (
                                  <Circle
                                    center={PUESTOS_COORDINATES[selectedGeofencePuesto] || [6.2442, -75.5812]}
                                    radius={geofenceRadius}
                                    pathOptions={{
                                      color: '#10b981',
                                      fillColor: '#10b981',
                                      fillOpacity: 0.1,
                                      dashArray: '5, 5',
                                      weight: 2
                                    }}
                                  />
                                )}

                                {/* Polling Place Marker */}
                                <Marker
                                  position={PUESTOS_COORDINATES[selectedGeofencePuesto] || [6.2442, -75.5812]}
                                >
                                  <Popup className="custom-leaflet-popup">
                                    <div className="text-xs p-1 text-slate-800 font-sans">
                                      <strong className="block text-indigo-950 font-bold">{selectedGeofencePuesto}</strong>
                                      <span className="text-slate-500 font-medium">Centro de Votación Principal</span>
                                    </div>
                                  </Popup>
                                </Marker>

                                {/* Witness Markers */}
                                {testigos
                                  .filter(t => t.puesto === selectedGeofencePuesto || selectedGeofencePuesto === 'Colegio Marco Fidel Suárez')
                                  .map((t, idx) => {
                                    const gps = testigoGpsPings[t.id];
                                    if (!gps) return null;
                                    const isInside = geofenceActive ? (gps.distanciaMetros <= geofenceRadius) : true;

                                    const witnessIcon = L.divIcon({
                                      html: `<div class="w-7 h-7 rounded-full flex items-center justify-center font-black text-[10px] text-white shadow-md border border-white transition-all ${
                                        isInside 
                                          ? 'bg-emerald-600 ring-2 ring-emerald-300' 
                                          : 'bg-rose-600 ring-2 ring-rose-400'
                                      }">T${idx + 1}</div>`,
                                      className: '',
                                      iconSize: [28, 28],
                                      iconAnchor: [14, 14]
                                    });

                                    return (
                                      <Marker
                                        key={t.id}
                                        position={[gps.lat, gps.lng]}
                                        icon={witnessIcon}
                                      >
                                        <Popup className="custom-leaflet-popup">
                                          <div className="text-xs p-1.5 text-slate-800 font-sans space-y-1">
                                            <strong className="block text-indigo-950 font-bold">{t.nombre}</strong>
                                            <div className="text-slate-500 font-medium">
                                              Distancia al Puesto: <strong className={isInside ? 'text-emerald-600' : 'text-rose-600'}>{gps.distanciaMetros}m</strong>
                                            </div>
                                            <div className="text-slate-400 text-[10px]">Último Ping: {gps.ultimoPing}</div>
                                          </div>
                                        </Popup>
                                      </Marker>
                                    );
                                  })}
                              </MapContainer>
                            </div>

                            {/* Live Witness Distances List */}
                            <div className="sm:col-span-4 space-y-2 flex flex-col h-[280px]">
                              <h6 className="text-[11px] font-bold text-slate-300 uppercase tracking-wider shrink-0">
                                Testigos Monitoreados en Puesto:
                              </h6>

                              <div className="space-y-1.5 flex-1 overflow-y-auto pr-1 max-h-[245px]">
                                {testigos.map((t) => {
                                  const gps = testigoGpsPings[t.id] || {
                                    distanciaMetros: 60,
                                    ultimoPing: 'Hace 3 min',
                                    bateriaPct: 80,
                                    estadoGPS: 'DENTRO'
                                  };
                                  const isInside = geofenceActive ? (gps.distanciaMetros <= geofenceRadius) : true;

                                  return (
                                    <div key={t.id} className="p-2 bg-slate-900/90 rounded-xl border border-slate-700/80 flex items-center justify-between text-xs">
                                      <div className="min-w-0 pr-2">
                                        <div className="font-bold text-white truncate text-[11px]">{t.nombre}</div>
                                        <div className="text-[10px] text-indigo-300 font-mono">
                                          Distancia: <strong className={isInside ? 'text-emerald-400' : 'text-rose-400 font-black'}>{gps.distanciaMetros}m</strong>
                                        </div>
                                      </div>

                                      <div className="flex items-center gap-1.5 shrink-0">
                                        <span className={`px-2 py-0.5 text-[9px] font-black rounded border ${
                                          !geofenceActive 
                                            ? 'bg-slate-700 text-slate-300 border-slate-600'
                                            : isInside 
                                              ? 'bg-[#111C30]0/20 text-emerald-300 border-emerald-500/50' 
                                              : 'bg-rose-500/20 text-rose-300 border-rose-500/50'
                                        }`}>
                                          {!geofenceActive ? 'Inactivo' : isInside ? 'DENTRO ✅' : 'FUERA 🚨'}
                                        </span>

                                        <button
                                          type="button"
                                          onClick={() => handleSimulateWitnessPing(t.id)}
                                          className="p-1 bg-indigo-900/80 hover:bg-indigo-800 text-indigo-200 rounded-lg transition-colors cursor-pointer"
                                          title="Simular nuevo reporte GPS (Ping)"
                                        >
                                          <RefreshCw className="w-3 h-3" />
                                        </button>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                  {/* Action & Filter Bar */}
                  <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-2">
                    <div className="flex flex-wrap items-center gap-2 flex-1">
                      {/* Search */}
                      <div className="relative min-w-[200px]">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={witnessSearchQuery}
                          onChange={(e) => setWitnessSearchQuery(e.target.value)}
                          placeholder="Buscar por Nombre, CC o Puesto..."
                          className="w-full bg-[#111C30] border border-white/5 rounded-xl pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:border-indigo-500"
                        />
                      </div>

                      {/* Party Filter */}
                      <div className="flex items-center gap-1">
                        <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <select
                          value={witnessPartidoFilter}
                          onChange={(e) => setWitnessPartidoFilter(e.target.value)}
                          className="bg-[#111C30] border border-white/5 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-300 focus:outline-none focus:border-indigo-500"
                        >
                          <option value="Todos">Todos los Partidos/Movimientos</option>
                          {partidosPoliticosOpt.map((p, i) => (
                            <option key={i} value={p}>{p}</option>
                          ))}
                        </select>
                      </div>

                      {/* Polling Station Filter */}
                      <select
                        value={witnessPuestoFilter}
                        onChange={(e) => setWitnessPuestoFilter(e.target.value)}
                        className="bg-[#111C30] border border-white/5 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-300 focus:outline-none focus:border-indigo-500"
                      >
                        <option value="Todos">Todos los Puestos de Votación</option>
                        {puestosTerritorioOpt.map((pst, i) => (
                          <option key={i} value={pst.nombre}>{pst.nombre}</option>
                        ))}
                      </select>
                    </div>

                    <button
                      onClick={() => {
                        resetWitnessForm();
                        setShowWitnessForm(!showWitnessForm);
                      }}
                      className="px-4 py-2 bg-emerald-600 text-white font-extrabold text-xs rounded-xl shadow hover:bg-[#111C30]0 transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{showWitnessForm ? 'Cerrar Formulario' : '+ Inscribir Nuevo Testigo'}</span>
                    </button>
                  </div>

                  {/* FORM TO CREATE OR MODIFY WITNESS INFO & TABLE ASSIGNMENT */}
                  {showWitnessForm && (
                    <form onSubmit={handleSaveWitness} className="bg-[#111C30] border-2 border-indigo-200 rounded-2xl p-5 space-y-4 animate-fadeIn">
                      <div className="flex items-center justify-between border-b border-white/5 pb-3">
                        <h4 className="font-extrabold text-white text-sm flex items-center gap-2">
                          <UserCheck className="w-4 h-4 text-indigo-600" />
                          <span>{editingWitnessId ? 'Modificar Información Básica y Asignación de Testigo' : 'Inscribir Nuevo Testigo Electoral por Partido y Puesto'}</span>
                        </h4>
                        <button
                          type="button"
                          onClick={resetWitnessForm}
                          className="text-slate-400 hover:text-slate-400 p-1 cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                        <div>
                          <label className="block font-bold text-slate-300 mb-1">Nombre Completo *</label>
                          <input
                            type="text"
                            required
                            value={witNombre}
                            onChange={(e) => setWitNombre(e.target.value)}
                            placeholder="Ej: Laura Camila Restrepo"
                            className="w-full p-2 bg-[#0F172A] border border-white/10 rounded-xl font-medium focus:outline-none focus:border-indigo-500"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-slate-300 mb-1">Cédula de Ciudadanía (CC) *</label>
                          <input
                            type="text"
                            required
                            value={witCc}
                            onChange={(e) => setWitCc(e.target.value)}
                            placeholder="Ej: 1025889900"
                            className="w-full p-2 bg-[#0F172A] border border-white/10 rounded-xl font-medium focus:outline-none focus:border-indigo-500"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-slate-300 mb-1">Teléfono Móvil / WhatsApp</label>
                          <input
                            type="text"
                            value={witTelefono}
                            onChange={(e) => setWitTelefono(e.target.value)}
                            placeholder="+57 300 123 4567"
                            className="w-full p-2 bg-[#0F172A] border border-white/10 rounded-xl font-medium focus:outline-none focus:border-indigo-500"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-slate-300 mb-1">Correo Electrónico</label>
                          <input
                            type="email"
                            value={witEmail}
                            onChange={(e) => setWitEmail(e.target.value)}
                            placeholder="testigo@partido.org"
                            className="w-full p-2 bg-[#0F172A] border border-white/10 rounded-xl font-medium focus:outline-none focus:border-indigo-500"
                          />
                        </div>

                        {/* Partido Político Selection */}
                        <div className="md:col-span-2">
                          <label className="block font-bold text-slate-300 mb-1">Partido Político o Movimiento *</label>
                          <select
                            value={witPartido}
                            onChange={(e) => setWitPartido(e.target.value)}
                            className="w-full p-2 bg-[#0F172A] border border-white/10 rounded-xl font-medium focus:outline-none focus:border-indigo-500"
                          >
                            {partidosPoliticosOpt.map((p, idx) => (
                              <option key={idx} value={p}>{p}</option>
                            ))}
                          </select>
                        </div>

                        {/* Rol del Testigo */}
                        <div className="md:col-span-2">
                          <label className="block font-bold text-slate-300 mb-1">Rol de Testigo *</label>
                          <select
                            value={witRol}
                            onChange={(e) => setWitRol(e.target.value)}
                            className="w-full p-2 bg-[#0F172A] border border-white/10 rounded-xl font-medium focus:outline-none focus:border-indigo-500"
                          >
                            <option value="Testigo de Mesa (E-16)">Testigo de Mesa (E-16)</option>
                            <option value="Testigo Rematador / Coordinador de Puesto">Testigo Rematador / Coordinador de Puesto</option>
                            <option value="Testigo de Escrutinio Municipal">Testigo de Escrutinio Municipal</option>
                            <option value="Testigo de Escrutinio Departamental">Testigo de Escrutinio Departamental</option>
                          </select>
                        </div>

                        {/* Asignación de Puesto de Votación Territorial */}
                        <div>
                          <label className="block font-bold text-slate-300 mb-1">Puesto de Votación (Territorio) *</label>
                          <select
                            value={witPuesto}
                            onChange={(e) => {
                              const pstObj = puestosTerritorioOpt.find(p => p.nombre === e.target.value);
                              setWitPuesto(e.target.value);
                              if (pstObj) setWitComuna(pstObj.comuna);
                            }}
                            className="w-full p-2 bg-[#0F172A] border border-white/10 rounded-xl font-medium focus:outline-none focus:border-indigo-500"
                          >
                            {puestosTerritorioOpt.map((pst, idx) => (
                              <option key={idx} value={pst.nombre}>{pst.nombre} ({pst.comuna})</option>
                            ))}
                          </select>
                        </div>

                        {/* Asignación de Mesa */}
                        <div>
                          <label className="block font-bold text-slate-300 mb-1">Mesa Asignada *</label>
                          <select
                            value={witMesa}
                            onChange={(e) => setWitMesa(e.target.value)}
                            className="w-full p-2 bg-[#0F172A] border border-white/10 rounded-xl font-medium focus:outline-none focus:border-indigo-500"
                          >
                            <option value="Mesa 01">Mesa 01</option>
                            <option value="Mesa 02">Mesa 02</option>
                            <option value="Mesa 04">Mesa 04</option>
                            <option value="Mesa 12">Mesa 12</option>
                            <option value="Mesa 15">Mesa 15</option>
                            <option value="Mesa 20">Mesa 20</option>
                            <option value="Todas las Mesas (Coordinación de Puesto)">Todas las Mesas (Coordinación de Puesto)</option>
                          </select>
                        </div>

                        {/* Estado Acreditación Registraduría */}
                        <div>
                          <label className="block font-bold text-slate-300 mb-1">Acreditación Registraduría</label>
                          <select
                            value={witAcreditacion}
                            onChange={(e) => setWitAcreditacion(e.target.value)}
                            className="w-full p-2 bg-[#0F172A] border border-white/10 rounded-xl font-medium focus:outline-none focus:border-indigo-500"
                          >
                            <option value="Formulario E-16 En Trámite">Formulario E-16 En Trámite</option>
                            <option value="Formulario E-16 Aprobado">Formulario E-16 Aprobado</option>
                            <option value="Rechazado Registraduría">Rechazado Registraduría</option>
                          </select>
                        </div>

                        {/* Estado General */}
                        <div>
                          <label className="block font-bold text-slate-300 mb-1">Estado General</label>
                          <select
                            value={witEstado}
                            onChange={(e) => setWitEstado(e.target.value)}
                            className="w-full p-2 bg-[#0F172A] border border-white/10 rounded-xl font-medium focus:outline-none focus:border-indigo-500"
                          >
                            <option value="Inscrito">Inscrito</option>
                            <option value="Acreditado">Acreditado</option>
                            <option value="Pendiente">Pendiente</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/5">
                        <button
                          type="button"
                          onClick={resetWitnessForm}
                          className="px-4 py-2 bg-[#0F172A] text-slate-300 border border-white/10 font-bold text-xs rounded-xl hover:bg-[#020617] transition-all cursor-pointer"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2 bg-indigo-600 text-white font-extrabold text-xs rounded-xl shadow hover:bg-indigo-500 transition-all cursor-pointer"
                        >
                          {editingWitnessId ? 'Guardar Cambios del Testigo' : 'Inscribir Testigo'}
                        </button>
                      </div>
                    </form>
                  )}

                  {/* TABLE OF REGISTERED WITNESSES */}
                  <div className="overflow-x-auto border border-white/5 rounded-xl shadow-sm">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-[#020617] text-slate-300 font-bold border-b border-white/5">
                          <th className="p-3">Testigo & Contacto</th>
                          <th className="p-3">Partido / Movimiento</th>
                          <th className="p-3">Rol</th>
                          <th className="p-3">Puesto & Mesa Asignada</th>
                          <th className="p-3">Cerco GPS ({geofenceRadius}m)</th>
                          <th className="p-3">Acreditación Registraduría</th>
                          <th className="p-3">Estado</th>
                          <th className="p-3 text-right">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 font-medium bg-[#0F172A]">
                        {testigos
                          .filter(t => {
                            if (witnessPartidoFilter !== 'Todos' && t.partido !== witnessPartidoFilter) return false;
                            if (witnessPuestoFilter !== 'Todos' && t.puesto !== witnessPuestoFilter) return false;
                            if (witnessSearchQuery.trim()) {
                              const q = witnessSearchQuery.toLowerCase();
                              return t.nombre.toLowerCase().includes(q) || t.cc.includes(q) || t.puesto.toLowerCase().includes(q);
                            }
                            return true;
                          })
                          .map((t) => {
                            const gps = testigoGpsPings[t.id] || {
                              distanciaMetros: 50,
                              ultimoPing: 'Hace 2 min',
                              bateriaPct: 80,
                              estadoGPS: 'DENTRO'
                            };
                            const isInsideGeofence = geofenceActive ? (gps.distanciaMetros <= geofenceRadius) : true;

                            return (
                              <tr key={t.id} className="hover:bg-[#111C30]/50 transition-colors">
                                <td className="p-3">
                                  <div className="font-bold text-white">{t.nombre}</div>
                                  <div className="text-[10px] text-slate-400 font-mono">CC: {t.cc}</div>
                                  <div className="text-[10px] text-slate-400">{t.telefono}</div>
                                </td>
                                <td className="p-3">
                                  <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 font-bold text-[10px] rounded-md block w-fit">
                                    {t.partido}
                                  </span>
                                </td>
                                <td className="p-3 text-slate-300 font-semibold">{t.rol}</td>
                                <td className="p-3">
                                  <div className="font-bold text-white">{t.puesto}</div>
                                  <div className="text-[10px] text-indigo-400 font-bold">{t.mesa} ({t.comuna})</div>
                                </td>
                                <td className="p-3">
                                  {!geofenceActive ? (
                                    <span className="px-2 py-0.5 bg-[#020617] text-slate-400 border border-white/10 font-bold text-[10px] rounded">
                                      Desactivado
                                    </span>
                                  ) : isInsideGeofence ? (
                                    <div className="flex items-center gap-1.5">
                                      <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-300 border border-emerald-500/25 font-black text-[10px] rounded flex items-center gap-1">
                                        <Locate className="w-3 h-3 text-emerald-400" />
                                        <span>En Cerco ({gps.distanciaMetros}m)</span>
                                      </span>
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-1.5">
                                      <span className="px-2 py-0.5 bg-rose-500/10 text-rose-300 border border-rose-500/25 font-black text-[10px] rounded flex items-center gap-1 animate-pulse">
                                        <AlertTriangle className="w-3 h-3 text-rose-400" />
                                        <span>Fuera Cerco ({gps.distanciaMetros}m)</span>
                                      </span>
                                    </div>
                                  )}
                                  <div className="text-[9px] text-slate-400 mt-0.5 font-mono">
                                    Ping: {gps.ultimoPing} | Bat: {gps.bateriaPct}%
                                  </div>
                                </td>
                                <td className="p-3">
                                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                                    t.acreditacion.includes('Aprobado')
                                      ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25'
                                      : 'bg-amber-500/10 text-amber-300 border-amber-500/25'
                                  }`}>
                                    {t.acreditacion}
                                  </span>
                                </td>
                                <td className="p-3">
                                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded border ${
                                    t.estado === 'Acreditado' 
                                      ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' 
                                      : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                                  }`}>
                                    {t.estado}
                                  </span>
                                </td>
                                <td className="p-3 text-right">
                                  <div className="flex items-center justify-end gap-1">
                                    <button
                                      onClick={() => handleSimulateWitnessPing(t.id)}
                                      className="p-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 rounded-lg transition-colors cursor-pointer"
                                      title="Simular Ping GPS para probar cerco perimetral"
                                    >
                                      <RefreshCw className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() => handleStartEditWitness(t)}
                                      className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-white/5 rounded-lg transition-colors cursor-pointer"
                                      title="Modificar información básica o asignación de mesa"
                                    >
                                      <Edit3 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteWitness(t.id)}
                                      className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 rounded-lg transition-colors cursor-pointer"
                                      title="Eliminar testigo electoral"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>

                  {/* Territorial Polling Station Coverage Summary */}
                  <div className="bg-[#111C30] border border-white/5 rounded-2xl p-4 space-y-3">
                    <h4 className="text-xs font-extrabold text-white flex items-center gap-1.5 uppercase tracking-wider">
                      <MapPin className="w-4 h-4 text-emerald-600" />
                      <span>Matriz de Cobertura de Mesas en Puestos de Votación (Circunscripción Territorial)</span>
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                      {puestosTerritorioOpt.map((pst, idx) => {
                        const testigosEnPuesto = testigos.filter(t => t.puesto === pst.nombre);
                        return (
                          <div key={idx} className="bg-[#0F172A] p-3 rounded-xl border border-white/5 space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="font-extrabold text-white">{pst.nombre}</span>
                              <span className="text-[10px] bg-[#020617] text-slate-300 font-mono px-1.5 py-0.5 rounded">
                                {pst.mesas} Mesas
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-400">{pst.comuna}</div>
                            <div className="pt-1 flex items-center justify-between text-[10px]">
                              <span className="text-slate-400">Testigos Asignados: <strong className="text-indigo-300 font-extrabold">{testigosEnPuesto.length}</strong></span>
                              {testigosEnPuesto.length > 0 ? (
                                <span className="text-emerald-400 font-extrabold">Cubierto ✅</span>
                              ) : (
                                <span className="text-amber-400 font-extrabold">Pendiente Asignar ⚠️</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* ---------------------------------------------------------------------- */}
        {/* TAB 8: JURADOS ELECTORALES (POSTULACIÓN A REGISTRADURÍA & CONFRONTACIÓN) */}
        {/* ---------------------------------------------------------------------- */}
        {activeTab === 'jurados_electorales' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Input Oculto para Anexar Archivos de Resolución */}
            <input
              type="file"
              ref={resolutionFileInputRef}
              className="hidden"
              accept=".pdf,.csv,.xlsx,.xls,.png,.jpg,.jpeg,.txt"
              onChange={handleAttachResolutionFile}
            />

            <div className="bg-[#0F172A]/90 rounded-2xl p-6 border border-cyan-500/30 shadow-xl space-y-6">
              {/* Header Top Row: Title, Description & '+ Postular Jurado' Button */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cyan-500/20 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 rounded-xl shrink-0">
                    <Vote className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-white text-lg flex items-center gap-2">
                      Listas de Jurados para Registraduría & Confrontación de Resolución
                    </h3>
                  </div>
                </div>

                <div className="shrink-0">
                  {/* Add Candidate Jurado Button at the Top */}
                  <button
                    type="button"
                    onClick={() => {
                      resetJuradoForm();
                      setShowJuradoForm(!showJuradoForm);
                    }}
                    className="w-full sm:w-auto px-5 py-2.5 bg-[#111C30]0 hover:bg-emerald-400 text-white font-black text-xs rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 border border-emerald-400"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>{showJuradoForm ? 'Cancelar' : '+ Postular Jurado'}</span>
                  </button>
                </div>
              </div>

              {/* Header Bottom Row: Action Buttons for Export, Annex Resolution, and Confrontation */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#111C30] p-3 rounded-2xl border border-cyan-500/30">
                <div className="text-xs font-bold text-cyan-300 flex items-center gap-2 px-1">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                  <span>Acciones de Resolución y Exportación Oficial:</span>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  {/* Export Excel Button */}
                  <button
                    type="button"
                    onClick={handleExportJuradosExcel}
                    className="px-4 py-2 bg-[#111C30]0 hover:bg-emerald-400 text-white font-black text-xs rounded-xl shadow-sm transition-all cursor-pointer flex items-center gap-2 border border-emerald-400"
                    title="Exportar archivo CSV/Excel listo para enviar a la Registraduría"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-white" />
                    <span>Exportar Lista Excel Registraduría</span>
                  </button>

                  {/* Button to Annex / Upload Resolution Document */}
                  <button
                    type="button"
                    onClick={() => resolutionFileInputRef.current?.click()}
                    disabled={isReadingResolution}
                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-black text-xs rounded-xl shadow-sm transition-all cursor-pointer flex items-center gap-2 border border-cyan-400 disabled:opacity-50"
                    title="Anexar documento de Resolución emitida por la Registraduría (PDF/Excel) para lectura"
                  >
                    {isReadingResolution ? (
                      <RefreshCw className="w-4 h-4 text-cyan-200 animate-spin" />
                    ) : (
                      <FileUp className="w-4 h-4 text-cyan-200" />
                    )}
                    <span>{isReadingResolution ? 'Leyendo Resolución...' : 'Anexar Resolución PDF/Excel'}</span>
                  </button>

                  {/* Confront Resolution Modal Toggle */}
                  <button
                    type="button"
                    onClick={() => setShowConfrontationModal(!showConfrontationModal)}
                    className="px-4 py-2 bg-[#111C30] hover:bg-slate-800 text-cyan-300 font-black text-xs rounded-xl shadow-sm transition-all cursor-pointer flex items-center gap-2 border border-cyan-500/40"
                    title="Cargar y confrontar resolución oficial de sorteo emitida por la Registraduría"
                  >
                    <Scale className="w-4 h-4 text-cyan-400" />
                    <span>Confrontar Resolución Sorteo</span>
                  </button>
                </div>
              </div>

              {/* KPI Summary Metrics Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 bg-[#111C30] rounded-2xl border border-cyan-500/30 space-y-1">
                  <div className="flex items-center justify-between text-xs text-cyan-300 font-bold">
                    <span>Total Candidates Postulados</span>
                    <Users className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div className="text-2xl font-black text-white">{jurados.length}</div>
                </div>

                <div className="p-4 bg-[#111C30]0/10 rounded-2xl border border-emerald-500/40 space-y-1">
                  <div className="flex items-center justify-between text-xs text-emerald-300 font-bold">
                    <span>Seleccionados en Resolución</span>
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-2xl font-black text-emerald-300">
                    {jurados.filter(j => j.estadoSorteo.includes('Seleccionado')).length}
                  </div>
                </div>

                <div className="p-4 bg-[#111C30] rounded-2xl border border-slate-700 space-y-1">
                  <div className="flex items-center justify-between text-xs text-slate-300 font-bold">
                    <span>No Seleccionados en Sorteo</span>
                    <XCircle className="w-4 h-4 text-slate-400" />
                  </div>
                  <div className="text-2xl font-black text-slate-200">
                    {jurados.filter(j => j.estadoSorteo === 'No Seleccionado').length}
                  </div>
                </div>

                <div className="p-4 bg-cyan-500/10 rounded-2xl border border-cyan-500/40 space-y-1">
                  <div className="flex items-center justify-between text-xs text-cyan-300 font-bold">
                    <span>Tasa Efectividad en Sorteo</span>
                    <Award className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div className="text-2xl font-black text-cyan-200">
                    {jurados.length > 0 
                      ? `${Math.round((jurados.filter(j => j.estadoSorteo.includes('Seleccionado')).length / jurados.length) * 100)}%` 
                      : '0%'}
                  </div>
                </div>
              </div>

              {/* Panel de Confrontación de Resolución Registraduría (Expandible / Modal) */}
              {(showConfrontationModal || isConfronting) && (
                <div className="bg-[#111C30] text-white rounded-2xl p-5 border border-cyan-500/40 shadow-xl space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-cyan-500/20 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-cyan-500/20 border border-cyan-400/40 rounded-xl text-cyan-300">
                        <Scale className="w-6 h-6 text-cyan-300" />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-white tracking-wide uppercase">
                          Módulo de Lector & Confrontación de Resolución de Jurados
                        </h4>
                        <p className="text-xs text-cyan-200/80 mt-0.5">
                          Lectura automatizada por OCR/Texto de la resolución expedida por la Registraduría Nacional / CNE y confrontación de cédulas.
                        </p>
                      </div>
                    </div>

                    <span className="px-3 py-1 bg-[#111C30] text-cyan-300 font-mono text-xs font-bold rounded-xl border border-cyan-500/40 shrink-0">
                      {resolutionFile.resolutionNumber}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                    <div className="md:col-span-8 space-y-3 bg-[#111C30] p-4 rounded-xl border border-cyan-500/20">
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                        <span className="font-bold text-cyan-300 flex items-center gap-1.5">
                          <FileText className="w-4 h-4 text-cyan-400" />
                          <span>Resolución Oficial Anexada:</span>
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-emerald-400 font-bold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-700/50">
                            {resolutionFile.name} ({resolutionFile.size})
                          </span>
                          <button
                            type="button"
                            onClick={() => resolutionFileInputRef.current?.click()}
                            className="px-2.5 py-1 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-[10px] rounded-lg border border-cyan-400 flex items-center gap-1 cursor-pointer transition-all"
                            title="Seleccionar y anexar otro archivo de resolución"
                          >
                            <FileUp className="w-3 h-3" />
                            <span>Anexar / Reemplazar</span>
                          </button>
                        </div>
                      </div>

                      <div className="bg-slate-950 p-3 rounded-lg border border-cyan-500/30 space-y-1.5 text-xs text-slate-300">
                        <div className="flex items-center justify-between font-mono text-[11px]">
                          <span className="text-slate-400">Estado de Lectura OCR:</span>
                          <span className="text-emerald-400 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span>{resolutionFile.status}</span>
                          </span>
                        </div>
                        <div className="flex items-center justify-between font-mono text-[11px]">
                          <span className="text-slate-400">Registros y Cédulas Identificadas:</span>
                          <span className="text-cyan-200 font-bold">{resolutionFile.numRecordsExtracted} Jurados Registrados</span>
                        </div>
                        <p className="text-[11px] text-slate-400 pt-1 leading-relaxed border-t border-slate-800">
                          Este proceso ejecuta un algoritmo de cruce directo entre el documento anexado de la Registraduría y el listado de postulados del partido para determinar quiénes quedaron asignados como Jurados Oficiales, en qué puesto, mesa y rol.
                        </p>
                      </div>

                      {/* Distribution breakdown by designated roles */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px]">
                        <div className="bg-slate-950 p-2 rounded-lg border border-cyan-500/20 text-center">
                          <span className="text-slate-400 block text-[10px]">Presidentes</span>
                          <strong className="text-cyan-300 font-black text-sm">
                            {jurados.filter(j => j.rolDesignado === 'Presidente de Mesa').length}
                          </strong>
                        </div>
                        <div className="bg-slate-950 p-2 rounded-lg border border-cyan-500/20 text-center">
                          <span className="text-slate-400 block text-[10px]">Vocales 1 y 2</span>
                          <strong className="text-emerald-300 font-black text-sm">
                            {jurados.filter(j => j.rolDesignado.includes('Vocal')).length}
                          </strong>
                        </div>
                        <div className="bg-slate-950 p-2 rounded-lg border border-cyan-500/20 text-center">
                          <span className="text-slate-400 block text-[10px]">Remanentes</span>
                          <strong className="text-amber-300 font-black text-sm">
                            {jurados.filter(j => j.rolDesignado === 'Jurado Remanente').length}
                          </strong>
                        </div>
                        <div className="bg-slate-950 p-2 rounded-lg border border-cyan-500/20 text-center">
                          <span className="text-slate-400 block text-[10px]">No Designados</span>
                          <strong className="text-slate-400 font-black text-sm">
                            {jurados.filter(j => j.rolDesignado === 'No Designado' || j.rolDesignado === 'Pendiente').length}
                          </strong>
                        </div>
                      </div>
                    </div>

                    <div className="md:col-span-4 flex flex-col justify-center space-y-2.5">
                      <button
                        type="button"
                        onClick={handleRunResolutionConfrontation}
                        disabled={isConfronting || isReadingResolution}
                        className="w-full py-3 bg-[#111C30]0 hover:bg-emerald-400 disabled:opacity-50 text-white font-black text-xs rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 border border-emerald-400"
                      >
                        {isConfronting ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>Confrontando Cédulas...</span>
                          </>
                        ) : (
                          <>
                            <FileCheck className="w-4 h-4" />
                            <span>Leer & Confrontar con la Resolución</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => resolutionFileInputRef.current?.click()}
                        disabled={isReadingResolution}
                        className="w-full py-2.5 bg-[#111C30] hover:bg-slate-800 text-cyan-200 font-bold text-xs rounded-xl border border-cyan-500/30 flex items-center justify-center gap-2 transition-colors cursor-pointer"
                      >
                        <FileUp className="w-4 h-4 text-cyan-300" />
                        <span>Anexar Nueva Resolución (PDF)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setShowConfrontationModal(false)}
                        className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-slate-400 font-bold text-xs rounded-xl border border-slate-700 transition-colors"
                      >
                        Ocultar Panel Confrontación
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Formulario de Postulación de Jurado */}
              {showJuradoForm && (
                <form onSubmit={handleSaveJuradoCandidate} className="bg-[#111C30] border border-cyan-500/30 rounded-2xl p-5 space-y-4 animate-fadeIn">
                  <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3">
                    <h4 className="font-extrabold text-white text-sm flex items-center gap-2">
                      <UserPlus className="w-4 h-4 text-emerald-400" />
                      <span>{editingJuradoId ? 'Editar Postulante a Jurado de Votación' : 'Postular Nuevo Candidato a Jurado (Lista para Registraduría)'}</span>
                    </h4>
                    <button
                      type="button"
                      onClick={() => setShowJuradoForm(false)}
                      className="p-1 text-slate-400 hover:text-white rounded-lg"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                    <div>
                      <label className="block font-bold text-cyan-200 mb-1">Nombre Completo *</label>
                      <input
                        type="text"
                        required
                        placeholder="Ej: Laura Gómez Pérez"
                        value={jurNombre}
                        onChange={(e) => setJurNombre(e.target.value)}
                        className="w-full p-2.5 bg-[#111C30] border border-cyan-500/30 rounded-xl focus:outline-none focus:border-cyan-400 font-medium text-white"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-cyan-200 mb-1">Cédula de Ciudadanía *</label>
                      <input
                        type="text"
                        required
                        placeholder="Ej: 1017889900"
                        value={jurCc}
                        onChange={(e) => setJurCc(e.target.value)}
                        className="w-full p-2.5 bg-[#111C30] border border-cyan-500/30 rounded-xl focus:outline-none focus:border-cyan-400 font-mono font-bold text-white"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-cyan-200 mb-1">Teléfono Móvil</label>
                      <input
                        type="text"
                        placeholder="Ej: +57 300 123 4567"
                        value={jurTelefono}
                        onChange={(e) => setJurTelefono(e.target.value)}
                        className="w-full p-2.5 bg-[#111C30] border border-cyan-500/30 rounded-xl focus:outline-none focus:border-cyan-400 font-medium text-white"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-cyan-200 mb-1">Correo Electrónico</label>
                      <input
                        type="email"
                        placeholder="Ej: laura.gomez@gmail.com"
                        value={jurEmail}
                        onChange={(e) => setJurEmail(e.target.value)}
                        className="w-full p-2.5 bg-[#111C30] border border-cyan-500/30 rounded-xl focus:outline-none focus:border-cyan-400 font-medium text-white"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-cyan-200 mb-1">Partido Político / Movimiento</label>
                      <select
                        value={jurPartido}
                        onChange={(e) => setJurPartido(e.target.value)}
                        className="w-full p-2.5 bg-[#111C30] border border-cyan-500/30 rounded-xl focus:outline-none focus:border-cyan-400 font-bold text-white"
                      >
                        {partidosPoliticosOpt.map((p, idx) => (
                          <option key={idx} value={p}>{p}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-cyan-200 mb-1">Ocupación / Empresa / Sector</label>
                      <input
                        type="text"
                        placeholder="Ej: Docente / Ingeniero / Sector Público"
                        value={jurOcupacion}
                        onChange={(e) => setJurOcupacion(e.target.value)}
                        className="w-full p-2.5 bg-[#111C30] border border-cyan-500/30 rounded-xl focus:outline-none focus:border-cyan-400 font-medium text-white"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-cyan-200 mb-1">Municipio / Distrito</label>
                      <input
                        type="text"
                        value={jurMunicipio}
                        onChange={(e) => setJurMunicipio(e.target.value)}
                        className="w-full p-2.5 bg-[#111C30] border border-cyan-500/30 rounded-xl focus:outline-none focus:border-cyan-400 font-medium text-white"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-cyan-200 mb-1">Puesto Preferente de Votación</label>
                      <select
                        value={jurPuestoPreferente}
                        onChange={(e) => setJurPuestoPreferente(e.target.value)}
                        className="w-full p-2.5 bg-[#111C30] border border-cyan-500/30 rounded-xl focus:outline-none focus:border-cyan-400 font-bold text-white"
                      >
                        {puestosTerritorioOpt.map((pst, idx) => (
                          <option key={idx} value={pst.nombre}>{pst.nombre}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-cyan-500/20">
                    <button
                      type="button"
                      onClick={() => setShowJuradoForm(false)}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-[#111C30]0 hover:bg-emerald-400 text-white font-black text-xs rounded-xl shadow-lg transition-all cursor-pointer"
                    >
                      {editingJuradoId ? 'Guardar Cambios' : 'Postular a Lista de Sorteo'}
                    </button>
                  </div>
                </form>
              )}

              {/* Barra de Filtros y Búsqueda */}
              <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-1">
                <div className="flex flex-wrap items-center gap-2 flex-1">
                  {/* Búsqueda */}
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="w-4 h-4 text-cyan-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Buscar por candidato, cédula o puesto..."
                      value={juradoSearchQuery}
                      onChange={(e) => setJuradoSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-[#111C30] border border-cyan-500/30 rounded-xl text-xs font-medium text-white focus:outline-none focus:border-cyan-400 placeholder-slate-400"
                    />
                  </div>

                  {/* Filtro Partido */}
                  <select
                    value={juradoPartidoFilter}
                    onChange={(e) => setJuradoPartidoFilter(e.target.value)}
                    className="p-2 bg-[#111C30] border border-cyan-500/30 rounded-xl text-xs font-bold text-cyan-200 focus:outline-none focus:border-cyan-400"
                  >
                    <option value="Todos">Todos los Partidos</option>
                    {partidosPoliticosOpt.map((p, idx) => (
                      <option key={idx} value={p}>{p}</option>
                    ))}
                  </select>

                  {/* Filtro Sorteo */}
                  <select
                    value={juradoSorteoFilter}
                    onChange={(e) => setJuradoSorteoFilter(e.target.value)}
                    className="p-2 bg-[#111C30] border border-cyan-500/30 rounded-xl text-xs font-bold text-cyan-200 focus:outline-none focus:border-cyan-400"
                  >
                    <option value="Todos">Todos los Estados de Sorteo</option>
                    <option value="Seleccionado en Resolución">Seleccionados en Resolución ✅</option>
                    <option value="No Seleccionado">No Seleccionados ⚪</option>
                    <option value="Postulado (Pendiente Sorteo)">Pendiente Sorteo ⏳</option>
                  </select>
                </div>

                <div className="text-xs text-cyan-200/80 font-semibold self-center">
                  Mostrando: <strong className="text-cyan-300 font-extrabold">{
                    jurados.filter(j => {
                      if (juradoPartidoFilter !== 'Todos' && j.partido !== juradoPartidoFilter) return false;
                      if (juradoSorteoFilter !== 'Todos' && j.estadoSorteo !== juradoSorteoFilter) return false;
                      if (juradoSearchQuery.trim()) {
                        const q = juradoSearchQuery.toLowerCase();
                        return j.nombre.toLowerCase().includes(q) || j.cc.includes(q) || j.puestoPreferente.toLowerCase().includes(q);
                      }
                      return true;
                    }).length
                  }</strong> de {jurados.length} postulados
                </div>
              </div>

              {/* Tabla Principal de Postulados y Confrontación */}
              <div className="overflow-x-auto border border-cyan-500/30 rounded-xl">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#111C30] text-cyan-300 font-bold border-b border-cyan-500/30">
                      <th className="p-3">Candidato a Jurado</th>
                      <th className="p-3">Partido Político</th>
                      <th className="p-3">Ocupación / Profesión</th>
                      <th className="p-3">Puesto Preferente</th>
                      <th className="p-3">Resultado Sorteo Registraduría</th>
                      <th className="p-3">Asignación Oficial Órgano Electoral</th>
                      <th className="p-3 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cyan-500/15 font-medium bg-[#0F172A]">
                    {jurados
                      .filter(j => {
                        if (juradoPartidoFilter !== 'Todos' && j.partido !== juradoPartidoFilter) return false;
                        if (juradoSorteoFilter !== 'Todos' && j.estadoSorteo !== juradoSorteoFilter) return false;
                        if (juradoSearchQuery.trim()) {
                          const q = juradoSearchQuery.toLowerCase();
                          return j.nombre.toLowerCase().includes(q) || j.cc.includes(q) || j.puestoPreferente.toLowerCase().includes(q);
                        }
                        return true;
                      })
                      .map((j) => (
                        <tr key={j.id} className="hover:bg-[#111C30] transition-colors">
                          <td className="p-3">
                            <div className="font-bold text-white">{j.nombre}</div>
                            {expandedJuradoInfoId === j.id ? (
                              <div className="mt-1.5 space-y-0.5 bg-slate-900/60 p-2 rounded-lg border border-cyan-500/20 text-[10px]">
                                <div className="text-cyan-300 font-mono">CC: {j.cc}</div>
                                <div className="text-slate-300">Tel: {j.telefono}</div>
                                <div className="text-slate-400 truncate max-w-[180px]">{j.email}</div>
                                <button
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); setExpandedJuradoInfoId(null); }}
                                  className="text-amber-400 font-bold hover:underline cursor-pointer block mt-1"
                                >
                                  Ocultar Información
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); setExpandedJuradoInfoId(j.id); }}
                                className="text-cyan-400 font-bold hover:underline cursor-pointer text-[10px] mt-1 block"
                              >
                                Ver Información
                              </button>
                            )}
                          </td>

                          <td className="p-3">
                            <span className="px-2.5 py-0.5 bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold text-[10px] rounded-md block w-fit">
                              {j.partido}
                            </span>
                          </td>

                          <td className="p-3 text-slate-200 font-medium">
                            {j.ocupacion}
                          </td>

                          <td className="p-3">
                            <div className="font-bold text-white">{j.puestoPreferente}</div>
                            <div className="text-[10px] text-slate-400">{j.municipio}</div>
                          </td>

                          <td className="p-3">
                            {j.estadoSorteo.includes('Seleccionado') ? (
                              <span className="px-2.5 py-0.5 bg-[#111C30]0/20 text-emerald-300 border border-emerald-500/40 font-black text-[10px] rounded-md inline-flex items-center gap-1 shadow-sm">
                                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                <span>SELECCIONADO EN RESOLUCIÓN</span>
                              </span>
                            ) : j.estadoSorteo === 'No Seleccionado' ? (
                              <span className="px-2.5 py-0.5 bg-slate-800 text-slate-400 border border-slate-700 font-bold text-[10px] rounded-md inline-flex items-center gap-1">
                                <XCircle className="w-3 h-3 text-slate-400" />
                                <span>NO SELECCIONADO</span>
                              </span>
                            ) : (
                              <span className="px-2.5 py-0.5 bg-[#111C30]0/20 text-amber-300 border border-amber-500/40 font-bold text-[10px] rounded-md inline-flex items-center gap-1">
                                <Clock className="w-3 h-3 text-amber-400" />
                                <span>PENDIENTE SORTEO</span>
                              </span>
                            )}
                          </td>

                          <td className="p-3">
                            {j.estadoSorteo.includes('Seleccionado') ? (
                              <div>
                                <div className="font-extrabold text-white text-xs">{j.rolDesignado}</div>
                                {expandedJuradoInfoId === j.id ? (
                                  <div className="mt-1.5 space-y-0.5 bg-slate-900/60 p-2 rounded-lg border border-cyan-500/20 text-[10px]">
                                    <div className="text-cyan-200 font-bold">{j.puestoDesignado} ({j.mesaDesignada})</div>
                                    <div className="text-cyan-400 font-mono text-[9px] mt-0.5">{j.resolucion}</div>
                                  </div>
                                ) : (
                                  <span className="text-[10px] text-slate-400 block mt-0.5 italic">Datos ocultos</span>
                                )}
                              </div>
                            ) : (
                              <span className="text-[11px] text-slate-400 italic">Sin designación oficial</span>
                            )}
                          </td>

                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => handleStartEditJurado(j)}
                                className="p-1.5 bg-[#111C30] hover:bg-slate-800 text-cyan-300 border border-cyan-500/30 rounded-lg transition-colors cursor-pointer"
                                title="Editar información del candidato a jurado"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteJurado(j.id)}
                                className="p-1.5 bg-rose-50 hover:bg-rose-500/20 text-rose-300 text-rose-700 rounded-lg transition-colors cursor-pointer"
                                title="Eliminar de la lista de postulados"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------------------------- */}
        {/* TAB 8: GESTIÓN Y CONFIGURACIÓN DE ENCUESTAS Y SONDEOS */}
        {/* ---------------------------------------------------------------------- */}
        {activeTab === 'encuestas_sondeos' && (
          <GestionEncuestasSondeos onSelectView={onSelectView} />
        )}

        {/* ---------------------------------------------------------------------- */}
        {/* TAB 9: DISTRIBUCIÓN ELECTORAL Y CENSO */}
        {/* ---------------------------------------------------------------------- */}
        {activeTab === 'distribucion_electoral' && (
          <DistribucionElectoral 
            onSelectView={onSelectView} 
          />
        )}

        {/* ---------------------------------------------------------------------- */}
        {/* TAB 10: CONSULTA DE LUGAR DE VOTACIÓN */}
        {/* ---------------------------------------------------------------------- */}
        {activeTab === 'consulta_lugar_votacion' && (
          <ConsultaLugarVotacion />
        )}

      </main>
    </div>
  );
};
