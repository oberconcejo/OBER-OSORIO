import { Injectable, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class ResultsService {
  constructor(private prisma: PrismaService) {}

  // ==========================================
  // INMUTABILIDAD, VERSIONAMIENTO Y AUDITORÍA (REGLAS 21, 22, 23, 42)
  // ==========================================
  async submitResult(orgId: string, data: any, userId: string) {
    // 1. Validar matemática (Regla 13)
    const sumCandidates = data.candidate_results.reduce((acc, cr) => acc + cr.votes, 0);
    const sumCategories = data.category_results.reduce((acc, c) => acc + c.votes, 0);
    const calculatedTotal = sumCandidates + sumCategories;

    if (calculatedTotal !== data.total_votes) {
      throw new BadRequestException('INCONSISTENCIA MATEMÁTICA: La suma de candidatos y categorías no coincide con el total reportado.');
    }

    // Prevención Votos Negativos (Regla 10 y 49)
    if (data.candidate_results.some(cr => cr.votes < 0) || data.category_results.some(cr => cr.votes < 0)) {
        throw new BadRequestException('No se permiten votos negativos.');
    }

    // 2. Control de Versiones e Inmutabilidad (Regla 21 y 42)
    const existingActiveResult = await this.prisma.pollingTableResult.findFirst({
      where: { 
        election_id: data.election_id, 
        polling_table_id: data.polling_table_id,
        status: { notIn: ['SUPERSEDED', 'REJECTED'] }
      }
    });

    let newVersionNumber = 1;

    if (existingActiveResult) {
      // Regla 23: Exigir motivo de corrección
      if (!data.correction_reason) {
        throw new BadRequestException('Debe ingresar un motivo para corregir o sobreescribir un resultado existente.');
      }
      
      // Control de concurrencia optimista básico (Regla 43)
      if (data.expected_version && existingActiveResult.version !== data.expected_version) {
        throw new ConflictException('El resultado fue modificado por otro usuario. Actualiza la información antes de continuar.');
      }

      newVersionNumber = existingActiveResult.version + 1;

      // Deprecamos (SUPERSEDED) la versión anterior en lugar de eliminarla físicamente
      await this.prisma.pollingTableResult.update({
        where: { id: existingActiveResult.id },
        data: { status: 'SUPERSEDED' }
      });
    }

    // 3. Transacción para inserción atómica (Regla 50)
    const result = await this.prisma.$transaction(async (tx) => {
      const newResult = await tx.pollingTableResult.create({
        data: {
          election_id: data.election_id,
          polling_table_id: data.polling_table_id,
          act_id: data.act_id,
          version: newVersionNumber,
          status: 'UNDER_REVIEW', // Siempre sujeto a validación
          total_votes: calculatedTotal,
          correction_reason: data.correction_reason,
          reported_by: userId,
          
          candidate_results: {
            create: data.candidate_results.map(cr => ({
              candidate_id: cr.candidate_id,
              votes: cr.votes
            }))
          },
          category_results: {
            create: data.category_results.map(cat => ({
              category: cat.category,
              votes: cat.votes
            }))
          }
        }
      });

      await tx.auditLog.create({
        data: { 
          organization_id: orgId, 
          user_id: userId, 
          action: newVersionNumber === 1 ? 'RESULT_CREATED' : 'RESULT_CORRECTED', 
          entity_name: 'PollingTableResult', 
          entity_id: newResult.id, 
          new_values: { version: newVersionNumber, reason: data.correction_reason } 
        }
      });

      return newResult;
    });

    return result;
  }

  // ==========================================
  // CARGA DE ACTAS Y CHECKSUM (REGLAS 15, 16, 17, 53)
  // ==========================================
  async uploadElectionAct(orgId: string, fileData: any, userId: string) {
    // Protección Checksum contra duplicados exactos
    const existing = await this.prisma.electionAct.findUnique({
      where: { checksum: fileData.checksum }
    });

    if (existing) {
      throw new ConflictException('Esta acta exacta (checksum idéntico) ya fue subida previamente.');
    }

    const act = await this.prisma.electionAct.create({
      data: {
        election_id: fileData.election_id,
        polling_table_id: fileData.polling_table_id,
        document_reference: fileData.secure_url, // URL de S3 o R2 protegida, nunca pública
        checksum: fileData.checksum,
        uploaded_by: userId
      }
    });

    await this.prisma.auditLog.create({
      data: { organization_id: orgId, user_id: userId, action: 'ACTA_UPLOADED', entity_name: 'ElectionAct', entity_id: act.id, new_values: {} }
    });

    return act;
  }
}
