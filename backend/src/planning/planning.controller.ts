import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, Request } from '@nestjs/common';
import { PlanningService } from './planning.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CreatePlanDto, UpdatePlanDto } from './dto/create-plan.dto';
import { CreateObjectiveDto, UpdateObjectiveDto } from './dto/create-objective.dto';
import { CreateActivityDto, UpdateActivityDto, ActivityStatusDto } from './dto/create-activity.dto';

@Controller()
@UseGuards(JwtAuthGuard)
export class PlanningController {
  constructor(private readonly planningService: PlanningService) {}

  // ==========================================
  // DASHBOARD
  // ==========================================

  @Get('planning/dashboard')
  getDashboard(@Request() req) {
    return this.planningService.getDashboard(req.user.organization_id);
  }

  // ==========================================
  // PLANS
  // ==========================================

  @Post('plans')
  createPlan(@Request() req, @Body() dto: CreatePlanDto) {
    return this.planningService.createPlan(req.user.organization_id, dto);
  }

  @Get('plans')
  getPlans(@Request() req) {
    return this.planningService.getPlans(req.user.organization_id);
  }

  @Get('plans/:id')
  getPlanById(@Request() req, @Param('id') id: string) {
    return this.planningService.getPlanById(req.user.organization_id, id);
  }

  @Patch('plans/:id')
  updatePlan(@Request() req, @Param('id') id: string, @Body() dto: UpdatePlanDto) {
    return this.planningService.updatePlan(req.user.organization_id, id, dto);
  }

  @Delete('plans/:id')
  deletePlan(@Request() req, @Param('id') id: string) {
    return this.planningService.deletePlan(req.user.organization_id, id);
  }

  // ==========================================
  // OBJECTIVES
  // ==========================================

  @Post('plans/:id/objectives')
  createObjective(@Request() req, @Param('id') planId: string, @Body() dto: CreateObjectiveDto) {
    return this.planningService.createObjective(req.user.organization_id, planId, dto);
  }

  @Patch('objectives/:id')
  updateObjective(@Request() req, @Param('id') id: string, @Body() dto: UpdateObjectiveDto) {
    return this.planningService.updateObjective(req.user.organization_id, id, dto);
  }

  @Delete('objectives/:id')
  deleteObjective(@Request() req, @Param('id') id: string) {
    return this.planningService.deleteObjective(req.user.organization_id, id);
  }

  // ==========================================
  // ACTIVITIES
  // ==========================================

  @Post('activities')
  createActivity(@Request() req, @Body() dto: CreateActivityDto) {
    return this.planningService.createActivity(req.user.organization_id, dto);
  }

  @Get('activities')
  getActivities(@Request() req) {
    return this.planningService.getActivities(req.user.organization_id);
  }

  @Get('activities/calendar')
  getCalendar(@Request() req) {
    return this.planningService.getCalendar(req.user.organization_id);
  }

  @Get('activities/:id')
  getActivityById(@Request() req, @Param('id') id: string) {
    return this.planningService.getActivityById(req.user.organization_id, id);
  }

  @Patch('activities/:id')
  updateActivity(@Request() req, @Param('id') id: string, @Body() dto: UpdateActivityDto) {
    return this.planningService.updateActivity(req.user.organization_id, id, dto);
  }

  @Delete('activities/:id')
  deleteActivity(@Request() req, @Param('id') id: string) {
    return this.planningService.deleteActivity(req.user.organization_id, id);
  }

  @Patch('activities/:id/status')
  updateActivityStatus(@Request() req, @Param('id') id: string, @Body() dto: ActivityStatusDto) {
    return this.planningService.updateActivityStatus(req.user.organization_id, id, dto.status);
  }

  // ==========================================
  // CHECKLIST
  // ==========================================

  @Post('activities/:id/checklist')
  addChecklistItem(@Request() req, @Param('id') id: string, @Body('title') title: string) {
    return this.planningService.addChecklistItem(req.user.organization_id, id, title);
  }

  @Patch('activities/checklist/:itemId')
  toggleChecklistItem(@Request() req, @Param('itemId') itemId: string, @Body('is_completed') isCompleted: boolean) {
    return this.planningService.toggleChecklistItem(req.user.organization_id, itemId, isCompleted);
  }

  // ==========================================
  // COMMENTS
  // ==========================================

  @Post('activities/:id/comments')
  addComment(@Request() req, @Param('id') id: string, @Body('content') content: string) {
    return this.planningService.addComment(req.user.organization_id, req.user.userId, id, content);
  }

  // ==========================================
  // EVIDENCE
  // ==========================================

  @Post('activities/:id/evidence')
  addEvidence(@Request() req, @Param('id') id: string, @Body('file_name') fileName: string, @Body('file_url') fileUrl: string) {
    return this.planningService.addEvidence(req.user.organization_id, id, fileName, fileUrl);
  }
}
