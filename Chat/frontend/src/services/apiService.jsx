import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class ApiService {
  constructor() {
    this.token = localStorage.getItem('authToken');
  }

  setToken(token) {
    this.token = token;
    localStorage.setItem('authToken', token);
  }

  getHeaders(json = true) {
    if (!this.token) return json ? { 'Content-Type': 'application/json' } : {};
    
    return json
      ? {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`
        }
      : {
          'Authorization': `Bearer ${this.token}`
        };
  }

  async login(username, password) {
    try {
      const response = await axios.post(`${API_URL}/login`, { username, password });
      this.setToken(response.data.token);
      return response.data;
    } catch (error) {
      throw error.response?.data?.error || 'Error en login';
    }
  }

  async uploadFile(roomId, file, nickname, onProgress) {
    try {
      const form = new FormData();
      form.append('file', file);
      if (nickname) form.append('nickname', nickname);

      console.log('Enviando archivo:', file.name, 'tipo:', file.type, 'tamaño:', file.size);

      const response = await axios.post(
        `${API_URL}/rooms/${roomId}/upload`,
        form,
        {
          headers: this.getHeaders(false),   // SOLO el token, NADA de content-type
          onUploadProgress: (progressEvent) => {
            if (onProgress) {
              const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              console.log(`Progreso: ${percent}%`);
              onProgress(percent);
            }
          }
        }
      );

      console.log('Archivo subido exitosamente:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error en uploadFile:', error);
      throw error.response?.data?.error || error.message || 'Error subiendo archivo';
    }
  }

  async createRoom(name, type, pin) {
    try {
      const response = await axios.post(
        `${API_URL}/rooms`,
        { name, type, pin },
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data?.error || 'Error creando sala';
    }
  }

  async getRooms() {
    try {
      const response = await axios.get(`${API_URL}/rooms`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.error || 'Error obteniendo salas';
    }
  }

  async getRoomStats(roomId) {
    try {
      const response = await axios.get(`${API_URL}/rooms/${roomId}/stats`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.error || 'Error obteniendo estadísticas';
    }
  }

  async deleteRoom(roomId) {
    try {
      const response = await axios.delete(
        `${API_URL}/rooms/${roomId}`,
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data?.error || 'Error eliminando sala';
    }
  }

  logout() {
    this.token = null;
    localStorage.removeItem('authToken');
  }
}

export default new ApiService();
