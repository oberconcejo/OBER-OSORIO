import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { 
  CreateOperationDto, UpdateOperationDto, 
  CreateOperationDayDto, UpdateOperationDayDto,
  CreateMobilizationActivityDto, UpdateMobilizationActivityDto,
  CreateIncidentDto, UpdateIncidentDto,
  CreateOperationalPointDto, UpdateOperationalPointDto,
  CreateResourceDto, UpdateResourceDto 
} from './dto/mobilization.dto';

@Injectable()
export class MobilizationService {
  constructor(private prisma: PrismaService) {}

  // ==========================================
  // OPERATIONS
  // ==========================================

  async createOperation(organizationId: string, dto: CreateOperationDto) {
    return this.prisma.operation.create({
      data: {
        organization_id: organizationId,
        name: dto.name,
        description: dto.description,
        start_date: new Date(dto.start_date),
        end_date: dto.end_date ? new Date(dto.end_date) : null,
        status: dto.status || 'BORRADOR',
        priority: dto.priority || 'MEDIA',
      },
    });
  }

  async getOperations(organizationId: string) {
    return this.prisma.operation.findMany({
      where: { organization_id: organizationId },
      include: {
        days: true,
        activities: true,
        incidents: true,
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async getOperationById(organizationId: string, id: string) {
    const op = await this.prisma.operation.findFirst({
      where: { id, organization_id: organizationId },
      include: {
        days: {
          include: {
            activities: {
              include: {
                assigned_to: true,
                municipality: true,
                zone: true,
                polling_station: true,
              }
            }
          }
        },
        activities: {
          where: { operation_day_id: null }, // Actividades directas sin día específico
          include: {
            assigned_to: true,
            municipality: true,
            zone: true,
            polling_station: true,
          }
        },
        incidents: {
          include: {
            reported_by: true,
            assignments: { include: { member: true } },
            history: true,
          }
        },
      },
    });
    if (!op) throw new NotFoundException('Operación no encontrada');
    return op;
  }

  async updateOperation(organizationId: string, id: string, dto: UpdateOperationDto) {
    const op = await this.prisma.operation.findFirst({ where: { id, organization_id: organizationId } });
    if (!op) throw new NotFoundException('Operación no encontrada');

    return this.prisma.operation.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        start_date: dto.start_date ? new Date(dto.start_date) : undefined,
        end_date: dto.end_date ? new Date(dto.end_date) : undefined,
        status: dto.status,
        priority: dto.priority,
      },
    });
  }

  async deleteOperation(organizationId: string, id: string) {
    const op = await this.prisma.operation.findFirst({ where: { id, organization_id: organizationId } });
    if (!op) throw new NotFoundException('Operación no encontrada');

    return this.prisma.operation.delete({ where: { id } });
  }

  // ==========================================
  // OPERATION DAYS
  // ==========================================

  async createOperationDay(organizationId: string, dto: CreateOperationDayDto) {
    const op = await this.prisma.operation.findFirst({ where: { id: dto.operation_id, organization_id: organizationId } });
    if (!op) throw new NotFoundException('Operación raíz no encontrada');

    return this.prisma.operationDay.create({
      data: {
        operation_id: dto.operation_id,
        name: dto.name,
        date: new Date(dto.date),
        start_time: dto.start_time,
        end_time: dto.end_time,
        status: dto.status || 'PROGRAMADA',
        description: dto.description,
      },
    });
  }

  async updateOperationDay(organizationId: string, dayId: string, dto: UpdateOperationDayDto) {
    const day = await this.prisma.operationDay.findFirst({
      where: { id: dayId, operation: { organization_id: organizationId } },
    });
    if (!day) throw new NotFoundException('Día operativo no encontrado');

    return this.prisma.operationDay.update({
      where: { id: dayId },
      data: {
        name: dto.name,
        date: dto.date ? new Date(dto.date) : undefined,
        start_time: dto.start_time,
        end_time: dto.end_time,
        status: dto.status,
        description: dto.description,
      },
    });
  }

  // ==========================================
  // MOBILIZATION ACTIVITIES
  // ==========================================

  async createActivity(organizationId: string, dto: CreateMobilizationActivityDto) {
    const op = await this.prisma.operation.findFirst({ where: { id: dto.operation_id, organization_id: organizationId } });
    if (!op) throw new NotFoundException('Operación no encontrada');

    return this.prisma.mobilizationActivity.create({
      data: {
        organization_id: organizationId,
        operation_id: dto.operation_id,
        operation_day_id: dto.operation_day_id || null,
        name: dto.name,
        description: dto.description,
        type: dto.type || 'OTRO',
        priority: dto.priority || 'MEDIA',
        status: dto.status || 'PENDIENTE',
        start_date_time: new Date(dto.start_date_time),
        end_date_time: new Date(dto.end_date_time),
        municipality_id: dto.municipality_id || null,
        zone_id: dto.zone_id || null,
        polling_station_id: dto.polling_station_id || null,
        polling_table_id: dto.polling_table_id || null,
        assigned_to_id: dto.assigned_to_id || null,
      },
    });
  }

  async getActivities(organizationId: string) {
    return this.prisma.mobilizationActivity.findMany({
      where: { organization_id: organizationId },
      include: {
        assigned_to: true,
        municipality: true,
        zone: true,
        polling_station: true,
        polling_table: true,
      },
      orderBy: { start_date_time: 'asc' },
    });
  }

  async getActivityById(organizationId: string, id: string) {
    const act = await this.prisma.mobilizationActivity.findFirst({
      where: { id, organization_id: organizationId },
      include: {
        assigned_to: true,
        municipality: true,
        zone: true,
        polling_station: true,
        polling_table: true,
      },
    });
    if (!act) throw new NotFoundException('Actividad no encontrada');
    return act;
  }

  async updateActivity(organizationId: string, id: string, dto: UpdateMobilizationActivityDto) {
    const act = await this.prisma.mobilizationActivity.findFirst({ where: { id, organization_id: organizationId } });
    if (!act) throw new NotFoundException('Actividad no encontrada');

    return this.prisma.mobilizationActivity.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        type: dto.type,
        priority: dto.priority,
        status: dto.status,
        start_date_time: dto.start_date_time ? new Date(dto.start_date_time) : undefined,
        end_date_time: dto.end_date_time ? new Date(dto.end_date_time) : undefined,
        municipality_id: dto.municipality_id,
        zone_id: dto.zone_id,
        polling_station_id: dto.polling_station_id,
        polling_table_id: dto.polling_table_id,
        assigned_to_id: dto.assigned_to_id,
        completed_at: dto.status === 'COMPLETADA' ? new Date() : undefined,
      },
    });
  }

  async deleteActivity(organizationId: string, id: string) {
    const act = await this.prisma.mobilizationActivity.findFirst({ where: { id, organization_id: organizationId } });
    if (!act) throw new NotFoundException('Actividad no encontrada');

    return this.prisma.mobilizationActivity.delete({ where: { id } });
  }

  // ==========================================
  // INCIDENTS
  // ==========================================

  async createIncident(organizationId: string, dto: CreateIncidentDto) {
    if (dto.reported_by_id) {
      const reporter = await this.prisma.teamMember.findFirst({ where: { id: dto.reported_by_id, organization_id: organizationId } });
      if (!reporter) throw new BadRequestException('Reportero no válido para esta campaña');
    }

    return this.prisma.$transaction(async (tx) => {
      const incident = await tx.incident.create({
        data: {
          organization_id: organizationId,
          operation_id: dto.operation_id || null,
          title: dto.title,
          description: dto.description,
          type: dto.type || 'OTRA',
          severity: dto.severity || 'MEDIA',
          status: dto.status || 'ABIERTA',
          reported_by_id: dto.reported_by_id,
          municipality_id: dto.municipality_id || null,
          zone_id: dto.zone_id || null,
          polling_station_id: dto.polling_station_id || null,
          polling_table_id: dto.polling_table_id || null,
        },
      });

      await tx.incidentHistory.create({
        data: {
          incident_id: incident.id,
          action: 'Creada',
          description: `Incidencia reportada con severidad ${dto.severity || 'MEDIA'}`,
        },
      });

      return incident;
    });
  }

  async getIncidents(organizationId: string) {
    return this.prisma.incident.findMany({
      where: { organization_id: organizationId },
      include: {
        reported_by: true,
        assignments: { include: { member: true } },
        history: true,
        municipality: true,
        zone: true,
        polling_station: true,
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async getIncidentById(organizationId: string, id: string) {
    const inc = await this.prisma.incident.findFirst({
      where: { id, organization_id: organizationId },
      include: {
        reported_by: true,
        assignments: { include: { member: true } },
        history: true,
        municipality: true,
        zone: true,
        polling_station: true,
      },
    });
    if (!inc) throw new NotFoundException('Incidencia no encontrada');
    return inc;
  }

  async updateIncident(organizationId: string, id: string, dto: UpdateIncidentDto) {
    const inc = await this.prisma.incident.findFirst({ where: { id, organization_id: organizationId } });
    if (!inc) throw new NotFoundException('Incidencia no encontrada');

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.incident.update({
        where: { id },
        data: {
          title: dto.title,
          description: dto.description,
          type: dto.type,
          severity: dto.severity,
          status: dto.status,
          resolved_at: dto.status === 'RESUELTA' ? new Date() : undefined,
        },
      });

      await tx.incidentHistory.create({
        data: {
          incident_id: id,
          action: 'Actualizada',
          description: `Estado cambiado a ${dto.status || inc.status} y severidad a ${dto.severity || inc.severity}`,
        },
      });

      return updated;
    });
  }

  async assignIncident(organizationId: string, incidentId: string, memberId: string) {
    const inc = await this.prisma.incident.findFirst({ where: { id: incidentId, organization_id: organizationId } });
    const member = await this.prisma.teamMember.findFirst({ where: { id: memberId, organization_id: organizationId } });
    if (!inc || !member) throw new NotFoundException('Incidencia o Colaborador no encontrado');

    return this.prisma.$transaction(async (tx) => {
      const assignment = await tx.incidentAssignment.create({
        data: {
          incident_id: incidentId,
          member_id: memberId,
        },
      });

      await tx.incidentHistory.create({
        data: {
          incident_id: incidentId,
          action: 'Asignada',
          description: `Incidencia asignada a ${member.first_name} ${member.last_name}`,
        },
      });

      return assignment;
    });
  }

  // ==========================================
  // OPERATIONAL RESOURCES
  // ==========================================

  async createResource(organizationId: string, dto: CreateResourceDto) {
    return this.prisma.operationalResource.create({
      data: {
        organization_id: organizationId,
        name: dto.name,
        type: dto.type || 'GENERICO',
        quantity: dto.quantity || 1,
        status: dto.status || 'DISPONIBLE',
        notes: dto.notes,
        municipality_id: dto.municipality_id || null,
        zone_id: dto.zone_id || null,
        polling_station_id: dto.polling_station_id || null,
        polling_table_id: dto.polling_table_id || null,
      },
    });
  }

  async getResources(organizationId: string) {
    return this.prisma.operationalResource.findMany({
      where: { organization_id: organizationId },
      include: {
        assignments: { include: { member: true } },
        municipality: true,
        zone: true,
        polling_station: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  async assignResource(organizationId: string, resourceId: string, memberId: string, quantity: number) {
    const res = await this.prisma.operationalResource.findFirst({ where: { id: resourceId, organization_id: organizationId } });
    const member = await this.prisma.teamMember.findFirst({ where: { id: memberId, organization_id: organizationId } });
    if (!res || !member) throw new NotFoundException('Recurso o Colaborador no encontrado');

    if (res.quantity < quantity) throw new BadRequestException('Cantidad insuficiente en stock');

    return this.prisma.$transaction(async (tx) => {
      // Create assignment
      const assignment = await tx.resourceAssignment.create({
        data: {
          resource_id: resourceId,
          member_id: memberId,
          quantity,
        },
      });

      // Update resource status and quantity
      await tx.operationalResource.update({
        where: { id: resourceId },
        data: {
          status: 'ASIGNADO',
          quantity: res.quantity - quantity,
        },
      });

      return assignment;
    });
  }

  async releaseResource(organizationId: string, assignmentId: string) {
    const assign = await this.prisma.resourceAssignment.findFirst({
      where: { id: assignmentId, resource: { organization_id: organizationId } },
      include: { resource: true },
    });
    if (!assign) throw new NotFoundException('Asignación de recurso no encontrada');

    return this.prisma.$transaction(async (tx) => {
      // Re-add quantity
      await tx.operationalResource.update({
        where: { id: assign.resource_id },
        data: {
          quantity: assign.resource.quantity + assign.quantity,
          status: 'DISPONIBLE',
        },
      });

      // Delete assignment
      return tx.resourceAssignment.delete({ where: { id: assignmentId } });
    });
  }

  // ==========================================
  // OPERATIONAL POINTS
  // ==========================================

  async createPoint(organizationId: string, dto: CreateOperationalPointDto) {
    return this.prisma.operationalPoint.create({
      data: {
        organization_id: organizationId,
        name: dto.name,
        type: dto.type || 'OTRO',
        address: dto.address,
        latitude: dto.latitude || null,
        longitude: dto.longitude || null,
        responsible_id: dto.responsible_id || null,
        status: dto.status || 'ACTIVO',
        municipality_id: dto.municipality_id || null,
        zone_id: dto.zone_id || null,
        polling_station_id: dto.polling_station_id || null,
        polling_table_id: dto.polling_table_id || null,
      },
    });
  }

  async getPoints(organizationId: string) {
    return this.prisma.operationalPoint.findMany({
      where: { organization_id: organizationId },
      include: {
        responsible: true,
        municipality: true,
        zone: true,
        polling_station: true,
      },
    });
  }

  // ==========================================
  // DASHBOARD
  // ==========================================

  async getDashboard(organizationId: string) {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

    const [ops, activities, incidents, points, members, resources] = await Promise.all([
      this.prisma.operation.findMany({ where: { organization_id: organizationId } }),
      this.prisma.mobilizationActivity.findMany({ where: { organization_id: organizationId } }),
      this.prisma.incident.findMany({ where: { organization_id: organizationId } }),
      this.prisma.operationalPoint.findMany({ where: { organization_id: organizationId } }),
      this.prisma.teamMember.findMany({ where: { organization_id: organizationId } }),
      this.prisma.operationalResource.findMany({ where: { organization_id: organizationId } }),
    ]);

    const activeOps = ops.filter((o) => o.status === 'ACTIVA').length;
    const todayActs = activities.filter(
      (a) => new Date(a.start_date_time) >= todayStart && new Date(a.start_date_time) <= todayEnd
    ).length;

    let completed = 0;
    let pending = 0;
    let inProgress = 0;
    let overdue = 0;

    activities.forEach((act) => {
      if (act.status === 'COMPLETADA') {
        completed++;
      } else {
        if (new Date(act.end_date_time) < now) {
          overdue++;
        }
        if (act.status === 'PENDIENTE') {
          pending++;
        } else if (act.status === 'EN_PROGRESO') {
          inProgress++;
        }
      }
    });

    const openIncidents = incidents.filter(
      (i) => i.status === 'ABIERTA' || i.status === 'EN_PROCESO' || i.status === 'EN_REVISION'
    );
    const criticalIncidentsCount = openIncidents.filter((i) => i.severity === 'CRITICA').length;

    // Calculate Alert Level
    let alertLevel = 'NORMAL'; // NORMAL, ATENCION, CRITICO
    if (criticalIncidentsCount > 0 || overdue > 5) {
      alertLevel = 'CRITICO';
    } else if (openIncidents.length > 0 || overdue > 0) {
      alertLevel = 'ATENCION';
    }

    // Cobertura operativa: territorios con operacion vs planificados.
    // Para simplificar, calculamos: (Puestos con al menos 1 actividad / Total Puestos con actividades planificadas) * 100
    const stationsWithActivities = new Set(
      activities.map((a) => a.polling_station_id).filter(Boolean)
    );
    const totalPlannedStations = stationsWithActivities.size;
    const completedStations = new Set(
      activities.filter(a => a.status === 'COMPLETADA').map(a => a.polling_station_id).filter(Boolean)
    ).size;

    const coverage = totalPlannedStations === 0 ? 0 : Math.round((completedStations / totalPlannedStations) * 100);

    return {
      operations_active: activeOps,
      activities_today: todayActs,
      activities_pending: pending,
      activities_in_progress: inProgress,
      activities_completed: completed,
      activities_overdue: overdue,
      incidents_open: openIncidents.length,
      critical_incidents: criticalIncidentsCount,
      operational_points: points.length,
      active_members: members.filter(m => m.status === 'ACTIVE').length,
      alert_level: alertLevel,
      coverage_percentage: coverage,
    };
  }
}
