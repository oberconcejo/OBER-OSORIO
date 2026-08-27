import { Controller, Get, Post, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { GlobalAdminService } from './global-admin.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { GlobalAdminGuard } from '../common/guards/global-admin.guard';

@Controller('global-admin')
export class GlobalAdminController {
  constructor(private readonly service: GlobalAdminService) {}

  @Post('login')
  login(@Body() loginDto: any) {
    return this.service.login(loginDto);
  }

  @Get('dashboard')
  @UseGuards(JwtAuthGuard, GlobalAdminGuard)
  getDashboard() {
    return this.service.getDashboardData();
  }

  @Get('users')
  @UseGuards(JwtAuthGuard, GlobalAdminGuard)
  getUsers() {
    return this.service.getUsers();
  }

  @Post('users')
  @UseGuards(JwtAuthGuard, GlobalAdminGuard)
  createUser(@Body() body: any) {
    return this.service.createUser(body);
  }

  @Patch('users/:id')
  @UseGuards(JwtAuthGuard, GlobalAdminGuard)
  updateUser(@Param('id') id: string, @Body() body: any) {
    return this.service.updateUser(id, body);
  }

  @Get('roles')
  @UseGuards(JwtAuthGuard, GlobalAdminGuard)
  getRoles() {
    return this.service.getRoles();
  }

  @Get('campaigns')
  @UseGuards(JwtAuthGuard, GlobalAdminGuard)
  getCampaigns() {
    return this.service.getCampaigns();
  }

  @Get('apis')
  @UseGuards(JwtAuthGuard, GlobalAdminGuard)
  getApis() {
    return this.service.getApis();
  }

  @Get('audit-logs')
  @UseGuards(JwtAuthGuard, GlobalAdminGuard)
  getAuditLogs() {
    return this.service.getAuditLogs();
  }

  @Get('security')
  @UseGuards(JwtAuthGuard, GlobalAdminGuard)
  getSecurity() {
    return this.service.getSecurityData();
  }

  @Patch('security/settings')
  @UseGuards(JwtAuthGuard, GlobalAdminGuard)
  updateSecuritySettings(@Body() body: any) {
    return this.service.updateSecuritySettings(body);
  }

  @Post('security/block-ip')
  @UseGuards(JwtAuthGuard, GlobalAdminGuard)
  blockIp(@Body() body: any) {
    return this.service.blockIp(body);
  }

  @Post('security/unblock-ip')
  @UseGuards(JwtAuthGuard, GlobalAdminGuard)
  unblockIp(@Body() body: any) {
    return this.service.unblockIp(body.ip);
  }

  @Get('modules')
  @UseGuards(JwtAuthGuard, GlobalAdminGuard)
  getModules() {
    return this.service.getModules();
  }

  @Patch('modules/:id')
  @UseGuards(JwtAuthGuard, GlobalAdminGuard)
  updateModule(@Param('id') id: string, @Body() body: any) {
    return this.service.updateModule(id, body);
  }

  @Get('configuracion')
  @UseGuards(JwtAuthGuard, GlobalAdminGuard)
  getConfig() {
    return this.service.getConfig();
  }

  @Patch('configuracion')
  @UseGuards(JwtAuthGuard, GlobalAdminGuard)
  updateConfig(@Body() body: any) {
    return this.service.updateConfig(body);
  }

  @Patch('roles/:id/permissions')
  @UseGuards(JwtAuthGuard, GlobalAdminGuard)
  updateRolePermissions(@Param('id') id: string, @Body() body: any) {
    return this.service.updateRolePermissions(id, body.permissions);
  }

  @Patch('campaigns/:id')
  @UseGuards(JwtAuthGuard, GlobalAdminGuard)
  updateCampaign(@Param('id') id: string, @Body() body: any) {
    return this.service.updateCampaign(id, body);
  }

  @Patch('apis/:name')
  @UseGuards(JwtAuthGuard, GlobalAdminGuard)
  updateApi(@Param('name') name: string, @Body() body: any) {
    return this.service.updateApi(name, body);
  }

  @Get('system')
  @UseGuards(JwtAuthGuard, GlobalAdminGuard)
  getSystem() {
    return this.service.getSystemStatus();
  }
}
