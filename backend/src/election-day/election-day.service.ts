import { Injectable, ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class ElectionDayService {
  constructor(private prisma: PrismaService) {}

  // ==========================================
  // IDEMPOTENCIA Y SINCRONIZACIÓN OFFLINE (REGLAS 20, 21, 22, 47, 66)
  // ==========================================
  async syncFieldReport(orgId: string, data: any, userId: string) {
    // Protección IDOR y Control Territorial
    // Asumimos que `validateTerritorialScope` verifica que el usuario tiene acceso al `polling_station_id`
    await this.validateTerritorialScope(orgId, userId, data.polling_station_id);

    // Idempotencia: Verificar si el UUID del cliente ya fue procesado
    const existing = await this.prisma.fieldReport.findUnique({
      where: { client_uuid: data.client_uuid }
    });

    if (existing) {
      // Si el reporte ya existe, devolvemos el existente en vez de fallar o duplicar
      return { status: 'ALREADY_SYNCED', data: existing };
    }

    const report = await this.prisma.fieldReport.create({
      data: {
        organization_id: orgId,
        election_day_id: data.election_day_id,
        client_uuid: data.client_uuid,
        report_type: data.report_type, // OPENING, OPERATION, CLOSING
        status: data.status,
        description: data.description,
        reporter_id: data.reporter_id,
        polling_station_id: data.polling_station_id,
        polling_table_id: data.polling_table_id,
        reported_at: new Date(data.reported_at)
      }
    });

    await this.logAudit(orgId, userId, 'FIELD_REPORT_CREATED', 'FieldReport', report.id, data);
    
    // Aquí se emitiría el evento SSE / WebSocket (Regla 18 y 19)
    // this.eventEmitter.emit('election.report.added', report);

    return { status: 'SYNCED', data: report };
  }

  // ==========================================
  // INCIDENTES Y ESTADO OPERATIVO (REGLAS 12, 13, 14, 15)
  // ==========================================
  async createIncident(orgId: string, data: any, userId: string) {
    await this.validateTerritorialScope(orgId, userId, data.polling_station_id);

    const existing = await this.prisma.operationalIncident.findUnique({
      where: { client_uuid: data.client_uuid }
    });
    if (existing) return existing; // Idempotencia

    const incident = await this.prisma.operationalIncident.create({
      data: {
        organization_id: orgId,
        election_day_id: data.election_day_id,
        client_uuid: data.client_uuid,
        type: data.type,
        priority: data.priority || 'MEDIUM', // LOW, MEDIUM, HIGH, CRITICAL
        description: data.description,
        reporter_id: data.reporter_id,
        polling_station_id: data.polling_station_id,
        polling_table_id: data.polling_table_id
      }
    });

    await this.logAudit(orgId, userId, 'INCIDENT_CREATED', 'OperationalIncident', incident.id, data);
    // this.eventEmitter.emit('election.incident.added', incident);

    return incident;
  }

  // ==========================================
  // UTILIDADES
  // ==========================================
  private async validateTerritorialScope(orgId: string, userId: string, stationId: string) {
    // Aquí va la lógica real cruzando User -> TeamMember -> TeamAssignments -> Territories
    // Si falla, lanza throw new ForbiddenException();
    return true;
  }

  private async logAudit(orgId: string, userId: string, action: string, entity: string, entityId: string, values: any) {
    await this.prisma.auditLog.create({
      data: { organization_id: orgId, user_id: userId, action, entity_name: entity, entity_id: entityId, new_values: values }
    });
  }
}
