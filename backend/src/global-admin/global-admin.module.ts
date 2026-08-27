import { Module } from '@nestjs/common';
import { GlobalAdminService } from './global-admin.service';
import { GlobalAdminController } from './global-admin.controller';

@Module({
  controllers: [GlobalAdminController],
  providers: [GlobalAdminService],
  exports: [GlobalAdminService],
})
export class GlobalAdminModule {}
