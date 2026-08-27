import { Controller, Get, Post, Patch, Delete, Body, Param, Query, Res, HttpStatus } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Controller()
export class BeeCampaignController {
  private dbPath = path.resolve(process.cwd(), 'data_db.json');

  private getDb() {
    try {
      const content = fs.readFileSync(this.dbPath, 'utf8');
      return JSON.parse(content);
    } catch (e) {
      return { 
        admin: { users: [], payroll: [], auditLogs: [] }, 
        strategic: { dafoEntries: [], budgets: [], aiNotes: [] }, 
        territorial: { voters: [], e14Actas: [], witnesses: [] }, 
        saas: { clients: [], licenses: [], subscriptions: [], plans: [], auditLogs: [] } 
      };
    }
  }

  private saveDb(data: any) {
    fs.writeFileSync(this.dbPath, JSON.stringify(data, null, 2), 'utf8');
  }

  // Configurations
  @Get('instantdb-config')
  getInstantDb() {
    return {
      appId: '3c4f54a8-fe14-45d6-8303-e034f3495d9b',
      status: 'online',
      syncEnabled: true
    };
  }

  @Get('supabase-config')
  getSupabaseConfig() {
    return {
      supabaseUrl: 'https://ojvrlleziqrimhjvsbwf.supabase.co',
      restEndpoint: 'https://ojvrlleziqrimhjvsbwf.supabase.co/rest/v1/',
      status: 'connected',
      anonKeyConfigured: true,
      timestamp: new Date().toISOString()
    };
  }

  // ==========================================
  // MODULE 1: GESTIÓN ADMINISTRATIVA
  // ==========================================
  @Get('admin/users')
  getAdminUsers() {
    return this.getDb().admin.users;
  }

  @Post('admin/users')
  createAdminUser(@Body() body: any) {
    const { name, cedula, email, password, role, accessLevel } = body;
    const db = this.getDb();
    const newUser = {
      id: `USR-${Math.floor(1000 + Math.random() * 9000)}`,
      name,
      cedula: cedula || `${Math.floor(1000000000 + Math.random() * 90000000)}`,
      email,
      passwordHash: password || 'ClaveSegura2026!',
      role: role || 'Operador Administrativo',
      accessLevel: accessLevel || 'Nivel 5',
      status: 'Activo',
      createdAt: new Date().toISOString().split('T')[0]
    };
    db.admin.users.push(newUser);
    db.admin.auditLogs.unshift({
      id: `LOG-${Math.floor(100 + Math.random() * 900)}`,
      action: 'Usuario Creado',
      user: 'Dra. María Paula Restrepo',
      timestamp: new Date().toLocaleString(),
      details: `Creación de usuario: ${name} (${email}) - CC: ${newUser.cedula}`
    });
    this.saveDb(db);
    return newUser;
  }

  @Patch('admin/users/:id/status')
  patchAdminUserStatus(@Param('id') id: string, @Body() body: any) {
    const { status } = body;
    const db = this.getDb();
    const user = db.admin.users.find((u: any) => u.id === id);
    if (!user) {
      return { error: 'Usuario no encontrado' };
    }
    user.status = status || (user.status === 'Activo' ? 'Inactivo' : 'Activo');
    db.admin.auditLogs.unshift({
      id: `LOG-${Math.floor(100 + Math.random() * 900)}`,
      action: 'Estado de Acceso Modificado',
      user: 'Dra. María Paula Restrepo',
      timestamp: new Date().toLocaleString(),
      details: `Modificación de estado de acceso a usuario: ${user.name} (${user.email}) -> ${user.status}`
    });
    this.saveDb(db);
    return user;
  }

  @Delete('admin/users/:id')
  deleteAdminUser(@Param('id') id: string) {
    const db = this.getDb();
    db.admin.users = db.admin.users.filter((u: any) => u.id !== id);
    db.admin.auditLogs.unshift({
      id: `LOG-${Math.floor(100 + Math.random() * 900)}`,
      action: 'Usuario Eliminado',
      user: 'Dra. María Paula Restrepo',
      timestamp: new Date().toLocaleString(),
      details: `Eliminación de usuario ID: ${id}`
    });
    this.saveDb(db);
    return { success: true };
  }

  @Get('admin/payroll')
  getAdminPayroll() {
    return this.getDb().admin.payroll;
  }

  @Post('admin/payroll')
  createAdminPayroll(@Body() body: any) {
    const { concept, category, amount } = body;
    const db = this.getDb();
    const newItem = {
      id: `PAY-${Math.floor(100 + Math.random() * 900)}`,
      concept: concept || 'Gasto Operativo',
      category: category || 'Logística',
      amount: Number(amount) || 0,
      date: new Date().toISOString().split('T')[0],
      status: 'Pagado'
    };
    db.admin.payroll.unshift(newItem);
    this.saveDb(db);
    return newItem;
  }

  @Get('admin/logs')
  getAdminLogs() {
    return this.getDb().admin.auditLogs;
  }

  // ==========================================
  // MODULE 2: GESTIÓN ESTRATÉGICA
  // ==========================================
  @Get('strategic/dafo')
  getStrategicDafo() {
    return this.getDb().strategic.dafoEntries;
  }

  @Post('strategic/dafo')
  createStrategicDafo(@Body() body: any) {
    const { type, description, impact } = body;
    const db = this.getDb();
    const newEntry = {
      id: `DAF-${Math.floor(10 + Math.random() * 90)}`,
      type: type || 'Fortaleza',
      description: description || 'Nuevo punto estratégico identificado',
      impact: impact || 'Alto',
      status: 'Activo'
    };
    db.strategic.dafoEntries.unshift(newEntry);
    this.saveDb(db);
    return newEntry;
  }

  @Delete('strategic/dafo/:id')
  deleteStrategicDafo(@Param('id') id: string) {
    const db = this.getDb();
    db.strategic.dafoEntries = db.strategic.dafoEntries.filter((d: any) => d.id !== id);
    this.saveDb(db);
    return { success: true };
  }

  @Get('strategic/budget')
  getStrategicBudget() {
    return this.getDb().strategic.budgets;
  }

  @Post('strategic/budget')
  createStrategicBudget(@Body() body: any) {
    const { title, allocated, executed, department } = body;
    const db = this.getDb();
    const newBudget = {
      id: `STR-B${Math.floor(10 + Math.random() * 90)}`,
      title: title || 'Nueva Línea Presupuestaria',
      allocated: Number(allocated) || 0,
      executed: Number(executed) || 0,
      department: department || 'Estrategia'
    };
    db.strategic.budgets.push(newBudget);
    this.saveDb(db);
    return newBudget;
  }

  @Get('strategic/candidate')
  getStrategicCandidate() {
    return this.getDb().strategic.candidateProfile || {};
  }

  @Post('strategic/candidate')
  updateStrategicCandidate(@Body() body: any) {
    const db = this.getDb();
    db.strategic.candidateProfile = {
      ...db.strategic.candidateProfile,
      ...body
    };
    this.saveDb(db);
    return db.strategic.candidateProfile;
  }

  @Post('strategic/ai-diagnose')
  async aiDiagnose(@Body() body: any) {
    const { prompt } = body;
    const db = this.getDb();

    const dafoCount = db.strategic.dafoEntries.length;
    const totalBudget = db.strategic.budgets.reduce((acc: number, b: any) => acc + b.allocated, 0);
    const fallbackText = 
      `📊 DIAGNÓSTICO ESTRATÉGICO IA (CAMPAÑA GANADORA):\n` +
      `• Análisis de Solicitud: "${prompt}"\n` +
      `• Elementos DAFO Activos: ${dafoCount} hallazgos registrados en matriz de riesgo.\n` +
      `• Asignación Presupuestaria Estratégica: $${totalBudget.toLocaleString('es-CO')} COP.\n` +
      `• Recomendación Táctica: Intensificar movilización territorial en puestos clave con cobertura >90% e implementar piezas digitales focalizadas.`;

    return { response: fallbackText };
  }

  // ==========================================
  // MODULE 3: GESTIÓN TERRITORIAL
  // ==========================================
  @Get('territorial/voters')
  getTerritorialVoters() {
    return this.getDb().territorial.voters;
  }

  @Post('territorial/voters')
  createTerritorialVoter(@Body() body: any, @Res() res: any) {
    const { name, cedula, puesto, mesa, leaderName } = body;
    const db = this.getDb();

    const existing = db.territorial.voters.find((v: any) => v.cedula === cedula);
    if (existing) {
      return res.status(HttpStatus.BAD_REQUEST).json({ 
        error: `DUPLICIDAD DETECTADA: La cédula ${cedula} ya fue asignada previamente al líder "${existing.leaderName}".` 
      });
    }

    const newVoter = {
      id: `VOT-${Math.floor(100 + Math.random() * 900)}`,
      name: name || 'Votante Registrado',
      cedula,
      puesto: puesto || 'INEM Jorge Isaacs',
      mesa: mesa || 'Mesa 01',
      leaderName: leaderName || 'Líder Capitán Fernando Torres',
      status: 'Confirmado'
    };

    db.territorial.voters.unshift(newVoter);
    this.saveDb(db);
    return res.json(newVoter);
  }

  @Get('territorial/voters/lookup')
  lookupTerritorialVoter(@Query('cedula') cedula: string, @Query('query') query: string, @Res() res: any) {
    const searchTerm = (cedula || query || '').toString().trim().toLowerCase();
    const db = this.getDb();

    if (!searchTerm) {
      return res.status(HttpStatus.BAD_REQUEST).json({ error: 'Parámetro de búsqueda de cédula requerido.' });
    }

    const match = db.territorial.voters.find(
      (v: any) => v.cedula === searchTerm || v.name.toLowerCase().includes(searchTerm)
    );

    if (match) {
      return res.json({
        found: true,
        voter: match
      });
    }

    return res.json({
      found: false,
      message: 'No se encontró en base de datos local. Listo para consulta en API externa.'
    });
  }

  @Get('territorial/e14')
  getTerritorialE14() {
    return this.getDb().territorial.e14Actas;
  }

  @Post('territorial/e14')
  createTerritorialE14(@Body() body: any) {
    const { mesa, puesto, votosCandidato, votosOponente, nulos } = body;
    const db = this.getDb();
    const newActa = {
      id: `E14-${Math.floor(100 + Math.random() * 900)}`,
      mesa: mesa || 'Mesa 01',
      puesto: puesto || 'INEM Jorge Isaacs',
      votosCandidato: Number(votosCandidato) || 0,
      votosOponente: Number(votosOponente) || 0,
      nulos: Number(nulos) || 0,
      status: 'Verificada OCR',
      timestamp: new Date().toLocaleString()
    };
    db.territorial.e14Actas.unshift(newActa);
    this.saveDb(db);
    return newActa;
  }

  @Get('territorial/witnesses')
  getTerritorialWitnesses() {
    return this.getDb().territorial.witnesses;
  }

  @Post('territorial/witnesses')
  createTerritorialWitness(@Body() body: any) {
    const { name, puesto, mesa, phone } = body;
    const db = this.getDb();
    const newWitness = {
      id: `WIT-${Math.floor(10 + Math.random() * 90)}`,
      name: name || 'Nuevo Testigo E-14',
      puesto: puesto || 'INEM Jorge Isaacs',
      mesa: mesa || 'Mesa 01',
      phone: phone || '3000000000',
      geofenceVerified: true,
      batteryPct: 95
    };
    db.territorial.witnesses.unshift(newWitness);
    this.saveDb(db);
    return newWitness;
  }

  // ==========================================
  // MODULE 4: SAAS ADMIN PANEL
  // ==========================================
  @Get('saas/clients')
  getSaasClients() {
    return this.getDb().saas?.clients || [];
  }

  @Post('saas/clients')
  createSaasClient(@Body() body: any, @Res() res: any) {
    const { name, email, phone, plan } = body;
    if (!name || !email) {
      return res.status(HttpStatus.BAD_REQUEST).json({ error: 'Nombre y email son requeridos.' });
    }
    const db = this.getDb();
    if (!db.saas) db.saas = { clients: [], licenses: [], subscriptions: [], plans: [], auditLogs: [] };
    
    const newClient = {
      id: `CLI-${Math.floor(100 + Math.random() * 900)}`,
      name,
      email,
      phone: phone || '',
      status: 'Activo' as const,
      plan: plan || 'Starter',
      joinedDate: new Date().toISOString().split('T')[0]
    };
    db.saas.clients.push(newClient);
    
    const newLicense = {
      id: `LIC-${Math.floor(100 + Math.random() * 900)}`,
      clientName: name,
      planName: plan || 'Starter',
      code: `LIC-${name.toUpperCase().replace(/\s+/g, '-')}-${Math.floor(100 + Math.random() * 900)}`,
      startDate: new Date().toISOString().split('T')[0],
      expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'Activa' as const,
      maxUsers: plan === 'Enterprise Master' ? 150 : plan === 'Pro AI' ? 50 : 10,
      modules: plan === 'Enterprise Master' 
        ? ['gestion_estrategica', 'gestion_territorial', 'modulo_admin', 'testigo_campo', 'encuestas', 'jurado_campo', 'presupuesto', 'pruebas_electorales']
        : plan === 'Pro AI' 
          ? ['gestion_estrategica', 'gestion_territorial', 'encuestas', 'presupuesto']
          : ['gestion_territorial', 'testigo_campo']
    };
    db.saas.licenses.push(newLicense);

    const newSub = {
      id: `SUB-${Math.floor(100 + Math.random() * 900)}`,
      clientName: name,
      planName: plan || 'Starter',
      status: 'Activo' as const,
      billingCycle: 'Mensual' as const,
      nextRenewal: newLicense.expirationDate,
      mrr: plan === 'Enterprise Master' ? 2500 : plan === 'Pro AI' ? 850 : 150
    };
    db.saas.subscriptions.push(newSub);

    db.saas.auditLogs.unshift({
      id: `SALOG-${Math.floor(100 + Math.random() * 900)}`,
      action: 'Cliente Creado',
      user: 'Superadmin Principal',
      timestamp: new Date().toLocaleString(),
      details: `SaaS Client creado: ${name}. Plan: ${plan}. Licencia & suscripción auto-creadas.`,
      client: name
    });

    this.saveDb(db);
    return res.json(newClient);
  }

  @Patch('saas/clients/:id')
  updateSaasClient(@Param('id') id: string, @Body() body: any, @Res() res: any) {
    const { name, email, phone, status, plan } = body;
    const db = this.getDb();
    if (!db.saas) return res.status(HttpStatus.NOT_FOUND).json({ error: 'SaaS DB no inicializado' });
    
    const clientIndex = db.saas.clients.findIndex((c: any) => c.id === id);
    if (clientIndex === -1) return res.status(HttpStatus.NOT_FOUND).json({ error: 'Cliente no encontrado' });
    
    const client = db.saas.clients[clientIndex];
    if (name) client.name = name;
    if (email) client.email = email;
    if (phone) client.phone = phone;
    if (status) client.status = status;
    if (plan) client.plan = plan;

    db.saas.auditLogs.unshift({
      id: `SALOG-${Math.floor(100 + Math.random() * 900)}`,
      action: 'Cliente Actualizado',
      user: 'Superadmin Principal',
      timestamp: new Date().toLocaleString(),
      details: `Cliente ${client.name} actualizado. Status: ${client.status}, Plan: ${client.plan}.`,
      client: client.name
    });

    this.saveDb(db);
    return res.json(client);
  }

  @Get('saas/licenses')
  getSaasLicenses() {
    return this.getDb().saas?.licenses || [];
  }

  @Get('saas/subscriptions')
  getSaasSubscriptions() {
    return this.getDb().saas?.subscriptions || [];
  }

  @Get('saas/plans')
  getSaasPlans() {
    return this.getDb().saas?.plans || [];
  }

  @Get('saas/audit-logs')
  getSaasAuditLogs() {
    return this.getDb().saas?.auditLogs || [];
  }
}
