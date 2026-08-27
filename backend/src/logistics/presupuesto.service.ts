import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface CreateTransaccionDto {
  descripcion: string;
  categoria: string;
  tipo: string; // INGRESO, EGRESO
  monto: number;
  fecha: string;
  estado?: string;
}

@Injectable()
export class PresupuestoService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(organizationId: string) {
    return this.prisma.transaccionFinanciera.findMany({
      where: { organization_id: organizationId },
      orderBy: { created_at: 'desc' },
    });
  }

  async create(organizationId: string, dto: CreateTransaccionDto) {
    return this.prisma.transaccionFinanciera.create({
      data: {
        organization_id: organizationId,
        descripcion: dto.descripcion,
        categoria: dto.categoria,
        tipo: dto.tipo,
        monto: parseFloat(dto.monto as any),
        fecha: dto.fecha,
        estado: dto.estado || 'Completado',
      },
    });
  }

  async delete(organizationId: string, id: string) {
    const tx = await this.prisma.transaccionFinanciera.findFirst({
      where: { id, organization_id: organizationId },
    });

    if (!tx) {
      throw new NotFoundException('Transacción no encontrada.');
    }

    return this.prisma.transaccionFinanciera.delete({
      where: { id },
    });
  }
}
