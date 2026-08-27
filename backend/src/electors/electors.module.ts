import { Module } from '@nestjs/common';
import { ElectorsService } from './electors.service';
import { ElectorsController } from './electors.controller';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [JwtModule],
  controllers: [ElectorsController],
  providers: [ElectorsService],
})
export class ElectorsModule {}
