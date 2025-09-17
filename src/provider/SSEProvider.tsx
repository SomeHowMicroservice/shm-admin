/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { createSseConnection } from "@/api/sseClient";

type SseContextType = {
  messages: any[];
  isConnected: boolean;
  error: string | null;
  reconnect: () => void;
  clearMessages: () => void;
};

const SseContext = createContext<SseContextType | undefined>(undefined);

export const useSse = () => {
  const context = useContext(SseContext);
  if (!context) {
    throw new Error("useSse must be used within a SseProvider");
  }
  return context;
};

export function SseProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sse, setSse] = useState<EventSource | null>(null);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  const connectSse = useCallback(() => {
    try {
      if (sse) {
        sse.close();
      }

      setError(null);
      setIsConnected(false);

      const newSse = createSseConnection("/sse", (data) => {
        setMessages((prev) => [...prev, data]);
      });

      if (newSse.addEventListener) {
        newSse.addEventListener("open", () => {
          console.log("SSE connection opened");
          setIsConnected(true);
          setError(null);
        });

        newSse.addEventListener("error", (event) => {
          console.error("SSE connection error:", event);
          setIsConnected(false);
          setError("Connection failed. Attempting to reconnect...");
        });
      }

      setSse(newSse);
    } catch (err) {
      console.error("Failed to create SSE connection:", err);
      setError("Failed to establish connection");
      setIsConnected(false);
    }
  }, [sse]);

  const reconnect = useCallback(() => {
    connectSse();
  }, [connectSse]);

  useEffect(() => {
    connectSse();

    return () => {
      if (sse) {
        console.log("Closing SSE connection");
        sse.close();
      }
    };
  }, []);

  useEffect(() => {
    return () => {
      if (sse) {
        sse.close();
      }
    };
  }, [sse]);

  const contextValue: SseContextType = {
    messages,
    isConnected,
    error,
    reconnect,
    clearMessages,
  };

  return (
    <SseContext.Provider value={contextValue}>{children}</SseContext.Provider>
  );
}
