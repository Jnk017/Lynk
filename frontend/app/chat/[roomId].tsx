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
import { EmptyState, LoadingState } from '../../src/components/premium';
import { NeonButton } from '../../src/components/ui/NeonButton';
import { useAuth } from '../../src/providers/AuthProvider';
import { ChatMessage } from '../../src/types/api';
import { getErrorMessage } from '../../src/utils/errors';

export default function ChatRoomScreen() {
  const { roomId } = useLocalSearchParams<{ roomId: string }>();
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
          <TouchableOpacity accessibilityRole="button" accessibilityLabel="Go back" onPress={() => router.back()}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerName}>Chat</Text>
          <TouchableOpacity accessibilityRole="button" accessibilityLabel="Conversation options">
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
            contentContainerStyle={styles.messageList}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
            ListEmptyComponent={
              isLoading ? (
                <View style={styles.stateInset}><LoadingState label="Loading messages" /></View>
              ) : (
                <View style={styles.stateInset}><EmptyState title="Start with a thoughtful hello" description="Ask about a value, goal, or interest you share." /></View>
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
            <TouchableOpacity accessibilityRole="button" accessibilityLabel="Attach media" style={styles.attachBtn}>
              <Text style={{ fontSize: 20 }}>📎</Text>
            </TouchableOpacity>
            <TextInput
              style={styles.input}
              value={input}
              onChangeText={setInput}
              placeholder="Write a message..."
              placeholderTextColor={COLORS.textTertiary}
              accessibilityLabel="Message"
              accessibilityHint="Write a message to this connection"
              multiline
              maxLength={2000}
              onFocus={() => socketRef.current?.emit('typing:start', { chatRoomId: roomId })}
              onBlur={() => socketRef.current?.emit('typing:stop', { chatRoomId: roomId })}
            />
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Send message"
              accessibilityState={{ disabled: !input.trim() }}
              style={[styles.sendBtn, !input.trim() && { opacity: 0.4 }]}
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
  messageList: { padding: SPACING.md, width: '100%', maxWidth: 760, alignSelf: 'center' },
  messageRow: { marginVertical: SPACING.xs },
  myRow: { alignItems: 'flex-end' },
  theirRow: { alignItems: 'flex-start' },
  bubble: { maxWidth: '75%', padding: SPACING.md, borderRadius: 18 },
  myBubble: { backgroundColor: COLORS.primaryViolet, borderBottomRightRadius: 4 },
  theirBubble: { backgroundColor: COLORS.surface, borderBottomLeftRadius: 4 },
  messageText: { color: COLORS.textPrimary, fontSize: 15, lineHeight: 22 },
  messageTime: { color: COLORS.textTertiary, fontSize: 11, marginTop: 4, textAlign: 'right' },
  typingIndicator: { padding: SPACING.sm },
  typingText: { color: COLORS.textTertiary, fontStyle: 'italic', fontSize: 13 },
  emptyText: { ...TYPOGRAPHY.bodySecondary, textAlign: 'center', marginTop: SPACING.xl },
  stateInset: { padding: SPACING.xl },
  errorCard: { margin: SPACING.md },
  errorTitle: { ...TYPOGRAPHY.h4, color: COLORS.error, marginBottom: SPACING.sm },
  errorText: { color: COLORS.error, textAlign: 'center', marginHorizontal: SPACING.md, marginVertical: SPACING.sm },
  inputBar: { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderTopWidth: 1, borderTopColor: COLORS.glassBorder, gap: SPACING.sm },
  attachBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  input: { flex: 1, backgroundColor: COLORS.surface, borderRadius: 20, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, color: COLORS.textPrimary, fontSize: 15, maxHeight: 100 },
  sendBtn: { width: 44, height: 44 },
  sendGradient: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  sendIcon: { color: COLORS.background, fontSize: 16 },
});
