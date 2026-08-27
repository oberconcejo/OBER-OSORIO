import { Module } from '@nestjs/common';
import { TerritorialService } from './territorial.service';
import { TerritorialController } from './territorial.controller';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [JwtModule],
  controllers: [TerritorialController],
  providers: [TerritorialService],
})
export class TerritorialModule {}
