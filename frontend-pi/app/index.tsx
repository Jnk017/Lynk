import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../src/providers/AuthProvider';
import { COLORS } from '../src/constants/theme';

export default function Index() {
  const { isAuthenticated, isLoading, user } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        if (!user?.isProfileComplete) {
          router.replace('/auth/onboarding');
        } else {
          router.replace('/home');
        }
      } else {
        router.replace('/auth/welcome');
      }
    }
  }, [isLoading, isAuthenticated, user]);

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator size="large" color={COLORS.primaryViolet} />
    </View>
  );
}
