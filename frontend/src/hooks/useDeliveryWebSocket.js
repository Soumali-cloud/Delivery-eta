import { useEffect, useRef } from "react";

import { WS_URL } from "../config";

const RECONNECT_DELAY_MS = 3000;

function useDeliveryWebSocket(onMessage) {
  const messageHandlerRef = useRef(onMessage);
  const socketRef = useRef(null);
  const reconnectTimerRef = useRef(null);

  useEffect(() => {
    messageHandlerRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    let isUnmounted = false;

    const connect = () => {
      if (
        isUnmounted ||
        socketRef.current?.readyState === WebSocket.OPEN ||
        socketRef.current?.readyState === WebSocket.CONNECTING
      ) {
        return;
      }

      const socket = new WebSocket(`${WS_URL}/ws/deliveries`);
      socketRef.current = socket;

      socket.onopen = () => {
        console.log("Connected to delivery WebSocket");
      };

      socket.onmessage = (event) => {
        messageHandlerRef.current(event);
      };

      socket.onerror = (error) => {
        console.error("WebSocket error:", error);
        socket.close();
      };

      socket.onclose = () => {
        if (socketRef.current === socket) {
          socketRef.current = null;
        }

        console.log("Delivery WebSocket disconnected");

        if (!isUnmounted && reconnectTimerRef.current === null) {
          reconnectTimerRef.current = setTimeout(() => {
            reconnectTimerRef.current = null;
            connect();
          }, RECONNECT_DELAY_MS);
        }
      };
    };

    connect();

    return () => {
      isUnmounted = true;

      if (reconnectTimerRef.current !== null) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }

      const socket = socketRef.current;
      socketRef.current = null;

      if (socket) {
        socket.onclose = null;
        socket.close();
      }
    };
  }, []);
}

export default useDeliveryWebSocket;