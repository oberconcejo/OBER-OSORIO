import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, Request } from '@nestjs/common';
import { MobilizationService } from './mobilization.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { 
  CreateOperationDto, UpdateOperationDto, 
  CreateOperationDayDto, UpdateOperationDayDto,
  CreateMobilizationActivityDto, UpdateMobilizationActivityDto,
  CreateIncidentDto, UpdateIncidentDto,
  CreateOperationalPointDto, UpdateOperationalPointDto,
  CreateResourceDto, UpdateResourceDto 
} from './dto/mobilization.dto';

@Controller('mobilization')
@UseGuards(JwtAuthGuard)
export class MobilizationController {
  constructor(private readonly service: MobilizationService) {}

  // ==========================================
  // DASHBOARD
  // ==========================================

  @Get('dashboard')
  getDashboard(@Request() req) {
    return this.service.getDashboard(req.user.organization_id);
  }

  // ==========================================
  // OPERATIONS
  // ==========================================

  @Post('operations')
  createOperation(@Request() req, @Body() dto: CreateOperationDto) {
    return this.service.createOperation(req.user.organization_id, dto);
  }

  @Get('operations')
  getOperations(@Request() req) {
    return this.service.getOperations(req.user.organization_id);
  }

  @Get('operations/:id')
  getOperationById(@Request() req, @Param('id') id: string) {
    return this.service.getOperationById(req.user.organization_id, id);
  }

  @Patch('operations/:id')
  updateOperation(@Request() req, @Param('id') id: string, @Body() dto: UpdateOperationDto) {
    return this.service.updateOperation(req.user.organization_id, id, dto);
  }

  @Delete('operations/:id')
  deleteOperation(@Request() req, @Param('id') id: string) {
    return this.service.deleteOperation(req.user.organization_id, id);
  }

  // ==========================================
  // OPERATION DAYS
  // ==========================================

  @Post('days')
  createOperationDay(@Request() req, @Body() dto: CreateOperationDayDto) {
    return this.service.createOperationDay(req.user.organization_id, dto);
  }

  @Patch('days/:id')
  updateOperationDay(@Request() req, @Param('id') id: string, @Body() dto: UpdateOperationDayDto) {
    return this.service.updateOperationDay(req.user.organization_id, id, dto);
  }

  // ==========================================
  // MOBILIZATION ACTIVITIES
  // ==========================================

  @Post('activities')
  createActivity(@Request() req, @Body() dto: CreateMobilizationActivityDto) {
    return this.service.createActivity(req.user.organization_id, dto);
  }

  @Get('activities')
  getActivities(@Request() req) {
    return this.service.getActivities(req.user.organization_id);
  }

  @Get('activities/:id')
  getActivityById(@Request() req, @Param('id') id: string) {
    return this.service.getActivityById(req.user.organization_id, id);
  }

  @Patch('activities/:id')
  updateActivity(@Request() req, @Param('id') id: string, @Body() dto: UpdateMobilizationActivityDto) {
    return this.service.updateActivity(req.user.organization_id, id, dto);
  }

  @Delete('activities/:id')
  deleteActivity(@Request() req, @Param('id') id: string) {
    return this.service.deleteActivity(req.user.organization_id, id);
  }

  // ==========================================
  // INCIDENTS
  // ==========================================

  @Post('incidents')
  createIncident(@Request() req, @Body() dto: CreateIncidentDto) {
    return this.service.createIncident(req.user.organization_id, dto);
  }

  @Get('incidents')
  getIncidents(@Request() req) {
    return this.service.getIncidents(req.user.organization_id);
  }

  @Get('incidents/:id')
  getIncidentById(@Request() req, @Param('id') id: string) {
    return this.service.getIncidentById(req.user.organization_id, id);
  }

  @Patch('incidents/:id')
  updateIncident(@Request() req, @Param('id') id: string, @Body() dto: UpdateIncidentDto) {
    return this.service.updateIncident(req.user.organization_id, id, dto);
  }

  @Post('incidents/:id/assign')
  assignIncident(@Request() req, @Param('id') incidentId: string, @Body('member_id') memberId: string) {
    return this.service.assignIncident(req.user.organization_id, incidentId, memberId);
  }

  // ==========================================
  // RESOURCES
  // ==========================================

  @Post('resources')
  createResource(@Request() req, @Body() dto: CreateResourceDto) {
    return this.service.createResource(req.user.organization_id, dto);
  }

  @Get('resources')
  getResources(@Request() req) {
    return this.service.getResources(req.user.organization_id);
  }

  @Post('resources/:id/assign')
  assignResource(
    @Request() req, 
    @Param('id') resourceId: string, 
    @Body('member_id') memberId: string, 
    @Body('quantity') quantity: number
  ) {
    return this.service.assignResource(req.user.organization_id, resourceId, memberId, quantity);
  }

  @Delete('resources/assignments/:assignmentId')
  releaseResource(@Request() req, @Param('assignmentId') assignmentId: string) {
    return this.service.releaseResource(req.user.organization_id, assignmentId);
  }

  // ==========================================
  // OPERATIONAL POINTS
  // ==========================================

  @Post('points')
  createPoint(@Request() req, @Body() dto: CreateOperationalPointDto) {
    return this.service.createPoint(req.user.organization_id, dto);
  }

  @Get('points')
  getPoints(@Request() req) {
    return this.service.getPoints(req.user.organization_id);
  }
}
