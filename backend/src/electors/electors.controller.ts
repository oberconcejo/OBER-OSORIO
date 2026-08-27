import { Controller, Get, Post, Body, UseGuards, Request, Query } from '@nestjs/common';
import { ElectorsService } from './electors.service';
import { CreateElectorDto } from './dto/create-elector.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('electors')
@UseGuards(JwtAuthGuard)
export class ElectorsController {
  constructor(private readonly electorsService: ElectorsService) {}

  @Post()
  create(@Request() req, @Body() createElectorDto: CreateElectorDto) {
    // El organizacion_id proviene del token JWT validado en JwtAuthGuard
    const organizationId = req.user.organization_id;
    return this.electorsService.create(organizationId, createElectorDto);
  }

  @Get()
  findAll(@Request() req, @Query('search') search?: string) {
    const organizationId = req.user.organization_id;
    return this.electorsService.findAll(organizationId, search);
  }
}
