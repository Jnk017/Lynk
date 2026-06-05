import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../src/services/api';
import { API_ENDPOINTS } from '../../src/constants/api';
import { COLORS, TYPOGRAPHY, GRADIENTS, SPACING } from '../../src/constants/theme';
import { EmptyState, ErrorState, LoadingState } from '../../src/components/premium';
import { ChatParticipant, ChatRoom } from '../../src/types/api';
import { getErrorMessage } from '../../src/utils/errors';

export default function ChatListScreen() {
  const { data: rooms = [], isLoading, isError, error, refetch } = useQuery<ChatRoom[]>({
    queryKey: ['chatRooms'],
    queryFn: () => api.get<ChatRoom[]>(API_ENDPOINTS.chat.rooms),
  });

  const renderRoom = ({ item }: { item: ChatRoom }) => {
    const otherParticipant = item.participants?.find((p: ChatParticipant) => p.user);
    const photo = otherParticipant?.user?.media?.[0]?.url;
    const name = otherParticipant?.user?.displayName || 'Unknown';
    const isOnline = otherParticipant?.user?.isOnline;

    return (
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel={`Open conversation with ${name}`}
        accessibilityHint={item.lastMessagePreview || 'Start the conversation'}
        style={styles.roomItem}
        onPress={() => router.push(`/chat/${item.id}`)}
      >
        <View style={styles.avatarContainer}>
          {photo ? (
            <Image source={{ uri: photo }} style={styles.avatar} />
          ) : (
            <LinearGradient
              colors={GRADIENTS.gold}
              style={styles.avatar}
            >
              <Text style={styles.avatarInitial}>
                {name[0]?.toUpperCase()}
              </Text>
            </LinearGradient>
          )}
          {isOnline && <View style={styles.onlineDot} />}
        </View>

        <View style={styles.roomContent}>
          <View style={styles.roomHeader}>
            <Text style={styles.roomName}>{name}</Text>
            {item.lastMessageAt && (
              <Text style={styles.roomTime}>
                {new Date(item.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            )}
          </View>
          <Text style={styles.lastMessage} numberOfLines={1}>
            {item.lastMessagePreview || 'Start the conversation ✨'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={GRADIENTS.dark} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity accessibilityRole="button" accessibilityLabel="Go back" onPress={() => router.back()}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Messages</Text>
          <View style={{ width: 24 }} />
        </View>

        {isLoading ? (
          <View style={styles.stateWrap}><LoadingState label="Loading your conversations" /></View>
        ) : isError ? (
          <View style={styles.stateWrap}>
            <ErrorState title="Unable to load messages" description={getErrorMessage(error, 'Check your connection and try again.')} onRetry={() => refetch()} />
          </View>
        ) : rooms.length === 0 ? (
          <View style={styles.stateWrap}>
            <EmptyState title="Your conversations will appear here" description="When a connection becomes mutual, start with a thoughtful hello." />
          </View>
        ) : (
          <FlatList
            data={rooms}
            keyExtractor={(item) => item.id}
            renderItem={renderRoom}
            contentContainerStyle={styles.listContent}
          />
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.xl, paddingVertical: SPACING.md },
  backText: { color: COLORS.textSecondary, fontSize: 20 },
  title: { ...TYPOGRAPHY.h3 },
  roomItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.xl, paddingVertical: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.glassBorder },
  avatarInitial: { color: COLORS.background, fontSize: 18, fontWeight: '700' },
  avatarContainer: { position: 'relative', marginRight: SPACING.md },
  avatar: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  onlineDot: { position: 'absolute', bottom: 2, right: 2, width: 12, height: 12, borderRadius: 6, backgroundColor: COLORS.success, borderWidth: 2, borderColor: COLORS.background },
  roomContent: { flex: 1 },
  roomHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  roomName: { ...TYPOGRAPHY.body, fontWeight: '600' },
  roomTime: { ...TYPOGRAPHY.small, color: COLORS.textTertiary },
  lastMessage: { ...TYPOGRAPHY.caption, color: COLORS.textSecondary },
  stateWrap: { flex: 1, justifyContent: 'center', padding: SPACING.xl, width: '100%', maxWidth: 520, alignSelf: 'center' },
  listContent: { paddingBottom: SPACING.xl, width: '100%', maxWidth: 760, alignSelf: 'center' },
});
