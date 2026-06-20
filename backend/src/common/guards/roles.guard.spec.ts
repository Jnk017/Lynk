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

function createGuard(requiredRoles?: UserRole[]) {
  const reflector = {
    getAllAndOverride: jest.fn(() => requiredRoles),
  } as unknown as Reflector;
  return new RolesGuard(reflector);
}

describe('RolesGuard', () => {
  it('allows routes without role metadata', () => {
    const guard = createGuard(undefined);

    expect(guard.canActivate(createContext())).toBe(true);
  });

  it('blocks unauthenticated requests from admin-only routes', () => {
    const guard = createGuard([UserRole.ADMIN, UserRole.SUPER_ADMIN]);

    expect(guard.canActivate(createContext())).toBe(false);
  });

  it('blocks regular users from admin-only routes', () => {
    const guard = createGuard([UserRole.ADMIN, UserRole.SUPER_ADMIN]);

    expect(guard.canActivate(createContext(UserRole.USER))).toBe(false);
  });

  it('allows admins on admin-only routes', () => {
    const guard = createGuard([UserRole.ADMIN, UserRole.SUPER_ADMIN]);

    expect(guard.canActivate(createContext(UserRole.ADMIN))).toBe(true);
  });

  it('allows super admins to manage protected settings', () => {
    const guard = createGuard([UserRole.SUPER_ADMIN]);

    expect(guard.canActivate(createContext(UserRole.SUPER_ADMIN))).toBe(true);
  });

  it('blocks moderators from super-admin settings routes', () => {
    const guard = createGuard([UserRole.SUPER_ADMIN]);

    expect(guard.canActivate(createContext(UserRole.MODERATOR))).toBe(false);
  });
});
