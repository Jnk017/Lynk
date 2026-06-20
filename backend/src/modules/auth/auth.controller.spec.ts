import { ForbiddenException } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AppChannel } from '../../common/enums';

function buildController() {
  const loginWithPi = jest.fn();
  const service = {
    register: jest.fn(),
    login: jest.fn(),
    loginWithPi,
    refreshTokens: jest.fn(),
    logout: jest.fn(),
    logoutAllDevices: jest.fn(),
    listSessions: jest.fn(),
    revokeSession: jest.fn(),
  } as unknown as AuthService;

  return { controller: new AuthController(service), loginWithPi };
}

describe('AuthController Pi auth channel enforcement', () => {
  it('rejects Pi auth when request channel is GLOBAL', () => {
    const { controller, loginWithPi } = buildController();

    expect(() =>
      controller.loginWithPi(
        { uid: 'pi-user-1', accessToken: 'token' },
        'jest',
        '127.0.0.1',
        AppChannel.GLOBAL,
      ),
    ).toThrow(ForbiddenException);
    expect(loginWithPi).not.toHaveBeenCalled();
  });

  it('accepts Pi auth when request channel is PI_ECOSYSTEM', () => {
    const { controller, loginWithPi } = buildController();
    loginWithPi.mockReturnValue({ ok: true });

    expect(
      controller.loginWithPi(
        { uid: 'pi-user-1', accessToken: 'token' },
        'jest',
        '127.0.0.1',
        AppChannel.PI_ECOSYSTEM,
      ),
    ).toEqual({ ok: true });
    expect(loginWithPi).toHaveBeenCalledWith(
      { uid: 'pi-user-1', accessToken: 'token' },
      { deviceId: undefined, userAgent: 'jest', ipAddress: '127.0.0.1' },
    );
  });
});
