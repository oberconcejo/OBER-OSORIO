import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class ElectorsService {
  constructor(private prisma: PrismaService) {}

  maskDocument(doc: string): string {
    if (!doc || doc.length < 5) return doc;
    const visibleStart = doc.substring(0, 2);
    const visibleEnd = doc.substring(doc.length - 3);
    return `${visibleStart}.${'*'.repeat(doc.length - 5)}.${visibleEnd}`;
  }

  async findAll(orgId: string, skip: number, take: number, search?: string, territoryScope?: any) {
    const whereClause: any = { organization_id: orgId };
    
    // Filtro de alcance territorial del usuario
    if (territoryScope?.municipalityId) {
      whereClause.municipality_id = territoryScope.municipalityId;
    }

    if (search) {
      whereClause.OR = [
        { document_number: { contains: search } },
        { first_name: { contains: search, mode: 'insensitive' } },
        { last_name: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.elector.findMany({ where: whereClause, skip, take, orderBy: { created_at: 'desc' } }),
      this.prisma.elector.count({ where: whereClause })
    ]);
    return { data, total };
  }

  async findOne(id: string, orgId: string) {
    const elector = await this.prisma.elector.findFirst({
      where: { id, organization_id: orgId },
      include: {
        organization: false, // Nunca devolver el root object completo
        // Incluiríamos las relaciones de territorio si existieran aquí
      }
    });

    if (!elector) throw new NotFoundException('Elector no encontrado.');
    return elector;
  }

  async create(orgId: string, data: any, userId: string) {
    // Regla 14: Integridad Territorial
    if (data.polling_station_id) {
      const station = await this.prisma.pollingStation.findUnique({ where: { id: data.polling_station_id }, include: { zone: true } });
      if (!station || station.zone.municipality_id !== data.municipality_id) {
        throw new BadRequestException('El puesto de votación no pertenece al municipio seleccionado.');
      }
    }

    // Regla 6: Evitar duplicados (org + type + document)
    const existing = await this.prisma.elector.findFirst({
      where: { organization_id: orgId, document_type: data.document_type, document_number: data.document_number }
    });
    if (existing) throw new BadRequestException('El documento ya se encuentra registrado en esta organización.');

    const newElector = await this.prisma.elector.create({
      data: { ...data, organization_id: orgId }
    });

    // Auditoría
    await this.prisma.auditLog.create({
      data: {
        organization_id: orgId, user_id: userId, action: 'ELECTOR_CREATED',
        module: 'ELECTORS', entity_name: 'Elector', entity_id: newElector.id
      }
    });

    return newElector;
  }

  async importBatch(orgId: string, records: any[], userId: string) {
    // Procesamiento en lotes (chunks) para no bloquear el Event Loop (Regla 21)
    const results = { valid: 0, duplicates: 0, errors: [] };
    // Lógica conceptual de chunking
    return results;
  }
}
