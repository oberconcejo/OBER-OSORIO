import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { TeamService } from './team.service';
import { CreatePositionDto, CreateMemberDto } from './dto/create-team.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('team')
@UseGuards(JwtAuthGuard)
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  @Get('positions')
  getPositions(@Request() req) {
    return this.teamService.getPositions(req.user.organization_id);
  }

  @Post('positions')
  createPosition(@Request() req, @Body() dto: CreatePositionDto) {
    return this.teamService.createPosition(req.user.organization_id, dto);
  }

  @Get('members')
  getMembers(@Request() req) {
    return this.teamService.getMembers(req.user.organization_id);
  }

  @Post('members')
  createMember(@Request() req, @Body() dto: CreateMemberDto) {
    return this.teamService.createMember(req.user.organization_id, dto);
  }

  @Get('assignments')
  getAssignments(@Request() req) {
    return this.teamService.getAssignments(req.user.organization_id);
  }

  @Post('assignments')
  assignTerritory(@Request() req, @Body() dto: import('./dto/assign-team.dto').AssignTeamDto) {
    return this.teamService.assignTerritory(req.user.organization_id, dto);
  }
}
