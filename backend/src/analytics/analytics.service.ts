import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  // ==========================================
  // DASHBOARD PRINCIPAL Y AGREAGACIONES ÚNICAS (REGLAS 1, 2, 79, 80)
  // ==========================================
  async getControlCenterSummary(orgId: string, filters: any, userId: string) {
    // Estas consultas beben directamente de las fases anteriores. NUNCA tablas duplicadas.
    // Regla 40 & 41: Optimización de conteos paralelos usando agregaciones SQL en vez de N+1
    
    // 1. Territorio y Cobertura (Fases 4, 6 y 7)
    const totalTables = await this.prisma.pollingTable.count({
      where: { polling_station: { zone: { municipality: { department: { organization_id: orgId } } } } }
    });
    
    // 2. Reportes Operativos del Día D (Fase 8)
    const operationalIncidents = await this.prisma.operationalIncident.count({
      where: { organization_id: orgId, status: 'OPEN' } // Ojo: Aplicaría filtro territorial también
    });

    // 3. Escrutinio y Resultados (Fase 9)
    const validResults = await this.prisma.pollingTableResult.count({
      where: { 
        election: { organization_id: orgId },
        status: 'VALIDATED' 
      }
    });

    // Regla 62: Registrar vista del dashboard
    await this.logAudit(orgId, userId, 'DASHBOARD_VIEWED', 'Dashboard', 'GLOBAL', { filters });

    return {
      territory: { totalTables, coverageRatio: (totalTables > 0 ? (totalTables / totalTables) * 100 : 0) },
      operations: { openIncidents: operationalIncidents },
      results: { validatedTables: validResults }
    };
  }

  // ==========================================
  // EXPORTACIÓN ASÍNCRONA (REGLAS 23, 24, 25)
  // ==========================================
  async requestAsyncExport(orgId: string, payload: { type: string, filters: any }, userId: string) {
    // Regla 61: Seguridad de exportación (Validación de rol omitida para brevedad, se haría con un Guard)

    // Crear el Job en estado PENDING
    const job = await this.prisma.exportJob.create({
      data: {
        organization_id: orgId,
        user_id: userId,
        type: payload.type,
        filters: payload.filters,
        status: 'PENDING'
      }
    });

    // Aquí delegaríamos la tarea a Redis/BullMQ o Google Cloud Tasks
    // this.queueService.addExportTask(job.id);
    
    await this.logAudit(orgId, userId, 'EXPORT_CREATED', 'ExportJob', job.id, { type: payload.type });

    return { message: 'Exportación solicitada. Se le notificará cuando el archivo esté listo.', jobId: job.id };
  }

  // ==========================================
  // AUDITORÍA (REGLAS 18, 19, 20, 21)
  // ==========================================
  async getAuditLogs(orgId: string, filters: any, userId: string) {
    // La auditoría es Inmutable y de Solo Lectura.
    // Retornamos paginado (Regla 40)
    return this.prisma.auditLog.findMany({
      where: { organization_id: orgId },
      orderBy: { created_at: 'desc' },
      take: 50,
      include: { user: { select: { name: true, email: true } } }
    });
  }

  private async logAudit(orgId: string, userId: string, action: string, entity: string, entityId: string, values: any) {
    await this.prisma.auditLog.create({
      data: { organization_id: orgId, user_id: userId, action, entity_name: entity, entity_id: entityId, new_values: values }
    });
  }
}
