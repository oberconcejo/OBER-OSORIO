import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePositionDto, CreateMemberDto } from './dto/create-team.dto';

@Injectable()
export class TeamService {
  constructor(private prisma: PrismaService) {}

  async getPositions(organizationId: string) {
    return this.prisma.teamPosition.findMany({
      where: { organization_id: organizationId },
      orderBy: { name: 'asc' }
    });
  }

  async createPosition(organizationId: string, dto: CreatePositionDto) {
    return this.prisma.teamPosition.create({
      data: {
        organization_id: organizationId,
        name: dto.name
      }
    });
  }

  async getMembers(organizationId: string) {
    return this.prisma.teamMember.findMany({
      where: { organization_id: organizationId },
      orderBy: { first_name: 'asc' },
      include: {
        assignments: {
          include: {
            position: true,
            polling_station: true,
            polling_table: true
          }
        }
      }
    });
  }

  async createMember(organizationId: string, dto: CreateMemberDto) {
    // Check if member already exists by document
    const existing = await this.prisma.teamMember.findFirst({
      where: {
        organization_id: organizationId,
        document_type: dto.document_type,
        document_number: dto.document_number,
      }
    });

    if (existing) {
      throw new ConflictException('El colaborador ya se encuentra registrado con ese documento en esta organizacin.');
    }

    return this.prisma.teamMember.create({
      data: {
        organization_id: organizationId,
        document_type: dto.document_type,
        document_number: dto.document_number,
        first_name: dto.first_name,
        last_name: dto.last_name,
        phone: dto.phone,
      }
    });
  }

  async getAssignments(organizationId: string) {
    return this.prisma.teamAssignment.findMany({
      where: {
        member: {
          organization_id: organizationId
        }
      },
      include: {
        member: true,
        position: true,
        municipality: true,
        zone: true,
        polling_station: true,
        polling_table: true
      },
      orderBy: { created_at: 'desc' }
    });
  }

  async assignTerritory(organizationId: string, dto: import('./dto/assign-team.dto').AssignTeamDto) {
    const member = await this.prisma.teamMember.findFirst({
      where: { id: dto.member_id, organization_id: organizationId }
    });

    if (!member) throw new ConflictException('Colaborador inválido o no autorizado.');

    return this.prisma.teamAssignment.create({
      data: {
        member_id: dto.member_id,
        position_id: dto.position_id,
        municipality_id: dto.municipality_id,
        zone_id: dto.zone_id,
        polling_station_id: dto.polling_station_id,
        polling_table_id: dto.polling_table_id,
        start_date: new Date()
      }
    });
  }
}
