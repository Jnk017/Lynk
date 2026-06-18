import React from 'react';
import { PlaceholderScreen } from '../../src/components/PlaceholderScreen';

export default function PiAuthScreen() {
  return (
    <PlaceholderScreen
      title="Pi Network Login"
      description="Pi authentication exists on the backend. The mobile SDK handoff will be completed after provider QA."
      todo="Integrate the Pi SDK and call /auth/pi with the returned access token."
    />
  );
}
