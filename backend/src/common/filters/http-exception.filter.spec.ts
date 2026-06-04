import { ArgumentsHost, InternalServerErrorException } from '@nestjs/common';
import { HttpExceptionFilter } from './http-exception.filter';

describe('HttpExceptionFilter', () => {
  const originalNodeEnv = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
  });

  it('does not leak stack traces in production error responses', () => {
    process.env.NODE_ENV = 'production';
    const json = jest.fn<void, [unknown]>();
    const status = jest.fn<{ json: typeof json }, [number]>().mockReturnValue({
      json,
    });
    const host = {
      switchToHttp: () => ({
        getResponse: () => ({ status }),
        getRequest: () => ({
          method: 'GET',
          originalUrl: '/api/v1/test',
          path: '/api/v1/test',
          requestId: 'req_123',
        }),
      }),
    } as ArgumentsHost;

    new HttpExceptionFilter().catch(
      new InternalServerErrorException('boom'),
      host,
    );

    expect(status).toHaveBeenCalledWith(500);
    const responseBody = json.mock.calls[0]?.[0] as {
      requestId?: string;
      stack?: string;
    };
    expect(responseBody.stack).toBeUndefined();
    expect(responseBody.requestId).toBe('req_123');
  });
});
