const PRODUCTION = 'production';
const MIN_SECRET_LENGTH = 32;

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value || value.trim().length === 0) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function requireStrongSecret(name: string): string {
  const value = requireEnv(name);
  if (
    value.length < MIN_SECRET_LENGTH ||
    /change_me|change-me|secret|password/i.test(value)
  ) {
    throw new Error(
      `${name} must be a non-default secret with at least ${MIN_SECRET_LENGTH} characters`,
    );
  }
  return value;
}

export function validateProductionEnv(): void {
  if (process.env.NODE_ENV !== PRODUCTION) return;

  requireStrongSecret('JWT_ACCESS_SECRET');
  requireStrongSecret('JWT_REFRESH_SECRET');
  requireStrongSecret('DB_PASSWORD');
  requireEnv('ALLOWED_ORIGINS');

  if (process.env.DB_SYNCHRONIZE === 'true') {
    throw new Error('DB_SYNCHRONIZE must never be true in production');
  }
}

export function parseAllowedOrigins(): string[] | true {
  const configured = process.env.ALLOWED_ORIGINS?.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (configured?.length) return configured;

  if (process.env.NODE_ENV === PRODUCTION) {
    throw new Error('ALLOWED_ORIGINS is required in production');
  }

  return true;
}
