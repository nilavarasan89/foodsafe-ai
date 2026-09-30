import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('foodsafe_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// WebSocket helper
export const createWebSocketConnection = (onMessage: (data: any) => void) => {
  const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws';
  const socket = new WebSocket(wsUrl);

  socket.onopen = () => {
    console.log('FOODSAFE AI WebSocket Connected');
  };

  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      onMessage(data);
    } catch (e) {
      console.error('Failed to parse WebSocket message', e);
    }
  };

  socket.onerror = (error) => {
    console.error('WebSocket Error:', error);
  };

  return socket;
};
