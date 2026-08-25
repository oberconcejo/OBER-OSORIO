import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class PlanningService {
  constructor(private prisma: PrismaService) {}

  // ==========================================
  // COBERTURA OPERATIVA (REGLAS 7, 8, 9, 10)
  // ==========================================
  async getTerritorialCoverage(orgId: string, territoryScope?: any) {
    // Cuenta total de mesas en la organización (con filtrado IDOR)
    const totalTables = await this.prisma.pollingTable.count({
      where: { polling_station: { zone: { municipality: { department: { organization_id: orgId } } } } }
    });

    // Cuenta de mesas que tienen al menos una asignación ACTIVA (con responsable)
    const coveredTables = await this.prisma.pollingTable.count({
      where: { 
        polling_station: { zone: { municipality: { department: { organization_id: orgId } } } },
        team_assignments: { some: { status: 'ACTIVE' } }
      }
    });

    const pendingTables = totalTables - coveredTables;
    const percentage = totalTables === 0 ? 0 : (coveredTables / totalTables) * 100;

    // Semáforo Operativo (Regla 10)
    let semaphore = 'BAJO';
    if (percentage >= 80) semaphore = 'ALTO';
    else if (percentage >= 50) semaphore = 'MEDIO';

    return { total: totalTables, covered: coveredTables, pending: pendingTables, percentage: percentage.toFixed(2), semaphore };
  }

  // ==========================================
  // PLANIFICACIÓN Y TAREAS (REGLAS 11, 13, 34)
  // ==========================================
  async createTask(orgId: string, data: any, userId: string) {
    // Prevención IDOR y de asignaciones fuera de contexto (Regla 34 y 40)
    if (data.assignee_id) {
      const member = await this.prisma.teamMember.findFirst({ where: { id: data.assignee_id, organization_id: orgId } });
      if (!member) throw new ForbiddenException('No puede asignar tareas a miembros de otra organización.');
    }

    const task = await this.prisma.task.create({
      data: { ...data, organization_id: orgId }
    });

    // Auditoría
    await this.prisma.auditLog.create({
      data: { organization_id: orgId, user_id: userId, action: 'TERRITORIAL_TASK_CREATED', entity_name: 'Task', entity_id: task.id, new_values: data }
    });

    return task;
  }

  // ==========================================
  // ALERTAS Y NOTIFICACIONES (REGLA 15, 36)
  // ==========================================
  async generateInternalAlerts(orgId: string) {
    // Ejemplo de tarea programada (cron) o trigger interno: Detectar mesas sin responsable
    const orphanTables = await this.prisma.pollingTable.findMany({
      where: { 
        polling_station: { zone: { municipality: { department: { organization_id: orgId } } } },
        team_assignments: { none: { status: 'ACTIVE' } }
      },
      take: 10
    });

    // Generaría notificaciones internas en la DB, nunca WhatsApp (Regla 36)
    return { generatedAlerts: orphanTables.length };
  }
}
