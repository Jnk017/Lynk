import { APP_CHANNEL } from '../constants/channel';

interface PiRuntimeClient {
  createPayment: unknown;
}

export function getPiRuntime(): PiRuntimeClient | undefined {
  const runtime = globalThis as typeof globalThis & { Pi?: PiRuntimeClient };
  return runtime.Pi;
}

export function assertPiRuntimeAvailable(): PiRuntimeClient {
  if (APP_CHANNEL !== 'pi') {
    throw new Error('Pi runtime is only allowed in the Pi frontend');
  }

  const pi = getPiRuntime();
  if (!pi) {
    throw new Error('Pi runtime is not available');
  }

  return pi;
}
