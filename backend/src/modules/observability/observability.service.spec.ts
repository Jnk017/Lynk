import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { ObservabilityEventName } from './observability-events';
import { ObservabilityService } from './observability.service';

jest.mock('axios');

const mockedAxios = axios as jest.Mocked<typeof axios>;
// eslint-disable-next-line @typescript-eslint/unbound-method
const postMock = mockedAxios.post;

function config(values: Record<string, string | undefined>): ConfigService {
  return {
    get: jest.fn((key: string) => values[key]),
  } as unknown as ConfigService;
}

describe('ObservabilityService', () => {
  beforeEach(() => {
    postMock.mockReset();
  });

  it('does not send PostHog events when no api key is configured', async () => {
    const service = new ObservabilityService(config({}));

    await service.track(ObservabilityEventName.USER_REGISTERED, 'user_1');

    expect(postMock).not.toHaveBeenCalled();
  });

  it('scrubs sensitive event properties before sending to PostHog', async () => {
    postMock.mockResolvedValueOnce({ data: {} });
    const service = new ObservabilityService(
      config({
        'posthog.apiKey': 'ph_test',
        'posthog.host': 'https://posthog.example',
      }),
    );

    await service.track(ObservabilityEventName.PAYMENT_CREATED, 'user_1', {
      provider: 'pawapay',
      refreshToken: 'secret',
      apiSecret: 'hidden',
      password: 'hidden',
    });

    expect(postMock).toHaveBeenCalledWith(
      'https://posthog.example/capture/',
      expect.objectContaining({
        api_key: 'ph_test',
        event: ObservabilityEventName.PAYMENT_CREATED,
        distinct_id: 'user_1',
        properties: { provider: 'pawapay' },
      }),
      { timeout: 1500 },
    );
  });

  it('normalizes a trailing PostHog host slash', async () => {
    postMock.mockResolvedValueOnce({ data: {} });
    const service = new ObservabilityService(
      config({
        'posthog.apiKey': 'ph_test',
        'posthog.host': 'https://posthog.example/',
      }),
    );

    await service.track(ObservabilityEventName.LOGIN_COMPLETED, 'user_1');

    expect(postMock).toHaveBeenCalledWith(
      'https://posthog.example/capture/',
      expect.any(Object),
      { timeout: 1500 },
    );
  });
});
