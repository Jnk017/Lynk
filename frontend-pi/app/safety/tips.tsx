import React from 'react';
import { View } from 'react-native';
import { SafetyCard, SafetyScreen, safetyStyles } from '../../src/components/safety/SafetyScreen';

const tips = [
  ['☀', 'Meet safely', 'Choose a public place, arrange your own transport, and tell someone you trust where you will be.'],
  ['⌁', 'Protect personal information', 'Keep your home address, financial details, passwords, and identity documents private.'],
  ['!', 'Avoid scams', 'Pause if someone requests money, crypto, gift cards, urgent help, or an off-platform investment.'],
  ['✓', 'Verify identities', 'Use Lynk verification indicators and a live video conversation before meeting.'],
  ['♡', 'Healthy communication', 'Notice pressure, isolation, threats, or boundary testing. It is always okay to step away.'],
] as const;
export default function SafetyTipsScreen() { return <SafetyScreen title="Safety Tips" subtitle="Small choices can make every stage of connection safer."><View style={safetyStyles.stack}>{tips.map(([icon,title,description]) => <SafetyCard key={title} icon={icon} title={title} description={description} />)}</View></SafetyScreen>; }
