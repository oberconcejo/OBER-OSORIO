import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class TeamService {
  constructor(private prisma: PrismaService) {}

  // ==========================================
  // CREACIÓN Y VALIDACIÓN (REGLA 9)
  // ==========================================
  async createMember(orgId: string, data: any, authorId: string) {
    const existing = await this.prisma.teamMember.findFirst({
      where: { organization_id: orgId, document_type: data.document_type, document_number: data.document_number }
    });

    if (existing) {
      throw new BadRequestException('El miembro del equipo ya existe en esta organización.');
    }

    const member = await this.prisma.teamMember.create({
      data: { ...data, organization_id: orgId }
    });

    await this.logAudit(orgId, authorId, 'TEAM_MEMBER_CREATED', 'TeamMember', member.id, data);
    return member;
  }

  // ==========================================
  // ASIGNACIÓN MÚLTIPLE Y CONFLICTOS (REGLAS 14, 25, 40)
  // ==========================================
  async assignTerritory(orgId: string, memberId: string, data: any, authorId: string) {
    // 1. Verificamos que el miembro existe y pertenece al tenant
    const member = await this.prisma.teamMember.findFirst({ where: { id: memberId, organization_id: orgId }});
    if (!member) throw new NotFoundException('Miembro no encontrado o no autorizado.');

    // 2. Regla de Negocio: Evitar múltiples responsables en la misma mesa (Ejemplo)
    if (data.polling_table_id) {
      const activeTableManager = await this.prisma.teamAssignment.findFirst({
        where: { polling_table_id: data.polling_table_id, status: 'ACTIVE' }
      });
      if (activeTableManager) {
        throw new BadRequestException('CONFLICTO DE ASIGNACIÓN: Esta mesa ya tiene un responsable activo.');
      }
    }

    // 3. Finalizar asignaciones previas si se solicitó (Regla 28: Historial)
    if (data.finalize_previous) {
      await this.prisma.teamAssignment.updateMany({
        where: { member_id: memberId, status: 'ACTIVE' },
        data: { status: 'FINALIZED', end_date: new Date() }
      });
    }

    // 4. Crear nueva asignación
    const assignment = await this.prisma.teamAssignment.create({
      data: {
        member_id: memberId,
        position_id: data.position_id,
        municipality_id: data.municipality_id,
        zone_id: data.zone_id,
        polling_station_id: data.polling_station_id,
        polling_table_id: data.polling_table_id,
        start_date: new Date(data.start_date),
        end_date: data.end_date ? new Date(data.end_date) : null,
      }
    });

    await this.logAudit(orgId, authorId, 'TEAM_MEMBER_ASSIGNED', 'TeamAssignment', assignment.id, data);
    return assignment;
  }

  // ==========================================
  // ENLACE A USUARIO (REGLA 10 y 11)
  // ==========================================
  async linkUser(orgId: string, memberId: string, userId: string, authorId: string) {
    const member = await this.prisma.teamMember.update({
      where: { id: memberId },
      data: { user_id: userId } // Relación 1:1 controlada
    });
    
    // Aquí iría el disparador de email / invitación
    await this.logAudit(orgId, authorId, 'TEAM_MEMBER_USER_LINKED', 'TeamMember', memberId, { userId });
    return member;
  }

  private async logAudit(orgId: string, userId: string, action: string, entity: string, entityId: string, values: any) {
    await this.prisma.auditLog.create({
      data: { organization_id: orgId, user_id: userId, action, entity_name: entity, entity_id: entityId, new_values: values }
    });
  }
}
