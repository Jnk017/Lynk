import Constants from 'expo-constants';

export type LynkAppChannel = 'global' | 'pi';

const configuredChannel = Constants.expoConfig?.extra?.appChannel;

export const APP_CHANNEL: LynkAppChannel =
  configuredChannel === 'pi' ? 'pi' : 'global';
