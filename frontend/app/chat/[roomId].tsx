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
import { COLORS, TYPOGRAPHY, SPACING } from '../../src/constants/theme';
import { GlassCard } from '../../src/components/ui/GlassCard';
import { useAuth } from '../../src/providers/AuthProvider';

export default function ChatRoomScreen() {
  const { roomId } = useLocalSearchParams<{ roomId: string }>();
  const { user } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const flatListRef = useRef<FlatList>(null);

  const { data: initialMessages = [] } = useQuery({
    queryKey: ['messages', roomId],
    queryFn: () => api.get<any[]>(API_ENDPOINTS.chat.messages(roomId!)),
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

      socket.on('message:new', (msg: any) => {
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
    if (!input.trim() || !socketRef.current) return;
    socketRef.current.emit('message:send', { chatRoomId: roomId, content: input.trim() });
    setInput('');
  };

  const renderMessage = ({ item }: { item: any }) => {
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
      <LinearGradient colors={['#0A0A0A', '#0D0D1A']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerName}>Chat</Text>
          <TouchableOpacity>
            <Text style={{ fontSize: 20 }}>⋯</Text>
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
          keyboardVerticalOffset={0}
        >
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={renderMessage}
            contentContainerStyle={{ padding: SPACING.md }}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
            ListFooterComponent={
              isTyping ? (
                <View style={styles.typingIndicator}>
                  <Text style={styles.typingText}>typing...</Text>
                </View>
              ) : null
            }
          />

          <View style={styles.inputBar}>
            <TouchableOpacity style={styles.attachBtn}>
              <Text style={{ fontSize: 20 }}>📎</Text>
            </TouchableOpacity>
            <TextInput
              style={styles.input}
              value={input}
              onChangeText={setInput}
              placeholder="Write a message..."
              placeholderTextColor={COLORS.textTertiary}
              multiline
              maxLength={2000}
              onFocus={() => socketRef.current?.emit('typing:start', { chatRoomId: roomId })}
              onBlur={() => socketRef.current?.emit('typing:stop', { chatRoomId: roomId })}
            />
            <TouchableOpacity
              style={[styles.sendBtn, !input.trim() && { opacity: 0.4 }]}
              onPress={sendMessage}
              disabled={!input.trim()}
            >
              <LinearGradient
                colors={[COLORS.primaryViolet, COLORS.electricBlue]}
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
  inputBar: { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderTopWidth: 1, borderTopColor: COLORS.glassBorder, gap: SPACING.sm },
  attachBtn: { paddingBottom: SPACING.xs },
  input: { flex: 1, backgroundColor: COLORS.surface, borderRadius: 20, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, color: COLORS.textPrimary, fontSize: 15, maxHeight: 100 },
  sendBtn: { width: 42, height: 42 },
  sendGradient: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  sendIcon: { color: '#fff', fontSize: 16 },
});
