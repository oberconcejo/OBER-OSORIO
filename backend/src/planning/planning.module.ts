import { Module } from '@nestjs/common';
import { PlanningService } from './planning.service';
import { PlanningController } from './planning.controller';
import { EncuestasService } from './encuestas.service';
import { EncuestasController } from './encuestas.controller';
import { JwtModule } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [JwtModule],
  controllers: [PlanningController, EncuestasController],
  providers: [PlanningService, EncuestasService, PrismaService],
})
export class PlanningModule {}
