import { Module } from '@nestjs/common';
import { LoyaltyWebhookService } from './loyalty-webhook.service';

@Module({
  providers: [LoyaltyWebhookService],
  exports: [LoyaltyWebhookService],
})
export class LoyaltyWebhookModule {}
