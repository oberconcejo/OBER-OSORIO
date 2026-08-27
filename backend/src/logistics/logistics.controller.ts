import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { LogisticsService } from './logistics.service';
import { CreateStationDto, CreateTableDto } from './dto/create-station.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('logistics')
@UseGuards(JwtAuthGuard)
export class LogisticsController {
  constructor(private readonly logisticsService: LogisticsService) {}

  @Get('zones')
  getZones(@Request() req) {
    return this.logisticsService.getZones(req.user.organization_id);
  }

  @Get('stations')
  getStations(@Request() req) {
    return this.logisticsService.getStations(req.user.organization_id);
  }

  @Post('stations')
  createStation(@Request() req, @Body() dto: CreateStationDto) {
    return this.logisticsService.createStation(req.user.organization_id, dto);
  }

  @Post('tables')
  createTable(@Request() req, @Body() dto: CreateTableDto) {
    return this.logisticsService.createTable(req.user.organization_id, dto);
  }
}
