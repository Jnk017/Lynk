import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { ObservabilityEventName } from './observability-events';
import { ObservabilityService } from './observability.service';

jest.mock('axios');

const mockedAxios = axios as jest.Mocked<typeof axios>;
// eslint-disable-next-line @typescript-eslint/unbound-method
const postMock = mockedAxios.post;

describe('ObservabilityService', () => {
  it('does not send PostHog events when no api key is configured', async () => {
    const service = new ObservabilityService({
      get: jest.fn(),
    } as unknown as ConfigService);

    await service.track(ObservabilityEventName.USER_REGISTERED, 'user_1');

    expect(postMock).not.toHaveBeenCalled();
  });

  it('scrubs sensitive event properties before sending to PostHog', async () => {
    postMock.mockResolvedValueOnce({ data: {} });
    const service = new ObservabilityService({
      get: jest.fn((key: string) => {
        if (key === 'posthog.apiKey') return 'ph_test';
        if (key === 'posthog.host') return 'https://posthog.example';
        return undefined;
      }),
    } as unknown as ConfigService);

    await service.track(ObservabilityEventName.PAYMENT_CREATED, 'user_1', {
      provider: 'stripe',
      refreshToken: 'secret',
    });

    expect(postMock).toHaveBeenCalledWith(
      'https://posthog.example/capture/',
      expect.objectContaining({
        properties: { provider: 'stripe' },
      }),
      { timeout: 1500 },
    );
  });
});
