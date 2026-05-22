import { io, Socket } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

class SocketService {
  private socket: Socket | null = null;
  private token: string | null = null;

  // Initialize socket connection
  connect(token: string) {
    if (this.socket?.connected) {
      console.log("Socket already connected");
      return;
    }

    this.token = token;

    this.socket = io(SOCKET_URL, {
      auth: {
        token,
      },
      transports: ["websocket", "polling"],
    });

    this.socket.on("connect", () => {
      console.log("✅ Socket connected:", this.socket?.id);
    });

    this.socket.on("disconnect", (reason) => {
      console.log("❌ Socket disconnected:", reason);
    });

    this.socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error.message);
    });
  }

  // Disconnect socket
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.token = null;
      console.log("Socket disconnected manually");
    }
  }

  // Listen to events
  on(event: string, callback: (data: any) => void) {
    if (!this.socket) {
      console.error("Socket not initialized");
      return;
    }
    this.socket.on(event, callback);
  }

  // Remove event listener
  off(event: string, callback?: (data: any) => void) {
    if (!this.socket) {
      console.error("Socket not initialized");
      return;
    }
    if (callback) {
      this.socket.off(event, callback);
    } else {
      this.socket.off(event);
    }
  }

  // Emit events
  emit(event: string, data?: any) {
    if (!this.socket) {
      console.error("Socket not initialized");
      return;
    }
    this.socket.emit(event, data);
  }

  // Check if connected
  isConnected() {
    return this.socket?.connected || false;
  }

  // Get socket instance
  getSocket() {
    return this.socket;
  }
}

// Export singleton instance
export const socketService = new SocketService();
