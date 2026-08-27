import { Controller, Get, Post, Patch, Param, Body, UseGuards, Request } from '@nestjs/common';
import { IntelligenceService } from './intelligence.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RegisterModelDto, ResolveAnomalyDto, CreateSimulationDto, ChatQueryDto } from './dto/intelligence.dto';

@Controller('intelligence')
@UseGuards(JwtAuthGuard)
export class IntelligenceController {
  constructor(private readonly service: IntelligenceService) {}

  // ==========================================
  // MODEL REGISTRY
  // ==========================================

  @Post('models')
  registerModel(@Body() dto: RegisterModelDto) {
    return this.service.registerModel(dto);
  }

  @Get('models')
  getModels() {
    return this.service.getModels();
  }

  // ==========================================
  // ANOMALY DETECTION ENGINE
  // ==========================================

  @Get('alerts')
  getAnomalyAlerts(@Request() req) {
    return this.service.getAnomalyAlerts(req.user.organization_id);
  }

  @Patch('alerts/:id/resolve')
  resolveAnomalyAlert(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: ResolveAnomalyDto
  ) {
    return this.service.resolveAnomalyAlert(req.user.organization_id, id, req.user.userId, dto);
  }

  @Post('alerts/trigger')
  triggerAnomalyCheck(@Request() req) {
    return this.service.triggerAnomalyCheck(req.user.organization_id);
  }

  // ==========================================
  // WHAT-IF SIMULATION ENGINE
  // ==========================================

  @Post('simulations')
  runSimulation(@Request() req, @Body() dto: CreateSimulationDto) {
    return this.service.runSimulation(req.user.organization_id, req.user.userId, dto);
  }

  @Get('simulations')
  getSimulations(@Request() req) {
    return this.service.getSimulations(req.user.organization_id);
  }

  // ==========================================
  // AI ELECTORAL ASSISTANT (RAG / SEARCH)
  // ==========================================

  @Post('chat')
  queryAssistant(@Request() req, @Body() dto: ChatQueryDto) {
    return this.service.queryAssistant(req.user.organization_id, dto);
  }
}
