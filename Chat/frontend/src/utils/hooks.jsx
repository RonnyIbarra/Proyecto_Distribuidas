import React from 'react';

// Hook para manejar peticiones API
export const useApi = () => {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

  const request = React.useCallback(async (fn) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fn();
      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, request };
};

// Hook para manejar conexión WebSocket
export const useWebSocket = (url) => {
  const [connected, setConnected] = React.useState(false);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setConnected(true);
    }, 500);

    return () => clearTimeout(timer);
  }, [url]);

  return { connected, error };
};

// Formatear fecha y hora
export const formatTime = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Formatear tamaño de archivo
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
