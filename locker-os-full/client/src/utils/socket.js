import { useEffect, useRef } from "react";
import { io } from "socket.io-client";

// Relative URL → tự kết nối đúng host dù dev hay production
export const useSocket = (handlers = {}) => {
  const ref = useRef(null);
  useEffect(() => {
    const socket = io({ transports: ["websocket"] });
    ref.current = socket;
    socket.on("connect",    () => console.log("🔌 Socket connected"));
    socket.on("disconnect", () => console.log("🔌 Socket disconnected"));
    if (handlers.locker_updated) socket.on("locker_updated", handlers.locker_updated);
    if (handlers.pickup_done)    socket.on("pickup_done",    handlers.pickup_done);
    if (handlers.rfid_scanned)   socket.on("rfid_scanned",   handlers.rfid_scanned);
    return () => socket.disconnect();
  }, []);
  return ref;
};
