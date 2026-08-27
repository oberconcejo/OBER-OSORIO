import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface CreateEncuestaDto {
  nombre: string;
  comuna: string;
  intencionVoto: string;
  preocupacion: string;
  calificacionGobierno: string;
  dispuestoAVotar: string;
  edad: string;
  sexo: string;
  participacionJornada: string;
}

@Injectable()
export class EncuestasService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(organizationId: string) {
    return this.prisma.encuesta.findMany({
      where: { organization_id: organizationId },
      orderBy: { fecha: 'desc' },
    });
  }

  async create(organizationId: string, dto: CreateEncuestaDto) {
    return this.prisma.encuesta.create({
      data: {
        organization_id: organizationId,
        nombre: dto.nombre || 'Anónimo',
        comuna: dto.comuna,
        intencionVoto: dto.intencionVoto,
        preocupacion: dto.preocupacion,
        calificacionGobierno: dto.calificacionGobierno,
        dispuestoAVotar: dto.dispuestoAVotar,
        edad: dto.edad,
        sexo: dto.sexo,
        participacionJornada: dto.participacionJornada,
      },
    });
  }

  async delete(organizationId: string, id: string) {
    const encuesta = await this.prisma.encuesta.findFirst({
      where: { id, organization_id: organizationId },
    });

    if (!encuesta) {
      throw new NotFoundException('Encuesta no encontrada.');
    }

    return this.prisma.encuesta.delete({
      where: { id },
    });
  }
}
