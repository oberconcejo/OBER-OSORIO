import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { TerritorialService } from './territorial.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('territories')
@UseGuards(JwtAuthGuard)
export class TerritorialController {
  constructor(private readonly territorialService: TerritorialService) {}

  @Get('tree')
  getTree(@Request() req) {
    return this.territorialService.getTree(req.user.organization_id);
  }

  @Get('coverage')
  getCoverage(@Request() req) {
    return this.territorialService.getCoverage(req.user.organization_id);
  }
}
