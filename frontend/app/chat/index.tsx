import React, { useEffect, useState } from 'react';
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
import { NeonButton } from '../../src/components/ui/NeonButton';
import { ChatParticipant, ChatRoom } from '../../src/types/api';
import { getErrorMessage } from '../../src/utils/errors';

export default function ChatListScreen() {
  const { data: rooms = [], isLoading, isError, error, refetch, isFetching } = useQuery<ChatRoom[]>({
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
              <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700' }}>
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
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Messages</Text>
          <View style={{ width: 24 }} />
        </View>

        {isLoading ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Loading chats...</Text>
          </View>
        ) : isError ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>⚠️</Text>
            <Text style={styles.emptyTitle}>Unable to load chats</Text>
            <Text style={styles.emptyText}>{getErrorMessage(error, 'Please check your connection and try again.')}</Text>
            <NeonButton label="Retry" onPress={() => refetch()} loading={isFetching} variant="outline" style={{ marginTop: SPACING.md }} />
          </View>
        ) : rooms.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>💬</Text>
            <Text style={styles.emptyTitle}>No messages yet</Text>
            <Text style={styles.emptyText}>When you match with someone, you can chat here.</Text>
          </View>
        ) : (
          <FlatList
            data={rooms}
            keyExtractor={(item) => item.id}
            renderItem={renderRoom}
            contentContainerStyle={{ paddingBottom: SPACING.xl }}
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
  avatarContainer: { position: 'relative', marginRight: SPACING.md },
  avatar: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  onlineDot: { position: 'absolute', bottom: 2, right: 2, width: 12, height: 12, borderRadius: 6, backgroundColor: COLORS.success, borderWidth: 2, borderColor: COLORS.background },
  roomContent: { flex: 1 },
  roomHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  roomName: { ...TYPOGRAPHY.body, fontWeight: '600' },
  roomTime: { ...TYPOGRAPHY.small, color: COLORS.textTertiary },
  lastMessage: { ...TYPOGRAPHY.caption, color: COLORS.textSecondary },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.xl },
  emptyEmoji: { fontSize: 60, marginBottom: SPACING.md },
  emptyTitle: { ...TYPOGRAPHY.h4, marginBottom: SPACING.sm, textAlign: 'center' },
  emptyText: { ...TYPOGRAPHY.bodySecondary, textAlign: 'center', lineHeight: 22 },
});
