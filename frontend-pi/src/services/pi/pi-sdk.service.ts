import { lynkApi } from '../api/client';

export type PiAuthScope = 'username' | 'payments';
export interface PiUser { uid: string; username: string }
export interface PiAuthResult { user: PiUser; accessToken: string }
export interface PiPaymentCallbacks {
  onReadyForServerApproval: (paymentId: string) => void;
  onReadyForServerCompletion: (paymentId: string, txid: string) => void;
  onCancel: (paymentId: string) => void;
  onError: (error: unknown, payment?: unknown) => void;
}

declare global { interface Window { Pi?: { init: (config: { version: '2.0'; sandbox: boolean }) => void; authenticate: (scopes: PiAuthScope[], onIncompletePaymentFound: (payment: unknown) => void) => Promise<PiAuthResult>; createPayment: (paymentData: unknown, callbacks: PiPaymentCallbacks) => void; }; } }

export async function waitForPiSdk(timeoutMs = 10000) {
  const started = Date.now();
  while (typeof window !== 'undefined' && !window.Pi && Date.now() - started < timeoutMs) await new Promise((resolve) => setTimeout(resolve, 100));
  if (!window.Pi) throw new Error('Pi SDK unavailable');
  return window.Pi;
}

export async function initPiSdk() { const pi = await waitForPiSdk(); pi.init({ version: '2.0', sandbox: false }); return pi; }
export async function handleIncompletePayment(payment: unknown) { return lynkApi('/payments/pi/incomplete', { method: 'POST', body: JSON.stringify({ payment }) }); }
export async function authenticateWithPi() { const pi = await initPiSdk(); const result = await pi.authenticate(['username', 'payments'], handleIncompletePayment); return lynkApi('/auth/pi/login', { method: 'POST', body: JSON.stringify({ uid: result.user.uid, username: result.user.username, accessToken: result.accessToken }) }); }
export async function createPiPayment(paymentData: unknown, callbacks: PiPaymentCallbacks) { const pi = await initPiSdk(); return pi.createPayment(paymentData, callbacks); }
