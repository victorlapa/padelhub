import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, LessThan } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as webpush from 'web-push';
import { PushSubscription } from './entities/push-subscription.entity';
import {
  NotificationLog,
  NotificationType,
  NotificationStatus,
} from './entities/notification-log.entity';
import { Match } from '../matches/entities/match.entity';
import { MatchPlayer } from '../matches/entities/match-player.entity';
import { SubscribeDto } from './dto/subscribe.dto';
import { UnsubscribeDto } from './dto/unsubscribe.dto';
import { Club } from '../clubs/entities/club.entity';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectRepository(PushSubscription)
    private pushSubscriptionRepository: Repository<PushSubscription>,
    @InjectRepository(NotificationLog)
    private notificationLogRepository: Repository<NotificationLog>,
    @InjectRepository(Match)
    private matchRepository: Repository<Match>,
    @InjectRepository(MatchPlayer)
    private matchPlayerRepository: Repository<MatchPlayer>,
  ) {
    // Configure web-push with VAPID details
    const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
    const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
    const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:support@padelhub.com';

    if (!vapidPublicKey || !vapidPrivateKey) {
      this.logger.error(
        'VAPID keys not configured. Push notifications will not work. Run: node scripts/generate-vapid-keys.js',
      );
    } else {
      webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
      this.logger.log('Web Push configured with VAPID keys');
    }
  }

  /**
   * Subscribe a user to push notifications
   */
  async subscribe(userId: string, subscribeDto: SubscribeDto): Promise<PushSubscription> {
    const { endpoint, p256dh, auth, userAgent } = subscribeDto;

    // Check if subscription already exists
    let subscription = await this.pushSubscriptionRepository.findOne({
      where: { userId, endpoint },
    });

    if (subscription) {
      // Update existing subscription
      subscription.p256dh = p256dh;
      subscription.auth = auth;
      subscription.userAgent = userAgent;
      subscription.isActive = true;
      this.logger.log(`Updated push subscription for user ${userId}`);
    } else {
      // Create new subscription
      subscription = this.pushSubscriptionRepository.create({
        userId,
        endpoint,
        p256dh,
        auth,
        userAgent,
        isActive: true,
      });
      this.logger.log(`Created new push subscription for user ${userId}`);
    }

    return this.pushSubscriptionRepository.save(subscription);
  }

  /**
   * Unsubscribe a user from push notifications
   */
  async unsubscribe(userId: string, unsubscribeDto: UnsubscribeDto): Promise<void> {
    const { endpoint } = unsubscribeDto;

    await this.pushSubscriptionRepository.update(
      { userId, endpoint },
      { isActive: false },
    );

    this.logger.log(`Unsubscribed user ${userId} from endpoint ${endpoint.substring(0, 50)}...`);
  }

  /**
   * Get all active subscriptions for a user
   */
  async getUserSubscriptions(userId: string): Promise<PushSubscription[]> {
    return this.pushSubscriptionRepository.find({
      where: { userId, isActive: true },
    });
  }

  /**
   * Send a push notification to a user
   */
  async sendPushNotification(
    userId: string,
    notification: {
      title: string;
      body: string;
      data?: any;
      icon?: string;
      badge?: string;
      tag?: string;
    },
  ): Promise<{ sent: number; failed: number }> {
    const subscriptions = await this.getUserSubscriptions(userId);

    if (subscriptions.length === 0) {
      this.logger.warn(`No active subscriptions found for user ${userId}`);
      return { sent: 0, failed: 0 };
    }

    const payload = JSON.stringify({
      title: notification.title,
      body: notification.body,
      icon: notification.icon || '/icons/icon-192x192.svg',
      badge: notification.badge || '/icons/icon-72x72.svg',
      data: notification.data || {},
      tag: notification.tag,
    });

    let sent = 0;
    let failed = 0;

    for (const subscription of subscriptions) {
      try {
        await webpush.sendNotification(
          {
            endpoint: subscription.endpoint,
            keys: {
              p256dh: subscription.p256dh,
              auth: subscription.auth,
            },
          },
          payload,
        );
        sent++;
        this.logger.debug(`Sent push notification to user ${userId}`);
      } catch (error) {
        failed++;
        this.logger.error(
          `Failed to send push notification to user ${userId}: ${error.message}`,
        );

        // If subscription is invalid (410 Gone), mark as inactive
        if (error.statusCode === 410) {
          await this.pushSubscriptionRepository.update(
            { id: subscription.id },
            { isActive: false },
          );
          this.logger.log(`Marked invalid subscription as inactive for user ${userId}`);
        }
      }
    }

    return { sent, failed };
  }

  /**
   * Cron job to check for matches starting in ~1 hour and send notifications
   * Runs every 10 minutes
   */
  @Cron(CronExpression.EVERY_10_MINUTES)
  async checkUpcomingMatches(): Promise<void> {
    this.logger.log('Running cron job: checking for upcoming matches');

    const now = new Date();
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour
    const oneHourTenMinutesFromNow = new Date(now.getTime() + 70 * 60 * 1000); // 1 hour 10 min

    // Find matches starting between 1 hour and 1 hour 10 minutes from now
    const upcomingMatches = await this.matchRepository.find({
      where: {
        startDate: MoreThan(oneHourFromNow) && LessThan(oneHourTenMinutesFromNow),
        status: 'PENDING',
      },
      relations: ['club'],
    });

    this.logger.log(`Found ${upcomingMatches.length} matches starting in ~1 hour`);

    for (const match of upcomingMatches) {
      await this.notifyMatchPlayers(match);
    }
  }

  /**
   * Notify all players in a match
   */
  private async notifyMatchPlayers(match: Match): Promise<void> {
    const players = await this.matchPlayerRepository.find({
      where: { matchId: match.matchId },
    });

    this.logger.log(
      `Notifying ${players.length} players for match ${match.matchId}`,
    );

    for (const player of players) {
      // Check if we already sent this notification
      const existingNotification = await this.notificationLogRepository.findOne({
        where: {
          userId: player.userId,
          matchId: match.matchId,
          type: NotificationType.MATCH_STARTING_SOON,
          status: NotificationStatus.SENT,
        },
      });

      if (existingNotification) {
        this.logger.debug(
          `Already sent notification to user ${player.userId} for match ${match.matchId}`,
        );
        continue;
      }

      const startTime = new Date(match.startDate).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      });

      const clubName = (match as any).club?.name || 'your club';

      const title = 'Match Starting Soon!';
      const body = `Your match starts at ${startTime} at ${clubName}`;

      // Create notification log
      const notificationLog = this.notificationLogRepository.create({
        userId: player.userId,
        matchId: match.matchId,
        type: NotificationType.MATCH_STARTING_SOON,
        status: NotificationStatus.PENDING,
        title,
        body,
        data: {
          matchId: match.matchId,
          startDate: match.startDate,
          clubId: match.clubId,
        },
      });

      try {
        // Send the push notification
        const result = await this.sendPushNotification(player.userId, {
          title,
          body,
          data: {
            url: `/match/${match.matchId}`,
            matchId: match.matchId,
          },
          tag: `match-${match.matchId}`,
        });

        if (result.sent > 0) {
          notificationLog.status = NotificationStatus.SENT;
          notificationLog.sentAt = new Date();
        } else {
          notificationLog.status = NotificationStatus.FAILED;
          notificationLog.errorMessage = 'No active subscriptions';
        }
      } catch (error) {
        notificationLog.status = NotificationStatus.FAILED;
        notificationLog.errorMessage = error.message;
        this.logger.error(
          `Failed to notify user ${player.userId} for match ${match.matchId}: ${error.message}`,
        );
      }

      await this.notificationLogRepository.save(notificationLog);
    }
  }

  /**
   * Get notification history for a user
   */
  async getUserNotificationHistory(
    userId: string,
    limit: number = 50,
  ): Promise<NotificationLog[]> {
    return this.notificationLogRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
      relations: ['match'],
    });
  }

  /**
   * Get VAPID public key for frontend
   */
  getPublicVapidKey(): string {
    return process.env.VAPID_PUBLIC_KEY || '';
  }
}
