import { Reflector } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';
import { RolesGuard } from './roles.guard';
import { UserRole } from '../enums';

function createContext(role?: UserRole): ExecutionContext {
  return {
    getHandler: jest.fn(),
    getClass: jest.fn(),
    switchToHttp: jest.fn(() => ({
      getRequest: jest.fn(() => ({ user: role ? { role } : undefined })),
    })),
  } as unknown as ExecutionContext;
}

describe('RolesGuard', () => {
  it('blocks regular users from admin-only routes', () => {
    const reflector = {
      getAllAndOverride: jest.fn(() => [UserRole.ADMIN, UserRole.SUPER_ADMIN]),
    } as unknown as Reflector;
    const guard = new RolesGuard(reflector);

    expect(guard.canActivate(createContext(UserRole.USER))).toBe(false);
  });

  it('allows super admins to manage protected settings', () => {
    const reflector = {
      getAllAndOverride: jest.fn(() => [UserRole.SUPER_ADMIN]),
    } as unknown as Reflector;
    const guard = new RolesGuard(reflector);

    expect(guard.canActivate(createContext(UserRole.SUPER_ADMIN))).toBe(true);
  });

  it('blocks moderators from super-admin settings routes', () => {
    const reflector = {
      getAllAndOverride: jest.fn(() => [UserRole.SUPER_ADMIN]),
    } as unknown as Reflector;
    const guard = new RolesGuard(reflector);

    expect(guard.canActivate(createContext(UserRole.MODERATOR))).toBe(false);
  });
});
