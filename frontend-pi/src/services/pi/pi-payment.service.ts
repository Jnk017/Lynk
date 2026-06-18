import { lynkApi } from '../api/client';
import { createPiPayment } from './pi-sdk.service';

export type PiProductType = 'PREMIUM' | 'BOOST' | 'GIFT' | 'PROFILE_VISIBILITY';

export function payWithPi(amount: number, productId: string, productType: PiProductType) {
  return createPiPayment({ amount, memo: 'Lynk purchase', metadata: { productId, productType, channel: 'pi' } }, {
    onReadyForServerApproval: (paymentId) => { void lynkApi('/payments/pi/approve', { method: 'POST', body: JSON.stringify({ paymentId, productId, productType }) }); },
    onReadyForServerCompletion: (paymentId, txid) => { void lynkApi('/payments/pi/complete', { method: 'POST', body: JSON.stringify({ paymentId, txid }) }); },
    onCancel: (paymentId) => { void lynkApi('/payments/pi/cancel', { method: 'POST', body: JSON.stringify({ paymentId }) }); },
    onError: (error, payment) => { void lynkApi('/payments/pi/error', { method: 'POST', body: JSON.stringify({ paymentId: String((payment as { identifier?: string })?.identifier || ''), errorMessage: String(error) }) }); },
  });
}
