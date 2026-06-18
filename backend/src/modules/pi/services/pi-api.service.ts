import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PiApiService {
  constructor(private readonly config: ConfigService) {}
  private get baseUrl() {
    return (
      this.config.get<string>('pi.apiBaseUrl') ||
      process.env.PI_API_BASE_URL ||
      'https://api.minepi.com'
    );
  }
  private get apiKey() {
    return this.config.get<string>('pi.apiKey') || process.env.PI_API_KEY || '';
  }
  private headers(extra: Record<string, string> = {}) {
    return {
      Authorization: `Key ${this.apiKey}`,
      'Content-Type': 'application/json',
      ...extra,
    };
  }
  async verifyAccessTokenWithMe(
    accessToken: string,
  ): Promise<{ uid: string; username?: string }> {
    const res = await fetch(`${this.baseUrl}/v2/me`, {
      headers: this.headers({ Authorization: `Bearer ${accessToken}` }),
    });
    if (!res.ok)
      throw new BadRequestException('Pi access token could not be verified');
    return res.json() as Promise<{ uid: string; username?: string }>;
  }
  async approvePayment(paymentId: string): Promise<Record<string, unknown>> {
    return this.post(`/v2/payments/${paymentId}/approve`, {});
  }
  async completePayment(
    paymentId: string,
    txid: string,
  ): Promise<Record<string, unknown>> {
    return this.post(`/v2/payments/${paymentId}/complete`, { txid });
  }
  async getPayment(paymentId: string): Promise<Record<string, unknown>> {
    return this.get(`/v2/payments/${paymentId}`);
  }
  async cancelPayment(paymentId: string): Promise<Record<string, unknown>> {
    return this.post(`/v2/payments/${paymentId}/cancel`, {});
  }
  private async get(path: string): Promise<Record<string, unknown>> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      headers: this.headers(),
    });
    if (!res.ok)
      throw new BadRequestException('Pi Platform API request failed');
    return (await res.json()) as Record<string, unknown>;
  }
  private async post(
    path: string,
    body: unknown,
  ): Promise<Record<string, unknown>> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify(body),
    });
    if (!res.ok)
      throw new BadRequestException('Pi Platform API request failed');
    return (await res.json()) as Record<string, unknown>;
  }
}
