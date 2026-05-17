import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { ChatService } from './chat.service';
import { MessageType } from '../../common/enums';

interface AuthenticatedSocket extends Socket {
  userId?: string;
}

@WebSocketGateway({
  cors: { origin: '*', credentials: true },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedUsers = new Map<string, string>(); // userId -> socketId

  constructor(
    private chatService: ChatService,
    private jwtService: JwtService,
    private configService: ConfigService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      const token = client.handshake.auth?.token || client.handshake.headers?.authorization?.replace('Bearer ', '');
      if (!token) throw new WsException('No auth token provided');

      const payload = this.jwtService.verify(token, {
        secret: this.configService.get<string>('jwt.accessSecret'),
      });

      const user = await this.userRepository.findOne({ where: { id: payload.sub } });
      if (!user) throw new WsException('User not found');

      client.userId = user.id;
      this.connectedUsers.set(user.id, client.id);

      await this.userRepository.update(user.id, { isOnline: true });

      // Auto-join all user's chat rooms
      const rooms = await this.chatService.getUserRooms(user.id);
      for (const room of rooms) {
        client.join(`room:${room.id}`);
      }

      this.server.emit('user:online', { userId: user.id });
    } catch {
      client.disconnect();
    }
  }

  async handleDisconnect(client: AuthenticatedSocket) {
    if (client.userId) {
      this.connectedUsers.delete(client.userId);
      await this.userRepository.update(client.userId, {
        isOnline: false,
        lastSeen: new Date(),
      });
      this.server.emit('user:offline', { userId: client.userId, lastSeen: new Date() });
    }
  }

  @SubscribeMessage('message:send')
  async handleMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { chatRoomId: string; content: string; type?: MessageType },
  ) {
    if (!client.userId) throw new WsException('Not authenticated');

    const message = await this.chatService.sendMessage(
      client.userId,
      data.chatRoomId,
      data.content,
      data.type || MessageType.TEXT,
    );

    this.server.to(`room:${data.chatRoomId}`).emit('message:new', message);
    return message;
  }

  @SubscribeMessage('message:read')
  async handleRead(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { chatRoomId: string },
  ) {
    if (!client.userId) return;
    await this.chatService.markRead(client.userId, data.chatRoomId);
    this.server.to(`room:${data.chatRoomId}`).emit('message:read', {
      chatRoomId: data.chatRoomId,
      userId: client.userId,
    });
  }

  @SubscribeMessage('typing:start')
  handleTypingStart(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { chatRoomId: string },
  ) {
    client.to(`room:${data.chatRoomId}`).emit('typing:start', { userId: client.userId });
  }

  @SubscribeMessage('typing:stop')
  handleTypingStop(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { chatRoomId: string },
  ) {
    client.to(`room:${data.chatRoomId}`).emit('typing:stop', { userId: client.userId });
  }

  /** Emit a message to a specific user if they're connected */
  emitToUser(userId: string, event: string, data: unknown) {
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      this.server.to(socketId).emit(event, data);
    }
  }
}
