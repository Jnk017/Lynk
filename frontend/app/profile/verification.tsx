import React from 'react';
import { PlaceholderScreen } from '../../src/components/PlaceholderScreen';

export default function VerificationScreen() {
  return (
    <PlaceholderScreen
      title="Verification & KYC"
      description="Liveness and KYC endpoints exist, but the mobile capture flow is intentionally gated until QA hardening is complete."
      todo="Add guided camera capture, upload progress, and review status."
    />
  );
}
