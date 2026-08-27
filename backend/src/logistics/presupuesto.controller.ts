import { Controller, Get, Post, Delete, Param, Body, UseGuards, Request } from '@nestjs/common';
import { PresupuestoService, CreateTransaccionDto } from './presupuesto.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('api/v1/presupuesto')
@UseGuards(JwtAuthGuard)
export class PresupuestoController {
  constructor(private readonly presupuestoService: PresupuestoService) {}

  @Get('transacciones')
  findAll(@Request() req) {
    return this.presupuestoService.findAll(req.user.organization_id);
  }

  @Post('transacciones')
  create(@Request() req, @Body() dto: CreateTransaccionDto) {
    return this.presupuestoService.create(req.user.organization_id, dto);
  }

  @Delete('transacciones/:id')
  delete(@Request() req, @Param('id') id: string) {
    return this.presupuestoService.delete(req.user.organization_id, id);
  }
}
