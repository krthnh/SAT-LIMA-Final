import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

// Protege rutas: si no hay sesión, redirige a /login.
// Si se especifican roles, valida que el usuario tenga uno de ellos.
export default function ProtectedRoute({ children, roles }) {
  const { usuario } = useAuth();

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }
  if (roles && !roles.includes(usuario.rol)) {
    // Redirección según rol (igual que el login.js original)
    if (usuario.rol === 'cajero') return <Navigate to="/panel-cajero" replace />;
    if (usuario.rol === 'admin' || usuario.rol === 'empleado') return <Navigate to="/panel" replace />;
    return <Navigate to="/" replace />;
  }
  return children;
}
