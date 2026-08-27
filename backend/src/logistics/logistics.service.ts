import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStationDto, CreateTableDto } from './dto/create-station.dto';

@Injectable()
export class LogisticsService {
  constructor(private prisma: PrismaService) {}

  async getZones(organizationId: string) {
    // Para simplificar, buscamos todas las zonas que pertenezcan a municipios de la organizacin.
    return this.prisma.zone.findMany({
      where: {
        municipality: {
          department: {
            organization_id: organizationId
          }
        }
      },
      include: {
        municipality: true
      }
    });
  }

  async getStations(organizationId: string) {
    return this.prisma.pollingStation.findMany({
      where: {
        zone: {
          municipality: {
            department: {
              organization_id: organizationId
            }
          }
        }
      },
      include: {
        zone: {
          include: {
            municipality: true
          }
        },
        polling_tables: true
      }
    });
  }

  async createStation(organizationId: string, dto: CreateStationDto) {
    // Validar zona
    const zone = await this.prisma.zone.findUnique({
      where: { id: dto.zone_id },
      include: { municipality: { include: { department: true } } }
    });
    
    if (!zone || zone.municipality.department.organization_id !== organizationId) {
      throw new NotFoundException('Zona no encontrada o no pertenece a tu organizacin');
    }

    return this.prisma.pollingStation.create({
      data: {
        name: dto.name,
        zone_id: dto.zone_id
      },
      include: {
        polling_tables: true
      }
    });
  }

  async createTable(organizationId: string, dto: CreateTableDto) {
    const station = await this.prisma.pollingStation.findUnique({
      where: { id: dto.polling_station_id },
      include: { zone: { include: { municipality: { include: { department: true } } } } }
    });

    if (!station || station.zone.municipality.department.organization_id !== organizationId) {
      throw new NotFoundException('Puesto de votacin no encontrado o no pertenece a tu organizacin');
    }

    return this.prisma.pollingTable.create({
      data: {
        polling_station_id: dto.polling_station_id,
        table_number: dto.table_number
      }
    });
  }
}
