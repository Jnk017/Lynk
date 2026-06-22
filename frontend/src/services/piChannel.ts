import { APP_CHANNEL } from '../constants/channel';

export function assertPiChannel(): void {
  if (APP_CHANNEL !== 'pi') {
    throw new Error('This feature is only allowed in the Pi frontend');
  }
}
