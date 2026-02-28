/* eslint-disable no-console */
import { io, Socket } from 'socket.io-client';
import { Notification } from '@/lib/types/notifications';

// Connection state change listener type
type ConnectionStateListener = (connected: boolean) => void;

class SocketService {
  private socket: Socket | null = null;
  private isConnected = false;
  private connectionListeners: ConnectionStateListener[] = [];

  /**
   * Subscribe to connection state changes (for UI indicators)
   */
  onConnectionChange(listener: ConnectionStateListener): () => void {
    this.connectionListeners.push(listener);
    // Return unsubscribe function
    return () => {
      this.connectionListeners = this.connectionListeners.filter(
        l => l !== listener
      );
    };
  }

  private notifyConnectionChange(connected: boolean) {
    this.connectionListeners.forEach(listener => listener(connected));
  }

  connect(): Socket | null {
    if (this.socket && this.isConnected) {
      return this.socket;
    }

    try {
      const socketUrl =
        process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3005';

      this.socket = io(socketUrl + '/events', {
        withCredentials: true,
        transports: ['websocket', 'polling'],
        // Reconnection config — critical for production reliability
        reconnection: true,
        reconnectionAttempts: 15,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 30000,
        timeout: 20000,
      });

      this.socket.on('connect', () => {
        console.log('Socket connected:', this.socket?.id);
        this.isConnected = true;
        this.notifyConnectionChange(true);
      });

      this.socket.on('disconnect', reason => {
        console.log('Socket disconnected:', reason);
        this.isConnected = false;
        this.notifyConnectionChange(false);
      });

      this.socket.on('connect_error', error => {
        console.error('Socket connection error:', error.message);
        this.isConnected = false;
        this.notifyConnectionChange(false);
      });

      this.socket.io.on('reconnect', attempt => {
        console.log('Socket reconnected after', attempt, 'attempts');
      });

      this.socket.io.on('reconnect_failed', () => {
        console.error('Socket reconnection failed after all attempts');
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

  // Flagged replies events (Phase 4)
  subscribeToFlaggedReplies(
    callback: (data: {
      bot_id: string;
      flagged_count: number;
      reply_id: string;
    }) => void
  ): void {
    if (!this.socket) return;
    this.socket.on('flagged-reply:new', callback);
  }

  unsubscribeFromFlaggedReplies(
    callback: (data: {
      bot_id: string;
      flagged_count: number;
      reply_id: string;
    }) => void
  ): void {
    if (!this.socket) return;
    this.socket.off('flagged-reply:new', callback);
  }

  // Auto-infer events (Phase 5)
  subscribeToAutoInfer(
    callback: (data: {
      voice_dna_id: string;
      status: 'started' | 'complete' | 'failed';
      bot_id?: string;
    }) => void
  ): void {
    if (!this.socket) return;
    this.socket.on('voice-dna:auto-infer-started', data =>
      callback({ ...data, status: 'started' })
    );
    this.socket.on('voice-dna:auto-infer-complete', data =>
      callback({ ...data, status: 'complete' })
    );
    this.socket.on('voice-dna:auto-infer-failed', data =>
      callback({ ...data, status: 'failed' })
    );
  }

  unsubscribeFromAutoInfer(): void {
    if (!this.socket) return;
    this.socket.off('voice-dna:auto-infer-started');
    this.socket.off('voice-dna:auto-infer-complete');
    this.socket.off('voice-dna:auto-infer-failed');
  }

  // Refinement events (Phase 5)
  subscribeToRefinement(
    callback: (data: {
      voice_dna_id: string;
      status: 'triggered' | 'complete';
    }) => void
  ): void {
    if (!this.socket) return;
    this.socket.on('voice-dna:refinement-triggered', data =>
      callback({ ...data, status: 'triggered' })
    );
    this.socket.on('voice-dna:refinement-complete', data =>
      callback({ ...data, status: 'complete' })
    );
  }

  unsubscribeFromRefinement(): void {
    if (!this.socket) return;
    this.socket.off('voice-dna:refinement-triggered');
    this.socket.off('voice-dna:refinement-complete');
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
