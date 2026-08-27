import { Injectable, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePlanDto, UpdatePlanDto } from './dto/create-plan.dto';
import { CreateObjectiveDto, UpdateObjectiveDto } from './dto/create-objective.dto';
import { CreateActivityDto, UpdateActivityDto } from './dto/create-activity.dto';

@Injectable()
export class PlanningService {
  constructor(private prisma: PrismaService) {}

  // ==========================================
  // PLANS
  // ==========================================

  async createPlan(organizationId: string, dto: CreatePlanDto) {
    return this.prisma.plan.create({
      data: {
        organization_id: organizationId,
        name: dto.name,
        description: dto.description,
        start_date: new Date(dto.start_date),
        end_date: dto.end_date ? new Date(dto.end_date) : null,
        status: dto.status || 'DRAFT',
        priority: dto.priority || 'MEDIA',
        municipality_id: dto.municipality_id || null,
        zone_id: dto.zone_id || null,
        polling_station_id: dto.polling_station_id || null,
      },
    });
  }

  async getPlans(organizationId: string) {
    return this.prisma.plan.findMany({
      where: { organization_id: organizationId },
      include: {
        objectives: true,
        activities: {
          include: {
            assignees: { include: { member: true } },
          },
        },
        municipality: true,
        zone: true,
        polling_station: true,
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async getPlanById(organizationId: string, id: string) {
    const plan = await this.prisma.plan.findFirst({
      where: { id, organization_id: organizationId },
      include: {
        objectives: {
          include: {
            activities: {
              include: {
                assignees: { include: { member: true } },
                checklist: true,
                comments: { include: { user: true } },
                evidence: true,
              },
            },
            assignee: true,
          },
        },
        activities: {
          where: { objective_id: null }, // Actividades huérfanas de objetivo directo
          include: {
            assignees: { include: { member: true } },
            checklist: true,
            comments: { include: { user: true } },
            evidence: true,
          },
        },
        municipality: true,
        zone: true,
        polling_station: true,
      },
    });

    if (!plan) throw new NotFoundException('Plan no encontrado');
    return plan;
  }

  async updatePlan(organizationId: string, id: string, dto: UpdatePlanDto) {
    const plan = await this.prisma.plan.findFirst({
      where: { id, organization_id: organizationId },
    });
    if (!plan) throw new NotFoundException('Plan no encontrado o no pertenece a la organización');

    return this.prisma.plan.update({
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

  async deletePlan(organizationId: string, id: string) {
    const plan = await this.prisma.plan.findFirst({
      where: { id, organization_id: organizationId },
    });
    if (!plan) throw new NotFoundException('Plan no encontrado');

    return this.prisma.plan.delete({ where: { id } });
  }

  // ==========================================
  // OBJECTIVES
  // ==========================================

  async createObjective(organizationId: string, planId: string, dto: CreateObjectiveDto) {
    const plan = await this.prisma.plan.findFirst({
      where: { id: planId, organization_id: organizationId },
    });
    if (!plan) throw new NotFoundException('Plan no encontrado');

    return this.prisma.objective.create({
      data: {
        plan_id: planId,
        name: dto.name,
        description: dto.description,
        status: dto.status || 'PENDING',
        priority: dto.priority || 'MEDIUM',
        due_date: dto.due_date ? new Date(dto.due_date) : null,
        assignee_id: dto.assignee_id || null,
      },
    });
  }

  async updateObjective(organizationId: string, id: string, dto: UpdateObjectiveDto) {
    const objective = await this.prisma.objective.findFirst({
      where: { id, plan: { organization_id: organizationId } },
    });
    if (!objective) throw new NotFoundException('Objetivo no encontrado');

    return this.prisma.objective.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        status: dto.status,
        priority: dto.priority,
        due_date: dto.due_date ? new Date(dto.due_date) : undefined,
        assignee_id: dto.assignee_id,
      },
    });
  }

  async deleteObjective(organizationId: string, id: string) {
    const objective = await this.prisma.objective.findFirst({
      where: { id, plan: { organization_id: organizationId } },
    });
    if (!objective) throw new NotFoundException('Objetivo no encontrado');

    return this.prisma.objective.delete({ where: { id } });
  }

  // ==========================================
  // ACTIVITIES
  // ==========================================

  async createActivity(organizationId: string, dto: CreateActivityDto) {
    const plan = await this.prisma.plan.findFirst({
      where: { id: dto.plan_id, organization_id: organizationId },
    });
    if (!plan) throw new NotFoundException('Plan no encontrado');

    if (new Date(dto.start_date) > new Date(dto.due_date)) {
      throw new BadRequestException('La fecha inicial no puede ser mayor que la fecha límite');
    }

    return this.prisma.$transaction(async (tx) => {
      const activity = await tx.activity.create({
        data: {
          organization_id: organizationId,
          plan_id: dto.plan_id,
          objective_id: dto.objective_id || null,
          name: dto.name,
          description: dto.description,
          type: dto.type || 'OTRA',
          priority: dto.priority || 'MEDIA',
          status: dto.status || 'PENDIENTE',
          start_date: new Date(dto.start_date),
          due_date: new Date(dto.due_date),
          municipality_id: dto.municipality_id || null,
          zone_id: dto.zone_id || null,
          polling_station_id: dto.polling_station_id || null,
          polling_table_id: dto.polling_table_id || null,
        },
      });

      if (dto.assignee_ids && dto.assignee_ids.length > 0) {
        await tx.activityAssignee.createMany({
          data: dto.assignee_ids.map((memberId) => ({
            activity_id: activity.id,
            member_id: memberId,
          })),
        });
      }

      if (dto.dependency_ids && dto.dependency_ids.length > 0) {
        await tx.activityDependency.createMany({
          data: dto.dependency_ids.map((dependsOnId) => ({
            activity_id: activity.id,
            depends_on_id: dependsOnId,
          })),
        });
      }

      return activity;
    });
  }

  async getActivities(organizationId: string) {
    return this.prisma.activity.findMany({
      where: { organization_id: organizationId },
      include: {
        assignees: { include: { member: true } },
        checklist: true,
        dependencies: { include: { depends_on: true } },
        municipality: true,
        zone: true,
        polling_station: true,
        polling_table: true,
      },
      orderBy: { due_date: 'asc' },
    });
  }

  async getActivityById(organizationId: string, id: string) {
    const activity = await this.prisma.activity.findFirst({
      where: { id, organization_id: organizationId },
      include: {
        assignees: { include: { member: true } },
        checklist: true,
        dependencies: { include: { depends_on: true } },
        comments: { include: { user: true } },
        evidence: true,
        municipality: true,
        zone: true,
        polling_station: true,
        polling_table: true,
      },
    });
    if (!activity) throw new NotFoundException('Actividad no encontrada');
    return activity;
  }

  async updateActivity(organizationId: string, id: string, dto: UpdateActivityDto) {
    const activity = await this.prisma.activity.findFirst({
      where: { id, organization_id: organizationId },
    });
    if (!activity) throw new NotFoundException('Actividad no encontrada');

    if (dto.start_date && dto.due_date) {
      if (new Date(dto.start_date) > new Date(dto.due_date)) {
        throw new BadRequestException('La fecha inicial no puede ser mayor que la fecha límite');
      }
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.activity.update({
        where: { id },
        data: {
          name: dto.name,
          description: dto.description,
          type: dto.type,
          priority: dto.priority,
          status: dto.status,
          start_date: dto.start_date ? new Date(dto.start_date) : undefined,
          due_date: dto.due_date ? new Date(dto.due_date) : undefined,
          municipality_id: dto.municipality_id,
          zone_id: dto.zone_id,
          polling_station_id: dto.polling_station_id,
          polling_table_id: dto.polling_table_id,
        },
      });

      if (dto.assignee_ids) {
        await tx.activityAssignee.deleteMany({ where: { activity_id: id } });
        if (dto.assignee_ids.length > 0) {
          await tx.activityAssignee.createMany({
            data: dto.assignee_ids.map((memberId) => ({
              activity_id: id,
              member_id: memberId,
            })),
          });
        }
      }

      if (dto.dependency_ids) {
        await tx.activityDependency.deleteMany({ where: { activity_id: id } });
        if (dto.dependency_ids.length > 0) {
          await tx.activityDependency.createMany({
            data: dto.dependency_ids.map((dependsOnId) => ({
              activity_id: id,
              depends_on_id: dependsOnId,
            })),
          });
        }
      }

      return updated;
    });
  }

  async deleteActivity(organizationId: string, id: string) {
    const activity = await this.prisma.activity.findFirst({
      where: { id, organization_id: organizationId },
    });
    if (!activity) throw new NotFoundException('Actividad no encontrada');

    return this.prisma.activity.delete({ where: { id } });
  }

  // ==========================================
  // TRANSITIONS AND DEPENDENCY CHECK
  // ==========================================

  async updateActivityStatus(organizationId: string, id: string, status: string) {
    const activity = await this.prisma.activity.findFirst({
      where: { id, organization_id: organizationId },
      include: {
        dependencies: {
          include: {
            depends_on: true,
          },
        },
      },
    });

    if (!activity) throw new NotFoundException('Actividad no encontrada');

    // Business rule: If we want to transition to COMPLETADA, check all dependencies
    if (status === 'COMPLETADA') {
      const pendingDeps = activity.dependencies.filter(
        (dep) => dep.depends_on.status !== 'COMPLETADA'
      );
      if (pendingDeps.length > 0) {
        const names = pendingDeps.map((d) => d.depends_on.name).join(', ');
        throw new BadRequestException(
          `No se puede completar esta actividad. Depende de las siguientes actividades pendientes: ${names}`
        );
      }
    }

    return this.prisma.activity.update({
      where: { id },
      data: {
        status,
        completed_at: status === 'COMPLETADA' ? new Date() : null,
      },
    });
  }

  // ==========================================
  // CALENDAR
  // ==========================================

  async getCalendar(organizationId: string) {
    return this.prisma.activity.findMany({
      where: { organization_id: organizationId },
      select: {
        id: true,
        name: true,
        start_date: true,
        due_date: true,
        status: true,
        priority: true,
      },
    });
  }

  // ==========================================
  // CHECKLIST
  // ==========================================

  async addChecklistItem(organizationId: string, activityId: string, title: string) {
    const activity = await this.prisma.activity.findFirst({
      where: { id: activityId, organization_id: organizationId },
    });
    if (!activity) throw new NotFoundException('Actividad no encontrada');

    return this.prisma.activityChecklist.create({
      data: {
        activity_id: activityId,
        title,
        is_completed: false,
      },
    });
  }

  async toggleChecklistItem(organizationId: string, itemId: string, isCompleted: boolean) {
    const item = await this.prisma.activityChecklist.findFirst({
      where: { id: itemId, activity: { organization_id: organizationId } },
    });
    if (!item) throw new NotFoundException('Item de checklist no encontrado');

    return this.prisma.activityChecklist.update({
      where: { id: itemId },
      data: { is_completed: isCompleted },
    });
  }

  // ==========================================
  // COMMENTS
  // ==========================================

  async addComment(organizationId: string, userId: string, activityId: string, content: string) {
    const activity = await this.prisma.activity.findFirst({
      where: { id: activityId, organization_id: organizationId },
    });
    if (!activity) throw new NotFoundException('Actividad no encontrada');

    return this.prisma.activityComment.create({
      data: {
        activity_id: activityId,
        user_id: userId,
        content,
      },
      include: { user: true },
    });
  }

  // ==========================================
  // EVIDENCE
  // ==========================================

  async addEvidence(organizationId: string, activityId: string, fileName: string, fileUrl: string) {
    const activity = await this.prisma.activity.findFirst({
      where: { id: activityId, organization_id: organizationId },
    });
    if (!activity) throw new NotFoundException('Actividad no encontrada');

    return this.prisma.activityEvidence.create({
      data: {
        activity_id: activityId,
        file_name: fileName,
        file_url: fileUrl,
      },
    });
  }

  // ==========================================
  // DASHBOARD & SUMMARY KPIs
  // ==========================================

  async getDashboard(organizationId: string) {
    const now = new Date();

    const [plans, activities, members] = await Promise.all([
      this.prisma.plan.findMany({ where: { organization_id: organizationId } }),
      this.prisma.activity.findMany({ where: { organization_id: organizationId } }),
      this.prisma.teamMember.findMany({ where: { organization_id: organizationId } }),
    ]);

    const plansActive = plans.filter((p) => p.status === 'ACTIVE').length;
    
    let pending = 0;
    let inProgress = 0;
    let completed = 0;
    let overdue = 0;

    activities.forEach((act) => {
      if (act.status === 'COMPLETADA') {
        completed++;
      } else {
        if (new Date(act.due_date) < now) {
          overdue++;
        }
        if (act.status === 'PENDIENTE') {
          pending++;
        } else if (act.status === 'EN_PROGRESO') {
          inProgress++;
        }
      }
    });

    const activeMembersCount = members.filter(m => m.status === 'ACTIVE').length;

    // Plans with assigned territories
    const territoriesWithPlans = plans.filter(
      p => p.municipality_id || p.zone_id || p.polling_station_id
    ).length;

    return {
      plans_active: plansActive,
      activities_pending: pending,
      activities_in_progress: inProgress,
      activities_completed: completed,
      activities_overdue: overdue,
      active_members: activeMembersCount,
      territories_with_plans: territoriesWithPlans,
      percentage_completed: activities.length === 0 ? 0 : Math.round((completed / activities.length) * 100),
    };
  }
}
