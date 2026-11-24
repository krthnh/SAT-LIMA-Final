// ============================================================
// src/context/AuthContext.jsx
// Estado de sesión del usuario. Persiste en sessionStorage (igual
// que el proyecto original) y expone helpers para login/logout.
// ============================================================
import { createContext, useContext, useState, useCallback } from 'react';
import { api } from '../utils/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem('usuario') || 'null');
    } catch (_) {
      return null;
    }
  });

  const login = useCallback(async (correo, contrasena) => {
    const res = await api.login({ correo, contrasena });
    if (res?.ok) {
      sessionStorage.setItem('usuario', JSON.stringify(res.usuario));
      setUsuario(res.usuario);
      return res.usuario;
    }
    return null;
  }, []);

  const registro = useCallback(async (payload) => {
    return await api.registro(payload);
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem('usuario');
    setUsuario(null);
  }, []);

  const esAdmin = usuario?.rol === 'admin';
  const esEmpleado = usuario?.rol === 'empleado';
  const esCajero = usuario?.rol === 'cajero';
  const puedeVerPanel = esAdmin || esEmpleado;

  return (
    <AuthContext.Provider value={{
      usuario, login, registro, logout,
      esAdmin, esEmpleado, esCajero, puedeVerPanel
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}
