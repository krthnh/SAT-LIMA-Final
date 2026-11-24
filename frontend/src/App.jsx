import { Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';

import Inicio from './pages/Inicio.jsx';
import Login from './pages/Login.jsx';
import ImpuestoPredial from './pages/ImpuestoPredial.jsx';
import ImpuestoVehicular from './pages/ImpuestoVehicular.jsx';
import Papeletas from './pages/Papeletas.jsx';
import Panel from './pages/Panel.jsx';
import PanelCajero from './pages/PanelCajero.jsx';
import Pasarela from './pages/Pasarela.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

function Header() {
  const { usuario, logout, puedeVerPanel } = useAuth();
  const navigate = useNavigate();

  const cerrarSesion = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="main-header">
      <div className="header-container">
        <div className="brand">
          <div className="img-container logo-container">
            <img src="/img/SAT_logo.jpg" alt="Logo SAT Perú" className="adaptive-img" />
          </div>
          <div>
            <h1>SAT <span>Perú</span></h1>
            <p className="tagline">Servicio de Administración Tributaria de Lima</p>
          </div>
        </div>
        <nav className="main-nav">
          <ul>
            <li><NavLink to="/">Inicio</NavLink></li>
            <li><NavLink to="/#servicios">Trámites y Servicios</NavLink></li>
            <li><NavLink to="/#consultas">Consultas de Deuda</NavLink></li>
            <li><NavLink to="/#contacto">Ubicación y Contacto</NavLink></li>
            {usuario
              ? <li><NavLink to="/login" onClick={cerrarSesion} style={{ color: '#ffc107', fontWeight: 'bold' }}>
                  Cerrar Sesión
                </NavLink></li>
              : <li><NavLink to="/login" style={{ color: '#ffc107', fontWeight: 'bold' }}>Iniciar Sesión</NavLink></li>}
            {puedeVerPanel && <li><NavLink to="/panel" style={{ color: '#ffc107', fontWeight: 'bold' }}>Panel de Gestión</NavLink></li>}
          </ul>
          {usuario && (
            <div id="user-info">
              Bienvenido, <strong>{usuario.nombre}</strong>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="main-footer">
      <div className="footer-container">
        <p>&copy; Servicio de Administración Tributaria de Lima - SAT Perú.</p>
        <p>Sitio web oficial: <a href="https://www.sat.gob.pe/" target="_blank" rel="noopener noreferrer">https://www.sat.gob.pe/</a></p>
      </div>
    </footer>
  );
}

export default function App() {
  return (
    <>
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/login" element={<Login />} />
          <Route path="/impuesto-predial" element={<ImpuestoPredial />} />
          <Route path="/impuesto-vehicular" element={<ImpuestoVehicular />} />
          <Route path="/papeletas" element={<Papeletas />} />
          <Route path="/pasarela/:id" element={
            <ProtectedRoute><Pasarela /></ProtectedRoute>
          } />
          <Route path="/panel" element={
            <ProtectedRoute roles={['admin', 'empleado']}><Panel /></ProtectedRoute>
          } />
          <Route path="/panel-cajero" element={
            <ProtectedRoute roles={['admin', 'cajero']}><PanelCajero /></ProtectedRoute>
          } />
        </Routes>
      </main>
      <Footer />
    </>
  );
}
