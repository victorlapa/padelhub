import {
  Controller,
  Post,
  Delete,
  Get,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { SubscribeDto } from './dto/subscribe.dto';
import { UnsubscribeDto } from './dto/unsubscribe.dto';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  /**
   * Get VAPID public key for push subscription
   * GET /notifications/vapid-public-key
   */
  @Get('vapid-public-key')
  getVapidPublicKey() {
    return {
      publicKey: this.notificationsService.getPublicVapidKey(),
    };
  }

  /**
   * Subscribe to push notifications
   * POST /notifications/subscribe
   */
  @Post('subscribe')
  @HttpCode(HttpStatus.CREATED)
  async subscribe(
    @Body('userId') userId: string,
    @Body() subscribeDto: SubscribeDto,
  ) {
    const subscription = await this.notificationsService.subscribe(
      userId,
      subscribeDto,
    );
    return {
      message: 'Successfully subscribed to push notifications',
      subscription: {
        id: subscription.id,
        createdAt: subscription.createdAt,
      },
    };
  }

  /**
   * Unsubscribe from push notifications
   * POST /notifications/unsubscribe
   */
  @Post('unsubscribe')
  @HttpCode(HttpStatus.OK)
  async unsubscribe(
    @Body('userId') userId: string,
    @Body() unsubscribeDto: UnsubscribeDto,
  ) {
    await this.notificationsService.unsubscribe(userId, unsubscribeDto);
    return {
      message: 'Successfully unsubscribed from push notifications',
    };
  }

  /**
   * Get user's active subscriptions
   * GET /notifications/subscriptions/:userId
   */
  @Get('subscriptions/:userId')
  async getUserSubscriptions(@Param('userId') userId: string) {
    const subscriptions =
      await this.notificationsService.getUserSubscriptions(userId);
    return {
      count: subscriptions.length,
      subscriptions: subscriptions.map((sub) => ({
        id: sub.id,
        endpoint: sub.endpoint.substring(0, 50) + '...', // Truncate for security
        userAgent: sub.userAgent,
        createdAt: sub.createdAt,
      })),
    };
  }

  /**
   * Get user's notification history
   * GET /notifications/history/:userId?limit=50
   */
  @Get('history/:userId')
  async getUserNotificationHistory(
    @Param('userId') userId: string,
    @Query('limit') limit?: string,
  ) {
    const notifications =
      await this.notificationsService.getUserNotificationHistory(
        userId,
        limit ? parseInt(limit, 10) : 50,
      );
    return {
      count: notifications.length,
      notifications,
    };
  }

  /**
   * Test endpoint to send a test notification
   * POST /notifications/test
   * (For development only - remove in production)
   */
  @Post('test')
  @HttpCode(HttpStatus.OK)
  async sendTestNotification(
    @Body('userId') userId: string,
    @Body('title') title: string,
    @Body('body') body: string,
  ) {
    const result = await this.notificationsService.sendPushNotification(userId, {
      title: title || 'Test Notification',
      body: body || 'This is a test notification from PadelHub!',
      data: { test: true },
    });
    return {
      message: 'Test notification sent',
      result,
    };
  }
}
