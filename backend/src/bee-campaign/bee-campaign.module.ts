import { Module } from '@nestjs/common';
import { BeeCampaignController } from './bee-campaign.controller';

@Module({
  controllers: [BeeCampaignController],
})
export class BeeCampaignModule {}
