import React, { useEffect, useRef } from 'react';
import {
  ActivityIndicator,
  Animated,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../../design-system';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'premiumGold';
type CardVariant = 'profile' | 'match' | 'marriage' | 'subscription' | 'founder' | 'reward' | 'gift' | 'chat' | 'default';
type StatusTone = 'gold' | 'purple' | 'success' | 'warning' | 'danger' | 'neutral';

const toneColor: Record<StatusTone, string> = {
  gold: theme.colors.primaryGold,
  purple: theme.colors.secondaryPurple,
  success: theme.colors.success,
  warning: theme.colors.warning,
  danger: theme.colors.danger,
  neutral: theme.colors.textSecondary,
};

export interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  loading,
  disabled,
  style,
  accessibilityLabel,
  accessibilityHint,
}: ButtonProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const isOutline = variant === 'outline' || variant === 'ghost';
  const colors = getButtonGradient(variant);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: Boolean(disabled), busy: Boolean(loading) }}
      disabled={disabled || loading}
      onPress={onPress}
      onPressIn={() => Animated.spring(scale, { toValue: theme.animations.scale.pressed, useNativeDriver: true }).start()}
      onPressOut={() => Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start()}
    >
      <Animated.View style={[styles.buttonShell, !isOutline && styles.buttonShadow, { opacity: disabled ? 0.48 : 1, transform: [{ scale }] }, style]}>
        <LinearGradient colors={colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.button, isOutline && styles.outlineButton]}>
          {loading ? <ActivityIndicator color={variant === 'premiumGold' ? theme.colors.premiumDarkPurple : theme.colors.white} /> : <Text style={[styles.buttonLabel, variant === 'premiumGold' && styles.goldButtonLabel]}>{label}</Text>}
        </LinearGradient>
      </Animated.View>
    </Pressable>
  );
}

function getButtonGradient(variant: ButtonVariant): [string, string, ...string[]] {
  switch (variant) {
    case 'premiumGold': return [...theme.gradients.lynkGoldPremium];
    case 'secondary': return [theme.colors.secondaryPurple, theme.colors.premiumDarkPurple];
    case 'danger': return [theme.colors.danger, theme.colors.dangerDeep];
    case 'outline':
    case 'ghost': return ['transparent', 'transparent'];
    case 'primary':
    default: return [...theme.gradients.lynkGoldPurpleHybrid];
  }
}

export interface CardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

export function Card({ children, variant = 'default', style, accessibilityLabel }: CardProps) {
  const gradient = variant === 'founder' ? theme.gradients.lynkFounderGradient : variant === 'subscription' ? theme.gradients.lynkPlatinumGradient : theme.gradients.glassCard;
  return (
    <LinearGradient
      accessibilityRole="summary"
      accessibilityLabel={accessibilityLabel}
      colors={gradient}
      style={[styles.card, variant === 'founder' || variant === 'subscription' ? styles.lightCard : undefined, style]}
    >
      {children}
    </LinearGradient>
  );
}

export const ProfileCard = (props: CardProps) => <Card {...props} variant="profile" />;
export const MatchCard = (props: CardProps) => <Card {...props} variant="match" />;
export const MarriageCard = (props: CardProps) => <Card {...props} variant="marriage" />;
export const SubscriptionCard = (props: CardProps) => <Card {...props} variant="subscription" />;
export const FounderCard = (props: CardProps) => <Card {...props} variant="founder" />;
export const RewardCard = (props: CardProps) => <Card {...props} variant="reward" />;
export const GiftCard = (props: CardProps) => <Card {...props} variant="gift" />;
export const ChatCard = (props: CardProps) => <Card {...props} variant="chat" />;

export function Avatar({ label, size = 56 }: { label: string; size?: number }) {
  return (
    <LinearGradient accessibilityLabel={`${label} profile photo`} colors={theme.gradients.lynkGoldPremium} style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}> 
      <Text style={[styles.avatarText, { fontSize: Math.max(14, size * 0.38) }]}>{label.slice(0, 1).toUpperCase()}</Text>
    </LinearGradient>
  );
}

export function Badge({ label, tone = 'gold' }: { label: string; tone?: StatusTone }) {
  return <View accessibilityRole="text" style={[styles.badge, { borderColor: toneColor[tone] }]}><Text style={[styles.badgeText, { color: toneColor[tone] }]}>{label}</Text></View>;
}

export const Chip = Badge;
export const Tag = Badge;

export function TextField({ label, error, style, accessibilityLabel, ...props }: TextInputProps & { label: string; error?: string }) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        {...props}
        accessibilityLabel={accessibilityLabel ?? label}
        accessibilityHint={props.placeholder}
        placeholderTextColor={theme.colors.textTertiary}
        style={[styles.textField, style]}
      />
      {error ? <Text accessibilityRole="alert" style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

export function SearchField(props: TextInputProps) {
  return <TextField label="Search" accessibilityLabel="Search Lynk" placeholder="Search meaningful connections" {...props} />;
}

export function BottomSheet({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View accessibilityViewIsModal style={[styles.bottomSheet, style]}>{children}</View>;
}

export function Toast({ message, tone = 'gold' }: { message: string; tone?: StatusTone }) {
  return <View accessibilityRole="alert" style={[styles.toast, { borderColor: toneColor[tone] }]}><Text style={styles.toastText}>{message}</Text></View>;
}

export function Divider() { return <View accessibilityRole="none" style={styles.divider} />; }

export function ProgressBar({ progress, label }: { progress: number; label?: string }) {
  const width = `${Math.max(0, Math.min(100, progress * 100))}%` as const;
  return <View accessibilityRole="progressbar" accessibilityLabel={label} accessibilityValue={{ min: 0, max: 100, now: Math.round(progress * 100) }} style={styles.progressTrack}><View style={[styles.progressFill, { width }]} /></View>;
}

export function LoadingState({ label = 'Preparing your premium Lynk experience' }: { label?: string }) {
  return <StateShell icon="✦" title={label} description="This should only take a moment." loading />;
}

export function ErrorState({ title = 'Something went wrong', description = 'We could not load this experience.', onRetry }: { title?: string; description?: string; onRetry?: () => void }) {
  return <StateShell icon="!" title={title} description={description} actionLabel="Try again" onAction={onRetry} />;
}

export function EmptyState({ title = 'No connections yet', description = 'Meaningful relationships start with one intentional hello.' }: { title?: string; description?: string }) {
  return <StateShell icon="♡" title={title} description={description} />;
}

export function SkeletonLoader() {
  return <View accessibilityLabel="Loading content" style={styles.skeleton}><View style={styles.skeletonLine} /><View style={[styles.skeletonLine, styles.skeletonShort]} /></View>;
}

function StateShell({ icon, title, description, actionLabel, onAction, loading }: { icon: string; title: string; description: string; actionLabel?: string; onAction?: () => void; loading?: boolean }) {
  return <Card style={styles.stateShell}><Text style={styles.stateIcon}>{icon}</Text><Text style={styles.stateTitle}>{title}</Text><Text style={styles.stateDescription}>{description}</Text>{loading ? <ActivityIndicator color={theme.colors.primaryGold} /> : null}{actionLabel && onAction ? <Button label={actionLabel} variant="outline" onPress={onAction} /> : null}</Card>;
}

export function Entrance({ children }: { children: React.ReactNode }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(12)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: theme.animations.duration.slow, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: theme.animations.duration.slow, useNativeDriver: true }),
    ]).start();
  }, [opacity, translateY]);
  return <Animated.View style={{ opacity, transform: [{ translateY }] }}>{children}</Animated.View>;
}

const styles = StyleSheet.create({
  buttonShell: { borderRadius: theme.radius.full, overflow: 'hidden', minHeight: 52 },
  buttonShadow: theme.shadows.premium,
  button: { minHeight: 52, alignItems: 'center', justifyContent: 'center', paddingHorizontal: theme.spacing[24], borderRadius: theme.radius.full, borderWidth: 1, borderColor: theme.colors.border },
  outlineButton: { borderColor: theme.colors.primaryGold, backgroundColor: 'transparent' },
  buttonLabel: { ...theme.typography.label, color: theme.colors.white, textTransform: 'uppercase' },
  goldButtonLabel: { color: theme.colors.premiumDarkPurple },
  card: { borderRadius: theme.radius.xl, borderWidth: 1, borderColor: theme.colors.border, padding: theme.spacing[16], ...theme.shadows.medium },
  lightCard: { borderColor: theme.colors.lightGold },
  avatar: { alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: theme.colors.lightGold },
  avatarText: { color: theme.colors.premiumDarkPurple, fontWeight: '700' },
  badge: { alignSelf: 'flex-start', borderWidth: 1, borderRadius: theme.radius.full, paddingHorizontal: theme.spacing[12], paddingVertical: theme.spacing[4], backgroundColor: theme.colors.surfaceSoft },
  badgeText: { ...theme.typography.caption, fontWeight: '700' },
  fieldWrap: { gap: theme.spacing[8] },
  fieldLabel: { ...theme.typography.label, color: theme.colors.textSecondary, textTransform: 'uppercase' },
  textField: { minHeight: 52, borderRadius: theme.radius.lg, borderWidth: 1, borderColor: theme.colors.border, paddingHorizontal: theme.spacing[16], color: theme.colors.textPrimary, backgroundColor: theme.colors.surfaceSoft, fontSize: theme.typography.bodyMedium.fontSize },
  errorText: { ...theme.typography.caption, color: theme.colors.danger },
  bottomSheet: { borderTopLeftRadius: theme.radius.xxl, borderTopRightRadius: theme.radius.xxl, backgroundColor: theme.colors.backgroundElevated, padding: theme.spacing[24], borderWidth: 1, borderColor: theme.colors.border },
  toast: { borderRadius: theme.radius.lg, borderWidth: 1, padding: theme.spacing[12], backgroundColor: theme.colors.surfaceStrong },
  toastText: { ...theme.typography.bodySmall, color: theme.colors.textPrimary },
  divider: { height: 1, backgroundColor: theme.colors.borderSubtle, marginVertical: theme.spacing[12] },
  progressTrack: { height: 8, borderRadius: theme.radius.full, backgroundColor: theme.colors.surfaceSoft, overflow: 'hidden' },
  progressFill: { height: 8, borderRadius: theme.radius.full, backgroundColor: theme.colors.primaryGold },
  stateShell: { alignItems: 'center', gap: theme.spacing[12] },
  stateIcon: { fontSize: 36, color: theme.colors.primaryGold },
  stateTitle: { ...theme.typography.headingM, color: theme.colors.textPrimary, textAlign: 'center' },
  stateDescription: { ...theme.typography.bodySmall, color: theme.colors.textSecondary, textAlign: 'center' },
  skeleton: { borderRadius: theme.radius.lg, padding: theme.spacing[16], backgroundColor: theme.colors.surfaceSoft, gap: theme.spacing[8] },
  skeletonLine: { height: 16, borderRadius: theme.radius.full, backgroundColor: theme.colors.borderSubtle },
  skeletonShort: { width: '62%' },
});
