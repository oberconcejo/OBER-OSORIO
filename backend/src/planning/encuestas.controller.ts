import { Controller, Get, Post, Delete, Param, Body, UseGuards, Request } from '@nestjs/common';
import { EncuestasService, CreateEncuestaDto } from './encuestas.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('api/v1/encuestas')
@UseGuards(JwtAuthGuard)
export class EncuestasController {
  constructor(private readonly encuestasService: EncuestasService) {}

  @Get()
  findAll(@Request() req) {
    return this.encuestasService.findAll(req.user.organization_id);
  }

  @Post()
  create(@Request() req, @Body() dto: CreateEncuestaDto) {
    return this.encuestasService.create(req.user.organization_id, dto);
  }

  @Delete(':id')
  delete(@Request() req, @Param('id') id: string) {
    return this.encuestasService.delete(req.user.organization_id, id);
  }
}
