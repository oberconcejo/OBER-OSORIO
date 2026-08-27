import { UserRole, ViewMode } from '../types';

export const ROLE_ALLOWED_VIEWS: Record<UserRole, ViewMode[]> = {
  superadmin: [
    'primera_interfaz',
    'gestion_estrategica',
    'modulo_admin',
    'gestion_territorial',
    'testigo_campo',
    'encuestas',
    'jurado_campo',
    'presupuesto',
    'configuracion',
    'agenda_electoral',
    'pruebas_electorales'
  ],
  administrador: [
    'primera_interfaz',
    'modulo_admin',
    'presupuesto',
    'gestion_territorial',
    'testigo_campo',
    'encuestas',
    'jurado_campo',
    'configuracion',
    'agenda_electoral',
    'pruebas_electorales'
  ],
  auditor: [
    'primera_interfaz',
    'modulo_admin',
    'presupuesto',
    'configuracion',
    'agenda_electoral',
    'pruebas_electorales'
  ],
  candidato: [
    'primera_interfaz',
    'gestion_estrategica',
    'modulo_admin',
    'gestion_territorial',
    'testigo_campo',
    'encuestas',
    'jurado_campo',
    'presupuesto',
    'agenda_electoral'
  ],
  coordinador_general_zona: [
    'primera_interfaz',
    'gestion_territorial',
    'testigo_campo',
    'encuestas',
    'modulo_admin',
    'agenda_electoral'
  ],
  coordinador_zona: [
    'primera_interfaz',
    'gestion_territorial',
    'testigo_campo',
    'encuestas',
    'modulo_admin',
    'agenda_electoral'
  ],
  coordinador_puesto: [
    'primera_interfaz',
    'gestion_territorial',
    'testigo_campo',
    'encuestas',
    'agenda_electoral'
  ],
  lider_zonal_senior: [
    'primera_interfaz',
    'gestion_territorial',
    'encuestas',
    'agenda_electoral'
  ],
  lider: [
    'primera_interfaz',
    'gestion_territorial',
    'encuestas',
    'agenda_electoral'
  ],
  lider_barrio_vereda: [
    'primera_interfaz',
    'gestion_territorial',
    'encuestas',
    'agenda_electoral'
  ],
  puntero_territorial: [
    'primera_interfaz',
    'gestion_territorial',
    'encuestas',
    'agenda_electoral'
  ],
  testigo_electoral: [
    'primera_interfaz',
    'gestion_territorial',
    'testigo_campo',
    'agenda_electoral'
  ],
  jurado_mesa: [
    'primera_interfaz',
    'jurado_campo',
    'agenda_electoral'
  ],
  estrategico: [
    'primera_interfaz',
    'gestion_estrategica',
    'agenda_electoral'
  ],
  territorial: [
    'primera_interfaz',
    'gestion_territorial',
    'encuestas',
    'agenda_electoral'
  ]
};

export const ROLE_DEFAULT_VIEW: Record<UserRole, ViewMode> = {
  superadmin: 'gestion_estrategica',
  administrador: 'modulo_admin',
  auditor: 'modulo_admin',
  candidato: 'gestion_estrategica',
  coordinador_general_zona: 'gestion_territorial',
  coordinador_zona: 'gestion_territorial',
  coordinador_puesto: 'gestion_territorial',
  lider_zonal_senior: 'gestion_territorial',
  lider: 'gestion_territorial',
  lider_barrio_vereda: 'gestion_territorial',
  puntero_territorial: 'gestion_territorial',
  testigo_electoral: 'testigo_campo',
  jurado_mesa: 'jurado_campo',
  estrategico: 'gestion_estrategica',
  territorial: 'gestion_territorial'
};

export const MODULE_ALLOWED_VIEWS: Record<string, ViewMode[]> = {
  'Gestión Estratégica': [
    'gestion_estrategica',
    'agenda_electoral',
    'presupuesto'
  ],
  'Gestión Administrativa': [
    'modulo_admin',
    'presupuesto',
    'agenda_electoral',
    'pruebas_electorales'
  ],
  'Gestión Territorial': [
    'gestion_territorial',
    'testigo_campo',
    'encuestas',
    'jurado_campo',
    'pruebas_electorales',
    'agenda_electoral'
  ],
  'Gestión Operativa': [
    'primera_interfaz',
    'agenda_electoral',
    'gestion_territorial',
    'encuestas'
  ]
};

export function isViewAllowed(role: UserRole | undefined, view: ViewMode): boolean {
  if (!role) return false;
  const allowed = ROLE_ALLOWED_VIEWS[role];
  return allowed ? allowed.includes(view) : false;
}

export function isViewAllowedForModule(moduleName: string | undefined, view: ViewMode): boolean {
  if (!moduleName) return true;
  const allowed = MODULE_ALLOWED_VIEWS[moduleName];
  return allowed ? allowed.includes(view) : true;
}

export function getDefaultViewForRole(role: UserRole | undefined): ViewMode {
  if (!role) return 'modulo_admin';
  return ROLE_DEFAULT_VIEW[role] || 'modulo_admin';
}

export function getDefaultViewForRoleAndModule(role: UserRole | undefined, moduleName: string | undefined): ViewMode {
  if (!role) return 'modulo_admin';
  const defaultView = ROLE_DEFAULT_VIEW[role] || 'modulo_admin';
  if (isViewAllowed(role, defaultView) && isViewAllowedForModule(moduleName, defaultView)) {
    return defaultView;
  }
  const roleViews = ROLE_ALLOWED_VIEWS[role] || [];
  const moduleViews = moduleName ? MODULE_ALLOWED_VIEWS[moduleName] || [] : [];
  const commonView = roleViews.find(v => moduleViews.includes(v));
  return commonView || 'modulo_admin';
}

