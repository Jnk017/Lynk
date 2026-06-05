import React from 'react';
import { PlaceholderScreen } from '../../src/components/PlaceholderScreen';

export default function ReportUserScreen() {
  return <PlaceholderScreen title="Report a concern" description="Your safety matters. Reports are private and reviewed with care." todo="Reporting becomes available from a member profile or conversation." premiumPoints={['Private by default', 'Clear reason selection', 'Review and follow-up status']} />;
}
