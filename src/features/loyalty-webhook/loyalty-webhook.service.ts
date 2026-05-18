import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OrderEntity } from '../order/entities/order.entity';
import { OrderStatus } from '../../shared/enums';

export type LoyaltyOrderStatusPayload = {
  event: 'order.status_changed';
  tenantId: number;
  externalOrderId: string;
  orderNo: string;
  previousStatus: string;
  status: string;
  occurredAt: string;
};

@Injectable()
export class LoyaltyWebhookService {
  private readonly logger = new Logger(LoyaltyWebhookService.name);

  constructor(private readonly configService: ConfigService) {}

  async notifyOrderStatusChanged(
    order: OrderEntity,
    previousStatus: OrderStatus,
  ): Promise<void> {
    const url = this.configService.get<string>('loyalty.webhookUrl')?.trim();
    const secret = this.configService
      .get<string>('loyalty.webhookSecret')
      ?.trim();

    if (!url || !secret) {
      this.logger.warn(
        'LOYALTY_WEBHOOK_URL or LOYALTY_WEBHOOK_SECRET not set — loyalty will NOT receive order status updates. Set both in GRX .env and restart.',
      );
      return;
    }

    const payload: LoyaltyOrderStatusPayload = {
      event: 'order.status_changed',
      tenantId: order.tenantId,
      externalOrderId: order.id,
      orderNo: order.orderNo,
      previousStatus,
      status: order.status,
      occurredAt: new Date().toISOString(),
    };

    const timeoutMs = Number(
      this.configService.get<string>('loyalty.webhookTimeoutMs') ?? '10000',
    );
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'X-GRX-Webhook-Secret': secret,
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      if (!response.ok) {
        const body = await response.text().catch(() => '');
        this.logger.warn(
          `Loyalty webhook failed status=${response.status} orderId=${order.id} body=${body.slice(0, 500)}`,
        );
        return;
      }

      this.logger.log(
        `Loyalty webhook OK orderId=${order.id} status=${order.status} tenantId=${order.tenantId}`,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(
        `Loyalty webhook error orderId=${order.id} status=${order.status}: ${message}`,
      );
    } finally {
      clearTimeout(timeout);
    }
  }
}
