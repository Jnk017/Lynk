export type AdminPaymentMonitoringSignal = {
  id: string;
  category: 'transaction' | 'provider' | 'wallet' | 'risk';
  severity: 'info' | 'warning' | 'critical';
  description: string;
};

export const ADMIN_PAYMENT_MONITORING_SIGNALS = [
  {
    id: 'pending-payment-aging',
    category: 'transaction',
    severity: 'warning',
    description: 'Payment remains pending longer than the provider SLA.',
  },
  {
    id: 'failed-payment-spike',
    category: 'provider',
    severity: 'warning',
    description:
      'Provider failure rate rises above the configured threshold.',
  },
  {
    id: 'wallet-balance-mismatch',
    category: 'wallet',
    severity: 'critical',
    description:
      'Visible wallet balance diverges from reconciled transaction state.',
  },
  {
    id: 'duplicate-payment-reference',
    category: 'risk',
    severity: 'critical',
    description:
      'Multiple completed payments share the same external reference.',
  },
  {
    id: 'velocity-limit-breach',
    category: 'risk',
    severity: 'warning',
    description:
      'A user or device attempts too many payment operations in a short period.',
  },
] satisfies AdminPaymentMonitoringSignal[];
