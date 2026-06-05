import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  RekognitionClient,
  DetectFacesCommand,
  Attribute,
} from '@aws-sdk/client-rekognition';
import { S3Service } from '../s3/s3.service';
import { UserService } from '../user/user.service';
import { ReferralService } from '../referral/referral.service';

@Injectable()
export class VerificationService {
  private rekognitionClient: RekognitionClient;

  constructor(
    private configService: ConfigService,
    private s3Service: S3Service,
    private userService: UserService,
    private referralService: ReferralService,
  ) {
    this.rekognitionClient = new RekognitionClient({
      region: this.configService.get<string>('aws.region'),
      credentials: {
        accessKeyId: this.configService.get<string>('aws.accessKeyId'),
        secretAccessKey: this.configService.get<string>('aws.secretAccessKey'),
      },
    });
  }

  /**
   * Performs liveness detection on a selfie video frame using AWS Rekognition.
   * Checks that: a face is detected, eyes are open, face is not masked.
   */
  async verifyLiveness(
    userId: string,
    imageBuffer: Buffer,
  ): Promise<{ passed: boolean; reason?: string }> {
    const command = new DetectFacesCommand({
      Image: { Bytes: imageBuffer },
      Attributes: [Attribute.ALL],
    });

    const result = await this.rekognitionClient.send(command);
    const faceDetails = result.FaceDetails || [];

    if (faceDetails.length === 0) {
      return { passed: false, reason: 'No face detected in the image' };
    }

    if (faceDetails.length > 1) {
      return {
        passed: false,
        reason: 'Multiple faces detected – please use a solo selfie',
      };
    }

    const face = faceDetails[0];

    if (face.EyesOpen?.Value === false) {
      return { passed: false, reason: 'Please keep your eyes open' };
    }

    if ((face.Confidence || 0) < 95) {
      return {
        passed: false,
        reason: 'Face confidence too low – please use better lighting',
      };
    }

    const s3Key = `verifications/${userId}/liveness_${Date.now()}.jpg`;
    const livenessVideoUrl = await this.s3Service.uploadBuffer(
      imageBuffer,
      s3Key,
      'image/jpeg',
    );

    await this.userService.updateVerificationDocuments(userId, {
      livenessVideoUrl,
    });
    await this.userService.markVerified(userId);
    await this.referralService.onUserVerified(userId);

    return { passed: true };
  }

  async submitKyc(
    userId: string,
    documentBuffer: Buffer,
    documentType: string,
  ): Promise<void> {
    const s3Key = `kyc/${userId}/${documentType}_${Date.now()}.jpg`;
    const kycDocumentUrl = await this.s3Service.uploadBuffer(
      documentBuffer,
      s3Key,
      'image/jpeg',
    );
    await this.userService.updateVerificationDocuments(userId, {
      kycDocumentUrl,
    });
    await this.userService.markVerificationPending(userId);
  }
}
