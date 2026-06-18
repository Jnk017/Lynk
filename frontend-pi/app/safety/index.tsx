import React, { useEffect } from 'react';
import { Linking, View } from 'react-native';
import { router } from 'expo-router';
import { SafetyCard, SafetyScreen, safetyStyles } from '../../src/components/safety/SafetyScreen';
import { useAuth } from '../../src/providers/AuthProvider';
import { trackFrontendEvent } from '../../src/services/observability';

export default function SafetyCenterScreen() {
  const { user } = useAuth();
  useEffect(() => { if (user) void trackFrontendEvent('safety_center_opened', user.id); }, [user]);
  return <SafetyScreen title="Safety Center" subtitle="Clear tools and practical guidance for safer, more respectful connections."><View style={safetyStyles.stack}>
    <SafetyCard icon="◇" title="Community Guidelines" description="The shared standards that keep Lynk respectful and authentic." onPress={() => router.push('/safety/guidelines')} />
    <SafetyCard icon="!" title="My Reports" description="View reports you submitted and their current status." onPress={() => router.push('/safety/reports')} />
    <SafetyCard icon="⊘" title="Blocked Members" description="Review or unblock members you chose not to interact with." onPress={() => router.push('/safety/blocked')} />
    <SafetyCard icon="✓" title="Verification" description="Learn how identity and profile verification strengthen trust." onPress={() => router.push('/profile/verification')} />
    <SafetyCard icon="♡" title="Safety Tips" description="Short, practical tips for online conversations and in-person meetings." onPress={() => router.push('/safety/tips')} />
    <SafetyCard icon="✦" title="Contact Support" description="Need help beyond a report? Contact the Lynk support team." onPress={() => void Linking.openURL('mailto:safety@lynk.app?subject=Lynk%20Safety%20Support')} />
  </View></SafetyScreen>;
}
