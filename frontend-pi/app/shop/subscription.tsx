import React from 'react';
import { PlaceholderScreen } from '../../src/components/PlaceholderScreen';

export default function SubscriptionShopScreen() {
  return (
    <PlaceholderScreen
      title="Subscription & Plans"
      description="Subscription plans are seeded by the backend. Checkout integration will be enabled after payment QA."
      todo="Fetch /subscription/plans and connect verified payment activation."
    />
  );
}
