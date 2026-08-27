import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ElectorsModule } from './electors/electors.module';
import { LogisticsModule } from './logistics/logistics.module';
import { TeamModule } from './team/team.module';
import { TerritorialModule } from './territorial/territorial.module';
import { PlanningModule } from './planning/planning.module';
import { MobilizationModule } from './mobilization/mobilization.module';
import { IntelligenceModule } from './intelligence/intelligence.module';
import { BeeCampaignModule } from './bee-campaign/bee-campaign.module';
import { ElectoralModule } from './electoral/electoral.module';
import { GlobalAdminModule } from './global-admin/global-admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    UsersModule,
    AuthModule,
    ElectorsModule,
    LogisticsModule,
    TeamModule,
    TerritorialModule,
    PlanningModule,
    MobilizationModule,
    IntelligenceModule,
    BeeCampaignModule,
    ElectoralModule,
    GlobalAdminModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
