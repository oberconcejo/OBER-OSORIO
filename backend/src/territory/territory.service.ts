import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class TerritoryService {
  constructor(private prisma: PrismaService) {}

  // ==========================================
  // CONSULTA JERÁRQUICA CON PROTECCIÓN IDOR
  // ==========================================
  async getMunicipalities(orgId: string, departmentId?: string) {
    return this.prisma.municipality.findMany({
      where: {
        department: {
          organization_id: orgId, // Aislamiento Multi-tenant
          ...(departmentId && { id: departmentId })
        }
      },
      include: {
        _count: { select: { zones: true } } // Estadísticas embebidas sin duplicar columnas
      }
    });
  }

  // ==========================================
  // IMPORTACIÓN DE PUESTOS (LÓGICA MASIVA)
  // ==========================================
  async importPollingStations(orgId: string, data: any[]) {
    const results = { valid: 0, duplicates: 0, errors: [] };

    // Procesamiento en lote para no saturar memoria
    for (const row of data) {
      try {
        // Validación estricta de Coordenadas (Regla 12)
        if (row.latitude && (row.latitude < -90 || row.latitude > 90)) {
          results.errors.push(`Fila ${row.index}: Latitud inválida.`);
          continue;
        }

        // Verifica integridad referencial
        const zone = await this.prisma.zone.findFirst({
          where: { id: row.zone_id, municipality: { department: { organization_id: orgId } } }
        });

        if (!zone) {
          results.errors.push(`Fila ${row.index}: Zona inexistente o no autorizada.`);
          continue;
        }

        // Upsert protegido
        await this.prisma.pollingStation.upsert({
          where: { zone_id_name: { zone_id: zone.id, name: row.name } },
          update: { latitude: row.latitude, longitude: row.longitude },
          create: {
            zone_id: zone.id,
            name: row.name,
            code: row.code,
            latitude: row.latitude,
            longitude: row.longitude,
          }
        });
        results.valid++;
      } catch (e) {
        if (e.code === 'P2002') results.duplicates++;
        else results.errors.push(`Fila ${row.index}: Error interno.`);
      }
    }
    return results;
  }
}
