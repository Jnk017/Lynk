import React from 'react';
import { PlaceholderScreen } from '../../src/components/PlaceholderScreen';

export default function ReportHistoryScreen() {
  return <PlaceholderScreen title="Safety history" description="Review the status of concerns you have shared with Lynk." todo="No safety reports are available for this account." premiumPoints={['Status is never communicated by color alone', 'Plain-language review stages', 'Support escalation path']} />;
}
