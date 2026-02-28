/* eslint-disable no-console */
import { io, Socket } from 'socket.io-client';
import { Notification } from '@/lib/types/notifications';

class SocketService {
  private socket: Socket | null = null;
  private isConnected = false;

  connect(): Socket | null {
    if (this.socket && this.isConnected) {
      return this.socket;
    }

    try {
      // Use environment variable or default to development URL
      const socketUrl =
        process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3005';

      this.socket = io(socketUrl + '/events', {
        withCredentials: true, // Use cookies for authentication
        transports: ['websocket', 'polling'],
      });

      this.socket.on('connect', () => {
        console.log('Socket connected:', this.socket?.id);
        this.isConnected = true;
      });

      this.socket.on('disconnect', () => {
        console.log('Socket disconnected');
        this.isConnected = false;
      });

      this.socket.on('connect_error', error => {
        console.error('Socket connection error:', error);
        this.isConnected = false;
      });

      return this.socket;
    } catch (error) {
      console.error('Failed to initialize socket:', error);
      return null;
    }
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  isSocketConnected(): boolean {
    return this.isConnected;
  }

  // Notification specific methods
  subscribeToNotifications(
    callback: (notification: Notification) => void
  ): void {
    if (!this.socket) {
      return;
    }

    this.socket.on('notification', callback);
  }

  unsubscribeFromNotifications(
    callback: (notification: Notification) => void
  ): void {
    if (!this.socket) {
      return;
    }

    this.socket.off('notification', callback);
  }

  // Voice DNA specific methods
  subscribeToVoiceDnaStatus(
    callback: (data: {
      voice_dna_id: string;
      status: string;
      brand_voice_id?: string;
    }) => void
  ): void {
    if (!this.socket) return;
    this.socket.on('voice-dna:status-changed', callback);
  }

  unsubscribeFromVoiceDnaStatus(
    callback: (data: {
      voice_dna_id: string;
      status: string;
      brand_voice_id?: string;
    }) => void
  ): void {
    if (!this.socket) return;
    this.socket.off('voice-dna:status-changed', callback);
  }

  // Join user-specific rooms
  joinUserRoom(userId: string): void {
    if (!this.socket) {
      console.warn('Socket not initialized');
      return;
    }

    this.socket.emit('join:user', { userId });
  }

  leaveUserRoom(userId: string): void {
    if (!this.socket) {
      return;
    }

    this.socket.emit('leave:user', { userId });
  }
}

export const socketService = new SocketService();
