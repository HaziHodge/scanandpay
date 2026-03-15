import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuthStore } from '../store/authStore';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

export const useSocket = () => {
  const [socket, setSocket] = useState(null);
  const { venue } = useAuthStore();

  useEffect(() => {
    if (!venue) return;

    const newSocket = io(SOCKET_URL);

    newSocket.on('connect', () => {
      newSocket.emit('join_venue', venue.id);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [venue]);

  return socket;
};
