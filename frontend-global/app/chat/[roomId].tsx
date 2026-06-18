import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { io, Socket } from 'socket.io-client';
import * as SecureStore from 'expo-secure-store';
import { api } from '../../src/services/api';
import { API_ENDPOINTS } from '../../src/constants/api';
import { WS_URL } from '../../src/constants/api';
import { COLORS, TYPOGRAPHY, GRADIENTS, SPACING } from '../../src/constants/theme';
import { GlassCard } from '../../src/components/ui/GlassCard';
import { NeonButton } from '../../src/components/ui/NeonButton';
import { useAuth } from '../../src/providers/AuthProvider';
import { ChatMessage } from '../../src/types/api';
import { getErrorMessage } from '../../src/utils/errors';
import { safetyService } from '../../src/services/safety';
import { trackFrontendEvent } from '../../src/services/observability';

export default function ChatRoomScreen() {
  const { roomId, targetUserId, targetName } = useLocalSearchParams<{ roomId: string; targetUserId?: string; targetName?: string }>();
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [socketError, setSocketError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const flatListRef = useRef<FlatList>(null);

  const {
    data: initialMessages = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery<ChatMessage[]>({
    queryKey: ['messages', roomId],
    queryFn: () => api.get<ChatMessage[]>(API_ENDPOINTS.chat.messages(roomId!)),
    enabled: !!roomId,
  });

  useEffect(() => {
    if (initialMessages.length) {
      setMessages([...initialMessages].reverse());
    }
  }, [initialMessages]);

  useEffect(() => {
    const connectSocket = async () => {
      const token = await SecureStore.getItemAsync('lynk_access_token');
      if (!token || !roomId) return;

      const socket = io(`${WS_URL}/chat`, {
        auth: { token },
        transports: ['websocket'],
      });

      socket.on('connect', () => setSocketError(null));
      socket.on('connect_error', () => setSocketError('Unable to connect to chat. Messages may be delayed.'));
      socket.on('disconnect', () => setSocketError('Chat connection lost. Reconnecting...'));

      socket.on('message:new', (msg: ChatMessage) => {
        if (msg.chatRoomId === roomId) {
          setMessages((prev) => [...prev, msg]);
        }
      });

      socket.on('typing:start', ({ userId }: { userId: string }) => {
        if (userId !== user?.id) setIsTyping(true);
      });

      socket.on('typing:stop', ({ userId }: { userId: string }) => {
        if (userId !== user?.id) setIsTyping(false);
      });

      socketRef.current = socket;
    };

    connectSocket();
    return () => {
      socketRef.current?.disconnect();
    };
  }, [roomId]);

  const sendMessage = () => {
    if (!input.trim()) return;
    if (!socketRef.current?.connected) {
      setSocketError('Chat is not connected. Please wait and try again.');
      return;
    }
    socketRef.current.emit('message:send', { chatRoomId: roomId, content: input.trim() });
    setInput('');
  };

  const openSafetyActions = () => {
    if (!targetUserId) return;
    Alert.alert('Conversation safety', `Choose an action for ${targetName || 'this member'}.`, [
      { text: 'Report', onPress: () => router.push({ pathname: `/safety/report/${targetUserId}`, params: { name: targetName } }) },
      { text: 'Block', style: 'destructive', onPress: () => Alert.alert('Block this member?', 'You will no longer be able to message, match again, or access sensitive profile interactions.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Block member', style: 'destructive', onPress: async () => { try { await safetyService.block(targetUserId); if (user) void trackFrontendEvent('user_blocked', user.id, { blockedUserId: targetUserId }); router.back(); } catch { setSocketError('We could not block this member. Please try again.'); } } },
      ]) },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isMine = item.senderId === user?.id;
    return (
      <View style={[styles.messageRow, isMine ? styles.myRow : styles.theirRow]}>
        <View style={[styles.bubble, isMine ? styles.myBubble : styles.theirBubble]}>
          <Text style={styles.messageText}>{item.content}</Text>
          <Text style={styles.messageTime}>
            {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={GRADIENTS.dark} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity accessibilityRole="button" accessibilityLabel="Go back" accessibilityHint="Returns to conversations" onPress={() => router.back()}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerName}>Chat</Text>
          <TouchableOpacity accessibilityRole="button" accessibilityLabel="Conversation safety actions" accessibilityHint="Opens report and block options" onPress={openSafetyActions} disabled={!targetUserId}>
            <Text style={{ fontSize: 20, color: COLORS.textPrimary }}>⋯</Text>
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
          keyboardVerticalOffset={0}
        >
          {socketError ? <Text style={styles.errorText}>{socketError}</Text> : null}
          {isError ? (
            <GlassCard style={styles.errorCard}>
              <Text style={styles.errorTitle}>Unable to load messages</Text>
              <Text style={styles.errorText}>{getErrorMessage(error, 'Please check your connection and try again.')}</Text>
              <NeonButton label="Retry" onPress={() => refetch()} loading={isFetching} variant="outline" style={{ marginTop: SPACING.md }} />
            </GlassCard>
          ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={renderMessage}
            contentContainerStyle={{ padding: SPACING.md }}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
            ListEmptyComponent={
              isLoading ? (
                <Text style={styles.emptyText}>Loading messages...</Text>
              ) : (
                <Text style={styles.emptyText}>No messages yet. Say hello ✨</Text>
              )
            }
            ListFooterComponent={
              isTyping ? (
                <View style={styles.typingIndicator}>
                  <Text style={styles.typingText}>typing...</Text>
                </View>
              ) : null
            }
          />
          )}

          <View style={styles.inputBar}>
            <TouchableOpacity style={styles.attachBtn}>
              <Text style={{ fontSize: 20 }}>📎</Text>
            </TouchableOpacity>
            <TextInput
              style={styles.input}
              value={input}
              onChangeText={setInput}
              accessibilityLabel="Message"
              accessibilityHint="Write a message to this member"
              placeholder="Write a message..."
              placeholderTextColor={COLORS.textTertiary}
              multiline
              maxLength={2000}
              onFocus={() => socketRef.current?.emit('typing:start', { chatRoomId: roomId })}
              onBlur={() => socketRef.current?.emit('typing:stop', { chatRoomId: roomId })}
            />
            <TouchableOpacity
              style={[styles.sendBtn, !input.trim() && { opacity: 0.4 }]}
              accessibilityRole="button"
              accessibilityLabel="Send message"
              accessibilityHint="Sends the typed message"
              onPress={sendMessage}
              disabled={!input.trim()}
            >
              <LinearGradient
                colors={GRADIENTS.gold}
                style={styles.sendGradient}
              >
                <Text style={styles.sendIcon}>➤</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.xl, paddingVertical: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.glassBorder },
  backText: { color: COLORS.textSecondary, fontSize: 20 },
  headerName: { ...TYPOGRAPHY.h4 },
  messageRow: { marginVertical: 4 },
  myRow: { alignItems: 'flex-end' },
  theirRow: { alignItems: 'flex-start' },
  bubble: { maxWidth: '75%', padding: SPACING.md, borderRadius: 18 },
  myBubble: { backgroundColor: COLORS.primaryViolet, borderBottomRightRadius: 4 },
  theirBubble: { backgroundColor: COLORS.surface, borderBottomLeftRadius: 4 },
  messageText: { color: COLORS.textPrimary, fontSize: 15, lineHeight: 22 },
  messageTime: { color: 'rgba(255,255,255,0.5)', fontSize: 11, marginTop: 4, textAlign: 'right' },
  typingIndicator: { padding: SPACING.sm },
  typingText: { color: COLORS.textTertiary, fontStyle: 'italic', fontSize: 13 },
  emptyText: { ...TYPOGRAPHY.bodySecondary, textAlign: 'center', marginTop: SPACING.xl },
  errorCard: { margin: SPACING.md },
  errorTitle: { ...TYPOGRAPHY.h4, color: COLORS.error, marginBottom: SPACING.sm },
  errorText: { color: COLORS.error, textAlign: 'center', marginHorizontal: SPACING.md, marginVertical: SPACING.sm },
  inputBar: { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderTopWidth: 1, borderTopColor: COLORS.glassBorder, gap: SPACING.sm },
  attachBtn: { paddingBottom: SPACING.xs },
  input: { flex: 1, backgroundColor: COLORS.surface, borderRadius: 20, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, color: COLORS.textPrimary, fontSize: 15, maxHeight: 100 },
  sendBtn: { width: 42, height: 42 },
  sendGradient: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  sendIcon: { color: '#fff', fontSize: 16 },
});
