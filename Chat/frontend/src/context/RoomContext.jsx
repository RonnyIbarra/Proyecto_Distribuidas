import React, { createContext, useState, useContext } from 'react';
import apiService from '../services/apiService';

const RoomContext = createContext();

export const RoomProvider = ({ children }) => {
  const [rooms, setRooms] = useState([]);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRooms = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.getRooms();
      setRooms(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const createRoom = async (name, type, pin) => {
    setLoading(true);
    setError(null);
    try {
      const room = await apiService.createRoom(name, type, pin);
      setRooms([...rooms, room]);
      return room;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteRoom = async (roomId) => {
    setError(null);
    try {
      await apiService.deleteRoom(roomId);
      setRooms(rooms.filter(r => r.id !== roomId));
    } catch (err) {
      setError(err);
      throw err;
    }
  };

  const getRoomStats = async (roomId) => {
    try {
      const stats = await apiService.getRoomStats(roomId);
      return stats;
    } catch (err) {
      setError(err);
      throw err;
    }
  };

  return (
    <RoomContext.Provider
      value={{
        rooms,
        currentRoom,
        setCurrentRoom,
        loading,
        error,
        fetchRooms,
        createRoom,
        deleteRoom,
        getRoomStats
      }}
    >
      {children}
    </RoomContext.Provider>
  );
};

export const useRoom = () => {
  const context = useContext(RoomContext);
  if (!context) {
    throw new Error('useRoom debe usarse dentro de RoomProvider');
  }
  return context;
};
