import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateElectorDto } from './dto/create-elector.dto';

@Injectable()
export class ElectorsService {
  constructor(private prisma: PrismaService) {}

  async create(organizationId: string, createElectorDto: CreateElectorDto) {
    // Verificar si el elector ya existe en esa organizacin
    const existing = await this.prisma.elector.findUnique({
      where: {
        organization_id_document_type_document_number: {
          organization_id: organizationId,
          document_type: createElectorDto.document_type,
          document_number: createElectorDto.document_number,
        }
      }
    });

    if (existing) {
      throw new ConflictException('El elector ya se encuentra registrado en el sistema');
    }

    return this.prisma.elector.create({
      data: {
        organization_id: organizationId,
        document_type: createElectorDto.document_type,
        document_number: createElectorDto.document_number,
        first_name: createElectorDto.first_name,
        last_name: createElectorDto.last_name,
      }
    });
  }

  async findAll(organizationId: string, search?: string) {
    const whereClause: any = { organization_id: organizationId };

    if (search) {
      whereClause.OR = [
        { document_number: { contains: search } },
        { first_name: { contains: search } },
        { last_name: { contains: search } },
      ];
    }

    return this.prisma.elector.findMany({
      where: whereClause,
      orderBy: { created_at: 'desc' }
    });
  }
}
