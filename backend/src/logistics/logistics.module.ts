import { Module } from '@nestjs/common';
import { LogisticsService } from './logistics.service';
import { LogisticsController } from './logistics.controller';
import { PresupuestoService } from './presupuesto.service';
import { PresupuestoController } from './presupuesto.controller';
import { JwtModule } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [JwtModule],
  controllers: [LogisticsController, PresupuestoController],
  providers: [LogisticsService, PresupuestoService, PrismaService],
})
export class LogisticsModule {}
