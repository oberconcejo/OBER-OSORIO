import { Module } from '@nestjs/common';
import { ElectoralService } from './electoral.service';
import { ElectoralController } from './electoral.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { RegistraduriaLocationProvider } from './registraduria-provider';

@Module({
  imports: [PrismaModule, JwtModule],
  controllers: [ElectoralController],
  providers: [
    ElectoralService,
    {
      provide: 'ElectoralLocationProvider',
      useClass: RegistraduriaLocationProvider,
    },
  ],
  exports: [
    ElectoralService,
    'ElectoralLocationProvider',
  ],
})
export class ElectoralModule {}
