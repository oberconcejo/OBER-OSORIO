import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TerritorialService {
  constructor(private prisma: PrismaService) {}

  async getTree(organizationId: string) {
    // Retorna el árbol completo de territorios, con asignaciones
    return this.prisma.department.findMany({
      where: { organization_id: organizationId },
      include: {
        municipalities: {
          include: {
            team_assignments: { include: { member: true, position: true } },
            zones: {
              include: {
                team_assignments: { include: { member: true, position: true } },
                polling_stations: {
                  include: {
                    team_assignments: { include: { member: true, position: true } },
                    polling_tables: {
                      include: {
                        team_assignments: { include: { member: true, position: true } }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
  }

  async getCoverage(organizationId: string) {
    const tables = await this.prisma.pollingTable.findMany({
      where: {
        polling_station: {
          zone: {
            municipality: {
              department: {
                organization_id: organizationId
              }
            }
          }
        }
      },
      include: {
        team_assignments: true
      }
    });

    const totalTables = tables.length;
    let coveredTables = 0;

    for (const table of tables) {
      if (table.team_assignments.length > 0) {
        coveredTables++;
      }
    }

    const percentage = totalTables === 0 ? 0 : Math.round((coveredTables / totalTables) * 100);

    return {
      total_tables: totalTables,
      covered_tables: coveredTables,
      uncovered_tables: totalTables - coveredTables,
      percentage
    };
  }
}
