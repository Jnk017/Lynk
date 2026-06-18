export enum AppChannel {
  PI_ECOSYSTEM = 'PI_ECOSYSTEM',
  GLOBAL = 'GLOBAL',
}

export type LynkChannelHeader = 'pi' | 'global';

export function mapHeaderToAppChannel(value?: string): AppChannel | undefined {
  if (!value) return undefined;
  const normalized = value.trim().toLowerCase();
  if (normalized === 'pi') return AppChannel.PI_ECOSYSTEM;
  if (normalized === 'global') return AppChannel.GLOBAL;
  return undefined;
}
