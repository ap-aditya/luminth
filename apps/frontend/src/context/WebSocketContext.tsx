'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  useCallback,
  ReactNode,
} from 'react';
import { useAuth } from '@/hooks/useFirebaseAuth';
import { UserMessage } from '@/types';

type WebSocketState = {
  lastMessage: UserMessage | null;
  readyState: number;
};

const WebSocketContext = createContext<WebSocketState>({
  lastMessage: null,
  readyState: 3,
});

export const useWebSocket = () => useContext(WebSocketContext);

const MAX_RECONNECT_DELAY = 30000;

export const WebSocketProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [lastMessage, setLastMessage] = useState<UserMessage | null>(null);
  const [readyState, setReadyState] = useState<number>(3);
  const ws = useRef<WebSocket | null>(null);
  const reconnectTimeoutId = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);

  const connect = useCallback(() => {
    if (!user || !process.env.NEXT_PUBLIC_WEBSOCKET_URL) {
      return;
    }

    if (ws.current && ws.current.readyState < 2) {
      return;
    }

    if (reconnectTimeoutId.current) {
      clearTimeout(reconnectTimeoutId.current);
    }

    const socketUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL;
    ws.current = new WebSocket(socketUrl);
    setReadyState(ws.current.readyState);

    ws.current.onopen = async () => {
      console.log('WebSocket Connected');
      setReadyState(ws.current!.readyState);
      reconnectAttempts.current = 0;

      try {
        const token = await user.getIdToken(true);
        ws.current?.send(JSON.stringify({ type: 'auth', token: token }));
      } catch (error) {
        console.error('Failed to get auth token for WebSocket', error);
        ws.current?.close();
      }
    };

    ws.current.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data) as UserMessage;
        setLastMessage(message);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    ws.current.onerror = (error) => {
      console.error('WebSocket Error:', error);
    };

    ws.current.onclose = () => {
      console.log('WebSocket Disconnected');
      if (ws.current) {
        setReadyState(ws.current.readyState);
      }

      if (user) {
        const delay = Math.min(
          MAX_RECONNECT_DELAY,
          Math.pow(2, reconnectAttempts.current) * 2000,
        );
        console.log(`Attempting to reconnect in ${delay / 1000}s...`);
        reconnectTimeoutId.current = setTimeout(connect, delay);
        reconnectAttempts.current++;
      }
    };
  }, [user]);

  useEffect(() => {
    if (user) {
      connect();
    } else {
      if (reconnectTimeoutId.current) {
        clearTimeout(reconnectTimeoutId.current);
      }
      if (ws.current) {
        ws.current.close();
        ws.current = null;
      }
    }

    return () => {
      if (reconnectTimeoutId.current) {
        clearTimeout(reconnectTimeoutId.current);
      }
      if (ws.current) {
        ws.current.onopen = null;
        ws.current.onmessage = null;
        ws.current.onerror = null;
        ws.current.onclose = null;
        ws.current.close();
        ws.current = null;
      }
    };
  }, [user, connect]);

  const contextValue = { lastMessage, readyState };

  return (
    <WebSocketContext.Provider value={contextValue}>
      {children}
    </WebSocketContext.Provider>
  );
};
