import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  Query, 
  UseGuards, 
  Request, 
  UseInterceptors, 
  UploadedFile, 
  BadRequestException 
} from '@nestjs/common';
import { ElectoralService } from './electoral.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller()
@UseGuards(JwtAuthGuard)
export class ElectoralController {
  constructor(private readonly electoralService: ElectoralService) {}

  // 1. Safe individual Polling Place Query (POST method)
  @Post('electoral/consultar-lugar-votacion')
  consultarLugarVotacion(
    @Request() req,
    @Body() body: { tipoDocumento: string; numeroDocumento: string }
  ) {
    const { tipoDocumento, numeroDocumento } = body;
    if (!tipoDocumento || !numeroDocumento) {
      throw new BadRequestException('Tipo y número de documento son requeridos.');
    }
    // Perform secure query passing user email from token
    const userEmail = req.user.email || 'operador@electoral360.com';
    return this.electoralService.consultarLugarVotacion(tipoDocumento, numeroDocumento, userEmail);
  }

  // 2. File Upload Import (restricted to authenticated sessions)
  @Post('electoral/import')
  @UseInterceptors(FileInterceptor('file'))
  importElectoralData(
    @Request() req,
    @UploadedFile() file: any, // Express.Multer.File
    @Body('fuente') fuente: string,
    @Body('eleccion') eleccion: string,
    @Body('fechaFuente') fechaFuente: string,
  ) {
    if (!file) {
      throw new BadRequestException('El archivo de importación es obligatorio.');
    }
    const userEmail = req.user.email || 'admin@electoral360.com';
    
    return this.electoralService.importFile(
      file.buffer,
      file.originalname,
      fuente || 'DIVIPOLE Oficial',
      eleccion || 'Presidencia 2026',
      fechaFuente || new Date().toISOString().split('T')[0],
      userEmail
    );
  }

  @Get('electoral/imports')
  getImportsList() {
    return this.electoralService.getImportsList();
  }

  @Post('electoral/imports/:id/activate')
  activateImport(@Param('id') id: string) {
    return this.electoralService.activateImport(id);
  }

  // 3. DIVIPOLE Geography Endpoints
  @Get('electoral/departamentos')
  getDepartamentos() {
    return this.electoralService.getDepartamentos();
  }

  @Get('electoral/departamentos/:departamentoId/municipios')
  getMunicipios(@Param('departamentoId') departamentoId: string) {
    return this.electoralService.getMunicipios(departamentoId);
  }

  @Get('electoral/municipios/:municipioId')
  getMunicipioDetail(@Param('municipioId') municipioId: string) {
    return this.electoralService.getMunicipioDetail(municipioId);
  }

  @Get('electoral/municipios/:municipioId/puestos')
  getPuestos(@Param('municipioId') municipioId: string) {
    return this.electoralService.getPuestos(municipioId);
  }

  @Get('puestos/:puestoId/mesas')
  getMesas(@Param('puestoId') puestoId: string) {
    return this.electoralService.getMesas(puestoId);
  }

  @Get('electoral/municipios/:municipioId/distribucion')
  getDistribucion(@Param('municipioId') municipioId: string) {
    return this.electoralService.getDistribucion(municipioId);
  }

  // 4. Campaign integration endpoint
  @Get('campanas/:campanaId/distribucion-electoral')
  getCampaignDistribucion(
    @Param('campanaId') campanaId: string,
    @Query('corporacion') corporacion?: string,
    @Query('municipio') municipio?: string
  ) {
    return this.electoralService.getCampaignDistribucion(campanaId, corporacion, municipio);
  }

  // --- Official Registraduría Integration Routes ---
  @Get('electoral/elecciones')
  getElecciones() {
    return this.electoralService.getEleccionesOficiales();
  }

  @Post('electoral/lugar-votacion')
  consultarLugarVotacionOficial(
    @Request() req,
    @Body() body: { documento: string; eleccionId: number; verificationToken: string }
  ) {
    const { documento, eleccionId, verificationToken } = body;
    if (!documento || eleccionId === undefined || !verificationToken) {
      throw new BadRequestException('El documento, ID de la elección y token de verificación son obligatorios.');
    }
    const userEmail = req.user.email || 'operador@electoral360.com';
    return this.electoralService.consultarLugarVotacionOficial(documento, eleccionId, verificationToken, userEmail);
  }
}
