import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class GlobalAdminService {
  private dbPath = path.resolve(process.cwd(), 'data_db.json');

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService
  ) {}

  private getDb() {
    try {
      const content = fs.readFileSync(this.dbPath, 'utf8');
      const db = JSON.parse(content);
      this.initializeGlobalSettings(db);
      return db;
    } catch (e) {
      const db: any = { 
        admin: { users: [], payroll: [], auditLogs: [] }, 
        strategic: { dafoEntries: [], budgets: [], aiNotes: [] }, 
        territorial: { voters: [], e14Actas: [], witnesses: [] }, 
        saas: { clients: [], licenses: [], subscriptions: [], plans: [], auditLogs: [] } 
      };
      this.initializeGlobalSettings(db);
      return db;
    }
  }

  private initializeGlobalSettings(db: any) {
    if (!db.globalAdminSettings) {
      db.globalAdminSettings = {
        roles: [
          { id: 'R-1', name: 'SUPER_ADMIN', description: 'Acceso total a la plataforma y todos sus submódulos.', permissions: ['ALL'] },
          { id: 'R-2', name: 'ADMINISTRADOR', description: 'Administrador de campaña, finanzas, CNE y registro electoral.', permissions: ['ADMIN_VIEW', 'CNE_WRITE'] },
          { id: 'R-3', name: 'CANDIDATO', description: 'Visualización estratégica global y reportes.', permissions: ['STRATEGIC_VIEW'] },
          { id: 'R-4', name: 'COORDINADOR_TERRITORIAL', description: 'Gestión de testigos, votantes y distribución.', permissions: ['TERRITORIAL_WRITE'] },
          { id: 'R-5', name: 'TESTIGO_ELECTORAL', description: 'Envío de información de mesa y reporte E-14.', permissions: ['E14_SUBMIT'] }
        ],
        modules: [
          { id: 'modulo_admin', name: 'Gestión Administrativa', status: 'Activo', mandatory: true, description: 'Control de nóminas, presupuestos, contabilidad CNE, roles de campaña y lugar de votación oficial.' },
          { id: 'gestion_estrategica', name: 'Gestión Estratégica', status: 'Activo', mandatory: false, description: 'Mapeo DAFO, metas de votos, simulador de escenarios, notas de IA y análisis de tendencias.' },
          { id: 'gestion_territorial', name: 'Gestión Territorial', status: 'Activo', mandatory: false, description: 'Geolocalización de testigos Día D, reporte de actas de escrutinio E-14 y geocercas en tiempo real.' }
        ],
        apis: [
          { name: 'Registraduría Nacional Censo', status: 'online', type: 'Rest API', limit: 5000, usage: 840, errors: 2, lastUsed: 'Hace 5 mins', maskKey: 'AIzaSyA...L8d2f', token: 'AIzaSyA_Sensor_Token_Key_2026' },
          { name: 'SMS Masivos Movistar Gateway', status: 'online', type: 'HTTPS Post', limit: 2000, usage: 320, errors: 0, lastUsed: 'Hace 12 mins', maskKey: 'tok_5129...3a8f', token: 'tok_512938472918374a8f' },
          { name: 'Google reCAPTCHA v2 Verification', status: 'online', type: 'Google API', limit: 10000, usage: 70, errors: 12, lastUsed: 'Hace 1 min', maskKey: '6Ld_8h...a2fB', token: '6Ld_8h98a2fB' },
          { name: 'Leaflet Mapbox Geocoding Routing', status: 'online', type: 'Mapbox REST', limit: 10000, usage: 190, errors: 0, lastUsed: 'Hace 45 mins', maskKey: 'pk.eyJ1...9h3f', token: 'pk.eyJ19h3f' }
        ],
        security: {
          failedAttemptsCount: 3,
          activeSessionsCount: 1,
          blockedUsers: [
            { email: 'hacker@malicioso.com', ip: '190.14.82.105', date: '2026-08-25', reason: 'Fuerza bruta repetida' }
          ],
          settings: {
            mfaRequired: false,
            passwordComplexity: 'Alta',
            sessionTimeoutMinutes: 30
          }
        },
        config: {
          maintenanceMode: false,
          rateLimit: 1200,
          databaseVerification: true
        }
      };
      this.saveDb(db);
    }
  }

  private saveDb(data: any) {
    fs.writeFileSync(this.dbPath, JSON.stringify(data, null, 2), 'utf8');
  }

  // --- AUTHENTICATION ---
  async login(loginDto: any) {
    const { email, password } = loginDto;
    const adminEmail = this.configService.get<string>('GLOBAL_ADMIN_EMAIL') || 'supremo@electoral360.com';
    const adminPassword = this.configService.get<string>('GLOBAL_ADMIN_PASSWORD') || 'ElectoralGlobalAdmin2026!!';

    if (email !== adminEmail || password !== adminPassword) {
      throw new UnauthorizedException('Tu sesión ha expirado. Inicia sesión nuevamente.');
    }

    const payload = { 
      sub: 'global-admin-id-001', 
      email: email, 
      name: 'Administrador Global Supremo',
      role: 'GLOBAL_ADMIN',
      permissions: ['SUPER_ADMIN']
    };

    const token = await this.jwtService.signAsync(payload);
    
    // Log the audit event
    this.addAuditLog('global-admin-id-001', 'Inicio de sesión', 'Autenticación exitosa del administrador global supremo.', 'Éxito');

    return {
      access_token: token,
      user: {
        id: 'global-admin-id-001',
        name: 'Administrador Global',
        email: email,
        role: 'GLOBAL_ADMIN',
        roleName: 'Administrador Global Supremo',
        status: 'ACTIVE'
      }
    };
  }

  // --- AUDIT LOGGER ---
  addAuditLog(userId: string, action: string, details: string, result: string) {
    const db = this.getDb();
    if (!db.saas) {
      db.saas = { clients: [], licenses: [], subscriptions: [], plans: [], auditLogs: [] };
    }
    const newLog = {
      id: `LOG-G${Date.now()}`,
      action,
      user: userId === 'global-admin-id-001' ? 'Administrador Global' : userId,
      timestamp: new Date().toLocaleString('es-CO'),
      details,
      result,
      ip: '127.0.0.1',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/2026'
    };
    db.saas.auditLogs.unshift(newLog);
    this.saveDb(db);
  }

  // --- DASHBOARD DATA ---
  getDashboardData() {
    const db = this.getDb();
    const adminUsers = db.admin?.users || [];
    const clients = db.saas?.clients || [];
    const auditLogs = db.saas?.auditLogs || [];

    return {
      summary: {
        totalUsers: adminUsers.length + 10, // Simulated count
        activeUsers: adminUsers.filter((u: any) => u.status === 'Activo').length + 8,
        inactiveUsers: adminUsers.filter((u: any) => u.status === 'Inactivo').length + 2,
        administratorsCount: adminUsers.length,
        campaignsCount: clients.length + 1,
        activeModulesCount: 3,
        apisConfigured: 4,
        apiConsumptions: 1420,
        securityAlertsCount: 2,
        systemErrorsCount: 0,
        servicesStatus: 'online'
      },
      metrics: {
        usersByModule: [
          { name: 'Gestión Administrativa', value: adminUsers.length },
          { name: 'Gestión Estratégica', value: 3 },
          { name: 'Gestión Territorial', value: db.territorial?.witnesses?.length || 3 }
        ],
        activityByDay: [
          { day: 'Lunes', count: 120 },
          { day: 'Martes', count: 180 },
          { day: 'Miércoles', count: 150 },
          { day: 'Jueves', count: 220 },
          { day: 'Viernes', count: 310 }
        ],
        apiConsumption: [
          { name: 'Registraduría Censo', count: 840 },
          { name: 'SMS Gateway', count: 320 },
          { name: 'Mapbox Routing', count: 190 },
          { name: 'Google reCAPTCHA v2', count: 70 }
        ],
        auditSummary: auditLogs.slice(0, 10)
      }
    };
  }

  // --- USERS ---
  getUsers() {
    const db = this.getDb();
    return db.admin?.users || [];
  }

  createUser(userDto: any) {
    const db = this.getDb();
    if (!db.admin) db.admin = { users: [], payroll: [], auditLogs: [] };
    const id = `USR-G${Date.now()}`;
    const newUser = {
      id,
      name: userDto.name,
      cedula: userDto.cedula || '',
      email: userDto.email,
      passwordHash: userDto.password || 'Campana2026!',
      role: userDto.role || 'Usuario',
      accessLevel: userDto.accessLevel || 'Nivel 5',
      status: userDto.status || 'Activo',
      createdAt: new Date().toISOString().split('T')[0]
    };
    db.admin.users.push(newUser);
    this.saveDb(db);
    this.addAuditLog('global-admin-id-001', 'Creación de usuario', `Creó al usuario: ${newUser.name} (${newUser.email})`, 'Éxito');
    return newUser;
  }

  updateUser(id: string, userDto: any) {
    const db = this.getDb();
    const userIndex = db.admin?.users?.findIndex((u: any) => u.id === id);
    if (userIndex === undefined || userIndex === -1) {
      throw new BadRequestException('Usuario no encontrado');
    }
    const user = db.admin.users[userIndex];
    const updatedUser = {
      ...user,
      ...userDto
    };
    db.admin.users[userIndex] = updatedUser;
    this.saveDb(db);
    this.addAuditLog('global-admin-id-001', 'Modificación de usuario', `Actualizó datos del usuario: ${updatedUser.name}`, 'Éxito');
    return updatedUser;
  }

  // --- ROLES & PERMISSIONS ---
  getRoles() {
    const db = this.getDb();
    return db.globalAdminSettings.roles;
  }

  updateRolePermissions(id: string, permissions: string[]) {
    const db = this.getDb();
    const role = db.globalAdminSettings.roles.find((r: any) => r.id === id);
    if (!role) {
      throw new BadRequestException('Rol no encontrado');
    }
    role.permissions = permissions;
    this.saveDb(db);
    this.addAuditLog('global-admin-id-001', 'Permisos de rol actualizados', `Actualizó permisos del rol: ${role.name}`, 'Éxito');
    return role;
  }

  // --- CAMPAIGNS ---
  getCampaigns() {
    const db = this.getDb();
    const clients = db.saas?.clients || [];
    
    // Check if we have CAMP-001 initialized
    if (!db.globalAdminSettings.campaigns) {
      db.globalAdminSettings.campaigns = [
        {
          id: 'CAMP-001',
          name: 'Campaña María Paula Restrepo 2026',
          status: 'Activo',
          adminName: 'Dra. María Paula Restrepo',
          usersCount: db.admin?.users?.length || 4,
          createdAt: '2026-01-10',
          lastActivity: 'Hace unos momentos'
        }
      ];
      this.saveDb(db);
    }

    // Merge static campaigns with clients campaigns
    const savedCampaigns = db.globalAdminSettings.campaigns;
    const clientCampaigns = clients.map((c: any) => ({
      id: c.id,
      name: `Campaña ${c.name}`,
      status: c.status === 'Activo' ? 'Activo' : 'Inactivo',
      adminName: c.email,
      usersCount: 5,
      createdAt: c.createdAt || '2026-03-01',
      lastActivity: 'Hace unos momentos'
    }));

    // Return combined unique list
    const combined = [...savedCampaigns];
    for (const c of clientCampaigns) {
      if (!combined.some((item: any) => item.id === c.id)) {
        combined.push(c);
      }
    }
    return combined;
  }

  updateCampaign(id: string, body: any) {
    const db = this.getDb();
    if (!db.globalAdminSettings.campaigns) {
      db.globalAdminSettings.campaigns = [
        {
          id: 'CAMP-001',
          name: 'Campaña María Paula Restrepo 2026',
          status: 'Activo',
          adminName: 'Dra. María Paula Restrepo',
          usersCount: db.admin?.users?.length || 4,
          createdAt: '2026-01-10',
          lastActivity: 'Hace unos momentos'
        }
      ];
    }
    const campIndex = db.globalAdminSettings.campaigns.findIndex((c: any) => c.id === id);
    if (campIndex !== -1) {
      db.globalAdminSettings.campaigns[campIndex] = {
        ...db.globalAdminSettings.campaigns[campIndex],
        ...body,
        lastActivity: 'Hace unos momentos'
      };
      this.saveDb(db);
      this.addAuditLog('global-admin-id-001', 'Modificación de campaña', `Actualizó campaña: ${body.name || id}`, 'Éxito');
      return db.globalAdminSettings.campaigns[campIndex];
    }

    // Fallback search in clients
    const clientIndex = db.saas?.clients?.findIndex((c: any) => c.id === id);
    if (clientIndex !== -1 && clientIndex !== undefined) {
      db.saas.clients[clientIndex] = {
        ...db.saas.clients[clientIndex],
        name: body.name ? body.name.replace('Campaña ', '') : db.saas.clients[clientIndex].name,
        status: body.status === 'Activo' ? 'Activo' : 'Inactivo',
        email: body.adminName || db.saas.clients[clientIndex].email
      };
      this.saveDb(db);
      this.addAuditLog('global-admin-id-001', 'Modificación de campaña (SaaS)', `Actualizó campaña SaaS: ${id}`, 'Éxito');
      return db.saas.clients[clientIndex];
    }

    throw new BadRequestException('Campaña no encontrada');
  }

  // --- APIS ---
  getApis() {
    const db = this.getDb();
    return db.globalAdminSettings.apis;
  }

  updateApi(name: string, body: any) {
    const db = this.getDb();
    const api = db.globalAdminSettings.apis.find((a: any) => a.name === name);
    if (!api) {
      throw new BadRequestException('API no encontrada');
    }
    
    if (body.limit !== undefined) api.limit = Number(body.limit);
    if (body.status !== undefined) api.status = body.status;
    if (body.token !== undefined) {
      api.token = body.token;
      // Re-mask the token
      api.maskKey = body.token.length > 8 
        ? `${body.token.substring(0, 7)}...${body.token.substring(body.token.length - 4)}` 
        : '••••••••';
    }
    api.lastUsed = 'Hace unos instantes';
    this.saveDb(db);
    this.addAuditLog('global-admin-id-001', 'Modificación de API', `Actualizó configuración de API: ${name}`, 'Éxito');
    return api;
  }

  // --- MODULES ---
  getModules() {
    const db = this.getDb();
    return db.globalAdminSettings.modules;
  }

  updateModule(id: string, body: any) {
    const db = this.getDb();
    const mod = db.globalAdminSettings.modules.find((m: any) => m.id === id);
    if (!mod) {
      throw new BadRequestException('Módulo no encontrado');
    }
    if (body.status !== undefined) mod.status = body.status;
    this.saveDb(db);
    this.addAuditLog('global-admin-id-001', 'Modificación de Módulo', `Actualizó estado del módulo ${mod.name} a: ${mod.status}`, 'Éxito');
    return mod;
  }

  // --- AUDIT LOGS ---
  getAuditLogs() {
    const db = this.getDb();
    return db.saas?.auditLogs || [];
  }

  // --- SECURITY ---
  getSecurityData() {
    const db = this.getDb();
    return db.globalAdminSettings.security;
  }

  updateSecuritySettings(body: any) {
    const db = this.getDb();
    db.globalAdminSettings.security.settings = {
      ...db.globalAdminSettings.security.settings,
      ...body
    };
    this.saveDb(db);
    this.addAuditLog('global-admin-id-001', 'Ajustes de seguridad actualizados', 'Actualizó directivas de seguridad global', 'Éxito');
    return db.globalAdminSettings.security.settings;
  }

  blockIp(body: any) {
    const db = this.getDb();
    const newBlock = {
      email: body.email || 'N/A',
      ip: body.ip,
      date: new Date().toISOString().split('T')[0],
      reason: body.reason || 'Tráfico anómalo detectado'
    };
    // Prevent duplicate
    if (!db.globalAdminSettings.security.blockedUsers.some((u: any) => u.ip === body.ip)) {
      db.globalAdminSettings.security.blockedUsers.push(newBlock);
      this.saveDb(db);
      this.addAuditLog('global-admin-id-001', 'Bloqueo de dirección IP', `Bloqueó IP: ${body.ip} - Motivo: ${newBlock.reason}`, 'Éxito');
    }
    return db.globalAdminSettings.security.blockedUsers;
  }

  unblockIp(ip: string) {
    const db = this.getDb();
    db.globalAdminSettings.security.blockedUsers = db.globalAdminSettings.security.blockedUsers.filter((u: any) => u.ip !== ip);
    this.saveDb(db);
    this.addAuditLog('global-admin-id-001', 'Desbloqueo de dirección IP', `Desbloqueó IP: ${ip}`, 'Éxito');
    return db.globalAdminSettings.security.blockedUsers;
  }

  // --- SYSTEM CONFIG ---
  getConfig() {
    const db = this.getDb();
    return db.globalAdminSettings.config;
  }

  updateConfig(body: any) {
    const db = this.getDb();
    db.globalAdminSettings.config = {
      ...db.globalAdminSettings.config,
      ...body
    };
    this.saveDb(db);
    this.addAuditLog('global-admin-id-001', 'Configuración de servidor actualizada', 'Actualizó parámetros del servidor principal', 'Éxito');
    return db.globalAdminSettings.config;
  }

  // --- SYSTEM STATUS ---
  getSystemStatus() {
    const db = this.getDb();
    const config = db.globalAdminSettings.config;
    return {
      backend: 'online',
      database: 'online',
      apis: 'online',
      uptime: '15 días, 4 horas, 28 minutos',
      version: 'v2.1.8-electoral',
      memoryUsage: '148MB / 512MB',
      cpuLoad: '2.8%',
      maintenanceMode: config.maintenanceMode ? 'Activado' : 'Desactivado',
      rateLimit: `${config.rateLimit} peticiones / min`,
      databaseVerification: config.databaseVerification ? 'Habilitado' : 'Desactivado'
    };
  }
}
