import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const { login, registro } = useAuth();
  const navigate = useNavigate();

  const [tab, setTab] = useState('login');
  const [msg, setMsg] = useState({ text: '', type: '' });

  // login
  const [loginData, setLoginData] = useState({ correo: '', contrasena: '' });
  // registro
  const [regData, setRegData] = useState({ nombre: '', correo: '', contrasena: '', rol: 'cliente' });

  const mostrar = (text, type) => setMsg({ text, type });

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const usuario = await login(loginData.correo.trim(), loginData.contrasena.trim());
      if (usuario) {
        mostrar(`¡Bienvenido ${usuario.nombre}! Cargando...`, 'success');
        setTimeout(() => {
          if (usuario.rol === 'cajero') navigate('/panel-cajero');
          else if (usuario.rol === 'admin' || usuario.rol === 'empleado') navigate('/panel');
          else navigate('/');
        }, 1000);
      } else {
        mostrar('Correo o contraseña incorrectos', 'error');
      }
    } catch (err) {
      mostrar('Error: ' + err.message, 'error');
    }
  };

  const handleRegistro = async (e) => {
    e.preventDefault();
    try {
      const res = await registro(regData);
      if (res.ok) {
        mostrar('Cuenta creada con éxito. Ya puedes iniciar sesión.', 'success');
        setRegData({ nombre: '', correo: '', contrasena: '', rol: 'cliente' });
        setTimeout(() => setTab('login'), 1500);
      } else {
        mostrar('Error al registrar: ' + (res.error || 'desconocido'), 'error');
      }
    } catch (err) {
      mostrar('Error al registrar: ' + err.message, 'error');
    }
  };

  return (
    <section className="section-container form-wrapper" style={{ maxWidth: 450, margin: '3rem auto' }}>
      <div className="auth-tabs">
        <button type="button" className={`auth-tab ${tab === 'login' ? 'active' : ''}`} onClick={() => { setTab('login'); setMsg({ text: '', type: '' }); }}>Iniciar Sesión</button>
        <button type="button" className={`auth-tab ${tab === 'register' ? 'active' : ''}`} onClick={() => { setTab('register'); setMsg({ text: '', type: '' }); }}>Crear Cuenta</button>
      </div>

      {tab === 'login' && (
        <form id="form-login" className="sat-form" onSubmit={handleLogin}>
          <h2>Iniciar Sesión</h2>
          <div className="form-group">
            <label htmlFor="login-correo">Correo Electrónico *</label>
            <input type="email" id="login-correo" required placeholder="correo@ejemplo.com"
              value={loginData.correo} onChange={e => setLoginData({ ...loginData, correo: e.target.value })} />
          </div>
          <div className="form-group">
            <label htmlFor="login-password">Contraseña *</label>
            <input type="password" id="login-password" required placeholder="••••••••"
              value={loginData.contrasena} onChange={e => setLoginData({ ...loginData, contrasena: e.target.value })} />
          </div>
          <button type="submit" className="btn btn-submit animated-btn"><span>Ingresar</span></button>
        </form>
      )}

      {tab === 'register' && (
        <form id="form-register" className="sat-form" onSubmit={handleRegistro}>
          <h2>Crear Cuenta</h2>
          <div className="form-group">
            <label htmlFor="reg-nombre">Nombre Completo *</label>
            <input type="text" id="reg-nombre" required placeholder="Juan Pérez"
              value={regData.nombre} onChange={e => setRegData({ ...regData, nombre: e.target.value })} />
          </div>
          <div className="form-group">
            <label htmlFor="reg-correo">Correo Electrónico *</label>
            <input type="email" id="reg-correo" required placeholder="correo@ejemplo.com"
              value={regData.correo} onChange={e => setRegData({ ...regData, correo: e.target.value })} />
          </div>
          <div className="form-group">
            <label htmlFor="reg-password">Contraseña *</label>
            <input type="password" id="reg-password" required placeholder="••••••••"
              value={regData.contrasena} onChange={e => setRegData({ ...regData, contrasena: e.target.value })} />
          </div>
          {/* CORRECCIÓN: el select de rol ahora está DENTRO del formulario
              (en el original estaba fuera, por lo que nunca se enviaba). */}
          <div className="form-group">
            <label htmlFor="reg-rol">Tipo de Usuario *</label>
            <select id="reg-rol" required
              value={regData.rol} onChange={e => setRegData({ ...regData, rol: e.target.value })}>
              <option value="cliente">Propietario / Cliente</option>
              <option value="empleado">Empleado</option>
              <option value="admin">Administrador</option>
            </select>
          </div>
          <button type="submit" className="btn btn-submit animated-btn"><span>Registrarse</span></button>
        </form>
      )}

      {msg.text && (
        <div className={`mock-alert-message ${msg.type === 'error' ? 'alert-error' : 'alert-success'}`}
          style={{ backgroundColor: msg.type === 'success' ? '#d4edda' : '#f8d7da', color: msg.type === 'success' ? '#155724' : '#721c24' }}>
          {msg.text}
        </div>
      )}
    </section>
  );
}
