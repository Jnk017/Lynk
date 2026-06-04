import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as admin from 'firebase-admin';
import { User } from '../user/entities/user.entity';
import { NotificationType } from '../../common/enums';

interface NotificationPayload {
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, string>;
}

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  private firebaseInitialized = false;

  constructor(
    private configService: ConfigService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {
    this.initFirebase();
  }

  private initFirebase() {
    const projectId = this.configService.get<string>('firebase.projectId');
    if (!projectId || admin.apps.length > 0) return;

    try {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail: this.configService.get<string>('firebase.clientEmail'),
          privateKey: this.configService
            .get<string>('firebase.privateKey')
            ?.replace(/\\n/g, '\n'),
        }),
      });
      this.firebaseInitialized = true;
    } catch {
      this.logger.warn(
        'Firebase initialization failed – push notifications disabled',
      );
    }
  }

  async sendToUser(
    userId: string,
    payload: NotificationPayload,
  ): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user?.fcmToken || !this.firebaseInitialized) return;

    try {
      await admin.messaging().send({
        token: user.fcmToken,
        notification: {
          title: payload.title,
          body: payload.body,
        },
        data: {
          type: payload.type,
          ...payload.data,
        },
        android: { priority: 'high' },
        apns: { payload: { aps: { sound: 'default', badge: 1 } } },
      });
    } catch (error) {
      this.logger.error(
        `Failed to send notification to user ${userId}: ${String(error)}`,
      );
    }
  }

  async sendToMultiple(
    userIds: string[],
    payload: NotificationPayload,
  ): Promise<void> {
    await Promise.allSettled(userIds.map((id) => this.sendToUser(id, payload)));
  }
}
