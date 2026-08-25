import { Controller, Get, Post, Patch, Param, Body, UseGuards, Req, Query } from '@nestjs/common';
import { ElectorsService } from './electors.service';
import { PermissionsGuard } from '../common/guards/permissions.guard';
// Importamos un hipotético decorador personalizado
// import { Permissions, ThrottleLimit } from '../common/decorators'; 

@Controller('api/v1/electors')
@UseGuards(PermissionsGuard) // Asume JwtAuthGuard ejecutado globalmente
export class ElectorsController {
  constructor(private readonly electorsService: ElectorsService) {}

  @Get()
  // @Permissions('electors.view')
  async findAll(@Req() req, @Query('page') page = 1, @Query('limit') limit = 25, @Query('search') search) {
    // Topamos el límite a 100 para proteger la memoria (Regla 32)
    const safeLimit = Math.min(Number(limit), 100);
    const skip = (Number(page) - 1) * safeLimit;
    
    // Verificamos si tiene permiso para ver el documento completo
    const canViewFullDoc = req.user.permissions.includes('electors.view.full_document');
    
    const { data, total } = await this.electorsService.findAll(
      req.user.organizationId, 
      skip, 
      safeLimit, 
      search,
      req.user.territoryScope // Inyectado para Autorización Territorial (Fase 3)
    );

    return {
      data: data.map(e => ({
        ...e,
        // Enmascaramiento de PII en servidor (Regla 7)
        document_number: canViewFullDoc ? e.document_number : this.electorsService.maskDocument(e.document_number),
        phone: req.user.permissions.includes('electors.contact.view') ? e.phone : null,
      })),
      meta: {
        page: Number(page),
        limit: safeLimit,
        total,
        totalPages: Math.ceil(total / safeLimit)
      }
    };
  }

  @Get(':id')
  // @Permissions('electors.view')
  async findOne(@Param('id') id: string, @Req() req) {
    // La protección contra IDOR está encapsulada en el Service
    return this.electorsService.findOne(id, req.user.organizationId);
  }

  @Post()
  // @Permissions('electors.create')
  async create(@Body() createElectorDto: any, @Req() req) {
    return this.electorsService.create(req.user.organizationId, createElectorDto, req.user.id);
  }

  @Post('import')
  // @Permissions('electors.import')
  async importBatch(@Body() importData: any[], @Req() req) {
    // Rate Limiting asincrónico por lotes gestionado en el servicio
    return this.electorsService.importBatch(req.user.organizationId, importData, req.user.id);
  }
}
