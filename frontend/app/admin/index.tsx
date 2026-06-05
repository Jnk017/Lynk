import React from 'react';
import { PlaceholderScreen } from '../../src/components/PlaceholderScreen';

export default function AdminMvpScreen() {
  return <PlaceholderScreen title="Trust operations" description="A focused workspace for authorized Lynk safety and community operations." todo="Admin access is restricted to approved team members." premiumPoints={['Role-gated access', 'Readable review queues', 'Auditable moderation actions']} />;
}
