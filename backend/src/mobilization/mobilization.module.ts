import { Module } from '@nestjs/common';
import { MobilizationService } from './mobilization.service';
import { MobilizationController } from './mobilization.controller';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [JwtModule],
  controllers: [MobilizationController],
  providers: [MobilizationService],
})
export class MobilizationModule {}
