import React from 'react';
import { Text, View } from 'react-native';
import { SafetyCard, SafetyScreen, safetyStyles } from '../../src/components/safety/SafetyScreen';

const guidelines = [
  ['♡', 'Respect', 'Treat every member with dignity, even when interest is not mutual.'],
  ['✓', 'Authenticity', 'Use accurate photos and information that honestly represent who you are.'],
  ['◇', 'Consent', 'Respect boundaries. A match or message never replaces clear, ongoing consent.'],
  ['!', 'No harassment', 'Repeated pressure, threats, hateful conduct, and unwanted sexual attention are not welcome.'],
  ['⌁', 'No scams', 'Never seek money, financial credentials, gift cards, or investments from members.'],
  ['◎', 'No impersonation', 'Do not pretend to be another person or misrepresent an affiliation.'],
  ['⊘', 'No abusive behavior', 'Intimidation, coercion, exploitation, and offline abuse may lead to account action.'],
] as const;
export default function GuidelinesScreen() {
  return <SafetyScreen title="Community Guidelines" subtitle="Serious relationships begin with shared standards."><Text style={safetyStyles.body}>We review context fairly and prioritize education where appropriate. Serious or repeated harm may require stronger action.</Text><View style={safetyStyles.stack}>{guidelines.map(([icon,title,description]) => <SafetyCard key={title} icon={icon} title={title} description={description} />)}</View></SafetyScreen>;
}
